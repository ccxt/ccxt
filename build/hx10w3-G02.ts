// HX10 W3 G02: the four ws caches on BaseExchange (Orderbooks / Ohlcvs / Trades / FundingRates) are
// plain map[string]any owned by one goroutine - the exchange's ws dispatch loop (exchange_ws_cache.go).
// Handler code (Handle*) runs on that loop and keeps indexing the maps directly; the generated
// user-path functions below run on a watch/fetch goroutine, so their access becomes an operation the
// loop performs. Anything outside this list stays a plain map operation.
import { goChanMask, goChanClose } from './go-chan.js';

const WS_FIELDS = [ 'Orderbooks', 'Ohlcvs', 'Trades', 'FundingRates' ];
const FIELD = WS_FIELDS.join ('|');
const FIELD_RECEIVER = new RegExp ('^this\\.(' + FIELD + ')$');
const USER_PATH = /^(?:watch|fetch|seed)\w*Body$|^CleanWsData$/;
const FUNC_HEAD = /^func \((?:[^)]*)\) (\w+)\(/;

type Span = { s: number, e: number };

type Call = { at: number, open: number, close: number, args: Span[] };

// the call starting at `at` (`name` is its printed name): parenthesised span plus top-level args
function g02CallAt (masked: string, at: number, name: string): Call | undefined {
    const open = masked.indexOf ('(', at + name.length);
    if (open < 0) {
        return undefined;
    }
    const close = goChanClose (masked, open);
    if (close < 0) {
        return undefined;
    }
    return { at, open, close, args: g02Split (masked, open, close - 1) };
}

// top-level comma split of masked (open, close)
function g02Split (masked: string, open: number, close: number): Span[] {
    const spans: Span[] = [];
    let depth = 0;
    let s = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            spans.push ({ s, e: i });
            s = i + 1;
        }
    }
    if (masked.substring (s, close).trim () !== '') {
        spans.push ({ s, e: close });
    }
    return spans;
}

function g02Field (text: string): string | undefined {
    return FIELD_RECEIVER.exec (text.trim ())?.[1];
}

