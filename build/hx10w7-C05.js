// hx10 wave7 C05: `isEqual (<native arithmetic>, <int literal>)` -> `(<arith> == <lit>)`.
// The arithmetic text an earlier pass already emitted is numeric by construction (every other
// operand pair keeps mod()/multiply()/divide()/subtract()), and C# compares that value with an
// integer literal exactly as isEqual's integer / double branch does, a null nullable answering
// false on both sides. `+` is excluded: a native `+` may be string concatenation.
const ARITHMETIC_OPS = [ '%', '*', '/', '-' ]

// characters that cannot appear at the top level of a numeric operand
const NON_ARITHMETIC = [ '?', ':', '=', '<', '>', '!', '&', '|', ',', '"', '\'' ]

const HELPER_CALL = /(?<![A-Za-z0-9_.])(?:mod|add|subtract|multiply|divide|callDynamically|isEqual|isGreaterThan|isLessThan|isTrue)\(/

// blank out string and char literals, so an operator inside one is never read as arithmetic
function maskLiterals (line) {
    let out = ''
    let quote = null
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (quote !== null) {
            if (ch === '\\') {
                out += '  '
                i++
                continue
            }
            if (ch === quote) quote = null
            out += ' '
            continue
        }
        if ((ch === '"') || (ch === "'")) {
            quote = ch
            out += ' '
            continue
        }
        out += ch
    }
    return out
}

// the `)` closing the call whose `(` sits at `open`
function callEnd (line, open) {
    let depth = 0
    for (let i = open; i < line.length; i++) {
        if (line[i] === '(') depth++
        if (line[i] === ')') {
            depth--
            if (depth === 0) return i
        }
    }
    return undefined
}

// the argument spans of the call body `body`, or undefined when it is not a plain two-argument list
function argumentSpans (body) {
    const spans = []
    let depth = 0
    let start = 0
    for (let i = 0; i < body.length; i++) {
        const ch = body[i]
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--
        if ((ch === ',') && (depth === 0)) {
            spans.push ({ start, end: i })
            start = i + 1
        }
        if (depth < 0) return undefined
    }
    if (depth !== 0) return undefined
    spans.push ({ start, end: body.length })
    return (spans.length === 2) ? spans : undefined
}

// the text of an operand with the parentheses wrapping the whole of it removed
function stripOuterParens (text) {
    let stripped = text.trim ()
    while (stripped.startsWith ('(') && stripped.endsWith (')')) {
        let depth = 0
        let whole = true
        for (let i = 0; i < stripped.length; i++) {
            if (stripped[i] === '(') depth++
            if (stripped[i] === ')') depth--
            if ((depth === 0) && (i < stripped.length - 1)) {
                whole = false
                break
            }
        }
        if (!whole) break
        stripped = stripped.slice (1, -1).trim ()
    }
    return stripped
}

// boolean: the masked text is one native arithmetic expression over the operators above
function isNativeArithmetic (masked) {
    const stripped = stripOuterParens (masked)
    if ((stripped === '') || HELPER_CALL.test (stripped)) return false
    let depth = 0
    let ops = 0
    for (let i = 0; i < stripped.length; i++) {
        const ch = stripped[i]
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--
        if (depth < 0) return false
        if (depth !== 0) continue
        if (NON_ARITHMETIC.includes (ch)) return false
        if (ARITHMETIC_OPS.includes (ch)) ops++
    }
    return (depth === 0) && (ops > 0)
}

function integerLiteral (masked) {
    return /^-?\d{1,15}$/.test (masked.trim ())
}

// the edit for one `isEqual(` call, or undefined when the operands keep the helper
function equalityEdit (original, masked, matchIndex, open, close) {
    const spans = argumentSpans (masked.substring (open + 1, close))
    if (spans === undefined) return undefined
    const args = spans.map ((span) => original.substring (open + 1 + span.start, open + 1 + span.end).trim ())
    const masks = spans.map ((span) => masked.substring (open + 1 + span.start, open + 1 + span.end).trim ())
    const pair = ((isNativeArithmetic (masks[0]) && integerLiteral (masks[1]))
        || (isNativeArithmetic (masks[1]) && integerLiteral (masks[0])))
    if (!pair) return undefined
    return { start: matchIndex, end: close + 1, text: `(${args[0]} == ${args[1]})` }
}

export function hx10C05NativeArithmeticEquality (content) {
    if (!content.includes ('isEqual(')) return content
    const lines = content.split ('\n')
    let changed = false
    const out = lines.map ((line) => {
        if (!line.includes ('isEqual(')) return line
        const trimmed = line.trimStart ()
        if (trimmed.startsWith ('//') || trimmed.startsWith ('*') || trimmed.startsWith ('/*')) return line
        const masked = maskLiterals (line)
        const edits = []
        const call = /(?<![A-Za-z0-9_.])isEqual\(/g
        let match
        while ((match = call.exec (masked)) !== null) {
            const open = match.index + match[0].length - 1
            const close = callEnd (masked, open)
            if (close === undefined) continue
            const edit = equalityEdit (line, masked, match.index, open, close)
            if (edit !== undefined) edits.push (edit)
        }
        if (edits.length === 0) return line
        changed = true
        let rewritten = line
        for (const edit of edits.reverse ()) {
            rewritten = rewritten.slice (0, edit.start) + edit.text + rewritten.slice (edit.end)
        }
        return rewritten
    })
    return changed ? out.join ('\n') : content
}
