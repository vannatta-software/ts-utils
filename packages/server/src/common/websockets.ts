export interface IWebSocketClient {
    id: string;
    emit(event: string, ...args: any[]): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
}

export interface IWebSocketServer {
    emit(event: string, ...args: any[]): boolean;
    to(room: string): { emit(event: string, ...args: any[]): boolean };
    onConnection(listener: (client: IWebSocketClient, ...args: any[]) => void): void;
}
