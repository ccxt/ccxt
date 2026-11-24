import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { ToolListChangedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';
import { createServer } from '../../ts/factory.js';
import { clearSecrets, redact } from '../../ts/redact.js';
import { MAX_BODY_BYTES, SESSION_TTL_MS, browserCommand } from '../../ts/setup.js';
import { ccxt as realCcxt, allExchangeIds, closestMatches, exchangeClass as realExchangeClass, isKnownExchange } from '../../ts/ccxt-loader.js';
import { FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

// setup_account end to end: the tool, the loopback form server it starts, the config file it
// writes and the hot-apply into the running server. No browser is launched — the opener is
// injected. It is handed the path of the launch file (never the URL); the harness reads that
// file the way a browser would, which is the only place the form URL and its token are visible.

const KEY = 'FAKEKEY-setup-0123456789';
const SECRET = 'FAKESECRET-setup-9876543210';
const posix = process.platform !== 'win32';

// an exchange whose authenticated call fails the way a real one does: echoing what it was sent
class RejectingExchange extends FakeExchange {
    async fetchBalance (): Promise<any> {
        throw new AuthenticationError ('fakex {"code":-2015,"msg":"Invalid API-key"} apiKey=' + this.config['apiKey'] + ' signature for ' + this.config['secret']);
    }
}
class AuthenticationError extends Error {}

class HangingExchange extends FakeExchange {
    async fetchBalance (): Promise<any> {
        return new Promise (() => undefined);
    }
}

interface Session { envelope: any, text: string, url: string, base: string, port: number, token: string, nonce: string, cookie: string, launchFile: string }

interface Harness {
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
const cookieJar = new Map<string, string> ();

function urlInLaunchFile (file: string): string {
    const match = /<meta http-equiv="refresh" content="0;url=(http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32})">/.exec (fs.readFileSync (file, 'utf8'));
    assert.ok (match !== null, 'the launch file redirects to the form');
    return match[1];
}

function bootOf (pageText: string): any {
    return JSON.parse (/<script type="application\/json" id="boot">(.*?)<\/script>/.exec (pageText)![1]);
}

async function harness (options: { accounts?: any, settings?: any, exchangeClass?: any, configText?: string, opener?: (file: string) => Promise<void>, real?: boolean, problems?: string[] } = {}): Promise<Harness> {
    clearSecrets ();
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-setup-'));
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

interface RawResponse { status: number, headers: http.IncomingHttpHeaders, text: string }

// http.request rather than fetch: the tests need to send exactly the headers a hostile
// client would (a wrong Host, no Origin), which fetch does not allow
// The cookie of the session the URL belongs to is sent along, as its browser would; pass
// cookie: false to be a client that only knows the URL.
function raw (url: string, options: { method?: string, headers?: Record<string, string>, body?: string | Buffer, cookie?: boolean } = {}): Promise<RawResponse> {
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
function post (session: { base: string, port: number, nonce: string }, action: string, body: any, overrides: Record<string, string | undefined> = {}, method = 'POST', cookie = true): Promise<RawResponse> {
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

function saveBody (extra: Record<string, any> = {}): Record<string, any> {
    return { 'name': 'main', 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox', 'trading': false, ...extra };
}

async function call (client: Client, name: string, args: any): Promise<any> {
    const result: any = await client.callTool ({ name, 'arguments': args });
    return JSON.parse (result.content[0].text);
}

function journalText (dir: string): string {
    return fs.existsSync (dir) ? fs.readdirSync (dir).map ((file) => fs.readFileSync (path.join (dir, file), 'utf8')).join ('') : '';
}

async function refused (url: string): Promise<boolean> {
    try {
        await raw (url);
        return false;
    } catch (e: any) {
        return e.code === 'ECONNREFUSED';
    }
}

// ---------------------------------------------------------------------------------------

test ('setup_account opens the form in the browser and tells the model nothing that identifies it', async () => {
    const h = await harness ();
    const session = await h.open ({ 'exchange': 'fakex' });
    assert.equal (session.envelope.ok, true);
    assert.equal (session.envelope.data.opened, true);
    assert.equal (session.envelope.data.expiresInSeconds, 600);
    assert.match (session.envelope.meta.notice, /Do NOT ask them to paste or type any key/);
    assert.match (session.envelope.meta.notice, /expires in 10 minutes/);
    assert.ok (session.envelope.data.asksFor.some ((line: string) => /apiKey, secret/.test (line)), 'names the credential fields the exchange needs');
    assert.equal (session.envelope.data.savesTo, h.configFile);
    // the opener got the path of a local file, the file led to a loopback URL with a 128-bit
    // token…
    assert.equal (h.launches.length, 1);
    assert.equal (path.basename (h.launches[0]), 'open.html');
    assert.match (session.url, /^http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32}$/);
    // …and neither the token, the port nor any URL reached the model or the log
    for (const haystack of [ session.text, h.stderr () ]) {
        assert.ok (!haystack.includes (session.token), 'token leaked');
        assert.ok (!haystack.includes (session.nonce), 'nonce leaked');
        assert.ok (!/127\.0\.0\.1:\d|\/setup\//.test (haystack), 'URL leaked');
    }
});

test ('setup_account validates its prefill arguments', async () => {
    const h = await harness ();
    const unknown = await h.open ({ 'exchange': 'nope' });
    assert.equal (unknown.envelope.error.code, 'UNKNOWN_EXCHANGE');
    const badName = await h.open ({ 'account': 'has space' });
    assert.equal (badName.envelope.error.code, 'BAD_REQUEST');
    assert.equal (h.launches.length, 0, 'nothing was opened');
    assert.equal (h.ctx.setup.isListening (), false);
});

test ('a browser that cannot be launched yields a config-file hint, no listener and still no token', async () => {
    let seen = '';
    let file = '';
    const h = await harness ({ 'opener': async (launchFile: string) => {
        file = launchFile;
        seen = urlInLaunchFile (launchFile);
        throw new Error ('spawn xdg-open ENOENT ' + launchFile + ' ' + seen);
    } });
    const session = await h.open ({});
    assert.equal (session.envelope.ok, false);
    assert.equal (session.envelope.error.code, 'SETUP_FORM_UNAVAILABLE');
    assert.ok (session.envelope.error.hint.includes (h.configFile));
    assert.match (session.envelope.error.hint, /never in this chat/);
    const token = seen.split ('/').pop () as string;
    assert.equal (token.length, 32);
    assert.ok (!session.text.includes (token) && !h.stderr ().includes (token), 'the opener error must not carry the URL out');
    assert.ok (!session.text.includes (file) && !h.stderr ().includes (file), 'nor the launch file path');
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (seen));
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'the launch file does not outlive the failed launch');
});

test ('the page: strict headers, no CORS, session data only as JSON, prefill escaped', async () => {
    const h = await harness ();
    const session = await h.open ({ 'exchange': 'fakex', 'account': 'my-acct', 'sandbox': false });
    const page = await raw (session.url);
    assert.equal (page.status, 200);
    assert.match (String (page.headers['content-type']), /^text\/html/);
    const csp = String (page.headers['content-security-policy']);
    assert.match (csp, /^default-src 'none'; script-src 'nonce-[A-Za-z0-9+/=]+'; style-src 'nonce-[A-Za-z0-9+/=]+'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'$/);
    assert.ok (!/unsafe-inline|unsafe-eval|https?:|\*/.test (csp));
    assert.equal (page.headers['x-frame-options'], 'DENY');
    assert.equal (page.headers['referrer-policy'], 'no-referrer');
    assert.equal (page.headers['cache-control'], 'no-store');
    assert.equal (page.headers['x-content-type-options'], 'nosniff');
    // every inline block carries this response's nonce, and nothing loads from elsewhere
    const nonce = /script-src 'nonce-([^']+)'/.exec (csp)![1];
    assert.ok (page.text.includes ('<style nonce="' + nonce + '">') && page.text.includes ('<script nonce="' + nonce + '">'));
    assert.ok (!/<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//.test (page.text), 'no external assets');
    assert.ok (!/\son[a-z]+="|style="/.test (page.text), 'no inline handlers or style attributes');
    assert.ok (!page.text.includes ('__CSP_NONCE__') && !page.text.includes ('__BOOT_JSON__') && !page.text.includes ('@include'));
    const boot = bootOf (page.text);
    assert.deepEqual (boot.exchanges, [ 'fakex' ]);
    assert.deepEqual (boot.prefill, { 'exchange': 'fakex', 'account': 'my-acct', 'environment': 'live' });
    assert.equal (boot.configPath, h.configFile);
    assert.equal (boot.expiresInMs, SESSION_TTL_MS);
    // the form offers no funds / withdraw / implicit-write switch at all
    assert.ok (!/name="(funds|withdraw|implicitWrites)"|id="(funds|withdraw|implicitWrites)"/.test (page.text));
    assert.match (page.text, /Withdrawals and transfers cannot be switched on from this page/);
    assert.match (page.text, /Withdrawals: keep them DISABLED/);
    // a second load gets a different nonce
    const again = await raw (session.url);
    assert.notEqual (again.headers['content-security-policy'], csp);
    // the credentials endpoint
    const fields = await raw (session.url + '/credentials?exchange=fakex');
    assert.equal (fields.status, 200);
    const info = JSON.parse (fields.text);
    assert.deepEqual (info.fields, [ { 'name': 'apiKey', 'label': 'API key' }, { 'name': 'secret', 'label': 'API secret' } ]);
    assert.deepEqual (info.environments, { 'sandbox': true, 'demo': false, 'live': true });
    assert.deepEqual ([ info.configFileOnly, info.predictionVariant, info.sandboxIsDemo, info.walletKey ], [ false, false, false, false ]);
    assert.equal (JSON.parse ((await raw (session.url + '/credentials?exchange=%3Cscript%3E')).text).ok, false);
    for (const response of [ page, fields, await post (session, 'test', { 'bad': true }) ]) {
        for (const header of Object.keys (response.headers)) {
            assert.ok (!header.startsWith ('access-control-'), 'no CORS header may ever be sent: ' + header);
        }
    }
});

test ('happy path (sandbox): test, save, private file, hot-applied without a restart, session dead', async () => {
    const h = await harness ();
    assert.equal ((await call (h.client, 'list_accounts', {})).data.length, 0);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).error.code, 'UNKNOWN_ACCOUNT');
    const session = await h.open ({ 'exchange': 'fakex' });
    const tested = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' });
    assert.deepEqual (JSON.parse (tested.text), { 'ok': true, 'tested': true });
    assert.equal (fs.existsSync (h.configFile), false, 'a test saves nothing');
    const saved = await post (session, 'save', saveBody ({ 'trading': true }));
    assert.equal (saved.status, 200);
    assert.deepEqual (JSON.parse (saved.text), { 'ok': true, 'account': 'main', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': true, 'replaced': false, 'stoppedStreams': 0, 'toolsAdded': false, 'restartForTools': false });
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true, 'trading': true } } });
    if (posix) {
        assert.equal (fs.statSync (h.configFile).mode & 0o777, 0o600);
        assert.equal (fs.statSync (path.dirname (h.configFile)).mode & 0o777, 0o700);
    }
    // hot-apply: the same running server now knows the account
    const accounts = await call (h.client, 'list_accounts', {});
    assert.equal (accounts.data.length, 1);
    assert.equal (accounts.data[0].name, 'main');
    assert.equal (accounts.data[0].environment, 'sandbox');
    assert.equal (accounts.data[0].trading, true);
    assert.deepEqual (accounts.data[0].credentials, [ 'apiKey', 'secret' ]);
    const balance = await call (h.client, 'get_balance', { 'account': 'main' });
    assert.equal (balance.ok, true);
    const { exchange } = await h.ctx.pools.getAuthenticated ('main');
    assert.equal (exchange.config.apiKey, KEY);
    assert.equal (exchange.sandboxMode, true);
    assert.equal ((await call (h.client, 'get_safety_status', {})).data.configPath, h.configFile);
    // single use: the session and its listener are gone
    assert.equal (h.ctx.setup.hasLiveSession (), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
    // what was recorded: names and modes, never values, never the URL
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"setup_account"/);
    assert.match (h.stderr (), /account "main" on fakex saved via setup form \(sandbox, trading\)/);
    for (const haystack of [ journal, h.stderr (), saved.text, tested.text, JSON.stringify (accounts), JSON.stringify (balance) ]) {
        for (const forbidden of [ KEY, SECRET, session.token, session.nonce ]) {
            assert.ok (!haystack.includes (forbidden), 'leaked: ' + forbidden.slice (0, 8));
        }
    }
});

test ('live trading needs a positive cap and the explicit confirmation — enforced by the server', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const live = { 'environment': 'live', 'trading': true };
    for (const [ extra, code ] of [
        [ { ...live }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 0, 'liveConfirmed': true }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': -5, 'liveConfirmed': true }, 'CAP_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 25 }, 'CONFIRM_REQUIRED' ],
        [ { ...live, 'maxOrderValue': 25, 'liveConfirmed': false }, 'CONFIRM_REQUIRED' ],
        // the tiers the form does not offer cannot be smuggled in either
        [ { 'funds': 'live', 'maxTransferValue': 1000 }, 'BAD_REQUEST' ],
        [ { 'implicitWrites': true }, 'BAD_REQUEST' ],
        [ { 'trading': 'live' }, 'BAD_REQUEST' ],
        [ { 'environment': 'demo' }, 'NO_DEMO' ],
        [ { 'credentials': { 'apiKey': KEY } }, 'MISSING_CREDENTIALS' ],
        [ { 'credentials': { 'apiKey': KEY, 'secret': SECRET, 'privateKey': 'x'.repeat (20) } }, 'BAD_REQUEST' ],
        [ { 'exchange': 'nope' }, 'UNKNOWN_EXCHANGE' ],
        [ { 'name': '__proto__' }, 'INVALID_NAME' ],
        [ { 'name': 'has space' }, 'INVALID_NAME' ],
    ] as [ any, string ][]) {
        const response = await post (session, 'save', saveBody (extra));
        assert.equal (response.status, 400, JSON.stringify (extra));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (extra));
    }
    assert.equal (fs.existsSync (h.configFile), false);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'a refused save does not use the session up');
    const saved = await post (session, 'save', saveBody ({ ...live, 'maxOrderValue': 25, 'liveConfirmed': true }));
    assert.equal (saved.status, 200);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'trading': 'live', 'maxOrderValue': 25, 'confirm': 'always' });
    const account = (await call (h.client, 'list_accounts', {})).data[0];
    assert.deepEqual ([ account.environment, account.trading, account.maxOrderValue, account.confirm, account.funds, account.implicitWrites ], [ 'live', 'live', 25, 'always', false, false ]);
    assert.match (h.stderr (), /saved via setup form \(live, LIVE trading, max order 25 USD\)/);
});

