// ===== hx10w2 R06 — native `Vec` push for `append_to_array` on Arr-only Rust locals =====
// Post-pass over emitted Rust text. `append_to_array(&mut x, v)` becomes
//   `if let Value::Arr(__a) = &mut x { std::sync::Arc::make_mut(__a).push(v); }`
// only when x can hold nothing but `Value::Arr` / `Value::Null`: the helper's remaining arm
// (`try_book_cache_push`) needs a `Dict`, so on those variants the two are identical.
// Anything unproven keeps the plain helper call.

const R06_HELPER = 'append_to_array';
const R06_MAX_LINE = 400; // the generated tree's long-line budget
const R06_CALL_RX = new RegExp ('(?<![\\w.:])' + R06_HELPER + '\\(', 'g');
// Declarations that can only produce `Value::Arr` or `Value::Null`.
const R06_ARR_INIT = [
    /^Value::from\(vec!\[/,
    /^Value::from\(Vec::new\(\)\)$/,
    /^Value::Null$/,
    /^\(match [\s\S]*Some\(__v\) if matches!\(__v, Value::Arr\(_\)\) => __v, _ => Value::from\(vec!\[/,
];

// Blank strings and comments; same length as the input, so indices stay valid.
function r06MaskText (src: string): string {
    const out: string[] = [];
    let i = 0;
    const n = src.length;
    while (i < n) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') {
            while (i < n && src[i] !== '\n') { out.push (' '); i++; }
            continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            out.push ('  '); i += 2;
            while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out.push (src[i] === '\n' ? '\n' : ' '); i++; }
            if (i < n) { out.push ('  '); i += 2; }
            continue;
        }
        if (c === '"') {
            out.push (' '); i++;
            while (i < n && src[i] !== '"') {
                if (src[i] === '\\') { out.push ('  '); i += 2; continue; }
                out.push (src[i] === '\n' ? '\n' : ' '); i++;
            }
            if (i < n) { out.push (' '); i++; }
            continue;
        }
        out.push (c); i++;
    }
    return out.join ('');
}

// [open, close] brace spans of every `fn` body.
function r06FnRegions (masked: string): Array<[number, number]> {
    const regions: Array<[number, number]> = [];
    const head = /\bfn\s+[A-Za-z0-9_]*\s*[(<]/g;
    let m: RegExpExecArray | null;
    while ((m = head.exec (masked)) !== null) {
        let i = m.index + m[0].length - 1;
        let depth = 0;
        let open = -1;
        while (i < masked.length) {
            const c = masked[i];
            if (c === '(' || c === '[' || c === '<') depth++;
            else if (c === ')' || c === ']' || c === '>') depth--;
            else if (c === '{') { if (depth <= 0) { open = i; break; } depth++; }
            else if (c === ';' && depth <= 0) break;
            i++;
        }
        if (open < 0) continue;
        let close = -1;
        let d = 0;
        for (let j = open; j < masked.length; j++) {
            if (masked[j] === '{') d++;
            else if (masked[j] === '}') { d--; if (d === 0) { close = j; break; } }
        }
        if (close > open) regions.push ([open, close]);
    }
    return regions;
}

// Index of the `)` matching the `(` at `open`, or -1.
function r06CloseParen (src: string, open: number): number {
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth === 0) return i; }
    }
    return -1;
}

// Index of the `;` ending the expression that starts at `from` (depth 0), or -1.
function r06ExprEnd (masked: string, from: number): number {
    let depth = 0;
    for (let i = from; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ';' && depth <= 0) return i;
    }
    return -1;
}

function r06IsArrInit (init: string): boolean {
    const t = init.trim ();
    return R06_ARR_INIT.some ((rx) => rx.test (t));
}

// `s` closes its own opening bracket and never dips below it.
function r06Bal (s: string): boolean {
    let d = 0;
    for (const c of s) {
        if (c === '(' || c === '[' || c === '{') d++;
        else if (c === ')' || c === ']' || c === '}') { d--; if (d < 0) return false; }
    }
    return d === 0;
}

