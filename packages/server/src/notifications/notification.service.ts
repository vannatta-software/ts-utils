import { IDomainEvent } from '@vannatta-software/ts-utils-domain';
import { ILogger } from '../common/logger';
import { ClientMap } from './client.map';
import { INotifiableClient } from './notifiable.client';

type EventMapper<T> = {
    [K in keyof T]?: string | boolean;
}

export class NotificationService  {
    private logger: ILogger;

    public static _clients: ClientMap = new ClientMap();
    
    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public get clients(): ClientMap {
        return NotificationService._clients;
    }

    public notify<T extends IDomainEvent>(
        event: T, 
        mapping?: EventMapper<T>
    ) {
        const topic = event.constructor.name;
        const payload = mapping ? this.mapEvent(event, mapping) : event;

        this.clients.all().forEach(client => 
            client.send(topic, payload)
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

        sockets.forEach(socket => socket.send(event, body));
    }

    public notifyApp(appID: string, event: string, body: any) {
        const socket = this.clients.getSocket(appID);

        if (socket) {
            socket.send(event, body);
        } else {
            this.logger.warn(`Application with ID ${appID} not found for notification.`);
        }
    }
}
