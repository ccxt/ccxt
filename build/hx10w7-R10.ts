// ===== hx10w7 R10 — typed ws `ClientHandle` views in generated Rust =====
// Post-pass over emitted Rust text. Inside a venue method that takes the ws
// `client: Value` param, a read of one of the four handle fields
//   `get_value(&client, &Value::Str("subscriptions".into()))`
// becomes a read of the typed handle the drive loop owns:
//   `__ch.subscriptions.clone()`
// where the method's first statement binds
//   `let __ch = crate::pro::ws_client::ClientHandle::from_value(client.clone());`
// The handle stores exactly what `get_value` would return for that key, so the
// clone is the same value the helper produced. A key the method *writes*
// through (`&mut get_value(&client, …)`) is left alone for the whole method:
// the helper mutates a throwaway snapshot, a field would persist the write and
// change what a later read in the same method sees.

const R10_KEYS = ['subscriptions', 'futures', 'rejections', 'url'];
const R10_MAX_LINE = 400; // the generated tree's long-line budget
const R10_HANDLE = 'crate::pro::ws_client::ClientHandle';

/** Blank out comments and string bodies, keeping every index in place. */
export function r10Mask(src: string): string {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            while (i < n && src[i] !== '\n') { out += ' '; i++; }
            continue;
        }
        // Block comment (the generated files carry JS doc comments verbatim).
        if (c === '/' && src[i + 1] === '*') {
            out += '  ';
            i += 2;
            while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
                out += src[i] === '\n' ? '\n' : ' ';
                i++;
            }
            if (i < n) { out += '  '; i += 2; }
            continue;
        }
        if (c === '"') {
            out += '"';
            i++;
            while (i < n && src[i] !== '"') {
                if (src[i] === '\\') { out += '  '; i += 2; continue; }
                out += src[i] === '\n' ? '\n' : ' ';
                i++;
            }
            if (i < n) { out += '"'; i++; }
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

/** `[start, end)` of every top-level `pub fn` body plus its header text. */
export function r10FnBodies(masked: string): Array<{ fnStart: number, open: number, close: number, header: string }> {
    const out: Array<{ fnStart: number, open: number, close: number, header: string }> = [];
    const rx = /\bpub\s+(?:async\s+)?fn\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = rx.exec(masked)) !== null) {
        const open = masked.indexOf('{', m.index);
        if (open < 0) break;
        // A `;` between the signature and the `{` means this is a trait decl.
        if (masked.slice(m.index, open).includes(';')) continue;
        let depth = 1;
        let j = open + 1;
        while (j < masked.length && depth > 0) {
            const c = masked[j];
            if (c === '"') {
                j++;
                while (j < masked.length && masked[j] !== '"') { j += masked[j] === '\\' ? 2 : 1; }
            } else if (c === '{') depth++;
            else if (c === '}') depth--;
            if (depth === 0) break;
            j++;
        }
        if (depth !== 0) break;
        out.push({ fnStart: m.index, open, close: j, header: masked.slice(m.index, open) });
        rx.lastIndex = j;
    }
    return out;
}

/** Brace depth of `masked` at `idx` (0 = fn-body top level). */
function r10DepthAt(masked: string, idx: number): number {
    let d = 0;
    for (let i = 0; i < idx; i++) {
        if (masked[i] === '{') d++;
        else if (masked[i] === '}') d--;
    }
    return d;
}

