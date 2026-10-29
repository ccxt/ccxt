// HX11 w8 ethencode-structured-bytes: BaseExchange.EthEncodeStructuredData returns []uint8 (exchange_eth.go), so
// `var x any = this.EthEncodeStructuredData(..)` is `var x []uint8 = ..` when x is declared once per function,
// never rebound, and every other use is the first argument of this.Hash / this.SignMessage /
// this.HashEip712Digest, whose parameter is `any` in the hand-written base and in every in-file override.

const ESC = (s: string) => s.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
const DECL = /^([ \t]*)var (\w+) any = this\.EthEncodeStructuredData\(/gm;
const SINK = /^(?:this\.Hash\(|this\.SignMessage\(|this\.HashEip712Digest\()$/;

function anySinks (content: string): boolean {
    // every in-file SignMessage / HashEip712Digest definition takes its first parameter as `any`
    for (const m of content.matchAll (/^func \(this \*\w+\) (?:SignMessage|HashEip712Digest)\((\w+) (\w+)/gm)) {
        if (m[2] !== 'any') { return false; }
    }
    return true;
}

function rewriteFunc (part: string, sinksOk: boolean): string {
    if (!sinksOk) { return part; }
    const names = [ ...part.matchAll (DECL) ].map ((m) => m[2]);
    let out = part;
    for (const n of new Set (names)) {
        if (names.filter ((x) => x === n).length !== 1) { continue; }
        const body = part.split ('\n').filter ((l) => !/^\s*\/\//.test (l)).join ('\n');
        const decl = new RegExp ('^[ \\t]*var ' + ESC (n) + ' any = this\\.EthEncodeStructuredData\\(', 'm');
        if (new RegExp ('(?:^|[^\\w.])' + ESC (n) + '[ \\t]*(?:[-+*/]?=|:=|\\+\\+|--)(?!=)').test (body.replace (decl, '')) || new RegExp ('&' + ESC (n) + '(?!\\w)').test (body)) { continue; }
        let ok = true;
        for (const m of body.matchAll (new RegExp ('(?<![\\w."])' + ESC (n) + '(?![\\w"])', 'g'))) {
            const at = m.index as number;
            const lineStart = body.lastIndexOf ('\n', at) + 1;
            const before = body.slice (lineStart, at);
            if (/\bvar $/.test (before)) { continue; }
            const tail = body.slice (0, at).match (/(?:this\.Hash\(|this\.SignMessage\(|this\.HashEip712Digest\()$/);
            if ((tail === null) || !SINK.test (tail[0])) { ok = false; break; }
        }
        if (ok) {
            out = out.replace (new RegExp ('^([ \\t]*var ' + ESC (n) + ') any = (this\\.EthEncodeStructuredData\\()', 'm'), '$1 []uint8 = $2');
        }
    }
    return out;
}

export function hx11w8EthEncodeBytes (content: string): string {
    if ((content.indexOf ('this.EthEncodeStructuredData(') < 0) || (content.indexOf ('IT IS GENERATED AND WILL BE OVERWRITTEN') < 0)) { return content; }
    const sinksOk = anySinks (content);
    return content.split (/^(?=func )/m).map ((p) => (p.startsWith ('func ') ? rewriteFunc (p, sinksOk) : p)).join ('');
}

export function hx11w8EthEncodeBytesCheck (): string[] {
    const problems: string[] = [];
    const run = (body: string, extra = '') => hx11w8EthEncodeBytes ('// IT IS GENERATED AND WILL BE OVERWRITTEN\n' + extra + 'func (this *X) f() any {\n' + body + '}\n');
    const d = '\tvar m any = this.EthEncodeStructuredData(a, b, c)\n';
    const want = (label: string, text: string, typed: boolean) => {
        if (text.includes ('var m []uint8 = ') !== typed) { problems.push ('hx11w8-eth-encode-bytes: ' + label + (typed ? ' stayed any' : ' was retyped')); }
    };
    want ('sign', run (d + '\tvar s any = this.SignMessage(m, this.PrivateKey)\n\treturn s\n'), true);
    want ('hash', run (d + '\treturn this.SignHash(this.Hash(m, keccak, "hex"), k)\n'), true);
    want ('multi-line', run ('\tvar m any = this.EthEncodeStructuredData(a, map[string]any{\n\t\t"k": 1,\n\t}, c)\n\treturn this.SignMessage(m, k)\n'), true);
    want ('rebound', run (d + '\tm = nil\n\treturn this.SignMessage(m, k)\n'), false);
    want ('returned', run (d + '\treturn m\n'), false);
    want ('other callee', run (d + '\treturn this.Other(m)\n'), false);
    want ('second arg', run (d + '\treturn this.SignMessage(k, m)\n'), false);
    want ('two decls', run (d + d + '\treturn this.SignMessage(m, k)\n'), false);
    want ('typed override', run (d + '\treturn this.SignMessage(m, k)\n', 'func (this *X) SignMessage(message string, k any) string {\n}\n'), false);
    return problems;
}
