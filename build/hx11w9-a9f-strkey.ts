// HX11 w9 a9f: a plain `string` key behind `(M != nil) && InOp(M, key)` on a base map. A nil map reads
// as absent in Go, so the nil check is redundant and the lookup is a native comma-ok.
import { goChanMask, goChanClose } from './go-chan.js';
import { hx10G10Decls, hx10G10DeclsAt, hx10G10OkIsIfLocal, hx11w9Terms, NIL_SAFE_MAP } from './hx10w2-G10.js';

const strip = (text: string, masked: string): [ string, string ] => {
    while (masked.startsWith ('(') && (goChanClose (masked, 0) === masked.length)) {
        text = text.substring (1, text.length - 1);
        masked = masked.substring (1, masked.length - 1);
    }
    return [ text, masked ];
};

// one `(M != nil) && InOp(M, key)` operand with a string key: its receiver and key
function lookup (text: string, masked: string, view: Map<string, { type: string }>): { receiver: string, key: string } | undefined {
    const [ t, m ] = strip (text.trim (), masked.trim ());
    const terms = hx11w9Terms (t, m);
    const inop = (terms?.length === 2) ? /^(?:ccxt\.)?InOp\((.+), (\w+)\)$/.exec (terms[1]) : null;
    if ((terms === undefined) || (inop === null) || (terms[0] !== inop[1] + ' != nil')) {
        return undefined;
    }
    const plainMap = NIL_SAFE_MAP.test (inop[1]) || (view.get (inop[1])?.type === 'map[string]any');
    return (plainMap && (view.get (inop[2])?.type === 'string')) ? { receiver: inop[1], key: inop[2] } : undefined;
}

// the operands of a top-level `||` chain
function operands (text: string, masked: string): Array<[ string, string ]> {
    const out: Array<[ string, string ]> = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i <= masked.length; i++) {
        const c = masked[i];
        depth += ('([{'.indexOf (c) >= 0 && c !== undefined) ? 1 : (')]}'.indexOf (c) >= 0 && c !== undefined) ? -1 : 0;
        if ((i === masked.length) || ((depth === 0) && masked.startsWith (' || ', i))) {
            out.push ([ text.substring (from, i), masked.substring (from, i) ]);
            from = i + 4;
        }
    }
    return out;
}

const camel = (receiver: string): string => 'in' + receiver.replace (/^this\./, '').replace (/\(\)$/, '').replace (/_(\w)/g, (_, c) => c.toUpperCase ()).replace (/^\w/, c => c.toUpperCase ());

