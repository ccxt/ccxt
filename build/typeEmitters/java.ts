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
import { TypesIR, IRType, IRField, resolveScalar, ensureGeneratedBanner } from '../typesIR.js';
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
 * Members the unified runtime populates but ts/src/base/types.ts does not declare. The
 * reconciling emitter keeps only IR-named fields (see reconcileOrder), so without an entry
 * here the member could never be added, and one already in a file would be dropped. The C#
 * port models the same members as `csOnly` entries in build/typeEmitters/csharpSpecs.ts.
 *
 *   * `fees` — safeOrder()/safeTrade() ALWAYS set a `fees` list next to the single `fee`
 *     (`addElementToObject(order, "fees", reducedFees)` / `... (trade, "fees", resultFees)`
 *     in BaseExchange.java; parsedFeeAndFees returns an empty list when neither is defined).
 *     TS declares no field, so a typed POJO would silently drop the data at the boundary.
 *   * `orderId` — kraken attaches the raw venue order id to the unified trade as `orderId`
 *     next to the unified `order` (ts/src/kraken.ts); the C# Trade struct ships it too.
 */
interface ExtraField {
    name: string;
    javaType: string;
    /** emitted field this member follows, in both declaration and constructor order */
    after: string;
    /** comment lines emitted verbatim above the declaration */
    leading: string[];
    /** constructor statements, with BODY/INDENT already applied */
    statements: string[];
}

const FEES_STATEMENTS: string[] = [
    BODY + 'Object feesRaw = TypeHelper.safeValue(data, "fees");',
    BODY + 'if (feesRaw instanceof List<?> feesList) {',
    BODY + INDENT + 'this.fees = ((List<Object>) feesList).stream().map(Fee::new).collect(Collectors.toList());',
    BODY + '}',
];

