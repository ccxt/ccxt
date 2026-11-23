import fs from 'fs';
import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { AddressInfo } from 'net';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { log } from './logging.js';
import { redact, registerSecret } from './redact.js';
import { ConfigWriteError, isValidAccountName, registerAccountSecrets, resolveConfigPath, unescapePem, validateAccount, writeAccountToConfigFile } from './config.js';
import type { AccountConfig, ServerContext } from './types.js';
import { CREDENTIAL_FIELDS } from './types.js';

// The account setup form: a single page served over loopback HTTP by this process, opened in
// the user's own browser, where they type an exchange API key that is then written to the
// local config file and applied to the running server.
//
// Why a local web page and not a tool parameter or an MCP Apps view: a credential that
// travels through a tool call (or through a view's host bridge) is visible to the model and
// to the host's transcript. This path keeps the keys between the user's browser and this
// process on 127.0.0.1 — the model only ever learns "a form was opened".
//
// Threat model, and what answers each threat:
//   another web page in the same browser      Host allow-list (DNS rebinding), Origin + JSON
//     (CSRF, DNS rebinding, framing)          content type + per-session nonce on every write,
//                                             no CORS headers at all, X-Frame-Options DENY
//   the model itself (it may have a shell     the URL carries a 128-bit single-use token that
//     or a fetch tool)                        never appears in a tool result, log line, journal
//                                             record or error — only in the browser launch
//   something scanning local ports            every miss is an identical empty 404, and the
//                                             listener shuts after MAX_BAD_REQUESTS of them
//   leftovers                                 one session at a time, dead after one save or
//                                             SESSION_TTL_MS; the listener closes with it
// A process already running as the same OS user is out of scope: it can read the config file.

export const SESSION_TTL_MS = 10 * 60 * 1000;
export const MAX_BODY_BYTES = 32 * 1024;
export const MAX_BAD_REQUESTS = 20;
const DEFAULT_TEST_TIMEOUT_MS = 20000;
const DRAIN_LIMIT_BYTES = 1024 * 1024;
const NONCE_HEADER = 'x-setup-nonce';

export interface SetupPrefill {
    exchange?: string;
    account?: string;
    sandbox?: boolean;
}

export interface SetupDeps {
    // launches the user's browser at the form URL; rejects when it cannot. Tests inject one —
    // it is also the only way anything outside this module ever sees the URL.
    opener: (url: string) => Promise<void>;
    now: () => number;
    testTimeoutMs: number;
}

export class SetupOpenError extends Error {}

interface Session {
    token: string;
    csrf: string;
    expiresAt: number;
    prefill: SetupPrefill;
    busy: boolean;
}

// how each ccxt credential is called on an exchange's API-key page, for people who have never
// seen the ccxt names
const CREDENTIAL_LABELS: Record<string, string> = {
    'apiKey': 'API key',
    'secret': 'API secret',
    'password': 'API passphrase',
    'uid': 'User ID',
    'login': 'Login',
    'token': 'Access token',
    'twofa': 'Two-factor (2FA) secret',
    'walletAddress': 'Wallet address',
    'privateKey': 'Private key',
};

const credentialsSchema = z.record (z.string ().max (8192));

const testSchema = z.object ({
    'exchange': z.string ().max (64),
    'credentials': credentialsSchema,
    'environment': z.enum ([ 'sandbox', 'demo', 'live' ]),
}).strict ();

const saveSchema = z.object ({
    'name': z.string ().max (64),
    'exchange': z.string ().max (64),
    'credentials': credentialsSchema,
    'environment': z.enum ([ 'sandbox', 'demo', 'live' ]),
    'trading': z.boolean (),
    'maxOrderValue': z.number ().optional (),
    'liveConfirmed': z.boolean ().optional (),
    'replace': z.boolean ().optional (),
}).strict ();

