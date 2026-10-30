// hx11 w8 WT01: watchTickerBody reads one row of the typed ticker map. The body boxes the channel
// value (`StructResultMap(r.Value, TickerMapToMap)`) only to take `GetValue(tickers, key)` and
// rebuild a Ticker with `TickerFromMap`. r.Value is already a map[string]Ticker, so the row is
// `r.Value[key]` (a missing key is the zero Ticker, as TickerFromMap(nil) was). The key must be a
// *string (nil key -> zero Ticker, guarded) or a plain string, declared once and never rebound.

const WT01 = new RegExp (
    '^([ \\t]*)var (\\w+) map\\[string\\]any = (?:ccxt\\.)?StructResultMap\\((\\w+\\.Value), (?:ccxt\\.)?TickerMapToMap\\)\\n'
    + '((?:[ \\t]*\\n)*)'
    + '\\1ch <- ((?:ccxt\\.)?)AsyncResult\\[(?:ccxt\\.)?Ticker\\]\\{Value: (?:ccxt\\.)?TickerFromMap\\((?:ccxt\\.)?GetValue\\(\\2, (\\w+)\\)\\)\\}\\n', 'gm');

function wt01Uses (fn: string, name: string): number {
    return (fn.match (new RegExp ('(?<![\\w.])' + name + '\\b', 'g')) ?? []).length;
}

// 'ptr' for a once-declared `var k *string = ...`, 'str' for a `k string` param; never rebound or address-taken
function wt01KeyKind (fn: string, key: string): string | undefined {
    const rebound = new RegExp ('(?<![\\w.])' + key + ' *(?::=|=(?!=)|\\+=)|&' + key + '\\b|\\b' + key + '\\+\\+').test (fn.replace (new RegExp ('^[ \\t]*var ' + key + ' \\*string = ', 'm'), ''));
    if (rebound) {
        return undefined;
    }
    if (new RegExp ('[(,] *' + key + ' string[,)]').test (fn.split ('\n')[1] ?? '')) {
        return 'str';
    }
    const ptr = fn.match (new RegExp ('^[ \\t]*var ' + key + ' \\*string = ', 'gm'));
    return ((ptr !== null) && (ptr.length === 1)) ? 'ptr' : undefined;
}

export function hx11w8WT01Pass (content: string): string {
    if (content.indexOf ('TickerFromMap(') < 0) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}(?=\n)/g, (fn: string) => {
        return fn.replace (WT01, (m: string, ind: string, name: string, recv: string, blank: string | undefined, q: string, key: string) => {
            if ((wt01Uses (fn, name) !== 2) || (fn.indexOf ('tickerRow') >= 0)) {
                return m;
            }
            const kind = wt01KeyKind (fn, key);
            if (kind === 'str') {
                return ind + 'ch <- ' + q + 'AsyncResult[' + q + 'Ticker]{Value: ' + recv + '[' + key + ']}\n';
            }
            if (kind === 'ptr') {
                return ind + 'var tickerRow ' + q + 'Ticker\n' + ind + 'if ' + key + ' != nil {\n' + ind + '\ttickerRow = ' + recv + '[*' + key + ']\n' + ind + '}\n'
                    + (blank ?? '') + ind + 'ch <- ' + q + 'AsyncResult[' + q + 'Ticker]{Value: tickerRow}\n';
            }
            return m;
        });
    });
}

export function hx11w8WT01Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push ('WT01: ' + msg); } };
    const body = (head: string, decl: string, key: string) => '\nfunc (this *X) watchTickerBody(ch chan ccxt.AsyncResult[ccxt.Ticker], ' + head + ') any {\n' + decl
        + '\tr1 := <-this.WatchTickersAsync([]any{' + key + '})\n\tvar tickers map[string]any = ccxt.StructResultMap(r1.Value, ccxt.TickerMapToMap)\n\n'
        + '\tch <- ccxt.AsyncResult[ccxt.Ticker]{Value: ccxt.TickerFromMap(ccxt.GetValue(tickers, ' + key + '))}\n\treturn nil\n}\n';
    const ptr = hx11w8WT01Pass (body ('symbol string', '\tvar k *string = this.SafeSymbol(symbol)\n', 'k'));
    ok (ptr.indexOf ('if k != nil {\n\t\ttickerRow = r1.Value[*k]\n\t}') >= 0 && ptr.indexOf ('GetValue') < 0 && ptr.indexOf ('Value: tickerRow}') >= 0, 'ptr key: ' + ptr);
    const str = hx11w8WT01Pass (body ('symbol string', '', 'symbol'));
    ok (str.indexOf ('{Value: r1.Value[symbol]}') >= 0 && str.indexOf ('StructResultMap') < 0, 'string param: ' + str);
    ok (hx11w8WT01Pass (ptr) === ptr, 'idempotent');
    const keep = [
        body ('symbol string', '\tvar k any = this.Symbol(symbol)\n', 'k'),
        body ('symbol any', '', 'symbol'),
        body ('symbol string', '\tvar k *string = this.SafeSymbol(symbol)\n\tk = nil\n', 'k'),
        body ('symbol string', '\tvar k *string = this.SafeSymbol(symbol)\n\t_ = &k\n', 'k'),
    ];
    keep.forEach ((t, i) => ok (hx11w8WT01Pass (t) === t, 'unproven key keeps GetValue #' + i));
    return problems;
}
