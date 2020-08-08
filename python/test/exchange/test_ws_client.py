# -*- coding: utf-8 -*-
import ccxtpro
import asyncio
import subprocess
import time


def resolver(client, message):
    client.resolve(message, 'lol')


output = []

subprocess.Popen(['node', '../../../js/test/base/fastMessageServer.js'])


async def main():
    await asyncio.sleep(1)  # let the ws server start up
    ws = ccxtpro.Exchange({'verbose': 1, 'id': 'id', 'handle_message': resolver})
    while True:
        try:
            output.append(await ws.watch('ws://localhost:8080', 'lol', None, None, None))
            time.sleep(0.02)  # represent some processing on the user end
        except ccxtpro.NetworkError as e:
            output.append(e)
            if 'Connect call' in str(e):
                await ws.close()
                exit(0)

asyncio.run(main())
last = -1
for x in output:
    assert x > last
    if isinstance(x, int):
        last = x
