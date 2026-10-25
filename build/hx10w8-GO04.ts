// hx10 w8 GO04: a resolved-map coercion whose only consumer is a typed `<T>FromMap` builder is
// redundant. The builders already take `any` and coerce the box themselves (RowDict in
// go/v4/exchange_struct_returns.go: a map passes through, a *sync.Map converts, anything else is
// not a dictionary), so the site hands its boxed value straight over and the four-arm switch, its
// map local and its SafeMapToMap call go with it. A coercion feeding anything else (a
// `AsyncResult[map[string]any]` field) keeps every line: that one needs the map type.

const GO04_VAR = /^(\s*)var (\w+) map\[string\]any$/;
const GO04_SWITCH = /^(\s*)switch (\w+) := (.+)\.\(type\) \{$/;
const GO04_PANIC_TEXT = 'panic(ccxt.ExchangeError("resolved value is not map[string]any"))';
const GO04_PANIC_TEXT_LOCAL = 'panic(ExchangeError("resolved value is not map[string]any"))';

// every hand-written <T>FromMap builder (go/v4/exchange_struct_returns.go) reads its box via RowDict
const GO04_BUILDERS = new Set<string>([
    'AccountFromMap', 'ADLFromMap', 'BalanceFromMap', 'BalancesFromMap', 'BorrowInterestFromMap',
    'ConversionFromMap', 'CrossBorrowRateFromMap', 'CrossBorrowRateMapFromMap', 'CurrenciesFromMap',
    'CurrencyFromMap', 'DepositAddressFromMap', 'DepositAddressMapFromMap', 'DepositWithdrawFeeFromMap',
    'DepositWithdrawFeeMapFromMap', 'FundingHistoryFromMap', 'FundingRateFromMap', 'FundingRateHistoryFromMap',
    'FundingRateMapFromMap', 'GreeksFromMap', 'GreeksMapFromMap', 'IsolatedBorrowRateFromMap',
    'IsolatedBorrowRateMapFromMap', 'LastPriceFromMap', 'LastPriceMapFromMap', 'LedgerEntryFromMap',
    'LeverageFromMap', 'LeverageMapFromMap', 'LeverageTierFromMap', 'LeverageTiersFromMap',
    'LiquidationFromMap', 'LongShortRatioFromMap', 'MarginLoanFromMap', 'MarginModeFromMap',
    'MarginModeMapFromMap', 'MarginModificationFromMap', 'MarketInterfaceFromMap',
    'OHLCVForSymbolsMapFromMap', 'OpenInterestFromMap', 'OpenInterestMapFromMap', 'OptionFromMap',
    'OptionMapFromMap', 'OrderBookFromMap', 'OrderBookL3FromMap', 'OrderBookMapFromMap', 'OrderFromMap',
    'PositionFromMap', 'PositionModeInfoFromMap', 'PredictionEventFromMap', 'PredictionEventMapFromMap',
    'PredictionOpenInterestFromMap', 'PredictionOrderBookFromMap', 'PredictionOrderFromMap',
    'PredictionOutcomeFromMap', 'PredictionOutcomeMapFromMap', 'PredictionPositionFromMap',
    'PredictionSettlementFromMap', 'PredictionTickerFromMap', 'PredictionTickerMapFromMap',
    'PredictionTradeFromMap', 'PredictionTradingFeeFromMap', 'StatusFromMap', 'TickerFromMap',
    'TickerMapFromMap', 'TradeFromMap', 'TradingFeeInterfaceFromMap', 'TradingFeeInterfaceMapFromMap',
    'TransactionFromMap', 'TransferEntryFromMap',
]);

// end (exclusive) of the coercion block starting at the var line, -1 when the shape is not the
// printer's four-arm (or its og06 three-arm) coercion
function go04BlockEnd (lines: string[], at: number, ind: string, v: string, box: string): number {
    let i = at + 1;
    if (lines[i] !== ind + 'case map[string]any:') {
        return -1;
    }
    if (lines[i + 1] !== ind + '\t' + v + ' = ' + box) {
        return -1;
    }
    i += 2;
    if (lines[i] === ind + 'case *sync.Map:') {
        const arm = lines[i + 1] ?? '';
        if ((arm !== ind + '\t' + v + ' = SafeMapToMap(' + box + ')') && (arm !== ind + '\t' + v + ' = ccxt.SafeMapToMap(' + box + ')')) {
            return -1;
        }
        i += 2;
    }
    if ((lines[i] !== ind + 'case nil:') || (lines[i + 1] !== ind + 'default:')) {
        return -1;
    }
    const panicLine = lines[i + 2] ?? '';
    if ((panicLine !== ind + '\t' + GO04_PANIC_TEXT) && (panicLine !== ind + '\t' + GO04_PANIC_TEXT_LOCAL)) {
        return -1;
    }
    if ((lines[i + 3] ?? '') !== ind + '}') {
        return -1;
    }
    return i + 4;
}

// the single builder call on the use line: `<q><Name>(<v>)`, or null when the line reads the box
// in any other way
function go04Use (line: string, v: string): { name: string, q: string } | null {
    if (line.split (new RegExp ('\\b' + v + '\\b')).length !== 2) {
        return null;
    }
    const quote = line.indexOf (v + ')');
    if (quote < 0) {
        return null;
    }
    let open = quote - 1;
    while ((open >= 0) && (/[\w.]/.test (line[open]))) {
        open--;
    }
    if (line[open] !== '(') {
        return null;
    }
    const qualified = line.slice (0, open);
    const m = /(?:^|[^\w.])((?:ccxt\.)?(\w+))$/.exec (qualified);
    if (m === null) {
        return null;
    }
    if (!GO04_BUILDERS.has (m[2])) {
        return null;
    }
    return { name: m[1], q: m[1].startsWith ('ccxt.') ? 'ccxt.' : '' };
}

// the indent a line carries, in tabs
function go04IndentWidth (line: string): number {
    let n = 0;
    while (line[n] === '\t') {
        n++;
    }
    return n;
}

// the box is read again inside the block that declares it: leave the coercion alone. A read past
// the block's close is another variable (a `var` in a Go block is scoped to that block).
function go04UsedLater (lines: string[], from: number, v: string, ind: string): boolean {
    const rx = new RegExp ('\\b' + v + '\\b');
    const width = go04IndentWidth (ind);
    for (let i = from; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim () === '') {
            continue;
        }
        if (go04IndentWidth (line) < width) {
            return false;
        }
        if (rx.test (line)) {
            return true;
        }
    }
    return false;
}

