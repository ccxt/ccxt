import asyncio
import json
import sys
sys.path.insert(0, 'python')
import ccxt.prediction as cp


async def main():
    k = json.load(open('keys.local.json'))['limitless']
    ex = cp.limitless({'apiKey': k['apiKey'], 'secret': k['secret'], 'walletAddress': k['walletAddress'], 'privateKey': k['privateKey']})
    try:
        await ex.load_markets()
        outcome = None
        book = None
        for m in ex.markets.values():
            info = m.get('info') or {}
            venue = info.get('venue') or {}
            slug = info.get('slug')
            if not (venue.get('exchange') and m.get('outcomes') and slug):
                continue
            if '5-min' in slug or 'hourly' in slug:
                continue
            try:
                ob = await ex.fetch_order_book(m['outcomes'][0]['outcome'])
                if ob and ob.get('bids') and len(ob['bids']) and ob['bids'][0][0] > 0.05:
                    outcome = m['outcomes'][0]['outcome']
                    book = ob
                    break
            except Exception:
                pass
        print('outcome', outcome, 'bestBid', book['bids'][0])
        placed = await ex.create_order(outcome, 'limit', 'buy', 5, 0.02, {'timeInForce': 'GTC', 'postOnly': True})
        print('PLACED id', placed['id'], 'status', placed['status'])
        await asyncio.sleep(4.5)
        openo = await ex.fetch_open_orders(outcome)
        mine = [o for o in openo if o['id'] == placed['id']]
        print('fetchOpenOrders:', len(openo), 'mine present:', len(mine) > 0)
        canceled = await ex.cancel_order(placed['id'], outcome)
        print('CANCELED:', json.dumps(canceled.get('info') or canceled)[:120])
        await asyncio.sleep(1.5)
        after = await ex.fetch_open_orders(outcome)
        still = [o for o in after if o['id'] == placed['id']]
        print('after cancel, mine still open:', len(still) > 0, '(should be False)')
    finally:
        await ex.close()


asyncio.run(main())
