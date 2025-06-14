import { Entity } from '@vannatta-software/ts-utils-domain';
import { Mediator } from '../../mediator.service'; // Corrected path
import { MongoPipeline } from './mongo.utils'; 
import { IRepository } from '../repository.interface'; // Keep IRepository
import { Model } from 'mongoose'; // Re-add Mongoose Model

export class MongoRepository<T extends Entity> implements IRepository<T> {
    constructor(
        protected model: Model<T>, 
        private mediator: Mediator
    ) {}

    async findAll(): Promise<T[]> {
        const docs = await this.model.find({}).exec(); 
        return docs.map(doc => this.hydrate(doc));
    }

    async findById(id: string): Promise<T | null> {
        const doc = await this.model.findById(id).exec();
        
        return doc ? this.hydrate(doc) : null; 
    }

    async insert(entity: T) {
        entity.create();

        await this.update(entity)
    }

    async update(entity: T): Promise<void> {
        const id = entity.id.value;
        const doc = entity.document; 

        await this.model.findByIdAndUpdate(id, doc, { upsert: true, new: true }).exec();

        this.mediator.publishEvents(entity);
    }

    async delete(entity: T): Promise<void> {
        await this.model.findByIdAndDelete(entity.id.value).exec(); 

        entity.delete(); 

        this.mediator.publishEvents(entity);
    }
    
    async search(queryObject: Record<string, any>): Promise<T[]> {
        const docs = await this.model.find(queryObject).exec();
        return docs.map(doc => this.hydrate(doc));
    }

    private hydrate: (document: any) => T = () => {
        return {} as T;
    }

    public onHydrate(hydrate:(document: any) => T ) {
        this.hydrate = hydrate;
    }

    async aggregate(pipeline: MongoPipeline<T>): Promise<T[]> {
        const docs = await this.model.aggregate(pipeline.build()).exec();
        return docs.map(doc => this.hydrate(doc));
    }x 
}
