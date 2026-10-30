// HX11 w9: handleBookDelta / handleBookDeltas take the book itself (TS: `orderbook: WsOrderBook`), so the
// base, every override and IDerivedExchange print `OrderBookInterface` instead of `any`. The side reads on
// that parameter print the book's accessors. A helper that only forwards its book parameter to them is
// retyped too when every call in its file hands it a book local.
const SIGNATURE = /^func \(this \*\w+\) HandleBookDeltas?\((\w+) any(?=,)/;
const SIDE = { 'asks': 'GetAsks', 'bids': 'GetBids' };

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

function isBookIn (lines: string[], range: [number, number], name: string, type: string): boolean {
    const text = lines.slice (range[0], range[1]).join ('\n');
    const local = new RegExp ('(?<![\\w.])var ' + esc (name) + ' (\\S+)', 'g');
    const kinds = Array.from (text.matchAll (local)).map ((m) => m[1]);
    if (kinds.length > 0) {
        return kinds.length === 1 && kinds[0] === type;
    }
    return new RegExp ('^func [^\\n]*[(,] ?' + esc (name) + ' ' + esc (type) + '[,)]').test (lines[range[0]]);
}

function retypeBody (lines: string[], range: [number, number], name: string) {
    const read = new RegExp ('(?<![\\w.])(?:ccxt\\.)?GetValue\\(' + esc (name) + ', "(asks|bids)"\\)', 'g');
    for (let k = range[0] + 1; k < range[1]; k++) {
        if (lines[k].trimStart ().startsWith ('//')) {
            continue;
        }
        lines[k] = lines[k].replace (read, (all: string, side: string) => name + '.' + SIDE[side] + '()');
    }
}

export function hx11w9BookDeltaParams (content: string): string {
    if (!/HandleBookDeltas?\(/.test (content)) {
        return content;
    }
    const pkg = /^package ccxt$/m.test (content) ? '' : 'ccxt.';
    const type = pkg + 'OrderBookInterface';
    const lines = content.split ('\n');
    let ranges = funcRanges (lines);
    for (const range of ranges) {
        const head = SIGNATURE.exec (lines[range[0]]);
        if (head !== null) {
            lines[range[0]] = lines[range[0]].replace (head[0], head[0].replace (/ any$/, ' ' + type));
            retypeBody (lines, range, head[1]);
        }
    }
    // a function that forwards its `any` book parameter to them, when each call hands it a book
    ranges = funcRanges (lines);
    for (const range of ranges) {
        const own = /^func \(this \*\w+\) (\w+)\(([^)]*)\)/.exec (lines[range[0]]);
        if ((own === null) || /^HandleBookDeltas?$/.test (own[1])) {
            continue;
        }
        const params = own[2].split (',').map ((p) => p.trim ());
        for (let at = 0; at < params.length; at++) {
            const name = /^(\w+) any$/.exec (params[at]);
            if (name === null) {
                continue;
            }
            const body = lines.slice (range[0] + 1, range[1]).join ('\n');
            const forwards = new RegExp ('this\\.HandleBookDeltas?\\(' + esc (name[1]) + ',').test (body);
            const written = new RegExp ('(?:^|\\n)\\s*' + esc (name[1]) + ' = ').test (body);
            if (!forwards || written) {
                continue;
            }
            const call = new RegExp ('this\\.' + own[1] + '\\(');
            let ok = true;
            let seen = 0;
            for (const other of ranges) {
                for (let k = other[0]; k < other[1]; k++) {
                    const hit = call.exec (lines[k]);
                    if (hit === null || (other === range && k === other[0])) {
                        continue;
                    }
                    seen++;
                    const args = lines[k].substring (hit.index + hit[0].length).split (',');
                    const arg = (args[at] ?? '').trim ().replace (/\)$/, '');
                    ok = ok && /^\w+$/.test (arg) && isBookIn (lines, other, arg, type);
                }
            }
            if (ok && seen > 0) {
                lines[range[0]] = lines[range[0]].replace (new RegExp ('(?<![\\w.])' + esc (name[1]) + ' any(?=[,)])'), name[1] + ' ' + type);
                retypeBody (lines, range, name[1]);
            }
        }
    }
    return lines.join ('\n');
}

export function hx11w9BookDeltaCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-bookdelta: ' + message); } };
    const pro = [
        'package ccxtpro', '',
        'func (this *X) HandleBook(client any, message any, orderbook any) {',
        '\tthis.HandleBookDeltas(orderbook, message)', '}',
        'func (this *X) HandleOther() {',
        '\tvar book ccxt.OrderBookInterface = this.Orderbooks.Get(symbol)',
        '\tthis.HandleBook(client, message, book)', '}',
        'func (this *X) HandleBookDelta(orderbook any, delta any) {',
        '\tvar bids any = ccxt.GetValue(orderbook, "bids")',
        '\t// ccxt.GetValue(orderbook, "asks") stays prose',
        '\tvar side any = ccxt.GetValue(orderbook, side)', '}', '',
    ].join ('\n');
    const out = hx11w9BookDeltaParams (pro);
    ok (out.includes ('HandleBookDelta(orderbook ccxt.OrderBookInterface, delta any)'), 'override signature: ' + out);
    ok (out.includes ('HandleBook(client any, message any, orderbook ccxt.OrderBookInterface)'), 'forwarder with typed callers: ' + out);
    ok (out.includes ('var bids any = orderbook.GetBids()') && out.includes ('GetValue(orderbook, side)'), 'side reads: ' + out);
    ok (out.includes ('// ccxt.GetValue(orderbook, "asks") stays prose'), 'comment untouched: ' + out);
    const mixed = hx11w9BookDeltaParams (pro.replace ('this.HandleBook(client, message, book)', 'this.HandleBook(client, message, other)'));
    ok (mixed.includes ('HandleBook(client any, message any, orderbook any)'), 'unproven caller keeps the box: ' + mixed);
    const base = hx11w9BookDeltaParams ('package ccxt\n\nfunc (this *BaseExchange) HandleBookDeltas(orderbook any, deltas any) {\n\tthis.HandleBookDelta(orderbook, deltas)\n}\n');
    ok (base.includes ('HandleBookDeltas(orderbook OrderBookInterface, deltas any)'), 'base package is unqualified: ' + base);
    return problems;
}
