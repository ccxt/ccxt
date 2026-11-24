import { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { clearSecrets } from '../../ts/redact.js';
import { ccxt as realCcxt, allExchangeIds, closestMatches, exchangeClass as realExchangeClass, isKnownExchange } from '../../ts/ccxt-loader.js';
import { FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from './fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';
import { tempDirectory } from './platform.js';

// The harness of the setup_account / manage_accounts tests (test/integration/setup.*.test.ts):
// a server on the fake ccxt, the loopback pages it starts, and an HTTP client that can send
// exactly what a browser — or a hostile client — would.
//
// What those tests cover is setup_account end to end: the tool, the loopback form server it starts, the config file it
// writes and the hot-apply into the running server. No browser is launched — the opener is
// injected. It is handed the path of the launch file (never the URL); the harness reads that
// file the way a browser would, which is the only place the form URL and its token are visible.

export const KEY = 'FAKEKEY-setup-0123456789';
export const SECRET = 'FAKESECRET-setup-9876543210';
export const posix = process.platform !== 'win32';

// an exchange whose authenticated call fails the way a real one does: echoing what it was sent
export class RejectingExchange extends FakeExchange {
    async fetchBalance (): Promise<any> {
        throw new AuthenticationError ('fakex {"code":-2015,"msg":"Invalid API-key"} apiKey=' + this.config['apiKey'] + ' signature for ' + this.config['secret']);
    }
}
export class AuthenticationError extends Error {}

export class HangingExchange extends FakeExchange {
    async fetchBalance (): Promise<any> {
        return new Promise (() => undefined);
    }
}

export interface Session { envelope: any, text: string, url: string, base: string, port: number, token: string, nonce: string, cookie: string, launchFile: string }

export interface Harness {
    client: Client;
    ctx: ServerContext;
    configFile: string;
    journalDir: string;
    launchRoot: string; // where the launch directories are created
    launches: string[]; // every argument handed to the (fake) browser opener
    clock: { now: number };
    stderr: () => string;
    // calls setup_account and then, like the launched browser, follows the launch file to the
    // form. load: false stops before that first page load.
    // tool: 'manage_accounts' opens the accounts page through its own tool instead.
    open: (args?: any, options?: { load?: boolean, tool?: string }) => Promise<Session>;
}

const cleanups: Array<() => Promise<void> | void> = [];
after (async () => {
    for (const cleanup of cleanups) {
        await cleanup ();
    }
});

// session token -> the cookie its first page load was given; raw() presents it the way the
// browser that loaded the form would
export const cookieJar = new Map<string, string> ();

export function urlInLaunchFile (file: string): string {
    const match = /<meta http-equiv="refresh" content="0;url=(http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32})">/.exec (fs.readFileSync (file, 'utf8'));
    assert.ok (match !== null, 'the launch file redirects to the form');
    return match[1];
}

export function bootOf (pageText: string): any {
    return JSON.parse (/<script type="application\/json" id="boot">(.*?)<\/script>/.exec (pageText)![1]);
}

export async function harness (options: { accounts?: any, settings?: any, exchangeClass?: any, configText?: string, opener?: (file: string) => Promise<void>, real?: boolean, problems?: string[] } = {}): Promise<Harness> {
    clearSecrets ();
    const dir = tempDirectory ('ccxt-mcp-setup-');
    const configFile = path.join (dir, 'conf', 'config.json');
    if (options.configText !== undefined) {
        fs.mkdirSync (path.dirname (configFile), { 'recursive': true });
        fs.writeFileSync (configFile, options.configText);
    }
    process.env['CCXT_MCP_CONFIG'] = configFile;
    const journalDir = path.join (dir, 'journal');
    const launchRoot = path.join (dir, 'launch');
    fs.mkdirSync (launchRoot);
    const exchangeClass = options.exchangeClass;
    const config = makeConfig (options.accounts ?? {}, options.settings ?? {});
    config.problems.push (...(options.problems ?? []));
    let poolsDeps: any = (exchangeClass === undefined) ? fakePoolsDeps : { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass };
    if (options.real) {
        // the real ccxt catalogue (metadata only — nothing here touches the network)
        poolsDeps = { 'exchangeClass': realExchangeClass, isKnownExchange, allExchangeIds, closestMatches };
    }
    const { server, ctx } = createServer ({
        config,
        'ccxtModule': options.real ? realCcxt : fakeCcxtModule,
        poolsDeps,
        'version': 'test',
        journalDir,
    });
    const launches: string[] = [];
    const clock = { 'now': 1700000000000 };
    ctx.setup.deps.opener = options.opener ?? (async (file: string) => {
        launches.push (file);
    });
    ctx.setup.deps.launchRoots = () => [ launchRoot ];
    ctx.setup.deps.now = () => clock.now;
    ctx.setup.deps.testTimeoutMs = 300;
    let captured = '';
    const realWrite = process.stderr.write.bind (process.stderr);
    (process.stderr as any).write = (chunk: any, ...rest: any[]) => {
        captured += String (chunk);
        return true;
    };
    const [ clientTransport, serverTransport ] = InMemoryTransport.createLinkedPair ();
    const client = new Client ({ 'name': 'setup-test', 'version': '0.0.1' });
    await Promise.all ([ client.connect (clientTransport), server.connect (serverTransport) ]);
    cleanups.push (async () => {
        (process.stderr as any).write = realWrite;
        await ctx.setup.close ();
        await client.close ();
    });
    let last: Session | undefined = undefined;
    const open = async (args: any = {}, openOptions: { load?: boolean, tool?: string } = {}) => {
        const before = launches.length;
        const result: any = await client.callTool ({ 'name': openOptions.tool ?? 'setup_account', 'arguments': args });
        const text = JSON.stringify (result);
        const envelope = JSON.parse (result.content[0].text);
        if (launches.length === before) {
            // nothing was launched: an error, or the form from an earlier call is still open
            return { ...(last ?? { 'url': '', 'base': '', 'port': 0, 'token': '', 'nonce': '', 'cookie': '', 'launchFile': '' }), envelope, text };
        }
        const launchFile = launches[launches.length - 1];
        const url = urlInLaunchFile (launchFile);
        const parsed = /^http:\/\/127\.0\.0\.1:(\d+)\/setup\/([0-9a-f]{32})$/.exec (url)!;
        const session: Session = { envelope, text, url, 'base': url, 'port': Number (parsed[1]), 'token': parsed[2], 'nonce': '', 'cookie': '', launchFile };
        if (openOptions.load !== false) {
            // the browser's first page load: this is what binds the session to it
            const page = await raw (url);
            assert.equal (page.status, 200);
            session.cookie = String ((page.headers['set-cookie'] ?? [])[0] ?? '').split (';')[0];
            cookieJar.set (session.token, session.cookie);
            session.nonce = bootOf (page.text).csrf;
        }
        last = session;
        return session;
    };
    return { client, ctx, configFile, journalDir, launchRoot, launches, clock, 'stderr': () => captured, open };
}

export interface RawResponse { status: number, headers: http.IncomingHttpHeaders, text: string }

// http.request rather than fetch: the tests need to send exactly the headers a hostile
// client would (a wrong Host, no Origin), which fetch does not allow
// The cookie of the session the URL belongs to is sent along, as its browser would; pass
// cookie: false to be a client that only knows the URL.
export function raw (url: string, options: { method?: string, headers?: Record<string, string>, body?: string | Buffer, cookie?: boolean } = {}): Promise<RawResponse> {
    return new Promise ((resolve, reject) => {
        const target = new URL (url);
        const headers: Record<string, string> = { ...(options.headers ?? {}) };
        const known = cookieJar.get ((/^\/setup\/([0-9a-f]{32})/.exec (target.pathname) ?? [])[1] ?? '');
        if (options.cookie !== false && known !== undefined && headers['Cookie'] === undefined) {
            headers['Cookie'] = known;
        }
        const request = http.request ({
            'host': '127.0.0.1',
            'port': target.port,
            'path': target.pathname + target.search,
            'method': options.method ?? 'GET',
            headers,
            'agent': false,
        }, (response) => {
            const chunks: Buffer[] = [];
            response.on ('data', (chunk) => chunks.push (chunk));
            response.on ('end', () => resolve ({ 'status': response.statusCode ?? 0, 'headers': response.headers, 'text': Buffer.concat (chunks).toString ('utf8') }));
        });
        request.on ('error', reject);
        if (options.body !== undefined) {
            request.write (options.body);
        }
        request.end ();
    });
}

// a POST exactly as the form page sends it; overrides replace or (undefined) drop a header
export function post (session: { base: string, port: number, nonce: string }, action: string, body: any, overrides: Record<string, string | undefined> = {}, method = 'POST', cookie = true): Promise<RawResponse> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': 'http://127.0.0.1:' + session.port,
        'X-Setup-Nonce': session.nonce,
    };
    for (const [ name, value ] of Object.entries (overrides)) {
        if (value === undefined) {
            delete headers[name];
        } else {
            headers[name] = value;
        }
    }
    return raw (session.base + '/' + action, { method, headers, cookie, 'body': (typeof body === 'string' || Buffer.isBuffer (body)) ? body : JSON.stringify (body) });
}

