# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.10.1181'

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

# -----------------------------------------------------------------------------

from ccxt.async.base.throttle import throttle

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import RequestTimeout

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange

# -----------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

# -----------------------------------------------------------------------------


class Exchange(BaseExchange):

    def __init__(self, config={}):
        if 'asyncio_loop' in config:
            self.asyncio_loop = config['asyncio_loop']
        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        if 'session' not in config:
            # Create out SSL context object with our CA cert file
            context = ssl.create_default_context(cafile=certifi.where())
            # Pass this SSL context to aiohttp and create a TCPConnector
            connector = aiohttp.TCPConnector(ssl_context=context, loop=self.asyncio_loop)
            self.session = aiohttp.ClientSession(loop=self.asyncio_loop, connector=connector)
        super(Exchange, self).__init__(config)
        self.init_rest_rate_limiter()

    def init_rest_rate_limiter(self):
        self.throttle = throttle(self.extend({
            'loop': self.asyncio_loop,
        }, self.tokenBucket))

    def __del__(self):
        asyncio.ensure_future(self.session.close(), loop=self.asyncio_loop)

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
            self.raise_error(ExchangeError, url, method, e, None)

        except concurrent.futures._base.TimeoutError as e:
            self.raise_error(RequestTimeout, method, url, e, None)

        except aiohttp.client_exceptions.ClientError as e:
            self.raise_error(ExchangeError, url, method, e, None)

        self.handle_errors(http_status_code, text, url, method, self.last_response_headers, text)
        return self.handle_rest_response(text, url, method, headers, body)

    async def load(self, public=True, private=False, reload=False):
        if public:
            await self.load_public(reload=reload)

        if private:
            self.check_required_credentials()
            await self.load_private(reload=reload)

    async def load_private(self, fees=True, reload=False):
        if fees:
            await self.load_fees(reload=reload)

        #  load other private info

    async def load_public(self, markets=True, currencies=True, reload=False):
        if markets:
            await self.load_markets(reload=reload)

        if currencies:
            await self.load_currencies(reload=reload)

        if markets and currencies:
            self.populate_fees()

    async def load_markets(self, reload=False):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        markets = await self.fetch_markets()
        return self.set_markets(markets)

    async def load_currencies(self, reload=False):
        if not reload:
            if self.currencies:
                if not self.currencies_by_id:
                    return self.set_currencies(self.currencies)
                return self.currencies

        if self.has['fetchCurrencies']:
            currencies = await self.fetch_currencies()
            return self.set_currencies(currencies)
        else:
            # generate from markets
            return self.set_currencies()

    async def fetch_markets(self):
        return self.markets

    async def load_fees(self, reload=False):
        if not reload:
            if self.fees['trading']['fee_loaded'] and self.fees['funding']['fee_loaded']:  # already loaded
                return self.fees

        if not self.has['fetchFees']:
            return self.fees

        fetched_fees = await self.fetch_fees()
        if fetched_fees['funding']:
            fetched_fees['funding']['fee_loaded'] = True
        if fetched_fees['trading']:
            fetched_fees['trading']['fee_loaded'] = True
        return self.set_fees(fetched_fees)

    async def fetch_fees(self):
        trading = {}
        funding = {}
        try:
            trading = await self.fetch_trading_fees()
        except AttributeError:
            pass

        try:
            funding = await self.fetch_funding_fees()
        except AttributeError:
            pass

        return {'trading': trading,
                'funding': funding}

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

    async def fetch_full_tickers(self, symbols=None, params={}):
        tickers = await self.fetch_tickers(symbols, params)
        return tickers

    async def edit_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            self.raise_error(ExchangeError, details='updateOrder() requires enableRateLimit = true')
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, *args)
