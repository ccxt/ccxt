// HX10 wave4 OG01: the Balance cache is owned by the exchange's ws dispatch loop, like the four ws
// caches (exchange_ws_cache.go). Handler code runs on that loop and keeps the plain map helpers; the
// async bodies below run on their own goroutine, so their Balance access becomes an operation the
// loop performs. Anything that is not one of those functions keeps its helper call unchanged.
import { goChanMask, goChanClose } from './go-chan.js';

const FIELD_CALL = '"Balance"';
// the async bodies the <Method>Async wrappers start on their own goroutine, Close's cleanup, and the
// pre-subscription seeding helper those bodies call (every call site of it is a body).
const USER_PATH = /^(?:(?:watch|fetch|seed)\w*Body|loadBalanceSnapshotBody|SetBalanceCache|CleanWsData)$/;
const FUNC_HEAD = /^func \((?:[^)]*)\) (\w+)\(/;

type Span = { s: number, e: number };
type Call = { at: number, open: number, close: number, args: Span[] };

function og01CallAt (masked: string, line: string, at: number, name: string): Call | undefined {
    const open = masked.indexOf ('(', at + name.length);
    if (open < 0) {
        return undefined;
    }
    const close = goChanClose (masked, open);
    if (close < 0) {
        return undefined;
    }
    return { at, open, close, args: og01Split (masked, line, open, close - 1) };
}

// top-level comma split of [open .. close). Positions come from the masked text (a comma inside a
// string or a comment must not split), emptiness from the printed text: the mask blanks a string
// literal whole, so a masked-only test drops a trailing string argument.
function og01Split (masked: string, line: string, open: number, close: number): Span[] {
    const spans: Span[] = [];
    let depth = 0;
    let s = open + 1;
    for (let i = open + 1; i < close; i++) {
        const c = masked[i];
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            depth--;
        } else if ((c === ',') && (depth === 0)) {
            spans.push ({ s, e: i });
            s = i + 1;
        }
    }
    if (line.substring (s, close).trim () !== '') {
        spans.push ({ s, e: close });
    }
    return spans;
}

function og01IsField (text: string): boolean {
    return text.trim () === 'this.Balance';
}

// `this.Balance = this.CreateSafeDictionary(...)` (CleanWsData) empties the map instead of swapping it
function og01Clear (line: string, masked: string): string | undefined {
    const m = /^(\s*)this\.Balance = this\.CreateSafeDictionary\([^)]*\)\s*$/.exec (masked);
    if (m === null) {
        return undefined;
    }
    return m[1] + 'this.WsCacheReset(' + FIELD_CALL + ')';
}

// `this.Balance = v` replaces the whole map contents on the loop, keeping the map handlers read
function og01Assign (line: string, masked: string): string | undefined {
    const m = /^(\s*)this\.Balance = /.exec (masked);
    if (m === null) {
        return undefined;
    }
    const valueStart = m[0].length;
    const valueEnd = line.trimEnd ().length;
    if (valueEnd <= valueStart) {
        return undefined;
    }
    return m[1] + 'this.WsCacheReplace(' + FIELD_CALL + ', ' + line.substring (valueStart, valueEnd) + ')';
}

