// hx10 G08
// Tuple element reads read natively when the producer's own return paths prove what slot i holds.
//
// A `[]any` producer's slot is `plain` when every own return stores a derefScalar-invariant value
// (a bool/string/number literal, a scalar local, a non-nil map, a GetValue/Omit result): then
// `x := GetValue(h, i)` and `x := h[i]` carry the same box, nil included. A slot that can hold a
// pointer or a typed-nil map is `deref`: only a consumer that derefs its argument (MapTyped & co)
// may read `h[i]`. Everything else keeps the helper call.
//
// Producer resolution: the file's own definition first (an exchange override wins), then the base
// table below, whose evidence is the hand-written/generated BaseExchange body named per entry.

const HX10_G08_DEREF_CONSUMERS = [ 'MapTyped', 'ListTyped', 'SafeStringPtr', 'SafeBoolPtr', 'SafeIntegerPtr', 'SafeFloatPtr' ];

// BaseExchange producers read from venue files: arity + slot classes, evidence in the body named.
const HX10_G08_BASE_SLOTS = {
    // go/v4/exchange_generated.go: []any{true|false, params|paramsOmitted} (paramsOmitted via OmitDict)
    'HandlePostOnly': { 'arity': 2, 'slots': { 0: 'plain:bool', 1: 'plain:map' } },
    // go/v4/exchange_market_type.go slot 0/1: (string, map[string]any) pair, Read as TupleSlice(..)
    'HandleTypePostOnlyAndTimeInForce': { 'arity': 2, 'slots': { 0: 'plain:string', 1: 'plain:map' } },
    // kucoin-style []any{hf *bool, paramsOmitted map[string]any from OmitDict}: element 1 is a fresh map
    'HandleHfAndParams': { 'arity': 2, 'slots': { 1: 'plain:map' } },
    // go/v4 exchange bodies: []any{request|stock, params|query}, both fresh maps
    'HandleStockParams': { 'arity': 2, 'slots': { 1: 'deref:map' } },
    'HandleTriggerOptionAndParams': { 'arity': 2, 'slots': { 1: 'deref:map' } },
    'HandleTradingStatisticsWindow': { 'arity': 2, 'slots': { 1: 'plain:map' } },
    'HandleUntilOptionString': { 'arity': 2, 'slots': { 1: 'plain:map' } },
    // typed pair producers: slot 1 is a `map[string]any` result, never a pointer
    'HandleMarketTypeAndParams': { 'arity': 2, 'slots': { 1: 'plain:map' } },
    'HandleSubTypeAndParams': { 'arity': 2, 'slots': { 1: 'plain:map' } },
};

function hx10G08Mask (text) {
    const out = text.split ('');
    const n = text.length;
    let i = 0;
    while (i < n) {
        const c = text[i];
        if ((c === '/') && (text[i + 1] === '/')) {
            while ((i < n) && (text[i] !== '\n')) { out[i] = ' '; i += 1; }
        } else if ((c === '/') && (text[i + 1] === '*')) {
            while ((i < n) && !((text[i] === '*') && (text[i + 1] === '/'))) {
                if (text[i] !== '\n') { out[i] = ' '; }
                i += 1;
            }
            if (i + 1 < n) { out[i] = ' '; out[i + 1] = ' '; }
            i += 2;
        } else if ((c === '"') || (c === '\'')) {
            const quote = c;
            out[i] = ' '; i += 1;
            while (i < n) {
                if ((text[i] === '\\') && (i + 1 < n)) { out[i] = ' '; out[i + 1] = ' '; i += 2; continue; }
                if (text[i] === quote) { out[i] = ' '; i += 1; break; }
                if (text[i] !== '\n') { out[i] = ' '; }
                i += 1;
            }
        } else if (c === '`') {
            out[i] = ' '; i += 1;
            while ((i < n) && (text[i] !== '`')) { if (text[i] !== '\n') { out[i] = ' '; } i += 1; }
            if (i < n) { out[i] = ' '; i += 1; }
        } else {
            i += 1;
        }
    }
    return out.join ('');
}