export function saveBody (extra: Record<string, any> = {}): Record<string, any> {
    return { 'name': 'main', 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox', 'trading': false, ...extra };
}

export async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    return JSON.parse (result.content[0].text);
}

export function journalText (dir: string): string {
    return fs.existsSync (dir) ? fs.readdirSync (dir).map ((file) => fs.readFileSync (path.join (dir, file), 'utf8')).join ('') : '';
}

export async function refused (url: string): Promise<boolean> {
    try {
        await raw (url);
        return false;
    } catch (e: any) {
        return e.code === 'ECONNREFUSED';
    }
}

// "Your accounts" (manage_accounts): the second page on the same session machinery

// unlike KEY / SECRET above these share no four characters with any word on the pages, so
// "no part of them appears anywhere" can be asserted window by window
export const MKEY = 'Kq7Zx9Lm2Vb4Np8Rt6Wy';
export const MSECRET = 'Hd3Gf5Js1Ka9Lo7Pi2Uy';
export const OKEY = 'Xw4Cv8Bn3Mq6Zl1Kj5Ht';
export const OSECRET = 'Pf2Dg7Sa9Yu4Ie6Ro1Tw';

export function windows (value: string, size: number): string[] {
    const out: string[] = [];
    for (let i = 0; i + size <= value.length; i++) {
        out.push (value.slice (i, i + size));
    }
    return out;
}

