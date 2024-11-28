export interface UpdateState {
    updateTimeout: number;
    isUpdating: boolean;
  }
  
  export interface UpdateActions {
    setTimeout(timeout: number): void;
    start(): any; // returns Node.Timeout
    stop(): void;
  }
  
  export class UpdateHandler<TNode> implements UpdateActions {
    private _needsUpdate: Record<string, TNode>;
    private _updateInterval: NodeJS.Timeout | undefined; // Node.Interval
    public state: UpdateState;
  
    constructor(
      private _onUpdate: (updates: Record<string, TNode>) => void,
      private _initialTimeout: number
    ) {
      this._needsUpdate = {};
      this.state = {
        updateTimeout: _initialTimeout,
        isUpdating: false
      };
    }
  
    public setTimeout(timeout: number): void {
      const updateTimeout = timeout > 0 ? timeout : this._initialTimeout;
  
      if (updateTimeout !== this.state.updateTimeout && this.state.isUpdating) {
        this.stop();
        this.start();
      }
  
      this.state.updateTimeout = updateTimeout;
    }
  
    public start(): void {
      if (this.state.isUpdating) return;
  
      this._updateInterval = setInterval(() => {
        this._onUpdate(this._needsUpdate);
        this._needsUpdate = {};
      }, this.state.updateTimeout);
  
      this.state.isUpdating = true;
    }
  
    public stop(): void {
      if (this._updateInterval) {
        clearInterval(this._updateInterval);
      }
      this.state.isUpdating = false;
    }
  
    public add(id: string, node: TNode): void {
      this._needsUpdate[id] = node;
    }
  
    public remove(id: string): void {
      delete this._needsUpdate[id];
    }
  }
  