# -*- coding: utf-8 -*-

from ccxt.base.exchange import Exchange
import hashlib
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import AuthenticationError


class gatecoin (Exchange):

    def describe(self):
        return self.deep_extend(super(gatecoin, self).describe(), {
            'id': 'gatecoin',
            'name': 'Gatecoin',
            'rateLimit': 2000,
            'countries': 'HK',  # Hong Kong
            'comment': 'a regulated/licensed exchange',
            'hasCORS': False,
            'hasFetchTickers': True,
            'hasFetchOHLCV': True,
            'timeframes': {
                '1m': '1m',
                '15m': '15m',
                '1h': '1h',
                '6h': '6h',
                '1d': '24h',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg',
                'api': 'https://api.gatecoin.com',
                'www': 'https://gatecoin.com',
                'doc': [
                    'https://gatecoin.com/api',
                    'https://github.com/Gatecoin/RESTful-API-Implementation',
                    'https://api.gatecoin.com/swagger-ui/index.html',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'Public/ExchangeRate',  # Get the exchange rates
                        'Public/LiveTicker',  # Get live ticker for all currency
                        'Public/LiveTicker/{CurrencyPair}',  # Get live ticker by currency
                        'Public/LiveTickers',  # Get live ticker for all currency
                        'Public/MarketDepth/{CurrencyPair}',  # Gets prices and market depth for the currency pair.
                        'Public/NetworkStatistics/{DigiCurrency}',  # Get the network status of a specific digital currency
                        'Public/StatisticHistory/{DigiCurrency}/{Typeofdata}',  # Get the historical data of a specific digital currency
                        'Public/TickerHistory/{CurrencyPair}/{Timeframe}',  # Get ticker history
                        'Public/Transactions/{CurrencyPair}',  # Gets recent transactions
                        'Public/TransactionsHistory/{CurrencyPair}',  # Gets all transactions
                        'Reference/BusinessNatureList',  # Get the business nature list.
                        'Reference/Countries',  # Get the country list.
                        'Reference/Currencies',  # Get the currency list.
                        'Reference/CurrencyPairs',  # Get the currency pair list.
                        'Reference/CurrentStatusList',  # Get the current status list.
                        'Reference/IdentydocumentTypes',  # Get the different types of identity documents possible.
                        'Reference/IncomeRangeList',  # Get the income range list.
                        'Reference/IncomeSourceList',  # Get the income source list.
                        'Reference/VerificationLevelList',  # Get the verif level list.
                        'Stream/PublicChannel',  # Get the public pubnub channel list
                    ],
                    'post': [
                        'Export/Transactions',  # Request a export of all trades from based on currencypair, start date and end date
                        'Ping',  # Post a string, then get it back.
                        'Public/Unsubscribe/{EmailCode}',  # Lets the user unsubscribe from emails
                        'RegisterUser',  # Initial trader registration.
                    ],
                },
                'private': {
                    'get': [
                        'Account/CorporateData',  # Get corporate account data
                        'Account/DocumentAddress',  # Check if residence proof uploaded
                        'Account/DocumentCorporation',  # Check if registered document uploaded
                        'Account/DocumentID',  # Check if ID document copy uploaded
                        'Account/DocumentInformation',  # Get Step3 Data
                        'Account/Email',  # Get user email
                        'Account/FeeRate',  # Get fee rate of logged in user
                        'Account/Level',  # Get verif level of logged in user
                        'Account/PersonalInformation',  # Get Step1 Data
                        'Account/Phone',  # Get user phone number
                        'Account/Profile',  # Get trader profile
                        'Account/Questionnaire',  # Fill the questionnaire
                        'Account/Referral',  # Get referral information
                        'Account/ReferralCode',  # Get the referral code of the logged in user
                        'Account/ReferralNames',  # Get names of referred traders
                        'Account/ReferralReward',  # Get referral reward information
                        'Account/ReferredCode',  # Get referral code
                        'Account/ResidentInformation',  # Get Step2 Data
                        'Account/SecuritySettings',  # Get verif details of logged in user
                        'Account/User',  # Get all user info
                        'APIKey/APIKey',  # Get API Key for logged in user
                        'Auth/ConnectionHistory',  # Gets connection history of logged in user
                        'Balance/Balances',  # Gets the available balance for each currency for the logged in account.
                        'Balance/Balances/{Currency}',  # Gets the available balance for s currency for the logged in account.
                        'Balance/Deposits',  # Get all account deposits, including wire and digital currency, of the logged in user
                        'Balance/Withdrawals',  # Get all account withdrawals, including wire and digital currency, of the logged in user
                        'Bank/Accounts/{Currency}/{Location}',  # Get internal bank account for deposit
                        'Bank/Transactions',  # Get all account transactions of the logged in user
                        'Bank/UserAccounts',  # Gets all the bank accounts related to the logged in user.
                        'Bank/UserAccounts/{Currency}',  # Gets all the bank accounts related to the logged in user.
                        'ElectronicWallet/DepositWallets',  # Gets all crypto currency addresses related deposits to the logged in user.
                        'ElectronicWallet/DepositWallets/{DigiCurrency}',  # Gets all crypto currency addresses related deposits to the logged in user by currency.
                        'ElectronicWallet/Transactions',  # Get all digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/{DigiCurrency}',  # Get all digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets',  # Gets all external digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}',  # Gets all external digital currency addresses related to the logged in user by currency.
                        'Info/ReferenceCurrency',  # Get user's reference currency
                        'Info/ReferenceLanguage',  # Get user's reference language
                        'Notification/Messages',  # Get from oldest unread + 3 read message to newest messages
                        'Trade/Orders',  # Gets open orders for the logged in trader.
                        'Trade/Orders/{OrderID}',  # Gets an order for the logged in trader.
                        'Trade/StopOrders',  # Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/StopOrdersHistory',  # Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/Trades',  # Gets all transactions of logged in user
                        'Trade/UserTrades',  # Gets all transactions of logged in user
                    ],
                    'post': [
                        'Account/DocumentAddress',  # Upload address proof document
                        'Account/DocumentCorporation',  # Upload registered document document
                        'Account/DocumentID',  # Upload ID document copy
                        'Account/Email/RequestVerify',  # Request for verification email
                        'Account/Email/Verify',  # Verification email
                        'Account/GoogleAuth',  # Enable google auth
                        'Account/Level',  # Request verif level of logged in user
                        'Account/Questionnaire',  # Fill the questionnaire
                        'Account/Referral',  # Post a referral email
                        'APIKey/APIKey',  # Create a new API key for logged in user
                        'Auth/ChangePassword',  # Change password.
                        'Auth/ForgotPassword',  # Request reset password
                        'Auth/ForgotUserID',  # Request user id
                        'Auth/Login',  # Trader session log in.
                        'Auth/Logout',  # Logout from the current session.
                        'Auth/LogoutOtherSessions',  # Logout other sessions.
                        'Auth/ResetPassword',  # Reset password
                        'Bank/Transactions',  # Request a transfer from the traders account of the logged in user. This is only available for bank account
                        'Bank/UserAccounts',  # Add an account the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}',  # Add an digital currency addresses to the logged in user.
                        'ElectronicWallet/Transactions/Deposits/{DigiCurrency}',  # Get all internal digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/Withdrawals/{DigiCurrency}',  # Get all external digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets/{DigiCurrency}',  # Add an external digital currency addresses to the logged in user.
                        'ElectronicWallet/Withdrawals/{DigiCurrency}',  # Request a transfer from the traders account to an external address. This is only available for crypto currencies.
                        'Notification/Messages',  # Mark all as read
                        'Notification/Messages/{ID}',  # Mark as read
                        'Trade/Orders',  # Place an order at the exchange.
                        'Trade/StopOrders',  # Place a stop order at the exchange.
                    ],
                    'put': [
                        'Account/CorporateData',  # Update user company data for corporate account
                        'Account/DocumentID',  # Update ID document meta data
                        'Account/DocumentInformation',  # Update Step3 Data
                        'Account/Email',  # Update user email
                        'Account/PersonalInformation',  # Update Step1 Data
                        'Account/Phone',  # Update user phone number
                        'Account/Questionnaire',  # update the questionnaire
                        'Account/ReferredCode',  # Update referral code
                        'Account/ResidentInformation',  # Update Step2 Data
                        'Account/SecuritySettings',  # Update verif details of logged in user
                        'Account/User',  # Update all user info
                        'Bank/UserAccounts',  # Update the label of existing user bank accounnt
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}',  # Update the name of an address
                        'ElectronicWallet/UserWallets/{DigiCurrency}',  # Update the name of an external address
                        'Info/ReferenceCurrency',  # User's reference currency
                        'Info/ReferenceLanguage',  # Update user's reference language
                    ],
                    'delete': [
                        'APIKey/APIKey/{PublicKey}',  # Remove an API key
                        'Bank/Transactions/{RequestID}',  # Delete pending account withdraw of the logged in user
                        'Bank/UserAccounts/{Currency}/{Label}',  # Delete an account of the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}',  # Delete an digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}/{AddressName}',  # Delete an external digital currency addresses related to the logged in user.
                        'Trade/Orders',  # Cancels all existing order
                        'Trade/Orders/{OrderID}',  # Cancels an existing order
                        'Trade/StopOrders',  # Cancels all existing stop orders
                        'Trade/StopOrders/{ID}',  # Cancels an existing stop order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0025,
                    'taker': 0.0035,
                },
            },
        })

    def fetch_markets(self):
        response = self.publicGetPublicLiveTickers()
        markets = response['tickers']
        result = []
        for p in range(0, len(markets)):
            market = markets[p]
            id = market['currencyPair']
            base = id[0:3]
            quote = id[3:6]
            symbol = base + '/' + quote
            result.append({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'info': market,
            })
        return result

    def fetch_balance(self, params={}):
        self.load_markets()
        response = self.privateGetBalanceBalances()
        balances = response['balances']
        result = {'info': balances}
        for b in range(0, len(balances)):
            balance = balances[b]
            currency = balance['currency']
            account = {
                'free': balance['availableBalance'],
                'used': self.sum(
                    balance['pendingIncoming'],
                    balance['pendingOutgoing'],
                    balance['openOrder']),
                'total': balance['balance'],
            }
            result[currency] = account
        return self.parse_balance(result)

    def fetch_order_book(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        orderbook = self.publicGetPublicMarketDepthCurrencyPair(self.extend({
            'CurrencyPair': market['id'],
        }, params))
        return self.parse_order_book(orderbook, None, 'bids', 'asks', 'price', 'volume')

    def parse_ticker(self, ticker, market=None):
        timestamp = int(ticker['createDateTime']) * 1000
        symbol = None
        if market:
            symbol = market['symbol']
        baseVolume = float(ticker['volume'])
        vwap = float(ticker['vwap'])
        quoteVolume = baseVolume * vwap
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'high': float(ticker['high']),
            'low': float(ticker['low']),
            'bid': float(ticker['bid']),
            'ask': float(ticker['ask']),
            'vwap': vwap,
            'open': float(ticker['open']),
            'close': None,
            'first': None,
            'last': float(ticker['last']),
            'change': None,
            'percentage': None,
            'average': None,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }

    def fetch_tickers(self, symbols=None, params={}):
        self.load_markets()
        response = self.publicGetPublicLiveTickers(params)
        tickers = response['tickers']
        result = {}
        for t in range(0, len(tickers)):
            ticker = tickers[t]
            id = ticker['currencyPair']
            market = self.markets_by_id[id]
            symbol = market['symbol']
            result[symbol] = self.parse_ticker(ticker, market)
        return result

    def fetch_ticker(self, symbol, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetPublicLiveTickerCurrencyPair(self.extend({
            'CurrencyPair': market['id'],
        }, params))
        ticker = response['ticker']
        return self.parse_ticker(ticker, market)

    def parse_trade(self, trade, market=None):
        side = None
        order = None
        if 'way' in trade:
            side = 'buy' if (trade['way'] == 'bid') else 'sell'
            orderId = trade['way'] + 'OrderId'
            order = trade[orderId]
        timestamp = int(trade['transactionTime']) * 1000
        if not market:
            market = self.markets_by_id[trade['currencyPair']]
        return {
            'info': trade,
            'id': str(trade['transactionId']),
            'order': order,
            'timestamp': timestamp,
            'datetime': self.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': None,
            'side': side,
            'price': trade['price'],
            'amount': trade['quantity'],
        }

    def fetch_trades(self, symbol, since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        response = self.publicGetPublicTransactionsCurrencyPair(self.extend({
            'CurrencyPair': market['id'],
        }, params))
        return self.parse_trades(response['transactions'], market, since, limit)

    def parse_ohlcv(self, ohlcv, market=None, timeframe='1m', since=None, limit=None):
        return [
            int(ohlcv['createDateTime']) * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            None,
            ohlcv['volume'],
        ]

    def fetch_ohlcv(self, symbol, timeframe='1m', since=None, limit=None, params={}):
        self.load_markets()
        market = self.market(symbol)
        request = {
            'CurrencyPair': market['id'],
            'Timeframe': self.timeframes[timeframe],
        }
        if limit:
            request['Count'] = limit
        request = self.extend(request, params)
        response = self.publicGetPublicTickerHistoryCurrencyPairTimeframe(request)
        return self.parse_ohlcvs(response['tickers'], market, timeframe, since, limit)

    def create_order(self, symbol, type, side, amount, price=None, params={}):
        self.load_markets()
        order = {
            'Code': self.market_id(symbol),
            'Way': 'Bid' if (side == 'buy') else 'Ask',
            'Amount': amount,
        }
        if type == 'limit':
            order['Price'] = price
        if self.twofa:
            if 'ValidationCode' in params:
                order['ValidationCode'] = params['ValidationCode']
            else:
                raise AuthenticationError(self.id + ' two-factor authentication requires a missing ValidationCode parameter')
        response = self.privatePostTradeOrders(self.extend(order, params))
        return {
            'info': response,
            'id': response['clOrderId'],
        }

    def cancel_order(self, id, symbol=None, params={}):
        self.load_markets()
        return self.privateDeleteTradeOrdersOrderID({'OrderID': id})

    def sign(self, path, api='public', method='GET', params={}, headers=None, body=None):
        url = self.urls['api'] + '/' + self.implode_params(path, params)
        query = self.omit(params, self.extract_params(path))
        if api == 'public':
            if query:
                url += '?' + self.urlencode(query)
        else:
            self.check_required_credentials()
            nonce = self.nonce()
            contentType = '' if (method == 'GET') else 'application/json'
            auth = method + url + contentType + str(nonce)
            auth = auth.lower()
            signature = self.hmac(self.encode(auth), self.encode(self.secret), hashlib.sha256, 'base64')
            headers = {
                'API_PUBLIC_KEY': self.apiKey,
                'API_REQUEST_SIGNATURE': signature,
                'API_REQUEST_DATE': nonce,
            }
            if method != 'GET':
                headers['Content-Type'] = contentType
                body = self.json(self.extend({'nonce': nonce}, params))
        return {'url': url, 'method': method, 'body': body, 'headers': headers}

    def request(self, path, api='public', method='GET', params={}, headers=None, body=None):
        response = self.fetch2(path, api, method, params, headers, body)
        if 'responseStatus' in response:
            if 'message' in response['responseStatus']:
                if response['responseStatus']['message'] == 'OK':
                    return response
        raise ExchangeError(self.id + ' ' + self.json(response))
