# -*- coding: utf-8 -*-

import asyncio
import ccxtpro

async def loop(exchange, symbol, timeframe, complete_candles_only = False):
    duration_in_seconds = exchange.parse_timeframe(timeframe)
    duration_in_ms = duration_in_seconds * 1000
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            if len(trades) > 0:
                current_minute = int(exchange.milliseconds() / duration_in_ms)
                ohlcvc = exchange.build_ohlcvc(trades, timeframe)
                if complete_candles_only:
                    ohlcvc = [candle for candle in ohlcvc if int( candle[0] / duration_in_ms ) < current_minute]
                if (len(ohlcvc) > 0):
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
        timeframe = '1m'
        limit = 5
        marketList = [*markets]
        selected_symbols = marketList[:limit]
        # you can also specify the symbols manually
        # example: selected_symbols = ['BTC/USDT', 'ETH/USDT']

        # Use this variable to choose if only complete candles 
        # should be considered
        complete_candles_only = True
        await asyncio.gather(*[loop(exchange, symbol, timeframe, complete_candles_only) for symbol in selected_symbols])
        await exchange.close()
    else:
        print(exchange.id, 'does not support watchTrades yet')


asyncio.run(main())