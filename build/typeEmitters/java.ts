// Java base-type emitter: regenerates java/lib/src/main/java/io/github/ccxt/types/*.java
// from ts/src/base/types.ts (see build/transpileTypes.ts and PR #29502).
//
// Java is one-file-per-type, so unlike the C#/Go emitters this one rewrites whole files
// rather than splicing blocks out of a single dump. It is nevertheless a *reconciling*
// generator, not a blind renderer: everything that TypeScript actually decides
// (field set, field types, JSON keys, accessors, nested class references) comes from the
// IR, while everything that is a Java-port-local styling decision is recovered from the
// file that is already on disk so that regenerating produces zero cosmetic churn:
//
//   * field ORDER   - existing fields keep their current position; a field that is new in
//                     TS is inserted directly after its nearest preceding TS neighbour that
//                     already exists in the file (`info` is always kept last, which is the
//                     invariant every committed POJO already satisfies)
//   * trailing `//` comments on field lines, and comment lines between fields
//     (e.g. `// prediction-specific`), are preserved verbatim, column included
//   * the class-level leading comment block is preserved verbatim
//   * `@SuppressWarnings("unchecked")` on the constructor is preserved as-is
//     (PredictionFees / PredictionOutcome do not carry it today), and defaults to
//     present for a brand-new map-based type
//   * hand-written members after the constructor (PredictionOrderBook.parseEntries) are
//     preserved verbatim
//   * for fields whose TS type has no nameable declaration (an inline object literal, or
//     `Dictionary<any>`) the Java class the port already chose - `Limits`, `CurrencyLimits`,
//     `Map<String, Network>` - is kept, because TS carries no name to generate from
//   * the `extends Dictionary<T>` collection wrappers (Tickers, FundingRates, ...) keep their
//     hand-written wrapper bodies verbatim; only the element class is re-bound to the TS
//     value type, which is the one decision TS actually makes for them
//
// Files with no plain map constructor to generate (OrderBook, Balances), and the Java-only
// helper POJOs that have no TS declaration at all (Network, NetworkLimits), are left
// alone - see SKIPPED below.
//
// Brand-new files: the set of type names the Java port must declare is not "every TS export"
// (index-signature bags such as NestedDictionary / fetchEventsParams / ConstructorArgs are
// deliberately not modelled) but exactly KNOWN_TYPES in build/generateJavaWrappers.ts - that
// is the list the wrapper generator emits verbatim into the typed exchange overloads, so any
// name in it with no io.github.ccxt.types class is a guaranteed `cannot find symbol` at
// compile time (ADL / fetchADLRank did exactly that). Missing ones are therefore CREATED
// here from the TS interface, and a name that cannot be generated is a hard error rather
// than a silent skip, so the gap cannot reappear unnoticed.

import fs from 'fs';
import path from 'path';
import { TypesIR, IRType, IRField, ensureGeneratedBanner } from '../typesIR.js';
import { EmitterOutput, LanguageEmitter } from '../transpileTypes.js';

const TYPES_DIR = path.join ('java', 'lib', 'src', 'main', 'java', 'io', 'github', 'ccxt', 'types');

/** The typed-wrapper generator whose KNOWN_TYPES set decides which classes must exist. */
const WRAPPERS_FILE = path.join ('build', 'generateJavaWrappers.ts');

const INDENT = '    ';
const BODY = '        ';

/** Java class name -> the TS declaration it is generated from, where the two differ. */
const CLASS_TO_TS: Record<string, string> = {
    'Fee': 'FeeInterface',
};

/** TS declaration name -> the Java class that models it, where the two differ. */
const TS_TO_CLASS: Record<string, string> = {
    'FeeInterface': 'Fee',
};

/**
 * Java classes that model an inline object literal instead of a named TS interface.
 * The value is the [ owning TS interface, member ] whose literal supplies the members.
 * TS has no name for these, so the mapping cannot be derived - but the *members* still are.
 */
const INLINE_SOURCES: Record<string, string[]> = {
    'Limits': [ 'MarketInterface', 'limits' ],
    'CurrencyLimits': [ 'CurrencyInterface', 'limits' ],
};

/**
 * TS member name -> Java field name. `event` is spelled `eventId` across the prediction
 * POJOs (matching Go's `EventId` / the C# structs); the JSON key stays `event`.
 */
const FIELD_RENAMES: Record<string, string> = {
    'event': 'eventId',
};

/**
 * Types that are deliberately NOT generated, with the reason. Reported by the driver so the
 * skip list stays visible instead of silently shrinking coverage.
 */
const SKIPPED: Record<string, string> = {
    'OrderBook': 'bespoke constructor (unwraps io.github.ccxt.ws.WsOrderBook and guards null data) - no drift against TS',
    'Balances': 'bespoke constructor (flattens free/used/total sub-maps and the per-currency Balance rows)',
    'Network': 'no TS declaration (models an entry of CurrencyInterface.networks, typed Dictionary<any> in TS)',
    'NetworkLimits': 'no TS declaration (nested inside the Java-only Network POJO)',
};

