# -*- coding: utf-8 -*-

import json
# from asyncio import sleep, ensure_future, wait_for, gather, TimeoutError
from ccxt.async_support import Exchange
from ccxt import NotSupported
from websockets.client import connect
from ccxtpro.base.client import Client

# from websockets.exceptions import ConnectionClosed
# import websockets.exceptions


class WebsocketsClient(Client):

    def closed(self):
        return self.connection.closed

    def receive(self):
        return self.connection.receive()

    def handle_message(self, message):
        raise NotSupported('handle_message() not implemented in websockets-version yet')

    def create_connection(self, session):
        return connect(self.url, ping_interval=self.keepAlive, ping_timeout=self.keepAlive)

    def send(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'sending', message)
        return self.connection.send(json.dumps(message, separators=(',', ':')))

    async def close(self, code):
        return await self.connection.close(code)
