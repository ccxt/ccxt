// JN-6 audit: 82 Java type classes vs ts/src/base/types.ts (source of truth).
// Replicates build/typeEmitters/java.ts decision logic (renderField) so we can name
// exactly which TS fields the emitter drops and why, and which Java types are weaker
// than the TS declaration (nullability / shape).
import fs from 'fs';
import path from 'path';
import { extractTypesIR, resolveScalar } from './build/typesIR.js';
import type { TypesIR, IRField } from './build/typesIR.js';

const TYPES_DIR = 'java/lib/src/main/java/io/github/ccxt/types';

// ---- copied verbatim from build/typeEmitters/java.ts (pure, no file IO) ----
function unquote (name: string): string {
    if ((name.startsWith ("'") && name.endsWith ("'")) || (name.startsWith ('"') && name.endsWith ('"'))) return name.slice (1, -1);
    return name;
}
function stripNullish (tsType: string): string {
    const parts = tsType.split ('|').map ((p) => p.trim ()).filter ((p) => p !== 'undefined' && p !== 'null');
    return parts.length === 1 ? parts[0] : parts.join (' | ');
}
function isStringUnion (tsType: string): boolean {
    const parts = stripNullish (tsType).split ('|').map ((p) => p.trim ());
    if (parts.length < 2) return false;
    return parts.every ((p) => p.startsWith ("'") || p === 'string' || p === 'Str');
}
function scalarFor (tsType: string, fieldName: string): { javaType: string } | undefined {
    const t = stripNullish (tsType);
    if (isStringUnion (t)) return { 'javaType': 'String' };
    if (t === 'Int' || t === 'int') return { 'javaType': 'Long' };
    if (t === 'Num') return { 'javaType': 'Double' };
    if (t === 'number') return { 'javaType': /timestamp$/i.test (fieldName) ? 'Long' : 'Double' };
    if (t === 'Str' || t === 'string' || t === 'OrderSide' || t === 'OrderType' || t === 'MarketType' || t === 'SubType') return { 'javaType': 'String' };
    if (t === 'Bool' || t === 'boolean') return { 'javaType': 'Boolean' };
    return undefined;
}
function classFor (ir: TypesIR, tsType: string): string | undefined {
    let current = stripNullish (tsType);
    for (let hops = 0; hops < 8; hops++) {
        const declaration = ir.byName[current];
        if (declaration === undefined) return undefined;
        if (declaration.kind === 'interface') return declaration.name;
        if (declaration.kind !== 'alias') return undefined;
        const members = declaration.unionMembers.filter ((m) => m !== 'undefined' && m !== 'null');
        if (members.length !== 1) return undefined;
        current = members[0];
    }
    return undefined;
}
function isNumericTuple (tsType: string): boolean {
    const t = tsType.trim ();
    if (!t.startsWith ('[') || !t.endsWith (']')) return false;
    return t.slice (1, -1).split (',').every ((p) => { const s = p.trim (); return s === 'Num' || s === 'number' || s === 'Int'; });
}
function arrayElement (field: IRField): string | undefined {
    const t = stripNullish (field.tsType).trim ();
    if (t.endsWith ('[]')) return t.slice (0, -2);
    return field.kind === 'array' ? field.elementType : undefined;
}

type Verdict = { javaType: string } | { drop: string };

/** Mirrors renderField(): what the emitter would declare for this TS field. */
function simulateRender (ir: TypesIR, field: IRField, javaName: string, existing: { name: string; javaType: string } | undefined): Verdict {
    const key = unquote (field.name);
    if (stripNullish (field.tsType) === 'any') return { 'javaType': 'Map<String, Object>' };
    if (field.kind === 'scalar' && resolveScalar (ir, stripNullish (field.tsType)) === 'Dictionary<any>') return { 'javaType': 'Map<String, Object>' };
    const scalar = scalarFor (field.tsType, key);
    if (scalar !== undefined) return { 'javaType': scalar.javaType };
    if (arrayElement (field) !== undefined) {
        const element = stripNullish (arrayElement (field) as string);
        if (isNumericTuple (element)) return { 'javaType': 'List<List<Double>>' };
        if (element === 'string' || element === 'Str') return { 'javaType': 'List<String>' };
        const elementClass = classFor (ir, element);
        if (elementClass !== undefined) return { 'javaType': 'List<' + elementClass + '>' };
        return { 'drop': 'array-of-unnameable (element "' + element + '" has no Java class)' };
    }
    if (field.kind === 'dict' && field.elementType !== undefined) {
        let elementClass = classFor (ir, field.elementType);
        if (elementClass === undefined && existing !== undefined) {
            const match = existing.javaType.match (/^Map<String, (.+)>$/);
            elementClass = match === null ? undefined : match[1];
        }
        if (elementClass === undefined || elementClass === 'Object') return { 'drop': 'Dictionary<unnameable> (value type "' + field.elementType + '")' };
        return { 'javaType': 'Map<String, ' + elementClass + '>' };
    }
    let objectClass = classFor (ir, field.tsType);
    if (objectClass === undefined && field.kind === 'inline' && existing !== undefined) objectClass = existing.javaType;
    if (objectClass === undefined) return { 'drop': 'unnameable object type "' + field.tsType + '" (' + field.kind + ')' };
    return { 'javaType': objectClass };
}

