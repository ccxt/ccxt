# -*- coding: utf-8 -*-

from ccxt.async.base.exchange import Exchange
import base64
import hashlib
import math
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import InvalidNonce
from ccxt.base.errors import InsufficientFunds
from ccxt.base.errors import InvalidOrder
from ccxt.base.errors import OrderNotFound
from ccxt.base.errors import CancelPending
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import ExchangeNotAvailable


class kraken (Exchange):

    def describe(self):
        return self.deep_extend(super(kraken, self).describe(), {
            'id': 'kraken',
            'name': 'Kraken',
            'countries': 'US',
            'version': '0',
            'rateLimit': 3000,
            'hasCORS': False,
            # obsolete metainfo interface
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'hasFetchOrder': True,
            'hasFetchOpenOrders': True,
            'hasFetchClosedOrders': True,
            'hasFetchMyTrades': True,
            'hasWithdraw': True,
            'hasFetchCurrencies': True,
            # new metainfo interface
            'has': {
                'fetchCurrencies': True,
                'fetchTickers': True,
                'fetchOHLCV': True,
                'fetchOrder': True,
                'fetchOpenOrders': True,
                'fetchClosedOrders': True,
                'fetchMyTrades': True,
                'withdraw': True,
            },
            'marketsByAltname': {},
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '4h': '240',
                '1d': '1440',
                '1w': '10080',
                '2w': '21600',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg',
                'api': 'https://api.kraken.com',
                'www': 'https://www.kraken.com',
                'doc': [
                    'https://www.kraken.com/en-us/help/api',
                    'https://github.com/nothingisdead/npm-kraken-api',
                ],
                'fees': [
                    'https://www.kraken.com/en-us/help/fees',
                    'https://support.kraken.com/hc/en-us/articles/201396777-What-are-the-deposit-fees-',
                    'https://support.kraken.com/hc/en-us/articles/201893608-What-are-the-withdrawal-fees-',
                ],
            },
            'fees': {
                'trading': {
                    'tierBased': True,
                    'percentage': True,
                    'taker': 0.26 / 100,
                    'maker': 0.16 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.26 / 100],
                            [50000, 0.24 / 100],
                            [100000, 0.22 / 100],
                            [250000, 0.2 / 100],
                            [500000, 0.18 / 100],
                            [1000000, 0.16 / 100],
                            [2500000, 0.14 / 100],
                            [5000000, 0.12 / 100],
                            [10000000, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.16 / 100],
                            [50000, 0.14 / 100],
                            [100000, 0.12 / 100],
                            [250000, 0.10 / 100],
                            [500000, 0.8 / 100],
                            [1000000, 0.6 / 100],
                            [2500000, 0.4 / 100],
                            [5000000, 0.2 / 100],
                            [10000000, 0.0 / 100],
                        ],
                    },
                },
                'funding': {
                    'tierBased': False,
                    'percentage': False,
                    'withdraw': {
                        'BTC': 0.001,
                        'ETH': 0.005,
                        'XRP': 0.02,
                        'XLM': 0.00002,
                        'LTC': 0.02,
                        'DOGE': 2,
                        'ZEC': 0.00010,
                        'ICN': 0.02,
                        'REP': 0.01,
                        'ETC': 0.005,
                        'MLN': 0.003,
                        'XMR': 0.05,
                        'DASH': 0.005,
                        'GNO': 0.01,
                        'EOS': 0.5,
                        'BCH': 0.001,
                        'USD': 5,  # if domestic wire
                        'EUR': 5,  # if domestic wire
                        'CAD': 10,  # CAD EFT Withdrawal
                        'JPY': 300,  # if domestic wire
                    },
                    'deposit': {
                        'BTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'XLM': 0,
                        'LTC': 0,
                        'DOGE': 0,
                        'ZEC': 0,
                        'ICN': 0,
                        'REP': 0,
                        'ETC': 0,
                        'MLN': 0,
                        'XMR': 0,
                        'DASH': 0,
                        'GNO': 0,
                        'EOS': 0,
                        'BCH': 0,
                        'USD': 5,  # if domestic wire
                        'EUR': 0,  # free deposit if EUR SEPA Deposit
                        'CAD': 5,  # if domestic wire
                        'JPY': 0,  # Domestic Deposit(Free, ¥5,000 deposit minimum)
                    },
                },
            },
            'api': {
                'public': {
                    'get': [
                        'Assets',
                        'AssetPairs',
                        'Depth',
                        'OHLC',
                        'Spread',
                        'Ticker',
                        'Time',
                        'Trades',
                    ],
                },
                'private': {
                    'post': [
                        'AddOrder',
                        'Balance',
                        'CancelOrder',
                        'ClosedOrders',
                        'DepositAddresses',
                        'DepositMethods',
                        'DepositStatus',
                        'Ledgers',
                        'OpenOrders',
                        'OpenPositions',
                        'QueryLedgers',
                        'QueryOrders',
                        'QueryTrades',
                        'TradeBalance',
                        'TradesHistory',
                        'TradeVolume',
                        'Withdraw',
                        'WithdrawCancel',
                        'WithdrawInfo',
                        'WithdrawStatus',
                    ],
                },
            },
        })

    def cost_to_precision(self, symbol, cost):
        return self.truncate(float(cost), self.markets[symbol]['precision']['price'])

    def fee_to_precision(self, symbol, fee):
        return self.truncate(float(fee), self.markets[symbol]['precision']['amount'])

    def handle_errors(self, code, reason, url, method, headers, body):
        if body.find('Invalid nonce') >= 0:
            raise InvalidNonce(self.id + ' ' + body)
        if body.find('Insufficient funds') >= 0:
            raise InsufficientFunds(self.id + ' ' + body)
        if body.find('Cancel pending') >= 0:
            raise CancelPending(self.id + ' ' + body)
        if body.find('Invalid arguments:volume') >= 0:
            raise InvalidOrder(self.id + ' ' + body)

    async def fetch_markets(self):
        markets = await self.publicGetAssetPairs()
        keys = list(markets['result'].keys())
        result = []
        for i in range(0, len(keys)):
            id = keys[i]
            market = markets['result'][id]
            base = market['base']
            quote = market['quote']
            if (base[0] == 'X') or (base[0] == 'Z'):
                base = base[1:]
            if (quote[0] == 'X') or (quote[0] == 'Z'):
                quote = quote[1:]
            base = self.common_currency_code(base)
            quote = self.common_currency_code(quote)
            darkpool = id.find('.d') >= 0
            symbol = market['altname'] if darkpool else(base + '/' + quote)
            maker = None
            if 'fees_maker' in market:
                maker = float(market['fees_maker'][0][1]) / 100
            precision = {
                'amount': market['lot_decimals'],
                'price': market['pair_decimals'],
            }
            lot = math.pow(10, -precision['amount'])
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'darkpool': darkpool,
                'info': market,
                'altname': market['altname'],
                'maker': maker,
                'taker': float(market['fees'][0][1]) / 100,
                'lot': lot,
                'active': True,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': lot,
                        'max': math.pow(10, precision['amount']),
                    },
                    'price': {
                        'min': math.pow(10, -precision['price']),
                        'max': None,
                    },
                    'cost': {
                        'min': 0,
                        'max': None,
                    },
                },
            })
        result = self.append_inactive_markets(result)
        self.marketsByAltname = self.index_by(result, 'altname')
        return result

    def append_inactive_markets(self, result=[]):
        precision = {'amount': 8, 'price': 8}
        costLimits = {'min': 0, 'max': None}
        priceLimits = {'min': math.pow(10, -precision['price']), 'max': None}
        amountLimits = {'min': math.pow(10, -precision['amount']), 'max': math.pow(10, precision['amount'])}
        limits = {'amount': amountLimits, 'price': priceLimits, 'cost': costLimits}
        defaults = {
            'darkpool': False,
            'info': None,
            'maker': None,
            'taker': None,
            'lot': amountLimits['min'],
            'active': False,
            'precision': precision,
            'limits': limits,
        }
        markets = [
            {'id': 'XXLMZEUR', 'symbol': 'XLM/EUR', 'base': 'XLM', 'quote': 'EUR', 'altname': 'XLMEUR'},
        ]
        for i in range(0, len(markets)):
            result.append(self.extend(defaults, markets[i]))
        return result

    async def fetch_currencies(self, params={}):
        response = await self.publicGetAssets(params)
        currencies = response['result']
        ids = list(currencies.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            currency = currencies[id]
            # todo: will need to rethink the fees
            # to add support for multiple withdrawal/deposit methods and
            # differentiated fees for each particular method
            code = self.common_currency_code(currency['altname'])
            precision = currency['decimals']
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': code,
                'active': True,
                'status': 'ok',
                'fee': None,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'price': {
                        'min': math.pow(10, -precision),
                        'max': math.pow(10, precision),
                    },
                    'cost': {
                        'min': None,
                        'max': None,
                    },
                    'withdraw': {
                        'min': None,
                        'max': math.pow(10, precision),
                    },
                },
            }
        return result

    async def fetch_order_book(self, symbol, params={}):
        await self.load_markets()
        darkpool = symbol.find('.d') >= 0
        if darkpool:
            raise ExchangeError(self.id + ' does not provide an order book for darkpool symbol ' + symbol)
        market = self.market(symbol)
        response = await self.publicGetDepth(self.extend({
            'pair': market['id'],
        }, params))
        orderbook = response['result'][market['id']]
        return self.parse_order_book(orderbook)

    def parse_ticker(self, ticker, market=None):
        timestamp = self.milliseconds()
        symbol = None
        if market:
            symbol = market['symbol']
        baseVolume = float(ticker['v'][1])
        vwap = float(ticker['p'][1])
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['h'][1]),
            'low': float(ticker['l'][1]),
            'bid': float(ticker['b'][0]),
            'ask': float(ticker['a'][0]),
            'vwap': vwap,
            'open': float(ticker['o']),
            'close': None,
            'first': None,
            'last': float(ticker['c'][0]),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    async def fetch_tickers(self, symbols=None, params={}):
        await self.load_markets()
        pairs = []
        for s in range(0, len(self.symbols)):
            symbol = self.symbols[s]
            market = self.markets[symbol]
            if market['active']:
                if not market['darkpool']:
                    pairs.append(market['id'])
        filter = ','.join(pairs)
        response = await self.publicGetTicker(self.extend({
            'pair': filter,
        }, params))
        tickers = response['result']
        ids = list(tickers.keys())
        result = {}
        for i in range(0, len(ids)):
            id = ids[i]
            market = self.markets_by_id[id]
            symbol = market['symbol']
            ticker = tickers[id]
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    async def fetch_ticker(self, symbol, params={}):
        await self.load_markets()
        darkpool = symbol.find('.d') >= 0
        if darkpool:
            raise ExchangeError(self.id + ' does not provide a ticker for darkpool symbol ' + symbol)
        market = self.market(symbol)
        response = await self.publicGetTicker(self.extend({
            'pair': market['id'],
        }, params))
        ticker = response['result'][market['id']]
        return self.parse_ticker(ticker, market)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv[0] * 1000,
            float(ohlcv[1]),
            float(ohlcv[2]),
            float(ohlcv[3]),
            float(ohlcv[4]),
            float(ohlcv[6]),
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        request = {
            'pair': market['id'],
            'interval': self.timeframes[timeframe],
        }
        if since:
            request['since'] = int(since / 1000)
        response = await self.publicGetOHLC(self.extend(request, params))
        ohlcvs = response['result'][market['id']]
        return self.parse_ohlcvs(ohlcvs, market, timeframe, since, limit)

    def parse_trade(self, trade, market=None):
        timestamp = None
        side = None
        type = None
        price = None
        amount = None
        id = None
        order = None
        fee = None
        if not market:
            market = self.find_market_by_altname_or_id(trade['pair'])
        if 'ordertxid' in trade:
            order = trade['ordertxid']
            id = trade['id']
            timestamp = int(trade['time'] * 1000)
            side = trade['type']
            type = trade['ordertype']
            price = float(trade['price'])
            amount = float(trade['vol'])
            if 'fee' in trade:
                currency = None
                if market:
                    currency = market['quote']
                fee = {
                    'cost': float(trade['fee']),
                    'currency': currency,
                }
        else:
            timestamp = int(trade[2] * 1000)
            side = 'sell' if (trade[3] == 's') else 'buy'
            type = 'limit' if (trade[4] == 'l') else 'market'
            price = float(trade[0])
            amount = float(trade[1])
        symbol = market['symbol'] if (market) else None
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'fee': fee,
        }

    async def fetch_trades(self, symbol, since=None, limit=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        id = market['id']
        response = await self.publicGetTrades(self.extend({
            'pair': id,
        }, params))
        trades = response['result'][id]
        return self.parse_trades(trades, market, since, limit)

    async def fetch_balance(self, params={}):
        await self.load_markets()
        response = await self.privatePostBalance()
        balances = response['result']
        result = {'info': balances}
        currencies = list(balances.keys())
        for c in range(0, len(currencies)):
            currency = currencies[c]
            code = currency
            # X-ISO4217-A3 standard currency codes
            if code[0] == 'X':
                code = code[1:]
            elif code[0] == 'Z':
                code = code[1:]
            code = self.common_currency_code(code)
            balance = float(balances[currency])
            account = {
                'free': balance,
                'used': 0.0,
                'total': balance,
            }
            result[code] = account
        return self.parse_balance(result)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        await self.load_markets()
        market = self.market(symbol)
        order = {
            'pair': market['id'],
            'type': side,
            'ordertype': type,
            'volume': self.amount_to_precision(symbol, amount),
        }
        if type == 'limit':
            order['price'] = self.price_to_precision(symbol, price)
        response = await self.privatePostAddOrder(self.extend(order, params))
        length = len(response['result']['txid'])
        id = response['result']['txid'] if (length > 1) else response['result']['txid'][0]
        return {
            'info': response,
            'id': id,
        }

    def find_market_by_altname_or_id(self, id):
        result = None
        if id in self.marketsByAltname:
            result = self.marketsByAltname[id]
        elif id in self.markets_by_id:
            result = self.markets_by_id[id]
        return result

    def parse_order(self, order, market=None):
        description = order['descr']
        side = description['type']
        type = description['ordertype']
        symbol = None
        if not market:
            market = self.find_market_by_altname_or_id(description['pair'])
        timestamp = int(order['opentm'] * 1000)
        amount = float(order['vol'])
        filled = float(order['vol_exec'])
        remaining = amount - filled
        fee = None
        cost = self.safe_float(order, 'cost')
        price = self.safe_float(description, 'price')
        if not price:
            price = self.safe_float(order, 'price')
        if market:
            symbol = market['symbol']
            if 'fee' in order:
                flags = order['oflags']
                feeCost = self.safe_float(order, 'fee')
                fee = {
                    'cost': feeCost,
                    'rate': None,
                }
                if flags.find('fciq') >= 0:
                    fee['currency'] = market['quote']
                elif flags.find('fcib') >= 0:
                    fee['currency'] = market['base']
        return {
            'id': order['id'],
            'info': order,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'status': order['status'],
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            # 'trades': self.parse_trades(order['trades'], market),
        }

    def parse_orders(self, orders, market=None, since=None, limit=None):
        result = []
        ids = list(orders.keys())
        for i in range(0, len(ids)):
            id = ids[i]
            order = self.extend({'id': id}, orders[id])
            result.append(self.parse_order(order, market))
        return self.filter_by_since_limit(result, since, limit)

    async def fetch_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = await self.privatePostQueryOrders(self.extend({
            'trades': True,  # whether or not to include trades in output(optional, default False)
            'txid': id,  # comma delimited list of transaction ids to query info about(20 maximum)
            # 'userref': 'optional',  # restrict results to given user reference id(optional)
        }, params))
        orders = response['result']
        order = self.parse_order(self.extend({'id': id}, orders[id]))
        return self.extend({'info': response}, order)

    async def fetch_my_trades(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {
            # 'type': 'all',  # any position, closed position, closing position, no position
            # 'trades': False,  # whether or not to include trades related to position in output
            # 'start': 1234567890,  # starting unix timestamp or trade tx id of results(exclusive)
            # 'end': 1234567890,  # ending unix timestamp or trade tx id of results(inclusive)
            # 'ofs' = result offset
        }
        if since:
            request['start'] = int(since / 1000)
        response = await self.privatePostTradesHistory(self.extend(request, params))
        trades = response['result']['trades']
        ids = list(trades.keys())
        for i in range(0, len(ids)):
            trades[ids[i]]['id'] = ids[i]
        return self.parse_trades(trades, None, since, limit)

    async def cancel_order(self, id, symbol=None, params={}):
        await self.load_markets()
        response = None
        try:
            response = await self.privatePostCancelOrder(self.extend({
                'txid': id,
            }, params))
        except Exception as e:
            if self.last_http_response:
                if self.last_http_response.find('EOrder:Unknown order') >= 0:
                    raise OrderNotFound(self.id + ' cancelOrder() error ' + self.last_http_response)
            raise e
        return response

    async def fetch_open_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        if since:
            request['start'] = int(since / 1000)
        response = await self.privatePostOpenOrders(self.extend(request, params))
        orders = self.parse_orders(response['result']['open'], None, since, limit)
        return self.filter_orders_by_symbol(orders, symbol)

    async def fetch_closed_orders(self, symbol=None, since=None, limit=None, params={}):
        await self.load_markets()
        request = {}
        if since:
            request['start'] = int(since / 1000)
        response = await self.privatePostClosedOrders(self.extend(request, params))
        orders = self.parse_orders(response['result']['closed'], None, since, limit)
        return self.filter_orders_by_symbol(orders, symbol)

    async def fetch_deposit_methods(self, code=None, params={}):
        await self.load_markets()
        request = {}
        if code:
            currency = self.currency(code)
            request['asset'] = currency['id']
        response = await self.privatePostDepositMethods(self.extend(request, params))
        return response['result']

    async def create_deposit_address(self, currency, params={}):
        request = {
            'new': 'true',
        }
        response = await self.fetch_deposit_address(currency, self.extend(request, params))
        return {
            'currency': currency,
            'address': response['address'],
            'status': 'ok',
            'info': response,
        }

    async def fetch_deposit_address(self, code, params={}):
        method = self.safe_value(params, 'method')
        if not method:
            raise ExchangeError(self.id + ' fetchDepositAddress() requires an extra `method` parameter')
        await self.load_markets()
        currency = self.currency(code)
        request = {
            'asset': currency['id'],
            'method': method,
            'new': 'false',
        }
        response = await self.privatePostDepositAddresses(self.extend(request, params))
        result = response['result']
        numResults = len(result)
        if numResults < 1:
            raise ExchangeError(self.id + ' privatePostDepositAddresses() returned no addresses')
        address = self.safe_string(result[0], 'address')
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        }

    async def withdraw(self, currency, amount, address, params={}):
        if 'key' in params:
            await self.load_markets()
            response = await self.privatePostWithdraw(self.extend({
                'asset': currency,
                'amount': amount,
                # 'address': address,  # they don't allow withdrawals to direct addresses
            }, params))
            return {
                'info': response,
                'id': response['result'],
            }
        raise ExchangeError(self.id + " withdraw requires a 'key' parameter(withdrawal key name, as set up on your account)")

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = '/' + self.version + '/' + api + '/' + path
        if api == 'public':
            if params:
                url += '?' + self.urlencode(params)
        else:
            self.check_required_credentials()
            nonce = str(self.nonce())
            body = self.urlencode(self.extend({'nonce': nonce}, params))
            auth = self.encode(nonce + body)
            hash = self.hash(auth, 'sha256', 'binary')
            binary = self.encode(url)
            binhash = self.binary_concat(binary, hash)
            secret = base64.b64decode(self.secret)
            signature = self.hmac(binhash, secret, hashlib.sha512, 'base64')
            headers = {
                'API-Key': self.apiKey,
                'API-Sign': self.decode(signature),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        url = self.urls['api'] + url
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def nonce(self):
        return self.milliseconds()

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'error' in response:
            numErrors = len(response['error'])
            if numErrors:
                for i in range(0, len(response['error'])):
                    if response['error'][i] == 'EService:Unavailable':
                        raise ExchangeNotAvailable(self.id + ' ' + self.json(response))
                    if response['error'][i] == 'EService:Busy':
                        raise DDoSProtection(self.id + ' ' + self.json(response))
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
