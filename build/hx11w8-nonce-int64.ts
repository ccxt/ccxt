// hx11 w8 m172: Nonce() is int64 end to end in Go (interface, base, every venue override).
// The printer emits `func (this *X) Nonce() any`, so every `ToString(this.Nonce())` kept the helper
// and every `return this.Sum(..)` boxed. A def is retyped only when each function-level return is
// provably int64: the hand-written clock methods, int literals, `var x int64` locals, `*x` of a
// `var x *int64` local, `*this.SafeInteger(o, "k", <int literal>)` (a literal default is never
// nil) and + - * over those. Anything else throws, because the interfaces pin one signature.

const CLOCK = /^this\.(?:Milliseconds|Seconds|Microseconds)\(\)/;
const SAFE_INT = /^\*this\.SafeInteger\(this\.Options, "[\w]+", -?\d+\)/;
const INT_LIT = /^\d+(?![\w.])/;
const IDENT = /^[A-Za-z_]\w*/;

// parses `expr` (a Go expression) and answers true when every operand is an int64 operand
function int64Expr (expr: string, body: string): boolean {
    let i = 0;
    const text = expr.trim ();
    const skip = () => { while (text[i] === ' ') { i++; } };
    const declared = (name: string, type: string): boolean => {
        const decls = body.match (new RegExp ('\\bvar ' + name + ' ', 'g')) || [];
        return (decls.length === 1) && new RegExp ('\\n\\t+var ' + name + ' ' + type.replace ('*', '\\*') + ' = ').test (body);
    };
    const primary = (): boolean => {
        skip ();
        if (text[i] === '(') {
            i++;
            if (!sum ()) { return false; }
            skip ();
            if (text[i] !== ')') { return false; }
            i++;
            return true;
        }
        const rest = text.substring (i);
        for (const re of [ CLOCK, SAFE_INT, INT_LIT ]) {
            const m = re.exec (rest);
            if (m !== null) {
                i += m[0].length;
                return true;
            }
        }
        if (text[i] === '*') {
            const name = IDENT.exec (text.substring (i + 1));
            if ((name !== null) && declared (name[0], '*int64')) {
                i += 1 + name[0].length;
                return true;
            }
            return false;
        }
        const name = IDENT.exec (rest);
        if ((name !== null) && declared (name[0], 'int64')) {
            i += name[0].length;
            return true;
        }
        return false;
    };
    const product = (): boolean => {
        if (!primary ()) { return false; }
        skip ();
        while (text[i] === '*') {
            i++;
            if (!primary ()) { return false; }
            skip ();
        }
        return true;
    };
    const sum = (): boolean => {
        if (!product ()) { return false; }
        skip ();
        while ((text[i] === '+') || (text[i] === '-')) {
            i++;
            if (!product ()) { return false; }
            skip ();
        }
        return true;
    };
    return sum () && (i === text.length);
}


// `this.Sum(a, b)` -> [a, b] when the call spans the whole expression and has two top-level arguments
function sumOperands (expr: string): string[] | undefined {
    const m = /^this\.Sum\((.*)\)$/.exec (expr.trim ());
    if (m === null) {
        return undefined;
    }
    let depth = 0;
    let cut = -1;
    for (let i = 0; i < m[1].length; i++) {
        const c = m[1][i];
        if ((c === '(') || (c === '[') || (c === '{')) { depth++; } else if ((c === ')') || (c === ']') || (c === '}')) { depth--; if (depth < 0) { return undefined; } } else if ((c === ',') && (depth === 0)) {
            if (cut >= 0) { return undefined; }
            cut = i;
        } else if (c === '"') { return undefined; }
    }
    return (cut < 0) ? undefined : [ m[1].substring (0, cut).trim (), m[1].substring (cut + 1).trim () ];
}