interface ExistingField {
    name: string;
    javaType: string;
    /** everything after the `;`, i.e. the alignment spaces plus the `// ...` comment */
    commentSuffix: string;
    /** full comment lines sitting directly above this field */
    leading: string[];
}

interface ExistingFile {
    /** comment lines directly above `public final class X {` */
    classLeading: string[];
    fields: ExistingField[];
    fieldByName: Record<string, ExistingField>;
    ctorAnnotated: boolean;
    /** true when the constructor starts with `Map<String, Object> data = TypeHelper.toMap(raw);` */
    mapCtor: boolean;
    /** object-typed fields constructed via `data.containsKey(...)` rather than `TypeHelper.safeValue` */
    containsKeyStyle: Record<string, boolean>;
    /** hand-written members after the constructor, verbatim */
    tail: string[];
    text: string;
}

function readExisting (absolutePath: string, className: string): ExistingFile | undefined {
    if (!fs.existsSync (absolutePath)) {
        return undefined;
    }
    const text = fs.readFileSync (absolutePath, 'utf8');
    const lines = text.split ('\n');
    const classAnchor = 'public final class ' + className + ' {';
    let classLine = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === classAnchor) {
            classLine = i;
            break;
        }
    }
    if (classLine < 0) {
        return undefined;
    }
    const classLeading: string[] = [];
    for (let i = classLine - 1; i >= 0; i--) {
        if (lines[i].startsWith ('//')) {
            classLeading.unshift (lines[i]);
        } else {
            break;
        }
    }
    const ctorAnchor = new RegExp ('^' + INDENT + 'public ' + className + '\\(Object raw\\) \\{$');
    let ctorLine = -1;
    for (let i = classLine + 1; i < lines.length; i++) {
        if (ctorAnchor.test (lines[i])) {
            ctorLine = i;
            break;
        }
    }
    if (ctorLine < 0) {
        return undefined;
    }
    const ctorAnnotated = ctorLine > 0 && lines[ctorLine - 1] === INDENT + '@SuppressWarnings("unchecked")';
    const fields: ExistingField[] = [];
    const fieldByName: Record<string, ExistingField> = {};
    let pendingLeading: string[] = [];
    for (let i = classLine + 1; i < ctorLine; i++) {
        const line = lines[i];
        if (line.trim () === '' || line.trim ().startsWith ('@')) {
            continue;
        }
        if (line.trim ().startsWith ('//')) {
            pendingLeading.push (line);
            continue;
        }
        const match = line.match (/^ {4}public (.+);(.*)$/);
        if (match === null) {
            continue;
        }
        const declaration = match[1];
        const split = declaration.lastIndexOf (' ');
        const field: ExistingField = {
            'name': declaration.slice (split + 1),
            'javaType': declaration.slice (0, split),
            'commentSuffix': match[2],
            'leading': pendingLeading,
        };
        pendingLeading = [];
        fields.push (field);
        fieldByName[field.name] = field;
    }
    // constructor body -> style hints, then everything after it is hand-written
    let ctorEnd = -1;
    for (let i = ctorLine + 1; i < lines.length; i++) {
        if (lines[i] === INDENT + '}') {
            ctorEnd = i;
            break;
        }
    }
    const containsKeyStyle: Record<string, boolean> = {};
    const mapCtor = lines[ctorLine + 1] === BODY + 'Map<String, Object> data = TypeHelper.toMap(raw);';
    for (let i = ctorLine + 1; i < ctorEnd; i++) {
        const assign = lines[i].match (/^ {8}this\.([A-Za-z0-9_]+) = data\.containsKey\(/);
        if (assign !== null) {
            containsKeyStyle[assign[1]] = true;
        }
    }
    const tail: string[] = [];
    for (let i = ctorEnd + 1; i < lines.length; i++) {
        if (lines[i] === '}') {
            break;
        }
        tail.push (lines[i]);
    }
    while (tail.length > 0 && tail[0].trim () === '') {
        tail.shift ();
    }
    while (tail.length > 0 && tail[tail.length - 1].trim () === '') {
        tail.pop ();
    }
    return {
        'classLeading': classLeading,
        'fields': fields,
        'fieldByName': fieldByName,
        'ctorAnnotated': ctorAnnotated,
        'mapCtor': mapCtor,
        'containsKeyStyle': containsKeyStyle,
        'tail': tail,
        'text': text,
    };
}

function unquote (name: string): string {
    if ((name.startsWith ("'") && name.endsWith ("'")) || (name.startsWith ('"') && name.endsWith ('"'))) {
        return name.slice (1, -1);
    }
    return name;
}

