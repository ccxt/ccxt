import ccxt.pro
from asyncio import gather, run

async def symbol_loop(id, exchange, symbol):
    print('Starting the', id, 'symbol loop with', symbol)
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), id, symbol, len(trades), trades[-1]['price'])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails


async def exchange_loop(exchange_id, info):
    exchange_instance = info['instance']
    symbols = info['symbols']
    
    print('Starting the', exchange_id, 'exchange loop with', symbols)
    
    loops = [symbol_loop(exchange_id, exchange_instance, symbol) for symbol in symbols]
    await gather(*loops)
    await exchange_instance.close()


async def main():
    spot_bybit = getattr(ccxt.pro, 'bybit')({'defaultType': 'spot'})
    swap_bybit = getattr(ccxt.pro, 'bybit')({'defaultType': 'swap'})
    binance = getattr(ccxt.pro, 'binance')()

    exchanges = {
        'binance':     {"symbols":['BTC/USDT', 'ETH/BTC'], "instance": binance},
        'spot_bybit':  {"symbols":['BTC/USDT', 'ETH/BTC'], "instance": spot_bybit},
        'swap_bybit':  {"symbols":['BTC/USDT:USDT', 'BTC/USDT:USDT'], "instance": swap_bybit},
    }

    loops = [exchange_loop(exchange_id, info) for exchange_id, info in exchanges.items()]
    await gather(*loops)


run(main())