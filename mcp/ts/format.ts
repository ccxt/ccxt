import { redact } from './redact.js';

// Host limits are the principled basis for every cap in this file: Claude Code truncates
// tool results around ~25k tokens and claude.ai/Desktop around ~150k characters, and an
// over-cap result is silently replaced by a file-pointer string — the model loses the
// data without knowing why. 80k characters ≈ 80% of the binding (25k-token ≈ 100k-char)
// budget, leaving headroom for the envelope and host wrapping.
export const MAX_RESULT_CHARS = 80000;

export function jsonStringify (obj: any): string {
    return JSON.stringify (obj, (k, v) => ((v === undefined) ? null : v));
}

// the `info` field carries the raw exchange payload inside every unified structure — it is
// the single largest token sink in ccxt output (the CLI strips it from tables for the same
// reason, cli/ts/helpers.ts printHumanReadable)
export function stripInfo (value: any): any {
    if (Array.isArray (value)) {
        return value.map ((item) => stripInfo (item));
    }
    if (value !== null && typeof value === 'object') {
        const result: Record<string, any> = {};
        for (const [ key, entry ] of Object.entries (value)) {
            if (key === 'info') {
                continue;
            }
            result[key] = stripInfo (entry);
        }
        return result;
    }
    return value;
}

export function project (value: any, fields: string[]): any {
    if (value === null || typeof value !== 'object') {
        return value;
    }
    const result: Record<string, any> = {};
    for (const field of fields) {
        if (value[field] !== undefined && value[field] !== null) {
            result[field] = value[field];
        }
    }
    return result;
}

export interface Envelope {
    ok: boolean;
    data?: any;
    meta?: Record<string, any>;
    error?: Record<string, any>;
}

export function ok (data: any, meta?: Record<string, any>): Envelope {
    const envelope: Envelope = { 'ok': true, data };
    if (meta !== undefined && Object.keys (meta).length > 0) {
        envelope.meta = meta;
    }
    return envelope;
}

// serialize an envelope into MCP content within the global size budget. The output is
// ALWAYS valid JSON: array `data` is tail-dropped first; anything still oversized (a
// non-array payload, or a single huge item) has its `data` replaced by a valid truncation
// marker — a raw byte-cut that produces unparseable JSON is never emitted.
export function toContent (envelope: Envelope): { content: { type: 'text', text: string }[], isError?: boolean } {
    const wrap = (env: Envelope): { content: { type: 'text', text: string }[], isError?: boolean } => {
        const out: { content: { type: 'text', text: string }[], isError?: boolean } = { 'content': [ { 'type': 'text', 'text': redact (jsonStringify (env)) } ] };
        if (!env.ok) {
            out.isError = true;
        }
        return out;
    };
    let text = redact (jsonStringify (envelope));
    if (text.length <= MAX_RESULT_CHARS) {
        return wrap (envelope);
    }
    if (Array.isArray (envelope.data)) {
        const available = envelope.data.length;
        let items = envelope.data;
        while (items.length > 1) {
            items = items.slice (0, Math.max (1, Math.floor (items.length / 2)));
            const candidate: Envelope = {
                ...envelope,
                'data': items,
                'meta': {
                    ...(envelope.meta ?? {}),
                    'truncated': true,
                    'returned': items.length,
                    available,
                    'notice': 'result truncated to fit the host tool-result limit — use limit/offset or narrower filters',
                },
            };
            text = redact (jsonStringify (candidate));
            if (text.length <= MAX_RESULT_CHARS) {
                return wrap (candidate);
            }
        }
    }
    // non-array payload (e.g. a raw implicit-endpoint response) or a single item still too
    // big — replace data with a valid marker rather than corrupting the JSON
    const marker: Envelope = {
        ...envelope,
        'data': { 'truncated': true, 'reason': 'the payload exceeds the host tool-result size limit and cannot be returned in full' },
        'meta': {
            ...(envelope.meta ?? {}),
            'truncated': true,
            'notice': 'result too large to return — narrow the request (pass a symbol/filter or a specific query, or use a dedicated tool with a limit)',
        },
    };
    text = redact (jsonStringify (marker));
    if (text.length <= MAX_RESULT_CHARS) {
        return wrap (marker);
    }
    // pathological (huge meta/error) — minimal guaranteed-valid envelope
    return wrap ({ 'ok': false, 'error': { 'code': 'RESULT_TOO_LARGE', 'message': 'the result exceeds the host tool-result size limit', 'retryable': false, 'hint': 'narrow the request' } });
}

export const TICKER_FIELDS = [ 'symbol', 'timestamp', 'datetime', 'last', 'bid', 'ask', 'high', 'low', 'open', 'close', 'previousClose', 'change', 'percentage', 'average', 'baseVolume', 'quoteVolume', 'vwap' ];

export const MARKET_FIELDS = [ 'symbol', 'id', 'type', 'base', 'quote', 'settle', 'active', 'spot', 'swap', 'future', 'option', 'linear', 'inverse', 'contract', 'contractSize', 'expiry', 'strike', 'optionType', 'precision', 'limits', 'taker', 'maker' ];

export const TRADE_FIELDS = [ 'id', 'order', 'timestamp', 'datetime', 'symbol', 'side', 'type', 'takerOrMaker', 'price', 'amount', 'cost', 'fee' ];

export const ORDER_FIELDS = [ 'id', 'clientOrderId', 'timestamp', 'datetime', 'lastTradeTimestamp', 'symbol', 'type', 'side', 'price', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'amount', 'cost', 'filled', 'remaining', 'average', 'status', 'timeInForce', 'postOnly', 'reduceOnly', 'fee' ];

export const POSITION_FIELDS = [ 'symbol', 'side', 'contracts', 'contractSize', 'notional', 'entryPrice', 'markPrice', 'liquidationPrice', 'unrealizedPnl', 'realizedPnl', 'percentage', 'leverage', 'marginMode', 'collateral', 'initialMargin', 'maintenanceMargin', 'hedged', 'timestamp', 'datetime' ];

export const EVENT_FIELDS = [ 'id', 'title', 'description', 'category', 'active', 'closeTime', 'closeDatetime', 'timestamp', 'datetime' ];
