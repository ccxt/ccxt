const CSHARP_DECLARED_COUNT_TYPES = [ 'List<', 'IList<', 'Collection<', 'Dictionary<', 'IDictionary<',
    'ConcurrentDictionary<', 'IReadOnlyDictionary<', 'SortedDictionary<', 'SortedList<', 'HashSet<',
    'ConcurrentQueue<' ];
// declared C# types whose `Length` is getArrayLength's own byte[] / string branch
const CSHARP_DECLARED_LENGTH_TYPES = [ 'byte[]', 'string', 'string?' ];
// declared C# dictionary types whose `ContainsKey` is InOp's IDictionary<string, object> branch
const CSHARP_DECLARED_DICT_TYPES = [ 'Dictionary<', 'IDictionary<', 'ConcurrentDictionary<',
    'IReadOnlyDictionary<', 'SortedDictionary<', 'SortedList<' ];
// space-normalized dictionary types whose indexer hands back an `object`: the box GetValue's
// dictionary branch returns, and the only value the `: null` branch can join
const CSHARP_DECLARED_OBJECT_DICT_TYPES = [ 'Dictionary<string,object>', 'IDictionary<string,object>',
    'ConcurrentDictionary<string,object>', 'IReadOnlyDictionary<string,object>', 'SortedDictionary<string,object>' ];
// declared C# list types whose `Contains` is InOp's IList<object> branch (a List<string> /
// List<Int64> receiver casts the key in the helper, so it keeps the helper)
const CSHARP_DECLARED_LIST_TYPES = [ 'List<object>', 'IList<object>' ];

