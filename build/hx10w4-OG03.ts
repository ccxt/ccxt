// HX10 W4 OG03: the ws ticker caches (Tickers / Bidsasks) and the boxed Positions cache are owned by
// the exchange's ws dispatch loop; handler code keeps the container operation, and the user-path
// functions below (watch/load/subscribe bodies, CleanWsData) hand the operation to the owner.
import { goChanMask, goChanClose } from './go-chan.js';

const TICKER_FIELDS = 'Tickers|Bidsasks';
const TICKER_RECV = new RegExp ('^this\\.(' + TICKER_FIELDS + ')$');
const TICKER_METHOD = new RegExp ('(?<![\\w.])this\\.(' + TICKER_FIELDS + ')\\.(Store|Get|Has|Delete|Keys|ToMap)\\(');
const TICKER_ANY = new RegExp ('this\\.(?:' + TICKER_FIELDS + ')\\b');
const POSITIONS_ANY = /(?<![\w.])this\.Positions\b/;
const CACHE_LITERAL = new RegExp ('^(\\s*)this\\.(' + TICKER_FIELDS + ') = (?:&)?(?:ccxt\\.)?TickerCache\\{\\}\\s*$');
const POSITIONS_SET = /^(\s*)this\.Positions = (.+)$/;

// the generated functions that run off the dispatch loop: bodies a watch/load/close goroutine
// executes, and the two helpers those bodies call. Handler code (Handle*), CleanCache,
// CleanUnsubscription and Init stay on the loop and keep their direct container operations.
const USER_PATH = /^(?:watch|load|subscribe)\w*$|^(?:SetPositionsCache|GetCurrentPosition|CleanWsData)$/;
const FUNC_HEAD = /^func \((?:[^)]*)\) (\w+)\(/;

type Span = { s: number, e: number };

// top-level comma split of the masked argument span (open, close)
function og03Split (masked: string, open: number, close: number): Span[] {
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
            spans.push ({ 's': s, 'e': i });
            s = i + 1;
        }
    }
    if (masked.substring (s, close).trim () !== '') {
        spans.push ({ 's': s, 'e': close });
    }
    return spans;
}

// `this.Tickers.Store(k, v)` -> the operation the owner performs, one call at a time
function og03TickerCall (line: string): string {
    for (let guard = 0; guard < 16; guard++) {
        const masked = goChanMask (line);
        const hit = TICKER_METHOD.exec (masked);
        if (hit === null) {
            return line;
        }
        const open = hit.index + hit[0].length - 1;
        const close = goChanClose (masked, open);
        if (close < 0) {
            return line;
        }
        const field = hit[1];
        const op = hit[2];
        const args = og03Split (masked, open, close - 1).map (a => line.substring (a.s, a.e).trim ());
        let text: string | undefined;
        if (op === 'Store') {
            text = (args.length === 2) ? 'this.WsCacheSet("' + field + '", ' + args[0] + ', ' + args[1] + ')' : undefined;
        } else if (op === 'Get') {
            text = (args.length === 1) ? 'this.WsCacheGet("' + field + '", ' + args[0] + ')' : undefined;
        } else if (op === 'Has') {
            text = (args.length === 1) ? 'this.WsCacheHas("' + field + '", ' + args[0] + ')' : undefined;
        } else if (op === 'Delete') {
            text = (args.length === 1) ? 'this.WsCacheDelete("' + field + '", ' + args[0] + ')' : undefined;
        } else if (op === 'Keys') {
            text = (args.length === 0) ? 'this.WsCacheKeys("' + field + '")' : undefined;
        } else {
            // ToMap: a copy taken on the owner, for the callers that walk the whole cache
            text = (args.length === 0) ? 'this.WsCacheSnapshot("' + field + '")' : undefined;
        }
        if (text === undefined) {
            return line;
        }
        line = line.substring (0, hit.index) + text + line.substring (close);
    }
    return line;
}

// the whole line, in a user-path function: ticker containers and the positions field
function og03UserLine (line: string): string {
    if (!TICKER_ANY.test (line) && !POSITIONS_ANY.test (line)) {
        return line;
    }
    const literal = CACHE_LITERAL.exec (goChanMask (line));
    if (literal !== null) {
        return literal[1] + 'this.WsCacheReset("' + literal[2] + '")';
    }
    const set = POSITIONS_SET.exec (line);
    if ((set !== null) && !/\/\//.test (line.substring (0, set[0].length))
        && (goChanMask (line).indexOf ('this.Positions') === goChanMask (line).lastIndexOf ('this.Positions'))) {
        return set[1] + 'this.WsCacheObjSet("Positions", ' + set[2] + ')';
    }
    line = og03TickerCall (line);
    return line.replace (/(?<![\w.])this\.Positions\b/g, 'this.WsCacheObjGet("Positions")');
}

