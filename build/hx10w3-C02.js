// hx10w3 C02 (cs): an `object` local keeps its `object` declaration (the sink scan still owns it),
// but the retype scan's candidate box -- string / string-keyed dict / List<object>, joined over the
// initialiser and every write that precedes the read -- is exposed at that read, so `getValue`,
// `inOp`, `getArrayLength` and `add` print the native op instead of the helper call. Two outcomes
// per site: candidate proven -> the helper's own branch spelled natively; not proven -> helper call.

const W3_TYPE = '[A-Za-z_][A-Za-z0-9_.]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>)?(?:\\[\\])?\\??'
const W3_DECL = new RegExp ('^[ \\t]*(' + W3_TYPE + ')[ \\t]+([A-Za-z_]\\w*)[ \\t]*=[^=>]')
const W3_FOR = new RegExp ('\\bfor\\s*\\(\\s*(' + W3_TYPE + ')\\s+([A-Za-z_]\\w*)\\s*=', 'g')
const W3_FOREACH = new RegExp ('\\bforeach\\s*\\(\\s*(' + W3_TYPE + ')\\s+([A-Za-z_]\\w*)\\s+in\\b', 'g')
const W3_WORDS = new Set ([ 'return', 'throw', 'else', 'case', 'await', 'new', 'in', 'using', 'out', 'ref', 'public', 'private', 'static', 'var',
    'yield', 'const', 'if', 'while', 'foreach', 'for', 'is', 'as', 'null', 'true', 'false', 'default', 'nameof', 'typeof', 'get', 'set',
    'lock', 'switch', 'try', 'catch', 'finally', 'do', 'break', 'continue', 'goto', 'params', 'base', 'this', 'sizeof', 'checked', 'when' ])

const w3isobj = (type) => (type === 'object') || (type === 'Object') || (type === 'System.Object')
const w3isstr = (type) => (type === 'string') || (type === 'string?') || (type === 'String') || (type === 'String?')
const w3islist = (type) => /^(?:List|IList)<object>$/.test (type)
const w3isdict = (type) => /^(?:Dictionary|IDictionary|ConcurrentDictionary)<string, ?object>$/.test (type)

// same-length copy of `content` with string/char literals and `//` comments blanked out, so a
// brace, a `getValue(` or a `=` inside a literal never moves the structural scan
function w3mask (content) {
    const out = content.split ('');
    const blank = (at) => { out[at] = ' '; };
    let i = 0;
    while (i < content.length) {
        const ch = content[i];
        const verbatim = (ch === '@') && (content[i + 1] === '"');
        if (verbatim || (ch === '"') || (ch === "'")) {
            const quote = verbatim ? '"' : ch;
            blank (i);
            i += verbatim ? 2 : 1;
            while (i < content.length) {
                if (!verbatim && (content[i] === '\\') && (i + 1 < content.length)) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                    continue;
                }
                if (verbatim && (content[i] === '"') && (content[i + 1] === '"')) {
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
                blank (i);
                i++;
            }
            continue;
        }
        if ((ch === '/') && (content[i + 1] === '/')) {
            while (i < content.length && content[i] !== '\n') {
                blank (i);
                i++;
            }
            continue;
        }
        i++;
    }
    return out.join ('');
}

function w3delta (line) {
    let delta = 0;
    for (const ch of line) {
        if (ch === '{') delta++;
        if (ch === '}') delta--;
    }
    return delta;
}

// `[signatureLine, closingBraceLine]` for every member with a braced body in this file
function w3spans (lines) {
    const spans = [];
    for (let i = 0; i < lines.length; i++) {
        if (!/^ {4}(?:public|private|protected|internal|static|virtual|override|async|sealed)[\w\s<>,.\[\]?]*\([^;]*\)\s*$/.test (lines[i])) continue;
        let open = i + 1;
        while ((open < lines.length) && (lines[open].trim () === '')) open++;
        if (open >= lines.length || (lines[open].trim () !== '{')) continue;
        let depth = 0;
        let close = open;
        for (; close < lines.length; close++) {
            depth += w3delta (lines[close]);
            if (depth <= 0) break;
        }
        spans.push ([ i, close ]);
        i = close;
    }
    return spans;
}

