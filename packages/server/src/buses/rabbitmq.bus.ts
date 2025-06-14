import { EventBus } from '../event.bus';
import { HandlerRegistry } from '../handler.registry';
import { Connection, Channel, connect } from 'amqplib';
import { ClassType } from '../common/types'; // Use common ClassType
import { Integration } from '@vannatta-software/ts-utils-domain';
import { ILogger } from '../common/logger'; // Import ILogger
import { IEventEmitter } from '../common/event-emitter'; // Import IEventEmitter

export class RabbitMQEventBus extends EventBus {
    private connection: Connection;
    private channel: Channel;
    private subscriptions: Map<string, { handler: (msg: any) => Promise<void>, consumerTag: string }> = new Map();

    constructor(
        private readonly registry: HandlerRegistry,
        private readonly eventEmitter: IEventEmitter, // Use IEventEmitter
        logger: ILogger // Inject ILogger
    ) {
        super(logger); // Pass logger to super
    }

    public async connect(url: string): Promise<void> {
        this.connection = await connect(url) as unknown as Connection; // Cast to unknown first
        this.channel = await (this.connection as any).createChannel();
        this.logger.log('RabbitMQ Event Bus connected.');
    }

    public async disconnect(): Promise<void> {
        for (const [topicName, subscriptionInfo] of this.subscriptions.entries()) {
            try {
                await this.channel.cancel(subscriptionInfo.consumerTag);
                this.logger.log(`Cancelled consumer for topic: ${topicName}`);
            } catch (error: any) {
                this.logger.error(`Error cancelling consumer for topic ${topicName} during disconnect: ${error.message}`, error.stack);
            }
        }
        this.subscriptions.clear();
        await this.channel?.close();
        await (this.connection as any)?.close(); // Add as any
        this.logger.log('RabbitMQ Event Bus disconnected.');
    }

    protected async handleEvent(integration: Integration<any>, topicName?: string): Promise<void> {
        const targetTopicName = topicName || integration.name;
        await this.channel.assertQueue(targetTopicName, { durable: true });
        this.channel.sendToQueue(
            targetTopicName,
            Buffer.from(JSON.stringify(integration)),
            { persistent: true }
        );
        this.logger.debug(`Published integration ${targetTopicName} to RabbitMQ.`);
        this.eventEmitter.emit(integration.name, integration.data);
    }

    public async subscribe<TData>(topicName: string, handler: (data: TData) => Promise<void>): Promise<void> {
        if (this.subscriptions.has(topicName)) {
            this.logger.warn(`Already subscribed to topic: ${topicName}`);
            return;
        }
        await this.setupSubscription(topicName, handler);
    }

    private async setupSubscription<TData>(topicName: string, handler?: (data: TData) => Promise<void>): Promise<void> {
        await this.channel.assertQueue(topicName, { durable: true });
        const consumerTag = `${topicName}-consumer-${process.env.NODE_ENV || 'development'}`;

        const messageHandler = async (msg: any) => {
            if (!msg) return;
            
            try {
                const integration = JSON.parse(msg.content.toString()) as Integration<TData>;
                this.logger.debug(`Received message from RabbitMQ topic ${topicName}: ${JSON.stringify(integration)}`);

                const handlers = this.registry.getIntegrationHandlers(integration.name);
                await Promise.all(handlers.map(h => h.handle(integration.data)));

                if (handler) {
                    await handler(integration.data);
                }

                this.eventEmitter.emit(integration.name, integration.data);

                this.channel.ack(msg);
            } catch (error: any) {
                this.logger.error(`Failed to process RabbitMQ message for topic ${topicName}: ${error.message}`, error.stack);
                this.channel.nack(msg);
            }
        };

        const { consumerTag: actualConsumerTag } = await this.channel.consume(topicName, messageHandler, { consumerTag });
        this.subscriptions.set(topicName, { handler: messageHandler, consumerTag: actualConsumerTag });
        this.logger.debug(`RabbitMQ subscribed to topic: ${topicName} with consumer tag: ${actualConsumerTag}`);
    }

    public async unsubscribe<TData = any>(topic: ClassType<TData>): Promise<void> {
        const topicName = (topic as any).name;
        const subscriptionInfo = this.subscriptions.get(topicName);
        if (subscriptionInfo) {
            try {
                await this.channel.cancel(subscriptionInfo.consumerTag);
                this.subscriptions.delete(topicName);
                this.logger.log(`Unsubscribed from topic: ${topicName}`);
            } catch (error: any) {
                this.logger.error(`Error unsubscribing from topic ${topicName}: ${error.message}`, error.stack);
            }
        } else {
            this.logger.warn(`No active subscription found for topic: ${topicName}`);
        }
    }
}
