// Builds a signed-ready .mcpb desktop-extension bundle from the compiled server.
//
// Approach: stage the built js/ plus a production `npm install` of the runtime deps into
// mcpb/staging/server/, drop the manifest alongside, then `mcpb pack`. We copy node_modules
// (via npm install) rather than esbuild-bundling because ccxt has optional native deps
// (bufferutil, fflate) that resist single-file bundling — reliability over bundle size.
//
// Prereqs: run `npm run build` first (produces js/ + js/data/method-docs.json).
// Usage:   node scripts/build-mcpb.mjs   (then sign: npx @anthropic-ai/mcpb sign ccxt-mcp.mcpb)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
const staging = path.join (mcpRoot, 'mcpb', 'staging');
const serverDir = path.join (staging, 'server');
const out = path.join (mcpRoot, 'ccxt-mcp.mcpb');

const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));

function log (msg) {
    process.stderr.write ('[build-mcpb] ' + msg + '\n');
}

if (!fs.existsSync (path.join (mcpRoot, 'js', 'server.js'))) {
    log ('js/server.js not found — run `npm run build` first.');
    process.exit (1);
}

log ('cleaning staging…');
fs.rmSync (staging, { recursive: true, force: true });
fs.mkdirSync (serverDir, { recursive: true });

log ('copying compiled server (js/) …');
fs.cpSync (path.join (mcpRoot, 'js'), path.join (serverDir, 'js'), { recursive: true });

// a minimal package.json so `npm install` pulls only the runtime deps into the bundle
const serverPkg = {
    name: pkg.name,
    version: pkg.version,
    private: true,
    type: 'module',
    main: 'js/server.js',
    dependencies: pkg.dependencies,
};
fs.writeFileSync (path.join (serverDir, 'package.json'), JSON.stringify (serverPkg, null, 2) + '\n');

log ('installing production dependencies into the bundle (this pulls ccxt — a few minutes)…');
execFileSync ('npm', [ 'install', '--omit=dev', '--no-audit', '--no-fund', '--ignore-scripts' ], { cwd: serverDir, stdio: 'inherit' });

// stage the manifest with its version synced to package.json
const manifest = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'mcpb', 'manifest.json'), 'utf8'));
manifest.version = pkg.version;
fs.writeFileSync (path.join (staging, 'manifest.json'), JSON.stringify (manifest, null, 2) + '\n');

// include an icon if the maintainer has added one
const icon = path.join (mcpRoot, 'mcpb', 'icon.png');
if (fs.existsSync (icon)) {
    fs.copyFileSync (icon, path.join (staging, 'icon.png'));
}

log ('validating manifest…');
execFileSync ('npx', [ '-y', '@anthropic-ai/mcpb', 'validate', path.join (staging, 'manifest.json') ], { stdio: 'inherit' });

log ('packing → ' + path.relative (mcpRoot, out));
execFileSync ('npx', [ '-y', '@anthropic-ai/mcpb', 'pack', staging, out ], { stdio: 'inherit' });

log ('done. Sign for distribution:  npx @anthropic-ai/mcpb sign ' + path.relative (mcpRoot, out));
