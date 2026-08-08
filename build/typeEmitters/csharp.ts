// C# emitter for the base type structs.
//
// cs/ccxt/base/Exchange.Types.cs and cs/ccxt/base/PredictionTypes.cs are NOT pure
// generated dumps: they also carry hand-written support code (the `Helper` class, the
// C#-only `Network` / `NetworkLimits` structs). So this emitter produces one source
// block per struct and splices it over the existing declaration (see ./splice.ts);
// everything outside the anchors survives byte-for-byte.
//
// What comes from ts/src/base/types.ts (the source of truth, via the IR):
//   * the field set of every struct
//   * the C# declared type of every field (Int -> Int64?, Num -> double?, Str -> string?,
//     Bool -> bool?, X[] -> List<X>, ...)
//   * the Exchange.Safe* accessor used to read it (SafeInteger / SafeFloat / SafeString /
//     SafeBool ...) and the JSON key it reads
// This is exactly the class of bug PR #29502 had to fix by hand (wrong JSON keys, a
// double assignment, a misspelled field, double?+SafeFloat where the TS says Int).
//
// What comes from the LAYOUT table below: the public shape that already exists and must
// not break — per-struct ctor parameter names, the local `var x = (Dictionary<...>)x2;`
// binding, the declaration/assignment ORDER, blank lines, and the handful of per-struct
// idioms the file uses interchangeably (`o.ContainsKey("k") ? ... : null` vs
// `Exchange.SafeValue(o, "k") != null ? ... : null`). Encoding that here keeps
// regeneration a no-op against the current, already-corrected files, so any future diff
// is real drift against the TypeScript and nothing else.

import fs from 'fs';
import path from 'path';
import { TypesIR, IRField, ensureGeneratedBanner } from '../typesIR.js';
import { EmittedBlock, SpliceResult, spliceBlocks, findBraceBlockEnd } from './splice.js';

export interface EmitterOutput {
    path: string;
    contents: string;
    changed: string[];
}

export interface LanguageEmitter {
    id: string;
    emit: (ir: TypesIR, repoRoot: string) => EmitterOutput[];
}

// ---------------------------------------------------------------------------
// spec model
// ---------------------------------------------------------------------------

/** per-field escape hatch for the places C# deliberately differs from the TS */
export interface FieldOverride {
    /** JSON key to read, when it is not the TS field name */
    key?: string;
    /** C# declared type, when it is not the one implied by the TS type */
    type?: string;
    /** accessor idiom, when it is not the one implied by the TS type */
    idiom?: string;
    /** element struct for list fields */
    elem?: string;
    /** field is C#-only (no TS counterpart) — must then carry `type` and `idiom` */
    csOnly?: boolean;
    /** why this override exists (kept next to the data on purpose) */
    why?: string;
}

export interface WrapperSpec {
    /** the Dictionary<string, X> field name */
    map: string;
    /** X */
    elem: string;
    /** foreach variable */
    loop: string;
    /** name quoted in the KeyNotFoundException message */
    err: string;
    /** blank line after the `var x = (...)x2;` binding */
    gap?: boolean;
    /** the `// Indexer` comment above the indexer */
    idx?: boolean;
    /** the indexer has a setter */
    set?: boolean;
}

export interface StructSpec {
    /** C# struct name */
    n: string;
    /** repo-relative file the struct lives in */
    file: string;
    /** TS declaration name, or `Type.field` for an inline object type */
    ts?: string;
    kind?: 'struct' | 'wrapper' | 'tuple';
    /** for kind === 'tuple': the C# field name of each tuple element, in order */
    names?: string[];
    /** ctor parameter name */
    p: string;
    /** `var <b> = (<bc>)<p>;` binding */
    b?: string;
    bc?: string;
    /** receiver of the Safe* calls (defaults to the binding, else the parameter) */
    r?: string;
    /** default idiom for Bool fields */
    bool?: string;
    /** default idiom for nested-struct fields */
    obj?: string;
    /** default idiom for list fields */
    list?: string;
    /** declared C# type of the `info` field */
    info?: string;
    /** declaration layout: field name, '' for a blank line, '=literal' verbatim */
    d?: string[];
    /** ctor body layout, same token grammar */
    y?: string[];
    /** verbatim lines between the ctor and the closing brace */
    t?: string[];
    o?: Record<string, FieldOverride>;
    /** TS fields deliberately not surfaced in C# */
    skip?: string[];
    w?: WrapperSpec;
}

