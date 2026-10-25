// hx10 wave3 C04 (cs): the exchange members this.positions / this.currencies / this.urls /
// this.headers as native dictionary ops. `urls` and `headers` are retyped
// IDictionary<string, object> in cs/ccxt/base/Exchange.Options.cs; `currencies` and `positions`
// stay `object` because a few venues store a non-dictionary there (positions: the ArrayCache
// subclasses), so their sites carry an identity cast instead. Per site: receiver proven -> the
// helper's own dictionary answer spelled natively, anything else -> the helper call unchanged.

// cs/ccxt/base/Exchange.Options.cs now declares these dictionaries
const C04_TYPED_FIELDS = [ 'urls', 'headers' ]
// still `object`: `currencies` writers all live in the base file, `positions` is written per venue
const C04_OBJECT_FIELDS: { [field: string]: boolean } = { 'currencies': true, 'positions': false }
const C04_STRING_TYPES = [ 'string', 'string?' ]
const C04_CALL = /(?<![\w.])(getValue|inOp)\s*\(/g
const C04_OMIT_DECL = /^(\s*)object\s+([A-Za-z_]\w*)\s*=\s*this\.omit\s*\(/
const C04_SIGNATURE = /^ {4}(?:public|private|protected|internal)\b.*\(/
const C04_DECLARATION = /(?:^|[^\w.])(string\??|object|bool\??|Int64\??|int|long|double|var|Dictionary<string,\s*object>|IDictionary<string,\s*object>|List<[^>]*>|IList<[^>]*>|[A-Z][\w.]*(?:<[^;=()]*>)?)\s+([A-Za-z_]\w*)\s*(?==|;|,|\)|\bin\b)/
const C04_KEYWORDS = [ 'return', 'throw', 'else', 'case', 'await', 'new', 'in', 'if', 'while', 'using', 'var',
    'out', 'ref', 'is', 'as', 'null', 'true', 'false', 'this', 'base', 'default', 'nameof', 'typeof', 'yield',
    'foreach', 'for', 'switch', 'catch', 'do', 'goto', 'params', 'operator', 'implicit', 'explicit', 'where' ]

function c04MaskLine (line: string): string {
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

function c04CallEnd (masked: string, open: number): number | undefined {
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

function c04SplitArguments (masked: string, open: number, close: number): string[] {
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

function c04SignatureParams (line: string): { [name: string]: string } {
    const out: { [name: string]: string } = {}
    const open = line.indexOf ('(')
    if (open < 0) return out
    const close = c04CallEnd (line, open)
    if (close === undefined) return out
    for (const part of c04SplitArguments (line, open, close)) {
        const declaration = part.trim ().split ('=')[0].trim ()
        const pieces = declaration.split (/\s+/)
        if (pieces.length >= 2) out[pieces[pieces.length - 1]] = pieces.slice (0, -1).join (' ')
    }
    return out
}

// every C# type this file binds to `name` in the method region (a local declaration or a
// parameter); one distinct type is the proof, two bindings of different types are not
function c04RegionBindings (masked: string[], start: number, end: number, params: { [name: string]: string }): { [name: string]: string[] } {
    const out: { [name: string]: string[] } = {}
    const add = (name: string, type: string) => {
        if (C04_KEYWORDS.includes (type)) return
        out[name] = out[name] ?? []
        if (!out[name].includes (type)) out[name].push (type)
    }
    for (const name of Object.keys (params)) add (name, params[name])
    for (let i = start; i < end; i++) {
        const line = masked[i]
        if (/^\s*\/\//.test (line)) continue
        let match: RegExpExecArray | null
        const pattern = new RegExp (C04_DECLARATION.source, 'g')
        while ((match = pattern.exec (line)) !== null) add (match[2], match[1].replace (/\s+/g, ' '))
    }
    return out
}

// the member's box, in this file, is a Dictionary or null on every write: `new Dictionary`,
// `new dict`, createSafeDictionary/mapToSafeMap (both declared IDictionary), an `as dict` read,
// the same member of a source exchange, or a local declared/created as a dictionary
function c04DictOnlyWrite (lines: string[], field: string, allowNoWrites: boolean): boolean {
    const write = new RegExp ('this\\.' + field + '\\s*=(?!=)')
    let writes = 0
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (!write.test (line)) continue
        if (/^\s*\/\//.test (line)) continue
        writes++
        const rhs = line.substring (line.search (write)).replace (new RegExp ('^this\\.' + field + '\\s*=\\s*'), '').trim ()
        if (/^null\b/.test (rhs)) continue
        if (/^new\s+(?:Dictionary<string,\s*object>|dict\b)/.test (rhs)) continue
        if (/^this\.(?:createSafeDictionary|mapToSafeMap)\s*\(/.test (rhs)) continue
        if (/^SafeValue\s*\(.*\bas\s+dict\b/.test (rhs)) continue
        if (/^sourceExchange\./.test (rhs)) continue
        const bare = /^([A-Za-z_]\w*)\s*;?$/.exec (rhs)
        if (bare !== null) {
            const name = bare[1]
            const declared = new RegExp ('(?:Dictionary<string,\\s*object>|IDictionary<string,\\s*object>)\\s+' + name + '\\b')
            const filled = new RegExp ('(?:^|[^\\w.])' + name + '\\s*=\\s*new\\s+(?:Dictionary<string,\\s*object>|dict)\\b')
            if (lines.some ((l) => declared.test (l) || filled.test (l))) continue
        }
        return false
    }
    return writes > 0 || allowNoWrites
}

// `object x = this.omit (this.urls, "k")` -> the declaration names the dictionary overload's
// result, so the write back into the retyped member keeps compiling (one line, as in java)
export function c04OmitDictLocals (content: string): string {
    if (!content.includes ('= this.omit(') && !content.includes ('= this.omit (')) return content
    const lines = content.split ('\n')
    const masked = lines.map (c04MaskLine)
    const signatures: number[] = []
    for (let i = 0; i < masked.length; i++) {
        if (C04_SIGNATURE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) signatures.push (i)
    }
    let changed = false
    for (let i = 0; i < masked.length; i++) {
        const match = C04_OMIT_DECL.exec (masked[i])
        if (match === null) continue
        const name = match[2]
        const open = masked[i].indexOf ('(', match[0].length - 1)
        const close = c04CallEnd (masked[i], open)
        if (close === undefined) continue
        const args = c04SplitArguments (masked[i], open, close)
        if (args.length !== 2) continue
        const receiver = /^this\.([A-Za-z_]\w*)$/.exec (args[0].trim ())
        if ((receiver === null) || !C04_TYPED_FIELDS.includes (receiver[1])) continue
        const sig = signatures.filter ((s) => s <= i).pop () ?? 0
        const end = signatures.filter ((s) => s > i).shift () ?? lines.length
        const assignment = new RegExp ('(?<![\\w.])' + name + '\\s*=(?!=)', 'g')
        let assignments = 0
        for (let k = sig; k < end; k++) assignments += (masked[k].match (assignment) ?? []).length
        if (assignments !== 1) continue
        if (new RegExp ('(?<![\\w.])(?:ref|out)\\s+' + name + '\\b').test (masked.slice (sig, end).join ('\n'))) continue
        lines[i] = match[1] + 'Dictionary<string, object>' + lines[i].substring (match[1].length + 'object'.length)
        masked[i] = c04MaskLine (lines[i])
        changed = true
    }
    return changed ? lines.join ('\n') : content
}

// getValue / inOp on the four members: the helper's dictionary branch spelled natively
export function c04FieldNativeReads (content: string): string {
    if (!/(?<![\w.])(?:getValue|inOp)\s*\(\s*this\./.test (content)) return content
    const lines = content.split ('\n')
    const masked = lines.map (c04MaskLine)
    const dictOnly: { [field: string]: boolean } = {}
    for (const field of Object.keys (C04_OBJECT_FIELDS)) dictOnly[field] = c04DictOnlyWrite (masked, field, C04_OBJECT_FIELDS[field])
    const signatures: number[] = []
    for (let i = 0; i < masked.length; i++) {
        if (C04_SIGNATURE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) signatures.push (i)
    }
    const signatureOf = (line: number): number => {
        let found = 0
        for (const sig of signatures) {
            if (sig <= line) found = sig
            else break
        }
        return found
    }
    const bindingsOf: { [sig: number]: { [name: string]: string[] } } = {}
    let patterns = 0
    let changed = false
    const out = lines.map ((line, index) => {
        if (!/(?<![\w.])(?:getValue|inOp)\s*\(\s*this\./.test (masked[index])) return line
        if (/^\s*\/\//.test (line)) return line
        const sig = signatureOf (index)
        const end = (signatures.indexOf (sig) + 1 < signatures.length) ? signatures[signatures.indexOf (sig) + 1] : lines.length
        if (bindingsOf[sig] === undefined) bindingsOf[sig] = c04RegionBindings (masked, sig, end, c04SignatureParams (masked[sig]))
        const bindings = bindingsOf[sig]
        const edits: { start: number, end: number, text: string }[] = []
        C04_CALL.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = C04_CALL.exec (masked[index])) !== null) {
            const helper = match[1]
            const open = match.index + match[0].length - 1
            const close = c04CallEnd (masked[index], open)
            if (close === undefined) continue
            if (edits.some ((edit) => (match!.index < edit.end) && (close >= edit.start))) continue
            const args = c04SplitArguments (masked[index], open, close)
            const original = c04SplitArguments (line, open, close)
            if (args.length !== 2) continue
            const receiver = /^this\.([A-Za-z_]\w*)$/.exec (args[0].trim ())
            if (receiver === null) continue
            const field = receiver[1]
            let target = ''
            if (C04_TYPED_FIELDS.includes (field)) {
                target = 'this.' + field
            } else if (Object.prototype.hasOwnProperty.call (C04_OBJECT_FIELDS, field)) {
                if (!dictOnly[field]) continue
                target = '((IDictionary<string,object>)this.' + field + ')'
            } else {
                continue
            }
            const keyMask = args[1].trim ()
            const key = original[1].trim ()
            const receiverTest = `${target} != null`
            if (/^"(?:[^"\\]|\\.)*"$/.test (keyMask)) {
                const literal = helper === 'inOp'
                    ? `(${receiverTest} && ${target}.ContainsKey(${key}))`
                    : `(${receiverTest} && ${target}.ContainsKey(${key}) ? ${target}[${key}] : null)`
                edits.push ({ start: match.index, end: close + 1, text: literal })
                continue
            }
            if (!/^[A-Za-z_]\w*$/.test (keyMask)) continue
            const types = bindings[keyMask]
            if ((types === undefined) || (types.length !== 1)) continue
            const type = types[0]
            if (C04_STRING_TYPES.includes (type)) {
                const text = helper === 'inOp'
                    ? `(${receiverTest} && ${key} != null && ${target}.ContainsKey(${key}))`
                    : `(${receiverTest} && ${key} != null && ${target}.ContainsKey(${key}) ? ${target}[${key}] : null)`
                edits.push ({ start: match.index, end: close + 1, text })
                continue
            }
            if (type !== 'object') continue
            if (helper === 'getValue') {
                // GetValue's dictionary branch casts the key: a non-string key throws there too
                const text = `(${receiverTest} && ${key} != null && ${target}.ContainsKey((string)${key}) ? ${target}[(string)${key}] : null)`
                edits.push ({ start: match.index, end: close + 1, text })
            } else {
                // InOp's IDictionary branch answers false for a non-string key
                const variable = `hx10w3Key${patterns++}`
                const text = `(${receiverTest} && ${key} is string ${variable} && ${target}.ContainsKey(${variable}))`
                edits.push ({ start: match.index, end: close + 1, text })
            }
        }
        if (edits.length === 0) return line
        changed = true
        let rewritten = line
        for (const edit of edits.sort ((a, b) => b.start - a.start)) {
            rewritten = rewritten.substring (0, edit.start) + edit.text + rewritten.substring (edit.end)
        }
        masked[index] = c04MaskLine (rewritten)
        return rewritten
    })
    return changed ? out.join ('\n') : content
}

// `((IDictionary<string,object>)this.urls)` on a member that now IS that interface: an identity
// cast, so the same member does the work (the printer's core read form spells it out)
export function c04DropFieldCasts (content: string): string {
    let out = content
    for (const field of C04_TYPED_FIELDS) {
        for (const spelling of [ '((IDictionary<string, object>)this.', '((IDictionary<string,object>)this.' ]) {
            out = out.split (spelling + field + ')').join ('this.' + field)
        }
    }
    return out
}

export function c04Apply (content: string): string {
    return c04DropFieldCasts (c04FieldNativeReads (c04OmitDictLocals (content)))
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function c04SnippetChecks (): string[] {
    const problems: string[] = []
    const body = (line: string, prelude = '') => `public partial class BaseExchange\n{\n    public void Target (object value)\n    {\n${prelude}        ${line}\n    }\n}\n`
    const check = (name: string, input: string, expected: string, forbidden?: string) => {
        const output = c04Apply (input)
        const ok = output.includes (expected) && ((forbidden === undefined) || !output.includes (forbidden))
        if (!ok) problems.push (`hx10w3 C04: ${name}: ${output.replace (/\n/g, ' | ').slice (0, 320)}`)
    }
    const positions = '        this.positions = new Dictionary<string, object>() {};\n'
    check ('getValue on a retyped member reads the indexer',
        body ('string url = (string)getValue(this.urls, "api");'),
        '(this.urls != null && this.urls.ContainsKey("api") ? this.urls["api"] : null)', 'getValue(')
    check ('inOp on a retyped member tests ContainsKey',
        body ('if (inOp(this.headers, "x-simulated-trading")) { }'),
        '(this.headers != null && this.headers.ContainsKey("x-simulated-trading"))', 'inOp(')
    check ('the cast on a retyped member is an identity',
        body ('object a = ((IDictionary<string, object>)this.urls)["api"];'),
        'object a = this.urls["api"];', 'IDictionary')
    check ('the cast on an object member stays',
        body ('object a = ((IDictionary<string,object>)this.currencies)["BTC"];'),
        '((IDictionary<string,object>)this.currencies)["BTC"]')
    check ('getValue on an object member with dictionary-only writes casts once',
        body ('object a = getValue(this.positions, type);', positions).replace ('(object value)', '(object value, object type)'),
        '(((IDictionary<string,object>)this.positions) != null && type != null && ((IDictionary<string,object>)this.positions).ContainsKey((string)type) ? ((IDictionary<string,object>)this.positions)[(string)type] : null)')
    check ('inOp on an object member tests the key type first',
        body ('if (inOp(this.positions, type)) { }', positions).replace ('(object value)', '(object value, object type)'),
        'type is string hx10w3Key0 && ((IDictionary<string,object>)this.positions).ContainsKey(hx10w3Key0)')
    check ('a member written with a non-dictionary keeps the helper',
        body ('object a = getValue(this.positions, type);', '        this.positions = new ArrayCacheBySymbolById();\n').replace ('(object value)', '(object value, object type)'),
        'getValue(this.positions, type)')
    check ('a string-typed key keeps its null test',
        body ('object a = getValue(this.currencies, code);', '        this.currencies = this.createSafeDictionary();\n').replace ('(object value)', '(object value, string code)'),
        '((IDictionary<string,object>)this.currencies) != null && code != null && ((IDictionary<string,object>)this.currencies).ContainsKey(code)', 'getValue(')
    check ('a non-string key keeps the helper',
        body ('object a = getValue(this.urls, n);', '        Int64 n = 0;\n'),
        'getValue(this.urls, n)')
    check ('an omit into a retyped member names its declaration',
        body ('object newUrls = this.omit(this.urls, "apiBackup");\n        this.urls = newUrls;'),
        'Dictionary<string, object> newUrls = this.omit(this.urls, "apiBackup");')
    check ('an omit of more than two arguments keeps the object declaration',
        body ('object newUrls = this.omit(this.urls, new List<object>() {"a"}, value);\n        this.urls = newUrls;'),
        'object newUrls = this.omit(')
    const twice = c04Apply (c04Apply (body ('if (inOp(this.positions, type)) { }', positions).replace ('(object value)', '(object value, object type)')))
    if (!twice.includes ('type is string hx10w3Key0')) problems.push ('hx10w3 C04: the pass is not idempotent')
    if (twice.includes ('hx10w3Key1')) problems.push ('hx10w3 C04: the second run renumbered the pattern variable')
    return problems
}
