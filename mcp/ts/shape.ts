import { project } from './format.js';
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

function isMissing (value: any): boolean {
    return value === undefined || value === null || (typeof value === 'number' && Number.isNaN (value));
}

export function shapeResult (data: any, options: ShapeOptions): Shaped {
    const { fields, sortBy, limit } = options;
    const meta: Record<string, any> = {};
    if (fields === undefined && sortBy === undefined && limit === undefined) {
        return { data, meta };
    }
    if (limit !== undefined && (!Number.isInteger (limit) || limit < 1)) {
        throw new ArgError ('limit must be a positive integer', 'e.g. "limit": 20');
    }
    const layout = entriesOf (data);
    if (layout === undefined) {
        // a single structure — only a projection makes sense
        if (sortBy !== undefined || limit !== undefined) {
            meta['notice'] = 'sortBy/limit apply to list results only — this method returned a single structure, so they were ignored';
        }
        if (fields !== undefined && isPlainObject (data)) {
            const projected = project (data, fields);
            if (Object.keys (projected).length === 0) {
                throw new ArgError ('none of the requested fields exist in the result', 'available fields: ' + Object.keys (data).join (', '));
            }
            return { 'data': projected, meta };
        }
        return { data, meta };
    }
    let entries = layout.entries;
    const items = entries.map (([ , value ]) => value);
    const known = availableFields (items);
    meta['total'] = entries.length;
    if (sortBy !== undefined) {
        const descending = sortBy.startsWith ('-');
        const field = descending ? sortBy.slice (1) : sortBy;
        if (entries.length > 0 && !items.some ((item) => isPlainObject (item) && !isMissing (item[field]))) {
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
    if (limit !== undefined) {
        entries = entries.slice (0, limit);
    }
    if (fields !== undefined) {
        if (entries.length > 0 && !fields.some ((field) => known.includes (field))) {
            throw new ArgError ('none of the requested fields exist in the result', 'available fields: ' + known.join (', '));
        }
        // keep the identifying field so array rows stay attributable after projection
        const keep = (layout.kind === 'array' && known.includes ('symbol') && !fields.includes ('symbol')) ? [ 'symbol', ...fields ] : fields;
        entries = entries.map (([ key, value ]) => [ key, isPlainObject (value) ? project (value, keep) : value ]);
        meta['fields'] = keep;
    }
    meta['returned'] = entries.length;
    if (entries.length < meta['total']) {
        meta['hasMore'] = true;
    }
    const shaped = (layout.kind === 'array') ? entries.map (([ , value ]) => value) : Object.fromEntries (entries);
    return { 'data': shaped, meta };
}
