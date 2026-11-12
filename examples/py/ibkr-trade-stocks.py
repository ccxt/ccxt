# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

# Trade US stocks on InteractiveBrokers through the Client Portal Gateway. (you can alternatively use oauth 1.0 if your account allows it)
#
# Prerequisites:
# 1. download and run the client portal gateway locally
#    https://www.interactivebrokers.com/en/trading/ib-api.php#client-portal
# 2. log in at https://localhost:5000 (or any other port) in a browser (the session is reused by ccxt)


async def example():
    exchange = ccxt.interactivebrokers({
        'verify': False,  # the gateway serves a self-signed certificate
        'options': {
            'useGateway': True,
            'gatewayUrl': 'https://localhost:5001',
            'gatewayKeepAlive': False,  # a one-off script, no need for the background keep-alive loop
            # 'accountId': 'UXXXXX',  # optional, defaults to the first account of the session
            'fetchMarkets': {
                'types': ['stock'],  # only load stocks (skip crypto/forex/futures) for a faster load_markets
                'exchanges': {
                    'STK': ['NASDAQ'],  # apple's primary listing venue (the default is NYSE)
                },
            },
        },
    })
    try:
        await exchange.load_markets()
        symbol = 'AAPL.NASDAQ/USD'
        market = exchange.market(symbol)
        print('Found', market['info']['name'], '- conid', market['id'], '- symbol', market['symbol'])
        ticker = await exchange.fetch_ticker(symbol)
        print(symbol, 'last:', ticker['last'], 'bid:', ticker['bid'], 'ask:', ticker['ask'])
        if ticker['last'] is None:
            raise Exception('no last price available (market data subscription required?)')
        # place a limit buy for 1 share, 5% below the last price so it rests on the book
        amount = 1
        price = float(exchange.price_to_precision(symbol, ticker['last'] * 0.95))
        order = await exchange.create_order(symbol, 'limit', 'buy', amount, price)
        order_id = order['id']
        print('Placed order', order_id, order['status'], '-', order['side'], order['amount'], symbol, '@', order['price'])
        fetched = await exchange.fetch_order(order_id, symbol)
        print('Order status:', fetched['status'])
        await exchange.cancel_order(order_id, symbol)
        print('Cancelled order', order_id)
    finally:
        await exchange.close()


asyncio.run(example())
