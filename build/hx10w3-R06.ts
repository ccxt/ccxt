// ===== hx10w3 R06 — append_to_array on a marker-free receiver is a plain Vec push =====
// `append_to_array(&mut x, v)` is `if try_book_cache_push(arr, v) { return; }` then
// `if let Value::Arr(a) = arr { Arc::make_mut(a).push(v) }`. A receiver that can never be a
// book-cache handle dict (`__book_cache_id` key) has no other live arm, so the push is exact:
//   if let Value::Arr(__a) = &mut x { std::sync::Arc::make_mut(__a).push(v); }
// Wave 2 required an Arr-only initialiser; this admits any receiver whose every write is a
// marker-free source (literals, reads/clones of proven locals, plain data fields).
// Anything unproven keeps the plain helper call.

const helperName = 'append_to_array';
const lineBudget = 400;

// Client / exchange fields whose values are plain data, never book-cache handles.
const plainFields = new Set ([
    'orders', 'positions', 'tickers', 'trades', 'ohlcvs', 'bidsasks', 'clients', 'balance',
    'options', 'markets', 'markets_by_id', 'currencies', 'events', 'outcomes', 'outcomes_by_id',
    'events_by_slug', 'symbols', 'free', 'used', 'total',
]);
// Variant-preserving `&mut` calls: none of them can turn a value into a book-cache handle.
const keeperCalls = [ 'add_element_to_object', 'set_value', 'remove' ];
// Literal constructors that cannot carry a book-cache handle.
const literalPrefixes = [ 'Value::Null', 'Value::Int(', 'Value::Float(', 'Value::Bool(', 'Value::Str(', 'Value::Map({', 'Value::Array(' ];

// Blank strings and comments; same length as the input, so indices stay valid.
function maskText (src: string): string {
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
function fnRegions (masked: string): Array<[number, number]> {
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
function closeParenAt (src: string, open: number): number {
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '(') depth++;
        else if (c === ')') { depth--; if (depth === 0) return i; }
    }
    return -1;
}

// Index of the `;` ending the expression that starts at `from` (depth 0), or -1.
function exprEnd (masked: string, from: number): number {
    let depth = 0;
    for (let i = from; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ';' && depth <= 0) return i;
    }
    return -1;
}

