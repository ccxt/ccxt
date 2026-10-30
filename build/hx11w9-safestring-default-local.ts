// HX11 w9 printer-go-safestring-default-string-local: `var x *string = this.SafeString(.., "lit")` never
// answers nil (exchange_safe.go: the literal default is returned), so a func-local that is never rebound
// and is only read as `*x`, `x != nil && *x`, `x == nil || *x`, an Add() operand, or rewritten by a literal
// SafeStringPtr / defaulted SafeString write is a plain `string`: `var x string = *this.SafeString(..)`.

const DECL = /^([ \t]*)var (\w+) \*string = (this\.SafeString(?:Lower|Upper)?\((?:[^(),]|\([^()]*\))+, (?:[^(),]|\([^()]*\))+, "(?:[^"\\\n]|\\.)*"\))([ \t]*\/\/.*)?$/gm;

// same-length twin of the Go text with string/rune/raw literals and comments blanked
function mask (s: string): string {
    const out = s.split ('');
    let i = 0;
    const blank = (a: number, b: number) => { for (let k = a; k < b; k++) { if (out[k] !== '\n') { out[k] = ' '; } } };
    while (i < s.length) {
        const c = s[i];
        if (c === '/' && s[i + 1] === '/') { const e = s.indexOf ('\n', i); const end = e < 0 ? s.length : e; blank (i, end); i = end; continue; }
        if (c === '/' && s[i + 1] === '*') { const e = s.indexOf ('*/', i + 2); const end = e < 0 ? s.length : e + 2; blank (i, end); i = end; continue; }
        if (c === '`') { const e = s.indexOf ('`', i + 1); const end = e < 0 ? s.length : e + 1; blank (i + 1, end - 1); i = end; continue; }
        if (c === '"' || c === '\'') {
            let j = i + 1;
            while (j < s.length && s[j] !== c && s[j] !== '\n') { if (s[j] === '\\') { j++; } j++; }
            blank (i + 1, j);
            i = j + 1;
            continue;
        }
        i++;
    }
    return out.join ('');
}

// index of the `(` that opens the innermost call enclosing offset `at` in `m`, or -1
function openerOf (m: string, at: number): number {
    let depth = 0;
    for (let k = at - 1; k >= 0; k--) {
        const c = m[k];
        if (c === ')' || c === ']' || c === '}') { depth++; } else if (c === '(' || c === '[' || c === '{') { if (depth === 0) { return k; } depth--; }
        if (c === '\n' && depth === 0) { return -1; }
    }
    return -1;
}

