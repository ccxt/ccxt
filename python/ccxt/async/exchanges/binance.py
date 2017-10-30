# -*- coding: utf-8 -*-

from ccxt.exchange import Exchange

class binance (Exchange):

    def describe(self):
        return self.deep_extend(super(binance, self).describe(), {
            'id': 'binance',
            'name': 'Binance',
            'countries': 'CN',  # China
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchOHLCV': True,
            'hasFetchMyTrades': True,
            'hasFetchOrder': True,
            'hasFetchOrders': True,
            'hasFetchOpenOrders': True,
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '8h': '8h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg',
                'api': {
                    'web': 'https://www.binance.com',
                    'wapi': 'https://www.binance.com/wapi',
                    'public': 'https://www.binance.com/api',
                    'private': 'https://www.binance.com/api',
                },
                'www': 'https://www.binance.com',
                'doc': 'https://www.binance.com/restapipub.html',
                'fees': 'https://binance.zendesk.com/hc/en-us/articles/115000429332',
            },
            'api': {
                'web': {
                    'get': [
                        'exchange/public/product',
                    ],
                },
                'wapi': {
                    'post': [
                        'withdraw',
                        'getDepositHistory',
                        'getWithdrawHistory',
                    ],
                },
                'public': {
                    'get': [
                        'ping',
                        'time',
                        'depth',
                        'aggTrades',
                        'klines',
                        'ticker/24hr',
                    ],
                },
                'private': {
                    'get': [
                        'order',
                        'openOrders',
                        'allOrders',
                        'account',
                        'myTrades',
                    ],
                    'post': [
                        'order',
                        'order/test',
                        'userDataStream',
                    ],
                    'put': [
                        'userDataStream'
                    ],
                    'delete': [
                        'order',
                        'userDataStream',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.001,
                    'maker': 0.001,
                },
                'funding': {
                    'withdraw': {
                        'BNB': 1.0,
                        'BTC': 0.0005,
                        'ETH': 0.005,
                        'LTC': 0.001,
                        'NEO': 0.0,
                        'QTUM': 0.1,
                        'SNT': 1.0,
                        'EOS': 0.1,
                        'BCH': None,
                        'GAS': 0.0,
                        'USDT': 5.0,
                        'HSR': 0.0001,
                        'OAX': 0.1,
                        'DNT': 1.0,
                        'MCO': 0.1,
                        'ICN': 0.1,
                        'WTC': 0.1,
                        'OMG': 0.1,
                        'ZRX': 1.0,
                        'STRAT': 0.1,
                        'SNGLS': 1.0,
                        'BQX': 1.0,
                    },
                },
            },
            'precision': {
                'amount': 6,
                'price': 6,
            },
            'markets': {
                'ETH/BTC': {'id': 'ETHBTC', 'symbol': 'ETH/BTC', 'base': 'ETH', 'quote': 'BTC', 'lot': 0.001, 'limits': {'amount': {'min': 0.001, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'LTC/BTC': {'id': 'LTCBTC', 'symbol': 'LTC/BTC', 'base': 'LTC', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'BNB/BTC': {'id': 'BNBBTC', 'symbol': 'BNB/BTC', 'base': 'BNB', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'NEO/BTC': {'id': 'NEOBTC', 'symbol': 'NEO/BTC', 'base': 'NEO', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'GAS/BTC': {'id': 'GASBTC', 'symbol': 'GAS/BTC', 'base': 'GAS', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'BCH/BTC': {'id': 'BCCBTC', 'symbol': 'BCH/BTC', 'base': 'BCH', 'quote': 'BTC', 'lot': 0.001, 'limits': {'amount': {'min': 0.001, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'MCO/BTC': {'id': 'MCOBTC', 'symbol': 'MCO/BTC', 'base': 'MCO', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'WTC/BTC': {'id': 'WTCBTC', 'symbol': 'WTC/BTC', 'base': 'WTC', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'OMG/BTC': {'id': 'OMGBTC', 'symbol': 'OMG/BTC', 'base': 'OMG', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'ZRX/BTC': {'id': 'ZRXBTC', 'symbol': 'ZRX/BTC', 'base': 'ZRX', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'BQX/BTC': {'id': 'BQXBTC', 'symbol': 'BQX/BTC', 'base': 'BQX', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'KNC/BTC': {'id': 'KNCBTC', 'symbol': 'KNC/BTC', 'base': 'KNC', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'FUN/BTC': {'id': 'FUNBTC', 'symbol': 'FUN/BTC', 'base': 'FUN', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'SNM/BTC': {'id': 'SNMBTC', 'symbol': 'SNM/BTC', 'base': 'SNM', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'XVG/BTC': {'id': 'XVGBTC', 'symbol': 'XVG/BTC', 'base': 'XVG', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'CTR/BTC': {'id': 'CTRBTC', 'symbol': 'CTR/BTC', 'base': 'CTR', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'BNB/ETH': {'id': 'BNBETH', 'symbol': 'BNB/ETH', 'base': 'BNB', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'SNT/ETH': {'id': 'SNTETH', 'symbol': 'SNT/ETH', 'base': 'SNT', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'BNT/ETH': {'id': 'BNTETH', 'symbol': 'BNT/ETH', 'base': 'BNT', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'EOS/ETH': {'id': 'EOSETH', 'symbol': 'EOS/ETH', 'base': 'EOS', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'OAX/ETH': {'id': 'OAXETH', 'symbol': 'OAX/ETH', 'base': 'OAX', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'DNT/ETH': {'id': 'DNTETH', 'symbol': 'DNT/ETH', 'base': 'DNT', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'MCO/ETH': {'id': 'MCOETH', 'symbol': 'MCO/ETH', 'base': 'MCO', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'ICN/ETH': {'id': 'ICNETH', 'symbol': 'ICN/ETH', 'base': 'ICN', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'WTC/ETH': {'id': 'WTCETH', 'symbol': 'WTC/ETH', 'base': 'WTC', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'OMG/ETH': {'id': 'OMGETH', 'symbol': 'OMG/ETH', 'base': 'OMG', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'ZRX/ETH': {'id': 'ZRXETH', 'symbol': 'ZRX/ETH', 'base': 'ZRX', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'BQX/ETH': {'id': 'BQXETH', 'symbol': 'BQX/ETH', 'base': 'BQX', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.0000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'KNC/ETH': {'id': 'KNCETH', 'symbol': 'KNC/ETH', 'base': 'KNC', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.0000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'FUN/ETH': {'id': 'FUNETH', 'symbol': 'FUN/ETH', 'base': 'FUN', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'SNM/ETH': {'id': 'SNMETH', 'symbol': 'SNM/ETH', 'base': 'SNM', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'NEO/ETH': {'id': 'NEOETH', 'symbol': 'NEO/ETH', 'base': 'NEO', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'XVG/ETH': {'id': 'XVGETH', 'symbol': 'XVG/ETH', 'base': 'XVG', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'CTR/ETH': {'id': 'CTRETH', 'symbol': 'CTR/ETH', 'base': 'CTR', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.0000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'QTUM/BTC': {'id': 'QTUMBTC', 'symbol': 'QTUM/BTC', 'base': 'QTUM', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'LINK/BTC': {'id': 'LINKBTC', 'symbol': 'LINK/BTC', 'base': 'LINK', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'SALT/BTC': {'id': 'SALTBTC', 'symbol': 'SALT/BTC', 'base': 'SALT', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'IOTA/BTC': {'id': 'IOTABTC', 'symbol': 'IOTA/BTC', 'base': 'IOTA', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'QTUM/ETH': {'id': 'QTUMETH', 'symbol': 'QTUM/ETH', 'base': 'QTUM', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'LINK/ETH': {'id': 'LINKETH', 'symbol': 'LINK/ETH', 'base': 'LINK', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'SALT/ETH': {'id': 'SALTETH', 'symbol': 'SALT/ETH', 'base': 'SALT', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'IOTA/ETH': {'id': 'IOTAETH', 'symbol': 'IOTA/ETH', 'base': 'IOTA', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'BTC/USDT': {'id': 'BTCUSDT', 'symbol': 'BTC/USDT', 'base': 'BTC', 'quote': 'USDT', 'lot': 0.000001, 'limits': {'amount': {'min': 0.000001, 'max': None}, 'price': {'min': 0.01, 'max': None}, 'cost': {'min': 1, 'max': None}}},
                'ETH/USDT': {'id': 'ETHUSDT', 'symbol': 'ETH/USDT', 'base': 'ETH', 'quote': 'USDT', 'lot': 0.00001, 'limits': {'amount': {'min': 0.00001, 'max': None}, 'price': {'min': 0.01, 'max': None}, 'cost': {'min': 1, 'max': None}}},
                'STRAT/ETH': {'id': 'STRATETH', 'symbol': 'STRAT/ETH', 'base': 'STRAT', 'quote': 'ETH', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'SNGLS/ETH': {'id': 'SNGLSETH', 'symbol': 'SNGLS/ETH', 'base': 'SNGLS', 'quote': 'ETH', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.01, 'max': None}}},
                'STRAT/BTC': {'id': 'STRATBTC', 'symbol': 'STRAT/BTC', 'base': 'STRAT', 'quote': 'BTC', 'lot': 0.01, 'limits': {'amount': {'min': 0.01, 'max': None}, 'price': {'min': 0.000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
                'SNGLS/BTC': {'id': 'SNGLSBTC', 'symbol': 'SNGLS/BTC', 'base': 'SNGLS', 'quote': 'BTC', 'lot': 1, 'limits': {'amount': {'min': 1, 'max': None}, 'price': {'min': 0.00000001, 'max': None}, 'cost': {'min': 0.001, 'max': None}}},
            },
        })

    def calculate_fee(self, symbol, type, side, amount, price, takerOrMaker='taker', params={}):
        market = self.markets[symbol]
        key = 'quote'
        rate = market[takerOrMaker]
        cost = float(self.cost_to_precision(symbol, amount * rate))
        if side == 'sell':
            cost *= price
        else:
            key = 'base'
        return {
            'currency': market[key],
            'rate': rate,
            'cost': float(self.fee_to_precision(symbol, cost)),
        }

    async def fetch_balance(self, params={}):
        response = await self.privateGetAccount(params)
        result = {'info': response}
        balances = response['balances']
        for i in range(0, len(balances)):
            balance = balances[i]
            asset = balance['asset']
            currency = self.common_currency_code(asset)
            account = {
                'free': float(balance['free']),
                'used': float(balance['locked']),
                'total': 0.0,
            }
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        orderbook = await self.publicGetDepth(self.extend({
            'symbol': market['id'],
            'limit': 100,  # default = maximum = 100
        }, params))
        return self.parse_order_book(orderbook)

    def parse_ticker(self, ticker, market):
        timestamp = ticker['closeTime']
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['highPrice']),
            'low': float(ticker['lowPrice']),
            'bid': float(ticker['bidPrice']),
            'ask': float(ticker['askPrice']),
            'vwap': float(ticker['weightedAvgPrice']),
            'open': float(ticker['openPrice']),
            'close': float(ticker['prevClosePrice']),
            'first': None,
            'last': float(ticker['lastPrice']),
            'change': float(ticker['priceChangePercent']),
            'percentage': None,
            'average': None,
            'baseVolume': float(ticker['volume']),
            'quoteVolume': float(ticker['quoteVolume']),
            'info': ticker,
        }

    async def fetch_ticker(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetTicker24hr(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_ticker(response, market)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            ohlcv[0],
            float(ohlcv[1]),
            float(ohlcv[2]),
            float(ohlcv[3]),
            float(ohlcv[4]),
            float(ohlcv[5]),
        ]

    async def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        market = self.market(symbol)
        request = {
            'symbol': market['id'],
            'interval': self.timeframes[timeframe],
        }
        request['limit'] = limit if (limit) else 500  # default == max == 500
        if since:
            request['startTime'] = since
        response = await self.publicGetKlines(self.extend(request, params))
        return self.parse_ohlcvs(response, market, timeframe, since, limit)

    def parse_trade(self, trade, market=None):
        timestampField = 'T' if ('T' in list(trade.keys())) else 'time'
        timestamp = trade[timestampField]
        priceField = 'p' if ('p' in list(trade.keys())) else 'price'
        price = float(trade[priceField])
        amountField = 'q' if ('q' in list(trade.keys())) else 'qty'
        amount = float(trade[amountField])
        idField = 'a' if ('a' in list(trade.keys())) else 'id'
        id = str(trade[idField])
        side = None
        order = None
        if 'orderId' in trade:
            order = str(trade['orderId'])
        if 'm' in trade:
            side = 'sell'
            if trade['m']:
                side = 'buy'
        else:
            side = 'buy' if (trade['isBuyer']) else 'sell'
        fee = None
        if 'commission' in trade:
            fee = {
                'cost': float(trade['commission']),
                'currency': trade['commissionAsset'],
            }
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'id': id,
            'order': order,
            'type': None,
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'fee': fee,
        }

    async def fetch_trades(self, symbol, params={}):
        market = self.market(symbol)
        response = await self.publicGetAggTrades(self.extend({
            'symbol': market['id'],
            # 'fromId': 123,    # ID to get aggregate trades from INCLUSIVE.
            # 'startTime': 456,  # Timestamp in ms to get aggregate trades from INCLUSIVE.
            # 'endTime': 789,   # Timestamp in ms to get aggregate trades until INCLUSIVE.
            'limit': 500,        # default = maximum = 500
        }, params))
        return self.parse_trades(response, market)

    def parse_order_status(self, status):
        if status == 'NEW':
            return 'open'
        if status == 'PARTIALLY_FILLED':
            return 'partial'
        if status == 'FILLED':
            return 'closed'
        if status == 'CANCELED':
            return 'canceled'
        return status.lower()

    def parse_order(self, order, market=None):
        status = self.parse_order_status(order['status'])
        symbol = None
        if market:
            symbol = market['symbol']
        else:
            id = order['symbol']
            if id in self.markets_by_id:
                market = self.markets_by_id[id]
                symbol = market['symbol']
        timestamp = order['time']
        price = float(order['price'])
        amount = float(order['origQty'])
        filled = self.safe_float(order, 'executedQty', 0.0)
        remaining = max(amount - filled, 0.0)
        result = {
            'info': order,
            'id': str(order['orderId']),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': symbol,
            'type': order['type'].lower(),
            'side': order['side'].lower(),
            'price': price,
            'amount': amount,
            'cost': price * amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': None,
        }
        return result

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        market = self.market(symbol)
        order = {
            'symbol': market['id'],
            'quantity': self.amount_to_precision(symbol, amount),
            'type': type.upper(),
            'side': side.upper(),
        }
        if type == 'limit':
            order = self.extend(order, {
                'price': self.price_to_precision(symbol, price),
                'timeInForce': 'GTC',  # 'GTC' = Good To Cancel(default), 'IOC' = Immediate Or Cancel
            })
        response = await self.privatePostOrder(self.extend(order, params))
        return {
            'info': response,
            'id': str(response['orderId']),
        }

    async def fetch_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrder requires a symbol param')
        market = self.market(symbol)
        response = await self.privateGetOrder(self.extend({
            'symbol': market['id'],
            'orderId': int(id),
        }, params))
        return self.parse_order(response, market)

    async def fetch_orders(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOrders requires a symbol param')
        market = self.market(symbol)
        response = await self.privateGetAllOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_orders(response, market)

    async def fetch_open_orders(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchOpenOrders requires a symbol param')
        market = self.market(symbol)
        response = await self.privateGetOpenOrders(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_orders(response, market)

    async def cancel_order(self, id, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' cancelOrder requires a symbol param')
        market = self.market(symbol)
        response = None
        try:
            response = await self.privateDeleteOrder(self.extend({
                'symbol': market['id'],
                'orderId': int(id),
                # 'origClientOrderId': id,
            }, params))
        except Exception as e:
            if self.last_http_response.find('UNKNOWN_ORDER') >= 0:
                raise OrderNotFound(self.id + ' cancelOrder() error: ' + self.last_http_response)
            raise e
        return response

    def nonce(self):
        return self.milliseconds()

    async def fetch_my_trades(self, symbol=None, params={}):
        if not symbol:
            raise ExchangeError(self.id + ' fetchMyTrades requires a symbol')
        market = self.market(symbol)
        response = await self.privateGetMyTrades(self.extend({
            'symbol': market['id'],
        }, params))
        return self.parse_trades(response, market)

    async def withdraw(self, currency, amount, address, params={}):
        response = await self.wapiPostWithdraw(self.extend({
            'asset': currency,
            'address': address,
            'amount': float(amount),
        }, params))
        return {
            'info': response,
            'id': None,
        }

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api != 'web':
            url += '/' + self.version
        url += '/' + path
        if api == 'wapi':
            url += '.html'
        if (api == 'private') or (api == 'wapi'):
            nonce = self.nonce()
            query = self.urlencode(self.extend({'timestamp': nonce}, params))
            auth = self.secret + '|' + query
            signature = self.hash(self.encode(auth), 'sha256')
            query += '&' + 'signature=' + signature
            headers = {
                'X-MBX-APIKEY': self.apiKey,
            }
            if method == 'GET':
                url += '?' + query
            else:
                body = query
                headers['Content-Type'] = 'application/x-www-form-urlencoded'
        else:
            if params:
                url += '?' + self.urlencode(params)
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if 'code' in response:
            if response['code'] < 0:
                if response['code'] == -2010:
                    raise InsufficientFunds(self.id + ' ' + self.json(response))
                if response['code'] == -2011:
                    raise OrderNotFound(self.id + ' ' + self.json(response))
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