// ---- java side ----
interface JavaClass { name: string; fields: { name: string; javaType: string }[]; hasTypeHelperCtor: boolean; }
function readJava (dir: string): Record<string, JavaClass> {
    const out: Record<string, JavaClass> = {};
    for (const entry of fs.readdirSync (dir).sort ()) {
        if (!entry.endsWith ('.java')) continue;
        const name = entry.slice (0, -5);
        const text = fs.readFileSync (path.join (dir, entry), 'utf8');
        const lines = text.split ('\n');
        const fields: { name: string; javaType: string }[] = [];
        for (const line of lines) {
            const m = line.match (/^ {4}public (.+?);(.*)$/);
            if (m === null) continue;
            const decl = m[1];
            const sp = decl.lastIndexOf (' ');
            if (sp < 0) continue;
            fields.push ({ 'name': decl.slice (sp + 1), 'javaType': decl.slice (0, sp) });
        }
        out[name] = { 'name': name, 'fields': fields, 'hasTypeHelperCtor': text.indexOf ('TypeHelper.toMap(raw)') >= 0 };
    }
    return out;
}

const CLASS_TO_TS: Record<string, string> = { 'Fee': 'FeeInterface' };
const TS_TO_CLASS: Record<string, string> = { 'FeeInterface': 'Fee' };
const INLINE_SOURCES: Record<string, string[]> = { 'Limits': [ 'MarketInterface', 'limits' ], 'CurrencyLimits': [ 'CurrencyInterface', 'limits' ] };
const FIELD_RENAMES: Record<string, string> = { 'event': 'eventId' };
const JAVA_ONLY = [ 'Network', 'NetworkLimits', 'TypeHelper' ];
const BESPOKE = [ 'OrderBook', 'Balances' ]; // hand-written ctors, not regenerated

const ir = extractTypesIR (path.join ('ts', 'src', 'base', 'types.ts'));
const java = readJava (TYPES_DIR);

const missingFields: Record<string, string[]> = {};
const typeMismatch: string[] = [];
const primitives: string[] = [];
const notRendered: string[] = [];

