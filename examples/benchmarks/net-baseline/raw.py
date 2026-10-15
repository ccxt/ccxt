# Raw keep-alive HTTPS GET baseline — no CCXT. aiohttp (what CCXT async uses) through the agent proxy.
import asyncio, json, os, sys, time, aiohttp, certifi, ssl
URL = 'https://api.coinbase.com/api/v3/brokerage/market/product_book?product_id=BTC-USD'
N = int(sys.argv[1]) if len(sys.argv) > 1 else 10
async def main():
    ctx = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE', certifi.where()))
    conn = aiohttp.TCPConnector(ssl=ctx, limit=10, keepalive_timeout=60)
    proxy = os.environ.get('HTTPS_PROXY')
    async with aiohttp.ClientSession(connector=conn) as s:
        async def get():
            async with s.get(URL, proxy=proxy) as r:
                return len(await r.read())
        for _ in range(3): await get()
        t, b = [], 0
        for _ in range(N):
            a = time.perf_counter(); b = await get(); t.append(round((time.perf_counter() - a) * 1000, 2))
            await asyncio.sleep(0.25)
        print(json.dumps({'lang': 'Python', 'samples': t, 'bytes': b}))
asyncio.run(main())
