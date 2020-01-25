# -*- coding: utf-8 -*-

import json
from asyncio import sleep, ensure_future
from aiohttp import WSMsgType
from ccxt.async_support import Exchange
from ccxtpro.base.client import Client
from ccxt import NetworkError, RequestTimeout


class AiohttpClient(Client):

    def closed(self):
        return (self.connection is None) or self.connection.closed

    def receive(self):
        return self.connection.receive()

    def handle_message(self, message):
        # print(Exchange.iso8601(Exchange.milliseconds()), message)
        if message.type == WSMsgType.TEXT:
            # print(Exchange.iso8601(Exchange.milliseconds()), 'message', message)
            data = message.data
            decoded = json.loads(data) if Exchange.is_json_encoded_object(data) else data
            self.on_message_callback(self, decoded)
        elif message.type == WSMsgType.BINARY:
            print(Exchange.iso8601(Exchange.milliseconds()), 'binary', message)
            pass
        # autoping is responsible for automatically replying with pong
        # to a ping incoming from a server, we have to disable autoping
        # with aiohttp's websockets and respond with pong manually
        # otherwise aiohttp's websockets client won't trigger WSMsgType.PONG
        elif message.type == WSMsgType.PING:
            print(Exchange.iso8601(Exchange.milliseconds()), 'ping', message)
            ensure_future(self.connection.pong())
        elif message.type == WSMsgType.PONG:
            self.lastPong = Exchange.milliseconds()
            print(Exchange.iso8601(Exchange.milliseconds()), 'pong', message)
            pass
        elif message.type == WSMsgType.CLOSE:
            print(Exchange.iso8601(Exchange.milliseconds()), 'close', self.closed(), message)
            self.on_close(1000)
        elif message.type == WSMsgType.CLOSED:
            print(Exchange.iso8601(Exchange.milliseconds()), 'closed', self.closed(), message)
            self.on_close(1000)
        elif message.type == WSMsgType.ERROR:
            print(Exchange.iso8601(Exchange.milliseconds()), 'error', message)
            error = NetworkError(str(message))
            self.on_error(error)

    def create_connection(self, session):
        # autoping is responsible for automatically replying with pong
        # to a ping incoming from a server, we have to disable autoping
        # with aiohttp's websockets and respond with pong manually
        # otherwise aiohttp's websockets client won't trigger WSMsgType.PONG
        return session.ws_connect(self.url, autoping=False)

    def send(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'sending', message)
        return self.connection.send_str(json.dumps(message, separators=(',', ':')))

    async def close(self, code=1000):
        print(Exchange.iso8601(Exchange.milliseconds()), 'closing', code)
        if not self.closed():
            await self.connection.close()

    async def ping_loop(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
        while self.keepAlive and not self.closed():
            now = Exchange.milliseconds()
            self.lastPong = now if self.lastPong is None else self.lastPong
            if (self.lastPong + self.keepAlive * self.maxPingPongMisses) < now:
                self.on_error(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
            # the following ping-clause is not necessary with aiohttp's built-in ws
            # since it has a heartbeat option (see create_connection above)
            # however some exchanges require a text-type ping message
            # therefore we need this clause anyway
            else:
                if self.ping:
                    await self.send(self.ping(self))
                else:
                    await self.connection.ping()
            await sleep(self.keepAlive / 1000)
