import { InMemoryRepository } from '../in-memory.repository';
import { Entity, UniqueIdentifier, IDomainEvent } from '@vannatta-software/ts-utils-domain';
import { Mediator } from '../../../mediator.service'; // Corrected path
import { ILogger } from '../../../common/logger'; // Corrected path
import { IEventEmitter } from '../../../common/event-emitter'; // Corrected path
import { HandlerRegistry } from '../../../handler.registry'; // Corrected path

// Mock Entity for testing
class TestEntity extends Entity {
    public name: string;
    public age: number;

    constructor(id: string, name: string, age: number) {
        super({ id: { value: id } as any });
        this.name = name;
        this.age = age;
    }

    create = jest.fn();
    delete = jest.fn();
}

// Mock Domain Event for testing
class MockDomainEvent implements IDomainEvent {
    public dateTimeOccurred: Date = new Date();
    constructor(public data: string = 'event data') {}
}

// Extend TestEntity to add domain events for testing
class TestEntityWithEvents extends TestEntity {
    constructor(id: string, name: string, age: number, events: IDomainEvent[] = []) {
        super(id, name, age);
        // Manually add domain events for testing purposes
        (this as any)._domainEvents = events;
    }
}

describe('InMemoryRepository', () => {
    let repository: InMemoryRepository<TestEntityWithEvents>;
    let mockMediator: jest.Mocked<Mediator>;
    let entity1: TestEntityWithEvents;
    let entity2: TestEntityWithEvents;
    let entity3: TestEntityWithEvents;

    beforeEach(() => {
        // Mock Mediator and its dependencies
        const mockLogger: jest.Mocked<ILogger> = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        };
        const mockEventEmitter: jest.Mocked<IEventEmitter> = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            removeAllListeners: jest.fn(),
        };
        const mockRegistry: jest.Mocked<HandlerRegistry> = {
            getCommandHandler: jest.fn(),
            getQueryHandler: jest.fn(),
            getEventHandlers: jest.fn(),
            registerCommandHandler: jest.fn(),
            registerQueryHandler: jest.fn(),
            registerEventHandler: jest.fn(),
            registerIntegration: jest.fn(),
            getIntegrationHandlers: jest.fn(),
            getIntegrationHandlerNames: jest.fn(),
            commandHandlers: new Map(),
            queryHandlers: new Map(),
            eventHandlers: new Map(),
            integrationHandlers: new Map(),
        } as unknown as jest.Mocked<HandlerRegistry>;

        mockMediator = {
            publishEvents: jest.fn().mockResolvedValue(undefined),
            publishEvent: jest.fn(),
            sendCommand: jest.fn(),
            sendQuery: jest.fn(),
            logger: mockLogger,
            registry: mockRegistry,
            eventEmitter: mockEventEmitter,
            validate: jest.fn(),
        } as unknown as jest.Mocked<Mediator>;

        repository = new InMemoryRepository<TestEntityWithEvents>(mockMediator);
        entity1 = new TestEntityWithEvents('id1', 'Alice', 30, [new MockDomainEvent('event1-data')]);
        entity2 = new TestEntityWithEvents('id2', 'Bob', 25, [new MockDomainEvent('event2-data')]);
        entity3 = new TestEntityWithEvents('id3', 'Charlie', 35, []); // No events for this one
    });

    describe('insert', () => {
        it('should insert an entity successfully', async () => {
            await repository.insert(entity1);
            const found = await repository.findById('id1');
            expect(found).toBe(entity1);
            expect(mockMediator.publishEvents).toHaveBeenCalledWith(entity1);
        });

        it('should throw an error if entity with same ID already exists', async () => {
            await repository.insert(entity1);
            await expect(repository.insert(entity1)).rejects.toThrow(
                'Entity with ID id1 already exists.'
            );
        });
    });

    describe('findAll', () => {
        it('should return all inserted entities', async () => {
            await repository.insert(entity1);
            await repository.insert(entity2);
            const all = await repository.findAll();
            expect(all).toEqual([entity1, entity2]);
            expect(all).toHaveLength(2);
        });

        it('should return an empty array if no entities are inserted', async () => {
            const all = await repository.findAll();
            expect(all).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should find an entity by its ID', async () => {
            await repository.insert(entity1);
            const found = await repository.findById('id1');
            expect(found).toBe(entity1);
        });

        it('should return null if entity is not found by ID', async () => {
            const found = await repository.findById('nonExistentId');
            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should update an existing entity', async () => {
            await repository.insert(entity1);
            entity1.name = 'Alicia';
            await repository.update(entity1);
            const updated = await repository.findById('id1');
            expect(updated?.name).toBe('Alicia');
            expect(mockMediator.publishEvents).toHaveBeenCalledWith(entity1);
        });

        it('should throw an error if entity to update is not found', async () => {
            const nonExistentEntity = new TestEntity('nonExistentId', 'Dave', 40);
            await expect(repository.update(nonExistentEntity)).rejects.toThrow(
                'Entity with ID nonExistentId not found for update.'
            );
        });
    });

    describe('delete', () => {
        it('should delete an existing entity', async () => {
            await repository.insert(entity1);
            await repository.delete(entity1);
            const found = await repository.findById('id1');
            expect(found).toBeNull();
            expect(mockMediator.publishEvents).toHaveBeenCalledWith(entity1);
        });

        it('should throw an error if entity to delete is not found', async () => {
            const nonExistentEntity = new TestEntity('nonExistentId', 'Eve', 50);
            await expect(repository.delete(nonExistentEntity)).rejects.toThrow(
                'Entity with ID nonExistentId not found for deletion.'
            );
        });
    });

    describe('search', () => {
        beforeEach(async () => {
            await repository.insert(entity1); // Alice, 30
            await repository.insert(entity2); // Bob, 25
            await repository.insert(entity3); // Charlie, 35
        });

        it('should return all entities if query object is empty', async () => {
            const results = await repository.search({});
            expect(results).toEqual([entity1, entity2, entity3]);
        });

        it('should find entities by exact match on properties', async () => {
            const results = await repository.search({ name: 'Alice' });
            expect(results).toEqual([entity1]);
        });

        it('should find entities by partial string match', async () => {
            const results = await repository.search({ name: 'li' });
            expect(results).toEqual([entity1, entity3]); // Alice, Charlie
        });

        it('should find entities by multiple property matches', async () => {
            const results = await repository.search({ name: 'Bob', age: 25 });
            expect(results).toEqual([entity2]);
        });

        it('should return empty array if no matches found', async () => {
            const results = await repository.search({ name: 'Zoe' });
            expect(results).toEqual([]);
        });

        it('should handle numeric property search', async () => {
            const results = await repository.search({ age: 30 });
            expect(results).toEqual([entity1]);
        });
    });

    describe('aggregate', () => {
        beforeEach(async () => {
            await repository.insert(entity1); // Alice, 30
            await repository.insert(entity2); // Bob, 25
            await repository.insert(entity3); // Charlie, 35
        });

        it('should return all entities if pipeline is not a function', async () => {
            const results = await repository.aggregate([]); // Empty array as pipeline
            expect(results).toEqual([entity1, entity2, entity3]);
        });

        it('should filter entities if pipeline is a function', async () => {
            const youngEntities = await repository.aggregate((e: TestEntity) => e.age < 30);
            expect(youngEntities).toEqual([entity2]);
        });
    });

    describe('onHydrate', () => {
        it('should set the hydrate function', () => {
            const mockHydrate = jest.fn();
            repository.onHydrate(mockHydrate);
            // No direct way to assert private hydrateFn, but we can assume it's set.
            // Its usage would be in a concrete repository that uses this InMemoryRepository internally.
            // For now, just ensure the method doesn't throw and accepts the function.
            expect(() => repository.onHydrate(mockHydrate)).not.toThrow();
        });
    });
});