// `y = x.clone();` as the only statement of `if matches!(&x, Value::Arr(_)) { ... }`:
// the guard makes the copy an array.
function r06GuardClone (masked: string, rhs: string, stmtStart: number, rhsEnd: number): boolean {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)\.clone\(\)$/.exec (rhs.trim ());
    if (m === null) return false;
    const open = masked.lastIndexOf ('{', stmtStart);
    if (open < 0 || masked.slice (open + 1, stmtStart).trim () !== '' || !/^\s*\}/.test (masked.slice (rhsEnd + 1))) return false;
    const ifStart = masked.lastIndexOf ('if', open);
    if (ifStart < 0 || /[\w.]/.test (masked[ifStart - 1] ?? '')) return false;
    let cond = masked.slice (ifStart + 2, open).trim ();
    while (cond.startsWith ('(') && cond.endsWith (')') && r06Bal (cond.slice (1, -1))) cond = cond.slice (1, -1).trim ();
    const cm = /^matches!\(\s*&\s*([A-Za-z_][A-Za-z0-9_]*)\s*,\s*Value::Arr\(_\)\s*\)$/.exec (cond);
    return cm !== null && cm[1] === m[1];
}

export function r06Push (content: string): string {
    if (!content.includes (R06_HELPER + '(')) return content;
    const masked = r06MaskText (content);
    const regions = r06FnRegions (masked);
    const jobs: Array<{ start: number, end: number, text: string }> = [];
    const rx = new RegExp (R06_CALL_RX.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = rx.exec (masked)) !== null) {
        const start = m.index;
        const lineStart = masked.lastIndexOf ('\n', start) + 1;
        if (/^\s*(?:pub\s+)?fn /.test (masked.slice (lineStart, start))) continue; // definition
        const region = regions.find ((r) => r[0] < start && start < r[1]);
        if (region === undefined) continue;
        const argStart = start + R06_HELPER.length + 1;
        const recv = /^&mut\s+([A-Za-z_][A-Za-z0-9_]*)\s*,/.exec (content.slice (argStart, argStart + 120));
        if (recv === null) continue;
        const name = recv[1];
        const nameRx = new RegExp ('(?<![\\w.])' + name + '(?![\\w])');
        // a parameter receiver is not a local this pass can prove
        const headerStart = masked.lastIndexOf ('fn ', region[0]);
        if (new RegExp ('(?<![\\w])' + name + '\\s*:').test (masked.slice (headerStart, region[0]))) continue;
        // every declaration of the name in this body must be `Value` initialised from an Arr source
        const declRx = new RegExp ('let (?:mut )?' + name + '\\s*:\\s*([^=;]+?)\\s*=(?!=)', 'g');
        const decls: Array<{ start: number, initStart: number, initEnd: number }> = [];
        let d: RegExpExecArray | null;
        const head = masked.slice (0, start);
        while ((d = declRx.exec (head)) !== null) {
            if (d.index <= region[0]) continue;
            if (d[1].trim () !== 'Value') { decls.length = 0; break; }
            const initStart = d.index + d[0].length;
            const initEnd = r06ExprEnd (masked, initStart);
            if (initEnd < 0) { decls.length = 0; break; }
            decls.push ({ start: d.index, initStart, initEnd });
        }
        if (decls.length === 0) continue;
        if (!decls.every ((x) => r06IsArrInit (content.slice (x.initStart, x.initEnd)))) continue;
        // every other use is a read, one of our pushes, or a write of an Arr source
        const useRx = new RegExp (nameRx.source, 'g');
        const body = masked.slice (region[0], region[1]);
        let u: RegExpExecArray | null;
        let ok = true;
        while ((u = useRx.exec (body)) !== null) {
            const s = region[0] + u.index;
            const e = s + name.length;
            if (decls.some ((x) => s >= x.start && s < x.initEnd)) continue;
            const before = masked.slice (Math.max (0, s - 40), s);
            const after = masked.slice (e, e + 80);
            if (/&mut\s*$/.test (before)) {
                if (!(new RegExp (R06_HELPER + '\\(\\s*&mut\\s*$').test (before) && /^\s*,/.test (after))) { ok = false; break; }
                continue;
            }
            const assign = /^\s*=(?!=)/.exec (after);
            if (assign !== null) {
                const rhsStart = e + assign[0].length;
                const rhsEnd = r06ExprEnd (masked, rhsStart);
                if (rhsEnd < 0) { ok = false; break; }
                let aStart = masked.lastIndexOf (';', s);
                aStart = Math.max (aStart, masked.lastIndexOf ('{', s), masked.lastIndexOf ('}', s)) + 1;
                const init = content.slice (rhsStart, rhsEnd);
                if (!r06IsArrInit (init) && !r06GuardClone (masked, init, aStart, rhsEnd)) { ok = false; break; }
            }
        }
        if (!ok) continue;
        // the pushed value is evaluated while the array is mutably borrowed
        const callEnd = r06CloseParen (masked, argStart - 1);
        if (callEnd < 0) continue;
        const valueStart = argStart + recv[0].length;
        const value = content.slice (valueStart, callEnd);
        if (nameRx.test (value)) continue;
        // whole statement only
        let stmtStart = masked.lastIndexOf (';', start);
        stmtStart = Math.max (stmtStart, masked.lastIndexOf ('{', start), masked.lastIndexOf ('}', start)) + 1;
        if (masked.slice (stmtStart, start).trim () !== '') continue;
        if (!/^\)\s*;/.test (masked.slice (callEnd, callEnd + 4))) continue;
        const text = `if let Value::Arr(__a) = &mut ${name} { std::sync::Arc::make_mut(__a).push(${value.trim ()}); }`;
        // keep the tree's 400-char line budget: a site that only fits as a helper call stays one
        const lStart = content.lastIndexOf ('\n', start) + 1;
        const lEnd = content.indexOf ('\n', callEnd) < 0 ? content.length : content.indexOf ('\n', callEnd);
        const lenNow = lEnd - lStart;
        if (lenNow <= R06_MAX_LINE && lenNow - (callEnd + 1 - start) + text.length > R06_MAX_LINE) continue;
        jobs.push ({ start, end: callEnd + 1, text });
    }
    if (jobs.length === 0) return content;
    let out = content;
    for (let i = jobs.length - 1; i >= 0; i--) {
        const j = jobs[i];
        out = out.slice (0, j.start) + j.text + out.slice (j.end);
    }
    return out;
}