test ('live without trading is a plain read-only account (no cap, no confirmation needed)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ({ 'environment': 'live' }))).status, 200);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET });
    assert.equal ((await call (h.client, 'list_accounts', {})).data[0].trading, false);
});

test ('replace flow: an existing name needs an explicit replace, and the cached client is dropped', async () => {
    const before = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789', 'sandbox': true, 'trading': true }, 'other': { 'exchange': 'fakex', 'apiKey': 'OTHERKEY-0123456789', 'secret': 'OTHERSECRET-0123456789' } } };
    const h = await harness ({ 'configText': JSON.stringify (before), 'accounts': { 'main': { ...before.accounts.main }, 'other': { ...before.accounts.other } } });
    const cached = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    assert.equal (cached.config.apiKey, 'OLDKEY-0123456789');
    const session = await h.open ({});
    const conflict = await post (session, 'save', saveBody ());
    assert.equal (conflict.status, 409);
    assert.equal (JSON.parse (conflict.text).code, 'ACCOUNT_EXISTS');
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), before);
    assert.equal ((await h.ctx.pools.getAuthenticated ('main')).exchange, cached, 'nothing changed yet');
    const replaced = await post (session, 'save', saveBody ({ 'replace': true }));
    assert.equal (replaced.status, 200);
    assert.equal (JSON.parse (replaced.text).replaced, true);
    const after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual (after['accounts']['other'], before.accounts.other);
    assert.deepEqual (after['accounts']['main'], { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true });
    const fresh = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    assert.notEqual (fresh, cached);
    assert.equal (fresh.config.apiKey, KEY);
    assert.equal (cached.closed, true, 'the instance holding the old keys was closed');
    assert.equal ((await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'main').trading, false);
});

test ('an account that only exists in memory (env-defined) also needs replace before it is shadowed', async () => {
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': 'ENVKEY-0123456789', 'secret': 'ENVSECRET-0123456789' } } });
    const session = await h.open ({});
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ())).text).code, 'ACCOUNT_EXISTS');
    assert.equal (fs.existsSync (h.configFile), false);
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'replace': true }))).text);
    assert.equal (saved.ok, true);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
    // the file never held it, but the running server's account WAS replaced — the page, the
    // log and the journal all say so
    assert.equal (saved.replaced, true);
    assert.match (h.stderr (), /replaced the previous account of that name/);
    assert.match (journalText (h.journalDir), /"replaced":true,"previousEnvironment":"live"/);
});

test ('both config shapes are extended in place; untouched accounts, settings and unknown keys survive', async () => {
    const modern = {
        'accounts': { 'old': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'funds': 'live', 'maxTransferValue': 5, 'options': { 'a': [ 1, { 'b': null } ] } } },
        'settings': { 'maxResults': 7, 'exchangeOptions': { 'fakex': { 'x': 1 } } },
        'notes': 'mine',
    };
    let h = await harness ({ 'configText': JSON.stringify (modern, null, 2) });
    let session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    let after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual ({ ...after, 'accounts': { 'old': after.accounts.old } }, modern);
    assert.deepEqual (after.accounts.main, { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET, 'sandbox': true });
    // legacy keys.json shape: {"<exchangeId>": {...}} — here the file already has a non-account key
    const legacy = { 'fakex': { 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' }, 'settings': { 'maxResults': 9 }, 'comment': 'kept' };
    h = await harness ({ 'configText': JSON.stringify (legacy) });
    session = await h.open ({});
    const wrongName = await post (session, 'save', saveBody ({ 'name': 'main', 'replace': true }));
    assert.equal (JSON.parse (wrongName.text).code, 'LEGACY_NAME');
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8')), legacy);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [], 'a refused write applies nothing in memory');
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'fakex' }))).text).code, 'ACCOUNT_EXISTS');
    assert.equal ((await post (session, 'save', saveBody ({ 'name': 'fakex', 'replace': true }))).status, 200);
    after = JSON.parse (fs.readFileSync (h.configFile, 'utf8'));
    assert.deepEqual (after, { 'fakex': { 'apiKey': KEY, 'secret': SECRET, 'sandbox': true }, 'settings': legacy.settings, 'comment': 'kept' });
    assert.equal (h.ctx.config.accounts['fakex'].exchange, 'fakex');
});

test ('a config file that is not valid JSON is refused on the page and left byte-for-byte intact', async () => {
    const broken = '{"accounts": {"old": {"exchange": "fakex", "apiKey": "OLDKEY-0123456789",}}}\n';
    const h = await harness ({ 'configText': broken });
    const session = await h.open ({});
    const response = await post (session, 'save', saveBody ());
    assert.equal (response.status, 400);
    const body = JSON.parse (response.text);
    assert.equal (body.code, 'INVALID_JSON');
    assert.match (body.error, /not valid JSON.*left untouched/);
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), broken);
    assert.deepEqual (fs.readdirSync (path.dirname (h.configFile)), [ 'config.json' ]);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
});

test ('a failed connection test warns with a redacted error and does not block the save', async () => {
    const h = await harness ({ 'exchangeClass': RejectingExchange });
    const session = await h.open ({});
    const tested = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' });
    assert.equal (tested.status, 200);
    const body = JSON.parse (tested.text);
    assert.equal (body.ok, false);
    assert.equal (body.kind, 'AuthenticationError');
    assert.match (body.error, /Invalid API-key/);
    assert.match (body.error, /\[redacted:apiKey\].*\[redacted:secret\]/);
    assert.ok (!tested.text.includes (KEY) && !tested.text.includes (SECRET), 'submitted secrets must never be echoed');
    assert.ok (!h.stderr ().includes (KEY) && !h.stderr ().includes (SECRET));
    assert.match (h.stderr (), /connection test on fakex failed \(AuthenticationError\)/);
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
});

test ('a connection test that never answers times out instead of hanging the form', async () => {
    const h = await harness ({ 'exchangeClass': HangingExchange });
    const session = await h.open ({});
    const body = JSON.parse ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' })).text);
    assert.deepEqual ([ body.ok, body.kind ], [ false, 'RequestTimeout' ]);
});

test ('security: a request without the session token gets an empty 404, whatever else it carries', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const origin = 'http://127.0.0.1:' + session.port;
    const wrongToken = session.token.replace (/^./, (c) => ((c === '0') ? '1' : '0'));
    const targets = [ '/', '/setup', '/setup/', '/setup/' + wrongToken, '/setup/' + wrongToken + '/save', '/setup/' + session.token.toUpperCase (), '/setup/' + session.token + '/', '/setup/' + session.token + '/unknown', '/setup/' + session.token + '/../x', '/setup/' + session.token.slice (0, 31) ];
    // GET everywhere; the write-shaped and preflight-shaped requests on the interesting ones
    const requests: [ string, string ][] = targets.map ((target) => [ 'GET', target ] as [ string, string ]);
    for (const target of [ '/setup/' + wrongToken + '/save', '/setup/' + session.token + '/unknown', '/setup/' + wrongToken ]) {
        requests.push ([ 'POST', target ], [ 'OPTIONS', target ]);
    }
    for (const [ method, target ] of requests) {
        const response = await raw (origin + target, { method, 'headers': (method === 'POST') ? { 'Content-Type': 'application/json', 'Origin': origin, 'X-Setup-Nonce': session.nonce } : {}, 'body': (method === 'POST') ? JSON.stringify (saveBody ()) : undefined });
        assert.equal (response.status, 404, method + ' ' + target);
        assert.equal (response.text, '', 'no detail');
        assert.deepEqual (Object.keys (response.headers).filter ((header) => header.startsWith ('access-control-')), []);
    }
    assert.equal (h.ctx.setup.isListening (), true);
    assert.equal ((await raw (session.url)).status, 200, 'the real session is unaffected');
    assert.equal (fs.existsSync (h.configFile), false);
});

