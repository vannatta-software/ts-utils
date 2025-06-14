import { Entity } from '@vannatta-software/ts-utils-domain';
import { Neo4jSchema } from './neo4j.schema';
import { Mediator } from '../../mediator.service'; // Corrected path
import { ILogger } from '../../common/logger'; // Use ILogger
import { Driver, Session, auth, driver } from 'neo4j-driver'; // Re-add neo4j-driver imports

export class Neo4jRepository<T extends Entity> {
    protected readonly logger: ILogger;
    private driver: Driver; // Use concrete Driver
    private hydrate: (record: any) => T = () => {
        return {} as T;
    };

    constructor(
        private readonly mediator: Mediator,
        private readonly entityClass: new (...args: any[]) => T,
        logger: ILogger // Inject ILogger
    ) {
        this.logger = logger;
        this.driver = driver( // Direct instantiation
            process.env.NEO4J_URI || 'bolt://localhost:7687',
            auth.basic(
                process.env.NEO4J_USERNAME || 'neo4j',
                process.env.NEO4J_PASSWORD || 'password'
            )
        );
    }

    public onHydrate(hydrate: (record: any) => T) {
        this.hydrate = hydrate;
    }

    private async getSession(): Promise<Session> { // Use concrete Session
        return this.driver.session();
    }

    // The methods below are specific to Neo4j and will be directly exposed by DatabaseContext
    // No longer implementing a generic IGraphRepository interface.

    async createNode(entity: T, labels?: string[]): Promise<void> {
        const session = await this.getSession();
        try {
            const nodeLabels = labels && labels.length > 0 ? labels.map(l => `\`${l}\``).join(':') : this.entityClass.name;
            const properties = Neo4jSchema.extractProperties(entity);
            const query = `CREATE (n:${nodeLabels} $properties) RETURN n`;
            await session.run(query, { properties });
            entity.create();
            this.mediator.publishEvents(entity);
        } finally {
            await session.close();
        }
    }

    async updateNode(entity: T): Promise<void> {
        const session = await this.getSession();
        try {
            const properties = Neo4jSchema.extractProperties(entity);
            const query = `MATCH (n {id: $id}) SET n = $properties RETURN n`;
            await session.run(query, { id: entity.id.value, properties });
            this.mediator.publishEvents(entity);
        } finally {
            await session.close();
        }
    }

    async deleteNode(id: string): Promise<void> {
        const session = await this.getSession();
        try {
            const query = `MATCH (n {id: $id}) DETACH DELETE n`;
            await session.run(query, { id });
        } finally {
            await session.close();
        }
    }

    async findNodeById(id: string): Promise<T | null> {
        const session = await this.getSession();
        try {
            const query = `MATCH (n {id: $id}) RETURN n`;
            const result = await session.run(query, { id });
            if (result.records.length > 0) { // Original check
                return this.hydrate(result.records[0].get('n').properties);
            }
            return null;
        } finally {
            await session.close();
        }
    }

    async findNodes(queryObject: Record<string, any>, labels?: string[]): Promise<T[]> {
        const session = await this.getSession();
        try {
            const nodeLabels = labels && labels.length > 0 ? labels.map(l => `\`${l}\``).join(':') : this.entityClass.name;
            const matchClause = labels && labels.length > 0 ? `MATCH (n:${nodeLabels})` : `MATCH (n)`;
            
            let whereClause = '';
            const params: Record<string, any> = {};
            if (Object.keys(queryObject).length > 0) {
                whereClause = 'WHERE ' + Object.keys(queryObject).map(key => {
                    params[key] = queryObject[key];
                    return `n.${key} = $${key}`;
                }).join(' AND ');
            }

            const query = `${matchClause} ${whereClause} RETURN n`;
            const result = await session.run(query, params);
            return result.records.map(record => this.hydrate(record.get('n').properties)); // Original mapping
        } finally {
            await session.close();
        }
    }

    async createRelationship(fromId: string, toId: string, type: string, properties?: Record<string, any>): Promise<void> {
        const session = await this.getSession();
        try {
            const query = `
                MATCH (a {id: $fromId}), (b {id: $toId})
                CREATE (a)-[r:\`${type}\` $properties]->(b)
                RETURN r
            `;
            await session.run(query, { fromId, toId, type, properties: properties || {} });
        } finally {
            await session.close();
        }
    }

    async deleteRelationship(fromId: string, toId: string, type: string): Promise<void> {
        const session = await this.getSession();
        try {
            const query = `
                MATCH (a {id: $fromId})-[r:\`${type}\`]->(b {id: $toId})
                DELETE r
            `;
            await session.run(query, { fromId, toId, type });
        } finally {
            await session.close();
        }
    }

    async traverse(startNodeId: string, relationshipType: string, direction: 'in' | 'out' | 'both', depth?: number): Promise<T[]> {
        const session = await this.getSession();
        try {
            let relationshipPattern: string;
            switch (direction) {
                case 'in':
                    relationshipPattern = `<-[r:\`${relationshipType}\`]-`;
                    break;
                case 'out':
                    relationshipPattern = `-[r:\`${relationshipType}\`]->`;
                    break;
                case 'both':
                    relationshipPattern = `-[r:\`${relationshipType}\`]-`;
                    break;
            }

            const depthClause = depth ? `*1..${depth}` : '';
            const query = `
                MATCH (startNode {id: $startNodeId})${relationshipPattern}${depthClause}(endNode)
                RETURN endNode
            `;
            const result = await session.run(query, { startNodeId });
            return result.records.map(record => this.hydrate(record.get('endNode').properties));
        } finally {
            await session.close();
        }
    }

    async runQuery(query: string, params?: Record<string, any>): Promise<any[]> {
        const session = await this.getSession();
        try {
            const result = await session.run(query, params);
            return result.records.map(record => record.toObject()); // Original mapping
        } finally {
            await session.close();
        }
    }
}
