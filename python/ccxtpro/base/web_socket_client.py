# import asyncio
import json
from asyncio import sleep, ensure_future, TimeoutError
from aiohttp.client_exceptions import ClientConnectorError
from ccxt.async_support import Exchange
from ccxt.base.errors import NetworkError, RequestTimeout
# import ccxt.async_support as ccxt
# import websockets
# import websockets.exceptions
from ccxtpro.base.future import Future


class WebSocketClient(object):

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
            'connectionTimer': None,  # connection-related setTimeout
            'connectionTimeout': 10000,  # 10 seconds by default, false to disable
            'pingInterval': None,  # stores the ping-related interval
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
            for message_hash in self.futures:
                self.reject(result, message_hash)
        return result

    async def create_websocket(self, session, backoff_delay=0):
        # exponential backoff for consequent ws connections if necessary
        if backoff_delay:
            await sleep(backoff_delay)
        print(Exchange.iso8601(Exchange.milliseconds()), 'connecting...')
        self.connectionStarted = Exchange.milliseconds()
        # print('we reached here')
        # exit()
        # self.set_connection_timeout()  # todo: implement connection timeout
        # coroutine aiohttp.ws_connect(url, *, protocols=(), timeout=10.0, connector=None, auth=None, ws_response_class=ClientWebSocketResponse, autoclose=True, autoping=True, loop=None)[source]
        # This function creates a websocket connection, checks the response and returns a ClientWebSocketResponse object. In case of failure it may raise a WSServerHandshakeError exception.
        try:
            timeout_ms = self.connectionTimeout / 1000
            self.ws = await session.ws_connect(self.url, timeout=timeout_ms)
            self.connected.resolve()
        except TimeoutError as e:
            error = RequestTimeout(e)
            print('TimeoutError', error)
            self.connected.reject(error)
            print('TimeoutError -----------------------------------------------------------')
        except ClientConnectorError as e:
            error = NetworkError(e)
            print('ClientConnectorError', error)
            self.connected.reject(error)
            print('ClientConnectorError -----------------------------------------------------------')
        except Exception as e:
            print('EEEEEE', e, type(e))
        # exit()
        # self.ws = True
        # # exponential backoff for consequent ws connections if necessary
        # if backoff_delay:
        #     await sleep(backoff_delay)
        # print(Exchange.iso8601(Exchange.milliseconds()), 'connecting...')
        # self.connectionStarted = Exchange.milliseconds()
        # self.set_connection_timeout()  # todo: implement connection timeout
        # # coroutine aiohttp.ws_connect(url, *, protocols=(), timeout=10.0, connector=None, auth=None, ws_response_class=ClientWebSocketResponse, autoclose=True, autoping=True, loop=None)[source]
        # # This function creates a websocket connection, checks the response and returns a ClientWebSocketResponse object. In case of failure it may raise a WSServerHandshakeError exception.
        # print(Exchange.iso8601(Exchange.milliseconds()), 'connecting...')
        # self.connectionStarted = Exchange.milliseconds()
        # self.set_connection_timeout()
        # self.ws = WebSocket(self.url, self.protocols, self.options)
        # self.ws = await session.ws_connect(self.url)
        # self.connected.resolve()
        # ---------------------------------------------------------------------
        # junk
        # self.ws.on('open', self.on_open)
        # self.ws.on('ping', self.on_ping)
        # self.ws.on('pong', self.on_pong)
        # self.ws.on('error', self.on_error)
        # self.ws.on('close', self.on_close)
        # self.ws.on('upgrade', self.on_upgrade)
        # self.ws.on('message', self.on_message)
        # ---------------------------------------------------------------------
        # self.ws.terminate()  # debugging
        # self.ws.close()  # debugging

    def connect(self, session, backoff_delay=0):
        if not self.ws:
            self.ws = True
            ensure_future(self.create_websocket(session, backoff_delay))
            # self.create_websocket(session, backoff_delay)
        return self.connected

    def reset(self, error):
        self.clear_ping_interval()
        self.connected.reject(error)
        self.reject(error)

    # def on_connection_timeout(self):
    #     if self.ws.readyState != WebSocket.OPEN:
    #         error = RequestTimeout('Connection to ' + self.url + ' failed due to a connection timeout')
    #         self.reset(error)
    #         self.on_error_callback(self, error)
    #         self.ws.close(1006)

    # def set_connection_timeout(self):
    #     if self.connectionTimeout:
    #         on_connection_timeout = self.on_connection_timeout.bind(self)
    #         self.connectionTimer = setTimeout(on_connection_timeout, self.connectionTimeout)

    # def clear_connection_timeout(self):
    #     if self.connectionTimer:
    #         self.connectionTimer = clearTimeout(self.connectionTimer)

    # def set_ping_interval(self):
    #     if self.keepAlive:
    #         on_ping_interval = self.on_ping_interval.bind(self)
    #         self.pingInterval = setInterval(on_ping_interval, self.keepAlive)

    # def clear_ping_interval(self):
    #     if self.pingInterval:
    #         self.pingInterval = clearInterval(self.pingInterval)

    # def on_ping_interval(self):
    #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
    #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
    #     else:
    #         if self.ws.readyState == WebSocket.OPEN:
    #             self.ws.ping()

    def on_open(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_open')
        self.connectionEstablished = Exchange.milliseconds()
        self.connected.resolve(self.url)
        # self.ws.terminate()  # debugging
        # self.clear_connection_timeout()
        # self.set_ping_interval()

    # this method is not used at this time, because in JS the ws client will
    # respond to pings coming from the server with pongs automatically
    # however, some devs may want to track connection states in their app
    def on_ping(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_ping')

    def on_pong(self):
        self.lastPong = Exchange.milliseconds()
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_pong')

    def on_error(self, error):
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_error', error.message)
        # convert ws errors to ccxt errors if necessary
        self.error = NetworkError(error.message)
        self.reset(self.error)
        self.on_error_callback(self, self.error)

    def on_close(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_close', message)
        if not self.error:
            # todo: exception types for server-side disconnects
            self.reset(NetworkError(message))
        self.on_close_callback(self, message)

    # this method is not used at this time
    # but may be used to read protocol-level data like cookies, headers, etc
    def on_upgrade(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'on_upgrade')

    def send(self, message):
        self.ws.send(json.dumps(message, separators=(',', ':')))

    def close(self):
        self.reconnect = False
        self.ws.close()

    def on_message(self, message):
        try:
            message = json.loads(message) if isJsonEncodedObject(message) else message
        except Exception:  # as e:
            # reset with a json encoding error ?
            pass
        self.on_message_callback(self, message)

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
#                 self._connection = await websockets.connect(self.url, ping_interval=1, ping_timeout=self.timeout // 1000)
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