test ('security: only Host 127.0.0.1:<port> or localhost:<port> is served (DNS rebinding)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    for (const host of [ 'evil.example:' + session.port, 'evil.example', '127.0.0.1', '127.0.0.1:1', 'localhost', '[::1]:' + session.port, '127.0.0.1.evil.example:' + session.port, '127.0.0.1:' + session.port + '.evil.example' ]) {
        const page = await raw (session.url, { 'headers': { 'Host': host } });
        assert.equal (page.status, 404, host);
        assert.equal (page.text, '');
        const save = await post (session, 'save', saveBody (), { 'Host': host, 'Origin': 'http://' + host });
        assert.equal (save.status, 404, host);
    }
    assert.equal (fs.existsSync (h.configFile), false);
    const local = await raw (session.url, { 'headers': { 'Host': 'localhost:' + session.port } });
    assert.equal (local.status, 200);
    assert.equal ((await post (session, 'save', saveBody (), { 'Host': 'localhost:' + session.port, 'Origin': 'http://localhost:' + session.port })).status, 200);
});

test ('security: a write must be a same-origin JSON POST carrying the page nonce', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const cases: [ string, Record<string, string | undefined>, number, string? ][] = [
        [ 'missing Origin', { 'Origin': undefined }, 403 ],
        [ 'foreign Origin', { 'Origin': 'https://evil.example' }, 403 ],
        [ 'null Origin', { 'Origin': 'null' }, 403 ],
        [ 'same host, other port', { 'Origin': 'http://127.0.0.1:1' }, 403 ],
        [ 'localhost Origin on a 127.0.0.1 page', { 'Origin': 'http://localhost:' + session.port }, 403 ],
        [ 'https Origin', { 'Origin': 'https://127.0.0.1:' + session.port }, 403 ],
        [ 'cross-site fetch metadata', { 'Sec-Fetch-Site': 'cross-site' }, 403 ],
        [ 'form content type', { 'Content-Type': 'application/x-www-form-urlencoded' }, 415 ],
        [ 'text/plain', { 'Content-Type': 'text/plain' }, 415 ],
        [ 'no content type', { 'Content-Type': undefined }, 415 ],
        [ 'missing nonce', { 'X-Setup-Nonce': undefined }, 403 ],
        [ 'wrong nonce', { 'X-Setup-Nonce': '0'.repeat (32) }, 403 ],
        [ 'the token is not the nonce', { 'X-Setup-Nonce': session.token }, 403 ],
    ];
    for (const action of [ 'save', 'test' ]) {
        for (const [ label, overrides, status ] of cases) {
            const response = await post (session, action, saveBody (), overrides);
            assert.equal (response.status, status, action + ': ' + label);
            assert.ok (!response.text.includes (KEY) && !response.text.includes (SECRET));
        }
        for (const method of [ 'GET', 'PUT', 'DELETE', 'PATCH' ]) {
            const response = await post (session, action, (method === 'GET') ? '' : saveBody (), {}, method);
            assert.equal (response.status, 405, method + ' ' + action);
            assert.equal (response.headers['allow'], 'POST');
        }
    }
    assert.equal ((await post (session, 'save', '{not json')).status, 400);
    assert.equal (fs.existsSync (h.configFile), false, 'none of the rejected requests saved anything');
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
    assert.equal ((await raw (session.url, { 'method': 'POST' })).status, 405);
    // and the well-formed one still works afterwards
    assert.equal ((await post (session, 'save', saveBody (), { 'Content-Type': 'application/json; charset=utf-8', 'Sec-Fetch-Site': 'same-origin' })).status, 200);
});

test ('security: an oversized body is refused (declared or streamed) and saves nothing', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const big = JSON.stringify (saveBody ({ 'padding': 'x'.repeat (MAX_BODY_BYTES) }));
    const declared = await post (session, 'save', big, { 'Content-Length': String (Buffer.byteLength (big)) });
    assert.equal (declared.status, 413);
    const chunked = await post (session, 'save', big, { 'Transfer-Encoding': 'chunked' });
    assert.equal (chunked.status, 413);
    assert.equal (fs.existsSync (h.configFile), false);
    const fits = JSON.stringify (saveBody ());
    assert.ok (Buffer.byteLength (fits) < MAX_BODY_BYTES);
    assert.equal ((await post (session, 'save', fits)).status, 200);
});

