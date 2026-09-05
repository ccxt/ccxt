// Concrete C# types for generated local variables.
//
// ast-transpiler's C# printer declares every initialised local as `object` unless its own
// getCSharpLocalType() can prove a type (string/bool literals, comparisons, this.extend,
// Object.keys, ...). This module wraps printVariableDeclarationList on the C# printer
// instance and adds the families whose C# value is ALREADY the named type at runtime:
//
//   - hand-written base helpers with a concrete C# signature (cs/ccxt/base/Exchange.*.cs):
//     this.safeString* -> string?, this.safeInteger -> Int64?, this.parse8601 -> Int64?,
//     this.safeFloat* -> double?, this.sortBy/filterBy -> List<object>, ...
//   - Precise.string* statics (string? / bool)
//   - object / array / numeric literals -> Dictionary<string, object> / List<object> / int
//   - `let x: Str = undefined` -> string? (and Int/Num/Dict/List/boolean aliases)
//
// Naming the type never changes the runtime value inside the box, so behaviour is identical
// EXCEPT where C# resolves something at compile time against the declared type. Those cases
// are rejected by csharpLocalIsSafeToRetype():
//   - a later assignment whose value has another (or an unprovable) type
//   - `ref` sinks: x++ / x-- / -x / +x print postFixIncrement(ref x) etc. (`ref object`)
//   - compound assignment, spread, destructuring assignment
//   - operands of `+` when the type is a string (add(string,string)/add(string,object)
//     overloads have different null semantics than add(object,object)) and operands of `-`
//     when the type is int/Int64 (subtract(int,int) returns an Int32 box, not Int64)
//   - typeof on a non-nullable value type (`x is int` is CS0183, an error under
//     TreatWarningsAsErrors)
//   - a local/parameter in the same method literally named like a C# type token
//
// Helpers whose C# signature is `object` (safeDict, safeList, safeValue, safeNumber,
// safeBool, safeCurrencyCode, safeSymbol, market, currency, getValue, add, every parse*,
// anything awaited, ...) stay `object` on purpose: their box holds a value this module
// cannot name without retyping the base.
//
// Why not flip the printer's INFER_VAR_TYPE: it only fires on the `= undefined` path and
// takes the TypeScript declared type at face value, so `let x: Dict = undefined; x =
// this.safeDict (...)` would become `Dictionary<string, object> x` in front of an `object`
// assignment. Everything here is proven from the C# side (the helper's C# signature) plus
// a scan of every later write, never from the TypeScript annotation alone.
//
// IMPORTANT: scan the AST with `declaration.name.escapedText`, print with
// `printNode(declaration.name)` — ReservedKeywordsReplacements renames `type` -> `typeVar`,
// `params` -> `parameters`, so a printed-name scan silently matches nothing.

import ts from 'typescript6';

