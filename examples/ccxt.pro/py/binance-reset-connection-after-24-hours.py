import sys
sys.path.append('./python')
import ccxt.pro
from asyncio import run
from ccxt.base.errors import ResetConnection

print('CCXT Pro version', ccxt.pro.__version__)

async def main():
    exchange = ccxt.pro.binance({
        'options': {
            'resetConnectionInterval': 3000, # set in ms. 24 hours minus 5 minutes, set to 0 to turn off. Binance will close the connection after 24 hours
        },
    })
    symbol = 'ETH/USDT'  # or BNB/USDT, etc...
    timeframe = '1m'  # 5m, 1h, 1d
    limit = 10  # how many candles to return max
    method = 'watchOHLCV'
    if (method in exchange.has) and exchange.has[method]:
        while True:
            try:
                ohlcvs = await exchange.watch_ohlcv(symbol, timeframe, None, limit)
                print(ohlcvs)
            except ResetConnection:
                print('\n===============================================================================')
                print ('Resetting the conecction')
                print('-------------------------------------------------------------------------------')
            except Exception as e:
                print ('Some other error was thrown, print error and exit loop')
                print(type(e).__name__, str(e))
                break
        await exchange.close()
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')

run(main())
