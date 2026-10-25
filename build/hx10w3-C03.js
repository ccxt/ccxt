// hx10w3 C03 — ws client state reads print natively.
//
// `WebSocketClient` (cs/ccxt/ws/Client.cs) declares its shared state with a concrete value type:
//   public IDictionary<string, Future> futures = new ConcurrentDictionary<string, Future>();
//   public IDictionary<string, object> subscriptions = new ConcurrentDictionary<string, object>();
// so a `client.futures[hash]` read has a static type and does not need the runtime helper. The
// printer keeps getValue there because the receiver is a member access on a local, not a field of
// `this` and not a bare dictionary identifier; this pass proves the receiver from its declaration
// in the same member and emits the native op.
//
// Runtime equivalence (cs/ccxt/base/Exchange.TranspileHelpers.cs): the futures/subscriptions
// receivers do not convert to IDictionary<string, object>, so GetValue(object, object) takes its
// `value2 is System.Collections.IDictionary` branch — null receiver or null key answers null,
// otherwise ContainsKey(key.ToString()) ? dict[strKey] : null. The emission runs the same tests in
// the same order, including the ToString conversion, so a non-string key answers like the helper.
// The value type is a reference type (Future / object), so the ternary needs no re-box.

const WS_CLIENT_TYPES = new Set ([ 'WebSocketClient', 'BaseExchange.WebSocketClient', 'ccxt.BaseExchange.WebSocketClient' ]);
// ws client members whose declared value type makes a null-safe read native
const WS_STATE_MEMBERS = new Map ([ [ 'futures', 'Future' ], [ 'subscriptions', 'object' ] ]);
const KEY_TYPES = new Set ([ 'string', 'string?', 'object' ]);