// this.<name>(...) -> C# type. Source of truth: the hand-written cs/ccxt/base/*.cs
// signatures (the generated Exchange.BaseMethods.cs must NOT redeclare any of these as
// `object`; build/csharp-local-types is checked against that in the PR).
export const CSHARP_LOCAL_THIS_RETURN_TYPES = {
    // Exchange.SafeMethods.cs
    'safeString': 'string?',
    'safeString2': 'string?',
    'safeStringN': 'string?',
    'safeStringLower': 'string?',
    'safeStringLower2': 'string?',
    'safeStringLowerN': 'string?',
    'safeStringUpper': 'string?',
    'safeStringUpper2': 'string?',
    'safeStringUpperN': 'string?',
    'safeInteger': 'Int64?',
    'safeInteger2': 'Int64?',
    'safeIntegerN': 'Int64?',
    'safeIntegerProduct': 'Int64?',
    'safeFloat': 'double?',
    'safeFloat2': 'double?',
    'safeFloatN': 'double?',
    // Exchange.Time.cs (iso8601/ymd* are declared `string` but return null for a null input)
    'parse8601': 'Int64?',
    'iso8601': 'string?',
    'ymdhms': 'string?',
    'yyyymmdd': 'string?',
    'yymmdd': 'string?',
    'microseconds': 'Int64',
    // Exchange.cs
    'seconds': 'Int64',
    'parseTimeframe': 'int',
    'isEmpty': 'bool',
    // Exchange.Number.cs (numberToString is declared `string` but returns null for null)
    'numberToString': 'string?',
    'decimalToPrecision': 'string',
    'precisionFromString': 'int',
    // Exchange.Encode.cs
    'urlencode': 'string',
    'urlencodeWithArrayRepeat': 'string',
    'urlencodeNested': 'string',
    'rawencode': 'string',
    'intToBase16': 'string',
    'stringToBase64': 'string',
    'binaryToBase64': 'string',
    'binaryToString': 'string',
    'encode': 'string?', // `(string)data` pass-through: null in, null out
    'decode': 'string?',
    // Exchange.String.cs
    'uuid': 'string',
    'uuid16': 'string',
    'uuid22': 'string',
    'capitalize': 'string',
    // Exchange.Functions.cs / Exchange.Generic.cs
    'keysort': 'Dictionary<string, object>',
    'sortBy': 'List<object>',
    'sortBy2': 'List<object>',
    'filterBy': 'List<object>',
    'extractParams': 'List<object>',
    'toArray': 'IList<object>',
    'isArray': 'bool',
    'inArray': 'bool',
    'isJsonEncodedObject': 'bool',
};

// <Identifier>.<name>(...) -> C# type, keyed on the full callee text
export const CSHARP_LOCAL_STATIC_RETURN_TYPES = {
    // Exchange.Precise.cs — every string* arithmetic helper returns null for a null input
    'Precise.stringMul': 'string?',
    'Precise.stringDiv': 'string?',
    'Precise.stringSub': 'string?',
    'Precise.stringAdd': 'string?',
    'Precise.stringOr': 'string?',
    'Precise.stringMax': 'string?',
    'Precise.stringMin': 'string?',
    'Precise.stringAbs': 'string?',
    'Precise.stringNeg': 'string?',
    'Precise.stringMod': 'string?',
    'Precise.stringGt': 'bool',
    'Precise.stringGe': 'bool',
    'Precise.stringLt': 'bool',
    'Precise.stringLe': 'bool',
    'Precise.stringEq': 'bool',
    'Precise.stringEquals': 'bool',
};

// `let x: <alias> = undefined` -> nullable C# type (the null initialiser forces `?`)
const CSHARP_LOCAL_ANNOTATION_TYPES = {
    'Str': 'string?',
    'string': 'string?',
    'Int': 'Int64?',
    'Num': 'double?',
    'number': 'double?',
    'Bool': 'bool?',
    'boolean': 'bool?',
    'Dict': 'Dictionary<string, object>',
    'List': 'List<object>',
};

// identifiers that would stop being a type name if a local/parameter in the same method
// carried them (`string`/`object` are already renamed by ReservedKeywordsReplacements)
const CSHARP_TYPE_TOKENS = [ 'string', 'bool', 'int', 'long', 'Int64', 'double', 'object', 'List', 'IList', 'Dictionary', 'var' ];

const STRING_TYPES = [ 'string', 'string?' ];
const NON_NULLABLE_VALUE_TYPES = [ 'int', 'bool', 'Int64', 'double' ];
const INT_TYPES = [ 'int', 'Int64' ];
const LIST_TYPES = [ 'List<object>', 'IList<object>' ];

function isNullable (type) {
    return type.endsWith ('?') || type.startsWith ('Dictionary<') || type.startsWith ('List<') || type.startsWith ('IList<');
}

// the nullable spelling of a C# type (a `= null` / `= undefined` declaration needs one)
function nullableOf (type) {
    return isNullable (type) ? type : type + '?';
}

