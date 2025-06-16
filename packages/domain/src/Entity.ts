import { Schema } from "@vannatta-software/ts-utils-core";
import { IDomainEvent } from "./Events";
import { UniqueIdentifier } from "./UniqueIdentifier"; // This is the former GlobalIdentifier
import { UniqueProperty, getUniqueProperties } from './decorators/unique-property.decorator'; // Import decorator and helper directly from source
import { ValueObject } from "./ValueObject"; // Import ValueObject for type checking
import { Enumeration } from "./Enumeration"; // Import Enumeration for type checking

export interface IEntity { 
    id: UniqueIdentifier;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class Entity implements IEntity {
    public id: UniqueIdentifier;
    public createdAt: Date;
    public updatedAt: Date;
    private _domainEvents: IDomainEvent[];

    constructor(entity?: Partial<Entity>) {
        this.createdAt = entity?.createdAt ? new Date(entity.createdAt) : new Date();
        this.updatedAt = entity?.updatedAt ? new Date(entity.updatedAt) :  new Date();
        this._domainEvents = [];
        this.id = entity?.id ? new UniqueIdentifier(entity.id.value) : UniqueIdentifier.generate() 

        if (entity?.["_id"])
            this.id = new UniqueIdentifier(entity["_id"])
    }

    setId(id: string) {
        this.id = new UniqueIdentifier(id.toString());
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

    /**
     * Generates a composite key string based on properties marked with @UniqueProperty
     * in the concrete subclass. This is useful for in-memory uniqueness checks.
     */
    get compositeUniqueKey(): string {
        // 'this.constructor' refers to the actual subclass (e.g., Product, User)
        const uniquePropNames = getUniqueProperties(this.constructor as Function);
        const values = uniquePropNames.map(propName => {
            const value = (this as any)[propName];
            if (value instanceof Entity) {
                // For Entities, use their UniqueIdentifier's value
                return value.id.value;
            } else if (value instanceof ValueObject || value instanceof Enumeration) {
                // For ValueObjects and Enumerations, use their toString() representation
                // Assuming toString() provides a unique and meaningful string for these types
                return value.toString();
            }
            // For primitives or other types, use the value directly
            return value;
        });
        return values.join('::'); // Use a consistent separator
    }

    /**
     * Detects if there are any entities in the collection with conflicting composite unique properties.
     * @param entities The collection of entities to check.
     * @returns True if conflicts are found, false otherwise.
     */
    static hasConflicts<T extends Entity>(entities: T[]): boolean {
        const uniqueKeys = new Set<string>();
        for (const entity of entities) {
            const key = entity.compositeUniqueKey;
            if (uniqueKeys.has(key)) {
                return true; // Conflict found
            }
            uniqueKeys.add(key);
        }
        return false; // No conflicts
    }
}