function stripNullish (tsType: string): string {
    const parts = tsType.split ('|').map ((p) => p.trim ()).filter ((p) => p !== 'undefined' && p !== 'null');
    return parts.length === 1 ? parts[0] : parts.join (' | ');
}

/** Every member of the union is a string literal (or a string alias) -> the field is a plain string. */
function isStringUnion (tsType: string): boolean {
    const parts = stripNullish (tsType).split ('|').map ((p) => p.trim ());
    if (parts.length < 2) {
        return false;
    }
    return parts.every ((p) => p.startsWith ("'") || p === 'string' || p === 'Str');
}

interface Scalar { javaType: string; accessor: string }

/**
 * Scalar TS type -> (Java boxed type, TypeHelper accessor). `number` is ambiguous in TS -
 * the port spells epoch fields `Long`, so a bare `number` named `*[tT]imestamp` maps to Long
 * and everything else to Double (matches every committed FundingRate/OrderRequest field).
 */
function scalarFor (tsType: string, fieldName: string): Scalar | undefined {
    const t = stripNullish (tsType);
    if (isStringUnion (t)) {
        return { 'javaType': 'String', 'accessor': 'safeString' };
    }
    if (t === 'Int' || t === 'int') {
        return { 'javaType': 'Long', 'accessor': 'safeInteger' };
    }
    if (t === 'Num') {
        return { 'javaType': 'Double', 'accessor': 'safeFloat' };
    }
    if (t === 'number') {
        if (/timestamp$/i.test (fieldName)) {
            return { 'javaType': 'Long', 'accessor': 'safeInteger' };
        }
        return { 'javaType': 'Double', 'accessor': 'safeFloat' };
    }
    if (t === 'Str' || t === 'string' || t === 'OrderSide' || t === 'OrderType' || t === 'MarketType' || t === 'SubType') {
        return { 'javaType': 'String', 'accessor': 'safeString' };
    }
    if (t === 'Bool' || t === 'boolean') {
        return { 'javaType': 'Boolean', 'accessor': 'safeBool' };
    }
    return undefined;
}

/** Resolves a TS type name to the Java class that models it, following single-member alias unions. */
function classFor (ir: TypesIR, tsType: string): string | undefined {
    let current = stripNullish (tsType);
    for (let hops = 0; hops < 8; hops++) {
        const declaration = ir.byName[current];
        if (declaration === undefined) {
            return undefined;
        }
        if (declaration.kind === 'interface') {
            return TS_TO_CLASS[current] !== undefined ? TS_TO_CLASS[current] : current;
        }
        if (declaration.kind !== 'alias') {
            return undefined;
        }
        const members = declaration.unionMembers.filter ((m) => m !== 'undefined' && m !== 'null');
        if (members.length !== 1) {
            return undefined;
        }
        current = members[0];
    }
    return undefined;
}

/** `[Num, Num]`-style tuples of numbers back the order-book price levels. */
function isNumericTuple (tsType: string): boolean {
    const t = tsType.trim ();
    if (!t.startsWith ('[') || !t.endsWith (']')) {
        return false;
    }
    return t.slice (1, -1).split (',').every ((p) => {
        const s = p.trim ();
        return s === 'Num' || s === 'number' || s === 'Int';
    });
}

/**
 * The shared IR classifies `[Num, Num][]` as a tuple because the text both starts with `[`
 * and ends with `]`, so array-ness is re-derived here from the raw TS text. Returns the
 * element type text for any array, and undefined for everything else.
 */
function arrayElement (field: IRField): string | undefined {
    const t = stripNullish (field.tsType).trim ();
    if (t.endsWith ('[]')) {
        return t.slice (0, -2);
    }
    return field.kind === 'array' ? field.elementType : undefined;
}

interface Emitted { javaType: string; statements: string[]; needsCollectors: boolean }

