// hx10w3 G10: IsEqual and the ordered compares read a *string / *int64 / *float64 / *bool operand
// through the helper's derefScalar nil contract, so the printer can emit the nil-guarded native
// compare. Every operand's Go type has to be proven in the function text (typed param, typed local,
// or an `any` local whose every write is that same pointer type); an unproven operand keeps the
// plain helper call, and a string/bool operand only ever equals.

const G10_ELEMENT: { [ptr: string]: string } = {
    '*string': 'string',
    '*int64': 'int64',
    '*float64': 'float64',
    '*bool': 'bool',
    '*int': 'int',
};
const G10_SCALARS = new Set ([ 'string', 'int64', 'float64', 'bool', 'int' ]);
const G10_HELPERS = 'IsEqual|IsLessThan|IsGreaterThan|IsLessThanOrEqual|IsGreaterThanOrEqual';
const G10_ORDERED = new Set ([ 'IsLessThan', 'IsGreaterThan', 'IsLessThanOrEqual', 'IsGreaterThanOrEqual' ]);

// producers whose Go result is a scalar pointer (go/v4/exchange_safe.go, exchange_helpers.go)
const G10_PRODUCER: { [name: string]: string } = {
    'SafeString': '*string',
    'SafeString2': '*string',
    'SafeStringN': '*string',
    'SafeCurrencyCode': '*string',
    'SafeSymbol': '*string',
    'SafeStringLower': '*string',
    'SafeStringLower2': '*string',
    'SafeStringUpper': '*string',
    'SafeStringPtr': '*string',
    'SafeInteger': '*int64',
    'SafeInteger2': '*int64',
    'SafeIntegerN': '*int64',
    'SafeNumber': '*float64',
    'SafeNumber2': '*float64',
    'SafeNumberN': '*float64',
    'SafeBool': '*bool',
    'SafeBool2': '*bool',
    'SafeBoolN': '*bool',
    'SafeBoolPtr': '*bool',
    'GetArgStringPtr': '*string',
    'GetArgInt64Ptr': '*int64',
    'GetArgFloat64Ptr': '*float64',
    'NumberToString': '*string',
};

// literals and comments blanked out, columns kept: structure matches never see a "..." string
function g10Mask (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

function g10Close (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; }
        else if ((c === ')') || (c === ']') || (c === '}')) { depth--; if (depth === 0) { return i; } }
    }
    return -1;
}

// top-level comma split of masked[open+1 .. close-1]; returns [start, end) spans
function g10Args (masked: string, open: number, close: number): number[][] {
    const spans: number[][] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; }
        else if ((c === ')') || (c === ']') || (c === '}')) { depth--; }
        else if ((c === ',') && (depth === 0)) { spans.push ([ start, i ]); start = i + 1; }
    }
    spans.push ([ start, close ]);
    return spans;
}

function g10Strip (text: string): string {
    let t = text.trim ();
    while (t.startsWith ('(') && (g10Close (t, 0) === t.length - 1)) {
        t = t.slice (1, -1).trim ();
    }
    return t;
}

interface G10Scope { types: Map<string, string>; unsafe: Set<string> }

let g10CurrentScope: G10Scope | undefined = undefined;

function g10ScopeType (name: string): string | undefined {
    const scope = g10CurrentScope;
    if (scope === undefined) { return undefined; }
    return scope.unsafe.has (name) ? undefined : scope.types.get (name);
}

function g10Add (scope: G10Scope, name: string, type: string) {
    if (scope.types.has (name) || scope.unsafe.has (name)) { scope.unsafe.add (name); return; }  // shadowed
    if ((type === 'any') || G10_SCALARS.has (type) || (G10_ELEMENT[type] !== undefined)) {
        scope.types.set (name, type);
        return;
    }
    scope.unsafe.add (name);
}

