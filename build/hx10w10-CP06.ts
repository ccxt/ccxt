// hx10 wave10 CP06 (cs): the typed-core funnels emit three conversion families that are unnecessary
// where the operand already carries the helper's own type — ToOrderBookSnapshot on a proven
// IOrderBook (`.Copy()`), ToInt64Value on Int64/Int64? (identity / `?? 0`), FromDict (identity).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const CP06_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt')
const CP06_HELPERS = path.join (CP06_ROOT, 'base', 'Exchange.TranspileHelpers.cs')
const CP06_ORDERBOOK = path.join (CP06_ROOT, 'ws', 'OrderBook.cs')

const CP06_IDENTIFIER = /^[A-Za-z_]\w*$/
const CP06_LOCAL = /^\s*(Int64\??|long\??)\s+([A-Za-z_]\w*)\s*(?:=[^=]|;)/
const CP06_FOREACH = /^\s*foreach\s*\(\s*([\w<>,.? ]+?)\s+([A-Za-z_]\w*)\s+in\b/
const CP06_SIGNATURE = /^\s*(?:public|private|protected|internal)\s+(?:static\s+|async\s+|virtual\s+|override\s+|new\s+|sealed\s+)*([\w<>,.?\[\]\s]+?)\s+([A-Za-z_]\w*)\s*\(/
const CP06_CALL = /^this\.([A-Za-z_]\w*)\(.*\)$/

interface Cp06Def {
    ret: string
    params: string
    body: string
}

let cp06Definitions: Map<string, Cp06Def> | undefined
let cp06BaseReturns: Map<string, Set<string>> | undefined
let cp06BookLimitSelf: boolean | undefined

// one entry per `public static <ret> <name>(<params>)` in the helper file, body brace-scoped
function cp06DefinitionIndex (): Map<string, Cp06Def> {
    if (cp06Definitions !== undefined) {
        return cp06Definitions
    }
    const out = new Map<string, Cp06Def> ()
    let text = ''
    try {
        text = fs.readFileSync (CP06_HELPERS, 'utf8')
    } catch (e) {
        cp06Definitions = out
        return out
    }
    const lines = text.split ('\n')
    for (let i = 0; i < lines.length; i++) {
        const match = /^\s*public static ([\w<>,.?\[\]\s]+?) ([A-Za-z_]\w*)\(([^)]*)\)\s*$/.exec (lines[i])
        if (match === null) {
            continue
        }
        const body: string[] = []
        let depth = 0
        for (let j = i + 1; j < Math.min (lines.length, i + 60); j++) {
            body.push (lines[j].trim ())
            depth += (lines[j].match (/{/g) || []).length - (lines[j].match (/}/g) || []).length
            if (depth <= 0) {
                break
            }
        }
        out.set (match[2], { 'ret': match[1], 'params': match[3], 'body': body.join (' ') })
    }
    cp06Definitions = out
    return out
}

// `long` and `Int64` are the same C# type: normalise before comparing declarations
function cp06NormalizeType (type: string): string {
    return type.replace (/\blong\b/g, 'Int64')
}

// hand-written base signatures only: Exchange.BaseMethods.cs is regenerated in the same build, so a
// proof read from it would depend on pass order
function cp06BaseReturnIndex (): Map<string, Set<string>> {
    if (cp06BaseReturns !== undefined) {
        return cp06BaseReturns
    }
    const out = new Map<string, Set<string>> ()
    const dir = path.join (CP06_ROOT, 'base')
    let entries: string[] = []
    try {
        entries = fs.readdirSync (dir).filter ((name) => name.endsWith ('.cs') && name !== 'Exchange.BaseMethods.cs')
    } catch (e) {
        entries = []
    }
    for (const name of entries) {
        let text = ''
        try {
            text = fs.readFileSync (path.join (dir, name), 'utf8')
        } catch (e) {
            continue
        }
        for (const line of text.split ('\n')) {
            const match = CP06_SIGNATURE.exec (line)
            if (match === null) {
                continue
            }
            const set = out.get (match[2]) ?? new Set<string> ()
            set.add (cp06NormalizeType (match[1]))
            out.set (match[2], set)
        }
    }
    cp06BaseReturns = out
    return out
}

// `IOrderBook limit();` on the ws interface, and every implementation returning `this`: the live
// book, non-null, so `.Copy()` is the helper's own snapshot arm
function cp06OrderBookLimitReturnsSelf (): boolean {
    if (cp06BookLimitSelf !== undefined) {
        return cp06BookLimitSelf
    }
    cp06BookLimitSelf = false
    let text = ''
    try {
        text = fs.readFileSync (CP06_ORDERBOOK, 'utf8')
    } catch (e) {
        return false
    }
    const lines = text.split ('\n')
    if (!lines.some ((line) => /^\s*[\w.]*IOrderBook limit\(\);\s*$/.test (line))) {
        return false
    }
    let seen = 0
    for (let i = 0; i < lines.length; i++) {
        if (!/^\s*public (?:virtual )?[\w.]*IOrderBook limit\(\)\s*$/.test (lines[i])) {
            continue
        }
        seen++
        const body: string[] = []
        let depth = 0
        for (let j = i + 1; j < lines.length; j++) {
            body.push (lines[j].trim ())
            depth += (lines[j].match (/{/g) || []).length - (lines[j].match (/}/g) || []).length
            if (depth <= 0) {
                break
            }
        }
        if (!/\{\s*(?:.|\s)*return this;\s*\}$/.test (body.join (' '))) {
            return false
        }
    }
    cp06BookLimitSelf = seen > 0
    return cp06BookLimitSelf
}

/**
 * FromDict is `Dictionary<string, object> FromDict(Dictionary<string, object> value) { return value; }`
 * — an identity in every calling context, so the consumer funnel adds nothing.
 */
export function cp06FromIsIdentity (helper: string): boolean {
    if (helper !== 'ccxt.BaseExchange.FromDict') {
        return false
    }
    const def = cp06DefinitionIndex ().get ('FromDict')
    if (def === undefined) {
        return false
    }
    return (def.ret === 'Dictionary<string, object>')
        && (def.params.trim () === 'Dictionary<string, object> value')
        && /^\{\s*return value;\s*\}$/.test (def.body)
}

/**
 * `ToOrderBookSnapshot((x as IOrderBook).limit())` is `((x as IOrderBook).limit()).Copy()`: the cast
 * fixes the receiver type, `limit()` returns `this` (non-null live book) on every implementation.
 */
export function cp06SnapshotCopyExpression (expr: string): string {
    const def = cp06DefinitionIndex ().get ('ToOrderBookSnapshot')
    if (def === undefined) {
        return ''
    }
    const shape = /^\{\s*return \(value is ([\w.]+) book\) \? book\.(\w+)\(\) : null;\s*\}$/.exec (def.body)
    if (shape === null) {
        return ''
    }
    if ((shape[1] !== 'ccxt.pro.IOrderBook') || (shape[2] !== 'Copy')) {
        return ''
    }
    if (!cp06OrderBookLimitReturnsSelf ()) {
        return ''
    }
    const value = expr.trim ()
    if (!/^\([A-Za-z_]\w* as (?:ccxt\.pro\.)?IOrderBook\)\.limit\(\)$/.test (value)) {
        return ''
    }
    return value + '.Copy()'
}

function cp06IsParameter (name: string, methodLines: string[]): boolean {
    const signature = methodLines.find ((line) => /^\s*public\s/.test (line) && line.includes ('('))
    if (signature === undefined) {
        return false
    }
    return new RegExp ('\\b' + name + '\\b').test (signature)
}

// the operand's static type when it is Int64 / long, '' otherwise; locals must bind exactly once
function cp06Int64OperandKind (value: string, content: string, methodLines: string[]): string {
    if (CP06_IDENTIFIER.test (value)) {
        if (cp06IsParameter (value, methodLines)) {
            return ''
        }
        const types: string[] = []
        for (const line of methodLines) {
            const local = CP06_LOCAL.exec (line)
            if ((local !== null) && (local[2] === value)) {
                types.push (cp06NormalizeType (local[1]))
            }
            const each = CP06_FOREACH.exec (line)
            if ((each !== null) && (each[2] === value)) {
                types.push ('foreach')
            }
        }
        if (types.length !== 1) {
            return ''
        }
        return (types[0] === 'Int64' || types[0] === 'Int64?') ? types[0] : ''
    }
    const call = CP06_CALL.exec (value)
    if (call === null) {
        return ''
    }
    const declared = new Set<string> (cp06BaseReturnIndex ().get (call[1]) ?? [])
    for (const line of content.split ('\n')) {
        const match = CP06_SIGNATURE.exec (line)
        if ((match !== null) && (match[2] === call[1])) {
            declared.add (cp06NormalizeType (match[1]))
        }
    }
    if (declared.size !== 1) {
        return ''
    }
    const type = Array.from (declared)[0]
    return (type === 'Int64' || type === 'Int64?') ? type : ''
}

/**
 * `ToInt64Value(Int64)` is `Convert.ToInt64(value)` (identity); `ToInt64Value(Int64?)` is the
 * helper's null->0 branch, `value ?? 0`. Any other operand kind stays boxed through the helper.
 */
export function cp06Int64ValueExpression (expr: string, content: string, methodLines: string[]): string {
    const def = cp06DefinitionIndex ().get ('ToInt64Value')
    const required = cp06DefinitionIndex ().get ('ToInt64ArgRequired')
    if ((def === undefined) || (required === undefined)) {
        return ''
    }
    if ((def.ret !== 'Int64') || (def.params.trim () !== 'object value')) {
        return ''
    }
    if (!/^\{\s*return \(value == null\) \? 0 : Convert\.ToInt64\(value, System\.Globalization\.CultureInfo\.InvariantCulture\);\s*\}$/.test (required.body)) {
        return ''
    }
    const value = expr.trim ()
    const kind = cp06Int64OperandKind (value, content, methodLines)
    if (kind === 'Int64') {
        return value
    }
    if (kind === 'Int64?') {
        return value + ' ?? 0'
    }
    return ''
}

/**
 * The native expression a funnel wrapper collapses to, or '' when the site keeps the helper.
 */
export function cp06NativeCoreReturn (wrapper: string, expr: string, content: string, methodLines: string[]): string {
    if (wrapper === 'ccxt.BaseExchange.FromDict') {
        return cp06FromIsIdentity (wrapper) ? expr.trim () : ''
    }
    if (wrapper === 'ccxt.BaseExchange.ToOrderBookSnapshot') {
        return cp06SnapshotCopyExpression (expr)
    }
    if (wrapper === 'ccxt.BaseExchange.ToInt64Value') {
        return cp06Int64ValueExpression (expr, content, methodLines)
    }
    return ''
}

// self-test: each proof accepts only its own shape
export function cp06SnippetChecks (): string[] {
    const problems: string[] = []
    const printf = (name: string, got: string, expected: string) => {
        if (got !== expected) {
            problems.push ('[CP06] ' + name + ' expected `' + expected + '` got `' + got + '`')
        }
    }
    if (!cp06FromIsIdentity ('ccxt.BaseExchange.FromDict')) {
        problems.push ('[CP06] FromDict expected the identity')
    }
    if (cp06FromIsIdentity ('ccxt.BaseExchange.ToDict') || cp06FromIsIdentity ('ccxt.BaseExchange.FromDictList')) {
        problems.push ('[CP06] only FromDict is the identity')
    }
    printf ('snapshot-limit', cp06SnapshotCopyExpression ('(orderbook as IOrderBook).limit()'), '(orderbook as IOrderBook).limit().Copy()')
    printf ('snapshot-bare', cp06SnapshotCopyExpression ('orderbook'), '')
    printf ('snapshot-other', cp06SnapshotCopyExpression ('(orderbook as IOrderBook).Copy()'), '')
    const body = [
        'public async override Task<Int64> FetchTime(object parameters = null)',
        '{',
        '    Int64? timestamp = this.safeInteger(response, "timestamp");',
        '    Int64 fixedTimestamp = this.safeTimestamp(response, "ts");',
        '    object boxed = this.safeInteger(response, "ts");',
        '    foreach (var row in new List<object>() {})',
        '    {',
        '        Int64? shadowed = null;',
        '    }',
        '    Int64? shadowed = null;',
        '    return ccxt.BaseExchange.ToInt64Value(timestamp);',
        '}',
    ]
    printf ('int64-nullable-local', cp06Int64ValueExpression ('timestamp', '', body), 'timestamp ?? 0')
    printf ('int64-value-local', cp06Int64ValueExpression ('fixedTimestamp', '', body), 'fixedTimestamp')
    printf ('int64-object-local', cp06Int64ValueExpression ('boxed', '', body), '')
    printf ('int64-param', cp06Int64ValueExpression ('parameters', '', body), '')
    printf ('int64-multi-binding', cp06Int64ValueExpression ('shadowed', '', body), '')
    printf ('int64-milliseconds', cp06Int64ValueExpression ('this.milliseconds()', '', body), 'this.milliseconds()')
    printf ('int64-safeinteger', cp06Int64ValueExpression ('this.safeInteger(response, "ts")', '', body), 'this.safeInteger(response, "ts") ?? 0')
    printf ('int64-safetimestamp', cp06Int64ValueExpression ('this.safeTimestamp(response, "ts")', '', body), 'this.safeTimestamp(response, "ts") ?? 0')
    printf ('int64-generated-base', cp06Int64ValueExpression ('this.parseToInt(nonce)', '', body), '')
    printf ('int64-literal', cp06Int64ValueExpression ('null', '', body), '')
    printf ('native-from', cp06NativeCoreReturn ('ccxt.BaseExchange.FromDict', ' await this.FetchWallet(parameters) ', body, body), 'await this.FetchWallet(parameters)')
    printf ('native-other', cp06NativeCoreReturn ('ccxt.BaseExchange.ToOHLCVDict', 'payload', body, body), '')
    return problems
}
