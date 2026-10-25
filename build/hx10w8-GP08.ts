// hx10w8 GP08: a `[ value, params ] = this.handle<…>AndParams (…)` destructure whose Go twin
// returns `(*string, map[string]any)` prints a TupleSlice holder plus one GetValue per element.
// Once the value local is the `*string` that same pair holds, both results bind natively and the
// params slot keeps the `any` box it had (a map assigns into it unchanged).

// slot-0 Go type of every `(value, params)` helper twin (go/v4/exchange_market_type.go): the
// Nullable overloads return a []any and are not listed
const GP08_FIRST_RESULT_SLOT: { [producer: string]: string } = {
    'HandleMarketTypeAndParams': '*string', 'HandleSubTypeAndParams': '*string',
    'HandleOptionStringAndParams': '*string', 'HandleOptionStringAndParams2': '*string',
    'HandleMarginModeAndParams': '*string', 'HandleUntilOption': 'map[string]any',
    'HandleOptionBoolAndParams': 'bool', 'HandleOptionBoolAndParams2': 'bool',
    'HandleOptionIntegerAndParams': 'int64', 'HandleOptionIntegerAndParams2': 'int64',
};
const GP08_PAIR_PRODUCERS = Object.keys (GP08_FIRST_RESULT_SLOT);

// `var x T = <conversion>(GetValue(TupleSlice(this.<P>(…)), 0)) // note`
const GP08_DECL_RE = /^([ \t]*)var ([A-Za-z_]\w*) (\*string|\*bool|\*int64|bool|int64|map\[string\]any|any) = (.*?)([ \t]*\/\/.*)?$/;

// the element read itself, whichever conversion wraps it: GetValue's deref is what every one of
// these performs on its argument, so the native first result is the same value
function gp08FirstResult (expression: string): { call: string, producer: string, conversion: string } | undefined {
    const core = 'GetValue\\((?:ccxt\\.)?TupleSlice\\((this\\.(\\w+)\\(.*\\))\\), 0\\)';
    const conversions = [ 'SafeStringPtr', 'SafeBoolPtr', 'MapTyped', 'GetValueBool', 'Int64Value' ];
    for (const conversion of [ '' ].concat (conversions)) {
        const pattern = (conversion === '') ? core : ('(?:ccxt\\.)?' + conversion + '\\(' + core + '\\)');
        const match = new RegExp ('^' + pattern + '$').exec (expression);
        if (match !== null) {
            return { 'call': match[1], 'producer': match[2], 'conversion': conversion };
        }
    }
    return undefined;
}

// `SafeStringPtr(holder[0])`, `MapTyped(GetValue(holder, 0))`, `holder[0]`: element 0 of a holder
function gp08HolderSlot0 (expression: string, holder: string): { conversion: string } | undefined {
    const bare = '(?:ccxt\\.)?' + holder + '\\[0\\]';
    const body = '(?:(?:ccxt\\.)?GetValue\\(' + bare + '\\)|' + bare + ')';
    for (const conversion of [ '', 'SafeStringPtr', 'SafeBoolPtr', 'MapTyped', 'GetValueBool', 'Int64Value' ]) {
        const pattern = (conversion === '') ? body : ('(?:ccxt\\.)?' + conversion + '\\(' + body + '\\)');
        if (new RegExp ('^' + pattern + '$').test (expression)) {
            return { 'conversion': conversion };
        }
    }
    return undefined;
}

// `[var] holder [ []any] := TupleSlice(this.<P>(…))` (also the `var holder []any =` twin)
const GP08_HOLDER_RE = /^([ \t]*)(?:var ([A-Za-z_]\w*) \[\]any = |([A-Za-z_]\w*) := )(?:ccxt\.)?TupleSlice\((this\.(\w+)\(.*\))\)$/;

function gp08Slot0Re (holder: string): RegExp {
    return new RegExp ('^[ \\t]*([A-Za-z_]\\w*) = (?:ccxt\\.)?GetValue\\(' + holder + ', 0\\)$');
}

// the params element: `b = h[1]`, `b = MapTyped(h[1])`, `b = MapTyped(GetValue(h, 1))`, `b = GetValue(h, 1)`
function gp08Slot1Re (holder: string): RegExp {
    return new RegExp ('^[ \\t]*([A-Za-z_]\\w*) = (?:(?:ccxt\\.)?MapTyped\\((?:ccxt\\.)?(?:GetValue\\()?' + holder
        + '\\[1\\]\\)?\\)?|(?:ccxt\\.)?(?:GetValue\\()?' + holder + '\\[1\\]\\)?)$');
}

