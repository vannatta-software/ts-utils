// import { Entity } from '@vannatta-software/ts-utils-domain';
// import { Mediator } from '../../mediator.service'; // Corrected path
// import { PostgresSchema } from './postgres.schema';
// import { ILogger } from '../../common/logger'; // Use ILogger
// import { DataSource, Repository, ObjectLiteral } from 'typeorm'; // Re-add TypeORM imports
// import { ClassType } from '../../common/types'; // Use generic ClassType

// export class PostgresRepository<T extends Entity> {
//     protected readonly logger: ILogger;
//     private typeOrmRepository: Repository<ObjectLiteral>; // Use concrete TypeORM Repository
//     private hydrate: (document: any) => T = () => {
//         return {} as T;
//     };

//     constructor(
//         private readonly mediator: Mediator,
//         private readonly dataSource: DataSource, // Use concrete TypeORM DataSource
//         private readonly entityClass: ClassType<T>, // Use ClassType
//         logger: ILogger // Inject ILogger
//     ) {
//         this.logger = logger;
//         const typeOrmEntity = PostgresSchema.getTypeOrmEntity(entityClass);
//         this.typeOrmRepository = this.dataSource.getRepository(typeOrmEntity);
//     }

//     public onHydrate(hydrate: (document: any) => T) {
//         this.hydrate = hydrate;
//     }

//     async findAll(): Promise<T[]> {
//         const docs = await this.typeOrmRepository.find();
//         return docs.map(doc => this.hydrate(doc));
//     }

//     async findById(id: string): Promise<T | null> {
//         const doc = await this.typeOrmRepository.findOneBy({ id });
//         return doc ? this.hydrate(doc) : null;
//     }

//     async insert(entity: T): Promise<void> {
//         entity.create();
//         await this.typeOrmRepository.save(entity.document);
//         this.mediator.publishEvents(entity);
//     }

//     async update(entity: T): Promise<void> {
//         await this.typeOrmRepository.save(entity.document);
//         this.mediator.publishEvents(entity);
//     }

//     async delete(entity: T): Promise<void> {
//         await this.typeOrmRepository.delete(entity.id.value);
//         entity.delete();
//         this.mediator.publishEvents(entity);
//     }
// }
