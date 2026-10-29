// hx10w2 C04: native C# ops for the inOp / isEqual / isTrue family, proved from the printed types.
// A site is rewritten only when the emitted text proves the type; every other site keeps the
// plain helper call exactly as the base pass left it.

// integer cast targets: isEqual boxes both sides and compares them as Int64, the same `==`
const NUMERIC_CAST_TYPES = [ 'Int64', 'long', 'int', 'Int64?', 'long?', 'int?' ]
// cs/ccxt/base/Exchange.Generic.cs: `public bool isDictionary (object value)` (retyped in this unit)
const BOOL_CALLS = [ 'isDictionary' ]
// cs/ccxt/ws/Client.cs: `IDictionary<string, object> subscriptions / rejections`
const CLIENT_MAP_MEMBERS = [ 'subscriptions', 'rejections' ]
const STRING_TYPES = [ 'string', 'string?' ]
const OBJECT_TYPE = 'object'

const SIGNATURE_RE = /^ {4}(?:public|private|protected|internal)\b.*\(/
const DECLARATION_RE = /^\s*([A-Za-z_][\w.<>,\[\]?]*(?:<[^;=>]*>)?)\s+([A-Za-z_]\w*)\s*(?:=|;|\?\?=|,)/
const FOREACH_RE = /^\s*foreach\s*\(\s*([A-Za-z_][\w.<>,\[\]?]*(?:<[^;=]*>)?)\s+([A-Za-z_]\w*)\s+in\b/
const NOT_A_TYPE = [ 'return', 'throw', 'else', 'case', 'await', 'new', 'in', 'if', 'while', 'using', 'var', 'yield', 'out', 'ref', 'is', 'as', 'nameof', 'default', 'null', 'true', 'false', 'this', 'base', 'do', 'for', 'foreach', 'switch', 'catch', 'try' ]

// blank out string literals (keeping their quotes) so a call scan cannot see into one
function maskLine (line: string): string {
    let out = ''
    let quote = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (quote) {
            if ((ch === '\\') && (i + 1 < line.length)) {
                out += '__'
                i++
                continue
            }
            if (ch === '"') {
                quote = false
                out += ch
            } else {
                out += '_'
            }
            continue
        }
        if (ch === '"') {
            quote = true
            out += ch
            continue
        }
        out += ch
    }
    return out
}

function callEnd (masked: string, open: number): number | undefined {
    let depth = 0
    for (let i = open; i < masked.length; i++) {
        if (masked[i] === '(') depth++
        if (masked[i] === ')') {
            depth--
            if (depth === 0) return i
        }
    }
    return undefined
}

function topLevelCommas (masked: string, open: number, close: number): number[] {
    const out: number[] = []
    let depth = 0
    for (let i = open + 1; i < close; i++) {
        const ch = masked[i]
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--
        if ((ch === ',') && (depth === 0)) out.push (i)
    }
    return out
}

function splitArguments (masked: string, open: number, close: number): string[] {
    const commas = topLevelCommas (masked, open, close)
    const out: string[] = []
    let start = open + 1
    for (const comma of commas) {
        out.push (masked.substring (start, comma))
        start = comma + 1
    }
    out.push (masked.substring (start, close))
    return out
}

function signatureParams (line: string): { [name: string]: string } {
    const out: { [name: string]: string } = {}
    const open = line.indexOf ('(')
    if (open < 0) return out
    let depth = 0
    let close = -1
    for (let i = open; i < line.length; i++) {
        if (line[i] === '(') depth++
        if (line[i] === ')') {
            depth--
            if (depth === 0) {
                close = i
                break
            }
        }
    }
    if (close < 0) return out
    for (const part of splitArguments (line, open, close)) {
        const pieces = part.split ('=')[0].trim ().split (/\s+/)
        if (pieces.length >= 2) out[pieces[pieces.length - 1]] = pieces.slice (0, -1).join (' ')
    }
    return out
}

// the emitted declaration type of `name` at line `at`, inside the member starting at `sig`
function declaredType (lines: string[], sig: number, params: { [name: string]: string }, name: string, at: number): string | undefined {
    for (let i = at - 1; i > sig; i--) {
        const line = lines[i]
        let match = DECLARATION_RE.exec (line) ?? FOREACH_RE.exec (line)
        if ((match !== null) && (match[2] === name) && !NOT_A_TYPE.includes (match[1])) return match[1]
        if ((match !== null) && (match[2] === name)) match = null
    }
    return params[name]
}

type Operand = { kind: 'numeric-cast' | 'numeric-literal' | 'other', type: string }

function operand (text: string): Operand {
    const value = text.trim ()
    const cast = /^\(\(([A-Za-z_][\w.<>?]*)\)(.+)\)$/.exec (value)
    if ((cast !== null) && NUMERIC_CAST_TYPES.includes (cast[1])) return { kind: 'numeric-cast', type: cast[1] }
    if (/^-?\d+(?:\.\d+)?[LlDdFf]?$/.test (value)) return { kind: 'numeric-literal', type: 'literal' }
    return { kind: 'other', type: '' }
}

// isEqual on one probed numeric operand and a numeric literal: the helper's integer / double
// branch computes the same `==` (a null nullable operand answers false through the lifted operator)
function nestedEqualText (left: string, right: string): string | undefined {
    const a = operand (left)
    const b = operand (right)
    const numberSide = (x: Operand, y: Operand) => ((x.kind !== 'other') && (x.kind !== 'numeric-literal') && (y.kind === 'numeric-literal'))
    if (!numberSide (a, b) && !numberSide (b, a)) return undefined
    return `(${left.trim ()} == ${right.trim ()})`
}

export function hx10W2C04NativeHelperCalls (content: string): string {
    if (!content.includes ('isEqual(') && !content.includes ('isTrue(') && !content.includes ('inOp(')) return content
    const lines = content.split ('\n')
    const masked = lines.map (maskLine)
    let signatures: number[] = []
    for (let i = 0; i < masked.length; i++) {
        if (SIGNATURE_RE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) signatures.push (i)
    }
    const signatureOf = (line: number): number => {
        let found = 0
        for (const sig of signatures) {
            if (sig <= line) found = sig
            else break
        }
        return found
    }
    let keys = 0
    let changed = false
    const out = lines.map ((line, index) => {
        if ((!line.includes ('isEqual(') && !line.includes ('isTrue(') && !line.includes ('inOp(')) || /^\s*\/\//.test (line)) return line
        const lineMask = masked[index]
        const sig = signatureOf (index)
        const params = (sig < index) ? signatureParams (masked[sig]) : {}
        const edits: { start: number, end: number, text: string }[] = []
        const add = (start: number, end: number, text: string) => {
            if (edits.some ((edit) => (start < edit.end) && (edit.start < end))) return
            edits.push ({ start, end, text })
        }
        for (const helper of [ 'isEqual', 'isTrue' ]) {
            const pattern = new RegExp ('(?<![A-Za-z0-9_.])' + helper + '\\s*\\(', 'g')
            let match: RegExpExecArray | null
            while ((match = pattern.exec (lineMask)) !== null) {
                const open = match.index + match[0].length - 1
                const close = callEnd (lineMask, open)
                if (close === undefined) continue
                const args = splitArguments (lineMask, open, close)
                const original = splitArguments (line, open, close)
                if (helper === 'isEqual') {
                    if (args.length !== 2) continue
                    const text = nestedEqualText (original[0], original[1])
                    if (text !== undefined) add (match.index, close + 1, text)
                    continue
                }
                if (args.length !== 1) continue
                const argument = args[0].trim ()
                const call = /^this\.([A-Za-z_]\w*)\s*\(/.exec (argument)
                if ((call === null) || !BOOL_CALLS.includes (call[1])) continue
                add (match.index, close + 1, original[0].trim ())
            }
        }
        const inOpPattern = /(?<![A-Za-z0-9_.])inOp\s*\(/g
        let inOpMatch: RegExpExecArray | null
        while ((inOpMatch = inOpPattern.exec (lineMask)) !== null) {
            const open = inOpMatch.index + inOpMatch[0].length - 1
            const close = callEnd (lineMask, open)
            if (close === undefined) continue
            const args = splitArguments (lineMask, open, close)
            const original = splitArguments (line, open, close)
            if (args.length !== 2) continue
            const receiver = /^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec (args[0].trim ())
            if ((receiver === null) || !CLIENT_MAP_MEMBERS.includes (receiver[2])) continue
            const owner = declaredType (masked, sig, params, receiver[1], index)
            if (owner !== 'WebSocketClient') continue
            const name = original[0].trim ()
            const key = original[1].trim ()
            const keyType = declaredType (masked, sig, params, args[1].trim (), index)
            if (/^"(?:[^"\\]|\\.)*"$/.test (key)) {
                add (inOpMatch.index, close + 1, `(${name} != null && ${name}.ContainsKey(${key}))`)
                continue
            }
            if ((keyType !== undefined) && STRING_TYPES.includes (keyType)) {
                add (inOpMatch.index, close + 1, `(${name} != null && ${key} != null && ${name}.ContainsKey(${key}))`)
                continue
            }
            if (keyType === OBJECT_TYPE) {
                const variable = `hx10w2Key${keys++}`
                add (inOpMatch.index, close + 1, `(${name} != null && ${key} is string ${variable} && ${name}.ContainsKey(${variable}))`)
            }
        }
        if (edits.length === 0) return line
        changed = true
        let rewritten = line
        for (const edit of edits.sort ((a, b) => b.start - a.start)) {
            rewritten = rewritten.substring (0, edit.start) + edit.text + rewritten.substring (edit.end)
        }
        return rewritten
    })
    return changed ? out.join ('\n') : content
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function hx10W2C04SelfTest (): string[] {
    const problems: string[] = []
    const check = (name: string, input: string, expected: string, forbidden?: string) => {
        const output = hx10W2C04NativeHelperCalls (input)
        const ok = output.includes (expected) && ((forbidden === undefined) || !output.includes (forbidden))
        if (!ok) problems.push (`hx10w2 C04: ${name}: ${output.replace (/\n/g, ' | ').slice (0, 300)}`)
    }
    const body = (line: string, prelude = '') => `public partial class BaseExchange\n{\n    public void Target (object value, Int64 i)\n    {\n${prelude}        ${line}\n    }\n}\n`
    check ('isEqual on an Int64 cast keeps the integer comparison',
        body ('if (isEqual(((Int64)i % 2L), 0)) { }'),
        'if ((((Int64)i % 2L) == 0)) { }', 'isEqual(')
    check ('isEqual on a nullable integer cast compares through the lifted operator',
        body ('return isEqual(((Int64?)((double?)i % 1000)), 0);'),
        'return (((Int64?)((double?)i % 1000)) == 0);', 'isEqual(')
    check ('isEqual on an unproven operand keeps the helper',
        body ('return isEqual(value, 0);'), 'isEqual(value, 0)')
    check ('isEqual on a cast against a non-literal keeps the helper',
        body ('return isEqual(((Int64)i), value);'), 'isEqual(((Int64)i), value)')
    check ('isTrue on the bool isDictionary call drops the wrapper',
        body ('if (isTrue(this.isDictionary(value))) { }'),
        'if (this.isDictionary(value)) { }', 'isTrue(')
    check ('isTrue on an object operand keeps the helper',
        body ('if (isTrue(value)) { }'), 'isTrue(value)')
    check ('inOp on a typed client map reads ContainsKey',
        body ('if (inOp(client.subscriptions, "ping")) { }', '        WebSocketClient client = ((WebSocketClient)this.safeValue(this.clients, value));\n'),
        '(client.subscriptions != null && client.subscriptions.ContainsKey("ping"))', 'inOp(')
    check ('inOp on a typed client map with an object key tests the key type first',
        body ('if (inOp(client.rejections, value)) { }', '        WebSocketClient client = ((WebSocketClient)this.safeValue(this.clients, value));\n'),
        'value is string hx10w2Key0 && client.rejections.ContainsKey(hx10w2Key0)', 'inOp(')
    check ('inOp on an untyped receiver keeps the helper',
        body ('if (inOp(value, "ping")) { }'), 'inOp(value, "ping")')
    const twice = hx10W2C04NativeHelperCalls (hx10W2C04NativeHelperCalls (body ('if (inOp(client.rejections, value)) { }', '        WebSocketClient client = ((WebSocketClient)this.safeValue(this.clients, value));\n')))
    if (twice.includes ('is string hx10w2Key1')) problems.push ('hx10w2 C04: the pass is not idempotent')
    if (!twice.includes ('is string hx10w2Key0')) problems.push ('hx10w2 C04: the second run lost the rewrite')
    return problems
}