// TS field name -> C# field name. `base`/`internal`/`params` are C# keywords or clash,
// `event` clashes with the C# event keyword and is spelled `eventId` in the ports.
const FIELD_RENAMES: Record<string, string> = {
    'base': 'baseCurrency',
    'event': 'eventId',
    'internal': '@internal',
    'params': 'parameters',
};

// TS declaration name -> C# struct name for the types that were not named 1:1.
// Kept in sync with `csharpReplacements` in build/csharpTranspiler.ts, which maps the same
// two names for method signatures.
const TS_TO_CS: Record<string, string> = {
    'FeeInterface': 'Fee',
    'CurrencyInterface': 'Currency',
    'MarketInterface': 'MarketInterface',
};

// Inline TS object types (`limits: { amount?: MinMax, ... }`) have no TS name of their own,
// so the C# struct standing in for one is recorded by its path through types.ts. Paths that
// a struct is generated FROM are picked up automatically from the spec table (see
// inlineStructIndex); the entries below are the places where C# reuses a struct that was
// generated from a different path, and would otherwise need a per-field override.
const INLINE_STRUCT_EXTRAS: Record<string, string> = {
    // `{ amount?: MinMax, cost?: MinMax }` — a subset of MarketInterface.limits, so the C#
    // port reuses `Limits` instead of declaring a second, narrower struct.
    'PredictionMarket.limits': 'Limits',
    // `{ min?: Num, max?: Num }` — the MinMax shape, spelled inline inside CurrencyInterface.
    'CurrencyInterface.limits.amount': 'MinMax',
    'CurrencyInterface.limits.withdraw': 'MinMax',
};

const INDENT = '    ';

// ---------------------------------------------------------------------------
// TS type -> C# type / accessor
// ---------------------------------------------------------------------------

export type Resolved =
    { t: 'int' } | { t: 'num' } | { t: 'str' } | { t: 'bool' } | { t: 'any' } |
    { t: 'obj', name: string } | { t: 'list', elem: Resolved } | { t: 'dict', value: string } |
    { t: 'inline', path: string } |
    { t: 'tuple', elems: string[] } | { t: 'unknown', text: string };

const SCALARS: Record<string, Resolved> = {
    'Int': { 't': 'int' },
    'int': { 't': 'int' },
    'Num': { 't': 'num' },
    'number': { 't': 'num' },
    'Str': { 't': 'str' },
    'string': { 't': 'str' },
    'Bool': { 't': 'bool' },
    'boolean': { 't': 'bool' },
    'any': { 't': 'any' },
    'OrderSide': { 't': 'str' },
    'OrderType': { 't': 'str' },
    'MarketType': { 't': 'str' },
    'SubType': { 't': 'str' },
    'IndexType': { 't': 'str' },
    'Dict': { 't': 'dict', 'value': 'any' },
};

function stripNullish (text: string): string {
    const parts = text.split ('|').map ((p) => p.trim ()).filter ((p) => p !== 'undefined' && p !== 'null');
    return parts.join (' | ');
}

// ---------------------------------------------------------------------------
// inline TS object types -> the C# struct standing in for them
// ---------------------------------------------------------------------------

// filled by emit() before rendering (see below); 'Type.field[.field]' -> C# struct name
let INLINE_STRUCTS: Record<string, string> = {};

/** Index path for an inline object type, e.g. `MarketInterface.limits`. */
function inlinePath (owner: string, field: string): string {
    return owner + '.' + field;
}

/** C# struct that a nested inline member maps to, e.g. `CurrencyInterface.limits.amount` -> `MinMax`. */
function inlineStructFor (path: string): string | undefined {
    return INLINE_STRUCTS[path];
}

