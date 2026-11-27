// Machine-readable API descriptions: OpenAPI 2/3 (JSON or YAML), Postman v2 collections, AsyncAPI
// 2/3 documents and Redoc pages (the spec embedded as `__redoc_state` in the HTML).
//
// The document is reduced to a sorted list of operations, one per line, which is the snapshot:
//   GET /api/v3/order (orderId, symbol)          METHOD path (parameter names)
//   DELETE /api/v3/order (orderId) [deprecated]
//   CHANNEL spot.trades (snapshot, update)       AsyncAPI: channel name (parameters + message names)
// Parameter names are the query/path/formData parameters plus the top-level properties of the
// request body (header and cookie parameters are left out: signing headers are not API changes).
//
// The first run only stores the snapshot. Later runs diff against the previous snapshot and emit
// one synthetic entry per change ("Endpoint added: GET /x", "Endpoint removed: DELETE /y",
// "Parameters changed: POST /z (+foo, -bar)", "Endpoint deprecated: GET /w"), or a single
// "N endpoint changes: ..." entry when more than MAX_SEPARATE operations changed in one run.
// A document with no operations, or with less than half of the previous snapshot's operations,
// is a parse failure (a truncated or wrong document must not read as "everything removed").
import { parse as parseYaml } from 'yaml';
import { sha256 } from '../ids.ts';
import type { SourceConfig, SpecFormat } from '../types.ts';
import type { Adapter, ParsedEntry } from './types.ts';

export const MAX_SEPARATE = 10;
const MAX_LISTED_CHANGES = 200;
const MAX_REF_HOPS = 20;
const HTTP_METHODS = [ 'get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace' ];

