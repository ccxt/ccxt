import { ArgError } from './tools/common.js';

// Server-side shaping for call_read_method. Bulk reads (fetchFundingRates, fetchTickers,
// fetchOpenInterests, … with no symbol filter) return hundreds of entries from one exchange
// call: okx fetchFundingRates is ~800 swaps ≈ 127k tokens. Agents usually want a slice of
// that ("the 20 most negative funding rates"), so sort/limit/project run here, after the
// single exchange request, instead of shipping the whole thing through the context window.

export interface ShapeOptions {
    fields?: string[];
    sortBy?: string;
    limit?: number;
    offset?: number;
}

export interface Shaped {
    data: any;
    meta: Record<string, any>;
}

function isPlainObject (value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray (value);
}

// how a result's entries are laid out: an array of structures, or an object keyed by
// symbol/currency whose values are structures (fetchFundingRates, fetchTickers, …)
function entriesOf (data: any): { kind: 'array' | 'map', entries: [ string | number, any ][] } | undefined {
    if (Array.isArray (data)) {
        return { 'kind': 'array', 'entries': data.map ((item, index) => [ index, item ]) };
    }
    if (!isPlainObject (data)) {
        return undefined;
    }
    const entries = Object.entries (data);
    const structures = entries.filter (([ , value ]) => isPlainObject (value)).length;
    // a single structure (fetchTicker, fetchFundingRate) has mostly scalar fields; a map
    // keyed by symbol has (almost) only structures as values
    if (entries.length > 0 && structures / entries.length >= 0.8) {
        return { 'kind': 'map', entries };
    }
    return undefined;
}

function availableFields (items: any[]): string[] {
    const fields = new Set<string> ();
    for (const item of items.slice (0, 20)) {
        if (isPlainObject (item)) {
            for (const key of Object.keys (item)) {
                fields.add (key);
            }
        }
    }
    return [ ...fields ];
}

function compareValues (a: any, b: any): number {
    const aNumber = (typeof a === 'number') ? a : Number (a);
    const bNumber = (typeof b === 'number') ? b : Number (b);
    if (a !== '' && b !== '' && Number.isFinite (aNumber) && Number.isFinite (bNumber)) {
        return aNumber - bNumber;
    }
    return String (a).localeCompare (String (b));
}

// like project(), but keeps requested fields whose value is null — a null is information
// ("this exchange doesn't report it"), dropping it makes it look like a typo
function pick (value: Record<string, any>, fields: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const field of fields) {
        if (field in value) {
            result[field] = (value[field] === undefined) ? null : value[field];
        }
    }
    return result;
}

function isMissing (value: any): boolean {
    return value === undefined || value === null || (typeof value === 'number' && Number.isNaN (value));
}

export function shapeResult (data: any, options: ShapeOptions): Shaped {
    const { fields, sortBy, limit, offset } = options;
    const meta: Record<string, any> = {};
    if (fields === undefined && sortBy === undefined && limit === undefined && offset === undefined) {
        return { data, meta };
    }
    if (limit !== undefined && (!Number.isInteger (limit) || limit < 1)) {
        throw new ArgError ('limit must be a positive integer', 'e.g. "limit": 20');
    }
    if (offset !== undefined && (!Number.isInteger (offset) || offset < 0)) {
        throw new ArgError ('offset must be a non-negative integer', 'e.g. "offset": 20 with "limit": 20 for the second slice');
    }
    const layout = entriesOf (data);
    if (layout === undefined) {
        // a single structure — only a projection makes sense
        if (sortBy !== undefined || limit !== undefined || offset !== undefined) {
            meta['notice'] = 'sortBy/limit/offset apply to list results only — this method returned a single structure, so they were ignored';
        }
        if (fields !== undefined && isPlainObject (data)) {
            const known = Object.keys (data);
            const present = fields.filter ((field) => known.includes (field));
            if (present.length === 0) {
                throw new ArgError ('none of the requested fields exist in the result', 'available fields: ' + known.join (', '));
            }
            const unknown = fields.filter ((field) => !known.includes (field));
            if (unknown.length > 0) {
                meta['unknownFields'] = unknown;
            }
            return { 'data': pick (data, present), meta };
        }
        return { data, meta };
    }
    let entries = layout.entries;
    const items = entries.map (([ , value ]) => value);
    const known = availableFields (items);
    const matched = entries.length;
    if (sortBy !== undefined) {
        const descending = sortBy.startsWith ('-');
        const field = descending ? sortBy.slice (1) : sortBy;
        if (entries.length > 0 && !items.some ((item) => isPlainObject (item) && !isMissing (item[field]))) {
            if (known.includes (field)) {
                throw new ArgError ('sortBy field "' + field + '" is null on every entry — this exchange does not report it', 'sort by another field: ' + known.join (', '));
            }
            throw new ArgError ('sortBy field "' + field + '" is not present in the result', 'available fields: ' + known.join (', ') + ' — prefix with "-" for descending, e.g. "-fundingRate"');
        }
        // stable sort; entries without the field always sink to the end
        entries = entries
            .map ((entry, index) => ({ entry, index }))
            .sort ((x, y) => {
                const a = x.entry[1]?.[field];
                const b = y.entry[1]?.[field];
                if (isMissing (a) || isMissing (b)) {
                    return (isMissing (a) ? 1 : 0) - (isMissing (b) ? 1 : 0) || (x.index - y.index);
                }
                const order = compareValues (a, b);
                return (descending ? -order : order) || (x.index - y.index);
            })
            .map (({ entry }) => entry);
        meta['sortedBy'] = sortBy;
    }
    const start = offset ?? 0;
    entries = entries.slice (start, (limit === undefined) ? undefined : start + limit);
    if (fields !== undefined) {
        const present = fields.filter ((field) => known.includes (field));
        if (entries.length > 0 && present.length === 0) {
            throw new ArgError ('none of the requested fields exist in the result', 'available fields: ' + known.join (', '));
        }
        const unknown = fields.filter ((field) => !known.includes (field));
        if (unknown.length > 0 && entries.length > 0) {
            meta['unknownFields'] = unknown;
        }
        // keep the identifying field so array rows stay attributable after projection
        const keep = (layout.kind === 'array' && known.includes ('symbol') && !present.includes ('symbol')) ? [ 'symbol', ...present ] : present;
        entries = entries.map (([ key, value ]) => [ key, isPlainObject (value) ? pick (value, keep) : value ]);
        meta['fields'] = keep;
    }
    // "matched"/"window" rather than total/hasMore: those belong to next_page pagination,
    // which can still apply on top of a shaped result that is too large for one response
    meta['matched'] = matched;
    if (start > 0 || start + entries.length < matched) {
        meta['window'] = { 'offset': start, 'count': entries.length };
        if (start + entries.length < matched) {
            meta['notice'] = 'showing entries ' + start + '–' + (start + entries.length - 1) + ' of ' + matched + ' — pass "offset": ' + (start + entries.length) + ' with the same sortBy/limit for the next slice';
        }
    }
    const shaped = (layout.kind === 'array') ? entries.map (([ , value ]) => value) : Object.fromEntries (entries);
    return { 'data': shaped, meta };
}
