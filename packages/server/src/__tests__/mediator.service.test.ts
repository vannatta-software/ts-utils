import { Mediator } from '../mediator.service';
import { HandlerRegistry } from '../handler.registry';
import { IEventEmitter } from '../common/event-emitter';
import { ILogger } from '../common/logger';
import { Command, Query, IDomainEvent, Entity, DTO, Model } from '@vannatta-software/ts-utils-domain';
import { ApiException } from '../common/exceptions/api.exception';

// Mock classes for testing
class MockCommand extends Command<string> {
    constructor(public value: string = 'test') {
        super();
    }
}

class MockQuery extends Query<string> {
    constructor(public value: string = 'test') {
        super();
    }
}

class MockDomainEvent implements IDomainEvent {
    public dateTimeOccurred: Date = new Date();
    constructor(public data: string = 'event data') {}
}

class MockEntity extends Entity {
    constructor(id: string) {
        super({ id: { value: id } as any }); // Pass partial entity to base constructor
    }
    create = jest.fn();
    delete = jest.fn();
}

// Mock Handlers
class MockCommandHandler {
    handle = jest.fn((command: MockCommand) => Promise.resolve(`handled ${command.value}`));
}

class MockQueryHandler {
    handle = jest.fn((query: MockQuery) => Promise.resolve(`queried ${query.value}`));
}

class MockEventHandler {
    handle = jest.fn((event: MockDomainEvent) => Promise.resolve());
}

describe('Mediator', () => {
    let mediator: Mediator;
    let mockRegistry: jest.Mocked<HandlerRegistry>;
    let mockEventEmitter: jest.Mocked<IEventEmitter>;
    let mockLogger: jest.Mocked<ILogger>;

    beforeEach(() => {
        mockRegistry = {
            getCommandHandler: jest.fn(),
            getQueryHandler: jest.fn(),
            getEventHandlers: jest.fn(),
            registerCommandHandler: jest.fn(),
            registerQueryHandler: jest.fn(),
            registerEventHandler: jest.fn(),
            registerIntegration: jest.fn(),
            getIntegrationHandlers: jest.fn(),
            getIntegrationHandlerNames: jest.fn(),
            // Mock private properties
            commandHandlers: new Map(),
            queryHandlers: new Map(),
            eventHandlers: new Map(),
            integrationHandlers: new Map(),
        } as unknown as jest.Mocked<HandlerRegistry>;

        mockEventEmitter = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            removeAllListeners: jest.fn(),
        } as jest.Mocked<IEventEmitter>;

        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as jest.Mocked<ILogger>;

        mediator = new Mediator(mockRegistry, mockEventEmitter, mockLogger);
        // Default mock for Model.validate to return valid, can be overridden in specific tests
        jest.spyOn(Model, 'validate').mockReturnValue({ isValid: true, errors: {} });
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Clean up spies after each test
    });

    describe('sendCommand', () => {
        it('should successfully send a command and return the result', async () => {
            const commandData: DTO<MockCommand> = { value: 'test command' };
            const mockHandler = new MockCommandHandler();
            mockRegistry.getCommandHandler.mockReturnValue(mockHandler);

            const result = await mediator.sendCommand(commandData, MockCommand);

            expect(mockRegistry.getCommandHandler).toHaveBeenCalledWith('MockCommand');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.any(MockCommand));
            expect(result).toBe('handled test command');
            expect(mockLogger.debug).toHaveBeenCalledWith('Executing command MockCommand');
        });

        it('should throw ApiException if validation fails', async () => {
            jest.spyOn(Model, 'validate').mockReturnValue({ isValid: false, errors: { value: ['Validation error'] } });

            const commandData: DTO<MockCommand> = { value: 'invalid' };

            await expect(mediator.sendCommand(commandData, MockCommand)).rejects.toThrow(ApiException);
            await expect(mediator.sendCommand(commandData, MockCommand)).rejects.toHaveProperty('errors', { value: ['Validation error'] });
        });

        it('should throw ApiException if no handler is found for the command', async () => {
            mockRegistry.getCommandHandler.mockReturnValue(undefined);

            const commandData: DTO<MockCommand> = { value: 'no handler' };

            await expect(mediator.sendCommand(commandData, MockCommand)).rejects.toThrow(
                'No handler found for command MockCommand'
            );
        });
    });

    describe('sendQuery', () => {
        it('should successfully send a query and return the result', async () => {
            const queryData: DTO<MockQuery> = { value: 'test query' };
            const mockHandler = new MockQueryHandler();
            mockRegistry.getQueryHandler.mockReturnValue(mockHandler);

            const result = await mediator.sendQuery(queryData, MockQuery);

            expect(mockRegistry.getQueryHandler).toHaveBeenCalledWith('MockQuery');
            expect(mockHandler.handle).toHaveBeenCalledWith(expect.any(MockQuery));
            expect(result).toBe('queried test query');
            expect(mockLogger.debug).toHaveBeenCalledWith('Executing query MockQuery');
        });

        it('should throw ApiException if validation fails', async () => {
            jest.spyOn(Model, 'validate').mockReturnValue({ isValid: false, errors: { value: ['Validation error'] } });

            const queryData: DTO<MockQuery> = { value: 'invalid' };

            await expect(mediator.sendQuery(queryData, MockQuery)).rejects.toThrow(ApiException);
            await expect(mediator.sendQuery(queryData, MockQuery)).rejects.toHaveProperty('errors', { value: ['Validation error'] });
        });

        it('should throw ApiException if no handler is found for the query', async () => {
            mockRegistry.getQueryHandler.mockReturnValue(undefined);

            const queryData: DTO<MockQuery> = { value: 'no handler' };

            await expect(mediator.sendQuery(queryData, MockQuery)).rejects.toThrow(
                'No handler found for query MockQuery'
            );
        });
    });

    describe('publishEvent', () => {
        it('should publish an event to all registered handlers and emit through event emitter', async () => {
            const event = new MockDomainEvent('test event');
            const mockHandler1 = new MockEventHandler();
            const mockHandler2 = new MockEventHandler();
            mockRegistry.getEventHandlers.mockReturnValue([mockHandler1, mockHandler2]);

            await mediator.publishEvent(event);

            expect(mockRegistry.getEventHandlers).toHaveBeenCalledWith('MockDomainEvent');
            expect(mockHandler1.handle).toHaveBeenCalledWith(event);
            expect(mockHandler2.handle).toHaveBeenCalledWith(event);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('MockDomainEvent', event);
            expect(mockLogger.debug).toHaveBeenCalledWith('Publishing event MockDomainEvent to 2 handlers');
        });
    });

    describe('publishEvents', () => {
        it('should publish all domain events from an entity and clear them', async () => {
            const entity = new MockEntity('entity-1');
            const event1 = new MockDomainEvent('event1');
            const event2 = new MockDomainEvent('event2');
            
            entity.addDomainEvent(event1);
            entity.addDomainEvent(event2);

            const mockEventHandler = new MockEventHandler();
            mockRegistry.getEventHandlers.mockReturnValue([mockEventHandler]);

            await mediator.publishEvents(entity);

            expect(mockRegistry.getEventHandlers).toHaveBeenCalledWith('MockDomainEvent');
            expect(mockEventHandler.handle).toHaveBeenCalledWith(event1);
            expect(mockEventHandler.handle).toHaveBeenCalledWith(event2);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('MockDomainEvent', event1);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('MockDomainEvent', event2);
            expect(entity.domainEvents).toHaveLength(0); // Ensure events are cleared
        });
    });
});
