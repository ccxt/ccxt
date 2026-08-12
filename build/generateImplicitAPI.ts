import ccxt, { Dict, Exchange } from '../ts/ccxt.js';
import fs from 'fs';
import { writeFile, unlink } from 'fs/promises';
import log from 'ololog'

// ---------------------------------------------------------------------------
// Read declared Endpoint<Returns> shapes from describe().api leaves via the
// TypeScript compiler API (typescript6). Shapes are erased at runtime.
// ---------------------------------------------------------------------------
import ts from 'typescript6';
import path from 'path';
import { fileURLToPath } from 'url';

const HTTP_METHODS = [ 'get', 'post', 'put', 'delete', 'patch' ];

// the phantom carrying an endpoint's response shape as its type argument
const ENDPOINT_NAME = 'Endpoint';

// the repo root, resolved from this module rather than from the working
// directory: a cwd-relative lookup silently reads nothing when the generator is
// invoked from anywhere but the root, and emits 14k default signatures instead
const ROOT = path.join (path.dirname (fileURLToPath (import.meta.url)), '..');

type ReturnTypes = { [method: string]: string };

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
// `{ 'cost': 1 } as Endpoint<Dict | List>` -> 'Dict | List'
function declaredShape (source: ts.SourceFile, leaf: ts.Expression): string | undefined {
    if (!ts.isAsExpression (leaf)) {
        return undefined;
    }
    const asType = leaf.type;
    if (!ts.isTypeReferenceNode (asType)) {
        return undefined;
    }
    if (asType.typeName.getText (source) !== ENDPOINT_NAME) {
        return undefined;
    }
    const args = asType.typeArguments;
    if (args === undefined || args.length !== 1) {
        return undefined;
    }
    // the type argument verbatim, so unions keep the spacing the author wrote
    return args[0].getText (source).replace (/\s+/g, ' ').trim ();
}

