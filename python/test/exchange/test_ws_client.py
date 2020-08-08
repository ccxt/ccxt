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
            print('got error', e)
            string = str(e)
            if 'Connect call' in string or 'await wasn\'t used with future' in string:
                await ws.close()
                return
            output.append(string)

asyncio.run(main())
print('awaited output:')
print(*output, sep='\n')
