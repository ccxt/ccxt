// ===== hx10w10 GP26: GetValue on a declared map local reads the map =====
// `GetValue(m, k)` is `derefScalar(getValue(m, k))`. When the receiver's Go declaration is a
// plain `map[string]any` and the key is a Go string, `m[k]` is the same read one helper call
// shorter: an absent key and a nil map both answer the untyped nil GetValue answers. The pass
// only fires where the map cannot have received a typed pointer value (that deref is the one
// thing the index would drop): every write of the local stores a pointer-free value, or the
// local is never written at all. A compared element keeps the helper (a `*bool`/`*string`
// element would make the native `==` false), as does a non-string key and every non-local
// receiver.

const GP26_MAP = 'map[string]any';

// a value the runtime helpers store as-is: never a Go pointer
const GP26_PLAIN = /^(?:nil|true|false|-?\d+(?:\.\d+)?|"[^"\n]*"|map\[string\]any\{|\[\](?:any|string)\{)$/;

// Go string/rune literal and comment text blanked, every offset and newline kept
function gp26Mask (content: string): string {
    const out = content.split ('');
    let i = 0;
    const n = content.length;
    while (i < n) {
        const c = content[i];
        if ((c === '"') || (c === '`') || (c === "'")) {
            const quote = c;
            i++;
            while ((i < n) && (content[i] !== quote)) {
                if ((content[i] === '\\') && (quote !== '`')) {
                    out[i] = ' ';
                    i++;
                }
                if ((i < n) && (content[i] !== '\n')) {
                    out[i] = ' ';
                }
                i++;
            }
            i++;
        } else if ((c === '/') && (content[i + 1] === '/')) {
            while ((i < n) && (content[i] !== '\n')) {
                out[i] = ' ';
                i++;
            }
        } else {
            i++;
        }
    }
    return out.join ('');
}

interface Gp26Span { start: number; end: number; }

function gp26FuncSpans (lines: string[]): Gp26Span[] {
    const spans: Gp26Span[] = [];
    let open = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            open = k;
        } else if ((open >= 0) && (lines[k] === '}')) {
            spans.push ({ start: open, end: k });
            open = -1;
        }
    }
    return spans;
}

// brace depth at the start of every line, and the lowest depth any line reaches inside itself
function gp26Depths (masked: string[]): { start: number[]; low: number[] } {
    const start: number[] = [];
    const low: number[] = [];
    let depth = 0;
    for (const line of masked) {
        start.push (depth);
        let inner = depth;
        for (const ch of line) {
            if (ch === '{') {
                depth++;
            } else if (ch === '}') {
                depth--;
                inner = Math.min (inner, depth);
            }
        }
        low.push (inner);
    }
    return { start, low };
}

// the declaring block is still open at the read: no line between them closes it
function gp26Visible (decl: Gp26Decl, at: number, depths: { start: number[], low: number[] }): boolean {
    const level = depths.start[decl.index];
    if (depths.start[at] < level) {
        return false;
    }
    for (let k = decl.index + 1; k < at; k++) {
        if (depths.low[k] < level) {
            return false;
        }
    }
    return true;
}

interface Gp26Decl { index: number; type: string; init: string; }

const GP26_VAR = /^\s*var ([A-Za-z_]\w*) ([\w\[\]\*\.]+) = (.*)$/;
const GP26_SHORT = /^\s*([A-Za-z_]\w*) := (.*)$/;

