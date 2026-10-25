// hx10 wave-2 R04: `is_true` / `is_equal` on a statically proven variant.
// A `Value` local whose every write can only be `Bool` (or `Null`) reads
// natively as `x.as_bool() == Some(true)`; two such operands compare as
// `a.as_bool() == b.as_bool()`. Everything unproven keeps the helper call.
// Runs after the base bool-local passes; only proofs they cannot see remain.

const BOOL_FNS = new Set(['safe_bool', 'safe_bool_k', 'safe_bool_2', 'get_arg_bool'])
const INT_FNS = new Set(['safe_integer', 'safe_integer_k', 'safe_integer_2', 'safe_int', 'safe_timestamp'])
const STR_FNS = new Set(['safe_string', 'safe_string_k', 'safe_string_2', 'safe_string_lower', 'safe_string_upper', 'safe_string_lower_k', 'safe_string_upper_k'])
const FLOAT_FNS = new Set(['safe_float', 'safe_float_k', 'safe_number', 'safe_number_k', 'safe_number_2'])

type Variant = 'bool' | 'int' | 'float' | 'str' | 'null'
type VariantSet = Set<Variant>

interface FnRegion { start: number, end: number, header: string }

/** Blank out string literals and line comments, preserving every offset. */
function mask (content: string): string {
    const out = content.split('')
    let i = 0
    while (i < out.length) {
        if (out[i] === '"') {
            let j = i + 1
            while (j < out.length && out[j] !== '"') {
                if (out[j] === '\\') j++
                j++
            }
            for (let k = i + 1; k < j && k < out.length; k++) out[k] = ' '
            i = j + 1
            continue
        }
        if (out[i] === '/' && out[i + 1] === '/') {
            let j = i
            while (j < out.length && out[j] !== '\n') { out[j] = ' '; j++ }
            i = j
            continue
        }
        i++
    }
    return out.join('')
}

function closeParen (masked: string, open: number): number {
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

function splitTopLevel (src: string, sep: string): string[] {
    const parts: string[] = []
    let depth = 0
    let cur = ''
    let inStr = false
    for (let i = 0; i < src.length; i++) {
        const c = src[i]
        if (inStr) {
            cur += c
            if (c === '\\') { cur += src[i + 1] ?? ''; i++; continue }
            if (c === '"') inStr = false
            continue
        }
        if (c === '"') { inStr = true; cur += c; continue }
        if (c === '(' || c === '[' || c === '{') depth++
        else if (c === ')' || c === ']' || c === '}') depth--
        if (c === sep && depth === 0) { parts.push(cur); cur = ''; continue }
        cur += c
    }
    parts.push(cur)
    return parts.map((p) => p.trim())
}

function stripOuter (src: string): string {
    let s = src.trim()
    while (s.startsWith('(') && closeParen(s, 0) === s.length - 1) s = s.slice(1, -1).trim()
    return s
}

/** Text from the start of the statement holding `pos` up to `pos`. */
function statementBefore (masked: string, pos: number): string {
    let depth = 0
    for (let i = pos; i > 0; i--) {
        const c = masked[i - 1]
        if (c === ')' || c === ']') depth++
        else if (c === '(' || c === '[') { if (depth > 0) depth-- }
        else if (depth === 0 && (c === ';' || c === '{' || c === '}' || c === '\n')) return masked.slice(i, pos)
    }
    return masked.slice(0, pos)
}

function fnRegionOf (masked: string, pos: number): FnRegion {
    const heads: number[] = [0]
    for (const m of masked.matchAll(/\n[ \t]*(?:pub )?(?:async )?fn /g)) heads.push((m.index as number) + 1)
    heads.push(masked.length)
    let lo = 0
    for (let h = 0; h + 1 < heads.length; h++) if (heads[h] <= pos) lo = h
    const body = masked.slice(heads[lo], heads[lo + 1])
    const brace = body.indexOf('{')
    return { start: heads[lo], end: heads[lo + 1], header: brace < 0 ? body : body.slice(0, brace) }
}

function rhsAfter (masked: string, from: number): string {
    let depth = 0
    for (let i = from; i < masked.length; i++) {
        const c = masked[i]
        if (c === '(' || c === '[' || c === '{') depth++
        else if (c === ')' || c === ']' || c === '}') depth--
        else if (c === ';' && depth === 0) return masked.slice(from, i).trim()
    }
    return ''
}

/** Drop the balanced expression ending `s` (an operand of `&&` / `||`). */
function stripTrailingOperand (s: string): string {
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
            if (/[A-Za-z0-9_.)]/.test(c)) {
                let k = i
                while (k >= 0 && /[A-Za-z0-9_.]/.test(s[k])) k--
                return k < 0 ? s : s.slice(0, k + 1)
            }
        }
    }
    return ''
}

