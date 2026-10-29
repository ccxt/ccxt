// hx10 w9 GP17: the params slot of the `[ value, params ]` handle*AndParams helpers. The printer
// can only print those tuples as `[]any`, so each destructuring costs a holder, an element read
// per slot and a MapTyped on slot 1; a `(T, map[string]any)` Go twin binds both natively.

// slot-0 Go type of the generated twins: each has exactly one `return []any{ value, params }`.
const GP17_TWIN_SLOT0: { [producer: string]: string } = {
    'HandleParamString': '*string',
    'HandleParamString2': '*string',
    'HandleNetworkCodeAndParams': '*string',
    'HandleParamBool': '*bool',
    'HandleParamBool2': '*bool',
    'HandleParamInteger': '*int64',
    'HandleParamInteger2': '*int64',
};

// the hand-written pair twins (exchange_market_type.go) wave-8 GP08 left: their GetValue reads deref.
const GP17_TUPLE_SLOT0: { [producer: string]: string } = {
    'HandleMarketTypeAndParams': '*string',
    'HandleSubTypeAndParams': '*string',
    'HandleOptionStringAndParams': '*string',
    'HandleOptionStringAndParams2': '*string',
    'HandleMarginModeAndParams': '*string',
    'HandleUntilOption': 'map[string]any',
    'HandleOptionBoolAndParams': 'bool',
    'HandleOptionBoolAndParams2': 'bool',
    'HandleOptionIntegerAndParams': 'int64',
    'HandleOptionIntegerAndParams2': 'int64',
};

interface Gp17Lines {
    raw: string[];
    masked: string[];
}

// the content with every string/rune/comment body blanked, offsets and lines preserved
function gp17Mask (content: string): string {
    const out = content.split ('');
    let quote = '';
    let block = false;
    let line = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (line) {
            if (c === '\n') { line = false; }
            else if (out[i] !== '\n') { out[i] = ' '; }
            continue;
        }
        if (block) {
            if ((c === '*') && (content[i + 1] === '/')) { block = false; out[i] = ' '; i++; out[i] = ' '; continue; }
            if (c !== '\n') { out[i] = ' '; }
            continue;
        }
        if (quote !== '') {
            if ((c === quote) && ((quote === '`') || (content[i - 1] !== '\\'))) { quote = ''; }
            if (c !== '\n') { out[i] = ' '; }
            continue;
        }
        if ((c === '/') && (content[i + 1] === '/')) { line = true; out[i] = ' '; continue; }
        if ((c === '/') && (content[i + 1] === '*')) { block = true; out[i] = ' '; i++; out[i] = ' '; continue; }
        if ((c === '"') || (c === '\'') || (c === '`')) { quote = c; out[i] = ' '; continue; }
    }
    return out.join ('');
}

function gp17Split (content: string): Gp17Lines | undefined {
    const raw = content.split ('\n');
    const masked = gp17Mask (content).split ('\n');
    return (raw.length === masked.length) ? { raw: raw, masked: masked } : undefined;
}

function gp17FunctionStart (maskedLines: string[], index: number): number {
    for (let j = index; j >= 0; j--) {
        if (/^func /.test (maskedLines[j])) {
            return j;
        }
    }
    return -1;
}

function gp17FunctionEnd (maskedLines: string[], index: number): number {
    for (let j = index; j < maskedLines.length; j++) {
        if (/^\}/.test (maskedLines[j])) {
            return j;
        }
    }
    return maskedLines.length - 1;
}

function gp17Mentions (line: string, name: string): boolean {
    return new RegExp ('(^|[^A-Za-z0-9_.])' + name + '([^A-Za-z0-9_]|$)').test (line);
}

// `return []any{ a, b }` split at its top-level comma, or undefined when it is not exactly two
function gp17TupleReturn (line: string): string[] | undefined {
    const match = /^\treturn \[\]any\{(.*)\}$/.exec (line);
    if (match === null) {
        return undefined;
    }
    const body = match[1];
    let depth = 0;
    let quote = '';
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (quote !== '') {
            if ((c === quote) && (body[i - 1] !== '\\')) { quote = ''; }
            continue;
        }
        if ((c === '"') || (c === '\'') || (c === '`')) { quote = c; continue; }
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; continue; }
        if ((c === ')') || (c === ']') || (c === '}')) { depth--; continue; }
        if ((c === ',') && (depth === 0)) {
            const second = body.slice (i + 1).trim ();
            if ((second.length === 0) || second.includes (',')) {
                return undefined;
            }
            return [ body.slice (0, i).trim (), second ];
        }
    }
    return undefined;
}

// `func (this *X) <producer> (…) []any {` -> the same line with the pair result
function gp17TwinSignature (content: string, producer: string, slot0: string): string {
    const pattern = new RegExp ('(func \\(this \\*\\w+\\) ' + producer + ' ?\\([^)]*\\) )(?:\\[\\]any|any)( \\{)', 'g');
    return content.replace (pattern, '$1(' + slot0 + ', map[string]any)$2');
}