// reads a `*string` local answers exactly like the boxed string it replaced: every helper below
// runs derefScalar on the value (`ToUpper`/`IsString`/`IsEqual`/the type predicates) or tests nil
const GP08_SAFE_READS: RegExp[] = [
    /([A-Za-z_]\w*) (?:!=|==) nil/g,
    /(?:ToUpper|ToLower|IsString|DerefScalar)\(([A-Za-z_]\w*)\)/g,
    /IsEqual\(([A-Za-z_]\w*),/g,
    /IsEqual\([^()]*,\s*([A-Za-z_]\w*)\)/g,
    /this\.(?:IsLinear|IsInverse)\([^()]*,\s*([A-Za-z_]\w*)\)/g,
    /\*([A-Za-z_]\w*)/g,
    /_ = ([A-Za-z_]\w*)$/g,
];

// the content with every string/rune/comment body blanked, offsets and lines preserved
function gp08Mask (content: string): string {
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

function gp08Mentions (line: string, name: string): boolean {
    return new RegExp ('(^|[^A-Za-z0-9_.])' + name + '([^A-Za-z0-9_]|$)').test (line);
}

// top-level `func` line index of the function holding line `index`, or -1
function gp08FunctionStart (maskedLines: string[], index: number): number {
    for (let j = index; j >= 0; j--) {
        if (/^func /.test (maskedLines[j])) {
            return j;
        }
    }
    return -1;
}

function gp08FunctionEnd (maskedLines: string[], index: number): number {
    for (let j = index; j < maskedLines.length; j++) {
        if (/^\}/.test (maskedLines[j])) {
            return j;
        }
    }
    return maskedLines.length - 1;
}

// every read of the retyped local must be one a `*string` answers like the boxed string did
function gp08ReadsAreSafe (name: string, maskedLines: string[], start: number, end: number, skip: Set<number>): boolean {
    for (let j = start; j <= end; j++) {
        if (skip.has (j)) {
            continue;
        }
        const line = maskedLines[j];
        if (!gp08Mentions (line, name)) {
            continue;
        }
        let rest = line;
        for (const pattern of GP08_SAFE_READS) {
            rest = rest.replace (pattern, (match: string, group: string) => ((group === name) ? ' ' : match));
        }
        if (gp08Mentions (rest, name)) {
            return false;
        }
    }
    return true;
}

/** `[ value, params ] = this.handle<…>AndParams (…)` read through a TupleSlice holder. */
export function hx10w8Gp08TuplePairBinds (content: string): string {
    if (content.indexOf ('TupleSlice(') < 0) {
        return content;
    }
    const lines = content.split ('\n');
    const maskedLines = gp08Mask (content).split ('\n');
    if (maskedLines.length !== lines.length) {
        return content;
    }
    const masked = maskedLines.join ('\n');
    const declared = (producer: string) => new RegExp ('(?:^|\\n)func \\(this \\*\\w+\\) ' + producer + ' ?\\(').test (masked);
    const edits = new Map<number, string[] | null> ();   // index -> replacement lines, null drops it
    let changed = false;
    for (let i = 0; i < maskedLines.length; i++) {
        if (edits.has (i)) {
            continue;
        }
        const head = maskedLines[i].match (GP08_DECL_RE);
        const shape = (head === null) ? undefined : gp08FirstResult (head[4].trim ());
        if ((head !== null) && (shape !== undefined) && (GP08_FIRST_RESULT_SLOT[shape.producer] !== undefined) && !declared (shape.producer)) {
            // the masked line decides the shape; the raw line carries the literal argument text
            const first = lines[i].match (GP08_DECL_RE) ?? head;
            const raw = gp08FirstResult (first[4].trim ());
            if (raw !== undefined) {
                const replacement = gp08FirstResultDeclaration (first, raw, GP08_FIRST_RESULT_SLOT[shape.producer], maskedLines);
                if (replacement !== undefined) {
                    edits.set (i, replacement);
                    changed = true;
                    continue;
                }
            }
        }
        const holderShape = maskedLines[i].match (GP08_HOLDER_RE);
        if ((holderShape === null) || (GP08_PAIR_PRODUCERS.indexOf (holderShape[5]) < 0) || declared (holderShape[5])) {
            continue;
        }
        const holder = lines[i].match (GP08_HOLDER_RE) ?? holderShape;
        const holderName = holder[2] ?? holder[3];
        const assignShape = maskedLines[i + 1]?.match (gp08Slot0Re (holderName)) ?? null;
        const declareShape = (assignShape === null) ? (maskedLines[i + 1]?.match (GP08_DECL_RE) ?? null) : null;
        const declaredSlot = (declareShape === null) ? undefined : gp08HolderSlot0 (declareShape[4].trim (), holderName);
        if ((assignShape === null) && (declaredSlot === undefined)) {
            continue;
        }
        const slot1 = (assignShape === null) ? null : (maskedLines[i + 2]?.match (gp08Slot1Re (holderName)) ?? null);
        const params = (slot1 === null) ? undefined : slot1[1];
        if ((params !== undefined) && ((params === assignShape?.[1]) || (params === holderName))) {
            continue;
        }
        const consumed = new Set<number> ([ i, i + 1 ]);
        if (assignShape !== null) {
            consumed.add (i + 2);
        }
        const start = gp08FunctionStart (maskedLines, i);
        const end = gp08FunctionEnd (maskedLines, i);
        if (start < 0) {
            continue;
        }
        // the holder reads nowhere else: every other mention is a second use the pair cannot serve
        let escaped = false;
        for (let j = start; j <= end; j++) {
            if (!consumed.has (j) && gp08Mentions (maskedLines[j], holderName)) {
                escaped = true;
                break;
            }
        }
        if (escaped) {
            continue;
        }
        if (declaredSlot !== undefined) {
            // `var x T = SafeStringPtr(holder[0])`: the only read of the holder, so the call binds it
            const first = lines[i + 1].match (GP08_DECL_RE) ?? declareShape;
            const producer = holderShape[5];
            const slot = GP08_FIRST_RESULT_SLOT[producer];
            const replacement = (slot === undefined) ? undefined
                : gp08FirstResultDeclaration (first, { 'call': holder[4], 'producer': producer, 'conversion': declaredSlot.conversion },
                    slot, maskedLines, i + 1, true);
            if (replacement === undefined) {
                continue;
            }
            edits.set (i, null);
            edits.set (i + 1, replacement);
            changed = true;
            continue;
        }
        const value = assignShape[1];
        // the value local is declared `any = nil` once, before the block
        let at = -1;
        for (let j = start; j < i; j++) {
            if (new RegExp ('^[ \\t]*var ' + value + ' any = nil$').test (maskedLines[j])) {
                if (at >= 0) {
                    at = -2;
                    break;
                }
                at = j;
            }
        }
        if (at < 0) {
            continue;
        }
        const skip = new Set<number> ([ at, i + 1 ]);
        if (!gp08ReadsAreSafe (value, maskedLines, start, end, skip)) {
            continue;
        }
        edits.set (at, [ lines[at].replace (/ any = nil$/, ' *string = nil') ]);
        edits.set (i, null);
        edits.set (i + 1, [ holder[1] + value + ', ' + ((params === undefined) ? '_' : params) + ' = ' + holder[4] ]);
        if (params !== undefined) {
            edits.set (i + 2, null);
        }
        changed = true;
    }
    if (!changed) {
        return content;
    }
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const edit = edits.get (i);
        if (edit === undefined) {
            out.push (lines[i]);
        } else if (edit !== null) {
            out.push (...edit);
        }
    }
    return out.join ('\n');
}

