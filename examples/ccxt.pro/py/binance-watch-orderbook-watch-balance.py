import ccxt.pro
from asyncio import run, gather


data = {
    'orderbook': None,
    'balance': None,
}


def common_handler(exchange, symbol):
    market = exchange.market(symbol)
    base = market['base']
    quote = market['quote']
    balance = data['balance']
    orderbook = data['orderbook']
    if balance and orderbook:
        total = balance['total']
        tip = [ orderbook['asks'][0], orderbook['bids'][0] ]
        print(exchange.iso8601(exchange.milliseconds()), symbol, 'orderbook:', tip, 'balance:', total)


async def watch_order_book(exchange, symbol):
    while True:
        try:
            data['orderbook'] = await exchange.watch_order_book(symbol)
            common_handler(exchange, symbol)
        except Exception as e:
            print(type(e).__name__, str(e))
            break  # break this loop


async def watch_balance(exchange, symbol):
    while True:
        try:
            data['balance'] = await exchange.watch_balance()
            common_handler(exchange, symbol)
        except Exception as e:
            print(type(e).__name__, str(e))
            break  # break this loop


async def main():
    exchange = ccxt.pro.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
    await exchange.load_markets()
    symbol = 'BTC/USDT'
    while True:
        try:
            loops = [
                watch_order_book(exchange, symbol),
                watch_balance(exchange, symbol)
            ]
            await gather(*loops)
        except Exception as e:
            print(type(e).__name__, str(e))
            break
    await exchange.close()


run(main())
