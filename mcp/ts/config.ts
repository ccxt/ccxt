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
    'exchangeOptions': z.record (z.record (z.any ())).optional (),
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
    return { accounts, 'settings': {} };
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

// the CCXT_MCP_* env set defines one implicit account named "default" — this is how the
// MCPB bundle injects keychain-stored values, and the quickest single-account setup
function envDefaultAccount (problems: string[]): AccountConfig | undefined {
    const exchange = process.env['CCXT_MCP_EXCHANGE'];
    if (!exchange) {
        return undefined;
    }
    const raw: any = { exchange };
    const envCredentialMap: Record<string, string> = {
        'CCXT_MCP_APIKEY': 'apiKey',
        'CCXT_MCP_API_KEY': 'apiKey',
        'CCXT_MCP_SECRET': 'secret',
        'CCXT_MCP_PASSWORD': 'password',
        'CCXT_MCP_UID': 'uid',
        'CCXT_MCP_WALLETADDRESS': 'walletAddress',
        'CCXT_MCP_PRIVATEKEY': 'privateKey',
    };
    for (const [ envName, field ] of Object.entries (envCredentialMap)) {
        const value = process.env[envName];
        if (value !== undefined && value !== '') {
            raw[field] = unescapePem (value);
        }
    }
    if (process.env['CCXT_MCP_SANDBOX'] === 'true') {
        raw['sandbox'] = true;
    }
    if (process.env['CCXT_MCP_DEMO'] === 'true') {
        raw['demo'] = true;
    }
    if (process.env['CCXT_MCP_PREDICTION'] === 'true') {
        raw['prediction'] = true;
    }
    const trading = process.env['CCXT_MCP_TRADING'];
    if (trading === 'true' || trading === 'sandbox') {
        raw['trading'] = true;
    } else if (trading === 'live') {
        raw['trading'] = 'live';
    }
    const maxOrderValue = process.env['CCXT_MCP_MAX_ORDER_VALUE'];
    if (maxOrderValue !== undefined && maxOrderValue !== '') {
        raw['maxOrderValue'] = (maxOrderValue === 'null') ? null : Number (maxOrderValue);
    }
    return validateAccount ('default', raw, problems);
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

    if (accounts['default'] === undefined) {
        const envAccount = envDefaultAccount (problems);
        if (envAccount !== undefined) {
            accounts['default'] = envAccount;
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
    };

    for (const problem of problems) {
        log ('warning', 'config: ' + problem);
    }

    return { accounts, settings, problems, 'configPath': configPathUsed };
}
