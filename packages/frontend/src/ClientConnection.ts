import { Socket } from "socket.io-client";

export class ClientMap {
    public users: Record<string, Socket[]>;
    public applications: Record<string, Socket>;
    public sockets: Record<string, Socket>;

    constructor( ) {
        this.sockets = {}
        this.applications = {}
        this.users = {}
    }

    public connect(socket: Socket) {
        this.sockets[socket.id ?? ""] = socket;
    }

    public disconnect(socket: Socket) {
        try {
            delete this.sockets[socket.id ?? ""];

            Object.keys(this.applications).forEach(app => {
                if (this.applications[app].id == socket.id)
                    delete this.applications[app]
            })
            
            Object.keys(this.users).forEach(user => {
                this.users[user] = this.users[user].filter(s => s.id != socket.id)
            })
        } catch {
        }
    }

    public remember(socket: Socket, app: string) {
        this.applications[app] = socket;
    }   

    public forget(app: string) {
        delete this.applications[app];
    }

    public login(socket: Socket, userId: string) {  
        this.users[userId] = this.users[userId]?.filter(s => s.id != socket.id);
        this.getSockets(userId).push(socket);
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

    public getSockets(userId: string): Socket[] {
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
        Object.keys(this.sockets).forEach((socket) => {
            result += `  ${socket}\n`;
        });

        result += `Applications: ${Object.keys(this.applications).length} \n`;
        Object.keys(this.applications).forEach((app) => {
            result += `  ${app}: ${this.applications[app].id}\n`;
        });

        result += `Users: ${Object.keys(this.users).length} \n`;
        Object.keys(this.users).forEach((user) => {
            result += `  ${user}: [${this.users[user].map(s => s.id).join(', ')}]\n`;
        });

        return result;
    }
}