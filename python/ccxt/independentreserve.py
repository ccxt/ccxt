# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange


class independentreserve (Exchange):

    def describe(self):
        return self.deep_extend(super(independentreserve, self).describe(), {
            'id': 'independentreserve',
            'name': 'Independent Reserve',
            'countries': ['AU', 'NZ'],  # Australia, New Zealand
            'rateLimit': 1000,
            'hasCORS': False,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg',
                'api': {
                    'public': 'https://api.independentreserve.com/Public',
                    'private': 'https://api.independentreserve.com/Private',
                },
                'www': 'https://www.independentreserve.com',
                'doc': 'https://www.independentreserve.com/API',
            },
            'api': {
                'public': {
                    'get': [
                        'GetValidPrimaryCurrencyCodes',
                        'GetValidSecondaryCurrencyCodes',
                        'GetValidLimitOrderTypes',
                        'GetValidMarketOrderTypes',
                        'GetValidOrderTypes',
                        'GetValidTransactionTypes',
                        'GetMarketSummary',
                        'GetOrderBook',
                        'GetTradeHistorySummary',
                        'GetRecentTrades',
                        'GetFxRates',
                    ],
                },
                'private': {
                    'post': [
                        'PlaceLimitOrder',
                        'PlaceMarketOrder',
                        'CancelOrder',
                        'GetOpenOrders',
                        'GetClosedOrders',
                        'GetClosedFilledOrders',
                        'GetOrderDetails',
                        'GetAccounts',
                        'GetTransactions',
                        'GetDigitalCurrencyDepositAddress',
                        'GetDigitalCurrencyDepositAddresses',
                        'SynchDigitalCurrencyDepositAddressWithBlockchain',
                        'WithdrawDigitalCurrency',
                        'RequestFiatWithdrawal',
                        'GetTrades',
                    ],
                },
            },
        })

    def fetch_markets(self):
        baseCurrencies = self.publicGetValidPrimaryCurrencyCodes()
        quoteCurrencies = self.publicGetValidSecondaryCurrencyCodes()
        result = []
        for i in range(0, len(baseCurrencies)):
            baseId = baseCurrencies[i]
            baseIdUppercase = baseId.upper()
            base = self.common_currency_code(baseIdUppercase)
            for j in range(0, len(quoteCurrencies)):
                quoteId = quoteCurrencies[j]
                quoteIdUppercase = quoteId.upper()
                quote = self.common_currency_code(quoteIdUppercase)
                id = baseId + '/' + quoteId
                symbol = base + '/' + quote
                taker = 0.5 / 100
                maker = 0.5 / 100
                result.append({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'taker': taker,
                    'maker': maker,
                    'info': id,
                })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        balances = self.privatePostGetAccounts()
        result = {'info': balances}
        for i in range(0, len(balances)):
            balance = balances[i]
            currencyCode = balance['CurrencyCode']
            uppercase = currencyCode.upper()
            currency = self.common_currency_code(uppercase)
            account = self.account()
            account['free'] = balance['AvailableBalance']
            account['total'] = balance['TotalBalance']
            account['used'] = account['total'] - account['free']
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetOrderBook(self.extend({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params))
        timestamp = self.parse8601(response['CreatedTimestampUtc'])
        return self.parse_order_book(response, timestamp, 'BuyOrders', 'SellOrders', 'Price', 'Volume')

    def parse_ticker(self, ticker, market=None):
        timestamp = self.parse8601(ticker['CreatedTimestampUtc'])
        symbol = None
        if market:
            symbol = market['symbol']
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': ticker['DayHighestPrice'],
            'low': ticker['DayLowestPrice'],
            'bid': ticker['CurrentHighestBidPrice'],
            'ask': ticker['CurrentLowestOfferPrice'],
            'vwap': None,
            'open': None,
            'close': None,
            'first': None,
            'last': ticker['LastPrice'],
            'change': None,
            'percentage': None,
            'average': ticker['DayAvgPrice'],
            'baseVolume': ticker['DayVolumeXbtInSecondaryCurrrency'],
            'quoteVolume': None,
            'info': ticker,
        }

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetMarketSummary(self.extend({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
        }, params))
        return self.parse_ticker(response, market)

    def parse_trade(self, trade, market):
        timestamp = self.parse8601(trade['TradeTimestampUtc'])
        return {
            'id': None,
            'info': trade,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'order': None,
            'type': None,
            'side': None,
            'price': trade['SecondaryCurrencyTradePrice'],
            'amount': trade['PrimaryCurrencyAmount'],
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetRecentTrades(self.extend({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'numberOfRecentTradesToRetrieve': 50,  # max = 50
        }, params))
        return self.parse_trades(response['Trades'], market, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        capitalizedOrderType = self.capitalize(type)
        method = 'Place' + capitalizedOrderType + 'Order'
        orderType = capitalizedOrderType
        orderType += 'Offer' if (side == 'sell') else 'Bid'
        order = self.ordered({
            'primaryCurrencyCode': market['baseId'],
            'secondaryCurrencyCode': market['quoteId'],
            'orderType': orderType,
        })
        if type == 'limit':
            order['price'] = price
        order['volume'] = amount
        response = getattr(self, method)(self.extend(order, params))
        return {
            'info': response,
            'id': response['OrderGuid'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.privatePostCancelOrder({'orderGuid': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'][api] + '/' + path
        if api == 'public':
            if params:
                url += '?' + self.urlencode(params)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            auth = [
                url,
                'apiKey=' + self.apiKey,
                'nonce=' + str(nonce),
            ]
            keysorted = self.keysort(params)
            keys = list(keysorted.keys())
            for i in range(0, len(keys)):
                key = keys[i]
                auth.append(key + '=' + params[key])
            message = ','.join(auth)
            signature = self.hmac(self.encode(message), self.encode(self.secret))
            query = self.keysort(self.extend({
                'apiKey': self.apiKey,
                'nonce': nonce,
                'signature': signature,
            }, params))
            body = self.json(query)
            headers = {'Content-Type': 'application/json'}
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        # todo error handling
        return response
