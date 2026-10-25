// hx10w5 G01 (go): urls views. go/v4/exchange.go declares UrlsApi (urls["api"], a Dict in the TS
// base declaration) and UrlsApiSections (its dictionary entries) and re-derives both in
// RefreshUrlsViews after every urls write; a GetValue read whose receiver is one of those boxes
// prints as the view's own map index. A receiver or key that is not a proven Go string, and every
// shape the views cannot type, keeps the plain helper call unchanged.

const G01_VIEW = 'this.UrlsApi'
const G01_SECTIONS = 'this.UrlsApiSections'
const G01_REFRESH = 'this.RefreshUrlsViews()'
// a GetValue call, with the package qualifier the sub-packages print
const G01_CALL_TEXT = '(?:ccxt\\.|ccxtprediction\\.)?GetValue\\('
const G01_STRING_LITERAL = /^"(?:[^"\\\n]|\\.)*"$/
// `this.Urls["api"]` / `this.Urls[api]` / `this.UrlsApi`, the three receivers a view can name
const G01_API_RECEIVERS = ['this.Urls["api"]', G01_VIEW]
const G01_VIEW_INDEX = /^this\.UrlsApi\[(.+)\]$/
// a write of urls or one of its entries: the views have to be re-derived after it
const G01_WRITE = /^([ \t]*)this\.Urls(?:\[[^\]]*\])?[ \t]*=[ \t]*[^=]/
const G01_VAR_DECL = /^[ \t]*var ([A-Za-z_]\w*) ([^=\n]+?) = /gm
const G01_FUNC_SIG = /func[ \t]*(?:\([^)]*\)[ \t]*)?[A-Za-z_]\w*[ \t]*\(([^)]*)\)/g

// Positions of the code text: every character inside a string, rune or comment is `_`, so call
// boundaries in the mask are the boundaries of the printed program (a "(" in a url is not one).
function g01Mask (content: string): string {
    let out = ''
    let quote: string | undefined = undefined
    let lineComment = false
    let blockComment = false
    for (let i = 0; i < content.length; i++) {
        const ch = content[i]
        if (lineComment) {
            if (ch === '\n') {
                lineComment = false
                out += '\n'
            } else {
                out += '_'
            }
            continue
        }
        if (blockComment) {
            if ((ch === '*') && (content[i + 1] === '/')) {
                blockComment = false
                out += '__'
                i++
                continue
            }
            out += '\n' === ch ? '\n' : '_'
            continue
        }
        if (quote !== undefined) {
            if ((ch === '\\') && (quote !== '`') && (i + 1 < content.length)) {
                out += '__'
                i++
                continue
            }
            if (ch === quote) {
                quote = undefined
                out += '_'
                continue
            }
            out += '\n' === ch ? '\n' : '_'
            continue
        }
        if (ch === '"' || ch === '\'' || ch === '`') {
            quote = ch
            out += '_'
            continue
        }
        if ((ch === '/') && (content[i + 1] === '/')) {
            lineComment = true
            out += '__'
            i++
            continue
        }
        if ((ch === '/') && (content[i + 1] === '*')) {
            blockComment = true
            out += '__'
            i++
            continue
        }
        out += ch
    }
    return out
}

interface G01Call { open: number; close: number; args: Array<{ s: number; e: number }> }

function g01CallAt (mask: string, open: number): G01Call | undefined {
    if (mask[open] !== '(') {
        return undefined
    }
    const args: Array<{ s: number; e: number }> = []
    let depth = 0
    let nest = 0
    let start = open + 1
    for (let i = open; i < mask.length; i++) {
        const ch = mask[i]
        if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
            if (depth === 0) {
                args.push({ s: start, e: i })
                return { open, close: i, args }
            }
        } else if ((ch === '[') || (ch === '{')) {
            nest++
        } else if ((ch === ']') || (ch === '}')) {
            nest--
        } else if ((ch === ',') && (depth === 1) && (nest === 0)) {
            args.push({ s: start, e: i })
            start = i + 1
        }
    }
    return undefined
}

