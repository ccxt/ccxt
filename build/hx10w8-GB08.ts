// ===== hx10w8 GB08: the prediction tier's dead bounds-guard element reads =====
// A `[]any` element read prints as a guard closure that answers nil outside the slice:
//   var row any = func() any { if i >= 0 && i < len(rows) { return DerefScalar(rows[i]) } return nil }()
// Inside a loop already bounded by `len(rows)` that nil branch is unreachable, so the read
// collapses to the element itself and the closure (an iife blob) is gone. When every write
// into the list is a dictionary producer the element can never be a typed pointer either, so
// the DerefScalar the guard carried is a no-op and goes with it. Anything the printed text
// does not prove keeps its guard and its helper.

const GB08_PATH = /(?:^|\/)go\/v4\/(?:prediction\/[A-Za-z0-9_]+\.go|exchange_prediction\.go)$/

// producers whose elements come from decoded JSON or from parse* rows: maps or nil, no pointer
const GB08_DICT_LIST_PRODUCER = /^(?:ccxt\.)?(?:SafeListTyped|SafeList2Typed|SafeListTypedDefault|SafeList|ListTyped|ArrayTyped|MapSliceToList|ObjectValues|ExtractParams)\(|^(?:ccxt\.)?[A-Za-z]+FromList\(|^\[\]any\{\s*\}$/
const GB08_DICT_ELEMENT = /^(?:map\[string\]any\{|(?:ccxt\.)?(?:MapTyped|SafeMapTyped|SafeDictMap|SafeDict2Map|SafeDictNMap|MapOrEmpty)\(|(?:ccxt\.)?this\.(?:Parse|SafeDict|SafeMapTyped)|(?:ccxt\.)?[A-Za-z]+FromMap\()/

const GB08_GUARD = /func\(\) any \{\n([ \t]*)if (\w+) >= 0 && \2 < len\((\w+)\) \{\n[ \t]*return (?:ccxt\.)?DerefScalar\(\3\[\2\]\)\n[ \t]*\}\n[ \t]*return nil\n[ \t]*\}\(\)/g

// spaces out string/rune/comment text, newlines and offsets kept
function gb08Mask (source: string): string {
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

function gb08Escape (name: string): string {
    return name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// the loop that encloses `at`, only when its bound is the slice's own length
function gb08LoopBoundIsLen (maskedFunc: string, offset: number, counter: string, list: string): boolean {
    const header = new RegExp ('^([ \\t]*)for ' + gb08Escape (counter) + ' := 0; ' + gb08Escape (counter) + ' < (?:len\\(' + gb08Escape (list) + '\\)|(' + gb08Escape (list) + 'Length)); ' + gb08Escape (counter) + '\\+\\+ \\{', 'gm')
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
        // the hoisted `xLength := len(x)` form is only a bound when it reads this slice
        const hoisted = new RegExp ('^[ \\t]*var ' + gb08Escape (last[ 2 ]) + ' int = len\\(' + gb08Escape (list) + '\\)$', 'm')
        if (!hoisted.test (maskedFunc)) {
            return false
        }
    }
    const body = maskedFunc.slice (last.index + last[ 0 ].length, offset)
    // the counter must not move inside the body and the slice must not be rebound or re-pointed
    if (new RegExp ('(?:^|[^A-Za-z0-9_.])' + gb08Escape (counter) + '\\s*(?:[-+*/]?=|:=|\\+\\+|--)').test (body)) {
        return false
    }
    if (new RegExp ('(?:^|[^A-Za-z0-9_.])' + gb08Escape (list) + '\\s*=[^=]').test (body)) {
        return false
    }
    if (new RegExp ('&' + gb08Escape (list) + '\\b').test (maskedFunc)) {
        return false
    }
    return true
}

// every element written into `list` in this function is a dictionary, so DerefScalar cannot warp one
function gb08ListElementsAreDicts (maskedFunc: string, list: string): boolean {
    const decls = [ ...maskedFunc.matchAll (new RegExp ('^[ \\t]*var ' + gb08Escape (list) + ' \\[\\]any = (.+)$', 'gm')) ]
    if (decls.length !== 1) {
        return false // untyped/param/rebound list: the element shape is not in this text
    }
    if (!GB08_DICT_LIST_PRODUCER.test (decls[ 0 ][ 1 ].trim ())) {
        return false
    }
    const appends = [ ...maskedFunc.matchAll (new RegExp (gb08Escape (list) + ' = append\\(' + gb08Escape (list) + ', (.+)\\)$', 'gm')) ]
    for (const append of appends) {
        if (!GB08_DICT_ELEMENT.test (append[ 1 ].trim ())) {
            return false
        }
    }
    return true
}

export function gb08Pass (content: string, filePath = 'go/v4/prediction/venue.go'): string {
    if (!GB08_PATH.test (filePath) || (content.indexOf ('func() any {') < 0)) {
        return content
    }
    const masked = gb08Mask (content)
    const edits: Array<{ start: number, end: number, text: string }> = []
    let match: any = null
    GB08_GUARD.lastIndex = 0
    while ((match = GB08_GUARD.exec (masked)) !== null) {
        const start = match.index
        const counter = match[ 2 ]
        const list = match[ 3 ]
        const fnStart = masked.lastIndexOf ('\nfunc ', start)
        if (fnStart < 0) {
            continue
        }
        const maskedFunc = masked.slice (fnStart)
        const offset = start - fnStart
        if (!gb08LoopBoundIsLen (maskedFunc, offset, counter, list)) {
            continue
        }
        const read = gb08ListElementsAreDicts (maskedFunc, list)
            ? list + '[' + counter + ']'
            : 'ccxt.DerefScalar(' + list + '[' + counter + '])'
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

export function gb08Check (): string[] {
    const problems: string[] = []
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10w8 GB08: ' + msg); } }
    const pred = '/r/go/v4/prediction/venue.go'
    const guard = (indent: string, counter: string, list: string) => 'func() any {\n'
        + indent + '\tif ' + counter + ' >= 0 && ' + counter + ' < len(' + list + ') {\n'
        + indent + '\t\treturn ccxt.DerefScalar(' + list + '[' + counter + '])\n'
        + indent + '\t}\n' + indent + '\treturn nil\n' + indent + '}()'
    const body = (declaration: string, header: string, read: string) => 'package ccxtprediction\n\nfunc (this *X) F(m map[string]any) any {\n'
        + declaration + header + read + '\n\t}\n\treturn nil\n}\n'
    const dicted = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', '\tfor i := 0; i < len(rows); i++ {\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (dicted, pred).includes ('\t\tvar row any = rows[i]\n'), 'a bounded read on a dict list reads natively: ' + gb08Pass (dicted, pred))
    ok (gb08Pass (dicted, pred).indexOf ('func() any') < 0, 'the guard closure is gone')
    const scalar = body ('\tvar rows []any = this.RowsFromSomewhere()\n', '\tfor i := 0; i < len(rows); i++ {\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (scalar, pred).includes ('ccxt.DerefScalar(rows[i])'), 'an unproven element keeps its DerefScalar')
    ok (gb08Pass (scalar, pred).indexOf ('func() any') < 0, 'but the dead guard still goes')
    const hoisted = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n\tvar rowsLength int = len(rows)\n',
        '\tfor i := 0; i < rowsLength; i++ {\n', '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (hoisted, pred).includes ('rows[i]'), 'a hoisted length bound proves the read')
    const open = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', '\tfor i := 0; i < 3; i++ {\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (open, pred) === open, 'a loop not bounded by the slice keeps the guard')
    const moved = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', '\tfor i := 0; i < len(rows); i++ {\n\ti = this.Advance(i)\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (moved, pred) === moved, 'a counter that moves keeps the guard')
    const rebound = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', '\tfor i := 0; i < len(rows); i++ {\n\trows = this.Other()\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (rebound, pred) === rebound, 'a rebound slice keeps the guard')
    const appended = body ('\tvar rows []any = ccxt.SafeListTyped(m, "rows")\n', '\tfor i := 0; i < len(rows); i++ {\n\trows = append(rows, this.SafeString(m, "x"))\n',
        '\t\tvar row any = ' + guard ('\t\t', 'i', 'rows'))
    ok (gb08Pass (appended, pred).includes ('ccxt.DerefScalar(rows[i])'), 'a scalar append keeps the DerefScalar')
    const plain = 'package ccxt\n\nfunc (this *X) F() any {\n\tvar rows []any = SafeListTyped(m, "rows")\n'
        + '\tfor i := 0; i < len(rows); i++ {\n\t\tvar row any = ' + guard ('\t\t', 'i', 'rows') + '\n\t}\n\treturn nil\n}\n'
    ok (gb08Pass (plain, '/r/go/v4/x.go') === plain, 'a venue file is out of this unit')
    ok (gb08Pass (plain, '/r/go/v4/pro/x.go') === plain, 'a pro file is out of this unit')
    const once = gb08Pass (dicted, pred)
    ok (gb08Pass (once, pred) === once, 'idempotent')
    return problems
}
