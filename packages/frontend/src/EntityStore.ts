import { BaseStore } from './BaseStore';
import { Entity as EntityModel } from "@vannatta-software/ts-utils-domain";
import React from "react";
import { WebSocketConnection } from './websockets/WebSocketUtils';
import { WebSocketContext } from './websockets/WebSocketProvider';
import { ServiceConnection } from './ServiceConnection'; 

export interface EntityState<Entity extends EntityModel> {
    entities: Entity[],
    synchronized: boolean
}

export interface EntityActions<Entity extends EntityModel> {
    synchronize(entities: Entity[]): void,
    desynchronize(): void,
    addOne(entity?: Entity): void,
    removeOne(entity: Entity | string): void,
    replaceOne(entity?: Entity): void
}

export abstract class BaseEntityStore<
    S extends EntityState<EntityModel>,
    A extends EntityActions<EntityModel>> 
    extends BaseStore<S, A> implements EntityActions<EntityModel> {    
    
    constructor(protected initialState: S, prototype: any) {
        super(
            initialState, BaseEntityStore.prototype
        );
    }

    public synchronize(entities: EntityModel[]) {
        this.setState({ ...this.state, entities, synchronized: true });        
    }

    public desynchronize() {
        this.setState({ ...this.state, synchronized: false });
    }

    public addOne(entity?: EntityModel) {
        if (!entity)
            return;

        const index = this.state.entities.findIndex(e => e.id.value == entity.id.value);

        if (index != -1)
            this.state.entities[index] = entity;
        else
            this.state.entities.push(entity);

        this.setState({ ...this.state });
    }

    public removeOne(entity?: EntityModel | string) {
        if (!entity)
            return;

        const id = typeof entity == "string" ?  entity : entity.id;

        this.state.entities = this.state.entities.filter(e => e.id.value != id);

        this.setState({ ...this.state });
    }

    public replaceOne(entity?: EntityModel) {
        if (!entity)
            return;
            
        const index = this.state.entities.findIndex(e => e.id == entity.id);

        if (index != -1)
            this.state.entities[index] = entity;
        else
            throw new Error(`Could not find any entities replace`);

        this.setState({ ...this.state });
    }
}

export class EntityStore<E extends EntityModel>
    extends BaseEntityStore<EntityState<E>, EntityActions<E>> {
        constructor() {
            const initialState: EntityState<E> = {
                entities: [],
                synchronized: false
            };

            super(initialState, EntityStore.prototype);
        }

        public static bindStoreActions<T>(store: EntityStore<any>, actions: Partial<T>) {
            const [ acts ] = React.useState(actions);
        
            React.useEffect(() => { 
                store.assignActions(actions);
            }, [ store ]);
        
            return acts
        }

        public static useAPI<T>(connection: ServiceConnection, createAPI: (url: string) => T) {
            const [ API, setAPI ] = React.useState(createAPI(connection.address));
        
            React.useEffect(() => { 
                setAPI(createAPI(connection.address)) 
            }, [ connection ]);
        
            return API
        }

        public static useWebSocket(socketName) {
            const [ socket, setSocket ] = React.useState<WebSocketConnection | undefined>();
            const { service: sockets } = React.useContext(WebSocketContext);
        
            React.useEffect(() => {
                setSocket(sockets.connections[socketName])
            }, [ sockets ])
        
            return socket
        }
}

