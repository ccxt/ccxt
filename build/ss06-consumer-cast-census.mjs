#!/usr/bin/env node
// SS-06 census — safeString results in the four consumer calls and the String casts that
// sit on them (Helpers.isEqual / Helpers.isTrue / Helpers.inOp / this.safeValue*).
//
// Reports, for the working tree or for any git revision:
//   A. consumer call sites whose argument list contains a safeString-family call
//      (`Helpers.isEqual(this.safeString…` — the ~107 the campaign counted, plus the
//      isTrue / inOp / safeValue variants), split by tier;
//   B. `((String)x)` casts printed at a consumer position, split into
//      - receiver casts `((String)x).method()`  (SS-12's slice — left alone),
//      - argument casts whose operand's declaration prints `String`  (SS-06's slice,
//        dropped by build/java-local-types.js#patchJavaConsumerStringCasts),
//      - argument casts whose operand is still `Object`  (SS-02 / SS-07 / SS-08 / SS-10);
//   C. Object-declared `safeString*` locals whose uses flow into one of the four
//      consumers, by tier (the population SS-06's consumers must stay value-identical for).
//
// Usage:
//   node build/ss06-consumer-cast-census.mjs                 # current worktree
//   node build/ss06-consumer-cast-census.mjs --rev 3ca818ac31e   # any git revision
//   node build/ss06-consumer-cast-census.mjs --root <dir>    # another generated tree

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname (fileURLToPath (import.meta.url));
const REPO = path.resolve (HERE, '..');

const argv = process.argv.slice (2);
const option = (name) => {
    const at = argv.indexOf (name);
    return at === -1 ? undefined : argv[at + 1];
};
const REV = option ('--rev');
const ROOT = path.resolve (REPO, option ('--root') ?? 'java/lib/src/main/java');

// ---- file access (worktree or git revision) -------------------------------------------

function listJavaFiles () {
    if (!REV) {
        const found = [];
        const walk = (dir) => {
            for (const entry of fs.readdirSync (dir, { withFileTypes: true })) {
                const full = path.join (dir, entry.name);
                if (entry.isDirectory ()) walk (full);
                else if (entry.name.endsWith ('.java')) found.push (full);
            }
        };
        walk (ROOT);
        return found.map ((file) => ({ file, rel: path.relative (REPO, file) }));
    }
    const out = execFileSync ('git', ['ls-tree', '-r', '--name-only', REV, '--', path.relative (REPO, ROOT)],
        { cwd: REPO, encoding: 'utf8' });
    return out.split ('\n').filter (Boolean).map ((rel) => ({ rel, file: undefined }));
}

