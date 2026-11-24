// Starts the CCXT MCP server for the plugin on machines that have a Node runtime but no npm.
//
// The ChatGPT desktop app / Codex ship a Node binary and nothing else: no npm, no npx, so
// `npx -y ccxt-mcp` cannot work there. scripts/launch finds that Node and runs this file,
// which gets the server as ONE file (the bundle published inside the ccxt-mcp npm tarball),
// verifies it and imports it into this process.
//
// Order:
//   1. CCXT_MCP_SERVER  absolute path of a local server entry (development / testing)
//   2. the bundle cached for the pinned version, if it still matches the lock
//   3. download the pinned tarball (picking up where a start that was cut short stopped),
//      verify it against ../server.lock.json, extract the bundle (and, when the release
//      has one, the third-party licence notices that belong beside it)
//   4. `npx -y ccxt-mcp@<version>` when the pinned release has no verified bundle, or the
//      download is not possible (offline, proxy) — npm then does its own integrity checks
//   5. one sentence on stderr saying what to do, and a non-zero exit
//
// Rules this file must keep:
//   - stdout is the MCP JSON-RPC channel: never write to it, never read stdin. Diagnostics
//     go to stderr only.
//   - nothing that failed verification is ever executed or stored under the name the cache
//     is read from. An unfinished download is kept beside it as a ".part" file, which is
//     only ever hashed, never run.
//   - what is executed is the bytes that were hashed: the server is imported from a private
//     copy written from the verified buffer, never from a path that is read a second time.
//   - no dependencies and no syntax newer than Node 18: there is no node_modules here.
//   - no network when the cache is warm.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PACKAGE = 'ccxt-mcp';
// where scripts/build-bundle.mjs puts the bundle, as the path reads inside an npm tarball
const BUNDLE_ENTRY = 'package/js/bundle/ccxt-mcp.mjs';
const CACHED_NAME = 'ccxt-mcp.mjs';
// The licences of the third-party code inside the bundle (scripts/build-bundle.mjs writes it
// beside the bundle). It is text that is never executed, and it is covered by the tarball
// checksum, so it needs no hash of its own; a release without one is not an error.
const NOTICES_ENTRY = 'package/js/bundle/THIRD_PARTY_LICENSES.txt';
const NOTICES_NAME = 'THIRD_PARTY_LICENSES.txt';
// the copy a start runs from (see runnableCopy): ".ccxt-mcp.run.<pid>.<random>.mjs"
const RUN_PATTERN = /^\.ccxt-mcp\.run\.(\d+)\.[0-9a-f]+\.mjs$/;
// the tarball is about 3 MB and the bundle about 13 MB; the caps only have to stop a
// runaway or hostile response from filling memory before the hash check rejects it
const MAX_TARBALL_BYTES = 64 * 1024 * 1024;
const MAX_UNPACKED_BYTES = 512 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const IDLE_TIMEOUT_MS = 20 * 1000;
const TOTAL_TIMEOUT_MS = 120 * 1000;
// one per process, so two instances starting together never write into the same file
const PART_PATTERN = /^\.ccxt-mcp\.tgz\.(\d+)\.part$/;
const INTEGRITY_PATTERN = /^sha512-[A-Za-z0-9+/]{86}==$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const here = path.dirname (fileURLToPath (import.meta.url));

function say (message) {
    process.stderr.write ('[ccxt-mcp plugin] ' + message + '\n');
}

// an expected failure with a sentence for the user; `fallback` says whether npx may be
// tried instead (never after a failed verification: that is not a network hiccup), `storage`
// that the disk is the problem and not the network, so the advice has to differ
class BootstrapError extends Error {
    constructor (message, fallback, storage = false) {
        super (message);
        this.fallback = fallback;
        this.storage = storage;
    }
}

function readLock () {
    const lockPath = path.join (here, '..', 'server.lock.json');
    let lock;
    try {
        lock = JSON.parse (fs.readFileSync (lockPath, 'utf8'));
    } catch (error) {
        throw new BootstrapError ('the plugin is incomplete (' + lockPath + ' is missing or unreadable) — reinstall the CCXT plugin', false);
    }
    if (typeof lock.version !== 'string' || !VERSION_PATTERN.test (lock.version)) {
        throw new BootstrapError ('the plugin is damaged (server.lock.json has no valid version) — reinstall the CCXT plugin', false);
    }
    return lock;
}

