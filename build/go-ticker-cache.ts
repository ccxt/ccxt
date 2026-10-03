// GO-TICKER-CACHE: BaseExchange.Tickers / Bidsasks are typed caches (*ccxt.TickerCache, a SyncMap).
// Rewrites the generated helper uses of those fields into the cache's own methods; runs after
// every other formatGoSource pass (goChan3 emits `any(this.Tickers)` switches).
import { goChanMask, goChanClose } from './go-chan.js';

const RECV = /^this\.(?:Tickers|Bidsasks)$/;

// split the masked argument list text [open+1, close-1) at depth-0 commas -> [start, end) spans
function goTickerCacheArgs (masked: string, open: number, close: number): Array<[number, number]> {
    const spans: Array<[number, number]> = [];
    let depth = 0;
    let s = open + 1;
    for (let i = open + 1; i < close - 1; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '{') || (c === '[')) {
            depth++;
        } else if ((c === ')') || (c === '}') || (c === ']')) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            spans.push ([ s, i ]);
            s = i + 1;
        }
    }
    spans.push ([ s, close - 1 ]);
    return spans;
}

// helper call -> (recv, args) => replacement
const CALLS: { [name: string]: (r: string, a: string[], q: string) => string | undefined } = {
    'AddElementToObject': (r, a) => (a.length === 3) ? r + '.Store(' + a[1] + ', ' + a[2] + ')' : undefined,
    'GetValue': (r, a) => (a.length === 2) ? r + '.Get(' + a[1] + ')' : undefined,
    'SafeValue': (r, a) => (a.length === 2) ? r + '.Get(' + a[1] + ')' : undefined,
    'SafeDict': (r, a) => (a.length === 2) ? r + '.Get(' + a[1] + ')' : undefined,
    'SafeMapTyped': (r, a, q) => (a.length === 2) ? q + 'MapTyped(' + r + '.Get(' + a[1] + '))' : undefined,
    'InOp': (r, a) => (a.length === 2) ? r + '.Has(' + a[1] + ')' : undefined,
    'Remove': (r, a) => (a.length === 2) ? r + '.Delete(' + a[1] + ')' : undefined,
    'ObjectKeys': (r, a) => (a.length === 1) ? r + '.Keys()' : undefined,
};

