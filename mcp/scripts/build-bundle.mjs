// Builds js/bundle/ccxt-mcp.mjs: the whole server (ccxt, the MCP SDK, zod, the view files,
// the method documentation and the version) as ONE self-contained ES module.
//
// Why it exists: the plugin (plugin/scripts/bootstrap.mjs) has to start the server on machines
// with no npm at all — the ChatGPT desktop app ships a Node binary but no package manager —
// so there is nothing that could install node_modules. The bootstrap downloads the npm
// tarball, verifies it and extracts exactly this one file, which must therefore need nothing
// beside it at runtime.
//
// The bundle redistributes other people's code (ccxt, the MCP SDK, protobufjs, …) and their
// licences require the copyright notice and licence text to travel with it. So this script
// also writes THIRD_PARTY_LICENSES.txt beside the bundle, from the list of files esbuild
// actually put into it, and refuses to produce a bundle it cannot write the notices for.
//
// Prereq: `tsc` + copy-ui + build-doc-manifest have produced js/ (this is the last build step).
// Usage:  node scripts/build-bundle.mjs [--out <file>] [--metafile <file>]
//   --metafile  also write esbuild's metafile there (the bundle test checks the notices
//               against it)
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
const metaFlag = process.argv.indexOf ('--metafile');
const metaFile = (metaFlag !== -1 && process.argv[metaFlag + 1]) ? path.resolve (process.argv[metaFlag + 1]) : undefined;
// keep in sync with NOTICES_ENTRY in plugin/scripts/bootstrap.mjs, which caches it beside the bundle
const NOTICES_NAME = 'THIRD_PARTY_LICENSES.txt';
const noticesFile = path.join (path.dirname (outFile), NOTICES_NAME);
const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
// ccxt-mcp's own licence: a copy of the repository's LICENSE.txt, shipped in the npm package
const ownLicenseFile = path.join (mcpRoot, 'LICENSE');

function fail (message) {
    process.stderr.write (`[build-bundle] ${message}\n`);
    process.exit (1);
}

if (!fs.existsSync (entry)) {
    fail ('js/server.js not found — run `npm run build` (or tsc) first');
}
if (!fs.existsSync (ownLicenseFile)) {
    fail ('mcp/LICENSE not found — it is ccxt-mcp\'s own licence and has to ship with the bundle');
}

