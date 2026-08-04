// Minimal ambient declarations for the 'ws' package.
//
// The installed ws@8 ships no bundled types and @types/ws is not a dependency,
// so under noImplicitAny the `import WebSocket from 'ws'` in WsClient.ts is an
// error (TS7016). We only use the constructor, the readyState constants and
// createWebSocketStream, so declare just that surface rather than pulling in a
// new devDependency.
declare module 'ws' {
    class WebSocket {
        static readonly CONNECTING: number;
        static readonly OPEN: number;
        static readonly CLOSING: number;
        static readonly CLOSED: number;
        readonly readyState: number;
        readonly url: string;
        constructor (address: string, options?: any);
        constructor (address: string, protocols?: any, options?: any);
        on (event: string, listener: (...args: any[]) => void): this;
        once (event: string, listener: (...args: any[]) => void): this;
        off (event: string, listener: (...args: any[]) => void): this;
        removeAllListeners (event?: string): this;
        send (data: any, options?: any, callback?: (err?: Error) => void): void;
        ping (data?: any, mask?: boolean, callback?: (err?: Error) => void): void;
        pong (data?: any, mask?: boolean, callback?: (err?: Error) => void): void;
        close (code?: number, reason?: any): void;
        terminate (): void;
    }
    function createWebSocketStream (websocket: WebSocket, options?: any): any;
    export default WebSocket;
    export { WebSocket, createWebSocketStream };
}