// is the call at `at` the receiver of a nested `AddElementToObject(<read>, k, v)` write? Such a
// write would land in the copy a rewritten read returns, so the whole line is left alone.
function og01NestedWriteReceiver (masked: string, at: number): boolean {
    const before = masked.substring (0, at).replace (/\s+$/, '');
    return /(?:^|[^\w.])(?:ccxt\.)?AddElementToObject\($/.test (before);
}

// `AddElementToObject(this.Balance, k, v)` / `InOp(...)` / `GetValue(...)` on the balance cache
function og01Helper (line: string, masked: string): string | undefined {
    const re = /(?<![\w.])(?:ccxt\.)?(AddElementToObject|InOp|GetValue)\(/g;
    let hit = re.exec (masked);
    while (hit !== null) {
        const name = /AddElementToObject|InOp|GetValue/.exec (hit[0])?.[0] as string;
        const call = og01CallAt (masked, line, hit.index, name);
        if (call === undefined) {
            return undefined;
        }
        const args = call.args.map (a => line.substring (a.s, a.e).trim ());
        if (og01IsField (args[0] ?? '')) {
            if (og01NestedWriteReceiver (masked, hit.index)) {
                return undefined;
            }
            let text: string | undefined;
            if ((name === 'AddElementToObject') && (call.args.length === 3)) {
                text = 'this.WsCacheSetScalar(' + FIELD_CALL + ', ' + args[1] + ', ' + args[2] + ')';
            } else if ((name === 'InOp') && (call.args.length === 2)) {
                text = 'this.WsCacheHas(' + FIELD_CALL + ', ' + args[1] + ')';
            } else if ((name === 'GetValue') && (call.args.length === 2)) {
                text = 'this.WsCacheGetScalar(' + FIELD_CALL + ', ' + args[1] + ')';
            }
            if (text === undefined) {
                return undefined;
            }
            return line.substring (0, call.at) + text + line.substring (call.close);
        }
        hit = re.exec (masked);
    }
    return undefined;
}

// `this.SafeDict(this.Balance, k, d)` walks a map entry: the receiver becomes a copy taken on the loop
function og01SafeRead (line: string, masked: string): string | undefined {
    const re = /(?<![\w.])this\.(?:SafeDict|SafeValue|SafeList|SafeMap|SafeDictMap)\(/g;
    const hit = re.exec (masked);
    if (hit === null) {
        return undefined;
    }
    const name = /SafeDictMap|SafeDict|SafeValue|SafeList|SafeMap/.exec (hit[0])?.[0] as string;
    const call = og01CallAt (masked, line, hit.index, name);
    if ((call === undefined) || (call.args.length < 2)) {
        return undefined;
    }
    const first = call.args[0];
    if (!og01IsField (line.substring (first.s, first.e))) {
        return undefined;
    }
    return line.substring (0, first.s) + 'this.WsCacheSnapshot(' + FIELD_CALL + ')' + line.substring (first.e);
}

// any other read of the whole cache (`Resolve(this.Balance, h)`, `IsEqual(this.Balance, nil)`) reads a copy
function og01Snapshot (line: string, masked: string): string | undefined {
    const m = /(?<![\w.])this\.Balance\b/.exec (masked);
    if (m === null) {
        return undefined;
    }
    return line.substring (0, m.index) + 'this.WsCacheSnapshot(' + FIELD_CALL + ')' + line.substring (m.index + m[0].length);
}

const OG01_RULES = [ og01Clear, og01Assign, og01Helper, og01SafeRead, og01Snapshot ];

function og01Line (line: string): string {
    for (let guard = 0; guard < 8; guard++) {
        const masked = goChanMask (line);
        let next: string | undefined;
        for (const rule of OG01_RULES) {
            next = rule (line, masked);
            if (next !== undefined) {
                break;
            }
        }
        if ((next === undefined) || (next === line)) {
            return line;
        }
        line = next;
    }
    return line;
}

export function hx10w4OG01Pass (content: string): string {
    const body = content.split ('\n');
    let inUserPath = false;
    for (let i = 0; i < body.length; i++) {
        const head = FUNC_HEAD.exec (body[i]);
        if (head !== null) {
            inUserPath = USER_PATH.test (head[1]);
            continue;
        }
        if (inUserPath && (body[i].indexOf ('this.Balance') >= 0)) {
            body[i] = og01Line (body[i]);
        }
    }
    return body.join ('\n');
}

export function hx10w4OG01Check (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10-W4-OG01: ' + message); } };
    const body = (text: string) => hx10w4OG01Pass ('func (this *X) watchBalanceBody(ch chan any, typeVar any) {\n' + text + '}\n');
    ok (body ('\tccxt.AddElementToObject(this.Balance, typeVar, map[string]any{})\n').indexOf ('\tthis.WsCacheSetScalar("Balance", typeVar, map[string]any{})') >= 0,
        'a body write becomes an owner operation');
    ok (body ('\tif !(ccxt.InOp(this.Balance, typeVar)) {\n\t}\n').indexOf ('if !(this.WsCacheHas("Balance", typeVar)) {') >= 0,
        'a body membership test asks the owner');
    ok (body ('\tvar loaded bool = (ccxt.InOp(this.Balance, "info"))\n').indexOf ('this.WsCacheHas("Balance", "info")') >= 0,
        'a parenthesised membership test becomes an owner operation');
    ok (body ('\tclient.(ccxt.ClientInterface).Resolve(ccxt.GetValue(this.Balance, typeVar), typeVar+":balance")\n').indexOf ('Resolve(this.WsCacheGetScalar("Balance", typeVar), typeVar+":balance")') >= 0,
        'a read handed to Resolve is dereferenced on the owner');
    ok (body ('\tthis.Balance = this.Extend(response, this.Balance)\n').indexOf ('\tthis.WsCacheReplace("Balance", this.Extend(response, this.WsCacheSnapshot("Balance")))') >= 0,
        'a whole-map write replaces the contents and reads a copy');
    ok (body ('\tvar subaccountIdKey *string = this.NumberToString(subaccountId)\n\tif fetchSnapshot && !(ccxt.InOp(this.Balance, subaccountIdKey)) {\n\t\tccxt.AddElementToObject(this.Balance, subaccountIdKey, seeded)\n\t}\n').indexOf ('if fetchSnapshot && !(this.WsCacheHas("Balance", subaccountIdKey)) {') >= 0,
        'a body read with a pointer key goes to the owner');
    ok (body ('\tccxt.AddElementToObject(this.Balance, typeVar, this.Extend(response, this.SafeDict(this.Balance, typeVar, map[string]any{})))\n').indexOf ('this.WsCacheSetScalar("Balance", typeVar, this.Extend(response, this.SafeDict(this.WsCacheSnapshot("Balance"), typeVar, map[string]any{})))') >= 0,
        'a nested entry-map read and its write both go to the owner');
    ok (body ('\tif ccxt.IsEqual(this.Balance, nil) {\n\t}\n').indexOf ('if ccxt.IsEqual(this.WsCacheSnapshot("Balance"), nil) {') >= 0,
        'a whole-map comparison reads a copy');
    ok (body ('\tfuture.(*ccxt.Future).Resolve(this.Balance)\n').indexOf ('Resolve(this.WsCacheSnapshot("Balance"))') >= 0,
        'handing the whole map to a future resolves a copy');
    const clean = hx10w4OG01Pass ('func (this *BaseExchange) CleanWsData() {\n\tthis.Balance = this.CreateSafeDictionary(true)\n}\n');
    ok (clean.indexOf ('\tthis.WsCacheReset("Balance")') >= 0, 'CleanWsData empties the map through the owner');
    const seed = hx10w4OG01Pass ('func (this *X) SetBalanceCache(client any, typeVar any) {\n\tif ccxt.InOp(this.Balance, typeVar) {\n\t\treturn\n\t}\n}\n');
    ok (seed.indexOf ('if this.WsCacheHas("Balance", typeVar) {') >= 0, 'the seeding helper asks the owner too, every caller is a body');
    // handler code already runs on the dispatch loop: it stays on the plain map
    const handler = hx10w4OG01Pass ('func (this *X) HandleBalance(client any, message any) {\n\tif !(ccxt.InOp(this.Balance, typeVar)) {\n\t\tccxt.AddElementToObject(this.Balance, typeVar, map[string]any{})\n\t}\n}\n');
    ok (handler.indexOf ('ccxt.InOp(this.Balance, typeVar)') >= 0, 'a handler keeps the plain map operation');
    ok (handler.indexOf ('ccxt.AddElementToObject(this.Balance, typeVar, map[string]any{})') >= 0, 'a handler keeps the plain map write');
    // the parse helpers run from handlers, so they keep their plain operations
    const parse = hx10w4OG01Pass ('func (this *X) ParseWsBalance(data any) any {\n\tccxt.AddElementToObject(this.Balance, "info", data)\n\treturn nil\n}\n');
    ok (parse.indexOf ('ccxt.AddElementToObject(this.Balance, "info", data)') >= 0, 'a parse helper stays on the plain map');
    // a write through a nested receiver would land in the copy the read returns: leave the line whole
    const nested = hx10w4OG01Pass ('func (this *X) watchBalanceBody(ch chan any, typeVar any) {\n\tccxt.AddElementToObject(ccxt.GetValue(this.Balance, typeVar), "info", data)\n}\n');
    ok (nested.indexOf ('ccxt.AddElementToObject(ccxt.GetValue(this.WsCacheSnapshot("Balance"), typeVar), "info", data)') >= 0,
        'the receiver of a nested write reads a copy and the write is left alone');
    // idempotent: an already-owned line is not rewritten again
    const once = body ('\tthis.Balance = this.Extend(response, this.Balance)\n');
    ok (hx10w4OG01Pass (once) === once, 'a rewritten line is not rewritten twice');
    return problems;
}
