// ===== H2K-g15: native Go arithmetic / comparisons on proven numeric operands =====
// Post-pass over emitted Go text. A helper call becomes the native operator only when every
// operand is a non-nil numeric whose Go type the function text proves (int64 / float64 / int
// local or param declared once, int64 base-method result, numeric literal). Anything else keeps the helper.

type Kind = 'i64' | 'f64' | 'int' | 'ilit' | 'flit';

const GO_ARITH_HELPERS = [ 'Subtract', 'Multiply', 'Divide', 'Mod', 'OpNeg', 'IsLessThan', 'IsGreaterThan',
    'IsGreaterThanOrEqual', 'IsLessThanOrEqual', 'MathMin', 'MathMax', 'MathFloor', 'MathCeil', 'MathRound', 'MathPow' ];
const GO_ARITH_CALL_RX = new RegExp ('(?<![\\w.])(?:ccxt\\.)?(' + GO_ARITH_HELPERS.join ('|') + ')\\(', 'g');
// BaseExchange methods whose Go signature returns int64 (go/v4/exchange*.go)
const GO_ARITH_INT64_METHODS = [ 'Milliseconds', 'Seconds', 'ParseToInt', 'ParseTimeframe' ];
const GO_ARITH_MAX_EXACT = 2 ** 53;

function goArithMask (content: string): string {
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

function goArithClose (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; }
        else if ((c === ')') || (c === ']') || (c === '}')) { depth--; if (depth === 0) { return i; } }
    }
    return -1;
}

// top-level comma split of masked[open+1 .. close-1]; returns [start, end) spans
function goArithArgs (masked: string, open: number, close: number): number[][] {
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

function goArithStripParens (text: string): string {
    let t = text.trim ();
    while (t.startsWith ('(') && (goArithClose (t, 0) === t.length - 1)) {
        t = t.slice (1, -1).trim ();
    }
    return t;
}

// Go type of `name` when the function text declares it exactly once (a `var`, a signature param)
function goArithDeclaredType (maskedFunc: string, signature: string, name: string): string | undefined {
    const vars = [ ...maskedFunc.matchAll (new RegExp ('\\bvar\\s+' + name + '\\s+([^=\\n]+?)\\s*(?:=|\\n)', 'g')) ];
    const shortDecls = maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? [];
    const literalParams = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m) => new RegExp ('\\b' + name + '\\b').test (m[1]));
    const rangeDecls = maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + name + '\\b[^\\n{]*:=\\s*range\\b')) ?? [];
    const params = signature.substring (signature.indexOf ('(', signature.startsWith ('func (') ? signature.indexOf (')') + 1 : 0));
    const sigParam = new RegExp ('[(,]\\s*' + name + '\\s+([^,()]+?)\\s*[,)]').exec (params);
    const count = vars.length + shortDecls.length + literalParams.length + rangeDecls.length + (sigParam ? 1 : 0);
    if (count !== 1) {
        return undefined;
    }
    if (sigParam) {
        return sigParam[1].trim ();
    }
    return (vars.length === 1) ? vars[0][1].trim () : undefined;
}

function goArithIntLiteralValue (t: string): number | undefined {
    if (!/^\d+(?:\s*[*+]\s*\d+)*$/.test (t) || /^0\d/.test (t)) {
        return undefined;
    }
    // untyped integer constant expression (only * and +, so no precedence surprise in a product)
    const sums = t.split ('+').map ((s) => s.split ('*').reduce ((a, b) => a * Number (b.trim ()), 1));
    const value = sums.reduce ((a, b) => a + b, 0);
    return (value <= GO_ARITH_MAX_EXACT) ? value : undefined;
}

interface GoArithScope { masked: string; signature: string; known: Map<string, Kind>; ownMethods: Set<string>; pos: number; derefs: Set<string>; sums?: Map<string, string> }