// a release that predates the bundle (0.1.3) or a lock the release job has not filled in
// yet has no hashes: there is then nothing this file could verify, so it must not download
function lockIsVerifiable (lock) {
    return (typeof lock.tarball === 'string')
        && (typeof lock.integrity === 'string') && INTEGRITY_PATTERN.test (lock.integrity)
        && (typeof lock.bundleIntegrity === 'string') && INTEGRITY_PATTERN.test (lock.bundleIntegrity);
}

function sha512 (buffer) {
    return 'sha512-' + crypto.createHash ('sha512').update (buffer).digest ('base64');
}

function sameDigest (a, b) {
    const left = Buffer.from (a);
    const right = Buffer.from (b);
    return (left.length === right.length) && crypto.timingSafeEqual (left, right);
}

// mirrors cacheDirectory () in ts/config.ts so everything the server caches lives in one place
function osCacheDirectory () {
    const home = os.homedir ();
    if (process.platform === 'win32') {
        return path.join (process.env['LOCALAPPDATA'] || path.join (home, 'AppData', 'Local'), 'ccxt-mcp', 'cache');
    }
    if (process.platform === 'darwin') {
        return path.join (home, 'Library', 'Caches', 'ccxt-mcp');
    }
    return path.join (process.env['XDG_CACHE_HOME'] || path.join (home, '.cache'), 'ccxt-mcp');
}

// Where the server for this version is kept, best place first. PLUGIN_DATA is the per-plugin
// writable directory reserved by the agent-plugins spec, CLAUDE_PLUGIN_DATA is Claude Code's
// name for the same thing. A host can hand over one that is read-only or on a full disk
// (managed machines, sandboxed profiles), so the user's own cache directory is always a
// second choice — for reading too, or every start would download again.
function storageDirectories (lock) {
    const directories = [];
    const provided = process.env['PLUGIN_DATA'] || process.env['CLAUDE_PLUGIN_DATA'];
    if (provided && path.isAbsolute (provided)) {
        directories.push (provided);
    }
    const fallback = osCacheDirectory ();
    if (path.isAbsolute (fallback) && !directories.includes (fallback)) {
        directories.push (fallback);
    }
    return directories.map ((directory) => path.join (directory, 'server', lock.version));
}

// the cache is re-hashed on every start (about 30 ms): a truncated, edited or swapped file
// is treated as absent and fetched again instead of being executed. Returns the bytes that
// were hashed — the caller runs those, not the file (see runnableCopy) — or undefined.
function readVerifiedCache (file, lock) {
    let contents;
    try {
        contents = fs.readFileSync (file);
    } catch (error) {
        return undefined;
    }
    if (sameDigest (sha512 (contents), lock.bundleIntegrity)) {
        return contents;
    }
    say ('the cached server at ' + file + ' does not match this plugin, fetching it again');
    return undefined;
}

function holdsBundle (file, lock) {
    try {
        return sameDigest (sha512 (fs.readFileSync (file)), lock.bundleIntegrity);
    } catch (error) {
        return false;
    }
}

// https only, except a loopback http address (the tests' stand-in registry): the hash check
// is what makes the download trustworthy, but there is no reason to send the request in clear
function assertAllowedUrl (url) {
    const loopback = (url.hostname === '127.0.0.1') || (url.hostname === 'localhost') || (url.hostname === '[::1]');
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
        throw new BootstrapError ('refusing to download the server from a non-https address (' + url.origin + ')', false);
    }
}

function fileSize (file) {
    try {
        return fs.statSync (file).size;
    } catch (error) {
        return 0;
    }
}

function remove (file) {
    try {
        fs.rmSync (file, { 'force': true });
    } catch (error) {
        // a leftover that cannot be deleted is only ever hashed, never run
    }
}

function processIsAlive (pid) {
    try {
        process.kill (pid, 0);
        return true;
    } catch (error) {
        return error.code === 'EPERM'; // it exists, it just belongs to someone else
    }
}

// Returns the file this process downloads into, inside `directory`, holding whatever an
// earlier start had already received. Hosts give a server a fixed time to answer (Codex: 30
// seconds) and kill it when the download is slower than that; if every start began at byte
// zero, a slow connection would never get there. A part file whose owner is still running
// is left alone: two writers appending to one file would corrupt it.
function claimPartFile (directory) {
    fs.mkdirSync (directory, { 'recursive': true, 'mode': 0o700 });
    const own = path.join (directory, '.ccxt-mcp.tgz.' + process.pid + '.part');
    let best;
    let bestSize = -1;
    for (const name of fs.readdirSync (directory)) {
        const match = PART_PATTERN.exec (name);
        if (match === null || (Number (match[1]) !== process.pid && processIsAlive (Number (match[1])))) {
            continue;
        }
        const file = path.join (directory, name);
        let size = -1;
        try {
            const stat = fs.lstatSync (file);
            size = stat.isFile () ? stat.size : -1;
        } catch (error) {
            continue; // another start claimed it in the meantime
        }
        if (size > bestSize && size <= MAX_TARBALL_BYTES) {
            if (best !== undefined) {
                remove (best);
            }
            best = file;
            bestSize = size;
        } else {
            remove (file);
        }
    }
    if (best !== undefined && best !== own) {
        try {
            fs.renameSync (best, own);
        } catch (error) {
            // another start claimed it in the meantime: begin at zero
        }
    }
    // creates the file when there was nothing to pick up, and proves the directory is writable
    fs.closeSync (fs.openSync (own, 'a', 0o600));
    return own;
}