// the parameter list of the signature, as name -> Go type (`a, b *string` groups share the type)
function g10Params (signature: string, scope: G10Scope) {
    let open = signature.indexOf ('(');
    if (open < 0) { return; }
    if (signature.startsWith ('func (')) {
        const recv = signature.indexOf (')', open);
        open = signature.indexOf ('(', recv + 1);
    }
    const close = g10Close (signature, open);
    if (close < 0) { return; }
    let lastType: string | undefined;
    for (const [ s, e ] of g10Args (signature, open, close)) {
        const part = signature.substring (s, e).trim ();
        if (part === '') { continue; }
        const tokens = part.split (/\s+/);
        if (tokens.length >= 2) {
            lastType = tokens.slice (1).join (' ').replace (/^\.\.\./, '');
            g10Add (scope, tokens[0], lastType);
        } else if (lastType !== undefined) {
            g10Add (scope, part, lastType);
        }
    }
}

// the Go type of a proven write's right-hand side: a pointer type, a scalar type, or undefined
function g10Written (line: string, value: string): string | undefined {
    const text = g10Strip (value);
    if (text === '') { return undefined; }
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (text)) { return 'string'; }
    if (/^-?\d+$/.test (text)) { return 'int'; }
    if (/^-?\d+\.\d+$/.test (text)) { return 'float64'; }
    if ((text === 'true') || (text === 'false')) { return 'bool'; }
    if (/^[A-Za-z_]\w*$/.test (text)) { return g10ScopeType (text); }
    const call = /^(?:ccxt\.)?(this\.)?([A-Za-z_]\w*)\(/.exec (text);
    if ((call !== null) && (g10Close (text, text.indexOf ('(', call[2].length)) === text.length - 1)) {
        if ((call[1] !== undefined) && g10Own.has (call[2])) { return undefined; }  // a method the file defines
        if (call[2] === 'DerefScalar') {
            // DerefScalar(x) is nil or the pointer's element, never a box
            const inner = g10Strip (text.substring (text.indexOf ('(') + 1, text.length - 1));
            const innerType = g10ScopeType (inner);
            return (innerType === undefined) ? undefined : G10_ELEMENT[innerType];
        }
        return G10_PRODUCER[call[2]];
    }
    return undefined;
}

// the left-hand side of the first assignment on a masked line (`:=` or a bare `=`), or undefined
function g10AssignmentLhs (masked: string): string | undefined {
    for (let i = 0; i < masked.length; i++) {
        const c = masked[i];
        if (c === ':') {
            if (masked[i + 1] === '=') { return masked.substring (0, i); }
            continue;
        }
        if (c !== '=') { continue; }
        if (masked[i + 1] === '=') { i++; continue; }
        if ('!<>+-*/%&|^'.includes (masked[i - 1] ?? '')) { continue; }
        return masked.substring (0, i);
    }
    return undefined;
}

let g10Own: Set<string> = new Set ();

// an `any` local is that pointer type when every one of its writes is the same pointer type
function g10JoinedType (name: string, body: string, maskedBody: string): string | undefined {
    const lines = body.split ('\n');
    const maskedLines = maskedBody.split ('\n');
    let shape: string | undefined;
    for (let i = 0; i < maskedLines.length; i++) {
        const masked = maskedLines[i];
        const mention = new RegExp ('(?<![\\w.])' + name + '(?![\\w])');
        if (!mention.test (masked)) { continue; }
        if (new RegExp ('&' + name + '(?![\\w])').test (masked)) { return undefined; }  // address taken
        if (new RegExp ('func\\s*\\([^)]*\\b' + name + '\\b').test (masked)) { return undefined; }  // closure parameter
        const decl = new RegExp ('^\\s*var ' + name + ' any(?: = (.*))?$').exec (masked);
        const write = (decl === null) ? new RegExp ('^\\s*' + name + ' = (.*)$').exec (masked) : null;
        if ((decl === null) && (write === null)) {
            // any other write shape (`x, name :=`, `name += 1`, `name++`, a second declaration) is unproven
            if (new RegExp ('(?<![\\w.])' + name + '\\s*(?:[-+*/%|&^]=(?!=)|\\+\\+|--)').test (masked)) { return undefined; }
            const lhs = g10AssignmentLhs (masked);
            if ((lhs !== undefined) && mention.test (lhs)) { return undefined; }
            if (new RegExp ('^\\s*var ' + name + ' ').test (masked)) { return undefined; }
            continue;
        }
        const rhs = (decl !== null) ? decl[1] : (write as RegExpExecArray)[1];
        if ((rhs === undefined) || (g10Strip (rhs) === 'nil')) { continue; }  // nil is no type evidence
        const eq = masked.indexOf ('=', (decl !== null) ? masked.indexOf ('var ') : 0);
        const value = (eq < 0) ? '' : lines[i].substring (eq + 1);
        const t = g10Written (value, value.replace (/^\s+/, ''));
        if (t === undefined) { return undefined; }
        const kind = (G10_ELEMENT[t] === undefined) ? 'val' : 'ptr';
        if (shape === undefined) {
            shape = kind + ':' + t;
        } else if (shape !== (kind + ':' + t)) {
            return undefined;
        }
    }
    if (shape === undefined) { return undefined; }
    // only the value shape is usable: an `any` local keeps its static interface type, so a box that
    // holds a pointer cannot be dereferenced and keeps the helper call
    return shape.startsWith ('val:') ? ('box:' + shape.substring (4)) : undefined;
}

