import { Entity, IEntity } from "./Entity";

interface IAggregateRoot extends IEntity {}

export abstract class AggregateRoot extends Entity implements IAggregateRoot {}