function gp26Escape (name: string): string {
    return name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// the local a read at `at` binds to: the nearest earlier declaration in the function, or
// undefined when a short declaration of the same name sits between it and the read
function gp26DeclOf (lines: string[], start: number, at: number, name: string): Gp26Decl | undefined {
    const n = gp26Escape (name);
    const shadow = new RegExp ('(?<![\\w.])' + n + '\\s*:=');
    let decl: Gp26Decl | undefined = undefined;
    for (let k = at - 1; k > start; k--) {
        const v = GP26_VAR.exec (lines[k]);
        if ((v !== null) && !decl && (v[1] === name)) {
            decl = { index: k, type: v[2], init: v[3] };
        }
        const s = GP26_SHORT.exec (lines[k]);
        if ((s !== null) && (s[1] === name)) {
            return undefined;
        }
        if (shadow.test (lines[k]) && !(v !== null && v[1] === name)) {
            return undefined;
        }
    }
    return decl;
}

// every write of the local stores a pointer-free value: an element write or an
// AddElementToObject whose value is a literal / empty container, and no rebinding at all
function gp26WritesArePlain (body: string, name: string): boolean {
    const n = gp26Escape (name);
    if (new RegExp ('(?<![\\w.])' + n + '\\s*=(?!=)|&\\s*' + n + '\\b|\\bdelete\\(\\s*' + n + '\\b|(?<![\\w.])' + n + '\\s*,[^=\\n]*=(?!=)').test (body)) {
        return false;
    }
    const added = new RegExp ('\\bAddElementToObject\\(\\s*' + n + '\\s*,[^,\\n]*,\\s*(.+)$', 'gm');
    for (const m of body.matchAll (added)) {
        if (!GP26_PLAIN.test (m[1].trim ())) {
            return false;
        }
    }
    const written = new RegExp ('(?<![\\w.])' + n + '\\s*\\[[^\\]]*\\]\\s*=(?!=)\\s*(.+)$', 'gm');
    for (const m of body.matchAll (written)) {
        if (!GP26_PLAIN.test (m[1].trim ())) {
            return false;
        }
    }
    return true;
}

// `GetValue(m, k)` / `ccxt.GetValue(m, k)` with an identifier receiver and a plain key
const GP26_READ = /(?<![\w.])(?:ccxt\.)?GetValue\(\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*|"[^"\n]*")\s*\)/g;
const GP26_READ_ONE = new RegExp ('^' + GP26_READ.source.replace (/\/g$/, ''));
const GP26_KEY_TYPE = /^\s*([A-Za-z_]\w*) string\s*$/;

export function hx10w10Gp26TypedReads (content: string): string {
    if (!content.includes ('GetValue(') || !content.includes (GP26_MAP)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = gp26Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    const depths = gp26Depths (masked);
    for (const span of gp26FuncSpans (lines)) {
        const body = masked.slice (span.start, span.end + 1).join ('\n');
        for (let k = span.start + 1; k < span.end; k++) {
            if (!lines[k].includes ('GetValue(')) {
                continue;
            }
            for (const match of [ ...masked[k].matchAll (GP26_READ) ].reverse ()) {
                const at = match.index!;
                // the key text comes from the real line: the masked copy has its literal blanked
                const parsed = GP26_READ_ONE.exec (lines[k].substring (at, at + match[0].length));
                if (parsed === null) {
                    continue;
                }
                const receiver = parsed[1];
                const key = parsed[2];
                const decl = gp26DeclOf (lines, span.start, k, receiver);
                if ((decl === undefined) || (decl.type !== GP26_MAP) || (decl.index >= k)) {
                    continue;
                }
                if (!gp26Visible (decl, k, depths)) {
                    continue;
                }
                if (!gp26WritesArePlain (body, receiver)) {
                    continue;
                }
                const keyDecl = gp26DeclOf (lines, span.start, k, key);
                const keyIsString = key.startsWith ('"') || ((keyDecl !== undefined) ? (keyDecl.type === 'string')
                    : GP26_KEY_TYPE.test (lines[span.start].split (',').find ((p) => p.trim ().startsWith (key + ' ')) ?? ''));
                if (!keyIsString) {
                    continue;
                }
                const before = masked[k].substring (0, at).replace (/\s+$/, '');
                const after = masked[k].substring (at + match[0].length).replace (/^\s+/, '');
                if (/^(?:===?|!==?)/.test (after) || /(?:===?|!==?)$/.test (before)) {
                    continue; // the deref is observable in a native comparison
                }
                lines[k] = lines[k].substring (0, at) + receiver + '[' + key + ']' + lines[k].substring (at + match[0].length);
                masked[k] = masked[k].substring (0, at) + receiver + '[' + key + ']' + masked[k].substring (at + match[0].length);
            }
        }
    }
    return lines.join ('\n');
}

export function hx10w10Gp26Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, label: string) => {
        if (!condition) {
            problems.push ('hx10w10 GP26: ' + label);
        }
    };
    const run = (body: string) => hx10w10Gp26TypedReads ('package ccxt\n\n// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:\n\nfunc (this *X) F(o ...any) any {\n' + body + '\treturn nil\n}\n');
    ok (run ('\tvar config map[string]any = GetArgMap(o, 0, map[string]any{})\n\treturn GetValue(config, "noCoin")\n').includes ('return config["noCoin"]'), 'an unwritten map local reads natively');
    ok (run ('\tvar balances map[string]any = map[string]any{}\n\tbalances["a"] = map[string]any{}\n\treturn GetValue(balances, "a")\n').includes ('return balances["a"]'), 'a plain-literal map write keeps the read native');
    ok (run ('\tvar balances map[string]any = map[string]any{}\n\tAddElementToObject(balances, "a", SafeStringPtr(this.SafeString(o, "a")))\n\treturn GetValue(balances, "a")\n').includes ('GetValue(balances, "a")'), 'a boxed map value keeps the helper');
    ok (run ('\tvar balances map[string]any = map[string]any{}\n\tbalances = this.SafeDict(o, "b")\n\treturn GetValue(balances, "a")\n').includes ('GetValue(balances, "a")'), 'a rebinding keeps the helper');
    ok (run ('\tvar config map[string]any = GetArgMap(o, 0, nil)\n\tif GetValue(config, "a") == true {\n\t\treturn true\n\t}\n').includes ('GetValue(config, "a")'), 'a compared element keeps the helper');
    ok (run ('\tvar config map[string]any = GetArgMap(o, 0, nil)\n\tvar k any = nil\n\treturn GetValue(config, k)\n').includes ('GetValue(config, k)'), 'an untyped key keeps the helper');
    ok (run ('\tvar config map[string]any = GetArgMap(o, 0, nil)\n\tvar k *string = this.SafeString(o, "k")\n\treturn GetValue(config, k)\n').includes ('GetValue(config, k)'), 'a pointer key keeps the helper');
    ok (run ('\tvar values []any = []any{}\n\treturn GetValue(values, 0)\n').includes ('GetValue(values, 0)'), 'a list receiver keeps the helper');
    ok (run ('\tvar config any = GetArgMap(o, 0, nil)\n\treturn GetValue(config, "a")\n').includes ('GetValue(config, "a")'), 'an untyped declaration keeps the helper');
    ok (run ('\tif true {\n\t\tvar config map[string]any = GetArgMap(o, 0, nil)\n\t\t_ = config\n\t}\n\treturn GetValue(config, "a")\n').includes ('GetValue(config, "a")'), 'a read outside the declaring block keeps the helper');
    ok (hx10w10Gp26TypedReads ('func (this *X) F(m map[string]any) any {\n\treturn GetValue(m, "a")\n}\n').includes ('GetValue(m, "a")'), 'a parameter receiver keeps the helper');
    ok (run ('\tvar params map[string]any = GetArgMap(o, 0, nil)\n\tvar key string = "a"\n\treturn GetValue(params, key)\n').includes ('return params[key]'), 'a string-typed key reads natively');
    return problems;
}
