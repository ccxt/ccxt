// JN-5 (temporary) — return-shape census for the parse*/safe* structure families.
// For every TS MethodDeclaration of each candidate name in ts/src, classify every
// ReturnStatement expression (not descending into nested functions). Prints a
// per-name histogram + the non-trivial sites. NOT FOR COMMIT.
import ts from 'typescript6';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve (process.argv[2] ?? './ts/src');
const NAMES = new Set ([
    'parseMarket', 'parseMarkets', 'parseCurrency', 'parseCurrencies',
    'parseTicker', 'parseTickers', 'parseOrder', 'parseOrders', 'parseTrade', 'parseTrades',
    'safeTicker', 'safeOrder', 'safeTrade', 'safePosition', 'safeLiquidation', 'safeOrderBook',
    'safeMarket', 'safeCurrency', 'safeMarketStructure', 'safeCurrencyStructure',
    // sub-delegates discovered by the first pass
    'parseSwapMarket', 'parseSpotMarket', 'parseSpotOrder', 'parseUtaOrder', 'parseContractOrder',
    'parseSwapOrder', 'parseDustTrade', 'parseMyUtaTrade', 'parseSpotOrUtaTrade',
    'parseContractTrade', 'parseContractTicker',
]);

const files: string[] = [];
function walk (dir: string) {
    for (const e of fs.readdirSync (dir, { withFileTypes: true })) {
        const p = path.join (dir, e.name);
        if (e.isDirectory ()) walk (p);
        else if (e.name.endsWith ('.ts') && !e.name.endsWith ('.d.ts')) files.push (p);
    }
}
walk (ROOT);

function unwrap (n: ts.Node): ts.Node {
    while (ts.isParenthesizedExpression (n)) n = n.expression;
    return n;
}
function head (n: ts.Node, len = 60): string {
    try { return String (n.getText ()).replace (/\s+/g, ' ').slice (0, len); } catch { return '?'; }
}
function shapeOf (expr: ts.Expression): string {
    expr = unwrap (expr) as ts.Expression;
    if (ts.isObjectLiteralExpression (expr)) return 'row-literal';
    if (expr.kind === ts.SyntaxKind.NullKeyword) return 'null';
    if (ts.isIdentifier (expr)) return expr.escapedText === 'undefined' ? 'null' : 'id:' + expr.escapedText;
    if (ts.isConditionalExpression (expr)) return 'ternary(' + shapeOf (expr.whenTrue) + '|' + shapeOf (expr.whenFalse) + ')';
    if (ts.isCallExpression (expr)) {
        const c = expr.expression;
        if (ts.isPropertyAccessExpression (c)) {
            const recv = c.expression;
            const recvText = ts.isIdentifier (recv) ? String (recv.escapedText) : (recv.kind === ts.SyntaxKind.ThisKeyword ? 'this' : (recv.kind === ts.SyntaxKind.SuperKeyword ? 'super' : '?'));
            return 'call:' + recvText + '.' + c.name.escapedText;
        }
        if (ts.isIdentifier (c)) return 'call:' + c.escapedText;
        return 'call:?';
    }
    if (ts.isAwaitExpression (expr)) return 'await';
    if (ts.isElementAccessExpression (expr)) return 'elem';
    if (ts.isPropertyAccessExpression (expr)) return 'prop:' + head (expr, 30);
    if (ts.isStringLiteral (expr) || ts.isNoSubstitutionTemplateLiteral (expr) || ts.isTemplateExpression (expr)) return 'STRING-LITERAL';
    if (ts.isNumericLiteral (expr)) return 'NUMBER-LITERAL';
    if (ts.isArrayLiteralExpression (expr)) return 'list-literal';
    if (ts.isAsExpression (expr) || ts.isTypeAssertionExpression (expr)) return shapeOf (expr.expression as ts.Expression);
    if (ts.isBinaryExpression (expr)) return 'binary:' + ts.tokenToString (expr.operatorToken.kind);
    if (ts.isNewExpression (expr)) return 'new:' + head (expr.expression, 20);
    if (ts.isVoidExpression (expr)) return 'void';
    return 'OTHER:' + ts.SyntaxKind [expr.kind];
}
function collectReturns (body: ts.Node, out: ts.ReturnStatement[]) {
    const visit = (n: ts.Node) => {
        if (ts.isFunctionLike (n) && n !== body) return; // don't descend into nested functions
        if (ts.isReturnStatement (n)) { out.push (n); return; }
        ts.forEachChild (n, visit);
    };
    visit (body);
}

const perName = new Map<string, Map<string, string[]>>();
const declsPerName = new Map<string, number>();
for (const file of files) {
    const text = fs.readFileSync (file, 'utf8');
    const sf = ts.createSourceFile (file, text, ts.ScriptTarget.Latest, true);
    const visit = (n: ts.Node) => {
        if (ts.isMethodDeclaration (n) && n.name && ts.isIdentifier (n.name) && NAMES.has (String (n.name.escapedText))) {
            const name = String (n.name.escapedText);
            declsPerName.set (name, (declsPerName.get (name) ?? 0) + 1);
            const rets: ts.ReturnStatement[] = [];
            if (n.body) collectReturns (n.body, rets);
            for (const r of rets) {
                const shape = r.expression ? shapeOf (r.expression) : 'bare-return';
                const pos = sf.getLineAndCharacterOfPosition (r.getStart ());
                let m = perName.get (name);
                if (!m) { m = new Map (); perName.set (name, m); }
                let arr = m.get (shape);
                if (!arr) { arr = []; m.set (shape, arr); }
                arr.push (`${path.relative (process.cwd (), file).replace (/\\/g, '/')}:${pos.line + 1} ${head (r.expression ?? r, 70)}`);
            }
        }
        ts.forEachChild (n, visit);
    };
    visit (sf);
}

for (const name of [ ...NAMES ].sort ()) {
    const m = perName.get (name);
    if (!m) { console.log (`\n## ${name}: 0 declarations`); continue; }
    console.log (`\n## ${name}: ${declsPerName.get (name)} declarations, ${[ ...m.values () ].reduce ((a, v) => a + v.length, 0)} return sites`);
    const entries = [ ...m.entries () ].sort ((a, b) => b[1].length - a[1].length);
    for (const [ shape, sites ] of entries) {
        const trivial = shape === 'row-literal' || shape === 'null';
        console.log (`  ${String (sites.length).padStart (4)}  ${shape}${trivial ? '' : '   e.g. ' + sites[0]}`);
        if (!trivial && sites.length > 1) {
            for (const s of sites.slice (0, 4)) console.log (`            ${s}`);
        }
    }
}
