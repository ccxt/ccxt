// HX11 w9: a nil-declared local (`var x any`) whose writes are only trades-cache reads, cache
// constructors or nil is a WsArrayCache. A typed nil interface is nil, so `x == nil` and Resolve(x)
// keep their meaning; the Append assertion on it goes.
import { goChanMask } from './go-chan.js';

const NIL_DECL = /^(\s*)var (\w+) any(?: = nil)?$/;
const CACHE_VALUE = /^(?:this\.Trades\[[^\]]+\]|this\.Trades\.Get\([^()]*\)|nil|(?:ccxt\.)?NewArrayCache(?:BySymbolById|ByOutcomeById)?\(.*\))$/;
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

export function hx11w9TradesNilLocalsPass (content: string): string {
    if (content.indexOf ('this.Trades[') < 0) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    for (const [ start, end ] of funcRanges (lines)) {
        const text = masked.slice (start, end).join ('\n');
        if (text.indexOf ('this.Trades[') < 0) {
            continue;
        }
        for (let k = start + 1; k < end; k++) {
            const decl = NIL_DECL.exec (masked[k]);
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
            let reads = 0;
            for (let j = start + 1; ok && (j < end); j++) {
                const w = write.exec (masked[j]);
                if (w === null) {
                    continue;
                }
                const value = w[1].trim ();
                ok = CACHE_VALUE.test (value);
                reads += value.startsWith ('this.Trades') ? 1 : 0;
            }
            if (!ok || (reads === 0)) {
                continue;
            }
            lines[k] = lines[k].replace (/ any(?: = nil)?$/, ' ' + q + 'WsArrayCache');
            const append = new RegExp ('(?<![\\w.])(' + n + ')\\.\\((?:ccxt\\.)?Appender\\)\\.Append\\(', 'g');
            const nilEq = new RegExp ('(!?)(?:ccxt\\.)?IsEqual\\((' + n + '), nil\\)', 'g');
            for (let j = start; j < end; j++) {
                lines[j] = lines[j].replace (append, '$1.Append(').replace (nilEq, (_m, bang, id) => id + (bang === '!' ? ' != nil' : ' == nil'));
            }
        }
    }
    return lines.join ('\n');
}

export function hx11w9TradesNilLocalsCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-trades-nil-locals: ' + message); } };
    const wrap = (body: string) => 'package ccxtpro\n\nfunc (this *X) HandleTrade(client any, message map[string]any) {\n' + body + '}\n';
    const out = hx11w9TradesNilLocalsPass (wrap ([
        '\tvar stored any',
        '\tif symbol != nil {',
        '\t\tstored = this.Trades[*symbol]',
        '\t}',
        '\tstored.(ccxt.Appender).Append(trade)',
        '\tif ccxt.IsEqual(stored, nil) {',
        '\t\tstored = ccxt.NewArrayCache(limit)',
        '\t}',
        '\tclient.(ccxt.ClientInterface).Resolve(stored, messageHash)',
        '',
    ].join ('\n')));
    for (const want of [ '\tvar stored ccxt.WsArrayCache\n', '\tstored.Append(trade)', 'if stored == nil {', 'Resolve(stored, messageHash)' ]) {
        ok (out.indexOf (want) >= 0, 'missing ' + want + ' in ' + out);
    }
    ok (out.indexOf ('Appender') < 0, 'an assertion is left: ' + out);
    const explicit = hx11w9TradesNilLocalsPass (wrap ('\tvar t any = nil\n\tt = this.Trades[*symbol]\n\tt.(ccxt.Appender).Append(x)\n'));
    ok (explicit.indexOf ('var t ccxt.WsArrayCache\n') >= 0, 'explicit nil decl is typed: ' + explicit);
    const mixed = hx11w9TradesNilLocalsPass (wrap ('\tvar o any\n\to = this.Trades[*symbol]\n\to = message\n\to.(ccxt.Appender).Append(x)\n'));
    ok (mixed.indexOf ('var o any\n') >= 0 && mixed.indexOf ('o.(ccxt.Appender)') >= 0, 'a mixed local stays any: ' + mixed);
    const noRead = hx11w9TradesNilLocalsPass (wrap ('\tvar o any\n\to = ccxt.NewArrayCache(5)\n\tthis.Trades[*symbol] = o\n'));
    ok (noRead.indexOf ('var o any\n') >= 0, 'a local with no trades read stays any: ' + noRead);
    const other = hx11w9TradesNilLocalsPass (wrap ('\tvar o any\n\to = this.Trades[*symbol]\n\tvar m map[string]any = o.(map[string]any)\n'));
    ok (other.indexOf ('var o any\n') >= 0, 'a local asserted to a map stays any: ' + other);
    return problems;
}
