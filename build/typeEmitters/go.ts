// Go emitter for the base type files: go/v4/exchange_types.go and
// go/v4/exchange_prediction_types.go.
//
// Those two files are NOT pure generated dumps — they interleave a lot of hand-written
// support code (the Safe*Typed helpers, parseOrderBookEntries, the GetTicker/SetTicker/
// String()/Get/Set methods, the NewXArray helpers, ...). So instead of rewriting whole
// files this emitter regenerates ONLY the `type X struct { ... }` blocks and their
// `func NewX(...) X { ... }` constructors, and splices them back over the existing
// declarations (see typeEmitters/splice.ts). Everything outside those anchors survives
// byte-for-byte, which makes the resulting diff exactly the drift against
// ts/src/base/types.ts and nothing else.
//
// What is taken from ts/src/base/types.ts (the source of truth):
//   * the SET of fields          — TS-only fields are added, Go-only fields are dropped
//   * the JSON key of each field — so `impliedVolatility` can never read "bidVolume" again
//   * the Go type of each field, for the TS types that are unambiguous:
//         Num  -> *float64   Int  -> *int64   Str/string -> *string   Bool -> *bool
//         X[]  -> []X        Dictionary<X> -> map[string]X            any -> map[string]any
//     TS `number` is deliberately NOT remapped: TS does not distinguish int from float,
//     so the port keeps whatever it already declared for those fields.
//
// What is taken from the existing Go file (so the diff stays free of cosmetic churn):
//   * field order, and the Go spelling of every field that already exists
//     (MarketInterface.BaseCurrency, Transaction.TxId, DepositWithdrawFeeNetwork.fee, ...)
//   * the constructor signature, its preamble/postamble and every hand-written field
//     expression (`Info: m`, `Fee: NewFee(SafeValue(...))`, `Trades: trades`, ...).
//     Only *plain* accessors (Safe*Typed / GetInfo) are regenerated — those are exactly
//     the ones that can silently drift.
//
// gofmt: struct fields and composite-literal values are column-aligned with spaces the
// same way gofmt's tabwriter does it (pad every name in the block to the longest one),
// so the output is gofmt-clean without shelling out to the gofmt binary.

import fs from 'fs';
import path from 'path';
import { TypesIR, IRType, IRField, resolveScalar, ensureGeneratedBanner } from '../typesIR.js';
import { EmittedBlock, SpliceResult, spliceBlocks, findBraceBlockEnd } from './splice.js';

// transpileTypes.ts runs its CLI at import time, so its interfaces are restated here
// instead of imported.
interface EmitterOutput {
    path: string;
    contents: string;
    changed: string[];
}

interface LanguageEmitter {
    id: string;
    emit: (ir: TypesIR, repoRoot: string) => EmitterOutput[];
}

const TARGET_FILES = [
    path.join ('go', 'v4', 'exchange_types.go'),
    path.join ('go', 'v4', 'exchange_prediction_types.go'),
];

/** Go struct name -> TS declaration name, where the two disagree. */
const GO_TO_TS_TYPE: Record<string, string> = {
    'Fee': 'FeeInterface',
    'Currency': 'CurrencyInterface',
    'WithdrawlResponse': 'WithdrawalResponse', // the Go struct name carries a typo
};

/** TS declaration name -> Go struct name (the inverse of the above). */
const TS_TO_GO_TYPE: Record<string, string> = {
    'FeeInterface': 'Fee',
    'CurrencyInterface': 'Currency',
    'WithdrawalResponse': 'WithdrawlResponse',
    'Market': 'MarketInterface',   // `type Market = MarketInterface | undefined`
    'Currency ': 'Currency',
};

/**
 * Go structs that intentionally do not mirror a TS declaration and are therefore left
 * to the hand-written code. Every entry needs a reason — this list is the audit trail.
 */
