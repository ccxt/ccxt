# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.86.24'

# -----------------------------------------------------------------------------

import asyncio
import concurrent.futures
import socket
import certifi
import aiohttp
import ssl
import sys
import yarl

# -----------------------------------------------------------------------------

from ccxt.async_support.base.throttler import Throttler

# -----------------------------------------------------------------------------

from ccxt.base.errors import AuthenticationError
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import NotSupported
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NullResponse
from ccxt.base.errors import InvalidOrder
from ccxt.base.decimal_to_precision import TRUNCATE, ROUND

# -----------------------------------------------------------------------------

from ccxt.base.exchange import Exchange as BaseExchange, ArgumentsRequired
from ccxt.base.precise import Precise

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

    async def fetch_l2_order_book(self, symbol, limit=None, params={}):
        orderbook = await self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
        })

    async def perform_order_book_request(self, market, limit=None, params={}):
        raise NotSupported(self.id + ' performOrderBookRequest() is not supported yet')

    async def fetch_order_book(self, symbol, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderbook = await self.perform_order_book_request(market, limit, params)
        return self.parse_order_book(orderbook, market, limit, params)

    async def fetchOHLCVC(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        ohlcvs = await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)
        return [ohlcv[0:-1] for ohlcv in ohlcvs]

    async def fetchOHLCV(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcv(symbol, timeframe, since, limit, params)

    async def fetch_full_tickers(self, symbols=None, params={}):
        return await self.fetch_tickers(symbols, params)

    async def sleep(self, milliseconds):
        return await asyncio.sleep(milliseconds / 1000)

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM JAVASCRIPT TO PYTHON AND PHP

    async def load_trading_limits(self, symbols=None, reload=False, params={}):
        if self.has['fetchTradingLimits']:
            if reload or not ('limitsLoaded' in self.options):
                response = await self.fetch_trading_limits(symbols)
                for i in range(0, len(symbols)):
                    symbol = symbols[i]
                    self.markets[symbol] = self.deep_extend(self.markets[symbol], response[symbol])
                self.options['limitsLoaded'] = self.milliseconds()
        return self.markets

    def parse_positions(self, positions, symbols=None, params={}):
        symbols = self.market_symbols(symbols)
        positions = self.to_array(positions)
        result = []
        for i in range(0, len(positions)):
            position = self.extend(self.parse_position(positions[i], None), params)
            result.append(position)
        return self.filter_by_array(result, 'symbol', symbols, False)

    def parse_accounts(self, accounts, params={}):
        accounts = self.to_array(accounts)
        result = []
        for i in range(0, len(accounts)):
            account = self.extend(self.parse_account(accounts[i], None), params)
            result.append(account)
        return result

    def parse_trades(self, trades, market=None, since=None, limit=None, params={}):
        trades = self.to_array(trades)
        result = []
        for i in range(0, len(trades)):
            trade = self.extend(self.parse_trade(trades[i], market), params)
            result.append(trade)
        result = self.sort_by_2(result, 'timestamp', 'id')
        symbol = market['symbol'] if (market is not None) else None
        tail = since is None
        return self.filter_by_symbol_since_limit(result, symbol, since, limit, tail)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        transactions = self.to_array(transactions)
        result = []
        for i in range(0, len(transactions)):
            transaction = self.extend(self.parse_transaction(transactions[i], currency), params)
            result.append(transaction)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = since is None
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_transfers(self, transfers, currency=None, since=None, limit=None, params={}):
        transfers = self.to_array(transfers)
        result = []
        for i in range(0, len(transfers)):
            transfer = self.extend(self.parseTransfer(transfers[i], currency), params)
            result.append(transfer)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = since is None
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def nonce(self):
        return self.seconds()

    def set_headers(self, headers):
        return headers

    def market_id(self, symbol):
        market = self.market(symbol)
        if market is not None:
            return market['id']
        return symbol

    def symbol(self, symbol):
        market = self.market(symbol)
        return self.safe_string(market, 'symbol', symbol)

    def resolve_path(self, path, params):
        return [
            self.implode_params(path, params),
            self.omit(params, self.extract_params(path)),
        ]

    def filter_by_array(self, objects, key, values=None, indexed=True):
        objects = self.to_array(objects)
        # return all of them if no values were passed
        if values is None or not values:
            return self.index_by(objects, key) if indexed else objects
        results = []
        for i in range(0, len(objects)):
            if self.in_array(objects[i][key], values):
                results.append(objects[i])
        return self.index_by(results, key) if indexed else results

    async def fetch2(self, path, api='public', method='GET', params={}, headers=None, body=None, config={}, context={}):
        if self.enableRateLimit:
            cost = self.calculate_rate_limiter_cost(api, method, path, params, config, context)
            await self.throttle(cost)
        request = self.sign(path, api, method, params, headers, body)
        return await self.fetch(request['url'], request['method'], request['headers'], request['body'])

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None, config={}, context={}):
        return await self.fetch2(path, api, method, params, headers, body, config, context)

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

    async def fetch_ohlcvc(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported(self.id + ' fetchOHLCV() is not supported yet')
        await self.load_markets()
        trades = await self.fetchTrades(symbol, since, limit, params)
        return self.build_ohlcvc(trades, timeframe, since, limit)

    def parse_trading_view_ohlcv(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        result = self.convert_trading_view_to_ohlcv(ohlcvs)
        return self.parse_ohlcvs(result, market, timeframe, since, limit)

    async def edit_limit_buy_order(self, id, symbol, amount, price=None, params={}):
        return await self.edit_limit_order(id, symbol, 'buy', amount, price, params)

    async def edit_limit_sell_order(self, id, symbol, amount, price=None, params={}):
        return await self.edit_limit_order(id, symbol, 'sell', amount, price, params)

    async def edit_limit_order(self, id, symbol, side, amount, price=None, params={}):
        return await self.edit_order(id, symbol, 'limit', side, amount, price, params)

    async def edit_order(self, id, symbol, type, side, amount, price=None, params={}):
        await self.cancelOrder(id, symbol)
        return await self.create_order(symbol, type, side, amount, price, params)

    async def fetch_permissions(self, params={}):
        raise NotSupported(self.id + ' fetchPermissions() is not supported yet')

    async def fetch_bids_asks(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchBidsAsks() is not supported yet')

    def parse_bid_ask(self, bidask, priceKey=0, amountKey=1):
        price = self.safeNumber(bidask, priceKey)
        amount = self.safeNumber(bidask, amountKey)
        return [price, amount]

    def safe_currency(self, currencyId, currency=None):
        if (currencyId is None) and (currency is not None):
            return currency
        if (self.currencies_by_id is not None) and (currencyId in self.currencies_by_id):
            return self.currencies_by_id[currencyId]
        code = currencyId
        if currencyId is not None:
            code = self.common_currency_code(currencyId.upper())
        return {
            'id': currencyId,
            'code': code,
        }

    def safe_market(self, marketId, market=None, delimiter=None):
        if marketId is not None:
            if (self.markets_by_id is not None) and (marketId in self.markets_by_id):
                market = self.markets_by_id[marketId]
            elif delimiter is not None:
                parts = marketId.split(delimiter)
                partsLength = len(parts)
                if partsLength == 2:
                    baseId = self.safe_string(parts, 0)
                    quoteId = self.safe_string(parts, 1)
                    base = self.safe_currency_code(baseId)
                    quote = self.safe_currency_code(quoteId)
                    symbol = base + '/' + quote
                    return {
                        'id': marketId,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                    }
                else:
                    return {
                        'id': marketId,
                        'symbol': marketId,
                        'base': None,
                        'quote': None,
                        'baseId': None,
                        'quoteId': None,
                    }
        if market is not None:
            return market
        return {
            'id': marketId,
            'symbol': marketId,
            'base': None,
            'quote': None,
            'baseId': None,
            'quoteId': None,
        }

    def check_required_credentials(self, error=True):
        keys = list(self.requiredCredentials.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            if self.requiredCredentials[key] and not getattr(self, key):
                if error:
                    raise AuthenticationError(self.id + ' requires "' + key + '" credential')
                else:
                    return error
        return True

    def oath(self):
        if self.twofa is not None:
            return self.totp(self.twofa)
        else:
            raise ExchangeError(self.id + ' exchange.twofa has not been set for 2FA Two-Factor Authentication')

    async def fetch_balance(self, params={}):
        raise NotSupported(self.id + ' fetchBalance() is not supported yet')

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
        if self.has['fetchTime']:
            time = await self.fetchTime(params)
            self.status = self.extend(self.status, {
                'updated': time,
            })
        return self.status

    async def fetch_funding_fee(self, code, params={}):
        warnOnFetchFundingFee = self.safe_value(self.options, 'warnOnFetchFundingFee', True)
        if warnOnFetchFundingFee:
            raise NotSupported(self.id + ' fetchFundingFee() method is deprecated, it will be removed in July 2022, please, use fetchTransactionFee() or set exchange.options["warnOnFetchFundingFee"] = False to suppress self warning')
        return self.fetch_transaction_fee(code, params)

    async def fetch_funding_fees(self, codes=None, params={}):
        warnOnFetchFundingFees = self.safe_value(self.options, 'warnOnFetchFundingFees', True)
        if warnOnFetchFundingFees:
            raise NotSupported(self.id + ' fetchFundingFees() method is deprecated, it will be removed in July 2022. Please, use fetchTransactionFees() or set exchange.options["warnOnFetchFundingFees"] = False to suppress self warning')
        return self.fetch_transaction_fees(codes, params)

    async def fetch_transaction_fee(self, code, params={}):
        if not self.has['fetchTransactionFees']:
            raise NotSupported(self.id + ' fetchTransactionFee() is not supported yet')
        return self.fetch_transaction_fees([code], params)

    async def fetch_transaction_fees(self, codes=None, params={}):
        raise NotSupported(self.id + ' fetchTransactionFees() is not supported yet')

    def get_supported_mapping(self, key, mapping={}):
        if key in mapping:
            return mapping[key]
        else:
            raise NotSupported(self.id + ' ' + key + ' does not have a value in mapping')

    async def fetch_borrow_rate(self, code, params={}):
        await self.load_markets()
        if not self.has['fetchBorrowRates']:
            raise NotSupported(self.id + ' fetchBorrowRate() is not supported yet')
        borrowRates = await self.fetch_borrow_rates(params)
        rate = self.safe_value(borrowRates, code)
        if rate is None:
            raise ExchangeError(self.id + ' fetchBorrowRate() could not find the borrow rate for currency code ' + code)
        return rate

    def handle_market_type_and_params(self, methodName, market=None, params={}):
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
            if string.find(key) >= 0:
                return key
        return None

    def handle_errors(self, statusCode, statusText, url, method, responseHeaders, responseBody, response, requestHeaders, requestBody):
        # it is a stub method that must be overrided in the derived exchange classes
        # raise NotSupported(self.id + ' handleErrors() not implemented yet')
        pass

    def calculate_rate_limiter_cost(self, api, method, path, params, config={}, context={}):
        return self.safe_value(config, 'cost', 1)

    async def fetch_ticker(self, symbol, params={}):
        if self.has['fetchTickers']:
            tickers = await self.fetch_tickers([symbol], params)
            ticker = self.safe_value(tickers, symbol)
            if ticker is None:
                raise NullResponse(self.id + ' fetchTickers() could not find a ticker for ' + symbol)
            else:
                return ticker
        else:
            raise NotSupported(self.id + ' fetchTicker() is not supported yet')

    async def fetch_tickers(self, symbols=None, params={}):
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    async def fetch_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' fetchOrder() is not supported yet')

    async def fetch_order_status(self, id, symbol=None, params={}):
        order = await self.fetch_order(id, symbol, params)
        return order['status']

    async def fetch_unified_order(self, order, params={}):
        return await self.fetch_order(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        raise NotSupported(self.id + ' createOrder() is not supported yet')

    async def cancel_order(self, id, symbol=None, params={}):
        raise NotSupported(self.id + ' cancelOrder() is not supported yet')

    async def cancel_unified_order(self, order, params={}):
        return self.cancelOrder(self.safe_value(order, 'id'), self.safe_value(order, 'symbol'), params)

    async def fetch_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchOrders() is not supported yet')

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchOpenOrders() is not supported yet')

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchClosedOrders() is not supported yet')

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchMyTrades() is not supported yet')

    async def fetch_transactions(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchTransactions() is not supported yet')

    async def fetch_deposits(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchDeposits() is not supported yet')

    async def fetch_withdrawals(self, symbol=None, since=None, limit=None, params={}):
        raise NotSupported(self.id + ' fetchWithdrawals() is not supported yet')

    async def fetch_deposit_address(self, code, params={}):
        if self.has['fetchDepositAddresses']:
            depositAddresses = await self.fetchDepositAddresses([code], params)
            depositAddress = self.safe_value(depositAddresses, code)
            if depositAddress is None:
                raise InvalidAddress(self.id + ' fetchDepositAddress() could not find a deposit address for ' + code + ', make sure you have created a corresponding deposit address in your wallet on the exchange website')
            else:
                return depositAddress
        else:
            raise NotSupported(self.id + ' fetchDepositAddress() is not supported yet')

    def account(self):
        return {
            'free': None,
            'used': None,
            'total': None,
        }

    def common_currency_code(self, currency):
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

    def market(self, symbol):
        if self.markets is None:
            raise ExchangeError(self.id + ' markets not loaded')
        if self.markets_by_id is None:
            raise ExchangeError(self.id + ' markets not loaded')
        if isinstance(symbol, str):
            if symbol in self.markets:
                return self.markets[symbol]
            elif symbol in self.markets_by_id:
                return self.markets_by_id[symbol]
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

    async def create_limit_order(self, symbol, side, amount, price, params={}):
        return await self.create_order(symbol, 'limit', side, amount, price, params)

    async def create_market_order(self, symbol, side, amount, price, params={}):
        return await self.create_order(symbol, 'market', side, amount, price, params)

    async def create_limit_buy_order(self, symbol, amount, price, params={}):
        return await self.create_order(symbol, 'limit', 'buy', amount, price, params)

    async def create_limit_sell_order(self, symbol, amount, price, params={}):
        return await self.create_order(symbol, 'limit', 'sell', amount, price, params)

    async def create_market_buy_order(self, symbol, amount, params={}):
        return await self.create_order(symbol, 'market', 'buy', amount, None, params)

    async def create_market_sell_order(self, symbol, amount, params={}):
        return await self.create_order(symbol, 'market', 'sell', amount, None, params)

    def cost_to_precision(self, symbol, cost):
        market = self.market(symbol)
        return self.decimal_to_precision(cost, TRUNCATE, market['precision']['price'], self.precisionMode, self.paddingMode)

    def price_to_precision(self, symbol, price):
        market = self.market(symbol)
        return self.decimal_to_precision(price, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)

    def amount_to_precision(self, symbol, amount):
        market = self.market(symbol)
        return self.decimal_to_precision(amount, TRUNCATE, market['precision']['amount'], self.precisionMode, self.paddingMode)

    def fee_to_precision(self, symbol, fee):
        market = self.market(symbol)
        return self.decimal_to_precision(fee, ROUND, market['precision']['price'], self.precisionMode, self.paddingMode)

    def currency_to_precision(self, code, fee, networkCode=None):
        currency = self.currencies[code]
        precision = self.safe_value(currency, 'precision')
        if networkCode is not None:
            networks = self.safe_value(currency, 'networks', {})
            networkItem = self.safe_value(networks, networkCode, {})
            precision = self.safe_value(networkItem, 'precision', precision)
        if precision is None:
            return fee
        else:
            return self.decimal_to_precision(fee, ROUND, precision, self.precisionMode, self.paddingMode)

    def safe_number(self, object, key, d=None):
        value = self.safe_string(object, key)
        return self.parse_number(value, d)

    def safe_number_n(self, object, arr, d=None):
        value = self.safe_string_n(object, arr)
        return self.parse_number(value, d)

    def parse_precision(self, precision):
        if precision is None:
            return None
        return '1e' + Precise.string_neg(precision)

    async def load_time_difference(self, params={}):
        serverTime = await self.fetchTime(params)
        after = self.milliseconds()
        self.options['timeDifference'] = after - serverTime
        return self.options['timeDifference']

    def implode_hostname(self, url):
        return self.implode_params(url, {'hostname': self.hostname})

    async def fetch_market_leverage_tiers(self, symbol, params={}):
        if self.has['fetchLeverageTiers']:
            market = await self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchMarketLeverageTiers() supports contract markets only')
            tiers = await self.fetch_leverage_tiers([symbol])
            return self.safe_value(tiers, symbol)
        else:
            raise NotSupported(self.id + ' fetchMarketLeverageTiers() is not supported yet')

    async def create_post_only_order(self, symbol, type, side, amount, price, params={}):
        if not self.has['createPostOnlyOrder']:
            raise NotSupported(self.id + 'createPostOnlyOrder() is not supported yet')
        query = self.extend(params, {'postOnly': True})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_reduce_only_order(self, symbol, type, side, amount, price, params={}):
        if not self.has['createReduceOnlyOrder']:
            raise NotSupported(self.id + 'createReduceOnlyOrder() is not supported yet')
        query = self.extend(params, {'reduceOnly': True})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_stop_order(self, symbol, type, side, amount, price=None, stopPrice=None, params={}):
        if not self.has['createStopOrder']:
            raise NotSupported(self.id + ' createStopOrder() is not supported yet')
        if stopPrice is None:
            raise ArgumentsRequired(self.id + ' create_stop_order() requires a stopPrice argument')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, type, side, amount, price, query)

    async def create_stop_limit_order(self, symbol, side, amount, price, stopPrice, params={}):
        if not self.has['createStopLimitOrder']:
            raise NotSupported(self.id + ' createStopLimitOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, 'limit', side, amount, price, query)

    async def create_stop_market_order(self, symbol, side, amount, stopPrice, params={}):
        if not self.has['createStopMarketOrder']:
            raise NotSupported(self.id + ' createStopMarketOrder() is not supported yet')
        query = self.extend(params, {'stopPrice': stopPrice})
        return await self.create_order(symbol, 'market', side, amount, None, query)

    def safe_currency_code(self, currencyId, currency=None):
        currency = self.safe_currency(currencyId, currency)
        return currency['code']

    def filter_by_symbol_since_limit(self, array, symbol=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'symbol', symbol, since, limit, 'timestamp', tail)

    def filter_by_currency_since_limit(self, array, code=None, since=None, limit=None, tail=False):
        return self.filter_by_value_since_limit(array, 'currency', code, since, limit, 'timestamp', tail)

    def parse_tickers(self, tickers, symbols=None, params={}):
        result = []
        tickers = self.to_array(tickers)
        for i in range(0, len(tickers)):
            result.append(self.extend(self.parse_ticker(tickers[i]), params))
        return self.filter_by_array(result, 'symbol', symbols)

    def parse_deposit_addresses(self, addresses, codes=None, indexed=True, params={}):
        result = []
        for i in range(0, len(addresses)):
            address = self.extend(self.parse_deposit_address(addresses[i]), params)
            result.append(address)
        if codes is not None:
            result = self.filter_by_array(result, 'currency', codes, False)
        result = self.index_by(result, 'currency') if indexed else result
        return result

    def parse_borrow_interests(self, response, market=None):
        interests = []
        for i in range(0, len(response)):
            row = response[i]
            interests.append(self.parse_borrow_interest(row, market))
        return interests

    def parse_funding_rate_histories(self, response, market=None, since=None, limit=None):
        rates = []
        for i in range(0, len(response)):
            entry = response[i]
            rates.append(self.parse_funding_rate_history(entry, market))
        sorted = self.sort_by(rates, 'timestamp')
        symbol = None if (market is None) else market['symbol']
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    def safe_symbol(self, marketId, market=None, delimiter=None):
        market = self.safe_market(marketId, market, delimiter)
        return market['symbol']

    def parse_funding_rate(self, contract, market=None):
        raise NotSupported(self.id + ' parseFundingRate() is not supported yet')

    def parse_funding_rates(self, response, market=None):
        result = {}
        for i in range(0, len(response)):
            parsed = self.parse_funding_rate(response[i], market)
            result[parsed['symbol']] = parsed
        return result

    def is_post_only(self, isMarketOrder, exchangeSpecificParam, params={}):
        """
         * @ignore
        :param string type: Order type
        :param boolean exchangeSpecificParam: exchange specific postOnly
        :param dict params: exchange specific params
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

    async def fetch_trading_fees(self, params={}):
        raise NotSupported(self.id + ' fetchTradingFees() is not supported yet')

    async def fetch_trading_fee(self, symbol, params={}):
        if not self.has['fetchTradingFees']:
            raise NotSupported(self.id + ' fetchTradingFee() is not supported yet')
        return await self.fetch_trading_fees(params)

    def parse_open_interest(self, interest, market=None):
        raise NotSupported(self.id + ' parseOpenInterest() is not supported yet')

    def parse_open_interests(self, response, market=None, since=None, limit=None):
        interests = []
        for i in range(0, len(response)):
            entry = response[i]
            interest = self.parse_open_interest(entry, market)
            interests.append(interest)
        sorted = self.sort_by(interests, 'timestamp')
        symbol = self.safe_string(market, 'symbol')
        return self.filter_by_symbol_since_limit(sorted, symbol, since, limit)

    async def fetch_funding_rate(self, symbol, params={}):
        if self.has['fetchFundingRates']:
            market = await self.market(symbol)
            if not market['contract']:
                raise BadSymbol(self.id + ' fetchFundingRate() supports contract markets only')
            rates = await self.fetchFundingRates([symbol], params)
            rate = self.safe_value(rates, symbol)
            if rate is None:
                raise NullResponse(self.id + ' fetchFundingRate() returned no data for ' + symbol)
            else:
                return rate
        else:
            raise NotSupported(self.id + ' fetchFundingRate() is not supported yet')

    async def fetch_mark_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical mark price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchMarkOHLCV']:
            request = {
                'price': 'mark',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchMarkOHLCV() is not supported yet')

    async def fetch_index_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchIndexOHLCV']:
            request = {
                'price': 'index',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchIndexOHLCV() is not supported yet')

    async def fetch_premium_index_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        """
        fetches historical premium index price candlestick data containing the open, high, low, and close price of a market
        :param str symbol: unified symbol of the market to fetch OHLCV data for
        :param str timeframe: the length of time each candle represents
        :param int|None since: timestamp in ms of the earliest candle to fetch
        :param int|None limit: the maximum amount of candles to fetch
        :param dict params: extra parameters specific to the exchange api endpoint
        :returns [[int|float]]: A list of candles ordered as timestamp, open, high, low, close, None
        """
        if self.has['fetchPremiumIndexOHLCV']:
            request = {
                'price': 'premiumIndex',
            }
            return await self.fetch_ohlcv(symbol, timeframe, since, limit, self.extend(request, params))
        else:
            raise NotSupported(self.id + ' fetchPremiumIndexOHLCV() is not supported yet')
