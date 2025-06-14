import { HandlerRegistry } from './handler.registry';
import { Command, DTO, Entity, IDomainEvent, Model, Query } from '@vannatta-software/ts-utils-domain';
import { ApiException } from './common/exceptions/api.exception';
import { ILogger } from './common/logger';
import { IEventEmitter } from './common/event-emitter';
import { ClassType } from './common/types'; // Use generic ClassType from common

export class Mediator {
    private logger: ILogger;

    constructor(
        private readonly registry: HandlerRegistry,
        private readonly eventEmitter: IEventEmitter,
        logger: ILogger
    ) {
        this.logger = logger;
    }
    
    private validate(model: Model): void {
        const validation = Model.validate(model);

        if (!validation.isValid) {
            throw new ApiException('Validation failed', validation.errors);
        }
    }

    async sendCommand<T extends Command<any>>(
        data: DTO<T>,
        type: ClassType<T>
    ): Promise<T extends Command<infer R> ? R : never> {
        const command = new type();
        Object.assign(command, data);

        this.validate(command);

        const handler = this.registry.getCommandHandler(command.constructor.name);
        if (!handler) {
            throw new ApiException(`No handler found for command ${command.constructor.name}`);
        }
        
        this.logger.debug(`Executing command ${command.constructor.name}`);

        return handler.handle(command) as T extends Command<infer R> ? R : never;
    }

    async sendQuery<T extends Query<any>>(
        data: DTO<T>,
        type: ClassType<T>
    ): Promise<T extends Query<infer R> ? R : never> {
        const query = new type();
        Object.assign(query, data);

        this.validate(query);

        const handler = this.registry.getQueryHandler(query.constructor.name);
        if (!handler) {
            throw new ApiException(`No handler found for query ${query.constructor.name}`);
        }

        this.logger.debug(`Executing query ${query.constructor.name}`);

        return handler.handle(query) as T extends Query<infer R> ? R : never;
    }

    async publishEvent(event: IDomainEvent): Promise<void> {
        const handlers = this.registry.getEventHandlers(event.constructor.name);
        
        this.logger.debug(`Publishing event ${event.constructor.name} to ${handlers.length} handlers`);
        await Promise.all(handlers.map(h => h.handle(event)));
        
        // Also emit through event emitter for websocket notifications
        this.eventEmitter.emit(event.constructor.name, event);
    }

    async publishEvents(entity: Entity) {
        const promises: Promise<void>[] = [];

        entity.domainEvents.forEach(event => {
            promises.push(this.publishEvent(event));
        });
        
        entity.clearDomainEvents();
        await Promise.all(promises);
    }
}