const NOT_GENERATED: Record<string, string> = {
    'Market': 'legacy flattened market view with a time.Time `Created`; TS `Market` is an alias of MarketInterface',
    'Limits': 'synthesised from the inline `MarketInterface.limits` object literal, bespoke constructor',
    'CurrencyLimits': 'synthesised from the inline `CurrencyInterface.limits` object literal, bespoke constructor',
    'Network': 'synthesised from `CurrencyInterface.networks: Dictionary<any>`, no TS declaration',
    'Balances': 'dictionary wrapper carrying extra Free/Used/Total projections built by hand',
    'OHLCV': 'TS declares a positional tuple; the Go field names (Timestamp/Open/...) exist only in Go',
};

/** Go field name -> TS field name, where the port renamed the field on purpose. */
const FIELD_ALIASES: Record<string, Record<string, string>> = {
    'MarketInterface': { 'BaseCurrency': 'base', 'QuoteCurrency': 'quote' },
    'OrderRequest': { 'Parameters': 'params' },
    'PredictionOrderRequest': { 'Parameters': 'params' },
};

/**
 * Go-only fields kept even though `ts/src/base/types.ts` does not declare them.
 * Removing a public field is source-breaking for Go consumers, so a field that is merely
 * stale is preserved verbatim (same choice PR #29502 made for the C# structs). The one
 * exception is `PredictionPosition.oppositeOutcome`, which #29502 removed from C# on the
 * grounds that TS is the source of truth; it is dropped here for cross-language parity.
 */
const KEEP_PORT_ONLY: Record<string, string[]> = {
    'FundingHistory': [ 'Currency' ],
    'IsolatedBorrowRate': [ 'Rate' ],
    'Leverage': [ 'Leverage' ],
};

/**
 * Go field name -> forced Go type, for fields the port deliberately carries at a
 * different width than the TS scalar (validated against C#/Java). This is the audit
 * trail — the emitter does NOT infer these from bare TS `number`, which is ambiguous.
 */
const TYPE_OVERRIDES: Record<string, Record<string, string>> = {
    // TS `Int` (timestamp) but Go/C# hold it as a float — Go port choice, keep
    'Position': { 'Timestamp': '*float64', 'LastUpdateTimestamp': '*float64' },
    // TS `Num` but Go/C# hold it as an int (leverage tier levels)
    'LeverageTier': { 'Tier': '*int64' },
};

