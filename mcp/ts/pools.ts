import { Agent } from 'https';
import { log } from './logging.js';
import { registerSecret, redact } from './redact.js';
import { ensureMarketsLoaded } from './markets.js';
import { unescapePem } from './config.js';
import type { AccountConfig, ResolvedConfig } from './types.js';
import { CREDENTIAL_FIELDS } from './types.js';

const PUBLIC_POOL_MAX = 32;
const DEFAULT_TIMEOUT = 30000;

const httpsAgent = new Agent ({
    'ecdhCurve': 'auto',
    'keepAlive': true,
});

export interface PoolsDeps {
    exchangeClass: (exchangeId: string, prediction?: boolean) => any;
    isKnownExchange: (exchangeId: string) => boolean;
    allExchangeIds: () => string[];
    closestMatches: (needle: string, haystack: string[], count?: number) => string[];
}

export class UnknownExchangeError extends Error {
    suggestions: string[];
    constructor (exchangeId: string, suggestions: string[]) {
        super ('unknown exchange id ' + JSON.stringify (exchangeId));
        this.suggestions = suggestions;
    }
}

export class UnknownAccountError extends Error {
    constructor (account: string, known: string[]) {
        super ('unknown account ' + JSON.stringify (account) + (known.length ? ' — configured accounts: ' + known.join (', ') : ' — no accounts are configured; add one to the ccxt-mcp config file'));
    }
}

// The only module that ever touches credential values. Tool handlers receive Exchange
// instances; account records never leave this file except as summaries built in types.ts.
export class ExchangePools {
    private publicPool = new Map<string, any> ();
    private authPool = new Map<string, any> ();
    private config: ResolvedConfig;
    private deps: PoolsDeps;

    constructor (config: ResolvedConfig, deps: PoolsDeps) {
        this.config = config;
        this.deps = deps;
    }

    private hardenInstance (exchange: any): any {
        // verbose mode prints full signed request headers, and Exchange.log defaults to
        // console.log (stdout) — both are unconditionally overridden, never configurable
        exchange.verbose = false;
        exchange.log = (...args: any[]) => {
            log ('debug', 'exchange:' + exchange.id + ' ' + redact (args.map ((arg) => String (arg)).join (' ')));
        };
        return exchange;
    }

    private constructorConfig (extra: Record<string, any>): Record<string, any> {
        return {
            'timeout': DEFAULT_TIMEOUT,
            httpsAgent,
            'enableRateLimit': true,
            ...extra,
        };
    }

    async getPublic (exchangeId: string, marketType?: string, prediction = false): Promise<any> {
        if (!this.deps.isKnownExchange (exchangeId)) {
            throw new UnknownExchangeError (exchangeId, this.deps.closestMatches (exchangeId, this.deps.allExchangeIds ()));
        }
        const key = exchangeId + '|' + (marketType ?? 'default') + '|' + (prediction ? 'p' : 'c');
        let exchange = this.publicPool.get (key);
        if (exchange === undefined) {
            const cls = this.deps.exchangeClass (exchangeId, prediction);
            const exchangeOptions = this.config.settings.exchangeOptions[exchangeId];
            exchange = new cls (this.constructorConfig (exchangeOptions ? { 'options': { ...exchangeOptions } } : {}));
            this.hardenInstance (exchange);
            if (marketType !== undefined) {
                exchange.options['defaultType'] = marketType;
            }
            this.evictIfNeeded ();
            this.publicPool.set (key, exchange);
        } else {
            // keep LRU order fresh
            this.publicPool.delete (key);
            this.publicPool.set (key, exchange);
        }
        await ensureMarketsLoaded (exchange, this.config.settings.refreshMarketsTimeout);
        return exchange;
    }

    private evictIfNeeded (): void {
        while (this.publicPool.size >= PUBLIC_POOL_MAX) {
            const oldestKey = this.publicPool.keys ().next ().value as string;
            const oldest = this.publicPool.get (oldestKey);
            this.publicPool.delete (oldestKey);
            closeQuietly (oldest);
        }
    }

    private bareCache = new Map<string, any> ();