class FormError extends Error {
    status: number;
    code: string;
    constructor (status: number, code: string, message: string) {
        super (message);
        this.status = status;
        this.code = code;
    }
}

// compares digests so neither the length nor the position of the first differing character
// of a guessed token shows up in the timing
function safeEqual (a: string, b: string): boolean {
    const digestA = createHash ('sha256').update (a).digest ();
    const digestB = createHash ('sha256').update (b).digest ();
    return timingSafeEqual (digestA, digestB);
}

function randomToken (): string {
    return randomBytes (16).toString ('hex'); // 128 bits
}

// The launcher gets the URL as ONE argv element and no shell is involved on any platform, so
// nothing in it can be interpreted (it is only ever our own loopback URL, but the opener must
// not be the place that assumption gets tested). Windows uses rundll32's protocol handler
// rather than `cmd /c start`, whose argument goes through cmd.exe's parser.
export function browserCommand (platform: string, url: string): { command: string, args: string[] } {
    if (platform === 'darwin') {
        return { 'command': 'open', 'args': [ url ] };
    }
    if (platform === 'win32') {
        return { 'command': 'rundll32', 'args': [ 'url.dll,FileProtocolHandler', url ] };
    }
    return { 'command': 'xdg-open', 'args': [ url ] };
}

export function openInBrowser (url: string): Promise<void> {
    return new Promise ((resolve, reject) => {
        if (process.platform !== 'darwin' && process.platform !== 'win32' && !process.env['DISPLAY'] && !process.env['WAYLAND_DISPLAY']) {
            reject (new Error ('no graphical session'));
            return;
        }
        const { command, args } = browserCommand (process.platform, url);
        let settled = false;
        const settle = (error?: Error) => {
            if (!settled) {
                settled = true;
                if (error === undefined) {
                    resolve ();
                } else {
                    reject (error);
                }
            }
        };
        let child;
        try {
            child = spawn (command, args, { 'detached': true, 'stdio': 'ignore', 'windowsHide': true });
        } catch (e: any) {
            // the message is rebuilt rather than forwarded: a spawn error may quote its argv
            settle (new Error ('could not start ' + command));
            return;
        }
        child.on ('error', () => settle (new Error ('could not start ' + command)));
        // launchers exit right after handing the URL over; a non-zero status means they found
        // no browser. One that is still running after the grace period is taken as launched.
        child.on ('exit', (code) => settle ((code === 0 || code === null) ? undefined : new Error (command + ' exited with status ' + code)));
        const grace = setTimeout (() => settle (), 1500);
        grace.unref ();
        child.unref ();
    });
}

const uiDir = path.join (path.dirname (fileURLToPath (import.meta.url)), 'ui');
const INCLUDE_PATTERN = /\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g;
let pageTemplate: string | undefined = undefined;

function loadTemplate (): string {
    if (pageTemplate === undefined) {
        const template = fs.readFileSync (path.join (uiDir, 'setup.html'), 'utf8');
        pageTemplate = template.replace (INCLUDE_PATTERN, (_match, file) => fs.readFileSync (path.join (uiDir, file), 'utf8'));
    }
    return pageTemplate;
}

// JSON placed inside a <script> block: "<" must not be able to close the element
function scriptJson (value: any): string {
    return JSON.stringify (value)
        .replace (/</g, '\\u003c')
        .replace (/>/g, '\\u003e')
        .replace (/&/g, '\\u0026')
        .replace (new RegExp (String.fromCharCode (0x2028), 'g'), '\\u2028')
        .replace (new RegExp (String.fromCharCode (0x2029), 'g'), '\\u2029');
}

function firstHttpsUrl (value: any): string | undefined {
    const candidates = Array.isArray (value) ? value : [ value ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && /^https:\/\/[^\s"'<>]+$/.test (candidate)) {
            return candidate;
        }
    }
    return undefined;
}

