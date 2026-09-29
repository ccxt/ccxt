// Struct return types for the C# row builders (parseTicker / safeTicker / ...).
//
// Post-print text pass over every generated C# file (run from csharpTupleReturns, the funnel
// every C# write goes through). For each struct in CSHARP_STRUCT_RETURN_TYPES it
//   1. retypes EVERY declaration of the listed names (overrides are invariant: CS0508);
//   2. makes their returns the struct: a call of a same-struct name / a retyped local is an
//      identity, anything else is built with the struct constructor (`new ccxt.T(expr)`);
//   3. rewrites the call sites: the `ToT(call)` funnel becomes the call, a local initialised by
//      the call becomes a struct local when every use is provable (literal field read/write,
//      identity), every other use is boxed back with `FromT(x)`; any other call position is
//      boxed at the call (`FromT(call)`), so untyped helpers never see a boxed struct.
// Anything the pass cannot prove keeps the map (fail closed).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// struct -> { names, kind }. kind 'one': the method returns one row (T);
// kind 'map': it returns symbol -> row (Dictionary<string, T>), `row` names the row struct;
// kind 'list': it returns rows (List<T>, declared IList<object>), built with ToTList / boxed with FromTList.
// HOWTO add a type: see research NOTES ("HOWTO add a type"); names are all-or-nothing.
export const CSHARP_STRUCT_RETURN_TYPES = {
    'Ticker': { 'kind': 'one', 'names': [ 'parseTicker', 'parseWSTicker', 'parseWsTicker', 'safeTicker' ] },
    'Tickers': { 'kind': 'map', 'row': 'Ticker', 'names': [ 'parseTickers' ] },
    // REST books only; ws books (ccxt.pro.OrderBook classes in this.orderbooks) are boxed at the boundary
    'OrderBook': { 'kind': 'one', 'names': [ 'parseOrderBook' ] },
    // --- Trade (unit trade) ---
    'Trade': { 'kind': 'one', 'names': [ 'parseTrade', 'parseWsTrade', 'safeTrade' ] },
    'Trades': { 'kind': 'list', 'row': 'Trade', 'names': [ 'parseTrades' ] },
    // --- end Trade ---
    'Order': { 'kind': 'one', 'names': [ 'parseOrder', 'parseWsOrder', 'safeOrder' ] },
    'Orders': { 'kind': 'list', 'row': 'Order', 'names': [ 'parseOrders' ] },
};

const TYPES_FILE = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt', 'base', 'Exchange.Types.cs');
let structFieldsCache;
// field name -> C# type, read from the struct declaration the compiler sees
function structFields (name) {
    if (structFieldsCache === undefined) {
        structFieldsCache = {};
        let text = '';
        try {
            text = fs.readFileSync (TYPES_FILE, 'utf8');
        } catch (e) {
            text = '';
        }
        const re = /\npublic struct (\w+)\s*\n\{\n([\s\S]*?)\n\}(?=\n)/g;
        let m;
        while ((m = re.exec (text)) !== null) {
            const fields = {};
            for (const line of m[2].split ('\n')) {
                const f = /^    public ([\w<>?,. ]+?) (@?\w+);$/.exec (line);
                if (f !== null && !f[1].startsWith ('static')) {
                    fields[f[2]] = f[1];
                }
            }
            structFieldsCache[m[1]] = fields;
        }
    }
    return structFieldsCache[name] || {};
}

// scalar field write conversion (same Safe* the struct constructor applies to the key)
const FIELD_CONVERTERS = {
    'string?': 'StructString', 'string': 'StructString',
    'Int64?': 'StructInt64', 'double?': 'StructDouble', 'bool?': 'StructBool',
};

const NAME_TO_STRUCT = new Map ();
for (const [ struct, spec ] of Object.entries (CSHARP_STRUCT_RETURN_TYPES)) {
    for (const name of spec.names) {
        NAME_TO_STRUCT.set (name, struct);
    }
}
const NAMES_RE = new RegExp ('\\b(?:' + [ ...NAME_TO_STRUCT.keys () ].sort ((a, b) => b.length - a.length).join ('|') + ')\\(');