function renderField (ir: TypesIR, field: IRField, javaName: string, existing: ExistingField | undefined, containsKey: boolean): Emitted | undefined {
    const key = unquote (field.name);
    const raw = javaName + 'Raw';
    // `info` is the raw exchange payload; every other `any` member is a passthrough param bag
    if (stripNullish (field.tsType) === 'any') {
        if (key === 'info') {
            return { 'javaType': 'Map<String, Object>', 'statements': [ BODY + 'this.info = TypeHelper.getInfo(data);' ], 'needsCollectors': false };
        }
        return {
            'javaType': 'Map<String, Object>',
            'statements': [
                BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
                BODY + 'this.' + javaName + ' = ' + raw + ' instanceof Map ? (Map<String, Object>) ' + raw + ' : null;',
            ],
            'needsCollectors': false,
        };
    }
    const scalar = scalarFor (field.tsType, key);
    if (scalar !== undefined) {
        return {
            'javaType': scalar.javaType,
            'statements': [ BODY + 'this.' + javaName + ' = TypeHelper.' + scalar.accessor + '(data, "' + key + '");' ],
            'needsCollectors': false,
        };
    }
    if (arrayElement (field) !== undefined) {
        const element = stripNullish (arrayElement (field) as string);
        if (isNumericTuple (element)) {
            return {
                'javaType': 'List<List<Double>>',
                'statements': [ BODY + 'this.' + javaName + ' = parseEntries(data.get("' + key + '"));' ],
                'needsCollectors': false,
            };
        }
        if (element === 'string' || element === 'Str') {
            return {
                'javaType': 'List<String>',
                'statements': [
                    BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
                    BODY + 'if (' + raw + ' instanceof List<?> ' + javaName + 'List) {',
                    BODY + INDENT + 'this.' + javaName + ' = ((List<Object>) ' + javaName + 'List).stream().filter(t -> t instanceof String).map(t -> (String) t).collect(Collectors.toList());',
                    BODY + '}',
                ],
                'needsCollectors': true,
            };
        }
        const elementClass = classFor (ir, element);
        if (elementClass !== undefined) {
            return {
                'javaType': 'List<' + elementClass + '>',
                'statements': [
                    BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
                    BODY + 'if (' + raw + ' instanceof List<?> ' + javaName + 'List) {',
                    BODY + INDENT + 'this.' + javaName + ' = ((List<Object>) ' + javaName + 'List).stream().map(' + elementClass + '::new).collect(Collectors.toList());',
                    BODY + '}',
                ],
                'needsCollectors': true,
            };
        }
        return undefined;
    }
    if (field.kind === 'dict' && field.elementType !== undefined) {
        // `Dictionary<any>` carries no element name in TS - keep the class the port already picked
        let elementClass = classFor (ir, field.elementType);
        if (elementClass === undefined && existing !== undefined) {
            const match = existing.javaType.match (/^Map<String, (.+)>$/);
            elementClass = match === null ? undefined : match[1];
        }
        if (elementClass === undefined || elementClass === 'Object') {
            return undefined;
        }
        return {
            'javaType': 'Map<String, ' + elementClass + '>',
            'statements': [
                BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
                BODY + 'if (' + raw + ' instanceof Map<?, ?> ' + javaName + 'Map) {',
                BODY + INDENT + 'this.' + javaName + ' = new LinkedHashMap<>();',
                BODY + INDENT + 'for (Map.Entry<String, Object> entry : ((Map<String, Object>) ' + javaName + 'Map).entrySet()) {',
                BODY + INDENT + INDENT + 'this.' + javaName + '.put(entry.getKey(), new ' + elementClass + '(entry.getValue()));',
                BODY + INDENT + '}',
                BODY + '}',
            ],
            'needsCollectors': false,
        };
    }
    // an object: either a named TS interface, or an inline literal the port already named
    let objectClass = classFor (ir, field.tsType);
    if (objectClass === undefined && field.kind === 'inline' && existing !== undefined) {
        objectClass = existing.javaType;
    }
    if (objectClass === undefined) {
        return undefined;
    }
    if (containsKey) {
        return {
            'javaType': objectClass,
            'statements': [ BODY + 'this.' + javaName + ' = data.containsKey("' + key + '") && data.get("' + key + '") != null ? new ' + objectClass + '(data.get("' + key + '")) : null;' ],
            'needsCollectors': false,
        };
    }
    return {
        'javaType': objectClass,
        'statements': [
            BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
            BODY + 'this.' + javaName + ' = ' + raw + ' != null ? new ' + objectClass + '(' + raw + ') : null;',
        ],
        'needsCollectors': false,
    };
}

/**
 * Orders the fields: everything already in the file keeps its position, and a field that is
 * new in TS lands directly after its nearest preceding TS neighbour that the file already has.
 */
function reconcileOrder (desired: string[], existing: string[]): string[] {
    const desiredSet: Record<string, boolean> = {};
    for (let i = 0; i < desired.length; i++) {
        desiredSet[desired[i]] = true;
    }
    const result = existing.filter ((name) => desiredSet[name] === true);
    for (let i = 0; i < desired.length; i++) {
        const name = desired[i];
        if (result.indexOf (name) >= 0) {
            continue;
        }
        let at = 0;
        for (let j = i - 1; j >= 0; j--) {
            const anchor = result.indexOf (desired[j]);
            if (anchor >= 0) {
                at = anchor + 1;
                break;
            }
        }
        result.splice (at, 0, name);
    }
    // `info` is always declared and assigned last in this port, even where TS declares it first
    const infoAt = result.indexOf ('info');
    if (infoAt >= 0 && infoAt !== result.length - 1) {
        result.splice (infoAt, 1);
        result.push ('info');
    }
    return result;
}

