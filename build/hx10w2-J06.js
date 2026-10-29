// hx10w2 J06 — native map ops on the java runtime's single-owner base fields.
//
// BaseExchange declares the per-symbol ws caches as plain `Map<String, Object>` backed by HashMap
// (one writer: the client reader thread; readers run after the future settles) and WsClient
// declares futures/subscriptions/rejections as `Map<String, Object>`. Once the receiver prints
// that type the helper and the plain op agree on every value the type allows, so emit the op:
//   * put — a plain HashMap stores the `null` entry the helper stores (only a ConcurrentHashMap
//     needs the helper's null -> remove translation) and the field is never null, so
//     `this.f.put(k, v);` is exactly `Helpers.addElementToObject(this.f, k, v);`.
//   * get — `GetValue` answers null for a null receiver / null key / absent key; the guard
//     reproduces that and `Map.get` is the read the helper performs.
// Everything else keeps the helper verbatim: non-String keys, expression-position puts, the fields
// that stay `Object` (volatile `markets`, the ArrayCache hosts) and the ConcurrentHashMap `options`.
const PLAIN_FIELDS = new Set ([ 'tickers', 'orderbooks', 'trades', 'bidsasks', 'ohlcvs', 'fundingRates' ]);
const CLIENT_FIELDS = new Set ([ 'subscriptions', 'futures', 'rejections' ]);
// typed in the hand-written header, but nullable / volatile: no rewrite (same policy as markets_by_id)
export const J06_NULLABLE_FIELDS = [ 'markets' ];

const TYPE_TOKEN = '[A-Za-z_][\\w.]*(?:<[\\w.<>, ?]+>)?(?:\\[\\])*';
const STRING_LITERAL = /^"(?:[^"\\]|\\.)*"$/;

// same-length copy with string / char / comment bodies blanked, so structure scans never read them
function maskOpaque (text) {
    const out = text.split ('');
    const blank = (from, to) => {
        for (let k = from; k < to; k++) {
            if (out[k] !== '\n') out[k] = ' ';
        }
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
            let j = i + 1;
            while (j < text.length) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === c) break;
                j++;
            }
            blank (i + 1, Math.min (j, text.length));
            i = j;
        } else if (c === '/' && text[i + 1] === '/') {
            let j = text.indexOf ('\n', i);
            if (j === -1) j = text.length;
            blank (i, j);
            i = j - 1;
        } else if (c === '/' && text[i + 1] === '*') {
            let j = text.indexOf ('*/', i + 2);
            j = j === -1 ? text.length : j + 2;
            blank (i, j);
            i = j - 1;
        }
    }
    return out.join ('');
}

function closeParen (masked, open) {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function splitArgs (masked, open, close) {
    const args = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { args.push ([ start, i ]); start = i + 1; }
    }
    args.push ([ start, close ]);
    return args;
}

function trimmedRange (text, from, to) {
    let a = from;
    let b = to;
    while (a < b && /\s/.test (text[a])) a++;
    while (b > a && /\s/.test (text[b - 1])) b--;
    return { start: a, end: b, value: text.slice (a, b) };
}

function isStatementStart (masked, idx) {
    let j = idx - 1;
    while (j >= 0 && /\s/.test (masked[j])) j--;
    return j < 0 || masked[j] === ';' || masked[j] === '{' || masked[j] === '}';
}

// the type of `name` at `lineIndex` in the enclosing member: the nearest preceding local / param
// declaration, never a use — `undefined` when the member start is reached first
function declaredTypeInMember (lines, lineIndex, name) {
    const local = new RegExp ('^\\s*(?:final\\s+)?(' + TYPE_TOKEN + ')\\s+' + name + '\\s*(?:=|;)');
    const param = new RegExp ('[(,]\\s*(?:final\\s+)?(' + TYPE_TOKEN + ')\\s+' + name + '\\s*[,)]');
    for (let i = lineIndex - 1; i >= 0; i--) {
        const line = lines[i];
        const memberStart = /^ {4}(?:public|private|protected)\b/.test (line);
        const p = memberStart ? param.exec (line) : null;
        if (p !== null) return p[1].trim ();
        const l = local.exec (line);
        if (l !== null) return l[1].trim ();
        if (memberStart) return undefined;
    }
    return undefined;
}