export interface Operation {
    key: string;            // "GET /path" or "CHANNEL name"
    params: string[];       // sorted, unique
    deprecated: boolean;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray (v);
const arr = (v: unknown): unknown[] => (Array.isArray (v) ? v : []);

// ---------------------------------------------------------------------------
// loading
// ---------------------------------------------------------------------------

// The JSON object literal starting at `start` ('{'), found by brace matching outside strings.
export function balancedJson (text: string, start: number): string | null {
    let depth = 0;
    let inString = false;
    for (let i = start; i < text.length; i++) {
        const c = text[i];
        if (inString) {
            if (c === '\\') {
                i++;
            } else if (c === '"') {
                inString = false;
            }
            continue;
        }
        if (c === '"') {
            inString = true;
        } else if (c === '{') {
            depth++;
        } else if (c === '}') {
            depth--;
            if (depth === 0) {
                return text.slice (start, i + 1);
            }
        }
    }
    return null;
}

// Redoc's server-rendered page: `const __redoc_state = {"menu":...,"spec":{"data":{<openapi>}}};`
export function redocSpec (html: string): unknown {
    const m = /__redoc_state\s*=\s*\{/.exec (html);
    if (!m) {
        throw new Error ('redoc: __redoc_state not found');
    }
    const json = balancedJson (html, m.index + m[0].length - 1);
    if (!json) {
        throw new Error ('redoc: __redoc_state is not a complete JSON object');
    }
    const state = JSON.parse (json) as Obj;
    const data = isObj (state['spec']) ? (state['spec'] as Obj)['data'] : undefined;
    if (!isObj (data)) {
        throw new Error ('redoc: __redoc_state.spec.data missing');
    }
    return data;
}

export function detectFormat (doc: unknown): Exclude<SpecFormat, 'redoc'> | null {
    if (!isObj (doc)) {
        return null;
    }
    if (typeof doc['openapi'] === 'string' || typeof doc['swagger'] === 'string' || isObj (doc['paths'])) {
        return 'openapi';
    }
    if (typeof doc['asyncapi'] === 'string') {
        return 'asyncapi';
    }
    // Postman v2.x: { info: { _postman_id, schema: ".../collection/v2.1.0/..." }, item: [...] }
    if (Array.isArray (doc['item'])) {
        return 'postman';
    }
    return null;
}

function looksLikeHtml (body: string): boolean {
    return /^\s*(?:<!doctype html|<html|<head|<body|<script)/i.test (body);
}

export function loadSpec (body: string, format?: SpecFormat): { doc: unknown; format: Exclude<SpecFormat, 'redoc'> } {
    let doc: unknown;
    if (format === 'redoc' || (!format && looksLikeHtml (body) && body.includes ('__redoc_state'))) {
        doc = redocSpec (body);
        return { doc, format: 'openapi' };
    }
    if (looksLikeHtml (body)) {
        throw new Error ('got an HTML page, not a spec document (set "specFormat": "redoc" for Redoc pages)');
    }
    try {
        doc = JSON.parse (body);
    } catch {
        try {
            doc = parseYaml (body, { maxAliasCount: 1000 });
        } catch (e) {
            throw new Error (`neither JSON nor YAML: ${(e as Error).message.split ('\n')[0]}`);
        }
    }
    const detected = detectFormat (doc);
    const chosen = format ?? detected;
    if (!chosen) {
        throw new Error ('unknown document format (not OpenAPI/Swagger, Postman v2 or AsyncAPI)');
    }
    return { doc, format: chosen as Exclude<SpecFormat, 'redoc'> };
}

// ---------------------------------------------------------------------------
// normalization
// ---------------------------------------------------------------------------

// Local "$ref": "#/components/schemas/X" (JSON pointer); external refs stay unresolved.
function makeDeref (root: unknown): (v: unknown) => unknown {
    return (v: unknown) => {
        let cur = v;
        for (let hops = 0; hops < MAX_REF_HOPS && isObj (cur) && typeof cur['$ref'] === 'string'; hops++) {
            const ref = cur['$ref'] as string;
            if (!ref.startsWith ('#/')) {
                return cur;
            }
            let target: unknown = root;
            for (const raw of ref.slice (2).split ('/')) {
                const key = decodeURIComponent (raw).replace (/~1/g, '/').replace (/~0/g, '~');
                target = isObj (target) ? target[key] : (Array.isArray (target) ? target[Number (key)] : undefined);
            }
            if (target === undefined) {
                return cur;
            }
            cur = target;
        }
        return cur;
    };
}

function cleanName (name: unknown): string {
    return String (name ?? '').replace (/[\s(),[\]]+/g, '_').replace (/^_+|_+$/g, '');
}

function sortedUnique (names: Iterable<string>): string[] {
    return [ ...new Set ([ ...names ].map (cleanName).filter (Boolean)) ].sort ();
}

// Top-level property names of a (request body) schema: allOf/oneOf/anyOf merged, arrays of
// objects use their item properties.
function schemaProps (schema: unknown, deref: (v: unknown) => unknown, depth = 0): string[] {
    const s = deref (schema);
    if (!isObj (s) || depth > 6) {
        return [];
    }
    const out: string[] = [];
    if (isObj (s['properties'])) {
        out.push (...Object.keys (s['properties']));
    }
    for (const k of [ 'allOf', 'oneOf', 'anyOf' ]) {
        for (const sub of arr (s[k])) {
            out.push (...schemaProps (sub, deref, depth + 1));
        }
    }
    if (s['type'] === 'array' && s['items'] !== undefined) {
        out.push (...schemaProps (s['items'], deref, depth + 1));
    }
    return out;
}

function normalizePath (path: string): string {
    const p = path.trim ().replace (/\s+/g, '');
    return p.startsWith ('/') ? p : '/' + p;
}

export function openapiOperations (doc: unknown): Operation[] {
    if (!isObj (doc) || !isObj (doc['paths'])) {
        return [];
    }
    const deref = makeDeref (doc);
    const ops: Operation[] = [];
    for (const [ path, rawItem ] of Object.entries (doc['paths'] as Obj)) {
        const item = deref (rawItem);
        if (!isObj (item)) {
            continue;
        }
        const shared = arr (item['parameters']);
        for (const method of HTTP_METHODS) {
            const op = deref (item[method]);
            if (!isObj (op)) {
                continue;
            }
            const params: string[] = [];
            for (const rawParam of [ ...shared, ...arr (op['parameters']) ]) {
                const p = deref (rawParam);
                if (!isObj (p)) {
                    continue;
                }
                if (p['in'] === 'query' || p['in'] === 'path' || p['in'] === 'formData') {
                    params.push (String (p['name'] ?? ''));
                } else if (p['in'] === 'body') {
                    params.push (...schemaProps (p['schema'], deref));
                }
            }
            const rb = deref (op['requestBody']);
            if (isObj (rb) && isObj (rb['content'])) {
                for (const media of Object.values (rb['content'] as Obj)) {
                    if (isObj (media)) {
                        params.push (...schemaProps (media['schema'], deref));
                    }
                }
            }
            ops.push ({ key: `${method.toUpperCase ()} ${normalizePath (path)}`, params: sortedUnique (params), deprecated: op['deprecated'] === true });
        }
    }
    return ops;
}

// Postman url: "{{baseUrl}}/api/v1/x?a=1" or { raw, path: ["api", ":id"], query: [{ key }], variable: [{ key }] }
function postmanPath (url: unknown): string {
    let path: string;
    if (isObj (url) && Array.isArray (url['path'])) {
        path = '/' + url['path'].map ((seg) => (isObj (seg) ? String (seg['value'] ?? '') : String (seg))).join ('/');
    } else {
        let raw = isObj (url) ? String (url['raw'] ?? '') : String (url ?? '');
        raw = raw.split ('?')[0].split ('#')[0];
        raw = raw.replace (/^[a-z][a-z0-9+.-]*:\/\/[^/]*/i, '').replace (/^\{\{[^}]*\}\}/, '');
        path = raw;
    }
    // ":id" path variables -> "{id}" (OpenAPI style)
    return normalizePath (path.replace (/(^|\/):([A-Za-z_][\w-]*)/g, '$1{$2}'));
}

function postmanBodyKeys (body: unknown): string[] {
    if (!isObj (body)) {
        return [];
    }
    const mode = body['mode'];
    if (mode === 'urlencoded' || mode === 'formdata') {
        return arr (body[mode]).filter (isObj).map ((p) => String (p['key'] ?? ''));
    }
    if (mode === 'raw' && typeof body['raw'] === 'string') {
        // {{placeholders}} inside raw JSON bodies: quoted ones stay strings, bare ones become 0
        const text = body['raw'].replace (/"\{\{[^}]*\}\}"/g, '""').replace (/\{\{[^}]*\}\}/g, '0');
        try {
            const parsed = JSON.parse (text) as unknown;
            const first = Array.isArray (parsed) ? parsed[0] : parsed;
            return isObj (first) ? Object.keys (first) : [];
        } catch {
            return [];
        }
    }
    return [];
}

