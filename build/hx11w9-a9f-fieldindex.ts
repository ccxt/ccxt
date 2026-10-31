// hx11 w9 a9f: InOp on an indexed ohlcv book (this.Ohlcvs[symbol]) or the ws client snapshot, with a *string key
// the same condition (or an earlier exit guard) proves non-nil, prints the native comma-ok. Typed maps only.
import { goChanMask } from './go-chan.js';
import { hx10G10Decls, hx10G10DeclsAt, hx10G10Key, hx10G10OkIsIfLocal, hx11w9Terms } from './hx10w2-G10.js';

const RECEIVER = /^(?:this\.WsClientsSnapshot\(\)|this\.Ohlcvs\[(\w+)\])$/;

export function hx11w9A9fFieldIndexInOpPass (content: string): string {
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
            if ((head === null) || !plain || /;/.test (maskedBody[i]) || !/\bInOp\(/.test (maskedBody[i])) {
                continue;
            }
            const indent = head[1];
            const cond = body[i].substring (indent.length + 3, body[i].length - 2);
            const terms = hx11w9Terms (cond, head[2]);
            const inops = (terms ?? []).map (t => /^(?:ccxt\.)?InOp\((.+), (\w+)\)$/.exec (t)).filter (m => m !== null);
            if ((terms === undefined) || (inops.length !== 1) || (inops[0] === null)) {
                continue;
            }
            const [ , receiver, key ] = inops[0];
            const recv = RECEIVER.exec (receiver);
            const view = hx10G10DeclsAt (body, maskedBody, decls, i);
            const keyType = view.get (key)?.type;
            if ((recv === null) || ((keyType !== '*string') && (keyType !== 'string')) || ((recv[1] !== undefined) && (view.get (recv[1])?.type !== 'string'))) {
                continue;
            }
            const isGuard = (t: string) => (t === key + ' != nil') || new RegExp ('^!(?:ccxt\\.)?IsEqual\\(' + key + ', nil\\)$').test (t);
            const inopAt = terms.findIndex (t => /^(?:ccxt\.)?InOp\(/.test (t));
            const guardAt = terms.findIndex (isGuard);
            const nilAt = terms.indexOf (receiver + ' != nil');
            const rest = terms.filter ((t, n) => (n !== inopAt) && (n !== guardAt) && (n !== nilAt));
            if ((rest.length > 0) || (terms.filter (isGuard).length > 1) || ((nilAt >= 0) && ((recv[1] !== undefined) || (nilAt > inopAt)))) {
                continue;
            }
            if (guardAt < 0) {
                const keyText = hx10G10Key (maskedBody, view, key, i);
                if (keyText === undefined) {
                    continue;
                }
                body[i] = indent + 'if _, ok := ' + receiver + '[' + keyText + ']; ok {';
                maskedBody[i] = body[i];
                continue;
            }
            // a guard term: the nil case falls past a then-block with no else arm
            if ((keyType !== '*string') || (guardAt > inopAt)) {
                continue;
            }
            let close = i + 1;
            while ((close < body.length) && !maskedBody[close].startsWith (indent + '}')) {
                close++;
            }
            if ((close >= body.length) || (maskedBody[close] !== indent + '}')) {
                continue;
            }
            const names = key + (recv[1] !== undefined ? '|' + recv[1] : '');
            const writes = new RegExp ('(?<![\\w.*&])(?:' + names + ')\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|&(?:' + names + ')\\b');
            if (maskedBody.slice (i + 1, close).some (l => writes.test (l))) {
                continue;
            }
            const read = receiver + '[*' + key + ']';
            const inner = body.slice (i + 1, close).map (l => (l === '' ? l : '\t' + l));
            const replacement = [ indent + 'if ' + key + ' != nil {', indent + '\tif _, ok := ' + read + '; ok {' ].concat (inner, [ indent + '\t}', indent + '}' ]);
            body.splice (i, close - i + 1, ...replacement);
            maskedBody.splice (i, close - i + 1, ...goChanMask (replacement.join ('\n')).split ('\n'));
            i += 1;
        }
        out.push (...body);
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx11w9A9fSelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11-a9f: ' + message); } };
    const g = (sig: string, body: string) => hx11w9A9fFieldIndexInOpPass ('func (this *X) H(' + sig + ') {\n' + body + '}\n');
    const book = '\tif (timeframe != nil) && (ccxt.InOp(this.Ohlcvs[symbol], timeframe)) {\n\t\tdelete(this.Ohlcvs[symbol], *timeframe)\n\t}\n';
    ok (g ('symbol string, timeframe *string', book).indexOf ('\tif timeframe != nil {\n\t\tif _, ok := this.Ohlcvs[symbol][*timeframe]; ok {\n\t\t\tdelete(this.Ohlcvs[symbol], *timeframe)\n\t\t}\n\t}') >= 0, 'guarded book key goes native');
    ok (g ('symbol string, timeframe *string', book.replace ('(timeframe != nil) && ', '')).indexOf ('InOp(this.Ohlcvs[symbol], timeframe)') >= 0, 'an unproven key keeps InOp');
    ok (g ('symbol any, timeframe *string', book).indexOf ('InOp(') >= 0, 'an any book index keeps InOp');
    ok (g ('symbol string, timeframe any', book).indexOf ('InOp(') >= 0, 'an any key keeps InOp');
    ok (g ('symbol string, timeframe *string', book.replace ('\t}\n', '\t} else {\n\t\tb()\n\t}\n')).indexOf ('InOp(') >= 0, 'an else arm keeps InOp');
    ok (g ('symbol string, timeframe *string', book.replace ('\t\tdelete', '\t\ttimeframe = nil\n\t\tdelete')).indexOf ('InOp(') >= 0, 'a rebound key keeps InOp');
    ok (g ('symbol string, timeframe *string', book.replace ('\t\tdelete', '\t\tsymbol = "x"\n\t\tdelete')).indexOf ('InOp(') >= 0, 'a rebound index keeps InOp');
    ok (g ('accountType string, code *string', '\tif (code != nil) && (ccxt.InOp(this.Balance[accountType], code)) {\n\t}\n').indexOf ('InOp(') >= 0, 'an any-valued Balance entry keeps InOp');
    ok (g ('symbol string, timeframe *string', '\tif (ccxt.InOp(this.Ohlcvs[symbol], timeframe)) && (timeframe != nil) {\n\t}\n').indexOf ('InOp(') >= 0, 'a lookup ahead of its guard keeps InOp');
    const snap = (guard: string) => g ('', '\tvar url *string = this.SafeString(params, \"url\")\n' + guard + '\tif (this.WsClientsSnapshot() != nil) && (ccxt.InOp(this.WsClientsSnapshot(), url)) {\n\t\treturn nil\n\t}\n');
    ok (snap ('\tif url == nil {\n\n\t\treturn nil\n\t}\n').indexOf ('\tif _, ok := this.WsClientsSnapshot()[*url]; ok {') >= 0, 'an exit-guarded key reads the snapshot natively');
    ok (snap ('').indexOf ('InOp(this.WsClientsSnapshot(), url)') >= 0, 'no guard keeps InOp');
    return problems;
}