function lineOffsets (text) {
    const offsets = [ 0 ];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') offsets.push (i + 1);
    }
    return offsets;
}

// a key that Java proves String: a literal, a String-declared name, or an existing String cast
function keyPrintsString (keyText, lines, lineIndex) {
    if (STRING_LITERAL.test (keyText)) return true;
    if (/^\(\(String\)[^()]+\)$/.test (keyText) || /^\(String\)\s*[A-Za-z_][\w.]*$/.test (keyText)) return true;
    if (!/^[A-Za-z_]\w*$/.test (keyText)) return false;
    return declaredTypeInMember (lines, lineIndex, keyText) === 'String';
}

export function nativeJavaJ06FieldOps (content) {
    if (typeof content !== 'string' || !content.includes ('Helpers.')) {
        return content;
    }
    if (!content.includes ('Helpers.addElementToObject(this.') && !content.includes ('Helpers.GetValue(')) {
        return content;
    }
    const masked = maskOpaque (content);
    const lines = content.split ('\n');
    const offsets = lineOffsets (content);
    const lineAt = (index) => {
        let lo = 0;
        let hi = offsets.length - 1;
        while (lo < hi) {
            const mid = (lo + hi + 1) >> 1;
            if (offsets[mid] <= index) lo = mid; else hi = mid - 1;
        }
        return lo;
    };
    const edits = [];
    for (const [ needle, kind ] of [ [ 'Helpers.addElementToObject(', 'put' ], [ 'Helpers.GetValue(', 'get' ] ]) {
        let from = 0;
        while (true) {
            const at = masked.indexOf (needle, from);
            if (at === -1) break;
            from = at + needle.length;
            if (at > 0 && /[\w.]/.test (masked[at - 1])) continue;
            const open = at + needle.length - 1;
            const close = closeParen (masked, open);
            if (close === -1) continue;
            const args = splitArgs (masked, open, close);
            const receiver = trimmedRange (content, args[0][0], args[0][1]).value;
            const field = /^this\.([A-Za-z_]\w*)$/.exec (receiver) ?? /^client\.([A-Za-z_]\w*)$/.exec (receiver);
            if (field === null) continue;
            const isClient = receiver.startsWith ('client.');
            const name = field[1];
            if (!(isClient ? CLIENT_FIELDS : PLAIN_FIELDS).has (name)) continue;
            if (kind === 'put') {
                // a WsClient map stays concurrent: a null value must keep the helper's remove translation
                if (isClient || args.length !== 3 || !isStatementStart (masked, at)) continue;
            } else if (args.length !== 2) {
                continue;
            }
            const key = trimmedRange (content, args[1][0], args[1][1]);
            if (!keyPrintsString (key.value, lines, lineAt (key.start))) continue;
            if (kind === 'put') {
                const value = trimmedRange (content, args[2][0], args[2][1]);
                edits.push ([ at, close + 1, `${receiver}.put(${key.value}, ${value.value})` ]);
            } else {
                const guard = STRING_LITERAL.test (key.value)
                    ? `${receiver} == null`
                    : `${receiver} == null || ${key.value} == null`;
                edits.push ([ at, close + 1, `(${guard} ? null : ${receiver}.get(${key.value}))` ]);
            }
        }
    }
    if (edits.length === 0) {
        return content;
    }
    let out = content;
    for (const [ start, end, text ] of edits.sort ((a, b) => b[0] - a[0])) {
        out = out.slice (0, start) + text + out.slice (end);
    }
    return out;
}

// the hand-written headers must still declare what the rules assume, or the rules are unsound
export function j06HeaderCheck (readFile, baseDir) {
    const problems = [];
    const fs = readFile;
    const check = (file, declarations) => {
        let text;
        try {
            text = fs (baseDir + '/' + file);
        } catch (e) {
            problems.push (`hx10w2 J06: cannot read ${file}`);
            return;
        }
        for (const [ name, shape ] of declarations) {
            const re = new RegExp (`public [^\\n]*\\b${shape} ${name}\\b`);
            if (!re.test (text)) problems.push (`hx10w2 J06: ${file} no longer declares ${shape} ${name}`);
        }
    };
    check ('BaseExchange.java', [ ...PLAIN_FIELDS ].map ((n) => [ n, 'Map<String, Object>' ]));
    check ('ws/WsClient.java', [ ...CLIENT_FIELDS ].map ((n) => [ n, 'Map<String, Object>' ]));
    return problems;
}

