export class EventObserver<T = any> {
    public simple: boolean = false;
    private _onUpdate: (event: T) => void = () => {};
    private _onDestroy: () => void = () => {};
  
    constructor(public id: string) {}
  
    /**
     * Sets the handler for the update event.
     */
    public onUpdate(handler: (event: T) => void): this {
      this._onUpdate = handler;
      return this;
    }
  
    /**
     * Sets the handler for the destroy event.
     */
    public onDestroy(handler: () => void): this {
      this._onDestroy = handler;
      return this;
    }
  
    /**
     * Triggers the update event.
     */
    public update(event: T): void {
      this._onUpdate(event);
    }
  
    /**
     * Triggers the destroy event.
     */
    public destroy(): void {
      this._onDestroy();
    }
  }
  
  export type EventRecord<T = any> = {
    [id: string]: EventObserver<T>[];
  };
  
  export class EventSource<T = any> {
    private _observers: EventObserver<T>[] = [];
    private _record: EventRecord<T> = {};
  
    /**
     * Adds an observer to the event source.
     */
    public addObserver(observer: EventObserver<T>): void {
      if (!this._record[observer.id]) {
        this._record[observer.id] = [];
      }
  
      this._record[observer.id].push(observer);
      this._observers.push(observer);
    }
  
    /**
     * Removes all observers associated with a specific ID.
     */
    public removeObservers(id: string): void {
      if (!this._record[id]) return;
  
      this._record[id].forEach((observer) => observer.destroy());
      this._observers = this._observers.filter((observer) => observer.id !== id);
      delete this._record[id];
    }
  
    /**
     * Removes a specific observer.
     */
    public removeObserver(observer: EventObserver<T>): void {
      observer.destroy();
  
      this._observers = this._observers.filter((o) => o !== observer);
  
      if (this._record[observer.id]) {
        this._record[observer.id] = this._record[observer.id].filter((o) => o !== observer);
  
        if (this._record[observer.id].length === 0) {
          delete this._record[observer.id];
        }
      }
    }
  
    /**
     * Retrieves all observers associated with a specific ID.
     */
    public getObservers(id: string): EventObserver<T>[] {
      return this._record[id] || [];
    }
  
    /**
     * Notifies all observers of an event, optionally filtered by ID.
     */
    public notify(event: T, id?: string): EventObserver<T>[] {
      const notifiedObservers: EventObserver<T>[] = [];
  
      this._observers.forEach((observer) => {
        if (id && observer.id !== id) return;
  
        observer.update(event);
        notifiedObservers.push(observer);
      });
  
      return notifiedObservers;
    }
  
    /**
     * Convenience method to add and set up an observer for updates.
     */
    public onUpdate(id: string, handler: (event: T) => void): EventObserver<T> {
      const observer = new EventObserver<T>(id).onUpdate(handler);
      this.addObserver(observer);
      return observer;
    }
  
    /**
     * Removes all observers.
     */
    public clearAllObservers(): void {
      this._observers.forEach((observer) => observer.destroy());
      this._observers = [];
      this._record = {};
    }
  }
  