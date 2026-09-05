// Extracts a language-neutral IR from ts/src/base/types.ts, the source of truth for
// the unified type shapes. Per-language emitters (build/typeEmitters/*.ts) turn this IR
// into the native type files that were previously hand-maintained and drifted silently
// (see PR #29502).
//
// "typescript6" is an npm alias for typescript@6 — the last release that ships the JS
// compiler API (typescript@7 is the native compiler and only provides the tsc binary)
import ts from 'typescript6';
import fs from 'fs';
import path from 'path';

export type IRFieldKind = 'scalar' | 'object' | 'array' | 'tuple' | 'dict' | 'inline';

export interface IRField {
    name: string;
    /** raw TS type text, e.g. "Num", "PredictionOutcome[]", "{ amount?: MinMax }" */
    tsType: string;
    /** `?:` in the interface — declared-optional */
    optional: boolean;
    /** trailing `// ...` comment on the field line, without the slashes */
    comment: string | undefined;
    kind: IRFieldKind;
    /** for array/tuple: element type text; for dict: value type text */
    elementType: string | undefined;
    /** for kind === 'inline': the nested fields of the object literal */
    inlineFields: IRField[];
}

export type IRTypeKind = 'interface' | 'dictionary' | 'alias' | 'tuple' | 'generic';

export interface IRType {
    name: string;
    kind: IRTypeKind;
    /** interface / dictionary members, in declaration order */
    fields: IRField[];
    /** for kind === 'dictionary': the T of `extends Dictionary<T>` */
    valueType: string | undefined;
    /** for kind === 'alias': the aliased type text */
    aliasOf: string | undefined;
    /** for kind === 'alias': union members when the alias is a union */
    unionMembers: string[];
    /** for kind === 'tuple': the element type texts */
    tupleElements: string[];
    /** leading block/line comments immediately above the declaration, raw lines */
    leadingComment: string[];
    /** 1-based line of the declaration in types.ts */
    line: number;
}

export interface TypesIR {
    /** every exported declaration, in source order */
    types: IRType[];
    /** name -> IRType */
    byName: Record<string, IRType>;
    sourcePath: string;
}

const SCALAR_ALIASES = [ 'Int', 'int', 'Str', 'Strings', 'Num', 'Bool', 'IndexType', 'NullableIndexType', 'OrderSide', 'OrderType', 'MarketType', 'SubType', 'Dict', 'NullableDict', 'List', 'NullableList', 'Fee', 'Market', 'Currency' ];

function stripUndefined (parts: string[]): string[] {
    return parts.filter ((p) => p !== 'undefined' && p !== 'null');
}

function classifyField (tsType: string): { kind: IRFieldKind, elementType: string | undefined } {
    const t = tsType.trim ();
    if (t.startsWith ('{')) {
        return { 'kind': 'inline', 'elementType': undefined };
    }
    if (t.startsWith ('[') && t.endsWith (']')) {
        return { 'kind': 'tuple', 'elementType': t.slice (1, -1) };
    }
    if (t.endsWith ('[][]')) {
        return { 'kind': 'array', 'elementType': t.slice (0, -4) + '[]' };
    }
    if (t.endsWith ('[]')) {
        return { 'kind': 'array', 'elementType': t.slice (0, -2) };
    }
    if (t.startsWith ('Dictionary<') && t.endsWith ('>')) {
        return { 'kind': 'dict', 'elementType': t.slice (11, -1) };
    }
    if (SCALAR_ALIASES.indexOf (t) >= 0 || t === 'string' || t === 'number' || t === 'boolean' || t === 'any') {
        return { 'kind': 'scalar', 'elementType': undefined };
    }
    // a union of string literals (e.g. 'buy' | 'sell' | Str) still behaves as a scalar
    if (t.indexOf ('|') >= 0) {
        return { 'kind': 'scalar', 'elementType': undefined };
    }
    return { 'kind': 'object', 'elementType': undefined };
}

function trailingComment (sourceText: string, node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
    const end = node.getEnd ();
    const lineEnd = sourceText.indexOf ('\n', end);
    const rest = sourceText.slice (end, lineEnd < 0 ? sourceText.length : lineEnd);
    const idx = rest.indexOf ('//');
    if (idx < 0) {
        return undefined;
    }
    return rest.slice (idx + 2).trim ();
}

function leadingComments (sourceText: string, node: ts.Node): string[] {
    const ranges = ts.getLeadingCommentRanges (sourceText, node.getFullStart ());
    if (ranges === undefined) {
        return [];
    }
    const out: string[] = [];
    for (let i = 0; i < ranges.length; i++) {
        const raw = sourceText.slice (ranges[i].pos, ranges[i].end);
        const lines = raw.split ('\n');
        for (let j = 0; j < lines.length; j++) {
            out.push (lines[j].replace (/^\s*\/\/ ?/, '').replace (/^\s*\/\*+ ?/, '').replace (/\s*\*+\/\s*$/, '').replace (/^\s*\* ?/, ''));
        }
    }
    return out;
}

function parseMembers (node: ts.InterfaceDeclaration | ts.TypeLiteralNode, sourceText: string, sourceFile: ts.SourceFile): IRField[] {
    const fields: IRField[] = [];
    for (let i = 0; i < node.members.length; i++) {
        const member = node.members[i];
        if (!ts.isPropertySignature (member) || member.name === undefined) {
            continue;
        }
        const name = member.name.getText (sourceFile);
        const tsType = member.type === undefined ? 'any' : member.type.getText (sourceFile);
        const classified = classifyField (tsType);
        let inlineFields: IRField[] = [];
        if (classified.kind === 'inline' && member.type !== undefined && ts.isTypeLiteralNode (member.type)) {
            inlineFields = parseMembers (member.type, sourceText, sourceFile);
        }
        fields.push ({
            'name': name,
            'tsType': tsType,
            'optional': member.questionToken !== undefined,
            'comment': trailingComment (sourceText, member, sourceFile),
            'kind': classified.kind,
            'elementType': classified.elementType,
            'inlineFields': inlineFields,
        });
    }
    return fields;
}