/** Index just past the `;` that ends the statement starting at `from`, or -1. */
function r10StatementEnd(masked: string, from: number): number {
    let paren = 0, bracket = 0, brace = 0;
    for (let i = from; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(') paren++;
        else if (c === ')') paren--;
        else if (c === '[') bracket++;
        else if (c === ']') bracket--;
        else if (c === '{') brace++;
        else if (c === '}') brace--;
        else if (c === ';' && paren === 0 && bracket === 0 && brace === 0) return i + 1;
    }
    return -1;
}

/**
 * `let mut client: Value = self.client(...)` at fn-body top level: the index
 * just past its `;`. Two declarations in one body, one nested in a block, or a
 * body that rebinds `client` later all leave the method a plain `Value`.
 */
function r10LocalClientDecl(bodyMask: string): { start: number, end: number } | null {
    const rx = /let\s+mut\s+client\s*:\s*Value\s*=/g;
    let m: RegExpExecArray | null;
    let found: { start: number, end: number } | null = null;
    while ((m = rx.exec(bodyMask)) !== null) {
        if (found !== null) return null;
        if (r10DepthAt(bodyMask, m.index) !== 0) return null;
        const end = r10StatementEnd(bodyMask, m.index);
        if (end < 0) return null;
        found = { start: m.index, end };
    }
    return found;
}

export function r10ClientHandleMasked(content: string): string {
    if (!content.includes('&client')) return content;
    const masked = r10Mask(content);
    const bodies = r10FnBodies(masked);
    // Edits are applied right-to-left so earlier indices stay valid.
    const edits: Array<{ at: number, del: number, text: string }> = [];
    for (const b of bodies) {
        const bodyText = content.slice(b.open + 1, b.close);
        const bodyMask = masked.slice(b.open + 1, b.close);
        let scopeStart = 0;   // first index in the body the handle is in scope at
        let insertAt = b.open + 1;
        if (/\bclient\s*:\s*Value\b/.test(b.header)) {
            // A reassigned or re-let `client` no longer names the param the handle was built from.
            if (/(?<![\w.])client\s*=[^=]/.test(bodyMask)) continue;
            if (/\blet\s+(?:mut\s+)?client\b/.test(bodyMask)) continue;
        } else {
            // `let mut client: Value = self.client(...)` — the venue builds a
            // handle for its own subscription; bind the view right after it.
            const decl = r10LocalClientDecl(bodyMask);
            if (decl === null) continue;
            scopeStart = decl.end;
            insertAt = b.open + 1 + decl.end;
            if (/(?<![\w.])client\s*=[^=]/.test(bodyMask.slice(decl.end))) continue;
        }
        let needsMut = false;
        const perKey: Array<{ at: number, del: number, text: string }> = [];
        for (const key of R10_KEYS) {
            // Pipeline text carries the allocating literal spelling
            // (`Value::Str("k".to_string())`); the borrow form is restored only
            // at write time, so both spellings must match here.
            const rx = new RegExp('get_value\\(\\s*&client\\s*,\\s*&Value::Str\\("' + key + '"\\.(?:into|to_string)\\(\\)\\)\\s*\\)', 'g');
            const reads: RegExpExecArray[] = [];
            const writes: RegExpExecArray[] = [];
            let m: RegExpExecArray | null;
            while ((m = rx.exec(bodyText)) !== null) {
                if (m.index < scopeStart) continue;
                const before = bodyMask.slice(Math.max(0, m.index - 12), m.index);
                (/(?<![\w.])&mut\s*$/.test(before) ? writes : reads).push(m);
            }
            if (reads.length === 0 && writes.length === 0) continue;
            // A read after the first write would see the field's mutation where
            // the helper saw a fresh snapshot: keep those (and only those) calls.
            const firstWrite = writes.length > 0 ? writes[0].index : Number.MAX_SAFE_INTEGER;
            for (const h of reads) {
                if (h.index >= firstWrite) continue;
                if (bodyMask[h.index] === ' ') continue; // inside a comment
                perKey.push({ at: b.open + 1 + h.index, del: h[0].length, text: '__ch.' + key + '.clone()' });
            }
            for (const h of writes) {
                if (bodyMask[h.index] === ' ') continue;
                needsMut = true;
                perKey.push({ at: b.open + 1 + h.index, del: h[0].length, text: '__ch.' + key });
            }
        }
        if (perKey.length === 0) continue;
        edits.push(...perKey);
        const firstNl = bodyText.indexOf('\n');
        const indent = insertAt === b.open + 1
            ? (firstNl < 0
                ? '        '
                : (bodyText.slice(firstNl + 1).match(/^[ ]*/) ?? '        ')[0] || '        ')
            : (bodyText.slice(bodyText.lastIndexOf('\n', insertAt - b.open - 2) + 1).match(/^[ ]*/) ?? [''])[0];
        edits.push({
            at: insertAt,
            del: 0,
            text: '\n' + indent + 'let ' + (needsMut ? 'mut ' : '') + '__ch = ' + R10_HANDLE + '::from_value(client.clone());',
        });
    }
    if (edits.length === 0) return content;
    edits.sort((x, y) => y.at - x.at);
    let out = content;
    for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.at + e.del);
    return out;
}

