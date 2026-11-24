// Pins the server the plugin downloads: writes the sha512 of a packed ccxt-mcp tarball, and
// of the single-file bundle inside it, into plugin/server.lock.json. The plugin's bootstrap
// (plugin/scripts/bootstrap.mjs) refuses to run anything that does not match these two hashes.
//
// The hashes are taken from the very .tgz file that is then handed to `npm publish <file>`,
// not from a second `npm pack` and not from the registry afterwards: what is published is,
// byte for byte, what was hashed, and the lock never trusts a value it did not compute.
//
// Usage: node scripts/lock-server.mjs <ccxt-mcp-x.y.z.tgz>   (release job, before npm publish)
//        node scripts/lock-server.mjs --clear                 (back to "no verified bundle")
//        either form takes --lock <file> to write a lock other than plugin/server.lock.json
// Needs the system `tar` (present on GitHub runners, macOS, Linux and Windows 10+).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname (fileURLToPath (import.meta.url));
const mcpRoot = path.resolve (here, '..');
// --lock <file> fills in another lock (scripts/smoke-plugin.mjs pins a scratch copy of the plugin)
const args = process.argv.slice (2);
const lockFlag = args.indexOf ('--lock');
const lockPath = (lockFlag !== -1) ? path.resolve (args.splice (lockFlag, 2)[1] ?? '') : path.join (mcpRoot, 'plugin', 'server.lock.json');
// keep in sync with BUNDLE_ENTRY in plugin/scripts/bootstrap.mjs
const BUNDLE_ENTRY = 'package/js/bundle/ccxt-mcp.mjs';

function fail (message) {
    process.stderr.write (`[lock-server] ${message}\n`);
    process.exit (1);
}

const sha512 = (buffer) => 'sha512-' + crypto.createHash ('sha512').update (buffer).digest ('base64');

const pkg = JSON.parse (fs.readFileSync (path.join (mcpRoot, 'package.json'), 'utf8'));
const lockName = (lockFlag !== -1) ? lockPath : 'plugin/server.lock.json';
const lock = JSON.parse (fs.readFileSync (lockPath, 'utf8'));
const argument = args[0];

if (argument === '--clear') {
    lock.integrity = null;
    lock.bundleIntegrity = null;
} else {
    if (argument === undefined || !fs.existsSync (argument)) {
        fail ('usage: node scripts/lock-server.mjs <packed tarball> | --clear');
    }
    if (lock.version !== pkg.version) {
        fail (`${lockName} is at ${lock.version} but package.json is at ${pkg.version} — run "npm run sync-versions" first`);
    }
    const expectedName = `${pkg.name}-${pkg.version}.tgz`;
    if (path.basename (argument) !== expectedName) {
        fail (`expected a tarball named ${expectedName}, got ${path.basename (argument)}`);
    }
    const listing = spawnSync ('tar', [ '-tzf', argument ], { 'encoding': 'utf8', 'maxBuffer': 64 * 1024 * 1024 });
    if (listing.status !== 0) {
        fail ('tar could not list the tarball: ' + (listing.stderr || listing.error));
    }
    if (!listing.stdout.split ('\n').includes (BUNDLE_ENTRY)) {
        fail (`the tarball has no ${BUNDLE_ENTRY} — run "npm run build" before packing`);
    }
    const extracted = spawnSync ('tar', [ '-xOzf', argument, BUNDLE_ENTRY ], { 'maxBuffer': 256 * 1024 * 1024 });
    if (extracted.status !== 0 || extracted.stdout.length === 0) {
        fail ('tar could not read the bundle out of the tarball: ' + (extracted.stderr || extracted.error));
    }
    lock.integrity = sha512 (fs.readFileSync (argument));
    lock.bundleIntegrity = sha512 (extracted.stdout);
}

fs.writeFileSync (lockPath, JSON.stringify (lock, null, 2) + '\n');
process.stderr.write (`[lock-server] ${lockName}: ${lock.version} integrity ${lock.integrity} bundleIntegrity ${lock.bundleIntegrity}\n`);
