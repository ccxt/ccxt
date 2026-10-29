// ===== hx10 wave2 G03: AddElementToObject -> native map/slice write on a typed receiver =====
// Post-pass over emitted Go text. The write goes native only when the function text types the receiver
// as map[string]any / []any / []string, the key is a string (or a *string that gets its own nil guard) and
// the value is one the helper's derefScalar leaves unchanged. The helper is a no-op on a nil receiver map,
// a nil key and out of range, so each of those becomes the same explicit guard; an unproven site keeps the
// plain helper call.

const HX10G03_CALL = /^(\s*)((?:ccxt\.)?AddElementToObject)\(/;
const HX10G03_SCALARS = [ 'string', 'int', 'int64', 'float64', 'bool' ];
// a fresh non-nil map: the helpers whose Go body always builds one (MapTyped/SafeDict can answer nil)
const HX10G03_MAP_PRODUCER = /^(?:map\[string\]any\{|(?:ccxt\.)?GetArgMap\s*\(\s*optionalArgs, \d+, map\[string\]any\{\}\s*\)$|this\.(?:Extend|DeepExtend)\s*\(|this\.Account\s*\(\s*\)$|(?:ccxt\.)?(?:TickerToMap|TradeToMap|OrderToMap)\s*\()/;
const HX10G03_LIST_PRODUCER = /^(?:\[\]any\{|\[\]string\{|this\.ArraySlice\s*\(|(?:ccxt\.)?ToList\s*\()/;
// base methods whose Go signature takes a default and never answers nil
const HX10G03_DEFAULTED_CALLS = [ 'this.SafeString', 'this.SafeInteger', 'this.SafeTimestamp', 'this.SafeNumber', 'this.SafeBool', 'this.SafeStringLower', 'this.SafeStringUpper' ];

// blank string/rune literals and comments, keeping offsets and newlines
function hx10G03Mask (content: string): string {
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

// index just past the group opened at text[open], or -1
function hx10G03GroupEnd (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth === 0) {
            return i + 1;
        }
    }
    return -1;
}

// depth-0 comma positions of a go argument list
function hx10G03TopCommas (text: string): number[] {
    const out: number[] = [];
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if ((depth === 0) && (c === ',')) {
            out.push (i);
        }
    }
    return out;
}

function hx10G03Escape (name: string): string {
    return name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// `name = ...` writes (not `==`, not an element or field write) inside the function body
function hx10G03Writes (maskedBody: string, name: string): string[] {
    const rx = new RegExp ('(?:^|[^\\w.&*])' + hx10G03Escape (name) + '\\s*=(?!=)\\s*([^\\n]*)', 'gm');
    return [ ...maskedBody.matchAll (rx) ].map ((m) => m[1].trim ());
}

// the local is declared (and only ever rewritten) with a fresh non-nil container
function hx10G03NeverNil (maskedBody: string, type: string, name: string, init: string): boolean {
    const producer = (type === 'map[string]any') ? HX10G03_MAP_PRODUCER : HX10G03_LIST_PRODUCER;
    if (!producer.test (init)) {
        return false;
    }
    for (const w of hx10G03Writes (maskedBody, name)) {
        if (!producer.test (w)) {
            return false;
        }
    }
    return !new RegExp ('&\\s*' + hx10G03Escape (name) + '\\b').test (maskedBody);
}

// every declaration of the name in the function prints the same type
function hx10G03Uniform (maskedBody: string, name: string, type: string): boolean {
    const rx = new RegExp ('^\\s*var ' + hx10G03Escape (name) + ' (\\S+)', 'gm');
    for (const m of maskedBody.matchAll (rx)) {
        if (m[1] !== type) {
            return false;
        }
    }
    return true;
}

// value text the helper's derefScalar leaves unchanged
function hx10G03PlainValue (value: string, maskedValue: string, scope: any, maskedBody: string): string | undefined {
    if (/^"[^"\\\n]*"$/.test (value) || /^-?\d+(?:\.\d+)?$/.test (value) || ([ 'true', 'false', 'nil' ].indexOf (value) >= 0)) {
        return value;
    }
    if (/^\w+$/.test (value)) {
        const t = scope.types[value];
        if ((HX10G03_SCALARS.indexOf (t) >= 0) && hx10G03Uniform (maskedBody, value, t)) {
            return value;
        }
        if (((t === 'map[string]any') || (t === '[]any') || (t === '[]string'))
            && hx10G03Uniform (maskedBody, value, t) && hx10G03NeverNil (maskedBody, t, value, scope.inits[value] ?? '')) {
            return value;
        }
        return undefined;
    }
    const literal = /^(?:ccxt\.)?(map\[string\]any|\[\]any|\[\]string)\s*\{/.exec (maskedValue);
    if ((literal !== null) && (hx10G03GroupEnd (maskedValue, literal[0].length - 1) === maskedValue.length)) {
        return value;
    }
    // `this.SafeInteger(x, "k", 0)` answers a pointer the helper derefs: reproduce the deref
    const call = /^(this\.\w+)\s*\(/.exec (maskedValue);
    if ((call !== null) && (HX10G03_DEFAULTED_CALLS.indexOf (call[1]) >= 0)
        && (hx10G03GroupEnd (maskedValue, call[0].length - 1) === maskedValue.length)
        && (hx10G03TopCommas (maskedValue.substring (call[0].length, maskedValue.length - 1)).length >= 2)) {
        return '*' + value;
    }
    return undefined;
}

// a Go `int` index the helper's `.(int)` assertion accepts: a non-negative literal, an int local, `ident-N`
function hx10G03Index (key: string, scope: any, maskedBody: string): string | undefined {
    if (/^\d+$/.test (key)) {
        return key;
    }
    if (/^\w+$/.test (key) && (scope.types[key] === 'int') && hx10G03Uniform (maskedBody, key, 'int')) {
        return key;
    }
    const minus = /^(\w+)-(\d+)$/.exec (key);
    if ((minus !== null) && (scope.types[minus[1]] === 'int') && hx10G03Uniform (maskedBody, minus[1], 'int')) {
        return key;
    }
    return undefined;
}

// parameter list of the func starting at `start`, as name -> Go type
function hx10G03ParamList (masked: string[], start: number): any {
    const sig = masked.slice (start, Math.min (masked.length, start + 12)).join ('\n');
    const first = sig.indexOf ('(');
    if (first < 0) {
        return {};
    }
    const recvEnd = hx10G03GroupEnd (sig, first);
    if (recvEnd < 0) {
        return {};
    }
    const open = sig.indexOf ('(', recvEnd - 1);
    if (open < 0) {
        return {};
    }
    const close = hx10G03GroupEnd (sig, open);
    if (close < 0) {
        return {};
    }
    const list = sig.substring (open + 1, close - 1);
    const params: any = {};
    let from = 0;
    for (const end of hx10G03TopCommas (list).concat ([ list.length ])) {
        const part = list.substring (from, end);
        from = end + 1;
        const m = /^\s*(\w+)\s+(.+?)\s*$/.exec (part);
        if (m !== null) {
            params[m[1]] = m[2];
        }
    }
    return params;
}

// declarations in force at line k, plus the printed initializer text of each
function Hx10G03Scope (masked: string[], start: number, k: number): any {
    const types = hx10G03ParamList (masked, start);
    const inits: any = {};
    for (const name of Object.keys (types)) {
        inits[name] = '';
    }
    for (let i = start + 1; i < k; i++) {
        const m = /^\s*var (\w+) (\S+)(?: = (.*))?$/.exec (masked[i]);
        if ((m !== null) && (masked[i].indexOf ('\n') < 0)) {
            types[m[1]] = m[2];
            inits[m[1]] = (m[3] === undefined) ? '' : m[3];
        }
    }
    return { types, inits };
}

function hx10G03Emit (indent: string, recv: string, keyOut: string, valueOut: string, guards: string[]): string {
    if (guards.length === 0) {
        return indent + recv + '[' + keyOut + '] = ' + valueOut;
    }
    const cond = guards.join (' && ');
    if (valueOut.indexOf ('\n') < 0) {
        // one line in, one line out: the endpoint labels of a file count lines, so a block would renumber them
        return indent + 'if ' + cond + ' { ' + recv + '[' + keyOut + '] = ' + valueOut + ' }';
    }
    // a multi-line value (map literal) sits one level deeper inside the guard
    const value = valueOut.split ('\n').map ((l, n) => ((n === 0) ? l : (l.length === 0) ? l : ('\t' + l))).join ('\n');
    return indent + 'if ' + cond + ' {\n' + indent + '\t' + recv + '[' + keyOut + '] = ' + value + '\n' + indent + '}';
}

// one call statement -> { last, text }: the native write replacing lines k..last, or undefined
function hx10G03Site (lines: string[], masked: string[], start: number, k: number, end: number, maskedBody: string): any {
    const m = HX10G03_CALL.exec (masked[k]);
    if (m === null) {
        return undefined;
    }
    const indent = m[1];
    if (lines[k].substring (0, m[0].length) !== m[0]) {
        return undefined; // a literal sits where the callee starts: leave it alone
    }
    const open = m[0].length - 1;
    const tail = masked.slice (k, end + 1).join ('\n');
    const close = hx10G03GroupEnd (tail, open);
    if ((close < 0) || (tail.substring (close).split ('\n')[0].trim () !== '')) {
        return undefined;
    }
    const last = k + tail.substring (0, close).split ('\n').length - 1;
    const argsMasked = tail.substring (open + 1, close - 1);
    const argsText = lines.slice (k, last + 1).join ('\n').substring (open + 1, close - 1);
    const commas = hx10G03TopCommas (argsMasked);
    if ((commas.length !== 2) || (argsMasked.substring (0, commas[0]).indexOf ('\n') >= 0) || (argsMasked.substring (commas[0] + 1, commas[1]).indexOf ('\n') >= 0)) {
        return undefined;
    }
    const recv = argsMasked.substring (0, commas[0]).trim ();
    const key = argsText.substring (commas[0] + 1, commas[1]).trim ();
    const value = argsText.substring (commas[1] + 1).trim ();
    const valueMasked = argsMasked.substring (commas[1] + 1).trim ();
    if (!/^\w+$/.test (recv)) {
        return undefined;
    }
    const scope = Hx10G03Scope (masked, start, k);
    const recvType = scope.types[recv];
    const guards: string[] = [];
    let text: string | undefined = undefined;
    if (recvType === 'map[string]any') {
        if (!hx10G03Uniform (maskedBody, recv, recvType)) {
            return undefined;
        }
        if (!hx10G03NeverNil (maskedBody, recvType, recv, scope.inits[recv] ?? '')) {
            guards.push (recv + ' != nil');
        }
        let keyOut: string | undefined = undefined;
        if (/^"[^"\\\n]*"$/.test (key)) {
            keyOut = key;
        } else if (/^\w+$/.test (key) && (scope.types[key] === 'string') && hx10G03Uniform (maskedBody, key, 'string')) {
            keyOut = key;
        } else if (/^\w+$/.test (key) && (scope.types[key] === '*string') && hx10G03Uniform (maskedBody, key, '*string')) {
            keyOut = '*' + key;
            guards.push (key + ' != nil');
        }
        if (keyOut === undefined) {
            return undefined;
        }
        const valueOut = hx10G03PlainValue (value, valueMasked, scope, maskedBody);
        if (valueOut === undefined) {
            return undefined;
        }
        text = hx10G03Emit (indent, recv, keyOut, valueOut, guards);
    } else if ((recvType === '[]any') || (recvType === '[]string')) {
        if (!hx10G03Uniform (maskedBody, recv, recvType)) {
            return undefined;
        }
        const index = hx10G03Index (key, scope, maskedBody);
        const valueOut = hx10G03PlainValue (value, valueMasked, scope, maskedBody);
        if ((index === undefined) || (valueOut === undefined)) {
            return undefined;
        }
        if ((recvType === '[]string') && !(/^"[^"\\\n]*"$/.test (value) || (/^\w+$/.test (value) && (scope.types[value] === 'string')))) {
            return undefined; // the helper stores Sprintf("%v", value): only a string operand matches
        }
        if (/^\d+$/.test (index)) {
            text = hx10G03Emit (indent, recv, index, valueOut, [ index + ' < len(' + recv + ')' ]);
        } else {
            text = hx10G03Emit (indent, recv, index, valueOut, [ index + ' >= 0', index + ' < len(' + recv + ')' ]);
        }
    }
    return (text === undefined) ? undefined : { last, text };
}

export function hx10G03Pass (content: string): string {
    if (!/\bAddElementToObject\s*\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = hx10G03Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            const maskedBody = masked.slice (start, k + 1).join ('\n');
            const sites: any[] = [];
            for (let i = start + 1; i < k; i++) {
                const site = hx10G03Site (lines, masked, start, i, k, maskedBody);
                if (site !== undefined) {
                    sites.push ({ at: i, last: site.last, text: site.text });
                }
            }
            for (const s of sites.reverse ()) {
                const rewritten = s.text.split ('\n');
                lines.splice (s.at, s.last - s.at + 1, ...rewritten);
            }
            start = -1;
        }
    }
    return lines.join ('\n');
}

export function hx10G03Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10 G03: ' + msg); } };
    const run = (body: string) => hx10G03Pass ('package ccxt\n\nfunc (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    try {
        ok (run ('\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tAddElementToObject(m, "k", "v")\n').includes ('if m != nil { m["k"] = "v" }'), 'nilable map receiver takes an explicit nil guard');
        ok (run ('\tvar m map[string]any = map[string]any{}\n\tvar code *string = this.SafeString(p, "c")\n\tAddElementToObject(m, code, 1)\n').includes ('if code != nil { m[*code] = 1 }'), '*string key takes a nil guard');
        ok (run ('\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar code *string = this.SafeString(p, "c")\n\tAddElementToObject(m, code, "v")\n').includes ('if m != nil && code != nil { m[*code] = "v" }'), 'nilable receiver and key share one guard');
        ok (run ('\tvar m map[string]any = map[string]any{}\n\tvar s string = "v"\n\tAddElementToObject(m, "k", s)\n').includes ('m["k"] = s'), 'map write on a never-nil receiver and a string local');
        ok (run ('\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar t map[string]any = TickerToMap(p)\n\tAddElementToObject(m, "k", t)\n').includes ('m["k"] = t'), 'never-nil map value on a guarded receiver');
        ok (run ('\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar t map[string]any = TickerToMap (p)\n\tAddElementToObject(m, "k", t)\n').includes ('m["k"] = t'), 'printer spacing before the value call');
        ok (run ('\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tAddElementToObject(m, "k", this.SafeInteger(p, "v", 0))\n').includes ('m["k"] = *this.SafeInteger(p, "v", 0)'), 'literal-default safe call derefs like the helper');
        ok (run ('\tvar xs []any = []any{}\n\tvar i int = 0\n\tAddElementToObject(xs, i, "v")\n').includes ('if i >= 0 && i < len(xs) { xs[i] = "v" }'), 'slice write carries the bounds test');
        ok (run ('\tvar xs []string = []string{}\n\tAddElementToObject(xs, 0, "v")\n').includes ('if 0 < len(xs) { xs[0] = "v" }'), '[]string write with a string operand');
        ok (run ('\tvar xs []any = []any{}\n\tvar n int = 2\n\tAddElementToObject(xs, n-1, "v")\n').includes ('if n-1 >= 0 && n-1 < len(xs) { xs[n-1] = "v" }'), 'int expression index keeps both bounds');
        ok (run ('\tvar m map[string]any = map[string]any{}\n\tAddElementToObject(m, "k", map[string]any{\n\t\t"a": 1,\n\t})\n').includes ('m["k"] = map[string]any{\n\t\t"a": 1,\n\t}'), 'multi-line literal value keeps its lines');
        ok (hx10G03Pass ('package ccxt\n\nfunc (this *X) f(a, b any) any {\n\tAddElementToObject(a.Balance, "k", b)\n}\n').indexOf ('AddElementToObject(a.Balance') >= 0, 'a member receiver keeps the helper');
        for (const keep of [
            '\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar v any = this.SafeDict(p, "v")\n\tAddElementToObject(m, "k", v)\n',
            '\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar v *int64 = nil\n\tAddElementToObject(m, "k", v)\n',
            '\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tAddElementToObject(m, "k", this.SafeDict(p, "v"))\n',
            '\tvar m any = map[string]any{}\n\tAddElementToObject(m, "k", "v")\n',
            '\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tAddElementToObject(m, "k", this.SafeInteger(p, "v"))\n',
            '\tvar xs []any = []any{}\n\tvar i int64 = 0\n\tAddElementToObject(xs, i, "v")\n',
            '\tvar xs []any = []any{}\n\tAddElementToObject(xs, 0, this.SafeList(p, "v", []any{}))\n',
            '\tvar m map[string]any = nil\n\tm = map[string]any{}\n\tvar k any = "a"\n\tAddElementToObject(m, k, "v")\n',
            '\tvar xs []string = []string{}\n\tAddElementToObject(xs, 0, 1)\n',
        ]) {
            const out = run (keep);
            ok (out.includes ('AddElementToObject('), 'keeps the helper: ' + JSON.stringify (keep) + ' -> ' + out);
        }
    } catch (e: any) {
        problems.push ('hx10 G03 threw: ' + e.message);
    }
    return problems;
}