// A leaf that names Endpoint but which declaredShape could not read is a
// contributor mistake, not an undeclared endpoint: `satisfies Endpoint<T>`,
// a parenthesised or aliased assertion and an angle-bracket type assertion all
// type-check while carrying no shape this reader can see. Silently degrading
// them to the permissive default is exactly the failure the string tags had, so
// refuse instead of guessing.
function assertReadable (file: string, source: ts.SourceFile, leaf: ts.Expression) {
    if (!leaf.getText (source).includes (ENDPOINT_NAME)) {
        return;
    }
    const { line } = source.getLineAndCharacterOfPosition (leaf.getStart (source));
    throw new Error (
        file + ':' + (line + 1) + ' declares ' + ENDPOINT_NAME + ' in a form this reader cannot resolve. '
        + "An api leaf must spell its shape as `{ 'cost': 1 } as " + ENDPOINT_NAME + '<Dict>` — a plain `as` '
        + 'assertion of an unaliased, unqualified ' + ENDPOINT_NAME + ' with exactly one type argument.'
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
function returnTypesOfFile (file: string): ReturnTypes {
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
function importsRestTwin (proFile: string, id: string): boolean {
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
function returnTypesOfFiles (files: string[]): ReturnTypes {
    const merged: ReturnTypes = {};
    for (const file of files) {
        Object.assign (merged, returnTypesOfFile (file));
    }
    return merged;
}


// const JS_PATH = './js/src/abstract/';
const TS_PATH = './ts/src/abstract/';
const PHP_PATH = './php/abstract/'
const ASYNC_PHP_PATH = './php/async/abstract/'
const CSHARP_PATH = './cs/ccxt/api/';
const PY_PATH = './python/ccxt/abstract/'
const GO_PATH = './go/v4/'
const JAVA_PATH = './java/lib/src/main/java/io/github/ccxt/api/'
const IDEN = '    ';

// -------------------------------------------------------------------------
// Per-endpoint TypeScript return types.
//
// Decoded JSON is always exactly one of three shapes — an object (Dict), an
// array (List) or a bare scalar (string) — so each generated method is emitted
// as the single shape its endpoint actually answers with, rather than one
// blanket union for all ~14k of them.
//
// The shape of an endpoint is declared as a real TypeScript type on the api
// leaf that already carries its rate limit cost, in that exchange's describe(),
// which is the single source of truth:
//
//     'klines': { 'cost': 1 } as Endpoint<List>,
//
// `Endpoint<Returns>` is a phantom type (ts/src/base/types.ts): the
// assertion is erased at compile time, so the leaf the rate limiter sees is
// still exactly `{ 'cost': 1 }` — no key was added to it, in any language. The
// declaration is read here from the TypeScript source with the compiler API
// (the TypeScript compiler API reader below), never from the running object, so the shape is a
// checked type reference rather than a string tag: `List` is the same `List`
// the generated abstract file imports from base/types.js.
//
// A leaf with no assertion ('klines': 1, or a plain object leaf) declares no
// shape; those endpoints fall back to DEFAULT_RETURN_TYPE, which stays
// permissive for external callers without asserting a shape nobody proved.
//
// Verdicts were established from each exchange's official documentation
// (describe()['urls']['doc']) plus the call sites in ts/src/**; regenerate the
// abstract files after editing an api tree with:
//
//     npm run emitAPITs  (or: npx tsx build/generateImplicitAPI.ts --ts)

// what an endpoint returns when its api leaf declares no returnType
const DEFAULT_RETURN_TYPE = 'Dict | List';

// the named types the emitted `Promise<...>` may be built out of
const KNOWN_RETURN_TYPES = [ 'Dict', 'List' ];

// the TS type to write inside Promise<...> for one generated method
function typescriptReturnType (exchange: string, method: string): string {
    const declared = storedReturnTypes[exchange][method];
    return (declared === undefined) ? DEFAULT_RETURN_TYPE : declared;
}

// the named types the generated abstract file has to import from base/types.js
function typescriptImportedTypes (exchange: string): string[] {
    const imported: string[] = [];
    const methods = storedCamelCaseMethods[exchange] || [];
    for (const method of methods) {
        for (const name of typescriptReturnType (exchange, method).split (/[^A-Za-z]+/)) {
            if (KNOWN_RETURN_TYPES.includes (name) && !imported.includes (name)) {
                imported.push (name);
            }
        }
    }
    return imported;
}

// -------------------------------------------------------------------------
// The same per-endpoint shape, spelled for the other ports.
//
// A declared shape is a fact about the decoded JSON body, so it is worth the
// same in every language — but not every language can carry it in the same
// place. PHP, Python, C# and Java can express it where a caller and a type
// checker will both see it; Go cannot narrow its generated signature without
// dropping the panic-string-on-channel error multiplexing, so there the shape
// is documented rather than declared. Each mapping is derived from the one
// storedReturnTypes map, so all six languages stay in step with the api leaf
// by construction.
// -------------------------------------------------------------------------

// the members a declared shape can be built out of, per language
const PHPDOC_RETURN_TYPES: Dict = {
    'Dict': 'array<string, mixed>',
    'List': 'list<mixed>',
    'string': 'string',
};
const PYTHON_RETURN_ALIASES: Dict = {
    'Dict': '_Dict',
    'List': '_List',
    'string': 'str',
};
// C# and Java get the concrete runtime types their JSON decoders actually
// produce, so the declared type is castable rather than merely descriptive:
// JsonHelper.Deserialize builds Dictionary<string, object> / List<object>
// (Exchange.JSONHelper.cs), and Jackson's Object binding builds
// LinkedHashMap / ArrayList, which satisfy Map<String, Object> / List<Object>.
const CSHARP_RETURN_TYPES: Dict = {
    'Dict': 'Dictionary<string, object>',
    'List': 'List<object>',
    'string': 'string',
};
const JAVA_RETURN_TYPES: Dict = {
    'Dict': 'java.util.Map<String, Object>',
    'List': 'java.util.List<Object>',
    'string': 'String',
};
const PROSE_RETURN_SHAPES: Dict = {
    'Dict': 'a JSON object',
    'List': 'a JSON array',
    'string': 'a JSON scalar',
};

// split a declared type into its union members ('Dict | List' -> [Dict, List])
function returnTypeMembers (exchange: string, method: string): string[] {
    return typescriptReturnType (exchange, method).split ('|').map ((name) => name.trim ());
}

// the PHPDoc type for one generated method. PHP has one `array` for both an
// object and a list, so a native `: array` throws the Dict/List distinction
// away; the PHPStan/Psalm array shapes keep it next to the coarse native
// return type (see phpNativeReturnType).
function phpdocReturnType (exchange: string, method: string): string {
    const members = returnTypeMembers (exchange, method).map ((name) => PHPDOC_RETURN_TYPES[name] || 'mixed');
    return members.join ('|');
}

// native PHP return type for the *sync* abstract only. Dict and List both
// collapse to `array`; string stays `string`; multi-shape unions become
// `array|string` (PHP 8). Empty string means "no native hint" (unknown
// member). Async abstracts strip this suffix when derived — their request()
// returns a Promise, not the decoded body.
function phpNativeReturnType (exchange: string, method: string): string {
    const members = returnTypeMembers (exchange, method);
    const native: string[] = [];
    for (const name of members) {
        let part = '';
        if ((name === 'Dict') || (name === 'List')) {
            part = 'array';
        } else if (name === 'string') {
            part = 'string';
        } else {
            return '';
        }
        if (!native.includes (part)) {
            native.push (part);
        }
    }
    return native.join ('|');
}

// the Python type argument for one generated method, as an alias declared in
// the generated module's header (see createPyHeader): subscripting the alias
// once per module is what keeps the ~14k Entry constructions cheap.
function pythonReturnType (exchange: string, method: string): string {
    const members = returnTypeMembers (exchange, method);
    const mapped = members.map ((name) => PYTHON_RETURN_ALIASES[name] || '_Any');
    if (mapped.length === 1) {
        return mapped[0];
    }
    return 'Union[' + mapped.join (', ') + ']';
}

// the Python aliases one generated module actually uses, so a module that only
// answers with objects does not declare a list alias it never mentions
function pythonUsedAliases (exchange: string): string[] {
    const used: string[] = [];
    const methods = storedCamelCaseMethods[exchange] || [];
    for (const method of methods) {
        for (const name of returnTypeMembers (exchange, method)) {
            const alias = PYTHON_RETURN_ALIASES[name] || '_Any';
            if ((alias[0] === '_') && !used.includes (alias)) {
                used.push (alias);
            }
        }
    }
    return used;
}

// whether any endpoint on this exchange needs a multi-member return (Union[...])
function pythonNeedsUnion (exchange: string): boolean {
    const methods = storedCamelCaseMethods[exchange] || [];
    for (const method of methods) {
        if (returnTypeMembers (exchange, method).length > 1) {
            return true;
        }
    }
    return false;
}

// storedPyMethods[exchange][1] is the alias block, left empty by createPyHeader
// for the same reason the TypeScript import line is: the set of shapes an
// exchange answers with is only known after generateImplicitMethodNames ran.
// Import only the typing names the aliases/unions actually reference — ruff F401
// fails the Python qa gate on unused List/Union when a module is Dict-only.
function finalizePythonAliases (exchange: string) {
    const aliases = pythonUsedAliases (exchange);
    const needsUnion = pythonNeedsUnion (exchange);
    if (!aliases.length && !needsUnion) {
        storedPyMethods[exchange][1] = '';
        return;
    }
    const spelled: Dict = {
        '_Dict': 'Dict[str, PythonAny]',
        '_List': 'List[PythonAny]',
        '_Any': 'PythonAny',
    };
    // build the import from the names that appear in the alias RHS or in
    // Entry[Union[...]] constructions; never import a name that is not used
    const typingNames: string[] = [ 'Any as PythonAny' ];
    if (aliases.includes ('_Dict')) {
        typingNames.push ('Dict');
    }
    if (aliases.includes ('_List')) {
        typingNames.push ('List');
    }
    if (needsUnion) {
        typingNames.push ('Union');
    }
    const lines = [ 'from typing import ' + typingNames.join (', '), '' ];
    for (const alias of aliases) {
        lines.push (alias + ' = ' + spelled[alias]);
    }
    storedPyMethods[exchange][1] = lines.join ('\n');
}

// a one-line prose description of the decoded body, for the languages whose
// generated signature cannot be narrowed (see createImplicitMethodsGo for why)
function proseReturnShape (exchange: string, method: string): string {
    const members = returnTypeMembers (exchange, method).map ((name) => PROSE_RETURN_SHAPES[name]);
    if (members.includes (undefined)) {
        return 'a decoded JSON value';
    }
    if (members.length === 1) {
        return members[0];
    }
    return members.slice (0, -1).join (', ') + ' or ' + members[members.length - 1];
}

// The C#/Java type argument for one generated method. Both languages have an
// invariant generic return (Task<T>, CompletableFuture<T>) and no union type,
// so a multi-member shape has no honest narrowing: the least upper bound of
// Dict/List/string is the root type itself. Those endpoints keep the widest
// type and say why in the doc comment rather than pretending to a shape the
// caller would have to re-test anyway.
function narrowedReturnType (exchange: string, method: string, spelling: Dict, widest: string): string {
    const members = returnTypeMembers (exchange, method);
    if (members.length !== 1) {
        return widest;
    }
    return spelling[members[0]] || widest;
}

function csharpReturnType (exchange: string, method: string): string {
    return narrowedReturnType (exchange, method, CSHARP_RETURN_TYPES, 'object');
}

function javaReturnType (exchange: string, method: string): string {
    return narrowedReturnType (exchange, method, JAVA_RETURN_TYPES, 'Object');
}

// whether a generated method kept the widest type because its shape is a union
function isUnionShape (exchange: string, method: string): boolean {
    return returnTypeMembers (exchange, method).length !== 1;
}

// storedTypeScriptMethods[exchange][1] is the `import { ... } from base/types.js`
// line, left empty by createTypescriptHeader because the set of types an
// exchange needs is only known after generateImplicitMethodNames has filled
// storedCamelCaseMethods. tsconfig sets noUnusedLocals, so importing a type the
// file never mentions would fail the build.
function finalizeTypescriptImport (exchange: string) {
    const basePath = isPrediction ? '../../' : '../';
    const imported = typescriptImportedTypes (exchange);
    if (!imported.length) {
        storedTypeScriptMethods[exchange][1] = '';
        return;
    }
    storedTypeScriptMethods[exchange][1] = `import { ${imported.join (', ')} } from '${basePath}base/types.js';`;
}

let storedCamelCaseMethods: Dict = {};
let storedUnderscoreMethods: Dict = {};
let storedTypeScriptMethods: Dict = {};
let storedCSharpMethods: Dict = {};
let storedContext: Dict = {};
// exchange id -> camelCase method name -> the TypeScript type declared for that
// endpoint by the `as Endpoint<...>` assertion on its api leaf in describe()
let storedReturnTypes: Dict = {};
let storedPhpMethods: Dict = {};
let storedPyMethods: Dict = {};
let storedGoMethods: Dict = {};
let storedJavaMethods: Dict = {};
// exchange id -> name of the class it derives from ('Exchange' when it derives
// straight from the base). Used by the Go emitter to skip endpoints the parent
// core already declares (see createImplicitMethodsGo).
let storedParents: Dict = {};

// when true, we are generating the implicit APIs for the prediction-market
// exchanges (ts/src/prediction/) which live in their own namespace/subfolder
// in every language (ccxt.prediction, ccxt\prediction, ccxtprediction, ...)
let isPrediction = false;

function resetStoredMethods () {
    storedCamelCaseMethods = {};
    storedUnderscoreMethods = {};
    storedTypeScriptMethods = {};
    storedCSharpMethods = {};
    storedContext = {};
    storedReturnTypes = {};
    storedPhpMethods = {};
    storedPyMethods = {};
    storedGoMethods = {};
    storedJavaMethods = {};
    storedParents = {};
}


const [,, ...args] = process.argv
const langKeys = {
    '--ts': false,
    '--js': false,
    '--php': false,
    '--python': false,
    '--csharp': false,
    '--go': false,
    '--java': false,
}

function isHttpMethod(method: string): boolean {
    return ['get', 'post', 'put', 'delete', 'patch'].includes (method);
}

// -------------------------------------------------------------------------
// The source files whose describe() built the api tree of one instance, in the
// order deepExtend applied them (root first, so a derived exchange overrides
// its parent). Resolved from the live prototype chain rather than from the
// exchange id, because the two do not always agree: pro/kucoinfutures extends
// pro/kucoin, so ts/src/kucoinfutures.ts never contributes to it, while
// pro/binanceus extends pro/binance yet still merges ts/src/binanceus.ts by
// constructing its rest twin. Guessing either way from the name alone would
// read a file the runtime never merged, or miss one it did.
function describeSourceFiles (instance: any, restContainer: Dict, proContainer: Dict): string[] {
    const restDir = isPrediction ? 'ts/src/prediction/' : 'ts/src/';
    const proDir = isPrediction ? 'ts/src/pro/prediction/' : 'ts/src/pro/';
    // the chain child-first, each link tagged with the namespace it came from
    const chain: { 'id': string; 'pro': boolean }[] = [];
    let ctor = instance.constructor;
    while (ctor !== undefined && ctor !== null && ctor.name && ctor.name !== 'Exchange' && ctor.name !== 'BaseExchange' && ctor.name !== 'PredictionExchange') {
        const id = ctor.name;
        chain.push ({ 'id': id, 'pro': proContainer[id] === ctor });
        ctor = Object.getPrototypeOf (ctor);
    }
    const files: string[] = [];
    for (let i = chain.length - 1; i >= 0; i--) {
        const link = chain[i];
        if (!link['pro']) {
            files.push (restDir + link['id'] + '.ts');
            continue;
        }
        const proFile = proDir + link['id'] + '.ts';
        // a pro class that merges its rest twin without extending it brings that
        // twin's whole rest chain in ahead of the ws describes, exactly as its
        // deepExtend (restDescribe, parentWsDescribe) does
        const twin = restContainer[link['id']];
        const inChain = chain.some ((other) => !other['pro'] && other['id'] === link['id']);
        if (twin !== undefined && !inChain && importsRestTwin (proFile, link['id'])) {
            const twinFiles: string[] = [];
            let twinCtor = twin;
            while (twinCtor !== undefined && twinCtor !== null && twinCtor.name && twinCtor.name !== 'Exchange' && twinCtor.name !== 'BaseExchange' && twinCtor.name !== 'PredictionExchange') {
                twinFiles.unshift (restDir + twinCtor.name + '.ts');
                twinCtor = Object.getPrototypeOf (twinCtor);
            }
            for (const file of twinFiles) {
                if (!files.includes (file)) {
                    files.splice (firstProIndex (files, proDir), 0, file);
                }
            }
        }
        files.push (proFile);
    }
    return files;
}

// where the ws describes start, so a rest chain merged by a pro class is
// inserted ahead of all of them and behind every rest file already collected
function firstProIndex (files: string[], proDir: string): number {
    for (let i = 0; i < files.length; i++) {
        if (files[i].startsWith (proDir)) {
            return i;
        }
    }
    return files.length;
}
//-------------------------------------------------------------------------

//-------------------------------------------------------------------------

function lowercaseFirstLetter(string: string): string {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

//-------------------------------------------------------------------------

function getPreamble () {
    return [
        "// -------------------------------------------------------------------------------",
        "",
        "// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:",
        "// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code",
        "",
        "// -------------------------------------------------------------------------------",
        "",
    ].join ("\n")
}

//-------------------------------------------------------------------------

function generateImplicitMethodNames(id: string, api: string, paths: string[] = []){
    const keys = Object.keys(api);
    for (const key of keys){
        let value = api[key];
        let endpoints: string[] = []
        if (isHttpMethod(key)){
            if (value && !Array.isArray(value)) {
                endpoints = Object.keys(value)
            } else {
                if  (Array.isArray(value)) {
                    endpoints = [];
                    for (const item of value){
                        if (Array.isArray(item)) {
                            endpoints.push(item[0])
                        } else {
                            endpoints.push(item)
                        }
                    }
                }
            }
            for (const endpoint of endpoints){
                const pattern = /[^a-zA-Z0-9]/g;
                const result = paths.concat (key).concat (endpoint.split (pattern)).filter(r => r.length > 0);
                let camelCasePath = result.map(capitalize).join('');
                camelCasePath = lowercaseFirstLetter(camelCasePath);
                storedCamelCaseMethods[id].push (camelCasePath)
                let underscorePath = result.map (x => x.toLowerCase ()).join ('_')
                storedUnderscoreMethods[id].push (underscorePath)
                let config: {} | undefined = undefined
                if (Array.isArray (value)) {
                    config = {}
                } else {
                    config = value[endpoint]
                    if (typeof config === 'number') {
                        config = { 'cost': config }
                    }
                }
                // Nothing has to be stripped from the config here: the response
                // shape is declared as an erased type assertion on the api leaf
                // (`{ 'cost': 1 } as Endpoint<List>`), so it never becomes a
                // key of the runtime object and cannot reach the rate limiter in
                // any language. It is read straight from the TypeScript source
                // by populateImplicitMethods, into storedReturnTypes.
                const pyConfig = JSON.stringify (config).replace (/:/g, ': ').replace (/"/g, "'").replace (/,/g, ', ')
                const phpConfig = JSON.stringify (config).replace (/{/g, 'array(').replace (/:/g, ' => ').replace (/}/g, ')').replace (/,/g, ', ')
                storedContext[id].push ({
                    endpoint,
                    phpPath: paths.length === 1 ? `'${paths[0]}'` : 'array(' + paths.map (x => `'${x}'`).join (', ') + ')',
                    pyPath: paths.length === 1 ? `'${paths[0]}'` : '[' + paths.map (x => `'${x}'`).join (', ') + ']',
                    phpConfig: phpConfig,
                    pyConfig: pyConfig,
                    method: key.toUpperCase (),
                })
            }
        } else {
            generateImplicitMethodNames(id, value, paths.concat([ key ]))
        }
    }
}

//-------------------------------------------------------------------------

function createImplicitMethodsPython(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const camelCaseMethods = storedCamelCaseMethods[exchange];
        const underscoreMethods = storedUnderscoreMethods[exchange]

        const pythonMethods = underscoreMethods.map ((method, idx) => {
            const i = idx % underscoreMethods.length
            const camelCaseMethod = camelCaseMethods[i]
            const context = storedContext[exchange][i]
            return `${IDEN}${method} = ${camelCaseMethod} = Entry[${pythonReturnType (exchange, camelCaseMethod)}]('${context.endpoint}', ${context.pyPath}, '${context.method}', ${context.pyConfig})`
        })
        storedPyMethods[exchange] = storedPyMethods[exchange].concat (pythonMethods)
        finalizePythonAliases (exchange)
    }
}

// -------------------------------------------------------------------------

function createImplicitMethodsPhp(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const camelCaseMethods = storedCamelCaseMethods[exchange];
        const underscoreMethods = storedUnderscoreMethods[exchange]

        const typeScriptMethods = camelCaseMethods.map (method => {
            return `${IDEN}${method} (params?: {}): Promise<${typescriptReturnType (exchange, method)}>;`
        });
        const phpMethods = underscoreMethods.concat (camelCaseMethods).map ((method, idx) => {
            const i = idx % underscoreMethods.length
            const context = storedContext[exchange][i]
            // storedReturnTypes is keyed by the camelCase name, and the two name
            // arrays are filled in lockstep by generateImplicitMethodNames, so
            // index i is the same endpoint in both halves of this concat
            const bodyShape = phpdocReturnType (exchange, camelCaseMethods[i])
            // prediction abstracts are async-only (PredictionExchange); normal
            // REST is written as sync first and rewritten for php/async/abstract
            if (isPrediction) {
                return `${IDEN}/**
${IDEN} * @return \\React\\Promise\\PromiseInterface<${bodyShape}>
${IDEN} */
${IDEN}public function ${method}($params = array()): \\React\\Promise\\PromiseInterface {
${IDEN}${IDEN}return $this->request('${context.endpoint}', ${context.phpPath}, '${context.method}', $params, null, null, ${context.phpConfig});
${IDEN}}`
            }
            // Sync REST: shape stays in @return only. A native `: array` TypeErrors when
            // the transport hands back a raw string (error page / some STATIC_RESPONSE
            // fixtures), which is a real runtime path handleRestResponse already allows.
            return `${IDEN}/**
${IDEN} * @return ${bodyShape}
${IDEN} */
${IDEN}public function ${method}($params = array()) {
${IDEN}${IDEN}return $this->request('${context.endpoint}', ${context.phpPath}, '${context.method}', $params, null, null, ${context.phpConfig});
${IDEN}}`
        })

        typeScriptMethods.push ('}')
        phpMethods.push ('}')
        const footer = storedTypeScriptMethods[exchange].pop ()
        storedTypeScriptMethods[exchange] = storedTypeScriptMethods[exchange].concat (typeScriptMethods).concat ([ footer ])
        finalizeTypescriptImport (exchange)
        storedPhpMethods[exchange] = storedPhpMethods[exchange].concat (phpMethods)
    }
}

// -------------------------------------------------------------------------

function createImplicitMethodsTs(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const camelCaseMethods = storedCamelCaseMethods[exchange];

        const typeScriptMethods = camelCaseMethods.map (method => {
            return `${IDEN}${method} (params?: {}): Promise<${typescriptReturnType (exchange, method)}>;`
        });
        typeScriptMethods.push ('}')
        const footer = storedTypeScriptMethods[exchange].pop ()
        storedTypeScriptMethods[exchange] = storedTypeScriptMethods[exchange].concat (typeScriptMethods).concat ([ footer ])
        finalizeTypescriptImport (exchange)
    }
}

// -------------------------------------------------------------------------

function createImplicitMethodsCSharp(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const methodNames = storedCamelCaseMethods[exchange];

        const methods =  methodNames.map(method=> {
            // The declared shape lands on the signature, because callAsync is
            // generic and JsonHelper.Deserialize builds exactly the runtime
            // types spelled in CSHARP_RETURN_TYPES (Dictionary<string, object>
            // for a JSON object, List<object> for a JSON array) — the narrowing
            // is a fact about the decoded body, not a hint.
            //
            // Task<T> is invariant, so `Task<Dictionary<string, object>> is
            // Task<object>` is false: every reflective/dynamic await site has
            // to normalize through Exchange.AsTaskOfObject (callDynamically,
            // callDynamicallyAsync, PromiseAll, spawn, and the test harness's
            // callExchangeMethodDynamically all do). And callAsync<T> never
            // answers default(T) for a non-null body it could not narrow — a
            // silent null there is what emptied parseBalance/parseTicker
            // results under STATIC_RESPONSE; it raises instead, naming the
            // endpoint and both shapes.
            //
            // A union shape has no honest narrowing (the least upper bound of
            // Dict/List/string is object itself), so those endpoints keep
            // object and say so in the doc comment.
            const returns = csharpReturnType (exchange, method);
            const shape = isUnionShape (exchange, method)
                ? `${proseReturnShape (exchange, method)}, so this endpoint keeps object`
                : proseReturnShape (exchange, method);
            return [
                `${IDEN}/// <summary>Calls the ${method} endpoint.</summary>`,
                `${IDEN}/// <returns>${shape}</returns>`,
                `${IDEN}public async Task<${returns}> ${method} (object parameters = null)`,
                `${IDEN}{`,
                `${IDEN}${IDEN}return await this.callAsync<${returns}> ("${method}",parameters);`,
                `${IDEN}}`,
                ``,
            ].join('\n')
        });
        methods.push ('}')
       storedCSharpMethods[exchange] = storedCSharpMethods[exchange].concat (methods)
    }
}

// -------------------------------------------------------------------------

function createImplicitMethodsJava(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const methodNames = storedCamelCaseMethods[exchange];

        const methods =  methodNames.map(method=> {
            // callAsync is generic, so the declared shape lands on the
            // signature itself. The types are fully qualified because the
            // generated api classes import nothing but io.github.ccxt.Exchange.
            const returns = javaReturnType (exchange, method);
            const shape = isUnionShape (exchange, method)
                ? `${proseReturnShape (exchange, method)}, so this endpoint keeps Object`
                : proseReturnShape (exchange, method);
            return [
                `${IDEN}/**`,
                `${IDEN} * Calls the ${method} endpoint.`,
                `${IDEN} *`,
                `${IDEN} * @param optionalArgs the request parameters`,
                `${IDEN} * @return ${shape}`,
                `${IDEN} */`,
                `${IDEN}public java.util.concurrent.CompletableFuture<${returns}>  ${method} (Object... optionalArgs)`,
                `${IDEN}{`,
                `${IDEN}${IDEN}return this.callAsync ("${method}", optionalArgs);`,
                `${IDEN}}`,
                ``,
            ].join('\n')
        });
        methods.push ('}')
       storedJavaMethods[exchange] = storedJavaMethods[exchange].concat (methods)
    }
}

//-------------------------------------------------------------------------

function createImplicitMethodsGo(){
    const exchanges = Object.keys(storedCamelCaseMethods);
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const methodNames = storedCamelCaseMethods[exchange];

        // const reusableMethod = [
        //     `func (this *${exchange}) callEndpointAsync(endpointName string, args ...any) <-chan any {`,
        //     `   parameters := GetArg(args, 0, nil)`,
        //     `   ch := make(chan any)`,
        //     `   go func() {`,
        //     `       defer close(ch)`,
        //     `       defer func() {`,
        //     `           if r := recover(); r != nil {`,
        //     `               ch <- "panic:" + ToString(r)`,
        //     `           }`,
        //     `       }()`,
        //     `       ch <- (<-this.callEndpoint (endpointName, parameters))`,
        //     `       PanicOnError(ch)`,
        //     `   }()`,
        //     `   return ch`,
        //     `}`,
        //     ``
        // ].join('\n');

        // prediction exchanges live in their own package (ccxtprediction), so they
        // cannot access the unexported callEndpointAsync from package ccxt — use the
        // exported wrapper instead
        const callEndpoint = isPrediction ? 'CallEndpointAsync' : 'callEndpointAsync';
        // A derived exchange's core embeds its parent's core in Go
        // (`type BinanceusCore struct { BinanceCore }`), so every endpoint the parent
        // already declares is promoted onto the child receiver. Re-emitting those
        // stubs on the child adds nothing but duplication, so only emit the endpoints
        // the child actually adds. The lookup stays inside the current pass because
        // the prediction pass emits a different body (exported CallEndpointAsync).
        const parent = storedParents[exchange];
        const inherited = {};
        if (parent !== undefined && parent in storedCamelCaseMethods) {
            for (const parentMethod of storedCamelCaseMethods[parent]) {
                inherited[capitalize(parentMethod)] = true;
            }
        }
        const ownMethodNames = methodNames.filter (method => !(capitalize(method) in inherited));
        const methods = ownMethodNames.map(method=> {
            return [
                `// ${capitalize(method)} returns a channel that yields ${proseReturnShape (exchange, method)}.`,
                `func (this *${capitalize(exchange)}Core) ${capitalize(method)}(args ...any) <-chan any {`,
                `\treturn this.${callEndpoint}("${method}", args...)`,
                `}`,
                ``,
            ].join('\n')
            // return [
            //     `${IDEN}func (this *${exchange}) ${capitalize(method)} (args ...any) <-chan any {`,
            //     `${IDEN}${IDEN}parameters := GetArg(args, 0, nil)`,
            //     `${IDEN}${IDEN}return this.callEndpoint ("${method}", parameters);`,
            //     `${IDEN}}`,
            //     ``,
            // ].join('\n')
        });
        // methods.unshift (reusableMethod);
        storedGoMethods[exchange] = storedGoMethods[exchange].concat (methods)
    }
}


