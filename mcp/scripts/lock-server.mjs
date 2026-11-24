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
// The tarball is read here, with zlib and the few lines of tar below, and not by the system
// `tar`: which one that is depends on the machine (GNU tar in Git Bash on Windows takes
// "C:\…" for a remote host, and a tar that writes to a console may translate line endings),
// and a hash must not depend on the machine it was computed on.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
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

function field (block, start, length) {
    const slice = block.subarray (start, start + length);
    const end = slice.indexOf (0);
    return slice.subarray (0, (end === -1) ? slice.length : end).toString ('utf8');
}

// Every regular file in a (gunzipped) tar archive as [ name, contents ]. npm writes plain
// ustar entries, with a pax header before an entry whose name does not fit; both are read,
// and anything this does not understand stops the release instead of being guessed at.
function tarFiles (archive) {
    const files = [];
    let offset = 0;
    let longName;
    while (offset + 512 <= archive.length) {
        const header = archive.subarray (offset, offset + 512);
        if (header.every ((byte) => byte === 0)) {
            break;
        }
        const sizeText = field (header, 124, 12).trim ();
        if (!/^[0-7]*$/.test (sizeText)) {
            fail ('the tarball has an entry whose size this script cannot read');
        }
        const size = parseInt (sizeText || '0', 8);
        const type = String.fromCharCode (header[156] || 0x30);
        const data = archive.subarray (offset + 512, offset + 512 + size);
        if (data.length !== size) {
            fail ('the tarball is truncated');
        }
        offset += 512 + Math.ceil (size / 512) * 512;
        if (type === 'x') {
            // pax records are "<length> <key>=<value>\n"
            const record = /(?:^|\n)\d+ path=([^\n]*)\n/.exec (data.toString ('utf8'));
            longName = (record === null) ? longName : record[1];
            continue;
        }
        if (type === 'L') {
            longName = field (data, 0, data.length);
            continue;
        }
        if (type === 'g') {
            continue;
        }
        const prefix = field (header, 345, 155);
        const name = longName ?? ((prefix !== '' && field (header, 257, 5) === 'ustar') ? prefix + '/' + field (header, 0, 100) : field (header, 0, 100));
        longName = undefined;
        if (type === '0') {
            files.push ([ name, Buffer.from (data) ]);
        }
    }
    return files;
}

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
    const tarball = fs.readFileSync (argument);
    let archive;
    try {
        archive = zlib.gunzipSync (tarball);
    } catch (error) {
        fail ('the tarball could not be unpacked: ' + error.message);
    }
    const bundles = tarFiles (archive).filter (([ name ]) => name === BUNDLE_ENTRY);
    if (bundles.length === 0) {
        fail (`the tarball has no ${BUNDLE_ENTRY} — run "npm run build" before packing`);
    }
    // the plugin's bootstrap refuses an archive that holds the server twice
    if (bundles.length > 1 || bundles[0][1].length === 0) {
        fail (`the tarball holds ${BUNDLE_ENTRY} ${bundles.length} times, or empty`);
    }
    lock.integrity = sha512 (tarball);
    lock.bundleIntegrity = sha512 (bundles[0][1]);
}

fs.writeFileSync (lockPath, JSON.stringify (lock, null, 2) + '\n');
process.stderr.write (`[lock-server] ${lockName}: ${lock.version} integrity ${lock.integrity} bundleIntegrity ${lock.bundleIntegrity}\n`);
