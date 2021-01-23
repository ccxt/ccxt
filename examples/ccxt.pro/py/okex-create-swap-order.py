# -*- coding: utf-8 -*-

from asyncio import get_event_loop
import ccxtpro


print('CCXT Pro Version: ', ccxtpro.__version__)

exchange = ccxtpro.okex({
    'enableRateLimit': True
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
    'options': { 'defaultType': 'swap' },
})


async def main():
    await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging

    # https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-params
    # https://www.okex.com/docs/en/#swap-swap---orders

    symbol = 'BTC-USD-SWAP'
    amount = 1  # how may contracts
    price = None  # or your limit price
    side = 'buy'  # or 'sell'
    type = '1'  # 1 open long, 2 open short, 3 close long, 4 close short for futures
    order_type = '4' # 0 = limit order, 4 = market order

    try:
        # open long market price order
        order = await exchange.create_order(symbol, 'market', side, amount, price, {'type': type});
        # --------------------------------------------------------------------
        # open long market price order
        # const order = await exchange.create_order(symbol, type, side, amount, price, {'order_type': order_type});
        # --------------------------------------------------------------------
        # close short market price order
        # const order = await exchange.create_order(symbol, 'market', side, amount, price, {'type': type, 'order_type': order_type});
        # --------------------------------------------------------------------
        # close short market price order
        # const order = await exchange.create_order(symbol, '4', side, amount, price, {'order_type': order_type});
        # ...
        print(order)
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()


if __name__ == '__main__':
    get_event_loop().run_until_complete(main())
