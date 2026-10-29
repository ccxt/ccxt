// HX11 w8 java parseFloat/parseInt: Helpers.parseInt/parseFloat take Object; when the operand is
// provably a java.lang.String the typed twin io.github.ccxt.base.JsParse (same bodies, String
// parameter) is called instead. Proof: a String-declared name bound once in the method, its
// `((String)name)` cast, or `(name == null ? null : ((String)name).replaceFirst(..))`.

const CALL = /Helpers\.(parseInt|parseFloat)\(/g;
const METHOD = /^    (?:public|private|protected) /gm;
const DECL = (name: string) => new RegExp ('(?:^|[\\s(,;{])(?:final\\s+)?([A-Za-z_][\\w.<>?, \\[\\]]*?)\\s+' + name + '\\s*(?==|;|,|\\)|:)', 'gm');
export const HX11W8_JSPARSE_IMPORT = 'io.github.ccxt.base.JsParse';

function closeOf (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            for (i++; i < text.length && text[i] !== '"'; i++) { if (text[i] === '\\') { i++; } }
        } else if (c === '(') {
            depth++;
        } else if (c === ')') {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return -1;
}

function stringBoundOnce (content: string, at: number, name: string): boolean {
    let start = 0;
    let end = content.length;
    METHOD.lastIndex = 0;
    for (let m = METHOD.exec (content); m !== null; m = METHOD.exec (content)) {
        if (m.index <= at) { start = m.index; } else { end = m.index; break; }
    }
    const body = content.slice (start, end);
    const re = DECL (name);
    const types: string[] = [];
    for (let m = re.exec (body); m !== null; m = re.exec (body)) {
        if (!/^(return|else|new|throw|case)$/.test (m[1])) { types.push (m[1]); }
    }
    return types.length === 1 && types[0] === 'String';
}

function stringOperand (content: string, at: number, arg: string): boolean {
    const a = arg.trim ();
    let m = /^[A-Za-z_]\w*$/.exec (a);
    if (m !== null) { return stringBoundOnce (content, at, a); }
    if (/^\(\(String\)[A-Za-z_]\w*\)$/.test (a)) { return true; } // a cast prints as String whatever the operand was
    m = /^\(([A-Za-z_]\w*) == null \? null : \(\(String\)\1\)\.replaceFirst\([^()]*\([^()]*\)[^()]*\)\)$/.exec (a)
        ?? /^\(([A-Za-z_]\w*) == null \? null : \(\(String\)\1\)\.replaceFirst\([^()]*\)\)$/.exec (a);
    return m !== null && stringBoundOnce (content, at, m[1]);
}

export function hx11w8JavaParseTyped (content: string): string {
    if (content.indexOf ('Helpers.parse') < 0) { return content; }
    let out = content;
    let used = false;
    const hits: Array<[number, string]> = [];
    CALL.lastIndex = 0;
    for (let m = CALL.exec (out); m !== null; m = CALL.exec (out)) {
        if (m.index > 0 && /[\w.]/.test (out[m.index - 1])) { continue; }
        hits.push ([ m.index, m[1] ]);
    }
    for (const [ at, fn ] of hits.reverse ()) {
        const open = at + 'Helpers.'.length + fn.length;
        const close = closeOf (out, open);
        if (close < 0) { continue; }
        const arg = out.slice (open + 1, close);
        if (!stringOperand (out, at, arg)) { continue; }
        out = out.slice (0, at) + 'JsParse.' + out.slice (at + 'Helpers.'.length);
        used = true;
    }
    return used ? out : content;
}

export function hx11w8JavaParseSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (b: string) => 'import a.B;\npublic class W\n{\n    public Object m(Object p)\n    {\n' + b + '\n    }\n}\n';
    const yes = (b: string, label: string) => { if (!hx11w8JavaParseTyped (cls (b)).includes ('JsParse.')) { problems.push ('hx11w8 parse: ' + label); } };
    const no = (b: string, label: string) => { if (hx11w8JavaParseTyped (cls (b)) !== cls (b)) { problems.push ('hx11w8 parse: ' + label); } };
    yes ('        String s = this.x();\n        Object r = Helpers.parseInt(s);', 'String local');
    yes ('        Object r = Helpers.parseFloat(((String)p));', 'String cast');
    no ('        Object s = this.x();\n        Object r = Helpers.parseInt(s);', 'Object local');
    no ('        Object r = Helpers.parseInt(p);', 'Object param');
    no ('        String s = "1";\n        s = "2";\n        Object s2 = 1;\n        Object r = Helpers.parseInt(s2);', 'other local');
    return problems;
}