/** Resolves a TS type text down to the shape the C# mapping cares about. */
export function resolveTsType (ir: TypesIR, tsType: string, context?: { owner: string, field: string }): Resolved {
    let text = stripNullish (tsType.trim ());
    for (let guard = 0; guard < 16; guard++) {
        if (text.endsWith ('[]')) {
            return { 't': 'list', 'elem': resolveTsType (ir, text.slice (0, -2), context) };
        }
        if (text.startsWith ('[') && text.endsWith (']')) {
            return { 't': 'tuple', 'elems': text.slice (1, -1).split (',').map ((p) => p.trim ()) };
        }
        if (text.startsWith ('Dictionary<') && text.endsWith ('>')) {
            return { 't': 'dict', 'value': text.slice (11, -1) };
        }
        if (text.startsWith ('{')) {
            if (context !== undefined) {
                return { 't': 'inline', 'path': inlinePath (context.owner, context.field) };
            }
            return { 't': 'unknown', 'text': text };
        }
        if (SCALARS[text] !== undefined) {
            return SCALARS[text];
        }
        if (text.indexOf ('|') >= 0) {
            // a union of string literals with Str/string behaves as a string
            const members = text.split ('|').map ((p) => p.trim ());
            const stringy = members.every ((m) => m.startsWith ("'") || m === 'string' || m === 'Str');
            if (stringy) {
                return { 't': 'str' };
            }
            return { 't': 'unknown', 'text': text };
        }
        const decl = ir.byName[text];
        if (decl !== undefined && decl.kind === 'alias' && decl.aliasOf !== undefined) {
            const next = stripNullish (decl.aliasOf);
            if (next === text) {
                break;
            }
            text = next;
            continue;
        }
        if (decl !== undefined) {
            return { 't': 'obj', 'name': text };
        }
        return { 't': 'unknown', 'text': text };
    }
    return { 't': 'unknown', 'text': text };
}

function csStructName (tsName: string): string {
    return TS_TO_CS[tsName] !== undefined ? TS_TO_CS[tsName] : tsName;
}

/** The declared C# type for a resolved TS type. */
export function csTypeOf (spec: StructSpec, resolved: Resolved, csField?: string): string {
    if (resolved.t === 'int') {
        return 'Int64?';
    }
    if (resolved.t === 'num') {
        return 'double?';
    }
    if (resolved.t === 'str') {
        return 'string?';
    }
    if (resolved.t === 'bool') {
        return 'bool?';
    }
    if (resolved.t === 'any') {
        // `info: any` — the original decoded JSON — is the one `any` that is stored as a
        // dictionary in the C# port; other `any` payloads (e.g. request `params`) are object
        if (csField === 'info') {
            return spec.info !== undefined ? spec.info : 'Dictionary<string, object>';
        }
        return 'object';
    }
    if (resolved.t === 'obj') {
        return csStructName (resolved.name) + '?';
    }
    if (resolved.t === 'inline') {
        const named = inlineStructFor (resolved.path);
        return named !== undefined ? named + '?' : 'Dictionary<string, object>?';
    }
    if (resolved.t === 'dict') {
        const value = stripNullish (resolved.value);
        if (value !== 'any' && value !== '') {
            return 'Dictionary<string, ' + csStructName (value) + '>';
        }
        return 'Dictionary<string, object>?';
    }
    if (resolved.t === 'list') {
        if (resolved.elem.t === 'tuple') {
            return 'List<List<double>>?';
        }
        if (resolved.elem.t === 'str') {
            return 'List<string>?';
        }
        if (resolved.elem.t === 'obj') {
            return 'List<' + csStructName (resolved.elem.name) + '>?';
        }
        return 'List<object>?';
    }
    return 'object';
}

/** The default accessor idiom for a resolved TS type. */
export function idiomOf (spec: StructSpec, resolved: Resolved, csField?: string): string {
    if (resolved.t === 'int') {
        return 'int';
    }
    if (resolved.t === 'num') {
        return 'num';
    }
    if (resolved.t === 'str') {
        return 'str';
    }
    if (resolved.t === 'bool') {
        return spec.bool !== undefined ? spec.bool : 'safeBool';
    }
    if (resolved.t === 'any') {
        return csField === 'info' ? 'info' : 'raw';
    }
    if (resolved.t === 'obj') {
        return spec.obj !== undefined ? spec.obj : 'containsNew';
    }
    if (resolved.t === 'inline') {
        return spec.obj !== undefined ? spec.obj : 'containsNew';
    }
    if (resolved.t === 'dict') {
        return 'safeValueDict';
    }
    if (resolved.t === 'list') {
        if (resolved.elem.t === 'tuple') {
            return 'doubleList';
        }
        if (resolved.elem.t === 'str') {
            return 'stringList';
        }
        return spec.list !== undefined ? spec.list : 'containsSelectToList';
    }
    return 'raw';
}

