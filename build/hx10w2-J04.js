// hx10 wave-2 J04: the string helpers print native java.lang String ops from proven printed types.
//   x.slice (a, b)             -> (x == null ? null : ((String)x).substring((int) <clamp a>, (int) <clamp b>))
//   x.split (sep)              -> the printer's array shape around ((String)x).split(Pattern.quote(sep))
//   x.replaceAll (pattern, r)  -> x.replace(pattern, r)   (literal pattern, String replacement)
// Every proof is a printed-type proof (javaScalarFamily / javaProvableString / javaDeclaredTypeOf), so an
// unproven receiver, bound or argument keeps the helper exactly as the base printed it.
import { ts } from './csharp-local-types.js';
import { registerJavaReceiverMethodMatch } from './java-local-types.js';

// integral printed types only: the helper's toInt truncation has no native analogue for a double
const j04IntegralTypes = new Set(['long', 'int', 'short', 'byte', 'Long', 'Integer', 'Short', 'Byte']);
// the native form reads a bound up to three times: a longer one would push the line past the 400 audit
const J04_SLICE_MAX = 300;

function j04Unwrap (node) {
    let current = node;
    while (current !== undefined && ts.isParenthesizedExpression (current)) {
        const inner = current.expression;
        current = inner;
    }
    return current;
}

function j04Atom (node) {
    const n = j04Unwrap (node);
    if (n === undefined) return false;
    return n.kind === ts.SyntaxKind.Identifier || n.kind === ts.SyntaxKind.PropertyAccessExpression
        || n.kind === ts.SyntaxKind.ThisKeyword || n.kind === ts.SyntaxKind.NumericLiteral;
}

// the printed text of this operand appears more than once in the native form
function j04Repeatable (node) {
    const n = j04Unwrap (node);
    if (n === undefined) return false;
    switch (n.kind) {
    case ts.SyntaxKind.Identifier:
    case ts.SyntaxKind.PropertyAccessExpression:
    case ts.SyntaxKind.ThisKeyword:
    case ts.SyntaxKind.NumericLiteral:
        return true;
    case ts.SyntaxKind.PrefixUnaryExpression:
        return n.operator === ts.SyntaxKind.MinusToken && j04Repeatable (n.operand);
    case ts.SyntaxKind.BinaryExpression: {
        const op = n.operatorToken.kind;
        return (op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.MinusToken || op === ts.SyntaxKind.AsteriskToken)
            && j04Repeatable (n.left) && j04Repeatable (n.right);
    }
    default:
        return false;
    }
}

// the operand prints as an integral Java number: `+ - Math.min Math.max` and the `(int)` cast compile on it
function j04IntegralPrinted (printer, node) {
    const n = j04Unwrap (node);
    if (n === undefined) return false;
    switch (n.kind) {
    case ts.SyntaxKind.NumericLiteral:
        return !/[.eE]/.test (n.text);
    case ts.SyntaxKind.PrefixUnaryExpression:
        return n.operator === ts.SyntaxKind.MinusToken && j04IntegralPrinted (printer, n.operand);
    case ts.SyntaxKind.PropertyAccessExpression:
        // `x.length` prints the primitive int of the native length read
        return n.name?.text === 'length' && printer.javaScalarFamily (n) === 'number';
    case ts.SyntaxKind.BinaryExpression: {
        const op = n.operatorToken.kind;
        return (op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.MinusToken || op === ts.SyntaxKind.AsteriskToken)
            && j04IntegralPrinted (printer, n.left) && j04IntegralPrinted (printer, n.right);
    }
    }
    if (n.kind !== ts.SyntaxKind.Identifier) return false;
    const type = printer.javaDeclaredTypeOf (n);
    return type !== undefined && j04IntegralTypes.has (type.replace (/^final\s+/, '').trim ());
}