function computeImports (body: string): string[] {
    const needed: string[] = [];
    if (body.indexOf ('ArrayList') >= 0) {
        needed.push ('java.util.ArrayList');
    }
    if (body.indexOf ('LinkedHashMap') >= 0) {
        needed.push ('java.util.LinkedHashMap');
    }
    if (/\bList</.test (body)) {
        needed.push ('java.util.List');
    }
    if (/\bMap</.test (body) || body.indexOf ('Map.Entry') >= 0 || / instanceof Map\b/.test (body)) {
        needed.push ('java.util.Map');
    }
    if (body.indexOf ('NoSuchElementException') >= 0) {
        needed.push ('java.util.NoSuchElementException');
    }
    if (body.indexOf ('Collectors.') >= 0) {
        needed.push ('java.util.stream.Collectors');
    }
    needed.sort ();
    return needed;
}

/** Renders `export type OHLCV = [Num, Num, ...]`, whose element names come from its doc comment. */
function renderTuple (type: IRType, existing: ExistingFile | undefined): string | undefined {
    const doc = type.leadingComment.join (' ');
    const match = doc.match (/\[([^\]]+)\]/);
    if (match === null) {
        return undefined;
    }
    const names = match[1].split (',').map ((n) => n.trim ()).filter ((n) => n.length > 0);
    if (names.length !== type.tupleElements.length) {
        return undefined;
    }
    const fieldLines: string[] = [];
    const bodyLines: string[] = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const isTimestamp = /timestamp$/i.test (name);
        const javaType = isTimestamp ? 'Long' : 'Double';
        const accessor = isTimestamp ? 'safeIntegerAt' : 'safeFloatAt';
        const suffix = existing !== undefined && existing.fieldByName[name] !== undefined ? existing.fieldByName[name].commentSuffix : '';
        fieldLines.push (INDENT + 'public ' + javaType + ' ' + name + ';' + suffix);
        bodyLines.push (BODY + 'this.' + name + ' = TypeHelper.' + accessor + '(raw, ' + i.toString () + ');');
    }
    const out: string[] = [ 'package io.github.ccxt.types;', '' ];
    if (existing !== undefined && existing.classLeading.length > 0) {
        out.push (...existing.classLeading);
    }
    out.push ('public final class ' + type.name + ' {');
    out.push (...fieldLines);
    out.push ('');
    // index-based constructors perform no unchecked cast, so they carry no @SuppressWarnings
    out.push (INDENT + 'public ' + type.name + '(Object raw) {');
    out.push (...bodyLines);
    out.push (INDENT + '}');
    out.push ('}');
    return out.join ('\n') + '\n';
}

function renderInterface (ir: TypesIR, className: string, fields: IRField[], existing: ExistingFile | undefined): string | undefined {
    const rendered: Record<string, Emitted> = {};
    const javaNameOf: Record<string, string> = {};
    const desired: string[] = [];
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const key = unquote (field.name);
        const javaName = FIELD_RENAMES[key] !== undefined ? FIELD_RENAMES[key] : key;
        const existingField = existing === undefined ? undefined : existing.fieldByName[javaName];
        const containsKey = existing !== undefined && existing.containsKeyStyle[javaName] === true;
        const emitted = renderField (ir, field, javaName, existingField, containsKey);
        if (emitted === undefined) {
            // a shape this port does not model (e.g. an index signature); leave it out rather
            // than emit something that will not compile
            continue;
        }
        rendered[javaName] = emitted;
        javaNameOf[javaName] = key;
        desired.push (javaName);
    }
    const existingOrder = existing === undefined ? [] : existing.fields.map ((f) => f.name);
    const order = reconcileOrder (desired, existingOrder);
    const fieldLines: string[] = [];
    const bodyLines: string[] = [];
    for (let i = 0; i < order.length; i++) {
        const name = order[i];
        const emitted = rendered[name];
        const existingField = existing === undefined ? undefined : existing.fieldByName[name];
        if (existingField !== undefined) {
            fieldLines.push (...existingField.leading);
        }
        const suffix = existingField === undefined ? '' : existingField.commentSuffix;
        fieldLines.push (INDENT + 'public ' + emitted.javaType + ' ' + name + ';' + suffix);
        bodyLines.push (...emitted.statements);
    }
    const out: string[] = [ 'package io.github.ccxt.types;', '' ];
    const importSource = fieldLines.join ('\n') + '\n' + bodyLines.join ('\n') + '\n' + (existing === undefined ? '' : existing.tail.join ('\n')) + '\nMap<String, Object> data';
    const imports = computeImports (importSource);
    if (imports.length > 0) {
        for (let i = 0; i < imports.length; i++) {
            out.push ('import ' + imports[i] + ';');
        }
        out.push ('');
    }
    if (existing !== undefined && existing.classLeading.length > 0) {
        out.push (...existing.classLeading);
    }
    out.push ('public final class ' + className + ' {');
    out.push (...fieldLines);
    out.push ('');
    if (existing === undefined || existing.ctorAnnotated) {
        out.push (INDENT + '@SuppressWarnings("unchecked")');
    }
    out.push (INDENT + 'public ' + className + '(Object raw) {');
    out.push (BODY + 'Map<String, Object> data = TypeHelper.toMap(raw);');
    out.push (...bodyLines);
    out.push (INDENT + '}');
    if (existing !== undefined && existing.tail.length > 0) {
        out.push ('');
        out.push (...existing.tail);
    }
    out.push ('}');
    return out.join ('\n') + '\n';
}

