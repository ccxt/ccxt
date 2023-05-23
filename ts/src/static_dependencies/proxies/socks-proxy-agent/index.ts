import { SocksClient, SocksProxy, SocksClientOptions } from './dependencies/socks/index.js';
import { Agent, AgentConnectOpts } from './../agent-base/index.js';
import createDebug from 'debug';
import * as dns from 'dns';
import * as net from 'net';
import * as tls from 'tls';
import * as http from 'http';

const debug = createDebug('socks-proxy-agent');

function parseSocksURL(url: URL): { lookup: boolean; proxy: SocksProxy } {
	let lookup = false;
	let type: SocksProxy['type'] = 5;
	const host = url.hostname;

	// From RFC 1928, Section 3: https://tools.ietf.org/html/rfc1928#section-3
	// "The SOCKS service is conventionally located on TCP port 1080"
	const port = parseInt(url.port, 10) || 1080;

	// figure out if we want socks v4 or v5, based on the "protocol" used.
	// Defaults to 5.
	switch (url.protocol.replace(':', '')) {
		case 'socks4':
			lookup = true;
			type = 4;
			break;
		// pass through
		case 'socks4a':
			type = 4;
			break;
		case 'socks5':
			lookup = true;
			type = 5;
			break;
		// pass through
		case 'socks': // no version specified, default to 5h
			type = 5;
			break;
		case 'socks5h':
			type = 5;
			break;
		default:
			throw new TypeError(
				`A "socks" protocol must be specified! Got: ${String(
					url.protocol
				)}`
			);
	}

	const proxy: SocksProxy = {
		host,
		port,
		type,
	};

	if (url.username) {
		Object.defineProperty(proxy, 'userId', {
			value: decodeURIComponent(url.username),
			enumerable: false,
		});
	}

	if (url.password != null) {
		Object.defineProperty(proxy, 'password', {
			value: decodeURIComponent(url.password),
			enumerable: false,
		});
	}

	return { lookup, proxy };
}

export type SocksProxyAgentOptions = Omit<
	SocksProxy,
	// These come from the parsed URL
	'ipaddress' | 'host' | 'port' | 'type' | 'userId' | 'password'
> &
	http.AgentOptions;

export class SocksProxyAgent extends Agent {
	static protocols = [
		'socks',
		'socks4',
		'socks4a',
		'socks5',
		'socks5h',
	] as const;

	readonly shouldLookup: boolean;
	readonly proxy: SocksProxy;
	timeout: number | null;

	constructor(uri: string | URL, opts?: SocksProxyAgentOptions) {
		super(opts);

		const url = typeof uri === 'string' ? new URL(uri) : uri;
		const { proxy, lookup } = parseSocksURL(url);

		this.shouldLookup = lookup;
		this.proxy = proxy;
		this.timeout = opts?.timeout ?? null;
	}

	/**
	 * Initiates a SOCKS connection to the specified SOCKS proxy server,
	 * which in turn connects to the specified remote host and port.
	 */
	async connect(
		req: http.ClientRequest,
		opts: AgentConnectOpts
	): Promise<net.Socket> {
		const { shouldLookup, proxy, timeout } = this;

		if (!opts.host) {
			throw new Error('No `host` defined!');
		}

		let { host } = opts;
		const { port, lookup: lookupFn = dns.lookup } = opts;

		if (shouldLookup) {
			// Client-side DNS resolution for "4" and "5" socks proxy versions.
			host = await new Promise<string>((resolve, reject) => {
				// Use the request's custom lookup, if one was configured:
				lookupFn(host, {}, (err, res) => {
					if (err) {
						reject(err);
					} else {
						resolve(res);
					}
				});
			});
		}

		const socksOpts: SocksClientOptions = {
			proxy,
			destination: {
				host,
				port: typeof port === 'number' ? port : parseInt(port, 10),
			},
			command: 'connect',
			timeout: timeout ?? undefined,
		};

		const cleanup = (tlsSocket?: tls.TLSSocket) => {
			req.destroy();
			socket.destroy();
			if (tlsSocket) tlsSocket.destroy();
		};

		debug('Creating socks proxy connection: %o', socksOpts);
		const { socket } = await SocksClient.createConnection(socksOpts);
		debug('Successfully created socks proxy connection');

		if (timeout !== null) {
			socket.setTimeout(timeout);
			socket.on('timeout', () => cleanup());
		}

		if (opts.secureEndpoint) {
			// The proxy is connecting to a TLS server, so upgrade
			// this socket connection to a TLS connection.
			debug('Upgrading socket connection to TLS');
			const servername = opts.servername || opts.host;
			const tlsSocket = tls.connect({
				...omit(opts, 'host', 'path', 'port'),
				socket,
				servername: net.isIP(servername) ? undefined : servername,
			});

			tlsSocket.once('error', (error) => {
				debug('Socket TLS error', error.message);
				cleanup(tlsSocket);
			});

			return tlsSocket;
		}

		return socket;
	}
}

function omit<T extends object, K extends [...Array<keyof T>]>(
	obj: T,
	...keys: K
): {
	[K2 in Exclude<keyof T, K[number]>]: T[K2];
} {
	const ret = {} as { [K in keyof typeof obj]: (typeof obj)[K] };
	let key: keyof typeof obj;
	for (key in obj) {
		if (!keys.includes(key)) {
			ret[key] = obj[key];
		}
	}
	return ret;
}