// `var x T = <conversion>(GetValue(TupleSlice(call), 0))` -> `x, _ := call`, or the two lines that
// bind the slot's value and take its address when the local is the pointer twin of that value
function gp08FirstResultDeclaration (first: RegExpMatchArray, raw: { call: string, producer: string, conversion: string },
    slot: string, maskedLines: string[], index: number, declare = false): string[] | undefined {
    const [ indent, name, target, , note ] = [ first[1], first[2], first[3], first[4], first[5] ?? '' ];
    const matching = {
        '*string': [ [ '*string', 'SafeStringPtr' ], [ 'any', 'MapTyped' ] ],
        'map[string]any': [ [ 'any', '' ], [ 'map[string]any', 'MapTyped' ] ],
        'bool': [ [ 'bool', 'GetValueBool' ], [ 'bool', '' ] ],
        'int64': [ [ 'int64', 'Int64Value' ], [ 'int64', '' ] ],
    }[slot] ?? [];
    if (matching.some (([ type, conversion ]: string[]) => (target === type) && (raw.conversion === conversion))) {
        // the holder form keeps the local's own `var x *string = nil` declaration: the printer types
        // every later read from that annotation, and `:=` would drop it
        if (declare && (target === slot) && (target.charAt (0) === '*')) {
            return [ indent + 'var ' + name + ' ' + target + ' = nil', indent + name + ', _ = ' + raw.call + note ];
        }
        return [ indent + name + ', _ := ' + raw.call + note ];
    }
    // `var x *bool = SafeBoolPtr(GetValue(…))`: the helper returns a plain bool, so the local is
    // that bool's address (SafeBoolPtr boxes a copy of the same value)
    const pointer = { '*bool': [ 'bool', 'SafeBoolPtr' ], '*int64': [ 'int64', 'SafeInt64Ptr' ] }[target];
    if ((pointer !== undefined) && (pointer[0] === slot) && (raw.conversion === pointer[1])) {
        const temporary = name + 'Value';
        let clashes = false;
        const start = gp08FunctionStart (maskedLines, index);
        const end = gp08FunctionEnd (maskedLines, index);
        for (let j = start; (j >= 0) && (j <= end); j++) {
            clashes = clashes || gp08Mentions (maskedLines[j], temporary);
        }
        if (clashes) {
            return undefined;
        }
        return [ indent + temporary + ', _ := ' + raw.call, indent + name + ' := &' + temporary + note ];
    }
    return undefined;
}