const PLAIN_ACCESSOR = /^(?:Safe(?:Float|Int64|String|Bool)Typed\(\s*\w+\s*,\s*(?:"[^"]*"|\d+)\s*\)|GetInfo\(\s*\w+\s*\))$/;

const PLAIN_STRING_KEY_ACCESSOR = /^(Safe(?:Float|Int64|String|Bool)Typed\(\s*\w+\s*,\s*")([^"]*)("\s*\))$/;

/** a kept plain accessor keeps its width from the port, but its JSON key must follow
    ts/src/base/types.ts — a drifted key (e.g. Position.ContractSize reading
    "contractsSize", #29528) self-heals on the next regeneration. numeric-index and
    GetInfo accessors carry no string key and pass through unchanged */
function plainAccessorWithTsKey (expr: string, tsName: string): string {
    return expr.replace (PLAIN_STRING_KEY_ACCESSOR, '$1' + tsName + '$3');
}

/** `'info'` and `"info"` are legal TS member names — MarginModification quotes all of its. */
function tsFieldName (field: IRField): string {
    const raw = field.name;
    if ((raw.startsWith ("'") && raw.endsWith ("'")) || (raw.startsWith ('"') && raw.endsWith ('"'))) {
        return raw.slice (1, -1);
    }
    return raw;
}

interface LearnedField {
    name: string;
    type: string;
}

interface LearnedEntry {
    key: string;
    expr: string;
}

interface LearnedStruct {
    name: string;
    fields: LearnedField[];
    parsable: boolean;
}

interface LearnedCtor {
    name: string;
    signature: string;
    param: string;
    preamble: string[];
    entries: LearnedEntry[];
    postamble: string[];
    parsable: boolean;
}

interface LearnedFile {
    path: string;
    text: string;
    structs: Record<string, LearnedStruct>;
    ctors: Record<string, LearnedCtor>;
}

interface ResolvedField {
    goName: string;
    goType: string;
    expr: string;
    inStruct: boolean;
    inLiteral: boolean;
}

// ---------------------------------------------------------------------------------
// parsing the existing Go files
// ---------------------------------------------------------------------------------

function parseStruct (lines: string[], start: number, name: string): LearnedStruct {
    const end = findBraceBlockEnd (lines, start);
    const fields: LearnedField[] = [];
    let parsable = end > start;
    for (let i = start + 1; i < end; i++) {
        const match = /^\t(\w+)[ \t]+(\S.*)$/.exec (lines[i]);
        if (match === null) {
            parsable = false;
            break;
        }
        fields.push ({ 'name': match[1], 'type': match[2] });
    }
    return { 'name': name, 'fields': fields, 'parsable': parsable };
}

function parseCtor (lines: string[], start: number, name: string): LearnedCtor {
    const end = findBraceBlockEnd (lines, start);
    const signature = lines[start];
    const paramMatch = /^func New\w+\(\s*(\w+)/.exec (signature);
    const param = paramMatch === null ? 'data' : paramMatch[1];
    const empty: LearnedCtor = { 'name': name, 'signature': signature, 'param': param, 'preamble': [], 'entries': [], 'postamble': [], 'parsable': false };
    if (end < 0) {
        return empty;
    }
    let literalStart = -1;
    for (let i = start + 1; i < end; i++) {
        if (lines[i] === '\treturn ' + name + '{') {
            literalStart = i;
            break;
        }
    }
    if (literalStart < 0) {
        return empty;
    }
    let literalEnd = -1;
    for (let i = literalStart + 1; i < end; i++) {
        if (lines[i] === '\t}') {
            literalEnd = i;
            break;
        }
    }
    if (literalEnd < 0) {
        return empty;
    }
    const entries: LearnedEntry[] = [];
    for (let i = literalStart + 1; i < literalEnd; i++) {
        const match = /^\t\t(\w+):[ \t]+(.*),$/.exec (lines[i]);
        if (match === null) {
            return empty;
        }
        entries.push ({ 'key': match[1], 'expr': match[2] });
    }
    return {
        'name': name,
        'signature': signature,
        'param': param,
        'preamble': lines.slice (start + 1, literalStart),
        'entries': entries,
        'postamble': lines.slice (literalEnd + 1, end),
        'parsable': true,
    };
}

function learnFile (repoRoot: string, relativePath: string): LearnedFile {
    const text = fs.readFileSync (path.join (repoRoot, relativePath), 'utf8');
    const lines = text.split ('\n');
    const structs: Record<string, LearnedStruct> = {};
    const ctors: Record<string, LearnedCtor> = {};
    for (let i = 0; i < lines.length; i++) {
        const structMatch = /^type (\w+) struct \{$/.exec (lines[i]);
        if (structMatch !== null) {
            structs[structMatch[1]] = parseStruct (lines, i, structMatch[1]);
            continue;
        }
        const ctorMatch = /^func New(\w+)\([^)]*\) (\w+) \{$/.exec (lines[i]);
        if (ctorMatch !== null && ctorMatch[1] === ctorMatch[2]) {
            ctors[ctorMatch[1]] = parseCtor (lines, i, ctorMatch[1]);
        }
    }
    return { 'path': relativePath, 'text': text, 'structs': structs, 'ctors': ctors };
}

// ---------------------------------------------------------------------------------
// TS type -> Go type
// ---------------------------------------------------------------------------------

function goTypeName (tsName: string): string {
    const mapped = TS_TO_GO_TYPE[tsName];
    return mapped === undefined ? tsName : mapped;
}

function unionMembers (tsType: string): string[] {
    const parts = tsType.split ('|');
    const out: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim ();
        if (part !== '' && part !== 'undefined' && part !== 'null') {
            out.push (part);
        }
    }
    return out;
}

/** Resolves a TS type text down to one of: number|int|string|boolean|any|<TypeName>. */
function resolveTs (ir: TypesIR, tsType: string): string {
    const members = unionMembers (tsType);
    const resolved: string[] = [];
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.startsWith ("'") || member.startsWith ('"')) {
            resolved.push ('string');
            continue;
        }
        if (member === 'Int' || member === 'int') {
            resolved.push ('int');
            continue;
        }
        const scalar = resolveScalar (ir, member);
        if (scalar === 'Int' || scalar === 'int') {
            resolved.push ('int');
        } else {
            resolved.push (scalar === member ? member : scalar);
        }
    }
    if (resolved.length === 0) {
        return 'any';
    }
    let all = resolved[0];
    for (let i = 1; i < resolved.length; i++) {
        if (resolved[i] !== all) {
            // a mixed union (e.g. 'buy' | 'sell' | Str) collapses to string when every
            // member is string-ish, otherwise it stays opaque
            if (resolved[i] === 'string' && all === 'string') {
                continue;
            }
            all = 'any';
            break;
        }
    }
    return all;
}

/**
 * The Go type a field must have. `undefined` means "TS is not specific enough to decide"
 * (bare `number`, `any`, inline object literals) — the port's own declaration wins there.
 */
function goTypeFor (ir: TypesIR, field: IRField): string | undefined {
    if (field.kind === 'inline') {
        return undefined;
    }
    if (tsFieldName (field) === 'info' && field.tsType.trim () === 'any') {
        // every port models the raw exchange payload as the untyped map
        return 'map[string]any';
    }
    // TS scalar aliases are nullable unions (`Num` = number | undefined). A bare
    // `number` stays ambiguous, so only the nullable aliases pin the Go width.
    const scalarAliases = unionMembers (field.tsType);
    if (scalarAliases.indexOf ('Int') >= 0 || scalarAliases.indexOf ('int') >= 0) {
        return '*int64';
    }
    if (field.kind === 'array') {
        const element = field.elementType === undefined ? '' : field.elementType.trim ();
        if (element.startsWith ('[')) {
            // [Num, Num][] — the order book rows
            return '[][]float64';
        }
        const resolvedElement = resolveTs (ir, element);
        if (resolvedElement === 'string') {
            return '[]string';
        }
        if (ir.byName[element] !== undefined) {
            return '[]' + goTypeName (element);
        }
        return undefined;
    }
    if (field.kind === 'dict') {
        const value = field.elementType === undefined ? '' : field.elementType.trim ();
        if (ir.byName[value] === undefined) {
            return undefined;
        }
        return 'map[string]' + goTypeName (value);
    }
    if (field.kind === 'tuple') {
        return undefined;
    }
    const resolved = resolveTs (ir, field.tsType);
    if (resolved === 'string') {
        return '*string';
    }
    if (resolved === 'boolean') {
        return '*bool';
    }
    if (resolved === 'int') {
        return '*int64';
    }
    if (resolved === 'number') {
        // `Num` is unambiguous, a bare `number` is not
        return unionMembers (field.tsType).indexOf ('number') >= 0 ? undefined : '*float64';
    }
    if (resolved === 'any') {
        return undefined;
    }
    if (ir.byName[resolved] !== undefined) {
        return goTypeName (resolved);
    }
    return undefined;
}

function baseGoType (goType: string): string {
    return goType.startsWith ('*') ? goType.slice (1) : goType;
}

// ---------------------------------------------------------------------------------
// field expressions
// ---------------------------------------------------------------------------------

function accessorOf (ctor: LearnedCtor): string {
    const counts: Record<string, number> = {};
    let best = ctor.param;
    let bestCount = 0;
    for (let i = 0; i < ctor.entries.length; i++) {
        const match = /^(?:Safe(?:Float|Int64|String|Bool)Typed|GetInfo)\(\s*(\w+)/.exec (ctor.entries[i].expr);
        if (match === null) {
            continue;
        }
        const name = match[1];
        counts[name] = (counts[name] === undefined ? 0 : counts[name]) + 1;
        if (counts[name] > bestCount) {
            best = name;
            bestCount = counts[name];
        }
    }
    return best;
}

function defaultExpr (goType: string, key: string, accessor: string, isInfo: boolean, helpers: Record<string, boolean>): string | undefined {
    if (goType === '*float64') {
        return 'SafeFloatTyped(' + accessor + ', "' + key + '")';
    }
    if (goType === '*int64') {
        return 'SafeInt64Typed(' + accessor + ', "' + key + '")';
    }
    if (goType === '*string') {
        return 'SafeStringTyped(' + accessor + ', "' + key + '")';
    }
    if (goType === '*bool') {
        return 'SafeBoolTyped(' + accessor + ', "' + key + '")';
    }
    if (goType === 'map[string]any') {
        return isInfo ? 'GetInfo(' + accessor + ')' : undefined;
    }
    if (goType === '[]string') {
        return helpers['NewStringArray'] ? 'NewStringArray(' + accessor + '["' + key + '"])' : undefined;
    }
    if (goType.startsWith ('[]')) {
        const helper = 'New' + goType.slice (2) + 'Array';
        return helpers[helper] ? helper + '(' + accessor + '["' + key + '"])' : undefined;
    }
    if (goType.startsWith ('map[string]')) {
        return undefined;
    }
    const constructor = 'New' + baseGoType (goType);
    if (helpers[constructor]) {
        return constructor + '(SafeValue(' + accessor + ', "' + key + '", map[string]any{}).(map[string]any))';
    }
    return undefined;
}

// ---------------------------------------------------------------------------------
// rendering (gofmt-compatible column alignment)
// ---------------------------------------------------------------------------------

function renderStruct (name: string, fields: ResolvedField[]): string {
    let width = 0;
    for (let i = 0; i < fields.length; i++) {
        width = Math.max (width, fields[i].goName.length);
    }
    const lines = [ 'type ' + name + ' struct {' ];
    for (let i = 0; i < fields.length; i++) {
        const padding = ' '.repeat (width - fields[i].goName.length + 1);
        lines.push ('\t' + fields[i].goName + padding + fields[i].goType);
    }
    lines.push ('}');
    return lines.join ('\n');
}

function renderCtor (ctor: LearnedCtor, fields: ResolvedField[]): string {
    let width = 0;
    for (let i = 0; i < fields.length; i++) {
        width = Math.max (width, fields[i].goName.length + 1);
    }
    const lines = [ ctor.signature ].concat (ctor.preamble);
    lines.push ('\treturn ' + ctor.name + '{');
    for (let i = 0; i < fields.length; i++) {
        const key = fields[i].goName + ':';
        const padding = ' '.repeat (width - key.length + 1);
        lines.push ('\t\t' + key + padding + fields[i].expr + ',');
    }
    lines.push ('\t}');
    return lines.concat (ctor.postamble).concat ([ '}' ]).join ('\n');
}

// ---------------------------------------------------------------------------------
// per-type generation
// ---------------------------------------------------------------------------------

interface TypePlan {
    blocks: EmittedBlock[];
    notes: string[];
}

function mergeOrder (existing: string[], tsOrder: string[], known: Record<string, boolean>): string[] {
    const order = existing.slice ();
    for (let i = 0; i < tsOrder.length; i++) {
        const goName = tsOrder[i];
        if (!known[goName] || order.indexOf (goName) >= 0) {
            continue;
        }
        let position = 0;
        for (let j = i - 1; j >= 0; j--) {
            const previous = order.indexOf (tsOrder[j]);
            if (previous >= 0) {
                position = previous + 1;
                break;
            }
        }
        order.splice (position, 0, goName);
    }
    return order;
}

function capitalize (name: string): string {
    return name.charAt (0).toUpperCase () + name.slice (1);
}

function planInterface (ir: TypesIR, goName: string, type: IRType, learned: LearnedFile, helpers: Record<string, boolean>): TypePlan {
    const notes: string[] = [];
    const struct = learned.structs[goName];
    const ctor = learned.ctors[goName];
    if (struct === undefined || !struct.parsable) {
        return { 'blocks': [], 'notes': [ goName + ': struct block not found or not parsable, left untouched' ] };
    }
    const aliases = FIELD_ALIASES[goName] === undefined ? {} : FIELD_ALIASES[goName];
    const tsByLower: Record<string, IRField> = {};
    for (let i = 0; i < type.fields.length; i++) {
        tsByLower[tsFieldName (type.fields[i]).toLowerCase ()] = type.fields[i];
    }
    const learnedTypes: Record<string, string> = {};
    for (let i = 0; i < struct.fields.length; i++) {
        learnedTypes[struct.fields[i].name] = struct.fields[i].type;
    }
    const learnedExprs: Record<string, string> = {};
    const hasCtor = ctor !== undefined && ctor.parsable;
    if (hasCtor) {
        for (let i = 0; i < ctor.entries.length; i++) {
            learnedExprs[ctor.entries[i].key] = ctor.entries[i].expr;
        }
    }
    const accessor = ctor === undefined ? 'data' : accessorOf (ctor);
    // Go field name for every TS field: the existing spelling when the field is already
    // there, capitalised TS name otherwise
    const goNameOfTs: Record<string, string> = {};
    const keptPortOnly: string[] = [];
    const matchedTs: Record<string, boolean> = {};
    for (let i = 0; i < struct.fields.length; i++) {
        const fieldName = struct.fields[i].name;
        const aliased = aliases[fieldName] === undefined ? fieldName : aliases[fieldName];
        const tsField = tsByLower[aliased.toLowerCase ()];
        if (tsField !== undefined) {
            goNameOfTs[tsFieldName (tsField)] = fieldName;
            matchedTs[tsFieldName (tsField)] = true;
        } else {
            const keep = KEEP_PORT_ONLY[goName];
            if (keep !== undefined && keep.indexOf (fieldName) >= 0 && learnedTypes[fieldName] !== undefined) {
                keptPortOnly.push (fieldName);
                notes.push ('=' + fieldName + ' (port-only, kept)');
                continue;
            }
            notes.push ('-' + fieldName + ' (absent from ' + type.name + ')');
        }
    }
    for (let i = 0; i < type.fields.length; i++) {
        const tsField = type.fields[i];
        if (goNameOfTs[tsFieldName (tsField)] === undefined) {
            goNameOfTs[tsFieldName (tsField)] = capitalize (tsFieldName (tsField));
        }
    }
    // resolve every field that survives
    const resolved: Record<string, ResolvedField> = {};
    const known: Record<string, boolean> = {};
    for (let i = 0; i < keptPortOnly.length; i++) {
        const fieldName = keptPortOnly[i];
        const keptExpr = learnedExprs[fieldName];
        resolved[fieldName] = { 'goName': fieldName, 'goType': learnedTypes[fieldName], 'expr': keptExpr === undefined ? '' : keptExpr, 'inStruct': true, 'inLiteral': keptExpr !== undefined };
        known[fieldName] = true;
    }
    for (let i = 0; i < type.fields.length; i++) {
        const tsField = type.fields[i];
        const tsName = tsFieldName (tsField);
        const fieldName = goNameOfTs[tsName];
        const learnedType = learnedTypes[fieldName];
        let goType = goTypeFor (ir, tsField);
        const override = TYPE_OVERRIDES[goName] === undefined ? undefined : TYPE_OVERRIDES[goName][fieldName];
        if (override !== undefined && learnedType === override) {
            goType = override; // documented port deviation — see TYPE_OVERRIDES
        } else if (override !== undefined) {
            notes.push ('!' + fieldName + ' (override ' + override + ' but Go holds ' + String (learnedType) + ', skipped)');
            continue;
        } else if (goType === undefined) {
            goType = learnedType;
        } else if (learnedType !== undefined && baseGoType (learnedType) === baseGoType (goType)) {
            // the port may hold the value behind a pointer, that is its own choice
            goType = learnedType;
        }
        if (goType === undefined) {
            notes.push ('!' + fieldName + ' (no Go type for `' + tsField.tsType + '`, skipped)');
            continue;
        }
        const isInfo = tsName === 'info';
        const learnedExpr = learnedExprs[fieldName];
        const typeChanged = learnedType !== undefined && learnedType !== goType;
        let expr: string | undefined = undefined;
        if (learnedExpr !== undefined && !PLAIN_ACCESSOR.test (learnedExpr)) {
            expr = learnedExpr; // hand-written (bespoke expression), keep it
        } else if (learnedExpr !== undefined && !typeChanged) {
            // the Go port is authoritative for the accessor width (TS can't tell int
            // from float), so a learned Safe*Typed accessor wins when the type is kept —
            // but its JSON key is rewritten from the TS source of truth
            expr = plainAccessorWithTsKey (learnedExpr, tsName);
        } else {
            // the type changed (drift fix) or there is no learned expression — the
            // accessor must be regenerated from the NEW type
            expr = defaultExpr (goType, tsName, accessor, isInfo, helpers);
            if (expr === undefined) {
                expr = learnedExpr;
            }
        }
        if (expr === undefined && hasCtor) {
            // the struct has a constructor but this field has no expression we can emit —
            // dropping it would lose data, so leave the whole field to the hand-written code
            notes.push ('!' + fieldName + ' (no constructor expression, skipped)');
            continue;
        }
        if (learnedType !== undefined && learnedType !== goType) {
            notes.push ('~' + fieldName + ' ' + learnedType + '->' + goType);
        } else if (learnedType === undefined) {
            notes.push ('+' + fieldName + ' ' + goType);
        }
        resolved[fieldName] = { 'goName': fieldName, 'goType': goType, 'expr': expr === undefined ? '' : expr, 'inStruct': true, 'inLiteral': expr !== undefined };
        known[fieldName] = true;
    }
    const tsOrder: string[] = [];
    for (let i = 0; i < type.fields.length; i++) {
        tsOrder.push (goNameOfTs[tsFieldName (type.fields[i])]);
    }
    const structExisting: string[] = [];
    for (let i = 0; i < struct.fields.length; i++) {
        if (known[struct.fields[i].name]) {
            structExisting.push (struct.fields[i].name);
        }
    }
    const structOrder = mergeOrder (structExisting, tsOrder, known);
    const structFields: ResolvedField[] = [];
    for (let i = 0; i < structOrder.length; i++) {
        structFields.push (resolved[structOrder[i]]);
    }
    const blocks: EmittedBlock[] = [ {
        'name': goName,
        'anchor': new RegExp ('^type ' + goName + ' struct \\{$'),
        'source': renderStruct (goName, structFields),
    } ];
    if (ctor !== undefined && ctor.parsable) {
        const literalExisting: string[] = [];
        for (let i = 0; i < ctor.entries.length; i++) {
            if (known[ctor.entries[i].key] && resolved[ctor.entries[i].key].inLiteral) {
                literalExisting.push (ctor.entries[i].key);
            }
        }
        const inLiteral: Record<string, boolean> = {};
        const literalKeys = Object.keys (resolved);
        for (let i = 0; i < literalKeys.length; i++) {
            inLiteral[literalKeys[i]] = resolved[literalKeys[i]].inLiteral;
        }
        const literalOrder = mergeOrder (literalExisting, tsOrder, inLiteral);
        const literalFields: ResolvedField[] = [];
        for (let i = 0; i < literalOrder.length; i++) {
            literalFields.push (resolved[literalOrder[i]]);
        }
        blocks.push ({
            'name': goName + ' constructor',
            'anchor': new RegExp ('^func New' + goName + '\\([^)]*\\) ' + goName + ' \\{$'),
            'source': renderCtor (ctor, literalFields),
        });
    } else if (ctor !== undefined) {
        notes.push ('(constructor of ' + goName + ' has no plain composite literal, left untouched)');
    }
    return { 'blocks': blocks, 'notes': notes };
}

function planDictionary (ir: TypesIR, goName: string, type: IRType, learned: LearnedFile): TypePlan {
    const notes: string[] = [];
    const struct = learned.structs[goName];
    if (struct === undefined || !struct.parsable) {
        return { 'blocks': [], 'notes': [] };
    }
    if (struct.fields.length !== 2) {
        // e.g. Balances, which carries extra hand-built projections
        return { 'blocks': [], 'notes': [] };
    }
    const value = type.valueType === undefined ? '' : type.valueType.trim ();
    let goValue: string | undefined = undefined;
    if (value.endsWith ('[]')) {
        const element = value.slice (0, -2);
        if (ir.byName[element] !== undefined) {
            goValue = '[]' + goTypeName (element);
        }
    } else if (ir.byName[value] !== undefined) {
        goValue = goTypeName (value);
    }
    if (goValue === undefined) {
        return { 'blocks': [], 'notes': [] };
    }
    const fields: ResolvedField[] = [];
    for (let i = 0; i < struct.fields.length; i++) {
        const field = struct.fields[i];
        let goType = field.type;
        // the wrapper is `{ Info map[string]any; <MapField> map[string]T }` — only the
        // second map (the one that is not `Info`) carries the dictionary value type
        if (field.name !== 'Info' && field.type.startsWith ('map[string]')) {
            goType = 'map[string]' + goValue;
            if (goType !== field.type) {
                notes.push ('~' + field.name + ' ' + field.type + '->' + goType);
            }
        }
        fields.push ({ 'goName': field.name, 'goType': goType, 'expr': '', 'inStruct': true, 'inLiteral': false });
    }
    return {
        'blocks': [ {
            'name': goName,
            'anchor': new RegExp ('^type ' + goName + ' struct \\{$'),
            'source': renderStruct (goName, fields),
        } ],
        'notes': notes,
    };
}

// ---------------------------------------------------------------------------------
// emitter entry point
// ---------------------------------------------------------------------------------

function emit (ir: TypesIR, repoRoot: string): EmitterOutput[] {
    const files: LearnedFile[] = [];
    for (let i = 0; i < TARGET_FILES.length; i++) {
        files.push (learnFile (repoRoot, TARGET_FILES[i]));
    }
    // every New*/helper the whole package provides, so generated expressions never
    // reference a constructor that does not exist
    const helpers: Record<string, boolean> = {};
    for (let i = 0; i < files.length; i++) {
        const found = files[i].text.match (/^func (New\w+)\(/gm);
        if (found !== null) {
            for (let j = 0; j < found.length; j++) {
                helpers[found[j].slice (5, -1)] = true;
            }
        }
    }
    const plans: Record<string, TypePlan> = {};
    for (let f = 0; f < files.length; f++) {
        plans[files[f].path] = { 'blocks': [], 'notes': [] };
    }
    for (let t = 0; t < ir.types.length; t++) {
        const type = ir.types[t];
        if (type.kind === 'generic' || type.kind === 'alias' || type.kind === 'tuple') {
            continue;
        }
        const goName = goTypeName (type.name);
        if (NOT_GENERATED[goName] !== undefined) {
            continue;
        }
        let owner: LearnedFile | undefined = undefined;
        for (let f = 0; f < files.length; f++) {
            if (files[f].structs[goName] !== undefined) {
                owner = files[f];
                break;
            }
        }
        if (owner === undefined) {
            continue; // no Go struct mirrors this TS type; adding one is a manual decision
        }
        const plan = type.kind === 'dictionary'
            ? planDictionary (ir, goName, type, owner)
            : planInterface (ir, goName, type, owner, helpers);
        const target = plans[owner.path];
        target.blocks = target.blocks.concat (plan.blocks);
        for (let n = 0; n < plan.notes.length; n++) {
            target.notes.push (goName + ' ' + plan.notes[n]);
        }
    }
    const outputs: EmitterOutput[] = [];
    for (let f = 0; f < files.length; f++) {
        const file = files[f];
        const plan = plans[file.path];
        const result: SpliceResult = spliceBlocks (file.text, plan.blocks, findBraceBlockEnd);
        const contents = ensureGeneratedBanner (result.text, '//');
        const changed = result.replaced.concat (result.appended);
        if (contents !== result.text) {
            changed.push ('banner');
        }
        outputs.push ({ 'path': file.path, 'contents': contents, 'changed': changed.concat (plan.notes) });
    }
    return outputs;
}

export default { 'id': 'go', 'emit': emit } as LanguageEmitter;