export function postmanOperations (doc: unknown): Operation[] {
    const ops: Operation[] = [];
    const walk = (items: unknown[], depth: number) => {
        if (depth > 20) {
            return;
        }
        for (const it of items) {
            if (!isObj (it)) {
                continue;
            }
            if (Array.isArray (it['item'])) {
                walk (it['item'], depth + 1);
                continue;
            }
            const req = it['request'];
            if (req === undefined) {
                continue;
            }
            const request: Obj = typeof req === 'string' ? { url: req } : (isObj (req) ? req : {});
            // published collections carry a string url plus the parsed `urlObject`
            const url = isObj (request['urlObject']) ? request['urlObject'] : request['url'];
            const params: string[] = [];
            if (isObj (url)) {
                params.push (...arr (url['query']).filter (isObj).map ((q) => String (q['key'] ?? '')));
                params.push (...arr (url['variable']).filter (isObj).map ((q) => String (q['key'] ?? '')));
            } else if (typeof url === 'string' && url.includes ('?')) {
                params.push (...url.split ('?')[1].split ('&').map ((kv) => decodeURIComponent (kv.split ('=')[0])));
            }
            params.push (...postmanBodyKeys (request['body']));
            const method = String (request['method'] ?? 'GET').toUpperCase ();
            ops.push ({ key: `${method} ${postmanPath (url)}`, params: sortedUnique (params), deprecated: false });
        }
    };
    walk (isObj (doc) ? arr (doc['item']) : [], 0);
    return ops;
}

