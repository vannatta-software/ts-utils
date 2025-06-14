import { INotifiableClient } from '../notifications/notifiable.client';

export class ClientMap {
    public users: Record<string, INotifiableClient[]>;
    public applications: Record<string, INotifiableClient>;
    public sockets: Record<string, INotifiableClient>;

    constructor( ) {
        this.sockets = {}
        this.applications = {}
        this.users = {}
    }

    public connect(client: INotifiableClient) {
        this.sockets[client.clientId ?? ""] = client;
    }

    public disconnect(client: INotifiableClient) {
        try {
            delete this.sockets[client.clientId ?? ""];

            Object.keys(this.applications).forEach(app => {
                if (this.applications[app].clientId == client.clientId)
                    delete this.applications[app]
            })
            
            Object.keys(this.users).forEach(user => {
                this.users[user] = this.users[user].filter(s => s.clientId != client.clientId)
            })
        } catch {
        }
    }

    public remember(client: INotifiableClient, app: string) {
        this.applications[app] = client;
    }   

    public forget(app: string) {
        delete this.applications[app];
    }

    public login(client: INotifiableClient, userId: string) {  
        this.users[userId] = this.users[userId]?.filter(s => s.clientId != client.clientId);
        this.getSockets(userId).push(client);
    }   

    public logout(userId: string) {
        delete this.users[userId];
    }

    public all() {
        return Object.values(this.sockets)
    }

    public getSocket(appId: string) {
        try {
            return this.applications[appId]
        } catch {
            return undefined;
        }
    }

    public getSockets(userId: string): INotifiableClient[] {
        try {
            if (!this.users[userId])
                this.users[userId] = [];
                
            return this.users[userId]
        } catch {
            return [];
        }
    }

    public toString(): string {
        let result = 'WebSockets:\n';

        result += `Sockets: ${Object.keys(this.sockets).length} \n`;
        Object.keys(this.sockets).forEach((socketId) => {
            result += `  ${this.sockets[socketId].clientId}\n`; // Use clientId for logging
        });

        result += `Applications: ${Object.keys(this.applications).length} \n`;
        Object.keys(this.applications).forEach((app) => {
            result += `  ${app}: ${this.applications[app].clientId}\n`;
        });

        result += `Users: ${Object.keys(this.users).length} \n`;
        Object.keys(this.users).forEach((user) => {
            result += `  ${user}: [${this.users[user].map(s => s.clientId).join(', ')}]\n`;
        });

        return result;
    }
}
