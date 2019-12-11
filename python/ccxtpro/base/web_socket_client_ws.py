import json
from asyncio import sleep, ensure_future, wait_for, gather, TimeoutError
# from aiohttp.client_exceptions import ClientConnectorError
# from aiohttp import WSMsgType
from ccxt.async_support import Exchange
from ccxt.base.errors import NetworkError, RequestTimeout
from ccxtpro.base.future import Future
from websockets import connect
# import websockets.exceptions


class WebSocketClientWs(object):

    url = None
    ws = None
    futures = {}
    on_message_callback = None
    on_error_callback = None
    on_close_callback = None
    keepAlive = 3000
    connectionTimeout = 10000  # 10 seconds by default, false to disable

    def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
        defaults = {
            'url': url,
            'on_message_callback': on_message_callback,
            'on_error_callback': on_error_callback,
            'on_close_callback': on_close_callback,
            'protocols': None,  # ws-specific protocols
            'options': None,  # ws-specific options
            'futures': {},
            'subscriptions': {},
            'error': None,  # stores low-level networking exception, if any
            'connectionStarted': None,  # initiation timestamp in milliseconds
            'connectionEstablished': None,  # success timestamp in milliseconds
            'connectionTimeout': 10000,  # 10 seconds by default, false to disable
            'keepAlive': 3000,  # ping-pong keep-alive frequency
            # timeout is not used atm
            # timeout: 30000,  # throw if a request is not satisfied in 30 seconds, false to disable
        }
        settings = {}
        settings.update(defaults)
        settings.update(config)
        for key in settings:
            if hasattr(self, key) and isinstance(getattr(self, key), dict):
                setattr(self, key, Exchange.deep_extend(getattr(self, key), settings[key]))
            else:
                setattr(self, key, settings[key])
        # connection-related Future
        self.connected = Future()

    def future(self, message_hash):
        if message_hash not in self.futures:
            self.futures[message_hash] = Future()
        return self.futures[message_hash]

    def resolve(self, result, message_hash=None):
        if message_hash:
            if message_hash in self.futures:
                future = self.futures[message_hash]
                future.resolve(result)
                del self.futures[message_hash]
        else:
            for message_hash in self.futures:
                self.resolve(result, message_hash)
        return result

    def reject(self, result, message_hash=None):
        if message_hash:
            if message_hash in self.futures:
                future = self.futures[message_hash]
                future.reject(result)
                del self.futures[message_hash]
        else:
            message_hashes = list(self.futures.keys())
            for message_hash in message_hashes:
                self.reject(result, message_hash)
        return result

    async def ping_loop(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
        while not self.ws.closed:
            #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
            #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
            #     else:
            #         if self.ws.readyState == WebSocket.OPEN:
            #             self.ws.ping()
            await sleep(self.keepAlive / 1000)

    async def receive_loop(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'receive loop')
        while not self.ws.closed:
            try:
                message = await self.ws.receive()
                if message.type == WSMsgType.text:
                    print(Exchange.iso8601(Exchange.milliseconds()), 'message', message)
                elif message.type == WSMsgType.closed:
                    print(Exchange.iso8601(Exchange.milliseconds()), 'closed', message)
                    print(self.ws.closed)
                    break  # stops the loop, call on_close
                elif message.type == WSMsgType.error:
                    print(Exchange.iso8601(Exchange.milliseconds()), 'error', message)
                    break  # stops the loop, call on_error
            except Exception as e:
                error = NetworkError(e)
                print(Exchange.iso8601(Exchange.milliseconds()), 'receive_loop', 'Exception', type (e), e)
                self.reset(e)

    async def create_websocket(self, session, backoff_delay=0):
        # exponential backoff for consequent ws connections if necessary
        if backoff_delay:
            await sleep(backoff_delay)
        print(Exchange.iso8601(Exchange.milliseconds()), 'connecting with timeout', self.connectionTimeout, 'ms')
        self.connectionStarted = Exchange.milliseconds()
        try:
            coroutine = connect(self.url, ping_interval=1, ping_timeout=self.keepAlive)
            self.ws = await wait_for(coroutine, self.connectionTimeout / 1000)
            print(Exchange.iso8601(Exchange.milliseconds()), 'connected')
            self.connected.resolve()
            await gather(self.ping_loop(), self.receive_loop())  # run both loops forever
        except TimeoutError as e:  # connection timeout
            error = RequestTimeout('Connection timeout')
            print(Exchange.iso8601(Exchange.milliseconds()), 'RequestTimeout', error)
            self.reset(error)
            await self.ws.close()
        # except ClientConnectorError as e:  # connection failed or rejected
        #     error = NetworkError(e)
        #     print(Exchange.iso8601(Exchange.milliseconds()), 'NetworkError', error)
        #     self.reset(error)
        except Exception as e:
            print(Exchange.iso8601(Exchange.milliseconds()), 'create_websocket', 'Exception', type(e), e)
            self.reset(e)

    def connect(self, session, backoff_delay=0):
        if not self.ws:
            self.ws = True
            ensure_future(self.create_websocket(session, backoff_delay))
        return self.connected

    def reset(self, error):
        self.connected.reject(error)
        self.reject(error)

    def send(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'sending', message)
        return self.ws.send(json.dumps(message, separators=(',', ':')))

# -----------------------------------------------------------------------------

# # @author frosty00
# # @email carlo.revelli@berkeley.edu


# class WebSocketClient(object):
#     clients = {}

#     def __init__(self, url, handler, loop=None, timeout=5000):
#         self.url = url
#         self.lock = asyncio.Lock()
#         self._connection = None
#         self.loop = asyncio.get_event_loop() if loop is None else loop
#         self.handler = handler
#         self.timeout = timeout
#         self.futures = {}
#         self.subscriptions = {}

#     def isConnected(self):
#         return self._connection is not None and self._connection.open

#     async def connect(self):
#         async with self.lock:
#             if not self.isConnected():
#                 self._connection =
#                 self.callback_loop()

#     async def close(self):
#         async with self.lock:
#             await self._connection.close()

#     def send(self, data):
#         asyncio.ensure_future(self._send(data), loop=self.loop)

#     async def _send(self, data):
#         await self.connect()
#         async with self.lock:
#             await self._connection.send(json.dumps(data))

#     def callback_loop(self):
#         task = asyncio.create_task(self._connection.recv())
#         task.add_done_callback(self.completed_task)

#     def completed_task(self, task):
#         try:
#             result = task.result()
#         except websockets.exceptions.ConnectionClosed as e:
#             # error code 1006 means ping timeout
#             if e.code == 1006:
#                 for deferred in self.futures:
#                     deferred.reject(ccxt.RequestTimeout('Websocket did not recieve a pong in reply to a ping within ' + str(self.timeout) + ' seconds'))
#                 self.futures = {}
#                 return
#             else:
#                 raise
#         self.onMessage(result)
#         self.callback_loop()

#     def onMessage(self, message):
#         try:
#             json_response = json.loads(message)
#             self.handler(self, json_response)
#         except ValueError:
#             # encoding error
#             pass

#     @staticmethod
#     async def registerFuture(url, message_hash, entry, apikey, subscribe=None, loop=None):
#         index = url + ('#' + apikey if apikey else '')
#         client = WebSocketClient.clients[index] = WebSocketClient.clients[index] \
#             if WebSocketClient.clients.get(index) else WebSocketClient(url, entry, loop)
#         future = client.futures[message_hash] = client.futures[message_hash] if client.futures.get(message_hash) else Future()
#         if subscribe is None:
#             await client.connect()
#         elif not client.subscriptions.get(message_hash):
#             client.send(subscribe)
#             client.subscriptions[message_hash] = True
#         result = await future.promise()
#         del client.futures[message_hash]
#         return result


# """
# c = WebSocketClient('wss://stream.binance.com:9443/ws/ethbtc@depth', lambda *args: print(args), lambda *args: None)
# l = asyncio.get_event_loop()
# async def test():
#     await c.connect()
#     await c.send('')
#     await asyncio.sleep(100)
# l.run_until_complete(test())
# """
