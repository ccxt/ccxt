// ===== hx10w9 GP19: the dead bounds-guard element reads, venue and pro tiers =====
// hx10w8 GB08 proved the shape dead in prediction/; the same guard comes out of every
// venue file and every pro file, so the proof is applied wherever a len(list) loop
// bounds the read. Every check stays fail-closed: text that does not prove the read is
// in bounds, and cannot prove the element is not a typed pointer, keeps guard and helper.

const GP19_PATH = /(?:^|\/)go\/v4\/(?:pro\/|prediction\/)?[A-Za-z0-9_]+\.go$/
const GP19_HAND_WRITTEN = /_test\.go$/

// producers whose elements come from decoded JSON or from parse* rows: maps or nil, no pointer
const GP19_DICT_LIST_PRODUCER = /^(?:ccxt\.)?(?:SafeListTyped|SafeList2Typed|SafeListTypedDefault|SafeList|ListTyped|ArrayTyped|MapSliceToList|ObjectValues|ExtractParams)\(|^(?:ccxt\.)?[A-Za-z]+FromList\(|^\[\]any\{\s*\}$/
const GP19_DICT_ELEMENT = /^(?:map\[string\]any\{|(?:ccxt\.)?(?:MapTyped|SafeMapTyped|SafeDictMap|SafeDict2Map|SafeDictNMap|MapOrEmpty)\(|(?:ccxt\.)?this\.(?:Parse|SafeDict|SafeMapTyped)|(?:ccxt\.)?[A-Za-z]+FromMap\()/

const GP19_GUARD = /func\(\) any \{\n([ \t]*)if (\w+) >= 0 && \2 < len\((\w+)\) \{\n[ \t]*return ((?:ccxt\.)?)DerefScalar\(\3\[\2\]\)\n[ \t]*\}\n[ \t]*return nil\n[ \t]*\}\(\)/g

const GP19_ASSIGN = /(?<![=!<>+\-*/%&|^])=(?!=)/

// spaces out string/rune/comment text, newlines and offsets kept
function gp19Mask (source: string): string {
    const out: string[] = []
    let mode: string | null = null
    let escaped = false
    for (let i = 0; i < source.length; i++) {
        const c = source[ i ]
        const next = source[ i + 1 ]
        if (mode === null) {
            if ((c === '/') && (next === '/')) { mode = 'line'; out.push ('  '); i++; continue }
            if ((c === '/') && (next === '*')) { mode = 'block'; out.push ('  '); i++; continue }
            if (c === '"') { mode = 'str'; escaped = false; out.push ('"'); continue }
            if (c === '`') { mode = 'raw'; out.push ('`'); continue }
            if (c === '\'') { mode = 'rune'; escaped = false; out.push ('\''); continue }
            out.push (c)
            continue
        }
        if (mode === 'line') {
            mode = (c === '\n') ? null : mode
            out.push ((c === '\n') ? '\n' : ' ')
            continue
        }
        if (mode === 'block') {
            if ((c === '*') && (next === '/')) { mode = null; out.push ('  '); i++; continue }
            out.push ((c === '\n') ? '\n' : ' ')
            continue
        }
        if (mode === 'raw') {
            if (c === '`') { mode = null; out.push ('`'); continue }
            out.push ((c === '\n') ? '\n' : ' ')
            continue
        }
        if ((mode === 'str') && (c === '"') && !escaped) { mode = null; out.push ('"'); continue }
        if ((mode === 'rune') && (c === '\'') && !escaped) { mode = null; out.push ('\''); continue }
        out.push ((c === '\n') ? '  ' : ' ')
        if (escaped) { escaped = false; continue }
        if (c === '\\') { escaped = true; continue }
    }
    return out.join ('')
}

function gp19Escape (name: string): string {
    return name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function gp19Bare (text: string, name: string): boolean {
    return new RegExp ('(?:^|[^A-Za-z0-9_.])' + gp19Escape (name) + '(?![A-Za-z0-9_])').test (text)
}

// a slice header reassigned, redeclared or multi-assigned in `text` moves what the read sees
function gp19Rebound (text: string, list: string): boolean {
    const subscript = new RegExp (gp19Escape (list) + '\\[[^\\]]*\\]', 'g')
    const decl = new RegExp ('(?:^|[^A-Za-z0-9_.])' + gp19Escape (list) + '\\s*(?:,\\s*[A-Za-z_][A-Za-z0-9_]*\\s*)?:=$', 'm')
    if (decl.test (text)) {
        return true
    }
    for (const line of text.split ('\n')) {
        const assign = line.search (GP19_ASSIGN)
        if (assign < 0) {
            continue
        }
        const lhs = line.slice (0, assign).replace (subscript, '')
        if (gp19Bare (lhs, list)) {
            return true
        }
    }
    return false
}

// the loop that encloses `at`, only when its bound is the slice's own length
function gp19LoopProvesBounds (maskedFunc: string, offset: number, counter: string, list: string): boolean {
    const header = new RegExp ('^([ \\t]*)for ' + gp19Escape (counter) + ' := 0; ' + gp19Escape (counter) + ' < (?:len\\(' + gp19Escape (list) + '\\)|(' + gp19Escape (list) + 'Length)); ' + gp19Escape (counter) + '\\+\\+ \\{', 'gm')
    let match: any = null
    let last: any = null
    while ((match = header.exec (maskedFunc)) !== null) {
        if (match.index >= offset) {
            break
        }
        last = match
    }
    if (last === null) {
        return false
    }
    if (last[ 2 ] !== undefined) {
        // the hoisted `xLength := len(x)` form is only a bound when it reads this slice, unshadowed
        const hoisted = new RegExp ('^[ \\t]*var ' + gp19Escape (last[ 2 ]) + ' int = len\\(' + gp19Escape (list) + '\\)$', 'gm')
        let declared: any = null
        let probe: any = null
        while ((probe = hoisted.exec (maskedFunc)) !== null) {
            if (probe.index >= last.index) {
                break
            }
            declared = probe
        }
        if ((declared === null) || gp19Rebound (maskedFunc.slice (declared.index + declared[ 0 ].length, last.index), list)) {
            return false
        }
    }
    const body = maskedFunc.slice (last.index + last[ 0 ].length, offset)
    // the counter must not move inside the body, the slice must not be rebound, and the
    // read must sit in the loop's body rather than after the loop closed
    if (new RegExp ('(?:^|[^A-Za-z0-9_.])' + gp19Escape (counter) + '\\s*(?:[-+*/]?=|:=|\\+\\+|--)').test (body)) {
        return false
    }
    if (gp19Rebound (body, list)) {
        return false
    }
    if (body.split ('{').length < body.split ('}').length) {
        return false
    }
    if (new RegExp ('&' + gp19Escape (list) + '\\b').test (maskedFunc)) {
        return false
    }
    return true
}

// every element written into `list` in this function is a dictionary, so DerefScalar cannot warp one
function gp19ListElementsAreDicts (maskedFunc: string, list: string): boolean {
    const decls = [ ...maskedFunc.matchAll (new RegExp ('^[ \\t]*var ' + gp19Escape (list) + ' \\[\\]any = (.+)$', 'gm')) ]
    if (decls.length !== 1) {
        return false // untyped/param/shadowed list: the element shape is not in this text
    }
    if (!GP19_DICT_LIST_PRODUCER.test (decls[ 0 ][ 1 ].trim ())) {
        return false
    }
    const appends = [ ...maskedFunc.matchAll (new RegExp (gp19Escape (list) + ' = append\\(' + gp19Escape (list) + ', (.+)\\)$', 'gm')) ]
    for (const append of appends) {
        if (!GP19_DICT_ELEMENT.test (append[ 1 ].trim ())) {
            return false
        }
    }
    return true
}

export function gp19Pass (content: string, filePath = 'go/v4/binance.go'): string {
    if (!GP19_PATH.test (filePath) || GP19_HAND_WRITTEN.test (filePath) || (content.indexOf ('func() any {') < 0)) {
        return content
    }
    const masked = gp19Mask (content)
    const edits: Array<{ start: number, end: number, text: string }> = []
    let match: any = null
    GP19_GUARD.lastIndex = 0
    while ((match = GP19_GUARD.exec (masked)) !== null) {
        const start = match.index
        const counter = match[ 2 ]
        const list = match[ 3 ]
        const prefix = match[ 4 ]
        const fnStart = masked.lastIndexOf ('\nfunc ', start)
        if (fnStart < 0) {
            continue
        }
        const maskedFunc = masked.slice (fnStart)
        const offset = start - fnStart
        if (!gp19LoopProvesBounds (maskedFunc, offset, counter, list)) {
            continue
        }
        const read = gp19ListElementsAreDicts (maskedFunc, list)
            ? list + '[' + counter + ']'
            : prefix + 'DerefScalar(' + list + '[' + counter + '])'
        edits.push ({ 'start': start, 'end': start + match[ 0 ].length, 'text': read })
    }
    if (edits.length === 0) {
        return content
    }
    let out = content
    for (let i = edits.length - 1; i >= 0; i--) {
        out = out.slice (0, edits[ i ].start) + edits[ i ].text + out.slice (edits[ i ].end)
    }
    return out
}

export function gp19Check (): string[] {
    const problems: string[] = []
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10w9 GP19: ' + msg); } }
    const venue = '/r/go/v4/okx.go'
    const pro = '/r/go/v4/pro/okx.go'
    const guard = (indent: string, counter: string, list: string, prefix = '') => 'func() any {\n'
        + indent + '\tif ' + counter + ' >= 0 && ' + counter + ' < len(' + list + ') {\n'
        + indent + '\t\treturn ' + prefix + 'DerefScalar(' + list + '[' + counter + '])\n'
        + indent + '\t}\n' + indent + '\treturn nil\n' + indent + '}()'
    const body = (declaration: string, header: string, read: string) => 'package ccxt\n\nfunc (this *X) F(m map[string]any) any {\n'
        + declaration + header + read + '\n\t}\n\treturn nil\n}\n'
    const loop = (list: string) => '\tfor i := 0; i < len(' + list + '); i++ {\n'
    const dicted = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows'), '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (dicted, venue).includes ('\t\tvar row any = rows[i]\n'), 'a bounded read on a dict list reads natively: ' + gp19Pass (dicted, venue))
    ok (gp19Pass (dicted, venue).indexOf ('func() any') < 0, 'the guard closure is gone')
    const scalar = body ('\tvar rows []any = this.RowsFromSomewhere()\n', loop ('rows'), '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (scalar, venue).includes ('DerefScalar(rows[i])'), 'an unproven element keeps its DerefScalar')
    ok (gp19Pass (scalar, venue).indexOf ('func() any') < 0, 'but the dead guard still goes')
    const prefixed = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', loop ('rows'), '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows', 'ccxt.'))
    ok (gp19Pass (prefixed, pro).includes ('var row any = rows[i]'), 'a pro file reads natively')
    const kept = body ('\tvar rows []any = ccxt.ToArray(m)\n', loop ('rows'), '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows', 'ccxt.'))
    ok (gp19Pass (kept, pro).includes ('ccxt.DerefScalar(rows[i])'), 'the helper prefix of the site is kept: ' + gp19Pass (kept, pro))
    const hoisted = body ('\tvar rows []any = SafeListTyped(m, "rows")\n\tvar rowsLength int = len(rows)\n',
        '\tfor i := 0; i < rowsLength; i++ {\n', '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (hoisted, venue).includes ('rows[i]'), 'a hoisted length bound proves the read')
    const stale = body ('\tvar rows []any = SafeListTyped(m, "rows")\n\tvar rowsLength int = len(rows)\n\trows = this.Other()\n',
        '\tfor i := 0; i < rowsLength; i++ {\n', '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (stale, venue) === stale, 'a bound hoisted before a rebind keeps the guard')
    const open = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', '\tfor i := 0; i < 3; i++ {\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (open, venue) === open, 'a loop not bounded by the slice keeps the guard')
    const moved = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\ti = this.Advance(i)\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (moved, venue) === moved, 'a counter that moves keeps the guard')
    const rebound = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\trows = this.Other()\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (rebound, venue) === rebound, 'a rebound slice keeps the guard')
    const multi = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\trows, other = this.Other(), other\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (multi, venue) === multi, 'a multi-assigned slice keeps the guard')
    const shadowed = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\trows := this.Other()\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (shadowed, venue) === shadowed, 'a shadowing redeclaration keeps the guard')
    const element = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\trows[0] = this.Other()\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (element, venue).includes ('var row any = rows[i]'), 'an element write does not change the length')
    const appended = body ('\tvar rows []any = SafeListTyped(m, "rows")\n', loop ('rows') + '\trows = append(rows, this.SafeString(m, "x"))\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gp19Pass (appended, venue).includes ('DerefScalar(rows[i])'), 'a scalar append keeps the DerefScalar')
    const closed = 'package ccxt\n\nfunc (this *X) F(m map[string]any) any {\n\tvar i int = 0\n'
        + '\tfor i := 0; i < len(rows); i++ {\n\t}\n\tvar row any = ' + guard ('\t', 'i', 'rows') + '\n\treturn row\n}\n'
    ok (gp19Pass (closed, venue) === closed, 'a read after the loop closed keeps the guard')
    const test = 'package ccxt\n\nfunc TestF(t *T) {\n' + dicted.split ('\n').slice (2).join ('\n')
    ok (gp19Pass (test, '/r/go/v4/exchange_cache_test.go') === test, 'a hand-written test file is out of this unit')
    const once = gp19Pass (dicted, venue)
    ok (gp19Pass (once, venue) === once, 'idempotent')
    return problems
}