/** Renders the right-hand side of a ctor assignment. */
export function csExprOf (idiom: string, recv: string, key: string, elem: string): string {
    const k = '"' + key + '"';
    if (idiom === 'int') {
        return 'Exchange.SafeInteger(' + recv + ', ' + k + ')';
    }
    if (idiom === 'num') {
        return 'Exchange.SafeFloat(' + recv + ', ' + k + ')';
    }
    if (idiom === 'str') {
        return 'Exchange.SafeString(' + recv + ', ' + k + ')';
    }
    if (idiom === 'info') {
        return 'Helper.GetInfo(' + recv + ')';
    }
    if (idiom === 'safeBool') {
        return 'Exchange.SafeBool(' + recv + ', ' + k + ')';
    }
    if (idiom === 'safeBoolFalse') {
        return 'Exchange.SafeBool(' + recv + ', ' + k + ', false)';
    }
    if (idiom === 'containsBool') {
        return recv + '.ContainsKey(' + k + ') && ' + recv + '[' + k + '] != null ? (bool)' + recv + '[' + k + '] : null';
    }
    if (idiom === 'safeValueBool') {
        return 'Exchange.SafeValue(' + recv + ', ' + k + ') != null ? (bool)Exchange.SafeValue(' + recv + ', ' + k + ') : null';
    }
    if (idiom === 'containsNew') {
        return recv + '.ContainsKey(' + k + ') ? new ' + elem + '(' + recv + '[' + k + ']) : null';
    }
    if (idiom === 'safeValueNew') {
        return 'Exchange.SafeValue(' + recv + ', ' + k + ') != null ? new ' + elem + '(Exchange.SafeValue(' + recv + ', ' + k + ')) : null';
    }
    if (idiom === 'asIDictNew') {
        const cast = '(' + recv + ' as IDictionary<string, object>)';
        return cast + '.ContainsKey(' + k + ') ? new ' + elem + '(' + cast + '[' + k + ']) : null';
    }
    if (idiom === 'containsSelect') {
        return recv + '.ContainsKey(' + k + ') ? ((IEnumerable<object>)' + recv + '[' + k + ']).Select(x => new ' + elem + '(x)) : null';
    }
    if (idiom === 'containsSelectToList') {
        return recv + '.ContainsKey(' + k + ') && ' + recv + '[' + k + '] != null ? ((IEnumerable<object>)' + recv + '[' + k + ']).Select(x => new ' + elem + '(x)).ToList() : null';
    }
    if (idiom === 'stringList') {
        return recv + '.ContainsKey(' + k + ') && ' + recv + '[' + k + '] != null ? ((IEnumerable<object>)' + recv + '[' + k + ']).Select(x => (string)x).ToList() : null';
    }
    if (idiom === 'doubleList') {
        return recv + '.ContainsKey(' + k + ') ? ((IEnumerable<object>)' + recv + '[' + k + ']).Select(x => ((IEnumerable<object>)x).Select(y => Convert.ToDouble(y)).ToList()).ToList() : null';
    }
    if (idiom === 'safeValueDict') {
        return 'Exchange.SafeValue(' + recv + ', ' + k + ') != null ? (Dictionary<string, object>)Exchange.SafeValue(' + recv + ', ' + k + ') : null';
    }
    if (idiom === 'intIndex') {
        return 'Exchange.SafeInteger(' + recv + ', ' + key + ')';
    }
    if (idiom === 'numIndex') {
        return 'Exchange.SafeFloat(' + recv + ', ' + key + ')';
    }
    throw new Error ('csharp emitter: unknown idiom ' + idiom);
}

// ---------------------------------------------------------------------------
// field resolution
// ---------------------------------------------------------------------------

export interface ResolvedField {
    /** C# field name */
    cs: string;
    /** declared C# type */
    type: string;
    /** JSON key read at runtime */
    key: string;
    idiom: string;
    /** element struct for list / nested-struct idioms */
    elem: string;
}

function unquote (name: string): string {
    if ((name.startsWith ("'") && name.endsWith ("'")) || (name.startsWith ('"') && name.endsWith ('"'))) {
        return name.slice (1, -1);
    }
    return name;
}

function irFieldsFor (ir: TypesIR, spec: StructSpec): IRField[] {
    if (spec.ts === undefined) {
        return [];
    }
    const dot = spec.ts.indexOf ('.');
    if (dot >= 0) {
        const owner = ir.byName[spec.ts.slice (0, dot)];
        if (owner === undefined) {
            throw new Error ('csharp emitter: no TS type ' + spec.ts);
        }
        const wanted = spec.ts.slice (dot + 1);
        for (let i = 0; i < owner.fields.length; i++) {
            if (unquote (owner.fields[i].name) === wanted) {
                return owner.fields[i].inlineFields;
            }
        }
        throw new Error ('csharp emitter: no TS field ' + spec.ts);
    }
    const decl = ir.byName[spec.ts];
    if (decl === undefined) {
        throw new Error ('csharp emitter: no TS type ' + spec.ts);
    }
    return decl.fields;
}

