// HX11 w8 anyslice-element-typed-reads: a `var L any` local fed only by `<Struct>sToList(rN.Value)` is a
// `[]any`. Typed so, `GetArrayLength(L)` is `len(L)` and, inside `for i := 0; i < len(L); i++`,
// `GetValue(L, i)` is `L[i]` (the list holds maps/rows, never *T scalar boxes, and i is in range).
// Proof per function: one declaration `var L any = nil`; every other write is `L = <ToList>(...)` before
// the first read; every read is GetArrayLength(L), GetValue(L, ident) or a counting loop bound.

const TO_LIST = '(?:ccxt\\.)?(?:Trades|Orders|OHLCVs|Positions|Transactions|LedgerEntries|DepositAddresses|TransferEntries|OpenInterests|Conversions|Liquidations|BorrowInterests|FundingHistories|FundingRateHistories|LeverageTiers|MarginModifications|LongShortRatios|ADLs|Accounts|PredictionOrders|PredictionTrades|PredictionPositions|PredictionEvents|PredictionSettlements|MarketInterfaces|MapSlice|StringSlice)ToList\\(';

function mask (src: string): string {
    // blank string/rune literals and comments, keep length and newlines
    let out = '';
    let i = 0;
    while (i < src.length) {
        const c = src[i];
        if ((c === '/') && (src[i + 1] === '/')) {
            while ((i < src.length) && (src[i] !== '\n')) { out += ' '; i++; }
        } else if ((c === '"') || (c === '`') || (c === "'")) {
            out += c;
            i++;
            while ((i < src.length) && (src[i] !== c)) {
                if ((c !== '`') && (src[i] === '\\')) { out += ' '; i++; }
                out += (src[i] === '\n') ? '\n' : ' ';
                i++;
            }
            out += c;
            i++;
        } else {
            out += c;
            i++;
        }
    }
    return out;
}