//-------------------------------------------------------------------------

async function editFiles (path: string, methods: Dict, extension: string) {
    const exchanges = Object.keys (storedCamelCaseMethods);
    fs.mkdirSync (path, { recursive: true });
    const files = exchanges.map (ex => path + ex + extension)
    await Promise.all (files.map ((path, idx) => writeFile (path, methods[exchanges[idx]].join ('\n') + '\n')))
    // await unlinkFiles (path, extension)
}

async function unlinkFiles (path: string, extension: string) {
    const exchanges = Object.keys (storedCamelCaseMethods);
    const abstract = fs.readdirSync (path)
    const ext = new RegExp (extension + '$')
    await Promise.all (abstract.filter (file => file !== '__init__.py' && file.match (ext) && !exchanges.includes (file.replace (ext, ''))).map (basename => unlink (path + basename)))
}

// -------------------------------------------------------------------------

async function editAPIFilesCSharp(subdir = ''){
    const exchanges = Object.keys(storedCamelCaseMethods);
    fs.mkdirSync(CSHARP_PATH + subdir, { recursive: true });
    const files = exchanges.map(ex => CSHARP_PATH + subdir + ex + '.cs');
    await Promise.all(files.map((path, idx) => writeFile(path, storedCSharpMethods[exchanges[idx]].join ('\n'))))
}

