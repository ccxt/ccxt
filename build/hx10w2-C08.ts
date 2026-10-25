// hx10w2 C08 — the runtime state fields retyped in cs/ccxt/base/Exchange.Options.cs
// (`IDictionary<string, object>` maps and the `List<object>` account list) are statically
// known at their use sites, so their element reads print the native op instead of the
// helper call. Every emission carries GetValue / InOp / getArrayLength's own null test.

export const CSHARP_RUNTIME_STATE_FIELD_KINDS: { [name: string]: string } = {
    // `public IDictionary<string, object> <name> { get; set; }` (Exchange.Options.cs)
    'fees': 'dict',
    'requiredCredentials': 'dict',
    'exceptions': 'dict',
    // `public List<object> accounts { get; set; }` — every writer stores a List<object>
    'accounts': 'list',
};

const STATE_HELPER_RE = /(?<![A-Za-z_.])(getValue|inOp|getArrayLength)[ ]?\(this\.([A-Za-z_]\w*)/g;

// the index of the `)` closing the call whose `(` sits at `open`
function stateCallEnd (line: string, open: number): number | undefined {
    let depth = 0;
    for (let i = open; i < line.length; i++) {
        if (line[i] === '(') depth++;
        if (line[i] === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return undefined;
}

// the index of the first comma at the argument level between `open` and `close`
function stateTopLevelComma (line: string, open: number, close: number): number | undefined {
    let depth = 0;
    for (let i = open + 1; i < close; i++) {
        const ch = line[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) return i;
    }
    return undefined;
}

const STATE_METHOD_START_RE = /^[ ]{4,}(?:(?:public|private|protected|internal)[ ]+)?(?:static[ ]+|async[ ]+|virtual[ ]+|override[ ]+|sealed[ ]+|partial[ ]+)*[A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*[ ]+[A-Za-z_]\w*[ ]*\(/;

function stateMaskLine (line: string): string {
    return line.replace (/"(\\.|[^"\\])*"/g, '""').replace (/\/\/.*$/, '');
}

// the line of the method signature that holds `line` (its own line is never a candidate)
function stateMethodStart (lines: string[], line: number): number {
    for (let k = line - 1; k >= 0; k--) {
        if (STATE_METHOD_START_RE.test (lines[k]) && !lines[k].trimEnd ().endsWith (';')) return k;
    }
    return -1;
}

// every C# type that binds `name` between the method signature and the read; C# types are
// static, so a one-entry set is the proof (a second spelling means a sibling scope)
function stateBindingTypes (lines: string[], start: number, end: number, name: string): Set<string> {
    const types = new Set<string> ();
    const typed = new RegExp ('(?<![\\w.])([A-Za-z_][\\w<>?\\[\\]]*)[ ]+' + name + '\\b(?=[ ]*(?:=[^=]|;|\\)|,|\\bin\\b))', 'g');
    const keywords = [ 'return', 'throw', 'else', 'case', 'new', 'await', 'in', 'out', 'ref', 'typeof', 'nameof', 'using', 'yield' ];
    for (let k = start; k <= end; k++) {
        for (const m of stateMaskLine (lines[k]).matchAll (typed)) {
            if (keywords.includes (m[1])) continue;
            types.add (m[1]);
        }
    }
    return types;
}

function stateKeyKind (lines: string[], line: number, text: string): string | undefined {
    if (/^"(?:\\.|[^"\\])*"$/.test (text)) return 'literal';
    if (/^-?\d{1,9}$/.test (text)) return 'int';
    if (!/^[A-Za-z_]\w*$/.test (text)) return undefined;
    const start = stateMethodStart (lines, line);
    if (start < 0) return undefined;
    const types = stateBindingTypes (lines, start, line, text);
    if (types.size !== 1) return undefined;
    const only = [ ...types ][0];
    if ((only === 'string') || (only === 'string?')) return 'string';
    if (only === 'int') return 'int';
    return undefined;
}

// one emission per call; undefined keeps the helper call exactly as printed
function stateNativeCall (lines: string[], line: number, helper: string, field: string, key: string): string | undefined {
    const kind = CSHARP_RUNTIME_STATE_FIELD_KINDS[field];
    if (kind === undefined) return undefined;
    const r = 'this.' + field;
    if (helper === 'getArrayLength') {
        return (kind === 'list') ? `(${r}?.Count ?? 0)` : undefined;
    }
    const keyKind = stateKeyKind (lines, line, key);
    if (kind === 'dict') {
        if (helper === 'getValue') {
            if (keyKind === 'literal') return `(${r} != null && ${r}.ContainsKey(${key}) ? ${r}[${key}] : null)`;
            if (keyKind === 'string') return `(${r} != null && ${key} != null && ${r}.ContainsKey(${key}) ? ${r}[${key}] : null)`;
        } else if (helper === 'inOp') {
            if (keyKind === 'literal') return `(${r} != null && ${r}.ContainsKey(${key}))`;
            if (keyKind === 'string') return `(${r} != null && ${key} != null && ${r}.ContainsKey(${key}))`;
        }
        return undefined;
    }
    if (keyKind !== 'int') return undefined;
    if (helper === 'getValue') return `(${r} != null && ${key} < ${r}.Count ? ${r}[${key}] : null)`;
    return undefined;
}

export function hxC08NativeRuntimeStateReads (content: string): string {
    if (!/(getValue|inOp|getArrayLength)[ ]?\(this\./.test (content) || /^namespace Tests;/m.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!/(getValue|inOp|getArrayLength)[ ]?\(this\./.test (line) || /^[ ]*(\/\/|\*|\/\*)/.test (line)) continue;
        const edits = [];
        STATE_HELPER_RE.lastIndex = 0;
        let m;
        while ((m = STATE_HELPER_RE.exec (line)) !== null) {
            const helper = m[1];
            const field = m[2];
            const open = m.index + m[0].indexOf ('(');
            const close = stateCallEnd (line, open);
            if (close === undefined) continue;
            if (edits.some ((e) => (m.index < e.end) && (close >= e.start))) continue;
            const comma = stateTopLevelComma (line, open, close);
            let text;
            if (helper === 'getArrayLength') {
                if (comma !== undefined) continue;
                const arg = line.substring (open + 1, close).trim ();
                if (arg !== 'this.' + field) continue;
                text = stateNativeCall (lines, i, helper, field, '');
            } else {
                if ((comma === undefined) || (stateTopLevelComma (line, comma, close) !== undefined)) continue;
                if (line.substring (open + 1, comma).trim () !== 'this.' + field) continue;
                const key = line.substring (comma + 1, close).trim ();
                text = stateNativeCall (lines, i, helper, field, key);
            }
            if (text !== undefined) edits.push ({ start: m.index, end: close + 1, text });
        }
        if (edits.length === 0) continue;
        let out = line;
        for (const e of edits.sort ((a, b) => b.start - a.start)) out = out.substring (0, e.start) + e.text + out.substring (e.end);
        lines[i] = out;
        changed = true;
    }
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function hxC08RuntimeStateSnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string) => `namespace ccxt;\npublic partial class t : Exchange\n{\n    public virtual object f(object key, string s, int i)\n    {\n`
        + body.split ('\n').map ((l) => '        ' + l).join ('\n') + '\n    }\n}\n';
    const cases: [string, string, string][] = [
        [ 'dict field + literal key', 'object a = getValue(this.fees, "trading");', '(this.fees != null && this.fees.ContainsKey("trading") ? this.fees["trading"] : null)' ],
        [ 'dict field + string key', 'object a = getValue(this.requiredCredentials, s);', '(this.requiredCredentials != null && s != null && this.requiredCredentials.ContainsKey(s) ? this.requiredCredentials[s] : null)' ],
        [ 'list field + literal index', 'object a = getValue(this.accounts, 0);', '(this.accounts != null && 0 < this.accounts.Count ? this.accounts[0] : null)' ],
        [ 'list field + int loop index', 'for (int n = 0; n < 3; n++)\n{\n    object a = getValue(this.accounts, n);\n}', '(this.accounts != null && n < this.accounts.Count ? this.accounts[n] : null)' ],
        [ 'list field length', 'for (int n = 0; n < getArrayLength(this.accounts); n++)\n{\n}', 'n < (this.accounts?.Count ?? 0)' ],
        [ 'dict membership', 'if (inOp(this.requiredCredentials, "BTC")) { }', 'if ((this.requiredCredentials != null && this.requiredCredentials.ContainsKey("BTC"))) { }' ],
    ];
    const keeps: [string, string][] = [
        [ 'unlisted field', 'object a = getValue(this.positions, key);' ],
        [ 'object key', 'object a = getValue(this.fees, key);' ],
        [ 'string index on a list', 'object a = getValue(this.accounts, s);' ],
        [ 'int key on a dict', 'object a = getValue(this.fees, i);' ],
    ];
    for (const [ name, body, expected ] of cases) {
        const out = hxC08NativeRuntimeStateReads (wrap (body));
        if (!out.includes (expected)) problems.push (`hxC08 ${name}: ${out.slice (-300)}`);
        if (hxC08NativeRuntimeStateReads (out) !== out) problems.push (`hxC08 ${name}: not idempotent`);
    }
    for (const [ name, body ] of keeps) {
        const out = hxC08NativeRuntimeStateReads (wrap (body));
        if (out.includes ('ContainsKey') || out.includes ('.Count ??')) problems.push (`hxC08 ${name} rewritten: ${out.slice (-300)}`);
    }
    const tests = hxC08NativeRuntimeStateReads (wrap ('object a = getValue(this.fees, "trading");').replace ('namespace ccxt;', 'namespace Tests;'));
    if (tests.includes ('ContainsKey')) problems.push ('hxC08 tests namespace rewritten');
    return problems;
}
