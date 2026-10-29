// hx10 wave5 C08 (C#): native `Task.WhenAll` for promiseAll sites with MIXED Task element types.
//
// C07 converts only a list of one plain `Task<T>`. Two shapes are left over and are typed here:
//  (a) the awaited result is DISCARDED — PromiseAll's FromTyped/re-box is unobservable, so any mix
//      of proven `Task`/`Task<T>` elements can await natively: `await Task.WhenAll(<tasks>);`
//  (b) the list is a NAMED literal with one plain element type and the result is used — the
//      declaration and the call are retyped: `new List<object>(await Task.WhenAll (x))`.
// Anything else (a mix whose result is read, or a T PromiseAll re-boxes) keeps the helper call.
import fs from 'fs'

const HX10C08_PLAIN = new Set ([
    'object',
    'Dictionary<string, object>',
    'IDictionary<string, object>',
    'List<object>',
    'string',
    'string?',
])

// same-length mask: string bodies and `//` comments become spaces, so offsets stay valid
function hx10C08Mask (content: string): string {
    const out: string[] = []
    for (const line of content.split ('\n')) {
        let masked = ''
        let i = 0
        while (i < line.length) {
            const ch = line[i]
            if ((ch === '/') && (line[i + 1] === '/')) {
                masked += ' '.repeat (line.length - i)
                break
            }
            if ((ch === '"') || (ch === '\'')) {
                const quote = ch
                let j = i + 1
                masked += (quote === '"') ? '"' : ' '
                while (j < line.length) {
                    if (line[j] === '\\') {
                        masked += '  '
                        j += 2
                        continue
                    }
                    if (line[j] === quote) {
                        break
                    }
                    masked += ' '
                    j++
                }
                if (j < line.length) {
                    masked += (quote === '"') ? '"' : ' '
                    j++
                }
                i = j
                continue
            }
            masked += ch
            i++
        }
        out.push (masked)
    }
    return out.join ('\n')
}

function hx10C08MatchBracket (mask: string, open: number, opener: string, closer: string): number {
    let depth = 0
    for (let i = open; i < mask.length; i++) {
        const ch = mask[i]
        if (ch === opener) {
            depth++
        } else if (ch === closer) {
            depth--
            if (depth === 0) {
                return i
            }
        }
    }
    return -1
}

function hx10C08StatementEnd (mask: string, from: number): number {
    let depth = 0
    for (let i = from; i < mask.length; i++) {
        const ch = mask[i]
        if ((ch === '(') || (ch === '{') || (ch === '[')) {
            depth++
        } else if ((ch === ')') || (ch === '}') || (ch === ']')) {
            depth--
            if (depth < 0) {
                return -1
            }
        } else if ((ch === ';') && (depth === 0)) {
            return i
        }
    }
    return -1
}

function hx10C08SplitParts (mask: string, from: number, to: number): Array<{ start: number, end: number }> {
    const parts: Array<{ start: number, end: number }> = []
    let depth = 0
    let start = from
    for (let i = from; i <= to; i++) {
        const ch = (i === to) ? ',' : mask[i]
        if ((ch === '(') || (ch === '{') || (ch === '[')) {
            depth++
        } else if ((ch === ')') || (ch === '}') || (ch === ']')) {
            depth--
        }
        if ((ch === ',') && (depth === 0)) {
            let a = start
            let b = i
            while ((a < b) && /\s/.test (mask[a])) {
                a++
            }
            while ((b > a) && /\s/.test (mask[b - 1])) {
                b--
            }
            if (b > a) {
                parts.push ({ start: a, end: b })
            }
            start = i + 1
        }
    }
    return parts
}

function hx10C08MethodSpans (mask: string, lines: string[]): Array<{ start: number, body: number, end: number }> {
    const offsets: number[] = []
    let at = 0
    for (const line of lines) {
        offsets.push (at)
        at += line.length + 1
    }
    const maskLines = mask.split ('\n')
    const spans: Array<{ start: number, body: number, end: number }> = []
    for (let i = 0; i + 1 < maskLines.length; i++) {
        if (!/^    (?:public|private|protected|internal)\s/.test (maskLines[i])) {
            continue
        }
        if (!/\)\s*$/.test (maskLines[i]) || (maskLines[i + 1].trim () !== '{')) {
            continue
        }
        const bodyStart = offsets[i + 1]
        const end = hx10C08MatchBracket (mask, bodyStart, '{', '}')
        if (end < 0) {
            continue
        }
        spans.push ({ start: offsets[i], body: bodyStart, end: end + 1 })
    }
    return spans
}

