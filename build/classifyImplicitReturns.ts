// ---------------------------------------------------------------------------
// Static classifier for generated implicit-API return types.
//
// Every generated endpoint method (`publicGetTrades`, `sapiGetSystemStatus`, ...)
// returns decoded JSON, which is always exactly one of three shapes:
//
//     Dict    - a JSON object          {"a": 1}
//     List    - a JSON array           [1, 2, 3]
//     string  - a bare / quoted scalar "0x1234..."  or  "OK"
//
// This script decides, per (exchange, method) pair, which of the three it is,
// by reading how the value is *used* at its call sites inside ts/src/**. The
// result is written to build/implicitReturnTypes.json, which
// build/generateImplicitAPI.ts consumes when it emits ts/src/abstract/*.ts.
//
// Run:  npx tsx build/classifyImplicitReturns.ts
// ---------------------------------------------------------------------------

// typescript@7 (the root "typescript" dep) is the native compiler and ships no JS
// compiler API; "typescript6" is the aliased last release that does. Same reason
// build/use-typescript6.cjs exists for eslint.
import ts from 'typescript6';
import fs from 'fs';
import path from 'path';

const ABSTRACT_DIR = './ts/src/abstract';
const OUT_FILE = './build/implicitReturnTypes.json';

// Source dirs scanned for call sites, paired with the key prefix used for the
// exchanges defined there. Prediction-market exchanges live in their own
// namespace because ids collide with the spot/swap ones (`hyperliquid` is both
// a normal exchange and a prediction exchange, with different api trees).
const SOURCE_DIRS: [ string, string ][] = [
    [ './ts/src', '' ],
    [ './ts/src/pro', '' ],
    [ './ts/src/prediction', 'prediction/' ],
    [ './ts/src/pro/prediction', 'prediction/' ],
];

type Shape = 'Dict' | 'List' | 'string';

// Weight of a single piece of evidence. Strong evidence is a construct that is
// only legal on one of the three shapes; weak evidence is merely suggestive.
const STRONG = 4;
const MEDIUM = 2;
const WEAK = 1;

// -------------------------------------------------------------------------
// Manual overrides. These win over static evidence. Every entry is a case
// where the call sites are absent, contradictory, or lie about the runtime
// shape; the comment records how it was established.
// -------------------------------------------------------------------------
const OVERRIDES: { [exchange: string]: { [method: string]: string } } = {
    'bitmex': {
        // returns a bare quoted address string, not JSON
        'privateGetUserDepositAddress': 'string',
    },
    'prediction/polymarket': {
        // health probe, responds with the literal "OK" (see fetchStatus)
        'gammaPublicGetStatus': 'string',
    },
    'bitget': {
        // candle endpoints answer with an empty string body when a token was
        // just listed and has no candles yet (see fetchOHLCV's `response === ''`)
        'publicMixGetV2MixMarketCandles': 'List | string',
        'publicMixGetV2MixMarketHistoryCandles': 'List | string',
        'publicSpotGetV2SpotMarketCandles': 'List | string',
        'publicSpotGetV2SpotMarketHistoryCandles': 'List | string',
    },
    'hyperliquid': {
        // single RPC-style endpoint multiplexed over a `type` param across 25
        // call sites: object for most types, array for `perpDexs`/`meta`, and a
        // bare string for `userAbstraction` ("unifiedAccount" | "disabled" | ...)
        'publicPostInfo': 'Dict | List | string',
    },
    'prediction/hyperliquid': {
        'publicPostInfo': 'Dict | List | string',
    },
};

// -------------------------------------------------------------------------
// Call-site vocabulary
// -------------------------------------------------------------------------

// base helpers whose FIRST argument is a list of raw entries
const LIST_FIRST_ARG = new Set ([
    'parseTrades', 'parseOrders', 'parseOHLCVs', 'parseTickers', 'parseTransactions',
    'parsePositions', 'parseTransfers', 'parseAccounts', 'parseMarkets', 'parseCurrencies',
    'parseFundingRateHistories', 'parseLiquidations', 'parseMarginModes', 'parseLeverages',
    'parseBorrowInterests', 'parseOptionChain', 'parseADLRanks', 'parseConversions',
    'parseDepositAddresses', 'parseIncomes', 'parseLastPrices', 'parseFundingRates',
    'parseBalances', 'parseLedger', 'parseGreeks', 'parseOpenInterests', 'parseLeverageTiers',
    'parseMarketLeverageTiers', 'parseDepositWithdrawFees', 'parseTradingFees',
    'toArray', 'arrayConcat', 'sortBy', 'sortBy2', 'filterBy', 'filterByArray', 'sum',
]);

