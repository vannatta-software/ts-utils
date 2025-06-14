import { IEventBus, Integration } from '@vannatta-software/ts-utils-domain';
import { ILogger } from './common/logger';
import { IEventEmitter } from './common/event-emitter';
import { ClassType } from './common/types'; // Import ClassType from common
import { HandlerRegistry } from './handler.registry'; // Keep this for now, will refactor HandlerRegistry next

export abstract class EventBus implements IEventBus {
    protected readonly logger: ILogger;
    private processedEvents = new Set<string>();
    private readonly TTL = 3600 * 1000; // 1 hour in milliseconds

    constructor(logger: ILogger) {
        this.logger = logger;
        setInterval(() => this.cleanupOldEvents(), this.TTL);
    }

    async publish(integration: Integration<any>, topic?: string): Promise<void> {
        const key = this.generateKey(integration);
        
        if (this.processedEvents.has(key)) {
            this.logger.debug(`Skipping duplicate event ${key}`);
            return;
        }

        try {
            await this.handleEvent(integration, topic);
            this.processedEvents.add(key);
        } catch (error: any) {
            this.logger.error(`Failed to handle event ${key}: ${error.message}`, error.stack);
            throw error;
        }
    }

    public abstract subscribe<TData>(topic: string, handler: (data: TData) => Promise<void>): void;
    public abstract unsubscribe<TData = any>(topic: ClassType<TData>): void;
    protected abstract handleEvent(integration: Integration<any>, topic?: string): Promise<void>; 
    
    protected generateKey(integration: Integration): string {
        return `${integration.name}:${integration.eventId}`;
    }

    private cleanupOldEvents() {
        this.processedEvents.clear();
        this.logger.debug('Cleared processed events cache');
    }
}

export class BaseEventBus extends EventBus {
    constructor(
        private readonly registry: HandlerRegistry,
        private readonly eventEmitter: IEventEmitter,
        logger: ILogger
    ) {
        super(logger)
    }

    protected async handleEvent(integration: Integration<any>): Promise<void> {
        const handlers = this.registry.getIntegrationHandlers(integration.name);
        
        this.logger.debug(`Publishing integration ${integration.name} to ${handlers.length} handlers`);
        await Promise.all(handlers.map(h => h.handle(integration.data)));
        
        // Also emit through event emitter for websocket notifications
        this.eventEmitter.emit(integration.name, integration.data);
    }

    public subscribe<TData>(topic: string, handler: (data: TData) => Promise<void>): void {
        this.eventEmitter.on(topic, handler);
        this.logger.debug(`BaseEventBus subscribed to topic: ${topic}`);
    }

    public unsubscribe<TData = any>(topic: ClassType<TData>): void {
        this.eventEmitter.removeAllListeners((topic as any).name);
        this.logger.debug(`BaseEventBus unsubscribed from topic: ${(topic as any).name}`);
    }
}
