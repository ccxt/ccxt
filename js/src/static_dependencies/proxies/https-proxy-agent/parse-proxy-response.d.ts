/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
export interface ConnectResponse {
    statusCode: number;
    statusText: string;
    headers: IncomingHttpHeaders;
}
export declare function parseProxyResponse(socket: Readable): Promise<{
    connect: ConnectResponse;
    buffered: Buffer;
}>;