// base helpers whose FIRST argument is a single raw object
const DICT_FIRST_ARG = new Set ([
    'parseTrade', 'parseOrder', 'parseOHLCV', 'parseTicker', 'parseTransaction',
    'parsePosition', 'parseTransfer', 'parseAccount', 'parseMarket', 'parseCurrency',
    'parseBalance', 'parseFundingRate', 'parseLiquidation', 'parseMarginMode',
    'parseLeverage', 'parseBorrowInterest', 'parseDepositAddress', 'parseOpenInterest',
    'parseMarginModification', 'parseMarginLoan', 'parseConversion', 'parseGreek',
    'parseIncome', 'parseLastPrice', 'parseLedgerEntry', 'parseOrderBook',
    'parseDepositWithdrawFee', 'parseTradingFee', 'parseStatus', 'parseADLRank',
    'parseLongShortRatio', 'parsePositionMode', 'keysort', 'extend', 'deepExtend',
    'omit', 'safeBalance', 'parseBidsAsks',
]);

// string-only members
const STRING_MEMBERS = new Set ([
    'replace', 'replaceAll', 'trim', 'toUpperCase', 'toLowerCase', 'split',
    'startsWith', 'endsWith', 'padStart', 'padEnd', 'charAt', 'charCodeAt',
    'substring', 'substr', 'normalize', 'repeat',
]);

// list-only members
const LIST_MEMBERS = new Set ([
    'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'map', 'filter',
    'reduce', 'forEach', 'find', 'findIndex', 'flat', 'splice', 'join', 'some', 'every',
]);

// Functions that only make sense on a bare string payload. `parseJson` is
// deliberately NOT here: exchanges call it inside a defensive
// `if (typeof response === 'string')` branch on values that are normally
// objects/arrays, so it is evidence of a *possible* string, not a certain one.
const STRING_ARG_CALLEES = new Set ([
    'parseFloat', 'parseInt', 'parseNumber', 'parseToInt',
    'parseToNumeric', 'stringToBase64', 'decode', 'encode', 'numberToString',
]);

// -------------------------------------------------------------------------
// Inventory: which (exchange, method) pairs the generator emits
// -------------------------------------------------------------------------
interface Inventory {
    byExchange: { [ex: string]: string[] };
    methodNames: Set<string>;
    total: number;
}

function readInventory (): Inventory {
    const byExchange: { [ex: string]: string[] } = {};
    const methodNames = new Set<string> ();
    let total = 0;
    const dirs: [ string, string ][] = [ [ ABSTRACT_DIR, '' ], [ ABSTRACT_DIR + '/prediction', 'prediction/' ] ];
    for (const [ dir, prefix ] of dirs) {
        if (!fs.existsSync (dir)) {
            continue;
        }
        const files = fs.readdirSync (dir, { 'withFileTypes': true })
            .filter ((d) => d.isFile () && d.name.endsWith ('.ts'))
            .map ((d) => d.name);
        for (const file of files) {
            const ex = prefix + file.slice (0, -3);
            const text = fs.readFileSync (path.join (dir, file), 'utf8');
            const methods: string[] = [];
            const re = /^\s{4}([A-Za-z0-9_]+) \(params\?: \{\}\)/gm;
            let m = re.exec (text);
            while (m !== null) {
                methods.push (m[1]);
                methodNames.add (m[1]);
                total += 1;
                m = re.exec (text);
            }
            byExchange[ex] = methods;
        }
    }
    return { 'byExchange': byExchange, 'methodNames': methodNames, 'total': total };
}