test ('security: the session expires after 10 minutes and takes the listener with it', async () => {
    const h = await harness ();
    const session = await h.open ({});
    h.clock.now += SESSION_TTL_MS - 1;
    assert.equal ((await raw (session.url)).status, 200);
    h.clock.now += 1;
    const expired = await post (session, 'save', saveBody ());
    assert.equal (expired.status, 404);
    assert.equal (expired.text, '');
    assert.equal (fs.existsSync (h.configFile), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('security: a session is single-use — after a save its token opens nothing', async () => {
    const h = await harness ();
    const first = await h.open ({});
    assert.equal ((await post (first, 'save', saveBody ())).status, 200);
    assert.ok (await refused (first.url));
    // a new form reuses nothing of the old one, and the old token is not accepted by it
    const second = await h.open ({});
    assert.notEqual (second.token, first.token);
    assert.notEqual (second.nonce, first.nonce);
    const stale = await raw ('http://127.0.0.1:' + second.port + '/setup/' + first.token);
    assert.equal (stale.status, 404);
    const replay = await post ({ 'base': 'http://127.0.0.1:' + second.port + '/setup/' + first.token, 'port': second.port, 'nonce': first.nonce }, 'save', saveBody ({ 'name': 'again' }));
    assert.equal (replay.status, 404);
    assert.equal (h.ctx.config.accounts['again'], undefined);
});

test ('a repeat setup_account call leaves the open form alone: no new window, typed input stays valid', async () => {
    const h = await harness ();
    const first = await h.open ({ 'exchange': 'fakex' });
    // the model calls again while the user is typing — with different prefill, even
    const second = await h.open ({ 'exchange': 'fakex', 'account': 'other', 'sandbox': false });
    assert.equal (second.envelope.ok, true);
    assert.deepEqual ([ second.envelope.data.opened, second.envelope.data.alreadyOpen ], [ false, true ]);
    assert.match (second.envelope.meta.notice, /still open in the user's browser/);
    assert.match (second.envelope.meta.notice, /restart: true/);
    assert.equal (h.launches.length, 1, 'no second browser window');
    assert.ok (!second.text.includes (first.token) && !/127\.0\.0\.1:\d|\/setup\//.test (second.text));
    // the form the user has open is untouched: same prefill on a reload, and it still saves
    assert.deepEqual (bootOf ((await raw (first.url)).text).prefill, { 'exchange': 'fakex', 'account': '', 'environment': 'sandbox' });
    assert.equal ((await post (first, 'save', saveBody ())).status, 200);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
});

test ('a form no browser has loaded yet is launched again as the same session, with the new prefill', async () => {
    const h = await harness ();
    const first = await h.open ({ 'exchange': 'fakex' }, { 'load': false });
    const second = await h.open ({ 'account': 'again' });
    assert.equal (second.envelope.data.opened, true);
    assert.equal (h.launches.length, 2);
    assert.equal (second.token, first.token, 'the same session, not a new one');
    assert.equal (fs.existsSync (first.launchFile), false, 'the earlier launch file was replaced, not left behind');
    assert.equal (fs.readdirSync (h.launchRoot).length, 0, 'and the new one went with the first page load');
    assert.deepEqual (bootOf ((await raw (second.url)).text).prefill, { 'exchange': '', 'account': 'again', 'environment': 'sandbox' });
});

test ('restart: true is the only way a live form is retired, and it is retired completely', async () => {
    const h = await harness ();
    const first = await h.open ({});
    const second = await h.open ({ 'restart': true });
    assert.equal (second.envelope.data.opened, true);
    assert.equal (second.port, first.port, 'the listener is reused');
    assert.notEqual (second.token, first.token);
    assert.equal ((await raw (first.url)).status, 404);
    assert.equal ((await post (first, 'save', saveBody ())).status, 404);
    assert.equal (fs.existsSync (h.configFile), false);
    // the old page's nonce and cookie are useless against the new session too
    assert.equal ((await post ({ ...second, 'nonce': first.nonce }, 'save', saveBody ())).status, 403);
    assert.equal ((await raw (second.url + '/credentials?exchange=fakex', { 'cookie': false, 'headers': { 'Cookie': first.cookie } })).status, 404);
    assert.equal ((await post (second, 'save', saveBody ())).status, 200);
});

test ('setup_account is not annotated read-only: it opens a window and can discard a form', async () => {
    const h = await harness ();
    const tool = (await h.client.listTools ()).tools.find ((entry: any) => entry.name === 'setup_account') as any;
    assert.deepEqual (tool.annotations, { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': false, 'openWorldHint': false });
    assert.ok ('restart' in tool.inputSchema.properties);
});

test ('security: the token never reaches a command line — the browser is launched on a private file', async () => {
    const h = await harness ();
    const session = await h.open ({}, { 'load': false });
    // what the opener was given, and what it would put on a command line on every platform
    assert.equal (h.launches.length, 1);
    const file = h.launches[0];
    assert.ok (path.isAbsolute (file) && file.startsWith (h.launchRoot + path.sep));
    for (const platform of [ 'linux', 'darwin', 'win32' ]) {
        const { command, args } = browserCommand (platform, file);
        const commandLine = [ command, ...args ].join (' ');
        assert.ok (!commandLine.includes (session.token), platform + ': token in argv');
        assert.ok (!/127\.0\.0\.1|\/setup\/|https?:/.test (commandLine), platform + ': URL in argv');
    }
    // the file is readable by its owner only, inside a directory only the owner can enter
    assert.match (fs.readFileSync (file, 'utf8'), /<meta name="referrer" content="no-referrer">/);
    assert.ok (fs.readFileSync (file, 'utf8').includes ('<a rel="noreferrer" href="' + session.url + '">'), 'a link for browsers that do not follow the refresh');
    if (posix) {
        assert.equal (fs.statSync (file).mode & 0o777, 0o600);
        assert.equal (fs.statSync (path.dirname (file)).mode & 0o777, 0o700);
    }
    assert.deepEqual (fs.readdirSync (path.dirname (file)), [ 'open.html' ]);
    // nothing but the page is served before a browser is bound to the session
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex')).status, 404);
    assert.equal (fs.existsSync (file), true, 'a refused request does not consume the launch file');
    // the first page load removes the file and its directory
    assert.equal ((await raw (session.url)).status, 200);
    assert.equal (fs.existsSync (path.dirname (file)), false);
    assert.deepEqual (fs.readdirSync (h.launchRoot), []);
});

test ('security: the launch file is gone after expiry and after close() even if no browser ever loaded it', async () => {
    let h = await harness ();
    let session = await h.open ({}, { 'load': false });
    assert.equal (fs.existsSync (session.launchFile), true);
    h.clock.now += SESSION_TTL_MS;
    assert.equal ((await raw (session.url)).status, 404);
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'expiry');
    h = await harness ();
    session = await h.open ({}, { 'load': false });
    assert.equal (fs.existsSync (session.launchFile), true);
    await h.ctx.setup.close ();
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'close()');
});

test ('security: the first page load binds the session to that browser — the URL alone then opens nothing', async () => {
    const h = await harness ();
    const session = await h.open ({});
    // what the first load set
    assert.match (session.cookie, /^ccxt_setup=[0-9a-f]{32}$/);
    assert.notEqual (session.cookie.split ('=')[1], session.token);
    assert.notEqual (session.cookie.split ('=')[1], session.nonce);
    const first = await raw (session.url, { 'cookie': false, 'headers': { 'Cookie': session.cookie } });
    assert.equal (first.status, 200, 'a reload by the same browser works');
    assert.equal (first.headers['set-cookie'], undefined, 'and is not handed a new cookie');
    assert.equal (bootOf (first.text).csrf, session.nonce);
    // a second client that learned the URL (argv of old, the address bar, the launch file)
    const stranger = await raw (session.url, { 'cookie': false });
    assert.equal (stranger.status, 404);
    assert.equal (stranger.text, '');
    assert.equal (stranger.headers['set-cookie'], undefined);
    for (const cookie of [ 'ccxt_setup=' + '0'.repeat (32), 'ccxt_setup=' + session.token, 'ccxt_setup=', 'other=' + session.cookie.split ('=')[1] ]) {
        assert.equal ((await raw (session.url, { 'cookie': false, 'headers': { 'Cookie': cookie } })).status, 404, cookie.slice (0, 16));
    }
    // every other endpoint needs the cookie too — even with the right nonce and Origin
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex', { 'cookie': false })).status, 404);
    for (const action of [ 'test', 'save' ]) {
        const response = await post (session, action, saveBody (), {}, 'POST', false);
        assert.equal (response.status, 404, action);
        assert.equal (response.text, '');
    }
    assert.equal (fs.existsSync (h.configFile), false);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'none of that cost the real session anything');
    // the cookie rides along with other cookies the browser holds for 127.0.0.1
    assert.equal ((await raw (session.url + '/credentials?exchange=fakex', { 'cookie': false, 'headers': { 'Cookie': 'a=b; ' + session.cookie + '; c=d' } })).status, 200);
    assert.equal ((await post (session, 'save', saveBody ())).status, 200);
    // the cookie's own attributes
    const h2 = await harness ();
    const fresh = await h2.open ({}, { 'load': false });
    const setCookie = String (((await raw (fresh.url)).headers['set-cookie'] ?? [])[0]);
    // Lax, not Strict: a reload of a page first reached from the launch file is a cross-site
    // navigation to Chromium, and a Strict cookie would not come back with it
    assert.match (setCookie, /^ccxt_setup=[0-9a-f]{32}; HttpOnly; SameSite=Lax; Path=\/setup\/[0-9a-f]{32}$/);
    assert.ok (setCookie.endsWith ('Path=/setup/' + fresh.token), 'scoped to this form, so it is sent to no other loopback service');
});

test ('security: no number of blind requests closes the form (a hostile web page can send them)', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const origin = 'http://127.0.0.1:' + session.port;
    // what any page in the user's browser can fire at a loopback port without knowing anything
    const blind: Record<string, string>[] = [
        { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Mode': 'no-cors' },
        { 'Origin': 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' },
        { 'Host': 'evil.example:' + session.port },
        {}, // an old browser, or curl: no fetch metadata at all
    ];
    for (let i = 0; i < 60; i++) {
        const target = [ '/x', '/favicon.ico', '/setup/' + i.toString (16).padStart (32, '0'), '/setup/' + 'f'.repeat (32) + '/save' ][i % 4];
        const response = await raw (origin + target, { 'method': (i % 5 === 0) ? 'POST' : 'GET', 'headers': blind[i % blind.length] });
        assert.equal (response.status, 404);
        assert.equal (response.text, '');
    }
    assert.equal (h.ctx.setup.isListening (), true);
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    assert.equal ((await raw (session.url)).status, 200, 'the form is still there');
    assert.equal ((await post (session, 'save', saveBody ())).status, 200, 'and still saves');
    assert.ok (!h.stderr ().includes (session.token));
});

test ('close() (server shutdown) drops the session and the listener', async () => {
    const h = await harness ();
    const session = await h.open ({});
    await h.ctx.setup.close ();
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('hideDisabledTools with no account: saving one adds its tools to the running server (list_changed)', async () => {
    const h = await harness ({ 'settings': { 'hideDisabledTools': true } });
    let changed = 0;
    h.client.setNotificationHandler (ToolListChangedNotificationSchema, async () => {
        changed += 1;
    });
    const namesBefore = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok (!namesBefore.includes ('list_accounts') && !namesBefore.includes ('create_order'));
    let session = await h.open ({});
    assert.match (session.envelope.meta.notice, /added to this server's tool list the moment the account is saved/);
    assert.match (session.envelope.meta.notice, /restart the assistant app once/);
    // a view-only account lists the read tier, and only that
    let saved = JSON.parse ((await post (session, 'save', saveBody ())).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ true, false ]);
    let names = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    for (const name of [ 'list_accounts', 'get_balance', 'show_balance' ]) {
        assert.ok (names.includes (name), name + ' is listed after the save');
    }
    assert.ok (!names.includes ('create_order'), 'the trade tier stays hidden for a view-only account');
    assert.ok (!names.includes ('withdraw'));
    assert.equal ((await call (h.client, 'list_accounts', {})).data[0].name, 'main');
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).ok, true);
    await new Promise ((resolve) => setTimeout (resolve, 20));
    assert.ok (changed >= 1, 'the host was told the tool list changed');
    assert.match (h.stderr (), /now listing the read tools/);
    // turning order placement on for it lists the trade tier
    session = await h.open ({});
    assert.match (session.envelope.meta.notice, /hides disabled tool tiers/);
    saved = JSON.parse ((await post (session, 'save', saveBody ({ 'trading': true, 'replace': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ true, false ]);
    names = (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok (names.includes ('create_order') && names.includes ('execute_route'));
    assert.ok (!names.includes ('withdraw') && !names.includes ('call_implicit_write'), 'funds and raw writes are never listed by the form');
    // and a further save has nothing left to add
    session = await h.open ({});
    saved = JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'second', 'trading': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ false, false ]);
});

test ('without hideDisabledTools a save adds no tools and asks for no restart', async () => {
    const h = await harness ();
    const session = await h.open ({});
    assert.match (session.envelope.meta.notice, /usable immediately, no restart\.$/);
    const before = (await h.client.listTools ()).tools.length;
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'trading': true }))).text);
    assert.deepEqual ([ saved.toolsAdded, saved.restartForTools ], [ false, false ]);
    assert.equal ((await h.client.listTools ()).tools.length, before);
});

test ('an unconfigured account error now points at setup_account first, the config file second', async () => {
    const h = await harness ();
    const result = await call (h.client, 'get_balance', { 'account': 'binance' });
    assert.equal (result.error.code, 'UNKNOWN_ACCOUNT');
    assert.match (result.error.hint, /^To fix: call setup_account/);
    assert.ok (result.error.hint.includes (h.configFile));
    assert.match (result.error.hint, /never in this chat/);
});

test ('secrets: exactly the values put to use are redactable, and a value that was only tested is not kept', async () => {
    // an exchange that echoes the key it was given, as real ones do in their error text
    class Echo extends FakeExchange {
        async fetchBalance (): Promise<any> {
            throw new AuthenticationError ('bad apiKey=' + this.config['apiKey'] + ' sec=' + this.config['secret']);
        }
    }
    const h = await harness ({ 'exchangeClass': Echo });
    const session = await h.open ({});
    // pasted with stray whitespace: the exchange is sent — and echoes — the trimmed value
    const padded = await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': '  PADKEY-0123456789\n', 'secret': '\tPADSECRET-9876543210 ' }, 'environment': 'sandbox' });
    const body = JSON.parse (padded.text);
    assert.equal (body.error, 'bad apiKey=[redacted:apiKey] sec=[redacted:secret]');
    assert.ok (!padded.text.includes ('PADKEY') && !padded.text.includes ('PADSECRET') && !h.stderr ().includes ('PADKEY'));
    // …and once the test is over nothing of it stays registered
    assert.equal (redact ('PADKEY-0123456789 PADSECRET-9876543210'), 'PADKEY-0123456789 PADSECRET-9876543210');
    // the wrong thing pasted into a key box must not rewrite every later result that contains it
    await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': 'BTC/USDT', 'secret': 'sandbox' }, 'environment': 'sandbox' });
    assert.equal (redact ('{"symbol":"BTC/USDT","environment":"sandbox"}'), '{"symbol":"BTC/USDT","environment":"sandbox"}');
    // a field this exchange does not take is refused before anything is registered
    assert.equal ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET, 'somethingElse': 'NOTASECRET-123456' }, 'environment': 'sandbox' })).status, 400);
    assert.equal (redact ('NOTASECRET-123456 ' + KEY), 'NOTASECRET-123456 ' + KEY);
    // a refused save keeps nothing either
    assert.equal ((await post (session, 'save', saveBody ({ 'name': 'has space' }))).status, 400);
    assert.equal ((await post (session, 'save', saveBody ({ 'environment': 'live', 'trading': true }))).status, 400);
    assert.equal (redact (KEY + ' ' + SECRET), KEY + ' ' + SECRET);
    // a save does: the saved (trimmed) values stay redactable for the life of the server
    const saved = await post (session, 'save', saveBody ({ 'credentials': { 'apiKey': ' ' + KEY + ' ', 'secret': SECRET + '\n' } }));
    assert.equal (saved.status, 200);
    assert.equal (JSON.parse (saved.text).environment, 'sandbox', 'the response itself is not mangled');
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
    assert.equal (redact (KEY + ' ' + SECRET), '[redacted:apiKey] [redacted:secret]');
});

test ('secrets: testing keys an existing account already uses does not unregister that account\'s secrets', async () => {
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': KEY, 'secret': SECRET } } });
    // makeConfig does not go through loadConfig, which is what registers them at startup
    await h.ctx.pools.getAuthenticated ('main');
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    registerAccountSecrets (h.ctx.config.accounts['main']);
    const session = await h.open ({});
    assert.equal (JSON.parse ((await post (session, 'test', { 'exchange': 'fakex', 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'sandbox' })).text).ok, true);
    assert.equal (redact (KEY + ' ' + SECRET), '[redacted:apiKey] [redacted:secret]');
});

