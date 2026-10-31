// HX11 w9: BaseExchange.Trades is a typed cache (TradesCache, go/v4/exchange_trades_cache.go).
// Its helper calls print the cache's own methods, a local that only ever holds a cached or freshly
// built list cache is typed WsArrayCache, and the Append assertion on a typed cache goes.
import { goChanMask, goChanClose } from './go-chan.js';

const HELPER = /(?<![\w])(?:(?:ccxt\.|this\.)?)(AddElementToObject|GetValue|SafeValue|InOp|IsEqual)\(this\.Trades[,)]/g;
// values a trades local may hold: a cache read, a constructor, nil
const CACHE_VALUE = /^(?:this\.Trades\[[^\]]+\]|this\.Trades\.Get\([^()]*\)|nil|(?:ccxt\.)?NewArrayCache(?:BySymbolById|ByOutcomeById)?\(.*\))$/;
const esc = (name: string): string => name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

function splitArgs (masked: string, open: number, close: number): Array<[number, number]> {
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

const CALLS: { [name: string]: (a: string[]) => string | undefined } = {
    'AddElementToObject': (a) => (a.length === 3) ? 'this.Trades.Store(' + a[1] + ', ' + a[2] + ')' : undefined,
    'GetValue': (a) => (a.length === 2) ? 'this.Trades.Get(' + a[1] + ')' : undefined,
    'SafeValue': (a) => (a.length === 2) ? 'this.Trades.Get(' + a[1] + ')' : undefined,
    'InOp': (a) => (a.length === 2) ? 'this.Trades.Has(' + a[1] + ')' : undefined,
    'IsEqual': (a) => ((a.length === 2) && (a[1] === 'nil')) ? 'this.Trades == nil' : undefined,
};

function cacheMethods (content: string): string {
    const masked = goChanMask (content);
    const re = new RegExp (HELPER.source, 'g');
    let m: RegExpExecArray | null;
    let out = '';
    let cursor = 0;
    while ((m = re.exec (masked)) !== null) {
        const open = m.index + m[0].indexOf ('(');
        const close = goChanClose (masked, open);
        if ((close < 0) || (m.index < cursor)) {
            continue;
        }
        const args = splitArgs (masked, open, close).map (([ s, e ]) => content.substring (s, e).trim ());
        const text = (args[0] === 'this.Trades') ? CALLS[m[1]] (args) : undefined;
        if (text === undefined) {
            continue;
        }
        out += content.substring (cursor, m.index) + text;
        cursor = close;
        re.lastIndex = close;
    }
    return out + content.substring (cursor);
}

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

const DECL = /^(\s*)var (\w+) any = (this\.Trades\[[^\]]+\]|this\.Trades\.Get\([^()]*\))$/;

function retypeTradesLocals (lines: string[], masked: string[], q: string) {
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        if (text.indexOf ('this.Trades') < 0) {
            continue;
        }
        for (let k = start + 1; k < end; k++) {
            const decl = DECL.exec (masked[k]);
            if (decl === null) {
                continue;
            }
            const n = esc (decl[2]);
            const declared = text.match (new RegExp ('(?<![\\w.])var ' + n + '\\b', 'g')) || [];
            const rebinding = new RegExp ('(?<![\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*:?=(?!=)|&\\s*' + n + '\\b|func\\([^)]*\\b' + n + '\\b');
            const otherType = new RegExp ('(?<![\\w.])' + n + '\\.\\((?!(?:ccxt\\.)?Appender\\))');
            if ((declared.length !== 1) || rebinding.test (text) || otherType.test (text)) {
                continue;
            }
            const write = new RegExp ('^\\s*' + n + ' = (.*)$');
            let ok = true;
            for (let j = start + 1; ok && (j < end); j++) {
                const w = write.exec (masked[j]);
                if ((w !== null) && !CACHE_VALUE.test (w[1].trim ())) {
                    ok = false;
                }
            }
            if (!ok) {
                continue;
            }
            lines[k] = lines[k].replace (' any = ', ' ' + q + 'WsArrayCache = ');
            typedUses (lines, masked, start, end, n);
        }
    }
}