export function hx10w4OG03Pass (content: string): string {
    if (!TICKER_ANY.test (content) && !POSITIONS_ANY.test (content)) {
        return content;
    }
    // the cache is a map type now: the literal the printer emitted for a *TickerCache field
    content = content.replace (/= &((?:ccxt\.)?)TickerCache\{}/g, '= $1TickerCache{}');
    const body = content.split ('\n');
    let inUserPath = false;
    for (let i = 0; i < body.length; i++) {
        const head = FUNC_HEAD.exec (body[i]);
        if (head !== null) {
            inUserPath = USER_PATH.test (head[1]);
            continue;
        }
        if (inUserPath) {
            body[i] = og03UserLine (body[i]);
        }
    }
    return body.join ('\n');
}

export function og03selfcheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w4-OG03: ' + message); } };
    const user = (body: string) => hx10w4OG03Pass ('func (this *X) watchTickersBody(ch chan any, symbols any) {\n' + body + '}\n');
    const handler = (body: string) => hx10w4OG03Pass ('func (this *X) HandleTicker(client any, message any) {\n' + body + '}\n');
    ok (user ('\tthis.Tickers.Store(symbol, ticker)\n').indexOf ('\tthis.WsCacheSet("Tickers", symbol, ticker)') >= 0,
        'a watch body stores through the owner');
    ok (user ('\tvar ticker any = this.Tickers.Get(symbol)\n').indexOf ('var ticker any = this.WsCacheGet("Tickers", symbol)') >= 0,
        'a watch body reads through the owner');
    ok (user ('\tif this.Bidsasks.Has(symbol) {\n\t}\n').indexOf ('if this.WsCacheHas("Bidsasks", symbol) {') >= 0,
        'membership is an owner operation');
    ok (user ('\tthis.Tickers.Delete(symbol)\n').indexOf ('\tthis.WsCacheDelete("Tickers", symbol)') >= 0,
        'a delete is an owner operation');
    ok (user ('\tvar symbols []string = this.Bidsasks.Keys()\n').indexOf ('var symbols []string = this.WsCacheKeys("Bidsasks")') >= 0,
        'the key list is taken on the owner');
    ok (user ('\treturn this.Tickers.ToMap()\n').indexOf ('\treturn this.WsCacheSnapshot("Tickers")') >= 0,
        'a whole-cache walk reads a snapshot');
    ok (user ('\tswitch resolvedBox := this.FilterByArray(this.Tickers.ToMap(), "symbol", symbolsNormalized).(type) {\n').indexOf ('this.FilterByArray(this.WsCacheSnapshot("Tickers"), "symbol", symbolsNormalized)') >= 0,
        'FilterByArray over a snapshot survives');
    ok (user ('\tvar cache any = this.Positions\n').indexOf ('var cache any = this.WsCacheObjGet("Positions")') >= 0,
        'the positions field is read through the owner');
    ok (user ('\tthis.Positions = ccxt.NewArrayCacheBySymbolBySide()\n').indexOf ('\tthis.WsCacheObjSet("Positions", ccxt.NewArrayCacheBySymbolBySide())') >= 0,
        'the positions field is written through the owner');
    ok (user ('\tif this.Positions == nil {\n\t}\n').indexOf ('if this.WsCacheObjGet("Positions") == nil {') >= 0,
        'a nil test reads through the owner');
    const clean = hx10w4OG03Pass ('func (this *BaseExchange) CleanWsData() {\n\tthis.Tickers = TickerCache{}\n\tthis.Positions = nil\n}\n');
    ok (clean.indexOf ('\tthis.WsCacheReset("Tickers")') >= 0, 'CleanWsData resets through the owner');
    ok (clean.indexOf ('\tthis.WsCacheObjSet("Positions", nil)') >= 0, 'CleanWsData clears positions through the owner');
    // a handler already runs on the owner goroutine: an owner request there would wait on itself
    const handle = handler ('\tthis.Tickers.Store(symbol, ticker)\n\tif this.Tickers == nil {\n\t\tthis.Tickers = ccxt.TickerCache{}\n\t}\n\tvar cache any = this.Positions\n\tthis.Positions = ccxt.NewArrayCacheBySymbolById()\n');
    ok (handle.indexOf ('\tthis.Tickers.Store(symbol, ticker)') >= 0, 'a handler keeps the direct store');
    ok (handle.indexOf ('this.Tickers = ccxt.TickerCache{}') >= 0, 'the cache literal is the map type');
    ok (handle.indexOf ('var cache any = this.Positions') >= 0, 'a handler keeps the direct positions read');
    ok (handle.indexOf ('WsCache') < 0, 'a handler never asks the owner');
    const init = hx10w4OG03Pass ('func (this *BaseExchange) Init() {\n\tthis.Tickers = &TickerCache{}\n\tthis.Bidsasks = &ccxt.TickerCache{}\n}\n');
    ok (init.indexOf ('\tthis.Tickers = TickerCache{}') >= 0, 'Init keeps the base-package literal');
    ok (init.indexOf ('\tthis.Bidsasks = ccxt.TickerCache{}') >= 0, 'Init keeps the imported literal');
    ok (init.indexOf ('WsCache') < 0, 'Init runs before any other goroutine');
    return problems;
}
