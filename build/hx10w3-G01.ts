// hx10w3-G01: the ws client's subscriptions table is a plain map[string]any owned by one
// goroutine (exchange_client.go), so a generated access cannot be a native map op — it hands
// the op to the owner. A helper call whose first argument is the table becomes a typed client
// method; a bare read of the table becomes a snapshot copy. Every other shape keeps the call.

interface entry {
    callee: string;
    method: string;
    args: number;
}

const table: entry[] = [
    { callee: 'InOp', method: 'SubscriptionHas', args: 2 },
    { callee: 'Remove', method: 'SubscriptionDel', args: 2 },
    { callee: 'GetValue', method: 'SubscriptionGet', args: 2 },
    { callee: 'AddElementToObject', method: 'SubscriptionSet', args: 3 },
    { callee: 'SafeMapTyped', method: 'SubscriptionDict', args: 2 },
    { callee: 'ObjectKeys', method: 'SubscriptionKeys', args: 1 },
    { callee: 'ObjectValues', method: 'SubscriptionValues', args: 1 },
];

function ruleFor (name: string): entry | undefined {
    const callee = name.replace (/^ccxt\./, '');
    const hits = table.filter ((rule) => rule.callee === callee);
    return hits.length === 0 ? undefined : hits[0];
}

function objOf (recv: string): string {
    return recv.replace (/\.(?:GetSubscriptions\(\)|Subscriptions)$/, '');
}

// same length as the input, with comments and literals blanked out so no rewrite lands inside
function maskGo (text: string): string {
    const out: string[] = text.split ('');
    const n = text.length;
    let i = 0;
    while (i < n) {
        const c = text[i];
        if ((c === '/') && (text[i + 1] === '/')) {
            while ((i < n) && (text[i] !== '\n')) { out[i] = ' '; i++; }
        } else if ((c === '/') && (text[i + 1] === '*')) {
            while (i < n) {
                const closing = (text[i] === '*') && (text[i + 1] === '/');
                out[i] = ' '; i++;
                if (closing) { if (i < n) { out[i] = ' '; i++; } break; }
            }
        } else if ((c === '"') || (c === '\'') || (c === '`')) {
            const quote = c;
            out[i] = ' '; i++;
            while (i < n) {
                const d = text[i];
                out[i] = (d === '\n') ? '\n' : ' ';
                i++;
                if ((quote !== '`') && (d === '\\')) { if (i < n) { out[i] = ' '; i++; } continue; }
                if (d === quote) { break; }
                if ((quote !== '`') && (d === '\n')) { break; }
            }
        } else {
            i++;
        }
    }
    return out.join ('');
}

function matchParen (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if ('([{'.includes (c)) { depth++; }
        else if (')]}'.includes (c)) { if (--depth === 0) { return i; } }
    }
    return -1;
}

// top-level comma split of a call's argument text, undefined when the text is not balanced
function splitArgs (masked: string, from: number, to: number): number[][] | undefined {
    const spans: number[][] = [];
    let depth = 0;
    let start = from;
    for (let i = from; i < to; i++) {
        const c = masked[i];
        if ('([{'.includes (c)) { depth++; }
        else if (')]}'.includes (c)) { if (--depth < 0) { return undefined; } }
        else if ((c === ',') && (depth === 0)) { spans.push ([ start, i ]); start = i + 1; }
    }
    if (depth !== 0) { return undefined; }
    spans.push ([ start, to ]);
    return spans;
}

// the callee of the call whose first argument starts at recvStart, if the table opens one
function callHead (masked: string, recvStart: number): { name: string; start: number } | undefined {
    if (masked[recvStart - 1] !== '(') {
        return undefined;
    }
    let i = recvStart - 2;
    while ((i >= 0) && /[\w.]/.test (masked[i])) { i--; }
    const name = masked.substring (i + 1, recvStart - 1);
    return name.length === 0 ? undefined : { name: name, start: i + 1 };
}

// a read that initialises an `any` local keeps the base call: the nil-compare pass proves that
// local pointer-free from the helper name, and a method call there would lose the native compare
function initAnyLocal (content: string, callStart: number): boolean {
    const lineStart = content.lastIndexOf ('\n', callStart - 1) + 1;
    return /(?:^|\s)var \w+ any = $/.test (content.substring (lineStart, callStart));
}

