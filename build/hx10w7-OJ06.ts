// hx10w7 OJ06 — WsClient's futures / subscriptions / rejections are owner-thread LinkedHashMaps
// behind OwnerMap hand-off views. A Helpers.GetValue read on one of them is the plain map get, and a
// null receiver or key answers null in both spellings, so the guarded native read stays exact.
// Only an identifier or a string-literal key qualifies; every other shape keeps the helper call.
const wsFields = [ 'futures', 'subscriptions', 'rejections' ];
const wsCall = 'Helpers.GetValue(';
const wsLit = /^"(?:[^"\\]|\\.)*"$/;
const wsId = /^[A-Za-z_]\w*$/;

// same-length copy with string / char literals and // comments blanked, so structure scans never read them
function maskWs (text: string): string {
    const out = text.split ('');
    const blank = (from: number, to: number) => {
        for (let k = from; k < to; k++) if (out[k] !== '\n') out[k] = ' ';
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"' || c === "'") {
            let j = i + 1;
            while (j < text.length) {
                if (text[j] === '\\') { j += 2; continue; }
                if (text[j] === c) break;
                j++;
            }
            blank (i + 1, j);
            i = j;
            continue;
        }
        if (c === '/' && text[i + 1] === '/') {
            let j = i;
            while (j < text.length && text[j] !== '\n') j++;
            blank (i, j);
            i = j;
        }
    }
    return out.join ('');
}

function closeWs (masked: string, open: number): number {
    let depth = 0;
    for (let k = open; k < masked.length; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            if (--depth === 0) return k;
        }
    }
    return -1;
}

function argsWs (content: string, masked: string, open: number, close: number): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = open + 1;
    for (let k = open + 1; k < close; k++) {
        const c = masked[k];
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') depth--;
        else if (c === ',' && depth === 0) {
            parts.push (content.slice (start, k));
            start = k + 1;
        }
    }
    parts.push (content.slice (start, close));
    return parts;
}

export function wsMapReads (content: string): string {
    if (!content.includes (wsCall)) return content;
    const masked = maskWs (content);
    const edits: [ number, number, string ][] = [];
    for (let i = masked.indexOf (wsCall); i !== -1; i = masked.indexOf (wsCall, i + 1)) {
        const open = i + wsCall.length - 1;
        const close = closeWs (masked, open);
        if (close === -1) continue;
        const parts = argsWs (content, masked, open, close);
        if (parts.length !== 2) continue;
        const receiver = /^client\.([A-Za-z_]\w*)$/.exec (parts[0].trim ());
        if (receiver === null || wsFields.indexOf (receiver[1]) === -1) continue;
        const key = parts[1].trim ();
        const literal = wsLit.test (key);
        if (!literal && !wsId.test (key)) continue; // a computed or cast key keeps the helper
        const get = 'client.' + receiver[1] + '.get(' + key + ')';
        const text = literal
            ? '(client.' + receiver[1] + ' == null ? null : ' + get + ')'
            : '(client.' + receiver[1] + ' == null || ' + key + ' == null ? null : ' + get + ')';
        edits.push ([ i, close + 1, text ]);
    }
    let out = content;
    for (const [ from, to, text ] of edits.reverse ()) out = out.slice (0, from) + text + out.slice (to);
    return out;
}

export function wsReadsTest (): string[] {
    const problems: string[] = [];
    const cases: [ string, string, string | undefined ][] = [
        [ 'ident key', '        Object subscription = Helpers.GetValue(client.subscriptions, key);',
            '(client.subscriptions == null || key == null ? null : client.subscriptions.get(key))' ],
        [ 'literal key', '        Object v = Helpers.GetValue(client.subscriptions, "authenticated");',
            '(client.subscriptions == null ? null : client.subscriptions.get("authenticated"))' ],
        [ 'rejections field', '        Object r = Helpers.GetValue(client.rejections, messageHash);',
            '(client.rejections == null || messageHash == null ? null : client.rejections.get(messageHash))' ],
        [ 'cast prefix', '        io.github.ccxt.ws.Future f = (io.github.ccxt.ws.Future)Helpers.GetValue(client.futures, s);',
            '(io.github.ccxt.ws.Future)(client.futures == null || s == null ? null : client.futures.get(s))' ],
        [ 'other field', '        Object v = Helpers.GetValue(client.other, key);', undefined ],
        [ 'computed key', '        Object v = Helpers.GetValue(client.subscriptions, this.hash(x));', undefined ],
        [ 'three args', '        Object v = Helpers.GetValue(client.subscriptions, key, extra);', undefined ],
        [ 'not a client receiver', '        Object v = Helpers.GetValue(subs, key);', undefined ],
    ];
    for (const [ name, body, expect ] of cases) {
        const out = wsMapReads (body);
        if (expect === undefined) {
            if (out !== body) problems.push ('hx10w7 OJ06: ' + name + ' should keep the helper: ' + out);
            continue;
        }
        if (!out.includes (expect)) problems.push ('hx10w7 OJ06: ' + name + ' not native: ' + out);
        if (wsMapReads (out) !== out) problems.push ('hx10w7 OJ06: ' + name + ' not idempotent');
    }
    return problems;
}
