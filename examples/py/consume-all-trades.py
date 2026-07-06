import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


async def consume_all_trades(exchange, symbol):
    await exchange.load_markets()
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            print('----------------------------------------------------------------------')
            print(exchange.iso8601(exchange.milliseconds()), 'received', len(trades), 'new', symbol, 'trades:')
            for trade in trades:
                print(exchange.id, symbol, trade['id'], trade['datetime'], trade['amount'], trade['price'])
            exchange.trades[symbol].clear()
        except Exception as e:
            print(type(e).__name__, str(e))
    await exchange.close()


exchange = ccxt.pro.bitmex()
symbol = 'BTC/USD'
run(consume_all_trades(exchange, symbol))
