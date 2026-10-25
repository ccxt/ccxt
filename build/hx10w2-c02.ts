// hx10w2 C02 (cs): `getValue` on list receivers and `getArrayLength` as native C# once the
// receiver's own declaration in an enclosing block names a collection type. Two outcomes per
// site: proven -> plain index/`Count` with the helper's own bounds/null semantics; unproven ->
// the helper call unchanged. Element types are matched to the helper's branches one by one, so
// every index still throws or returns null exactly where GetValue(object, object) does.

const HX10W2_TYPE = '[A-Za-z_][A-Za-z0-9_.]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>)?(?:\\[\\])?\\??'
const HX10W2_DECL = new RegExp ('(?:^[ \\t]*|[(,;{}]\\s*)(' + HX10W2_TYPE + ')\\s+([A-Za-z_]\\w*)\\s*(?==[^=]|;|\\)|,|\\bin\\b|$)', 'g')
const HX10W2_FOR = new RegExp ('\\bfor\\s*\\(\\s*(' + HX10W2_TYPE + ')\\s+([A-Za-z_]\\w*)\\s*=', 'g')
const HX10W2_FOREACH = new RegExp ('\\bforeach\\s*\\(\\s*(' + HX10W2_TYPE + ')\\s+([A-Za-z_]\\w*)\\s+in\\b', 'g')
const HX10W2_SIGNATURE = /^ {4}(?:public|private|protected|internal|static|virtual|override|async|sealed)[\w\s<>,.\[\]?]*\([^;]*\)\s*$/
const HX10W2_KEYWORDS = [ 'return', 'throw', 'else', 'case', 'await', 'new', 'in', 'using', 'out', 'ref', 'public', 'private', 'static', 'var',
    'yield', 'const', 'if', 'while', 'foreach', 'for', 'is', 'as', 'null', 'true', 'false', 'default', 'nameof', 'typeof', 'get', 'set',
    'lock', 'switch', 'try', 'catch', 'finally', 'do', 'break', 'continue', 'goto', 'params', 'base', 'this' ]
// element types the helper reads through one of its own list branches: out-of-range returns null
// and a negative index reaches the list indexer (throws). Every other List<T>/IList<T> falls to
// the helper's generic IList branch, which returns null on both sides of the range.
const HX10W2_NULL_ABOVE_ILIST = [ 'IList<object>', 'IList<string>', 'IList<IList<object>>' ]
const HX10W2_NULL_ABOVE_LIST_ELEMENT = [ 'object', 'string', 'dict', 'IDictionary<string, object>', 'Dictionary<string, object>',
    'List<object>', 'List<string>', 'IList<object>' ]

// same-length copy of `content` with string/char literals and `//` comments blanked out: a brace or
// a `getValue(` inside a literal must not move the structural scan
function hx10w2Mask (content: string): string {
    const out: string[] = content.split ('');
    const blank = (at: number) => { out[at] = ' '; };
    let i = 0;
    while (i < content.length) {
        const ch = content[i];
        const verbatim = (ch === '@') && (content[i + 1] === '"');
        if (verbatim || (ch === '"') || (ch === "'")) {
            const quote = verbatim ? '"' : ch;
            blank (i);
            i += verbatim ? 2 : 1;
            while (i < content.length) {
                if (!verbatim && (content[i] === '\\') && (i + 1 < content.length)) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                    continue;
                }
                if (verbatim && (content[i] === '"') && (content[i + 1] === '"')) {
                    blank (i);
                    blank (i + 1);
                    i += 2;
                    continue;
                }
                if (content[i] === quote) {
                    blank (i);
                    i++;
                    break;
                }
                blank (i);
                i++;
            }
            continue;
        }
        if ((ch === '/') && (content[i + 1] === '/')) {
            while (i < content.length && content[i] !== '\n') {
                blank (i);
                i++;
            }
            continue;
        }
        i++;
    }
    return out.join ('');
}

function hx10w2BraceDelta (line: string): number {
    let delta = 0;
    for (const ch of line) {
        if (ch === '{') delta++;
        if (ch === '}') delta--;
    }
    return delta;
}

