// hx10 wave9 GB10: `this.Balance` is a plain map[string]any, so a store of a value derefScalar leaves
// alone is the native map write when the file keeps the field non-nil. A boxed value (`any`), a
// `*int64`/`*string` pointer and the boxed keys the helper unboxes stay on AddElementToObject, and an
// entry store (`this.Balance[k1][k2] = v`) stays too: the element is `any`, so Go cannot index it.

const GB10_FIELD = 'this.Balance';
// whole-field writes that leave a fresh non-nil map behind (Extend/DeepExtend build one); SafeBalance
// hands the field's own map back, so the induction holds from the constructor's literal
const GB10_NEVER_NIL_WRITE = /^(?:ccxt\.)?(?:map\[string\]any\{|this\.(?:Extend|DeepExtend|CreateSafeDictionary)\(|this\.wsBalanceMap\()/;
const GB10_SELF_WRITE = /^this\.SafeBalance\(this\.Balance\)$/;
// bodies that hand their Balance work to the dispatch loop (hx10w4 OG01 / hx10w6 G01 own them)
const GB10_USER_PATH = /^(?:(?:watch|fetch|seed)\w*Body|loadBalanceSnapshotBody|SetBalanceCache|CleanWsData)$/;
const GB10_SPAWNED = /\bgo\s+\w|\bSpawn\(|\bDelay\(|^(?![^\n]*<-)[^\n]*\w+Async\(/m;
const GB10_SCALARS = [ 'string', 'int64', 'float64', 'bool' ];
const GB10_CONTAINERS = [ 'map[string]any', '[]any', '[]string' ];
const GB10_NEVER_NIL_INIT = /^(?:ccxt\.)?(?:map\[string\]any\{|\[\](?:string|any)\{|this\.(?:Extend|DeepExtend|IndexBy|CreateSafeDictionary|PruneStaleBalanceKeys)\()/;

// blanks every string/char literal and comment so a call inside one is never rewritten
function gb10Mask (text: string): string {
    const out = text.split ('');
    let i = 0;
    while (i < text.length) {
        const c = text[i];
        let end = -1;
        if ((c === '/') && (text[i + 1] === '/')) {
            end = text.indexOf ('\n', i);
            end = (end < 0) ? text.length : end;
        } else if ((c === '/') && (text[i + 1] === '*')) {
            end = text.indexOf ('*/', i + 2);
            end = (end < 0) ? text.length : end + 2;
        } else if ((c === '"') || (c === '`') || (c === "'")) {
            end = i + 1;
            while ((end < text.length) && (text[end] !== c)) {
                end += (text[end] === '\\') ? 2 : 1;
            }
            end = Math.min (end + 1, text.length);
        }
        if (end < 0) {
            i++;
            continue;
        }
        for (let k = i; k < end; k++) {
            if (out[k] !== '\n') {
                out[k] = ' ';
            }
        }
        i = end;
    }
    return out.join ('');
}

// every whole-field write in the file leaves a fresh non-nil map: the field is never nil
function gb10FieldNeverNil (masked: string): boolean {
    const writes = [ ...masked.matchAll (/(?<![\w.])this\.Balance\s*=(?!=)\s*([^\n]*)/g) ];
    return writes.every ((w) => GB10_NEVER_NIL_WRITE.test (w[1].trim ()) || GB10_SELF_WRITE.test (w[1].trim ()));
}

// a declared name of the enclosing function: its type and its init text (empty for a parameter)
function gb10Decl (body: string, name: string): { 'type': string, 'init': string } | undefined {
    const head = body.substring (0, (body.indexOf ('\n') < 0) ? body.length : body.indexOf ('\n'));
    const param = new RegExp ('(?:^|[(,]\\s*)' + name + '\\s+([^,)]+)').exec (head);
    if (param !== null) {
        return { 'type': param[1].trim (), 'init': '' };
    }
    const variable = new RegExp ('^[ \\t]*var ' + name + ' ([^=\\n]+?) = ([^\\n]*)$', 'm').exec (body);
    if (variable !== null) {
        return { 'type': variable[1].trim (), 'init': variable[2].trim () };
    }
    return undefined;
}

// a value derefScalar leaves unchanged: a plain scalar, a never-nil container producer, or a
// container parameter (the ws frame the handler was handed)
function gb10PlainValue (body: string, value: string): boolean {
    const text = value.trim ();
    if (text.startsWith ('"') || /^-?\d+(?:\.\d+)?$/.test (text) || (text === 'true') || (text === 'false')) {
        return true;
    }
    if (/^(?:ccxt\.)?map\[string\]any\{/.test (text) || /^this\.(?:Extend|DeepExtend|IndexBy|CreateSafeDictionary)\(/.test (text)) {
        return true;
    }
    // date/time strings: a plain Go string
    if (/^this\.(?:Iso8601|Milliseconds|Seconds|Microseconds)\(/.test (text)) {
        return true;
    }
    if (!/^\w+$/.test (text)) {
        return false;
    }
    const decl = gb10Decl (body, text);
    if (decl === undefined) {
        return false;
    }
    if (GB10_SCALARS.indexOf (decl.type) >= 0) {
        return true;
    }
    if (GB10_CONTAINERS.indexOf (decl.type) < 0) {
        return false;
    }
    // a container local needs a never-nil init; a container parameter is the caller's frame
    return (decl.init === '') || GB10_NEVER_NIL_INIT.test (decl.init);
}

// the key as Go prints it: a string literal, a `string`, or a `*string` from SafeString with a literal
// default (which never answers nil)
function gb10StringKey (body: string, key: string): boolean {
    if (key.startsWith ('"')) {
        return true;
    }
    if (!/^\w+$/.test (key)) {
        return false;
    }
    const decl = gb10Decl (body, key);
    if (decl === undefined) {
        return false;
    }
    return (decl.type === 'string') || ((decl.type === '*string') && /this\.SafeString\w*\(.*, "[^"]*"\)$/.test (decl.init));
}

/**
 * `AddElementToObject(this.Balance, k, v)` / `AddElementToObject(this.Balance[k1], k2, v)` -> the
 * native map write when the key and the value are plain and the receiver map is proven non-nil.
 */
export function hx10w9GB10BalanceWrites (content: string): string {
    const maskedAll = gb10Mask (content);
    if ((content.indexOf (GB10_FIELD) < 0) || !gb10FieldNeverNil (maskedAll)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = maskedAll.split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    let body = '';
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            let end = k;
            while ((end < lines.length) && (lines[end] !== '}')) {
                end++;
            }
            body = masked.slice (k, end + 1).join ('\n');
            const name = /^func \([^)]*\) (\w+)\s*\(/.exec (masked[k]);
            start = ((name !== null) && !GB10_USER_PATH.test (name[1]) && !GB10_SPAWNED.test (body)) ? k : -1;
            continue;
        }
        if (lines[k] === '}') {
            start = -1;
            continue;
        }
        if ((start < 0) || (masked[k].indexOf ('AddElementToObject') < 0)) {
            continue;
        }
        const head = /^(\s*)(?:ccxt\.)?AddElementToObject\((this\.Balance), /.exec (lines[k]);
        if (head === null) {
            continue;
        }
        const receiver = head[2];
        const open = masked[k].indexOf ('(');
        const close = gb10GroupEnd (masked[k], open);
        if ((close < 0) || (masked[k].substring (close).trim () !== '')) {
            continue; // the whole statement has to be the call
        }
        const args = gb10Split (lines[k], open, close - 1);  // close - 1 is the closing paren
        if ((args === undefined) || (args.length !== 3)) {
            continue;
        }
        const key = args[1].trim ();
        const value = args[2].trim ();
        if (!gb10StringKey (body, key) || !gb10PlainValue (body, value)) {
            continue;
        }
        lines[k] = head[1] + receiver + '[' + key + '] = ' + value;
        masked[k] = gb10Mask (lines[k]);
    }
    return lines.join ('\n');
}

// end index (exclusive) of the balanced group opening at text[open], or -1
function gb10GroupEnd (text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        depth += ('([{'.indexOf (c) >= 0) ? 1 : ((')]}'.indexOf (c) >= 0) ? -1 : 0);
        if (depth === 0) {
            return i + 1;
        }
    }
    return -1;
}

// top-level comma split of the original call's arguments, `close` being the closing paren
function gb10Split (line: string, open: number, close: number): string[] | undefined {
    const out: string[] = [];
    let depth = 0;
    let from = open + 1;
    for (let i = open + 1; i <= close; i++) {
        const c = line[i];
        if ((i === close) || ((c === ',') && (depth === 0))) {
            out.push (line.substring (from, (i === close) ? i : i));
            if (i === close) {
                break;
            }
            from = i + 1;
            continue;
        }
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            depth--;
        }
    }
    return (out.length >= 2) ? out : undefined;
}

// ---- self-test: the native write and every keep-helper gate ----------------------------------
export function hx10w9GB10Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 w9 GB10: ' + message); } };
    const file = (body: string, extra = '') => 'package ccxt\n\n' + extra + 'func (this *X) HandleBalance(message map[string]any) {\n' + body + '}\n';
    const run = (body: string, extra = '') => hx10w9GB10BalanceWrites (file (body, extra));
    try {
        const iso = run ('\tvar timestamp *int64 = this.SafeInteger(message, "E")\n\tccxt.AddElementToObject(this.Balance, "datetime", this.Iso8601(timestamp))\n');
        ok (iso.includes ('\tthis.Balance["datetime"] = this.Iso8601(timestamp)'), 'a plain string value writes natively: ' + iso);
        const frame = run ('\tccxt.AddElementToObject(this.Balance, "info", message)\n');
        ok (frame.includes ('\tthis.Balance["info"] = message'), 'a frame parameter writes natively: ' + frame);
        const stringKey = run ('\tvar accountType string = "spot"\n\tccxt.AddElementToObject(this.Balance, accountType, message)\n');
        ok (stringKey.includes ('this.Balance[accountType] = message'), 'a string local key writes natively: ' + stringKey);
        const noPrefix = run ('\tccxt.AddElementToObject(this.Balance, "info", message)\n');
        ok (!noPrefix.includes ('ccxt.AddElementToObject'), 'the call prefix goes with the call: ' + noPrefix);
        for (const [ name, src ] of [
            [ 'pointer value', '\tvar timestamp *int64 = this.SafeInteger(message, "E")\n\tccxt.AddElementToObject(this.Balance, "timestamp", timestamp)\n' ],
            [ 'boxed value', '\tvar data any = this.SafeDict(message, "d")\n\tccxt.AddElementToObject(this.Balance, "info", data)\n' ],
            [ 'nil container value', '\tvar info map[string]any = nil\n\tccxt.AddElementToObject(this.Balance, "info", info)\n' ],
            [ '*string key without a default', '\tvar code *string = this.SafeCurrencyCode(message)\n\tccxt.AddElementToObject(this.Balance, code, map[string]any{})\n' ],
            [ 'boxed key', '\tvar account any = this.Account()\n\tccxt.AddElementToObject(this.Balance, account, map[string]any{})\n' ],
            [ 'entry store (element is any)', '\tvar typeVar string = "unified"\n\tvar timestamp *int64 = this.SafeInteger(message, "E")\n\tccxt.AddElementToObject(this.Balance[typeVar], "datetime", this.Iso8601(timestamp))\n' ],
            [ 'partial statement', '\tccxt.AddElementToObject(this.Balance, "info", message) + 1\n' ],
        ] as Array<[ string, string ]>) {
            ok (run (src).includes ('AddElementToObject('), 'keeps the helper: ' + name);
        }
        const userPath = 'package ccxt\n\nfunc (this *X) watchBalanceBody(ch chan any, message map[string]any) {\n\tccxt.AddElementToObject(this.Balance, "info", message)\n}\n';
        ok (hx10w9GB10BalanceWrites (userPath).includes ('AddElementToObject('), 'keeps the helper: user-path body');
        const boxedField = 'package ccxt\n\nfunc (this *X) G(p any) {\n\tthis.Balance = p\n}\nfunc (this *X) H(message map[string]any) {\n\tccxt.AddElementToObject(this.Balance, "info", message)\n}\n';
        ok (hx10w9GB10BalanceWrites (boxedField).includes ('AddElementToObject('), 'keeps the helper: a boxed whole-field write');
        const once = run ('\tccxt.AddElementToObject(this.Balance, "info", message)\n');
        ok (hx10w9GB10BalanceWrites (once) === once, 'idempotent');
    } catch (e) {
        problems.push ('hx10 w9 GB10 threw: ' + (e as Error).message);
    }
    return problems;
}

// the pass has to run inside formatGoSource, not only in its own self-test
export function hx10w9GB10Wired (formatGoSource: (path: string, content: string) => string): string[] {
    const src = 'package ccxt\n\nfunc (this *X) G() {\n\tthis.Balance = map[string]any{}\n}\nfunc (this *X) HandleBalance(message map[string]any) {\n\tccxt.AddElementToObject(this.Balance, "info", message)\n}\n';
    const out = formatGoSource ('selftest.go', src);
    return out.includes ('this.Balance["info"] = message') ? [] : [ 'hx10 w9 GB10: not wired into formatGoSource: ' + out ];
}