export function goTickerCachePass (content: string): string {
    if (!/\bthis\.(?:Tickers|Bidsasks)\b/.test (content)) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    // innermost-first: repeat until no helper call on the receiver is left
    for (let guard = 0; guard < 8; guard++) {
        const masked = goChanMask (content);
        const re = /(?<![\w])(?:(?:ccxt\.|this\.)?)(AddElementToObject|GetValue|SafeValue|SafeDict|SafeMapTyped|InOp|Remove|ObjectKeys)\(this\.(?:Tickers|Bidsasks)[,)]/g;
        let m: RegExpExecArray | null;
        let out = '';
        let cursor = 0;
        let changed = false;
        while ((m = re.exec (masked)) !== null) {
            const open = m.index + m[0].indexOf ('(');
            const close = goChanClose (masked, open);
            if ((close < 0) || (m.index < cursor)) {
                continue;
            }
            const args = goTickerCacheArgs (masked, open, close).map (([ s, e ]) => content.substring (s, e).trim ());
            if (!RECV.test (args[0])) {
                continue;
            }
            // this.SafeValue/SafeDict are methods; the package helpers print ccxt./bare
            const text = CALLS[m[1]] (args[0], args, q);
            if (text === undefined) {
                continue;
            }
            out += content.substring (cursor, m.index) + text;
            cursor = close;
            changed = true;
            re.lastIndex = close;
        }
        content = out + content.substring (cursor);
        if (!changed) {
            break;
        }
    }
    // value positions: the cache reads as a snapshot map
    content = content.replace (/\bthis\.(Tickers|Bidsasks) = this\.CreateSafeDictionary\((?:true)?\)/g, 'this.$1 = &' + q + 'TickerCache{}');
    content = content.replace (/\bany\(this\.(Tickers|Bidsasks)\)/g, 'any(this.$1.ToMap())');
    content = content.replace (/(\bFilterByArray(?:Tickers)?\()this\.(Tickers|Bidsasks),/g, '$1this.$2.ToMap(),');
    content = content.replace (/(\.Resolve\()this\.(Tickers|Bidsasks),/g, '$1this.$2.ToMap(),');
    content = content.replace (/(\breturn )this\.(Tickers|Bidsasks)$/gm, '$1this.$2.ToMap()');
    return content;
}

// every remaining `this.Tickers` use must be a method call, a nil test or an assignment
export function goTickerCacheResidue (content: string): string[] {
    const masked = goChanMask (content);
    const bad: string[] = [];
    for (const m of masked.matchAll (/\bthis\.(?:Tickers|Bidsasks)\b(?!\.(?:Store|Get|Has|Delete|Keys|ToMap|Load)\()(?! (?:==|!=) nil)(?! = &)/g)) {
        bad.push (content.substring (content.lastIndexOf ('\n', m.index) + 1, content.indexOf ('\n', m.index)).trim ());
    }
    return bad;
}

export function goTickerCacheSelfTest (): string[] {
    const problems: string[] = [];
    const src = [
        'package ccxtpro',
        'func (this *X) H(client any, symbol *string, t map[string]any) any {',
        '\tccxt.AddElementToObject(this.Tickers, symbol, t)',
        '\tclient.(ccxt.ClientInterface).Resolve(ccxt.GetValue(this.Tickers, symbol), \"h\")',
        '\tccxt.AddElementToObject(ccxt.GetValue(this.Bidsasks, symbol), \"symbol\", symbol)',
        '\tvar a map[string]any = ccxt.SafeMapTyped(this.Tickers, symbol)',
        '\tif ccxt.InOp(this.Tickers, symbol) {',
        '\t\tccxt.Remove(this.Tickers, symbol)',
        '\t}',
        '\tvar k []string = ccxt.ObjectKeys(this.Bidsasks)',
        '\tvar l any = this.SafeDict(this.Tickers, symbol)',
        '\tthis.Tickers = this.CreateSafeDictionary()',
        '\tswitch resolvedBox := this.FilterByArray(this.Tickers, \"symbol\", k).(type) {',
        '\t}',
        '\tswitch resolvedBox := any(this.Tickers).(type) {',
        '\t}',
        '\tclient.(ccxt.ClientInterface).Resolve(this.Tickers, \"x\")',
        '\tif this.Tickers == nil {',
        '\t}',
        '\treturn this.Bidsasks',
        '}',
    ].join ('\n');
    const out = goTickerCachePass (src);
    const want = [
        'this.Tickers.Store(symbol, t)', 'Resolve(this.Tickers.Get(symbol), "h")', 'ccxt.AddElementToObject(this.Bidsasks.Get(symbol), "symbol", symbol)',
        'ccxt.MapTyped(this.Tickers.Get(symbol))', 'if this.Tickers.Has(symbol) {', 'this.Tickers.Delete(symbol)', 'this.Bidsasks.Keys()',
        'var l any = this.Tickers.Get(symbol)', 'this.Tickers = &ccxt.TickerCache{}', 'this.FilterByArray(this.Tickers.ToMap(), "symbol", k)',
        'any(this.Tickers.ToMap())', 'Resolve(this.Tickers.ToMap(), "x")', 'return this.Bidsasks.ToMap()',
    ];
    for (const w of want) {
        if (out.indexOf (w) < 0) {
            problems.push ('go-ticker-cache: missing ' + w);
        }
    }
    const residue = goTickerCacheResidue (out);
    if (residue.length) {
        problems.push ('go-ticker-cache: residue ' + residue.join (' | '));
    }
    if (goTickerCachePass ('package ccxt\nfunc F() {\n\tthis.Tickers = this.CreateSafeDictionary(true)\n}\n').indexOf ('&TickerCache{}') < 0) {
        problems.push ('go-ticker-cache: base package must not qualify');
    }
    return problems;
}