// -------------------------------------------------------------------------

async function editAPIFilesGo(subdir = ''){
    const exchanges = Object.keys(storedCamelCaseMethods);
    fs.mkdirSync(GO_PATH + subdir, { recursive: true });
    const files = exchanges.map(ex => GO_PATH + subdir + ex + '_api.go');
    await Promise.all(files.map((path, idx) => writeFile(path, storedGoMethods[exchanges[idx]].join ('\n'))))
}

async function editAPIFilesJava(subdir = ''){
    const exchanges = Object.keys(storedCamelCaseMethods);
    // The api/ dir is auto-generated and not committed (see java/.gitignore),
    // so on a fresh clone it doesn't exist yet — fs.writeFile won't create
    // the parent dir on its own. mkdir -p first so this script works whether
    // the dir is already populated (CI rebuild) or empty (first run).
    fs.mkdirSync(JAVA_PATH + subdir, { recursive: true });
    const files = exchanges.map(ex => JAVA_PATH + subdir + capitalize(ex) + 'Api.java');
    await Promise.all(files.map((path, idx) => writeFile(path, storedJavaMethods[exchanges[idx]].join ('\n'))))
}

//-------------------------------------------------------------------------

function createTypescriptHeader(instance: Exchange, parent: string){
    const exchange = instance.id;
    const basePath = isPrediction ? '../../' : '../';
    // the import list depends on which return types this exchange's methods
    // resolve to, and the method names are only known once
    // generateImplicitMethodNames has run — filled in by finalizeTypescriptImport
    const importType = '';
    let importParent: string;
    if (parent === 'Exchange') {
        // prediction-market exchanges extend PredictionExchange (which itself extends Exchange);
        // the abstract class is still named "Exchange" so `import Exchange from abstract` works
        importParent = isPrediction ?
            `import { default as _Exchange } from '${basePath}base/PredictionExchange.js';` :
            `import { Exchange as _Exchange } from '${basePath}base/Exchange.js';`
    } else {
        importParent = `import _${parent} from '${basePath}${parent}.js';`
    }
    const typescriptHeader = `interface ${parent} {`
    const typescriptFooter = `abstract class ${parent} extends _${parent} {}\n\nexport default ${parent}` // hotswap later
    storedTypeScriptMethods[exchange] = [ getPreamble (), importType, importParent, '', typescriptHeader, typescriptFooter ];
}