function rewriteFunc (fn: string): string {
    if (fn.indexOf (' *string = this.SafeString') < 0) { return fn; }
    const m = mask (fn);
    const brace = m.indexOf ('{\n');
    const signature = m.slice (0, brace < 0 ? m.length : brace);
    const names = new Set<string> ();
    for (const d of fn.matchAll (DECL)) { names.add (d[2]); }
    let out = fn;
    for (const name of names) {
        const mm = mask (out);
        const w = '(?<![\\w.])' + name + '(?!\\w)';
        const decls = [ ...out.matchAll (new RegExp (DECL.source, 'gm')) ].filter ((d) => d[2] === name);
        if (decls.length !== 1) { continue; }
        if ((mm.match (new RegExp ('\\bvar ' + name + '\\b', 'g')) ?? []).length !== 1) { continue; }
        const rebind = new RegExp ('(?<![\\w.])' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + name + '\\s*(?:,\\s*\\w+\\s*)*:=|&' + name + '\\b|\\bfunc\\b[^{\\n]*[(,]\\s*' + name + ' |\\brange\\b[^\\n]*\\b' + name + '\\b|\\b' + name + '\\s*(?:\\+\\+|--|[-+*/|&]=)');
        if (rebind.test (mm) || new RegExp ('[(,]\\s*' + name + ' ').test (signature)) { continue; }
        if (new RegExp ('^(?:var|const|func) ' + name + '\\b', 'm').test (mm)) { continue; }
        const declAt = decls[0].index as number;
        const declEnd = declAt + decls[0][0].length;
        const edits: { a: number, b: number, text: string }[] = [];
        let ok = true;
        let adds = 0;
        // `x != nil && *x` / `x == nil || *x`: the test is a known constant, the pair is the string x
        const consumed: number[][] = [];
        for (const t of mm.matchAll (new RegExp (w + ' (!=|==) nil (&&|\\|\\|) \\*' + name + '(?!\\w)', 'g'))) {
            if (t[1] === (t[2] === '&&' ? '!=' : '==')) {
                edits.push ({ a: t.index as number, b: (t.index as number) + t[0].length, text: name });
                consumed.push ([ t.index as number, (t.index as number) + t[0].length ]);
            }
        }
        for (const u of mm.matchAll (new RegExp (w, 'g'))) {
            const at = u.index as number;
            const end = at + name.length;
            if (at >= declAt && end <= declEnd) { continue; }
            if (consumed.some ((c) => at >= c[0] && end <= c[1])) { continue; }
            const before = mm.slice (0, at);
            const after = mm.slice (end);
            const lineStart = before.lastIndexOf ('\n') + 1;
            const lineEnd = end + (after.indexOf ('\n') < 0 ? after.length : after.indexOf ('\n'));
            const line = mm.slice (lineStart, lineEnd);
            // `*x` (a deref, not a product)
            if (/\*\s*$/.test (before) && !/[\w)\]]\s*\*\s*$/.test (before)) {
                const star = before.lastIndexOf ('*');
                edits.push ({ a: star, b: end, text: name });
                continue;
            }
            // the write `x = SafeStringPtr("lit")` / `x = this.SafeString(.., lit)`
            const lhs = /^[ \t]*$/.test (before.slice (lineStart)) && /^\s*=\s/.test (after);
            if (lhs) {
                const rhs = out.slice (end + after.match (/^\s*=\s*/)![0].length, lineEnd);
                const lit = /^(?:ccxt\.)?SafeStringPtr\(("(?:[^"\\\n]|\\.)*")\)\s*(\/\/.*)?$/.exec (rhs);
                if (lit !== null) {
                    const eq = end + after.match (/^\s*=\s*/)![0].length;
                    edits.push ({ a: eq, b: eq + rhs.length, text: lit[1] + (lit[2] ? ' ' + lit[2] : '') });
                    continue;
                }
                const dflt = new RegExp ('^(this\\.SafeString(?:Lower|Upper)?\\((?:[^(),]|\\([^()]*\\))+, (?:[^(),]|\\([^()]*\\))+, (?:"(?:[^"\\\\\\n]|\\\\.)*"|' + name + ')\\))\\s*(\\/\\/.*)?$').exec (rhs);
                if (dflt !== null) {
                    const eq = end + after.match (/^\s*=\s*/)![0].length;
                    edits.push ({ a: eq, b: eq, text: '*' });
                    continue;
                }
                ok = false;
                break;
            }
            // the default slot of that defaulted write
            if (/^\s*=\s/.test (before.slice (lineStart).replace (/^[ \t]*\w+/, '')) && /^[ \t]*\w+\s*=\s*this\.SafeString/.test (line) && /^\s*\)\s*(\/\/.*)?$/.test (after.split ('\n')[0]) && /,\s*$/.test (before)) {
                continue;
            }
            // an Add() operand: Add keeps its any-typed parameters
            const op = openerOf (mm, at);
            if (op >= 0 && mm[op] === '(' && /(?<![\w.])(?:ccxt\.)?Add$/.test (mm.slice (0, op)) && /^\s*[,)]/.test (after) && /[(,]\s*$/.test (before)) {
                adds++;
                continue;
            }
            ok = false;
            break;
        }
        if (!ok || (edits.length === 0 && adds === 0)) { continue; }
        edits.sort ((p, q) => q.a - p.a);
        let next = out;
        for (const e of edits) { next = next.slice (0, e.a) + e.text + next.slice (e.b); }
        // the declaration (offsets before every edit are unchanged)
        const d = new RegExp ('^([ \\t]*var ' + name + ' )\\*string( = )(this\\.SafeString)', 'm');
        next = next.replace (d, '$1string$2*$3');
        out = next;
    }
    return out;
}

export function hx11w9SafeStringDefaultLocals (content: string): string {
    if ((content.indexOf (' *string = this.SafeString') < 0) || (content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0)) { return content; }
    return content.split (/^(?=func )/m).map ((p) => (p.startsWith ('func ') ? rewriteFunc (p) : p)).join ('');
}

export function hx11w9SafeStringDefaultLocalsCheck (): string[] {
    const problems: string[] = [];
    const gen = '// IT IS GENERATED AND WILL BE OVERWRITTEN\n';
    const run = (body: string) => hx11w9SafeStringDefaultLocals (gen + 'func (this *X) f(p any) any {\n' + body + '\treturn nil\n}\n');
    const decl = '\tvar m *string = this.SafeString(p, "k", "d")\n';
    const a = run (decl + '\tif m != nil && *m == "a" {\n\t}\n\tif m == nil || *m != "b" {\n\t}\n\tvar u string = *m + "x"\n');
    if (!a.includes ('var m string = *this.SafeString(p, "k", "d")') || !a.includes ('if m == "a" {') || !a.includes ('if m != "b" {') || !a.includes ('= m + "x"')) { problems.push ('hx11w9-safestring: deref reads: ' + a); }
    const w = run (decl + '\tm = SafeStringPtr("z")\n\tm = this.SafeString(q, "j", m)\n\tvar u string = *m\n');
    if (!w.includes ('\tm = "z"\n') || !w.includes ('m = *this.SafeString(q, "j", m)') || w.includes ('SafeStringPtr')) { problems.push ('hx11w9-safestring: writes: ' + w); }
    const add = run (decl + '\tvar r any = Add(m, "x")\n');
    if (!add.includes ('var m string') || !add.includes ('Add(m, "x")')) { problems.push ('hx11w9-safestring: add operand: ' + add); }
    for (const keep of [
        decl + '\treturn m\n',
        decl + '\tif m == nil {\n\t}\n',
        decl + '\tvar r map[string]any = map[string]any{\n\t\t"k": m,\n\t}\n',
        decl + '\tm = this.SafeString(q, "j")\n',
        decl + '\tm = SafeStringPtr(n)\n',
        decl + '\tthis.F(m)\n',
        decl + '\tp := &m\n',
        decl + '\tm := "x"\n',
    ]) {
        if (!run (keep).includes ('var m *string')) { problems.push ('hx11w9-safestring: retyped ' + keep); }
    }
    return problems;
}
