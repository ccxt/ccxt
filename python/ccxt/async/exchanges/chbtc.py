

class chbtc (Exchange):


    def describe(self):
        return self.deep_extend(super.describe(), {
            'id': 'chbtc',
            'name': 'CHBTC',
            'countries': 'CN',
            'rateLimit': 1000,
            'version': 'v1',
            'hasCORS': False,
            'hasFetchOrder': True,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg',
                'api': {
                    'public': 'http://api.chbtc.com/data',  # no https for public API
                    'private': 'https://trade.chbtc.com/api',
                },
                'www': 'https://trade.chbtc.com/api',
                'doc': 'https://www.chbtc.com/i/developer',
            },
            'api': {
                'public': {
                    'get': [
                        'ticker',
                        'depth',
                        'trades',
                        'kline',
                    ],
                },
                'private': {
                    'post': [
                        'order',
                        'cancelOrder',
                        'getOrder',
                        'getOrders',
                        'getOrdersNew',
                        'getOrdersIgnoreTradeType',
                        'getUnfinishedOrdersIgnoreTradeType',
                        'getAccountInfo',
                        'getUserAddress',
                        'getWithdrawAddress',
                        'getWithdrawRecord',
                        'getChargeRecord',
                        'getCnyWithdrawRecord',
                        'getCnyChargeRecord',
                        'withdraw',
                    ],
                },
            },
            'markets': {
                'BTC/CNY': {'id': 'btc_cny', 'symbol': 'BTC/CNY', 'base': 'BTC', 'quote': 'CNY'},
                'LTC/CNY': {'id': 'ltc_cny', 'symbol': 'LTC/CNY', 'base': 'LTC', 'quote': 'CNY'},
                'ETH/CNY': {'id': 'eth_cny', 'symbol': 'ETH/CNY', 'base': 'ETH', 'quote': 'CNY'},
                'ETC/CNY': {'id': 'etc_cny', 'symbol': 'ETC/CNY', 'base': 'ETC', 'quote': 'CNY'},
                'BTS/CNY': {'id': 'bts_cny', 'symbol': 'BTS/CNY', 'base': 'BTS', 'quote': 'CNY'},
                # 'EOS/CNY': {'id': 'eos_cny', 'symbol': 'EOS/CNY', 'base': 'EOS', 'quote': 'CNY'},
                'BCH/CNY': {'id': 'bcc_cny', 'symbol': 'BCH/CNY', 'base': 'BCH', 'quote': 'CNY'},
                'HSR/CNY': {'id': 'hsr_cny', 'symbol': 'HSR/CNY', 'base': 'HSR', 'quote': 'CNY'},
                'QTUM/CNY': {'id': 'qtum_cny', 'symbol': 'QTUM/CNY', 'base': 'QTUM', 'quote': 'CNY'},
            },
        })

    async def fetch_balance(self, params={}):
        response = await self.privatePostGetAccountInfo()
        balances = response['result']
        result = {'info': balances}
        for c in range(0, len(self.currencies)):
            currency = self.currencies[c]
            account = self.account()
            if currency in balances['balance']:
                account['free'] = float(balances['balance'][currency]['amount'])
            if currency in balances['frozen']:
                account['used'] = float(balances['frozen'][currency]['amount'])
            account['total'] = self.sum(account['free'], account['used'])
            result[currency] = account
        return self.parse_balance(result)

    async def fetch_order_book(self, symbol, params={}):
        market = self.market(symbol)
        orderbook = await self.publicGetDepth(self.extend({
            'currency': market['id'],
        }, params))
        timestamp = self.milliseconds()
        bids = None
        asks = None
        if 'bids' in orderbook:
            bids = orderbook['bids']
        if 'asks' in orderbook:
            asks = orderbook['asks']
        result = {
            'bids': bids,
            'asks': asks,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
        }
        if result['bids']:
            result['bids'] = self.sort_by(result['bids'], 0, True)
        if result['asks']:
            result['asks'] = self.sort_by(result['asks'], 0)
        return result

    async def fetch_ticker(self, symbol, params={}):
        response = await self.publicGetTicker(self.extend({
            'currency': self.market_id(symbol),
        }, params))
        ticker = response['ticker']
        timestamp = self.milliseconds()
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['buy']),
            'ask': float(ticker['sell']),
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': None,
            'quoteVolume': float(ticker['vol']),
            'info': ticker,
        }

    def parse_trade(self, trade, market=None):
        timestamp = trade['date'] * 1000
        side = 'buy' if (trade['trade_type'] == 'bid') else 'sell'
        return {
            'info': trade,
            'id': str(trade['tid']),
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': trade['price'],
            'amount': trade['amount'],
        }

    async def fetch_trades(self, symbol, params={}):
        await self.load_markets()
        market = self.market(symbol)
        response = await self.publicGetTrades(self.extend({
            'currency': market['id'],
        }, params))
        return self.parse_trades(response, market)

    async def create_order(self, symbol, type, side, amount, price=None, params={}):
        paramString = '&price=' + str(price)
        paramString += '&amount=' + str(amount)
        tradeType = '1' if (side == 'buy') else '0'
        paramString += '&tradeType=' + tradeType
        paramString += '&currency=' + self.market_id(symbol)
        response = await self.privatePostOrder(paramString)
        return {
            'info': response,
            'id': response['id'],
        }

    async def cancel_order(self, id, symbol=None, params={}):
        paramString = '&id=' + str(id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return await self.privatePostCancelOrder(paramString)

    async def fetch_order(self, id, symbol=None, params={}):
        paramString = '&id=' + str(id)
        if 'currency' in params:
            paramString += '&currency=' + params['currency']
        return await self.privatePostGetOrder(paramString)

    def nonce(self):
        return self.milliseconds()

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api]
        if api == 'public':
            url += '/' + self.version + '/' + path
            if params:
                url += '?' + self.urlencode(params)
        else:
            paramsLength = len(params)  # params should be a string here
            nonce = self.nonce()
            auth = 'method=' + path
            auth += '&accesskey=' + self.apiKey
            auth += params if paramsLength else ''
            secret = self.hash(self.encode(self.secret), 'sha1')
            signature = self.hmac(self.encode(auth), self.encode(secret), hashlib.md5)
            suffix = 'sign=' + signature + '&reqTime=' + str(nonce)
            url += '/' + path + '?' + auth + '&' + suffix
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    async def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = await self.fetch2(path, api, method, params, headers, body)
        if api == 'private':
            if 'code' in response:
                raise ExchangeError(self.id + ' ' + self.json(response))
        return response
