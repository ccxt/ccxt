// hx11: Rust sign `api` element typing (the Go half moved to ast-transpiler src/go/hx11-sign-typing.ts)
// Rust: `let mut apiName: Value = api.get(0)...` whose every later use is `apiName.as_str() == Some("lit")` is a
// native Option<String>, exactly what the safe_string form was typed as before the element read.
export function hx11RustSignApiStr (content: string): string {
    // an unbound `api` / `section` read: the bounds-checked nth of the list view, no closure
    content = content.replace (/\b(api|section)\.as_array\(\)\.and_then\(\|__arr\| __arr\.get\((\d+)\)\)/g, '$1.as_array().into_iter().flatten().nth($2)');
    if (content.indexOf ('.get(') < 0) { return content; }
    const lines = content.split ('\n');
    const decl = /^(\s*)let mut (\w+): Value = (?:api|section)\.get\((\d+)\)\.cloned\(\)\.unwrap_or\(Value::Null\);$/;
    const fnHead = /^ {4}(?:pub )?(?:async )?fn /;
    for (let i = 0; i < lines.length; i++) {
        const m = decl.exec (lines[i]);
        if (m === null) { continue; }
        let end = i + 1;
        while ((end < lines.length) && !fnHead.test (lines[end])) { end++; }
        const name = new RegExp ('(?<![\\w.])' + m[2] + '(?![\\w])', 'g');
        const use = new RegExp ('(?<![\\w.])' + m[2] + '\\.as_str\\(\\) (==|!=) Some\\("', 'g');
        let uses = 0;
        let others = 0;
        for (let j = i + 1; j < end; j++) {
            const masked = lines[j].replace (/"(?:[^"\\]|\\.)*"/g, '""');
            uses += (lines[j].match (use) ?? []).length;
            others += (masked.match (name) ?? []).length;
        }
        if ((uses === 0) || (uses !== others)) { continue; }
        lines[i] = m[1] + 'let mut ' + m[2] + ': Option<String> = ' + ((m[0].indexOf ('section') >= 0 ? 'section' : 'api')) + '.get(' + m[3] + ').and_then(Value::as_str).map(str::to_owned);';
        for (let j = i + 1; j < end; j++) {
            lines[j] = lines[j].replace (use, (all, op) => m[2] + '.as_deref() ' + op + ' Some("');
        }
    }
    return lines.join ('\n');
}
