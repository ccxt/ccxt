import asyncio, json, sys
sys.path.insert(0, 'python')
import ccxt.prediction as cp
async def main():
    k = json.load(open('keys.local.json'))['limitless']
    ex = cp.limitless({'apiKey': k['apiKey'], 'secret': k['secret'], 'walletAddress': k['walletAddress']})
    try:
        await ex.load_markets()
        print('outcomes registered:', len(ex.outcomes))
        handle=None; mkt=None
        for m in ex.markets.values():
            info=m.get('info') or {}; venue=info.get('venue') or {}
            if venue.get('exchange') and m.get('outcomes'):
                handle=m['outcomes'][0]['outcome']; mkt=m; break
        print('market marketType=', mkt.get('marketType'), 'executionModel=', mkt.get('executionModel'))
        t = await ex.fetch_ticker(handle)
        print('fetchTicker outcome=', t.get('outcome'), '| symbol present?', t.get('symbol') is not None, '| last=', t.get('last'))
    finally:
        await ex.close()
asyncio.run(main())
