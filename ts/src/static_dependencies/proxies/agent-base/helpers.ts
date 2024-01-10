import * as http from 'http';
import * as https from 'https';
import type { Readable } from 'stream';

export type ThenableRequest = http.ClientRequest & {
	then: Promise<http.IncomingMessage>['then'];
};

export async function toBuffer(stream: Readable): Promise<Buffer> {
	let length = 0;
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		length += chunk.length;
		chunks.push(chunk);
	}
	return Buffer.concat(chunks, length);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function json(stream: Readable): Promise<any> {
	const buf = await toBuffer(stream);
	const str = buf.toString('utf8');
	try {
		return JSON.parse(str);
	} catch (_err: unknown) {
		const err = _err as Error;
		err.message += ` (input: ${str})`;
		throw err;
	}
}

export function req(
	url: string | URL,
	opts: https.RequestOptions = {}
): ThenableRequest {
	const href = typeof url === 'string' ? url : url.href;
	const req = (href.startsWith('https:') ? https : http).request(
		url,
		opts
	) as ThenableRequest;
	const promise = new Promise<http.IncomingMessage>((resolve, reject) => {
		req
			.once('response', resolve)
			.once('error', reject)
			.end() as ThenableRequest;
	});
	req.then = promise.then.bind(promise);
	return req;
}
