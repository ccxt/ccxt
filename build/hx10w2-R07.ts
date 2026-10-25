// hx10 W2 R07 — `let` bindings typed from the initializer shape.
//
// Every local prints as `let mut X: Value = <init>;`. When the initializer
// pins the variant, X can hold the native payload instead — provided every
// later use in the same fn is one this pass prints natively, and every
// by-value expression slot re-boxes explicitly (a move on the last use).
// An unprovable site keeps the `Value` local exactly as the base printed it.

import { isMainEntry } from "./transpile.js";

type Rw = { start: number, end: number, text: string, g?: number };

const STR_LIT = String.raw`"(?:[^"\\]|\\.)*"`;

/** Blank string literals and line comments, same length as the input. */
function maskText(src: string): string {
    let out = '';
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') { out += ' '; i++; }
            continue;
        }
        if (c === '"') {
            out += ' '
            i++;
            while (i < src.length && src[i] !== '"') {
                if (src[i] === '\n') { out += '\n'; i++; continue; }
                if (src[i] === '\\') { out += '  '; i += 2; continue; }
                out += ' ';
                i++;
            }
            if (i < src.length) { out += ' '; i++; }
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

/** Index just past the `)` matching the `(` at `open`, or -1. */
function closeParen(masked: string, open: number): number {
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
        const c = masked[k];
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth === 0) return k + 1; }
    }
    return -1;
}

/** Index just past the delimiter closing the one at `open`, or -1. */
function closeAt(src: string, open: number): number {
    const openCh = src[open];
    const closeCh = openCh === '(' ? ')' : openCh === '[' ? ']' : '}';
    let depth = 0;
    for (let k = open; k < src.length; k++) {
        const c = src[k];
        if (c === openCh) depth++;
        else if (c === closeCh) { depth--; if (depth === 0) return k + 1; }
    }
    return -1;
}

/** Index just past the `}` matching the `{` at `open`, or -1. */
function closeBrace(masked: string, open: number): number {
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
        const c = masked[k];
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return k + 1; }
    }
    return -1;
}

/** End (index of `;`) of the statement starting at `from`, depth 0. */
function stmtEnd(masked: string, from: number): number {
    let depth = 0;
    for (let k = from; k < masked.length; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') { depth--; if (depth < 0) return -1; }
        else if (c === ';' && depth === 0) return k;
    }
    return -1;
}

/** Split top-level commas; undefined when the delimiters are unbalanced. */
function splitArgs(masked: string, from: number, to: number): string[] | undefined {
    const args: string[] = [];
    let depth = 0;
    let start = from;
    for (let k = from; k < to; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) { args.push(masked.slice(start, k)); start = k + 1; }
    }
    args.push(masked.slice(start, to));
    return args;
}

