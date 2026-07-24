import Client from './Client.js';
export default class WsClient extends Client {
    connectionStarted: number | undefined;
    protocols: any;
    options: any;
    duplex: any;
    startedConnecting: boolean;
    createConnection(): void;
    onConnectionOpen(): void;
    deliverLoop(): Promise<void>;
    connect(backoffDelay?: number): Promise<any>;
    isOpen(): boolean;
    close(): import("./Future.js").FutureInterface;
}