// AsyncAPI 2: channels { name: { parameters, subscribe/publish: { message } } };
// AsyncAPI 3: channels { id: { address, parameters, messages } }.
export function asyncapiOperations (doc: unknown): Operation[] {
    if (!isObj (doc) || !isObj (doc['channels'])) {
        return [];
    }
    const deref = makeDeref (doc);
    const ops: Operation[] = [];
    const messageNames = (m: unknown): string[] => {
        const msg = deref (m);
        if (!isObj (msg)) {
            return [];
        }
        if (Array.isArray (msg['oneOf'])) {
            return msg['oneOf'].flatMap (messageNames);
        }
        const name = msg['name'] ?? msg['messageId'] ?? (isObj (m) && typeof m['$ref'] === 'string' ? String (m['$ref']).split ('/').pop () : undefined);
        return name ? [ String (name) ] : [];
    };
    for (const [ id, rawChannel ] of Object.entries (doc['channels'] as Obj)) {
        const ch = deref (rawChannel);
        if (!isObj (ch)) {
            continue;
        }
        const name = typeof ch['address'] === 'string' && ch['address'] ? ch['address'] : id;
        const params: string[] = isObj (ch['parameters']) ? Object.keys (ch['parameters']) : [];
        for (const k of [ 'subscribe', 'publish' ]) {
            const op = ch[k];
            if (isObj (op)) {
                params.push (...messageNames (op['message']));
            }
        }
        if (isObj (ch['messages'])) {
            params.push (...Object.keys (ch['messages']));
        }
        const deprecated = ch['deprecated'] === true;
        ops.push ({ key: `CHANNEL ${String (name).replace (/\s+/g, '_')}`, params: sortedUnique (params), deprecated });
    }
    return ops;
}

export function specOperations (doc: unknown, format: Exclude<SpecFormat, 'redoc'>): Operation[] {
    const ops = format === 'postman' ? postmanOperations (doc) : (format === 'asyncapi' ? asyncapiOperations (doc) : openapiOperations (doc));
    // duplicate keys (Postman folders repeating a request): merge their parameters
    const byKey = new Map<string, Operation> ();
    for (const op of ops) {
        const prev = byKey.get (op.key);
        byKey.set (op.key, prev ? { key: op.key, params: sortedUnique ([ ...prev.params, ...op.params ]), deprecated: prev.deprecated && op.deprecated } : op);
    }
    return [ ...byKey.values () ].sort ((a, b) => (a.key < b.key ? -1 : (a.key > b.key ? 1 : 0)));
}

// ---------------------------------------------------------------------------
// snapshot text <-> operations
// ---------------------------------------------------------------------------

export function formatOperation (op: Operation): string {
    return op.key + (op.params.length ? ` (${op.params.join (', ')})` : '') + (op.deprecated ? ' [deprecated]' : '');
}

export function formatOperations (ops: Operation[]): string {
    return ops.map (formatOperation).join ('\n');
}

const LINE = /^(\S+) (\S+)(?: \(([^()]*)\))?( \[deprecated\])?$/;

export function parseSnapshot (text: string): Map<string, Operation> {
    const out = new Map<string, Operation> ();
    for (const line of text.split ('\n')) {
        const m = LINE.exec (line.trim ());
        if (!m) {
            continue;
        }
        const key = `${m[1]} ${m[2]}`;
        out.set (key, { key, params: m[3] ? m[3].split (', ').filter (Boolean) : [], deprecated: Boolean (m[4]) });
    }
    return out;
}

// ---------------------------------------------------------------------------
// diff -> entries
// ---------------------------------------------------------------------------

export interface SpecChange {
    kind: 'added' | 'removed' | 'params' | 'deprecated';
    key: string;
    title: string;
    detail: string;
    tags: string[];
}

function isChannel (key: string): boolean {
    return key.startsWith ('CHANNEL ');
}

function shortKey (key: string): string {
    return isChannel (key) ? key.slice ('CHANNEL '.length) : key;
}

