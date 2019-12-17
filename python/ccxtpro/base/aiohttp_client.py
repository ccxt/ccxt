import json
from asyncio import sleep
from aiohttp import WSMsgType
from ccxt.async_support import Exchange
from ccxtpro.base.client import Client
from ccxt import NetworkError


class AiohttpClient(Client):

    def closed(self):
        return self.connection.closed

    def receive(self):
        return self.connection.receive()

    async def handle_message(self, message):
        # print(Exchange.iso8601(Exchange.milliseconds()), message)
        if message.type == WSMsgType.TEXT:
            # print(Exchange.iso8601(Exchange.milliseconds()), 'message', message)
            data = message.data
            decoded = json.loads(data) if Exchange.is_json_encoded_object(data) else data
            self.on_message_callback(self, decoded)
        elif message.type == WSMsgType.BINARY:
            print(Exchange.iso8601(Exchange.milliseconds()), 'binary', message)
            pass
        elif message.type == WSMsgType.PING:
            print(Exchange.iso8601(Exchange.milliseconds()), 'ping', message)
            self.connection.pong()
        elif message.type == WSMsgType.PONG:
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
        return session.ws_connect(self.url)

    def send(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'sending', message)
        return self.connection.send_str(json.dumps(message, separators=(',', ':')))

    def close(self, code=1000):
        print(Exchange.iso8601(Exchange.milliseconds()), 'closing', code)
        return self.connection.close(code)

    async def ping_loop(self):
        print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
        while not self.closed():
            #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
            #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
            #     else:
            #         if self.connection.readyState == WebSocket.OPEN:
            #             self.connection.ping()
            await sleep(self.keepAlive / 1000)
