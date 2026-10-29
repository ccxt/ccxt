// hx11 w8: `var x any = this.<M>(..)` where <M> is a BaseExchange method whose Go signature (base,
// every override and IDerivedExchange) is `map[string]any` becomes `var x map[string]any = ..`.
// Same use rules as M43 (no rebind, address, assertion, selector, index or non-nil compare), so every
// remaining use compiled against the box and keeps compiling against the map.

import { m43Mask, m43Declarations, m43UseKeepsMap } from './hx11-m43-safedict-local.js';

// verified at head: one signature `map[string]any` for each name on base + all overrides + interface
const BASE_MAP_CALLEES = 'ParseMarket|Markets|ParseWsTrade|ParseWsOrder|ParseBalance|Account|GetMarketFromSymbols|Extend|Currency|Describe';
const DECL = new RegExp ('^(\\s*)var (\\w+) any = (this\\.(?:' + BASE_MAP_CALLEES + ')\\(.*\\))$');

function bmFunc (lines: string[], masked: string[], start: number, end: number): void {
    const maskedFunc = masked.slice (start, end + 1).join ('\n');
    for (let k = start + 1; k < end; k++) {
        const decl = DECL.exec (lines[k]);
        if ((decl === null) || (lines[k].indexOf ('//') >= 0)) {
            continue;
        }
        const name = decl[2];
        const maskedDecl = DECL.exec (masked[k]);
        if ((maskedDecl === null) || (maskedDecl[2] !== name)) {
            continue;
        }
        let depth = 0;
        let closed = true;
        for (let i = decl[3].indexOf ('('); i < maskedDecl[3].length; i++) {
            depth += (maskedDecl[3][i] === '(') ? 1 : ((maskedDecl[3][i] === ')') ? -1 : 0);
            if ((depth === 0) && (i < maskedDecl[3].length - 1)) {
                closed = false; // `this.F(a).x` or `this.F(a) + ..`: not the bare call
            }
        }
        if (!closed || (depth !== 0) || (m43Declarations (maskedFunc, lines[start], name) !== 1)) {
            continue;
        }
        const use = new RegExp ('(?<![\\w.])' + name + '(?!\\w)', 'g');
        let keeps = true;
        for (let j = start + 1; (j < end) && keeps; j++) {
            for (let m = use.exec (masked[j]); m !== null; m = use.exec (masked[j])) {
                if ((j === k) && (m.index === decl[1].length + 4)) {
                    continue;
                }
                if (!m43UseKeepsMap (masked[j], m.index, name)) {
                    keeps = false;
                    break;
                }
            }
        }
        if (keeps) {
            lines[k] = decl[1] + 'var ' + name + ' map[string]any = ' + decl[3];
        }
    }
}

export function hx11w8BaseMapLocals (content: string, filePath: string): string {
    if (!new RegExp ('var \\w+ any = this\\.(?:' + BASE_MAP_CALLEES + ')\\(').test (content) || /[\\/]prediction[\\/]/.test (filePath)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = m43Mask (content).split ('\n');
    if (lines.length !== masked.length) {
        return content;
    }
    let start = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            start = k;
        } else if ((start >= 0) && (lines[k] === '}')) {
            bmFunc (lines, masked, start, k);
            start = -1;
        }
    }
    return lines.join ('\n');
}

export function hx11w8BaseMapLocalsCheck (): string[] {
    const problems: string[] = [];
    const ok = (condition: boolean, label: string) => {
        if (!condition) {
            problems.push ('hx11 w8 base map locals: ' + label);
        }
    };
    const run = (body: string) => hx11w8BaseMapLocals ('package ccxt\n\nfunc (this *X) F(p any) any {\n' + body + '\treturn nil\n}\n', 'go/v4/x.go');
    const typed = 'var m map[string]any = this.ParseMarket(p)';
    const decl = '\tvar m any = this.ParseMarket(p)\n';
    ok (run (decl + '\tif !IsEqual(m, nil) {\n\t\t_ = GetValue(m, \"id\")\n\t}\n').includes (typed), 'plain uses type the local');
    ok (run ('\tvar a any = this.Account()\n\treturn a\n').includes ('var a map[string]any = this.Account()'), 'Account');
    ok (!run (decl + '\tm = this.Extend(m, p)\n').includes (typed), 'rebinding keeps the box');
    ok (!run (decl + '\t_ = m.(map[string]any)\n').includes (typed), 'assertion keeps the box');
    ok (!run (decl + '\t_ = m[\"a\"]\n').includes (typed), 'index keeps the box');
    ok (!run (decl + '\t_ = &m\n').includes (typed), 'address keeps the box');
    ok (!run (decl + '\tvar m any = nil\n').includes (typed), 'second declaration keeps the box');
    ok (!run ('\tvar m any = this.ParseMarket(p)[\"id\"]\n').includes ('map[string]any'), 'indexed call is not the map');
    ok (!run ('\tvar m any = this.ParseTicker(p)\n').includes ('map[string]any'), 'other callees untouched');
    ok (hx11w8BaseMapLocals ('func (this *X) F() any {\n' + decl + '}\n', 'go/v4/prediction/x.go').indexOf ('map[string]any') < 0, 'prediction untouched');
    const once = run (decl);
    ok (hx11w8BaseMapLocals (once, 'go/v4/x.go') === once, 'idempotent');
    return problems;
}
