import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { log } from './logging.js';
import { registerSecret } from './redact.js';
import { isKnownExchange, predictionExchanges, allExchangeIds, closestMatches } from './ccxt-loader.js';
import type { AccountConfig, ResolvedConfig, ServerSettings } from './types.js';
import { CREDENTIAL_FIELDS } from './types.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const tierFlagSchema = z.union ([ z.boolean (), z.literal ('live') ]);

const accountSchema = z.object ({
    'exchange': z.string (),
    'prediction': z.boolean ().optional (),
    'apiKey': z.string ().optional (),
    'secret': z.string ().optional (),
    'password': z.string ().optional (),
    'uid': z.string ().optional (),
    'login': z.string ().optional (),
    'token': z.string ().optional (),
    'twofa': z.string ().optional (),
    'walletAddress': z.string ().optional (),
    'privateKey': z.string ().optional (),
    'sandbox': z.boolean ().optional (),
    'demo': z.boolean ().optional (),
    'trading': tierFlagSchema.optional (),
    'funds': tierFlagSchema.optional (),
    'implicitWrites': z.boolean ().optional (),
    'dryRun': z.boolean ().optional (),
    'maxOrderValue': z.number ().positive ().nullable ().optional (),
    'maxTransferValue': z.number ().positive ().nullable ().optional (),
    'maxDailyValue': z.number ().positive ().nullable ().optional (),
    'allowedSymbols': z.array (z.string ()).optional (),
    'deniedSymbols': z.array (z.string ()).optional (),
    'confirm': z.enum ([ 'always', 'live', 'never' ]).optional (),
    'defaultType': z.string ().optional (),
    'options': z.record (z.any ()).optional (),
    'timeout': z.number ().positive ().optional (),
    'rateLimit': z.number ().positive ().optional (),
}).passthrough ();

const settingsSchema = z.object ({
    'refreshMarketsTimeout': z.number ().positive ().optional (),
    'maxResults': z.number ().positive ().optional (),
    'strictPermissions': z.boolean ().optional (),
    'maxSubscriptions': z.number ().int ().nonnegative ().optional (), // 0 = unlimited (the default sentinel)
    'exchangeOptions': z.record (z.record (z.any ())).optional (),
    // by default every tool (incl. trading/funds) is listed and a disabled tier errors at
    // call time; set true to hide disabled tiers from tools/list (a leaner, deliberately
    // read-only deployment) — execution is gated by the account either way
    'hideDisabledTools': z.boolean ().optional (),
    // tool profile: "all" (default), "core" (the set sized for hosts that cap tool
    // definitions) or tool names, as a comma-separated string or an array — CCXT_MCP_TOOLS wins
    'tools': z.union ([ z.string (), z.array (z.string ()) ]).optional (),
    // opt-in: auto-register accounts from <EXCHANGEID>_<CREDENTIAL> env vars (ccxt --loadKeys parity)
    'loadEnvKeys': z.boolean ().optional (),
}).passthrough ();

export function defaultConfigPath (): string {
    const home = os.homedir ();
    if (process.platform === 'win32') {
        return path.join (process.env['APPDATA'] || path.join (home, 'AppData', 'Roaming'), 'ccxt-mcp', 'config.json');
    }
    if (process.platform === 'darwin') {
        return path.join (home, 'Library', 'Application Support', 'ccxt-mcp', 'config.json');
    }
    return path.join (process.env['XDG_CONFIG_HOME'] || path.join (home, '.config'), 'ccxt-mcp', 'config.json');
}

// Whether the config file at `configPath` can be said to be readable by this user only.
// Everywhere but Windows the writer creates it with mode 0600, and that is the answer.
// Windows has no mode bits: a new file takes the access list of its folder. Inside the user's
// own profile (where the default location is) that list admits this user, the system and
// administrators; anywhere else — a path the user chose with CCXT_MCP_CONFIG — it is whatever
// that folder has, which this server cannot vouch for. The setup form words its promise
// accordingly.
export function configFileIsPrivate (configPath: string, platform: string = process.platform, home: string = os.homedir ()): boolean {
    if (platform !== 'win32') {
        return true;
    }
    const relative = path.win32.relative (path.win32.resolve (home), path.win32.resolve (configPath));
    return relative !== '' && !relative.startsWith ('..') && !path.win32.isAbsolute (relative);
}

