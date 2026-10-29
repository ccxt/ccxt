// ===== hx10w9 GP18: an implicit-endpoint receive reads its typed view, not MapTyped(Raw) =====
// A bound `rN := <-this.<Stub>(...)` on an implicit endpoint carries EndpointResult[T]: the stub's
// channel names T from the declared response shape, Fetch2Result fills
// `Value: endpointValue[T](Raw), Raw: Raw`, and endpointValue[T] IS MapTyped(Raw) for
// T=map[string]any (ListTyped(Raw) for []any). `MapTyped(rN.Raw)` on such a receive reads the very
// same map one helper call shorter: `rN.Value`. The table is per receiver, read off the *_api.go
// signatures (the channel type is generated there, never in the venue file).
// Fail closed: a stub the table does not prove, another receiver's method of the same name, a
// rebound receive, or any other read of rN.Raw keeps the shipped conversion.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { goChanMask } from './go-chan.js';

export type Gp18Stubs = Map<string, string>;

// `<Receiver>.<Method>` -> EndpointResult element, from the generated implicit-API stub line
const GP18_SIG = /^(?:\/\/ \w+ returns a channel that yields [^\n]*\n)?func \(this \*(\w+)\) (\w+)\(args \.\.\.any\) <-chan (?:ccxt\.)?EndpointResult\[(.+)\] \{$/gm;
const GP18_ELEMENTS = [ 'map[string]any', '[]any' ];
const GP18_CONVERSION: { [conversion: string]: string } = { 'MapTyped': 'map[string]any', 'ListTyped': '[]any' };
const GP18_READ = /(?:ccxt\.)?(MapTyped|ListTyped)\((r\d*)\.Raw\)/g;
const GP18_USES = /(?<![\w.])(r\d*)\.(?:Raw|Value)\b/g;

let GP18_TABLE: Gp18Stubs | undefined = undefined;

export function gp18SetTableForTest (table: Gp18Stubs | undefined) {
    GP18_TABLE = table;
}

export function gp18StubTable (dirs?: string[]): Gp18Stubs {
    if ((dirs === undefined) && (GP18_TABLE !== undefined)) {
        return GP18_TABLE;
    }
    const root = path.join (path.dirname (fileURLToPath (import.meta.url)), '..', 'go', 'v4');
    const scan = dirs ?? [ root, path.join (root, 'prediction') ];
    const collected = new Map<string, string | null> ();
    for (const dir of scan) {
        if (!fs.existsSync (dir)) {
            continue;
        }
        for (const file of fs.readdirSync (dir).filter ((f) => f.endsWith ('_api.go'))) {
            const text = fs.readFileSync (path.join (dir, file), 'utf8');
            for (let m = GP18_SIG.exec (text); m !== null; m = GP18_SIG.exec (text)) {
                const element = GP18_ELEMENTS.find ((e) => (e === m[3].trim ()));
                if (element === undefined) {
                    continue;
                }
                const key = m[1] + '.' + m[2];
                const seen = collected.get (key);
                collected.set (key, (seen === undefined) ? element : ((seen === element) ? element : null));
            }
        }
    }
    const table: Gp18Stubs = new Map ();
    for (const [ key, element ] of collected) {
        if (element !== null) {
            table.set (key, element);
        }
    }
    if (dirs === undefined) {
        GP18_TABLE = table;
    }
    return table;
}

// per-name occurrence counts of `re`'s capture `group` (`GP18_USES` names the variable first,
// `GP18_READ` the conversion)
function gp18Count (body: string[], re: RegExp, group: number): Map<string, number> {
    const out = new Map<string, number> ();
    for (const line of body) {
        for (const m of line.matchAll (new RegExp (re.source, 'g'))) {
            const name = m[group];
            out.set (name, (out.get (name) ?? 0) + 1);
        }
    }
    return out;
}

/** `MapTyped(rN.Raw)` -> `rN.Value` on a receive from a proven EndpointResult[T] stub. */
export function gp18Pass (content: string, table?: Gp18Stubs): string {
    if (!GP18_READ.test (content)) {
        GP18_READ.lastIndex = 0;
        return content;
    }
    GP18_READ.lastIndex = 0;
    const stubs = table ?? gp18StubTable ();
    if (stubs.size === 0) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = goChanMask (content).split ('\n');
    if (masked.length !== lines.length) {
        return content;
    }
    let changed = false;
    for (let i = 0; i < masked.length; i++) {
        const head = /^func \(this \*(\w+)\) \w+\(/.exec (masked[i]);
        if (head === null) {
            continue;
        }
        let end = masked.length - 1;
        for (let j = i + 1; j < masked.length; j++) {
            if (/^\}/.test (masked[j])) {
                end = j;
                break;
            }
        }
        const body = masked.slice (i + 1, end);
        if (!body.some ((line) => GP18_READ.test (line))) {
            GP18_READ.lastIndex = 0;
            i = end;
            continue;
        }
        GP18_READ.lastIndex = 0;
        // a func literal that takes another receiver (`func(this *Y) { … }(this)`) shares this text,
        // and its receives resolve against that type: keep the whole body's conversions boxed
        if (body.some ((line) => {
            const inner = /^\s*func\s*\(this \*(\w+)\)/.exec (line);
            return (inner !== null) && (inner[1] !== head[1]);
        })) {
            i = end;
            continue;
        }
        // `rN := <-this.<Stub>(` binds once; any other assignment of the name rejects it
        const bindings = new Map<string, { method: string, count: number }> ();
        const writes = new Map<string, number> ();
        for (const line of body) {
            const bind = /^\s*(\w+) := <-this\.(\w+)\(/.exec (line);
            if (bind !== null) {
                const seen = bindings.get (bind[1]);
                bindings.set (bind[1], { 'method': (seen === undefined) ? bind[2] : seen.method, 'count': (seen?.count ?? 0) + 1 });
                continue;
            }
            const write = /^\s*(\w+) = <-/.exec (line) ?? /^\s*(\w+) := /.exec (line);
            if (write !== null) {
                writes.set (write[1], (writes.get (write[1]) ?? 0) + 1);
            }
        }
        const reads = gp18Count (body, GP18_USES, 1);
        const conversions = gp18Count (body, GP18_READ, 2);
        const unboxable = (name: string, conversion: string): boolean => {
            const bind = bindings.get (name);
            if ((bind === undefined) || (bind.count !== 1) || ((writes.get (name) ?? 0) !== 0)) {
                return false;
            }
            if ((reads.get (name) ?? 0) !== (conversions.get (name) ?? 0)) {
                return false;
            }
            const element = stubs.get (head[1] + '.' + bind.method);
            return (element !== undefined) && (element === GP18_CONVERSION[conversion]);
        };
        for (let j = i + 1; j < end; j++) {
            if (!GP18_READ.test (masked[j])) {
                GP18_READ.lastIndex = 0;
                continue;
            }
            GP18_READ.lastIndex = 0;
            const replaced = lines[j].replace (new RegExp (GP18_READ.source, 'g'), (all: string, conversion: string, name: string) => {
                return unboxable (name, conversion) ? (name + '.Value') : all;
            });
            if (replaced !== lines[j]) {
                lines[j] = replaced;
                changed = true;
            }
        }
        i = end;
    }
    const out = changed ? lines.join ('\n') : content;
    return out;
}

function gp18Run (content: string, table: Gp18Stubs): string {
    return gp18Pass (content, table);
}

export function hx10w9Gp18SelfTest (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, what: string) => {
        if (!condition) {
            problems.push ('hx10w9 GP18: ' + what);
        }
    };
    const core = (body: string, header = 'package ccxt') => header + '\n\nfunc (this *X) fetchOrderBody(id any) any {\n' + body + '\treturn nil\n}\n';
    const bind = '\tr1 := <-this.PrivateGetOrdersId(id)\n\tif r1.Err != nil {\n\t\tpanic(r1.Err)\n\t}\n';
    const mapStub: Gp18Stubs = new Map ([ [ 'X.PrivateGetOrdersId', 'map[string]any' ] ]);
    const listStub: Gp18Stubs = new Map ([ [ 'X.PrivateGetOrdersId', '[]any' ] ]);

    const decl = gp18Run (core (bind + '\tvar response map[string]any = MapTyped(r1.Raw)\n'), mapStub);
    ok (decl.includes ('\tvar response map[string]any = r1.Value\n'), 'typed receive unboxes: ' + decl);
    const assign = gp18Run (core (bind + '\tvar response map[string]any = nil\n\tresponse = MapTyped(r1.Raw)\n'), mapStub);
    ok (assign.includes ('\tresponse = r1.Value\n'), 'plain assignment unboxes: ' + assign);
    const qualified = gp18Run (core (bind + '\tvar response map[string]any = ccxt.MapTyped(r1.Raw)\n', 'package ccxtprediction'), mapStub);
    ok (qualified.includes ('\tvar response map[string]any = r1.Value\n'), 'ccxt-qualified conversion unboxes: ' + qualified);

    ok (gp18Run (core (bind + '\tvar response map[string]any = ListTyped(r1.Raw)\n'), mapStub) === core (bind + '\tvar response map[string]any = ListTyped(r1.Raw)\n'), 'Mismatched conversion keeps the helper');
    ok (gp18Run (core (bind + '\tvar response map[string]any = MapTyped(r1.Raw)\n'), new Map ()) === core (bind + '\tvar response map[string]any = MapTyped(r1.Raw)\n'), 'unproven stub keeps the helper');
    ok (gp18Run (core (bind + '\tvar response map[string]any = MapTyped(r1.Raw)\n'), new Map ([ [ 'Y.PrivateGetOrdersId', 'map[string]any' ] ])).includes ('MapTyped(r1.Raw)'), 'another receiver keeps the helper');

    const listRead = gp18Run (core (bind + '\tvar rows []any = ListTyped(r1.Raw)\n'), listStub);
    ok (listRead.includes ('\tvar rows []any = r1.Value\n'), 'list endpoint unboxes: ' + listRead);

    const otherRead = gp18Run (core (bind + '\tvar response map[string]any = MapTyped(r1.Raw)\n\tvar raw any = r1.Raw\n'), mapStub);
    ok (otherRead.includes ('MapTyped(r1.Raw)'), 'a second read of Raw keeps the helper: ' + otherRead);
    const rebound = gp18Run (core (bind + '\tr1 = <-this.Other(id)\n\tvar response map[string]any = MapTyped(r1.Raw)\n'), mapStub);
    ok (rebound.includes ('MapTyped(r1.Raw)'), 'a rebound receive keeps the helper: ' + rebound);
    const secondBind = gp18Run (core (bind + '\tr1 := <-this.Other(id)\n\tvar response map[string]any = MapTyped(r1.Raw)\n'), mapStub);
    ok (secondBind.includes ('MapTyped(r1.Raw)'), 'a twice-bound name keeps the helper: ' + secondBind);
    const unrelated = gp18Run (core (bind + '\tvar response map[string]any = MapTyped(response2)\n'), mapStub);
    ok (unrelated.includes ('MapTyped(response2)'), 'a non-receive conversion is untouched: ' + unrelated);
    return problems;
}
