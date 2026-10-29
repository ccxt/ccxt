// hx10 wave-2 J03 — native Java for the isTrue / isEqual / add / subtract / multiply / divide family
// from statically known types.
//
// Two rules, both "typing, not inlining":
//   1. printer: a condition the printer still wraps in `Helpers.isTrue (...)` whose TS type is a plain
//      `boolean` / `boolean | undefined` PARAMETER (the one binding the pinned printer refuses to prove,
//      since its callers fill it) is a `Boolean`-or-null box, i.e. exactly
//      `Boolean.TRUE.equals (x)`.
//   2. text: on the PRINTED java, the DECLARED type of the operand (Long/long/Integer/int/Double/double/
//      String/Boolean/boolean) is the proof; the helper's own null arm is reproduced as an explicit
//      ternary, so no call site changes box or throws.
import { ts } from './csharp-local-types.js';

const J03_TRUE_EQUALS = 'Boolean.TRUE.equals(';
const J03_FAMILY = [ 'isTrue', 'isEqual', 'add', 'subtract', 'multiply', 'divide' ];
const J03_CALL = new RegExp ('Helpers\\.(' + J03_FAMILY.join ('|') + ')\\(', 'g');
const J03_TYPE = '(?:Object|String|Long|Double|Boolean|Integer|Float|java\\.util\\.List<Object>|List<Object>'
    + '|java\\.util\\.Map<String, Object>|Map<String, Object>|long|double|int|boolean|var)';
const J03_DECL = new RegExp ('^(\\s*)(?:final\\s+)?(' + J03_TYPE + ')\\s+([A-Za-z_$][\\w$]*)\\s*(?:=|;)');
const J03_FIELD = new RegExp ('^    (?:public |protected |private |static |final )*(' + J03_TYPE + ')\\s+([A-Za-z_$][\\w$]*)\\s*(?:=|;)');
const J03_SIG = /^    (?:public|protected|private)\s[^(=;]*\(.*\)\s*$/;
const J03_PARAM = new RegExp ('(?:final\\s+)?(' + J03_TYPE + ')\\s+([A-Za-z_$][\\w$]*)', 'g');
const J03_TRANSPILED = 'METHODS BELOW THIS LINE ARE TRANSPILED';
// hand-written BaseExchange.java fields declared `public String` (evidence: that file's field list);
// a generated exchange file does not carry the declaration, so `this.id` needs the table
const J03_STRING_FIELDS = new Set ([ 'id', 'name', 'version', 'url', 'hostname', 'userAgent', 'apiKey',
    'secret', 'password', 'uid', 'accountId', 'twofa', 'privateKey', 'walletAddress', 'login', 'agent' ]);

// TS type -> the four operands an operator may be emitted on. `boolean` is the true|false union, so the
// bit is set on a plain boolean and cleared on `boolean | string` / `any`; a union is admitted only when
// every member is boolean-ish or nullish (that is TS `Bool` = boolean | undefined).
function j03BooleanishType (printer, node) {
    let type;
    try {
        type = printer.getChecker ().getTypeAtLocation (node);
    } catch (e) {
        return false;
    }
    if (type === undefined || type === null) {
        return false;
    }
    const booleanish = (t) => (t.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) !== 0;
    const nullish = (t) => (t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null | ts.TypeFlags.Void)) !== 0;
    if (booleanish (type)) {
        return true;
    }
    if ((type.flags & ts.TypeFlags.Union) === 0) {
        return false;
    }
    let parts;
    try {
        parts = ts.typeParts (type);
    } catch (e) {
        return false;
    }
    if (parts === undefined || parts.length === 0) {
        return false;
    }
    return parts.some (booleanish) && parts.every ((t) => booleanish (t) || nullish (t));
}

function j03Unwrap (node) {
    let value = node;
    while (value !== undefined && value.kind === ts.SyntaxKind.ParenthesizedExpression) {
        value = value.expression;
    }
    return value;
}

// the printed text is exactly `Helpers.isTrue (<operand>)` and nothing else -> the operand, else undefined
function j03IsTrueOperand (printed) {
    const open = 'Helpers.isTrue(';
    const trimmed = printed.trim ();
    if (!trimmed.startsWith (open) || !trimmed.endsWith (')')) {
        return undefined;
    }
    let depth = 0;
    for (let i = open.length - 1; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (ch === '"') {
            i++;
            while (i < trimmed.length && trimmed[i] !== '"') {
                if (trimmed[i] === '\\') i++;
                i++;
            }
            continue;
        }
        if (ch === '(') depth++;
        else if (ch === ')') {
            depth--;
            if (depth === 0) {
                return i === trimmed.length - 1 ? trimmed.slice (open.length, i) : undefined;
            }
        }
    }
    return undefined;
}

