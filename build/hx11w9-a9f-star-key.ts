// hx11 w9 a9f: `if (a != nil) && (b != nil) && (InOp(m, a)) {` with a, b `*string` and m a plain map. The other nil
// guards stay in the `&&` chain; only the lookup goes native: a comma-ok behind them (a nil map reads as absent).
import { goChanMask } from './go-chan.js';
import { hx10G10Decls, hx10G10DeclsAt, hx10G10OkIsIfLocal, hx11w9Terms, NIL_SAFE_MAP } from './hx10w2-G10.js';

// this.Ohlcvs is map[string]map[string]any, so GetValue(this.Ohlcvs, k) is the plain book of k
const OHLCV = /^this\.Ohlcvs$/;

type Lookup = { outer: string[], read: string, keys: string[] };

function a9fLookup (cond: string, masked: string, view: ReturnType<typeof hx10G10Decls>): Lookup | undefined {
    const terms = hx11w9Terms (cond, masked);
    if (terms === undefined) {
        return undefined;
    }
    const guarded = new Set<string> ();
    const outer: string[] = [];
    let read: string | undefined;
    const keys: string[] = [];
    const star = (k: string) => view.get (k)?.type === '*string';
    for (const t of terms) {
        const guard = /^(\w+) != nil$/.exec (t) ?? /^!(?:ccxt\.)?IsEqual\((\w+), nil\)$/.exec (t);
        const inop = /^(?:ccxt\.)?InOp\((.+), (\w+)\)$/.exec (t);
        if ((guard !== null) && star (guard[1])) {
            guarded.add (guard[1]);
            outer.push (t);
        } else if (inop !== null) {
            const [ , receiver, key ] = inop;
            const book = /^(?:ccxt\.)?GetValue\((this\.Ohlcvs), (\w+)\)$/.exec (receiver);
            if (!guarded.has (key) || !star (key)) {
                return undefined;
            }
            if ((read === undefined) && (NIL_SAFE_MAP.test (receiver) || OHLCV.test (receiver) || (view.get (receiver)?.type === 'map[string]any'))) {
                read = receiver + '[*' + key + ']';
                keys.push (key);
            } else if ((read !== undefined) && (book !== null) && (read === book[1] + '[*' + book[2] + ']')) {
                read += '[*' + key + ']'; // the book lookup is implied by reading a nil map
                keys.push (key);
            } else {
                return undefined;
            }
        } else if (!(/^this\.\w+(?:\(\))? != nil$/.test (t) && (read === undefined))) {
            return undefined; // a receiver nil check is dropped: a nil map reads as absent
        }
    }
    return ((read === undefined) || (outer.length < 2)) ? undefined : { outer, read, keys };
}

