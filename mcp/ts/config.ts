import fs from 'fs';
import os from 'os';
import path from 'path';
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

// Actionable guidance an error can hand back so the AI can walk the user through configuring
// credentials — points at the real config path and shows the exact shape. Credentials are
// never entered in chat; they only ever live in this file.
export function credentialSetupHelp (loadedPath?: string): string {
    const configPath = (loadedPath !== undefined && loadedPath !== '') ? loadedPath : defaultConfigPath ();
    return 'To fix: tell the user to add an account to the ccxt-mcp config file at "' + configPath
        + '" — e.g. {"accounts":{"binance":{"exchange":"binance","apiKey":"...","secret":"...","sandbox":true,"trading":true}}} — then restart the server. '
        + 'Use the exchange id and its required credentials (describe_exchange shows requiredCredentials). API keys go ONLY in that file, never in this chat. '
        + 'Call get_safety_status to see the exact path and which accounts and tiers are active.';
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

function validateAccount (name: string, raw: any, problems: string[]): AccountConfig | undefined {
    const parsed = accountSchema.safeParse (raw);
    if (!parsed.success) {
        problems.push ('account ' + JSON.stringify (name) + ' invalid: ' + parsed.error.issues.map ((issue) => issue.path.join ('.') + ' ' + issue.message).join ('; '));
        return undefined;
    }
    const account = { ...parsed.data, name } as AccountConfig;
    if (!isKnownExchange (account.exchange)) {
        problems.push ('account ' + JSON.stringify (name) + ': unknown exchange ' + JSON.stringify (account.exchange) + ' — closest matches: ' + closestMatches (account.exchange, allExchangeIds ()).join (', '));
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

function registerAccountSecrets (account: AccountConfig): void {
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

function envAccountRaw (suffix: string): any | undefined {
    const exchange = process.env['CCXT_MCP_EXCHANGE' + suffix];
    // unset, empty, or an unsubstituted MCPB template ("${...}") all mean "slot not configured"
    if (!exchange || exchange.includes ('${')) {
        return undefined;
    }
    const raw: any = { exchange };
    for (const [ envKey, field ] of Object.entries (ENV_CREDENTIAL_MAP)) {
        const value = process.env['CCXT_MCP_' + envKey + suffix];
        if (value !== undefined && value !== '') {
            raw[field] = unescapePem (value);
        }
    }
    // Safe toggles (sandbox/demo/prediction, and the sandbox trading switch) may fall back to
    // the unsuffixed global — that's the single toggle the .mcpb form drives across every slot.
    // Empty string counts as unset, so an unfilled optional form field can't override the global.
    const flag = (name: string): string | undefined => {
        const per = process.env['CCXT_MCP_' + name + suffix];
        return (per !== undefined && per !== '') ? per : process.env['CCXT_MCP_' + name];
    };
    // Live trading and its USD cap are real money and must be scoped PER SLOT: a global
    // CCXT_MCP_TRADING=live / MAX_ORDER_VALUE must never arm an EXTRA exchange the user added
    // only to read. For slot 1 the suffix is '' so perSlot IS the global (backwards compatible).
    const perSlot = (name: string): string | undefined => {
        const v = process.env['CCXT_MCP_' + name + suffix];
        return (v !== undefined && v !== '') ? v : undefined;
    };
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

export function loadConfig (): ResolvedConfig {
    const problems: string[] = [];
    const accounts: Record<string, AccountConfig> = {};
    let settingsRaw: any = {};

    // an unset MCPB file field can arrive as "" or an unsubstituted "${...}" template —
    // treat those as "no explicit path" and fall back to the default location
    const rawExplicit = process.env['CCXT_MCP_CONFIG'];
    const explicitPath = (rawExplicit !== undefined && rawExplicit.trim () !== '' && !rawExplicit.includes ('${')) ? rawExplicit : undefined;
    const configPath = explicitPath || defaultConfigPath ();
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
        if (accounts[envAccount.name] === undefined) {
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
        'loadEnvKeys': (validSettings.loadEnvKeys ?? false) || (process.env['CCXT_MCP_LOAD_ENV_KEYS'] === 'true'),
    };

    for (const problem of problems) {
        log ('warning', 'config: ' + problem);
    }

    return { accounts, settings, problems, 'configPath': configPathUsed };
}