// the only part of any credential that may ever leave the server: the last 4 of an API key
export function assertOnlyLastFour (haystack: string, label: string, keys: string[], others: string[]): void {
    for (const key of keys) {
        for (const part of windows (key, 4).slice (0, -1)) {
            assert.ok (!haystack.includes (part), label + ': part of an API key leaked (' + part + ')');
        }
    }
    for (const other of others) {
        // The credentials above were written so that no four of their characters occur in any
        // word the server prints. A session token or nonce is 32 RANDOM hex characters: four
        // of those turn up by chance in a timestamp, a port or a journal id (58 windows
        // against every "0000" and "1700" in the text — this failed about one full run in
        // ten, in whichever test the dice picked). Twelve in a row do not happen by chance,
        // and any real leak of a token contains them.
        const size = /^[0-9a-f]{24,}$/.test (other) ? 12 : 4;
        for (const part of windows (other, size)) {
            assert.ok (!haystack.includes (part), label + ': part of a secret leaked (' + part + ')');
        }
    }
}

export const manageFile = () => ({
    'accounts': {
        'main': { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true, 'trading': true },
        'real': { 'exchange': 'fakex', 'apiKey': OKEY, 'secret': OSECRET, 'funds': 'live', 'maxTransferValue': 5, 'implicitWrites': true, 'options': { 'a': [ 1 ] } },
    },
    'settings': { 'maxResults': 7 },
    'notes': 'mine',
});

export async function manageHarness (extra: any = {}): Promise<Harness> {
    const file = manageFile ();
    return harness ({ 'configText': JSON.stringify (file, null, 2), 'accounts': { 'main': { ...file.accounts.main }, 'real': { ...file.accounts.real }, 'envacct': { 'apiKey': 'Ev5Nb2Qc8Xd1Wm6Lz3Kp', 'secret': 'Ty9Uh4Gi7Fo2Aj5Sl8Dq', 'sandbox': true } }, ...extra });
}

export const manage = (h: Harness, args: any = {}, options: any = {}) => h.open (args, { ...options, 'tool': 'manage_accounts' });
export const fileOf = (h: Harness) => JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
