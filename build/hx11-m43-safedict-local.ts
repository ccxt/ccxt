// ===== hx11 w8 M43: SafeDict-seeded `var x any` locals become typed maps =====
// `var x any = this.SafeDict(a, k, map[string]any{})` (REST files) can only hold the decoded
// dictionary or the never-nil literal default, so `var x map[string]any = this.SafeDictMap(..)`
// A call with no default may answer nil: it types the local too when its only uses are `x != nil` / `x == nil` and the receiver of a plain safe read (a nil map reads and tests the same); the receiver may be `this.Options` (a map field) there.
// (exchange_safe.go: MapTyped of the same call) holds the same map. Every later use of the local
// that compiled against the `any` box still compiles against the map and answers the same
// (call arguments, composite values, `return`, `= x` copies, nil tests), and the existing typed-map
// passes then fold its GetValue / InOp / AddElementToObject uses. The local is left alone when it
// is rebound (any `x =`, `x, y =`, `:=`, range), its address is taken, it is type-asserted, indexed,
// used as a selector, compared with anything but nil, or declared more than once in the function.
// ws (pro) files only type receivers that are plain decoded values (no client/cache/orderbook
// expression, no type assertion), plus the this.Options / this.Balance map fields; prediction files keep the box.

const M43_DECL = /^(\s*)var (\w+) any = this\.(SafeDict2?)\((.*)\)$/;

export function m43Mask (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// top-level comma split of `text` using the masked copy for structure; returns the original pieces
function m43SplitArgs (text: string, masked: string): string[] | undefined {
    const parts: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i < masked.length; i++) {
        const c = masked[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth < 0) {
            return undefined;
        }
        if ((depth === 0) && (c === ',')) {
            parts.push (text.slice (from, i).trim ());
            from = i + 1;
        }
    }
    if (depth !== 0) {
        return undefined;
    }
    parts.push (text.slice (from).trim ());
    return parts;
}

export function m43Declarations (maskedFunc: string, signature: string, name: string): number {
    const vars = (maskedFunc.match (new RegExp ('\\bvar\\s+' + name + '\\b', 'g')) ?? []).length;
    const shorts = (maskedFunc.match (new RegExp ('(?:^|[^\\w.])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=', 'gm')) ?? []).length;
    const literalParams = [ ...maskedFunc.matchAll (/\bfunc\s*\(([^()]*)\)/g) ].filter ((m) => new RegExp ('\\b' + name + '\\b').test (m[1])).length;
    const ranges = (maskedFunc.match (new RegExp ('\\bfor\\b[^\\n{]*\\b' + name + '\\b[^\\n{]*:=\\s*range\\b')) ?? []).length;
    const params = new RegExp ('[(,]\\s*' + name + '\\s+[^,()]+?\\s*[,)]').test (signature.substring (signature.indexOf ('(', signature.startsWith ('func (') ? signature.indexOf (')') + 1 : 0))) ? 1 : 0;
    return vars + shorts + literalParams + ranges + params;
}