// identifiers whose every declaration in this file is a plain `string`
function g01StringNames (content: string): Set<string> {
    const types = new Map<string, Set<string>>()
    const add = (name: string, type: string) => {
        let set = types.get(name)
        if (set === undefined) {
            set = new Set<string>()
            types.set(name, set)
        }
        set.add(type)
    }
    G01_VAR_DECL.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = G01_VAR_DECL.exec(content)) !== null) {
        add(m[1], m[2].trim().replace(/\s+/g, ''))
    }
    G01_FUNC_SIG.lastIndex = 0
    while ((m = G01_FUNC_SIG.exec(content)) !== null) {
        for (const part of m[1].split(',')) {
            const p = part.trim().split(/\s+/)
            if (p.length === 2) {
                add(p[0], p[1])
            }
        }
    }
    const names = new Set<string>()
    for (const [name, set] of types) {
        if ((set.size === 1) && (set.has('string'))) {
            names.add(name)
        }
    }
    return names
}

// a key that Go accepts as a `map[string]any` index
function g01StringKey (text: string, strings: Set<string>): boolean {
    if (G01_STRING_LITERAL.test(text)) {
        return true
    }
    return /^[A-Za-z_]\w*$/.test(text) && strings.has(text)
}

function g01Trim (content: string, range: { s: number; e: number }): string {
    return content.slice(range.s, range.e).trim()
}

// Rewrite the call at `open` (its `GetValue(`) and everything nested in its receiver.
function g01Rewrite (content: string, mask: string, prefixStart: number, open: number, strings: Set<string>): { text: string; end: number } | undefined {
    const call = g01CallAt(mask, open)
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined
    }
    const recvRange = call.args[0]
    const keyText = g01Trim(content, call.args[1])
    if (!g01StringKey(keyText, strings)) {
        return undefined
    }
    const recvText = g01Trim(content, recvRange)
    // the receiver may be a nested GetValue chain: rewrite it first and decide on its printed form
    let recvNew = recvText
    let inner: { text: string; end: number } | undefined
    let p = recvRange.s
    while ((p < recvRange.e) && /\s/.test(content[p])) {
        p++
    }
    const innerMatch = new RegExp('^' + G01_CALL_TEXT).exec(mask.slice(p, recvRange.e))
    if (innerMatch !== null) {
        const innerOpen = p + innerMatch[0].length - 1
        const innerCall = g01CallAt(mask, innerOpen)
        let last = recvRange.e - 1
        while ((last > recvRange.s) && /\s/.test(content[last])) {
            last--
        }
        if ((innerCall !== undefined) && (innerCall.close === last)) {
            inner = g01Rewrite(content, mask, p, innerOpen, strings)
            if (inner !== undefined) {
                recvNew = inner.text
            }
        }
    }
    let replacement: string | undefined = undefined
    if (G01_API_RECEIVERS.indexOf(recvNew) >= 0) {
        replacement = G01_VIEW + '[' + keyText + ']'
    } else {
        const view = G01_VIEW_INDEX.exec(recvNew)
        if ((view !== null) && g01StringKey(view[1].trim(), strings)) {
            replacement = G01_SECTIONS + '[' + view[1].trim() + '][' + keyText + ']'
        }
    }
    if (replacement !== undefined) {
        return { text: replacement, end: call.close + 1 }
    }
    if ((inner !== undefined) && (inner.text !== recvText)) {
        // the receiver was typed but the read stays a helper: keep the rewritten receiver
        return { text: content.slice(prefixStart, recvRange.s) + inner.text + content.slice(recvRange.e, call.close + 1), end: call.close + 1 }
    }
    return undefined
}

// RefreshUrlsViews() after every write of urls, so the views name the dictionary the exchange keeps.
function g01Refreshes (content: string): string {
    if (content.indexOf('this.Urls') < 0) {
        return content
    }
    const lines = content.split('\n')
    const out: string[] = []
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        out.push(line)
        const write = G01_WRITE.exec(line)
        if (write === null) {
            continue
        }
        let next = i + 1
        while ((next < lines.length) && (lines[next].trim() === '')) {
            next++
        }
        if ((next < lines.length) && (lines[next].trim() === G01_REFRESH)) {
            continue
        }
        out.push(write[1] + G01_REFRESH)
    }
    return out.join('\n')
}

export function g01UrlsViews (content: string): string {
    if ((content.indexOf('GetValue(') < 0) || (content.indexOf('this.Urls') < 0)) {
        return g01Refreshes(content)
    }
    const mask = g01Mask(content)
    const strings = g01StringNames(content)
    const rx = new RegExp(G01_CALL_TEXT, 'g')
    let out = ''
    let i = 0
    while (i < content.length) {
        rx.lastIndex = i
        const m = rx.exec(mask)
        if (m === null) {
            out += content.slice(i)
            break
        }
        const start = m.index
        const open = start + m[0].length - 1
        const rewritten = g01Rewrite(content, mask, start, open, strings)
        if (rewritten === undefined) {
            out += content.slice(i, open + 1)
            i = open + 1
            continue
        }
        out += content.slice(i, start) + rewritten.text
        i = rewritten.end
    }
    return g01Refreshes(out)
}