export class SetupServer {
    deps: SetupDeps;
    private ctx: ServerContext;
    private server: http.Server | undefined = undefined;
    private session: Session | undefined = undefined;
    private expiryTimer: NodeJS.Timeout | undefined = undefined;
    private badRequests = 0;

    constructor (ctx: ServerContext, deps: Partial<SetupDeps> = {}) {
        this.ctx = ctx;
        this.deps = {
            'opener': deps.opener ?? openInBrowser,
            'now': deps.now ?? (() => Date.now ()),
            'testTimeoutMs': deps.testTimeoutMs ?? DEFAULT_TEST_TIMEOUT_MS,
        };
    }

    isListening (): boolean {
        return this.server !== undefined;
    }

    hasLiveSession (): boolean {
        return this.session !== undefined && this.deps.now () < this.session.expiresAt;
    }

    // where a save lands: the file this server loaded, else the one the next start would load
    configPath (): string {
        return this.ctx.config.configPath ?? resolveConfigPath ().path;
    }

    // Starts (or reuses) the loopback listener, replaces any earlier session with a fresh
    // one and launches the browser at it. Deliberately returns nothing that identifies the
    // session — the caller is a tool handler whose result goes to the model.
    async open (prefill: SetupPrefill = {}): Promise<{ expiresInSeconds: number }> {
        const port = await this.listen ();
        const session: Session = {
            'token': randomToken (),
            'csrf': randomToken (),
            'expiresAt': this.deps.now () + SESSION_TTL_MS,
            prefill,
            'busy': false,
        };
        // one session at a time: opening a new form is how a lost or stale one is retired
        this.session = session;
        this.badRequests = 0;
        this.armExpiry ();
        try {
            await this.deps.opener ('http://127.0.0.1:' + port + '/setup/' + session.token);
        } catch (e) {
            if (this.session === session) {
                this.endSession ();
            }
            // never forward the opener's own message: it may quote the URL it was given
            throw new SetupOpenError ('the browser could not be opened from this machine');
        }
        log ('info', 'setup form opened in the browser (expires in ' + (SESSION_TTL_MS / 60000) + ' minutes)');
        return { 'expiresInSeconds': SESSION_TTL_MS / 1000 };
    }

    async close (): Promise<void> {
        this.session = undefined;
        this.stopListening (false);
    }

    private listen (): Promise<number> {
        if (this.server !== undefined) {
            return Promise.resolve ((this.server.address () as AddressInfo).port);
        }
        return new Promise ((resolve, reject) => {
            const server = http.createServer ((req, res) => {
                this.handle (server, req, res).catch ((e: any) => {
                    log ('warning', 'setup form: request failed: ' + redact (String (e?.message ?? e)));
                    this.sendJson (res, 500, { 'ok': false, 'code': 'INTERNAL', 'error': 'something went wrong on this computer — close this tab and ask the assistant to open the setup form again' });
                });
            });
            server.requestTimeout = 15000;
            server.headersTimeout = 10000;
            server.keepAliveTimeout = 1;
            server.maxConnections = 16;
            server.once ('error', (e: any) => reject (new SetupOpenError ('the local setup page could not be started (' + String (e?.code ?? 'error') + ')')));
            // loopback only, and a port the OS picks: nothing off this machine can reach it
            server.listen (0, '127.0.0.1', () => {
                this.server = server;
                // the listener must never be what keeps a finished server process alive
                server.unref ();
                resolve ((server.address () as AddressInfo).port);
            });
        });
    }

    private stopListening (graceful: boolean): void {
        const server = this.server;
        this.server = undefined;
        if (this.expiryTimer !== undefined) {
            clearTimeout (this.expiryTimer);
            this.expiryTimer = undefined;
        }
        if (server === undefined) {
            return;
        }
        server.close ();
        // Graceful: every response carries "Connection: close", so in-flight ones finish and
        // their sockets end on their own — destroying sockets here could cut off the very
        // response that reports the save. Shutdown has no such response to protect.
        const anyServer = server as any;
        if (!graceful && typeof anyServer.closeAllConnections === 'function') {
            anyServer.closeAllConnections ();
        }
    }

