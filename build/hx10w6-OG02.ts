// hx10 wave-6 OG02 (Go runtime): the per-instance request id / nonce counters and the
// last request/response fields are owned by one goroutine (exchange_request_book.go).
// The printer still emits the old shape - a lock/unlock pair around a read-modify-write of
// `this.Options['requestId']`, a locked nonce compare in IncrementingNonce, a `cleanRestData`
// that assigns the last-response fields, and a direct `this.Last_http_response` read - so every
// such site is rewritten to the owner hand-off:
//   this.LockId () / this.UnlockId ()              -> dropped (the owner performs the increment)
//   var x int64 = this.Sum (this.SafeInteger (this.Options, 'k', 0), 1)  -> var x int64 = this.NextRequestId ('k')
//   var p *int64 = this.SafeInteger (this.Options, 'k', 0) + Sum (p, 1)  -> var x int64 = this.NextRequestId ('k')
//   this.Options['k'] = x                          -> dropped (the owner keeps the counter)
//   func IncrementingNonce () { ...lock pair... }  -> var result any = this.nextNonce (currentNonce)
//   this.Last_http_response = nil                  -> this.handOffRequestBook (requestBookOp{kind: requestBookReset})
//   this.Last_http_response (read)                 -> this.GetLast_http_response ()
// A span whose shape this file cannot prove is left byte for byte as the printer emitted it, so
// the site keeps its lock call and fails to compile instead of silently losing the mutual
// exclusion. Nothing here pastes a helper body.