function g10JoinAny (scope: G10Scope, body: string, maskedBody: string) {
    for (const line of maskedBody.split ('\n')) {
        const decl = /^\s*var (\w+) any(?: = .*)?$/.exec (line);
        if (decl === null) { continue; }
        const name = decl[1];
        if (scope.unsafe.has (name) || (scope.types.get (name) !== 'any')) { continue; }
        const joined = g10JoinedType (name, body, maskedBody);
        if (joined !== undefined) { scope.types.set (name, joined); }
    }
}

interface G10Desc { ptr?: string, box?: string, elem: string }
interface G10Value { kind: string, text: string }

// the box a bare name carries, when its Go type is proven; a deref is a value, a call is not a box here
function g10Pointer (text: string, masked: string): G10Desc | undefined {
    const t = g10Strip (text);
    if (!/^[A-Za-z_]\w*$/.test (t)) { return undefined; }
    const type = g10ScopeType (t);
    if (type === undefined) { return undefined; }
    if (G10_ELEMENT[type] !== undefined) { return { 'ptr': t, 'elem': G10_ELEMENT[type] }; }
    if (type.startsWith ('box:')) { return { 'box': t, 'elem': type.substring (4) }; }
    return undefined;
}

// a non-pointer operand whose Go value type is proven
function g10Value (text: string, masked: string): G10Value | undefined {
    const t = g10Strip (text);
    const m = g10Strip (masked);
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (t) || t.startsWith ('`')) { return { 'kind': 'string', 'text': t }; }
    if (m === '') { return undefined; }
    if ((m === 'true') || (m === 'false')) { return { 'kind': 'bool', 'text': t }; }
    if (/^\d+$/.test (m)) { return { 'kind': 'ilit', 'text': t }; }
    if (/^\d+\.\d+$/.test (m)) { return { 'kind': 'flit', 'text': t }; }
    const deref = /^\*([A-Za-z_]\w*)$/.exec (m);
    if (deref !== null) {
        const type = g10ScopeType (deref[1]);
        const elem = (type === undefined) ? undefined : G10_ELEMENT[type];
        return (elem === undefined) ? undefined : { 'kind': elem, 'text': t };
    }
    if (/^[A-Za-z_]\w*$/.test (t)) {
        const type = g10ScopeType (t);
        if ((type !== undefined) && G10_SCALARS.has (type)) { return { 'kind': type, 'text': t }; }
    }
    return undefined;
}

function g10Fits (elem: string, kind: string): boolean {
    if (elem === kind) { return true; }
    if ((elem === 'int64') || (elem === 'int')) { return kind === 'ilit'; }
    if (elem === 'float64') { return (kind === 'ilit') || (kind === 'flit'); }
    return false;
}

