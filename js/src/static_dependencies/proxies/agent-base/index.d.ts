/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import * as net from 'net';
import * as tls from 'tls';
import * as http from 'http';
import { Duplex } from 'stream';
export * from './helpers.js';
interface HttpConnectOpts extends net.TcpNetConnectOpts {
    secureEndpoint: false;
    protocol?: string;
}
interface HttpsConnectOpts extends tls.ConnectionOptions {
    secureEndpoint: true;
    protocol?: string;
    port: number;
}
export declare type AgentConnectOpts = HttpConnectOpts | HttpsConnectOpts;
declare const INTERNAL: unique symbol;
export declare abstract class Agent extends http.Agent {
    private [INTERNAL];
    options: Partial<net.TcpNetConnectOpts & tls.ConnectionOptions>;
    keepAlive: boolean;
    constructor(opts?: http.AgentOptions);
    abstract connect(req: http.ClientRequest, options: AgentConnectOpts): Promise<Duplex | http.Agent> | Duplex | http.Agent;
    createSocket(req: http.ClientRequest, options: AgentConnectOpts, cb: (err: Error | null, s?: Duplex) => void): void;
    createConnection(): Duplex;
    get defaultPort(): number;
    set defaultPort(v: number);
    get protocol(): string;
    set protocol(v: string);
}
