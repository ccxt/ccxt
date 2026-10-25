// hx10 wave4 BF01 (cs): typed views for the base dictionaries. Exchange.Options.cs declares
// this.urlsApi (urls['api'], a Dict in the TS base) and this.currenciesDict; a helper read on
// either box becomes ContainsKey/indexer, every unproven shape keeps the helper call unchanged.

const BF01_API_SECTION = /^\(\s*this\.urls\s*!=\s*null\s*&&\s*this\.urls\s*\.\s*ContainsKey\s*\(\s*"api"\s*\)\s*\?\s*this\.urls\s*\[\s*"api"\s*\]\s*:\s*null\s*\)$/
// member -> the typed spelling of the same dictionary
const BF01_VIEWS: { [field: string]: string } = {
    'urls': 'this.urls',
    'currencies': 'this.currenciesDict',
    'currencies_by_id': 'this.currencies_by_id',
    'requiredCredentials': 'this.requiredCredentials',
}
const BF01_LOCAL_FIELDS: { [field: string]: string } = {
    'urls': 'this.urls',
    'currencies': 'this.currenciesDict',
    'currencies_by_id': 'this.currencies_by_id',
    'requiredCredentials': 'this.requiredCredentials',
}
const BF01_STRING_TYPE = /^string\??$/
const BF01_CALL = /(?<![A-Za-z0-9_.])(getValue|inOp)\s*\(/g
const BF01_HAS_TARGET = /(?<![A-Za-z0-9_.])(?:getValue|inOp)\s*\(/
const BF01_SIGNATURE = /^ {4}(?:public|private|protected|internal)\b.*\(/
const BF01_DECLARATION = /(?:^|[^\w.])(string\??|object|bool\??|Int64\??|int|long|double|var|Dictionary<string,\s*object>|IDictionary<string,\s*object>|List<[^>]*>|IList<[^>]*>|[A-Z][\w.]*(?:<[^;=()]*>)?)\s+([A-Za-z_]\w*)\s*(?==|;|,|\)|\bin\b)/g
const BF01_NOT_A_TYPE = /^(?:return|throw|else|case|await|new|in|if|while|using|var|out|ref|is|as|null|true|false|this|base|default|nameof|typeof|yield|foreach|for|switch|catch|do|goto|params|operator|implicit|explicit|where)$/
const BF01_LOCAL_DECL = /^\s*object\s+([A-Za-z_]\w*)\s*=\s*this\.(?:urls|currencies|currencies_by_id|requiredCredentials)\s*;\s*$/m
const BF01_DICT_TYPE = 'IDictionary<string, object>'

function bf01MaskLine (line: string): string {
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
                out += '"'
            } else {
                out += '_'
            }
            continue
        }
        if (ch === '"') {
            quote = true
            out += '"'
            continue
        }
        out += ch
    }
    return out
}

