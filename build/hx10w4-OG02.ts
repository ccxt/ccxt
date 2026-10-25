// hx10 wave-3 G04 (Go): BaseExchange.Markets / Markets_by_id / Currencies / Currencies_by_id are
// plain map[string]any fields (go/v4/exchange.go) owned by the loadMarkets goroutine. The printer's
// field table is hard-coded in ast-transpiler and still describes them as *sync.Map, so every
// generated site is rewritten here to the native map operation:
//   this.F = this.CreateSafeDictionary()  -> this.F = map[string]any{}
//   this.F = this.MapToSafeMap(x)         -> this.F = x        (MapTyped(x) when x is not proven a map)
//   this.F = this.IndexBySafe(a, "k")     -> this.F = this.IndexBy(a, "k")
//   this.F.Store(k, v)                    -> this.F[k] = v     (AddElementToObject when k is not a string)
//   this.F.Delete(k)                      -> delete(this.F, k) (Remove when k is not a string)
//   v, ok := this.F.Load(k)               -> v, ok := this.F[k]
//   GetValue(this.F, k)                   -> this.F[k]
//   InOp(this.F, k) in an if condition    -> if _, ok := this.F[k]; ok {
//   AddElementToObject(this.F, k, v) statement -> this.F[k] = v
//   Remove(this.F, k)                     -> delete(this.F, k)
//   var x []string = ObjectKeys(this.F)   -> var x []string = nil + `for k := range this.F { ... }`
// A receiver, key or value this file cannot prove keeps the helper call exactly as the printer
// emitted it: those helpers take `any` and read/write the same plain map, so the site still compiles.
import { goChanMask, goChanClose } from './go-chan.js';

