// HX11 w9: BaseExchange.Orderbooks is a typed cache (OrderBookCache, go/v4/exchange_orderbook_cache.go).
// Its helper calls print the cache's own methods, a local that only ever holds a cached or freshly
// built book is typed OrderBookInterface, and the assertion on a typed book goes.
import { goChanMask, goChanClose } from './go-chan.js';

const HELPER = /(?<![\w])(?:(?:ccxt\.|this\.)?)(AddElementToObject|GetValue|SafeValue|SafeDict|SafeMapTyped|InOp|Remove)\(this\.Orderbooks[,)]/g;
// values a book local may hold: a cache read, a constructor, nil
const BOOK_VALUE = /^(?:this\.Orderbooks\[[^\]]+\]|this\.Orderbooks\.Get(?:Or)?\(.*\)|this\.(?:Indexed|Counted)?OrderBook\(.*\)|nil)$/;
const BOOK_CTOR = /^this\.(?:Indexed|Counted)?OrderBook\([^()]*(?:\([^()]*\)[^()]*)*\)$/;

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

const CALLS: { [name: string]: (a: string[], q: string) => string | undefined } = {
    'AddElementToObject': (a) => (a.length === 3) ? 'this.Orderbooks.Store(' + a[1] + ', ' + a[2] + ')' : undefined,
    'GetValue': (a) => (a.length === 2) ? 'this.Orderbooks.Get(' + a[1] + ')' : undefined,
    'SafeValue': (a) => (a.length === 2) ? 'this.Orderbooks.Get(' + a[1] + ')' : ((a.length === 3) ? 'this.Orderbooks.GetOr(' + a[1] + ', ' + a[2] + ')' : undefined),
    'SafeDict': (a) => (a.length === 2) ? 'this.Orderbooks.Get(' + a[1] + ')' : undefined,
    'SafeMapTyped': (a, q) => (a.length === 2) ? q + 'SafeMapTyped(this.Orderbooks.ToMap(), ' + a[1] + ')' : undefined,
    'InOp': (a) => (a.length === 2) ? 'this.Orderbooks.Has(' + a[1] + ')' : undefined,
    'Remove': (a) => (a.length === 2) ? 'this.Orderbooks.Delete(' + a[1] + ')' : undefined,
};

