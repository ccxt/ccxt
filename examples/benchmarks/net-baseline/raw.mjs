// Raw keep-alive HTTPS GET baseline — no CCXT. Node/undici through the agent proxy.
import { ProxyAgent, request } from 'undici';
const URL_ = 'https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD';
const N = +(process.argv[2] || 10), WARM = 3;
const agent = new ProxyAgent({ uri: process.env.HTTPS_PROXY, keepAliveTimeout: 60000 });
const get = async () => { const r = await request(URL_, { dispatcher: agent }); const b = await r.body.arrayBuffer(); return b.byteLength; };
for (let i = 0; i < WARM; i++) await get();
const t = []; let bytes = 0;
for (let i = 0; i < N; i++) { const a = performance.now(); bytes = await get(); t.push(performance.now() - a); await new Promise(r => setTimeout(r, 250)); }
console.log(JSON.stringify({ lang: 'JavaScript', samples: t.map(x => +x.toFixed(2)), bytes }));
