# -*- coding: utf-8 -*-

from .websocket_base_connection import WebsocketBaseConnection
from autobahn.asyncio.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory
import asyncio
import ssl
from urllib.parse import urlparse
import sys


class MyClientProtocol(WebSocketClientProtocol):
    def __init__(self, event_emitter, future, verbose):
        super(MyClientProtocol, self).__init__()
        self.event_emitter = event_emitter  # type: pyee.EventEmitter
        self.future = future  # type: asyncio.Future
        self.is_closing = False
        self.verbose = verbose

    def onConnect(self, response):
        pass

    def onOpen(self):
        self.future.done() or self.future.set_result(None)

    def onMessage(self, payload, isBinary):
        if self.verbose:
            print("WebsocketConnection: ")
            print(payload)
            sys.stdout.flush
        if self.is_closing:
            return
        if isBinary:
            self.event_emitter.emit('message', payload)
        else:
            self.event_emitter.emit('message', payload.decode('utf8'))

    def onClose(self, wasClean, code, reason):
        self.future.done() or self.future.set_exception(Exception(reason))
        if self.is_closing:
            return
        if wasClean:
            self.event_emitter.emit('err', Exception(reason))
        else:
            self.event_emitter.emit('close')


class WebsocketConnection(WebsocketBaseConnection):
    def __init__(self, options, timeout, loop):
        super(WebsocketConnection, self).__init__()
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
                print("------------------------------>")
                print(self.options['url'])
                url_parsed = urlparse(self.options['url'])
                print(url_parsed)
                sys.stdout.flush()
                ssl_param = True if url_parsed.scheme == 'wss' else False
                if ssl_param and 'disableCertCheck' in self.options:
                    ssl_param = ssl.SSLContext()
                    ssl_param.verify_mode = ssl.CERT_NONE
                port = url_parsed.port if url_parsed.port is not None else 443 if ssl else 80

                client = MyClientProtocol(self, future, self.options['verbose'])
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

                fut = self.loop.create_connection(factory, url_parsed.hostname, port, ssl=ssl_param)
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
            self.client.sendMessage(data.encode('utf8'))

    def isActive(self):
        return (self.client is not None) and ((self.client.state == WebSocketClientProtocol.STATE_OPEN) or (self.client.state == WebSocketClientProtocol.STATE_CONNECTING))
