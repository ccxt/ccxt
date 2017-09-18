# -*- coding: utf-8 -*-

"""
MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

#------------------------------------------------------------------------------

import aiohttp
import asyncio
import base64
import calendar
import collections
import concurrent
import datetime
import hashlib
import json
import math
import re
import socket
import ssl
import sys
import time

#------------------------------------------------------------------------------

from ccxt.version import __version__

#------------------------------------------------------------------------------

from ccxt.errors import CCXTError
from ccxt.errors import ExchangeError
from ccxt.errors import NotSupported
from ccxt.errors import AuthenticationError
from ccxt.errors import InsufficientFunds
from ccxt.errors import NetworkError
from ccxt.errors import DDoSProtection
from ccxt.errors import RequestTimeout
from ccxt.errors import ExchangeNotAvailable

#------------------------------------------------------------------------------

from ccxt.exchange import Exchange as BaseExchange

#------------------------------------------------------------------------------

__all__ = [
    'BaseExchange',
    'Exchange',
]

#------------------------------------------------------------------------------

class Exchange (BaseExchange):

    def __init__(self, config={}):
        super(Exchange, self).__init__(config)
        self.asyncio_loop = self.asyncio_loop or asyncio.get_event_loop()
        self.aiohttp_session = self.aiohttp_session or aiohttp.ClientSession(loop=self.asyncio_loop)

    def __del__(self):
        if self.aiohttp_session:
            self.aiohttp_session.close()

    async def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""
        headers = headers or {}
        if self.userAgent:
            if type(self.userAgent) is str:
                headers.update({'User-Agent': self.userAgent})
            elif (type(self.userAgent) is dict) and ('User-Agent' in self.userAgent):
                headers.update(self.userAgent)
        if len(self.proxy):
            headers.update({'Origin': '*'})
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        url = self.proxy + url
        if self.verbose:
            print(url, method, url, "\nRequest:", headers, body)
        encoded_body = body.encode() if body else None
        session_method = getattr(self.aiohttp_session, method.lower())
        try:
            async with session_method(url, data=encoded_body, headers=headers, timeout=(self.timeout / 1000)) as response:
                text = await response.text()
                self.handle_rest_errors(None, response.status, text, url, method)
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
        return self.set_markets(markets)

    async def fetch_order_status(self, id, market=None):
        order = await self.fetch_order(id)
        return order['status']

#==============================================================================
