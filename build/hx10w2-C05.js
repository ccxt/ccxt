// hx10 wave-2 unit C05 — C# native compare/math emission for the residual family:
// mathMin / mathMax / mod + the ordered comparisons (isLessThan / isGreaterThan / …OrEqual).
//
// Final-text pass (tail of nativeDeclaredHelperCalls): every operand kind is read from the text
// this same run emitted (declaration types are the retyped ones), and a call is rewritten only
// when the printer's own C# operator computes the helper's answer for every value the type allows:
//   mathMin/mathMax  both operands `int` / `Int64` (an integer literal widens to the other side)
//                    -> Math.Min/Max; a nullable operand only with a null proof at the read
//                    (enclosing `if (x != null)` block, a `&&` conjunct, or the guarded arm of a
//                    `x == null ? a : …` ternary) -> Math.Min(x.Value, y). `double` keeps the
//                    helper (NaN and the signed-zero tie pick the other operand).
//   mod              both operands `Int64` / `Int64?` (an integer literal widens) -> `(a % b)`;
//                    the lifted `%` answers null exactly where the helper's null branch does.
//   comparisons      integral pairs (literal / countguard `(x?.Count ?? 0)` included) -> the plain
//                    operator, with the helper's one-sided null branch: a null LEFT of `<`/`<=`
//                    answers true in the helper, a null RIGHT of `>`/`>=` answers true as well, so
//                    only the other side may be nullable (the lifted operator is false for null).
// Everything else keeps the plain helper call. No casts, no helper bodies.