// drop the coercion block and hand its boxed subject to the builder
export function hx10w8GO04Pass (content: string): string {
    const lines = content.split ('\n');
    const drop = new Set<number>();
    const rewrite = new Map<number, string>();
    for (let i = 0; i + 1 < lines.length; i++) {
        const decl = GO04_VAR.exec (lines[i]);
        if (decl === null) {
            continue;
        }
        const head = GO04_SWITCH.exec (lines[i + 1]);
        if ((head === null) || (head[1] !== decl[1]) || (head[2] !== decl[2] + 'Box')) {
            continue;
        }
        const ind = decl[1];
        const v = decl[2];
        const box = head[2];
        const expr = head[3];
        const end = go04BlockEnd (lines, i + 1, ind, v, box);
        if (end < 0) {
            continue;
        }
        let use = end;
        while ((use < lines.length) && (lines[use].trim () === '')) {
            use++;
        }
        if (use >= lines.length) {
            continue;
        }
        const call = go04Use (lines[use], v);
        if (call === null) {
            continue;
        }
        if (go04UsedLater (lines, use + 1, v, ind)) {
            continue;
        }
        for (let k = i; k < end; k++) {
            drop.add (k);
        }
        rewrite.set (use, lines[use].replace (call.name + '(' + v + ')', call.name + '(' + expr + ')'));
        i = use;
    }
    if ((drop.size === 0) && (rewrite.size === 0)) {
        return content;
    }
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (drop.has (i)) {
            continue;
        }
        out.push (rewrite.get (i) ?? lines[i]);
    }
    const text = out.join ('\n');
    const code = text.replace (/\/\*[\s\S]*?\*\//g, ' ').replace (/\/\/[^\n]*/g, ' ');
    if (/\bsync\./.test (code)) {
        return text;
    }
    // the coercion's sync.Map arm was the file's only sync reference
    return text.replace (/^import "sync"\n/m, '');
}

// a coercion of the emitted shape, so the self-check reads like a generated file
function go04Sample (opts: { ind?: string, q?: string, v?: string, expr?: string, use?: string, arm?: boolean, extra?: string, panic?: string } = {}): string {
    const ind = opts.ind ?? '\t';
    const q = opts.q ?? 'ccxt.';
    const v = opts.v ?? 'resolved';
    const box = v + 'Box';
    const expr = opts.expr ?? 'r1.Value';
    const use = opts.use ?? 'ch <- AsyncResult[ccxt.Ticker]{Value: ' + q + 'TickerFromMap(' + v + ')}';
    const arm = (opts.arm ?? true)
        ? ind + 'case *sync.Map:\n' + ind + '\t' + v + ' = ' + q + 'SafeMapToMap(' + box + ')\n'
        : '';
    const panic = opts.panic ?? 'resolved value is not map[string]any';
    return 'package ccxt\n\nimport ccxt "x"\nimport "sync"\n\n'
        + 'func (this *X) F() any {\n'
        + ind + 'var ' + v + ' map[string]any\n'
        + ind + 'switch ' + box + ' := ' + expr + '.(type) {\n'
        + ind + 'case map[string]any:\n'
        + ind + '\t' + v + ' = ' + box + '\n'
        + arm
        + ind + 'case nil:\n'
        + ind + 'default:\n'
        + ind + '\tpanic(' + q + 'ExchangeError("' + panic + '"))\n'
        + ind + '}\n'
        + ind + use + '\n'
        + ind + 'return nil\n'
        + (opts.extra ?? '')
        + '}\n';
}

