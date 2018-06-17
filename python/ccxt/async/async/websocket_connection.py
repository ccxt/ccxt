# -*- coding: utf-8 -*-

from .async_connection import AsyncConnection
from autobahn.asyncio.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory
import asyncio
from urllib.parse import urlparse


class MyClientProtocol(WebSocketClientProtocol):
    def __init__(self, event_emitter, future):
        super(MyClientProtocol, self).__init__()
        self.event_emitter = event_emitter  # type: pyee.EventEmitter
        self.future = future  # type: asyncio.Future
        self.is_closing = False

    def onConnect(self, response):
        pass

    def onOpen(self):
        self.future.done() or self.future.set_result(None)

    def onMessage(self, payload, isBinary):
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
            self.event_emitter.emit('error', Exception(reason))
        else:
            self.event_emitter.emit('close')


class WebsocketConnection(AsyncConnection):
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
                url_parsed = urlparse(self.options['url'])
                ssl = True if url_parsed.scheme == 'wss' else False
                port = url_parsed.port if url_parsed.port is not None else 443 if ssl else 80

                client = MyClientProtocol(self, future)
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
            self.client.sendMessage(data.encode('utf8'))
