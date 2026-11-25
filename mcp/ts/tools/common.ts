import { z } from 'zod';
import { inputRequired } from '@modelcontextprotocol/server';
import type { AuthInfo, InputRequiredResult } from '@modelcontextprotocol/server';
import type { ServerContext } from '../types.js';
import { accountEnvironment } from '../types.js';
import type { AccountConfig } from '../types.js';
import { toErrorEnvelope, type ErrorContext } from '../errors.js';
import { toContent, ok, type Envelope } from '../format.js';
import { SafetyError } from '../safety.js';
import { UnknownExchangeError, UnknownAccountError } from '../pools.js';
import { log } from '../logging.js';
import { currentRequestScope } from '../request-scope.js';

export type ToolResult = { content: { type: 'text', text: string }[], isError?: boolean } | InputRequiredResult;

// Length caps on free-text identifiers: generous for every real value (the longest ccxt
// exchange id is ~20 characters; prediction outcome handles run to ~100), tight enough that
// a caller cannot push kilobytes into URLs, cache keys or log lines through one argument
export const MAX_EXCHANGE_ID_LENGTH = 64;
export const MAX_SYMBOL_LENGTH = 256;
export const MAX_METHOD_NAME_LENGTH = 128;
export const MAX_ACCOUNT_NAME_LENGTH = 128;
export const MAX_CODE_LENGTH = 64; // currency/network codes, order types, field names
export const MAX_TEXT_LENGTH = 256; // search queries and other free text
export const MAX_SYMBOLS = 50; // symbols per call: get_tickers fans out one request per symbol where fetchTickers is missing

// mirrors MarketType in ts/src/base/types.ts (a unit test keeps the two in step). An enum,
// not a free string: the value becomes options.defaultType and, through it, part of the
// markets disk-cache file name — a free string there was a path traversal
export const MARKET_TYPES = [ 'spot', 'margin', 'swap', 'future', 'option', 'delivery', 'index', 'prediction' ] as const;
export type MarketTypeName = typeof MARKET_TYPES[number];

export const exchangeParam = z.string ().min (1).max (MAX_EXCHANGE_ID_LENGTH).describe ('exchange id, e.g. "binance" — validated against ccxt.exchanges; discover ids with list_exchanges');
export const symbolParam = (description: string) => z.string ().min (1).max (MAX_SYMBOL_LENGTH).describe (description);
export const methodNameParam = (description: string) => z.string ().min (1).max (MAX_METHOD_NAME_LENGTH).describe (description);
export const accountNameParam = z.string ().min (1).max (MAX_ACCOUNT_NAME_LENGTH);
export const marketTypeParam = z.enum (MARKET_TYPES).optional ().describe ('market type routing for exchanges with several ("spot", "swap" perpetuals, "future", "option", …) — sets options.defaultType on a dedicated instance');
export const predictionParam = z.boolean ().optional ().describe ('set true to use the prediction-markets variant of an exchange that exists in both namespaces (e.g. hyperliquid)');
export const paramsParam = z.record (z.string (), z.any ()).optional ().describe ('extra exchange-specific parameters passed through to ccxt unchanged (e.g. {"until": 1673000000000}) — discover supported keys with describe_method');
export const accountParam = accountNameParam.describe ('configured account name — discover with list_accounts; credentials are never tool parameters');
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

// thrown by confirmWrite on a 2026-07-28 request to hand an input_required result (the
// human confirmation prompt) back through run () to the SDK, which has the client ask
// the user and retry the call with the answer
export class InputRequiredSignal extends Error {
    result: InputRequiredResult;
    constructor (result: InputRequiredResult) {
        super ('input required');
        this.result = result;
    }
}

// the caller identity for this call: a per-request token (ctx.http.authInfo) wins over the
// one the server instance was built with. Undefined on stdio and on hosted phase 1
export function requestAuthInfo (ctx: ServerContext): AuthInfo | undefined {
    return currentRequestScope ()?.authInfo ?? ctx.authInfo;
}

// uniform tool wrapper: envelope + error mapping + size budget in one place
export async function run (context: ErrorContext, fn: () => Promise<Envelope>): Promise<ToolResult> {
    try {
        return toContent (await fn ());
    } catch (error: any) {
        if (error instanceof InputRequiredSignal) {
            return error.result;
        }
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

export function clampLimit (limit: number | undefined, defaultValue: number, max: number): number {
    if (limit === undefined) {
        return defaultValue;
    }
    return Math.max (1, Math.min (Math.floor (limit), max));
}

export const CONFIRM_PROMPT_TIMEOUT_MS = 300000;

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
        const message = 'Confirm: ' + summary;
        const requestedSchema = {
            'type': 'object' as const,
            'properties': {
                'confirm': { 'type': 'boolean' as const, 'description': 'approve this action' },
            },
            'required': [ 'confirm' ],
        };
        const request: any = currentRequestScope ()?.request;
        let response: any;
        if (ctx.era === 'modern') {
            // 2026-07-28 has no server-to-client requests: return input_required, the client
            // asks the human and retries this same call carrying the answer. The state is a
            // single-use nonce bound to this exact payload, valid for the same 5 minutes the
            // 2025-era prompt waits — a forged, replayed, stale or mismatched answer fails closed
            const answer = request?.mcpReq?.inputResponses?.['confirm'];
            if (answer === undefined) {
                throw new InputRequiredSignal (inputRequired ({
                    'inputRequests': { 'confirm': inputRequired.elicit ({ message, requestedSchema }) },
                    'requestState': ctx.safety.issueConfirmState (payload),
                }));
            }
            ctx.safety.redeemConfirmState (request.mcpReq.requestState (), payload);
            // the answer is client-supplied data: anything but a well-formed accept reads as a dismissal
            response = (answer !== null && typeof answer === 'object') ? answer : {};
        } else {
            try {
                if (typeof request?.mcpReq?.elicitInput !== 'function') {
                    throw new Error ('no request context to send the confirmation prompt on');
                }
                // humans reading a withdrawal preview take longer than the SDK's 60s default —
                // give confirmations 5 minutes and keep resetting while the host reports progress
                response = await request.mcpReq.elicitInput ({ message, requestedSchema }, {
                    'timeout': CONFIRM_PROMPT_TIMEOUT_MS,
                    'maxTotalTimeout': CONFIRM_PROMPT_TIMEOUT_MS,
                    'resetTimeoutOnProgress': true,
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
