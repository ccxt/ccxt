import asyncio
import json
import sys
sys.path.insert(0, 'python')
import ccxt.prediction as cp


async def run(label, coro_fn):
    try:
        r = await coro_fn()
        n = len(r) if isinstance(r, list) else (1 if r else 0)
        print('PASS  ' + label + '  -> ' + str(n) + ' item(s)')
    except Exception as e:
        name = type(e).__name__
        msg = str(e)
        reached = (name == 'OrderNotFound') or ('not found' in msg) or ('already canceled' in msg)
        print(('PASS* ' if reached else 'FAIL  ') + label + '  -> ' + name + ': ' + msg[:110])


async def main():
    keys = json.load(open('keys.local.json'))['limitless']
    ex = cp.limitless({'apiKey': keys['apiKey'], 'secret': keys['secret'], 'walletAddress': keys.get('walletAddress')})
    try:
        await ex.load_markets()
        outcome = None
        slug = None
        for m in ex.markets.values():
            info = m.get('info') or {}
            venue = info.get('venue') or {}
            if venue.get('exchange') and m.get('outcomes'):
                outcome = m['outcomes'][0]['outcome']
                slug = info.get('slug')
                break
        print('using outcome', outcome, 'slug', slug, '\n')
        fake = '11111111-1111-4111-8111-111111111111'
        await run('fetchAccounts', lambda: ex.fetch_accounts())
        await run('fetchPositions', lambda: ex.fetch_positions())
        await run('fetchMyTrades (all)', lambda: ex.fetch_my_trades())
        await run('fetchMyTrades (outcome)', lambda: ex.fetch_my_trades(outcome))
        await run('fetchOrders (outcome)', lambda: ex.fetch_orders(outcome))
        await run('fetchOpenOrders (outcome)', lambda: ex.fetch_open_orders(outcome))
        await run('fetchClosedOrders (outcome)', lambda: ex.fetch_closed_orders(outcome))
        await run('fetchOrder (fake id)', lambda: ex.fetch_order(fake, outcome))
        await run('fetchOrdersByIds (fake id)', lambda: ex.fetch_orders_by_ids([fake], outcome))
        await run('cancelOrder (fake id)', lambda: ex.cancel_order(fake, outcome))
        await run('cancelOrders (fake id)', lambda: ex.cancel_orders([fake], outcome))
        await run('cancelAllOrders (slug, no-op)', lambda: ex.cancel_all_orders(None, {'slug': slug, 'warnOnCancelAllOrdersWithOutcome': False}))
    finally:
        await ex.close()


asyncio.run(main())
