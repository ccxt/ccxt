import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { AddressInfo } from 'net';
import { z } from 'zod';
import { log } from './logging.js';
import { readAsset } from './embedded.js';
import { redact, registerSecret, unregisterSecret } from './redact.js';
import { ConfigWriteError, hasOwn, isReservedAccountName, isValidAccountName, readConfigFileAccounts, registerAccountSecrets, removeAccountFromConfigFile, resolveConfigPath, unescapePem, updateAccountInConfigFile, validateAccount, writeAccountToConfigFile } from './config.js';
import type { AccountConfig, ServerContext } from './types.js';
import { CREDENTIAL_FIELDS, accountEnvironment } from './types.js';

// The account pages: served over loopback HTTP by this process and opened in the user's own
// browser. There are two, and they share every line of the session machinery below:
//   setup      the step-by-step form where the user types an exchange API key, which is then
//              written to the local config file and applied to the running server;
//   accounts   "Your accounts": the configured accounts (never their secrets), with remove,
//              change-permissions and replace-key actions on the ones the config file holds.
// A session is one or the other (Session.page). Nothing below the session checks knows which:
// the token, the launch file, the cookie binding and the Host/Origin/nonce rules are the same
// code path for both, so a property that holds for one holds for the other.
//
// Why a local web page and not a tool parameter or an MCP Apps view: a credential that
// travels through a tool call (or through a view's host bridge) is visible to the model and
// to the host's transcript. This path keeps the keys between the user's browser and this
// process on 127.0.0.1 — the model only ever learns "a form was opened".
//
// Threat model, and what answers each threat:
//   another web page in the same browser      Host allow-list (DNS rebinding), Origin + JSON
//     (CSRF, DNS rebinding, framing)          content type + per-session nonce on every write,
//                                             no CORS headers at all, X-Frame-Options DENY.
//                                             Its blind requests get an empty 404 and nothing
//                                             else: no miss, however many, ends the session
//   another OS user on this machine           the URL carries a 128-bit token that is never a
//     (process lists are world-readable)      command-line argument: the browser is launched on
//                                             a 0600 file inside a 0700 directory that merely
//                                             redirects to it, deleted on the first page load
//   the model itself (it may have a shell     the token appears in no tool result, log line,
//     or a fetch tool, as the same user)      journal record, error or argv; and the first page
//                                             load binds the session to that browser with an
//                                             HttpOnly cookie, after which the URL alone opens
//                                             nothing — every later request needs the cookie
//   something scanning local ports            every miss is an identical empty 404; the token
//                                             is compared in constant time and 128 bits are not
//                                             guessable within SESSION_TTL_MS
//   leftovers                                 one session at a time, dead after SESSION_TTL_MS;
//                                             a setup session also dies with its one save, an
//                                             accounts session with its "Done" button; the
//                                             listener and the launch file go with it
// What is left: a process running as the same OS user can read the launch file in the moment
// before the browser does (and can read the config file anyway), so it is out of scope.
//
// There is deliberately no "close after N bad requests" switch. Any web page can fire requests
// at a loopback port without knowing anything, so such a counter protects nothing a 128-bit
// token does not already protect — and hands every open tab a way to close the form the user
// is typing into.

export const SESSION_TTL_MS = 10 * 60 * 1000;
export const MAX_BODY_BYTES = 32 * 1024;
const DEFAULT_TEST_TIMEOUT_MS = 20000;
const DRAIN_LIMIT_BYTES = 1024 * 1024;
const NONCE_HEADER = 'x-setup-nonce';
const COOKIE_NAME = 'ccxt_setup';
const LAUNCH_FILE = 'open.html';

export interface SetupPrefill {
    exchange?: string;
    account?: string;
    sandbox?: boolean;
}

export interface SetupDeps {
    // launches the user's browser on the launch FILE (a local path, never the form URL);
    // rejects when it cannot. Tests inject one and read the file to learn the URL — which is
    // also the only way anything outside this module ever sees it.
    opener: (file: string) => Promise<void>;
    // directories to try, in order, for the launch file's private directory
    launchRoots: () => string[];
    now: () => number;
    testTimeoutMs: number;
}

export class SetupOpenError extends Error {}

// what a setup_account call did: opened a new form, launched the browser again on a form that
// no browser had loaded yet, or found one the user already has open and left it alone
export type SetupOpenState = 'opened' | 'reopened' | 'already-open';

export type SetupPage = 'setup' | 'accounts';

export interface SetupOpened {
    state: SetupOpenState;
    // the page that is in front of the user now — for 'already-open' not necessarily the one
    // this call asked for
    page: SetupPage;
    expiresInSeconds: number;
}

// what the server could do about tool tiers a saved account newly enables (see tools/setup.ts)
export interface TierListing {
    added: string[];
    restartNeeded: boolean;
}

interface Session {
    page: SetupPage;
    token: string;
    csrf: string;
    // minted by the first page load; from then on the URL token alone is worth nothing
    cookie: string | undefined;
    // the private directory holding the redirect file the browser was launched on
    launchDir: string | undefined;
    expiresAt: number;
    prefill: SetupPrefill;
    busy: boolean;
}

// Why an accounts session is not single-use like a setup session: managing accounts is a run
// of small actions (look, switch one off, remove another), and a session that died after the
// first would cost the user a new tool call and a new browser tab for each. Its life is
// bounded instead by the same fixed SESSION_TTL_MS — never extended by activity, so an open
// tab cannot keep a surface that changes accounts alive — and by the page's "Done" button.
// Every action is re-validated on its own (cookie, Origin, nonce, and the account's state on
// disk at that moment), so the longer life grants nothing the bound browser did not already
// have. What the page can reveal is fixed by accountEntry () below: names, modes and the last
// four characters of an API key — no request to an accounts session returns more than that.

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
    'prediction': z.boolean ().optional (),
    'credentials': credentialsSchema,
    'environment': z.enum ([ 'sandbox', 'demo', 'live' ]),
}).strict ();

const saveSchema = z.object ({
    'name': z.string ().max (64),
    'exchange': z.string ().max (64),
    'prediction': z.boolean ().optional (),
    'credentials': credentialsSchema,
    'environment': z.enum ([ 'sandbox', 'demo', 'live' ]),
    'trading': z.boolean (),
    'maxOrderValue': z.number ().optional (),
    'liveConfirmed': z.boolean ().optional (),
    'replace': z.boolean ().optional (),
}).strict ();

