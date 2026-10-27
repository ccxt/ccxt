// hx10 w7 B02: reading a `[ value, params ]` helper tuple by index.
//
// The printer prints a destructuring of the tuple helpers as a synthetic holder plus one
// `GetValue (holder, k)` read per element; where the Go twin returns a real
// `(T, map[string]any)` pair the holder is built with `TupleSlice (…)`. Element 1 is the params
// dictionary on every return path (`params`, `omit (params, …)`, `extend (…)`), and GetValue's
// only extra step is derefScalar, which is the identity on a map, so `h[1]` reads the same value.
// The same holds for a non-pointer first element (bool, int64, map) of the bool/integer/until
// helpers, and for any slot read through a consumer that derefs its own argument.
//
// A *pointer* first element read into an `any` is left alone: there GetValue's deref is what the
// caller sees, so `h[0]` would change the value's Go type.

// consumers whose own body derefs the argument, so a read through one may use the index at any slot
const B02_DEREF_CONSUMERS = [ 'MapTyped', 'ListTyped', 'SafeStringPtr', 'SafeBoolPtr', 'DerefScalar' ];

// slot indices whose element every return path stores as a derefScalar-invariant value
const B02_PLAIN_SLOTS: { [producer: string]: number[] } = {
    'HandleOptionAndParams': [ 1 ],
    'HandleOptionAndParams2': [ 1 ],
    'HandleOptionStringAndParams': [ 1 ],
    'HandleOptionStringAndParams2': [ 1 ],
    'HandleOptionBoolAndParams': [ 0, 1 ],
    'HandleOptionBoolAndParams2': [ 0, 1 ],
    'HandleOptionIntegerAndParams': [ 0, 1 ],
    'HandleOptionIntegerAndParams2': [ 0, 1 ],
    'HandleParamString': [ 1 ],
    'HandleParamString2': [ 1 ],
    'HandleParamInteger': [ 1 ],
    'HandleParamInteger2': [ 1 ],
    'HandleParamBool': [ 1 ],
    'HandleParamBool2': [ 1 ],
    'HandleMarketTypeAndParams': [ 1 ],
    'HandleSubTypeAndParams': [ 1 ],
    'HandleMarginModeAndParams': [ 1 ],
    'HandleNetworkCodeAndParams': [ 1 ],
    'HandleWithdrawTagAndParams': [ 1 ],
    'HandlePostOnly': [ 0, 1 ],
    'HandleUntilOption': [ 0, 1 ],
    'HandleHfAndParams': [ 1 ],
    'GetMarginMode': [ 1 ],
    'GetInstType': [ 1 ],
    'ResolveAuthType': [ 1 ],
    'OrderRequest': [ 1 ],
};

// exchange-local producers: one `[]any{x, ..., <map>}` return, read in their own file too
const B02_OWN_FILE_PRODUCERS = [ 'HandleHfAndParams', 'GetMarginMode', 'GetInstType', 'ResolveAuthType', 'OrderRequest' ];

// `<indent>[var] <holder> [type] := [TupleSlice (] this.<producer> (`
const B02_HOLDER_RE = /^[ \t]*(?:var )?([A-Za-z_]\w*)(?: (\[\]any|any))? :?= (?:ccxt\.)?(?:TupleSlice\()?this\.(\w+)\(/;

// `var <holder> any = ` of a TupleSlice holder, retyped to the slice the call returns
const RETYPE_RE = /^([ \t]*var [A-Za-z_]\w+) any = /;

// the content with every string/rune/comment body blanked, offsets preserved
function b02Mask (content: string): string {
    const out = content.split ('');
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if ((c === '"') || (c === '\'') || (c === '`')) {
            const quote = c;
            for (i = i + 1; i < content.length; i++) {
                if ((content[i] === '\\') && (quote !== '`')) {
                    out[i] = ' ';
                    i++;
                    continue;
                }
                if (content[i] === quote) {
                    break;
                }
                if (content[i] !== '\n') {
                    out[i] = ' ';
                }
            }
            continue;
        }
        if ((c === '/') && (content[i + 1] === '/')) {
            for (; i < content.length && content[i] !== '\n'; i++) {
                out[i] = ' ';
            }
            continue;
        }
        if ((c === '/') && (content[i + 1] === '*')) {
            for (; i < content.length && !((content[i] === '*') && (content[i + 1] === '/')); i++) {
                if (content[i] !== '\n') {
                    out[i] = ' ';
                }
            }
            out[i] = ' ';
            out[i + 1] = ' ';
            i++;
        }
    }
    return out.join ('');
}

// index of the column-0 `func ` line enclosing line `start`
function b02FunctionStart (maskedLines: string[], start: number): number {
    for (let j = start; j >= 0; j--) {
        if (maskedLines[j].indexOf ('func ') === 0) {
            return j;
        }
    }
    return 0;
}

// index of the first column-0 `}` after line `start` (a generated top-level func body)
function b02FunctionEnd (maskedLines: string[], start: number): number {
    for (let j = start + 1; j < maskedLines.length; j++) {
        if ((maskedLines[j].indexOf ('}') === 0) || (maskedLines[j].indexOf ('func ') === 0)) {
            return j;
        }
    }
    return maskedLines.length;
}

// every `GetValue (holder, k)` in lines [from, to) as [lineIndex, slot, callOffset]
function b02HolderReads (maskedLines: string[], holder: string, from: number, to: number): number[][] {
    const reads: number[][] = [];
    const needle = 'GetValue(' + holder + ',';
    for (let j = from; j < to; j++) {
        let at = maskedLines[j].indexOf (needle);
        while (at >= 0) {
            const match = /^ ?([0-9]+)\)/.exec (maskedLines[j].slice (at + needle.length));
            if (match === null) {
                return [[ -1, -1, -1 ]];
            }
            reads.push ([ j, Number (match[1]), at ]);
            at = maskedLines[j].indexOf (needle, at + needle.length);
        }
    }
    return reads;
}

