import { redact } from './redact.js';
import { storeSnapshot, getSnapshot, deleteSnapshot, encodeCursor, decodeCursor, SNAPSHOT_TTL_MS, type Snapshot } from './pager.js';

// Host limits are the principled basis for every cap in this file: Claude Code truncates
// MCP tool results at 25,000 tokens by default (MAX_MCP_OUTPUT_TOKENS) and claude.ai/Desktop
// around ~150k characters, and an over-cap result is silently replaced by a file-pointer
// string — the model loses the data without knowing why. The binding limit is the token
// one, so the budget is sized in estimated tokens, not characters. The common "4 chars per
// token" rule holds for prose but not for ccxt output: number-heavy JSON (prices, rates,
// millisecond timestamps, ISO datetimes, punctuation) tokenizes at roughly 3 chars/token,
// so an 80k-char funding-rate scan can be ~27k tokens and blow the host cap. We therefore
// estimate conservatively at 3 chars/token and keep 20% headroom below 25k tokens for the
// envelope and host wrapping.
export const HOST_RESULT_TOKEN_LIMIT = 25000;
export const CHARS_PER_TOKEN = 3;
export const MAX_RESULT_TOKENS = 20000;
// the character-equivalent of the token budget (60k chars) — also comfortably below the
// ~150k-char claude.ai/Desktop limit
export const MAX_RESULT_CHARS = MAX_RESULT_TOKENS * CHARS_PER_TOKEN;

// conservative token estimate for serialized JSON tool output
export function estimateTokens (text: string): number {
    return Math.ceil (text.length / CHARS_PER_TOKEN);
}

function fitsBudget (text: string): boolean {
    return estimateTokens (text) <= MAX_RESULT_TOKENS;
}

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

type Content = { content: { type: 'text', text: string }[], isError?: boolean };

function isPlainObject (value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray (value);
}

function serializedLength (value: any): number {
    return (value === undefined) ? 0 : jsonStringify (value).length;
}

function isPageable (value: any): boolean {
    return Array.isArray (value) ? (value.length > 1) : (isPlainObject (value) && Object.keys (value).length > 1);
}

// how deep findCollection follows a dominant key into a raw payload
const MAX_NESTING = 4;
// the most the fields around a nested collection may take on each page; larger siblings are
// left out (and listed) so the page has room for the collection itself
const FRAME_BUDGET_CHARS = Math.floor (MAX_RESULT_CHARS / 4);

// the child holding more than half of an object's serialized size, if it is a container
function dominantChild (node: Record<string, any>): string | undefined {
    const total = serializedLength (node);
    let biggestKey: string | undefined = undefined;
    let biggestSize = 0;
    for (const [ key, value ] of Object.entries (node)) {
        const size = serializedLength (value);
        if (size > biggestSize) {
            biggestKey = key;
            biggestSize = size;
        }
    }
    if (biggestKey === undefined || biggestSize <= total / 2) {
        return undefined;
    }
    const child = node[biggestKey];
    return (Array.isArray (child) || isPlainObject (child)) ? biggestKey : undefined;
}

// follow dominant keys down a raw payload to the collection that holds it:
// {"code", "data": [...]} → ["data"]; {"retCode", "result": {"category", "list": [...]}} →
// ["result", "list"]; {"code", "data": {"BTC": {...}, ...}} → ["data"]
function nestedCollectionPath (node: Record<string, any>, depth: number): string[] | undefined {
    if (depth >= MAX_NESTING) {
        return undefined;
    }
    const key = dominantChild (node);
    if (key === undefined) {
        return undefined;
    }
    const child = node[key];
    if (Array.isArray (child)) {
        return isPageable (child) ? [ key ] : undefined;
    }
    const deeper = nestedCollectionPath (child, depth + 1);
    if (deeper !== undefined) {
        return [ key, ...deeper ];
    }
    return isPageable (child) ? [ key ] : undefined;
}

function getAtPath (value: any, path: string[]): any {
    return path.reduce ((node, key) => node[key], value);
}

// a copy of `frame` with the collection at `path` replaced by `value` and the `omitted`
// sibling fields (dotted paths) left out
function setAtPath (frame: Record<string, any>, path: string[], value: any, omitted: Set<string>, prefix = ''): Record<string, any> {
    const [ head, ...rest ] = path;
    const result: Record<string, any> = {};
    for (const [ key, entry ] of Object.entries (frame)) {
        const dotted = (prefix === '') ? key : (prefix + '.' + key);
        if (key === head) {
            result[key] = (rest.length > 0) ? setAtPath (entry, rest, value, omitted, dotted) : value;
        } else if (!omitted.has (dotted)) {
            result[key] = entry;
        }
    }
    return result;
}