function cacheMethods (content: string, q: string): string {
    for (let guard = 0; guard < 8; guard++) {
        const masked = goChanMask (content);
        const re = new RegExp (HELPER.source, 'g');
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
            const args = splitArgs (masked, open, close).map (([ s, e ]) => content.substring (s, e).trim ());
            const text = (args[0] === 'this.Orderbooks') ? CALLS[m[1]] (args, q) : undefined;
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
    return content;
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

const esc = (name: string): string => name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

// a function-wide `var name any` that only ever holds a book becomes `var name OrderBookInterface`
function retypeBookLocals (lines: string[], masked: string[], q: string) {
    for (const [ start, end ] of funcRanges (lines)) {
        const body = masked.slice (start, end);
        if (!body.some ((l) => l.indexOf ('this.Orderbooks') >= 0)) {
            continue;
        }
        const text = body.join ('\n');
        for (let k = start + 1; k < end; k++) {
            const decl = /^(\s*)var (\w+) any(?: = (.*))?$/.exec (masked[k]);
            if (decl === null) {
                continue;
            }
            const name = decl[2];
            const n = esc (name);
            const declared = text.match (new RegExp ('(?<![\\w.])var ' + n + '\\b', 'g')) || [];
            const rebinding = new RegExp ('(?<![\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:=|,\\s*' + n + '\\s*:?=(?!=)|&\\s*' + n + '\\b|func\\([^)]*\\b' + n + '\\b');
            const otherType = new RegExp ('(?<![\\w.])' + n + '\\.\\((?!(?:ccxt\\.)?OrderBookInterface\\))');
            if ((declared.length !== 1) || rebinding.test (text) || otherType.test (text)) {
                continue;
            }
            const write = new RegExp ('^\\s*' + n + ' = (.*)$');
            const anyWrite = new RegExp ('(?<![\\w.&*])' + n + '\\s*(?:,\\s*\\w+\\s*)*=(?!=)');
            let ok = (decl[3] === undefined) || BOOK_VALUE.test (decl[3].trim ());
            let cached = (decl[3] !== undefined) && /this\.Orderbooks/.test (decl[3]);
            for (let j = start + 1; ok && (j < end); j++) {
                if ((j === k) || !anyWrite.test (masked[j])) {
                    continue;
                }
                const w = write.exec (masked[j]);
                if ((w === null) || !BOOK_VALUE.test (w[1].trim ())) {
                    ok = false;
                } else if (/this\.Orderbooks/.test (w[1])) {
                    cached = true;
                }
            }
            if (!ok || !cached) {
                continue;
            }
            const init = (decl[3] === undefined) || (decl[3].trim () === 'nil') ? '' : ' = ' + lines[k].substring (lines[k].indexOf (' = ') + 3);
            lines[k] = decl[1] + 'var ' + name + ' ' + q + 'OrderBookInterface' + init;
        }
    }
}

// `this.Orderbooks[k] = v` where v is not provably a book stores through the cache
function anyStores (lines: string[], masked: string[]) {
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        for (let k = start + 1; k < end; k++) {
            const m = /^(\s*)this\.Orderbooks\[\*?([^\]]+)\] = (.+)$/.exec (masked[k]);
            if (m === null) {
                continue;
            }
            const value = lines[k].substring (lines[k].indexOf (' = ') + 3).trim ();
            const isBook = BOOK_CTOR.test (value) || new RegExp ('var ' + esc (value) + ' (?:ccxt\\.)?OrderBookInterface\\b').test (text);
            if (!isBook) {
                lines[k] = m[1] + 'this.Orderbooks.Store(' + m[2] + ', ' + value + ')';
            }
        }
    }
}

export function hx11w9OrderBookCachePass (content: string): string {
    if (content.indexOf ('this.Orderbooks') < 0) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    content = cacheMethods (content, q);
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    retypeBookLocals (lines, masked, q);
    anyStores (lines, goChanMask (lines.join ('\n')).split ('\n'));
    return lines.join ('\n');
}

// after the setter pass used the assertion as its non-nil proof: a typed book is called directly
export function hx11w9OrderBookAssertPass (content: string): string {
    if (content.indexOf ('this.Orderbooks') < 0) {
        return content;
    }
    // the cache already answers a book: the unboxing wrapper around a read goes
    content = content.replace (/(?<![\w.])(?:ccxt\.)?OrderBookTyped\((this\.Orderbooks(?:\[[^\]]+\]|\.Get\([^()]*\)))\)/g, '$1');
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        const typed = new Set<string> ();
        for (const m of text.matchAll (/^\s*var (\w+) (?:ccxt\.)?OrderBookInterface\b/gm)) {
            if ((text.match (new RegExp ('(?<![\\w.])var ' + esc (m[1]) + '\\b', 'g')) || []).length === 1) {
                typed.add (m[1]);
            }
        }
        const names = [ 'this\\.Orderbooks(?:\\[[^\\]]+\\])?' ].concat (Array.from (typed).map (esc));
        const call = new RegExp ('(?<![\\w.])(' + names.join ('|') + ')\\.\\((?:ccxt\\.)?OrderBookInterface\\)', 'g');
        for (let k = start; k < end; k++) {
            const found = Array.from (masked[k].matchAll (call)).reverse ();
            for (const f of found) {
                const at = f.index as number;
                lines[k] = lines[k].substring (0, at) + f[1] + lines[k].substring (at + f[0].length);
            }
        }
    }
    return lines.join ('\n');
}