const removeSchema = z.object ({
    'name': z.string ().max (128),
    // the page's own "are you sure" step, restated in the request: a body without it is not
    // a removal the user confirmed
    'confirm': z.literal (true),
}).strict ();

const permissionsSchema = z.object ({
    'name': z.string ().max (128),
    'trading': z.boolean (),
    'maxOrderValue': z.number ().optional (),
    'liveConfirmed': z.boolean ().optional (),
}).strict ();

// an API key shorter than this shows no ending at all: four characters would be too much of it
const MIN_KEY_LENGTH_FOR_ENDING = 12;

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

// The launcher is given the PATH of the launch file, never the form URL: a command line is
// readable by every local user (ps, /proc/<pid>/cmdline) for as long as the process lives, and
// a freshly started browser keeps its argv for its whole life. The path is ONE argv element
// and no shell is involved on any platform, so nothing in it can be interpreted. Windows uses
// rundll32's handler rather than `cmd /c start`, whose argument goes through cmd.exe's parser.
export function browserCommand (platform: string, file: string): { command: string, args: string[] } {
    if (platform === 'darwin') {
        return { 'command': 'open', 'args': [ file ] };
    }
    if (platform === 'win32') {
        return { 'command': 'rundll32', 'args': [ 'url.dll,FileProtocolHandler', file ] };
    }
    return { 'command': 'xdg-open', 'args': [ file ] };
}

// Where the launch file's private directory is created. The temp directory, except where
// snap is installed: a snap-packaged browser (the default Firefox and Chromium on Ubuntu)
// runs with its own private /tmp and may not read hidden directories under home, so the one
// place it and every other browser can read is a non-hidden directory in home. It exists for
// the seconds between the launch and the first page load.
export function defaultLaunchRoots (): string[] {
    if (process.platform === 'linux' && fs.existsSync ('/snap/bin')) {
        return [ os.homedir (), os.tmpdir () ];
    }
    return [ os.tmpdir () ];
}

// The page the browser is launched on: it only forwards to the form. The token it carries is
// 32 hex characters and the port a number, so there is nothing to escape.
export function launchPage (url: string): string {
    return '<!doctype html>\n<meta charset="utf-8">\n<meta name="referrer" content="no-referrer">\n'
        + '<meta http-equiv="refresh" content="0;url=' + url + '">\n'
        + '<title>Opening the CCXT account setup…</title>\n'
        + '<p>Opening the account setup form… <a rel="noreferrer" href="' + url + '">Continue</a> if nothing happens.</p>\n';
}

export function openInBrowser (file: string): Promise<void> {
    return new Promise ((resolve, reject) => {
        if (process.platform !== 'darwin' && process.platform !== 'win32' && !process.env['DISPLAY'] && !process.env['WAYLAND_DISPLAY']) {
            reject (new Error ('no graphical session'));
            return;
        }
        const { command, args } = browserCommand (process.platform, file);
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
        // launchers exit right after handing the file over; a non-zero status means they found
        // no browser. One that is still running after the grace period is taken as launched.
        child.on ('exit', (code) => settle ((code === 0 || code === null) ? undefined : new Error (command + ' exited with status ' + code)));
        const grace = setTimeout (() => settle (), 1500);
        grace.unref ();
        child.unref ();
    });
}

const INCLUDE_PATTERN = /\/\*\s*@include\s+([a-z0-9.-]+)\s*\*\//g;
const pageTemplates: Record<string, string> = {};

