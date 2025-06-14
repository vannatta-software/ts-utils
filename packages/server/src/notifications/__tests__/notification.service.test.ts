import { NotificationService } from '../notification.service';
import { ILogger } from '../../common/logger';
import { ClientMap } from '../../websockets/client.map';
import { IDomainEvent } from '@vannatta-software/ts-utils-domain';
import { Server, Socket } from 'socket.io';

// Mock IDomainEvent
class MockDomainEvent implements IDomainEvent {
    public dateTimeOccurred: Date = new Date();
    constructor(public data: string, public sensitiveInfo?: string) {}
}

describe('NotificationService', () => {
    let notificationService: NotificationService;
    let mockLogger: jest.Mocked<ILogger>;
    let mockClientMap: jest.Mocked<ClientMap>;
    let mockSocketServer: jest.Mocked<Server>;

    beforeEach(() => {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as jest.Mocked<ILogger>;

        // Reset static properties before each test
        (NotificationService as any)._server = undefined;
        (NotificationService as any)._clients = new ClientMap(); // Re-initialize ClientMap

        // Mock ClientMap methods
        mockClientMap = NotificationService._clients as jest.Mocked<ClientMap>;
        mockClientMap.all = jest.fn();
        mockClientMap.getSockets = jest.fn();
        mockClientMap.getSocket = jest.fn();

        // Mock Socket.IO Server
        mockSocketServer = {
            sockets: {
                adapter: {
                    sids: new Map(),
                    rooms: new Map(),
                },
            },
            // Add other methods if they are called by NotificationService
            on: jest.fn(),
            emit: jest.fn(),
            // Add dummy properties required by Mocked<Server>
            engine: {} as any,
            httpServer: {} as any,
            _parser: {} as any,
            encoder: {} as any,
            // ... add other missing properties as needed based on TS errors
        } as unknown as jest.Mocked<Server>;

        notificationService = new NotificationService(mockLogger);
    });

    describe('initialize', () => {
        it('should initialize the static server property and log', () => {
            notificationService.initialize(mockSocketServer);
            expect((NotificationService as any)._server).toBe(mockSocketServer); // Access _server directly
            expect(mockLogger.log).toHaveBeenCalledWith('NotificationService initialized');
        });

        it('should not re-initialize the server if already set', () => {
            const initialServer = {} as Server;
            (NotificationService as any)._server = initialServer;
            
            notificationService.initialize(mockSocketServer);
            expect((NotificationService as any)._server).toBe(initialServer); // Access _server directly
            expect(mockLogger.log).not.toHaveBeenCalledWith('NotificationService initialized'); // Should not log again
        });
    });

    describe('notify (domain event)', () => {
        it('should notify all clients with the event payload if no mapping is provided', () => {
            const event = new MockDomainEvent('some data');
            const mockClientSocket1 = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            const mockClientSocket2 = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            mockClientMap.all.mockReturnValue([mockClientSocket1, mockClientSocket2]);

            notificationService.notify(event);

            expect(mockClientMap.all).toHaveBeenCalledTimes(1);
            expect(mockClientSocket1.emit).toHaveBeenCalledWith('MockDomainEvent', event);
            expect(mockClientSocket2.emit).toHaveBeenCalledWith('MockDomainEvent', event);
            expect(mockLogger.debug).toHaveBeenCalledWith('Domain event notification sent: MockDomainEvent');
        });

        it('should notify all clients with mapped event payload', () => {
            const event = new MockDomainEvent('some data', 'secret');
            const mapping = { data: true, sensitiveInfo: 'mappedSensitive' };
            const mockClientSocket = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            mockClientMap.all.mockReturnValue([mockClientSocket]);

            notificationService.notify(event, mapping);

            expect(mockClientSocket.emit).toHaveBeenCalledWith('MockDomainEvent', {
                data: 'some data',
                mappedSensitive: 'secret',
            });
            expect(mockLogger.debug).toHaveBeenCalledWith('Domain event notification sent: MockDomainEvent');
        });

        it('should handle empty mapping correctly', () => {
            const event = new MockDomainEvent('some data', 'secret');
            const mapping = {};
            const mockClientSocket = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            mockClientMap.all.mockReturnValue([mockClientSocket]);

            notificationService.notify(event, mapping);

            expect(mockClientSocket.emit).toHaveBeenCalledWith('MockDomainEvent', {});
        });
    });

    describe('notifyUser', () => {
        it('should notify all sockets for a given user ID', () => {
            const userId = 'user123';
            const eventName = 'userUpdate';
            const body = { message: 'Your profile was updated' };
            const mockSocket1 = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            const mockSocket2 = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            mockClientMap.getSockets.mockReturnValue([mockSocket1, mockSocket2]);

            notificationService.notifyUser(userId, eventName, body);

            expect(mockClientMap.getSockets).toHaveBeenCalledWith(userId);
            expect(mockSocket1.emit).toHaveBeenCalledWith(eventName, body);
            expect(mockSocket2.emit).toHaveBeenCalledWith(eventName, body);
        });

        it('should do nothing if no sockets are found for the user ID', () => {
            const userId = 'nonExistentUser';
            const eventName = 'userUpdate';
            const body = { message: 'Your profile was updated' };
            mockClientMap.getSockets.mockReturnValue([]);

            notificationService.notifyUser(userId, eventName, body);

            expect(mockClientMap.getSockets).toHaveBeenCalledWith(userId);
            // No emit calls should occur
        });
    });

    describe('notifyApp', () => {
        it('should notify the socket for a given app ID if found', () => {
            const appID = 'app456';
            const eventName = 'appStatus';
            const body = { status: 'online' };
            const mockSocket = { emit: jest.fn() } as unknown as jest.Mocked<Socket>; // Cast to unknown first
            mockClientMap.getSocket.mockReturnValue(mockSocket);

            notificationService.notifyApp(appID, eventName, body);

            expect(mockClientMap.getSocket).toHaveBeenCalledWith(appID);
            expect(mockSocket.emit).toHaveBeenCalledWith(eventName, body);
            expect(mockLogger.warn).not.toHaveBeenCalled();
        });

        it('should log a warning if no socket is found for the app ID', () => {
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