const EXTRA_FIELDS: Record<string, ExtraField[]> = {
    'Trade': [
        {
            'name': 'fees',
            'javaType': 'List<Fee>',
            'after': 'fee',
            'leading': [ INDENT + '// safeTrade() always sets a `fees` list alongside the single `fee`; TS declares no field for it.' ],
            'statements': FEES_STATEMENTS,
        },
        {
            'name': 'orderId',
            'javaType': 'String',
            'after': 'order',
            'leading': [ INDENT + '// kraken puts the raw venue order id on the unified trade as `orderId` next to `order`.' ],
            'statements': [ BODY + 'this.orderId = TypeHelper.safeString(data, "orderId");' ],
        },
    ],
    'Order': [
        {
            'name': 'fees',
            'javaType': 'List<Fee>',
            'after': 'fee',
            'leading': [ INDENT + '// safeOrder() always sets a `fees` list alongside the single `fee`; TS declares no field for it.' ],
            'statements': FEES_STATEMENTS,
        },
    ],
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
    const mapCtor = lines[ctorLine + 1] === BODY + 'Map<String, Object> data = TypeHelper.toMap(raw);';
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

/**
 * Classes whose constructor legitimately accepts a raw value that is NOT a map
 * (`OHLCV` is built from the `[timestamp, o, h, l, c, v]` list tuple, `OrderBook`
 * also unwraps io.github.ccxt.ws.WsOrderBook), so a nested value of one of these
 * types must not be gated behind an `instanceof Map` check.
 */
const NON_MAP_RAW_CLASSES: Record<string, boolean> = {
    'OHLCV': true,
    'OrderBook': true,
};

/**
 * A nested value is only turned into a nominal type when it really is a map; anything
 * else (a string, a list, a number) stays `null`, which is what the TS side sees for a
 * payload of the wrong shape. Blind-casting makes the constructor throw
 * ClassCastException where TS simply yields undefined.
 */
function nestedCtorExpr (className: string, raw: string): string {
    if (NON_MAP_RAW_CLASSES[className] === true) {
        return raw + ' != null ? new ' + className + '(' + raw + ') : null';
    }
    return raw + ' instanceof Map<?, ?> ? new ' + className + '(' + raw + ') : null';
}

interface Emitted { javaType: string; statements: string[]; needsCollectors: boolean }

/** A field this port cannot model at all. Carries the reason so the driver can report it. */
interface Unrenderable { drop: string }

/**
 * The honest untyped map, for fields whose TS type is `any` / an anonymous object literal /
 * `Dictionary<any>` and whose payload is therefore arbitrary decoded JSON. Never widened into a
 * class the payload may not be (that would fabricate), never narrowed to a shape it may not have
 * (`params` carries a LIST on the batch-order paths — see the `omit` contract — so it is declared
 * `Object` above instead).
 */
function untypedMapField (javaName: string, key: string): Emitted {
    const raw = javaName + 'Raw';
    return {
        'javaType': 'Map<String, Object>',
        'statements': [
            BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
            BODY + 'this.' + javaName + ' = ' + raw + ' instanceof Map ? (Map<String, Object>) ' + raw + ' : null;',
        ],
        'needsCollectors': false,
    };
}

function renderField (ir: TypesIR, field: IRField, javaName: string, existing: ExistingField | undefined, containsKey: boolean): Emitted | Unrenderable | undefined {
    const key = unquote (field.name);
    const raw = javaName + 'Raw';
    // `info` is the raw exchange payload; every other `any` member is a passthrough param bag
    if (stripNullish (field.tsType) === 'any') {
        if (key === 'info') {
            return { 'javaType': 'Map<String, Object>', 'statements': [ BODY + 'this.info = TypeHelper.getInfo(data);' ], 'needsCollectors': false };
        }
        // TS says `any`, and the same key carries a LIST on the batch-order paths: a
        // Map<String, Object> declaration here would silently null that payload.
        return {
            'javaType': 'Object',
            'statements': [ BODY + 'this.' + javaName + ' = TypeHelper.safeValue(data, "' + key + '");' ],
            'needsCollectors': false,
        };
    }
    // `Dict` / `NullableDict` (= Dictionary<any>) is a free-form bag with no declared value
    // type — the plain map, same as a non-info `any`. Only the aliases: a literal
    // `Dictionary<any>` (CurrencyInterface.networks) keeps the class the port picked below.
    if (field.kind === 'scalar' && resolveScalar (ir, stripNullish (field.tsType)) === 'Dictionary<any>') {
        return untypedMapField (javaName, key);
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
                'statements': [ BODY + 'this.' + javaName + ' = parseEntries(data == null ? null : data.get("' + key + '"));' ],
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
                    BODY + INDENT + 'this.' + javaName + ' = ((List<Object>) ' + javaName + 'List).stream().map(e -> e instanceof Map<?, ?> ? new ' + elementClass + '(e) : null).collect(Collectors.toList());',
                    BODY + '}',
                ],
                'needsCollectors': true,
            };
        }
        return { 'drop': 'array whose element type "' + element + '" has no Java class' };
    }
    if (field.kind === 'dict' && field.elementType !== undefined) {
        // `Dictionary<any>` carries no element name in TS - keep the class the port already picked
        let elementClass = classFor (ir, field.elementType);
        if (elementClass === undefined && existing !== undefined) {
            // a plain identifier only: `new List<X>(value)` would not compile
            const match = existing.javaType.match (/^Map<String, ([A-Za-z0-9_]+)>$/);
            elementClass = match === null ? undefined : match[1];
        }
        if (elementClass === undefined || elementClass === 'Object') {
            // no nameable element type and nothing usable on disk to recover one from: the bag
            // holds arbitrary decoded JSON, so keep the plain map. Returning undefined here would
            // silently DROP a member TS declares (and delete it from a file that has one).
            return untypedMapField (javaName, key);
        }
        return {
            'javaType': 'Map<String, ' + elementClass + '>',
            'statements': [
                BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
                BODY + 'if (' + raw + ' instanceof Map<?, ?> ' + javaName + 'Map) {',
                BODY + INDENT + 'this.' + javaName + ' = new LinkedHashMap<>();',
                BODY + INDENT + 'for (Map.Entry<String, Object> entry : ((Map<String, Object>) ' + javaName + 'Map).entrySet()) {',
                BODY + INDENT + INDENT + 'this.' + javaName + '.put(entry.getKey(), entry.getValue() instanceof Map<?, ?> ? new ' + elementClass + '(entry.getValue()) : null);',
                BODY + INDENT + '}',
                BODY + '}',
            ],
            'needsCollectors': false,
        };
    }
    // an object: either a named TS interface, or an inline literal the port already named
    let objectClass = classFor (ir, field.tsType);
    let recoveredFromFile = false;
    if (objectClass === undefined && field.kind === 'inline' && existing !== undefined) {
        objectClass = existing.javaType;
        recoveredFromFile = true;
    }
    if (objectClass === undefined) {
        // TS declares an anonymous object literal and no committed file names a Java class for it
        // (a fresh generation, or the file was deleted): keep the honest untyped map. Returning
        // undefined here would silently DROP a member TS declares, along with its payload - the
        // exact drift this generator exists to prevent.
        return untypedMapField (javaName, key);
    }
    if (recoveredFromFile && objectClass.indexOf ('Map<') === 0) {
        // a committed map-typed member (looked up from the file, not nameable in TS): the
        // class-style constructor below would emit `new Map<String, X>(raw)` and not compile
        return untypedMapField (javaName, key);
    }
    // Historically a handful of files built these fields with `data.containsKey(...)`; that is
    // now folded into the uniform `safeValue + instanceof Map` path below, which also treats an
    // empty-string value as absent and never blind-casts a non-map (a `new MinMax("")` used to
    // throw ClassCastException).
    return {
        'javaType': objectClass,
        'statements': [
            BODY + 'Object ' + raw + ' = TypeHelper.safeValue(data, "' + key + '");',
            BODY + 'this.' + javaName + ' = ' + nestedCtorExpr (objectClass, raw) + ';',
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
    const dropped: string[] = [];
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const key = unquote (field.name);
        const javaName = FIELD_RENAMES[key] !== undefined ? FIELD_RENAMES[key] : key;
        const existingField = existing === undefined ? undefined : existing.fieldByName[javaName];
        const containsKey = existing !== undefined && existing.containsKeyStyle[javaName] === true;
        const emitted = renderField (ir, field, javaName, existingField, containsKey);
        if (emitted === undefined || 'drop' in emitted) {
            // report it: a field TS declares that this port cannot model must not vanish silently
            dropped.push (key + ' (' + (emitted === undefined ? 'unhandled TS type' : emitted.drop) + ')');
            continue;
        }
        rendered[javaName] = emitted;
        javaNameOf[javaName] = key;
        desired.push (javaName);
    }
    if (dropped.length > 0) {
        console.log ('  WARN    ' + path.join (TYPES_DIR, className + '.java') + ': ' + dropped.length.toString () + ' TS field(s) not modelled: ' + dropped.join ('; '));
    }
    const existingOrder = existing === undefined ? [] : existing.fields.map ((f) => f.name);
    const order = reconcileOrder (desired, existingOrder);
    // Java-only members (EXTRA_FIELDS) sit directly after their anchor field; an anchor the
    // IR no longer emits means this port does not model the shape, so the member is skipped
    // with it rather than emitted as an orphan declaration/assignment pair.
    const extras = EXTRA_FIELDS[className] === undefined ? [] : EXTRA_FIELDS[className];
    const renderedExtras: Record<string, ExtraField> = {};
    for (let i = 0; i < extras.length; i++) {
        const extra = extras[i];
        if (order.indexOf (extra.after) < 0) {
            continue;
        }
        const at = order.indexOf (extra.name);
        if (at >= 0) {
            order.splice (at, 1);
        }
        order.splice (order.indexOf (extra.after) + 1, 0, extra.name);
        renderedExtras[extra.name] = extra;
    }
    const fieldLines: string[] = [];
    const bodyLines: string[] = [];
    for (let i = 0; i < order.length; i++) {
        const name = order[i];
        const extra = renderedExtras[name];
        const emitted: Emitted | undefined = extra === undefined ? rendered[name] : { 'javaType': extra.javaType, 'statements': extra.statements, 'needsCollectors': false };
        if (emitted === undefined) {
            continue;
        }
        const existingField = existing === undefined ? undefined : existing.fieldByName[name];
        if (extra !== undefined) {
            fieldLines.push (...extra.leading);
        } else if (existingField !== undefined) {
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
    'AllGreeks': 'greeks',
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
    'AllGreeks': true,
};

/** Wrappers that skip `"info"` in the fill loop without exposing an `info` field (Currencies). */
const DICT_SKIP_INFO_KEY: Record<string, boolean> = {
    'Tickers': true,
    'PredictionTickers': true,
    'DepositWithdrawFees': true,
    'TradingFees': true,
    'Currencies': true,
    'AllGreeks': true,
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
        // One-time in-place upgrade: wrappers written before the null-safe guards (`data == null`
        // early return, `instanceof Map` element gate) get their constructor patched. Doing this
        // textually rather than re-rendering the body keeps every port-local detail intact (the map
        // field's name where it is not in DICT_FIELD — DepositAddresses, AllGreeks —, whether
        // `info` is populated, the get() local name, the class-level comment block).
        if (existing.text.indexOf ('if (data == null)') >= 0 && existing.text.indexOf ('instanceof Map<?, ?>') >= 0) {
            return existing.text;
        }
        const upgraded = guardDictionaryCtor (className, existing);
        return upgraded === undefined ? existing.text : upgraded;
    }
    return existing.text.replace (new RegExp ('\\b' + current + '\\b', 'g'), elementClass);
}

/**
 * Inserts `if (data == null) { return; }` immediately before the fill loop and gates every element
 * construction behind `instanceof Map<?, ?>` (a wrong-shaped value keeps its key with a null
 * element instead of throwing ClassCastException). Returns undefined when the body does not match
 * the expected wrapper shape, in which case the file is left untouched.
 */
function guardDictionaryCtor (className: string, existing: ExistingFile): string | undefined {
    const startAnchor = INDENT + 'public ' + className + '(Object raw) {\n';
    const at = existing.text.indexOf (startAnchor);
    const bodyStart = at < 0 ? -1 : at + startAnchor.length;
    const end = bodyStart < 0 ? -1 : existing.text.indexOf ('\n' + INDENT + '}', bodyStart);
    const loopAnchor = BODY + 'for (Map.Entry<String, Object> entry : data.entrySet()) {';
    const loopAt = end < 0 ? -1 : existing.text.indexOf (loopAnchor, bodyStart);
    if (at < 0 || end < 0 || loopAt < 0) {
        return undefined;
    }
    const guard = BODY + 'if (data == null) {\n' + BODY + INDENT + 'return;\n' + BODY + '}\n';
    const patched = existing.text.slice (loopAt, end)
        .replace (/new ([A-Z][A-Za-z0-9_]*)\(entry\.getValue\(\)\)/g, 'entry.getValue() instanceof Map<?, ?> ? new $1(entry.getValue()) : null')
        .replace (/\.map\(([A-Z][A-Za-z0-9_]*)::new\)/g, '.map(e -> e instanceof Map<?, ?> ? new $1(e) : null)');
    return existing.text.slice (0, loopAt) + guard + patched + existing.text.slice (end);
}

/**
 * Constructor lines (anchor through closing brace) of a `extends Dictionary<T>` wrapper. Shared
 * by the full-file renderer and the in-place upgrade path so the two can never drift apart.
 */
function dictionaryCtorLines (className: string, elementClass: string, elementIsList: boolean): string[] {
    const fieldName = DICT_FIELD[className];
    const hasInfo = DICT_HAS_INFO[className] === true;
    const skipInfo = DICT_SKIP_INFO_KEY[className] === true;
    const lines: string[] = [];
    lines.push (INDENT + '@SuppressWarnings("unchecked")');
    lines.push (INDENT + 'public ' + className + '(Object raw) {');
    lines.push (BODY + 'Map<String, Object> data = TypeHelper.toMap(raw);');
    if (hasInfo) {
        lines.push (BODY + 'this.info = TypeHelper.getInfo(data);');
    }
    lines.push (BODY + 'this.' + fieldName + ' = new LinkedHashMap<>();');
    lines.push (BODY + 'if (data == null) {');
    lines.push (BODY + INDENT + 'return;');
    lines.push (BODY + '}');
    lines.push (BODY + 'for (Map.Entry<String, Object> entry : data.entrySet()) {');
    if (elementIsList) {
        lines.push (BODY + INDENT + 'if (entry.getValue() instanceof List<?> list) {');
        lines.push (BODY + INDENT + INDENT + 'this.' + fieldName + '.put(entry.getKey(),');
        lines.push (BODY + INDENT + INDENT + INDENT + '((List<Object>) list).stream().map(e -> e instanceof Map<?, ?> ? new ' + elementClass + '(e) : null).collect(Collectors.toList()));');
        lines.push (BODY + INDENT + '}');
    } else if (skipInfo) {
        lines.push (BODY + INDENT + 'if (!"info".equals(entry.getKey())) {');
        lines.push (BODY + INDENT + INDENT + 'this.' + fieldName + '.put(entry.getKey(), entry.getValue() instanceof Map<?, ?> ? new ' + elementClass + '(entry.getValue()) : null);');
        lines.push (BODY + INDENT + '}');
    } else {
        lines.push (BODY + INDENT + 'this.' + fieldName + '.put(entry.getKey(), entry.getValue() instanceof Map<?, ?> ? new ' + elementClass + '(entry.getValue()) : null);');
    }
    lines.push (BODY + '}');
    lines.push (INDENT + '}');
    return lines;
}

function renderNewDictionary (className: string, elementClass: string, elementIsList: boolean): string | undefined {
    const fieldName = DICT_FIELD[className];
    if (fieldName === undefined) {
        return undefined;
    }
    const mapValue = elementIsList ? ('List<' + elementClass + '>') : elementClass;
    const hasInfo = DICT_HAS_INFO[className] === true;
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
    out.push ('public final class ' + className + ' implements Iterable<' + mapValue + '> {');
    out.push (INDENT + 'public Map<String, ' + mapValue + '> ' + fieldName + ';');
    if (hasInfo) {
        out.push (INDENT + 'public Map<String, Object> info;');
    }
    out.push ('');
    out.push (...dictionaryCtorLines (className, elementClass, elementIsList));
    out.push ('');
    out.push (INDENT + 'public ' + mapValue + ' get(String key) {');
    out.push (BODY + mapValue + ' ' + shortVar + ' = ' + fieldName + '.get(key);');
    out.push (BODY + 'if (' + shortVar + ' == null) throw new NoSuchElementException("Key not found: " + key);');
    out.push (BODY + 'return ' + shortVar + ';');
    out.push (INDENT + '}');
    out.push ('');
    out.push (INDENT + '/**');
    out.push (INDENT + ' * Nullable counterpart of get(), for the keys an exchange simply does');
    out.push (INDENT + ' * not report — a missing symbol is routine here, not an error.');
    out.push (INDENT + ' */');
    out.push (INDENT + 'public ' + mapValue + ' getOrNull(String key) {');
    out.push (BODY + 'return ' + fieldName + '.get(key);');
    out.push (INDENT + '}');
    out.push ('');
    out.push (INDENT + '/** Number of entries the exchange reported. */');
    out.push (INDENT + 'public int size() {');
    out.push (BODY + 'return ' + fieldName + '.size();');
    out.push (INDENT + '}');
    out.push ('');
    out.push (INDENT + 'public boolean isEmpty() {');
    out.push (BODY + 'return ' + fieldName + '.isEmpty();');
    out.push (INDENT + '}');
    out.push ('');
    out.push (INDENT + '/**');
    out.push (INDENT + ' * Typed iteration over the values, in the order the exchange reported');
    out.push (INDENT + ' * them: for (' + mapValue + ' x : this) { ... }');
    out.push (INDENT + ' */');
    out.push (INDENT + '@Override');
    out.push (INDENT + 'public java.util.Iterator<' + mapValue + '> iterator() {');
    out.push (BODY + 'return this.' + fieldName + '.values().iterator();');
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