// The one place the config-file location is decided, shared by loadConfig and the setup form's
// writer so an account saved from the form lands in the file the next start reads.
// An unset MCPB file field can arrive as "" or an unsubstituted "${...}" template — those
// count as "no explicit path" and fall back to the default location.
export function resolveConfigPath (): { path: string, explicit: boolean } {
    const rawExplicit = process.env['CCXT_MCP_CONFIG'];
    const explicitPath = (rawExplicit !== undefined && rawExplicit.trim () !== '' && !rawExplicit.includes ('${')) ? rawExplicit : undefined;
    return { 'path': explicitPath || defaultConfigPath (), 'explicit': explicitPath !== undefined };
}

// Actionable guidance an error can hand back so the AI can walk the user through configuring
// credentials. The setup form comes first (a local browser page, no file editing); the config
// file is the alternative and shows the exact shape. Credentials are never entered in chat.
export function credentialSetupHelp (loadedPath?: string): string {
    const configPath = (loadedPath !== undefined && loadedPath !== '') ? loadedPath : resolveConfigPath ().path;
    return 'To fix: call setup_account — it opens a local setup form in the user\'s browser where they type the exchange API key themselves; the account is usable as soon as they save it (no restart). '
        + 'Alternative: the user adds the account to the ccxt-mcp config file at "' + configPath
        + '" — e.g. {"accounts":{"binance":{"exchange":"binance","apiKey":"...","secret":"...","sandbox":true,"trading":true}}} — then restarts the server (describe_exchange shows an exchange\'s requiredCredentials). '
        + 'API keys go ONLY in that form or that config file, never in this chat — do not ask the user to paste them here. '
        + 'Call get_safety_status to see which accounts and tiers are active.';
}

export function cacheDirectory (): string {
    const home = os.homedir ();
    let cachePath: string;
    if (process.platform === 'win32') {
        cachePath = path.join (process.env['LOCALAPPDATA'] || path.join (home, 'AppData', 'Local'), 'ccxt-mcp', 'cache');
    } else if (process.platform === 'darwin') {
        cachePath = path.join (home, 'Library', 'Caches', 'ccxt-mcp');
    } else {
        cachePath = path.join (process.env['XDG_CACHE_HOME'] || path.join (home, '.cache'), 'ccxt-mcp');
    }
    fs.mkdirSync (cachePath, { 'recursive': true });
    return cachePath;
}

function checkFilePermissions (filePath: string, strict: boolean, problems: string[]): boolean {
    if (process.platform === 'win32') {
        return true;
    }
    try {
        const stats = fs.statSync (filePath);
        if ((stats.mode & 0o077) !== 0) {
            const message = 'config file ' + filePath + ' is readable by other users — run: chmod 600 ' + JSON.stringify (filePath);
            if (strict) {
                problems.push ('REFUSED (strictPermissions): ' + message);
                return false;
            }
            problems.push ('WARNING: ' + message);
            log ('warning', message);
        }
    } catch (e) {
        // stat failures are handled by the read that follows
    }
    return true;
}

// accepts both config shapes:
//   { "accounts": { "<name>": { "exchange": ..., ... } }, "settings": { ... } }
//   { "<exchangeId>": { "apiKey": ..., ... } }   (legacy keys.json / ccxt-cli shape)
function parseConfigObject (raw: any, problems: string[]): { accounts: Record<string, any>, settings: any } {
    if (raw === null || typeof raw !== 'object' || Array.isArray (raw)) {
        problems.push ('config root must be a JSON object');
        return { 'accounts': {}, 'settings': {} };
    }
    if (raw['accounts'] !== undefined) {
        return { 'accounts': raw['accounts'], 'settings': raw['settings'] ?? {} };
    }
    // legacy shape: every top-level key that looks like an exchange id becomes an account
    const accounts: Record<string, any> = {};
    for (const [ key, value ] of Object.entries (raw)) {
        if (value === null || typeof value !== 'object') {
            continue;
        }
        if (isKnownExchange (key)) {
            accounts[key] = { 'exchange': key, ...(value as object) };
        } else if (key !== 'settings') {
            problems.push ('ignored unknown top-level key ' + JSON.stringify (key) + ' (not an exchange id; use the {"accounts": {...}} shape for named accounts)');
        }
    }
    // preserve a "settings" block even in the legacy shape, so a settings-only config
    // (e.g. {"settings":{"loadEnvKeys":true}}) isn't silently dropped
    return { accounts, 'settings': raw['settings'] ?? {} };
}

// what validateAccount needs to know about the exchange catalogue — the loader by default; the
// setup form passes the pools' own directory so an account is checked against the same ccxt
// the server instantiates it from
export interface ExchangeDirectory {
    isKnownExchange: (exchangeId: string) => boolean;
    allExchangeIds: () => string[];
    closestMatches: (needle: string, haystack: string[], count?: number) => string[];
}

