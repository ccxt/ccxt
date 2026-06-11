// Codemod: migrate imports of bundled paulmillr packages (ts/src/static_dependencies/{noble-*,scure-*})
// to the pinned npm packages @noble/curves@2.2.0, @noble/hashes@2.2.0, @scure/{base,bip32,bip39,starknet}@2.2.0.
//
// Handles the v2 renames:
//   noble-hashes: sha256.js/sha512.js -> sha2.js, sha1.js/md5.js/ripemd160.js -> legacy.js
//   noble-curves: p256.js -> nist.js (P256 -> p256), abstract/utils.js -> utils.js
//   noble-curves types: CurveFn (weierstrass) -> ECDSA, CurveFn (edwards) -> EdDSA, SignatureType -> ECDSASignature
//   scure-base: ccxt's patched lowercase `base16` -> upstream `hex` coder (aliased back to base16)
//
// Usage: node build/migrate-noble-scure-v2.mjs

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname (url.fileURLToPath (import.meta.url));
const root = path.join (__dirname, '..');
const tsDir = path.join (root, 'ts');

const removedDirs = [ 'noble-curves', 'noble-hashes', 'scure-base', 'scure-bip32', 'scure-bip39', 'scure-starknet' ];

function isInsideRemovedDir (filePath) {
    return removedDirs.some ((dir) => filePath.includes (path.join ('static_dependencies', dir) + path.sep));
}

function* walk (dir) {
    for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
        const full = path.join (dir, entry.name);
        if (entry.isDirectory ()) {
            yield* walk (full);
        } else if (entry.isFile () && full.endsWith ('.ts')) {
            yield full;
        }
    }
}

// maps an old specifier subpath (after the package dir name) to a new npm specifier
function mapSpecifier (pkg, sub) {
    sub = sub.replace (/\.js$/, '') + '.js'; // normalize missing .js extensions
    switch (pkg) {
        case 'noble-hashes': {
            const base = sub.replace (/\.js$/, '');
            if (base === 'sha256' || base === 'sha512') return '@noble/hashes/sha2.js';
            if (base === 'sha1' || base === 'md5' || base === 'ripemd160') return '@noble/hashes/legacy.js';
            return `@noble/hashes/${base}.js`;
        }
        case 'noble-curves': {
            const base = sub.replace (/\.js$/, '');
            if (base === 'p256') return '@noble/curves/nist.js';
            if (base === 'abstract/utils') return '@noble/curves/utils.js';
            return `@noble/curves/${base}.js`;
        }
        case 'scure-base':
            return '@scure/base';
        case 'scure-bip32':
            return '@scure/bip32';
        case 'scure-bip39': {
            const base = sub.replace (/\.js$/, '');
            if (base === 'index') return '@scure/bip39';
            return `@scure/bip39/${base}.js`; // e.g. wordlists/english.js
        }
        case 'scure-starknet':
            return '@scure/starknet';
        default:
            return null;
    }
}

const specifierRe = /(from\s+|import\s*\(\s*)(['"])([^'"]+)\2/g;
const oldPathRe = /^(?:[./]+|.*static_dependencies\/)(noble-curves|noble-hashes|scure-base|scure-bip32|scure-bip39|scure-starknet)\/(.+)$|^(?:[./]+|.*static_dependencies\/)(noble-curves|noble-hashes|scure-base|scure-bip32|scure-bip39|scure-starknet)$/;

function rewriteNamedImports (source, newSpecifier, line) {
    // symbol-level renames, applied per import statement
    if (newSpecifier === '@noble/curves/nist.js') {
        line = line.replace (/\bP256\b(?!\s+as)/, 'p256 as P256');
    }
    if (newSpecifier === '@scure/base') {
        // ccxt's bundled base16 was patched to lowercase hex - upstream `hex` coder matches it
        line = line.replace (/\bbase16(\s+as\s+\w+)?\b/, (m, alias) => (alias ? `hex${alias}` : 'hex as base16'));
    }
    if (newSpecifier === '@noble/curves/abstract/weierstrass.js') {
        line = line.replace (/\bCurveFn(?!\s+as)\b/, 'ECDSA as CurveFn');
        line = line.replace (/\bCurveFn\s+as\s+(\w+)/, 'ECDSA as $1');
        line = line.replace (/\bSignatureType(?!\s+as)\b/, 'ECDSASignature as SignatureType');
        line = line.replace (/\bSignatureType\s+as\s+(\w+)/, 'ECDSASignature as $1');
    }
    if (newSpecifier === '@noble/curves/abstract/edwards.js') {
        line = line.replace (/\bCurveFn(?!\s+as)\b/, 'EdDSA as CurveFn');
        line = line.replace (/\bCurveFn\s+as\s+(\w+)/, 'EdDSA as $1');
    }
    return line;
}

let changedFiles = 0;
for (const file of walk (tsDir)) {
    if (isInsideRemovedDir (file)) continue;
    const original = fs.readFileSync (file, 'utf8');
    const lines = original.split ('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!/(noble-curves|noble-hashes|scure-base|scure-bip32|scure-bip39|scure-starknet)/.test (line)) continue;
        let newLine = line.replace (specifierRe, (full, prefix, quote, spec) => {
            const m = spec.match (oldPathRe);
            if (!m) return full;
            const pkg = m[1] || m[3];
            const sub = m[2] || 'index.js';
            const mapped = mapSpecifier (pkg, sub);
            if (!mapped) return full;
            return `${prefix}${quote}${mapped}${quote}`;
        });
        if (newLine !== line) {
            const specMatch = newLine.match (/from\s+['"]([^'"]+)['"]/);
            if (specMatch) {
                newLine = rewriteNamedImports (original, specMatch[1], newLine);
            }
            lines[i] = newLine;
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync (file, lines.join ('\n'));
        changedFiles += 1;
        console.log ('updated', path.relative (root, file));
    }
}
console.log (`done: ${changedFiles} files updated`);