/**
 * Map-field name inside a Dictionary wrapper class. Port-local (TS has no name); kept as an
 * explicit table so a missing file is recreated with the same public shape as before.
 */
const DICT_FIELD: Record<string, string> = {
    'Tickers': 'tickers',
    'PredictionTickers': 'tickers',
    'FundingRates': 'rates',
    'IsolatedBorrowRates': 'rates',
    'CrossBorrowRates': 'rates',
    'Currencies': 'currencies',
    'OrderBooks': 'orderBooks',
    'DepositWithdrawFees': 'fees',
    'TradingFees': 'fees',
    'OpenInterests': 'interests',
    'Leverages': 'leverages',
    'LastPrices': 'prices',
    'MarginModes': 'modes',
    'OptionChain': 'options',
    'LeverageTiers': 'tiers',
};

/** Wrappers that store a top-level `info` map and skip the `"info"` key when filling the bag. */
const DICT_HAS_INFO: Record<string, boolean> = {
    'Tickers': true,
    'PredictionTickers': true,
    'DepositWithdrawFees': true,
    'TradingFees': true,
};

/** Wrappers that skip `"info"` in the fill loop without exposing an `info` field (Currencies). */
const DICT_SKIP_INFO_KEY: Record<string, boolean> = {
    'Tickers': true,
    'PredictionTickers': true,
    'DepositWithdrawFees': true,
    'TradingFees': true,
    'Currencies': true,
};

/**
 * `export interface Tickers extends Dictionary<Ticker> {}` is modelled in Java by a bespoke
 * collection wrapper — a `Map<String, T>` field whose name (`rates` / `tickers` / `tiers` /
 * ...), its population loop and its throwing `get()` accessor are all port-local choices TS
 * knows nothing about. The one thing TS *does* decide is `T`, and that is exactly the drift
 * that bites (#29502: a stale element type silently yields null-filled rows). When the file
 * already exists the body is preserved and only the element class is re-bound; when it is
 * missing (e.g. `rm -f …/Tickers.java`) a full wrapper is written from DICT_FIELD / DICT_HAS_INFO.
 */
function renderDictionary (ir: TypesIR, className: string, valueType: string, existing: ExistingFile | undefined): string | undefined {
    let element = stripNullish (valueType).trim ();
    let elementIsList = false;
    if (element.endsWith ('[]')) {
        elementIsList = true;
        element = element.slice (0, -2);
    }
    const elementClass = classFor (ir, element);
    if (elementClass === undefined) {
        return undefined;
    }
    if (existing === undefined) {
        return renderNewDictionary (className, elementClass, elementIsList);
    }
    // the map field is the only Map<String, ...> that is not the raw `info` payload
    let current: string | undefined = undefined;
    for (let i = 0; i < existing.fields.length; i++) {
        const field = existing.fields[i];
        if (field.name === 'info') {
            continue;
        }
        const flat = field.javaType.match (/^Map<String, ([A-Za-z0-9_]+)>$/);
        const nested = field.javaType.match (/^Map<String, List<([A-Za-z0-9_]+)>>$/);
        if (flat !== null) {
            current = flat[1];
        } else if (nested !== null) {
            current = nested[1];
        }
    }
    if (current === undefined) {
        return undefined;
    }
    // a wrapper whose nesting no longer matches TS is a structural change, not a retype
    const nestedToday = existing.fields.some ((f) => /^Map<String, List<[A-Za-z0-9_]+>>$/.test (f.javaType));
    if (nestedToday !== elementIsList) {
        return undefined;
    }
    if (current === elementClass) {
        return existing.text;
    }
    return existing.text.replace (new RegExp ('\\b' + current + '\\b', 'g'), elementClass);
}