    // no live session means no reason to keep a port open
    private endSession (): void {
        this.session = undefined;
        this.stopListening (true);
    }

    private armExpiry (): void {
        if (this.expiryTimer !== undefined) {
            clearTimeout (this.expiryTimer);
        }
        this.expiryTimer = setTimeout (() => {
            if (!this.hasLiveSession ()) {
                this.endSession ();
            } else {
                this.armExpiry ();
            }
        }, SESSION_TTL_MS + 1000);
        this.expiryTimer.unref ();
    }

    // ---------------------------------------------------------------------------------
    // HTTP

    private baseHeaders (): Record<string, string> {
        return {
            'Cache-Control': 'no-store',
            'Referrer-Policy': 'no-referrer',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Resource-Policy': 'same-origin',
            // one request per connection keeps "close the listener" prompt and simple
            'Connection': 'close',
        };
    }

    private send (res: http.ServerResponse, status: number, body: string, headers: Record<string, string> = {}): void {
        if (res.headersSent) {
            return;
        }
        res.writeHead (status, { ...this.baseHeaders (), ...headers, 'Content-Length': String (Buffer.byteLength (body)) });
        res.end (body);
    }

    private sendJson (res: http.ServerResponse, status: number, body: Record<string, any>): void {
        // every response body goes through the redactor: whatever an error carried, a
        // registered credential value cannot be echoed back to the page
        this.send (res, status, redact (JSON.stringify (body)), {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
        });
    }

    // every request that does not prove it knows the session looks the same from outside:
    // an empty 404, whatever was wrong with it
    private notFound (res: http.ServerResponse, counted: boolean): void {
        this.send (res, 404, '');
        if (!counted) {
            return;
        }
        this.badRequests += 1;
        if (this.badRequests >= MAX_BAD_REQUESTS) {
            log ('warning', 'setup form: closed after ' + this.badRequests + ' requests without a valid session — call setup_account again to reopen it');
            this.endSession ();
        }
    }