// the native compare for two proven operands, or undefined to keep the helper call
function g10Native (helper: string, a: G10Desc | G10Value, b: G10Desc | G10Value): string | undefined {
    const ap = (a as G10Desc).ptr;
    const bp = (b as G10Desc).ptr;
    const ordered = G10_ORDERED.has (helper);
    const ab = (a as G10Desc).box;
    const bb = (b as G10Desc).box;
    if ((ab !== undefined) || (bb !== undefined)) {
        // a nil-or-string box against a *string: the helper's nil/nil equality is the first clause
        const box = (ab !== undefined) ? (a as G10Desc) : (b as G10Desc);
        const other = (ab !== undefined) ? (b as G10Desc) : (a as G10Desc);
        if ((box.box === undefined) || (other.ptr === undefined) || (box.elem !== 'string') || (other.elem !== 'string')) { return undefined; }
        return '((' + box.box + ' == nil && ' + other.ptr + ' == nil) || (' + other.ptr + ' != nil && ' + box.box + ' == *' + other.ptr + '))';
    }
    if ((ap !== undefined) && (bp !== undefined)) {
        const elem = (a as G10Desc).elem;
        if (elem !== (b as G10Desc).elem) { return undefined; }
        if (ordered && (elem !== 'int64') && (elem !== 'float64') && (elem !== 'int')) { return undefined; }  // the helper only orders numbers
        if (helper === 'IsEqual') {
            return '((' + ap + ' == nil && ' + bp + ' == nil) || (' + ap + ' != nil && ' + bp + ' != nil && *' + ap + ' == *' + bp + '))';
        }
        if (helper === 'IsLessThan') {
            return '((' + ap + ' == nil && ' + bp + ' != nil) || (' + ap + ' != nil && ' + bp + ' != nil && *' + ap + ' < *' + bp + '))';
        }
        if (helper === 'IsGreaterThan') {
            return '(' + ap + ' != nil && (' + bp + ' == nil || *' + ap + ' > *' + bp + '))';
        }
        if (helper === 'IsGreaterThanOrEqual') {
            return '((' + ap + ' == nil && ' + bp + ' == nil) || (' + ap + ' != nil && (' + bp + ' == nil || *' + ap + ' >= *' + bp + ')))';
        }
        return '(' + ap + ' == nil || ' + bp + ' == nil || *' + ap + ' <= *' + bp + ')';
    }
    if (ap === undefined) {
        // the pointer is the right operand; the left one is a proven value
        const v = (a as G10Value);
        const elem = (b as G10Desc).elem;
        if (!g10Fits (elem, v.kind)) { return undefined; }
        if (ordered && (elem !== 'int64') && (elem !== 'float64') && (elem !== 'int')) { return undefined; }
        if (ap === undefined && helper === 'IsEqual') { return '(' + bp + ' != nil && ' + v.text + ' == *' + bp + ')'; }
        if (helper === 'IsLessThan') { return '(' + bp + ' != nil && ' + v.text + ' < *' + bp + ')'; }
        if (helper === 'IsGreaterThan') { return '(' + bp + ' == nil || ' + v.text + ' > *' + bp + ')'; }
        if (helper === 'IsGreaterThanOrEqual') { return '(' + bp + ' == nil || ' + v.text + ' >= *' + bp + ')'; }
        return '(' + bp + ' != nil && ' + v.text + ' <= *' + bp + ')';
    }
    const v = (b as G10Value);
    const elem = (a as G10Desc).elem;
    if (!g10Fits (elem, v.kind)) { return undefined; }
    if (ordered && (elem !== 'int64') && (elem !== 'float64') && (elem !== 'int')) { return undefined; }
    if (helper === 'IsEqual') { return '(' + ap + ' != nil && *' + ap + ' == ' + v.text + ')'; }
    if (helper === 'IsLessThan') { return '(' + ap + ' == nil || *' + ap + ' < ' + v.text + ')'; }
    if (helper === 'IsGreaterThan') { return '(' + ap + ' != nil && *' + ap + ' > ' + v.text + ')'; }
    if (helper === 'IsGreaterThanOrEqual') { return '(' + ap + ' != nil && *' + ap + ' >= ' + v.text + ')'; }
    return '(' + ap + ' == nil || *' + ap + ' <= ' + v.text + ')';
}