// a parameter read the printer prints bare (`p`) or through its default (`requireNonNullElse (p, lit)`)
function j03BooleanParameterOperand (printed) {
    let text = printed.trim ();
    for (;;) {
        if (!text.startsWith ('(') || !text.endsWith (')')) break;
        const inner = j03CallArgs (text, 0);
        if (inner === undefined || inner.close !== text.length - 1) break;
        text = text.slice (1, -1).trim ();
    }
    if (/^[A-Za-z_$][\w$]*$/.test (text)) {
        return text;
    }
    const m = /^java\.util\.Objects\.requireNonNullElse\(([A-Za-z_$][\w$]*), (?:true|false)\)$/.exec (text);
    return m === null ? undefined : text;
}

export function installJ03BooleanConditions (transpiler) {
    const printer = transpiler?.javaTranspiler;
    if (!printer || typeof printer.printCondition !== 'function' || printer._hx10J03Patched) {
        return;
    }
    printer._hx10J03Patched = true;
    const upstreamCondition = printer.printCondition.bind (printer);
    printer.printCondition = function (node, identation) {
        const printed = upstreamCondition (node, identation);
        if (typeof printed !== 'string' || !printed.includes ('Helpers.isTrue(')) {
            return printed;
        }
        const operandText = j03IsTrueOperand (printed.slice (printed.length - printed.trimStart ().length));
        if (operandText === undefined) {
            return printed;
        }
        const inner = j03Unwrap (node);
        if (inner === undefined || inner.kind !== ts.SyntaxKind.Identifier) {
            return printed;
        }
        let declaration;
        try {
            declaration = printer.getChecker ().getSymbolAtLocation (inner)?.valueDeclaration?.resolve ();
        } catch (e) {
            return printed;
        }
        if (declaration === undefined || declaration.kind !== ts.SyntaxKind.Parameter) {
            return printed;
        }
        // a lambda parameter is typed by its functional interface, not by a TS caller contract
        if (declaration.parent?.kind !== ts.SyntaxKind.MethodDeclaration) {
            return printed;
        }
        // a parameter the body writes is filled by the body, not by the typed callers
        if (typeof printer.javaParameterIsWritten === 'function' && printer.javaParameterIsWritten (declaration)) {
            return printed;
        }
        if (!j03BooleanishType (printer, inner)) {
            return printed;
        }
        const operand = j03BooleanParameterOperand (operandText);
        if (operand === undefined) {
            return printed;
        }
        const iden = printed.slice (0, printed.length - printed.trimStart ().length);
        return iden + J03_TRUE_EQUALS + operand + ')';
    };
}

// ---------------------------------------------------------------------------------------------------
// text pass over the printed java: the DECLARED type of an operand is the proof

const J03_KINDS = {
    'Long': 'longbox', 'long': 'longprim', 'Integer': 'intbox', 'int': 'intprim',
    'Double': 'doublebox', 'double': 'doubleprim', 'String': 'string',
    'Boolean': 'boolbox', 'boolean': 'boolprim',
};
const J03_INTEGRAL = new Set ([ 'longbox', 'longprim', 'intbox', 'intprim', 'intlit', 'longlit' ]);
const J03_NUMERIC = new Set ([ 'longbox', 'longprim', 'intbox', 'intprim', 'intlit', 'longlit', 'doublebox', 'doubleprim' ]);
const J03_BOXED = new Set ([ 'longbox', 'intbox', 'doublebox' ]);
const J03_LONGISH = new Set ([ 'longbox', 'longprim' ]);
const J03_INTISH = new Set ([ 'intbox', 'intprim', 'intlit' ]);

