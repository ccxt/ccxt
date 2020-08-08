# -*- coding: utf-8 -*-
import ccxt
from ccxtpro.base.exchange import Exchange
import asyncio
import subprocess
import datetime


def resolver(client, message):
    client.resolve(message, 'lol')


subprocess.Popen(['node', './js/test/base/fastMessageServer.js'])


async def main():
    output = []
    await asyncio.sleep(1)  # let the ws server start up
    ws = Exchange({'verbose': 0, 'id': 'id', 'handle_message': resolver})
    while True:
        try:
            output.append(await ws.watch('ws://localhost:8080', 'lol', None, None, None))
            # time.sleep(0.02)  # represent some processing on the user end
        except ccxt.NetworkError as e:
            print(datetime.datetime.now().isoformat(timespec='milliseconds') + 'Z', 'python error', type(e), e)
            output.append(e)
            if 'Connect call' in str(e):
                await ws.close()
                break
    last = -1
    for x in output:
        if isinstance(x, int):
            assert x > last
            last = x
    print('test succeeded')

asyncio.run(main())
