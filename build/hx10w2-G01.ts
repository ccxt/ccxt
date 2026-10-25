// hx10w2-G01: `GetValue(m, k)` -> `m[k]` on a receiver printed `map[string]any`, key printed `string`.
// Two proofs, no cast: (A) the read is an argument a runtime helper derefScalar()s, so GetValue's own
// unwrap is redundant; (B) every value stored in the map is pointer-free, so the index reads exactly
// what GetValue returns. Every other site keeps the helper call.

const G01_MAP = 'map[string]any';

// helpers whose body derefScalar()s the argument before reading it (go/v4/exchange_helpers.go), so
// GetValue's own unwrap is redundant at that argument
const G01_DEREF_FIRST = new Set ([
    'IsArray', 'IsString', 'IsDictionary', 'IsFunction', 'IsBool', 'IsInt', 'IsInteger', 'IsNumber',
    'IsObject', 'IsNil', 'EvalTruthy', 'ToString', 'ParseInt', 'ParseFloat', 'GetIndexOf', 'ToLower',
    'ToUpper', 'Trim', 'MathFloor', 'MathCeil', 'MathRound', 'MathAbs', 'JsonParse', 'ParseJSON',
    'ObjectKeys', 'ObjectValues', 'GetArrayLength', 'GetLength', 'MapTyped', 'ListTyped', 'MapOrEmpty',
    'SafeStringPtr', 'SafeBoolPtr', 'NumberToString', 'JSONStringify', 'JsonStringify', 'ToInt64',
    'ToFloat64', 'SafeMapTyped', 'SafeListTyped', 'Int64Arg', 'DerefScalar', 'Shift', 'Reverse',
    'Increment', 'Decrement', 'Negate', 'UnaryPlus', 'SafeString', 'SafeString2', 'SafeInteger',
    'SafeInteger2', 'SafeNumber', 'SafeBool', 'SafeValue', 'SafeDict', 'SafeList',
]);

// helpers that derefScalar() both operands
const G01_DEREF_PAIR = new Set ([
    'IsEqual', 'InOp', 'Add', 'Subtract', 'Multiply', 'Divide', 'Mod', 'IsLessThan', 'IsGreaterThan',
    'IsLessThanOrEqual', 'IsGreaterThanOrEqual', 'IndexOf', 'StartsWith', 'EndsWith', 'Contains',
    'Join', 'Split', 'SafeValueN',
]);

// helpers that derefScalar() an argument other than the first two
const G01_DEREF_EXTRA = new Map<string, number[]> ([
    [ 'AddElementToObject', [ 1, 2 ] ],
    [ 'Slice', [ 0, 1, 2 ] ],
    [ 'Replace', [ 0 ] ],
    [ 'Ternary', [ 1, 2 ] ],
]);

// base fields whose Go declaration is `map[string]any` (go/v4/exchange.go)
const G01_FIELD_MAPS = new Set ([ 'this.Has', 'this.Features' ]);

function g01DerefsArg (callee: string, index: number): boolean {
    const extra = G01_DEREF_EXTRA.get (callee);
    if (extra !== undefined) {
        return extra.includes (index);
    }
    if (callee === 'GetValue') {
        return index < 2;
    }
    if (G01_DEREF_PAIR.has (callee)) {
        return index < 2;
    }
    return G01_DEREF_FIRST.has (callee) && (index === 0);
}

// blanks string/rune/comment text, keeping quotes and every offset (structure survives)
function g01Mask (content: string): string {
    const out = content.split ('');
    let i = 0;
    while (i < content.length) {
        const c = content[i];
        if ((c === '"') || (c === '`') || (c === "'")) {
            const quote = c;
            i++;
            while ((i < content.length) && (content[i] !== quote)) {
                if ((content[i] === '\\') && (quote !== '`')) {
                    out[i] = ' ';
                    i++;
                }
                if ((i < content.length) && (content[i] !== '\n')) {
                    out[i] = ' ';
                }
                i++;
            }
            i++;
        } else if ((c === '/') && (content[i + 1] === '/')) {
            while ((i < content.length) && (content[i] !== '\n')) {
                out[i] = ' ';
                i++;
            }
        } else {
            i++;
        }
    }
    return out.join ('');
}

interface G01Span { start: number; end: number; }

function g01FuncSpans (lines: string[]): G01Span[] {
    const spans: G01Span[] = [];
    let open = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            open = k;
        } else if ((open >= 0) && (lines[k] === '}')) {
            spans.push ({ start: open, end: k });
            open = -1;
        }
    }
    return spans;
}

