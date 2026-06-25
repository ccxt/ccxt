# -*- coding: utf-8 -*-

from asyncio import run
import ccxt.pro as ccxt


class MyBinance(ccxt.binance):
    def handle_order_book_message(self, client, message, orderbook):
        asks = self.safe_value(message, 'a', [])
        bids = self.safe_value(message, 'b', [])
        # printing high-frequency updates is a resource-heavy task
        # this print statement is here just to demonstrate the work of it
        # replace it with you logic for processing individual updates
        print('Updates:', {
            'asks': asks,
            'bids': bids,
        })
        return super(MyBinance, self).handle_order_book_message(client, message, orderbook);

async def main():
    exchange = MyBinance()
    symbol = 'BTC/USDT'
    print('Watching', exchange.id, symbol)
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            # break  # you can also break just this one loop if it fails
    await exchange.close()


run(main())
