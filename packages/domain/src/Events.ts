import { ClassType } from "@vannatta-software/ts-utils-core";
import { Integration } from "./CqrsTypes";

// Domain Event
export interface IDomainEvent {
    dateTimeOccurred: Date; 
}

export interface IDomainEventPublisher {
    publish<T extends IDomainEvent>(event: T): Promise<void>;
}

export interface IEventBus {
    publish(event: Integration, topic?: string): Promise<void>;
    subscribe<TData = any>(topic: ClassType<TData>, handler: (data: TData) => Promise<void>): void;
    unsubscribe<TData = any>(topic: ClassType<TData>): void;
}