// Re-capture the generated half of `markets/<id>.json` + `currencies/<id>.json`.
//
//     node julia/Ccxt/test/fixtures/gen_markets.cjs
//
// Source of truth is the built JS bundle (`js/ccxt.js`) -- the same transpile the
// Julia sources are generated from -- so a fixture recorded here reflects what
// CCXT itself believes the market set to be.
//
// Two rules keep this safe to re-run, both learned the hard way (an earlier
// ad-hoc version of this script silently overwrote the curated fixtures and
// broke the bybit request tests with a 244k-line diff):
//
//   1. Exchanges tracked in git are NEVER written. Those five are curated to
//      match the recorded request/response fixtures -- see markets/README.md.
//   2. Output is trimmed to a few markets per exchange. Full dumps are 200 MB;
//      the trimmed set is ~2 MB and covers the same code paths, because what
//      selects between paths is the market *type*, not the symbol count.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ccxt = require('../../../../js/ccxt.js');

const HERE = __dirname;
const REPO = path.resolve(HERE, '../../../..');
const EX_DIR = path.join(REPO, 'julia/Ccxt/src/exchanges');

const MAX_PER_TYPE = 2;   // markets kept per market type
const MAX_MARKETS = 8;    // hard ceiling per exchange
const MAX_CURRENCIES = 8;

// Rule 1: whatever git tracks is curated, and off limits.
const curated = new Set(
    execFileSync('git', ['-C', REPO, 'ls-files', 'julia/Ccxt/test/fixtures/markets'],
                 { encoding: 'utf8' })
        .split('\n')
        .filter((p) => p.endsWith('.json'))
        .map((p) => path.basename(p, '.json')),
);

const ids = fs.readdirSync(EX_DIR)
    .filter((f) => f.endsWith('.jl'))
    .map((f) => f.replace(/\.jl$/, ''))
    .sort();

// Prefer liquid, recognisable pairs so the kept markets look like real usage.
const QUOTE_RANK = { USDT: 0, USD: 1, USDC: 2, BTC: 3, EUR: 4 };
const BASE_RANK = { BTC: 0, ETH: 1, SOL: 2, XRP: 3, LTC: 4 };

function marketRank ([symbol, m]) {
    return [
        QUOTE_RANK[m.quote] ?? 9,
        BASE_RANK[m.base] ?? 9,
        symbol.length,
        symbol,
    ];
}

function pickMarkets (markets) {
    const entries = Object.entries(markets).sort((a, b) => {
        const [ra, rb] = [marketRank(a), marketRank(b)];
        for (let i = 0; i < ra.length; i++) {
            if (ra[i] < rb[i]) return -1;
            if (ra[i] > rb[i]) return 1;
        }
        return 0;
    });
    const byType = {};
    for (const e of entries) {
        const t = e[1].type || 'unknown';
        (byType[t] = byType[t] || []).push(e);
    }
    // Round-robin across types so no single type crowds the others out.
    const kept = {};
    for (let i = 0; i < MAX_PER_TYPE; i++) {
        for (const t of Object.keys(byType).sort()) {
            if (i < byType[t].length && Object.keys(kept).length < MAX_MARKETS) {
                kept[byType[t][i][0]] = byType[t][i][1];
            }
        }
    }
    return kept;
}

function pickCurrencies (currencies, keptMarkets) {
    const needed = new Set();
    for (const m of Object.values(keptMarkets)) {
        for (const k of ['base', 'quote', 'settle']) {
            if (m[k]) needed.add(m[k]);
        }
    }
    const kept = {};
    for (const c of [...needed].sort()) {
        if (currencies[c]) kept[c] = currencies[c];
    }
    for (const c of Object.keys(currencies).sort()) {
        if (Object.keys(kept).length >= Math.max(MAX_CURRENCIES, needed.size)) break;
        if (!(c in kept)) kept[c] = currencies[c];
    }
    return kept;
}

(async () => {
    const report = [];
    let written = 0, skipped = 0;
    for (const id of ids) {
        if (curated.has(id)) {
            report.push([id, 'curated-skipped']);
            continue;
        }
        const Cls = ccxt[id] || ccxt[id.charAt(0).toUpperCase() + id.slice(1)];
        if (!Cls) {
            report.push([id, 'no-js-class']);
            skipped++;
            continue;
        }
        try {
            const ex = new Cls();
            ex.enableRateLimit = false;
            await ex.loadMarkets();
            const markets = pickMarkets(ex.markets || {});
            const currencies = pickCurrencies(ex.currencies || {}, markets);
            fs.writeFileSync(path.join(HERE, 'markets', id + '.json'),
                             JSON.stringify(markets, null, 1) + '\n');
            fs.writeFileSync(path.join(HERE, 'currencies', id + '.json'),
                             JSON.stringify(currencies, null, 1) + '\n');
            report.push([id, 'ok', Object.keys(markets).length, Object.keys(currencies).length]);
            written++;
        } catch (e) {
            // Expected for the four exchanges that need a live authorised call;
            // markets/README.md lists them and `load_all` asserts they stay absent.
            report.push([id, 'ERR', e.message.slice(0, 120)]);
            skipped++;
        }
    }
    fs.writeFileSync(path.join(HERE, 'markets_gen_report.json'),
                     JSON.stringify(report, null, 1) + '\n');
    console.log(`${written} written, ${skipped} skipped, ${curated.size} curated left untouched`);
})();
