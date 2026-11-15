# -*- coding: utf-8 -*-

# Binance prediction end-to-end example (events + market data + trading + history)
#
# Binance aggregates on-chain prediction markets (predict.fun on BNB Chain) behind its
# standard signed SAPI — every endpoint, including market data, needs credentials:
#   - apiKey / secret = a regular binance API key with Web3 Wallet permissions
# A Binance Web3 prediction wallet must exist on the account (create one in the app).
#
# Flow:
#   1. fetch_events scoped by a search query (binance requires a scope)
#   2. pick an active market + outcome handle, show ticker / order book
#   3. balance
#   4. trading round-trip: create_order (resting limit) -> fetch_open_orders -> cancel_order
#   5. account history: fetch_orders, fetch_my_trades, fetch_positions
#
# Usage:
#   BINANCE_APIKEY=... BINANCE_SECRET=... \
#   python3 examples/py/prediction/prediction-binance-end-to-end.py

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root + '/python')

import ccxt.prediction  # noqa: E402

MAX_NOTIONAL_USD = 25   # hard cap per trade
ORDER_SIZE_SHARES = 10  # 10 shares @ 0.25 = 2.5 USDT notional (>= the ~1.5 minimum)
ORDER_PRICE = 0.25      # far below a ~0.5 market so the order rests without filling


async def main():
    api_key = os.environ.get('BINANCE_APIKEY')
    secret = os.environ.get('BINANCE_SECRET')
    if not api_key or not secret:
        print('Set BINANCE_APIKEY and BINANCE_SECRET env vars first.')
        return
    exchange = ccxt.prediction.binance({
        'apiKey': api_key,
        'secret': secret,
    })
    try:
        # 1) events scoped by a search query --------------------------------------------------
        print('\n--- events (query: btc) ---')
        events = await exchange.fetch_events({'query': 'btc', 'limit': 5})
        print('events found:', len(events))
        for event in events:
            markets = event.get('markets') or []
            print('  ' + str(event['title']) + ' — ' + str(len(markets)) + ' markets, ends ' + str(event['endDatetime']))

        # 2) pick an active outcome + market data ---------------------------------------------
        print('\n--- market data ---')
        outcome = None
        for event in events:
            for market in (event.get('markets') or []):
                outcomes = market.get('outcomes') or []
                if market.get('active') and len(outcomes) > 0:
                    # the outcome handle looks like MARKET_SLUG_WORDS:UP — it addresses one token
                    outcome = outcomes[0]['outcome']
                    break
            if outcome:
                break
        if outcome is None:
            print('no active markets to trade right now.')
            return
        print('outcome:', outcome)
        ticker = await exchange.fetch_ticker(outcome)
        print('last trade price:', ticker['last'])
        orderbook = await exchange.fetch_order_book(outcome)
        print('orderbook top bid/ask:', orderbook['bids'][0], '/', orderbook['asks'][0])

        # 3) balance --------------------------------------------------------------------------
        print('\n--- balance ---')
        # the funded payment option is usually CeDeFi; SPOT/FUNDING appear here too
        balance = await exchange.fetch_balance({'type': 'CeDeFi'})
        usdt = balance.get('USDT') or {}
        print('USDT free (CeDeFi):', usdt.get('free'))

        # 4) trading round-trip: create (resting) -> fetch_open_orders -> cancel --------------
        print('\n--- order ---')
        notional = ORDER_SIZE_SHARES * ORDER_PRICE
        if notional >= MAX_NOTIONAL_USD:
            print('ABORT: notional >=', MAX_NOTIONAL_USD, 'USD safety cap.')
            return
        order_id = None
        try:
            # orders require params['accountType']: 'SPOT' or 'FUNDING'
            order = await exchange.create_order(outcome, 'limit', 'buy', ORDER_SIZE_SHARES, ORDER_PRICE, {'accountType': 'SPOT'})
            order_id = order['id']
            print('placed:   id', order_id, '| price', ORDER_PRICE, '| shares', ORDER_SIZE_SHARES)
            open_orders = await exchange.fetch_open_orders(outcome)
            print('open orders for outcome:', len(open_orders))
        finally:
            if order_id is not None:
                canceled = await exchange.cancel_order(order_id, outcome)
                print('canceled: id', canceled['id'], '| status', canceled['status'])

        # 5) account history ------------------------------------------------------------------
        print('\n--- history ---')
        orders = await exchange.fetch_orders(None, None, 5)
        print('recent orders:', len(orders))
        my_trades = await exchange.fetch_my_trades(None, None, 5)
        last_fill = ('last ' + str(my_trades[0]['side']) + ' @ ' + str(my_trades[0]['price'])) if my_trades else ''
        print('recent fills:', len(my_trades), last_fill)
        positions = await exchange.fetch_positions()
        for position in positions:
            print('position:', position['outcome'], '| shares', position['contractSize'], '| entry', position['entryPrice'], '| uPnL', position['unrealizedPnl'])
    finally:
        await exchange.close()


asyncio.run(main())
