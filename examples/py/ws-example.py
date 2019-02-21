import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

# import ccxt.async as ccxt  # noqa: E402
from ccxt.async_support.websocket.websocket_connection import WebsocketConnection  # noqa: E402
loop = asyncio.get_event_loop()  # type: asyncio.BaseEventLoop


async def main():
    ws = WebsocketConnection({
        'url': 'wss://echo.websocket.org'
    }, 5 * 1000, loop)

    @ws.on('err')
    def error_handler(error):  # pylint: disable=W0612
        print(error)
        loop.stop()

    @ws.on('message')
    def message_handler(msg):  # pylint: disable=W0612
        print(msg)
        sys.stdout.flush()
        # ws.close()
        # loop.stop()
        print("Waiting 2 seconds...")
        sys.stdout.flush()
        loop.call_later(2, lambda: ws.sendJson({'helo': 'helo'}))

    @ws.on('close')
    def close_handler():  # pylint: disable=W0612
        print('--->closed')
        sys.stdout.flush()
        loop.stop()

    # loop.run_until_complete(ws.connect())
    await ws.connect()
    print("after run")
    ws.sendJson({'helo': 'helo'})

loop.run_until_complete(main())
loop.run_forever()
print("after complete")
