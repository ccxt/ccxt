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
    if (/^[A-Za-z_]\w*$/.test (t) && (t !== 'nil') && (t !== 'true') && (t !== 'false')) {
        const type = goArithDeclaredType (scope.masked, scope.signature, t);
        if (((type === '*int64') || (type === '*float64')) && (g10kArithPointerIsNonNil (scope, t) || hx4G17PointerNonNil (scope, t, type))) {
            scope.derefs.add (t);
            return (type === '*int64') ? 'i64' : 'f64';
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
        return undefined;
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
        } else if ((call.helper === 'OpNeg') && (/(==|!=)\s*$/.test (before) || /^\s*(==|!=)/.test (masked.slice (after)))) {
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