// ---- self-test (`npx tsx build/hx10w2-r06.ts --self-test`) ----
const R06_HEAD = `// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

`;

export function r06SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, what: string) => { if (!c) { problems.push ('hx10w2 R06: ' + what); } };
    const run = (body: string, header = '    pub fn k(&mut self, other: Value) -> Value {') => r06Push (R06_HEAD + header + '\n' + body + '\n    }\n');
    const push = (n: string, v: string) => `        ${R06_HELPER}(&mut ${n}, ${v});`;
    const native = (n: string, v: string) => `if let Value::Arr(__a) = &mut ${n} { std::sync::Arc::make_mut(__a).push(${v}); }`;

    // 1. `Value::from(vec![])` local -> native push
    const empty = run (`        let mut hashes: Value = Value::from(vec![]);\n        if is_true(&flag) {\n` + push ('hashes', 'Value::Str("a".into())') + `\n        }`);
    ok (empty.includes (native ('hashes', 'Value::Str("a".into())')), 'empty-array local goes native: ' + empty);
    ok (!empty.includes (R06_HELPER + '(&mut hashes'), 'helper call gone: ' + empty);

    // 2. `Value::Null` local -> native push, and a non-Arr init keeps the helper
    const nul = run (`        let mut rows: Value = Value::Null;\n` + push ('rows', 'data.clone()'));
    ok (nul.includes (native ('rows', 'data.clone()')), 'null local goes native: ' + nul);
    const mapInit = run (`        let mut rows: Value = get_value(&self.markets, &symbol);\n` + push ('rows', 'data.clone()'));
    ok (mapInit.includes (R06_HELPER + '(&mut rows, data.clone());'), 'non-Arr init keeps the helper: ' + mapInit);

    // 3. a later write of a non-Arr source keeps the helper
    const rewrite = run (`        let mut rows: Value = Value::from(vec![]);\n        rows = response.clone();\n` + push ('rows', 'data.clone()'));
    ok (rewrite.includes (R06_HELPER + '(&mut rows, data.clone());'), 'non-Arr rewrite keeps the helper: ' + rewrite);
    const guarded = run (`        let mut rows: Value = Value::from(vec![]);\n        if (matches!(&data, Value::Arr(_))) {\n            rows = data.clone();\n        }  else {\n` + push ('rows', 'data') + `\n        }`);
    ok (guarded.includes (native ('rows', 'data')), 'matches!-guarded clone write keeps the proof: ' + guarded);
    const unguarded = run (`        let mut rows: Value = Value::from(vec![]);\n        if (is_true(&flag)) {\n            rows = data.clone();\n        }\n` + push ('rows', 'data.clone()'));
    ok (unguarded.includes (R06_HELPER + '(&mut rows, data.clone());'), 'unguarded clone write keeps the helper: ' + unguarded);
    const rewriteArr = run (`        let mut rows: Value = Value::from(vec![]);\n        rows = Value::Null;\n` + push ('rows', 'data.clone()'));
    ok (rewriteArr.includes (native ('rows', 'data.clone()')), 'Arr rewrite keeps the proof: ' + rewriteArr);

    // 4. parameter receiver and `&mut` escape keep the helper
    const param = run (push ('other', 'data.clone()'));
    ok (param.includes (R06_HELPER + '(&mut other, data.clone());'), 'parameter receiver keeps the helper: ' + param);
    const escape = run (`        let mut rows: Value = Value::from(vec![]);\n        set_value(&mut rows, &Value::Str("k".into()), Value::Int(1));\n` + push ('rows', 'data.clone()'));
    ok (escape.includes (R06_HELPER + '(&mut rows, data.clone());'), 'escaped &mut keeps the helper: ' + escape);

    // 5. a pushed value that reads the receiver keeps the helper
    const selfRef = run (`        let mut rows: Value = Value::from(vec![]);\n` + push ('rows', 'get_value(&rows, &Value::Int(0))'));
    ok (selfRef.includes (R06_HELPER + '(&mut rows,'), 'value reading the receiver keeps the helper: ' + selfRef);

    // 6. non-Value local type, path-qualified call and the definition itself are untouched
    const vecLocal = run (`        let mut rows: Vec<Value> = Vec::new();\n` + push ('rows', 'data.clone()'));
    ok (vecLocal.includes (R06_HELPER + '(&mut rows, data.clone());'), 'typed Vec local keeps the helper: ' + vecLocal);
    const qualified = run (`        crate::runtime::` + push ('hashes', 'data.clone()'));
    ok (qualified.includes (R06_HELPER + '(&mut hashes, data.clone());'), 'path-qualified call untouched: ' + qualified);
    const def = r06Push (R06_HEAD + 'pub fn append_to_array(arr: &mut Value, v: Value) {\n    if let Value::Arr(a) = arr { std::sync::Arc::make_mut(a).push(v); }\n}\n');
    ok (def.includes ('pub fn append_to_array(arr: &mut Value, v: Value) {'), 'definition untouched: ' + def);

    // 7. a doc comment naming the helper and a dict-literal push stay as they are
    const comment = r06Push (R06_HEAD + '    // append_to_array(&mut hashes, v); obsolete\n    pub fn k(&mut self) -> Value {\n        let mut hashes: Value = Value::from(vec![]);\n' + push ('hashes', 'Value::Int(1)') + '\n    }\n');
    ok (comment.includes (native ('hashes', 'Value::Int(1)')) && comment.includes ('// append_to_array(&mut hashes, v); obsolete'), 'comment untouched: ' + comment);

    // 8. a rewrite that would push the line past 400 chars keeps the helper
    const longVal = 'Value::Str(format!("{}", ' + 'self.safe_string_k(market.clone(), "id", &[])'.repeat (10) + '))';
    const longLine = r06Push (`        let mut hashes: Value = Value::from(vec![]);\n` + push ('hashes', longVal));
    ok (longLine.split ('\n').some ((l) => l.length > 400), 'long-value fixture is over 400 chars');
    ok (longLine.includes (R06_HELPER + '(&mut hashes,'), 'over-budget line keeps the helper: ' + longLine.length);

    // 9. idempotent
    ok (r06Push (empty) === empty, 'idempotent');
    return problems;
}

if (process.argv[1] && process.argv[1].endsWith ('hx10w2-r06.ts') && process.argv.includes ('--self-test')) {
    const problems = r06SelfTest ();
    console.log (problems.length ? problems.join ('\n') : 'R06 SELF-TEST PASSED');
    process.exit (problems.length ? 3 : 0);
}
