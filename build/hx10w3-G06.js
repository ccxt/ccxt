// ===== hx10 wave3 G06: nil-declared locals typed from the tuple slot that writes them =====
//
// `let params = undefined` prints `var params any = nil`; every later write decides the type. The U03
// join in go-local-types.js covers plain `params = <map producer>` writes only -- a destructuring
// write `[ value, params ] = this.handleOptionBoolAndParams (..)` is rejected outright, so the ~180
// param bags of the handle*AndParams family stay `any` and their `GetValue`/`InOp` reads stay helpers.
//
// Those Go twins are HAND-WRITTEN with a concrete tuple return ((*string|bool|int64, map[string]any),
// HandleUntilOption: (map[string]any, map[string]any)), so the printed assignment already carries a
// map[string]any for that slot: naming it on the declaration is the whole change, no conversion.
// Producers whose Go twin answers `[]any` (HandlePostOnly, HandleParamString/Bool/Integer,
// HandleNetworkCodeAndParams, HandleOption*AndParams, the *Nullable family) are NOT in the table:
// their slots print through GetValue and stay `any`.
//
// Two outcomes per declaration: every write is that slot (or a plain write the printer classifies
// as map[string]any) and every read is either dominated by a write or one the typed nil answers the
// same way -> `var x map[string]any = nil`; anything else stays `var x any = nil` untouched.

import { ts } from './csharp-local-types.js';

// slot indices the Go twin returns as map[string]any. Only the producers whose pair the printed
// `x, y = this.HandleX (..)` join can absorb: element 0 is a bool / int64 / map, so the write
// needs no MapTyped wrapper. A *string element 0 (`handleMarginModeAndParams`,
// `handleMarketTypeAndParams`, `handleSubTypeAndParams`, `handleOptionStringAndParams*`) prints the
// pair as a `[]any` holder, and typing slot 1 there costs a MapTyped per write -- excluded.
const HX10G06_TUPLE_MAP_SLOTS = {
    'handleOptionBoolAndParams': [ 1 ],
    'handleOptionBoolAndParams2': [ 1 ],
    'handleOptionIntegerAndParams': [ 1 ],
    'handleOptionIntegerAndParams2': [ 1 ],
    'handleUntilOption': [ 0, 1 ],
};

const HX10G06_JOIN_TYPE = 'map[string]any';

// a value overload only prints its typed pair when the default is a literal; a variable default
// selects the *Nullable twin (a []any holder, where the map slot needs MapTyped)
const HX10G06_TUPLE_DEFAULT_SLOT = {
    'handleOptionBoolAndParams': 3, 'handleOptionBoolAndParams2': 4,
    'handleOptionIntegerAndParams': 3, 'handleOptionIntegerAndParams2': 4,
};

function hx10G06DefaultIsValue (arg) {
    if ((arg?.kind === ts.SyntaxKind.TrueKeyword) || (arg?.kind === ts.SyntaxKind.FalseKeyword)) {
        return true;
    }
    const literal = ((arg?.kind === ts.SyntaxKind.PrefixUnaryExpression) && (arg.operator === ts.SyntaxKind.MinusToken))
        ? arg.operand : arg;
    return (literal?.kind === ts.SyntaxKind.NumericLiteral) && /^\d+$/.test (literal.text ?? '');
}

// a local literally named after a Go type cannot be declared with a type
const HX10G06_GUARD_NAMES = [ 'string', 'int', 'int64', 'float64', 'bool', 'any', 'byte' ];