export function hx11w8NonceInt64 (content: string): string {
    const head = /\nfunc \(this \*(\w+)\) Nonce\(\) any \{\n/g;
    let out = '';
    let cursor = 0;
    for (let m = head.exec (content); m !== null; m = head.exec (content)) {
        const open = m.index + m[0].length - 1;
        const close = content.indexOf ('\n}\n', open);
        if (close < 0) {
            throw new Error ('hx11w8NonceInt64: cannot scan ' + m[1] + '.Nonce');
        }
        let body = content.substring (open, close + 1);
        if (/\bfunc\b/.test (body)) {
            throw new Error ('hx11w8NonceInt64: ' + m[1] + '.Nonce has a func literal');
        }
        const returns = body.split ('\n').filter ((l) => /^\t+return /.test (l)).map ((l) => l.replace (/^\t+return /, ''));
        if (!returns.length) {
            throw new Error ('hx11w8NonceInt64: ' + m[1] + '.Nonce has no return');
        }
        let newBody = body;
        for (const r of returns) {
            // Sum of two int64 operands is their int64 sum (Add on two int64 stays int64)
            const parts = sumOperands (r);
            if (parts !== undefined && int64Expr (parts[0], body) && int64Expr (parts[1], body)) {
                newBody = newBody.replace ('return ' + r, 'return ' + parts[0] + ' + ' + parts[1]);
            } else if (!int64Expr (r, body)) {
                throw new Error ('hx11w8NonceInt64: ' + m[1] + '.Nonce returns unproven `' + r + '`');
            }
        }
        body = newBody;
        out += content.substring (cursor, m.index) + m[0].replace (' any {\n', ' int64 {\n') + body.substring (1);
        cursor = close + 1;
    }
    return out + content.substring (cursor);
}

export function hx11w8NonceInt64Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11w8 nonce: ' + msg); } };
    const fn = (body: string) => 'package ccxt\n\nfunc (this *X) Nonce() any {\n' + body + '}\n';
    const throws = (text: string) => { try { hx11w8NonceInt64 (text); return false; } catch (e) { return true; } };
    ok (hx11w8NonceInt64 (fn ('\treturn this.Milliseconds()\n')).includes ('Nonce() int64 {'), 'clock');
    ok (hx11w8NonceInt64 (fn ('\treturn this.Milliseconds() - *this.SafeInteger(this.Options, "timeDifference", 0)\n')).includes ('Nonce() int64 {'), 'literal default');
    ok (hx11w8NonceInt64 (fn ('\tvar d *int64 = this.SafeInteger(this.Options, "timeDifference")\n\tif d == nil {\n\t\tpanic(1)\n\t}\n\treturn this.Milliseconds() - *d\n')).includes ('Nonce() int64 {'), 'guarded pointer local');
    ok (hx11w8NonceInt64 (fn ('\tvar c int64 = *this.SafeInteger(this.Options, "c", 0)\n\tvar t int64 = c * 1000000\n\treturn (this.Microseconds() * 1000) + t\n')).includes ('Nonce() int64 {'), 'int64 locals');
    ok (hx11w8NonceInt64 (fn ('\tvar m *string = this.SafeString(this.Options, "nonce", "milliseconds")\n\tif m != nil && *m == "milliseconds" {\n\t\treturn this.Milliseconds()\n\t}\n\treturn this.Seconds()\n')).includes ('Nonce() int64 {'), 'two arms');
    ok (hx11w8NonceInt64 (fn ('\tvar t int64 = 5\n\treturn this.Sum(this.Microseconds()*1000, t)\n')).includes ('return this.Microseconds()*1000 + t'), 'Sum of int64 operands is +' );
    ok (throws (fn ('\treturn this.Sum(this.Milliseconds(), x)\n')), 'Sum with an unproven operand throws');
    ok (throws (fn ('\treturn this.Milliseconds() - *this.SafeInteger(this.Options, "k")\n')), 'nullable default is unproven');
    ok (throws (fn ('\tvar d any = 1\n\treturn d\n')), 'any local is unproven');
    ok (throws (fn ('\treturn this.Milliseconds() / 2\n')), 'division is unproven');
    ok (hx11w8NonceInt64 (fn ('\treturn 1\n') + 'func (this *X) Other() any {\n\treturn nil\n}\n').includes ('Other() any {'), 'other methods untouched');
    ok (hx11w8NonceInt64 (hx11w8NonceInt64 (fn ('\treturn this.Seconds()\n'))).includes ('Nonce() int64 {'), 'idempotent');
    return problems;
}