function j03Mask (line, state) {
    const out = new Array (line.length);
    for (let i = 0; i < line.length; i++) out[i] = line[i];
    let i = 0;
    while (i < out.length) {
        if (state.block) {
            const end = line.indexOf ('*/', i);
            const stop = end === -1 ? out.length : end + 2;
            for (let k = i; k < stop; k++) out[k] = ' ';
            i = stop;
            if (end !== -1) state.block = false;
            continue;
        }
        const ch = out[i];
        if (ch === '"' || ch === "'") {
            let j = i + 1;
            while (j < out.length && out[j] !== ch) {
                if (out[j] === '\\') j++;
                j++;
            }
            for (let k = i; k < Math.min (j + 1, out.length); k++) out[k] = ' ';
            i = j + 1;
            continue;
        }
        if (ch === '/' && out[i + 1] === '/') {
            for (let k = i; k < out.length; k++) out[k] = ' ';
            break;
        }
        if (ch === '/' && out[i + 1] === '*') {
            state.block = true;
            continue;
        }
        i++;
    }
    return out.join ('');
}

function j03CallArgs (text, openIndex) {
    let depth = 0;
    let close = -1;
    for (let i = openIndex; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            i++;
            while (i < text.length && text[i] !== '"') {
                if (text[i] === '\\') i++;
                i++;
            }
            continue;
        }
        if (ch === '(') depth++;
        else if (ch === ')') {
            depth--;
            if (depth === 0) {
                close = i;
                break;
            }
        }
    }
    if (close === -1) {
        return undefined;
    }
    const body = text.slice (openIndex + 1, close);
    const args = [];
    let nesting = 0;
    let current = '';
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === '"') {
            current += ch;
            i++;
            while (i < body.length && body[i] !== '"') {
                if (body[i] === '\\') current += body[i++];
                current += body[i++];
            }
            current += '"';
            continue;
        }
        if (ch === '(') nesting++;
        else if (ch === ')') nesting--;
        if (ch === ',' && nesting === 0) {
            args.push (current.trim ());
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim () !== '' || body.trim () !== '') {
        args.push (current.trim ());
    }
    return { args, close };
}

function j03StripParens (text) {
    let value = text.trim ();
    for (;;) {
        if (!value.startsWith ('(') || !value.endsWith (')')) {
            return value;
        }
        const call = j03CallArgs (value, 0);
        if (call === undefined || call.close !== value.length - 1) {
            return value;
        }
        value = value.slice (1, -1).trim ();
    }
}

function j03KindOf (text, lookup) {
    const value = j03StripParens (text);
    if (/^-?\d+$/.test (value)) {
        return 'intlit';
    }
    if (/^-?\d+[lL]$/.test (value)) {
        return 'longlit';
    }
    if (/^"([^"\\]|\\.)*"$/.test (value)) {
        return 'string';
    }
    if (value === 'true' || value === 'false') {
        return 'boolprim';
    }
    if (value === 'null') {
        return 'null';
    }
    const cast = /^\(\((long|double|int)\)\s*([A-Za-z_$][\w$]*)\)$/.exec (value);
    if (cast !== null) {
        return J03_KINDS[cast[1]];
    }
    const name = /^(this\.)?([A-Za-z_$][\w$]*)$/.exec (value);
    if (name !== null) {
        if (name[1] !== undefined && J03_STRING_FIELDS.has (name[2]) && lookup (name[2]) === undefined) {
            return 'string';
        }
        const type = lookup (name[2]);
        return type === undefined ? undefined : J03_KINDS[type];
    }
    return undefined;
}

// one operand rendered as a long value (`int` operands widened: the helper normalizes them itself)
function j03AsLong (text, kind) {
    if (kind === 'longbox' || kind === 'longprim') return j03StripParens (text);
    if (kind === 'intlit') return j03StripParens (text) + 'L';
    if (kind === 'longlit') return j03StripParens (text);
    return '((long) ' + j03StripParens (text) + ')';
}

function j03AsDouble (text, kind) {
    if (kind === 'doublebox' || kind === 'doubleprim') return j03StripParens (text);
    if (kind === 'intlit') return '((double) ' + j03StripParens (text) + ')';
    if (kind === 'longlit') return '((double) ' + j03StripParens (text) + ')';
    return '((double) ' + j03StripParens (text) + ')';
}

function j03NullGuard (parts, expr) {
    if (parts.length === 0) {
        return '(' + expr + ')';
    }
    return '((' + parts.join (' == null || ') + ' == null) ? null : ' + expr + ')';
}