export function hx11w9StrKeyPass (content: string): string {
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
            const m = /^(\t*)(\} else if |if )(.+) \{$/.exec (maskedBody[i]);
            if ((m === null) || /;/.test (maskedBody[i]) || !/\bInOp\(/.test (maskedBody[i])) {
                continue;
            }
            const at = m[1].length + m[2].length;
            const view = hx10G10DeclsAt (body, maskedBody, decls, i);
            const parts = operands (body[i].substring (at, at + m[3].length), m[3]);
            const looks = parts.map (p => lookup (p[0], p[1], view));
            if (looks.some (l => l === undefined)) {
                continue;
            }
            const found = looks as Array<{ receiver: string, key: string }>;
            if (found.length === 1) {
                if (plain) {
                    body[i] = m[1] + m[2] + '_, ok := ' + found[0].receiver + '[' + found[0].key + ']; ok {';
                    maskedBody[i] = goChanMask (body[i]);
                }
                continue;
            }
            // several operands: hoist each pure lookup into a flag (plain `if` only, never an else-if arm)
            const names = found.map ((f, n) => camel (f.receiver) + (found.findIndex (g => g.receiver === f.receiver) < n ? String (n) : ''));
            const taken = new RegExp ('\\b(?:' + names.join ('|') + ')\\b');
            if ((m[2] !== 'if ') || (new Set (names).size !== names.length) || body.some (l => taken.test (l))) {
                continue;
            }
            const hoisted = found.map ((f, n) => m[1] + '_, ' + names[n] + ' := ' + f.receiver + '[' + f.key + ']');
            body.splice (i, 1, ...hoisted, m[1] + 'if ' + names.join (' || ') + ' {');
            maskedBody.splice (i, 1, ...body.slice (i, i + hoisted.length + 1).map (l => goChanMask (l)));
            i += hoisted.length;
        }
        out.push (...body);
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx11w9StrKeySelfTest (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, name: string) => {
        if (!cond) {
            problems.push ('hx11w9StrKey: ' + name);
        }
    };
    const g = (sig: string, body: string) => hx11w9StrKeyPass ('func (this *X) H(' + sig + ') any {\n' + body + '}\n');
    const iff = (cond: string, sig = 'symbol string') => g (sig, '\tif ' + cond + ' {\n\t\ta()\n\t}\n');
    ok (iff ('(this.Markets() != nil) && (InOp(this.Markets(), symbol))').indexOf ('\tif _, ok := this.Markets()[symbol]; ok {') >= 0, 'string key goes native');
    ok (iff ('(this.Markets() != nil) && (ccxt.InOp(this.Markets(), symbol))').indexOf ('InOp') < 0, 'ccxt-qualified goes native');
    ok (iff ('(this.Markets() != nil) && (InOp(this.Markets(), symbol))', 'symbol *string').indexOf ('InOp(') >= 0, 'a pointer key keeps InOp here');
    ok (iff ('(this.Markets() != nil) && (InOp(this.Markets(), symbol))', 'symbol any').indexOf ('InOp(') >= 0, 'an any key keeps InOp');
    ok (iff ('(this.Balance != nil) && (InOp(this.Balance, symbol))').indexOf ('InOp(') >= 0, 'a receiver outside the family keeps InOp');
    ok (iff ('(this.Markets_by_id() != nil) && (InOp(this.Markets(), symbol))').indexOf ('InOp(') >= 0, 'a different nil-checked receiver keeps InOp');
    ok (iff ('(InOp(this.Markets(), symbol))').indexOf ('InOp(') >= 0, 'no guard keeps InOp');
    ok (iff ('(this.Markets() != nil) && (x) && (InOp(this.Markets(), symbol))').indexOf ('InOp(') >= 0, 'an extra term keeps InOp');
    ok (g ('account string', '\tif _, ok := m[account]; ok {\n\t\treturn 1\n\t} else if (this.Markets() != nil) && (InOp(this.Markets(), account)) {\n\t\treturn 2\n\t}\n').indexOf ('} else if _, ok := this.Markets()[account]; ok {') >= 0, 'an else-if arm goes native');
    const both = iff ('((this.Markets() != nil) && (InOp(this.Markets(), symbol))) || ((this.Markets_by_id() != nil) && (InOp(this.Markets_by_id(), symbol)))');
    ok (both.indexOf ('\t_, inMarkets := this.Markets()[symbol]\n\t_, inMarketsById := this.Markets_by_id()[symbol]\n\tif inMarkets || inMarketsById {') >= 0, 'an || pair is hoisted into flags');
    ok (g ('symbol string', '\tx := 1\n\tif y {\n\t} else if ((this.Markets() != nil) && (InOp(this.Markets(), symbol))) || ((this.Markets_by_id() != nil) && (InOp(this.Markets_by_id(), symbol))) {\n\t}\n').indexOf ('InOp(') >= 0, 'an || pair in an else-if keeps InOp');
    ok (g ('symbol string', '\tinMarkets := 1\n\tif ((this.Markets() != nil) && (InOp(this.Markets(), symbol))) || ((this.Markets_by_id() != nil) && (InOp(this.Markets_by_id(), symbol))) {\n\t}\n').indexOf ('InOp(') >= 0, 'a taken flag name keeps InOp');
    ok (g ('symbol string', '\tif (this.Markets() != nil) && (InOp(this.Markets(), symbol)) || z {\n\t}\n').indexOf ('InOp(') >= 0, 'an impure || operand keeps InOp');
    ok (g ('symbol string', '\tif ok := f(); ok {\n\t}\n\tif (this.Markets() != nil) && (InOp(this.Markets(), symbol)) {\n\t}\n').indexOf ('InOp(') >= 0, 'a non-if-local ok keeps InOp');
    return problems;
}