// depth-1 blocks whose header is a top-level func, plus every block (for func literals and scopes)
function hx10G08Blocks (masked) {
    const blocks = [];
    const stack = [];
    let line = 0;
    for (let i = 0; i < masked.length; i++) {
        const c = masked[i];
        if (c === '\n') { line += 1; continue; }
        if (c === '{') { stack.push ({ 'open': line, 'depth': stack.length + 1, 'close': -1 }); continue; }
        if (c === '}') {
            const b = stack.pop ();
            if (b !== undefined) { b.close = line; blocks.push (b); }
        }
    }
    return blocks;
}

function hx10G08FuncAt (blocks, k) {
    let best;
    for (const b of blocks) {
        if ((b.depth === 1) && (b.open < k) && (k <= b.close) && ((best === undefined) || (b.open > best.open))) { best = b; }
    }
    return best;
}

function hx10G08SplitTop (masked, raw) {
    const out = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i <= masked.length; i++) {
        const c = masked[i];
        if ((i === masked.length) || ((c === ',') && (depth === 0))) {
            out.push ([ masked.substring (start, i).trim (), raw.substring (start, i).trim () ]);
            start = i + 1;
            continue;
        }
        depth += '({['.includes (c) ? 1 : (')}]'.includes (c) ? -1 : 0);
        if (depth < 0) { return undefined; }
    }
    return (depth === 0) ? out : undefined;
}

function hx10G08Balanced (masked, start) {
    let depth = 0;
    for (let i = start; i < masked.length; i++) {
        if ('({['.includes (masked[i])) { depth += 1; continue; }
        if (')}]'.includes (masked[i])) {
            depth -= 1;
            if (depth === 0) { return i; }
        }
    }
    return -1;
}

// every write of `name` in [from, to], including multi-assign targets and `name := ...`
function hx10G08WriteLines (mlines, from, to, name) {
    const out = [];
    const single = new RegExp ('^\\s*' + name + '\\s*(?::=|=)(?!=)');
    const typed = new RegExp ('^\\s*var ' + name + ' [\\w\\[\\].*]+\\s*=');
    const element = new RegExp ('^\\s*' + name + '\\s*\\[');
    const multi = new RegExp ('^(\\s*)([\\w\\[\\].]*(?:,\\s*[\\w\\[\\].]*)*)\\s*(?::=|=)(?!=)');
    for (let j = from; j <= to; j++) {
        const l = mlines[j];
        if (element.test (l)) {
            continue;
        }
        if (single.test (l) || typed.test (l)) {
            out.push (j);
            continue;
        }
        const m = multi.exec (l);
        if ((m !== null) && m[2].split (',').some ((p) => (p.trim () === name))) {
            out.push (j);
        }
    }
    return out;
}

function hx10G08DeclOf (mlines, from, to, name) {
    for (let j = from; j <= to; j++) {
        const l = mlines[j];
        const typed = new RegExp ('^\\s*var ' + name + ' ([\\w\\[\\].*]+)\\s*$').exec (l);
        if (typed !== null) { return { 'kind': 'var', 'type': typed[1], 'init': null, 'line': j }; }
        const init = new RegExp ('^\\s*var ' + name + ' ([\\w\\[\\].*]+) = (.*)$').exec (l);
        if (init !== null) { return { 'kind': 'var', 'type': init[1], 'init': init[2], 'line': j }; }
        const short = new RegExp ('^\\s*' + name + ' := (.*)$').exec (l);
        if (short !== null) { return { 'kind': 'short', 'type': undefined, 'init': short[1], 'line': j }; }
        const multi = /^\s*([\w\[\].]*(?:\s*,\s*[\w\[\].]*)+)\s*(?::=|=)(?!=)/.exec (l);
        if ((multi !== null) && multi[1].split (',').some ((p) => (p.trim () === name))) {
            return { 'kind': 'multi', 'type': undefined, 'init': null, 'line': j, 'index': multi[1].split (',').map ((p) => p.trim ()).indexOf (name) };
        }
    }
    return undefined;
}