    // metadata-only instance: describe() fields (has, urls, timeframes, requiredCredentials)
    // without any network use — never load markets on these
    getBare (exchangeId: string, prediction = false): any {
        if (!this.deps.isKnownExchange (exchangeId)) {
            throw new UnknownExchangeError (exchangeId, this.deps.closestMatches (exchangeId, this.deps.allExchangeIds ()));
        }
        const key = exchangeId + '|' + (prediction ? 'p' : 'c');
        let exchange = this.bareCache.get (key);
        if (exchange === undefined) {
            const cls = this.deps.exchangeClass (exchangeId, prediction);
            exchange = this.hardenInstance (new cls ());
            this.bareCache.set (key, exchange);
        }
        return exchange;
    }

    account (name: string): AccountConfig {
        const account = this.config.accounts[name];
        if (account === undefined) {
            throw new UnknownAccountError (name, Object.keys (this.config.accounts));
        }
        return account;
    }

    async getAuthenticated (accountName: string): Promise<{ exchange: any, account: AccountConfig }> {
        const account = this.account (accountName);
        let exchange = this.authPool.get (accountName);
        if (exchange === undefined) {
            exchange = this.buildAuthenticated (account);
            this.authPool.set (accountName, exchange);
        }
        await ensureMarketsLoaded (exchange, this.config.settings.refreshMarketsTimeout);
        return { exchange, account };
    }

    private buildAuthenticated (account: AccountConfig): any {
        const cls = this.deps.exchangeClass (account.exchange, account.prediction);
        const credentials: Record<string, any> = {};
        for (const field of CREDENTIAL_FIELDS) {
            const value = (account as any)[field];
            if (value !== undefined) {
                credentials[field] = value;
            }
        }
        // env fill, CLI parity: <EXCHANGEID>_<CREDENTIAL> completes credentials the config
        // left out, without ever overriding configured values
        const probe = new cls ();
        for (const [ credential, isRequired ] of Object.entries (probe.requiredCredentials ?? {})) {
            if (isRequired && credentials[credential] === undefined) {
                const envName = (account.exchange + '_' + credential).toUpperCase ();
                const value = process.env[envName];
                if (value) {
                    credentials[credential] = unescapePem (value);
                    registerSecret (credentials[credential], credential);
                }
            }
        }
        const globalOptions = this.config.settings.exchangeOptions[account.exchange];
        const options = { ...(globalOptions ?? {}), ...(account.options ?? {}) };
        const extra: Record<string, any> = { ...credentials };
        if (Object.keys (options).length > 0) {
            extra['options'] = options;
        }
        if (account.timeout !== undefined) {
            extra['timeout'] = account.timeout;
        }
        if (account.rateLimit !== undefined) {
            extra['rateLimit'] = account.rateLimit;
        }
        const exchange = new cls (this.constructorConfig (extra));
        this.hardenInstance (exchange);
        if (account.defaultType !== undefined) {
            exchange.options['defaultType'] = account.defaultType;
        }
        if (account.sandbox) {
            // throws NotSupported when the exchange has no urls.test — that is the correct
            // loud failure; silently falling back to live would defeat the flag's purpose
            exchange.setSandboxMode (true);
        } else if (account.demo) {
            exchange.enableDemoTrading (true);
        }
        return exchange;
    }

    // fire-and-forget markets prewarm for configured accounts (never blocks startup)
    prewarm (): void {
        for (const name of Object.keys (this.config.accounts)) {
            this.getAuthenticated (name).catch ((e: any) => {
                log ('warning', 'prewarm failed for account ' + name + ': ' + redact (String (e?.message ?? e)));
            });
        }
    }

    async closeAll (): Promise<void> {
        const instances = [ ...this.publicPool.values (), ...this.authPool.values () ];
        this.publicPool.clear ();
        this.authPool.clear ();
        await Promise.race ([
            Promise.allSettled (instances.map ((exchange) => closeQuietly (exchange))),
            new Promise ((resolve) => setTimeout (resolve, 5000)),
        ]);
    }
}

async function closeQuietly (exchange: any): Promise<void> {
    try {
        if (exchange && typeof exchange.close === 'function') {
            await exchange.close ();
        }
    } catch (e) {
        // shutdown path — nothing useful to do
    }
}
