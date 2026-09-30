// Struct returns for the Go row builders (parseTicker / safeTicker / ...).
//
// Post-print text pass over every generated Go file (run from overwriteFileAndFolder). For each
// struct in GO_STRUCT_RETURN_TYPES it
//   1. retypes EVERY declaration of the listed names (`map[string]any` -> T; the Go interface
//      method sets are invariant, so all overrides move together);
//   2. makes their function-level returns T: a call of a listed name is an identity, anything
//      else is built with `<T>FromMap(expr)`;
//   3. boxes every other call site back to the map shape with `<T>ToMap(call)`, so untyped
//      code (and the tests) never see the struct.
// HOWTO add a type: see NOTES.md ("HOWTO add a type"); names are all-or-nothing.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// from/to: boundary helpers when the row is not a map (default <T>FromMap / <T>ToMap)
export const GO_STRUCT_RETURN_TYPES: Record<string, { names: string[], from?: string, to?: string }> = {
    'Ticker': { 'names': [ 'ParseTicker', 'SafeTicker', 'ParseContractTicker' ] },
    'Trade': { 'names': [ 'ParseTrade', 'SafeTrade' ] },
    'OHLCV': { 'names': [ 'ParseOHLCV' ], 'from': 'OHLCVFromList', 'to': 'OHLCVToList' },
    'Order': { 'names': [ 'ParseOrder', 'SafeOrder' ] },
};

// what a call of a struct-return name reads as after step 3 boxes it (to-helper result; any for OHLCV)
export function goStructBoxedReturn (name: string): string | undefined {
    const struct = NAME_TO_STRUCT.get (name);
    if (struct === undefined) {
        return undefined;
    }
    return (GO_STRUCT_RETURN_TYPES[struct].to === undefined) ? 'map[string]any' : '';
}

const fromName = (struct: string) => GO_STRUCT_RETURN_TYPES[struct].from ?? (struct + 'FromMap');
const toName = (struct: string) => GO_STRUCT_RETURN_TYPES[struct].to ?? (struct + 'ToMap');

const NAME_TO_STRUCT = new Map<string, string> ();
for (const [ struct, spec ] of Object.entries (GO_STRUCT_RETURN_TYPES)) {
    for (const name of spec.names) {
        NAME_TO_STRUCT.set (name, struct);
    }
}

