// `until := untilV[0]` where untilV comes from HandleOption(Integer)AndParams(2)Nullable: slot 0 is
// *int64 or untyped nil, so the local is read as that pointer (same extraction as hx10 G07) and its
// nil tests / int64 reads print natively. A function is rewritten only when every use is recognised.
const PRODUCERS = '(?:HandleOptionIntegerAndParams2?Nullable)';
const START = /^(\t+)([A-Za-z_]\w*) := ([A-Za-z_]\w*)\[0\]$/;

function word (name: string): RegExp {
    return new RegExp ('(?<![\\w.])' + name + '(?!\\w)', 'g');
}

// the rewritten line, or undefined when a use is not recognised
function rewriteUse (full: string, name: string): string | undefined {
    const cut = /^(.*?)(\s\/\/ .*)$/.exec (full);
    const line = ((cut !== null) && ((cut[1].split ('"').length % 2) === 1)) ? cut[1] : full;
    const tail = (line === full) ? '' : (cut as RegExpExecArray)[2];
    const result = rewriteCode (line, name);
    return (result === undefined) ? undefined : result + tail;
}

function rewriteCode (line: string, name: string): string | undefined {
    if (new RegExp ('^\\s*' + name + '\\s*(?::=|=|[-+*/|&^]=|\\+\\+|--)(?!=)').test (line)) {
        return undefined;
    }
    let out = line;
    out = out.replace (new RegExp ('!IsEqual\\(' + name + ', nil\\)', 'g'), name + ' != nil');
    out = out.replace (new RegExp ('IsEqual\\(' + name + ', nil\\)', 'g'), name + ' == nil');
    out = out.replace (new RegExp ('(' + name + ' != nil) && !IsEqual\\(' + name + ', 0\\)', 'g'), '$1 && *' + name + ' != 0');
    out = out.replace (new RegExp ('\\b' + name + '\\.\\(\\*int64\\) != nil', 'g'), name + ' != nil');
    out = out.replace (new RegExp ('\\*' + name + '\\.\\(\\*int64\\)', 'g'), '*' + name);
    const left = out.replace (new RegExp ('\\*' + name + '(?!\\w)', 'g'), '').replace (new RegExp (name + ' (?:==|!=) nil', 'g'), '');
    return (left.match (word (name)) === null) ? out : undefined;
}

export function hx11w8Int64TupleLocals (content: string): string {
    if (!/HandleOptionIntegerAndParams2?Nullable/.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    let from = -1;
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].startsWith ('func ')) {
            from = k;
            continue;
        }
        if ((from < 0) || (lines[k] !== '}')) {
            continue;
        }
        const to = k;
        for (let i = from + 1; i < to; i++) {
            const m = START.exec (lines[i]);
            if (m === null) {
                continue;
            }
            const [ , indent, name, holder ] = m;
            const decl = new RegExp ('^\\t+var ' + holder + ' \\[\\]any = this\\.' + PRODUCERS + '\\(').test (lines[i - 1]);
            if (!decl || (indent !== '\t')) {
                continue;
            }
            const rebound = new RegExp ('(?<![\\w.])' + holder + '\\s*(?::=|=)(?!=)');
            const edits: [ number, string ][] = [];
            let proven = true;
            for (let j = from + 1; j < to && proven; j++) {
                if ((j === i) || (j === i - 1)) {
                    continue;
                }
                if (rebound.test (lines[j].replace (/^\t+var /, ''))) {
                    proven = false;
                    break;
                }
                if (lines[j].replace (/\s\/\/ .*$/, '').match (word (name)) === null) {
                    continue;
                }
                const next = rewriteUse (lines[j], name);
                if (next === undefined) {
                    proven = false;
                } else if (next !== lines[j]) {
                    edits.push ([ j, next ]);
                }
            }
            if (!proven || (edits.length === 0)) {
                continue;
            }
            for (const [ at, text ] of edits) {
                lines[at] = text;
            }
            lines.splice (i, 1, indent + 'var ' + name + ' *int64 = nil', indent + 'if p, ok := ' + holder + '[0].(*int64); ok {', indent + '\t' + name + ' = p', indent + '}');
            k += 3;
            i += 3;
            // `to` moved by the 3 inserted lines
            return hx11w8Int64TupleLocals (lines.join ('\n'));
        }
        from = -1;
    }
    return lines.join ('\n');
}

export function hx11w8Int64TupleLocalsCheck (): string[] {
    const problems: string[] = [];
    const ok = (cond: boolean, msg: string) => { if (!cond) { problems.push ('hx11 w8 int64 tuple local: ' + msg); } };
    const run = (body: string) => hx11w8Int64TupleLocals ('package ccxt\n\nfunc (this *X) f(p any) any {\n\tvar uV []any = this.HandleOptionIntegerAndParamsNullable(p, \"f\", \"until\")\n\tu := uV[0]\n' + body + '\treturn nil\n}\n');
    const typed = run ('\tif !IsEqual(u, nil) {\n\t\tr[\"e\"] = this.ParseToInt(float64(*u.(*int64)) / 1000)\n\t}\n\tif !IsEqual(u, nil) && !IsEqual(u, 0) {\n\t}\n\tif IsEqual(u, nil) {\n\t}\n');
    ok (typed.includes ('\tvar u *int64 = nil\n\tif p, ok := uV[0].(*int64); ok {\n\t\tu = p\n\t}\n'), 'typed local: ' + typed);
    ok (typed.includes ('if u != nil {') && typed.includes ('float64(*u) / 1000') && typed.includes ('if u != nil && *u != 0 {') && typed.includes ('if u == nil {'), 'native reads: ' + typed);
    ok (!typed.includes ('IsEqual('), 'no helper left: ' + typed);
    for (const keep of [ '\tr[\"e\"] = u\n', '\tif IsEqual(u, 5) {\n\t}\n', '\tu = nil\n', '\tif !IsEqual(u, nil) {\n\t\tx := Subtract(u, 1)\n\t\t_ = x\n\t}\n' ]) {
        ok (run (keep).includes ('u := uV[0]'), 'keeps the box: ' + JSON.stringify (keep));
    }
    ok (run ('\tuV = this.F()\n\tif !IsEqual(u, nil) {\n\t}\n').includes ('u := uV[0]'), 'rebound holder keeps the box');
    return problems;
}