/** Self-test: the shipped rules, both directions. */
export function hx10w8Gp08SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push (message); } };
    const f = (body: string) => hx10w8Gp08TuplePairBinds ('package ccxt\n\nfunc (this *X) f (p map[string]any) any {\n' + body + '\treturn nil\n}\n');
    const pair = 'this.HandleMarginModeAndParams("createOrder", p)';
    const held = '\tvar marginMode any = nil\n\tvar query any = nil\n\tmarginModequeryVariable := TupleSlice(' + pair + ')\n'
        + '\tmarginMode = GetValue(marginModequeryVariable, 0)\n\tquery = marginModequeryVariable[1]\n';
    // the holder collapses into one assignment and the value local becomes the pair's *string
    const bound = f (held + '\tif marginMode != nil && *marginMode == "isolated" {\n\t\t_ = query\n\t}\n');
    ok (bound.indexOf ('marginModequeryVariable') < 0, 'holder dropped: ' + bound);
    ok (bound.indexOf ('\tvar marginMode *string = nil\n') >= 0, 'value local retyped: ' + bound);
    ok (bound.indexOf ('\tmarginMode, query = ' + pair + '\n') >= 0, 'native pair binding: ' + bound);
    ok (hx10w8Gp08TuplePairBinds (bound) === bound, 'second application is a no-op');
    // an element read on the call itself is the same pair, first result only
    const direct = f ('\tvar subType *string = SafeStringPtr(GetValue(TupleSlice(this.HandleSubTypeAndParams("fetchTime", nil, p)), 0))\n\t_ = subType\n');
    ok (direct.indexOf ('\tsubType, _ := this.HandleSubTypeAndParams("fetchTime", nil, p)\n') >= 0, 'element read binds natively: ' + direct);
    // the held pair read once, through its typed first element: the local keeps its own `var` line
    const heldPair = f ('\tvar marginParams []any = TupleSlice(' + pair + ')\n\tvar marginMode *string = SafeStringPtr(marginParams[0])\n\t_ = marginMode\n');
    ok (heldPair.indexOf ('\tvar marginMode *string = nil\n\tmarginMode, _ = ' + pair + '\n') >= 0, 'held pair binds natively: ' + heldPair);
    ok (heldPair.indexOf ('TupleSlice(') < 0, 'held pair drops the box: ' + heldPair);
    // a holder read anywhere else keeps the box
    ok (f (held + '\t_ = marginModequeryVariable\n').indexOf ('marginModequeryVariable') >= 0, 'escaped holder kept');
    // a value local stored into an `any` slot keeps the box: the store would hand on a pointer
    ok (f (held + '\tquery["marginMode"] = marginMode\n').indexOf ('marginModequeryVariable') >= 0, 'stored value keeps the box');
    // a local that is written twice keeps the box
    ok (f (held + '\tmarginMode = DerefScalar(this.SafeString(query, "marginMode"))\n\tif marginMode != nil {\n\t\t_ = marginMode\n\t}\n').indexOf ('marginModequeryVariable') >= 0, 'second write keeps the box');
    // a producer whose Go twin returns []any keeps everything
    ok (f ('\tvar x any = nil\n\tvar y any = nil\n\txyVariable := TupleSlice(this.HandleOptionBoolAndParamsNullable(p, "m", "o"))\n'
        + '\tx = GetValue(xyVariable, 0)\n\ty = xyVariable[1]\n\t_ = x\n').indexOf ('xyVariable') >= 0, 'a []any producer keeps the holder');
    // an in-file producer of the same name may return something else
    const local = 'package ccxt\n\nfunc (this *X) HandleMarginModeAndParams (a any) []any {\n\treturn nil\n}\n\n'
        + 'func (this *X) f (p map[string]any) any {\n' + held + '\t_ = marginMode\n\t_ = query\n\treturn nil\n}\n';
    ok (hx10w8Gp08TuplePairBinds (local).indexOf ('marginModequeryVariable := TupleSlice(') >= 0, 'in-file producer keeps the holder');
    return problems;
}
