// Domain Event
export interface IDomainEvent {
    dateTimeOccurred: Date; 
}

export interface IDomainEventPublisher {
    publish<T extends IDomainEvent>(event: T): Promise<void>;
}