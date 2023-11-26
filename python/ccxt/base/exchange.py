# -*- coding: utf-8 -*-

"""Base exchange class"""

# -----------------------------------------------------------------------------

__version__ = '4.1.66'

# -----------------------------------------------------------------------------

from ccxt.base.errors import ExchangeError
from ccxt.base.errors import NetworkError
from ccxt.base.errors import NotSupported
from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import InvalidAddress
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import ArgumentsRequired
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NullResponse
from ccxt.base.errors import RateLimitExceeded
from ccxt.base.errors import BadRequest
from ccxt.base.errors import BadResponse

# -----------------------------------------------------------------------------

from ccxt.base.decimal_to_precision import decimal_to_precision
from ccxt.base.decimal_to_precision import DECIMAL_PLACES, TICK_SIZE, NO_PADDING, TRUNCATE, ROUND, ROUND_UP, ROUND_DOWN, SIGNIFICANT_DIGITS
from ccxt.base.decimal_to_precision import number_to_string
from ccxt.base.precise import Precise
from ccxt.base.types import Account, Currency, IndexType, OrderSide, OrderType, Trade, OrderRequest, Market, Str, Num

# -----------------------------------------------------------------------------

# rsa jwt signing
from cryptography.hazmat import backends
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key

# -----------------------------------------------------------------------------

# ecdsa signing
from ccxt.static_dependencies import ecdsa
from ccxt.static_dependencies import keccak

# eddsa signing
try:
    import axolotl_curve25519 as eddsa
except ImportError:
    eddsa = None

# -----------------------------------------------------------------------------

__all__ = [
    'Exchange',
]

# -----------------------------------------------------------------------------

import types
import logging
import base64
import binascii
import calendar
import collections
import datetime
from email.utils import parsedate
# import functools
import gzip
import hashlib
import hmac
import io
import json
import math
import random
from numbers import Number
import re
from requests import Session
from requests.utils import default_user_agent
from requests.exceptions import HTTPError, Timeout, TooManyRedirects, RequestException, ConnectionError as requestsConnectionError
# import socket
from ssl import SSLError
# import sys
import time
import uuid
import zlib
from decimal import Decimal
from time import mktime
from wsgiref.handlers import format_date_time
import urllib.parse as _urlencode
from typing import Any, List
from ccxt.base.types import Int

# -----------------------------------------------------------------------------