const loaderDirectory: ExchangeDirectory = { isKnownExchange, allExchangeIds, closestMatches };

export function validateAccount (name: string, raw: any, problems: string[], directory: ExchangeDirectory = loaderDirectory): AccountConfig | undefined {
    const parsed = accountSchema.safeParse (raw);
    if (!parsed.success) {
        problems.push ('account ' + JSON.stringify (name) + ' invalid: ' + parsed.error.issues.map ((issue) => issue.path.join ('.') + ' ' + issue.message).join ('; '));
        return undefined;
    }
    const account = { ...parsed.data, name } as AccountConfig;
    if (!directory.isKnownExchange (account.exchange)) {
        problems.push ('account ' + JSON.stringify (name) + ': unknown exchange ' + JSON.stringify (account.exchange) + ' — closest matches: ' + directory.closestMatches (account.exchange, directory.allExchangeIds ()).join (', '));
        return undefined;
    }
    if (account.prediction && !predictionExchanges ().includes (account.exchange)) {
        problems.push ('account ' + JSON.stringify (name) + ': "prediction": true but ' + account.exchange + ' has no prediction-markets variant');
        return undefined;
    }
    if (account.sandbox && account.demo) {
        problems.push ('account ' + JSON.stringify (name) + ': "sandbox" and "demo" are mutually exclusive (demo trading runs against the LIVE host with demo-portal keys)');
        return undefined;
    }
    const isLiveEnvironment = !account.sandbox && !account.demo;
    if (account.trading === true && isLiveEnvironment) {
        problems.push ('account ' + JSON.stringify (name) + ': "trading": true only enables SANDBOX/DEMO trading, but this account is live — set "trading": "live" to explicitly enable live trading (and author a "maxOrderValue" cap), or add "sandbox": true');
        account.trading = false;
    }
    if (account.trading === 'live' && account.maxOrderValue === undefined) {
        problems.push ('account ' + JSON.stringify (name) + ': "trading": "live" requires a "maxOrderValue" (per-order notional cap in USD) — set a number, or explicitly null to opt out of the cap');
        account.trading = false;
    }
    if (account.funds === true && isLiveEnvironment) {
        problems.push ('account ' + JSON.stringify (name) + ': "funds": true only enables SANDBOX/DEMO fund moves, but this account is live — set "funds": "live" explicitly (and author a "maxTransferValue" cap)');
        account.funds = false;
    }
    if (account.funds === 'live' && account.maxTransferValue === undefined) {
        problems.push ('account ' + JSON.stringify (name) + ': "funds": "live" requires a "maxTransferValue" (per-transfer value cap in USD) — set a number, or explicitly null to opt out of the cap');
        account.funds = false;
    }
    return account;
}

export function registerAccountSecrets (account: AccountConfig): void {
    for (const field of CREDENTIAL_FIELDS) {
        registerSecret ((account as any)[field], field);
    }
}

// The CCXT_MCP_* env set defines accounts without a config file — how the .mcpb bundle
// injects keychain values and the quickest setup. Slot 1 uses the unsuffixed names (account
// "default"); further exchanges use a _<n> suffix (CCXT_MCP_EXCHANGE_2, CCXT_MCP_APIKEY_2, …),
// which is how the .mcpb form exposes several exchanges at once. Mode flags
// (sandbox/demo/trading/prediction/cap) fall back to the unsuffixed value, so one global
// toggle in the form applies to every slot.
const ENV_CREDENTIAL_MAP: Record<string, string> = {
    'APIKEY': 'apiKey',
    'API_KEY': 'apiKey',
    'SECRET': 'secret',
    'PASSWORD': 'password',
    'UID': 'uid',
    'WALLETADDRESS': 'walletAddress',
    'PRIVATEKEY': 'privateKey',
};
const MAX_ENV_ACCOUNT_SLOTS = 10;
// a whole value that is one unsubstituted host template, e.g. "${user_config.password}"
const UNSUBSTITUTED_TEMPLATE = /^\s*\$\{[^}]*\}\s*$/;