// `AddElementToObject(this.F, k, v)` / `InOp(this.F, k)` / `GetValue(this.F, k)` on a ws cache
function g02HelperCall (line: string, masked: string): string | undefined {
    const re = /(?<![\w.])(?:ccxt\.)?(AddElementToObject|InOp|GetValue)\(/g;
    const hit = re.exec (masked);
    if (hit === null) {
        return undefined;
    }
    const name = /AddElementToObject|InOp|GetValue/.exec (hit[0])?.[0] as string;
    const call = g02CallAt (masked, hit.index, name);
    if (call === undefined) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const field = g02Field (args[0] ?? '');
    if (field === undefined) {
        return undefined;
    }
    let text: string;
    if (name === 'AddElementToObject') {
        if (call.args.length !== 3) {
            return undefined;
        }
        text = 'this.WsCacheSet("' + field + '", ' + args[1] + ', ' + args[2] + ')';
    } else if (name === 'InOp') {
        if (call.args.length !== 2) {
            return undefined;
        }
        text = 'this.WsCacheHas("' + field + '", ' + args[1] + ')';
    } else {
        if (call.args.length !== 2) {
            return undefined;
        }
        text = 'this.WsCacheGet("' + field + '", ' + args[1] + ')';
    }
    return line.substring (0, call.at) + text + line.substring (call.close);
}

// `this.SafeValue(this.F, k)` / `this.SafeDict(this.F, k)` on a ws cache (no default argument)
function g02SafeRead (line: string, masked: string): string | undefined {
    const re = /(?<![\w.])this\.(?:SafeValue|SafeDict)\(/g;
    const hit = re.exec (masked);
    if (hit === null) {
        return undefined;
    }
    const name = /SafeValue|SafeDict/.exec (hit[0])?.[0] as string;
    const call = g02CallAt (masked, hit.index, name);
    if ((call === undefined) || (call.args.length !== 2)) {
        return undefined;
    }
    const args = call.args.map (a => line.substring (a.s, a.e).trim ());
    const field = g02Field (args[0] ?? '');
    if (field === undefined) {
        return undefined;
    }
    return line.substring (0, call.at) + 'this.WsCacheGet("' + field + '", ' + args[1] + ')' + line.substring (call.close);
}

// `this.FilterByArray(this.FundingRates, ...)` reads every entry: it walks a copy taken on the loop
function g02FilterByArray (line: string, masked: string): string | undefined {
    const re = /(?<![\w.])this\.FilterByArray\(/g;
    const hit = re.exec (masked);
    if (hit === null) {
        return undefined;
    }
    const call = g02CallAt (masked, hit.index, 'FilterByArray');
    if ((call === undefined) || (call.args.length === 0)) {
        return undefined;
    }
    const first = call.args[0];
    const field = g02Field (line.substring (first.s, first.e));
    if (field === undefined) {
        return undefined;
    }
    return line.substring (0, first.s) + 'this.WsCacheSnapshot("' + field + '")' + line.substring (first.e);
}

// `if _, ok := this.F[k]; !ok {`
function g02CommaOk (line: string, masked: string): string | undefined {
    const m = new RegExp ('^(\\s*)if _, ok := this\\.(' + FIELD + ')\\[').exec (masked);
    if (m === null) {
        return undefined;
    }
    const field = m[2];
    const open = m[0].length - 1;
    const close = goChanClose (masked, open);
    if (close < 0) {
        return undefined;
    }
    if (!/^\s*;\s*!ok\s*\{/.test (masked.substring (close))) {
        return undefined;
    }
    const key = line.substring (open + 1, close - 1);
    const rest = line.substring (masked.indexOf ('{', close));
    return m[1] + 'if !this.WsCacheHas("' + field + '", ' + key + ') ' + rest;
}

// `this.F[k] = v` (a statement) and `this.F[k]` (a read)
function g02IndexAccess (line: string, masked: string): string | undefined {
    const m = new RegExp ('(?<![\\w.])this\\.(' + FIELD + ')\\[').exec (masked);
    if (m === null) {
        return undefined;
    }
    const start = m.index;
    const field = m[1];
    const open = start + m[0].length - 1;
    const close = goChanClose (masked, open);
    if (close < 0) {
        return undefined;
    }
    const key = line.substring (open + 1, close - 1);
    const assign = /^(\s*)= /.exec (masked.substring (close));
    if (assign !== null) {
        const valueStart = close + assign[0].length;
        const valueEnd = masked.substring (valueStart).trimEnd ().length;
        const value = line.substring (valueStart, valueStart + valueEnd);
        return line.substring (0, start) + 'this.WsCacheSet("' + field + '", ' + key + ', ' + value + ')' + line.substring (valueStart + valueEnd);
    }
    return line.substring (0, start) + 'this.WsCacheGet("' + field + '", ' + key + ')' + line.substring (close);
}

// `this.F = map[string]any{}` (CleanWsData)
function g02Reset (line: string, masked: string): string | undefined {
    const m = new RegExp ('^(\\s*)this\\.(' + FIELD + ') = map\\[string\\]any\\{\\}\\s*$').exec (masked);
    if (m === null) {
        return undefined;
    }
    return m[1] + 'this.WsCacheReset("' + m[2] + '")';
}

const G02_REWRITES = [ g02HelperCall, g02SafeRead, g02FilterByArray, g02CommaOk, g02IndexAccess ];

// `if !(this.WsCacheHas(...)) {` -> `if !this.WsCacheHas(...) {`
function g02UnwrapNegation (line: string, masked: string): string | undefined {
    const m = /^(\s*)if !\(this\.WsCacheHas\(/.exec (masked);
    if (m === null) {
        return undefined;
    }
    const negOpen = m[1].length + 'if !'.length;
    const callClose = goChanClose (masked, m[0].length - 1);
    if ((callClose < 0) || !/^\)\s*\{/.test (masked.substring (callClose))) {
        return undefined;
    }
    return line.substring (0, negOpen) + line.substring (negOpen + 1, callClose) + line.substring (callClose + 1);
}

function g02Line (line: string): string {
    for (let guard = 0; guard < 8; guard++) {
        let text = g02Reset (line, goChanMask (line));
        if (text !== undefined) {
            return text;
        }
        text = undefined;
        for (const rewrite of [ ...G02_REWRITES, g02UnwrapNegation ]) {
            const next = rewrite (line, goChanMask (line));
            if (next !== undefined) {
                text = next;
                break;
            }
        }
        if ((text === undefined) || (text === line)) {
            return line;
        }
        line = text;
    }
    return line;
}

export function hx10G02Pass (content: string): string {
    const body = content.split ('\n');
    let inUserPath = false;
    for (let i = 0; i < body.length; i++) {
        const head = FUNC_HEAD.exec (body[i]);
        if (head !== null) {
            inUserPath = USER_PATH.test (head[1]);
            continue;
        }
        if (inUserPath && new RegExp ('this\\.(?:' + FIELD + ')\\b').test (body[i])) {
            body[i] = g02Line (body[i]);
        }
    }
    return body.join ('\n');
}

export function hx10w3G02SelfCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10-W3-G02: ' + message); } };
    const userPath = (body: string) => hx10G02Pass ('func (this *X) watchOrderBookBody(ch chan any, symbol string) {\n' + body + '}\n');
    ok (userPath ('\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t}\n').indexOf ('\tif !this.WsCacheHas("Orderbooks", symbol) {') >= 0,
        'a watch body asks the owner for membership');
    ok (userPath ('\tif _, ok := this.Orderbooks[symbol]; !ok {\n\t}\n').indexOf ('\tif !this.WsCacheHas("Orderbooks", symbol) {') >= 0,
        'the comma-ok of a watch body asks the owner too');
    ok (userPath ('\tthis.Orderbooks[symbol] = this.OrderBook(map[string]any{}, limit)\n').indexOf ('\tthis.WsCacheSet("Orderbooks", symbol, this.OrderBook(map[string]any{}, limit))') >= 0,
        'a watch body write becomes an owner operation');
    ok (userPath ('\tvar orderbook any = this.SafeValue(this.Orderbooks, symbol)\n').indexOf ('var orderbook any = this.WsCacheGet("Orderbooks", symbol)') >= 0,
        'a SafeValue read becomes an owner operation');
    ok (userPath ('\tif ccxt.IsEqual(this.SafeDict(this.Orderbooks, symbol), nil) {\n\t}\n').indexOf ('if ccxt.IsEqual(this.WsCacheGet("Orderbooks", symbol), nil) {') >= 0,
        'a SafeDict read inside IsEqual keeps the comparison');
    ok (userPath ('\tccxt.AddElementToObject(this.Orderbooks, market["symbol"], this.OrderBook(snapshot, limit))\n').indexOf ('\tthis.WsCacheSet("Orderbooks", market["symbol"], this.OrderBook(snapshot, limit))') >= 0,
        'a key with brackets survives the write');
    ok (userPath ('\tswitch resolvedBox := this.FilterByArray(this.FundingRates, "symbol", symbols).(type) {\n\t}\n').indexOf ('this.FilterByArray(this.WsCacheSnapshot("FundingRates"), "symbol", symbols)') >= 0,
        'walking a whole cache reads a snapshot');
    ok (userPath ('\tvar ob any = this.Orderbooks[symbol]\n').indexOf ('var ob any = this.WsCacheGet("Orderbooks", symbol)') >= 0,
        'a plain index read becomes an owner operation');
    const clean = hx10G02Pass ('func (this *X) CleanWsData() {\n\tthis.Ohlcvs = map[string]any{}\n}\n');
    ok (clean.indexOf ('\tthis.WsCacheReset("Ohlcvs")') >= 0, 'CleanWsData resets through the owner');
    // handler code already runs on the loop: it stays on the plain map
    const handler = hx10G02Pass ('func (this *X) HandleOrderBook(client any, message any) {\n\tif !(ccxt.InOp(this.Orderbooks, symbol)) {\n\t\tthis.Orderbooks[symbol] = this.OrderBook()\n\t}\n}\n');
    ok (handler.indexOf ('ccxt.InOp(this.Orderbooks, symbol)') >= 0, 'a handler keeps the native map operation');
    // CleanCache is called from handlers, so it must keep its plain map ops (an owner request there
    // would wait on the loop that is executing it)
    const cleanCache = hx10G02Pass ('func (this *X) CleanCache(subscription any) {\n\tif InOp(this.Orderbooks, symbol) {\n\t\tRemove(this.Orderbooks, symbol)\n\t}\n}\n');
    ok (cleanCache.indexOf ('InOp(this.Orderbooks, symbol)') >= 0, 'CleanCache stays on the plain map');
    return problems;
}
