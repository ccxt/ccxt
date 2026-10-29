// HX10 W6 OG03: the ws client registry field (this.Clients) is owned by the exchange's ws dispatch
// loop. Generated code reads the registry from user-path goroutines (ObjectValues, SafeValue, InOp,
// this.Clients[url]) and drops entries from it (Remove); reads become the owner-answered copy and
// the drop becomes the owner's delete op. Handler-side code already runs on the loop and keeps the
// field, so a use site never waits on itself.
import { goChanMask } from './go-chan.js';

const CLIENT_FIELD = /(?<![\w.])this\.Clients\b/g;
const REMOVE_CLIENTS = /(?:ccxt\.)?Remove\(\s*this\.Clients\s*,\s*/g;
const FIELD_WRITE = /(?<![\w.])this\.Clients(?:\s*\[[^\]]*\])?\s*=(?!=)/;
const FUNC_HEAD = /^func\s*(?:\(\s*[^)]*\)\s*)?(\w+)\s*\(/;
const HANDLER = /^Handle\w*$/;
// handler-called helpers: they run on the dispatch goroutine like the handler that calls them
const OWNER_SIDE = new Set ([ 'IsOrderBookDeltaInSequence' ]);
const OWNER_FILE = 'func (this *BaseExchange) wsClientsApply';

// the first argument of Remove(this.Clients, arg): everything up to the call's closing paren
function og03w6arg (masked: string, start: number): number {
    let depth = 0;
    for (let i = start; i < masked.length; i++) {
        const c = masked[i];
        if ('([{'.indexOf (c) >= 0) {
            depth++;
        } else if (')]}'.indexOf (c) >= 0) {
            if (depth === 0) {
                return i;
            }
            depth--;
        }
    }
    return -1;
}

// a drop is a write: it happens on the owner, so the call becomes the owner's delete op
function og03w6line (line: string): string {
    if (line.indexOf ('this.Clients') < 0) {
        return line;
    }
    let masked = goChanMask (line);
    if (FIELD_WRITE.test (masked)) {
        return line;
    }
    for (let guard = 0; guard < 8; guard++) {
        const hit = REMOVE_CLIENTS.exec (masked);
        if (hit === null) {
            break;
        }
        const start = hit.index + hit[0].length;
        const close = og03w6arg (masked, start);
        if (close < 0) {
            return line;
        }
        const url = line.substring (start, close).trim ();
        if (url === '') {
            return line;
        }
        line = line.substring (0, hit.index) + 'this.WsClientRemove(' + url + ')' + line.substring (close + 1);
        masked = goChanMask (line);
    }
    // every other read is a snapshot: the accessor asks the owner for a copy of the registry
    let out = '';
    let done = 0;
    let hit = CLIENT_FIELD.exec (masked);
    while (hit !== null) {
        out += line.substring (done, hit.index) + 'this.WsClientsSnapshot()';
        done = hit.index + hit[0].length;
        hit = CLIENT_FIELD.exec (masked);
    }
    return out + line.substring (done);
}

function og03w6reads (content: string): string {
    if (content.indexOf ('this.Clients') < 0) {
        return content;
    }
    // the owner's own file is hand-written and never passes through the printer
    if (content.indexOf (OWNER_FILE) >= 0) {
        return content;
    }
    const lines = content.split ('\n');
    let ownerSide = false;
    for (let i = 0; i < lines.length; i++) {
        const head = FUNC_HEAD.exec (lines[i]);
        if (head !== null) {
            ownerSide = HANDLER.test (head[1]) || OWNER_SIDE.has (head[1]);
            continue;
        }
        if (ownerSide) {
            continue;
        }
        lines[i] = og03w6line (lines[i]);
    }
    return lines.join ('\n');
}

export function og03w6pass (content: string): string {
    return og03w6reads (content);
}

// the pass has to run inside formatGoSource, not only in its own self-test
export function og03w6Wired (format: (filePath: string, content: string) => string): string[] {
    const src = 'package ccxt\n\nfunc (this *BaseExchange) CleanCache(subscription any) {\n\tvar clients []any = ObjectValues(this.Clients)\n}\n';
    const out = format ('wired.go', src);
    return out.includes ('ObjectValues(this.WsClientsSnapshot())') ? [] : [ 'hx10w6 OG03: not wired into formatGoSource: ' + out ];
}

export function og03w6SelfCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx10w6-OG03: ' + message); } };
    const user = (body: string) => og03w6pass ('func (this *X) watchTradesBody(ch chan any, url any) {\n' + body + '}\n');
    const handler = (body: string) => og03w6pass ('func (this *X) HandleOrderBook(client any, message any) {\n' + body + '}\n');
    const walk = '\t\t\tvar clients []any = ObjectValues(this.Clients)\n\t\t\tfor i := 0; i < len(clients); i++ {\n\t\t\t}\n';
    const rewritten = og03w6pass ('func (this *BaseExchange) CleanCache(subscription any) {\n' + walk + '}\n');
    ok (rewritten.indexOf ('ObjectValues(this.WsClientsSnapshot())') >= 0, 'the registry walk reads the owner copy');
    ok (rewritten.indexOf ('ObjectValues(this.Clients)') < 0, 'the field read is gone');
    ok (rewritten.indexOf ('var clients []any = ObjectValues(') >= 0, 'the helper call shape survives');
    const indexed = user ('\tif _, ok := this.Clients[url]; (this.Clients != nil) && ok {\n\t}\n');
    ok (indexed.indexOf ('this.WsClientsSnapshot()[url]') >= 0, 'an indexed read asks the owner too');
    const safe = user ('\tvar client any = this.SafeValue(this.Clients, url)\n');
    ok (safe.indexOf ('this.SafeValue(this.WsClientsSnapshot(), url)') >= 0, 'a single-key read uses the copy');
    // a drop cannot run on a copy: it becomes the owner's delete op, argument untouched
    const drop = user ('\t\tccxt.Remove(this.Clients, url)\n');
    ok (drop.indexOf ('\t\tthis.WsClientRemove(url)\n') >= 0, 'a drop is the owner op');
    ok (drop.indexOf ('Remove(this.Clients') < 0, 'no Remove on the registry survives');
    const dropCall = user ('\tccxt.Remove(this.Clients, client.(ccxt.ClientInterface).GetUrl())\n');
    ok (dropCall.indexOf ('this.WsClientRemove(client.(ccxt.ClientInterface).GetUrl())') >= 0, 'a computed url is passed through');
    // handler code runs on the loop: an owner request there would wait on itself
    const handled = handler ('\tccxt.Remove(this.Clients, url)\n\tvar all []any = ccxt.ObjectValues(this.Clients)\n');
    ok (handled.indexOf ('\tccxt.Remove(this.Clients, url)') >= 0, 'a handler keeps the direct drop');
    ok (handled.indexOf ('ccxt.ObjectValues(this.Clients)') >= 0, 'a handler keeps the direct read');
    const helper = og03w6pass ('func (this *X) IsOrderBookDeltaInSequence(client any, message any) {\n\tccxt.Remove(this.Clients, url)\n}\n');
    ok (helper.indexOf ('ccxt.Remove(this.Clients, url)') >= 0, 'a handler helper keeps the direct drop');
    const quoted = user ('\t// this.Clients stays on the loop\n\tpanic("this.Clients")\n');
    ok (quoted.indexOf ('// this.Clients stays on the loop') >= 0, 'a comment is left alone');
    ok (quoted.indexOf ('panic("this.Clients")') >= 0, 'a string is left alone');
    const init = og03w6pass ('func (this *BaseExchange) InitParent() {\n\tthis.Clients = make(map[string]any)\n}\n');
    ok (init.indexOf ('this.Clients = make(map[string]any)') >= 0, 'an assignment to the field is left alone');
    const owner = 'func (this *BaseExchange) wsClientsApply(req *wsCacheOp) any {\n\tthis.Clients = next\n}\n';
    ok (og03w6pass (owner) === owner, "the owner's own file is untouched");
    const other = user ('\tthis.ClientsById = 1\n');
    ok (other.indexOf ('this.ClientsById = 1') >= 0, 'a longer field name is not a match');
    ok (og03w6pass (rewritten) === rewritten, 'a second pass changes nothing');
    return problems;
}