function envAccountRaw (suffix: string): any | undefined {
    const exchange = process.env['CCXT_MCP_EXCHANGE' + suffix];
    // unset, empty, or an unsubstituted MCPB template ("${...}") all mean "slot not configured"
    if (!exchange || exchange.includes ('${')) {
        return undefined;
    }
    const raw: any = { exchange };
    // Plugin hosts (.mcpb, Claude Code / Codex / Grok plugins) substitute ${user_config.X}
    // templates into env, and an UNSET optional field can arrive as the literal template
    // string. Like the exchange slot above, such a value counts as unset everywhere below —
    // it must never become a "credential" or a mode flag.
    // Only a value that IS a template is discarded, not one that merely contains "${" — an
    // API passphrase is free text and may legitimately hold those two characters.
    const envValue = (key: string): string | undefined => {
        const value = process.env[key];
        return (value !== undefined && value !== '' && !UNSUBSTITUTED_TEMPLATE.test (value)) ? value : undefined;
    };
    for (const [ envKey, field ] of Object.entries (ENV_CREDENTIAL_MAP)) {
        const value = envValue ('CCXT_MCP_' + envKey + suffix);
        if (value !== undefined) {
            raw[field] = unescapePem (value);
        }
    }
    // Safe toggles (sandbox/demo/prediction, and the sandbox trading switch) may fall back to
    // the unsuffixed global — that's the single toggle the .mcpb form drives across every slot.
    // Empty string (or an unsubstituted template) counts as unset, so an unfilled optional
    // form field can't override the global.
    const flag = (name: string): string | undefined => envValue ('CCXT_MCP_' + name + suffix) ?? envValue ('CCXT_MCP_' + name);
    // Live trading and its USD cap are real money and must be scoped PER SLOT: a global
    // CCXT_MCP_TRADING=live / MAX_ORDER_VALUE must never arm an EXTRA exchange the user added
    // only to read. For slot 1 the suffix is '' so perSlot IS the global (backwards compatible).
    const perSlot = (name: string): string | undefined => envValue ('CCXT_MCP_' + name + suffix);
    if (flag ('SANDBOX') === 'true') {
        raw['sandbox'] = true;
    }
    if (flag ('DEMO') === 'true') {
        raw['demo'] = true;
    }
    if (flag ('PREDICTION') === 'true') {
        raw['prediction'] = true;
    }
    const trading = flag ('TRADING');
    if (trading === 'true' || trading === 'sandbox') {
        raw['trading'] = true;
    } else if (perSlot ('TRADING') === 'live') {
        raw['trading'] = 'live';
    }
    const maxOrderValue = perSlot ('MAX_ORDER_VALUE');
    if (maxOrderValue !== undefined) {
        raw['maxOrderValue'] = (maxOrderValue === 'null') ? null : Number (maxOrderValue);
    }
    return raw;
}

function envAccounts (problems: string[]): AccountConfig[] {
    const out: AccountConfig[] = [];
    const usedNames = new Set<string> ();
    for (let slot = 1; slot <= MAX_ENV_ACCOUNT_SLOTS; slot++) {
        const suffix = (slot === 1) ? '' : ('_' + slot);
        const raw = envAccountRaw (suffix);
        if (raw === undefined) {
            continue;
        }
        // slot 1 stays "default" (backwards compatible); extra slots are named after their
        // exchange id so list_accounts reads clearly, de-duplicated if two slots share one
        let name = (slot === 1) ? 'default' : String (raw.exchange);
        while (usedNames.has (name)) {
            name = name + '_' + slot;
        }
        const account = validateAccount (name, raw, problems);
        if (account !== undefined) {
            usedNames.add (name);
            out.push (account);
        }
    }
    return out;
}

// Opt-in (settings.loadEnvKeys / CCXT_MCP_LOAD_ENV_KEYS), mirroring ccxt's --loadKeys: scan the
// environment for <EXCHANGEID>_APIKEY / _WALLETADDRESS / _PRIVATEKEY (a known exchange id) and
// register an account named after each — buildAuthenticated then fills the credential values from
// those same <EXCHANGEID>_<CREDENTIAL> vars (its long-standing CLI-parity behaviour). The safe
// global toggles (CCXT_MCP_SANDBOX/DEMO/PREDICTION and sandbox trading) apply; LIVE trading is
// deliberately never auto-armed on an env-detected account. Off by default so ambient shell keys
// (e.g. a ccxt test setup) are never silently activated.
const PRIMARY_ENV_CRED_SUFFIXES = [ '_APIKEY', '_API_KEY', '_WALLETADDRESS', '_PRIVATEKEY' ];