function loadTemplate (file: 'setup.html' | 'accounts.html'): string {
    if (pageTemplates[file] === undefined) {
        const template = readAsset ('ui/' + file);
        pageTemplates[file] = template.replace (INCLUDE_PATTERN, (_match, include) => readAsset ('ui/' + include));
    }
    return pageTemplates[file];
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
    // set by tools/setup.ts: lists the tool tiers a saved account newly enables
    listTiers: ((account: AccountConfig) => TierListing) | undefined = undefined;
    private ctx: ServerContext;
    private server: http.Server | undefined = undefined;
    private session: Session | undefined = undefined;
    private expiryTimer: NodeJS.Timeout | undefined = undefined;

    constructor (ctx: ServerContext, deps: Partial<SetupDeps> = {}) {
        this.ctx = ctx;
        this.deps = {
            'opener': deps.opener ?? openInBrowser,
            'launchRoots': deps.launchRoots ?? defaultLaunchRoots,
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

    // Starts (or reuses) the loopback listener and makes sure a form is in front of the user.
    // A form that is still live is never replaced by a repeat call: the user may be typing
    // keys into it, and the caller is a model that can be talked into calling again. One a
    // browser has already loaded is left exactly as it is (no new window either); one that
    // no browser loaded yet is launched again — nothing was typed into it, so it can take
    // the new prefill. Only an explicit restart retires a live form.
    // Deliberately returns nothing that identifies the session — the result goes to the model.
    // The same rules hold across the two pages: an accounts page the user has open is not
    // replaced by a setup_account call, nor a half-filled setup form by manage_accounts — the
    // result names the page that is open and the caller relays that.
    async open (prefill: SetupPrefill = {}, options: { restart?: boolean, page?: SetupPage } = {}): Promise<SetupOpened> {
        const page: SetupPage = options.page ?? 'setup';
        const port = await this.listen ();
        let session = this.hasLiveSession () ? this.session : undefined;
        let state: SetupOpenState = 'reopened';
        if (session !== undefined && options.restart !== true) {
            if (session.cookie !== undefined) {
                return { 'state': 'already-open', 'page': session.page, 'expiresInSeconds': this.remainingSeconds (session) };
            }
            session.page = page;
            session.prefill = prefill;
        } else {
            this.dropLaunchFile (this.session);
            session = {
                page,
                'token': randomToken (),
                'csrf': randomToken (),
                'cookie': undefined,
                'launchDir': undefined,
                'expiresAt': this.deps.now () + SESSION_TTL_MS,
                prefill,
                'busy': false,
            };
            this.session = session;
            this.armExpiry ();
            state = 'opened';
        }
        try {
            await this.deps.opener (this.writeLaunchFile (session, port));
        } catch (e) {
            if (this.session === session) {
                this.endSession ();
            }
            this.dropLaunchFile (session);
            // never forward the opener's own message: it may quote what it was given
            throw new SetupOpenError ((e instanceof SetupOpenError) ? e.message : 'the browser could not be opened from this machine');
        }
        log ('info', ((page === 'accounts') ? 'accounts page ' : 'setup form ') + ((state === 'opened') ? 'opened' : 'opened again') + ' in the browser (expires in ' + Math.ceil (this.remainingSeconds (session) / 60) + ' minutes)');
        return { state, page, 'expiresInSeconds': this.remainingSeconds (session) };
    }

    async close (): Promise<void> {
        this.dropLaunchFile (this.session);
        this.session = undefined;
        this.stopListening (false);
    }

    private remainingSeconds (session: Session): number {
        return Math.max (1, Math.round ((session.expiresAt - this.deps.now ()) / 1000));
    }

    // The form URL reaches the browser through a file only this user can read, in a directory
    // only this user can enter, and never through anyone's command line.
    private writeLaunchFile (session: Session, port: number): string {
        this.dropLaunchFile (session);
        const page = launchPage ('http://127.0.0.1:' + port + '/setup/' + session.token);
        for (const root of this.deps.launchRoots ()) {
            let directory: string | undefined = undefined;
            try {
                // mkdtemp creates the directory 0700 under a name nobody could have planted
                directory = fs.mkdtempSync (path.join (root, 'ccxt-mcp-setup-'));
                const file = path.join (directory, LAUNCH_FILE);
                // "wx": the file must not exist yet; 0600 from the first byte
                fs.writeFileSync (file, page, { 'mode': 0o600, 'flag': 'wx' });
                session.launchDir = directory;
                return file;
            } catch (e) {
                if (directory !== undefined) {
                    fs.rmSync (directory, { 'recursive': true, 'force': true });
                }
            }
        }
        throw new SetupOpenError ('the file that opens the form could not be written');
    }

    // the redirect file has done its job once a browser loaded the form, and must not outlive
    // the session either way
    private dropLaunchFile (session: Session | undefined): void {
        if (session === undefined || session.launchDir === undefined) {
            return;
        }
        const directory = session.launchDir;
        session.launchDir = undefined;
        try {
            fs.rmSync (directory, { 'recursive': true, 'force': true });
        } catch (e) {
            // already gone, or not ours to remove any more
        }
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
        this.dropLaunchFile (this.session);
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

    // every request that does not prove it belongs to the session looks the same from
    // outside: an empty 404, whatever was wrong with it — and it costs the session nothing
    private notFound (res: http.ServerResponse): void {
        this.send (res, 404, '');
    }

    private presentedCookie (req: http.IncomingMessage): string {
        for (const part of String (req.headers['cookie'] ?? '').split (';')) {
            const pair = part.trim ();
            if (pair.startsWith (COOKIE_NAME + '=')) {
                return pair.slice (COOKIE_NAME.length + 1);
            }
        }
        return '';
    }

    private async handle (server: http.Server, req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
        const address = server.address () as AddressInfo | null;
        if (address === null || this.server !== server) {
            this.notFound (res);
            return;
        }
        // DNS rebinding: a hostile page can point its own hostname at 127.0.0.1 and would then
        // be same-origin with this server, but the browser still sends that hostname as Host
        const host = req.headers['host'];
        if (host !== '127.0.0.1:' + address.port && host !== 'localhost:' + address.port) {
            this.notFound (res);
            return;
        }
        const rawUrl = req.url ?? '';
        const queryAt = rawUrl.indexOf ('?');
        const pathname = (queryAt === -1) ? rawUrl : rawUrl.slice (0, queryAt);
        const query = new URLSearchParams ((queryAt === -1) ? '' : rawUrl.slice (queryAt + 1));
        const match = /^\/setup\/([0-9a-f]{32})(?:\/([a-z]+))?$/.exec (pathname);
        const session = this.session;
        if (session !== undefined && this.deps.now () >= session.expiresAt) {
            this.notFound (res);
            this.endSession ();
            return;
        }
        if (match === null || session === undefined || !safeEqual (match[1], session.token)) {
            this.notFound (res);
            return;
        }
        const action = match[2] ?? '';
        // Once a browser has loaded the form, the session belongs to that browser: whoever
        // else learns the URL afterwards (it was on disk for a moment, it is in the address
        // bar) gets the same empty 404 as a wrong token.
        const bound = session.cookie !== undefined;
        if (bound && !safeEqual (this.presentedCookie (req), session.cookie as string)) {
            this.notFound (res);
            return;
        }
        if (action === '') {
            if (req.method !== 'GET') {
                this.send (res, 405, '', { 'Allow': 'GET' });
                return;
            }
            // the first load is the one the URL token is good for; a reload by the same
            // browser arrives with the cookie and is served again
            let setCookie: string | undefined = undefined;
            if (session.cookie === undefined) {
                session.cookie = randomToken ();
                // Scoped to this form's own path, so the browser sends it nowhere else — not
                // even to another program listening on a different loopback port.
                // SameSite=Lax, not Strict: the form is reached by a navigation that starts
                // on the launch file (another site, to the browser), and Chromium replays
                // that initiator on a reload — with Strict the reload arrives without the
                // cookie and the user's own tab gets the 404. Lax still withholds the cookie
                // from every cross-site subrequest and POST; what it lets through is a
                // top-level GET by someone who already knows the token, which shows them
                // nothing (the page opens in the user's browser, unframeable, unscriptable).
                setCookie = COOKIE_NAME + '=' + session.cookie + '; HttpOnly; SameSite=Lax; Path=/setup/' + session.token;
            }
            this.dropLaunchFile (session);
            if (session.page === 'accounts') {
                this.sendAccountsPage (res, session, setCookie);
            } else {
                this.sendWizardPage (res, session, setCookie, undefined);
            }
            return;
        }
        // what a session answers besides its page depends on its kind: a setup session has
        // never heard of the account list or of removing anything
        const manage = session.page === 'accounts';
        const reads = manage ? [ 'credentials', 'accounts', 'wizard' ] : [ 'credentials' ];
        const writes = manage ? [ 'test', 'save', 'remove', 'permissions', 'close' ] : [ 'test', 'save' ];
        if (!bound || (!reads.includes (action) && !writes.includes (action))) {
            // nothing but the page itself is served before a browser is bound to the session
            this.notFound (res);
            return;
        }
        if (reads.includes (action)) {
            if (req.method !== 'GET') {
                this.send (res, 405, '', { 'Allow': 'GET' });
                return;
            }
            if (action === 'credentials') {
                this.sendJson (res, 200, this.describeExchange (query.get ('exchange') ?? '', query.get ('prediction') === '1'));
            } else if (action === 'accounts') {
                this.sendJson (res, 200, { 'ok': true, ...this.accountList () });
            } else {
                // the same step-by-step form, reached from the accounts page: to add an
                // account, or (?account=<name>) to replace the key of one the file holds
                this.sendWizardPage (res, session, undefined, query.get ('account') ?? undefined);
            }
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
        if (session.busy) {
            this.sendJson (res, 409, { 'ok': false, 'code': 'BUSY', 'error': 'the previous step is still running — wait a moment' });
            return;
        }
        session.busy = true;
        // The credential values this request puts to use are registered with the redactor by
        // baseAccount, before anything is tested or logged. `provisional` collects the ones
        // this request added: unless it ends in a save they are taken back at the very end,
        // after the response and every log line about it went through the redactor.
        const provisional: string[] = [];
        // the credential values of an account this request removed: they stay redactable
        // until the response and every log line about it are out, then the server forgets them
        const forget: string[] = [];
        let saved = false;
        try {
            let result: Record<string, any>;
            if (action === 'test') {
                result = await this.runTest (body, provisional);
            } else if (action === 'save') {
                result = await this.runSave (body, session, provisional);
            } else if (action === 'remove') {
                result = this.runRemove (body, forget);
            } else if (action === 'permissions') {
                result = this.runPermissions (body);
            } else {
                result = this.runClose (session);
            }
            saved = action === 'save';
            this.sendJson (res, 200, result);
        } catch (e: any) {
            if (e instanceof FormError) {
                this.sendJson (res, e.status, { 'ok': false, 'code': e.code, 'error': e.message });
            } else {
                log ('warning', 'setup form: request failed: ' + redact (String (e?.message ?? e)));
                this.sendJson (res, 500, { 'ok': false, 'code': 'INTERNAL', 'error': 'something went wrong on this computer — close this tab and ask the assistant to open the setup form again' });
            }
        } finally {
            session.busy = false;
            if (!saved) {
                for (const value of provisional) {
                    unregisterSecret (value);
                }
            }
            for (const value of forget) {
                unregisterSecret (value);
            }
        }
        if (this.session === undefined) {
            // the save (or "Done") ended the session; let this response out, then give the port back
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

    private sendHtml (res: http.ServerResponse, file: 'setup.html' | 'accounts.html', boot: Record<string, any>, setCookie: string | undefined): void {
        const nonce = randomBytes (16).toString ('base64');
        // redact (): nothing in a boot block is a credential, and should one ever get there
        // it leaves as a label
        const html = loadTemplate (file)
            .replace (/__CSP_NONCE__/g, () => nonce)
            .replace ('__BOOT_JSON__', () => redact (scriptJson (boot)));
        this.send (res, 200, html, {
            ...((setCookie !== undefined) ? { 'Set-Cookie': setCookie } : {}),
            'Content-Type': 'text/html; charset=utf-8',
            // nothing external, nothing inline without this response's nonce, and the only
            // place the page may send data is back here
            'Content-Security-Policy': "default-src 'none'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
        });
    }

    // The step-by-step form. `replaceName` (accounts sessions only) names a file account whose
    // key is being replaced: the form then opens prefilled with what is known about it —
    // never a credential — and saves over it.
    private sendWizardPage (res: http.ServerResponse, session: Session, setCookie: string | undefined, replaceName: string | undefined): void {
        const directory = this.ctx.pools.directory ();
        const prefill = session.prefill;
        const boot: Record<string, any> = {
            'csrf': session.csrf,
            'exchanges': directory.allExchangeIds (),
            'prefill': {
                'exchange': (prefill.exchange !== undefined && directory.isKnownExchange (prefill.exchange)) ? prefill.exchange : '',
                'account': isValidAccountName (prefill.account) ? prefill.account : '',
                'environment': (prefill.sandbox === false) ? 'live' : 'sandbox',
            },
            'configPath': this.configPath (),
            'expiresInMs': Math.max (0, session.expiresAt - this.deps.now ()),
            // 'accounts': the form was reached from the accounts page and goes back to it
            'page': session.page,
        };
        if (session.page === 'accounts') {
            // the tool call's prefill belongs to a setup session; this form starts empty…
            boot['prefill'] = { 'exchange': '', 'account': '', 'environment': 'sandbox' };
            const entry = (replaceName === undefined) ? undefined : this.accountList ().accounts.find ((candidate) => candidate['name'] === replaceName);
            if (entry !== undefined && entry['canReplace'] === true) {
                // …or with the account being replaced: its name, exchange, environment and
                // whether orders were allowed. Its keys are typed again; that is the point.
                boot['prefill'] = {
                    'exchange': directory.isKnownExchange (entry['exchange']) ? entry['exchange'] : '',
                    'account': entry['name'],
                    'environment': entry['environment'],
                };
                boot['replace'] = {
                    'prediction': entry['prediction'] === true,
                    'trading': entry['trading'] !== false,
                    'maxOrderValue': (typeof entry['maxOrderValue'] === 'number') ? entry['maxOrderValue'] : undefined,
                };
            }
        }
        this.sendHtml (res, 'setup.html', boot, setCookie);
    }

    private sendAccountsPage (res: http.ServerResponse, session: Session, setCookie: string | undefined): void {
        this.sendHtml (res, 'accounts.html', {
            'csrf': session.csrf,
            'configPath': this.configPath (),
            'expiresInMs': Math.max (0, session.expiresAt - this.deps.now ()),
            ...this.accountList (),
        }, setCookie);
    }

    // ---------------------------------------------------------------------------------
    // form logic

    // Some exchange ids exist twice in ccxt: once as the ordinary exchange and once in the
    // prediction-markets namespace (a different class, sometimes with different credentials).
    // Asked of the pools — the same catalogue accounts are instantiated from — and not of a
    // list kept here.
    private hasPredictionVariant (exchangeId: string): boolean {
        try {
            return this.ctx.pools.getBare (exchangeId, true).constructor !== this.ctx.pools.getBare (exchangeId, false).constructor;
        } catch (e) {
            return false;
        }
    }

    private bare (exchangeId: string, prediction = false): any {
        if (typeof exchangeId !== 'string' || !this.ctx.pools.directory ().isKnownExchange (exchangeId)) {
            throw new FormError (400, 'UNKNOWN_EXCHANGE', 'that exchange is not supported — pick one from the list');
        }
        if (prediction && !this.hasPredictionVariant (exchangeId)) {
            throw new FormError (400, 'NO_PREDICTION', exchangeId + ' has no separate prediction-markets account');
        }
        return this.ctx.pools.getBare (exchangeId, prediction);
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

    // On some exchanges (OKX and its regional sites, WEEX) ccxt's "sandbox" is not a separate
    // testnet at all: urls.test repeats the live hosts and setSandboxMode only adds a header
    // that selects the exchange's own demo/simulated trading. Their users know that mode as
    // "demo trading", so the page must not present it as a testnet and call demo trading
    // "not offered". Detected from the metadata: every REST entry of urls.test equals its
    // urls.api counterpart (the "ws" entry is left out — a demo mode may still stream from
    // its own socket host). An exchange whose practice mode lives on a different REST host
    // is, as far as the metadata can tell, a testnet — whatever the exchange itself calls it.
    private sandboxIsDemo (bare: any): boolean {
        const test = bare.urls?.test;
        const api = bare.urls?.api;
        if (test === undefined || api === undefined) {
            return false;
        }
        if (typeof test !== 'object' || test === null) {
            return test === api;
        }
        const keys = Object.keys (test).filter ((key) => key !== 'ws');
        return keys.length > 0 && typeof api === 'object' && api !== null && keys.every ((key) => JSON.stringify (test[key]) === JSON.stringify (api[key]));
    }

    private describeExchange (exchangeId: string, prediction = false): Record<string, any> {
        let bare: any;
        try {
            bare = this.bare (exchangeId, prediction);
        } catch (e: any) {
            return { 'ok': false, 'code': (e instanceof FormError) ? e.code : 'UNKNOWN_EXCHANGE', 'error': e.message };
        }
        const fields = this.requiredFields (bare);
        return {
            'ok': true,
            'exchange': exchangeId,
            prediction,
            // true: the page asks which of the two accounts on this exchange is being added
            'predictionVariant': this.hasPredictionVariant (exchangeId),
            'name': (typeof bare.name === 'string') ? bare.name : exchangeId,
            'website': firstHttpsUrl (bare.urls?.www),
            'fields': fields.map ((field) => ({ 'name': field, 'label': CREDENTIAL_LABELS[field] ?? field })),
            // ccxt declares no credential for it, yet its private calls need some (a wallet key
            // in "options", keys derived at run time): nothing this form could ask for
            'configFileOnly': fields.length === 0,
            // signs with a wallet key rather than an exchange-issued API key
            'walletKey': fields.includes ('privateKey'),
            'environments': this.environments (bare),
            'sandboxIsDemo': this.sandboxIsDemo (bare),
        };
    }

    // exchange + credentials + environment -> the account record both the test and the save
    // build on; every rule here is enforced server-side whatever the page did or did not check
    private baseAccount (input: { exchange: string, prediction?: boolean, credentials: Record<string, string>, environment: string }, provisional: string[]): Record<string, any> {
        const prediction = input.prediction === true;
        const bare = this.bare (input.exchange, prediction);
        const required = this.requiredFields (bare);
        if (required.length === 0) {
            // saving it would produce an account with no credentials that fails on every call
            throw new FormError (400, 'CONFIG_FILE_ONLY', input.exchange + (prediction ? ' prediction markets' : '') + ' cannot be set up from this form: it takes its credentials in a way the form cannot collect — add the account to the config file instead');
        }
        const account: Record<string, any> = { 'exchange': input.exchange };
        if (prediction) {
            account['prediction'] = true;
        }
        for (const [ field, rawValue ] of Object.entries (input.credentials)) {
            if (!required.includes (field)) {
                throw new FormError (400, 'BAD_REQUEST', 'unexpected credential field for this exchange');
            }
            const value = unescapePem (rawValue.trim ());
            if (value !== '') {
                // exactly the value that is sent to the exchange and written to the file
                // becomes redactable, before either happens — and nothing else does: a
                // field this exchange does not take, or the untrimmed text, is never used
                if (registerSecret (value, field)) {
                    provisional.push (value);
                }
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

    private async runTest (body: any, provisional: string[]): Promise<Record<string, any>> {
        const parsed = testSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the submitted form is incomplete');
        }
        const account = this.baseAccount (parsed.data, provisional);
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
        // an exchange with no balance endpoint cannot fail this test in a way that says
        // anything about the keys — reported as "not tested", never as a failure
        const untestable = { 'ok': true, 'tested': false, 'code': 'NOT_TESTABLE' };
        try {
            exchange = this.ctx.pools.buildProbe ({ ...account, 'timeout': timeoutMs });
            if (exchange.has?.['fetchBalance'] !== true) {
                outcome = untestable;
            } else {
                await Promise.race ([
                    exchange.fetchBalance (),
                    new Promise ((_resolve, reject) => {
                        timer = setTimeout (() => reject (new FormError (504, 'TIMEOUT', 'the exchange did not answer in time')), timeoutMs);
                    }),
                ]);
                outcome = { 'ok': true, 'tested': true };
            }
        } catch (e: any) {
            const kind = (e instanceof FormError) ? 'RequestTimeout' : String (e?.constructor?.name ?? 'Error');
            if (kind === 'NotSupported') {
                outcome = untestable;
            } else {
                // redact() covers the values in use (registered by baseAccount); the slice
                // keeps a verbose exchange payload from flooding the page
                const detail = redact (String (e?.message ?? e)).slice (0, 300);
                outcome = { 'ok': false, 'tested': true, 'code': 'TEST_FAILED', kind, 'error': detail };
            }
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
        const verdict = (outcome['tested'] === false) ? 'was skipped (the exchange has no balance check)' : (outcome['ok'] ? 'succeeded' : ('failed (' + outcome['kind'] + ')'));
        log ('info', 'setup form: connection test on ' + account.exchange + ' ' + verdict);
        return outcome;
    }

    private async runSave (body: any, session: Session, provisional: string[]): Promise<Record<string, any>> {
        const parsed = saveSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the submitted form is incomplete');
        }
        const input = parsed.data;
        if (isReservedAccountName (input.name)) {
            throw new FormError (400, 'INVALID_NAME', '"' + input.name + '" cannot be used as an account name — choose a different one');
        }
        if (!isValidAccountName (input.name)) {
            throw new FormError (400, 'INVALID_NAME', 'the account name must be 1-40 characters: letters, digits, "-" and "_"');
        }
        const raw = this.baseAccount (input, provisional);
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
        // environment variables) is only ever swapped out on an explicit yes. Own property:
        // a name like "toString" is not "already there" because every object has one.
        const accounts = this.ctx.config.accounts;
        const previous: AccountConfig | undefined = hasOwn (accounts, input.name) ? accounts[input.name] : undefined;
        if (previous !== undefined && !replace) {
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
        accounts[input.name] = account;
        // Streams first, then the cached client. A private stream keeps its own reference to
        // the old client and would go on reconnecting with the old keys on the old
        // environment under this account's name; they are stopped, not migrated — the new
        // account may be a different environment or even a different exchange.
        const stoppedStreams: number = this.ctx.subscriptions.stopAccount (input.name);
        this.ctx.pools.evictAuthenticated (input.name);
        const hadNoFile = this.ctx.config.configPath === undefined;
        if (hadNoFile) {
            this.ctx.config.configPath = written.path;
        }
        // Startup complaints this save made untrue would otherwise sit in get_safety_status
        // until a restart, contradicting the accounts listed next to them: the ones about
        // the account that was just replaced, the file being readable by others (the writer
        // leaves it 0600) and, when there was no file, that it was missing. Two stay because
        // they still hold: an env account shadowed by this name, and a file refused under
        // strictPermissions (its other accounts were never loaded).
        const accountPrefix = 'account ' + JSON.stringify (input.name);
        this.dropProblems ((problem) => problem.startsWith (accountPrefix + ':') || problem.startsWith (accountPrefix + ' invalid:') || problem.startsWith (accountPrefix + ' ignored:')
            || (hadNoFile && problem.startsWith ('CCXT_MCP_CONFIG points to a missing file')));
        // an account that only lived in memory (environment variables) was replaced just as
        // much as one in the file, and the record must say so
        const replaced = written.replaced || previous !== undefined;
        const trading = account.trading ?? false;
        const tradingText = (trading === 'live') ? 'LIVE trading, max order ' + account.maxOrderValue + ' USD' : (trading ? 'trading' : 'read-only');
        // tool tiers this account newly enables on a server that hides unconfigured ones
        let tiers: TierListing = { 'added': [], 'restartNeeded': false };
        if (this.listTiers !== undefined) {
            tiers = this.listTiers (account);
        }
        // names and modes only — a credential value has no business in either record
        const manage = session.page === 'accounts';
        log ('info', 'account ' + JSON.stringify (input.name) + ' on ' + input.exchange + ' saved via ' + (manage ? 'the accounts page' : 'setup form') + ' (' + input.environment + ', ' + tradingText + ')'
            + (replaced ? ' — replaced the previous account of that name' : '')
            + ((stoppedStreams > 0) ? ' — stopped ' + stoppedStreams + ' live stream(s) that ran on its old keys' : '')
            + ((tiers.added.length > 0) ? ' — now listing the ' + tiers.added.join (' and ') + ' tools' : ''));
        try {
            this.ctx.journal.append ({
                'ts': new Date (this.deps.now ()).toISOString (),
                'event': 'result',
                'intentId': 'setup-' + randomBytes (6).toString ('hex'),
                'account': input.name,
                'exchange': input.exchange,
                'environment': input.environment,
                'tool': manage ? 'manage_accounts' : 'setup_account',
                'method': 'saveAccount',
                'outcome': {
                    'source': manage ? 'accounts page' : 'setup form',
                    trading,
                    'maxOrderValue': account.maxOrderValue,
                    replaced,
                    'previousEnvironment': (previous !== undefined) ? accountEnvironment (previous) : undefined,
                    stoppedStreams,
                },
            });
        } catch (e: any) {
            log ('warning', 'setup form: could not journal the saved account: ' + redact (String (e?.message ?? e)));
        }
        // A setup session is single use: the token that just saved an account can never save
        // (or read) another. An accounts session goes on — its form was one stop on the way
        // back to the list (see the note on Session).
        if (this.session === session && !manage) {
            this.dropLaunchFile (session);
            this.session = undefined;
        }
        return {
            'ok': true,
            ...(manage ? { 'returnTo': 'accounts' } : {}),
            'account': input.name,
            'exchange': input.exchange,
            'environment': input.environment,
            trading,
            replaced,
            stoppedStreams,
            // tools that were just added to the running server's list for this account
            'toolsAdded': tiers.added.length > 0,
            // true only when a newly enabled tier could NOT be listed without a restart
            'restartForTools': tiers.restartNeeded,
        };
    }

    // ---------------------------------------------------------------------------------
    // "Your accounts"

    // Removes the startup complaints an edit of the config file made untrue. The one about
    // the file being readable by other users goes with every edit: each rewrites it 0600.
    private dropProblems (untrue: (problem: string) => boolean): void {
        this.ctx.config.problems = this.ctx.config.problems.filter ((problem: string) => {
            if (problem.startsWith ('WARNING: config file ') && problem.includes (' is readable by other users')) {
                return false;
            }
            return !untrue (problem);
        });
    }

    // Everything the accounts page is ever told about one account. This is the whole
    // disclosure: names, modes, WHICH credential fields are set, and the last four characters
    // of the API key so the user can tell two keys apart against the exchange's own list.
    // No other part of any credential leaves here — not the secret, not a passphrase or
    // private key, not a length, not a masked rendering that would give a length away.
    private accountEntry (name: string, record: Record<string, any>, source: 'file' | 'environment', loaded: boolean): Record<string, any> {
        const exchange = (typeof record['exchange'] === 'string') ? record['exchange'] : '';
        const prediction = record['prediction'] === true;
        const known = this.ctx.pools.directory ().isKnownExchange (exchange);
        let exchangeName = exchange;
        let sandboxIsDemo = false;
        try {
            const bare = this.bare (exchange, prediction);
            exchangeName = (typeof bare.name === 'string') ? bare.name : exchange;
            sandboxIsDemo = this.sandboxIsDemo (bare);
        } catch (e) {
            // an exchange this server does not know keeps its id as its name
        }
        const trading = (record['trading'] === true || record['trading'] === 'live') ? record['trading'] : false;
        const apiKey = record['apiKey'];
        const editable = source === 'file';
        return {
            name,
            exchange,
            exchangeName,
            prediction,
            'environment': (record['sandbox'] === true) ? 'sandbox' : ((record['demo'] === true) ? 'demo' : 'live'),
            sandboxIsDemo,
            trading,
            'maxOrderValue': (typeof record['maxOrderValue'] === 'number') ? record['maxOrderValue'] : undefined,
            // shown, never switchable here: these two tiers are enabled by editing the file
            'funds': record['funds'] === true || record['funds'] === 'live',
            'implicitWrites': record['implicitWrites'] === true,
            'credentials': CREDENTIAL_FIELDS.filter ((field) => typeof record[field] === 'string' && record[field] !== '').map ((field) => CREDENTIAL_LABELS[field] ?? field),
            'keyEnding': (typeof apiKey === 'string' && apiKey.length >= MIN_KEY_LENGTH_FOR_ENDING) ? apiKey.slice (-4) : undefined,
            source,
            // false: the file holds it but the running server does not use it (it was added
            // by hand since the server started, or it did not pass validation)
            loaded,
            'canRemove': editable,
            'canEditPermissions': editable && loaded,
            // the form saves under names it can validate, and an exchange it knows
            'canReplace': editable && known && isValidAccountName (name),
        };
    }

    // The accounts the server is using, each marked with where it comes from, followed by
    // the ones the config file holds that are not in use. An account whose name the file does
    // not hold was defined outside it (CCXT_MCP_* variables, which is also how a host's
    // install prompt hands keys over) and cannot be changed from here: the page shows it
    // read-only and says where it comes from.
    private accountList (): { accounts: Record<string, any>[], fileProblem: string | undefined } {
        let inFile: Record<string, Record<string, any>> = {};
        let fileProblem: string | undefined = undefined;
        try {
            inFile = readConfigFileAccounts (this.configPath (), { 'isKnownExchange': this.ctx.pools.directory ().isKnownExchange }).accounts;
        } catch (e: any) {
            // with an unreadable file nothing can be told apart or edited: everything is
            // listed read-only and the page says why
            fileProblem = (e instanceof ConfigWriteError) ? e.message : 'the config file could not be read';
        }
        const accounts: Record<string, any>[] = [];
        const memory = this.ctx.config.accounts;
        for (const name of Object.keys (memory)) {
            const entry = this.accountEntry (name, memory[name], (fileProblem === undefined && !hasOwn (inFile, name)) ? 'environment' : 'file', true);
            if (fileProblem !== undefined) {
                entry['canRemove'] = false;
                entry['canEditPermissions'] = false;
                entry['canReplace'] = false;
            }
            accounts.push (entry);
        }
        for (const name of Object.keys (inFile)) {
            if (!hasOwn (memory, name)) {
                accounts.push (this.accountEntry (name, inFile[name], 'file', false));
            }
        }
        return { accounts, fileProblem };
    }

    private configWriteFailure (e: any, name: string, inUse: boolean): FormError {
        if (!(e instanceof ConfigWriteError)) {
            return e;
        }
        if (e.code !== 'NOT_FOUND') {
            return new FormError (400, e.code, e.message);
        }
        return inUse
            ? new FormError (409, 'NOT_IN_FILE', 'the account "' + name + '" does not come from the settings file, so it cannot be changed here — change it where it was entered (the assistant app\'s own settings for this plugin, or its environment variables)')
            : new FormError (400, 'UNKNOWN_ACCOUNT', 'there is no account named "' + name + '"');
    }

    // Removes one account from the config file — in the file's own shape, everything else in
    // it untouched — and from the running server.
    private runRemove (body: any, forget: string[]): Record<string, any> {
        const parsed = removeSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the request is incomplete');
        }
        const name = parsed.data.name;
        const accounts = this.ctx.config.accounts;
        const previous: AccountConfig | undefined = hasOwn (accounts, name) ? accounts[name] : undefined;
        let fromFile: Record<string, any> = {};
        try {
            updateAccountInConfigFile (this.configPath (), name, (record) => {
                fromFile = record;
                return undefined;
            }, { 'isKnownExchange': this.ctx.pools.directory ().isKnownExchange });
        } catch (e: any) {
            throw this.configWriteFailure (e, name, previous !== undefined);
        }
        // Out of the running server, in the same order as a replacement: its streams first
        // (each holds its own reference to the client and would reconnect with the removed
        // keys), then the cached client, then the record. Other accounts are not touched —
        // not even one on the same exchange, whose client and streams are its own.
        let stoppedStreams = 0;
        if (previous !== undefined) {
            stoppedStreams = this.ctx.subscriptions.stopAccount (name);
            this.ctx.pools.evictAuthenticated (name);
            delete accounts[name];
            // the server forgets the removed values (after this response is out) — except
            // one another account still uses, which must stay redactable
            const stillUsed = new Set<string> ();
            for (const other of Object.values (accounts) as AccountConfig[]) {
                for (const field of CREDENTIAL_FIELDS) {
                    const value = (other as any)[field];
                    if (typeof value === 'string') {
                        stillUsed.add (value);
                    }
                }
            }
            for (const field of CREDENTIAL_FIELDS) {
                const value = (previous as any)[field];
                if (typeof value === 'string' && !stillUsed.has (value)) {
                    forget.push (value);
                }
            }
        }
        // An account of this name defined in the environment was hidden by the file account
        // all along; it is not in memory, so it only takes over at the next start.
        const shadowPrefix = 'env/.mcpb-form account "' + name + '" (';
        const returnsOnRestart = this.ctx.config.problems.some ((problem: string) => problem.startsWith (shadowPrefix));
        const accountPrefix = 'account ' + JSON.stringify (name);
        this.dropProblems ((problem) => problem.startsWith (accountPrefix + ':') || problem.startsWith (accountPrefix + ' invalid:') || problem.startsWith (accountPrefix + ' ignored:') || problem.startsWith (shadowPrefix));
        const record: Record<string, any> = previous ?? fromFile;
        const exchange = (typeof record['exchange'] === 'string') ? record['exchange'] : '';
        const environment = (record['sandbox'] === true) ? 'sandbox' : ((record['demo'] === true) ? 'demo' : 'live');
        // names and modes only
        log ('info', 'account ' + JSON.stringify (name) + ' on ' + exchange + ' removed via the accounts page'
            + ((previous === undefined) ? ' (it was in the config file but not in use)' : '')
            + ((stoppedStreams > 0) ? ' — stopped ' + stoppedStreams + ' live stream(s) that ran on its keys' : ''));
        this.journalAction (name, exchange, environment, 'removeAccount', { 'source': 'accounts page', 'wasInUse': previous !== undefined, stoppedStreams, returnsOnRestart });
        return { 'ok': true, 'removed': name, stoppedStreams, returnsOnRestart, ...this.accountList () };
    }

    // Turns order placement on or off for one file account. It is the ONLY thing this edits:
    // "trading", and with live trading the cap and the confirmation rule that go with it.
    // Everything else in the record is written back as it was — including the funds and
    // implicitWrites tiers, which no page can change. (Replacing an account through the form
    // is different on purpose: it writes a fresh record, so a tier enabled by hand does not
    // silently carry over to keys the user typed for something else.)
    private runPermissions (body: any): Record<string, any> {
        const parsed = permissionsSchema.safeParse (body);
        if (!parsed.success) {
            throw new FormError (400, 'BAD_REQUEST', 'the request is incomplete');
        }
        const input = parsed.data;
        const name = input.name;
        const accounts = this.ctx.config.accounts;
        const previous: AccountConfig | undefined = hasOwn (accounts, name) ? accounts[name] : undefined;
        const directory = this.ctx.pools.directory ();
        // (the cast keeps the type wide: it is assigned inside the callback below)
        let trading = false as boolean | 'live';
        try {
            updateAccountInConfigFile (this.configPath (), name, (record) => {
                if (previous === undefined) {
                    throw new FormError (409, 'NOT_LOADED', 'the account "' + name + '" is in the settings file but not in use yet — restart the assistant app, then change it');
                }
                // the environment decides whether this is practice or real money, and it is
                // taken from the record itself, never from the request
                const environment = (record['sandbox'] === true) ? 'sandbox' : ((record['demo'] === true) ? 'demo' : 'live');
                if (environment !== accountEnvironment (previous) || record['exchange'] !== previous.exchange || (record['prediction'] === true) !== (previous.prediction === true)) {
                    // the file was edited by hand since the server read it: "practice" in one
                    // and "live" in the other must never be settled by a guess
                    throw new FormError (409, 'OUT_OF_SYNC', 'the settings file was changed since the assistant app started — restart the app, then change this account');
                }
                const next = { ...record };
                if (!input.trading) {
                    // switching off needs no second yes: it only ever takes abilities away
                    delete next['trading'];
                } else if (environment === 'live') {
                    // real money: the same two conditions as the form's save, checked here
                    if (input.maxOrderValue === undefined || !Number.isFinite (input.maxOrderValue) || input.maxOrderValue <= 0) {
                        throw new FormError (400, 'CAP_REQUIRED', 'live trading needs a maximum order size in USD (a number above 0)');
                    }
                    if (input.liveConfirmed !== true) {
                        throw new FormError (400, 'CONFIRM_REQUIRED', 'tick the confirmation box to allow orders with real money');
                    }
                    trading = 'live';
                    next['trading'] = 'live';
                    next['maxOrderValue'] = input.maxOrderValue;
                    next['confirm'] = 'always';
                } else {
                    trading = true;
                    next['trading'] = true;
                }
                // the record as startup would load it: an edit that validation would undo
                // (or a record it rejects) is refused instead of written
                const problems: string[] = [];
                const checked = validateAccount (name, next, problems, directory);
                if (checked === undefined || (checked.trading ?? false) !== trading) {
                    throw new FormError (400, 'INVALID_ACCOUNT', problems.join ('; ') || 'the account could not be validated');
                }
                return next;
            }, { 'isKnownExchange': directory.isKnownExchange });
        } catch (e: any) {
            throw this.configWriteFailure (e, name, previous !== undefined);
        }
        // hot-apply: only the fields this edit owns change in memory too. The cached client
        // and the streams are left alone — the keys and the environment are the same.
        const account = { ...(previous as AccountConfig), trading } as AccountConfig;
        if (trading === 'live') {
            account.maxOrderValue = input.maxOrderValue;
            account.confirm = 'always';
        }
        accounts[name] = account;
        const accountPrefix = 'account ' + JSON.stringify (name) + ':';
        this.dropProblems ((problem) => problem.startsWith (accountPrefix) && problem.includes ('"trading":'));
        let tiers: TierListing = { 'added': [], 'restartNeeded': false };
        if (trading !== false && this.listTiers !== undefined) {
            tiers = this.listTiers (account);
        }
        const environment = accountEnvironment (account);
        const tradingText = (trading === 'live') ? 'LIVE trading, max order ' + account.maxOrderValue + ' USD' : (trading ? 'trading' : 'read-only');
        log ('info', 'account ' + JSON.stringify (name) + ' on ' + account.exchange + ' changed via the accounts page: now ' + tradingText + ' (' + environment + ')'
            + ((tiers.added.length > 0) ? ' — now listing the ' + tiers.added.join (' and ') + ' tools' : ''));
        this.journalAction (name, account.exchange, environment, 'setPermissions', { 'source': 'accounts page', trading, 'maxOrderValue': (trading === 'live') ? account.maxOrderValue : undefined, 'previousTrading': (previous as AccountConfig).trading ?? false });
        return { 'ok': true, 'account': name, trading, 'toolsAdded': tiers.added.length > 0, 'restartForTools': tiers.restartNeeded, ...this.accountList () };
    }

    // the page's "Done" button: the user says they are finished, so the session ends now
    // instead of lingering until it expires
    private runClose (session: Session): Record<string, any> {
        if (this.session === session) {
            this.dropLaunchFile (session);
            this.session = undefined;
        }
        log ('info', 'accounts page closed by the user');
        return { 'ok': true, 'closed': true };
    }

    private journalAction (account: string, exchange: string, environment: string, method: string, outcome: Record<string, any>): void {
        try {
            this.ctx.journal.append ({
                'ts': new Date (this.deps.now ()).toISOString (),
                'event': 'result',
                'intentId': 'accounts-' + randomBytes (6).toString ('hex'),
                account,
                exchange,
                environment,
                'tool': 'manage_accounts',
                method,
                outcome,
            });
        } catch (e: any) {
            log ('warning', 'accounts page: could not journal the change: ' + redact (String (e?.message ?? e)));
        }
    }
}
