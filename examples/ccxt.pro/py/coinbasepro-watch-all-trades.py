# -*- coding: utf-8 -*-

import ccxtpro
import asyncio

async def main(loop):
    exchange = ccxtpro.coinbasepro({'enableRateLimit': False, 'asyncio_loop': loop})
    method = 'watchTrades'
    print('CCXT Pro version', ccxtpro.__version__)
    if exchange.has[method]:
        last_id = ''
        while True:
            try:
                trades = await exchange.watch_trades('BTC/USD')
                for trade in trades:
                    if trade['id'] > last_id:
                        print(exchange.iso8601(exchange.milliseconds()), trade['symbol'], trade['datetime'], trade['price'], trade['amount'])
                        last_id = trade['id']

            except Exception as e:
                # stop
                await exchange.close()
                raise e
                # or retry
                # pass
    else:
        raise Exception(exchange.id + ' ' + method + ' is not supported or not implemented yet')

loop = asyncio.new_event_loop()
loop.run_until_complete(main(loop))