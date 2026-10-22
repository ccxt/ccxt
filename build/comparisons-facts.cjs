#!/usr/bin/env node
// Verified facts for the wiki/comparisons/ pages.
//
// Those pages quote concrete numbers (capability counts, endpoint counts, rate
// limits). Numbers typed from memory rot silently, so every figure in a
// comparison page must come from here, read out of the live source tree.
//
//   node build/comparisons-facts.cjs binance
//   node build/comparisons-facts.cjs binance bybit coinbase
//   node build/comparisons-facts.cjs --json binance
//
// Competitor-side figures are NOT here — read those off the other project's own
// repository on the day you write the page, and date them in the page.

const fs = require ('fs');
const path = require ('path');

const ROOT = path.resolve (__dirname, '..');

// Pull the `'has': { ... }` object out of a describe() and return key -> literal.
function hasFlags (file) {
    if (!fs.existsSync (file)) {
        return {};
    }
    const src = fs.readFileSync (file, 'utf8');
    const at = src.indexOf ("'has': {");
    if (at < 0) {
        return {};
    }
    let depth = 0;
    let i = src.indexOf ('{', at);
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === '{') {
            depth++;
        } else if (src[i] === '}') {
            depth--;
            if (depth === 0) {
                break;
            }
        }
    }
    const body = src.slice (start + 1, i);
    const flags = {};
    const re = /'([A-Za-z0-9_]+)':\s*(true|false|'emulated'|undefined)/g;
    let m;
    while ((m = re.exec (body))) {
        flags[m[1]] = m[2];
    }
    return flags;
}

// Some exchanges write the value as an expression rather than a literal — btse uses
// `'rateLimit': 1000 / 75, // 75 requests per second`. Matching only the leading digits
// reported 1000 ms instead of 13.3, so read up to the comma and evaluate simple
// arithmetic. Anything that is not digits and + - * / ( ) is left alone.
function firstNumber (file, key) {
    if (!fs.existsSync (file)) {
        return undefined;
    }
    const m = fs.readFileSync (file, 'utf8').match (new RegExp ("'" + key + "':\\s*([^,\\n]+)"));
    if (!m) {
        return undefined;
    }
    const expr = m[1].split ('//')[0].trim ();
    if (!/^[-+*/(). \d]+$/.test (expr)) {
        return undefined;
    }
    try {
        const v = Function ('"use strict"; return (' + expr + ')') ();
        // Three decimals, not two: exchanges write rateLimits like 3.333 and 33.334, and
        // rounding those to 3.33 / 33.33 would make the figure less accurate than the source.
        return (typeof v === 'number' && isFinite (v)) ? Math.round (v * 1000) / 1000 : undefined;
    } catch (e) {
        return undefined;
    }
}

// `setSandboxMode` only works when a `test` key exists inside `urls`. Searching the whole
// file for "'test':" gets this wrong twice over: htx keeps its testnet block commented out,
// and weex has a `'test': false` entry inside its `features` block. Look only for an
// uncommented `test` key within the `urls` object.
function hasSandboxUrl (src) {
    const at = src.indexOf ("'urls': {");
    if (at < 0) {
        return false;
    }
    let depth = 0;
    let i = src.indexOf ('{', at);
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === '{') {
            depth++;
        } else if (src[i] === '}') {
            depth--;
            if (depth === 0) {
                break;
            }
        }
    }
    const urls = src.slice (start + 1, i);
    return urls.split ('\n').some ((line) => /^\s*'test'\s*:/.test (line));
}

function countExchanges (dir) {
    return fs.existsSync (dir) ? fs.readdirSync (dir).filter ((f) => f.endsWith ('.ts')).length : 0;
}

// A derived exchange (binanceus, myokx, kucoinfutures, ...) only OVERRIDES a few `has`
// entries and inherits the rest, so reading its file alone reports 1-3 capabilities and
// badly understates it. Walk the `extends` chain and merge parent-first.
function parentOf (file) {
    const m = fs.readFileSync (file, 'utf8').match (/class\s+\w+\s+extends\s+(\w+)/);
    if (!m) {
        return undefined;
    }
    // pro classes extend `<id>Rest`; strip the suffix used by the WS wrappers
    const name = m[1].replace (/Rest$/, '');
    return fs.existsSync (path.join (ROOT, 'ts', 'src', name + '.ts')) ? name : undefined;
}