//-------------------------------------------------------------------------

function createPhpHeader(instance: Exchange, parent: string){
    const exchange = instance.id;
    // prediction-market exchanges are async-only and flattened: their abstract extends
    // \ccxt\prediction\PredictionExchange (itself extends the ReactPHP \ccxt\async\Exchange)
    const phpParent = (parent === 'Exchange' && isPrediction) ? '\\ccxt\\prediction\\PredictionExchange' : '\\ccxt\\' + parent;
    const phpHeader = `abstract class ${instance.id} extends ${phpParent} {`
    const phpNamespace = isPrediction ? 'ccxt\\abstract\\prediction' : 'ccxt\\abstract';
    const phpPreamble = `<?php

namespace ${phpNamespace};

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code
`
    storedPhpMethods[exchange] = [ phpPreamble, '', phpHeader ]
}

//-------------------------------------------------------------------------

function createPyHeader(instance: Exchange, parent: string){
    const exchange = instance.id;
    const pyImports = 'from ccxt.base.types import Entry'
    const pyHeader = 'class ImplicitAPI:'
    storedPyMethods[exchange] = [ pyImports, '', '', pyHeader ]
}
// -------------------------------------------------------------------------

function createCSharpHeader(exchange: Exchange, parent: string){
    const namespace = isPrediction ? 'namespace ccxt.prediction;' : 'namespace ccxt;'
    // prediction-market exchanges extend PredictionExchange (itself extends Exchange)
    const csParent = (parent === 'Exchange' && isPrediction) ? 'PredictionExchange' : parent;
    const header = `public partial class ${exchange.id} : ${csParent}\n{\n    public ${exchange.id} (object args = null): base(args) {}\n`;
    storedCSharpMethods[exchange.id] = [ getPreamble(), namespace, '', header];
}