// the argument texts of the call whose `(` sits at `open`
function w3args (masked, open) {
    const args = [];
    let depth = 0;
    let angle = 0;
    let start = open + 1;
    for (let i = open; i < masked.length; i++) {
        const ch = masked[i];
        if ('([{'.indexOf (ch) >= 0) depth++;
        // a generic argument list (`IDictionary<string, object>`) carries commas of its own
        if ((ch === '<') && /[\w.]/.test (masked[i - 1] ?? '')) angle++;
        if ((ch === '>') && (angle > 0)) angle--;
        if (')]}'.indexOf (ch) >= 0) {
            depth--;
            if (depth === 0) {
                args.push ({ start, end: i });
                return args;
            }
        }
        if ((ch === ',') && (depth === 1) && (angle === 0)) {
            args.push ({ start, end: i });
            start = i + 1;
        }
    }
    return undefined;
}

// the arguments of the call `name(...)` that starts the text and closes at its very end
function w3call (masked, name) {
    if (!masked.startsWith (name)) return undefined;
    let at = name.length;
    while ((at < masked.length) && (masked[at] !== '(')) {
        if (!/^\s$/.test (masked[at])) return undefined;
        at++;
    }
    if (at >= masked.length) return undefined;
    const args = w3args (masked, at);
    if (args === undefined) return undefined;
    return (args[args.length - 1].end === masked.length - 1) ? args : undefined;
}

// top-level `a + b` split of a C# concatenation
function w3plus (masked) {
    let depth = 0;
    for (let i = 0; i < masked.length; i++) {
        const ch = masked[i];
        if ('([{'.indexOf (ch) >= 0) depth++;
        if (')]}'.indexOf (ch) >= 0) depth--;
        if ((ch === '+') && (depth === 0) && (masked[i + 1] !== '+') && (masked[i - 1] !== '+')) {
            return [ masked.substring (0, i), masked.substring (i + 1) ];
        }
    }
    return undefined;
}

const W3_STRING_CALLS = { 'this.uuid': 1, 'this.uuid16': 1, 'this.uuid22': 1 }