// `[signatureLine, closingBraceLine]` for every member with a braced body in this file
function hx10w2MethodSpans (maskedLines: string[]): [number, number][] {
    const spans: [number, number][] = [];
    for (let i = 0; i < maskedLines.length; i++) {
        const line = maskedLines[i];
        if (!HX10W2_SIGNATURE.test (line)) continue;
        let open = i + 1;
        while ((open < maskedLines.length) && (maskedLines[open].trim () === '')) open++;
        if (open >= maskedLines.length || (maskedLines[open].trim () !== '{')) continue;
        let depth = 0;
        let close = open;
        for (; close < maskedLines.length; close++) {
            depth += hx10w2BraceDelta (maskedLines[close]);
            if (depth <= 0) break;
        }
        spans.push ([ i, close ]);
        i = close;
    }
    return spans;
}

type Hx10w2Decl = { scope: number[], line: number, col: number, type: string }

// the argument texts of the call whose `(` sits at `open`, with their offsets
function hx10w2Args (masked: string, open: number): { text: string, start: number, end: number }[] | undefined {
    const args: { text: string, start: number, end: number }[] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open; i < masked.length; i++) {
        const ch = masked[i];
        if ('([{'.indexOf (ch) >= 0) depth++;
        if (')]}'.indexOf (ch) >= 0) {
            depth--;
            if (depth === 0) {
                args.push ({ text: masked.substring (start, i), start, end: i });
                return args;
            }
        }
        if ((ch === ',') && (depth === 1)) {
            args.push ({ text: masked.substring (start, i), start, end: i });
            start = i + 1;
        }
    }
    return undefined;
}

function hx10w2IsCollection (type: string): boolean {
    return /^(?:IList|List)<([\s\S]+)>$/.test (type) || (type === 'Dictionary<string, object>') || (type === 'IDictionary<string, object>')
        || (type === 'Dictionary<string,object>') || (type === 'IDictionary<string,object>')
}

// emitted native replacement for a proven site, or undefined when the site must stay a helper call
function hx10w2Replacement (name: string, helper: string, receiverType: string, index: string, indexType: string): string | undefined {
    if (helper === 'getArrayLength') {
        // every proven collection answers the object overload with its own Count (null -> 0),
        // and a string with its Length
        if ((receiverType === 'string') || (receiverType === 'string?')) return '(' + name + '?.Length ?? 0)';
        if (hx10w2IsCollection (receiverType)) return '(' + name + '?.Count ?? 0)';
        return undefined;
    }
    if (indexType === undefined) return undefined;
    const at = (indexType === 'Int64') ? '(int)' + index : index;
    if ((receiverType === 'string') || (receiverType === 'string?')) {
        return '(' + name + ' != null && ' + at + ' < ' + name + '.Length ? ' + name + '[' + at + '].ToString () : null)';
    }
    const list = /^(?:IList|List)<([\s\S]+)>$/.exec (receiverType);
    if (list === null) return undefined;
    const element = list[1].trim ();
    if ((receiverType === 'List<Int64>') || (receiverType === 'List<long>')) {
        // the helper's own List<Int64> branch indexes without a length check: out-of-range throws
        return '(' + name + ' != null ? (object)' + name + '[' + at + '] : null)';
    }
    const nullAbove = (receiverType.indexOf ('IList<') === 0)
        ? HX10W2_NULL_ABOVE_ILIST.indexOf (receiverType) >= 0
        : HX10W2_NULL_ABOVE_LIST_ELEMENT.indexOf (element) >= 0;
    if (nullAbove) {
        return '(' + name + ' != null && ' + at + ' < ' + name + '.Count ? ' + name + '[' + at + '] : null)';
    }
    // any other list reaches the helper's generic IList branch: null on either side of the range,
    // and the element is re-boxed as object for the callers that expect one
    return '(' + name + ' != null && ' + at + ' >= 0 && ' + at + ' < ' + name + '.Count ? (object)' + name + '[' + at + '] : null)';
}