// -------------------------------------------------------------------------

function createGoHeader(exchange: Exchange, parent: string){
    const namespace = isPrediction ? 'package ccxtprediction' : 'package ccxt'
    storedParents[exchange.id] = parent;
    storedGoMethods[exchange.id] = [ getPreamble(), namespace, ''];
}

// -------------------------------------------------------------------------

function createJavaHeader(exchange: Exchange, parent: string){
    // When the parent is another exchange, extend its untyped Core class
    // (CompletableFuture<Object> methods) — extending the typed wrapper would
    // shadow the Core signatures and break the generated typed wrapper subclass.
    // prediction-market exchanges extend PredictionExchange (itself extends Exchange)
    const baseParent = (parent === 'Exchange' && isPrediction) ? 'PredictionExchange' : parent;
    const capParent = (baseParent === 'Exchange' || baseParent === 'PredictionExchange') ? baseParent : `${capitalize(baseParent)}Core`;
    const parentImport = (baseParent === 'Exchange' || baseParent === 'PredictionExchange') ? `import io.github.ccxt.${capParent}` : `import io.github.ccxt.exchanges.${capParent}` ;
    const javaPackage = isPrediction ? 'io.github.ccxt.api.prediction' : 'io.github.ccxt.api';
    const namespace = `package ${javaPackage};\n${parentImport};`;
    const constructor = [
        `${IDEN}public ${capitalize(exchange.id)}Api () {`,
        `${IDEN}${IDEN}super();`,
        `${IDEN}}`,
        '',
        `${IDEN}public ${capitalize(exchange.id)}Api (Object options) {`,
        `${IDEN}${IDEN}super(options);`,
        `${IDEN}}`,
    ].join('\n');
    const header = `public class ${capitalize(exchange.id)}Api extends ${capParent}\n{\n`;
    storedJavaMethods[exchange.id] = [ getPreamble(), namespace, '', header, constructor, ''];
}

