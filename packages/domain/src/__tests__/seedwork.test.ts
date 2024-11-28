// seedwork.spec.ts

import { AggregateRoot } from "../AggregateRoot";
import { Entity } from "../Entity";
import { Enumeration } from "../Enumeration";
import { GlobalIdentifier } from "../GlobalIdentifier";
import { UniqueIdentifier } from "../UniqueIdentifier";

describe('GlobalIdentifier', () => {
    it('should create a new GlobalIdentifier with a UUID', () => {
        const identifier = GlobalIdentifier.newGlobalIdentifier();
        expect(identifier.value).toMatch(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    });

    it('should recognize an equal GlobalIdentifier', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier1 = new GlobalIdentifier(uuid);
        const identifier2 = new GlobalIdentifier(uuid);
        expect(identifier1.equals(identifier2)).toBeTruthy();
    });

    it('should correctly parse a valid UUID string', () => {
        const uuid = '123e4567-e89b-12d3-a456-426614174000';
        const identifier = GlobalIdentifier.parse(uuid);
        expect(identifier.value).toEqual(uuid);
    });

    it('should throw an error for invalid UUID format', () => {
        const invalidUUID = 'invalid-uuid';
        expect(() => GlobalIdentifier.parse(invalidUUID)).toThrow();
    });
});

describe('UniqueIdentifier', () => {
    it('should create a new UniqueIdentifier with name and context', () => {
        const value = 'TestName';
        const context = 'TestContext';
        const uniqueIdentifier = new UniqueIdentifier({ value, context });
        expect(uniqueIdentifier.value).toEqual(value);
        expect(uniqueIdentifier.context).toEqual(context);
    });

    it('should generate correct script and file formats', () => {
        const uniqueIdentifier = new UniqueIdentifier({ value: 'Test Name', context: 'TestContext' });
        expect(uniqueIdentifier.scriptFormat).toEqual('Test_Name');
        expect(uniqueIdentifier.fileFormat).toEqual('test-name');
    });
});

describe('Entity', () => {
    class TestEntity extends Entity {
        create(): void {}
        delete(): void {}
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
});

describe('AggregateRoot', () => {
    class TestAggregate extends AggregateRoot {
        create(): void {}
        delete(): void {}
    }

    it('should instantiate correctly as an aggregate root', () => {
        const aggregate = new TestAggregate();
        expect(aggregate).toBeInstanceOf(AggregateRoot);
        expect(aggregate).toBeInstanceOf(Entity);
    });
});


describe('Enumeration', () => {
    class Color extends Enumeration {
        static Red = new Color({ id: 1, name: 'Red' });
        static Green = new Color({ id: 2, name: 'Green' });
        static Blue = new Color({ id: 3, name: 'Blue' });
    
        constructor(en?: Partial<Color>) {
            super(en);
        }
    }
    it('should create an instance with the correct id and name', () => {
        const red = Color.Red;
        expect(red.id).toEqual(1);
        expect(red.name).toEqual('Red');
    });

    it('should return the correct instance from name', () => {
        const green = new Color().fromName('Green');
        expect(green).toBeInstanceOf(Color);
        expect(green).toEqual(Color.Green);
    });

    it('should return the correct instance from id', () => {
        const blue = new Color().from(3);
        expect(blue).toBeInstanceOf(Color);
        expect(blue).toEqual(Color.Blue);
    });

    it('should throw an error for a name that does not exist', () => {
        expect(() => new Color().fromName('Yellow')).toThrow();
    });

    it('should throw an error for an id that does not exist', () => {
        expect(() => new Color().from(4)).toThrow();
    });

    it('should return true for matching enumerations', () => {
        expect(Color.Red.equals(Color.Red)).toBeTruthy();
    });

    it('should return false for non-matching enumerations', () => {
        expect(Color.Red.equals(Color.Green)).toBeFalsy();
    });

    it('should return all instances', () => {
        const colors = new Color().getAllInstances();
        // expect(colors.length).toEqual(3);
        expect(colors).toContain(Color.Red);
        expect(colors).toContain(Color.Green);
        expect(colors).toContain(Color.Blue);
    });

    it('should calculate the correct difference between two values', () => {
        const diff = Enumeration.difference(Color.Red, Color.Blue);
        expect(diff).toEqual(2);
    });

    it('should correctly compare two values', () => {
        expect(Color.Red.compareTo(Color.Green)).toBe(1);
        expect(Color.Green.compareTo(Color.Red)).toBe(1);
        expect(Color.Red.compareTo(Color.Red)).toBe(0);
    });
});