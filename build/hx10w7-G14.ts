// hx10w7-G14: MapTyped(v any) map[string]any only re-asserts the dictionary an operand already
// holds. hx10w6-G11 dropped that identity wrap for a whole call operand and for a single
// `var x map[string]any` local; two declarations it could not read keep the wrap here:
// a field whose Go struct declares map[string]any, and a name a multi-value `:=` binds from a
// callee whose Go return list answers map[string]any at that position. A box stays wrapped
// ([]any element, `any` field or param, any-returning callee, EndpointResult.Raw): dropping the
// wrap there would need a type assertion on a box.

// fields the base exchange structs declare `map[string]any` (go/v4/exchange.go)
const HX10W7G14_MAP_FIELDS = new Set ([
    'Options', 'Has', 'Api', 'TransformedApi', 'RequiredCredentials', 'HttpExceptions', 'Timeframes',
    'Features', 'Exceptions', 'Precision', 'Urls', 'UserAgents', 'TokenBucket', 'CommonCurrencies',
    'ProxyDictionaries', 'Trades', 'Orderbooks', 'FundingRates', 'NetworkAliases', 'WsClients',
    'Balance', 'Clients', 'Streaming', 'UrlsApi',
]);

// the same names on PredictionExchange only: BaseExchange declares them `any`
const HX10W7G14_PREDICTION_FIELDS = new Set ([ 'Outcomes', 'Outcomes_by_id', 'Events', 'Events_by_slug' ]);

// callee -> index of the map[string]any value in its Go return list
const HX10W7G14_MULTI_MAP: { [name: string]: number } = { 'HandleMarginModeAndParams': 1 };

// blank the string/rune literals and the comments, keeping offsets and newlines
function hx10w7G14Mask (content: string): string {
    const out = content.split ('');
    let state = 'code';
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const c = content[i];
        if (state === 'code') {
            if ((c === '/') && (content[i + 1] === '/')) { state = 'line'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if ((c === '/') && (content[i + 1] === '*')) { state = 'block'; out[i] = ' '; out[i + 1] = ' '; i++; continue; }
            if (c === '"') { state = 'dq'; out[i] = ' '; continue; }
            if (c === '`') { state = 'raw'; out[i] = ' '; continue; }
            if (c === '\'') { state = 'rune'; out[i] = ' '; continue; }
            continue;
        }
        out[i] = (c === '\n') ? '\n' : ' ';
        if (state === 'line') { if (c === '\n') { state = 'code'; } continue; }
        if (state === 'block') { if ((c === '*') && (content[i + 1] === '/')) { out[i + 1] = ' '; i++; state = 'code'; } continue; }
        if (state === 'dq') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '"') { state = 'code'; } continue; }
        if (state === 'rune') { if (escaped) { escaped = false; } else if (c === '\\') { escaped = true; } else if (c === '\'') { state = 'code'; } continue; }
        if (state === 'raw') { if (c === '`') { state = 'code'; } continue; }
    }
    return out.join ('');
}

