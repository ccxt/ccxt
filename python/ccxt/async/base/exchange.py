# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.10.451'

# -----------------------------------------------------------------------------

import asyncio
import concurrent
import socket
import time
import math
import random

import aiohttp

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
        super(Exchange, self).__init__(config)
        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        self.aiohttp_session = self.aiohttp_session or aiohttp.ClientSession(loop=self.asyncio_loop)
        self.init_rest_rate_limiter()

    def __del__(self):
        if self.aiohttp_session:
            self.aiohttp_session.close()

    def init_rest_rate_limiter(self):
        self.throttle = throttle(self.extend({
            'loop': self.asyncio_loop,
        }, self.tokenBucket))

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
        headers = headers or {}
        headers.update(self.headers)
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if self.proxy:
            headers.update({'Origin': '*'})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        url = self.proxy + url
        if self.verbose:
            print(url, method, url, "\nRequest:", headers, body)
        encoded_body = body.encode() if body else None
        session_method = getattr(self.aiohttp_session, method.lower())
        try:
            async with session_method(url, data=encoded_body, headers=headers, timeout=(self.timeout / 1000), proxy=self.aiohttp_proxy) as response:
                text = await response.text()
                self.handle_errors(response.status, text, url, method, None, text)
                self.handle_rest_errors(None, response.status, text, url, method)
        except socket.gaierror as e:
            self.raise_error(ExchangeError, url, method, e, None)
        except concurrent.futures._base.TimeoutError as e:
            raise RequestTimeout(' '.join([self.id, method, url, 'request timeout']))
        except aiohttp.client_exceptions.ServerDisconnectedError as e:
            self.raise_error(ExchangeError, url, method, e, None)
        except aiohttp.client_exceptions.ClientConnectorError as e:
            self.raise_error(ExchangeError, url, method, e, None)
        if self.verbose:
            print(method, url, "\nResponse:", headers, text)
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

    async def fetch_order_status(self, id, market=None):
        order = await self.fetch_order(id)
        return order['status']

    async def fetch_partial_balance(self, part, params={}):
        balance = await self.fetch_balance(params)
        return balance[part]

    async def fetch_l2_order_book(self, symbol, params={}):
        orderbook = await self.fetch_order_book(symbol, params)
        return self.extend(orderbook, {
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
        })

    async def update_order(self, id, symbol, *args):
        if not self.enableRateLimit:
            raise ExchangeError(self.id + ' updateOrder() requires enableRateLimit = true')
        await self.cancel_order(id, symbol)
        return await self.create_order(symbol, *args)
