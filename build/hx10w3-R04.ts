// hx10 wave-3 R04: `is_true` on a bool-proven callee result.
//
// A generated exchange method that TS declares `boolean` prints `-> Value`, and
// its callers copy it into a `Value` local, so `is_true(&x)` survives every
// argument-kind proof. What IS provable statically is the callee's own return
// shape: when every return expression of every same-file declaration of a
// `-> Value` method is a `Value::Bool`, a bool-coercing `safe_bool*`, a proven
// bool local or `Value::Null`, the call result can only be `Bool`/`Null` and
// `is_true` reduces to `.as_bool() == Some(true)`. Everything unproven keeps
// the helper call. Runs after r04Scalars; only proofs it cannot see remain.

interface Hx10R04Region { start: number, end: number, name: string, ret: string, body: string }

/** Blank out string literals and comments, preserving every offset. */
function hx10R04Mask (text: string): string {
    const out = text.split('')
    const n = out.length
    let i = 0
    while (i < n) {
        const c = out[i]
        if (c === '"') {
            let j = i + 1
            while (j < n && out[j] !== '"') {
                if (out[j] === '\\') j += 1
                j += 1
            }
            for (let k = i + 1; k < j && k < n; k++) out[k] = ' '
            i = j + 1
            continue
        }
        if (c === '/' && out[i + 1] === '/') {
            let j = i
            while (j < n && out[j] !== '\n') { out[j] = ' '; j += 1 }
            i = j
            continue
        }
        i += 1
    }
    return out.join('')
}

function hx10R04Close (masked: string, open: number): number {
    let depth = 0
    for (let i = open; i < masked.length; i++) {
        const c = masked[i]
        if (c === '(' || c === '[' || c === '{') depth++
        else if (c === ')' || c === ']' || c === '}') {
            depth--
            if (depth === 0) return i
        }
    }
    return -1
}

function hx10R04Strip (src: string): string {
    let s = src.trim()
    while (s.startsWith('(') && hx10R04Close(s, 0) === s.length - 1) s = s.slice(1, -1).trim()
    return s
}

const HX10R04_FN = /\n[ \t]*(?:pub )?(?:async )?fn (\w+)/g

