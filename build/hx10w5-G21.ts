// ===== hx10w5 G21: the Go prediction tier's boxed dict/list locals =====
// The prediction tier keeps its working collections in `any` locals even when every write can
// only produce one shape, so the printer falls back to GetValue/GetArrayLength/InOp. The type is
// provable from the printed text:
//   var x any = MapTyped(..) | this.SafeDict* | <Struct>ToMap(..) | map[string]any{..}  -> map[string]any
//   var x any = ListTyped(..) | SafeListTyped(..) | MapSliceToList(..) | []any{..}       -> []any
// Retyping the declaration (and wrapping each write in the exact converter, which folds nil and a
// foreign box to nil exactly as the helper answered the read) lets the printer's own passes emit
// the native op. Anything the text does not prove keeps its `any` and its helper call.
// InOp(map, string key) on a function-local map is a presence test, so it prints as comma-ok.

const G21_DICT_CALL = [ 'MapTyped', 'MarketTyped', 'CurrencyTyped', 'SafeMapTyped', 'SafeDictTyped', 'SafeDict2Typed', 'SafeDictNMap', 'GetInfo', 'MapOrEmpty' ]
const G21_DICT_METHOD = [ 'SafeDictMap', 'SafeDict2Map', 'SafeDictNMap' ]
const G21_DICT_TOMAP = /^(?:ccxt\.)?[A-Za-z]+ToMap\(/
const G21_LIST_CALL = [ 'ListTyped', 'ArrayTyped', 'SafeListTyped', 'SafeList2Typed', 'SafeListTypedDefault', 'ObjectValues', 'MapSliceToList' ]

// spaces out string/rune/comment text, newlines and offsets kept
function g21Mask (source: string): string {
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

interface G21Func { open: number, close: number, sig: string }

function g21Funcs (maskedLines: string[]): G21Func[] {
    const out: G21Func[] = []
    for (let k = 0; k < maskedLines.length; k++) {
        if (!maskedLines[ k ].startsWith ('func ')) {
            continue
        }
        let end = k
        while ((end < maskedLines.length) && (maskedLines[ end ] !== '}')) {
            end++
        }
        out.push ({ 'open': k, 'close': end, 'sig': maskedLines[ k ] })
    }
    return out
}

function g21Escape (name: string): string {
    return name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// the static type of `name` in this function, only when it is declared once and never rebound
// (a map index write `x[k] = v` keeps the type, so it does not count)
function g21SingleDeclType (maskedFunc: string, name: string): string | undefined {
    const decls = [ ...maskedFunc.matchAll (new RegExp ('^[ \\t]*(?:var )?' + g21Escape (name) + ' ([\\w\\[\\]\\*\\.]+) =', 'gm')) ]
    if (decls.length !== 1) {
        return undefined
    }
    const write = new RegExp ('^[ \\t]*' + g21Escape (name) + ' = (.+)$', 'gm')
    const rebinds = [ ...maskedFunc.matchAll (write) ].map ((m: any) => m[ 1 ].trim ()).filter ((w: string) => w !== 'nil')
    if (rebinds.length) {
        return undefined
    }
    if (new RegExp ('&' + g21Escape (name) + '\\b').test (maskedFunc)) {
        return undefined
    }
    return decls[ 0 ][ 1 ]
}

// every reassignment of `name` in this function, as source text
function g21Writes (maskedFunc: string, name: string): string[] {
    return [ ...maskedFunc.matchAll (new RegExp ('^[ \\t]*' + g21Escape (name) + ' = (.+)$', 'gm')) ].map ((m: any) => m[ 1 ].trim ())
}

// a producer that already returns map[string]any (no converter, so the helper count cannot rise)
function g21DictExpr (expr: string): boolean {
    const e = expr.trim ()
    if ((e === 'nil') || e.startsWith ('map[string]any{')) {
        return true
    }
    const call = /^(?:ccxt\.)?([A-Za-z_]\w*)\(/.exec (e)
    if (call === null) {
        return false
    }
    return G21_DICT_CALL.includes (call[ 1 ]) || G21_DICT_METHOD.includes (call[ 1 ])
}

function g21ListExpr (expr: string): boolean {
    const e = expr.trim ()
    if ((e === 'nil') || e.startsWith ('[]any{')) {
        return true
    }
    const call = /^(?:ccxt\.)?([A-Za-z_]\w*)\(/.exec (e)
    return (call !== null) && G21_LIST_CALL.includes (call[ 1 ])
}

// G21-1: `var x any = <one shape>` whose every write is that shape -> the shape's type
function g21RetypeLocals (content: string): string {
    const lines = content.split ('\n')
    const masked = g21Mask (content).split ('\n')
    if (lines.length !== masked.length) {
        return content
    }
    for (const f of g21Funcs (masked)) {
        const maskedFunc = masked.slice (f.open, f.close + 1).join ('\n')
        const names = [ ...maskedFunc.matchAll (/^[ \t]*var ([A-Za-z_]\w*) any = .+$/gm) ].map ((m: any) => m[ 1 ])
        for (const name of names) {
            const declRx = new RegExp ('^([ \\t]*)var ' + g21Escape (name) + ' any = (.+)$')
            const decls = [ ...maskedFunc.matchAll (new RegExp (declRx.source, 'gm')) ]
            if (decls.length !== 1) {
                continue
            }
            const staticType = g21SingleDeclType (maskedFunc, name)
            if ((staticType !== undefined) && (staticType !== 'any')) {
                continue
            }
            const writes = [ decls[ 0 ][ 2 ].trim () ].concat (g21Writes (maskedFunc, name))
            const isDict = writes.every ((w: string) => g21DictExpr (w))
            const isList = !isDict && writes.every ((w: string) => g21ListExpr (w))
            if (!isDict && !isList) {
                continue
            }
            const type = isDict ? 'map[string]any' : '[]any'
            for (let k = f.open + 1; k < f.close; k++) {
                const dm = declRx.exec (masked[ k ])
                if (dm !== null) {
                    const rhs = lines[ k ].substring (dm[ 0 ].length - dm[ 2 ].length)
                    lines[ k ] = dm[ 1 ] + 'var ' + name + ' ' + type + ' = ' + rhs
                    masked[ k ] = g21Mask (lines[ k ])
                    continue
                }
                const writeRx = new RegExp ('^([ \\t]*)' + g21Escape (name) + ' = (.+)$')
                const wm = writeRx.exec (masked[ k ])
                if (wm !== null) {
                    const rhs = lines[ k ].substring (wm[ 0 ].length - wm[ 2 ].length)
                    lines[ k ] = wm[ 1 ] + name + ' = ' + rhs
                    masked[ k ] = g21Mask (lines[ k ])
                }
            }
        }
    }
    return lines.join ('\n')
}

// a key a map index accepts: a string literal, or a param/local declared `string` once
function g21StringKey (key: string, maskedFunc: string, params: Map<string, string>): boolean {
    if (/^"(?:[^"\\\n]|\\.)*"$/.test (key)) {
        return true
    }
    if (!/^[A-Za-z_]\w*$/.test (key)) {
        return false
    }
    if (params.get (key) === 'string') {
        return true
    }
    return (g21SingleDeclType (maskedFunc, key) === 'string')
}

function g21Params (sig: string): Map<string, string> {
    const out = new Map<string, string> ()
    let depth = 0
    let start = -1
    let close = -1
    for (let i = 0; i < sig.length; i++) {
        if (sig[ i ] === '(') {
            if (depth === 0) {
                start = i
            }
            depth++
        } else if (sig[ i ] === ')') {
            depth--
            if ((depth === 0) && (start > 0)) {
                close = i
                break
            }
        }
    }
    if ((start < 0) || (close < 0)) {
        return out
    }
    for (const part of sig.substring (start + 1, close).split (',')) {
        const m = /^\s*([A-Za-z_]\w*)\s+(.+?)\s*$/.exec (part)
        if ((m !== null) && (m[ 1 ] !== 'this')) {
            out.set (m[ 1 ], m[ 2 ])
        }
    }
    return out
}

// the text after position `from` opens one bracket group that closes exactly at `to`
function g21Wrapped (text: string, from: number, to: number): boolean {
    if ((text[ from ] !== '(') || (text[ to ] !== ')')) {
        return false
    }
    let depth = 0
    for (let i = from; i <= to; i++) {
        if (text[ i ] === '(') {
            depth++
        } else if (text[ i ] === ')') {
            depth--
            if (depth === 0) {
                return i === to
            }
        }
    }
    return false
}

// G21-2: `if <arms, InOp(<local map>, <string key>), arms>` -> comma-ok init plus `ok`
function g21InOpCondition (content: string): string {
    const lines = content.split ('\n')
    const masked = g21Mask (content).split ('\n')
    if (lines.length !== masked.length) {
        return content
    }
    for (const f of g21Funcs (masked)) {
        const maskedFunc = masked.slice (f.open, f.close + 1).join ('\n')
        const params = g21Params (f.sig)
        for (let k = f.open + 1; k < f.close; k++) {
            const head = /^([ \t]*)if (.+)\{$/.exec (masked[ k ])
            if ((head === null) || (head[ 2 ].indexOf (';') >= 0)) {
                continue
            }
            const calls = [ ...head[ 2 ].matchAll (/(?:ccxt\.)?InOp\(([A-Za-z_]\w*), ([A-Za-z_]\w*|"(?:[^"\\\n]|\\.)*")\)/g) ]
            if (calls.length !== 1) {
                continue
            }
            const call = calls[ 0 ]
            const name = call[ 1 ]
            const key = call[ 2 ]
            if (g21SingleDeclType (maskedFunc, name) !== 'map[string]any') {
                continue
            }
            if (!g21StringKey (key, maskedFunc, params)) {
                continue
            }
            const at = call.index ?? 0
            const rest = head[ 2 ]
            const original = lines[ k ].substring (head[ 1 ].length + 3, head[ 1 ].length + 3 + rest.length)
            const before = rest.substring (0, at).replace (/\s+$/, '')
            const after = rest.substring (at + call[ 0 ].length)
            if (!/(?:^|&&|\|\||!|\()$/.test (before)) {
                continue
            }
            if (!/^\s*\)*\s*(?:&&|\|\||$)/.test (after)) {
                continue
            }
            let open = at
            let end = at + call[ 0 ].length
            while ((open > 0) && g21Wrapped (rest, open - 1, end)) {
                open--
                end++
            }
            let replacement = 'ok'
            if ((open > 0) && (rest[ open - 1 ] === '!')) {
                open--
                replacement = '!ok'
            }
            const tail = (original.substring (0, open) + replacement + original.substring (end + 1)).trim ()
            const keyAt = at + call[ 0 ].lastIndexOf (key)
            const keyText = original.substring (keyAt, keyAt + key.length)
            lines[ k ] = head[ 1 ] + 'if _, ok := ' + name + '[' + keyText + ']; ' + tail + ' {'
            masked[ k ] = g21Mask (lines[ k ])
        }
    }
    return lines.join ('\n')
}


// G21-3: GetValue(list, counter) -> list[counter] on a `[]any` local whose every element is a
// plain map (MapSliceToList over a []map[string]any), inside a `for` bounded by the same len
function g21BoundedListReads (content: string): string {
    if (content.indexOf ('GetValue(') < 0) {
        return content
    }
    const lines = content.split ('\n')
    const masked = g21Mask (content).split ('\n')
    if (lines.length !== masked.length) {
        return content
    }
    for (const f of g21Funcs (masked)) {
        const maskedFunc = masked.slice (f.open, f.close + 1).join ('\n')
        const names = [ ...maskedFunc.matchAll (/^[ \t]*var ([A-Za-z_]\w*) \[\]any = .+$/gm) ].map ((m: any) => m[ 1 ])
        for (const name of names) {
            const writes = g21Writes (maskedFunc, name)
            const plain = writes.every ((w: string) => (w === 'nil') || (w === '[]any{}') || /^ccxt\.MapSliceToList\([^()]*\)$/.test (w))
            if (!plain) {
                continue
            }
            const readRx = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(' + g21Escape (name) + ', ([A-Za-z_]\\w*)\\)', 'g')
            for (let k = f.open + 1; k < f.close; k++) {
                if (masked[ k ].indexOf ('GetValue(' + name + ',') < 0) {
                    continue
                }
                lines[ k ] = lines[ k ].replace (readRx, (all: string, counter: string) => {
                    return g21BoundedByLen (masked, f, k, counter, name) ? (name + '[' + counter + ']') : all
                })
                masked[ k ] = g21Mask (lines[ k ])
            }
        }
    }
    return lines.join ('\n')
}

// the line sits inside `for c := 0; c < <len(name) or a local declared from it>; c++`
function g21BoundedByLen (masked: string[], f: G21Func, k: number, counter: string, name: string): boolean {
    const decl = new RegExp ('^[ \\t]*for ' + g21Escape (counter) + ' := 0; ' + g21Escape (counter) + ' < (.+); ' + g21Escape (counter) + '\\+\\+ \\{$')
    for (let i = k; i > f.open; i--) {
        const m = decl.exec (masked[ i ])
        if (m === null) {
            continue
        }
        const limit = m[ 1 ].trim ()
        const bound = (limit === ('len(' + name + ')'))
        if (!bound) {
            continue
        }
        if (new RegExp ('^[ \\t]*' + g21Escape (counter) + ' =', 'gm').test (masked.slice (i + 1, k + 1).join ('\\n'))) {
            return false
        }
        if (new RegExp ('^[ \\t]*' + g21Escape (counter) + '\\+\\+', 'gm').test (masked.slice (i + 1, k + 1).join ('\\n'))) {
            continue
        }
        return true
    }
    return false
}

// the prediction tier only: exchange_prediction.go and go/v4/prediction/**
export function g21Pass (content: string, filePath = 'go/v4/prediction/venue.go'): string {
    if (!/(?:^|\/)(?:prediction\/[\w-]+\.go|exchange_prediction\.go)$/.test (filePath)) {
        return content
    }
    if ((content.indexOf (' any = ') < 0) && (content.indexOf ('InOp(') < 0)) {
        return content
    }
    return g21BoundedListReads (g21InOpCondition (g21RetypeLocals (content)))
}

// ---------------------------------------------------------------- self-test
function g21Body (body: string): string {
    return 'package ccxtprediction\n\nfunc (this *X) F(p any, keys []string) any {\n' + body + '\treturn nil\n}\n'
}

export function g21Check (formatGoSource: (path: string, content: string) => string): string[] {
    const problems: string[] = []
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w5-G21: ' + message) } }
    const run = (body: string) => g21Pass (g21Body (body))
    const dict = run ('\tvar oc any = nil\n\toc = ccxt.MapTyped(p)\n\treturn ccxt.GetArrayLength(oc)\n')
    ok (dict.indexOf ('\tvar oc map[string]any = nil') >= 0, 'dict local retyped: ' + dict)
    ok (run ('\tvar oc any = ccxt.StructBox(p, ccxt.PredictionOutcomeToMap)\n\treturn nil\n').indexOf ('var oc any = ') >= 0, 'a converter-needing producer keeps any')
    const list = run ('\tvar rows any = []any{}\n\tif p != nil {\n\t\trows = ccxt.MapSliceToList(p)\n\t}\n\treturn ccxt.GetArrayLength(rows)\n')
    ok (list.indexOf ('\tvar rows []any = []any{}') >= 0, 'list local retyped: ' + list)
    ok (run ('\tvar oc any = nil\n\toc = ccxt.GetValue(p, "k")\n\treturn nil\n').indexOf ('var oc any = nil') >= 0, 'GetValue write keeps any')
    ok (run ('\tvar oc any = this.ParseThing(p)\n\treturn nil\n').indexOf ('var oc any = ') >= 0, 'unknown producer keeps any')
    ok (run ('\tvar rows any = []any{}\n\trows = append(rows, p)\n\treturn nil\n').indexOf ('var rows any = ') >= 0, 'append keeps any')
    const inop = run ('\tvar found map[string]any = map[string]any{}\n\tif !(ccxt.InOp(found, "abc")) {\n\t}\n\treturn nil\n')
    ok (inop.indexOf ('\tif _, ok := found["abc"]; !ok {') >= 0, 'InOp literal key: ' + inop)
    ok (run ('\tvar seen map[string]any = map[string]any{}\n\tif (p != nil) && (ccxt.InOp(seen, keys[0])) {\n\t}\n\treturn nil\n').indexOf ('InOp(seen, keys[0])') >= 0, 'non-string key keeps InOp')
    ok (run ('\tvar seen map[string]any = map[string]any{}\n\tif ccxt.InOp(seen, p) {\n\t}\n\treturn nil\n').indexOf ('InOp(seen, p)') >= 0, 'any key keeps InOp')
    ok (run ('\tif ccxt.InOp(this.Events, "abc") {\n\t}\n\treturn nil\n').indexOf ('InOp(this.Events, "abc")') >= 0, 'field receiver keeps InOp')
    ok (run ('\tvar seen map[string]any = map[string]any{}\n\tif x := 1; ccxt.InOp(seen, "a") {\n\t\t_ = x\n\t}\n\treturn nil\n').indexOf ('InOp(seen, "a")') >= 0, 'if-init clause keeps InOp')
    const wired = formatGoSource ('go/v4/prediction/t.go', g21Body ('\tvar oc any = nil\n\toc = ccxt.MapTyped(p)\n\treturn nil\n'))
    ok (wired.indexOf ('var oc map[string]any = nil') >= 0, 'not wired into formatGoSource: ' + wired)
    const outside = g21Pass (g21Body ('\tvar oc any = nil\n\toc = ccxt.MapTyped(p)\n\treturn nil\n'), 'go/v4/exchange.go')
    ok (outside.indexOf ('var oc any = nil') >= 0, 'a non-prediction file keeps the helper')
    const plain = 'package ccxt\n\nfunc (this *X) F(p any) any {\n\treturn ccxt.GetValue(p, "a")\n}\n'
    ok (g21Pass (plain) === plain, 'no boxed local leaves the file byte-identical')
    return problems
}
