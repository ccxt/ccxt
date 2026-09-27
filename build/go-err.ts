// ===== G10K-err-a: errors as values in generated Go =====
// Async results travel as AsyncResult[any]{Value, Err} (EndpointResult[T] keeps Raw); every await becomes
// `r := <-X` + `if r.Err != nil { panic(r.Err) }` + r.Value, typed wrappers return r.Err. Runs last on generated text.
import { goChanMask } from './go-chan.js';

export type GoErrStats = { [reason: string]: number };

function goErrQual (content: string): string {
    return /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
}

function goErrBump (stats: GoErrStats | undefined, reason: string) {
    if (stats !== undefined) {
        stats[reason] = (stats[reason] || 0) + 1;
    }
}

// index just past the bracket matching masked[open]
function goErrClose (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '{') || (c === '[')) {
            depth++;
        } else if ((c === ')') || (c === '}') || (c === ']')) {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
    }
    return -1;
}

// end (exclusive, trailing blanks trimmed) of the statement starting at `start`: the first newline at depth 0
function goErrExprEnd (masked: string, start: number): number {
    let depth = 0;
    let i = start;
    for (; i < masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '{') || (c === '[')) {
            depth++;
        } else if ((c === ')') || (c === '}') || (c === ']')) {
            depth--;
        } else if ((c === '\n') && (depth <= 0)) {
            break;
        }
    }
    while ((i > start) && /\s/.test (masked[i - 1])) {
        i--;
    }
    return i;
}

// the received operand: a selector chain of calls / type assertions ending in a call; end index or -1
function goErrOperandEnd (masked: string, start: number): number {
    let i = start;
    for (;;) {
        const id = /^[A-Za-z_]\w*/.exec (masked.substring (i, i + 200));
        if (id === null) {
            return -1;
        }
        i += id[0].length;
        for (;;) {
            if (masked[i] === '(') {
                i = goErrClose (masked, i);
            } else if (masked.startsWith ('.(', i)) {
                i = goErrClose (masked, i + 1);
            } else {
                break;
            }
            if (i < 0) {
                return -1;
            }
        }
        if ((masked[i] === '.') && /[A-Za-z_]/.test (masked[i + 1] || '')) {
            i++;
            continue;
        }
        return (masked[i - 1] === ')') ? i : -1;
    }
}