// A `var n any = this.Nonce()` / `this.IncrementingNonce()` local is an int64 (see above). It is retyped when the
// function declares it once, never rewrites it, and no use needs an interface box (nil test, assertion, address).
const NONCE_LOCAL = /^(\t+)var (\w+) any = this\.(?:Incrementing)?Nonce\(\)(?= *(?:\/\/.*)?$)/;

function nonceLocalSafe (name: string, lines: string[], declAt: number): boolean {
    const id = '\\b' + name + '\\b';
    const rewrite = new RegExp ('^\\s*(?:[\\w.\\[\\]*]+\\s*,\\s*)*' + name + '\\s*(?:,[^=]*)?(?::=|=[^=]|[-+*/%]=|\\+\\+|--)');
    const forms = [
        new RegExp (id + '\\s*[!=]=\\s*nil'), new RegExp ('nil\\s*[!=]=\\s*' + name + '\\b'), new RegExp ('IsEqual\\(' + name + ', nil\\)'),
        new RegExp (id + '\\.\\('), new RegExp ('&' + name + '\\b'), new RegExp (',\\s*' + name + '\\s*(?::=|=[^=])'),
        new RegExp ('\\bfor\\b[^\\n]*' + id), new RegExp ('\\*' + name + '\\b'),
    ];
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (i === declAt) {
            continue;
        }
        if (new RegExp (id).test (l) && (rewrite.test (l) || forms.some ((f) => f.test (l)) || new RegExp ('\\bvar ' + name + '\\b').test (l))) {
            return false;
        }
    }
    return true;
}

export function hx11w8NonceLocals (content: string): string {
    const parts = content.split (/(?=\nfunc )/);
    return parts.map ((fn) => {
        if (!/ any = this\.(?:Incrementing)?Nonce\(\)/.test (fn)) {
            return fn;
        }
        const lines = fn.split ('\n');
        for (let i = 0; i < lines.length; i++) {
            const m = NONCE_LOCAL.exec (lines[i]);
            if (m !== null && nonceLocalSafe (m[2], lines, i)) {
                lines[i] = lines[i].replace ('var ' + m[2] + ' any =', 'var ' + m[2] + ' int64 =');
            }
        }
        return lines.join ('\n');
    }).join ('');
}

export function hx11w8NonceLocalsCheck (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx11w8 nonce locals: ' + msg); } };
    const fn = (body: string) => '\nfunc (this *X) F() any {\n\tvar nonce any = this.IncrementingNonce()\n' + body + '}\n';
    const typed = (body: string) => hx11w8NonceLocals (fn (body)).includes ('var nonce int64 = ');
    ok (typed ('\tvar r any = ToString(nonce)\n\treturn map[string]any{"n": nonce, "m": Add(nonce, 1)}\n'), 'plain uses are retyped');
    ok (!typed ('\tnonce = this.Foo()\n\treturn nonce\n'), 'a rewrite keeps any');
    ok (!typed ('\tif nonce == nil {\n\t\treturn nil\n\t}\n'), 'a nil test keeps any');
    ok (!typed ('\tif IsEqual(nonce, nil) {\n\t\treturn nil\n\t}\n'), 'IsEqual nil keeps any');
    ok (!typed ('\tn := nonce.(int64)\n\treturn n\n'), 'an assertion keeps any');
    ok (!typed ('\tfor nonce := 0; nonce < 2; nonce++ {\n\t}\n'), 'a loop var keeps any');
    ok (!typed ('\tnonce, ok := f()\n'), 'a tuple write keeps any');
    ok (hx11w8NonceLocals (hx11w8NonceLocals (fn ('\treturn nonce\n'))) === hx11w8NonceLocals (fn ('\treturn nonce\n')), 'idempotent');
    return problems;
}
