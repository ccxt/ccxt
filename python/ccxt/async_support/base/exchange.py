# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '4.4.65'

# -----------------------------------------------------------------------------

import asyncio
import concurrent.futures
import socket
import certifi
import aiohttp
import ssl
import sys
import yarl
import math
from typing import Any, List
from ccxt.base.types import Int, Str, Num, Strings

# -----------------------------------------------------------------------------

from ccxt.async_support.base.throttler import Throttler

# -----------------------------------------------------------------------------

from ccxt.base.errors import BaseError, NetworkError, BadSymbol, BadRequest, BadResponse, ExchangeError, ExchangeNotAvailable, RequestTimeout, NotSupported, NullResponse, InvalidAddress, RateLimitExceeded
from ccxt.base.types import OrderType, OrderSide, OrderRequest, CancellationRequest

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange, ArgumentsRequired

# -----------------------------------------------------------------------------

from ccxt.async_support.base.ws.functions import inflate, inflate64, gunzip
from ccxt.async_support.base.ws.fast_client import FastClient
from ccxt.async_support.base.ws.future import Future
from ccxt.async_support.base.ws.order_book import OrderBook, IndexedOrderBook, CountedOrderBook


# -----------------------------------------------------------------------------

try:
    from aiohttp_socks import ProxyConnector
