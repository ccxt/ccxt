// Builds js/bundle/ccxt-mcp.mjs: the whole server (ccxt, the MCP SDK, zod, the view files,
// the method documentation and the version) as ONE self-contained ES module.
//
// Why it exists: the plugin (plugin/scripts/bootstrap.mjs) has to start the server on machines
// with no npm at all — the ChatGPT desktop app ships a Node binary but no package manager —
// so there is nothing that could install node_modules. The bootstrap downloads the npm
// tarball, verifies it and extracts exactly this one file, which must therefore need nothing
// beside it at runtime.
//
// Prereq: `tsc` + copy-ui + build-doc-manifest have produced js/ (this is the last build step).
// Usage:  node scripts/build-bundle.mjs [--out <file>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const jsDir = path.join (mcpRoot, 'js');
const entry = path.join (jsDir, 'server.js');
// keep in sync with BUNDLE_ENTRY in plugin/scripts/bootstrap.mjs ("package/" + this path);
// --out <file> writes elsewhere (the bundle smoke test builds into a temporary directory)
const outFlag = process.argv.indexOf ('--out');
const outFile = (outFlag !== -1 && process.argv[outFlag + 1]) ? path.resolve (process.argv[outFlag + 1]) : path.join (jsDir, 'bundle', 'ccxt-mcp.mjs');

function fail (message) {
    process.stderr.write (`[build-bundle] ${message}\n`);
    process.exit (1);
}

if (!fs.existsSync (entry)) {
    fail ('js/server.js not found — run `npm run build` (or tsc) first');
}

