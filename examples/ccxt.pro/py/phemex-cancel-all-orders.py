import ccxtpro
from asyncio import get_event_loop
from pprint import pprint

print('CCXT Version:', ccxt.__version__)

async def main():
    exchange = ccxtpro.phemex({
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

loop = get_event_loop()
loop.run_until_complete(main())