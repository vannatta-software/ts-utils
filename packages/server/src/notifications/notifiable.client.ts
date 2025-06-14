export interface INotifiableClient {
    clientId: string;
    send(event: string, data: any): void;
}