// a bound as the integer the helper's toInt answers: an integral print is its own text, a boxed
// number (an `Object` from indexOf, a Double) takes the helper's own intValue truncation
function j04BoundOperand (printer, node, printed) {
    if (j04IntegralPrinted (printer, node)) {
        return { text: j04Atom (node) ? printed : `(${printed})`, atom: j04Atom (node) };
    }
    const n = j04Unwrap (node);
    if (n === undefined || n.kind !== ts.SyntaxKind.Identifier || printer.javaScalarFamily (n) !== 'number') return undefined;
    const type = printer.javaDeclaredTypeOf (n);
    if (type === undefined || ![ 'Object', 'Double', 'Float', 'Number' ].includes (type.replace (/^final\s+/, '').trim ())) return undefined;
    return { text: `((Number)${printed}).intValue()`, atom: false };
}

// the receiver prints as a Java String: a plain TS `string`, a String-declared local, a literal
function j04StringPrinted (printer, node) {
    if (node === undefined) return false;
    if (printer.javaScalarFamily (node) === 'string') return true;
    if (printer.javaProvableString (node)) return true;
    return printer.javaDeclaredStringType (node) === true;
}

// the integer value of a literal bound (`18`, `-64`), or undefined
function j04BoundLiteral (node) {
    const n = j04Unwrap (node);
    if (n === undefined) return undefined;
    if (n.kind === ts.SyntaxKind.NumericLiteral && !/[.eE]/.test (n.text)) return Number (n.text);
    if (n.kind === ts.SyntaxKind.PrefixUnaryExpression && n.operator === ts.SyntaxKind.MinusToken) {
        const inner = j04BoundLiteral (n.operand);
        return inner === undefined ? undefined : -inner;
    }
    return undefined;
}

// the printed receiver and arguments of `Helpers.<name>(...)`, split at the top level
function j04CallParts (out) {
    const open = out.indexOf ('(');
    if (open === -1 || !out.endsWith (')')) return undefined;
    const inner = out.slice (open + 1, -1);
    const args = [];
    let depth = 0;
    let start = 0;
    let quote = '';
    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (quote !== '') {
            if (ch === '\\') i++;
            else if (ch === quote) quote = '';
            continue;
        }
        if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        else if (ch === ',' && depth === 0) { args.push (inner.slice (start, i).trim ()); start = i + 1; }
    }
    args.push (inner.slice (start).trim ());
    return args;
}

// `x.slice (a, b)` -> String.substring when the receiver prints String and every bound prints a number
function j04SliceNative (printer, node, out, name, identation) {
    if (typeof out !== 'string' || !out.startsWith ('Helpers.slice(')) return undefined;
    const callee = node?.expression;
    if (callee === undefined || callee.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.name?.text !== 'slice') return undefined;
    const args = node.arguments ?? [];
    if (args.length < 1 || args.length > 2) return undefined;
    const parts = j04CallParts (out);
    if (parts === undefined) return undefined;
    // an open-end slice prints the absent `to` as the helper's own `null` third argument
    const openEnd = parts.length === args.length + 2 && parts[parts.length - 1] === 'null';
    if (parts.length !== args.length + 1 && !openEnd) return undefined;
    const receiver = callee.expression;
    // the null guard reads the receiver twice
    if (receiver === undefined || !printer.sideEffectFreeReceiver (receiver) || !j04StringPrinted (printer, receiver)) return undefined;
    const bounds = [];
    for (let i = 0; i < args.length; i++) {
        if (!j04Repeatable (args[i])) return undefined;
        const bound = j04BoundOperand (printer, args[i], parts[i + 1]);
        if (bound === undefined) return undefined;
        bounds.push (bound);
    }
    const subject = parts[0];
    // a declared String receiver needs no checkcast for its own length
    const declared = printer.javaDeclaredStringType (receiver) === true;
    const recv = declared ? subject : `((String)${subject})`;
    const length = `${recv}.length()`;
    // JS slice: a negative start counts from the end and never lands below 0
    const startText = () => {
        const value = j04BoundLiteral (args[0]);
        if (value === 0) return '0';
        const t = bounds[0].text;
        if (value !== undefined && value > 0) return `Math.min(${value}, ${length})`;
        if (value !== undefined) return `Math.max(${length} - ${-value}, 0)`;
        return `Math.min(Math.max(${t} < 0 ? ${length} + ${t} : ${t}, 0), ${length})`;
    };
    // the end clamps to the length but, like the helper, may land below 0 (both forms then throw)
    const endText = () => {
        const value = j04BoundLiteral (args[1]);
        if (value !== undefined && value >= 0) return `Math.min(${value}, ${length})`;
        if (value !== undefined) return `${length} - ${-value}`;
        const t = bounds[1].text;
        return `Math.min(${t} < 0 ? ${length} + ${t} : ${t}, ${length})`;
    };
    const open = args.length === 1;
    const to = open ? length : endText ();
    // a literal 0 start never exceeds a clamped end, so the pair needs no ordering min
    const from = open ? startText () : (j04BoundLiteral (args[0]) === 0 ? '0' : `Math.min(${startText ()}, ${to})`);
    const cast = (text) => (text === '0' ? '0' : `(int) ${text}`);
    const full = open
        ? `(${subject} == null ? null : ${recv}.substring(${cast (from)}))`
        : `(${subject} == null ? null : ${recv}.substring(${cast (from)}, (int) ${to}))`;
    // the clamp repeats the bounds: keep the emitted line under the 400-char audit
    // an open-end form shares its line with the surrounding expression: keep it short
    const budget = open ? 200 : Math.max (220, 392 - identation * 4 - 50);
    return full.length > budget ? undefined : full;
}

