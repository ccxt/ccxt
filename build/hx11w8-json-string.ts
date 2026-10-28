// HX11 w8 m172 json-return-string: this.Json(x) returns a Go `string` (go/v4/exchange.go), so
// `name = SafeStringPtr(this.Json(x))` boxes a string that is already a string. Emit the string local
// and take its address instead: `jsonText := this.Json(x)` + `name = &jsonText`. Only statement-level
// assignments / returns whose whole right-hand side is the SafeStringPtr(this.Json(..)) call are rewritten.

const CALL = /^([ \t]*)(return |\w+ = )(?:ccxt\.)?SafeStringPtr\(this\.Json\(/;

// index just after the `)` matching the `(` at `open`, skipping Go string/rune/raw-string literals
function closeOf (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === '\'') {
            for (i++; i < text.length && text[i] !== c; i++) { if (text[i] === '\\') { i++; } }
        } else if (c === '`') {
            i = text.indexOf ('`', i + 1);
            if (i < 0) { return -1; }
        } else if (c === '(') {
            depth++;
        } else if (c === ')') {
            depth--;
            if (depth === 0) { return i + 1; }
        }
    }
    return -1;
}

function rewriteFunc (fn: string): string {
    if (fn.indexOf ('SafeStringPtr(this.Json(') < 0 || /\bjsonText\d*\b/.test (fn)) { return fn; }
    let out = '';
    let at = 0;
    let n = 0;
    while (at < fn.length) {
        const nl = fn.indexOf ('\n', at);
        const lineEnd = nl < 0 ? fn.length : nl;
        const m = CALL.exec (fn.slice (at, lineEnd));
        if (m) {
            const wrapOpen = at + m[0].indexOf ('SafeStringPtr(') + 'SafeStringPtr'.length;
            const jsonOpen = wrapOpen + 1 + 'this.Json'.length;
            const jsonEnd = closeOf (fn, jsonOpen);
            const wrapEnd = jsonEnd < 0 ? -1 : closeOf (fn, wrapOpen);
            // the Json call must be the whole argument, and the statement must end with the wrapper
            if (jsonEnd > 0 && wrapEnd === jsonEnd + 1 && fn.slice (jsonEnd, wrapEnd) === ')' && (fn[wrapEnd] === '\n' || wrapEnd === fn.length)) {
                const name = ++n === 1 ? 'jsonText' : 'jsonText' + n;
                const call = fn.slice (wrapOpen + 1, jsonEnd);
                const target = m[2] === 'return ' ? 'return' : m[2].slice (0, -3);
                out += m[1] + name + ' := ' + call + '\n' + m[1] + (target === 'return' ? 'return &' + name : target + ' = &' + name);
                at = wrapEnd;
                continue;
            }
        }
        out += fn.slice (at, nl < 0 ? fn.length : nl + 1);
        at = nl < 0 ? fn.length : nl + 1;
    }
    return out;
}

export function hx11w8JsonString (content: string): string {
    if ((content.indexOf ('SafeStringPtr(this.Json(') < 0) || (content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0)) { return content; }
    return content.split (/^(?=func )/m).map ((p) => (p.startsWith ('func ') ? rewriteFunc (p) : p)).join ('');
}

export function hx11w8JsonStringCheck (): string[] {
    const problems: string[] = [];
    const gen = '// IT IS GENERATED AND WILL BE OVERWRITTEN\n';
    const fn = (body: string) => gen + 'func (this *X) f() any {\n' + body + '\treturn nil\n}\n';
    const run = (body: string) => hx11w8JsonString (fn (body));
    const a = run ('\tvar b *string = nil\n\tb = SafeStringPtr(this.Json(q))\n');
    if (!a.includes ('\tjsonText := this.Json(q)\n\tb = &jsonText\n') || a.includes ('SafeStringPtr')) { problems.push ('hx11w8-json-string: plain assign: ' + a); }
    const p = run ('\tb = ccxt.SafeStringPtr(this.Json(map[string]any{\n\t\t"k": "a)",\n\t}))\n');
    if (!p.includes ('jsonText := this.Json(map[string]any{\n\t\t"k": "a)",\n\t})\n\tb = &jsonText\n')) { problems.push ('hx11w8-json-string: multi-line: ' + p); }
    const r = run ('\tx := func() *string {\n\t\treturn SafeStringPtr(this.Json(q))\n\t}()\n');
    if (!r.includes ('\t\tjsonText := this.Json(q)\n\t\treturn &jsonText\n')) { problems.push ('hx11w8-json-string: return: ' + r); }
    const two = run ('\tb = SafeStringPtr(this.Json(q))\n\tc = SafeStringPtr(this.Json(r))\n');
    if (!two.includes ('jsonText2 := this.Json(r)\n\tc = &jsonText2')) { problems.push ('hx11w8-json-string: second local: ' + two); }
    for (const keep of [ '\tb = SafeStringPtr(this.Json(q) + "x")\n', '\tb = SafeStringPtr(this.Hmac(q))\n', '\tb = SafeStringPtr(this.Json(q)) + "x"\n', '\tjsonText := 1\n\tb = SafeStringPtr(this.Json(q))\n' ]) {
        if (!run (keep).includes ('SafeStringPtr(')) { problems.push ('hx11w8-json-string: rewrote ' + keep); }
    }
    return problems;
}
