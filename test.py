# -*- coding: utf-8 -*-

from asyncio import get_event_loop, sleep
import aiohttp
from pprint import pprint

import os
import sys

root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root + '/python')

import ccxtpro
from ccxtpro.base.future import Future
from ccxt.base.errors import NetworkError, RequestTimeout


# -----------------------------------------------------------------------------

# async def something():
#     print('f')

# async def resolve_after_timeout(future, timeout):
#     await asyncio.sleep(timeout)
#     future.resolve('Yep')

# async def test3(future):
#     x = something()
#     print('1')
#     await x
#     print('2')
#     print(x)
#     await asyncio.gather(resolve_after_timeout(future, 5), future)
#     return await future

# async def test2():
#     return True

async def test():
    # x = test2()
    # print(await x)
    symbol = 'ETH/BTC'
    exchange = ccxtpro.poloniex({
        'enableRateLimit': True,
        'urls': {
            'api': {
                'ws': 'ws://127.0.0.1:8080',
            },
        },
    })
    x = None
    while True:
        try:
            x = await exchange.fetch_ws_order_book(symbol)
            print('-', x)
            sys.exit()
        except Exception as e:
            print('Error', type(e), str(e))
            await sleep(1)
    await exchange.close()
    print('test() is done', x)
    # pprint(orderbook)

# -----------------------------------------------------------------------------

# f = Future()
# pprint(f)
# sys.exit()

if __name__ == '__main__':
    print(get_event_loop().run_until_complete(test()))




# =============================================================================
# junk & trash

# import ccxtpro.base.web_socket_client

# from ccxtpro.base.web_socket_client import WebSocketClient

# url = 'ws://127.0.0.1:8080'

# async def connect(session, url):
#     session = aiohttp.ClientSession()
#     try:
#         ws = await session.ws_connect(url)
#     except aiohttp.client_exceptions.ClientConnectorError as e:
#         print(u'Connection error, увыs')
#     await session.close()
#     return 'Done'
#     # ws = await aiohttp.ws_connect('http://webscoket-server.org/endpoint')


# while True:
#     msg = await ws.receive()

#     if msg.tp == aiohttp.MsgType.text:
#         if msg.data == 'close':
#            await ws.close()
#            break
#         else:
#            ws.send_str(msg.data + '/answer')
#     elif msg.tp == aiohttp.MsgType.closed:
#         break
#     elif msg.tp == aiohttp.MsgType.error:
#         break