/** Builds the C#-name-keyed field table for a struct out of the IR plus its overrides. */
export function resolveFields (ir: TypesIR, spec: StructSpec): Record<string, ResolvedField> {
    const out: Record<string, ResolvedField> = {};
    if (spec.kind === 'tuple') {
        // OHLCV / OHLCVC are TS tuple aliases: the C# struct names the positions and reads
        // them by index, so the TS tuple element types still drive Int64?/double? here.
        const decl = spec.ts === undefined ? undefined : ir.byName[spec.ts];
        if (decl === undefined) {
            throw new Error ('csharp emitter: no TS type ' + spec.ts);
        }
        const names = spec.names === undefined ? [] : spec.names;
        for (let i = 0; i < names.length; i++) {
            const resolved = resolveTsType (ir, decl.tupleElements[i]);
            out[names[i]] = {
                'cs': names[i],
                'type': csTypeOf (spec, resolved),
                'key': i.toString (),
                'idiom': resolved.t === 'int' ? 'intIndex' : 'numIndex',
                'elem': '',
            };
        }
        return applyOverrides (spec, out);
    }
    const fields = irFieldsFor (ir, spec);
    const owner = spec.ts !== undefined ? spec.ts.split ('.')[0] : '';
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const tsName = unquote (field.name);
        const cs = FIELD_RENAMES[tsName] !== undefined ? FIELD_RENAMES[tsName] : tsName;
        const resolved = resolveTsType (ir, field.tsType, { 'owner': owner, 'field': tsName });
        let elem = '';
        if (resolved.t === 'obj') {
            elem = csStructName (resolved.name);
        } else if (resolved.t === 'list' && resolved.elem.t === 'obj') {
            elem = csStructName (resolved.elem.name);
        } else if (resolved.t === 'inline') {
            const named = inlineStructFor (resolved.path);
            elem = named !== undefined ? named : '';
        }
        const entry: ResolvedField = {
            'cs': cs,
            'type': csTypeOf (spec, resolved, cs),
            'key': tsName,
            'idiom': idiomOf (spec, resolved, cs),
            'elem': elem,
        };
        out[cs] = entry;
    }
    return applyOverrides (spec, out);
}