export function r06w3Push (content: string): string {
    if (!content.includes (helperName + '(')) return content;
    const masked = maskText (content);
    const regions = fnRegions (masked);
    const callRx = new RegExp ('(?<![\\w.:])' + helperName + '\\(', 'g');
    const jobs: Array<{ start: number, end: number, text: string }> = [];
    const memo = new Map<string, Map<string, boolean>> ();

    const factsOf = (region: [number, number]): Map<string, boolean> => {
        const key = region[0] + ':' + region[1];
        let hit = memo.get (key);
        if (hit === undefined) { hit = new Map<string, boolean> (); memo.set (key, hit); }
        return hit;
    };
    const isPlainField = (expr: string): boolean => {
        const f = /^self\.([A-Za-z_][A-Za-z0-9_]*)\b/.exec (expr.trim ());
        return f !== null && plainFields.has (f[1]);
    };
    // Root local of a `.as_map()` / `.as_array()` chain, else null.
    const chainRoot = (expr: string): string | null => {
        const m = /^([A-Za-z_][A-Za-z0-9_]*)\.(?:as_map|as_array)\(\)/.exec (expr.trim ());
        return m === null ? null : m[1];
    };

    // `expr` is a source that can only yield a value that is not a book-cache handle.
    const sourceFree = (expr: string, region: [number, number], seen: Set<string>): boolean => {
        const t = expr.trim ();
        if (literalPrefixes.some ((p) => t.startsWith (p))) return true;
        if (/^Value::from\(vec!\[/.test (t) || /^Value::from\(Vec::new\(\)\)$/.test (t)) return true;
        if (t.startsWith ('self.safe_list')) return true;
        // `x.as_str().map(..)`: a string or `Value::Null`
        if (/^[A-Za-z_][A-Za-z0-9_]*\.as_str\(\)\.map\(/.test (t)) return true;
        // a plain data field, or a read rooted at one
        if (isPlainField (t)) return true;
        const safeValue = /^self\.safe_value(?:_k)?\(self\.([A-Za-z_][A-Za-z0-9_]*)/.exec (t);
        if (safeValue !== null && plainFields.has (safeValue[1])) return true;
        // dict-field read through a variant match on a plain local
        const matchRead = /^match\s*&\s*([A-Za-z_][A-Za-z0-9_]*)\s*\{\s*Value::Dict\(__m\d+\)\s*=>\s*__m\d+\.get\("/.exec (t);
        if (matchRead !== null) return localFree (matchRead[1], region, seen);
        // `get_value(&recv, key)` / `get_value_k(&recv, "k")`
        const read = /^(?:crate::value::)?(?:get_value_k|get_value)\(/.exec (t);
        if (read !== null) {
            const open = read[0].length - 1;
            const close = closeParenAt (t, open);
            if (close < 0) return false;
            const args = t.slice (open + 1, close);
            const comma = args.indexOf (',');
            if (comma < 0) return false;
            const recv = args.slice (0, comma).trim ().replace (/^&\s*/, '');
            if (isPlainField (recv)) return true;
            const root = chainRoot (recv);
            if (root !== null) return localFree (root, region, seen);
            if (/^[A-Za-z_][A-Za-z0-9_]*$/.test (recv)) return localFree (recv, region, seen);
            return false;
        }
        const clone = /^([A-Za-z_][A-Za-z0-9_]*)\.clone\(\)$/.exec (t);
        if (clone !== null) return localFree (clone[1], region, seen);
        const root = chainRoot (t);
        if (root !== null) return localFree (root, region, seen);
        return false;
    };

    // Every declaration and every later write of `name` in this body is a marker-free source.
    const localFree = (name: string, region: [number, number], seen: Set<string>): boolean => {
        const facts = factsOf (region);
        const known = facts.get (name);
        if (known !== undefined) return known;
        if (seen.has (name)) return false;
        const body = masked.slice (region[0], region[1]);
        const declRx = new RegExp ('let (?:mut )?' + name + '\\s*:\\s*([^=;]+?)\\s*=(?!=)', 'g');
        const spans: Array<[number, number]> = [];
        let d: RegExpExecArray | null;
        while ((d = declRx.exec (body)) !== null) {
            if (d[1].trim () !== 'Value') { facts.set (name, false); return false; }
            const rhsStart = region[0] + d.index + d[0].length;
            const rhsEnd = exprEnd (masked, rhsStart);
            if (rhsEnd < 0) { facts.set (name, false); return false; }
            spans.push ([d.index, rhsEnd - region[0]]);
        }
        if (spans.length === 0) { facts.set (name, false); return false; }
        seen.add (name);
        let ok = true;
        for (const [d0, d1] of spans) {
            const rhsStart = region[0] + d0 + body.slice (d0).indexOf ('=') + 1;
            if (!sourceFree (content.slice (rhsStart, region[0] + d1), region, seen)) { ok = false; break; }
        }
        if (ok) {
            const wrx = new RegExp ('(?<![\\w.])' + name + '\\s*=(?!=)', 'g');
            let w: RegExpExecArray | null;
            while ((w = wrx.exec (body)) !== null) {
                if (spans.some (([d0, d1]) => w!.index >= d0 + body.slice (d0).indexOf ('=') && w!.index < d1)) continue;
                const rhsStart = region[0] + w.index + w[0].length;
                const rhsEnd = exprEnd (masked, rhsStart);
                if (rhsEnd < 0 || !sourceFree (content.slice (rhsStart, rhsEnd), region, seen)) { ok = false; break; }
            }
        }
        seen.delete (name);
        facts.set (name, ok);
        return ok;
    };

    let m: RegExpExecArray | null;
    while ((m = callRx.exec (masked)) !== null) {
        const start = m.index;
        const lineStart = masked.lastIndexOf ('\n', start) + 1;
        if (/^\s*(?:pub\s+)?fn /.test (masked.slice (lineStart, start))) continue; // definition
        const region = regions.find ((r) => r[0] < start && start < r[1]);
        if (region === undefined) continue;
        const argStart = start + helperName.length + 1;
        const recv = /^&mut\s+([A-Za-z_][A-Za-z0-9_]*)\s*,/.exec (content.slice (argStart, argStart + 160));
        if (recv === null) continue;
        const name = recv[1];
        const nameRx = new RegExp ('(?<![\\w.])' + name + '(?![\\w])');
        // a parameter receiver is not a local this pass can prove
        const headerStart = masked.lastIndexOf ('fn ', region[0]);
        if (new RegExp ('(?<![\\w])' + name + '\\s*:').test (masked.slice (headerStart, region[0]))) continue;
        if (!localFree (name, region, new Set<string> ())) continue;
        // every `&mut name` must be one of our pushes or a variant-preserving call
        const body = masked.slice (region[0], region[1]);
        const mutRx = new RegExp ('&mut\\s+' + name + '(?![\\w])', 'g');
        let ok = true;
        let mu: RegExpExecArray | null;
        while ((mu = mutRx.exec (body)) !== null) {
            const at = region[0] + mu.index;
            const before = masked.slice (Math.max (0, at - 60), at);
            const after = masked.slice (at + mu[0].length, at + mu[0].length + 8);
            const pushRecv = new RegExp (helperName + '\\(\\s*$').test (before) && /^\s*,/.test (after);
            const keeper = keeperCalls.some ((c) => new RegExp ('(?<![\\w.])' + c + '\\(\\s*$').test (before)) && /^\s*,/.test (after);
            if (!pushRecv && !keeper) { ok = false; break; }
        }
        if (!ok) continue;
        const callEnd = closeParenAt (masked, argStart - 1);
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
        if (lenNow <= lineBudget && lenNow - (callEnd + 1 - start) + text.length > lineBudget) continue;
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

// ---- self-test (`npx tsx build/hx10w3-R06.ts --self-test`) ----
const fileHead = `// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

`;

export function r06w3SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, what: string) => { if (!c) { problems.push ('hx10w3 R06: ' + what); } };
    const run = (body: string, header = '    pub fn k(&mut self, other: Value) -> Value {') => r06w3Push (fileHead + header + '\n' + body + '\n    }\n');
    const push = (n: string, v: string) => `        append_to_array(&mut ${n}, ${v});`;
    const native = (n: string, v: string) => `if let Value::Arr(__a) = &mut ${n} { std::sync::Arc::make_mut(__a).push(${v}); }`;

    // 1. alias local read out of a plain map local: the marker arm cannot fire
    const alias = run (`        let mut byTicker: Value = Value::Map({\n            let mut m = indexmap::IndexMap::new();\n            m\n        });\n        let mut rows: Value = get_value(&byTicker, &ticker);\n` + push ('rows', 'outcome.clone()'));
    ok (alias.includes (native ('rows', 'outcome.clone()')), 'get_value alias local goes native: ' + alias);
    ok (!alias.includes (helperName + '(&mut rows'), 'helper call gone: ' + alias);

    // 2. dict-field read through a variant match on a plain local
    const matchRead = run (`        let mut order: Value = Value::Map({\n            let mut m = indexmap::IndexMap::new();\n            m\n        });\n        let mut rows: Value = match &order { Value::Dict(__m15) => __m15.get("child_orders").cloned().unwrap_or(Value::Null), _ => Value::Null };\n` + push ('rows', 'stopLoss'));
    ok (matchRead.includes (native ('rows', 'stopLoss')), 'match field read goes native: ' + matchRead);

    // 3. the same read from a book-cache-holding field keeps the helper (`self.cache`)
    const cache = run (`        let mut rows: Value = get_value(&self.cache, &ticker);\n` + push ('rows', 'outcome.clone()'));
    ok (cache.includes (helperName + '(&mut rows, outcome.clone());'), 'cache field read keeps the helper: ' + cache);

    // 4. a callee return is not proven, and a later write of one drops the proof
    const callee = run (`        let mut rows: Value = self.parse_rows(data);\n` + push ('rows', 'outcome.clone()'));
    ok (callee.includes (helperName + '(&mut rows, outcome.clone());'), 'callee return keeps the helper: ' + callee);
    const rewrite = run (`        let mut rows: Value = Value::from(vec![]);\n        rows = self.parse_rows(data);\n` + push ('rows', 'outcome.clone()'));
    ok (rewrite.includes (helperName + '(&mut rows, outcome.clone());'), 'unproven write keeps the helper: ' + rewrite);

    // 5. plain data field read, element read out of a plain local array, keeping `&mut` escapes
    const field = run (`        let mut ohlcv: Value = self.safe_value(self.ohlcvs.as_map().and_then(|__m| __m.get("1m")).cloned().unwrap_or(Value::Null), Value::Str("1m".into()), &[Value::from(vec![])]);\n` + push ('ohlcv', 'candle'));
    ok (field.includes (native ('ohlcv', 'candle')), 'plain field read goes native: ' + field);
    const element = run (`        let mut rows: Value = Value::from(vec![]);\n        let mut last: Value = rows.as_array().and_then(|__arr| __arr.get(0)).cloned().unwrap_or(Value::Null);\n` + push ('last', 'candle'));
    ok (element.includes (native ('last', 'candle')), 'element read out of a plain local array goes native: ' + element);
    const keeper = run (`        let mut rows: Value = Value::from(vec![]);\n        set_value(&mut rows, &Value::Str("k".into()), Value::Int(1));\n` + push ('rows', 'candle'));
    ok (keeper.includes (native ('rows', 'candle')), 'variant-preserving &mut keeps the proof: ' + keeper);

    // 6. an escaping `&mut` through an unknown callee, and a value naming the receiver, keep the helper
    const escape = run (`        let mut rows: Value = Value::from(vec![]);\n        self.consume(&mut rows);\n` + push ('rows', 'candle'));
    ok (escape.includes (helperName + '(&mut rows, candle);'), 'escaped &mut keeps the helper: ' + escape);
    const selfRef = run (`        let mut rows: Value = Value::from(vec![]);\n` + push ('rows', 'get_value(&rows, &Value::Int(0))'));
    ok (selfRef.includes (helperName + '(&mut rows,'), 'value reading the receiver keeps the helper: ' + selfRef);
    const param = run (push ('other', 'candle'));
    ok (param.includes (helperName + '(&mut other, candle);'), 'parameter receiver keeps the helper: ' + param);

    // 7. idempotent, and the helper definition itself is untouched
    ok (r06w3Push (alias) === alias, 'idempotent');
    const def = r06w3Push (fileHead + 'pub fn append_to_array(arr: &mut Value, v: Value) {\n    if let Value::Arr(a) = arr { std::sync::Arc::make_mut(a).push(v); }\n}\n');
    ok (def.includes ('pub fn append_to_array(arr: &mut Value, v: Value) {'), 'definition untouched: ' + def);

    // 8. a rewrite that would push the line past 400 chars keeps the helper
    const longVal = 'Value::Str(format!("{}", ' + 'self.safe_string_k(market.clone(), "id", &[])'.repeat (10) + '))';
    const longLine = r06w3Push (`        let mut rows: Value = Value::from(vec![]);\n` + push ('rows', longVal));
    ok (longLine.includes (helperName + '(&mut rows,'), 'over-budget line keeps the helper');
    return problems;
}

if (process.argv[1] && process.argv[1].endsWith ('hx10w3-R06.ts') && process.argv.includes ('--self-test')) {
    const problems = r06w3SelfTest ();
    console.log (problems.length ? problems.join ('\n') : 'R06 W3 SELF-TEST PASSED');
    process.exit (problems.length ? 3 : 0);
}
