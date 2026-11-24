import { z } from 'zod';
import type { ServerContext } from '../types.js';
import { accountEnvironment } from '../types.js';
import type { AccountConfig } from '../types.js';
import { toErrorEnvelope, type ErrorContext } from '../errors.js';
import { toContent, ok, type Envelope } from '../format.js';
import { SafetyError } from '../safety.js';
import { UnknownExchangeError, UnknownAccountError } from '../pools.js';
import { log } from '../logging.js';
import { isUiPayload, toUiContent, type UiPayload } from '../ui.js';

export type ToolResult = { content: { type: 'text', text: string }[], structuredContent?: Record<string, any>, isError?: boolean };

// These five descriptions are repeated in ~30 tool schemas, and a host injects every schema
// into the model's context (some cap the total — see CORE_TOOLS in ./profile.ts), so each
// word here costs ~30x. Keep them to what the model cannot infer; the conventions they used
// to restate (validation, credentials never being parameters) live once in SERVER_INSTRUCTIONS.
export const exchangeParam = z.string ().describe ('exchange id, e.g. "binance" (list_exchanges)');
export const predictionParam = z.boolean ().optional ().describe ('true = the prediction-markets variant (e.g. of hyperliquid)');
export const paramsParam = z.record (z.any ()).optional ().describe ('exchange-specific ccxt params, passed unchanged (keys: describe_method)');
// what a tool carries instead when the tool profile hides describe_method (./profile.ts)
export const paramsParamNoPointer = z.record (z.any ()).optional ().describe ('exchange-specific ccxt params, passed unchanged');
export const accountParam = z.string ().describe ('account name (list_accounts)');
export const sinceParam = z.union ([ z.number (), z.string () ]).optional ().describe ('earliest entry: ms timestamp or ISO8601 string');

export class ArgError extends Error {
    hint: string;
    constructor (message: string, hint = '') {
        super (message);
        this.hint = hint;
    }
}

export function parseSince (exchange: any, since: number | string | undefined): number | undefined {
    if (since === undefined) {
        return undefined;
    }
    if (typeof since === 'number') {
        return since;
    }
    const parsed = exchange.parse8601 (since);
    if (parsed !== undefined && parsed !== null) {
        return parsed;
    }
    const numeric = Number (since);
    if (Number.isFinite (numeric)) {
        return numeric;
    }
    // reject loudly instead of silently returning the default (recent) window — a typo'd
    // date must never masquerade as "no since"
    throw new ArgError ('could not parse "since" value ' + JSON.stringify (since), 'pass an ISO8601 string like "2024-01-01T00:00:00Z" or a millisecond timestamp');
}

// uniform tool wrapper: envelope + error mapping + size budget in one place. A UI tool
// returns a UiPayload instead (compact envelope for the model + full dataset for its view);
// its errors take the same path as every other tool's, so a failed UI call is plain text.
export async function run (context: ErrorContext, fn: () => Promise<Envelope | UiPayload>): Promise<ToolResult> {
    try {
        const result = await fn ();
        return isUiPayload (result) ? toUiContent (result) : toContent (result);
    } catch (error: any) {
        if (error instanceof SafetyError) {
            return toContent ({ 'ok': false, 'error': { 'code': error.code, 'message': error.message, 'retryable': false, 'hint': error.hint } });
        }
        if (error instanceof ArgError) {
            return toContent ({ 'ok': false, 'error': { 'code': 'BAD_REQUEST', 'message': error.message, 'retryable': false, 'hint': error.hint } });
        }
        if (error instanceof UnknownExchangeError) {
            return toContent ({ 'ok': false, 'error': { 'code': 'UNKNOWN_EXCHANGE', 'message': error.message, 'retryable': false, 'hint': 'closest matches: ' + error.suggestions.join (', ') + ' — see list_exchanges' } });
        }
        if (error instanceof UnknownAccountError) {
            return toContent ({ 'ok': false, 'error': { 'code': 'UNKNOWN_ACCOUNT', 'message': error.message, 'retryable': false, 'hint': error.hint || 'list configured accounts with list_accounts' } });
        }
        return toContent (toErrorEnvelope (error, context));
    }
}

// a fully-qualified symbol determines its own market, so a conflicting marketType is a
// silent no-op — surface it rather than returning the wrong market's data quietly
export function marketTypeMismatchNotice (exchange: any, symbols: string[], marketType: string | undefined): string | undefined {
    if (marketType === undefined) {
        return undefined;
    }
    for (const symbol of symbols) {
        const market = exchange.markets?.[symbol];
        if (market !== undefined && market.type !== undefined && market.type !== marketType) {
            return 'marketType "' + marketType + '" was requested but ' + symbol + ' is a ' + market.type + ' market — that symbol determines the market, so marketType had no effect; pass the ' + marketType + ' symbol (e.g. the ":SETTLE" form) to get ' + marketType + ' data';
        }
    }
    return undefined;
}

// one ticker per requested symbol, in request order; backfills `symbol` so callers can match
// rows to the handles they requested (some prediction/outcome tickers omit it)
export async function fetchTickerList (exchange: any, symbols: string[], params: Record<string, any>): Promise<any[]> {
    if (exchange.has['fetchTickers'] && symbols.length > 1) {
        const result = await exchange.fetchTickers (symbols, params);
        return symbols.map ((symbol: string) => {
            const ticker = result[symbol];
            if (ticker !== undefined && ticker.symbol === undefined) {
                ticker.symbol = symbol;
            }
            return ticker;
        }).filter ((ticker: any) => ticker !== undefined);
    }
    const tickers: any[] = [];
    for (const symbol of symbols) {
        const ticker = await exchange.fetchTicker (symbol, params);
        if (ticker !== undefined && ticker.symbol === undefined) {
            ticker.symbol = symbol;
        }
        tickers.push (ticker);
    }
    return tickers;
}