export function g01SubsHandOff (content: string): string {
    if ((content.indexOf ('.GetSubscriptions()') < 0) && (content.indexOf ('.Subscriptions') < 0)) {
        return content;
    }
    const pat = 'client\\.\\((?:ccxt\\.)?ClientInterface\\)\\.GetSubscriptions\\(\\)|client\\.\\(\\*?(?:ccxt\\.)?WSClient\\)\\.Subscriptions|client\\.Subscriptions';
    const recvRe = new RegExp (pat, 'g');
    const masked = maskGo (content);
    let out = '';
    let last = 0;
    let match: RegExpExecArray | null = recvRe.exec (masked);
    while (match !== null) {
        const start = match.index;
        const end = start + match[0].length;
        const recv = content.substring (start, end);
        const head = callHead (masked, start);
        const rule = head === undefined ? undefined : ruleFor (head.name);
        const close = rule === undefined ? -1 : matchParen (masked, start - 1);
        const spans = (rule === undefined) || (close < 0) ? undefined : splitArgs (masked, start, close);
        let stop = end;
        if ((head !== undefined) && (rule !== undefined) && (spans !== undefined) && (spans.length === rule.args) && !((rule.callee === 'GetValue') && initAnyLocal (content, head.start))) {
            const args = spans.slice (1).map ((span) => content.substring (span[0], span[1]).trim ());
            out += content.substring (last, head.start) + objOf (recv) + '.' + rule.method + '(' + args.join (', ') + ')';
            stop = close + 1;
        } else {
            out += content.substring (last, start) + objOf (recv) + '.SubscriptionsSnapshot()';
        }
        last = stop;
        recvRe.lastIndex = stop;
        match = recvRe.exec (masked);
    }
    return out + content.substring (last);
}

export function g01SubsCheck (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, what: string, got: string) => { if (!cond) { problems.push ('hx10w3-G01 ' + what + ': ' + got); } };
    const f = (body: string) => g01SubsHandOff ('func (this *X) H(client any, h any) {\n' + body + '}\n');
    const r = 'client.(ccxt.ClientInterface)';
    const get = r + '.GetSubscriptions()';
    const tab = '\t';
    const remove = f (tab + 'ccxt.Remove(' + get + ', h)\n');
    ok (remove.includes (tab + r + '.SubscriptionDel(h)\n'), 'remove', remove);
    const inop = f (tab + 'if !(ccxt.InOp(' + get + ', h)) {\n' + tab + '}\n');
    ok (inop.includes ('if !(' + r + '.SubscriptionHas(h)) {'), 'inop', inop);
    const set = f (tab + 'ccxt.AddElementToObject(' + get + ', ccxt.Add("a", h), map[string]any{"b": ccxt.Add("c", h)})\n');
    ok (set.includes (tab + r + '.SubscriptionSet(ccxt.Add("a", h), map[string]any{"b": ccxt.Add("c", h)})\n'), 'set', set);
    const got = f (tab + 'return ccxt.GetValue(' + get + ', h)\n');
    ok (got.includes (r + '.SubscriptionGet(h)') && !got.includes ('ccxt.GetValue('), 'get', got);
    const anyDecl = f (tab + 'var s any = ccxt.GetValue(' + get + ', h)\n');
    ok (anyDecl.includes ('ccxt.GetValue(' + r + '.SubscriptionsSnapshot(), h)'), 'any-local keeps the deref-aware read', anyDecl);
    const nestedGet = f (tab + 'var s *string = this.SafeString(ccxt.GetValue(' + get + ', h), "id")\n');
    ok (nestedGet.includes (r + '.SubscriptionGet(h)'), 'nested read', nestedGet);
    const keys = f (tab + 'var k []string = ccxt.ObjectKeys(' + get + ')\n');
    ok (keys.includes (r + '.SubscriptionKeys()'), 'keys', keys);
    const values = f (tab + 'var v []any = ccxt.ObjectValues(' + get + ')\n');
    ok (values.includes (r + '.SubscriptionValues()'), 'values', values);
    const dict = f (tab + 'var m map[string]any = ccxt.SafeMapTyped(' + get + ', h)\n');
    ok (dict.includes (r + '.SubscriptionDict(h)'), 'dict', dict);
    const snap = f (tab + 'var s any = this.SafeValue(' + get + ', h)\n');
    ok (snap.includes ('this.SafeValue(' + r + '.SubscriptionsSnapshot(), h)'), 'snapshot', snap);
    const ws = f (tab + 'if ccxt.InOp(client.(*ccxt.WSClient).Subscriptions, h) {\n' + tab + '}\n');
    ok (ws.includes ('client.(*ccxt.WSClient).SubscriptionHas(h)'), 'wsclient', ws);
    const field = f (tab + 'if ccxt.InOp(client.Subscriptions, h) {\n' + tab + '}\n');
    ok (field.includes ('client.SubscriptionHas(h)'), 'field', field);
    const comment = tab + '// client.(*ccxt.WSClient).Subscriptions[channel] = message\n';
    ok (f (comment).includes (comment.trim ()), 'comment', f (comment));
    const other = f (tab + 'if ccxt.InOp(this.Tickers, h) {\n' + tab + '}\n');
    ok (other.includes ('ccxt.InOp(this.Tickers, h)'), 'other-map', other);
    const nested = f (tab + 'ccxt.AddElementToObject(ccxt.GetValue(' + get + ', "a"), "b", h)\n');
    ok (nested.includes ('ccxt.AddElementToObject(' + r + '.SubscriptionGet("a"), "b", h)'), 'nested', nested);
    const mixed = f (tab + 'if ccxt.InOp(client.(*ccxt.WSClient).Subscriptions, h) && ccxt.InOp(' + get + ', h) {\n' + tab + '}\n');
    ok (mixed.includes ('client.(*ccxt.WSClient).SubscriptionHas(h) && ' + r + '.SubscriptionHas(h)'), 'two-calls', mixed);
    return problems;
}
