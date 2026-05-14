- [Async Bitstamp Create Order Cancel Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

from asyncio import run
import ccxt.async_support as ccxt
from pprint import pprint


print('CCXT Version:', ccxt.__version__)


async def main():
    exchange = ccxt.bitstamp({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'uid': 'YOUR_UID',
    })
    markets = await exchange.load_markets()
    exchange.verbose = True  # enable verbose mode after loading the markets
    print('-------------------------------------------------------------------')
    try:
        balance = await exchange.fetch_balance()
        pprint(balance)
    except Exception as e:
        print('Failed to fetch the balance')
        print(type(e).__name__, str(e))
    order = None
    print('-------------------------------------------------------------------')
    try:
        symbol = 'BTC/USDT'
        market = exchange.market(symbol)
        base = market['base']
        quote = market['quote']
        pprint(balance[base])
        pprint(balance[quote])
        amount = 0.001
        price = 40000
        order_type = 'limit'
        side = 'sell'
        order = await exchange.create_order(symbol, order_type, side, amount, price)
        pprint(order)
    except Exception as e:
        print('Failed to place', symbol, 'order')
        print(type(e).__name__, str(e))
    print('-------------------------------------------------------------------')
    if order is not None:
        try:
            response = await exchange.cancel_order(order['id'], order['symbol'])
            pprint(response)
        except Exception as e:
            print('Failed to cancel', symbol, 'order')
            print(type(e).__name__, str(e))
    print('-------------------------------------------------------------------')
    await exchange.close()


run(main())
 
```