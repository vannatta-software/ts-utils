import { BaseEventBus } from '../event.bus';
import { ILogger } from '../common/logger';
import { IEventEmitter } from '../common/event-emitter';
import { HandlerRegistry } from '../handler.registry';
import { Integration, IIntegrationHandler } from '@vannatta-software/ts-utils-domain';

// Mock Integration type
class MockIntegration implements Integration<any> {
    name: string;
    eventId: string;
    data: any;

    constructor(name: string, eventId: string, data: any) {
        this.name = name;
        this.eventId = eventId;
        this.data = data;
    }
}

// Mock Integration Handler
class MockIntegrationHandler implements IIntegrationHandler<any> {
    handle = jest.fn();
}

describe('BaseEventBus', () => {
    let baseEventBus: BaseEventBus;
    let mockRegistry: jest.Mocked<HandlerRegistry>;
    let mockEventEmitter: jest.Mocked<IEventEmitter>;
    let mockLogger: jest.Mocked<ILogger>;

    // Mock setInterval and clearInterval
    let originalSetInterval: typeof setInterval;
    let originalClearInterval: typeof clearInterval;
    let intervalId: any;

    beforeAll(() => {
        originalSetInterval = global.setInterval;
        originalClearInterval = global.clearInterval;
        global.setInterval = jest.fn((callback: Function, ms: number) => {
            intervalId = originalSetInterval(callback, ms);
            return intervalId as any;
        });
        global.clearInterval = jest.fn((id: any) => originalClearInterval(id));
    });

    afterAll(() => {
        global.setInterval = originalSetInterval;
        global.clearInterval = originalClearInterval;
    });

    beforeEach(() => {
        mockRegistry = {
            getIntegrationHandlers: jest.fn(),
            // Add other HandlerRegistry methods if needed by the constructor or other indirect calls
            getCommandHandler: jest.fn(),
            getQueryHandler: jest.fn(),
            getEventHandlers: jest.fn(),
            registerCommandHandler: jest.fn(),
            registerQueryHandler: jest.fn(),
            registerEventHandler: jest.fn(),
            registerIntegration: jest.fn(),
            getIntegrationHandlerNames: jest.fn(),
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

        baseEventBus = new BaseEventBus(mockRegistry, mockEventEmitter, mockLogger);
        jest.clearAllTimers(); // Clear any timers set by the constructor
    });

    afterEach(() => {
        if (intervalId) {
            originalClearInterval(intervalId);
            intervalId = undefined;
        }
        jest.restoreAllMocks(); // Restore mocks after each test
    });

    describe('constructor', () => {
        it('should set up a cleanup interval', () => {
            expect(setInterval).toHaveBeenCalledTimes(1);
            expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 3600 * 1000);
        });
    });

    describe('publish', () => {
        it('should handle event and add to processedEvents', async () => {
            const integration = new MockIntegration('UserCreated', '123', { userId: 'abc' });
            const mockHandler = new MockIntegrationHandler();
            mockRegistry.getIntegrationHandlers.mockReturnValue([mockHandler]);

            await baseEventBus.publish(integration);

            expect(mockRegistry.getIntegrationHandlers).toHaveBeenCalledWith('UserCreated');
            expect(mockHandler.handle).toHaveBeenCalledWith(integration.data);
            expect(mockEventEmitter.emit).toHaveBeenCalledWith('UserCreated', integration.data);
            expect(mockLogger.debug).toHaveBeenCalledWith('Publishing integration UserCreated to 1 handlers');

            // Check if event is processed (indirectly, as processedEvents is private)
            // We can try to publish again and expect it to be skipped
            await baseEventBus.publish(integration);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Skipping duplicate event UserCreated:123`);
            expect(mockHandler.handle).toHaveBeenCalledTimes(1); // Should not be called again
        });

        it('should skip duplicate events', async () => {
            const integration = new MockIntegration('OrderPlaced', 'order-abc', { orderId: 'abc' });
            const mockHandler = new MockIntegrationHandler();
            mockRegistry.getIntegrationHandlers.mockReturnValue([mockHandler]);

            await baseEventBus.publish(integration);
            await baseEventBus.publish(integration); // Publish again

            expect(mockHandler.handle).toHaveBeenCalledTimes(1); // Should only be called once
            expect(mockLogger.debug).toHaveBeenCalledWith(`Skipping duplicate event OrderPlaced:order-abc`);
        });

        it('should log error if handleEvent fails', async () => {
            const integration = new MockIntegration('FailedEvent', 'fail-1', {});
            const error = new Error('Handler failed');
            mockRegistry.getIntegrationHandlers.mockImplementation(() => {
                throw error; // Simulate error during handler retrieval/execution
            });

            await expect(baseEventBus.publish(integration)).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalledWith(
                `Failed to handle event FailedEvent:fail-1: ${error.message}`,
                error.stack
            );
        });
    });

    describe('subscribe', () => {
        it('should call eventEmitter.on with the correct topic and handler', () => {
            const topic = 'myTopic';
            const handler = jest.fn();
            baseEventBus.subscribe(topic, handler);
            expect(mockEventEmitter.on).toHaveBeenCalledWith(topic, handler);
            expect(mockLogger.debug).toHaveBeenCalledWith(`BaseEventBus subscribed to topic: ${topic}`);
        });
    });

    describe('unsubscribe', () => {
        it('should call eventEmitter.removeAllListeners with the correct topic name', () => {
            class MyTopic {} // Dummy class for topic
            baseEventBus.unsubscribe(MyTopic);
            expect(mockEventEmitter.removeAllListeners).toHaveBeenCalledWith('MyTopic');
            expect(mockLogger.debug).toHaveBeenCalledWith(`BaseEventBus unsubscribed from topic: MyTopic`);
        });
    });

    describe('cleanupOldEvents', () => {
        it('should clear processed events cache', async () => {
            const integration1 = new MockIntegration('Event1', 'id1', {});
            const integration2 = new MockIntegration('Event2', 'id2', {});

            // Publish events to populate processedEvents
            const mockHandler = new MockIntegrationHandler();
            mockRegistry.getIntegrationHandlers.mockReturnValue([mockHandler]);
            await baseEventBus.publish(integration1);
            await baseEventBus.publish(integration2);

            // Manually trigger cleanup (bypassing setInterval)
            // Accessing private method for testing purposes
            (baseEventBus as any).cleanupOldEvents(); 

            // Try publishing again, should not be skipped
            await baseEventBus.publish(integration1);
            await baseEventBus.publish(integration2);

            expect(mockLogger.debug).toHaveBeenCalledWith('Cleared processed events cache');
            expect(mockHandler.handle).toHaveBeenCalledTimes(4); // Called twice initially, then twice again after cleanup
        });
    });
});