// can a value of `source` be stored in a local declared `target` WITHOUT changing the
// runtime box? Exact match, null into a nullable/reference type, T into T?, List into IList.
function assignable (target, source) {
    if (source === undefined) {
        return false;
    }
    if (source === target) {
        return true;
    }
    if (source === 'null') {
        return isNullable (target);
    }
    if (target.endsWith ('?') && source === target.slice (0, -1)) {
        return true;
    }
    if (target === 'IList<object>' && source === 'List<object>') {
        return true;
    }
    return false;
}

// the type of `c ? a : b` from its two arms: identical types, or T + null -> T? for a
// reference/nullable T. Anything else (including two distinct provable types) is not
// provable — the C# ternary needs both arms convertible to one type.
function unifyArms (a, b) {
    if (a === undefined || b === undefined) {
        return undefined;
    }
    if (a === b) {
        return (a === 'null') ? undefined : a;
    }
    if (a === 'null' || b === 'null') {
        const other = (a === 'null') ? b : a;
        if (isNullable (other)) {
            return other;
        }
        // `cond ? 5 : null` has no natural C# type; the nullable declaration provides one
        // (the boxed runtime value is the same Int64/bool/... or null either way)
        return other + '?';
    }
    if (a.endsWith ('?') && b === a.slice (0, -1)) {
        return a;
    }
    if (b.endsWith ('?') && a === b.slice (0, -1)) {
        return b;
    }
    return undefined;
}

// integer literal that the C# compiler also types `int` (fits Int32); decimals/exponents
// are `double`; anything else (uint/long range, hex, bigint) is left alone
function numericLiteralType (text) {
    if (/^\d+$/.test (text)) {
        return (Number (text) <= 2147483647) ? 'int' : undefined;
    }
    if (/^\d+\.\d+$/.test (text) || /^\d+(\.\d+)?e[+-]?\d+$/i.test (text)) {
        return 'double';
    }
    return undefined;
}

function callReturnType (initializer) {
    if (initializer?.kind !== ts.SyntaxKind.CallExpression) {
        return undefined;
    }
    const callee = initializer.expression;
    if (callee?.kind !== ts.SyntaxKind.PropertyAccessExpression) {
        return undefined;
    }
    const methodName = callee.name?.escapedText;
    const target = callee.expression;
    if (target?.kind === ts.SyntaxKind.ThisKeyword) {
        return CSHARP_LOCAL_THIS_RETURN_TYPES[methodName];
    }
    if (target?.kind === ts.SyntaxKind.Identifier) {
        return CSHARP_LOCAL_STATIC_RETURN_TYPES[target.escapedText + '.' + methodName];
    }
    return undefined;
}

// the C# type of an initializer / assigned value, or undefined when it cannot be proven.
// 'null' is returned for a literal null/undefined so assignable() can accept it for
// nullable targets. Falls back to the printer's own classifier for its families.
export function csharpTypeOfValue (csharp, node) {
    if (!node) {
        return undefined;
    }
    switch (node.kind) {
    case ts.SyntaxKind.NullKeyword:
        return 'null';
    case ts.SyntaxKind.Identifier:
        return (node.escapedText === 'undefined') ? 'null' : undefined;
    case ts.SyntaxKind.ObjectLiteralExpression:
        return 'Dictionary<string, object>';
    case ts.SyntaxKind.ArrayLiteralExpression:
        return 'List<object>';
    case ts.SyntaxKind.NumericLiteral:
        return numericLiteralType (node.text);
    case ts.SyntaxKind.PrefixUnaryExpression:
        if (node.operator === ts.SyntaxKind.MinusToken && node.operand?.kind === ts.SyntaxKind.NumericLiteral) {
            return numericLiteralType (node.operand.text); // prints `-N`, still an int/double literal
        }
        break;
    case ts.SyntaxKind.ParenthesizedExpression:
        return csharpTypeOfValue (csharp, node.expression);
    case ts.SyntaxKind.ConditionalExpression: {
        // `c ? a : b` prints `((bool) isTrue(c)) ? A : B`; typeable when both arms agree
        const whenTrue = csharpTypeOfValue (csharp, node.whenTrue);
        const whenFalse = csharpTypeOfValue (csharp, node.whenFalse);
        return unifyArms (whenTrue, whenFalse);
    }
    case ts.SyntaxKind.CallExpression: {
        const own = callReturnType (node);
        if (own !== undefined) {
            return own;
        }
        break;
    }
    }
    if (typeof csharp.csharpTypeOfInitializer === 'function') {
        return csharp.csharpTypeOfInitializer (node);
    }
    return undefined;
}