function renderNewDictionary (className: string, elementClass: string, elementIsList: boolean): string | undefined {
    const fieldName = DICT_FIELD[className];
    if (fieldName === undefined) {
        return undefined;
    }
    const mapValue = elementIsList ? ('List<' + elementClass + '>') : elementClass;
    const hasInfo = DICT_HAS_INFO[className] === true;
    const skipInfo = DICT_SKIP_INFO_KEY[className] === true;
    // match existing ports: list wrappers use the map field's first letter (`t` for tiers)
    const shortVar = elementIsList ? fieldName.charAt (0) : elementClass.charAt (0).toLowerCase ();
    const out: string[] = [ 'package io.github.ccxt.types;', '' ];
    out.push ('import java.util.LinkedHashMap;');
    if (elementIsList) {
        out.push ('import java.util.List;');
    }
    out.push ('import java.util.Map;');
    out.push ('import java.util.NoSuchElementException;');
    if (elementIsList) {
        out.push ('import java.util.stream.Collectors;');
    }
    out.push ('');
    out.push ('public final class ' + className + ' {');
    out.push (INDENT + 'public Map<String, ' + mapValue + '> ' + fieldName + ';');
    if (hasInfo) {
        out.push (INDENT + 'public Map<String, Object> info;');
    }
    out.push ('');
    out.push (INDENT + '@SuppressWarnings("unchecked")');
    out.push (INDENT + 'public ' + className + '(Object raw) {');
    out.push (BODY + 'Map<String, Object> data = TypeHelper.toMap(raw);');
    if (hasInfo) {
        out.push (BODY + 'this.info = TypeHelper.getInfo(data);');
    }
    out.push (BODY + 'this.' + fieldName + ' = new LinkedHashMap<>();');
    out.push (BODY + 'for (Map.Entry<String, Object> entry : data.entrySet()) {');
    if (elementIsList) {
        out.push (BODY + INDENT + 'if (entry.getValue() instanceof List<?> list) {');
        out.push (BODY + INDENT + INDENT + 'this.' + fieldName + '.put(entry.getKey(),');
        out.push (BODY + INDENT + INDENT + INDENT + '((List<Object>) list).stream().map(' + elementClass + '::new).collect(Collectors.toList()));');
        out.push (BODY + INDENT + '}');
    } else if (skipInfo) {
        out.push (BODY + INDENT + 'if (!"info".equals(entry.getKey())) {');
        out.push (BODY + INDENT + INDENT + 'this.' + fieldName + '.put(entry.getKey(), new ' + elementClass + '(entry.getValue()));');
        out.push (BODY + INDENT + '}');
    } else {
        out.push (BODY + INDENT + 'this.' + fieldName + '.put(entry.getKey(), new ' + elementClass + '(entry.getValue()));');
    }
    out.push (BODY + '}');
    out.push (INDENT + '}');
    out.push ('');
    out.push (INDENT + 'public ' + mapValue + ' get(String key) {');
    out.push (BODY + mapValue + ' ' + shortVar + ' = ' + fieldName + '.get(key);');
    out.push (BODY + 'if (' + shortVar + ' == null) throw new NoSuchElementException("Key not found: " + key);');
    out.push (BODY + 'return ' + shortVar + ';');
    out.push (INDENT + '}');
    out.push ('}');
    return out.join ('\n') + '\n';
}

/**
 * The class names the typed-wrapper generator will reference, read from KNOWN_TYPES in
 * build/generateJavaWrappers.ts. Those names go straight into the generated exchange
 * overloads (`public ADL fetchADLRank(...)`), so every one of them has to resolve to a class
 * in this package or `npm run buildJava` fails with `cannot find symbol`. Read from the
 * source rather than duplicated here so the two lists cannot drift apart.
 */
function requiredClasses (repoRoot: string): string[] {
    const absolute = path.join (repoRoot, WRAPPERS_FILE);
    if (!fs.existsSync (absolute)) {
        return [];
    }
    const text = fs.readFileSync (absolute, 'utf8');
    const match = text.match (/const KNOWN_TYPES = new Set\(\[([\s\S]*?)\]\)/);
    if (match === null) {
        return [];
    }
    const names = match[1].match (/'([A-Za-z0-9_]+)'/g);
    if (names === null) {
        return [];
    }
    return names.map ((n) => n.slice (1, -1));
}