test ('account names: Object.prototype members are ordinary names, the three reserved ones are refused clearly', async () => {
    const h = await harness ();
    // before: such a name is simply an unknown account, not a function off the prototype
    for (const name of [ 'toString', 'valueOf', 'hasOwnProperty', 'constructor', '__proto__' ]) {
        assert.equal ((await call (h.client, 'get_balance', { 'account': name })).error.code, 'UNKNOWN_ACCOUNT', name);
    }
    const session = await h.open ({});
    for (const name of [ '__proto__', 'constructor', 'prototype' ]) {
        const response = await post (session, 'save', saveBody ({ name, 'replace': true }));
        assert.equal (response.status, 400, name);
        const body = JSON.parse (response.text);
        assert.equal (body.code, 'INVALID_NAME');
        assert.equal (body.error, '"' + name + '" cannot be used as an account name — choose a different one');
    }
    assert.equal (fs.existsSync (h.configFile), false);
    // "toString" does not "already exist" just because every object has one
    const saved = await post (session, 'save', saveBody ({ 'name': 'toString' }));
    assert.equal (saved.status, 200);
    assert.equal (JSON.parse (saved.text).replaced, false);
    assert.deepEqual (Object.keys (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']), [ 'toString' ]);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'toString' })).ok, true);
    // and now that it does exist, it needs the explicit replace like any other
    const again = await h.open ({});
    assert.equal (JSON.parse ((await post (again, 'save', saveBody ({ 'name': 'toString' }))).text).code, 'ACCOUNT_EXISTS');
    assert.equal (JSON.parse ((await post (again, 'save', saveBody ({ 'name': 'valueOf' }))).text).ok, true);
});

test ('replacing an account stops the private streams that ran on its old keys and environment', async () => {
    const before = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' }, 'other': { 'exchange': 'fakex', 'apiKey': 'OTHERKEY-0123456789', 'secret': 'OTHERSECRET-0123456789' } } };
    const h = await harness ({ 'configText': JSON.stringify (before), 'accounts': { 'main': { ...before.accounts.main }, 'other': { ...before.accounts.other } } });
    const subscribe = (account: string | undefined, method = 'watchTicker') => call (h.client, 'watch_subscribe', { 'exchange': 'fakex', method, 'symbol': 'BTC/USDT', ...(account ? { account } : {}) });
    const mine = await subscribe ('main');
    const mineTrades = await subscribe ('main', 'watchTrades');
    const others = await subscribe ('other');
    const publicStream = await subscribe (undefined);
    assert.deepEqual ([ mine.ok, mineTrades.ok, others.ok, publicStream.ok ], [ true, true, true, true ]);
    assert.equal (mine.data.environment, 'live');
    const oldInstance = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    // the account is replaced through the form: new key, and testnet instead of live
    const session = await h.open ({});
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'replace': true }))).text);
    assert.equal (saved.ok, true);
    assert.equal (saved.stoppedStreams, 2);
    assert.match (h.stderr (), /stopped 2 live stream\(s\) that ran on its old keys/);
    assert.match (journalText (h.journalDir), /"stoppedStreams":2/);
    // long enough for a stream that was merely disconnected to have reconnected
    await new Promise ((resolve) => setTimeout (resolve, 1300));
    const listed = (await call (h.client, 'watch_list', {})).data.map ((entry: any) => entry.subscriptionId).sort ();
    assert.deepEqual (listed, [ others.data.subscriptionId, publicStream.data.subscriptionId ].sort (), 'only the replaced account\'s streams are gone');
    assert.equal (oldInstance.closed, true);
    const read = await call (h.client, 'watch_read', { 'subscriptionId': mine.data.subscriptionId });
    assert.equal (read.ok, false, 'the old stream cannot be read as if it were still running');
    // a new subscription is a new stream on the new keys and environment, not the old one handed back
    const fresh = await subscribe ('main');
    assert.equal (fresh.ok, true);
    assert.notEqual (fresh.data.subscriptionId, mine.data.subscriptionId);
    assert.equal (fresh.data.reused, undefined);
    assert.equal (fresh.data.environment, 'sandbox');
    assert.equal ((await h.ctx.pools.getAuthenticated ('main')).exchange.config.apiKey, KEY);
    await h.ctx.subscriptions.closeAll ();
});

test ('get_safety_status: startup problems a save made untrue are cleared, the ones still true stay', async () => {
    const stale = [
        'account "main": "trading": true only enables SANDBOX/DEMO trading, but this account is live — set "trading": "live" to explicitly enable live trading (and author a "maxOrderValue" cap), or add "sandbox": true',
        'account "main" invalid: apiKey Expected string, received number',
        'WARNING: config file /somewhere/config.json is readable by other users — run: chmod 600 "/somewhere/config.json"',
        'CCXT_MCP_CONFIG points to a missing file: /somewhere/config.json',
    ];
    const kept = [
        'account "main2": "funds": "live" requires a "maxTransferValue" (per-transfer value cap in USD) — set a number, or explicitly null to opt out of the cap',
        'env/.mcpb-form account "main" (fakex) is shadowed by a config-file account of the same name — the config-file account is used; rename one to keep both',
        'settings invalid: maxResults Expected number, received string',
    ];
    const h = await harness ({ 'accounts': { 'main': { 'apiKey': 'OLDKEY-0123456789', 'secret': 'OLDSECRET-0123456789' } }, 'problems': [ ...stale, ...kept ] });
    assert.equal ((await call (h.client, 'get_safety_status', {})).data.configProblems.length, 7);
    const session = await h.open ({});
    assert.equal ((await post (session, 'save', saveBody ({ 'replace': true, 'trading': true }))).status, 200);
    const status = (await call (h.client, 'get_safety_status', {})).data;
    assert.deepEqual (status.configProblems, kept);
    assert.deepEqual ([ status.accounts[0].environment, status.accounts[0].trading ], [ 'sandbox', true ]);
    assert.equal (status.configPath, h.configFile);
});

test ('hints: order placement and a missing account point at setup_account; funds and raw writes stay file-only', async () => {
    const h = await harness ({ 'accounts': { 'ro': { 'apiKey': KEY, 'secret': SECRET, 'sandbox': true } } });
    const order = await call (h.client, 'create_order', { 'account': 'ro', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 });
    assert.equal (order.error.code, 'TIER_DISABLED');
    assert.match (order.error.hint, /^Call setup_account and have the user save this account again/);
    assert.match (order.error.hint, /Alternative: the user edits the ccxt-mcp config file/);
    assert.ok (!/No tool can enable it/.test (order.error.hint));
    assert.match (order.error.message, /setup form \(setup_account\) or in the ccxt-mcp config file/);
    const withdraw = await call (h.client, 'withdraw', { 'account': 'ro', 'code': 'USDT', 'amount': 1, 'address': 'x' });
    assert.equal (withdraw.error.code, 'TIER_DISABLED');
    assert.ok (!/setup_account/.test (withdraw.error.hint + withdraw.error.message), 'the form cannot enable fund movements, so the hint must not suggest it');
    assert.match (withdraw.error.message, /must edit the ccxt-mcp config file/);
    const empty = await harness ();
    const accounts = await call (empty.client, 'list_accounts', {});
    assert.match (accounts.meta.notice, /^no accounts configured — call setup_account/);
    const status = (await call (empty.client, 'get_safety_status', {})).data;
    assert.ok (status.configPath.includes ('setup_account') && status.configPath.includes (empty.configFile), 'names the form and where it would create the file');
});

test ('real catalogue: what the form offers follows the exchange — demo-as-sandbox, wallet keys, prediction accounts, config-file-only', async () => {
    const h = await harness ({ 'real': true });
    const session = await h.open ({});
    const describe = async (query: string) => JSON.parse ((await raw (session.url + '/credentials?exchange=' + query)).text);
    const names = (info: any) => info.fields.map ((field: any) => field.name);
    // OKX has no separate testnet: ccxt's sandbox there is OKX demo trading
    for (const id of [ 'okx', 'myokx', 'okxus' ]) {
        const info = await describe (id);
        assert.deepEqual ([ info.environments.sandbox, info.environments.demo, info.sandboxIsDemo ], [ true, false, true ], id);
    }
    // a real testnet on its own host, and an exchange with both, are not relabelled
    assert.equal ((await describe ('bybit')).sandboxIsDemo, false);
    const binance = await describe ('binance');
    assert.deepEqual ([ binance.environments.sandbox, binance.environments.demo, binance.sandboxIsDemo ], [ true, true, false ]);
    assert.deepEqual ([ binance.predictionVariant, binance.prediction, binance.configFileOnly, binance.walletKey ], [ true, false, false, false ]);
    assert.equal ((await describe ('kraken')).predictionVariant, false);
    // wallet-signing venues ask for the pair they need
    const hyperliquid = await describe ('hyperliquid');
    assert.deepEqual (names (hyperliquid), [ 'walletAddress', 'privateKey' ]);
    assert.deepEqual ([ hyperliquid.walletKey, hyperliquid.predictionVariant ], [ true, true ]);
    // ids that exist twice: the prediction account is its own class, described as such
    const binancePrediction = await describe ('binance&prediction=1');
    assert.equal (binancePrediction.prediction, true);
    assert.deepEqual (names (binancePrediction), [ 'apiKey', 'secret' ]);
    assert.match (binancePrediction.website, /prediction/);
    const polymarket = await describe ('polymarket');
    assert.deepEqual ([ polymarket.predictionVariant, polymarket.configFileOnly ], [ true, false ]);
    assert.deepEqual (names (polymarket), [ 'privateKey' ]);
    // venues ccxt declares no credential for cannot be configured here, and say so
    const polymarketPrediction = await describe ('polymarket&prediction=1');
    assert.deepEqual ([ polymarketPrediction.configFileOnly, names (polymarketPrediction).length ], [ true, 0 ]);
    assert.equal ((await describe ('dydx')).configFileOnly, true);
    assert.equal ((await describe ('kraken&prediction=1')).code, 'NO_PREDICTION');
    for (const body of [
        { 'name': 'd', 'exchange': 'dydx', 'credentials': {}, 'environment': 'live', 'trading': false },
        { 'name': 'p', 'exchange': 'polymarket', 'prediction': true, 'credentials': {}, 'environment': 'live', 'trading': false },
    ]) {
        const response = await post (session, 'save', body);
        assert.equal (response.status, 400);
        assert.equal (JSON.parse (response.text).code, 'CONFIG_FILE_ONLY');
        assert.match (JSON.parse (response.text).error, /add the account to the config file instead/);
        assert.equal (JSON.parse ((await post (session, 'test', { 'exchange': body.exchange, 'prediction': body.prediction, 'credentials': {}, 'environment': 'live' })).text).code, 'CONFIG_FILE_ONLY');
    }
    assert.equal (fs.existsSync (h.configFile), false, 'no credential-less account was written');
    assert.equal (JSON.parse ((await post (session, 'save', { 'name': 'k', 'exchange': 'kraken', 'prediction': true, 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'live', 'trading': false })).text).code, 'NO_PREDICTION');
    // an exchange with no balance endpoint is "not tested", never "failed" (and no request is made)
    const untestable = JSON.parse ((await post (session, 'test', { 'exchange': 'predictfun', 'credentials': { 'apiKey': KEY }, 'environment': 'live' })).text);
    assert.deepEqual (untestable, { 'ok': true, 'tested': false, 'code': 'NOT_TESTABLE' });
    assert.match (h.stderr (), /connection test on predictfun was skipped/);
    // a prediction account on a two-sided id is saved as one
    const saved = JSON.parse ((await post (session, 'save', { 'name': 'bpred', 'exchange': 'binance', 'prediction': true, 'credentials': { 'apiKey': KEY, 'secret': SECRET }, 'environment': 'live', 'trading': false })).text);
    assert.equal (saved.ok, true);
    assert.deepEqual (JSON.parse (fs.readFileSync (h.configFile, 'utf8'))['accounts']['bpred'], { 'exchange': 'binance', 'prediction': true, 'apiKey': KEY, 'secret': SECRET });
    const account = (await call (h.client, 'list_accounts', {})).data[0];
    assert.deepEqual ([ account.name, account.exchange, account.prediction ], [ 'bpred', 'binance', true ]);
    // setup_account says up front when the preselected exchange cannot be done in the form
    const dydx = await h.open ({ 'exchange': 'dydx' });
    assert.ok (dydx.envelope.data.asksFor.some ((line: string) => /dydx takes its credentials in a way the form cannot collect/.test (line)));
});

// ---------------------------------------------------------------------------------------
// "Your accounts" (manage_accounts): the second page on the same session machinery

// unlike KEY / SECRET above these share no four characters with any word on the pages, so
// "no part of them appears anywhere" can be asserted window by window
const MKEY = 'Kq7Zx9Lm2Vb4Np8Rt6Wy';
const MSECRET = 'Hd3Gf5Js1Ka9Lo7Pi2Uy';
const OKEY = 'Xw4Cv8Bn3Mq6Zl1Kj5Ht';
const OSECRET = 'Pf2Dg7Sa9Yu4Ie6Ro1Tw';

function windows (value: string, size: number): string[] {
    const out: string[] = [];
    for (let i = 0; i + size <= value.length; i++) {
        out.push (value.slice (i, i + size));
    }
    return out;
}