// -------------------------------------------------------------------------
// Inheritance: derived exchanges (binanceus extends binance) inherit the
// classification of every endpoint they did not themselves call.
// -------------------------------------------------------------------------
function readParents (): { [ex: string]: string } {
    const parents: { [ex: string]: string } = {};
    for (const [ dir, prefix ] of [ [ './ts/src', '' ], [ './ts/src/prediction', 'prediction/' ] ]) {
        if (!fs.existsSync (dir)) {
            continue;
        }
        const files = fs.readdirSync (dir, { 'withFileTypes': true })
            .filter ((d) => d.isFile () && d.name.endsWith ('.ts'))
            .map ((d) => d.name);
        for (const file of files) {
            const text = fs.readFileSync (path.join (dir, file), 'utf8');
            const m = /export default class\s+([A-Za-z0-9_]+)\s+extends\s+([A-Za-z0-9_]+)/.exec (text);
            if (m !== null) {
                parents[prefix + m[1]] = prefix + m[2];
            }
        }
    }
    return parents;
}

// -------------------------------------------------------------------------
// Evidence collection
// -------------------------------------------------------------------------
interface Score { Dict: number; List: number; string: number }

type ScoreMap = { [key: string]: Score };

function emptyScore (): Score {
    return { 'Dict': 0, 'List': 0, 'string': 0 };
}

function addScore (scores: ScoreMap, key: string, shape: Shape, weight: number) {
    if (scores[key] === undefined) {
        scores[key] = emptyScore ();
    }
    scores[key][shape] += weight;
}

function isNumericIndex (node: ts.Expression): boolean {
    if (ts.isNumericLiteral (node)) {
        return true;
    }
    if (ts.isIdentifier (node)) {
        return /^(i|j|k|n|idx|index|pos)\d*$/.test (node.text);
    }
    if (ts.isBinaryExpression (node)) {
        return isNumericIndex (node.left) || isNumericIndex (node.right);
    }
    return false;
}

function isStringIndex (node: ts.Expression): boolean {
    if (ts.isStringLiteral (node)) {
        return true;
    }
    if (ts.isIdentifier (node)) {
        return /(Id|Key|Code|Symbol|Name|Currency|Market|Network|Type|Side|Status)$/.test (node.text);
    }
    return false;
}

function shapeFromTypeNode (t: ts.TypeNode | undefined): Shape | undefined {
    if (t === undefined) {
        return undefined;
    }
    const text = t.getText ();
    if (/\bDict\b|\bNullableDict\b|\bDictionary</.test (text) && !/\[\]/.test (text)) {
        return 'Dict';
    }
    if (/\[\]|\bList\b|\bNullableList\b|Array</.test (text)) {
        return 'List';
    }
    if (/^\s*(Str|string)\s*$/.test (text)) {
        return 'string';
    }
    return undefined;
}

// For `const [ a, b ] = await Promise.all ([ x, y ])`, given the array literal
// and one of its elements, return the binding name sitting at the same index.
function destructuredBinding (arr: ts.ArrayLiteralExpression, element: ts.Node): { name: string; decl: ts.Node } | undefined {
    const idx = arr.elements.indexOf (element as ts.Expression);
    if (idx < 0) {
        return undefined;
    }
    const promiseAll = arr.parent;
    if (promiseAll === undefined || !ts.isCallExpression (promiseAll)) {
        return undefined;
    }
    const callee = promiseAll.expression;
    if (!ts.isPropertyAccessExpression (callee) || callee.name.text !== 'all') {
        return undefined;
    }
    let outer: ts.Node = promiseAll;
    if (outer.parent !== undefined && ts.isAwaitExpression (outer.parent)) {
        outer = outer.parent;
    }
    const decl = outer.parent;
    if (decl === undefined || !ts.isVariableDeclaration (decl) || !ts.isArrayBindingPattern (decl.name)) {
        return undefined;
    }
    const el = decl.name.elements[idx];
    if (el === undefined || !ts.isBindingElement (el) || !ts.isIdentifier (el.name)) {
        return undefined;
    }
    return { 'name': el.name.text, 'decl': decl };
}