// `let x: Str = undefined` — the annotation names the type, the null initialiser makes it
// nullable; only accepted when every later write is proven compatible (see the scan)
function annotationType (declaration) {
    const type = declaration.type;
    if (!type) {
        return undefined;
    }
    if (type.kind === ts.SyntaxKind.TypeReference && type.typeName?.kind === ts.SyntaxKind.Identifier && !type.typeArguments) {
        return CSHARP_LOCAL_ANNOTATION_TYPES[type.typeName.escapedText];
    }
    if (type.kind === ts.SyntaxKind.StringKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['string'];
    }
    if (type.kind === ts.SyntaxKind.NumberKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['number'];
    }
    if (type.kind === ts.SyntaxKind.BooleanKeyword) {
        return CSHARP_LOCAL_ANNOTATION_TYPES['boolean'];
    }
    return undefined;
}

function enclosingFunction (node) {
    let current = node?.parent;
    while (current) {
        switch (current.kind) {
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.Constructor:
        case ts.SyntaxKind.SourceFile:
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

// one walk per method: every Identifier grouped by escapedText, plus the printed names
// of every binding (for the type-token shadow check)
const scopeIndexCache = new WeakMap ();

function indexScope (csharp, scope) {
    let index = scopeIndexCache.get (scope);
    if (index) {
        return index;
    }
    const identifiers = new Map ();
    const bindingNames = new Set ();
    const visit = (n) => {
        if (n.kind === ts.SyntaxKind.Identifier) {
            const name = n.escapedText;
            let list = identifiers.get (name);
            if (!list) {
                list = [];
                identifiers.set (name, list);
            }
            list.push (n);
        }
        if ((n.kind === ts.SyntaxKind.Parameter || n.kind === ts.SyntaxKind.VariableDeclaration) && n.name?.kind === ts.SyntaxKind.Identifier) {
            bindingNames.add (csharp.printNode (n.name, 0));
        }
        ts.forEachChild (n, visit);
    };
    ts.forEachChild (scope, visit);
    index = { identifiers, bindingNames };
    scopeIndexCache.set (scope, index);
    return index;
}

function typeNameIsShadowed (index, csharpType) {
    const names = csharpType.match (/[A-Za-z_]\w*/g) ?? [];
    return names.some ((n) => CSHARP_TYPE_TOKENS.includes (n) && index.bindingNames.has (n));
}

// is `identifier` a declaration/member name rather than a read or write of the local?
function isNotAUse (identifier) {
    const parent = identifier.parent;
    if (!parent) {
        return true;
    }
    switch (parent.kind) {
    case ts.SyntaxKind.VariableDeclaration:
    case ts.SyntaxKind.Parameter:
    case ts.SyntaxKind.BindingElement:
    case ts.SyntaxKind.PropertyAssignment:
    case ts.SyntaxKind.PropertyDeclaration:
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.PropertyAccessExpression:
        return parent.name === identifier;
    }
    return false;
}

export function csharpLocalIsSafeToRetype (csharp, scope, declaration, varName, csharpType) {
    if (scope === undefined) {
        return false;
    }
    const index = indexScope (csharp, scope);
    if (typeNameIsShadowed (index, csharpType)) {
        return false;
    }
    const isString = STRING_TYPES.includes (csharpType);
    const isInt = INT_TYPES.includes (csharpType);
    const isValueType = NON_NULLABLE_VALUE_TYPES.includes (csharpType);
    const isList = LIST_TYPES.includes (csharpType);
    let reads = 0;
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (!(parent.kind === ts.SyntaxKind.BinaryExpression && parent.left === n && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken)) {
            reads++;
        }
        // `delete obj[x]` (also `delete obj[(x as number)]`) prints `.Remove((string)x)` —
        // a hard cast that only compiles from `object` when x is not a string
        if (!isString && isDeleteKey (n)) {
            return false;
        }
        switch (parent.kind) {
        case ts.SyntaxKind.PostfixUnaryExpression:
            return false; // postFixIncrement(ref x)
        case ts.SyntaxKind.PrefixUnaryExpression:
            if (parent.operator !== ts.SyntaxKind.ExclamationToken) {
                return false; // prefixUnaryNeg(ref x) / prefixUnaryPlus(ref x)
            }
            break;
        case ts.SyntaxKind.SpreadElement:
            return false;
        case ts.SyntaxKind.TypeOfExpression:
            if (isValueType) {
                return false; // `x is int` on an int local is CS0183
            }
            break;
        case ts.SyntaxKind.ArrayLiteralExpression:
            // `[x, y] = f()` prints element reads into untyped slots
            if (parent.parent?.kind === ts.SyntaxKind.BinaryExpression && parent.parent.left === parent && parent.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                return false;
            }
            break;
        case ts.SyntaxKind.PropertyAccessExpression: {
            // x.push(v) prints ((IList<object>)x).Add(v); x.reverse() reassigns x from a
            // List<object>; both only make sense on a list. x.sort() has no typed print.
            const method = parent.name?.escapedText;
            if (method === 'sort') {
                return false;
            }
            if ((method === 'push' || method === 'reverse') && !isList) {
                return false;
            }
            break;
        }
        case ts.SyntaxKind.BinaryExpression: {
            const op = parent.operatorToken.kind;
            if (parent.left === n) {
                if (op === ts.SyntaxKind.EqualsToken) {
                    if (!assignable (csharpType, csharpTypeOfValue (csharp, parent.right))) {
                        return false;
                    }
                } else if (op >= ts.SyntaxKind.FirstCompoundAssignment && op <= ts.SyntaxKind.LastCompoundAssignment) {
                    return false;
                }
            }
            // overload resolution against the declared type: add(string, ...) and
            // subtract(int, int) exist next to the (object, object) versions
            if (isString && (op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.PlusEqualsToken)) {
                return false;
            }
            if (isInt && (op === ts.SyntaxKind.MinusToken || op === ts.SyntaxKind.MinusEqualsToken)) {
                return false;
            }
            break;
        }
        }
    }
    // `T x = <literal>;` that is never read is CS0219 (an error under TreatWarningsAsErrors)
    // where `object x = <literal>;` is not — keep the upstream shape for unused locals
    if (reads === 0 && isLiteralLike (declaration.initializer)) {
        return false;
    }
    return true;
}

// climb through `(x)` and `x as T` wrappers to the expression that consumes the value
function unwrapValue (node) {
    let current = node;
    while (current.parent && (current.parent.kind === ts.SyntaxKind.ParenthesizedExpression || current.parent.kind === ts.SyntaxKind.AsExpression)) {
        current = current.parent;
    }
    return current;
}

// is `identifier` (possibly wrapped) the key of a `delete obj[key]`?
function isDeleteKey (identifier) {
    const value = unwrapValue (identifier);
    const access = value.parent;
    return access?.kind === ts.SyntaxKind.ElementAccessExpression && access.argumentExpression === value && access.parent?.kind === ts.SyntaxKind.DeleteExpression;
}

function isLiteralLike (node) {
    switch (node?.kind) {
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
    case ts.SyntaxKind.NullKeyword:
        return true;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return isLiteralLike (node.operand);
    case ts.SyntaxKind.ParenthesizedExpression:
        return isLiteralLike (node.expression);
    case ts.SyntaxKind.Identifier:
        return node.escapedText === 'undefined';
    }
    return false;
}

// the C# type to declare `declaration` with, or undefined to keep the printer's output
export function csharpLocalType (csharp, declaration) {
    if (!declaration?.initializer || declaration.name?.kind !== ts.SyntaxKind.Identifier) {
        return undefined;
    }
    const sourceName = declaration.name.escapedText;
    const scope = (typeof csharp.csharpEnclosingFunction === 'function') ? csharp.csharpEnclosingFunction (declaration) : enclosingFunction (declaration);
    let csharpType = csharpTypeOfValue (csharp, declaration.initializer);
    if (csharpType === 'null') {
        csharpType = annotationType (declaration) ?? typeFromLaterWrites (csharp, scope, declaration, sourceName);
    }
    if (csharpType === undefined || csharpType === csharp.VAR_TOKEN) {
        return undefined;
    }
    if (!csharpLocalIsSafeToRetype (csharp, scope, declaration, sourceName, csharpType)) {
        return undefined;
    }
    return csharpType;
}

// `let x = undefined; ... x = <a>; ... x = <b>;` — the nullable type of the writes when
// every plain `x = ...` in the method has the same provable C# type (null writes are fine,
// an unprovable or divergent write is not). The declaration is `= null`, so the result is
// always the nullable spelling; csharpLocalIsSafeToRetype() re-checks every write and every
// read afterwards exactly as for an initialised local.
function typeFromLaterWrites (csharp, scope, declaration, varName) {
    if (scope === undefined) {
        return undefined;
    }
    const index = indexScope (csharp, scope);
    let type = undefined;
    for (const n of (index.identifiers.get (varName) ?? [])) {
        if (n === declaration.name || isNotAUse (n)) {
            continue;
        }
        const parent = n.parent;
        if (parent.kind !== ts.SyntaxKind.BinaryExpression || parent.left !== n || parent.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
            continue;
        }
        const written = csharpTypeOfValue (csharp, parent.right);
        if (written === undefined) {
            return undefined;
        }
        if (written === 'null') {
            continue;
        }
        if (type === undefined) {
            type = written;
        } else if (type !== written) {
            return undefined;
        }
    }
    return (type === undefined) ? undefined : nullableOf (type);
}

// wrap printVariableDeclarationList on a Transpiler's C# printer. Idempotent. Everything
// the upstream printer already typed (or printed in another shape) is returned untouched;
// only an exact `<iden>object <name> = ` prefix is rewritten.
export function installCsharpLocalTypes (transpiler) {
    const csharp = transpiler?.csharpTranspiler;
    if (!csharp || typeof csharp.printVariableDeclarationList !== 'function' || csharp._localTypesPatched) {
        return;
    }
    const upstream = csharp.printVariableDeclarationList.bind (csharp);
    csharp.printVariableDeclarationList = (node, identation) => {
        const printed = upstream (node, identation);
        const declarations = node?.declarations;
        if (!declarations || declarations.length !== 1) {
            return printed;
        }
        const declaration = declarations[0];
        const csharpType = csharpLocalType (csharp, declaration);
        if (csharpType === undefined) {
            return printed;
        }
        const iden = csharp.getIden (identation);
        const printedName = csharp.printNode (declaration.name, 0);
        const prefix = iden + csharp.VAR_TOKEN + ' ' + printedName + ' = ';
        if (!printed.startsWith (prefix)) {
            return printed;
        }
        return iden + csharpType + ' ' + printedName + ' = ' + printed.slice (prefix.length);
    };
    csharp._localTypesPatched = true;
}

export default installCsharpLocalTypes;