function g10Block (block: string, masked: string): string {
    const open = masked.indexOf ('{');
    if (open < 0) { return block; }
    const signature = block.substring (0, open);
    const body = block.substring (open);
    const maskedBody = masked.substring (open);
    const scope: G10Scope = { 'types': new Map (), 'unsafe': new Set () };
    g10Params (signature, scope);
    for (const line of maskedBody.split ('\n')) {
        const decl = /^\s*var (\w+) ([^=\n]+?)(?: = .*)?$/.exec (line);
        if (decl !== null) { g10Add (scope, decl[1], decl[2].trim ()); }
    }
    g10CurrentScope = scope;
    g10JoinAny (scope, body, maskedBody);
    const edits: Array<{ s: number, e: number, text: string }> = [];
    const re = new RegExp ('(?<![\\w.])(?:ccxt\\.)?(' + G10_HELPERS + ')\\(', 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec (masked)) !== null) {
        const callOpen = m.index + m[0].length - 1;
        const close = g10Close (masked, callOpen);
        if (close < 0) { continue; }
        const spans = g10Args (masked, callOpen, close);
        if (spans.length !== 2) { continue; }
        const at = spans[0];
        const bt = spans[1];
        const ad = g10Pointer (block.substring (at[0], at[1]), masked.substring (at[0], at[1])) ?? g10Value (block.substring (at[0], at[1]), masked.substring (at[0], at[1]));
        const bd = g10Pointer (block.substring (bt[0], bt[1]), masked.substring (bt[0], bt[1])) ?? g10Value (block.substring (bt[0], bt[1]), masked.substring (bt[0], bt[1]));
        if ((ad === undefined) || (bd === undefined)) { continue; }
        const native = g10Native (m[1], ad, bd);
        if (native === undefined) { continue; }
        edits.push ({ 's': m.index, 'e': close + 1, 'text': native });
    }
    g10CurrentScope = undefined;
    if (edits.length === 0) { return block; }
    let out = block;
    for (let i = edits.length - 1; i >= 0; i--) {
        out = out.substring (0, edits[i].s) + edits[i].text + out.substring (edits[i].e);
    }
    return out;
}

