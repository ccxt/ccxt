// hx10 wave9 CP04 (cs): the typed-core funnels wrap every `return` expression in
// ToDict/ToDictList (`value as T`, null-preserving). Where the expression already HAS that
// reference type in C# the wrap is the identity, so the return prints bare. Proofs are read
// from the emitted declaration text only (this file's signatures, cs/ccxt/base, cs/ccxt/api).
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// the two dictionary shapes the funnels materialise; every other target stays untouched
const CP04_TARGETS = [ 'Dictionary<string, object>', 'List<Dictionary<string, object>>' ]
const CP04_ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'cs', 'ccxt')

const CP04_API_METHOD = /^\s*public async Task<(.+)> (\w+) \(object parameters = null\)/
const CP04_SIGNATURE = /^\s*(?:public|private|protected|internal)\s+(?:static\s+|async\s+|virtual\s+|override\s+|new\s+|sealed\s+)*([\w<>,.?\[\]\s]+?)\s+([A-Za-z_]\w*)\s*\(/
// one local declaration; `var` counts as an occurrence but can never prove a type
const CP04_DECLARATION = /^\s*(var|object|string\??|bool\??|double\??|Int64\??|int\??|I?List<[\w<>,.? ]*>|I?Dictionary<[\w<>,.? ]*>|ccxt\.[\w.<>?]+)\s+([A-Za-z_]\w*)\s*(?:=[^=]|;)/
const CP04_FOREACH = /^\s*foreach\s*\(\s*([\w<>,.?\s]+?)\s+([A-Za-z_]\w*)\s+in\b/
const CP04_IDENTIFIER = /^[A-Za-z_]\w*$/
const CP04_CALL = /^(await\s+)?(this|base)\.([A-Za-z_]\w*)\s*\(/
const CP04_BARE_CALL = /^(await\s+)?([A-Za-z_]\w*)\s*\(/

const cp04ApiTables = new Map<string, Map<string, string> | undefined> ()
const cp04SameFileSignatures = new Map<string, Map<string, Set<string>>> ()
let cp04BaseSignatures: Map<string, Set<string>> | undefined

// the venue id the content is emitted into: the generated class carries it
function cp04Venue (content: string): string {
    const match = /^\s*public (?:partial )?class (\w+)/m.exec (content)
    return (match === null) ? '' : match[1]
}

// implicit-API endpoints: the generated wrapper's own `Task<T>` is what the compiler sees
function cp04ApiTable (venue: string, prediction: boolean): Map<string, string> | undefined {
    if (venue === '') {
        return undefined
    }
    const key = (prediction ? 'prediction:' : 'root:') + venue
    if (cp04ApiTables.has (key)) {
        return cp04ApiTables.get (key)
    }
    const predictionFile = path.join (CP04_ROOT, 'api', 'prediction', venue + '.cs')
    const rootFile = path.join (CP04_ROOT, 'api', venue + '.cs')
    const candidates = prediction ? [ predictionFile, rootFile ] : [ rootFile, predictionFile ]
    let table: Map<string, string> | undefined
    for (const file of candidates) {
        let text
        try {
            text = fs.readFileSync (file, 'utf8')
        } catch (e) {
            continue // hand-written venue or a checkout without the generated api tree
        }
        table = new Map ()
        for (const line of text.split ('\n')) {
            const match = CP04_API_METHOD.exec (line)
            if ((match !== null) && (match[1] !== 'object')) {
                table.set (match[2], match[1])
            }
        }
        break
    }
    cp04ApiTables.set (key, table)
    return table
}

function cp04BaseIndex (): Map<string, Set<string>> {
    if (cp04BaseSignatures !== undefined) {
        return cp04BaseSignatures
    }
    const index = new Map<string, Set<string>> ()
    let files: string[] = []
    try {
        files = fs.readdirSync (path.join (CP04_ROOT, 'base')).filter ((f) => f.endsWith ('.cs'))
    } catch (e) {
        files = []
    }
    for (const file of files) {
        let text
        try {
            text = fs.readFileSync (path.join (CP04_ROOT, 'base', file), 'utf8')
        } catch (e) {
            continue
        }
        // a generated base file is rewritten during this same build: reading it here would make
        // the proof depend on the pass order, so only the hand-written files are evidence
        if (text.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') !== -1) {
            continue
        }
        for (const line of text.split ('\n')) {
            const match = CP04_SIGNATURE.exec (line)
            if (match !== null) {
                const types = index.get (match[2])
                if (types === undefined) {
                    index.set (match[2], new Set ([ match[1].trim () ]))
                } else {
                    types.add (match[1].trim ())
                }
            }
        }
    }
    cp04BaseSignatures = index
    return index
}

function cp04SameFileIndex (content: string): Map<string, Set<string>> {
    const cached = cp04SameFileSignatures.get (content)
    if (cached !== undefined) {
        return cached
    }
    const index = new Map<string, Set<string>> ()
    for (const line of content.split ('\n')) {
        const match = CP04_SIGNATURE.exec (line)
        if (match !== null) {
            const types = index.get (match[2])
            if (types === undefined) {
                index.set (match[2], new Set ([ match[1].trim () ]))
            } else {
                types.add (match[1].trim ())
            }
        }
    }
    if (cp04SameFileSignatures.size > 64) {
        cp04SameFileSignatures.clear ()
    }
    cp04SameFileSignatures.set (content, index)
    return index
}

// every declared C# return type of `name` the emitted text proves; >1 distinct spelling is unproven
function cp04DeclaredReturnTypes (content: string, name: string): string[] {
    const types = new Set<string> ()
    const sameFile = cp04SameFileIndex (content)
    if (sameFile.has (name)) {
        for (const type of sameFile.get (name) as Set<string>) {
            types.add (type)
        }
        return [ ...types ]
    }
    // a pascalized call site reads the camelCase declaration (typeCores runs before the rename)
    const lower = name.charAt (0).toLowerCase () + name.slice (1)
    if (sameFile.has (lower)) {
        for (const type of sameFile.get (lower) as Set<string>) {
            types.add (type)
        }
        return [ ...types ]
    }
    const base = cp04BaseIndex ()
    if (base.has (name)) {
        for (const type of base.get (name) as Set<string>) {
            types.add (type)
        }
    }
    return [ ...types ]
}

function cp04UnwrapTask (type: string): string {
    const match = /^Task<(.+)>$/.exec (type)
    return (match === null) ? type : match[1]
}

function cp04SplitParams (plist: string): string[] {
    const out: string[] = []
    let depth = 0
    let current = ''
    for (const ch of plist) {
        if ((ch === '<') || (ch === '(') || (ch === '[')) {
            depth += 1
        } else if ((ch === '>') || (ch === ')') || (ch === ']')) {
            depth -= 1
        }
        if ((ch === ',') && (depth === 0)) {
            out.push (current)
            current = ''
            continue
        }
        current += ch
    }
    out.push (current)
    return out.filter ((p) => p.trim () !== '')
}

// name -> every binding the method text declares (one binding per name per method in C#,
// except sibling blocks, whose duplicate makes the name unprovable)
function cp04MethodBindings (methodLines: string[]): Map<string, string[]> {
    const bindings = new Map<string, string[]> ()
    const add = (name: string, type: string) => {
        const known = bindings.get (name)
        if (known === undefined) {
            bindings.set (name, [ type ])
        } else {
            known.push (type)
        }
    }
    for (let i = 0; i < methodLines.length; i++) {
        const line = methodLines[i]
        const trimmed = line.trimStart ()
        if ((i > 0) && (trimmed.startsWith ('//') || trimmed.startsWith ('*'))) {
            continue
        }
        const declaration = CP04_DECLARATION.exec (line)
        if (declaration !== null) {
            add (declaration[2], declaration[1].trim ())
            continue
        }
        const loop = CP04_FOREACH.exec (line)
        if (loop !== null) {
            add (loop[2], loop[1].trim ())
        }
    }
    // parameters of the enclosing signature line
    const signature = (methodLines.length > 0) ? methodLines[0] : ''
    const open = signature.indexOf ('(')
    const close = signature.lastIndexOf (')')
    if ((open !== -1) && (close > open)) {
        for (const param of cp04SplitParams (signature.substring (open + 1, close))) {
            const decl = param.split ('=')[0].trim ().split (/\s+/)
            if (decl.length >= 2) {
                add (decl[decl.length - 1], decl.slice (0, -1).join (' '))
            }
        }
    }
    return bindings
}

/**
 * True when wrapping `expr` in the dictionary helper that materialises `targetType` would only
 * rename the type the expression already has, so the return can print bare.
 */
export function cp04ReturnIsAlreadyTyped (expr: string, targetType: string, content: string, methodLines: string[], prediction = false): boolean {
    if (CP04_TARGETS.indexOf (targetType) === -1) {
        return false
    }
    const value = expr.trim ()
    if (value === '') {
        return false
    }
    // `null` fits every reference-typed return: the helper hands it back unchanged
    if (value === 'null') {
        return true
    }
    if (value.startsWith ('new ' + targetType)) {
        return true
    }
    const call = CP04_CALL.exec (value) ?? CP04_BARE_CALL.exec (value)
    if (call !== null) {
        const awaited = call[1] !== undefined
        const name = (call.length === 4) ? call[3] : call[2]
        if (awaited) {
            const api = cp04ApiTable (cp04Venue (content), prediction)
            if ((api !== undefined) && api.has (name)) {
                return api.get (name) === targetType
            }
        }
        const declared = cp04DeclaredReturnTypes (content, name)
        if (declared.length !== 1) {
            return false
        }
        return (awaited ? cp04UnwrapTask (declared[0]) : declared[0]) === targetType
    }
    if (CP04_IDENTIFIER.test (value)) {
        const bindings = cp04MethodBindings (methodLines)
        const types = bindings.get (value)
        return (types !== undefined) && (types.length === 1) && (types[0] === targetType)
    }
    return false
}

/**
 * True when the `Int64?`/`double?` argument conversion around `argument` is the identity: the
 * helper's own nullable parameter takes the value unchanged.
 */
export function cp04NumericArgPassThrough (helper: string, argument: string): boolean {
    if ((helper !== 'ToInt64Arg') && (helper !== 'ToDoubleArg')) {
        return false
    }
    return argument === 'null'
}

// self-test: each proof accepts only its own shape
export function cp04SnippetChecks (): string[] {
    const pad = '    '
    const wrap = (lines: string[]) => [ 'public class Test {', pad + 'public virtual Dictionary<string, object> helper(object value = null)', pad + '{', pad + pad + 'return null;', pad + '}', pad + 'public async override Task<Dictionary<string, object>> f(object parameters = null)', pad + '{' ].concat (lines, [ pad + '}', '}' ]).join ('\n')
    const text = wrap ([
        pad + pad + 'object boxed = null;',
        pad + pad + 'Dictionary<string, object> row = new Dictionary<string, object>() {};',
        pad + pad + 'IDictionary<string, object> iface = this.safeDict(parameters, "k");',
        pad + pad + 'foreach (var entry in new List<object>() {})',
        pad + pad + '{',
        pad + pad + pad + 'object entryCopy = entry;',
        pad + pad + '}',
    ])
    const methodLines = text.split ('\n')
    const dictionary = 'Dictionary<string, object>'
    const dictList = 'List<Dictionary<string, object>>'
    const cases: [string, string, string, string[], boolean][] = [
        [ 'null', 'null', dictionary, methodLines, true ],
        [ 'new-dict', 'new Dictionary<string, object>() {}', dictionary, methodLines, true ],
        [ 'new-dictlist', 'new List<Dictionary<string, object>>() {}', dictList, methodLines, true ],
        [ 'local-typed', 'row', dictionary, methodLines, true ],
        [ 'local-boxed', 'boxed', dictionary, methodLines, false ],
        [ 'local-interface', 'iface', dictionary, methodLines, false ],
        [ 'foreach-var', 'entry', dictionary, methodLines, false ],
        [ 'wrong-target', 'null', 'Int64', methodLines, false ],
        [ 'unindexed-call', 'this.unknownHelper(parameters)', dictionary, methodLines, false ],
        [ 'typed-call', 'this.helper(parameters)', dictionary, methodLines, true ],
        [ 'awaited-typed', 'await this.f(parameters)', dictionary, methodLines, true ],
    ]
    const problems: string[] = []
    for (const [ name, expr, target, lines, expected ] of cases) {
        const got = cp04ReturnIsAlreadyTyped (expr, target, text, lines)
        if (got !== expected) {
            problems.push ('[CP04] ' + name + ' expected ' + String (expected) + ' got ' + String (got))
        }
    }
    if (!cp04NumericArgPassThrough ('ToInt64Arg', 'null') || !cp04NumericArgPassThrough ('ToDoubleArg', 'null')) {
        problems.push ('[CP04] null numeric argument expected pass-through')
    }
    if (cp04NumericArgPassThrough ('ToInt64Arg', 'since') || cp04NumericArgPassThrough ('ToInt64ArgRequired', 'null')) {
        problems.push ('[CP04] non-null argument expected the helper')
    }
    return problems
}