// the sibling fields to leave out so the frame repeated on every page stays small: the
// largest siblings along the path first, until the rest fits FRAME_BUDGET_CHARS
function chooseOmitted (frame: Record<string, any>, path: string[], empty: any): string[] {
    const siblings: { dotted: string, size: number }[] = [];
    let node: Record<string, any> = frame;
    for (let depth = 0; depth < path.length; depth++) {
        const prefix = path.slice (0, depth).join ('.');
        for (const [ key, entry ] of Object.entries (node)) {
            if (key !== path[depth]) {
                siblings.push ({ 'dotted': (prefix === '') ? key : (prefix + '.' + key), 'size': serializedLength (entry) });
            }
        }
        node = node[path[depth]];
    }
    siblings.sort ((a, b) => b.size - a.size);
    const omitted = new Set<string> ();
    for (const sibling of siblings) {
        if (serializedLength (setAtPath (frame, path, empty, omitted)) <= FRAME_BUDGET_CHARS) {
            break;
        }
        omitted.add (sibling.dotted);
    }
    return [ ...omitted ];
}

// find the collection to page through: the data itself (an array, or an object keyed by
// symbol/currency/… like fetchFundingRates, fetchTickers or fetchBalance), or — for raw
// endpoint payloads — a collection nested up to MAX_NESTING levels down that holds most of
// the payload
export function findCollection (data: any): Omit<Snapshot, 'meta' | 'lastAccess'> | undefined {
    if (Array.isArray (data)) {
        return isPageable (data) ? { 'kind': 'array', 'items': data } : undefined;
    }
    if (!isPlainObject (data)) {
        return undefined;
    }
    const path = nestedCollectionPath (data, 0);
    if (path !== undefined) {
        const nested = getAtPath (data, path);
        const kind = Array.isArray (nested) ? 'array' : 'map';
        const collection: Omit<Snapshot, 'meta' | 'lastAccess'> = {
            kind,
            'items': Array.isArray (nested) ? nested : Object.entries (nested),
            'frame': data,
            path,
        };
        const omitted = chooseOmitted (data, path, (kind === 'array') ? [] : {});
        if (omitted.length > 0) {
            collection.omitted = omitted;
        }
        return collection;
    }
    return isPageable (data) ? { 'kind': 'map', 'items': Object.entries (data) } : undefined;
}

function pageData (snapshot: Snapshot, offset: number, count: number): any {
    const slice = snapshot.items.slice (offset, offset + count);
    const value = (snapshot.kind === 'array') ? slice : Object.fromEntries (slice);
    if (snapshot.path === undefined || snapshot.frame === undefined) {
        return value;
    }
    // keep the surrounding fields (code, msg, …) and swap in the page at the same path
    return setAtPath (snapshot.frame, snapshot.path, value, new Set (snapshot.omitted ?? []));
}

// pagination state lives under meta.page so it never overwrites the tool's own meta (e.g.
// get_orders' hasMore = "the count hit the limit, more exist on the exchange", or the
// shaping notice/window of call_read_method)
function pageMeta (id: string, snapshot: Snapshot, offset: number, returned: number, consumed: number): Record<string, any> {
    const total = snapshot.items.length;
    const next = offset + consumed;
    const hasMore = next < total;
    const page: Record<string, any> = {
        offset,
        returned,
        total,
        hasMore,
    };
    if (snapshot.path !== undefined) {
        page['pagedField'] = 'data.' + snapshot.path.join ('.');
    }
    const omitted = snapshot.omitted ?? [];
    if (omitted.length > 0) {
        page['omittedFields'] = omitted.map ((field) => 'data.' + field);
    }
    if (hasMore) {
        page['nextCursor'] = encodeCursor (id, next);
        page['notice'] = 'result split into pages to fit the host tool-result limit (' + total + ' entries in total) — call next_page with meta.page.nextCursor to get the next page; pages come from one snapshot and expire after ' + (SNAPSHOT_TTL_MS / 60000) + ' minutes unread';
    } else {
        page['notice'] = 'last page of a paginated result (' + total + ' entries in total)';
    }
    if (omitted.length > 0) {
        page['notice'] += '; the fields in omittedFields were too large to repeat on every page and were left out — request them with a narrower call';
    }
    return { ...snapshot.meta, 'paginated': true, page };
}

