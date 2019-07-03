# -*- coding: utf-8 -*-

from .websocket_base_connection import WebsocketBaseConnection
from autobahn.asyncio.websocket import WebSocketClientProtocol, \
    WebSocketClientFactory
import asyncio
from urllib.parse import urlparse
import json
import sys

CLIENT = 'ccxt-light-client'
VERSION = '1.0'
PROTOCOL = '7'


class MyClientProtocol(WebSocketClientProtocol):
    def __init__(self, event_emitter, future, loop, verbose):
        super(MyClientProtocol, self).__init__()
        self.event_emitter = event_emitter  # type: pyee.EventEmitter
        self.future = future  # type: asyncio.Future
        self.loop = loop
        self.is_closing = False
        self.activity_timeout = 120
        self.pong_timeout = 30
        self._activity_timer = None
        self.verbose = verbose

    def resetActivityCheck(self):
        if self._activity_timer is not None:
            self._activity_timer.cancel()

        if self.is_closing:
            return

        def do_ping():
            try:
                if not self.is_closing:
                    if self.verbose:
                        print("PusherLightConnection: ping sent")
                        sys.stdout.flush()
                    self.sendMessage(json.dumps({
                        'event': 'pusher:ping',
                        'data': {}
                    }).encode('utf8'))

                # Wait for pong response
                def wait4pong():
                    if not self.is_closing:
                        self.event_emitter.emit('err', 'pong not received from server')
                        self._closeConnection(True)

                self._activity_timer = self.loop.call_later(self.pong_timeout, wait4pong)
            except Exception as ex:
                pass
        self._activity_timer = self.loop.call_later(self.activity_timeout, do_ping)

    def onConnect(self, response):
        pass

    def onOpen(self):
        # self.future.done() or self.future.set_result(None)
        pass

    async def onMessage(self, payload, isBinary):
        if self.verbose:
            print("PusherLightConnection: ")
            print(payload)
            sys.stdout.flush()
        if self.is_closing:
            return
        self.resetActivityCheck()
        if isBinary:
            msg = json.loads(payload)
        else:
            msg = json.loads(payload.decode('utf8'))
        if msg['event'] == 'pusher:connection_established':
            # starting
            event_data = json.loads(msg['data'])
            if 'activity_timeout' in event_data:
                self.activity_timeout = event_data['activity_timeout']
            self.future.done() or self.future.set_result(None)
        elif msg['event'] == 'pusher:ping':
            self.sendMessage(json.dumps({
                'event': 'pusher:pong',
                'data': {}
            }).encode('utf8'))
        elif msg['event'] == 'pusher_internal:subscription_succeeded':
            channel = msg['channel']
            self.event_emitter.emit('message', json.dumps({
                'event': 'subscription_succeeded',
                'channel': channel
            }))
        elif msg['event'] == 'pusher:error':
            # {"event":"pusher:error","data":{"code":null,"message":"Unsupported event received on socket: subscribe"}
            self.event_emitter.emit('err', msg['data']['message'])
        else:
            event_data = json.loads(msg['data'])
            channel = msg['channel']
            self.event_emitter.emit('message', json.dumps({
                'event': msg['event'],
                'channel': channel,
                'data': event_data
            }))

    def onClose(self, wasClean, code, reason):
        self.future.done() or self.future.set_exception(Exception(reason))
        if self.is_closing:
            return
        if wasClean:
            self.event_emitter.emit('error', Exception(reason))
        else:
            self.event_emitter.emit('close')


class PusherLightConnection(WebsocketBaseConnection):
    def __init__(self, options, timeout, loop):
        super(PusherLightConnection, self).__init__()
        self.options = options
        self.timeout = timeout
        self.loop = loop  # type: asyncio.BaseEventLoop
        self.client = None
        self.urlParam = '?client=' + CLIENT + '&version=' + VERSION + '&protocol=' + PROTOCOL

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
                    factory = WebSocketClientFactory(self.options['url'] + self.urlParam)
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
            json_data = json.loads(data)
            if json_data['event'] == 'subscribe':
                self.client.sendMessage(json.dumps({
                    'event': 'pusher:subscribe',
                    'data': {
                        'channel': json_data['channel']
                    }
                }).encode('utf8'))
            elif json_data['event'] == 'unsubscribe':
                self.client.sendMessage(json.dumps({
                    'event': 'pusher:unsubscribe',
                    'data': {
                        'channel': json_data['channel']
                    }
                }).encode('utf8'))

    def isActive(self):
        return (self.client is not None) and ((self.client.state == WebSocketClientProtocol.STATE_OPEN) or (self.client.state == WebSocketClientProtocol.STATE_CONNECTING))
