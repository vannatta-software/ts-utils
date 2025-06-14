import { ClassType } from "@vannatta-software/ts-utils-core";
import { GlobalIdentifier } from "./GlobalIdentifier";
import { Model } from "./Model";
import { IDomainEvent } from "./Events";

export type DTO<T> = Omit<T, "validation" | "copy" | "copyArray" | "_domainEvents" | "validate">;

export abstract class Command<TResult = void> extends Model {
    readonly __resultType?: TResult; // Phantom type for result inference
}

export abstract class Query<TResult> extends Model {
    readonly __resultType?: TResult; // Phantom type for result inference
}

export class Integration<TData = any> {
    public readonly name: string;
    public readonly data: TData;
    public readonly eventId: string;
    
    constructor(data: TData, type: ClassType<TData>) {
        this.name = typeof type == "string" ? type : new type().constructor.name;
        this.data = data;
        this.eventId = GlobalIdentifier.newGlobalIdentifier().value;
    }
}

export interface IIntegrationHandler<T extends any> {
    handle(event: T): Promise<void>;
}

export interface ICommandHandler<T extends Command<any>> {
    handle(command: T):  Promise<T extends Command<infer R> ? R : never>;
}

export interface IQueryHandler<T extends Query<any>> {
    handle(query: T): Promise<T extends Query<infer R> ? R : never>;
}

export interface IEventHandler<T extends IDomainEvent> {
    handle(event: T): Promise<void>;
}

export const Symbols = {
    EventBus: Symbol('EVENT_BUS')
}