// Classify one *use* of the response value. `node` is the expression node that
// currently holds the response (either the call itself or an identifier bound
// to it). `follow` re-enters the walker for a new binding name, used when the
// value is forwarded through `Promise.all` destructuring.
function classifyUse (node: ts.Node, scores: ScoreMap, key: string, follow?: (name: string, decl: ts.Node) => void) {
    const parent = node.parent;
    if (parent === undefined) {
        return;
    }

    // `const [ a, b ] = await Promise.all ([ p1, p2 ])` — the value is still a
    // promise here; hand off to the binding that receives the resolved value.
    if (ts.isArrayLiteralExpression (parent) && follow !== undefined) {
        const bound = destructuredBinding (parent, node);
        if (bound !== undefined) {
            follow (bound.name, bound.decl);
        }
        return;
    }

    // response.foo / response.length / response[0] / response['a']
    if (ts.isPropertyAccessExpression (parent) && parent.expression === node) {
        const name = parent.name.text;
        if (name === 'length') {
            // legal on both string and array; arrays dominate raw responses
            addScore (scores, key, 'List', MEDIUM);
            return;
        }
        if (STRING_MEMBERS.has (name)) {
            addScore (scores, key, 'string', STRONG);
            return;
        }
        if (LIST_MEMBERS.has (name)) {
            addScore (scores, key, 'List', STRONG);
            return;
        }
        // any other named property read is an object field
        addScore (scores, key, 'Dict', STRONG);
        return;
    }

    if (ts.isElementAccessExpression (parent) && parent.expression === node) {
        const arg = parent.argumentExpression;
        if (isNumericIndex (arg)) {
            addScore (scores, key, 'List', STRONG);
        } else if (isStringIndex (arg)) {
            addScore (scores, key, 'Dict', STRONG);
        } else {
            addScore (scores, key, 'Dict', WEAK);
        }
        return;
    }

    // for (const x of response)  /  [ ...response ]
    if (ts.isForOfStatement (parent) && parent.expression === node) {
        addScore (scores, key, 'List', STRONG);
        return;
    }
    if (ts.isSpreadElement (parent) && ts.isArrayLiteralExpression (parent.parent)) {
        addScore (scores, key, 'List', STRONG);
        return;
    }
    // for (const k in response)
    if (ts.isForInStatement (parent) && parent.expression === node) {
        addScore (scores, key, 'Dict', MEDIUM);
        return;
    }

    // typeof response === 'string' / response === 'OK' / response === ''
    if (ts.isTypeOfExpression (parent)) {
        const cmp = parent.parent;
        if (cmp !== undefined && ts.isBinaryExpression (cmp) && ts.isStringLiteral (cmp.right)) {
            const lit = cmp.right.text;
            if (lit === 'string') {
                // A `typeof x === 'string'` test is weak evidence on its own: it
                // is just as often a defensive branch on a value that is
                // normally an object/array (binance re-parses a stringified body
                // that way). It only means "string" when nothing else about the
                // variable says otherwise, so let the other evidence outvote it.
                addScore (scores, key, 'string', WEAK);
            } else if (lit === 'object') {
                addScore (scores, key, 'Dict', WEAK);
            }
        }
        return;
    }
    if (ts.isBinaryExpression (parent)) {
        // `response = await this.endpoint (...)` — an if/else dispatch assigning
        // into a variable declared earlier. Follow that variable, otherwise the
        // whole branch contributes no evidence at all.
        if (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && parent.right === node && ts.isIdentifier (parent.left) && follow !== undefined) {
            follow (parent.left.text, parent);
            return;
        }
        const other = (parent.left === node) ? parent.right : parent.left;
        if (ts.isStringLiteral (other)) {
            // `response === ''` / `response === 'OK'` — comparing against a
            // string literal only type-checks if the value can be a string.
            addScore (scores, key, 'string', MEDIUM);
        }
        return;
    }

    // this.safeX (response, 'key') / this.safeX (response, 0)
    if (ts.isCallExpression (parent)) {
        const idx = parent.arguments.indexOf (node as ts.Expression);
        if (idx < 0) {
            return;
        }
        let callee = '';
        if (ts.isPropertyAccessExpression (parent.expression)) {
            callee = parent.expression.name.text;
        } else if (ts.isIdentifier (parent.expression)) {
            callee = parent.expression.text;
        }
        if (idx === 0 && /^safe[A-Z]/.test (callee)) {
            const second = parent.arguments[1];
            if (second !== undefined) {
                if (isNumericIndex (second)) {
                    addScore (scores, key, 'List', STRONG);
                } else if (isStringIndex (second)) {
                    addScore (scores, key, 'Dict', STRONG);
                } else if (ts.isArrayLiteralExpression (second)) {
                    addScore (scores, key, 'Dict', MEDIUM);
                }
            }
            return;
        }
        if (idx === 0 && LIST_FIRST_ARG.has (callee)) {
            addScore (scores, key, 'List', (callee === 'toArray') ? WEAK : MEDIUM);
            return;
        }
        if (idx === 0 && DICT_FIRST_ARG.has (callee)) {
            addScore (scores, key, 'Dict', MEDIUM);
            return;
        }
        if (STRING_ARG_CALLEES.has (callee)) {
            addScore (scores, key, 'string', STRONG);
            return;
        }
        if (callee === 'keys' || callee === 'values' || callee === 'entries') {
            addScore (scores, key, 'Dict', MEDIUM);
            return;
        }
        return;
    }

    // return response;  -> take the declared return type of the enclosing fn
    if (ts.isReturnStatement (parent)) {
        let fn: ts.Node | undefined = parent.parent;
        while (fn !== undefined && !ts.isMethodDeclaration (fn) && !ts.isFunctionDeclaration (fn) && !ts.isArrowFunction (fn) && !ts.isFunctionExpression (fn)) {
            fn = fn.parent;
        }
        if (fn !== undefined && (ts.isMethodDeclaration (fn) || ts.isFunctionDeclaration (fn) || ts.isArrowFunction (fn) || ts.isFunctionExpression (fn))) {
            const rt = (fn as ts.SignatureDeclaration).type;
            if (rt !== undefined) {
                let inner = rt;
                if (ts.isTypeReferenceNode (rt) && rt.typeName.getText () === 'Promise' && rt.typeArguments !== undefined) {
                    inner = rt.typeArguments[0];
                }
                const shape = shapeFromTypeNode (inner);
                if (shape !== undefined) {
                    addScore (scores, key, shape, WEAK);
                }
            }
        }
        return;
    }
}