// `x.split (sep)` -> String.split(Pattern.quote(sep)) for a separator the types say is a plain string
function j04SplitNative (printer, node, out, name, identation, parsedArg) {
    if (typeof out !== 'string' || !out.startsWith ('Helpers.split(')) return undefined;
    const callee = node?.expression;
    if (callee === undefined || callee.kind !== ts.SyntaxKind.PropertyAccessExpression || callee.name?.text !== 'split') return undefined;
    const args = node.arguments ?? [];
    if (args.length !== 1) return undefined;
    const receiver = callee.expression;
    if (receiver === undefined || printer.javaSplitTernaryReceiver (receiver)) return undefined;
    if (printer.javaScalarFamily (receiver) !== 'string' || printer.javaScalarFamily (args[0]) !== 'string') return undefined;
    const parts = j04CallParts (out);
    if (parts === undefined || parts.length !== 2) return undefined;
    return `${printer.ARRAY_OPENING_TOKEN}((String)${parts[0]}).split(java.util.regex.Pattern.quote(${parts[1]}))${printer.ARRAY_CLOSING_TOKEN}`;
}

// `x.replaceAll (pattern, replacement)` -> String.replace for a literal pattern and a String replacement
function j04ReplaceAllNative (printer, node, out, name, identation) {
    if (typeof out !== 'string' || !out.startsWith ('Helpers.replaceAll(')) return undefined;
    const args = node?.arguments;
    if (args === undefined || args.length !== 2) return undefined;
    // the all-literal pair is section 52's; a literal pattern is required here, the replacement only typed
    if (!ts.isStringLiteral (args[0]) || args[0].text === '') return undefined;
    if (ts.isStringLiteralLike (args[1]) || printer.javaScalarFamily (args[1]) !== 'string') return undefined;
    const parts = j04CallParts (out);
    if (parts === undefined || parts.length !== 3) return undefined;
    return `${parts[0]}.replace(${parts[1]}, ${parts[2]})`;
}

export function installHx10J04StringHelpers (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printSliceCall !== 'function' || printer._hx10J04StringHelpers) {
        return;
    }
    printer._hx10J04StringHelpers = true;
    // the native slice is a String too: keep the `String x = ` local typing and every proof built on it
    registerJavaReceiverMethodMatch ('slice', /^\w+(?:\.\w+)* == null \? null : \(\(String\)/);
    const wrap = (method, convert) => {
        const upstream = printer[method].bind (printer);
        printer[method] = function (node, identation, name, parsedArg, parsedArg2) {
            const out = upstream (node, identation, name, parsedArg, parsedArg2);
            try {
                return convert (this, node, out, name, identation, parsedArg, parsedArg2) ?? out;
            } catch (e) {
                return out;
            }
        };
    };
    wrap ('printSliceCall', j04SliceNative);
    wrap ('printSplitCall', j04SplitNative);
    wrap ('printReplaceAllCall', j04ReplaceAllNative);
}