const SIG_RE = /^[ ]{4,}(?:(?:public|private|protected|internal)[ ]+)?(?:static[ ]+|async[ ]+|virtual[ ]+|override[ ]+|sealed[ ]+|new[ ]+|partial[ ]+|extern[ ]+|unsafe[ ]+)*(?:[A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*\(/;
const DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*(=[ ]*([^;]*))?;[ ]*$/;
const NEW_DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]]*(?:[ ][A-Za-z_][\w<>,.\[\]]*)*)[ ]+([A-Za-z_]\w*)[ ]*=[ ]*new\b[^;]*\{[ ]*$/;
const TYPE_RE = /^[A-Za-z_][\w.]*(?:[ ]*<[^<>=;(){}]*>)?(?:[ ]*\[\])?[?]?$/;
const KEYWORDS = ['return', 'throw', 'if', 'else', 'while', 'for', 'foreach', 'using', 'lock', 'yield',
    'case', 'switch', 'do', 'try', 'catch', 'break', 'continue', 'goto', 'new', 'fixed', 'checked',
    'unchecked', 'await', 'base', 'this', 'var'];

const FAMILY_RE = /(?<![\w.])(mathMin|mathMax|mod|isLessThan|isGreaterThan|isLessThanOrEqual|isGreaterThanOrEqual)\s*\(/g;
const COMPARE_TOKENS = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' };

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
            out += (quote === '"') ? '"' : ' ';
            while (j < line.length) {
                if (line[j] === '\\') { out += '  '; j += 2; continue; }
                if (line[j] === quote) break;
                out += ' '; j++;
            }
            if (j < line.length) { out += (quote === '"') ? '"' : ' '; j++; }
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

function signatureParams (masked, start) {
    let depth = 0;
    let text = '';
    for (let i = start; (i < masked.length) && (i < start + 14); i++) {
        text += masked[i].split ('{')[0] + ' ';
        depth += (masked[i].match (/\(/g) ?? []).length;
        depth -= (masked[i].match (/\)/g) ?? []).length;
        if ((depth <= 0) && text.includes ('(')) break;
    }
    const open = text.indexOf ('(');
    const close = text.lastIndexOf (')');
    if ((open < 0) || (close <= open)) return {};
    const params = {};
    const parts = [];
    let current = '';
    let nesting = 0;
    for (const ch of text.substring (open + 1, close)) {
        if ((ch === '(') || (ch === '<') || (ch === '[')) nesting++;
        if ((ch === ')') || (ch === '>') || (ch === ']')) nesting--;
        if ((ch === ',') && (nesting === 0)) { parts.push (current); current = ''; continue; }
        current += ch;
    }
    if (current.trim ()) parts.push (current);
    for (const part of parts) {
        const tokens = part.trim ().split ('=')[0].trim ().split (/\s+/).filter ((t) => t.length > 0);
        if (tokens.length < 2) continue;
        const name = tokens[tokens.length - 1];
        let type = tokens.slice (0, tokens.length - 1).join (' ');
        type = type.replace (/^(ref|out|in|params|this)\s+/, '');
        if (!/^[A-Za-z_]\w*$/.test (name) || !TYPE_RE.test (type)) continue;
        params[name] = type;
    }
    return params;
}

function declarationOfLine (line) {
    const match = DECL_RE.exec (line);
    if (match === null) {
        const opened = NEW_DECL_RE.exec (line);
        if (opened === null) return undefined;
        const type = opened[1].trim ();
        if (KEYWORDS.includes (type.split (' ')[0]) || !TYPE_RE.test (type)) return undefined;
        return { type, name: opened[2], value: 'new' };
    }
    const type = match[1].trim ();
    const name = match[2];
    if (KEYWORDS.includes (type.split (' ')[0]) || !TYPE_RE.test (type)) return undefined;
    return { type, name, value: (match[4] ?? '').trim () };
}

function callEnd (masked, open) {
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
        const ch = masked[k];
        if (ch === '(') depth++;
        if (ch === ')') {
            depth--;
            if (depth === 0) return k;
        }
    }
    return undefined;
}

function topLevelComma (masked, open, close) {
    let depth = 0;
    for (let k = open; k < close; k++) {
        const ch = masked[k];
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if ((ch === ',') && (depth === 1)) return k;
    }
    return undefined;
}

function stripParens (text) {
    let out = text.trim ();
    for (;;) {
        if (!(out.startsWith ('(') && out.endsWith (')'))) return out;
        const inner = out.slice (1, -1);
        let depth = 0;
        let balanced = true;
        for (const ch of inner) {
            if (ch === '(') depth++;
            if (ch === ')') depth--;
            if (depth < 0) { balanced = false; break; }
        }
        if (!balanced || (depth !== 0)) return out;
        out = inner.trim ();
    }
}

function topLevelSplit (text, token) {
    const out = [];
    let depth = 0;
    let last = 0;
    for (let k = 0; k < text.length; k++) {
        const ch = text[k];
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if ((depth === 0) && text.startsWith (token, k)) {
            out.push (text.slice (last, k));
            last = k + token.length;
            k += token.length - 1;
        }
    }
    out.push (text.slice (last));
    return out;
}

function numericKind (type) {
    if (type === undefined) return undefined;
    const t = type.trim ();
    if ((t === 'int') || (t === 'uint')) return 'int';
    if ((t === 'Int64') || (t === 'long')) return 'Int64';
    if ((t === 'Int64?') || (t === 'long?')) return 'Int64?';
    if (t === 'int?') return 'int?';
    if ((t === 'double') || (t === 'float')) return 'double';
    if ((t === 'double?') || (t === 'float?')) return 'double?';
    return undefined;
}

function isIntegralKind (kind) {
    return (kind === 'int') || (kind === 'Int64') || (kind === 'intlit');
}

function baseKind (kind) {
    return kind.endsWith ('?') ? kind.slice (0, -1) : kind;
}

// one operand of a call: its kind + the text to emit (`.Value` added for a proven nullable name)
function operandOf (text, ctx, line) {
    const bare = stripParens (text);
    if (/^-?\d{1,15}$/.test (bare)) return { kind: 'intlit', text: bare, name: undefined };
    if (/^-?\d+\.\d+$/.test (bare)) return { kind: 'dblit', text: bare, name: undefined };
    if (/^\(?[A-Za-z_]\w*\?\.(?:Count|Length)\s*(?:\?\?\s*0)?\)?$/.test (bare)) {
        return { kind: 'int', text: '(' + bare.replace (/^\(|\)$/g, '') + ')', name: undefined, count: true };
    }
    if (!/^[A-Za-z_]\w*$/.test (bare)) return undefined;
    const type = ctx.typeOf (bare, line);
    const kind = numericKind (type);
    if (kind === undefined) return undefined;
    return { kind, text: bare, name: bare };
}

// a line writes `name` (`name = …`, not `==`), so a guard above it cannot be trusted
function writtenBetween (region, name, from, to) {
    const re = new RegExp ('^[ ]*' + name + '[ ]*(?:[-+*/%]?=)[^=]');
    for (let k = from; k <= to; k++) {
        if (k === from) continue;
        if (re.test (region.lines[k])) return true;
    }
    return false;
}

function provesNonNullConjunct (conjunct, name) {
    const bare = stripParens (conjunct).replace (/\s+/g, ' ');
    return bare === `${name} != null`;
}

function indentOf (line) {
    return line.length - line.trimStart ().length;
}

// an enclosing `if (… x != null …)` block (indentation walk, same shape the earlier passes use)
function blockGuard (region, name, line) {
    let indent = indentOf (region.lines[line]);
    for (let k = line - 1; k > region.start; k--) {
        const masked = region.lines[k];
        const ind = indentOf (masked);
        if ((masked.trim () === '') || (ind >= indent)) continue;
        indent = ind;
        if ((masked.trim () !== '{') || (k - 1 <= region.start)) continue;
        const header = /^[ ]*(?:\}[ ]*else[ ]+)?if[ ]*\(/.exec (region.lines[k - 1]);
        if (header === null) continue;
        const open = header[0].length - 1;
        let depth = 0;
        let close;
        for (let j = open; j < region.lines[k - 1].length; j++) {
            const ch = region.lines[k - 1][j];
            if (ch === '(') depth++;
            if (ch === ')') { depth--; if (depth === 0) { close = j; break; } }
        }
        if (close === undefined) continue;
        const cond = region.lines[k - 1].slice (open + 1, close);
        if (cond.includes ('||')) continue;
        if (!topLevelSplit (cond, '&&').some ((c) => provesNonNullConjunct (c, name))) continue;
        if (writtenBetween (region, name, k - 1, line)) continue;
        return true;
    }
    return false;
}

// `x != null && … <call> …` on the same line, or the guarded arm of `x == null ? a : <call>` /
// `x != null ? <call> : a` (the branch is picked from the ternary's `?`/`:` pair at the call's depth)
function expressionGuard (maskedPrefix, name, callPos) {
    const conjunct = new RegExp ('(?:^|[(&|,;=])\\s*\\(*\\s*' + name + '\\s*!=\\s*null\\s*\\)*\\s*&&');
    for (let k = 0; k < callPos; k++) {
        const rest = maskedPrefix.slice (k);
        const m = conjunct.exec (rest);
        if ((m === null) || (k + m.index >= callPos)) break;
        if (m.index === 0) return true;
        k += m.index - 1;
    }
    const pairs = [];
    const stack = [];
    let depth = 0;
    for (let k = 0; k < callPos; k++) {
        const ch = maskedPrefix[k];
        if ((ch === '(') || (ch === '[')) depth++;
        if ((ch === ')') || (ch === ']')) depth--;
        if (ch === '?') stack.push ({ pos: k, depth });
        if (ch === ':') {
            for (let j = stack.length - 1; j >= 0; j--) {
                if (stack[j].depth === depth) {
                    pairs.push ({ q: stack[j].pos, c: k, depth });
                    stack.splice (j, 1);
                    break;
                }
            }
        }
    }
    const eqNull = new RegExp ('\\b' + name + '\\s*==\\s*null\\s*\\)*\\s*$');
    const neNull = new RegExp ('\\b' + name + '\\s*!=\\s*null\\s*\\)*\\s*$');
    for (const pair of pairs) {
        const cond = maskedPrefix.slice (0, pair.q);
        if ((pair.q < callPos) && (callPos < pair.c)) {
            if (neNull.test (cond)) return true;
        } else if (pair.c < callPos) {
            if (eqNull.test (cond)) return true;
        }
    }
    return false;
}

function nullProven (region, operand, line, callPos, maskedPrefix) {
    if (!operand.kind.endsWith ('?')) return true;
    if (operand.name === undefined) return false;
    return blockGuard (region, operand.name, line) || expressionGuard (maskedPrefix, operand.name, callPos);
}

// Math.Min/Max: the helper hands back the operand box, so only `int` / `Int64` (an integer
// literal widening to the other side) are emitted; `double` keeps the helper (NaN, signed zero)
function mathMinMaxText (region, original, masked, line, name, leftText, rightText, callPos) {
    // `int x = mathMin(anInt64, anInt)` would receive the narrowed Int64 pair's `long` result
    const narrowIntSink = /(?:^|[;{}])\s*(?:int|uint|short|byte)\s+[A-Za-z_]\w*\s*=\s*$/.test (masked);
    const left = operandOf (leftText, region, line);
    const right = operandOf (rightText, region, line);
    if ((left === undefined) || (right === undefined)) return undefined;
    if ((left.count === true) || (right.count === true)) return undefined;
    if ((left.kind === 'dblit') || (right.kind === 'dblit')) return undefined;
    if ((baseKind (left.kind) === 'double') || (baseKind (right.kind) === 'double')) return undefined;
    const leftBase = baseKind (left.kind);
    const rightBase = baseKind (right.kind);
    const literal = (o) => (o.kind === 'intlit');
    if (literal (left) && literal (right)) return undefined;
    if ((leftBase !== rightBase) && narrowIntSink) return undefined;
    if (!isIntegralKind (leftBase) || !isIntegralKind (rightBase)) return undefined;
    const text = (o) => {
        if (!o.kind.endsWith ('?')) return o.text;
        if (!nullProven (region, o, line, callPos, masked)) return undefined;
        return o.text + '.Value';
    };
    const l = text (left);
    const r = text (right);
    if ((l === undefined) || (r === undefined)) return undefined;
    return `Math.${name}(${l}, ${r})`;
}

// mod: the lifted `%` answers null exactly where the helper's null branch does, and the Int64
// remainder is the helper's double modulo for every integer the type can hold in practice; both
// operands must therefore be Int64 / Int64? / an integer literal, and the divisor not a literal 0
function modText (leftText, rightText, region, line) {
    const left = operandOf (leftText, region, line);
    const right = operandOf (rightText, region, line);
    if ((left === undefined) || (right === undefined)) return undefined;
    if ((left.count === true) || (right.count === true)) return undefined;
    const allowed = (o) => (o.kind === 'Int64') || (o.kind === 'Int64?') || (o.kind === 'intlit');
    if (!allowed (left) || !allowed (right)) return undefined;
    if ((left.kind === 'intlit') && (right.kind === 'intlit')) return undefined;
    if ((right.kind === 'intlit') && (right.text === '0')) return undefined;
    return `(${left.text} % ${right.text})`;
}

// ordered comparison: the helper answers true for `(value, null)` on `>`/`>=` and for
// `(null, value)` on `<`/`<=`, so only the operand whose null the lifted operator also answers
// false for may stay nullable
function comparisonText (token, leftText, rightText, region, line) {
    const left = operandOf (leftText, region, line);
    const right = operandOf (rightText, region, line);
    if ((left === undefined) || (right === undefined)) return undefined;
    if ((left.kind === 'dblit') || (right.kind === 'dblit')) return undefined;
    if ((baseKind (left.kind) === 'double') || (baseKind (right.kind) === 'double')) return undefined;
    if (!isIntegralKind (baseKind (left.kind)) || !isIntegralKind (baseKind (right.kind))) return undefined;
    if ((left.kind === 'intlit') && (right.kind === 'intlit')) return undefined;
    const nullableLeft = left.kind.endsWith ('?');
    const nullableRight = right.kind.endsWith ('?');
    const nullLeftAllowed = (token === '>') || (token === '>=');
    const nullRightAllowed = (token === '<') || (token === '<=');
    if (nullableLeft && !nullLeftAllowed) return undefined;
    if (nullableRight && !nullRightAllowed) return undefined;
    return `(${left.text} ${token} ${right.text})`;
}

function rewriteLine (region, original, masked, line) {
    if (/['@$]/.test (original)) return undefined;
    const edits = [];
    const re = new RegExp (FAMILY_RE.source, 'g');
    let m;
    while ((m = re.exec (masked)) !== null) {
        const open = m.index + m[0].length - 1;
        const close = callEnd (masked, open);
        if (close === undefined) continue;
        // the result must be a value: a member/index read or an assertion on it is the caller's type
        if (/^[ ]*(?:[.\[]|as\b|!)/.test (masked.substring (close + 1))) continue;
        const comma = topLevelComma (masked, open, close);
        let text;
        const name = m[1];
        if (name === 'mod') {
            if (comma === undefined) continue;
            if (topLevelComma (masked, comma, close) !== undefined) continue;
            const leftText = original.substring (open + 1, comma).trim ();
            const rightText = original.substring (comma + 1, close).trim ();
            text = modText (leftText, rightText, region, line);
        } else if (COMPARE_TOKENS[name] !== undefined) {
            if (comma === undefined) continue;
            if (topLevelComma (masked, comma, close) !== undefined) continue;
            const leftText = original.substring (open + 1, comma).trim ();
            const rightText = original.substring (comma + 1, close).trim ();
            text = comparisonText (COMPARE_TOKENS[name], leftText, rightText, region, line);
        } else {
            if (comma === undefined) continue;
            if (topLevelComma (masked, comma, close) !== undefined) continue;
            const leftText = original.substring (open + 1, comma).trim ();
            const rightText = original.substring (comma + 1, close).trim ();
            text = mathMinMaxText (region, original, masked.substring (0, m.index), line, name === 'mathMin' ? 'Min' : 'Max', leftText, rightText, m.index);
        }
        if (text === undefined) continue;
        edits.push ({ start: m.index, end: close + 1, text });
    }
    if (edits.length === 0) return undefined;
    let out = original;
    for (const e of edits.sort ((a, b) => b.start - a.start)) {
        out = out.substring (0, e.start) + e.text + out.substring (e.end);
    }
    return (out === original) ? undefined : out;
}

export function hx10C05NativeCompareMath (content) {
    if (!FAMILY_RE.test (content)) return content;
    FAMILY_RE.lastIndex = 0;
    if (/^namespace Tests\b/m.test (content)) return content;
    const lines = content.split ('\n');
    const masked = lines.map (maskLine);
    const signatures = [];
    for (let i = 0; i < masked.length; i++) {
        if (SIG_RE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) signatures.push (i);
    }
    let changed = false;
    for (let n = 0; n < signatures.length; n++) {
        const start = signatures[n];
        const end = (n + 1 < signatures.length) ? signatures[n + 1] : lines.length;
        const params = signatureParams (masked, start);
        const declarations = [];
        for (let i = start; i < end; i++) {
            const d = declarationOfLine (masked[i]);
            if (d !== undefined) declarations.push ({ line: i, name: d.name, type: d.type, value: d.value });
            const f = /\bfor[ ]*\([ ]*(int|uint|Int64|long|double)[ ]+([A-Za-z_]\w*)[ ]*=/.exec (masked[i]);
            if (f !== null) declarations.push ({ line: i, name: f[2], type: f[1], value: '', sameLine: true });
            const fe = /\bforeach[ ]*\([ ]*([A-Za-z_][\w<>?.,\[\]]*)[ ]+([A-Za-z_]\w*)[ ]+in\b/.exec (masked[i]);
            if ((fe !== null) && (numericKind (fe[1]) !== undefined)) declarations.push ({ line: i, name: fe[2], type: fe[1], value: '', sameLine: true });
            for (const l of masked[i].matchAll (/\(([^()]*)\)[ ]*=>/g)) {
                for (const part of l[1].split (',')) {
                    const pm = /^\s*([A-Za-z_][\w<>?.,\[\]]*)\s+([A-Za-z_]\w*)\s*$/.exec (part);
                    if ((pm !== null) && (numericKind (pm[1]) !== undefined)) declarations.push ({ line: i, name: pm[2], type: pm[1], value: '', sameLine: true });
                }
            }
        }
        const typeOf = (name, line) => {
            if (!/^[A-Za-z_]\w*$/.test (name)) return undefined;
            const all = declarations.filter ((d) => d.name === name);
            const types = [];
            for (const d of all) if (!types.includes (d.type)) types.push (d.type);
            if (types.length > 1) return undefined;
            const before = all.filter ((d) => (d.line < line) || ((d.sameLine === true) && (d.line === line)));
            if (before.length > 0) return before[before.length - 1].type;
            if (all.length > 0) return undefined;
            return params[name];
        };
        const region = { start, end, params, lines: masked, typeOf };
        for (let i = start + 1; i < end; i++) {
            const next = rewriteLine (region, lines[i], masked[i], i);
            if (next !== undefined) {
                lines[i] = next;
                masked[i] = maskLine (next);
                changed = true;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function hx10C05SelfTest () {
    const problems = [];
    const wrap = (body) => `namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object o, Int64? limit = null)\n    {\n${body}\n    }\n}\n`;
    const cases = [
        ['mathMin under an if-block guard', '        Int64? n = this.safeInteger(o, "n");\n        if ((n != null))\n        {\n            object v = mathMin(n, 100);\n        }', 'object v = Math.Min(n.Value, 100);'],
        ['mathMin in the guarded ternary arm', '        Int64? n = this.safeInteger(o, "n");\n        object v = ((n == null)) ? 100 : mathMin(n, 100);', 'object v = ((n == null)) ? 100 : Math.Min(n.Value, 100);'],
        ['mathMax on two Int64 names', '        Int64 a = this.milliseconds();\n        Int64 b = this.seconds();\n        Int64 c = mathMax(a, b);', 'Int64 c = Math.Max(a, b);'],
        ['mixed nullable / int name in a boxing position', '        Int64? n = this.safeInteger(o, "n");\n        int maxLimit = 1500;\n        if ((n != null))\n        {\n            object v = mathMin(n, maxLimit);\n        }', 'object v = Math.Min(n.Value, maxLimit);'],
        ['mod of two Int64 names', '        Int64 a = this.milliseconds();\n        Int64 b = this.seconds();\n        bool r = this.isRoundNumber(mod(a, b));', 'bool r = this.isRoundNumber((a % b));'],
        ['mod with a guarded-free Int64? operand', '        Int64? a = this.safeInteger(o, "a");\n        Int64 b = this.seconds();\n        object r = mod(1000, a);', 'object r = (1000 % a);'],
        ['comparison against a countguard', '        List<object> xs = this.stringToCharsArray("a");\n        for (Int64 i = 0; isLessThan(i, (xs?.Count ?? 0)); i++)\n        {\n        }', 'for (Int64 i = 0; (i < (xs?.Count ?? 0)); i++)'],
    ];
    const keeps = [
        ['unguarded Int64? mathMin', '        Int64? n = this.safeInteger(o, "n");\n        object v = mathMin(n, 100);', 'mathMin('],
        ['double mathMin', '        double d = this.parseToNumeric(1);\n        object v = mathMin(d, 100);', 'mathMin('],
        ['mixed int / Int64 names into an int sink', '        int a = 3;\n        Int64 b = this.seconds();\n        int v = mathMin(a, b);', 'mathMin('],
        ['mod with an object operand', '        object a = this.safeInteger(o, "a");\n        object v = mod(a, 1);', 'mod('],
        ['nullable left of <', '        Int64? n = this.safeInteger(o, "n");\n        bool b = isLessThan(n, 5);', 'isLessThan('],
        ['receiver position', '        Int64 a = this.seconds();\n        string s = mathMin(a, 5).ToString();', 'mathMin('],
    ];
    for (const [name, body, expected] of cases) {
        const out = hx10C05NativeCompareMath (wrap (body));
        if (!out.includes (expected)) problems.push (`hx10 C05 ${name}: ${out.slice (-320)}`);
        if (hx10C05NativeCompareMath (out) !== out) problems.push (`hx10 C05 ${name}: not idempotent`);
    }
    for (const [name, body, kept] of keeps) {
        const out = hx10C05NativeCompareMath (wrap (body));
        if (out.includes ('Math.') || (out.includes ('(a % b)')) || !out.includes (kept)) problems.push (`hx10 C05 keeps ${name}: ${out.slice (-320)}`);
    }
    return problems;
}