// → the replacement expression, or undefined to keep the plain helper call
function j03Emit (helper, args, kinds) {
    const boxedOf = (list) => [ ...new Set (list.map ((k, i) => (J03_BOXED.has (k) ? j03StripParens (args[i]) : undefined)).filter ((x) => x !== undefined)) ];
    const allIn = (set) => kinds.every ((k) => set.has (k));
    const anyIn = (set) => kinds.some ((k) => set.has (k));
    if (helper === 'isTrue') {
        if (args.length !== 1) return undefined;
        if (kinds[0] === 'boolbox') return J03_TRUE_EQUALS + j03StripParens (args[0]) + ')';
        if (kinds[0] === 'boolprim') return j03StripParens (args[0]);
        return undefined;
    }
    if (helper === 'isEqual') {
        if (args.length !== 2) return undefined;
        const [ a, b ] = kinds;
        if (a === 'null' && !(b === 'boolprim' || b === 'longprim' || b === 'intprim' || b === 'doubleprim')) {
            return '(' + j03StripParens (args[1]) + ' == null)';
        }
        if (b === 'null' && !(a === 'boolprim' || a === 'longprim' || a === 'intprim' || a === 'doubleprim')) {
            return '(' + j03StripParens (args[0]) + ' == null)';
        }
        const sameFamily = (x, y) => (x === y && [ 'string', 'longbox', 'intbox', 'boolbox', 'longprim', 'intprim', 'boolprim' ].includes (x))
            || ((J03_LONGISH.has (x) && J03_LONGISH.has (y)) || (J03_INTISH.has (x) && J03_INTISH.has (y)));
        if (!sameFamily (a, b)) return undefined;
        if (a === 'longprim' && b === 'longprim') return '(' + j03StripParens (args[0]) + ' == ' + j03StripParens (args[1]) + ')';
        if (a === 'intprim' && b === 'intprim') return '(' + j03StripParens (args[0]) + ' == ' + j03StripParens (args[1]) + ')';
        if (a === 'boolprim' && b === 'boolprim') return '(' + j03StripParens (args[0]) + ' == ' + j03StripParens (args[1]) + ')';
        return 'java.util.Objects.equals(' + j03StripParens (args[0]) + ', ' + j03StripParens (args[1]) + ')';
    }
    if (helper === 'add' || helper === 'subtract' || helper === 'multiply' || helper === 'divide') {
        if (args.length !== 2) return undefined;
        const [ a, b ] = kinds;
        if (a === undefined || b === undefined) return undefined;
        if (helper === 'add') {
            // the helper's String branches win over the numeric ones only for a non-Double partner
            const stringish = (k) => k === 'string';
            if (stringish (a) || stringish (b)) {
                const other = stringish (a) ? b : a;
                if (other === 'doublebox' || other === 'doubleprim' || other === 'null') return undefined;
                if (!(stringish (other) || J03_INTEGRAL.has (other) || other === 'boolbox' || other === 'boolprim')) return undefined;
                return '(' + j03StripParens (args[0]) + ' + ' + j03StripParens (args[1]) + ')';
            }
            if (allIn (J03_INTEGRAL)) {
                return j03NullGuard (boxedOf (kinds), '(' + j03AsLong (args[0], a) + ' + ' + j03AsLong (args[1], b) + ')');
            }
            if (allIn (J03_NUMERIC)) {
                return j03NullGuard (boxedOf (kinds), '(' + j03AsDouble (args[0], a) + ' + ' + j03AsDouble (args[1], b) + ')');
            }
            return undefined;
        }
        if (helper === 'subtract') {
            if (!allIn (J03_NUMERIC)) return undefined;
            if (anyIn (new Set ([ 'doublebox', 'doubleprim' ]))) {
                return j03NullGuard (boxedOf (kinds), '(' + j03AsDouble (args[0], a) + ' - ' + j03AsDouble (args[1], b) + ')');
            }
            // `subtract` does NOT normalize Integer: a mixed integral pair answers null, so it must be one family
            const sameIntegral = (J03_LONGISH.has (a) && J03_LONGISH.has (b)) || (J03_INTISH.has (a) && J03_INTISH.has (b));
            if (!sameIntegral) return undefined;
            const expr = '(' + j03StripParens (args[0]) + ' - ' + j03StripParens (args[1]) + ')';
            return j03NullGuard (boxedOf (kinds), expr);
        }
        if (helper === 'multiply') {
            // an integral product boxes Long; a Double product is re-boxed Long when integral -> no Double
            if (!allIn (J03_INTEGRAL)) return undefined;
            return j03NullGuard (boxedOf (kinds), '(' + j03AsLong (args[0], a) + ' * ' + j03AsLong (args[1], b) + ')');
        }
        if (helper === 'divide') {
            if (!allIn (J03_NUMERIC)) return undefined;
            return j03NullGuard (boxedOf (kinds), '(' + j03AsDouble (args[0], a) + ' / ' + j03AsDouble (args[1], b) + ')');
        }
    }
    return undefined;
}