export function hx11w9a9fStarKeyPass (content: string): string {
    if (!/\bInOp\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const out: string[] = [];
    let k = 0;
    while (k < lines.length) {
        if (!lines[k].startsWith ('func (this *')) {
            out.push (lines[k]);
            k++;
            continue;
        }
        let end = k;
        while ((end < lines.length) && (lines[end] !== '}')) {
            end++;
        }
        const body = lines.slice (k, end + 1);
        const maskedBody = masked.slice (k, end + 1);
        const decls = hx10G10Decls (body, body[0]);
        const plain = hx10G10OkIsIfLocal (maskedBody);
        for (let i = 1; i < body.length; i++) {
            const head = /^(\t*)if (.+) \{$/.exec (maskedBody[i]);
            const flag = /^(\t*)var (\w+) bool = (.+)$/.exec (maskedBody[i]);
            const m = head ?? flag;
            if ((m === null) || !plain || /;/.test (maskedBody[i]) || !/\bInOp\(/.test (maskedBody[i])) {
                continue;
            }
            const maskedCond = m[m.length - 1];
            const at = body[i].length - maskedCond.length - ((head !== null) ? 2 : 0);
            const look = a9fLookup (body[i].substring (at, at + maskedCond.length), maskedCond, hx10G10DeclsAt (body, maskedBody, decls, i));
            if (look === undefined) {
                continue;
            }
            const indent = m[1];
            const outerLine = look.outer.join (' && ');
            if (flag !== null) {
                body.splice (i, 1, indent + 'var ' + m[2] + ' bool', indent + 'if ' + outerLine + ' {', indent + '\t_, ' + m[2] + ' = ' + look.read, indent + '}');
                maskedBody.splice (i, 1, ...body.slice (i, i + 4).map (l => goChanMask (l)));
                i += 3;
                continue;
            }
            // only a then-block with no else arm: the nil case then falls straight past it
            let close = i + 1;
            while ((close < body.length) && !maskedBody[close].startsWith (indent + '}')) {
                close++;
            }
            if ((close >= body.length) || (maskedBody[close] !== indent + '}')) {
                continue;
            }
            const writes = (key: string) => new RegExp ('(?<![\\w.*&])' + key + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|&' + key + '\\b');
            if (maskedBody.slice (i + 1, close).some (l => look.keys.some (key => writes (key).test (l)))) {
                continue; // the block rebinds a key: the lookup would read a different one
            }
            // an inner `if _, ok := read[..]; ok {` already holding the whole block implies the lookup
            const sub = indent + '\tif _, ok := ' + look.read + '[';
            if (body[i + 1].startsWith (sub) && (maskedBody[close - 1] === indent + '\t}') && !maskedBody.slice (i + 2, close - 1).some (l => l === indent + '\t}'))  {
                body.splice (i, close - i + 1, indent + 'if ' + outerLine + ' {', ...body.slice (i + 1, close), indent + '}');
                maskedBody.splice (i, close - i + 1, ...goChanMask (body.slice (i, close + 1).join ('\n')).split ('\n'));
                continue;
            }
            const inner = body.slice (i + 1, close).map (l => (l === '' ? l : '\t' + l));
            const replacement = [ indent + 'if ' + outerLine + ' {', indent + '\tif _, ok := ' + look.read + '; ok {' ].concat (inner, [ indent + '\t}', indent + '}' ]);
            body.splice (i, close - i + 1, ...replacement);
            maskedBody.splice (i, close - i + 1, ...goChanMask (replacement.join ('\n')).split ('\n'));
            i += 1;
        }
        out.push (...body);
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx11w9a9fSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11-a9f: ' + message); } };
    const f = (sig: string, body: string) => hx11w9a9fStarKeyPass ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    const two = '\tif (symbol != nil) && (timeframe != nil) && (ccxt.InOp(this.Ohlcvs, symbol)) {\n\t\tdelete(this.Ohlcvs[*symbol], *timeframe)\n\t}\n';
    const sig = 'symbol *string, timeframe *string';
    ok (f (sig, two).indexOf ('\tif symbol != nil && timeframe != nil {\n\t\tif _, ok := this.Ohlcvs[*symbol]; ok {\n\t\t\tdelete(') >= 0, 'extra nil guard stays, lookup native');
    ok (f (sig, two).indexOf ('InOp') < 0, 'no InOp left');
    const pre = '\tif (symbol != nil) && (timeframe != nil) && (ccxt.InOp(this.Ohlcvs, symbol)) {\n\t\tif _, ok := this.Ohlcvs[*symbol][*timeframe]; ok {\n\t\t\tdelete(this.Ohlcvs[*symbol], *timeframe)\n\t\t}\n\t}\n';
    ok (f (sig, pre) === 'func (this *X) H(' + sig + ') {\n\tif symbol != nil && timeframe != nil {\n\t\tif _, ok := this.Ohlcvs[*symbol][*timeframe]; ok {\n\t\t\tdelete(this.Ohlcvs[*symbol], *timeframe)\n\t\t}\n\t}\n}\n', 'an inner comma-ok already holding the block is not nested again');
    const chain = '\tif (symbol != nil) && (timeframe != nil) && (ccxt.InOp(this.Ohlcvs, symbol)) && (ccxt.InOp(ccxt.GetValue(this.Ohlcvs, symbol), timeframe)) {\n\t\tdelete(this.Ohlcvs[*symbol], *timeframe)\n\t}\n';
    ok (f (sig, chain).indexOf ('if _, ok := this.Ohlcvs[*symbol][*timeframe]; ok {') >= 0, 'book then timeframe is one comma-ok');
    ok (f (sig, chain).indexOf ('InOp') < 0, 'chain has no InOp left');
    ok (f ('symbol *string, timeframe any', two).indexOf ('InOp') >= 0, 'an any guard is not a proven *string: keeps InOp');
    ok (f ('symbol *string', '\tif (symbol != nil) && (ccxt.InOp(this.Ohlcvs, symbol)) {\n\t\ta()\n\t}\n').indexOf ('InOp') >= 0, 'a single guard is the M479 shape: left alone');
    ok (f (sig, two.replace ('(symbol != nil) && ', '')).indexOf ('InOp') >= 0, 'key guard absent keeps InOp');
    ok (f (sig, two.replace ('delete(this.Ohlcvs[*symbol], *timeframe)', 'symbol = nil')).indexOf ('InOp') >= 0, 'a rebound key keeps InOp');
    ok (f (sig, two.replace (/\t\}\n$/, '\t} else {\n\t\tb()\n\t}\n')).indexOf ('InOp') >= 0, 'an else arm keeps InOp');
    ok (f (sig, two.replace ('this.Ohlcvs, symbol', 'this.Other, symbol')).indexOf ('InOp') >= 0, 'unknown receiver keeps InOp');
    ok (f (sig, two.replace ('(timeframe != nil)', '(foo(timeframe))')).indexOf ('InOp') >= 0, 'an unknown term keeps InOp');
    const loc = '\tvar m map[string]any = this.SafeDictMap(a, \"b\", map[string]any{})\n\tif (id != nil) && (ok2 != nil) && (ccxt.InOp(m, id)) {\n\t\tdelete(m, *id)\n\t}\n';
    ok (f ('id *string, ok2 *string', loc).indexOf ('if _, ok := m[*id]; ok {') >= 0, 'typed local map receiver');
    const flagText = '\tvar d bool = (k != nil) && (j != nil) && (InOp(params, k))\n';
    ok (f ('k *string, j *string, params map[string]any', flagText).indexOf ('\tvar d bool\n\tif k != nil && j != nil {\n\t\t_, d = params[*k]\n\t}\n') >= 0, 'flag form hoists');
    ok (f ('k *string, j *string, params any', flagText).indexOf ('InOp') >= 0, 'an any receiver keeps InOp');
    return problems;
}
