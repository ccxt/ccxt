// ===== hx10w3 G05: generated base method return types (Go) =====
// A generated base method whose Go signature is concrete still holds its caller's local as an
// `any` box (`var x any = this.ParseTickers (r)`), so every read on it prints the GetValue/InOp/
// ObjectKeys helper. This pass names that signature on the declaration, and only when every use
// of the local is a container read the helpers answer identically for: a dict read (GetValue,
// InOp, ObjectKeys, ObjectValues, m[k]) or a list read (GetValue, GetArrayLength, xs[i]). The
// type is identity on those values — a nil map/slice reads as absent for all of them and the
// box is never handed out, so no consumer can observe the difference.
//
// Downstream passes do the rest: g02pass prints len(xs)/xs[i], g06MapReads prints `_, ok := m[k]`
// and the ObjectKeys/ObjectValues ranges, nativeTypedContainerAccess prints m[k]. A site with any
// other use (hand-out, nil compare, rebind) keeps the box and the plain helper call.
//
// Three callees still print `any` in the base (ParseOrderBookBidAsk, ReduceFeesByCurrency,
// EventsList): G05_PROVEN_LIST_METHODS hands them to the proven-list retype, which makes base and
// every override return `[]any` and throws at transpile time on an unproven return path.

import { g06Mask } from './hx10w2-G06.js';

// The generated method's Go return type at this commit, uniform across the base and the venue
// overrides (the proven-list/map passes retype those families, so a caller and its callee can
// never disagree).
export const G05_GENERATED_RETURN_TYPES: { [callee: string]: string } = {
    // dict producers (goProvenMapCollectionMethods)
    'ParseBalance': 'map[string]any',
    'ParseBalanceList': 'map[string]any',
    'ParseTickers': 'map[string]any',
    'ParseCurrencies': 'map[string]any',
    'ParseFundingRates': 'map[string]any',
    'ParseOpenInterests': 'map[string]any',
    'ParseAccount': 'map[string]any',
    'Extend': 'map[string]any',
    'HandleRouteAndParams': 'map[string]any', // hx11 w8 m464: goOmitTupleMapReturns, OmitDict never nil
    'Sign': 'map[string]any', // hx11 w8 r18: base + 103 overrides return a request map literal (retypeGoProvenParseMethods)
    // list producers (goProvenListMethods), including the three G05_PROVEN_LIST_METHODS retypes
    'ParseOrders': '[]any',
    'ParseTrades': '[]any',
    'ParsePredictionOrders': '[]any',
    'ParsePredictionTrades': '[]any',
    'FilterBySinceLimit': '[]any',
    'ParseOrderBookBidAsk': '[]any',
    'ReduceFeesByCurrency': '[]any',
    'EventsList': '[]any',
};

// `any` in the base today; every return path of the base and of each override prints a `[]any`
// literal or a `[]any`-declared local (retypeGoProvenFamily, fail-closed)
export const G05_PROVEN_LIST_METHODS = [ 'ParseOrderBookBidAsk', 'ReduceFeesByCurrency', 'EventsList' ];

const G05_MAP_READERS = [ 'GetValue', 'InOp', 'ObjectKeys', 'ObjectValues' ];
const G05_LIST_READERS = [ 'GetValue', 'GetArrayLength' ];
const g05WordList = [ 'any', 'string', 'int', 'int64', 'float64', 'bool', 'map' ];
// a nil dict/slice answers these exactly like the untyped nil the box held: each accessor
// switches on the Go type and reads the member (a nil map misses every key), so the value
// never escapes to a consumer that could tell the two apart
const G05_MAP_SINKS = [ 'GetValue', 'InOp', 'ObjectKeys', 'ObjectValues', 'SafeDict', 'SafeDict2', 'SafeDictN', 'SafeValue', 'SafeValue2', 'SafeValueN', 'SafeList', 'SafeList2', 'SafeListN', 'SafeString', 'SafeString2', 'SafeStringN', 'SafeInteger', 'SafeInteger2', 'SafeIntegerN', 'SafeNumber', 'SafeNumber2', 'SafeNumberN', 'SafeBool', 'SafeBool2', 'SafeBoolN' ];
const G05_LIST_SINKS = [ 'GetValue', 'GetArrayLength', 'SafeList', 'SafeList2', 'SafeListN', 'SafeDict', 'SafeDict2', 'SafeDictN', 'SafeValue', 'SafeValue2', 'SafeValueN', 'SafeString', 'SafeString2', 'SafeStringN', 'ObjectKeys', 'ObjectValues' ];

// every return path of these prints a fresh container (no `return nil`, no parameter handed
// back), so a local that holds it can never turn a nil box into a typed nil: every use may hold
// the type, a hand-out included
const G05_NEVER_ABSENT = [ 'Sign', 'HandleRouteAndParams', 'ParseTickers', 'ParseFundingRates', 'ParseOpenInterests', 'ParseOrders', 'ParseTrades', 'FilterBySinceLimit', 'Extend', 'ParseOrderBookBidAsk', 'EventsList' ];