function j03AdjacentOperand (line, start, close) {
    let before = line.slice (0, start).replace (/\s+$/, '');
    const after = line.slice (close + 1).replace (/^\s+/, '');
    // an operator position re-associates the replacement's own parentheses
    if (/[+\-*/%?:]$/.test (before) && !/\($/.test (before)) return true;
    if (/^[+\-*/%?:]/.test (after)) return true;
    if (/^\.[A-Za-z_$]/.test (after)) return true;
    return false;
}

export function nativeJavaJ03Family (content) {
    if (typeof content !== 'string' || !J03_CALL.test (content)) {
        J03_CALL.lastIndex = 0;
        return content;
    }
    J03_CALL.lastIndex = 0;
    const lines = content.split ('\n');
    const maskState = { block: false };
    const masked = lines.map ((line) => j03Mask (line, maskState));
    let from = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes (J03_TRANSPILED)) {
            from = i + 1;
        }
    }
    const starts = [];
    for (let i = 0; i < masked.length; i++) {
        if (J03_SIG.test (lines[i]) && i + 1 < lines.length && lines[i + 1].trim () === '{') {
            starts.push (i);
        }
    }
    const paramsOf = new Map ();
    for (const start of starts) {
        const signature = masked[start];
        const open = signature.indexOf ('(');
        const map = new Map ();
        J03_PARAM.lastIndex = 0;
        let m;
        while ((m = J03_PARAM.exec (signature.slice (open + 1))) !== null) {
            if (!map.has (m[2])) map.set (m[2], m[1]);
        }
        paramsOf.set (start, map);
    }
    const lookupAt = (lineIndex) => (name) => {
        let memberStart = -1;
        for (const start of starts) {
            if (start <= lineIndex) memberStart = start;
            else break;
        }
        for (let j = lineIndex - 1; j > memberStart; j--) {
            const decl = J03_DECL.exec (masked[j]);
            if (decl !== null && decl[3] === name) {
                return decl[2];
            }
        }
        if (memberStart >= 0) {
            const params = paramsOf.get (memberStart);
            if (params !== undefined && params.has (name)) {
                return params.get (name);
            }
        }
        for (let j = Math.max (memberStart, 0) - 1; j >= 0; j--) {
            const field = J03_FIELD.exec (masked[j]);
            if (field !== null && field[2] === name) {
                return field[1];
            }
        }
        return undefined;
    };
    let changed = false;
    for (let i = from; i < lines.length; i++) {
        if (!lines[i].includes ('Helpers.')) {
            continue;
        }
        const lookup = lookupAt (i);
        for (let guard = 0; guard < 8; guard++) {
            const line = lines[i];
            const mask = j03Mask (line, { block: false });
            const hits = [];
            J03_CALL.lastIndex = 0;
            let m;
            while ((m = J03_CALL.exec (mask)) !== null) {
                hits.push ([ m.index, m[1] ]);
            }
            if (hits.length === 0) {
                break;
            }
            let done = false;
            // rightmost first: a nested call is replaced before its enclosing one
            for (let h = hits.length - 1; h >= 0 && !done; h--) {
                const [ start, helper ] = hits[h];
                if (start !== 0 && /[\w.]/.test (mask[start - 1])) {
                    continue;
                }
                const call = j03CallArgs (line, start + ('Helpers.' + helper).length);
                if (call === undefined) {
                    continue;
                }
                const kinds = call.args.map ((arg) => j03KindOf (arg, lookup));
                if (kinds.some ((k) => k === undefined)) {
                    continue;
                }
                const replacement = j03Emit (helper, call.args, kinds);
                if (replacement === undefined) {
                    continue;
                }
                if (j03AdjacentOperand (line, start, call.close)) {
                    continue;
                }
                lines[i] = line.slice (0, start) + replacement + line.slice (call.close + 1);
                changed = true;
                done = true;
            }
            if (!done) {
                break;
            }
        }
    }
    return changed ? lines.join ('\n') : content;
}
