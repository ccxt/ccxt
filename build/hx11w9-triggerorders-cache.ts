// HX11 w9: BaseExchange.TriggerOrders is a typed list cache (WsArrayCache, like Orders).
// The printed `var x any = func() any { if c { return this.TriggerOrders }; return this.Orders }()` keeps its
// closure; only its result type becomes WsArrayCache, and the Append assertion on the typed local goes.
import { goChanMask } from './go-chan.js';

const OPEN = /^(\s*)var (\w+) any = func\(\) any \{$/;
const RETURN = /^\s*return (this\.TriggerOrders|this\.Orders)$/;
const esc = (name: string): string => name.replace (/[.*+?^${}()|[\]\\]/g, '\\$&');

export function hx11w9TriggerOrdersCachePass (content: string): string {
    if (content.indexOf ('this.TriggerOrders') < 0) {
        return content;
    }
    const q = /^package ccxt\s*$/m.test (content) ? '' : 'ccxt.';
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    for (let k = 0; k < lines.length; k++) {
        const open = OPEN.exec (masked[k]);
        if (open === null) {
            continue;
        }
        const indent = open[1];
        let end = -1;
        for (let j = k + 1; j < lines.length; j++) {
            if (masked[j] === indent + '}()') {
                end = j;
                break;
            }
            if (lines[j].startsWith ('func ')) {
                break;
            }
        }
        if (end < 0) {
            continue;
        }
        // the closure only branches between the two caches
        let returns = 0;
        let sawTrigger = false;
        let shapeOk = true;
        for (let j = k + 1; j < end; j++) {
            const ret = RETURN.exec (masked[j]);
            if (ret !== null) {
                returns++;
                sawTrigger = sawTrigger || (ret[1] === 'this.TriggerOrders');
            } else if (!/^\s*(?:if [^{]*\{|\})$/.test (masked[j])) {
                shapeOk = false;
            }
        }
        if (!shapeOk || !sawTrigger || (returns < 2)) {
            continue;
        }
        const name = open[2];
        const n = esc (name);
        let funcEnd = end;
        while ((funcEnd < lines.length) && (masked[funcEnd] !== '}')) {
            funcEnd++;
        }
        const text = masked.slice (end + 1, funcEnd).join ('\n');
        const rebinding = new RegExp ('(?<![\\w.])' + n + '\\s*(?:,\\s*\\w+\\s*)*:?=(?!=)|(?<![\\w.])var ' + n + '\\b|&\\s*' + n + '\\b|func\\([^)]*\\b' + n + '\\b');
        const otherType = new RegExp ('(?<![\\w.])' + n + '\\.\\((?!(?:ccxt\\.)?Appender\\)|\\*ccxt\\.ArrayCache\\))');
        if (rebinding.test (text) || otherType.test (text)) {
            continue;
        }
        lines[k] = lines[k].replace (' any = func() any {', ' ' + q + 'WsArrayCache = func() ' + q + 'WsArrayCache {');
        const append = new RegExp ('(?<![\\w.])(' + n + ')\\.\\((?:ccxt\\.)?Appender\\)\\.Append\\(', 'g');
        for (let j = end + 1; j < funcEnd; j++) {
            lines[j] = lines[j].replace (append, '$1.Append(');
        }
    }
    return lines.join ('\n');
}

export function hx11w9TriggerOrdersCacheCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, message: string) => { if (!condition) { problems.push ('hx11w9-triggerorders-cache: ' + message); } };
    const wrap = (body: string) => 'package ccxtpro\n\nfunc (this *X) HandleOrder(client any, message map[string]any) {\n' + body + '}\n';
    const closure = (name: string) => [
        '\tvar ' + name + ' any = func() any {',
        '\t\tif isTrigger {',
        '\t\t\treturn this.TriggerOrders',
        '\t\t}',
        '\t\treturn this.Orders',
        '\t}()',
    ];
    const out = hx11w9TriggerOrdersCachePass (wrap (closure ('stored').concat ([
        '\tstored.(ccxt.Appender).Append(order)',
        '\tclient.(ccxt.ClientInterface).Resolve(stored, messageHash)',
        '',
    ]).join ('\n')));
    for (const want of [ 'var stored ccxt.WsArrayCache = func() ccxt.WsArrayCache {', '\tstored.Append(order)', 'Resolve(stored, messageHash)' ]) {
        ok (out.indexOf (want) >= 0, 'missing ' + want + ' in ' + out);
    }
    ok (out.indexOf ('Appender') < 0, 'an assertion is left: ' + out);
    const hashmap = hx11w9TriggerOrdersCachePass (wrap (closure ('c').concat ([ '\tvar h map[string]any = c.(*ccxt.ArrayCache).Hashmap', '' ]).join ('\n')));
    ok (hashmap.indexOf ('c.(*ccxt.ArrayCache).Hashmap') >= 0 && hashmap.indexOf ('var c ccxt.WsArrayCache') >= 0, 'the existing Hashmap assertion stays: ' + hashmap);
    const mixed = hx11w9TriggerOrdersCachePass (wrap (closure ('c').concat ([ '\tc = message', '' ]).join ('\n')));
    ok (mixed.indexOf ('var c any = func() any {') >= 0, 'a rebound local stays any: ' + mixed);
    const other = hx11w9TriggerOrdersCachePass (wrap (closure ('c').concat ([ '\tvar m map[string]any = c.(map[string]any)', '' ]).join ('\n')));
    ok (other.indexOf ('var c any = func() any {') >= 0, 'a local asserted to a map stays any: ' + other);
    const foreign = hx11w9TriggerOrdersCachePass (wrap ('\tvar c any = func() any {\n\t\tif t {\n\t\t\treturn this.Trades\n\t\t}\n\t\treturn this.Orders\n\t}()\n\tvar _ = this.TriggerOrders\n'));
    ok (foreign.indexOf ('var c any = func() any {') >= 0, 'a closure over another field stays any: ' + foreign);
    return problems;
}
