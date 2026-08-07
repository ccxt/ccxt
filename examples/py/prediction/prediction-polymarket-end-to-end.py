# -*- coding: utf-8 -*-

# Polymarket end-to-end example (read market data + place/fetch/cancel one order).
#
# Flow:
#   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
#   2. fetch the order book, ticker and recent trades for that outcome
#   3. place a resting limit BUY well below the book, fetch it back, then cancel it
#
# Usage:
#   POLYMARKET_PRIVATEKEY=... POLYMARKET_WALLETADDRESS=0x... \
#   python3 examples/py/prediction/prediction-polymarket-end-to-end.py
#
# walletAddress is the polymarket account wallet (the proxy / deposit wallet shown in
# your polymarket profile), privateKey is the key of the EOA that owns it.

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root + '/python')

import ccxt.prediction  # noqa: E402

MAX_NOTIONAL_USD = 25   # hard cap per trade
ORDER_SIZE_SHARES = 5   # polymarket minimum order size


async def main():
    private_key = os.environ.get('POLYMARKET_PRIVATEKEY')
    wallet_address = os.environ.get('POLYMARKET_WALLETADDRESS')
    if not private_key or not wallet_address:
        print('Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.')
        return
    exchange = ccxt.prediction.polymarket({
        'privateKey': private_key,
        'walletAddress': wallet_address,
    })
    try:
        # 1) pick a high-volume event and an outcome with a live two-sided book ------------
        # fetch_events requires a scope (query/queries/tags/eventId/slug); sort/limit apply within it
        events = await exchange.fetch_events({'query': 'fed', 'sort': 'volume', 'limit': 15})
        chosen = None
        probes = 0
        for event in events:
            for market in (event.get('markets') or []):
                for outcome in (market.get('outcomes') or []):
                    if probes >= 20:
                        break
                    probes += 1
                    orderbook = await exchange.fetch_order_book(outcome['outcome'])
                    if orderbook['bids'] and orderbook['asks']:
                        chosen = {'event': event, 'market': market, 'outcome': outcome, 'orderbook': orderbook}
                        break
                if chosen:
                    break
            if chosen:
                break
        if chosen is None:
            print('Could not find an outcome with a live two-sided order book right now.')
            return
        # the tradeable handle is the outcome's `outcome` field ("MARKET:LABEL")
        symbol = chosen['outcome']['outcome']
        print('event:   ', chosen['event'].get('title'))
        print('market:  ', chosen['market'].get('symbol'))
        print('outcome: ', symbol, '(' + (chosen['outcome'].get('label') or '') + ')')

        # 2) market data for the chosen outcome --------------------------------------------
        best_bid = chosen['orderbook']['bids'][0]
        best_ask = chosen['orderbook']['asks'][0]
        print('\n--- market data ---')
        print('orderbook bid/ask:', best_bid, '/', best_ask)
        try:
            ticker = await exchange.fetch_ticker(symbol)
            print('ticker bid/ask/last:', ticker.get('bid'), '/', ticker.get('ask'), '/', ticker.get('last'))
        except Exception as e:
            print('ticker:        n/a (' + type(e).__name__ + ')')
        try:
            trades = await exchange.fetch_trades(symbol, None, 3)
            print('recent trades:', len(trades), ('last @ ' + str(trades[0]['price'])) if trades else '')
        except Exception as e:
            print('trades:        n/a (' + type(e).__name__ + ')')

        # 3) place a resting limit BUY well below the book, fetch it, then cancel -----------
        precision = chosen['outcome'].get('precision') or {}
        tick = precision.get('price') or 0.01
        bid_price = best_bid[0]
        # half the best bid, floored to the tick — far below the ask, so it cannot fill
        price = max(tick, round(int((bid_price * 0.5) / tick) * tick, 4))
        notional = ORDER_SIZE_SHARES * price
        print('\n--- order ---')
        print('placing limit BUY', ORDER_SIZE_SHARES, 'shares @', price, '(notional', round(notional, 2), 'USD)')
        if notional >= MAX_NOTIONAL_USD:
            print('ABORT: notional >=', MAX_NOTIONAL_USD, 'USD safety cap.')
            return
        order = None
        try:
            order = await exchange.create_order(symbol, 'limit', 'buy', ORDER_SIZE_SHARES, price)
            print('placed:  id', order['id'], '| status', order['status'])
            fetched = await exchange.fetch_order(order['id'], symbol)
            print('fetched: id', fetched['id'], '| status', fetched['status'], '| remaining', fetched['remaining'])
        finally:
            if order and order.get('id'):
                canceled = await exchange.cancel_order(order['id'], symbol)
                print('canceled: id', canceled['id'], '| status', canceled['status'])
    finally:
        await exchange.close()


asyncio.run(main())
