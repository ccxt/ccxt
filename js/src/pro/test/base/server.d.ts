declare class WebSocketServer {
    constructor(config?: {});
    onConnection(ws: any, request: any): void;
    error(ws: any): void;
    onUpgrade(request: any, socket: any, head: any): void;
}
export default WebSocketServer;
