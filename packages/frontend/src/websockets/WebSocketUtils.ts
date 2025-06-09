import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ServiceHub } from '../ServiceConnection';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from "uuid";
import { StringUtils, ClassType } from '@vannatta-software/ts-utils-core';

type WebSocketConnections = { [key: string]: WebSocketConnection }
type WebSocketStatus ={ [key: string]: boolean }
export type WebSockets = { [key: string]: WebSocketConnection };

export class WebSocketService {
    public connections: WebSocketConnections;

    constructor(connections?: WebSocketConnections) {
        if (connections)
            this.connections = connections;
        else 
            this.connections = <WebSocketConnections> {};
    }

    public get isActive() {
        let connected = true;

        this.forEach(connection => {
            connected = connected && connection.active;
        })

        return connected;
    }

    public get isConnected() {
        let connected = true;

        this.forEach(connection => {
            connected = connected && connection.connected;
        })

        return connected;
    }

    public get status(): WebSocketStatus {
        let status = <WebSocketStatus> {};        

        Object.keys(this.connections).forEach(key => {
            status[key] = this.connections[key].active;
        });

        return status;
    }

    public disconnect(): Promise<WebSocketConnections> {
        let promises: Promise<any>[] = [];   

        this.forEach(connection => promises.push(connection.forget()));

        return Promise.all(promises).then(() => this.connections);
    }
    
    public connect(): Promise<WebSocketConnections> {     
        let promises: Promise<any>[] = [];   

        this.forEach(connection => promises.push(connection.remember()));

        return Promise.all(promises).then(() => this.connections);
    }    

    public forEach(callback: (hub: WebSocketConnection) => void) {
        Object.keys(this.connections).forEach(key => callback(this.connections[key]));
    }
}

export abstract class WebSocketConnection {
    public static retryTimeout = 1000;
    public baseAddress: string;
    public address: string;
    public connected: boolean;
    public active: boolean;
    public identified: boolean;
    public name: string;

    constructor(
        serviceHub: ServiceHub
    ) {
        this.connected = false;
        this.baseAddress = serviceHub.baseAddress;
        this.address = serviceHub.address;
        this.name = serviceHub.name;
    }

    protected abstract onStart(): Promise<boolean>;
    protected abstract onStop(): Promise<boolean>;
    protected abstract onRemember(): Promise<boolean>;
    protected abstract onForget(): Promise<boolean>;
    protected abstract onLogin(userId: string): Promise<boolean>;
    protected abstract onLogout(userId: string): Promise<boolean>;
    protected abstract addHandler<T>(id: string, response: (data: T) => void);
    protected abstract removeHandler(id: string);
    public abstract retry();

    protected _retryHandler: () => void = () => {};
    
    public onRetry(retry: () => any) {
        this._retryHandler = retry;
        this.retry();
    }

    public on<T = any>(e: ClassType<T>, response: (data: T) => void) {
        this.addHandler(StringUtils.className(e), response);
    }

    public off<T = any>(e: ClassType<T>) {
        this.removeHandler(StringUtils.className(e));
    }

    public start(): Promise<WebSocketConnection> {
        return this.onStart().then(status => {
            this.active = true;

            return this;
        });
    }

    public stop(): Promise<WebSocketConnection> {
        return this.onStop().then(status => {
            this.active = false;

            return this;
        });
    }

    public remember(): Promise<WebSocketConnection> {
        return this.onRemember().then(status => {
            this.connected = true;

            return this;
        });
    }

    public forget(): Promise<WebSocketConnection> {
        return this.onForget().then(status => {
            this.connected = false;

            return this;
        });
    }

    public login(userId: string): Promise<WebSocketConnection> {
        return this.onLogin(userId).then(status => {
            this.identified = true;

            return this;
        });
    }

    public logout(userId: string): Promise<WebSocketConnection> {
        return this.onLogout(userId).then(status => {
            this.identified = false;

            return this;
        });
    }
    
    public static get instanceId () {    
        let instanceId = localStorage.getItem("app-instance")

        if (instanceId == null) {
            const id = uuid();

            localStorage.setItem("app-instance", id);
            instanceId = id;
        }

        return instanceId;
    }
}

export class SignalRConnection extends WebSocketConnection {
    public hub: HubConnection;

    constructor(serviceHub: ServiceHub) {
        super(serviceHub);
        this.hub = new HubConnectionBuilder()
            .withUrl(this.address)
            .build();

        this.hub.onclose(() => this.connected = false);
        this.hub.onreconnected(() => this.connected = false);
    }

    public onStart(): Promise<any> {
        return this.hub.start();
    }

    public onStop(): Promise<any> { 
        return this.hub.stop();
    }

    public onRemember() {
        return this.hub.invoke("connect", WebSocketConnection.instanceId);   
    }

    public onForget() {
        return this.hub.invoke("disconnect", WebSocketConnection.instanceId);
    }

    public onLogin(userId: string) {
        return this.hub.invoke("identify", userId, WebSocketConnection.instanceId);
    }

    public onLogout(userId: string) {
        return this.hub.invoke("forget", userId);
    }

    public addHandler<T>(id: string, response: (data: T) => void) {
        this.hub.on(id, response);
    }

    public removeHandler(id: string) {
        this.hub.off(id)
    }

    public retry() {
        this.hub.onclose(this._retryHandler);
    }
}

export class SocketIOConnection extends WebSocketConnection {
    public socket: Socket;

    constructor(private serviceHub: ServiceHub) {
        super(serviceHub);
    }

    public onStart() {
        return new Promise<boolean>(resolve => {
            this.socket = io(this.serviceHub.baseAddress, { 
                path: this.serviceHub.hub,
                timeout: WebSocketConnection.retryTimeout,
                autoConnect: false 
            })
            this.socket.on("disconnect", () => {
                this.onStop();
                this._retryHandler();
            });
            this.socket.open();
            
            resolve(true);
        })
    }

    public onStop() { 
        return new Promise<boolean>(resolve => {
            this.socket.disconnect();
            this.socket.close();
            
            resolve(true);
        })
    }

    public onRemember() {
        return new Promise<boolean>(resolve => {
            this.socket.emit("remember", WebSocketConnection.instanceId);   
            
            resolve(true);
        })
    }

    public onForget() {
        return new Promise<boolean>(resolve => {
            this.socket.emit("forget", WebSocketConnection.instanceId);   
            
            resolve(true);
        })
    }

    public onLogin(userId: string) {
        return new Promise<boolean>(resolve => {
            this.socket.emit("login", userId);   
            
            resolve(true);
        })
    }

    public onLogout(userId: string) {
        return new Promise<boolean>(resolve => {
            this.socket.emit("logout", userId);   
            
            resolve(true);
        })
    }

    public addHandler<T>(id: string, response: (data: T) => void) {
        this.socket.on(id, response);
    }

    public removeHandler(id: string) {
        this.socket.off(id)
    }

    public retry() {
    }
}
