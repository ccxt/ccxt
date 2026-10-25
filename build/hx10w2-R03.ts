// hx10w2-R03 — native rust ops for `in_op` / `object_keys` / `object_values` /
// `get_array_length` on a receiver the emitted text proves a container.
// A site whose receiver is not proven keeps the helper call exactly as printed.

type R03Kind = 'map' | 'arr' | 'str';

interface R03Proof {
    kind: R03Kind;
    // No book / cache / side marker can be stored here.
    markerFree: boolean;
    // No live-subscription tag key can be stored here, so the plain key list
    // equals `object_keys` / `object_values` (which drop the two ws tag keys).
    untagged: boolean;
}

interface R03Facts {
    // Container shape and marker safety, when every write pins one.
    proof?: R03Proof;
    // `Value::len` answers what `get_array_length` answers: every write is a
    // JSON read or a plain container, and nothing here can hold a side marker.
    lenSafe: boolean;
}

const R03_SITE_RX = /(?<![A-Za-z0-9_:.])(in_op|object_keys|object_values|get_array_length)\(/g;
const R03_LITERAL_KEY = /^&Value::Str\(("(?:[^"\\]|\\.)*")\.(?:to_string|into)\(\)\)$/;
const R03_IDENT_ARG = /^&([a-z_][A-Za-z0-9_]*)$/;
// `client.subscriptions` / `client.futures`: the ws registry always serves
// these two fields as a `Value::Map` (`subscriptions_value` / `futures_value`),
// and only the subscriptions snapshot carries the two tag keys.
const R03_CLIENT_STATE = /^&get_value\(&(client), &Value::Str\("(subscriptions|futures)"\.(?:to_string|into)\(\)\)\)$/;
// A side marker is the only `Value` whose length differs from `Value::len`.
const R03_SIDE_WORD = /asks|bids|[Ss]ide|[Bb]ook|entries|__sideKind/;
// Sources that yield a plain JSON tree or a plain container.
const R03_JSON_SOURCE = /^(?:crate::value::)?(?:get_value|get_value_k)\(|^self\.(?:safe_\w+|parse_\w+|fetch\w*|to_array|array_concat|extend|omit)\(|^get_arg\(|^split\(|^Value::(?:Map|List|Array|Str|from)\(/;
// Reads that cannot change the stored container shape.
const R03_READS = new Set([ 'clone', 'len', 'is_empty', 'as_map', 'as_array', 'as_str', 'as_i64',
    'as_f64', 'as_bool', 'is_truthy', 'is_null', 'is_str', 'is_map', 'is_array', 'to_string', 'to_json' ]);
// `&mut x` sinks that keep the shape (dict insert / list push / dict delete).
const R03_SHAPE_WRITES = /(?:(?<![A-Za-z0-9_:.])(?:add_element_to_object|set_value|append_to_array|remove)\(|(?:^|[^A-Za-z0-9_:.])if let (?:Value::(?:Dict|Arr)\(__[a-z]+\)|\(Value::(?:Dict|Arr)\(__[a-z]+\), ?(?:&mut )?[a-z_][A-Za-z0-9_]*\)) = )$/;

// Blank out string literals and comments, preserving every offset.
function r03Mask (content: string): string {
    const out = content.split ('');
    let i = 0;
    while (i < content.length) {
        const c = content[i];
        if (c === '/' && content[i + 1] === '/') {
            while (i < content.length && content[i] !== '\n') out[i++] = ' ';
            continue;
        }
        if (c === '"') {
            out[i++] = ' ';
            while (i < content.length && content[i] !== '"') {
                if (content[i] === '\\') out[i++] = ' ';
                out[i++] = ' ';
            }
            if (i < content.length) out[i++] = ' ';
            continue;
        }
        i++;
    }
    return out.join ('');
}

// Index of the bracket closing the one at `open`, or -1.
function r03Close (content: string, open: number): number {
    const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    const close = pairs[content[open]];
    if (close === undefined) return -1;
    let depth = 0;
    let i = open;
    while (i < content.length) {
        const c = content[i];
        if (c === '"') {
            i++;
            while (i < content.length && content[i] !== '"') {
                if (content[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return c === close ? i : -1;
        }
        i++;
    }
    return -1;
}

function r03Split (inner: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let cur = '';
    let i = 0;
    while (i < inner.length) {
        const c = inner[i];
        if (c === '"') {
            const start = i;
            i++;
            while (i < inner.length && inner[i] !== '"') {
                if (inner[i] === '\\') i++;
                i++;
            }
            i++;
            cur += inner.slice (start, i);
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        if (c === ',' && depth === 0) {
            parts.push (cur);
            cur = '';
        } else {
            cur += c;
        }
        i++;
    }
    parts.push (cur);
    return parts;
}

// End offset of the statement starting at `i` (the `;` at depth 0), or -1.
function r03StmtEnd (content: string, i: number): number {
    let depth = 0;
    while (i < content.length) {
        const c = content[i];
        if (c === '"') {
            i++;
            while (i < content.length && content[i] !== '"') {
                if (content[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth < 0) return -1;
        } else if (c === ';' && depth === 0) {
            return i;
        }
        i++;
    }
    return -1;
}

function r03Parens (e: string): string {
    let t = e.trim ();
    while (t.startsWith ('(') && r03Close (t, 0) === t.length - 1) t = t.slice (1, -1).trim ();
    return t;
}

// True when `e` is exactly one call to `name(` … `)`.
function r03IsCall (e: string, name: string): boolean {
    if (!e.startsWith (name + '(')) return false;
    return r03Close (e, name.length) === e.length - 1;
}

class R03Prover {
    private content: string;
    private masked: string;
    private headers: number[] = [ 0 ];
    private memo = new Map<string, R03Facts | undefined> ();
    private pending = new Set<string> ();

    constructor (content: string) {
        this.content = content;
        this.masked = r03Mask (content);
        for (const m of this.masked.matchAll (/\n[ \t]*(?:pub(?:\([a-z]+\))? )?(?:async )?fn /g)) {
            this.headers.push ((m.index as number) + 1);
        }
        this.headers.push (content.length);
    }

    // Enclosing fn region containing `pos`.
    region (pos: number): number {
        let lo = 0;
        for (let h = 0; h + 1 < this.headers.length; h++) if (this.headers[h] <= pos) lo = h;
        return lo;
    }

    facts (name: string, pos: number): R03Facts | undefined {
        if (!/^[a-z_][A-Za-z0-9_]*$/.test (name)) return undefined;
        const lo = this.region (pos);
        const key = `${lo}:${name}`;
        if (this.memo.has (key)) return this.memo.get (key);
        // Alias cycles (`x = y.clone()` / `y = x.clone()`) must not recurse.
        if (this.pending.has (key)) return undefined;
        this.pending.add (key);
        const result = this.prove (name, this.headers[lo], this.headers[lo + 1], new Set ());
        this.pending.delete (key);
        this.memo.set (key, result);
        return result;
    }

    private prove (name: string, from: number, to: number, seen: Set<string>): R03Facts | undefined {
        const region = this.masked.slice (from, to);
        const real = this.content.slice (from, to);
        const header = real.slice (0, Math.max (0, real.indexOf ('{')));
        const isParam = new RegExp (`[^A-Za-z0-9_]${name}\\s*:`).test (header);
        const rebind = new RegExp (`(?<!\\|)\\|(?!\\|)[^|\\n]*\\b${name}\\b[^|\\n]*(?<!\\|)\\|(?!\\|)`
            + `|\\bfor [^\\n]*\\b${name}\\b[^\\n]* in |\\blet \\([^)]*\\b${name}\\b|\\b${name}\\s*@|\\b${name}\\s*[-+*/%|&^]=`);
        if (rebind.test (region) || new RegExp (`\\*\\s*${name}\\b\\s*=(?!=)`).test (region)) return undefined;
        let writes = 0;
        let proof: R03Proof | undefined;
        // One unpinned write clears the shape for good: no later write restores it.
        let shapeUnknown = false;
        let lenSafe = !R03_SIDE_WORD.test (name);
        const writesRe = new RegExp (`(?<![A-Za-z0-9_.*])(let (?:mut )?)?${name}\\b(\\s*:\\s*([A-Za-z_][A-Za-z0-9_<>,:& ]*?))?\\s*=(?!=)`, 'g');
        for (const m of region.matchAll (writesRe)) {
            const typed = m[3] === undefined ? 'Value' : m[3].replace (/\s+/g, '');
            // A native container declaration is not what this pass proves.
            if (typed !== 'Value') return undefined;
            const rhsStart = (m.index as number) + m[0].length;
            const end = r03StmtEnd (real, rhsStart);
            if (end < 0) return undefined;
            const raw = r03Parens (real.slice (rhsStart, end));
            const write = this.source (raw, from + (m.index as number), seen);
            writes++;
            if (write === undefined) {
                // A JSON read has no pinned shape but never carries a marker.
                lenSafe = lenSafe && R03_JSON_SOURCE.test (raw) && !R03_SIDE_WORD.test (raw);
                shapeUnknown = true;
                continue;
            }
            if (shapeUnknown) {
                lenSafe = lenSafe && write.markerFree && !R03_SIDE_WORD.test (raw);
                continue;
            }
            if (proof === undefined) proof = { ...write };
            else if (proof.kind !== write.kind) shapeUnknown = true;
            else {
                proof.markerFree = proof.markerFree && write.markerFree;
                proof.untagged = proof.untagged && write.untagged;
            }
            lenSafe = lenSafe && write.markerFree && !R03_SIDE_WORD.test (raw);
        }
        if (writes === 0) return undefined;
        for (const m of region.matchAll (new RegExp (`&mut ${name}\\b`, 'g'))) {
            const before = region.slice (Math.max (0, (m.index as number) - 96), m.index as number);
            if (!R03_SHAPE_WRITES.test (before)) return undefined;
        }
        for (const m of region.matchAll (new RegExp (`(?<![A-Za-z0-9_.])${name}\\.([A-Za-z_][A-Za-z0-9_]*)`, 'g'))) {
            if (!R03_READS.has (m[1])) return undefined;
        }
        // A parameter has no declaration to prove: only the length rule can fire.
        if (isParam) return lenSafe ? { lenSafe } : undefined;
        return shapeUnknown ? { lenSafe } : { proof, lenSafe };
    }

    // Shape and marker safety of one right-hand side.
    private source (raw: string, absPos: number, seen: Set<string>): R03Proof | undefined {
        const e = r03Parens (raw);
        if (e === '') return undefined;
        const lit = (kind: R03Kind, untagged = true): R03Proof => ({ kind, markerFree: true, untagged });
        // A ws subscriptions snapshot carries the two tag keys; anything read
        // through the client may be one, so it is never a plain key source.
        const tagged = e.includes ('subscriptions') || e.includes ('client');
        if (r03IsCall (e, 'Value::Map')) return lit ('map', !tagged && !e.includes ('__ws_sub'));
        if (r03IsCall (e, 'Value::List') || r03IsCall (e, 'Value::Array') || r03IsCall (e, 'Value::from')) {
            return e.includes ('vec![') ? lit ('arr') : undefined;
        }
        if (r03IsCall (e, 'Value::Str')) return lit ('str');
        // Base readers with a fixed container result.
        const readers: Array<[RegExp, R03Kind]> = [ [ /^self\.safe_dict(?:_k|2|_k2)?\(/, 'map' ], [ /^self\.safe_list(?:_k|2|_k2)?\(/, 'arr' ],
            [ /^self\.(?:parse_ids|to_array|array_concat)\(/, 'arr' ], [ /^split\(/, 'arr' ] ];
        for (const [ rx, kind ] of readers) {
            if (rx.test (e) && r03Close (e, e.indexOf ('(')) === e.length - 1) return lit (kind, !tagged);
        }
        // `extend` / `omit` keep the first operand's shape and safety.
        const merge = /^self\.(?:extend|omit)\(/.exec (e);
        if (merge !== null && r03Close (e, merge[0].length - 1) === e.length - 1) {
            const args = r03Split (e.slice (merge[0].length, -1));
            const first = args.length > 0 ? this.source (args[0], absPos, seen) : undefined;
            if (first === undefined) return undefined;
            return { kind: first.kind, markerFree: first.markerFree, untagged: first.untagged && !tagged };
        }
        // A local alias of another proven local.
        const alias = /^([a-z_][A-Za-z0-9_]*)\.clone\(\)$/.exec (e);
        if (alias !== null) {
            if (seen.has (alias[1])) return undefined;
            seen.add (alias[1]);
            return this.facts (alias[1], absPos)?.proof;
        }
        return undefined;
    }
}

function r03KeyText (key: string): string | undefined {
    const lit = R03_LITERAL_KEY.exec (key);
    if (lit !== null) return lit[1];
    const ident = R03_IDENT_ARG.exec (key);
    if (ident !== null) return ident[1];
    return undefined;
}

export function hx10w2R03 (content: string): string {
    if (!/\b(?:in_op|object_keys|object_values|get_array_length)\(&/.test (content)) return content;
    const prover = new R03Prover (content);
    for (let round = 0; round < 6; round++) {
        const masked = r03Mask (content);
        const rewrites: Array<{ start: number, end: number, text: string }> = [];
        for (const m of masked.matchAll (R03_SITE_RX)) {
            const start = m.index as number;
            const name = m[1];
            if (/\bfn\s+$/.test (masked.slice (Math.max (0, start - 8), start))) continue;
            if (rewrites.some (r => start >= r.start && start < r.end)) continue;
            const open = start + name.length;
            const close = r03Close (content, open);
            if (close < 0) continue;
            const args = r03Split (content.slice (open + 1, close)).map (s => s.trim ());
            // A proven local, or the ws client field the registry types itself.
            let expr: string | undefined;
            let kind: R03Kind | undefined;
            let untagged = false;
            let lenSafe = false;
            const recv = R03_IDENT_ARG.exec (args[0] ?? '');
            const state = R03_CLIENT_STATE.exec (args[0] ?? '');
            if (recv !== null) {
                const facts = prover.facts (recv[1], start);
                if (facts === undefined) continue;
                expr = recv[1];
                kind = facts.proof?.kind;
                untagged = facts.proof?.untagged === true;
                lenSafe = facts.lenSafe;
            } else if (state !== null) {
                expr = (args[0] ?? '').trim ().slice (1);
                kind = 'map';
                untagged = state[2] === 'futures';
                lenSafe = true;
            } else {
                continue;
            }
            let text: string | undefined;
            if (name === 'get_array_length' && args.length === 1) {
                if (lenSafe) text = `Value::Int(${expr}.len() as i64)`;
            } else if (name === 'in_op' && args.length === 2 && kind === 'map') {
                // The printer's own membership form for a dict-shaped receiver.
                const key = r03KeyText (args[1]);
                if (key !== undefined) {
                    text = key.startsWith ('"')
                        ? `matches!(&${expr}, Value::Dict(__d) if __d.contains_key(${key}))`
                        : `matches!((&${expr}, &${key}), (Value::Dict(__d), Value::Str(__k)) if __d.contains_key(__k.as_ref()))`;
                }
            } else if ((name === 'object_keys' || name === 'object_values') && args.length === 1
                && kind === 'map' && untagged) {
                const body = name === 'object_keys'
                    ? '__m.keys().map(|__k| Value::Str(__k.clone().into())).collect()'
                    : '__m.values().cloned().collect()';
                text = `Value::Array(${expr}.as_map().map(|__m| ${body}).unwrap_or_default())`;
            }
            if (text === undefined) continue;
            rewrites.push ({ start, end: close + 1, text });
        }
        if (rewrites.length === 0) break;
        let out = '';
        let at = 0;
        for (const r of rewrites) {
            if (r.start < at) continue;
            out += content.slice (at, r.start) + r.text;
            at = r.end;
        }
        content = out + content.slice (at);
    }
    return content;
}

// Self-test cases: each must stay unchanged on the base generator and rewrite here.
export function hx10w2R03SelfTest (): string[] {
    const problems: string[] = [];
    const check = (name: string, input: string, expected: string) => {
        // A case whose input already equals the native text proves nothing.
        if (input === expected) problems.push (`${name}: expectation is the input`);
        if (expected === undefined) problems.push (`${name}: no expectation`);
        const got = hx10w2R03 (input);
        if (got !== expected) problems.push (`${name}: ${JSON.stringify (got)} != ${JSON.stringify (expected)}`);
    };
    const fn = (body: string) => `    pub fn probe(&self) -> Value {\n${body}\n    }\n`;
    // A plain dict local: membership, key list and length go native.
    check ('dict local', fn ('        let mut m: Value = Value::Map({\n            let mut x = indexmap::IndexMap::new();\n            x\n        });\n        if (in_op(&m, &Value::Str("k".to_string()))) {\n            let ks: Value = object_keys(&m);\n            let n: Value = get_array_length(&m);\n        }'),
        fn ('        let mut m: Value = Value::Map({\n            let mut x = indexmap::IndexMap::new();\n            x\n        });\n        if (matches!(&m, Value::Dict(__d) if __d.contains_key("k"))) {\n            let ks: Value = Value::Array(m.as_map().map(|__m| __m.keys().map(|__k| Value::Str(__k.clone().into())).collect()).unwrap_or_default());\n            let n: Value = Value::Int(m.len() as i64);\n        }'));
    // A subscriptions snapshot keeps the key helper: the tag keys must be filtered.
    const tagged = fn ('        let mut subs: Value = self.safe_dict_k(client.clone(), "subscriptions", &[]);\n        let ks: Value = object_keys(&subs);\n        let n: Value = get_array_length(&subs);');
    check ('tagged keys', tagged, tagged.replace ('get_array_length(&subs)', 'Value::Int(subs.len() as i64)'));
    // A receiver written from an API read has no pinned shape, but its length is native.
    const unknown = fn ('        let mut r: Value = get_value(&self.options, &Value::Str("x".to_string()));\n        let n: Value = get_array_length(&r);');
    check ('api read length', unknown, unknown.replace ('get_array_length(&r)', 'Value::Int(r.len() as i64)'));
    // The ws registry serves both client fields as a map; only subscriptions is tagged.
    const stateIn = fn ('        if (in_op(&get_value(&client, &Value::Str("subscriptions".to_string())), &hash)) {\n            let ks: Value = object_keys(&get_value(&client, &Value::Str("futures".to_string())));\n            let sub: Value = object_keys(&get_value(&client, &Value::Str("subscriptions".to_string())));\n        }');
    check ('client state', stateIn, fn ('        if (matches!((&get_value(&client, &Value::Str("subscriptions".to_string())), &hash), (Value::Dict(__d), Value::Str(__k)) if __d.contains_key(__k.as_ref()))) {\n            let ks: Value = Value::Array(get_value(&client, &Value::Str("futures".to_string())).as_map().map(|__m| __m.keys().map(|__k| Value::Str(__k.clone().into())).collect()).unwrap_or_default());\n            let sub: Value = object_keys(&get_value(&client, &Value::Str("subscriptions".to_string())));\n        }'));
    // A parameter has no declaration to prove: the helper call stays.
    const param = fn ('        if (in_op(&params, &Value::Str("k".to_string()))) {\n            let n: Value = object_keys(&params);\n        }');
    if (hx10w2R03 (param) !== param) problems.push ('param: helper not kept');
    // A side marker keeps the helper: the store holds its entries, not the dict.
    const side = fn ('        let mut storedAsks: Value = self.safe_value_k(book.clone(), "asks", &[]);\n        let n: Value = get_array_length(&storedAsks);');
    if (hx10w2R03 (side) !== side) problems.push ('side marker: helper not kept');
    return problems;
}
