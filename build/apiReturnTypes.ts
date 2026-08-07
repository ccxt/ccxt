// ---------------------------------------------------------------------------
// Reads the declared return type of every implicit-API endpoint straight out of
// the TypeScript source of each exchange's describe().
//
// A shape is declared as a real TypeScript type, asserted onto the api leaf that
// already carries the endpoint's rate limit cost:
//
//     'klines': { 'cost': 1 } as EndpointSpec<List>,
//
// `EndpointSpec<Returns>` (ts/src/base/types.ts) is a phantom: the type argument
// is the endpoint's response shape and the assertion is erased at compile time,
// so the object the rate limiter receives is unchanged — `{ 'cost': 1 }`, the
// same literal it was before the shape was declared. Nothing about the shape
// survives into the running exchange, into the transpiled ports, or into the
// throttler; it exists only here, at build time, to be resolved by the compiler
// API and written into the generated abstract signatures as `Promise<List>`.
//
// This is why the declaration is a type and not a string tag: `List` here is the
// same `List` the generated file imports from base/types.js, checked by tsc at
// the site where it is declared, renamed by any editor that renames the type,
// and impossible to misspell into a silently-ignored value.
//
// "typescript6" is an npm alias for typescript@6 — the last release shipping the
// JS compiler API (typescript@7 is native and only provides the tsc binary).
// ---------------------------------------------------------------------------

import ts from 'typescript6';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HTTP_METHODS = [ 'get', 'post', 'put', 'delete', 'patch' ];

// the phantom carrying an endpoint's response shape as its type argument
const ENDPOINT_SPEC = 'EndpointSpec';

// the repo root, resolved from this module rather than from the working
// directory: a cwd-relative lookup silently reads nothing when the generator is
// invoked from anywhere but the root, and emits 14k default signatures instead
export const ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..');

export type ReturnTypes = { [method: string]: string };

const capitalize = (s: string): string => {
    return s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s;
};

// the camelCase name generateImplicitAPI gives the method of one api leaf —
// must stay identical to the path building in generateImplicitMethodNames
function methodName (paths: string[], endpoint: string): string {
    const parts = paths.concat (endpoint.split (/[^a-zA-Z0-9]/)).filter ((p) => p.length > 0);
    const camel = parts.map (capitalize).join ('');
    return camel.charAt (0).toLowerCase () + camel.slice (1);
}

// literal text of an object-literal key, whatever quoting the source uses
function keyText (node: ts.PropertyAssignment): string {
    const name = node.name;
    if (ts.isStringLiteral (name) || ts.isNumericLiteral (name) || ts.isIdentifier (name)) {
        return name.text;
    }
    return '';
}

// true when the literal has an http-method key somewhere under it, which is what
// separates the api tree from same-named siblings such as urls.api
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

// the 'api' property of the object literal returned by describe()
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

// the response shape asserted onto one api leaf, as the source spells the type:
// `{ 'cost': 1 } as EndpointSpec<Dict | List>` -> 'Dict | List'
function declaredShape (source: ts.SourceFile, leaf: ts.Expression): string | undefined {
    if (!ts.isAsExpression (leaf)) {
        return undefined;
    }
    const asType = leaf.type;
    if (!ts.isTypeReferenceNode (asType)) {
        return undefined;
    }
    if (asType.typeName.getText (source) !== ENDPOINT_SPEC) {
        return undefined;
    }
    const args = asType.typeArguments;
    if (args === undefined || args.length !== 1) {
        return undefined;
    }
    // the type argument verbatim, so unions keep the spacing the author wrote
    return args[0].getText (source).replace (/\s+/g, ' ').trim ();
}