// every file the unbundled server reads from its own directory at runtime, keyed the way
// ts/embedded.ts readAsset () names them
function collectAssets () {
    const assets = { 'version': JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8')).version };
    const uiDir = path.join (jsDir, 'ui');
    const uiFiles = fs.existsSync (uiDir) ? fs.readdirSync (uiDir).filter ((file) => /\.(html|css|js)$/.test (file)).sort () : [];
    if (uiFiles.length === 0) {
        fail ('js/ui is empty — run `node scripts/copy-ui.mjs` first');
    }
    for (const file of uiFiles) {
        assets['ui/' + file] = fs.readFileSync (path.join (uiDir, file), 'utf8');
    }
    // the manifest is only generated inside the ccxt monorepo (see build-doc-manifest.mjs);
    // without it the bundle behaves like an npm install without it: runtime introspection
    const docs = path.join (jsDir, 'data', 'method-docs.json');
    if (fs.existsSync (docs)) {
        assets['data/method-docs.json'] = fs.readFileSync (docs, 'utf8');
    } else {
        process.stderr.write ('[build-bundle] js/data/method-docs.json not found — describe_method will use runtime introspection in the bundle\n');
    }
    return assets;
}

// replaces js/embedded.js (the file-reading implementation) with one that answers from a
// map baked into the bundle — same exports, see ts/embedded.ts for the contract
const embedAssets = {
    'name': 'ccxt-mcp-embed-assets',
    setup (pluginBuild) {
        pluginBuild.onLoad ({ 'filter': /[\\/]js[\\/]embedded\.js$/ }, (args) => {
            if (path.resolve (args.path) !== path.join (jsDir, 'embedded.js')) {
                return undefined;
            }
            const contents = [
                'const EMBEDDED = ' + JSON.stringify (collectAssets ()) + ';',
                'function missing (name) {',
                '    const error = new Error ("ENOENT: asset is not part of this bundle: " + name);',
                '    error.code = "ENOENT";',
                '    return error;',
                '}',
                'export function readAsset (name) {',
                '    if (!Object.prototype.hasOwnProperty.call (EMBEDDED, name)) {',
                '        throw missing (name);',
                '    }',
                '    return EMBEDDED[name];',
                '}',
                'export function hasAsset (name) {',
                '    return Object.prototype.hasOwnProperty.call (EMBEDDED, name);',
                '}',
                'export function packageVersion () {',
                '    return EMBEDDED.version;',
                '}',
            ].join ('\n');
            return { contents, 'loader': 'js' };
        });
    },
};

// ccxt looks for the optional proxy-agent packages with `import (moduleName)`. Node resolves
// a bare specifier from the bundle's place on disk, through the node_modules of every
// ancestor directory (~/node_modules, C:\node_modules, …) — code the bootstrap's checksum
// does not cover, running in the process that holds the API keys. The packages cannot be
// there legitimately (nothing installs beside the bundle), so the lookup is turned into the
// failure ccxt already handles: "module not installed".
const DYNAMIC_IMPORT = /const dynamicImport = async \(moduleName\) => await import\((?:\s*\/\*[^*]*\*\/)*\s*moduleName\);/;
let sealedDynamicImport = false;
const sealDynamicImport = {
    'name': 'ccxt-mcp-seal-dynamic-import',
    setup (pluginBuild) {
        pluginBuild.onLoad ({ 'filter': /[\\/]ccxt[\\/]js[\\/]src[\\/]base[\\/]Exchange\.js$/ }, (args) => {
            const source = fs.readFileSync (args.path, 'utf8');
            if (!DYNAMIC_IMPORT.test (source)) {
                return undefined; // the scan of the output below decides whether that is a problem
            }
            sealedDynamicImport = true;
            const sealed = 'const dynamicImport = async (moduleName) => { throw new Error (moduleName + " is not part of the single-file ccxt-mcp server"); };';
            return { 'contents': source.replace (DYNAMIC_IMPORT, () => sealed), 'loader': 'js' };
        });
    },
};

const result = await build ({
    'entryPoints': [ entry ],
    'outfile': outFile,
    'bundle': true,
    'platform': 'node',
    'format': 'esm', // the server uses top-level await (ccxt-loader), which CommonJS cannot express
    'target': 'node18',
    'plugins': [ embedAssets, sealDynamicImport ],
    // ws (CommonJS) accelerates frame masking with these native addons when they are
    // installed and falls back to pure JS when require () throws. A native .node file cannot
    // live inside a single-file bundle, so they stay external and the bundle's require ()
    // (below) refuses them: ws takes its JS path, as on a machine without a compiler.
    'external': [ 'bufferutil', 'utf-8-validate' ],
    // ccxt's CommonJS dependencies (ws, protobufjs, …) call require ('events') and friends.
    // An ES module has no require, and esbuild's stand-in throws "Dynamic require of … is not
    // supported", so give the bundle one — for Node's builtins ONLY. A plain createRequire ()
    // would also resolve packages from every node_modules above the bundle (see
    // sealDynamicImport), and whatever it found there would run unverified.
    'banner': {
        'js': [
            'import * as __ccxtMcpModule from \'node:module\';',
            'const __ccxtMcpRequire = __ccxtMcpModule.createRequire (import.meta.url);',
            // isBuiltin () is missing before Node 18.6; the list it replaces there carries the
            // prefix-only builtins with their prefix ("node:test")
            'const __ccxtMcpBuiltins = __ccxtMcpModule.isBuiltin || ((name) => __ccxtMcpModule.builtinModules.includes (name) || (name.startsWith (\'node:\') && __ccxtMcpModule.builtinModules.includes (name.slice (5))));',
            'const require = (name) => {',
            '    if (typeof name !== \'string\' || !__ccxtMcpBuiltins (name)) {',
            '        const error = new Error (\'Cannot find module \' + JSON.stringify (name) + \': the single-file ccxt-mcp server loads nothing from disk\');',
            '        error.code = \'MODULE_NOT_FOUND\';',
            '        throw error;',
            '    }',
            '    return __ccxtMcpRequire (name);',
            '};',
        ].join ('\n'),
    },
    // whitespace + syntax only: identifiers are left alone because ccxt resolves exchange
    // classes, error classes and unified methods by name at runtime
    'minifyWhitespace': true,
    'minifySyntax': true,
    'legalComments': 'none',
    'metafile': true,
    'logLevel': 'warning',
});

function reject (message) {
    fs.rmSync (outFile, { 'force': true });
    fail (message);
}

// "nothing beside it" is the whole point, so make a regression loud: anything that is not a
// node builtin or one of the two optional native addons would be a runtime import that fails
// on a machine without node_modules
const allowed = new Set ([ 'bufferutil', 'utf-8-validate' ]);
const output = Object.values (result.metafile.outputs)[0];
const leaked = output.imports
    .filter ((entry_) => entry_.external)
    .map ((entry_) => entry_.path)
    .filter ((specifier) => !specifier.startsWith ('node:') && !allowed.has (specifier));
const builtins = new Set ((await import ('node:module')).builtinModules);
const unexpected = [ ...new Set (leaked.filter ((specifier) => !builtins.has (specifier))) ];
if (unexpected.length > 0) {
    reject ('the bundle would import ' + unexpected.join (', ') + ' at runtime — bundle it or guard it');
}

// The metafile only knows imports whose specifier is a literal. One computed at runtime
// (`import (name)`) is invisible to it and is resolved by Node from disk, so the output
// itself is searched. The single one allowed is ccxt's loadLighterLibrary (), which imports
// the wasm_exec.js whose absolute path the user wrote into the exchange options.
const ALLOWED_COMPUTED_IMPORTS = [ 'import(filePathToFileUrlForWindows' ];
const computed = (fs.readFileSync (outFile, 'utf8').match (/\bimport\s*\(\s*(?!["'`])[^)]{0,80}/g) ?? [])
    .map ((found) => found.replace (/\s+/g, ''))
    .filter ((found) => !ALLOWED_COMPUTED_IMPORTS.some ((prefix) => found.startsWith (prefix)));
if (computed.length > 0) {
    reject ('the bundle would resolve a module from disk at runtime: ' + [ ...new Set (computed) ].join (', ') + (sealedDynamicImport ? '' : ' — ccxt\'s dynamicImport () no longer has the shape sealDynamicImport expects') + ' — bundle it or seal it');
}

const megabytes = (fs.statSync (outFile).size / (1024 * 1024)).toFixed (2);
process.stderr.write (`[build-bundle] wrote ${path.relative (mcpRoot, outFile)} (${megabytes} MB)\n`);