//-------------------------------------------------------------------------

function populateImplicitMethods(exchanges: string[]) {
    const container = isPrediction ? (ccxt as any).prediction : ccxt;
    // prediction exchanges merge REST + WS into one class (no separate prediction.pro),
    // so their WS api (if any) is already on the REST instance
    const proContainer = isPrediction ? ((ccxt as any).prediction.pro || {}) : ccxt.pro;
    for (const index in exchanges) {
        const exchange = exchanges[index];
        const exchangeClass = container[exchange]
        const instance = new exchangeClass();
        let api = instance.api
        let describing: any = instance;
        if (exchange in proContainer) {
            const proInstance = new proContainer[exchange] ()
            api = proInstance.api
            describing = proInstance;
        }
        const parent = Object.getPrototypeOf (Object.getPrototypeOf(instance)).constructor.name
        createTypescriptHeader(instance, parent);
        createPhpHeader(instance, parent);
        createCSharpHeader(instance, parent);
        createPyHeader(instance, parent);
        createGoHeader(instance, parent);
        createJavaHeader(instance, parent);

        storedCamelCaseMethods[exchange] = []
        storedCamelCaseMethods[exchange] = []
        storedUnderscoreMethods[exchange] = []
        storedContext[exchange] = []
        // The api tree this instance exposes is the deep merge of describe()
        // along its prototype chain, so the declared shapes are merged the same
        // way — over the same files, in the same order — read from the
        // TypeScript sources those describe()s live in, because a type
        // assertion leaves no runtime trace to read off the object.
        storedReturnTypes[exchange] = returnTypesOfFiles (describeSourceFiles (describing, container, proContainer))

        generateImplicitMethodNames (exchange, api)
    }

}