// A leaf that names EndpointSpec but which declaredShape could not read is a
// contributor mistake, not an undeclared endpoint: `satisfies EndpointSpec<T>`,
// a parenthesised or aliased assertion and an angle-bracket type assertion all
// type-check while carrying no shape this reader can see. Silently degrading
// them to the permissive default is exactly the failure the string tags had, so
// refuse instead of guessing.
function assertReadable (file: string, source: ts.SourceFile, leaf: ts.Expression) {
    if (!leaf.getText (source).includes (ENDPOINT_SPEC)) {
        return;
    }
    const { line } = source.getLineAndCharacterOfPosition (leaf.getStart (source));
    throw new Error (
        file + ':' + (line + 1) + ' declares ' + ENDPOINT_SPEC + ' in a form this reader cannot resolve. '
        + "An api leaf must spell its shape as `{ 'cost': 1 } as " + ENDPOINT_SPEC + '<Dict>` — a plain `as` '
        + 'assertion of an unaliased, unqualified ' + ENDPOINT_SPEC + ' with exactly one type argument.'
    );
}

function walkApi (file: string, source: ts.SourceFile, node: ts.ObjectLiteralExpression, paths: string[], out: ReturnTypes) {
    for (const property of node.properties) {
        if (!ts.isPropertyAssignment (property)) {
            continue;
        }
        const key = keyText (property);
        const value = property.initializer;
        if (HTTP_METHODS.includes (key.toLowerCase ())) {
            if (!ts.isObjectLiteralExpression (value)) {
                // 'get': [ 'a', 'b' ] — the bare array form carries no shape
                continue;
            }
            for (const leaf of value.properties) {
                if (!ts.isPropertyAssignment (leaf)) {
                    continue;
                }
                const shape = declaredShape (source, leaf.initializer);
                if (shape === undefined) {
                    assertReadable (file, source, leaf.initializer);
                    continue;
                }
                out[methodName (paths.concat ([ key ]), keyText (leaf))] = shape;
            }
        } else if (ts.isObjectLiteralExpression (value)) {
            walkApi (file, source, value, paths.concat ([ key ]), out);
        }
    }
}

const cache: { [path: string]: ReturnTypes } = {};

// every shape declared by the api tree of one exchange source file
export function returnTypesOfFile (file: string): ReturnTypes {
    if (file in cache) {
        return cache[file];
    }
    const absolute = path.isAbsolute (file) ? file : path.join (ROOT, file);
    if (!fs.existsSync (absolute)) {
        throw new Error ('no such exchange source: ' + absolute);
    }
    const out: ReturnTypes = {};
    const text = fs.readFileSync (absolute, 'utf8');
    const source = ts.createSourceFile (absolute, text, ts.ScriptTarget.ES2020, true);
    const api = findApiObject (source);
    if (api !== undefined) {
        walkApi (file, source, api, [], out);
    }
    cache[file] = out;
    return out;
}

// true when a pro exchange's module imports the rest module of the same id,
// which is how a pro class that does not *extend* its rest twin still merges
// that twin's describe() into its own (pro/binanceus.ts: `new binanceusRest ()`)
export function importsRestTwin (proFile: string, id: string): boolean {
    const absolute = path.isAbsolute (proFile) ? proFile : path.join (ROOT, proFile);
    if (!fs.existsSync (absolute)) {
        return false;
    }
    const source = ts.createSourceFile (absolute, fs.readFileSync (absolute, 'utf8'), ts.ScriptTarget.ES2020, true);
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration (statement)) {
            continue;
        }
        const specifier = statement.moduleSpecifier;
        if (ts.isStringLiteral (specifier) && specifier.text === '../' + id + '.js') {
            return true;
        }
    }
    return false;
}

// The api tree an exchange exposes is the deep merge of describe() along its
// prototype chain, so the declarations are merged the same way: over the same
// files, in the same order deepExtend applied them (root-first, so a derived
// exchange overrides its parent). The caller resolves the file list from the
// live prototype chain — a name-based guess cannot tell a pro class from the
// rest class of the same name, and the two are not always the same chain.
export function returnTypesOfFiles (files: string[]): ReturnTypes {
    const merged: ReturnTypes = {};
    for (const file of files) {
        Object.assign (merged, returnTypesOfFile (file));
    }
    return merged;
}