function readFile (entry) {
    if (entry.file !== undefined) return fs.readFileSync (entry.file, 'utf8');
    return execFileSync ('git', ['show', `${REV}:${entry.rel}`], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function tierOf (rel) {
    if (rel.includes ('/exchanges/pro/')) return 'pro';
    if (rel.includes ('/exchanges/prediction/')) return 'prediction';
    if (rel.includes ('/exchanges/')) return 'rest';
    return 'base/other';
}

// ---- A: consumer call sites taking a safeString result ---------------------------------

const CONSUMER_INLINE = [
    /Helpers\.isEqual\(this\.safeString/g,
    /Helpers\.isTrue\([^;]*?this\.safeString/g,
    /Helpers\.inOp\([^;]*?this\.safeString/g,
    /this\.safeValue[0-9N]*\([^;]*?this\.safeString/g,
];
const CONSUMER_NAMES = new Set (['isEqual', 'isTrue', 'inOp', 'safeValue', 'safeValue2', 'safeValueN']);

// the callee name of the call whose `(` immediately encloses position `at`, or undefined
function enclosingCall (line, at) {
    let depth = 0;
    for (let i = at - 1; i >= 0; i--) {
        const ch = line[i];
        if (ch === ')') depth++;
        else if (ch === '(') {
            if (depth === 0) {
                let end = i - 1;
                let start = end;
                while (start >= 0 && /[A-Za-z0-9_$.]/.test (line[start])) start--;
                const callee = line.slice (start + 1, end + 1);
                const bare = callee.split ('.').pop ();
                return { callee, bare };
            }
            depth--;
        }
    }
    return undefined;
}

// ---- declaration lookup (textual, same-method-scope approximation) ---------------------

const DECLARATION = (name) => new RegExp (`^\\s*(?:final\\s+)?([A-Za-z_][\\w<>,.\\[\\] ]*?)\\s+${name}\\s*=`, 'm');

function declarationType (lines, upTo, name) {
    const nameWord = new RegExp (`\\b${name}\\b`);
    for (let i = upTo; i >= 0; i--) {
        const line = lines[i];
        // a method signature above the use is the scope boundary: either the name is one
        // of its parameters or it belongs to an outer scope (not provable here)
        if (/^\s{0,4}(public|private|protected)\s/.test (line) && line.includes ('(')) {
            return nameWord.test (line) ? 'parameter' : undefined;
        }
        const match = line.match (DECLARATION (name));
        if (match) return match[1].trim ();
    }
    return undefined;
}

// ---- scan -------------------------------------------------------------------------------

const inlineByTier = {};
const castByTier = {};
const localByTier = {};
const castSamples = { dropped: [], objectOperand: [], receiver: [] };

for (const entry of listJavaFiles ()) {
    const tier = tierOf (entry.rel);
    const content = readFile (entry);
    const lines = content.split ('\n');

    // A. inline safeString results on the four consumers (whole-file scan)
    for (const pattern of CONSUMER_INLINE) {
        const matches = content.match (pattern);
        inlineByTier[tier] = (inlineByTier[tier] ?? 0) + (matches ? matches.length : 0);
    }

    // B. ((String)x) casts at consumer positions
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = /\(\((String)\)([A-Za-z_][A-Za-z0-9_]*)\)/g;
        let match;
        while ((match = regex.exec (line)) !== null) {
            const after = line.slice (regex.lastIndex, regex.lastIndex + 1);
            const operand = match[2];
            if (after === '.') {
                castByTier[tier] = castByTier[tier] ?? { receiver: 0, droppedEligible: 0, objectOperand: 0 };
                castByTier[tier].receiver++;
                if (castSamples.receiver.length < 5) castSamples.receiver.push (`${entry.rel}:${i + 1}`);
                continue;
            }
            // argument-like: only count it when the cast is inside one of the four consumers
            const call = enclosingCall (line, match.index);
            if (call === undefined || !CONSUMER_NAMES.has (call.bare)) continue;
            castByTier[tier] = castByTier[tier] ?? { receiver: 0, droppedEligible: 0, objectOperand: 0 };
            const declared = declarationType (lines, i, operand);
            if (declared === 'String') {
                castByTier[tier].droppedEligible++;
                if (castSamples.dropped.length < 10) castSamples.dropped.push (`${entry.rel}:${i + 1}`);
            } else {
                castByTier[tier].objectOperand++;
                if (castSamples.objectOperand.length < 5) castSamples.objectOperand.push (`${entry.rel}:${i + 1}`);
            }
        }
    }

    // C. Object-declared safeString locals whose uses reach a consumer call
    for (let i = 0; i < lines.length; i++) {
        const decl = lines[i].match (/^\s*Object\s+([A-Za-z_]\w*)\s*=\s*this\.safeString\w*\s*\(/);
        if (decl === null) continue;
        const name = decl[1];
        const use = new RegExp (`(?<![A-Za-z0-9_.])${name}(?![A-Za-z0-9_])`);
        let feedsConsumer = false;
        for (let j = i + 1; j < Math.min (i + 400, lines.length); j++) {
            if (/^\s*(public|private|protected)\s/.test (lines[j])) break;   // next method
            if (!use.test (lines[j])) continue;
            if (/Helpers\.(isEqual|isTrue|inOp)\s*\(|this\.safeValue[0-9N]*\s*\(/.test (lines[j])) {
                feedsConsumer = true;
                break;
            }
        }
        if (feedsConsumer) {
            localByTier[tier] = (localByTier[tier] ?? 0) + 1;
        }
    }
}

// ---- report -----------------------------------------------------------------------------

const tiers = ['rest', 'pro', 'prediction', 'base/other'];
const source = REV ? `git revision ${REV}` : ROOT;
console.log (`SS-06 consumer census — ${source}\n`);

console.log ('A. inline safeString-family results inside the four consumer calls');
let inlineTotal = 0;
for (const tier of tiers) {
    const count = inlineByTier[tier] ?? 0;
    inlineTotal += count;
    console.log (`   ${tier.padEnd (12)} ${String (count).padStart (5)}`);
}
console.log (`   ${'TOTAL'.padEnd (12)} ${String (inlineTotal).padStart (5)}   (Helpers.isEqual(this.safeString* and the isTrue/inOp/safeValue forms)`);

console.log ('\nB. ((String)x) casts printed inside the four consumer calls');
let receiverTotal = 0, droppedTotal = 0, objectTotal = 0;
for (const tier of tiers) {
    const counts = castByTier[tier] ?? { receiver: 0, droppedEligible: 0, objectOperand: 0 };
    receiverTotal += counts.receiver;
    droppedTotal += counts.droppedEligible;
    objectTotal += counts.objectOperand;
    if (counts.receiver || counts.droppedEligible || counts.objectOperand) {
        console.log (`   ${tier.padEnd (12)} receiver=${String (counts.receiver).padStart (4)}  operand-String=${String (counts.droppedEligible).padStart (4)}  operand-Object=${String (counts.objectOperand).padStart (4)}`);
    }
}
console.log (`   ${'TOTAL'.padEnd (12)} receiver=${String (receiverTotal).padStart (4)}  operand-String=${String (droppedTotal).padStart (4)}  operand-Object=${String (objectTotal).padStart (4)}`);
console.log ('   receiver casts are SS-12 scope; operand-String casts are SS-06 (0 expected once the hook runs);');
console.log ('   operand-Object casts stay — the local is still Object (SS-02/SS-07/SS-08/SS-10 root cause).');
if (castSamples.dropped.length) console.log ('   operand-String examples: ' + castSamples.dropped.join (', '));
if (castSamples.objectOperand.length) console.log ('   operand-Object examples: ' + castSamples.objectOperand.join (', '));

console.log ('\nC. Object-declared `safeString*` locals whose uses reach a consumer call');
let localTotal = 0;
for (const tier of tiers) {
    const count = localByTier[tier] ?? 0;
    localTotal += count;
    console.log (`   ${tier.padEnd (12)} ${String (count).padStart (5)}`);
}
console.log (`   ${'TOTAL'.padEnd (12)} ${String (localTotal).padStart (5)}`);
console.log ('   these are the locals whose String retyping (other slices) SS-06 proves value-safe:');
console.log ('   the consumers take a String argument through the Object parameter with no cast.');
