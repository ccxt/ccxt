// hx10 wave5 C12 (cs): the core-argument twins `ToInt64Arg` / `ToInt64ArgRequired` (and their
// `double` siblings) convert a boxed operand into the parameter's numeric box. On an operand whose
// declared C# type is already that box the conversion is the identity -- null stays null, an
// `Int64`/`double` is returned unchanged -- so the call site passes the operand through instead.
// Everything else (a member read, a call, an `object` box, conflicting declarations) keeps the
// emitted helper call unchanged.

// helper -> the declared C# types on which it is the identity
const C12_IDENTITY_BOXES: { [helper: string]: string[] } = {
    'ToInt64Arg': [ 'Int64?', 'Int64' ],
    'ToInt64ArgRequired': [ 'Int64' ],
    'ToDoubleArg': [ 'double?', 'double' ],
    'ToDoubleArgRequired': [ 'double' ],
}

// a generated method signature is one 4-space-indented line that closes with `)`
const C12_SIGNATURE = /^ {4}(?:public|private|protected|internal)\b.*\)\s*$/
// a local declaration whose type this proof understands; anything else stays unproven
const C12_LOCAL = /^\s*(Int64\?|Int64|double\?|double|object|string\?|string|int\?|int|long\?|long|bool\?|bool|var|I?List<[^>]*>|I?Dictionary<[^>]*>|ccxt\.[\w.<>?]+)\s+([A-Za-z_]\w*)\s*(?:=[^=]|;\s*$)/
const C12_IDENT = /^[A-Za-z_]\w*$/

// the parameter list of a signature line, split on the commas outside generics/parens
function c12Params (line: string): string[] {
    const open = line.indexOf ('(')
    if (open === -1) {
        return []
    }
    const body = line.slice (open + 1, line.lastIndexOf (')'))
    const out: string[] = []
    let depth = 0
    let cur = ''
    for (const ch of body) {
        if ((ch === '<') || (ch === '(') || (ch === '[') || (ch === '{')) {
            depth += 1
        } else if ((ch === '>') || (ch === ')') || (ch === ']') || (ch === '}')) {
            depth -= 1
        }
        if ((ch === ',') && (depth === 0)) {
            out.push (cur)
            cur = ''
            continue
        }
        cur += ch
    }
    out.push (cur)
    return out.filter ((p) => p.trim () !== '')
}

// add one declaration; a name declared twice with different types answers `null` (unproven)
function c12Add (types: { [name: string]: string | null }, name: string, type: string): void {
    const known = types[name]
    if (known === undefined) {
        types[name] = type
        return
    }
    if (known !== type) {
        types[name] = null
    }
}

/**
 * True when the `helper` wrap around the bare identifier `argument` at offset `at` of `content`
 * only renames the type the operand already has, so the argument can be printed bare.
 */
export function c12CoreArgPassThrough (content: string, at: number, helper: string, argument: string): boolean {
    const boxes = C12_IDENTITY_BOXES[helper]
    if ((boxes === undefined) || !C12_IDENT.test (argument)) {
        return false
    }
    const declared = c12DeclaredType (content, at, argument)
    return (declared !== null) && (boxes.indexOf (declared) !== -1)
}

/**
 * The C# type `argument` is declared with in the generated method around offset `at`, or null
 * when it is unproven (no signature, a conflicting redeclaration, an unknown declaration form).
 */
function c12DeclaredType (content: string, at: number, argument: string): string | null {
    const lines = content.split ('\n')
    let lineIndex = 0
    for (let i = 0, off = 0; i < lines.length; i++) {
        if (off + lines[i].length >= at) {
            lineIndex = i
            break
        }
        off += lines[i].length + 1
    }
    let sig = -1
    for (let i = lineIndex; i >= 0; i--) {
        if (C12_SIGNATURE.test (lines[i])) {
            sig = i
            break
        }
    }
    if (sig === -1) {
        return null
    }
    const types: { [name: string]: string | null } = {}
    for (const param of c12Params (lines[sig])) {
        const decl = param.split ('=')[0].trim ().split (/\s+/)
        if (decl.length >= 2) {
            c12Add (types, decl[decl.length - 1], decl.slice (0, -1).join (' '))
        }
    }
    for (let i = sig + 1; i < lineIndex; i++) {
        const line = lines[i]
        if (line.trim ().startsWith ('//')) {
            continue
        }
        const decl = C12_LOCAL.exec (line)
        if (decl !== null) {
            c12Add (types, decl[2], decl[1])
        }
    }
    const declared = types[argument]
    return (declared === undefined) ? null : declared
}

/**
 * M358: `ToDoubleArgRequired(x)` on a `double?` operand is `x ?? 0d` (null surfaces as 0, the
 * boxed double converts to itself), and on `(-x)` of a `double` operand the negation is already
 * the `double` box. Returns the native operand, or '' when the operand is not one of those.
 */