export function g01Check (): string[] {
    const problems: string[] = []
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push('hx10w5 G01: ' + msg) } }
    const head = 'package ccxt\n\n'
    const run = (body: string) => g01UrlsViews(head + body)
    const method = (body: string) => run('func (this *BaseExchange) F(typeVar any, m map[string]any) any {\n' + body + '\treturn nil\n}\n')
    // literal key on the api view
    const one = method('\tvar wsUrl *string = this.SafeString(GetValue(this.Urls["api"], "ws"), typeVar)\n\t_ = wsUrl\n')
    ok(one.indexOf('this.SafeString(this.UrlsApi["ws"], typeVar)') >= 0, 'api read goes native: ' + one)
    ok(one.indexOf('GetValue(') < 0, 'no helper left on the api read: ' + one)
    // the second level reads out of the section dictionary
    const two = run('func (this *BaseExchange) F(typeVar any) any {\n\treturn ccxt.GetValue(ccxt.GetValue(this.Urls["api"], "ws"), "public")\n}\n')
    ok(two.indexOf('return this.UrlsApiSections["ws"]["public"]') >= 0, 'section read goes native: ' + two)
    // three levels: the first two print native, the last stays a helper
    const three = run('func (this *BaseExchange) F() any {\n\treturn ccxt.GetValue(ccxt.GetValue(ccxt.GetValue(this.Urls["api"], "ws"), "ws-api"), "spot")\n}\n')
    ok(three.indexOf('ccxt.GetValue(this.UrlsApiSections["ws"]["ws-api"], "spot")') >= 0, 'deep chain keeps its last read: ' + three)
    // a `string`-typed key is a valid index, an `any`/`*string` one is not
    const strKey = run('func (this *BaseExchange) F(section string) any {\n\treturn GetValue(this.Urls["api"], section)\n}\n')
    ok(strKey.indexOf('this.UrlsApi[section]') >= 0, 'string key goes native: ' + strKey)
    const anyKey = run('func (this *BaseExchange) F(section any) any {\n\treturn GetValue(this.Urls["api"], section)\n}\n')
    ok(anyKey.indexOf('GetValue(') >= 0, 'any key keeps the helper: ' + anyKey)
    const ptrKey = run('func (this *BaseExchange) F(section *string) any {\n\treturn GetValue(this.Urls["api"], section)\n}\n')
    ok(ptrKey.indexOf('GetValue(') >= 0, 'pointer key keeps the helper: ' + ptrKey)
    // a non-literal top key is not a view
    const varTop = run('func (this *BaseExchange) F(urlKey string) any {\n\treturn GetValue(this.Urls[urlKey], "ws")\n}\n')
    ok(varTop.indexOf('GetValue(') >= 0, 'variable top key keeps the helper: ' + varTop)
    // other fields are untouched
    const other = run('func (this *BaseExchange) F() any {\n\treturn GetValue(this.Options, "ws")\n}\n')
    ok(other.indexOf('GetValue(this.Options, "ws")') >= 0, 'other fields untouched: ' + other)
    // a key in a string literal is not a call
    const quoted = run('func (this *BaseExchange) F() any {\n\treturn "GetValue(this.Urls[\\"api\\"], \\"ws\\")"\n}\n')
    ok(quoted.indexOf('this.UrlsApi[') < 0, 'quoted text untouched: ' + quoted)
    // every urls write re-derives the views, once
    const writes = run('func (this *BaseExchange) G(u map[string]any) {\n\tthis.Urls["api"] = this.Urls["test"]\n\tthis.Urls = u\n}\n')
    ok(writes.indexOf('\tthis.Urls["api"] = this.Urls["test"]\n\tthis.RefreshUrlsViews()\n') >= 0, 'entry write refreshes: ' + writes)
    ok(writes.indexOf('\tthis.Urls = u\n\tthis.RefreshUrlsViews()\n') >= 0, 'field write refreshes: ' + writes)
    const twice = g01UrlsViews(writes)
    ok(twice === writes, 'refresh insertion is idempotent')
    const unchanged = g01UrlsViews('func (this *BaseExchange) G(u map[string]any) {\n\tif this.Urls["api"] == u {\n\t}\n}\n')
    ok(unchanged.indexOf('RefreshUrlsViews') < 0, 'a comparison is not a write: ' + unchanged)
    return problems
}
