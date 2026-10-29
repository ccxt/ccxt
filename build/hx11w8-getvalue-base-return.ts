// hx11 w8: Helpers.GetValue on receivers whose type the base TS signature proves.
//  * `marketSymbols(...)` is typed `string[]`: the printer already casts the local to List<String>, so a
//    loop-counter read prints the native bounds-guarded get (GetValue answers null out of range).
//  * `this.ohlcvs` is `Dictionary<Dictionary<ArrayCache>>`: after the member put `ohlcvs[symbol]` (new map or
//    safeDict with a new-map default) the per-symbol value is a non-null Map, so `.get(key)` is the same read.
// Any site without that proof keeps the helper.

const NEW_MAP = '(?:new (?:java\\.util\\.)?HashMap<String, Object>\\(\\) \\{\\{\\}\\})';

function indentOf (l: string): number {
    return l.length - l.trimStart ().length;
}

// lines strictly between from and to stay inside the scope that holds `from`
function sameScope (lines: string[], from: number, to: number, depth: number): boolean {
    for (let k = from + 1; k < to; k++) {
        const t = lines[k].trim ();
        if (t === '') continue;
        const d = indentOf (lines[k]);
        if (d < depth) return false;
    }
    return true;
}

function declaredOnly (member: string, name: string, type: string): boolean {
    const types = new Set<string> ();
    const re = new RegExp (`(?:^|[\\s(,])((?:final )?[\\w.]+(?:<[\\w.?, ]*>)?) ${name}(?=\\s*(?:=(?!=)|[,);:]))`, 'g');
    for (const d of member.matchAll (re)) {
        if (![ 'return', 'new', 'else', 'case', 'throw', 'instanceof', 'yield' ].includes (d[1])) types.add (d[1].replace (/^final /, ''));
    }
    return types.size === 1 && types.has (type);
}

export function hx11w8GetValueBaseReturn (content: string): string {
    if (!content.includes ('Helpers.GetValue(')) return content;
    const lines = content.split ('\n');
    let changed = false;
    let memberStart = 0;
    for (let i = 0; i < lines.length; i++) {
        if (/^    (?:public|private|protected)\b/.test (lines[i])) memberStart = i;
        if (!lines[i].includes ('Helpers.GetValue(')) continue;
        const member = () => lines.slice (memberStart, i + 1).join ('\n');
        // marketSymbols result read by the loop counter
        const list = /Helpers\.GetValue\(\(List<String>\)\((\w+)\), (\w+)\)/.exec (lines[i]);
        if (list !== null && !/^\s*\/\//.test (lines[i])) {
            const [ whole, recv, idx ] = list;
            const m = member ();
            const counter = new RegExp (`for \\(var ${idx} = 0; `).test (m) && !new RegExp (`(?<![\\w.])${idx}\\s*(?:=(?!=)|\\+=|--)`).test (m.replace (new RegExp (`for \\(var ${idx} = 0;`), ''));
            const marketSymbols = new RegExp (`\\b${recv} = this\\.marketSymbols\\(`).test (m);
            if (counter && marketSymbols && declaredOnly (m, recv, 'Object') || (counter && declaredOnly (m, recv, 'List<String>'))) {
                const l = `((List<String>)(${recv}))`;
                lines[i] = lines[i].replace (whole, `(${l} == null || ${idx} < 0 || ${idx} >= ${l}.size() ? null : ${l}.get(${idx}))`);
                changed = true;
            }
        }
        // per-symbol ohlcvs map read
        const oh = /Helpers\.GetValue\(\(\(Map<\?, \?>\)this\.ohlcvs\)\.get\((\w+)\), (\w+)\)/.exec (lines[i]);
        if (oh === null) continue;
        const [ whole, sym, key ] = oh;
        if (!declaredOnly (member (), key, 'String') || !declaredOnly (member (), sym, 'String')) continue;
        const from = Math.max (memberStart + 1, i - 40);
        const symRe = new RegExp (`(?<![\\w.])${sym}\\s*=(?!=)`);
        let ok = false;
        for (let j = i - 1; j >= from && !ok; j--) {
            const l = lines[j];
            let anchor = -1;
            if (new RegExp (`^\\s*this\\.ohlcvs\\.put\\(${sym}, this\\.safeDict\\(this\\.ohlcvs, ${sym}, ${NEW_MAP}\\)\\);\\s*$`).test (l)) anchor = j;
            else if (/^\s*\}\s*$/.test (l) && j >= from + 3 && lines[j - 2].trim () === '{'
                && new RegExp (`^\\s*this\\.ohlcvs\\.put\\(${sym}, ${NEW_MAP}\\);\\s*$`).test (lines[j - 1])
                && new RegExp (`^\\s*if \\(!\\(\\(\\(Map<\\?, \\?>\\)this\\.ohlcvs\\)\\.containsKey\\(${sym}\\)\\)\\)\\s*$`).test (lines[j - 3])) anchor = j;
            if (anchor === -1) continue;
            ok = sameScope (lines, anchor, i, indentOf (lines[anchor]));
            for (let k = anchor + 1; ok && k < i; k++) {
                if (/this\.ohlcvs\.(?:put|remove|clear)\(|this\.ohlcvs\s*=(?!=)/.test (lines[k]) || symRe.test (lines[k])) ok = false;
            }
            break;
        }
        if (!ok) continue;
        lines[i] = lines[i].replace (whole, `((Map<String, Object>) this.ohlcvs.get(${sym})).get(${key})`);
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

export function hx11w8GetValueBaseReturnSelfTest (): string[] {
    const problems: string[] = [];
    const cls = (body: string) => `public class Gemini extends GeminiRest\n{\n    public Object m(String symbol, String timeframe, Object symbols)\n    {\n${body}\n    }\n}`;
    const put = '        this.ohlcvs.put(symbol, this.safeDict(this.ohlcvs, symbol, new HashMap<String, Object>() {{}}));\n';
    const read = '        io.github.ccxt.ws.ArrayCache s = (io.github.ccxt.ws.ArrayCache) Helpers.GetValue(((Map<?, ?>)this.ohlcvs).get(symbol), timeframe);';
    const loop = '        Object sn = this.marketSymbols(symbols, (Object) null, false, false, false);\n        for (var i = 0; i < ((List<?>)(List<String>)(sn)).size(); i++)\n        {\n            Object x = Helpers.GetValue((List<String>)(sn), i);\n        }';
    const cases: [string, string, string | undefined][] = [
        [ 'ohlcvs after safeDict put', put + read, '((Map<String, Object>) this.ohlcvs.get(symbol)).get(timeframe)' ],
        [ 'ohlcvs without put', read, undefined ],
        [ 'ohlcvs symbol rewritten', put + '        symbol = other;\n' + read, undefined ],
        [ 'ohlcvs put of safeValue', put.replace ('safeDict', 'safeValue') + read, undefined ],
        [ 'marketSymbols loop read', loop, '((List<String>)(sn)).get(i)' ],
        [ 'list read without counter', loop.replace ('for (var i = 0;', 'for (var i = n;'), undefined ],
        [ 'list read of unproven Object', loop.replace ('this.marketSymbols(', 'this.other('), undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = hx11w8GetValueBaseReturn (cls (body));
        const ok = expect === undefined ? out === cls (body) : out.includes (expect);
        if (!ok) problems.push (`hx11 w8 getvalue-base-return: ${name}\n${out}`);
        if (hx11w8GetValueBaseReturn (out) !== out) problems.push (`hx11 w8 getvalue-base-return: ${name} not idempotent`);
    }
    return problems;
}