function inheritedFlags (id, kind, seen) {
    seen = seen || {};
    if (seen[id]) {
        return {};
    }
    seen[id] = true;
    const file = (kind === 'pro')
        ? path.join (ROOT, 'ts', 'src', 'pro', id + '.ts')
        : path.join (ROOT, 'ts', 'src', id + '.ts');
    if (!fs.existsSync (file)) {
        return {};
    }
    const parent = parentOf (file);
    const base = parent ? inheritedFlags (parent, kind, seen) : {};
    return Object.assign (base, hasFlags (file));
}

function facts (id) {
    const restFile = path.join (ROOT, 'ts', 'src', id + '.ts');
    if (!fs.existsSync (restFile)) {
        throw new Error ('no such exchange: ts/src/' + id + '.ts');
    }
    const proFile = path.join (ROOT, 'ts', 'src', 'pro', id + '.ts');
    const flags = Object.assign ({}, inheritedFlags (id, 'rest'), inheritedFlags (id, 'pro'));
    const on = Object.keys (flags).filter ((k) => flags[k] === 'true');
    const watch = on.filter ((k) => k.startsWith ('watch') || k.startsWith ('unWatch'));
    const implicitFile = path.join (ROOT, 'wiki', 'exchanges-implicit', id + '.md');
    const implicit = fs.existsSync (implicitFile)
        ? (fs.readFileSync (implicitFile, 'utf8').match (/^\| ?`/gm) || []).length
        : undefined;
    const testFile = fs.readFileSync (restFile, 'utf8');
    const sandbox = hasSandboxUrl (testFile);
    return {
        'id': id,
        'inheritsFrom': parentOf (restFile),
        'capabilities': on.length,
        'fetchMethods': on.filter ((k) => k.startsWith ('fetch')).length,
        'watchMethods': watch.length,
        'watchMethodNames': watch,
        'websockets': fs.existsSync (proFile),
        'implicitEndpoints': implicit,
        'rateLimitMs': firstNumber (restFile, 'rateLimit'),
        'sandbox': sandbox,
        'certified': /'certified':\s*true/.test (testFile),
        'pro': /'pro':\s*true/.test (testFile),
    };
}

function main () {
    const argv = process.argv.slice (2);
    const asJson = argv.indexOf ('--json') !== -1;
    const ids = argv.filter ((a) => a !== '--json');
    const totals = {
        'restExchanges': countExchanges (path.join (ROOT, 'ts', 'src')),
        'wsExchanges': countExchanges (path.join (ROOT, 'ts', 'src', 'pro')),
        'errorClasses': (fs.readFileSync (path.join (ROOT, 'ts', 'src', 'base', 'errors.ts'), 'utf8').match (/^class /gm) || []).length,
        'version': JSON.parse (fs.readFileSync (path.join (ROOT, 'package.json'), 'utf8')).version,
    };
    if (!ids.length) {
        console.log (JSON.stringify (totals, null, 2));
        console.log ('\nusage: node build/comparisons-facts.cjs [--json] <exchange> [<exchange> ...]');
        return;
    }
    const out = ids.map (facts);
    if (asJson) {
        console.log (JSON.stringify ({ 'totals': totals, 'exchanges': out }, null, 2));
        return;
    }
    console.log ('ccxt v' + totals.version + ' — ' + totals.restExchanges + ' REST exchanges, '
        + totals.wsExchanges + ' with WebSocket, ' + totals.errorClasses + ' error classes\n');
    for (const f of out) {
        console.log (f.id + (f.inheritsFrom ? '  (derived from ' + f.inheritsFrom + ' — counts include inherited)' : ''));
        console.log ('  unified capabilities (has === true) : ' + f.capabilities);
        console.log ('  fetch* methods                      : ' + f.fetchMethods);
        console.log ('  watch*/unWatch* methods             : ' + f.watchMethods);
        console.log ('  implicit (raw) endpoints            : ' + (f.implicitEndpoints === undefined ? 'run npm run build-docs first' : f.implicitEndpoints));
        console.log ('  base rateLimit (ms between calls)   : ' + f.rateLimitMs);
        console.log ('  websocket support                   : ' + f.websockets);
        console.log ('  sandbox / testnet urls              : ' + f.sandbox);
        console.log ('  certified                           : ' + f.certified);
        console.log ('');
    }
}

main ();