export function extractTypesIR (typesPath: string): TypesIR {
    const sourceText = fs.readFileSync (typesPath, 'utf8');
    const sourceFile = ts.createSourceFile (typesPath, sourceText, ts.ScriptTarget.Latest, true);
    const types: IRType[] = [];
    const statements = sourceFile.statements;
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        const isExported = statement.modifiers !== undefined && statement.modifiers.some ((m: any) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!isExported) {
            continue;
        }
        const line = sourceFile.getLineAndCharacterOfPosition (statement.getStart (sourceFile)).line + 1;
        const leading = leadingComments (sourceText, statement);
        if (ts.isInterfaceDeclaration (statement)) {
            const name = statement.name.getText (sourceFile);
            const heritage = statement.heritageClauses;
            let valueType: string | undefined = undefined;
            if (heritage !== undefined) {
                for (let h = 0; h < heritage.length; h++) {
                    const typesOfClause = heritage[h].types;
                    for (let t = 0; t < typesOfClause.length; t++) {
                        const text = typesOfClause[t].getText (sourceFile);
                        if (text.startsWith ('Dictionary<')) {
                            valueType = text.slice (11, -1);
                        }
                    }
                }
            }
            const isGeneric = statement.typeParameters !== undefined && statement.typeParameters.length > 0;
            types.push ({
                'name': name,
                'kind': isGeneric ? 'generic' : (valueType !== undefined ? 'dictionary' : 'interface'),
                'fields': parseMembers (statement, sourceText, sourceFile),
                'valueType': valueType,
                'aliasOf': undefined,
                'unionMembers': [],
                'tupleElements': [],
                'leadingComment': leading,
                'line': line,
            });
        } else if (ts.isTypeAliasDeclaration (statement)) {
            const name = statement.name.getText (sourceFile);
            const aliasText = statement.type.getText (sourceFile);
            let unionMembers: string[] = [];
            let tupleElements: string[] = [];
            let kind: IRTypeKind = 'alias';
            if (ts.isUnionTypeNode (statement.type)) {
                unionMembers = statement.type.types.map ((t) => t.getText (sourceFile));
            } else if (ts.isTupleTypeNode (statement.type)) {
                kind = 'tuple';
                tupleElements = statement.type.elements.map ((t) => t.getText (sourceFile));
            }
            types.push ({
                'name': name,
                'kind': kind,
                'fields': [],
                'valueType': undefined,
                'aliasOf': aliasText,
                'unionMembers': unionMembers,
                'tupleElements': tupleElements,
                'leadingComment': leading,
                'line': line,
            });
        }
    }
    const byName: Record<string, IRType> = {};
    for (let i = 0; i < types.length; i++) {
        byName[types[i].name] = types[i];
    }
    return { 'types': types, 'byName': byName, 'sourcePath': typesPath };
}

/** Resolves a TS type name through alias chains down to a scalar kind the emitters share. */
export function resolveScalar (ir: TypesIR, tsType: string): string {
    const seen: Record<string, boolean> = {};
    let current = tsType.trim ();
    while (ir.byName[current] !== undefined && ir.byName[current].kind === 'alias' && seen[current] === undefined) {
        seen[current] = true;
        const alias = ir.byName[current];
        const members = stripUndefined (alias.unionMembers);
        if (members.length === 1) {
            current = members[0];
        } else if (members.length > 1) {
            // a union of string literals collapses to string
            const allStringLiterals = members.every ((m) => m.startsWith ("'") || m === 'string');
            return allStringLiterals ? 'string' : current;
        } else {
            current = alias.aliasOf === undefined ? current : alias.aliasOf;
        }
    }
    return current;
}

export const DEFAULT_TYPES_PATH = path.join ('ts', 'src', 'base', 'types.ts');

// House-style generated-file banner (matches build/transpile.ts / *Transpiler.ts).
// Always emitted as lines 1–2 of the file (blank line after).
const GENERATED_BANNER_MARKER = 'PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:';
const GENERATED_BANNER_URL = 'https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code';

export function formatGeneratedBanner (commentPrefix: '//' | '#'): string {
    return commentPrefix + ' ' + GENERATED_BANNER_MARKER + '\n'
        + commentPrefix + ' ' + GENERATED_BANNER_URL + '\n';
}

/** Strip an existing house-style banner (anywhere) so it can be re-placed at line 1. */
function stripGeneratedBanner (text: string, commentPrefix: '//' | '#'): string {
    const line1 = commentPrefix + ' ' + GENERATED_BANNER_MARKER;
    const line2 = commentPrefix + ' ' + GENERATED_BANNER_URL;
    const lines = text.split ('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === line1 && i + 1 < lines.length && lines[i + 1] === line2) {
            i += 1;
            if (i + 1 < lines.length && lines[i + 1] === '') {
                i += 1;
            }
            continue;
        }
        out.push (lines[i]);
    }
    while (out.length > 0 && out[0] === '') {
        out.shift ();
    }
    return out.join ('\n');
}

/**
 * Ensure the house-style generated banner is lines 1–2. Idempotent: strips any prior
 * copy first (so a mid-file banner from an earlier placement moves to the top).
 */
export function ensureGeneratedBanner (text: string, commentPrefix: '//' | '#'): string {
    const body = stripGeneratedBanner (text, commentPrefix);
    const banner = formatGeneratedBanner (commentPrefix);
    return banner + '\n' + body;
}

export default extractTypesIR;
