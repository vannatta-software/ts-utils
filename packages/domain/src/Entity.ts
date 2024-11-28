import { Schema } from "@vannatta-software/ts-core";
import { IDomainEvent } from "./Events";
import { GlobalIdentifier } from "./GlobalIdentifier";
import { UniqueIdentifier } from "./UniqueIdentifier";

export interface IEntity {
    id: GlobalIdentifier;
    createdAt: Date;
    updatedAt: Date;
}

export interface INamedEntity extends IEntity {
    name: UniqueIdentifier
}

export abstract class Entity implements IEntity {
    @Schema({ type: GlobalIdentifier, embedded: true })
    public id: GlobalIdentifier;
    @Schema({ type: Date })
    public createdAt: Date;
    @Schema({ type: Date })
    public updatedAt: Date;
    private _domainEvents: IDomainEvent[];

    constructor(entity?: Partial<Entity>) {
        this.createdAt = entity?.createdAt ? new Date(entity.createdAt) : new Date();
        this.updatedAt = entity?.updatedAt ? new Date(entity.updatedAt) :  new Date();
        this._domainEvents = [];
        this.id = entity?.id ? new GlobalIdentifier(entity.id.value) : GlobalIdentifier.newGlobalIdentifier() 

        if (entity?.["_id"])
            this.id = new GlobalIdentifier(entity["_id"])
    }

    setId(id: string) {
        this.id = new GlobalIdentifier(id.toString());
    }

    addDomainEvent(domainEvent: IDomainEvent): void {
        this.domainEvents.push(domainEvent);
    }

    removeDomainEvent(domainEvent: IDomainEvent): void {
        this._domainEvents = this._domainEvents.filter(event => event !== domainEvent);
    }

    clearDomainEvents(): void {
        this._domainEvents = [];
    }

    get domainEvents(): IDomainEvent[] {
        if (!this._domainEvents)
            this._domainEvents = [];

        return this._domainEvents;
    }

    static is<T extends IEntity>(entity: IEntity, instance: new (...args: any[]) => T): entity is T {
        return entity instanceof instance;
    }

    abstract create(): void;
    abstract delete(): void;

    equals(obj: Entity): boolean {
        if (!obj) return false;
        if (this === obj) return true;
        if (this.constructor !== obj.constructor) return false;

        return this.id === obj.id;
    }

    get document(): any {
        const docData = { ...this };

        delete docData.id;

        return docData;
    }
}
