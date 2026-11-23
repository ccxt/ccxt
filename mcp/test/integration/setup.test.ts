import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../ts/factory.js';
import { clearSecrets } from '../../ts/redact.js';
import { MAX_BAD_REQUESTS, MAX_BODY_BYTES, SESSION_TTL_MS } from '../../ts/setup.js';
import { FakeExchange, fakeCcxtModule, fakePoolsDeps, makeConfig } from '../helpers/fake-ccxt.js';
import type { ServerContext } from '../../ts/types.js';

// setup_account end to end: the tool, the loopback form server it starts, the config file it
// writes and the hot-apply into the running server. No browser is launched — the opener is
// injected, and it is also the only place the form URL (with its session token) is visible.

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

interface Harness {
    client: Client;
    ctx: ServerContext;
    configFile: string;
    journalDir: string;
    urls: string[]; // every URL handed to the (fake) browser opener
    clock: { now: number };
    stderr: () => string;
    open: (args?: any) => Promise<{ envelope: any, text: string, url: string, base: string, port: number, token: string, nonce: string }>;
}

const cleanups: Array<() => Promise<void> | void> = [];
after (async () => {
    for (const cleanup of cleanups) {
        await cleanup ();
    }
});

async function harness (options: { accounts?: any, settings?: any, exchangeClass?: any, configText?: string, opener?: (url: string) => Promise<void> } = {}): Promise<Harness> {
    clearSecrets ();
    const dir = fs.mkdtempSync (path.join (os.tmpdir (), 'ccxt-mcp-setup-'));
    const configFile = path.join (dir, 'conf', 'config.json');
    if (options.configText !== undefined) {
        fs.mkdirSync (path.dirname (configFile), { 'recursive': true });
        fs.writeFileSync (configFile, options.configText);
    }
    process.env['CCXT_MCP_CONFIG'] = configFile;
    const journalDir = path.join (dir, 'journal');
    const exchangeClass = options.exchangeClass;
    const { server, ctx } = createServer ({
        'config': makeConfig (options.accounts ?? {}, options.settings ?? {}),
        'ccxtModule': fakeCcxtModule,
        'poolsDeps': (exchangeClass === undefined) ? fakePoolsDeps : { ...fakePoolsDeps, 'exchangeClass': () => exchangeClass },
        'version': 'test',
        journalDir,
    });
    const urls: string[] = [];
    const clock = { 'now': 1700000000000 };
    ctx.setup.deps.opener = options.opener ?? (async (url: string) => {
        urls.push (url);
    });
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
    const open = async (args: any = {}) => {
        const result: any = await client.callTool ({ 'name': 'setup_account', 'arguments': args });
        const text = JSON.stringify (result);
        const envelope = JSON.parse (result.content[0].text);
        const url = urls[urls.length - 1] ?? '';
        const parsed = /^http:\/\/127\.0\.0\.1:(\d+)\/setup\/([0-9a-f]{32})$/.exec (url);
        let nonce = '';
        if (envelope.ok && parsed !== null) {
            const page = await raw (url);
            nonce = JSON.parse (/<script type="application\/json" id="boot">(.*?)<\/script>/.exec (page.text)![1]).csrf;
        }
        return { envelope, text, url, 'base': url, 'port': parsed ? Number (parsed[1]) : 0, 'token': parsed ? parsed[2] : '', nonce };
    };
    return { client, ctx, configFile, journalDir, urls, clock, 'stderr': () => captured, open };
}

interface RawResponse { status: number, headers: http.IncomingHttpHeaders, text: string }