/** One `return []any{ value, params }` at body depth -> `return value, MapTyped(params)`. */
export function hx10w9Gp17TupleTwins (content: string): string {
    if (content.indexOf ('return []any{') < 0) {
        return content;
    }
    const lines = gp17Split (content);
    if (lines === undefined) {
        return content;
    }
    const { raw, masked } = lines;
    let changed = false;
    for (let i = 0; i < masked.length; i++) {
        const signature = /^func \(this \*(\w+)\) (\w+) ?\(([^)]*)\) (?:\[\]any|any) \{$/.exec (masked[i]);
        if ((signature === null) || (GP17_TWIN_SLOT0[signature[2]] === undefined)) {
            continue;
        }
        const producer = signature[2];
        const end = gp17FunctionEnd (masked, i);
        const returns: number[] = [];
        for (let j = i + 1; j <= end; j++) {
            if (/^\treturn /.test (masked[j])) {
                returns.push (j);
            }
        }
        // exactly one body-level return, and it is the pair literal: every other path of the
        // helper is an inner closure whose `any` return the tuple keeps untouched
        if ((returns.length !== 1) || (gp17TupleReturn (masked[returns[0]]) === undefined)) {
            continue;
        }
        const parts = gp17TupleReturn (raw[returns[0]]);
        if (parts === undefined) {
            continue;
        }
        raw[returns[0]] = '\treturn ' + parts[0] + ', MapTyped(' + parts[1] + ')';
        masked[returns[0]] = raw[returns[0]];
        raw[i] = gp17TwinSignature (raw[i], producer, GP17_TWIN_SLOT0[producer]);
        masked[i] = raw[i];
        changed = true;
    }
    return changed ? raw.join ('\n') : content;
}

// the top-level arguments of a call text, or undefined when they cannot be split
function gp17CallArgs (call: string): string[] | undefined {
    const open = call.indexOf ('(');
    const close = call.lastIndexOf (')');
    if ((open < 0) || (close <= open)) {
        return undefined;
    }
    const body = call.slice (open + 1, close);
    const parts: string[] = [];
    let depth = 0;
    let quote = '';
    let start = 0;
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (quote !== '') {
            if ((c === quote) && (body[i - 1] !== '\\')) { quote = ''; }
            continue;
        }
        if ((c === '"') || (c === '\'') || (c === '`')) { quote = c; continue; }
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; continue; }
        if ((c === ')') || (c === ']') || (c === '}')) { depth--; continue; }
        if ((c === ',') && (depth === 0)) { parts.push (body.slice (start, i).trim ()); start = i + 1; }
    }
    parts.push (body.slice (start).trim ());
    return parts;
}

// `var <holder> []any = this.<producer> (…)` — the destructuring holder of one pair helper
// `var <h> []any = this.<P> (…)` / `<h> := TupleSlice (this.<P> (…))` — one pair's holder
function gp17Holder (line: string): { indent: string, name: string, call: string, producer: string } | undefined {
    const head = /^([ \t]*)(?:var ([A-Za-z_]\w*) (?:\[\]any|any) = |([A-Za-z_]\w*) := )(.*)$/.exec (line);
    if (head === null) {
        return undefined;
    }
    const rest = head[4].trim ();
    const wrapped = /^(?:ccxt\.)?TupleSlice\((.*)\)$/.exec (rest);
    const call = /^((?:ccxt\.)?this\.(\w+)\(.*\))$/.exec ((wrapped === null) ? rest : wrapped[1]);
    if (call === null) {
        return undefined;
    }
    return { 'indent': head[1], 'name': head[2] ?? head[3], 'call': call[1], 'producer': call[2] };
}

// the pair producers this pass binds, with the slot-0 type of their Go twin
function gp17Slot0 (producer: string): string | undefined {
    return GP17_TWIN_SLOT0[producer] ?? GP17_TUPLE_SLOT0[producer];
}

// one pair call site: `pre` replaces the holder line, `post` (after `bind`) replaces the last read
interface Gp17Site {
    from: number;
    to: number;
    pre: string[];
    bind: string;
    post: string[];
    keep: number[];
}

interface Gp17Slot {
    name: string;
    type: string;                 // Go type the local carries in the bind
    declared: boolean;            // the site assigns a local declared elsewhere
    keep: number | undefined;     // a `var x T = nil` line that stays where it is
    deref: string | undefined;    // 'any' | slot-0 type: the read derefs a pointer result
    note?: string;                // the trailing `//` note of the read
    fallback?: string;            // the value a boxed-but-absent bool read answers
    nilProven?: boolean;          // the local is nil here, so a nil test reads like the deref
}

function gp17WithHolder (pattern: RegExp, holder: string): RegExp {
    return new RegExp (pattern.source.split ('HOLDER').join (holder));
}

const GP17_PTR = '(\\*string|\\*bool|\\*int64)';