// snippet checks (`npx tsx build/javaTranspiler.ts --audit-string-types --self-test`)
export function j06SelfTest () {
    const problems = [];
    const cls = (body, params = 'Object o, String s, Object v, Client client') =>
        `public class Woo extends WooApi\n{\n    public Object m(${params})\n    {\n${body}\n    }\n}`;
    const cases = [
        // native: plain single-owner field, String key
        [ 'put literal key', '        Helpers.addElementToObject(this.orderbooks, "a", v);', '        this.orderbooks.put("a", v);' ],
        [ 'put String local key', '        String symbol = this.safeString(o, "s");\n        Helpers.addElementToObject(this.tickers, symbol, v);', '        this.tickers.put(symbol, v);' ],
        [ 'put String param key', '        Helpers.addElementToObject(this.ohlcvs, s, v);', '        this.ohlcvs.put(s, v);' ],
        [ 'put cast key', '        Helpers.addElementToObject(this.trades, ((String)s), v);', '        this.trades.put(((String)s), v);' ],
        [ 'get literal key', '        return Helpers.GetValue(this.orderbooks, "a");', '        return (this.orderbooks == null ? null : this.orderbooks.get("a"));' ],
        [ 'get String local key', '        String symbol = this.safeString(o, "s");\n        return Helpers.GetValue(this.tickers, symbol);', '        return (this.tickers == null || symbol == null ? null : this.tickers.get(symbol));' ],
        [ 'get client map', '        return Helpers.GetValue(client.subscriptions, s);', '        return (client.subscriptions == null || s == null ? null : client.subscriptions.get(s));' ],
        [ 'get client futures', '        return Helpers.GetValue(client.futures, s);', '        return (client.futures == null || s == null ? null : client.futures.get(s));' ],
        // helper kept: unproven key, unlisted / nullable / concurrent receivers, expression-position put
        [ 'put Object key', '        Object k = this.safeValue(o, "k");\n        Helpers.addElementToObject(this.orderbooks, k, v);', undefined ],
        [ 'put Object param key', '        Helpers.addElementToObject(this.tickers, o, v);', undefined ],
        [ 'put options field', '        Helpers.addElementToObject(this.options, "a", v);', undefined ],
        [ 'put markets field', '        Helpers.addElementToObject(this.markets, s, v);', undefined ],
        [ 'put balance field', '        Helpers.addElementToObject(this.balance, s, v);', undefined ],
        [ 'put liquidations field', '        Helpers.addElementToObject(this.liquidations, s, v);', undefined ],
        [ 'put client map', '        Helpers.addElementToObject(client.subscriptions, "a", v);', undefined ],
        [ 'put expression position', '        Object x = Helpers.addElementToObject(this.tickers, "a", v);', undefined ],
        [ 'get Object key', '        return Helpers.GetValue(this.tickers, o);', undefined ],
        [ 'get markets field', '        return Helpers.GetValue(this.markets, s);', undefined ],
        [ 'get client Object key', '        return Helpers.GetValue(client.subscriptions, o);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const input = cls (body);
        let out;
        try {
            out = nativeJavaJ06FieldOps (input);
        } catch (e) {
            problems.push (`hx10w2 J06: ${name} threw ${e.message}`);
            continue;
        }
        if (expect === undefined ? out !== input : !out.includes (expect)) {
            problems.push (`hx10w2 J06: ${name}\n${out}`);
        }
        if (nativeJavaJ06FieldOps (out) !== out) {
            problems.push (`hx10w2 J06: ${name} not idempotent`);
        }
    }
    // the field rules must not fire inside comments or string literals
    const commented = cls ('        // Helpers.addElementToObject(this.tickers, "a", v);\n        String m = "Helpers.GetValue(this.tickers, s)";');
    if (nativeJavaJ06FieldOps (commented) !== commented) {
        problems.push ('hx10w2 J06: rewrote inside a comment / literal');
    }
    return problems;
}