function collectFromFile (
    file: string,
    exchange: string,
    methodNames: Set<string>,
    scores: ScoreMap,
    seen: { [key: string]: number },
) {
    const text = fs.readFileSync (file, 'utf8');
    const sf = ts.createSourceFile (file, text, ts.ScriptTarget.ES2022, true);

    // find the enclosing function body of a node
    function enclosingBody (node: ts.Node): ts.Node | undefined {
        let n: ts.Node | undefined = node.parent;
        while (n !== undefined) {
            if (ts.isMethodDeclaration (n) || ts.isFunctionDeclaration (n) || ts.isArrowFunction (n) || ts.isFunctionExpression (n)) {
                return n.body;
            }
            n = n.parent;
        }
        return undefined;
    }

    function visit (node: ts.Node) {
        if (ts.isCallExpression (node) && ts.isPropertyAccessExpression (node.expression)) {
            const recv = node.expression.expression;
            const name = node.expression.name.text;
            if (recv.kind === ts.SyntaxKind.ThisKeyword && methodNames.has (name)) {
                const key = exchange + '.' + name;
                seen[key] = (seen[key] || 0) + 1;
                // the value node is the call, or the await wrapping it
                let value: ts.Node = node;
                if (node.parent !== undefined && ts.isAwaitExpression (node.parent)) {
                    value = node.parent;
                }
                const parent = value.parent;
                if (parent !== undefined && ts.isVariableDeclaration (parent) && ts.isIdentifier (parent.name)) {
                    // annotated declaration is itself evidence
                    const declared = shapeFromTypeNode (parent.type);
                    if (declared !== undefined) {
                        addScore (scores, key, declared, MEDIUM);
                    }
                    followBinding (parent.name.text, parent, key);
                } else {
                    classifyUse (value, scores, key, (n, d) => followBinding (n, d, key));
                }
            }
        }
        ts.forEachChild (node, visit);
    }

    // walk every later mention of `varName` inside the function that declares it
    function followBinding (varName: string, decl: ts.Node, key: string, depth = 0) {
        const body = enclosingBody (decl);
        if (body === undefined || depth > 3) {
            return;
        }
        const walk = (n: ts.Node) => {
            if (ts.isIdentifier (n) && n.text === varName && n.parent !== decl) {
                classifyUse (n, scores, key, (nm, d) => followBinding (nm, d, key, depth + 1));
            }
            ts.forEachChild (n, walk);
        };
        ts.forEachChild (body, walk);
    }

    visit (sf);
}

// -------------------------------------------------------------------------
// Decide
// -------------------------------------------------------------------------
function decide (s: Score): Shape | undefined {
    const entries: [ Shape, number ][] = [ [ 'Dict', s.Dict ], [ 'List', s.List ], [ 'string', s.string ] ];
    entries.sort ((a, b) => b[1] - a[1]);
    if (entries[0][1] === 0) {
        return undefined;
    }
    if (entries[0][1] === entries[1][1]) {
        return undefined;
    }
    return entries[0][0];
}