// some exchanges ignore the API-level limit — slice server-side; and normalize each level to
// the unified [price, amount] (some venues, e.g. kraken, append a per-level timestamp as a
// third element that an agent could misread as an order count)
export function normalizeBookSide (side: any[] | undefined, levels: number): number[][] {
    return (side ?? []).slice (0, levels).map ((level: any[]) => [ level[0], level[1] ]);
}

// shared by get_ohlcv and show_chart so both reject an unsupported timeframe identically
export function badTimeframe (exchange: any, frame: string): Envelope | undefined {
    const timeframes = exchange.timeframes;
    if (timeframes !== null && timeframes !== undefined && timeframes[frame] === undefined) {
        return { 'ok': false, 'error': { 'code': 'BAD_TIMEFRAME', 'message': frame + ' is not a supported timeframe on ' + exchange.id, 'retryable': false, 'hint': 'supported: ' + Object.keys (timeframes).join (', ') } };
    }
    return undefined;
}

export function clampLimit (limit: number | undefined, defaultValue: number, max: number): number {
    if (limit === undefined) {
        return defaultValue;
    }
    return Math.max (1, Math.min (Math.floor (limit), max));
}

export interface AuthContext {
    exchange: any;
    account: AccountConfig;
}

export async function authenticated (ctx: ServerContext, accountName: string): Promise<AuthContext> {
    return ctx.pools.getAuthenticated (accountName);
}

export function environmentMeta (account: AccountConfig): Record<string, any> {
    return { 'account': account.name, 'exchange': account.exchange, 'environment': accountEnvironment (account) };
}

// What a confirmation is bound to besides the call's own arguments. The arguments carry the
// account NAME only, and a name can be given to another record at runtime (setup form,
// accounts page): without the exchange and the environment in the signed payload, a preview
// shown for "main" on a sandbox could be redeemed after "main" became a live account
// elsewhere. Built here, inside confirmWrite, so no write tool can leave it out.
export function confirmationBinding (accounts: AccountConfig[]): { account: string, exchange: string, environment: string }[] {
    return accounts.map ((account) => ({ 'account': account.name, 'exchange': account.exchange, 'environment': accountEnvironment (account) }));
}

// shared confirmation orchestration for every write tool:
// - policy says no confirmation -> proceed
// - a confirm token is supplied -> verify it matches this exact payload -> proceed
// - client supports elicitation -> ask the human in the host UI right now
// - otherwise -> return a preview + single-use token; the model must repeat the call
export async function confirmWrite (
    ctx: ServerContext,
    account: AccountConfig,
    action: string,
    payload: Record<string, any>,
    preview: Record<string, any>,
    confirmToken: string | undefined,
    forceUnlessNever = false,
    // every account the action runs on; execute_route passes one per venue
    involved: AccountConfig[] = [ account ]
): Promise<Envelope | 'confirmed'> {
    const required = forceUnlessNever
        ? ((account.confirm ?? 'live') !== 'never')
        : ctx.safety.confirmationRequired (account);
    if (!required) {
        return 'confirmed';
    }
    const bound = { ...payload, 'boundTo': confirmationBinding (involved) };
    if (confirmToken !== undefined) {
        ctx.safety.redeemConfirmToken (confirmToken, bound);
        return 'confirmed';
    }
    if (ctx.elicitationSupported ()) {
        const summary = action + ' on ' + account.exchange + ' (account ' + JSON.stringify (account.name) + ', ' + accountEnvironment (account).toUpperCase () + ')\n'
            + JSON.stringify (preview, null, 2);
        let response: any;
        try {
            response = await ctx.elicit ('Confirm: ' + summary, {
                'type': 'object',
                'properties': {
                    'confirm': { 'type': 'boolean', 'description': 'approve this action' },
                },
                'required': [ 'confirm' ],
            });
        } catch (e: any) {
            // FAIL CLOSED: on an elicitation-capable host a failed/timed-out human prompt
            // must never downgrade to the model-redeemable token flow — that would let the
            // model confirm its own write
            log ('warning', 'elicitation failed: ' + String (e?.message ?? e));
            return {
                'ok': false,
                'error': {
                    'code': 'CONFIRM_UNAVAILABLE',
                    'message': 'the confirmation prompt could not be completed (' + String (e?.message ?? e) + ') — the ' + action + ' was NOT performed',
                    'retryable': true,
                    'hint': 'ask the user, then retry so they can answer the confirmation prompt',
                },
            };
        }
        if (response.action === 'accept' && response.content?.confirm === true) {
            return 'confirmed';
        }
        // an accept with confirm=false is an explicit "no", not a dismissal
        const declined = response.action === 'decline' || (response.action === 'accept' && response.content?.confirm === false);
        return {
            'ok': false,
            'error': {
                'code': declined ? 'CONFIRM_DECLINED' : 'CONFIRM_CANCELED',
                'message': declined ? 'the user declined this ' + action : 'the confirmation prompt was dismissed without an answer',
                'retryable': false,
                'hint': declined ? 'do not retry — the human said no' : 'ask the user, then retry if they want to proceed',
            },
        };
    }
    const token = ctx.safety.issueConfirmToken (bound, involved.map ((entry) => entry.name));
    return ok ({ 'preview': preview }, {
        'confirmationRequired': true,
        'confirmToken': token,
        'expiresInSeconds': 60,
        'notice': 'no ' + action + ' was performed — show this preview to the user, then repeat the exact same call with "confirm": "<confirmToken>" to execute',
    });
}
