// hx10 w10 GP27: a ws core's resolved-shape coercion moves onto the shared watch channel.
// A tabled ws core whose resolved value is a dictionary or a list coerced `rN.Value` with an
// inline type switch and then sent the local. Watch/WatchMultiple are the only producer of that
// value (hand-written, `args ...any`), so the shape belongs to the channel:
// WatchMap/WatchMultipleMap/WatchList/WatchMultipleList apply the very same switch once and the
// core sends `rN.Value`. Every other coercion (bool, *string, int, a non-watch subject) and every
// receive the pass cannot prove stays byte for byte.

const GP27_VAR = /^(\t+)var (resolved\d*) (map\[string\]any|\[\]any)$/;
const GP27_SWITCH = /^switch (\w+) := (.+)\.\(type\) \{$/;
const GP27_SUBJECT = /^(?:ccxt\.)?(r\d*)\.Value$/;
const GP27_SEND = /^ch <- (?:(ccxt)\.)?AsyncResult\[.*\]\{Value: (.*)\}$/;
const GP27_RECV = /^\t*(r\d*) := <-(?:ccxt\.)?this\.(Watch|WatchMultiple)\(/;

// every body line goChan3 can emit for one want, after GO05 dropped the *sync.Map arm
function gp27Arms (ind: string, v: string, want: string, q: string, spaced: boolean): string[] {
    const box = v + 'Box';
    const arms = [ ind + 'case ' + want + ':', ind + '\t' + v + ' = ' + box ];
    if (want === '[]any') {
        arms.push (ind + 'case ' + q + 'IArrayCache:', ind + '\t' + v + ' = ' + box + (spaced ? '.ToArray ()' : '.ToArray()'));
    }
    arms.push (ind + 'case nil:', ind + 'default:', ind + '\tpanic(' + q + 'ExchangeError("resolved value is not ' + want + '"))');
    return arms;
}

// the two exact arm sequences (the array-cache arm's `.ToArray ()` is the gofmt variant)
function gp27Known (ind: string, v: string, want: string, q: string): string[][] {
    const plain = gp27Arms (ind, v, want, q, false);
    return (want === '[]any') ? [ plain, gp27Arms (ind, v, want, q, true) ] : [ plain ];
}

function gp27Count (text: string, name: string): number {
    return (text.match (new RegExp ('(?<![\\w.])' + name + '(?![\\w])', 'g')) || []).length;
}

interface Gp27Site {
    from: number;        // `var <v> <want>` line
    to: number;          // the switch's closing brace
    recvLine: number;    // the `rN := <-this.Watch*(` line
    sendLine: number;    // the `ch <- …{Value: …<v>…}` line
    v: string;
    rv: string;
    twin: string;
}

function gp27SiteAt (lines: string[], i: number): Gp27Site | undefined {
    const decl = GP27_VAR.exec (lines[i]);
    if (decl === null) {
        return undefined;
    }
    const ind = decl[1];
    const v = decl[2];
    const want = decl[3];
    const headLine = lines[i + 1] ?? '';
    if (!headLine.startsWith (ind) || headLine.startsWith (ind + '\t')) {
        return undefined;
    }
    const head = GP27_SWITCH.exec (headLine.substring (ind.length));
    if ((head === null) || (head[1] !== v + 'Box')) {
        return undefined;
    }
    const subject = GP27_SUBJECT.exec (head[2]);
    if (subject === null) {
        return undefined;
    }
    let end = i + 2;
    while ((end < lines.length) && (lines[end] !== ind + '}')) {
        end++;
    }
    if (end >= lines.length) {
        return undefined;
    }
    const sendLine = lines[end + 1] ?? '';
    const send = (sendLine.startsWith (ind) && !sendLine.startsWith (ind + '\t')) ? GP27_SEND.exec (sendLine.substring (ind.length)) : null;
    if (send === null) {
        return undefined;
    }
    const q = (send[1] !== undefined) ? 'ccxt.' : '';
    const body = lines.slice (i + 2, end);
    if (!gp27Known (ind, v, want, q).some ((arms) => (arms.length === body.length) && arms.every ((line, k) => line === body[k]))) {
        return undefined;
    }
    if (gp27Count (send[2], v) !== 1) {
        return undefined;
    }
    // one binding of rN to a shared watch call, anywhere above it in this function
    let fstart = -1;
    for (let k = i - 1; k >= 0; k--) {
        if (/^func /.test (lines[k])) {
            fstart = k;
            break;
        }
    }
    if (fstart < 0) {
        return undefined;
    }
    let recvLine = -1;
    for (let k = fstart; k < i; k++) {
        const recv = GP27_RECV.exec (lines[k]);
        if ((recv === null) || (recv[1] !== subject[1])) {
            continue;
        }
        if (recvLine >= 0) {
            return undefined;   // bound twice: fail closed
        }
        recvLine = k;
    }
    if (recvLine < 0) {
        return undefined;
    }
    let fend = lines.length;
    for (let k = i + 1; k < lines.length; k++) {
        if (/^}/.test (lines[k])) {
            fend = k;
            break;
        }
    }
    // the local: written only inside the coercion and read only by the send (string literals are
    // masked so a message spelling the name does not count as a read)
    const mask = (text: string): string => text.replace (/"[^"\n]*"/g, '""');
    const inBlock = gp27Count (mask (lines.slice (i, end + 1).join ('\n')), v);
    const scope = mask (lines.slice (fstart, fend).join ('\n'));
    if (gp27Count (scope, v) !== (inBlock + 1)) {
        return undefined;
    }
    const recv = GP27_RECV.exec (lines[recvLine]) as RegExpExecArray;
    return {
        'from': i,
        'to': end,
        'recvLine': recvLine,
        'sendLine': end + 1,
        'v': v,
        'rv': subject[1],
        'twin': recv[2] + ((want === 'map[string]any') ? 'Map' : 'List'),
    };
}

/** `var resolved T` + switch + send over a shared watch receive -> the typed twin + `rN.Value`. */
export function hx10w10GP27Pass (content: string): string {
    if ((content.indexOf ('var resolved') < 0) || (content.indexOf ('this.Watch') < 0)) {
        return content;
    }
    const lines = content.split ('\n');
    const sites: Gp27Site[] = [];
    for (let i = 0; i < lines.length; i++) {
        const site = gp27SiteAt (lines, i);
        if (site !== undefined) {
            sites.push (site);
            i = site.to + 1;
        }
    }
    if (sites.length === 0) {
        return content;
    }
    const drop = new Set<number> ();
    const edit = new Map<number, string> ();
    for (const site of sites) {
        const recv = GP27_RECV.exec (lines[site.recvLine]) as RegExpExecArray;
        edit.set (site.recvLine, lines[site.recvLine].replace ('.' + recv[2] + '(', '.' + site.twin + '('));
        edit.set (site.sendLine, lines[site.sendLine].replace (new RegExp ('(?<![\\w.])' + site.v + '(?![\\w])'), site.rv + '.Value'));
        for (let k = site.from; k <= site.to; k++) {
            drop.add (k);
        }
    }
    const out: string[] = [];
    for (let k = 0; k < lines.length; k++) {
        if (drop.has (k)) {
            continue;
        }
        out.push (edit.get (k) ?? lines[k]);
    }
    return out.join ('\n');
}

// a core of the emitted shape, so the self-check reads like a generated file
function gp27Sample (opts: { ind?: string, q?: string, want?: string, recv?: string, send?: string, extra?: string } = {}): string {
    const ind = opts.ind ?? '\t';
    const q = opts.q ?? 'ccxt.';
    const want = opts.want ?? 'map[string]any';
    const recv = opts.recv ?? 'WatchMultiple';
    const send = opts.send ?? ('ch <- ' + q + 'AsyncResult[' + want + ']{Value: resolved}');
    const arms = (want === '[]any')
        ? ind + 'case []any:\n' + ind + '\tresolved = resolvedBox\n' + ind + 'case ' + q + 'IArrayCache:\n' + ind + '\tresolved = resolvedBox.ToArray()\n'
        : ind + 'case map[string]any:\n' + ind + '\tresolved = resolvedBox\n';
    return 'package ccxt\n\nimport ccxt "x"\n\n'
        + 'func (this *X) Body(ch chan ' + q + 'AsyncResult[' + want + ']) any {\n'
        + ind + 'r1 := <-this.' + recv + '(url)\n'
        + ind + 'if r1.Err != nil {\n'
        + ind + '\tpanic(r1.Err)\n'
        + ind + '}\n'
        + ind + 'var resolved ' + want + '\n'
        + ind + 'switch resolvedBox := r1.Value.(type) {\n'
        + arms
        + ind + 'case nil:\n'
        + ind + 'default:\n'
        + ind + '\tpanic(' + q + 'ExchangeError("resolved value is not ' + want + '"))\n'
        + ind + '}\n'
        + ind + send + '\n'
        + (opts.extra ?? '')
        + ind + 'return nil\n'
        + '}\n';
}

export function hx10w10GP27Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, message: string): void => {
        if (!cond) {
            problems.push ('hx10 w10 GP27: ' + message);
        }
    };
    const run = (s: string): string => {
        try {
            return hx10w10GP27Pass (s);
        } catch (e: any) {
            problems.push ('hx10 w10 GP27 threw: ' + e.message);
            return s;
        }
    };
    ok (typeof hx10w10GP27Pass ('') === 'string', 'the pass is total');
    for (const q of [ 'ccxt.', '' ]) {
        for (const recv of [ 'Watch', 'WatchMultiple' ]) {
            const map = run (gp27Sample ({ q, recv }));
            ok (map.indexOf ('var resolved') < 0, 'the map coercion goes (q=' + q + ', ' + recv + '): ' + map);
            ok (map.indexOf ('switch resolvedBox') < 0, 'its switch goes (q=' + q + ', ' + recv + ')');
            ok (map.indexOf ('<-this.' + recv + 'Map(url)') >= 0, 'the receive reads ' + recv + 'Map (q=' + q + ')');
            ok (map.indexOf ('ch <- ' + q + 'AsyncResult[map[string]any]{Value: r1.Value}') >= 0, 'the send reads r1.Value (q=' + q + ', ' + recv + ')');
            ok (map.indexOf ('panic(r1.Err)') >= 0, 'the error check survives (q=' + q + ', ' + recv + ')');
            ok (run (map) === map, 'the rewrite is idempotent (q=' + q + ', ' + recv + ')');
            const list = run (gp27Sample ({ q, recv, want: '[]any' }));
            ok (list.indexOf ('<-this.' + recv + 'List(url)') >= 0, 'a list core reads ' + recv + 'List (q=' + q + ')');
            ok (list.indexOf ('IArrayCache') < 0, 'the array-cache arm goes with the switch (q=' + q + ')');
            ok (list.indexOf ('Value: r1.Value') >= 0, 'the list send reads r1.Value (q=' + q + ')');
        }
    }
    // a send that wraps the local (the struct-list pass) keeps its wrapper
    const wrapped = run (gp27Sample ({ q: 'ccxt.', want: '[]any', send: 'ch <- ccxt.AsyncResult[[]ccxt.OHLCV]{Value: ccxt.OHLCVsFromList(resolved)}' }));
    ok (wrapped.indexOf ('ccxt.OHLCVsFromList(r1.Value)') >= 0, 'a wrapped send keeps its conversion: ' + wrapped);
    // a nested coercion keeps its indent and the receive above it
    const nested = run (gp27Sample ({ q: 'ccxt.', ind: '\t\t' }));
    ok (nested.indexOf ('\t\tr1 := <-this.WatchMultipleMap(url)') >= 0, 'a nested receive is renamed: ' + nested);
    ok (nested.indexOf ('\t\tch <- ccxt.AsyncResult[map[string]any]{Value: r1.Value}') >= 0, 'a nested send keeps its indent: ' + nested);
    // fail closed on everything the pass cannot prove
    const boolWant = gp27Sample ({ send: 'ch <- ccxt.AsyncResult[bool]{Value: resolved}' }).replace (/map\[string\]any/g, 'bool');
    ok (run (boolWant) === boolWant, 'a bool coercion is untouched');
    const foreignSubject = gp27Sample ({}).replace ('r1.Value.(type)', 'data.(type)');
    ok (run (foreignSubject) === foreignSubject, 'a non-watch subject is untouched');
    const usedLater = gp27Sample ({ extra: '\t_ = resolved\n' });
    ok (run (usedLater) === usedLater, 'a local read elsewhere is untouched');
    const twoSends = gp27Sample ({ extra: '\tch <- ccxt.AsyncResult[map[string]any]{Value: resolved}\n' });
    ok (run (twoSends) === twoSends, 'two sends are untouched');
    const noRecv = gp27Sample ({}).replace ('r1 := <-this.WatchMultiple(url)', 'r1 := <-this.Call(url)');
    ok (run (noRecv) === noRecv, 'a non-watch receive is untouched');
    const rebind = gp27Sample ({}).replace ('\tif r1.Err != nil', '\tr1 := <-this.WatchMultiple(url2)\n\tif r1.Err != nil');
    ok (run (rebind) === rebind, 'a twice-bound receive is untouched');
    const otherArm = gp27Sample ({}).replace ('\tcase map[string]any:', '\tcase map[string]interface{}:');
    ok (run (otherArm) === otherArm, 'a foreign arm shape is untouched');
    return problems;
}
