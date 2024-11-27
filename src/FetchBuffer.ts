export class FetchBuffer {
    private _canAttempt: boolean;
    private _waitTime: number;
    private _timeout: any;

    constructor(wait: number) {
        this._waitTime = wait > 0 ? wait : 1;
        this._canAttempt = true;
        this._timeout = undefined;
    }

    public get canAttempt() {
        return this._canAttempt;
    }

    public attempt(callback: () => void) {
        if (!this._canAttempt)
            return;

        this._canAttempt = false;
        this._timeout = setTimeout(() => this._canAttempt = true, this._waitTime);   
        
        callback();
    }    

    public cancel() {
        this._canAttempt = true;
        clearTimeout(this._timeout);
    }
}