class Exchange(object):
    """Base exchange class"""
    id = None
    name = None
    version = None
    certified = False  # if certified by the CCXT dev team
    pro = False  # if it is integrated with CCXT Pro for WebSocket support
    alias = False  # whether this exchange is an alias to another exchange
    # rate limiter settings
    enableRateLimit = True
    rateLimit = 2000  # milliseconds = seconds * 1000
    timeout = 10000   # milliseconds = seconds * 1000
    asyncio_loop = None
    aiohttp_proxy = None
    trust_env = False
    aiohttp_trust_env = False
    requests_trust_env = False
    session = None  # Session () by default
    verify = True  # SSL verification
    validateServerSsl = True
    validateClientSsl = False
    logger = None  # logging.getLogger(__name__) by default
    verbose = False
    markets = None
    symbols = None
    codes = None
    timeframes = None
    fees = {
        'trading': {
            'percentage': True,  # subclasses should rarely have to redefine this
        },
        'funding': {
            'withdraw': {},
            'deposit': {},
        },
    }
    loaded_fees = {
        'trading': {
            'percentage': True,
        },
        'funding': {
            'withdraw': {},
            'deposit': {},
        },
    }
    ids = None
    urls = None
    api = None
    parseJsonResponse = True

    # PROXY & USER-AGENTS (see "examples/proxy-usage" file for explanation)
    proxy = None  # for backwards compatibility
    proxyUrl = None
    proxy_url = None
    proxyUrlCallback = None
    proxy_url_callback = None
    httpProxy = None
    http_proxy = None
    httpProxyCallback = None
    http_proxy_callback = None
    httpsProxy = None
    https_proxy = None
    httpsProxyCallback = None
    https_proxy_callback = None
    socksProxy = None
    socks_proxy = None
    socksProxyCallback = None
    socks_proxy_callback = None
    userAgent = None
    user_agent = None
    wsProxy = None
    ws_proxy = None
    wssProxy = None
    wss_proxy = None
    #
    userAgents = {
        'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
        'chrome39': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
        'chrome100': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    }
    headers = None
    origin = '*'  # CORS origin
    #
    proxies = None

    hostname = None  # in case of inaccessibility of the "main" domain
    apiKey = ''
    secret = ''
    password = ''
    uid = ''
    privateKey = ''  # a "0x"-prefixed hexstring private key for a wallet
    walletAddress = ''  # the wallet address "0x"-prefixed hexstring
    token = ''  # reserved for HTTP auth in some cases
    twofa = None
    markets_by_id = None
    currencies_by_id = None
    precision = None
    exceptions = None
    limits = {
        'leverage': {
            'min': None,
            'max': None,
        },
        'amount': {
            'min': None,
            'max': None,
        },
        'price': {
            'min': None,
            'max': None,
        },
        'cost': {
            'min': None,
            'max': None,
        },
    }
    httpExceptions = {
        '422': ExchangeError,
        '418': DDoSProtection,
        '429': RateLimitExceeded,
        '404': ExchangeNotAvailable,
        '409': ExchangeNotAvailable,
        '410': ExchangeNotAvailable,
        '451': ExchangeNotAvailable,
        '500': ExchangeNotAvailable,
        '501': ExchangeNotAvailable,
        '502': ExchangeNotAvailable,
        '520': ExchangeNotAvailable,
        '521': ExchangeNotAvailable,
        '522': ExchangeNotAvailable,
        '525': ExchangeNotAvailable,
        '526': ExchangeNotAvailable,
        '400': ExchangeNotAvailable,
        '403': ExchangeNotAvailable,
        '405': ExchangeNotAvailable,
        '503': ExchangeNotAvailable,
        '530': ExchangeNotAvailable,
        '408': RequestTimeout,
        '504': RequestTimeout,
        '401': AuthenticationError,
        '407': AuthenticationError,
        '511': AuthenticationError,
    }
    balance = None
    orderbooks = None
    orders = None
    triggerOrders = None
    myTrades = None
    trades = None
    transactions = None
    ohlcvs = None
    tickers = None
    base_currencies = None
    quote_currencies = None
    currencies = None
    options = None  # Python does not allow to define properties in run-time with setattr
    accounts = None
    positions = None

    requiredCredentials = {
        'apiKey': True,
        'secret': True,
        'uid': False,
        'login': False,
        'password': False,
        'twofa': False,  # 2-factor authentication (one-time password key)
        'privateKey': False,  # a "0x"-prefixed hexstring private key for a wallet
        'walletAddress': False,  # the wallet address "0x"-prefixed hexstring
        'token': False,  # reserved for HTTP auth in some cases
    }

    # API method metainfo
    has = {
        'publicAPI': True,
        'privateAPI': True,
        'CORS': None,
        'spot': None,
        'margin': None,
        'swap': None,
        'future': None,
        'option': None,
        'addMargin': None,
        'cancelAllOrders': None,
        'cancelOrder': True,
        'cancelOrders': None,
        'createDepositAddress': None,
        'createLimitOrder': True,
        'createMarketOrder': True,
        'createOrder': True,
        'createPostOnlyOrder': None,
        'createReduceOnlyOrder': None,
        'createStopOrder': None,
        'createStopLimitOrder': None,
        'createStopMarketOrder': None,
        'editOrder': 'emulated',
        'fetchAccounts': None,
        'fetchBalance': True,
        'fetchBidsAsks': None,
        'fetchBorrowInterest': None,
        'fetchBorrowRate': None,
        'fetchBorrowRateHistory': None,
        'fetchBorrowRatesPerSymbol': None,
        'fetchBorrowRates': None,
        'fetchCanceledOrders': None,
        'fetchClosedOrder': None,
        'fetchClosedOrders': None,
        'fetchCurrencies': 'emulated',
        'fetchDeposit': None,
        'fetchDepositAddress': None,
        'fetchDepositAddresses': None,
        'fetchDepositAddressesByNetwork': None,
        'fetchDeposits': None,
        'fetchFundingFee': None,
        'fetchFundingFees': None,
        'fetchFundingHistory': None,
        'fetchFundingRate': None,
        'fetchFundingRateHistory': None,
        'fetchFundingRates': None,
        'fetchIndexOHLCV': None,
        'fetchL2OrderBook': True,
        'fetchLedger': None,
        'fetchLedgerEntry': None,
        'fetchLeverageTiers': None,
        'fetchMarketLeverageTiers': None,
        'fetchMarkets': True,
        'fetchMarkOHLCV': None,
        'fetchMyTrades': None,
        'fetchOHLCV': None,
        'fetchOpenOrder': None,
        'fetchOpenOrders': None,
        'fetchOrder': None,
        'fetchOrderBook': True,
        'fetchOrderBooks': None,
        'fetchOrders': None,
        'fetchOrderTrades': None,
        'fetchPermissions': None,
        'fetchPosition': None,
        'fetchPositions': None,
        'fetchPositionsRisk': None,
        'fetchPremiumIndexOHLCV': None,
        'fetchStatus': 'emulated',
        'fetchTicker': True,
        'fetchTickers': None,
        'fetchTime': None,
        'fetchTrades': True,
        'fetchTradingFee': None,
        'fetchTradingFees': None,
        'fetchTradingLimits': None,
        'fetchTransactions': None,
        'fetchTransfers': None,
        'fetchWithdrawal': None,
        'fetchWithdrawals': None,
        'reduceMargin': None,
        'setLeverage': None,
        'setMargin': None,
        'setMarginMode': None,
        'setPositionMode': None,
        'signIn': None,
        'transfer': None,
        'withdraw': None,
        'watchOrderBook': None,
        'watchOrders': None,
        'watchMyTrades': None,
        'watchTickers': None,
        'watchTicker': None,
        'watchTrades': None,
        'watchTradesForSymbols': None,
        'watchOrderBookForSymbols': None,
        'watchOHLCVForSymbols': None,
        'watchBalance': None,
        'watchOHLCV': None,
    }
    precisionMode = DECIMAL_PLACES
    paddingMode = NO_PADDING
    minFundingAddressLength = 1  # used in check_address
    substituteCommonCurrencyCodes = True
    quoteJsonNumbers = True
    number: Num = float  # or str (a pointer to a class)
    handleContentTypeApplicationZip = False
    # whether fees should be summed by currency code
    reduceFees = True
    lastRestRequestTimestamp = 0
    lastRestPollTimestamp = 0
    restRequestQueue = None
    restPollerLoopIsRunning = False
    rateLimitTokens = 16
    rateLimitMaxTokens = 16
    rateLimitUpdateTime = 0
    enableLastHttpResponse = True
    enableLastJsonResponse = True
    enableLastResponseHeaders = True
    last_http_response = None
    last_json_response = None
    last_response_headers = None
    last_request_body = None
    last_request_url = None
    last_request_headers = None

    requiresEddsa = False
    base58_encoder = None
    base58_decoder = None
    # no lower case l or upper case I, O
    base58_alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

    commonCurrencies = {
        'XBT': 'BTC',
        'BCC': 'BCH',
        'BCHSV': 'BSV',
    }
    synchronous = True

    def __init__(self, config={}):
        self.aiohttp_trust_env = self.aiohttp_trust_env or self.trust_env
        self.requests_trust_env = self.requests_trust_env or self.trust_env

        self.precision = dict() if self.precision is None else self.precision
        self.limits = dict() if self.limits is None else self.limits
        self.exceptions = dict() if self.exceptions is None else self.exceptions
        self.headers = dict() if self.headers is None else self.headers
        self.balance = dict() if self.balance is None else self.balance
        self.orderbooks = dict() if self.orderbooks is None else self.orderbooks
        self.tickers = dict() if self.tickers is None else self.tickers
        self.trades = dict() if self.trades is None else self.trades
        self.transactions = dict() if self.transactions is None else self.transactions
        self.ohlcvs = dict() if self.ohlcvs is None else self.ohlcvs
        self.currencies = dict() if self.currencies is None else self.currencies
        self.options = self.get_default_options() if self.options is None else self.options  # Python does not allow to define properties in run-time with setattr
        self.decimal_to_precision = decimal_to_precision
        self.number_to_string = number_to_string

        # version = '.'.join(map(str, sys.version_info[:3]))
        # self.userAgent = {
        #     'User-Agent': 'ccxt/' + __version__ + ' (+https://github.com/ccxt/ccxt) Python/' + version
        # }

        self.origin = self.uuid()
        self.userAgent = default_user_agent()

        settings = self.deep_extend(self.describe(), config)

        for key in settings:
            if hasattr(self, key) and isinstance(getattr(self, key), dict):
                setattr(self, key, self.deep_extend(getattr(self, key), settings[key]))
            else:
                setattr(self, key, settings[key])

        if self.markets:
            self.set_markets(self.markets)

        self.after_construct()

        # convert all properties from underscore notation foo_bar to camelcase notation fooBar
        cls = type(self)
        for name in dir(self):
            if name[0] != '_' and name[-1] != '_' and '_' in name:
                parts = name.split('_')
                # fetch_ohlcv → fetchOHLCV (not fetchOhlcv!)
                exceptions = {'ohlcv': 'OHLCV', 'le': 'LE', 'be': 'BE'}
                camelcase = parts[0] + ''.join(exceptions.get(i, self.capitalize(i)) for i in parts[1:])
                attr = getattr(self, name)
                if isinstance(attr, types.MethodType):
                    setattr(cls, camelcase, getattr(cls, name))
                else:
                    if hasattr(self, camelcase):
                        if attr is not None:
                            setattr(self, camelcase, attr)
                    else:
                        setattr(self, camelcase, attr)

        self.tokenBucket = self.extend({
            'refillRate': 1.0 / self.rateLimit if self.rateLimit > 0 else float('inf'),
            'delay': 0.001,
            'capacity': 1.0,
            'defaultCost': 1.0,
        }, getattr(self, 'tokenBucket', {}))

        if not self.session and self.synchronous:
            self.session = Session()
            self.session.trust_env = self.requests_trust_env
        self.logger = self.logger if self.logger else logging.getLogger(__name__)

    def __del__(self):
        if self.session:
            try:
                self.session.close()
            except Exception as e:
                pass

    def __repr__(self):
        return 'ccxt.' + ('async_support.' if self.asyncio_loop else '') + self.id + '()'

    def __str__(self):
        return self.name

    def describe(self):
        return {}

    def throttle(self, cost=None):
        now = float(self.milliseconds())
        elapsed = now - self.lastRestRequestTimestamp
        cost = 1 if cost is None else cost
        sleep_time = self.rateLimit * cost
        if elapsed < sleep_time:
            delay = sleep_time - elapsed
            time.sleep(delay / 1000.0)

    @staticmethod
    def gzip_deflate(response, text):
        encoding = response.info().get('Content-Encoding')
        if encoding in ('gzip', 'x-gzip', 'deflate'):
            if encoding == 'deflate':
                return zlib.decompress(text, -zlib.MAX_WBITS)
            else:
                return gzip.GzipFile('', 'rb', 9, io.BytesIO(text)).read()
        return text

    def prepare_request_headers(self, headers=None):
        headers = headers or {}
        if self.session:
            headers.update(self.session.headers)
        headers.update(self.headers)
        userAgent = self.userAgent if self.userAgent is not None else self.user_agent
        if userAgent:
            if type(userAgent) is str:
                headers.update({'User-Agent': userAgent})
            elif (type(userAgent) is dict) and ('User-Agent' in userAgent):
                headers.update(userAgent)
        headers.update({'Accept-Encoding': 'gzip, deflate'})
        return self.set_headers(headers)

    def log(self, *args):
        print(*args)

    def on_rest_response(self, code, reason, url, method, response_headers, response_body, request_headers, request_body):
        return response_body.strip()

    def on_json_response(self, response_body):
        if self.quoteJsonNumbers:
            return json.loads(response_body, parse_float=str, parse_int=str)
        else:
            return json.loads(response_body)

    def fetch(self, url, method='GET', headers=None, body=None):
        """Perform a HTTP request and return decoded JSON data"""

        # ##### PROXY & HEADERS #####
        request_headers = self.prepare_request_headers(headers)
        # proxy-url
        proxyUrl = self.check_proxy_url_settings(url, method, headers, body)
        if proxyUrl is not None:
            request_headers.update({'Origin': self.origin})
            url = proxyUrl + url
        # proxy agents
        proxies = None  # set default
        httpProxy, httpsProxy, socksProxy = self.check_proxy_settings(url, method, headers, body)
        if httpProxy:
            proxies = {}
            proxies['http'] = httpProxy
        elif httpsProxy:
            proxies = {}
            proxies['https'] = httpsProxy
        elif socksProxy:
            proxies = {}
            # https://stackoverflow.com/a/15661226/2377343
            proxies['http'] = socksProxy
            proxies['https'] = socksProxy
        proxyAgentSet = proxies is not None
        self.checkConflictingProxies(proxyAgentSet, proxyUrl)
        # specifically for async-python, there is ".proxies" property maintained
        if (self.proxies is not None):
            if (proxyAgentSet or proxyUrl):
                raise ExchangeError(self.id + ' you have conflicting proxy settings - use either .proxies or http(s)Proxy / socksProxy / proxyUrl')
            proxies = self.proxies
        # log
        if self.verbose:
            self.log("\nfetch Request:", self.id, method, url, "RequestHeaders:", request_headers, "RequestBody:", body)
        self.logger.debug("%s %s, Request: %s %s", method, url, request_headers, body)
        # end of proxies & headers

        request_body = body
        if body:
            body = body.encode()

        self.session.cookies.clear()

        http_response = None
        http_status_code = None
        http_status_text = None
        json_response = None
        try:
            response = self.session.request(
                method,
                url,
                data=body,
                headers=request_headers,
                timeout=int(self.timeout / 1000),
                proxies=proxies,
                verify=self.verify and self.validateServerSsl
            )
            # does not try to detect encoding
            response.encoding = 'utf-8'
            headers = response.headers
            http_status_code = response.status_code
            http_status_text = response.reason
            http_response = self.on_rest_response(http_status_code, http_status_text, url, method, headers, response.text, request_headers, request_body)
            json_response = self.parse_json(http_response)
            # FIXME remove last_x_responses from subclasses
            if self.enableLastHttpResponse:
                self.last_http_response = http_response
            if self.enableLastJsonResponse:
                self.last_json_response = json_response
            if self.enableLastResponseHeaders:
                self.last_response_headers = headers
            if self.verbose:
                self.log("\nfetch Response:", self.id, method, url, http_status_code, "ResponseHeaders:", headers, "ResponseBody:", http_response)
            self.logger.debug("%s %s, Response: %s %s %s", method, url, http_status_code, headers, http_response)
            response.raise_for_status()

        except Timeout as e:
            details = ' '.join([self.id, method, url])
            raise RequestTimeout(details) from e

        except TooManyRedirects as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeError(details) from e

        except SSLError as e:
            details = ' '.join([self.id, method, url])
            raise ExchangeError(details) from e

        except HTTPError as e:
            details = ' '.join([self.id, method, url])
            skip_further_error_handling = self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
            if not skip_further_error_handling:
                self.handle_http_status_code(http_status_code, http_status_text, url, method, http_response)
            raise ExchangeError(details) from e

        except requestsConnectionError as e:
            error_string = str(e)
            details = ' '.join([self.id, method, url])
            if 'Read timed out' in error_string:
                raise RequestTimeout(details) from e
            else:
                raise NetworkError(details) from e

        except ConnectionResetError as e:
            error_string = str(e)
            details = ' '.join([self.id, method, url])
            raise NetworkError(details) from e

        except RequestException as e:  # base exception class
            error_string = str(e)
            if ('Missing dependencies for SOCKS support' in error_string):
                raise NotSupported(self.id + ' - to use SOCKS proxy with ccxt, you might need "pysocks" module that can be installed by "pip install pysocks"')
            details = ' '.join([self.id, method, url])
            if any(x in error_string for x in ['ECONNRESET', 'Connection aborted.', 'Connection broken:']):
                raise NetworkError(details) from e
            else:
                raise ExchangeError(details) from e

        self.handle_errors(http_status_code, http_status_text, url, method, headers, http_response, json_response, request_headers, request_body)
        if json_response is not None:
            return json_response
        elif self.is_text_response(headers):
            return http_response
        else:
            if isinstance(response.content, bytes):
                return response.content.decode('utf8')
            return response.content

    def parse_json(self, http_response):
        try:
            if Exchange.is_json_encoded_object(http_response):
                return self.on_json_response(http_response)
        except ValueError:  # superclass of JsonDecodeError (python2)
            pass

    def is_text_response(self, headers):
        # https://github.com/ccxt/ccxt/issues/5302
        content_type = headers.get('Content-Type', '')
        return content_type.startswith('application/json') or content_type.startswith('text/')

    @staticmethod
    def key_exists(dictionary, key):
        if hasattr(dictionary, '__getitem__') and not isinstance(dictionary, str):
            if isinstance(dictionary, list) and type(key) is not int:
                return False
            try:
                value = dictionary[key]
                return value is not None and value != ''
            except LookupError:
                return False
        return False

    @staticmethod
    def safe_float(dictionary, key, default_value=None):
        value = default_value
        try:
            if Exchange.key_exists(dictionary, key):
                value = float(dictionary[key])
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def safe_string(dictionary, key, default_value=None):
        return str(dictionary[key]) if Exchange.key_exists(dictionary, key) else default_value

    @staticmethod
    def safe_string_lower(dictionary, key, default_value=None):
        if Exchange.key_exists(dictionary, key):
            return str(dictionary[key]).lower()
        else:
            return default_value.lower() if default_value is not None else default_value

    @staticmethod
    def safe_string_upper(dictionary, key, default_value=None):
        if Exchange.key_exists(dictionary, key):
            return str(dictionary[key]).upper()
        else:
            return default_value.upper() if default_value is not None else default_value

    @staticmethod
    def safe_integer(dictionary, key, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        try:
            # needed to avoid breaking on "100.0"
            # https://stackoverflow.com/questions/1094717/convert-a-string-to-integer-with-decimal-in-python#1094721
            return int(float(value))
        except ValueError:
            return default_value
        except TypeError:
            return default_value

    @staticmethod
    def safe_integer_product(dictionary, key, factor, default_value=None):
        if not Exchange.key_exists(dictionary, key):
            return default_value
        value = dictionary[key]
        if isinstance(value, Number):
            return int(value * factor)
        elif isinstance(value, str):
            try:
                return int(float(value) * factor)
            except ValueError:
                pass
        return default_value

    @staticmethod
    def safe_timestamp(dictionary, key, default_value=None):
        return Exchange.safe_integer_product(dictionary, key, 1000, default_value)

    @staticmethod
    def safe_value(dictionary, key, default_value=None):
        return dictionary[key] if Exchange.key_exists(dictionary, key) else default_value

    # we're not using safe_floats with a list argument as we're trying to save some cycles here
    # we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

    @staticmethod
    def safe_float_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_float, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_lower_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string_lower, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_string_upper_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_string_upper, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_integer_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_integer, dictionary, key1, key2, default_value)

    @staticmethod
    def safe_integer_product_2(dictionary, key1, key2, factor, default_value=None):
        value = Exchange.safe_integer_product(dictionary, key1, factor)
        return value if value is not None else Exchange.safe_integer_product(dictionary, key2, factor, default_value)

    @staticmethod
    def safe_timestamp_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_integer_product_2(dictionary, key1, key2, 1000, default_value)

    @staticmethod
    def safe_value_2(dictionary, key1, key2, default_value=None):
        return Exchange.safe_either(Exchange.safe_value, dictionary, key1, key2, default_value)

    # safe_method_n methods family

    @staticmethod
    def safe_float_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        try:
            value = float(value)
        except ValueError as e:
            value = default_value
        return value

    @staticmethod
    def safe_string_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return str(value) if value is not None else default_value

    @staticmethod
    def safe_string_lower_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is not None:
            return str(value).lower()
        elif default_value is None:
            return default_value
        else:
            return default_value.lower()

    @staticmethod
    def safe_string_upper_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is not None:
            return str(value).upper()
        elif default_value is None:
            return default_value
        else:
            return default_value.upper()

    @staticmethod
    def safe_integer_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        try:
            # needed to avoid breaking on "100.0"
            # https://stackoverflow.com/questions/1094717/convert-a-string-to-integer-with-decimal-in-python#1094721
            return int(float(value))
        except ValueError:
            return default_value
        except TypeError:
            return default_value

    @staticmethod
    def safe_integer_product_n(dictionary, key_list, factor, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        if value is None:
            return default_value
        if isinstance(value, Number):
            return int(value * factor)
        elif isinstance(value, str):
            try:
                return int(float(value) * factor)
            except ValueError:
                pass
        return default_value

    @staticmethod
    def safe_timestamp_n(dictionary, key_list, default_value=None):
        return Exchange.safe_integer_product_n(dictionary, key_list, 1000, default_value)

    @staticmethod
    def safe_value_n(dictionary, key_list, default_value=None):
        value = Exchange.get_object_value_from_key_list(dictionary, key_list)
        return value if value is not None else default_value

    @staticmethod
    def get_object_value_from_key_list(dictionary, key_list):
        filtered_list = list(filter(lambda el: el in dictionary and dictionary[el] != '' and dictionary[el] is not None, key_list))
        if (len(filtered_list) == 0):
            return None
        return dictionary[filtered_list[0]]

    @staticmethod
    def safe_either(method, dictionary, key1, key2, default_value=None):
        """A helper-wrapper for the safe_value_2() family."""
        value = method(dictionary, key1)
        return value if value is not None else method(dictionary, key2, default_value)

    @staticmethod
    def truncate(num, precision=0):
        """Deprecated, use decimal_to_precision instead"""
        if precision > 0:
            decimal_precision = math.pow(10, precision)
            return math.trunc(num * decimal_precision) / decimal_precision
        return int(Exchange.truncate_to_string(num, precision))

    @staticmethod
    def truncate_to_string(num, precision=0):
        """Deprecated, todo: remove references from subclasses"""
        if precision > 0:
            parts = ('{0:.%df}' % precision).format(Decimal(num)).split('.')
            decimal_digits = parts[1][:precision].rstrip('0')
            decimal_digits = decimal_digits if len(decimal_digits) else '0'
            return parts[0] + '.' + decimal_digits
        return ('%d' % num)

    @staticmethod
    def uuid22(length=22):
        return format(random.getrandbits(length * 4), 'x')

    @staticmethod
    def uuid16(length=16):
        return format(random.getrandbits(length * 4), 'x')

    @staticmethod
    def uuid():
        return str(uuid.uuid4())

    @staticmethod
    def uuidv1():
        return str(uuid.uuid1()).replace('-', '')

    @staticmethod
    def capitalize(string):  # first character only, rest characters unchanged
        # the native pythonic .capitalize() method lowercases all other characters
        # which is an unwanted behaviour, therefore we use this custom implementation
        # check it yourself: print('foobar'.capitalize(), 'fooBar'.capitalize())
        if len(string) > 1:
            return "%s%s" % (string[0].upper(), string[1:])
        return string.upper()

    @staticmethod
    def strip(string):
        return string.strip()

    @staticmethod
    def keysort(dictionary):
        return collections.OrderedDict(sorted(dictionary.items(), key=lambda t: t[0]))

    @staticmethod
    def extend(*args):
        if args is not None:
            result = None
            if type(args[0]) is collections.OrderedDict:
                result = collections.OrderedDict()
            else:
                result = {}
            for arg in args:
                result.update(arg)
            return result
        return {}

    @staticmethod
    def deep_extend(*args):
        result = None
        for arg in args:
            if isinstance(arg, dict):
                if not isinstance(result, dict):
                    result = {}
                for key in arg:
                    result[key] = Exchange.deep_extend(result[key] if key in result else None, arg[key])
            else:
                result = arg
        return result

    @staticmethod
    def filter_by(array, key, value=None):
        array = Exchange.to_array(array)
        return list(filter(lambda x: x[key] == value, array))

    @staticmethod
    def filterBy(array, key, value=None):
        return Exchange.filter_by(array, key, value)

    @staticmethod
    def group_by(array, key):
        result = {}
        array = Exchange.to_array(array)
        array = [entry for entry in array if (key in entry) and (entry[key] is not None)]
        for entry in array:
            if entry[key] not in result:
                result[entry[key]] = []
            result[entry[key]].append(entry)
        return result

    @staticmethod
    def groupBy(array, key):
        return Exchange.group_by(array, key)

    @staticmethod
    def index_by(array, key):
        result = {}
        if type(array) is dict:
            array = Exchange.keysort(array).values()
        is_int_key = isinstance(key, int)
        for element in array:
            if ((is_int_key and (key < len(element))) or (key in element)) and (element[key] is not None):
                k = element[key]
                result[k] = element
        return result

    @staticmethod
    def sort_by(array, key, descending=False, default=0):
        return sorted(array, key=lambda k: k[key] if k[key] is not None else default, reverse=descending)

    @staticmethod
    def sort_by_2(array, key1, key2, descending=False):
        return sorted(array, key=lambda k: (k[key1] if k[key1] is not None else "", k[key2] if k[key2] is not None else ""), reverse=descending)

    @staticmethod
    def array_concat(a, b):
        return a + b

    @staticmethod
    def in_array(needle, haystack):
        return needle in haystack

    @staticmethod
    def is_empty(object):
        return not object

    @staticmethod
    def extract_params(string):
        return re.findall(r'{([\w-]+)}', string)

    @staticmethod
    def implode_params(string, params):
        if isinstance(params, dict):
            for key in params:
                if not isinstance(params[key], list):
                    string = string.replace('{' + key + '}', str(params[key]))
        return string

    @staticmethod
    def urlencode(params={}, doseq=False):
        newParams = params.copy()
        for key, value in params.items():
            if isinstance(value, bool):
                newParams[key] = 'true' if value else 'false'
        return _urlencode.urlencode(newParams, doseq, quote_via=_urlencode.quote)

    @staticmethod
    def urlencode_with_array_repeat(params={}):
        return re.sub(r'%5B\d*%5D', '', Exchange.urlencode(params, True))

    @staticmethod
    def urlencode_nested(params):
        result = {}

        def _encode_params(params, p_key=None):
            encode_params = {}
            if isinstance(params, dict):
                for key in params:
                    encode_key = '{}[{}]'.format(p_key, key)
                    encode_params[encode_key] = params[key]
            elif isinstance(params, (list, tuple)):
                for offset, value in enumerate(params):
                    encode_key = '{}[{}]'.format(p_key, offset)
                    encode_params[encode_key] = value
            else:
                result[p_key] = params
            for key in encode_params:
                value = encode_params[key]
                _encode_params(value, key)
        if isinstance(params, dict):
            for key in params:
                _encode_params(params[key], key)
        return _urlencode.urlencode(result)

    @staticmethod
    def rawencode(params={}):
        return _urlencode.unquote(Exchange.urlencode(params))

    @staticmethod
    def encode_uri_component(uri, safe="~()*!.'"):
        return _urlencode.quote(uri, safe=safe)

    @staticmethod
    def omit(d, *args):
        if isinstance(d, dict):
            result = d.copy()
            for arg in args:
                if type(arg) is list:
                    for key in arg:
                        if key in result:
                            del result[key]
                else:
                    if arg in result:
                        del result[arg]
            return result
        return d

    @staticmethod
    def unique(array):
        return list(set(array))

    @staticmethod
    def pluck(array, key):
        return [
            element[key]
            for element in array
            if (key in element) and (element[key] is not None)
        ]

    @staticmethod
    def sum(*args):
        return sum([arg for arg in args if isinstance(arg, (float, int))])

    @staticmethod
    def ordered(array):
        return collections.OrderedDict(array)

    @staticmethod
    def aggregate(bidasks):
        ordered = Exchange.ordered({})
        for [price, volume, *_] in bidasks:
            if volume > 0:
                ordered[price] = (ordered[price] if price in ordered else 0) + volume
        result = []
        items = list(ordered.items())
        for price, volume in items:
            result.append([price, volume])
        return result

    @staticmethod
    def sec():
        return Exchange.seconds()

    @staticmethod
    def msec():
        return Exchange.milliseconds()

    @staticmethod
    def usec():
        return Exchange.microseconds()

    @staticmethod
    def seconds():
        return int(time.time())

    @staticmethod
    def milliseconds():
        return int(time.time() * 1000)

    @staticmethod
    def microseconds():
        return int(time.time() * 1000000)

    @staticmethod
    def iso8601(timestamp=None):
        if timestamp is None:
            return timestamp
        if not isinstance(timestamp, int):
            return None
        if int(timestamp) < 0:
            return None

        try:
            utc = datetime.datetime.utcfromtimestamp(timestamp // 1000)
            return utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-6] + "{:03d}".format(int(timestamp) % 1000) + 'Z'
        except (TypeError, OverflowError, OSError):
            return None

    @staticmethod
    def rfc2616(self, timestamp=None):
        if timestamp is None:
            ts = datetime.datetime.now()
        else:
            ts = timestamp
        stamp = mktime(ts.timetuple())
        return format_date_time(stamp)

    @staticmethod
    def dmy(timestamp, infix='-'):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%m' + infix + '%d' + infix + '%Y')

    @staticmethod
    def ymd(timestamp, infix='-', fullYear=True):
        year_format = '%Y' if fullYear else '%y'
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime(year_format + infix + '%m' + infix + '%d')

    @staticmethod
    def yymmdd(timestamp, infix=''):
        return Exchange.ymd(timestamp, infix, False)

    @staticmethod
    def yyyymmdd(timestamp, infix='-'):
        return Exchange.ymd(timestamp, infix, True)

    @staticmethod
    def ymdhms(timestamp, infix=' '):
        utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
        return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')

    @staticmethod
    def parse_date(timestamp=None):
        if timestamp is None:
            return timestamp
        if not isinstance(timestamp, str):
            return None
        if 'GMT' in timestamp:
            try:
                string = ''.join([str(value) for value in parsedate(timestamp)[:6]]) + '.000Z'
                dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
                return calendar.timegm(dt.utctimetuple()) * 1000
            except (TypeError, OverflowError, OSError):
                return None
        else:
            return Exchange.parse8601(timestamp)

    @staticmethod
    def parse8601(timestamp=None):
        if timestamp is None:
            return timestamp
        yyyy = '([0-9]{4})-?'
        mm = '([0-9]{2})-?'
        dd = '([0-9]{2})(?:T|[\\s])?'
        h = '([0-9]{2}):?'
        m = '([0-9]{2}):?'
        s = '([0-9]{2})'
        ms = '(\\.[0-9]{1,3})?'
        tz = '(?:(\\+|\\-)([0-9]{2})\\:?([0-9]{2})|Z)?'
        regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
        try:
            match = re.search(regex, timestamp, re.IGNORECASE)
            if match is None:
                return None
            yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups()
            ms = ms or '.000'
            ms = (ms + '00')[0:4]
            msint = int(ms[1:])
            sign = sign or ''
            sign = int(sign + '1') * -1
            hours = int(hours or 0) * sign
            minutes = int(minutes or 0) * sign
            offset = datetime.timedelta(hours=hours, minutes=minutes)
            string = yyyy + mm + dd + h + m + s + ms + 'Z'
            dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
            dt = dt + offset
            return calendar.timegm(dt.utctimetuple()) * 1000 + msint
        except (TypeError, OverflowError, OSError, ValueError):
            return None

    @staticmethod
    def hash(request, algorithm='md5', digest='hex'):
        if algorithm == 'keccak':
            binary = bytes(keccak.SHA3(request))
        else:
            h = hashlib.new(algorithm, request)
            binary = h.digest()
        if digest == 'base64':
            return Exchange.binary_to_base64(binary)
        elif digest == 'hex':
            return Exchange.binary_to_base16(binary)
        return binary

    @staticmethod
    def hmac(request, secret, algorithm=hashlib.sha256, digest='hex'):
        h = hmac.new(secret, request, algorithm)
        binary = h.digest()
        if digest == 'hex':
            return Exchange.binary_to_base16(binary)
        elif digest == 'base64':
            return Exchange.binary_to_base64(binary)
        return binary

    @staticmethod
    def binary_concat(*args):
        result = bytes()
        for arg in args:
            result = result + arg
        return result

    @staticmethod
    def binary_concat_array(array):
        result = bytes()
        for element in array:
            result = result + element
        return result

    @staticmethod
    def base64urlencode(s):
        return Exchange.decode(base64.urlsafe_b64encode(s)).replace('=', '')

    @staticmethod
    def binary_to_base64(s):
        return Exchange.decode(base64.standard_b64encode(s))

    @staticmethod
    def base64_to_binary(s):
        return base64.standard_b64decode(s)

    @staticmethod
    def string_to_base64(s):
        return Exchange.binary_to_base64(Exchange.encode(s))

    @staticmethod
    def base64_to_string(s):
        return Exchange.decode(base64.b64decode(s))

    @staticmethod
    def jwt(request, secret, algorithm='sha256', is_rsa=False):
        algos = {
            'sha256': hashlib.sha256,
            'sha384': hashlib.sha384,
            'sha512': hashlib.sha512,
        }
        alg = ('RS' if is_rsa else 'HS') + algorithm[3:]
        header = Exchange.encode(Exchange.json({
            'alg': alg,
            'typ': 'JWT',
        }))
        encoded_header = Exchange.base64urlencode(header)
        encoded_data = Exchange.base64urlencode(Exchange.encode(Exchange.json(request)))
        token = encoded_header + '.' + encoded_data
        if is_rsa:
            signature = Exchange.base64_to_binary(Exchange.rsa(token, Exchange.decode(secret), algorithm))
        else:
            signature = Exchange.hmac(Exchange.encode(token), secret, algos[algorithm], 'binary')
        return token + '.' + Exchange.base64urlencode(signature)

    @staticmethod
    def rsa(request, secret, alg='sha256'):
        algorithms = {
            "sha256": hashes.SHA256(),
            "sha384": hashes.SHA384(),
            "sha512": hashes.SHA512(),
        }
        algorithm = algorithms[alg]
        priv_key = load_pem_private_key(Exchange.encode(secret), None, backends.default_backend())
        return Exchange.binary_to_base64(priv_key.sign(Exchange.encode(request), padding.PKCS1v15(), algorithm))

    @staticmethod
    def ecdsa(request, secret, algorithm='p256', hash=None, fixed_length=False):
        # your welcome - frosty00
        algorithms = {
            'p192': [ecdsa.NIST192p, 'sha256'],
            'p224': [ecdsa.NIST224p, 'sha256'],
            'p256': [ecdsa.NIST256p, 'sha256'],
            'p384': [ecdsa.NIST384p, 'sha384'],
            'p521': [ecdsa.NIST521p, 'sha512'],
            'secp256k1': [ecdsa.SECP256k1, 'sha256'],
        }
        if algorithm not in algorithms:
            raise ArgumentsRequired(algorithm + ' is not a supported algorithm')
        curve_info = algorithms[algorithm]
        hash_function = getattr(hashlib, curve_info[1])
        encoded_request = Exchange.encode(request)
        if hash is not None:
            digest = Exchange.hash(encoded_request, hash, 'binary')
        else:
            digest = base64.b16decode(encoded_request, casefold=True)
        key = ecdsa.SigningKey.from_string(base64.b16decode(Exchange.encode(secret),
                                                            casefold=True), curve=curve_info[0])
        r_binary, s_binary, v = key.sign_digest_deterministic(digest, hashfunc=hash_function,
                                                              sigencode=ecdsa.util.sigencode_strings_canonize)
        r_int, s_int = ecdsa.util.sigdecode_strings((r_binary, s_binary), key.privkey.order)
        counter = 0
        minimum_size = (1 << (8 * 31)) - 1
        half_order = key.privkey.order / 2
        while fixed_length and (r_int > half_order or r_int <= minimum_size or s_int <= minimum_size):
            r_binary, s_binary, v = key.sign_digest_deterministic(digest, hashfunc=hash_function,
                                                                  sigencode=ecdsa.util.sigencode_strings_canonize,
                                                                  extra_entropy=Exchange.number_to_le(counter, 32))
            r_int, s_int = ecdsa.util.sigdecode_strings((r_binary, s_binary), key.privkey.order)
            counter += 1
        r, s = Exchange.decode(base64.b16encode(r_binary)).lower(), Exchange.decode(base64.b16encode(s_binary)).lower()
        return {
            'r': r,
            's': s,
            'v': v,
        }

    @staticmethod
    def eddsa(request, secret, curve='ed25519'):
        private_key = load_pem_private_key(Exchange.encode(secret), None)
        return Exchange.binary_to_base64(private_key.sign(request))

    @staticmethod
    def axolotl(request, secret, curve='ed25519'):
        random = b'\x00' * 64
        request = base64.b16decode(request, casefold=True)
        secret = base64.b16decode(secret, casefold=True)
        signature = eddsa.calculateSignature(random, secret, request)
        return Exchange.binary_to_base58(signature)

    @staticmethod
    def json(data, params=None):
        return json.dumps(data, separators=(',', ':'))

    @staticmethod
    def is_json_encoded_object(input):
        return (isinstance(input, str) and
                (len(input) >= 2) and
                ((input[0] == '{') or (input[0] == '[')))

    @staticmethod
    def encode(string):
        return string.encode('latin-1')

    @staticmethod
    def decode(string):
        return string.decode('latin-1')

    @staticmethod
    def to_array(value):
        return list(value.values()) if type(value) is dict else value

    @staticmethod
    def check_required_version(required_version, error=True):
        result = True
        [major1, minor1, patch1] = required_version.split('.')
        [major2, minor2, patch2] = __version__.split('.')
        int_major1 = int(major1)
        int_minor1 = int(minor1)
        int_patch1 = int(patch1)
        int_major2 = int(major2)
        int_minor2 = int(minor2)
        int_patch2 = int(patch2)
        if int_major1 > int_major2:
            result = False
        if int_major1 == int_major2:
            if int_minor1 > int_minor2:
                result = False
            elif int_minor1 == int_minor2 and int_patch1 > int_patch2:
                result = False
        if not result:
            if error:
                raise NotSupported('Your current version of CCXT is ' + __version__ + ', a newer version ' + required_version + ' is required, please, upgrade your version of CCXT')
            else:
                return error
        return result

    def check_address(self, address):
        """Checks an address is not the same character repeated or an empty sequence"""
        if address is None:
            raise InvalidAddress(self.id + ' address is None')
        if all(letter == address[0] for letter in address) or len(address) < self.minFundingAddressLength or ' ' in address:
            raise InvalidAddress(self.id + ' address is invalid or has less than ' + str(self.minFundingAddressLength) + ' characters: "' + str(address) + '"')
        return address

    def precision_from_string(self, str):
        # support string formats like '1e-4'
        if 'e' in str:
            numStr = re.sub(r'\de', '', str)
            return int(numStr) * -1
        # support integer formats (without dot) like '1', '10' etc [Note: bug in decimalToPrecision, so this should not be used atm]
        # if not ('.' in str):
        #     return len(str) * -1
        # default strings like '0.0001'
        parts = re.sub(r'0+$', '', str).split('.')
        return len(parts[1]) if len(parts) > 1 else 0

    def load_markets(self, reload=False, params={}):
        if not reload:
            if self.markets:
                if not self.markets_by_id:
                    return self.set_markets(self.markets)
                return self.markets
        currencies = None
        if self.has['fetchCurrencies'] is True:
            currencies = self.fetch_currencies()
        markets = self.fetch_markets(params)
        return self.set_markets(markets, currencies)

    def load_fees(self, reload=False):
        if not reload:
            if self.loaded_fees != Exchange.loaded_fees:
                return self.loaded_fees
        self.loaded_fees = self.deep_extend(self.loaded_fees, self.fetch_fees())
        return self.loaded_fees

    def fetch_markets(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.to_array(self.markets)

    def fetch_currencies(self, params={}):
        # markets are returned as a list
        # currencies are returned as a dict
        # this is for historical reasons
        # and may be changed for consistency later
        return self.currencies

    def fetch_fees(self):
        trading = {}
        funding = {}
        if self.has['fetchTradingFees']:
            trading = self.fetch_trading_fees()
        if self.has['fetchFundingFees']:
            funding = self.fetch_funding_fees()
        return {
            'trading': trading,
            'funding': funding,
        }

    @staticmethod
    def parse_timeframe(timeframe):
        amount = int(timeframe[0:-1])
        unit = timeframe[-1]
        if 'y' == unit:
            scale = 60 * 60 * 24 * 365
        elif 'M' == unit:
            scale = 60 * 60 * 24 * 30
        elif 'w' == unit:
            scale = 60 * 60 * 24 * 7
        elif 'd' == unit:
            scale = 60 * 60 * 24
        elif 'h' == unit:
            scale = 60 * 60
        elif 'm' == unit:
            scale = 60
        elif 's' == unit:
            scale = 1
        else:
            raise NotSupported('timeframe unit {} is not supported'.format(unit))
        return amount * scale

    @staticmethod
    def round_timeframe(timeframe, timestamp, direction=ROUND_DOWN):
        ms = Exchange.parse_timeframe(timeframe) * 1000
        # Get offset based on timeframe in milliseconds
        offset = timestamp % ms
        return timestamp - offset + (ms if direction == ROUND_UP else 0)

    def vwap(self, baseVolume, quoteVolume):
        return (quoteVolume / baseVolume) if (quoteVolume is not None) and (baseVolume is not None) and (baseVolume > 0) else None

    def check_required_dependencies(self):
        if self.requiresEddsa and eddsa is None:
            raise NotSupported(self.id + ' Eddsa functionality requires python-axolotl-curve25519, install with `pip install python-axolotl-curve25519==0.4.1.post2`: https://github.com/tgalal/python-axolotl-curve25519')

    def privateKeyToAddress(self, privateKey):
        private_key_bytes = base64.b16decode(Exchange.encode(privateKey), True)
        public_key_bytes = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1).verifying_key.to_string()
        public_key_hash = keccak.SHA3(public_key_bytes)
        return '0x' + Exchange.decode(base64.b16encode(public_key_hash))[-40:].lower()

    @staticmethod
    def remove0x_prefix(value):
        if value[:2] == '0x':
            return value[2:]
        return value

    @staticmethod
    def totp(key):
        def hex_to_dec(n):
            return int(n, base=16)

        def base32_to_bytes(n):
            missing_padding = len(n) % 8
            padding = 8 - missing_padding if missing_padding > 0 else 0
            padded = n.upper() + ('=' * padding)
            return base64.b32decode(padded)  # throws an error if the key is invalid

        epoch = int(time.time()) // 30
        hmac_res = Exchange.hmac(epoch.to_bytes(8, 'big'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
        offset = hex_to_dec(hmac_res[-1]) * 2
        otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
        return otp[-6:]

    @staticmethod
    def number_to_le(n, size):
        return int(n).to_bytes(size, 'little')

    @staticmethod
    def number_to_be(n, size):
        return int(n).to_bytes(size, 'big')

    @staticmethod
    def base16_to_binary(s):
        return base64.b16decode(s, True)

    @staticmethod
    def binary_to_base16(s):
        return Exchange.decode(base64.b16encode(s)).lower()

    def sleep(self, milliseconds):
        return time.sleep(milliseconds / 1000)

    @staticmethod
    def base58_to_binary(s):
        """encodes a base58 string to as a big endian integer"""
        if Exchange.base58_decoder is None:
            Exchange.base58_decoder = {}
            Exchange.base58_encoder = {}
            for i, c in enumerate(Exchange.base58_alphabet):
                Exchange.base58_decoder[c] = i
                Exchange.base58_encoder[i] = c
        result = 0
        for i in range(len(s)):
            result *= 58
            result += Exchange.base58_decoder[s[i]]
        return result.to_bytes((result.bit_length() + 7) // 8, 'big')

    @staticmethod
    def binary_to_base58(b):
        if Exchange.base58_encoder is None:
            Exchange.base58_decoder = {}
            Exchange.base58_encoder = {}
            for i, c in enumerate(Exchange.base58_alphabet):
                Exchange.base58_decoder[c] = i
                Exchange.base58_encoder[i] = c
        result = 0
        # undo decimal_to_bytes
        for byte in b:
            result *= 0x100
            result += byte
        string = []
        while result > 0:
            result, next_character = divmod(result, 58)
            string.append(Exchange.base58_encoder[next_character])
        string.reverse()
        return ''.join(string)

    def parse_number(self, value, default=None):
        if value is None:
            return default
        else:
            try:
                return self.number(value)
            except Exception:
                return default

    def omit_zero(self, string_number):
        if string_number is None or string_number == '':
            return None
        if float(string_number) == 0:
            return None
        return string_number

    def check_order_arguments(self, market, type, side, amount, price, params):
        if price is None:
            if type == 'limit':
                raise ArgumentsRequired(self.id + ' create_order() requires a price argument for a limit order')
        if amount <= 0:
            raise InvalidOrder(self.id + ' create_order() amount should be above 0')

    def handle_http_status_code(self, code, reason, url, method, body):
        codeAsString = str(code)
        if codeAsString in self.httpExceptions:
            ErrorClass = self.httpExceptions[codeAsString]
            raise ErrorClass(self.id + ' ' + method + ' ' + url + ' ' + codeAsString + ' ' + reason + ' ' + body)

    @staticmethod
    def crc32(string, signed=False):
        unsigned = binascii.crc32(string.encode('utf8'))
        if signed and (unsigned >= 0x80000000):
            return unsigned - 0x100000000
        else:
            return unsigned

    def clone(self, obj):
        return obj if isinstance(obj, list) else self.extend(obj)

    # def delete_key_from_dictionary(self, dictionary, key):
    #     newDictionary = self.clone(dictionary)
    #     del newDictionary[key]
    #     return newDictionary

    # def set_object_property(obj, prop, value):
    #     obj[prop] = value

    def convert_to_big_int(self, value):
        return int(value) if isinstance(value, str) else value

    def string_to_chars_array(self, value):
        return list(value)

    def valueIsDefined(self, value):
        return value is not None

    def arraySlice(self, array, first, second=None):
        return array[first:second] if second else array[first:]

    def get_property(self, obj, property, defaultValue=None):
        return getattr(obj, property) if hasattr(obj, property) else defaultValue

    def set_property(self, obj, property, value):
        setattr(obj, property, value)

    def un_camel_case(self, str):
        return re.sub('(?!^)([A-Z]+)', r'_\1', str).lower()

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

    def handle_deltas(self, orderbook, deltas):
        for i in range(0, len(deltas)):
            self.handle_delta(orderbook, deltas[i])

    def handle_delta(self, bookside, delta):
        raise NotSupported(self.id + ' handleDelta not supported yet')

    def get_cache_index(self, orderbook, deltas):
        # return the first index of the cache that can be applied to the orderbook or -1 if not possible
        return -1

    def find_timeframe(self, timeframe, timeframes=None):
        if timeframes is None:
            timeframes = self.timeframes
        keys = list(timeframes.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if timeframes[key] == timeframe:
                return key
        return None

    def check_proxy_url_settings(self, url=None, method=None, headers=None, body=None):
        usedProxies = []
        proxyUrl = None
        if self.proxyUrl is not None:
            usedProxies.append('proxyUrl')
            proxyUrl = self.proxyUrl
        if self.proxy_url is not None:
            usedProxies.append('proxy_url')
            proxyUrl = self.proxy_url
        if self.proxyUrlCallback is not None:
            usedProxies.append('proxyUrlCallback')
            proxyUrl = self.proxyUrlCallback(url, method, headers, body)
        if self.proxy_url_callback is not None:
            usedProxies.append('proxy_url_callback')
            proxyUrl = self.proxy_url_callback(url, method, headers, body)
        # backwards-compatibility
        if self.proxy is not None:
            usedProxies.append('proxy')
            if callable(self.proxy):
                proxyUrl = self.proxy(url, method, headers, body)
            else:
                proxyUrl = self.proxy
        length = len(usedProxies)
        if length > 1:
            joinedProxyNames = ','.join(usedProxies)
            raise ExchangeError(self.id + ' you have multiple conflicting proxy_url settings(' + joinedProxyNames + '), please use only one from : proxyUrl, proxy_url, proxyUrlCallback, proxy_url_callback')
        return proxyUrl

    def check_proxy_settings(self, url=None, method=None, headers=None, body=None):
        usedProxies = []
        httpProxy = None
        httpsProxy = None
        socksProxy = None
        # httpProxy
        if self.httpProxy is not None:
            usedProxies.append('httpProxy')
            httpProxy = self.httpProxy
        if self.http_proxy is not None:
            usedProxies.append('http_proxy')
            httpProxy = self.http_proxy
        if self.httpProxyCallback is not None:
            usedProxies.append('httpProxyCallback')
            httpProxy = self.httpProxyCallback(url, method, headers, body)
        if self.http_proxy_callback is not None:
            usedProxies.append('http_proxy_callback')
            httpProxy = self.http_proxy_callback(url, method, headers, body)
        # httpsProxy
        if self.httpsProxy is not None:
            usedProxies.append('httpsProxy')
            httpsProxy = self.httpsProxy
        if self.https_proxy is not None:
            usedProxies.append('https_proxy')
            httpsProxy = self.https_proxy
        if self.httpsProxyCallback is not None:
            usedProxies.append('httpsProxyCallback')
            httpsProxy = self.httpsProxyCallback(url, method, headers, body)
        if self.https_proxy_callback is not None:
            usedProxies.append('https_proxy_callback')
            httpsProxy = self.https_proxy_callback(url, method, headers, body)
        # socksProxy
        if self.socksProxy is not None:
            usedProxies.append('socksProxy')
            socksProxy = self.socksProxy
        if self.socks_proxy is not None:
            usedProxies.append('socks_proxy')
            socksProxy = self.socks_proxy
        if self.socksProxyCallback is not None:
            usedProxies.append('socksProxyCallback')
            socksProxy = self.socksProxyCallback(url, method, headers, body)
        if self.socks_proxy_callback is not None:
            usedProxies.append('socks_proxy_callback')
            socksProxy = self.socks_proxy_callback(url, method, headers, body)
        # check
        length = len(usedProxies)
        if length > 1:
            joinedProxyNames = ','.join(usedProxies)
            raise ExchangeError(self.id + ' you have multiple conflicting settings(' + joinedProxyNames + '), please use only one from: httpProxy, httpsProxy, httpProxyCallback, httpsProxyCallback, socksProxy, socksProxyCallback')
        return [httpProxy, httpsProxy, socksProxy]

    def check_ws_proxy_settings(self):
        usedProxies = []
        wsProxy = None
        wssProxy = None
        # wsProxy
        if self.wsProxy is not None:
            usedProxies.append('wsProxy')
            wsProxy = self.wsProxy
        if self.ws_proxy is not None:
            usedProxies.append('ws_proxy')
            wsProxy = self.ws_proxy
        # wsProxy
        if self.wssProxy is not None:
            usedProxies.append('wssProxy')
            wssProxy = self.wssProxy
        if self.wss_proxy is not None:
            usedProxies.append('wss_proxy')
            wssProxy = self.wss_proxy
        # check
        length = len(usedProxies)
        if length > 1:
            joinedProxyNames = ','.join(usedProxies)
            raise ExchangeError(self.id + ' you have multiple conflicting settings(' + joinedProxyNames + '), please use only one from: wsProxy, wssProxy')
        return [wsProxy, wssProxy]

    def check_conflicting_proxies(self, proxyAgentSet, proxyUrlSet):
        if proxyAgentSet and proxyUrlSet:
            raise ExchangeError(self.id + ' you have multiple conflicting proxy settings, please use only one from : proxyUrl, httpProxy, httpsProxy, socksProxy')

    def find_message_hashes(self, client, element: str):
        result = []
        messageHashes = list(client.futures.keys())
        for i in range(0, len(messageHashes)):
            messageHash = messageHashes[i]
            if messageHash.find(element) >= 0:
                result.append(messageHash)
        return result

    def filter_by_limit(self, array: List[object], limit: Int = None, key: IndexType = 'timestamp'):
        if self.valueIsDefined(limit):
            arrayLength = len(array)
            if arrayLength > 0:
                ascending = True
                if (key in array[0]):
                    first = array[0][key]
                    last = array[arrayLength - 1][key]
                    if first is not None and last is not None:
                        ascending = first <= last  # True if array is sorted in ascending order based on 'timestamp'
                array = self.arraySlice(array, -limit) if ascending else self.arraySlice(array, 0, limit)
        return array

    def filter_by_since_limit(self, array: List[object], since: Int = None, limit: Int = None, key: IndexType = 'timestamp', tail=False):
        sinceIsDefined = self.valueIsDefined(since)
        parsedArray = self.to_array(array)
        result = parsedArray
        if sinceIsDefined:
            result = []
            for i in range(0, len(parsedArray)):
                entry = parsedArray[i]
                value = self.safe_value(entry, key)
                if value and (value >= since):
                    result.append(entry)
        if tail and limit is not None:
            return self.arraySlice(result, -limit)
        return self.filter_by_limit(result, limit, key)

    def filter_by_value_since_limit(self, array: List[object], field: IndexType, value=None, since: Int = None, limit: Int = None, key='timestamp', tail=False):
        valueIsDefined = self.valueIsDefined(value)
        sinceIsDefined = self.valueIsDefined(since)
        parsedArray = self.to_array(array)
        result = parsedArray
        # single-pass filter for both symbol and since
        if valueIsDefined or sinceIsDefined:
            result = []
            for i in range(0, len(parsedArray)):
                entry = parsedArray[i]
                entryFiledEqualValue = entry[field] == value
                firstCondition = entryFiledEqualValue if valueIsDefined else True
                entryKeyValue = self.safe_value(entry, key)
                entryKeyGESince = (entryKeyValue) and since and (entryKeyValue >= since)
                secondCondition = entryKeyGESince if sinceIsDefined else True
                if firstCondition and secondCondition:
                    result.append(entry)
        if tail and limit is not None:
            return self.arraySlice(result, -limit)
        return self.filter_by_limit(result, limit, key)

    def set_sandbox_mode(self, enabled):
        if enabled:
            if 'test' in self.urls:
                if isinstance(self.urls['api'], str):
                    self.urls['apiBackup'] = self.urls['api']
                    self.urls['api'] = self.urls['test']
                else:
                    self.urls['apiBackup'] = self.clone(self.urls['api'])
                    self.urls['api'] = self.clone(self.urls['test'])
            else:
                raise NotSupported(self.id + ' does not have a sandbox URL')
        elif 'apiBackup' in self.urls:
            if isinstance(self.urls['api'], str):
                self.urls['api'] = self.urls['apiBackup']
            else:
                self.urls['api'] = self.clone(self.urls['apiBackup'])
            newUrls = self.omit(self.urls, 'apiBackup')
            self.urls = newUrls

    def sign(self, path, api: Any = 'public', method='GET', params={}, headers: Any = None, body: Any = None):
        return {}

    def fetch_accounts(self, params={}):
        raise NotSupported(self.id + ' fetchAccounts() is not supported yet')

    def fetch_trades(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchTrades() is not supported yet')

    def fetch_trades_ws(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchTradesWs() is not supported yet')

    def watch_trades(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchTrades() is not supported yet')

    def watch_trades_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchTradesForSymbols() is not supported yet')

    def watch_my_trades_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchMyTradesForSymbols() is not supported yet')

    def watch_orders_for_symbols(self, symbols: List[str], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrdersForSymbols() is not supported yet')

    def watch_ohlcv_for_symbols(self, symbolsAndTimeframes: List[List[str]], since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOHLCVForSymbols() is not supported yet')

    def watch_order_book_for_symbols(self, symbols: List[str], limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrderBookForSymbols() is not supported yet')

    def fetch_deposit_addresses(self, codes: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchDepositAddresses() is not supported yet')

    def fetch_order_book(self, symbol: str, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderBook() is not supported yet')

    def fetch_margin_mode(self, symbol: str = None, params={}):
        raise NotSupported(self.id + ' fetchMarginMode() is not supported yet')

    def fetch_rest_order_book_safe(self, symbol, limit=None, params={}):
        fetchSnapshotMaxRetries = self.handleOption('watchOrderBook', 'maxRetries', 3)
        for i in range(0, fetchSnapshotMaxRetries):
            try:
                orderBook = self.fetch_order_book(symbol, limit, params)
                return orderBook
            except Exception as e:
                if (i + 1) == fetchSnapshotMaxRetries:
                    raise e
        return None

    def watch_order_book(self, symbol: str, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrderBook() is not supported yet')

    def fetch_time(self, params={}):
        raise NotSupported(self.id + ' fetchTime() is not supported yet')

    def fetch_trading_limits(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchTradingLimits() is not supported yet')

    def parse_market(self, market):
        raise NotSupported(self.id + ' parseMarket() is not supported yet')

    def parse_markets(self, markets):
        result = []
        for i in range(0, len(markets)):
            result.append(self.parseMarket(markets[i]))
        return result

    def parse_ticker(self, ticker: object, market: Market = None):
        raise NotSupported(self.id + ' parseTicker() is not supported yet')

    def parse_deposit_address(self, depositAddress, currency: Currency = None):
        raise NotSupported(self.id + ' parseDepositAddress() is not supported yet')

    def parse_trade(self, trade: object, market: Market = None):
        raise NotSupported(self.id + ' parseTrade() is not supported yet')

    def parse_transaction(self, transaction, currency: Currency = None):
        raise NotSupported(self.id + ' parseTransaction() is not supported yet')

    def parse_transfer(self, transfer, currency: Currency = None):
        raise NotSupported(self.id + ' parseTransfer() is not supported yet')

    def parse_account(self, account):
        raise NotSupported(self.id + ' parseAccount() is not supported yet')

    def parse_ledger_entry(self, item, currency: Currency = None):
        raise NotSupported(self.id + ' parseLedgerEntry() is not supported yet')

    def parse_order(self, order, market: Market = None):
        raise NotSupported(self.id + ' parseOrder() is not supported yet')

    def fetch_cross_borrow_rates(self, params={}):
        raise NotSupported(self.id + ' fetchCrossBorrowRates() is not supported yet')

    def fetch_isolated_borrow_rates(self, params={}):
        raise NotSupported(self.id + ' fetchIsolatedBorrowRates() is not supported yet')

    def parse_market_leverage_tiers(self, info, market: Market = None):
        raise NotSupported(self.id + ' parseMarketLeverageTiers() is not supported yet')

    def fetch_leverage_tiers(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchLeverageTiers() is not supported yet')

    def parse_position(self, position, market: Market = None):
        raise NotSupported(self.id + ' parsePosition() is not supported yet')

    def parse_funding_rate_history(self, info, market: Market = None):
        raise NotSupported(self.id + ' parseFundingRateHistory() is not supported yet')

    def parse_borrow_interest(self, info, market: Market = None):
        raise NotSupported(self.id + ' parseBorrowInterest() is not supported yet')

    def parse_ws_trade(self, trade, market: Market = None):
        raise NotSupported(self.id + ' parseWsTrade() is not supported yet')

    def parse_ws_order(self, order, market: Market = None):
        raise NotSupported(self.id + ' parseWsOrder() is not supported yet')

    def parse_ws_order_trade(self, trade, market: Market = None):
        raise NotSupported(self.id + ' parseWsOrderTrade() is not supported yet')

    def parse_ws_ohlcv(self, ohlcv, market: Market = None):
        return self.parse_ohlcv(ohlcv, market)

    def fetch_funding_rates(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchFundingRates() is not supported yet')

    def transfer(self, code: str, amount, fromAccount, toAccount, params={}):
        raise NotSupported(self.id + ' transfer() is not supported yet')

    def withdraw(self, code: str, amount, address, tag=None, params={}):
        raise NotSupported(self.id + ' withdraw() is not supported yet')

    def create_deposit_address(self, code: str, params={}):
        raise NotSupported(self.id + ' createDepositAddress() is not supported yet')

    def set_leverage(self, leverage, symbol: str = None, params={}):
        raise NotSupported(self.id + ' setLeverage() is not supported yet')

    def parse_to_int(self, number):
        # Solve Common intmisuse ex: int((since / str(1000)))
        # using a number which is not valid in ts
        stringifiedNumber = str(number)
        convertedNumber = float(stringifiedNumber)
        return int(convertedNumber)

    def parse_to_numeric(self, number):
        stringVersion = self.number_to_string(number)  # self will convert 1.0 and 1 to "1" and 1.1 to "1.1"
        # keep self in mind:
        # in JS: 1 == 1.0 is True;  1 == 1.0 is True
        # in Python: 1 == 1.0 is True
        # in PHP 1 == 1.0 is True, but 1 == 1.0 is False
        if stringVersion.find('.') >= 0:
            return float(stringVersion)
        return int(stringVersion)

    def is_round_number(self, value):
        # self method is similar to isInteger, but self is more loyal and does not check for types.
        # i.e. isRoundNumber(1.000) returns True, while isInteger(1.000) returns False
        res = self.parse_to_numeric((value % 1))
        return res == 0

    def after_construct(self):
        self.create_networks_by_id_object()

    def create_networks_by_id_object(self):
        # automatically generate network-id-to-code mappings
        networkIdsToCodesGenerated = self.invert_flat_string_dictionary(self.safe_value(self.options, 'networks', {}))  # invert defined networks dictionary
        self.options['networksById'] = self.extend(networkIdsToCodesGenerated, self.safe_value(self.options, 'networksById', {}))  # support manually overriden "networksById" dictionary too

    def get_default_options(self):
        return {
            'defaultNetworkCodeReplacements': {
                'ETH': {'ERC20': 'ETH'},
                'TRX': {'TRC20': 'TRX'},
                'CRO': {'CRC20': 'CRONOS'},
            },
        }

    def safe_ledger_entry(self, entry: object, currency: Currency = None):
        currency = self.safe_currency(None, currency)
        direction = self.safe_string(entry, 'direction')
        before = self.safe_string(entry, 'before')
        after = self.safe_string(entry, 'after')
        amount = self.safe_string(entry, 'amount')
        if amount is not None:
            if before is None and after is not None:
                before = Precise.string_sub(after, amount)
            elif before is not None and after is None:
                after = Precise.string_add(before, amount)
        if before is not None and after is not None:
            if direction is None:
                if Precise.string_gt(before, after):
                    direction = 'out'
                if Precise.string_gt(after, before):
                    direction = 'in'
        fee = self.safe_value(entry, 'fee')
        if fee is not None:
            fee['cost'] = self.safe_number(fee, 'cost')
        timestamp = self.safe_integer(entry, 'timestamp')
        return {
            'id': self.safe_string(entry, 'id'),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'direction': direction,
            'account': self.safe_string(entry, 'account'),
            'referenceId': self.safe_string(entry, 'referenceId'),
            'referenceAccount': self.safe_string(entry, 'referenceAccount'),
            'type': self.safe_string(entry, 'type'),
            'currency': currency['code'],
            'amount': self.parse_number(amount),
            'before': self.parse_number(before),
            'after': self.parse_number(after),
            'status': self.safe_string(entry, 'status'),
            'fee': fee,
            'info': entry,
        }

    def safe_currency_structure(self, currency: object):
        return self.extend({
            'info': None,
            'id': None,
            'numericId': None,
            'code': None,
            'precision': None,
            'type': None,
            'name': None,
            'active': None,
            'deposit': None,
            'withdraw': None,
            'fee': None,
            'fees': {},
            'networks': {},
            'limits': {
                'deposit': {
                    'min': None,
                    'max': None,
                },
                'withdraw': {
                    'min': None,
                    'max': None,
                },
            },
        }, currency)

    def safe_market_structure(self, market=None):
        cleanStructure = {
            'id': None,
            'lowercaseId': None,
            'symbol': None,
            'base': None,
            'quote': None,
            'settle': None,
            'baseId': None,
            'quoteId': None,
            'settleId': None,
            'type': None,
            'spot': None,
            'margin': None,
            'swap': None,
            'future': None,
            'option': None,
            'index': None,
            'active': None,
            'contract': None,
            'linear': None,
            'inverse': None,
            'taker': None,
            'maker': None,
            'contractSize': None,
            'expiry': None,
            'expiryDatetime': None,
            'strike': None,
            'optionType': None,
            'precision': {
                'amount': None,
                'price': None,
                'cost': None,
                'base': None,
                'quote': None,
            },
            'limits': {
                'leverage': {
                    'min': None,
                    'max': None,
                },
                'amount': {
                    'min': None,
                    'max': None,
                },
                'price': {
                    'min': None,
                    'max': None,
                },
                'cost': {
                    'min': None,
                    'max': None,
                },
            },
            'created': None,
            'info': None,
        }
        if market is not None:
            result = self.extend(cleanStructure, market)
            # set None swap/future/etc
            if result['spot']:
                if result['contract'] is None:
                    result['contract'] = False
                if result['swap'] is None:
                    result['swap'] = False
                if result['future'] is None:
                    result['future'] = False
                if result['option'] is None:
                    result['option'] = False
                if result['index'] is None:
                    result['index'] = False
            return result
        return cleanStructure

    def set_markets(self, markets, currencies=None):
        values = []
        self.markets_by_id = {}
        # handle marketId conflicts
        # we insert spot markets first
        marketValues = self.sort_by(self.to_array(markets), 'spot', True, True)
        for i in range(0, len(marketValues)):
            value = marketValues[i]
            if value['id'] in self.markets_by_id:
                (self.markets_by_id[value['id']]).append(value)
            else:
                self.markets_by_id[value['id']] = [value]
            market = self.deep_extend(self.safe_market_structure(), {
                'precision': self.precision,
                'limits': self.limits,
            }, self.fees['trading'], value)
            values.append(market)
        self.markets = self.index_by(values, 'symbol')
        marketsSortedBySymbol = self.keysort(self.markets)
        marketsSortedById = self.keysort(self.markets_by_id)
        self.symbols = list(marketsSortedBySymbol.keys())
        self.ids = list(marketsSortedById.keys())
        if currencies is not None:
            # currencies is always None when called in constructor but not when called from loadMarkets
            self.currencies = self.deep_extend(self.currencies, currencies)
        else:
            baseCurrencies = []
            quoteCurrencies = []
            for i in range(0, len(values)):
                market = values[i]
                defaultCurrencyPrecision = 8 if (self.precisionMode == DECIMAL_PLACES) else self.parse_number('1e-8')
                marketPrecision = self.safe_value(market, 'precision', {})
                if 'base' in market:
                    currency = self.safe_currency_structure({
                        'id': self.safe_string_2(market, 'baseId', 'base'),
                        'numericId': self.safe_integer(market, 'baseNumericId'),
                        'code': self.safe_string(market, 'base'),
                        'precision': self.safe_value_2(marketPrecision, 'base', 'amount', defaultCurrencyPrecision),
                    })
                    baseCurrencies.append(currency)
                if 'quote' in market:
                    currency = self.safe_currency_structure({
                        'id': self.safe_string_2(market, 'quoteId', 'quote'),
                        'numericId': self.safe_integer(market, 'quoteNumericId'),
                        'code': self.safe_string(market, 'quote'),
                        'precision': self.safe_value_2(marketPrecision, 'quote', 'price', defaultCurrencyPrecision),
                    })
                    quoteCurrencies.append(currency)
            baseCurrencies = self.sort_by(baseCurrencies, 'code', False, '')
            quoteCurrencies = self.sort_by(quoteCurrencies, 'code', False, '')
            self.baseCurrencies = self.index_by(baseCurrencies, 'code')
            self.quoteCurrencies = self.index_by(quoteCurrencies, 'code')
            allCurrencies = self.array_concat(baseCurrencies, quoteCurrencies)
            groupedCurrencies = self.group_by(allCurrencies, 'code')
            codes = list(groupedCurrencies.keys())
            resultingCurrencies = []
            for i in range(0, len(codes)):
                code = codes[i]
                groupedCurrenciesCode = self.safe_value(groupedCurrencies, code, [])
                highestPrecisionCurrency = self.safe_value(groupedCurrenciesCode, 0)
                for j in range(1, len(groupedCurrenciesCode)):
                    currentCurrency = groupedCurrenciesCode[j]
                    if self.precisionMode == TICK_SIZE:
                        highestPrecisionCurrency = currentCurrency if (currentCurrency['precision'] < highestPrecisionCurrency['precision']) else highestPrecisionCurrency
                    else:
                        highestPrecisionCurrency = currentCurrency if (currentCurrency['precision'] > highestPrecisionCurrency['precision']) else highestPrecisionCurrency
                resultingCurrencies.append(highestPrecisionCurrency)
            sortedCurrencies = self.sort_by(resultingCurrencies, 'code')
            self.currencies = self.deep_extend(self.currencies, self.index_by(sortedCurrencies, 'code'))
        self.currencies_by_id = self.index_by(self.currencies, 'id')
        currenciesSortedByCode = self.keysort(self.currencies)
        self.codes = list(currenciesSortedByCode.keys())
        return self.markets

    def safe_balance(self, balance: object):
        balances = self.omit(balance, ['info', 'timestamp', 'datetime', 'free', 'used', 'total'])
        codes = list(balances.keys())
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        debtBalance = {}
        for i in range(0, len(codes)):
            code = codes[i]
            total = self.safe_string(balance[code], 'total')
            free = self.safe_string(balance[code], 'free')
            used = self.safe_string(balance[code], 'used')
            debt = self.safe_string(balance[code], 'debt')
            if (total is None) and (free is not None) and (used is not None):
                total = Precise.string_add(free, used)
            if (free is None) and (total is not None) and (used is not None):
                free = Precise.string_sub(total, used)
            if (used is None) and (total is not None) and (free is not None):
                used = Precise.string_sub(total, free)
            balance[code]['free'] = self.parse_number(free)
            balance[code]['used'] = self.parse_number(used)
            balance[code]['total'] = self.parse_number(total)
            balance['free'][code] = balance[code]['free']
            balance['used'][code] = balance[code]['used']
            balance['total'][code] = balance[code]['total']
            if debt is not None:
                balance[code]['debt'] = self.parse_number(debt)
                debtBalance[code] = balance[code]['debt']
        debtBalanceArray = list(debtBalance.keys())
        length = len(debtBalanceArray)
        if length:
            balance['debt'] = debtBalance
        return balance

    def safe_order(self, order: object, market: Market = None):
        # parses numbers
        # * it is important pass the trades rawTrades
        amount = self.omit_zero(self.safe_string(order, 'amount'))
        remaining = self.safe_string(order, 'remaining')
        filled = self.safe_string(order, 'filled')
        cost = self.safe_string(order, 'cost')
        average = self.omit_zero(self.safe_string(order, 'average'))
        price = self.omit_zero(self.safe_string(order, 'price'))
        lastTradeTimeTimestamp = self.safe_integer(order, 'lastTradeTimestamp')
        symbol = self.safe_string(order, 'symbol')
        side = self.safe_string(order, 'side')
        status = self.safe_string(order, 'status')
        parseFilled = (filled is None)
        parseCost = (cost is None)
        parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp is None)
        fee = self.safe_value(order, 'fee')
        parseFee = (fee is None)
        parseFees = self.safe_value(order, 'fees') is None
        parseSymbol = symbol is None
        parseSide = side is None
        shouldParseFees = parseFee or parseFees
        fees = self.safe_value(order, 'fees', [])
        trades = []
        if parseFilled or parseCost or shouldParseFees:
            rawTrades = self.safe_value(order, 'trades', trades)
            oldNumber = self.number
            # we parse trades here!
            self.number = str
            firstTrade = self.safe_value(rawTrades, 0)
            # parse trades if they haven't already been parsed
            tradesAreParsed = ((firstTrade is not None) and ('info' in firstTrade) and ('id' in firstTrade))
            if not tradesAreParsed:
                trades = self.parse_trades(rawTrades, market)
            else:
                trades = rawTrades
            self.number = oldNumber
            tradesLength = 0
            isArray = isinstance(trades, list)
            if isArray:
                tradesLength = len(trades)
            if isArray and (tradesLength > 0):
                # move properties that are defined in trades up into the order
                if order['symbol'] is None:
                    order['symbol'] = trades[0]['symbol']
                if order['side'] is None:
                    order['side'] = trades[0]['side']
                if order['type'] is None:
                    order['type'] = trades[0]['type']
                if order['id'] is None:
                    order['id'] = trades[0]['order']
                if parseFilled:
                    filled = '0'
                if parseCost:
                    cost = '0'
                for i in range(0, len(trades)):
                    trade = trades[i]
                    tradeAmount = self.safe_string(trade, 'amount')
                    if parseFilled and (tradeAmount is not None):
                        filled = Precise.string_add(filled, tradeAmount)
                    tradeCost = self.safe_string(trade, 'cost')
                    if parseCost and (tradeCost is not None):
                        cost = Precise.string_add(cost, tradeCost)
                    if parseSymbol:
                        symbol = self.safe_string(trade, 'symbol')
                    if parseSide:
                        side = self.safe_string(trade, 'side')
                    tradeTimestamp = self.safe_value(trade, 'timestamp')
                    if parseLastTradeTimeTimestamp and (tradeTimestamp is not None):
                        if lastTradeTimeTimestamp is None:
                            lastTradeTimeTimestamp = tradeTimestamp
                        else:
                            lastTradeTimeTimestamp = max(lastTradeTimeTimestamp, tradeTimestamp)
                    if shouldParseFees:
                        tradeFees = self.safe_value(trade, 'fees')
                        if tradeFees is not None:
                            for j in range(0, len(tradeFees)):
                                tradeFee = tradeFees[j]
                                fees.append(self.extend({}, tradeFee))
                        else:
                            tradeFee = self.safe_value(trade, 'fee')
                            if tradeFee is not None:
                                fees.append(self.extend({}, tradeFee))
        if shouldParseFees:
            reducedFees = self.reduce_fees_by_currency(fees) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                # copy fee to avoid modification by reference
                feeCopy = self.deep_extend(fee)
                feeCopy['cost'] = self.safe_number(feeCopy, 'cost')
                if 'rate' in feeCopy:
                    feeCopy['rate'] = self.safe_number(feeCopy, 'rate')
                reducedFees.append(feeCopy)
            order['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                order['fee'] = reducedFees[0]
        if amount is None:
            # ensure amount = filled + remaining
            if filled is not None and remaining is not None:
                amount = Precise.string_add(filled, remaining)
            elif status == 'closed':
                amount = filled
        if filled is None:
            if amount is not None and remaining is not None:
                filled = Precise.string_sub(amount, remaining)
            elif status == 'closed' and amount is not None:
                filled = amount
        if remaining is None:
            if amount is not None and filled is not None:
                remaining = Precise.string_sub(amount, filled)
            elif status == 'closed':
                remaining = '0'
        # ensure that the average field is calculated correctly
        inverse = self.safe_value(market, 'inverse', False)
        contractSize = self.number_to_string(self.safe_value(market, 'contractSize', 1))
        # inverse
        # price = filled * contract size / cost
        #
        # linear
        # price = cost / (filled * contract size)
        if average is None:
            if (filled is not None) and (cost is not None) and Precise.string_gt(filled, '0'):
                filledTimesContractSize = Precise.string_mul(filled, contractSize)
                if inverse:
                    average = Precise.string_div(filledTimesContractSize, cost)
                else:
                    average = Precise.string_div(cost, filledTimesContractSize)
        # similarly
        # inverse
        # cost = filled * contract size / price
        #
        # linear
        # cost = filled * contract size * price
        costPriceExists = (average is not None) or (price is not None)
        if parseCost and (filled is not None) and costPriceExists:
            multiplyPrice = None
            if average is None:
                multiplyPrice = price
            else:
                multiplyPrice = average
            # contract trading
            filledTimesContractSize = Precise.string_mul(filled, contractSize)
            if inverse:
                cost = Precise.string_div(filledTimesContractSize, multiplyPrice)
            else:
                cost = Precise.string_mul(filledTimesContractSize, multiplyPrice)
        # support for market orders
        orderType = self.safe_value(order, 'type')
        emptyPrice = (price is None) or Precise.string_equals(price, '0')
        if emptyPrice and (orderType == 'market'):
            price = average
        # we have trades with string values at self point so we will mutate them
        for i in range(0, len(trades)):
            entry = trades[i]
            entry['amount'] = self.safe_number(entry, 'amount')
            entry['price'] = self.safe_number(entry, 'price')
            entry['cost'] = self.safe_number(entry, 'cost')
            tradeFee = self.safe_value(entry, 'fee', {})
            tradeFee['cost'] = self.safe_number(tradeFee, 'cost')
            if 'rate' in tradeFee:
                tradeFee['rate'] = self.safe_number(tradeFee, 'rate')
            entry['fee'] = tradeFee
        timeInForce = self.safe_string(order, 'timeInForce')
        postOnly = self.safe_value(order, 'postOnly')
        # timeInForceHandling
        if timeInForce is None:
            if self.safe_string(order, 'type') == 'market':
                timeInForce = 'IOC'
            # allow postOnly override
            if postOnly:
                timeInForce = 'PO'
        elif postOnly is None:
            # timeInForce is not None here
            postOnly = timeInForce == 'PO'
        timestamp = self.safe_integer(order, 'timestamp')
        lastUpdateTimestamp = self.safe_integer(order, 'lastUpdateTimestamp')
        datetime = self.safe_string(order, 'datetime')
        if datetime is None:
            datetime = self.iso8601(timestamp)
        triggerPrice = self.parse_number(self.safe_string_2(order, 'triggerPrice', 'stopPrice'))
        takeProfitPrice = self.parse_number(self.safe_string(order, 'takeProfitPrice'))
        stopLossPrice = self.parse_number(self.safe_string(order, 'stopLossPrice'))
        return self.extend(order, {
            'id': self.safe_string(order, 'id'),
            'clientOrderId': self.safe_string(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'type': self.safe_string(order, 'type'),
            'side': side,
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'price': self.parse_number(price),
            'amount': self.parse_number(amount),
            'cost': self.parse_number(cost),
            'average': self.parse_number(average),
            'filled': self.parse_number(filled),
            'remaining': self.parse_number(remaining),
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'trades': trades,
            'reduceOnly': self.safe_value(order, 'reduceOnly'),
            'stopPrice': triggerPrice,  # ! deprecated, use triggerPrice instead
            'triggerPrice': triggerPrice,
            'takeProfitPrice': takeProfitPrice,
            'stopLossPrice': stopLossPrice,
            'status': status,
            'fee': self.safe_value(order, 'fee'),
        })

    def parse_orders(self, orders: object, market: Market = None, since: Int = None, limit: Int = None, params={}):
        #
        # the value of orders is either a dict or a list
        #
        # dict
        #
        #     {
        #         'id1': {...},
        #         'id2': {...},
        #         'id3': {...},
        #         ...
        #     }
        #
        # list
        #
        #     [
        #         {'id': 'id1', ...},
        #         {'id': 'id2', ...},
        #         {'id': 'id3', ...},
        #         ...
        #     ]
        #
        results = []
        if isinstance(orders, list):
            for i in range(0, len(orders)):
                order = self.extend(self.parse_order(orders[i], market), params)
                results.append(order)
        else:
            ids = list(orders.keys())
            for i in range(0, len(ids)):
                id = ids[i]
                order = self.extend(self.parse_order(self.extend({'id': id}, orders[id]), market), params)
                results.append(order)
        results = self.sort_by(results, 'timestamp')
        symbol = market['symbol'] if (market is not None) else None
        return self.filter_by_symbol_since_limit(results, symbol, since, limit)

    def calculate_fee(self, symbol: str, type: str, side: str, amount: float, price: float, takerOrMaker='taker', params={}):
        if type == 'market' and takerOrMaker == 'maker':
            raise ArgumentsRequired(self.id + ' calculateFee() - you have provided incompatible arguments - "market" type order can not be "maker". Change either the "type" or the "takerOrMaker" argument to calculate the fee.')
        market = self.markets[symbol]
        feeSide = self.safe_string(market, 'feeSide', 'quote')
        useQuote = None
        if feeSide == 'get':
            # the fee is always in the currency you get
            useQuote = side == 'sell'
        elif feeSide == 'give':
            # the fee is always in the currency you give
            useQuote = side == 'buy'
        else:
            # the fee is always in feeSide currency
            useQuote = feeSide == 'quote'
        cost = self.number_to_string(amount)
        key = None
        if useQuote:
            priceString = self.number_to_string(price)
            cost = Precise.string_mul(cost, priceString)
            key = 'quote'
        else:
            key = 'base'
        # for derivatives, the fee is in 'settle' currency
        if not market['spot']:
            key = 'settle'
        # even if `takerOrMaker` argument was set to 'maker', for 'market' orders we should forcefully override it to 'taker'
        if type == 'market':
            takerOrMaker = 'taker'
        rate = self.safe_string(market, takerOrMaker)
        cost = Precise.string_mul(cost, rate)
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': self.parse_number(rate),
            'cost': self.parse_number(cost),
        }

    def safe_liquidation(self, liquidation: object, market: Market = None):
        contracts = self.safe_string(liquidation, 'contracts')
        contractSize = self.safe_string(market, 'contractSize')
        price = self.safe_string(liquidation, 'price')
        baseValue = self.safe_string(liquidation, 'baseValue')
        quoteValue = self.safe_string(liquidation, 'quoteValue')
        if (baseValue is None) and (contracts is not None) and (contractSize is not None) and (price is not None):
            baseValue = Precise.string_mul(contracts, contractSize)
        if (quoteValue is None) and (baseValue is not None) and (price is not None):
            quoteValue = Precise.string_mul(baseValue, price)
        liquidation['contracts'] = self.parse_number(contracts)
        liquidation['contractSize'] = self.parse_number(contractSize)
        liquidation['price'] = self.parse_number(price)
        liquidation['baseValue'] = self.parse_number(baseValue)
        liquidation['quoteValue'] = self.parse_number(quoteValue)
        return liquidation

    def safe_trade(self, trade: object, market: Market = None):
        amount = self.safe_string(trade, 'amount')
        price = self.safe_string(trade, 'price')
        cost = self.safe_string(trade, 'cost')
        if cost is None:
            # contract trading
            contractSize = self.safe_string(market, 'contractSize')
            multiplyPrice = price
            if contractSize is not None:
                inverse = self.safe_value(market, 'inverse', False)
                if inverse:
                    multiplyPrice = Precise.string_div('1', price)
                multiplyPrice = Precise.string_mul(multiplyPrice, contractSize)
            cost = Precise.string_mul(multiplyPrice, amount)
        parseFee = self.safe_value(trade, 'fee') is None
        parseFees = self.safe_value(trade, 'fees') is None
        shouldParseFees = parseFee or parseFees
        fees = []
        fee = self.safe_value(trade, 'fee')
        if shouldParseFees:
            reducedFees = self.reduce_fees_by_currency(fees) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                # copy fee to avoid modification by reference
                feeCopy = self.deep_extend(fee)
                feeCopy['cost'] = self.safe_number(feeCopy, 'cost')
                if 'rate' in feeCopy:
                    feeCopy['rate'] = self.safe_number(feeCopy, 'rate')
                reducedFees.append(feeCopy)
            if parseFees:
                trade['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                trade['fee'] = reducedFees[0]
            tradeFee = self.safe_value(trade, 'fee')
            if tradeFee is not None:
                tradeFee['cost'] = self.safe_number(tradeFee, 'cost')
                if 'rate' in tradeFee:
                    tradeFee['rate'] = self.safe_number(tradeFee, 'rate')
                trade['fee'] = tradeFee
        trade['amount'] = self.parse_number(amount)
        trade['price'] = self.parse_number(price)
        trade['cost'] = self.parse_number(cost)
        return trade

    def invert_flat_string_dictionary(self, dict):
        reversed = {}
        keys = list(dict.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            value = dict[key]
            if isinstance(value, str):
                reversed[value] = key
        return reversed

    def reduce_fees_by_currency(self, fees):
        #
        # self function takes a list of fee structures having the following format
        #
        #     string = True
        #
        #     [
        #         {'currency': 'BTC', 'cost': '0.1'},
        #         {'currency': 'BTC', 'cost': '0.2'  },
        #         {'currency': 'BTC', 'cost': '0.2', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.4', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456'},
        #         {'currency': 'USDT', 'cost': '12.3456'},
        #     ]
        #
        #     string = False
        #
        #     [
        #         {'currency': 'BTC', 'cost': 0.1},
        #         {'currency': 'BTC', 'cost': 0.2},
        #         {'currency': 'BTC', 'cost': 0.2, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.4, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456},
        #         {'currency': 'USDT', 'cost': 12.3456},
        #     ]
        #
        # and returns a reduced fee list, where fees are summed per currency and rate(if any)
        #
        #     string = True
        #
        #     [
        #         {'currency': 'BTC', 'cost': '0.4'  },
        #         {'currency': 'BTC', 'cost': '0.6', 'rate': '0.00123'},
        #         {'currency': 'BTC', 'cost': '0.5', 'rate': '0.00456'},
        #         {'currency': 'USDT', 'cost': '12.3456'},
        #     ]
        #
        #     string  = False
        #
        #     [
        #         {'currency': 'BTC', 'cost': 0.3  },
        #         {'currency': 'BTC', 'cost': 0.6, 'rate': 0.00123},
        #         {'currency': 'BTC', 'cost': 0.5, 'rate': 0.00456},
        #         {'currency': 'USDT', 'cost': 12.3456},
        #     ]
        #
        reduced = {}
        for i in range(0, len(fees)):
            fee = fees[i]
            feeCurrencyCode = self.safe_string(fee, 'currency')
            if feeCurrencyCode is not None:
                rate = self.safe_string(fee, 'rate')
                cost = self.safe_value(fee, 'cost')
                if Precise.string_eq(cost, '0'):
                    # omit zero cost fees
                    continue
                if not (feeCurrencyCode in reduced):
                    reduced[feeCurrencyCode] = {}
                rateKey = '' if (rate is None) else rate
                if rateKey in reduced[feeCurrencyCode]:
                    reduced[feeCurrencyCode][rateKey]['cost'] = Precise.string_add(reduced[feeCurrencyCode][rateKey]['cost'], cost)
                else:
                    reduced[feeCurrencyCode][rateKey] = {
                        'currency': feeCurrencyCode,
                        'cost': cost,
                    }
                    if rate is not None:
                        reduced[feeCurrencyCode][rateKey]['rate'] = rate
        result = []
        feeValues = list(reduced.values())
        for i in range(0, len(feeValues)):
            reducedFeeValues = list(feeValues[i].values())
            result = self.array_concat(result, reducedFeeValues)
        return result

    def safe_ticker(self, ticker: object, market: Market = None):
        open = self.omit_zero(self.safe_string(ticker, 'open'))
        close = self.omit_zero(self.safe_string(ticker, 'close'))
        last = self.omit_zero(self.safe_string(ticker, 'last'))
        change = self.omit_zero(self.safe_string(ticker, 'change'))
        percentage = self.omit_zero(self.safe_string(ticker, 'percentage'))
        average = self.omit_zero(self.safe_string(ticker, 'average'))
        vwap = self.omit_zero(self.safe_string(ticker, 'vwap'))
        baseVolume = self.safe_string(ticker, 'baseVolume')
        quoteVolume = self.safe_string(ticker, 'quoteVolume')
        if vwap is None:
            vwap = Precise.string_div(self.omit_zero(quoteVolume), baseVolume)
        if (last is not None) and (close is None):
            close = last
        elif (last is None) and (close is not None):
            last = close
        if (last is not None) and (open is not None):
            if change is None:
                change = Precise.string_sub(last, open)
            if average is None:
                average = Precise.string_div(Precise.string_add(last, open), '2')
        if (percentage is None) and (change is not None) and (open is not None) and Precise.string_gt(open, '0'):
            percentage = Precise.string_mul(Precise.string_div(change, open), '100')
        if (change is None) and (percentage is not None) and (open is not None):
            change = Precise.string_div(Precise.string_mul(percentage, open), '100')
        if (open is None) and (last is not None) and (change is not None):
            open = Precise.string_sub(last, change)
        # timestamp and symbol operations don't belong in safeTicker
        # they should be done in the derived classes
        return self.extend(ticker, {
            'bid': self.parse_number(self.omit_zero(self.safe_number(ticker, 'bid'))),
            'bidVolume': self.safe_number(ticker, 'bidVolume'),
            'ask': self.parse_number(self.omit_zero(self.safe_number(ticker, 'ask'))),
            'askVolume': self.safe_number(ticker, 'askVolume'),
            'high': self.parse_number(self.omit_zero(self.safe_string(ticker, 'high"'))),
            'low': self.parse_number(self.omit_zero(self.safe_number(ticker, 'low'))),
            'open': self.parse_number(self.omit_zero(self.parse_number(open))),
            'close': self.parse_number(self.omit_zero(self.parse_number(close))),
            'last': self.parse_number(self.omit_zero(self.parse_number(last))),
            'change': self.parse_number(change),
            'percentage': self.parse_number(percentage),
            'average': self.parse_number(average),
            'vwap': self.parse_number(vwap),
            'baseVolume': self.parse_number(baseVolume),
            'quoteVolume': self.parse_number(quoteVolume),
            'previousClose': self.safe_number(ticker, 'previousClose'),
        })

    def fetch_borrow_rate(self, code: str, amount, params={}):
        raise NotSupported(self.id + ' fetchBorrowRate is deprecated, please use fetchCrossBorrowRate or fetchIsolatedBorrowRate instead')

    def repay_cross_margin(self, code: str, amount, params={}):
        raise NotSupported(self.id + ' repayCrossMargin is not support yet')

    def repay_isolated_margin(self, symbol: str, code: str, amount, params={}):
        raise NotSupported(self.id + ' repayIsolatedMargin is not support yet')

    def borrow_cross_margin(self, code: str, amount, params={}):
        raise NotSupported(self.id + ' borrowCrossMargin is not support yet')

    def borrow_isolated_margin(self, symbol: str, code: str, amount, params={}):
        raise NotSupported(self.id + ' borrowIsolatedMargin is not support yet')

    def borrow_margin(self, code: str, amount, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' borrowMargin is deprecated, please use borrowCrossMargin or borrowIsolatedMargin instead')

    def repay_margin(self, code: str, amount, symbol: Str = None, params={}):
        raise NotSupported(self.id + ' repayMargin is deprecated, please use repayCrossMargin or repayIsolatedMargin instead')

    def fetch_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        message = ''
        if self.has['fetchTrades']:
            message = '. If you want to build OHLCV candles from trade executions data, visit https://github.com/ccxt/ccxt/tree/master/examples/ and see "build-ohlcv-bars" file'
        raise NotSupported(self.id + ' fetchOHLCV() is not supported yet' + message)

    def watch_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOHLCV() is not supported yet')

    def convert_trading_view_to_ohlcv(self, ohlcvs, timestamp='t', open='o', high='h', low='l', close='c', volume='v', ms=False):
        result = []
        timestamps = self.safe_value(ohlcvs, timestamp, [])
        opens = self.safe_value(ohlcvs, open, [])
        highs = self.safe_value(ohlcvs, high, [])
        lows = self.safe_value(ohlcvs, low, [])
        closes = self.safe_value(ohlcvs, close, [])
        volumes = self.safe_value(ohlcvs, volume, [])
        for i in range(0, len(timestamps)):
            result.append([
                self.safe_integer(timestamps, i) if ms else self.safe_timestamp(timestamps, i),
                self.safe_value(opens, i),
                self.safe_value(highs, i),
                self.safe_value(lows, i),
                self.safe_value(closes, i),
                self.safe_value(volumes, i),
            ])
        return result

    def convert_ohlcv_to_trading_view(self, ohlcvs, timestamp='t', open='o', high='h', low='l', close='c', volume='v', ms=False):
        result = {}
        result[timestamp] = []
        result[open] = []
        result[high] = []
        result[low] = []
        result[close] = []
        result[volume] = []
        for i in range(0, len(ohlcvs)):
            ts = ohlcvs[i][0] if ms else self.parseToInt(ohlcvs[i][0] / 1000)
            result[timestamp].append(ts)
            result[open].append(ohlcvs[i][1])
            result[high].append(ohlcvs[i][2])
            result[low].append(ohlcvs[i][3])
            result[close].append(ohlcvs[i][4])
            result[volume].append(ohlcvs[i][5])
        return result

    def fetch_web_endpoint(self, method, endpointMethod, returnAsJson, startRegex=None, endRegex=None):
        errorMessage = ''
        options = self.safe_value(self.options, method, {})
        muteOnFailure = self.safe_value(options, 'webApiMuteFailure', True)
        try:
            # if it was not explicitly disabled, then don't fetch
            if self.safe_value(options, 'webApiEnable', True) is not True:
                return None
            maxRetries = self.safe_value(options, 'webApiRetries', 10)
            response = None
            retry = 0
            while(retry < maxRetries):
                try:
                    response = getattr(self, endpointMethod)({})
                    break
                except Exception as e:
                    retry = retry + 1
                    if retry == maxRetries:
                        raise e
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

    def market_ids(self, symbols):
        if symbols is None:
            return symbols
        result = []
        for i in range(0, len(symbols)):
            result.append(self.market_id(symbols[i]))
        return result

    def market_symbols(self, symbols, type: str = None, allowEmpty=True, sameTypeOnly=False, sameSubTypeOnly=False):
        if symbols is None:
            if not allowEmpty:
                raise ArgumentsRequired(self.id + ' empty list of symbols is not supported')
            return symbols
        symbolsLength = len(symbols)
        if symbolsLength == 0:
            if not allowEmpty:
                raise ArgumentsRequired(self.id + ' empty list of symbols is not supported')
            return symbols
        result = []
        marketType = None
        isLinearSubType = None
        for i in range(0, len(symbols)):
            market = self.market(symbols[i])
            if sameTypeOnly and (marketType is not None):
                if market['type'] != marketType:
                    raise BadRequest(self.id + ' symbols must be of the same type, either ' + marketType + ' or ' + market['type'] + '.')
            if sameSubTypeOnly and (isLinearSubType is not None):
                if market['linear'] != isLinearSubType:
                    raise BadRequest(self.id + ' symbols must be of the same subType, either linear or inverse.')
            if type is not None and market['type'] != type:
                raise BadRequest(self.id + ' symbols must be of the same type ' + type + '. If the type is incorrect you can change it in options or the params of the request')
            marketType = market['type']
            if not market['spot']:
                isLinearSubType = market['linear']
            symbol = self.safe_string(market, 'symbol', symbols[i])
            result.append(symbol)
        return result

    def market_codes(self, codes):
        if codes is None:
            return codes
        result = []
        for i in range(0, len(codes)):
            result.append(self.common_currency_code(codes[i]))
        return result

    def parse_bids_asks(self, bidasks, priceKey: IndexType = 0, amountKey: IndexType = 1):
        bidasks = self.to_array(bidasks)
        result = []
        for i in range(0, len(bidasks)):
            result.append(self.parse_bid_ask(bidasks[i], priceKey, amountKey))
        return result

    def fetch_l2_order_book(self, symbol: str, limit: Int = None, params={}):
        orderbook = self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
        })

    def filter_by_symbol(self, objects, symbol: str = None):
        if symbol is None:
            return objects
        result = []
        for i in range(0, len(objects)):
            objectSymbol = self.safe_string(objects[i], 'symbol')
            if objectSymbol == symbol:
                result.append(objects[i])
        return result

    def parse_ohlcv(self, ohlcv, market: Market = None) -> list:
        if isinstance(ohlcv, list):
            return [
                self.safe_integer(ohlcv, 0),  # timestamp
                self.safe_number(ohlcv, 1),  # open
                self.safe_number(ohlcv, 2),  # high
                self.safe_number(ohlcv, 3),  # low
                self.safe_number(ohlcv, 4),  # close
                self.safe_number(ohlcv, 5),  # volume
            ]
        return ohlcv

    def network_code_to_id(self, networkCode, currencyCode=None):
        """
         * @ignore
        tries to convert the provided networkCode(which is expected to be an unified network code) to a network id. In order to achieve self, derived class needs to have 'options->networks' defined.
        :param str networkCode: unified network code
        :param str currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns str|None: exchange-specific network id
        """
        networkIdsByCodes = self.safe_value(self.options, 'networks', {})
        networkId = self.safe_string(networkIdsByCodes, networkCode)
        # for example, if 'ETH' is passed for networkCode, but 'ETH' key not defined in `options->networks` object
        if networkId is None:
            if currencyCode is None:
                # if currencyCode was not provided, then we just set passed value to networkId
                networkId = networkCode
            else:
                # if currencyCode was provided, then we try to find if that currencyCode has a replacement(i.e. ERC20 for ETH)
                defaultNetworkCodeReplacements = self.safe_value(self.options, 'defaultNetworkCodeReplacements', {})
                if currencyCode in defaultNetworkCodeReplacements:
                    # if there is a replacement for the passed networkCode, then we use it to find network-id in `options->networks` object
                    replacementObject = defaultNetworkCodeReplacements[currencyCode]  # i.e. {'ERC20': 'ETH'}
                    keys = list(replacementObject.keys())
                    for i in range(0, len(keys)):
                        key = keys[i]
                        value = replacementObject[key]
                        # if value matches to provided unified networkCode, then we use it's key to find network-id in `options->networks` object
                        if value == networkCode:
                            networkId = self.safe_string(networkIdsByCodes, key)
                            break
                # if it wasn't found, we just set the provided value to network-id
                if networkId is None:
                    networkId = networkCode
        return networkId

    def network_id_to_code(self, networkId, currencyCode=None):
        """
         * @ignore
        tries to convert the provided exchange-specific networkId to an unified network Code. In order to achieve self, derived class needs to have "options['networksById']" defined.
        :param str networkId: exchange specific network id/title, like: TRON, Trc-20, usdt-erc20, etc
        :param str|None currencyCode: unified currency code, but self argument is not required by default, unless there is an exchange(like huobi) that needs an override of the method to be able to pass currencyCode argument additionally
        :returns str|None: unified network code
        """
        networkCodesByIds = self.safe_value(self.options, 'networksById', {})
        networkCode = self.safe_string(networkCodesByIds, networkId, networkId)
        # replace mainnet network-codes(i.e. ERC20->ETH)
        if currencyCode is not None:
            defaultNetworkCodeReplacements = self.safe_value(self.options, 'defaultNetworkCodeReplacements', {})
            if currencyCode in defaultNetworkCodeReplacements:
                replacementObject = self.safe_value(defaultNetworkCodeReplacements, currencyCode, {})
                networkCode = self.safe_string(replacementObject, networkCode, networkCode)
        return networkCode

    def handle_network_code_and_params(self, params):
        networkCodeInParams = self.safe_string_2(params, 'networkCode', 'network')
        if networkCodeInParams is not None:
            params = self.omit(params, ['networkCode', 'network'])
        # if it was not defined by user, we should not set it from 'defaultNetworks', because handleNetworkCodeAndParams is for only request-side and thus we do not fill it with anything. We can only use 'defaultNetworks' after parsing response-side
        return [networkCodeInParams, params]

    def default_network_code(self, currencyCode):
        defaultNetworkCode = None
        defaultNetworks = self.safe_value(self.options, 'defaultNetworks', {})
        if currencyCode in defaultNetworks:
            # if currency had set its network in "defaultNetworks", use it
            defaultNetworkCode = defaultNetworks[currencyCode]
        else:
            # otherwise, try to use the global-scope 'defaultNetwork' value(even if that network is not supported by currency, it doesn't make any problem, self will be just used "at first" if currency supports self network at all)
            defaultNetwork = self.safe_value(self.options, 'defaultNetwork')
            if defaultNetwork is not None:
                defaultNetworkCode = defaultNetwork
        return defaultNetworkCode

    def select_network_code_from_unified_networks(self, currencyCode, networkCode, indexedNetworkEntries):
        return self.select_network_key_from_networks(currencyCode, networkCode, indexedNetworkEntries, True)

    def select_network_id_from_raw_networks(self, currencyCode, networkCode, indexedNetworkEntries):
        return self.select_network_key_from_networks(currencyCode, networkCode, indexedNetworkEntries, False)

    def select_network_key_from_networks(self, currencyCode, networkCode, indexedNetworkEntries, isIndexedByUnifiedNetworkCode=False):
        # self method is used against raw & unparse network entries, which are just indexed by network id
        chosenNetworkId = None
        availableNetworkIds = list(indexedNetworkEntries.keys())
        responseNetworksLength = len(availableNetworkIds)
        if networkCode is not None:
            if responseNetworksLength == 0:
                raise NotSupported(self.id + ' - ' + networkCode + ' network did not return any result for ' + currencyCode)
            else:
                # if networkCode was provided by user, we should check it after response, referenced exchange doesn't support network-code during request
                networkId = networkCode if isIndexedByUnifiedNetworkCode else self.network_code_to_id(networkCode, currencyCode)
                if networkId in indexedNetworkEntries:
                    chosenNetworkId = networkId
                else:
                    raise NotSupported(self.id + ' - ' + networkId + ' network was not found for ' + currencyCode + ', use one of ' + ', '.join(availableNetworkIds))
        else:
            if responseNetworksLength == 0:
                raise NotSupported(self.id + ' - no networks were returned for ' + currencyCode)
            else:
                # if networkCode was not provided by user, then we try to use the default network(if it was defined in "defaultNetworks"), otherwise, we just return the first network entry
                defaultNetworkCode = self.default_network_code(currencyCode)
                defaultNetworkId = defaultNetworkCode if isIndexedByUnifiedNetworkCode else self.network_code_to_id(defaultNetworkCode, currencyCode)
                chosenNetworkId = defaultNetworkId if (defaultNetworkId in indexedNetworkEntries) else availableNetworkIds[0]
        return chosenNetworkId

    def safe_number_2(self, dictionary, key1, key2, d=None):
        value = self.safe_string_2(dictionary, key1, key2)
        return self.parse_number(value, d)

    def parse_order_book(self, orderbook: object, symbol: str, timestamp: Int = None, bidsKey='bids', asksKey='asks', priceKey: IndexType = 0, amountKey: IndexType = 1):
        bids = self.parse_bids_asks(self.safe_value(orderbook, bidsKey, []), priceKey, amountKey)
        asks = self.parse_bids_asks(self.safe_value(orderbook, asksKey, []), priceKey, amountKey)
        return {
            'symbol': symbol,
            'bids': self.sort_by(bids, 0, True),
            'asks': self.sort_by(asks, 0),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'nonce': None,
        }

    def parse_ohlcvs(self, ohlcvs: List[object], market: Any = None, timeframe: str = '1m', since: Int = None, limit: Int = None):
        results = []
        for i in range(0, len(ohlcvs)):
            results.append(self.parse_ohlcv(ohlcvs[i], market))
        sorted = self.sort_by(results, 0)
        return self.filter_by_since_limit(sorted, since, limit, 0)

    def parse_leverage_tiers(self, response, symbols: List[str] = None, marketIdKey=None):
        # marketIdKey should only be None when response is a dictionary
        symbols = self.market_symbols(symbols)
        tiers = {}
        for i in range(0, len(response)):
            item = response[i]
            id = self.safe_string(item, marketIdKey)
            market = self.safe_market(id, None, None, self.safe_string(self.options, 'defaultType'))
            symbol = market['symbol']
            contract = self.safe_value(market, 'contract', False)
            if contract and ((symbols is None) or self.in_array(symbol, symbols)):
                tiers[symbol] = self.parse_market_leverage_tiers(item, market)
        return tiers

    def load_trading_limits(self, symbols: List[str] = None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not ('limitsLoaded' in self.options):
                response = self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    def safe_position(self, position):
        # simplified version of: /pull/12765/
        unrealizedPnlString = self.safe_string(position, 'unrealisedPnl')
        initialMarginString = self.safe_string(position, 'initialMargin')
        #
        # PERCENTAGE
        #
        percentage = self.safe_value(position, 'percentage')
        if (percentage is None) and (unrealizedPnlString is not None) and (initialMarginString is not None):
            # was done in all implementations( aax, btcex, bybit, deribit, ftx, gate, kucoinfutures, phemex )
            percentageString = Precise.string_mul(Precise.string_div(unrealizedPnlString, initialMarginString, 4), '100')
            position['percentage'] = self.parse_number(percentageString)
        # if contractSize is None get from market
        contractSize = self.safe_number(position, 'contractSize')
        symbol = self.safe_string(position, 'symbol')
        market = None
        if symbol is not None:
            market = self.safe_value(self.markets, symbol)
        if contractSize is None and market is not None:
            contractSize = self.safe_number(market, 'contractSize')
            position['contractSize'] = contractSize
        return position

    def parse_positions(self, positions, symbols: List[str] = None, params={}):
        symbols = self.market_symbols(symbols)
        positions = self.to_array(positions)
        result = []
        for i in range(0, len(positions)):
            position = self.extend(self.parse_position(positions[i], None), params)
            result.append(position)
        return self.filter_by_array_positions(result, 'symbol', symbols, False)

    def parse_accounts(self, accounts, params={}):
        accounts = self.to_array(accounts)
        result = []
        for i in range(0, len(accounts)):
            account = self.extend(self.parse_account(accounts[i]), params)
            result.append(account)
        return result

    def parse_trades(self, trades, market: Market = None, since: Int = None, limit: Int = None, params={}):
        trades = self.to_array(trades)
        result = []
        for i in range(0, len(trades)):
            trade = self.extend(self.parse_trade(trades[i], market), params)
            result.append(trade)
        result = self.sort_by_2(result, 'timestamp', 'id')
        symbol = market['symbol'] if (market is not None) else None
        return self.filter_by_symbol_since_limit(result, symbol, since, limit)

    def parse_transactions(self, transactions, currency: Currency = None, since: Int = None, limit: Int = None, params={}):
        transactions = self.to_array(transactions)
        result = []
        for i in range(0, len(transactions)):
            transaction = self.extend(self.parse_transaction(transactions[i], currency), params)
            result.append(transaction)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        return self.filter_by_currency_since_limit(result, code, since, limit)

    def parse_transfers(self, transfers, currency: Currency = None, since: Int = None, limit: Int = None, params={}):
        transfers = self.to_array(transfers)
        result = []
        for i in range(0, len(transfers)):
            transfer = self.extend(self.parse_transfer(transfers[i], currency), params)
            result.append(transfer)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        return self.filter_by_currency_since_limit(result, code, since, limit)

    def parse_ledger(self, data, currency: Currency = None, since: Int = None, limit: Int = None, params={}):
        result = []
        arrayData = self.to_array(data)
        for i in range(0, len(arrayData)):
            itemOrItems = self.parse_ledger_entry(arrayData[i], currency)
            if isinstance(itemOrItems, list):
                for j in range(0, len(itemOrItems)):
                    result.append(self.extend(itemOrItems[j], params))
            else:
                result.append(self.extend(itemOrItems, params))
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        return self.filter_by_currency_since_limit(result, code, since, limit)

    def nonce(self):
        return self.seconds()

    def set_headers(self, headers):
        return headers

    def market_id(self, symbol: str):
        market = self.market(symbol)
        if market is not None:
            return market['id']
        return symbol

    def symbol(self, symbol: str):
        market = self.market(symbol)
        return self.safe_string(market, 'symbol', symbol)

    def resolve_path(self, path, params):
        return [
            self.implode_params(path, params),
            self.omit(params, self.extract_params(path)),
        ]

    def filter_by_array(self, objects, key: IndexType, values=None, indexed=True):
        objects = self.to_array(objects)
        # return all of them if no values were passed
        if values is None or not values:
            return self.index_by(objects, key) if indexed else objects
        results = []
        for i in range(0, len(objects)):
            if self.in_array(objects[i][key], values):
                results.append(objects[i])
        return self.index_by(results, key) if indexed else results

    def fetch2(self, path, api: Any = 'public', method='GET', params={}, headers: Any = None, body: Any = None, config={}):
        if self.enableRateLimit:
            cost = self.calculate_rate_limiter_cost(api, method, path, params, config)
            self.throttle(cost)
        self.lastRestRequestTimestamp = self.milliseconds()
        request = self.sign(path, api, method, params, headers, body)
        self.last_request_headers = request['headers']
        self.last_request_body = request['body']
        self.last_request_url = request['url']
        return self.fetch(request['url'], request['method'], request['headers'], request['body'])

    def request(self, path, api: Any = 'public', method='GET', params={}, headers: Any = None, body: Any = None, config={}):
        return self.fetch2(path, api, method, params, headers, body, config)

    def load_accounts(self, reload=False, params={}):
        if reload:
            self.accounts = self.fetch_accounts(params)
        else:
            if self.accounts:
                return self.accounts
            else:
                self.accounts = self.fetch_accounts(params)
        self.accountsById = self.index_by(self.accounts, 'id')
        return self.accounts

    def build_ohlcvc(self, trades: List[Trade], timeframe: str = '1m', since: float = 0, limit: float = 2147483647):
        # given a sorted arrays of trades(recent last) and a timeframe builds an array of OHLCV candles
        # note, default limit value(2147483647) is max int32 value
        ms = self.parse_timeframe(timeframe) * 1000
        ohlcvs = []
        i_timestamp = 0
        # open = 1
        i_high = 2
        i_low = 3
        i_close = 4
        i_volume = 5
        i_count = 6
        tradesLength = len(trades)
        oldest = min(tradesLength, limit)
        for i in range(0, oldest):
            trade = trades[i]
            ts = trade['timestamp']
            if ts < since:
                continue
            openingTime = int(math.floor(ts / ms)) * ms  # shift to the edge of m/h/d(but not M)
            if openingTime < since:  # we don't need bars, that have opening time earlier than requested
                continue
            ohlcv_length = len(ohlcvs)
            candle = ohlcv_length - 1
            if (candle == -1) or (openingTime >= self.sum(ohlcvs[candle][i_timestamp], ms)):
                # moved to a new timeframe -> create a new candle from opening trade
                ohlcvs.append([
                    openingTime,  # timestamp
                    trade['price'],  # O
                    trade['price'],  # H
                    trade['price'],  # L
                    trade['price'],  # C
                    trade['amount'],  # V
                    1,  # count
                ])
            else:
                # still processing the same timeframe -> update opening trade
                ohlcvs[candle][i_high] = max(ohlcvs[candle][i_high], trade['price'])
                ohlcvs[candle][i_low] = min(ohlcvs[candle][i_low], trade['price'])
                ohlcvs[candle][i_close] = trade['price']
                ohlcvs[candle][i_volume] = self.sum(ohlcvs[candle][i_volume], trade['amount'])
                ohlcvs[candle][i_count] = self.sum(ohlcvs[candle][i_count], 1)
        return ohlcvs

    def parse_trading_view_ohlcv(self, ohlcvs, market=None, timeframe='1m', since: Int = None, limit: Int = None):
        result = self.convert_trading_view_to_ohlcv(ohlcvs)
        return self.parse_ohlcvs(result, market, timeframe, since, limit)

    def edit_limit_buy_order(self, id, symbol, amount, price=None, params={}):
        return self.edit_limit_order(id, symbol, 'buy', amount, price, params)

    def edit_limit_sell_order(self, id, symbol, amount, price=None, params={}):
        return self.edit_limit_order(id, symbol, 'sell', amount, price, params)

    def edit_limit_order(self, id, symbol, side, amount, price=None, params={}):
        return self.edit_order(id, symbol, 'limit', side, amount, price, params)

    def edit_order(self, id: str, symbol, type, side, amount=None, price=None, params={}):
        self.cancelOrder(id, symbol)
        return self.create_order(symbol, type, side, amount, price, params)

    def edit_order_ws(self, id: str, symbol: str, type: OrderType, side: OrderSide, amount: float, price: float = None, params={}):
        self.cancelOrderWs(id, symbol)
        return self.createOrderWs(symbol, type, side, amount, price, params)

    def fetch_permissions(self, params={}):
        raise NotSupported(self.id + ' fetchPermissions() is not supported yet')

    def fetch_position(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchPosition() is not supported yet')

    def watch_position(self, symbol: str = None, params={}):
        raise NotSupported(self.id + ' watchPosition() is not supported yet')

    def watch_positions(self, symbols: List[str] = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchPositions() is not supported yet')

    def watch_position_for_symbols(self, symbols: List[str] = None, since: Int = None, limit: Int = None, params={}):
        return self.watchPositions(symbols, since, limit, params)

    def fetch_positions_for_symbol(self, symbol: str, params={}):
        """
        fetches all open positions for specific symbol, unlike fetchPositions(which is designed to work with multiple symbols) so self method might be preffered for one-market position, because of less rate-limit consumption and speed
        :param str symbol: unified market symbol
        :param dict params: extra parameters specific to the endpoint
        :returns dict[]: a list of `position structure <https://docs.ccxt.com/#/?id=position-structure>` with maximum 3 items - possible one position for "one-way" mode, and possible two positions(long & short) for "two-way"(a.k.a. hedge) mode
        """
        raise NotSupported(self.id + ' fetchPositionsForSymbol() is not supported yet')

    def fetch_positions(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchPositions() is not supported yet')

    def fetch_positions_risk(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchPositionsRisk() is not supported yet')

    def fetch_bids_asks(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchBidsAsks() is not supported yet')

    def parse_bid_ask(self, bidask, priceKey: IndexType = 0, amountKey: IndexType = 1):
        price = self.safe_number(bidask, priceKey)
        amount = self.safe_number(bidask, amountKey)
        return [price, amount]

    def safe_currency(self, currencyId: Str, currency: Currency = None):
        if (currencyId is None) and (currency is not None):
            return currency
        if (self.currencies_by_id is not None) and (currencyId in self.currencies_by_id) and (self.currencies_by_id[currencyId] is not None):
            return self.currencies_by_id[currencyId]
        code = currencyId
        if currencyId is not None:
            code = self.common_currency_code(currencyId.upper())
        return {
            'id': currencyId,
            'code': code,
            'precision': None,
        }

    def safe_market(self, marketId: Str, market: Market = None, delimiter: Str = None, marketType: Str = None):
        result = self.safe_market_structure({
            'symbol': marketId,
            'marketId': marketId,
        })
        if marketId is not None:
            if (self.markets_by_id is not None) and (marketId in self.markets_by_id):
                markets = self.markets_by_id[marketId]
                numMarkets = len(markets)
                if numMarkets == 1:
                    return markets[0]
                else:
                    if marketType is None:
                        if market is None:
                            raise ArgumentsRequired(self.id + ' safeMarket() requires a fourth argument for ' + marketId + ' to disambiguate between different markets with the same market id')
                        else:
                            marketType = market['type']
                    for i in range(0, len(markets)):
                        currentMarket = markets[i]
                        if currentMarket[marketType]:
                            return currentMarket
            elif delimiter is not None:
                parts = marketId.split(delimiter)
                partsLength = len(parts)
                if partsLength == 2:
                    result['baseId'] = self.safe_string(parts, 0)
                    result['quoteId'] = self.safe_string(parts, 1)
                    result['base'] = self.safe_currency_code(result['baseId'])
                    result['quote'] = self.safe_currency_code(result['quoteId'])
                    result['symbol'] = result['base'] + '/' + result['quote']
                    return result
                else:
                    return result
        if market is not None:
            return market
        return result

    def check_required_credentials(self, error=True):
        keys = list(self.requiredCredentials.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if self.requiredCredentials[key] and not getattr(self, key):
                if error:
                    raise AuthenticationError(self.id + ' requires "' + key + '" credential')
                else:
                    return False
        return True

    def oath(self):
        if self.twofa is not None:
            return self.totp(self.twofa)
        else:
            raise ExchangeError(self.id + ' exchange.twofa has not been set for 2FA Two-Factor Authentication')

    def fetch_balance(self, params={}):
        raise NotSupported(self.id + ' fetchBalance() is not supported yet')

    def fetch_balance_ws(self, params={}):
        raise NotSupported(self.id + ' fetchBalanceWs() is not supported yet')

    def parse_balance(self, response):
        raise NotSupported(self.id + ' parseBalance() is not supported yet')

    def watch_balance(self, params={}):
        raise NotSupported(self.id + ' watchBalance() is not supported yet')

    def fetch_partial_balance(self, part, params={}):
        balance = self.fetch_balance(params)
        return balance[part]

    def fetch_free_balance(self, params={}):
        return self.fetch_partial_balance('free', params)

    def fetch_used_balance(self, params={}):
        return self.fetch_partial_balance('used', params)

    def fetch_total_balance(self, params={}):
        return self.fetch_partial_balance('total', params)

    def fetch_status(self, params={}):
        raise NotSupported(self.id + ' fetchStatus() is not supported yet')

    def fetch_funding_fee(self, code: str, params={}):
        warnOnFetchFundingFee = self.safe_value(self.options, 'warnOnFetchFundingFee', True)
        if warnOnFetchFundingFee:
            raise NotSupported(self.id + ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = False to suppress self warning')
        return self.fetch_transaction_fee(code, params)

    def fetch_funding_fees(self, codes: List[str] = None, params={}):
        warnOnFetchFundingFees = self.safe_value(self.options, 'warnOnFetchFundingFees', True)
        if warnOnFetchFundingFees:
            raise NotSupported(self.id + ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = False to suppress self warning')
        return self.fetch_transaction_fees(codes, params)

    def fetch_transaction_fee(self, code: str, params={}):
        if not self.has['fetchTransactionFees']:
            raise NotSupported(self.id + ' fetchTransactionFee() is not supported yet')
        return self.fetch_transaction_fees([code], params)

    def fetch_transaction_fees(self, codes: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchTransactionFees() is not supported yet')

    def fetch_deposit_withdraw_fees(self, codes: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchDepositWithdrawFees() is not supported yet')

    def fetch_deposit_withdraw_fee(self, code: str, params={}):
        if not self.has['fetchDepositWithdrawFees']:
            raise NotSupported(self.id + ' fetchDepositWithdrawFee() is not supported yet')
        fees = self.fetchDepositWithdrawFees([code], params)
        return self.safe_value(fees, code)

    def get_supported_mapping(self, key, mapping={}):
        if key in mapping:
            return mapping[key]
        else:
            raise NotSupported(self.id + ' ' + key + ' does not have a value in mapping')

    def fetch_cross_borrow_rate(self, code: str, params={}):
        self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchCrossBorrowRate() is not supported yet')
        borrowRates = self.fetchCrossBorrowRates(params)
        rate = self.safe_value(borrowRates, code)
        if rate is None:
            raise ExchangeError(self.id + ' fetchCrossBorrowRate() could not find the borrow rate for currency code ' + code)
        return rate

    def fetch_isolated_borrow_rate(self, symbol: str, params={}):
        self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchIsolatedBorrowRate() is not supported yet')
        borrowRates = self.fetchIsolatedBorrowRates(params)
        rate = self.safe_value(borrowRates, symbol)
        if rate is None:
            raise ExchangeError(self.id + ' fetchIsolatedBorrowRate() could not find the borrow rate for market symbol ' + symbol)
        return rate

    def handle_option_and_params(self, params, methodName, optionName, defaultValue=None):
        # This method can be used to obtain method specific properties, i.e: self.handle_option_and_params(params, 'fetchPosition', 'marginMode', 'isolated')
        defaultOptionName = 'default' + self.capitalize(optionName)  # we also need to check the 'defaultXyzWhatever'
        # check if params contain the key
        value = self.safe_value_2(params, optionName, defaultOptionName)
        if value is not None:
            params = self.omit(params, [optionName, defaultOptionName])
        else:
            # check if exchange has properties for self method
            exchangeWideMethodOptions = self.safe_value(self.options, methodName)
            if exchangeWideMethodOptions is not None:
                # check if the option is defined inside self method's props
                value = self.safe_value_2(exchangeWideMethodOptions, optionName, defaultOptionName)
            if value is None:
                # if it's still None, check if global exchange-wide option exists
                value = self.safe_value_2(self.options, optionName, defaultOptionName)
            # if it's still None, use the default value
            value = value if (value is not None) else defaultValue
        return [value, params]

    def handle_option(self, methodName, optionName, defaultValue=None):
        # eslint-disable-next-line no-unused-vars
        result, empty = self.handle_option_and_params({}, methodName, optionName, defaultValue)
        return result

    def handle_market_type_and_params(self, methodName: str, market: Market = None, params={}):
        defaultType = self.safe_string_2(self.options, 'defaultType', 'type', 'spot')
        methodOptions = self.safe_value(self.options, methodName)
        methodType = defaultType
        if methodOptions is not None:
            if isinstance(methodOptions, str):
                methodType = methodOptions
            else:
                methodType = self.safe_string_2(methodOptions, 'defaultType', 'type', methodType)
        marketType = methodType if (market is None) else market['type']
        type = self.safe_string_2(params, 'defaultType', 'type', marketType)
        params = self.omit(params, ['defaultType', 'type'])
        return [type, params]

    def handle_sub_type_and_params(self, methodName, market=None, params={}, defaultValue=None):
        subType = None
        # if set in params, it takes precedence
        subTypeInParams = self.safe_string_2(params, 'subType', 'defaultSubType')
        # avoid omitting if it's not present
        if subTypeInParams is not None:
            subType = subTypeInParams
            params = self.omit(params, ['subType', 'defaultSubType'])
        else:
            # at first, check from market object
            if market is not None:
                if market['linear']:
                    subType = 'linear'
                elif market['inverse']:
                    subType = 'inverse'
            # if it was not defined in market object
            if subType is None:
                values = self.handle_option_and_params(None, methodName, 'subType', defaultValue)  # no need to re-test params here
                subType = values[0]
        return [subType, params]

    def handle_margin_mode_and_params(self, methodName, params={}, defaultValue=None):
        """
         * @ignore
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns Array: the marginMode in lowercase by params["marginMode"], params["defaultMarginMode"] self.options["marginMode"] or self.options["defaultMarginMode"]
        """
        return self.handle_option_and_params(params, methodName, 'marginMode', defaultValue)

    def throw_exactly_matched_exception(self, exact, string, message):
        if string in exact:
            raise exact[string](message)

    def throw_broadly_matched_exception(self, broad, string, message):
        broadKey = self.find_broadly_matched_key(broad, string)
        if broadKey is not None:
            raise broad[broadKey](message)

    def find_broadly_matched_key(self, broad, string):
        # a helper for matching error strings exactly vs broadly
        keys = list(broad.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if string is not None:  # #issues/12698
                if string.find(key) >= 0:
                    return key
        return None

    def handle_errors(self, statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody):
        # it is a stub method that must be overrided in the derived exchange classes
        # raise NotSupported(self.id + ' handleErrors() not implemented yet')
        return None

    def calculate_rate_limiter_cost(self, api, method, path, params, config={}):
        return self.safe_value(config, 'cost', 1)

    def fetch_ticker(self, symbol: str, params={}):
        if self.has['fetchTickers']:
            self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            tickers = self.fetch_tickers([symbol], params)
            ticker = self.safe_value(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchTickers() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTicker() is not supported yet')

    def watch_ticker(self, symbol: str, params={}):
        raise NotSupported(self.id + ' watchTicker() is not supported yet')

    def fetch_tickers(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    def fetch_order_books(self, symbols: List[str] = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderBooks() is not supported yet')

    def watch_tickers(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' watchTickers() is not supported yet')

    def fetch_order(self, id: str, symbol: str = None, params={}):
        raise NotSupported(self.id + ' fetchOrder() is not supported yet')

    def fetch_order_ws(self, id: str, symbol: str = None, params={}):
        raise NotSupported(self.id + ' fetchOrderWs() is not supported yet')

    def fetch_order_status(self, id: str, symbol: str = None, params={}):
        # TODO: TypeScript: change method signature by replacing
        # Promise<string> with Promise<Order['status']>.
        order = self.fetch_order(id, symbol, params)
        return order['status']

    def fetch_unified_order(self, order, params={}):
        return self.fetch_order(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def create_order(self, symbol: str, type: OrderType, side: OrderSide, amount, price=None, params={}):
        raise NotSupported(self.id + ' createOrder() is not supported yet')

    def create_orders(self, orders: List[OrderRequest], params={}):
        raise NotSupported(self.id + ' createOrders() is not supported yet')

    def create_order_ws(self, symbol: str, type: OrderType, side: OrderSide, amount: float, price: float = None, params={}):
        raise NotSupported(self.id + ' createOrderWs() is not supported yet')

    def cancel_order(self, id: str, symbol: str = None, params={}):
        raise NotSupported(self.id + ' cancelOrder() is not supported yet')

    def cancel_order_ws(self, id: str, symbol: str = None, params={}):
        raise NotSupported(self.id + ' cancelOrderWs() is not supported yet')

    def cancel_orders_ws(self, ids: List[str], symbol: str = None, params={}):
        raise NotSupported(self.id + ' cancelOrdersWs() is not supported yet')

    def cancel_all_orders(self, symbol: str = None, params={}):
        raise NotSupported(self.id + ' cancelAllOrders() is not supported yet')

    def cancel_all_orders_ws(self, symbol: str = None, params={}):
        raise NotSupported(self.id + ' cancelAllOrdersWs() is not supported yet')

    def cancel_unified_order(self, order, params={}):
        return self.cancelOrder(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    def fetch_orders(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrders() is not supported yet')

    def fetch_order_trades(self, id: str, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOrderTrades() is not supported yet')

    def watch_orders(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchOrders() is not supported yet')

    def fetch_open_orders(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOpenOrders() is not supported yet')

    def fetch_open_orders_ws(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOpenOrdersWs() is not supported yet')

    def fetch_closed_orders(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchClosedOrders() is not supported yet')

    def fetch_my_trades(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyTrades() is not supported yet')

    def fetch_my_liquidations(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyLiquidations() is not supported yet')

    def fetch_liquidations(self, symbol: str, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchLiquidations() is not supported yet')

    def fetch_my_trades_ws(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchMyTradesWs() is not supported yet')

    def watch_my_trades(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' watchMyTrades() is not supported yet')

    def fetch_ohlcv_ws(self, symbol: str, timeframe: str = '1m', since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchOHLCVWs() is not supported yet')

    def fetch_greeks(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchGreeks() is not supported yet')

    def fetch_deposits_withdrawals(self, code: str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetch history of deposits and withdrawals
        :param str [code]: unified currency code for the currency of the deposit/withdrawals, default is None
        :param int [since]: timestamp in ms of the earliest deposit/withdrawal, default is None
        :param int [limit]: max number of deposit/withdrawals to return, default is None
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: a list of `transaction structures <https://docs.ccxt.com/#/?id=transaction-structure>`
        """
        raise NotSupported(self.id + ' fetchDepositsWithdrawals() is not supported yet')

    def fetch_deposits(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchDeposits() is not supported yet')

    def fetch_withdrawals(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchWithdrawals() is not supported yet')

    def fetch_open_interest(self, symbol: str, params={}):
        raise NotSupported(self.id + ' fetchOpenInterest() is not supported yet')

    def fetch_funding_rate_history(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchFundingRateHistory() is not supported yet')

    def fetch_funding_history(self, symbol: str = None, since: Int = None, limit: Int = None, params={}):
        raise NotSupported(self.id + ' fetchFundingHistory() is not supported yet')

    def parse_last_price(self, price, market: Market = None):
        raise NotSupported(self.id + ' parseLastPrice() is not supported yet')

    def fetch_deposit_address(self, code: str, params={}):
        if self.has['fetchDepositAddresses']:
            depositAddresses = self.fetchDepositAddresses([code], params)
            depositAddress = self.safe_value(depositAddresses, code)
            if depositAddress is None:
                raise InvalidAddress(self.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return depositAddress
        else:
            raise NotSupported(self.id + ' fetchDepositAddress() is not supported yet')

    def account(self) -> Account:
        return {
            'free': None,
            'used': None,
            'total': None,
        }

    def common_currency_code(self, currency: str):
        if not self.substituteCommonCurrencyCodes:
            return currency
        return self.safe_string(self.commonCurrencies, currency, currency)

    def currency(self, code):
        if self.currencies is None:
            raise ExchangeError(self.id + ' currencies not loaded')
        if isinstance(code, str):
            if code in self.currencies:
                return self.currencies[code]
            elif code in self.currencies_by_id:
                return self.currencies_by_id[code]
        raise ExchangeError(self.id + ' does not have currency code ' + code)

    def market(self, symbol: str):
        if self.markets is None:
            raise ExchangeError(self.id + ' markets not loaded')
        if symbol in self.markets:
            return self.markets[symbol]
        elif symbol in self.markets_by_id:
            markets = self.markets_by_id[symbol]
            defaultType = self.safe_string_2(self.options, 'defaultType', 'defaultSubType', 'spot')
            for i in range(0, len(markets)):
                market = markets[i]
                if market[defaultType]:
                    return market
            return markets[0]
        raise BadSymbol(self.id + ' does not have market symbol ' + symbol)

    def handle_withdraw_tag_and_params(self, tag, params):
        if isinstance(tag, dict):
            params = self.extend(tag, params)
            tag = None
        if tag is None:
            tag = self.safe_string(params, 'tag')
            if tag is not None:
                params = self.omit(params, 'tag')
        return [tag, params]

    def create_limit_order(self, symbol: str, side: OrderSide, amount, price, params={}):
        return self.create_order(symbol, 'limit', side, amount, price, params)

    def create_market_order(self, symbol: str, side: OrderSide, amount, price=None, params={}):
        return self.create_order(symbol, 'market', side, amount, price, params)

    def create_limit_buy_order(self, symbol: str, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'buy', amount, price, params)

    def create_limit_sell_order(self, symbol: str, amount, price, params={}):
        return self.create_order(symbol, 'limit', 'sell', amount, price, params)

    def create_market_buy_order(self, symbol: str, amount, params={}):
        return self.create_order(symbol, 'market', 'buy', amount, None, params)

    def create_market_sell_order(self, symbol: str, amount, params={}):
        return self.create_order(symbol, 'market', 'sell', amount, None, params)

    def cost_to_precision(self, symbol: str, cost):
        market = self.market(symbol)
        return self.decimal_to_precision(cost, TRUNCATE, market['precision']['price'], self.precisionMode, self.paddingMode)

    def price_to_precision(self, symbol: str, price):
        market = self.market(symbol)
        result = self.decimal_to_precision(price, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)
        if result == '0':
            raise InvalidOrder(self.id + ' price of ' + market['symbol'] + ' must be greater than minimum price precision of ' + self.number_to_string(market['precision']['price']))
        return result

    def amount_to_precision(self, symbol: str, amount):
        market = self.market(symbol)
        result = self.decimal_to_precision(amount, TRUNCATE, market['precision']['amount'], self.precisionMode, self.paddingMode)
        if result == '0':
            raise InvalidOrder(self.id + ' amount of ' + market['symbol'] + ' must be greater than minimum amount precision of ' + self.number_to_string(market['precision']['amount']))
        return result

    def fee_to_precision(self, symbol: str, fee):
        market = self.market(symbol)
        return self.decimal_to_precision(fee, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)

    def currency_to_precision(self, code: str, fee, networkCode=None):
        currency = self.currencies[code]
        precision = self.safe_value(currency, 'precision')
        if networkCode is not None:
            networks = self.safe_value(currency, 'networks', {})
            networkItem = self.safe_value(networks, networkCode, {})
            precision = self.safe_value(networkItem, 'precision', precision)
        if precision is None:
            return self.forceString(fee)
        else:
            return self.decimal_to_precision(fee, ROUND, precision, self.precisionMode, self.paddingMode)

    def force_string(self, value):
        if not isinstance(value, str):
            return self.number_to_string(value)
        return value

    def is_tick_precision(self):
        return self.precisionMode == TICK_SIZE

    def is_decimal_precision(self):
        return self.precisionMode == DECIMAL_PLACES

    def is_significant_precision(self):
        return self.precisionMode == SIGNIFICANT_DIGITS

    def safe_number(self, obj: object, key: IndexType, defaultNumber: float = None):
        value = self.safe_string(obj, key)
        return self.parse_number(value, defaultNumber)

    def safe_number_n(self, obj: object, arr: List[IndexType], defaultNumber: float = None):
        value = self.safe_string_n(obj, arr)
        return self.parse_number(value, defaultNumber)

    def parse_precision(self, precision: str):
        """
         * @ignore
        :param str precision: The number of digits to the right of the decimal
        :returns str: a string number equal to 1e-precision
        """
        if precision is None:
            return None
        precisionNumber = int(precision)
        if precisionNumber == 0:
            return '1'
        parsedPrecision = '0.'
        for i in range(0, precisionNumber - 1):
            parsedPrecision = parsedPrecision + '0'
        return parsedPrecision + '1'

    def load_time_difference(self, params={}):
        serverTime = self.fetch_time(params)
        after = self.milliseconds()
        self.options['timeDifference'] = after - serverTime
        return self.options['timeDifference']

    def implode_hostname(self, url: str):
        return self.implode_params(url, {'hostname': self.hostname})

    def fetch_market_leverage_tiers(self, symbol: str, params={}):
        if self.has['fetchLeverageTiers']:
            market = self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchMarketLeverageTiers() supports contract markets only')
            tiers = self.fetch_leverage_tiers([symbol])
            return self.safe_value(tiers, symbol)
        else:
            raise NotSupported(self.id + ' fetchMarketLeverageTiers() is not supported yet')

    def create_post_only_order(self, symbol: str, type: OrderType, side: OrderSide, amount, price, params={}):
        if not self.has['createPostOnlyOrder']:
            raise NotSupported(self.id + 'createPostOnlyOrder() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_reduce_only_order(self, symbol: str, type: OrderType, side: OrderSide, amount, price, params={}):
        if not self.has['createReduceOnlyOrder']:
            raise NotSupported(self.id + 'createReduceOnlyOrder() is not supported yet')
        query = self.extend(params, {'reduceOnly': True})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_stop_order(self, symbol: str, type: OrderType, side: OrderSide, amount, price=None, stopPrice=None, params={}):
        if not self.has['createStopOrder']:
            raise NotSupported(self.id + ' createStopOrder() is not supported yet')
        if stopPrice is None:
            raise ArgumentsRequired(self.id + ' create_stop_order() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, type, side, amount, price, query)

    def create_stop_limit_order(self, symbol: str, side: OrderSide, amount, price, stopPrice, params={}):
        if not self.has['createStopLimitOrder']:
            raise NotSupported(self.id + ' createStopLimitOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, 'limit', side, amount, price, query)

    def create_stop_market_order(self, symbol: str, side: OrderSide, amount, stopPrice, params={}):
        if not self.has['createStopMarketOrder']:
            raise NotSupported(self.id + ' createStopMarketOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return self.create_order(symbol, 'market', side, amount, None, query)

    def safe_currency_code(self, currencyId: Str, currency: Currency = None):
        currency = self.safe_currency(currencyId, currency)
        return currency['code']

    def filter_by_symbol_since_limit(self, array, symbol: str = None, since: Int = None, limit: Int = None, tail=False):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit, 'timestamp', tail)

    def filter_by_currency_since_limit(self, array, code=None, since: Int = None, limit: Int = None, tail=False):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit, 'timestamp', tail)

    def filter_by_symbols_since_limit(self, array, symbols: List[str] = None, since: Int = None, limit: Int = None, tail=False):
        result = self.filter_by_array(array, 'symbol', symbols, False)
        return self.filter_by_since_limit(result, since, limit, 'timestamp', tail)

    def parse_last_prices(self, pricesData, symbols: List[str] = None, params={}):
        #
        # the value of tickers is either a dict or a list
        #
        # dict
        #
        #     {
        #         'marketId1': {...},
        #         'marketId2': {...},
        #         ...
        #     }
        #
        # list
        #
        #     [
        #         {'market': 'marketId1', ...},
        #         {'market': 'marketId2', ...},
        #         ...
        #     ]
        #
        results = []
        if isinstance(pricesData, list):
            for i in range(0, len(pricesData)):
                priceData = self.extend(self.parseLastPrice(pricesData[i]), params)
                results.append(priceData)
        else:
            marketIds = list(pricesData.keys())
            for i in range(0, len(marketIds)):
                marketId = marketIds[i]
                market = self.safe_market(marketId)
                priceData = self.extend(self.parseLastPrice(pricesData[marketId], market), params)
                results.append(priceData)
        symbols = self.market_symbols(symbols)
        return self.filter_by_array(results, 'symbol', symbols)

    def parse_tickers(self, tickers, symbols: List[str] = None, params={}):
        #
        # the value of tickers is either a dict or a list
        #
        # dict
        #
        #     {
        #         'marketId1': {...},
        #         'marketId2': {...},
        #         'marketId3': {...},
        #         ...
        #     }
        #
        # list
        #
        #     [
        #         {'market': 'marketId1', ...},
        #         {'market': 'marketId2', ...},
        #         {'market': 'marketId3', ...},
        #         ...
        #     ]
        #
        results = []
        if isinstance(tickers, list):
            for i in range(0, len(tickers)):
                ticker = self.extend(self.parse_ticker(tickers[i]), params)
                results.append(ticker)
        else:
            marketIds = list(tickers.keys())
            for i in range(0, len(marketIds)):
                marketId = marketIds[i]
                market = self.safe_market(marketId)
                ticker = self.extend(self.parse_ticker(tickers[marketId], market), params)
                results.append(ticker)
        symbols = self.market_symbols(symbols)
        return self.filter_by_array(results, 'symbol', symbols)

    def parse_deposit_addresses(self, addresses, codes: List[str] = None, indexed=True, params={}):
        result = []
        for i in range(0, len(addresses)):
            address = self.extend(self.parse_deposit_address(addresses[i]), params)
            result.append(address)
        if codes is not None:
            result = self.filter_by_array(result, 'currency', codes, False)
        if indexed:
            return self.index_by(result, 'currency')
        return result

    def parse_borrow_interests(self, response, market: Market = None):
        interests = []
        for i in range(0, len(response)):
            row = response[i]
            interests.append(self.parse_borrow_interest(row, market))
        return interests

    def parse_funding_rate_histories(self, response, market=None, since: Int = None, limit: Int = None):
        rates = []
        for i in range(0, len(response)):
            entry = response[i]
            rates.append(self.parse_funding_rate_history(entry, market))
        sorted = self.sort_by(rates, 'timestamp')
        symbol = None if (market is None) else market['symbol']
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def safe_symbol(self, marketId: Str, market: Market = None, delimiter: Str = None, marketType: Str = None):
        market = self.safe_market(marketId, market, delimiter, marketType)
        return market['symbol']

    def parse_funding_rate(self, contract: str, market: Market = None):
        raise NotSupported(self.id + ' parseFundingRate() is not supported yet')

    def parse_funding_rates(self, response, market: Market = None):
        result = {}
        for i in range(0, len(response)):
            parsed = self.parse_funding_rate(response[i], market)
            result[parsed['symbol']] = parsed
        return result

    def is_trigger_order(self, params):
        isTrigger = self.safe_value_2(params, 'trigger', 'stop')
        if isTrigger:
            params = self.omit(params, ['trigger', 'stop'])
        return [isTrigger, params]

    def is_post_only(self, isMarketOrder: bool, exchangeSpecificParam, params={}):
        """
         * @ignore
        :param str type: Order type
        :param boolean exchangeSpecificParam: exchange specific postOnly
        :param dict [params]: exchange specific params
        :returns boolean: True if a post only order, False otherwise
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')
        postOnly = self.safe_value_2(params, 'postOnly', 'post_only', False)
        # we assume timeInForce is uppercase from safeStringUpper(params, 'timeInForce')
        ioc = timeInForce == 'IOC'
        fok = timeInForce == 'FOK'
        timeInForcePostOnly = timeInForce == 'PO'
        postOnly = postOnly or timeInForcePostOnly or exchangeSpecificParam
        if postOnly:
            if ioc or fok:
                raise InvalidOrder(self.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce)
            elif isMarketOrder:
                raise InvalidOrder(self.id + ' market orders cannot be postOnly')
            else:
                return True
        else:
            return False

    def handle_post_only(self, isMarketOrder: bool, exchangeSpecificPostOnlyOption: bool, params: Any = {}):
        """
         * @ignore
        :param str type: Order type
        :param boolean exchangeSpecificBoolean: exchange specific postOnly
        :param dict [params]: exchange specific params
        :returns Array:
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')
        postOnly = self.safe_value(params, 'postOnly', False)
        ioc = timeInForce == 'IOC'
        fok = timeInForce == 'FOK'
        po = timeInForce == 'PO'
        postOnly = postOnly or po or exchangeSpecificPostOnlyOption
        if postOnly:
            if ioc or fok:
                raise InvalidOrder(self.id + ' postOnly orders cannot have timeInForce equal to ' + timeInForce)
            elif isMarketOrder:
                raise InvalidOrder(self.id + ' market orders cannot be postOnly')
            else:
                if po:
                    params = self.omit(params, 'timeInForce')
                params = self.omit(params, 'postOnly')
                return [True, params]
        return [False, params]

    def fetch_last_prices(self, symbols: List[str] = None, params={}):
        raise NotSupported(self.id + ' fetchLastPrices() is not supported yet')

    def fetch_trading_fees(self, params={}):
        raise NotSupported(self.id + ' fetchTradingFees() is not supported yet')

    def fetch_trading_fee(self, symbol: str, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported(self.id + ' fetchTradingFee() is not supported yet')
        return self.fetch_trading_fees(params)

    def parse_open_interest(self, interest, market: Market = None):
        raise NotSupported(self.id + ' parseOpenInterest() is not supported yet')

    def parse_open_interests(self, response, market=None, since: Int = None, limit: Int = None):
        interests = []
        for i in range(0, len(response)):
            entry = response[i]
            interest = self.parse_open_interest(entry, market)
            interests.append(interest)
        sorted = self.sort_by(interests, 'timestamp')
        symbol = self.safe_string(market, 'symbol')
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def fetch_funding_rate(self, symbol: str, params={}):
        if self.has['fetchFundingRates']:
            self.load_markets()
            market = self.market(symbol)
            symbol = market['symbol']
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchFundingRate() supports contract markets only')
            rates = self.fetchFundingRates([symbol], params)
            rate = self.safe_value(rates, symbol)
            if rate is None:
                raise NullResponse(self.id + ' fetchFundingRate() returned no data for ' + symbol)
            else:
                return rate
        else:
            raise NotSupported(self.id + ' fetchFundingRate() is not supported yet')

    def fetch_mark_ohlcv(self, symbol, timeframe='1m', since: Int = None, limit: Int = None, params={}):
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
            request = {
                'price': 'mark',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchMarkOHLCV() is not supported yet')

    def fetch_index_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
        """
        fetches historical index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int [since]: timestamp in ms of the earliest candle to fetch
        :param int [limit]: the maximum amount of candles to fetch
        :param dict [params]: extra parameters specific to the exchange API endpoint
         * @returns {} A list of candles ordered, open, high, low, close, None
        """
        if self.has['fetchIndexOHLCV']:
            request = {
                'price': 'index',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchIndexOHLCV() is not supported yet')

    def fetch_premium_index_ohlcv(self, symbol: str, timeframe='1m', since: Int = None, limit: Int = None, params={}):
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
            request = {
                'price': 'premiumIndex',
            }
            return self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchPremiumIndexOHLCV() is not supported yet')

    def handle_time_in_force(self, params={}):
        """
         * @ignore
         * * Must add timeInForce to self.options to use self method
        :return string returns: the exchange specific value for timeInForce
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')  # supported values GTC, IOC, PO
        if timeInForce is not None:
            exchangeValue = self.safe_string(self.options['timeInForce'], timeInForce)
            if exchangeValue is None:
                raise ExchangeError(self.id + ' does not support timeInForce "' + timeInForce + '"')
            return exchangeValue
        return None

    def convert_type_to_account(self, account):
        """
         * @ignore
         * * Must add accountsByType to self.options to use self method
        :param str account: key for account name in self.options['accountsByType']
        :returns: the exchange specific account name or the isolated margin id for transfers
        """
        accountsByType = self.safe_value(self.options, 'accountsByType', {})
        lowercaseAccount = account.lower()
        if lowercaseAccount in accountsByType:
            return accountsByType[lowercaseAccount]
        elif (account in self.markets) or (account in self.markets_by_id):
            market = self.market(account)
            return market['id']
        else:
            return account

    def check_required_argument(self, methodName, argument, argumentName, options=[]):
        """
         * @ignore
        :param str methodName: the name of the method that the argument is being checked for
        :param str argument: the argument's actual value provided
        :param str argumentName: the name of the argument being checked(for logging purposes)
        :param str[] options: a list of options that the argument can be
        :returns None:
        """
        optionsLength = len(options)
        if (argument is None) or ((optionsLength > 0) and (not(self.in_array(argument, options)))):
            messageOptions = ', '.join(options)
            message = self.id + ' ' + methodName + '() requires a ' + argumentName + ' argument'
            if messageOptions != '':
                message += ', one of ' + '(' + messageOptions + ')'
            raise ArgumentsRequired(message)

    def check_required_margin_argument(self, methodName: str, symbol: str, marginMode: str):
        """
         * @ignore
        :param str symbol: unified symbol of the market
        :param str methodName: name of the method that requires a symbol
        :param str marginMode: is either 'isolated' or 'cross'
        """
        if (marginMode == 'isolated') and (symbol is None):
            raise ArgumentsRequired(self.id + ' ' + methodName + '() requires a symbol argument for isolated margin')
        elif (marginMode == 'cross') and (symbol is not None):
            raise ArgumentsRequired(self.id + ' ' + methodName + '() cannot have a symbol argument for cross margin')

    def parse_deposit_withdraw_fees(self, response, codes: List[str] = None, currencyIdKey=None):
        """
         * @ignore
        :param object[]|dict response: unparsed response from the exchange
        :param str[]|None codes: the unified currency codes to fetch transactions fees for, returns all currencies when None
        :param str currencyIdKey: *should only be None when response is a dictionary* the object key that corresponds to the currency id
        :returns dict: objects with withdraw and deposit fees, indexed by currency codes
        """
        depositWithdrawFees = {}
        codes = self.marketCodes(codes)
        isArray = isinstance(response, list)
        responseKeys = response
        if not isArray:
            responseKeys = list(response.keys())
        for i in range(0, len(responseKeys)):
            entry = responseKeys[i]
            dictionary = entry if isArray else response[entry]
            currencyId = self.safe_string(dictionary, currencyIdKey) if isArray else entry
            currency = self.safe_value(self.currencies_by_id, currencyId)
            code = self.safe_string(currency, 'code', currencyId)
            if (codes is None) or (self.in_array(code, codes)):
                depositWithdrawFees[code] = self.parseDepositWithdrawFee(dictionary, currency)
        return depositWithdrawFees

    def parse_deposit_withdraw_fee(self, fee, currency: Currency = None):
        raise NotSupported(self.id + ' parseDepositWithdrawFee() is not supported yet')

    def deposit_withdraw_fee(self, info):
        return {
            'info': info,
            'withdraw': {
                'fee': None,
                'percentage': None,
            },
            'deposit': {
                'fee': None,
                'percentage': None,
            },
            'networks': {},
        }

    def assign_default_deposit_withdraw_fees(self, fee, currency=None):
        """
         * @ignore
        Takes a depositWithdrawFee structure and assigns the default values for withdraw and deposit
        :param dict fee: A deposit withdraw fee structure
        :param dict currency: A currency structure, the response from self.currency()
        :returns dict: A deposit withdraw fee structure
        """
        networkKeys = list(fee['networks'].keys())
        numNetworks = len(networkKeys)
        if numNetworks == 1:
            fee['withdraw'] = fee['networks'][networkKeys[0]]['withdraw']
            fee['deposit'] = fee['networks'][networkKeys[0]]['deposit']
            return fee
        currencyCode = self.safe_string(currency, 'code')
        for i in range(0, numNetworks):
            network = networkKeys[i]
            if network == currencyCode:
                fee['withdraw'] = fee['networks'][networkKeys[i]]['withdraw']
                fee['deposit'] = fee['networks'][networkKeys[i]]['deposit']
        return fee

    def parse_income(self, info, market: Market = None):
        raise NotSupported(self.id + ' parseIncome() is not supported yet')

    def parse_incomes(self, incomes, market=None, since: Int = None, limit: Int = None):
        """
         * @ignore
        parses funding fee info from exchange response
        :param dict[] incomes: each item describes once instance of currency being received or paid
        :param dict market: ccxt market
        :param int [since]: when defined, the response items are filtered to only include items after self timestamp
        :param int [limit]: limits the number of items in the response
        :returns dict[]: an array of `funding history structures <https://docs.ccxt.com/#/?id=funding-history-structure>`
        """
        result = []
        for i in range(0, len(incomes)):
            entry = incomes[i]
            parsed = self.parse_income(entry, market)
            result.append(parsed)
        sorted = self.sort_by(result, 'timestamp')
        return self.filter_by_since_limit(sorted, since, limit)

    def get_market_from_symbols(self, symbols: List[str] = None):
        if symbols is None:
            return None
        firstMarket = self.safe_string(symbols, 0)
        market = self.market(firstMarket)
        return market

    def parse_ws_ohlcvs(self, ohlcvs: List[object], market: Any = None, timeframe: str = '1m', since: Int = None, limit: Int = None):
        results = []
        for i in range(0, len(ohlcvs)):
            results.append(self.parse_ws_ohlcv(ohlcvs[i], market))
        return results

    def fetch_transactions(self, code: str = None, since: Int = None, limit: Int = None, params={}):
        """
         * @deprecated
        *DEPRECATED* use fetchDepositsWithdrawals instead
        :param str code: unified currency code for the currency of the deposit/withdrawals, default is None
        :param int [since]: timestamp in ms of the earliest deposit/withdrawal, default is None
        :param int [limit]: max number of deposit/withdrawals to return, default is None
        :param dict [params]: extra parameters specific to the exchange API endpoint
        :returns dict: a list of `transaction structures <https://docs.ccxt.com/#/?id=transaction-structure>`
        """
        if self.has['fetchDepositsWithdrawals']:
            return self.fetchDepositsWithdrawals(code, since, limit, params)
        else:
            raise NotSupported(self.id + ' fetchTransactions() is not supported yet')

    def filter_by_array_positions(self, objects, key: IndexType, values=None, indexed=True):
        """
         * @ignore
        Typed wrapper for filterByArray that returns a list of positions
        """
        return self.filter_by_array(objects, key, values, indexed)

    def filter_by_array_tickers(self, objects, key: IndexType, values=None, indexed=True):
        """
         * @ignore
        Typed wrapper for filterByArray that returns a dictionary of tickers
        """
        return self.filter_by_array(objects, key, values, indexed)

    def resolve_promise_if_messagehash_matches(self, client, prefix: str, symbol: str, data):
        messageHashes = self.findMessageHashes(client, prefix)
        for i in range(0, len(messageHashes)):
            messageHash = messageHashes[i]
            parts = messageHash.split('::')
            symbolsString = parts[1]
            symbols = symbolsString.split(',')
            if self.in_array(symbol, symbols):
                client.resolve(data, messageHash)

    def resolve_multiple_ohlcv(self, client, prefix: str, symbol: str, timeframe: str, data):
        messageHashes = self.findMessageHashes(client, 'multipleOHLCV::')
        for i in range(0, len(messageHashes)):
            messageHash = messageHashes[i]
            parts = messageHash.split('::')
            symbolsAndTimeframes = parts[1]
            splitted = symbolsAndTimeframes.split(',')
            id = symbol + '#' + timeframe
            if self.in_array(id, splitted):
                client.resolve([symbol, timeframe, data], messageHash)

    def create_ohlcv_object(self, symbol: str, timeframe: str, data):
        res = {}
        res[symbol] = {}
        res[symbol][timeframe] = data
        return res

    def handle_max_entries_per_request_and_params(self, method: str, maxEntriesPerRequest: Int = None, params={}):
        newMaxEntriesPerRequest = None
        newMaxEntriesPerRequest, params = self.handle_option_and_params(params, method, 'maxEntriesPerRequest')
        if (newMaxEntriesPerRequest is not None) and (newMaxEntriesPerRequest != maxEntriesPerRequest):
            maxEntriesPerRequest = newMaxEntriesPerRequest
        if maxEntriesPerRequest is None:
            maxEntriesPerRequest = 1000  # default to 1000
        return [maxEntriesPerRequest, params]

    def fetch_paginated_call_dynamic(self, method: str, symbol: str = None, since: Int = None, limit: Int = None, params={}, maxEntriesPerRequest: Int = None):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        paginationDirection = None
        paginationDirection, params = self.handle_option_and_params(params, method, 'paginationDirection', 'backward')
        paginationTimestamp = None
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
                    response = getattr(self, method)(symbol, None, maxEntriesPerRequest, params)
                    responseLength = len(response)
                    if self.verbose:
                        self.log('Dynamic pagination call', calls, 'method', method, 'response length', responseLength, 'timestamp', paginationTimestamp)
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
                    response = getattr(self, method)(symbol, paginationTimestamp, maxEntriesPerRequest, params)
                    responseLength = len(response)
                    if self.verbose:
                        self.log('Dynamic pagination call', calls, 'method', method, 'response length', responseLength, 'timestamp', paginationTimestamp)
                    if responseLength == 0:
                        break
                    errors = 0
                    result = self.array_concat(result, response)
                    last = self.safe_value(response, responseLength - 1)
                    paginationTimestamp = self.safe_integer(last, 'timestamp') - 1
                    if (until is not None) and (paginationTimestamp >= until):
                        break
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
        uniqueResults = self.remove_repeated_elements_from_array(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(uniqueResults, since, limit, key)

    def safe_deterministic_call(self, method: str, symbol: str = None, since: Int = None, limit: Int = None, timeframe: str = None, params={}):
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        errors = 0
        try:
            if timeframe and method != 'fetchFundingRateHistory':
                return getattr(self, method)(symbol, timeframe, since, limit, params)
            else:
                return getattr(self, method)(symbol, since, limit, params)
        except Exception as e:
            if isinstance(e, RateLimitExceeded):
                raise e  # if we are rate limited, we should not retry and fail fast
            errors += 1
            if errors > maxRetries:
                raise e

    def fetch_paginated_call_deterministic(self, method: str, symbol: str = None, since: Int = None, limit: Int = None, timeframe: str = None, params={}, maxEntriesPerRequest=None):
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
        until = self.safe_integer_2(params, 'until', 'till')  # do not omit it here
        if until is not None:
            requiredCalls = int(math.ceil((until - since)) / step)
            if requiredCalls > maxCalls:
                raise BadRequest(self.id + ' the number of required calls is greater than the max number of calls allowed, either increase the paginationCalls or decrease the since-until gap. Current paginationCalls limit is ' + str(maxCalls) + ' required calls is ' + str(requiredCalls))
        for i in range(0, maxCalls):
            if (until is not None) and (currentSince >= until):
                break
            tasks.append(self.safe_deterministic_call(method, symbol, currentSince, maxEntriesPerRequest, timeframe, params))
            currentSince = self.sum(currentSince, step) - 1
        results = tasks
        result = []
        for i in range(0, len(results)):
            result = self.array_concat(result, results[i])
        uniqueResults = self.remove_repeated_elements_from_array(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(uniqueResults, since, limit, key)

    def fetch_paginated_call_cursor(self, method: str, symbol: str = None, since=None, limit=None, params={}, cursorReceived=None, cursorSent=None, cursorIncrement=None, maxEntriesPerRequest=None):
        maxCalls = None
        maxCalls, params = self.handle_option_and_params(params, method, 'paginationCalls', 10)
        maxRetries = None
        maxRetries, params = self.handle_option_and_params(params, method, 'maxRetries', 3)
        maxEntriesPerRequest, params = self.handle_max_entries_per_request_and_params(method, maxEntriesPerRequest, params)
        cursorValue = None
        i = 0
        errors = 0
        result = []
        while(i < maxCalls):
            try:
                if cursorValue is not None:
                    if cursorIncrement is not None:
                        cursorValue = self.parseToInt(cursorValue) + cursorIncrement
                    params[cursorSent] = cursorValue
                response = None
                if method == 'fetchAccounts':
                    response = getattr(self, method)(params)
                else:
                    response = getattr(self, method)(symbol, since, maxEntriesPerRequest, params)
                errors = 0
                responseLength = len(response)
                if self.verbose:
                    self.log('Cursor pagination call', i + 1, 'method', method, 'response length', responseLength, 'cursor', cursorValue)
                if responseLength == 0:
                    break
                result = self.array_concat(result, response)
                last = self.safe_value(response, responseLength - 1)
                cursorValue = self.safe_value(last['info'], cursorReceived)
                if cursorValue is None:
                    break
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
            i += 1
        sorted = self.sortCursorPaginatedResult(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(sorted, since, limit, key)

    def fetch_paginated_call_incremental(self, method: str, symbol: str = None, since=None, limit=None, params={}, pageKey=None, maxEntriesPerRequest=None):
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
                response = getattr(self, method)(symbol, since, maxEntriesPerRequest, params)
                errors = 0
                responseLength = len(response)
                if self.verbose:
                    self.log('Incremental pagination call', i + 1, 'method', method, 'response length', responseLength)
                if responseLength == 0:
                    break
                result = self.array_concat(result, response)
            except Exception as e:
                errors += 1
                if errors > maxRetries:
                    raise e
            i += 1
        sorted = self.sortCursorPaginatedResult(result)
        key = 0 if (method == 'fetchOHLCV') else 'timestamp'
        return self.filter_by_since_limit(sorted, since, limit, key)

    def sort_cursor_paginated_result(self, result):
        first = self.safe_value(result, 0)
        if first is not None:
            if 'timestamp' in first:
                return self.sort_by(result, 'timestamp')
            if 'id' in first:
                return self.sort_by(result, 'id')
        return result

    def remove_repeated_elements_from_array(self, input):
        uniqueResult = {}
        for i in range(0, len(input)):
            entry = input[i]
            id = self.safe_string(entry, 'id')
            if id is not None:
                if self.safe_string(uniqueResult, id) is None:
                    uniqueResult[id] = entry
            else:
                timestamp = self.safe_integer_2(entry, 'timestamp', 0)
                if timestamp is not None:
                    if self.safe_string(uniqueResult, timestamp) is None:
                        uniqueResult[timestamp] = entry
        values = list(uniqueResult.values())
        valuesLength = len(values)
        if valuesLength > 0:
            return values
        return input

    def handle_until_option(self, key, request, params, multiplier=1):
        until = self.safe_value_2(params, 'until', 'till')
        if until is not None:
            request[key] = self.parseToInt(until * multiplier)
            params = self.omit(params, ['until', 'till'])
        return [request, params]

    def safe_open_interest(self, interest, market: Market = None):
        return self.extend(interest, {
            'symbol': self.safe_string(market, 'symbol'),
            'baseVolume': self.safe_number(interest, 'baseVolume'),  # deprecated
            'quoteVolume': self.safe_number(interest, 'quoteVolume'),  # deprecated
            'openInterestAmount': self.safe_number(interest, 'openInterestAmount'),
            'openInterestValue': self.safe_number(interest, 'openInterestValue'),
            'timestamp': self.safe_integer(interest, 'timestamp'),
            'datetime': self.safe_string(interest, 'datetime'),
            'info': self.safe_value(interest, 'info'),
        })

    def parse_liquidation(self, liquidation, market: Market = None):
        raise NotSupported(self.id + ' parseLiquidation() is not supported yet')

    def parse_liquidations(self, liquidations, market=None, since: Int = None, limit: Int = None):
        """
         * @ignore
        parses liquidation info from the exchange response
        :param dict[] liquidations: each item describes an instance of a liquidation event
        :param dict market: ccxt market
        :param int [since]: when defined, the response items are filtered to only include items after self timestamp
        :param int [limit]: limits the number of items in the response
        :returns dict[]: an array of `liquidation structures <https://docs.ccxt.com/#/?id=liquidation-structure>`
        """
        result = []
        for i in range(0, len(liquidations)):
            entry = liquidations[i]
            parsed = self.parseLiquidation(entry, market)
            result.append(parsed)
        sorted = self.sort_by(result, 'timestamp')
        symbol = self.safe_string(market, 'symbol')
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def parse_greeks(self, greeks, market: Market = None):
        raise NotSupported(self.id + ' parseGreeks() is not supported yet')