function envExchangeAccounts (taken: Set<string>, problems: string[]): AccountConfig[] {
    const exchanges = new Set<string> ();
    for (const key of Object.keys (process.env)) {
        const value = process.env[key];
        if (value === undefined || value === '') {
            continue;
        }
        for (const suffix of PRIMARY_ENV_CRED_SUFFIXES) {
            if (key.endsWith (suffix)) {
                const prefix = key.slice (0, key.length - suffix.length).toLowerCase ();
                if (isKnownExchange (prefix)) {
                    exchanges.add (prefix);
                }
                break;
            }
        }
    }
    const out: AccountConfig[] = [];
    for (const exchange of exchanges) {
        if (taken.has (exchange)) {
            continue;
        }
        const raw: any = { exchange };
        const global = (name: string): string | undefined => process.env['CCXT_MCP_' + name];
        if (global ('SANDBOX') === 'true') {
            raw['sandbox'] = true;
        }
        if (global ('DEMO') === 'true') {
            raw['demo'] = true;
        }
        if (global ('PREDICTION') === 'true') {
            raw['prediction'] = true;
        }
        // sandbox trading only — a live account requires an explicit config-file entry, never an
        // ambient env var, so a global CCXT_MCP_TRADING can't auto-arm live orders on these
        const trading = global ('TRADING');
        if (trading === 'true' || trading === 'sandbox') {
            raw['trading'] = true;
        }
        const account = validateAccount (exchange, raw, problems);
        if (account !== undefined) {
            out.push (account);
        }
    }
    return out;
}

export function unescapePem (value: string): string {
    if (value.indexOf ('---BEGIN') > -1) {
        return value.split ('\\n').join ('\n');
    }
    return value;
}

// Account maps are plain objects keyed by a user-chosen name, so a bare accounts[name] also
// finds Object.prototype members ("toString", "constructor", ...). Every lookup by name goes
// through an own-property check instead.
export function hasOwn (object: any, key: string): boolean {
    return object !== null && object !== undefined && Object.prototype.hasOwnProperty.call (object, key);
}

export function loadConfig (): ResolvedConfig {
    const problems: string[] = [];
    const accounts: Record<string, AccountConfig> = {};
    let settingsRaw: any = {};

    const resolved = resolveConfigPath ();
    const configPath = resolved.path;
    const explicitPath = resolved.explicit ? resolved.path : undefined;
    let configPathUsed: string | undefined = undefined;

    if (fs.existsSync (configPath)) {
        configPathUsed = configPath;
        let raw: any;
        try {
            raw = JSON.parse (fs.readFileSync (configPath).toString ());
        } catch (e: any) {
            problems.push ('failed to parse ' + configPath + ': ' + e.message);
            raw = undefined;
        }
        if (raw !== undefined) {
            const parsed = parseConfigObject (raw, problems);
            settingsRaw = parsed.settings;
            const strict = settingsRaw['strictPermissions'] === true;
            if (checkFilePermissions (configPath, strict, problems)) {
                for (const [ name, accountRaw ] of Object.entries (parsed.accounts)) {
                    if (RESERVED_ACCOUNT_NAMES.includes (name)) {
                        // assigning it below would replace the map's prototype, not add an account
                        problems.push ('account ' + JSON.stringify (name) + ' ignored: that name is reserved — rename it');
                        continue;
                    }
                    const account = validateAccount (name, accountRaw, problems);
                    if (account !== undefined) {
                        accounts[name] = account;
                    }
                }
            }
        }
    } else if (explicitPath) {
        problems.push ('CCXT_MCP_CONFIG points to a missing file: ' + explicitPath);
    }

    // env-var accounts fill in any name a config file didn't already claim (config wins)
    for (const envAccount of envAccounts (problems)) {
        if (!hasOwn (accounts, envAccount.name)) {
            accounts[envAccount.name] = envAccount;
        } else {
            // config wins, but don't drop the env/.mcpb-form account SILENTLY — surface it, and
            // still register its secrets with the redactor so its value can never leak anywhere
            problems.push ('env/.mcpb-form account "' + envAccount.name + '" (' + envAccount.exchange + ') is shadowed by a config-file account of the same name — the config-file account is used; rename one to keep both');
            registerAccountSecrets (envAccount);
        }
    }

    // opt-in (settings.loadEnvKeys / CCXT_MCP_LOAD_ENV_KEYS): mirror ccxt's --loadKeys and
    // auto-register accounts from <EXCHANGEID>_<CREDENTIAL> env vars for names not already claimed
    const loadEnvKeys = (settingsRaw['loadEnvKeys'] === true) || (process.env['CCXT_MCP_LOAD_ENV_KEYS'] === 'true');
    if (loadEnvKeys) {
        for (const envAccount of envExchangeAccounts (new Set (Object.keys (accounts)), problems)) {
            accounts[envAccount.name] = envAccount;
        }
    }

    for (const account of Object.values (accounts)) {
        registerAccountSecrets (account);
    }

    const settingsParsed = settingsSchema.safeParse (settingsRaw);
    const validSettings = settingsParsed.success ? settingsParsed.data : {};
    if (!settingsParsed.success) {
        problems.push ('settings invalid: ' + settingsParsed.error.issues.map ((issue) => issue.path.join ('.') + ' ' + issue.message).join ('; '));
    }
    const settings: ServerSettings = {
        'refreshMarketsTimeout': validSettings.refreshMarketsTimeout ?? DAY_MS,
        'maxResults': validSettings.maxResults ?? 100,
        'strictPermissions': validSettings.strictPermissions ?? false,
        'exchangeOptions': validSettings.exchangeOptions ?? {},
        // 0 = no limit (the default). Streaming is read-only and single-user, and the
        // idle TTL + shared sockets + exchange-side stream limits are the real backstops,
        // so a count cap isn't needed — set a positive value only if you want one.
        'maxSubscriptions': validSettings.maxSubscriptions ?? 0,
        'hideDisabledTools': validSettings.hideDisabledTools ?? false,
        // an empty CCXT_MCP_TOOLS (a host passing a blank form field) is "not set"
        'tools': (process.env['CCXT_MCP_TOOLS'] ?? '').trim () || [ validSettings.tools ?? [] ].flat ().join (',') || 'all',
        'loadEnvKeys': (validSettings.loadEnvKeys ?? false) || (process.env['CCXT_MCP_LOAD_ENV_KEYS'] === 'true'),
    };

    for (const problem of problems) {
        log ('warning', 'config: ' + problem);
    }

    return { accounts, settings, problems, 'configPath': configPathUsed };
}

