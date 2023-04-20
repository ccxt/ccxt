import ccxt.pro
from asyncio import run
from pprint import pprint

print('CCXT Version:', ccxt.__version__)

async def main():
    exchange = ccxt.pro.phemex({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
    markets = await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    try:
        symbol = 'UNI/USDT'
        response = await exchange.cancel_all_orders(symbol)
        pprint(response)
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()


run(main())