// the candidate box of one emitted expression: `{ kind, nonNull }`, or undefined. `kind` is
// 'string' | 'dict' | 'list'; every answer is read off the C# text, never the TS annotation
function w3box (text, ctx, self, depth) {
    if (depth > 6) return undefined;
    const t = text.trim ();
    if (t === '') return undefined;
    if (/^"([^"\\]|\\.)*"$/.test (t) || /^@"/.test (t)) return { kind: 'string', nonNull: true };
    if (t === 'null') return { kind: 'unknown', nonNull: false };
    if (/^[A-Za-z_]\w*$/.test (t)) {
        if ((self !== undefined) && (t === self)) return ctx.selfBox;
        // a copy of another proven-string object local reads that local's box at this line
        const copied = (ctx.objectLocals?.has (t) === true) ? ctx.boxAt?.get (t + ':' + ctx.line) : undefined;
        if ((copied !== undefined) && (copied.kind === 'string')) return copied;
        const known = ctx.types.get (t);
        if (known === undefined) return undefined;
        if (w3isstr (known)) return { kind: 'string', nonNull: false };
        if (w3isdict (known)) return { kind: 'dict', nonNull: false };
        if (w3islist (known)) return { kind: 'list', nonNull: false };
        return undefined;
    }
    const masked = w3mask (t);
    // this pass's own null-propagating concat: null exactly when the named string is
    const nullSafe = /^\(\(object\)\(([A-Za-z_]\w*) == null \? null : \1 \+ [^;]*\)\)$/.exec (masked);
    if (nullSafe !== null) {
        const source = w3box (nullSafe[1], ctx, self, depth + 1);
        return ((source !== undefined) && (source.kind === 'string')) ? { kind: 'string', nonNull: false } : undefined;
    }
    if (/^new (?:I?Dictionary)<string, ?object>/.test (masked)) return { kind: 'dict', nonNull: true };
    if (/^new List<object>/.test (masked)) return { kind: 'list', nonNull: true };
    if (/^String\.Join\s*\(/.test (masked)) return { kind: 'string', nonNull: true };
    if (/^[A-Za-z_][\w.]*\.ToString\s*\(\s*\)$/.test (masked)) return { kind: 'string', nonNull: true };
    if (masked.startsWith ('(') && masked.endsWith (')')) {
        const inner = t.slice (1, -1);
        const cast = /^\(\s*(?:string|String)\s*\)/.exec (inner);
        if (cast !== null) {
            const value = w3box (inner.substring (cast[0].length), ctx, self, depth + 1);
            return { kind: 'string', nonNull: (value !== undefined) && (value.nonNull === true) };
        }
        const value = w3box (inner, ctx, self, depth + 1);
        if (value !== undefined) return value;
    }
    const plus = w3plus (masked);
    if (plus !== undefined) {
        const a = w3box (plus[0], ctx, self, depth + 1);
        const b = w3box (plus[1], ctx, self, depth + 1);
        if (((a !== undefined) && (a.kind === 'string')) || ((b !== undefined) && (b.kind === 'string'))) return { kind: 'string', nonNull: true };
        return undefined;
    }
    const head = /^((?:this\.)?[A-Za-z_]\w*)\s*\(/.exec (masked);
    if (head === null) return undefined;
    const args = w3call (masked, head[1]);
    if (args === undefined) return undefined;
    const name = head[1];
    const argText = (n) => (args[n] === undefined) ? '' : t.substring (args[n].start, args[n].end);
    if (name === 'add') {
        if (args.length !== 2) return undefined;
        const a = w3box (argText (0), ctx, self, depth + 1);
        const b = w3box (argText (1), ctx, self, depth + 1);
        if ((a === undefined) || (b === undefined) || (a.kind !== 'string') || (b.kind !== 'string')) return undefined;
        return { kind: 'string', nonNull: (a.nonNull === true) && (b.nonNull === true) };
    }
    if ((name === 'this.safeString') || (name === 'this.safeString2')) {
        const need = (name === 'this.safeString') ? 3 : 4;
        const literal = (args.length === need) && /^"([^"\\]|\\.)*"$/.test (argText (args.length - 1).trim ());
        return { kind: 'string', nonNull: literal };
    }
    if (name === 'this.numberToString') return { kind: 'string', nonNull: false };
    if (W3_STRING_CALLS[name] === 1) return { kind: 'string', nonNull: true };
    if ((name === 'this.safeDict') || (name === 'this.safeDict2') || (name === 'this.safeDictN')) return { kind: 'dict', nonNull: false };
    if ((name === 'this.safeList') || (name === 'this.safeList2') || (name === 'this.arrayConcat')) return { kind: 'list', nonNull: true };
    return undefined;
}

// a key the helper compares as a string: a literal, or a read proven a non-null string
function w3key (text, ctx, self) {
    const t = text.trim ();
    if (/^"([^"\\]|\\.)*"$/.test (t)) return t;
    const value = w3box (t, ctx, self, 0);
    if ((value !== undefined) && (value.kind === 'string') && (value.nonNull === true)) return t;
    return undefined;
}

// an index the helper's ParseInt reads exactly: a literal, an `int` name, or an Int64 name
function w3idx (text, ctx) {
    const t = text.trim ();
    if (/^\d{1,9}$/.test (t)) return { text: t };
    if (!/^[A-Za-z_]\w*$/.test (t)) return undefined;
    const type = ctx.types.get (t);
    if (type === 'int') return { text: t };
    if ((type === 'Int64') || (type === 'long')) return { text: '(int)' + t };
    return undefined;
}

