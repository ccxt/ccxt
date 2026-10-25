// hx10w3 C01 (cs) — array-annotated method parameters print `IList<object>` and read native.
//
// A generated C# parameter whose TS declaration annotates an array (`Market[]`, `OHLCV[]`,
// `string[]`, `any[]`, `Strings`, ...) used to print `object`, so every read of it kept the
// runtime helper (`getArrayLength`, `getValue`). A position is admitted only when the census
// proves all three sides, so the printed type can never disagree with a caller or an override:
//
//   1. annotation: EVERY TS declaration of that method name at that position is an array type
//      (base class, prediction base, venue overrides, ws overrides),
//   2. body: the parameter is only read as a list inside its own body (no write that is not a
//      list producer, no dictionary/element use),
//   3. call sites: every argument in the generated tree (exchanges, ws, prediction, base,
//      tests, cli) is a `List<object>`/`IList<object>` value, `new List<...>`, `null`, or
//      omitted -- so no call-site cast and no `object` argument is introduced.
//
// Reads print the branch the helper takes for the values the annotated type allows
// (cs/ccxt/base/Exchange.TranspileHelpers.cs): a null receiver answers 0 / null, an in-range
// index answers the same box, an out-of-range index answers null, and a negative index throws
// exactly like the helper's own `IList<object>` indexer.

// method name -> admitted parameter positions (wave-3 census over ts/src + the generated tree)
const C01_LIST_PARAMS = {
    'applyEventFetchParams': [ 2 ],
    'arraysConcat': [ 0 ],
    'batchOrdersRequest': [ 0 ],
    'checkRequiredArgument': [ 3 ],
    'compactSignable': [ 0 ],
    'convertOHLCVToTradingView': [ 0 ],
    'expandGroupRows': [ 0 ],
    'FetchOutcomes': [ 0 ],
    'filterByLimit': [ 0 ],
    'filterEventsByTags': [ 1 ],
    'findNearestCeiling': [ 0 ],
    'handleDeltasWithKeys': [ 1 ],
    'marketsForSymbols': [ 0 ],
    'parseEvents': [ 0 ],
    'parseOpenOrders': [ 0 ],
    'parseOptionChain': [ 0 ],
    'parseUtaBalance': [ 0 ],
    'rlpEncodeList': [ 0 ],
    'sbeReadFlags': [ 2 ],
};

// the method name of a generated member signature: the identifier right before its `(`
const C01_SIGNATURE = /^ {4}(?:public|private|protected|internal)\b([^(;]*)\b([A-Za-z_]\w*)[ ]*\(/;
// an integer declaration (`int i = 0;`, `for (int i = 0; ...)`, `Int64 n = 2;`)
const C01_INT_DECL = /\b(?:int|Int64|long)\s+([A-Za-z_]\w*)\s*(?:=|;|,|\))/g;
// a compound write can change an integer local's declared kind at any statement
const C01_INT_WRITE = /\b([A-Za-z_]\w*)\s*(?:\+=|-=|\*=|&=|\|=)/g;

// same-length copy with string/char literals and comments blanked, newlines kept
function c01Mask (content) {
    const out = content.split ('');
    const blank = (at) => { out[at] = (content[at] === '\n') ? '\n' : ' '; };
    let i = 0;
    while (i < content.length) {
        const ch = content[i];
        if ((ch === '/') && (content[i + 1] === '*')) {
            blank (i);
            blank (i + 1);
            i += 2;
            while ((i < content.length) && !((content[i] === '*') && (content[i + 1] === '/'))) {
                blank (i);
                i++;
            }
            if (i < content.length) {
                blank (i);
                blank (i + 1);
                i += 2;
            }
            continue;
        }
        if ((ch === '/') && (content[i + 1] === '/')) {
            while ((i < content.length) && (content[i] !== '\n')) {
                blank (i);
                i++;
            }
            continue;
        }
        const verbatim = (ch === '@') && (content[i + 1] === '\"');
        if (verbatim || (ch === '\"') || (ch === '\'')) {
            const quote = verbatim ? '\"' : ch;
            blank (i);
            i += verbatim ? 2 : 1;
            while (i < content.length) {
                if (!verbatim && (content[i] === '\\') && (i + 1 < content.length)) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                    continue;
                }
                if (verbatim && (content[i] === '\"') && (content[i + 1] === '\"')) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                    continue;
                }
                if (content[i] === quote) {
                    blank (i);
                    i++;
                    break;
                }
                // a plain string/char literal never crosses a line: an unmatched quote is code
                if (!verbatim && (content[i] === '\n')) break;
                blank (i);
                i++;
            }
            continue;
        }
        i++;
    }
    return out.join ('');
}

