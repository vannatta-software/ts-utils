import { ServiceClient, DomainService, IServiceClient, Cache } from '../Service';
import { IHttpClient, ClassType, StringUtils, RequestOptions } from '@vannatta-software/ts-utils-core';
import { IEventBus } from '../Events';
import { Integration } from '../CqrsTypes';
import { CancelTokenSource, CancelToken } from 'axios'; // Import from axios

// Mock IHttpClient
class MockHttpClient implements IHttpClient {
    get<T, Q = any>(path: string) {
        return {
            execute: jest.fn(async (options?: RequestOptions<Q>) => null as T)
        };
    }
    post<T, C = any>(path: string) {
        return {
            execute: jest.fn(async (command: C, options?: RequestOptions) => null as T)
        };
    }
    put<T, C = any>(path: string) {
        return {
            execute: jest.fn(async (command: C, options?: RequestOptions) => null as T)
        };
    }
    patch<T, C = any>(path: string) {
        return {
            execute: jest.fn(async (command: C, options?: RequestOptions) => null as T)
        };
    }
    delete<T, C = any>(path: string) {
        return {
            execute: jest.fn(async (command: C, options?: RequestOptions) => null as T)
        };
    }
    addMiddleware = jest.fn();
    createCancelToken = jest.fn((): CancelTokenSource => ({
        token: { throwIfRequested: jest.fn() } as any, // Mock CancelToken
        cancel: jest.fn()
    }));
}

// Mock IEventBus
class MockEventBus implements IEventBus {
    publish = jest.fn(async (event: Integration, topic?: string) => {});
    subscribe = jest.fn((topic: ClassType<any>, handler: (data: any) => Promise<void>) => {});
    unsubscribe = jest.fn((topic: ClassType<any>) => {});
}

// Concrete implementation of ServiceClient for testing
class TestServiceClient extends ServiceClient<any> {
    constructor(httpClient: IHttpClient, eventBus?: IEventBus) {
        super(httpClient, eventBus);
    }
    onConnect = jest.fn();
    onDisconnect = jest.fn();
}

