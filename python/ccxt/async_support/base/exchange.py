# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.18.871'

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
import sys
import yarl
import re
import json
import base64
import zlib

# -----------------------------------------------------------------------------

from ccxt.async_support.base.throttle import throttle

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import NotSupported
from ccxt.base.errors import NetworkError

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange

from ccxt.async_support.websocket.websocket_connection import WebsocketConnection
from ccxt.async_support.websocket.pusher_light_connection import PusherLightConnection
from ccxt.async_support.websocket.socketio_light_connection import SocketIoLightConnection
from pyee import EventEmitter

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange, EventEmitter):

    def __init__(self, config={}):
        if 'asyncio_loop' in config:
            self.asyncio_loop = config['asyncio_loop']
        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        self.own_session = 'session' not in config
        # async connection initialization
        self.wsconf = {}
        self.websocketContexts = {}
        self.websocketDelayedConnections = {}
        self.wsproxy = None
        self.cafile = config.get('cafile', certifi.where())
        self.open()
        super(Exchange, self).__init__(config)

        # snake renaming methods
        if 'methodmap' in self.wsconf:
            def camel2snake(name):
                return name[0].lower() + re.sub(r'(?!^)[A-Z]', lambda x: '_' + x.group(0).lower(), name[1:])
            for m in self.wsconf['methodmap']:
                self.wsconf['methodmap'][m] = camel2snake(self.wsconf['methodmap'][m])

        self.init_rest_rate_limiter()

    def init_rest_rate_limiter(self):
        self.throttle = throttle(self.extend({
            'loop': self.asyncio_loop,
        }, self.tokenBucket))

    def __del__(self):
        if self.session is not None:
            self.logger.warning(self.id + " requires to release all resources with an explicit call to the .close() coroutine. If you are using the exchange instance with async coroutines, add exchange.close() to your code into a place when you're done with the exchange and don't need the exchange instance anymore (at the end of your async coroutine).")

    if sys.version_info >= (3, 5):
        async def __aenter__(self):
            self.open()
            return self

        async def __aexit__(self, exc_type, exc, tb):
            await self.close()

    def open(self):
        if self.own_session and self.session is None:
            # Create our SSL context object with our CA cert file
            context = ssl.create_default_context(cafile=self.cafile)
            # Pass this SSL context to aiohttp and create a TCPConnector
            connector = aiohttp.TCPConnector(ssl=context, loop=self.asyncio_loop)
            self.session = aiohttp.ClientSession(loop=self.asyncio_loop, connector=connector, trust_env=self.aiohttp_trust_env)

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
        request_headers = self.prepare_request_headers(headers)
        url = self.proxy + url

        if self.verbose:
            print("\nRequest:", method, url, headers, body)
        self.logger.debug("%s %s, Request: %s %s", method, url, headers, body)

        encoded_body = body.encode() if body else None
        session_method = getattr(self.session, method.lower())

        response = None
        http_response = None
        json_response = None
        try:
            async with session_method(yarl.URL(url, encoded=True),
                                      data=encoded_body,
                                      headers=request_headers,
                                      timeout=(self.timeout / 1000),
                                      proxy=self.aiohttp_proxy) as response:
                http_response = await response.text()
                json_response = self.parse_json(http_response) if self.is_json_encoded_object(http_response) else None
                headers = response.headers
                if self.enableLastHttpResponse:
                    self.last_http_response = http_response
                if self.enableLastResponseHeaders:
                    self.last_response_headers = headers
                if self.enableLastJsonResponse:
                    self.last_json_response = json_response
                if self.verbose:
                    print("\nResponse:", method, url, response.status, headers, http_response)
                self.logger.debug("%s %s, Response: %s %s %s", method, url, response.status, headers, http_response)

        except socket.gaierror as e:
            self.raise_error(ExchangeNotAvailable, url, method, e, None)

        except concurrent.futures._base.TimeoutError as e:
            self.raise_error(RequestTimeout, method, url, e, None)

        except aiohttp.client_exceptions.ClientConnectionError as e:
            self.raise_error(ExchangeNotAvailable, url, method, e, None)

        except aiohttp.client_exceptions.ClientError as e:  # base exception class
            self.raise_error(ExchangeError, url, method, e, None)

        self.handle_errors(response.status, response.reason, url, method, headers, http_response, json_response)
        self.handle_rest_errors(None, response.status, http_response, url, method)
        self.handle_rest_response(http_response, json_response, url, method, headers, body)
        if json_response is not None:
            return json_response
        return http_response

    async def load_markets(self, reload=False, params={}):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        currencies = None
        if self.has['fetchCurrencies']:
            currencies = await self.fetch_currencies()
        markets = await self.fetch_markets(params)
        return self.set_markets(markets, currencies)

    async def fetch_fees(self):
        trading = {}
        funding = {}
        if self.has['fetchTradingFees']:
            trading = await self.fetch_trading_fees()
        if self.has['fetchFundingFees']:
            funding = await self.fetch_funding_fees()
        return {
            'trading': trading,
            'funding': funding,
        }

    async def load_fees(self, reload=False):
        if not reload:
            if self.loaded_fees != Exchange.loaded_fees:
                return self.loaded_fees
        self.loaded_fees = self.deep_extend(self.loaded_fees, await self.fetch_fees())
        return self.loaded_fees

    async def fetch_markets(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.to_array(self.markets)

    async def fetch_currencies(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.currencies

    async def fetch_order_status(self, id, symbol=None, params={}):
        order = await self.fetch_order(id, symbol, params)
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

    async def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcv(symbol, timeframe, since, limit, params)

    async def fetch_full_tickers(self, symbols=None, params={}):
        return await self.fetch_tickers(symbols, params)

    async def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            self.raise_error(ExchangeError, details='updateOrder() requires enableRateLimit = true')
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, *args)

    async def fetch_trading_fees(self, params={}):
        self.raise_error(NotSupported, details='fetch_trading_fees() not supported yet')

    async def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            self.raise_error(NotSupported, details='fetch_trading_fee() not supported yet')
        return await self.fetch_trading_fees(params)

    async def load_trading_limits(self, symbols=None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not('limitsLoaded' in list(self.options.keys())):
                response = await self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    # websocket methods
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

        i = 0
        for i in range(len(orderedArray)):
            if compare(orderedArray[i][key], value) >= 0:
                return i
        # return i
        return len(orderedArray)

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

    def updateBidAskDiff(self, bidAsk, currentBidsAsks, bids=False):
        # insert or replace ordered
        index = self.searchIndexToInsertOrUpdate(bidAsk[0], currentBidsAsks, 0, bids)
        if ((index < len(currentBidsAsks)) and (currentBidsAsks[index][0] == bidAsk[0])):
            # found
            nextValue = currentBidsAsks[index][1] + bidAsk[1]
            if (nextValue == 0):
                # remove
                del currentBidsAsks[index]
            else:
                # update
                currentBidsAsks[index][1] = nextValue
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

    def mergeOrderBookDeltaDiff(self, currentOrderBook, orderbook, timestamp=None, bids_key='bids', asks_key='asks', price_key=0, amount_key=1):
        bids = self.parse_bids_asks2(orderbook[bids_key], price_key, amount_key) if (bids_key in orderbook) and isinstance(orderbook[bids_key], list) else []
        asks = self.parse_bids_asks2(orderbook[asks_key], price_key, amount_key) if (asks_key in orderbook) and isinstance(orderbook[asks_key], list) else []
        for bid in bids:
            self.updateBidAskDiff(bid, currentOrderBook['bids'], True)
        for ask in asks:
            self.updateBidAskDiff(ask, currentOrderBook['asks'], False)

        currentOrderBook['timestamp'] = timestamp
        currentOrderBook['datetime'] = self.iso8601(timestamp) if timestamp is not None else None
        return currentOrderBook

    def _websocketContextGetSubscribedEventSymbols(self, conxid):
        ret = []
        events = self._contextGetEvents(conxid)
        for key in events:
            for symbol in events[key]:
                symbol_context = events[key][symbol]
                if ((symbol_context['subscribed']) or (symbol_context['subscribing'])):
                    params = symbol_context['params'] if ('params' in symbol_context) else {}
                    ret.append({
                        'event': key,
                        'symbol': symbol,
                        'params': params,
                    })
        return ret

    def _websocketValidEvent(self, event):
        return ('events' in self.wsconf) and (event in self.wsconf['events'])

    def _websocket_reset_context(self, conxid, conxtpl=None):
        if (not (conxid in self.websocketContexts)):
            self.websocketContexts[conxid] = {
                '_': {},
                'conx-tpl': conxtpl,
                'events': {},
                'conx': None,
            }
        else:
            events = self._contextGetEvents(conxid)
            for key in events:
                for symbol in events[key]:
                    symbol_context = events[key][symbol]
                    symbol_context['subscribed'] = False
                    symbol_context['subscribing'] = False
                    symbol_context['data'] = {}

    def _contextGetConxTpl(self, conxid):
        return self.websocketContexts[conxid]['conx-tpl']

    def _contextGetConnection(self, conxid):
        if (self.websocketContexts[conxid]['conx'] is None):
            return None
        return self.websocketContexts[conxid]['conx']['conx']

    def _contextGetConnectionInfo(self, conxid):
        if (self.websocketContexts[conxid]['conx'] is None):
            raise NotSupported("websocket <" + conxid + "> not found in this exchange: " + self.id)
        return self.websocketContexts[conxid]['conx']

    def _contextIsConnectionReady(self, conxid):
        return self.websocketContexts[conxid]['conx']['ready']

    def _contextSetConnectionReady(self, conxid, ready):
        self.websocketContexts[conxid]['conx']['ready'] = ready

    def _contextIsConnectionAuth(self, conxid):
        return self.websocketContexts[conxid]['conx']['auth']

    def _contextSetConnectionAuth(self, conxid, auth):
        self.websocketContexts[conxid]['conx']['auth'] = auth

    def _contextSetConnectionInfo(self, conxid, info):
        self.websocketContexts[conxid]['conx'] = info

    def _contextSet(self, conxid, key, data):
        self.websocketContexts[conxid]['_'][key] = data

    def _contextGet(self, conxid, key):
        if (key not in self.websocketContexts[conxid]['_']):
            return None
        return self.websocketContexts[conxid]['_'][key]

    def _contextGetEvents(self, conxid):
        return self.websocketContexts[conxid]['events']

    def _contextGetSymbols(self, conxid, event):
        return self.websocketContexts[conxid]['events'][event]

    def _contextResetEvent(self, conxid, event):
        self.websocketContexts[conxid]['events'][event] = {}

    def _contextResetSymbol(self, conxid, event, symbol):
        self.websocketContexts[conxid]['events'][event][symbol] = {
            'subscribed': False,
            'subscribing': False,
            'data': {},
        }

    def _contextGetSymbolData(self, conxid, event, symbol):
        return self.websocketContexts[conxid]['events'][event][symbol]['data']

    def _contextSetSymbolData(self, conxid, event, symbol, data):
        self.websocketContexts[conxid]['events'][event][symbol]['data'] = data

    def _contextSetSubscribed(self, conxid, event, symbol, subscribed, params={}):
        self.websocketContexts[conxid]['events'][event][symbol]['subscribed'] = subscribed
        self.websocketContexts[conxid]['events'][event][symbol]['params'] = params

    def _contextIsSubscribed(self, conxid, event, symbol):
        return (event in self.websocketContexts[conxid]['events']) and \
            (symbol in self.websocketContexts[conxid]['events'][event]) and \
            self.websocketContexts[conxid]['events'][event][symbol]['subscribed']

    def _contextSetSubscribing(self, conxid, event, symbol, subscribing):
        self.websocketContexts[conxid]['events'][event][symbol]['subscribing'] = subscribing

    def _contextIsSubscribing(self, conxid, event, symbol):
        return (event in self.websocketContexts[conxid]['events']) and \
            (symbol in self.websocketContexts[conxid]['events'][event]) and \
            self.websocketContexts[conxid]['events'][event][symbol]['subscribing']

    def _websocketGetConxid4Event(self, event, symbol):
        eventConf = self.safe_value(self.wsconf['events'], event)
        conxParam = self.safe_value(eventConf, 'conx-param', {
            'id': '{id}'
        })
        return {
            'conxid': self.implode_params(conxParam['id'], {
                'event': event,
                'symbol': symbol,
                'id': eventConf['conx-tpl']
            }),
            'conxtpl': eventConf['conx-tpl']
        }

    def _websocket_get_action_for_event(self, conxid, event, symbol, subscription=True, subscription_params={}):
        # if subscription and still subscribed no action returned
        isSubscribed = self._contextIsSubscribed(conxid, event, symbol)
        isSubscribing = self._contextIsSubscribing(conxid, event, symbol)
        if (subscription and (isSubscribed or isSubscribing)):
            return None
        # if unsubscription and no subscribed and no subscribing no action returned
        if (not subscription and ((not isSubscribed and not isSubscribing))):
            return None
        # get conexion type for event
        event_conf = self.safe_value(self.wsconf['events'], event)
        if (event_conf is None):
            raise ExchangeError("invalid websocket configuration for event: " + event + " in exchange: " + self.id)
        conx_tpl_name = self.safe_string(event_conf, 'conx-tpl', 'default')
        conx_tpl = self.safe_value(self.wsconf['conx-tpls'], conx_tpl_name)
        if (conx_tpl is None):
            raise ExchangeError("tpl websocket conexion: " + conx_tpl_name + " does not exist in exchange: " + self.id)
        conxParam = self.safe_value(event_conf, 'conx-param', {
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
        for key in conxParam:
            config[key] = self.implode_params(conxParam[key], params)
        if (not (('id' in config) and ('url' in config) and ('type' in config))):
            raise ExchangeError("invalid websocket configuration in exchange: " + self.id)
        if (config['type'] == 'signalr'):
            return {
                'action': 'connect',
                'conx-config': config,
                'reset-context': 'onconnect',
                'conx-tpl': conx_tpl_name,
            }
        elif (config['type'] == 'ws-io'):
            return {
                'action': 'connect',
                'conx-config': config,
                'reset-context': 'onconnect',
                'conx-tpl': conx_tpl_name,
            }
        elif (config['type'] == 'pusher'):
            return {
                'action': 'connect',
                'conx-config': config,
                'reset-context': 'onconnect',
                'conx-tpl': conx_tpl_name,
            }
        elif (config['type'] == 'ws'):
            return {
                'action': 'connect',
                'conx-config': config,
                'reset-context': 'onconnect',
                'conx-tpl': conx_tpl_name,
            }
        elif (config['type'] == 'ws-s'):
            subscribed = self._websocketContextGetSubscribedEventSymbols(config['id'])
            if subscription:
                subscribed.append({
                    'event': event,
                    'symbol': symbol,
                })
                config['url'] = self._websocket_generate_url_stream(subscribed, config, subscription_params)
                return {
                    'action': 'reconnect',
                    'conx-config': config,
                    'reset-context': 'onreconnect',
                    'conx-tpl': conx_tpl_name,
                }
            else:
                for i in range(len(subscribed)):
                    element = subscribed[i]
                    if ((element['event'] == event) and (element['symbol'] == symbol)):
                        del subscribed[i]
                        break
                if (len(subscribed) == 0):
                    return {
                        'action': 'disconnect',
                        'conx-config': config,
                        'reset-context': 'always',
                        'conx-tpl': conx_tpl_name,
                    }
                else:
                    config['url'] = self._websocket_generate_url_stream(subscribed, config, subscription_params)
                    return {
                        'action': 'reconnect',
                        'conx-config': config,
                        'reset-context': 'onreconnect',
                        'conx-tpl': conx_tpl_name,
                    }
        else:
            raise NotSupported("invalid websocket connection: " + config['type'] + " for exchange " + self.id)

    async def _websocket_ensure_conx_active(self, event, symbol, subscribe, subscription_params={}, delayed=False):
        await self.load_markets()
        # self.load_markets()
        ret = self._websocketGetConxid4Event(event, symbol)
        conxid = ret['conxid']
        conxtpl = ret['conxtpl']
        if (not(conxid in self.websocketContexts)):
            self._websocket_reset_context(conxid, conxtpl)
        action = self._websocket_get_action_for_event(conxid, event, symbol, subscribe, subscription_params)
        if (action is not None):
            conx_config = self.safe_value(action, 'conx-config', {})
            conx_config['verbose'] = self.verbose
            if (not(event in self._contextGetEvents(conxid))):
                self._contextResetEvent(conxid, event)
            if (not(symbol in self._contextGetSymbols(conxid, event))):
                self._contextResetSymbol(conxid, event, symbol)
            if (action['action'] == 'reconnect'):
                conx = self._contextGetConnection(conxid)
                if (conx is not None):
                    conx.close()
                if not delayed:
                    if (action['reset-context'] == 'onreconnect'):
                        # self._websocket_reset_context(conxid, conxtpl)
                        self._contextResetSymbol(conxid, event, symbol)
                self._contextSetConnectionInfo(conxid, await self._websocket_initialize(conx_config, conxid))
            elif (action['action'] == 'connect'):
                conx = self._contextGetConnection(conxid)
                if (conx is not None):
                    if (not conx.isActive()):
                        conx.close()
                        self._websocket_reset_context(conxid, conxtpl)
                        self._contextSetConnectionInfo(conxid, await self._websocket_initialize(conx_config, conxid))
                else:
                    self._websocket_reset_context(conxid, conxtpl)
                    self._contextSetConnectionInfo(conxid, await self._websocket_initialize(conx_config, conxid))
            elif (action['action'] == 'disconnect'):
                conx = self._contextGetConnection(conxid)
                if (conx is not None):
                    conx.close()
                    self._websocket_reset_context(conxid, conxtpl)
                if delayed:
                    # if not subscription in conxid remove from delayed
                    if conxid in list(self.websocketDelayedConnections.keys()):
                        del self.websocketDelayedConnections[conxid]
                return conxid

            if delayed:
                if conxid not in list(self.websocketDelayedConnections.keys()):
                    self.websocketDelayedConnections[conxid] = {
                        'conxtpl': conxtpl,
                        'reset': False,  # action['action'] != 'connect'
                    }
            else:
                await self.websocket_connect(conxid)

        return conxid

    async def _websocket_connect_delayed(self):
        try:
            for conxid in list(self.websocketDelayedConnections.keys()):
                if self.websocketDelayedConnections[conxid]['reset']:
                    self._websocket_reset_context(conxid, self.websocketDelayedConnections[conxid]['conxtpl'])
                await self.websocket_connect(conxid)
        finally:
            self.websocketDelayedConnections = {}

    async def websocket_connect(self, conxid='default'):
        sys.stdout.flush()
        websocket_conx_info = self._contextGetConnectionInfo(conxid)
        conx_tpl = self._contextGetConxTpl(conxid)
        websocket_connection = websocket_conx_info['conx']
        await self.load_markets()
        # self.load_markets()
        if (not websocket_conx_info['ready']):
            wait4ready_event = self.safe_string(self.wsconf['conx-tpls'][conx_tpl], 'wait4readyEvent')
            if (wait4ready_event is not None):
                future = asyncio.Future()

                @self.once(wait4ready_event)
                def wait4ready_event(success, error=None):
                    if success:
                        websocket_conx_info['ready'] = True
                        future.done() or future.set_result(None)
                    else:
                        future.done() or future.set_exception(error)

                self.timeout_future(future, 'websocket_connect')
                # self.asyncio_loop.run_until_complete(future)
                await websocket_connection.connect()
                await future
            else:
                await websocket_connection.connect()

    def websocketParseJson(self, raw_data):
        return json.loads(raw_data)

    def websocketClose(self, conxid='default'):
        websocket_conx_info = self._contextGetConnectionInfo(conxid)
        websocket_conx_info['conx'].close()

    def websocketCloseAll(self):
        for c in self.websocketContexts:
            self.websocketClose(c)

    def websocketCleanContext(self, conxid=None):
        if conxid is None:
            for conxid in self.websocketContexts:
                self._websocket_reset_context(conxid)
        else:
            self._websocket_reset_context(conxid)

    async def websocketRecoverConxid(self, conxid='default', eventSymbols=None):
        if eventSymbols is None:
            eventSymbols = self._websocketContextGetSubscribedEventSymbols(conxid)
        self.websocketClose(conxid)
        self._websocket_reset_context(conxid)
        await self.websocket_subscribe_all(eventSymbols)

    def websocketSend(self, data, conxid='default'):
        websocket_conx_info = self._contextGetConnectionInfo(conxid)
        if self.verbose:
            print("Async send:" + data)
            sys.stdout.flush()
        websocket_conx_info['conx'].send(data)

    def websocketSendJson(self, data, conxid='default'):
        websocket_conx_info = self._contextGetConnectionInfo(conxid)
        if (self.verbose):
            print("Async send:" + json.dumps(data))
            sys.stdout.flush()
        websocket_conx_info['conx'].sendJson(data)

    async def _websocket_initialize(self, websocket_config, conxid='default'):
        websocket_connection_info = {
            'auth': False,
            'ready': False,
            'conx': None,
        }
        websocket_config = await self._websocket_on_init(conxid, websocket_config)
        if self.proxies is not None:
            websocket_config['proxies'] = self.proxies
        if (websocket_config['type'] == 'signalr'):
            websocket_connection_info['conx'] = WebsocketConnection(websocket_config, self.timeout, self.asyncio_loop)
        elif (websocket_config['type'] == 'ws-io'):
            websocket_connection_info['conx'] = SocketIoLightConnection(websocket_config, self.timeout, self.asyncio_loop)
        elif (websocket_config['type'] == 'pusher'):
            websocket_connection_info['conx'] = PusherLightConnection(websocket_config, self.timeout, self.asyncio_loop)
        elif (websocket_config['type'] == 'ws'):
            websocket_connection_info['conx'] = WebsocketConnection(websocket_config, self.timeout, self.asyncio_loop)
        elif (websocket_config['type'] == 'ws-s'):
            websocket_connection_info['conx'] = WebsocketConnection(websocket_config, self.timeout, self.asyncio_loop)
        else:
            raise NotSupported("invalid async connection: " + websocket_config['type'] + " for exchange " + self.id)

        conx = websocket_connection_info['conx']

        @conx.on('open')
        def websocket_connection_open():
            websocket_connection_info['auth'] = False
            self._websocket_on_open(conxid, websocket_connection_info['conx'].options)

        @conx.on('err')
        def websocket_connection_error(error):
            websocket_connection_info['auth'] = False
            self._websocket_on_error(conxid)
            # self._websocket_reset_context(conxid)
            self.emit('err', NetworkError(error), conxid)

        @conx.on('message')
        def websocket_connection_message(msg):
            if self.verbose:
                print((conxid + '<-' + msg).encode('utf-8'))
                sys.stdout.flush()
            try:
                self._websocket_on_message(conxid, msg)
            except Exception as ex:
                self.emit('err', ex, conxid)

        @conx.on('close')
        def websocket_connection_close():
            websocket_connection_info['auth'] = False
            self._websocket_on_close(conxid)
            # self._websocket_reset_context(conxid)
            self.emit('close', conxid)

        return websocket_connection_info

    def timeout_future(self, future, scope):
        self.asyncio_loop.call_later(self.timeout / 1000, lambda: future.done() or future.set_exception(TimeoutError("timeout in scope: " + scope)))

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

    def _executeAndCallback(self, contextId, method, params, callback, context={}, this_param=None):
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
                    eself.emit('err', ExchangeError(eself.id + ': error invoking method ' + callback + ' in _asyncExecute: ' + str(ex)), contextId)
            except Exception as ex:
                try:
                    getattr(this_param, callback)(context, ex, None)
                except Exception as ex:
                    eself.emit('err', ExchangeError(eself.id + ': error invoking method ' + callback + ' in _asyncExecute: ' + str(ex)), contextId)
            # future.set_result(True)

        asyncio.ensure_future(t(), loop=self.asyncio_loop)
        # self.asyncio_loop.call_soon(future)
        # self.asyncio_loop.call_soon(t)

    async def websocket_fetch_order_book(self, symbol, limit=None):
        if not self._websocketValidEvent('ob'):
            raise ExchangeError('Not valid event ob for exchange ' + self.id)
        conxid = await self._websocket_ensure_conx_active('ob', symbol, True)
        ob = self._get_current_websocket_orderbook(conxid, symbol, limit)
        if (ob is not None):
            return ob

        future = asyncio.Future()

        def wait4orderbook(symbol_r, ob):
            if symbol_r == symbol:
                self.remove_listener('ob', wait4orderbook)
                future.done() or future.set_result(self._get_current_websocket_orderbook(conxid, symbol, limit))

        self.on('ob', wait4orderbook)
        self.timeout_future(future, 'websocket_fetch_order_book')
        return await future

    async def websocket_subscribe(self, event, symbol, params={}):
        await self.websocket_subscribe_all([{
            'event': event,
            'symbol': symbol,
            'params': params
        }])

    async def websocket_subscribe_all(self, eventSymbols):
        # check all
        for eventSymbol in eventSymbols:
            if not self._websocketValidEvent(eventSymbol['event']):
                raise ExchangeError('Not valid event ' + eventSymbol['event'] + ' for exchange ' + self.id)
        conxIds = []
        # prepare all conxid
        for eventSymbol in eventSymbols:
            event = eventSymbol['event']
            symbol = eventSymbol['symbol']
            params = eventSymbol['params']
            conxid = await self._websocket_ensure_conx_active(event, symbol, True, params, True)
            conxIds.append(conxid)
            self._contextSetSubscribing(conxid, event, symbol, True)
        # connect all delayed
        await self._websocket_connect_delayed()
        for i in range(0, len(eventSymbols)):
            conxid = conxIds[i]
            event = eventSymbols[i]['event']
            symbol = eventSymbols[i]['symbol']
            params = eventSymbols[i]['params']
            oid = self.nonce()  # str(self.nonce()) + '-' + symbol + '-ob-subscribe'
            future = asyncio.Future()
            oidstr = str(oid)

            @self.once(oidstr)
            def wait4obsubscribe(success, ex=None):
                if success:
                    self._contextSetSubscribed(conxid, event, symbol, True, params)
                    self._contextSetSubscribing(conxid, event, symbol, False)
                    future.done() or future.set_result(conxid)
                else:
                    self._contextSetSubscribed(conxid, event, symbol, False)
                    self._contextSetSubscribing(conxid, event, symbol, False)
                    ex = ex if ex is not None else ExchangeError('error subscribing to ' + event + '(' + symbol + ') in ' + self.id)
                    future.done() or future.set_exception(ex)
            self.timeout_future(future, 'websocket_subscribe')
            self._websocket_subscribe(conxid, event, symbol, oid, params)
            await future

    async def websocket_unsubscribe(self, event, symbol, params={}):
        await self.websocket_unsubscribe_all([{
            'event': event,
            'symbol': symbol,
            'params': params
        }])

    async def websocket_unsubscribe_all(self, eventSymbols):
        # check all
        for eventSymbol in eventSymbols:
            if not self._websocketValidEvent(eventSymbol['event']):
                raise ExchangeError('Not valid event ' + eventSymbol['event'] + ' for exchange ' + self.id)

        try:
            for eventSymbol in eventSymbols:
                event = eventSymbol['event']
                symbol = eventSymbol['symbol']
                params = eventSymbol['params']
                conxid = await self._websocket_ensure_conx_active(event, symbol, False, params, True)
                # ret = self._websocketGetConxid4Event(event, symbol)
                # conxid = ret['conxid']
                oid = self.nonce()  # str(self.nonce()) + '-' + symbol + '-ob-subscribe'
                future = asyncio.Future()
                oidstr = str(oid)

                @self.once(oidstr)
                def wait4obunsubscribe(success, ex=None):
                    if success:
                        self._contextSetSubscribed(conxid, event, symbol, False)
                        self._contextSetSubscribing(conxid, event, symbol, False)
                        future.done() or future.set_result(True)
                    else:
                        ex = ex if ex is not None else ExchangeError('error unsubscribing to ' + event + '(' + symbol + ') in ' + self.id)
                        future.done() or future.set_exception(ex)
                self.timeout_future(future, 'websocket_unsubscribe')
                self._websocket_unsubscribe(conxid, event, symbol, oid, params)
                await future

        finally:
            await self._websocket_connect_delayed()

    async def _websocket_on_init(self, contextId, websocketConexConfig):
        return websocketConexConfig

    def _websocket_on_open(self, contextId, websocketConexConfig):
        pass

    def _websocket_on_message(self, contextId, data):
        pass

    def _websocket_on_close(self, contextId):
        pass

    def _websocket_on_error(self, contextId):
        pass

    def _websocketMarketId(self, symbol):
        return self.market_id(symbol)

    def _websocket_generate_url_stream(self, events, options, subscription_params):
        raise NotSupported("You must to implement _websocketGenerateStream method for exchange " + self.id)

    def _websocket_subscribe(self, contextId, event, symbol, oid, params={}):
        raise NotSupported('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + self.id)

    def _websocket_unsubscribe(self, contextId, event, symbol, oid, params={}):
        raise NotSupported('unsubscribe ' + event + '(' + symbol + ') not supported for exchange ' + self.id)

    def _websocketMethodMap(self, key):
        if ('methodmap' not in self.wsconf) or (key not in self.wsconf['methodmap']):
            raise ExchangeError(self.id + ': ' + key + ' not found in websocket methodmap')
        return self.wsconf['methodmap'][key]

    def _setTimeout(self, contextId, mseconds, method, params, this_param=None):
        this_param = this_param if (this_param is not None) else self

        def f():
            try:
                getattr(this_param, method)(*params)
            except Exception as ex:
                self.emit('err', ExchangeError(self.id + ': error invoking method ' + method + ' ' + str(ex)), contextId)
        return self.asyncio_loop.call_later(mseconds / 1000, f)

    def _cancelTimeout(self, handle):
        handle.cancel()

    def _setTimer(self, contextId, mseconds, method, params, this_param=None):
        this_param = this_param if (this_param is not None) else self

        def f():
            try:
                getattr(this_param, method)(*params)
            except Exception as ex:
                self.emit('err', ExchangeError(self.id + ': error invoking method ' + method + ' ' + str(ex)), contextId)
        return self.call_periodic(mseconds / 1000, f)

    def _cancelTimer(self, handle):
        handle.cancel()

    def call_periodic(self, interval, callback, *args, **kwargs):
        # get loop as a kwarg or take the default one
        loop = self.asyncio_loop
        # record the loop's time when call_periodic was called
        start = loop.time()

        def run(handle):
            # XXX: we could record before = loop.time() and warn when callback(*args) took longer than interval
            # call callback now (possibly blocks run)
            callback(*args)
            # reschedule run at the soonest time n * interval from start
            # re-assign delegate to the new handle
            handle.delegate = loop.call_later(interval - ((loop.time() - start) % interval), run, handle)

        class PeriodicHandle:  # not extending Handle, needs a lot of arguments that make no sense here
            def __init__(self):
                self.delegate = None

            def cancel(self):
                assert isinstance(self.delegate, asyncio.Handle), 'no delegate handle to cancel'
                self.delegate.cancel()

        periodic = PeriodicHandle()  # can't pass result of loop.call_at here, it needs periodic as an arg to run
        # set the delegate to be the Handle for call_at, causes periodic.cancel() to cancel the call to run
        periodic.delegate = loop.call_at(start + interval, run, periodic)
        # return the 'wrapper'
        return periodic

    def gunzip(self, data):
        # return data.decode('zlib_codec').decode('utf8')
        return zlib.decompress(data, 16 + zlib.MAX_WBITS)
        # return "{}"
        # return gzip.GzipFile(fileobj=StringIO(data)).read()
        # in_ = io.BytesIO()
        # in_.write(data)
        # in_.seek(0)
        # with gzip.GzipFile(fileobj=in_, mode='rb') as fo:
        #    gunzipped_bytes_obj = fo.read()
        # return gunzipped_bytes_obj.decode()

    def inflateRaw(self, data, informat=None):
        if informat == 'base64':
            data = base64.b64decode(data, validate=True)
        try:
            return zlib.decompress(data, -zlib.MAX_WBITS)
        except SyntaxError:
            return zlib.decompress(data)