/** True when a `bool` is legal at `start` (condition, bool decl, Value::Bool box). */
function boolSlotAt (masked: string, start: number): boolean {
    let prefix = statementBefore(masked, start)
    for (let hop = 0; hop < 60; hop++) {
        prefix = prefix.replace(/[\s!]+$/, '')
        if (/(?:^|[^\w])(?:if|while|for|assert|assert_eq)$/.test(prefix)) return true
        if (/Value::Bool\($/.test(prefix)) return true
        if (/(?:&&|\|\|)$/.test(prefix)) { prefix = stripTrailingOperand(prefix.slice(0, -2)); continue }
        if (/[^=!<>]=$/.test(prefix)) return /:\s*bool\s*=?$/.test(prefix.slice(0, -1))
        if (/\($/.test(prefix)) { prefix = prefix.slice(0, -1); continue }
        return false
    }
    return false
}

const UNION: Variant[] = ['bool', 'null']

/**
 * Runtime variants a write can produce, or undefined when not provable.
 * `safe_bool*` is admitted only when its default cannot be a non-bool value.
 */
function variantOf (expr: string, masked: string, region: FnRegion, depth: number): VariantSet | undefined {
    const e = stripOuter(expr)
    const lit = /^Value::(Bool|Int|Float|Str)\(/.exec(e)
    if (lit !== null && closeParen(e, 'Value::'.length + lit[1].length) === e.length - 1) {
        return new Set<Variant>([lit[1].toLowerCase() as Variant])
    }
    if (e === 'Value::Null' || e === 'crate::Value::Null') return new Set<Variant>(['null'])
    const call = /^self\.([a-z_][a-z0-9_]*)\(/.exec(e)
    if (call !== null && closeParen(e, 'self.'.length + call[1].length) === e.length - 1) {
        const name = call[1]
        if (BOOL_FNS.has(name)) return safeBoolVariants(e, masked, region, depth)
        if (INT_FNS.has(name)) return new Set<Variant>(['int', 'null'])
        if (STR_FNS.has(name)) return new Set<Variant>(['str', 'null'])
        if (FLOAT_FNS.has(name)) return new Set<Variant>(['float', 'int', 'null'])
        return undefined
    }
    if (/^\(?if /.test(e) && e.includes('} else {')) {
        const at = e.indexOf('} else {')
        const a = variantOf(e.slice(e.indexOf('{') + 1, at), masked, region, depth)
        const b = variantOf(e.slice(at + '} else {'.length, e.lastIndexOf('}')), masked, region, depth)
        if (a !== undefined && b !== undefined) return new Set<Variant>([...a, ...b])
    }
    return undefined
}

/** `safe_bool*(obj, key, &[])` is `Bool` or `Null`; a proven bool default is `Bool`. */
function safeBoolVariants (call: string, masked: string, region: FnRegion, depth: number): VariantSet | undefined {
    const open = call.indexOf('(')
    const args = splitTopLevel(call.slice(open + 1, closeParen(call, open)), ',')
    const list = /^&\[(.*)\]$/.exec(args[args.length - 1] ?? '')
    if (list === null) return undefined
    const items = list[1].trim()
    if (items === '') return new Set<Variant>(UNION)
    return boolDefault(items, masked, region, depth)
}

function boolDefault (expr: string, masked: string, region: FnRegion, depth: number): VariantSet | undefined {
    const e = stripOuter(expr)
    if (/^Value::Bool\(/.test(e) || e === 'Value::Null') return new Set<Variant>(UNION)
    const name = /^([A-Za-z_][A-Za-z0-9_]*)(?:\.clone\(\))?$/.exec(e)
    if (name === null) return undefined
    const proof = proveLocal(masked, name[1], region, depth + 1)
    if (proof.variants === undefined) return undefined
    return [...proof.variants].every((v) => v === 'bool' || v === 'null') ? new Set<Variant>(UNION) : undefined
}

interface LocalProof { kind: 'variant' | 'none', variants?: VariantSet }

/** Variant proof for every write of `name` inside one fn region. */
function proveLocal (masked: string, name: string, region: FnRegion, depth: number): LocalProof {
    if (depth > 3) return { kind: 'none' }
    const body = masked.slice(region.start, region.end)
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const shadow = new RegExp(`(?<!\\|)\\|(?!\\|)[^|\\n]*\\b${esc}\\b[^|\\n]*(?<!\\|)\\|(?!\\|)|\\bfor [^\\n]*\\b${esc}\\b[^\\n]* in |\\blet \\([^)]*\\b${esc}\\b`)
    if (shadow.test(body)) return { kind: 'none' }
    const types = new Set<string>()
    const param = new RegExp(`\\b(?:mut )?${esc}\\s*:\\s*([A-Za-z_][A-Za-z0-9_<>]*)`).exec(region.header)
    if (param !== null) types.add(param[1])
    const writes: string[] = []
    const spans: Array<[number, number]> = []
    const letRe = new RegExp(`\\blet (?:mut )?${esc}\\b\\s*(?::\\s*([A-Za-z_][A-Za-z0-9_<>]*))?\\s*=`, 'g')
    for (const m of body.matchAll(letRe)) {
        const at = m.index as number
        const rhs = rhsAfter(masked, region.start + at + m[0].length)
        spans.push([at, at + m[0].length + rhs.length])
        if (m[1] !== undefined) types.add(m[1])
        writes.push(rhs)
    }
    const assignRe = new RegExp(`(?<![A-Za-z0-9_.])${esc}\\s*=(?!=)`, 'g')
    for (const m of body.matchAll(assignRe)) {
        const at = m.index as number
        if (spans.some(([s, e]) => at >= s && at < e)) continue
        writes.push(rhsAfter(masked, region.start + at + m[0].length))
        types.add('?')
    }
    const only = [...types]
    if (writes.length === 0 || only.some((t) => t !== 'Value' && t !== '?')) return { kind: 'none' }
    let acc: VariantSet | undefined = undefined
    for (const w of writes) {
        const v = variantOf(w, masked, region, depth)
        if (v === undefined) return { kind: 'none' }
        acc = acc === undefined ? v : new Set<Variant>([...acc].filter((x) => v.has(x)))
        if (acc.size === 0) return { kind: 'none' }
    }
    return acc === undefined ? { kind: 'none' } : { kind: 'variant', variants: acc }
}

const isBoolOnly = (v: VariantSet): boolean => [...v].every((x) => x === 'bool' || x === 'null')

/** `!is_true(&X)` flips the comparison instead of wrapping it. */
function pushEdit (edits: Array<{ start: number, end: number, text: string }>, masked: string, start: number, close: number, text: string): void {
    let k = start - 1
    while (k >= 0 && (masked[k] === ' ' || masked[k] === '\t')) k--
    if (k >= 0 && masked[k] === '!' && masked[k - 1] !== '=') {
        edits.push({ start: k, end: close + 1, text: text.replace(' == ', ' != ') })
        return
    }
    edits.push({ start, end: close + 1, text })
}

export function r04Scalars (content: string): string {
    if (!content.includes('is_true(&') && !content.includes('is_equal(&')) return content
    const masked = mask(content)
    const edits: Array<{ start: number, end: number, text: string }> = []
    for (const m of masked.matchAll(/(?<![A-Za-z0-9_:.])(is_true|is_equal)\(&/g)) {
        const start = m.index as number
        const open = start + m[1].length
        const close = closeParen(masked, open)
        if (close < 0) continue
        if (!boolSlotAt(masked, start)) continue
        const args = splitTopLevel(content.slice(open + 1, close), ',')
        const region = fnRegionOf(masked, start)
        const proofOf = (e: string): VariantSet | undefined => {
            if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e)) return undefined
            return proveLocal(masked, e, region, 0).variants
        }
        if (m[1] === 'is_true') {
            if (args.length !== 1) continue
            const operand = stripOuter(args[0].replace(/^&/, ''))
            const variants = proofOf(operand)
            if (variants === undefined || !isBoolOnly(variants)) continue
            pushEdit(edits, masked, start, close, `${operand}.as_bool() == Some(true)`)
            continue
        }
        if (args.length !== 2) continue
        const a = stripOuter(args[0].replace(/^&/, ''))
        const b = stripOuter(args[1].replace(/^&/, ''))
        const lit = (e: string): boolean => e === 'Value::Null' || /^Value::Bool\((?:true|false)\)$/.test(e)
        if (lit(a) && lit(b)) continue
        const va = lit(a) ? new Set<Variant>(UNION) : proofOf(a)
        const vb = lit(b) ? new Set<Variant>(UNION) : proofOf(b)
        if (va === undefined || vb === undefined || !isBoolOnly(va) || !isBoolOnly(vb)) continue
        const asOption = (e: string): string => {
            const box = /^Value::Bool\((true|false)\)$/.exec(e)
            if (box !== null) return `Some(${box[1]})`
            return e === 'Value::Null' ? 'None' : `${e}.as_bool()`
        }
        pushEdit(edits, masked, start, close, `${asOption(a)} == ${asOption(b)}`)
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

const CASES: Array<[string, string, string]> = [
    ['box-only local', 'let mut flag: Value = Value::Bool(false);\n        if is_true(&flag) {', 'if flag.as_bool() == Some(true) {'],
    ['ternary writes', 'let mut flag: Value = Value::Bool(false);\n        flag = (if c { Value::Bool(true) } else { Value::Bool(false) });\n        if is_true(&flag) {', 'if flag.as_bool() == Some(true) {'],
    ['safe_bool empty default', 'let mut flag: Value = self.safe_bool_k(o, "k", &[]);\n        if is_true(&flag) {', 'if flag.as_bool() == Some(true) {'],
    ['safe_bool proven default', 'let mut pre: Value = Value::Bool(a != Value::Null);\n        let mut flag: Value = self.safe_bool_k(o, "k", &[pre.clone()]);\n        if is_true(&flag) {', 'if flag.as_bool() == Some(true) {'],
    ['negated', 'let mut flag: Value = self.safe_bool_k(o, "k", &[]);\n        if !is_true(&flag) {', 'if flag.as_bool() != Some(true) {'],
    ['is_equal pair', 'let mut a: Value = Value::Bool(true);\n        let mut b: Value = self.safe_bool_k(o, "k", &[]);\n        if is_equal(&a, &b) {', 'if a.as_bool() == b.as_bool() {'],
    ['value slot keeps helper', 'let mut flag: Value = self.safe_bool_k(o, "k", &[]);\n        m.insert("k".into(), is_true(&flag));', 'is_true(&flag)'],
    ['mixed write keeps helper', 'let mut flag: Value = Value::Bool(false);\n        flag = get_arg(o, 0, Value::Null);\n        if is_true(&flag) {', 'is_true(&flag)'],
    ['any default keeps helper', 'let mut flag: Value = self.safe_bool_k(o, "k", &[other]);\n        if is_true(&flag) {', 'is_true(&flag)'],
]

/** Each case: the native text must appear, and the helper must be gone unless the case keeps it. */
export function r04SelfTest (): string[] {
    const bad: string[] = []
    for (const [name, body, want] of CASES) {
        const src = `    pub fn f(&mut self) -> Value {\n        ${body} return Value::Null; }\n    Value::Null\n}\n`
        const out = r04Scalars(src)
        if (!out.includes(want)) bad.push(`${name}: missing ${JSON.stringify(want)}`)
        const keep = want.startsWith('is_true') || want.startsWith('is_equal')
        if (keep && out !== src) bad.push(`${name}: must stay unchanged`)
        if (!keep && (out.includes('is_true(&') || out.includes('is_equal(&'))) bad.push(`${name}: helper left`)
    }
    return bad
}

if ((process.argv[1] ?? '').endsWith('hx10w2-R04.ts') && process.argv.includes('--self-test')) {
    const bad = r04SelfTest()
    for (const b of bad) console.log(`FAIL ${b}`)
    console.log(bad.length === 0 ? `r04 self-test: ${CASES.length} cases pass` : `r04 self-test: ${bad.length} failing`)
    process.exitCode = bad.length === 0 ? 0 : 1
}