    private async handle (server: http.Server, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        const address = server.address () as AddressInfo | null;
        if (address === null || this.server !== server) {
            this.notFound (res, false);
            return;
        }
        // DNS rebinding: a hostile page can point its own hostname at 127.0.0.1 and would then
        // be same-origin with this server, but the browser still sends that hostname as Host
        const host = req.headers['host'];
        if (host !== '127.0.0.1:' + address.port && host !== 'localhost:' + address.port) {
            this.notFound (res, true);
            return;
        }
        const rawUrl = req.url ?? '';
        const queryAt = rawUrl.indexOf ('?');
        const pathname = (queryAt === -1) ? rawUrl : rawUrl.slice (0, queryAt);
        const query = new URLSearchParams ((queryAt === -1) ? '' : rawUrl.slice (queryAt + 1));
        if (pathname === '/favicon.ico') {
            // browsers ask on their own; not a guess
            this.notFound (res, false);
            return;
        }
        const match = /^\/setup\/([0-9a-f]{32})(?:\/([a-z]+))?$/.exec (pathname);
        const session = this.session;
        if (session !== undefined && this.deps.now () >= session.expiresAt) {
            this.notFound (res, false);
            this.endSession ();
            return;
        }
        if (match === null || session === undefined || !safeEqual (match[1], session.token)) {
            this.notFound (res, true);
            return;
        }
        const action = match[2] ?? '';
        if (action === '' || action === 'credentials') {
            if (req.method !== 'GET') {
                this.send (res, 405, '', { 'Allow': 'GET' });
                return;
            }
            if (action === '') {
                this.sendPage (res, session);
            } else {
                this.sendJson (res, 200, this.describeExchange (query.get ('exchange') ?? ''));
            }
            return;
        }
        if (action !== 'test' && action !== 'save') {
            this.notFound (res, true);
            return;
        }
        // from here on the request changes something (or sends keys to an exchange), so it
        // must provably come from the page this server served
        if (req.method !== 'POST') {
            this.send (res, 405, '', { 'Allow': 'POST' });
            return;
        }
        const fetchSite = req.headers['sec-fetch-site'];
        if (req.headers['origin'] !== 'http://' + host || (fetchSite !== undefined && fetchSite !== 'same-origin')) {
            this.sendJson (res, 403, { 'ok': false, 'code': 'FORBIDDEN', 'error': 'this request did not come from the setup page' });
            return;
        }
        // a cross-site form post cannot produce this content type without a CORS preflight,
        // which this server never answers
        const contentType = String (req.headers['content-type'] ?? '').split (';')[0].trim ().toLowerCase ();
        if (contentType !== 'application/json') {
            this.sendJson (res, 415, { 'ok': false, 'code': 'UNSUPPORTED_MEDIA_TYPE', 'error': 'expected application/json' });
            return;
        }
        const nonce = req.headers[NONCE_HEADER];
        if (typeof nonce !== 'string' || !safeEqual (nonce, session.csrf)) {
            this.sendJson (res, 403, { 'ok': false, 'code': 'FORBIDDEN', 'error': 'this request did not come from the setup page' });
            return;
        }
        const text = await this.readBody (req);
        if (text === undefined) {
            this.sendJson (res, 413, { 'ok': false, 'code': 'TOO_LARGE', 'error': 'the submitted form is too large' });
            return;
        }
        let body: any;
        try {
            body = JSON.parse (text);
        } catch (e) {
            this.sendJson (res, 400, { 'ok': false, 'code': 'BAD_REQUEST', 'error': 'the submitted form could not be read' });
            return;
        }
        // FIRST thing done with a submission, before it is validated, tested or mentioned in
        // any log line: its values become redactable, so no later error text can carry them
        this.registerSubmittedSecrets (body);
        if (session.busy) {
            this.sendJson (res, 409, { 'ok': false, 'code': 'BUSY', 'error': 'the previous step is still running — wait a moment' });
            return;
        }
        session.busy = true;
        try {
            const result = (action === 'test') ? await this.runTest (body) : await this.runSave (body, session);
            this.sendJson (res, 200, result);
        } catch (e: any) {
            if (!(e instanceof FormError)) {
                throw e;
            }
            this.sendJson (res, e.status, { 'ok': false, 'code': e.code, 'error': e.message });
        } finally {
            session.busy = false;
        }
        if (this.session === undefined) {
            // the save ended the session; let this response out, then give the port back
            this.stopListening (true);
        }
    }

    // resolves undefined when the body exceeds the cap (the rest is discarded, bounded)
    private readBody (req: http.IncomingMessage): Promise<string | undefined> {
        return new Promise ((resolve, reject) => {
            const declared = Number (req.headers['content-length']);
            let tooLarge = Number.isFinite (declared) && declared > MAX_BODY_BYTES;
            let received = 0;
            const chunks: Buffer[] = [];
            req.on ('data', (chunk: Buffer) => {
                received += chunk.length;
                if (received > MAX_BODY_BYTES) {
                    tooLarge = true;
                    chunks.length = 0;
                    if (received > DRAIN_LIMIT_BYTES) {
                        req.destroy ();
                        resolve (undefined);
                    }
                    return;
                }
                if (!tooLarge) {
                    chunks.push (chunk);
                }
            });
            req.on ('end', () => resolve (tooLarge ? undefined : Buffer.concat (chunks).toString ('utf8')));
            req.on ('error', reject);
        });
    }

