// ---------------------------------------------------------------------------
// One-shot migration: replace the string return-type tag on every api leaf with
// a real TypeScript type asserted onto that leaf.
//
//     'klines': { 'cost': 1, 'returnType': 'List' },
// becomes
//     'klines': { 'cost': 1 } as EndpointSpec<List>,
//
// and the file's `import type { ... } from './base/types.js'` gains EndpointSpec
// (plus whichever of Dict / List the assertions now name).
//
//     npx tsx build/migrateReturnTypesToNative.ts [--dry]
// ---------------------------------------------------------------------------

import ts from 'typescript6';
import fs from 'fs';
import path from 'path';

const HTTP_METHODS = [ 'get', 'post', 'put', 'delete', 'patch' ];
const NAMED_TYPES = [ 'Dict', 'List' ];

type Edit = { 'start': number; 'end': number; 'text': string };

function keyText (node: ts.PropertyAssignment): string {
    const name = node.name;
    if (ts.isStringLiteral (name) || ts.isNumericLiteral (name) || ts.isIdentifier (name)) {
        return name.text;
    }
    return '';
}

function hasHttpMethodKey (node: ts.ObjectLiteralExpression): boolean {
    for (const property of node.properties) {
        if (!ts.isPropertyAssignment (property)) {
            continue;
        }
        if (HTTP_METHODS.includes (keyText (property).toLowerCase ())) {
            return true;
        }
        const value = property.initializer;
        if (ts.isObjectLiteralExpression (value) && hasHttpMethodKey (value)) {
            return true;
        }
    }
    return false;
}

function findApiObject (source: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
    let found: ts.ObjectLiteralExpression | undefined = undefined;
    const visit = (node: ts.Node) => {
        if (found !== undefined) {
            return;
        }
        if (ts.isMethodDeclaration (node) && node.name.getText (source) === 'describe') {
            const inner = (n: ts.Node) => {
                if (found !== undefined) {
                    return;
                }
                if (ts.isPropertyAssignment (n) && keyText (n as ts.PropertyAssignment) === 'api') {
                    const value = (n as ts.PropertyAssignment).initializer;
                    if (ts.isObjectLiteralExpression (value) && hasHttpMethodKey (value)) {
                        found = value;
                        return;
                    }
                }
                ts.forEachChild (n, inner);
            };
            ts.forEachChild (node, inner);
            return;
        }
        ts.forEachChild (node, visit);
    };
    ts.forEachChild (source, visit);
    return found;
}

// the import declaration of base/types.js, if the file has one
function findTypesImport (source: ts.SourceFile): ts.ImportDeclaration | undefined {
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration (statement)) {
            continue;
        }
        const specifier = statement.moduleSpecifier;
        if (ts.isStringLiteral (specifier) && specifier.text.endsWith ('base/types.js')) {
            return statement;
        }
    }
    return undefined;
}