// the native spelling of one helper call on a proven candidate box, or undefined to keep the helper
function w3rep (kind, name, box, texts, ctx, self, tick) {
    if (box.kind === 'unknown') return undefined;
    // `is` patterns name the box instead of casting it: a null receiver answers the helper's
    // null branch in every arm, so no proof of non-nullness is needed for these reads
    const dictVar = 'w3d' + tick;
    const listVar = 'w3l' + tick;
    const strVar = 'w3s' + tick;
    if (kind === 'getArrayLength') {
        if (box.kind === 'list') return '(' + name + ' is IList<object> ' + listVar + ' ? ' + listVar + '.Count : 0)';
        if (box.kind === 'dict') return '(' + name + ' is IDictionary<string, object> ' + dictVar + ' ? ' + dictVar + '.Count : 0)';
        return '(' + name + ' is string ' + strVar + ' ? ' + strVar + '.Length : 0)';
    }
    if (kind === 'inOp') {
        if (box.kind !== 'dict') return undefined;
        const key = w3key (texts[1], ctx, self);
        if (key === undefined) return undefined;
        return '(' + name + ' is IDictionary<string, object> ' + dictVar + ' && ' + dictVar + '.ContainsKey(' + key + '))';
    }
    if (kind === 'getValue') {
        if (box.kind === 'dict') {
            const key = w3key (texts[1], ctx, self);
            if (key === undefined) return undefined;
            return '(' + name + ' is IDictionary<string, object> ' + dictVar + ' && ' + dictVar + '.ContainsKey(' + key + ') ? ' + dictVar + '[' + key + '] : null)';
        }
        const at = w3idx (texts[1], ctx);
        if (at === undefined) return undefined;
        if (box.kind === 'list') return '(' + name + ' is IList<object> ' + listVar + ' && ' + at.text + ' < ' + listVar + '.Count ? ' + listVar + '[' + at.text + '] : null)';
        return '(' + name + ' is string ' + strVar + ' && ' + at.text + ' < ' + strVar + '.Length ? ' + strVar + '[' + at.text + '].ToString () : null)';
    }
    if (kind === 'add') {
        // the helper's string branch is `(string)a + (string)b`, and a null left falls to its
        // `return null`: `(string)(object)b` unboxes the right operand exactly as `(string)b`
        // does, and the `(object)` box keeps the result's static type the helper's own
        if (box.kind !== 'string') return undefined;
        const right = w3box (texts[1], ctx, self, 0);
        const text = ((right !== undefined) && (right.kind === 'string')) ? texts[1].trim () : '(string)(object)(' + texts[1].trim () + ')';
        const core = (box.nonNull === true) ? name + ' + ' + text : name + ' == null ? null : ' + name + ' + ' + text;
        return '((object)(' + core + '))';
    }
    return undefined;
}

// add(<L + lit>, right) where the left is add(local, lit) or this pass's `((object)(local == null ? null :
// local + lit))`, local a string-box object local and right a string: add's string branch is `a + b` and
// a null left answers null, so one null test on `local` carries the chain
function w3foldChain (masked, text, args, objectLocals, boxAt, k, ctx) {
    const first = masked.substring (args[0].start, args[0].end);
    const lead = first.length - first.trimStart ().length;
    const base = args[0].start + lead;
    const trimmed = first.trim ();
    let local;
    let literal;
    const inner = w3call (trimmed, 'add');
    if ((inner !== undefined) && (inner.length === 2)) {
        local = text.substring (base + inner[0].start, base + inner[0].end).trim ();
        literal = text.substring (base + inner[1].start, base + inner[1].end).trim ();
    } else {
        const guarded = /^\(\(object\)\(([A-Za-z_]\w*) == null \? null : \1 \+ ("(?:[^"\\]|\\.)*")\)\)$/.exec (text.substring (base, base + trimmed.length));
        if (guarded === null) return undefined;
        local = guarded[1];
        literal = guarded[2];
    }
    if (!objectLocals.has (local) || !/^"([^"\\]|\\.)*"$/.test (literal)) return undefined;
    const box = boxAt.get (local + ':' + k);
    if ((box === undefined) || (box.kind !== 'string')) return undefined;
    const right = text.substring (args[1].start, args[1].end).trim ();
    const rightBox = w3box (right, ctx, undefined, 0);
    if ((rightBox === undefined) || (rightBox.kind !== 'string')) return undefined;
    const core = local + ' + ' + literal + ' + ' + right;
    return '((object)(' + ((box.nonNull === true) ? core : local + ' == null ? null : ' + core) + '))';
}

