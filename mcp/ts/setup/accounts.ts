import { randomBytes } from 'crypto';
import { z } from 'zod';
import { log } from '../logging.js';
import { redact, registerSecret, unregisterSecret } from '../redact.js';
import { ConfigWriteError, configFileIsPrivate, hasOwn, isReservedAccountName, isValidAccountName, readConfigFileAccounts, registerAccountSecrets, resolveConfigPath, unescapePem, updateAccountInConfigFile, validateAccount, writeAccountToConfigFile } from '../config.js';
import type { AccountConfig, ServerContext } from '../types.js';
import { CREDENTIAL_FIELDS, accountEnvironment } from '../types.js';
import { FormError } from './session.js';
import type { SessionHandlers, SessionView, SetupPage, WriteAction, WriteOutcome } from './session.js';

// What the account pages DO once session.ts has let a request through: describe an exchange's
// credentials, test a connection, save / replace / remove an account, change its permissions,
// and apply each change to the running server (streams, cached clients, confirm tokens, tool
// tiers). It depends on the security core for the FormError type and the handler contract
// only; the core never imports this file.

export const DEFAULT_TEST_TIMEOUT_MS = 20000;

export interface AccountDeps {
    now: () => number;
    testTimeoutMs: number;
}

// what the server could do about tool tiers a saved account newly enables (see tools/setup.ts)
export interface TierListing {
    added: string[];
    restartNeeded: boolean;
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

function firstHttpsUrl (value: any): string | undefined {
    const candidates = Array.isArray (value) ? value : [ value ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && /^https:\/\/[^\s"'<>]+$/.test (candidate)) {
            return candidate;
        }
    }
    return undefined;
}

export class AccountActions implements SessionHandlers {
    // set by tools/setup.ts (through SetupServer): lists the tool tiers a saved account newly enables
    listTiers: ((account: AccountConfig) => TierListing) | undefined = undefined;
    private ctx: ServerContext;
    // the SetupServer's own deps object, read at call time: a test that swaps its clock or
    // its timeout after construction is seen here too
    private deps: AccountDeps;

    constructor (ctx: ServerContext, deps: AccountDeps) {
        this.ctx = ctx;
        this.deps = deps;
    }

    // where a save lands: the file this server loaded, else the one the next start would load
    configPath (): string {
        return this.ctx.config.configPath ?? resolveConfigPath ().path;
    }

    read (action: 'credentials' | 'accounts', query: URLSearchParams): Record<string, any> {
        if (action === 'credentials') {
            return this.describeExchange (query.get ('exchange') ?? '', query.get ('prediction') === '1');
        }
        return { 'ok': true, ...this.accountList () };
    }

    async write (action: WriteAction, body: any, page: SetupPage, afterResponse: (() => void)[]): Promise<WriteOutcome> {
        // The credential values this request puts to use are registered with the redactor by
        // baseAccount, before anything is tested or logged. `provisional` collects the ones
        // this request added: unless it ends in a save they are taken back at the very end,
        // after the response and every log line about it went through the redactor.
        const provisional: string[] = [];
        // the credential values of an account this request removed: they stay redactable
        // until the response and every log line about it are out, then the server forgets them
        const forget: string[] = [];
        let saved = false;
        afterResponse.push (() => {
            if (!saved) {
                for (const value of provisional) {
                    unregisterSecret (value);
                }
            }
            for (const value of forget) {
                unregisterSecret (value);
            }
        });
        if (action === 'test') {
            return { 'body': await this.runTest (body, provisional) };
        }
        if (action === 'save') {
            const result = await this.runSave (body, page, provisional);
            saved = true;
            // a setup session is single use, an accounts session goes on (see session.ts)
            return { 'body': result, 'endSession': page !== 'accounts' };
        }
        if (action === 'remove') {
            return { 'body': this.runRemove (body, forget) };
        }
        return { 'body': this.runPermissions (body) };
    }

    // The step-by-step form. `replaceName` (accounts sessions only) names a file account whose
    // key is being replaced: the form then opens prefilled with what is known about it —
    // never a credential — and saves over it.
    wizardBoot (view: SessionView, replaceName: string | undefined): Record<string, any> {
        const directory = this.ctx.pools.directory ();
        const prefill = view.prefill;
        const boot: Record<string, any> = {
            'csrf': view.csrf,
            'exchanges': directory.allExchangeIds (),
            'prefill': {
                'exchange': (prefill.exchange !== undefined && directory.isKnownExchange (prefill.exchange)) ? prefill.exchange : '',
                'account': isValidAccountName (prefill.account) ? prefill.account : '',
                'environment': (prefill.sandbox === false) ? 'live' : 'sandbox',
            },
            'configPath': this.configPath (),
            // false on Windows when the file is outside the user's profile: the form then
            // does not promise that nobody else can read it
            'configPrivate': configFileIsPrivate (this.configPath ()),
            'expiresInMs': view.expiresInMs,
            // 'accounts': the form was reached from the accounts page and goes back to it
            'page': view.page,
        };
        if (view.page === 'accounts') {
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
        return boot;
    }

    accountsBoot (view: SessionView): Record<string, any> {
        return {
            'csrf': view.csrf,
            'configPath': this.configPath (),
            'expiresInMs': view.expiresInMs,
            ...this.accountList (),
        };
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

    private async runSave (body: any, page: SetupPage, provisional: string[]): Promise<Record<string, any>> {
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
        // a preview issued for the record this name stood for a moment ago confirms nothing
        // about the new one
        this.ctx.safety.invalidateAccountTokens (input.name);
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
        const manage = page === 'accounts';
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
            this.ctx.safety.invalidateAccountTokens (name);
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
        // previews were shown under the old permissions (another cap, or trading since
        // switched off): they have to be asked for again
        this.ctx.safety.invalidateAccountTokens (name);
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
