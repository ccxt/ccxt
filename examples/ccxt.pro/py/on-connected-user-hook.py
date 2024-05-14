import ccxt.pro
from asyncio import run, ensure_future
from pprint import pprint


print('CCXT Version:', ccxt.__version__)


# on_connected() is called when a client connection is established
# note that the exchange will reuse the same client connection
# some exchanges might require two or more public/private connections
# therefore on_connected() may be called more than once

class MyBinance(ccxt.pro.binance):
    def on_connected(self, client, message=None):
        print('Connected to', client.url)
        ensure_future(create_order(self))


async def create_order(exchange):
    symbol = 'BTC/USDT'
    type = 'limit'
    side = 'buy'
    amount = 123.45  # change for your values
    price = 54.321  # change for your values
    params = {}
    try:
        order = await exchange.create_order(symbol, type, side, amount, price, params)
        print('--------------------------------------------------------------')
        print('create_order():')
        pprint(order)
    except Exception as e:
        print(type(e).__name__, str(e))


async def watch_orders(exchange):
    while True:
        try:
            orders = await exchange.watch_orders()
            print('--------------------------------------------------------------')
            print('watch_orders():')
            pprint(orders)
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


exchange = MyBinance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})


run(watch_orders(exchange))
