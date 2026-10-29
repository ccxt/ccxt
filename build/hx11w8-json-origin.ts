// HX11 w8 derefscalar-json-origin: `DerefScalar(L[i])` on a `[]any` list read from a raw JSON response is `L[i]`.
// Decoded JSON (ParseJSON/normalizeNumbers) holds no *string/*int64/*float64/*bool, so derefScalar answers
// the element unchanged. Proof, per function, for the list local L:
//   - L has one declaration, `SafeListTyped(R, <key>)`, is never rebound, and every use is len(L),
//     `range L` or `DerefScalar(L[..])` (no escape, no element write);
//   - R has one declaration and is either `rN.Value` of one `rN := <-this.Endpoint(..)` (rN only read through
//     .Err/.Value/.Raw, .Value used once) or `SafeMapTyped(R2, "lit")` of such an R2; R is only read by
//     SafeListTyped/SafeMapTyped (first argument) or IsEqual(R, nil).
// Anything else keeps the helper.

const ESC = (s: string) => s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

function declsOf (code: string, n: string): string[] {
    const re = new RegExp ('^[ \\t]*(?:var[ \\t]+' + ESC (n) + '[ \\t]+[^=\\n]+=|' + ESC (n) + '[ \\t]*:=)[ \\t]*(.*)$', 'gm');
    return [ ...code.matchAll (re) ].map ((m) => m[1]);
}

function declLineStarts (code: string, n: string): Set<number> {
    const re = new RegExp ('^([ \\t]*)(?:var[ \\t]+(' + ESC (n) + ')[ \\t]+[^=\\n]+=|(' + ESC (n) + ')[ \\t]*:=)', 'gm');
    const out = new Set<number> ();
    for (const m of code.matchAll (re)) { out.add (m.index + m[1].length + (m[0].slice (m[1].length).startsWith ('var') ? 4 : 0)); }
    return out;
}

function reassigned (code: string, n: string): boolean {
    return new RegExp ('^[ \\t]*' + ESC (n) + '[ \\t]*(?:[-+*/]?=)(?!=)', 'm').test (code) || new RegExp ('(?<![\\w.])' + ESC (n) + '(?:\\+\\+|--)').test (code) || new RegExp ('[^=!<>:]&' + ESC (n) + '(?!\\w)').test (code);
}

function occurrences (code: string, n: string): number[] {
    return [ ...code.matchAll (new RegExp ('(?<![\\w."])' + ESC (n) + '(?!\\w)', 'g')) ].map ((m) => m.index as number);
}

function listIsReadOnly (code: string, list: string): boolean {
    const decl = declLineStarts (code, list);
    for (const at of occurrences (code, list)) {
        if (decl.has (at)) { continue; }
        const pre = code.slice (Math.max (0, at - 13), at);
        const post = code.slice (at + list.length, at + list.length + 1);
        if (pre.endsWith ('len(') || /\brange[ \t]$/.test (pre)) { continue; }
        if (pre.endsWith ('DerefScalar(') && (post === '[')) { continue; }
        return false;
    }
    return true;
}

