// hx10 wave 7 J12: a closure whose whole body throws can only complete its future
// exceptionally, so the native completion API replaces it: no lambda, no helper, no cast.
// Everything else in the lambda/switch census stays a blob - the operand type is unproven here.

function j12Mask (s: string): string {
    const out = s.split ('');
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '"' || c === '\'') {
            let j = i + 1;
            while (j < s.length && s[j] !== c) {
                if (s[j] === '\\') { j++; }
                j++;
            }
            const end = Math.min (j, s.length - 1);
            for (let k = i; k <= end; k++) { out[k] = ' '; }
            i = end;
        }
    }
    return out.join ('');
}

function j12Close (m: string, open: number, o: string, c: string): number {
    let d = 0;
    for (let k = open; k < m.length; k++) {
        if (m[k] === o) { d++; } else if (m[k] === c) { d--; if (d === 0) { return k; } }
    }
    return -1;
}

// `throw new X(args) ;` -> `new X(args)`; anything else (statements, nesting) is not a pure throw.
// The shape is checked on the masked text and the value is cut from the raw text: masking keeps
// every offset, so parens and semicolons inside the message literal cannot fool the scanner.
function j12ThrowValue (masked: string, raw: string): string | undefined {
    const lead = masked.length - masked.trimStart ().length;
    const t = masked.trim ();
    const m = /^throw\s+new\s+[A-Za-z][\w.]*\s*\(/.exec (t);
    if (m === null) { return undefined; }
    const expr = t.replace (/^throw\s+/, '').replace (/;\s*$/, '').trim ();
    if (!expr.endsWith (')')) { return undefined; }
    if (j12Close (expr, expr.indexOf ('('), '(', ')') !== expr.length - 1) { return undefined; }
    if (/[;{}]/.test (expr)) { return undefined; }
    return raw.slice (lead).replace (/^throw\s+/, '').replace (/;\s*$/, '').trim ();
}

export function j12AsyncThrows (content: string): string {
    if (!content.includes ('supplyAsync(') || !content.includes ('throw new')) { return content; }
    const nf = /(?:^|[\s(])(?:java\.util\.concurrent\.)?CompletableFuture[<(.]/.test (content)
        ? 'CompletableFuture'
        : 'java.util.concurrent.CompletableFuture';
    const masked = j12Mask (content);
    const edits: [number, number, string][] = [];
    let from = 0;
    for (;;) {
        const at = masked.indexOf ('supplyAsync', from);
        if (at === -1) { break; }
        from = at + 1;
        const prev = at === 0 ? '' : masked[at - 1];
        const after = masked.slice (at + 'supplyAsync'.length, at + 'supplyAsync'.length + 1);
        if (after !== '(' || (prev !== '' && /[\w$]/.test (prev))) { continue; }
        const openParen = at + 'supplyAsync'.length;
        const closeParen = j12Close (masked, openParen, '(', ')');
        if (closeParen === -1) { continue; }
        // lambda head: `(` `)` `->` `{`
        let p = openParen + 1;
        const skip = (): void => { while (p < masked.length && /\s/.test (masked[p])) { p++; } };
        skip ();
        if (masked[p] !== '(') { continue; }
        p++;
        skip ();
        if (masked[p] !== ')') { continue; }
        p++;
        skip ();
        if (masked.slice (p, p + 2) !== '->') { continue; }
        p += 2;
        skip ();
        if (masked[p] !== '{') { continue; }
        const bodyEnd = j12Close (masked, p, '{', '}');
        if (bodyEnd === -1 || bodyEnd > closeParen) { continue; }
        let q = bodyEnd + 1;
        while (q < masked.length && /\s/.test (masked[q])) { q++; }
        if (q !== closeParen) { continue; } // single argument only
        const value = j12ThrowValue (masked.slice (p + 1, bodyEnd), content.slice (p + 1, bodyEnd));
        if (value === undefined) { continue; }
        // receiver start, so `BaseExchange.supplyAsync` -> `CompletableFuture.failedFuture`
        let start = at;
        while (start > 0 && /[\w.$]/.test (masked[start - 1])) { start--; }
        if (start > 0 && masked[start - 1] === '.') { start--; while (start > 0 && /[\w.$]/.test (masked[start - 1])) { start--; } }
        edits.push ([ start, closeParen + 1, `${nf}.failedFuture(${value})` ]);
        from = closeParen + 1;
    }
    if (edits.length === 0) { return content; }
    let out = content;
    for (let i = edits.length - 1; i >= 0; i--) {
        out = out.slice (0, edits[i][0]) + edits[i][2] + out.slice (edits[i][1]);
    }
    return out;
}

export function j12SelfTest (): string[] {
    const problems: string[] = [];
    const cls = (ret: string, body: string) => `public class Woo extends BaseExchange\n{\n    public ${ret} m(Map<String, Object> parameters)\n    {\n${body}\n    }\n}`;
    const ret = 'CompletableFuture<Order>';
    const cases: [string, string, (o: string) => boolean][] = [
        [ 'plain throw', cls (ret, '        return BaseExchange.supplyAsync(() -> {\n\n            throw new NotSupported((this.id + " closePosition() is not supported yet")) ;\n        }).thenApply(Order::new);'),
            (o) => o.includes ('CompletableFuture.failedFuture(new NotSupported((this.id + " closePosition() is not supported yet")))')
                && o.includes ('.thenApply(Order::new)') && !o.includes ('supplyAsync') && !o.includes ('throw new') ],
        [ 'bare static call', cls (ret, '        return supplyAsync(() -> { throw new NotSupported(Helpers.add(this.id, " redeem() is not supported yet")); });'),
            (o) => o.includes ('CompletableFuture.failedFuture(new NotSupported(Helpers.add(this.id, " redeem() is not supported yet")))') && !o.includes ('supplyAsync') ],
        [ 'body keeps other statements', cls (ret, '        return BaseExchange.supplyAsync(() -> {\n            if (parameters == null) { throw new NotSupported("x"); }\n            return null;\n        });'),
            (o) => o.includes ('supplyAsync(') && o.includes ('if (parameters == null)') ],
        [ 'executor overload kept', cls (ret, '        return BaseExchange.supplyAsync(() -> { throw new NotSupported("x"); }, this.executor);'),
            (o) => o.includes ('supplyAsync(') ],
        [ 'thenApply lambda untouched', cls (ret, '        return BaseExchange.supplyAsync(() -> { throw new NotSupported("x"); }).thenApply(y -> y);'),
            (o) => o.includes ('failedFuture(new NotSupported("x"))') && o.includes ('.thenApply(y -> y)') ],
        [ 'string literal mentioning throw', cls (ret, '        Object s = "supplyAsync(() -> { throw new X(); })";\n        return BaseExchange.supplyAsync(() -> { throw new NotSupported(s); });'),
            (o) => o.includes ('Object s = "supplyAsync(() -> { throw new X(); })"') && o.includes ('failedFuture(new NotSupported(s))') ],
    ];
    for (const [ name, src, ok ] of cases) {
        const out = j12AsyncThrows (src);
        if (!ok (out)) { problems.push (`hx10w7 J12: ${name}\n${out}`); }
        if (j12AsyncThrows (out) !== out) { problems.push (`hx10w7 J12: ${name} not idempotent`); }
    }
    return problems;
}