export function hx10w3C02CandidateReads (content) {
    if (!/(?<![\w.])(?:getValue|getArrayLength|inOp|add)\s*\(/.test (content)) return content;
    const lines = content.split ('\n');
    const masked = w3mask (content).split ('\n');
    if (masked.length !== lines.length) return content;
    let changed = false;
    let tick = 0;
    for (const [ start, end ] of w3spans (masked)) {
        // the candidate scan of this method: declared and parameter types, `object` locals, lambda names
        const types = new Map ();
        const objectLocals = new Map ();
        const bad = new Set ();
        const bound = new Set ();
        const declare = (name, type) => {
            if (W3_WORDS.has (type.split (' ')[0]) || W3_WORDS.has (name)) return;
            if (types.has (name) && (types.get (name) !== type)) bad.add (name);
            types.set (name, type);
        };
        const open = masked[start].indexOf ('(');
        if (open >= 0) {
            for (const param of w3args (masked[start], open) ?? []) {
                const m = new RegExp ('^\\s*(?:this\\s+)?(' + W3_TYPE + ')\\s+([A-Za-z_]\\w*)\\s*(?:=|$)').exec (masked[start].substring (param.start, param.end));
                if (m !== null) declare (m[2], m[1]);
            }
        }
        for (let k = start; k <= end; k++) {
            const line = masked[k];
            for (const rx of [ W3_FOR, W3_FOREACH ]) {
                rx.lastIndex = 0;
                let m;
                while ((m = rx.exec (line)) !== null) declare (m[2], m[1]);
            }
            for (const lambda of line.matchAll (/\(([^()]*)\)\s*=>/g)) {
                for (const part of lambda[1].split (',')) {
                    const name = part.trim ().split (/\s+/).pop ();
                    if (name !== '') bound.add (name);
                }
            }
            const decl = W3_DECL.exec (line);
            if (decl === null) continue;
            const type = decl[1].trim ();
            declare (decl[2], type);
            if (w3isobj (type)) {
                if (objectLocals.has (decl[2])) bad.add (decl[2]);
                else objectLocals.set (decl[2], k);
            }
        }
        for (const name of [ ...bound, ...bad ]) objectLocals.delete (name);
        if (objectLocals.size === 0) continue;
        for (let k = start; k <= end; k++) {
            for (const name of [ ...objectLocals.keys () ]) {
                if (new RegExp ('\\b(?:ref|out)[ \\t]+' + name + '\\b').test (masked[k])) objectLocals.delete (name);
            }
        }
        if (objectLocals.size === 0) continue;
        const depthAt = [];
        {
            let depth = 0;
            for (let k = start; k <= end; k++) {
                depthAt.push (depth);
                depth += w3delta (masked[k]);
            }
        }
        const ctx = { types, selfBox: undefined, objectLocals, boxAt: undefined, line: 0 };
        // the box joined over the initialiser and every write before each line: an unrecognised
        // write, a `+=`/`??=` or a null write ends the proof for every later read
        const boxAt = new Map ();
        ctx.boxAt = boxAt;
        for (const [ name, declLine ] of objectLocals) {
            ctx.line = declLine;
            const decl = new RegExp ('^[ \\t]*object[ \\t]+' + name + '[ \\t]*=[ \\t]*(.*);[ \\t]*$').exec (lines[declLine]);
            const startBox = (decl === null) ? undefined : w3box (decl[1].replace (/\/\/.*$/, ''), ctx, undefined, 0);
            let box = (startBox === undefined) ? { kind: 'unknown', nonNull: false } : startBox;
            const write = new RegExp ('(?<![\\w.])' + name + '[ \\t]*(=|\\+=|-=|\\*=|/=|\\?\\?=)(?!=)');
            const ownBlock = new RegExp ('^[ \\t]*' + name + '[ \\t]*=(?!=)');
            for (let k = declLine; k <= end; k++) {
                boxAt.set (name + ':' + k, box);
                if (k === declLine) continue;
                const found = write.exec (masked[k]);
                if (found === null) continue;
                if (found[1] !== '=') {
                    box = { kind: 'unknown', nonNull: false };
                    continue;
                }
                const rhs = masked[k].substring (found.index + found[0].length).split (';')[0];
                ctx.selfBox = box;
                ctx.line = k;
                const written = w3box (rhs, ctx, name, 0);
                ctx.selfBox = undefined;
                if (written === undefined) box = { kind: 'unknown', nonNull: false };
                else if (written.kind === 'unknown') box = { kind: box.kind, nonNull: false };
                else if (written.kind === box.kind) box = { kind: box.kind, nonNull: (box.nonNull === true) && (written.nonNull === true) };
                else box = ((box.kind === 'unknown') && ownBlock.test (masked[k]) && (depthAt[k - start] === depthAt[declLine - start]))
                    ? { kind: written.kind, nonNull: written.nonNull === true } : { kind: 'unknown', nonNull: false };
            }
        }
        for (let k = start; k <= end; k++) {
            const line = masked[k];
            if (!/(?<![\w.])(?:getValue|getArrayLength|inOp|add)\s*\(/.test (line)) continue;
            const call = /\b(getValue|getArrayLength|inOp|add)\s*\(/g;
            const edits = [];
            let m;
            let skipUntil = 0;
            ctx.line = k;
            while ((m = call.exec (line)) !== null) {
                if (m.index < skipUntil) continue;
                if ((m.index > 0) && /[\w.]/.test (line[m.index - 1])) continue;
                const kind = m[1];
                const args = w3args (line, m.index + m[0].length - 1);
                if (args === undefined) continue;
                if (kind === 'getArrayLength' ? (args.length !== 1) : (args.length !== 2)) continue;
                const name = line.substring (args[0].start, args[0].end).trim ();
                if ((kind === 'add') && !objectLocals.has (name)) {
                    const folded = w3foldChain (line, lines[k], args, objectLocals, boxAt, k, ctx);
                    if (folded !== undefined) {
                        edits.push ({ start: m.index, end: args[1].end + 1, text: folded });
                        skipUntil = args[1].end + 1;
                    }
                    continue;
                }
                if (!objectLocals.has (name)) continue;
                const box = boxAt.get (name + ':' + k);
                if (box === undefined) continue;
                const texts = args.map ((a) => lines[k].substring (a.start, a.end));
                const replacement = w3rep (kind, name, box, texts, ctx, name, ++tick);
                if (replacement === undefined) continue;
                edits.push ({ start: m.index, end: args[args.length - 1].end + 1, text: replacement });
            }
            if (edits.length === 0) continue;
            let out = lines[k];
            for (const edit of edits.sort ((a, b) => b.start - a.start)) {
                out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
            }
            lines[k] = out;
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks for `csharpTranspiler.ts --self-test` (each case fails on the base generator)
export function w3checks () {
    const problems = [];
    const wrap = (params, body) => [
        'namespace ccxt;',
        'public partial class test : Exchange',
        '{',
        '    public virtual object f(' + params + ')',
        '    {',
        ...body.split ('\n').map ((l) => '        ' + l),
        '    }',
        '}',
    ].join ('\n');
    const runs = (name, params, body, expected, absent) => {
        const out = hx10w3C02CandidateReads (wrap (params, body));
        if (!out.includes (expected) || ((absent !== undefined) && out.includes (absent))) {
            problems.push ('hx10w3 C02 candidate reads ' + name + ':\n' + out);
        }
    };
    const keeps = (name, params, body) => {
        const out = hx10w3C02CandidateReads (wrap (params, body));
        if (/(?<![\w.])(?:getValue|getArrayLength|inOp|add)\s*\(/.test (out) === false) {
            problems.push ('hx10w3 C02 candidate reads (kept) ' + name + ':\n' + out);
        }
    };
    runs ('dict copy', 'IDictionary<string, object> response', 'object data = response;\nreturn getValue(data, "id");',
        '(data is IDictionary<string, object> w3d1 && w3d1.ContainsKey("id") ? w3d1["id"] : null)');
    runs ('dict literal membership', 'object response', 'object data = new Dictionary<string, object>() {};\nreturn inOp(data, "id");',
        '(data is IDictionary<string, object> w3d1 && w3d1.ContainsKey("id"))');
    runs ('list literal length', 'object response', 'object rows = new List<object>() {};\nreturn getArrayLength(rows);',
        '(rows is IList<object> w3l1 ? w3l1.Count : 0)');
    runs ('list literal index', 'object response', 'object rows = new List<object>() {};\nint i = 1;\nreturn getValue(rows, i);',
        '(rows is IList<object> w3l1 && i < w3l1.Count ? w3l1[i] : null)');
    runs ('string length', 'object response', 'object text = "abc";\nreturn getArrayLength(text);', '(text is string w3s1 ? w3s1.Length : 0)');
    runs ('string concat', 'object response', 'object id = "a";\nreturn add(id, "-");', '(id + "-")');
    runs ('chained concat over a copied string local', 'string? prefix, string? code', 'object mp = prefix;\nif (code == "x")\n{\n    mp = ((object)(prefix == null ? null : prefix + "_x"));\n}\nreturn add(add(mp, "."), code);',
        '((object)(mp == null ? null : mp + "." + code))', 'add(add(');
    runs ('nullable string concat', 'object response', 'object id = this.safeString(response, "id");\nreturn add(id, "-");', '((object)(id == null ? null : id + "-"))');
    runs ('safeString2 keys are not a default', 'object response', 'object id = this.safeString2(response, "a", "b");\nreturn add(id, "-");', '((object)(id == null ? null : id + "-"))');
    runs ('later write joins', 'object response', 'object rows = null;\nrows = new List<object>() {};\nreturn getArrayLength(rows);',
        '(rows is IList<object> w3l1 ? w3l1.Count : 0)');
    keeps ('mixed writes', 'object response', 'object rows = new List<object>() {};\nrows = response;\nreturn getArrayLength(rows);');
    keeps ('unproven declaration', 'object response', 'object rows = this.safeValue(response, "rows");\nreturn getArrayLength(rows);');
    keeps ('ref argument', 'object response', 'object rows = new List<object>() {};\nthis.fill(ref rows);\nreturn getArrayLength(rows);');
    keeps ('lambda parameter', 'object response', 'object rows = new List<object>() {};\nreturn this.filter(rows, (object rows) => getArrayLength(rows));');
    keeps ('object key', 'object response', 'object data = new Dictionary<string, object>() {};\nobject key = response;\nreturn getValue(data, key);');
    keeps ('conditional write', 'object response', 'object rows = null;\nif (response == null)\n{\nrows = new List<object>() {};\n}\nreturn getArrayLength(rows);');
    keeps ('string-element list', 'object response', 'object rows = new List<string>() {};\nreturn getArrayLength(rows);');
    return problems;
}