// the only part of any credential that may ever leave the server: the last 4 of an API key
function assertOnlyLastFour (haystack: string, label: string, keys: string[], others: string[]): void {
    for (const key of keys) {
        for (const part of windows (key, 4).slice (0, -1)) {
            assert.ok (!haystack.includes (part), label + ': part of an API key leaked (' + part + ')');
        }
    }
    for (const other of others) {
        for (const part of windows (other, 4)) {
            assert.ok (!haystack.includes (part), label + ': part of a secret leaked (' + part + ')');
        }
    }
}

const manageFile = () => ({
    'accounts': {
        'main': { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true, 'trading': true },
        'real': { 'exchange': 'fakex', 'apiKey': OKEY, 'secret': OSECRET, 'funds': 'live', 'maxTransferValue': 5, 'implicitWrites': true, 'options': { 'a': [ 1 ] } },
    },
    'settings': { 'maxResults': 7 },
    'notes': 'mine',
});

async function manageHarness (extra: any = {}): Promise<Harness> {
    const file = manageFile ();
    return harness ({ 'configText': JSON.stringify (file, null, 2), 'accounts': { 'main': { ...file.accounts.main }, 'real': { ...file.accounts.real }, 'envacct': { 'apiKey': 'Ev5Nb2Qc8Xd1Wm6Lz3Kp', 'secret': 'Ty9Uh4Gi7Fo2Aj5Sl8Dq', 'sandbox': true } }, ...extra });
}

const manage = (h: Harness, args: any = {}, options: any = {}) => h.open (args, { ...options, 'tool': 'manage_accounts' });
const fileOf = (h: Harness) => JSON.parse (fs.readFileSync (h.configFile, 'utf8'));

test ('manage_accounts opens the accounts page and tells the model nothing that identifies it', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    assert.equal (session.envelope.ok, true);
    assert.equal (session.envelope.data.opened, true);
    assert.equal (session.envelope.data.expiresInSeconds, 600);
    assert.match (session.envelope.meta.notice, /Do NOT ask them to paste or type any key/);
    assert.match (session.url, /^http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32}$/);
    for (const haystack of [ session.text, h.stderr () ]) {
        assert.ok (!haystack.includes (session.token) && !haystack.includes (session.nonce), 'token or nonce leaked');
        assert.ok (!/127\.0\.0\.1:\d|\/setup\//.test (haystack), 'URL leaked');
        assertOnlyLastFour (haystack, 'tool result / log', [], [ MKEY, MSECRET, OKEY, OSECRET ]);
    }
    assert.match (h.stderr (), /accounts page opened in the browser/);
    const tools = (await h.client.listTools ()).tools as any[];
    const tool = tools.find ((entry) => entry.name === 'manage_accounts');
    assert.deepEqual (tool.annotations, { 'readOnlyHint': false, 'destructiveHint': false, 'idempotentHint': false, 'openWorldHint': false });
    assert.deepEqual (Object.keys (tool.inputSchema.properties), [ 'restart' ]);
    // hosts pass tool definitions to the model under a size budget
    for (const name of [ 'manage_accounts', 'setup_account' ]) {
        assert.ok (tools.find ((entry) => entry.name === name).description.length <= 350, name + ' description must stay short');
    }
});