for (const className of Object.keys (java).sort ()) {
    if (JAVA_ONLY.indexOf (className) >= 0) continue;
    const jc = java[className];
    const tsName = CLASS_TO_TS[className] !== undefined ? CLASS_TO_TS[className] : className;
    let fields: IRField[] | undefined;
    let source = tsName;
    if (INLINE_SOURCES[className] !== undefined) {
        const [ owner, member ] = INLINE_SOURCES[className];
        const ownerType = ir.byName[owner];
        fields = ownerType?.fields.filter ((f) => unquote (f.name) === member)[0]?.inlineFields;
        source = owner + '.' + member + ' (inline)';
    } else {
        const decl = ir.byName[tsName];
        if (decl !== undefined && BESPOKE.indexOf (className) < 0) {
            if (decl.kind === 'interface') fields = decl.fields;
            else if (decl.kind === 'dictionary') { notRendered.push (className + ': TS is Dictionary<' + decl.valueType + '> (collection wrapper, not a plain POJO)'); continue; }
            else if (decl.kind === 'tuple') { notRendered.push (className + ': TS is a tuple alias, rendered by renderTuple()'); continue; }
        }
    }
    if (fields === undefined) {
        notRendered.push (className + ': NO TS declaration (' + (ir.byName[tsName] === undefined ? 'absent from types.ts' : 'kind=' + ir.byName[tsName]?.kind) + ')');
        continue;
    }
    const javaNames = jc.fields.map ((f) => f.name);
    const missing: string[] = [];
    for (const field of fields) {
        const key = unquote (field.name);
        const javaName = FIELD_RENAMES[key] !== undefined ? FIELD_RENAMES[key] : key;
        const existing = jc.fields.filter ((f) => f.name === javaName)[0];
        const verdict = simulateRender (ir, field, javaName, existing);
        if ('drop' in verdict) {
            if (existing !== undefined) missing.push (javaName + ' [emitter drops it but field exists?!]');
            else missing.push (javaName + ' (' + verdict.drop + ')');
            continue;
        }
        if (existing === undefined) {
            missing.push (javaName + ' [emitter says ' + verdict.javaType + ' but file lacks it]');
            continue;
        }
        if (existing.javaType !== verdict.javaType) {
            typeMismatch.push (className + '.' + javaName + ': java=' + existing.javaType + ' emitter=' + verdict.javaType);
        }
        if (/^(long|double|boolean|int|float|short|byte|char)$/.test (existing.javaType) && (field.optional || /^(Num|Str|Bool|Int|number|string|boolean)$/.test (stripNullish (field.tsType)))) {
            primitives.push (className + '.' + javaName + ': primitive ' + existing.javaType + ' <- TS ' + field.tsType + (field.optional ? ' (optional)' : ''));
        }
    }
    for (const jf of jc.fields) {
        const tsField = fields.filter ((f) => (FIELD_RENAMES[unquote (f.name)] !== undefined ? FIELD_RENAMES[unquote (f.name)] : unquote (f.name)) === jf.name)[0];
        if (tsField === undefined) missing.push ('(java-only field) ' + jf.name + ': ' + jf.javaType);
    }
    if (missing.length > 0) missingFields[className] = missing;
}

if (process.argv.indexOf ('--dump') >= 0) {
    const want = process.argv[process.argv.indexOf ('--dump') + 1];
    for (const className of Object.keys (java).sort ()) {
        if (want !== undefined && className !== want) continue;
        const jc = java[className];
        const tsName = CLASS_TO_TS[className] !== undefined ? CLASS_TO_TS[className] : className;
        const decl = ir.byName[tsName];
        let tsFields: IRField[] | undefined = decl?.fields;
        if (INLINE_SOURCES[className] !== undefined) {
            const [ owner, member ] = INLINE_SOURCES[className];
            tsFields = ir.byName[owner]?.fields.filter ((f) => unquote (f.name) === member)[0]?.inlineFields;
        }
        console.log ('--- ' + className + ' (' + (tsName) + '): ts=' + (tsFields?.length ?? 'n/a') + ' java=' + jc.fields.length + ' ctor=' + (jc.hasTypeHelperCtor ? 'map' : 'BESPOKE'));
        if (tsFields !== undefined) {
            const javaNames = jc.fields.map ((f) => f.name);
            for (const f of tsFields) {
                const jn = FIELD_RENAMES[unquote (f.name)] !== undefined ? FIELD_RENAMES[unquote (f.name)] : unquote (f.name);
                const jf = jc.fields.filter ((x) => x.name === jn)[0];
                console.log ('      ' + (jf !== undefined ? 'OK ' : 'MISS') + ' ' + jn + '  ts=' + f.tsType + (f.optional ? '?' : '') + '  java=' + (jf?.javaType ?? '-'));
            }
            for (const jf of jc.fields) {
                const ts = tsFields.filter ((f) => (FIELD_RENAMES[unquote (f.name)] ?? unquote (f.name)) === jf.name)[0];
                if (ts === undefined) console.log ('      JAVA-ONLY ' + jf.name + '  java=' + jf.javaType);
            }
        }
    }
}