// http.request rather than fetch: the tests need to send exactly the headers a hostile
// client would (a wrong Host, no Origin), which fetch does not allow
function raw (url: string, options: { method?: string, headers?: Record<string, string>, body?: string | Buffer } = {}): Promise<RawResponse> {
    return new Promise ((resolve, reject) => {
        const target = new URL (url);
        const request = http.request ({
            'host': '127.0.0.1',
            'port': target.port,
            'path': target.pathname + target.search,
            'method': options.method ?? 'GET',
            'headers': options.headers ?? {},
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
function post (session: { base: string, port: number, nonce: string }, action: string, body: any, overrides: Record<string, string | undefined> = {}, method = 'POST'): Promise<RawResponse> {
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
    return raw (session.base + '/' + action, { method, headers, 'body': (typeof body === 'string' || Buffer.isBuffer (body)) ? body : JSON.stringify (body) });
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
    // the opener got a loopback URL with a 128-bit token…
    assert.equal (h.urls.length, 1);
    assert.match (h.urls[0], /^http:\/\/127\.0\.0\.1:\d+\/setup\/[0-9a-f]{32}$/);
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
    assert.equal (h.urls.length, 0, 'nothing was opened');
    assert.equal (h.ctx.setup.isListening (), false);
});

test ('a browser that cannot be launched yields a config-file hint, no listener and still no token', async () => {
    let seen = '';
    const h = await harness ({ 'opener': async (url: string) => {
        seen = url;
        throw new Error ('spawn xdg-open ENOENT ' + url);
    } });
    const session = await h.open ({});
    assert.equal (session.envelope.ok, false);
    assert.equal (session.envelope.error.code, 'SETUP_FORM_UNAVAILABLE');
    assert.ok (session.envelope.error.hint.includes (h.configFile));
    assert.match (session.envelope.error.hint, /never in this chat/);
    const token = seen.split ('/').pop () as string;
    assert.equal (token.length, 32);
    assert.ok (!session.text.includes (token) && !h.stderr ().includes (token), 'the opener error must not carry the URL out');
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (seen));
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
    const boot = JSON.parse (/<script type="application\/json" id="boot">(.*?)<\/script>/.exec (page.text)![1]);
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
    assert.deepEqual (JSON.parse (saved.text), { 'ok': true, 'account': 'main', 'exchange': 'fakex', 'environment': 'sandbox', 'trading': true, 'replaced': false, 'restartForTools': false });
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
    assert.equal ((await post (session, 'save', saveBody ({ 'replace': true }))).status, 200);
    assert.equal (h.ctx.config.accounts['main'].apiKey, KEY);
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
    // (kept under the guess limit, which has its own test)
    const requests: [ string, string ][] = targets.map ((target) => [ 'GET', target ] as [ string, string ]);
    for (const target of [ '/setup/' + wrongToken + '/save', '/setup/' + session.token + '/unknown', '/setup/' + wrongToken ]) {
        requests.push ([ 'POST', target ], [ 'OPTIONS', target ]);
    }
    assert.ok (requests.length < MAX_BAD_REQUESTS);
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

test ('security: a new setup_account call supersedes the previous form on the same listener', async () => {
    const h = await harness ();
    const first = await h.open ({});
    const second = await h.open ({});
    assert.equal (second.port, first.port, 'the listener is reused');
    assert.notEqual (second.token, first.token);
    assert.equal ((await raw (first.url)).status, 404);
    assert.equal ((await post (first, 'save', saveBody ())).status, 404);
    assert.equal (fs.existsSync (h.configFile), false);
    // the old page's nonce is useless against the new session too
    assert.equal ((await post ({ ...second, 'nonce': first.nonce }, 'save', saveBody ())).status, 403);
    assert.equal ((await post (second, 'save', saveBody ())).status, 200);
});

test ('security: the listener closes after ' + MAX_BAD_REQUESTS + ' requests without a valid session', async () => {
    const h = await harness ();
    const session = await h.open ({});
    const origin = 'http://127.0.0.1:' + session.port;
    // the browser's own favicon request is not a guess
    for (let i = 0; i < MAX_BAD_REQUESTS + 5; i++) {
        assert.equal ((await raw (origin + '/favicon.ico')).status, 404);
    }
    for (let i = 0; i < MAX_BAD_REQUESTS - 1; i++) {
        const guess = i.toString (16).padStart (32, '0');
        assert.equal ((await raw (origin + '/setup/' + guess)).status, 404);
    }
    assert.equal ((await raw (session.url)).status, 200, 'still alive one short of the limit');
    assert.equal ((await raw (origin + '/setup/' + 'f'.repeat (32))).status, 404);
    assert.equal (h.ctx.setup.isListening (), false);
    assert.equal (h.ctx.setup.hasLiveSession (), false);
    assert.ok (await refused (session.url), 'even the right token no longer works');
    assert.match (h.stderr (), /closed after 20 requests without a valid session/);
    assert.ok (!h.stderr ().includes (session.token));
    // the user can simply ask for a new form
    const reopened = await h.open ({});
    assert.equal ((await raw (reopened.url)).status, 200);
});

test ('close() (server shutdown) drops the session and the listener', async () => {
    const h = await harness ();
    const session = await h.open ({});
    await h.ctx.setup.close ();
    assert.equal (h.ctx.setup.isListening (), false);
    assert.ok (await refused (session.url));
});

test ('hideDisabledTools: the result and the form say that new tiers need a restart to be listed', async () => {
    const h = await harness ({ 'settings': { 'hideDisabledTools': true } });
    const session = await h.open ({});
    assert.match (session.envelope.meta.notice, /listed only after the server restarts/);
    const saved = JSON.parse ((await post (session, 'save', saveBody ({ 'trading': true }))).text);
    assert.equal (saved.restartForTools, true);
});

test ('an unconfigured account error now points at setup_account first, the config file second', async () => {
    const h = await harness ();
    const result = await call (h.client, 'get_balance', { 'account': 'binance' });
    assert.equal (result.error.code, 'UNKNOWN_ACCOUNT');
    assert.match (result.error.hint, /^To fix: call setup_account/);
    assert.ok (result.error.hint.includes (h.configFile));
    assert.match (result.error.hint, /never in this chat/);
});