// every other use of `holder` in lines [from, to): a write, an index, an argument, an address
function b02HolderEscapes (maskedLines: string[], holder: string, from: number, to: number): boolean {
    const word = new RegExp ('(^|[^\\w.])' + holder + '(?![\\w])', 'g');
    for (let j = from; j < to; j++) {
        const line = maskedLines[j];
        let match = word.exec (line);
        while (match !== null) {
            const at = match.index + match[1].length;
            const read = (line.slice (Math.max (0, at - 9), at) === 'GetValue(') && /^, ?[0-9]+\)/.test (line.slice (at + holder.length));
            if (!read) {
                return true;
            }
            match = word.exec (line);
        }
    }
    return false;
}

// where a read lands: a deref consumer (any slot), an `any` sink (slot must be plain), or a box
function b02ReadSink (maskedLines: string[], funcStart: number, line: number, at: number): string {
    const before = maskedLines[line].slice (0, at).replace (/ccxt\.$/, '').trim ();
    const assign = /^([A-Za-z_]\w*) ?(:?=)$/.exec (before);
    if (assign !== null) {
        if (assign[2] === ':=') {
            return 'any';
        }
        const decl = new RegExp ('^[ \\t]*var ' + assign[1] + ' (?:any|interface\\{\\}) *=');
        for (let j = funcStart + 1; j < line; j++) {
            if (decl.test (maskedLines[j])) {
                return 'any';
            }
        }
        return 'blocked';
    }
    const last = before.slice (-1);
    if (last === '(') {
        const callee = /([A-Za-z_]\w*)$/.exec (before.slice (0, -1));
        return ((callee !== null) && (B02_DEREF_CONSUMERS.indexOf (callee[1]) >= 0)) ? 'deref' : 'any';
    }
    return (last === ',') ? 'any' : 'blocked';
}

/**
 * `GetValue (<tuple holder>, k)` -> `<tuple holder>[k]` for the values that read the same through
 * the index. Fail closed: every other shape is returned untouched.
 */