// Resolves with the complete response body. With `part` (a file from claimPartFile) the body
// is appended to that file as it arrives, and a file that already holds the beginning makes
// this a Range request for the rest; the caller's checksum decides whether the result is good.
function download (address, part, redirects = 0) {
    return new Promise ((resolve, reject) => {
        let url;
        try {
            url = new URL (address);
            assertAllowedUrl (url);
        } catch (error) {
            reject ((error instanceof BootstrapError) ? error : new BootstrapError ('the server address in the plugin is not a valid URL', false));
            return;
        }
        const client = (url.protocol === 'https:') ? https : http;
        const headers = { 'accept': 'application/octet-stream', 'user-agent': PACKAGE + '-plugin' };
        let offset = (part === undefined) ? 0 : fileSize (part);
        if (offset > 0) {
            headers['range'] = 'bytes=' + offset + '-';
        }
        let descriptor;
        let settled = false;
        const finish = (error, value) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout (deadline);
            request.destroy ();
            if (descriptor !== undefined) {
                try {
                    fs.closeSync (descriptor);
                } catch (closeError) {
                    // the write that mattered has already failed or succeeded
                }
            }
            if (error) {
                reject (error);
            } else {
                resolve (value);
            }
        };
        const request = client.get (url, { headers }, (response) => {
            const status = response.statusCode || 0;
            if (status >= 300 && status < 400 && response.headers.location) {
                response.resume ();
                if (redirects >= MAX_REDIRECTS) {
                    finish (new BootstrapError ('too many redirects while downloading the server', true));
                    return;
                }
                let next;
                try {
                    next = new URL (response.headers.location, url).href;
                } catch (error) {
                    finish (new BootstrapError ('the download was redirected to an invalid address', true));
                    return;
                }
                settled = true;
                clearTimeout (deadline);
                download (next, part, redirects + 1).then (resolve, reject);
                return;
            }
            if (status === 416 && offset > 0) {
                // nothing left after what is already here: the earlier start was cut short
                // between the last byte and the checksum
                response.resume ();
                try {
                    finish (undefined, fs.readFileSync (part));
                } catch (error) {
                    finish (new BootstrapError ('could not read the partial download at ' + part + ' (' + (error.code || error.message) + ')', true, true));
                }
                return;
            }
            const range = /^bytes (\d+)-/.exec (String (response.headers['content-range'] || ''));
            if (status === 206 && offset > 0 && range !== null && Number (range[1]) === offset) {
                // the rest, as asked
            } else if (status === 200) {
                offset = 0; // a server that ignores Range sends everything: start the file over
            } else {
                response.resume ();
                if (status === 206) {
                    remove (part);
                }
                finish (new BootstrapError ((status === 206) ? 'the download server answered with a part of the file that was not asked for' : ('the download server answered HTTP ' + status), true));
                return;
            }
            const chunks = [];
            let received = offset;
            if (part !== undefined) {
                try {
                    descriptor = fs.openSync (part, (offset === 0) ? 'w' : 'a', 0o600);
                } catch (error) {
                    response.resume ();
                    finish (new BootstrapError ('could not write the download to ' + part + ' (' + (error.code || error.message) + ')', true, true));
                    return;
                }
            }
            response.on ('data', (chunk) => {
                received += chunk.length;
                if (received > MAX_TARBALL_BYTES) {
                    finish (new BootstrapError ('the download is larger than ' + (MAX_TARBALL_BYTES / (1024 * 1024)) + ' MB, which cannot be the CCXT server', false));
                    return;
                }
                if (descriptor === undefined) {
                    chunks.push (chunk);
                    return;
                }
                try {
                    // synchronous on purpose: whatever has arrived is in the file when the
                    // host's deadline kills this process
                    fs.writeSync (descriptor, chunk);
                } catch (error) {
                    finish (new BootstrapError ('could not write the download to ' + part + ' (' + (error.code || error.message) + ')', true, true));
                }
            });
            response.on ('end', () => {
                if (descriptor === undefined) {
                    finish (undefined, Buffer.concat (chunks));
                    return;
                }
                try {
                    finish (undefined, fs.readFileSync (part));
                } catch (error) {
                    finish (new BootstrapError ('could not read the download back from ' + part + ' (' + (error.code || error.message) + ')', true, true));
                }
            });
            response.on ('aborted', () => finish (new BootstrapError ('the download was interrupted', true)));
            response.on ('error', (error) => finish (new BootstrapError ('the download failed (' + error.message + ')', true)));
        });
        request.setTimeout (IDLE_TIMEOUT_MS, () => finish (new BootstrapError ('the download stalled', true)));
        request.on ('error', (error) => finish (new BootstrapError ('the download failed (' + (error.code || error.message) + ')', true)));
        const deadline = setTimeout (() => finish (new BootstrapError ('the download took longer than ' + (TOTAL_TIMEOUT_MS / 1000) + ' seconds', true)), TOTAL_TIMEOUT_MS);
    });
}

