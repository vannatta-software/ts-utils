// import { EventBus } from '../event.bus';
// import { HandlerRegistry } from '../handler.registry';
// import { PubSub, Topic, Subscription } from '@google-cloud/pubsub';
// import { ClassType } from '../common/types'; // Use common ClassType
// import { Integration } from '@vannatta-software/ts-utils-domain';
// import { ILogger } from '../common/logger'; // Import ILogger
// import { IEventEmitter } from '../common/event-emitter'; // Import IEventEmitter

// export class GooglePubSubEventBus extends EventBus {
//     private pubSubClient: PubSub;
//     private subscriptions: Map<string, Subscription> = new Map();

//     constructor(
//         private readonly registry: HandlerRegistry,
//         private readonly eventEmitter: IEventEmitter, // Use IEventEmitter
//         logger: ILogger // Inject ILogger
//     ) {
//         super(logger); // Pass logger to super
//         this.pubSubClient = new PubSub({
//             projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
//             credentials: {
//                 client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
//                 private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//             },
//         });
//     }

//     public async connect(): Promise<void> {
//         // For PubSub, connection is typically handled by client instantiation.
//         // We'll ensure topics/subscriptions for existing handlers are set up here.
//         const handlerNames = this.registry.getIntegrationHandlerNames();
//         for (const topicName of handlerNames) {
//             await this.setupSubscription(topicName);
//         }
//         this.logger.log('Google Pub/Sub Event Bus connected and subscribed to handlers.');
//     }

//     public async disconnect(): Promise<void> {
//         for (const [topicName, subscription] of this.subscriptions.entries()) {
//             try {
//                 await subscription.close();
//                 this.logger.log(`Closed subscription for topic: ${topicName}`);
//             } catch (error: any) {
//                 this.logger.error(`Error closing subscription for topic ${topicName}: ${error.message}`, error.stack);
//             }
//         }
//         this.subscriptions.clear();
//         // No explicit client.close() for PubSub client, it manages connections internally.
//         this.logger.log('Google Pub/Sub Event Bus disconnected.');
//     }

//     protected async handleEvent(integration: Integration<any>, topicName?: string): Promise<void> {
//         const targetTopicName = topicName || integration.name;
//         const dataBuffer = Buffer.from(JSON.stringify(integration));

//         try {
//             const messageId = await this.pubSubClient.topic(targetTopicName).publish(dataBuffer);
//             this.logger.debug(`Message ${messageId} published to topic ${targetTopicName}.`);
//             this.eventEmitter.emit(integration.name, integration.data);
//         } catch (error: any) {
//             this.logger.error(`Failed to publish message to topic ${targetTopicName}: ${error.message}`, error.stack);
//             throw error;
//         }
//     }

//     public async subscribe<TData>(topicName: string, handler: (data: TData) => Promise<void>): Promise<void> {
//         if (this.subscriptions.has(topicName)) {
//             this.logger.warn(`Already subscribed to topic: ${topicName}`);
//             return;
//         }
//         await this.setupSubscription(topicName, handler);
//     }

//     public async unsubscribe<TData = any>(topic: ClassType<TData>): Promise<void> {
//         const topicName = (topic as any).name;
//         const subscription = this.subscriptions.get(topicName);
//         if (subscription) {
//             try {
//                 await subscription.close();
//                 this.subscriptions.delete(topicName);
//                 this.logger.log(`Unsubscribed from topic: ${topicName}`);
//             } catch (error: any) {
//                 this.logger.error(`Error unsubscribing from topic ${topicName}: ${error.message}`, error.stack);
//             }
//         } else {
//             this.logger.warn(`No active subscription found for topic: ${topicName}`);
//         }
//     }

//     private async setupSubscription<TData>(topicName: string, handler?: (data: TData) => Promise<void>): Promise<void> {
//         const topic: Topic = this.pubSubClient.topic(topicName);
//         const subscriptionName = `${topicName}-subscription-${process.env.NODE_ENV || 'development'}`;
//         let subscription: Subscription;

//         try {
//             await topic.get({ autoCreate: true });
//             this.logger.debug(`Topic ${topicName} ensured.`);

//             [subscription] = await topic.createSubscription(subscriptionName, {
//                 ackDeadlineSeconds: 60,
//                 enableMessageOrdering: false,
//             });
//             this.logger.debug(`Subscription ${subscriptionName} ensured for topic ${topicName}.`);
//         } catch (e: any) {
//             if (e.code === 6) { // ALREADY_EXISTS
//                 subscription = this.pubSubClient.subscription(subscriptionName);
//                 this.logger.debug(`Subscription ${subscriptionName} already exists.`);
//             } else {
//                 this.logger.error(`Error ensuring topic or subscription for ${topicName}: ${e.message}`, e.stack);
//                 throw e;
//             }
//         }

//         subscription.on('message', async (message) => {
//             try {
//                 const integration = JSON.parse(message.data.toString()) as Integration<TData>;
//                 this.logger.debug(`Received message from ${topicName}: ${JSON.stringify(integration)}`);

//                 const handlers = this.registry.getIntegrationHandlers(integration.name);
//                 await Promise.all(handlers.map(h => h.handle(integration.data)));

//                 if (handler) {
//                     await handler(integration.data);
//                 }

//                 this.eventEmitter.emit(integration.name, integration.data);

//                 message.ack();
//             } catch (error: any) {
//                 this.logger.error(`Error processing Pub/Sub message for topic ${topicName}: ${error.message}`, error.stack);
//                 message.nack();
//             }
//         });

//         subscription.on('error', (error: any) => {
//             this.logger.error(`Error on subscription ${subscriptionName} for topic ${topicName}: ${error.message}`, error.stack);
//         });

//         this.subscriptions.set(topicName, subscription);
//     }
// }