function hx10R04Regions (masked: string): Hx10R04Region[] {
    const heads: number[] = [0]
    for (const m of masked.matchAll(HX10R04_FN)) heads.push((m.index as number) + 1)
    heads.push(masked.length)
    const out: Hx10R04Region[] = []
    for (let h = 0; h + 1 < heads.length; h++) {
        const seg = masked.slice(heads[h], heads[h + 1])
        const head = /^[ \t]*(?:pub )?(?:async )?fn (\w+)\s*(?:<[^>]*>)?\s*\(/.exec(seg)
        if (head === null) continue
        const open = seg.indexOf('(', head[0].length - 1)
        const close = hx10R04Close(seg, open)
        if (close < 0) continue
        const brace = seg.indexOf('{', close)
        out.push({ start: heads[h], end: heads[h + 1], name: head[1], ret: brace < 0 ? '' : seg.slice(close + 1, brace), body: brace < 0 ? '' : seg.slice(brace) })
    }
    return out
}

/** Value expressions a `return`/tail can hand back, `undefined` when not a `Value` fn. */
function hx10R04RetExprs (region: Hx10R04Region): string[] | undefined {
    if (!/^\s*->\s*(?:crate::)?Value\s*$/.test(region.ret.replace(/\s+/g, ' '))) return undefined
    const body = region.body
    const rets: string[] = []
    for (const m of body.matchAll(/\breturn\b/g)) {
        const at = (m.index as number) + m[0].length
        let depth = 0
        let j = at
        for (; j < body.length; j++) {
            const c = body[j]
            if (c === '(' || c === '[' || c === '{') depth++
            else if (c === ')' || c === ']' || c === '}') {
                if (depth === 0) break
                depth--
            } else if (c === ';' && depth === 0) break
        }
        rets.push(body.slice(at, j))
    }
    // Tail expression: the last `;`-free statement before the fn's closing brace.
    const close = body.lastIndexOf('}')
    const tailEnd = body.slice(0, close).replace(/\s+$/, '')
    const semi = tailEnd.lastIndexOf(';')
    const braceOpen = tailEnd.lastIndexOf('{')
    if (semi > braceOpen || (semi < 0 && braceOpen < 0)) {
        const tail = tailEnd.slice(semi + 1).trim()
        if (tail !== '' && !tail.startsWith('}')) rets.push(tail)
    }
    if (rets.length === 0) return undefined
    return rets
}

function hx10R04SafeBoolDefault (call: string): boolean | undefined {
    const open = call.indexOf('(')
    const close = hx10R04Close(call, open)
    if (close < 0) return undefined
    const inner = call.slice(open + 1, close)
    const listAt = inner.lastIndexOf('&[')
    if (listAt < 0) return undefined
    const list = hx10R04Strip(inner.slice(listAt))
    if (!list.startsWith('&[') || !list.endsWith(']')) return undefined
    const items = list.slice(2, -1).trim()
    if (items === '') return true
    const one = hx10R04Strip(items)
    if (/^Value::Bool\((?:true|false)\)$/.test(one)) return true
    if (one === 'Value::Null') return true
    return undefined
}

// Hand-written (non-generated) helpers whose every return is `Value::Bool`:
// exchange_stubs.rs `in_array`/`is_json_encoded_object`, precise.rs `stringEq|Gt|Ge|Lt|Le|Equals`
// (`vbool` and the early `any_null` arm both build `Value::Bool`).
const HX10R04_BOOL_BASE = /^(?:in_array|is_json_encoded_object)$/
const HX10R04_BOOL_PRECISE = /^string(?:Eq|Gt|Ge|Lt|Le|Equals)$/

type Hx10R04Variants = Set<'bool' | 'int' | 'float' | 'str' | 'null'>

const HX10R04_BOOLISH = (v: Hx10R04Variants): boolean => [...v].every((x) => x === 'bool' || x === 'null')

/**
 * Variants an expression can evaluate to, or undefined when unproven.
 * `self.<fn>` resolves through the same file's declarations (depth-limited).
 */
function hx10R04Variant (expr: string, masked: string, byName: Map<string, Hx10R04Region[]>, region: Hx10R04Region, depth: number, visiting: Set<string>): Hx10R04Variants | undefined {
    if (depth > 6) return undefined
    let e = hx10R04Strip(expr)
    while (e.endsWith('.clone()')) e = hx10R04Strip(e.slice(0, -'.clone()'.length))
    while (e.endsWith('.await')) e = e.slice(0, -'.await'.length).trim()
    const lit = /^Value::(Bool|Int|Float|Str)\(/.exec(e)
    if (lit !== null && hx10R04Close(e, 'Value::'.length + lit[1].length) === e.length - 1) {
        return new Set<any>([lit[1].toLowerCase()])
    }
    if (e === 'Value::Null' || e === 'crate::Value::Null') return new Set<any>(['null'])
    if (/^\(?if .+\)?$/.test(e) && e.includes('} else {')) {
        const at = e.indexOf('} else {')
        const a = hx10R04Variant(e.slice(e.indexOf('{') + 1, at), masked, byName, region, depth, visiting)
        const b = hx10R04Variant(e.slice(at + '} else {'.length, e.lastIndexOf('}')), masked, byName, region, depth, visiting)
        if (a !== undefined && b !== undefined) return new Set<any>([...a, ...b])
        return undefined
    }
    const precise = /^crate::precise::Precise::(\w+)\((?:(?!\()[^()]|\((?!\()(?:[^()]|\([^()]*\))*\))*\)$/.exec(e)
    if (precise !== null && /^string(?:Eq|Gt|Ge|Lt|Le|Equals)$/.test(precise[1])) return new Set<any>(['bool'])
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(e)) {
        const writes = hx10R04Writes(masked, e, region)
        if (writes === undefined) return undefined
        let acc: Hx10R04Variants | undefined = undefined
        for (const w of writes) {
            const v = hx10R04Variant(w, masked, byName, region, depth + 1, visiting)
            if (v === undefined) return undefined
            acc = acc === undefined ? v : new Set<any>([...acc].filter((x) => v.has(x)))
        }
        return acc
    }
    const call = /^self\.([a-z_][a-z0-9_]*)\s*\(/.exec(e)
    if (call !== null && hx10R04Close(e, 'self.'.length + call[1].length) === e.length - 1) {
        if (HX10R04_BOOL_BASE.test(call[1])) return new Set<any>(['bool'])
        if (/^safe_bool(_2|_k)?$/.test(call[1])) {
            return hx10R04SafeBoolDefault(e) === true ? new Set<any>(['bool', 'null']) : undefined
        }
        return hx10R04CalleeVariant(call[1], masked, byName, depth + 1, visiting)
    }
    return undefined
}

/** Union of every return expression of every same-file declaration of `name`. */
function hx10R04CalleeVariant (name: string, masked: string, byName: Map<string, Hx10R04Region[]>, depth: number, visiting: Set<string>): Hx10R04Variants | undefined {
    if (visiting.has(name) || depth > 6) return undefined
    const decls = byName.get(name)
    if (decls === undefined || decls.length === 0) return undefined
    const next = new Set(visiting)
    next.add(name)
    let acc: Hx10R04Variants | undefined = undefined
    for (const decl of decls) {
        const rets = hx10R04RetExprs(decl)
        if (rets === undefined) return undefined
        for (const r of rets) {
            const v = hx10R04Variant(r, masked, byName, decl, depth + 1, next)
            if (v === undefined) return undefined
            acc = acc === undefined ? v : new Set<any>([...acc, ...v])
        }
    }
    return acc
}

/** Every right-hand side written to local `ident` inside `region`, or undefined when it can be rebound. */
function hx10R04Writes (masked: string, ident: string, region: Hx10R04Region): string[] | undefined {
    const esc = ident.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const body = masked.slice(region.start, region.end)
    const shadow = new RegExp(`\\|(?!\\|)[^|\\n]*\\b${esc}\\b[^|\\n]*\\|(?!\\|)|\\bfor [^\\n]*\\b${esc}\\b[^\\n]* in |\\blet \\([^)]*\\b${esc}\\b`)
    if (shadow.test(body)) return undefined
    const writes: string[] = []
    const spans: Array<[number, number]> = []
    const letRe = new RegExp(`\\blet (?:mut )?${esc}\\b\\s*(?::\\s*([A-Za-z_][A-Za-z0-9_<>]*))?\\s*=`, 'g')
    for (const m of body.matchAll(letRe)) {
        const at = m.index as number
        if (m[1] !== undefined && m[1] !== 'Value') return undefined
        let depth = 0
        let j = at + m[0].length
        for (; j < body.length; j++) {
            const c = body[j]
            if (c === '(' || c === '[' || c === '{') depth++
            else if (c === ')' || c === ']' || c === '}') {
                if (depth === 0) break
                depth--
            } else if (c === ';' && depth === 0) break
        }
        writes.push(body.slice(at + m[0].length, j))
        spans.push([at, j])
    }
    const assignRe = new RegExp(`(?<![A-Za-z0-9_.])${esc}\\s*=(?!=)`, 'g')
    for (const m of body.matchAll(assignRe)) {
        const at = m.index as number
        if (spans.some(([s, e]) => at >= s && at < e)) continue
        let depth = 0
        let j = at + m[0].length
        for (; j < body.length; j++) {
            const c = body[j]
            if (c === '(' || c === '[' || c === '{') depth++
            else if (c === ')' || c === ']' || c === '}') {
                if (depth === 0) break
                depth--
            } else if (c === ';' && depth === 0) break
        }
        writes.push(body.slice(at + m[0].length, j))
    }
    if (writes.length === 0) return undefined
    return writes
}

/** Text of the statement holding `pos`, up to `pos`. */
function r04StmtBefore (masked: string, pos: number): string {
    let depth = 0
    for (let i = pos; i > 0; i--) {
        const c = masked[i - 1]
        if (c === ')' || c === ']') depth++
        else if (c === '(' || c === '[') { if (depth > 0) depth-- }
        else if (depth === 0 && (c === ';' || c === '{' || c === '}' || c === '\n')) return masked.slice(i, pos)
    }
    return masked.slice(0, pos)
}

/** Drop the balanced operand that ends `s` (an operand of `&&` / `||`). */
function r04DropOperand (s: string): string {
    let depth = 0
    for (let i = s.length - 1; i >= 0; i--) {
        const c = s[i]
        if (c === ')' || c === ']' || c === '}') depth++
        else if (c === '(' || c === '[' || c === '{') {
            if (depth === 0) return s.slice(0, i)
            depth--
            if (depth === 0 && !/[A-Za-z0-9_.)\]]/.test(s[i - 1] ?? '')) return s.slice(0, i)
        } else if (depth === 0) {
            if ((c === '&' && s[i - 1] === '&') || (c === '|' && s[i - 1] === '|')) return s.slice(0, i - 1)
            if (c === ',' || c === ';' || c === '=') return s.slice(0, i + 1)
            if (/[A-Za-z0-9_.)\]]/.test(c)) {
                let k = i
                while (k >= 0 && /[A-Za-z0-9_.]/.test(s[k])) k--
                return k < 0 ? s : s.slice(0, k + 1)
            }
        }
    }
    return ''
}