const isMapType = (type: string) => type === 'map[string]any';
const isListType = (type: string) => type === '[]any';

// the callee of the call whose argument list holds offset `at`, or undefined outside a call
function g05EnclosingCallee (line: string, at: number): string | undefined {
    let depth = 0;
    for (let i = at - 1; i >= 0; i--) {
        const c = line[i];
        if (c === ')') {
            depth++;
        } else if (c === '(') {
            if (depth === 0) {
                const head = /([A-Za-z_][\w.]*)$/.exec (line.slice (0, i));
                return (head === null) ? undefined : head[1].replace (/^.*\./, '');
            }
            depth--;
        }
    }
    return undefined;
}

// a read the helpers answer identically for a nil container: `m[k]` / `xs[i]` as a value (never a
// write target), or the container argument of a reader call
function g05UseIsReader (line: string, name: string, type: string): boolean {
    const rx = new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g');
    let match;
    let seen = false;
    while ((match = rx.exec (line)) !== null) {
        seen = true;
        const after = line.slice (match.index + name.length);
        if (/^\s*\[/.test (after)) {
            let depth = 0;
            let close = -1;
            for (let i = match.index + name.length; i < line.length; i++) {
                if (line[i] === '[') {
                    depth++;
                } else if (line[i] === ']') {
                    depth--;
                    if (depth === 0) {
                        close = i;
                        break;
                    }
                }
            }
            if (close < 0) {
                return false;
            }
            const tail = line.slice (close + 1);
            if (/^\s*(?:[-+*/%&|^]?=|:=|\+\+|--)/.test (tail)) {
                return false; // element write
            }
            continue;
        }
        const callee = g05EnclosingCallee (line, match.index);
        if (callee === undefined) {
            return false;
        }
        const readers = isMapType (type) ? G05_MAP_SINKS : G05_LIST_SINKS;
        if (readers.indexOf (callee) < 0) {
            return false; // handed out, compared, asserted, passed on
        }
    }
    return seen;
}

// the name is declared once, by a plain `var`, and never written again
function g05SingleVar (funcLines: string[], name: string, index: number): boolean {
    const escaped = name.replace (/[^A-Za-z0-9_]/g, '');
    const declarations = funcLines.filter ((line) => new RegExp ('(?:^|[^\\w.])var\\s+' + escaped + '\\s').test (line)).length;
    if (declarations !== 1) {
        return false;
    }
    if (!/^\s*var\s/.test (funcLines[index])) {
        return false;
    }
    for (let k = 0; k < funcLines.length; k++) {
        if (k === index) {
            continue;
        }
        const line = funcLines[k];
        if (new RegExp ('(?:^|[^\\w.])' + escaped + '\\s*(?:[-+*/%&|^]?=|:=|\\(\\))').test (line)) {
            return false; // rebound or called
        }
        if (new RegExp ('(?:^|[^\\w.])' + escaped + '\\s*(?:\\+\\+|--)').test (line)) {
            return false;
        }
        if (new RegExp ('&\\s*' + escaped + '(?![\\w])').test (line)) {
            return false; // address taken
        }
    }
    return true;
}

// a type spelling must keep meaning the predeclared type: the function may not bind those words
function g05TypeIsFree (sig: string, funcLines: string[], type: string): boolean {
    const words = (type.match (/[a-z][a-z0-9]*/g) || []).filter ((w) => g05WordList.indexOf (w) >= 0);
    for (const word of words) {
        if (new RegExp ('(?:^|[,(])\\s*' + word + '\\s+[\\w\\[\\]*]').test (sig)) {
            return false; // a parameter named after the type word
        }
        for (const line of funcLines) {
            if (new RegExp ('^\\s*var\\s+' + word + '\\s').test (line) || new RegExp ('(?:^|[^\\w.])' + word + '\\s*:=').test (line)) {
                return false;
            }
        }
    }
    return true;
}

export function g05Locals (content: string): string {
    if (!/var \w+ any = (?:ccxt\.)?this\.(?:DerivedExchange\.)?(?:Parse|Filter|Reduce|Events|Extend|Sign)/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = g06Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const ranges: number[][] = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            ranges.push ([ start, k ]);
            start = -1;
        }
    }
    // a method this file defines itself may return another type: never retype against it
    const own = new Set<string> ();
    for (const line of masked) {
            const defined = /^func \(this \*[A-Za-z0-9_]+\) ([A-Za-z0-9_]+)\(/.exec (line);
            if (defined !== null) {
                own.add (defined[1]);
            }
    }
    for (const [ from, to ] of ranges) {
        const sig = masked[from];
        const funcLines = masked.slice (from, to + 1);
        for (let k = from + 1; k < to; k++) {
            const declaration = /^(\s*)var (\w+) any = ((?:ccxt\.)?this\.(?:DerivedExchange\.)?(\w+)\(.*\))\s*$/.exec (masked[k]);
            if (declaration === null) {
                continue;
            }
            const [ , indent, name, initializer, callee ] = declaration;
            const type = G05_GENERATED_RETURN_TYPES[callee];
            if (type === undefined || (own.has (callee) && (callee !== 'Sign') && (callee !== 'HandleRouteAndParams'))) {
                continue;
            }
            if (isMapType (type) ? (content.indexOf ('var ' + name + ' map[string]any = ' + initializer) >= 0) : false) {
                continue;
            }
            if (!g05SingleVar (funcLines, name, k - from) || !g05TypeIsFree (sig, funcLines, type)) {
                continue;
            }
            let safe = true;
            for (let j = from + 1; j < to; j++) {
                if (j === k || masked[j].indexOf (name) < 0) {
                    continue;
                }
                if (!new RegExp ('(?<![\\w.])' + name + '(?![\\w])').test (masked[j])) {
                    continue;
                }
                if (new RegExp ('(?<![\\w.])' + name + '\\.\\(').test (masked[j])) {
                    safe = false; // a type assertion or switch needs the interface
                    break;
                }
                if ((G05_NEVER_ABSENT.indexOf (callee) < 0) && !g05UseIsReader (masked[j], name, type)) {
                    safe = false;
                    break;
                }
            }
            if (!safe) {
                continue;
            }
            const value = lines[k].slice (indent.length + ('var ' + name + ' any = ').length);
            lines[k] = indent + 'var ' + name + ' ' + type + ' = ' + value;
            masked[k] = indent + 'var ' + name + ' ' + type + ' = ' + initializer;
        }
    }
    return lines.join ('\n');
}

// fails on the base generator: the locals stay `any` there and the three callees print `any`
export function g05Check (retypeProven: (content: string) => string): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('hx10w3-G05: ' + msg); } };
    const run = (body: string) => g05Locals ('package ccxt\n\nfunc (this *X) f(p any) {\n' + body + '}\n');
    const typed = run ('\tvar tickers any = this.ParseTickers(p)\n\tvar keys []string = ObjectKeys(tickers)\n\t_ = keys\n');
    ok (typed.includes ('var tickers map[string]any = this.ParseTickers(p)'), 'dict producer local typed');
    ok (typed.includes ('ObjectKeys(tickers)'), 'read keeps its reader for the later pass');
    const handedOut = run ('\tvar balance any = this.ParseBalance(p)\n\tthis.Options["t"] = balance\n');
    ok (handedOut.includes ('var balance any = this.ParseBalance(p)'), 'handed-out local with a nil path keeps the box');
    const neverAbsent = run ('\tvar tickers any = this.ParseTickers(p)\n\tthis.Options["t"] = tickers\n');
    ok (neverAbsent.includes ('var tickers map[string]any = this.ParseTickers(p)'), 'never-absent hand-out takes the type');
    const compared = run ('\tvar balance any = this.ParseBalance(p)\n\tif balance == nil {\n\t}\n');
    ok (compared.includes ('var balance any = this.ParseBalance(p)'), 'nil-compared local keeps the box');
    const rebound = run ('\tvar rows any = this.ParseOrders(p)\n\trows = this.ParseOrders(p)\n\t_ = GetArrayLength(rows)\n');
    ok (rebound.includes ('var rows any = this.ParseOrders(p)'), 'rebound local keeps the box');
    const elementWrite = run ('\tvar balance any = this.ParseBalance(p)\n\tbalance["k"] = 1\n');
    ok (elementWrite.includes ('var balance any = this.ParseBalance(p)'), 'element write keeps the box');
    const list = run ('\tvar result any = this.ReduceFeesByCurrency(p)\n\tvar n int = GetArrayLength(result)\n\t_ = n\n');
    ok (list.includes ('var result []any = this.ReduceFeesByCurrency(p)'), 'list producer local typed');
    const ownMethod = g05Locals ('package ccxt\n\nfunc (this *X) ParseTickers(p any) map[string]any {\n\treturn map[string]any{}\n}\nfunc (this *X) f(p any) {\n\tvar t any = this.ParseTickers(p)\n\t_ = ObjectKeys(t)\n}\n');
    ok (ownMethod.includes ('var t any = this.ParseTickers(p)'), 'a file-local override keeps the box');
    const fn = (name: string, body: string) => '\nfunc (this *X) ' + name + '(a any) any {\n' + body + '}\n';
    ok (retypeProven (fn ('ReduceFeesByCurrency', '\tvar result []any = []any{}\n\treturn result\n')).includes (') ReduceFeesByCurrency(a any) []any {'), 'ReduceFeesByCurrency returns []any');
    ok (retypeProven (fn ('ParseOrderBookBidAsk', '\treturn []any{1, 2}\n')).includes (') ParseOrderBookBidAsk(a any) []any {'), 'ParseOrderBookBidAsk returns []any');
    let threw = false;
    try {
        retypeProven (fn ('EventsList', '\treturn 0\n'));
    } catch (e) {
        threw = true;
    }
    ok (threw, 'an unproven EventsList return path throws');
    return problems;
}