// every file the unbundled server reads from its own directory at runtime, keyed the way
// ts/embedded.ts readAsset () names them
function collectAssets () {
    const assets = { 'version': pkg.version };
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
    // the metafile names its inputs relative to this directory, wherever the script is run from
    'absWorkingDir': mcpRoot,
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
            // the first thing anyone opening the file sees: whose it is and where the
            // licences of everything else inside it are ('legalComments' is off below
            // because the notices file carries the complete texts instead of scattered
            // fragments of them)
            '// ccxt-mcp ' + pkg.version + ' — the CCXT MCP server as a single file. MIT License, ' + ownCopyrightLine () + '.',
            '// This file contains third-party software. Its copyright notices and licence texts are in',
            '// ' + NOTICES_NAME + ', distributed beside this file (js/bundle/' + NOTICES_NAME + ' in the ccxt-mcp npm package).',
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
    fs.rmSync (noticesFile, { 'force': true });
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

// ---------------------------------------------------------------------------------------
// third-party licence notices

// A bundled npm package that ships no licence text at all. Empty today, and meant to stay
// nearly so: an entry is a decision someone made after reading the package's terms, with
// the reason written next to it — { '<package name>': '<why the bundle may still carry it>' }.
const PACKAGES_WITHOUT_LICENCE_TEXT = {};

// Modules ccxt vendors under js/src/static_dependencies that come without a licence FILE.
// They are listed in the notices file as exactly that, and a module that is not named here
// fails the build, so a newly vendored one cannot slip into a release unexamined.
const VENDORED_WITHOUT_LICENCE_FILE = {
    // protobuf codecs generated by @osmonauts/telescope from the dYdX v4 and Cosmos SDK
    // .proto files, plus a copy of long.js whose Apache-2.0 header is in the file itself
    // (collected below; the full Apache-2.0 text is in the notices through the "long" package)
    'dydx-v4-client': 'generated protobuf codecs and a copy of long.js; ccxt ships no licence file with them',
    // wasm-bindgen glue of the zkLink SDK
    'zklink': 'wasm-bindgen glue of the zkLink SDK; ccxt ships no licence file with it',
};

const LICENCE_FILE = /^(licen[cs]e|copying|notice|copyright)([-_.].*)?$/i;
// a comment that states terms: kept verbatim, because 'legalComments' drops it from the bundle
const LICENCE_COMMENT = /@license|@preserve|SPDX-License-Identifier|licensed under|\bcopyright\b/i;

function ownCopyrightLine () {
    const line = fs.readFileSync (ownLicenseFile, 'utf8').split ('\n').find ((text) => /^copyright/i.test (text.trim ()));
    if (line === undefined) {
        fail ('mcp/LICENSE has no copyright line');
    }
    return line.trim ();
}

function licenceFilesIn (directory) {
    return fs.readdirSync (directory, { 'withFileTypes': true })
        .filter ((file) => file.isFile () && LICENCE_FILE.test (file.name))
        .map ((file) => file.name)
        .sort ();
}

function licenceFilesBelow (directory) {
    const found = [];
    for (const file of fs.readdirSync (directory, { 'withFileTypes': true })) {
        const full = path.join (directory, file.name);
        if (file.isDirectory ()) {
            found.push (...licenceFilesBelow (full));
        } else if (file.isFile () && LICENCE_FILE.test (file.name)) {
            found.push (full);
        }
    }
    return found.sort ();
}

function licenceComments (file) {
    const comments = fs.readFileSync (file, 'utf8').match (/\/\*[\s\S]*?\*\//g) ?? [];
    return comments.filter ((comment) => LICENCE_COMMENT.test (comment));
}

// the npm package a bundled file belongs to: the directory after the LAST node_modules/ in
// its path. (The nearest package.json would be wrong — packages keep stub ones, like
// {"type":"module"}, in their dist folders.) A file outside node_modules is ccxt-mcp's own.
function packageRootOf (file) {
    const marker = path.sep + 'node_modules' + path.sep;
    const at = file.lastIndexOf (marker);
    if (at === -1) {
        return undefined;
    }
    const parts = file.slice (at + marker.length).split (path.sep);
    const name = parts[0].startsWith ('@') ? parts.slice (0, 2) : parts.slice (0, 1);
    return path.join (file.slice (0, at + marker.length), ...name);
}

function describeLicence (manifest) {
    if (typeof manifest.license === 'string') {
        return manifest.license;
    }
    if (manifest.license && typeof manifest.license.type === 'string') {
        return manifest.license.type;
    }
    if (Array.isArray (manifest.licenses)) {
        return manifest.licenses.map ((entry) => entry.type ?? String (entry)).join (' OR ');
    }
    return undefined;
}

// Returns the text of THIRD_PARTY_LICENSES.txt for the files esbuild put into the bundle.
function thirdPartyNotices (bundledFiles) {
    const problems = [];
    const packages = new Map (); // package root → the bundled files under it
    for (const file of bundledFiles) {
        const root = packageRootOf (file);
        if (root === undefined) {
            if (path.relative (mcpRoot, file).startsWith ('..')) {
                problems.push (file + ' is in the bundle but belongs to no package this script can name');
            }
            continue;
        }
        packages.set (root, (packages.get (root) ?? []).concat ([ file ]));
    }
    const entries = [];
    const vendored = new Map (); // "<package> / <module>" → { directory, files }
    for (const [ root, files ] of packages) {
        const manifest = JSON.parse (fs.readFileSync (path.join (root, 'package.json'), 'utf8'));
        const licence = describeLicence (manifest);
        const texts = licenceFilesIn (root).map ((name) => ({ name, 'text': fs.readFileSync (path.join (root, name), 'utf8') }));
        if (texts.length === 0 && PACKAGES_WITHOUT_LICENCE_TEXT[manifest.name] === undefined) {
            problems.push (manifest.name + '@' + manifest.version + ' (' + (licence ?? 'no licence declared') + ') ships no LICENSE / COPYING / NOTICE file');
        }
        if (licence === undefined) {
            problems.push (manifest.name + '@' + manifest.version + ' declares no licence in its package.json');
        }
        const repository = (typeof manifest.repository === 'string') ? manifest.repository : manifest.repository?.url;
        entries.push ({ 'name': manifest.name, 'version': manifest.version, licence, 'source': manifest.homepage ?? repository, texts, 'exception': PACKAGES_WITHOUT_LICENCE_TEXT[manifest.name] });
        for (const file of files) {
            const parts = path.relative (root, file).split (path.sep);
            const at = parts.indexOf ('static_dependencies');
            if (at !== -1 && parts.length > at + 2) {
                const key = manifest.name + ' / ' + parts[at + 1];
                const module_ = vendored.get (key) ?? { 'package': manifest.name, 'name': parts[at + 1], 'directory': path.join (root, ...parts.slice (0, at + 2)), 'files': [] };
                module_.files.push (file);
                vendored.set (key, module_);
            }
        }
    }
    entries.sort ((a, b) => ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0)));
    const vendoredEntries = [ ...vendored.values () ].sort ((a, b) => ((a.name < b.name) ? -1 : 1)).map ((module_) => {
        const files = licenceFilesBelow (module_.directory).map ((file) => ({ 'name': path.relative (module_.directory, file), 'text': fs.readFileSync (file, 'utf8') }));
        const comments = [];
        for (const file of module_.files.sort ()) {
            for (const comment of licenceComments (file)) {
                comments.push ({ 'name': path.relative (module_.directory, file), 'text': comment });
            }
        }
        if (files.length === 0 && VENDORED_WITHOUT_LICENCE_FILE[module_.name] === undefined) {
            problems.push ('the module "' + module_.name + '" vendored inside ' + module_.package + ' (static_dependencies) has no licence file and is not listed in VENDORED_WITHOUT_LICENCE_FILE');
        }
        return { ...module_, 'licenceFiles': files, comments };
    });
    if (problems.length > 0) {
        reject ('cannot write the third-party licence notices:\n  - ' + problems.join ('\n  - ') + '\nFind the licence of each one. Then either get its text into the package, or — only if the bundle may carry it without — add it to the allow-list at the top of this section with the reason.');
    }
    const rule = '='.repeat (80);
    const dash = '-'.repeat (80);
    const lines = [
        'THIRD-PARTY SOFTWARE NOTICES',
        '',
        'ccxt-mcp ' + pkg.version + ' — single-file server (ccxt-mcp.mjs)',
        '',
        'ccxt-mcp itself is distributed under the MIT License:',
        '',
        fs.readFileSync (ownLicenseFile, 'utf8').trim (),
        '',
        'The single-file server also contains code from the ' + entries.length + ' npm packages listed below. This file',
        'was generated when the bundle was built, from the list of source files that went into',
        'it, and reproduces the licence files each of those packages ships.',
        '',
        'PACKAGES',
        '',
        ...entries.map ((entry) => '- ' + entry.name + '@' + entry.version + ' (' + entry.licence + ')'),
        '',
    ];
    if (vendoredEntries.length > 0) {
        lines.push ('VENDORED CODE', '');
        lines.push ('Some of those packages carry copies of other projects in their own source tree. The ones');
        lines.push ('with code in this bundle are named here, with whatever licence text came with them.', '');
        for (const module_ of vendoredEntries) {
            const without = module_.licenceFiles.length === 0;
            lines.push ('- ' + module_.name + ' (inside ' + module_.package + ', ' + module_.files.length + ((module_.files.length === 1) ? ' file' : ' files') + ' in the bundle): '
                + (without ? 'NO SEPARATE LICENCE TEXT is shipped with it' : 'licence file(s): ' + module_.licenceFiles.map ((file) => file.name).join (', '))
                + ((module_.comments.length > 0) ? '; licence notices found in its source: ' + [ ...new Set (module_.comments.map ((comment) => comment.name)) ].join (', ') : (without ? ', and its source files carry no licence notice' : ''))
                + (without ? ' — ' + VENDORED_WITHOUT_LICENCE_FILE[module_.name] + '. It reaches this bundle as part of ' + module_.package + ', whose own licence is reproduced below; no licence statement specific to it was found.' : ''));
        }
        lines.push ('');
    }
    for (const entry of entries) {
        lines.push (rule, entry.name + '@' + entry.version, 'License: ' + entry.licence);
        if (entry.source !== undefined) {
            lines.push ('Source: ' + entry.source);
        }
        lines.push (rule, '');
        if (entry.texts.length === 0) {
            lines.push ('This package ships no licence text. ' + entry.exception, '');
        }
        for (const text of entry.texts) {
            lines.push (dash, entry.name + ' — ' + text.name, dash, '', text.text.replace (/\r\n/g, '\n').trim (), '');
        }
        for (const module_ of vendoredEntries.filter ((candidate) => candidate.package === entry.name)) {
            for (const text of [ ...module_.licenceFiles, ...module_.comments ]) {
                lines.push (dash, entry.name + ' — vendored ' + module_.name + ' — ' + text.name, dash, '', text.text.replace (/\r\n/g, '\n').trim (), '');
            }
        }
    }
    return { 'text': lines.join ('\n'), 'packages': entries.length, 'vendored': vendoredEntries.length };
}

// only what contributed bytes: a file esbuild read and then tree-shook away is not distributed
const bundledFiles = Object.entries (output.inputs)
    .filter (([ , input ]) => input.bytesInOutput > 0)
    .map (([ file ]) => path.resolve (mcpRoot, file));
const notices = thirdPartyNotices (bundledFiles);
fs.writeFileSync (noticesFile, notices.text);
if (metaFile !== undefined) {
    fs.writeFileSync (metaFile, JSON.stringify (result.metafile));
}

const megabytes = (fs.statSync (outFile).size / (1024 * 1024)).toFixed (2);
process.stderr.write (`[build-bundle] wrote ${path.relative (mcpRoot, outFile)} (${megabytes} MB)\n`);
process.stderr.write (`[build-bundle] wrote ${path.relative (mcpRoot, noticesFile)} (${notices.packages} packages, ${notices.vendored} vendored modules)\n`);