function hx10C08TaskInner (type: string | undefined): string | undefined {
    if ((typeof type !== 'string') || !/^Task<(?:[^<>]|<[^<>]*>)*>$/.test (type)) {
        return undefined
    }
    const inner = type.substring (5, type.length - 1)
    return (inner.length > 0) ? inner : undefined
}

function hx10C08IsTaskType (type: string | undefined): boolean {
    return (type === 'Task') || (hx10C08TaskInner (type) !== undefined)
}

// `Task<...>` returns declared once across the hand-written base files
let HX10C08_BASE: Map<string, string> | undefined = undefined

function hx10C08BaseTasks (): Map<string, string> {
    if (HX10C08_BASE !== undefined) {
        return HX10C08_BASE
    }
    const table = new Map<string, string> ()
    const seen = new Map<string, Set<string>> ()
    let names: string[] = []
    try {
        names = fs.readdirSync ('cs/ccxt/base').filter ((f) => /^Exchange.*\.cs$/.test (f) || (f === 'PredictionExchange.cs'))
    } catch (e) {
        names = []
    }
    for (const file of names) {
        let text = ''
        try {
            text = fs.readFileSync ('cs/ccxt/base/' + file, 'utf8')
        } catch (e) {
            continue
        }
        const re = /public\s+(?:async\s+)?(?:static\s+)?(?:override\s+|virtual\s+|abstract\s+)*(Task(?:<(?:[^<>]|<[^<>]*>)*>)?)\s+(\w+)\s*\(/g
        let m
        while ((m = re.exec (text)) !== null) {
            const name = m[2]
            if (!seen.has (name)) {
                seen.set (name, new Set ())
            }
            seen.get (name)!.add (m[1])
        }
    }
    for (const [name, types] of seen) {
        if (types.size === 1) {
            table.set (name, [ ...types ][0])
        }
    }
    HX10C08_BASE = table
    return table
}

const HX10C08_API: Map<string, Map<string, string>> = new Map ()

function hx10C08ApiTaskTypes (venue: string): Map<string, string> {
    const cached = HX10C08_API.get (venue)
    if (cached !== undefined) {
        return cached
    }
    const table = new Map<string, string> ()
    for (const folder of [ 'cs/ccxt/api/', 'cs/ccxt/api/prediction/' ]) {
        let text = ''
        try {
            text = fs.readFileSync (folder + venue + '.cs', 'utf8')
        } catch (e) {
            continue
        }
        const re = /public\s+(?:async\s+)?(Task<(?:[^<>]|<[^<>]*>)*>)\s+(\w+)\s*\(/g
        let m
        while ((m = re.exec (text)) !== null) {
            if (!table.has (m[2])) {
                table.set (m[2], m[1])
            }
        }
    }
    HX10C08_API.set (venue, table)
    return table
}

interface Hx10C08Edit { start: number, end: number, text: string }

interface Hx10C08Element { type: string, edit?: Hx10C08Edit }

// printed `Task`/`Task<T>` of one promise-list slot; `edit` retypes an `object`-declared local
function hx10C08ElementInfo (mask: string, part: { start: number, end: number }, span: { start: number, end: number }, api: Map<string, string>, declared: Map<string, string | undefined>): Hx10C08Element | undefined {
    const text = mask.slice (part.start, part.end)
    const call = /^this\.(\w+)\s*\(/.exec (text)
    if (call !== null) {
        const open = part.start + call[0].length - 1
        if (hx10C08MatchBracket (mask, open, '(', ')') !== part.end - 1) {
            return undefined
        }
        let type = declared.get (call[1])
        if (type === undefined) {
            type = api.get (call[1])
        }
        if (type === undefined) {
            type = hx10C08BaseTasks ().get (call[1])
        }
        return (type === undefined) ? undefined : { type }
    }
    if (!/^[A-Za-z_]\w*$/.test (text)) {
        return undefined
    }
    const name = text
    const body = mask.slice (span.start, span.end)
    const declRe = new RegExp ('(?:^|[^\\w.])(Task(?:<(?:[^<>]|<[^<>]*>)*>)?|var|object)\\s+' + name + '\\s*=', 'g')
    const decls: Array<{ at: number, kind: string }> = []
    let dm
    while ((dm = declRe.exec (body)) !== null) {
        decls.push ({ at: span.start + dm.index + dm[0].indexOf (dm[1]), kind: dm[1] })
    }
    if (decls.length !== 1) {
        return undefined
    }
    const decl = decls[0]
    const stmtEnd = hx10C08StatementEnd (mask, decl.at)
    if ((stmtEnd < 0) || (stmtEnd > span.end)) {
        return undefined
    }
    const stmt = mask.slice (decl.at, stmtEnd)
    const init = /=\s*this\.(\w+)\s*\(/.exec (stmt)
    if (init === null) {
        return undefined
    }
    const initOpen = decl.at + init.index + init[0].length - 1
    if (hx10C08MatchBracket (mask, initOpen, '(', ')') !== stmtEnd - 1) {
        return undefined
    }
    let type = declared.get (init[1])
    if (type === undefined) {
        type = api.get (init[1])
    }
    if (type === undefined) {
        type = hx10C08BaseTasks ().get (init[1])
    }
    if (!hx10C08IsTaskType (type)) {
        return undefined
    }
    const mention = new RegExp ('(?:^|[^\\w.])' + name + '(?![\\w])', 'g')
    let count = 0
    while (mention.exec (body) !== null) {
        count++
    }
    if (count !== 2) {
        return undefined
    }
    if (decl.kind === 'object') {
        return { type: type!, edit: { start: decl.at, end: decl.at + 'object'.length, text: type! } }
    }
    if (decl.kind === 'var') {
        return { type: type! }
    }
    return (decl.kind === type) ? { type: type! } : undefined
}

function hx10C08Apply (content: string, edits: Hx10C08Edit[]): string {
    const sorted = [ ...edits ].sort ((a, b) => b.start - a.start)
    let out = content
    for (const edit of sorted) {
        out = out.substring (0, edit.start) + edit.text + out.substring (edit.end)
    }
    return out
}

// the rewritten site must not push a short line over the 400-char budget
function hx10C08LongLinesOk (content: string, edits: Hx10C08Edit[]): boolean {
    const from = Math.min (...edits.map (e => e.start))
    const to = Math.max (...edits.map (e => e.end))
    const lineFrom = content.lastIndexOf ('\n', from) + 1
    const lineTo = content.indexOf ('\n', to)
    const before = content.slice (lineFrom, (lineTo < 0) ? content.length : lineTo)
    if (before.split ('\n').some (l => l.length > 400)) {
        return true
    }
    const after = hx10C08Apply (before, edits.map (e => ({ start: e.start - lineFrom, end: e.end - lineFrom, text: e.text })))
    return !after.split ('\n').some (l => l.length > 400)
}

// the sites that convert: discarded result (any proven Task mix) and a named literal list
// whose single plain element type lets the declaration and the call be retyped
function hx10C08Site (content: string, mask: string, span: { start: number, end: number }, callAt: number, open: number, close: number, api: Map<string, string>, declared: Map<string, string | undefined>): Hx10C08Edit[] | undefined {
    if (mask.slice (callAt - 6, callAt) !== 'await ') {
        return undefined
    }
    const startsStatement = (() => {
        let i = callAt - 7
        while ((i >= 0) && (mask[i] === ' ' || mask[i] === '\t')) {
            i--
        }
        return (i < 0) || (mask[i] === ';') || (mask[i] === '{') || (mask[i] === '}') || (mask[i] === '\n')
    })()
    const discard = (mask[close + 1] === ';') && startsStatement
    const argMasked = mask.slice (open + 1, close)
    const argTrim = argMasked.trim ()
    const argStart = open + 1 + (argMasked.length - argMasked.trimStart ().length)
    const argEnd = argStart + argTrim.length
    if (/^new List<object>/.test (argTrim)) {
        if (!discard) {
            return undefined // a used result is C07's homogeneous arm
        }
        const braceOpen = argStart + argTrim.indexOf ('{')
        const braceClose = hx10C08MatchBracket (mask, braceOpen, '{', '}')
        if ((braceOpen < argStart) || (braceClose !== argEnd - 1)) {
            return undefined
        }
        const parts = hx10C08SplitParts (mask, braceOpen + 1, braceClose)
        if (parts.length === 0) {
            return undefined
        }
        const infos = parts.map ((part) => hx10C08ElementInfo (mask, part, span, api, declared))
        if (infos.some ((i) => (i === undefined) || !hx10C08IsTaskType (i.type))) {
            return undefined
        }
        const listText = content.slice (braceOpen, braceClose + 1)
        return [
            { start: callAt - 6, end: close + 1, text: 'await Task.WhenAll(new Task[] ' + listText + ')' },
            ...infos.map ((i) => i!.edit).filter ((e): e is Hx10C08Edit => e !== undefined),
        ]
    }
    if (!/^[A-Za-z_]\w*$/.test (argTrim)) {
        return undefined
    }
    const name = argTrim
    const body = mask.slice (span.start, span.end)
    const declRe = new RegExp ('List<object>\\s+' + name + '\\s*=', 'g')
    const decls: number[] = []
    let dm
    while ((dm = declRe.exec (body)) !== null) {
        decls.push (span.start + dm.index)
    }
    if (decls.length !== 1) {
        return undefined
    }
    const declAt = decls[0]
    const stmtEnd = hx10C08StatementEnd (mask, declAt)
    if ((stmtEnd < 0) || (stmtEnd > span.end)) {
        return undefined
    }
    const declStmt = mask.slice (declAt, stmtEnd)
    if (!/=\s*new List<object>/.test (declStmt)) {
        return undefined
    }
    const parts: Array<{ start: number, end: number }> = []
    const braceOpen = mask.indexOf ('{', declAt)
    if ((braceOpen > 0) && (braceOpen < stmtEnd)) {
        const braceClose = hx10C08MatchBracket (mask, braceOpen, '{', '}')
        if (braceClose !== stmtEnd - 1) {
            return undefined
        }
        parts.push (...hx10C08SplitParts (mask, braceOpen + 1, braceClose))
    }
    const allowed: Array<{ start: number, end: number }> = [ { start: declAt, end: stmtEnd + 1 }, { start: argStart, end: argEnd } ]
    const addRe = new RegExp ('(?:^|[^\\w.])' + name + '\\.Add\\s*\\(', 'g')
    let am
    while ((am = addRe.exec (body)) !== null) {
        const addOpen = span.start + am.index + am[0].length - 1
        const addClose = hx10C08MatchBracket (mask, addOpen, '(', ')')
        if (addClose < 0) {
            return undefined
        }
        const end = hx10C08StatementEnd (mask, addClose + 1)
        if ((end < 0) || (mask.slice (addClose + 1, end).trim () !== '')) {
            return undefined
        }
        if (hx10C08SplitParts (mask, addOpen + 1, addClose).length !== 1) {
            return undefined
        }
        parts.push (...hx10C08SplitParts (mask, addOpen + 1, addClose))
        allowed.push ({ start: span.start + am.index + am[0].indexOf (name), end: end + 1 })
    }
    if (parts.length === 0) {
        return undefined
    }
    const mention = new RegExp ('(?:^|[^\\w.])' + name + '(?![\\w])', 'g')
    let mm
    while ((mm = mention.exec (body)) !== null) {
        const at = span.start + mm.index + mm[0].indexOf (name)
        if (!allowed.some (r => (at >= r.start) && (at < r.end))) {
            return undefined
        }
    }
    const infos = parts.map ((part) => hx10C08ElementInfo (mask, part, span, api, declared))
    if (infos.some ((i) => (i === undefined) || !hx10C08IsTaskType (i.type))) {
        return undefined
    }
    const declText = content.slice (declAt, stmtEnd + 1)
    const edits: Hx10C08Edit[] = [ ...infos.map ((i) => i!.edit).filter ((e): e is Hx10C08Edit => e !== undefined) ]
    if (discard) {
        return [
            { start: declAt, end: stmtEnd + 1, text: declText.split ('List<object>').join ('List<Task>') },
            { start: callAt - 6, end: close + 1, text: 'await Task.WhenAll(' + name + ')' },
            ...edits,
        ]
    }
    const kinds = new Set (infos.map (i => hx10C08TaskInner (i!.type)))
    if ((kinds.size !== 1) || kinds.has (undefined)) {
        return undefined // a mixed list whose results are read: no single WhenAll overload
    }
    const inner = [ ...kinds ][0] as string
    if (!HX10C08_PLAIN.has (inner)) {
        return undefined // PromiseAll re-boxes this T (typed struct/dict list)
    }
    return [
        { start: declAt, end: stmtEnd + 1, text: declText.split ('List<object>').join ('List<Task<' + inner + '>>') },
        { start: callAt - 6, end: close + 1, text: 'new List<object>(await Task.WhenAll(' + name + '))' },
        ...edits,
    ]
}

export function hx10C08PromiseAll (content: string, apiTypesOf?: (venue: string) => Map<string, string>): string {
    if (!content || (content.indexOf ('promiseAll') < 0)) {
        return content
    }
    const venueMatch = /public partial class (\w+)/.exec (content)
    if (venueMatch === null) {
        return content
    }
    const apiTypes = (typeof apiTypesOf === 'function') ? apiTypesOf : hx10C08ApiTaskTypes
    const api = apiTypes (venueMatch[1])
    const mask = hx10C08Mask (content)
    const spans = hx10C08MethodSpans (mask, content.split ('\n'))
    const declared = new Map<string, string | undefined> ()
    const declRe = /public\s+(?:async\s+)?(?:static\s+)?(?:override\s+|virtual\s+)*(Task(?:<(?:[^<>]|<[^<>]*>)*>)?)\s+(\w+)\s*\(/g
    let dsm
    while ((dsm = declRe.exec (mask)) !== null) {
        const name = dsm[2]
        const type = dsm[1]
        if (!declared.has (name)) {
            declared.set (name, type)
        } else if (declared.get (name) !== type) {
            declared.set (name, undefined)
        }
    }
    const accepted: Hx10C08Edit[] = []
    for (const span of spans) {
        const body = mask.slice (span.start, span.end)
        const re = /(?<![\w.])promiseAll\s*\(/g
        let m
        while ((m = re.exec (body)) !== null) {
            const callAt = span.start + m.index
            const open = callAt + m[0].length - 1
            const close = hx10C08MatchBracket (mask, open, '(', ')')
            if (close < 0) {
                continue
            }
            const site = hx10C08Site (content, mask, span, callAt, open, close, api, declared)
            if (site === undefined) {
                continue
            }
            if (site.some (e => accepted.some (a => (e.start < a.end) && (a.start < e.end)))) {
                continue // an earlier site already rewrote a shared declaration
            }
            if (!hx10C08LongLinesOk (content, site)) {
                continue
            }
            accepted.push (...site)
        }
    }
    return (accepted.length === 0) ? content : hx10C08Apply (content, accepted)
}

export function hx10C08SnippetChecks (): string[] {
    const problems: string[] = []
    const check = (label: string, input: string, expected: string, api: Record<string, string>) => {
        const table = new Map (Object.entries (api))
        const out = hx10C08PromiseAll (input, () => table)
        if (out !== expected) {
            problems.push ('hx10 C08 promiseAll: ' + label + ' -> ' + out.replace (/\n/g, ' | '))
        }
        const again = hx10C08PromiseAll (out, () => table)
        if (again !== out) {
            problems.push ('hx10 C08 promiseAll not idempotent: ' + label)
        }
    }
    const head = 'namespace ccxt;\n\npublic partial class testvenue : Exchange\n{\n'
    const tail = '}\n'
    const wrap = (body: string) => head + body + tail
    const mixedApi = { publicGetA: 'Task<Dictionary<string, object>>', publicGetList: 'Task<List<object>>' }
    // 1: discarded result, mixed element types -> one native WhenAll, no result to re-box
    check ('discardMixed',
        wrap ('    public async Task<object> fetchA(object parameters = null)\n    {\n        await promiseAll(new List<object> {this.publicGetA(parameters), this.publicGetList(parameters)});\n        return null;\n    }\n'),
        wrap ('    public async Task<object> fetchA(object parameters = null)\n    {\n        await Task.WhenAll(new Task[] {this.publicGetA(parameters), this.publicGetList(parameters)});\n        return null;\n    }\n'),
        mixedApi)
    // 2: discarded result, a declared list filled by Add -> List<Task> + WhenAll
    check ('discardLocal',
        wrap ('    public async Task<object> fetchB(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        for (int i = 0; i < 2; i++)\n        {\n            promises.Add(this.publicGetA(parameters));\n            promises.Add(this.publicGetList(parameters));\n        }\n        await promiseAll(promises);\n        return null;\n    }\n'),
        wrap ('    public async Task<object> fetchB(object parameters = null)\n    {\n        List<Task> promises = new List<Task>() {};\n        for (int i = 0; i < 2; i++)\n        {\n            promises.Add(this.publicGetA(parameters));\n            promises.Add(this.publicGetList(parameters));\n        }\n        await Task.WhenAll(promises);\n        return null;\n    }\n'),
        mixedApi)
    // 3: used result over a NAMED literal of one plain element type -> retyped, re-box-free
    check ('namedLiteral',
        wrap ('    public async Task<object> fetchC(object parameters = null)\n    {\n        List<object> promises = new List<object> {this.publicGetA(parameters), this.publicGetB(parameters)};\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n'),
        wrap ('    public async Task<object> fetchC(object parameters = null)\n    {\n        List<Task<Dictionary<string, object>>> promises = new List<Task<Dictionary<string, object>>> {this.publicGetA(parameters), this.publicGetB(parameters)};\n        List<object> responses = new List<object>(await Task.WhenAll(promises));\n        return responses;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>', publicGetB: 'Task<Dictionary<string, object>>' })
    // negatives: a mixed list whose results are read, an untabled callee, a T PromiseAll re-boxes,
    // a non-task element, a list that escapes, and a non-awaited call
    const negatives: Record<string, [string, Record<string, string>]> = {
        mixedUsed: [ '    public async Task<object> fetchD(object parameters = null)\n    {\n        List<object> promises = new List<object> {this.publicGetA(parameters), this.publicGetList(parameters)};\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n', mixedApi ],
        untabled: [ '    public async Task<object> fetchE(object parameters = null)\n    {\n        await promiseAll(new List<object> {this.unknownCall(parameters)});\n        return null;\n    }\n', {} ],
        reboxed: [ '    public async Task<object> fetchF(object parameters = null)\n    {\n        List<object> promises = new List<object> {this.FetchOrders(parameters), this.FetchOrders(parameters)};\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n', {} ],
        nonTask: [ '    public async Task<object> fetchG(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.safeDict(parameters, "k"));\n        promises.Add(this.publicGetA(parameters));\n        await promiseAll(promises);\n        return null;\n    }\n', mixedApi ],
        escapes: [ '    public async Task<object> fetchH(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.publicGetA(parameters));\n        this.log(promises);\n        await promiseAll(promises);\n        return null;\n    }\n', mixedApi ],
        notAwaited: [ '    public async Task<object> fetchI(object parameters = null)\n    {\n        Task<List<object>> pending = promiseAll(new List<object> {this.publicGetA(parameters)});\n        return await pending;\n    }\n', mixedApi ],
        assignedDiscard: [ '    public async Task<object> fetchJ(object parameters = null)\n    {\n        var unused = await promiseAll(new List<object> {this.publicGetA(parameters), this.publicGetList(parameters)});\n        return null;\n    }\n', mixedApi ],
        noVenue: [ 'namespace Tests;\n\npublic class Test\n{\n    public async Task<object> fetchK(object parameters = null)\n    {\n        await promiseAll(new List<object> {this.publicGetA(parameters)});\n        return null;\n    }\n}\n', mixedApi ],
    }
    for (const [ label, [ body, api ] ] of Object.entries (negatives)) {
        const input = (label === 'noVenue') ? body : wrap (body)
        check ('negative ' + label, input, input, api)
    }
    const slotIn = wrap ('    public async Task<object> fetchS(object parameters = null)\n    {\n        object p1 = this.publicGetA(parameters);\n        object p2 = this.publicGetList(parameters);\n        var p1p2Variable = await promiseAll(new List<object>() {p1, p2});\n        var a = ((IList<object>) p1p2Variable)[0];\n        var b = ((IList<object>) p1p2Variable)[1];\n        return this.safeDict(a, b);\n    }\n')
    const slotOut = hx11w8PromiseAllSlots (slotIn, () => new Map (Object.entries (mixedApi)))
    if (slotOut !== wrap ('    public async Task<object> fetchS(object parameters = null)\n    {\n        Task<Dictionary<string, object>> p1 = this.publicGetA(parameters);\n        Task<List<object>> p2 = this.publicGetList(parameters);\n        await Task.WhenAll(p1, p2);\n        var a = await p1;\n        var b = await p2;\n        return this.safeDict(a, b);\n    }\n')) {
        problems.push ('hx11 w8 promiseAll slots -> ' + slotOut.replace (/\n/g, ' | '))
    }
    return problems
}

// hx11 w8: destructured slots. `var aBVariable = await promiseAll(new List<object>() {p, q});` followed by
// `var a = ((IList<object>) aBVariable)[0];` ... over single-use `object` task locals with a plain Task<T>:
// await natively and read each slot from its own task (PromiseAll's re-box is the identity on plain T).
export function hx11w8PromiseAllSlots (content: string, apiTypesOf?: (venue: string) => Map<string, string>): string {
    if (!content || (content.indexOf ('promiseAll') < 0)) {
        return content
    }
    const venueMatch = /public partial class (\w+)/.exec (content)
    if (venueMatch === null) {
        return content
    }
    const api = ((typeof apiTypesOf === 'function') ? apiTypesOf : hx10C08ApiTaskTypes) (venueMatch[1])
    const mask = hx10C08Mask (content)
    const declared = new Map<string, string | undefined> ()
    const declRe = /public\s+(?:async\s+)?(?:static\s+)?(?:override\s+|virtual\s+)*(Task(?:<(?:[^<>]|<[^<>]*>)*>)?)\s+(\w+)\s*\(/g
    let dsm
    while ((dsm = declRe.exec (mask)) !== null) {
        declared.set (dsm[2], (declared.has (dsm[2]) && (declared.get (dsm[2]) !== dsm[1])) ? undefined : dsm[1])
    }
    const accepted: Hx10C08Edit[] = []
    for (const span of hx10C08MethodSpans (mask, content.split ('\n'))) {
        const body = mask.slice (span.start, span.end)
        const re = /var (\w+Variable) = await promiseAll\(new List<object>(?:\(\))? \{([^{}()]*)\}\);\n/g
        let m
        while ((m = re.exec (body)) !== null) {
            const at = span.start + m.index
            const parts = hx10C08SplitParts (mask, at + m[0].indexOf ('{') + 1, at + m[0].lastIndexOf ('}'))
            const names = parts.map (part => mask.slice (part.start, part.end))
            let cursor = at + m[0].length
            const slots: Array<{ indent: string, name: string }> = []
            for (let i = 0; i < names.length; i++) {
                const sm = new RegExp ('^( *)var (\\w+) = \\(\\(IList<object>\\) ' + m[1] + '\\)\\[' + i + '\\];\\n').exec (mask.slice (cursor))
                if (sm === null) {
                    break
                }
                slots.push ({ indent: sm[1], name: sm[2] })
                cursor += sm[0].length
            }
            const mentions = (body.match (new RegExp ('\\b' + m[1] + '\\b', 'g')) || []).length
            if ((slots.length !== names.length) || (mentions !== 1 + names.length) || (new Set (names)).size !== names.length) {
                continue
            }
            const edits: Hx10C08Edit[] = []
            const plain = parts.every ((part, i) => {
                const info = hx10C08ElementInfo (mask, part, span, api, declared)
                const inner = (info === undefined) ? undefined : hx10C08TaskInner (info.type)
                if ((inner === undefined) || !HX10C08_PLAIN.has (inner)) {
                    return false
                }
                if (info!.edit !== undefined) {
                    edits.push (info!.edit)
                }
                // a slot must stay read-only: its type narrows from object to T
                return !new RegExp ('(?<![\\w.])' + slots[i].name + '\\s*(?:=(?!=)|\\+=|-=|\\+\\+|--)').test (body.slice (cursor - span.start))
            })
            if (!plain || !/^ *$/.test (mask.slice (mask.lastIndexOf ('\n', at) + 1, at))) {
                continue
            }
            const reads = slots.map ((s, i) => s.indent + 'var ' + s.name + ' = await ' + names[i] + ';\n').join ('')
            const all = [ { start: at, end: cursor, text: 'await Task.WhenAll(' + names.join (', ') + ');\n' + reads }, ...edits ]
            if (!all.some (e => accepted.some (a => (e.start < a.end) && (a.start < e.end)))) {
                accepted.push (...all)
            }
        }
    }
    return (accepted.length === 0) ? content : hx10C08Apply (content, accepted)
}