/**
 * Same rewrite, driven by line structure instead of a masked character walk.
 * A method starts on a `pub fn …(` line that sits directly inside an `impl`
 * block, and ends where the brace depth returns to that level; brace counting
 * skips comment and string spans per line.
 */
export function r10ClientHandle(content: string): string {
    if (!content.includes('&client')) return content;
    const lines = content.split('\n');
    const braces = r10BraceDeltas(content).split('\n');
    const out: string[] = [];
    let depth = 0;
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const startsMethod = depth === 1 && /^\s*pub\s+(?:async\s+)?fn\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(line);
        if (!startsMethod) {
            out.push(line);
            depth += r10DeltaAt(braces, i);
            i++;
            continue;
        }
        let j = i;
        let level = depth;
        while (j < lines.length) {
            level += r10DeltaAt(braces, j);
            if (j > i && level <= depth) break;
            j++;
        }
        if (j >= lines.length) { out.push(line); depth += r10DeltaAt(braces, i); i++; continue; }
        out.push(...r10Block(lines.slice(i, j + 1)));
        for (let k = i; k <= j; k++) depth += r10DeltaAt(braces, k);
        i = j + 1;
    }
    return out.join('\n');
}

/** The masked text (comments, strings, char literals blanked) for structure. */
function r10BraceDeltas(content: string): string {
    return r10Mask(content);
}

/** Brace delta of one line of the masked text. */
function r10DeltaAt(maskedLines: string[], idx: number): number {
    const line = maskedLines[idx] ?? '';
    let d = 0;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '{') d++;
        else if (c === '}') d--;
    }
    return d;
}

const R10_LET_CLIENT = /^ {8}let mut client: Value = /;
const R10_REASSIGN = /^\s*client\s*=[^=]/;
const R10_COMMENT = /^\s*(?:\/\/|\/\*|\*)/;

/** One method block (header + body + closing `    }`). */
function r10Block(block: string[]): string[] {
    const header = block[0];
    const fromParam = /\bclient\s*:\s*Value\b/.test(header);
    let anchor: number;      // binding line goes right after this index
    let bodyStart: number;   // first body line the handle is in scope for
    if (fromParam) {
        if (/\blet\s+(?:mut\s+)?client\b/.test(block.join('\n'))) return block;
        anchor = 0;
        bodyStart = 1;
    } else {
        const decls: number[] = [];
        for (let k = 1; k < block.length; k++) if (R10_LET_CLIENT.test(block[k])) decls.push(k);
        if (decls.length !== 1) return block; // none, or two handles in one method
        anchor = decls[0];
        bodyStart = anchor + 1;
    }
    for (let k = bodyStart; k < block.length; k++) if (R10_REASSIGN.test(block[k])) return block;

    // Occurrence map per key, then one order-aware decision per key.
    const rewritten = new Map<number, string[]>();
    let needsMut = false;
    let touched = false;
    for (const key of R10_KEYS) {
        // Pipeline text carries the allocating literal spelling
        // (`Value::Str("k".to_string())`); the borrow form is restored only at
        // write time, so both spellings must match here.
        const rx = new RegExp('get_value\\(\\s*&client\\s*,\\s*&Value::Str\\("' + key + '"\\.(?:into|to_string)\\(\\)\\)\\s*\\)', 'g');
        const reads: Array<{ line: number, col: number, len: number }> = [];
        const writes: Array<{ line: number, col: number, len: number }> = [];
        for (let k = bodyStart; k < block.length; k++) {
            const text = block[k];
            if (R10_COMMENT.test(text)) continue;
            rx.lastIndex = 0;
            let m: RegExpExecArray | null;
            while ((m = rx.exec(text)) !== null) {
                const before = text.slice(Math.max(0, m.index - 8), m.index);
                (/(?<![\w.])&mut\s*$/.test(before) ? writes : reads).push({ line: k, col: m.index, len: m[0].length });
            }
        }
        if (reads.length === 0 && writes.length === 0) continue;
        // A read after the first write would observe the field's mutation where
        // the helper read a fresh snapshot: those stay helper calls.
        const firstWriteLine = writes.length > 0 ? writes[0].line : Number.MAX_SAFE_INTEGER;
        for (const r of reads) {
            if (r.line >= firstWriteLine) continue;
            if (!rewritten.has(r.line)) rewritten.set(r.line, []);
            rewritten.get(r.line)!.push(...r10Span(r.col, r.len, '__ch.' + key + '.clone()'));
            touched = true;
        }
        for (const w of writes) {
            if (!rewritten.has(w.line)) rewritten.set(w.line, []);
            rewritten.get(w.line)!.push(...r10Span(w.col, w.len, '__ch.' + key));
            needsMut = true;
            touched = true;
        }
    }
    if (!touched) return block;
    const binding = '        let ' + (needsMut ? 'mut ' : '') + '__ch = ' + R10_HANDLE + '::from_value(client.clone());';
    const result: string[] = [];
    for (let k = 0; k < block.length; k++) {
        const spans = rewritten.get(k);
        result.push(spans === undefined ? block[k] : r10Apply(block[k], spans));
        if (k === anchor) result.push(binding);
    }
    return result;
}