const G04_FIELDS = [ 'Markets', 'Markets_by_id', 'Currencies', 'Currencies_by_id' ];
const G04_FIELD = G04_FIELDS.join ('|');
const G04_ANY = new RegExp ('this\\.(?:' + G04_FIELD + ')\\b');
const G04_RECEIVER = new RegExp ('^this\\.(?:' + G04_FIELD + ')$');
// a Go expression the printer already types as map[string]any
const G04_MAP_EXPR = /^(?:ccxt\.)?(?:this\.(?:IndexBy|DeepExtend|Extend|Keysort)|MapTyped|MarketTyped)\(|^(?:ccxt\.)?map\[string\]any\{|\.\(map\[string\]any\)$/;
// a write value the helper's derefScalar leaves untouched: containers, cache objects, market rows
const G04_PLAIN_VALUE = /^(?:map\[|\[\]|(?:ccxt\.)?New[A-Z]\w*\(|(?:ccxt\.)?(?:ArrayCache|OrderBook)|this\.(?:IndexBy|DeepExtend|Extend|Keysort|MapTyped|MarketTyped)\()/;
// pointer-returning helpers whose result would land in the map un-derefed
const G04_PTR_CALL = /^(?:ccxt\.)?(?:Safe(?:Bool|String|Integer|Int|Float)2?N?|DerefScalar)\(/;
const G04_INIT = new RegExp ('^(\\s*)this\\.(' + G04_FIELD + ') = this\\.CreateSafeDictionary\\((?:true|false)?\\)\\s*$');
const G04_ASSIGN = new RegExp ('^(\\s*)this\\.(' + G04_FIELD + ') = this\\.(MapToSafeMap|IndexBySafe)\\(');
const G04_METHOD = new RegExp ('^(\\s*)this\\.(' + G04_FIELD + ')\\.(Store|Delete|Load)\\(');
const G04_LOAD = new RegExp ('^(\\s*)(\\w+), (\\w+) (:=|=) this\\.(' + G04_FIELD + ')\\.Load\\(');
const G04_STATEMENT = new RegExp ('^(\\s*)(?:ccxt\\.)?(AddElementToObject|Remove)\\(this\\.(' + G04_FIELD + '), ');
const G04_KEYS_DECL = new RegExp ('^(\\s*)var (\\w+) (\\[\\]string|\\[\\]any) = (?:ccxt\\.)?ObjectKeys\\(this\\.(' + G04_FIELD + ')\\)\\s*$');
const G04_KEYS_ASSIGN = new RegExp ('^(\\s*)(\\w+) = (?:ccxt\\.)?ObjectKeys\\(this\\.(' + G04_FIELD + ')\\)\\s*$');
const G04_KEYS_RETURN = new RegExp ('^(\\s*)return (?:ccxt\\.)?ObjectKeys\\(this\\.(' + G04_FIELD + ')\\)\\s*$');
const G04_GETVALUE = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(\\s*this\\.(' + G04_FIELD + ')\\s*,\\s*([^(),]+?)\\s*\\)', 'g');

type G04Decl = { 'type': string, 'line': number };

type G04Span = { 's': number, 'e': number };

// `func (this *X) Name(a *string, b any)` -> [['a','*string'], ...] for the parameters only
function g04Params (signature: string): Array<[ string, string ]> {
    const out: Array<[ string, string ]> = [];
    const open = signature.indexOf ('(', signature.indexOf (')') + 1);
    if (open < 0) {
        return out;
    }
    const close = goChanClose (signature, open);
    if (close < 0) {
        return out;
    }
    let lastType: string | undefined;
    for (const span of g04Split (signature, open, close)) {
        const part = signature.substring (span.s, span.e).trim ();
        if (part === '') {
            continue;
        }
        const tokens = part.split (/\s+/);
        if (tokens.length >= 2) {
            lastType = tokens.slice (1).join (' ').replace (/^\.\.\./, '');
            out.push ([ tokens[0], lastType ]);
        } else if (lastType !== undefined) {
            out.push ([ part, lastType ]); // grouped names: `a, b string`
        }
    }
    return out;
}

// top-level comma split of masked (open, close)
function g04Split (masked: string, open: number, close: number): G04Span[] {
    const spans: G04Span[] = [];
    let depth = 0;
    let s = open + 1;
    for (let i = open + 1; i < close - 1; i++) {
        const c = masked[i];
        if ('({['.indexOf (c) >= 0) {
            depth++;
        } else if (')}]'.indexOf (c) >= 0) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            spans.push ({ 's': s, 'e': i });
            s = i + 1;
        }
    }
    spans.push ({ 's': s, 'e': close - 1 });
    return spans;
}

// every name the function declares, with the line it is declared on; a name declared twice never
// carries a proven type
function g04Decls (body: string[], signature: string): Map<string, G04Decl> {
    const decls = new Map<string, G04Decl> ();
    const add = (name: string, type: string, line: number) => {
        const seen = decls.get (name);
        if (seen === undefined) {
            decls.set (name, { 'type': type, 'line': line });
        } else {
            seen.type = '?';
        }
    };
    for (const [ name, type ] of g04Params (signature)) {
        add (name, type, 0);
    }
    body.forEach ((line, index) => {
        const declaration = /^\s*var (\w+) ([^=\n]+?) = /.exec (line);
        if (declaration !== null) {
            add (declaration[1], declaration[2].trim (), index);
        }
    });
    return decls;
}

// the key as a Go string expression, or undefined when the site cannot prove one: a nil `*string`
// key answers nil/false from GetValue/InOp, which `m[*k]` cannot express
function g04Key (decls: Map<string, G04Decl>, key: string, siteLine: number): string | undefined {
    const text = key.trim ();
    if (text.startsWith ('"')) {
        return text;
    }
    const indexed = /^(\w+)\[.+\]$/.exec (text);
    if (indexed !== null) {
        // an element of a proven []string is a Go string key
        const base = decls.get (indexed[1]);
        return ((base === undefined) || (base.type !== '[]string') || (base.line >= siteLine)) ? undefined : text;
    }
    if (!/^\w+$/.test (text)) {
        return undefined;
    }
    const decl = decls.get (text);
    if ((decl === undefined) || (decl.type !== 'string') || (decl.line >= siteLine)) {
        return undefined;
    }
    return text;
}

// a value the helper derefed on read/write, so the native form has to answer the same
function g04Pointer (value: string, decls: Map<string, G04Decl>, siteLine: number): boolean {
    const text = value.trim ();
    if (G04_PTR_CALL.test (text)) {
        return true;
    }
    if (!/^\w+$/.test (text)) {
        return false;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && decl.type.startsWith ('*') && (decl.line < siteLine);
}

function g04MapExpr (value: string, decls: Map<string, G04Decl>, siteLine: number): boolean {
    const text = value.trim ();
    if (G04_MAP_EXPR.test (text)) {
        return true;
    }
    if (!/^\w+$/.test (text)) {
        return false;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && (decl.type === 'map[string]any') && (decl.line < siteLine);
}

function g04PlainValue (value: string, decls: Map<string, G04Decl>, siteLine: number): boolean {
    const text = value.trim ();
    if (G04_PLAIN_VALUE.test (text)) {
        return true;
    }
    if (!/^\w+$/.test (text)) {
        return false;
    }
    const decl = decls.get (text);
    return (decl !== undefined) && !decl.type.startsWith ('*') && /^(?:map\[|\[\]|ccxt\.(?:ArrayCache|OrderBook))/.test (decl.type) && (decl.line < siteLine);
}

// the args of the call whose '(' is at `open`, as unmasked text
function g04Args (line: string, maskedLine: string, open: number, close: number): string[] {
    return g04Split (maskedLine, open, close).map (a => line.substring (a.s, a.e).trim ());
}

function g04StatementEnd (maskedLine: string, close: number): boolean {
    return /^\s*$/.test (maskedLine.substring (close));
}

// `if InOp(this.F, k) {` -> `if _, ok := this.F[k]; ok {`
function g04InOp (line: string, maskedLine: string, decls: Map<string, G04Decl>, siteLine: number, hasOk: boolean): string | undefined {
    if (hasOk) {
        return undefined; // the function already uses `ok`: never shadow it
    }
    const cond = /^(\s*(?:\} else )?if )([^;{}]*) \{$/.exec (maskedLine);
    if (cond === null) {
        return undefined;
    }
    const calls = [ ...maskedLine.matchAll (/(?<![\w.])(?:ccxt\.)?InOp\(/g) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const at = calls[0].index;
    const open = at + maskedLine.substring (at).indexOf ('(');
    const close = goChanClose (maskedLine, open);
    if (close < 0) {
        return undefined;
    }
    const args = g04Args (line, maskedLine, open, close);
    if ((args.length !== 2) || !G04_RECEIVER.test (args[0])) {
        return undefined;
    }
    const key = g04Key (decls, args[1], siteLine);
    if (key === undefined) {
        return undefined;
    }
    const before = line.substring (cond[1].length, at);
    const after = line.substring (close);
    const rest = (before + 'ok' + after).replace (/(^|[^\w)\]])\(ok\)/g, '$1ok');
    return cond[1] + '_, ok := ' + args[0] + '[' + key + ']; ' + rest;
}

// `ObjectKeys(this.F)` -> a range loop over the map: a `[]string` declaration, an assignment to a
// plain slice or to an `any` box, and `return ObjectKeys(this.F)`
function g04LoopVar (name: string, maskedLine: string, counter: number): string | undefined {
    const loopVar = 'k' + ((counter === 0) ? '' : String (counter));
    return ((loopVar === name) || new RegExp ('\\b' + loopVar + '\\b').test (maskedLine)) ? undefined : loopVar;
}

function g04ObjectKeys (maskedLine: string, decls: Map<string, G04Decl>, siteLine: number, counter: number): string[] | undefined {
    const declaration = G04_KEYS_DECL.exec (maskedLine);
    if (declaration !== null) {
        const loopVar = g04LoopVar (declaration[2], maskedLine, counter);
        if (loopVar === undefined) {
            return undefined;
        }
        const name = declaration[2];
        return [
            declaration[1] + 'var ' + name + ' ' + declaration[3] + ' = nil',
            declaration[1] + 'for ' + loopVar + ' := range this.' + declaration[4] + ' {',
            declaration[1] + '\t' + name + ' = append(' + name + ', ' + loopVar + ')',
            declaration[1] + '}',
        ];
    }
    const assignment = G04_KEYS_ASSIGN.exec (maskedLine);
    if (assignment !== null) {
        const name = assignment[2];
        const loopVar = g04LoopVar (name, maskedLine, counter);
        if (loopVar === undefined) {
            return undefined;
        }
        const decl = decls.get (name);
        if ((decl !== undefined) && ((decl.type === '[]string') || (decl.type === '[]any')) && (decl.line < siteLine)) {
            return [
                assignment[1] + name + ' = nil',
                assignment[1] + 'for ' + loopVar + ' := range this.' + assignment[3] + ' {',
                assignment[1] + '\t' + name + ' = append(' + name + ', ' + loopVar + ')',
                assignment[1] + '}',
            ];
        }
        // an `any` target: the []string ObjectKeys answers goes through a fresh holder
        const temp = 'g04Keys' + ((counter === 0) ? '' : String (counter));
        return [
            assignment[1] + 'var ' + temp + ' []string = nil',
            assignment[1] + 'for ' + loopVar + ' := range this.' + assignment[3] + ' {',
            assignment[1] + '\t' + temp + ' = append(' + temp + ', ' + loopVar + ')',
            assignment[1] + '}',
            assignment[1] + name + ' = ' + temp,
        ];
    }
    const ret = G04_KEYS_RETURN.exec (maskedLine);
    if (ret !== null) {
        const temp = 'g04Keys' + ((counter === 0) ? '' : String (counter));
        const loopVar = g04LoopVar (temp, maskedLine, counter);
        if (loopVar === undefined) {
            return undefined;
        }
        return [
            ret[1] + 'var ' + temp + ' []string = nil',
            ret[1] + 'for ' + loopVar + ' := range this.' + ret[2] + ' {',
            ret[1] + '\t' + temp + ' = append(' + temp + ', ' + loopVar + ')',
            ret[1] + '}',
            ret[1] + 'return ' + temp,
        ];
    }
    return undefined;
}

function g04Line (prefix: string, body: string[], maskedBody: string[], decls: Map<string, G04Decl>, index: number, hasOk: boolean, counter: number): string[] | undefined {
    const line = body[index];
    const maskedLine = goChanMask (line);
    const indent = /^(\s*)/.exec (line)?.[1] ?? '';
    // this.F = this.CreateSafeDictionary()
    const init = G04_INIT.exec (maskedLine);
    if (init !== null) {
        return [ indent + 'this.' + init[2] + ' = map[string]any{}' ];
    }
    // this.F = this.MapToSafeMap(x) / this.F = this.IndexBySafe(a, k)
    const assign = G04_ASSIGN.exec (maskedLine);
    if (assign !== null) {
        const open = maskedLine.indexOf ('(', assign.index);
        const close = goChanClose (maskedLine, open);
        if ((close < 0) || !g04StatementEnd (maskedLine, close)) {
            return undefined;
        }
        const inner = line.substring (open + 1, close - 1).trim ();
        const receiver = 'this.' + assign[2];
        if (assign[3] === 'IndexBySafe') {
            return [ indent + receiver + ' = this.IndexBy(' + inner + ')' ];
        }
        if (g04MapExpr (inner, decls, index)) {
            return [ indent + receiver + ' = ' + inner ];
        }
        return [ indent + receiver + ' = ' + prefix + 'MapTyped(' + inner + ')' ];
    }
    // `v, ok := this.F.Load(k)` / `v, ok = this.F.Load(k)`
    const load = G04_LOAD.exec (maskedLine);
    if (load !== null) {
        const open = maskedLine.indexOf ('(', load.index);
        const close = goChanClose (maskedLine, open);
        const args = ((close < 0) || !g04StatementEnd (maskedLine, close)) ? [] : g04Args (line, maskedLine, open, close);
        const key = g04Key (decls, args[0] ?? '', index);
        const receiver = 'this.' + load[5];
        if ((args.length === 1) && (key !== undefined)) {
            return [ indent + load[2] + ', ' + load[3] + ' ' + load[4] + ' ' + receiver + '[' + key + ']' ];
        }
        // an unproven key: `.Load` is not a map method, so the boxed read/write keeps the helpers
        return [
            indent + load[2] + ' ' + load[4] + ' ' + prefix + 'GetValue(' + receiver + ', ' + (args[0] ?? 'nil') + ')',
            indent + load[3] + ' ' + load[4] + ' ' + prefix + 'InOp(' + receiver + ', ' + (args[0] ?? 'nil') + ')',
        ];
    }
    // this.F.Store(k, v) / this.F.Delete(k) / `v, ok := this.F.Load(k)`
    const method = G04_METHOD.exec (maskedLine);
    if (method !== null) {
        const open = method[0].length - 1;
        const close = goChanClose (maskedLine, open);
        if (close < 0) {
            return undefined;
        }
        const receiver = 'this.' + method[2];
        const args = g04Args (line, maskedLine, open, close);
        if (!g04StatementEnd (maskedLine, close)) {
            return undefined;
        }
        const key = g04Key (decls, args[0] ?? '', index);
        if (method[3] === 'Delete') {
            if (args.length !== 1) {
                return undefined;
            }
            return (key === undefined) ? [ indent + prefix + 'Remove(' + receiver + ', ' + args[0] + ')' ] : [ indent + 'delete(' + receiver + ', ' + key + ')' ];
        }
        if ((args.length !== 2) || (args[1] === '')) {
            return undefined;
        }
        if (key === undefined) {
            return [ indent + prefix + 'AddElementToObject(' + receiver + ', ' + args[0] + ', ' + args[1] + ')' ];
        }
        const value = g04Pointer (args[1], decls, index) ? (prefix + 'DerefScalar(' + args[1] + ')') : args[1];
        return [ indent + receiver + '[' + key + '] = ' + value ];
    }
    // AddElementToObject(this.F, k, v) / Remove(this.F, k) statements
    const statement = G04_STATEMENT.exec (maskedLine);
    if (statement !== null) {
        const open = maskedLine.indexOf ('(', statement.index);
        const close = goChanClose (maskedLine, open);
        if ((close < 0) || !g04StatementEnd (maskedLine, close)) {
            return undefined;
        }
        const receiver = 'this.' + statement[3];
        const args = g04Args (line, maskedLine, open, close);
        const key = g04Key (decls, args[1] ?? '', index);
        if (key === undefined) {
            return undefined;
        }
        if (statement[2] === 'Remove') {
            return (args.length === 2) ? [ indent + 'delete(' + receiver + ', ' + key + ')' ] : undefined;
        }
        if ((args.length !== 3) || !g04PlainValue (args[2] ?? '', decls, index)) {
            return undefined;
        }
        return [ indent + receiver + '[' + key + '] = ' + args[2] ];
    }
    // ObjectKeys(this.F)
    const keys = g04ObjectKeys (maskedLine, decls, index, counter);
    if (keys !== undefined) {
        return keys;
    }
    // InOp(this.F, k) as the only membership test of an if condition
    const inop = g04InOp (line, maskedLine, decls, index, hasOk);
    if (inop !== undefined) {
        return [ inop ];
    }
    // GetValue(this.F, k) anywhere in an expression
    let out = line;
    let changed = false;
    G04_GETVALUE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = G04_GETVALUE.exec (out)) !== null) {
        const at = m.index;
        if (goChanMask (out).slice (at, at + m[0].length).indexOf ('GetValue(') < 0) {
            G04_GETVALUE.lastIndex = at + 1;
            continue; // inside a comment or a string literal
        }
        const key = g04Key (decls, m[2], index);
        if (key === undefined) {
            G04_GETVALUE.lastIndex = at + 1;
            continue;
        }
        out = out.substring (0, at) + 'this.' + m[1] + '[' + key + ']' + out.substring (at + m[0].length);
        G04_GETVALUE.lastIndex = at + 1;
        changed = true;
    }
    return changed ? [ out ] : undefined;
}

export function hx10OG02MarketsNative (content: string): string {
    if (!G04_ANY.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const prefix = /^package\s+ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    const out: string[] = [];
    let k = 0;
    while (k < lines.length) {
        if (!lines[k].startsWith ('func (this *')) {
            out.push (lines[k]);
            k++;
            continue;
        }
        let end = k;
        while ((end < lines.length) && (lines[end] !== '}')) {
            end++;
        }
        const body = lines.slice (k, end + 1);
        const maskedBody = masked.slice (k, end + 1);
        const decls = g04Decls (body, body[0]);
        const hasOk = /\bok\b/.test (maskedBody.join ('\n'));
        out.push (body[0]);
        let counter = 0;
        for (let i = 1; i < body.length; i++) {
            const rewritten = g04Line (prefix, body, maskedBody, decls, i, hasOk, counter);
            if (rewritten === undefined) {
                out.push (body[i]);
                continue;
            }
            counter++;
            out.push (...rewritten);
            if (rewritten.length === 1) {
                body[i] = rewritten[0];
                maskedBody[i] = goChanMask (rewritten[0]);
            }
        }
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx10OG02MarketsCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 wave-4 OG02: ' + message); } };
    const head = 'package ccxt\n\n';
    const fn = (body: string, sig = '') => head + 'func (this *X) F(' + sig + ') any {\n' + body + '\treturn nil\n}\n';
    const at = (body: string, sig = '') => hx10OG02MarketsNative (fn (body, sig));
    try {
        ok (at ('\tthis.Markets_by_id.Store("a", 1)\n').includes ('\tthis.Markets_by_id["a"] = 1\n'), 'literal Store goes native');
        ok (at ('\tvar id string = "a"\n\tthis.Markets_by_id.Store(id, []any{1})\n').includes ('\tthis.Markets_by_id[id] = []any{1}\n'), 'string-local Store goes native');
        ok (at ('\tthis.Markets_by_id.Store(id, 1)\n', 'id any').includes ('AddElementToObject(this.Markets_by_id, id, 1)'), 'any-key Store keeps a helper');
        ok (at ('\tthis.Markets.Delete("a")\n').includes ('\tdelete(this.Markets, "a")\n'), 'Delete goes native');
        ok (at ('\tthis.Markets.Delete(k)\n', 'k *string').includes ('Remove(this.Markets, k)'), '*string-key Delete keeps a helper');
        ok (at ('\tvar v any = nil\n\tvar ok bool = false\n\tv, ok = this.Markets.Load("a")\n\t_ = ok\n').includes ('v, ok = this.Markets["a"]'), 'Load goes native');
        ok (at ('\tvar r any = GetValue(this.Currencies, "a")\n\treturn r\n').includes ('var r any = this.Currencies["a"]'), 'literal GetValue read goes native');
        ok (at ('\tvar c string = "a"\n\tvar r any = GetValue(this.Currencies, c)\n\treturn r\n').includes ('this.Currencies[c]'), 'string-local GetValue read goes native');
        ok (at ('\tvar r any = GetValue(this.Currencies, c)\n\treturn r\n', 'c *string').includes ('GetValue(this.Currencies, c)'), '*string-key read keeps GetValue');
        ok (at ('\tif InOp(this.Markets, "a") {\n\t}\n').includes ('\tif _, ok := this.Markets["a"]; ok {\n'), 'literal InOp goes native');
        ok (at ('\tif !(InOp(this.Markets_by_id, "a")) {\n\t}\n').includes ('\tif _, ok := this.Markets_by_id["a"]; !ok {\n'), 'negated InOp goes native');
        ok (at ('\tvar s string = "a"\n\tif (this.Markets != nil) && (InOp(this.Markets, s)) {\n\t}\n').includes ('\tif _, ok := this.Markets[s]; (this.Markets != nil) && ok {\n'), 'compound InOp goes native');
        ok (at ('\tif InOp(this.Markets, s) {\n\t}\n', 's *string').includes ('InOp(this.Markets, s)'), '*string-key InOp keeps the helper');
        ok (at ('\tvar keys []string = nil\n\tfor i := 0; i < len(keys); i++ {\n\t\tvar v any = GetValue(this.Markets, keys[i])\n\t\t_ = v\n\t}\n').includes ('var v any = this.Markets[keys[i]]'), 'a []string element is a proven key');
        ok (at ('\tif ok && InOp(this.Markets, "a") {\n\t}\n', 'ok bool').includes ('InOp(this.Markets, "a")'), 'a function already using `ok` keeps InOp');
        ok (at ('\tAddElementToObject(this.Markets, "a", map[string]any{})\n').includes ('\tthis.Markets["a"] = map[string]any{}\n'), 'AddElementToObject statement goes native');
        ok (at ('\tvar v any = nil\n\tAddElementToObject(this.Markets, "a", v)\n').includes ('AddElementToObject(this.Markets, "a", v)'), 'boxed write value keeps AddElementToObject');
        ok (at ('\tRemove(this.Markets, "a")\n').includes ('\tdelete(this.Markets, "a")\n'), 'Remove goes native');
        ok (at ('\tthis.Markets = this.CreateSafeDictionary()\n').includes ('\tthis.Markets = map[string]any{}\n'), 'CreateSafeDictionary init prints a map literal');
        ok (at ('\tthis.Markets = this.MapToSafeMap(this.IndexBy(values, "symbol"))\n', 'values any').includes ('\tthis.Markets = this.IndexBy(values, "symbol")\n'), 'MapToSafeMap of a proven map drops the round-trip');
        ok (at ('\tthis.Markets = this.MapToSafeMap(x)\n', 'x any').includes ('this.Markets = MapTyped(x)'), 'MapToSafeMap of an unproven box reads through MapTyped');
        ok (at ('\tthis.Currencies_by_id = this.IndexBySafe(this.Currencies, "id")\n').includes ('\tthis.Currencies_by_id = this.IndexBy(this.Currencies, "id")\n'), 'IndexBySafe becomes IndexBy');
        ok (at ('\tvar keys []string = ObjectKeys(this.Currencies)\n\treturn keys\n').includes ('\tvar keys []string = nil\n\tfor k := range this.Currencies {\n\t\tkeys = append(keys, k)\n\t}\n'), 'ObjectKeys declaration becomes a range loop');
        ok (at ('\tvar keys []any = nil\n\tkeys = ccxt.ObjectKeys(this.Markets)\n\treturn keys\n').includes ('\tkeys = nil\n\tfor k := range this.Markets {\n\t\tkeys = append(keys, k)\n\t}\n'), 'ObjectKeys assignment becomes a range loop');
        ok (hx10OG02MarketsNative ('package ccxtpro\n\nfunc (this *K) F() any {\n\treturn ccxt.GetValue(this.Currencies, "a")\n}\n').includes ('return this.Currencies["a"]'), 'ccxt-prefixed read');
        ok (hx10OG02MarketsNative ('package ccxtpro\n\nfunc (this *K) F() {\n\tthis.Markets.Store("a", 1)\n}\n').includes ('\tthis.Markets["a"] = 1\n'), 'ccxt-prefixed store');
        for (const keep of [
            fn ('\tvar r any = GetValue(this.Balance, "a")\n\treturn r\n'),
            fn ('\tif InOp(this.Features, "a") {\n\t}\n'),
            fn ('\treturn GetValue(this.MarketsById, "a")\n'),
            head + 'func (this *X) F() {\n\t// this.Markets.Store("a", 1)\n}\n',
            head + 'func (this *X) F() string {\n\treturn "this.Markets.Store(\\"a\\", 1)"\n}\n',
            head + 'func F() any {\n\treturn GetValue(this.Markets, "a")\n}\n',
        ]) {
            ok (hx10OG02MarketsNative (keep) === keep, 'keeps its text: ' + keep);
        }
        const once = at ('\tthis.Markets_by_id.Store("a", 1)\n\tvar r any = GetValue(this.Currencies, "a")\n\tvar keys []string = ObjectKeys(this.Currencies)\n\treturn r\n');
        ok (hx10OG02MarketsNative (once) === once, 'idempotent');
    } catch (e: any) {
        problems.push ('hx10 wave-4 OG02 threw: ' + e.message);
    }
    return problems;
}

// ------------------------------------------------------------------------------------
// OG02: the market/currency tables are published immutably
// ------------------------------------------------------------------------------------
// go/v4/exchange_markets_book.go owns the four tables: one atomic book snapshot,
// accessors that read it (Markets(), Markets_by_id(), Currencies(), Currencies_by_id())
// and publish / copy-on-write writers. Generated code reads through the accessor and
// never assigns a table in place, so no published map is mutated by a caller. The
// native map ops the pass above emits keep working: the accessor answers a plain map.
type Og02Table = { read: string, publish: string, add: string, remove: string };

const OG02_TABLES: Og02Table[] = [
    { read: 'Markets_by_id', publish: 'PublishMarketsById', add: 'AddMarketsByIdEntry', remove: 'RemoveMarketsByIdEntry' },
    { read: 'Markets', publish: 'PublishMarkets', add: 'AddMarketsEntry', remove: 'RemoveMarketsEntry' },
    { read: 'Currencies_by_id', publish: 'PublishCurrenciesById', add: '', remove: '' },
    { read: 'Currencies', publish: 'PublishCurrencies', add: '', remove: '' },
];

const OG02_READ = new RegExp ('\\b(?:this|sourceExchange|exchange[0-9]*)\\.(' + OG02_TABLES.map (t => t.read).join ('|') + ')\\b(?!\\s*\\()', 'g');

function og02Find (name: string): Og02Table | undefined {
    return OG02_TABLES.find (t => t.read === name);
}

// `this.T = X` -> `this.PublishT (X)`: the table itself is never assigned
function og02CommentAt (line: string, masked: string): number {
    // the mask blanks comments, so a `//` that is spaced out in the mask starts one
    for (let i = 0; i < line.length - 1; i++) {
        if ((line[i] === '/') && (line[i + 1] === '/') && (masked[i] === ' ')) {
            return i;
        }
    }
    return -1;
}

function og02SplitComment (line: string, masked: string): [ string, string ] {
    const at = og02CommentAt (line, masked);
    return ((at < 0) ? [ line, '' ] : [ line.substring (0, at), ' ' + line.substring (at).trim () ]);
}

// `this.T = X` -> `this.PublishT (X)`: the table itself is never assigned
function og02Assign (line: string, masked: string): string | undefined {
    const [ code, tail ] = og02SplitComment (line, masked);
    const m = /^(\s*)(this|exchange[0-9]*)\.(\w+) = (.*)$/.exec (code);
    if (m === null) {
        return undefined;
    }
    const table = og02Find (m[3]);
    if (table === undefined) {
        return undefined;
    }
    let value = m[4].trim ();
    if (/^this\.CreateSafeDictionary\s*\(\s*(?:true|false)?\s*\)$/.test (value)) {
        value = 'map[string]any{}';
    }
    value = value.replace (/^sourceExchange\.(Markets_by_id|Markets|Currencies_by_id|Currencies)$/, 'sourceExchange.$1()');
    return m[1] + m[2] + '.' + table.publish + '(' + value + ')' + tail;
}

// a trailing comment stays where it was instead of landing inside the argument list
function og02Add (line: string, masked: string): string | undefined {
    const [ code, tail ] = og02SplitComment (line, masked);
    const rewritten = og02AddCode (code);
    return (rewritten === undefined) ? undefined : rewritten + tail;
}

// `AddElementToObject (this.T, k, v)` / `this.T.Store (k, v)` -> `this.AddTEntry (k, v)`
function og02AddCode (code: string): string | undefined {
    const call = /^(\s*)(?:ccxt\.)?AddElementToObject\s*\(\s*this\.(\w+)(?:\(\))?\s*,\s*(.*)\)\s*$/.exec (code);
    if (call !== null) {
        const table = og02Find (call[2]);
        return ((table === undefined) || (table.add === '')) ? undefined : call[1] + 'this.' + table.add + '(' + call[3] + ')';
    }
    const store = /^(\s*)this\.(\w+)\.Store\s*\(\s*(.*)\)\s*$/.exec (code);
    if (store !== null) {
        const table = og02Find (store[2]);
        return ((table === undefined) || (table.add === '')) ? undefined : store[1] + 'this.' + table.add + '(' + store[3] + ')';
    }
    const remove = /^(\s*)this\.(\w+)\.Delete\s*\(\s*(.*)\)\s*$/.exec (code);
    if (remove !== null) {
        const table = og02Find (remove[2]);
        return ((table === undefined) || (table.remove === '')) ? undefined : remove[1] + 'this.' + table.remove + '(' + remove[3] + ')';
    }
    // `this.T()[k] = v` is an in-place write into the published table: copy instead
    const element = /^(\s*)this\.(\w+)(?:\(\))?\[(.+)\]\s*=\s*(.+)$/.exec (code);
    if (element !== null) {
        const table = og02Find (element[2]);
        return ((table === undefined) || (table.add === '')) ? undefined : element[1] + 'this.' + table.add + '(' + element[3] + ', ' + element[4] + ')';
    }
    const erased = /^(\s*)delete\s*\(\s*this\.(\w+)\(\)\[\s*(.+?)\s*\]\s*\)\s*$/.exec (code);
    if (erased !== null) {
        const table = og02Find (erased[2]);
        return ((table === undefined) || (table.remove === '')) ? undefined : erased[1] + 'this.' + table.remove + '(' + erased[3] + ')';
    }
    const dropped = /^(\s*)(?:ccxt\.)?Remove\s*\(\s*this\.(\w+)\s*,\s*(.*)\)\s*$/.exec (code);
    if (dropped !== null) {
        const table = og02Find (dropped[2]);
        return ((table === undefined) || (table.remove === '')) ? undefined : dropped[1] + 'this.' + table.remove + '(' + dropped[3] + ')';
    }
    return undefined;
}

// every remaining use is a read of the current snapshot
function og02Read (line: string, masked: string): string {
    // every use is a read of the current snapshot; collect first, then splice from the
    // end so an earlier replacement cannot shift a later match
    const hits: Array<[ number, number, string ]> = [];
    const rx = new RegExp (OG02_READ.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = rx.exec (line)) !== null) {
        const at = m.index;
        if (masked.substr (at, m[0].length).indexOf (m[1]) < 0) {
            continue; // inside a comment or a literal
        }
        const receiver = m[0].substring (0, m[0].indexOf ('.'));
        hits.push ([ at, m[0].length, receiver + '.' + m[1] + '()' ]);
    }
    let out = line;
    for (let i = hits.length - 1; i >= 0; i--) {
        const [ at, width, text ] = hits[i];
        out = out.substring (0, at) + text + out.substring (at + width);
    }
    return out;
}

export function hx10OG02Pass (content: string): string {
    const native = hx10OG02MarketsNative (content);
    if (OG02_TABLES.every (t => native.indexOf (t.read) < 0)) {
        return native;
    }
    const lines = native.split ('\n');
    const masked = goChanMask (native).split ('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const mask = (i < masked.length) ? masked[i] : '';
        if (mask.trim ().startsWith ('//')) {
            out.push (line);
            continue;
        }
        let rewritten = line;
        const assigned = og02Assign (rewritten, goChanMask (rewritten));
        if (assigned !== undefined) {
            rewritten = assigned;
        } else {
            const added = og02Add (rewritten, goChanMask (rewritten));
            if (added !== undefined) {
                rewritten = added;
            }
        }
        // a write can sit next to reads on the same line, so the read rule runs again
        out.push (og02Read (rewritten, goChanMask (rewritten)));
    }
    return og02Aliases (out).join ('\n');
}

export function hx10OG02Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 wave-4 OG02: ' + message); } };
    const head = 'package ccxt\n\n';
    const fn = (body: string) => head + 'func (this *X) F() any {\n' + body + '\treturn nil\n}\n';
    const at = (body: string) => hx10OG02Pass (fn (body));
    try {
        ok (at ('\tif this.Markets == nil {\n\t}\n').includes ('if this.Markets() == nil {'), 'a nil test reads the snapshot');
        ok (at ('\tif this.Markets_by_id == nil {\n\t}\n').includes ('if this.Markets_by_id() == nil {'), 'the id table reads the snapshot');
        ok (at ('\tthis.Markets = this.CreateSafeDictionary()\n').includes ('this.PublishMarkets(map[string]any{})'), 'a reset publishes an empty table');
        ok (at ('\tthis.Markets = sourceExchange.Markets\n').includes ('this.PublishMarkets(sourceExchange.Markets())'), 'a shared table is copied by the publisher');
        ok (at ('\tthis.Markets = nil\n').includes ('this.PublishMarkets(nil)'), 'a nil assignment publishes nil');
        ok (at ('\tccxt.AddElementToObject(this.Markets, handle, m)\n').includes ('this.AddMarketsEntry(handle, m)'), 'an entry add copies and publishes');
        ok (at ('\tthis.Markets_by_id.Store(additionalId, []any{market})\n').includes ('this.AddMarketsByIdEntry(additionalId, []any{market})'), 'an id entry add copies and publishes');
        ok (at ('\tfor k := range this.Currencies {\n\t}\n').includes ('for k := range this.Currencies() {'), 'a range reads the snapshot');
        const aliased = at ('\tvar markets any = this.Markets()\n\tAddElementToObject(markets, symbol, this.DeepExtend(GetValue(markets, symbol), response))\n\t_ = markets\n');
        ok ((aliased.indexOf ('var markets any') < 0) && (aliased.indexOf ('this.AddMarketsEntry(symbol,') >= 0), 'a written alias publishes instead of mutating the snapshot');
        ok (at ('\tthis.Markets_by_id()[additionalId] = []any{market}\n').includes ('this.AddMarketsByIdEntry(additionalId, []any{market})'), 'an element write copies and publishes');
        const literal = at ('\tpanic(ExchangeError(this.Id + " markets not loaded"))\n');
        ok (literal.indexOf ('" markets not loaded"') >= 0, 'a literal keeps its text');
        ok (at ('\tvar keys []string = nil\n\tfor k := range this.Markets() {\n\t\tkeys = append(keys, k)\n\t}\n') === at ('\tvar keys []string = nil\n\tfor k := range this.Markets() {\n\t\tkeys = append(keys, k)\n\t}\n'), 'idempotent');
        for (const keep of [
            fn ('\tif this.Balance == nil {\n\t}\n'),
            fn ('\tif this.Features == nil {\n\t}\n'),
            head + 'func (this *X) F() {\n\t// this.Markets = nil\n}\n',
            head + 'func (this *X) F() string {\n\treturn "this.Markets"\n}\n',
        ]) {
            ok (hx10OG02Pass (keep) === keep, 'keeps its text: ' + keep);
        }
    } catch (e: any) {
        problems.push ('hx10 wave-4 OG02 threw: ' + e.message);
    }
    return problems;
}

// A local that aliases a table and is then written cannot stay an alias: the writer
// copies the table, so the local would go stale. Rewrite its uses to the accessor and
// drop the declaration, which is unused afterwards.
function og02Aliases (lines: string[]): string[] {
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
        const decl = /^\s*var (\w+) (?:any|map\[string\]any) = this\.(\w+)\(\)\s*$/.exec (lines[i]);
        const table = (decl === null) ? undefined : og02Find (decl[2]);
        if ((decl === null) || (table === undefined)) {
            out.push (lines[i]);
            i++;
            continue;
        }
        let end = i;
        while ((end < lines.length) && (lines[end] !== '}')) {
            end++;
        }
        const name = decl[1];
        const written = lines.slice (i + 1, end).some (line => new RegExp ('(?:AddElementToObject|Remove)\\s*\\(\\s*' + name + '\\s*[,)]').test (line) || new RegExp ('(?<![A-Za-z0-9_.])' + name + '\\[[^\\]]*\\]\\s*=').test (line));
        if (!written) {
            out.push (lines[i]);
            i++;
            continue;
        }
        i++;
        for (; i < end; i++) {
            let line = lines[i];
            const mask = goChanMask (line);
            if (!line.trim ().startsWith ('//')) {
                const word = new RegExp ('(?<![A-Za-z0-9_.])' + name + '(?![A-Za-z0-9_(])', 'g');
                let m: RegExpExecArray | null;
                let rebuilt = '';
                let last = 0;
                while ((m = word.exec (line)) !== null) {
                    rebuilt += line.substring (last, m.index);
                    rebuilt += (mask.substr (m.index, m[0].length) === name) ? 'this.' + table.read + '()' : m[0];
                    last = m.index + m[0].length;
                }
                rebuilt += line.substring (last);
                line = rebuilt;
            }
            const asAdd = og02Add (line, goChanMask (line));
            out.push ((asAdd === undefined) ? line : asAdd);
        }
    }
    return out;
}