export function hx10w8GO04Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, message: string): void => {
        if (!cond) {
            problems.push ('hx10 w8 GO04: ' + message);
        }
    };
    const run = (s: string): string => {
        try {
            return hx10w8GO04Pass (s);
        } catch (e: any) {
            problems.push ('hx10 w8 GO04 threw: ' + e.message);
            return s;
        }
    };
    ok (typeof hx10w8GO04Pass ('') === 'string', 'the pass is total');
    for (const q of [ 'ccxt.', '' ]) {
        const out = run (go04Sample ({ q }));
        ok (out.indexOf ('switch resolvedBox') < 0, 'the coercion switch goes (q=' + q + ')');
        ok (out.indexOf ('var resolved map[string]any') < 0, 'the map local goes (q=' + q + ')');
        ok (out.indexOf ('SafeMapToMap') < 0, 'no SafeMapToMap call survives (q=' + q + ')');
        ok (out.indexOf ('resolved value is not map[string]any') < 0, 'the panic guard goes (q=' + q + ')');
        ok (out.indexOf ('Value: ' + q + 'TickerFromMap(r1.Value)') >= 0, 'the builder takes the boxed subject (q=' + q + ')');
        ok (out.indexOf ('import "sync"') < 0, 'an arm that was the only sync reference drops the import (q=' + q + ')');
        ok (run (out) === out, 'the rewrite is idempotent (q=' + q + ')');
        ok (run (go04Sample ({ q, expr: 'ccxt.GetValue(tickers, symbolValue)' })).indexOf ('TickerFromMap(ccxt.GetValue(tickers, symbolValue))') >= 0, 'a nested call subject keeps its parens (q=' + q + ')');
        // og06 already dropped the arm for a proven producer: the remaining three cases still go
        const armless = run (go04Sample ({ q, arm: false, expr: 'this.WsCacheSnapshot("Tickers")' }));
        ok (armless.indexOf ('switch resolvedBox') < 0, 'an armless coercion collapses too (q=' + q + ')');
        const nested = run (go04Sample ({ q, ind: '\t\t' }));
        ok (nested.indexOf ('\t\tch <- AsyncResult[ccxt.Ticker]{Value: ' + q + 'TickerFromMap(r1.Value)}') >= 0, 'a nested block keeps its indent (q=' + q + ')');
    }
    // a box that still feeds a map field needs its type: every line stays
    const keepMap = [
        go04Sample ({ use: 'ch <- AsyncResult[map[string]any]{Value: resolved}' }),
        go04Sample ({ use: 'var copy map[string]any = resolved' }),
        go04Sample ({ use: 'log.Print(resolved)' }),
        // a builder the runtime did not convert to RowDict
        go04Sample ({ use: 'ch <- AsyncResult[X]{Value: this.ParseTicker(resolved)}' }),
    ];
    for (const body of keepMap) {
        ok (run (body) === body, 'an unproven consumer keeps the coercion');
    }
    // two reads of the box after the block: not a single-consumer coercion
    const twice = go04Sample ({ use: 'a := ccxt.TickerFromMap(resolved)', extra: '\tb := ccxt.OrderFromMap(resolved)\n' });
    ok (run (twice) === twice, 'a second read of the box keeps the coercion');
    // a foreign arm body / a different panic text is not the printer's coercion
    const foreign = go04Sample ({}).replace ('ccxt.SafeMapToMap(resolvedBox)', 'ccxt.SafeMapToMap(otherBox)');
    ok (run (foreign) === foreign, 'a foreign arm body is untouched');
    const otherPanic = go04Sample ({ panic: 'resolved value is not map[string]ccxt.Ticker' });
    ok (run (otherPanic) === otherPanic, 'a different panic text is untouched');
    // a file that still reads sync elsewhere keeps its import
    const mutex = go04Sample ({ extra: '\tvar mu sync.Mutex\n\t_ = mu\n' });
    ok (run (mutex).indexOf ('import "sync"') >= 0, 'another sync reference keeps the import');
    ok (run (mutex).indexOf ('switch resolvedBox') < 0, 'the coercion still goes in a file that reads sync elsewhere');
    return problems;
}