/** A replacement span encoded as `col:length:text`, kept sortable per line. */
function r10Span(col: number, len: number, text: string): string[] {
    return [col + ':' + len + ':' + text];
}

/** Apply `col:length:text` spans (rightmost first) to one line. */
function r10Apply(line: string, spans: string[]): string {
    const parsed = spans.map((s) => {
        const first = s.indexOf(':');
        const second = s.indexOf(':', first + 1);
        return { col: Number(s.slice(0, first)), len: Number(s.slice(first + 1, second)), text: s.slice(second + 1) };
    }).sort((a, b) => b.col - a.col);
    let out = line;
    for (const p of parsed) out = out.slice(0, p.col) + p.text + out.slice(p.col + p.len);
    return out;
}

export function r10SelfTest(): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, what: string) => { if (!c) problems.push('hx10w7 R10: ' + what); };
    const head = '// PLEASE DO NOT EDIT THIS FILE\n';
    const wrap = (body: string, params = '&mut self, mut client: Value, mut message: Value') =>
        head + 'impl X {\n    pub fn handle_message(' + params + ') {\n' + body + '\n    }\n}\n';
    const read = (k: string) => `        let mut v: Value = get_value(&client, &Value::Str("${k}".into()));`;

    // 1. read on subscriptions goes through the handle
    const one = r10ClientHandle(wrap(read('subscriptions')));
    ok(one.includes('let __ch = ' + R10_HANDLE + '::from_value(client.clone());'), 'binds the handle: ' + one);
    ok(one.includes('__ch.subscriptions.clone()'), 'field read: ' + one);
    ok(!one.includes('get_value(&client'), 'helper call gone: ' + one);

    // 2. a read *after* a write of the same key keeps the helper (the field is
    //    mutated by then); a read before the write is safe to type
    const write = r10ClientHandle(wrap('        remove(&mut get_value(&client, &Value::Str("subscriptions".into())), &hash);\n' + read('subscriptions')));
    ok(write.includes('remove(&mut __ch.subscriptions, &hash);'), 'write goes native: ' + write);
    ok(write.includes('let mut v: Value = get_value(&client, &Value::Str("subscriptions".into()));'), 'same-key read after the write kept: ' + write);
    const readFirst = r10ClientHandle(wrap(read('subscriptions') + '\n        remove(&mut get_value(&client, &Value::Str("subscriptions".into())), &hash);'));
    ok(readFirst.includes('__ch.subscriptions.clone()'), 'earlier read typed: ' + readFirst);
    ok(readFirst.includes('remove(&mut __ch.subscriptions, &hash);'), 'later write typed: ' + readFirst);

    // 3. writes on one key do not stop reads of another; a write-only key goes native
    const split = r10ClientHandle(wrap('        remove(&mut get_value(&client, &Value::Str("futures".into())), &hash);\n' + read('subscriptions')));
    ok(split.includes('__ch.subscriptions.clone()'), 'other key still typed: ' + split);
    ok(split.includes('remove(&mut __ch.futures, &hash);'), 'write-only key typed: ' + split);
    ok(split.includes('let mut __ch = '), 'write site binds __ch mut: ' + split);
    ok(!split.includes('get_value(&client'), 'no client helper left: ' + split);

    // 4. no client param -> untouched
    const noParam = wrap(read('subscriptions'), '&mut self, mut message: Value');
    ok(r10ClientHandle(noParam) === noParam, 'no client param untouched');

    // 5. other receivers, nested keys and comments are untouched
    const other = wrap('        let mut v: Value = get_value(&self.options, &Value::Str("subscriptions".into()));');
    ok(r10ClientHandle(other) === other, 'other receiver untouched');
    const comment = wrap('        // get_value(&client, &Value::Str("subscriptions".into())) is the old read\n        let mut v: Value = Value::Null;');
    ok(r10ClientHandle(comment) === comment, 'comment untouched');

    // 6. a reassigned `client` keeps every site a helper call
    const reassigned = wrap(read('subscriptions') + '\n        client = Value::Null;');
    ok(r10ClientHandle(reassigned) === reassigned, 'reassigned client untouched');

    // 6b. `client` built by the venue (`self.client(url)`) is a handle too
    const localBody = '        let mut client: Value = self.client(&[url.clone()]);\n' + read('subscriptions');
    const local = r10ClientHandle(wrap(localBody, '&mut self, mut url: Value'));
    ok(local.includes('self.client(&[url.clone()]);\n        let __ch = ' + R10_HANDLE), 'binding follows the local decl: ' + local);
    ok(local.includes('__ch.subscriptions.clone()'), 'local client typed: ' + local);
    ok(local.indexOf('let __ch') > local.indexOf('self.client('), 'binding is after the decl: ' + local);
    // ... but a declaration nested in a block, or a second one, is left alone
    const nestedBody = '        if (is_true(&flag)) {\n            let mut client: Value = self.client(&[url.clone()]);\n' + read('subscriptions') + '\n        }';
    const nested = r10ClientHandle(wrap(nestedBody, '&mut self, mut url: Value'));
    ok(nested === wrap(nestedBody, '&mut self, mut url: Value'), 'nested decl untouched');
    const twoDecls = '        let mut client: Value = self.client(&[url.clone()]);\n        let mut client: Value = self.client(&[other.clone()]);\n' + read('subscriptions');
    const two = r10ClientHandle(wrap(twoDecls, '&mut self, mut url: Value'));
    ok(two === wrap(twoDecls, '&mut self, mut url: Value'), 'two decls untouched');

    // 7. url / futures / rejections are handle fields too
    for (const k of ['url', 'futures', 'rejections']) {
        const got = r10ClientHandle(wrap(read(k)));
        ok(got.includes('__ch.' + k + '.clone()'), k + ' typed: ' + got);
    }

    // 8. idempotent
    const twice = r10ClientHandle(one);
    ok(twice === one, 'idempotent');
    ok(!twice.includes('let __ch = let __ch'), 'single binding');

    // 9. a read-only ws method that only mentions `client` stays as it is
    const bare = wrap('        let mut v: Value = client.clone();');
    ok(r10ClientHandle(bare) === bare, 'no handle site untouched');
    ok(r10ClientHandle('').length === 0, 'empty stays empty');
    ok(!r10ClientHandle(wrap(read('subscriptions'))).includes('let mut __ch'), 'binding need not be mut: ' + one);

    // 10. the pipeline text carries the allocating literal spelling
    //     (`Value::Str("k".to_string())`); it must rewrite the same way.
    const alloc = wrap('        let mut v: Value = get_value(&client, &Value::Str("subscriptions".to_string()));');
    const allocOut = r10ClientHandle(alloc);
    ok(allocOut.includes('__ch.subscriptions.clone()'), 'allocating spelling typed: ' + allocOut);
    ok(!allocOut.includes('get_value(&client'), 'allocating spelling helper gone: ' + allocOut);

    return problems;
}

if (process.argv[1] && process.argv[1].endsWith('hx10w7-R10.ts') && process.argv.includes('--self-test')) {
    const problems = r10SelfTest();
    console.log(problems.length ? problems.join('\n') : 'R10 SELF-TEST PASSED');
    process.exit(problems.length ? 3 : 0);
}