test ('accounts page: same strict headers as the form; lists names, modes and the last 4 of the API key — nothing else of any key', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const page = await raw (session.url);
    assert.equal (page.status, 200);
    const csp = String (page.headers['content-security-policy']);
    assert.match (csp, /^default-src 'none'; script-src 'nonce-[A-Za-z0-9+/=]+'; style-src 'nonce-[A-Za-z0-9+/=]+'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'$/);
    assert.equal (page.headers['x-frame-options'], 'DENY');
    assert.equal (page.headers['cache-control'], 'no-store');
    assert.equal (page.headers['referrer-policy'], 'no-referrer');
    assert.match (page.text, /<title>Your accounts/);
    assert.ok (!/\son[a-z]+="|style="/.test (page.text), 'no inline handlers or style attributes');
    assert.ok (!/<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//.test (page.text), 'no external assets');
    assert.ok (!page.text.includes ('__CSP_NONCE__') && !page.text.includes ('__BOOT_JSON__') && !page.text.includes ('@include'));
    const boot = bootOf (page.text);
    assert.equal (boot.configPath, h.configFile);
    const byName = Object.fromEntries (boot.accounts.map ((entry: any) => [ entry.name, entry ]));
    assert.deepEqual (Object.keys (byName), [ 'main', 'real', 'envacct' ]);
    assert.deepEqual (byName['main'], {
        'name': 'main', 'exchange': 'fakex', 'exchangeName': 'Fakex', 'prediction': false, 'environment': 'sandbox', 'sandboxIsDemo': false, 'trading': true,
        'funds': false, 'implicitWrites': false, 'credentials': [ 'API key', 'API secret' ], 'keyEnding': MKEY.slice (-4),
        'source': 'file', 'loaded': true, 'canRemove': true, 'canEditPermissions': true, 'canReplace': true,
    });
    assert.deepEqual ([ byName['real'].environment, byName['real'].trading, byName['real'].funds, byName['real'].implicitWrites, byName['real'].keyEnding ], [ 'live', false, true, true, OKEY.slice (-4) ]);
    // an account the file does not hold is shown, read-only
    assert.deepEqual ([ byName['envacct'].source, byName['envacct'].canRemove, byName['envacct'].canEditPermissions, byName['envacct'].canReplace ], [ 'environment', false, false, false ]);
    const listed = await raw (session.url + '/accounts');
    assert.deepEqual (JSON.parse (listed.text).accounts, boot.accounts);
    for (const response of [ page, listed ]) {
        assertOnlyLastFour (response.text, 'accounts page', [ MKEY, OKEY, 'Ev5Nb2Qc8Xd1Wm6Lz3Kp' ], [ MSECRET, OSECRET, 'Ty9Uh4Gi7Fo2Aj5Sl8Dq' ]);
        assert.ok (!/"(secret|password|privateKey|apiKey)"\s*:/.test (response.text), 'no credential field is ever serialised');
        for (const header of Object.keys (response.headers)) {
            assert.ok (!header.startsWith ('access-control-'));
        }
    }
    // a key too short to show four characters of shows none
    const short = await harness ({ 'configText': JSON.stringify ({ 'accounts': { 's': { 'exchange': 'fakex', 'apiKey': 'Sh0rtKey9' } } }), 'accounts': { 's': { 'apiKey': 'Sh0rtKey9' } } });
    const shortBoot = bootOf ((await raw ((await manage (short)).url)).text);
    assert.equal (shortBoot.accounts[0].keyEnding, undefined);
});

test ('accounts page security: every rule of the setup form holds — token, Host, Origin, nonce, content type, cookie, expiry', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const origin = 'http://127.0.0.1:' + session.port;
    const before = fs.readFileSync (h.configFile, 'utf8');
    const removal = { 'name': 'main', 'confirm': true };
    const bodies: Record<string, any> = { 'remove': removal, 'permissions': { 'name': 'main', 'trading': false }, 'close': {} };
    // wrong token
    const wrongToken = session.token.replace (/^./, (c) => ((c === '0') ? '1' : '0'));
    for (const action of [ '', '/accounts', '/wizard', '/remove', '/permissions', '/close' ]) {
        for (const method of [ 'GET', 'POST' ]) {
            const response = await raw (origin + '/setup/' + wrongToken + action, { method, 'headers': (method === 'POST') ? { 'Content-Type': 'application/json', 'Origin': origin, 'X-Setup-Nonce': session.nonce } : {}, 'body': (method === 'POST') ? JSON.stringify (removal) : undefined });
            assert.equal (response.status, 404, method + ' ' + action);
            assert.equal (response.text, '');
        }
    }
    // Host (DNS rebinding)
    for (const host of [ 'evil.example:' + session.port, '127.0.0.1', '127.0.0.1.evil.example:' + session.port ]) {
        assert.equal ((await raw (session.url, { 'headers': { 'Host': host } })).status, 404, host);
        assert.equal ((await raw (session.url + '/accounts', { 'headers': { 'Host': host } })).status, 404, host);
        assert.equal ((await post (session, 'remove', removal, { 'Host': host, 'Origin': 'http://' + host })).status, 404, host);
    }
    // Origin, fetch metadata, content type, nonce — on every write of the page
    const cases: [ string, Record<string, string | undefined>, number ][] = [
        [ 'missing Origin', { 'Origin': undefined }, 403 ],
        [ 'foreign Origin', { 'Origin': 'https://evil.example' }, 403 ],
        [ 'null Origin', { 'Origin': 'null' }, 403 ],
        [ 'localhost Origin on a 127.0.0.1 page', { 'Origin': 'http://localhost:' + session.port }, 403 ],
        [ 'cross-site fetch metadata', { 'Sec-Fetch-Site': 'cross-site' }, 403 ],
        [ 'form content type', { 'Content-Type': 'application/x-www-form-urlencoded' }, 415 ],
        [ 'no content type', { 'Content-Type': undefined }, 415 ],
        [ 'missing nonce', { 'X-Setup-Nonce': undefined }, 403 ],
        [ 'wrong nonce', { 'X-Setup-Nonce': '0'.repeat (32) }, 403 ],
        [ 'the token is not the nonce', { 'X-Setup-Nonce': session.token }, 403 ],
    ];
    for (const action of Object.keys (bodies)) {
        for (const [ label, overrides, status ] of cases) {
            assert.equal ((await post (session, action, bodies[action], overrides)).status, status, action + ': ' + label);
        }
        for (const method of [ 'GET', 'PUT', 'DELETE' ]) {
            const response = await post (session, action, (method === 'GET') ? '' : bodies[action], {}, method);
            assert.equal (response.status, 405, method + ' ' + action);
            assert.equal (response.headers['allow'], 'POST');
        }
        assert.equal ((await post (session, action, '{not json')).status, 400);
        // cookie binding: the right URL, Origin and nonce without the browser's cookie
        const stranger = await post (session, action, bodies[action], {}, 'POST', false);
        assert.equal (stranger.status, 404, action);
        assert.equal (stranger.text, '');
    }
    for (const read of [ '', '/accounts', '/wizard', '/credentials?exchange=fakex' ]) {
        assert.equal ((await raw (session.url + read, { 'cookie': false })).status, 404, 'no cookie: ' + read);
        assert.equal ((await raw (session.url + read, { 'cookie': false, 'headers': { 'Cookie': 'ccxt_setup=' + session.token } })).status, 404);
    }
    assert.equal ((await raw (session.url + '/accounts', { 'method': 'POST' })).status, 405);
    assert.equal ((await raw (session.url + '/wizard', { 'method': 'POST' })).status, 405);
    assert.equal ((await raw (session.url + '/unknown')).status, 404);
    assert.equal ((await post (session, 'remove', JSON.stringify ({ ...removal, 'padding': 'x'.repeat (MAX_BODY_BYTES) }))).status, 413);
    // none of that changed anything or cost the session anything
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    assert.match (session.cookie, /^ccxt_setup=[0-9a-f]{32}$/);
    // expiry: fixed, not extended by the activity above
    h.clock.now += SESSION_TTL_MS - 1;
    assert.equal ((await raw (session.url + '/accounts')).status, 200);
    h.clock.now += 1;
    const expired = await post (session, 'remove', removal);
    assert.equal (expired.status, 404);
    assert.equal (expired.text, '');
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('accounts page security: the launch file, the first-load binding and the two page kinds stay apart', async () => {
    const h = await manageHarness ();
    const unloaded = await manage (h, {}, { 'load': false });
    assert.equal (path.basename (unloaded.launchFile), 'open.html');
    if (posix) {
        assert.equal (fs.statSync (unloaded.launchFile).mode & 0o777, 0o600);
    }
    // nothing but the page before a browser is bound
    assert.equal ((await raw (unloaded.url + '/accounts')).status, 404);
    assert.equal ((await raw (unloaded.url + '/wizard')).status, 404);
    const first = await raw (unloaded.url);
    assert.equal (first.status, 200);
    assert.match (String ((first.headers['set-cookie'] ?? [])[0]), /^ccxt_setup=[0-9a-f]{32}; HttpOnly; SameSite=Lax; Path=\/setup\/[0-9a-f]{32}$/);
    assert.deepEqual (fs.readdirSync (h.launchRoot), [], 'the launch file went with the first page load');
    assert.equal ((await raw (unloaded.url, { 'cookie': false })).status, 404, 'the URL alone now opens nothing');
    await h.ctx.setup.close ();
    // a SETUP session knows nothing of the account list or of changing accounts
    const h2 = await manageHarness ();
    const form = await h2.open ({});
    for (const read of [ '/accounts', '/wizard', '/wizard?account=main' ]) {
        const response = await raw (form.url + read);
        assert.equal (response.status, 404, read);
        assert.equal (response.text, '');
    }
    for (const [ action, body ] of [ [ 'remove', { 'name': 'main', 'confirm': true } ], [ 'permissions', { 'name': 'main', 'trading': false } ], [ 'close', {} ] ] as [ string, any ][]) {
        const response = await post (form, action, body);
        assert.equal (response.status, 404, action);
        assert.equal (response.text, '');
    }
    assert.deepEqual (fileOf (h2), manageFile ());
    assert.equal (bootOf ((await raw (form.url)).text).accounts, undefined, 'the setup form is told nothing about existing accounts');
    // a page the user has open is not replaced by the other tool
    const blocked = await manage (h2);
    assert.deepEqual ([ blocked.envelope.data.opened, blocked.envelope.data.alreadyOpen, blocked.envelope.data.openPage ], [ false, true, 'setup' ]);
    assert.match (blocked.envelope.meta.notice, /setup form from an earlier setup_account call is still open/);
    assert.equal (h2.launches.length, 1);
    assert.match ((await raw (form.url)).text, /<title>Connect an exchange account/);
    const restarted = await manage (h2, { 'restart': true });
    assert.equal (restarted.envelope.data.opened, true);
    assert.equal ((await raw (form.url)).status, 404, 'restart retires the form completely');
    assert.match ((await raw (restarted.url)).text, /<title>Your accounts/);
    const other = await h2.open ({ 'exchange': 'fakex' });
    assert.deepEqual ([ other.envelope.data.opened, other.envelope.data.openPage ], [ false, 'accounts' ]);
    assert.match (other.envelope.meta.notice, /press "Add another account" there/);
    const again = await manage (h2);
    assert.deepEqual ([ again.envelope.data.opened, again.envelope.data.openPage ], [ false, 'accounts' ]);
    assert.equal (h2.launches.length, 2);
    for (const text of [ blocked.text, other.text, again.text ]) {
        assert.ok (!text.includes (restarted.token) && !/127\.0\.0\.1:\d|\/setup\//.test (text));
    }
});

test ('remove: needs the explicit confirm, takes the account out of the file and the running server, and touches nothing else', async () => {
    const stale = [
        'account "main": "trading": true only enables SANDBOX/DEMO trading, but this account is live',
        'env/.mcpb-form account "main" (fakex) is shadowed by a config-file account of the same name — the config-file account is used; rename one to keep both',
        'WARNING: config file /somewhere/config.json is readable by other users — run: chmod 600 "/somewhere/config.json"',
    ];
    const kept = [ 'account "real": "funds": "live" requires a "maxTransferValue"', 'settings invalid: maxResults Expected number, received string' ];
    const h = await manageHarness ({ 'problems': [ ...stale, ...kept ] });
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    for (const account of Object.values (h.ctx.config.accounts)) {
        registerAccountSecrets (account as any);
    }
    const subscribe = (account: string | undefined) => call (h.client, 'watch_subscribe', { 'exchange': 'fakex', 'method': 'watchTicker', 'symbol': 'BTC/USDT', ...(account ? { account } : {}) });
    const mine = await subscribe ('main');
    const others = await subscribe ('real');
    const publicStream = await subscribe (undefined);
    const cachedMain = (await h.ctx.pools.getAuthenticated ('main')).exchange;
    const cachedReal = (await h.ctx.pools.getAuthenticated ('real')).exchange;
    const session = await manage (h);
    const before = fs.readFileSync (h.configFile, 'utf8');
    const responses: string[] = [];
    // refusals: each leaves the file byte-for-byte and the server as it was
    for (const [ body, status, code ] of [
        [ { 'name': 'main' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': 'yes' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'confirm': true, 'also': 'real' }, 400, 'BAD_REQUEST' ],
        [ { 'name': [ 'main' ], 'confirm': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'nope', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': '__proto__', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'settings', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'toString', 'confirm': true }, 400, 'UNKNOWN_ACCOUNT' ],
        // defined outside the file: shown, never removable here
        [ { 'name': 'envacct', 'confirm': true }, 409, 'NOT_IN_FILE' ],
    ] as [ any, number, string ][]) {
        const response = await post (session, 'remove', body);
        responses.push (response.text);
        assert.equal (response.status, status, JSON.stringify (body));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (body));
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
    assert.ok (!cachedMain.closed);
    // the removal
    const removed = await post (session, 'remove', { 'name': 'main', 'confirm': true });
    responses.push (removed.text);
    assert.equal (removed.status, 200);
    const result = JSON.parse (removed.text);
    assert.deepEqual ([ result.ok, result.removed, result.stoppedStreams, result.returnsOnRestart ], [ true, 'main', 1, true ]);
    assert.deepEqual (result.accounts.map ((entry: any) => entry.name), [ 'real', 'envacct' ]);
    const expected: any = manageFile ();
    delete expected.accounts.main;
    assert.deepEqual (fileOf (h), expected, 'only that account is gone: other accounts, settings and unknown keys are as they were');
    assert.match (fs.readFileSync (h.configFile, 'utf8'), /^\{\n  "accounts"/, 'the file keeps its own indentation');
    if (posix) {
        assert.equal (fs.statSync (h.configFile).mode & 0o777, 0o600);
    }
    assert.deepEqual (fs.readdirSync (path.dirname (h.configFile)), [ 'config.json' ], 'no temp file left behind');
    // hot-applied: gone from the running server, its stream stopped, its client closed
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'real', 'envacct' ]);
    assert.equal ((await call (h.client, 'get_balance', { 'account': 'main' })).error.code, 'UNKNOWN_ACCOUNT');
    assert.equal (cachedMain.closed, true);
    const streams = (await call (h.client, 'watch_list', {})).data.map ((entry: any) => entry.subscriptionId).sort ();
    assert.deepEqual (streams, [ others.data.subscriptionId, publicStream.data.subscriptionId ].sort ());
    assert.ok (mine.ok);
    // the other account on the same exchange is untouched: same client, still redacted
    assert.equal ((await h.ctx.pools.getAuthenticated ('real')).exchange, cachedReal);
    assert.ok (!cachedReal.closed);
    assert.equal (redact (OKEY + ' ' + OSECRET), '[redacted:apiKey] [redacted:secret]');
    // …and the removed account's values are forgotten once the response is out
    assert.equal (redact (MKEY + ' ' + MSECRET), MKEY + ' ' + MSECRET);
    assert.deepEqual ((await call (h.client, 'get_safety_status', {})).data.configProblems, kept);
    // recorded as names and modes; the session goes on
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"manage_accounts","method":"removeAccount"/);
    assert.match (journal, /"wasInUse":true,"stoppedStreams":1,"returnsOnRestart":true/);
    assert.match (h.stderr (), /account "main" on fakex removed via the accounts page — stopped 1 live stream/);
    assert.equal (h.ctx.setup.hasLiveSession (), true, 'an accounts session is not used up by an action');
    assert.equal (JSON.parse ((await post (session, 'remove', { 'name': 'main', 'confirm': true })).text).code, 'UNKNOWN_ACCOUNT', 'a second removal finds nothing');
    for (const haystack of [ ...responses, journal, h.stderr () ]) {
        assertOnlyLastFour (haystack, 'remove', [ MKEY, OKEY ], [ MSECRET, OSECRET, session.token, session.nonce ]);
    }
    await h.ctx.subscriptions.closeAll ();
});

test ('remove: a credential another account still uses stays redactable', async () => {
    const shared = { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET };
    const h = await harness ({ 'configText': JSON.stringify ({ 'accounts': { 'a': shared, 'b': { ...shared, 'sandbox': true } } }), 'accounts': { 'a': { ...shared }, 'b': { ...shared, 'sandbox': true } } });
    const { registerAccountSecrets } = await import ('../../ts/config.js');
    registerAccountSecrets (h.ctx.config.accounts['a']);
    const session = await manage (h);
    assert.equal ((await post (session, 'remove', { 'name': 'a', 'confirm': true })).status, 200);
    assert.equal (redact (MKEY + ' ' + MSECRET), '[redacted:apiKey] [redacted:secret]');
    assert.equal ((await post (session, 'remove', { 'name': 'b', 'confirm': true })).status, 200);
    assert.equal (redact (MKEY + ' ' + MSECRET), MKEY + ' ' + MSECRET);
    assert.deepEqual (fileOf (h), { 'accounts': {} });
});

test ('permissions: off needs nothing, practice needs nothing, LIVE needs the cap and the confirmation — and only "trading" is edited', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    const before = fs.readFileSync (h.configFile, 'utf8');
    const responses: string[] = [];
    const cachedReal = (await h.ctx.pools.getAuthenticated ('real')).exchange;
    for (const [ body, status, code ] of [
        // live: exactly the two conditions of the setup form
        [ { 'name': 'real', 'trading': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 0, 'liveConfirmed': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': -1, 'liveConfirmed': true }, 400, 'CAP_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 25 }, 400, 'CONFIRM_REQUIRED' ],
        [ { 'name': 'real', 'trading': true, 'maxOrderValue': 25, 'liveConfirmed': false }, 400, 'CONFIRM_REQUIRED' ],
        // the tiers and fields this page does not own cannot be smuggled in
        [ { 'name': 'real', 'trading': 'live', 'maxOrderValue': 25, 'liveConfirmed': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'real', 'trading': false, 'funds': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'funds': 'live', 'maxTransferValue': 1000 }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'implicitWrites': true }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'sandbox': false }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main', 'trading': true, 'environment': 'live' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'main' }, 400, 'BAD_REQUEST' ],
        [ { 'name': 'nope', 'trading': false }, 400, 'UNKNOWN_ACCOUNT' ],
        [ { 'name': 'envacct', 'trading': true }, 409, 'NOT_IN_FILE' ],
    ] as [ any, number, string ][]) {
        const response = await post (session, 'permissions', body);
        responses.push (response.text);
        assert.equal (response.status, status, JSON.stringify (body));
        assert.equal (JSON.parse (response.text).code, code, JSON.stringify (body));
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before, 'a refused change writes nothing');
    assert.deepEqual ([ h.ctx.config.accounts['real'].trading, h.ctx.config.accounts['main'].trading ], [ undefined, true ]);
    // practice account: off without any confirmation, then on again
    let response = await post (session, 'permissions', { 'name': 'main', 'trading': false });
    responses.push (response.text);
    assert.equal (response.status, 200);
    assert.deepEqual ([ JSON.parse (response.text).trading, JSON.parse (response.text).accounts[0].trading ], [ false, false ]);
    let expected: any = manageFile ();
    delete expected.accounts.main.trading;
    assert.deepEqual (fileOf (h), expected);
    assert.equal ((await call (h.client, 'create_order', { 'account': 'main', 'symbol': 'BTC/USDT', 'type': 'limit', 'side': 'buy', 'amount': 0.001, 'price': 10000 })).error.code, 'TIER_DISABLED', 'hot-applied: orders are refused at once');
    response = await post (session, 'permissions', { 'name': 'main', 'trading': true });
    assert.equal (response.status, 200);
    assert.deepEqual (fileOf (h), manageFile ());
    assert.equal ((await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'main').trading, true);
    // live account: with the cap and the yes
    response = await post (session, 'permissions', { 'name': 'real', 'trading': true, 'maxOrderValue': 40, 'liveConfirmed': true });
    responses.push (response.text);
    assert.equal (response.status, 200);
    expected = manageFile ();
    // funds, its cap, implicitWrites and everything else in the record are exactly as they were
    expected.accounts.real = { ...expected.accounts.real, 'trading': 'live', 'maxOrderValue': 40, 'confirm': 'always' };
    assert.deepEqual (fileOf (h), expected);
    assert.deepEqual (Object.keys (fileOf (h).accounts.real), [ 'exchange', 'apiKey', 'secret', 'funds', 'maxTransferValue', 'implicitWrites', 'options', 'trading', 'maxOrderValue', 'confirm' ]);
    const real = (await call (h.client, 'list_accounts', {})).data.find ((entry: any) => entry.name === 'real');
    assert.deepEqual ([ real.environment, real.trading, real.maxOrderValue, real.confirm, real.funds, real.implicitWrites, real.maxTransferValue ], [ 'live', 'live', 40, 'always', 'live', true, 5 ]);
    assert.equal ((await h.ctx.pools.getAuthenticated ('real')).exchange, cachedReal, 'same keys, same environment: the client is kept');
    // off again: no confirmation, and the funds tier is still not touched
    response = await post (session, 'permissions', { 'name': 'real', 'trading': false });
    assert.equal (response.status, 200);
    assert.deepEqual ([ fileOf (h).accounts.real.trading, fileOf (h).accounts.real.funds, fileOf (h).accounts.real.implicitWrites ], [ undefined, 'live', true ]);
    assert.deepEqual ([ h.ctx.config.accounts['real'].trading, h.ctx.config.accounts['real'].funds, h.ctx.config.accounts['real'].implicitWrites ], [ false, 'live', true ]);
    const journal = journalText (h.journalDir);
    assert.match (journal, /"tool":"manage_accounts","method":"setPermissions","outcome":\{"source":"accounts page","trading":"live","maxOrderValue":40,"previousTrading":false\}/);
    assert.match (h.stderr (), /account "real" on fakex changed via the accounts page: now LIVE trading, max order 40 USD \(live\)/);
    assert.match (h.stderr (), /account "main" on fakex changed via the accounts page: now read-only \(sandbox\)/);
    for (const haystack of [ ...responses, journal, h.stderr () ]) {
        assertOnlyLastFour (haystack, 'permissions', [ MKEY, OKEY ], [ MSECRET, OSECRET, session.token, session.nonce ]);
    }
});

test ('permissions: a file edited by hand since startup is never reconciled by guessing', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    // on disk "real" became a testnet account; the running server still has it as live
    const edited: any = manageFile ();
    edited.accounts.real.sandbox = true;
    edited.accounts.later = { 'exchange': 'fakex', 'apiKey': 'Lt8Rk3Vn6Bm1Xz4Qc7Wd', 'secret': 'Gy5Hu2Ji9Ko4Lp7Ma1Nb' };
    fs.writeFileSync (h.configFile, JSON.stringify (edited));
    const before = fs.readFileSync (h.configFile, 'utf8');
    let response = await post (session, 'permissions', { 'name': 'real', 'trading': true });
    assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 409, 'OUT_OF_SYNC' ]);
    // an account added by hand is listed as not in use; it can be removed, not switched
    const listed = JSON.parse ((await raw (session.url + '/accounts')).text).accounts.find ((entry: any) => entry.name === 'later');
    assert.deepEqual ([ listed.source, listed.loaded, listed.canRemove, listed.canEditPermissions, listed.keyEnding ], [ 'file', false, true, false, 'c7Wd' ]);
    response = await post (session, 'permissions', { 'name': 'later', 'trading': false });
    assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 409, 'NOT_LOADED' ]);
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), before);
    assert.equal (h.ctx.config.accounts['real'].trading, undefined);
    response = await post (session, 'remove', { 'name': 'later', 'confirm': true });
    assert.equal (response.status, 200);
    assert.equal (fileOf (h).accounts.later, undefined);
    assert.match (journalText (h.journalDir), /"wasInUse":false/);
    // a file that is not valid JSON: everything is listed read-only, nothing is written
    const broken = '{"accounts": {"main": {"exchange": "fakex",}}}';
    fs.writeFileSync (h.configFile, broken);
    const list = JSON.parse ((await raw (session.url + '/accounts')).text);
    assert.match (list.fileProblem, /not valid JSON/);
    assert.ok (list.accounts.every ((entry: any) => !entry.canRemove && !entry.canEditPermissions && !entry.canReplace));
    for (const [ action, body ] of [ [ 'remove', { 'name': 'main', 'confirm': true } ], [ 'permissions', { 'name': 'main', 'trading': false } ] ] as [ string, any ][]) {
        response = await post (session, action, body);
        assert.deepEqual ([ response.status, JSON.parse (response.text).code ], [ 400, 'INVALID_JSON' ], action);
    }
    assert.equal (fs.readFileSync (h.configFile, 'utf8'), broken);
    assert.deepEqual (Object.keys (h.ctx.config.accounts), [ 'main', 'real', 'envacct' ]);
});

