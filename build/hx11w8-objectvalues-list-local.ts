// `Object x = Helpers.objectValues(..);` -> `List<Object> x = ...`. TS Object.values() is an array and the
// helper returns a fresh non-null List<Object>, so the declared type is exact. Only locals with no other
// write in the member are retyped; the J03 pass then reads `x[i]` natively.
const MEMBER_START = /^    (?:public|private|protected)\b/;
const DECLARATION = /^(\s*)Object (\w+) = Helpers\.objectValues\(/;

export function hx11w8ObjectValuesListLocals (content: string): string {
    if (!content.includes ('= Helpers.objectValues(')) return content;
    const lines = content.split ('\n');
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) if (MEMBER_START.test (lines[i])) starts.push (i);
    for (let s = 0; s < starts.length; s++) {
        const from = starts[s];
        const to = s + 1 < starts.length ? starts[s + 1] : lines.length;
        for (let j = from + 1; j < to; j++) {
            const m = DECLARATION.exec (lines[j]);
            if (m === null) continue;
            const name = m[2];
            const declared = new RegExp ('^\\s*(?:final\\s+)?[A-Za-z_][\\w.<>?, ]*\\s+' + name + '\\s*(?:=|;)');
            const write = new RegExp ('(?<![\\w$.])' + name + '\\s*(?:[-+*/%&|^]|<<|>>>?)?=(?!=)');
            let ok = true;
            for (let k = from + 1; k < to && ok; k++) {
                if (k === j || /^\s*(?:\/\/|\*)/.test (lines[k])) continue;
                if (declared.test (lines[k]) || write.test (lines[k])) ok = false;
            }
            if (ok) lines[j] = lines[j].replace (DECLARATION, '$1List<Object> $2 = Helpers.objectValues(');
        }
    }
    return lines.join ('\n');
}
