# -*- coding: utf-8 -*-

# -----------------------------------------------------------------------------

__version__ = '1.89.19'

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
from ccxt.base.decimal_to_precision import TRUNCATE, ROUND, TICK_SIZE, DECIMAL_PLACES

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

    async def perform_order_book_request(self, market, limit=None, params={}):
        raise NotSupported(self.id + ' performOrderBookRequest() is not supported yet')

    async def fetch_order_book(self, symbol, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        orderbook = await self.perform_order_book_request(market, limit, params)
        return self.parse_order_book(orderbook, market, limit, params)

    async def fetchOHLCVC(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        return await self.fetch_ohlcvc(symbol, timeframe, since, limit, params)

    async def fetch_full_tickers(self, symbols=None, params={}):
        return await self.fetch_tickers(symbols, params)

    async def sleep(self, milliseconds):
        return await asyncio.sleep(milliseconds / 1000)

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

    def safe_ledger_entry(self, entry, currency=None):
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

    def set_markets(self, markets, currencies=None):
        values = []
        marketValues = self.to_array(markets)
        for i in range(0, len(marketValues)):
            market = self.deep_extend(self.safe_market(), {
                'precision': self.precision,
                'limits': self.limits,
            }, self.fees['trading'], marketValues[i])
            values.append(market)
        self.markets = self.index_by(values, 'symbol')
        self.markets_by_id = self.index_by(markets, 'id')
        marketsSortedBySymbol = self.keysort(self.markets)
        marketsSortedById = self.keysort(self.markets_by_id)
        self.symbols = list(marketsSortedBySymbol.keys())
        self.ids = list(marketsSortedById.keys())
        if currencies is not None:
            self.currencies = self.deep_extend(self.currencies, currencies)
        else:
            baseCurrencies = []
            quoteCurrencies = []
            for i in range(0, len(values)):
                market = values[i]
                defaultCurrencyPrecision = 8 if (self.precisionMode == DECIMAL_PLACES) else self.parse_number('0.00000001')
                marketPrecision = self.safe_value(market, 'precision', {})
                if 'base' in market:
                    currencyPrecision = self.safe_value_2(marketPrecision, 'base', 'amount', defaultCurrencyPrecision)
                    currency = {
                        'id': self.safe_string_2(market, 'baseId', 'base'),
                        'numericId': self.safe_string(market, 'baseNumericId'),
                        'code': self.safe_string(market, 'base'),
                        'precision': currencyPrecision,
                    }
                    baseCurrencies.append(currency)
                if 'quote' in market:
                    currencyPrecision = self.safe_value_2(marketPrecision, 'quote', 'amount', defaultCurrencyPrecision)
                    currency = {
                        'id': self.safe_string_2(market, 'quoteId', 'quote'),
                        'numericId': self.safe_string(market, 'quoteNumericId'),
                        'code': self.safe_string(market, 'quote'),
                        'precision': currencyPrecision,
                    }
                    quoteCurrencies.append(currency)
            baseCurrencies = self.sort_by(baseCurrencies, 'code')
            quoteCurrencies = self.sort_by(quoteCurrencies, 'code')
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

    def safe_balance(self, balance):
        balances = self.omit(balance, ['info', 'timestamp', 'datetime', 'free', 'used', 'total'])
        codes = list(balances.keys())
        balance['free'] = {}
        balance['used'] = {}
        balance['total'] = {}
        for i in range(0, len(codes)):
            code = codes[i]
            total = self.safe_string(balance[code], 'total')
            free = self.safe_string(balance[code], 'free')
            used = self.safe_string(balance[code], 'used')
            if total is None:
                total = Precise.string_add(free, used)
            if free is None:
                free = Precise.string_sub(total, used)
            if used is None:
                used = Precise.string_sub(total, free)
            balance[code]['free'] = self.parse_number(free)
            balance[code]['used'] = self.parse_number(used)
            balance[code]['total'] = self.parse_number(total)
            balance['free'][code] = balance[code]['free']
            balance['used'][code] = balance[code]['used']
            balance['total'][code] = balance[code]['total']
        return balance

    def safe_order(self, order, market=None):
        # parses numbers as strings
        # it is important pass the trades as unparsed rawTrades
        amount = self.omit_zero(self.safe_string(order, 'amount'))
        remaining = self.safe_string(order, 'remaining')
        filled = self.safe_string(order, 'filled')
        cost = self.safe_string(order, 'cost')
        average = self.omit_zero(self.safe_string(order, 'average'))
        price = self.omit_zero(self.safe_string(order, 'price'))
        lastTradeTimeTimestamp = self.safe_integer(order, 'lastTradeTimestamp')
        parseFilled = (filled is None)
        parseCost = (cost is None)
        parseLastTradeTimeTimestamp = (lastTradeTimeTimestamp is None)
        fee = self.safe_value(order, 'fee')
        parseFee = (fee is None)
        parseFees = self.safe_value(order, 'fees') is None
        shouldParseFees = parseFee or parseFees
        fees = self.safe_value(order, 'fees', [])
        trades = []
        if parseFilled or parseCost or shouldParseFees:
            rawTrades = self.safe_value(order, 'trades', trades)
            oldNumber = self.number
            # we parse trades as strings here!
            self.number = str
            trades = self.parse_trades(rawTrades, market, None, None, {
                'symbol': order['symbol'],
                'side': order['side'],
                'type': order['type'],
                'order': order['id'],
            })
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
            reducedFees = self.reduce_fees_by_currency(fees, True) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                fee['cost'] = self.safe_number(fee, 'cost')
                if 'rate' in fee:
                    fee['rate'] = self.safe_number(fee, 'rate')
                reducedFees.append(fee)
            if parseFees:
                order['fees'] = reducedFees
            if parseFee and (reducedLength == 1):
                order['fee'] = reducedFees[0]
        if amount is None:
            # ensure amount = filled + remaining
            if filled is not None and remaining is not None:
                amount = Precise.string_add(filled, remaining)
            elif self.safe_string(order, 'status') == 'closed':
                amount = filled
        if filled is None:
            if amount is not None and remaining is not None:
                filled = Precise.string_sub(amount, remaining)
        if remaining is None:
            if amount is not None and filled is not None:
                remaining = Precise.string_sub(amount, filled)
        # ensure that the average field is calculated correctly
        if average is None:
            if (filled is not None) and (cost is not None) and Precise.string_gt(filled, '0'):
                average = Precise.string_div(cost, filled)
        # also ensure the cost field is calculated correctly
        costPriceExists = (average is not None) or (price is not None)
        if parseCost and (filled is not None) and costPriceExists:
            multiplyPrice = None
            if average is None:
                multiplyPrice = price
            else:
                multiplyPrice = average
            # contract trading
            contractSize = self.safe_string(market, 'contractSize')
            if contractSize is not None:
                inverse = self.safe_value(market, 'inverse', False)
                if inverse:
                    multiplyPrice = Precise.string_div('1', multiplyPrice)
                multiplyPrice = Precise.string_mul(multiplyPrice, contractSize)
            cost = Precise.string_mul(multiplyPrice, filled)
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
            fee = self.safe_value(entry, 'fee', {})
            fee['cost'] = self.safe_number(fee, 'cost')
            if 'rate' in fee:
                fee['rate'] = self.safe_number(fee, 'rate')
            entry['fee'] = fee
        # timeInForceHandling
        timeInForce = self.safe_string(order, 'timeInForce')
        if timeInForce is None:
            if self.safe_string(order, 'type') == 'market':
                timeInForce = 'IOC'
            # allow postOnly override
            if self.safe_value(order, 'postOnly', False):
                timeInForce = 'PO'
        return self.extend(order, {
            'lastTradeTimestamp': lastTradeTimeTimestamp,
            'price': self.parse_number(price),
            'amount': self.parse_number(amount),
            'cost': self.parse_number(cost),
            'average': self.parse_number(average),
            'filled': self.parse_number(filled),
            'remaining': self.parse_number(remaining),
            'timeInForce': timeInForce,
            'trades': trades,
        })

    def parse_orders(self, orders, market=None, since=None, limit=None, params={}):
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
        tail = since is None
        return self.filter_by_symbol_since_limit(results, symbol, since, limit, tail)

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        market = self.markets[symbol]
        feeSide = self.safe_string(market, 'feeSide', 'quote')
        key = 'quote'
        cost = None
        if feeSide == 'quote':
            # the fee is always in quote currency
            cost = amount * price
        elif feeSide == 'base':
            # the fee is always in base currency
            cost = amount
        elif feeSide == 'get':
            # the fee is always in the currency you get
            cost = amount
            if side == 'sell':
                cost *= price
            else:
                key = 'base'
        elif feeSide == 'give':
            # the fee is always in the currency you give
            cost = amount
            if side == 'buy':
                cost *= price
            else:
                key = 'base'
        rate = market[takerOrMaker]
        if cost is not None:
            cost *= rate
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': cost,
        }

    def safe_trade(self, trade, market=None):
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
        fee = self.safe_value(trade, 'fee')
        if shouldParseFees:
            reducedFees = self.reduce_fees_by_currency(fees, True) if self.reduceFees else fees
            reducedLength = len(reducedFees)
            for i in range(0, reducedLength):
                reducedFees[i]['cost'] = self.safe_number(reducedFees[i], 'cost')
                if 'rate' in reducedFees[i]:
                    reducedFees[i]['rate'] = self.safe_number(reducedFees[i], 'rate')
            if not parseFee and (reducedLength == 0):
                fee['cost'] = self.safe_number(fee, 'cost')
                if 'rate' in fee:
                    fee['rate'] = self.safe_number(fee, 'rate')
                reducedFees.append(fee)
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

    def reduce_fees_by_currency(self, fees, string=False):
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
        #         {'currency': 'BTC', 'cost': '0.3'  },
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
                if not (feeCurrencyCode in reduced):
                    reduced[feeCurrencyCode] = {}
                rateKey = '' if (rate is None) else rate
                if rateKey in reduced[feeCurrencyCode]:
                    if string:
                        reduced[feeCurrencyCode][rateKey]['cost'] = Precise.string_add(reduced[feeCurrencyCode][rateKey]['cost'], cost)
                    else:
                        reduced[feeCurrencyCode][rateKey]['cost'] = self.sum(reduced[feeCurrencyCode][rateKey]['cost'], cost)
                else:
                    reduced[feeCurrencyCode][rateKey] = {
                        'currency': feeCurrencyCode,
                        'cost': cost if string else self.parse_number(cost),
                    }
                    if rate is not None:
                        reduced[feeCurrencyCode][rateKey]['rate'] = rate if string else self.parse_number(rate)
        result = []
        feeValues = list(reduced.values())
        for i in range(0, len(feeValues)):
            reducedFeeValues = list(feeValues[i].values())
            result = self.array_concat(result, reducedFeeValues)
        return result

    def safe_ticker(self, ticker, market=None):
        open = self.safe_value(ticker, 'open')
        close = self.safe_value(ticker, 'close')
        last = self.safe_value(ticker, 'last')
        change = self.safe_value(ticker, 'change')
        percentage = self.safe_value(ticker, 'percentage')
        average = self.safe_value(ticker, 'average')
        vwap = self.safe_value(ticker, 'vwap')
        baseVolume = self.safe_value(ticker, 'baseVolume')
        quoteVolume = self.safe_value(ticker, 'quoteVolume')
        if vwap is None:
            vwap = Precise.string_div(quoteVolume, baseVolume)
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
            'bid': self.safe_number(ticker, 'bid'),
            'bidVolume': self.safe_number(ticker, 'bidVolume'),
            'ask': self.safe_number(ticker, 'ask'),
            'askVolume': self.safe_number(ticker, 'askVolume'),
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'open': self.parse_number(open),
            'close': self.parse_number(close),
            'last': self.parse_number(last),
            'change': self.parse_number(change),
            'percentage': self.parse_number(percentage),
            'average': self.parse_number(average),
            'vwap': self.parse_number(vwap),
            'baseVolume': self.parse_number(baseVolume),
            'quoteVolume': self.parse_number(quoteVolume),
            'previousClose': self.safe_number(ticker, 'previousClose'),
        })

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        if not self.has['fetchTrades']:
            raise NotSupported(self.id + ' fetchOHLCV() is not supported yet')
        await self.load_markets()
        trades = await self.fetchTrades(symbol, since, limit, params)
        ohlcvc = self.build_ohlcvc(trades, timeframe, since, limit)
        result = []
        for i in range(0, len(ohlcvc)):
            result.append([
                self.safe_integer(ohlcvc[i], 0),
                self.safe_number(ohlcvc[i], 1),
                self.safe_number(ohlcvc[i], 2),
                self.safe_number(ohlcvc[i], 3),
                self.safe_number(ohlcvc[i], 4),
                self.safe_number(ohlcvc[i], 5),
            ])
        return result

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
            ts = ohlcvs[i][0] if ms else int(ohlcvs[i][0] / 1000)
            result[timestamp].append(ts)
            result[open].append(ohlcvs[i][1])
            result[high].append(ohlcvs[i][2])
            result[low].append(ohlcvs[i][3])
            result[close].append(ohlcvs[i][4])
            result[volume].append(ohlcvs[i][5])
        return result

    def market_ids(self, symbols):
        result = []
        for i in range(0, len(symbols)):
            result.append(self.market_id(symbols[i]))
        return result

    def market_symbols(self, symbols):
        if symbols is None:
            return symbols
        result = []
        for i in range(0, len(symbols)):
            result.append(self.symbol(symbols[i]))
        return result

    def parse_bids_asks(self, bidasks, priceKey=0, amountKey=1):
        bidasks = self.to_array(bidasks)
        result = []
        for i in range(0, len(bidasks)):
            result.append(self.parse_bid_ask(bidasks[i], priceKey, amountKey))
        return result

    async def fetch_l2_order_book(self, symbol, limit=None, params={}):
        orderbook = await self.fetch_order_book(symbol, limit, params)
        return self.extend(orderbook, {
            'asks': self.sort_by(self.aggregate(orderbook['asks']), 0),
            'bids': self.sort_by(self.aggregate(orderbook['bids']), 0, True),
        })

    def filter_by_symbol(self, objects, symbol=None):
        if symbol is None:
            return objects
        result = []
        for i in range(0, len(objects)):
            objectSymbol = self.safe_string(objects[i], 'symbol')
            if objectSymbol == symbol:
                result.append(objects[i])
        return result

    def parse_ohlcv(self, ohlcv, market=None):
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

    def get_network(self, network, code):
        network = network.upper()
        aliases = {
            'ETHEREUM': 'ETH',
            'ETHER': 'ETH',
            'ERC20': 'ETH',
            'ETH': 'ETH',
            'TRC20': 'TRX',
            'TRON': 'TRX',
            'TRX': 'TRX',
            'BEP20': 'BSC',
            'BSC': 'BSC',
            'HRC20': 'HT',
            'HECO': 'HT',
            'SPL': 'SOL',
            'SOL': 'SOL',
            'TERRA': 'LUNA',
            'LUNA': 'LUNA',
            'POLYGON': 'MATIC',
            'MATIC': 'MATIC',
            'EOS': 'EOS',
            'WAVES': 'WAVES',
            'AVALANCHE': 'AVAX',
            'AVAX': 'AVAX',
            'QTUM': 'QTUM',
            'CHZ': 'CHZ',
            'NEO': 'NEO',
            'ONT': 'ONT',
            'RON': 'RON',
        }
        if network == code:
            return network
        elif network in aliases:
            return aliases[network]
        else:
            raise NotSupported(self.id + ' network ' + network + ' is not yet supported')

    def safe_number_2(self, dictionary, key1, key2, d=None):
        value = self.safe_string_2(dictionary, key1, key2)
        return self.parse_number(value, d)

    def parse_order_book(self, orderbook, symbol, timestamp=None, bidsKey='bids', asksKey='asks', priceKey=0, amountKey=1):
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

    def parse_ohlcvs(self, ohlcvs, market=None, timeframe='1m', since=None, limit=None):
        results = []
        for i in range(0, len(ohlcvs)):
            results.append(self.parse_ohlcv(ohlcvs[i], market))
        sorted = self.sort_by(results, 0)
        tail = (since is None)
        return self.filter_by_since_limit(sorted, since, limit, 0, tail)

    def parse_leverage_tiers(self, response, symbols=None, marketIdKey=None):
        # marketIdKey should only be None when response is a dictionary
        symbols = self.market_symbols(symbols)
        tiers = {}
        for i in range(0, len(response)):
            item = response[i]
            id = self.safe_string(item, marketIdKey)
            market = self.safe_market(id)
            symbol = market['symbol']
            contract = self.safe_value(market, 'contract', False)
            if contract and ((symbols is None) or self.in_array(symbol, symbols)):
                tiers[symbol] = self.parse_market_leverage_tiers(item, market)
        return tiers

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
            account = self.extend(self.parse_account(accounts[i]), params)
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
        tail = (since is None)
        return self.filter_by_symbol_since_limit(result, symbol, since, limit, tail)

    def parse_transactions(self, transactions, currency=None, since=None, limit=None, params={}):
        transactions = self.to_array(transactions)
        result = []
        for i in range(0, len(transactions)):
            transaction = self.extend(self.parse_transaction(transactions[i], currency), params)
            result.append(transaction)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_transfers(self, transfers, currency=None, since=None, limit=None, params={}):
        transfers = self.to_array(transfers)
        result = []
        for i in range(0, len(transfers)):
            transfer = self.extend(self.parse_transfer(transfers[i], currency), params)
            result.append(transfer)
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
        return self.filter_by_currency_since_limit(result, code, since, limit, tail)

    def parse_ledger(self, data, currency=None, since=None, limit=None, params={}):
        result = []
        array = self.to_array(data)
        for i in range(0, len(array)):
            itemOrItems = self.parse_ledger_entry(array[i], currency)
            if isinstance(itemOrItems, list):
                for j in range(0, len(itemOrItems)):
                    result.append(self.extend(itemOrItems[j], params))
            else:
                result.append(self.extend(itemOrItems, params))
        result = self.sort_by(result, 'timestamp')
        code = currency['code'] if (currency is not None) else None
        tail = (since is None)
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
        self.lastRestRequestTimestamp = self.milliseconds()
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
        price = self.safe_number(bidask, priceKey)
        amount = self.safe_number(bidask, amountKey)
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

    def safe_market(self, marketId=None, market=None, delimiter=None):
        result = {
            'id': marketId,
            'symbol': marketId,
            'base': None,
            'quote': None,
            'baseId': None,
            'quoteId': None,
            'active': None,
            'type': None,
            'linear': None,
            'inverse': None,
            'spot': False,
            'swap': False,
            'future': False,
            'option': False,
            'margin': False,
            'contract': False,
            'contractSize': None,
            'expiry': None,
            'expiryDatetime': None,
            'optionType': None,
            'strike': None,
            'settle': None,
            'settleId': None,
            'precision': {
                'amount': None,
                'price': None,
            },
            'limits': {
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
            'info': None,
        }
        if marketId is not None:
            if (self.markets_by_id is not None) and (marketId in self.markets_by_id):
                market = self.markets_by_id[marketId]
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

    def handle_time_in_force(self, params={}):
        """
         * @ignore
         * * Must add timeInForce to self.options to use self method
        :return str returns: the exchange specific value for timeInForce
        """
        timeInForce = self.safe_string_upper(params, 'timeInForce')  # supported values GTC, IOC, PO
        if timeInForce is not None:
            exchangeValue = self.safe_string(self.options['timeInForce'], timeInForce)
            if exchangeValue is None:
                raise ExchangeError(self.id + ' does not support timeInForce "' + timeInForce + '"')
            return exchangeValue
        return None
