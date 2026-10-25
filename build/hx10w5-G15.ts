// hx10 wave5 G15: BaseExchange option dicts (Options/Has/Features/Fees/Limits) are `map[string]any`
// built non-nil in exchange_options.go, so a Go string key indexes them natively with the helper's
// exact result (AETO -> guarded m[k] = v, InOp -> `_, ok := m[k]`, GetValue -> m[k]); a nested box
// `this.Options["x"]` is `any` and keeps the helper.

const G15_FIELDS = 'Options|Has|Features|Fees|Limits';
const G15_LITERAL = /^"[^"\\\n]*"$/;
const G15_IDENT = /^[A-Za-z_]\w*$/;
const G15_PLAIN = [ 'string', 'int', 'int64', 'float64', 'bool', 'map[string]any', '[]any', '[]string' ];
const G15_POINTER = /^\*(?:string|int64|float64|bool|int|\[\]string|\[\]any|map\[string\]any)$/;
const G15_CALL = /^(\s*)((?:ccxt\.)?AddElementToObject)\(/;
// a value the helper's derefScalar leaves unchanged: a fresh map producer or an explicit deref
const G15_PRODUCER = /^(?:this\.(?:Extend|DeepExtend)\s*\(|(?:ccxt\.)?(?:map\[string\]any|\[\]any|\[\]string)\s*\{|(?:ccxt\.)?DerefScalar\s*\()/;

// comments and string/rune/raw literals blanked to spaces: offsets and newlines are preserved, so a
// position computed on the masked text is the same position in the real text
function g15Mask (content: string): string {
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

// index just past the bracket opened at text[open], or -1
function g15Close (text: string, open: number): number {
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

// depth-0 comma positions of a Go argument list
function g15Commas (text: string): number[] {
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

// name -> Go type of the func's parameters, read from its signature
function g15Params (masked: string[], start: number): any {
    const sig = masked.slice (start, Math.min (masked.length, start + 12)).join ('\n');
    const first = sig.indexOf ('(');
    if (first < 0) {
        return {};
    }
    const recvEnd = g15Close (sig, first);
    if (recvEnd < 0) {
        return {};
    }
    const open = sig.indexOf ('(', recvEnd - 1);
    if (open < 0) {
        return {};
    }
    const close = g15Close (sig, open);
    if (close < 0) {
        return {};
    }
    const list = sig.substring (open + 1, close - 1);
    const params: any = {};
    let from = 0;
    for (const end of g15Commas (list).concat ([ list.length ])) {
        const part = list.substring (from, end);
        from = end + 1;
        const m = /^\s*(\w+)\s+(.+?)\s*$/.exec (part);
        if (m !== null) {
            params[m[1]] = m[2];
        }
    }
    return params;
}

// declarations in force at line k of the func starting at `start`
function g15Scope (masked: string[], start: number, k: number): any {
    const types = g15Params (masked, start);
    for (let i = start + 1; i < k; i++) {
        const m = /^\s*var (\w+) (\S+)(?: = (.*))?$/.exec (masked[i]);
        if (m !== null) {
            types[m[1]] = m[2];
        }
    }
    return types;
}

// every `var name T =` in the function declares the same T, and there is at least one
function g15DeclOnly (maskedBody: string, name: string, type: string): boolean {
    const rx = new RegExp ('^\\s*var ' + name + ' (\\S+)', 'gm');
    let seen = 0;
    for (const m of maskedBody.matchAll (rx)) {
        if (m[1] !== type) {
            return false;
        }
        seen += 1;
    }
    return seen > 0;
}

// the Go text of a key an `m[k]` index accepts, plus the nil guard a `*string` key needs
function g15Key (key: string, scope: any, maskedBody: string): any {
    if (G15_LITERAL.test (key)) {
        return { 'text': key, 'guard': '' };
    }
    if (!G15_IDENT.test (key)) {
        return undefined;
    }
    const type = scope[key];
    if ((type === 'string') && g15DeclOnly (maskedBody, key, 'string')) {
        return { 'text': key, 'guard': '' };
    }
    if ((type === '*string') && g15DeclOnly (maskedBody, key, '*string')) {
        return { 'text': '*' + key, 'guard': key + ' != nil' };
    }
    return undefined;
}

// the printed value text the helper's derefScalar leaves unchanged (or an explicit deref of it)
function g15Value (value: string, maskedValue: string, scope: any, maskedBody: string, prefix: string): string | undefined {
    if (G15_LITERAL.test (value) || /^-?\d+(?:\.\d+)?$/.test (value) || ([ 'true', 'false', 'nil' ].indexOf (value) >= 0)) {
        return value;
    }
    if (G15_IDENT.test (value)) {
        const type = scope[value];
        if (type === undefined) {
            return undefined;
        }
        if ((G15_PLAIN.indexOf (type) >= 0) && g15DeclOnly (maskedBody, value, type)) {
            return value;
        }
        if (G15_POINTER.test (type) && g15DeclOnly (maskedBody, value, type)) {
            return prefix + 'DerefScalar(' + value + ')';
        }
        return undefined;
    }
    if (G15_PRODUCER.test (maskedValue)) {
        return value;
    }
    return undefined;
}

// `if <cond> {` holding exactly one InOp on a field -> `_, hx15ok := m[k]; <cond with ok>`
function g15InOp (line: string, maskedLine: string, scope: any, maskedBody: string): string | undefined {
    const head = /^(\s*)(\}\s*else\s+if|if)\s+(.+?)\s*\{\s*$/.exec (maskedLine);
    if (head === null) {
        return undefined;
    }
    const condAt = head[1].length + head[2].length + 1;
    const cond = head[3];
    if ((cond.indexOf (':=') >= 0) || (maskedBody.indexOf ('hx15ok') >= 0)) {
        return undefined;
    }
    const rxCalls = new RegExp ('(?<![\\w.])(?:ccxt\\.)?InOp\\(this\\.(?:' + G15_FIELDS + '), ', 'g');
    const calls = [ ...cond.matchAll (rxCalls) ];
    if (calls.length !== 1) {
        return undefined;
    }
    const rel = calls[0].index as number;
    const open = condAt + rel + calls[0][0].indexOf ('(');
    const close = g15Close (maskedLine, open);
    if (close < 0) {
        return undefined;
    }
    const innerMasked = maskedLine.substring (open + 1, close - 1);
    const commas = g15Commas (innerMasked);
    if (commas.length !== 1) {
        return undefined;
    }
    const recv = line.substring (open + 1, open + 1 + commas[0]).trim ();
    const key = line.substring (open + 2 + commas[0], close - 1).trim ();
    if (new RegExp ('^this\\.(?:' + G15_FIELDS + ')$').test (recv) === false) {
        return undefined;
    }
    const proof = g15Key (key, scope, maskedBody);
    if ((proof === undefined) || (proof.guard !== '')) {
        return undefined; // a nil `*string` key answers false in InOp, which a `m[k]` condition cannot express
    }
    const wrapped = (rel >= 2) && (maskedLine.substring (condAt + rel - 2, condAt + rel) === '!(')
        && (maskedLine[close] === ')');
    const start = wrapped ? (condAt + rel - 2) : (condAt + rel);
    const end = wrapped ? (close + 1) : close;
    const replaced = line.substring (0, start) + (wrapped ? '!hx15ok' : 'hx15ok') + line.substring (end);
    return replaced.substring (0, condAt) + '_, hx15ok := ' + recv + '[' + proof.text + ']; ' + replaced.substring (condAt);
}

// one AddElementToObject statement on a field -> the native write (undefined = keep the helper)
function g15Aeto (lines: string[], masked: string[], start: number, k: number, end: number, maskedBody: string, prefix: string): any {
    const m = G15_CALL.exec (masked[k]);
    if (m === null) {
        return undefined;
    }
    const indent = m[1];
    if (lines[k].substring (0, m[0].length) !== m[0]) {
        return undefined; // a literal sits where the callee starts: leave it alone
    }
    const open = m[0].length - 1;
    const tail = masked.slice (k, end + 1).join ('\n');
    const close = g15Close (tail, open);
    if ((close < 0) || (tail.substring (close).split ('\n')[0].trim () !== '')) {
        return undefined;
    }
    const last = k + tail.substring (0, close).split ('\n').length - 1;
    const argsMasked = tail.substring (open + 1, close - 1);
    const argsText = lines.slice (k, last + 1).join ('\n').substring (open + 1, close - 1);
    const commas = g15Commas (argsMasked);
    if ((commas.length !== 2) || (argsMasked.substring (0, commas[0]).indexOf ('\n') >= 0)
        || (argsMasked.substring (commas[0] + 1, commas[1]).indexOf ('\n') >= 0)) {
        return undefined;
    }
    const recv = argsText.substring (0, commas[0]).trim ();
    if (new RegExp ('^this\\.(?:' + G15_FIELDS + ')$').test (recv) === false) {
        return undefined;
    }
    const key = argsText.substring (commas[0] + 1, commas[1]).trim ();
    const value = argsText.substring (commas[1] + 1).trim ();
    const valueMasked = argsMasked.substring (commas[1] + 1).trim ();
    const scope = g15Scope (masked, start, k);
    const proof = g15Key (key, scope, maskedBody);
    if (proof === undefined) {
        return undefined;
    }
    const valueOut = g15Value (value, valueMasked, scope, maskedBody, prefix);
    if (valueOut === undefined) {
        return undefined;
    }
    const write = recv + '[' + proof.text + '] = ' + valueOut;
    // a typed-nil map is a no-op in AddElementToObject but a panic on assignment
    const guard = recv + ' != nil' + ((proof.guard === '') ? '' : (' && ' + proof.guard));
    if (valueOut.indexOf ('\n') < 0) {
        return { 'last': last, 'text': indent + 'if ' + guard + ' { ' + write + ' }' };
    }
    const shifted = valueOut;
    return { 'last': last, 'text': indent + 'if ' + guard + ' {\n' + indent + String.fromCharCode (9) + recv + '[' + proof.text + '] = ' + shifted + '\n' + indent + '}' };
}

// single-line GetValue read on a field whose key the file proves a Go string
function g15Read (line: string, maskedLine: string, scope: any, maskedBody: string): string | undefined {
    const rx = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(this\\.(' + G15_FIELDS + '), ([^,()]+)\\)', 'g');
    const hits = [ ...maskedLine.matchAll (rx) ];
    if (hits.length !== 1) {
        return undefined;
    }
    const hit = hits[0];
    const at = hit.index as number;
    const comma = hit[0].indexOf (', ');
    const key = line.substring (at + comma + 2, at + hit[0].length - 1).trim ();
    const proof = g15Key (key, scope, maskedBody);
    if ((proof === undefined) || (proof.guard !== '')) {
        return undefined;
    }
    return line.substring (0, at) + 'this.' + hit[1] + '[' + proof.text + ']' + line.substring (at + hit[0].length);
}

export function hx10G15Pass (content: string): string {
    if (!new RegExp ('(?:AddElementToObject|InOp|GetValue)\\(this\\.(?:' + G15_FIELDS + ')').test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    let maskedLines = g15Mask (content).split ('\n');
    if (lines.length !== maskedLines.length) {
        return content;
    }
    const prefix = (/^package\s+ccxt\s*$/m.test (content)) ? '' : 'ccxt.';
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            const maskedBody = maskedLines.slice (start, k + 1).join ('\n');
            const splices: any[] = [];
            for (let i = start + 1; i < k; i++) {
                if ((lines[i] === undefined) || (maskedLines[i] === undefined)) {
                    continue;
                }
                const scope = g15Scope (maskedLines, start, i);
                const write = g15Aeto (lines, maskedLines, start, i, k, maskedBody, prefix);
                if (write !== undefined) {
                    splices.push ({ 'at': i, 'last': write.last, 'text': write.text });
                    i = write.last;
                    continue;
                }
                const inop = g15InOp (lines[i], maskedLines[i], scope, maskedBody);
                if (inop !== undefined) {
                    lines[i] = inop;
                    continue;
                }
                const read = g15Read (lines[i], maskedLines[i], scope, maskedBody);
                if (read !== undefined) {
                    lines[i] = read;
                }
            }
            const before = lines.length;
            for (const s of splices.reverse ()) {
                lines.splice (s.at, s.last - s.at + 1, ...s.text.split ('\n'));
            }
            if (lines.length !== before) {
                // a wrapped write changes the line count: re-mask and keep the cursor aligned
                maskedLines = g15Mask (lines.join ('\n')).split ('\n');
                k += lines.length - before;
            }
            start = -1;
        }
    }
    return lines.join ('\n');
}

export function hx10G15Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10 G15: ' + msg); } };
    const src = (body: string, sig = '') => 'package ccxt\n\nfunc (this *X) f(' + sig + ') any {\n' + body + '\treturn nil\n}\n';
    const run = (body: string, sig = '') => hx10G15Pass (src (body, sig));
    const keeps = (body: string, sig = '') => ok (run (body, sig) === src (body, sig), 'keeps its text: ' + body.trim ());
    try {
        ok (run ('\tif !(InOp(this.Options, "hf")) {\n\t}\n').includes ('\tif _, hx15ok := this.Options["hf"]; !hx15ok {\n'), 'negated literal InOp');
        ok (run ('\tif InOp(this.Has, "k") {\n\t}\n').includes ('\tif _, hx15ok := this.Has["k"]; hx15ok {\n'), 'plain literal InOp');
        ok (run ('\tif (reload == true) || !(InOp(this.Options, "limitsLoaded")) {\n\t}\n').includes ('if _, hx15ok := this.Options["limitsLoaded"]; (reload == true) || !hx15ok {'), 'compound condition merges');
        ok (run ('\t} else if !(InOp(this.Fees, "a")) {\n\t}\n').includes ('\t} else if _, hx15ok := this.Fees["a"]; !hx15ok {'), 'else-if');
        ok (run ('\tvar k string = "a"\n\tif !(InOp(this.Options, k)) {\n\t}\n').includes ('_, hx15ok := this.Options[k]; !hx15ok {'), 'string local InOp');
        keeps ('\tvar k any = "a"\n\tif !(InOp(this.Options, k)) {\n\t}\n');
        keeps ('\tif !(InOp(this.Options, "a")) || !(InOp(this.Options, "b")) {\n\t}\n');
        keeps ('\tif !(InOp(this.MarketsById, "a")) {\n\t}\n');
        keeps ('\tvar k *string = this.SafeString2(p, "a")\n\tif !(InOp(this.Options, k)) {\n\t}\n');
        ok (run ('\tccxt.AddElementToObject(this.Options, "k", map[string]any{\n\t\t"a": 1,\n\t})\n')
            .includes ('this.Options["k"] = map[string]any{\n\t\t"a": 1,\n\t}'), 'literal key, literal value');
        ok (run ('\tvar marketType string = GetArgString(optionalArgs, 0, "margin")\n\tvar options any = this.SafeDict(this.Options, marketType, map[string]any{})\n\tccxt.AddElementToObject(this.Options, marketType, this.Extend(options, map[string]any{\n\t\t"listenToken": listenToken,\n\t}))\n')
            .includes ('this.Options[marketType] = this.Extend(options, map[string]any{\n\t\t"listenToken": listenToken,\n\t})'), 'multi-line producer value keeps its lines');
        ok (run ('\tvar k *string = this.SafeString2(p, "a")\n\tAddElementToObject(this.Options, k, 1)\n').includes ('if this.Options != nil && k != nil { this.Options[*k] = 1 }'), '*string key takes a nil guard');
        ok (run ('\tvar v *int64 = this.SafeInteger(p, "v")\n\tAddElementToObject(this.Features, "k", v)\n').includes ('this.Features["k"] = DerefScalar(v)'), 'pointer value derefs like the helper');
        ok (run ('\treturn GetValue(this.Features, "k")\n').includes ('\treturn this.Features["k"]\n'), 'literal read on Features');
        ok (run ('\tvar k string = "a"\n\treturn GetValue(this.Limits, k)\n').includes ('\treturn this.Limits[k]\n'), 'string local read');
        keeps ('\treturn GetValue(this.Features, marketType)\n', 'marketType any');
        const twoFuncs = 'package ccxt\n\nfunc (this *X) f() any {\n\tccxt.AddElementToObject(this.Options, "k", map[string]any{\n\t\t"a": 1,\n\t})\n\treturn nil\n}\n\nfunc (this *X) g() any {\n\tif !(InOp(this.Options, "z")) {\n\t}\n\treturn nil\n}\n';
        ok (hx10G15Pass (twoFuncs).includes ('if _, hx15ok := this.Options["z"]; !hx15ok {'), 'a wrapped write keeps later funcs aligned');
        keeps ('\tccxt.AddElementToObject(this.Options["leverageBrackets"], symbol, result)\n');
        keeps ('\tccxt.AddElementToObject(this.Options, helper, GetValue(sourceExchange.Options, helper))\n');
        keeps ('\tccxt.AddElementToObject(this.Options, "k", this.SafeInteger(p, "v"))\n');
        const once = run ('\tif !(InOp(this.Options, "hf")) {\n\t}\n\tthis.Options["k"] = 1\n');
        ok (hx10G15Pass (once) === once, 'idempotent');
    } catch (e: any) {
        problems.push ('hx10 G15 threw: ' + e.message);
    }
    return problems;
}
