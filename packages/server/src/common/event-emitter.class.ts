import { IEventEmitter } from './event-emitter';
import { EventEmitter as NodeEventEmitter } from 'events';

export class EventEmitter implements IEventEmitter {
    private emitter: NodeEventEmitter;

    constructor() {
        this.emitter = new NodeEventEmitter();
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return this.emitter.emit(event, ...args);
    }

    on(event: string | symbol, listener: (...args: any[]) => void): this {
        this.emitter.on(event, listener);
        return this;
    }

    off(event: string | symbol, listener: (...args: any[]) => void): this {
        this.emitter.off(event, listener);
        return this;
    }

    removeAllListeners(event?: string | symbol): this {
        this.emitter.removeAllListeners(event);
        return this;
    }
}