    private registerSubmittedSecrets (body: any): void {
        const credentials = body?.['credentials'];
        if (credentials === null || typeof credentials !== 'object') {
            return;
        }
        for (const [ field, value ] of Object.entries (credentials)) {
            if (typeof value === 'string') {
                const label = (CREDENTIAL_FIELDS as readonly string[]).includes (field) ? field : 'credential';
                registerSecret (value, label);
                registerSecret (unescapePem (value), label);
            }
        }
    }

    private sendPage (res: http.ServerResponse, session: Session): void {
        const nonce = randomBytes (16).toString ('base64');
        const directory = this.ctx.pools.directory ();
        const prefill = session.prefill;
        const boot = {
            'csrf': session.csrf,
            'exchanges': directory.allExchangeIds (),
            'prefill': {
                'exchange': (prefill.exchange !== undefined && directory.isKnownExchange (prefill.exchange)) ? prefill.exchange : '',
                'account': isValidAccountName (prefill.account) ? prefill.account : '',
                'environment': (prefill.sandbox === false) ? 'live' : 'sandbox',
            },
            'configPath': this.configPath (),
            'expiresInMs': Math.max (0, session.expiresAt - this.deps.now ()),
            'restartForTools': this.ctx.config.settings.hideDisabledTools === true,
        };
        const html = loadTemplate ()
            .replace (/__CSP_NONCE__/g, () => nonce)
            .replace ('__BOOT_JSON__', () => scriptJson (boot));
        this.send (res, 200, html, {
            'Content-Type': 'text/html; charset=utf-8',
            // nothing external, nothing inline without this response's nonce, and the only
            // place the page may send data is back here
            'Content-Security-Policy': "default-src 'none'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
        });
    }

    // ---------------------------------------------------------------------------------
    // form logic

    private bare (exchangeId: string): any {
        if (typeof exchangeId !== 'string' || !this.ctx.pools.directory ().isKnownExchange (exchangeId)) {
            throw new FormError (400, 'UNKNOWN_EXCHANGE', 'that exchange is not supported — pick one from the list');
        }
        return this.ctx.pools.getBare (exchangeId);
    }

    private requiredFields (bare: any): string[] {
        const required = bare.requiredCredentials ?? {};
        return CREDENTIAL_FIELDS.filter ((field) => required[field] === true);
    }

    // sandbox needs urls.test (setSandboxMode throws without it). The base enableDemoTrading
    // does NOT throw when an exchange has no demo host — it would silently point the client
    // at an undefined URL — so demo is offered only where the exchange declares urls.demo or
    // implements its own switch.
    private environments (bare: any): { sandbox: boolean, demo: boolean, live: boolean } {
        const baseDemo = this.ctx.ccxt?.Exchange?.prototype?.enableDemoTrading;
        const ownDemo = typeof bare.enableDemoTrading === 'function' && baseDemo !== undefined && bare.enableDemoTrading !== baseDemo;
        return {
            'sandbox': bare.urls?.test !== undefined,
            'demo': bare.urls?.demo !== undefined || ownDemo,
            'live': true,
        };
    }

    private describeExchange (exchangeId: string): Record<string, any> {
        let bare: any;
        try {
            bare = this.bare (exchangeId);
        } catch (e: any) {
            return { 'ok': false, 'code': 'UNKNOWN_EXCHANGE', 'error': e.message };
        }
        return {
            'ok': true,
            'exchange': exchangeId,
            'name': (typeof bare.name === 'string') ? bare.name : exchangeId,
            'website': firstHttpsUrl (bare.urls?.www),
            'fields': this.requiredFields (bare).map ((field) => ({ 'name': field, 'label': CREDENTIAL_LABELS[field] ?? field })),
            'environments': this.environments (bare),
        };
    }