// uses of a typed cache: no assertion before Append, nil checks are plain comparisons
function typedUses (lines: string[], masked: string[], start: number, end: number, n: string) {
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

// `this.Trades[k] = v` where v is not provably a list cache stores through the cache
function anyStores (lines: string[], masked: string[], q: string) {
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        for (let k = start + 1; k < end; k++) {
            const m = /^(\s*)this\.Trades\[\*?([^\]]+)\] = (.+)$/.exec (masked[k]);
            if (m === null) {
                continue;
            }
            const value = lines[k].substring (lines[k].indexOf (' = ') + 3).trim ();
            const n = esc (value);
            const isCache = /^(?:ccxt\.)?NewArrayCache\w*\(/.test (value)
                || new RegExp ('var ' + n + ' (?:\\*?(?:ccxt\\.)?ArrayCache\\w*|(?:ccxt\\.)?WsArrayCache)\\b').test (text)
                || new RegExp ('(?<![\\w.])' + n + ' := (?:ccxt\\.)?NewArrayCache\\w*\\(').test (text);
            if (!isCache) {
                lines[k] = m[1] + 'this.Trades.Store(' + m[2] + ', ' + value + ')';
            }
        }
    }
    void q;
}

export function hx11w9TradesCachePass (content: string): string {
    if (content.indexOf ('this.Trades') < 0) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    content = cacheMethods (content);
    // a cache that was nil is refilled with an empty trades cache
    content = content.replace (/^(\s*)this\.Trades = map\[string\]any\{\}$/gm, '$1this.Trades = ' + q + 'TradesCache{}');
    // IsEqual of a cache read with nil is a plain comparison
    content = content.replace (/(!?)(?:ccxt\.)?IsEqual\((this\.Trades\.Get\([^()]*\)), nil\)/g, (_m, bang, read) => read + (bang === '!' ? ' != nil' : ' == nil'));
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    retypeTradesLocals (lines, masked, q);
    anyStores (lines, goChanMask (lines.join ('\n')).split ('\n'), q);
    return lines.join ('\n');
}

export function hx11w9TradesCacheCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-trades-cache: ' + message); } };
    const wrap = (body: string) => 'package ccxtpro\n\nfunc (this *X) HandleTrade(client any, message map[string]any) {\n' + body + '}\n';
    const out = hx11w9TradesCachePass (wrap ([
        '\tif ccxt.IsEqual(this.Trades, nil) {',
        '\t\tthis.Trades = map[string]any{}',
        '\t}',
        '\tif !(ccxt.InOp(this.Trades, symbol)) {',
        '\t\tccxt.AddElementToObject(this.Trades, symbol, ccxt.NewArrayCache(limit))',
        '\t}',
        '\tvar stored any = this.SafeValue(this.Trades, symbol)',
        '\tif ccxt.IsEqual(stored, nil) {',
        '\t\tstored = ccxt.NewArrayCache(limit)',
        '\t\tthis.Trades[*symbol] = stored',
        '\t}',
        '\tstored.(ccxt.Appender).Append(trade)',
        '\tclient.(ccxt.ClientInterface).Resolve(stored, messageHash)',
        '',
    ].join ('\n')));
    for (const want of [ 'if this.Trades == nil {', 'this.Trades = ccxt.TradesCache{}', 'if !(this.Trades.Has(symbol)) {', 'this.Trades.Store(symbol, ccxt.NewArrayCache(limit))',
        'var stored ccxt.WsArrayCache = this.Trades.Get(symbol)', 'if stored == nil {', '\tstored.Append(trade)', 'this.Trades[*symbol] = stored\n', 'Resolve(stored, messageHash)' ]) {
        ok (out.indexOf (want) >= 0, 'missing ' + want + ' in ' + out);
    }
    ok (out.indexOf ('Appender') < 0, 'an assertion is left: ' + out);
    const mixed = hx11w9TradesCachePass (wrap ('\tvar o any = this.Trades[*symbol]\n\to = message\n\tthis.Trades[*symbol] = o\n\to.(ccxt.Appender).Append(x)\n'));
    ok (mixed.indexOf ('var o any = ') >= 0 && mixed.indexOf ('this.Trades.Store(symbol, o)') >= 0 && mixed.indexOf ('o.(ccxt.Appender)') >= 0, 'a mixed local stays any: ' + mixed);
    const other = hx11w9TradesCachePass (wrap ('\tvar o any = this.Trades[*symbol]\n\tvar m map[string]any = o.(map[string]any)\n'));
    ok (other.indexOf ('var o any = ') >= 0, 'a local asserted to a map stays any: ' + other);
    return problems;
}