export function hx10w3G10 (content: string): string {
    if (!/(?:IsEqual|IsLessThan|IsGreaterThan)\(/.test (content) && !/(?:IsLessThanOrEqual|IsGreaterThanOrEqual)\(/.test (content)) { return content; }
    const masked = g10Mask (content);
    g10Own = new Set ();
    const own = /^func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\(/gm;
    let ownMatch: RegExpExecArray | null;
    while ((ownMatch = own.exec (masked)) !== null) { g10Own.add (ownMatch[1]); }
    const starts: number[] = [];
    const re = /^func /gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec (masked)) !== null) { starts.push (m.index); }
    if (starts.length === 0) { return content; }
    let out = '';
    let cursor = 0;
    for (let i = 0; i < starts.length; i++) {
        const end = (i + 1 < starts.length) ? starts[i + 1] : content.length;
        out += content.substring (cursor, starts[i]) + g10Block (content.substring (starts[i], end), masked.substring (starts[i], end));
        cursor = end;
    }
    return out + content.substring (cursor);
}

export function g10SelfCheck (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10w3 G10: ' + msg); } };
    const head = 'package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\n';
    const f = (body: string, params = '') => head + 'func (this *X) f(' + params + ') any {\n' + body + '\n\treturn nil\n}\n';
    const run = (text: string) => hx10w3G10 (text);
    // both operands are proven pointers: the helper's nil/nil contract is kept
    const both = f ('\tvar a *string = this.SafeString(o, "a")\n\tvar b *string = this.SafeString(o, "b")\n\tif IsEqual(a, b) {\n\t}');
    ok (run (both).indexOf ('if ((a == nil && b == nil) || (a != nil && b != nil && *a == *b)) {') >= 0, 'two *string pointers: ' + run (both));
    const negated = f ('\tvar a *string = this.SafeString(o, "a")\n\tvar b *string = this.SafeString(o, "b")\n\tif !IsEqual(a, b) {\n\t}');
    ok (run (negated).indexOf ('if !((a == nil && b == nil) || (a != nil && b != nil && *a == *b)) {') >= 0, 'negation keeps its operator: ' + run (negated));
    // a boxed `any` local whose only write is that pointer type joins to it
    const joined = f ('\tvar a any = nil\n\ta = this.SafeString(o, "a")\n\tif !IsEqual(a, b) {\n\t}', 'b *string');
    ok (run (joined) === joined, 'a box that holds a pointer keeps the helper (an any local cannot be dereferenced)');
    const mixed = f ('\tvar a any = nil\n\ta = this.SafeString(o, "b")\n\ta = this.SafeInteger(o, "n")\n\tif !IsEqual(a, b) {\n\t}', 'b *string');
    ok (run (mixed) === mixed, 'a second write type keeps the helper');
    // one pointer against a matching value
    const one = f ('\tif IsEqual(cur, "x") {\n\t}', 'cur *string');
    ok (run (one).indexOf ('if (cur != nil && *cur == "x") {') >= 0, 'a *string parameter gets the nil-guarded compare: ' + run (one));
    const ints = f ('\tvar n *int64 = this.SafeInteger(o, "n")\n\tif IsLessThan(n, 5) {\n\t}');
    ok (run (ints).indexOf ('if (n == nil || *n < 5) {') >= 0, 'nil is less than a value: ' + run (ints));
    const gte = f ('\tvar n *int64 = this.SafeInteger(o, "n")\n\tvar m *int64 = this.SafeInteger(o, "m")\n\tif IsGreaterThanOrEqual(n, m) {\n\t}');
    ok (run (gte).indexOf ('((n == nil && m == nil) || (n != nil && (m == nil || *n >= *m)))') >= 0, 'both nil is greater-or-equal: ' + run (gte));
    const booleans = f ('\tif IsEqual(flag, true) {\n\t}', 'flag *bool');
    ok (run (booleans).indexOf ('(flag != nil && *flag == true)') >= 0, 'a *bool parameter: ' + run (booleans));
    const valueLeft = f ('\tif IsEqual(3, n) {\n\t}', 'n *int64');
    ok (run (valueLeft).indexOf ('(n != nil && 3 == *n)') >= 0, 'the pointer on the right: ' + run (valueLeft));
    // kept: unproven operand, string ordering, mismatched element types
    const anyParam = f ('\tif IsEqual(a, b) {\n\t}', 'a any, b any');
    ok (run (anyParam) === anyParam, 'unproven parameters keep the helper');
    const stringOrder = f ('\tvar a *string = this.SafeString(o, "a")\n\tvar b *string = this.SafeString(o, "b")\n\tif IsLessThan(a, b) {\n\t}');
    ok (run (stringOrder) === stringOrder, 'string ordering keeps the helper (the helper only orders numbers)');
    const mismatch = f ('\tvar a *string = this.SafeString(o, "a")\n\tvar b *int64 = this.SafeInteger(o, "b")\n\tif IsEqual(a, b) {\n\t}');
    ok (run (mismatch) === mismatch, 'different element types keep the helper');
    const floatLit = f ('\tvar n *int64 = this.SafeInteger(o, "n")\n\tif IsEqual(n, 1.5) {\n\t}');
    ok (run (floatLit) === floatLit, 'a float literal vs int64 keeps the helper');
    const shadow = f ('\tif IsEqual(a, b) {\n\t\tvar a any = nil\n\t}', 'a *string, b *string');
    ok (run (shadow) === shadow, 'a shadowed name keeps the helper');
    const method = f ('\tif IsEqual(this.SafeString(o, "a"), b) {\n\t}', 'b *string');
    ok (run (method) === method, 'a call operand keeps the helper');
    // a nil-or-string box against the pointer it came from
    const boxed = f ('\tvar mode any = nil\n\tmode = DerefScalar(cur)\n\tif !IsEqual(mode, cur) {\n\t}', 'cur *string');
    ok (run (boxed).indexOf ('!((mode == nil && cur == nil) || (cur != nil && mode == *cur))') >= 0, 'a DerefScalar box: ' + run (boxed));
    const textBox = f ('\tvar kind any = nil\n\tkind = "super-margin"\n\tif IsEqual(kind, cur) {\n\t}', 'cur *string');
    ok (run (textBox).indexOf ('((kind == nil && cur == nil) || (cur != nil && kind == *cur))') >= 0, 'a literal-string box: ' + run (textBox));
    const numBox = f ('\tvar idx any = nil\n\tidx = 0\n\tif IsEqual(idx, cur) {\n\t}', 'cur *int64');
    ok (run (numBox) === numBox, 'a numeric box keeps the helper (the helper coerces int and int64)');
    const twice = f ('\tvar a any = nil\n\ta = this.SafeString(o, "a")\n\tif !IsEqual(a, b) && !IsEqual(a, b) {\n\t}', 'b *string');
    ok (run (run (twice)) === run (twice), 'idempotent');
    ok (run (both) === run (run (both)), 'idempotent on the typed form');
    return problems;
}
