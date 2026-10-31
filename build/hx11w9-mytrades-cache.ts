// HX11 w9: BaseExchange.MyTrades is a typed list cache (WsArrayCache, go/v4/exchange_ws_array_cache.go).
// A local that only ever holds the cache or a freshly built list cache is typed WsArrayCache, and the
// Append assertion on a typed cache goes.
import { goChanMask } from './go-chan.js';

const TRADES_VALUE = /^(?:this\.MyTrades|nil|(?:ccxt\.)?NewArrayCache(?:BySymbolById|ByOutcomeById)?\(.*\))$/;
const DECL = /^(\s*)var (\w+) any = this\.MyTrades$/;
const esc = (name: string): string => name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

function funcRanges (lines: string[]): Array<[number, number]> {
    const ranges: Array<[number, number]> = [];
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            ranges.push ([ start, k + 1 ]);
            start = -1;
        }
    }
    return ranges;
}

function retypeMyTradesLocals (lines: string[], masked: string[], q: string) {
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        if (text.indexOf ('this.MyTrades') < 0) {
            continue;
        }
        const names = new Set<string> ();
        for (let k = start + 1; k < end; k++) {
            const decl = DECL.exec (masked[k]);
            if (decl !== null) {
                names.add (decl[2]);
            }
        }
        for (const name of names) {
            const n = esc (name);
            const decls = text.match (new RegExp ('(?<![\\w.])var ' + n + '\\b', 'g')) || [];
            const own = text.match (new RegExp ('^\\s*var ' + n + ' any = this\\.MyTrades$', 'gm')) || [];
            const rebinding = new RegExp ('(?<![\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*:?=(?!=)|&\\s*' + n + '\\b|func\\([^)]*\\b' + n + '\\b');
            const otherType = new RegExp ('(?<![\\w.])' + n + '\\.\\((?!(?:ccxt\\.)?Appender\\)|\\*ccxt\\.ArrayCache\\))');
            if ((decls.length !== own.length) || rebinding.test (text) || otherType.test (text)) {
                continue;
            }
            const anyWrite = new RegExp ('^\\s*' + n + ' = (.*)$');
            let ok = true;
            for (let j = start + 1; ok && (j < end); j++) {
                const w = anyWrite.exec (masked[j]);
                if ((w !== null) && !TRADES_VALUE.test (w[1].trim ())) {
                    ok = false;
                }
            }
            if (!ok) {
                continue;
            }
            for (let j = start + 1; j < end; j++) {
                if (DECL.test (masked[j]) && (DECL.exec (masked[j]) as RegExpExecArray)[2] === name) {
                    lines[j] = lines[j].replace (' any = this.MyTrades', ' ' + q + 'WsArrayCache = this.MyTrades');
                }
            }
            retyped (lines, masked, start, end, n);
        }
    }
}

// uses of a typed cache: no assertion before Append, nil checks are plain comparisons
function retyped (lines: string[], masked: string[], start: number, end: number, n: string) {
    const append = new RegExp ('(?<![\\w.])(' + n + ')\\.\\((?:ccxt\\.)?Appender\\)\\.Append\\(', 'g');
    const nilEq = new RegExp ('(!?)(?:ccxt\\.)?IsEqual\\((' + n + '), nil\\)', 'g');
    for (let k = start; k < end; k++) {
        if (append.test (masked[k]) || nilEq.test (masked[k])) {
            lines[k] = lines[k].replace (append, '$1.Append(').replace (nilEq, (_m, bang, id) => id + (bang === '!' ? ' != nil' : ' == nil'));
        }
        append.lastIndex = 0;
        nilEq.lastIndex = 0;
    }
}

export function hx11w9MyTradesCachePass (content: string): string {
    if (content.indexOf ('this.MyTrades') < 0) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    retypeMyTradesLocals (lines, masked, q);
    content = lines.join ('\n');
    // the field answers the cache itself: the assertion before its Append goes
    content = content.replace (/(?<![\w.])this\.MyTrades\.\((?:ccxt\.)?Appender\)\.Append\(/g, 'this.MyTrades.Append(');
    return content;
}

export function hx11w9MyTradesCacheCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-mytrades-cache: ' + message); } };
    const wrap = (body: string) => 'package ccxtpro\n\nfunc (this *X) HandleOrder(client any, message map[string]any) {\n' + body + '}\n';
    const out = hx11w9MyTradesCachePass (wrap ([
        '\tvar myTrades any = this.MyTrades',
        '\tif ccxt.IsEqual(myTrades, nil) {',
        '\t\tmyTrades = ccxt.NewArrayCacheBySymbolById(limit)',
        '\t\tthis.MyTrades = myTrades',
        '\t}',
        '\tmyTrades.(ccxt.Appender).Append(order)',
        '\tthis.MyTrades.(ccxt.Appender).Append(order)',
        '\tclient.(ccxt.ClientInterface).Resolve(myTrades, messageHash)',
        '',
    ].join ('\n')));
    for (const want of [ 'var myTrades ccxt.WsArrayCache = this.MyTrades', 'if myTrades == nil {', '\tmyTrades.Append(order)', '\tthis.MyTrades.Append(order)', 'Resolve(myTrades, messageHash)' ]) {
        ok (out.indexOf (want) >= 0, 'missing ' + want + ' in ' + out);
    }
    ok (out.indexOf ('Appender') < 0, 'an assertion is left: ' + out);
    const mixed = hx11w9MyTradesCachePass (wrap ('\tvar o any = this.MyTrades\n\to = message\n\to.(ccxt.Appender).Append(x)\n'));
    ok (mixed.indexOf ('var o any = this.MyTrades') >= 0, 'a mixed local stays any: ' + mixed);
    const other = hx11w9MyTradesCachePass (wrap ('\tvar o any = this.MyTrades\n\tvar m map[string]any = o.(map[string]any)\n'));
    ok (other.indexOf ('var o any = this.MyTrades') >= 0, 'a local asserted to a map stays any: ' + other);
    return problems;
}