//-------------------------------------------------------------------------

function readOptions() {
    for (const arg of args) {
        if (arg in langKeys) {
            langKeys[arg] = true;
        }
    }
}

//-------------------------------------------------------------------------

async function generateImplicitAPIs (exchanges: string[], shouldGenerateAll: boolean, subdir = '') {

    log.bright.cyan ('Exporting TypeScript implicit api methods', subdir ? ('(' + subdir + ')') : '')
    populateImplicitMethods(exchanges); // common step for all languages

    if (shouldGenerateAll || langKeys['--ts']) {
        createImplicitMethodsTs ()
        await editFiles (TS_PATH + subdir, storedTypeScriptMethods, '.ts');
        log.bright.cyan ('TypeScript implicit api methods completed!')

    }

    if (shouldGenerateAll || langKeys['--python']) {
        createImplicitMethodsPython ()
        await editFiles (PY_PATH + subdir, storedPyMethods, '.py');
        log.bright.cyan ('Python implicit api methods completed!')

    }

    if (shouldGenerateAll || langKeys['--php']) {
        createImplicitMethodsPhp ()
        await editFiles (PHP_PATH + subdir, storedPhpMethods, '.php');
        log.bright.cyan ('PHP sync implicit api methods completed!')
        // prediction is async-only and flattened — its single abstract (php/abstract/prediction/)
        // already extends \ccxt\prediction\PredictionExchange, so skip the async-abstract derivation
        if (!isPrediction) {
            // one more time for the async php
            Object.values (storedPhpMethods).forEach (x => {
                x[0] = x[0].replace (/ccxt\\abstract/, 'ccxt\\async\\abstract');
                x[2] = x[2].replace (/ccxt\\/, 'ccxt\\async\\')
                // async Exchange::request() returns a Promise of the body, not
                // the body. PHP has no runtime generics, so the native return
                // is bare PromiseInterface (same as transpiled unified methods);
                // the shape lives in @return PromiseInterface<array|list|…>
                // for Psalm/PHPStan — parallel to TS Promise<Dict|List>.
                for (let i = 3; i < x.length; i++) {
                    x[i] = x[i].replace (/^(\s*) \* @return (.+)$/m, '$1 * @return \\React\\Promise\\PromiseInterface<$2>')
                    // methods with no prior native type still get the Promise return
                    x[i] = x[i].replace (/(public function \w+\(\$params = array\(\)) \{/g, '$1: \\React\\Promise\\PromiseInterface {')
                }
            })
            await editFiles (ASYNC_PHP_PATH + subdir, storedPhpMethods, '.php');
            log.bright.cyan ('PHP async implicit api methods completed!')
        }
    }

    if (shouldGenerateAll || langKeys['--csharp']) {
        createImplicitMethodsCSharp()
        await editAPIFilesCSharp(subdir);
        log.bright.cyan ('C# implicit api methods completed!')
    }


    if (shouldGenerateAll || langKeys['--go']) {
        createImplicitMethodsGo()
        await editAPIFilesGo(subdir)
        log.bright.cyan ('GO implicit api methods completed!')
    }

    if (shouldGenerateAll || langKeys['--java']) {
        createImplicitMethodsJava()
        await editAPIFilesJava(subdir)
        log.bright.cyan ('Java implicit api methods completed!')
    }
}

async function main() {
    readOptions();
    const shouldGenerateAll = args.length === 0;

    // const exchanges = ccxt.exchanges;

    const allExchanges = JSON.parse (fs.readFileSync("./exchanges.json", "utf8"));
    // const exchanges = ['gate', 'gateio'];

    await generateImplicitAPIs (allExchanges.ids, shouldGenerateAll);

    // second pass: prediction-market exchanges → abstract/prediction/ subfolders
    const predictionIds = allExchanges.prediction || [];
    if (predictionIds.length) {
        resetStoredMethods ();
        isPrediction = true;
        await generateImplicitAPIs (predictionIds, shouldGenerateAll, 'prediction/');
        isPrediction = false;
    }

    // await unlinkFiles (JS_PATH, '.js')
    // await unlinkFiles (JS_PATH, '.d.ts')
}

main()