export function c12RequiredDoubleNative (content: string, at: number, helper: string, argument: string): string {
    if (helper !== 'ToDoubleArgRequired') {
        return ''
    }
    const negated = /^\(-([A-Za-z_]\w*)\)$/.exec (argument)
    if (negated !== null) {
        return (c12DeclaredType (content, at, negated[1]) === 'double') ? argument : ''
    }
    if (C12_IDENT.test (argument) && (c12DeclaredType (content, at, argument) === 'double?')) {
        return '(' + argument + ' ?? 0d)'
    }
    return ''
}

// self-test: the nullable/non-nullable boxes, the unproven `object` box, a member operand, and a
// call site with no enclosing generated signature
export function c12SnippetChecks (): string[] {
    const pad = '    '
    const sig = pad + 'public async override Task<List<object>> FetchClosedOrders(string symbol = null, Int64? since = null, object parameters = null)'
    const wrap = (lines: string[]) => [ 'public class Test {', sig, pad + '{' ].concat (lines, [ pad + '}', '}' ]).join ('\n')
    const call = (helperName: string, argName: string) => 'ccxt.BaseExchange.' + helperName + '(' + argName + ')'
    const ret = (helperName: string, argName: string) => pad + pad + 'return await this.FetchOrders(symbol,' + call (helperName, argName) + ', parameters);'
    const cases: [string, string, string, string[], boolean][] = [
        [ 'param-box', 'ToInt64Arg', 'since', [ ret ('ToInt64Arg', 'since') ], true ],
        [ 'param-object', 'ToInt64Arg', 'parameters', [ ret ('ToInt64Arg', 'parameters') ], false ],
        [ 'local-box', 'ToInt64Arg', 'sinceMs', [ pad + pad + 'Int64? sinceMs = since;', ret ('ToInt64Arg', 'sinceMs') ], true ],
        [ 'required-nullable', 'ToInt64ArgRequired', 'since', [ ret ('ToInt64ArgRequired', 'since') ], false ],
        [ 'required-box', 'ToInt64ArgRequired', 'sinceCount', [ pad + pad + 'Int64 sinceCount = 0;', ret ('ToInt64ArgRequired', 'sinceCount') ], true ],
        [ 'member', 'ToInt64Arg', 'since', [ ret ('ToInt64Arg', 'this.since') ], false ],
        [ 'double-box', 'ToDoubleArg', 'amount', [ pad + pad + 'double? amount = 0;', ret ('ToDoubleArg', 'amount') ], true ],
        [ 'required-double-nullable', 'ToDoubleArgRequired', 'amount', [ pad + pad + 'double? amount = 0;', ret ('ToDoubleArgRequired', 'amount') ], false ],
    ]
    const problems: string[] = []
    const nativeCases: [string, string, string[], string][] = [
        [ 'amount', 'amount', [ pad + pad + 'double? amount = 0;' ], '(amount ?? 0d)' ],
        [ 'amount', 'amount', [ pad + pad + 'object amount = 0;' ], '' ],
        [ '(-amount)', '(-amount)', [ pad + pad + 'double amount = 0;' ], '(-amount)' ],
        [ '(-amount)', '(-amount)', [ pad + pad + 'double? amount = 0;' ], '' ],
    ]
    for (const [ , argName, lines, expected ] of nativeCases) {
        const text = wrap (lines.concat ([ ret ('ToDoubleArgRequired', argName) ]))
        const at = text.indexOf ('ToDoubleArgRequired(') + 'ToDoubleArgRequired('.length
        const got = c12RequiredDoubleNative (text, at, 'ToDoubleArgRequired', argName)
        if (got !== expected) {
            problems.push ('[C12] native ' + argName + ' expected ' + expected + ' got ' + got)
        }
    }
    for (const [ name, helperName, argName, lines, expected ] of cases) {
        const text = wrap (lines)
        const needle = helperName + '(' + argName + ')'
        const at = text.indexOf (needle)
        const got = (at === -1) ? false : c12CoreArgPassThrough (text, at + helperName.length + 1, helperName, argName)
        if (got !== expected) {
            problems.push ('[C12] ' + name + ' expected ' + String (expected) + ' got ' + String (got))
        }
    }
    const bare = pad + pad + 'return await this.FetchOrders(symbol,' + call ('ToInt64Arg', 'since') + ', parameters);'
    if (c12CoreArgPassThrough (bare, bare.indexOf (call ('ToInt64Arg', 'since')) + 'ToInt64Arg('.length, 'ToInt64Arg', 'since')) {
        problems.push ('[C12] no-signature expected false')
    }
    return problems
}