// the class a call's own result carries: `any` producers of these helpers are derefScalar-invariant
function hx10G08CallClass (masked) {
    if (/^(?:ccxt\.)?(?:GetValue|GetArg|ParseToInt|ParseInt|SafeMapToMap)\(/.test (masked)) { return 'plain'; }
    if (/^(?:this\.|ccxt\.)?(?:OmitDict|Extend|DeepExtend)\(/.test (masked)) { return 'plain:map'; }
    // Omit family passes a non-map value through and never returns a typed-nil map
    if (/^(?:this\.)?(?:Omit|OmitN|OmitMap)\(/.test (masked)) { return 'plain'; }
    // MapTyped/SafeMapTyped answer a map[string]any, nil when absent
    if (/^(?:ccxt\.)?(?:MapTyped|SafeMapTyped)\(/.test (masked)) { return 'typedmap'; }
    if (/^GetArgMap\(/.test (masked)) { return 'typedmap'; }
    if (/^(?:ccxt\.)?ListTyped\(/.test (masked)) { return 'typedslice'; }
    if (/^(?:this\.)?SafeDict2?\(/.test (masked)) { return 'deref:map'; }
    return undefined;
}

// the weakest class every return path agrees on: any `no` wins, else a deref class covers a plain one
function hx10G08CombineClasses (classes) {
    if (classes.length === 0) { return 'no'; }
    if (classes.includes ('no')) { return 'no'; }
    const unique = [ ...new Set (classes) ];
    if (unique.length === 1) { return unique[0]; }
    const kind = (list) => (list.some ((c) => c.endsWith ('map')) ? 'map' : (list.some ((c) => c.endsWith ('slice')) ? 'slice' : ''));
    if (unique.every ((c) => c.startsWith ('plain'))) {
        return 'plain:' + kind (unique);
    }
    if (unique.every ((c) => c.startsWith ('plain') || (c === 'typedmap') || (c === 'typedslice'))) {
        return (kind (unique) === 'slice') ? 'typedslice' : 'typedmap';
    }
    return 'deref:' + kind (unique);
}

function hx10G08ClassOfExpr (ctx, fn, masked, raw, depth) {
    if (depth > 4) { return 'no'; }
    const m = masked.trim ();
    const r = raw.trim ();
    if (/^(?:true|false)$/.test (m)) { return 'plain:bool'; }
    if (/^-?\d+(?:\.\d+)?$/.test (m)) { return 'plain:number'; }
    if ((m === '') && /^"(?:[^"\\]|\\.)*"$/.test (r)) { return 'plain:string'; }
    if (/^map\[string\]any\{/.test (m)) { return 'plain:map'; }
    if (/^\[\](?:any|string)\{/.test (m)) { return 'plain'; }
    if (/^\[\](?:any|string)$/.test (m)) { return 'deref:slice'; }
    if (/^GetArgMap\(\w+, \d+, map\[string\]any\{\}\)$/.test (m)) { return 'plain:map'; }
    const call = hx10G08CallClass (m);
    if (call !== undefined) {
        // MapTyped of a proven non-nil map stays non-nil
        if ((call === 'deref:map') && /^(?:ccxt\.)?MapTyped\(/.test (m)) {
            const open = m.indexOf ('(');
            const close = hx10G08Balanced (m, open);
            if (close > 0) {
                const inner = hx10G08SplitTop (m.substring (open + 1, close), r.substring (open + 1, close));
                if ((inner !== undefined) && (inner.length === 1) && (hx10G08ClassOfExpr (ctx, fn, inner[0][0], inner[0][1], depth + 1) === 'plain:map')) {
                    return 'plain:map';
                }
            }
        }
        return call;
    }
    if (/^func\s*\(/.test (m)) { return 'no'; }
    if (/^[A-Za-z_]\w*$/.test (m)) {
        return hx10G08ClassOfIdent (ctx, fn, m, depth);
    }
    return 'no';
}

function hx10G08ClassOfIdent (ctx, fn, name, depth) {
    if (depth > 4) { return 'no'; }
    const decl = hx10G08DeclOf (ctx.mlines, fn.open + 1, fn.close, name);
    if (decl === undefined) { return 'no'; }
    if (decl.kind === 'multi') {
        return hx10G08ClassOfPairElement (ctx, fn, decl, name, depth);
    }
    if ((decl.kind === 'short') && (decl.init !== null)) {
        // a single write from a producer/expr carries that expression's class
        const writes = hx10G08WriteLines (ctx.mlines, fn.open + 1, fn.close, name);
        if (writes.length > 1) { return 'no'; }
        const maskedInit = decl.init;
        if (/^(?:this\.|ccxt\.)\w+\(/.test (maskedInit)) { return 'no'; }
        return hx10G08ClassOfExpr (ctx, fn, maskedInit, decl.init, depth + 1);
    }
    const type = decl.type ?? '';
    if (type === 'bool') { return 'plain:bool'; }
    if (type === 'string') { return 'plain:string'; }
    if ((type === 'int64') || (type === 'float64') || (type === 'int') || (type === 'uint64')) { return 'plain:number'; }
    if (type === 'any') {
        const writes = hx10G08WriteLines (ctx.mlines, fn.open + 1, fn.close, name);
        if (writes.length !== 1) { return 'no'; }
        if ((decl.init === null) || (decl.init === undefined)) { return 'no'; }
        if (decl.init.trim () === 'nil') { return 'deref'; }
        return hx10G08ClassOfExpr (ctx, fn, decl.init, decl.init, depth + 1);
    }
    if ((type === 'map[string]any') || (type === '[]any') || (type === '[]string')) {
        if ((decl.init !== null) && (decl.init !== undefined) && (decl.init.trim () !== 'nil')) {
            const init = hx10G08ClassOfExpr (ctx, fn, decl.init, decl.init, depth + 1);
            if (init.startsWith ('plain') && (hx10G08WriteLines (ctx.mlines, fn.open + 1, fn.close, name).length === 1)) {
                return init;
            }
        }
        return (type === 'map[string]any') ? 'typedmap' : 'typedslice';
    }
    return 'no';
}

// `a, params := this.HandleXAndParams(..)` — slot 1 of a pair producer is its map result
function hx10G08ClassOfPairElement (ctx, fn, decl, name, depth) {
    const m = /^(?:\s*)([\w\[\].]*(?:\s*,\s*[\w\[\].]*)+)\s*(?::=|=)(?!=)\s*(.*)$/.exec (ctx.mlines[decl.line]);
    if (m === null) { return 'no'; }
    const call = /^(?:ccxt\.)?(?:TupleSlice\()?this\.(\w+)\(/.exec (m[2]);
    if (call === null) { return 'no'; }
    const info = hx10G08Producer (ctx, call[1], depth + 1);
    if (info === undefined) { return 'no'; }
    return info.slots[decl.index] ?? 'no';
}

function hx10G08Producer (ctx, name, depth) {
    if (depth > 4) { return undefined; }
    ctx.producers = ctx.producers ?? new Map ();
    if (ctx.producers.has (name)) { return ctx.producers.get (name); }
    ctx.producers.set (name, undefined);
    const local = hx10G08LocalProducer (ctx, name, depth);
    const info = (local !== undefined) ? local : HX10_G08_BASE_SLOTS[name];
    ctx.producers.set (name, info);
    return info;
}

// { arity, slots } of a `[]any` producer (or typed pair) defined in this file, from every own return
function hx10G08LocalProducer (ctx, name, depth) {
    let info;
    for (const fn of ctx.functions) {
        const head = ctx.mlines[fn.open];
        const anyReturn = new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(.*\\) \\[\\]any \\{$').test (head);
        const pairReturn = new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(.*\\) \\(([^)]*)\\) \\{$').exec (head);
        if (!anyReturn && (pairReturn === null)) { continue; }
        const literals = ctx.blocks.filter ((b) => (b.depth > 1) && (b.open > fn.open) && (b.close <= fn.close) && /func\s*\(/.test (ctx.mlines[b.open]));
        const rows = [];
        let ok = true;
        for (let k = fn.open + 1; ok && (k < fn.close); k++) {
            if (!/^\s*return /.test (ctx.mlines[k]) || literals.some ((b) => (b.open <= k) && (k <= b.close))) { continue; }
            if (anyReturn) {
                const at = ctx.mlines[k].indexOf ('return []any{');
                if (at < 0) { ok = false; break; }
                const start = at + 'return []any{'.length - 1;
                const end = hx10G08Balanced (ctx.mlines[k], start);
                if (end < 0) { ok = false; break; }
                const parts = hx10G08SplitTop (ctx.mlines[k].substring (start + 1, end), ctx.lines[k].substring (start + 1, end));
                if (parts === undefined) { ok = false; break; }
                rows.push ({ 'line': k, 'parts': parts });
            }
        }
        if (!ok) { continue; }
        if (anyReturn) {
            if (rows.length === 0) { continue; }
            const arity = Math.min (...rows.map ((row) => row.parts.length));
            const slots = {};
            for (let i = 0; i < arity; i++) {
                const classes = rows.map ((row) => hx10G08ClassOfExpr (ctx, fn, row.parts[i][0], row.parts[i][1], depth + 1));
                const combined = hx10G08CombineClasses (classes);
                if (combined !== 'no') { slots[i] = combined; }
            }
            info = (Object.keys (slots).length > 0) ? { 'arity': arity, 'slots': slots } : undefined;
        } else {
            const types = pairReturn[1].split (',').map ((t) => t.trim ());
            const slots = {};
            if ((types.length === 2) && /^map\[string\]any$/.test (types[1])) { slots[1] = 'plain:map'; }
            if ((types.length === 2) && /^map\[string\]any$/.test (types[0])) { slots[0] = 'deref:map'; }
            if ((types.length === 2) && /^(?:bool)$/.test (types[0])) { slots[0] = 'plain:bool'; }
            if ((types.length === 2) && /^(?:string)$/.test (types[0])) { slots[0] = 'plain:string'; }
            if ((types.length === 2) && /^(?:int64|int|float64)$/.test (types[0])) { slots[0] = 'plain:number'; }
            if (types.length === 2) {
                // the map element may be a nil map: keep the pair's slot 1 to the body proof
                const nilable = (slots[1] !== undefined) && hx10G08PairMapMayBeNil (ctx, fn);
                if (nilable) { slots[1] = 'deref:map'; }
            }
            info = (Object.keys (slots).length > 0) ? { 'arity': types.length, 'slots': slots } : undefined;
        }
        if (info !== undefined) { return info; }
    }
    return undefined;
}

// a pair producer returns its params element from a local/expr that can be nil
function hx10G08PairMapMayBeNil (ctx, fn) {
    for (let k = fn.open + 1; k < fn.close; k++) {
        if (!/^\s*return /.test (ctx.mlines[k])) { continue; }
        const masked = ctx.mlines[k].replace (/^\s*return /, '');
        const raw = ctx.lines[k].replace (/^\s*return /, '');
        const parts = hx10G08SplitTop (masked, raw);
        if ((parts === undefined) || (parts.length !== 2)) { continue; }
        const cls = hx10G08ClassOfExpr (ctx, fn, parts[1][0], parts[1][1], 0);
        if (cls !== 'plain:map') { return true; }
    }
    return false;
}

export function hx10G08TupleReads (content) {
    if (content.indexOf ('GetValue') < 0) { return content; }
    const masked = hx10G08Mask (content);
    const mlines = masked.split ('\n');
    const lines = content.split ('\n');
    if (lines.length !== mlines.length) { return content; }
    const blocks = hx10G08Blocks (masked);
    const ctx = { 'lines': lines, 'mlines': mlines, 'blocks': blocks };
    ctx.functions = blocks.filter ((b) => (b.depth === 1) && (b.open !== undefined) && (b.close >= 0) && /^func /.test (mlines[b.open]));
    let changed = false;
    for (let k = 0; k < lines.length; k++) {
        if ((mlines[k].indexOf ('GetValue') < 0) && (mlines[k].indexOf ('MapTyped(') < 0) && (mlines[k].indexOf ('ListTyped(') < 0)) { continue; }
        const fn = hx10G08FuncAt (blocks, k);
        if (fn === undefined) { continue; }
        const edits = [];
        // MapTyped/ListTyped of a slot the producer types is the plain assertion
        const wrapped = /(?:ccxt\.)?(MapTyped|ListTyped)\(([A-Za-z_]\w*)\[(\d+)\]\)/g;
        let w;
        while ((w = wrapped.exec (mlines[k])) !== null) {
            const producer = hx10G08HolderProducer (ctx, fn, w[2], k);
            if (producer === undefined) { continue; }
            const info = hx10G08Producer (ctx, producer, 0);
            if (info === undefined) { continue; }
            const cls = info.slots[Number (w[3])];
            if (Number (w[3]) >= info.arity) { continue; }
            if ((w[1] === 'MapTyped') && ((cls === 'typedmap') || (cls === 'plain:map'))) {
                edits.push ([ w.index, w.index + w[0].length, w[2] + '[' + w[3] + '].(map[string]any)' ]);
            } else if ((w[1] === 'ListTyped') && (cls === 'typedslice')) {
                edits.push ([ w.index, w.index + w[0].length, w[2] + '[' + w[3] + '].([]any)' ]);
            }
        }
        const rx = /(?:(?<![\w.])(?:ccxt\.)?)GetValue(Bool)?\(([A-Za-z_]\w*), (\d+)(?:, (true|false))?\)/g;
        let m;
        while ((m = rx.exec (mlines[k])) !== null) {
            const bool = m[1] !== undefined;
            const holder = m[2];
            const slot = Number (m[3]);
            if (bool && (m[4] === undefined)) { continue; }
            const producer = hx10G08HolderProducer (ctx, fn, holder, k);
            if (producer === undefined) { continue; }
            const info = hx10G08Producer (ctx, producer, 0);
            if (info === undefined) { continue; }
            const cls = info.slots[slot];
            if ((cls === undefined) || (slot >= info.arity)) { continue; }
            if (bool) {
                if (cls !== 'plain:bool') { continue; }
                edits.push ([ m.index, m.index + m[0].length, holder + '[' + slot + '].(bool)' ]);
                continue;
            }
            if (cls.startsWith ('plain')) {
                edits.push ([ m.index, m.index + m[0].length, holder + '[' + slot + ']' ]);
                continue;
            }
            // a deref-consumer applies derefScalar itself, so a nilable slot reads the same
            const before = mlines[k].substring (0, m.index);
            const after = mlines[k].substring (m.index + m[0].length);
            // MapTyped/ListTyped of an already-typed slot is the plain assertion
            if (/^\s*\)/.test (after) && /(?:ccxt\.)?MapTyped\($/.test (before) && ((cls === 'typedmap') || (cls === 'plain:map'))) {
                edits.push ([ m.index, m.index + m[0].length, holder + '[' + slot + '].(map[string]any)' ]);
                continue;
            }
            if (/^\s*\)/.test (after) && /(?:ccxt\.)?ListTyped\($/.test (before) && (cls === 'typedslice')) {
                edits.push ([ m.index, m.index + m[0].length, holder + '[' + slot + '].([]any)' ]);
                continue;
            }
            const consumer = HX10_G08_DEREF_CONSUMERS.some ((c) => new RegExp ('(?:ccxt\\.)?' + c + '\\($').test (before)) && /^\s*\)/.test (after);
            if (!consumer) { continue; }
            edits.push ([ m.index, m.index + m[0].length, holder + '[' + slot + ']' ]);
        }
        if (edits.length === 0) { continue; }
        let line = lines[k];
        const sorted = edits.sort ((a, b) => b[0] - a[0]);
        let floor = line.length;
        for (const [ from, to, text ] of sorted) {
            if (to > floor) { continue; }
            line = line.substring (0, from) + text + line.substring (to);
            floor = from;
        }
        if (line === lines[k]) { continue; }
        lines[k] = line;
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// the producer of `holder` declared once above k in an enclosing block, never written afterwards
function hx10G08HolderProducer (ctx, fn, holder, k) {
    let declLine = -1;
    let producer;
    for (let j = fn.open + 1; j < fn.close; j++) {
        const decl = new RegExp ('^\\s*(?:var ' + holder + ' \\[\\]any = |' + holder + ' := )(?:ccxt\\.)?(?:TupleSlice\\()?this\\.(\\w+)\\(').exec (ctx.mlines[j]);
        if (decl !== null) {
            if (declLine >= 0) { return undefined; }
            declLine = j;
            producer = decl[1];
            continue;
        }
        const writes = new RegExp ('(?:^|[^.\\w])' + holder + '\\s*(?:=(?!=)|\\+=)');
        if (writes.test (ctx.mlines[j])) { return undefined; }
    }
    if ((declLine < 0) || (declLine >= k)) { return undefined; }
    const block = ctx.blocks.filter ((b) => (b.open < declLine) && (declLine <= b.close)).sort ((a, b) => b.open - a.open)[0];
    if ((block === undefined) || !((block.open < k) && (k <= block.close))) { return undefined; }
    return producer;
}

export function hx10G08Check () {
    const problems = [];
    const ok = (condition, message) => { if (!condition) { problems.push ('hx10 G08: ' + message); } };
    const producer = 'func (this *X) P(m any, optionalArgs ...any) []any {\n'
        + '\tvar params map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})\n'
        + '\tvar flag bool = m != nil\n'
        + '\tif flag {\n\t\treturn []any{flag, this.OmitDict(params, []any{"k"})}\n\t}\n'
        + '\treturn []any{flag, params}\n}\n';
    const user = (body) => 'func (this *X) F(p any) any {\n' + body + '\treturn nil\n}\n';
    const run = (body, text = producer) => hx10G08TupleReads (text + user (body));
    const pos = run ('\thVariable := this.P(nil, p)\n\tvar a bool = GetValueBool(hVariable, 0, false)\n\tb := GetValue(hVariable, 1)\n');
    ok (pos.indexOf ('var a bool = hVariable[0].(bool)') >= 0, 'a bool slot reads natively: ' + pos);
    ok (pos.indexOf ('b := hVariable[1]') >= 0, 'a non-nil map slot reads natively: ' + pos);
    const nilable = producer.replace ('var params map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})', 'var params map[string]any = this.SafeMapTyped(nil, "k")');
    ok (run ('\thVariable := this.P(nil, p)\n\tb := GetValue(hVariable, 1)\n', nilable).indexOf ('GetValue(hVariable, 1)') >= 0, 'a nilable map slot keeps GetValue');
    ok (run ('\thVariable := this.P(nil, p)\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n', nilable).indexOf ('hVariable[1].(map[string]any)') >= 0, 'MapTyped of a typed slot is the plain assertion');
    const anyMap = producer.replace ('var params map[string]any = GetArgMap(optionalArgs, 0, map[string]any{})', 'var params any = this.SafeDict(m, "k")');
    ok (run ('\thVariable := this.P(nil, p)\n\tvar b map[string]any = MapTyped(GetValue(hVariable, 1))\n', anyMap).indexOf ('MapTyped(hVariable[1])') >= 0, 'an any-typed slot keeps MapTyped around the native read');
    ok (run ('\thVariable := this.P(nil, p)\n\tb := GetValue(hVariable, 1)\n', anyMap).indexOf ('GetValue(hVariable, 1)') >= 0, 'an any-typed slot keeps the bare GetValue');
    const ptr = producer.replace ('var flag bool = m != nil', 'var flag *bool = nil');
    ok (run ('\thVariable := this.P(nil, p)\n\tv := GetValue(hVariable, 0)\n', ptr).indexOf ('GetValue(hVariable, 0)') >= 0, 'a pointer slot keeps GetValue');
    ok (run ('\thVariable := this.P(nil, p)\n\tb := GetValue(hVariable, 2)\n').indexOf ('GetValue(hVariable, 2)') >= 0, 'a slot past the arity keeps GetValue');
    ok (run ('\thVariable := this.P(nil, p)\n\thVariable = this.P(nil, p)\n\tb := GetValue(hVariable, 1)\n').indexOf ('GetValue(hVariable, 1)') >= 0, 'a rewritten holder keeps GetValue');
    const base = 'func (this *BaseExchange) HandlePostOnly(a any, optionalArgs ...any) []any {\n\treturn []any{true, this.OmitDict(map[string]any{}, []any{"k"})}\n}\n';
    const venue = 'func (this *X) F(p any) any {\n\th := this.HandlePostOnly(p, p)\n\tvar v bool = GetValueBool(h, 0, false)\n\tb := GetValue(h, 1)\n\treturn nil\n}\n';
    ok (hx10G08TupleReads (base + venue).indexOf ('var v bool = h[0].(bool)') >= 0, 'the base table covers a venue read');
    ok (hx10G08TupleReads (base + venue).indexOf ('b := h[1]') >= 0, 'the base table types the map slot');
    const pair = 'func (this *X) Q(m any, optionalArgs ...any) (*string, map[string]any) {\n\treturn nil, map[string]any{}\n}\n';
    const pairUser = 'func (this *X) G(m any) any {\n\ts, params := this.Q(m)\n\t_ = s\n\th := ccxt.TupleSlice(this.Q(m))\n\tb := GetValue(h, 1)\n\t_ = params\n\treturn nil\n}\n';
    ok (hx10G08TupleReads (pair + pairUser).indexOf ('GetValue(h, 1)') < 0, 'a typed pair reads its map slot natively');
    const once = pos;
    ok (hx10G08TupleReads (once) === once, 'idempotent');
    return problems;
}
