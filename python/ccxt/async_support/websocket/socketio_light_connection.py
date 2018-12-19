# -*- coding: utf-8 -*-

from .websocket_base_connection import WebsocketBaseConnection
from autobahn.asyncio.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory
import asyncio
from urllib.parse import urlparse
import json
import sys


class MyClientProtocol(WebSocketClientProtocol):
    def __init__(self, event_emitter, future, loop, verbose):
        super(MyClientProtocol, self).__init__()
        self.event_emitter = event_emitter  # type: pyee.EventEmitter
        self.future = future  # type: asyncio.Future
        self.is_closing = False
        self.ping_interval_ms: 25000
        self.ping_timeout_ms: 5000
        self.ping_interval = None
        self.ping_timeout = None
        self.loop = loop
        self.verbose = verbose

    def createPingProcess(self):
        self.destroyPingProcess()

        def wait4pong():
            if not self.is_closing:
                self.event_emitter.emit('err', 'pong not received from server')
                self._closeConnection(True)

        def do_ping():
            self.ping_interval = self.loop.call_later(self.ping_interval_ms / 1000, do_ping)
            try:
                if not self.is_closing:
                    if self.verbose:
                        print("PusherLightConnection: ping sent")
                        sys.stdout.flush()
                    self.cancelPingTimeout()
                    self.sendMessage('2'.encode('utf8'))
                    # print("ping sent")
                    # sys.stdout.flush()
                    self.ping_timeout = self.loop.call_later(self.ping_timeout_ms / 1000, wait4pong)
                else:
                    self.destroyPingProcess()
            except Exception as ex:
                pass

        self.ping_interval = self.loop.call_later(self.ping_interval_ms / 1000, do_ping)

    def destroyPingProcess(self):
        if self.ping_interval is not None:
            self.ping_interval.cancel()
            self.ping_interval = None

        self.cancelPingTimeout()

    def cancelPingTimeout(self):
        if self.ping_timeout is not None:
            self.ping_timeout.cancel()
            self.ping_timeout = None

    def onConnect(self, response):
        pass

    def onOpen(self):
        # self.future.done() or self.future.set_result(None)
        pass

    def onMessage(self, payload, isBinary):
        if self.verbose:
            print("PusherLightConnection: ")
            print(payload)
            sys.stdout.flush()
        if self.is_closing:
            return
        data = payload
        if not isBinary:
            data = payload.decode('utf8')
        # print(payload)
        # sys.stdout.flush()
        if data[0] == '0':
            msg = json.loads(data[1:])
            if 'pingInterval' in msg:
                self.ping_interval_ms = msg['pingInterval']
            if 'pingTimeout' in msg:
                self.ping_timeout_ms = msg['pingTimeout']
        elif data[0] == '3':
            self.cancelPingTimeout()
            # print('pong received')
            # sys.stdout.flush()
        elif data[0] == '4':
            if data[1] == '2':
                self.event_emitter.emit('message', data[2:])
            elif data[1] == '0':
                self.createPingProcess()
                self.future.done() or self.future.set_result(None)
        elif data[0] == '1':
            self.event_emitter.emit('err', 'server sent disconnect message')
            self._closeConnection(True)
        else:
            print("unknown msg received from iosocket: " + data)

    def onClose(self, wasClean, code, reason):
        self.future.done() or self.future.set_exception(Exception(reason))
        if self.is_closing:
            return
        if wasClean:
            self.event_emitter.emit('err', Exception(reason))
        else:
            self.event_emitter.emit('close')


class SocketIoLightConnection(WebsocketBaseConnection):
    def __init__(self, options, timeout, loop):
        super(SocketIoLightConnection, self).__init__()
        self.options = options
        self.timeout = timeout
        self.loop = loop  # type: asyncio.BaseEventLoop
        self.client = None

    # def connect (self):
    async def connect(self):
        if (self.client is not None) and (self.client.state == WebSocketClientProtocol.STATE_OPEN):
            # return self.client.future
            await self.client.future
        elif (self.client is not None) and (self.client.state == WebSocketClientProtocol.STATE_CONNECTING):
            # return self.client.future
            await self.client.future
        else:
            future = asyncio.Future(loop=self.loop)
            try:
                url_parsed = urlparse(self.options['url'])
                ssl = True if url_parsed.scheme == 'wss' else False
                port = url_parsed.port if url_parsed.port is not None else 443 if ssl else 80

                client = MyClientProtocol(self, future, self.loop, self.options['verbose'])
                if 'proxies' in list(self.options.keys()):
                    if url_parsed.scheme == 'wss':
                        proxy_url_parsed = urlparse(self.options['proxies']['https'])
                    else:
                        proxy_url_parsed = urlparse(self.options['proxies']['http'])
                    proxy = {'host': proxy_url_parsed.hostname, 'port': proxy_url_parsed.port}
                    factory = WebSocketClientFactory(self.options['url'], proxy=proxy)
                else:
                    factory = WebSocketClientFactory(self.options['url'])
                factory.protocol = lambda: client

                fut = self.loop.create_connection(factory, url_parsed.hostname, port, ssl=ssl)
                self.loop.call_later(self.timeout / 1000, lambda: future.done() or future.set_exception(TimeoutError()))
                await fut
                # self.loop.run_until_complete(fut)
                self.client = client
                if ('wait-after-connect' in self.options):
                    await asyncio.sleep(self.options['wait-after-connect'] / 1000)
                self.emit('open')
            except Exception as ex:
                future.done() or future.set_exception(ex)
                self.emit('err', ex)
            # return future
            await future

    def close(self):
        if self.client is not None:
            self.client.is_closing = True
            self.client._closeConnection(True)
            self.client = None

    def send(self, data):
        if self.client is not None:
            self.client.sendMessage(('42' + data).encode('utf8'))
            pass

    def isActive(self):
        return (self.client is not None) and ((self.client.state == WebSocketClientProtocol.STATE_OPEN) or (self.client.state == WebSocketClientProtocol.STATE_CONNECTING))