// callees that derefScalar their first argument (or read it as a dictionary) at entry: a typed nil
// map and the absent box answer them the same, so a read through one keeps the box's meaning
const HX10G06_ABSENT_SAFE_CALLEES = [
    'GetValue', 'InOp', 'ObjectKeys', 'ObjectValues', 'GetArrayLength', 'ToArray', 'CastToSlice',
    'IsDictionary', 'IsArray', 'MapTyped', 'ListTyped', 'SafeMapToMap',
    'this.SafeValue', 'this.SafeDict', 'this.SafeDict2', 'this.SafeList', 'this.SafeList2',
    'this.Omit', 'this.OmitN', 'this.OmitMap', 'this.Extend', 'this.DeepExtend', 'this.DeepExtend2',
    'this.Merge', 'this.Aggregate', 'this.SafeString', 'this.SafeString2', 'this.SafeStringN',
    'this.SafeInteger', 'this.SafeInteger2', 'this.SafeIntegerN', 'this.SafeNumber',
    'this.SafeNumber2', 'this.SafeNumberN', 'this.SafeBool', 'this.SafeBool2', 'this.SafeBoolN',
    'this.InOp',
];

function hx10G06IsNilInitializer (goTranspiler, initializer) {
    if (initializer === undefined) {
        return true; // `let x;`
    }
    if (initializer.kind === ts.SyntaxKind.NullKeyword) {
        return true;
    }
    if (initializer.kind === ts.SyntaxKind.Identifier) {
        return (initializer.text === 'undefined') || (initializer.text === 'null');
    }
    return false;
}

