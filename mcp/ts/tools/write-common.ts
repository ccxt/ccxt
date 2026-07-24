import crypto from 'crypto';
import type { ServerContext, AccountConfig } from '../types.js';
import { accountEnvironment } from '../types.js';
import { toErrorEnvelope } from '../errors.js';
import type { Envelope } from '../format.js';
import { SafetyError } from '../safety.js';

export interface WriteCall {
    account: AccountConfig;
    tool: string;
    method: string;
    params?: any;
    computed?: Record<string, any>;
    clientOrderId?: string;
}

// journaled write dispatch: intent (fsync) -> call -> result | error. A timeout or network
// failure after dispatch maps to UNKNOWN_OUTCOME (never auto-retried) with the intent's
// clientOrderId in the reconcile hint.
export async function executeWrite (ctx: ServerContext, call: WriteCall, fn: () => Promise<any>): Promise<{ result?: any, error?: Envelope, intentId: string }> {
    const intentId = crypto.randomUUID ();
    const base = {
        'ts': new Date ().toISOString (),
        intentId,
        'account': call.account.name,
        'exchange': call.account.exchange,
        'environment': accountEnvironment (call.account),
        'tool': call.tool,
        'method': call.method,
    };
    ctx.journal.append ({ ...base, 'event': 'intent', 'params': call.params, 'computed': call.computed, 'clientOrderId': call.clientOrderId }, true);
    try {
        const result = await fn ();
        ctx.journal.append ({ ...base, 'ts': new Date ().toISOString (), 'event': 'result', 'outcome': summarizeOutcome (result), 'clientOrderId': call.clientOrderId });
        return { result, intentId };
    } catch (error: any) {
        ctx.journal.append ({ ...base, 'ts': new Date ().toISOString (), 'event': 'error', 'error': { 'message': String (error?.message ?? error) }, 'clientOrderId': call.clientOrderId });
        return {
            'error': toErrorEnvelope (error, {
                'exchange': call.account.exchange,
                'account': call.account.name,
                'tool': call.tool,
                'mutating': true,
                'clientOrderId': call.clientOrderId,
            }),
            intentId,
        };
    }
}

export function journalRejection (ctx: ServerContext, account: AccountConfig, tool: string, method: string, error: SafetyError, params?: any): void {
    ctx.journal.append ({
        'ts': new Date ().toISOString (),
        'intentId': crypto.randomUUID (),
        'event': 'rejected',
        'account': account.name,
        'exchange': account.exchange,
        'environment': accountEnvironment (account),
        tool,
        method,
        params,
        'error': { 'code': error.code, 'message': error.message },
    });
}

function summarizeOutcome (result: any): Record<string, any> {
    if (result === null || typeof result !== 'object') {
        return { 'value': result };
    }
    if (Array.isArray (result)) {
        return { 'count': result.length };
    }
    return { 'id': result.id, 'status': result.status };
}

// ccxt exchanges that support client order ids read params.clientOrderId in their
// createOrder implementation — the method source is the signal for safe injection
// (blind injection would append an unknown field to the request on exchanges that don't)
export function maybeInjectClientOrderId (exchange: any, params: Record<string, any>): { params: Record<string, any>, clientOrderId?: string } {
    const existing = params['clientOrderId'] ?? params['clientOid'] ?? params['clOrdID'] ?? params['newClientOrderId'];
    if (existing !== undefined) {
        return { params, 'clientOrderId': String (existing) };
    }
    try {
        const source = String (exchange.createOrder);
        if (source.includes ('clientOrderId')) {
            const clientOrderId = 'ccxtmcp-' + crypto.randomUUID ().slice (0, 18);
            return { 'params': { ...params, clientOrderId }, clientOrderId };
        }
    } catch (e) {
        // fall through — no injection
    }
    return { params };
}
