import fs from 'fs';
import http from 'http';
import path from 'path';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { AddressInfo } from 'net';
import { log } from '../logging.js';
import { redact } from '../redact.js';
import { defaultLaunchRoots, launchPage, openInBrowser } from './launch.js';
import { renderPage } from './pages.js';
import type { PageFile } from './pages.js';

// THE SECURITY CORE of the account pages. Everything that decides whether a request is served
// lives in this file and in launch.ts: the session and its lifetime, the URL token, the cookie
// binding, the per-session nonce, the Host / Origin / fetch-metadata checks, the request
// limits and the response headers. It imports nothing that knows what an account is — what a
// verified request then DOES is behind SessionHandlers (implemented by accounts.ts, wired up
// in server.ts), so this file can be read, and audited, on its own.

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
const DRAIN_LIMIT_BYTES = 1024 * 1024;
const NONCE_HEADER = 'x-setup-nonce';
const COOKIE_NAME = 'ccxt_setup';
const LAUNCH_FILE = 'open.html';

export interface SetupPrefill {
    exchange?: string;
    account?: string;
    sandbox?: boolean;
}

export interface SessionDeps {
    // launches the user's browser on the launch FILE (a local path, never the form URL);
    // rejects when it cannot. Tests inject one and read the file to learn the URL — which is
    // also the only way anything outside this module ever sees it.
    opener: (file: string) => Promise<void>;
    // directories to try, in order, for the launch file's private directory
    launchRoots: () => string[];
    now: () => number;
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
// have. What the page can reveal is fixed by accountEntry () in accounts.ts: names, modes and the last
// four characters of an API key — no request to an accounts session returns more than that.

export class FormError extends Error {
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

// What a page is told about its own session when it is rendered.
export interface SessionView {
    page: SetupPage;
    // the per-session nonce every write must send back (NONCE_HEADER)
    csrf: string;
    prefill: SetupPrefill;
    expiresInMs: number;
}

// the actions that change something (or send keys to an exchange) and are not the session's own
export type WriteAction = 'test' | 'save' | 'remove' | 'permissions';

export interface WriteOutcome {
    // the JSON answer (it still goes through the redactor on its way out)
    body: Record<string, any>;
    // true: this request used the session up (a setup session's one save)
    endSession?: boolean;
}

// Everything behind the checks. A handler is only ever called for a request that passed all of
// them (live session, bound browser, and for write () also POST + Origin + JSON + nonce + body
// cap + not busy); it refuses with a FormError and never touches the session or the socket.
export interface SessionHandlers {
    // the boot block (the only data a page starts with) of the step-by-step form and of the
    // accounts page; `replaceName` (accounts sessions only) names the account being replaced
    wizardBoot (view: SessionView, replaceName: string | undefined): Record<string, any>;
    accountsBoot (view: SessionView): Record<string, any>;
    read (action: 'credentials' | 'accounts', query: URLSearchParams): Record<string, any>;
    // `afterResponse` collects work that must wait until the response and every log line about
    // it went through the redactor (taking a credential value back out of it, see accounts.ts)
    write (action: WriteAction, body: any, page: SetupPage, afterResponse: (() => void)[]): Promise<WriteOutcome>;
}

export class SessionServer {
    deps: SessionDeps;
    private handlers: SessionHandlers;
    private server: http.Server | undefined = undefined;
    private session: Session | undefined = undefined;
    private expiryTimer: NodeJS.Timeout | undefined = undefined;

    constructor (handlers: SessionHandlers, deps: Partial<SessionDeps> = {}) {
        this.handlers = handlers;
        this.deps = {
            'opener': deps.opener ?? openInBrowser,
            'launchRoots': deps.launchRoots ?? defaultLaunchRoots,
            'now': deps.now ?? (() => Date.now ()),
        };
    }

    isListening (): boolean {
        return this.server !== undefined;
    }

    hasLiveSession (): boolean {
        return this.session !== undefined && this.deps.now () < this.session.expiresAt;
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
                this.sendHtml (res, 'accounts.html', this.handlers.accountsBoot (this.view (session)), setCookie);
            } else {
                this.sendHtml (res, 'setup.html', this.handlers.wizardBoot (this.view (session), undefined), setCookie);
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
            if (action === 'credentials' || action === 'accounts') {
                this.sendJson (res, 200, this.handlers.read (action, query));
            } else {
                // the same step-by-step form, reached from the accounts page: to add an
                // account, or (?account=<name>) to replace the key of one the file holds
                this.sendHtml (res, 'setup.html', this.handlers.wizardBoot (this.view (session), query.get ('account') ?? undefined), undefined);
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
        // what the handler asks to have done once the response is out (see SessionHandlers.write)
        const afterResponse: (() => void)[] = [];
        try {
            let result: Record<string, any>;
            if (action === 'close') {
                result = this.runClose (session);
            } else {
                const outcome = await this.handlers.write (action as WriteAction, body, session.page, afterResponse);
                result = outcome.body;
                // A setup session is single use: the token that just saved an account can never
                // save (or read) another. An accounts session goes on — its form was one stop on
                // the way back to the list (see the note on Session).
                if (outcome.endSession === true && this.session === session) {
                    this.dropLaunchFile (session);
                    this.session = undefined;
                }
            }
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
            for (const task of afterResponse) {
                task ();
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

    private view (session: Session): SessionView {
        return {
            'page': session.page,
            'csrf': session.csrf,
            'prefill': session.prefill,
            'expiresInMs': Math.max (0, session.expiresAt - this.deps.now ()),
        };
    }

    private sendHtml (res: http.ServerResponse, file: PageFile, boot: Record<string, any>, setCookie: string | undefined): void {
        // a fresh nonce per response: it is what makes the page's own inline blocks runnable
        const nonce = randomBytes (16).toString ('base64');
        const html = renderPage (file, nonce, boot);
        this.send (res, 200, html, {
            ...((setCookie !== undefined) ? { 'Set-Cookie': setCookie } : {}),
            'Content-Type': 'text/html; charset=utf-8',
            // nothing external, nothing inline without this response's nonce, and the only
            // place the page may send data is back here
            'Content-Security-Policy': "default-src 'none'; script-src 'nonce-" + nonce + "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; img-src data:; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
        });
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
}