// the TS callee name of `this.handleX (..)` -- the printed callee capitalises, the table is TS-side
function hx10G06CalleeName (node) {
    let current = node;
    while ((current?.kind === ts.SyntaxKind.ParenthesizedExpression) || (current?.kind === ts.SyntaxKind.AwaitExpression)) {
        current = (current.kind === ts.SyntaxKind.ParenthesizedExpression) ? current.expression : current.expression;
    }
    if (current?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = current.expression;
    if ((callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) || (callee.expression?.kind !== ts.SyntaxKind.ThisKeyword)) {
        return undefined;
    }
    return callee.name?.text;
}

// `[ a, x ] = this.handleUntilOption (..)` at statement level -> HX10G06_JOIN_TYPE
function hx10G06TupleWriteType (expression, name) {
    if (expression?.kind !== ts.SyntaxKind.BinaryExpression) {
        return undefined;
    }
    if (expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
        return undefined;
    }
    const left = expression.left;
    if (left?.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return undefined;
    }
    const slots = left.elements ?? [];
    if (slots.length !== 2) {
        return undefined;                                     // every table producer answers two values
    }
    if (!slots.every ((element) => element?.kind === ts.SyntaxKind.Identifier)) {
        return undefined;                                     // a spread / property target prints differently
    }
    const index = slots.findIndex ((element) => element.text === name);
    const callee = hx10G06CalleeName (expression.right);
    const mapSlots = (callee === undefined) ? undefined : HX10G06_TUPLE_MAP_SLOTS[callee];
    if ((mapSlots === undefined) || !mapSlots.includes (index)) {
        return undefined;
    }
    // the call must be whole on the right-hand side: `[a, x] = this.handleX (..) ?? y` is not a tuple
    if (expression.right?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    // a non-literal default selects the *Nullable twin, whose pair prints as a []any holder
    const defaultSlot = HX10G06_TUPLE_DEFAULT_SLOT[callee];
    if ((defaultSlot !== undefined) && !hx10G06DefaultIsValue (expression.right.arguments[defaultSlot])) {
        return undefined;
    }
    return HX10G06_JOIN_TYPE;
}

// `x = holder[i]` where the holder is a local the printer already declared `[]map[string]any`
// (the PromiseAllTyped destructuring): the element is that map on every path, no conversion needed
function hx10G06IndexWriteType (goTranspiler, right) {
    if ((right?.kind !== ts.SyntaxKind.ElementAccessExpression) || (right.expression?.kind !== ts.SyntaxKind.Identifier)) {
        return undefined;
    }
    const index = right.argumentExpression;
    if ((index?.kind !== ts.SyntaxKind.NumericLiteral) || !/^\d+$/.test (index.text ?? '')) {
        return undefined;
    }
    if (typeof goTranspiler.goDeclaredTypeOfIdentifier !== 'function') {
        return undefined;
    }
    const holderType = goTranspiler.goDeclaredTypeOfIdentifier (right.expression);
    if ((typeof holderType !== 'string') || !holderType.startsWith ('[]')) {
        return undefined;
    }
    return (holderType.substring (2) === HX10G06_JOIN_TYPE) ? HX10G06_JOIN_TYPE : undefined;
}

// a callee whose first argument is read as a dictionary at entry
function hx10G06PrintedCallee (goTranspiler, call) {
    if (call?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const printed = (goTranspiler.printNode (call.expression, 0) ?? '').trim ();
    if (!/^[A-Za-z_][\w.]*$/.test (printed)) {
        return undefined;
    }
    const plain = printed.replace (/^ccxt\./, '').replace (/^exchange\./, 'this.');
    return plain;
}

// a read that produces the same Go value for a typed nil map as for the absent box it replaces:
// nil tests, truthiness, dictionary reads, absent-tolerant helpers, and a value stored into a container
function hx10G06ReadKeepsMeaning (goTranspiler, node) {
    let child = node;
    let parent = node.parent;
    while (parent?.kind === ts.SyntaxKind.ParenthesizedExpression) {
        child = parent;
        parent = parent.parent;
    }
    switch (parent?.kind) {
    case ts.SyntaxKind.BinaryExpression: {
        const op = parent.operatorToken.kind;
        if ([ ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.EqualsEqualsEqualsToken,
            ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken ].indexOf (op) >= 0) {
            const other = (parent.left === child) ? parent.right : parent.left;
            return (other?.kind === ts.SyntaxKind.NullKeyword)
                || ((other?.kind === ts.SyntaxKind.Identifier) && ((other.text === 'undefined') || (other.text === 'null')));
        }
        if (op === ts.SyntaxKind.InKeyword) {
            return parent.right === child;                    // `k in params` prints InOp (nil-safe)
        }
        if ((op === ts.SyntaxKind.AmpersandAmpersandToken) || (op === ts.SyntaxKind.BarBarToken)) {
            return hx10G06IsCondition (parent);
        }
        if (op === ts.SyntaxKind.EqualsToken) {
            if (parent.right === child) {
                // `container[key] = x` boxes the map, an absent box stores a JSON null
                const target = parent.left?.kind;
                return (target === ts.SyntaxKind.ElementAccessExpression) || (target === ts.SyntaxKind.PropertyAccessExpression);
            }
            return false;                                     // our own write: the join covers it
        }
        return false;
    }
    case ts.SyntaxKind.PrefixUnaryExpression:
        return parent.operator === ts.SyntaxKind.ExclamationToken;
    case ts.SyntaxKind.IfStatement:
    case ts.SyntaxKind.WhileStatement:
    case ts.SyntaxKind.ConditionalExpression:
        return (parent.expression === child) || (parent.condition === child);
    case ts.SyntaxKind.ElementAccessExpression: {
        if (parent.expression !== child) {
            return false;
        }
        const above = parent.parent;
        return !((above?.kind === ts.SyntaxKind.BinaryExpression) && (above.left === parent)
            && (above.operatorToken.kind === ts.SyntaxKind.EqualsToken));
    }
    case ts.SyntaxKind.PropertyAccessExpression: {
        if (parent.expression !== child) {
            return false;                                     // a property name, not a use
        }
        const above = parent.parent;
        return !((above?.kind === ts.SyntaxKind.BinaryExpression) && (above.left === parent)
            && (above.operatorToken.kind === ts.SyntaxKind.EqualsToken));
    }
    case ts.SyntaxKind.PropertyAssignment:
        return parent.initializer === child;
    case ts.SyntaxKind.ShorthandPropertyAssignment:
        return true;
    case ts.SyntaxKind.CallExpression: {
        if (parent.arguments.indexOf (child) < 0) {
            return false;
        }
        const callee = hx10G06PrintedCallee (goTranspiler, parent);
        if (callee === 'len') {
            return parent.arguments.length === 1;              // len(nil map) is 0
        }
        if (callee === 'EvalTruthy') {
            return true;                                       // nil map is falsy for both
        }
        if (callee === 'IsEqual') {
            const other = (parent.arguments[0] === child) ? parent.arguments[1] : parent.arguments[0];
            return (other?.kind === ts.SyntaxKind.NullKeyword)
                || ((other?.kind === ts.SyntaxKind.Identifier) && ((other.text === 'undefined') || (other.text === 'null')));
        }
        return (callee !== undefined) && HX10G06_ABSENT_SAFE_CALLEES.includes (callee);
    }
    case ts.SyntaxKind.ForOfStatement:
    case ts.SyntaxKind.ForInStatement:
        return parent.expression === child;                     // range over a nil map yields nothing
    }
    return false;
}

function hx10G06IsCondition (node) {
    let current = node;
    let parent = node.parent;
    while ((parent?.kind === ts.SyntaxKind.ParenthesizedExpression)
        || ((parent?.kind === ts.SyntaxKind.BinaryExpression)
            && [ ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken ].includes (parent.operatorToken.kind))) {
        current = parent;
        parent = parent.parent;
    }
    return ((parent?.kind === ts.SyntaxKind.IfStatement) && (parent.expression === current))
        || ((parent?.kind === ts.SyntaxKind.WhileStatement) && (parent.expression === current))
        || ((parent?.kind === ts.SyntaxKind.PrefixUnaryExpression) && (parent.operator === ts.SyntaxKind.ExclamationToken));
}

function hx10G06InNestedFunction (node, scope) {
    let current = node.parent;
    while ((current !== undefined) && (current !== scope)) {
        if ((current.kind === ts.SyntaxKind.FunctionDeclaration) || (current.kind === ts.SyntaxKind.FunctionExpression)
            || (current.kind === ts.SyntaxKind.ArrowFunction) || (current.kind === ts.SyntaxKind.MethodDeclaration)
            || (current.kind === ts.SyntaxKind.Constructor)) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

function hx10G06BindingMentionsName (node, name) {
    if (node === undefined) {
        return false;
    }
    if (node.kind === ts.SyntaxKind.Identifier) {
        return node.text === name;
    }
    let found = false;
    const visit = (child) => {
        if (found) {
            return;
        }
        if ((child?.kind === ts.SyntaxKind.Identifier) && (child.text === name)) {
            found = true;
            return;
        }
        child?.forEachChild (visit);
    };
    node.forEachChild (visit);
    return found;
}

// definite-assignment walk: `assigned` is true where a write ran on every path reaching the node
function hx10G06JoinType (goTranspiler, declaration, name) {
    const scope = (typeof goTranspiler.goEnclosingFunction === 'function')
        ? goTranspiler.goEnclosingFunction (declaration)
        : undefined;
    if (scope === undefined) {
        return undefined;
    }
    const state = { 'ok': true, 'goType': undefined, 'writes': 0 };
    const fail = () => { state.ok = false; };

    const isName = (node) => (node?.kind === ts.SyntaxKind.Identifier) && (node.text === name);

    // the write join: one concrete type for every write, map[string]any only
    const joinWrite = (goType) => {
        if (goType === undefined) {
            fail ();
            return;
        }
        if (state.goType === undefined) {
            state.goType = goType;
        } else if (state.goType !== goType) {
            fail ();
            return;
        }
        state.writes += 1;
    };

    const readExpression = (node, assigned) => {
        if (!state.ok || (node === undefined) || (node === null)) {
            return;
        }
        if (node.kind === ts.SyntaxKind.Identifier) {
            if (isName (node) && (node !== declaration.name)) {
                hx10G06ClassifyUse (node, assigned, readExpression, joinWrite, fail, scope, goTranspiler);
            }
            return;
        }
        if ((node !== scope) && ts.isFunctionLike (node)) {
            if (hx10G06BindingMentionsName (node.body, name)) {
                fail ();                                      // a closure over x: its call order is unknowable
            }
            return;
        }
        node.forEachChild ((child) => readExpression (child, assigned));
    };

    const visitStatement = (node, assigned) => {
        if (!state.ok || (node === undefined) || (node === null)) {
            return assigned;
        }
        switch (node.kind) {
        case ts.SyntaxKind.Block: {
            let current = assigned;
            for (const statement of node.statements) {
                current = visitStatement (statement, current);
            }
            return current;
        }
        case ts.SyntaxKind.ExpressionStatement: {
            const expression = node.expression;
            if ((expression?.kind === ts.SyntaxKind.BinaryExpression)
                && (expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) && isName (expression.left)) {
                // `x = <rhs>`: the right-hand side must print the joined type
                readExpression (expression.right, assigned);
                const goType = hx10G06IndexWriteType (goTranspiler, expression.right)
                    ?? goTranspiler.goTypeOfInitializer (expression.right, goTranspiler.printNode (expression.right, 0));
                joinWrite (goType);
                return state.ok;
            }
            const slotType = hx10G06TupleWriteType (expression, name);
            if (slotType !== undefined) {
                readExpression (expression.right, assigned);
                joinWrite (slotType);
                return state.ok;
            }
            readExpression (expression, assigned);
            return assigned;
        }
        case ts.SyntaxKind.VariableStatement: {
            let current = assigned;
            for (const child of node.declarationList.declarations) {
                if (isName (child.name)) {
                    if (child === declaration) {
                        current = false;                      // x is nil again from here
                    } else {
                        fail ();                              // a sibling binding of the same name
                    }
                }
                readExpression (child.initializer, current);
            }
            return current;
        }
        case ts.SyntaxKind.IfStatement: {
            readExpression (node.expression, assigned);
            const thenAssigned = visitStatement (node.thenStatement, assigned);
            const elseAssigned = (node.elseStatement === undefined) ? assigned : visitStatement (node.elseStatement, assigned);
            return thenAssigned && elseAssigned;
        }
        case ts.SyntaxKind.ForStatement: {
            visitStatement (node.initializer, assigned);
            readExpression (node.condition, assigned);
            readExpression (node.incrementor, assigned);
            visitStatement (node.statement, assigned);
            return assigned;                                  // the body may not run
        }
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement: {
            readExpression (node.expression, assigned);
            visitStatement (node.statement, assigned);
            return assigned;
        }
        case ts.SyntaxKind.SwitchStatement: {
            readExpression (node.expression, assigned);
            for (const clause of node.caseBlock.clauses) {
                readExpression (clause.expression, assigned);
                for (const statement of clause.statements) {
                    visitStatement (statement, assigned);
                }
            }
            return assigned;
        }
        case ts.SyntaxKind.TryStatement: {
            visitStatement (node.tryBlock, assigned);
            if (node.catchClause !== undefined) {
                visitStatement (node.catchClause.block, assigned);
            }
            visitStatement (node.finallyBlock, assigned);
            return assigned;                                  // an exception may skip the try block
        }
        case ts.SyntaxKind.ReturnStatement:
        case ts.SyntaxKind.ThrowStatement: {
            readExpression (node.expression, assigned);
            return true;                                      // no read after it on this path
        }
        case ts.SyntaxKind.EmptyStatement:
        case ts.SyntaxKind.BreakStatement:
        case ts.SyntaxKind.ContinueStatement:
            return assigned;
        default: {
            if (hx10G06BindingMentionsName (node, name)) {
                fail ();                                      // an unmodelled statement shape
            }
            return assigned;
        }
        }
    };

    // any other binding of the same name in the scope: give up
    const shadowingWalk = (node) => {
        if (state.ok === false) {
            return;
        }
        if ((node !== declaration)
            && ((node?.kind === ts.SyntaxKind.VariableDeclaration) || (node?.kind === ts.SyntaxKind.Parameter))
            && hx10G06BindingMentionsName (node.name, name)) {
            fail ();
            return;
        }
        node?.forEachChild (shadowingWalk);
    };
    scope.forEachChild (shadowingWalk);
    if (!state.ok) {
        return undefined;
    }
    const body = (scope.kind === ts.SyntaxKind.SourceFile)
        ? scope.statements
        : (ts.isBlock (scope.body) ? scope.body.statements : [ scope.body ]);
    let reached = false;
    for (const statement of body) {
        reached = visitStatement (statement, reached);
        if (!state.ok) {
            return undefined;
        }
    }
    if ((state.writes === 0) || (state.goType !== HX10G06_JOIN_TYPE)) {
        return undefined;
    }
    if ((typeof goTranspiler.goTypeNameIsShadowed === 'function') && goTranspiler.goTypeNameIsShadowed (scope, state.goType)) {
        return undefined;
    }
    return state.goType;
}

// one occurrence of the local outside a plain write: every read must be dominated by a write, or
// answer the same for the typed nil as it did for the absent box
function hx10G06ClassifyUse (node, assigned, readExpression, joinWrite, fail, scope, goTranspiler) {
    const parent = node.parent;
    if (parent === undefined) {
        fail ();
        return;
    }
    if (hx10G06InNestedFunction (node, scope)) {
        fail ();
        return;
    }
    if (parent.kind === ts.SyntaxKind.PostfixUnaryExpression || parent.kind === ts.SyntaxKind.PrefixUnaryExpression) {
        const op = parent.operator;
        if ((op === ts.SyntaxKind.PlusPlusToken) || (op === ts.SyntaxKind.MinusMinusToken)) {
            fail ();                                          // x++ prints x = Add (x, 1)
            return;
        }
    }
    if (parent.kind === ts.SyntaxKind.SpreadElement) {
        fail ();                                              // ...x forwards the boxed value
        return;
    }
    if ((parent.kind === ts.SyntaxKind.PropertyAccessExpression) && (parent.expression === node)
        && (parent.name?.text === 'push')) {
        fail ();                                              // AppendToArray(&x, ..) needs an `any` box
        return;
    }
    if (parent.kind === ts.SyntaxKind.ArrayLiteralExpression
        && (parent.parent?.kind === ts.SyntaxKind.BinaryExpression) && (parent.parent.left === parent)) {
        fail ();                                              // a destructuring target outside our table
        return;
    }
    if (((parent.kind === ts.SyntaxKind.ElementAccessExpression) || (parent.kind === ts.SyntaxKind.PropertyAccessExpression))
        && (parent.expression === node)) {
        const above = parent.parent;
        if ((above?.kind === ts.SyntaxKind.BinaryExpression) && (above.left === parent)
            && ((above.operatorToken.kind === ts.SyntaxKind.EqualsToken)
                || ((above.operatorToken.kind >= ts.SyntaxKind.FirstCompoundAssignment)
                    && (above.operatorToken.kind <= ts.SyntaxKind.LastCompoundAssignment)))) {
            if (!assigned) {
                fail ();                                      // the element write needs the map the earlier write built
            }
            return;
        }
    }
    if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.left === node)) {
        const op = parent.operatorToken.kind;
        if (op === ts.SyntaxKind.EqualsToken) {
            const goType = hx10G06IndexWriteType (goTranspiler, parent.right)
                ?? goTranspiler.goTypeOfInitializer (parent.right, goTranspiler.printNode (parent.right, 0));
            joinWrite (goType);
            return;
        }
        if ((op >= ts.SyntaxKind.FirstCompoundAssignment) && (op <= ts.SyntaxKind.LastCompoundAssignment)) {
            fail ();                                          // `x += ..` needs the value
            return;
        }
    }
    if ((parent.kind === ts.SyntaxKind.BinaryExpression) && (parent.right === node)
        && (parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
        fail ();                                              // `y = x` copies the box into another local
        return;
    }
    if (!assigned) {
        if (!hx10G06ReadKeepsMeaning (goTranspiler, node)) {
            fail ();
        }
    }
}

export function installHx10G06NilDeclaredTupleJoins (goTranspiler) {
    if ((goTranspiler === undefined) || goTranspiler.__hx10G06TupleJoinsInstalled
        || (typeof goTranspiler.printVariableDeclarationList !== 'function')) {
        return;
    }
    const upstream = goTranspiler.printVariableDeclarationList.bind (goTranspiler);
    const nilDeclaration = new RegExp ('^([\\t ]*)var (\\w+) any = ' + goTranspiler.UNDEFINED_TOKEN + '$');
    goTranspiler.printVariableDeclarationList = (node, indentation) => {
        const printed = upstream (node, indentation);
        if (typeof printed !== 'string') {
            return printed;
        }
        const parsed = printed.match (nilDeclaration);
        if ((parsed === null) || (node?.parent?.kind !== ts.SyntaxKind.VariableStatement)
            || (node.declarations?.length !== 1)) {
            return printed;
        }
        const declaration = node.declarations[0];
        if (!ts.isIdentifier (declaration?.name) || (declaration.initializer === undefined)
            || !hx10G06IsNilInitializer (goTranspiler, declaration.initializer)) {
            return printed;
        }
        const name = declaration.name.text;
        if (HX10G06_GUARD_NAMES.indexOf (name) >= 0) {
            return printed;
        }
        if (parsed[2] !== name) {
            return printed;                                   // the printer printed another declarator
        }
        const goType = hx10G06JoinType (goTranspiler, declaration, name);
        if (goType === undefined) {
            return printed;
        }
        // publish the type the line prints, so every later pass reads this local as that type
        // (the tuple-element write then gets its MapTyped view instead of the raw box)
        goTranspiler.goDeclaredTypeCache?.set (declaration, goType);
        return parsed[1] + 'var ' + parsed[2] + ' ' + goType + ' = ' + goTranspiler.UNDEFINED_TOKEN;
    };
    goTranspiler.__hx10G06TupleJoinsInstalled = true;
}

// ------------------------------- self-test -------------------------------
// The proof is AST-side, so the test drives it on a parsed snippet with the printer's classification
// replaced by a stub: one table of printed initializer -> Go type, plus the scope walker.
const HX10G06_SELF_INITIALIZER_TYPES = {
    'this.extend (a, b)': 'map[string]any',
    'this.safeDict (a, b)': 'map[string]any',
    '[]': '[]any',
    '{}': 'map[string]any',
};

function hx10G06SelfTranspiler () {
    const enclosing = (node) => {
        let current = node?.parent;
        while (current !== undefined) {
            if ([ ts.SyntaxKind.MethodDeclaration, ts.SyntaxKind.FunctionDeclaration, ts.SyntaxKind.FunctionExpression,
                ts.SyntaxKind.ArrowFunction, ts.SyntaxKind.Constructor, ts.SyntaxKind.SourceFile ].indexOf (current.kind) >= 0) {
                return current;
            }
            current = current.parent;
        }
        return undefined;
    };
    return {
        'UNDEFINED_TOKEN': 'nil',
        'goEnclosingFunction': enclosing,
        'goTypeNameIsShadowed': () => false,
        'goDeclaredTypeOfIdentifier': (node) => (['bank'].includes (node?.text) ? '[]map[string]any' : (node?.text === 'rows' ? '[][NRP_DB90044229752D39BD22822A1CF943F5]' : undefined)),
        'printNode': (node) => ((node === undefined) ? '' : node.getText ().replace (/^this\.([a-z])/, (m, c) => 'this.' + c.toUpperCase ())),
        'goTypeOfInitializer': (node) => {
            if (node === undefined) {
                return undefined;
            }
            return HX10G06_SELF_INITIALIZER_TYPES[node.getText ()];
        },
    };
}

function hx10G06SelfJoin (source) {
    const file = ts.createSourceFile ('t.ts', source, ts.ScriptTarget.Latest, true);
    const transpiler = hx10G06SelfTranspiler ();
    const printed = [];
    const visit = (node) => {
        if ((node.kind === ts.SyntaxKind.VariableDeclaration) && ts.isIdentifier (node.name)
            && hx10G06IsNilInitializer (transpiler, node.initializer)) {
            const goType = hx10G06JoinType (transpiler, node, node.name.text);
            if (goType !== undefined) {
                printed.push (node.name.text + ' ' + goType);
            }
        }
        node.forEachChild (visit);
    };
    visit (file);
    return printed.join (';');
}

export function hx10G06Check () {
    const problems = [];
    const ok = (condition, message) => { if (!condition) { problems.push (message); } };
    const joins = (body, expected) => ok (hx10G06SelfJoin (body) === expected, 'expected [' + expected + '] from: ' + body.replace (/\s+/g, ' '));
    const method = (body) => '\nclass X {\n    m (a: any, b: any, c: any) {\n' + body + '\n    }\n}\n';

    // a hand-written twin's map slot types the param bag
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        let stock = false;\n        [ stock, bag ] = this.handleOptionBoolAndParams (a, b, c, false);\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        let count = 0;\n        [ count, bag ] = this.handleOptionIntegerAndParams (a, b, c, 0);\n        return bag;'), 'bag map[string]any');
    // the same slot written twice joins on one type
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        [ c, bag ] = this.handleUntilOption (a, c);\n        return bag;'), 'bag map[string]any');
    // a variable default selects the *Nullable twin: its holder costs a MapTyped, so it stays `any`
    joins (method ('let bag = undefined;\n        let flag = false;\n        [ flag, bag ] = this.handleOptionBoolAndParams (a, b, c, a);\n        return bag;'), '');
    // a producer whose pair cannot be absorbed (a *string element) stays `any`
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleMarginModeAndParams (a, b);\n        return bag;'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handlePostOnly (a, b);\n        return bag;'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleParamString (a, b);\n        return bag;'), '');
    // a read reached without a write keeps the box
    joins (method ('let bag = undefined;\n        if (a) {\n            [ a, bag ] = this.handleUntilOption (a, b);\n        }\n        return bag;'), '');
    // reads the typed nil answers the same way are admitted before the write
    joins (method ('let bag = undefined;\n        if (b in bag) {\n            return 1;\n        }\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        this.safeString (bag, "x");\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        if (bag.length > 0) {\n            return 1;\n        }\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        for (const k in bag) {\n            return k;\n        }\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), 'bag map[string]any');
    // a copy before the write is not
    joins (method ('let bag = undefined;\n        let other = bag;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), '');
    // element reads before the write are only admitted through a nil-safe callee
    joins (method ('let bag = undefined;\n        const v = bag["x"];\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return v;'), 'bag map[string]any');
    // element writes, push, spread and closures keep the box
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        bag["x"] = 1;\n        return bag;'), 'bag map[string]any');
    joins (method ('let bag = undefined;\n        bag["x"] = 1;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        return bag;'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        bag.push (1);\n        return bag;'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        const f = () => bag;\n        return f ();'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        [ ...bag ] = c;\n        return bag;'), '');
    // a plain write of another type diverges
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        bag = a;\n        return bag;'), '');
    joins (method ('let bag = undefined;\n        [ a, bag ] = this.handleUntilOption (a, b);\n        bag = [];\n        return bag;'), '');
    // both map slots of handleUntilOption type
    joins (method ('let bag = undefined;\n        let rest = undefined;\n        [ bag, rest ] = this.handleUntilOption (a, b);\n        return [ bag, rest ];'), 'bag map[string]any;rest map[string]any');
    // `x = holder[i]` off a `[]map[string]any` local carries that element map
    joins (method ('let ticker = undefined;\n        if (bank[1] !== undefined) {\n            ticker = bank[1];\n        }\n        this.safeString (ticker, "open");\n        return 1;'), 'ticker map[string]any');
    joins (method ('let ticker = undefined;\n        if (bank[1] !== undefined) {\n            ticker = bank[1];\n        }\n        return ticker["open"];'), 'ticker map[string]any');
    joins (method ('let ticker = undefined;\n        if (bank[1] !== undefined) {\n            ticker = bank[1];\n        }\n        return ticker;'), '');
    // another holder type, or a non-literal index, is not provable
    joins (method ('let ticker = undefined;\n        if (rows[1] !== undefined) {\n            ticker = rows[1];\n        }\n        return ticker;'), '');
    joins (method ('let ticker = undefined;\n        ticker = bank[a];\n        return ticker;'), '');
    return problems;
}

export default installHx10G06NilDeclaredTupleJoins;
