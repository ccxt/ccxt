import { goChanMask, goChanClose } from './go-chan.js';
import { hx10G10Decls, hx10G10DeclsAt, NIL_SAFE_MAP } from './hx10w2-G10.js';

// `if <pure terms> || !(InOp(m, k)) {` with k a `*string` and m a plain base map: a nil key reads as absent
// (InOp is false), so a `known` flag set under `k != nil` just before the `if` keeps the behaviour and
// the lookup becomes the native comma-ok. Only pure terms may sit around it (nothing is evaluated early).

function a9fTerms (masked: string, line: string): string[] {
    const terms: string[] = [];
    let depth = 0;
    let from = 0;
    for (let i = 0; i <= masked.length; i++) {
        const c = masked[i];
        if ((c === '(') || (c === '[') || (c === '{')) {
            depth++;
        } else if ((c === ')') || (c === ']') || (c === '}')) {
            depth--;
        }
        if ((i === masked.length) || ((depth === 0) && (masked.startsWith (' || ', i) || masked.startsWith (' && ', i)))) {
            terms.push (line.substring (from, i).trim ());
            from = i + 4;
        }
    }
    return terms;
}

function a9fUnwrap (term: string): string {
    let t = term.trim ();
    while (t.startsWith ('(') && (goChanClose (t, 0) === t.length)) {
        t = t.substring (1, t.length - 1).trim ();
    }
    return t;
}

// the condition's one negated lookup, or undefined when anything impure or unknown is in the condition
function a9fLookup (cond: string, view: Map<string, { type: string }>): { key: string, receiver: string, text: string } | undefined {
    const found: { key: string, receiver: string, text: string }[] = [];
    const walk = (c: string): boolean => {
        const terms = a9fTerms (goChanMask (c), c);
        if (terms.length > 1) {
            return terms.every (t => walk (a9fUnwrap (t)));
        }
        const t = a9fUnwrap (c);
        if (t !== c.trim () || /^\(.*\)$/.test (t) && (goChanClose (t, 0) === t.length)) {
            return walk (t);
        }
        const neg = /^!\((?:ccxt\.)?InOp\((.+), (\w+)\)\)$/.exec (t);
        if (neg !== null) {
            found.push ({ 'key': neg[2], 'receiver': neg[1], 'text': t });
            return true;
        }
        const bare = t.replace (/\bthis\.(?:Markets|Markets_by_id|Currencies|Currencies_by_id)\(\)/g, 'M');
        return /^[!\w*]+(?: (?:==|!=) (?:nil|M))?$/.test (bare) && !/\(/.test (bare) && !/\bInOp\b/.test (bare);
    };
    if (!walk (cond) || (found.length !== 1)) {
        return undefined;
    }
    const { key, receiver } = found[0];
    const rdecl = view.get (receiver);
    if (!NIL_SAFE_MAP.test (receiver) && (rdecl?.type !== 'map[string]any')) {
        return undefined;
    }
    return (view.get (key)?.type === '*string') ? found[0] : undefined;
}

export function hx11w9A9fOrHoistPass (content: string): string {
    if (!/!\((?:ccxt\.)?InOp\(/.test (content)) {
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
        for (let i = 1; i < body.length; i++) {
            const head = /^(\t*)if (.+) \{$/.exec (maskedBody[i]);
            if ((head === null) || /;/.test (maskedBody[i]) || !/!\((?:ccxt\.)?InOp\(/.test (maskedBody[i])) {
                continue;
            }
            const at = body[i].length - head[2].length - 2;
            const view = hx10G10DeclsAt (body, maskedBody, decls, i);
            const look = a9fLookup (body[i].substring (at, at + head[2].length), view);
            if (look === undefined) {
                continue;
            }
            const flag = look.key + 'Known';
            if (new RegExp ('\\b' + flag + '\\b').test (body.join ('\n'))) {
                continue;
            }
            const indent = head[1];
            const read = look.receiver + '[*' + look.key + ']';
            body[i] = body[i].split (look.text).join ('!' + flag);
            const hoist = [ indent + 'var ' + flag + ' bool', indent + 'if ' + look.key + ' != nil {', indent + '\t_, ' + flag + ' = ' + read, indent + '}' ];
            body.splice (i, 0, ...hoist);
            maskedBody.splice (i, 0, ...hoist.map (l => goChanMask (l)));
            maskedBody[i + 4] = goChanMask (body[i + 4]);
            i += 4;
        }
        out.push (...body);
        k = end + 1;
    }
    return out.join ('\n');
}

export function hx11w9A9fOrHoistSelfTest (): string[] {
    const bad: string[] = [];
    const ok = (c: boolean, m: string) => {
        if (!c) {
            bad.push ('a9f or-hoist: ' + m);
        }
    };
    const f = (sig: string, cond: string, pre = '') => hx11w9A9fOrHoistPass ('func (this *X) H(' + sig + ') {\n' + pre + '\tif ' + cond + ' {\n\t\tcontinue\n\t}\n}\n');
    const g = 'entryId *string';
    const hoisted = f (g, '(entryId == nil) || (this.Markets_by_id() == nil) || !(InOp(this.Markets_by_id(), entryId))');
    ok (hoisted.indexOf ('\tvar entryIdKnown bool\n\tif entryId != nil {\n\t\t_, entryIdKnown = this.Markets_by_id()[*entryId]\n\t}\n\tif (entryId == nil) || (this.Markets_by_id() == nil) || !entryIdKnown {') >= 0, 'or form hoists the comma-ok');
    ok (hoisted.indexOf ('InOp') < 0, 'no InOp left');
    ok (f (g, 'isOption && (entryId != nil) && ((this.Markets_by_id() == nil) || !(ccxt.InOp(this.Markets_by_id(), entryId)))').indexOf ('!entryIdKnown)') >= 0, 'and-or chain with a guard hoists');
    ok (f ('entryId any', '(entryId == nil) || !(InOp(this.Markets_by_id(), entryId))').indexOf ('InOp(') >= 0, 'an any key keeps InOp');
    ok (f ('entryId string', '!(InOp(this.Markets_by_id(), entryId))').indexOf ('InOp(') >= 0, 'a plain string key is not this unit');
    ok (f (g, '(entryId == nil) || !(InOp(this.Positions, entryId))').indexOf ('InOp(') >= 0, 'a non-map receiver keeps InOp');
    ok (f (g, '(this.Next() == nil) || !(InOp(this.Markets_by_id(), entryId))').indexOf ('InOp(') >= 0, 'an impure term keeps InOp');
    ok (f (g, '!(InOp(this.Markets_by_id(), entryId)) || !(InOp(this.Markets(), entryId))').indexOf ('Known') < 0, 'two lookups keep InOp');
    ok (f (g, '(entryId == nil) || !(InOp(this.Markets_by_id(), entryId))', '\tvar entryIdKnown bool\n').indexOf ('InOp(') >= 0, 'a taken flag name keeps InOp');
    return bad;
}