// Sleep / Throttle / tests' Close (`<-chan bool`) and GetTestFiles (`<-chan map[string]any`) carry no error
function goErrUncheckedCallee (operand: string): boolean {
    return /^(?:(?:this|exchange|this\.Exchange|this\.BaseExchange|this\.base)\.(?:Sleep|Throttle)|(?:ccxt\.)?(?:Close|GetTestFiles))\(/.test (operand);
}

function goErrFreshName (fn: string): string {
    for (let k = 0; ; k++) {
        const name = (k === 0) ? 'r' : ('r' + k);
        if (!new RegExp ('\\b' + name + '\\b').test (fn)) {
            return name;
        }
    }
}

// true when `at` is a statement position: the innermost open bracket before it is a block `{`
function goErrStatementStart (masked: string, at: number): boolean {
    const stack: string[] = [ 'B' ];
    for (let i = 0; i < at; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[')) {
            stack.push (c);
        } else if (c === '{') {
            stack.push (((masked[i - 1] === ' ') && (masked[i + 1] === '\n')) ? 'B' : 'C');
        } else if ((c === ')') || (c === ']') || (c === '}')) {
            stack.pop ();
        }
    }
    return stack[stack.length - 1] === 'B';
}

// what is evaluated before the receive inside its statement: names, literals, field reads and the openings
// of calls enclosing the receive (those calls run after it), so hoisting keeps the evaluation order
function goErrSafePrefix (prefix: string): boolean {
    const head = /^\t*(?:var \w+ [^=\n]+ = |[\w.]+(?:\[[\w." ]+\])*(?:, [\w.]+)* :?= |\w+ <- |return |)/.exec (prefix) as RegExpExecArray;
    const rest = prefix.substring (head[0].length);
    if (/^(?:if|for|switch|case|else|go|defer|select|func|var)\b/.test (rest.trim ()) || /^\t*\}/.test (prefix)) {
        return false;
    }
    return /^[\w. ,(!]*$/.test (rest);
}

// typed wrappers: `raw := <-X` / IsError(raw) -> `r := <-X` / r.Err; EndpointResult wrappers keep r.Raw
function goErrWrappers (content: string): string {
    const plain = /^(\t+)raw := <-([^\n]+)\n\1if (?:ccxt\.)?IsError\(raw\) \{\n\1\treturn ([^\n]+), (?:ccxt\.)?CreateReturnError\(raw\)\n\1\}\n/gm;
    let out = '';
    let cursor = 0;
    for (let m = plain.exec (content); m !== null; m = plain.exec (content)) {
        const fnStart = content.lastIndexOf ('\nfunc ', m.index) + 1;
        const fnEnd = content.indexOf ('\n}\n', m.index);
        const name = goErrFreshName (content.substring (fnStart, fnEnd));
        const tail = content.substring (m.index + m[0].length, fnEnd).replace (/\braw\b/g, name + '.Value');
        out += content.substring (cursor, m.index) + m[1] + name + ' := <-' + m[2] + '\n' + m[1] + 'if ' + name + '.Err != nil {\n' + m[1] + '\treturn ' + m[3] + ', ' + name + '.Err\n' + m[1] + '}\n' + tail;
        cursor = fnEnd;
        plain.lastIndex = fnEnd;
    }
    content = out + content.substring (cursor);
    return content.replace (/^(\t+)(\w+) := <-([^\n]+)\n\1if (?:ccxt\.)?IsError\(\2\.Raw\) \{\n\1\treturn ([^\n]+), (?:ccxt\.)?CreateReturnError\(\2\.Raw\)\n\1\}\n/gm,
        (_m: string, ind: string, n: string, call: string, zero: string) => ind + n + ' := <-' + call + '\n' + ind + 'if ' + n + '.Err != nil {\n' + ind + '\treturn ' + zero + ', ' + n + '.Err\n' + ind + '}\n');
}

// `listEp := (<-X)` + `PanicOnError(listEp.Raw)`: the holder is the result itself
function goErrListHolders (content: string): string {
    return content.replace (/^(\t+)(\w+) := \(<-([^\n]+)\)\n\1(?:ccxt\.)?PanicOnError\(\2\.Raw\)\n/gm,
        (_m: string, ind: string, n: string, call: string) => ind + n + ' := <-' + call + '\n' + ind + 'if ' + n + '.Err != nil {\n' + ind + '\tpanic(' + n + '.Err)\n' + ind + '}\n');
}

// the first receive arrow at/after `from` (a send's arrow follows an operand, a receive's does not)
function goErrNextReceive (masked: string, from: number): number {
    for (let p = masked.indexOf ('<-', from); p >= 0; p = masked.indexOf ('<-', p + 2)) {
        const before = masked.substring (0, p).replace (/[ \t]+$/, '');
        const prev = before[before.length - 1];
        if (((prev !== undefined) && /[\w)\]]/.test (prev)) || masked.startsWith ('<-chan', p)) {
            continue;
        }
        return p;
    }
    return -1;
}

// one top-level func: hoist every await it can, keep PanicOnError(RECV) where it cannot
function goErrFunc (fn: string, q: string, stats?: GoErrStats): string {
    let cursor = 0;
    for (;;) {
        const masked = goChanMask (fn);
        const p = goErrNextReceive (masked, cursor);
        if (p < 0) {
            return fn;
        }
        cursor = p + 2;
        let opStart = p + 2;
        while (masked[opStart] === ' ') {
            opStart++;
        }
        const opEnd = goErrOperandEnd (masked, opStart);
        if (opEnd < 0) {
            continue;
        }
        const operand = fn.substring (opStart, opEnd);
        const ls = masked.lastIndexOf ('\n', p) + 1;
        const nl = masked.indexOf ('\n', opEnd);
        const le = (nl < 0) ? masked.length : nl;
        const indent = (/^\t*/.exec (masked.substring (ls)) as RegExpExecArray)[0];
        // the receive expression: `(<-X)` or `<-X`, plus a `.Raw` / `.Value` / `.Checked()` selector
        let rs = p;
        let re = opEnd;
        if ((masked[p - 1] === '(') && !/[\w\]]/.test (masked[p - 2] || '') && (masked[opEnd] === ')')) {
            rs = p - 1;
            re = opEnd + 1;
        }
        const selM = /^\.(Raw|Value|Checked\(\))/.exec (masked.substring (re, re + 10));
        const sel = ((selM !== null) && (selM[1] === 'Raw')) ? 'Raw' : 'Value';
        if (selM !== null) {
            re += selM[0].length;
        }
        // an enclosing PanicOnError( ... )
        let ws = rs;
        let we = re;
        let wrapped = false;
        const wrapM = /(?:ccxt\.)?PanicOnError\($/.exec (masked.substring (ls, rs));
        if ((wrapM !== null) && (masked[re] === ')')) {
            ws = rs - wrapM[0].length;
            we = re + 1;
            wrapped = true;
        }
        const prefix = masked.substring (ls, ws);
        const stmtEnd = goErrExprEnd (masked, ls);
        const suffix = masked.substring (we, stmtEnd);
        // already in the hoisted shape
        const own = /^\t*(\w+) := $/.exec (masked.substring (ls, p));
        if ((own !== null) && (rs === p) && (re === opEnd) && masked.startsWith ('\n' + indent + 'if ' + own[1] + '.Err != nil {', le)) {
            continue;
        }
        if (goErrUncheckedCallee (operand)) {
            if (wrapped && /^\t*$/.test (prefix) && /^\s*$/.test (suffix)) {
                fn = fn.substring (0, ws) + '<-' + operand + fn.substring (we);
            }
            continue;
        }
        // forward of another async result: `ch <- <-X`
        if (!wrapped && /^\t*\w+ <- $/.test (prefix) && (rs === p) && (re === opEnd) && /^\s*$/.test (suffix)) {
            continue;
        }
        const atStatement = goErrStatementStart (masked, ls) && (masked.substring (ls, ls + indent.length) === indent);
        if (!(atStatement && goErrSafePrefix (prefix))) {
            // not hoistable: the runtime checks the struct in PanicOnError / Checked(), so the value is unchanged
            const recvText = '(<-' + operand + ')';
            let text: string;
            if (wrapped) {
                text = fn.substring (ws, rs) + recvText + ')';
            } else if ((selM !== null) && (selM[1] !== 'Raw')) {
                text = recvText + '.Checked()';
            } else if (selM !== null) {
                text = q + 'PanicOnError(' + recvText + ')';
            } else {
                // a bare receive handed on as a value (a promiseAll element): the AsyncResult itself travels on
                goErrBump (stats, 'handed-on');
                continue;
            }
            fn = fn.substring (0, ws) + text + fn.substring (we);
            cursor = ws + text.length;
            goErrBump (stats, 'kept:' + (!atStatement ? 'expression' : (/^\t*(?:if|for|switch|case|\} else if|go|defer)\b/.test (prefix) ? 'header' : 'order')));
            continue;
        }
        const name = goErrFreshName (fn);
        // a trailing comment of a dropped statement stays on the receive line
        const whole = /^\t*$/.test (prefix) && /^\s*$/.test (suffix);
        const lineEnd = (fn.indexOf ('\n', stmtEnd) < 0) ? fn.length : fn.indexOf ('\n', stmtEnd);
        const comment = whole ? fn.substring (stmtEnd, lineEnd).replace (/\s+$/, '') : '';
        const hoist = indent + name + ' := <-' + operand + comment + '\n' + indent + 'if ' + name + '.Err != nil {\n' + indent + '\tpanic(' + name + '.Err)\n' + indent + '}\n';
        let rest = fn.substring (ls, ws) + name + '.' + sel + fn.substring (we, stmtEnd);
        let restEnd = stmtEnd;
        if (whole) {
            rest = '';
            restEnd = Math.min (fn.length, lineEnd + 1);
        } else {
            // `x := RECV` + `PanicOnError(x)`: the check is the hoisted one
            const decl = /^\t*(?:var (\w+) [^=\n]+ = |(\w+) :?= )$/.exec (prefix);
            const target = (decl === null) ? undefined : (decl[1] || decl[2]);
            if ((target !== undefined) && !wrapped && /^\s*$/.test (suffix)) {
                const next = new RegExp ('^\\n\\t*(?:ccxt\\.)?PanicOnError\\(' + target + '\\)([ \\t]*//[^\\n]*)?[ \\t]*(?=\\n)').exec (fn.substring (stmtEnd));
                if (next !== null) {
                    restEnd = stmtEnd + next[0].length;
                    rest += (next[1] || '').replace (/\s+$/, '');
                }
            }
        }
        fn = fn.substring (0, ls) + hoist + rest + fn.substring (restEnd);
        // receives nested in the operand are visited next
        cursor = ls + indent.length + name.length + ' := <-'.length;
        goErrBump (stats, 'hoisted');
    }
}

// `PanicOnError(x)` on a local declared once with a type PanicOnError returns unchanged (never an error,
// string, []any or result struct) and never re-bound by `:=`: a no-op, dropped
function goErrNoOpChecks (fn: string, stats?: GoErrStats): string {
    return fn.replace (/^\t*(?:ccxt\.)?PanicOnError\((\w+)\)[ \t]*\n/gm, (line: string, name: string) => {
        const decls = fn.match (new RegExp ('(?:\\bvar ' + name + ' [^=\\n]+=|(?<![\\w.])' + name + '(?:, \\w+)* :=|, ' + name + ' :=|[(,] ?' + name + ' [\\w*\\[\\]]+)', 'g')) || [];
        const typed = new RegExp ('^var ' + name + ' (?:map\\[string\\]any|bool|int64|float64|\\*string|\\*int64|\\*float64|\\*bool) =$').test (decls[0] || '');
        if ((decls.length === 1) && typed) {
            goErrBump (stats, 'dropped:no-op');
            return '';
        }
        goErrBump (stats, 'kept:value-check');
        return line;
    });
}

// sends into an AsyncResult channel carry the value in Value
function goErrSends (fn: string, q: string): string {
    const masked = goChanMask (fn);
    const names = new Set<string> ();
    const decl = /(?:[(,] ?(\w+) chan |(\w+) := make\(chan )(?:any\b|interface\{\}|(?:ccxt\.)?AsyncResult\[any\])/g;
    for (let m = decl.exec (masked); m !== null; m = decl.exec (masked)) {
        names.add (m[1] || m[2]);
    }
    if (names.size === 0) {
        return fn;
    }
    const send = new RegExp ('^\\t*(?:' + [ ...names ].join ('|') + ') <- ', 'gm');
    const edits: { start: number, end: number, text: string }[] = [];
    for (let m = send.exec (masked); m !== null; m = send.exec (masked)) {
        const start = m.index + m[0].length;
        const end = goErrExprEnd (masked, start);
        const expr = fn.substring (start, end);
        if (/^(?:\(?<-|(?:ccxt\.)?AsyncResult\[any\]\{)/.test (expr)) {
            continue;
        }
        edits.push ({ start, end, 'text': q + 'AsyncResult[any]{Value: ' + expr + '}' });
    }
    for (let i = edits.length - 1; i >= 0; i--) {
        fn = fn.substring (0, edits[i].start) + edits[i].text + fn.substring (edits[i].end);
    }
    return fn;
}

function goErrRetypeChans (content: string, q: string): string {
    const masked = goChanMask (content);
    const re = /\bchan (?:any\b|interface\{\})/g;
    let out = '';
    let cursor = 0;
    for (let m = re.exec (masked); m !== null; m = re.exec (masked)) {
        out += content.substring (cursor, m.index) + 'chan ' + q + 'AsyncResult[any]';
        cursor = m.index + m[0].length;
    }
    return out + content.substring (cursor);
}

export function goErrValuePass (content: string, stats?: GoErrStats): string {
    if (content.indexOf ('<-') < 0) {
        return content;
    }
    const q = goErrQual (content);
    content = goErrListHolders (goErrWrappers (content));
    const masked = goChanMask (content);
    let out = '';
    let cursor = 0;
    const fnRe = /^func /gm;
    for (let m = fnRe.exec (masked); m !== null; m = fnRe.exec (masked)) {
        const close = masked.indexOf ('\n}', m.index);
        const end = (close < 0) ? content.length : close + 2;
        out += content.substring (cursor, m.index) + goErrSends (goErrNoOpChecks (goErrFunc (content.substring (m.index, end), q, stats), stats), q);
        cursor = end;
        fnRe.lastIndex = end;
    }
    return goErrRetypeChans (out + content.substring (cursor), q);
}

export function goErrSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, m: string) => { if (!c) { problems.push ('go-err: ' + m); } };
    const body = (b: string) => 'package ccxt\n\nfunc (this *X) FooAsync(a any) <-chan any {\n\tch := make(chan any, 1)\n\tgo this.fooBody(ch, a)\n\treturn ch\n}\nfunc (this *X) fooBody(ch chan any, a any) any {\n\tdefer close(ch)\n\tdefer ReturnPanicError(ch)\n' + b + '\treturn nil\n}\n';
    const run = (b: string) => goErrValuePass (body (b));
    const check = (ind: string, n = 'r') => ind + 'if ' + n + '.Err != nil {\n' + ind + '\tpanic(' + n + '.Err)\n' + ind + '}\n';
    let out = run ('\tPanicOnError((<-this.LoadMarketsAsync()))\n\tch <- a\n');
    ok (out.includes ('\tr := <-this.LoadMarketsAsync()\n' + check ('\t') + '\tch <- AsyncResult[any]{Value: a}\n'), 'statement + send: ' + out);
    ok (out.includes ('FooAsync(a any) <-chan AsyncResult[any] {\n\tch := make(chan AsyncResult[any], 1)') && out.includes ('fooBody(ch chan AsyncResult[any], a any)'), 'retype');
    ok (goErrValuePass (out) === out, 'idempotent');
    out = run ('\tvar r any = nil\n\tresponse := (<-this.PublicGetTime(a))\n\tPanicOnError(response)\n\tch <- response\n');
    ok (out.includes ('\tr1 := <-this.PublicGetTime(a)\n' + check ('\t', 'r1') + '\tresponse := r1.Value\n\tch <- '), 'decl + adjacent check, fresh name: ' + out);
    out = run ('\tresponse = (<-this.FapiPublicGetTime(a)).Raw\n\tPanicOnError(response) // c\n');
    ok (out.includes ('\tresponse = r.Raw // c\n\treturn nil'), 'Raw selector: ' + out);
    out = run ('\tvar results []any = ListTyped(PanicOnError((<-promiseAll(a))))\n\tvar m map[string]any = (<-this.Bar(this.Extend(a, map[string]any{\n\t\t"k": a,\n\t}))).Checked()\n');
    ok (out.includes ('\tr := <-promiseAll(a)\n' + check ('\t') + '\tvar results []any = ListTyped(r.Value)\n'), 'conversion kept: ' + out);
    ok (out.includes ('\tr1 := <-this.Bar(this.Extend(a, map[string]any{\n\t\t"k": a,\n\t}))\n' + check ('\t', 'r1') + '\tvar m map[string]any = r1.Value\n'), 'multi-line Checked: ' + out);
    out = run ('\tif a != nil {\n\t\tPanicOnError((<-this.Sleep(1)))\n\t}\n\tx := this.F(this.K(), PanicOnError((<-this.G())))\n\ty := this.F(a, <-this.G())\n\tif PanicOnError((<-this.H())) == nil {\n\t}\n\tch <- <-this.K()\n');
    ok (out.includes ('\t\t<-this.Sleep(1)\n'), 'bool channel: ' + out);
    ok (out.includes ('x := this.F(this.K(), PanicOnError((<-this.G())))') && out.includes ('if PanicOnError((<-this.H())) == nil'), 'order / header kept: ' + out);
    ok (out.includes ('\tch <- <-this.K()\n'), 'forward: ' + out);
    ok (out.includes ('\tr := <-this.G()\n' + check ('\t') + '\ty := this.F(a, r.Value)\n'), 'identifier operands hoist: ' + out);
    ok (goErrValuePass (out) === out, 'kept idempotent');
    out = run ('\tPanicOnError((<-promiseAll([]any{this.L(), <-this.S()})))\n');
    ok (out.includes ('\tr := <-promiseAll([]any{this.L(), <-this.S()})\n'), 'nested receive: ' + out);
    out = run ('\tPanicOnError((<-this.G())) // note\n');
    ok (out.includes ('\tr := <-this.G() // note\n' + check ('\t') + '\treturn nil'), 'trailing comment: ' + out);
    out = run ('\tlistEp1 := (<-this.E(a))\n\tPanicOnError(listEp1.Raw)\n\tvar h []any = listEp1.Value\n\tvar m map[string]any = this.M(a)\n\tPanicOnError(m)\n\tvar v any = this.M(a)\n\tPanicOnError(v)\n');
    ok (out.includes ('\tlistEp1 := <-this.E(a)\n' + check ('\t', 'listEp1') + '\tvar h []any = listEp1.Value\n'), 'listEp: ' + out);
    ok (!out.includes ('PanicOnError(m)') && out.includes ('PanicOnError(v)'), 'no-op check dropped only when typed: ' + out);
    const wrap = 'package ccxt\n\nfunc (this *ExchangeTyped) F(params ...any) (Balances, error) {\n\traw := <-this.Exchange.FAsync(params...)\n\tif IsError(raw) {\n\t\treturn Balances{}, CreateReturnError(raw)\n\t}\n\tvar res Balances = NewBalances(raw)\n\treturn res, nil\n}\nfunc (this *ExchangeTyped) S(params ...any) (Status, error) {\n\tr := <-this.Exchange.SAsync(params...)\n\tif IsError(r.Raw) {\n\t\treturn Status{}, CreateReturnError(r.Raw)\n\t}\n\tvar res Status = NewStatus(r.Raw)\n\treturn res, nil\n}\n';
    out = goErrValuePass (wrap);
    ok (out.includes ('\tr := <-this.Exchange.FAsync(params...)\n\tif r.Err != nil {\n\t\treturn Balances{}, r.Err\n\t}\n\tvar res Balances = NewBalances(r.Value)\n'), 'typed wrapper: ' + out);
    ok (out.includes ('\tif r.Err != nil {\n\t\treturn Status{}, r.Err\n\t}\n\tvar res Status = NewStatus(r.Raw)\n'), 'endpoint wrapper: ' + out);
    ok (goErrValuePass (out) === out, 'wrapper idempotent');
    const pro = goErrValuePass ('package ccxtpro\n\nfunc (this *X) fBody(ch chan any) any {\n\tdefer close(ch)\n\tdefer ccxt.ReturnPanicError(ch)\n\tch <- ccxt.PanicOnError(<-future.(*ccxt.Future).Await())\n\treturn nil\n}\n');
    ok (pro.includes ('\tr := <-future.(*ccxt.Future).Await()\n' + check ('\t') + '\tch <- ccxt.AsyncResult[any]{Value: r.Value}\n') && pro.includes ('ch chan ccxt.AsyncResult[any]'), 'qualified: ' + pro);
    return problems;
}