function goArithKind (scope: GoArithScope, text: string, maskedText: string): Kind | undefined {
    const t = goArithStripParens (text);
    const m = goArithStripParens (maskedText);
    const known = scope.known.get (t);
    if (known !== undefined) {
        return known;
    }
    if (goArithIntLiteralValue (t) !== undefined) {
        return 'ilit';
    }
    if (/^\d+\.\d+$/.test (t)) {
        return 'flit';
    }
    if (/^int64\(-\d+\)$/.test (t)) {
        return 'i64';
    }
    const hx4G17 = hx4G17ArithKind (scope, t, m);
    if (hx4G17 !== undefined) {
        return hx4G17;
    }
    if (hx4G30NativeIntExpr (scope, t, m)) {
        return 'i64';  // hx4 G30
    }
    if (/^[A-Za-z_]\w*$/.test (t) && (t !== 'nil') && (t !== 'true') && (t !== 'false')) {
        const type = goArithDeclaredType (scope.masked, scope.signature, t);
        if (((type === '*int64') || (type === '*float64')) && (g10kArithPointerIsNonNil (scope, t) || hx4G17PointerNonNil (scope, t, type) || hx4G26PointerNonNil (scope, t))) {
            scope.derefs.add (t);
            return (type === '*int64') ? 'i64' : 'f64';
        }
        if ((type === undefined) && hx4G26TupleInt64 (scope, t)) {
            return 'i64';
        }
        return (type === 'int64') ? 'i64' : ((type === 'float64') ? 'f64' : ((type === 'int') ? 'int' : undefined));
    }
    // a float64 conversion, optionally divided/multiplied by nonzero constants, is a float64 value
    const conv = /^float64\(/.exec (m);
    if (conv) {
        const end = goArithClose (m, conv[0].length - 1);
        if ((end > 0) && /^(?:\s*[*/]\s*[1-9]\d*(?:\.\d+)?)*$/.test (m.slice (end + 1))) {
            return 'f64';
        }
    }
    // helpers with a plain Go return type (go/v4/exchange_helpers.go): never nil
    const plain = /^(?:ccxt\.)?(GetArrayLength|GetLength|len|ParseInt)\(/.exec (m);
    if (plain && (goArithClose (m, plain[0].length - 1) === m.length - 1)) {
        return (plain[1] === 'ParseInt') ? 'i64' : 'int';
    }
    const call = /^this\.(\w+)\(/.exec (m);
    if (call && GO_ARITH_INT64_METHODS.includes (call[1]) && !scope.ownMethods.has (call[1]) && (goArithClose (m, call[0].length - 1) === m.length - 1)) {
        return 'i64';
    }
    return undefined;
}

const isInt64Side = (k: Kind) => (k === 'i64') || (k === 'ilit');
const isFloatSide = (k: Kind) => (k === 'f64') || (k === 'flit') || (k === 'ilit');
const isNumeric = (k: Kind) => (k !== undefined);

// float64 spelling of a proven numeric operand (literals stay untyped constants)
function goArithAsFloat (text: string, kind: Kind): string {
    return ((kind === 'i64') || (kind === 'int')) ? 'float64(' + text + ')' : text;
}

// the native text for one helper call, or undefined to keep the helper
function goArithNative (helper: string, args: string[], kinds: Kind[]): { text: string, kind: Kind } | undefined {
    const [ a, b ] = args;
    const [ ka, kb ] = kinds;
    if (helper === 'OpNeg') {
        if (ka === 'ilit' && /^\d+$/.test (a)) { return { 'text': 'int64(-' + a + ')', 'kind': 'i64' }; }
        if (ka === 'flit') { return { 'text': 'float64(-' + a + ')', 'kind': 'f64' }; }
        if ((ka === 'i64') || (ka === 'f64')) { return { 'text': '(-' + a + ')', 'kind': ka }; }
        if (ka === 'int') { return { 'text': '(-int64(' + a + '))', 'kind': 'i64' }; }
        return undefined;
    }
    if ([ 'MathFloor', 'MathCeil', 'MathRound' ].includes (helper)) {
        if ((ka === 'i64') || (ka === 'f64') || (ka === 'int')) {
            return { 'text': 'math.' + helper.slice (4) + '(' + goArithAsFloat (a, ka) + ')', 'kind': 'f64' };
        }
        return undefined;
    }
    if (helper === 'MathPow') {
        if (isNumeric (ka) && isNumeric (kb) && ((ka !== 'ilit' && ka !== 'flit') || (kb !== 'ilit' && kb !== 'flit'))) {
            return { 'text': 'math.Pow(' + goArithAsFloat (a, ka) + ', ' + goArithAsFloat (b, kb) + ')', 'kind': 'f64' };
        }
        return undefined;
    }
    const bothInt64 = isInt64Side (ka) && isInt64Side (kb) && ((ka === 'i64') || (kb === 'i64'));
    const bothInt = ((ka === 'int') || (ka === 'ilit')) && ((kb === 'int') || (kb === 'ilit')) && ((ka === 'int') || (kb === 'int'));
    const bothFloat = isFloatSide (ka) && isFloatSide (kb) && ((ka === 'f64') || (kb === 'f64'));
    if ((helper === 'MathMin') || (helper === 'MathMax')) {
        // the helper answers float64(a|b); integral operands carry no NaN
        if (bothInt64 || hx4G17IntegralPair (ka, kb)) {
            return { 'text': 'math.' + helper.slice (4) + '(' + goArithAsFloat (a, ka) + ', ' + goArithAsFloat (b, kb) + ')', 'kind': 'f64' };
        }
        return undefined;
    }
    if ((helper === 'Subtract') || (helper === 'Multiply')) {
        // helper boxes an int64 result for integral operands; float operands may box either kind
        if (bothInt64) {
            return { 'text': '(' + a + ((helper === 'Subtract') ? ' - ' : ' * ') + b + ')', 'kind': 'i64' };
        }
        return hx4G26Native (helper, a, b, ka, kb);
    }
    if (helper === 'Mod') {
        const divisor = goArithIntLiteralValue (b);
        if (((ka === 'i64') && (kb === 'ilit') && (divisor !== undefined) && (divisor !== 0)) || (isInt64Side (ka) && (kb === 'i64') && hx4G17PositiveDivisor (b))) {
            return { 'text': '(' + a + ' % ' + b + ')', 'kind': 'i64' };
        }
        return undefined;
    }
    if (helper === 'Divide') {
        // JS division is float; a zero divisor is the helper's nil, so only a nonzero constant divides
        const divisor = (kb === 'ilit') ? goArithIntLiteralValue (b) : ((kb === 'flit') ? Number (b) : undefined);
        if (((kb === 'i64') || (kb === 'f64') || (kb === 'int')) && hx4G17PositiveDivisor (b) && ((ka === 'i64') || (ka === 'f64') || (ka === 'int') || (ka === 'ilit'))) {
            return { 'text': '(' + goArithAsFloat (a, ka === 'ilit' ? 'f64' : ka) + ' / ' + goArithAsFloat (b, kb) + ')', 'kind': 'f64' };
        }
        if ((divisor === undefined) || (divisor === 0) || !((ka === 'i64') || (ka === 'f64') || (ka === 'int'))) {
            return undefined;
        }
        return { 'text': '(' + goArithAsFloat (a, ka) + ' / ' + b + ')', 'kind': 'f64' };
    }
    const ops: { [h: string]: string } = { 'IsGreaterThan': '>', 'IsGreaterThanOrEqual': '>=', 'IsLessThan': '<', 'IsLessThanOrEqual': '<=' };
    const op = ops[helper];
    if (op !== undefined) {
        // float `<`/`<=` keep the helper: IsLessThan = !GT && !EQ answers true for NaN
        const floatOk = bothFloat && ((op === '>') || (op === '>='));
        if (bothInt64 || bothInt || floatOk) {
            return { 'text': '(' + a + ' ' + op + ' ' + b + ')', 'kind': undefined };
        }
    }
    return undefined;
}

function goArithRewriteFunc (text: string, ownMethods: Set<string>): { text: string, math: boolean } {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const calls = [ ...masked.matchAll (GO_ARITH_CALL_RX) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    let usesMath = false;
    // right to left: an inner call is rewritten before the call that contains it
    calls.sort ((x, y) => y.start - x.start);
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        if (close < 0) {
            continue;
        }
        const before = masked.slice (0, call.start);
        let after = close + 1;
        const spans = goArithArgs (masked, call.open, close);
        const args = spans.map (([ s, e ]) => text.slice (s, e).trim ());
        const maskedArgs = spans.map (([ s, e ]) => masked.slice (s, e).trim ());
        const expected = (call.helper === 'OpNeg' || call.helper.startsWith ('MathF') || call.helper === 'MathCeil' || call.helper === 'MathRound') ? 1 : 2;
        if (args.length !== expected) {
            continue;
        }
        scope.pos = call.start;
        scope.derefs = new Set<string> ();
        scope.sums = new Map<string, string> ();
        const kinds = args.map ((arg, i) => goArithKind (scope, arg, maskedArgs[i]));
        if (kinds.some ((k) => k === undefined)) {
            continue;
        }
        // an operand that is not a single primary keeps its own parens
        const operands = args.map ((arg) => {
            const t = goArithStripParens (arg);
            if (scope.derefs.has (t)) {
                return '*' + t;
            }
            if (scope.sums?.has (t)) {
                return scope.sums.get (t) as string;
            }
            if (/^\*[A-Za-z_]\w*$/.test (t)) {
                return t;
            }
            return /^[\w.]+$|^[\w.]+\(.*\)$|^-?\d+(?:\.\d+)?$/.test (t) && (goArithClose (goArithMask (t), t.indexOf ('(')) === t.length - 1 || t.indexOf ('(') < 0) ? t : '(' + t + ')';
        });
        const native = goArithNative (call.helper, operands, kinds);
        if (native === undefined) {
            continue;
        }
        // user ruling: division keeps the float64 quotient (like C#), whatever consumes it
        if ((call.helper === 'OpNeg') && hx4G17NegLiteralCompare (before, masked.slice (after), kinds[0], operands[0], scope)) {
            native.text = '-' + operands[0];
            native.kind = undefined;
        } else if (((call.helper === 'OpNeg') || (native.kind === 'f64')) && (/(==|!=)\s*$/.test (before) || /^\s*(==|!=)/.test (masked.slice (after)))) {
            continue;                   // an interface comparison differs from a typed one
        }
        const assertion = /^\.\((\w+)\)/.exec (masked.slice (after));
        if (assertion) {
            // `.(int64)` on the helper's box: the native value already is that type
            if (!((assertion[1] === 'int64' && native.kind === 'i64') || (assertion[1] === 'float64' && native.kind === 'f64'))) {
                continue;
            }
            after += assertion[0].length;
        }
        if (native.kind !== undefined) {
            scope.known.set (goArithStripParens (native.text), native.kind);
            scope.known.set (native.text, native.kind);
        }
        // drop the operator's own parens where the call already sits alone inside parens or a call argument list
        let nativeText = native.text.replace (/^(math\.\w+)\(\((.*)\)\)$/, (all: string, fn: string, inner: string) => (goArithClose (inner, inner.indexOf ('(')) !== -1 || inner.indexOf ('(') < 0) && goArithClose ('(' + inner + ')', 0) === inner.length + 1 ? fn + '(' + inner + ')' : all);
        if (nativeText.startsWith ('(') && /\(\s*$/.test (before) && /^\s*\)/.test (masked.slice (after))) {
            nativeText = nativeText.slice (1, -1);
        }
        native.text = nativeText;
        usesMath = usesMath || native.text.startsWith ('math.');
        text = text.slice (0, call.start) + native.text + text.slice (after);
        masked = masked.slice (0, call.start) + goArithMask (native.text) + masked.slice (after);
        scope.masked = masked;
    }
    return { text, 'math': usesMath };
}

// adds `import "math"` to the file header (one blank line after it, as normalizeGoFileHeader lays out)
function goArithAddMathImport (content: string): string {
    if (/^import "math"$/m.test (content) || /^\s*"math"$/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    let at = lines.findIndex ((l) => l.startsWith ('// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md'));
    if (at < 0) {
        return content;
    }
    lines.splice (at + 2, 0, 'import "math"', '');
    return lines.join ('\n');
}

export function goNativeArithmetic (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !GO_ARITH_CALL_RX.test (content)) {
        return content;
    }
    GO_ARITH_CALL_RX.lastIndex = 0;
    const masked = goArithMask (content);
    // a local named `math` would shadow the package
    const mathShadowed = /(?<![\w.])math\s*(?::=|,)|\bvar math\b|[(,]\s*math\s+\w/.test (masked);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    if (/^func \(this \*\w+\) Sum\(/m.test (masked)) {
        ownMethods.add ('Sum');
    }
    for (const m of masked.matchAll (/^func \(this \*\w+\) (HandleOptionIntegerAndParams2?)\(/gm)) {
        ownMethods.add (m[1]);  // hx4 G26
    }
    const lines = content.split ('\n');
    const out: string[] = [];
    let usesMath = false;
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) {
                start = k;
            } else {
                out.push (lines[k]);
            }
            continue;
        }
        if (lines[k] === '}') {
            const fn = lines.slice (start, k + 1).join ('\n');
            let result = goArithRewriteFunc (fn, ownMethods);
            if (result.math && mathShadowed) {
                result = { 'text': fn, 'math': false };
            }
            usesMath = usesMath || result.math;
            out.push (result.text);
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    const joined = out.join ('\n');
    return usesMath ? goArithAddMathImport (joined) : joined;
}

// ===== G10K-arith =====
// A declared-once `*int64`/`*float64` local reads as its value when the call sits right after
// `x != nil &&` on its line, or inside an `if x != nil {` block (no `||`) that never rewrites x.
function g10kArithPointerIsNonNil (scope: GoArithScope, name: string): boolean {
    const head = scope.masked.slice (0, scope.pos);
    const lines = head.split ('\n');
    const cur = lines[lines.length - 1];
    const guard = '\\(?' + name + ' != nil\\)? && \\(*';
    if (new RegExp ('^\\s*(?:if |\\} else if |return |var \\w+ bool = )?\\(*' + guard + '(?:!?\\(*)?$').test (cur)) {
        return true;
    }
    let indent = cur.length - cur.replace (/^\t+/, '').length;
    for (let k = lines.length - 2; k >= 0; k--) {
        const line = lines[k];
        const s = line.trim ();
        if (new RegExp ('(?<![\\w.*&])' + name + '\\s*(?:=[^=]|\\+\\+|--|[-+*/]=)').test (line) || /\bfunc\b/.test (s)) {
            return false;
        }
        const li = line.length - line.replace (/^\t+/, '').length;
        if ((s !== '') && (li < indent)) {
            indent = li;
            if (new RegExp ('^(?:\\} else )?if \\(*' + name + ' != nil\\)*(?: && [^|]*)? ?\\{$').test (s) && (s.indexOf ('||') < 0)) {
                return true;
            }
            if (/^(?:\} else|else)/.test (s) || (li === 0)) {
                return false;
            }
        }
    }
    return false;
}

export function g10kArithSelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar c *float64 = this.SafeNumber(o, "c")\n\tvar p any = nil\n\tif c != nil {\n\t\tp = Divide(c, 100)\n\t}\n\treturn p', '(*c / 100)', true ],
        [ '\tvar s *int64 = this.SafeInteger(o, "s")\n\tif (s != nil) && IsLessThan(s, 5) {\n\t\treturn 1\n\t}\n\treturn 0', '(*s < 5)', true ],
        [ '\tvar c *float64 = this.SafeNumber(o, "c")\n\treturn Divide(c, 100)', 'Divide(c, 100)', true ],
        [ '\tvar c *float64 = this.SafeNumber(o, "c")\n\tif c != nil {\n\t\tc = this.SafeNumber(o, "d")\n\t\treturn Divide(c, 100)\n\t}\n\treturn nil', 'Divide(c, 100)', true ],
        [ '\tvar c *float64 = this.SafeNumber(o, "c")\n\tif c != nil || true {\n\t\treturn Divide(c, 100)\n\t}\n\treturn nil', 'Divide(c, 100)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = goNativeArithmetic (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('G10K-arith: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}

// hx4 G17
// Extra operand proofs: a printed `*p` deref, int64()/int() conversions.
function hx4G17ArithKind (scope: GoArithScope, t: string, m: string): Kind | undefined {
    const deref = /^\*([A-Za-z_]\w*)$/.exec (t);
    if (deref) {
        // the deref already runs before the helper call, so a nil pointer panics in both forms
        const type = goArithDeclaredType (scope.masked, scope.signature, deref[1]);
        return (type === '*int64') ? 'i64' : ((type === '*float64') ? 'f64' : undefined);
    }
    const sum = /^this\.Sum\(/.exec (m);
    if (sum && !scope.ownMethods.has ('Sum') && (goArithClose (m, sum[0].length - 1) === m.length - 1)) {
        // BaseExchange.Sum folds Add from 0.0: integral non-nil operands box an int64 sum
        const spans = goArithArgs (m, sum[0].length - 1, m.length - 1);
        const parts: string[] = [];
        let typed = false;
        if (t.length !== m.length) {
            return undefined;
        }
        for (const [ s0, e0 ] of spans) {
        const arg = t.slice (s0, e0).trim ();
            const saved = scope.derefs;
            scope.derefs = new Set<string> ();
            const k = goArithKind (scope, arg, m.slice (s0, e0).trim ());
            const a = goArithStripParens (arg);
            let text = scope.derefs.has (a) ? '*' + a : (/^[\w.*]+$/.test (a) ? a : '(' + a + ')');
            scope.derefs = saved;
            if ((k !== 'i64') && (k !== 'ilit') && (k !== 'int')) {
                return undefined;
            }
            if (k === 'int') {
                text = 'int64(' + text + ')';
            }
            typed = typed || (k !== 'ilit');
            parts.push (text);
        }
        if (!typed || (parts.length < 2)) {
            return undefined;
        }
        scope.sums?.set (t, '(' + parts.join (' + ') + ')');
        return 'i64';
    }
    const conv = /^(int64|int)\(/.exec (m);
    if (conv && (goArithClose (m, conv[0].length - 1) === m.length - 1)) {
        return (conv[1] === 'int64') ? 'i64' : 'int';
    }
    return undefined;
}

// the only write is the declaration (no `name =` / `&name` anywhere in the function)
function hx4G17SingleWrite (scope: GoArithScope, name: string): boolean {
    const writes = scope.masked.match (new RegExp ('(?<![\\w.*])' + name + '\\s*(?:=(?!=)|\\+\\+|--|[-+*/%]=|,[\\w\\s,]*=(?!=))|&' + name + '\\b', 'g')) ?? [];
    return writes.length === 0;
}

// `var p *int64 = this.SafeInteger{,2,N}(..., <int literal | non-nil SafeInteger>)` never yields nil
function hx4G17NonNilIntegerInit (masked: string): boolean {
    const call = /^this\.SafeInteger(2|N)?\(/.exec (masked.trim ());
    if (!call) {
        return false;
    }
    const text = masked.trim ();
    const open = call[0].length - 1;
    if (goArithClose (text, open) !== text.length - 1) {
        return false;
    }
    const spans = goArithArgs (text, open, text.length - 1);
    const want = (call[1] === '2') ? 4 : 3;
    if (spans.length !== want) {
        return false;
    }
    const def = text.slice (spans[want - 1][0], spans[want - 1][1]).trim ();
    return /^-?\d+$/.test (def) || hx4G17NonNilIntegerInit (def);
}

// a declared-once, never-rewritten pointer local proven non-nil by its initializer or an earlier early-exit nil test
function hx4G17PointerNonNil (scope: GoArithScope, name: string, type: string): boolean {
    if (!hx4G17SingleWrite (scope, name)) {
        return false;
    }
    const decl = new RegExp ('\\bvar\\s+' + name + '\\s+\\*int64\\s*=\\s*([^\\n]+)').exec (scope.masked);
    if ((type === '*int64') && decl && hx4G17NonNilIntegerInit (decl[1]) && (decl.index < scope.pos)) {
        return true;
    }
    const lines = scope.masked.slice (0, scope.pos).split ('\n');
    const all = scope.masked.split ('\n');
    const indentOf = (l: string) => l.length - l.replace (/^\t+/, '').length;
    let indent = indentOf (lines[lines.length - 1]);
    for (let k = lines.length - 2; k >= 0; k--) {
        const s = lines[k].trim ();
        if (s === '') {
            continue;
        }
        if (/\bfunc\b/.test (s)) {
            return false;
        }
        const li = indentOf (lines[k]);
        if (li < indent) {
            indent = li;
            continue;
        }
        if ((li === indent) && new RegExp ('^if \\(*' + name + ' == nil\\)* \\{$').test (s)) {
            // body = following deeper lines; it must end in an exit and close with a bare `}`
            let j = k + 1;
            let last = '';
            while ((j < all.length) && ((all[j].trim () === '') || (indentOf (all[j]) > li))) {
                if (all[j].trim () !== '') {
                    last = all[j].trim ();
                }
                j++;
            }
            if ((j < all.length) && (all[j].trim () === '}') && /^(?:return\b|continue$|break$|panic\()/.test (last)) {
                return true;
            }
        }
    }
    return false;
}

// MathMin/MathMax answer float64(a|b); integral operands carry no NaN
function hx4G17IntegralPair (ka: Kind, kb: Kind): boolean {
    const integral = (k: Kind) => (k === 'i64') || (k === 'int') || (k === 'ilit');
    return integral (ka) && integral (kb) && ((ka !== 'ilit') || (kb !== 'ilit'));
}

// `L == OpNeg(N)` / `L != OpNeg(N)` with a typed numeric L compares against the constant -N
function hx4G17NegLiteralCompare (before: string, after: string, kind: Kind, operand: string, scope: GoArithScope): boolean {
    if ((kind !== 'ilit') || !/^\d+$/.test (operand) || /^\s*[.([]/.test (after)) {
        return false;
    }
    const cmp = /(\S)\s*(?:==|!=)\s*$/.exec (before);
    if (!cmp) {
        return false;
    }
    let end = cmp.index + 1;
    let start = end;
    if (before[end - 1] === ')') {
        let depth = 0;
        for (let i = end - 1; i >= 0; i--) {
            if (before[i] === ')') { depth++; } else if (before[i] === '(') { depth--; if (depth === 0) { start = i; break; } }
        }
        const callee = /(?:strings\.Index|(?:ccxt\.)?GetIndexOf)$/.exec (before.slice (0, start));
        return (callee !== null) && (callee.index === 0 || /[^\w.]/.test (before[callee.index - 1]));
    }
    const ident = /(?<![\w.*])(this\.RateLimit|[A-Za-z_]\w*)$/.exec (before.slice (0, end));
    if (!ident) {
        return false;
    }
    if (ident[1] === 'this.RateLimit') {
        return true;
    }
    const type = goArithDeclaredType (scope.masked, scope.signature, ident[1]);
    return (type === 'int64') || (type === 'int') || (type === 'float64');
}

// divisor names the generated code only ever binds to positive periods / sizes (user-approved list)
function hx4G17PositiveDivisor (operand: string): boolean {
    const name = operand.replace (/^\*/, '');
    return /^(?:duration|timeframe\w*|pageSize|chunkSize|step|ms|week|day|hour|minute|second|leverage|streamLimit|denominator)$/.test (name);
}

export function hx4G17SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, d int64) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar n *int64 = this.SafeInteger(o, "n", this.SafeInteger(o, "m", 5))\n\treturn MathMin(n, 50)', 'math.Min(float64(*n), 50)', true ],
        [ '\tvar n *int64 = this.SafeInteger(o, "n")\n\treturn MathMin(n, 50)', 'MathMin(n, 50)', true ],
        [ '\tvar n *int64 = this.SafeInteger(o, "n", 5)\n\tn = this.SafeInteger(o, "m")\n\treturn OpNeg(n)', 'OpNeg(n)', true ],
        [ '\tvar t *int64 = this.SafeInteger(o, "t")\n\tif t == nil {\n\t\tpanic("x")\n\t}\n\treturn Divide(t, duration)', 'Divide(t, duration)', true ],
        [ '\tvar duration int64 = d\n\tvar t *int64 = this.SafeInteger(o, "t")\n\tif t == nil {\n\t\tpanic("x")\n\t}\n\treturn Divide(t, duration)', '(float64(*t) / float64(duration))', true ],
        [ '\tvar duration int64 = d\n\tvar t *int64 = this.SafeInteger(o, "t")\n\tif t == nil {\n\t\tt = this.SafeInteger(o, "u")\n\t}\n\treturn Divide(t, duration)', 'Divide(t, duration)', true ],
        [ '\tvar other int64 = d\n\treturn Divide(1, other)', 'Divide(1, other)', true ],
        [ '\tvar leverage int64 = d\n\treturn Mod(1000, leverage)', '(1000 % leverage)', true ],
        [ '\tvar c int64 = d\n\treturn (c == OpNeg(1))', '(c == -1)', true ],
        [ '\tvar c any = d\n\treturn (c == OpNeg(1))', 'OpNeg(1)', true ],
        [ '\treturn (strings.Index(s, "/") != OpNeg(1))', '(strings.Index(s, "/") != -1)', true ],
        [ '\tvar n int = 3\n\treturn OpNeg(n)', '(-int64(n))', true ],
        [ '\tvar a int64 = d\n\treturn Multiply(this.Sum(a, 1), d)', '((a + 1) * d)', true ],
        [ '\tvar a any = d\n\treturn Multiply(this.Sum(a, 1), d)', 'Multiply(this.Sum(a, 1), d)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = goNativeArithmetic (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G17: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}


// hx4 G18
// Ordered comparisons whose operands the Go text types: `x := <int>` locals, native int64/int/float64
// arithmetic, `*p` derefs, and unguarded `*int64`/`*float64` identifiers via the helper's nil table.
function hx4G18Kind (scope: GoArithScope, text: string, maskedText: string): Kind | undefined {
    const inner: GoArithScope = { ...scope, 'derefs': new Set<string> () };
    const base = goArithKind (inner, text, maskedText);
    if (base !== undefined) {
        return (inner.derefs.size === 0) ? base : undefined;
    }
    const t = goArithStripParens (text);
    const m = goArithStripParens (maskedText);
    if (/^[A-Za-z_]\w*$/.test (t)) {
        const decls = scope.masked.match (new RegExp ('(?<![\\w.])' + t + '\\s*:=\\s*[^\\n;{]*', 'g')) ?? [];
        const others = scope.masked.match (new RegExp ('\\bvar\\s+' + t + '\\b|\\b' + t + '\\s*,[^=\\n]*:=|,\\s*' + t + '\\s*(?:,[^=\\n]*)?:=|\\bfunc\\s*\\([^()]*\\b' + t + '\\b')) ?? [];
        const sig = scope.signature.substring (scope.signature.indexOf ('(', scope.signature.startsWith ('func (') ? scope.signature.indexOf (')') + 1 : 0));
        if ((decls.length > 0) && (others.length === 0) && !new RegExp ('[(,]\\s*' + t + '\\s').test (sig) && decls.every ((d) => /:=\s*\d+\s*$/.test (d) && !/:=\s*0\d/.test (d))) {
            return 'int';
        }
        return undefined;
    }
    const deref = /^\*\s*([A-Za-z_]\w*)$/.exec (t);
    if (deref) {
        const type = goArithDeclaredType (scope.masked, scope.signature, deref[1]);
        return (type === '*int64') ? 'i64' : ((type === '*float64') ? 'f64' : undefined);
    }
    // binary Go arithmetic: the static type is the operands' common type
    const ops: number[] = [];
    let depth = 0;
    let prev = '';
    for (let i = 0; i < m.length; i++) {
        const c = m[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; } else if ((c === ')') || (c === ']') || (c === '}')) { depth--; }
        if ((depth === 0) && '+-*/%'.includes (c) && /[\w)\]]/.test (prev) && (m[i + 1] !== '=') && (m[i + 1] !== c)) {
            ops.push (i);
        }
        if (c !== ' ') { prev = c; }
    }
    if (ops.length === 0) {
        return undefined;
    }
    const bounds = [ -1, ...ops, m.length ];
    const kinds: Kind[] = [];
    for (let k = 0; k + 1 < bounds.length; k++) {
        const kind = hx4G18Kind (scope, t.slice (bounds[k] + 1, bounds[k + 1]), m.slice (bounds[k] + 1, bounds[k + 1]));
        if (kind === undefined) {
            return undefined;
        }
        kinds.push (kind);
    }
    for (const want of [ 'i64', 'int', 'f64' ] as Kind[]) {
        const lit = (want === 'f64') ? [ 'ilit', 'flit' ] : [ 'ilit' ];
        if (kinds.includes (want) && kinds.every ((k) => (k === want) || lit.includes (k as string))) {
            return want;
        }
    }
    return undefined;
}

// operand text that may be skipped by a nil short-circuit: no calls, derefs, or divisions
function hx4G18Skippable (masked: string): boolean {
    const noConv = masked.replace (/\b(?:int64|float64|len)\(/g, '(');
    return !/\w\s*\(/.test (noConv) && !/[/%]/.test (masked) && !/(?:^|[(+\-*,]\s*)\*\s*[A-Za-z_(]/.test (masked.trim ()) && !/\b(?:nil|true|false)\b/.test (masked);
}

function hx4G18Native (helper: string, a: string, b: string, ka: Kind, kb: Kind, pa: boolean, pb: boolean, name: string[]): string | undefined {
    const op: string = { 'IsGreaterThan': '>', 'IsGreaterThanOrEqual': '>=', 'IsLessThan': '<', 'IsLessThanOrEqual': '<=' }[helper];
    const isLit = (k: Kind) => (k === 'ilit') || (k === 'flit');
    if ((op === undefined) || (isLit (ka) && isLit (kb))) {
        return undefined;
    }
    const float = (ka === 'f64') || (kb === 'f64') || (ka === 'flit') || (kb === 'flit');
    // IsLessThan = !GT && !EQ answers true for NaN
    if (float && ((ka === 'f64') || (kb === 'f64')) && ((op === '<') || (op === '<='))) {
        return undefined;
    }
    const conv = (x: string, k: Kind, other: Kind) => {
        if (float && ((k === 'i64') || (k === 'int'))) { return 'float64(' + x + ')'; }
        if ((k === 'int') && (other === 'i64')) { return 'int64(' + x + ')'; }
        return x;
    };
    if (float && ((ka === 'flit' && kb === 'int') || (kb === 'flit' && ka === 'int'))) {
        return undefined;
    }
    const cmp = conv (a, ka, kb) + ' ' + op + ' ' + conv (b, kb, ka);
    if (!pa && !pb) {
        return '(' + cmp + ')';
    }
    const [ na, nb ] = name;
    // helper nil table: GT(nil, x) false, GT(x, nil) true, EQ(nil, nil) true
    const gtOrGe = (op === '>') || (op === '>=');
    if (pa && pb) {
        if (op === '>') { return '(' + na + ' != nil && (' + nb + ' == nil || ' + cmp + '))'; }
        if (op === '<') { return '(' + nb + ' != nil && (' + na + ' == nil || ' + cmp + '))'; }
        if (op === '>=') { return '(' + nb + ' == nil || (' + na + ' != nil && ' + cmp + '))'; }
        return '(' + na + ' == nil || (' + nb + ' != nil && ' + cmp + '))';
    }
    if (pa) {
        return gtOrGe ? '(' + na + ' != nil && ' + cmp + ')' : '(' + na + ' == nil || ' + cmp + ')';
    }
    return gtOrGe ? '(' + nb + ' == nil || ' + cmp + ')' : '(' + nb + ' != nil && ' + cmp + ')';
}

function hx4G18RewriteFunc (text: string, ownMethods: Set<string>): string {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const rx = /(?<![\w.])(?:ccxt\.)?(IsGreaterThanOrEqual|IsLessThanOrEqual|IsGreaterThan|IsLessThan)\(/g;
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    calls.sort ((x, y) => y.start - x.start);
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        const spans = (close < 0) ? [] : goArithArgs (masked, call.open, close);
        if (spans.length !== 2) {
            continue;
        }
        scope.pos = call.start;
        const args = spans.map (([ s, e ]) => goArithStripParens (text.slice (s, e)));
        const margs = spans.map (([ s, e ]) => goArithStripParens (masked.slice (s, e)));
        const ptr = args.map ((x) => (/^[A-Za-z_]\w*$/.test (x) ? goArithDeclaredType (scope.masked, scope.signature, x) : undefined));
        const isPtr = ptr.map ((p) => (p === '*int64') || (p === '*float64'));
        const guarded = args.map ((x, i) => isPtr[i] && g10kArithPointerIsNonNil (scope, x));
        const kinds = args.map ((x, i) => (isPtr[i] ? ((ptr[i] === '*int64') ? 'i64' : 'f64') as Kind : hx4G18Kind (scope, x, margs[i])));
        if (kinds.some ((k) => k === undefined)) {
            continue;
        }
        // a nil test may skip the other operand: it must be side-effect free
        const nilA = isPtr[0] && !guarded[0];
        const nilB = isPtr[1] && !guarded[1];
        if ((nilA && !nilB && !hx4G18Skippable (margs[1])) || (nilB && !nilA && !hx4G18Skippable (margs[0]))) {
            continue;
        }
        // every proven operand is arithmetic or a primary, which binds tighter than a comparison
        const ops = args.map ((x, i) => (isPtr[i] ? '*' + x : x));
        let native = hx4G18Native (call.helper, ops[0], ops[1], kinds[0], kinds[1], nilA, nilB, args);
        if (native === undefined) {
            continue;
        }
        const before = masked.slice (0, call.start);
        if (/\(\s*$/.test (before) && /^\s*\)/.test (masked.slice (close + 1))) {
            native = native.slice (1, -1);
        }
        text = text.slice (0, call.start) + native + text.slice (close + 1);
        masked = masked.slice (0, call.start) + goArithMask (native) + masked.slice (close + 1);
        scope.masked = masked;
    }
    return text;
}

export function hx4G18NativeCompare (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/(?<![\w.])(?:ccxt\.)?Is(?:Greater|Less)Than/.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    const lines = content.split ('\n');
    const out: string[] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) { start = k; } else { out.push (lines[k]); }
            continue;
        }
        if (lines[k] === '}') {
            out.push (hx4G18RewriteFunc (lines.slice (start, k + 1).join ('\n'), ownMethods));
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    return out.join ('\n');
}

export function hx4G18SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, n any) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar now int64 = this.Milliseconds()\n\tvar e *int64 = this.SafeInteger(o, "e")\n\tif (e != nil) && IsGreaterThan(e, now+10000) {\n\t}\n\treturn nil', '(e != nil) && (*e > now+10000)', true ],
        [ '\tvar e *int64 = this.SafeInteger(o, "e")\n\tif IsLessThan(e, 5) {\n\t}\n\treturn nil', 'if (e == nil || *e < 5) {', true ],
        [ '\tvar e *int64 = this.SafeInteger(o, "e")\n\tif IsGreaterThanOrEqual(5, e) {\n\t}\n\treturn nil', 'if (e == nil || 5 >= *e) {', true ],
        [ '\tvar a *int64 = this.SafeInteger(o, "a")\n\tvar b *int64 = this.SafeInteger(o, "b")\n\tif IsLessThan(a, b) {\n\t}\n\treturn nil', 'if (b != nil && (a == nil || *a < *b)) {', true ],
        [ '\tfor i := 1; IsLessThan(i, 10); i++ {\n\t}\n\treturn nil', 'for i := 1; (i < 10); i++ {', true ],
        [ '\tvar day int = 5\n\tvar age int64 = this.Milliseconds()\n\tif IsGreaterThan(age, 14*day) {\n\t}\n\treturn nil', 'if (age > int64(14*day)) {', true ],
        [ '\tvar e *float64 = this.SafeNumber(o, "e")\n\tif IsLessThan(e, 0) {\n\t}\n\treturn nil', 'IsLessThan(e, 0)', true ],
        [ '\tvar e *int64 = this.SafeInteger(o, "e")\n\tif IsLessThan(e, this.Seconds()) {\n\t}\n\treturn nil', 'IsLessThan(e, this.Seconds())', true ],
        [ '\tfor i := 1; IsLessThan(i, n); i++ {\n\t}\n\treturn nil', 'IsLessThan(i, n)', true ],
        [ '\tfor i := 1; IsLessThan(i, 3); i++ {\n\t}\n\tvar i any = 2\n\treturn nil', 'IsLessThan(i, 3)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G18NativeCompare (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G18: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}


// hx4 G23
// Comparison/EvalTruthy operands G18 cannot type: Handle*AndParams tuple element-0 locals, Add-only int
// counters (`var n any = 0`), and declared-once pointers proven non-nil by an earlier early exit.
const HX4G23_TUPLE_PTR: [ RegExp, string ][] = [
    [ /^(?:HandleOptionIntegerAndParams2?Nullable|HandleParamInteger2?)$/, '*int64' ],
    [ /^(?:HandleOptionBoolAndParams2?Nullable|HandleParamBool2?)$/, '*bool' ],
];

function hx4G23DeclCount (masked: string, name: string): number {
    const rx = new RegExp ('(?<![\\w.])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|\\bvar\\s+' + name + '\\b|\\bfunc\\s*\\([^()]*\\b' + name + '\\b|\\bfor\\b[^\\n{]*\\b' + name + '\\b[^\\n{]*:=\\s*range\\b', 'g');
    return (masked.match (rx) ?? []).length;
}

// Go type of a single-write local bound from a Handle*AndParams result, by the base method's declared shape
function hx4G23TupleType (scope: GoArithScope, name: string, fileOwn: Set<string>): string | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || (hx4G23DeclCount (scope.masked, name) !== 1) || !hx4G17SingleWrite (scope, name)) {
        return undefined;
    }
    const pair = new RegExp ('(?<![\\w.])' + name + ',\\s*\\w+\\s*:=\\s*this\\.(HandleOptionIntegerAndParams2?)\\(').exec (scope.masked);
    if (pair && !fileOwn.has (pair[1]) && (pair.index < scope.pos)) {
        return 'int64';
    }
    // only a raw `h[0]` read keeps the pointer box (GetValue derefs it to a plain scalar)
    const el = new RegExp ('(?<![\\w.])' + name + '\\s*:=\\s*(\\w+)\\[0\\]\\s*$', 'm').exec (scope.masked);
    if (!el || (el.index > scope.pos)) {
        return undefined;
    }
    const holder = el[1];
    const decl = new RegExp ('\\bvar\\s+' + holder + '\\s+\\[\\]any\\s*=\\s*this\\.(\\w+)\\(').exec (scope.masked);
    if (!decl || (hx4G23DeclCount (scope.masked, holder) !== 1) || !hx4G17SingleWrite (scope, holder) || fileOwn.has (decl[1])) {
        return undefined;
    }
    for (const [ rx, type ] of HX4G23_TUPLE_PTR) {
        if (rx.test (decl[1])) {
            return type;
        }
    }
    return undefined;
}

// `var n any = <int>` whose every other write is `n = <int>` or `n = Add(n, <int>)`: an int box, never nil
function hx4G23Counter (scope: GoArithScope, name: string): boolean {
    if (!/^[A-Za-z_]\w*$/.test (name) || (hx4G23DeclCount (scope.masked, name) !== 1)) {
        return false;
    }
    if (!new RegExp ('\\bvar\\s+' + name + '\\s+any\\s*=\\s*[1-9]?\\d{0,8}\\s*(?:\\n|$)').test (scope.masked + '\n')) {
        return false;
    }
    const writes = scope.masked.match (new RegExp ('(?<![\\w.*])' + name + '\\s*(?:=(?!=)[^\\n]*|\\+\\+|--|[-+*/%]=|,[\\w\\s,]*=(?!=))|&' + name + '\\b', 'g')) ?? [];
    const lit = '[1-9]?\\d{0,8}';
    const ok = new RegExp ('^' + name + '\\s*=\\s*(?:' + lit + '|(?:ccxt\\.)?Add\\(' + name + ',\\s*' + lit + '\\))\\s*$');
    return writes.every ((w) => ok.test (w.trim ()));
}

function hx4G23RewriteFunc (text: string, ownMethods: Set<string>, fileOwn: Set<string>): string {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const rx = /(?<![\w.])(?:ccxt\.)?(IsGreaterThanOrEqual|IsLessThanOrEqual|IsGreaterThan|IsLessThan|EvalTruthy)\(/g;
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    calls.sort ((x, y) => y.start - x.start);
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        const spans = (close < 0) ? [] : goArithArgs (masked, call.open, close);
        scope.pos = call.start;
        const args = spans.map (([ s, e ]) => goArithStripParens (text.slice (s, e)));
        const margs = spans.map (([ s, e ]) => goArithStripParens (masked.slice (s, e)));
        let native: string | undefined = undefined;
        if (call.helper === 'EvalTruthy') {
            // EvalTruthy derefs a *bool box: nil is false
            if ((args.length === 1) && (hx4G23TupleType (scope, args[0], fileOwn) === '*bool')) {
                native = '(' + args[0] + '.(*bool) != nil && *' + args[0] + '.(*bool))';
            }
        } else if (spans.length === 2) {
            const ptrName: string[] = [];
            const isPtr: boolean[] = [];
            const kinds: (Kind | undefined)[] = [];
            const ops: string[] = [];
            for (let i = 0; i < 2; i++) {
                const x = args[i];
                const tuple = hx4G23TupleType (scope, x, fileOwn);
                const declared = /^[A-Za-z_]\w*$/.test (x) ? goArithDeclaredType (scope.masked, scope.signature, x) : undefined;
                if (tuple === '*int64') {
                    ptrName.push (x + '.(*int64)'); isPtr.push (true); kinds.push ('i64'); ops.push ('*' + x + '.(*int64)');
                } else if (tuple === 'int64') {
                    ptrName.push (x); isPtr.push (false); kinds.push ('i64'); ops.push (x);
                } else if (hx4G23Counter (scope, x)) {
                    ptrName.push (x); isPtr.push (false); kinds.push ('int'); ops.push (x + '.(int)');
                } else if (((declared === '*int64') || (declared === '*float64')) && hx4G17PointerNonNil (scope, x, declared)) {
                    ptrName.push (x); isPtr.push (false); kinds.push ((declared === '*int64') ? 'i64' : 'f64'); ops.push ('*' + x);
                } else if ((declared === '*int64') || (declared === '*float64')) {
                    const guarded = g10kArithPointerIsNonNil (scope, x);
                    ptrName.push (x); isPtr.push (!guarded); kinds.push ((declared === '*int64') ? 'i64' : 'f64'); ops.push ('*' + x);
                } else {
                    ptrName.push (x); isPtr.push (false); kinds.push (hx4G18Kind (scope, x, margs[i])); ops.push (x);
                }
            }
            if (kinds.every ((k) => k !== undefined) && !((isPtr[0] && !isPtr[1] && !hx4G18Skippable (margs[1])) || (isPtr[1] && !isPtr[0] && !hx4G18Skippable (margs[0])))) {
                native = hx4G18Native (call.helper, ops[0], ops[1], kinds[0] as Kind, kinds[1] as Kind, isPtr[0], isPtr[1], ptrName);
            }
        }
        if (native === undefined) {
            continue;
        }
        if (/\(\s*$/.test (masked.slice (0, call.start)) && /^\s*\)/.test (masked.slice (close + 1))) {
            native = native.slice (1, -1);
        }
        text = text.slice (0, call.start) + native + text.slice (close + 1);
        masked = masked.slice (0, call.start) + goArithMask (native) + masked.slice (close + 1);
        scope.masked = masked;
    }
    return text;
}

export function hx4G23Comparisons (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/(?<![\w.])(?:ccxt\.)?(?:Is(?:Greater|Less)Than(?:OrEqual)?|EvalTruthy)\(/.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    // an exchange-level override of a Handle* method may answer another element type
    const fileOwn = new Set<string> ([ ...masked.matchAll (/^func \(this \*\w+\) (Handle\w+)\(/gm) ].map ((m) => m[1]));
    const lines = content.split ('\n');
    const out: string[] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) { start = k; } else { out.push (lines[k]); }
            continue;
        }
        if (lines[k] === '}') {
            out.push (hx4G23RewriteFunc (lines.slice (start, k + 1).join ('\n'), ownMethods, fileOwn));
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    return out.join ('\n');
}

export function hx4G23SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, n any) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar uparamsV []any = this.HandleOptionBoolAndParamsNullable(o, "m", "uta", nil)\n\tu := uparamsV[0]\n\tif EvalTruthy(u) {\n\t}\n\treturn nil', 'if (u.(*bool) != nil && *u.(*bool)) {', true ],
        [ '\tvar uparamsV []any = this.HandleOptionBoolAndParamsNullable(o, "m", "uta", nil)\n\tu := uparamsV[0]\n\tif !ccxt.EvalTruthy(u) {\n\t}\n\treturn nil', 'if !(u.(*bool) != nil && *u.(*bool)) {', true ],
        [ '\tvar uparamsV []any = this.HandleOptionBoolAndParamsNullable(o, "m", "uta", nil)\n\tu := ccxt.GetValue(uparamsV, 0)\n\tif ccxt.EvalTruthy(u) {\n\t}\n\treturn nil', 'ccxt.EvalTruthy(u)', true ],
        [ '\tvar uparamsV []any = this.HandleOptionAndParams(o, "m", "uta", nil)\n\tu := uparamsV[0]\n\tif EvalTruthy(u) {\n\t}\n\treturn nil', 'EvalTruthy(u)', true ],
        [ '\tvar uparamsV []any = this.HandleOptionBoolAndParamsNullable(o, "m", "uta", nil)\n\tu := uparamsV[0]\n\tu = true\n\tif EvalTruthy(u) {\n\t}\n\treturn nil', 'EvalTruthy(u)', true ],
        [ '\tvar aparamsV []any = this.HandleParamInteger(o, "a")\n\ta := aparamsV[0]\n\tif IsLessThan(a, 4) {\n\t}\n\treturn nil', 'if (a.(*int64) == nil || *a.(*int64) < 4) {', true ],
        [ '\tvar aparamsV []any = this.HandleParamInteger(o, "a")\n\ta := aparamsV[0]\n\tif IsGreaterThan(a, this.Seconds()) {\n\t}\n\treturn nil', 'IsGreaterThan(a, this.Seconds())', true ],
        [ '\tm, p := this.HandleOptionIntegerAndParams(o, "f", "m", 3)\n\t_ = p\n\tfor i := 1; IsLessThan(i, m); i++ {\n\t}\n\treturn nil', 'for i := 1; (int64(i) < m); i++ {', true ],
        [ '\tm, p := this.HandleOptionIntegerAndParams(o, "f", "m", 3)\n\t_ = p\n\tvar e any = 0\n\tfor IsLessThanOrEqual(e, m) {\n\t\te = Add(e, 1)\n\t}\n\treturn nil', 'for (int64(e.(int)) <= m) {', true ],
        [ '\tvar e any = 0\n\te = this.Sum(e, 1)\n\tif IsGreaterThan(e, 0) {\n\t}\n\treturn nil', 'IsGreaterThan(e, 0)', true ],
        [ '\tvar e *int64 = this.SafeInteger(o, "e")\n\tvar f *int64 = this.SafeInteger(o, "f")\n\tif e == nil {\n\t\treturn nil\n\t}\n\tif f == nil {\n\t\treturn nil\n\t}\n\tif IsLessThan(e, *f-1) {\n\t}\n\treturn nil', 'if (*e < *f-1) {', true ],
        [ '\tvar e *int64 = this.SafeInteger(o, "e")\n\tvar f *int64 = this.SafeInteger(o, "f")\n\tif IsLessThan(e, *f-1) {\n\t}\n\treturn nil', 'IsLessThan(e, *f-1)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G23Comparisons (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G23: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}

// hx4 G26
// Subtract/Multiply on proven non-nil float64 operands and int64-with-int pairs; pointer locals proven
// non-nil by any `x != nil` conjunct of an enclosing `if` or an earlier `if x == nil [|| ...] { exit }`.
function hx4G26Native (helper: string, a: string, b: string, ka: Kind, kb: Kind): { text: string, kind: Kind } | undefined {
    const op = (helper === 'Subtract') ? ' - ' : ' * ';
    // the helper's int64 result: Multiply converts to b's int kind, Subtract is exact below 2^53
    if (((ka === 'i64') && (kb === 'int')) || ((ka === 'int') && (kb === 'i64'))) {
        return { 'text': '(' + ((ka === 'int') ? 'int64(' + a + ')' : a) + op + ((kb === 'int') ? 'int64(' + b + ')' : b) + ')', 'kind': 'i64' };
    }
    const floatSide = (k: Kind) => (k === 'f64') || (k === 'flit') || (k === 'ilit');
    if ((ka !== 'f64') && (kb !== 'f64')) {
        return undefined;
    }
    if (floatSide (ka) && floatSide (kb)) {
        return { 'text': '(' + a + op + b + ')', 'kind': 'f64' };
    }
    // Subtract goes through ToFloat64 on both sides; Multiply(f64, int64) would truncate a to b's kind
    if ((helper === 'Subtract') || (kb === 'f64')) {
        return { 'text': '(' + goArithAsFloat (a, ka) + op + goArithAsFloat (b, kb) + ')', 'kind': 'f64' };
    }
    return undefined;
}

function hx4G26Split (cond: string, sep: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < cond.length; i++) {
        const c = cond[i];
        if (c === '(' || c === '[' || c === '{') { depth++; } else if (c === ')' || c === ']' || c === '}') { depth--; }
        else if ((depth === 0) && cond.startsWith (sep, i)) { parts.push (cond.slice (start, i)); start = i + sep.length; i += sep.length - 1; }
    }
    parts.push (cond.slice (start));
    return parts.map ((p) => goArithStripParens (p));
}

// a declared-once, never-rewritten *int64/*float64 local or param that is non-nil at scope.pos
function hx4G26PointerNonNil (scope: GoArithScope, name: string): boolean {
    if (!hx4G17SingleWrite (scope, name)) {
        return false;
    }
    const lines = scope.masked.slice (0, scope.pos).split ('\n');
    const all = scope.masked.split ('\n');
    const indentOf = (l: string) => l.length - l.replace (/^\t+/, '').length;
    let indent = indentOf (lines[lines.length - 1]);
    for (let k = lines.length - 2; k >= 1; k--) {
        const s = lines[k].trim ();
        if (s === '') {
            continue;
        }
        const li = indentOf (lines[k]);
        if (li < indent) {
            indent = li;
            if (/^(?:\} else|else)/.test (s) && !/^\} else if /.test (s)) {
                return false;
            }
            const head = /^(?:\} else )?if (.*) \{$/.exec (s);
            if (head && (head[1].indexOf ('||') < 0) && (head[1].indexOf (';') < 0) && hx4G26Split (head[1], '&&').includes (name + ' != nil')) {
                return true;
            }
            continue;
        }
        const exit = /^if (.*) \{$/.exec (s);
        if ((li === indent) && exit && (exit[1].indexOf ('&&') < 0) && hx4G26Split (exit[1], '||').includes (name + ' == nil')) {
            let j = k + 1;
            let last = '';
            while ((j < all.length) && ((all[j].trim () === '') || (indentOf (all[j]) > li))) {
                if (all[j].trim () !== '') {
                    last = all[j].trim ();
                }
                j++;
            }
            if ((j < all.length) && (all[j].trim () === '}') && /^(?:return\b|continue$|break$|panic\()/.test (last)) {
                return true;
            }
        }
    }
    return false;
}

// `x, p := this.HandleOptionIntegerAndParams(...)` (base method): x is a plain int64
function hx4G26TupleInt64 (scope: GoArithScope, name: string): boolean {
    if ((hx4G23DeclCount (scope.masked, name) !== 1) || !hx4G17SingleWrite (scope, name)) {
        return false;
    }
    const pair = new RegExp ('(?<![\\w.])' + name + ',\\s*\\w+\\s*:=\\s*this\\.(HandleOptionIntegerAndParams2?)\\(').exec (scope.masked);
    return (pair !== null) && !scope.ownMethods.has (pair[1]) && (pair.index < scope.pos);
}

export function hx4G26SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, q *float64) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar p *float64 = this.SafeNumber(o, "p")\n\tvar a *float64 = this.SafeNumber(o, "a")\n\tvar c any = nil\n\tif (p != nil) && (a != nil) {\n\t\tc = Multiply(p, a)\n\t}\n\treturn c', 'c = (*p * *a)', true ],
        [ '\tvar p *float64 = this.SafeNumber(o, "p")\n\tvar a *float64 = this.SafeNumber(o, "a")\n\tvar c any = nil\n\tif (p != nil) || (a != nil) {\n\t\tc = Multiply(p, a)\n\t}\n\treturn c', 'Multiply(p, a)', true ],
        [ '\tvar p *float64 = this.SafeNumber(o, "p")\n\tvar a *float64 = this.SafeNumber(o, "a")\n\tif (p != nil) && (a != nil) {\n\t\tp = this.SafeNumber(o, "x")\n\t\treturn Subtract(p, a)\n\t}\n\treturn nil', 'Subtract(p, a)', true ],
        [ '\tvar p *float64 = this.SafeNumber(o, "p")\n\tvar a *float64 = this.SafeNumber(o, "a")\n\tif p != nil {\n\t} else {\n\t\treturn Subtract(p, a)\n\t}\n\treturn nil', 'Subtract(p, a)', true ],
        [ '\tif q == nil {\n\t\treturn nil\n\t}\n\tvar r *float64 = this.SafeNumber(o, "r")\n\tvar v any = func() any {\n\t\tif r == nil {\n\t\t\treturn nil\n\t\t}\n\t\treturn ccxt.Multiply(r, 100)\n\t}()\n\treturn ccxt.Subtract(q, 1)', '(*r * 100)', true ],
        [ '\tif q == nil {\n\t\treturn nil\n\t}\n\treturn ccxt.Subtract(q, 1)', '(*q - 1)', true ],
        [ '\tvar r *float64 = this.SafeNumber(o, "r")\n\treturn Multiply(r, 100)', 'Multiply(r, 100)', true ],
        [ '\tvar n int64 = 3\n\tvar r *float64 = this.SafeNumber(o, "r")\n\tif r == nil {\n\t\treturn nil\n\t}\n\treturn Multiply(r, n)', 'Multiply(r, n)', true ],
        [ '\tvar n int64 = 3\n\tvar r *float64 = this.SafeNumber(o, "r")\n\tif r == nil {\n\t\treturn nil\n\t}\n\treturn Subtract(r, n)', '(*r - float64(n))', true ],
        [ '\tvar r *float64 = this.SafeNumber(o, "r")\n\tif r == nil {\n\t\treturn nil\n\t}\n\tif Multiply(r, 2) == 0 {\n\t}\n\treturn nil', 'Multiply(r, 2) == 0', true ],
        [ '\tm, p := this.HandleOptionIntegerAndParams(o, "f", "m", 100)\n\t_ = p\n\tvar page int64 = 2\n\treturn this.SafeInteger(p, "offset", ccxt.Multiply(page, m))', '(page * m)', true ],
        [ '\tvar page int64 = 2\n\tvar m int = 100\n\treturn Multiply(page, m)', '(page * int64(m))', true ],
        [ '\tvar page int64 = 2\n\tvar m any = 100\n\treturn Multiply(page, m)', 'Multiply(page, m)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = goNativeArithmetic (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G26: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}


// hx4 G27
// Ordered comparisons G18/G23 leave: float `<`/`<=` print the helper's own NaN algebra
// (`IsLessThan = !(a >= b)`, `LE = !(a > b)`), and non-nil BaseExchange numeric fields type.
const HX4G27_FIELDS: { [name: string]: Kind } = { 'RateLimit': 'f64', 'FetchHistoryCacheSize': 'int', 'MinFundingAddressLength': 'int' };

function hx4G27Native (helper: string, a: string, b: string, ka: Kind, kb: Kind, pa: boolean, pb: boolean, name: string[]): string | undefined {
    const op: string = { 'IsGreaterThan': '>', 'IsGreaterThanOrEqual': '>=', 'IsLessThan': '<', 'IsLessThanOrEqual': '<=' }[helper];
    const isLit = (k: Kind) => (k === 'ilit') || (k === 'flit');
    if ((op === undefined) || (isLit (ka) && isLit (kb))) {
        return undefined;
    }
    const float = (ka === 'f64') || (kb === 'f64') || (ka === 'flit') || (kb === 'flit');
    if (float && ((ka === 'flit' && kb === 'int') || (kb === 'flit' && ka === 'int'))) {
        return undefined;
    }
    const conv = (x: string, k: Kind, other: Kind) => {
        if (float && ((k === 'i64') || (k === 'int'))) { return 'float64(' + x + ')'; }
        if ((k === 'int') && (other === 'i64')) { return 'int64(' + x + ')'; }
        return x;
    };
    const ca = conv (a, ka, kb);
    const cb = conv (b, kb, ka);
    let cmp = ca + ' ' + op + ' ' + cb;
    if (float && (op === '<')) {
        cmp = '!(' + ca + ' >= ' + cb + ')';
    } else if (float && (op === '<=')) {
        cmp = '!(' + ca + ' > ' + cb + ')';
    }
    if (!pa && !pb) {
        return '(' + cmp + ')';
    }
    const [ na, nb ] = name;
    // helper nil table: GT(nil, x) false, GT(x, nil) true, EQ(nil, nil) true
    const gtOrGe = (op === '>') || (op === '>=');
    if (pa && pb) {
        if (op === '>') { return '(' + na + ' != nil && (' + nb + ' == nil || ' + cmp + '))'; }
        if (op === '<') { return '(' + nb + ' != nil && (' + na + ' == nil || ' + cmp + '))'; }
        if (op === '>=') { return '(' + nb + ' == nil || (' + na + ' != nil && ' + cmp + '))'; }
        return '(' + na + ' == nil || (' + nb + ' != nil && ' + cmp + '))';
    }
    if (pa) {
        return gtOrGe ? '(' + na + ' != nil && ' + cmp + ')' : '(' + na + ' == nil || ' + cmp + ')';
    }
    return gtOrGe ? '(' + nb + ' == nil || ' + cmp + ')' : '(' + nb + ' != nil && ' + cmp + ')';
}

function hx4G27RewriteFunc (text: string, ownMethods: Set<string>, fields: Set<string>): string {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const rx = /(?<![\w.])(?:ccxt\.)?(IsGreaterThanOrEqual|IsLessThanOrEqual|IsGreaterThan|IsLessThan)\(/g;
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    calls.sort ((x, y) => y.start - x.start);
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        const spans = (close < 0) ? [] : goArithArgs (masked, call.open, close);
        if (spans.length !== 2) {
            continue;
        }
        scope.pos = call.start;
        const args = spans.map (([ s, e ]) => goArithStripParens (text.slice (s, e)));
        const margs = spans.map (([ s, e ]) => goArithStripParens (masked.slice (s, e)));
        const isPtr: boolean[] = [];
        const kinds: (Kind | undefined)[] = [];
        const ops: string[] = [];
        for (let i = 0; i < 2; i++) {
            const x = args[i];
            const field = /^this\.(\w+)$/.exec (x);
            const declared = /^[A-Za-z_]\w*$/.test (x) ? goArithDeclaredType (scope.masked, scope.signature, x) : undefined;
            if (field && fields.has (field[1])) {
                isPtr.push (false); kinds.push (HX4G27_FIELDS[field[1]]); ops.push (x);
            } else if ((declared === '*int64') || (declared === '*float64')) {
                const nonNil = hx4G17PointerNonNil (scope, x, declared) || g10kArithPointerIsNonNil (scope, x);
                isPtr.push (!nonNil); kinds.push ((declared === '*int64') ? 'i64' : 'f64'); ops.push ('*' + x);
            } else {
                isPtr.push (false); kinds.push (hx4G18Kind (scope, x, margs[i])); ops.push (x);
            }
        }
        if (kinds.some ((k) => k === undefined) || (isPtr[0] && !isPtr[1] && !hx4G18Skippable (margs[1])) || (isPtr[1] && !isPtr[0] && !hx4G18Skippable (margs[0]))) {
            continue;
        }
        let native = hx4G27Native (call.helper, ops[0], ops[1], kinds[0] as Kind, kinds[1] as Kind, isPtr[0], isPtr[1], args);
        if (native === undefined) {
            continue;
        }
        if (/\(\s*$/.test (masked.slice (0, call.start)) && /^\s*\)/.test (masked.slice (close + 1))) {
            native = native.slice (1, -1);
        }
        text = text.slice (0, call.start) + native + text.slice (close + 1);
        masked = masked.slice (0, call.start) + goArithMask (native) + masked.slice (close + 1);
        scope.masked = masked;
    }
    return text;
}

export function hx4G27Comparisons (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/(?<![\w.])(?:ccxt\.)?Is(?:Greater|Less)Than/.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    // a file that declares its own field / method of that name may shadow the BaseExchange one
    const fields = new Set<string> (Object.keys (HX4G27_FIELDS).filter ((f) => !new RegExp ('^\\s+' + f + '\\s+[\\w*\\[]|\\) ' + f + '\\(', 'm').test (masked)));
    const lines = content.split ('\n');
    const out: string[] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) { start = k; } else { out.push (lines[k]); }
            continue;
        }
        if (lines[k] === '}') {
            const fn = lines.slice (start, k + 1).join ('\n');
            // only methods on an exchange receiver (`this`) see BaseExchange fields
            const own = /^func \(this \*\w+\)/.test (lines[start]) ? fields : new Set<string> ();
            out.push (hx4G27RewriteFunc (fn, ownMethods, own));
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    return out.join ('\n');
}

export function hx4G27SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, n any) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar d *float64 = this.SafeNumber(o, 2)\n\tif (d != nil) && IsLessThan(d, 0) {\n\t}\n\treturn nil', '(d != nil) && (!(*d >= 0))', true ],
        [ '\tvar d *float64 = this.SafeNumber(o, 2)\n\tif ccxt.IsLessThan(d, 0) {\n\t}\n\treturn nil', 'if (d == nil || !(*d >= 0)) {', true ],
        [ '\tvar a *float64 = this.SafeNumber(o, \"a\")\n\tvar b *float64 = this.SafeNumber(o, \"b\")\n\tif IsLessThan(a, b) {\n\t}\n\treturn nil', 'if (b != nil && (a == nil || !(*a >= *b))) {', true ],
        [ '\tvar d *float64 = this.SafeNumber(o, 2)\n\tif IsLessThanOrEqual(d, 0) {\n\t}\n\treturn nil', 'if (d == nil || !(*d > 0)) {', true ],
        [ '\tvar m float64 = 2.5\n\tfor p := 1; ccxt.IsLessThan(p, m); p++ {\n\t}\n\treturn nil', 'for p := 1; (!(float64(p) >= m)); p++ {', true ],
        [ '\tif IsGreaterThan(this.RateLimit, 0) {\n\t}\n\treturn nil', 'if (this.RateLimit > 0) {', true ],
        [ '\tif IsLessThan(GetLength(n), this.MinFundingAddressLength) {\n\t}\n\treturn nil', '(GetLength(n) < this.MinFundingAddressLength)', true ],
        [ '\tif IsLessThan(n, 0.5) {\n\t}\n\treturn nil', 'IsLessThan(n, 0.5)', true ],
        [ '\tvar d *float64 = this.SafeNumber(o, 2)\n\tif IsLessThan(d, this.Seconds()) {\n\t}\n\treturn nil', 'IsLessThan(d, this.Seconds())', true ],
        [ '\tif IsGreaterThan(this.Other, 0) {\n\t}\n\treturn nil', 'IsGreaterThan(this.Other, 0)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G27Comparisons (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G27: expected ' + want + ' in ' + out);
        }
    }
    // a struct that redeclares the field keeps the helper
    const shadow = hx4G27Comparisons ('// PLEASE DO NOT EDIT THIS FILE\ntype K struct {\n\tRateLimit any\n}\n' + wrap ('\tif IsGreaterThan(this.RateLimit, 0) {\n\t}\n\treturn nil'));
    if (!shadow.includes ('IsGreaterThan(this.RateLimit, 0)')) {
        problems.push ('hx4 G27: shadowed field went native: ' + shadow);
    }
    return problems;
}

// hx4 G30
// `var x any = E` whose every write is a never-nil integer (int64 expression, int literal, a nil-guarded
// `*int64` arm, a literal-default SafeInteger) and whose every read is an argument of a helper that
// derefs and normalizes its operands: `var x int64` changes no value, so the native pass can fire.
const HX4G30_READERS = /(?:^|[^\w.])(?:ccxt\.)?(Subtract|Multiply|IsLessThan|IsGreaterThan|IsLessThanOrEqual|IsGreaterThanOrEqual|mathMin|mathMax|MathMin|MathMax)\($|this\.Sum\($/;

// the int64 text a write stores, or undefined when the write is not provably a never-nil integer
function hx4G30Write (scope: GoArithScope, text: string, maskedText: string, guarded: Set<string>): string | undefined {
    const t = goArithStripParens (text);
    const m = goArithStripParens (maskedText);
    if (/^\d+$/.test (t) && (goArithIntLiteralValue (t) !== undefined)) {
        return t;
    }
    if (guarded.has (t)) {
        return '*' + t;
    }
    if (/^[A-Za-z_]\w*$/.test (t)) {
        const type = goArithDeclaredType (scope.masked, scope.signature, t);
        if ((type === 'int') && (t !== 'nil')) {
            return 'int64(' + t + ')';
        }
        if ((type === '*int64') && (g10kArithPointerIsNonNil (scope, t) || hx4G17PointerNonNil (scope, t, type) || hx4G26PointerNonNil (scope, t))) {
            return '*' + t;
        }
    }
    if (/^this\.SafeInteger(2|N)?\(/.test (m) && (hx4G17NonNilIntegerInit (m) || hx4G30LocalDefault (scope, m))) {
        return '*' + t;
    }
    if (/^this\.Sum\(/.test (m)) {
        return undefined;   // Sum returns `any`
    }
    const mm = /^(?:ccxt\.)?(mathMin|mathMax|MathMin|MathMax)\(/.exec (m);
    if (mm && (goArithClose (m, mm[0].length - 1) === m.length - 1)) {
        // the helper boxes an integral float64; every read normalizes it, so the int64 builtin is the same value
        const spans = goArithArgs (m, mm[0].length - 1, m.length - 1);
        if (spans.length !== 2) {
            return undefined;
        }
        const parts = spans.map (([ s0, e0 ]) => hx4G30Write (scope, t.slice (s0, e0).trim (), m.slice (s0, e0).trim (), guarded));
        if (parts.some ((p) => p === undefined) || parts.every ((p, i) => /^\d+$/.test (p as string))) {
            return undefined;
        }
        return (mm[1].toLowerCase ().endsWith ('min') ? 'min(' : 'max(') + parts.join (', ') + ')';
    }
    scope.derefs = new Set<string> ();
    scope.sums = new Map<string, string> ();
    const kind = goArithKind (scope, text, maskedText);
    return ((kind === 'i64') && (scope.derefs.size === 0) && (scope.sums.size === 0)) ? text : undefined;
}

function hx4G30BuiltinShadowed (masked: string): boolean {
    return /(?<![\w.])(?:min|max)\s*(?::=|,|\s+\w)|\bvar (?:min|max)\b|[(,]\s*(?:min|max)\s+\w/.test (masked);
}

// a native Go `a * b - c` (+ - * only) over int64 operands and int constants is a never-nil int64
export function hx4G30NativeIntExpr (scope: GoArithScope, t: string, m: string): boolean {
    if ((t.length !== m.length) || !/[-+*]/.test (m) || /[/%<>=!&|^]/.test (m)) {
        return false;
    }
    const parts: [ number, number ][] = [];
    let depth = 0;
    let start = 0;
    let prevOperand = false;
    for (let i = 0; i < m.length; i++) {
        const c = m[i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; prevOperand = false; continue; }
        if ((c === ')') || (c === ']') || (c === '}')) { depth--; prevOperand = true; continue; }
        if (depth > 0) { continue; }
        if (((c === '+') || (c === '-') || (c === '*')) && prevOperand) {
            parts.push ([ start, i ]);
            start = i + 1;
            prevOperand = false;
            continue;
        }
        if (/\w/.test (c)) { prevOperand = true; }
    }
    parts.push ([ start, m.length ]);
    if (parts.length < 2) {
        return false;
    }
    let typed = false;
    for (const [ s0, e0 ] of parts) {
        const pt = t.slice (s0, e0).trim ();
        const pm = m.slice (s0, e0).trim ();
        if (pt === '') {
            return false;
        }
        const saved = scope.derefs;
        scope.derefs = new Set<string> ();
        const k = /^\d+$/.test (pt) ? 'ilit' : goArithKind (scope, pt, pm);
        const derefNeeded = scope.derefs.size > 0;
        scope.derefs = saved;
        if (derefNeeded || ((k !== 'i64') && (k !== 'ilit'))) {
            return false;   // the printed text must already be the int64 value
        }
        typed = typed || (k === 'i64');
    }
    return typed;
}

// `this.SafeInteger{,2,N}(..., d)` with d a declared `int`/`int64` local: the base method boxes d, never nil
function hx4G30LocalDefault (scope: GoArithScope, m: string): boolean {
    const call = /^this\.SafeInteger(2|N)?\(/.exec (m);
    if (!call || (goArithClose (m, call[0].length - 1) !== m.length - 1)) {
        return false;
    }
    const spans = goArithArgs (m, call[0].length - 1, m.length - 1);
    const want = (call[1] === '2') ? 4 : 3;
    if (spans.length !== want) {
        return false;
    }
    const def = m.slice (spans[want - 1][0], spans[want - 1][1]).trim ();
    const type = /^[A-Za-z_]\w*$/.test (def) ? goArithDeclaredType (scope.masked, scope.signature, def) : undefined;
    return (type === 'int') || (type === 'int64');
}

// `*int64` pointers the closure condition proves non-nil in the given arm
function hx4G30ArmGuards (scope: GoArithScope, condition: string, trueArm: boolean): Set<string> {
    const out = new Set<string> ();
    const c = goArithStripParens (condition);
    if (trueArm && (c.indexOf ('||') < 0)) {
        for (const part of hx4G26Split (c, '&&')) {
            const g = /^([A-Za-z_]\w*) != nil$/.exec (part);
            if (g && (goArithDeclaredType (scope.masked, scope.signature, g[1]) === '*int64') && hx4G17SingleWrite (scope, g[1])) {
                out.add (g[1]);
            }
        }
    }
    if (!trueArm) {
        const g = /^([A-Za-z_]\w*) == nil$/.exec (c);
        if (g && (goArithDeclaredType (scope.masked, scope.signature, g[1]) === '*int64') && hx4G17SingleWrite (scope, g[1])) {
            out.add (g[1]);
        }
    }
    return out;
}

// every read of name is a whole argument of a deref-normalizing helper
function hx4G30ReadsNormalize (masked: string, name: string, writeSpans: [ number, number ][]): boolean {
    const rx = new RegExp ('(?<![\\w.*&])' + name + '(?![\\w])', 'g');
    for (const m of masked.matchAll (rx)) {
        const at = m.index as number;
        if (writeSpans.some (([ s, e ]) => (at >= s) && (at < e))) {
            continue;
        }
        const after = masked.slice (at + name.length);
        if (!/^\s*[,)]/.test (after)) {
            if (process.env.HX4G30_DEBUG) { console.error ('G30 readctx', name, '|', masked.slice (Math.max (0, at - 50), at + name.length + 10).replace (/\s+/g, ' ')); }
            return false;
        }
        // innermost open paren before the read, and the argument boundary right before it
        let depth = 0;
        let i = at - 1;
        for (; i >= 0; i--) {
            const c = masked[i];
            if ((c === ')') || (c === ']') || (c === '}')) { depth++; }
            else if ((c === '(') || (c === '[') || (c === '{')) { if (depth === 0) { break; } depth--; }
        }
        if ((i < 0) || (masked[i] !== '(')) {
            if (process.env.HX4G30_DEBUG) { console.error ('G30 readctx', name, '|', masked.slice (Math.max (0, at - 50), at + name.length + 10).replace (/\s+/g, ' ')); }
            return false;
        }
        const between = masked.slice (i + 1, at);
        if (!/^\s*$/.test (between) && !/,\s*$/.test (between)) {
            return false;
        }
        if (/,\s*$/.test (between)) {
            // the read must start its own argument (nothing of a sibling expression before it)
            let d = 0;
            for (let j = at - 1; j > i; j--) {
                const c = masked[j];
                if ((c === ')') || (c === ']') || (c === '}')) { d++; } else if ((c === '(') || (c === '[') || (c === '{')) { d--; }
                else if ((c === ',') && (d === 0)) { if (!/^\s*$/.test (masked.slice (j + 1, at))) { return false; } break; }
            }
        }
        if (!HX4G30_READERS.test (masked.slice (Math.max (0, i - 40), i + 1))) {
            if (process.env.HX4G30_DEBUG) { console.error ('G30 readctx', name, '|', masked.slice (Math.max (0, i - 40), at + name.length + 10).replace (/\s+/g, ' ')); }
            return false;
        }
    }
    return true;
}

function hx4G30RetypeFunc (text: string, ownMethods: Set<string>): string {
    const masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const lines = text.split ('\n');
    const mlines = masked.split ('\n');
    const lineStart = (line: number) => mlines.slice (0, line).reduce ((n, l) => n + l.length + 1, 0);
    let changed = false;
    for (let k = 1; k < mlines.length; k++) {
        const d = /^(\t+)var (\w+) any = /.exec (mlines[k]);
        if (!d) {
            continue;
        }
        const name = d[2];
        const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
        if ((goArithDeclaredType (masked, scope.signature, name) !== 'any') || (hx4G23DeclCount (masked, name) !== 1)) {
            continue;
        }
        if (new RegExp ('[\\w.](?:\\s*,\\s*' + name + ')+\\s*:?=(?!=)|(?<![\\w.])' + name + '\\s*,[\\w\\s,]*:?=(?!=)|&' + name + '\\b|(?<![\\w.])' + name + '\\s*(?:\\+\\+|--|[-+*/%]=)').test (masked)) {
            continue;
        }
        const ind = d[1];
        const valueCol = d[0].length;
        // [line, value column, guarded pointers]
        const writes: [ number, number, Set<string> ][] = [];
        const writeSpans: [ number, number ][] = [];
        let closureEnd = -1;
        if (mlines[k].slice (valueCol) === 'func() any {') {
            const body = ind + '\t';
            if (!((k + 5 < mlines.length) && mlines[k + 1].startsWith (body + 'if ') && mlines[k + 1].endsWith (' {') && mlines[k + 2].startsWith (body + '\treturn ')
                    && (mlines[k + 3] === body + '}') && mlines[k + 4].startsWith (body + 'return ') && (mlines[k + 5] === ind + '}()'))) {
                continue;
            }
            const cond = mlines[k + 1].slice (body.length + 3, -2);
            scope.pos = lineStart (k + 1);
            writes.push ([ k + 2, body.length + 8, hx4G30ArmGuards (scope, cond, true) ], [ k + 4, body.length + 7, hx4G30ArmGuards (scope, cond, false) ]);
            closureEnd = k + 5;
            writeSpans.push ([ lineStart (k), lineStart (k + 6) ]);
        } else {
            writes.push ([ k, valueCol, new Set<string> () ]);
            writeSpans.push ([ lineStart (k), lineStart (k + 1) ]);
        }
        let ok = true;
        for (let j = k + 1; ok && (j < mlines.length); j++) {
            if (j <= closureEnd) {
                continue;
            }
            const w = new RegExp ('^(\\t+)' + name + ' = ').exec (mlines[j]);
            if (w) {
                writes.push ([ j, w[0].length, new Set<string> () ]);
                writeSpans.push ([ lineStart (j), lineStart (j) + w[0].length ]);
            } else if (new RegExp ('(?<![\\w.*])' + name + '\\s*=(?!=)').test (mlines[j])) {
                ok = false;
            }
        }
        const edits: [ number, number, string ][] = [];
        for (const [ j, col, guarded ] of writes) {
            if (!ok) {
                break;
            }
            const value = lines[j].slice (col);
            const mvalue = mlines[j].slice (col).trimEnd ();
            const comment = value.slice (mvalue.length);
            if ((comment.trim () !== '') && !comment.trim ().startsWith ('//')) {
                ok = false;
                break;
            }
            scope.pos = lineStart (j) + col;
            const native = hx4G30Write (scope, value.slice (0, mvalue.length), mvalue, guarded);
            if ((native !== undefined) && /^(?:min|max)\(/.test (native) && hx4G30BuiltinShadowed (masked)) {
                ok = false;
                break;
            }
            if (native === undefined) {
                if (process.env.HX4G30_DEBUG) { console.error ('G30 write', name, '|', value.trim (), '@', mlines[0].slice (0, 60)); }
                ok = false;
                break;
            }
            edits.push ([ j, col, native + comment ]);
        }
        if (ok && !hx4G30ReadsNormalize (masked, name, writeSpans) && process.env.HX4G30_DEBUG) { console.error ('G30 read', name, '@', mlines[0].slice (0, 60)); }
        if (!ok || !hx4G30ReadsNormalize (masked, name, writeSpans)) {
            continue;
        }
        for (const [ j, col, value ] of edits) {
            lines[j] = lines[j].slice (0, col) + value;
        }
        lines[k] = lines[k].replace ('var ' + name + ' any = ', 'var ' + name + ' int64 = ');
        if (closureEnd > 0) {
            lines[k] = lines[k].replace (/func\(\) any \{$/, 'func() int64 {');
        }
        changed = true;
    }
    return changed ? lines.join ('\n') : text;
}

export function hx4G30Retype (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/\bvar \w+ any = /.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    if (/^func \(this \*\w+\) Sum\(/m.test (masked)) {
        ownMethods.add ('Sum');
    }
    const lines = content.split ('\n');
    const out: string[] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) {
                start = k;
            } else {
                out.push (lines[k]);
            }
            continue;
        }
        if (lines[k] === '}') {
            out.push (hx4G30RetypeFunc (lines.slice (start, k + 1).join ('\n'), ownMethods));
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    return out.join ('\n');
}

// native arithmetic, then retype the locals it proved int64 and rerun until nothing moves
export function hx4G30Arith (content: string): string {
    let out = goNativeArithmetic (content);
    for (let i = 0; i < 4; i++) {
        const retyped = hx4G30Retype (out);
        if (retyped === out) {
            break;
        }
        out = goNativeArithmetic (retyped);
    }
    return out;
}

export function hx4G30SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, limit *int64, until *int64) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        // every write int64, every read a helper argument: typed, and the arithmetic goes native
        [ '\tvar d int64 = 60\n\tvar w any = (d * 1000) * 1000\n\tif limit != nil {\n\t\tw = (d * 1000) * *limit\n\t}\n\treturn Subtract(this.Milliseconds(), w)', '(this.Milliseconds() - w)', true ],
        [ '\tvar d int64 = 60\n\tvar e any = func() any {\n\t\tif until != nil {\n\t\t\treturn until\n\t\t}\n\t\treturn this.Milliseconds()\n\t}()\n\treturn Subtract(e, d)', 'var e int64 = func() int64 {', true ],
        [ '\tvar d int64 = 60\n\tif limit != nil {\n\t\tvar c any = mathMin(limit, 1440)\n\t\treturn Multiply(c, d)\n\t}\n\treturn nil', '(c * d)', true ],
        [ '\tvar dl *int64 = this.SafeInteger(o, "l", 200)\n\tvar n int64 = 5\n\tvar c any = dl\n\tif limit != nil {\n\t\tc = limit\n\t}\n\treturn Subtract(n, c)', '(n - c)', true ],
        // negatives: a nil write, a nil test, a plain read, an unguarded pointer, a Sum write keep `any` and the helper
        [ '\tvar d int64 = 60\n\tvar w any = nil\n\tif limit != nil {\n\t\tw = d * 2\n\t}\n\treturn Subtract(w, d)', 'Subtract(w, d)', true ],
        [ '\tvar d int64 = 60\n\tvar w any = d * 2\n\tif w == nil {\n\t}\n\treturn Subtract(w, d)', 'var w any', true ],
        [ '\tvar d int64 = 60\n\tvar w any = d * 2\n\to = w\n\treturn Subtract(w, d)', 'var w any', true ],
        [ '\tvar d int64 = 60\n\tvar w any = limit\n\treturn Subtract(w, d)', 'Subtract(w, d)', true ],
        [ '\tvar d int64 = 60\n\tvar w any = this.Sum(d, 1)\n\treturn Subtract(w, d)', 'Subtract(w, d)', true ],
        [ '\tvar d int64 = 60\n\tvar w any = mathMin(limit, 1440)\n\treturn Subtract(w, d)', 'Subtract(w, d)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G30Arith (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G30: expected ' + want + ' in ' + out);
        }
    }
    return problems;
}

// hx4 G31
// Divide (and a MathFloor/MathCeil around a rewritten one) on operands the passes above cannot type:
// Handle*IntegerAndParams*Nullable element-0 boxes under `!IsEqual(x, nil)`, pointers in the else arm of
// `if x == nil`, int64 sums/differences, `this.RateLimit`; divisors proven positive by name, literal init or guard.
interface Hx4G31Head { cond: string; negated: boolean }

// conditions of the `if` heads enclosing scope.pos (negated = we sit in its plain `else` arm); stops at a func literal
function hx4G31Heads (scope: GoArithScope): Hx4G31Head[] {
    const lines = scope.masked.slice (0, scope.pos).split ('\n');
    const indentOf = (l: string) => l.length - l.replace (/^\t+/, '').length;
    const heads: Hx4G31Head[] = [];
    let indent = indentOf (lines[lines.length - 1]);
    for (let k = lines.length - 2; k >= 1; k--) {
        const s = lines[k].trim ();
        const li = indentOf (lines[k]);
        if ((s === '') || (li >= indent)) {
            continue;
        }
        indent = li;
        if (/\bfunc\b/.test (s)) {
            break;
        }
        if (s === '} else {') {
            // the chain head at the same indent; an `else if` chain proves nothing
            for (let j = k - 1; j >= 1; j--) {
                const t = lines[j].trim ();
                const lj = indentOf (lines[j]);
                if ((t === '') || (lj > li)) {
                    continue;
                }
                if (lj < li || /^\} else if /.test (t)) {
                    break;
                }
                const h = /^if (.*) \{$/.exec (t);
                if (h) {
                    heads.push ({ 'cond': h[1], 'negated': true });
                    k = j;
                    break;
                }
            }
            continue;
        }
        const head = /^if (.*) \{$/.exec (s);
        if (head) {
            heads.push ({ 'cond': head[1], 'negated': false });
        }
    }
    return heads;
}

function hx4G31Guarded (scope: GoArithScope, conjunct: string): boolean {
    return hx4G31Heads (scope).some ((h) => !h.negated && (h.cond.indexOf ('||') < 0) && (h.cond.indexOf (';') < 0) && hx4G26Split (h.cond, '&&').includes (conjunct));
}

// `var p *int64 = this.SafeInteger{,2,N}(..., D)` with D an int literal, a plain int/int64 local, or such a pointer
function hx4G31NonNilInit (scope: GoArithScope, name: string, depth: number): boolean {
    if ((depth > 3) || !hx4G17SingleWrite (scope, name) || (goArithDeclaredType (scope.masked, scope.signature, name) !== '*int64')) {
        return false;
    }
    const decl = new RegExp ('\\bvar\\s+' + name + '\\s+\\*int64\\s*=\\s*([^\\n]+)').exec (scope.masked);
    if (!decl || (decl.index > scope.pos)) {
        return false;
    }
    const text = decl[1].trim ();
    const call = /^this\.SafeInteger(2|N)?\(/.exec (text);
    if (!call || (goArithClose (text, call[0].length - 1) !== text.length - 1)) {
        return false;
    }
    const spans = goArithArgs (text, call[0].length - 1, text.length - 1);
    const want = (call[1] === '2') ? 4 : 3;
    if (spans.length !== want) {
        return false;
    }
    const def = text.slice (spans[want - 1][0], spans[want - 1][1]).trim ();
    if (/^-?\d+$/.test (def)) {
        return true;
    }
    if (!/^[A-Za-z_]\w*$/.test (def)) {
        return false;
    }
    const type = goArithDeclaredType (scope.masked, scope.signature, def);
    return (type === 'int') || (type === 'int64') || hx4G31NonNilInit (scope, def, depth + 1);
}

// kind + Go spelling of an operand, or undefined
function hx4G31Operand (scope: GoArithScope, text: string, masked: string, fields: Set<string>, fileOwn: Set<string> = new Set<string> ()): { kind: Kind, text: string } | undefined {
    const t = goArithStripParens (text);
    const m = goArithStripParens (masked);
    const known = scope.known.get (t);
    if (known !== undefined) {
        return { 'kind': known, 'text': t };
    }
    if (/^[A-Za-z_]\w*$/.test (t)) {
        const declared = goArithDeclaredType (scope.masked, scope.signature, t);
        if (((declared === '*int64') || (declared === '*float64')) && hx4G17SingleWrite (scope, t)) {
            const elseOfNil = hx4G31Heads (scope).some ((h) => h.negated && (goArithStripParens (h.cond) === t + ' == nil'));
            if (elseOfNil || hx4G31NonNilInit (scope, t, 0)) {
                return { 'kind': (declared === '*int64') ? 'i64' : 'f64', 'text': '*' + t };
            }
        }
        if ((hx4G23TupleType (scope, t, fileOwn) === '*int64') && hx4G31Guarded (scope, '!IsEqual(' + t + ', nil)')) {
            return { 'kind': 'i64', 'text': '*' + t + '.(*int64)' };
        }
    }
    const field = /^this\.(\w+)$/.exec (t);
    if (field && fields.has (field[1]) && (HX4G27_FIELDS[field[1]] === 'f64')) {
        return { 'kind': 'f64', 'text': t };
    }
    const tight = /^([A-Za-z_]\w*)([-+])(\d+)$/.exec (m);
    if (tight && (t === m)) {
        const l = hx4G31Operand (scope, tight[1], tight[1], fields, fileOwn);
        return (l && (l.kind === 'i64') && (l.text === tight[1])) ? { 'kind': 'i64', 'text': '(' + t + ')' } : undefined;
    }
    // `a - b` / `a + b` of int64 operands (one top-level operator)
    const minus = hx4G26Split (m, ' - ');
    const plus = hx4G26Split (m, ' + ');
    if (((minus.length === 2) !== (plus.length === 2)) && (hx4G26Split (m, ' * ').length === 1) && (hx4G26Split (m, ' / ').length === 1)) {
        const op = (minus.length === 2) ? ' - ' : ' + ';
        const at = m.indexOf (op, m.length - (op === ' - ' ? minus[1] : plus[1]).length - op.length - 1);
        const side = (s: string, ms: string) => hx4G31Operand (scope, s, ms, fields, fileOwn);
        const l = side (t.slice (0, at), m.slice (0, at));
        const r = side (t.slice (at + op.length), m.slice (at + op.length));
        if (l && r && isInt64Side (l.kind) && isInt64Side (r.kind) && ((l.kind === 'i64') || (r.kind === 'i64'))) {
            return { 'kind': 'i64', 'text': '(' + l.text + op + r.text + ')' };
        }
        return undefined;
    }
    // BaseExchange.Sum of integral operands boxes an int64 sum
    const sum = /^this\.Sum\(/.exec (m);
    if (sum && !scope.ownMethods.has ('Sum') && (t.length === m.length) && (goArithClose (m, sum[0].length - 1) === m.length - 1)) {
        const parts: string[] = [];
        let typed = false;
        const ps = goArithArgs (m, sum[0].length - 1, m.length - 1).map (([ s0, e0 ]) => hx4G31Operand (scope, t.slice (s0, e0), m.slice (s0, e0), fields, fileOwn));
        // Sum folds Add from 0.0: float64 operands give their float64 sum
        if ((ps.length >= 2) && ps.every ((p) => p && (p.kind === 'f64'))) {
            return { 'kind': 'f64', 'text': '(' + ps.map ((p) => p?.text).join (' + ') + ')' };
        }
        for (const p of ps) {
            if (!p || ![ 'i64', 'ilit', 'int' ].includes (p.kind as string)) {
                return undefined;
            }
            typed = typed || (p.kind !== 'ilit');
            parts.push ((p.kind === 'int') ? 'int64(' + p.text + ')' : p.text);
        }
        return (typed && (parts.length >= 2)) ? { 'kind': 'i64', 'text': '(' + parts.join (' + ') + ')' } : undefined;
    }
    const saved = scope.derefs;
    scope.derefs = new Set<string> ();
    scope.sums = new Map<string, string> ();
    const kind = goArithKind (scope, t, m);
    const deref = scope.derefs.has (t);
    const summed = scope.sums.get (t);
    scope.derefs = saved;
    if (kind === undefined) {
        return undefined;
    }
    const spelled = deref ? '*' + t : (summed ?? t);
    return { 'kind': kind, 'text': (/^[\w.*]+$|^-?\d+(?:\.\d+)?$/.test (spelled) || /^[\w.]+\(.*\)$/.test (spelled) && (goArithClose (goArithMask (spelled), spelled.indexOf ('(')) === spelled.length - 1)) ? spelled : '(' + spelled + ')' };
}

// divisor never zero (nor negative zero): approved period names, a positive literal local, or an enclosing `x > 0`
function hx4G31PositiveDivisor (scope: GoArithScope, b: string): boolean {
    const t = goArithStripParens (b);
    const lit = (t.indexOf ('.') < 0) ? goArithIntLiteralValue (t) : Number (t);
    if ((lit !== undefined) && (lit > 0)) {
        return true;
    }
    const name = t.replace (/^\*/, '');
    if (/^[A-Za-z_]\w*$/.test (name)) {
        if (hx4G17PositiveDivisor (name)) {
            return true;
        }
        if (hx4G17SingleWrite (scope, name) && new RegExp ('\\bvar\\s+' + name + '\\s+(?:int|int64)\\s*=\\s*[1-9]\\d{0,8}\\s*(?:\\n|$)').test (scope.masked + '\n') && (goArithDeclaredType (scope.masked, scope.signature, name) !== undefined)) {
            return true;
        }
    }
    return /^this\.\w+$/.test (t) && !new RegExp ('(?<![\\w.])' + t.replace ('.', '\\.') + '\\s*=(?!=)').test (scope.masked) && hx4G31Guarded (scope, t + ' > 0');
}

function hx4G31RewriteFunc (text: string, ownMethods: Set<string>, fields: Set<string>, fileOwn: Set<string>): { text: string, math: boolean } {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope = { 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const rx = /(?<![\w.])(?:ccxt\.)?(Divide|MathFloor|MathCeil)\(/g;
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    calls.sort ((x, y) => y.start - x.start);
    const mine = new Set<string> ();
    let usesMath = false;
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        if (close < 0) {
            continue;
        }
        const spans = goArithArgs (masked, call.open, close);
        scope.pos = call.start;
        let native: string | undefined = undefined;
        if ((call.helper === 'Divide') && (spans.length === 2)) {
            const a = hx4G31Operand (scope, text.slice (spans[0][0], spans[0][1]), masked.slice (spans[0][0], spans[0][1]), fields, fileOwn);
            const b = hx4G31Operand (scope, text.slice (spans[1][0], spans[1][1]), masked.slice (spans[1][0], spans[1][1]), fields, fileOwn);
            if (a && b && hx4G31PositiveDivisor (scope, b.text)) {
                // gofmt drops the blanks of a sum inside a conversion's argument list
                const f = (o: { kind: Kind, text: string }) => ((o.kind === 'i64') || (o.kind === 'int')) ? 'float64(' + goArithStripParens (o.text).replace (/ ([-+]) /g, '$1') + ')' : o.text;
                native = '(' + f (a) + ' / ' + f (b) + ')';
            }
        } else if ((call.helper !== 'Divide') && (spans.length === 1)) {
            // only around a quotient this pass produced
            const arg = goArithStripParens (text.slice (spans[0][0], spans[0][1]));
            if (mine.has (arg)) {
                native = 'math.' + call.helper.slice (4) + '(' + arg + ')';
            }
        }
        if (native === undefined) {
            continue;
        }
        let after = close + 1;
        if (/(==|!=)\s*$/.test (masked.slice (0, call.start)) || /^\s*(==|!=)/.test (masked.slice (after))) {
            continue;  // an interface comparison differs from a typed one
        }
        const assertion = /^\.\((\w+)\)/.exec (masked.slice (after));
        if (assertion) {
            if (assertion[1] !== 'float64') {
                continue;
            }
            after += assertion[0].length;
        }
        scope.known.set (native, 'f64');
        scope.known.set (goArithStripParens (native), 'f64');
        if (native.startsWith ('(') && /\(\s*$/.test (masked.slice (0, call.start)) && /^\s*\)/.test (masked.slice (after))) {
            native = native.slice (1, -1);
            scope.known.set (native, 'f64');
        }
        mine.add (goArithStripParens (native));
        usesMath = usesMath || native.startsWith ('math.');
        text = text.slice (0, call.start) + native + text.slice (after);
        masked = masked.slice (0, call.start) + goArithMask (native) + masked.slice (after);
        scope.masked = masked;
    }
    return { text, 'math': usesMath };
}

export function hx4G31Divide (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/(?<![\w.])(?:ccxt\.)?Divide\(/.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const mathShadowed = /(?<![\w.])math\s*(?::=|,)|\bvar math\b|[(,]\s*math\s+\w/.test (masked);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS.concat ([ 'Sum' ])) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    const fields = new Set<string> (Object.keys (HX4G27_FIELDS).filter ((f) => !new RegExp ('^\\s+' + f + '\\s+[\\w*\\[]|\\) ' + f + '\\(', 'm').test (masked)));
    const fileOwn = new Set<string> ([ ...masked.matchAll (/^func \(this \*\w+\) (Handle\w+)\(/gm) ].map ((m) => m[1]));
    const lines = content.split ('\n');
    const out: string[] = [];
    let usesMath = false;
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) { start = k; } else { out.push (lines[k]); }
            continue;
        }
        if (lines[k] === '}') {
            const fn = lines.slice (start, k + 1).join ('\n');
            const own = /^func \(this \*\w+\)/.test (lines[start]) ? fields : new Set<string> ();
            let result = hx4G31RewriteFunc (fn, ownMethods, own, fileOwn);
            if (result.math && mathShadowed) {
                result = { 'text': fn, 'math': false };
            }
            usesMath = usesMath || result.math;
            out.push (result.text);
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    const joined = out.join ('\n');
    return usesMath ? goArithAddMathImport (joined) : joined;
}

export function hx4G31Check (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\n// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n\nfunc (this *K) F(o any, n any) any {\n' + body + '\n}\n';
    const tuple = '\tvar uV []any = this.HandleOptionIntegerAndParamsNullable(o, "f", "until")\n\tu := uV[0]\n';
    const cases: [ string, string, boolean ][] = [
        [ tuple + '\tif !IsEqual(u, nil) {\n\t\treturn this.ParseToInt(Divide(u, 1000))\n\t}\n\treturn nil', 'this.ParseToInt(float64(*u.(*int64)) / 1000)', true ],
        [ tuple + '\treturn this.ParseToInt(Divide(u, 1000))', 'Divide(u, 1000)', true ],
        [ tuple + '\tif !IsEqual(u, nil) || true {\n\t\treturn Divide(u, 1000)\n\t}\n\treturn nil', 'Divide(u, 1000)', true ],
        [ '\tvar s *int64 = this.SafeInteger(o, "s")\n\tvar t int64 = 60\n\tif s == nil {\n\t\treturn nil\n\t} else {\n\t\treturn MathFloor(Divide(s, t))\n\t}', 'math.Floor(float64(*s) / float64(t))', true ],
        [ '\tvar s *int64 = this.SafeInteger(o, "s")\n\tvar t int64 = 60\n\tif s == nil {\n\t\treturn nil\n\t} else if t > 0 {\n\t\treturn Divide(s, t)\n\t}\n\treturn nil', 'Divide(s, t)', true ],
        [ '\tvar s *int64 = this.SafeInteger(o, "s")\n\tvar t int64 = this.ParseToInt(n)\n\tif s != nil {\n\t\treturn Divide(s, t)\n\t}\n\treturn nil', 'Divide(s, t)', true ],
        [ '\tvar p *int64 = this.SafeInteger(o, "p", 100)\n\tvar q *int64 = this.SafeInteger(o, "q", p)\n\tvar pageSize *int64 = this.SafeInteger(o, "z", 10)\n\treturn MathCeil(Divide(q, pageSize))', 'math.Ceil(float64(*q) / float64(*pageSize))', true ],
        [ '\tvar q *int64 = this.SafeInteger(o, "q")\n\tvar pageSize *int64 = this.SafeInteger(o, "z", 10)\n\treturn MathCeil(Divide(q, pageSize))', 'Divide(q, pageSize)', true ],
        [ '\tvar a int = len(o.([]any))\n\tvar chunkSize int64 = 5\n\treturn this.ParseToInt(Divide(this.Sum(a, chunkSize-1), chunkSize))', 'this.ParseToInt(float64(int64(a)+(chunkSize-1)) / float64(chunkSize))', true ],
        [ '\tvar b *float64 = this.SafeNumber(o, "b")\n\tvar c *float64 = this.SafeNumber(o, "c")\n\tif (b != nil) && (c != nil) {\n\t\treturn Divide(this.Sum(b, c), 2)\n\t}\n\treturn nil', '((*b + *c) / 2)', true ],
        [ '\tvar r any = nil\n\tif this.RateLimit > 0 {\n\t\tr = Divide(1, this.RateLimit)\n\t}\n\treturn r', 'r = (1 / this.RateLimit)', true ],
        [ '\tvar r any = Divide(1, this.RateLimit)\n\treturn r', 'Divide(1, this.RateLimit)', true ],
        [ '\tvar l int = 64\n\tvar s int64 = 3\n\treturn this.ParseToInt(Divide(s, l))', 'float64(s) / float64(l)', true ],
        [ '\tvar l int = 0\n\tvar s int64 = 3\n\treturn this.ParseToInt(Divide(s, l))', 'Divide(s, l)', true ],
        [ tuple + '\tif !IsEqual(u, nil) {\n\t\tif Divide(u, 1000) == 2 {\n\t\t}\n\t}\n\treturn nil', 'Divide(u, 1000) == 2', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G31Divide (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G31: expected ' + want + ' in ' + out);
        }
    }
    const shadow = hx4G31Divide ('// PLEASE DO NOT EDIT THIS FILE\ntype K struct {\n\tRateLimit any\n}\n' + wrap ('\tif this.RateLimit > 0 {\n\t\treturn Divide(1, this.RateLimit)\n\t}\n\treturn nil'));
    if (!shadow.includes ('Divide(1, this.RateLimit)')) {
        problems.push ('hx4 G31: shadowed field went native: ' + shadow);
    }
    const imported = hx4G31Divide (wrap ('\tvar s int64 = 3\n\treturn MathCeil(Divide(s, 1000))'));
    if (!imported.includes ('import "math"') || !imported.includes ('math.Ceil(float64(s) / 1000)')) {
        problems.push ('hx4 G31: math import / Ceil missing: ' + imported);
    }
    return problems;
}


// hx4 G32
// Ordered comparisons on `var x any = E` locals whose every write provably boxes one integral kind
// (int literal / Add / Sum / Subtract / Multiply of non-nil integral operands, typed native arithmetic):
// the box is read as `x.(int64)` / `x.(int)`. Pointer operands also accept the G26 non-nil walk.
function hx4G32WriteKind (scope: GoArithScope, name: string, hyp: Kind, text: string, masked: string, seen: Set<string>): Kind | undefined {
    const t = goArithStripParens (text);
    const m = goArithStripParens (masked);
    if (/^\d{1,15}$/.test (t) && !/^0\d/.test (t)) {
        return 'int';
    }
    const arg = (a: string, am: string): Kind | undefined => {
        const s = goArithStripParens (a);
        if (s === name) {
            return hyp;
        }
        // another box local: its own single kind (bounded recursion, cycles answer undefined)
        if (/^[A-Za-z_]\w*$/.test (s) && (goArithDeclaredType (scope.masked, scope.signature, s) === 'any')) {
            return hx4G32BoxKind (scope, s, seen);
        }
        const inner: GoArithScope = { ...scope, 'derefs': new Set<string> (), 'sums': new Map<string, string> () };
        const k = goArithKind (inner, a, am) ?? hx4G18Kind (scope, a, am);
        return (k === 'ilit') ? 'int' : k;
    };
    // `func() any { ... return A ... return B }()`: every return arm boxes the same kind
    if (/^func\(\) any \{/.test (m)) {
        const open = m.indexOf ('{');
        const end = goArithClose (m, open);
        const body = m.slice (open + 1, end);
        if ((end < 0) || (m.slice (end + 1).trim () !== '()') || /\bfunc\b/.test (body)) {
            return undefined;
        }
        const rets = [ ...body.matchAll (/\breturn\b([^\n]*)/g) ];
        const off = open + 1;
        const kinds = rets.map ((r) => {
            const s0 = off + (r.index as number) + 6;
            const e0 = s0 + r[1].trimEnd ().length;
            return hx4G32WriteKind (scope, name, hyp, t.slice (s0, e0), m.slice (s0, e0), seen);
        });
        const stmts = body.split ('\n').map ((l) => l.trim ()).filter ((l) => l !== '');
        if ((rets.length < 2) || !stmts.every ((l) => /^(?:if .* \{|\} else \{|\} else if .* \{|\}|return .+)$/.test (l))) {
            return undefined;
        }
        return kinds.every ((k) => k === hyp) ? hyp : undefined;
    }
    const deref = /^(?:ccxt\.)?DerefScalar\(this\.SafeInteger(?:2|N)?\(/.exec (m);
    if (deref && (goArithClose (m, deref[0].length - 1) === m.length - 2) && hx4G17NonNilIntegerInit (m.slice (deref[0].indexOf ('(') + 1, -1))) {
        return 'i64';
    }
    const call = /^(?:(?:ccxt\.)?(Add|Subtract|Multiply)|this\.(Sum))\(/.exec (m);
    if (call && (goArithClose (m, call[0].length - 1) === m.length - 1) && !((call[2] === 'Sum') && scope.ownMethods.has ('Sum'))) {
        const spans = goArithArgs (m, call[0].length - 1, m.length - 1);
        if ((call[2] === undefined) && (spans.length !== 2)) {
            return undefined;
        }
        const kinds = spans.map (([ s, e ]) => arg (t.slice (s, e).trim (), m.slice (s, e).trim ()));
        if ((kinds.length === 0) || kinds.some ((k) => (k !== 'i64') && (k !== 'int'))) {
            return undefined;
        }
        // Add keeps int+int as int; every other mix goes through int64 (ParseInt / reflect Int())
        return ((call[1] === 'Add') && kinds.every ((k) => k === 'int')) ? 'int' : 'i64';
    }
    if (/^(?:ccxt\.)?\w+\(/.test (m) && !/^(?:int64|int|float64|len)\(/.test (m)) {
        return undefined;
    }
    const k = hx4G18Kind (scope, t, m);
    return ((k === 'i64') || (k === 'int')) ? k : undefined;
}

// the single box kind of a `var name any = E` local over all its writes, assuming it inductively
function hx4G32BoxKind (scope: GoArithScope, name: string, seen: Set<string> = new Set<string> ()): Kind | undefined {
    if (!/^[A-Za-z_]\w*$/.test (name) || seen.has (name) || (seen.size > 4) || (hx4G23DeclCount (scope.masked, name) !== 1)) {
        return undefined;
    }
    const decl = new RegExp ('\\bvar\\s+' + name + '\\s+any\\s*=\\s*([^\\n]+)').exec (scope.masked);
    if (!decl || (decl.index > scope.pos)) {
        return undefined;
    }
    const writes: [ number, number ][] = [ [ decl.index + decl[0].length - decl[1].length, 0 ] ];
    const rx = new RegExp ('(?<![\\w.*])' + name + '\\s*(?:=(?!=)|\\+\\+|--|[-+*/%]=|,[\\w\\s,]*=(?!=))|&' + name + '\\b', 'g');
    for (const w of scope.masked.matchAll (rx)) {
        // only plain `name = E` rebinds; compound, tuple and address-taken writes keep the helper
        if (!/^\w+\s*=$/.test (w[0]) || /,\s*$/.test (scope.masked.slice (0, w.index as number))) {
            return undefined;
        }
        writes.push ([ (w.index as number) + w[0].length, 0 ]);
    }
    // a write spans to the first newline outside brackets (multi-line `func() any {...}()` initializers)
    for (const w of writes) {
        let depth = 0;
        let i = w[0];
        for (; i < scope.masked.length; i++) {
            const c = scope.masked[i];
            if ((c === '(') || (c === '[') || (c === '{')) { depth++; } else if ((c === ')') || (c === ']') || (c === '}')) { depth--; }
            if ((c === '\n') && (depth <= 0)) { break; }
        }
        w[1] = i;
    }
    const text = (scope as GoArithScope & { text: string }).text;
    const inner = new Set<string> ([ ...seen, name ]);
    const saved = scope.pos;
    for (const hyp of [ 'i64', 'int' ] as Kind[]) {
        let ok = true;
        for (const [ s, e ] of writes) {
            const mm = scope.masked.slice (s, e);
            // a trailing comment is masked to spaces; the masked span bounds the expression
            const len = mm.trimEnd ().length;
            scope.pos = s;
            const kind = hx4G32WriteKind (scope, name, hyp, text.slice (s, s + len), mm.slice (0, len), inner);
            if (kind !== hyp) {
                ok = false;
                break;
            }
        }
        scope.pos = saved;
        if (ok) {
            return hyp;
        }
    }
    return undefined;
}

function hx4G32RewriteFunc (text: string, ownMethods: Set<string>, fields: Set<string>): string {
    let masked = goArithMask (text);
    const nl = masked.indexOf ('\n');
    const scope: GoArithScope & { text: string } = { 'text': text, 'masked': masked, 'signature': masked.slice (0, nl < 0 ? masked.length : nl), 'known': new Map (), 'ownMethods': ownMethods, 'pos': 0, 'derefs': new Set<string> () };
    const rx = /(?<![\w.])(?:ccxt\.)?(IsGreaterThanOrEqual|IsLessThanOrEqual|IsGreaterThan|IsLessThan)\(/g;
    const calls = [ ...masked.matchAll (rx) ].map ((m) => ({ 'start': m.index as number, 'helper': m[1], 'open': (m.index as number) + m[0].length - 1 }));
    calls.sort ((x, y) => y.start - x.start);
    for (const call of calls) {
        const close = goArithClose (masked, call.open);
        const spans = (close < 0) ? [] : goArithArgs (masked, call.open, close);
        if (spans.length !== 2) {
            continue;
        }
        scope.pos = call.start;
        scope.text = text;
        const args = spans.map (([ s, e ]) => goArithStripParens (text.slice (s, e)));
        const margs = spans.map (([ s, e ]) => goArithStripParens (masked.slice (s, e)));
        const isPtr: boolean[] = [];
        const kinds: (Kind | undefined)[] = [];
        const ops: string[] = [];
        let boxed = false;
        for (let i = 0; i < 2; i++) {
            const x = args[i];
            const field = /^this\.(\w+)$/.exec (x);
            const declared = /^[A-Za-z_]\w*$/.test (x) ? goArithDeclaredType (scope.masked, scope.signature, x) : undefined;
            const box = (declared === 'any') ? hx4G32BoxKind (scope, x) : undefined;
            if (field && fields.has (field[1])) {
                isPtr.push (false); kinds.push (HX4G27_FIELDS[field[1]]); ops.push (x);
            } else if (box !== undefined) {
                boxed = true;
                isPtr.push (false); kinds.push (box); ops.push (x + '.(' + ((box === 'i64') ? 'int64' : 'int') + ')');
            } else if ((declared === '*int64') || (declared === '*float64')) {
                const nonNil = hx4G17PointerNonNil (scope, x, declared) || g10kArithPointerIsNonNil (scope, x) || hx4G26PointerNonNil (scope, x);
                boxed = boxed || nonNil;
                isPtr.push (!nonNil); kinds.push ((declared === '*int64') ? 'i64' : 'f64'); ops.push ('*' + x);
            } else {
                isPtr.push (false); kinds.push (hx4G18Kind (scope, x, margs[i])); ops.push (x);
            }
        }
        // only sites the G27 pass could not prove (a box local or a G26-guarded pointer)
        if (!boxed || kinds.some ((k) => k === undefined) || (isPtr[0] && !isPtr[1] && !hx4G18Skippable (margs[1])) || (isPtr[1] && !isPtr[0] && !hx4G18Skippable (margs[0]))) {
            continue;
        }
        let native = hx4G27Native (call.helper, ops[0], ops[1], kinds[0] as Kind, kinds[1] as Kind, isPtr[0], isPtr[1], args);
        if (native === undefined) {
            continue;
        }
        if (/\(\s*$/.test (masked.slice (0, call.start)) && /^\s*\)/.test (masked.slice (close + 1))) {
            native = native.slice (1, -1);
        }
        text = text.slice (0, call.start) + native + text.slice (close + 1);
        masked = masked.slice (0, call.start) + goArithMask (native) + masked.slice (close + 1);
        scope.masked = masked;
    }
    return text;
}

export function hx4G32Comparisons (content: string): string {
    if ((content.indexOf ('PLEASE DO NOT EDIT THIS FILE') < 0) || !/(?<![\w.])(?:ccxt\.)?Is(?:Greater|Less)Than/.test (content)) {
        return content;
    }
    const masked = goArithMask (content);
    const ownMethods = new Set<string> ();
    for (const name of GO_ARITH_INT64_METHODS) {
        if (new RegExp ('^func \\(this \\*\\w+\\) ' + name + '\\(', 'm').test (masked)) {
            ownMethods.add (name);
        }
    }
    if (/^func \(this \*\w+\) Sum\(/m.test (masked)) {
        ownMethods.add ('Sum');
    }
    const fields = new Set<string> (Object.keys (HX4G27_FIELDS).filter ((f) => !new RegExp ('^\\s+' + f + '\\s+[\\w*\\[]|\\) ' + f + '\\(', 'm').test (masked)));
    const lines = content.split ('\n');
    const out: string[] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (start < 0) {
            if (lines[k].startsWith ('func ') && !lines[k].endsWith ('}')) { start = k; } else { out.push (lines[k]); }
            continue;
        }
        if (lines[k] === '}') {
            const own = /^func \(this \*\w+\)/.test (lines[start]) ? fields : new Set<string> ();
            out.push (hx4G32RewriteFunc (lines.slice (start, k + 1).join ('\n'), ownMethods, own));
            start = -1;
        }
    }
    if (start >= 0) {
        out.push (...lines.slice (start));
    }
    return out.join ('\n');
}

export function hx4G32SelfTest (): string[] {
    const wrap = (body: string) => '// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) F(o any, n any) any {\n' + body + '\n}\n';
    const cases: [ string, string, boolean ][] = [
        [ '\tvar s int64 = 5\n\tvar e any = this.Sum(s, 10)\n\tvar now int64 = this.Seconds()\n\tif IsLessThan(e, now) {\n\t}\n\treturn nil', 'if (e.(int64) < now) {', true ],
        [ '\tvar a int64 = 5\n\tvar b int = 3\n\tvar x any = ccxt.Add(a, b)\n\tif ccxt.IsGreaterThan(x, a) {\n\t}\n\treturn nil', 'if (x.(int64) > a) {', true ],
        [ '\tvar b int = 3\n\tvar x any = Add(b, 1)\n\tif IsGreaterThan(x, b) {\n\t}\n\treturn nil', 'if (x.(int) > b) {', true ],
        [ '\tvar f *int64 = this.SafeInteger(o, "f")\n\tvar l *int64 = this.SafeInteger(o, "l", 20)\n\tvar r any = (*f - 3)\n\tif IsLessThan(r, l) {\n\t}\n\treturn nil', 'if (r.(int64) < *l) {', true ],
        [ '\tvar m *int64 = this.SafeInteger(o, "m")\n\tvar q *int64 = this.SafeInteger(o, "q")\n\tif (m == nil) || (q == nil) {\n\t\treturn nil\n\t}\n\tif ccxt.IsLessThan(m, *q-1) {\n\t}\n\treturn nil', 'if (*m < *q-1) {', true ],
        // mixed int / int64 writes, nil writes, pointer boxes and unknown writes keep the helper
        [ '\tvar c int64 = 5\n\tvar i any = 0\n\ti = this.Sum(i, c)\n\tif IsLessThan(i, c) {\n\t}\n\treturn nil', 'IsLessThan(i, c)', true ],
        [ '\tvar c int64 = 5\n\tvar i any = nil\n\ti = this.Sum(c, 1)\n\tif IsLessThan(i, c) {\n\t}\n\treturn nil', 'IsLessThan(i, c)', true ],
        [ '\tvar p *int64 = this.SafeInteger(o, "p", 1)\n\tvar c int64 = 5\n\tvar i any = func() any {\n\t\tif c > 1 {\n\t\t\treturn p\n\t\t}\n\t\treturn c\n\t}()\n\tif IsLessThan(i, c) {\n\t}\n\treturn nil', 'IsLessThan(i, c)', true ],
        [ '\tvar c int64 = 5\n\tvar i any = this.Sum(c, 1)\n\ti = GetValue(o, "x")\n\tif IsLessThan(i, c) {\n\t}\n\treturn nil', 'IsLessThan(i, c)', true ],
        [ '\tvar c int64 = 5\n\tvar i any = this.Sum(c, 1)\n\ti, o = this.F(o, n), nil\n\tif IsLessThan(i, c) {\n\t}\n\treturn nil', 'IsLessThan(i, c)', true ],
        [ '\tvar f float64 = 1.5\n\tvar c int64 = 5\n\tvar i any = Subtract(f, c)\n\tif IsGreaterThan(i, c) {\n\t}\n\treturn nil', 'IsGreaterThan(i, c)', true ],
    ];
    const problems: string[] = [];
    for (const [ body, want, present ] of cases) {
        const out = hx4G32Comparisons (wrap (body));
        if (out.includes (want) !== present) {
            problems.push ('hx4 G32: expected ' + want + ' in ' + out);
        }
    }
    // a file-local Sum may answer another box
    const own = hx4G32Comparisons ('// PLEASE DO NOT EDIT THIS FILE\nfunc (this *K) Sum(a ...any) any {\n\treturn nil\n}\n' + wrap ('\tvar s int64 = 5\n\tvar e any = this.Sum(s, 10)\n\tif IsLessThan(e, s) {\n\t}\n\treturn nil'));
    if (!own.includes ('IsLessThan(e, s)')) {
        problems.push ('hx4 G32: own Sum went native: ' + own);
    }
    return problems;
}
