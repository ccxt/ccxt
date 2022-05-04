# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.81.40'

# -----------------------------------------------------------------------------

import asyncio
import concurrent.futures
import socket
import certifi
import aiohttp
import ssl
import sys
import yarl
from typing import Coroutine

# -----------------------------------------------------------------------------

from ccxt.async_support.base.throttler import Throttler

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import NotSupported
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import BadRequest

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange, ArgumentsRequired

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):
    synchronous = False

    def __init__(self, config={}):
        if 'asyncio_loop' in config:
            self.asyncio_loop = config['asyncio_loop']
        self.aiohttp_trust_env = config.get('aiohttp_trust_env', self.aiohttp_trust_env)
        self.verify = config.get('verify', self.verify)
        self.own_session = 'session' not in config
        self.cafile = config.get('cafile', certifi.where())
        super(Exchange, self).__init__(config)
        self.throttle = None
        self.init_rest_rate_limiter()
        self.markets_loading = None
        self.reloading_markets = False

    def init_rest_rate_limiter(self):
        self.throttle = Throttler(self.tokenBucket, self.asyncio_loop)

    def __del__(self):
        if self.session is not None:
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
            self.throttle.loop = self.asyncio_loop
        if self.own_session and self.session is None:
            # Create our SSL context object with our CA cert file
            context = ssl.create_default_context(cafile=self.cafile) if self.verify else self.verify
            # Pass this SSL context to aiohttp and create a TCPConnector
            connector = aiohttp.TCPConnector(ssl=context, loop=self.asyncio_loop, enable_cleanup_closed=True)
            self.session = aiohttp.ClientSession(loop=self.asyncio_loop, connector=connector, trust_env=self.aiohttp_trust_env)

    async def close(self):
        if self.session is not None:
            if self.own_session:
                await self.session.close()
            self.session = None

    async def fetch2(self, path, api='public', method='GET', params={}, headers=None, body=None, config={}, context={}):
        """A better wrapper over request for deferred signing"""
        if self.enableRateLimit:
            cost = self.calculate_rate_limiter_cost(api, method, path, params, config, context)
            # insert cost into here...
            await self.throttle(cost)
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        return await self.fetch(request['url'], request['method'], request['headers'], request['body'])

    async def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        request_headers = self.prepare_request_headers(headers)
        url = self.proxy + url

        if self.verbose:
            self.log("\nfetch Request:", self.id, method, url, "RequestHeaders:", request_headers, "RequestBody:", body)
        self.logger.debug("%s %s, Request: %s %s", method, url, headers, body)

        request_body = body
        encoded_body = body.encode() if body else None
        self.open()
        session_method = getattr(self.session, method.lower())

        http_response = None
        http_status_code = None
        http_status_text = None
        json_response = None
        try:
            async with session_method(yarl.URL(url, encoded=True),
                                      data=encoded_body,
                                      headers=request_headers,
                                      timeout=(self.timeout / 1000),
                                      proxy=self.aiohttp_proxy) as response:
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
        return response.content

    async def fetch_permissions(self, params={}):
        raise NotSupported(self.id + ' fetch_permissions() is not supported yet')

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

    async def fetch_status(self, params={}):
        if self.has['fetchTime']:
            updated = await self.fetch_time(params)
            self.status['updated'] = updated
        return self.status

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
        raise NotSupported(self.id + ' performOrderBookRequest() not supported yet')

    async def fetch_order_book(self, symbol, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderbook = await self.perform_order_book_request(market, limit, params)
        return self.parse_order_book(orderbook, market, limit, params)

    async def fetch_ohlcvc(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported('fetch_ohlcv() not implemented yet')
        await self.load_markets()
        trades = await self.fetch_trades(symbol, since, limit, params)
        return self.build_ohlcvc(trades, timeframe, since, limit)

    async def fetchOHLCVC(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        ohlcvs = await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)
        return [ohlcv[0:-1] for ohlcv in ohlcvs]

    async def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcv(symbol, timeframe, since, limit, params)

    async def fetch_full_tickers(self, symbols=None, params={}):
        return await self.fetch_tickers(symbols, params)

    async def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            raise ExchangeError('updateOrder() requires enableRateLimit = true')
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, *args)

    async def fetch_balance(self, params={}):
        raise NotSupported(self.id + ' fetch_balance() not supported yet')

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported(self.id + 'create_order() not supported yet')

    def create_limit_order(self, symbol, side, amount, price, params={}) -> Coroutine:
        return self.create_order(symbol, 'limit', side, amount, price, params)

    def create_market_order(self, symbol, side, amount, price=None, params={}) -> Coroutine:
        return self.create_order(symbol, 'market', side, amount, price, params)

    def create_limit_buy_order(self, symbol, amount, price, params={}) -> Coroutine:
        return self.create_order(symbol, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order(self, symbol, amount, price, params={}) -> Coroutine:
        return self.create_order(symbol, 'limit', 'sell', amount, price, params)

    def create_market_buy_order(self, symbol, amount, params={}) -> Coroutine:
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol, amount, params={}) -> Coroutine:
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    async def cancel_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + 'cancel_order() not supported yet')

    async def fetch_trading_fees(self, params={}):
        raise NotSupported(self.id + ' fetch_trading_fees() not supported yet')

    async def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported(self.id + ' fetch_trading_fee() not supported yet')
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

    async def fetch_ticker(self, symbol, params={}):
        if self.has['fetchTickers']:
            tickers = await self.fetch_tickers([symbol], params)
            ticker = self.safe_value(tickers, symbol)
            if ticker is None:
                raise BadSymbol(self.id + ' fetchTickers could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetch_ticker() not supported yet')

    async def fetch_transactions(self, code=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_transactions() is not supported yet')

    async def fetch_deposits(self, code=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_deposits() is not supported yet')

    async def fetch_withdrawals(self, code=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetch_withdrawals() is not supported yet')

    async def fetch_deposit_address(self, code, params={}):
        if self.has['fetchDepositAddresses']:
            deposit_addresses = await self.fetch_deposit_addresses([code], params)
            deposit_address = self.safe_value(deposit_addresses, code)
            if deposit_address is None:
                raise NotSupported(self.id + ' fetch_deposit_address could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return deposit_address
        else:
            raise NotSupported(self.id + ' fetch_deposit_address() not supported yet')

    async def sleep(self, milliseconds):
        return await asyncio.sleep(milliseconds / 1000)

    async def load_time_difference(self, params={}):
        server_time = await self.fetch_time(params)
        after = self.milliseconds()
        self.options['timeDifference'] = after - server_time
        return self.options['timeDifference']

    async def fetch_market_leverage_tiers(self, symbol, params={}):
        if self.has['fetchLeverageTiers']:
            market = await self.market(symbol)
            if (not market['contract']):
                raise BadRequest(self.id + ' fetch_leverage_tiers() supports contract markets only')
            tiers = await self.fetch_leverage_tiers([symbol])
            return self.safe_value(tiers, symbol)
        else:
            raise NotSupported(self.id + ' fetch_market_leverage_tiers() is not supported yet')

    async def create_post_only_order(self, symbol, type, side, amount, price, params={}):
        if not self.has['createPostOnlyOrder']:
            raise NotSupported(self.id + ' create_post_only_order() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_stop_order(self, symbol, type, side, amount, price=None, stopPrice=None, params={}):
        if not self.has['createStopOrder']:
            raise NotSupported(self.id + ' create_stop_order() is not supported yet')
        if stopPrice is None:
            raise ArgumentsRequired(self.id + ' create_stop_order() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_stop_limit_order(self, symbol, side, amount, price, stopPrice, params={}):
        if not self.has['createStopLimitOrder']:
            raise NotSupported(self.id + ' create_stop_limit_order() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, 'limit', side, amount, price, query)

    async def create_stop_market_order(self, symbol, side, amount, stopPrice, params={}):
        if not self.has['createStopMarketOrder']:
            raise NotSupported(self.id + ' create_stop_market_order() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, 'market', side, amount, None, query)