    // exchange + credentials + environment -> the account record both the test and the save
    // build on; every rule here is enforced server-side whatever the page did or did not check
    private baseAccount (input: { exchange: string, credentials: Record<string, string>, environment: string }): Record<string, any> {
        const bare = this.bare (input.exchange);
        const required = this.requiredFields (bare);
        const account: Record<string, any> = { 'exchange': input.exchange };
        for (const [ field, rawValue ] of Object.entries (input.credentials)) {
            if (!required.includes (field)) {
                throw new FormError (400, 'BAD_REQUEST', 'unexpected credential field for this exchange');
            }
            const value = unescapePem (rawValue.trim ());
            if (value !== '') {
                account[field] = value;
            }
        }
        const missing = required.filter ((field) => account[field] === undefined);
        if (missing.length > 0) {
            throw new FormError (400, 'MISSING_CREDENTIALS', 'fill in: ' + missing.map ((field) => CREDENTIAL_LABELS[field] ?? field).join (', '));
        }
        const environments = this.environments (bare);
        if (input.environment === 'sandbox') {
            if (!environments.sandbox) {
                throw new FormError (400, 'NO_SANDBOX', input.exchange + ' has no testnet — choose another environment');
            }
            account['sandbox'] = true;
        } else if (input.environment === 'demo') {
            if (!environments.demo) {
                throw new FormError (400, 'NO_DEMO', input.exchange + ' has no demo trading mode — choose another environment');
            }
            account['demo'] = true;
        }
        return account;
    }