function structTypeName (struct) {
    const spec = CSHARP_STRUCT_RETURN_TYPES[struct];
    if (spec.kind === 'list') return 'List<ccxt.' + spec.row + '>';
    return (spec.kind === 'map') ? 'Dictionary<string, ccxt.' + spec.row + '>' : 'ccxt.' + struct;
}
function boxFunction (struct) {
    const spec = CSHARP_STRUCT_RETURN_TYPES[struct];
    if (spec.kind === 'list') return 'ccxt.BaseExchange.From' + spec.row + 'List';
    return 'ccxt.BaseExchange.' + ((spec.kind === 'map') ? 'From' + spec.row + 'Map' : 'From' + struct);
}

// the untyped declaration the pass rewrites, and the typed-core funnel it drops at call sites
function untypedDeclType (struct) {
    return (CSHARP_STRUCT_RETURN_TYPES[struct].kind === 'list') ? 'IList<object>' : 'Dictionary<string, object>';
}
function funnelFunction (struct) {
    const spec = CSHARP_STRUCT_RETURN_TYPES[struct];
    return 'ccxt.BaseExchange.To' + ((spec.kind === 'list') ? spec.row + 'List' : struct) + '(';
}

// code mask: true for chars outside string/char literals and comments
function codeMask (s) {
    const mask = new Uint8Array (s.length);
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === '/' && s[i + 1] === '/') {
            while (i < s.length && s[i] !== '\n') i++;
            continue;
        }
        if (c === '/' && s[i + 1] === '*') {
            const end = s.indexOf ('*/', i + 2);
            i = (end < 0) ? s.length : end + 2;
            continue;
        }
        if (c === '@' && s[i + 1] === '"') {
            i += 2;
            while (i < s.length) {
                if (s[i] === '"' && s[i + 1] === '"') { i += 2; continue; }
                if (s[i] === '"') { i++; break; }
                i++;
            }
            continue;
        }
        if (c === '"' || c === '\'') {
            i++;
            while (i < s.length && s[i] !== c && s[i] !== '\n') {
                if (s[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }
        mask[i] = 1;
        i++;
    }
    return mask;
}

function matchClose (s, mask, open) {
    const pairs = { '(': ')', '[': ']', '{': '}' };
    const want = pairs[s[open]];
    let depth = 0;
    for (let i = open; i < s.length; i++) {
        if (!mask[i]) continue;
        const c = s[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) {
                return (c === want) ? i : -1;
            }
        }
    }
    return -1;
}

// end (index of `;`) of the statement containing pos, at bracket depth 0 relative to pos
function statementEnd (s, mask, pos) {
    let depth = 0;
    for (let i = pos; i < s.length; i++) {
        if (!mask[i]) continue;
        const c = s[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth < 0) return -1;
        } else if (c === ';' && depth === 0) return i;
    }
    return -1;
}

class StructFail extends Error {}