// ---- F. TS fields typed `any`/`Dict` (excluding info): a Map<String,Object> in front of
// a TS `any` that can hold a List silently yields null instead of the value ----
console.log ('\n=== F. TS `any` fields (excluding info) and the Java type declared for them ===');
for (const className of Object.keys (java).sort ()) {
    const jc = java[className];
    for (const jf of jc.fields) {
        if (jf.javaType !== 'Map<String, Object>') continue;
        const tsName = CLASS_TO_TS[className] !== undefined ? CLASS_TO_TS[className] : className;
        let fields: IRField[] | undefined = ir.byName[tsName]?.fields;
        if (INLINE_SOURCES[className] !== undefined) {
            const [ owner, member ] = INLINE_SOURCES[className];
            fields = ir.byName[owner]?.fields.filter ((f) => unquote (f.name) === member)[0]?.inlineFields;
        }
        const tsField = fields?.filter ((f) => (FIELD_RENAMES[unquote (f.name)] ?? unquote (f.name)) === jf.name)[0];
        if (tsField === undefined) continue;
        const ts = stripNullish (tsField.tsType);
        if (ts === 'any' && jf.name !== 'info') console.log ('  ' + className + '.' + jf.name + ': TS any  ->  java Map<String, Object> (list payload becomes null)');
        if (ts === 'Dict' || ts === 'NullableDict') console.log ('  ' + className + '.' + jf.name + ': TS Dict ->  java Map<String, Object> (ok: Dict is a map by definition)');
        if (ts !== 'any' && ts !== 'Dict' && ts !== 'NullableDict') console.log ('  ' + className + '.' + jf.name + ': TS ' + ts + ' -> java Map<String, Object>  [SHAPE LOSS?]');
    }
}

// ---- G. Dictionary wrapper element types vs the TS `extends Dictionary<T>` value type ----
console.log ('\n=== G. Dictionary wrappers: Java element type vs TS value type ===');
for (const t of ir.types) {
    if (t.kind !== 'dictionary' || t.valueType === undefined) continue;
    const className = TS_TO_CLASS[t.name] !== undefined ? TS_TO_CLASS[t.name] : t.name;
    const jc = java[className];
    if (jc === undefined) { console.log ('  ' + className + ': NO JAVA CLASS (TS Dictionary<' + t.valueType + '>)'); continue; }
    const mapField = jc.fields.filter ((f) => f.javaType.startsWith ('Map<String, '))[0];
    const expected = 'Map<String, ' + stripNullish (t.valueType).replace ('[]', '') + '>';
    const expectedList = stripNullish (t.valueType).endsWith ('[]') ? expected.replace ('Map<String, ' + stripNullish (t.valueType).replace ('[]', '') + '>', 'Map<String, List<' + stripNullish (t.valueType).replace ('[]', '') + '>>') : expected;
    const ok = mapField !== undefined && mapField.javaType === expectedList;
    console.log ('  ' + (ok ? 'OK   ' : 'CHECK') + ' ' + className + ': TS Dictionary<' + t.valueType + '> -> java ' + (mapField?.javaType ?? '(no map field)') + (ok ? '' : '  expected ' + expectedList));
}

// ---- H. every TS field whose named element/object type resolves to a class that does not
// exist on disk (latent `cannot find symbol` the moment such a field is added) ----
console.log ('\n=== H. TS field types resolving to a Java class that does not exist ===');
let hCount = 0;
for (const t of ir.types) {
    if (t.kind !== 'interface') continue;
    for (const f of t.fields) {
        const el = arrayElement (f) !== undefined ? stripNullish (arrayElement (f) as string) : undefined;
        const candidates: string[] = [];
        if (el !== undefined && !isNumericTuple (el) && el !== 'string' && el !== 'Str') candidates.push (el);
        if (f.kind === 'dict' && f.elementType !== undefined) {
            let v = f.elementType.replace ('[]', '');
            candidates.push (v);
        }
        if (f.kind === 'object' || (f.kind === 'inline')) candidates.push (stripNullish (f.tsType));
        for (const c of candidates) {
            const cls = classFor (ir, c);
            if (cls === undefined) continue;
            const javaCls = TS_TO_CLASS[cls] !== undefined ? TS_TO_CLASS[cls] : cls;
            if (java[javaCls] === undefined) {
                hCount += 1;
                console.log ('  ' + t.name + '.' + f.name + ': TS ' + f.tsType + ' -> missing Java class ' + javaCls);
            }
        }
    }
}
if (hCount === 0) console.log ('  (none)');

// ---- I. every TS field whose declared type is `any` (any-info or not) and its Java type ----
console.log ('\n=== I. TS `any` fields and their Java type ===');
for (const t of ir.types) {
    if (t.kind !== 'interface') continue;
    const className = TS_TO_CLASS[t.name] !== undefined ? TS_TO_CLASS[t.name] : t.name;
    const jc = java[className];
    for (const f of t.fields) {
        if (stripNullish (f.tsType) !== 'any') continue;
        const jn = FIELD_RENAMES[unquote (f.name)] ?? unquote (f.name);
        const jf = jc?.fields.filter ((x) => x.name === jn)[0];
        console.log ('  ' + className + '.' + jn + ' -> java ' + (jf?.javaType ?? '(class/field absent)'));
    }
}

