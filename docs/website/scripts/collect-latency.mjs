// Collector behind the "How far is your exchange?" blog post. Measures how long each
// venue's public order-book endpoint takes to answer, from eight cities on six continents,
// using Globalping (jsDelivr's free community probe network, no API key needed).
//
// Usage:
//   node scripts/collect-latency.mjs [rounds]     # default 5 -> src/data/latency-data.json
//
// Each round asks Globalping for one HTTPS GET per venue per city and records the per-phase
// timings it returns (DNS / TCP / TLS / first byte / total). We report the MEDIAN time to
// first byte over the valid round trips, because single samples on long-haul routes are
// noisy enough to be meaningless. A cell where most samples were refused (Binance's 451 in
// the US, Bybit's 403 from some datacenter ranges) is recorded as blocked instead of slow —
// those are access failures, not latency.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname (fileURLToPath (import.meta.url));
const OUT = join (__dirname, '..', 'src', 'data', 'latency-data.json');
const API = 'https://api.globalping.io/v1/measurements';
const ROUNDS = Number (process.argv[2] || 5);

const REGIONS = [
    { key: 'us-east', label: 'New York', magic: 'New York', lat: 40.71, lon: -74.01 },
    { key: 'eu-west', label: 'London', magic: 'London', lat: 51.51, lon: -0.13 },
    { key: 'eu-central', label: 'Frankfurt', magic: 'Frankfurt', lat: 50.11, lon: 8.68 },
    { key: 'ap-ne', label: 'Tokyo', magic: 'Tokyo', lat: 35.69, lon: 139.69 },
    { key: 'ap-se', label: 'Singapore', magic: 'Singapore', lat: 1.35, lon: 103.82 },
    { key: 'ap-east', label: 'Hong Kong', magic: 'Hong Kong', lat: 22.32, lon: 114.17 },
    { key: 'oceania', label: 'Sydney', magic: 'Sydney', lat: -33.87, lon: 151.21 },
    { key: 'sa-east', label: 'Sao Paulo', magic: 'Sao Paulo', lat: -23.55, lon: -46.63 },
];

// The endpoint each venue's fetchOrderBook maps to under the hood. Hyperliquid's data API
// is POST-only, so GET /info is answered by the origin with a 405 — not an order book, but
// still a real end-to-end round trip, which is what we are timing.
const EXCHANGES = [
    { id: 'binance', name: 'Binance', kind: 'spot', host: 'api.binance.com', path: '/api/v3/depth', query: 'symbol=BTCUSDT&limit=5' },
    { id: 'bybit', name: 'Bybit', kind: 'spot', host: 'api.bybit.com', path: '/v5/market/orderbook', query: 'category=spot&symbol=BTCUSDT&limit=5' },
    { id: 'gate', name: 'Gate.io', kind: 'spot', host: 'api.gateio.ws', path: '/api/v4/spot/order_book', query: 'currency_pair=BTC_USDT&limit=5' },
    { id: 'okx', name: 'OKX', kind: 'spot', host: 'www.okx.com', path: '/api/v5/market/books', query: 'instId=BTC-USDT&sz=5' },
    { id: 'kucoin', name: 'KuCoin', kind: 'spot', host: 'api.kucoin.com', path: '/api/v1/market/orderbook/level2_20', query: 'symbol=BTC-USDT' },
    { id: 'hyperliquid', name: 'Hyperliquid', kind: 'perp', host: 'api.hyperliquid.xyz', path: '/info', query: '', note: 'POST-only API; GET /info answered by origin with 405, TTFB is a valid round trip' },
    { id: 'bitget', name: 'Bitget', kind: 'spot', host: 'api.bitget.com', path: '/api/v2/spot/market/orderbook', query: 'symbol=BTCUSDT&limit=5' },
    { id: 'polymarket', name: 'Polymarket', kind: 'prediction', host: 'clob.polymarket.com', path: '/book', query: '', note: 'live CLOB order book; token_id resolved at runtime' },
    { id: 'coinbase', name: 'Coinbase', kind: 'spot', host: 'api.exchange.coinbase.com', path: '/products/BTC-USD/book', query: 'level=1' },
    { id: 'kraken', name: 'Kraken', kind: 'spot', host: 'api.kraken.com', path: '/0/public/Depth', query: 'pair=XBTUSD&count=5' },
];

const sleep = (ms) => new Promise ((r) => setTimeout (r, ms));

