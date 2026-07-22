import { z } from 'zod';
import type { ServerContext } from '../types.js';
import { accountEnvironment } from '../types.js';
import type { AccountConfig } from '../types.js';
import { toErrorEnvelope, type ErrorContext } from '../errors.js';
import { toContent, ok, type Envelope } from '../format.js';
import { SafetyError } from '../safety.js';
import { UnknownExchangeError, UnknownAccountError } from '../pools.js';
import { log } from '../logging.js';

export type ToolResult = { content: { type: 'text', text: string }[], isError?: boolean };

export const exchangeParam = z.string ().describe ('exchange id, e.g. "binance" — validated against ccxt.exchanges; discover ids with list_exchanges');
export const predictionParam = z.boolean ().optional ().describe ('set true to use the prediction-markets variant of an exchange that exists in both namespaces (e.g. hyperliquid)');
export const paramsParam = z.record (z.any ()).optional ().describe ('extra exchange-specific parameters passed through to ccxt unchanged (e.g. {"until": 1673000000000}) — discover supported keys with describe_method');
export const accountParam = z.string ().describe ('configured account name — discover with list_accounts; credentials are never tool parameters');
export const sinceParam = z.union ([ z.number (), z.string () ]).optional ().describe ('earliest entry to fetch: timestamp in ms, or an ISO8601 string like "2024-01-01T00:00:00Z"');

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

// uniform tool wrapper: envelope + error mapping + size budget in one place
export async function run (context: ErrorContext, fn: () => Promise<Envelope>): Promise<ToolResult> {
    try {
        return toContent (await fn ());
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
            return toContent ({ 'ok': false, 'error': { 'code': 'UNKNOWN_ACCOUNT', 'message': error.message, 'retryable': false, 'hint': 'list configured accounts with list_accounts' } });
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
    forceUnlessNever = false
): Promise<Envelope | 'confirmed'> {
    const required = forceUnlessNever
        ? ((account.confirm ?? 'live') !== 'never')
        : ctx.safety.confirmationRequired (account);
    if (!required) {
        return 'confirmed';
    }
    if (confirmToken !== undefined) {
        ctx.safety.redeemConfirmToken (confirmToken, payload);
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
    const token = ctx.safety.issueConfirmToken (payload);
    return ok ({ 'preview': preview }, {
        'confirmationRequired': true,
        'confirmToken': token,
        'expiresInSeconds': 60,
        'notice': 'no ' + action + ' was performed — show this preview to the user, then repeat the exact same call with "confirm": "<confirmToken>" to execute',
    });
}
