import asyncio
import ccxt.async as ccxt

loop = asyncio.get_event_loop()

bitlish = ccxt.bitlish()
bitflyer = ccxt.bitflyer({'proxy':'https://cors-anywhere.herokuapp.com/', 'timeout': 20000 })

print(loop.run_until_complete(bitlish.fetchTicker('BTC/USD')))
print(loop.run_until_complete(bitflyer.fetchTicker('FX_BTC_JPY')))

# loop.close()