// the largest page starting at `offset` that fits the budget (binary search over the page
// size — O(log n) serializations). An entry too large to fit even on its own is replaced by
// an explicit marker and skipped, so paging can always continue.
export function renderPage (id: string, snapshot: Snapshot, offset: number): Envelope {
    const remaining = snapshot.items.length - offset;
    let low = 1;
    let high = remaining;
    let best: Envelope | undefined = undefined;
    while (low <= high) {
        const mid = Math.floor ((low + high) / 2);
        const candidate: Envelope = { 'ok': true, 'data': pageData (snapshot, offset, mid), 'meta': pageMeta (id, snapshot, offset, mid, mid) };
        if (fitsBudget (redact (jsonStringify (candidate)))) {
            best = candidate;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    if (best !== undefined) {
        return best;
    }
    const meta = pageMeta (id, snapshot, offset, 0, 1);
    meta['page']['skipped'] = 1;
    return {
        'ok': true,
        'data': { 'truncated': true, 'reason': 'the entry at offset ' + offset + ' is larger than the host tool-result limit on its own and cannot be returned — request it directly with a narrower call' },
        meta,
    };
}

// serve a later page of a paginated result (the next_page tool)
export function nextPage (cursor: string): Envelope {
    const decoded = decodeCursor (cursor);
    if (decoded === undefined) {
        return { 'ok': false, 'error': { 'code': 'BAD_CURSOR', 'message': 'not a valid cursor: ' + JSON.stringify (cursor), 'retryable': false, 'hint': 'pass meta.page.nextCursor from the previous page unchanged' } };
    }
    const snapshot = getSnapshot (decoded.id);
    if (snapshot === undefined) {
        return { 'ok': false, 'error': { 'code': 'CURSOR_EXPIRED', 'message': 'no paginated result for this cursor — it was fully read, expired, or never existed', 'retryable': false, 'hint': 'snapshots are freed after their last page and expire after ' + (SNAPSHOT_TTL_MS / 60000) + ' minutes unread — repeat the original call to get a fresh first page' } };
    }
    if (decoded.offset >= snapshot.items.length) {
        return { 'ok': false, 'error': { 'code': 'BAD_CURSOR', 'message': 'cursor offset ' + decoded.offset + ' is past the end of the result (' + snapshot.items.length + ' entries)', 'retryable': false, 'hint': 'the previous page had meta.page.hasMore: false — there is nothing left to read' } };
    }
    const page = renderPage (decoded.id, snapshot, decoded.offset);
    if (!page.meta?.['page']?.['hasMore']) {
        // fully read — free it now rather than holding it until the TTL or eviction
        deleteSnapshot (decoded.id);
    }
    return page;
}

// serialize an envelope into MCP content within the global size budget. The output is
// ALWAYS valid JSON and nothing is dropped silently: an oversized collection (array, or an
// object keyed by symbol/currency, or one nested inside a raw payload) is snapshotted server-side
// and returned as its first page plus a meta.page.nextCursor for next_page. Only a payload with
// no collection to page through (one huge scalar structure) is replaced by a valid marker —
// a raw byte-cut that produces unparseable JSON is never emitted.
export function toContent (envelope: Envelope): Content {
    const wrap = (env: Envelope): Content => {
        const out: Content = { 'content': [ { 'type': 'text', 'text': redact (jsonStringify (env)) } ] };
        if (!env.ok) {
            out.isError = true;
        }
        return out;
    };
    let text = redact (jsonStringify (envelope));
    if (fitsBudget (text)) {
        return wrap (envelope);
    }
    const collection = envelope.ok ? findCollection (envelope.data) : undefined;
    if (collection !== undefined) {
        const snapshot: Omit<Snapshot, 'lastAccess'> = { ...collection, 'meta': envelope.meta ?? {} };
        const id = storeSnapshot (snapshot);
        const page = renderPage (id, { ...snapshot, 'lastAccess': Date.now () }, 0);
        if (fitsBudget (redact (jsonStringify (page)))) {
            if (!page.meta?.['page']?.['hasMore']) {
                deleteSnapshot (id);
            }
            return wrap (page);
        }
        deleteSnapshot (id);
    }
    // no collection to page through (e.g. one huge object) — replace data with a valid
    // marker rather than corrupting the JSON
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
    if (fitsBudget (text)) {
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