function median (values) {
    if (!values.length) return null;
    const sorted = values.slice ().sort ((a, b) => a - b);
    const mid = Math.floor (sorted.length / 2);
    return (sorted.length % 2) ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Polymarket books are keyed by a market token that rotates as markets resolve, so grab a
// live one per run rather than committing an id that goes stale.
async function resolvePolymarketToken () {
    try {
        const res = await fetch ('https://gamma-api.polymarket.com/markets?closed=false&order=volumeNum&ascending=false&limit=1');
        const markets = await res.json ();
        const ids = JSON.parse (markets[0]['clobTokenIds']);
        console.log (`  polymarket token: ${ids[0].slice (0, 16)}... (${markets[0]['question']})`);
        return ids[0];
    } catch (e) {
        console.warn (`  polymarket token lookup failed (${e.message}), skipping venue this run`);
        return undefined;
    }
}

// Globalping is async: POST creates the measurement, then poll until every probe reports.
async function measure (exchange, token) {
    const query = (exchange.id === 'polymarket') ? `token_id=${token}` : exchange.query;
    // globalping rejects an empty query string, so only send the key when there is one
    const request = { 'method': 'GET', 'path': exchange.path };
    if (query) request['query'] = query;
    const body = {
        'type': 'http',
        'target': exchange.host,
        'locations': REGIONS.map ((r) => ({ 'magic': r.magic })),
        'measurementOptions': { 'protocol': 'HTTPS', 'request': request },
    };
    const created = await fetch (API, {
        'method': 'POST',
        'headers': { 'Content-Type': 'application/json' },
        'body': JSON.stringify (body),
    });
    if (!created.ok) {
        throw new Error (`globalping POST ${created.status}: ${await created.text ()}`);
    }
    const { id } = await created.json ();
    for (let i = 0; i < 60; i++) {
        await sleep (1000);
        const res = await fetch (`${API}/${id}`);
        const measurement = await res.json ();
        if (measurement.status !== 'in-progress') return measurement;
    }
    throw new Error (`measurement ${id} did not finish in 60s`);
}

const samples = new Map (); // `${exchange}|${region}` -> array of per-round results

function record (exchangeId, measurement) {
    // Probe order matches the order of `locations` we requested.
    measurement.results.forEach ((probe, i) => {
        const region = REGIONS[i];
        if (!region) return;
        const key = `${exchangeId}|${region.key}`;
        if (!samples.has (key)) samples.set (key, []);
        const t = probe.result.timings || {};
        samples.get (key).push ({
            'status': probe.result.statusCode ?? 0,
            'ttfb': t.firstByte ?? null,
            'tcp': t.tcp ?? null,
            'total': t.total ?? null,
        });
    });
}

// A status is "blocked" when the venue answered but refused us: 451 geo-block, 403 from a
// datacenter range, 429 rate limit. 405 is Hyperliquid's expected wrong-method answer and
// counts as a valid round trip. 0 means the probe itself failed — neither blocked nor valid.
const isBlocked = (status) => status === 451 || status === 403 || status === 429;
const isValid = (status) => status > 0 && !isBlocked (status);

function summarise (exchangeId, region) {
    const rows = samples.get (`${exchangeId}|${region.key}`) || [];
    const blocked = rows.filter ((r) => isBlocked (r.status));
    const valid = rows.filter ((r) => isValid (r.status) && r.ttfb != null);
    const blockedMajority = blocked.length > rows.length / 2;
    const ttfbs = valid.map ((r) => r.ttfb);
    const statusCodes = [...new Set (rows.map ((r) => r.status))];
    if (blockedMajority || !ttfbs.length) {
        return {
            'exchange': exchangeId, 'region': region.key,
            'ttfb': null, 'ttfbMin': null, 'ttfbMax': null, 'tcp': null, 'total': null,
            'samples': rows.length, 'ok': valid.length, 'blocked': blocked.length,
            'blockedMajority': blockedMajority, 'statusCodes': statusCodes,
        };
    }
    return {
        'exchange': exchangeId, 'region': region.key,
        'ttfb': median (ttfbs),
        'ttfbMin': Math.min (...ttfbs),
        'ttfbMax': Math.max (...ttfbs),
        'tcp': median (valid.map ((r) => r.tcp).filter ((v) => v != null)),
        'total': median (valid.map ((r) => r.total).filter ((v) => v != null)),
        'samples': rows.length, 'ok': valid.length, 'blocked': blocked.length,
        'blockedMajority': false, 'statusCodes': statusCodes,
    };
}

const token = await resolvePolymarketToken ();
const venues = EXCHANGES.filter ((e) => (e.id !== 'polymarket') || token);

for (let round = 1; round <= ROUNDS; round++) {
    console.log (`round ${round}/${ROUNDS}`);
    for (const exchange of venues) {
        try {
            record (exchange.id, await measure (exchange, token));
            process.stdout.write (`  ${exchange.id} ok\n`);
        } catch (e) {
            process.stdout.write (`  ${exchange.id} failed: ${e.message}\n`);
        }
    }
}

const dataset = {
    'generatedAt': new Date ().toISOString (),
    'method': 'Globalping HTTPS GET to each exchange public order-book endpoint; median TTFB over valid round trips.',
    'rounds': ROUNDS,
    'metric': 'ttfb_ms',
    'regions': REGIONS.map (({ key, label, lat, lon }) => ({ key, label, lat, lon })),
    'exchanges': venues.map ((e) => {
        const query = (e.id === 'polymarket') ? `token_id=${token}` : e.query;
        const entry = {
            'id': e.id,
            'name': e.name,
            'endpoint': `https://${e.host}${e.path}${query ? '?' + query : ''}`,
            'kind': e.kind,
        };
        if (e.note) entry['note'] = e.note;
        return entry;
    }),
    'data': venues.flatMap ((e) => REGIONS.map ((r) => summarise (e.id, r))),
};
writeFileSync (OUT, JSON.stringify (dataset));
console.log (`Wrote ${OUT} (${dataset.data.length} cells over ${ROUNDS} rounds)`);
