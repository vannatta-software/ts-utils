import { Entity } from '@vannatta-software/ts-utils-domain';

export interface IRepository<T extends Entity, TQuery = any, TPipeline = any> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    insert(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(entity: T): Promise<void>;
    search(queryObject: TQuery): Promise<T[]>;
    aggregate(pipeline: TPipeline): Promise<T[]>;
    onHydrate(hydrate: (document: any) => T): void;
}
