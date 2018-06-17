# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.13.45'

# -----------------------------------------------------------------------------

import asyncio
import concurrent
import socket
import time
import math
import random
import certifi
import aiohttp
import ssl
import yarl
import re
import json
import sys

# -----------------------------------------------------------------------------

from ccxt.async.base.throttle import throttle

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import NotSupported

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange

from ccxt.base.async.websocket_connection import WebsocketConnection
from pyee import EventEmitter

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange, EventEmitter):

    loop = asyncio.get_event_loop()  # type: asyncio.BaseEventLoop

    def __init__(self, config={}):
        if 'asyncio_loop' in config:
            self.asyncio_loop = config['asyncio_loop']
        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        self.own_session = 'session' not in config
        if self.own_session:
            # Create out SSL context object with our CA cert file
            context = ssl.create_default_context(cafile=certifi.where())
            # Pass this SSL context to aiohttp and create a TCPConnector
            connector = aiohttp.TCPConnector(ssl_context=context, loop=self.asyncio_loop)
            self.session = aiohttp.ClientSession(loop=self.asyncio_loop, connector=connector)
        # async connection initialization
        self.asyncconf = {}
        self.asyncConnectionPool = {}
        self.async_reset_context()
        # snake renaming methods
        if 'methodmap' in self.asyncconf:
            def camel2snake(name):
                return name[0].lower() + re.sub(r'(?!^)[A-Z]', lambda x: '_' + x.group(0).lower(), name[1:])
            for m in self.asyncconf['methodmap']:
                self.asyncconf['methodmap'][m] = camel2snake(self.asyncconf['methodmap'][m])
        super(Exchange, self).__init__(config)

        self.init_rest_rate_limiter()

    def init_rest_rate_limiter(self):
        self.throttle = throttle(self.extend({
            'loop': self.asyncio_loop,
        }, self.tokenBucket))

    def __del__(self):
        if self.session is not None:
            self.logger.warning(self.id + ' requires to release all resources with an explicit call to the .close() coroutine.')

    async def close(self):
        if self.session is not None:
            if self.own_session:
                await self.session.close()
            self.session = None

    async def wait_for_token(self):
        while self.rateLimitTokens <= 1:
            # if self.verbose:
            #     print('Waiting for tokens: Exchange: {0}'.format(self.id))
            self.add_new_tokens()
            seconds_delays = [0.001, 0.005, 0.022, 0.106, 0.5]
            delay = random.choice(seconds_delays)
            await asyncio.sleep(delay)
        self.rateLimitTokens -= 1

    def add_new_tokens(self):
        # if self.verbose:
        #     print('Adding new tokens: Exchange: {0}'.format(self.id))
        now = time.monotonic()
        time_since_update = now - self.rateLimitUpdateTime
        new_tokens = math.floor((0.8 * 1000.0 * time_since_update) / self.rateLimit)
        if new_tokens > 1:
            self.rateLimitTokens = min(self.rateLimitTokens + new_tokens, self.rateLimitMaxTokens)
            self.rateLimitUpdateTime = now

    async def fetch2(self, path, api='public', method='GET', params={}, headers=None, body=None):
        """A better wrapper over request for deferred signing"""
        if self.enableRateLimit:
            await self.throttle()
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        return await self.fetch(request['url'], request['method'], request['headers'], request['body'])

    async def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = self.prepare_request_headers(headers)

        url = self.proxy + url

        if self.verbose:
            print("\nRequest:", method, url, headers, body)

        self.logger.debug("%s %s, Request: %s %s", method, url, headers, body)

        encoded_body = body.encode() if body else None
        session_method = getattr(self.session, method.lower())
        http_status_code = None

        try:
            async with session_method(yarl.URL(url, encoded=True),
                                      data=encoded_body,
                                      headers=headers,
                                      timeout=(self.timeout / 1000),
                                      proxy=self.aiohttp_proxy) as response:
                http_status_code = response.status
                text = await response.text()
                self.last_http_response = text
                self.last_response_headers = response.headers
                self.handle_errors(http_status_code, text, url, method, self.last_response_headers, text)
                self.handle_rest_errors(None, http_status_code, text, url, method)
                if self.verbose:
                    print("\nResponse:", method, url, str(http_status_code), str(response.headers), self.last_http_response)
                self.logger.debug("%s %s, Response: %s %s %s", method, url, response.status, response.headers, self.last_http_response)

        except socket.gaierror as e:
            self.raise_error(ExchangeNotAvailable, url, method, e, None)

        except concurrent.futures._base.TimeoutError as e:
            self.raise_error(RequestTimeout, method, url, e, None)

        except aiohttp.client_exceptions.ClientConnectionError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e, None)

        except aiohttp.client_exceptions.ClientError as e:
            self.raise_error(ExchangeError, url, method, e, None)

        self.handle_errors(http_status_code, text, url, method, self.last_response_headers, text)
        return self.handle_rest_response(text, url, method, headers, body)

    async def load_markets(self, reload=False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        markets = await self.fetch_markets()
        currencies = None
        if self.has['fetchCurrencies']:
            currencies = await self.fetch_currencies()
        return self.set_markets(markets, currencies)

    async def fetch_markets(self):
        return self.markets

    async def fetch_order_status(self, id, market=None):
        order = await self.fetch_order(id)
        return order['status']

    async def fetch_partial_balance(self, part, params={}):
        balance = await self.fetch_balance(params)
        return balance[part]

    async def fetch_l2_order_book(self, symbol, limit=None, params={}):
        orderbook = await self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
        })

    async def perform_order_book_request(self, market, limit=None, params={}):
        raise NotSupported(self.id + ' performOrderBookRequest not supported yet')

    async def fetch_order_book(self, symbol, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderbook = await self.perform_order_book_request(market, limit, params)
        return self.parse_order_book(orderbook, market, limit, params)

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            self.raise_error(NotSupported, details='fetch_ohlcv() not implemented yet')
        await self.load_markets()
        trades = await self.fetch_trades(symbol, since, limit, params)
        return self.build_ohlcv(trades, timeframe, since, limit)

    async def fetch_full_tickers(self, symbols=None, params={}):
        tickers = await self.fetch_tickers(symbols, params)
        return tickers

    async def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            self.raise_error(ExchangeError, details='updateOrder() requires enableRateLimit = true')
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, *args)

    # async methods

    def async_context_get_subscribed_event_symbols(self, conxid):
        ret = []
        for key in self.asyncContext:
            for symbol in self.asyncContext[key]:
                symbol_context = self.asyncContext[key][symbol]
                if ((symbol_context.conxid == conxid) and ((symbol_context['subscribed']) and(symbol_context['subscribing']))):
                    ret.append({
                        'event': key,
                        'symbol': symbol,
                    })
        return ret

    def async_reset_context(self, conxid=None):
        if conxid is None:
            self.asyncContext = {
                'ob': {},
                'ticker': {},
                'ohlvc': {},
                'trades': {},
                '_': {}
            }
        else:
            for key in self.asyncContext:
                if key != '_':
                    for symbol in self.asyncContext[key]:
                        symbol_context = self.asyncContext[key][symbol]
                        if (symbol_context['conxid'] == conxid):
                            symbol_context['subscribed'] = False
                            symbol_context['subscribing'] = False
                            symbol_context['data'] = {}

    def async_connection_get(self, conxid='default'):
        if (conxid not in self.asyncConnectionPool):
            raise NotSupported("async <" + conxid + "> not found in this exchange: " + self.id)
        return self.asyncConnectionPool[conxid]

    def _async_get_action_for_event(self, event, symbol, subscription=True):
        # if subscription and still subscribed no action returned
        sym = self.asyncContext[event][symbol] if (symbol in self.asyncContext[event]) else None
        if (subscription and (sym is not None) and (sym['subscribed'] or sym['subscribing'])):
            return None
        # if unsubscription and no subscribed and no subscribing no action returned
        if (not subscription and ((sym is None) or (not sym['subscribed'] and not sym['subscribing']))):
            return None
        # get conexion type for event
        event_conf = self.safeValue(self.asyncconf['events'], event)
        if (event_conf is None):
            raise ExchangeError("invalid async configuration for event: " + event + " in exchange: " + self.id)
        conx_tpl_name = self.safeString(event_conf, 'conx-tpl', 'default')
        conx_tpl = self.safeValue(self.asyncconf['conx-tpls'], conx_tpl_name)
        if (conx_tpl is None):
            raise ExchangeError("tpl async conexion: " + conx_tpl_name + " does not exist in exchange: " + self.id)
        generators = self.safeValue(event_conf, 'generators', {
            'url': '{baseurl}',
            'id': '{id}',
            'stream': '{symbol}',
        })
        params = self.extend({}, conx_tpl, {
            'event': event,
            'symbol': symbol,
            'id': conx_tpl_name,
        })
        config = self.extend({}, conx_tpl)
        for key in generators:
            config[key] = self.implode_params(generators[key], params)
        if (not (('id' in config) and ('url' in config) and ('type' in config))):
            raise ExchangeError("invalid async configuration in exchange: " + self.id)
        if (config['type'] == 'ws'):
            return {
                'action': 'connect',
                'conx-config': config,
                'reset-context': 'onconnect',
            }
        elif (config['type'] == 'ws-s'):
            subscribed = self.async_context_get_subscribed_event_symbols(config['id'])
            next_stream_list = [self.implode_params(generators['stream'], {
                'event': event,
                'symbol': self.market_id(symbol).lower(),
            })]
            for element in subscribed:
                e = element['event']
                s = element['symbol']
                next_stream_list.append(self.implode_params(generators['stream'], {
                    'event': e,
                    'symbol': self.market_id(s).lower(),
                }))
            next_stream_list.sort()
            config['stream'] = ''.join(next_stream_list)
            config['url'] = config['url'] + config['stream']
            return {
                'action': 'reconnect',
                'conx-config': config,
                'reset-context': 'onreconnect',
            }
        else:
            raise NotSupported("invalid async connection: " + config['type'] + " for exchange " + self.id)

    async def async_ensure_conx_active(self, event, symbol, subscribe):
        await self.load_markets()
        # self.load_markets()
        action = self._async_get_action_for_event(event, symbol, subscribe)
        if (action is not None):
            conx_config = self.safeValue(action, 'conx-config', {})
            if (action['action'] == 'reconnect'):
                if (conx_config['id'] in self.asyncConnectionPool):
                    self.asyncConnectionPool[conx_config['id']]['conx'].close()
                if (action['reset-context'] == 'onreconnect'):
                    self.async_reset_context(conx_config['id'])
                self.asyncConnectionPool[conx_config['id']] = self.async_initialize(conx_config, conx_config['id'])
            elif (action['action'] == 'connect'):
                if (conx_config['id'] in self.asyncConnectionPool):
                    if (not self.asyncConnectionPool[conx_config['id']]['conx'].isActive()):
                        self.asyncConnectionPool[conx_config['id']]['conx'].close()
                        self.async_reset_context(conx_config['id'])
                        self.asyncConnectionPool[conx_config['id']] = self.async_initialize(conx_config, conx_config['id'])
                else:
                    self.async_reset_context(conx_config['id'])
                    self.asyncConnectionPool[conx_config['id']] = self.async_initialize(conx_config, conx_config['id'])

            if (symbol not in self.asyncContext['ob']):
                self.asyncContext['ob'][symbol] = {
                    'subscribed': False,
                    'subscribing': False,
                    'data': {},
                    'conxid': conx_config['id'],
                }
            await self.async_connect()

    async def async_connect(self, conxid='default'):
        async_conx_info = self.async_connection_get(conxid)
        async_connection = async_conx_info['conx']
        await self.load_markets()
        # self.load_markets()
        if (not async_conx_info['ready']):
            wait4ready_event = self.safeString(self.asyncconf['conx-tpls'][conxid], 'wait4readyEvent')
            if (wait4ready_event is not None):
                await async_connection.connect()
                future = asyncio.Future()

                @self.once(wait4ready_event)
                def wait4ready_event(success, error=None):
                    if success:
                        async_conx_info['ready'] = True
                        future.done() or future.set_result(None)
                    else:
                        future.done() or future.set_exception(error)

                self.timeout_future(future, 'async_connect')
                # self.loop.run_until_complete(future)
                await future
            else:
                await async_connection.connect()

    def asyncParseJson(self, raw_data):
        return json.loads(raw_data)

    def asyncClose(self, conxid='default'):
        async_conx_info = self.async_connection_get(conxid)
        async_conx_info['conx'].close()

    def asyncSend(self, data, conxid='default'):
        async_conx_info = self.async_connection_get(conxid)
        if self.verbose:
            print("Async send:" + data)
            sys.stdout.flush()
        async_conx_info['conx'].send(data)

    def asyncSendJson(self, data, conxid='default'):
        async_conx_info = self.async_connection_get(conxid)
        if (self.verbose):
            print("Async send:" + json.dumps(data))
            sys.stdout.flush()
        async_conx_info['conx'].sendJson(data)

    def async_initialize(self, async_config, conxid='default'):
        async_connection_info = {
            'auth': False,
            'ready': False,
            'conx': None,
        }
        if (async_config['type'] == 'ws'):
            async_connection_info['conx'] = WebsocketConnection(async_config, self.timeout, Exchange.loop)
        elif (async_config['type'] == 'ws-s'):
            async_connection_info['conx'] = WebsocketConnection(async_config, self.timeout, Exchange.loop)
        else:
            raise NotSupported("invalid async connection: " + async_config['type'] + " for exchange " + self.id)

        conx = async_connection_info['conx']

        @conx.on('open')
        def async_connection_open():
            async_connection_info['auth'] = False
            self._async_event_on_open(conxid, async_connection_info['conx'].options)

        @conx.on('err')
        def async_connection_error(error):
            async_connection_info['auth'] = False
            self.async_reset_context(conxid)
            self.emit('err', error, conxid)

        @conx.on('message')
        def async_connection_message(msg):
            if self.verbose:
                print((conxid + '<-' + msg).encode('utf-8'))
                sys.stdout.flush()
            try:
                self._async_on_msg(msg, conxid)
            except Exception as ex:
                self.emit('err', ex, conxid)

        @conx.on('close')
        def async_connection_close():
            async_connection_info['auth'] = False
            self.async_reset_context(conxid)
            self.emit('close', conxid)

        return async_connection_info

    def timeout_future(self, future, scope):
        self.loop.call_later(self.timeout / 1000, lambda: future.done() or future.set_exception(TimeoutError("timeout in scope: " + scope)))

    def _cloneOrderBook(self, ob, limit=None):
        ret = {
            'timestamp': ob['timestamp'],
            'datetime': ob['datetime'],
            'nonce': ob['nonce']
        }
        if limit is None:
            ret['bids'] = ob['bids'][:]
            ret['asks'] = ob['asks'][:]
        else:
            ret['bids'] = ob['bids'][:limit]
            ret['asks'] = ob['asks'][:limit]
        return ret

    async def async_fetch_order_book(self, symbol, limit=None):
        await self.async_ensure_conx_active('ob', symbol, True)
        if (('ob' in self.asyncContext['ob'][symbol]['data']) and (self.asyncContext['ob'][symbol]['data']['ob'] is not None)):
            return self._cloneOrderBook(self.asyncContext['ob'][symbol]['data']['ob'], limit)

        future = asyncio.Future()

        def wait4orderbook(symbol_r, ob):
            if symbol_r == symbol:
                self.remove_listener('ob', wait4orderbook)
                future.done() or future.set_result(self._cloneOrderBook(ob, limit))

        self.on('ob', wait4orderbook)
        self.timeout_future(future, 'async_fetch_order_book')
        return await future

    async def async_subscribe_order_book(self, symbol):
        await self.async_ensure_conx_active('ob', symbol, True)
        oid = self.nonce()  # str(self.nonce()) + '-' + symbol + '-ob-subscribe'
        future = asyncio.Future()
        oidstr = str(oid)

        @self.once(oidstr)
        def wait4obsubscribe(success, ex=None):
            if success:
                self.asyncContext['ob'][symbol]['subscribed'] = True
                self.asyncContext['ob'][symbol]['subscribing'] = False
                future.done() or future.set_result(True)
            else:
                self.asyncContext['ob'][symbol]['subscribed'] = False
                self.asyncContext['ob'][symbol]['subscribing'] = False
                ex = ex if ex is not None else ExchangeError('error subscribing to ' + symbol + ' in ' + self.id)
                future.done() or future.set_exception(ex)
        self.timeout_future(future, 'async_subscribe_order_book')
        self._async_subscribe_order_book(symbol, oid)
        await future

    def _async_event_on_open(self, conexid, asyncConex):
        pass

    def _asyncExecute(self, method, params, callback, context={}, this_param=None):
        this_param = this_param if (this_param is not None) else self
        eself = self
        # future = asyncio.Future()

        async def t():
            try:
                ret = await getattr(self, method)(*params)
                # ret = getattr(self, method)(*params)
                try:
                    getattr(this_param, callback)(context, None, ret)
                except Exception as ex:
                    eself.emit('err', ExchangeError(eself.id + ': error invoking method ' + callback + ' in _asyncExecute: ' + str(ex)))
            except Exception as ex:
                try:
                    getattr(this_param, callback)(context, ex, None)
                except Exception as ex:
                    eself.emit('err', ExchangeError(eself.id + ': error invoking method ' + callback + ' in _asyncExecute: ' + str(ex)))
            # future.set_result(True)

        # asyncio.ensure_future(t(future), loop = self.loop)
        # self.loop.call_soon(future)
        self.loop.call_soon(t)

    def _asyncMethodMap(self, key):
        if ('methodmap' not in self.asyncconf) or (key not in self.asyncconf['methodmap']):
            raise ExchangeError(self.id + ': ' + key + ' not found in async methodmap')
        return self.asyncconf['methodmap'][key]

    def _asyncTimeoutSet(self, mseconds, method, params, this_param=None):
        this_param = this_param if (this_param is not None) else self

        def f():
            try:
                getattr(this_param, method)(*params)
            except Exception as ex:
                self.emit('err', ExchangeError(self.id + ': error invoking method ' + method + ' ' + str(ex)))
        return self.loop.call_later(mseconds / 1000, f)

    def _asyncTimeoutCancel(self, handle):
        handle.cancel()

    #
    def parse_bids_asks2(self, bidasks, price_key=0, amount_key=1):
        result = []
        if len(bidasks):
            if type(bidasks[0]) is list:
                for bidask in bidasks:
                    result.append(self.parse_bid_ask(bidask, price_key, amount_key))
            elif type(bidasks[0]) is dict:
                for bidask in bidasks:
                    if (price_key in bidask) and (amount_key in bidask):
                        result.append(self.parse_bid_ask(bidask, price_key, amount_key))
            else:
                self.raise_error(ExchangeError, details='unrecognized bidask format: ' + str(bidasks[0]))
        return result

    def searchIndexToInsertOrUpdate(self, value, orderedArray, key, descending=False):
        direction = -1 if descending else 1

        def compare(a, b):
            return -direction if (a < b) else direction if (a > b) else 0

        for i in range(len(orderedArray)):
            if compare(orderedArray[i][key], value) >= 0:
                return i
        return i

    def updateBidAsk(self, bidAsk, currentBidsAsks, bids=False):
        # insert or replace ordered
        index = self.searchIndexToInsertOrUpdate(bidAsk[0], currentBidsAsks, 0, bids)
        if ((index < len(currentBidsAsks)) and (currentBidsAsks[index][0] == bidAsk[0])):
            # found
            if (bidAsk[1] == 0):
                # remove
                del currentBidsAsks[index]
            else:
                # update
                currentBidsAsks[index] = bidAsk
        else:
            if (bidAsk[1] != 0):
                # insert
                currentBidsAsks.insert(index, bidAsk)

    def mergeOrderBookDelta(self, currentOrderBook, orderbook, timestamp=None, bids_key='bids', asks_key='asks', price_key=0, amount_key=1):
        bids = self.parse_bids_asks2(orderbook[bids_key], price_key, amount_key) if (bids_key in orderbook) and isinstance(orderbook[bids_key], list) else []
        asks = self.parse_bids_asks2(orderbook[asks_key], price_key, amount_key) if (asks_key in orderbook) and isinstance(orderbook[asks_key], list) else []
        for bid in bids:
            self.updateBidAsk(bid, currentOrderBook['bids'], True)
        for ask in asks:
            self.updateBidAsk(ask, currentOrderBook['asks'], False)

        currentOrderBook['timestamp'] = timestamp
        currentOrderBook['datetime'] = self.iso8601(timestamp) if timestamp is not None else None
        return currentOrderBook
