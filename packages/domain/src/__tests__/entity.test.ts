import { Entity } from "../Entity";
import { UniqueProperty } from '../decorators/unique-property.decorator';
import { ValueObject } from "../ValueObject";
import { Enumeration } from "../Enumeration";
import { UniqueIdentifier } from "../UniqueIdentifier";

describe('Entity', () => {
    class TestEntity extends Entity {
        create(): void { }
        delete(): void { }
    }

    class MockValueObject extends ValueObject {
        constructor(public val: string) {
            super();
        }
        protected *getAtomicValues(): IterableIterator<any> {
            yield this.val;
        }
    }

    class MockEnumeration extends Enumeration {
        static OptionA = new MockEnumeration({ id: 1, name: 'OptionA' });
        static OptionB = new MockEnumeration({ id: 2, name: 'OptionB' });
        constructor(en?: Partial<MockEnumeration>) {
            super(en);
        }
    }

    class EntityWithUniqueProps extends Entity {
        @UniqueProperty()
        public name: string;

        @UniqueProperty()
        public age: number;

        @UniqueProperty()
        public relatedEntity: TestEntity; // Test Entity type

        @UniqueProperty()
        public valueObj: MockValueObject; // Test ValueObject type

        @UniqueProperty()
        public enumVal: MockEnumeration; // Test Enumeration type

        constructor(name: string, age: number, relatedEntity: TestEntity, valueObj: MockValueObject, enumVal: MockEnumeration, entity?: Partial<EntityWithUniqueProps>) {
            super(entity);
            this.name = name;
            this.age = age;
            this.relatedEntity = relatedEntity;
            this.valueObj = valueObj;
            this.enumVal = enumVal;
        }

        create(): void { }
        delete(): void { }
    }

    it('should create an entity with current date as createdAt and updatedAt', () => {
        const entity = new TestEntity();
        expect(entity.createdAt).toBeInstanceOf(Date);
        expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    it('should add and remove domain events', () => {
        const entity = new TestEntity();
        const event = { dateTimeOccurred: new Date() }; // Mock event, replace with actual event object
        entity.addDomainEvent(event);
        expect(entity.domainEvents.length).toBe(1);
        entity.removeDomainEvent(event);
        expect(entity.domainEvents.length).toBe(0);
    });

    it('should clear all domain events', () => {
        const entity = new TestEntity();
        const event1 = { dateTimeOccurred: new Date() }; // Mock event
        const event2 = { dateTimeOccurred: new Date() }; // Another mock event
        entity.addDomainEvent(event1);
        entity.addDomainEvent(event2);
        entity.clearDomainEvents();
        expect(entity.domainEvents.length).toBe(0);
    });

    it('should initialize with provided createdAt and updatedAt dates', () => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
        const entity = new TestEntity({ createdAt: twoDaysAgo, updatedAt: now });
        expect(entity.createdAt.getTime()).toBe(twoDaysAgo.getTime());
        expect(entity.updatedAt.getTime()).toBe(now.getTime());
    });

    it('should initialize id from _id property if provided', () => {
        const mockId = 'mock-uuid-from-db';
        // Cast to any to allow _id property for testing purposes
        const entity = new TestEntity({ _id: mockId } as any);
        expect(entity.id.value).toEqual(mockId);
    });

    it('should return true for equal entities based on id', () => {
        const entity1 = new TestEntity();
        const entity2 = new TestEntity();
        entity2.id = entity1.id; // Make them equal by ID
        expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for unequal entities based on id', () => {
        const entity1 = new TestEntity();
        const entity2 = new TestEntity();
        expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return true when comparing the same entity instance', () => {
        const entity = new TestEntity();
        expect(entity.equals(entity)).toBe(true);
    });

    it('should return false when comparing with null or undefined', () => {
        const entity = new TestEntity();
        expect(entity.equals(null as any)).toBe(false);
        expect(entity.equals(undefined as any)).toBe(false);
    });

    it('should set the entity ID', () => {
        const entity = new TestEntity();
        const newId = 'new-mock-uuid';
        entity.setId(newId);
        expect(entity.id.value).toEqual(newId);
    });

    it('should return the document representation without the id property', () => {
        const entity = new TestEntity();
        const doc = entity.document;
        expect(doc).not.toHaveProperty('id');
        expect(doc).toHaveProperty('createdAt');
        expect(doc).toHaveProperty('updatedAt');
        expect(doc).toHaveProperty('_domainEvents'); // Private property, but still part of the object spread
    });

    it('should return false when comparing with an object of a different class', () => {
        class AnotherClass {}
        const entity = new TestEntity();
        const other = new AnotherClass();
        expect(entity.equals(other as any)).toBe(false);
    });

    it('should generate a new UniqueIdentifier if id is not provided in constructor', () => {
        const entity = new TestEntity();
        expect(entity.id).toBeDefined();
        expect(entity.id.value).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    });

    it('should initialize _domainEvents as an empty array if it is null or undefined', () => {
        const entity = new TestEntity();
        // Manually set _domainEvents to null/undefined to test the getter's initialization logic
        (entity as any)._domainEvents = null;
        expect(entity.domainEvents).toEqual([]);
        expect((entity as any)._domainEvents).toEqual([]); // Verify it was initialized

        (entity as any)._domainEvents = undefined;
        expect(entity.domainEvents).toEqual([]);
        expect((entity as any)._domainEvents).toEqual([]); // Verify it was initialized
    });

    it('should return false when comparing with an entity of a different subclass', () => {
        class AnotherTestEntity extends Entity {
            create(): void { }
            delete(): void { }
        }
        const entity1 = new TestEntity();
        const entity2 = new AnotherTestEntity();
        expect(entity1.equals(entity2)).toBe(false);
    });

    it('should generate a composite unique key based on unique properties', () => {
        const relatedEntity = new TestEntity();
        relatedEntity.id = new UniqueIdentifier('related-entity-id');
        const valueObj = new MockValueObject('mock-value');
        const enumVal = MockEnumeration.OptionA;

        const entity = new EntityWithUniqueProps('testName', 30, relatedEntity, valueObj, enumVal);
        const expectedKey = `testName::30::related-entity-id::MockValueObject(mock-value)::OptionA`;
        expect(entity.compositeUniqueKey).toEqual(expectedKey);
    });

    it('should detect conflicts in a collection of entities', () => {
        const relatedEntity1 = new TestEntity();
        relatedEntity1.id = new UniqueIdentifier('related-entity-id-1');
        const valueObj1 = new MockValueObject('mock-value-1');
        const enumVal1 = MockEnumeration.OptionA;

        const relatedEntity2 = new TestEntity();
        relatedEntity2.id = new UniqueIdentifier('related-entity-id-2');
        const valueObj2 = new MockValueObject('mock-value-2');
        const enumVal2 = MockEnumeration.OptionB;

        const entity1 = new EntityWithUniqueProps('name1', 10, relatedEntity1, valueObj1, enumVal1);
        const entity2 = new EntityWithUniqueProps('name2', 20, relatedEntity2, valueObj2, enumVal2);
        const entity3 = new EntityWithUniqueProps('name1', 10, relatedEntity1, valueObj1, enumVal1); // Conflict with entity1

        expect(Entity.hasConflicts([entity1, entity2])).toBe(false);
        expect(Entity.hasConflicts([entity1, entity2, entity3])).toBe(true);
    });

    it('static is should return true for an entity that is an instance of the given class', () => {
        const entity = new TestEntity();
        expect(Entity.is(entity, TestEntity)).toBe(true);
    });

    it('static is should return false for an entity that is not an instance of the given class', () => {
        class AnotherTestEntity extends Entity {
            create(): void { }
            delete(): void { }
        }
        const entity = new TestEntity();
        expect(Entity.is(entity, AnotherTestEntity)).toBe(false);
    });
});
