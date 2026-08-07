// ---------------------------------------------------------------------------
// One-shot migration / maintenance codemod.
//
// Writes the classified return shape of every implicit-API endpoint into the
// api tree in each exchange's describe(), right next to the endpoint's rate
// limit cost, turning
//
//     'klines': 1,
// into
//     'klines': { 'cost': 1, 'returnType': 'List' },
//
// so that build/generateImplicitAPI.ts can read the shape from the same place
// it already reads the cost from.
//
//     npx tsx build/annotateApiReturnTypes.ts <verdicts.json> [--dry]
//
// verdicts.json is { "<exchange id>": { "<camelCase method>": "Dict" } }.
// ---------------------------------------------------------------------------

import ts from 'typescript6';
import fs from 'fs';

const HTTP_METHODS = [ 'get', 'post', 'put', 'delete', 'patch' ];

type Verdicts = { [exchange: string]: { [method: string]: string } };

const capitalize = (s: string): string => {
    return s.length ? (s.charAt (0).toUpperCase () + s.slice (1)) : s;
};

function methodName (paths: string[], endpoint: string): string {
    const parts = paths.concat (endpoint.split (/[^a-zA-Z0-9]/)).filter ((p) => p.length > 0);
    const camel = parts.map (capitalize).join ('');
    return camel.charAt (0).toLowerCase () + camel.slice (1);
}

// literal text of an object-literal key, whatever quoting the source uses
function keyText (node: ts.PropertyAssignment): string {
    const name = node.name;
    if (ts.isStringLiteral (name) || ts.isNumericLiteral (name)) {
        return name.text;
    }
    if (ts.isIdentifier (name)) {
        return name.text;
    }
    return '';
}

type Edit = { 'start': number; 'end': number; 'text': string };

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

// indentation of the line a node starts on
function indentOf (text: string, pos: number): string {
    const lineStart = text.lastIndexOf ('\n', pos) + 1;
    const line = text.slice (lineStart, pos);
    const match = line.match (/^\s*/);
    return (match === null) ? '' : match[0];
}