function mapIsReadOnly (code: string, name: string): boolean {
    const decl = declLineStarts (code, name);
    for (const at of occurrences (code, name)) {
        if (decl.has (at)) { continue; }
        const pre = code.slice (Math.max (0, at - 16), at);
        if (/(?:SafeListTyped|SafeMapTyped)\($/.test (pre)) { continue; }
        if (/IsEqual\($/.test (pre) && code.slice (at + name.length).startsWith (', nil)')) { continue; }
        return false;
    }
    return true;
}

function jsonOrigin (code: string, name: string, depth = 0): boolean {
    if (depth > 5) { return false; }
    const d = declsOf (code, name);
    if ((d.length !== 1) || reassigned (code, name) || !mapIsReadOnly (code, name)) { return false; }
    const direct = /^(r\d*)\.(?:Value|Raw)$/.exec (d[0].trim ());
    if (direct !== null) {
        const r = direct[1];
        const rd = declsOf (code, r);
        if ((rd.length !== 1) || !/^<-this\.\w+\(/.test (rd[0])) { return false; }
        const rDecl = declLineStarts (code, r);
        for (const at of occurrences (code, r)) {
            if (rDecl.has (at)) { continue; }
            if (!/^\.(?:Err|Value|Raw)\b/.test (code.slice (at + r.length, at + r.length + 8))) { return false; }
        }
        return ([ ...code.matchAll (new RegExp ('(?<![\\w."])' + ESC (r) + '\\.(?:Value|Raw)\\b', 'g')) ].length === 1);
    }
    const via = /^SafeMapTyped\((\w+),[ \t]*"[^"]*"\)$/.exec (d[0].trim ());
    return (via !== null) && jsonOrigin (code, via[1], depth + 1);
}

function rewriteFunc (text: string): string {
    const masked = text.split ('\n').map ((l) => (/^\s*\/\//.test (l) ? '' : l)).join ('\n');
    const lists = new Set<string> ();
    for (const m of masked.matchAll (/DerefScalar\((\w+)\[\w+\]\)/g)) { lists.add (m[1]); }
    let out = text;
    for (const list of lists) {
        const d = declsOf (text, list);
        const src = (d.length === 1) ? /^SafeListTyped\((\w+),[^()]*\)$/.exec (d[0].trim ()) : null;
        if ((src === null) || reassigned (masked, list) || !listIsReadOnly (masked, list) || !jsonOrigin (masked, src[1])) { continue; }
        out = out.replace (new RegExp ('DerefScalar\\(' + ESC (list) + '\\[(\\w+)\\]\\)', 'g'), list + '[$1]');
    }
    return out;
}

export function hx11w8JsonOrigin (content: string): string {
    if ((content.indexOf ('DerefScalar(') < 0) || (content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0)) { return content; }
    const parts = content.split (/^(?=func )/m);
    return parts.map ((p) => (p.startsWith ('func ') ? rewriteFunc (p) : p)).join ('');
}

export function hx11w8JsonOriginCheck (): string[] {
    const problems: string[] = [];
    const fn = (body: string) => 'func (this *X) f() any {\n' + body + '\treturn nil\n}\n';
    const base = '\tr1 := <-this.PublicGetThing(params)\n\tif r1.Err != nil {\n\t\tpanic(r1.Err)\n\t}\n\tvar response map[string]any = r1.Value\n\tvar data []any = SafeListTyped(response, "data")\n';
    const use = '\tfor i := 0; i < len(data); i++ {\n\t\tvar row any = DerefScalar(data[i])\n\t\t_ = row\n\t}\n';
    const want = (s: string, text: string, label: string, native: boolean) => {
        const got = hx11w8JsonOrigin ('// IT IS GENERATED AND WILL BE OVERWRITTEN\n' + fn (s));
        if (got.includes ('DerefScalar(data[i])') === native) { problems.push ('hx11w8-json-origin: ' + label + (native ? ' kept the helper' : ' lost the helper')); }
    };
    want (base + use, '', 'response list', true);
    want (base.replace ('var response map[string]any = r1.Value\n\tvar data []any = SafeListTyped(response, "data")', 'var data []any = SafeListTyped(r1.Value, "data")') + use, '', 'non-ident producer', false);
    want (base + use + '\tdata = append(data, 1)\n', '', 'rebound list', false);
    want (base + use + '\tdata[0] = 1\n', '', 'element write', false);
    want (base + use + '\treturn data\n', '', 'escaping list', false);
    want (base + use + '\tthis.F(response)\n', '', 'response escapes', false);
    want (base.replace ('r1.Value', 'this.Other()') + use, '', 'non-endpoint producer', false);
    want (base.replace ('var data []any = SafeListTyped(response, "data")', 'var data []any = SafeListTyped(this.Options, "data")') + use, '', 'field producer', false);
    want (base.replace ('SafeListTyped(response, "data")', 'ToArray(response)') + use, '', 'ToArray list', false);
    want (base.replace ('var response map[string]any = r1.Value', 'var raw map[string]any = r1.Value\n\tvar response map[string]any = SafeMapTyped(raw, "result")') + use, '', 'chained SafeMapTyped', true);
    return problems;
}