// brace depth at the start of every line, and the lowest depth any line reaches inside itself
function g01Depths (masked: string[]): { start: number[]; low: number[] } {
    const start: number[] = [];
    const low: number[] = [];
    let depth = 0;
    for (const line of masked) {
        start.push (depth);
        let inner = depth;
        for (const ch of line) {
            if (ch === '{') {
                depth++;
            } else if (ch === '}') {
                depth--;
                inner = Math.min (inner, depth);
            }
        }
        low.push (inner);
    }
    return { start, low };
}

function g01ParamTypes (signature: string): Map<string, string> {
    const types = new Map<string, string> ();
    const body = signature.replace (/^func\s*\([^)]*\)\s*/, '');
    const list = /^[^(]*\(([^()]*)\)/.exec (body);
    if (list === null) {
        return types;
    }
    const pending: string[] = [];
    for (const part of list[1].split (',')) {
        const named = /^\s*([A-Za-z_]\w*)\s+(\.\.\.)?([\[\]\w*.]+)\s*$/.exec (part);
        if (named !== null) {
            const type = (named[2] ?? '') + named[3];
            for (const name of pending) {
                types.set (name, type);
            }
            pending.length = 0;
            types.set (named[1], type);
        } else if (/^\s*[A-Za-z_]\w*\s*$/.test (part)) {
            pending.push (part.trim ());
        }
    }
    return types;
}

interface G01Decl { index: number; type: string; init: string; }

function g01Declarations (lines: string[], masked: string[], span: G01Span, name: string): G01Decl[] {
    const decls: G01Decl[] = [];
    const rx = new RegExp ('^\\s*var\\s+' + name + '\\s+([\\[\\]\\w*.]+)\\s*=\\s*(.*)$');
    const short = new RegExp ('^\\s*' + name + '\\s*:=\\s*(.*)$');
    for (let k = span.start; k <= span.end; k++) {
        const d = rx.exec (masked[k]);
        if (d !== null) {
            decls.push ({ index: k, type: d[1], init: lines[k].substring (lines[k].length - d[2].length) });
            continue;
        }
        if (short.test (masked[k])) {
            decls.push ({ index: k, type: '', init: '' });
        }
    }
    return decls;
}

// the declaration a read at `at` resolves to: nearest earlier decl whose block is still open
function g01VisibleDecl (decls: G01Decl[], at: number, depths: { start: number[]; low: number[] }): G01Decl | undefined {
    let found: G01Decl | undefined = undefined;
    for (const decl of decls) {
        if (decl.index >= at) {
            continue;
        }
        const level = depths.start[decl.index];
        if (depths.start[at] < level) {
            continue;
        }
        let open = true;
        for (let k = decl.index + 1; (k < at) && open; k++) {
            if (depths.low[k] < level) {
                open = false;
            }
        }
        if (open) {
            found = decl;
        }
    }
    return found;
}

// the call that takes this read as its `index`-th argument, when the read fills that argument exactly
function g01EnclosingArg (line: string, at: number): { callee: string; index: number } | undefined {
    let depth = 0;
    let index = 0;
    for (let c = at - 1; c >= 0; c--) {
        const ch = line[c];
        if (ch === ')') {
            depth++;
        } else if (ch === '(') {
            if (depth === 0) {
                const callee = /((?:[A-Za-z_]\w*\.)*[A-Za-z_]\w*)\s*$/.exec (line.substring (0, c));
                if (callee === null) {
                    return undefined;
                }
                return { callee: callee[1].substring (callee[1].lastIndexOf ('.') + 1), index };
            }
            depth--;
        } else if ((ch === ',') && (depth === 0)) {
            index++;
        } else if (ch === '{') {
            return undefined;
        }
    }
    return undefined;
}

const G01_PLAIN_DECL = /^(?:map\[string\]any\{\}|nil)$/;
const G01_PLAIN_VALUE = /^(?:nil|true|false|"[^"\\]*"|\[\]any\{\}|map\[string\]any\{\}|-?\d+(?:\.\d+)?|(?:ccxt\.)?(?:GetValue|MapTyped|ObjectKeys|ToString)\()/;

