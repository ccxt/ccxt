- [Aiohttp Custom Session Connector](./examples/py/)


 ```python
 # pip install aiohttp_socks

import asyncio
import ccxt.async_support as ccxt
import aiohttp
import aiohttp_socks

async def test():

    connector = aiohttp_socks.ProxyConnector.from_url('socks5://user:password@127.0.0.1:1080')
    session = aiohttp.ClientSession(connector=connector)

    exchange = ccxt.binance({
        'session': session,
        # ...
    })

    # ...

    await exchange.close()  # Close the exchange
    await session.close()  # don't forget to close the session

    # ...

asyncio.run(test())
 
```