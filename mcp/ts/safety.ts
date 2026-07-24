import crypto from 'crypto';
import type { AccountConfig } from './types.js';
import { accountEnvironment } from './types.js';
import type { Journal } from './journal.js';

const CONFIRM_TOKEN_TTL_MS = 60 * 1000;

// USD-pegged quotes valued 1:1; anything else is valued through a <QUOTE>/<stable> ticker
const USD_QUOTES = new Set ([ 'USD', 'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'FDUSD', 'USDD', 'PYUSD', 'USDE' ]);

export class SafetyError extends Error {
    code: string;
    hint: string;
    constructor (code: string, message: string, hint = '') {
        super (message);
        this.code = code;
        this.hint = hint;
    }
}

const CONFIG_HINT = 'The user must edit the ccxt-mcp config file to change this. This cannot be enabled from the conversation.';

const TIER_HINT = 'call get_safety_status to see which tiers are enabled; enabling one requires editing the config file, which no tool can do';

export function requireTier (account: AccountConfig, tier: 'trading' | 'funds'): void {
    const flag = account[tier] ?? false;
    if (flag === false) {
        throw new SafetyError ('TIER_DISABLED', capitalized (tier) + ' is not enabled for account ' + JSON.stringify (account.name) + '. ' + CONFIG_HINT, TIER_HINT);
    }
    const environment = accountEnvironment (account);
    if (flag === true && environment === 'live') {
        // config.ts already downgrades this combination, but the execution point re-checks
        throw new SafetyError ('TIER_DISABLED', capitalized (tier) + ' on account ' + JSON.stringify (account.name) + ' is enabled for sandbox/demo only, and this account is live. ' + CONFIG_HINT, 'set "' + tier + '": "live" in the config file to allow live ' + tier);
    }
}

export function requireImplicitWrites (account: AccountConfig): void {
    if (!account.implicitWrites) {
        throw new SafetyError ('TIER_DISABLED', 'Raw write endpoints are not enabled for account ' + JSON.stringify (account.name) + ' ("implicitWrites": true). ' + CONFIG_HINT, TIER_HINT);
    }
}

function capitalized (word: string): string {
    return word[0].toUpperCase () + word.slice (1);
}

function symbolMatches (pattern: string, symbol: string, base: string | undefined, quote: string | undefined): boolean {
    if (pattern === symbol) {
        return true;
    }
    if (pattern.includes ('*')) {
        const [ patternBase, patternQuote ] = pattern.split ('/');
        const symbolBase = base ?? symbol.split ('/')[0];
        const symbolQuote = quote ?? (symbol.split ('/')[1] ?? '').split (':')[0];
        const baseOk = (patternBase === '*') || (patternBase === symbolBase);
        const quoteOk = (patternQuote === undefined) || (patternQuote === '*') || (patternQuote.split (':')[0] === symbolQuote);
        return baseOk && quoteOk;
    }
    return false;
}

export interface OrderIntent {
    tool: string;
    symbol: string;
    type: string;
    side: string;
    amount: number;
    price?: number;
    params: Record<string, any>;
}

export interface GuardResult {
    amount: number;
    price: number | undefined;
    orderValue: number | undefined;
    orderValueCurrency: string;
    priceEstimated: boolean;
    valuationNote?: string;
    marketValidated: boolean;
}

export class Safety {
    private journal: Journal;
    private tokenSecret = crypto.randomBytes (32);
    private tokens = new Map<string, { digest: string, expiresAt: number }> ();
    private accountLocks = new Map<string, Promise<void>> ();

    constructor (journal: Journal) {
        this.journal = journal;
    }

    // serializes the check -> confirm -> dispatch critical section per account so parallel
    // tool calls cannot race the daily cap or double-dispatch
    async withAccountLock<T> (accountName: string, fn: () => Promise<T>): Promise<T> {
        const previous = this.accountLocks.get (accountName) ?? Promise.resolve ();
        let release: () => void;
        const current = new Promise<void> ((resolve) => {
            release = resolve;
        });
        this.accountLocks.set (accountName, previous.then (() => current));
        await previous;
        try {
            return await fn ();
        } finally {
            release! ();
        }
    }

    checkSymbolAllowed (account: AccountConfig, symbol: string, base?: string, quote?: string): void {
        const allowed = account.allowedSymbols;
        if (allowed !== undefined && !allowed.some ((pattern) => symbolMatches (pattern, symbol, base, quote))) {
            throw new SafetyError ('SYMBOL_NOT_ALLOWED', symbol + ' is not in the allowedSymbols list of account ' + JSON.stringify (account.name) + ' (' + allowed.join (', ') + '). ' + CONFIG_HINT);
        }
        const denied = account.deniedSymbols;
        if (denied !== undefined && denied.some ((pattern) => symbolMatches (pattern, symbol, base, quote))) {
            throw new SafetyError ('SYMBOL_DENIED', symbol + ' is in the deniedSymbols list of account ' + JSON.stringify (account.name) + '. ' + CONFIG_HINT);
        }
    }

    // the single execution-point guard for order-shaped writes; returns the computed,
    // exchange-normalized order the caller must dispatch verbatim
    async guardOrder (exchange: any, account: AccountConfig, intent: OrderIntent): Promise<GuardResult> {
        requireTier (account, 'trading');

        // ccxt market orders read a quote-side size from params (cost/quoteOrderQty),
        // which would execute at that size while the caps valued only the tiny positional
        // amount — quote-side spend must go through the valued top-level cost parameter
        for (const key of [ 'cost', 'quoteOrderQty' ]) {
            if (intent.params?.[key] !== undefined) {
                throw new SafetyError ('PARAMS_NOTIONAL_OVERRIDE', 'params.' + key + ' is not accepted — it would bypass the notional caps', 'pass quote-side spend via the top-level "cost" parameter of create_order instead');
            }
        }

        let market: any;
        try {
            market = exchange.market (intent.symbol);
        } catch (e) {
            market = undefined;
        }

        this.checkSymbolAllowed (account, intent.symbol, market?.base, market?.quote);

        // a non-prediction exchange with no such market means a bad symbol (typo, or an
        // outcome handle sent to a crypto account) — fail clearly instead of limping to an
        // "unvaluable" error. Prediction venues legitimately have no unified market for an
        // outcome handle and are valued specially below.
        if (market === undefined && !exchange.has?.['fetchEvents']) {
            throw new SafetyError ('BAD_SYMBOL', intent.symbol + ' is not a market on ' + exchange.id, 'resolve the symbol with search_markets; to trade a prediction outcome, use an account configured for a prediction-market exchange');
        }

        let amount = intent.amount;
        let price = intent.price;
        let marketValidated = false;
        if (market !== undefined) {
            if (market.active === false) {
                throw new SafetyError ('MARKET_INACTIVE', intent.symbol + ' is not active on ' + exchange.id, 'pick another market via search_markets');
            }
            try {
                amount = Number (exchange.amountToPrecision (intent.symbol, intent.amount));
                if (price !== undefined) {
                    price = Number (exchange.priceToPrecision (intent.symbol, price));
                }
            } catch (e: any) {
                throw new SafetyError ('PRECISION_ERROR', String (e?.message ?? e), 'check precision/limits for ' + intent.symbol + ' via search_markets');
            }
            const limits = market.limits ?? {};
            checkLimit ('amount', amount, limits.amount);
            if (price !== undefined) {
                checkLimit ('price', price, limits.price);
            }
            marketValidated = true;
        }

        const valuation = await this.valueInUsd (exchange, account, intent.symbol, market, amount, price);
        if (marketValidated && valuation.referencePrice !== undefined) {
            const contractSize = (market.contract && typeof market.contractSize === 'number') ? market.contractSize : 1;
            // inverse contracts: cost is denominated in base/settle (amount*contractSize/price)
            const quoteCost = market.inverse
                ? (amount * contractSize) / (price ?? valuation.referencePrice)
                : amount * (price ?? valuation.referencePrice) * contractSize;
            checkLimit ('cost', quoteCost, market.limits?.cost);
        }

        const cap = account.maxOrderValue;
        if (typeof cap === 'number') {
            if (valuation.value === undefined) {
                throw new SafetyError ('UNVALUABLE_ORDER', 'a maxOrderValue cap is set on account ' + JSON.stringify (account.name) + ' but the order value could not be determined (' + (valuation.note ?? 'no reference price') + ')', 'provide an explicit limit price, or the user can set "maxOrderValue": null to opt out of the cap');
            }
            if (valuation.value > cap) {
                throw new SafetyError ('ORDER_VALUE_CAP', 'order value ≈ ' + valuation.value.toFixed (2) + ' ' + valuation.currency + ' exceeds the maxOrderValue cap of ' + cap + ' on account ' + JSON.stringify (account.name), 'reduce the amount, or the user can raise the cap in the config file');
            }
        }

        const dailyCap = account.maxDailyValue;
        if (typeof dailyCap === 'number' && valuation.value !== undefined) {
            const spent = this.journal.dispatchedValueLast24h (account.name);
            if (spent + valuation.value > dailyCap) {
                throw new SafetyError ('DAILY_VALUE_CAP', 'this order (≈ ' + valuation.value.toFixed (2) + ' USD) would exceed the rolling 24h maxDailyValue cap of ' + dailyCap + ' on account ' + JSON.stringify (account.name) + ' (already dispatched: ≈ ' + spent.toFixed (2) + ' USD)', 'wait for the window to roll, or the user can raise the cap');
            }
        }

        return {
            amount,
            price,
            'orderValue': valuation.value,
            'orderValueCurrency': valuation.currency,
            'priceEstimated': valuation.estimated,
            'valuationNote': valuation.note,
            marketValidated,
        };
    }

    // cost-based orders: the cost IS the quote-side order value, so the cap applies to it
    // directly after quote->USD conversion — no amount/precision math needed
    async guardCost (exchange: any, account: AccountConfig, symbol: string, cost: number): Promise<GuardResult> {
        const quote = symbol.includes ('/') ? symbol.split ('/')[1].split (':')[0] : undefined;
        let value: number | undefined;
        let note: string | undefined;
        if (quote !== undefined && USD_QUOTES.has (quote.toUpperCase ())) {
            value = cost;
        } else if (quote !== undefined) {
            const quoteUsd = await this.referencePrice (exchange, quote);
            if (quoteUsd !== undefined) {
                value = cost * quoteUsd;
            } else {
                note = 'no ' + quote + '/USD-stable market found to value the cost';
            }
        } else if (exchange.has?.['fetchEvents']) {
            // prediction venues settle in USD-pegged collateral — cost IS the USD value
            value = cost;
        } else {
            note = 'could not determine the quote currency of ' + symbol;
        }
        const cap = account.maxOrderValue;
        if (typeof cap === 'number') {
            if (value === undefined) {
                throw new SafetyError ('UNVALUABLE_ORDER', 'a maxOrderValue cap is set on account ' + JSON.stringify (account.name) + ' but the cost could not be valued (' + (note ?? '') + ')', 'the user can set "maxOrderValue": null to opt out of the cap');
            }
            if (value > cap) {
                throw new SafetyError ('ORDER_VALUE_CAP', 'order cost ≈ ' + value.toFixed (2) + ' USD exceeds the maxOrderValue cap of ' + cap + ' on account ' + JSON.stringify (account.name), 'reduce the cost, or the user can raise the cap');
            }
        }
        const dailyCap = account.maxDailyValue;
        if (typeof dailyCap === 'number' && value !== undefined) {
            const spent = this.journal.dispatchedValueLast24h (account.name);
            if (spent + value > dailyCap) {
                throw new SafetyError ('DAILY_VALUE_CAP', 'this order (≈ ' + value.toFixed (2) + ' USD) would exceed the rolling 24h maxDailyValue cap of ' + dailyCap + ' on account ' + JSON.stringify (account.name) + ' (already dispatched: ≈ ' + spent.toFixed (2) + ' USD)', 'wait for the window to roll, or the user can raise the cap');
            }
        }
        return {
            'amount': cost,
            'price': undefined,
            'orderValue': value,
            'orderValueCurrency': 'USD',
            'priceEstimated': false,
            'valuationNote': note,
            'marketValidated': false,
        };
    }

    // withdraw/transfer valuation against maxTransferValue — same fail-closed rule
    async guardTransfer (exchange: any, account: AccountConfig, currency: string, amount: number): Promise<{ value: number | undefined, note?: string }> {
        requireTier (account, 'funds');
        const cap = account.maxTransferValue;
        let value: number | undefined;
        let note: string | undefined;
        if (USD_QUOTES.has (currency.toUpperCase ())) {
            value = amount;
        } else {
            const price = await this.referencePrice (exchange, currency);
            if (price !== undefined) {
                value = amount * price;
            } else {
                note = 'no ' + currency + '/USD-stable market found on ' + exchange.id + ' to value the transfer';
            }
        }
        if (typeof cap === 'number') {
            if (value === undefined) {
                throw new SafetyError ('UNVALUABLE_TRANSFER', 'a maxTransferValue cap is set on account ' + JSON.stringify (account.name) + ' but the ' + currency + ' amount could not be valued (' + (note ?? 'no reference price') + ')', 'the user can set "maxTransferValue": null to opt out of the cap');
            }
            if (value > cap) {
                throw new SafetyError ('TRANSFER_VALUE_CAP', 'transfer value ≈ ' + value.toFixed (2) + ' USD exceeds the maxTransferValue cap of ' + cap + ' on account ' + JSON.stringify (account.name), 'reduce the amount, or the user can raise the cap');
            }
        }
        // maxDailyValue is the combined rolling cap over orders AND fund moves — the
        // journal accumulator already counts both, so both must be bound by it
        const dailyCap = account.maxDailyValue;
        if (typeof dailyCap === 'number' && value !== undefined) {
            const spent = this.journal.dispatchedValueLast24h (account.name);
            if (spent + value > dailyCap) {
                throw new SafetyError ('DAILY_VALUE_CAP', 'this transfer (≈ ' + value.toFixed (2) + ' USD) would exceed the rolling 24h maxDailyValue cap of ' + dailyCap + ' on account ' + JSON.stringify (account.name) + ' (already dispatched: ≈ ' + spent.toFixed (2) + ' USD)', 'wait for the window to roll, or the user can raise the cap');
            }
        }
        return { value, note };
    }

    private async valueInUsd (exchange: any, account: AccountConfig, symbol: string, market: any, amount: number, price: number | undefined): Promise<{ value: number | undefined, currency: string, estimated: boolean, note?: string, referencePrice?: number }> {
        const quote: string | undefined = market?.quote ?? (symbol.includes ('/') ? symbol.split ('/')[1].split (':')[0] : undefined);
        let referencePrice = price;
        let estimated = false;
        if (referencePrice === undefined) {
            try {
                const ticker = await exchange.fetchTicker (symbol);
                referencePrice = ticker?.last ?? ticker?.close ?? ((ticker?.bid && ticker?.ask) ? (ticker.bid + ticker.ask) / 2 : undefined);
                estimated = true;
            } catch (e) {
                referencePrice = undefined;
            }
        }
        if (referencePrice === undefined) {
            return { 'value': undefined, 'currency': 'USD', estimated, 'note': 'no price available for ' + symbol };
        }
        const contractSize = (market?.contract && typeof market.contractSize === 'number') ? market.contractSize : 1;
        // inverse (coin-margined) contracts: contractSize is quote(USD)-denominated, so the
        // notional is amount * contractSize regardless of price
        const quoteValue = market?.inverse
            ? amount * contractSize
            : amount * referencePrice * contractSize;
        if (quote === undefined) {
            // prediction outcome handles have no BASE/QUOTE shape, but every prediction
            // venue settles in USD-pegged collateral and price is a 0..1 probability, so
            // amount * price IS the USD value
            if (exchange.has?.['fetchEvents']) {
                return { 'value': quoteValue, 'currency': 'USD', estimated, referencePrice };
            }
            return { 'value': undefined, 'currency': 'USD', estimated, 'note': 'could not determine the quote currency of ' + symbol, referencePrice };
        }
        if (USD_QUOTES.has (quote.toUpperCase ())) {
            return { 'value': quoteValue, 'currency': 'USD', estimated, referencePrice };
        }
        const quoteUsd = await this.referencePrice (exchange, quote);
        if (quoteUsd === undefined) {
            return { 'value': undefined, 'currency': quote, estimated, 'note': 'no ' + quote + '/USD-stable market found on ' + exchange.id + ' to convert the order value', referencePrice };
        }
        return { 'value': quoteValue * quoteUsd, 'currency': 'USD', estimated, referencePrice };
    }

    private async referencePrice (exchange: any, currency: string): Promise<number | undefined> {
        for (const stable of [ 'USDT', 'USDC', 'USD' ]) {
            const symbol = currency.toUpperCase () + '/' + stable;
            if (exchange.markets !== undefined && exchange.markets[symbol] !== undefined) {
                try {
                    const ticker = await exchange.fetchTicker (symbol);
                    if (ticker?.last !== undefined) {
                        return ticker.last;
                    }
                } catch (e) {
                    // try the next stable
                }
            }
        }
        return undefined;
    }

    confirmationRequired (account: AccountConfig): boolean {
        const policy = account.confirm ?? 'live';
        if (policy === 'never') {
            return false;
        }
        if (policy === 'always') {
            return true;
        }
        return accountEnvironment (account) === 'live';
    }

    // two-phase confirmation fallback for clients without elicitation: the first call
    // returns a preview + single-use token bound (HMAC) to the exact call payload,
    // the second call must repeat the identical payload with the token
    issueConfirmToken (payload: any): string {
        const token = crypto.randomUUID ();
        this.tokens.set (token, {
            'digest': this.digest (payload),
            'expiresAt': Date.now () + CONFIRM_TOKEN_TTL_MS,
        });
        return token;
    }

    redeemConfirmToken (token: string, payload: any): void {
        const entry = this.tokens.get (token);
        this.tokens.delete (token); // single-use, valid or not
        if (entry === undefined) {
            throw new SafetyError ('CONFIRM_INVALID', 'unknown or already-used confirmation token', 'call the tool again without "confirm" to get a fresh preview and token');
        }
        if (Date.now () > entry.expiresAt) {
            throw new SafetyError ('CONFIRM_EXPIRED', 'the confirmation token expired (60s TTL)', 'call the tool again without "confirm" to get a fresh preview and token');
        }
        if (entry.digest !== this.digest (payload)) {
            throw new SafetyError ('CONFIRM_MISMATCH', 'the call parameters differ from the ones this token confirmed', 'call the tool again without "confirm" to preview the new parameters');
        }
    }

    private digest (payload: any): string {
        return crypto.createHmac ('sha256', this.tokenSecret).update (canonicalStringify (payload)).digest ('hex');
    }
}

// deterministic serialization regardless of object key insertion order
function canonicalStringify (value: any): string {
    if (Array.isArray (value)) {
        return '[' + value.map ((entry) => canonicalStringify (entry)).join (',') + ']';
    }
    if (value !== null && typeof value === 'object') {
        const keys = Object.keys (value).sort ();
        return '{' + keys.map ((key) => JSON.stringify (key) + ':' + canonicalStringify (value[key])).join (',') + '}';
    }
    return JSON.stringify (value) ?? 'null';
}

function checkLimit (name: string, value: number | undefined, limit: { min?: number, max?: number } | undefined): void {
    if (value === undefined || limit === undefined) {
        return;
    }
    if (limit.min !== undefined && limit.min !== null && value < limit.min) {
        throw new SafetyError ('BELOW_MARKET_MINIMUM', name + ' ' + value + ' is below the market minimum ' + limit.min, 'increase the ' + name + ' to at least ' + limit.min);
    }
    if (limit.max !== undefined && limit.max !== null && value > limit.max) {
        throw new SafetyError ('ABOVE_MARKET_MAXIMUM', name + ' ' + value + ' is above the market maximum ' + limit.max, 'reduce the ' + name + ' to at most ' + limit.max);
    }
}