function emit (ir: TypesIR, repoRoot: string): EmitterOutput[] {
    const directory = path.join (repoRoot, TYPES_DIR);
    if (!fs.existsSync (directory)) {
        return [];
    }
    const present: Record<string, boolean> = {};
    const entries = fs.readdirSync (directory);
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].endsWith ('.java')) {
            present[entries[i].slice (0, -5)] = true;
        }
    }
    const outputs: EmitterOutput[] = [];
    const required = requiredClasses (repoRoot);
    const classNames = Object.keys (present).sort ();
    for (let i = 0; i < required.length; i++) {
        const name = required[i];
        if (present[name] !== true && SKIPPED[name] === undefined) {
            classNames.push (name);
        }
    }
    // Dictionary wrappers (Tickers, FundingRates, ...) must be recreated even when the .java
    // file was deleted and the name is not in KNOWN_TYPES — they are first-class type ports.
    const dictNames = Object.keys (DICT_FIELD);
    for (let i = 0; i < dictNames.length; i++) {
        const name = dictNames[i];
        if (present[name] !== true && SKIPPED[name] === undefined && classNames.indexOf (name) < 0) {
            classNames.push (name);
        }
    }
    const inlineNames = Object.keys (INLINE_SOURCES);
    for (let i = 0; i < inlineNames.length; i++) {
        const name = inlineNames[i];
        if (present[name] !== true && SKIPPED[name] === undefined && classNames.indexOf (name) < 0) {
            classNames.push (name);
        }
    }
    classNames.sort ();
    const emitted: Record<string, boolean> = {};
    for (let i = 0; i < classNames.length; i++) {
        const className = classNames[i];
        if (className === 'TypeHelper' || SKIPPED[className] !== undefined) {
            continue;
        }
        const relative = path.join (TYPES_DIR, className + '.java');
        const absolute = path.join (repoRoot, relative);
        // a file that exists but does not parse is hand-written in a shape this emitter does
        // not model, and must never be replaced by a generated one
        const existing = readExisting (absolute, className);
        if (existing === undefined && present[className] === true) {
            continue;
        }
        const tsName = CLASS_TO_TS[className] !== undefined ? CLASS_TO_TS[className] : className;
        const declaration = ir.byName[tsName];
        let contents: string | undefined = undefined;
        if (declaration !== undefined && declaration.kind === 'tuple') {
            contents = renderTuple (declaration, existing);
        } else if (INLINE_SOURCES[className] !== undefined) {
            const source = INLINE_SOURCES[className];
            const owner = ir.byName[source[0]];
            const member = owner === undefined ? undefined : owner.fields.filter ((f) => unquote (f.name) === source[1])[0];
            if (member !== undefined && member.kind === 'inline') {
                contents = renderInterface (ir, className, member.inlineFields, existing);
            }
        } else if (declaration !== undefined && declaration.kind === 'interface') {
            if (existing !== undefined && !existing.mapCtor) {
                // no plain `TypeHelper.toMap(raw)` constructor to regenerate against
                continue;
            }
            contents = renderInterface (ir, className, declaration.fields, existing);
        } else if (declaration !== undefined && declaration.kind === 'dictionary' && declaration.valueType !== undefined) {
            contents = renderDictionary (ir, className, declaration.valueType, existing);
        }
        if (contents === undefined) {
            if (existing === undefined && required.indexOf (className) >= 0) {
                // the wrapper generator will emit this name into typed overloads regardless,
                // so failing to produce the class is a compile break, not a skip
                throw new Error ('java type emitter: cannot generate ' + relative + ' for KNOWN_TYPES entry "'
                    + className + '" - no usable ' + tsName + ' declaration in ' + path.join ('ts', 'src', 'base', 'types.ts')
                    + '. Add it to SKIPPED with a reason, or remove it from KNOWN_TYPES in ' + WRAPPERS_FILE + '.');
            }
            continue;
        }
        contents = ensureGeneratedBanner (contents, '//');
        emitted[className] = true;
        outputs.push ({
            'path': relative,
            'contents': contents,
            'changed': existing === undefined ? [ className + ' (new)' ] : (contents === existing.text ? [] : [ className ]),
        });
    }
    // Delete any .java under types/ that is not owned by types.ts (or the hand-written
    // keep list). Banner is not required — a stale file without a banner is still deleted
    // if it has no TS counterpart. TypeHelper + SKIPPED (OrderBook, Balances, Network*) stay.
    const allowed: Record<string, boolean> = { 'TypeHelper': true };
    for (let i = 0; i < Object.keys (SKIPPED).length; i++) {
        allowed[Object.keys (SKIPPED)[i]] = true;
    }
    for (let i = 0; i < Object.keys (INLINE_SOURCES).length; i++) {
        allowed[Object.keys (INLINE_SOURCES)[i]] = true;
    }
    for (let i = 0; i < Object.keys (DICT_FIELD).length; i++) {
        allowed[Object.keys (DICT_FIELD)[i]] = true;
    }
    for (let i = 0; i < required.length; i++) {
        allowed[required[i]] = true;
    }
    for (let i = 0; i < ir.types.length; i++) {
        const type = ir.types[i];
        if (type.kind !== 'interface' && type.kind !== 'tuple' && type.kind !== 'dictionary') {
            continue;
        }
        const className = TS_TO_CLASS[type.name] !== undefined ? TS_TO_CLASS[type.name] : type.name;
        allowed[className] = true;
    }
    for (let i = 0; i < Object.keys (emitted).length; i++) {
        allowed[Object.keys (emitted)[i]] = true;
    }
    for (let i = 0; i < entries.length; i++) {
        if (!entries[i].endsWith ('.java')) {
            continue;
        }
        const className = entries[i].slice (0, -5);
        if (allowed[className] === true) {
            continue;
        }
        outputs.push ({
            'path': path.join (TYPES_DIR, className + '.java'),
            'contents': '',
            'changed': [ className + ' (not in types.ts)' ],
            'delete': true,
        });
    }
    return outputs;
}

export default { 'id': 'java', 'emit': emit } as LanguageEmitter;
