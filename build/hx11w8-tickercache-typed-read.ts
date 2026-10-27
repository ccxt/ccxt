// HX11 w8 xt-tickercache-typed-read: a typed channel send of a ws ticker cache read prints the cache
// snapshot boxed through TickerMapFromMap. The typed read is one BaseExchange method that takes the
// snapshot on the owner and answers map[string]Ticker (exchange_ws_cache.go), so the send needs no wrapper.
//   TickerMapFromMap(any(this.WsCacheSnapshot("Tickers")))                                   -> this.WsCacheTickerMap("Tickers")
//   TickerMapFromMap(this.FilterByArray(this.WsCacheSnapshot("Tickers"), "symbol", symbols)) -> this.WsCacheTickerMap("Tickers", symbols)
const WHOLE = /(?<![\w.])(?:ccxt\.)?TickerMapFromMap\(any\(this\.WsCacheSnapshot\("(Tickers|Bidsasks)"\)\)\)/g;
const FILTERED = /(?<![\w.])(?:ccxt\.)?TickerMapFromMap\(this\.FilterByArray\(this\.WsCacheSnapshot\("(Tickers|Bidsasks)"\), "symbol", (\w+)\)\)/g;

export function hx11w8TickerReadPass (content: string): string {
    if (content.indexOf ('WsCacheSnapshot(') < 0) {
        return content;
    }
    return content.replace (WHOLE, 'this.WsCacheTickerMap("$1")').replace (FILTERED, 'this.WsCacheTickerMap("$1", $2)');
}

export function hx11w8TickerReadCheck (): string[] {
    const problems: string[] = [];
    const send = (e: string) => '\tch <- ccxt.AsyncResult[map[string]ccxt.Ticker]{Value: ' + e + '}\n';
    const cases: [ string, string ][] = [
        [ send ('ccxt.TickerMapFromMap(any(this.WsCacheSnapshot("Tickers")))'), send ('this.WsCacheTickerMap("Tickers")') ],
        [ send ('ccxt.TickerMapFromMap(this.FilterByArray(this.WsCacheSnapshot("Bidsasks"), "symbol", symbolsNormalized))'), send ('this.WsCacheTickerMap("Bidsasks", symbolsNormalized)') ],
        [ send ('ccxt.TickerMapFromMap(this.FilterByArrayTickers(this.WsCacheSnapshot("Tickers"), "symbol", symbols))'), send ('ccxt.TickerMapFromMap(this.FilterByArrayTickers(this.WsCacheSnapshot("Tickers"), "symbol", symbols))') ],
        [ send ('ccxt.TickerMapFromMap(tickers)'), send ('ccxt.TickerMapFromMap(tickers)') ],
    ];
    for (const [ input, want ] of cases) {
        const got = hx11w8TickerReadPass (input);
        if (got !== want) {
            problems.push ('hx11w8-tickercache-typed-read: ' + input.trim () + ' -> ' + got.trim ());
        }
    }
    return problems;
}
