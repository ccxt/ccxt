// hx10w9 RP02 — dynamic dispatch for a method whose parameter prints as a native
// map (`&mut IndexMap<String, Value>`). The dispatcher receives `Value`s, so it
// hands the method an owned map copy built from the argument; every other kind of
// parameter keeps the shape it had.

const MAP_PARAM_RE = /:\s*&mut\s+indexmap::IndexMap<String, Value>/;

/** `'map'` for a printed native-map parameter, undefined for any other shape. */
export function hx10w9Rp02ParamKind(printedParam: string): 'map' | undefined {
    return MAP_PARAM_RE.test(printedParam) ? 'map' : undefined;
}

/** Dispatch argument for a native-map parameter (position `index` in `args`).
 *  The temp is built on the arm's own line: the whole expression on one line
 *  pushes a generated dispatch arm past the 400-char census limit. */
export function hx10w9Rp02DispatchArg(index: number): string {
    return `&mut { let mut __m = args.get(${index}).cloned().unwrap_or_default().as_map().cloned().unwrap_or_default();\n                    __m }`;
}

/** Split a printed parameter list on top-level commas: a generic argument list
 *  (`IndexMap<String, Value>`) carries its own. */
export function hx10w9Rp02SplitArgs(argList: string): string[] {
    return splitArgs(argList);
}

function splitArgs(argList: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let current = '';
    for (const char of argList) {
        if (char === '<' || char === '(' || char === '[') {
            depth++;
        } else if (char === '>' || char === ')' || char === ']') {
            depth--;
        }
        if (char === ',' && depth === 0) {
            out.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    out.push(current);
    return out;
}


const REF_MAP_PARAM_RE = /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*&mut\s+indexmap::IndexMap<String, Value>/g;

/** Names a file prints as `&mut IndexMap` parameters. Copying one is the only
 *  way to box it, so a dead-clone pass must not turn that copy into a move. */
export function hx10w9Rp02RefMapParamNames(content: string): Set<string> {
    const names = new Set<string>();
    REF_MAP_PARAM_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = REF_MAP_PARAM_RE.exec(content)) !== null) {
        names.add(m[1]);
    }
    return names;
}

// `npx tsx build/hx10w9-RP02.ts --self-test` — the dispatch helpers only, no transpile.
const CASES: Array<{ name: string, got: () => any, want: any }> = [
    { name: 'split keeps a generic argument list whole', got: () => splitArgs('&self, a: Value, p: &mut indexmap::IndexMap<String, Value>, optional_args: &[Value]'), want: ['&self', ' a: Value', ' p: &mut indexmap::IndexMap<String, Value>', ' optional_args: &[Value]'] },
    { name: 'split handles a plain list', got: () => splitArgs('&self, a: Value, b: bool'), want: ['&self', ' a: Value', ' b: bool'] },
    { name: 'a map parameter is classified', got: () => hx10w9Rp02ParamKind('p: &mut indexmap::IndexMap<String, Value>'), want: 'map' },
    { name: 'a Value parameter is not', got: () => hx10w9Rp02ParamKind('p: Value'), want: undefined },
    { name: 'a file\'s map-parameter names are collected', got: () => Array.from(hx10w9Rp02RefMapParamNames('fn f(&self, a: Value, p: &mut indexmap::IndexMap<String, Value>) {}').values()), want: ['p'] },
    { name: 'the dispatch argument builds an owned map', got: () => hx10w9Rp02DispatchArg(4), want: '&mut { let mut __m = args.get(4).cloned().unwrap_or_default().as_map().cloned().unwrap_or_default();\n                    __m }' },
];

function selfTest(): number {
    let failures = 0;
    for (const c of CASES) {
        const got = c.got();
        const same = JSON.stringify(got) === JSON.stringify(c.want);
        console.log((same ? 'ok   ' : 'FAIL ') + c.name);
        if (!same) {
            failures++;
            console.log('       got:  ' + JSON.stringify(got));
            console.log('       want: ' + JSON.stringify(c.want));
        }
    }
    console.log(failures === 0 ? 'self-test: all cases pass' : 'self-test: ' + failures + ' failing');
    return failures;
}

if (process.argv.indexOf('--self-test') >= 0) {
    process.exit(selfTest() === 0 ? 0 : 1);
}