// ---- J. fields the emitter can only render because the .java file already exists
// (a deleted-and-recreated class silently LOSES them) + TS interfaces with unrenderable fields ----
function isInlineField (f: IRField): boolean {
    return f.kind === 'inline' || (f.kind === 'dict' && f.elementType !== undefined && classFor (ir, f.elementType) === undefined)
        || (arrayElement (f) !== undefined && classFor (ir, stripNullish (arrayElement (f) as string)) === undefined && !isNumericTuple (stripNullish (arrayElement (f) as string)))
        || (f.kind === 'object' && classFor (ir, f.tsType) === undefined);
}
console.log ('\n=== J. fields that need the existing file to render (lost on recreate) ===');
for (const className of Object.keys (java).sort ()) {
    const jc = java[className];
    const tsName = CLASS_TO_TS[className] !== undefined ? CLASS_TO_TS[className] : className;
    let fields: IRField[] | undefined = ir.byName[tsName]?.fields;
    let where = tsName;
    if (INLINE_SOURCES[className] !== undefined) {
        const [ owner, member ] = INLINE_SOURCES[className];
        fields = ir.byName[owner]?.fields.filter ((f) => unquote (f.name) === member)[0]?.inlineFields;
        where = owner + '.' + member;
    }
    if (fields === undefined) continue;
    for (const f of fields) {
        const jn = FIELD_RENAMES[unquote (f.name)] ?? unquote (f.name);
        const present = jc.fields.some ((x) => x.name === jn);
        if (!present) continue;
        const noExisting = simulateRender (ir, f, jn, undefined);
        if ('drop' in noExisting) console.log ('  ' + className + '.' + jn + '  (TS ' + where + '.' + unquote (f.name) + '=' + f.tsType.replace (/\s+/g, ' ') + ')');
    }
}

// ---- K. TS interface fields that the emitter CANNOT render at all (as if a class were created) ----
console.log ('\n=== K. TS fields the emitter cannot render for a brand-new class ===');
let kCount = 0;
for (const t of ir.types) {
    if (t.kind !== 'interface') continue;
    const cls = TS_TO_CLASS[t.name] !== undefined ? TS_TO_CLASS[t.name] : t.name;
    const exists = java[cls] !== undefined;
    for (const f of t.fields) {
        const jn = FIELD_RENAMES[unquote (f.name)] ?? unquote (f.name);
        const verdict = simulateRender (ir, f, jn, undefined);
        if ('drop' in verdict) {
            kCount += 1;
            console.log ('  ' + (exists ? '[class exists] ' : '[NO class]     ') + t.name + '.' + unquote (f.name) + ': ' + f.tsType.replace (/\s+/g, ' ') + ' -> ' + verdict.drop);
        }
    }
}
if (kCount === 0) console.log ('  (none)');

console.log ('=== A. TS fields MISSING from Java classes (' + Object.keys (missingFields).length + ' classes) ===');
for (const c of Object.keys (missingFields)) {
    console.log ('  ' + c + ' [src ' + (INLINE_SOURCES[c] !== undefined ? 'inline' : CLASS_TO_TS[c] || c) + ']');
    for (const m of missingFields[c]) console.log ('      - ' + m);
}
console.log ('\n=== B. Java type != emitter output (should be empty) (' + typeMismatch.length + ') ===');
typeMismatch.forEach ((m) => console.log ('  ' + m));
console.log ('\n=== C. non-nullable primitive fields (' + primitives.length + ') ===');
primitives.forEach ((m) => console.log ('  ' + m));
console.log ('\n=== D. classes without a plain TS interface source (' + notRendered.length + ') ===');
notRendered.forEach ((m) => console.log ('  ' + m));

// ---- (c) TS exports with no Java class at all ----
const javaNames = new Set (Object.keys (java));
const absent: { name: string; kind: string; line: number }[] = [];
for (const t of ir.types) {
    if (t.kind !== 'interface' && t.kind !== 'dictionary' && t.kind !== 'tuple') continue;
    const cls = TS_TO_CLASS[t.name] !== undefined ? TS_TO_CLASS[t.name] : t.name;
    if (!javaNames.has (cls)) absent.push ({ 'name': t.name, 'kind': t.kind, 'line': t.line });
}
console.log ('\n=== E. TS declarations with NO Java class (' + absent.length + ') ===');
absent.forEach ((a) => console.log ('  ' + a.name + ' (' + a.kind + ', types.ts:' + a.line + ')'));