/** Applies the per-field escape hatches on top of what the IR derived. */
function applyOverrides (spec: StructSpec, out: Record<string, ResolvedField>): Record<string, ResolvedField> {
    const overrides = spec.o === undefined ? {} : spec.o;
    const names = Object.keys (overrides);
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const over = overrides[name];
        let entry = out[name];
        if (entry === undefined) {
            if (over.csOnly !== true) {
                throw new Error ('csharp emitter: ' + spec.n + '.' + name + ' has an override but no TS field');
            }
            entry = { 'cs': name, 'type': 'object', 'key': name, 'idiom': 'raw', 'elem': '' };
            out[name] = entry;
        }
        if (over.key !== undefined) {
            entry.key = over.key;
        }
        if (over.type !== undefined) {
            entry.type = over.type;
        }
        if (over.idiom !== undefined) {
            entry.idiom = over.idiom;
        }
        if (over.elem !== undefined) {
            entry.elem = over.elem;
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

function literal (token: string): string | undefined {
    return token.startsWith ('=') ? token.slice (1) : undefined;
}

function renderWrapper (ir: TypesIR, spec: StructSpec): string {
    const w = spec.w as WrapperSpec;
    // the element struct comes from `extends Dictionary<T>` in the TS
    let elem = w.elem;
    if (spec.ts !== undefined) {
        const decl = ir.byName[spec.ts];
        if (decl === undefined) {
            throw new Error ('csharp emitter: no TS type ' + spec.ts);
        }
        if (decl.valueType !== undefined) {
            elem = csStructName (decl.valueType);
        }
    }
    const bind = spec.b === undefined ? spec.p : spec.b;
    const cast = spec.bc === undefined ? 'Dictionary<string, object>' : spec.bc;
    const lines: string[] = [];
    lines.push ('public struct ' + spec.n);
    lines.push ('{');
    lines.push (INDENT + 'public ' + (spec.info === undefined ? 'Dictionary<string, object>' : spec.info) + ' info;');
    lines.push (INDENT + 'public Dictionary<string, ' + elem + '> ' + w.map + ';');
    lines.push ('');
    lines.push (INDENT + 'public ' + spec.n + '(object ' + spec.p + ')');
    lines.push (INDENT + '{');
    lines.push (INDENT.repeat (2) + 'var ' + bind + ' = (' + cast + ')' + spec.p + ';');
    if (w.gap !== false) {
        lines.push ('');
    }
    lines.push (INDENT.repeat (2) + 'info = Helper.GetInfo(' + bind + ');');
    lines.push (INDENT.repeat (2) + 'this.' + w.map + ' = new Dictionary<string, ' + elem + '>();');
    lines.push (INDENT.repeat (2) + 'foreach (var ' + w.loop + ' in ' + bind + ')');
    lines.push (INDENT.repeat (2) + '{');
    lines.push (INDENT.repeat (3) + 'if (' + w.loop + '.Key != "info")');
    lines.push (INDENT.repeat (4) + 'this.' + w.map + '.Add(' + w.loop + '.Key, new ' + elem + '(' + w.loop + '.Value));');
    lines.push (INDENT.repeat (2) + '}');
    lines.push (INDENT + '}');
    lines.push ('');
    if (w.idx !== false) {
        lines.push (INDENT + '// Indexer');
    }
    lines.push (INDENT + 'public ' + elem + ' this[string key]');
    lines.push (INDENT + '{');
    lines.push (INDENT.repeat (2) + 'get');
    lines.push (INDENT.repeat (2) + '{');
    lines.push (INDENT.repeat (3) + 'if (' + w.map + '.ContainsKey(key))');
    lines.push (INDENT.repeat (3) + '{');
    lines.push (INDENT.repeat (4) + 'return ' + w.map + '[key];');
    lines.push (INDENT.repeat (3) + '}');
    lines.push (INDENT.repeat (3) + 'else');
    lines.push (INDENT.repeat (3) + '{');
    lines.push (INDENT.repeat (4) + 'throw new KeyNotFoundException($"The key \'{key}\' was not found in the ' + w.err + '.");');
    lines.push (INDENT.repeat (3) + '}');
    lines.push (INDENT.repeat (2) + '}');
    if (w.set !== false) {
        lines.push (INDENT.repeat (2) + 'set');
        lines.push (INDENT.repeat (2) + '{');
        lines.push (INDENT.repeat (3) + w.map + '[key] = value;');
        lines.push (INDENT.repeat (2) + '}');
    }
    lines.push (INDENT + '}');
    lines.push ('}');
    return lines.join ('\n');
}

function renderStruct (ir: TypesIR, spec: StructSpec): string {
    if (spec.kind === 'wrapper') {
        return renderWrapper (ir, spec);
    }
    const fields = resolveFields (ir, spec);
    const recv = spec.r !== undefined ? spec.r : (spec.b !== undefined ? spec.b : spec.p);
    const lines: string[] = [];
    lines.push ('public struct ' + spec.n);
    lines.push ('{');
    const decl = spec.d === undefined ? [] : spec.d;
    for (let i = 0; i < decl.length; i++) {
        const lit = literal (decl[i]);
        if (lit !== undefined) {
            lines.push (lit);
            continue;
        }
        if (decl[i] === '') {
            lines.push ('');
            continue;
        }
        const field = fields[decl[i]];
        if (field === undefined) {
            throw new Error ('csharp emitter: ' + spec.n + ' declares unknown field ' + decl[i]);
        }
        lines.push (INDENT + 'public ' + field.type + ' ' + field.cs + ';');
    }
    lines.push (INDENT + 'public ' + spec.n + '(object ' + spec.p + ')');
    lines.push (INDENT + '{');
    if (spec.b !== undefined) {
        const cast = spec.bc === undefined ? 'Dictionary<string, object>' : spec.bc;
        lines.push (INDENT.repeat (2) + 'var ' + spec.b + ' = (' + cast + ')' + spec.p + ';');
    }
    const body = spec.y === undefined ? [] : spec.y;
    for (let i = 0; i < body.length; i++) {
        const lit = literal (body[i]);
        if (lit !== undefined) {
            lines.push (lit);
            continue;
        }
        if (body[i] === '') {
            lines.push ('');
            continue;
        }
        const field = fields[body[i]];
        if (field === undefined) {
            throw new Error ('csharp emitter: ' + spec.n + ' assigns unknown field ' + body[i]);
        }
        const lhs = (field.cs === spec.p || field.cs === spec.b) ? 'this.' + field.cs : field.cs;
        lines.push (INDENT.repeat (2) + lhs + ' = ' + csExprOf (field.idiom, recv, field.key, field.elem) + ';');
    }
    lines.push (INDENT + '}');
    const tail = spec.t === undefined ? [] : spec.t;
    for (let i = 0; i < tail.length; i++) {
        lines.push (tail[i]);
    }
    lines.push ('}');
    return lines.join ('\n');
}

/**
 * TS fields that no C# struct member covers. A field added to types.ts shows up here and
 * is appended to the struct, so the ports cannot silently fall behind the TS again.
 */
function missingFields (ir: TypesIR, spec: StructSpec): string[] {
    if (spec.ts === undefined || spec.kind === 'wrapper' || spec.kind === 'tuple') {
        return [];
    }
    const fields = irFieldsFor (ir, spec);
    const declared: Record<string, boolean> = {};
    const decl = spec.d === undefined ? [] : spec.d;
    for (let i = 0; i < decl.length; i++) {
        declared[decl[i]] = true;
    }
    const skip = spec.skip === undefined ? [] : spec.skip;
    const out: string[] = [];
    for (let i = 0; i < fields.length; i++) {
        const tsName = unquote (fields[i].name);
        const cs = FIELD_RENAMES[tsName] !== undefined ? FIELD_RENAMES[tsName] : tsName;
        if (declared[cs] === true || skip.indexOf (tsName) >= 0) {
            continue;
        }
        out.push (cs);
    }
    return out;
}

// ---------------------------------------------------------------------------
// the layout table
// ---------------------------------------------------------------------------

import { CSHARP_SPECS } from './csharpSpecs.js';

const FILES: string[] = [ 'cs/ccxt/base/Exchange.Types.cs', 'cs/ccxt/base/PredictionTypes.cs' ];

export function emit (ir: TypesIR, repoRoot: string): EmitterOutput[] {
    // map inline TS object types to the C# structs standing in for them: every spec whose
    // `ts` is a `Type.field` path generates that struct from the inline type, and
    // INLINE_STRUCT_EXTRAS records the places C# reuses such a struct for a different path.
    INLINE_STRUCTS = {};
    for (let i = 0; i < CSHARP_SPECS.length; i++) {
        const ts = CSHARP_SPECS[i].ts;
        if (ts !== undefined && ts.indexOf ('.') >= 0) {
            INLINE_STRUCTS[ts] = CSHARP_SPECS[i].n;
        }
    }
    const extraPaths = Object.keys (INLINE_STRUCT_EXTRAS);
    for (let i = 0; i < extraPaths.length; i++) {
        INLINE_STRUCTS[extraPaths[i]] = INLINE_STRUCT_EXTRAS[extraPaths[i]];
    }
    const outputs: EmitterOutput[] = [];
    for (let f = 0; f < FILES.length; f++) {
        const relative = FILES[f];
        const absolute = path.join (repoRoot, relative);
        const before = fs.readFileSync (absolute, 'utf8');
        const blocks: EmittedBlock[] = [];
        for (let s = 0; s < CSHARP_SPECS.length; s++) {
            const spec = CSHARP_SPECS[s];
            if (spec.file !== relative) {
                continue;
            }
            const extra = missingFields (ir, spec);
            const effective: StructSpec = extra.length === 0 ? spec : {
                ...spec,
                'd': (spec.d === undefined ? [] : spec.d).concat (extra),
                'y': (spec.y === undefined ? [] : spec.y).concat (extra),
            };
            blocks.push ({
                'name': spec.n,
                'anchor': new RegExp ('^public struct ' + spec.n + '$'),
                'source': renderStruct (ir, effective),
            });
        }
        const result: SpliceResult = spliceBlocks (before, blocks, findBraceBlockEnd);
        const contents = ensureGeneratedBanner (result.text, '//');
        const changed = result.replaced.concat (result.appended);
        if (contents !== result.text) {
            changed.push ('banner');
        }
        outputs.push ({ 'path': relative, 'contents': contents, 'changed': changed });
    }
    return outputs;
}

export default { 'id': 'csharp', 'emit': emit } as LanguageEmitter;