function bf01CallEnd (masked: string, open: number): number | undefined {
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

function bf01SplitArguments (masked: string, open: number, close: number): string[] {
    const out: string[] = []
    let depth = 0
    let start = open + 1
    for (let i = open + 1; i < close; i++) {
        const ch = masked[i]
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--
        if ((ch === ',') && (depth === 0)) {
            out.push (masked.substring (start, i))
            start = i + 1
        }
    }
    out.push (masked.substring (start, close))
    return out
}

function bf01SignatureParams (line: string): { [name: string]: string } {
    const out: { [name: string]: string } = {}
    const open = line.indexOf ('(')
    if (open < 0) return out
    const close = bf01CallEnd (line, open)
    if (close === undefined) return out
    for (const part of bf01SplitArguments (line, open, close)) {
        const declaration = part.trim ().split ('=')[0].trim ()
        const pieces = declaration.split (/\s+/)
        if (pieces.length >= 2) out[pieces[pieces.length - 1]] = pieces.slice (0, -1).join (' ')
    }
    return out
}

// every type this file binds to `name` in the method region; one distinct type is the proof
function bf01RegionBindings (masked: string[], start: number, end: number, params: { [name: string]: string }): { [name: string]: string[] } {
    const out: { [name: string]: string[] } = {}
    const add = (name: string, type: string) => {
        const clean = type.replace (/\s+/g, ' ').trim ()
        if (clean.match (BF01_NOT_A_TYPE) !== null) return
        out[name] = out[name] ?? []
        if (out[name].indexOf (clean) < 0) out[name].push (clean)
    }
    for (const name of Object.keys (params)) add (name, params[name])
    for (let i = start; i < end; i++) {
        const line = masked[i]
        if (line.trimStart ().startsWith ('//')) continue
        for (const match of line.matchAll (BF01_DECLARATION)) {
            add (match[2], match[1])
        }
    }
    return out
}

// the typed spelling of `this.<field>` and of the locals this file binds to it
function bf01LocalViews (content: string): { [name: string]: string } {
    const out: { [name: string]: string } = {}
    const lines = content.split ('\n')
    for (const field of Object.keys (BF01_VIEWS)) {
        const view = BF01_VIEWS[field]
        const escaped = view.replace (/\./g, '\\.')
        const declaration = new RegExp ('^\\s*IDictionary<string,\\s*object>\\s+([A-Za-z_]\\w*)\\s*=\\s*' + escaped + '\\s*;\\s*$')
        for (const line of lines) {
            const match = declaration.exec (line)
            if (match === null) continue
            const name = match[1]
            const writes = new RegExp ('(?<![\\w.])' + name + '\\s*=(?!=)', 'g')
            let count = 0
            for (const other of lines) count += (other.match (writes) ?? []).length
            if (count !== 1) continue
            out[name] = view
        }
    }
    return out
}

// `object x = this.<field>` -> the typed view, for a local this file binds once
export function bf01FieldLocals (content: string): string {
    if (content.match (BF01_LOCAL_DECL) === null) return content
    const lines = content.split ('\n')
    let changed = false
    for (let i = 0; i < lines.length; i++) {
        const match = BF01_LOCAL_DECL.exec (lines[i])
        if (match === null) continue
        const name = match[1]
        const writes = new RegExp ('(?<![\\w.])' + name + '\\s*=(?!=)', 'g')
        let count = 0
        for (const line of lines) count += (line.match (writes) ?? []).length
        if (count !== 1) continue
        const field = Object.keys (BF01_LOCAL_FIELDS).find ((f) => lines[i].indexOf ('this.' + f + ';') > 0)
        if (field === undefined) continue
        const indent = lines[i].substring (0, lines[i].indexOf ('object'))
        lines[i] = indent + BF01_DICT_TYPE + ' ' + name + ' = ' + BF01_LOCAL_FIELDS[field] + ';'
        changed = true
    }
    return changed ? lines.join ('\n') : content
}

// the identity casts on the retyped members and on the typed locals
export function bf01FieldCasts (content: string): string {
    let out = content
    const targets: { [name: string]: string } = {}
    for (const field of [ 'urls', 'currencies', 'requiredCredentials' ]) targets['this.' + field] = BF01_VIEWS[field]
    const locals = bf01LocalViews (out)
    for (const name of Object.keys (locals)) targets[name] = name
    for (const name of Object.keys (targets)) {
        for (const spelling of [ '((IDictionary<string, object>)', '((IDictionary<string,object>)' ]) {
            out = out.split (spelling + name + ')').join (targets[name])
        }
    }
    return out
}

// getValue / inOp on a typed view: the helper's dictionary answer spelled natively
export function bf01FieldReads (content: string): string {
    if (content.match (BF01_HAS_TARGET) === null) return content
    const lines = content.split ('\n')
    const masked = lines.map (bf01MaskLine)
    const signatures: number[] = []
    for (let lineIndex = 0; lineIndex < masked.length; lineIndex++) {
        const isSignature = (masked[lineIndex].match (BF01_SIGNATURE) !== null) && !masked[lineIndex].trimEnd ().endsWith (';')
        if (isSignature) {
            signatures[signatures.length] = lineIndex
        }
    }
    const locals = bf01LocalViews (content)
    const bindingsOf: { [sig: number]: { [name: string]: string[] } } = {}
    const signatureOf = (line: number): number => {
        let found = 0
        for (const sig of signatures) {
            if (sig <= line) found = sig
            else break
        }
        return found
    }
    let patterns = 0
    let changed = false
    const out = lines.map ((line, index) => {
        if (masked[index].match (BF01_HAS_TARGET) === null) return line
        if (line.trimStart ().startsWith ('//')) return line
        const sig = signatureOf (index)
        const position = signatures.indexOf (sig)
        const end = (position + 1 < signatures.length) ? signatures[position + 1] : lines.length
        if (bindingsOf[sig] === undefined) bindingsOf[sig] = bf01RegionBindings (masked, sig, end, bf01SignatureParams (masked[sig]))
        const bindings = bindingsOf[sig]
        const edits: { start: number, end: number, text: string }[] = []
        for (const match of masked[index].matchAll (BF01_CALL)) {
            const helper = match[1]
            const start = match.index ?? 0
            const open = start + match[0].length - 1
            const close = bf01CallEnd (masked[index], open)
            if (close === undefined) continue
            if (edits.some ((edit) => (start < edit.end) && (close >= edit.start))) continue
            const args = bf01SplitArguments (masked[index], open, close)
            const original = bf01SplitArguments (line, open, close)
            if (args.length !== 2) continue
            const receiver = original[0].trim ()
            let target = ''
            if (receiver.match (BF01_API_SECTION) !== null) {
                target = 'this.urlsApi'
            } else {
                const member = /^this\.([A-Za-z_]\w*)$/.exec (receiver)
                const local = /^([A-Za-z_]\w*)$/.exec (receiver)
                if ((member !== null) && Object.prototype.hasOwnProperty.call (BF01_VIEWS, member[1])) {
                    target = BF01_VIEWS[member[1]]
                } else if ((local !== null) && (locals[local[1]] !== undefined)) {
                    target = local[1]
                } else {
                    continue
                }
            }
            const keyMask = args[1].trim ()
            const key = original[1].trim ()
            const receiverTest = `${target} != null`
            if (keyMask.match (/^"(?:[^"\\]|\\.)*"$/) !== null) {
                const text = (helper === 'inOp')
                    ? `(${receiverTest} && ${target}.ContainsKey(${key}))`
                    : `(${receiverTest} && ${target}.ContainsKey(${key}) ? ${target}[${key}] : null)`
                edits.push ({ start, end: close + 1, text })
                continue
            }
            if (keyMask.match (/^[A-Za-z_]\w*$/) === null) continue
            const types = bindings[keyMask]
            if ((types === undefined) || (types.length !== 1)) continue
            const type = types[0]
            if (type.match (BF01_STRING_TYPE) !== null) {
                const text = (helper === 'inOp')
                    ? `(${receiverTest} && ${key} != null && ${target}.ContainsKey(${key}))`
                    : `(${receiverTest} && ${key} != null && ${target}.ContainsKey(${key}) ? ${target}[${key}] : null)`
                edits.push ({ start, end: close + 1, text })
                continue
            }
            if (type !== 'object') continue
            if (helper === 'getValue') {
                // GetValue's dictionary branch casts the key, so a non-string key throws there too
                const text = `(${receiverTest} && ${key} != null && ${target}.ContainsKey((string)${key}) ? ${target}[(string)${key}] : null)`
                edits.push ({ start, end: close + 1, text })
            } else {
                // InOp's dictionary branch answers false for a non-string key
                const variable = `hx10w4Key${patterns++}`
                const text = `(${receiverTest} && ${key} is string ${variable} && ${target}.ContainsKey(${variable}))`
                edits.push ({ start, end: close + 1, text })
            }
        }
        if (edits.length === 0) return line
        changed = true
        let rewritten = line
        for (const edit of edits.sort ((a, b) => b.start - a.start)) {
            rewritten = rewritten.substring (0, edit.start) + edit.text + rewritten.substring (edit.end)
        }
        masked[index] = bf01MaskLine (rewritten)
        return rewritten
    })
    return changed ? out.join ('\n') : content
}