    private async runTest (body: any): Promise<Record<string, any>> {
        const parsed = testSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the submitted form is incomplete');
        }
        const account = this.baseAccount (parsed.data);
        return this.testConnection ({ ...account, 'name': 'setup-test' } as AccountConfig);
    }

    // one authenticated read against the exchange, with the submitted keys, before they are
    // trusted with anything: the commonest setup failures (a mistyped secret, a testnet key
    // used on live, an IP allow-list) all show up here
    private async testConnection (account: AccountConfig): Promise<Record<string, any>> {
        const timeoutMs = this.deps.testTimeoutMs;
        let exchange: any = undefined;
        let timer: NodeJS.Timeout | undefined = undefined;
        let outcome: Record<string, any>;
        try {
            exchange = this.ctx.pools.buildProbe ({ ...account, 'timeout': timeoutMs });
            await Promise.race ([
                exchange.fetchBalance (),
                new Promise ((_resolve, reject) => {
                    timer = setTimeout (() => reject (new FormError (504, 'TIMEOUT', 'the exchange did not answer in time')), timeoutMs);
                }),
            ]);
            outcome = { 'ok': true, 'tested': true };
        } catch (e: any) {
            const kind = (e instanceof FormError) ? 'RequestTimeout' : String (e?.constructor?.name ?? 'Error');
            // redact() covers the submitted values (registered on arrival); the slice keeps a
            // verbose exchange payload from flooding the page
            const detail = redact (String (e?.message ?? e)).slice (0, 300);
            outcome = { 'ok': false, 'tested': true, 'code': 'TEST_FAILED', kind, 'error': detail };
        } finally {
            if (timer !== undefined) {
                clearTimeout (timer);
            }
            try {
                if (exchange !== undefined && typeof exchange.close === 'function') {
                    await exchange.close ();
                }
            } catch (e) {
                // a probe that will not close cleanly has nothing left to release
            }
        }
        log ('info', 'setup form: connection test on ' + account.exchange + ' ' + (outcome['ok'] ? 'succeeded' : ('failed (' + outcome['kind'] + ')')));
        return outcome;
    }

    private async runSave (body: any, session: Session): Promise<Record<string, any>> {
        const parsed = saveSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the submitted form is incomplete');
        }
        const input = parsed.data;
        if (!isValidAccountName (input.name)) {
            throw new FormError (400, 'INVALID_NAME', 'the account name must be 1-40 characters: letters, digits, "-" and "_"');
        }
        const raw = this.baseAccount (input);
        if (input.trading) {
            if (input.environment === 'live') {
                // real money: an explicit cap and an explicit second yes, both checked here
                // and not only by the page — and every live order then asks again (confirm)
                if (input.maxOrderValue === undefined || !Number.isFinite (input.maxOrderValue) || input.maxOrderValue <= 0) {
                    throw new FormError (400, 'CAP_REQUIRED', 'live trading needs a maximum order size in USD (a number above 0)');
                }
                if (input.liveConfirmed !== true) {
                    throw new FormError (400, 'CONFIRM_REQUIRED', 'tick the confirmation box to allow orders with real money');
                }
                raw['trading'] = 'live';
                raw['maxOrderValue'] = input.maxOrderValue;
                raw['confirm'] = 'always';
            } else {
                raw['trading'] = true;
            }
        }
        // the same validation a config-file account goes through at startup; anything it
        // would downgrade or reject there is refused here instead of being written
        const problems: string[] = [];
        const directory = this.ctx.pools.directory ();
        const account = validateAccount (input.name, raw, problems, directory);
        if (account === undefined || problems.length > 0) {
            throw new FormError (400, 'INVALID_ACCOUNT', problems.join ('; ') || 'the account could not be validated');
        }
        const replace = input.replace === true;
        // an account of this name the server is already using (from the file or from
        // environment variables) is only ever swapped out on an explicit yes
        if (this.ctx.config.accounts[input.name] !== undefined && !replace) {
            throw new FormError (409, 'ACCOUNT_EXISTS', 'an account named "' + input.name + '" already exists');
        }
        let written;
        try {
            written = writeAccountToConfigFile (this.configPath (), input.name, raw, { replace, 'isKnownExchange': directory.isKnownExchange });
        } catch (e: any) {
            if (e instanceof ConfigWriteError) {
                throw new FormError ((e.code === 'ACCOUNT_EXISTS') ? 409 : 400, e.code, e.message);
            }
            throw e;
        }
        // hot-apply: the pools read ctx.config.accounts on every call, so the account is
        // usable from the next tool call on — no restart
        registerAccountSecrets (account);
        this.ctx.config.accounts[input.name] = account;
        this.ctx.pools.evictAuthenticated (input.name);
        if (this.ctx.config.configPath === undefined) {
            this.ctx.config.configPath = written.path;
            // the file exists now; a startup complaint that it was missing would be stale
            this.ctx.config.problems = this.ctx.config.problems.filter ((problem) => !problem.startsWith ('CCXT_MCP_CONFIG points to a missing file'));
        }
        const trading = account.trading ?? false;
        const tradingText = (trading === 'live') ? 'LIVE trading, max order ' + account.maxOrderValue + ' USD' : (trading ? 'trading' : 'read-only');
        // names and modes only — a credential value has no business in either record
        log ('info', 'account ' + JSON.stringify (input.name) + ' on ' + input.exchange + ' saved via setup form (' + input.environment + ', ' + tradingText + ')' + (written.replaced ? ' — replaced the previous account of that name' : ''));
        try {
            this.ctx.journal.append ({
                'ts': new Date (this.deps.now ()).toISOString (),
                'event': 'result',
                'intentId': 'setup-' + randomBytes (6).toString ('hex'),
                'account': input.name,
                'exchange': input.exchange,
                'environment': input.environment,
                'tool': 'setup_account',
                'method': 'saveAccount',
                'outcome': { 'source': 'setup form', trading, 'maxOrderValue': account.maxOrderValue, 'replaced': written.replaced },
            });
        } catch (e: any) {
            log ('warning', 'setup form: could not journal the saved account: ' + redact (String (e?.message ?? e)));
        }
        // single use: the token that just saved an account can never save (or read) another
        if (this.session === session) {
            this.session = undefined;
        }
        return {
            'ok': true,
            'account': input.name,
            'exchange': input.exchange,
            'environment': input.environment,
            trading,
            'replaced': written.replaced,
            'restartForTools': this.ctx.config.settings.hideDisabledTools === true,
        };
    }
}
