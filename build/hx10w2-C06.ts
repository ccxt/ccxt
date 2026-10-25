// hx10 wave 2 unit C06 (cs): the string-helper family printed from a proven receiver type.
// parseJson(x) is a one-line identity wrapper over JsonHelper.Deserialize((string)x), and getIndexOf(x, t)
// answers -1 for a null receiver, ((string)x).IndexOf((string)t) for a string one. Both print natively only
// where the C# declaration proves a string box; every other shape keeps the plain helper call.

// cs/ccxt/base/Exchange.Options.cs: `public string <member> { get; set; }`
const C06_STRING_MEMBERS = [ 'apiKey', 'secret', 'password', 'uid', 'accountId', 'login', 'privateKey', 'walletAddress' ];

const C06_DECL_TYPE = /^(?:object|var|string\??|Int64\??|double\??|bool\??|int\??|long\??|decimal\??|[A-Z][\w.]*(?:<.*>)?(?:\[\])?\??)$/;

// structure-only view of a line: string literal contents and comments become spaces (quotes kept)
function c06_mask (line: string): string {
    const out: string[] = [];
    let i = 0;
    while (i < line.length) {
        const c = line[i];
        if ((c === '/') && (line[i + 1] === '/')) {
            out.push (' '.repeat (line.length - i));
            break;
        }
        if ((c === '/') && (line[i + 1] === '*')) {
            const end = line.indexOf ('*/', i + 2);
            const stop = (end === -1) ? line.length : end + 2;
            out.push (' '.repeat (stop - i));
            i = stop;
            continue;
        }
        if (c === '"') {
            let j = i + 1;
            while (j < line.length) {
                if (line[j] === '\\') { j += 2; continue; }
                if (line[j] === '"') { j += 1; break; }
                j += 1;
            }
            out.push ('"' + ' '.repeat (Math.max (0, j - i - 2)) + ((j - i >= 2) ? '"' : ''));
            i = j;
            continue;
        }
        out.push (c);
        i += 1;
    }
    return out.join ('');
}

function c06_close (masked: string, open: number): number | undefined {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        if (masked[i] === '(') depth += 1;
        else if (masked[i] === ')') {
            depth -= 1;
            if (depth === 0) return i;
        }
    }
    return undefined;
}

// declared types of every `<type> <name> = ...` / `<type> <name>;` line before `limit`
function c06_decl_types (masked: string[], name: string, limit: number): string[] {
    const pattern = new RegExp ('^[ \\t]*([\\w.<>?, ]+?)[ \\t]+' + name + '[ \\t]*(?:=|;)', '');
    const types: string[] = [];
    for (let i = 0; i < limit; i++) {
        const m = pattern.exec (masked[i]);
        if (m === null) continue;
        const type = m[1].trim ();
        if (C06_DECL_TYPE.test (type)) types.push (type);
    }
    return types;
}

function c06_is_str (type: string): boolean {
    return (type === 'string') || (type === 'string?');
}

function c06_is_member (name: string): boolean {
    return C06_STRING_MEMBERS.indexOf (name) !== -1;
}