export function b02TupleSliceSlotReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = b02Mask (content).split ('\n');
    if (maskedLines.length !== lines.length) {
        return content;
    }
    const masked = maskedLines.join ('\n');
    const declared = (producer: string) => new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + producer + ' ?\\(').test (masked);
    let changed = false;
    for (let i = 0; i < maskedLines.length; i++) {
        const holder = maskedLines[i].match (B02_HOLDER_RE);
        if (holder === null) {
            continue;
        }
        const name = holder[1];
        const annotation = holder[2];
        const producer = holder[3];
        const slots = B02_PLAIN_SLOTS[producer];
        if ((slots === undefined) || (declared (producer) && (B02_OWN_FILE_PRODUCERS.indexOf (producer) < 0))) {
            continue;
        }
        const funcStart = b02FunctionStart (maskedLines, i);
        const end = b02FunctionEnd (maskedLines, i);
        const reads = b02HolderReads (maskedLines, name, i + 1, end);
        if ((reads.length === 0) || (reads[0][0] < 0) || b02HolderEscapes (maskedLines, name, i + 1, end)) {
            continue;
        }
        const targets: number[][] = [];
        for (let k = 0; k < reads.length; k++) {
            const [ line, slot, at ] = reads[k];
            const sink = b02ReadSink (maskedLines, funcStart, line, at);
            if ((sink === 'deref') || ((sink === 'any') && (slots.indexOf (slot) >= 0))) {
                targets.push ([ line, slot ]);
            }
        }
        if (targets.length === 0) {
            continue;
        }
        // an `any`-annotated holder is an interface value, and indexing it is not Go: the
        // TupleSlice call returns a slice, so the annotation becomes that slice
        if (annotation === 'any') {
            if ((maskedLines[i].indexOf ('TupleSlice(') < 0) || !RETYPE_RE.test (lines[i])) {
                continue;
            }
            lines[i] = lines[i].replace (RETYPE_RE, '$1 []any = ');
            maskedLines[i] = lines[i];
            changed = true;
        }
        for (let k = 0; k < targets.length; k++) {
            const [ line, slot ] = targets[k];
            const prefix = (lines[line].indexOf ('ccxt.GetValue(' + name + ',') >= 0) ? 'ccxt.' : '';
            const spaced = prefix + 'GetValue(' + name + ', ' + slot + ')';
            const compact = prefix + 'GetValue(' + name + ',' + slot + ')';
            const replacement = name + '[' + slot + ']';
            if (lines[line].indexOf (spaced) >= 0) {
                lines[line] = lines[line].split (spaced).join (replacement);
            } else if (lines[line].indexOf (compact) >= 0) {
                lines[line] = lines[line].split (compact).join (replacement);
            } else {
                continue;
            }
            maskedLines[line] = lines[line];
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

/** Self-test: the shipped rules, both directions. */
export function b02TupleSliceSlotSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string) => b02TupleSliceSlotReads ('package ccxt\n\nfunc (this *X) f (p map[string]any) any {\n' + body + '\treturn nil\n}\n');
    const held = '\tvar query any = nil\n\tvar paramsQuery any = nil\n\tqueryparamsQueryVariable := TupleSlice(this.HandleOptionStringAndParams(p, "createOrder", "marginMode"))\n';
    const out = f (held + '\tquery = GetValue(queryparamsQueryVariable, 0)\n\tparamsQuery = GetValue(queryparamsQueryVariable, 1)\n');
    ok (out.indexOf ('paramsQuery = queryparamsQueryVariable[1]') >= 0, 'params slot reads by index');
    ok (out.indexOf ('query = GetValue(queryparamsQueryVariable, 0)') >= 0, 'a pointer slot in an any sink keeps GetValue');
    ok (b02TupleSliceSlotReads (out) === out, 'second application is a no-op');
    // a consumer that derefs its own argument reads the same at any slot
    ok (f (held + '\tvar t *string = SafeStringPtr(GetValue(queryparamsQueryVariable, 0))\n').indexOf ('SafeStringPtr(queryparamsQueryVariable[0])') >= 0, 'a deref consumer takes the index');
    // a map first element of the until helper
    const until = '\tvar p2 any = nil\n\tm := TupleSlice(this.HandleUntilOption("end", p, q))\n\tp2 = GetValue(m, 0)\n\t_ = GetValue(m, 1)\n';
    ok (f (until).indexOf ('p2 = m[0]') >= 0, 'map first element reads by index');
    // kept: the target is declared with a concrete type
    ok (f (held + '\tvar paramsTyped map[string]any = nil\n\tparamsTyped = GetValue(queryparamsQueryVariable, 1)\n').indexOf ('GetValue(queryparamsQueryVariable, 1)') >= 0, 'a concrete-typed target keeps GetValue');
    // kept: the holder escapes (written, indexed, passed on)
    ok (f (held + '\tquery = GetValue(queryparamsQueryVariable, 1)\n\tqueryparamsQueryVariable = nil\n').indexOf ('GetValue(queryparamsQueryVariable, 1)') >= 0, 'a written holder keeps GetValue');
    ok (f (held + '\tquery = GetValue(queryparamsQueryVariable, 1)\n\t_ = queryparamsQueryVariable[0]\n').indexOf ('GetValue(queryparamsQueryVariable, 1)') >= 0, 'an indexed holder keeps GetValue');
    // kept: the file declares the producer, so its signature is the file's
    const sameFile = 'package ccxt\n\nfunc (this *X) HandleOptionStringAndParams (p any, m any, o any, optionalArgs ...any) []any {\n\treturn nil\n}\n\nfunc (this *X) g (p map[string]any) any {\n\tv := TupleSlice(this.HandleOptionStringAndParams(p, "m", "o"))\n\tx := GetValue(v, 1)\n\treturn x\n}\n';
    ok (b02TupleSliceSlotReads (sameFile).indexOf ('GetValue(v, 1)') >= 0, 'an in-file producer keeps GetValue');
    const own = 'package ccxt\n\nfunc (this *X) GetMarginMode (t any, p any) []any {\n\treturn []any{nil, p}\n}\n\nfunc (this *X) g (p map[string]any) any {\n\tvar q any = nil\n\tv := this.GetMarginMode(true, p)\n\tq = GetValue(v, 1)\n\treturn q\n}\n';
    ok (b02TupleSliceSlotReads (own).indexOf ('q = v[1]') >= 0, 'an own-file exchange producer reads by index');
    const pro = own.replace ('q = GetValue(v, 1)', 'q = ccxt.GetValue(v, 1)');
    ok (b02TupleSliceSlotReads (pro).indexOf ('q = v[1]') >= 0, 'a ccxt-qualified read takes the index');
    // a string or comment that looks like a read is not one
    ok (f (held + '\t_ = "GetValue(queryparamsQueryVariable, 1)"\n').indexOf ('paramsQuery') >= 0, 'a literal is untouched');
    // no removable read: the holder annotation is left alone too
    ok (f ('\tvar h any = TupleSlice(this.HandleOptionStringAndParams(p, "m", "o"))\n\t_ = h\n').indexOf ('var h any =') >= 0, 'a kept holder is not retyped');
    return problems;
}