// methods: [{ header start, name, returnType, bodyOpen, bodyClose }]
const METHOD_RE = /^([ \t]*)((?:(?:public|private|protected|internal|static|virtual|override|async|new|sealed)\s+)+)([\w<>?,. ()]+?) (\w+)\(/gm;
function findMethods (s, mask) {
    const methods = [];
    METHOD_RE.lastIndex = 0;
    let m;
    while ((m = METHOD_RE.exec (s)) !== null) {
        if (!mask[m.index + m[1].length]) continue;
        const parenOpen = m.index + m[0].length - 1;
        const parenClose = matchClose (s, mask, parenOpen);
        if (parenClose < 0) continue;
        let j = parenClose + 1;
        while (j < s.length && /\s/.test (s[j])) j++;
        if (s[j] !== '{') continue; // abstract / expression-bodied / delegate
        const bodyClose = matchClose (s, mask, j);
        if (bodyClose < 0) continue;
        methods.push ({ 'start': m.index, 'typeStart': m.index + m[1].length + m[2].length, 'returnType': m[3], 'name': m[4], 'bodyOpen': j, 'bodyClose': bodyClose });
        METHOD_RE.lastIndex = j + 1;
    }
    return methods;
}

const CALL_RE = /(?<![\w.])(this|base|exchange)\.(\w+)\(/g;
const IDENT = (name) => new RegExp ('(?<![\\w.@])' + name + '(?!\\w)', 'g');

function stripCastWrap (s, a, b) {
    // `((T)((object)(E)))` -> E span (identity boundary casts the collection-returns hook adds)
    const text = s.slice (a, b);
    const m = /^\(\((?:I?Dictionary<string, object>)\)\(\(object\)\(/.exec (text);
    if (m !== null && text.endsWith (')))')) {
        return [ a + m[0].length, b - 3 ];
    }
    return [ a, b ];
}

function processMethod (s, mask, method, edits, stats, file) {
    const ownStruct = NAME_TO_STRUCT.get (method.name);
    const body0 = method.bodyOpen + 1;
    const body1 = method.bodyClose;
    const locals = new Map (); // name -> { struct, declTypeSpan, init:[a,b], declPos, scopeEnd }
    const calls = [];
    CALL_RE.lastIndex = body0;
    let m;
    while ((m = CALL_RE.exec (s)) !== null && m.index < body1) {
        if (!mask[m.index] || !NAME_TO_STRUCT.has (m[2])) continue;
        const open = m.index + m[0].length - 1;
        const close = matchClose (s, mask, open);
        if (close < 0) throw new StructFail ('unbalanced call ' + m[2]);
        calls.push ({ 'a': m.index, 'b': close + 1, 'struct': NAME_TO_STRUCT.get (m[2]) });
    }
    const handled = new Set ();
    for (const call of calls) {
        const spec = CSHARP_STRUCT_RETURN_TYPES[call.struct];
        const before = s.slice (Math.max (body0, call.a - 200), call.a);
        const after = s.slice (call.b, call.b + 3);
        // already rewritten (a second pass over the same text): leave it
        if (before.endsWith (boxFunction (call.struct) + '(') || new RegExp ('(^|\\n)[ \\t]*' + structTypeName (call.struct).replace (/[.<>]/g, '\\$&') + ' \\w+ = $').test (before)) {
            handled.add (call);
            continue;
        }
        // funnel `ccxt.BaseExchange.ToT(call)` -> call
        const funnel = funnelFunction (call.struct);
        if (before.endsWith (funnel) && after.startsWith (')')) {
            if (spec.kind !== 'map') {
                edits.push ([ call.a - funnel.length, call.a, '' ], [ call.b, call.b + 1, '' ]);
            } // map: the typed ToTickers(Dictionary<string, Ticker>) overload binds
            stats.funnels++;
            handled.add (call);
            continue;
        }
        // `return call;` in a same-struct method: identity
        if (/\breturn\s+$/.test (before) && after.startsWith (';') && ownStruct === call.struct) {
            handled.add (call);
            continue;
        }
        // `Dictionary<string, object> X = call;` candidate struct local (row kind only)
        const decl = /(^|\n)([ \t]*)(I?Dictionary<string, object>) (\w+) = $/.exec (before);
        if (decl !== null && after.startsWith (';') && spec.kind === 'one') {
            const typeStart = call.a - decl[0].length + decl[1].length + decl[2].length;
            // scope: the enclosing block of the declaration
            let depth = 0; let scopeEnd = body1;
            for (let i = call.b; i < body1; i++) {
                if (!mask[i]) continue;
                if (s[i] === '{') depth++;
                else if (s[i] === '}') { if (depth === 0) { scopeEnd = i; break; } depth--; }
            }
            if (!locals.has (decl[4])) {
                locals.set (decl[4], { 'struct': call.struct, 'typeSpan': [ typeStart, typeStart + decl[3].length ], 'call': call, 'declEnd': call.b + 1, 'scopeEnd': scopeEnd, 'reassigns': [] });
                handled.add (call);
                continue;
            }
        }
        call.pending = true;
    }
    // reassignments `X = call;` of a candidate
    for (const call of calls) {
        if (!call.pending) continue;
        const before = s.slice (Math.max (body0, call.a - 120), call.a);
        const as = /(^|\n)[ \t]*(\w+) = $/.exec (before);
        const local = (as !== null) ? locals.get (as[2]) : undefined;
        if (local !== undefined && local.struct === call.struct && s[call.b] === ';' && call.a > local.declEnd && call.a < local.scopeEnd) {
            local.reassigns.push ({ 'call': call, 'targetStart': call.a - as[0].length + as[1].length });
            call.pending = false;
            continue;
        }
    }
    for (const [ name, local ] of locals) {
        const plan = planLocal (s, mask, name, local, ownStruct, method, file);
        if (plan === undefined) {
            // fail closed: the local stays a map, its initialiser (and reassignments) boxed
            stats.localsKept++;
            for (const call of [ local.call, ...local.reassigns.map ((r) => r.call) ]) {
                edits.push ([ call.a, call.a, boxFunction (local.struct) + '(' ], [ call.b, call.b, ')' ]);
                stats.boxedCalls++;
            }
            continue;
        }
        stats.localsTyped++;
        edits.push ([ local.typeSpan[0], local.typeSpan[1], structTypeName (local.struct) ]);
        for (const e of plan) edits.push (e);
        stats.sites += plan.length;
    }
    // returns of this method (own struct): identity or constructor
    if (ownStruct !== undefined) {
        const typed = new Set ([ ...locals.entries () ].filter (([ , l ]) => l.typed).map (([ n ]) => n));
        const RET = /(?<![\w.])return\b\s*/g;
        RET.lastIndex = body0;
        let r;
        while ((r = RET.exec (s)) !== null && r.index < body1) {
            if (!mask[r.index]) continue;
            if (insideNestedFunction (s, mask, body0, r.index)) continue;
            const a = r.index + r[0].length;
            if (s[a] === ';') continue;
            const end = statementEnd (s, mask, a);
            if (end < 0) throw new StructFail ('return without end in ' + method.name);
            const expr = s.slice (a, end);
            const callM = /^(?:this|base)\.(\w+)\(/.exec (expr);
            if (callM !== null && NAME_TO_STRUCT.get (callM[1]) === ownStruct && matchClose (s, mask, a + callM[0].length - 1) === end - 1) {
                continue;
            }
            if (/^\w+$/.test (expr) && typed.has (expr) && locals.get (expr).struct === ownStruct) {
                continue;
            }
            if (expr === 'null') {
                throw new StructFail ('return null in ' + method.name);
            }
            const [ ea, eb ] = stripCastWrap (s, a, end);
            const spec = CSHARP_STRUCT_RETURN_TYPES[ownStruct];
            if (ea !== a) edits.push ([ a, ea, '' ], [ eb, end, '' ]);
            if (spec.kind === 'list') {
                edits.push ([ a, a, 'ccxt.BaseExchange.To' + spec.row + 'List(' ], [ end, end, ')' ]);
            } else if (spec.kind === 'map') {
                edits.push ([ a, a, 'new ccxt.' + ownStruct + '(' ], [ end, end, ').' + mapFieldOf (ownStruct) ]);
            } else {
                edits.push ([ a, a, 'new ccxt.' + ownStruct + '(' ], [ end, end, ')' ]);
            }
            stats.ctorReturns++;
        }
    }
    // every other call position: box at the call
    for (const call of calls) {
        if (!call.pending) continue;
        edits.push ([ call.a, call.a, boxFunction (call.struct) + '(' ], [ call.b, call.b, ')' ]);
        stats.boxedCalls++;
    }
}

function mapFieldOf (struct) {
    // wrapper struct: the Dictionary<string, Row> field
    const fields = structFields (struct);
    for (const [ f, t ] of Object.entries (fields)) {
        if (t.startsWith ('Dictionary<string, ') && t !== 'Dictionary<string, object>') return f;
    }
    throw new StructFail ('no row map on ' + struct);
}

function insideNestedFunction (s, mask, body0, pos) {
    // a `=>` lambda or delegate between the method body start and pos at a shallower brace
    const text = s.slice (body0, pos);
    return /=>\s*\{[^}]*$/.test (text) || /delegate\s*\(/.test (text.slice (-400));
}

// untyped read of a field: nested structs go back through their From* funnel (map rows)
const NESTED_FIELD_FUNNELS = { 'Fee?': 'FromFee', 'List<Fee>?': 'FromFeeList' };
function fieldRead (name, field, type) {
    const f = NESTED_FIELD_FUNNELS[type];
    return (f === undefined) ? '((object)' + name + '.' + field + ')' : 'ccxt.BaseExchange.' + f + '((object)' + name + '.' + field + ')';
}

// every occurrence of the local in its scope -> list of edits, or undefined (fail closed)
function planLocal (s, mask, name, local, ownStruct, method, file) {
    const struct = local.struct;
    const fields = structFields (struct);
    const box = boxFunction (struct);
    const edits = [];
    const a0 = local.declEnd;
    const a1 = local.scopeEnd;
    const reassignStarts = new Set (local.reassigns.map ((r) => r.targetStart));
    let firstBox = Infinity;
    let lastWrite = -1;
    let hasWrite = false;
    const re = IDENT (name);
    re.lastIndex = a0;
    let m;
    const consumed = [];
    while ((m = re.exec (s)) !== null && m.index < a1) {
        const p = m.index;
        if (!mask[p] || consumed.some (([ x, y ]) => p >= x && p < y)) continue;
        if (reassignStarts.has (p)) continue;
        const tail = s.slice (p, p + 200);
        const head = s.slice (Math.max (a0, p - 200), p);
        let t;
        // ternary field read `(X != null && X.ContainsKey("k") ? X["k"] : null)` / without the null check
        if ((t = new RegExp ('^' + name + ' != null && ' + name + '\\.ContainsKey\\("(\\w+)"\\) \\? ' + name + '\\["\\1"\\] : null').exec (tail)) !== null
            || (t = new RegExp ('^' + name + '\\.ContainsKey\\("(\\w+)"\\) \\? ' + name + '\\["\\1"\\] : null').exec (tail)) !== null) {
            if (!(t[1] in fields)) return undefined;
            // `((string)(TERN))` on a string field is the field itself
            if (head.endsWith ('((string)(') && s.slice (p + t[0].length, p + t[0].length + 2) === '))' && /^string\??$/.test (fields[t[1]])) {
                edits.push ([ p - 10, p + t[0].length + 2, name + '.' + t[1] ]);
                consumed.push ([ p, p + t[0].length + 2 ]);
                continue;
            }
            edits.push ([ p, p + t[0].length, fieldRead (name, t[1], fields[t[1]]) ]);
            consumed.push ([ p, p + t[0].length ]);
            continue;
        }
        // literal field write `X["k"] = v;`
        if ((t = new RegExp ('^' + name + '\\["(\\w+)"\\] = ').exec (tail)) !== null && /(^|\n)[ \t]*$/.test (head)) {
            const conv = FIELD_CONVERTERS[fields[t[1]]];
            if (conv === undefined) return undefined; // undeclared key (-> info), or a non-scalar field
            const end = statementEnd (s, mask, p + t[0].length);
            if (end < 0 || IDENT (name).test (s.slice (p + t[0].length, end))) return undefined;
            edits.push ([ p, p + t[0].length, name + '.' + t[1] + ' = ccxt.BaseExchange.' + conv + '(' ], [ end, end, ')' ]);
            consumed.push ([ p, end ]);
            hasWrite = true;
            lastWrite = p;
            continue;
        }
        // funnel identity `ccxt.BaseExchange.ToT(X)`
        const funnel = 'ccxt.BaseExchange.To' + struct + '(';
        if (head.endsWith (funnel) && s[p + name.length] === ')') {
            edits.push ([ p - funnel.length, p, '' ], [ p + name.length, p + name.length + 1, '' ]);
            continue;
        }
        // `return X;` in a same-struct method: identity
        if (/\breturn\s+$/.test (head) && s[p + name.length] === ';' && ownStruct === struct) {
            continue;
        }
        // any other write / by-ref use: fail closed
        if (/^\w+\s*(=[^=]|\+=|-=|\[)/.test (tail) || /\b(ref|out)\s+$/.test (head)) {
            return undefined;
        }
        // `this.safeString|safeInteger|safeNumber(X, "k")` on a field of that exact type: the field
        if ((t = new RegExp ('^' + name + ', "(\\w+)"\\)').exec (tail)) !== null) {
            const h = /this\.(safeString|safeInteger|safeNumber)\($/.exec (head);
            const want = { 'safeString': 'string?', 'safeInteger': 'Int64?', 'safeNumber': 'double?' };
            if (h !== null && fields[t[1]] === want[h[1]]) {
                edits.push ([ p - h[0].length, p + t[0].length, name + '.' + t[1] ]);
                consumed.push ([ p, p + t[0].length ]);
                continue;
            }
        }
        // literal key reads through a helper: the key must be a struct field (else it moved to info)
        if ((t = new RegExp ('^' + name + ', "(\\w+)"').exec (tail)) !== null && !(t[1] in fields)) {
            return undefined;
        }
        if (new RegExp ('^' + name + '\\.').test (tail) && !new RegExp ('^' + name + '\\.ContainsKey\\(').test (tail)) {
            return undefined; // member use of the map
        }
        edits.push ([ p, p, box + '(' ], [ p + name.length, p + name.length, ')' ]);
        firstBox = Math.min (firstBox, p);
    }
    // a write after a boxed use (or inside a loop around both) would miss the snapshot
    if (hasWrite && firstBox !== Infinity) {
        if (lastWrite > firstBox) return undefined;
        const span = s.slice (local.call.a, a1);
        if (/(?<![\w.])(for|foreach|while|do)\b/.test (span.slice (0, Math.max (0, firstBox - local.call.a)))) return undefined;
    }
    local.typed = true;
    return edits;
}

function applyEdits (s, edits) {
    edits.sort ((x, y) => (x[0] - y[0]) || (x[1] - y[1]));
    let out = '';
    let pos = 0;
    for (const [ a, b, text ] of edits) {
        if (a < pos) throw new StructFail ('overlapping edits at ' + a);
        out += s.slice (pos, a) + text;
        pos = b;
    }
    return out + s.slice (pos);
}

export const csharpStructReturnStats = { 'files': 0, 'decls': 0, 'funnels': 0, 'localsTyped': 0, 'localsKept': 0, 'sites': 0, 'ctorReturns': 0, 'boxedCalls': 0 };

export function csharpStructReturns (content, file = '') {
    if (typeof content !== 'string' || !NAMES_RE.test (content)) {
        return content;
    }
    const mask = codeMask (content);
    const methods = findMethods (content, mask);
    // idempotent: a file already rewritten (a second write of the same content) is left alone
    if (methods.some ((mth) => NAME_TO_STRUCT.has (mth.name) && mth.returnType === structTypeName (NAME_TO_STRUCT.get (mth.name)))) {
        return content;
    }
    const edits = [];
    const stats = csharpStructReturnStats;
    try {
        for (const method of methods) {
            const struct = NAME_TO_STRUCT.get (method.name);
            if (struct !== undefined) {
                if (method.returnType !== untypedDeclType (struct)) {
                    throw new StructFail (method.name + ' declares ' + method.returnType);
                }
                edits.push ([ method.typeStart, method.typeStart + method.returnType.length, structTypeName (struct) ]);
                stats.decls++;
            }
            processMethod (content, mask, method, edits, stats, file);
        }
    } catch (e) {
        if (e instanceof StructFail) {
            throw new Error ('csharpStructReturns: ' + file + ': ' + e.message);
        }
        throw e;
    }
    stats.files++;
    if (process.env.CSHARP_STRUCT_STATS) {
        fs.appendFileSync (process.env.CSHARP_STRUCT_STATS, file + '\t' + JSON.stringify (stats) + '\n');
    }
    return applyEdits (content, edits);
}