function migrateFile (file: string, stats: any): string | undefined {
    const text = fs.readFileSync (file, 'utf8');
    const source = ts.createSourceFile (file, text, ts.ScriptTarget.ES2020, true);
    const api = findApiObject (source);
    if (api === undefined) {
        return undefined;
    }
    const edits: Edit[] = [];
    const used: string[] = [];
    const walk = (node: ts.ObjectLiteralExpression, inHttpMethod: boolean) => {
        for (const property of node.properties) {
            if (!ts.isPropertyAssignment (property)) {
                continue;
            }
            const key = keyText (property);
            const value = property.initializer;
            const isVerb = HTTP_METHODS.includes (key.toLowerCase ());
            if (!ts.isObjectLiteralExpression (value)) {
                continue;
            }
            if (!inHttpMethod) {
                walk (value, isVerb);
                continue;
            }
            // `value` is an api leaf: pull 'returnType' out of it and assert the
            // type it named onto the leaf itself
            const tag = value.properties.find ((p) => ts.isPropertyAssignment (p) && keyText (p as ts.PropertyAssignment) === 'returnType');
            if (tag === undefined) {
                stats['untagged'] += 1;
                continue;
            }
            const initializer = (tag as ts.PropertyAssignment).initializer;
            if (!ts.isStringLiteral (initializer)) {
                stats['unsupported'] += 1;
                continue;
            }
            const shape = initializer.text;
            for (const name of shape.split (/[^A-Za-z]+/)) {
                if (NAMED_TYPES.includes (name) && !used.includes (name)) {
                    used.push (name);
                }
            }
            // Cut the 'returnType': '...' property together with the separator
            // that joined it to the property before it, so the surviving keys
            // keep the exact spacing they had. Any comma that followed the tag
            // stays put and becomes the new trailing comma — which is what a
            // multi-line leaf needs and a single-line leaf never has.
            const index = value.properties.indexOf (tag);
            let start = tag.getStart (source);
            let end = tag.getEnd ();
            if (index > 0) {
                start = value.properties[index - 1].getEnd ();
            } else {
                const match = text.slice (end).match (/^\s*,/);
                if (match !== null) {
                    end += match[0].length;
                }
            }
            edits.push ({ 'start': start, 'end': end, 'text': '' });
            edits.push ({ 'start': value.getEnd (), 'end': value.getEnd (), 'text': ` as EndpointSpec<${shape}>` });
            stats['migrated'] += 1;
        }
    };
    walk (api, false);
    if (!edits.length) {
        return undefined;
    }
    // the types this file now names have to be importable
    const wanted = [ 'EndpointSpec' ].concat (used);
    const typesImport = findTypesImport (source);
    if (typesImport !== undefined) {
        const bindings = typesImport.importClause?.namedBindings;
        if (bindings !== undefined && ts.isNamedImports (bindings)) {
            const already = bindings.elements.map ((e) => e.name.text);
            const missing = wanted.filter ((n) => !already.includes (n));
            if (missing.length) {
                const last = bindings.elements[bindings.elements.length - 1];
                edits.push ({ 'start': last.getEnd (), 'end': last.getEnd (), 'text': ', ' + missing.join (', ') });
            }
        }
    } else {
        // no types import at all (a derived exchange that only overrides costs):
        // add one just below the last import the file already has
        const depth = file.split ('/').length - 3;
        const basePath = (depth === 0) ? './' : '../'.repeat (depth);
        const imports = source.statements.filter ((s) => ts.isImportDeclaration (s));
        const anchor = imports.length ? imports[imports.length - 1] : source.statements[0];
        const insertAt = imports.length ? anchor.getEnd () : anchor.getStart (source);
        const line = `import type { ${wanted.join (', ')} } from '${basePath}base/types.js';`;
        edits.push ({ 'start': insertAt, 'end': insertAt, 'text': imports.length ? ('\n' + line) : (line + '\n') });
    }
    edits.sort ((a, b) => b.start - a.start);
    let output = text;
    for (const edit of edits) {
        output = output.slice (0, edit.start) + edit.text + output.slice (edit.end);
    }
    stats['files'] += 1;
    return output;
}

function sources (): string[] {
    const out: string[] = [];
    const dirs = [ 'ts/src', 'ts/src/prediction', 'ts/src/pro', 'ts/src/pro/prediction' ];
    for (const dir of dirs) {
        if (!fs.existsSync (dir)) {
            continue;
        }
        for (const entry of fs.readdirSync (dir)) {
            if (entry.endsWith ('.ts')) {
                out.push (path.join (dir, entry));
            }
        }
    }
    return out;
}

function main () {
    const dry = process.argv.includes ('--dry');
    const stats = { 'files': 0, 'migrated': 0, 'untagged': 0, 'unsupported': 0 };
    for (const file of sources ()) {
        const output = migrateFile (file, stats);
        if (output !== undefined && !dry) {
            fs.writeFileSync (file, output);
        }
    }
    process.stdout.write (JSON.stringify (stats, null, 1) + '\n');
}

main ();