/** A `bool` is legal where `start` begins: a condition, a bool local, or a Value::Bool box. */
function r04BoolSlot (masked: string, start: number): boolean {
    let prefix = r04StmtBefore(masked, start)
    for (let hop = 0; hop < 60; hop++) {
        prefix = prefix.replace(/[\s!]+$/, '')
        if (/(?:^|[^\w])(?:if|while|for|assert)$/.test(prefix)) return true
        if (/Value::Bool\($/.test(prefix)) return true
        if (/(?:&&|\|\|)$/.test(prefix)) { prefix = r04DropOperand(prefix.slice(0, -2)); continue }
        if (/[^=!<>]=$/.test(prefix)) return /:\s*bool\s*=?$/.test(prefix.slice(0, -1))
        if (/\($/.test(prefix)) { prefix = prefix.slice(0, -1); continue }
        return false
    }
    return false
}

export function r04Callee (content: string): string {
    if (!content.includes('is_true(&')) return content
    const masked = hx10R04Mask(content)
    const regions = hx10R04Regions(masked)
    const byName = new Map<string, Hx10R04Region[]>()
    for (const r of regions) {
        const list = byName.get(r.name)
        if (list === undefined) byName.set(r.name, [r])
        else list.push(r)
    }
    const edits: Array<{ start: number, end: number, text: string }> = []
    for (const m of masked.matchAll(/(?<![A-Za-z0-9_:.])is_true\(&/g)) {
        const start = m.index as number
        const open = start + 'is_true'.length
        const close = hx10R04Close(masked, open)
        if (close < 0) continue
        const arg = content.slice(open + 1, close)
        if (arg.includes('\n')) continue
        const expr = hx10R04Strip(arg.replace(/^&/, ''))
        if (expr === '') continue
        const region = regions.find((r) => start >= r.start && start < r.end)
        if (region === undefined) continue
        if (!r04BoolSlot(masked, start)) continue
        const variants = hx10R04Variant(expr, masked, byName, region, 0, new Set())
        if (variants === undefined || !HX10R04_BOOLISH(variants)) continue
        let k = start - 1
        while (k >= 0 && (masked[k] === ' ' || masked[k] === '\t')) k--
        const negated = k >= 0 && masked[k] === '!' && masked[k - 1] !== '='
        edits.push({ start: negated ? k : start, end: close + 1, text: `${expr}.as_bool() == Some(${negated ? 'false' : 'true'})` })
    }
    if (edits.length === 0) return content
    let out = ''
    let at = 0
    for (const e of edits) {
        if (e.start < at) continue
        out += content.slice(at, e.start) + e.text
        at = e.end
    }
    return out + content.slice(at)
}

const HX10R04_CASES: Array<[string, string, string]> = [
    ['bool-only callee', 'let mut u: Value = self.is_uta(&[]).await;\nif is_true(&u) {', 'u.as_bool() == Some(true)'],
    ['direct bool callee', 'if is_true(&self.is_linear(t.clone(), &[s])) {', 'self.is_linear(t.clone(), &[s]).as_bool() == Some(true)'],
    ['negated callee', 'if !is_true(&self.is_linear(t.clone(), &[])) {', 'self.is_linear(t.clone(), &[]).as_bool() == Some(false)'],
    ['mixed arm callee', 'if is_true(&self.mixed()) {', 'is_true(&self.mixed()'],
    ['unproven local', 'let mut u: Value = get_arg(o, 0, Value::Bool(false));\nif is_true(&u) {', 'is_true(&u'],
    ['option return', 'if is_true(&self.opt()) {', 'is_true(&self.opt()'],
    ['value slot', 'm.insert("k".into(), is_true(&self.is_linear(t.clone(), &[])));', 'is_true(&self.is_linear'],
]

/** Three arg shapes per callee body: every arm Bool, one arm mixed, unknown local. */
function hx10R04Fixture (body: string): string {
    return `    pub fn is_linear(&self, mut t: Value, optional_args: &[Value]) -> Value {\n        if (t == Value::Null) {\n            return Value::Bool(true);\n        }\n        return Value::Bool(false);\n\n    Value::Null\n}\n\n    pub fn opt(&self) -> Option<Value> {
        return Some(Value::Bool(true));
    }

    pub fn mixed(&self) -> Value {\n        return Value::Int(1);\n    }\n\n    pub async fn is_uta(&mut self, optional_args: &[Value]) -> Value {\n        let mut uta: Value = Value::Bool(self.safe_bool_k(self.options.clone(), "uta", &[]).as_bool() == Some(true));\n        return uta;\n\n    Value::Null\n}\n\n    pub fn f(&mut self, mut o: Value) -> Value {\n        ${body}\n        return Value::Null; }\n}\n`
}

export function r04CalleeSelfTest (): string[] {
    const bad: string[] = []
    for (const [name, body, want] of HX10R04_CASES) {
        const src = hx10R04Fixture(body)
        const out = r04Callee(src)
        if (!out.includes(want)) bad.push(`${name}: missing ${JSON.stringify(want)}`)
        const keep = want.startsWith('is_true')
        if (keep && out !== src) bad.push(`${name}: must stay unchanged`)
        if (!keep && out.includes('`') === false && out.includes(want) === false) bad.push(`${name}: not emitted`)
    }
    return bad
}

if (process.argv.includes('--self-test') && (process.argv[1] ?? '').includes('hx10w3')) {
    const bad = r04CalleeSelfTest()
    for (const b of bad) console.log(`FAIL ${b}`)
    console.log(bad.length === 0 ? `r04-callee self-test: ${HX10R04_CASES.length} cases pass` : `r04-callee self-test: ${bad.length} failing`)
    process.exitCode = bad.length === 0 ? 0 : 1
}
