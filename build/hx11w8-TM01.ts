// hx11 w8 TM01: a typed struct channel value that is boxed to its untyped map and rebuilt by the
// matching `<H>FromMap` is already the typed value. The printer's forward of a typed channel
// (`StructResultMap(r.Value, <H>ToMap)` for the map shape, then `<H>FromMap(that)` for the send)
// round-trips a `T` through `map[string]any` back into the same `T` (StructResultMap and the
// builder are typed by one `T`), so the send hands `r.Value` over and the local, its nil test and
// both sends go with it. A nil/zero value stays the zero `Value` of the carrier.

const TM01_NAME = '(?:ccxt\\.)?([A-Za-z]+)';

// `var N map[string]any = StructResultMap(R.Value, HToMap)` + nil/else sends of `HFromMap(N)`
const TM01_BRANCH = new RegExp (
    '^([ \\t]*)var (retRes\\d+) map\\[string\\]any = ((?:ccxt\\.)?)StructResultMap\\((\\w+\\.Value), (?:ccxt\\.)?([A-Za-z]+)ToMap\\)\\n'
    + '\\1if \\2 == nil \\{\\n'
    + '\\1\\tch <- ((?:ccxt\\.)?AsyncResult\\[[^\\n\\]]*(?:\\][A-Za-z.]+)?\\])\\{\\}\\n'
    + '\\1\\} else \\{\\n'
    + '\\1\\tch <- \\6\\{Value: (?:ccxt\\.)?\\5FromMap\\(\\2\\)\\}\\n'
    + '\\1\\}\\n', 'gm');

// `N := StructResultMap(R.Value, HToMap)` + one send of `HFromMap(N)`
const TM01_SHORT = new RegExp (
    '^([ \\t]*)(retRes\\d+) := ((?:ccxt\\.)?)StructResultMap\\((\\w+\\.Value), (?:ccxt\\.)?([A-Za-z]+)ToMap\\)\\n'
    + '\\1ch <- ((?:ccxt\\.)?AsyncResult\\[[^\\n]*\\])\\{Value: (?:ccxt\\.)?\\5FromMap\\(\\2\\)\\}\\n', 'gm');

function tm01Uses (fn: string, name: string): number {
    return (fn.match (new RegExp ('(?<![\\w.])' + name + '\\b', 'g')) ?? []).length;
}

export function hx11w8TM01Pass (content: string): string {
    if (content.indexOf ('StructResultMap(') < 0) {
        return content;
    }
    return content.replace (/\nfunc [\s\S]*?\n\}(?=\n)/g, (fn: string) => {
        let out = fn.replace (TM01_BRANCH, (m: string, ind: string, name: string, _q: string, recv: string, _h: string, carrier: string) => {
            return (tm01Uses (fn, name) === 3) ? (ind + 'ch <- ' + carrier + '{Value: ' + recv + '}\n') : m;
        });
        out = out.replace (TM01_SHORT, (m: string, ind: string, name: string, _q: string, recv: string, _h: string, carrier: string) => {
            return (tm01Uses (fn, name) === 2) ? (ind + 'ch <- ' + carrier + '{Value: ' + recv + '}\n') : m;
        });
        return out;
    });
}

export function hx11w8TM01Check (): string[] {
    const problems: string[] = [];
    const ok = (c: boolean, msg: string) => { if (!c) { problems.push (msg); } };
    const fn = (body: string) => '\nfunc (this *X) f(ch chan AsyncResult[map[string]Ticker]) any {\n' + body + '\treturn nil\n}\n';
    const branch = (q: string) => '\tvar retRes12 map[string]any = ' + q + 'StructResultMap(r.Value, ' + q + 'TickerMapToMap)\n\tif retRes12 == nil {\n\t\tch <- ' + q + 'AsyncResult[map[string]' + q + 'Ticker]{}\n\t} else {\n\t\tch <- ' + q + 'AsyncResult[map[string]' + q + 'Ticker]{Value: ' + q + 'TickerMapFromMap(retRes12)}\n\t}\n';
    for (const q of [ '', 'ccxt.' ]) {
        const want = fn ('\tch <- ' + q + 'AsyncResult[map[string]' + q + 'Ticker]{Value: r.Value}\n');
        ok (hx11w8TM01Pass (fn (branch (q))) === want, 'branch form (q=' + q + '): ' + hx11w8TM01Pass (fn (branch (q))));
        ok (hx11w8TM01Pass (want) === want, 'idempotent');
    }
    const short = fn ('\tretRes7 := ccxt.StructResultMap(r.Value, ccxt.TickerMapToMap)\n\tch <- ccxt.AsyncResult[map[string]ccxt.Ticker]{Value: ccxt.TickerMapFromMap(retRes7)}\n');
    ok (hx11w8TM01Pass (short) === fn ('\tch <- ccxt.AsyncResult[map[string]ccxt.Ticker]{Value: r.Value}\n'), 'short form');
    const two = branch ('') ;
    const pair = '\nfunc (this *X) a(ch chan AsyncResult[map[string]Ticker]) any {\n' + two + '\treturn nil\n}\nfunc (this *X) b(ch chan AsyncResult[map[string]Ticker]) any {\n' + two + '\treturn nil\n}\n';
    ok (hx11w8TM01Pass (pair).indexOf ('StructResultMap') < 0, 'adjacent funcs both rewritten: ' + hx11w8TM01Pass (pair));
    const keep = [
        fn (branch ('') + '\t_ = retRes12\n'),
        fn ('\tvar retRes12 map[string]any = StructResultMap(r.Value, TickerMapToMap)\n\tif retRes12 == nil {\n\t\tch <- AsyncResult[map[string]Ticker]{}\n\t} else {\n\t\tch <- AsyncResult[map[string]Ticker]{Value: FundingRateMapFromMap(retRes12)}\n\t}\n'),
        fn ('\tch <- AsyncResult[map[string]Ticker]{Value: TickerMapFromMap(this.Extend(a))}\n'),
    ];
    keep.forEach ((t, i) => ok (hx11w8TM01Pass (t) === t, 'unproven shape keeps its wrap #' + i));
    return problems;
}
