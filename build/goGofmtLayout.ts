// go/printer's blank rule for binary operators (nodes.go binaryExpr/cutoff/walkBinary),
// applied to every Go line whose expressions this module can parse completely. Emitters and
// post-passes splice operand text after the printer ran, so the spacing is recomputed here,
// once, from the expression tree - lines it cannot parse are left exactly as they are.

type GoTok = { 'kind': string, 'text': string, 'start': number, 'end': number };
type GoNode = { [key: string]: any };

const GO_MULTI_OPS = [ '<<=', '>>=', '&^=', '...', '&&', '||', '<-', '++', '--', '==', '!=', '<=', '>=', ':=',
    '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '&^' ];
const GO_SINGLE_OPS = '+-*/%&|^<>=!:,;.()[]{}~';
const GO_KEYWORDS = new Set ([ 'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
    'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range',
    'return', 'select', 'struct', 'switch', 'type', 'var' ]);
const GO_ASSIGN_OPS = new Set ([ '=', ':=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '&^=' ]);
const GO_UNARY_OPS = new Set ([ '-', '+', '!', '^', '&', '<-' ]);

function goBinaryPrecedence (tok: GoTok | undefined): number {
    if (tok === undefined || tok.kind !== 'op') {
        return 0;
    }
    switch (tok.text) {
    case '||': return 1;
    case '&&': return 2;
    case '==': case '!=': case '<': case '<=': case '>': case '>=': return 3;
    case '+': case '-': case '|': case '^': return 4;
    case '*': case '/': case '%': case '<<': case '>>': case '&': case '&^': return 5;
    default: return 0;
    }
}

function goLexLine (line: string): GoTok[] | null {
    const toks: GoTok[] = [];
    let i = 0;
    while (i < line.length) {
        const c = line[i];
        if (c === ' ' || c === '\t' || c === '\r') {
            i += 1;
            continue;
        }
        if (c === '/' && line[i + 1] === '/') {
            toks.push ({ 'kind': 'comment', 'text': line.slice (i), 'start': i, 'end': line.length });
            break;
        }
        if (c === '/' && line[i + 1] === '*') {
            return null;
        }
        if (c === '"' || c === '\'' || c === '`') {
            let j = i + 1;
            while (j < line.length && line[j] !== c) {
                j += (line[j] === '\\' && c !== '`') ? 2 : 1;
            }
            if (j >= line.length) {
                return null;
            }
            toks.push ({ 'kind': 'lit', 'text': line.slice (i, j + 1), 'start': i, 'end': j + 1 });
            i = j + 1;
            continue;
        }
        const rest = line.slice (i);
        const num = /^(?:0[xX][0-9a-fA-F_.pP+-]+|0[bBoO][0-7_]+|(?:[0-9][0-9_]*(?:\.[0-9_]*)?|\.[0-9][0-9_]*)(?:[eE][-+]?[0-9_]+)?)i?/.exec (rest);
        if (/[0-9]/.test (c) || (c === '.' && /[0-9]/.test (line[i + 1] ?? ''))) {
            toks.push ({ 'kind': 'lit', 'text': num[0], 'start': i, 'end': i + num[0].length });
            i += num[0].length;
            continue;
        }
        const ident = /^[A-Za-z_\u0080-\uffff][A-Za-z0-9_\u0080-\uffff]*/.exec (rest);
        if (ident !== null) {
            toks.push ({ 'kind': 'id', 'text': ident[0], 'start': i, 'end': i + ident[0].length });
            i += ident[0].length;
            continue;
        }
        const multi = GO_MULTI_OPS.find ((op) => rest.startsWith (op));
        const op = multi ?? (GO_SINGLE_OPS.indexOf (c) >= 0 ? c : undefined);
        if (op === undefined) {
            return null;
        }
        toks.push ({ 'kind': 'op', 'text': op, 'start': i, 'end': i + op.length });
        i += op.length;
    }
    return toks;
}

class GoLineParser {
    toks: GoTok[];
    p = 0;
    noLit = false;
    constructor (toks: GoTok[]) {
        this.toks = toks;
    }
    peek (offset = 0): GoTok | undefined {
        return this.toks[this.p + offset];
    }
    is (text: string, offset = 0): boolean {
        const tok = this.peek (offset);
        return tok !== undefined && (tok.kind === 'op' || tok.kind === 'id') && tok.text === text;
    }
    atEnd (): boolean {
        return this.p >= this.toks.length;
    }
    fail (): never {
        throw new Error ('go-layout: unparsed');
    }
    expect (text: string) {
        if (!this.is (text)) {
            this.fail ();
        }
        this.p += 1;
    }
    nested<T> (fn: () => T): T {
        const saved = this.noLit;
        this.noLit = false;
        try {
            return fn ();
        } finally {
            this.noLit = saved;
        }
    }
    skipBalanced () {
        const open = this.peek ().text;
        const close = open === '(' ? ')' : (open === '[' ? ']' : '}');
        let depth = 0;
        while (!this.atEnd ()) {
            const t = this.peek ().text;
            this.p += 1;
            if (t === open) {
                depth += 1;
            } else if (t === close) {
                depth -= 1;
                if (depth === 0) {
                    return;
                }
            }
        }
        this.fail ();
    }
    parseExpr (): GoNode {
        return this.parseBinary (1);
    }
    parseBinary (minPrec: number): GoNode {
        let x = this.parseUnary ();
        for (;;) {
            const prec = goBinaryPrecedence (this.peek ());
            if (prec === 0 || prec < minPrec) {
                return x;
            }
            const op = this.p;
            this.p += 1;
            const y = this.parseBinary (prec + 1);
            x = { 't': 'bin', 'op': op, 'opText': this.toks[op].text, 'prec': prec, 'x': x, 'y': y };
        }
    }
    parseUnary (): GoNode {
        const tok = this.peek ();
        if (tok !== undefined && tok.kind === 'op') {
            if (tok.text === '<-' && this.is ('chan', 1)) {
                return this.parseOperandTail (this.parseType ());
            }
            if (GO_UNARY_OPS.has (tok.text)) {
                this.p += 1;
                return { 't': 'un', 'opText': tok.text, 'x': this.parseUnary () };
            }
            if (tok.text === '*') {
                this.p += 1;
                return { 't': 'star', 'x': this.parseUnary () };
            }
        }
        return this.parseOperandTail (this.parseOperand ());
    }
    parseOperand (): GoNode {
        const tok = this.peek ();
        if (tok === undefined) {
            this.fail ();
        }
        if (tok.kind === 'lit') {
            this.p += 1;
            return { 't': 'leaf' };
        }
        if (tok.kind === 'id') {
            if (tok.text === 'func') {
                this.parseFuncType ();
                if (this.is ('{')) {
                    this.p += 1;                  // a func literal body: statements follow on later lines
                    if (!this.atEnd ()) {
                        this.fail ();
                    }
                    return { 't': 'open' };
                }
                return { 't': 'leaf' };
            }
            if (tok.text === 'map' || tok.text === 'chan' || tok.text === 'struct' || tok.text === 'interface') {
                return this.parseType ();
            }
            if (GO_KEYWORDS.has (tok.text)) {
                this.fail ();
            }
            this.p += 1;
            return { 't': 'leaf' };
        }
        if (tok.text === '(') {
            this.p += 1;
            const x = this.nested (() => this.parseExpr ());
            this.expect (')');
            return { 't': 'paren', 'x': x };
        }
        if (tok.text === '[') {
            return this.parseType ();
        }
        this.fail ();
    }
    parseOperandTail (x: GoNode): GoNode {
        for (;;) {
            if (this.is ('.')) {
                this.p += 1;
                if (this.is ('(')) {
                    this.p += 1;
                    if (this.is ('type')) {
                        this.p += 1;
                    } else {
                        this.nested (() => this.parseType ());
                    }
                    this.expect (')');
                    x = { 't': 'assert', 'x': x };
                } else {
                    const name = this.peek ();
                    if (name === undefined || name.kind !== 'id') {
                        this.fail ();
                    }
                    this.p += 1;
                    x = { 't': 'sel', 'x': x };
                }
            } else if (this.is ('(')) {
                this.p += 1;
                const args = this.nested (() => {
                    const list: GoNode[] = [];
                    while (!this.is (')')) {
                        list.push (this.parseExpr ());
                        if (this.is ('...')) {
                            this.p += 1;
                        }
                        if (this.is (',')) {
                            this.p += 1;
                        } else if (!this.is (')')) {
                            this.fail ();
                        }
                    }
                    return list;
                });
                this.p += 1;
                x = { 't': 'call', 'fun': x, 'args': args };
            } else if (this.is ('[')) {
                this.p += 1;
                x = this.nested (() => this.parseIndexTail (x));
            } else if (this.is ('{') && !this.noLit) {
                return this.nested (() => this.parseCompositeBody ());
            } else {
                return x;
            }
        }
    }
    parseIndexTail (x: GoNode): GoNode {
        const items: (GoNode | null)[] = [];
        const colons: number[] = [];
        items.push (this.is (':') ? null : this.parseExpr ());
        if (this.is (':')) {
            while (this.is (':')) {
                colons.push (this.p);
                this.p += 1;
                items.push ((this.is (':') || this.is (']')) ? null : this.parseExpr ());
            }
            this.expect (']');
            return { 't': 'slice', 'x': x, 'items': items, 'colons': colons };
        }
        while (this.is (',')) {
            this.p += 1;
            items.push (this.parseExpr ());
        }
        this.expect (']');
        return { 't': 'index', 'x': x, 'items': items };
    }
    parseCompositeBody (): GoNode {
        this.expect ('{');
        const elts: GoNode[] = [];
        for (;;) {
            if (this.atEnd ()) {
                return { 't': 'comp', 'elts': elts, 'open': true };
            }
            if (this.is ('}')) {
                this.p += 1;
                return { 't': 'comp', 'elts': elts };
            }
            let element = this.is ('{') ? this.parseCompositeBody () : this.parseExpr ();
            if (this.is (':')) {
                this.p += 1;
                const value = this.is ('{') ? this.parseCompositeBody () : this.parseExpr ();
                element = { 't': 'kv', 'k': element, 'v': value };
            }
            elts.push (element);
            if (this.is (',')) {
                this.p += 1;
            } else if (!this.is ('}') && !this.atEnd ()) {
                this.fail ();
            }
        }
    }
    parseFuncType () {
        this.expect ('func');
        if (!this.is ('(')) {
            this.fail ();
        }
        this.skipBalanced ();
        if (this.is ('(')) {
            this.skipBalanced ();
        } else if (this.startsType ()) {
            this.parseType ();
        }
    }
    startsType (): boolean {
        const tok = this.peek ();
        if (tok === undefined) {
            return false;
        }
        if (tok.kind === 'id') {
            return !GO_KEYWORDS.has (tok.text) || [ 'map', 'chan', 'func', 'struct', 'interface' ].includes (tok.text);
        }
        return tok.text === '*' || tok.text === '[' || (tok.text === '<-' && this.is ('chan', 1));
    }
    parseType (): GoNode {
        const tok = this.peek ();
        if (tok === undefined) {
            this.fail ();
        }
        if (tok.text === '*') {
            this.p += 1;
            return this.parseType ();
        }
        if (tok.text === '[') {
            this.skipBalanced ();
            return this.parseType ();
        }
        if (tok.text === 'map') {
            this.p += 1;
            if (!this.is ('[')) {
                this.fail ();
            }
            this.skipBalanced ();
            return this.parseType ();
        }
        if (tok.text === '<-') {
            this.p += 1;
            return this.parseType ();
        }
        if (tok.text === 'chan') {
            this.p += 1;
            if (this.is ('<-')) {
                this.p += 1;
            }
            return this.parseType ();
        }
        if (tok.text === 'func') {
            this.parseFuncType ();
            return { 't': 'leaf' };
        }
        if (tok.text === 'struct' || tok.text === 'interface') {
            this.p += 1;
            if (!this.is ('{')) {
                this.fail ();
            }
            this.skipBalanced ();
            return { 't': 'leaf' };
        }
        if (tok.text === '(') {
            this.skipBalanced ();
            return { 't': 'leaf' };
        }
        if (tok.kind !== 'id' || GO_KEYWORDS.has (tok.text)) {
            this.fail ();
        }
        this.p += 1;
        if (this.is ('.') && this.peek (1)?.kind === 'id') {
            this.p += 2;
        }
        if (this.is ('[')) {
            this.skipBalanced ();
        }
        return { 't': 'leaf' };
    }
    parseExprList (): GoNode[] {
        const list = [ this.parseExpr () ];
        while (this.is (',')) {
            this.p += 1;
            if (this.atEnd ()) {
                break;                        // the trailing comma of an element line
            }
            list.push (this.parseExpr ());
        }
        return list;
    }
}

type GoLayout = { 'blank': Map<number, boolean>, 'colon': Map<number, [ boolean, boolean ]> };

function goWalkBinary (e: GoNode): [ boolean, boolean, number ] {
    let has4 = e.prec === 4;
    let has5 = e.prec === 5;
    let maxProblem = 0;
    if (e.x.t === 'bin' && e.x.prec >= e.prec) {
        const [ h4, h5, mp ] = goWalkBinary (e.x);
        has4 = has4 || h4;
        has5 = has5 || h5;
        maxProblem = Math.max (maxProblem, mp);
    }
    if (e.y.t === 'bin') {
        if (e.y.prec > e.prec) {
            const [ h4, h5, mp ] = goWalkBinary (e.y);
            has4 = has4 || h4;
            has5 = has5 || h5;
            maxProblem = Math.max (maxProblem, mp);
        }
    } else if (e.y.t === 'star') {
        if (e.opText === '/') {
            maxProblem = 5;
        }
    } else if (e.y.t === 'un') {
        const pair = e.opText + e.y.opText;
        if (pair === '/*' || pair === '&&' || pair === '&^') {
            maxProblem = 5;
        } else if (pair === '++' || pair === '--') {
            maxProblem = Math.max (maxProblem, 4);
        }
    }
    return [ has4, has5, maxProblem ];
}

function goCutoff (e: GoNode, depth: number): number {
    const [ has4, has5, maxProblem ] = goWalkBinary (e);
    if (maxProblem > 0) {
        return maxProblem + 1;
    }
    if (has4 && has5) {
        return depth === 1 ? 5 : 4;
    }
    return depth === 1 ? 6 : 4;
}

function goVisitLayout (n: GoNode | null, depth: number, out: GoLayout) {
    if (n === null) {
        return;
    }
    switch (n.t) {
    case 'bin':
        out.blank.set (n.op, n.prec < goCutoff (n, depth));
        goVisitLayout (n.x, depth + ((n.x.t === 'bin' && n.x.prec === n.prec) ? 0 : 1), out);
        goVisitLayout (n.y, depth + 1, out);
        break;
    case 'paren':
        goVisitLayout (n.x, (n.x.t === 'paren') ? depth : Math.max (1, depth - 1), out);
        break;
    case 'un':
    case 'sel':
    case 'assert':
        goVisitLayout (n.x, depth, out);
        break;
    case 'star':
        goVisitLayout (n.x, 1, out);
        break;
    case 'call': {
        const d = (n.args.length > 1) ? depth + 1 : depth;
        goVisitLayout (n.fun, d, out);
        for (const arg of n.args) {
            goVisitLayout (arg, d, out);
        }
        break;
    }
    case 'index':
        goVisitLayout (n.x, 1, out);
        for (const item of n.items) {
            goVisitLayout (item, depth + 1, out);
        }
        break;
    case 'slice': {
        goVisitLayout (n.x, 1, out);
        const present = n.items.filter ((item) => item !== null);
        const needsBlanks = (depth <= 1) && (present.length > 1) && present.some ((item) => item.t === 'bin');
        n.colons.forEach ((colon: number, k: number) => {
            out.colon.set (colon, [ needsBlanks && n.items[k] !== null, needsBlanks && n.items[k + 1] !== null ]);
        });
        for (const item of n.items) {
            goVisitLayout (item, depth + 1, out);
        }
        break;
    }
    case 'comp':
        for (const element of n.elts) {
            goVisitLayout (element, 1, out);
        }
        break;
    case 'kv':
        goVisitLayout (n.k, 1, out);
        goVisitLayout (n.v, 1, out);
        break;
    default:
        break;
    }
}

// one simple statement (go/printer stmt(): assignments are depth 1, or 2 when both sides are lists)
function goLayoutSimpleStmt (parser: GoLineParser, out: GoLayout) {
    if (parser.is ('range')) {
        parser.p += 1;
        goVisitLayout (parser.parseExpr (), 1, out);
        return;
    }
    const lhs = parser.parseExprList ();
    const tok = parser.peek ();
    if (tok !== undefined && tok.kind === 'op' && GO_ASSIGN_OPS.has (tok.text)) {
        parser.p += 1;
        let rhs: GoNode[];
        if (parser.is ('range')) {
            parser.p += 1;
            rhs = [ parser.parseExpr () ];
        } else {
            rhs = parser.parseExprList ();
        }
        const depth = (lhs.length > 1 && rhs.length > 1) ? 2 : 1;
        for (const x of lhs.concat (rhs)) {
            goVisitLayout (x, depth, out);
        }
    } else if (parser.is ('++') || parser.is ('--')) {
        parser.p += 1;
        goVisitLayout (lhs[0], 2, out);
    } else if (parser.is ('<-')) {
        parser.p += 1;
        goVisitLayout (lhs[0], 1, out);
        goVisitLayout (parser.parseExpr (), 1, out);
    } else if (parser.is (':') && lhs.length === 1) {
        parser.p += 1;                        // a `key: value` element of a composite literal body
        goVisitLayout (lhs[0], 1, out);
        if (!parser.atEnd ()) {
            goVisitLayout (parser.is ('{') ? parser.parseCompositeBody () : parser.parseExpr (), 1, out);
            if (parser.is (',')) {
                parser.p += 1;
            }
        }
    } else {
        for (const x of lhs) {
            goVisitLayout (x, 1, out);
        }
    }
}

function goLayoutHeader (parser: GoLineParser, out: GoLayout) {
    parser.noLit = true;
    if (!parser.is ('{')) {
        goLayoutSimpleStmt (parser, out);
        while (parser.is (';')) {
            parser.p += 1;
            if (!parser.is (';') && !parser.is ('{')) {
                goLayoutSimpleStmt (parser, out);
            }
        }
    }
    parser.noLit = false;
    parser.expect ('{');
}

function goLayoutStatement (toks: GoTok[]): GoLayout | null {
    const out: GoLayout = { 'blank': new Map (), 'colon': new Map () };
    const parser = new GoLineParser (toks);
    try {
        if (parser.is ('}')) {
            parser.p += 1;
            if (parser.atEnd () || (parser.is (',') && parser.toks.length === 2)) {
                return out;
            }
            parser.expect ('else');
            if (parser.is ('{')) {
                parser.p += 1;
            } else {
                parser.expect ('if');
                goLayoutHeader (parser, out);
            }
        } else {
            const head = parser.peek ();
            const word = head.kind === 'id' ? head.text : '';
            if (word === 'if' || word === 'for' || word === 'switch') {
                parser.p += 1;
                goLayoutHeader (parser, out);
            } else if (word === 'return') {
                parser.p += 1;
                if (!parser.atEnd ()) {
                    for (const x of parser.parseExprList ()) {
                        goVisitLayout (x, 1, out);
                    }
                }
            } else if (word === 'case') {
                parser.p += 1;
                goLayoutSimpleStmt (parser, out);
                parser.expect (':');
            } else if (word === 'go' || word === 'defer') {
                parser.p += 1;
                goVisitLayout (parser.parseExpr (), 1, out);
            } else if (word === 'var' || word === 'const') {
                const assign = toks.findIndex ((tok) => tok.kind === 'op' && tok.text === '=');
                if (assign < 0) {
                    return out;
                }
                parser.p = assign + 1;
                for (const x of parser.parseExprList ()) {
                    goVisitLayout (x, 1, out);
                }
            } else if (word === 'break' || word === 'continue' || word === 'fallthrough' || word === 'goto' ||
                    word === 'default' || word === 'select') {
                return out;
            } else if (GO_KEYWORDS.has (word)) {
                return null;
            } else {
                goLayoutSimpleStmt (parser, out);
            }
        }
        return parser.atEnd () ? out : null;
    } catch (e) {
        return null;
    }
}

// the Go text of `line` with the blanks go/printer gives each binary operator and slice colon
function goApplyLayout (line: string, toks: GoTok[], layout: GoLayout): string {
    const gaps: (string | undefined)[] = toks.map (() => undefined);   // gap before token k
    const setGap = (k: number, blank: boolean) => {
        if (k > 0 && k < toks.length && toks[k].kind !== 'comment') {
            gaps[k] = blank ? ' ' : '';
        }
    };
    for (const [ k, blank ] of layout.blank) {
        setGap (k, blank);
        setGap (k + 1, blank);
    }
    for (const [ k, [ before, after ] ] of layout.colon) {
        setGap (k, before);
        setGap (k + 1, after);
    }
    let out = line.slice (0, toks.length > 0 ? toks[0].start : line.length);
    for (let k = 0; k < toks.length; k++) {
        if (k > 0) {
            const original = line.slice (toks[k - 1].end, toks[k].start);
            out += (gaps[k] !== undefined && /^ *$/.test (original)) ? gaps[k] : original;
        }
        out += toks[k].text;
    }
    return out;
}

// per line: true when the line starts inside a `{` body (a block or a composite literal, not a
// struct/interface type) and outside any raw string or block comment
function goLayoutLineContexts (lines: string[]): boolean[] {
    const result: boolean[] = [];
    const stack: string[] = [];
    let inRaw = false;
    let inBlockComment = false;
    let lastSignificant = '';
    let lastWord = '';
    let continued = false;
    for (const line of lines) {
        const top = stack[stack.length - 1];
        result.push (!inRaw && !inBlockComment && !continued && top === '{');
        const startedInside = inRaw || inBlockComment;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (inRaw) {
                if (c === '`') {
                    inRaw = false;
                }
                continue;
            }
            if (inBlockComment) {
                if (c === '*' && line[i + 1] === '/') {
                    inBlockComment = false;
                    i += 1;
                }
                continue;
            }
            if (c === '/' && line[i + 1] === '/') {
                break;
            }
            if (c === '/' && line[i + 1] === '*') {
                inBlockComment = true;
                i += 1;
                continue;
            }
            if (c === '`') {
                inRaw = true;
                continue;
            }
            if (c === '"' || c === '\'') {
                let j = i + 1;
                while (j < line.length && line[j] !== c) {
                    j += (line[j] === '\\') ? 2 : 1;
                }
                i = j;
                lastSignificant = c;
                continue;
            }
            if (c === '(' || c === '[') {
                stack.push (c);
            } else if (c === '{') {
                stack.push ((lastWord === 'struct' || lastWord === 'interface') ? 'T' : '{');
            } else if (c === ')' || c === ']' || c === '}') {
                stack.pop ();
            }
            if (c !== ' ' && c !== '\t') {
                lastSignificant = c;
                const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec (line.slice (i));
                if (word !== null && (i === 0 || !/[A-Za-z0-9_]/.test (line[i - 1]))) {
                    lastWord = word[0];
                    i += word[0].length - 1;
                    lastSignificant = 'a';
                } else if (c !== '{') {
                    lastWord = '';
                }
            }
        }
        // a line ending in an operator or a separator continues its expression on the next line
        continued = startedInside || inRaw || inBlockComment || /[-+*/%&|^<>=!,.:]/.test (lastSignificant);
    }
    return result;
}

export function goGofmtBinarySpacing (content: string): string {
    const lines = content.split ('\n');
    const inBody = goLayoutLineContexts (lines);
    for (let l = 0; l < lines.length; l++) {
        if (!inBody[l]) {
            continue;
        }
        const toks = goLexLine (lines[l]);
        if (toks === null) {
            continue;
        }
        const code = (toks.length > 0 && toks[toks.length - 1].kind === 'comment') ? toks.slice (0, -1) : toks;
        if (code.length === 0) {
            continue;
        }
        const layout = goLayoutStatement (code);
        if (layout !== null && (layout.blank.size > 0 || layout.colon.size > 0)) {
            lines[l] = goApplyLayout (lines[l], toks, layout);
        }
    }
    return lines.join ('\n');
}