export function diffOperations (previous: Map<string, Operation>, current: Operation[]): SpecChange[] {
    const changes: SpecChange[] = [];
    const now = new Map (current.map ((op) => [ op.key, op ]));
    for (const op of current) {
        const ch = isChannel (op.key);
        const noun = ch ? 'Channel' : 'Endpoint';
        const ws = ch ? [ 'websocket' ] : [];
        const prev = previous.get (op.key);
        if (!prev) {
            changes.push ({
                kind: 'added',
                key: op.key,
                title: `${noun} added: ${shortKey (op.key)}`,
                detail: op.params.length ? `${ch ? 'Parameters and messages' : 'Parameters'}: ${op.params.join (', ')}` : 'No parameters.',
                tags: [ 'new-endpoint', ...ws ],
            });
            continue;
        }
        const plus = op.params.filter ((p) => !prev.params.includes (p));
        const minus = prev.params.filter ((p) => !op.params.includes (p));
        if (plus.length || minus.length) {
            const delta = [ ...plus.map ((p) => '+' + p), ...minus.map ((p) => '-' + p) ].join (', ');
            changes.push ({
                kind: 'params',
                key: op.key,
                title: `${ch ? 'Channel changed' : 'Parameters changed'}: ${shortKey (op.key)} (${delta})`,
                detail: [ plus.length ? `Added: ${plus.join (', ')}` : '', minus.length ? `Removed: ${minus.join (', ')}` : '' ].filter (Boolean).join ('\n'),
                tags: [ 'param-change', ...ws ],
            });
        }
        if (op.deprecated && !prev.deprecated) {
            changes.push ({ kind: 'deprecated', key: op.key, title: `${noun} deprecated: ${shortKey (op.key)}`, detail: 'Marked as deprecated in the API specification.', tags: [ 'deprecation', ...ws ] });
        }
    }
    for (const prev of previous.values ()) {
        if (!now.has (prev.key)) {
            const ch = isChannel (prev.key);
            changes.push ({
                kind: 'removed',
                key: prev.key,
                title: `${ch ? 'Channel' : 'Endpoint'} removed: ${shortKey (prev.key)}`,
                detail: 'Not in the API specification anymore.',
                tags: [ 'breaking', ...(ch ? [ 'websocket' ] : []) ],
            });
        }
    }
    const order = { removed: 0, deprecated: 1, params: 2, added: 3 };
    return changes.sort ((a, b) => order[a.kind] - order[b.kind] || (a.key < b.key ? -1 : (a.key > b.key ? 1 : 0)));
}

export function changeEntries (changes: SpecChange[], snapshot: string): ParsedEntry[] {
    if (!changes.length) {
        return [];
    }
    const run = sha256 (snapshot).slice (0, 16);
    if (changes.length <= MAX_SEPARATE) {
        return changes.map ((c) => ({ title: c.title, body: c.detail, guid: `spec:${run}:${sha256 (c.title).slice (0, 16)}`, tags: c.tags }));
    }
    const count = (k: SpecChange['kind']) => changes.filter ((c) => c.kind === k).length;
    const parts = [
        [ count ('added'), 'added' ], [ count ('removed'), 'removed' ], [ count ('params'), 'with parameter changes' ], [ count ('deprecated'), 'deprecated' ],
    ].filter (([ n ]) => (n as number) > 0).map (([ n, label ]) => `${n} ${label}`);
    const noun = changes.every ((c) => isChannel (c.key)) ? 'channel' : 'endpoint';
    const listed = changes.slice (0, MAX_LISTED_CHANGES).map ((c) => '- ' + c.title);
    if (changes.length > MAX_LISTED_CHANGES) {
        listed.push (`- … and ${changes.length - MAX_LISTED_CHANGES} more`);
    }
    return [ {
        title: `${changes.length} ${noun} changes: ${parts.join (', ')}`,
        body: listed.join ('\n'),
        guid: `spec:${run}:all`,
        tags: [ ...new Set (changes.flatMap ((c) => c.tags)) ].sort (),
    } ];
}

// ---------------------------------------------------------------------------
// adapter
// ---------------------------------------------------------------------------

export function specSnapshot (source: SourceConfig, body: string): string {
    const { doc, format } = loadSpec (body, source.specFormat);
    const ops = specOperations (doc, format);
    if (!ops.length) {
        throw new Error (`no operations found in the ${format} document`);
    }
    return formatOperations (ops);
}

export const spec: Adapter = ({ source, body, previousSnapshot }) => {
    const snapshot = specSnapshot (source, body);
    if (previousSnapshot === null) {
        return { entries: [], snapshot };
    }
    const previous = parseSnapshot (previousSnapshot);
    const current = [ ...parseSnapshot (snapshot).values () ];
    if (previous.size >= 10 && current.length < previous.size * 0.5) {
        throw new Error (`spec drift: ${current.length} operations, the previous snapshot had ${previous.size} (>50% fewer)`);
    }
    return { entries: changeEntries (diffOperations (previous, current), snapshot), snapshot };
};