// the top-level parameter spans of the text between a signature's `(` and `)`
function c01ParamSpans (text) {
    const spans = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if ((ch === '(') || (ch === '[') || (ch === '{') || (ch === '<')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}') || (ch === '>')) depth--;
        if ((ch === ',') && (depth === 0)) {
            spans.push ({ from: start, to: i });
            start = i + 1;
        }
    }
    spans.push ({ from: start, to: text.length });
    return spans;
}

function c01Close (line, open) {
    let depth = 0;
    for (let i = open; i < line.length; i++) {
        const ch = line[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// `[from, to)` of every top-level call argument inside the call opening at `open`
function c01Args (masked, open, close) {
    const spans = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open + 1; i < close; i++) {
        const ch = masked[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) {
            spans.push ({ from: start, to: i });
            start = i + 1;
        }
    }
    spans.push ({ from: start, to: close });
    return spans;
}

// the emitted index text when the argument is provably an integer read, else undefined
function c01IndexText (text, intNames) {
    const arg = text.trim ();
    if (/^\d{1,9}$/.test (arg)) return arg;
    if (/^[A-Za-z_]\w*$/.test (arg)) return intNames.has (arg) ? arg : undefined;
    const simple = /^\(\s*([A-Za-z_]\w*|\d{1,9})\s*([-+])\s*([A-Za-z_]\w*|\d{1,9})\s*\)$/.exec (arg);
    if (simple !== null) {
        const left = /^\d/.test (simple[1]) || intNames.has (simple[1]);
        const right = /^\d/.test (simple[3]) || intNames.has (simple[3]);
        return (left && right) ? '(' + simple[1] + ' ' + simple[2] + ' ' + simple[3] + ')' : undefined;
    }
    const sum = /^(?:this\.)?(?:sum|add|subtract)\s*\(\s*([A-Za-z_]\w*|\d{1,9})\s*,\s*([A-Za-z_]\w*|\d{1,9})\s*\)$/.exec (arg);
    if (sum !== null) {
        const left = /^\d/.test (sum[1]) || intNames.has (sum[1]);
        const right = /^\d/.test (sum[2]) || intNames.has (sum[2]);
        if (!left || !right) return undefined;
        const op = arg.indexOf ('subtract') >= 0 ? ' - ' : ' + ';
        return '(' + sum[1] + op + sum[2] + ')';
    }
    return undefined;
}

// every admitted array-annotated parameter prints `IList<object>` and its reads go native
export function hx10w3C01ArrayParams (content) {
    if (content.indexOf ('object ') < 0) return content;
    // generated test helpers are not part of the transpiled exchange tree
    if (/^namespace Tests;/m.test (content)) return content;
    const lines = content.split ('\n');
    const masked = c01Mask (content).split ('\n');
    if (masked.length !== lines.length) return content;
    const starts = [];
    for (let i = 0; i < masked.length; i++) {
        if ((masked[i].match (C01_SIGNATURE) === null) || (masked[i].indexOf ('(') < 0)) continue;
        if (masked[i].trimEnd ().endsWith (';')) continue;
        starts.push (i);
    }
    let changed = false;
    for (let n = 0; n < starts.length; n++) {
        const start = starts[n];
        const end = (n + 1 < starts.length) ? starts[n + 1] : masked.length;
        const name = masked[start].match (C01_SIGNATURE)[2];
        const positions = C01_LIST_PARAMS[name];
        if (positions === undefined) continue;
        const open = masked[start].indexOf ('(');
        const close = c01Close (lines[start], open);
        if (close < 0) continue;
        const params = lines[start].substring (open + 1, close);
        const spans = c01ParamSpans (params);
        const listParams = new Set ();
        let signature = params;
        let touched = false;
        for (const position of positions.slice ().sort ((a, b) => b - a)) {
            const span = spans[position];
            if (span === undefined) continue;
            const text = params.substring (span.from, span.to);
            const head = /^(\s*)object(\s+)([A-Za-z_]\w*)([\s\S]*)$/.exec (text);
            if (head === null) continue;
            listParams.add (head[3]);
            signature = signature.substring (0, span.from) + head[1] + 'IList<object>' + head[2] + head[3] + head[4] + signature.substring (span.to);
            touched = true;
        }
        if (touched) {
            lines[start] = lines[start].substring (0, open + 1) + signature + lines[start].substring (close);
            masked[start] = c01Mask (lines[start]);
            changed = true;
        }
        if (listParams.size === 0) continue;
        // the integer reads this method declares (`for (int i = 0; ...)`, `int n = 2;`)
        const intNames = new Set ();
        const written = new Set ();
        for (let k = start + 1; k < end; k++) {
            for (const m of masked[k].matchAll (C01_INT_DECL)) intNames.add (m[1]);
            for (const m of masked[k].matchAll (C01_INT_WRITE)) written.add (m[1]);
        }
        for (const gone of written) intNames.delete (gone);
        for (let k = start + 1; k < end; k++) {
            const line = masked[k];
            if ((line.indexOf ('getValue(') < 0) && (line.indexOf ('getArrayLength(') < 0)) continue;
            const edits = [];
            const pattern = /\b(getValue|getArrayLength)\s*\(/g;
            let match;
            while ((match = pattern.exec (line)) !== null) {
                const helper = match[1];
                if ((match.index > 0) && /[\w.]/.test (line[match.index - 1])) continue;
                const callOpen = match.index + match[0].length - 1;
                const callClose = c01Close (line, callOpen);
                if (callClose < 0) continue;
                const args = c01Args (line, callOpen, callClose);
                if (args.length !== ((helper === 'getValue') ? 2 : 1)) continue;
                const receiver = line.substring (args[0].from, args[0].to).trim ();
                if (!listParams.has (receiver)) continue;
                let replacement;
                if (helper === 'getArrayLength') {
                    replacement = '(' + receiver + '?.Count ?? 0)';
                } else {
                    const index = c01IndexText (line.substring (args[1].from, args[1].to), intNames);
                    if (index === undefined) continue;
                    replacement = '(' + receiver + ' != null && ' + index + ' < ' + receiver + '.Count ? ' + receiver + '[' + index + '] : null)';
                }
                edits.push ({ from: match.index, to: callClose + 1, text: replacement });
            }
            if (edits.length === 0) continue;
            let out = lines[k];
            for (const edit of edits.sort ((a, b) => b.from - a.from)) {
                out = out.substring (0, edit.from) + edit.text + out.substring (edit.to);
            }
            lines[k] = out;
            masked[k] = c01Mask (out);
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

// the emitted file after the whole chain prints the admitted parameter typed and the reads native
export function hx10w3C01ChainChecks (chain) {
    const problems = [];
    const source = 'namespace ccxt;\npublic partial class BaseExchange\n{\n    public virtual IList<object> marketsForSymbols(object symbols = null)\n    {\n        if ((symbols == null))\n        {\n            return this.toArray(symbols);\n        }\n        List<object> result = new List<object>() {};\n        for (int i = 0; i < getArrayLength(symbols); i++)\n        {\n            string? id = this.marketId(getValue(symbols, i));\n            if ((id != null))\n            {\n                result.Add(id);\n            }\n        }\n        return result;\n    }\n}\n';
    const out = chain (source);
    const expected = [
        'public virtual IList<object> marketsForSymbols(IList<object> symbols = null)',
        'for (int i = 0; i < (symbols?.Count ?? 0); i++)',
        'this.marketId((symbols != null && i < symbols.Count ? symbols[i] : null))',
    ];
    for (const want of expected) {
        if (!out.includes (want)) problems.push ('hx10w3 C01 chain missing ' + JSON.stringify (want) + ': ' + out.slice (-400));
    }
    if (out.includes ('getArrayLength(symbols)') || out.includes ('getValue(symbols')) {
        problems.push ('hx10w3 C01 chain kept the helper: ' + out.slice (-400));
    }
    return problems;
}

// snippet checks for `csharpTranspiler.ts --self-test`
export function hx10w3C01SnippetChecks () {
    const problems = [];
    const wrap = (signature, body) => 'namespace ccxt;\npublic partial class t : BaseExchange\n{\n    ' + signature + '\n    {\n' + body + '\n    }\n}\n';
    const cases = [
        [ 'single-line object parameter',
            wrap ('public virtual object marketsForSymbols(object symbols = null)', '        for (int i = 0; i < getArrayLength(symbols); i++)\n        {\n            object id = getValue(symbols, i);\n        }'),
            [ 'public virtual object marketsForSymbols(IList<object> symbols = null)',
                'for (int i = 0; i < (symbols?.Count ?? 0); i++)',
                'object id = (symbols != null && i < symbols.Count ? symbols[i] : null);' ] ],
        [ 'last position of a signature',
            wrap ('public virtual object filterEventsByTags(object events, object tags = null)', '        return getArrayLength(tags);'),
            [ 'public virtual object filterEventsByTags(object events, IList<object> tags = null)', 'return (tags?.Count ?? 0);' ] ],
        [ 'dictionary parameters left alone',
            wrap ('public virtual object parseOpenOrders(object orders, IDictionary<string, object> market, object result)', '        return getArrayLength(orders);'),
            [ 'public virtual object parseOpenOrders(IList<object> orders, IDictionary<string, object> market, object result)', 'return (orders?.Count ?? 0);' ] ],
        [ 'literal index',
            wrap ('public virtual object compactSignable(object row)', '        return getValue(row, 0);'),
            [ 'public virtual object compactSignable(IList<object> row)', 'return (row != null && 0 < row.Count ? row[0] : null);' ] ],
        [ 'arithmetic index on an integer local',
            wrap ('public virtual object findNearestCeiling(object arr, object providedValue)', '        int length = getArrayLength(arr);\n        return getValue(arr, (length - 1));'),
            [ 'return (arr != null && (length - 1) < arr.Count ? arr[(length - 1)] : null);' ] ],
    ];
    for (const [ name, input, expected ] of cases) {
        const out = hx10w3C01ArrayParams (input);
        for (const want of expected) {
            if (!out.includes (want)) problems.push ('hx10w3 C01 ' + name + ': missing ' + JSON.stringify (want) + ' in ' + out.slice (-340));
        }
        if (hx10w3C01ArrayParams (out) !== out) problems.push ('hx10w3 C01 ' + name + ': not idempotent');
    }
    const keeps = [
        [ 'sign api is a string at runtime', wrap ('public override Dictionary<string, object> sign(string path, object api = null, string method = null, object parameters = null)', '        return getArrayLength(api);') ],
        [ 'position not admitted', wrap ('public virtual void handleTrade(object bookSide, object deltas, object priceKey = null)', '        return getArrayLength(bookSide);') ],
        [ 'unknown method', wrap ('public virtual object compactSignable2(object row)', '        return getValue(row, 0);') ],
        [ 'dictionary parameter', wrap ('public virtual object parseEvents(IDictionary<string, object> rawEvents)', '        return getArrayLength(rawEvents);') ],
    ];
    for (const [ name, input ] of keeps) {
        const out = hx10w3C01ArrayParams (input);
        if (out !== input) problems.push ('hx10w3 C01 keeps ' + name + ': ' + out.slice (-340));
    }
    const helperReads = [
        [ 'unproven index', wrap ('public virtual object compactSignable(object row, object at)', '        return getValue(row, at);'), 'return getValue(row, at);' ],
        [ 'string key read', wrap ('public virtual object compactSignable(object row)', '        return getValue(row, \"a\");'), 'return getValue(row, \"a\");' ],
    ];
    for (const [ name, input, expected ] of helperReads) {
        const out = hx10w3C01ArrayParams (input);
        if (!out.includes ('IList<object> row') || !out.includes (expected)) problems.push ('hx10w3 C01 keeps read ' + name + ': ' + out.slice (-340));
    }
    const tests = hx10w3C01ArrayParams (wrap ('public virtual object getExchangeCode(BaseExchange exchange, object codes = null)', '        return getArrayLength(codes);').replace ('namespace ccxt;', 'namespace Tests;'));
    if (tests.indexOf ('object codes = null') < 0) problems.push ('hx10w3 C01 tests namespace changed');
    return problems;
}