// ---------------------------------------------------------------------------------------
// Config-file writers (the setup form's save, the accounts page's remove and permission
// edit). Everything above only ever reads the file.

export const ACCOUNT_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,40}$/;
// assigning one of these as an own key would either rewrite the object's prototype or be
// indistinguishable from an inherited member when the file is read back
export const RESERVED_ACCOUNT_NAMES = [ '__proto__', 'constructor', 'prototype' ];

export function isReservedAccountName (name: any): boolean {
    return RESERVED_ACCOUNT_NAMES.includes (name);
}

export function isValidAccountName (name: any): name is string {
    return typeof name === 'string' && ACCOUNT_NAME_PATTERN.test (name) && !RESERVED_ACCOUNT_NAMES.includes (name);
}

export type ConfigWriteErrorCode = 'INVALID_NAME' | 'INVALID_JSON' | 'INVALID_SHAPE' | 'ACCOUNT_EXISTS' | 'LEGACY_NAME' | 'NOT_FOUND' | 'IO_ERROR';

export class ConfigWriteError extends Error {
    code: ConfigWriteErrorCode;
    constructor (code: ConfigWriteErrorCode, message: string) {
        super (message);
        this.code = code;
    }
}

export interface ConfigWriteResult {
    path: string; // the file actually written (a symlinked config resolves to its target)
    shape: 'accounts' | 'legacy';
    created: boolean; // the file did not exist before
    replaced: boolean; // an account of that name was overwritten
}

function isPlainObject (value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray (value);
}