test ('legacy {"<exchangeId>": ...} file: listed, edited and removed in its own shape', async () => {
    const legacy = { 'fakex': { 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true, 'funds': true }, 'settings': { 'maxResults': 9 }, 'comment': 'kept' };
    const h = await harness ({ 'configText': JSON.stringify (legacy), 'accounts': { 'fakex': { ...legacy.fakex } } });
    const session = await manage (h);
    const entry = bootOf ((await raw (session.url)).text).accounts[0];
    assert.deepEqual ([ entry.name, entry.exchange, entry.source, entry.canRemove, entry.keyEnding, entry.funds ], [ 'fakex', 'fakex', 'file', true, MKEY.slice (-4), true ]);
    assert.equal ((await post (session, 'permissions', { 'name': 'fakex', 'trading': true })).status, 200);
    // still the legacy shape: no "accounts" key, no "exchange" repeated inside, funds untouched
    assert.deepEqual (fileOf (h), { ...legacy, 'fakex': { ...legacy.fakex, 'trading': true } });
    assert.deepEqual ([ h.ctx.config.accounts['fakex'].trading, h.ctx.config.accounts['fakex'].funds ], [ true, true ]);
    // "settings" and "comment" are not accounts in this shape either
    assert.equal (JSON.parse ((await post (session, 'remove', { 'name': 'comment', 'confirm': true })).text).code, 'UNKNOWN_ACCOUNT');
    assert.equal ((await post (session, 'remove', { 'name': 'fakex', 'confirm': true })).status, 200);
    assert.deepEqual (fileOf (h), { 'settings': legacy.settings, 'comment': 'kept' });
    assert.deepEqual (Object.keys (h.ctx.config.accounts), []);
});

test ('session lifetime: an accounts session outlives its actions and the form reached from it; "Done" ends it', async () => {
    const h = await manageHarness ();
    const session = await manage (h);
    // "Add another account": the same step-by-step form, with no account's details in it
    const add = await raw (session.url + '/wizard');
    assert.equal (add.status, 200);
    assert.match (add.text, /<title>Connect an exchange account/);
    const addBoot = bootOf (add.text);
    assert.deepEqual ([ addBoot.page, addBoot.prefill, addBoot.replace, addBoot.csrf ], [ 'accounts', { 'exchange': '', 'account': '', 'environment': 'sandbox' }, undefined, session.nonce ]);
    // "Replace key": prefilled with name, exchange and environment — never a credential
    const replace = await raw (session.url + '/wizard?account=real');
    const replaceBoot = bootOf (replace.text);
    assert.deepEqual (replaceBoot.prefill, { 'exchange': 'fakex', 'account': 'real', 'environment': 'live' });
    assert.deepEqual (replaceBoot.replace, { 'prediction': false, 'trading': false });
    assertOnlyLastFour (replace.text, 'replace form', [], [ MKEY, MSECRET, OKEY, OSECRET ]);
    // an account the file does not hold, or no such account: an ordinary empty form
    for (const name of [ 'envacct', 'nope', '__proto__' ]) {
        assert.equal (bootOf ((await raw (session.url + '/wizard?account=' + name)).text).replace, undefined, name);
    }
    // the existing replace flow: explicit replace, a fresh record (funds is NOT carried over)
    assert.equal (JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'real', 'environment': 'live' }))).text).code, 'ACCOUNT_EXISTS');
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'name': 'real', 'environment': 'live', 'replace': true }))).text);
    assert.deepEqual ([ saved.ok, saved.replaced, saved.returnTo ], [ true, true, 'accounts' ]);
    assert.deepEqual (fileOf (h).accounts.real, { 'exchange': 'fakex', 'apiKey': KEY, 'secret': SECRET });
    assert.match (journalText (h.journalDir), /"tool":"manage_accounts","method":"saveAccount","outcome":\{"source":"accounts page"/);
    assert.match (h.stderr (), /account "real" on fakex saved via the accounts page/);
    // the save did not end the session: the list is still there and shows the new key
    assert.equal (h.ctx.setup.hasLiveSession (), true);
    const list = JSON.parse ((await raw (session.url + '/accounts')).text).accounts;
    assert.equal (list.find ((entry: any) => entry.name === 'real').keyEnding, KEY.slice (-4));
    assert.equal ((await post (session, 'permissions', { 'name': 'main', 'trading': false })).status, 200);
    // "Done"
    const closed = await post (session, 'close', {});
    assert.deepEqual (JSON.parse (closed.text), { 'ok': true, 'closed': true });
    assert.equal (h.ctx.setup.hasLiveSession (), false);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
    assert.match (h.stderr (), /accounts page closed by the user/);
});

test ('hideDisabledTools: switching order placement on from the accounts page lists the trading tools', async () => {
    const file = { 'accounts': { 'main': { 'exchange': 'fakex', 'apiKey': MKEY, 'secret': MSECRET, 'sandbox': true } } };
    const h = await harness ({ 'configText': JSON.stringify (file), 'accounts': { 'main': { ...file.accounts.main } }, 'settings': { 'hideDisabledTools': true } });
    const names = async () => (await h.client.listTools ()).tools.map ((tool: any) => tool.name);
    assert.ok ((await names ()).includes ('manage_accounts') && !(await names ()).includes ('create_order'));
    const session = await manage (h);
    const result = JSON.parse ((await post (session, 'permissions', { 'name': 'main', 'trading': true })).text);
    assert.deepEqual ([ result.toolsAdded, result.restartForTools ], [ true, false ]);
    assert.ok ((await names ()).includes ('create_order'));
    assert.ok (!(await names ()).includes ('withdraw'));
});
