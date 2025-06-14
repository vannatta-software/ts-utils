import { EventEmitter } from '../event-emitter.class';
import { EventEmitter as NodeEventEmitter } from 'events';

// Mock the Node.js 'events' module
jest.mock('events'); // This will mock the entire module

describe('EventEmitter', () => {
    let eventEmitter: EventEmitter;
    let mockNodeEventEmitterInstance: jest.Mocked<NodeEventEmitter>;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Cast the mocked NodeEventEmitter constructor to a Jest mock
        const MockedNodeEventEmitter = NodeEventEmitter as jest.MockedClass<typeof NodeEventEmitter>;

        // Configure the mock constructor to return a specific mock instance
        mockNodeEventEmitterInstance = {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            removeAllListeners: jest.fn(),
            addListener: jest.fn(),
            once: jest.fn(),
            removeListener: jest.fn(),
            setMaxListeners: jest.fn(),
            getMaxListeners: jest.fn(),
            listenerCount: jest.fn(),
            prependListener: jest.fn(),
            prependOnceListener: jest.fn(),
            eventNames: jest.fn(),
            listeners: jest.fn(),
            rawListeners: jest.fn(),
        } as jest.Mocked<NodeEventEmitter>;

        MockedNodeEventEmitter.mockImplementation(() => mockNodeEventEmitterInstance);

        eventEmitter = new EventEmitter(); // This will now use the mocked NodeEventEmitter
    });

    it('should register and emit events to listeners', () => {
        const listener = jest.fn();
        const eventName = 'testEvent';
        const payload = { data: 'hello' };

        eventEmitter.on(eventName, listener);
        const emitted = eventEmitter.emit(eventName, payload);

        expect(mockNodeEventEmitterInstance.emit).toHaveBeenCalledWith(eventName, payload);
        expect(emitted).toBe(mockNodeEventEmitterInstance.emit.mock.results[0].value);
    });

    it('should not call listeners for other events', () => {
        const listener = jest.fn();
        eventEmitter.on('testEvent1', listener);
        eventEmitter.emit('testEvent2', 'data');
        expect(mockNodeEventEmitterInstance.emit).toHaveBeenCalledWith('testEvent2', 'data');
    });

    it('should remove a specific listener', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const eventName = 'testEvent';

        eventEmitter.on(eventName, listener1);
        eventEmitter.on(eventName, listener2);
        eventEmitter.off(eventName, listener1);
        expect(mockNodeEventEmitterInstance.off).toHaveBeenCalledWith(eventName, listener1);
    });

    it('should remove all listeners for a specific event', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const eventName = 'testEvent';

        eventEmitter.on(eventName, listener1);
        eventEmitter.on(eventName, listener2);
        eventEmitter.removeAllListeners(eventName);
        expect(mockNodeEventEmitterInstance.removeAllListeners).toHaveBeenCalledWith(eventName);
    });

    it('should remove all listeners for all events if no event name is provided', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        eventEmitter.on('event1', listener1);
        eventEmitter.on('event2', listener2);
        eventEmitter.removeAllListeners();
        expect(mockNodeEventEmitterInstance.removeAllListeners).toHaveBeenCalledWith(undefined);
    });

    it('should allow chaining for on, off, and removeAllListeners', () => {
        const listener = jest.fn();
        expect(eventEmitter.on('event', listener)).toBe(eventEmitter);
        expect(eventEmitter.off('event', listener)).toBe(eventEmitter);
        expect(eventEmitter.removeAllListeners('event')).toBe(eventEmitter);
        expect(eventEmitter.removeAllListeners()).toBe(eventEmitter);
    });

    it('should return false if no listeners are called on emit', () => {
        mockNodeEventEmitterInstance.emit.mockReturnValue(false); // Mock the internal emitter's return value
        const emitted = eventEmitter.emit('nonExistentEvent', 'data');
        expect(emitted).toBe(false);
    });
});