// false when this occurrence of the local (masked line, column) needs the `any` box
export function m43UseKeepsMap (s: string, col: number, name: string): boolean {
    const before = s.slice (0, col);
    const after = s.slice (col + name.length);
    const lhs = /^(\s*)((?:[\w.[\]]+\s*,\s*)*[\w.[\]]+)\s*(:=|=(?!=)|\+=|-=)/.exec (s);
    if ((lhs !== null) && (col < lhs[0].length - lhs[3].length)) {
        return false; // a rebinding or an element write target
    }
    if (/(?<![&\w)\]])&\s*$/.test (before) || /(?:^|[(,=:{]\s*)&\s*$/.test (before) || /\bswitch\s+$/.test (before)) {
        return false;
    }
    if (/\bIsArray\($/.test (before)) {
        return false; // the box folds `!Array.isArray(x)` to `if true`; a map would print IsArray
    }
    if (/^\s*(?:\.|\[|:(?!=))/.test (after)) {
        return false; // assertion, selector, index, keyed field
    }
    if (/^\s*[!=]=(?!\s*nil\b)/.test (after)) {
        return false;
    }
    if (/(?<![!=<>])[!=]=\s*$/.test (before) && !/\bnil\s*[!=]=\s*$/.test (before)) {
        return false;
    }
    return true;
}

// no-default locals may be a nil map: only `x != nil` / `x == nil` and the receiver of a plain safe read
function m43UseIsNilTestOrRead (s: string, col: number, name: string): boolean {
    const before = s.slice (0, col);
    const after = s.slice (col + name.length);
    if (/^\s*[!=]=\s*nil\b/.test (after) && /(?:\bif\s*|&&\s*\(?|\|\|\s*\(?|\(\s*)$/.test (before)) {
        return true;
    }
    return /(?:\bthis\.Safe\w+|\bccxt\.GetValue|\bccxt\.Safe\w+Typed\w*)\($/.test (before) && /^\s*,/.test (after);
}

// per line: true when the line sits inside an `if name != nil {` block (non-nil map there)
function m43GuardedLines (masked: string[], start: number, end: number, name: string): boolean[] {
    const guarded: boolean[] = [];
    const stack: boolean[] = [];
    const header = new RegExp ('^\\s*(?:\\}\\s*)?(?:else\\s+)?if\\s+(.*)\\{\\s*$');
    const test = new RegExp ('(?:^|[(\\s&])' + name + '\\s*!=\\s*nil\\b');
    for (let j = start; j <= end; j++) {
        guarded[j] = stack.some ((g) => g);
        const line = masked[j];
        const h = header.exec (line);
        const guard = (h !== null) && (h[1].indexOf ('||') < 0) && test.test (h[1]);
        const last = line.lastIndexOf ('{');
        for (let c = 0; c < line.length; c++) {
            if (line[c] === '{') {
                stack.push ((c === last) && guard);
            } else if (line[c] === '}') {
                stack.pop ();
            }
        }
    }
    return guarded;
}

function m43Func (lines: string[], masked: string[], start: number, end: number, ws: boolean): void {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    for (let k = start + 1; k < end; k++) {
        const decl = M43_DECL.exec (lines[k]);
        if ((decl === null) || (lines[k].indexOf ('//') >= 0)) {
            continue;
        }
        const name = decl[2];
        const maskedDecl = M43_DECL.exec (masked[k]);
        if ((maskedDecl === null) || (maskedDecl[2] !== name)) {
            continue;
        }
        const args = m43SplitArgs (decl[4], maskedDecl[4]);
        const wanted = (decl[3] === 'SafeDict2') ? 4 : 3;
        const noDefault = (args !== undefined) && (args.length === wanted - 1);  // nil map reads are safe: only nil tests and plain reads may use it
        if ((args === undefined) || !(noDefault || ((args.length === wanted) && (args[wanted - 1] === 'map[string]any{}')))
            || args.slice (0, wanted - 1).some ((a) => a === '') || ((args[0].indexOf ('this.') >= 0) && (args[0] !== 'this.Options') && (args[0] !== 'this.Balance'))
            || (ws && /\.\(|Client|Cache|Snapshot|[Oo]rderbook/.test (args[0].replace (/^\w+\.\(\*ccxt\.ArrayCache\)\.Hashmap$/, 'hashmap')))) {
            continue;
        }
        if (m43Declarations (maskedFunc, lines[start], name) !== 1) {
            continue;
        }
        const use = new RegExp ('(?<![\\w.])' + name + '(?!\\w)', 'g');
        const guarded = noDefault ? m43GuardedLines (masked, start, end, name) : [];
        let keeps = true;
        for (let j = start + 1; (j < end) && keeps; j++) {
            for (let m = use.exec (masked[j]); m !== null; m = use.exec (masked[j])) {
                if ((j === k) && (m.index === decl[1].length + 4)) {
                    continue; // the declaration itself
                }
                if (!m43UseKeepsMap (masked[j], m.index, name) || (noDefault && !guarded[j] && !m43UseIsNilTestOrRead (masked[j], m.index, name))) {
                    keeps = false;
                    break;
                }
            }
        }
        if (keeps) {
            lines[k] = decl[1] + 'var ' + name + ' map[string]any = this.' + decl[3] + 'Map(' + decl[4] + ')';
        }
    }
}

export function hx11M43SafeDictLocals (content: string, filePath: string): string {
    if (!/var \w+ any = this\.SafeDict2?\(/.test (content) || /[\\/]prediction[\\/]/.test (filePath)
        || /^exchange/.test (filePath.replace (/^.*[\\/]/, ''))) {
        return content;
    }
    const ws = /[\\/]pro[\\/]/.test (filePath);  // ws containers can be cache/orderbook types: only plain decoded-message receivers
    const lines = content.split ('\n');
    const masked = m43Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            m43Func (lines, masked, start, k, ws);
            start = -1;
        }
    }
    return lines.join ('\n');
}

export function hx11M43Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, label: string) => {
        if (!condition) {
            problems.push ('hx11 M43: ' + label);
        }
    };
    const run = (body: string, file = 'go/v4/x.go') => hx11M43SafeDictLocals ('package ccxt\n\nfunc (this *X) F(p any, optionalArgs ...any) any {\n' + body + '\treturn nil\n}\n', file);
    const decl = '\tvar d any = this.SafeDict(p, "data", map[string]any{})\n';
    const typed = 'var d map[string]any = this.SafeDictMap(p, "data", map[string]any{})';
    ok (run (decl + '\tAddElementToObject(d, "a", 1)\n\t_ = GetValue(d, "k")\n\treturn this.Extend(d, map[string]any{})\n').includes (typed), 'read/write/arg uses type the local');
    ok (run ('\tvar d any = this.SafeDict2(p, "a", "b", map[string]any{})\n\treturn d\n').includes ('var d map[string]any = this.SafeDict2Map(p, "a", "b", map[string]any{})'), 'SafeDict2 form');
    ok (run (decl + '\tif InOp(d, "k") && d != nil {\n\t}\n').includes (typed), 'nil test keeps the map');
    ok (!run (decl + '\td = this.Extend(d, map[string]any{})\n').includes (typed), 'a rebinding keeps the box');
    ok (!run (decl + '\tvar e map[string]any = d.(map[string]any)\n').includes (typed), 'a type assertion keeps the box');
    ok (!run (decl + '\tvar o any = nil\n\to, d = this.Handle(d)\n').includes (typed), 'a tuple rebinding keeps the box');
    ok (!run (decl + '\tif d == p {\n\t}\n').includes (typed), 'a compare with a non-nil operand keeps the box');
    ok (!run (decl + '\tvar q any = &d\n').includes (typed), 'an address keeps the box');
    ok (!run (decl + '\tfor i := 0; i < 2; i++ {\n\t\tvar d any = nil\n\t\t_ = d\n\t}\n').includes (typed), 'a second declaration keeps the box');
    ok (!run ('\tvar d any = this.SafeDict(p, "data")\n\treturn d\n').includes ('SafeDictMap'), 'no literal default keeps the box');
    ok (run ('\tvar d any = this.SafeDict(this.Options, "data", map[string]any{})\n\treturn d\n').includes ('SafeDictMap(this.Options, "data", map[string]any{})'), 'this.Options and this.Balance are plain map fields: a literal default types the local');
    ok (run ('\tvar d any = this.SafeDict(this.Balance, k, map[string]any{})\n\treturn d\n').includes ('var d map[string]any = this.SafeDictMap(this.Balance, k, map[string]any{})'), 'this.Balance receiver');
    ok (!run ('\tvar d any = this.SafeDict(this.Fees, "data", map[string]any{})\n').includes ('SafeDictMap'), 'other field receivers keep the box');
    ok (!run ('\tvar d any = this.SafeDict(p, "data", this.Fees)\n').includes ('SafeDictMap'), 'a computed default keeps the box');
    ok (run (decl, 'go/v4/pro/x.go').includes (typed), 'ws files type a plain decoded-message receiver');
    ok (!run ('\tvar d any = this.SafeDict(client.(ccxt.ClientInterface).SubscriptionsSnapshot(), \"k\", map[string]any{})\n', 'go/v4/pro/x.go').includes ('SafeDictMap'), 'ws client/cache receivers keep the box');
    ok (run ('\tvar d any = this.SafeDict(cached.(*ccxt.ArrayCache).Hashmap, "k", map[string]any{})\n', 'go/v4/pro/x.go').includes ('SafeDictMap'), 'the ArrayCache Hashmap field is a map of maps: a plain receiver');
    ok (!run ('\tvar d any = this.SafeDict(cached.(*ccxt.ArrayCache).Other, "k", map[string]any{})\n', 'go/v4/pro/x.go').includes ('SafeDictMap'), 'other ws cache receivers keep the box');
    ok (run ('\tvar d any = this.SafeDict(p, "k")\n\tif d != nil {\n\t\tAddElementToObject(d, "a", 1)\n\t\t_ = GetValue(d, "a")\n\t}\n').includes ('var d map[string]any = this.SafeDictMap(p, "k")'), 'no default: uses inside the non-nil guard type the local');
    ok (!run ('\tvar d any = this.SafeDict(p, "k")\n\tif d != nil {\n\t}\n\tAddElementToObject(d, "a", 1)\n').includes ('SafeDictMap'), 'no default: a write after the guard keeps the box');
    ok (!run ('\tvar d any = this.SafeDict(p, "k")\n\tif d != nil {\n\t} else {\n\t\tAddElementToObject(d, "a", 1)\n\t}\n').includes ('SafeDictMap'), 'no default: the else branch is not guarded');
    ok (!run (decl, 'go/v4/prediction/x.go').includes ('SafeDictMap'), 'prediction files keep the box');
    ok (!run (decl, 'go/v4/exchange_generated.go').includes ('SafeDictMap'), 'base files keep the box');
    ok (run ('\tvar d any = this.SafeDict(p, \"data\")\n\tif d != nil {\n\t\t_ = this.SafeString(d, \"k\")\n\t}\n').includes ('var d map[string]any = this.SafeDictMap(p, \"data\")'), 'no default: nil test + plain read type the local');
    ok (run ('\tvar d any = this.SafeDict(this.Options, \"data\")\n\tif d == nil {\n\t}\n').includes ('SafeDictMap(this.Options, \"data\")'), 'no default: this.Options receiver');
    ok (!run ('\tvar d any = this.SafeDict(p, \"data\")\n\treturn d\n').includes ('SafeDictMap'), 'no default: a bare return keeps the box');
    ok (!run ('\tvar d any = this.SafeDict(p, \"data\")\n\tAddElementToObject(d, \"a\", 1)\n').includes ('SafeDictMap'), 'no default: a write keeps the box');
    ok (!run ('\tvar d any = this.SafeDict(this.Markets(), \"data\")\n\t_ = d == nil\n').includes ('SafeDictMap'), 'no default: other this.* receivers keep the box');
    ok (!run (decl + '\tif !IsArray(d) {\n\t}\n').includes (typed), 'an IsArray test keeps the box');
    const once = run (decl);
    ok (hx11M43SafeDictLocals (once, 'go/v4/x.go') === once, 'idempotent');
    return problems;
}