// The pinned tarball, checksum verified. A file resumed from an earlier start gets one fresh
// attempt when it does not verify (it may have been damaged while it lay there); a download
// that began at zero in this process and does not verify is never retried or run.
async function downloadVerified (lock, claimed) {
    let part = claimed;
    for (;;) {
        const resumed = (part !== undefined) && (fileSize (part) > 0);
        let tarball;
        try {
            tarball = await download (lock.tarball, part);
        } catch (error) {
            if ((error instanceof BootstrapError) && error.storage && part !== undefined) {
                // the disk gave up, the network did not: keep this attempt in memory
                remove (part);
                part = undefined;
                continue;
            }
            // only the beginning of a download the network cut short is worth keeping
            if (part !== undefined && (!(error instanceof BootstrapError) || !error.fallback || fileSize (part) === 0)) {
                remove (part);
            }
            throw error;
        }
        if (part !== undefined) {
            remove (part);
        }
        if (sameDigest (sha512 (tarball), lock.integrity)) {
            return tarball;
        }
        if (!resumed) {
            throw new BootstrapError ('the downloaded server does not match the checksum pinned in this plugin, so it was not run — try again later, and report it at https://github.com/ccxt/ccxt/issues if it keeps happening', false);
        }
        say ('the partial download kept from an earlier start could not be completed into the pinned server, downloading it again from the start');
    }
}

function tarString (block, start, length) {
    const slice = block.subarray (start, start + length);
    const end = slice.indexOf (0);
    return slice.subarray (0, (end === -1) ? slice.length : end).toString ('utf8');
}

function tarOctal (block, start, length) {
    // the base-256 form (high bit set) is only used for sizes of 8 GB and more
    if (block[start] & 0x80) {
        throw new Error ('unsupported tar number encoding');
    }
    const text = tarString (block, start, length).trim ();
    if (text === '') {
        return 0;
    }
    if (!/^[0-7]+$/.test (text)) {
        throw new Error ('corrupt tar header');
    }
    return parseInt (text, 8);
}

// pax records are "<length> <key>=<value>\n", the length counting the whole record
function paxPath (data) {
    let found;
    let offset = 0;
    while (offset < data.length) {
        const space = data.indexOf (0x20, offset);
        if (space === -1) {
            break;
        }
        const length = parseInt (data.subarray (offset, space).toString ('utf8'), 10);
        if (!Number.isInteger (length) || length <= 0 || offset + length > data.length) {
            throw new Error ('corrupt pax header');
        }
        const record = data.subarray (space + 1, offset + length - 1).toString ('utf8');
        const equals = record.indexOf ('=');
        if (equals !== -1 && record.slice (0, equals) === 'path') {
            found = record.slice (equals + 1);
        }
        offset += length;
    }
    return found;
}