// locals whose every stored value is pointer-free: nothing the map holds can be a typed pointer
function g01PlainMaps (lines: string[], masked: string[], span: G01Span): Set<string> {
    const plain = new Set<string> ();
    const decl = /^\s*var\s+([A-Za-z_]\w*)\s+map\[string\]any\s*=\s*(map\[string\]any\{\}|nil)\s*$/;
    for (let k = span.start; k <= span.end; k++) {
        const d = decl.exec (masked[k]);
        if (d === null) {
            continue;
        }
        const name = d[1];
        const word = new RegExp ('(?:^|[^\\w.])' + name + '\\b');
        const assign = new RegExp ('^\\s*' + name + '\\s*=\\s*(?:nil|map\\[string\\]any\\{\\})\\s*$');
        const element = new RegExp ('^\\s*' + name + '\\[[^\\]]+\\]\\s*=\\s*(.*)$');
        const added = new RegExp ('^\\s*(?:ccxt\\.)?AddElementToObject\\(' + name + ', [^,]+,\\s*(.*)\\)\\s*$');
        const read = new RegExp ('(?:GetValue|InOp|ObjectKeys|MapTyped|len)\\(\\s*(?:ccxt\\.)?' + name + '\\b');
        const returns = new RegExp ('^\\s*return\\s+' + name + '\\s*$');
        let ok = true;
        for (let j = span.start; (j <= span.end) && ok; j++) {
            if (!word.test (masked[j])) {
                continue;
            }
            if (decl.test (masked[j]) || assign.test (masked[j]) || returns.test (masked[j])) {
                continue;
            }
            if (read.test (masked[j])) {
                continue;
            }
            const e = element.exec (masked[j]);
            if (e !== null) {
                ok = G01_PLAIN_VALUE.test (e[1].trim ());
                continue;
            }
            const a = added.exec (masked[j]);
            if (a !== null) {
                ok = G01_PLAIN_VALUE.test (a[1].trim ());
                continue;
            }
            ok = false;
        }
        if (ok) {
            plain.add (name);
        }
    }
    return plain;
}

