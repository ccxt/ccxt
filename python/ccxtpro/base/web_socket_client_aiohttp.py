import json
from asyncio import sleep
from aiohttp import WSMsgType
from ccxt.async_support import Exchange
from ccxtpro.base.streaming_client import StreamingClient

# from ccxt.base.errors import NetworkError, RequestTimeout, NotSupported
# from ccxtpro.base.future import Future


class StreamingClientAiohttp(StreamingClient):

    def closed(self):
        return self.connection.closed

    def receive(self):
        return self.connection.receive()

    def handle_message(self, message):
        if message.type == WSMsgType.text:
            print(Exchange.iso8601(Exchange.milliseconds()), 'message', message)
        elif message.type == WSMsgType.closed:
            print(Exchange.iso8601(Exchange.milliseconds()), 'closed', message)
            print(self.closed())
            # break  # stops the loop, call on_close
        elif message.type == WSMsgType.error:
            print(Exchange.iso8601(Exchange.milliseconds()), 'error', message)
            print(self.closed())
            # break  # stops the loop, call on_error

    def create_connection(self, session):
        return session.ws_connect(self.url)

    def send(self, message):
        print(Exchange.iso8601(Exchange.milliseconds()), 'sending', message)
        return self.connection.send_str(json.dumps(message, separators=(',', ':')))

    def close(self):
        return self.connection.close()

    # async def ping_loop(self):
    #     pass
    #     # print(Exchange.iso8601(Exchange.milliseconds()), 'ping loop')
    #     # while not self.closed():
    #     #     #     if (self.lastPong + self.keepAlive) < Exchange.milliseconds():
    #     #     #         self.reset(RequestTimeout('Connection to ' + self.url + ' timed out due to a ping-pong keepalive missing on time'))
    #     #     #     else:
    #     #     #         if self.connection.readyState == WebSocket.OPEN:
    #     #     #             self.connection.ping()
    #     #     await sleep(self.keepAlive / 1000)