export function bf01Apply (content: string): string {
    return bf01FieldReads (bf01FieldCasts (bf01FieldLocals (content)))
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function bf01SnippetChecks (): string[] {
    const problems: string[] = []
    const body = (line: string, params = 'object value', prelude = '') => `public partial class BaseExchange\n{\n    public void Target (${params})\n    {\n${prelude}        ${line}\n    }\n}\n`
    const check = (name: string, input: string, expected: string, forbidden?: string) => {
        const output = bf01Apply (input)
        const ok = output.includes (expected) && ((forbidden === undefined) || !output.includes (forbidden))
        if (!ok) problems.push (`hx10w4 BF01: ${name}: ${output.replace (/\n/g, ' | ').slice (0, 320)}`)
    }
    const guard = '(this.urls != null && this.urls.ContainsKey("api") ? this.urls["api"] : null)'
    check ('a literal section read is the typed view',
        body (`object url = getValue(${guard}, "ws");`),
        '(this.urlsApi != null && this.urlsApi.ContainsKey("ws") ? this.urlsApi["ws"] : null)', 'getValue(')
    check ('an object key casts like GetValue',
        body (`object url = getValue(${guard}, type);`, 'object value, object type'),
        '(this.urlsApi != null && type != null && this.urlsApi.ContainsKey((string)type) ? this.urlsApi[(string)type] : null)')
    check ('a string key needs no cast',
        body (`object url = getValue(${guard}, section);`, 'object value, string section'),
        '(this.urlsApi != null && section != null && this.urlsApi.ContainsKey(section) ? this.urlsApi[section] : null)')
    check ('inOp on the section tests the key type',
        body (`if (inOp(${guard}, type)) { }`, 'object value, object type'),
        '(this.urlsApi != null && type is string hx10w4Key0 && this.urlsApi.ContainsKey(hx10w4Key0))')
    check ('a numeric key keeps the helper',
        body (`object url = getValue(${guard}, n);`, 'object value, Int64 n'),
        'getValue(', 'urlsApi')
    check ('the currencies cast is the view',
        body ('object a = ((IDictionary<string,object>)this.currencies)[code];', 'object value, string code'),
        'object a = this.currenciesDict[code];', 'IDictionary')
    check ('the requiredCredentials cast is the member',
        body ('object a = ((IDictionary<string, object>)this.requiredCredentials)[code];', 'object value, string code'),
        'object a = this.requiredCredentials[code];', 'IDictionary')
    check ('a local from a retyped member is typed and read natively',
        body ('if (inOp(currencies, code)) { return; }',
            'object value, string code',
            '        object currencies = this.currencies;\n'),
        '(currencies != null && code != null && currencies.ContainsKey(code))', 'inOp(')
    check ('the retyped local declares the dictionary',
        body ('if (inOp(currencies, code)) { return; }',
            'object value, string code',
            '        object currencies = this.currencies;\n'),
        'IDictionary<string, object> currencies = this.currenciesDict;')
    check ('a member with a non-dictionary write keeps its helper',
        body ('object a = getValue(this.positions, type);', 'object value, object type'),
        'getValue(this.positions, type)', 'positionsDict')
    check ('another member keeps its helper',
        body ('object a = getValue(this.options, "x");'),
        'getValue(this.options, "x")')
    const once = bf01Apply (body (`object url = getValue(${guard}, type);`, 'object value, object type'))
    const twice = bf01Apply (once)
    if (once !== twice) problems.push ('hx10w4 BF01: the pass is not idempotent')
    const keyed = bf01Apply (body ('if (inOp(currencies, code) || inOp(currencies, type)) { return; }',
        'object value, string code, object type',
        '        object currencies = this.currencies;\n'))
    if (keyed.includes ('hx10w4Key1') || !keyed.includes ('hx10w4Key0')) problems.push ('hx10w4 BF01: the key pattern counter is unstable')
    return problems
}
