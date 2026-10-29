// ===== hx10 wave3 G07: tuple pointer slots -> typed *T locals =====
// handleParamString/Bool/Integer and the Option*AndParams slot-0 twins box a nil-able
// *string/*bool/*int64 at element 0 of their []any return. The printer reads that element as
// `any` and hx4 G39 unboxes it into an inline `func() any` closure, so the value loses its type
// and every read stays a box comparison. This pass retypes the read as the pointer itself
// (`var x *string = nil`, extracted with a native `h[0].(*string)` assertion) and rewrites the
// reads that need the value: nil tests stay, a comparison against a literal gains the nil guard,
// a map store inside a nil guard gains the deref. Every other read keeps the closure untouched.

const HX10G07_PRODUCERS: string[] = [
    'HandleParamString', 'HandleParamString2',
    'HandleParamBool', 'HandleParamBool2',
    'HandleParamInteger', 'HandleParamInteger2',
    'HandleOptionBoolAndParams', 'HandleOptionBoolAndParams2',
    'HandleOptionBoolAndParamsNullable', 'HandleOptionBoolAndParams2Nullable',
    'HandleOptionIntegerAndParams', 'HandleOptionIntegerAndParams2',
    'HandleOptionIntegerAndParamsNullable', 'HandleOptionIntegerAndParams2Nullable',
    'HandleOptionStringAndParams', 'HandleOptionStringAndParams2',
];

// callees whose Go body derefs (derefScalar / ToString / GetArgStringPtr / GetValue) every
// argument a family local can reach, so passing the pointer keeps the plain value
const HX10G07_CALLEES: string[] = [
    'Add', 'Subtract', 'IsEqual', 'GetValue', 'GetLength', 'GetIndexOf', 'EvalTruthy', 'ToUpper',
    'ArgumentsRequired', 'BadRequest', 'InvalidOrder', 'BadSymbol', 'NotSupported', 'ExchangeError',
    'this.CheckAddress', 'this.CurrencyToPrecision', 'this.PriceToPrecision', 'this.CostToPrecision',
    'this.NetworkCodeToId', 'this.NetworkIdToCode', 'this.NetworkCodeToChainId',
    'this.SelectNetworkKeyFromNetworks', 'this.ParseToInt', 'this.SafeDict', 'this.SafeString',
    'this.SafeString2', 'this.SafeValue', 'this.Market', 'SafeMapTyped', 'this.Iso8601',
];