function main () {
    const inv = readInventory ();
    const parents = readParents ();
    const scores: ScoreMap = {};
    const seen: { [key: string]: number } = {};

    for (const [ dir, prefix ] of SOURCE_DIRS) {
        if (!fs.existsSync (dir)) {
            continue;
        }
        const files = fs.readdirSync (dir, { 'withFileTypes': true })
            .filter ((d) => d.isFile () && d.name.endsWith ('.ts'))
            .map ((d) => path.join (dir, d.name));
        for (const file of files) {
            const exchange = prefix + path.basename (file, '.ts');
            collectFromFile (file, exchange, inv.methodNames, scores, seen);
        }
    }

    // direct classification per (exchange, method)
    const direct: { [key: string]: Shape } = {};
    for (const key of Object.keys (scores)) {
        const d = decide (scores[key]);
        if (d !== undefined) {
            direct[key] = d;
        }
    }

    // Name-level consensus, used only to fill exchanges that never call the
    // endpoint themselves. Requires unanimity: the same method name can carry
    // different shapes on different venues (btcbox's publicGetTickers is an
    // object keyed by market id, while most exchanges' is an array), so a
    // simple majority would confidently mislabel the minority.
    const byName: { [name: string]: Score } = {};
    for (const key of Object.keys (direct)) {
        const name = key.slice (key.lastIndexOf ('.') + 1);
        if (byName[name] === undefined) {
            byName[name] = emptyScore ();
        }
        byName[name][direct[key]] += 1;
    }
    const nameConsensus: { [name: string]: Shape } = {};
    for (const name of Object.keys (byName)) {
        const s = byName[name];
        const nonZero = ([ 'Dict', 'List', 'string' ] as Shape[]).filter ((k) => s[k] > 0);
        if (nonZero.length === 1) {
            nameConsensus[name] = nonZero[0];
        }
    }

    function ancestors (ex: string): string[] {
        const chain: string[] = [];
        let cur = parents[ex];
        while (cur !== undefined && cur !== 'Exchange' && cur !== 'prediction/PredictionExchange' && chain.length < 12) {
            chain.push (cur);
            cur = parents[cur];
        }
        return chain;
    }

    const result: { [ex: string]: { [m: string]: string } } = {};
    const shapeCounts: { [shape: string]: number } = {};
    const stats = {
        'total': inv.total,
        'unclassified': 0,
        'viaCallSite': 0,
        'viaInheritance': 0,
        'viaNameConsensus': 0,
        'viaOverride': 0,
        'endpointsWithCallSites': Object.keys (seen).length,
    };

    for (const ex of Object.keys (inv.byExchange)) {
        const chain = ancestors (ex);
        for (const m of inv.byExchange[ex]) {
            const key = ex + '.' + m;
            let shape: Shape | undefined;
            let how = '';
            const ov = OVERRIDES[ex];
            if (ov !== undefined && ov[m] !== undefined) {
                shape = ov[m] as Shape;
                how = 'override';
            } else if (direct[key] !== undefined) {
                shape = direct[key];
                how = 'callsite';
            } else {
                for (const anc of chain) {
                    if (direct[anc + '.' + m] !== undefined) {
                        shape = direct[anc + '.' + m];
                        how = 'inheritance';
                        break;
                    }
                }
                if (shape === undefined && nameConsensus[m] !== undefined) {
                    shape = nameConsensus[m];
                    how = 'nameConsensus';
                }
            }
            if (shape === undefined) {
                stats.unclassified += 1;
                continue;
            }
            if (result[ex] === undefined) {
                result[ex] = {};
            }
            result[ex][m] = shape;
            shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
            if (how === 'callsite') {
                stats.viaCallSite += 1;
            } else if (how === 'inheritance') {
                stats.viaInheritance += 1;
            } else if (how === 'nameConsensus') {
                stats.viaNameConsensus += 1;
            } else {
                stats.viaOverride += 1;
            }
        }
    }

    fs.writeFileSync (OUT_FILE, JSON.stringify (result, null, 0) + '\n');
    // eslint-disable-next-line no-console
    console.log (JSON.stringify ({ 'shapes': shapeCounts, ...stats }, null, 2));
}

main ();
