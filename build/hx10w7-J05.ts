// hx10 wave 7 J05 — `x.split (sep)[i]`: the callee's return is a concrete List, so the read hoists
// it into a typed local at its declaration and prints the helper's range guard on that local.
//
// `Helpers.GetValue (new ArrayList<Object> (Arrays.asList (((String) x).split (q))), n)` becomes
// `List<String> p = Arrays.asList (((String) x).split (q));` plus `(n >= p.size () ? null : p.get (n))`.
// The helper's List branch is `toInt (key)`, a bounds test and `list.get` on that same list, so the
// guard answers null exactly where the helper did; the split result is never null and its element
// type is String, so the declaration carries a concrete type with no cast. Nothing else is claimed:
// a receiver the printer spelled otherwise, a non-literal index, or a statement that is not a plain
// assignment / `put` keeps the helper call untouched.

const J05_CTOR = 'new ArrayList<Object>(Arrays.asList(';
const J05_SPLIT = /^\(\(String\)\s*[A-Za-z_]\w*\)\.split\(java\.util\.regex\.Pattern\.quote\("[^"]*"\)\)$/;
// the hoisted declaration must sit before a statement, so only a plain assignment or a `put` argument
const J05_CONTROL = /^(?:if|for|while|switch|return|throw|catch|else|do)\b|->/;

// index of the closer that matches the opener at `open`, or -1
function j05Close (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            const end = text.indexOf ('"', i + 1);
            if (end < 0) { return -1; }
            i = end;
            continue;
        }
        if (c === '(') { depth++; }
        else if (c === ')') {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return -1;
}

// the top-level arguments between `open` (a '(') and its matching close
function j05Args (text: string, open: number, close: number): string[] | undefined {
    const args: string[] = [];
    let depth = 0;
    let start = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = text[i];
        if (c === '"') {
            const end = text.indexOf ('"', i + 1);
            if (end < 0 || end > close) { return undefined; }
            i = end;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') { depth++; }
        else if (c === ')' || c === ']' || c === '}') { depth--; }
        else if (c === ',' && depth === 0) {
            args.push (text.slice (start, i).trim ());
            start = i + 1;
        }
    }
    args.push (text.slice (start, close).trim ());
    return args;
}

export function nativeJ05CallReceiverReads (content: string): string {
    if (!content.includes ('Helpers.GetValue(' + J05_CTOR)) { return content; }
    const lines = content.split ('\n');
    const out: string[] = [];
    let serial = 0;
    for (const line of lines) {
        const indent = /^\s*/.exec (line)?.[0] ?? '';
        let text = line;
        const declarations: string[] = [];
        // a hoisted declaration is only legal where a statement may start: not under a brace-less
        // `if (x)` / `else` / `while (x)` left on the previous line
        const prev = out.length > 0 ? out[out.length - 1] : undefined;
        const statementStart = prev === undefined || prev.trim () === '' || /[;{}]\s*$/.test (prev);
        let search = 0;
        for (;;) {
            const at = text.indexOf ('Helpers.GetValue(' + J05_CTOR, search);
            if (at < 0) { break; }
            const open = at + 'Helpers.GetValue'.length;
            const close = j05Close (text, open);
            if (close < 0) { break; }
            const args = j05Args (text, open, close);
            const receiver = args?.[0] ?? '';
            const index = (args?.[1] ?? '').trim ();
            const inner = receiver.startsWith (J05_CTOR) && receiver.endsWith ('))')
                ? receiver.slice (J05_CTOR.length, -2)
                : '';
            const prefix = text.slice (0, at);
            const statement = (/=\s*$/.test (prefix) || /\.put\([^()]*,\s*$/.test (prefix))
                && !J05_CONTROL.test (text.trim ());
            if (args?.length !== 2 || !J05_SPLIT.test (inner) || !/^\d+$/.test (index) || !statement || !statementStart) {
                search = close + 1;
                continue; // the helper's List branch is only equal on a literal index of a split
            }
            const local = `j05parts${++serial}`;
            declarations.push (`${indent}List<String> ${local} = Arrays.asList(${inner});`);
            text = text.slice (0, at)
                + `(${index} >= ${local}.size() ? null : ${local}.get(${index}))`
                + text.slice (close + 1);
            search = at + 1;
        }
        if (declarations.length > 0) { out.push (...declarations); }
        out.push (text);
    }
    return out.join ('\n');
}

export function j05CallReceiverSelfTest (): string[] {
    const problems: string[] = [];
    const split = 'new ArrayList<Object>(Arrays.asList(((String)cookie).split(java.util.regex.Pattern.quote(";"))))';
    const one = `                Object cookieValue = Helpers.GetValue(${split}, 0);`;
    const fixed = nativeJ05CallReceiverReads (one);
    if (!fixed.includes ('List<String> j05parts1 = Arrays.asList(((String)cookie).split(java.util.regex.Pattern.quote(";")));')) {
        problems.push ('j05: the split receiver must hoist into a typed local');
    }
    if (!fixed.includes ('Object cookieValue = (0 >= j05parts1.size() ? null : j05parts1.get(0));')) {
        problems.push ('j05: the read must print the helper\'s range guard on that local');
    }
    if (fixed.includes ('Helpers.GetValue(')) {
        problems.push ('j05: the split-index read must not keep the helper');
    }
    // every other receiver keeps the helper exactly as it was
    const keep = [
        `        Object a = Helpers.GetValue(new ArrayList<Object>(Arrays.asList(x)), 0);`,
        `        Object b = Helpers.GetValue(new ArrayList<Object>(Arrays.asList(((String)x).split(java.util.regex.Pattern.quote(";")))), i);`,
        `        for (var i = 0; i < Helpers.GetValue(new ArrayList<Object>(Arrays.asList(((String)x).split(java.util.regex.Pattern.quote(";")))), 0); i++)`,
    ];
    for (const line of keep) {
        if (nativeJ05CallReceiverReads (line) !== line) {
            problems.push ('j05: a receiver outside the proven shape must keep the helper: ' + line.trim ());
        }
    }
    // a brace-less `if (x)` on the line above leaves no statement slot for the declaration
    const nested = '        if (Ok(cookie))\n' + one;
    if (nativeJ05CallReceiverReads (nested).includes ('j05parts')) {
        problems.push ('j05: no declaration under a brace-less control line');
    }
    return problems;
}
