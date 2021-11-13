# -*- coding: utf-8 -*-

from asyncio import get_event_loop
import ccxtpro
from pprint import pprint


class MyBinance(ccxtpro.binance):
    def handle_ohlcv(self, client, message):
        # add your handling of the original message here
        print('intercepted', message)
        return super(MyBinance, self).handle_ohlcv(client, message)


async def main(loop):
    exchange = MyBinance()
    symbol = 'BTC/USDT'
    print('Watching', exchange.id, symbol)
    while True:
        try:
            ohlcv = await exchange.watch_ohlcv(symbol, '1m')
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            # break  # you can also break just this one loop if it fails
    await exchange.close()


if __name__ == "__main__":
    print('CCXT Pro Version:', ccxtpro.__version__)
    loop = get_event_loop()
    loop.run_until_complete(main(loop))