export function hx10w2C02ListHelpers (content: string): string {
    if ((content.indexOf ('getValue(') < 0) && (content.indexOf ('getArrayLength(') < 0)) return content;
    const lines = content.split ('\n');
    const masked = hx10w2Mask (content).split ('\n');
    if (masked.length !== lines.length) return content;
    let changed = false;
    for (const [ start, end ] of hx10w2MethodSpans (masked)) {
        // declarations per name with the block scope they live in
        const decls = new Map<string, Hx10w2Decl[]> ();
        const declare = (name: string, type: string, line: number, col: number, scope: number[]) => {
            const list = decls.get (name) ?? [];
            list.push ({ scope, line, col, type });
            decls.set (name, list);
        };
        const open = masked[start].indexOf ('(');
        if (open >= 0) {
            const params = hx10w2Args (masked[start], open);
            for (const param of params ?? []) {
                const m = /^\s*(?:this\s+)?([A-Za-z_][\w.<>\[\]]*\??)\s+([A-Za-z_]\w*)\s*(?:=|$)/.exec (param.text);
                if (m !== null && HX10W2_KEYWORDS.indexOf (m[1]) < 0) declare (m[2], m[1], start, param.start, []);
            }
        }
        const scopeAt: number[][] = [];
        const stack: number[] = [];
        let scopeId = 0;
        for (let k = start; k <= end; k++) {
            scopeAt.push (stack.slice ());
            const line = masked[k];
            for (const rx of [ HX10W2_FOR, HX10W2_FOREACH ]) {
                rx.lastIndex = 0;
                let m: RegExpExecArray | null;
                while ((m = rx.exec (line)) !== null) declare (m[2], m[1], k, m.index, stack.slice ());
            }
            HX10W2_DECL.lastIndex = 0;
            let d: RegExpExecArray | null;
            while ((d = HX10W2_DECL.exec (line)) !== null) {
                const type = d[1];
                if (HX10W2_KEYWORDS.indexOf (type) >= 0) continue;
                const name = d[2];
                if (name === 'nameof') continue;
                declare (name, type, k, d.index, stack.slice ());
            }
            const delta = hx10w2BraceDelta (line);
            for (let n = 0; n < delta; n++) stack.push (++scopeId);
            for (let n = 0; n < -delta; n++) stack.pop ();
        }
        const resolve = (name: string, line: number, col: number): string | undefined => {
            const here = scopeAt[line - start];
            let best: Hx10w2Decl | undefined;
            for (const decl of decls.get (name) ?? []) {
                if ((decl.line > line) || ((decl.line === line) && (decl.col >= col))) continue;
                const prefix = decl.scope.every ((id, i) => here[i] === id);
                if (!prefix || (decl.scope.length > here.length)) continue;
                if (best === undefined || (decl.scope.length > best.scope.length)
                    || ((decl.scope.length === best.scope.length) && (decl.line >= best.line))) best = decl;
            }
            return best?.type;
        };
        const uniqueType = (name: string): string | undefined => {
            const types = new Set<string> ();
            for (const decl of decls.get (name) ?? []) types.add (decl.type);
            return (types.size === 1) ? [ ...types ][0] : undefined;
        };
        let hx10w2IndexText = '';
        const intType = (text: string, line: number, col: number): string | undefined => {
            hx10w2IndexText = '';
            const arg = text.trim ();
            if (/^\d{1,9}$/.test (arg)) return 'int';
            if (/^[A-Za-z_]\w*$/.test (arg)) {
                const type = uniqueType (arg);
                if ((type === 'int') || (type === 'Int64') || (type === 'long')) return (type === 'int') ? 'int' : 'Int64';
                return undefined;
            }
            const op = /^(?:add|this\.sum|this\.add|subtract|this\.subtract)\(\s*([A-Za-z_]\w*|\d{1,9})\s*,\s*([A-Za-z_]\w*|\d{1,9})\s*\)$/.exec (arg);
            if (op !== null) {
                const a = intType (op[1], line, col);
                const b = intType (op[2], line, col);
                if ((a === undefined) || (b === undefined)) return undefined;
                hx10w2IndexText = '(' + op[1] + (arg.startsWith ('subtract') || arg.startsWith ('this.subtract') ? ' - ' : ' + ') + op[2] + ')';
                return ((a === 'Int64') || (b === 'Int64')) ? 'Int64' : 'int';
            }
            return undefined;
        };
        for (let k = start; k <= end; k++) {
            const line = masked[k];
            const edits: { start: number, end: number, text: string }[] = [];
            const call = /\b(getValue|getArrayLength)\s*\(/g;
            let m: RegExpExecArray | null;
            while ((m = call.exec (line)) !== null) {
                const helper = m[1];
                const at = m.index + m[0].length - 1;
                if ((m.index > 0) && /[\w.]/.test (line[m.index - 1])) continue;
                const args = hx10w2Args (line, at);
                if (args === undefined || (args.length !== (helper === 'getValue' ? 2 : 1))) continue;
                const name = args[0].text.trim ();
                if (!/^[A-Za-z_]\w*$/.test (name)) continue;
                const receiverType = resolve (name, k, args[0].start);
                if (receiverType === undefined) continue;
                const indexType = (helper === 'getValue') ? intType (args[1].text, k, args[1].start) : undefined;
                const indexText = (hx10w2IndexText !== '') ? hx10w2IndexText : ((helper === 'getValue') ? args[1].text.trim () : '');
                const replacement = hx10w2Replacement (name, helper, receiverType, indexText, indexType);
                if (replacement === undefined) continue;
                const close = args[args.length - 1].end + 1;
                edits.push ({ start: m.index, end: close, text: replacement });
            }
            if (edits.length === 0) continue;
            let out = lines[k];
            for (const edit of edits.sort ((a, b) => b.start - a.start)) {
                out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
            }
            lines[k] = out;
            changed = true;
        }
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks for `csharpTranspiler.ts --self-test` (each case fails on the base generator)
export function hx10w2C02SnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (params: string, body: string) => [
        'namespace ccxt;',
        'public partial class test : Exchange',
        '{',
        '    public virtual object f(' + params + ')',
        '    {',
        ...body.split ('\n').map ((l) => '        ' + l),
        '    }',
        '}',
    ].join ('\n');
    const runs = (name: string, params: string, body: string, expected: string, absent?: string) => {
        const out = hx10w2C02ListHelpers (wrap (params, body));
        if (!out.includes (expected) || (absent !== undefined && out.includes (absent))) {
            problems.push ('hx10w2 C02 list helpers ' + name + ':\n' + out);
        }
    };
    const keeps = (name: string, params: string, body: string) => {
        const out = hx10w2C02ListHelpers (wrap (params, body));
        if (!out.includes ('getValue(') && !out.includes ('getArrayLength(')) {
            problems.push ('hx10w2 C02 list helpers (kept) ' + name + ':\n' + out);
        }
    };
    runs ('list count', 'IList<object> rows', 'return getArrayLength(rows);', '(rows?.Count ?? 0)');
    runs ('dict count', 'Dictionary<string, object> data', 'return getArrayLength(data);', '(data?.Count ?? 0)');
    runs ('string length', 'string text', 'return getArrayLength(text);', '(text?.Length ?? 0)');
    runs ('list index', 'List<object> rows', 'return getValue(rows, 1);', '(rows != null && 1 < rows.Count ? rows[1] : null)');
    runs ('string index', 'List<string> names', 'return getValue(names, 0);', '(names != null && 0 < names.Count ? names[0] : null)');
    runs ('Int64 index', 'List<object> rows', 'for (Int64 i = 0; i < 3; i++)\n{\nreturn getValue(rows, i);\n}',
        '(rows != null && (int)i < rows.Count ? rows[(int)i] : null)');
    runs ('sum index', 'List<object> rows', 'int n = 2;\nreturn getValue(rows, add(n, 1));',
        '(rows != null && (n + 1) < rows.Count ? rows[(n + 1)] : null)');
    runs ('typed core list', 'List<Order> orders', 'int i = 1;\nreturn getValue(orders, i);',
        '(orders != null && i >= 0 && i < orders.Count ? (object)orders[i] : null)');
    runs ('Int64 elements', 'List<Int64> ids', 'int i = 0;\nreturn getValue(ids, i);',
        '(ids != null ? (object)ids[i] : null)');
    runs ('inner block declaration', 'object rows', 'if (true)\n{\nList<object> rows = new List<object>() {};\nreturn getValue(rows, 0);\n}\nreturn getValue(rows, 0);',
        '(rows != null && 0 < rows.Count ? rows[0] : null)');
    keeps ('object receiver', 'object rows', 'return getValue(rows, 0);');
    keeps ('string key', 'List<object> rows', 'return getValue(rows, "a");');
    keeps ('object index', 'List<object> rows', 'object i = 0;\nreturn getValue(rows, i);');
    keeps ('unproven receiver', 'object rows', 'return getArrayLength(rows);');
    return problems;
}