// Returns the contents of the ONE regular file whose name is exactly `wanted`, or undefined.
// It is a reader, not an extractor: no entry name is ever turned into a filesystem path, so
// "../" names, absolute names, links and devices cannot do anything — they just never match.
// Long names (pax "x" records, GNU "L" entries, the ustar prefix field) are understood so
// that a long-named entry cannot be mistaken for a short one.
function readTarEntry (archive, wanted) {
    let found;
    let offset = 0;
    let overrideName;
    while (offset + 512 <= archive.length) {
        const header = archive.subarray (offset, offset + 512);
        if (header.every ((byte) => byte === 0)) {
            break; // end-of-archive marker
        }
        let sum = 0;
        for (let i = 0; i < 512; i++) {
            sum += (i >= 148 && i < 156) ? 0x20 : header[i];
        }
        if (sum !== tarOctal (header, 148, 8)) {
            throw new Error ('corrupt tar header');
        }
        const size = tarOctal (header, 124, 12);
        const type = String.fromCharCode (header[156] || 0x30);
        const start = offset + 512;
        if (start + size > archive.length) {
            throw new Error ('truncated tar archive');
        }
        const data = archive.subarray (start, start + size);
        offset = start + Math.ceil (size / 512) * 512;
        if (type === 'x') {
            overrideName = paxPath (data) ?? overrideName;
            continue;
        }
        if (type === 'L') {
            overrideName = tarString (data, 0, data.length);
            continue;
        }
        if (type === 'g') {
            continue; // global pax header: applies to no particular entry
        }
        let name = overrideName;
        overrideName = undefined;
        if (name === undefined) {
            const prefix = tarString (header, 345, 155);
            name = tarString (header, 0, 100);
            if (prefix !== '' && tarString (header, 257, 5) === 'ustar') {
                name = prefix + '/' + name;
            }
        }
        if (type === '0' && name === wanted) {
            if (found !== undefined) {
                throw new Error ('the archive holds the server twice');
            }
            found = Buffer.from (data);
        }
    }
    return found;
}

// Windows refuses to rename a file, or to put one in the place of another, for as long as
// some other process has it open — which a virus scanner does with every file that was just
// written. That passes within moments, so the rename is tried again for about a second
// there. Everywhere else a rename either works or fails for a reason waiting does not cure.
function renameIntoPlace (from, to) {
    for (let attempt = 0; ; attempt++) {
        try {
            fs.renameSync (from, to);
            return;
        } catch (error) {
            if (process.platform !== 'win32' || attempt >= 20 || ![ 'EPERM', 'EACCES', 'EBUSY' ].includes (error.code)) {
                throw error;
            }
            Atomics.wait (new Int32Array (new SharedArrayBuffer (4)), 0, 0, 50);
        }
    }
}

// 0700 directory, 0600 file, written under a temporary name and renamed into place: another
// instance starting at the same moment sees either no file or the complete one
function writeAtomically (file, contents) {
    const directory = path.dirname (file);
    fs.mkdirSync (directory, { 'recursive': true, 'mode': 0o700 });
    const temporary = path.join (directory, '.' + path.basename (file) + '.' + process.pid + '.' + crypto.randomBytes (6).toString ('hex') + '.tmp');
    try {
        fs.writeFileSync (temporary, contents, { 'mode': 0o600, 'flag': 'wx' });
        renameIntoPlace (temporary, file);
    } catch (error) {
        fs.rmSync (temporary, { 'force': true });
        throw error;
    }
}

// Downloads, verifies and stores the bundle. Returns its bytes, the directory they were
// cached in (undefined when nothing could be written) and why each directory refused.
async function fetchBundle (lock, directories) {
    // names the runtime too: "which Node did the launcher pick" is the first support question
    say ('downloading the CCXT server ' + lock.version + ' (one time, about 3 MB), running on Node ' + process.versions.node + ' at ' + process.execPath);
    const unusable = new Map (); // directory → why nothing could be written there
    let part;
    for (const directory of directories) {
        try {
            part = claimPartFile (directory);
            break;
        } catch (error) {
            unusable.set (directory, error.code || error.message);
        }
    }
    const tarball = await downloadVerified (lock, part);
    let bundle;
    let notices;
    try {
        const archive = zlib.gunzipSync (tarball, { 'maxOutputLength': MAX_UNPACKED_BYTES });
        bundle = readTarEntry (archive, BUNDLE_ENTRY);
        try {
            notices = readTarEntry (archive, NOTICES_ENTRY);
        } catch (error) {
            // an archive that names the notices twice: nothing to choose between, keep none
        }
    } catch (error) {
        throw new BootstrapError ('the downloaded server archive could not be read (' + error.message + ')', false);
    }
    if (bundle === undefined) {
        // the tarball is the pinned one, it just has no bundle inside: an npm-only release
        throw new BootstrapError ('ccxt-mcp ' + lock.version + ' was published without a single-file server', true);
    }
    if (!sameDigest (sha512 (bundle), lock.bundleIntegrity)) {
        throw new BootstrapError ('the server inside the download does not match the checksum pinned in this plugin, so it was not run — reinstall the CCXT plugin', false);
    }
    for (const directory of directories) {
        try {
            writeAtomically (path.join (directory, CACHED_NAME), bundle);
        } catch (error) {
            // Two instances that start cold together both get here, and Windows refuses to
            // put a file in the place of one the other instance has open at that moment. The
            // file that is there is then the same verified server, which is all that matters.
            if (!holdsBundle (path.join (directory, CACHED_NAME), lock)) {
                unusable.set (directory, error.code || error.message);
                continue;
            }
        }
        if (notices !== undefined) {
            try {
                // the licences travel with the copy of the code they are about
                writeAtomically (path.join (directory, NOTICES_NAME), notices);
            } catch (error) {
                // the server runs without them; they are also in the npm package
            }
        }
        return { 'contents': bundle, directory, unusable, 'downloaded': true };
    }
    return { 'contents': bundle, 'directory': undefined, unusable, 'downloaded': true };
}