// index of the paren closing the one opened at `open` in masked text (-1 when unbalanced)
function hx10w7G14CloseParen (masked: string, open: number): number {
    let depth = 0;
    for (let i = open; i < masked.length; i++) {
        const c = masked[i];
        if (c === '(') {
            depth += 1;
        } else if (c === ')') {
            depth -= 1;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

// the names this function block binds, with 'map' only where the declaration itself says
// map[string]any; every other binding, rebinding or shadow makes the name 'other'
function hx10w7G14Bindings (block: string): Map<string, string> {
    const bindings = new Map<string, string> ();
    const note = (name: string, kind: string) => {
        const seen = bindings.get (name);
        bindings.set (name, ((seen === undefined) || (seen === kind)) ? kind : 'other');
    };
    const declared = /^[ \t]*var ([A-Za-z_]\w*)[ \t]+([^\n]*)/gm;
    for (let m = declared.exec (block); m !== null; m = declared.exec (block)) {
        note (m[1], (/^map\[string\]any\b/.test (m[2])) ? 'map' : 'other');
    }
    const multi = /^[ \t]*((?:[A-Za-z_]\w*[ \t]*,[ \t]*)+[A-Za-z_]\w*)[ \t]*:=[ \t]*(?:<-)?[ \t]*([A-Za-z_][\w.]*)[ \t]*\(/gm;
    for (let m = multi.exec (block); m !== null; m = multi.exec (block)) {
        const names = m[1].split (',').map ((part) => part.trim ());
        const segments = m[2].split ('.');
        const callee = segments[segments.length - 1];
        const position = HX10W7G14_MULTI_MAP[callee];
        names.forEach ((name, index) => note (name, ((position === index) ? 'map' : 'other')));
    }
    const short = /^[ \t]*([A-Za-z_]\w*)[ \t]*:=/gm;
    for (let m = short.exec (block); m !== null; m = short.exec (block)) {
        note (m[1], 'other');
    }
    const assign = /^[ \t]*([A-Za-z_]\w*)[ \t]*=[^=]/gm;
    for (let m = assign.exec (block); m !== null; m = assign.exec (block)) {
        note (m[1], 'other');
    }
    return bindings;
}

// the operand text of every MapTyped call that provably already holds map[string]any
function hx10w7G14DropWraps (text: string, masked: string, bindings: Map<string, string>, prediction: boolean): string {
    const wrapper = /(?<![\w.])(?:ccxt\.)?MapTyped\(/g;
    let out = '';
    let cursor = 0;
    for (let m = wrapper.exec (masked); m !== null; m = wrapper.exec (masked)) {
        if (m.index < cursor) {
            continue;
        }
        const open = m.index + m[0].length - 1;
        const end = hx10w7G14CloseParen (masked, open);
        if (end < 0) {
            continue;
        }
        const operand = text.slice (open + 1, end).trim ();
        const field = /^this\.([A-Za-z_]\w*)$/.exec (operand);
        const name = /^([A-Za-z_]\w*)$/.exec (operand);
        let proven = false;
        if (field !== null) {
            proven = HX10W7G14_MAP_FIELDS.has (field[1]) || (prediction && HX10W7G14_PREDICTION_FIELDS.has (field[1]));
        } else if (name !== null) {
            proven = bindings.get (name[1]) === 'map';
        }
        if (!proven) {
            continue;
        }
        out += text.slice (cursor, m.index) + operand;
        cursor = end + 1;
        wrapper.lastIndex = cursor;
    }
    return out + text.slice (cursor);
}

export function hx10w7G14Pass (content: string): string {
    if ((typeof content !== 'string') || (content.indexOf ('MapTyped(') < 0)) {
        return content;
    }
    const masked = hx10w7G14Mask (content);
    const prediction = content.indexOf ('ccxt.PredictionExchange') >= 0;
    const starts = [ 0 ];
    const head = /^func /gm;
    for (let m = head.exec (masked); m !== null; m = head.exec (masked)) {
        if (m.index > 0) {
            starts.push (m.index);
        }
    }
    let result = '';
    for (let index = 0; index < starts.length; index++) {
        const from = starts[index];
        const to = (index + 1 < starts.length) ? starts[index + 1] : content.length;
        const block = masked.slice (from, to);
        const text = content.slice (from, to);
        result += (block.indexOf ('MapTyped(') < 0) ? text : hx10w7G14DropWraps (text, block, hx10w7G14Bindings (block), prediction);
    }
    return result;
}

export function hx10w7G14SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('w7-G14: ' + message); } };
    const run = (text: string) => hx10w7G14Pass (text);
    const body = (lines: string) => '\nfunc (this *X) f(p any) (any, map[string]any) {\n' + lines + '}\n';
    const plain = (lines: string) => '\nfunc (this *X) f(p any) map[string]any {\n' + lines + '}\n';
    // a field the base struct declares map[string]any: the wrap is the identity
    ok (run (plain ('\treturn MapTyped(this.Balance)\n')).includes ('return this.Balance'), 'balance field dropped');
    ok (run (plain ('\treturn ccxt.MapTyped(this.Options)\n')).includes ('return this.Options'), 'qualified field dropped');
    // the prediction caches are map[string]any only where the venue embeds PredictionExchange
    const cache = plain ('\treturn MapTyped(this.Outcomes)\n');
    ok (run ('\ntype K struct {\n\tccxt.PredictionExchange\n}\n' + cache).includes ('return this.Outcomes'), 'prediction cache dropped');
    ok (run ('\ntype K struct {\n\tccxt.Exchange\n}\n' + cache).includes ('MapTyped(this.Outcomes)'), 'cache of a plain venue keeps wrap');
    // a param, a member read and an unknown field keep the wrap
    ok (run (plain ('\treturn MapTyped(p)\n')).includes ('MapTyped(p)'), 'param keeps wrap');
    ok (run (plain ('\treturn MapTyped(this.Options["broker"])\n')).includes ('MapTyped(this.Options["broker"])'), 'member read keeps wrap');
    ok (run (plain ('\treturn MapTyped(this.EventsLoading)\n')).includes ('MapTyped(this.EventsLoading)'), 'untyped field keeps wrap');
    // the second value of HandleMarginModeAndParams is map[string]any by its Go signature
    ok (run (body ('\tmarginMode, paramsMarginMode := this.Exchange.HandleMarginModeAndParams("m", p)\n\treturn marginMode, MapTyped(paramsMarginMode)\n')).includes ('return marginMode, paramsMarginMode'), 'margin-mode params dropped');
    ok (run (body ('\tmarginMode, paramsMarginMode := this.HandleMarginModeAndParams("m", p)\n\treturn marginMode, MapTyped(paramsMarginMode)\n')).includes ('return marginMode, paramsMarginMode'), 'unqualified callee dropped');
    ok (run (body ('\tmarginMode, paramsMarginMode := this.Exchange.HandleMarginModeAndParams("m", p)\n\treturn SafeStringPtr(marginMode), MapTyped(marginMode)\n')).includes ('MapTyped(marginMode)'), 'pointer position keeps wrap');
    ok (run (body ('\tmarginMode, paramsMarginMode := this.Other("m", p)\n\treturn marginMode, MapTyped(paramsMarginMode)\n')).includes ('MapTyped(paramsMarginMode)'), 'unknown callee keeps wrap');
    ok (run (body ('\tmarginMode, paramsMarginMode := this.Exchange.HandleMarginModeAndParams("m", p)\n\tparamsMarginMode = nil\n\treturn marginMode, MapTyped(paramsMarginMode)\n')).includes ('MapTyped(paramsMarginMode)'), 'rebound name keeps wrap');
    // a local the declaration itself types map[string]any
    ok (run (plain ('\tvar stub map[string]any = map[string]any{"a": nil}\n\treturn MapTyped(stub)\n')).includes ('return stub'), 'typed local dropped');
    ok (run (plain ('\tvar stub any = nil\n\treturn MapTyped(stub)\n')).includes ('MapTyped(stub)'), 'untyped local keeps wrap');
    ok (run (plain ('\tvar stub map[string]any = nil\n\tstub = p\n\treturn MapTyped(stub)\n')).includes ('MapTyped(stub)'), 'reassigned local keeps wrap');
    // a box keeps its wrap
    ok (run (plain ('\treturn MapTyped(pairs[1])\n')).includes ('MapTyped(pairs[1])'), '[]any element keeps wrap');
    ok (run (plain ('\treturn MapTyped(r.Raw)\n')).includes ('MapTyped(r.Raw)'), 'any field keeps wrap');
    ok (run (plain ('\treturn MapTyped(GetValue(p, 0))\n')).includes ('MapTyped(GetValue(p, 0))'), 'any callee keeps wrap');
    // comments and string literals are never rewritten
    ok (run (plain ('\t// MapTyped(this.Balance) is the identity\n\treturn nil\n')).indexOf ('// MapTyped(this.Balance) is the identity') >= 0, 'comment untouched');
    ok (run (plain ('\t_ = "MapTyped(this.Balance)"\n\treturn nil\n')).indexOf ('"MapTyped(this.Balance)"') >= 0, 'literal untouched');
    const clean = plain ('\treturn this.Balance\n');
    ok (run (clean) === clean, 'no wrap means no change');
    return problems;
}
