// hx10 w7 OG06: the ws path's `resolved` map coercion prints a `case *sync.Map:` arm that boxes
// through SafeMapToMap. Where the producer's own Go body can only yield map[string]any, []any or
// nil, that arm is unreachable, so it goes and the helper call goes with it.
// Proven at this base (go/v4/exchange_generated.go, BaseExchange, no venue override): FilterByArray
// and FilterOutByArray return this.IndexBy(..) (map[string]any) or []any; CreateOHLCVObject returns
// a map[string]any local; WsCacheSnapshot is declared map[string]any. Every other producer keeps its
// arm byte for byte, because IndexBySafe (*sync.Map) or a boxed field can still reach it.

const SWITCH_HEAD = /^(\s*)switch (\w+) := (.+)\.\(type\) \{$/;
const VAR_HEAD = /^(\s*)var (\w+) map\[string\]any$/;
// a producer whose Go body cannot yield a *sync.Map
const PROVEN_CALL = /^(?:ccxt\.)?this\.(?:CreateOHLCVObject|FilterByArray|FilterOutByArray)\(/;
// WsCacheSnapshot is declared to return map[string]any, so this box holds a map
const PROVEN_SNAPSHOT = /^any\((?:ccxt\.)?this\.WsCacheSnapshot\([^\n]*\)\)$/;

// one `case *sync.Map:` arm of the resolved map coercion: its body, its sibling cases, its panic
function og06ArmAt (lines: string[], i: number, ind: string, box: string, v: string): boolean {
    const at = (k: number): string => lines[k] ?? '';
    if (at (i) !== ind + 'case *sync.Map:') {
        return false;
    }
    const body = at (i + 1);
    if ((body !== ind + '\t' + v + ' = SafeMapToMap(' + box + ')') && (body !== ind + '\t' + v + ' = ccxt.SafeMapToMap(' + box + ')')) {
        return false;
    }
    if ((at (i - 2) !== ind + 'case map[string]any:') || (at (i - 1) !== ind + '\t' + v + ' = ' + box)) {
        return false;
    }
    if ((at (i + 2) !== ind + 'case nil:') || (at (i + 3) !== ind + 'default:')) {
        return false;
    }
    return /^\s+panic\((?:ccxt\.)?ExchangeError\("resolved value is not map\[string\]any"\)\)$/.test (at (i + 4));
}

// drop the `case *sync.Map:` arm of every resolved map coercion whose producer is proven
export function og06SyncMapArmsPass (content: string): string {
    const lines = content.split ('\n');
    const out: string[] = [];
    let dropped = 0;
    let i = 0;
    while (i < lines.length) {
        const head = SWITCH_HEAD.exec (lines[i]);
        const decl = ((head !== null) && (i > 0)) ? VAR_HEAD.exec (lines[i - 1]) : null;
        if ((head !== null) && (decl !== null)) {
            const ind = head[1];
            const box = head[2];
            const expr = head[3];
            const v = decl[2];
            const proven = PROVEN_CALL.test (expr) || PROVEN_SNAPSHOT.test (expr);
            if ((decl[1] === ind) && (box === v + 'Box') && proven) {
                let end = i + 1;
                while ((end < lines.length) && (lines[end] !== ind + '}')) {
                    end++;
                }
                let arm = -1;
                for (let k = i + 1; (arm < 0) && (k < end) && (k < lines.length); k++) {
                    if (og06ArmAt (lines, k, ind, box, v)) {
                        arm = k;
                    }
                }
                if (arm >= 0) {
                    // the declaration was emitted by the previous iteration; keep the switch only
                    out.push (...lines.slice (i, arm));
                    out.push (...lines.slice (arm + 2, end + 1));
                    dropped++;
                    i = end + 1;
                    continue;
                }
            }
        }
        out.push (lines[i]);
        i++;
    }
    if (dropped === 0) {
        return content;
    }
    const text = out.join ('\n');
    const code = text.replace (/\/\*[\s\S]*?\*\//g, ' ').replace (/\/\/[^\n]*/g, ' ');
    if (/\bsync\./.test (code)) {
        return text;
    }
    // the chan3 emitter only added the standalone import for the arm that just went
    return text.replace (/^import "sync"\n/m, '');
}

// a map coercion of the shape the printer emits, so the self-test reads like the generated file
function og06Block (q: string, expr: string, tail: string, opts: { ind?: string, arm?: string, want?: string, panic?: string } = {}): string {
    const ind = opts.ind ?? '\t';
    const want = opts.want ?? 'map[string]any';
    const arm = opts.arm ?? (ind + 'case *sync.Map:\n' + ind + '\tresolved = ' + q + 'SafeMapToMap(resolvedBox)\n');
    const panic = opts.panic ?? 'resolved value is not ' + want;
    return 'package ccxt\n\nimport ccxt "x"\nimport "sync"\n\n'
        + 'func (this *X) F() any {\n'
        + ind + 'var resolved ' + want + '\n'
        + ind + 'switch resolvedBox := ' + expr + '.(type) {\n'
        + ind + 'case ' + want + ':\n'
        + ind + '\tresolved = resolvedBox\n'
        + arm
        + ind + 'case nil:\n'
        + ind + 'default:\n'
        + ind + '\tpanic(' + q + 'ExchangeError("' + panic + '"))\n'
        + ind + '}\n'
        + ind + 'return resolved\n'
        + tail
        + '}\n';
}

export function og06SelfCheck (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, message: string): void => {
        if (!cond) {
            problems.push ('hx10 wave-7 OG06: ' + message);
        }
    };
    const run = (s: string): string => {
        try {
            return og06SyncMapArmsPass (s);
        } catch (e: any) {
            problems.push ('hx10 wave-7 OG06 threw: ' + e.message);
            return s;
        }
    };
    ok (typeof og06SyncMapArmsPass ('') === 'string', 'the pass is total');
    const keptOrder = '\tcase map[string]any:\n\t\tresolved = resolvedBox\n\tcase nil:\n\tdefault:\n';
    for (const q of [ 'ccxt.', '' ]) {
        const filter = run (og06Block (q, 'this.FilterByArray(this.WsCacheSnapshot("Tickers"), "symbol", symbolsNormalized)', ''));
        ok (filter.indexOf ('sync.Map') < 0, 'a FilterByArray producer drops the arm (q=' + q + ')');
        ok (filter.indexOf ('SafeMapToMap') < 0, 'the dropped arm leaves no SafeMapToMap call (q=' + q + ')');
        ok (filter.indexOf ('panic(' + q + 'ExchangeError("resolved value is not map[string]any"))') >= 0, 'the panic case survives (q=' + q + ')');
        ok (filter.indexOf (keptOrder) >= 0, 'the map/nil/default cases stay in order (q=' + q + ')');
        ok (filter.indexOf ('import "sync"') < 0, 'the arm was the only sync reference: the import goes too (q=' + q + ')');
        const armless = og06Block (q, 'this.FilterByArray(this.WsCacheSnapshot("Tickers"), "symbol", symbolsNormalized)', '', { arm: '' }).replace ('import "sync"\n', '');
        ok (filter === armless, 'the arm and its import are the only difference (q=' + q + ')');
        ok (filter.split ('var resolved map[string]any').length === 2, 'the declaration is emitted once (q=' + q + ')');
        ok (run (filter) === filter, 'the rewrite is idempotent (q=' + q + ')');
        const ohlcv = run (og06Block (q, 'this.CreateOHLCVObject(symbol, timeframe, filtered)', ''));
        ok (ohlcv.indexOf ('sync.Map') < 0, 'a CreateOHLCVObject producer drops the arm (q=' + q + ')');
        const snapshot = run (og06Block (q, 'any(this.WsCacheSnapshot("Tickers"))', ''));
        ok (snapshot.indexOf ('sync.Map') < 0, 'a bare WsCacheSnapshot map box drops the arm (q=' + q + ')');
        const filteredOut = run (og06Block (q, 'this.FilterOutByArray(tickers, "symbol", symbols)', ''));
        ok (filteredOut.indexOf ('sync.Map') < 0, 'a FilterOutByArray producer drops the arm (q=' + q + ')');
        const nested = run (og06Block (q, 'this.FilterByArray(this.WsCacheSnapshot("Tickers"), "symbol", symbols)', '', { ind: '\t\t' }));
        ok (nested.indexOf ('sync.Map') < 0, 'a nested coercion drops the arm (q=' + q + ')');
        ok (nested.indexOf ('\t\tcase map[string]any:\n\t\t\tresolved = resolvedBox\n\t\tcase nil:') >= 0, 'the nested cases keep their indent (q=' + q + ')');
    }
    const keep = [
        'ccxt.GetValue(tickers, symbolValue)',
        'r1.Value',
        'this.SafeValue(ticker, symbolValue)',
        'this.SafeBalance(balance)',
        'this.SafeDict(response, "data", map[string]any{})',
        'this.Sub.FilterByArray(tickers, "symbol", symbols)',
        'this.FilterByArrayLater(tickers, "symbol", symbols)',
        'this.IndexBySafe(tickers, symbol)',
        'this.FilterByArrayTickers(tickers, "symbol", symbols)',
    ];
    for (const expr of keep) {
        const body = og06Block ('ccxt.', expr, '');
        ok (run (body) === body, 'an unproven producer keeps the arm: ' + expr);
    }
    const mutex = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '\tvar mu sync.Mutex\n\t_ = mu\n');
    ok (run (mutex).indexOf ('import "sync"') >= 0, 'another sync reference keeps the import');
    ok (run (mutex).indexOf ('case *sync.Map:') < 0, 'the arm still goes in a file that reads sync elsewhere');
    const commented = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '\t// sync.Map is handled above\n');
    ok (run (commented).indexOf ('import "sync"') < 0, 'a sync mention in a comment is not a sync reference');
    const foreign = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '').replace ('ccxt.SafeMapToMap(resolvedBox)', 'ccxt.SafeMapToMap(otherBox)');
    ok (run (foreign) === foreign, 'a foreign arm body is untouched');
    const list = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '', { want: '[]any', arm: '\tcase ccxt.IArrayCache:\n\t\tresolved = resolvedBox.ToArray()\n' });
    ok (run (list) === list, 'a []any coercion is not this emitter and keeps its arms');
    const otherBox = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '').replace ('switch resolvedBox :=', 'switch foreignBox :=');
    ok (run (otherBox) === otherBox, 'a switch over a foreign box is untouched');
    const otherPanic = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '', { panic: 'resolved value is not a dict' });
    ok (run (otherPanic) === otherPanic, 'a coercion with another panic text is untouched');
    const noDecl = og06Block ('ccxt.', 'this.FilterByArray(tickers, "symbol", symbols)', '').replace ('\tvar resolved map[string]any\n', '');
    ok (run (noDecl) === noDecl, 'a switch with no resolved declaration is untouched');
    return problems;
}

if (process.argv[1]?.endsWith ('hx10w7-OG06.ts') === true) {
    const problems = og06SelfCheck ();
    if (problems.length > 0) {
        console.log (problems.join ('\n'));
        process.exit (1);
    }
    console.log ('hx10 wave-7 OG06: self-test ok');
}