describe('ServiceClient', () => {
    let mockHttpClient: MockHttpClient;
    let mockEventBus: MockEventBus;
    let serviceClient: TestServiceClient;

    beforeEach(() => {
        mockHttpClient = new MockHttpClient();
        mockEventBus = new MockEventBus();
        serviceClient = new TestServiceClient(mockHttpClient, mockEventBus);
    });

    // Constructor tests
    it('should initialize with provided httpClient and eventBus', () => {
        expect(serviceClient['http']).toBe(mockHttpClient);
        expect(serviceClient['eventBus']).toBe(mockEventBus);
        expect(serviceClient['notifications']).toBeInstanceOf(Map);
        expect(serviceClient['cacheUpdates']).toEqual({});
        expect(serviceClient['children']).toEqual([]);
    });

    it('should initialize without eventBus if not provided', () => {
        const clientWithoutBus = new TestServiceClient(mockHttpClient);
        expect(clientWithoutBus['eventBus']).toBeUndefined();
    });

    // onStart and onStop tests
    it('should call onStart on all children', () => {
        const child1 = new TestServiceClient(mockHttpClient);
        const child2 = new TestServiceClient(mockHttpClient);
        jest.spyOn(child1, 'onStart');
        jest.spyOn(child2, 'onStart');
        serviceClient['register'](child1, child2);
        serviceClient.onStart();
        expect(child1.onStart).toHaveBeenCalledTimes(1);
        expect(child2.onStart).toHaveBeenCalledTimes(1);
    });

    it('should call onStop on all children', () => {
        const child1 = new TestServiceClient(mockHttpClient);
        const child2 = new TestServiceClient(mockHttpClient);
        jest.spyOn(child1, 'onStop');
        jest.spyOn(child2, 'onStop');
        serviceClient['register'](child1, child2);
        serviceClient.onStop();
        expect(child1.onStop).toHaveBeenCalledTimes(1);
        expect(child2.onStop).toHaveBeenCalledTimes(1);
    });

    // hasCache getter
    it('should return true if there are cache updates registered', () => {
        serviceClient.bindCache('testType', jest.fn());
        expect(serviceClient.hasCache).toBe(true);
    });

    it('should return false if no cache updates are registered', () => {
        expect(serviceClient.hasCache).toBe(false);
    });

    // publishEvent
    it('should publish an event via eventBus if connected', async () => {
        class MyEventData {}
        const eventData = new MyEventData();
        await serviceClient['publishEvent'](eventData, MyEventData, 'customTopic');
        expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
        const publishedIntegration = mockEventBus.publish.mock.calls[0][0];
        expect(publishedIntegration).toBeInstanceOf(Integration);
        expect(publishedIntegration.data).toBe(eventData);
        expect(publishedIntegration.name).toEqual('MyEventData');
        expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(Integration), 'customTopic');
    });

    it('should not publish an event if eventBus is not connected', async () => {
        const clientWithoutBus = new TestServiceClient(mockHttpClient);
        class MyEventData {}
        const eventData = new MyEventData();
        await clientWithoutBus['publishEvent'](eventData, MyEventData);
        expect(mockEventBus.publish).not.toHaveBeenCalled();
    });

    // setCacheAsync and setCache
    it('should call all registered cache update callbacks for setCacheAsync', async () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        serviceClient.bindCache('type1', callback1);
        serviceClient.bindCache('type2', callback2);

        const mockCacheData = { items: ['item1'] };
        await serviceClient['setCacheAsync']('CREATE', async () => mockCacheData);

        expect(callback1).toHaveBeenCalledWith('CREATE', mockCacheData);
        expect(callback2).toHaveBeenCalledWith('CREATE', mockCacheData);
    });

    it('should not call cache update callbacks if no cache is bound for setCacheAsync', async () => {
        const callback = jest.fn();
        await serviceClient['setCacheAsync']('CREATE', async () => ({}));
        expect(callback).not.toHaveBeenCalled();
    });

    it('should call all registered cache update callbacks for setCache', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();
        serviceClient.bindCache('type1', callback1);
        serviceClient.bindCache('type2', callback2);

        const mockCacheData = { items: ['item1'] };
        serviceClient['setCache']('UPDATE', mockCacheData);

        expect(callback1).toHaveBeenCalledWith('UPDATE', mockCacheData);
        expect(callback2).toHaveBeenCalledWith('UPDATE', mockCacheData);
    });

    it('should not call cache update callbacks if no cache is bound for setCache', () => {
        const callback = jest.fn();
        serviceClient['setCache']('UPDATE', {});
        expect(callback).not.toHaveBeenCalled();
    });

    // connected getter
    it('should return true if eventBus is connected', () => {
        expect(serviceClient.connected).toBe(true);
    });

    it('should return false if eventBus is not connected', () => {
        const clientWithoutBus = new TestServiceClient(mockHttpClient);
        expect(clientWithoutBus.connected).toBe(false);
    });

    // connect
    it('should set eventBus, call onConnect, and connect children', () => {
        const newMockEventBus = new MockEventBus();
        const child = new TestServiceClient(mockHttpClient);
        jest.spyOn(child, 'connect');
        serviceClient['register'](child);

        serviceClient.connect(newMockEventBus);

        expect(serviceClient['eventBus']).toBe(newMockEventBus);
        expect(serviceClient.onConnect).toHaveBeenCalledTimes(1);
        expect(child.connect).toHaveBeenCalledWith(newMockEventBus);
    });

    // disconnect
    it('should unsubscribe from all notifications and disconnect children', () => {
        class Notif1 {}
        class Notif2 {}
        serviceClient['bindEvent'](Notif1, async () => {});
        serviceClient['bindEvent'](Notif2, async () => {});

        const child = new TestServiceClient(mockHttpClient);
        jest.spyOn(child, 'disconnect');
        serviceClient['register'](child);

        serviceClient.disconnect();

        expect(mockEventBus.unsubscribe).toHaveBeenCalledWith(Notif1);
        expect(mockEventBus.unsubscribe).toHaveBeenCalledWith(Notif2);
        expect(mockEventBus.unsubscribe).toHaveBeenCalledTimes(2);
        expect(child.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should not attempt to unsubscribe if eventBus is not connected', () => {
        const clientWithoutBus = new TestServiceClient(mockHttpClient);
        clientWithoutBus.disconnect();
        expect(mockEventBus.unsubscribe).not.toHaveBeenCalled();
    });

    // unbindCache
    it('should remove a cache update handler', () => {
        const callback = jest.fn();
        serviceClient.bindCache('testType', callback);
        expect(serviceClient.hasCache).toBe(true);
        serviceClient.unbindCache('testType');
        expect(serviceClient.hasCache).toBe(false);
    });

    // bindCache
    it('should add a cache update handler', () => {
        const callback = jest.fn();
        serviceClient.bindCache('testType', callback);
        expect(serviceClient['cacheUpdates']['testType']).toBe(callback);
    });

    // bindEvent
    it('should subscribe to event bus and store notification', () => {
        class TestEvent {}
        const handler = async () => {};
        serviceClient['bindEvent'](TestEvent, handler);

        expect(mockEventBus.subscribe).toHaveBeenCalledWith(TestEvent, handler);
        expect(serviceClient['notifications'].get('TestEvent')).toBe(TestEvent);
    });

    it('should not subscribe if eventBus is not connected', () => {
        const clientWithoutBus = new TestServiceClient(mockHttpClient);
        class TestEvent {}
        const handler = async () => {};
        clientWithoutBus['bindEvent'](TestEvent, handler);
        expect(mockEventBus.subscribe).not.toHaveBeenCalled();
    });

    // register
    it('should add children to the children array', () => {
        const child1 = new TestServiceClient(mockHttpClient);
        const child2 = new TestServiceClient(mockHttpClient);
        serviceClient['register'](child1, child2);
        expect(serviceClient['children']).toContain(child1);
        expect(serviceClient['children']).toContain(child2);
        expect(serviceClient['children'].length).toBe(2);
    });
});