// a method signature line inside a class body: indented, a member name, an argument list;
// the return type accepts a trailing `?` (`bool?` / `double?`), or the region boundary
// drifts and a later method's body reads the previous method's parameter types
const CSHARP_HELPER_SIGNATURE_RE = /^[ ]{4,}(?:(?:public|private|protected|internal)[ ]+)?(?:static[ ]+|async[ ]+|virtual[ ]+|override[ ]+|sealed[ ]+|new[ ]+|partial[ ]+|extern[ ]+|unsafe[ ]+)*(?:[A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*\(/;
// a declaration of one variable: `Type name = value;` / `Type name;` (`Int64? x` included)
const CSHARP_HELPER_DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]?]*(?:[ ][A-Za-z_][\w<>,.\[\]?]*)*)[ ]+([A-Za-z_]\w*)[ ]*(=[ ]*([^;]*))?;[ ]*$/;
// the same declaration with a collection/object initializer that spans lines (`= new X () {`)
const CSHARP_HELPER_NEW_DECL_RE = /^[ ]*([A-Za-z_][\w<>,.\[\]]*(?:[ ][A-Za-z_][\w<>,.\[\]]*)*)[ ]+([A-Za-z_]\w*)[ ]*=[ ]*new\b[^;]*\{[ ]*$/;
const CSHARP_HELPER_TYPE_RE = /^[A-Za-z_][\w.]*(?:[ ]*<[^<>=;(){}]*>)?(?:[ ]*\[\])?[?]?$/;
// statement keywords a declaration-shaped line may start with
const CSHARP_HELPER_KEYWORDS = [ 'return', 'throw', 'if', 'else', 'while', 'for', 'foreach', 'using',
    'lock', 'yield', 'case', 'switch', 'do', 'try', 'catch', 'break', 'continue', 'goto', 'new',
    'fixed', 'checked', 'unchecked', 'await', 'base', 'this', 'var' ];

// string / char literal bodies and line comments blanked out, offsets and quotes preserved
function csharpHelperMaskLine (line: string): string {
    let out = '';
    let i = 0;
    while (i < line.length) {
        const ch = line[i];
        if ((ch === '/') && (line[i + 1] === '/')) {
            out += ' '.repeat (line.length - i);
            break;
        }
        if ((ch === '"') || (ch === "'")) {
            const quote = ch;
            let j = i + 1;
            out += (quote === '"') ? '"' : ' ';
            while (j < line.length) {
                if (line[j] === '\\') { out += '  '; j += 2; continue; }
                if (line[j] === quote) break;
                out += ' '; j++;
            }
            if (j < line.length) { out += (quote === '"') ? '"' : ' '; j++; }
            i = j;
            continue;
        }
        out += ch;
        i++;
    }
    return out;
}

// the parameter types a signature line (and its continuation lines) declares
function csharpHelperSignatureParams (masked: string[], start: number): { [name: string]: string } {
    let depth = 0;
    let text = '';
    for (let i = start; (i < masked.length) && (i < start + 14); i++) {
        text += masked[i].split ('{')[0] + ' ';
            depth += (masked[i].match (/\(/g) ?? []).length;
            depth -= (masked[i].match (/\)/g) ?? []).length;
        if ((depth <= 0) && text.includes ('(')) {
            break;
        }
    }
    const open = text.indexOf ('(');
    const close = text.lastIndexOf (')');
    if ((open < 0) || (close <= open)) {
        return {};
    }
    const params: { [name: string]: string } = {};
    const parts = [];
    let current = '';
    let nesting = 0;
    for (const ch of text.substring (open + 1, close)) {
        if ((ch === '(') || (ch === '<') || (ch === '[')) nesting++;
        if ((ch === ')') || (ch === '>') || (ch === ']')) nesting--;
        if ((ch === ',') && (nesting === 0)) { parts.push (current); current = ''; continue; }
        current += ch;
    }
    if (current.trim ()) parts.push (current);
    for (const part of parts) {
        const tokens = part.trim ().split ('=')[0].trim ().split (/\s+/).filter ((t) => t.length > 0);
        if (tokens.length < 2) continue;
        const name = tokens[tokens.length - 1];
        let type = tokens.slice (0, tokens.length - 1).join (' ');
        type = type.replace (/^(ref|out|in|params|this)\s+/, '');
        if (!/^[A-Za-z_]\w*$/.test (name) || !CSHARP_HELPER_TYPE_RE.test (type)) continue;
        params[name] = type;
    }
    return params;
}

// the declaration a line carries, or undefined: `Type name = value;` / `Type name;` /
// `Type name = new ...() {` (the initializer continues on the next lines)
function csharpHelperDeclarationOfLine (line: string): { type: string, name: string, value: string } | undefined {
    const match = CSHARP_HELPER_DECL_RE.exec (line);
    if (match === null) {
        const opened = CSHARP_HELPER_NEW_DECL_RE.exec (line);
        if (opened === null) {
            return undefined;
        }
        const type = opened[1].trim ();
        if (CSHARP_HELPER_KEYWORDS.includes (type.split (' ')[0]) || !CSHARP_HELPER_TYPE_RE.test (type)) {
            return undefined;
        }
        return { type, name: opened[2], value: 'new' };
    }
    const type = match[1].trim ();
    const name = match[2];
    if (CSHARP_HELPER_KEYWORDS.includes (type.split (' ')[0]) || !CSHARP_HELPER_TYPE_RE.test (type)) {
        return undefined;
    }
    return { type, name, value: (match[4] ?? '').trim () };
}

// the C# type the emitted text declares for `name` at `line`: a local declared before the read,
// else a parameter of the enclosing signature. A name the region declares with two different
// types is left to the helper (the read may sit behind either binding)
// hand-written ws cache fields declared `IDictionary<string, object>` (cs/ccxt/base/Exchange.Options.cs);
// (orderbooks reads go through getOrderBook); a field may still be null, so reads keep a null test
const CSHARP_WS_CACHE_DICT_FIELDS = [ 'balance', 'tickers', 'fundingRates', 'bidsasks', 'trades', 'ohlcvs' ];

// inOp-only receivers: further hand-written base dictionaries (Exchange.Options.cs, ws/Exchange.WsBridge.cs)
// and the ws client's maps (ws/Client.cs); InOp's IDictionary branches answer ContainsKey for each
const CSHARP_INOP_DICT_FIELDS: { [name: string]: string } = {
    'orderbooks': 'IDictionary<string, object>', 'markets_by_id': 'IDictionary<string, object>',
    'timeframes': 'Dictionary<string, object>', 'has': 'Dictionary<string, object>',
    'options': 'ConcurrentDictionary<string, object>', 'clients': 'ConcurrentDictionary<string, WebSocketClient>',
    'markets': 'IDictionary<string, object>', 'currencies_by_id': 'IDictionary<string, object>',
}
const CSHARP_WS_CLIENT_MAP_RE = /^([A-Za-z_]\w*)\.(subscriptions|futures)$/
const CSHARP_WS_CLIENT_MAPS: { [name: string]: string } = { 'subscriptions': 'IDictionary<string, object>', 'futures': 'IDictionary<string, Future>' }

// `client.subscriptions|futures` where `client` is a `WebSocketClient` parameter or a local bound once
// by `var client = this.client(...)` (never null) and never rebound in the method
function csharpInOpReceiverType (region, name: string, line: number): { type: string, kind: string, value: string } | undefined {
    if (name.startsWith ('this.')) {
        const type = CSHARP_INOP_DICT_FIELDS[name.slice (5)];
        return (type === undefined) ? undefined : { type, kind: 'field', value: '' };
    }
    const member = CSHARP_WS_CLIENT_MAP_RE.exec (name);
    if (member === null) {
        return undefined;
    }
    const client = member[1];
    const writes = region.lines.filter ((l, k) => (k > region.start) && (k < region.end)
        && new RegExp ('(?<![\\w.])' + client + '[ ]*=[^=>]').test (l));
    const bound = writes.filter ((l) => new RegExp ('^[ ]*var[ ]+' + client + '[ ]*=[ ]*this\\.client\\(').test (l));
    const isParam = region.params[client] === 'WebSocketClient';
    const local = region.declarations.some ((d) => d.name === client);
    if (local || !((isParam && writes.length === 0) || (!isParam && writes.length === 1 && bound.length === 1
        && region.lines.findIndex ((l, k) => (k > region.start) && bound.includes (l)) < line))) {
        return undefined;
    }
    return { type: CSHARP_WS_CLIENT_MAPS[member[2]], kind: 'field', value: '' };
}

function csharpHelperReceiverType (region, name: string, line: number, params: { [name: string]: string }): { type: string, kind: string, value: string } | undefined {
    if (name.startsWith ('this.')) {
        return CSHARP_WS_CACHE_DICT_FIELDS.includes (name.slice (5)) ? { type: 'IDictionary<string, object>', kind: 'field', value: '' } : undefined;
    }
    const all = region.declarations.filter ((d) => d.name === name);
    const types = [];
    for (const declaration of all) {
        if (!types.includes (declaration.type)) types.push (declaration.type);
    }
    if (types.length > 1) {
        return undefined; // the read may sit behind either binding
    }
    const declarations = all.filter ((d) => d.line < line);
    if (declarations.length > 0) {
        const last = declarations[declarations.length - 1];
        return { type: last.type, kind: 'local', value: last.value };
    }
    if (all.length > 0) {
        return undefined; // bound only after the read: not the binding the read uses
    }
    if (params[name] !== undefined) {
        return { type: params[name], kind: 'param', value: '' };
    }
    return undefined;
}

// whether the value a local holds at `line` can be null: only a freshly constructed initializer
// that nothing has reassigned is provably non-null
function csharpHelperLocalIsNonNull (region, name: string, line: number, value: string): boolean {
    if (!/^new\b/.test (value)) {
        return false;
    }
    return !region.lines.some ((maskedLine, i) => (i > region.start) && (i < line)
        && new RegExp ('^[ ]*' + name + '[ ]*=[^=]').test (maskedLine));
}

// rewrite every proven helper call on one line; offsets are taken from the mask, the emitted text
// from the original line
function csharpHelperRewriteLine (original: string, masked: string, takeType, takeKeyType, takeIndexType, takeNullableKeyType = (k) => false, takeInOpType = (n) => undefined, objectNull = false): string | undefined {
    const edits = [];
    const lengthCall = /getArrayLength[ ]*\(/g;
    let match;
    while ((match = lengthCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const name = masked.substring (open + 1, close).trim ();
        if (!/^[A-Za-z_]\w*$/.test (name)) continue;
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        const member = CSHARP_DECLARED_COUNT_TYPES.some ((p) => receiver.type.startsWith (p)) ? 'Count'
            : (CSHARP_DECLARED_LENGTH_TYPES.includes (receiver.type) ? 'Length' : undefined);
        if (member === undefined) continue;
        edits.push ({ start: match.index, end: close + 1, text: `(${name}?.${member} ?? 0)` });
    }
    const inCall = /(?<![A-Za-z_])inOp[ ]*\(/g;
    while ((match = inCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const firstComma = csharpHelperTopLevelComma (masked, open, close);
        if (firstComma === undefined) continue;
        const name = masked.substring (open + 1, firstComma).trim ();
        if (!/^(?:this\.)?[A-Za-z_]\w*$/.test (name) && !CSHARP_WS_CLIENT_MAP_RE.test (name)) continue;
        const secondComma = csharpHelperTopLevelComma (masked, firstComma, close);
        if (secondComma !== undefined) continue; // more than two arguments
        const keyMask = masked.substring (firstComma + 1, close).trim ();
        const receiver = takeType (name) ?? takeInOpType (name);
        if (receiver === undefined) continue;
        const nullableKey = (receiver.kind === 'field') && takeNullableKeyType (keyMask);
        if (!nullableKey && !takeKeyType (keyMask)) continue;
        const isDict = CSHARP_DECLARED_DICT_TYPES.some ((p) => receiver.type.startsWith (p));
        const isList = CSHARP_DECLARED_LIST_TYPES.includes (receiver.type);
        if (!isDict && !isList) continue;
        const keyText = original.substring (firstComma + 1, close).trim ();
        const call = `${name}.${isDict ? 'ContainsKey' : 'Contains'}(${keyText})`;
        const guarded = nullableKey || (receiver.type.endsWith ('?')
            || (receiver.kind === 'param' && !receiver.paramsBag)
            || (receiver.kind === 'local' && !receiver.nonNull)
            || (receiver.kind === 'field'));
        const nullTest = nullableKey ? `${name} != null && ${keyText} != null` : `${name} != null`;
        edits.push ({ start: match.index, end: close + 1, text: guarded ? `(${nullTest} && ${call})` : call });
    }
    const valueCall = /(?<![A-Za-z_.])getValue[ ]*\(/g;
    while ((match = valueCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const firstComma = csharpHelperTopLevelComma (masked, open, close);
        if (firstComma === undefined) continue;
        const name = masked.substring (open + 1, firstComma).trim ();
        if (!/^(?:this\.)?[A-Za-z_]\w*$/.test (name)) continue;
        const secondComma = csharpHelperTopLevelComma (masked, firstComma, close);
        if (secondComma !== undefined) continue; // more than two arguments
        const keyMask = masked.substring (firstComma + 1, close).trim ();
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        const keyText = original.substring (firstComma + 1, close).trim ();
        // the helper's IList<object> branch: an index at or past Count reads null, a negative one
        // throws in both forms; only an `int` local or a non-negative int literal is a C# index
        if (CSHARP_DECLARED_LIST_TYPES.includes (receiver.type)) {
            if (!(/^\d{1,9}$/.test (keyMask) || takeIndexType (keyMask))) continue;
            edits.push ({ start: match.index, end: close + 1,
                text: `(${name} != null && ${keyText} < ${name}.Count ? ${name}[${keyText}] : null)` });
            continue;
        }
        // the helper's dictionary branch hands back the boxed value; a value-typed dictionary
        // (int/Int64/double) cannot join the `: null` branch, so only object-valued dictionaries
        if (!CSHARP_DECLARED_OBJECT_DICT_TYPES.includes (receiver.type.replace (/\s+/g, ''))) continue;
        const nullableValueKey = (receiver.kind === 'field') && takeNullableKeyType (keyMask);
        if (!nullableValueKey && !takeKeyType (keyMask)) continue;
        const valueNullTest = nullableValueKey ? `${name} != null && ${keyText} != null` : `${name} != null`;
        edits.push ({ start: match.index, end: close + 1,
            text: `(${valueNullTest} && ${name}.ContainsKey(${keyText}) ? ${name}[${keyText}] : null)` });
    }
    csharpHelperOperatorEdits (original, masked, takeType, edits, objectNull);
    // only in the final pass, after the identifier-copy retypes (they read isTrue on `object` names)
    if (objectNull) {
        csharpHelperTruthEdits (original, masked, takeType, edits);
    }
    if (edits.length === 0) {
        return undefined;
    }
    let out = original;
    for (const edit of edits.sort ((a, b) => b.start - a.start)) {
        out = out.substring (0, edit.start) + edit.text + out.substring (edit.end);
    }
    return out;
}

// declared C# kinds an operator rule may read: the value the emitted declaration holds
const CSHARP_OPERATOR_STRING_TYPES = [ 'string', 'string?' ];
const CSHARP_OPERATOR_NULLABLE_TYPES = [ 'string', 'string?', 'Int64?', 'long?', 'int?', 'double?', 'bool?' ];
const CSHARP_OPERATOR_BOOL_TYPES = [ 'bool', 'bool?' ];
const CSHARP_OPERATOR_INTEGER_TYPES = [ 'int', 'Int64', 'long' ];
const CSHARP_OPERATOR_NUMERIC_TYPES = [ 'int', 'Int64', 'long', 'double' ];
const CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES = [ 'Int64?', 'long?', 'int?' ];
const CSHARP_OPERATOR_NULLABLE_NUMERIC_TYPES = [ 'Int64?', 'long?', 'int?', 'double?' ];
const CSHARP_OPERATOR_TOKENS = { isGreaterThan: '>', isGreaterThanOrEqual: '>=', isLessThan: '<', isLessThanOrEqual: '<=' };

// the kind of one printed operand: a string / numeric literal, null, or a name the emitted
// text declares (its declared type); undefined for every other expression
function csharpOperatorOperand (maskedArg: string, originalArg: string, takeType) {
    if (/^"[ ]*"$/.test (maskedArg) && /^"(?:[^"\\]|\\.)*"$/.test (originalArg)) {
        return { kind: 'string-literal' };
    }
    if (maskedArg === 'null') {
        return { kind: 'null' };
    }
    if ((maskedArg === 'true') || (maskedArg === 'false')) {
        return { kind: 'bool-literal' };
    }
    if (/^-?\d{1,15}$/.test (maskedArg)) {
        return { kind: 'integer-literal' };
    }
    if (/^-?\d+\.\d+$/.test (maskedArg)) {
        return { kind: 'double-literal' };
    }
    if (!/^[A-Za-z_]\w*$/.test (maskedArg) || (maskedArg === 'null')) {
        return undefined;
    }
    const receiver = takeType (maskedArg);
    return (receiver === undefined) ? undefined : { kind: 'name', type: receiver.type };
}

// `isEqual(a, b)` -> `(a == b)` and `isGreaterThan(a, b)` & co -> the operator, when the emitted
// declarations make the C# operator compute the helper's answer for every value the operands
// can hold (a null / NaN operand whose helper branch differs keeps the helper)
function csharpNativeOperatorText (helper: string, left, right, leftText: string, rightText: string, objectNull: boolean): string | undefined {
    const isName = (o, types) => (o.kind === 'name') && types.includes (o.type);
    if (helper === 'isEqual') {
        // string ordinal equality, null on either side answering like isEqual's null branch
        const stringPair = (isName (left, CSHARP_OPERATOR_STRING_TYPES) && ((right.kind === 'string-literal') || isName (right, CSHARP_OPERATOR_STRING_TYPES)))
            || (isName (right, CSHARP_OPERATOR_STRING_TYPES) && (left.kind === 'string-literal'));
        // an `object` name is null only for the null box, which is isEqual's both-null branch
        const nullableName = (o) => isName (o, CSHARP_OPERATOR_NULLABLE_TYPES) || (objectNull && isName (o, [ 'object' ]));
        const nullTest = (nullableName (left) && (right.kind === 'null')) || (nullableName (right) && (left.kind === 'null'));
        // bool equality: a null `bool?` differs from both literals, like isEqual's null branch
        const boolPair = (isName (left, CSHARP_OPERATOR_BOOL_TYPES) && (right.kind === 'bool-literal'))
            || (isName (right, CSHARP_OPERATOR_BOOL_TYPES) && (left.kind === 'bool-literal'));
        // integers compare through Convert.ToInt64 in isEqual: the same value comparison
        // (a nullable integer: null equals only null in both, the lifted `==`)
        const integer = (o) => isName (o, CSHARP_OPERATOR_INTEGER_TYPES) || isName (o, CSHARP_OPERATOR_NULLABLE_INTEGER_TYPES) || (o.kind === 'integer-literal');
        const integerPair = integer (left) && integer (right)
            && ((left.kind === 'name') || (right.kind === 'name'));
        return (stringPair || nullTest || boolPair || integerPair) ? `(${leftText} == ${rightText})` : undefined;
    }
    const token = CSHARP_OPERATOR_TOKENS[helper];
    if (token === undefined) {
        return undefined;
    }
    const numericLiteral = (o) => (o.kind === 'integer-literal') || (o.kind === 'double-literal');
    const plain = (o) => isName (o, CSHARP_OPERATOR_NUMERIC_TYPES) || numericLiteral (o);
    if ((left.kind !== 'name') && (right.kind !== 'name')) {
        return undefined;
    }
    const integral = (o) => isName (o, CSHARP_OPERATOR_INTEGER_TYPES) || (o.kind === 'integer-literal');
    if (integral (left) && integral (right)) {
        return `(${leftText} ${token} ${rightText})`;
    }
    // `>` / `>=`: the helper answers false for a null left (isEqual(null, x) is false too) and for a
    // NaN operand, as the lifted / IEEE operator does; `<` / `<=` answer true there, so they stay.
    // Two names must share a kind (Int64 vs double compares exactly only through a literal), and an
    // `int` left meets only integers (isEqual's `(int)b` cast of a double box answers false)
    if ((token === '>') || (token === '>=')) {
        const leftOk = plain (left) || isName (left, CSHARP_OPERATOR_NULLABLE_NUMERIC_TYPES);
        const bothNames = (left.kind === 'name') && (right.kind === 'name');
        const leftBase = (left.kind === 'name') ? left.type.replace ('?', '').replace ('long', 'Int64') : '';
        const rightBase = (right.kind === 'name') ? right.type.replace ('long', 'Int64') : '';
        const sameKind = !bothNames || (leftBase === rightBase) || ((leftBase !== 'double') && (rightBase !== 'double'));
        const intLeft = (leftBase === 'int') && !integral (right);
        if (leftOk && plain (right) && sameKind && !intLeft) {
            return `(${leftText} ${token} ${rightText})`;
        }
    }
    return undefined;
}

// a line that may carry a call one of the rewrites above takes
const CSHARP_HELPER_LINE_RE = /getArrayLength|inOp|getValue|isEqual|isGreaterThan|isLessThan|isTrue/;

// the operator helper calls of one line whose operands the emitted declarations prove
function csharpHelperOperatorEdits (original: string, masked: string, takeType, edits, objectNull: boolean) {
    const helperCall = /(?<![A-Za-z0-9_.])(isEqual|isGreaterThan|isGreaterThanOrEqual|isLessThan|isLessThanOrEqual)\(/g;
    let match;
    while ((match = helperCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const comma = csharpHelperTopLevelComma (masked, open, close);
        if ((comma === undefined) || (csharpHelperTopLevelComma (masked, comma, close) !== undefined)) continue;
        if (edits.some ((e) => (e.start < close + 1) && (match.index < e.end))) continue;
        const leftText = original.substring (open + 1, comma).trim ();
        const rightText = original.substring (comma + 1, close).trim ();
        const left = csharpOperatorOperand (masked.substring (open + 1, comma).trim (), leftText, takeType);
        const right = csharpOperatorOperand (masked.substring (comma + 1, close).trim (), rightText, takeType);
        if ((left === undefined) || (right === undefined)) continue;
        const text = csharpNativeOperatorText (match[1], left, right, leftText, rightText, objectNull);
        if (text !== undefined) {
            edits.push ({ start: match.index, end: close + 1, text });
        }
    }
}

// `isTrue(x)` on a name the emitted text declares `bool` -> `x` (the bool overload is identity) and
// `bool?` -> `(x == true)` (the boxed null / false / true answer isTrue(object)'s false / false / true)
function csharpHelperTruthEdits (original: string, masked: string, takeType, edits) {
    const truthCall = /(?<![A-Za-z0-9_.])isTrue\(/g;
    let match;
    while ((match = truthCall.exec (masked)) !== null) {
        const open = match.index + match[0].length - 1;
        const close = csharpHelperCallEnd (masked, open);
        if (close === undefined) continue;
        const name = masked.substring (open + 1, close).trim ();
        if (!/^[A-Za-z_]\w*$/.test (name) || (name === 'null') || (name === 'true') || (name === 'false')) continue;
        if (edits.some ((e) => (e.start < close + 1) && (match.index < e.end))) continue;
        const receiver = takeType (name);
        if (receiver === undefined) continue;
        const text = (receiver.type === 'bool') ? name : ((receiver.type === 'bool?') ? `(${name} == true)` : undefined);
        if (text !== undefined) {
            edits.push ({ start: match.index, end: close + 1, text });
        }
    }
}

// the index of the `)` closing the call whose `(` sits at `open`
function csharpHelperCallEnd (line: string, open: number): number | undefined {
    let depth = 0;
    for (let i = open; i < line.length; i++) {
        if (line[i] === '(') depth++;
        if (line[i] === ')') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return undefined;
}

// the index of the first comma at the argument level between `open` and `close`
function csharpHelperTopLevelComma (line: string, open: number, close: number): number | undefined {
    let depth = 0;
    for (let i = open + 1; i < close; i++) {
        const ch = line[i];
        if ((ch === '(') || (ch === '[') || (ch === '{')) depth++;
        if ((ch === ')') || (ch === ']') || (ch === '}')) depth--;
        if ((ch === ',') && (depth === 0)) return i;
    }
    return undefined;
}

// `getArrayLength(x)` -> `(x?.Count ?? 0)` / `(x?.Length ?? 0)`, `inOp(x, k)` ->
// `x.ContainsKey(k)` / `x.Contains(k)` (with a null test where the emitted declaration allows a
// null receiver) for every receiver the emitted signature / declarations type as a collection
export function nativeDeclaredHelperCalls (content: string, objectNull = true): string {
    if (!CSHARP_HELPER_LINE_RE.test (content)) {
        return content;
    }
    const lines = content.split ('\n');
    const masked = lines.map (csharpHelperMaskLine);
    const signatures = [];
    for (let i = 0; i < masked.length; i++) {
        if (CSHARP_HELPER_SIGNATURE_RE.test (masked[i]) && !masked[i].trimEnd ().endsWith (';')) {
            signatures.push (i);
        }
    }
    if (signatures.length === 0) {
        return content;
    }
    const regions = [];
    for (let n = 0; n < signatures.length; n++) {
        const start = signatures[n];
        const end = (n + 1 < signatures.length) ? signatures[n + 1] : lines.length;
        const params = csharpHelperSignatureParams (masked, start);
        const declarations = [];
        for (let i = start; i < end; i++) {
            const declaration = csharpHelperDeclarationOfLine (masked[i]);
            if (declaration !== undefined) {
                declarations.push ({ line: i, name: declaration.name, type: declaration.type, value: declaration.value });
            }
        }
        regions.push ({ start, end, params, declarations, lines: masked });
    }
    const regionOfLine = (line: number) => {
        let current = regions[0];
        for (const region of regions) {
            if (region.start <= line) current = region;
        }
        return current;
    };
    let changed = false;
    const out = lines.map ((line, i) => {
        if (!CSHARP_HELPER_LINE_RE.test (line)) {
            return line;
        }
        const region = regionOfLine (i);
        if ((i <= region.start) || (i >= region.end)) {
            return line;
        }
        const rewrite = (name, isKey = false) => {
            if (isKey) {
                if (!/^[A-Za-z_]\w*$/.test (name)) return false;
                const key = csharpHelperReceiverType (region, name, i, region.params);
                return (key !== undefined) && (key.type === 'string');
            }
            const receiver = csharpHelperReceiverType (region, name, i, region.params);
            if (receiver === undefined) {
                return undefined;
            }
            if (receiver.kind === 'local') {
                receiver.nonNull = csharpHelperLocalIsNonNull (region, name, i, receiver.value);
            }
            if (receiver.kind === 'param') {
                const bag = new RegExp ('^[ ]*' + name + '[ ]*\\?\\?=');
                receiver.paramsBag = masked.some ((maskedLine, k) => (k > region.start) && (k < i) && bag.test (maskedLine));
            }
            return receiver;
        };
        const takeType = (name) => rewrite (name, false);
        // an `int` index: every binding of the name in the method is an `int` local or
        // `for (int name = ...)` header, so the read compiles as a List indexer argument
        const takeIndexType = (keyMask) => {
            if (!/^[A-Za-z_]\w*$/.test (keyMask) || (region.params[keyMask] !== undefined)) return false;
            const bound = region.declarations.filter ((d) => d.name === keyMask);
            if (bound.some ((d) => d.type !== 'int')) return false;
            // any other typed binding (foreach / lambda / catch / out variable) keeps the helper
            const typed = new RegExp ('([A-Za-z_][\\w<>?\\[\\]]*)[ ]+' + keyMask + '\\b(?=[ ]*(?:=[^=]|;|\\)|,|in\\b))', 'g');
            for (let k = region.start + 1; k < region.end; k++) {
                for (const m of masked[k].matchAll (typed)) {
                    if (![ 'int', 'return', 'throw', 'else', 'case', 'await', 'new', 'in' ].includes (m[1])) return false;
                }
            }
            const header = new RegExp ('\\bfor[ ]*\\([ ]*int[ ]+' + keyMask + '[ ]*=');
            const loops = masked.some ((maskedLine, k) => (k > region.start) && (k <= i) && header.test (maskedLine));
            return loops || bound.some ((d) => d.line < i);
        };
        const takeKeyType = (keyMask) => {
            if (keyMask.startsWith ('"')) return true; // a string literal is never null
            return rewrite (keyMask, true) === true;
        };
        // a `string?` local/param key: a ws cache field read tests it for null first, as the helper does
        const takeNullableKeyType = (keyMask) => {
            if (!/^[A-Za-z_]\w*$/.test (keyMask)) return false;
            const key = csharpHelperReceiverType (region, keyMask, i, region.params);
            return (key !== undefined) && (key.type === 'string?');
        };
        const rewritten = csharpHelperRewriteLine (line, masked[i], takeType, takeKeyType, takeIndexType, takeNullableKeyType, (name) => csharpInOpReceiverType (region, name, i), objectNull);
        if (rewritten === undefined) {
            return line;
        }
        changed = true;
        return rewritten;
    });
    return changed ? out.join ('\n') : content;
}
