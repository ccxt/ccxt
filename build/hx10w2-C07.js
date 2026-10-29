// hx10 wave2 C07 (C#): native `Task.WhenAll` for `await promiseAll (x)`.
//
// The runtime `promiseAll` re-boxes every element through AsTaskOfObject/FromTyped, which is a
// no-op for a `Task<T>` whose T is a plain object box (object / IDictionary<string, object> /
// List<object> / string). When EVERY element of the promise list prints as one such `Task<T>`,
// and no element can be a non-task (each element is a `Task<...>`-returning method call), the
// list can be typed `List<Task<T>>` and awaited natively:
//
//     List<object> promises = new List<object> () {};
//     promises.Add (this.publicGetA (parameters));
//     List<object> responses = await promiseAll (promises);
//        ->
//     List<Task<Dictionary<string, object>>> promises = new List<Task<Dictionary<string, object>>> () {};
//     promises.Add (this.publicGetA (parameters));
//     List<object> responses = new List<object> (await Task.WhenAll (promises));
//
// A slot held by a local (`object p = this.publicGetA (...)` / `var p = ...`) is proven from that
// local's own single-call initializer and retyped with it. Anything unproven keeps the plain
// helper call.
import fs from 'fs'

const HX10C07_PASS_TYPES = new Set ([
    'object',
    'Dictionary<string, object>',
    'IDictionary<string, object>',
    'List<object>',
    'string',
])

const HX10C07_API_CACHE = new Map ()