// the slot-0 and slot-1 reads, as the printer writes them for one destructuring
function gp17SingleLine (raw: string[], masked: string[], at: number, holder: string, slot0: string): { slot0?: Gp17Slot, slot1?: Gp17Slot } {
    const printed = masked[at];
    const source = raw[at];
    if ((printed === undefined) || (source === undefined)) {
        return {};
    }
    // the mask blanks a trailing `//` note: it belongs to the read, not to the expression, and
    // the line that replaces both reads carries it
    const note = gp17TrailingNote (source, printed);
    const line = printed.replace (/[ \t]+$/, '');
    const h = (source: string) => gp17WithHolder (new RegExp (source), holder).exec (line);
    const found: { slot0?: Gp17Slot, slot1?: Gp17Slot } = {};
    const withNote = (slot: Gp17Slot) => { if (note !== undefined) { slot.note = note; } return slot; };
    const safeDecl = h ('^([ \\t]*)var ([A-Za-z_]\\w*) ' + GP17_PTR + ' = (?:ccxt\\.)?(?:SafeStringPtr|SafeBoolPtr|SafeIntegerPtr)\\((?:ccxt\\.)?HOLDER\\[0\\]\\)$');
    if (safeDecl !== null) {
        found.slot0 = withNote ({ 'name': safeDecl[2], 'type': safeDecl[3], 'declared': false, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const safeAssign = h ('^([ \\t]*)([A-Za-z_]\\w*) = (?:ccxt\\.)?(?:SafeStringPtr|SafeBoolPtr|SafeIntegerPtr)\\((?:ccxt\\.)?HOLDER\\[0\\]\\)$');
    if (safeAssign !== null) {
        found.slot0 = withNote ({ 'name': safeAssign[2], 'type': '', 'declared': true, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const getValuePtr = h ('^([ \\t]*)(?:var ([A-Za-z_]\\w*) ' + GP17_PTR + ' = |([A-Za-z_]\\w*) = )(?:ccxt\\.)?(?:SafeStringPtr|SafeBoolPtr|SafeIntegerPtr)\\((?:ccxt\\.)?GetValue\\(HOLDER, 0\\)\\)$');
    if ((getValuePtr !== null) && (getValuePtr[2] !== undefined) && (getValuePtr[2 + 1] !== undefined)) {
        found.slot0 = withNote ({ 'name': getValuePtr[2], 'type': getValuePtr[3], 'declared': false, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const getValue0 = h ('^([ \\t]*)(?:var ([A-Za-z_]\\w*) ([A-Za-z_\\[\\]\\w]+) = |([A-Za-z_]\\w*) (?::=|=) )(?:ccxt\\.)?GetValue\\(HOLDER, 0\\)$');
    if (getValue0 !== null) {
        const name = getValue0[2] ?? getValue0[4];
        // a pointer result only lands in the local through the deref the read performed
        const kind = (slot0.charAt (0) === '*') ? 'getvalue' : undefined;
        found.slot0 = withNote ({ 'name': name, 'type': getValue0[3] ?? 'any', 'declared': (getValue0[2] === undefined) && !/ := /.test (line), 'keep': undefined, 'deref': kind });
        return found;
    }
    const boolValue = h ('^([ \\t]*)([A-Za-z_]\\w*) = (?:ccxt\\.)?GetValueBool\\(HOLDER, 0, ([A-Za-z_]\\w+)\\)$');
    if (boolValue !== null) {
        found.slot0 = { 'name': boolValue[2], 'type': 'bool', 'declared': true, 'keep': undefined, 'deref': 'bool', 'fallback': boolValue[3] };
        return found;
    }
    const ifok = h ('^([ \\t]*)if p, ok := HOLDER\\[0\\]\\.\\(' + GP17_PTR + '\\); ok \\{ ([A-Za-z_]\\w*) = p \\}$');
    if (ifok !== null) {
        found.slot0 = withNote ({ 'name': ifok[3], 'type': ifok[2], 'declared': false, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const anyRead = h ('^([ \\t]*)(?:var )?([A-Za-z_]\\w*) (?::=|=) HOLDER\\[0\\]$');
    if (anyRead !== null) {
        found.slot0 = withNote ({ 'name': anyRead[2], 'type': 'any', 'declared': / = /.test (line), 'keep': undefined, 'deref': undefined });
        return found;
    }
    const mapDecl = h ('^([ \\t]*)var ([A-Za-z_]\\w*) map\\[string\\]any = (?:ccxt\\.)?MapTyped\\((?:ccxt\\.)?HOLDER\\[1\\]\\)$');
    if (mapDecl !== null) {
        found.slot1 = withNote ({ 'name': mapDecl[2], 'type': 'map[string]any', 'declared': false, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const mapAssign = h ('^([ \\t]*)([A-Za-z_]\\w*) = (?:ccxt\\.)?MapTyped\\((?:ccxt\\.)?HOLDER\\[1\\]\\)$');
    if (mapAssign !== null) {
        found.slot1 = withNote ({ 'name': mapAssign[2], 'type': 'map[string]any', 'declared': true, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const mapGetValue = h ('^([ \\t]*)([A-Za-z_]\\w*) = (?:ccxt\\.)?MapTyped\\((?:ccxt\\.)?(?:ccxt\\.)?GetValue\\(HOLDER, 1\\)\\)$');
    if (mapGetValue !== null) {
        found.slot1 = withNote ({ 'name': mapGetValue[2], 'type': 'map[string]any', 'declared': true, 'keep': undefined, 'deref': undefined });
        return found;
    }
    const anySlot = h ('^([ \\t]*)(?:var )?([A-Za-z_]\\w*) (?::=|=) HOLDER\\[1\\]$');
    if (anySlot !== null) {
        found.slot1 = withNote ({ 'name': anySlot[2], 'type': 'any', 'declared': / = /.test (line), 'keep': undefined, 'deref': undefined });
        return found;
    }
    const getValue = h ('^([ \\t]*)(?:var ([A-Za-z_]\\w*) ([A-Za-z_\\[\\]\\w]+) = |([A-Za-z_]\\w*) (?::=|=) )(?:ccxt\\.)?GetValue\\(HOLDER, 1\\)$');
    if (getValue !== null) {
        const name = getValue[2] ?? getValue[4];
        found.slot1 = withNote ({ 'name': name, 'type': getValue[3] ?? 'any', 'declared': / = /.test (line), 'keep': undefined, 'deref': undefined });
        return found;
    }
    return found;
}
// the value of one call site: `temp` asks for a local the pointer result is materialised into
function gp17ResolveSite (raw: string[], masked: string[], index: number, producer: string, qualifier: string): Gp17Site | undefined {
    const decl = gp17Holder (masked[index]);
    const rawDecl = gp17Holder (raw[index]);
    const slot0 = gp17Slot0 (producer);
    if ((decl === undefined) || (rawDecl === undefined) || (slot0 === undefined)) {
        return undefined;
    }
    const indent = decl.indent;
    const holder = decl.name;
    const call = rawDecl.call;   // the literal argument text: the masked line has its strings blanked
    const consumed = new Set<number> ([ index ]);
    let value: Gp17Slot | undefined;
    let params: Gp17Slot | undefined;
    let pending: { name: string, type: string, line: number } | undefined;
    let at = index + 1;
    for (let step = 0; step < 8; step++) {
        const line = masked[at];
        if (line === undefined) {
            return undefined;
        }
        const block = gp17BlockRead (masked, at, holder, slot0);
        if ((block !== undefined) && ((block.slot === 1) ? (params === undefined) : (value === undefined))) {
            if (block.slot === 1) {
                params = block.value;
            } else {
                value = block.value;
            }
            for (let j = at; j <= block.to; j++) {
                consumed.add (j);
            }
            at = block.to + 1;
            continue;
        }
        // the value's own `var x T = nil` declaration may sit between the holder and its read
        const pendingType = slot0.replace ('*', '\\*');
        const declCandidate = new RegExp ('^([ \\t]*)var ([A-Za-z_]\\w*) (' + pendingType + '|any) = nil$').exec (line);
        if ((value === undefined) && (pending === undefined) && (declCandidate !== null)) {
            pending = { 'name': declCandidate[2], 'type': declCandidate[3], 'line': at };
            at++;
            continue;
        }
        const found = gp17SingleLine (raw, masked, at, holder, slot0);
        if ((value === undefined) && (found.slot0 !== undefined)) {
            if (found.slot0.deref === undefined) {
                // only a read that yields exactly the pair's first result binds directly
                if ((found.slot0.type !== '') && (found.slot0.type !== slot0) && (found.slot0.type !== 'any')) {
                    return undefined;
                }
                if ((found.slot0.type === 'any') && (pending !== undefined)) {
                    found.slot0.type = pending.type;
                    found.slot0.keep = pending.line;
                    consumed.add (pending.line);
                }
            } else if ((found.slot0.deref === 'getvalue') && (pending !== undefined)
                && (pending.name === found.slot0.name) && ((pending.type === 'any') || (pending.type === slot0))) {
                // the local was nil and stays nil unless the twin hands back a value
                found.slot0.keep = pending.line;
                consumed.add (pending.line);
            }
            value = found.slot0;
            consumed.add (at);
            at++;
            continue;
        }
        if ((params === undefined) && (found.slot1 !== undefined)) {
            params = found.slot1;
            consumed.add (at);
            at++;
            continue;
        }
        break;
    }
    if (value === undefined) {
        return undefined;
    }
    if (params === undefined) {
        // the caller never reads the params slot of this pair
        params = { 'name': '_', 'type': '', 'declared': true, 'keep': undefined, 'deref': undefined };
    }
    // the holder is read nowhere else in the function
    const start = gp17FunctionStart (masked, index);
    const end = gp17FunctionEnd (masked, index);
    if (start < 0) {
        return undefined;
    }
    for (let j = start; j <= end; j++) {
        if (!consumed.has (j) && gp17Mentions (masked[j], holder)) {
            return undefined;
        }
    }
    if ((value.deref === 'getvalue') && (value.keep === undefined) && gp17NilProven (masked, start, index, value.name)) {
        value.nilProven = true;
    }
    // a declaration of either local inside the site is kept, so it still declares them; one
    // outside it, above, is the site's own `var x T = nil`; otherwise the bind declares them
    const keep = new Set<number> ();
    for (let j = index + 1; j < at; j++) {
        const declares = /^([ \t]*)var ([A-Za-z_]\w*) (?:\*?[a-z0-9]+|any) = nil$/.exec (masked[j]);
        if ((declares !== null) && ((declares[2] === value.name) || (declares[2] === params.name))) {
            keep.add (j);
        }
    }
    const declaredFor = (slot: Gp17Slot) => slot.declared
        || [ ...keep ].some ((j) => new RegExp ('^[ \\t]*var ' + slot.name + ' ').test (masked[j]))
        || gp17DeclaredAbove (masked, start, index, slot.name);
    value.declared = declaredFor (value);
    params.declared = declaredFor (params);
    if ((value.deref === 'any') && !value.declared) {
        // the old read was `x := func() any {…}`: an explicit `var x any` would add an any-local
        return undefined;
    }
    // the request pipeline hands a list body through handleOptionAndParams' callerMethodName
    // probe, which the map-typed params slot cannot carry; this one site reads it inline
    if ((producer === 'HandleParamString') && /^func \(this \*\w+\) HandleOptionAndParams ?\(/.test (masked[start])) {
        const args = gp17CallArgs (call);
        if ((args === undefined) || (args.length !== 3)) {
            return undefined;
        }
        return {
            'from': index,
            'to': at - 1,
            'pre': [
                indent + 'var ' + value.name + ' *string = this.SafeString(' + args[0] + ', ' + args[1] + ', ' + args[2] + ')',
                indent + params.name + ' := ' + args[0],
            ],
            'bind': '',
            'post': [ indent + 'if ' + value.name + ' != nil { ' + params.name + ' = this.Omit(' + args[0] + ', ' + args[1] + ') }' ],
            'keep': [],
        };
    }
    const pre: string[] = [];
    const post: string[] = [];
    const declare = (slot: Gp17Slot, type: string, fallback: string) => {
        if (!slot.declared && (slot.keep === undefined)) {
            pre.push (indent + 'var ' + slot.name + ' ' + ((type === '') ? fallback : type) + ' = nil');
        }
    };
    // a params local the old read declared with `:=` stays a short declaration, so no
    // explicit `var … any` is introduced; the value must sit in the same block for that
    const inSite = (slot: Gp17Slot) => (slot.keep !== undefined)
        || [ ...keep ].some ((j) => new RegExp ('^[ \\t]*var ' + slot.name + ' ').test (masked[j]));
    const short = (params.name !== '_') && !params.declared && !inSite (params)
        && ((value.deref !== undefined) || ((value.type !== 'any') && (!value.declared || inSite (value))));
    if (!short) {
        declare (params, params.type, 'map[string]any');
    }
    const paramsBind = params.name;
    const assign = short ? ' := ' : ' = ';
    let bind = '';
    if (value.deref === undefined) {
        // the pair's first result is the local itself: both slots bind in one assignment
        if (!short) {
            declare (value, value.type, slot0);
        }
        bind = indent + value.name + ', ' + paramsBind + assign + call + gp17Note (value, params);
    } else {
        // the site derefs the element, so the pointer lands in a temporary first
        const temporary = gp17Temporary (masked, start, end, value.name + 'Ptr');
        if (temporary === undefined) {
            return undefined;
        }
        pre.push (indent + 'var ' + temporary + ' ' + slot0 + ' = nil');
        bind = indent + temporary + ', ' + paramsBind + assign + call + gp17Note (value, params);
        if (value.deref === 'getvalue') {
            // the old GetValue answered nil for a nil pointer: reset first, then deref natively
            if ((value.keep === undefined) && (value.nilProven !== true)) {
                post.push (indent + ((value.declared) ? (value.name + ' = nil') : ('var ' + value.name + ' any = nil')));
            }
            post.push (indent + 'if ' + temporary + ' != nil { ' + value.name + ' = *' + temporary + ' }');
        } else if (value.deref === 'bool') {
            const fallback = value.fallback ?? 'false';
            post.push (indent + ((value.declared) ? (value.name + ' = ' + fallback) : ('var ' + value.name + ' bool = ' + fallback)));
            post.push (indent + 'if ' + temporary + ' != nil { ' + value.name + ' = *' + temporary + ' }');
        } else if (value.deref === 'iife') {
            // `x := func() any {…}` keeps its shape: the pair's pointer replaces the element read
            post.push (indent + value.name + ((value.declared) ? ' = ' : ' := ') + 'func() any {');
            post.push (indent + '\tif ' + temporary + ' != nil {');
            post.push (indent + '\t\treturn *' + temporary);
            post.push (indent + '\t}');
            post.push (indent + '\treturn nil');
            post.push (indent + '}()');
        } else if (value.deref === 'any') {
            // the old iife answered nil for a nil pointer, so a local declared above is reset
            post.push (indent + ((value.declared) ? (value.name + ' = nil') : ('var ' + value.name + ' any = nil')));
            post.push (indent + 'if ' + temporary + ' != nil { ' + value.name + ' = *' + temporary + ' }');
        } else {
            post.push (indent + ((value.declared) ? (value.name + ' = ' + temporary) : ('var ' + value.name + ' ' + value.deref + ' = ' + temporary)));
        }
    }
    return { 'from': index, 'to': at - 1, 'pre': pre, 'bind': bind, 'post': post, 'keep': [ ...keep ] };
}

// the `//` note the mask blanked out of the read, when the read carries one
function gp17TrailingNote (source: string, printed: string): string | undefined {
    let at = source.indexOf ('//');
    while (at >= 0) {
        if (printed.slice (at, at + 2) === '  ') {
            return source.slice (at).trim ();
        }
        at = source.indexOf ('//', at + 2);
    }
    return undefined;
}

// `var <name> …` anywhere above the site in the same function (a parameter included)
function gp17DeclaredAbove (masked: string[], start: number, index: number, name: string): boolean {
    const declaration = new RegExp ('^[ \\t]*var ' + name + ' ');
    // a short declaration anywhere above may be in this scope or an outer one: either way the
    // bind must assign, never re-declare
    const shortDeclaration = new RegExp ('^[ \\t]*(?:[A-Za-z_]\\w*, )*' + name + '(?:, [A-Za-z_]\\w*)* (?:\\[\\]any )?:=');
    for (let j = start; j < index; j++) {
        if (declaration.test (masked[j]) || shortDeclaration.test (masked[j])) {
            return true;
        }
    }
    return new RegExp ('[(, ]' + name + ' ').test (masked[start] ?? '');
}

// a local declared `var x … = nil` once before the site and never written there holds nil, so
// `if tmp != nil { x = *tmp }` reads exactly like the deref the element read performed
function gp17NilProven (masked: string[], start: number, index: number, name: string): boolean {
    let declared = -1;
    for (let j = start + 1; j < index; j++) {
        const line = masked[j];
        if (new RegExp ('^[ \\t]*var ' + name + ' (?:any|\\*string|\\*bool|\\*int64) = nil$').test (line)) {
            declared = j;
        }
    }
    if (declared < 0) {
        return false;
    }
    for (let j = declared + 1; j < index; j++) {
        const write = new RegExp ('^[ \\t]*(?:var )?' + name + ' (?:\\[|=|\\[\\]any =|:=|=) ').exec (masked[j]);
        if ((write !== null) && (masked[j].slice (write[0].length).indexOf ('=') !== 0)) {
            return false;
        }
    }
    return true;
}

// the trailing note of either read, for the line that replaces both
function gp17Note (value: Gp17Slot, params: Gp17Slot): string {
    const note = params.note ?? value.note;
    return (note === undefined) ? '' : ('  ' + note);
}

// a temporary name unique in the function body, or undefined when the name is taken
function gp17Temporary (masked: string[], start: number, end: number, base: string): string | undefined {
    const candidates = [ base, base + 'Slot', base + 'Slot0' ];
    for (const candidate of candidates) {
        let clashes = false;
        for (let j = start; j <= end; j++) {
            clashes = clashes || gp17Mentions (masked[j], candidate);
        }
        if (!clashes) {
            return candidate;
        }
    }
    return undefined;
}

// `x := func() any { if p, _ := h[0].(*T); p != nil { return *p }; return nil }()` and the
// bounds-checked twins of it, whose iife only guards a two-element tuple
function gp17BlockRead (masked: string[], at: number, holder: string, slot0: string): { value: Gp17Slot, slot: number, to: number } | undefined {
    const line = masked[at] ?? '';
    const lineAt = (offset: number) => masked[at + offset] ?? '';
    const after = () => (/^[ \t]*\}$/.test (lineAt (3))) && (/^[ \t]*return nil$/.test (lineAt (4)));
    const h = (source: string) => gp17WithHolder (new RegExp (source), holder).exec (line);
    // the deref-in-an-iife read: `return *p` after a pointer test of the element
    const iife = h ('^([ \\t]*)([A-Za-z_]\\w*) (:?=) func\\(\\) any \\{$');
    if ((iife !== null) && after ()) {
        const guard = new RegExp ('^[ \\t]*if p, _ := ' + holder + '\\[0\\]\\.\\(' + slot0.replace ('*', '\\*') + '\\); p != nil \\{$').test (lineAt (1));
        if (guard && /^[ \t]*return \*p$/.test (lineAt (2)) && /^([ \t]*)\}\(\)$/.test (lineAt (5))) {
            return {
                'value': { 'name': iife[2], 'type': 'any', 'declared': (iife[3] === '='), 'keep': undefined, 'deref': 'iife' },
                'slot': 0,
                'to': at + 5,
            };
        }
    }
    // the bounds-checked read of a two-element tuple: the guard is constant-true
    const bounds = h ('^([ \\t]*)var ([A-Za-z_]\\w*) (' + slot0.replace ('*', '\\*') + '|any) = (?:(?:ccxt\\.)?(?:SafeStringPtr|SafeBoolPtr|SafeIntegerPtr)\\(func\\(\\) any \\{)$');
    if ((bounds !== null) && after ()) {
        const type = bounds[3].split ('\\').join ('');
        const guard = new RegExp ('^[ \\t]*if 0 >= 0 && 0 < len\\(' + holder + '\\) \\{$').test (lineAt (1));
        const read = new RegExp ('^[ \\t]*return (?:DerefScalar\\()?' + holder + '\\[0\\]\\)?$').test (lineAt (2));
        if (guard && read && /^([ \t]*)\}\(\)\)?$/.test (lineAt (5))) {
            return {
                'value': { 'name': bounds[2], 'type': type, 'declared': false, 'keep': undefined, 'deref': (type === 'any') ? 'any' : type },
                'slot': 0,
                'to': at + 5,
            };
        }
    }
    // the same guard on the params element
    const paramsBounds = h ('^([ \\t]*)var ([A-Za-z_]\\w*) any = func\\(\\) any \\{$');
    if ((paramsBounds !== null) && after ()) {
        const guard = new RegExp ('^[ \\t]*if 1 >= 0 && 1 < len\\(' + holder + '\\) \\{$').test (lineAt (1));
        const read = new RegExp ('^[ \\t]*return (?:DerefScalar\\()?' + holder + '\\[1\\]\\)?$').test (lineAt (2));
        if (guard && read && /^([ \t]*)\}\(\)$/.test (lineAt (5))) {
            return {
                'value': { 'name': paramsBounds[2], 'type': 'any', 'declared': false, 'keep': undefined, 'deref': undefined },
                'slot': 1,
                'to': at + 5,
            };
        }
    }
    return undefined;
}

// `var x *string = SafeStringPtr (GetValue (this.<P> (…), 0))`: one element of the pair, read
// without a holder. The twin hands that element back as its first result.
function gp17InlinePairReads (content: string, qualifier: string): string {
    if (content.indexOf ('GetValue(this.') < 0) {
        return content;
    }
    const lines = gp17Split (content);
    if (lines === undefined) {
        return content;
    }
    const { raw, masked } = lines;
    const call = '(?:ccxt\\.)?this\\.(\\w+)\\((.*)\\)';
    const pointer = new RegExp ('^([ \\t]*)var ([A-Za-z_]\\w*) (\\*string|\\*bool|\\*int64) = (?:ccxt\\.)?(?:SafeStringPtr|SafeBoolPtr|SafeIntegerPtr)' + '\\((?:ccxt\\.)?GetValue\\(' + call + ', 0\\)\\)$');
    const boxed = new RegExp ('^([ \\t]*)var ([A-Za-z_]\\w*) any = (?:ccxt\\.)?GetValue\\(' + call + ', 0\\)$');
    const params = new RegExp ('^([ \\t]*)var ([A-Za-z_]\\w*) (map\\[string\\]any|any) = (?:ccxt\\.)?(?:MapTyped\\()?(?:ccxt\\.)?GetValue\\(' + call + ', 1\\)\\)?$');
    let changed = false;
    for (let i = 0; i < masked.length; i++) {
        const pointerMatch = pointer.exec (masked[i]);
        const pointerRaw = pointer.exec (raw[i]);
        if ((pointerMatch !== null) && (pointerRaw !== null) && (GP17_TWIN_SLOT0[pointerMatch[4]] === pointerMatch[3])) {
            raw[i] = pointerMatch[1] + pointerMatch[2] + ', _ := this.' + pointerRaw[4] + '(' + pointerRaw[5] + ')';
            masked[i] = raw[i];
            changed = true;
            continue;
        }
        const boxedMatch = boxed.exec (masked[i]);
        const boxedRaw = boxed.exec (raw[i]);
        if ((boxedMatch !== null) && (boxedRaw !== null) && (GP17_TWIN_SLOT0[boxedMatch[3]] !== undefined)) {
            const temporary = boxedMatch[2] + 'Ptr';
            raw[i] = boxedMatch[1] + temporary + ', _ := this.' + boxedRaw[3] + '(' + boxedRaw[4] + ')\n'
                + boxedMatch[1] + 'var ' + boxedMatch[2] + ' any = nil\n'
                + boxedMatch[1] + 'if ' + temporary + ' != nil { ' + boxedMatch[2] + ' = *' + temporary + ' }';
            masked[i] = raw[i];
            changed = true;
            continue;
        }
        const paramsMatch = params.exec (masked[i]);
        const paramsRaw = params.exec (raw[i]);
        if ((paramsMatch !== null) && (paramsRaw !== null) && (GP17_TWIN_SLOT0[paramsMatch[4]] !== undefined)) {
            raw[i] = paramsMatch[1] + '_, ' + paramsMatch[2] + ' := this.' + paramsRaw[4] + '(' + paramsRaw[5] + ')';
            masked[i] = raw[i];
            changed = true;
        }
    }
    return changed ? raw.join ('\n') : content;
}

export function hx10w9Gp17ParamsSlotBinds (content: string): string {
    if ((content.indexOf ('[]any = this.') < 0) && (content.indexOf ('TupleSlice(this.') < 0)
        && (content.indexOf ('TupleSlice(ccxt.this.') < 0)) {
        return content;
    }
    // a file outside package ccxt reaches the runtime helpers through the ccxt qualifier
    const qualifier = /^package\s+(?!ccxt\b)/m.test (content) ? 'ccxt.' : '';
    content = gp17InlinePairReads (content, qualifier);
    const lines = gp17Split (content);
    if (lines === undefined) {
        return content;
    }
    const { raw, masked } = lines;
    const edits = new Map<number, string[] | null> ();
    let changed = false;
    for (let i = 0; i < masked.length; i++) {
        const decl = gp17Holder (masked[i]);
        if ((decl === undefined) || (gp17Slot0 (decl.producer) === undefined) || edits.has (i)) {
            continue;
        }
        const site = gp17ResolveSite (raw, masked, i, decl.producer, qualifier);
        if (site === undefined) {
            continue;
        }
        edits.set (i, site.pre);
        for (let j = site.from + 1; j <= site.to; j++) {
            // a declaration of either local stays, every element read goes away
            if (site.keep.indexOf (j) < 0) {
                edits.set (j, null);
            }
        }
        edits.set (site.to, (site.bind === '' ? [] : [ site.bind ]).concat (site.post));
        changed = true;
    }
    if (!changed) {
        return content;
    }
    const out: string[] = [];
    for (let i = 0; i < raw.length; i++) {
        const edit = edits.get (i);
        if (edit === undefined) {
            out.push (raw[i]);
        } else if (edit !== null) {
            out.push (...edit);
        }
    }
    return out.join ('\n');
}

/** Self-test: the shipped rules, both directions. */
export function hx10w9Gp17SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const twin = 'package ccxt\n\nfunc (this *BaseExchange) HandleParamString(params any, paramName any, optionalArgs ...any) []any {\n'
        + '\tvar value *string = this.SafeString(params, paramName)\n'
        + '\tvar paramsOmitted any = func() any {\n'
        + '\t\tif value != nil {\n'
        + '\t\t\treturn this.Omit(params, paramName)\n'
        + '\t\t}\n'
        + '\t\treturn params\n'
        + '\t}()\n'
        + '\treturn []any{value, paramsOmitted}\n'
        + '}\n';
    const twinOut = hx10w9Gp17TupleTwins (twin);
    ok (twinOut.indexOf ('optionalArgs ...any) (*string, map[string]any) {') >= 0, 'twin signature carries the pair: ' + twinOut);
    ok (twinOut.indexOf ('\treturn value, MapTyped(paramsOmitted)\n') >= 0, 'single pair return: ' + twinOut);
    ok (twinOut.indexOf ('return this.Omit(params, paramName)\n') >= 0, 'inner closure return untouched: ' + twinOut);
    ok (hx10w9Gp17TupleTwins (twinOut) === twinOut, 'second application is a no-op');
    // a second body-level return path keeps the slice: the result types could differ
    const twoPaths = twin.replace ('\treturn []any{value, paramsOmitted}\n', '\treturn []any{value, paramsOmitted}\n\treturn []any{value, params}\n');
    ok (hx10w9Gp17TupleTwins (twoPaths).indexOf ('[]any {') >= 0, 'two return paths keep the slice');
    // an unlisted producer keeps everything
    ok (hx10w9Gp17TupleTwins (twin.replace ('HandleParamString', 'HandleOther')).indexOf (') []any {') >= 0, 'unlisted producer kept');

    const f = (body: string) => hx10w9Gp17ParamsSlotBinds ('package ccxt\n\nfunc (this *X) f (p map[string]any) any {\n' + body + '\treturn nil\n}\n');
    const pair = 'this.HandleParamString(params, "tag")';
    // the shipped shape: `var x *string = nil` + the ok-assert + the MapTyped params read
    const held = '\tvar tagparamsWithdrawTagVariable []any = ' + pair + '\n\tvar tag *string = nil\n'
        + '\tif p, ok := tagparamsWithdrawTagVariable[0].(*string); ok { tag = p }\n'
        + '\tvar paramsWithdrawTag map[string]any = MapTyped(tagparamsWithdrawTagVariable[1])\n';
    const bound = f (held + '\t_ = tag\n\t_ = paramsWithdrawTag\n');
    ok (bound.indexOf ('tagparamsWithdrawTagVariable') < 0, 'holder dropped: ' + bound);
    ok (bound.indexOf ('\ttag, paramsWithdrawTag := ' + pair + '\n') >= 0, 'native pair bind: ' + bound);
    ok (bound.indexOf ('\ttag, paramsWithdrawTag := ' + pair + '\n') >= 0, 'the map local binds natively: ' + bound);
    ok (bound.indexOf ('\tvar tag *string = nil\n') >= 0, 'the value keeps its annotation: ' + bound);
    ok (hx10w9Gp17ParamsSlotBinds (bound) === bound, 'second application is a no-op');
    // the SafeStringPtr read of slot 0
    const safe = f ('\tvar v []any = ' + pair + '\n\tvar tag *string = SafeStringPtr(v[0])\n\tvar paramsTag map[string]any = MapTyped(v[1])\n\t_ = tag\n\t_ = paramsTag\n');
    ok (safe.indexOf ('\ttag, paramsTag := ' + pair + '\n') >= 0, 'a deref consumer binds natively: ' + safe);
    // a boxed `any` element keeps its box
    const boxed = f ('\tvar v []any = ' + pair + '\n\ttagOption := v[0]\n\tvar paramsTag map[string]any = MapTyped(v[1])\n\t_ = tagOption\n\t_ = paramsTag\n');
    ok (boxed.indexOf ('\tvar tagOption any = nil\n') >= 0, 'a boxed element stays any: ' + boxed);
    ok (boxed.indexOf ('\ttagOption, paramsTag = ' + pair + '\n') >= 0, 'boxed element binds too: ' + boxed);
    // a holder read anywhere else keeps the box
    ok (f (held + '\t_ = tagparamsWithdrawTagVariable\n').indexOf ('tagparamsWithdrawTagVariable') >= 0, 'escaped holder kept');
    // a second MapTyped read of slot 1 keeps the box
    ok (f (held + '\tvar other map[string]any = MapTyped(tagparamsWithdrawTagVariable[1])\n\t_ = other\n').indexOf ('tagparamsWithdrawTagVariable') >= 0, 'second params read keeps the box');
    // an unlisted producer keeps the holder
    ok (f ('\tvar h []any = this.HandleOther(p)\n\tvar x *string = SafeStringPtr(h[0])\n\tvar q map[string]any = MapTyped(h[1])\n\t_ = x\n\t_ = q\n').indexOf ('var h []any = ') >= 0, 'unlisted producer kept');
    // the deref-in-an-iife read into a local declared above keeps its nil answer
    const iife = '\tx := nil\n\t_ = x\n\tvar h []any = ' + pair + '\n\tx = func() any {\n\t\tif p, _ := h[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n'
        + '\t\treturn nil\n\t}()\n\tvar q map[string]any = MapTyped(h[1])\n\t_ = x\n\t_ = q\n';
    const iifeOut = f (iife);
    ok (iifeOut.indexOf ('x = func() any {\n\t\tif xPtr != nil {\n\t\t\treturn *xPtr') >= 0, 'the declared deref iife reads the pair: ' + iifeOut);
    ok ((iifeOut.indexOf ('h[0]') < 0) && (iifeOut.indexOf ('MapTyped(') < 0), 'the element reads both go: ' + iifeOut);
    // a fresh `x := func() any {…}` keeps its short declaration (an explicit any local would rise)
    const fresh = '\tvar h []any = ' + pair + '\n\tx := func() any {\n\t\tif p, _ := h[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n'
        + '\t\treturn nil\n\t}()\n\tvar q map[string]any = MapTyped(h[1])\n\t_ = x\n\t_ = q\n';
    ok (f (fresh).indexOf ('x := func() any {\n\t\tif xPtr != nil {') >= 0, 'a fresh deref keeps the iife: ' + f (fresh));
    // the callerMethodName probe may carry a list body: it reads inline, not through the map slot
    const hop = (body: string) => hx10w9Gp17ParamsSlotBinds ('package ccxt\n\nfunc (this *X) HandleOptionAndParams (params any, methodName any) any {\n' + body + '\treturn nil\n}\n');
    const probe = hop ('\tvar h []any = this.HandleParamString(params, \"callerMethodName\", methodName)\n'
        + '\tvar callerMethodName *string = SafeStringPtr(func() any {\n\t\tif 0 >= 0 && 0 < len(h) {\n\t\t\treturn h[0]\n\t\t}\n\t\treturn nil\n\t}())\n'
        + '\tparamsCallerMethodName := GetValue(h, 1)\n\t_ = callerMethodName\n\t_ = paramsCallerMethodName\n');
    ok (probe.indexOf ('func() any {') < 0, 'the callerMethodName probe reads inline: ' + probe);
    ok (probe.indexOf ('paramsCallerMethodName := params\n') >= 0, 'the probe carries the params untouched: ' + probe);
    // the bounded read of a two-element tuple is the same pair
    const bounds = '\tvar h []any = ' + pair + '\n\tvar x *string = SafeStringPtr(func() any {\n\t\tif 0 >= 0 && 0 < len(h) {\n'
        + '\t\t\treturn DerefScalar(h[0])\n\t\t}\n\t\treturn nil\n\t}())\n\tvar q any = func() any {\n\t\tif 1 >= 0 && 1 < len(h) {\n'
        + '\t\t\treturn DerefScalar(h[1])\n\t\t}\n\t\treturn nil\n\t}()\n\t_ = x\n\t_ = q\n';
    ok (f (bounds).indexOf ('var x *string = xPtr') >= 0, 'the bounded read binds: ' + f (bounds));
    // a TupleSlice holder of a hand-written pair twin, its value read through GetValue
    const tuple = '\tmarginModeparamsQueryVariable := TupleSlice(this.HandleMarginModeAndParams("createOrder", paramsQuery))\n'
        + '\tvar marginMode any = nil\n\tmarginMode = GetValue(marginModeparamsQueryVariable, 0)\n'
        + '\tparamsQuery = marginModeparamsQueryVariable[1]\n\t_ = marginMode\n\t_ = paramsQuery\n';
    const tupleOut = f (tuple);
    ok (tupleOut.indexOf ('TupleSlice(') < 0, 'the tuple holder binds: ' + tupleOut);
    ok (tupleOut.indexOf ('if marginModePtr != nil { marginMode = *marginModePtr }') >= 0, 'the GetValue deref stays a deref: ' + tupleOut);
    return problems;
}