function annotateFile (file: string, verdicts: Verdicts, ids: string[], stats: any): string | undefined {
    const text = fs.readFileSync (file, 'utf8');
    const source = ts.createSourceFile (file, text, ts.ScriptTarget.ES2020, true);
    const api = findApiObject (source);
    if (api === undefined) {
        return undefined;
    }
    const edits: Edit[] = [];
    // the shape recorded for one endpoint, looked up across every exchange that
    // reuses this file's api tree (binanceus/binancecoinm reuse binance's)
    const lookup = (method: string): string | undefined => {
        for (const id of ids) {
            const shape = (verdicts[id] || {})[method];
            if (shape !== undefined) {
                return shape;
            }
        }
        return undefined;
    };
    const walk = (node: ts.ObjectLiteralExpression, paths: string[]) => {
        for (const property of node.properties) {
            if (!ts.isPropertyAssignment (property)) {
                continue;
            }
            const key = keyText (property);
            const value = property.initializer;
            if (HTTP_METHODS.includes (key.toLowerCase ())) {
                if (ts.isObjectLiteralExpression (value)) {
                    for (const leaf of value.properties) {
                        if (!ts.isPropertyAssignment (leaf)) {
                            continue;
                        }
                        const endpoint = keyText (leaf);
                        const method = methodName (paths.concat ([ key ]), endpoint);
                        const shape = lookup (method);
                        if (shape === undefined) {
                            stats['skipped'] += 1;
                            continue;
                        }
                        const target = leaf.initializer;
                        if (ts.isObjectLiteralExpression (target)) {
                            if (target.properties.some ((p) => ts.isPropertyAssignment (p) && keyText (p as ts.PropertyAssignment) === 'returnType')) {
                                stats['already'] += 1;
                                continue;
                            }
                            const last = target.properties[target.properties.length - 1];
                            if (last === undefined) {
                                edits.push ({ 'start': target.getStart (source), 'end': target.getEnd (), 'text': `{ 'returnType': '${shape}' }` });
                            } else {
                                const multiline = text.slice (target.getStart (source), target.getEnd ()).includes ('\n');
                                if (multiline) {
                                    const indent = indentOf (text, last.getStart (source));
                                    edits.push ({ 'start': last.getEnd (), 'end': last.getEnd (), 'text': `,\n${indent}'returnType': '${shape}'` });
                                } else {
                                    edits.push ({ 'start': last.getEnd (), 'end': last.getEnd (), 'text': `, 'returnType': '${shape}'` });
                                }
                            }
                            stats['object'] += 1;
                        } else if (ts.isObjectLiteralExpression (target) === false && ts.isArrayLiteralExpression (target) === false) {
                            // anything else is the endpoint's cost: a literal, an
                            // arithmetic expression (20 / 15) or a local constant
                            // (rlOrders) — keep whatever the source says, verbatim
                            const cost = text.slice (target.getStart (source), target.getEnd ());
                            edits.push ({ 'start': target.getStart (source), 'end': target.getEnd (), 'text': `{ 'cost': ${cost}, 'returnType': '${shape}' }` });
                            stats['number'] += 1;
                        } else {
                            stats['unsupported'] += 1;
                        }
                    }
                } else if (ts.isArrayLiteralExpression (value)) {
                    // 'get': [ 'a', 'b' ] — rewrite to the object form only when at
                    // least one endpoint under it has a shape to record
                    const entries: string[] = [];
                    let annotated = 0;
                    let convertible = true;
                    for (const element of value.elements) {
                        if (!ts.isStringLiteral (element)) {
                            convertible = false;
                            break;
                        }
                        const endpoint = element.text;
                        const method = methodName (paths.concat ([ key ]), endpoint);
                        const shape = lookup (method);
                        if (shape === undefined) {
                            entries.push (`'${endpoint}': 1`);
                        } else {
                            entries.push (`'${endpoint}': { 'cost': 1, 'returnType': '${shape}' }`);
                            annotated += 1;
                        }
                    }
                    if (convertible && annotated > 0) {
                        const indent = indentOf (text, value.getStart (source));
                        const inner = indent + '    ';
                        const body = entries.map ((e) => inner + e).join (',\n');
                        edits.push ({ 'start': value.getStart (source), 'end': value.getEnd (), 'text': `{\n${body},\n${indent}}` });
                        stats['array'] += annotated;
                        stats['arraysConverted'] += 1;
                    } else {
                        stats['skipped'] += value.elements.length;
                    }
                }
            } else if (ts.isObjectLiteralExpression (value)) {
                walk (value, paths.concat ([ key ]));
            }
        }
    };
    walk (api, []);
    if (!edits.length) {
        return undefined;
    }
    edits.sort ((a, b) => b.start - a.start);
    let output = text;
    for (const edit of edits) {
        output = output.slice (0, edit.start) + edit.text + output.slice (edit.end);
    }
    return output;
}

function main () {
    const [ verdictsPath, ...rest ] = process.argv.slice (2);
    const dry = rest.includes ('--dry');
    const verdicts: Verdicts = JSON.parse (fs.readFileSync (verdictsPath, 'utf8'));
    const inventory = JSON.parse (fs.readFileSync ('/tmp/inventory.json', 'utf8'));
    // exchange id -> the ids whose api tree is defined in that id's file
    const users: { [id: string]: string[] } = {};
    for (const id of Object.keys (inventory)) {
        const chain = [ id ];
        let parent = inventory[id]['parent'];
        while (parent !== undefined && parent !== 'Exchange' && parent !== 'PredictionExchange') {
            chain.push (parent);
            parent = (inventory[parent] || {})['parent'];
        }
        for (const link of chain) {
            if (users[link] === undefined) {
                users[link] = [];
            }
            users[link].push (id);
        }
    }
    const stats = { 'number': 0, 'object': 0, 'array': 0, 'arraysConverted': 0, 'already': 0, 'skipped': 0, 'unsupported': 0, 'files': 0 };
    for (const id of Object.keys (inventory)) {
        const candidates = [ id ].concat (users[id] || []);
        const bare = id.replace ('prediction/', '');
        const files = id.startsWith ('prediction/') ?
            [ `ts/src/prediction/${bare}.ts`, `ts/src/pro/prediction/${bare}.ts` ] :
            [ `ts/src/${bare}.ts`, `ts/src/pro/${bare}.ts` ];
        for (const file of files) {
            if (!fs.existsSync (file)) {
                continue;
            }
            const output = annotateFile (file, verdicts, candidates, stats);
            if (output !== undefined) {
                stats['files'] += 1;
                if (!dry) {
                    fs.writeFileSync (file, output);
                }
            }
        }
    }
    process.stdout.write (JSON.stringify (stats, null, 1) + '\n');
}

main ();