except ImportError:
    ProxyConnector = None

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):
    synchronous = False
    streaming = {
        'maxPingPongMisses': 2,
        'keepAlive': 30000
    }
    ping = None
    newUpdates = True
    clients = {}
    timeout_on_exit = 250  # needed for: https://github.com/ccxt/ccxt/pull/23470

    def __init__(self, config={}):
        if 'asyncio_loop' in config:
            self.asyncio_loop = config['asyncio_loop']
        self.aiohttp_trust_env = config.get('aiohttp_trust_env', self.aiohttp_trust_env)
        self.verify = config.get('verify', self.verify)
        self.own_session = 'session' not in config
        self.cafile = config.get('cafile', certifi.where())
        self.throttler = None
        super(Exchange, self).__init__(config)
        self.markets_loading = None
        self.reloading_markets = False

    def get_event_loop(self):
        return self.asyncio_loop

    def init_throttler(self, cost=None):
        self.throttler = Throttler(self.tokenBucket, self.asyncio_loop)

    async def throttle(self, cost=None):
        return await self.throttler(cost)

    def get_session(self):
        return self.session

    def __del__(self):
        if self.session is not None or self.socks_proxy_sessions is not None:
            self.logger.warning(self.id + " requires to release all resources with an explicit call to the .close() coroutine. If you are using the exchange instance with async coroutines, add `await exchange.close()` to your code into a place when you're done with the exchange and don't need the exchange instance anymore (at the end of your async coroutine).")

    if sys.version_info >= (3, 5):
        async def __aenter__(self):
            self.open()
            return self

        async def __aexit__(self, exc_type, exc, tb):
            await self.close()

    def open(self):
        if self.asyncio_loop is None:
            if sys.version_info >= (3, 7):
                self.asyncio_loop = asyncio.get_running_loop()
            else:
                self.asyncio_loop = asyncio.get_event_loop()
            self.throttler.loop = self.asyncio_loop

        if self.ssl_context is None:
            # Create our SSL context object with our CA cert file
            self.ssl_context = ssl.create_default_context(cafile=self.cafile) if self.verify else self.verify

        if self.own_session and self.session is None:
            # Pass this SSL context to aiohttp and create a TCPConnector
            self.tcp_connector = aiohttp.TCPConnector(ssl=self.ssl_context, loop=self.asyncio_loop, enable_cleanup_closed=True)
            self.session = aiohttp.ClientSession(loop=self.asyncio_loop, connector=self.tcp_connector, trust_env=self.aiohttp_trust_env)

    async def close(self):
        await self.ws_close()
        if self.session is not None:
            if self.own_session:
                await self.session.close()
            self.session = None
        await self.close_connector()
        await self.close_proxy_sessions()
        await self.sleep(self.timeout_on_exit)

    async def close_connector(self):
        if self.tcp_connector is not None:
            await self.tcp_connector.close()
            self.tcp_connector = None
        if self.aiohttp_socks_connector is not None:
            await self.aiohttp_socks_connector.close()
            self.aiohttp_socks_connector = None

    async def close_proxy_sessions(self):
        if self.socks_proxy_sessions is not None:
            for url in self.socks_proxy_sessions:
                await self.socks_proxy_sessions[url].close()
            self.socks_proxy_sessions = None

    async def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""

        # ##### PROXY & HEADERS #####
        request_headers = self.prepare_request_headers(headers)
        self.last_request_headers = request_headers
        # proxy-url
        proxyUrl = self.check_proxy_url_settings(url, method, headers, body)
        if proxyUrl is not None:
            request_headers.update({'Origin': self.origin})
            url = proxyUrl + url
        # proxy agents
        final_proxy = None  # set default
        proxy_session = None
        httpProxy, httpsProxy, socksProxy = self.check_proxy_settings(url, method, headers, body)
        if httpProxy:
            final_proxy = httpProxy
        elif httpsProxy:
            final_proxy = httpsProxy
        elif socksProxy:
            if ProxyConnector is None:
                raise NotSupported(self.id + ' - to use SOCKS proxy with ccxt, you need "aiohttp_socks" module that can be installed by "pip install aiohttp_socks"')
            # override session
            if (self.socks_proxy_sessions is None):
                self.socks_proxy_sessions = {}
            if (socksProxy not in self.socks_proxy_sessions):
                # Create our SSL context object with our CA cert file
                self.open()  # ensure `asyncio_loop` is set
                self.aiohttp_socks_connector = ProxyConnector.from_url(
                    socksProxy,
                    # extra args copied from self.open()
                    ssl=self.ssl_context,
                    loop=self.asyncio_loop,
                    enable_cleanup_closed=True
                )
                self.socks_proxy_sessions[socksProxy] = aiohttp.ClientSession(loop=self.asyncio_loop, connector=self.aiohttp_socks_connector, trust_env=self.aiohttp_trust_env)
            proxy_session = self.socks_proxy_sessions[socksProxy]
        # add aiohttp_proxy for python as exclusion
        elif self.aiohttp_proxy:
            final_proxy = self.aiohttp_proxy

        proxyAgentSet = final_proxy is not None or socksProxy is not None
        self.checkConflictingProxies(proxyAgentSet, proxyUrl)

        # avoid old proxies mixing
        if (self.aiohttp_proxy is not None) and (proxyUrl is not None or httpProxy is not None or httpsProxy is not None or socksProxy is not None):
            raise NotSupported(self.id + ' you have set multiple proxies, please use one or another')

        # log
        if self.verbose:
            self.log("\nfetch Request:", self.id, method, url, "RequestHeaders:", request_headers, "RequestBody:", body)
        self.logger.debug("%s %s, Request: %s %s", method, url, headers, body)
        # end of proxies & headers

        request_body = body
        encoded_body = body.encode() if body else None
        self.open()
        final_session = proxy_session if proxy_session is not None else self.session
        session_method = getattr(final_session, method.lower())

        http_response = None
        http_status_code = None
        http_status_text = None
        json_response = None
        try:
            async with session_method(yarl.URL(url, encoded=True),
                                      data=encoded_body,
                                      headers=request_headers,
                                      timeout=(self.timeout / 1000),
                                      proxy=final_proxy) as response:
                http_response = await response.text(errors='replace')
                # CIMultiDictProxy
                raw_headers = response.headers
                headers = {}
                for header in raw_headers:
                    if header in headers:
                        headers[header] = headers[header] + ', ' + raw_headers[header]
                    else:
                        headers[header] = raw_headers[header]
                http_status_code = response.status
                http_status_text = response.reason
                http_response = self.on_rest_response(http_status_code, http_status_text, url, method, headers, http_response, request_headers, request_body)
                json_response = self.parse_json(http_response)
                if self.enableLastHttpResponse:
                    self.last_http_response = http_response
                if self.enableLastResponseHeaders:
                    self.last_response_headers = headers
                if self.enableLastJsonResponse:
                    self.last_json_response = json_response
                if self.verbose:
                    self.log("\nfetch Response:", self.id, method, url, http_status_code, "ResponseHeaders:", headers, "ResponseBody:", http_response)
                self.logger.debug("%s %s, Response: %s %s %s", method, url, http_status_code, headers, http_response)

        except socket.gaierror as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeNotAvailable(details) from e

        except (concurrent.futures.TimeoutError, asyncio.TimeoutError) as e:
            details = ' '.join([self.id, method, url])
            raise RequestTimeout(details) from e

        except aiohttp.ClientConnectionError as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeNotAvailable(details) from e

        except aiohttp.ClientError as e:  # base exception class
            details = ' '.join([self.id, method, url])
            raise ExchangeError(details) from e

        self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
        self.handle_http_status_code(http_status_code, http_status_text, url, method, http_response)
        if json_response is not None:
            return json_response
        if self.is_text_response(headers):
            return http_response
        if http_response == '' or http_response is None:
            return http_response
        return response.content

    async def load_markets_helper(self, reload=False, params={}):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        currencies = None
        if self.has['fetchCurrencies'] is True:
            currencies = await self.fetch_currencies()
        markets = await self.fetch_markets(params)
        return self.set_markets(markets, currencies)

    async def load_markets(self, reload=False, params={}):
        if (reload and not self.reloading_markets) or not self.markets_loading:
            self.reloading_markets = True
            coroutine = self.load_markets_helper(reload, params)
            # coroutines can only be awaited once so we wrap it in a task
            self.markets_loading = asyncio.ensure_future(coroutine)
        try:
            result = await self.markets_loading
        except Exception as e:
            self.reloading_markets = False
            self.markets_loading = None
            raise e
        self.reloading_markets = False
        return result

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

    async def fetchOHLCVC(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)

    async def fetch_full_tickers(self, symbols=None, params={}):
        return await self.fetch_tickers(symbols, params)

    async def sleep(self, milliseconds):
        return await asyncio.sleep(milliseconds / 1000)

    async def spawn_async(self, method, *args):
        try:
            await method(*args)
        except Exception:
            # todo: handle spawned errors
            pass

    def spawn(self, method, *args):
        def callback(asyncio_future):
            exception = asyncio_future.exception()
            if exception is None:
                future.resolve(asyncio_future.result())
            else:
                future.reject(exception)
        future = Future()
        task = self.asyncio_loop.create_task(method(*args))
        task.add_done_callback(callback)
        return future

    #  -----------------------------------------------------------------------
    #  WS/PRO code

    @staticmethod
    def inflate(data):
        return inflate(data)

    @staticmethod
    def inflate64(data):
        return inflate64(data)

    @staticmethod
    def gunzip(data):
        return gunzip(data)

    def order_book(self, snapshot={}, depth=None):
        return OrderBook(snapshot, depth)

    def indexed_order_book(self, snapshot={}, depth=None):
        return IndexedOrderBook(snapshot, depth)

    def counted_order_book(self, snapshot={}, depth=None):
        return CountedOrderBook(snapshot, depth)

    def client(self, url):
        self.clients = self.clients or {}
        if url not in self.clients:
            on_message = self.handle_message
            on_error = self.on_error
            on_close = self.on_close
            on_connected = self.on_connected
            # decide client type here: aiohttp ws / websockets / signalr / socketio
            ws_options = self.safe_value(self.options, 'ws', {})
            options = self.extend(self.streaming, {
                'log': getattr(self, 'log'),
                'ping': getattr(self, 'ping', None),
                'verbose': self.verbose,
                'throttle': Throttler(self.tokenBucket, self.asyncio_loop),
                'asyncio_loop': self.asyncio_loop,
            }, ws_options)
            self.clients[url] = FastClient(url, on_message, on_error, on_close, on_connected, options)
            self.clients[url].proxy = self.get_ws_proxy()
        return self.clients[url]

    def get_ws_proxy(self):
        httpProxy, httpsProxy, socksProxy = self.check_ws_proxy_settings()
        if httpProxy:
            return httpProxy
        elif httpsProxy:
            return httpsProxy
        elif socksProxy:
            return socksProxy
        return None

    def delay(self, timeout, method, *args):
        return self.asyncio_loop.call_later(timeout / 1000, self.spawn, method, *args)

    def handle_message(self, client, message):
        always = True
        if always:
            raise NotSupported(self.id + '.handle_message() not implemented yet')
        return {}

    def watch_multiple(self, url, message_hashes, message=None, subscribe_hashes=None, subscription=None):
        # base exchange self.open starts the aiohttp Session in an async context
        self.open()
        backoff_delay = 0
        client = self.client(url)

        future = Future.race([client.future(message_hash) for message_hash in message_hashes])

        missing_subscriptions = []
        if subscribe_hashes is not None:
            for subscribe_hash in subscribe_hashes:
                if subscribe_hash not in client.subscriptions:
                    missing_subscriptions.append(subscribe_hash)
                    client.subscriptions[subscribe_hash] = subscription or True

        connected = client.connected if client.connected.done() \
            else asyncio.ensure_future(client.connect(self.session, backoff_delay))

        def after(fut):
            # todo: decouple signing from subscriptions
            options = self.safe_value(self.options, 'ws')
            cost = self.safe_value(options, 'cost', 1)
            if message:
                async def send_message():
                    if self.enableRateLimit:
                        await client.throttle(cost)
                    try:
                        await client.send(message)
                    except ConnectionError as e:
                        client.on_error(e)
                    except Exception as e:
                        client.on_error(e)
                asyncio.ensure_future(send_message())

        if missing_subscriptions:
            connected.add_done_callback(after)

        return future

    def watch(self, url, message_hash, message=None, subscribe_hash=None, subscription=None):
        # base exchange self.open starts the aiohttp Session in an async context
        self.open()
        backoff_delay = 0
        client = self.client(url)
        if subscribe_hash is None and message_hash in client.futures:
            return client.futures[message_hash]
        future = client.future(message_hash)

        subscribed = client.subscriptions.get(subscribe_hash)

        if not subscribed:
            client.subscriptions[subscribe_hash] = subscription or True

        connected = client.connected if client.connected.done() \
            else asyncio.ensure_future(client.connect(self.session, backoff_delay))

        def after(fut):
            # todo: decouple signing from subscriptions
            options = self.safe_value(self.options, 'ws')
            cost = self.safe_value(options, 'cost', 1)
            if message:
                async def send_message():
                    if self.enableRateLimit:
                        await client.throttle(cost)
                    try:
                        await client.send(message)
                    except ConnectionError as e:
                        client.on_error(e)
                    except Exception as e:
                        client.on_error(e)
                asyncio.ensure_future(send_message())

        if not subscribed:
            connected.add_done_callback(after)

        return future

    def on_connected(self, client, message=None):
        # for user hooks
        # print('Connected to', client.url)
        pass

    def on_error(self, client, error):
        if client.url in self.clients and self.clients[client.url].error:
            del self.clients[client.url]

    def on_close(self, client, error):
        if client.error:
            # connection closed by the user or due to an error
            pass
        else:
            # server disconnected a working connection
            if client.url in self.clients:
                del self.clients[client.url]

    async def ws_close(self):
        if self.clients:
            await asyncio.wait([asyncio.create_task(client.close()) for client in self.clients.values()], return_when=asyncio.ALL_COMPLETED)
            for url in self.clients.copy():
                del self.clients[url]

    async def load_order_book(self, client, messageHash, symbol, limit=None, params={}):
        if symbol not in self.orderbooks:
            client.reject(ExchangeError(self.id + ' loadOrderBook() orderbook is not initiated'), messageHash)
            return
        try:
            maxRetries = self.handle_option('watchOrderBook', 'maxRetries', 3)
            tries = 0
            stored = self.orderbooks[symbol]
            while tries < maxRetries:
                cache = stored.cache
                order_book = await self.fetch_order_book(symbol, limit, params)
                index = self.get_cache_index(order_book, cache)
                if index >= 0:
                    stored.reset(order_book)
                    self.handle_deltas(stored, cache[index:])
                    cache.clear()
                    client.resolve(stored, messageHash)
                    return
                tries += 1
            client.reject(ExchangeError(self.id + ' nonce is behind cache after ' + str(maxRetries) + ' tries.'), messageHash)
            del self.clients[client.url]
        except BaseError as e:
            client.reject(e, messageHash)
            await self.load_order_book(client, messageHash, symbol, limit, params)

    def format_scientific_notation_ftx(self, n):
        if n == 0:
            return '0e-00'
        return format(n, 'g')

    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########        ########################        ########################
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########                        ########                        ########
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ########        ########        ########                        ########
    # ################        ########################        ################
    # ################        ########################        ################
    # ################        ########################        ################
    # ################        ########################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########        ########        ################        ################
    # ########################################################################
    # ########################################################################
    # ########################################################################
    # ########################################################################

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    async def fetch_accounts(self, params={}):
        raise NotSupported(self.id + ' fetchAccounts() is not supported yet')

    async def fetch_trades(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchTrades() is not supported yet')

    async def fetch_trades_ws(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchTradesWs() is not supported yet')

    async def watch_liquidations(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        if self.has['watchLiquidationsForSymbols']:
            return await self.watch_liquidations_for_symbols([symbol], since, limit, params)
        raise NotSupported(self.id + ' watchLiquidations() is not supported yet')

    async def watch_liquidations_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchLiquidationsForSymbols() is not supported yet')

    async def watch_my_liquidations(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        if self.has['watchMyLiquidationsForSymbols']:
            return self.watch_my_liquidations_for_symbols([symbol], since, limit, params)
        raise NotSupported(self.id + ' watchMyLiquidations() is not supported yet')

    async def watch_my_liquidations_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchMyLiquidationsForSymbols() is not supported yet')

    async def watch_trades(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchTrades() is not supported yet')

    async def un_watch_trades(self, symbol: str, params={}):
        raise NotSupported(self.id + ' unWatchTrades() is not supported yet')

    async def watch_trades_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchTradesForSymbols() is not supported yet')

    async def un_watch_trades_for_symbols(self, symbols: List[str], params={}):
        raise NotSupported(self.id + ' unWatchTradesForSymbols() is not supported yet')

    async def watch_my_trades_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchMyTradesForSymbols() is not supported yet')

    async def watch_orders_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrdersForSymbols() is not supported yet')

    async def watch_ohlcv_for_symbols(self, symbolsAndTimeframes: List[List[str]], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOHLCVForSymbols() is not supported yet')

    async def un_watch_ohlcv_for_symbols(self, symbolsAndTimeframes: List[List[str]], params={}):
        raise NotSupported(self.id + ' unWatchOHLCVForSymbols() is not supported yet')

    async def watch_order_book_for_symbols(self, symbols: List[str], limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrderBookForSymbols() is not supported yet')

    async def un_watch_order_book_for_symbols(self, symbols: List[str], params={}):
        raise NotSupported(self.id + ' unWatchOrderBookForSymbols() is not supported yet')

    async def fetch_deposit_addresses(self, codes: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchDepositAddresses() is not supported yet')

    async def fetch_order_book(self, symbol: str, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderBook() is not supported yet')

    async def fetch_order_book_ws(self, symbol: str, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderBookWs() is not supported yet')

    async def fetch_margin_mode(self, symbol: str, params={}):
        if self.has['fetchMarginModes']:
            marginModes = await self.fetch_margin_modes([symbol], params)
            return self.safe_dict(marginModes, symbol)
        else:
            raise NotSupported(self.id + ' fetchMarginMode() is not supported yet')

    async def fetch_margin_modes(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchMarginModes() is not supported yet')

    async def fetch_rest_order_book_safe(self, symbol, limit=None, params={}):
        fetchSnapshotMaxRetries = self.handle_option('watchOrderBook', 'maxRetries', 3)
        for i in range(0, fetchSnapshotMaxRetries):
            try:
                orderBook = await self.fetch_order_book(symbol, limit, params)
                return orderBook
            except Exception as e:
                if (i + 1) == fetchSnapshotMaxRetries:
                    raise e
        return None

    async def watch_order_book(self, symbol: str, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrderBook() is not supported yet')

    async def un_watch_order_book(self, symbol: str, params={}):
        raise NotSupported(self.id + ' unWatchOrderBook() is not supported yet')

    async def fetch_time(self, params={}):
        raise NotSupported(self.id + ' fetchTime() is not supported yet')

    async def fetch_trading_limits(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchTradingLimits() is not supported yet')

    async def fetch_cross_borrow_rates(self, params={}):
        raise NotSupported(self.id + ' fetchCrossBorrowRates() is not supported yet')

    async def fetch_isolated_borrow_rates(self, params={}):
        raise NotSupported(self.id + ' fetchIsolatedBorrowRates() is not supported yet')

    async def fetch_leverage_tiers(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchLeverageTiers() is not supported yet')

    async def fetch_funding_rates(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchFundingRates() is not supported yet')

    async def fetch_funding_intervals(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchFundingIntervals() is not supported yet')

    async def watch_funding_rate(self, symbol: str, params={}):
        raise NotSupported(self.id + ' watchFundingRate() is not supported yet')

    async def watch_funding_rates(self, symbols: List[str], params={}):
        raise NotSupported(self.id + ' watchFundingRates() is not supported yet')

    async def watch_funding_rates_for_symbols(self, symbols: List[str], params={}):
        return await self.watch_funding_rates(symbols, params)

    async def transfer(self, code: str, amount: float, fromAccount: str, toAccount: str, params={}):
        raise NotSupported(self.id + ' transfer() is not supported yet')

    async def withdraw(self, code: str, amount: float, address: str, tag=None, params={}):
        raise NotSupported(self.id + ' withdraw() is not supported yet')

    async def create_deposit_address(self, code: str, params={}):
        raise NotSupported(self.id + ' createDepositAddress() is not supported yet')

    async def set_leverage(self, leverage: Int, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' setLeverage() is not supported yet')

    async def fetch_leverage(self, symbol: str, params={}):
        if self.has['fetchLeverages']:
            leverages = await self.fetch_leverages([symbol], params)
            return self.safe_dict(leverages, symbol)
        else:
            raise NotSupported(self.id + ' fetchLeverage() is not supported yet')

    async def fetch_leverages(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchLeverages() is not supported yet')

    async def set_position_mode(self, hedged: bool, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' setPositionMode() is not supported yet')

    async def add_margin(self, symbol: str, amount: float, params={}):
        raise NotSupported(self.id + ' addMargin() is not supported yet')

    async def reduce_margin(self, symbol: str, amount: float, params={}):
        raise NotSupported(self.id + ' reduceMargin() is not supported yet')

    async def set_margin(self, symbol: str, amount: float, params={}):
        raise NotSupported(self.id + ' setMargin() is not supported yet')

    async def fetch_long_short_ratio(self, symbol: str, timeframe: Str = None, params={}):
        raise NotSupported(self.id + ' fetchLongShortRatio() is not supported yet')

    async def fetch_long_short_ratio_history(self, symbol: Str = None, timeframe: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchLongShortRatioHistory() is not supported yet')

    async def fetch_margin_adjustment_history(self, symbol: Str = None, type: Str = None, since: Num = None, limit: Num = None, params={}):
        """
        fetches the history of margin added or reduced from contract isolated positions
        :param str [symbol]: unified market symbol
        :param str [type]: "add" or "reduce"
        :param int [since]: timestamp in ms of the earliest change to fetch
        :param int [limit]: the maximum amount of changes to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns dict[]: a list of `margin structures <https://docs.ccxt.com/#/?id=margin-loan-structure>`
        """
        raise NotSupported(self.id + ' fetchMarginAdjustmentHistory() is not supported yet')

    async def set_margin_mode(self, marginMode: str, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' setMarginMode() is not supported yet')

    async def fetch_deposit_addresses_by_network(self, code: str, params={}):
        raise NotSupported(self.id + ' fetchDepositAddressesByNetwork() is not supported yet')

    async def fetch_open_interest_history(self, symbol: str, timeframe='1h', since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOpenInterestHistory() is not supported yet')

    async def fetch_open_interest(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchOpenInterest() is not supported yet')

    async def fetch_open_interests(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchOpenInterests() is not supported yet')

    async def sign_in(self, params={}):
        raise NotSupported(self.id + ' signIn() is not supported yet')

    async def fetch_payment_methods(self, params={}):
        raise NotSupported(self.id + ' fetchPaymentMethods() is not supported yet')

    async def fetch_borrow_rate(self, code: str, amount: float, params={}):
        raise NotSupported(self.id + ' fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead')

    async def repay_cross_margin(self, code: str, amount: float, params={}):
        raise NotSupported(self.id + ' repayCrossMargin is not support yet')

    async def repay_isolated_margin(self, symbol: str, code: str, amount: float, params={}):
        raise NotSupported(self.id + ' repayIsolatedMargin is not support yet')

    async def borrow_cross_margin(self, code: str, amount: float, params={}):
        raise NotSupported(self.id + ' borrowCrossMargin is not support yet')

    async def borrow_isolated_margin(self, symbol: str, code: str, amount: float, params={}):
        raise NotSupported(self.id + ' borrowIsolatedMargin is not support yet')

    async def borrow_margin(self, code: str, amount: float, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead')

    async def repay_margin(self, code: str, amount: float, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead')

    async def fetch_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        message = ''
        if self.has['fetchTrades']:
            message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file'
        raise NotSupported(self.id + ' fetchOHLCV() is not supported yet' + message)

    async def fetch_ohlcv_ws(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        message = ''
        if self.has['fetchTradesWs']:
            message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file'
        raise NotSupported(self.id + ' fetchOHLCVWs() is not supported yet. Try using fetchOHLCV instead.' + message)

    async def watch_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOHLCV() is not supported yet')

    async def fetch_web_endpoint(self, method, endpointMethod, returnAsJson, startRegex=None, endRegex=None):
        errorMessage = ''
        options = self.safe_value(self.options, method, {})
        muteOnFailure = self.safe_bool(options, 'webApiMuteFailure', True)
        try:
            # if it was not explicitly disabled, then don't fetch
            if self.safe_bool(options, 'webApiEnable', True) is not True:
                return None
            maxRetries = self.safe_value(options, 'webApiRetries', 10)
            response = None
            retry = 0
            shouldBreak = False
            while(retry < maxRetries):
                try:
                    response = await getattr(self, endpointMethod)({})
                    shouldBreak = True
                    break
                except Exception as e:
                    retry = retry + 1
                    if retry == maxRetries:
                        raise e
                if shouldBreak:
                    break  # self is needed because of GO
            content = response
            if startRegex is not None:
                splitted_by_start = content.split(startRegex)
                content = splitted_by_start[1]  # we need second part after start
            if endRegex is not None:
                splitted_by_end = content.split(endRegex)
                content = splitted_by_end[0]  # we need first part after start
            if returnAsJson and (isinstance(content, str)):
                jsoned = self.parse_json(content.strip())  # content should be trimmed before json parsing
                if jsoned:
                    return jsoned  # if parsing was not successfull, exception should be thrown
                else:
                    raise BadResponse('could not parse the response into json')
            else:
                return content
        except Exception as e:
            errorMessage = self.id + ' ' + method + '() failed to fetch correct data from website. Probably webpage markup has been changed, breaking the page custom parser.'
        if muteOnFailure:
            return None
        else:
            raise BadResponse(errorMessage)

    async def fetch_l2_order_book(self, symbol: str, limit: Int = None, params={}):
        orderbook = await self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
        })

    async def load_trading_limits(self, symbols: Strings = None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not ('limitsLoaded' in self.options):
                response = await self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    async def fetch2(self, path, api: Any = 'public', method='GET', params={}, headers: Any = None, body: Any = None, config={}):
        if self.enableRateLimit:
            cost = self.calculate_rate_limiter_cost(api, method, path, params, config)
            await self.throttle(cost)
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        self.last_request_headers = request['headers']
        self.last_request_body = request['body']
        self.last_request_url = request['url']
        retries = None
        retries, params = self.handle_option_and_params(params, path, 'maxRetriesOnFailure', 0)
        retryDelay = None
        retryDelay, params = self.handle_option_and_params(params, path, 'maxRetriesOnFailureDelay', 0)
        for i in range(0, retries + 1):
            try:
                return await self.fetch(request['url'], request['method'], request['headers'], request['body'])
            except Exception as e:
                if isinstance(e, NetworkError):
                    if i < retries:
                        if self.verbose:
                            self.log('Request failed with the error: ' + str(e) + ', retrying ' + (i + str(1)) + ' of ' + str(retries) + '...')
                        if (retryDelay is not None) and (retryDelay != 0):
                            await self.sleep(retryDelay)
                        # continue  #check self
                if i >= retries:
                    raise e
        return None  # self line is never reached, but exists for c# value return requirement

    async def request(self, path, api: Any = 'public', method='GET', params={}, headers: Any = None, body: Any = None, config={}):
        return await self.fetch2(path, api, method, params, headers, body, config)

    async def load_accounts(self, reload=False, params={}):
        if reload:
            self.accounts = await self.fetch_accounts(params)
        else:
            if self.accounts:
                return self.accounts
            else:
                self.accounts = await self.fetch_accounts(params)
        self.accountsById = self.index_by(self.accounts, 'id')
        return self.accounts

    async def edit_limit_buy_order(self, id: str, symbol: str, amount: float, price: Num = None, params={}):
        return await self.edit_limit_order(id, symbol, 'buy', amount, price, params)

    async def edit_limit_sell_order(self, id: str, symbol: str, amount: float, price: Num = None, params={}):
        return await self.edit_limit_order(id, symbol, 'sell', amount, price, params)

    async def edit_limit_order(self, id: str, symbol: str, side: OrderSide, amount: float, price: Num = None, params={}):
        return await self.edit_order(id, symbol, 'limit', side, amount, price, params)

    async def edit_order(self, id: str, symbol: str, type: OrderType, side: OrderSide, amount: Num = None, price: Num = None, params={}):
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, type, side, amount, price, params)

    async def edit_order_ws(self, id: str, symbol: str, type: OrderType, side: OrderSide, amount: Num = None, price: Num = None, params={}):
        await self.cancel_order_ws(id, symbol)
        return await self.create_order_ws(symbol, type, side, amount, price, params)

    async def fetch_position(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchPosition() is not supported yet')

    async def fetch_position_ws(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchPositionWs() is not supported yet')

    async def watch_position(self, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' watchPosition() is not supported yet')

    async def watch_positions(self, symbols: Strings = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchPositions() is not supported yet')

    async def watch_position_for_symbols(self, symbols: Strings = None, since: Int = None, limit: Int = None, params={}):
        return await self.watch_positions(symbols, since, limit, params)

    async def fetch_positions_for_symbol(self, symbol: str, params={}):
        """
        fetches all open positions for specific symbol, unlike fetchPositions(which is designed to work with multiple symbols) so self method might be preffered for one-market position, because of less rate-limit consumption and speed
        :param str symbol: unified market symbol
        :param dict params: extra parameters specific to the endpoint
        :returns dict[]: a list of `position structure <https://docs.ccxt.com/#/?id=position-structure>` with maximum 3 items - possible one position for "one-way" mode, and possible two positions(long & short) for "two-way"(a.k.a. hedge) mode
        """
        raise NotSupported(self.id + ' fetchPositionsForSymbol() is not supported yet')

    async def fetch_positions_for_symbol_ws(self, symbol: str, params={}):
        """
        fetches all open positions for specific symbol, unlike fetchPositions(which is designed to work with multiple symbols) so self method might be preffered for one-market position, because of less rate-limit consumption and speed
        :param str symbol: unified market symbol
        :param dict params: extra parameters specific to the endpoint
        :returns dict[]: a list of `position structure <https://docs.ccxt.com/#/?id=position-structure>` with maximum 3 items - possible one position for "one-way" mode, and possible two positions(long & short) for "two-way"(a.k.a. hedge) mode
        """
        raise NotSupported(self.id + ' fetchPositionsForSymbol() is not supported yet')

    async def fetch_positions(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchPositions() is not supported yet')

    async def fetch_positions_ws(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchPositions() is not supported yet')

    async def fetch_positions_risk(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchPositionsRisk() is not supported yet')

    async def fetch_bids_asks(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchBidsAsks() is not supported yet')

    async def fetch_borrow_interest(self, code: Str = None, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchBorrowInterest() is not supported yet')

    async def fetch_ledger(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchLedger() is not supported yet')

    async def fetch_ledger_entry(self, id: str, code: Str = None, params={}):
        raise NotSupported(self.id + ' fetchLedgerEntry() is not supported yet')

    async def fetch_balance(self, params={}):
        raise NotSupported(self.id + ' fetchBalance() is not supported yet')

    async def fetch_balance_ws(self, params={}):
        raise NotSupported(self.id + ' fetchBalanceWs() is not supported yet')

    async def watch_balance(self, params={}):
        raise NotSupported(self.id + ' watchBalance() is not supported yet')

    async def fetch_partial_balance(self, part, params={}):
        balance = await self.fetch_balance(params)
        return balance[part]

    async def fetch_free_balance(self, params={}):
        return await self.fetch_partial_balance('free', params)

    async def fetch_used_balance(self, params={}):
        return await self.fetch_partial_balance('used', params)

    async def fetch_total_balance(self, params={}):
        return await self.fetch_partial_balance('total', params)

    async def fetch_status(self, params={}):
        raise NotSupported(self.id + ' fetchStatus() is not supported yet')

    async def fetch_transaction_fee(self, code: str, params={}):
        if not self.has['fetchTransactionFees']:
            raise NotSupported(self.id + ' fetchTransactionFee() is not supported yet')
        return await self.fetch_transaction_fees([code], params)

    async def fetch_transaction_fees(self, codes: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchTransactionFees() is not supported yet')

    async def fetch_deposit_withdraw_fees(self, codes: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchDepositWithdrawFees() is not supported yet')

    async def fetch_deposit_withdraw_fee(self, code: str, params={}):
        if not self.has['fetchDepositWithdrawFees']:
            raise NotSupported(self.id + ' fetchDepositWithdrawFee() is not supported yet')
        fees = await self.fetch_deposit_withdraw_fees([code], params)
        return self.safe_value(fees, code)

    async def fetch_cross_borrow_rate(self, code: str, params={}):
        await self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchCrossBorrowRate() is not supported yet')
        borrowRates = await self.fetch_cross_borrow_rates(params)
        rate = self.safe_value(borrowRates, code)
        if rate is None:
            raise ExchangeError(self.id + ' fetchCrossBorrowRate() could not find the borrow rate for currency code ' + code)
        return rate

    async def fetch_isolated_borrow_rate(self, symbol: str, params={}):
        await self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchIsolatedBorrowRate() is not supported yet')
        borrowRates = await self.fetch_isolated_borrow_rates(params)
        rate = self.safe_dict(borrowRates, symbol)
        if rate is None:
            raise ExchangeError(self.id + ' fetchIsolatedBorrowRate() could not find the borrow rate for market symbol ' + symbol)
        return rate

    async def fetch_ticker(self, symbol: str, params={}):
        if self.has['fetchTickers']:
            await self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            tickers = await self.fetch_tickers([symbol], params)
            ticker = self.safe_dict(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchTickers() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTicker() is not supported yet')

    async def fetch_mark_price(self, symbol: str, params={}):
        if self.has['fetchMarkPrices']:
            await self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            tickers = await self.fetch_mark_prices([symbol], params)
            ticker = self.safe_dict(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchMarkPrices() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchMarkPrices() is not supported yet')

    async def fetch_ticker_ws(self, symbol: str, params={}):
        if self.has['fetchTickersWs']:
            await self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            tickers = await self.fetch_tickers_ws([symbol], params)
            ticker = self.safe_dict(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchTickerWs() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTickerWs() is not supported yet')

    async def watch_ticker(self, symbol: str, params={}):
        raise NotSupported(self.id + ' watchTicker() is not supported yet')

    async def fetch_tickers(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    async def fetch_mark_prices(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchMarkPrices() is not supported yet')

    async def fetch_tickers_ws(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    async def fetch_order_books(self, symbols: Strings = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderBooks() is not supported yet')

    async def watch_bids_asks(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' watchBidsAsks() is not supported yet')

    async def watch_tickers(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' watchTickers() is not supported yet')

    async def un_watch_tickers(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' unWatchTickers() is not supported yet')

    async def fetch_order(self, id: str, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' fetchOrder() is not supported yet')

    async def fetch_order_ws(self, id: str, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' fetchOrderWs() is not supported yet')

    async def fetch_order_status(self, id: str, symbol: Str = None, params={}):
        # TODO: TypeScript: change method signature by replacing
        # Promise<string> with Promise<Order['status']>.
        order = await self.fetch_order(id, symbol, params)
        return order['status']

    async def fetch_unified_order(self, order, params={}):
        return await self.fetch_order(self.safe_string(order, 'id'), self.safe_string(order, 'symbol'), params)

    async def create_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        raise NotSupported(self.id + ' createOrder() is not supported yet')

    async def create_convert_trade(self, id: str, fromCode: str, toCode: str, amount: Num = None, params={}):
        raise NotSupported(self.id + ' createConvertTrade() is not supported yet')

    async def fetch_convert_trade(self, id: str, code: Str = None, params={}):
        raise NotSupported(self.id + ' fetchConvertTrade() is not supported yet')

    async def fetch_convert_trade_history(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchConvertTradeHistory() is not supported yet')

    async def fetch_position_mode(self, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' fetchPositionMode() is not supported yet')

    async def create_trailing_amount_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, trailingAmount=None, trailingTriggerPrice=None, params={}):
        """
        create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency, or number of contracts
        :param float [price]: the price for the order to be filled at, in units of the quote currency, ignored in market orders
        :param float trailingAmount: the quote amount to trail away from the current market price
        :param float [trailingTriggerPrice]: the price to activate a trailing order, default uses the price argument
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if trailingAmount is None:
            raise ArgumentsRequired(self.id + ' createTrailingAmountOrder() requires a trailingAmount argument')
        params['trailingAmount'] = trailingAmount
        if trailingTriggerPrice is not None:
            params['trailingTriggerPrice'] = trailingTriggerPrice
        if self.has['createTrailingAmountOrder']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTrailingAmountOrder() is not supported yet')

    async def create_trailing_amount_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, trailingAmount=None, trailingTriggerPrice=None, params={}):
        """
        create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency, or number of contracts
        :param float [price]: the price for the order to be filled at, in units of the quote currency, ignored in market orders
        :param float trailingAmount: the quote amount to trail away from the current market price
        :param float [trailingTriggerPrice]: the price to activate a trailing order, default uses the price argument
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if trailingAmount is None:
            raise ArgumentsRequired(self.id + ' createTrailingAmountOrderWs() requires a trailingAmount argument')
        params['trailingAmount'] = trailingAmount
        if trailingTriggerPrice is not None:
            params['trailingTriggerPrice'] = trailingTriggerPrice
        if self.has['createTrailingAmountOrderWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTrailingAmountOrderWs() is not supported yet')

    async def create_trailing_percent_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, trailingPercent=None, trailingTriggerPrice=None, params={}):
        """
        create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency, or number of contracts
        :param float [price]: the price for the order to be filled at, in units of the quote currency, ignored in market orders
        :param float trailingPercent: the percent to trail away from the current market price
        :param float [trailingTriggerPrice]: the price to activate a trailing order, default uses the price argument
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if trailingPercent is None:
            raise ArgumentsRequired(self.id + ' createTrailingPercentOrder() requires a trailingPercent argument')
        params['trailingPercent'] = trailingPercent
        if trailingTriggerPrice is not None:
            params['trailingTriggerPrice'] = trailingTriggerPrice
        if self.has['createTrailingPercentOrder']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTrailingPercentOrder() is not supported yet')

    async def create_trailing_percent_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, trailingPercent=None, trailingTriggerPrice=None, params={}):
        """
        create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency, or number of contracts
        :param float [price]: the price for the order to be filled at, in units of the quote currency, ignored in market orders
        :param float trailingPercent: the percent to trail away from the current market price
        :param float [trailingTriggerPrice]: the price to activate a trailing order, default uses the price argument
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if trailingPercent is None:
            raise ArgumentsRequired(self.id + ' createTrailingPercentOrderWs() requires a trailingPercent argument')
        params['trailingPercent'] = trailingPercent
        if trailingTriggerPrice is not None:
            params['trailingTriggerPrice'] = trailingTriggerPrice
        if self.has['createTrailingPercentOrderWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTrailingPercentOrderWs() is not supported yet')

    async def create_market_order_with_cost(self, symbol: str, side: OrderSide, cost: float, params={}):
        """
        create a market order by providing the symbol, side and cost
        :param str symbol: unified symbol of the market to create an order in
        :param str side: 'buy' or 'sell'
        :param float cost: how much you want to trade in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if self.has['createMarketOrderWithCost'] or (self.has['createMarketBuyOrderWithCost'] and self.has['createMarketSellOrderWithCost']):
            return await self.create_order(symbol, 'market', side, cost, 1, params)
        raise NotSupported(self.id + ' createMarketOrderWithCost() is not supported yet')

    async def create_market_buy_order_with_cost(self, symbol: str, cost: float, params={}):
        """
        create a market buy order by providing the symbol and cost
        :param str symbol: unified symbol of the market to create an order in
        :param float cost: how much you want to trade in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if self.options['createMarketBuyOrderRequiresPrice'] or self.has['createMarketBuyOrderWithCost']:
            return await self.create_order(symbol, 'market', 'buy', cost, 1, params)
        raise NotSupported(self.id + ' createMarketBuyOrderWithCost() is not supported yet')

    async def create_market_sell_order_with_cost(self, symbol: str, cost: float, params={}):
        """
        create a market sell order by providing the symbol and cost
        :param str symbol: unified symbol of the market to create an order in
        :param float cost: how much you want to trade in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if self.options['createMarketSellOrderRequiresPrice'] or self.has['createMarketSellOrderWithCost']:
            return await self.create_order(symbol, 'market', 'sell', cost, 1, params)
        raise NotSupported(self.id + ' createMarketSellOrderWithCost() is not supported yet')

    async def create_market_order_with_cost_ws(self, symbol: str, side: OrderSide, cost: float, params={}):
        """
        create a market order by providing the symbol, side and cost
        :param str symbol: unified symbol of the market to create an order in
        :param str side: 'buy' or 'sell'
        :param float cost: how much you want to trade in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if self.has['createMarketOrderWithCostWs'] or (self.has['createMarketBuyOrderWithCostWs'] and self.has['createMarketSellOrderWithCostWs']):
            return await self.create_order_ws(symbol, 'market', side, cost, 1, params)
        raise NotSupported(self.id + ' createMarketOrderWithCostWs() is not supported yet')

    async def create_trigger_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, triggerPrice: Num = None, params={}):
        """
        create a trigger stop order(type 1)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float triggerPrice: the price to trigger the stop order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if triggerPrice is None:
            raise ArgumentsRequired(self.id + ' createTriggerOrder() requires a triggerPrice argument')
        params['triggerPrice'] = triggerPrice
        if self.has['createTriggerOrder']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTriggerOrder() is not supported yet')

    async def create_trigger_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, triggerPrice: Num = None, params={}):
        """
        create a trigger stop order(type 1)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float triggerPrice: the price to trigger the stop order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if triggerPrice is None:
            raise ArgumentsRequired(self.id + ' createTriggerOrderWs() requires a triggerPrice argument')
        params['triggerPrice'] = triggerPrice
        if self.has['createTriggerOrderWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTriggerOrderWs() is not supported yet')

    async def create_stop_loss_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, stopLossPrice: Num = None, params={}):
        """
        create a trigger stop loss order(type 2)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float stopLossPrice: the price to trigger the stop loss order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if stopLossPrice is None:
            raise ArgumentsRequired(self.id + ' createStopLossOrder() requires a stopLossPrice argument')
        params['stopLossPrice'] = stopLossPrice
        if self.has['createStopLossOrder']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createStopLossOrder() is not supported yet')

    async def create_stop_loss_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, stopLossPrice: Num = None, params={}):
        """
        create a trigger stop loss order(type 2)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float stopLossPrice: the price to trigger the stop loss order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if stopLossPrice is None:
            raise ArgumentsRequired(self.id + ' createStopLossOrderWs() requires a stopLossPrice argument')
        params['stopLossPrice'] = stopLossPrice
        if self.has['createStopLossOrderWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createStopLossOrderWs() is not supported yet')

    async def create_take_profit_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, takeProfitPrice: Num = None, params={}):
        """
        create a trigger take profit order(type 2)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float takeProfitPrice: the price to trigger the take profit order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if takeProfitPrice is None:
            raise ArgumentsRequired(self.id + ' createTakeProfitOrder() requires a takeProfitPrice argument')
        params['takeProfitPrice'] = takeProfitPrice
        if self.has['createTakeProfitOrder']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTakeProfitOrder() is not supported yet')

    async def create_take_profit_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, takeProfitPrice: Num = None, params={}):
        """
        create a trigger take profit order(type 2)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float takeProfitPrice: the price to trigger the take profit order, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        if takeProfitPrice is None:
            raise ArgumentsRequired(self.id + ' createTakeProfitOrderWs() requires a takeProfitPrice argument')
        params['takeProfitPrice'] = takeProfitPrice
        if self.has['createTakeProfitOrderWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createTakeProfitOrderWs() is not supported yet')

    async def create_order_with_take_profit_and_stop_loss(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, takeProfit: Num = None, stopLoss: Num = None, params={}):
        """
        create an order with a stop loss or take profit attached(type 3)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float [takeProfit]: the take profit price, in units of the quote currency
        :param float [stopLoss]: the stop loss price, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :param str [params.takeProfitType]: *not available on all exchanges* 'limit' or 'market'
        :param str [params.stopLossType]: *not available on all exchanges* 'limit' or 'market'
        :param str [params.takeProfitPriceType]: *not available on all exchanges* 'last', 'mark' or 'index'
        :param str [params.stopLossPriceType]: *not available on all exchanges* 'last', 'mark' or 'index'
        :param float [params.takeProfitLimitPrice]: *not available on all exchanges* limit price for a limit take profit order
        :param float [params.stopLossLimitPrice]: *not available on all exchanges* stop loss for a limit stop loss order
        :param float [params.takeProfitAmount]: *not available on all exchanges* the amount for a take profit
        :param float [params.stopLossAmount]: *not available on all exchanges* the amount for a stop loss
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        params = self.set_take_profit_and_stop_loss_params(symbol, type, side, amount, price, takeProfit, stopLoss, params)
        if self.has['createOrderWithTakeProfitAndStopLoss']:
            return await self.create_order(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createOrderWithTakeProfitAndStopLoss() is not supported yet')

    async def create_order_with_take_profit_and_stop_loss_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, takeProfit: Num = None, stopLoss: Num = None, params={}):
        """
        create an order with a stop loss or take profit attached(type 3)
        :param str symbol: unified symbol of the market to create an order in
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how much you want to trade in units of the base currency or the number of contracts
        :param float [price]: the price to fulfill the order, in units of the quote currency, ignored in market orders
        :param float [takeProfit]: the take profit price, in units of the quote currency
        :param float [stopLoss]: the stop loss price, in units of the quote currency
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :param str [params.takeProfitType]: *not available on all exchanges* 'limit' or 'market'
        :param str [params.stopLossType]: *not available on all exchanges* 'limit' or 'market'
        :param str [params.takeProfitPriceType]: *not available on all exchanges* 'last', 'mark' or 'index'
        :param str [params.stopLossPriceType]: *not available on all exchanges* 'last', 'mark' or 'index'
        :param float [params.takeProfitLimitPrice]: *not available on all exchanges* limit price for a limit take profit order
        :param float [params.stopLossLimitPrice]: *not available on all exchanges* stop loss for a limit stop loss order
        :param float [params.takeProfitAmount]: *not available on all exchanges* the amount for a take profit
        :param float [params.stopLossAmount]: *not available on all exchanges* the amount for a stop loss
        :returns dict: an `order structure <https://docs.ccxt.com/#/?id=order-structure>`
        """
        params = self.set_take_profit_and_stop_loss_params(symbol, type, side, amount, price, takeProfit, stopLoss, params)
        if self.has['createOrderWithTakeProfitAndStopLossWs']:
            return await self.create_order_ws(symbol, type, side, amount, price, params)
        raise NotSupported(self.id + ' createOrderWithTakeProfitAndStopLossWs() is not supported yet')

    async def create_orders(self, orders: List[OrderRequest], params={}):
        raise NotSupported(self.id + ' createOrders() is not supported yet')

    async def edit_orders(self, orders: List[OrderRequest], params={}):
        raise NotSupported(self.id + ' editOrders() is not supported yet')

    async def create_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        raise NotSupported(self.id + ' createOrderWs() is not supported yet')

    async def cancel_order(self, id: str, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' cancelOrder() is not supported yet')

    async def cancel_order_ws(self, id: str, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' cancelOrderWs() is not supported yet')

    async def cancel_orders_ws(self, ids: List[str], symbol: Str = None, params={}):
        raise NotSupported(self.id + ' cancelOrdersWs() is not supported yet')

    async def cancel_all_orders(self, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' cancelAllOrders() is not supported yet')

    async def cancel_all_orders_after(self, timeout: Int, params={}):
        raise NotSupported(self.id + ' cancelAllOrdersAfter() is not supported yet')

    async def cancel_orders_for_symbols(self, orders: List[CancellationRequest], params={}):
        raise NotSupported(self.id + ' cancelOrdersForSymbols() is not supported yet')

    async def cancel_all_orders_ws(self, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' cancelAllOrdersWs() is not supported yet')

    async def cancel_unified_order(self, order, params={}):
        return self.cancel_order(self.safe_string(order, 'id'), self.safe_string(order, 'symbol'), params)

    async def fetch_orders(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if self.has['fetchOpenOrders'] and self.has['fetchClosedOrders']:
            raise NotSupported(self.id + ' fetchOrders() is not supported yet, consider using fetchOpenOrders() and fetchClosedOrders() instead')
        raise NotSupported(self.id + ' fetchOrders() is not supported yet')

    async def fetch_orders_ws(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrdersWs() is not supported yet')

    async def fetch_order_trades(self, id: str, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderTrades() is not supported yet')

    async def watch_orders(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrders() is not supported yet')

    async def fetch_open_orders(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if self.has['fetchOrders']:
            orders = await self.fetch_orders(symbol, since, limit, params)
            return self.filter_by(orders, 'status', 'open')
        raise NotSupported(self.id + ' fetchOpenOrders() is not supported yet')

    async def fetch_open_orders_ws(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if self.has['fetchOrdersWs']:
            orders = await self.fetch_orders_ws(symbol, since, limit, params)
            return self.filter_by(orders, 'status', 'open')
        raise NotSupported(self.id + ' fetchOpenOrdersWs() is not supported yet')

    async def fetch_closed_orders(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if self.has['fetchOrders']:
            orders = await self.fetch_orders(symbol, since, limit, params)
            return self.filter_by(orders, 'status', 'closed')
        raise NotSupported(self.id + ' fetchClosedOrders() is not supported yet')

    async def fetch_canceled_and_closed_orders(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchCanceledAndClosedOrders() is not supported yet')

    async def fetch_closed_orders_ws(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        if self.has['fetchOrdersWs']:
            orders = await self.fetch_orders_ws(symbol, since, limit, params)
            return self.filter_by(orders, 'status', 'closed')
        raise NotSupported(self.id + ' fetchClosedOrdersWs() is not supported yet')

    async def fetch_my_trades(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyTrades() is not supported yet')

    async def fetch_my_liquidations(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyLiquidations() is not supported yet')

    async def fetch_liquidations(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchLiquidations() is not supported yet')

    async def fetch_my_trades_ws(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyTradesWs() is not supported yet')

    async def watch_my_trades(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchMyTrades() is not supported yet')

    async def fetch_greeks(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchGreeks() is not supported yet')

    async def fetch_option_chain(self, code: str, params={}):
        raise NotSupported(self.id + ' fetchOptionChain() is not supported yet')

    async def fetch_option(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchOption() is not supported yet')

    async def fetch_convert_quote(self, fromCode: str, toCode: str, amount: Num = None, params={}):
        raise NotSupported(self.id + ' fetchConvertQuote() is not supported yet')

    async def fetch_deposits_withdrawals(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetch history of deposits and withdrawals
        :param str [code]: unified currency code for the currency of the deposit/withdrawals, default is None
        :param int [since]: timestamp in ms of the earliest deposit/withdrawal, default is None
        :param int [limit]: max number of deposit/withdrawals to return, default is None
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: a list of `transaction structures <https://docs.ccxt.com/#/?id=transaction-structure>`
        """
        raise NotSupported(self.id + ' fetchDepositsWithdrawals() is not supported yet')

    async def fetch_deposits(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchDeposits() is not supported yet')

    async def fetch_withdrawals(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchWithdrawals() is not supported yet')

    async def fetch_deposits_ws(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchDepositsWs() is not supported yet')

    async def fetch_withdrawals_ws(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchWithdrawalsWs() is not supported yet')

    async def fetch_funding_rate_history(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchFundingRateHistory() is not supported yet')

    async def fetch_funding_history(self, symbol: Str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchFundingHistory() is not supported yet')

    async def close_position(self, symbol: str, side: OrderSide = None, params={}):
        raise NotSupported(self.id + ' closePosition() is not supported yet')

    async def close_all_positions(self, params={}):
        raise NotSupported(self.id + ' closeAllPositions() is not supported yet')

    async def fetch_l3_order_book(self, symbol: str, limit: Int = None, params={}):
        raise BadRequest(self.id + ' fetchL3OrderBook() is not supported yet')

    async def fetch_deposit_address(self, code: str, params={}):
        if self.has['fetchDepositAddresses']:
            depositAddresses = await self.fetch_deposit_addresses([code], params)
            depositAddress = self.safe_value(depositAddresses, code)
            if depositAddress is None:
                raise InvalidAddress(self.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return depositAddress
        elif self.has['fetchDepositAddressesByNetwork']:
            network = self.safe_string(params, 'network')
            params = self.omit(params, 'network')
            addressStructures = await self.fetch_deposit_addresses_by_network(code, params)
            if network is not None:
                return self.safe_dict(addressStructures, network)
            else:
                keys = list(addressStructures.keys())
                key = self.safe_string(keys, 0)
                return self.safe_dict(addressStructures, key)
        else:
            raise NotSupported(self.id + ' fetchDepositAddress() is not supported yet')

    async def create_limit_order(self, symbol: str, side: OrderSide, amount: float, price: float, params={}):
        return await self.create_order(symbol, 'limit', side, amount, price, params)

    async def create_limit_order_ws(self, symbol: str, side: OrderSide, amount: float, price: float, params={}):
        return await self.create_order_ws(symbol, 'limit', side, amount, price, params)

    async def create_market_order(self, symbol: str, side: OrderSide, amount: float, price: Num = None, params={}):
        return await self.create_order(symbol, 'market', side, amount, price, params)

    async def create_market_order_ws(self, symbol: str, side: OrderSide, amount: float, price: Num = None, params={}):
        return await self.create_order_ws(symbol, 'market', side, amount, price, params)

    async def create_limit_buy_order(self, symbol: str, amount: float, price: float, params={}):
        return await self.create_order(symbol, 'limit', 'buy', amount, price, params)

    async def create_limit_buy_order_ws(self, symbol: str, amount: float, price: float, params={}):
        return await self.create_order_ws(symbol, 'limit', 'buy', amount, price, params)

    async def create_limit_sell_order(self, symbol: str, amount: float, price: float, params={}):
        return await self.create_order(symbol, 'limit', 'sell', amount, price, params)

    async def create_limit_sell_order_ws(self, symbol: str, amount: float, price: float, params={}):
        return await self.create_order_ws(symbol, 'limit', 'sell', amount, price, params)

    async def create_market_buy_order(self, symbol: str, amount: float, params={}):
        return await self.create_order(symbol, 'market', 'buy', amount, None, params)

    async def create_market_buy_order_ws(self, symbol: str, amount: float, params={}):
        return await self.create_order_ws(symbol, 'market', 'buy', amount, None, params)

    async def create_market_sell_order(self, symbol: str, amount: float, params={}):
        return await self.create_order(symbol, 'market', 'sell', amount, None, params)

    async def create_market_sell_order_ws(self, symbol: str, amount: float, params={}):
        return await self.create_order_ws(symbol, 'market', 'sell', amount, None, params)

    async def load_time_difference(self, params={}):
        serverTime = await self.fetch_time(params)
        after = self.milliseconds()
        self.options['timeDifference'] = after - serverTime
        return self.options['timeDifference']

    async def fetch_market_leverage_tiers(self, symbol: str, params={}):
        if self.has['fetchLeverageTiers']:
            market = self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchMarketLeverageTiers() supports contract markets only')
            tiers = await self.fetch_leverage_tiers([symbol])
            return self.safe_value(tiers, symbol)
        else:
            raise NotSupported(self.id + ' fetchMarketLeverageTiers() is not supported yet')

    async def create_post_only_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        if not self.has['createPostOnlyOrder']:
            raise NotSupported(self.id + ' createPostOnlyOrder() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_post_only_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        if not self.has['createPostOnlyOrderWs']:
            raise NotSupported(self.id + ' createPostOnlyOrderWs() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return await self.create_order_ws(symbol, type, side, amount, price, query)

    async def create_reduce_only_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        if not self.has['createReduceOnlyOrder']:
            raise NotSupported(self.id + ' createReduceOnlyOrder() is not supported yet')
        query = self.extend(params, {'reduceOnly': True})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_reduce_only_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        if not self.has['createReduceOnlyOrderWs']:
            raise NotSupported(self.id + ' createReduceOnlyOrderWs() is not supported yet')
        query = self.extend(params, {'reduceOnly': True})
        return await self.create_order_ws(symbol, type, side, amount, price, query)

    async def create_stop_order(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, triggerPrice: Num = None, params={}):
        if not self.has['createStopOrder']:
            raise NotSupported(self.id + ' createStopOrder() is not supported yet')
        if triggerPrice is None:
            raise ArgumentsRequired(self.id + ' create_stop_order() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_stop_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, triggerPrice: Num = None, params={}):
        if not self.has['createStopOrderWs']:
            raise NotSupported(self.id + ' createStopOrderWs() is not supported yet')
        if triggerPrice is None:
            raise ArgumentsRequired(self.id + ' createStopOrderWs() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order_ws(symbol, type, side, amount, price, query)

    async def create_stop_limit_order(self, symbol: str, side: OrderSide, amount: float, price: float, triggerPrice: float, params={}):
        if not self.has['createStopLimitOrder']:
            raise NotSupported(self.id + ' createStopLimitOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order(symbol, 'limit', side, amount, price, query)

    async def create_stop_limit_order_ws(self, symbol: str, side: OrderSide, amount: float, price: float, triggerPrice: float, params={}):
        if not self.has['createStopLimitOrderWs']:
            raise NotSupported(self.id + ' createStopLimitOrderWs() is not supported yet')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order_ws(symbol, 'limit', side, amount, price, query)

    async def create_stop_market_order(self, symbol: str, side: OrderSide, amount: float, triggerPrice: float, params={}):
        if not self.has['createStopMarketOrder']:
            raise NotSupported(self.id + ' createStopMarketOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order(symbol, 'market', side, amount, None, query)

    async def create_stop_market_order_ws(self, symbol: str, side: OrderSide, amount: float, triggerPrice: float, params={}):
        if not self.has['createStopMarketOrderWs']:
            raise NotSupported(self.id + ' createStopMarketOrderWs() is not supported yet')
        query = self.extend(params, {'stopPrice': triggerPrice})
        return await self.create_order_ws(symbol, 'market', side, amount, None, query)

    async def fetch_last_prices(self, symbols: Strings = None, params={}):
        raise NotSupported(self.id + ' fetchLastPrices() is not supported yet')

    async def fetch_trading_fees(self, params={}):
        raise NotSupported(self.id + ' fetchTradingFees() is not supported yet')

    async def fetch_trading_fees_ws(self, params={}):
        raise NotSupported(self.id + ' fetchTradingFeesWs() is not supported yet')

    async def fetch_trading_fee(self, symbol: str, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported(self.id + ' fetchTradingFee() is not supported yet')
        fees = await self.fetch_trading_fees(params)
        return self.safe_dict(fees, symbol)

    async def fetch_convert_currencies(self, params={}):
        raise NotSupported(self.id + ' fetchConvertCurrencies() is not supported yet')

    async def fetch_funding_rate(self, symbol: str, params={}):
        if self.has['fetchFundingRates']:
            await self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchFundingRate() supports contract markets only')
            rates = await self.fetch_funding_rates([symbol], params)
            rate = self.safe_value(rates, symbol)
            if rate is None:
                raise NullResponse(self.id + ' fetchFundingRate() returned no data for ' + symbol)
            else:
                return rate
        else:
            raise NotSupported(self.id + ' fetchFundingRate() is not supported yet')

    async def fetch_funding_interval(self, symbol: str, params={}):
        if self.has['fetchFundingIntervals']:
            await self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchFundingInterval() supports contract markets only')
            rates = await self.fetch_funding_intervals([symbol], params)
            rate = self.safe_value(rates, symbol)
            if rate is None:
                raise NullResponse(self.id + ' fetchFundingInterval() returned no data for ' + symbol)
            else:
                return rate
        else:
            raise NotSupported(self.id + ' fetchFundingInterval() is not supported yet')

    async def fetch_mark_ohlcv(self, symbol, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        """
        fetches historical mark price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int [since]: timestamp in ms of the earliest candle to fetch
        :param int [limit]: the maximum amount of candles to fetch
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns float[][]: A list of candles ordered, open, high, low, close, None
        """
        if self.has['fetchMarkOHLCV']:
            request: dict = {
                'price': 'mark',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchMarkOHLCV() is not supported yet')

    async def fetch_index_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        """
        fetches historical index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int [since]: timestamp in ms of the earliest candle to fetch
        :param int [limit]: the maximum amount of candles to fetch
        :param dict [params]: extra parameters specific to the exchange API endpoint
 @returns {} A list of candles ordered, open, high, low, close, None
        """
        if self.has['fetchIndexOHLCV']:
            request: dict = {
                'price': 'index',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchIndexOHLCV() is not supported yet')

    async def fetch_premium_index_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        """
        fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int [since]: timestamp in ms of the earliest candle to fetch
        :param int [limit]: the maximum amount of candles to fetch
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns float[][]: A list of candles ordered, open, high, low, close, None
        """
        if self.has['fetchPremiumIndexOHLCV']:
            request: dict = {
                'price': 'premiumIndex',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchPremiumIndexOHLCV() is not supported yet')

    async def fetch_transactions(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        """
 @deprecated
        *DEPRECATED* use fetchDepositsWithdrawals instead
        :param str code: unified currency code for the currency of the deposit/withdrawals, default is None
        :param int [since]: timestamp in ms of the earliest deposit/withdrawal, default is None
        :param int [limit]: max number of deposit/withdrawals to return, default is None
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: a list of `transaction structures <https://docs.ccxt.com/#/?id=transaction-structure>`
        """
        if self.has['fetchDepositsWithdrawals']:
            return await self.fetch_deposits_withdrawals(code, since, limit, params)
        else:
            raise NotSupported(self.id + ' fetchTransactions() is not supported yet')

    async def fetch_paginated_call_dynamic(self, method: str, symbol: Str = None, since: Int = None, limit: Int = None, params={}, maxEntriesPerRequest: Int = None, removeRepeated=True):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        paginationDirection = None
        paginationDirection, params = self.handle_option_and_params(params, method, 'paginationDirection', 'backward')
        paginationTimestamp = None
        removeRepeatedOption = removeRepeated
        removeRepeatedOption, params = self.handle_option_and_params(params, method, 'removeRepeated', removeRepeated)
        calls = 0
        result = []
        errors = 0
        until = self.safe_integer_2(params, 'untill', 'till')  # do not omit it from params here
        maxEntriesPerRequest, params = self.handle_max_entries_per_request_and_params(method, maxEntriesPerRequest, params)
        if (paginationDirection == 'forward'):
            if since is None:
                raise ArgumentsRequired(self.id + ' pagination requires a since argument when paginationDirection set to forward')
            paginationTimestamp = since
        while((calls < maxCalls)):
            calls += 1
            try:
                if paginationDirection == 'backward':
                    # do it backwards, starting from the last
                    # UNTIL filtering is required in order to work
                    if paginationTimestamp is not None:
                        params['until'] = paginationTimestamp - 1
                    response = await getattr(self, method)(symbol, None, maxEntriesPerRequest, params)
                    responseLength = len(response)
                    if self.verbose:
                        backwardMessage = 'Dynamic pagination call ' + self.number_to_string(calls) + ' method ' + method + ' response length ' + self.number_to_string(responseLength)
                        if paginationTimestamp is not None:
                            backwardMessage += ' timestamp ' + self.number_to_string(paginationTimestamp)
                        self.log(backwardMessage)
                    if responseLength == 0:
                        break
                    errors = 0
                    result = self.array_concat(result, response)
                    firstElement = self.safe_value(response, 0)
                    paginationTimestamp = self.safe_integer_2(firstElement, 'timestamp', 0)
                    if (since is not None) and (paginationTimestamp <= since):
                        break
                else:
                    # do it forwards, starting from the since
                    response = await getattr(self, method)(symbol, paginationTimestamp, maxEntriesPerRequest, params)
                    responseLength = len(response)
                    if self.verbose:
                        forwardMessage = 'Dynamic pagination call ' + self.number_to_string(calls) + ' method ' + method + ' response length ' + self.number_to_string(responseLength)
                        if paginationTimestamp is not None:
                            forwardMessage += ' timestamp ' + self.number_to_string(paginationTimestamp)
                        self.log(forwardMessage)
                    if responseLength == 0:
                        break
                    errors = 0
                    result = self.array_concat(result, response)
                    last = self.safe_value(response, responseLength - 1)
                    paginationTimestamp = self.safe_integer(last, 'timestamp') + 1
                    if (until is not None) and (paginationTimestamp >= until):
                        break
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
        uniqueResults = result
        if removeRepeatedOption:
            uniqueResults = self.remove_repeated_elements_from_array(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(uniqueResults, since, limit, key)

    async def safe_deterministic_call(self, method: str, symbol: Str = None, since: Int = None, limit: Int = None, timeframe: Str = None, params={}):
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        errors = 0
        while(errors <= maxRetries):
            try:
                if timeframe and method != 'fetchFundingRateHistory':
                    return await getattr(self, method)(symbol, timeframe, since, limit, params)
                else:
                    return await getattr(self, method)(symbol, since, limit, params)
            except Exception as e:
                if isinstance(e, RateLimitExceeded):
                    raise e  # if we are rate limited, we should not retry and fail fast
                errors += 1
                if errors > maxRetries:
                    raise e
        return []

    async def fetch_paginated_call_deterministic(self, method: str, symbol: Str = None, since: Int = None, limit: Int = None, timeframe: Str = None, params={}, maxEntriesPerRequest=None):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxEntriesPerRequest, params = self.handle_max_entries_per_request_and_params(method, maxEntriesPerRequest, params)
        current = self.milliseconds()
        tasks = []
        time = self.parse_timeframe(timeframe) * 1000
        step = time * maxEntriesPerRequest
        currentSince = current - (maxCalls * step) - 1
        if since is not None:
            currentSince = max(currentSince, since)
        else:
            currentSince = max(currentSince, 1241440531000)  # avoid timestamps older than 2009
        until = self.safe_integer_2(params, 'until', 'till')  # do not omit it here
        if until is not None:
            requiredCalls = int(math.ceil((until - since)) / step)
            if requiredCalls > maxCalls:
                raise BadRequest(self.id + ' the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the since-until gap. Current paginationCalls limit is ' + str(maxCalls) + ' required calls is ' + str(requiredCalls))
        for i in range(0, maxCalls):
            if (until is not None) and (currentSince >= until):
                break
            if currentSince >= current:
                break
            tasks.append(self.safe_deterministic_call(method, symbol, currentSince, maxEntriesPerRequest, timeframe, params))
            currentSince = self.sum(currentSince, step) - 1
        results = await asyncio.gather(*tasks)
        result = []
        for i in range(0, len(results)):
            result = self.array_concat(result, results[i])
        uniqueResults = self.remove_repeated_elements_from_array(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(uniqueResults, since, limit, key)

    async def fetch_paginated_call_cursor(self, method: str, symbol: Str = None, since=None, limit=None, params={}, cursorReceived=None, cursorSent=None, cursorIncrement=None, maxEntriesPerRequest=None):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        maxEntriesPerRequest, params = self.handle_max_entries_per_request_and_params(method, maxEntriesPerRequest, params)
        cursorValue = None
        i = 0
        errors = 0
        result = []
        timeframe = self.safe_string(params, 'timeframe')
        params = self.omit(params, 'timeframe')  # reading the timeframe from the method arguments to avoid changing the signature
        while(i < maxCalls):
            try:
                if cursorValue is not None:
                    if cursorIncrement is not None:
                        cursorValue = self.parse_to_int(cursorValue) + cursorIncrement
                    params[cursorSent] = cursorValue
                response = None
                if method == 'fetchAccounts':
                    response = await getattr(self, method)(params)
                elif method == 'getLeverageTiersPaginated' or method == 'fetchPositions':
                    response = await getattr(self, method)(symbol, params)
                elif method == 'fetchOpenInterestHistory':
                    response = await getattr(self, method)(symbol, timeframe, since, maxEntriesPerRequest, params)
                else:
                    response = await getattr(self, method)(symbol, since, maxEntriesPerRequest, params)
                errors = 0
                responseLength = len(response)
                if self.verbose:
                    cursorString = '' if (cursorValue is None) else cursorValue
                    iteration = (i + 1)
                    cursorMessage = 'Cursor pagination call ' + str(iteration) + ' method ' + method + ' response length ' + str(responseLength) + ' cursor ' + cursorString
                    self.log(cursorMessage)
                if responseLength == 0:
                    break
                result = self.array_concat(result, response)
                last = self.safe_dict(response, responseLength - 1)
                # cursorValue = self.safe_value(last['info'], cursorReceived)
                cursorValue = None  # search for the cursor
                for j in range(0, responseLength):
                    index = responseLength - j - 1
                    entry = self.safe_dict(response, index)
                    info = self.safe_dict(entry, 'info')
                    cursor = self.safe_value(info, cursorReceived)
                    if cursor is not None:
                        cursorValue = cursor
                        break
                if cursorValue is None:
                    break
                lastTimestamp = self.safe_integer(last, 'timestamp')
                if lastTimestamp is not None and lastTimestamp < since:
                    break
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
            i += 1
        sorted = self.sort_cursor_paginated_result(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(sorted, since, limit, key)

    async def fetch_paginated_call_incremental(self, method: str, symbol: Str = None, since=None, limit=None, params={}, pageKey=None, maxEntriesPerRequest=None):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        maxEntriesPerRequest, params = self.handle_max_entries_per_request_and_params(method, maxEntriesPerRequest, params)
        i = 0
        errors = 0
        result = []
        while(i < maxCalls):
            try:
                params[pageKey] = i + 1
                response = await getattr(self, method)(symbol, since, maxEntriesPerRequest, params)
                errors = 0
                responseLength = len(response)
                if self.verbose:
                    iteration = (i + str(1))
                    incrementalMessage = 'Incremental pagination call ' + iteration + ' method ' + method + ' response length ' + str(responseLength)
                    self.log(incrementalMessage)
                if responseLength == 0:
                    break
                result = self.array_concat(result, response)
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
            i += 1
        sorted = self.sort_cursor_paginated_result(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(sorted, since, limit, key)

    async def fetch_position_history(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        """
        fetches the history of margin added or reduced from contract isolated positions
        :param str [symbol]: unified market symbol
        :param int [since]: timestamp in ms of the position
        :param int [limit]: the maximum amount of candles to fetch, default=1000
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns dict[]: a list of `position structures <https://docs.ccxt.com/#/?id=position-structure>`
        """
        if self.has['fetchPositionsHistory']:
            positions = await self.fetch_positions_history([symbol], since, limit, params)
            return positions
        else:
            raise NotSupported(self.id + ' fetchPositionHistory() is not supported yet')

    async def fetch_positions_history(self, symbols: Strings = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches the history of margin added or reduced from contract isolated positions
        :param str [symbol]: unified market symbol
        :param int [since]: timestamp in ms of the position
        :param int [limit]: the maximum amount of candles to fetch, default=1000
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns dict[]: a list of `position structures <https://docs.ccxt.com/#/?id=position-structure>`
        """
        raise NotSupported(self.id + ' fetchPositionsHistory() is not supported yet')

    async def fetch_transfer(self, id: str, code: Str = None, params={}):
        """
        fetches a transfer
        :param str id: transfer id
        :param [str] code: unified currency code
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns dict: a `transfer structure <https://docs.ccxt.com/#/?id=transfer-structure>`
        """
        raise NotSupported(self.id + ' fetchTransfer() is not supported yet')

    async def fetch_transfers(self, code: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches a transfer
        :param str id: transfer id
        :param int [since]: timestamp in ms of the earliest transfer to fetch
        :param int [limit]: the maximum amount of transfers to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns dict: a `transfer structure <https://docs.ccxt.com/#/?id=transfer-structure>`
        """
        raise NotSupported(self.id + ' fetchTransfers() is not supported yet')
