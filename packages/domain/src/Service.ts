import { ClassType, StringUtils, IHttpClient } from "@vannatta-software/ts-utils-core";
import { Integration } from "./CqrsTypes";
import { IEventBus } from "./Events";

export type Cache = { deletions?: string[] }

type CacheAction = "CREATE" | "UPDATE" | "DELETE"
type CacheCallback<T> = (action: CacheAction, cache: T) => void

export interface DomainService {
    onConnect(): void;
    onDisconnect(): void;
}

export interface IServiceClient<T> {
    connect(bus: IEventBus): void; 
    disconnect(): void;
    bindCache(type: string, handler: CacheCallback<T>): void;
    unbindCache(type: string): void;
}

export abstract class DomainService implements DomainService {
    public abstract onStart(): void;
    public abstract onStop(): void;
}   

export abstract class ServiceClient<T> extends DomainService implements IServiceClient<T> {
    protected http: IHttpClient;
    protected eventBus?: IEventBus; // Now optional
    private notifications: Map<string, ClassType<any>>;
    private cacheUpdates: Record<string, CacheCallback<T>>;
    private children: ServiceClient<any>[];

    constructor(httpClient: IHttpClient, eventBus?: IEventBus) { 
        super()
        this.http = httpClient;
        this.eventBus = eventBus;
        this.notifications = new Map<string, ClassType<any>>();
        this.cacheUpdates = {};
        this.children = [];
    }

    public onStart(): void {
        this.children.forEach(child => child.onStart());
    }

    public onStop(): void {
        this.children.forEach(child => child.onStop());
    }

    public get hasCache(): boolean {
        return Object.keys(this.cacheUpdates).length > 0;
    }

    protected publishEvent<TData>(
        event: TData, 
        type: ClassType<TData>,
        topic?: string // Added optional topic
    ): Promise<void> {
        return this.eventBus?.publish(new Integration(event, type), topic);
    }

    protected async setCacheAsync(action: CacheAction, callback: () => Promise<T>): Promise<void> {
        if (!this.hasCache) 
            return;
        const cacheUpdate = await callback();
        Object.values(this.cacheUpdates).forEach(update => update(action, cacheUpdate));
    }

    protected setCache: CacheCallback<T> = (action, cache) => {
        if (!this.hasCache)
            return;

        Object.values(this.cacheUpdates).forEach(update => update(action, cache));
    }

    public get connected(): boolean {
        return this.eventBus !== undefined && this.eventBus !== null;
    }

    public connect(eventBus: IEventBus) {
        this.eventBus = eventBus;
        this.onConnect();
        this.children.forEach(child => child.connect(eventBus))
    }

    public disconnect(): void {
        if (this.eventBus?.unsubscribe) {
            for (const notification of this.notifications) {
                this.eventBus.unsubscribe(notification[1]); // Use the ClassType, not the string name
            }
        }
        
        this.children.forEach(child => child.disconnect())
    }

    public unbindCache(type: string): void {
        delete this.cacheUpdates[type];
    }

    public bindCache(type: string, callback: CacheCallback<T>): void {
        this.cacheUpdates[type] = callback;
    }

    public abstract onConnect(): void;
    public abstract onDisconnect();

    protected bindEvent<T>(e: ClassType<T>, response: (data: T) => Promise<void>): void {
        const topic = StringUtils.className(e);
        this.eventBus?.subscribe(e, response); // Use optional chaining

        this.notifications.set(topic, e); // Store topic name, not ClassType directly
    }

    protected register(...clients: ServiceClient<any>[]) {
        this.children.push(...clients);   
    }
}