// true for chars outside string/rune literals and comments
function codeMask (s: string): Uint8Array {
    const mask = new Uint8Array (s.length);
    let i = 0;
    while (i < s.length) {
        const c = s[i];
        if (c === '/' && s[i + 1] === '/') {
            while (i < s.length && s[i] !== '\n') i++;
            continue;
        }
        if (c === '/' && s[i + 1] === '*') {
            const end = s.indexOf ('*/', i + 2);
            i = (end < 0) ? s.length : end + 2;
            continue;
        }
        if (c === '`') {
            const end = s.indexOf ('`', i + 1);
            i = (end < 0) ? s.length : end + 1;
            continue;
        }
        if (c === '"' || c === '\'') {
            i++;
            while (i < s.length && s[i] !== c && s[i] !== '\n') {
                if (s[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }
        mask[i] = 1;
        i++;
    }
    return mask;
}

function matchClose (s: string, mask: Uint8Array, open: number): number {
    let depth = 0;
    for (let i = open; i < s.length; i++) {
        if (!mask[i]) continue;
        const c = s[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// end (exclusive) of a return expression starting at pos: first newline at bracket depth 0
function exprEnd (s: string, mask: Uint8Array, pos: number): number {
    let depth = 0;
    for (let i = pos; i < s.length; i++) {
        if (!mask[i]) continue;
        const c = s[i];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth < 0) return i;
        } else if (c === '\n' && depth === 0) return i;
    }
    return s.length;
}

function qualifier (content: string): string {
    return /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
}

const DECL_RE = /^func \(this \*\w+\) (\w+)\(/gm;
const CALL_RE = /(?<![\w])((?:this|exchange|this\.base|this\.DerivedExchange|this\.Exchange|this\.BaseExchange)\.)(\w+)\(/g;

export function goStructReturnsPass (content: string): string {
    const names = [ ...NAME_TO_STRUCT.keys () ];
    if (!names.some ((n) => content.includes (n + '('))) {
        return content;
    }
    const q = qualifier (content);
    const mask = codeMask (content);
    type Edit = { at: number, del: number, text: string };
    const edits: Edit[] = [];
    const identitySpans = new Set<number> (); // call-name starts left unboxed
    // 1+2: declarations and their function-level returns
    DECL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = DECL_RE.exec (content)) !== null) {
        const struct = NAME_TO_STRUCT.get (m[1]);
        if (struct === undefined || !mask[m.index]) continue;
        const parenOpen = m.index + m[0].length - 1;
        const parenClose = matchClose (content, mask, parenOpen);
        const bodyOpen = content.indexOf ('{', parenClose);
        const retType = content.slice (parenClose + 1, bodyOpen).trim ();
        const applied = (retType === q + struct); // idempotent replay
        if (!applied && retType !== 'map[string]any' && retType !== 'any') {
            throw new Error ('go-struct-returns: ' + m[1] + ' returns ' + retType + ', expected map[string]any or any');
        }
        const bodyClose = matchClose (content, mask, bodyOpen);
        if (!applied) {
            edits.push ({ 'at': parenClose + 1, 'del': bodyOpen - parenClose - 1, 'text': ' ' + q + struct + ' ' });
        }
        // nested func literals: their returns are not the method's
        const nested: [number, number][] = [];
        const litRe = /func\s*\(/g;
        litRe.lastIndex = bodyOpen;
        let lm: RegExpExecArray | null;
        while ((lm = litRe.exec (content)) !== null && lm.index < bodyClose) {
            if (!mask[lm.index]) continue;
            const pc = matchClose (content, mask, lm.index + lm[0].length - 1);
            let j = pc + 1;
            while (j < bodyClose && content[j] !== '{' && content[j] !== '\n') j++;
            if (content[j] === '{') {
                nested.push ([ j, matchClose (content, mask, j) ]);
            }
        }
        const retRe = /\breturn\b/g;
        retRe.lastIndex = bodyOpen;
        let rm: RegExpExecArray | null;
        while ((rm = retRe.exec (content)) !== null && rm.index < bodyClose) {
            if (!mask[rm.index] || nested.some (([ a, b ]) => rm!.index > a && rm!.index < b)) continue;
            let start = rm.index + 6;
            while (content[start] === ' ') start++;
            const end = exprEnd (content, mask, start);
            const expr = content.slice (start, end).trimEnd ();
            if (expr === '') {
                throw new Error ('go-struct-returns: bare return in ' + m[1]);
            }
            const call = /^(?:this|this\.base|this\.DerivedExchange)\.(\w+)\(/.exec (expr);
            if (call !== null && NAME_TO_STRUCT.get (call[1]) === struct && matchClose (content, mask, start + call[0].length - 1) === start + expr.length - 1) {
                identitySpans.add (start + call[0].length - call[1].length - 1);
                continue;
            }
            if (applied) continue;
            edits.push ({ 'at': start, 'del': 0, 'text': q + fromName (struct) + '(' });
            edits.push ({ 'at': start + expr.length, 'del': 0, 'text': ')' });
        }
    }
    // 3: box every other call
    CALL_RE.lastIndex = 0;
    while ((m = CALL_RE.exec (content)) !== null) {
        const struct = NAME_TO_STRUCT.get (m[2]);
        if (struct === undefined || !mask[m.index]) continue;
        const nameAt = m.index + m[1].length;
        const to = toName (struct) + '(';
        if (identitySpans.has (nameAt) || content.slice (Math.max (0, m.index - to.length), m.index) === to) continue;
        const close = matchClose (content, mask, m.index + m[0].length - 1);
        edits.push ({ 'at': m.index, 'del': 0, 'text': q + toName (struct) + '(' });
        edits.push ({ 'at': close + 1, 'del': 0, 'text': ')' });
    }
    // apply back to front; at equal offsets closers (`)`) before openers keeps nesting sane
    edits.sort ((a, b) => (b.at - a.at) || ((a.text === ')' ? 0 : 1) - (b.text === ')' ? 0 : 1)));
    let out = content;
    for (const e of edits) {
        out = out.slice (0, e.at) + e.text + out.slice (e.at + e.del);
    }
    return out;
}

export function goStructReturnsSelfTest (): string[] {
    const problems: string[] = [];
    const src = [
        'package ccxtpro',
        '',
        'func (this *X) ParseTicker(ticker any, optionalArgs ...any) map[string]any {',
        '\tvar f = func() any {',
        '\t\treturn 1',
        '\t}',
        '\t_ = f',
        '\tif ticker == nil {',
        '\t\treturn this.ParseContractTicker(ticker, "a(")',
        '\t}',
        '\treturn this.SafeTicker(map[string]any{',
        '\t\t"symbol": nil,',
        '\t}, nil)',
        '}',
        'func (this *X) Other() any {',
        '\tvar t map[string]any = this.ParseTicker(this.SafeTicker(nil))',
        '\treturn t',
        '}',
        'func (this *X) ParseContractTicker(ticker any, optionalArgs ...any) map[string]any {',
        '\treturn this.Extend(ticker, map[string]any{})',
        '}',
        '',
    ].join ('\n');
    const want = [
        'package ccxtpro',
        '',
        'func (this *X) ParseTicker(ticker any, optionalArgs ...any) ccxt.Ticker {',
        '\tvar f = func() any {',
        '\t\treturn 1',
        '\t}',
        '\t_ = f',
        '\tif ticker == nil {',
        '\t\treturn this.ParseContractTicker(ticker, "a(")',
        '\t}',
        '\treturn this.SafeTicker(map[string]any{',
        '\t\t"symbol": nil,',
        '\t}, nil)',
        '}',
        'func (this *X) Other() any {',
        '\tvar t map[string]any = ccxt.TickerToMap(this.ParseTicker(ccxt.TickerToMap(this.SafeTicker(nil))))',
        '\treturn t',
        '}',
        'func (this *X) ParseContractTicker(ticker any, optionalArgs ...any) ccxt.Ticker {',
        '\treturn ccxt.TickerFromMap(this.Extend(ticker, map[string]any{}))',
        '}',
        '',
    ].join ('\n');
    const got = goStructReturnsPass (src);
    if (got !== want) {
        problems.push ('GOSTRUCT self-test mismatch:\n' + got);
    }
    if (goStructReturnsPass (got) !== got) {
        problems.push ('GOSTRUCT not idempotent');
    }
    return problems;
}

if (process.argv[1] && fileURLToPath (import.meta.url) === path.resolve (process.argv[1])) {
    if (process.argv.includes ('--self-test')) {
        const problems = goStructReturnsSelfTest ();
        console.log (problems.length ? problems.join ('\n') : 'GOSTRUCT SELF-TEST PASSED');
        process.exit (problems.length ? 3 : 0);
    }
    // --apply <files...>: replay on already-generated files (census / dry run only)
    const i = process.argv.indexOf ('--apply');
    if (i >= 0) {
        for (const f of process.argv.slice (i + 1)) {
            fs.writeFileSync (f, goStructReturnsPass (fs.readFileSync (f, 'utf8')));
        }
    }
}