const HX10G07_START = /^([ \t]*)([A-Za-z_][A-Za-z0-9_]*) (:?=) func\(\) any \{$/;
const HX10G07_READ = /^[ \t]*if p, _ := ([A-Za-z_][A-Za-z0-9_]*)\[0\]\.\(\*([A-Za-z_][A-Za-z0-9_]*)\); p != nil \{$/;

function hx10G07Word (name: string): RegExp {
    return new RegExp ('(^|[^A-Za-z0-9_.])' + name + '([^A-Za-z0-9_]|$)', 'g');
}

function hx10G07Count (text: string, name: string): number {
    const matches = text.match (hx10G07Word (name));
    return (matches === null) ? 0 : matches.length;
}

// blank string/rune literals and comments, keeping offsets and newlines
function hx10G07Mask (content: string): string {
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

// the callee the occurrence at `pos` is an argument of, or undefined outside a call
function hx10G07Callee (masked: string, pos: number): string | undefined {
    let depth = 0;
    let open = -1;
    for (let i = pos - 1; i >= 0; i--) {
        const c = masked[i];
        if (c === ')') { depth++; continue; }
        if (c === '(') {
            if (depth === 0) { open = i; break; }
            depth--;
        }
    }
    if (open < 0) { return undefined; }
    const head = /([A-Za-z_][A-Za-z0-9_.]*)$/.exec (masked.slice (0, open));
    return (head === null) ? undefined : head[1];
}

function hx10G07AllowedCallee (callee: string): boolean {
    const bare = callee.replace (/^ccxt\./, '');
    return HX10G07_CALLEES.indexOf (bare) >= 0;
}

// every occurrence of `name` in `masked` sits in an allowed callee's argument list
function hx10G07OnlyInAllowedCalls (masked: string, name: string): boolean {
    const rx = new RegExp ('(^|[^A-Za-z0-9_.])' + name + '(?=[^A-Za-z0-9_]|$)', 'g');
    let found = false;
    let m: RegExpExecArray | null;
    while ((m = rx.exec (masked)) !== null) {
        const pos = m.index + m[1].length;
        const callee = hx10G07Callee (masked, pos);
        if ((callee === undefined) || !hx10G07AllowedCallee (callee)) {
            return false;
        }
        found = true;
    }
    return found;
}

// `x` is non-nil at line `line`: an enclosing `if x != nil` block, a preceding
// `if x == nil { return .. }` guard, or an inline `(x != nil) &&` on the same condition
function hx10G07NilProven (lines: string[], masked: string[], from: number, to: number, line: number, name: string): boolean {
    const inline = masked[line];
    if ((new RegExp ('\\(?' + name + ' != nil\\)?\\s*&&').test (inline)) || (new RegExp ('\\(?' + name + ' == nil\\)?\\s*\\|\\|').test (inline))) {
        return true;
    }
    let depth = 0;
    const before: number[] = [];
    for (let i = from; i <= to; i++) {
        before[i] = depth;
        for (const c of masked[i]) {
            if (c === '{') { depth++; } else if (c === '}') { depth--; }
        }
    }
    const target = before[line];
    // enclosing block headers, outermost first, via a brace stack
    const stack: number[] = [];
    for (let i = from; i < line; i++) {
        const opened = (before[i + 1] === undefined) ? false : (before[i + 1] > before[i]);
        const closed = (before[i + 1] === undefined) ? false : (before[i + 1] < before[i]);
        const isElse = /\}\s*else\b[^{]*\{$/.test (masked[i].trim ());
        if (opened && !isElse) {
            stack.push (i);
        } else if (isElse) {
            if (stack.length > 0) { stack.pop (); }
            stack.push (i);
        } else if (closed) {
            for (let n = before[i] - before[i + 1]; n > 0; n--) {
                stack.pop ();
            }
        }
    }

    for (let s = stack.length - 1; s >= 0; s--) {
        const header = masked[stack[s]];
        const cond = /^(?:\} else )?if\s*(.*)\{\s*$/.exec (header.trim ());
        if (cond === null) { continue; }
        if (new RegExp ('\\(?' + name + ' != nil\\)?').test (cond[1])) {
            return true;
        }
    }
    // a completed `if x == nil { .. return/continue/panic .. }` before the line at the same depth
    for (let i = from; i < line; i++) {
        if (before[i] !== target) { continue; }
        const header = new RegExp ('^(?:\\} else )?if\\s*(\\(?' + name + ' == nil\\)?.*)\\{\\s*$').exec (masked[i].trim ());
        if ((header === null) || !new RegExp ('\\(?' + name + ' == nil\\)?').test (header[1])) { continue; }
        let j = i;
        while ((j + 1 < line) && (before[j + 1] > before[i])) { j++; }
        for (let k = i; k <= j; k++) {
            if (/\b(return|continue|panic|break)\b/.test (masked[k].slice (1))) { return true; }
        }
    }
    return false;
}

// the rewritten line, or undefined when the read is not one this pass can type
function hx10G07Use (line: string, maskedLine: string, name: string, proven: boolean): string | undefined {
    const trimmed = maskedLine.trim ();
    if (new RegExp ('^' + name + '\\s*(?::=|=|[-+|^]=|\\+\\+|--)').test (trimmed)) {
        return undefined; // a write to the local
    }
    // nil tests only: nothing to rewrite
    const rest = trimmed.split (new RegExp ('\\(?' + name + ' (?:==|!=) nil\\)?')).join ('');
    if (hx10G07Count (rest, name) === 0) {
        return line;
    }
    // the value only ever reaches a callee that derefs it
    if (hx10G07OnlyInAllowedCalls (rest, name)) {
        return line;
    }
    // `m["k"] = x` inside a nil guard: the store becomes the deref the box did
    const store = new RegExp ('^(\\s*[A-Za-z_][A-Za-z0-9_.]*\\[[^\\]]+\\] = )' + name + '(\\s*(?://.*)?)$').exec (line);
    if ((store !== null) && proven && (hx10G07Count (maskedLine, name) === 1)) {
        return store[1] + '*' + name + store[2];
    }
    // comparisons against a literal gain the nil guard the box compared through
    const literal = '("[^"\\\\]*(?:\\\\.[^"\\\\]*)*"|true|false|-?[0-9]+(?:\\.[0-9]+)?)';
    let out = line.replace (new RegExp ('!\\(\\s*' + name + ' == ' + literal + '\\s*\\)', 'g'),
        (all, lit) => '(' + name + ' == nil || *' + name + ' != ' + lit + ')');
    const compare = (op: string, lit: string, offset: number) => {
        const prefix = out.slice (0, offset);
        const guarded = (new RegExp (name + ' != nil\\)?\\s*&&\\s*\\(?$').test (prefix))
            || (new RegExp (name + ' == nil\\)?\\s*\\|\\|\\s*\\(?$').test (prefix));
        if (guarded) {
            return '*' + name + ' ' + op + ' ' + lit;
        }
        return (op === '==') ? '(' + name + ' != nil && *' + name + ' == ' + lit + ')'
            : '(' + name + ' == nil || *' + name + ' != ' + lit + ')';
    };
    out = out.replace (new RegExp ('\\(' + name + ' (==|!=) ' + literal + '\\)', 'g'), (all, op, lit, offset) => compare (op, lit, offset));
    out = out.replace (new RegExp ('(?<![A-Za-z0-9_.*])' + name + ' (==|!=) ' + literal + '(?![A-Za-z0-9_])', 'g'), (all, op, lit, offset) => compare (op, lit, offset));
    if (hx10G07Count (out.replace (new RegExp ('\\*' + name, 'g'), '').split (new RegExp ('\\(?' + name + ' (?:==|!=) nil\\)?')).join (''), name) > 0) {
        return undefined; // a read that is neither deref'd nor nil-tested remains
    }
    return out;
}

interface Hx10G07Site {
    start: number; end: number; name: string; ptr: string; holder: string; decl: number; indent: string;
}

function hx10G07Sites (lines: string[], masked: string[], from: number, to: number): Hx10G07Site[] {
    const out: Hx10G07Site[] = [];
    for (let i = from + 1; i + 5 < to; i++) {
        const start = HX10G07_START.exec (masked[i]);
        if (start === null) { continue; }
        const read = HX10G07_READ.exec (masked[i + 1]);
        if ((read === null) || !/^[ \t]*return \*p$/.test (masked[i + 2]) || (masked[i + 3].trim () !== '}')
            || !/^[ \t]*return nil$/.test (masked[i + 4]) || (masked[i + 5].trim () !== '}()')) {
            continue;
        }
        const name = start[2];
        const holder = read[1];
        let producer: string | undefined = undefined;
        let holderLine = -1;
        for (let k = i - 1; k > from; k--) {
            const holderMatch = new RegExp ('^[ \\t]*var ' + holder + ' \\[\\]any = (?:ccxt\\.)?this\\.([A-Za-z_][A-Za-z0-9_]*)\\(').exec (masked[k]);
            if (holderMatch !== null) {
                producer = holderMatch[1];
                holderLine = k;
                break;
            }
            if (masked[k].startsWith ('func ')) { break; }
        }
        let decl = -1;
        for (let k = i - 1; k > from; k--) {
            if (new RegExp ('^[ \\t]*var ' + name + ' any = nil$').test (masked[k])) {
                decl = k;
                break;
            }
            if (new RegExp ('^[ \\t]*(?:var\\s+)?' + name + '\\s*(?::=|=)').test (masked[k])) { break; }
            if (masked[k].startsWith ('func ')) { break; }
        }
        if ((producer === undefined) || (HX10G07_PRODUCERS.indexOf (producer) < 0)) {
            continue;
        }
        if ((start[3] === '=') && (decl === -1)) {
            continue; // assignment form without the `var x any = nil` pre-declaration
        }
        let rebound = 0;
        for (let k = from + 1; k <= to; k++) {
            if ((k === i) || (k === decl) || (k === holderLine)) { continue; }
            if (new RegExp ('^[ \\t]*(?:var\\s+)?' + holder + '\\s*(?::=|=)').test (masked[k])) { rebound += 1; }
        }
        if (rebound > 0) {
            continue;
        }
        out.push ({ 'start': i, 'end': i + 5, 'name': name, 'ptr': read[2], 'holder': holder, 'decl': decl, 'indent': start[1] });
    }
    return out;
}

export function hx10w3G07Pass (content: string): string {
    if ((content.indexOf ('func() any {') < 0) || (content.indexOf ('if p, _ := ') < 0)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = hx10G07Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const edits: { at: number; drop: number; text: string[] }[] = [];
    let from = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) { from = k; continue; }
        if ((from < 0) || (lines[k] !== '}')) { continue; }
        const to = k;
        const claimed = new Set<number> ();
        for (const site of hx10G07Sites (lines, masked, from, to)) {
            const uses: number[] = [];
            let proven = true;
            let conflict = false;
            const rewrites: { at: number; text: string }[] = [];
            for (let j = from + 1; j < to; j++) {
                if ((j >= site.start) && (j <= site.end)) { continue; }
                if ((j === site.decl) || (hx10G07Count (masked[j], site.name) === 0)) { continue; }
                uses.push (j);
                const rewritten = hx10G07Use (lines[j], masked[j], site.name, hx10G07NilProven (lines, masked, from, to, j, site.name));
                if (rewritten === undefined) { proven = false; break; }
                if (rewritten !== lines[j]) { rewrites.push ({ 'at': j, 'text': rewritten }); }
            }
            if (!proven || (uses.length === 0)) { continue; }
            for (const at of [ site.start, site.end, site.decl, ...rewrites.map ((r) => r.at) ]) {
                if ((at >= 0) && claimed.has (at)) { conflict = true; }
            }
            if (conflict) {
                continue; // two family locals on one line: leave the box to hx4 G39
            }
            for (const at of [ site.start, site.end, site.decl, ...rewrites.map ((r) => r.at) ]) {
                if (at >= 0) { claimed.add (at); }
            }
            const declIndent = (site.decl >= 0) ? (/^[ \t]*/.exec (lines[site.decl]) as RegExpExecArray)[0] : site.indent;
            const read = site.indent + 'if p, ok := ' + site.holder + '[0].(*' + site.ptr + '); ok { ' + site.name + ' = p }';
            if (site.decl >= 0) {
                edits.push ({ 'at': site.start, 'drop': site.end - site.start + 1, 'text': [ read ] });
                edits.push ({ 'at': site.decl, 'drop': 1, 'text': [ declIndent + 'var ' + site.name + ' *' + site.ptr + ' = nil' ] });
            } else {
                edits.push ({ 'at': site.start, 'drop': site.end - site.start + 1, 'text': [ site.indent + 'var ' + site.name + ' *' + site.ptr + ' = nil', read ] });
            }
            for (const r of rewrites) { edits.push ({ 'at': r.at, 'drop': 1, 'text': [ r.text ] }); }
        }
        from = -1;
    }
    edits.sort ((a, b) => b.at - a.at);
    for (const e of edits) {
        lines.splice (e.at, e.drop, ...e.text);
    }
    return lines.join ('\n');
}

export function hx10w3G07Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx10 w3 G07: ' + msg); } };
    const run = (body: string, sig = 'p any') => hx10w3G07Pass ('package ccxt\n\nfunc (this *X) f(' + sig + ') any {\n' + body + '\treturn nil\n}\n');
    const h = '\tvar tagV []any = this.HandleParamString(p, "tag")\n';
    try {
        const plain = run (h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tthis.CheckAddress(address, code, tag)\n\tif tag != nil {\n\t\trequest["memo"] = tag\n\t}\n');
        ok (plain.includes ('var tag *string = nil'), 'slot 0 becomes a typed pointer local: ' + plain);
        ok (plain.includes ('if p, ok := tagV[0].(*string); ok { tag = p }'), 'native assertion replaces the closure: ' + plain);
        ok (plain.includes ('request["memo"] = *tag'), 'a guarded store derefs: ' + plain);
        ok (!plain.includes ('func() any'), 'no closure left: ' + plain);
        const lit = run (h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tif (tag != nil) && (tag != "") {\n\t\tthis.CheckAddress(address, code, tag)\n\t}\n\tif tag == "x" {\n\t}\n');
        ok (lit.includes ('(tag != nil) && *tag != ""'), 'literal comparison keeps the nil half: ' + lit);
        ok (lit.includes ('if (tag != nil && *tag == "x") {'), 'bare comparison gains the nil guard: ' + lit);
        const bool = run ('\tvar hedgedV []any = this.HandleParamBool(p, "hedged", false)\n\tvar hedged any = nil\n\thedged = func() any {\n\t\tif p, _ := hedgedV[0].(*bool); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tif (hedged == true) || isStop {\n\t}\n\tif !(hedged == true) {\n\t}\n\tvar isHedged bool = (hedged == true)\n');
        ok (bool.includes ('var hedged *bool = nil'), 'bool slot 0 types: ' + bool);
        ok (bool.includes ('if (hedged != nil && *hedged == true) || isStop {'), 'disjunction arm gains the guard: ' + bool);
        ok (bool.includes ('if (hedged == nil || *hedged != true) {'), 'negated comparison: ' + bool);
        const ints = run ('\tvar untilV []any = this.HandleOptionIntegerAndParamsNullable(p, "until")\n\tvar until any = nil\n\tuntil = func() any {\n\t\tif p, _ := untilV[0].(*int64); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tif until != nil {\n\t\trequest["endTime"] = until\n\t}\n');
        ok (ints.includes ('var until *int64 = nil') && ints.includes ('request["endTime"] = *until'), 'int64 slot 0 types and derefs: ' + ints);
        const guarded = run (h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tif tag == nil {\n\t\tpanic(ArgumentsRequired("x"))\n\t}\n\trequest["memo"] = tag\n');
        ok (guarded.includes ('request["memo"] = *tag'), 'an early exit proves the guard: ' + guarded);
        const decl = run (h + '\ttag := func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tthis.CheckAddress(address, code, tag)\n');
        ok (decl.includes ('var tag *string = nil') && decl.includes ('tag = p }'), 'declaration form gets both lines: ' + decl);
        for (const keep of [
            h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\trequest["memo"] = tag\n',
            h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tvar other any = tag\n',
            h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\treturn []any{tag, p}\n',
            h + '\tvar tag any = nil\n\ttag = func() any {\n\t\tif p, _ := tagV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\ttag = "x"\n\tthis.CheckAddress(address, code, tag)\n',
            '\tvar netV []any = this.HandleNetworkCodeAndParams(p)\n\tvar net any = nil\n\tnet = func() any {\n\t\tif p, _ := netV[0].(*string); p != nil {\n\t\t\treturn *p\n\t\t}\n\t\treturn nil\n\t}()\n\tthis.CheckAddress(address, code, net)\n',
        ]) {
            ok (run (keep).indexOf ('func() any') >= 0, 'keeps the closure: ' + JSON.stringify (keep));
        }
    } catch (e: any) {
        problems.push ('hx10 w3 G07 threw: ' + e.message);
    }
    return problems;
}