// Removes the run copies earlier starts left in `directory` because they were killed before
// their exit handler ran. One whose process is still alive belongs to a running server.
function removeStaleRunCopies (directory) {
    let names = [];
    try {
        names = fs.readdirSync (directory);
    } catch (error) {
        return;
    }
    for (const name of names) {
        const match = RUN_PATTERN.exec (name);
        if (match !== null && (Number (match[1]) === process.pid || !processIsAlive (Number (match[1])))) {
            remove (path.join (directory, name));
        }
    }
}

function removeOnExit (target, recursive) {
    process.on ('exit', () => {
        try {
            fs.rmSync (target, { recursive, 'force': true });
        } catch (error) {
            // the next start (removeStaleRunCopies) or the operating system clears it
        }
    });
}

// Returns the path of a file to import that holds exactly `server.contents`.
//
// Verifying the cached file and then importing it by path would read it twice, and whatever
// replaced it between the two reads would run unverified. So the bytes that were hashed are
// written to a new file (created exclusively, 0600, under a name nobody could have prepared)
// and THAT is imported. It lives in the 0700 cache directory and is removed on the way out.
// With nowhere to keep the server at all it goes to a private temporary directory instead
// (mkdtemp: created 0700, owned by this user), which is the "run it this once" case.
function runnableCopy (server) {
    const reasons = new Map (server.unusable);
    if (server.directory !== undefined) {
        removeStaleRunCopies (server.directory);
        const target = path.join (server.directory, '.ccxt-mcp.run.' + process.pid + '.' + crypto.randomBytes (6).toString ('hex') + '.mjs');
        try {
            fs.writeFileSync (target, server.contents, { 'mode': 0o600, 'flag': 'wx' });
            removeOnExit (target, false);
            return target;
        } catch (error) {
            remove (target);
            reasons.set (server.directory, error.code || error.message);
        }
    }
    const listed = [ ...reasons ].map (([ directory, code ]) => directory + ': ' + code).join ('; ');
    try {
        const temporary = fs.mkdtempSync (path.join (os.tmpdir (), PACKAGE + '-'));
        removeOnExit (temporary, true);
        const target = path.join (temporary, CACHED_NAME);
        fs.writeFileSync (target, server.contents, { 'mode': 0o600, 'flag': 'wx' });
        if (server.directory === undefined) {
            say ('the server could not be kept on disk (' + listed + '), so it will be downloaded again at every start — free some disk space or make that folder writable');
        }
        return target;
    } catch (error) {
        throw new BootstrapError ('the CCXT server ' + (server.downloaded ? 'was downloaded but ' : '') + 'could not be saved anywhere (' + listed + '; ' + os.tmpdir () + ': ' + (error.code || error.message) + ')', true, true);
    }
}

// The places scripts/launch and scripts/launch.cmd look for a user-installed Node, which is
// where its npx is too. Keep the three lists in step.
function nodeInstallDirectories () {
    const home = os.homedir ();
    const env = process.env;
    if (process.platform === 'win32') {
        return [
            env['ProgramFiles'] && path.join (env['ProgramFiles'], 'nodejs'),
            env['ProgramW6432'] && path.join (env['ProgramW6432'], 'nodejs'),
            env['NVM_SYMLINK'],
            env['LOCALAPPDATA'] && path.join (env['LOCALAPPDATA'], 'Volta', 'bin'),
        ];
    }
    const directories = [
        '/opt/homebrew/bin',
        '/usr/local/bin',
        '/usr/bin',
        path.join (home, '.volta', 'bin'),
        path.join (env['XDG_DATA_HOME'] || path.join (home, '.local', 'share'), 'fnm', 'aliases', 'default', 'bin'),
        path.join (home, 'Library', 'Application Support', 'fnm', 'aliases', 'default', 'bin'),
    ];
    // nvm keeps one directory per installed version ("v22.3.0"): newest first, none below 18
    const versions = path.join (env['NVM_DIR'] || path.join (home, '.nvm'), 'versions', 'node');
    let installed = [];
    try {
        installed = fs.readdirSync (versions);
    } catch (error) {
        // no nvm here
    }
    const parsed = installed
        .map ((name) => ({ name, 'parts': /^v(\d+)\.(\d+)\.(\d+)$/.exec (name) }))
        .filter ((entry) => entry.parts !== null && Number (entry.parts[1]) >= 18)
        .sort ((a, b) => (b.parts[1] - a.parts[1]) || (b.parts[2] - a.parts[2]) || (b.parts[3] - a.parts[3]));
    return directories.concat (parsed.map ((entry) => path.join (versions, entry.name, 'bin')));
}

