import { IDomainEvent } from '@vannatta-software/ts-utils-domain';
import { ILogger } from '../common/logger';
import { ClientMap } from '../websockets/client.map'; // Import ClientMap from its new location
import { Server } from 'socket.io'; // Use Server directly

type EventMapper<T> = {
    [K in keyof T]?: string | boolean;
}

export class NotificationService  {
    private logger: ILogger;

    private static _server: Server; // Use concrete Server
    public static _clients: ClientMap = new ClientMap();
    
    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public get clients(): ClientMap {
        return NotificationService._clients;
    }

    public get server(): Server { // Use concrete Server
        return NotificationService._server;
    }

    public initialize(server: Server) { // Take concrete Server
        if (!NotificationService._server) { // Only log if server is being initialized for the first time
            NotificationService._server = server;
            this.logger.log("NotificationService initialized");
        }
    }

    public notify<T extends IDomainEvent>(
        event: T, 
        mapping?: EventMapper<T>
    ) {
        const topic = event.constructor.name;
        const payload = mapping ? this.mapEvent(event, mapping) : event;

        this.clients.all().forEach(client => 
            client.emit(topic, payload)
        );

        this.logger.debug(`Domain event notification sent: ${topic}`);
    }

    private mapEvent<T extends IDomainEvent>(
        event: T, 
        mapping: EventMapper<T>
    ): Partial<T> {
        const result: Partial<T> = {};

        Object.entries(mapping).forEach(([key, value]) => {
            if (value === true) {
                // Keep original field name and value
                result[key as keyof T] = event[key as keyof T];
            } else if (typeof value === 'string') {
                // Map to new field name
                result[value as keyof T] = event[key as keyof T];
            }
        });

        return result;
    }

    public notifyUser(userId: string, event: string, body: any) {
        const sockets = this.clients.getSockets(userId);

        sockets.forEach(socket => socket.emit(event, body));
    }

    public notifyApp(appID: string, event: string, body: any) {
        const socket = this.clients.getSocket(appID);

        if (socket) {
            socket.emit(event, body);
        } else {
            this.logger.warn(`Application with ID ${appID} not found for notification.`);
        }
    }
}
