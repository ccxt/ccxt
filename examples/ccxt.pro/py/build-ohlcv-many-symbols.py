# -*- coding: utf-8 -*-

import asyncio
import ccxtpro

async def loop(exchange, symbol, timeframe):
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            if len(trades) > 0:
                ohlcvc = exchange.build_ohlcvc(trades, timeframe)
                print("Symbol:", symbol, "timeframe:", timeframe)
                print ('-----------------------------------------------------------')
                print (ohlcvc)
                print ('-----------------------------------------------------------')

        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            # break  # you can also break just this one loop if it fails

async def main():
    # select the exchange
    exchange = ccxtpro.ftx()
    if exchange.has['watchTrades']:
        markets = await exchange.load_markets()
        # Change this value accordingly
        timeframe = '15m'
        limit = 5
        marketList = [*markets]
        selected_symbols = marketList[:limit]
        # you can also specify the symbols manually
        # example:
        # selected_symbols = ['BTC/USDT', 'LTC/USDT']
        await asyncio.gather(*[loop(exchange, symbol, timeframe) for symbol in selected_symbols])
        await exchange.close()
    else:
        print(exchange.id, 'does not support watchTrades yet')


asyncio.run(main())