function esc (s: string): string {
    return s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function closeOf (masked: string, open: number): number {
    let d = 0;
    for (let i = open; i < masked.length; i++) {
        if (masked[i] === '{') { d++; } else if (masked[i] === '}') { d--; if (d === 0) { return i; } }
    }
    return -1;
}

function rewriteFunc (func: string): string {
    const masked = mask (func);
    if (masked.indexOf ('ToList(') < 0) { return func; }
    const names = new Set<string> ([ ...masked.matchAll (/^[ \t]*var (\w+) any = nil[ \t]*$/gm) ].map ((m) => m[1]));
    let text = func;
    for (const L of names) {
        const m0 = mask (text);
        const n = esc (L);
        const decls = [ ...m0.matchAll (new RegExp ('^[ \\t]*(?:var ' + n + ' |' + n + ' := )', 'gm')) ];
        if (decls.length !== 1) { continue; }
        if (/(?:^|[^\w.])func\(/.test (m0.slice (1))) { continue; } // any func literal: keep the helpers
        const writes = [ ...m0.matchAll (new RegExp ('^[ \\t]*' + n + ' = (.*)$', 'gm')) ];
        if ((writes.length === 0) || !writes.every ((w) => new RegExp ('^' + TO_LIST).test (w[1]))) { continue; }
        const lastWrite = Math.max (...writes.map ((w) => w.index as number));
        let ok = true;
        const reads: { at: number, kind: string }[] = [];
        for (const u of m0.matchAll (new RegExp ('(?<![\\w."])' + n + '(?!\\w)', 'g'))) {
            const at = u.index as number;
            const pre = m0.slice (Math.max (0, at - 15), at);
            const post = m0.slice (at + L.length, at + L.length + 12);
            const lineStart = m0.lastIndexOf ('\n', at) + 1;
            if (/^[ \t]*(?:var )?$/.test (m0.slice (lineStart, at)) && /^( any = nil| = )/.test (post)) { continue; } // decl / write
            if (/(?:ccxt\.)?GetArrayLength\($/.test (pre) && post.startsWith (')')) { reads.push ({ at, 'kind': 'len' }); continue; }
            if (/(?:ccxt\.)?GetValue\($/.test (pre) && /^, \w+\)/.test (post)) { reads.push ({ at, 'kind': 'get' }); continue; }
            ok = false;
            break;
        }
        if (!ok || (reads.length === 0) || reads.some ((r) => r.at < lastWrite)) { continue; }
        // rewrite from the end so offsets stay valid
        const edits: { from: number, to: number, with: string }[] = [];
        const declAt = m0.search (new RegExp ('var ' + n + ' any = nil'));
        edits.push ({ 'from': declAt, 'to': declAt + ('var ' + L + ' any').length, 'with': 'var ' + L + ' []any' });
        let hasLen = false;
        for (const r of reads) {
            if (r.kind === 'len') {
                const s = m0.lastIndexOf ('GetArrayLength(', r.at);
                const prefix = text.slice (s - 5, s).endsWith ('ccxt.') ? 5 : 0;
                edits.push ({ 'from': s - prefix, 'to': r.at + L.length + 1, 'with': 'len(' + L + ')' });
                hasLen = true;
            } else {
                const g = /^, (\w+)\)/.exec (m0.slice (r.at + L.length)) as RegExpExecArray;
                const counter = g[1];
                const s = m0.lastIndexOf ('GetValue(', r.at);
                // innermost enclosing counting loop over `counter` bounded by len(L)
                let inLoop = false;
                for (const h of m0.matchAll (new RegExp ('^[ \\t]*for ' + esc (counter) + ' := 0; ' + esc (counter) + ' < (.+); ' + esc (counter) + '\\+\\+ \\{$', 'gm'))) {
                    const open = (h.index as number) + h[0].length - 1;
                    const close = closeOf (m0, open);
                    if ((close < r.at) || (open > r.at)) { continue; }
                    const bound = h[1].trim ();
                    let boundOk = (bound === 'len(' + L + ')') || (bound === 'GetArrayLength(' + L + ')') || (bound === 'ccxt.GetArrayLength(' + L + ')');
                    if (!boundOk && /^\w+$/.test (bound)) {
                        const bd = [ ...m0.matchAll (new RegExp ('^[ \\t]*(?:var ' + esc (bound) + ' int = |' + esc (bound) + ' :?= )(.*)$', 'gm')) ];
                        const bw = [ ...m0.matchAll (new RegExp ('^[ \\t]*' + esc (bound) + ' (?:[-+*/]?=|\\+\\+|--)', 'gm')) ];
                        boundOk = (bd.length === 1) && (bw.length === 0) && (bd[0][1].trim () === 'GetArrayLength(' + L + ')' || bd[0][1].trim () === 'ccxt.GetArrayLength(' + L + ')' || bd[0][1].trim () === 'len(' + L + ')') && ((bd[0].index as number) < open);
                    }
                    const body = m0.slice (open, close);
                    const counterWritten = new RegExp ('(?:^|[^\\w.])' + esc (counter) + '[ \\t]*(?:[-+*/]?=(?!=)|\\+\\+|--)|&' + esc (counter) + '\\b').test (body.slice (1));
                    if (boundOk && !counterWritten) { inLoop = true; }
                }
                if (inLoop) {
                    const prefix = text.slice (s - 5, s).endsWith ('ccxt.') ? 5 : 0;
                    edits.push ({ 'from': s - prefix, 'to': r.at + L.length + 2 + counter.length + 1, 'with': L + '[' + counter + ']' });
                }
            }
        }
        if (!hasLen && edits.length === 1) { continue; }
        edits.sort ((a, b) => b.from - a.from);
        for (const e of edits) { text = text.slice (0, e.from) + e.with + text.slice (e.to); }
    }
    return text;
}

export function hx11w8AnySliceToList (content: string): string {
    if ((content.indexOf ('ToList(') < 0) || (content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0)) { return content; }
    const parts = content.split (/^(?=func )/m);
    return parts.map ((p) => (p.startsWith ('func ') ? rewriteFunc (p) : p)).join ('');
}

export function hx11w8AnySliceToListCheck (): string[] {
    const problems: string[] = [];
    const hdr = '// IT IS GENERATED AND WILL BE OVERWRITTEN\n';
    const fn = (body: string) => hdr + 'func (this *X) f() any {\n' + body + '\treturn nil\n}\n';
    const base = '\tvar positions any = nil\n\tif r.Value != nil {\n\t\tpositions = PositionsToList(r.Value)\n\t}\n';
    const loop = '\tfor i := 0; i < GetArrayLength(positions); i++ {\n\t\tvar p any = GetValue(positions, i)\n\t\t_ = p\n\t}\n';
    const got = hx11w8AnySliceToList (fn (base + loop));
    if (!got.includes ('var positions []any = nil') || !got.includes ('i < len(positions)') || !got.includes ('var p any = positions[i]')) { problems.push ('anyslice-tolist: native form missing: ' + got); }
    const keep = (body: string, label: string) => {
        if (hx11w8AnySliceToList (fn (body)) !== fn (body)) { problems.push ('anyslice-tolist: ' + label + ' was rewritten'); }
    };
    keep (base + loop + '\treturn positions\n', 'escaping list');
    keep (base + loop + '\tthis.F(positions)\n', 'list passed on');
    keep (base + '\tpositions = this.Other()\n' + loop, 'foreign write');
    keep (base + '\tif IsEqual(positions, nil) {\n\t}\n' + loop, 'nil test');
    keep (base.replace ('PositionsToList', 'OHLCVToList') + loop, 'row producer');
    const wr = hx11w8AnySliceToList (fn (base + loop.replace ('{\n\t\tvar p', '{\n\t\ti++\n\t\tvar p')));
    if (wr.includes ('positions[i]')) { problems.push ('anyslice-tolist: counter written in loop still indexed'); }
    return problems;
}