// `parseJson(<local>)` -> `JsonHelper.Deserialize(<local>)` when every declaration of the local is a string
function c06_parse_json (lines: string[], masked: string[]): boolean {
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        if (!/(?<![\w.])parseJson\(/.test (masked[i])) continue;
        let out = lines[i];
        let mask = masked[i];
        let at = mask.search (/(?<![\w.])parseJson\(/);
        while (at !== -1) {
            const open = at + 'parseJson('.length - 1;
            const close = c06_close (mask, open);
            if (close === undefined) break;
            const argument = mask.substring (open + 1, close).trim ();
            const types = /^[A-Za-z_]\w*$/.test (argument) ? c06_decl_types (masked, argument, i) : [];
            if ((types.length === 0) || !types.every (c06_is_str)) { at = mask.indexOf ('parseJson(', at + 1); continue; }
            const native = 'JsonHelper.Deserialize(' + out.substring (open + 1, close).trim () + ')';
            out = out.substring (0, at) + native + out.substring (close + 1);
            mask = c06_mask (out);
            changed = true;
            at = mask.indexOf ('parseJson(', at + native.length);
        }
        if (out !== lines[i]) {
            lines[i] = out;
            masked[i] = c06_mask (out);
        }
    }
    return changed;
}

// every read of a `string?`-retyped local must be box-neutral (see the header): false when a use could
// re-resolve an overload, unbox, or read a member off the null
function c06_uses_ok (masked: string[], name: string): boolean {
    const pattern = new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g');
    let found = 0;
    for (let i = 0; i < masked.length; i++) {
        const line = masked[i];
        let m;
        while ((m = pattern.exec (line)) !== null) {
            found += 1;
            const start = m.index;
            const end = start + name.length;
            let before = start - 1;
            while ((before >= 0) && (line[before] === ' ')) before -= 1;
            let after = end;
            while ((after < line.length) && (line[after] === ' ')) after += 1;
            const pre = (before >= 0) ? line.substring (0, before + 1) : '';
            const post = (after < line.length) ? line[after] : '';
            // the `object <name> = this.<member>;` declaration itself
            if (/^[ \t]*object$/.test (pre) && ((post === '=') || (post === ';'))) continue;
            // `((string)<name>)`: the identity unbox the helper's own body spells
            if (/\(\s*\(\s*string\)$/.test (pre)) continue;
            if (post === '=') {
                // a write: only a string-producing RHS keeps the box a string
                const rest = line.substring (after).replace (/^=\s*/, '');
                if (/^\(?\s*"/.test (rest)) continue;
                return false;
            }
            if ((post === '!') || (post === '=')) continue; // == / != null tests
            if ((post === ';') || (post === ')') || (post === ',') || (post === '}')) {
                // value position: everything but the left operand of add
                if (/(?<![\w.])add\(\s*$/.test (pre)) return false;
                continue;
            }
            return false;
        }
    }
    return found > 0;
}

// `object x = this.apiKey;` copied from a `public string` property, read only as a getIndexOf receiver
function c06_member_copy (lines: string[], masked: string[]): boolean {
    let changed = false;
    const declaration = /^([ \t]*)object ([A-Za-z_]\w*) = this\.([A-Za-z_]\w*);[ \t]*$/;
    const joined = masked.join ('\n');
    for (let i = 0; i < lines.length; i++) {
        const m = declaration.exec (masked[i]);
        if (m === null) continue;
        const name = m[2];
        if (!c06_is_member (m[3])) continue;
        const escaped = name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
        const copies = masked.filter ((line) => new RegExp ('^[ \\t]*object ' + escaped + ' = this\\.').test (line)).length;
        if (copies !== 1) continue;
        if (!new RegExp ('(?<![\\w.])getIndexOf\\(\\s*' + escaped + '\\s*,').test (joined)) continue;
        if (!c06_uses_ok (masked, name)) continue;
        let rewritten = 0;
        for (let j = 0; j < masked.length; j++) {
            const line = masked[j];
            const finder = new RegExp ('(?<![\\w.])getIndexOf\\(\\s*' + escaped + '\\s*,');
            if (!finder.test (line)) continue;
            const at = line.search (finder);
            const open = line.indexOf ('(', at);
            const close = c06_close (line, open);
            if (close === undefined) continue;
            const comma = line.indexOf (',', open);
            if ((comma === -1) || (comma > close)) continue;
            const needle = lines[j].substring (comma + 1, close).trim ();
            if (!/^"(?:[^"\\]|\\.)*"$/.test (needle)) continue;
            const native = '(' + name + '?.IndexOf(' + needle + ', StringComparison.Ordinal) ?? -1)';
            lines[j] = lines[j].substring (0, at) + native + lines[j].substring (close + 1);
            masked[j] = c06_mask (lines[j]);
            rewritten += 1;
        }
        if (rewritten === 0) continue;
        lines[i] = m[1] + 'string? ' + name + ' = this.' + m[3] + ';';
        masked[i] = c06_mask (lines[i]);
        changed = true;
    }
    return changed;
}

// final pass only; the tests namespace is untouched (the base-only self-tests print there)
export function c06_apply (finalPass: boolean, content: string): string {
    if (!finalPass || /^namespace Tests\b/m.test (content)) {
        return content;
    }
    if (!/(?<![\w.])(?:parseJson|getIndexOf)\(/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (c06_mask);
    let changed = c06_parse_json (lines, masked);
    changed = c06_member_copy (lines, masked) || changed;
    return changed ? lines.join ('\n') : content;
}

// snippet checks (run from `csharpTranspiler.ts --self-test`)
export function hx10C06SnippetChecks (): string[] {
    const problems: string[] = [];
    const wrap = (body: string, ns = 'ccxt') => `namespace ${ns};\npublic partial class t : Exchange\n{\n    public virtual object f(object o, object messageHash, object feeDetail)\n    {\n${body}\n    }\n}\n`;
    const positives: [string, string, string][] = [
        [ 'member copy receiver', '        object apiKey = this.apiKey;\n        if (getIndexOf(apiKey, "ed25519:") < 0) { }',
            '        string? apiKey = this.apiKey;\n        if ((apiKey?.IndexOf("ed25519:", StringComparison.Ordinal) ?? -1) < 0) { }' ],
        [ 'parseJson on a string? local', '        string? line = this.safeString(o, "y");\n        object parsed = parseJson(line);',
            '        string? line = this.safeString(o, "y");\n        object parsed = JsonHelper.Deserialize(line);' ],
        [ 'parseJson on a string local', '        string inner = this.safeString(o, "y").Trim();\n        object parsed = parseJson(inner);',
            '        string inner = this.safeString(o, "y").Trim();\n        object parsed = JsonHelper.Deserialize(inner);' ],
    ];
    for (const [ name, body, expected ] of positives) {
        const out = c06_apply (true, wrap (body));
        if (!out.includes (expected)) problems.push ('hx10 C06 ' + name + ': ' + out.slice (-300));
        if (c06_apply (true, out) !== out) problems.push ('hx10 C06 ' + name + ': not idempotent');
    }
    const keeps = [
        '        object messageHash = getValue(messageHashes, i);\n        if (getIndexOf(messageHash, "ticker") >= 0) { }',
        '        object feeDetail = this.safeValue(o, "f");\n        object parsed = parseJson(feeDetail);',
        '        if (getIndexOf(messageHash, "ticker") >= 0) { }',
        '        object secret = this.secret;\n        if (getIndexOf(secret, "ed25519:") >= 0) { }\n        secret = (parts != null && 1 < parts.Count ? parts[1] : null);',
        '        object apiKey = this.apiKey;\n        if (getIndexOf(apiKey, "ed25519:") < 0) { }\n        string payload = add(apiKey, "x");',
        '        string? line = "{}";\n        object parsed = this.parseJson(line);',
        '        // parseJson(line)',
    ];
    for (const body of keeps) {
        const out = c06_apply (true, wrap (body));
        if (out !== wrap (body)) problems.push ('hx10 C06 keeps ' + body);
        if (/(?<![a-zA-Z])IndexOf\(|JsonHelper\.Deserialize/.test (out)) problems.push ('hx10 C06 emitted on ' + body);
    }
    if (c06_apply (false, wrap ('        object parsed = parseJson(line);')) !== wrap ('        object parsed = parseJson(line);')) problems.push ('hx10 C06 fired in a non-final pass');
    if (c06_apply (true, wrap ('        object parsed = parseJson(line);', 'Tests')) !== wrap ('        object parsed = parseJson(line);', 'Tests')) problems.push ('hx10 C06 tests namespace changed');
    return problems;
}