const LOCK_LINE = /^\s*this\.LockId\(\)\s*$/;
const UNLOCK_LINE = /^\s*this\.UnlockId\(\)\s*$/;
const SEED_LINE = /^\s*var (\w+) \*int64 = this\.SafeInteger\(this\.Options, ("(?:[^"\\]|\\.)*"), 0\)\s*$/;
const DIRECT_LINE = /^\s*var (\w+) int64 = this\.Sum\(this\.SafeInteger\(this\.Options, ("(?:[^"\\]|\\.)*"), 0\), 1\)\.\(int64\)\s*$/;
const CHAINED_LINE = /^\s*var (\w+) int64 = this\.Sum\((\w+), 1\)\.\(int64\)\s*$/;
const WRITE_LINE = /^\s*this\.Options\[("(?:[^"\\]|\\.)*")\] = (\w+)\s*$/;
const HTTP_READ = /(?<![\w.])this\.Last_http_response(?![\w(])/g;
const HTTP_RESET_LINE = /^(\s*)this\.Last_http_response = nil\s*$/;
const HTTP_HEADERS_LINE = /^\s*this\.Last_(?:response|request)_headers = nil\s*$/;
const HTTP_WRITE_LINE = /^\s*this\.Last_http_response\s*=/;
// a struct-literal field keeps the owner's own read (exchange_request_book.go snapshot)
const HTTP_LITERAL_FIELD = /^\s*[A-Za-z_]\w*:\s*this\.Last_http_response,\s*$/;
const NONCE_SIGNATURE = /func \(this \*BaseExchange\) IncrementingNonce ?\(\) any \{/;
// the nonce body must still be the compare this file knows how to hand off
const NONCE_BODY = /this\.DerivedExchange\.Nonce ?\(\)[\s\S]*PanicOnError ?\([\s\S]*this\.Options\["lastNonce"\]/;

type Span = { 'decl': string, 'key': string };

// the rewrite of one lock/unlock span, or undefined when the body is not the counter shape
function og02Span (body: string[]): Span | undefined {
    const code = body.filter (line => line.trim () !== '');
    const indent = /^\s*/.exec (body[0] ?? '')?.[0] ?? '\t';
    const emit = (name: string, key: string) => indent + 'var ' + name + ' int64 = this.NextRequestId(' + key + ')';
    if (code.length === 2) {
        const direct = DIRECT_LINE.exec (code[0]);
        const write = WRITE_LINE.exec (code[1]);
        if ((direct !== null) && (write !== null) && (direct[2] === write[1]) && (direct[1] === write[2])) {
            return { 'decl': emit (direct[1], direct[2]), 'key': direct[2] };
        }
        return undefined;
    }
    if (code.length === 3) {
        const seed = SEED_LINE.exec (code[0]);
        const chained = CHAINED_LINE.exec (code[1]);
        const write = WRITE_LINE.exec (code[2]);
        if ((seed !== null) && (chained !== null) && (write !== null) && (seed[1] === chained[2]) && (seed[2] === write[1]) && (chained[1] === write[2])) {
            return { 'decl': emit (chained[1], seed[2]), 'key': seed[2] };
        }
    }
    return undefined;
}

// the index just past the brace that closes the block opened at or after `from`
function og02BodyEnd (content: string, from: number): number {
    let depth = 1; // the caller's block is already open at `from`
    let quote = '';
    for (let i = from; i < content.length; i++) {
        const c = content[i];
        if (quote !== '') {
            if (c === '\\') {
                i++;
                continue;
            }
            if (c === quote) {
                quote = '';
            }
            continue;
        }
        if ((c === '/') && (content[i + 1] === '/')) {
            const newline = content.indexOf ('\n', i);
            i = (newline < 0) ? content.length : newline;
            continue;
        }
        if ((c === '/') && (content[i + 1] === '*')) {
            const close = content.indexOf ('*/', i + 2);
            i = (close < 0) ? content.length : close + 1;
            continue;
        }
        if ((c === '"') || (c === '`') || (c === "'")) {
            quote = c;
            continue;
        }
        if (c === '{') {
            depth++;
            continue;
        }
        if (c === '}') {
            depth--;
            if (depth === 0) {
                return i + 1;
            }
        }
    }
    return -1;
}

// IncrementingNonce hands its whole compare to the owner: the counter is owner state, so the
// lock pair, the option read and the option write all go away together. A body this file does
// not recognise - or one already rewritten - is left untouched.
function replaceIncrementingNonce (content: string): string {
    const signature = NONCE_SIGNATURE.exec (content);
    if (signature === null) {
        return content;
    }
    const at = signature.index;
    const end = og02BodyEnd (content, at + signature[0].length);
    if (end < 0) {
        return content;
    }
    const body = content.substring (at, end);
    if ((body.indexOf ('LockLastNonce') < 0) || !NONCE_BODY.test (body)) {
        return content;
    }
    const replacement = signature[0] + '\n\tvar currentNonce any = this.DerivedExchange.Nonce()\n\tPanicOnError(currentNonce)\n\tvar result any = this.nextNonce(currentNonce)\n\treturn result\n}';
    return content.substring (0, at) + replacement + content.substring (end);
}

export function og02IdBookPass (content: string): string {
    const lines = replaceIncrementingNonce (content).split ('\n');
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (LOCK_LINE.test (line)) {
            let end = i + 1;
            while ((end < lines.length) && !UNLOCK_LINE.test (lines[end])) {
                end++;
            }
            const rewritten = (end < lines.length) ? og02Span (lines.slice (i + 1, end)) : undefined;
            if (rewritten !== undefined) {
                out.push (rewritten.decl);
                i = end + 1;
                continue;
            }
        }
        const reset = HTTP_RESET_LINE.exec (line);
        if (reset !== null) {
            out.push (reset[1] + 'this.handOffRequestBook(requestBookOp{kind: requestBookReset})');
            i++;
            continue;
        }
        if (HTTP_HEADERS_LINE.test (line)) {
            i++; // the reset above clears both header fields through the owner
            continue;
        }
        out.push (line);
        i++;
    }
    return rewriteLastHttpResponse (out).join ('\n');
}

// `this.Last_http_response` is the book owner's field: a generated read becomes its snapshot
function rewriteLastHttpResponse (lines: string[]): string[] {
    const out: string[] = [];
    for (const line of lines) {
        if (line.trim ().startsWith ('//') || HTTP_WRITE_LINE.test (line) || HTTP_LITERAL_FIELD.test (line)) {
            out.push (line);
            continue;
        }
        const mask = og02MaskStrings (line);
        let rebuilt = '';
        let last = 0;
        let m: RegExpExecArray | null;
        HTTP_READ.lastIndex = 0;
        while ((m = HTTP_READ.exec (line)) !== null) {
            rebuilt += line.substring (last, m.index);
            rebuilt += (mask.substr (m.index, m[0].length) === m[0]) ? 'this.GetLast_http_response()' : m[0];
            last = m.index + m[0].length;
        }
        rebuilt += line.substring (last);
        out.push (rebuilt);
    }
    return out;
}

// a masked copy of the line with the interior of every string literal blanked
function og02MaskStrings (line: string): string {
    let out = '';
    let quote = '';
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quote !== '') {
            if (c === '\\') {
                out += '__';
                i++;
                continue;
            }
            if (c === quote) {
                quote = '';
                out += c;
                continue;
            }
            out += '_';
            continue;
        }
        if ((c === '"') || (c === '`') || (c === "'")) {
            quote = c;
        }
        out += c;
    }
    return out;
}

export function og02IdBookCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10 wave-6 OG02: ' + message); } };
    const run = (body: string) => og02IdBookPass ('package ccxt\n\nfunc (this *X) RequestId() int64 {\n' + body + '}\n');
    try {
        const direct = run ('\tthis.LockId()\n\tvar requestId int64 = this.Sum(this.SafeInteger(this.Options, "requestId", 0), 1).(int64)\n\tthis.Options["requestId"] = requestId\n\tthis.UnlockId()\n\treturn requestId\n');
        ok (direct.includes ('\tvar requestId int64 = this.NextRequestId("requestId")\n'), 'a direct counter hands the increment to the owner');
        ok ((direct.indexOf ('LockId') < 0) && (direct.indexOf ('UnlockId') < 0), 'the lock pair is gone');
        ok (direct.indexOf ('this.Options["requestId"] =') < 0, 'the caller no longer writes the option');
        ok (direct.includes ('\treturn requestId\n'), 'the return keeps its operand');
        const chained = run ('\tthis.LockId()\n\tvar previous *int64 = this.SafeInteger(this.Options, "reqid", 0)\n\tvar next int64 = this.Sum(previous, 1).(int64)\n\tthis.Options["reqid"] = next\n\tthis.UnlockId()\n\treturn next\n');
        ok (chained.includes ('\tvar next int64 = this.NextRequestId("reqid")\n'), 'a seeded counter hands the increment to the owner');
        ok ((chained.indexOf ('previous') < 0) && (chained.indexOf ('LockId') < 0), 'the seed local and the lock pair are gone');
        const foreign = 'package ccxt\n\nfunc (this *X) F() any {\n\tthis.LockId()\n\tvar x int64 = this.Sum(1, 2).(int64)\n\tthis.UnlockId()\n\treturn x\n}\n';
        ok (og02IdBookPass (foreign) === foreign, 'an unproven span keeps the lock pair');
        const other = 'package ccxt\n\nfunc (this *X) F() any {\n\tthis.Options["requestId"] = ccxt.DerefScalar(requestId)\n\treturn nil\n}\n';
        ok (og02IdBookPass (other) === other, 'an unrelated option write is untouched');
        const nonce = (spaced: boolean) => {
            const call = spaced ? ' ()' : '()';
            return og02IdBookPass ('package ccxt\n\n// doc\nfunc (this *BaseExchange) IncrementingNonce() any {\n\n\tvar currentNonce any = this.DerivedExchange.Nonce' + call + '\n\tPanicOnError' + (spaced ? ' ' : '') + '(currentNonce)\n\tthis.LockLastNonce()\n\tvar lastNonce int64 = *this.SafeInteger(this.Options, "lastNonce", 0)\n\tvar result any = func' + call + ' any {\n\t\tif IsGreaterThan(currentNonce, lastNonce) {\n\t\t\treturn currentNonce\n\t\t}\n\t\treturn (lastNonce + 1)\n\t}' + call + '\n\tthis.Options["lastNonce"] = result\n\tthis.UnlockLastNonce()\n\treturn result\n}\n');
        };
        for (const spaced of [ false, true ]) {
            const out = nonce (spaced);
            ok (out.includes ('\tvar result any = this.nextNonce(currentNonce)\n'), 'the nonce compare hands off to the owner (spaced=' + spaced + ')');
            ok ((out.indexOf ('LockLastNonce') < 0) && (out.indexOf ('"lastNonce"') < 0), 'the nonce lock pair and option are gone (spaced=' + spaced + ')');
            ok (out.includes ('// doc\n'), 'the doc comment above the function is kept');
            ok (og02IdBookPass (out) === out, 'the nonce rewrite is idempotent (spaced=' + spaced + ')');
        }
        const nonceForeign = og02IdBookPass ('package ccxt\n\nfunc (this *BaseExchange) IncrementingNonce() any {\n\tthis.LockLastNonce()\n\tvar x int64 = 1\n\tthis.UnlockLastNonce()\n\treturn x\n}\n');
        ok (nonceForeign.indexOf ('LockLastNonce') >= 0, 'an unproven nonce body keeps the lock pair');
        const clean = og02IdBookPass ('package ccxt\n\nfunc (this *BaseExchange) CleanRestData() {\n\tthis.Ids = nil\n\tthis.Last_http_response = nil\n\t// this.last_json_response = undefined; // not unified prop\n\tthis.Last_response_headers = nil\n\tthis.Last_request_headers = nil\n}\n');
        ok (clean.includes ('\tthis.handOffRequestBook(requestBookOp{kind: requestBookReset})\n'), 'a clean hands the field reset to the owner');
        ok ((clean.indexOf ('this.Last_response_headers = nil') < 0) && (clean.indexOf ('this.Last_request_headers = nil') < 0), 'the header writes are gone');
        const read = 'package ccxt\n\nfunc (this *X) F() any {\n\tif (!IsEqual(this.Last_http_response, nil)) && (this.Last_http_response != "") {\n\t\treturn GetIndexOf(this.Last_http_response, "EOrder:Unknown order")\n\t}\n\treturn nil\n}\n';
        const out = og02IdBookPass (read);
        ok (out.indexOf ('this.Last_http_response') < 0, 'a field read becomes the snapshot accessor');
        ok (out.includes ('if (!IsEqual(this.GetLast_http_response(), nil)) && (this.GetLast_http_response() != "") {'), 'every read on the line is rewritten');
        ok (out.includes ('GetIndexOf(this.GetLast_http_response(), "EOrder:Unknown order")'), 'a read inside a call is rewritten');
        const snapshotField = 'package ccxt\n\ntype s struct {\n\thttp any\n}\n\nfunc (b *B) F() s {\n\treturn s{\n\t\thttp: this.Last_http_response,\n\t}\n}\n';
        ok (og02IdBookPass (snapshotField) === snapshotField, 'the owner keeps its own struct-literal read');
        const literal = 'package ccxt\n\nfunc (this *X) F() string {\n\treturn "this.Last_http_response"\n}\n';
        ok (og02IdBookPass (literal) === literal, 'a string literal keeps its text');
        ok (og02IdBookPass (direct) === direct, 'idempotent');
    } catch (e: any) {
        problems.push ('hx10 wave-6 OG02 threw: ' + e.message);
    }
    return problems;
}