export function hx11w9OrderBookCacheCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-orderbook-cache: ' + message); } };
    const wrap = (body: string) => 'package ccxtpro\n\nfunc (this *X) HandleOrderBook(client any, message map[string]any) {\n' + body + '}\n';
    const src = wrap ([
        '\tif !(ccxt.InOp(this.Orderbooks, symbol)) {',
        '\t\tccxt.AddElementToObject(this.Orderbooks, symbol, this.OrderBook(map[string]any{}, limit))',
        '\t}',
        '\tvar orderbook any = this.SafeValue(this.Orderbooks, symbol)',
        '\tvar stored any = this.SafeValue(this.Orderbooks, symbol, this.OrderBook(map[string]any{}))',
        '\tvar typed ccxt.OrderBookInterface = ccxt.OrderBookTyped(this.SafeValue(this.Orderbooks, symbol))',
        '\tvar side any = ccxt.GetValue(this.Orderbooks, symbol)',
        '\tvar book map[string]any = ccxt.SafeMapTyped(this.Orderbooks, symbol)',
        '\torderbook.(ccxt.OrderBookInterface).Reset(snapshot)',
        '\tthis.Orderbooks[*symbol] = orderbook',
        '\tccxt.Remove(this.Orderbooks, symbol)',
        '',
    ].join ('\n'));
    const out = hx11w9OrderBookAssertPass (hx11w9OrderBookCachePass (src));
    for (const want of [ 'if !(this.Orderbooks.Has(symbol)) {', 'this.Orderbooks.Store(symbol, this.OrderBook(map[string]any{}, limit))',
        'var orderbook ccxt.OrderBookInterface = this.Orderbooks.Get(symbol)', 'var stored ccxt.OrderBookInterface = this.Orderbooks.GetOr(symbol, this.OrderBook(map[string]any{}))',
        'var typed ccxt.OrderBookInterface = this.Orderbooks.Get(symbol)', 'var side ccxt.OrderBookInterface = this.Orderbooks.Get(symbol)', 'ccxt.SafeMapTyped(this.Orderbooks.ToMap(), symbol)',
        '\torderbook.Reset(snapshot)', '\tthis.Orderbooks[*symbol] = orderbook\n', 'this.Orderbooks.Delete(symbol)' ]) {
        ok (out.indexOf (want) >= 0, 'missing ' + want + ' in ' + out);
    }
    // a local also holding a foreign value stays any and stores through the cache
    const mixed = hx11w9OrderBookCachePass (wrap ('\tvar ob any = this.Orderbooks[*symbol]\n\tob = message\n\tthis.Orderbooks[*symbol] = ob\n'));
    ok (mixed.indexOf ('var ob any = ') >= 0 && mixed.indexOf ('this.Orderbooks.Store(symbol, ob)') >= 0, 'a mixed local stays any: ' + mixed);
    // a local asserted to another type keeps its box
    const other = hx11w9OrderBookCachePass (wrap ('\tvar ob any = this.Orderbooks[*symbol]\n\tvar m map[string]any = ob.(map[string]any)\n'));
    ok (other.indexOf ('var ob any = ') >= 0, 'a local asserted to a map stays any: ' + other);
    // a local from a user-path read is not a cache read
    const owner = hx11w9OrderBookCachePass (wrap ('\tvar ob any = this.WsCacheGet("Orderbooks", symbol)\n\tvar b any = this.Orderbooks[*symbol]\n'));
    ok (owner.indexOf ('var ob any = ') >= 0, 'an owner read keeps its box: ' + owner);
    // the base package prints the unqualified type
    const base = hx11w9OrderBookCachePass ('package ccxt\n\nfunc (this *BaseExchange) F() {\n\tvar ob any = this.Orderbooks[*symbol]\n\tob.(OrderBookInterface).Reset()\n}\n');
    ok (base.indexOf ('var ob OrderBookInterface = this.Orderbooks[*symbol]') >= 0, 'base package is unqualified: ' + base);
    return problems;
}
