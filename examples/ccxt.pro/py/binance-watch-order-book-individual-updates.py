# -*- coding: utf-8 -*-

from asyncio import get_event_loop
import ccxtpro
from pprint import pprint


class MyBinance(ccxtpro.binance):
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

async def main(loop):
    exchange = MyBinance({
        'enableRateLimit': True, # required https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
        'asyncio_loop': loop,
    })
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


if __name__ == "__main__":
    loop = get_event_loop()
    loop.run_until_complete(main(loop))