function isFile (file) {
    try {
        return fs.statSync (file).isFile ();
    } catch (error) {
        return false;
    }
}

// what may stand between cmd.exe's double quotes without meaning anything to it; "%" is
// missing on purpose (cmd expands %NAME% inside quotes too), and a path cannot hold a quote
const CMD_SAFE_PATH = /^[^"%\r\n]+$/;
// the fixed "-y" and "ccxt-mcp@<version>": nothing cmd.exe gives a meaning to
const CMD_SAFE_ARGUMENT = /^[0-9A-Za-z@._-]+$/;

// How the npx at `npx` is started with `args`: { command, args, options }, or undefined
// when it cannot be started safely.
//
// Everywhere but Windows npx is a script with a shebang and is started as it is. On Windows
// it is a batch file (npx.cmd), which Node refuses to start without a shell (since the fix
// for CVE-2024-27980), and a command line that goes through cmd.exe is parsed by it. So, in
// this order:
//   1. a program (Volta's npx.exe) is started as it is;
//   2. the npx.cmd of a Node.js install only starts `node npx-cli.js`, and both files are
//      right beside it — that is done here directly, with no cmd.exe at all. It also means
//      the host stops the real server process, not a cmd.exe that leaves it running;
//   3. any other npx.cmd is started through cmd.exe, with a command line built here
//      (never by Node's `shell` option, which quotes nothing): the path between double
//      quotes, refused when it holds the one character that still means something there,
//      and arguments that are checked to hold nothing cmd.exe interprets.
function npxInvocation (npx, args) {
    if (process.platform !== 'win32' || /\.exe$/i.test (npx)) {
        return { 'command': npx, args, 'options': {} };
    }
    const directory = path.dirname (npx);
    const cli = path.join (directory, 'node_modules', 'npm', 'bin', 'npx-cli.js');
    if (isFile (cli)) {
        const node = path.join (directory, 'node.exe');
        return { 'command': isFile (node) ? node : process.execPath, 'args': [ cli, ...args ], 'options': {} };
    }
    if (!CMD_SAFE_PATH.test (npx) || !args.every ((argument) => CMD_SAFE_ARGUMENT.test (argument))) {
        return undefined;
    }
    const systemRoot = process.env['SystemRoot'] || process.env['windir'] || 'C:\\Windows';
    const named = process.env['ComSpec'];
    const shell = (named && path.isAbsolute (named) && isFile (named)) ? named : path.join (systemRoot, 'System32', 'cmd.exe');
    // /d: no AutoRun commands; /v:off: "!" stays a plain character; /s with the whole
    // command between one more pair of quotes: cmd removes exactly that pair and reads the
    // rest as written
    return { 'command': shell, 'args': [ '/d', '/v:off', '/s', '/c', '"' + [ '"' + npx + '"', ...args ].join (' ') + '"' ], 'options': { 'windowsVerbatimArguments': true } };
}

function npxArguments (version) {
    return [ '-y', PACKAGE + '@' + version ];
}

// npx on PATH, beside the Node that runs this file, or in a usual install location. The
// launcher prefers the app's own Node, which has no npx beside it, and a desktop app hands
// its children a minimal PATH — so a user with Node from Homebrew or nvm would otherwise be
// told to install the Node.js they already have. An npx that cannot be started safely (see
// npxInvocation) is passed over like one that is not there.
function findNpx (version) {
    const windows = process.platform === 'win32';
    const nodeDirectory = path.dirname (process.execPath);
    const directories = (process.env['PATH'] || '').split (path.delimiter).concat ([ nodeDirectory ], nodeInstallDirectories ());
    const names = windows ? [ 'npx.cmd', 'npx.exe' ] : [ 'npx' ];
    for (const directory of directories) {
        if (!directory || !path.isAbsolute (directory)) {
            continue;
        }
        for (const name of names) {
            const npx = path.join (directory, name);
            const invocation = isFile (npx) ? npxInvocation (npx, npxArguments (version)) : undefined;
            if (invocation !== undefined) {
                return { npx, nodeDirectory, invocation };
            }
        }
    }
    return undefined;
}

function runNpx (found) {
    // npx is a script that starts `node` from PATH: the one installed beside it is the one
    // it belongs to, so that directory comes first; the Node running this file is the last
    // resort for an npx that has none beside it. (Windows names the variable "Path", and an
    // environment with both spellings would leave it to chance which one the child gets.)
    const windows = process.platform === 'win32';
    const env = {};
    for (const [ name, value ] of Object.entries (process.env)) {
        if (!windows || name.toUpperCase () !== 'PATH') {
            env[name] = value;
        }
    }
    env['PATH'] = [ path.dirname (found.npx), process.env['PATH'], found.nodeDirectory ].filter (Boolean).join (path.delimiter);
    const child = spawn (found.invocation.command, found.invocation.args, { 'stdio': 'inherit', env, ...found.invocation.options });
    for (const signal of [ 'SIGINT', 'SIGTERM', 'SIGHUP' ]) {
        process.on (signal, () => child.kill (signal));
    }
    child.on ('error', (error) => {
        say ('could not start npx (' + (error.code || error.message) + ') — install Node.js 18 or newer from https://nodejs.org and restart the app');
        process.exit (127);
    });
    child.on ('exit', (code, signal) => {
        process.exit ((code === null) ? (signal ? 1 : 0) : code);
    });
}

async function importServer (file) {
    await import (pathToFileURL (file).href);
}

async function main () {
    const major = Number (process.versions.node.split ('.')[0]);
    if (major < 18) {
        throw new BootstrapError ('the CCXT server needs Node.js 18 or newer but was started with ' + process.versions.node + ' — update Node.js (https://nodejs.org) or the app, then restart', false);
    }
    const local = process.env['CCXT_MCP_SERVER'];
    if (local) {
        // explicit, so a typo must not silently run a different (downloaded) server
        if (!path.isAbsolute (local) || !fs.existsSync (local)) {
            throw new BootstrapError ('CCXT_MCP_SERVER must be the absolute path of an existing server file, but is ' + JSON.stringify (local), false);
        }
        say ('using the local server from CCXT_MCP_SERVER: ' + local);
        await importServer (local);
        return;
    }
    const lock = readLock ();
    let reason;
    if (lockIsVerifiable (lock)) {
        const directories = storageDirectories (lock);
        let server;
        let runnable;
        for (const directory of directories) {
            const contents = readVerifiedCache (path.join (directory, CACHED_NAME), lock);
            if (contents !== undefined) {
                server = { contents, directory, 'unusable': new Map (), 'downloaded': false };
                break;
            }
        }
        try {
            if (server === undefined) {
                server = await fetchBundle (lock, directories);
            }
            runnable = runnableCopy (server);
        } catch (error) {
            if (!(error instanceof BootstrapError) || !error.fallback) {
                throw error;
            }
            reason = error;
        }
        if (reason === undefined) {
            await importServer (runnable);
            return;
        }
        say (reason.message + ' — trying npx instead');
    }
    const npx = findNpx (lock.version);
    if (npx !== undefined) {
        runNpx (npx);
        return;
    }
    if (reason === undefined) {
        throw new BootstrapError ('this plugin version (server ' + lock.version + ') can only start through npx, which is not installed here — install Node.js 18 or newer from https://nodejs.org and restart the app, or update the CCXT plugin once the next ccxt-mcp release is out (that one needs no Node.js install)', false);
    }
    if (reason.storage) {
        // the download worked: sending the user to check their connection would be wrong
        throw new BootstrapError (reason.message + ' and npx is not installed to run it another way — free some disk space or make that folder writable, then restart the app', false);
    }
    throw new BootstrapError ('the CCXT server could not be downloaded (' + reason.message + ') and npx is not installed to fetch it another way — check the internet connection and restart the app; a first start on a slow connection continues where the previous one stopped, so trying again helps (behind a proxy, install Node.js 18 or newer from https://nodejs.org so the plugin can use npx)', false);
}

main ().catch ((error) => {
    say ((error instanceof BootstrapError) ? error.message : ('could not start the CCXT server: ' + String ((error && error.stack) || error)));
    process.exit (1);
});