// keep the file looking the way its owner wrote it: reuse its indentation when it has one
function detectIndent (text: string): string | number {
    const match = /^[{[]\r?\n([ \t]+)\S/.exec (text.trimStart ());
    return (match !== null) ? match[1] : 4;
}

interface ConfigFileState {
    target: string; // the real file (a symlinked config resolves to its target)
    exists: boolean;
    root: Record<string, any>;
    indent: string | number;
    shape: 'accounts' | 'legacy';
}

// Reads the config file the way every writer below needs it: parsed, with the shape
// parseConfigObject would read it in. A file that is not valid JSON is refused, never
// overwritten: it may hold keys the user can still recover by fixing a comma.
function readConfigFileState (configPath: string, known: (exchangeId: string) => boolean): ConfigFileState {
    // write through a symlink instead of replacing it with a regular file
    let target = configPath;
    let existing: string | undefined = undefined;
    try {
        target = fs.realpathSync (configPath);
        existing = fs.readFileSync (target).toString ();
    } catch (e: any) {
        if (e?.code !== 'ENOENT') {
            throw new ConfigWriteError ('IO_ERROR', 'could not read the config file: ' + String (e?.code ?? e?.message ?? e));
        }
    }
    let root: Record<string, any> = {};
    let indent: string | number = 4;
    if (existing !== undefined && existing.trim () !== '') {
        let parsed: any;
        try {
            parsed = JSON.parse (existing);
        } catch (e: any) {
            throw new ConfigWriteError ('INVALID_JSON', 'the existing config file is not valid JSON, so it was left untouched — fix or move it first');
        }
        if (!isPlainObject (parsed)) {
            throw new ConfigWriteError ('INVALID_SHAPE', 'the existing config file is not a JSON object, so it was left untouched — fix or move it first');
        }
        root = parsed;
        indent = detectIndent (existing);
    }
    let shape: 'accounts' | 'legacy' = 'accounts';
    if (root['accounts'] !== undefined) {
        if (!isPlainObject (root['accounts'])) {
            throw new ConfigWriteError ('INVALID_SHAPE', 'the "accounts" entry of the existing config file is not an object, so the file was left untouched — fix it first');
        }
    } else if (Object.keys (root).some ((key) => isPlainObject (root[key]) && known (key))) {
        // parseConfigObject reads this file as the legacy shape; adding an "accounts" key
        // would switch it to the other shape and silently drop every account already in it
        shape = 'legacy';
    }
    return { target, 'exists': existing !== undefined, root, indent, shape };
}

// Puts the finished temporary file in the config file's place.
// Windows refuses that for as long as another process has either file open — a virus scanner
// looking at the file that was just written, an editor or a backup tool reading the config
// file — and reports it as EPERM, EACCES or EBUSY. That passes within moments, so the rename
// is tried again for about a second there before the save is reported as failed. Everywhere
// else a rename either works or fails for a reason waiting does not cure.
// `deps` exists for the tests: the rename, the platform and the pause between attempts.
export function renameIntoPlace (from: string, to: string, deps: { rename?: (from: string, to: string) => void, platform?: string, pause?: (ms: number) => void } = {}): void {
    const rename = deps.rename ?? fs.renameSync;
    const platform = deps.platform ?? process.platform;
    const pause = deps.pause ?? ((ms: number) => {
        Atomics.wait (new Int32Array (new SharedArrayBuffer (4)), 0, 0, ms);
    });
    for (let attempt = 0; ; attempt++) {
        try {
            rename (from, to);
            return;
        } catch (e: any) {
            if (platform !== 'win32' || attempt >= 20 || ![ 'EPERM', 'EACCES', 'EBUSY' ].includes (e?.code)) {
                throw e;
            }
            pause (50);
        }
    }
}

function writeConfigFileState (state: ConfigFileState): void {
    const target = state.target;
    const directory = path.dirname (target);
    const temp = path.join (directory, '.' + path.basename (target) + '.' + randomBytes (6).toString ('hex') + '.tmp');
    try {
        // the mode only applies to directories this call creates; an existing one is the user's
        fs.mkdirSync (directory, { 'recursive': true, 'mode': 0o700 });
        // temp file in the same directory + rename: a crash or a full disk mid-write leaves
        // the previous file intact, and readers never see half a file. "wx" refuses to follow
        // a pre-planted path; 0600 from the first byte, so the keys are never world-readable.
        const fd = fs.openSync (temp, 'wx', 0o600);
        try {
            fs.writeSync (fd, JSON.stringify (state.root, null, state.indent) + '\n');
            fs.fsyncSync (fd);
        } finally {
            fs.closeSync (fd);
        }
        renameIntoPlace (temp, target);
    } catch (e: any) {
        try {
            fs.unlinkSync (temp);
        } catch (ee) {
            // nothing was created, or it is already gone
        }
        throw new ConfigWriteError ('IO_ERROR', 'could not write the config file: ' + String (e?.code ?? e?.message ?? e));
    }
}

// the accounts of a parsed file, by name, exactly as parseConfigObject would find them
function fileAccountNames (state: ConfigFileState, known: (exchangeId: string) => boolean): string[] {
    if (state.shape === 'legacy') {
        return Object.keys (state.root).filter ((key) => isPlainObject (state.root[key]) && known (key));
    }
    return Object.keys (state.root['accounts'] ?? {});
}

// Adds (or, with replace, overwrites) ONE account in the config file and leaves everything
// else in it alone: other accounts, the settings block and any key this server does not know.
// Both shapes parseConfigObject reads are written back in their own shape — a legacy
// {"<exchangeId>": {...}} file is never converted, because other tools (ccxt-cli keys.json)
// may read the same file.
// `account` is the account body WITHOUT its name; it must carry "exchange".
export function writeAccountToConfigFile (configPath: string, name: string, account: Record<string, any>, options: { replace?: boolean, isKnownExchange?: (exchangeId: string) => boolean } = {}): ConfigWriteResult {
    if (!isValidAccountName (name)) {
        throw new ConfigWriteError ('INVALID_NAME', 'account name must be 1-40 characters: letters, digits, "-" and "_"');
    }
    const known = options.isKnownExchange ?? isKnownExchange;
    const state = readConfigFileState (configPath, known);
    const root = state.root;
    const shape = state.shape;
    let replaced = false;
    if (shape === 'legacy') {
        if (name !== account['exchange']) {
            throw new ConfigWriteError ('LEGACY_NAME', 'this config file uses the older {"<exchange id>": {...}} layout, where an account is always named after its exchange — use the account name ' + JSON.stringify (String (account['exchange'])) + ', or convert the file to the {"accounts": {...}} layout first');
        }
        replaced = hasOwn (root, name);
    } else {
        replaced = hasOwn (root['accounts'], name);
    }
    if (replaced && options.replace !== true) {
        throw new ConfigWriteError ('ACCOUNT_EXISTS', 'an account named ' + JSON.stringify (name) + ' already exists in the config file');
    }
    if (shape === 'legacy') {
        // the key IS the exchange id in this shape
        const body = { ...account };
        delete body['exchange'];
        root[name] = body;
    } else {
        if (root['accounts'] === undefined) {
            root['accounts'] = {};
        }
        root['accounts'][name] = { ...account };
    }
    writeConfigFileState (state);
    return { 'path': state.target, shape, 'created': !state.exists, replaced };
}

// What the "Your accounts" page needs to tell a file account from one that only exists in
// the environment: the accounts the file holds, by name, each as the body validateAccount
// would be given ("exchange" filled in for the legacy shape). A missing file holds none.
export function readConfigFileAccounts (configPath: string, options: { isKnownExchange?: (exchangeId: string) => boolean } = {}): { path: string, shape: 'accounts' | 'legacy', accounts: Record<string, Record<string, any>> } {
    const known = options.isKnownExchange ?? isKnownExchange;
    const state = readConfigFileState (configPath, known);
    const accounts: Record<string, Record<string, any>> = {};
    for (const name of fileAccountNames (state, known)) {
        const body = (state.shape === 'legacy') ? state.root[name] : state.root['accounts'][name];
        if (!RESERVED_ACCOUNT_NAMES.includes (name) && isPlainObject (body)) {
            accounts[name] = (state.shape === 'legacy') ? { 'exchange': name, ...body } : { ...body };
        }
    }
    return { 'path': state.target, 'shape': state.shape, accounts };
}

// Changes ONE existing account in place, in the file's own shape, leaving every other byte of
// meaning alone. `mutate` is handed a copy of the account body (with "exchange", as above) and
// returns the body to store; whatever it throws aborts the edit before anything is written.
// Returning undefined removes the account. The name is not pattern-checked: a hand-written
// file may hold names the form would not create, and they must still be removable.
export function updateAccountInConfigFile (configPath: string, name: string, mutate: (body: Record<string, any>) => Record<string, any> | undefined, options: { isKnownExchange?: (exchangeId: string) => boolean } = {}): { path: string, shape: 'accounts' | 'legacy', removed: boolean } {
    const known = options.isKnownExchange ?? isKnownExchange;
    const state = readConfigFileState (configPath, known);
    const legacy = state.shape === 'legacy';
    const holder: Record<string, any> = legacy ? state.root : (state.root['accounts'] ?? {});
    if (typeof name !== 'string' || RESERVED_ACCOUNT_NAMES.includes (name) || !fileAccountNames (state, known).includes (name) || !isPlainObject (holder[name])) {
        throw new ConfigWriteError ('NOT_FOUND', 'no account named ' + JSON.stringify (String (name)) + ' in the config file');
    }
    const next = mutate (legacy ? { 'exchange': name, ...holder[name] } : { ...holder[name] });
    if (next === undefined) {
        delete holder[name];
    } else {
        const body = { ...next };
        if (legacy) {
            // the key IS the exchange id in this shape
            delete body['exchange'];
        }
        holder[name] = body;
    }
    writeConfigFileState (state);
    return { 'path': state.target, 'shape': state.shape, 'removed': next === undefined };
}

export function removeAccountFromConfigFile (configPath: string, name: string, options: { isKnownExchange?: (exchangeId: string) => boolean } = {}): { path: string, shape: 'accounts' | 'legacy', removed: boolean } {
    return updateAccountInConfigFile (configPath, name, () => undefined, options);
}
