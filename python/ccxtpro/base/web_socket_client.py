# import asyncio
import json
from asyncio import sleep, ensure_future, wait_for, gather, TimeoutError
from aiohttp.client_exceptions import ClientConnectorError
from aiohttp import WSMsgType
from ccxt.async_support import Exchange
from ccxt.base.errors import NetworkError, RequestTimeout
# import ccxt.async_support as ccxt
# import websockets
# import websockets.exceptions
from ccxtpro.base.future import Future
from ccxtpro.base.web_socket_client_aiohttp import WebSocketClientAiohttp
from ccxtpro.base.web_socket_client_ws import WebSocketClientWs


class WebSocketClient(WebSocketClientWs):
    pass
    # url = None
    # ws = None
    # futures = {}
    # on_message_callback = None
    # on_error_callback = None
    # on_close_callback = None
    # keepAlive = 3000
    # connectionTimeout = 10000  # 10 seconds by default, false to disable

    # def __init__(self, url, on_message_callback, on_error_callback, on_close_callback, config={}):
    #     defaults = {
    #         'url': url,
    #         'on_message_callback': on_message_callback,
    #         'on_error_callback': on_error_callback,
    #         'on_close_callback': on_close_callback,
    #         'protocols': None,  # ws-specific protocols
    #         'options': None,  # ws-specific options
    #         'futures': {},
    #         'subscriptions': {},
    #         'error': None,  # stores low-level networking exception, if any
    #         'connectionStarted': None,  # initiation timestamp in milliseconds
    #         'connectionEstablished': None,  # success timestamp in milliseconds
    #         'connectionTimer': None,  # connection-related setTimeout
    #         'connectionTimeout': 10000,  # 10 seconds by default, false to disable
    #         'pingInterval': None,  # stores the ping-related interval
    #         'keepAlive': 3000,  # ping-pong keep-alive frequency
    #         # timeout is not used atm
    #         # timeout: 30000,  # throw if a request is not satisfied in 30 seconds, false to disable
    #     }
    #     settings = {}
    #     settings.update(defaults)
    #     settings.update(config)
    #     for key in settings:
    #         if hasattr(self, key) and isinstance(getattr(self, key), dict):
    #             setattr(self, key, Exchange.deep_extend(getattr(self, key), settings[key]))
    #         else:
    #             setattr(self, key, settings[key])
    #     # connection-related Future
    #     self.connected = Future()

    # def future(self, message_hash):
    #     if message_hash not in self.futures:
    #         self.futures[message_hash] = Future()
    #     return self.futures[message_hash]

    # def resolve(self, result, message_hash=None):
    #     if message_hash:
    #         if message_hash in self.futures:
    #             future = self.futures[message_hash]
    #             future.resolve(result)
    #             del self.futures[message_hash]
    #     else:
    #         for message_hash in self.futures:
    #             self.resolve(result, message_hash)
    #     return result

    # def reject(self, result, message_hash=None):
    #     if message_hash:
    #         if message_hash in self.futures:
    #             future = self.futures[message_hash]
    #             future.reject(result)
    #             del self.futures[message_hash]
    #     else:
    #         for message_hash in self.futures:
    #             self.reject(result, message_hash)
    #     return result

    # async def ping_loop(self):
    #     print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
    #     while not self.ws.closed:
    #         #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
    #         #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
    #         #     else:
    #         #         if self.ws.readyState == WebSocket.OPEN:
    #         #             self.ws.ping()
    #         await sleep(self.keepAlive / 1000)

    # async def receive_loop(self):
    #     print(Exchange.iso8601(Exchange.milliseconds()), 'receive loop')
    #     while not self.ws.closed:
    #         try:
    #             message = await self.ws.receive()
    #             if message.type == WSMsgType.text:
    #                 print(Exchange.iso8601(Exchange.milliseconds()), 'message', message)
    #             elif message.type == WSMsgType.closed:
    #                 print(Exchange.iso8601(Exchange.milliseconds()), 'closed', message)
    #                 print(self.ws.closed)
    #                 break  # stops the loop, call on_close
    #             elif message.type == WSMsgType.error:
    #                 print(Exchange.iso8601(Exchange.milliseconds()), 'error', message)
    #                 break  # stops the loop, call on_error
    #         except Exception as e:
    #             error = NetworkError(e)
    #             print(Exchange.iso8601(Exchange.milliseconds()), 'Exception', error)
    #             self.reset(error)

    # async def create_websocket(self, session, backoff_delay=0):
    #     # exponential backoff for consequent ws connections if necessary
    #     if backoff_delay:
    #         await sleep(backoff_delay)
    #     print(Exchange.iso8601(Exchange.milliseconds()), 'connecting with timeout', self.connectionTimeout, 'ms')
    #     self.connectionStarted = Exchange.milliseconds()
    #     try:
    #         coroutine = session.ws_connect(self.url)
    #         self.ws = await wait_for(coroutine, self.connectionTimeout / 1000)
    #         print(Exchange.iso8601(Exchange.milliseconds()), 'connected')
    #         self.connected.resolve()
    #     except TimeoutError as e:  # connection timeout
    #         error = RequestTimeout('Connection timeout')
    #         print(Exchange.iso8601(Exchange.milliseconds()), 'RequestTimeout', error)
    #         self.reset(error)
    #         await self.ws.close()
    #     except ClientConnectorError as e:  # connection failed or rejected
    #         error = NetworkError(e)
    #         print(Exchange.iso8601(Exchange.milliseconds()), 'NetworkError', error)
    #         self.reset(error)
    #     except Exception as e:
    #         print(Exchange.iso8601(Exchange.milliseconds()), 'Exception', error)
    #         self.reset(error)
    #     await gather(self.ping_loop(), self.receive_loop())  # run both loops forever

    # def connect(self, session, backoff_delay=0):
    #     if not self.ws:
    #         self.ws = True
    #         ensure_future(self.create_websocket(session, backoff_delay))
    #     return self.connected

    # def reset(self, error):
    #     self.connected.reject(error)
    #     self.reject(error)

    # def send(self, message):
    #     print(Exchange.iso8601(Exchange.milliseconds()), 'sending', json.dumps(message, separators=(',', ':')))
    #     return self.ws.send_str(json.dumps(message, separators=(',', ':')))

    # # def set_ping_interval(self):
    # #     if self.keepAlive:
    # #         on_ping_interval = self.on_ping_interval.bind(self)
    # #         self.pingInterval = setInterval(on_ping_interval, self.keepAlive)

    # # def clear_ping_interval(self):
    # #     if self.pingInterval:
    # #         self.pingInterval = clearInterval(self.pingInterval)

    # # def on_ping_interval(self):
    # #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
    # #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
    # #     else:
    # #         if self.ws.readyState == WebSocket.OPEN:
    # #             self.ws.ping()

    # # def on_message(self, message):
    # #     try:
    # #         message = json.loads(message) if isJsonEncodedObject(message) else message
    # #     except Exception:  # as e:
    # #         # reset with a json encoding error ?
    # #         pass
    # #     self.on_message_callback(self, message)

    # # def on_open(self):
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_open')
    # #     self.connectionEstablished = Exchange.milliseconds()
    # #     self.connected.resolve(self.url)
    # #     # self.ws.terminate()  # debugging
    # #     # self.clear_connection_timeout()
    # #     # self.set_ping_interval()

    # # # this method is not used at this time, because in JS the ws client will
    # # # respond to pings coming from the server with pongs automatically
    # # # however, some devs may want to track connection states in their app
    # # def on_ping(self):
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_ping')

    # # def on_pong(self):
    # #     self.lastPong = Exchange.milliseconds()
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_pong')

    # # def on_error(self, error):
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_error', error.message)
    # #     # convert ws errors to ccxt errors if necessary
    # #     self.error = NetworkError(error.message)
    # #     self.reset(self.error)
    # #     self.on_error_callback(self, self.error)

    # # def on_close(self, message):
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_close', message)
    # #     if not self.error:
    # #         # todo: exception types for server-side disconnects
    # #         self.reset(NetworkError(message))
    # #     self.on_close_callback(self, message)

    # # # this method is not used at this time
    # # # but may be used to read protocol-level data like cookies, headers, etc
    # # def on_upgrade(self, message):
    # #     print(Exchange.iso8601(Exchange.milliseconds()), 'on_upgrade')

