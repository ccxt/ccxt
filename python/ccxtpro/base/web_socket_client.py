import asyncio
import json
import ccxt
import websockets
import websockets.exceptions
from ccxt.async_support.base.future import Future
from ccxt.async_support.base.websocketclient_interface import AbstractWebSocketClient

# @author frosty00
# @email carlo.revelli@berkeley.edu


class WebSocketClient(AbstractWebSocketClient):
    clients = {}

    def __init__(self, url, handler, loop=None, timeout=5000):
        self.url = url
        self.lock = asyncio.Lock()
        self._connection = None
        self.loop = asyncio.get_event_loop() if loop is None else loop
        self.handler = handler
        self.timeout = timeout
        self.futures = {}
        self.subscriptions = {}

    def isConnected(self):
        return self._connection is not None and self._connection.open

    async def connect(self):
        async with self.lock:
            if not self.isConnected():
                self._connection = await websockets.connect(self.url, ping_interval=1, ping_timeout=self.timeout // 1000)
                self.callback_loop()

    async def close(self):
        async with self.lock:
            await self._connection.close()

    def send(self, data):
        asyncio.ensure_future(self._send(data), loop=self.loop)

    async def _send(self, data):
        await self.connect()
        async with self.lock:
            await self._connection.send(json.dumps(data))

    def callback_loop(self):
        task = asyncio.create_task(self._connection.recv())
        task.add_done_callback(self.completed_task)

    def completed_task(self, task):
        try:
            result = task.result()
        except websockets.exceptions.ConnectionClosed as e:
            # error code 1006 means ping timeout
            if e.code == 1006:
                for deferred in self.futures:
                    deferred.reject(ccxt.RequestTimeout('Websocket did not recieve a pong in reply to a ping within ' + str(self.timeout) + ' seconds'))
                self.futures = {}
                return
            else:
                raise
        self.onMessage(result)
        self.callback_loop()

    def onMessage(self, message):
        try:
            json_response = json.loads(message)
            self.handler(self, json_response)
        except ValueError:
            # encoding error
            pass

    @staticmethod
    async def registerFuture(url, message_hash, entry, apikey, subscribe=None, loop=None):
        index = url + ('#' + apikey if apikey else '')
        client = WebSocketClient.clients[index] = WebSocketClient.clients[index] \
            if WebSocketClient.clients.get(index) else WebSocketClient(url, entry, loop)
        future = client.futures[message_hash] = client.futures[message_hash] if client.futures.get(message_hash) else Future()
        if subscribe is None:
            await client.connect()
        elif not client.subscriptions.get(message_hash):
            client.send(subscribe)
            client.subscriptions[message_hash] = True
        result = await future.promise()
        del client.futures[message_hash]
        return result


"""
c = WebSocketClient('wss://stream.binance.com:9443/ws/ethbtc@depth', lambda *args: print(args), lambda *args: None)
l = asyncio.get_event_loop()
async def test():
    await c.connect()
    await c.send('')
    await asyncio.sleep(100)
l.run_until_complete(test())
"""