/** Innermost unclosed delimiter at each index, plus its opening index. */
function openerMap(masked: string): { kind: Uint8Array, at: Int32Array } {
    const kind = new Uint8Array(masked.length);
    const at = new Int32Array(masked.length).fill(-1);
    const stack: Array<{ kind: number, at: number }> = [];
    for (let i = 0; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(') stack.push({ kind: 1, at: i });
        else if (c === '[') stack.push({ kind: masked[i - 1] === '&' ? 3 : 2, at: i });
        else if (c === '{') stack.push({ kind: 4, at: i });
        else if (c === ')' || c === ']' || c === '}') { if (stack.length > 0) stack.pop(); }
        const top = stack[stack.length - 1];
        kind[i] = top === undefined ? 0 : top.kind;
        at[i] = top === undefined ? -1 : top.at;
    }
    return { kind, at };
}

const KEYWORDS = new Set(['if', 'while', 'match', 'return', 'for', 'in', 'else', 'loop', 'not']);

/** True when the identifier at `s` is a whole by-value expression slot. */
function valueSlot(masked: string, content: string, s: number, name: string, open: { kind: Uint8Array, at: Int32Array }): number {
    const kind = open.kind[s];
    if (kind !== 1 && kind !== 2 && kind !== 3) return 0;
    if (kind === 1) {
        const head = masked.slice(Math.max(0, open.at[s] - 40), open.at[s]);
        const word = /([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec(head);
        if (word === null || KEYWORDS.has(word[1])) return 0;
        // `Value::Str(..)` and friends are handled by `classify`.
        const ctor = /Value::([A-Za-z_][A-Za-z0-9_]*)\s*$/.exec(head);
        if (ctor !== null) return 0;
    }
    let k = s - 1;
    while (k >= 0 && /\s/.test(masked[k])) k--;
    if (masked[k] === '&' || masked[k] === '.' || masked[k] === '!') return 0;
    if (/\bmut\s+$/.test(masked.slice(Math.max(0, s - 8), s))) return 0;
    const after = content.slice(s + name.length);
    const m = /^(?:\.clone\(\))?\s*[,)\];]/.exec(after);
    if (m === null) return 0;
    return after.startsWith('.clone()') ? 2 : 1;
}

const FN_HEADER = /(?:^|\n)[ \t]*(?:pub(?:\([a-z]+\))? )?(?:async )?fn /g;

function fnRegions(masked: string): number[] {
    const heads: number[] = [0];
    for (const m of masked.matchAll(FN_HEADER)) heads.push((m.index as number) + 1);
    return heads;
}

type Shape = 'String' | 'Int' | 'Float' | 'Bool' | 'Vec' | 'Map';

const RUST_TYPE: Record<Shape, string> = {
    'String': 'String',
    'Int': 'i64',
    'Float': 'f64',
    'Bool': 'bool',
    'Vec': 'Vec<Value>',
    'Map': 'indexmap::IndexMap<String, Value>',
};

/** Box a native local back into a `Value` slot. */
function boxed(shape: Shape, expr: string): string {
    switch (shape) {
        case 'String': return `Value::str(${expr})`;
        case 'Int': return `Value::Int(${expr})`;
        case 'Float': return `Value::Float(${expr})`;
        case 'Bool': return `Value::Bool(${expr})`;
        case 'Vec': return `Value::Array(${expr})`;
        case 'Map': return `Value::Map(${expr})`;
    }
}

/** Initializer shape, or undefined when the variant is not pinned. */
function initShape(init: string): { shape: Shape, inner: string, wrapperEnd: number } | undefined {
    const pinned = (head: string, shape: Shape): { shape: Shape, inner: string, wrapperEnd: number } | undefined => {
        if (!init.startsWith(head)) return undefined;
        const open = head.length - 1;
        const close = closeAt(init, open);
        if (close < 0) return undefined;
        const inner = init.slice(open + 1, close - 1);
        if (inner.trim() === '' || inner.trim().startsWith('Value::')) return undefined;
        return { shape, inner, wrapperEnd: close };
    };
    for (const [head, shape] of [
        ['Value::Str(', 'String'],
        ['Value::Int(', 'Int'],
        ['Value::Float(', 'Float'],
        ['Value::Bool(', 'Bool'],
        ['Value::Map(', 'Map'],
    ] as Array<[string, Shape]>) {
        const hit = pinned(head, shape);
        if (hit !== undefined) return hit;
    }
    // `Value::Array(vec![..])` and friends hold the payload inside the `vec![]`.
    for (const head of ['Value::Array(', 'Value::List(', 'Value::from(']) {
        if (!init.startsWith(head)) continue;
        const close = closeAt(init, head.length - 1);
        if (close < 0) return undefined;
        const inner = init.slice(head.length, close - 1);
        if (!inner.startsWith('vec![') || closeAt(inner, 4) !== inner.length) return undefined;
        return { shape: 'Vec', inner, wrapperEnd: close };
    }
    if (init.startsWith('vec![')) {
        const close = closeAt(init, 4);
        if (close !== init.length) return undefined;
        return { shape: 'Vec', inner: init.slice(5, close - 1), wrapperEnd: close };
    }
    return undefined;
}

/** True when `x` is only ever read (never rebound or mutated elsewhere). */
function rebound(region: string, name: string): boolean {
    const n = name;
    const rx = new RegExp(
        `\\blet\\s+(?:mut\\s+)?${n}\\b|\\bfor\\s+(?:mut\\s+)?${n}\\b`
        + `|\\|\\s*(?:mut\\s+)?${n}\\s*[:|,]|\\blet\\s*\\([^)]*\\b${n}\\b`
        + `|\\b${n}\\s*@|\\b${n}\\b[^;\\n]*=>`);
    return rx.test(region);
}

type Ctx = {
    name: string,
    useStart: number,
    before: string,
    after: string,
};

/** Classify one use: rewrites for the use, or null when it cannot be proven. */
function classify(shape: Shape, ctx: Ctx, masked: string, content: string): Rw[] | null {
    const { name, useStart: s, before, after, opener } = ctx;
    const nameEnd = s + name.length;
    const boxStr = `&Value::Str\\(\\s*(${STR_LIT})\\s*(?:\\.into\\(\\)|\\.to_string\\(\\))?\\s*\\)`;
    const boxInt = `&Value::Int\\(\\s*(-?\\d+)\\s*\\)`;
    const boxFlt = `&Value::Float\\(\\s*(-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)\\s*\\)`;
    const boxNum = shape === 'Int' ? boxInt : boxFlt;
    const numeric = shape === 'Int' || shape === 'Float';

    const eqOp = (op: string, lit: string, len: number, prefix: string): Rw[] => {
        const start = s - prefix.length;
        return [{ start, end: nameEnd + len, text: `(${name} ${op} ${lit})` }];
    };

    // `is_equal(&X, &Value::<lit>)` and the ordered compares are native on the payload.
    if (shape === 'String' && before.endsWith('is_equal(&')) {
        const m = new RegExp(`^,\\s*${boxStr}\\)`).exec(after);
        if (m !== null) return eqOp('==', m[1], m[0].length, 'is_equal(&');
    }
    if (numeric && before.endsWith('is_equal(&')) {
        const m = new RegExp(`^,\\s*${boxNum}\\)`).exec(after);
        if (m !== null) return eqOp('==', m[1], m[0].length, 'is_equal(&');
    }
    if (numeric) {
        const cmp: Array<[string, string]> = [
            ['is_less_than(&', '<'],
            ['is_greater_than(&', '>'],
            ['is_less_than_or_equal(&', '<='],
            ['is_greater_than_or_equal(&', '>='],
        ];
        for (const [prefix, op] of cmp) {
            if (!before.endsWith(prefix)) continue;
            const m = new RegExp(`^,\\s*${boxNum}\\)`).exec(after);
            if (m !== null) return eqOp(op, m[1], m[0].length, prefix);
        }
    }
    // `to_string_val(&X)` is the identity on a `String` local.
    if (shape === 'String' && before.endsWith('to_string_val(&') && after.startsWith(')')) {
        return [{ start: s - 'to_string_val(&'.length, end: nameEnd + 1, text: `${name}.clone()` }];
    }
    // `ends_with` / `starts_with` on a literal are `str` methods.
    if (shape === 'String') {
        for (const [prefix, method] of [['ends_with(&', 'ends_with'], ['starts_with(&', 'starts_with']] as Array<[string, string]>) {
            if (!before.endsWith(prefix)) continue;
            const m = new RegExp(`^,\\s*${boxStr}\\)`).exec(after);
            if (m !== null) {
                const start = s - prefix.length;
                return [{ start, end: nameEnd + m[0].length, text: `${name}.${method}(${m[1]})` }];
            }
        }
    }
    // `is_true(&X)` — `is_true` is generic over `IsTruthy`.
    if (shape === 'Bool' && before.endsWith('is_true(&') && after.startsWith(')')) {
        return [{ start: s - 'is_true(&'.length, end: nameEnd + 1, text: name }];
    }
    // `X.as_bool() == Some(<lit>)` on a `bool` local.
    if (shape === 'Bool') {
        const m = /^\.as_bool\(\)\s*(==|!=)\s*Some\((true|false)\)/.exec(after);
        if (m !== null) {
            const eq = m[1] === '==';
            const positive = m[2] === 'true';
            return [{ start: s, end: nameEnd + m[0].length, text: (eq === positive) ? name : `!${name}` }];
        }
    }
    // `get_array_length(&X)` on a plain `Vec<Value>` is its `len()`.
    if (shape === 'Vec' && before.endsWith('get_array_length(&') && after.startsWith(')')) {
        return [{ start: s - 'get_array_length(&'.length, end: nameEnd + 1, text: `Value::Int(${name}.len() as i64)` }];
    }
    // `append_to_array(&mut X, V)` -> `X.push(V)`.
    if (shape === 'Vec' && before.endsWith('append_to_array(&mut ') && after.startsWith(',')) {
        const open = s - '(&mut '.length;
        const close = closeParen(masked, open);
        if (close > 0) {
            const args = splitArgs(masked, open + 1, close - 1);
            if (args !== undefined && args.length === 2) {
                const val = content.slice(open + 1 + args[0].length + 1, close - 1).trim();
                return [{ start: open - 'append_to_array'.length, end: close, text: `${name}.push(${val})` }];
            }
        }
    }
    // The Arr-only push marker `if let Value::Arr(__a) = &mut X { ..push(v) }`.
    if (shape === 'Vec' && before.endsWith('= &mut ')) {
        const varM = /if let Value::Arr\((\w+)\) = &mut $/.exec(before);
        if (varM !== null) {
            const stmtStart = s - varM[0].length;
            const brace = masked.indexOf('{', nameEnd);
            const close = brace < 0 ? -1 : closeBrace(masked, brace);
            const head = `std::sync::Arc::make_mut(${varM[1]}).push(`;
            if (close > 0) {
                const rel = masked.slice(brace + 1, close - 1).indexOf(head);
                if (rel >= 0) {
                    const pushOpen = brace + 1 + rel + head.length - 1;
                    const pushClose = closeParen(masked, pushOpen);
                    if (pushClose > 0) {
                        const val = content.slice(pushOpen + 1, pushClose - 1).trim();
                        return [{ start: stmtStart, end: close, text: `${name}.push(${val});` }];
                    }
                }
            }
        }
    }
    // Map reads/writes on a literal dict: no marker routing can trigger here.
    if (shape === 'Map' && before.endsWith('get_value(&')) {
        const m = new RegExp(`^,\\s*${boxStr}\\)`).exec(after);
        if (m !== null) {
            const start = s - 'get_value(&'.length;
            return [{ start, end: nameEnd + m[0].length, text: `${name}.get(${m[1]}).cloned().unwrap_or(Value::Null)` }];
        }
    }
    if (shape === 'Map' && before.endsWith('in_op(&')) {
        const m = new RegExp(`^,\\s*${boxStr}\\)`).exec(after);
        if (m !== null) {
            const start = s - 'in_op(&'.length;
            return [{ start, end: nameEnd + m[0].length, text: `${name}.contains_key(${m[1]})` }];
        }
    }
    if (shape === 'Map' && before.endsWith('add_element_to_object(&mut ')) {
        const m = new RegExp(`^,\\s*${boxStr}\\s*,`).exec(after);
        if (m !== null) {
            const open = s - '(&mut '.length;
            const close = closeParen(masked, open);
            if (close > 0) {
                const args = splitArgs(masked, open + 1, close - 1);
                if (args !== undefined && args.length === 3) {
                    const val = content.slice(open + 1 + args[0].length + 1 + args[1].length + 1, close - 1).trim();
                    return [{ start: open - 'add_element_to_object'.length, end: close, text: `${name}.insert(${m[1]}.to_string(), ${val})` }];
                }
            }
        }
    }
    // Re-boxing into a `Value` slot: the constructor takes the native payload.
    if (before.endsWith('Value::Str(') && shape === 'String') {
        if (after.startsWith(')') || after.startsWith('.clone())')) {
            return [{ start: s - 'Value::Str'.length, end: s - 1, text: 'Value::str' }];
        }
    }
    // Already-native reads/writes and payload constructors.
    const nativeMethod = /^\.(?:len|is_empty|push|insert|contains_key|get|keys|values|iter|first|last)\(/.exec(after);
    if (nativeMethod !== null && (shape === 'Vec' || shape === 'Map')) return [];
    if (shape === 'Int' && /^\.as_i64\(\)/.test(after)) return null;
    if (before.endsWith('Value::Int(') && shape === 'Int' && after.startsWith(')')) return [];
    if (before.endsWith('Value::Float(') && shape === 'Float' && after.startsWith(')')) return [];
    if (before.endsWith('Value::Bool(') && shape === 'Bool' && after.startsWith(')')) return [];
    if ((before.endsWith('Value::Array(') || before.endsWith('Value::List(')) && shape === 'Vec' && after.startsWith(')')) return [];
    if (before.endsWith('Value::Map(') && shape === 'Map' && after.startsWith(')')) return [];
    if (before.endsWith('Value::from(') && after.startsWith(')')) return [];
    return null;
}

/** Source text of the header that owns the block opening at `open`. */
function blockHeader(masked: string, from: number, open: number): string {
    let i = open - 1;
    let depth = 0;
    while (i >= from) {
        const c = masked[i];
        if (c === ')' || c === ']' || c === '}') depth++;
        else if (c === '(' || c === '[' || c === '{') {
            if (depth === 0) break;
            depth--;
        } else if (c === ';' && depth === 0) break;
        i--;
    }
    return masked.slice(i + 1, open);
}

/** True when `pos` sits inside a loop body or a closure (re-runnable). */
function inRepeatedBlock(masked: string, from: number, pos: number): boolean {
    const stack: number[] = [];
    for (let k = from; k < pos; k++) {
        const c = masked[k];
        if (c === '{') stack.push(k);
        else if (c === '}' && stack.length > 0) stack.pop();
    }
    for (const open of stack) {
        const head = blockHeader(masked, from, open);
        if (/\b(for|while|loop)\b/.test(head)) return true;
        if (/\|[^|]*\|/.test(head)) return true;
        if (/\bmove\s*$/.test(head)) return true;
    }
    return false;
}

/** True when the use is a whole-statement `X = <init>;` re-assignment. */
function assignRewrite(shape: Shape, name: string, s: number, after: string, content: string, masked: string): Rw[] | null {
    const m = /^\s*=\s*/.exec(after);
    if (m === null) return null;
    const rhsStart = s + name.length + m[0].length;
    const end = stmtEnd(masked, rhsStart);
    if (end < 0) return null;
    const rhs = content.slice(rhsStart, end).trim();
    const heads: Record<Shape, string[]> = {
        'String': ['Value::Str('],
        'Int': ['Value::Int('],
        'Float': ['Value::Float('],
        'Bool': ['Value::Bool('],
        'Vec': ['Value::Array(vec![', 'Value::List(vec![', 'Value::from(vec![', 'vec!['],
        'Map': ['Value::Map('],
    };
    const head = heads[shape].find(h => rhs.startsWith(h));
    if (head === undefined) return null;
    const close = closeParen(rhs, head.length - 1);
    if (close < 0 || close !== rhs.length) return null;
    const inner = rhs.slice(head.length, close - 1);
    if (inner.trim() === '' || inner.trim().startsWith('Value::')) return null;
    return [{ start: rhsStart, end, text: inner }];
}

/** Type the `Value` locals whose initializer pins the variant and whose every use is native. */
export function r07TypedLocals(content: string): string {
    if (!content.includes(': Value = ')) return content;
    const masked = maskText(content);
    const openers = openerMap(masked);
    const anyOpen = openers.kind;
    const atOpen = openers;
    const heads = fnRegions(masked);
    const rewrites: Rw[] = [];
    let group = 0;
    const declRe = /^([ \t]*)let mut ([a-zA-Z_][a-zA-Z0-9_]*): Value = /gm;
    let m: RegExpExecArray | null;
    while ((m = declRe.exec(content)) !== null) {
        const name = m[2];
        const declStart = m.index;
        const initStart = declStart + m[0].length;
        const end = stmtEnd(masked, initStart);
        if (end < 0) continue;
        const rawInit = content.slice(initStart, end);
        const lead = rawInit.length - rawInit.trimStart().length;
        const init = rawInit.trim();
        const parsed = initShape(init);
        if (parsed === undefined) { continue; }
        const { shape } = parsed;
        // The wrapper has to span the whole initializer.
        if (parsed.wrapperEnd !== init.length) { continue; }
        if (shape === 'Float' && /^-?\d+$/.test(parsed.inner)) continue;
        let lo = 0;
        for (let h = 0; h < heads.length; h++) if (heads[h] <= declStart) lo = h;
        const regionStart = heads[lo];
        const regionEnd = lo + 1 < heads.length ? heads[lo + 1] : content.length;
        const region = masked.slice(end, regionEnd);
        if (rebound(region, name)) continue;
        const useRe = new RegExp(`(?<![A-Za-z0-9_.])${name}(?![A-Za-z0-9_])`, 'g');
        const uses: Rw[] = [];
        const boxes: Array<{ pos: number, tail: number, move: boolean }> = [];
        let ok = true;
        let gained = 0;
        let lastUse = -1;
        let u: RegExpExecArray | null;
        while ((u = useRe.exec(region)) !== null) {
            const s = end + u.index;
            const before = content.slice(Math.max(regionStart, s - 60), s);
            const after = content.slice(s + name.length, s + name.length + 90);
            lastUse = s;
            // A by-value expression slot is `Value` by construction; re-box there.
            const slot = valueSlot(masked, content, s, name, atOpen);
            if (slot > 0) {
                const dotClone = after.startsWith('.clone()') ? '.clone()'.length : 0;
                boxes.push({ pos: s, tail: dotClone, move: slot === 1 });
                continue;
            }
            const ctx: Ctx = { name, useStart: s, before, after };
            const rw = classify(shape, ctx, masked, content);
            if (rw !== null && rw.length > 0) gained++;
            if (rw === null) {
                const asg = assignRewrite(shape, name, s, after, content, masked);
                if (asg === null) { ok = false; break; }
                uses.push(...asg);
                continue;
            }
            uses.push(...rw);
        }
        if (!ok) continue;
        // Re-boxing alone is churn: require one use the native type shortens.
        if (gained === 0) continue;
        // A move needs the final, non re-runnable use; a by-value source cannot gain a clone.
        for (const b of boxes) {
            const canMove = b.pos === lastUse && !inRepeatedBlock(masked, regionStart, b.pos);
            // A `Value` clone of a Dict/Arr is a refcount bump; deep-copying the
            // native container instead would cost more, so those keep `Value`.
            const collection = shape === 'Vec' || shape === 'Map';
            if (!canMove && (b.tail === 0 || collection)) { ok = false; break; }
            const expr = canMove ? name : `${name}.clone()`;
            uses.push({ start: b.pos, end: b.pos + name.length + b.tail, text: boxed(shape, expr) });
        }
        if (!ok) continue;
        // A statement-level rewrite would clobber a nested one: keep the base.
        for (const a of uses) {
            for (const b of uses) {
                if (a !== b && a.start <= b.start && b.end < a.end) { ok = false; break; }
            }
            if (!ok) break;
        }
        if (!ok) continue;
        // Never push a line that was under the 400-char report threshold over it.
        const growth = new Map<number, number>();
        const lineOf = (pos: number): number => content.lastIndexOf('\n', pos) + 1;
        for (const rw of uses) {
            const lineStart = lineOf(rw.start);
            if (lineOf(rw.end) !== lineStart) continue;
            const lineEnd = content.indexOf('\n', lineStart);
            const len = (lineEnd < 0 ? content.length : lineEnd) - lineStart;
            const next = (growth.get(lineStart) ?? 0) + rw.text.length - (rw.end - rw.start);
            growth.set(lineStart, next);
            if (len + next > 400 && len <= 400) { ok = false; break; }
        }
        if (!ok) continue;
        const typeAt = declStart + m[0].indexOf(': Value') + 2;
        const exprAt = initStart + lead;
        const g = group++;
        rewrites.push({ start: typeAt, end: typeAt + 5, text: RUST_TYPE[shape], g });
        rewrites.push({ start: exprAt, end: exprAt + parsed.wrapperEnd, text: parsed.inner, g });
        for (const u of uses) rewrites.push({ ...u, g });
    }
    if (rewrites.length === 0) return content;
    // Two locals can overlap (one nested in the other's rewritten call): drop
    // both groups rather than splice a half-rewritten expression.
    const sorted = [...rewrites].sort((a, b) => a.start - b.start || a.end - b.end);
    const dirty = new Set<number>();
    const active: Rw[] = [];
    for (const r of sorted) {
        for (let i = active.length - 1; i >= 0; i--) if (active[i].end <= r.start) active.splice(i, 1);
        for (const a of active) {
            if (a.g !== r.g) { dirty.add(a.g as number); dirty.add(r.g as number); }
        }
        active.push(r);
    }
    rewrites.sort((a, b) => a.start - b.start || a.end - b.end);
    let out = '';
    let last = 0;
    for (const r of rewrites) {
        if (dirty.has(r.g as number)) continue;
        if (r.start < last) continue;
        out += content.slice(last, r.start) + r.text;
        last = r.end;
    }
    out += content.slice(last);
    return out;
}

/** One case per rule; each one fails on the base generator (no such pass). */
export function r07SelfTest(): string[] {
    const cases: Array<[string, string, string]> = [
        [
            'string-equal-and-move-box',
            'fn f() {\n    let mut s: Value = Value::Str(format!("a{}", b));\n    if is_equal(&s, &Value::Str("ab".into())) {\n        self.watch(&[s.clone()]);\n    }\n}\n',
            'fn f() {\n    let mut s: String = format!("a{}", b);\n    if (s == "ab") {\n        self.watch(&[Value::str(s)]);\n    }\n}\n',
        ],
        [
            'string-arg-clone-box',
            'fn f() {\n    let mut s: Value = Value::Str("ab".into());\n    let first: Value = self.use_it(s.clone());\n    if is_equal(&s, &Value::Str("ab".into())) {\n        return;\n    }\n}\n',
            'fn f() {\n    let mut s: String = "ab".into();\n    let first: Value = self.use_it(Value::str(s.clone()));\n    if (s == "ab") {\n        return;\n    }\n}\n',
        ],
        [
            'int-compare',
            'fn f() {\n    let mut n: Value = Value::Int(2);\n    if is_less_than(&n, &Value::Int(3)) {\n        n = Value::Int(4);\n    }\n}\n',
            'fn f() {\n    let mut n: i64 = 2;\n    if (n < 3) {\n        n = 4;\n    }\n}\n',
        ],
        [
            'bool-truthy',
            'fn f() {\n    let mut b: Value = Value::Bool(false);\n    if is_true(&b) {\n        b = Value::Bool(true);\n    }\n}\n',
            'fn f() {\n    let mut b: bool = false;\n    if b {\n        b = true;\n    }\n}\n',
        ],
        [
            'vec-len-and-push',
            'fn f() {\n    let mut xs: Value = Value::from(vec![]);\n    if let Value::Arr(__a_1) = &mut xs { std::sync::Arc::make_mut(__a_1).push(one()); }\n    append_to_array(&mut xs, two());\n    let n: Value = get_array_length(&xs);\n}\n',
            'fn f() {\n    let mut xs: Vec<Value> = vec![];\n    xs.push(one());\n    xs.push(two());\n    let n: Value = Value::Int(xs.len() as i64);\n}\n',
        ],
        [
            'map-reads-and-writes',
            'fn f() {\n    let mut d: Value = Value::Map({\n        let mut m = indexmap::IndexMap::new();\n        m\n    });\n    add_element_to_object(&mut d, &Value::Str("k".into()), v);\n    if in_op(&d, &Value::Str("k".into())) {\n        let x: Value = get_value(&d, &Value::Str("k".into()));\n    }\n}\n',
            'fn f() {\n    let mut d: indexmap::IndexMap<String, Value> = {\n        let mut m = indexmap::IndexMap::new();\n        m\n    };\n    d.insert("k".to_string(), v);\n    if d.contains_key("k") {\n        let x: Value = d.get("k").cloned().unwrap_or(Value::Null);\n    }\n}\n',
        ],
        [
            'unproven-use-keeps-value',
            'fn f() {\n    let mut s: Value = Value::Str("a".into());\n    self.sign(s.clone());\n}\n',
            'fn f() {\n    let mut s: Value = Value::Str("a".into());\n    self.sign(s.clone());\n}\n',
        ],
    ];
    const fails: string[] = [];
    for (const [label, src, want] of cases) {
        const got = r07TypedLocals(src);
        if (got !== want) fails.push(`${label}: got\n${got}\nwant\n${want}`);
    }
    return fails;
}

if (isMainEntry(import.meta.url) && process.argv.includes('--self-test')) {
    const fails = r07SelfTest();
    if (fails.length > 0) {
        console.error(fails.join('\n\n'));
        process.exit(1);
    }
    console.log('hx10w2-R07 self-test ok');
}
