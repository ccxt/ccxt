// hx10w2 C01 — getValue on a string-keyed dictionary receiver prints the native indexer read.
//
// The printer's getValue arms and the C18/C25/C29 post-passes resolve a receiver through the
// method region they rebuild from signature lines, so a local declared inside a nested block of a
// long generated method drifts out of that region and keeps the runtime helper. This pass reads
// the emitted text with block scoping: a receiver resolves to the one declaration whose block is
// still open at the read, or to a parameter, and the key to a string literal or a string-typed
// name. Everything else keeps the helper call unchanged.
//
// Runtime equivalence (cs/ccxt/base/Exchange.TranspileHelpers.cs, GetValue(object, object)): a
// null receiver or null key answers null, a missing key answers null, a present key answers the
// box, a non-string key throws on the `(string)key` cast — the emitted ternary runs the same
// tests in the same order over the same dictionary.

const DICT_TYPES = new Set ([ 'IDictionary<string,object>', 'Dictionary<string,object>',
    'IReadOnlyDictionary<string,object>', 'SortedDictionary<string,object>' ]);
// hand-written base fields declared as a string-keyed object dictionary (cs/ccxt/base/Exchange.Options.cs)
const DICT_FIELDS = new Set ([ 'fees', 'ohlcvs', 'trades', 'tickers', 'balance', 'orderbooks',
    'fundingRates', 'bidsasks', 'options' ]);
// the key types the dictionary's string parameter accepts without a cast
const KEY_TYPES = new Set ([ 'string', 'string?', 'object' ]);

