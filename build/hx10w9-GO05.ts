// hx10 w9 GO05: the last `case *sync.Map:` arms of the ws resolved-map coercion. No *sync.Map
// producer is left in the Go runtime (SafeMapToMap and the fields that boxed through it are gone,
// go/v4 carries no `sync.Map{` and no `&sync.Map`), so the arm cannot be reached: it goes, its
// SafeMapToMap call goes, and the file's sync import goes when nothing else reads it. Every other
// arm of the coercion (map, nil, the panic default) stays byte for byte.

const GO05_SWITCH = /^(\s*)switch (\w+) := (.+)\.\(type\) \{$/;
const GO05_VAR = /^(\s*)var (\w+) map\[string\]any$/;
const GO05_PANIC = /^\s+panic\((?:ccxt\.)?ExchangeError\("resolved value is not map\[string\]any"\)\)$/;

// `case *sync.Map:` + its single SafeMapToMap body, at the coercion's indent: the end of the arm
// (exclusive), -1 when this is not the arm shape the resolved-map coercion emits
function go05ArmEnd (lines: string[], i: number, ind: string, box: string, v: string): number {
    if ((lines[i] ?? '') !== ind + 'case *sync.Map:') {
        return -1;
    }
    const body = lines[i + 1] ?? '';
    if ((body !== ind + '\t' + v + ' = SafeMapToMap(' + box + ')')
        && (body !== ind + '\t' + v + ' = ccxt.SafeMapToMap(' + box + ')')) {
        return -1;
    }
    return i + 2;
}

// the coercion body has to read like the printer's: map arm, nil arm, panic default
function go05IsCoercion (lines: string[], from: number, to: number, ind: string, box: string, v: string): boolean {
    const body = lines.slice (from, to + 1);
    return body.indexOf (ind + 'case map[string]any:') >= 0
        && body.indexOf (ind + '\t' + v + ' = ' + box) >= 0
        && body.indexOf (ind + 'case nil:') >= 0
        && body.indexOf (ind + 'default:') >= 0
        && body.some ((line) => GO05_PANIC.test (line));
}

// drop the unreachable arm from every resolved-map coercion
export function hx10w9GO05Pass (content: string): string {
    const lines = content.split ('\n');
    const drop = new Set<number> ();
    for (let i = 1; i + 1 < lines.length; i++) {
        const head = GO05_SWITCH.exec (lines[i]);
        if (head === null) {
            continue;
        }
        const decl = GO05_VAR.exec (lines[i - 1]);
        const ind = head[1];
        if ((decl === null) || (decl[1] !== ind)) {
            continue;
        }
        const box = head[2];
        const v = decl[2];
        if (box !== v + 'Box') {
            continue;
        }
        let end = i + 1;
        while ((end < lines.length) && (lines[end] !== ind + '}')) {
            end++;
        }
        if (end >= lines.length) {
            continue;
        }
        if (!go05IsCoercion (lines, i + 1, end, ind, box, v)) {
            continue;
        }
        for (let k = i + 1; k < end; k++) {
            const arm = go05ArmEnd (lines, k, ind, box, v);
            if (arm > 0) {
                drop.add (k);
                drop.add (k + 1);
                k = arm;
            }
        }
        i = end;
    }
    if (drop.size === 0) {
        return content;
    }
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (!drop.has (i)) {
            out.push (lines[i]);
        }
    }
    const text = out.join ('\n');
    const code = text.replace (/\/\*[\s\S]*?\*\//g, ' ').replace (/\/\/[^\n]*/g, ' ');
    if (/\bsync\./.test (code)) {
        return text;
    }
    // the dropped arms were the file's only sync reference
    return text.replace (/^import "sync"\n/m, '');
}

// a coercion of the emitted shape, so the self-check reads like a generated file
function go05Sample (opts: { ind?: string, q?: string, expr?: string, use?: string, extra?: string, arm?: boolean, want?: string } = {}): string {
    const ind = opts.ind ?? '\t';
    const q = opts.q ?? 'ccxt.';
    const want = opts.want ?? 'map[string]any';
    const expr = opts.expr ?? 'r1.Value';
    const use = opts.use ?? 'ch <- ' + q + 'AsyncResult[' + want + ']{Value: resolved}';
    const arm = (opts.arm ?? true)
        ? ind + 'case *sync.Map:\n' + ind + '\tresolved = ' + q + 'SafeMapToMap(resolvedBox)\n'
        : '';
    return 'package ccxt\n\nimport ccxt "x"\nimport "sync"\n\n'
        + 'func (this *X) F() {\n'
        + ind + 'var resolved ' + want + '\n'
        + ind + 'switch resolvedBox := ' + expr + '.(type) {\n'
        + ind + 'case ' + want + ':\n'
        + ind + '\tresolved = resolvedBox\n'
        + arm
        + ind + 'case nil:\n'
        + ind + 'default:\n'
        + ind + '\tpanic(' + q + 'ExchangeError("resolved value is not ' + want + '"))\n'
        + ind + '}\n'
        + ind + use + '\n'
        + (opts.extra ?? '')
        + '}\n';
}

export function hx10w9GO05Check (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, message: string): void => {
        if (!cond) {
            problems.push ('hx10 w9 GO05: ' + message);
        }
    };
    const run = (s: string): string => {
        try {
            return hx10w9GO05Pass (s);
        } catch (e: any) {
            problems.push ('hx10 w9 GO05 threw: ' + e.message);
            return s;
        }
    };
    ok (typeof hx10w9GO05Pass ('') === 'string', 'the pass is total');
    for (const q of [ 'ccxt.', '' ]) {
        const out = run (go05Sample ({ q }));
        ok (out.indexOf ('case *sync.Map:') < 0, 'the arm goes (q=' + q + ')');
        ok (out.indexOf ('SafeMapToMap') < 0, 'no SafeMapToMap call survives (q=' + q + ')');
        ok (out.indexOf ('import "sync"') < 0, 'the arm was the only sync reference: the import goes (q=' + q + ')');
        ok (out.indexOf ('\tcase map[string]any:\n\t\tresolved = resolvedBox\n\tcase nil:\n\tdefault:\n\t\tpanic(' + q + 'ExchangeError("resolved value is not map[string]any"))\n\t}\n') >= 0, 'the map/nil/panic arms stay in order (q=' + q + ')');
        ok (out.indexOf ('ch <- ' + q + 'AsyncResult[map[string]any]{Value: resolved}') >= 0, 'the typed send is untouched (q=' + q + ')');
        ok (run (out) === out, 'the rewrite is idempotent (q=' + q + ')');
        const armless = run (go05Sample ({ q, arm: false }).replace ('import "sync"\n', ''));
        ok (out === armless, 'the arm and its import are the only difference (q=' + q + ')');
        const nested = run (go05Sample ({ q, ind: '\t\t' }));
        ok (nested.indexOf ('\t\tcase *sync.Map:') < 0, 'a nested coercion drops the arm (q=' + q + ')');
        ok (nested.indexOf ('\t\tcase map[string]any:\n\t\t\tresolved = resolvedBox\n\t\tcase nil:') >= 0, 'the nested arms keep their indent (q=' + q + ')');
        // a field coercion the printer wraps in `any(...)`, and a two-level map read
        const field = run (go05Sample ({ q, expr: 'any(this.Options)' }));
        ok (field.indexOf ('case *sync.Map:') < 0, 'a field subject drops the arm (q=' + q + ')');
        const bracket = run (go05Sample ({ q, expr: 'this.Options["leverageBrackets"]' }));
        ok (bracket.indexOf ('case *sync.Map:') < 0, 'a bracket subject drops the arm (q=' + q + ')');
    }
    // a file that still reads sync elsewhere keeps its import
    const mutex = run (go05Sample ({ extra: '\tvar mu sync.Mutex\n\t_ = mu\n' }));
    ok (mutex.indexOf ('import "sync"') >= 0, 'another sync reference keeps the import');
    ok (mutex.indexOf ('case *sync.Map:') < 0, 'the arm still goes in a file that reads sync elsewhere');
    const commented = run (go05Sample ({ extra: '\t// sync.Map is handled above\n' }));
    ok (commented.indexOf ('import "sync"') < 0, 'a sync mention in a comment is not a sync reference');
    // a foreign arm body, a foreign subject and a non-map coercion are not this shape
    const foreign = go05Sample ({}).replace ('ccxt.SafeMapToMap(resolvedBox)', 'ccxt.SafeMapToMap(otherBox)');
    ok (run (foreign) === foreign, 'a foreign arm body is untouched');
    const otherWant = go05Sample ({ want: '[]any' }).replace ('case []any:', 'case []any:').replace ('case *sync.Map:', 'case ccxt.IArrayCache:');
    ok (run (otherWant) === otherWant, 'a []any coercion is untouched');
    const noPanic = go05Sample ({}).replace ('\t\tpanic(ccxt.ExchangeError("resolved value is not map[string]any"))\n', '');
    ok (run (noPanic) === noPanic, 'a switch without the coercion panic is untouched');
    const untyped = 'package ccxt\n\nfunc F(v any) {\n\tvar out any\n\tswitch b := v.(type) {\n\tcase *sync.Map:\n\t\tout = b\n\t}\n\t_ = out\n}\n';
    ok (run (untyped) === untyped, 'an ordinary type switch keeps its arm');
    return problems;
}
