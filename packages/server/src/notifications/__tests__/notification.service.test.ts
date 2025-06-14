import { NotificationService } from '../notification.service';
import { ILogger } from '../../common/logger';
import { ClientMap } from '../client.map';
import { IDomainEvent } from '@vannatta-software/ts-utils-domain';
import { INotifiableClient } from '../notifiable.client';

// Mock IDomainEvent
class MockDomainEvent implements IDomainEvent {
    public dateTimeOccurred: Date = new Date();
    constructor(public data: string, public sensitiveInfo?: string) {}
}

describe('NotificationService', () => {
    let notificationService: NotificationService;
    let mockLogger: jest.Mocked<ILogger>;
    let mockClientMap: jest.Mocked<ClientMap>;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as jest.Mocked<ILogger>;

        // Reset static properties before each test
        (NotificationService as any)._clients = new ClientMap(); // Re-initialize ClientMap

        // Mock ClientMap methods
        mockClientMap = NotificationService._clients as jest.Mocked<ClientMap>;
        mockClientMap.all = jest.fn();
        mockClientMap.getSockets = jest.fn();
        mockClientMap.getSocket = jest.fn();

        notificationService = new NotificationService(mockLogger);
    });

    describe('notify (domain event)', () => {
        it('should notify all clients with the event payload if no mapping is provided', () => {
            const event = new MockDomainEvent('some data');
            const mockClient1 = { clientId: 'client1', send: jest.fn() } as INotifiableClient;
            const mockClient2 = { clientId: 'client2', send: jest.fn() } as INotifiableClient;
            mockClientMap.all.mockReturnValue([mockClient1, mockClient2]);

            notificationService.notify(event);

            expect(mockClientMap.all).toHaveBeenCalledTimes(1);
            expect(mockClient1.send).toHaveBeenCalledWith('MockDomainEvent', event);
            expect(mockClient2.send).toHaveBeenCalledWith('MockDomainEvent', event);
            expect(mockLogger.debug).toHaveBeenCalledWith('Domain event notification sent: MockDomainEvent');
        });

        it('should notify all clients with mapped event payload', () => {
            const event = new MockDomainEvent('some data', 'secret');
            const mapping = { data: true, sensitiveInfo: 'mappedSensitive' };
            const mockClient = { clientId: 'client1', send: jest.fn() } as INotifiableClient;
            mockClientMap.all.mockReturnValue([mockClient]);

            notificationService.notify(event, mapping);

            expect(mockClient.send).toHaveBeenCalledWith('MockDomainEvent', {
                data: 'some data',
                mappedSensitive: 'secret',
            });
            expect(mockLogger.debug).toHaveBeenCalledWith('Domain event notification sent: MockDomainEvent');
        });

        it('should handle empty mapping correctly', () => {
            const event = new MockDomainEvent('some data', 'secret');
            const mapping = {};
            const mockClient = { clientId: 'client1', send: jest.fn() } as INotifiableClient;
            mockClientMap.all.mockReturnValue([mockClient]);

            notificationService.notify(event, mapping);

            expect(mockClient.send).toHaveBeenCalledWith('MockDomainEvent', {});
        });
    });

    describe('notifyUser', () => {
        it('should notify all clients for a given user ID', () => {
            const userId = 'user123';
            const eventName = 'userUpdate';
            const body = { message: 'Your profile was updated' };
            const mockClient1 = { clientId: 'client1', send: jest.fn() } as INotifiableClient;
            const mockClient2 = { clientId: 'client2', send: jest.fn() } as INotifiableClient;
            mockClientMap.getSockets.mockReturnValue([mockClient1, mockClient2]);

            notificationService.notifyUser(userId, eventName, body);

            expect(mockClientMap.getSockets).toHaveBeenCalledWith(userId);
            expect(mockClient1.send).toHaveBeenCalledWith(eventName, body);
            expect(mockClient2.send).toHaveBeenCalledWith(eventName, body);
        });

        it('should do nothing if no clients are found for the user ID', () => {
            const userId = 'nonExistentUser';
            const eventName = 'userUpdate';
            const body = { message: 'Your profile was updated' };
            mockClientMap.getSockets.mockReturnValue([]);

            notificationService.notifyUser(userId, eventName, body);

            expect(mockClientMap.getSockets).toHaveBeenCalledWith(userId);
            // No send calls should occur
        });
    });

    describe('notifyApp', () => {
        it('should notify the client for a given app ID if found', () => {
            const appID = 'app456';
            const eventName = 'appStatus';
            const body = { status: 'online' };
            const mockClient = { clientId: 'client1', send: jest.fn() } as INotifiableClient;
            mockClientMap.getSocket.mockReturnValue(mockClient);

            notificationService.notifyApp(appID, eventName, body);

            expect(mockClientMap.getSocket).toHaveBeenCalledWith(appID);
            expect(mockClient.send).toHaveBeenCalledWith(eventName, body);
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it('should log a warning if no client is found for the app ID', () => {
            const appID = 'nonExistentApp';
            const eventName = 'appStatus';
            const body = { status: 'offline' };
            mockClientMap.getSocket.mockReturnValue(undefined);

            notificationService.notifyApp(appID, eventName, body);

            expect(mockClientMap.getSocket).toHaveBeenCalledWith(appID);
            expect(mockLogger.warn).toHaveBeenCalledWith(`Application with ID ${appID} not found for notification.`);
        });
    });
});