// implicit-API endpoint -> C# `Task<...>` return type, read from the venue's api file (a
// separately generated artifact: the venue file only ever CALLS those methods)
function hx10C07ApiTaskTypes (venue) {
    if (HX10C07_API_CACHE.has (venue)) {
        return HX10C07_API_CACHE.get (venue)
    }
    const table = new Map ()
    for (const folder of [ 'cs/ccxt/api/', 'cs/ccxt/api/prediction/' ]) {
        let text
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
    HX10C07_API_CACHE.set (venue, table)
    return table
}

// same-length mask: string/char bodies and `//` comments become spaces, so every offset in the
// mask is an offset in the original text
function hx10C07Mask (content) {
    const out = []
    for (const line of content.split ('\n')) {
        let masked = ''
        let i = 0
        while (i < line.length) {
            const ch = line[i]
            if ((ch === '/') && (line[i + 1] === '/')) {
                masked += ' '.repeat (line.length - i)
                break
            }
            if ((ch === '"') || (ch === "'")) {
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

function hx10C07MatchBracket (mask, open, opener, closer) {
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

// `;` ending the statement that starts at `from`, balanced over ()/{}/[]
function hx10C07StatementEnd (mask, from) {
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

// top-level comma-separated parts of [from, to), trimmed, as absolute ranges
function hx10C07SplitTop (mask, from, to) {
    const parts = []
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

// method regions of a generated file: `    <modifiers> ... )` then a `{` line
function hx10C07MethodSpans (mask, lines) {
    const offsets = []
    let at = 0
    for (const line of lines) {
        offsets.push (at)
        at += line.length + 1
    }
    const maskLines = mask.split ('\n')
    const spans = []
    for (let i = 0; i + 1 < maskLines.length; i++) {
        if (!/^    (?:public|private|protected|internal)\b/.test (maskLines[i])) {
            continue
        }
        if (!/\)\s*$/.test (maskLines[i]) || (maskLines[i + 1].trim () !== '{')) {
            continue
        }
        const bodyStart = offsets[i + 1]
        const end = hx10C07MatchBracket (mask, bodyStart, '{', '}')
        if (end < 0) {
            continue
        }
        spans.push ({ start: offsets[i], body: bodyStart, end: end + 1 })
    }
    return spans
}

// end offset of the `{ }` block holding position `at` (the method end when it is top level)
function hx10C07BlockEnd (mask, at, span) {
    let depth = 0
    for (let i = at - 1; i >= span.body; i--) {
        if (mask[i] === '}') {
            depth++
        } else if (mask[i] === '{') {
            if (depth === 0) {
                const close = hx10C07MatchBracket (mask, i, '{', '}')
                return (close < 0) ? -1 : close + 1
            }
            depth--
        }
    }
    return span.end
}

// `Task<...>` returns declared in this file: an ambiguous name (two different types) is dropped
function hx10C07DeclaredTasks (mask) {
    const table = new Map ()
    const re = /public\s+(?:async\s+)?(?:static\s+)?(?:override\s+|virtual\s+)*(Task<(?:[^<>]|<[^<>]*>)*>)\s+(\w+)\s*\(/g
    let m
    while ((m = re.exec (mask)) !== null) {
        const name = m[2]
        const type = m[1]
        if (!table.has (name)) {
            table.set (name, type)
        } else if (table.get (name) !== type) {
            table.set (name, undefined)
        }
    }
    return table
}

function hx10C07TaskInner (type) {
    if ((typeof type !== 'string') || !/^Task<(?:[^<>]|<[^<>]*>)*>$/.test (type)) {
        return undefined
    }
    const inner = type.substring (5, type.length - 1)
    return (inner.length > 0) ? inner : undefined
}

function hx10C07CalleeTask (name, apiTable, declared) {
    if (declared.has (name)) {
        return declared.get (name)
    }
    return apiTable.get (name)
}

// element type of one promise-list slot; `edit` retypes a local declared `object`
function hx10C07ElementType (content, mask, part, span, apiTable, declared) {
    const text = mask.slice (part.start, part.end)
    const call = /^this\.(\w+)\s*\(/.exec (text)
    if (call !== null) {
        const open = part.start + call[0].length - 1
        if (hx10C07MatchBracket (mask, open, '(', ')') !== part.end - 1) {
            return undefined // a larger expression wraps the call
        }
        const inner = hx10C07TaskInner (hx10C07CalleeTask (call[1], apiTable, declared))
        return (inner === undefined) ? undefined : { type: inner }
    }
    if (!/^[A-Za-z_]\w*$/.test (text)) {
        return undefined
    }
    const name = text
    const body = mask.slice (span.start, span.end)
    const declRe = new RegExp ('(?:^|[^\\w.])(Task<(?:[^<>]|<[^<>]*>)*>|var|object)\\s+' + name + '\\s*=', 'g')
    const decls = []
    let dm
    while ((dm = declRe.exec (body)) !== null) {
        decls.push ({ at: span.start + dm.index + dm[0].indexOf (dm[1]), kind: dm[1] })
    }
    if (decls.length !== 1) {
        return undefined // zero or several declarations: no single printed type
    }
    const decl = decls[0]
    const stmtEnd = hx10C07StatementEnd (mask, decl.at)
    if ((stmtEnd < 0) || (stmtEnd > span.end)) {
        return undefined
    }
    const stmt = mask.slice (decl.at, stmtEnd)
    const init = /=\s*this\.(\w+)\s*\(/.exec (stmt)
    if (init === null) {
        return undefined // not a single endpoint call: nothing to type from
    }
    const initOpen = decl.at + init.index + init[0].length - 1
    if (hx10C07MatchBracket (mask, initOpen, '(', ')') !== stmtEnd - 1) {
        return undefined
    }
    const inner = hx10C07TaskInner (hx10C07CalleeTask (init[1], apiTable, declared))
    if (inner === undefined) {
        return undefined
    }
    // the task local must be read only in this list (its declaration plus one use)
    const mention = new RegExp ('(?:^|[^\\w.])' + name + '(?![\\w])', 'g')
    let count = 0
    while (mention.exec (body) !== null) {
        count++
    }
    if (count !== 2) {
        return undefined
    }
    if (decl.kind === 'object') {
        return { type: inner, edit: { start: decl.at, end: decl.at + 'object'.length, text: 'Task<' + inner + '>' } }
    }
    return { type: inner }
}

function hx10C07SharedElement (content, mask, parts, span, apiTable, declared) {
    const resolved = parts.map ((part) => hx10C07ElementType (content, mask, part, span, apiTable, declared))
    if (resolved.some ((r) => r === undefined)) {
        return undefined
    }
    const kinds = new Set (resolved.map (r => r.type))
    if (kinds.size !== 1) {
        return undefined // mixed Task<T> elements: no single WhenAll overload
    }
    const one = [ ...kinds ][0]
    if (!HX10C07_PASS_TYPES.has (one)) {
        return undefined // PromiseAll re-boxes this T (typed struct/dict lists) or the ctor cannot take it
    }
    return { inner: one, edits: resolved.filter (r => r.edit !== undefined).map (r => r.edit) }
}

function hx10C07Apply (content, edits) {
    const sorted = [ ...edits ].sort ((a, b) => b.start - a.start)
    let out = content
    for (const edit of sorted) {
        out = out.substring (0, edit.start) + edit.text + out.substring (edit.end)
    }
    return out
}

// the rewritten site must not push a short line over the 400-char budget
function hx10C07LongLinesOk (content, edits) {
    const from = Math.min (...edits.map (e => e.start))
    const to = Math.max (...edits.map (e => e.end))
    const lineFrom = content.lastIndexOf ('\n', from) + 1
    const lineTo = content.indexOf ('\n', to)
    const before = content.slice (lineFrom, (lineTo < 0) ? content.length : lineTo)
    if (before.split ('\n').some (l => l.length > 400)) {
        return true
    }
    const after = hx10C07Apply (before, edits.map (e => ({ start: e.start - lineFrom, end: e.end - lineFrom, text: e.text })))
    return !after.split ('\n').some (l => l.length > 400)
}

// the edits that convert one site, or undefined when any part of it is unproven
function hx10C07Site (content, mask, span, callAt, open, close, apiTable, declared) {
    if (mask.slice (callAt - 6, callAt) !== 'await ') {
        return undefined
    }
    if (mask[close + 1] !== ';') {
        return undefined
    }
    const argMasked = mask.slice (open + 1, close)
    const argTrim = argMasked.trim ()
    const argStart = open + 1 + (argMasked.length - argMasked.trimStart ().length)
    const argEnd = argStart + argTrim.length
    if (/^new List<object>/.test (argTrim)) {
        const braceOpen = argStart + argTrim.indexOf ('{')
        const braceClose = hx10C07MatchBracket (mask, braceOpen, '{', '}')
        if ((braceOpen < argStart) || (braceClose !== argEnd - 1)) {
            return undefined
        }
        const parts = hx10C07SplitTop (mask, braceOpen + 1, braceClose)
        if (parts.length === 0) {
            return undefined // an empty literal says nothing about the element type
        }
        const shared = hx10C07SharedElement (content, mask, parts, span, apiTable, declared)
        if (shared === undefined) {
            return undefined
        }
        const argText = content.slice (argStart, argEnd)
        const newArg = 'new List<Task<' + shared.inner + '>>' + argText.substring ('new List<object>'.length)
        const call = { start: callAt - 6, end: close + 1, text: 'new List<object>(await Task.WhenAll(' + newArg + '))' }
        return [ call, ...shared.edits ]
    }
    if (!/^[A-Za-z_]\w*$/.test (argTrim)) {
        return undefined
    }
    const name = argTrim
    const wholeBody = mask.slice (span.start, span.end)
    const declRe = new RegExp ('List<object>\\s+' + name + '\\s*=', 'g')
    const decls = []
    let dm
    while ((dm = declRe.exec (wholeBody)) !== null) {
        decls.push (span.start + dm.index)
    }
    // C# scoping: a same-named list in a sibling block is another variable; the one in scope at
    // the call is the nearest earlier declaration whose block still contains the call
    const inScope = decls.map (at => ({ at, end: hx10C07BlockEnd (mask, at, span) })).filter (d => (d.end > callAt) && (d.at < callAt))
    if (inScope.length !== 1) {
        return undefined
    }
    const scope = inScope[0]
    const declAt = scope.at
    const body = mask.slice (scope.at, scope.end)
    const bodyOffset = scope.at
    const stmtEnd = hx10C07StatementEnd (mask, declAt)
    if ((stmtEnd < 0) || (stmtEnd > span.end)) {
        return undefined
    }
    const stmt = mask.slice (declAt, stmtEnd)
    if (!/=\s*new List<object>/.test (stmt)) {
        return undefined // initialised from something the rule cannot type
    }
    const parts = []
    const braceOpen = mask.indexOf ('{', declAt)
    if ((braceOpen > 0) && (braceOpen < stmtEnd)) {
        const braceClose = hx10C07MatchBracket (mask, braceOpen, '{', '}')
        if (braceClose !== stmtEnd - 1) {
            return undefined
        }
        parts.push (...hx10C07SplitTop (mask, braceOpen + 1, braceClose))
    }
    const allowed = [ { start: declAt, end: stmtEnd + 1 }, { start: argStart, end: argEnd } ]
    const addRe = new RegExp ('(?:^|[^\\w.])' + name + '\\.Add\\s*\\(', 'g')
    const addCalls = []
    let am
    while ((am = addRe.exec (body)) !== null) {
        const addOpen = bodyOffset + am.index + am[0].length - 1
        const addClose = hx10C07MatchBracket (mask, addOpen, '(', ')')
        if (addClose < 0) {
            return undefined
        }
        const end = hx10C07StatementEnd (mask, addClose + 1)
        if ((end < 0) || (mask.slice (addClose + 1, end).trim () !== '')) {
            return undefined // the Add result or a chained call, not a plain element add
        }
        if (hx10C07SplitTop (mask, addOpen + 1, addClose).length !== 1) {
            return undefined // AddRange / multi-argument Add
        }
        addCalls.push ({ open: addOpen, close: addClose })
        allowed.push ({ start: bodyOffset + am.index + am[0].indexOf (name), end: end + 1 })
    }
    if (addCalls.length === 0) {
        return undefined
    }
    for (const call of addCalls) {
        parts.push (...hx10C07SplitTop (mask, call.open + 1, call.close))
    }
    // every other mention of the list in the method means the retyped declaration escapes
    const mention = new RegExp ('(?:^|[^\\w.])' + name + '(?![\\w])', 'g')
    let mm
    while ((mm = mention.exec (body)) !== null) {
        const at = bodyOffset + mm.index + mm[0].indexOf (name)
        const countRead = mask.startsWith ('?.Count ?? 0)', at + name.length) // List<Task<T>> keeps .Count
        if (!countRead && !allowed.some (r => (at >= r.start) && (at < r.end))) {
            return undefined
        }
    }
    const shared = hx10C07SharedElement (content, mask, parts, span, apiTable, declared)
    if (shared === undefined) {
        return undefined
    }
    const declText = content.slice (declAt, stmtEnd + 1)
    return [
        { start: declAt, end: stmtEnd + 1, text: declText.split ('List<object>').join ('List<Task<' + shared.inner + '>>') },
        { start: callAt - 6, end: close + 1, text: 'new List<object>(await Task.WhenAll(' + name + '))' },
        ...shared.edits,
    ]
}

export function hx10C07PromiseAll (content, apiTypesOf) {
    if (!content || (content.indexOf ('promiseAll') < 0)) {
        return content
    }
    const venueMatch = /public partial class (\w+)/.exec (content)
    if (venueMatch === null) {
        return content
    }
    const apiTypes = (typeof apiTypesOf === 'function') ? apiTypesOf : hx10C07ApiTaskTypes
    const apiTable = apiTypes (venueMatch[1])
    const mask = hx10C07Mask (content)
    const spans = hx10C07MethodSpans (mask, content.split ('\n'))
    const declared = hx10C07DeclaredTasks (mask)
    const accepted = []
    for (const span of spans) {
        const body = mask.slice (span.start, span.end)
        const re = /(?<![\w.])promiseAll\s*\(/g
        let m
        while ((m = re.exec (body)) !== null) {
            const callAt = span.start + m.index
            const open = callAt + m[0].length - 1
            const close = hx10C07MatchBracket (mask, open, '(', ')')
            if (close < 0) {
                continue
            }
            const site = hx10C07Site (content, mask, span, callAt, open, close, apiTable, declared)
            if (site === undefined) {
                continue
            }
            if (site.some (e => accepted.some (a => (e.start < a.end) && (a.start < e.end)))) {
                continue // an earlier site already rewrote a shared declaration
            }
            if (!hx10C07LongLinesOk (content, site)) {
                continue
            }
            accepted.push (...site)
        }
    }
    return (accepted.length === 0) ? content : hx10C07Apply (content, accepted)
}

// snippet checks (`csharpTranspiler.ts --self-test`): every negative must stay byte-identical
export function hx10C07SelfTest () {
    const problems = []
    const check = (label, input, expected, api) => {
        const table = new Map (Object.entries (api))
        const out = hx10C07PromiseAll (input, () => table)
        if (out !== expected) {
            problems.push ('hx10 C07 promiseAll: ' + label + ' -> ' + out.replace (/\n/g, ' | '))
        }
    }
    const head = 'namespace ccxt;\n\npublic partial class testvenue : Exchange\n{\n'
    const tail = '}\n'
    const wrap = (body) => head + body + tail
    // 1: list literal of two typed endpoints
    check ('literal',
        wrap ('    public async Task<object> fetchA(object parameters = null)\n    {\n        List<object> responses = await promiseAll(new List<object> {this.publicGetA(parameters), this.publicGetB(parameters)});\n        return responses;\n    }\n'),
        wrap ('    public async Task<object> fetchA(object parameters = null)\n    {\n        List<object> responses = new List<object>(await Task.WhenAll(new List<Task<Dictionary<string, object>>> {this.publicGetA(parameters), this.publicGetB(parameters)}));\n        return responses;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>', publicGetB: 'Task<Dictionary<string, object>>' })
    // 2: a declared list filled by Add
    check ('local',
        wrap ('    public async Task<object> fetchB(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        for (int i = 0; i < 2; i++)\n        {\n            promises.Add(this.publicGetA(parameters));\n        }\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n'),
        wrap ('    public async Task<object> fetchB(object parameters = null)\n    {\n        List<Task<Dictionary<string, object>>> promises = new List<Task<Dictionary<string, object>>>() {};\n        for (int i = 0; i < 2; i++)\n        {\n            promises.Add(this.publicGetA(parameters));\n        }\n        List<object> responses = new List<object>(await Task.WhenAll(promises));\n        return responses;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>' })
    // 2b: the list's own `.Count` read keeps the typed declaration
    check ('countRead',
        wrap ('    public async Task<object> fetchM(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.publicGetA(parameters));\n        int n = (promises?.Count ?? 0);\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n'),
        wrap ('    public async Task<object> fetchM(object parameters = null)\n    {\n        List<Task<Dictionary<string, object>>> promises = new List<Task<Dictionary<string, object>>>() {};\n        promises.Add(this.publicGetA(parameters));\n        int n = (promises?.Count ?? 0);\n        List<object> responses = new List<object>(await Task.WhenAll(promises));\n        return responses;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>' })
    // 2c: the same list name in sibling blocks is two variables; the one in scope converts
    check ('siblingScope',
        wrap ('    public async Task<object> fetchS(object parameters = null)\n    {\n        if (parameters != null)\n        {\n            List<object> promises = new List<object>() {};\n            promises.Add(this.publicGetB(parameters));\n            List<object> responses = await promiseAll(promises);\n            this.log(responses);\n        } else\n        {\n            List<object> promises = new List<object>() {};\n            promises.Add(this.publicGetA(parameters));\n            List<object> responses = await promiseAll(promises);\n            this.log(responses);\n        }\n        return null;\n    }\n'),
        wrap ('    public async Task<object> fetchS(object parameters = null)\n    {\n        if (parameters != null)\n        {\n            List<Task<List<object>>> promises = new List<Task<List<object>>>() {};\n            promises.Add(this.publicGetB(parameters));\n            List<object> responses = new List<object>(await Task.WhenAll(promises));\n            this.log(responses);\n        } else\n        {\n            List<Task<Dictionary<string, object>>> promises = new List<Task<Dictionary<string, object>>>() {};\n            promises.Add(this.publicGetA(parameters));\n            List<object> responses = new List<object>(await Task.WhenAll(promises));\n            this.log(responses);\n        }\n        return null;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>', publicGetB: 'Task<List<object>>' })
    // 3: `object` task locals retyped from their single-call initializer
    check ('objectLocal',
        wrap ('    public async Task<object> fetchI(object parameters = null)\n    {\n        object firstPromise = this.publicGetA(parameters);\n        var secondPromise = this.publicGetB(parameters);\n        var both = await promiseAll(new List<object>() {firstPromise, secondPromise});\n        return both;\n    }\n'),
        wrap ('    public async Task<object> fetchI(object parameters = null)\n    {\n        Task<Dictionary<string, object>> firstPromise = this.publicGetA(parameters);\n        var secondPromise = this.publicGetB(parameters);\n        var both = new List<object>(await Task.WhenAll(new List<Task<Dictionary<string, object>>>() {firstPromise, secondPromise}));\n        return both;\n    }\n'),
        { publicGetA: 'Task<Dictionary<string, object>>', publicGetB: 'Task<Dictionary<string, object>>' })
    // negatives: mixed element types, a T promiseAll re-boxes, an untabled callee,
    // a list that escapes, a non-awaited call, and a task local read twice
    const negatives = {
        mixed: [ '    public async Task<object> fetchC(object parameters = null)\n    {\n        List<object> responses = await promiseAll(new List<object> {this.publicGetA(parameters), this.publicGetList(parameters)});\n        return responses;\n    }\n',
            { publicGetA: 'Task<Dictionary<string, object>>', publicGetList: 'Task<List<object>>' } ],
        reboxed: [ '    public async Task<object> fetchD(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.FetchOrders(parameters));\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n',
            {} ],
        untabled: [ '    public async Task<object> fetchE(object parameters = null)\n    {\n        List<object> responses = await promiseAll(new List<object> {this.unknownCall(parameters)});\n        return responses;\n    }\n',
            {} ],
        escapes: [ '    public async Task<object> fetchF(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.publicGetA(parameters));\n        this.log(promises);\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n',
            { publicGetA: 'Task<Dictionary<string, object>>' } ],
        notAwaited: [ '    public async Task<object> fetchG(object parameters = null)\n    {\n        Task<List<object>> pending = promiseAll(new List<object> {this.publicGetA(parameters)});\n        return await pending;\n    }\n',
            { publicGetA: 'Task<Dictionary<string, object>>' } ],
        taskLocalReadTwice: [ '    public async Task<object> fetchJ(object parameters = null)\n    {\n        Task<List<object>> solo = this.publicGetList(parameters);\n        this.log(solo);\n        var both = await promiseAll(new List<object> {solo});\n        return both;\n    }\n',
            { publicGetList: 'Task<List<object>>' } ],
        objectLocalUsedElsewhere: [ '    public async Task<object> fetchK(object parameters = null)\n    {\n        object only = this.publicGetA(parameters);\n        this.log(only);\n        var both = await promiseAll(new List<object> {only});\n        return both;\n    }\n',
            { publicGetA: 'Task<Dictionary<string, object>>' } ],
        noVenue: [ 'namespace Tests;\n\npublic class Test\n{\n    public async Task<object> fetchH(object parameters = null)\n    {\n        List<object> promises = new List<object>() {};\n        promises.Add(this.publicGetA(parameters));\n        List<object> responses = await promiseAll(promises);\n        return responses;\n    }\n}\n',
            { publicGetA: 'Task<Dictionary<string, object>>' } ],
    }
    for (const [ label, [ body, api ] ] of Object.entries (negatives)) {
        const input = (label === 'noVenue') ? body : wrap (body)
        check ('negative ' + label, input, input, api)
    }
    return problems
}
