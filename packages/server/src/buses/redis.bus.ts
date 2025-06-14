// import { EventBus } from '../event.bus';
// import { HandlerRegistry } from '../handler.registry';
// import { Redis } from 'ioredis';
// import { ClassType } from '../common/types'; // Use common ClassType
// import { Integration } from '@vannatta-software/ts-utils-domain';
// import { ILogger } from '../common/logger'; // Import ILogger
// import { IEventEmitter } from '../common/event-emitter'; // Import IEventEmitter

// export class RedisEventBus extends EventBus {
//     private readonly redis: Redis;
//     private readonly subscriber: Redis;
//     private subscriptions: Map<string, (channel: string, message: string) => void> = new Map();

//     constructor(
//         private readonly registry: HandlerRegistry,
//         private readonly eventEmitter: IEventEmitter, // Use IEventEmitter
//         logger: ILogger // Inject ILogger
//     ) {
//         super(logger); // Pass logger to super
//         // Direct instantiation of Redis client, configuration handled by consuming app
//         this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
//         this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
//     }

//     public async connect(url: string): Promise<void> {
//         // Re-initialize Redis clients with provided URL if needed, or assume they are already configured
//         // For simplicity, we'll just log connection here, assuming constructor handles actual connection
//         this.logger.log('Redis Event Bus connected.');

//         const handlerNames = this.registry.getIntegrationHandlerNames();
        
//         for (const topic of handlerNames) {
//             await this.setupSubscription(topic);
//         }

//         this.subscriber.on('message', async (channel, message) => {
//             const messageHandler = this.subscriptions.get(channel);
//             if (messageHandler) {
//                 await messageHandler(channel, message);
//             }
//         });
//         this.logger.log('Redis Event Bus initialized and subscribed to handlers.');
//     }

//     public async disconnect(): Promise<void> {
//         for (const topicName of this.subscriptions.keys()) {
//             try {
//                 await this.subscriber.unsubscribe(topicName);
//                 this.logger.log(`Unsubscribed from topic ${topicName} during disconnect.`);
//             } catch (error: any) {
//                 this.logger.error(`Error unsubscribing from topic ${topicName} during disconnect: ${error.message}`, error.stack);
//             }
//         }
//         this.subscriptions.clear();
//         await this.redis.quit();
//         await this.subscriber.quit();
//         this.logger.log('Redis Event Bus disconnected.');
//     }

//     protected async handleEvent(integration: Integration<any>, topicName?: string): Promise<void> {
//         const targetTopicName = topicName || integration.name;
//         await this.redis.publish(
//             targetTopicName, 
//             JSON.stringify(integration)
//         );
//         this.logger.debug(`Published integration ${targetTopicName} to Redis.`);
//         this.eventEmitter.emit(integration.name, integration.data);
//     }

//     public async subscribe<TData>(topicName: string, handler: (data: TData) => Promise<void>): Promise<void> {
//         if (this.subscriptions.has(topicName)) {
//             this.logger.warn(`Already subscribed to topic: ${topicName}`);
//             return;
//         }
//         await this.setupSubscription(topicName, handler);
//     }

//     private async setupSubscription<TData>(topicName: string, handler?: (data: TData) => Promise<void>): Promise<void> {
//         await this.subscriber.subscribe(topicName);
        
//         const messageHandler = async (channel: string, message: string) => {
//             try {
//                 const integration = JSON.parse(message) as Integration<TData>;
//                 this.logger.debug(`Received message from Redis topic ${topicName}: ${JSON.stringify(integration)}`);

//                 const handlers = this.registry.getIntegrationHandlers(integration.name);
//                 await Promise.all(handlers.map(h => h.handle(integration.data)));

//                 if (handler) {
//                     await handler(integration.data);
//                 }

//                 this.eventEmitter.emit(integration.name, integration.data);
//             } catch (error: any) {
//                 this.logger.error(`Failed to process Redis message for topic ${topicName}: ${error.message}`, error.stack);
//             }
//         };
//         this.subscriptions.set(topicName, messageHandler);
//         this.logger.debug(`Redis subscribed to topic: ${topicName}`);
//     }

//     public async unsubscribe<TData = any>(topic: ClassType<TData>): Promise<void> {
//         const topicName = (topic as any).name;
//         if (this.subscriptions.has(topicName)) {
//             try {
//                 await this.subscriber.unsubscribe(topicName);
//                 this.subscriptions.delete(topicName);
//                 this.logger.log(`Unsubscribed from topic: ${topicName}`);
//             } catch (error: any) {
//                 this.logger.error(`Error unsubscribing from topic ${topicName}: ${error.message}`, error.stack);
//             }
//         } else {
//             this.logger.warn(`No active subscription found for topic: ${topicName}`);
//         }
//     }
// }
