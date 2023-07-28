import createDebug from 'debug';
import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';

const debug = createDebug('https-proxy-agent:parse-proxy-response');

export interface ConnectResponse {
	statusCode: number;
	statusText: string;
	headers: IncomingHttpHeaders;
}

export function parseProxyResponse(
	socket: Readable
): Promise<{ connect: ConnectResponse; buffered: Buffer }> {
	return new Promise((resolve, reject) => {
		// we need to buffer any HTTP traffic that happens with the proxy before we get
		// the CONNECT response, so that if the response is anything other than an "200"
		// response code, then we can re-play the "data" events on the socket once the
		// HTTP parser is hooked up...
		let buffersLength = 0;
		const buffers: Buffer[] = [];

		function read() {
			const b = socket.read();
			if (b) ondata(b);
			else socket.once('readable', read);
		}

		function cleanup() {
			socket.removeListener('end', onend);
			socket.removeListener('error', onerror);
			socket.removeListener('close', onclose);
			socket.removeListener('readable', read);
		}

		function onclose(err?: Error) {
			debug('onclose had error %o', err);
		}

		function onend() {
			debug('onend');
		}

		function onerror(err: Error) {
			cleanup();
			debug('onerror %o', err);
			reject(err);
		}

		function ondata(b: Buffer) {
			buffers.push(b);
			buffersLength += b.length;

			const buffered = Buffer.concat(buffers, buffersLength);
			const endOfHeaders = buffered.indexOf('\r\n\r\n');

			if (endOfHeaders === -1) {
				// keep buffering
				debug('have not received end of HTTP headers yet...');
				read();
				return;
			}

			const headerParts = buffered.toString('ascii').split('\r\n');
			const firstLine = headerParts.shift();
			if (!firstLine) {
				throw new Error('No header received');
			}
			const firstLineParts = firstLine.split(' ');
			const statusCode = +firstLineParts[1];
			const statusText = firstLineParts.slice(2).join(' ');
			const headers: IncomingHttpHeaders = {};
			for (const header of headerParts) {
				if (!header) continue;
				const firstColon = header.indexOf(':');
				if (firstColon === -1) {
					throw new Error(`Invalid header: "${header}"`);
				}
				const key = header.slice(0, firstColon).toLowerCase();
				const value = header.slice(firstColon + 1).trimStart();
				const current = headers[key];
				if (typeof current === 'string') {
					headers[key] = [current, value];
				} else if (Array.isArray(current)) {
					current.push(value);
				} else {
					headers[key] = value;
				}
			}
			debug('got proxy server response: %o', firstLine);
			cleanup();
			resolve({
				connect: {
					statusCode,
					statusText,
					headers,
				},
				buffered,
			});
		}

		socket.on('error', onerror);
		socket.on('close', onclose);
		socket.on('end', onend);

		read();
	});
}
