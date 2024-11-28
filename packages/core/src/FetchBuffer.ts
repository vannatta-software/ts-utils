export class FetchBuffer {
    private _canAttempt: boolean;
    private _waitTime: number;
    private _timeout: NodeJS.Timeout | null;
  
    constructor(wait: number) {
      this._waitTime = wait > 0 ? wait : 1;
      this._canAttempt = true;
      this._timeout = null;
    }
  
    /**
     * Indicates if an attempt can currently be made.
     */
    public get canAttempt(): boolean {
      return this._canAttempt;
    }
  
    /**
     * Attempts to execute the callback. If `canAttempt` is false, it does nothing.
     */
    public attempt(callback: () => void): void {
      if (!this._canAttempt) return;
  
      if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
      }
  
      this._canAttempt = false;
      this._timeout = setTimeout(() => {
        this._canAttempt = true;
      }, this._waitTime);
  
      callback();
    }
  
    /**
     * Cancels the current timeout and resets the state, allowing immediate attempts.
     */
    public cancel(): void {
      this._canAttempt = true;
      if (this._timeout) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }
    }
  
    /**
     * Dynamically updates the wait time.
     */
    public setWaitTime(wait: number): void {
      if (wait <= 0) {
        throw new Error('Wait time must be greater than 0.');
      }
      this._waitTime = wait;
    }
  }
  