const DICT_TYPE_SOURCE = '(?:I?Dictionary<string,[ ]*object>|IReadOnlyDictionary<string,[ ]*object>|SortedDictionary<string,[ ]*object>)';
// `Type name = ...;` / `Type name;` at any indent, the type allowed a space before its closing `>`
const DECLARED_LOCAL = /^[ ]*([A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*(?:=[^=]|;)/;
// statement keywords a declaration-shaped line may start with
const NOT_A_TYPE = new Set ([ 'return', 'throw', 'if', 'else', 'while', 'for', 'foreach', 'using', 'lock',
    'yield', 'case', 'switch', 'do', 'try', 'catch', 'break', 'continue', 'goto', 'new', 'fixed',
    'checked', 'unchecked', 'await', 'base', 'this', 'var', 'in', 'out', 'ref', 'params' ]);
const PARAM_DECL = new RegExp ('(' + DICT_TYPE_SOURCE + '|object|string|Int64|long|double|bool)\\??[ ]+([A-Za-z_]\\w*)[ ]*(?:(?:=|,|\\))|$)', 'g');
const MEMBER_LINE = /^[ ]{4}(?:public|private|protected|internal)\b/;
const MEMBER_SIG = /^[ ]{4,}(?:(?:public|private|protected|internal|static|async|virtual|override|sealed|new|partial|abstract)\s+)*[A-Za-z_][\w<>,.\[\]?]*(\s+[A-Za-z_][\w<>,.\[\]?]*)*\s+([A-Za-z_]\w*)\s*\(/;
const CALL = /(?<![A-Za-z_.])(?:getValue|GetValue)\s*\(/g;

// the line with string/char literals and trailing comments blanked out, offsets preserved
function maskLine (line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) {
            out += ' '.repeat (line.length - i);
            break;
        }
        if ((ch === '"') || (ch === "'")) {
            const quote = ch;
            let j = i + 1;
            out += '"';
            while (j < line.length) {
                if (line[j] === '\\') { out += '  '; j += 2; continue; }
                if (line[j] === quote) break;
                out += ' '; j++;
            }
            if (j < line.length) { out += '"'; j++; }
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

function normalizedType (type) {
    return type.replace (/\s+/g, '').replace (/\?$/, '');
}

// the index of the ')' closing the call whose '(' sits at `open`
function callEnd (text, open) {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const ch = text[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return undefined;
}

// the trimmed [from, to) span of every top-level argument between `from` and `to`
function argumentSpans (text, from, to) {
    const spans = [];
    let depth = 0;
    let start = from;
    for (let i = from; i < to; i++) {
        const ch = text[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) {
            spans.push ({ from: start, to: i });
            start = i + 1;
        }
    }
    spans.push ({ from: start, to });
    for (const span of spans) {
        while ((span.from < span.to) && (text[span.from] === ' ')) span.from++;
        while ((span.to > span.from) && (text[span.to - 1] === ' ')) span.to--;
    }
    return spans;
}

// whether the block opened at `declaredAt` still contains `at` (a '}' at depth 0 closes it)
function blockOpen (masked, declaredAt, at) {
    let depth = 0;
    for (let i = declaredAt + 1; i < at; i++) {
        for (const ch of masked[i]) {
            if (ch === '{') depth++;
            if (ch === '}') {
                depth--;
                if (depth < 0) return false;
            }
        }
    }
    return true;
}

// the parameter types a signature line (and its continuation lines) declares
function signatureParams (masked, start, end) {
    let text = masked[start];
    let i = start;
    while ((text.split ('(').length > text.split (')').length) && (i + 1 < end)) {
        i++;
        text += ' ' + masked[i];
    }
    const params = new Map ();
    const open = text.indexOf ('(');
    const close = text.lastIndexOf (')');
    if (close <= open) return params;
    for (const m of text.substring (open + 1, close).matchAll (new RegExp (PARAM_DECL.source, 'g'))) {
        params.set (m[2], normalizedType (m[1]));
    }
    return params;
}

// the one open binding of `name` at `line` in `scope`, or undefined when unproven / ambiguous
function openType (scope, name, line, masked) {
    const declarations = (scope.declarations.get (name) ?? []).filter ((d) => (d.line < line) && blockOpen (masked, d.line, line));
    if (declarations.length === 1) return declarations[0].type;
    if (declarations.length === 0) return scope.params.get (name);
    return undefined;
}

// every proven dictionary read of one generated C# file printed natively
export function c01NativeDictReads (content) {
    if (!/\bgetValue\s*\(/.test (content) || /^namespace Tests;/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (maskLine);
    const starts = [];
    for (let i = 0; i < masked.length; i++) {
        if (MEMBER_LINE.test (masked[i]) && MEMBER_SIG.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) starts.push (i);
    }
    const scopes = new Map ();
    for (let n = 0; n < starts.length; n++) {
        const start = starts[n];
        const end = (n + 1 < starts.length) ? starts[n + 1] : masked.length;
        const scope = { params: signatureParams (masked, start, end), declarations: new Map () };
        for (let i = start; i < end; i++) {
            const m = DECLARED_LOCAL.exec (masked[i]);
            if (m === null) continue;
            const type = m[1].trim ();
            if (NOT_A_TYPE.has (type.split (' ')[0])) continue;
            const name = m[2];
            const list = scope.declarations.get (name) ?? [];
            list.push ({ line: i, type: normalizedType (type) });
            scope.declarations.set (name, list);
        }
        for (let i = start; i < end; i++) scopes.set (i, scope);
    }
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (masked[i].indexOf ('getValue(') < 0) continue;
        const scope = scopes.get (i);
        if (scope === undefined) continue;
        const edits = [];
        const pattern = new RegExp (CALL.source, 'g');
        let match;
        while ((match = pattern.exec (masked[i])) !== null) {
            const open = match.index + match[0].length - 1;
            const close = callEnd (masked[i], open);
            if (close === undefined) continue;
            const spans = argumentSpans (masked[i], open + 1, close);
            if (spans.length !== 2) continue;
            const receiver = masked[i].substring (spans[0].from, spans[0].to);
            const keyText = lines[i].substring (spans[1].from, spans[1].to);
            const field = /^this\.([A-Za-z_]\w*)$/.exec (receiver);
            if (field !== null) {
                if (!DICT_FIELDS.has (field[1])) continue;
            } else if (/^[A-Za-z_]\w*$/.test (receiver)) {
                if (!DICT_TYPES.has (openType (scope, receiver, i, masked) ?? '')) continue;
            } else {
                continue;
            }
            let condition;
            let index;
            if (/^"[^"]*"$/.test (keyText)) {
                condition = receiver + '.ContainsKey(' + keyText + ')';
                index = receiver + '[' + keyText + ']';
            } else if (/^[A-Za-z_]\w*$/.test (keyText)) {
                const keyType = openType (scope, keyText, i, masked);
                if (!KEY_TYPES.has (keyType ?? '')) continue;
                const spelling = (keyType === 'object') ? '(string)' + keyText : keyText;
                condition = keyText + ' != null && ' + receiver + '.ContainsKey(' + spelling + ')';
                index = receiver + '[' + spelling + ']';
            } else {
                continue;
            }
            edits.push ({ from: match.index, to: close + 1, text: '(' + receiver + ' != null && ' + condition + ' ? ' + index + ' : null)' });
        }
        if (edits.length === 0) continue;
        let out = lines[i];
        for (const edit of edits.sort ((a, b) => b.from - a.from)) {
            out = out.substring (0, edit.from) + edit.text + out.substring (edit.to);
        }
        lines[i] = out;
        masked[i] = maskLine (out);
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// wiring check: the final-text chain must print the typed base field's read natively (no other
// pass proves `this.fees`, so this fails at the base generator)
export function c01ChainChecks (chain) {
    const problems = [];
    const source = 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object key)\n    {\n        object a = getValue(this.fees, "trading");\n    }\n}\n';
    const out = chain (source);
    if (!out.includes ('object a = (this.fees != null && this.fees.ContainsKey("trading") ? this.fees["trading"] : null);')) {
        problems.push ('hx10w2 C01 chain kept the helper: ' + out.slice (-300));
    }
    return problems;
}

// snippet checks for `csharpTranspiler.ts --self-test`
export function c01SnippetChecks () {
    const problems = [];
    const wrap = (body) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object symbol, object key, Int64 n, string name)\n    {\n' + body + '\n    }\n}\n';
    const cases = [
        [ 'dict local nested block + literal key',
            '        for (int i = 0; i < 2; i++)\n        {\n            Dictionary<string, object> balances = new Dictionary<string, object>() {};\n            object a = getValue(balances, "free");\n        }',
            'object a = (balances != null && balances.ContainsKey("free") ? balances["free"] : null);' ],
        [ 'dict param + string key',
            '        IDictionary<string, object> row = this.safeDict(parameters, "row");\n        object a = getValue(row, name);',
            'object a = (row != null && name != null && row.ContainsKey(name) ? row[name] : null);' ],
        [ 'dict local + object key casts like the helper',
            '        Dictionary<string, object> row = this.safeDict(parameters, "row");\n        object a = getValue(row, key);',
            'object a = (row != null && key != null && row.ContainsKey((string)key) ? row[(string)key] : null);' ],
        [ 'typed base field',
            '        object a = getValue(this.fees, "trading");',
            'object a = (this.fees != null && this.fees.ContainsKey("trading") ? this.fees["trading"] : null);' ],
    ];
    const keeps = [
        [ 'object receiver', '        object row = this.safeValue(parameters, "row");\n        object a = getValue(row, "free");' ],
        [ 'non-dict parameter', '        object a = getValue(symbol, "free");' ],
        [ 'Int64 key', '        Dictionary<string, object> row = this.safeDict(parameters, "row");\n        object a = getValue(row, n);' ],
        [ 'unknown field', '        object a = getValue(this.currencies, "BTC");' ],
        [ 'key expression', '        Dictionary<string, object> row = this.safeDict(parameters, "row");\n        object a = getValue(row, (n - 1));' ],
    ];
    for (const [ name, body, expected ] of cases) {
        const out = c01NativeDictReads (wrap (body));
        if (!out.includes (expected)) problems.push ('hx10w2 C01 ' + name + ': ' + out.slice (-400));
        if (c01NativeDictReads (out) !== out) problems.push ('hx10w2 C01 ' + name + ': not idempotent');
    }
    for (const [ name, body ] of keeps) {
        const out = c01NativeDictReads (wrap (body));
        if (out !== wrap (body)) problems.push ('hx10w2 C01 keeps ' + name + ': ' + out.slice (-400));
    }
    const tests = wrap ('        object a = getValue(this.fees, "trading");').replace ('namespace ccxt;', 'namespace Tests;');
    if (c01NativeDictReads (tests) !== tests) problems.push ('hx10w2 C01 tests namespace changed');
    return problems;
}
