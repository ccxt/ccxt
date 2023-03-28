import Client from './Client.js';
export default class WsClient extends Client {
    connectionStarted: number;
    protocols: any;
    options: any;
    startedConnecting: boolean;
    createConnection(): void;
    connect(backoffDelay?: number): Promise<any>;
    isOpen(): boolean;
    close(): any;
}