function g01KeepsBox (maskedFunc: string): boolean {
    return /\bgo\s+[A-Za-z_]/.test (maskedFunc)
        || /\bSpawn\(/.test (maskedFunc)
        || /\bDelay\(/.test (maskedFunc)
        || /^(?![^\n]*<-)[^\n]*\w+Async\(/m.test (maskedFunc);
}

export function hx10w2G01MapReads (content: string): string {
    if (!content.includes ('GetValue(') || !content.includes (G01_MAP)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = g01Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const depths = g01Depths (masked);
    const read = /(?<![\w.])(?:ccxt\.)?GetValue\(([A-Za-z_]\w*|this\.\w+), ("[^"\n]*"|[A-Za-z_]\w*)\)/g;
    for (const span of g01FuncSpans (lines)) {
        const maskedFunc = masked.slice (span.start, span.end + 1).join ('\n');
        const escaping = g01KeepsBox (maskedFunc);
        const params = g01ParamTypes (lines[span.start]);
        const plain = g01PlainMaps (lines, masked, span);
        const declCache = new Map<string, G01Decl[]> ();
        const typeOf = (name: string, at: number): string | undefined => {
            let decls = declCache.get (name);
            if (decls === undefined) {
                decls = g01Declarations (lines, masked, span, name);
                declCache.set (name, decls);
            }
            const decl = g01VisibleDecl (decls, at, depths);
            if (decl === undefined) {
                return params.get (name);
            }
            return (decl.type === '') ? undefined : decl.type;
        };
        for (let k = span.start + 1; k < span.end; k++) {
            const line = lines[k];
            if (!line.includes ('GetValue(')) {
                continue;
            }
            const hits: { start: number, end: number, receiver: string, key: string, keyAt: number }[] = [];
            for (const m of masked[k].matchAll (read)) {
                const start = m.index!;
                const end = start + m[0].length;
                const keyAt = start + m[0].lastIndexOf (m[2]);
                hits.push ({ start, end, receiver: m[1], key: m[2], keyAt });
            }
            for (let h = hits.length - 1; h >= 0; h--) {
                const hit = hits[h];
                const receiver = hit.receiver;
                const key = line.substring (hit.keyAt, hit.keyAt + hit.key.length);
                const receiverType = receiver.startsWith ('this.') ? (G01_FIELD_MAPS.has (receiver) ? G01_MAP : undefined) : typeOf (receiver, k);
                if ((receiverType !== G01_MAP) || escaping) {
                    continue;
                }
                const keyIsString = key.startsWith ('"') ? true : (typeOf (key, k) === 'string');
                if (!keyIsString) {
                    continue;
                }
                const after = masked[k].substring (hit.end).replace (/^\s+/, '');
                if (!/^(?:[,)]|$)/.test (after)) {
                    continue;
                }
                const call = g01EnclosingArg (masked[k], hit.start);
                const proven = ((call !== undefined) && g01DerefsArg (call.callee, call.index)) || plain.has (receiver);
                if (!proven) {
                    continue;
                }
                lines[k] = lines[k].substring (0, hit.start) + receiver + '[' + key + ']' + lines[k].substring (hit.end);
                masked[k] = masked[k].substring (0, hit.start) + receiver + '[' + key.replace (/[^\s"]/g, ' ') + ']' + masked[k].substring (hit.end);
            }
        }
    }
    return lines.join ('\n');
}

export function hx10w2G01Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, label: string) => {
        if (!condition) {
            problems.push (label);
        }
    };
    const f = (body: string) => hx10w2G01MapReads (body);
    ok (f ('func (this *X) f(response map[string]any) any {\n\treturn SafeStringPtr(GetValue(response, "code"))\n}\n').includes ('SafeStringPtr(response["code"])'), 'deref consumer, literal key');
    ok (f ('func (this *X) f(m map[string]any, k string) any {\n\treturn IsEqual(GetValue(m, k), "x")\n}\n').includes ('IsEqual(m[k], "x")'), 'deref consumer, string key');
    ok (f ('func (this *X) f(m map[string]any) any {\n\treturn SafeStringPtr(GetValue(m, "a"))\n}\n').includes ('SafeStringPtr(m["a"])'), 'map param receiver');
    ok (f ('func (this *X) f(v any) any {\n\treturn SafeStringPtr(GetValue(v, "a"))\n}\n').includes ('GetValue(v, "a")'), 'any receiver keeps the helper');
    ok (f ('func (this *X) f(o ...any) any {\n\tvar m map[string]any = GetArgMap(o, 0, nil)\n\treturn GetValue(m, "a")\n}\n').includes ('GetValue(m, "a")'), 'bare read on an unproven map keeps the helper');
    ok (f ('func (this *X) f(k string) any {\n\tvar result map[string]any = map[string]any{}\n\tresult[k] = []any{}\n\tvar v any = GetValue(result, k)\n\treturn v\n}\n').includes ('var v any = result[k]'), 'pointer-free map local, bare read');
    ok (f ('func (this *X) f(k string) any {\n\tvar result map[string]any = map[string]any{}\n\tresult[k] = SafeStringPtr(this.SafeString(k))\n\treturn GetValue(result, k)\n}\n').includes ('GetValue(result, k)'), 'boxed map value keeps the helper');
    ok (f ('func (this *X) f(m map[string]any, k *string) any {\n\treturn SafeStringPtr(GetValue(m, k))\n}\n').includes ('GetValue(m, k)'), 'non-string key keeps the helper');
    ok (f ('func (this *X) f(m map[string]any) any {\n\tgo func() { this.Spawn(m) }()\n\treturn SafeStringPtr(GetValue(m, "a"))\n}\n').includes ('GetValue(m, "a")'), 'async escape keeps the helper');
    ok (f ('func (this *X) f(b bool) any {\n\tvar m any = nil\n\tif b {\n\t\tvar m map[string]any = map[string]any{}\n\t\t_ = m\n\t} else {\n\t\treturn SafeStringPtr(GetValue(m, "a"))\n\t}\n\treturn nil\n}\n').includes ('GetValue(m, "a")'), 'read in the sibling arm keeps the helper');
    ok (f ('func (this *X) f(m map[string]any) any {\n\t_ = m\n\treturn SafeStringPtr(GetValue(this.Features, "spot"))\n}\n').includes ('SafeStringPtr(this.Features["spot"])'), 'base map field receiver');
    ok (f ('func (this *X) f(m map[string]any) any {\n\tthis.EncodeURIComponent(GetValue(m, "a"))\n\treturn nil\n}\n').includes ('GetValue(m, "a")'), 'non-deref consumer keeps the helper');
    ok (f ('func (this *X) f(m map[string]any) any {\n\treturn Add(Add(GetValue(m, "a"), "_"), GetValue(m, "b"))\n}\n').includes ('Add(Add(m["a"], "_"), m["b"])'), 'nested deref consumers');
    return problems;
}

if ((process.argv[1] ?? '').includes ('hx10w2-G01')) {
    const problems = hx10w2G01Check ();
    for (const problem of problems) {
        console.log ('FAIL ' + problem);
    }
    console.log ((problems.length === 0) ? 'hx10w2-G01 self-test ok' : (problems.length + ' problem(s)'));
}