const MEMBER_START = /^[ ]{4,}(?:(?:public|private|protected|internal)[ ]+)?(?:static[ ]+|async[ ]+|virtual[ ]+|override[ ]+|sealed[ ]+|partial[ ]+)*[A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*[ ]+[A-Za-z_]\w*[ ]*\(/;
const NOT_A_TYPE = new Set ([ 'return', 'throw', 'if', 'else', 'while', 'for', 'foreach', 'using', 'lock', 'yield',
    'case', 'switch', 'do', 'try', 'catch', 'break', 'continue', 'goto', 'new', 'fixed', 'await', 'base', 'this',
    'var', 'in', 'out', 'ref', 'params', 'is', 'as', 'nameof', 'typeof' ]);
const GET_VALUE = /(?<![\w.])(?:getValue|GetValue)[ ]*\(/g;

// the line with string/char bodies and trailing comments blanked, offsets preserved
function mask (line) {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) return out + ' '.repeat (line.length - i);
        if ((ch === '"') || (ch === "'")) {
            const quote = ch;
            let j = i + 1;
            out += '"';
            while (j < line.length) {
                if (line[j] === '\\') { out += '  '; j += 2; continue; }
                if (line[j] === quote) break;
                out += ' ';
                j++;
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

// the trimmed [from, to) spans of the top-level arguments between `from` and `to`
function argumentsOf (text, from, to) {
    const spans = [];
    let depth = 0;
    let start = from;
    for (let i = from; i < to; i++) {
        const ch = text[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) { spans.push ({ from: start, to: i }); start = i + 1; }
    }
    spans.push ({ from: start, to });
    for (const span of spans) {
        while ((span.from < span.to) && (text[span.from] === ' ')) span.from++;
        while ((span.to > span.from) && (text[span.to - 1] === ' ')) span.to--;
    }
    return spans;
}

// the line of the member signature that holds `line`
function memberStart (masked, line) {
    for (let k = line; k >= 0; k--) {
        if (MEMBER_START.test (masked[k]) && !masked[k].trimEnd ().endsWith (';')) return k;
    }
    return -1;
}

// every C# type that binds `name` between the member signature and `line`; a single entry is the proof
function bindingTypes (masked, start, end, name) {
    const types = new Set ();
    const typed = new RegExp ('(?<![\\w.])([A-Za-z_][\\w<>?.\\[\\]]*)[ ]+' + name + '\\b(?=[ ]*(?:=[^=]|;|\\)|,|\\bin\\b))', 'g');
    for (let k = start; k <= end; k++) {
        for (const m of masked[k].matchAll (typed)) {
            if (NOT_A_TYPE.has (m[1])) continue;
            types.add (m[1].replace (/\s+/g, ''));
        }
    }
    return types;
}

// one name's proven type at `line`, or undefined
function provenType (masked, line, name) {
    const start = memberStart (masked, line);
    if (start < 0) return undefined;
    const types = bindingTypes (masked, start, line, name);
    if (types.size !== 1) return undefined;
    return [ ...types ][0];
}

// the native read of one getValue call, or undefined to keep the helper
function nativeRead (masked, line, receiver, member, keyText) {
    const element = WS_STATE_MEMBERS.get (member);
    if (element === undefined) return undefined;
    const type = /^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec (receiver);
    if (type === null) return undefined;
    if (type[2] !== member) return undefined;
    const receiverType = provenType (masked, line, type[1]);
    if (!WS_CLIENT_TYPES.has (receiverType ?? '')) return undefined;
    if (/^"(?:[^"\\]|\\.)*"$/.test (keyText)) {
        return { element, text: '(' + receiver + ' != null && ' + receiver + '.ContainsKey(' + keyText + ') ? ' + receiver + '[' + keyText + '] : null)' };
    }
    if (!/^[A-Za-z_]\w*$/.test (keyText)) return undefined;
    const keyType = provenType (masked, line, keyText);
    if (!KEY_TYPES.has (keyType ?? '')) return undefined;
    const key = (keyType === 'object') ? keyText + '.ToString()' : keyText;
    return { element, text: '(' + receiver + ' != null && ' + keyText + ' != null && ' + receiver + '.ContainsKey(' + key + ') ? ' + receiver + '[' + key + '] : null)' };
}

export function hx10w3C03WsStateReads (content) {
    if (!/(?:getValue|GetValue)[ ]*\(/.test (content) || /^namespace Tests;/m.test (content)) return content;
    const lines = content.split ('\n');
    const masked = lines.map (mask);
    let changed = false;
    for (let i = 0; i < masked.length; i++) {
        if (!/(?:getValue|GetValue)[ ]*\(/.test (masked[i])) continue;
        if (/^[ ]*(?:\/\/|\*|\/\*)/.test (masked[i])) continue;
        const edits = [];
        GET_VALUE.lastIndex = 0;
        let match;
        while ((match = GET_VALUE.exec (masked[i])) !== null) {
            const open = match.index + match[0].length - 1;
            const close = callEnd (masked[i], open);
            if (close === undefined) continue;
            if (edits.some ((e) => (match.index < e.end) && (close >= e.start))) continue;
            const spans = argumentsOf (masked[i], open + 1, close);
            if (spans.length !== 2) continue;
            const receiver = masked[i].substring (spans[0].from, spans[0].to);
            const read = nativeRead (masked, i, receiver, (/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec (receiver) ?? [])[2], lines[i].substring (spans[1].from, spans[1].to));
            if (read === undefined) continue;
            const end = close + 1;
            // an identity cast of the element type around the read goes with it
            const cast = '((' + read.element + ')';
            const head = lines[i].substring (0, match.index);
            if (head.endsWith (cast) && (lines[i][end] === ')')) {
                edits.push ({ start: match.index - cast.length, end: end + 1, text: read.text });
            } else {
                edits.push ({ start: match.index, end, text: read.text });
            }
        }
        if (edits.length === 0) continue;
        let out = lines[i];
        for (const edit of edits.sort ((a, b) => b.start - a.start)) out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
        lines[i] = out;
        masked[i] = mask (out);
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks for `csharpTranspiler.ts --self-test`
export function hx10w3C03SnippetChecks () {
    const problems = [];
    const wrap = (body) => 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual void f(WebSocketClient client, object messageHash, string hash, Int64 n)\n    {\n'
        + body + '\n    }\n}\n';
    const cases = [
        [ 'ws client futures + object key',
            '        Future future = ((Future)getValue(client.futures, messageHash));',
            'Future future = (client.futures != null && messageHash != null && client.futures.ContainsKey(messageHash.ToString()) ? client.futures[messageHash.ToString()] : null);' ],
        [ 'ws client futures + literal key',
            '        Future promise = ((Future)getValue(client.futures, "authenticated"));',
            'Future promise = (client.futures != null && client.futures.ContainsKey("authenticated") ? client.futures["authenticated"] : null);' ],
        [ 'ws client subscriptions + string key',
            '        object s = getValue(client.subscriptions, hash);',
            'object s = (client.subscriptions != null && hash != null && client.subscriptions.ContainsKey(hash) ? client.subscriptions[hash] : null);' ],
    ];
    const keeps = [
        [ 'object receiver', '        object c = this.safeValue(parameters, "client");\n        Future future = ((Future)getValue(c.futures, messageHash));' ],
        [ 'non-ws local of that name', '        Dictionary<string, object> client = new Dictionary<string, object>() {};\n        object s = getValue(client.futures, messageHash);' ],
        [ 'Int64 key', '        object s = getValue(client.subscriptions, n);' ],
        [ 'other ws member', '        object s = getValue(client.rejections, messageHash);' ],
        [ 'key expression', '        object s = getValue(client.subscriptions, (hash + "!"));' ],
    ];
    for (const [ name, body, expected ] of cases) {
        const out = hx10w3C03WsStateReads (wrap (body));
        if (!out.includes (expected)) problems.push ('hx10w3 C03 ' + name + ': ' + out.slice (-400));
        if (hx10w3C03WsStateReads (out) !== out) problems.push ('hx10w3 C03 ' + name + ': not idempotent');
    }
    for (const [ name, body ] of keeps) {
        const out = hx10w3C03WsStateReads (wrap (body));
        if (out !== wrap (body)) problems.push ('hx10w3 C03 keeps ' + name + ': ' + out.slice (-400));
    }
    const tests = wrap ('        object s = getValue(client.subscriptions, hash);').replace ('namespace ccxt;', 'namespace Tests;');
    if (hx10w3C03WsStateReads (tests) !== tests) problems.push ('hx10w3 C03 tests namespace changed');
    return problems;
}

// chain check: the wired final text carries the native read (no other pass proves a ws client receiver)
export function hx10w3C03ChainChecks (chain) {
    const problems = [];
    const source = 'namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual void f(WebSocketClient client, object messageHash)\n    {\n        Future future = ((Future)getValue(client.futures, messageHash));\n    }\n}\n';
    const out = chain (source);
    if (!out.includes ('Future future = (client.futures != null && messageHash != null && client.futures.ContainsKey(messageHash.ToString()) ? client.futures[messageHash.ToString()] : null);')) {
        problems.push ('hx10w3 C03 chain kept the helper: ' + out.slice (-300));
    }
    return problems;
}
