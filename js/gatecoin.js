'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, InvalidAddress, InsufficientFunds } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gatecoin extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gatecoin',
            'name': 'Gatecoin',
            'rateLimit': 2000,
            'countries': 'HK', // Hong Kong
            'comment': 'a regulated/licensed exchange',
            'has': {
                'CORS': false,
                'createDepositAddress': true,
                'fetchDepositAddress': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'withdraw': true,
            },
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
                        'Public/ExchangeRate', // Get the exchange rates
                        'Public/LiveTicker', // Get live ticker for all currency
                        'Public/LiveTicker/{CurrencyPair}', // Get live ticker by currency
                        'Public/LiveTickers', // Get live ticker for all currency
                        'Public/MarketDepth/{CurrencyPair}', // Gets prices and market depth for the currency pair.
                        'Public/NetworkStatistics/{DigiCurrency}', // Get the network status of a specific digital currency
                        'Public/StatisticHistory/{DigiCurrency}/{Typeofdata}', // Get the historical data of a specific digital currency
                        'Public/TickerHistory/{CurrencyPair}/{Timeframe}', // Get ticker history
                        'Public/Transactions/{CurrencyPair}', // Gets recent transactions
                        'Public/TransactionsHistory/{CurrencyPair}', // Gets all transactions
                        'Reference/BusinessNatureList', // Get the business nature list.
                        'Reference/Countries', // Get the country list.
                        'Reference/Currencies', // Get the currency list.
                        'Reference/CurrencyPairs', // Get the currency pair list.
                        'Reference/CurrentStatusList', // Get the current status list.
                        'Reference/IdentydocumentTypes', // Get the different types of identity documents possible.
                        'Reference/IncomeRangeList', // Get the income range list.
                        'Reference/IncomeSourceList', // Get the income source list.
                        'Reference/VerificationLevelList', // Get the verif level list.
                        'Stream/PublicChannel', // Get the public pubnub channel list
                    ],
                    'post': [
                        'Export/Transactions', // Request a export of all trades from based on currencypair, start date and end date
                        'Ping', // Post a string, then get it back.
                        'Public/Unsubscribe/{EmailCode}', // Lets the user unsubscribe from emails
                        'RegisterUser', // Initial trader registration.
                    ],
                },
                'private': {
                    'get': [
                        'Account/CorporateData', // Get corporate account data
                        'Account/DocumentAddress', // Check if residence proof uploaded
                        'Account/DocumentCorporation', // Check if registered document uploaded
                        'Account/DocumentID', // Check if ID document copy uploaded
                        'Account/DocumentInformation', // Get Step3 Data
                        'Account/Email', // Get user email
                        'Account/FeeRate', // Get fee rate of logged in user
                        'Account/Level', // Get verif level of logged in user
                        'Account/PersonalInformation', // Get Step1 Data
                        'Account/Phone', // Get user phone number
                        'Account/Profile', // Get trader profile
                        'Account/Questionnaire', // Fill the questionnaire
                        'Account/Referral', // Get referral information
                        'Account/ReferralCode', // Get the referral code of the logged in user
                        'Account/ReferralNames', // Get names of referred traders
                        'Account/ReferralReward', // Get referral reward information
                        'Account/ReferredCode', // Get referral code
                        'Account/ResidentInformation', // Get Step2 Data
                        'Account/SecuritySettings', // Get verif details of logged in user
                        'Account/User', // Get all user info
                        'APIKey/APIKey', // Get API Key for logged in user
                        'Auth/ConnectionHistory', // Gets connection history of logged in user
                        'Balance/Balances', // Gets the available balance for each currency for the logged in account.
                        'Balance/Balances/{Currency}', // Gets the available balance for s currency for the logged in account.
                        'Balance/Deposits', // Get all account deposits, including wire and digital currency, of the logged in user
                        'Balance/Withdrawals', // Get all account withdrawals, including wire and digital currency, of the logged in user
                        'Bank/Accounts/{Currency}/{Location}', // Get internal bank account for deposit
                        'Bank/Transactions', // Get all account transactions of the logged in user
                        'Bank/UserAccounts', // Gets all the bank accounts related to the logged in user.
                        'Bank/UserAccounts/{Currency}', // Gets all the bank accounts related to the logged in user.
                        'ElectronicWallet/DepositWallets', // Gets all crypto currency addresses related deposits to the logged in user.
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', // Gets all crypto currency addresses related deposits to the logged in user by currency.
                        'ElectronicWallet/Transactions', // Get all digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/{DigiCurrency}', // Get all digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets', // Gets all external digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Gets all external digital currency addresses related to the logged in user by currency.
                        'Info/ReferenceCurrency', // Get user's reference currency
                        'Info/ReferenceLanguage', // Get user's reference language
                        'Notification/Messages', // Get from oldest unread + 3 read message to newest messages
                        'Trade/Orders', // Gets open orders for the logged in trader.
                        'Trade/Orders/{OrderID}', // Gets an order for the logged in trader.
                        'Trade/StopOrders', // Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/StopOrdersHistory', // Gets all stop orders for the logged in trader. Max 1000 record.
                        'Trade/Trades', // Gets all transactions of logged in user
                        'Trade/UserTrades', // Gets all transactions of logged in user
                    ],
                    'post': [
                        'Account/DocumentAddress', // Upload address proof document
                        'Account/DocumentCorporation', // Upload registered document document
                        'Account/DocumentID', // Upload ID document copy
                        'Account/Email/RequestVerify', // Request for verification email
                        'Account/Email/Verify', // Verification email
                        'Account/GoogleAuth', // Enable google auth
                        'Account/Level', // Request verif level of logged in user
                        'Account/Questionnaire', // Fill the questionnaire
                        'Account/Referral', // Post a referral email
                        'APIKey/APIKey', // Create a new API key for logged in user
                        'Auth/ChangePassword', // Change password.
                        'Auth/ForgotPassword', // Request reset password
                        'Auth/ForgotUserID', // Request user id
                        'Auth/Login', // Trader session log in.
                        'Auth/Logout', // Logout from the current session.
                        'Auth/LogoutOtherSessions', // Logout other sessions.
                        'Auth/ResetPassword', // Reset password
                        'Bank/Transactions', // Request a transfer from the traders account of the logged in user. This is only available for bank account
                        'Bank/UserAccounts', // Add an account the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}', // Add an digital currency addresses to the logged in user.
                        'ElectronicWallet/Transactions/Deposits/{DigiCurrency}', // Get all internal digital currency transactions of the logged in user
                        'ElectronicWallet/Transactions/Withdrawals/{DigiCurrency}', // Get all external digital currency transactions of the logged in user
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Add an external digital currency addresses to the logged in user.
                        'ElectronicWallet/Withdrawals/{DigiCurrency}', // Request a transfer from the traders account to an external address. This is only available for crypto currencies.
                        'Notification/Messages', // Mark all as read
                        'Notification/Messages/{ID}', // Mark as read
                        'Trade/Orders', // Place an order at the exchange.
                        'Trade/StopOrders', // Place a stop order at the exchange.
                    ],
                    'put': [
                        'Account/CorporateData', // Update user company data for corporate account
                        'Account/DocumentID', // Update ID document meta data
                        'Account/DocumentInformation', // Update Step3 Data
                        'Account/Email', // Update user email
                        'Account/PersonalInformation', // Update Step1 Data
                        'Account/Phone', // Update user phone number
                        'Account/Questionnaire', // update the questionnaire
                        'Account/ReferredCode', // Update referral code
                        'Account/ResidentInformation', // Update Step2 Data
                        'Account/SecuritySettings', // Update verif details of logged in user
                        'Account/User', // Update all user info
                        'Bank/UserAccounts', // Update the label of existing user bank accounnt
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Update the name of an address
                        'ElectronicWallet/UserWallets/{DigiCurrency}', // Update the name of an external address
                        'Info/ReferenceCurrency', // User's reference currency
                        'Info/ReferenceLanguage', // Update user's reference language
                    ],
                    'delete': [
                        'APIKey/APIKey/{PublicKey}', // Remove an API key
                        'Bank/Transactions/{RequestID}', // Delete pending account withdraw of the logged in user
                        'Bank/UserAccounts/{Currency}/{Label}', // Delete an account of the logged in user
                        'ElectronicWallet/DepositWallets/{DigiCurrency}/{AddressName}', // Delete an digital currency addresses related to the logged in user.
                        'ElectronicWallet/UserWallets/{DigiCurrency}/{AddressName}', // Delete an external digital currency addresses related to the logged in user.
                        'Trade/Orders', // Cancels all existing order
                        'Trade/Orders/{OrderID}', // Cancels an existing order
                        'Trade/StopOrders', // Cancels all existing stop orders
                        'Trade/StopOrders/{ID}', // Cancels an existing stop order
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0025,
                    'taker': 0.0035,
                },
            },
            'commonCurrencies': {
                'BCP': 'BCPT',
                'FLI': 'FLIXX',
                'MAN': 'MANA',
                'SLT': 'SALT',
                'TRA': 'TRAC',
                'WGS': 'WINGS',
            },
            'exceptions': {
                '1005': InsufficientFunds,
            },
        });
    }

    async fetchMarkets () {
        let response = await this.publicGetReferenceCurrencyPairs ();
        let markets = response['currencyPairs'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['tradingCode'];
            let baseId = market['baseCurrency'];
            let quoteId = market['quoteCurrency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': 8,
                'price': market['priceDecimalPlaces'],
            };
            let limits = {
                'amount': {
                    'min': Math.pow (10, -precision['amount']),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['amount']),
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalanceBalances ();
        let balances = response['balances'];
        let result = { 'info': balances };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            let currencyId = balance['currency'];
            let code = currencyId;
            if (currencyId in this.currencies_by_id)
                code = this.currencies_by_id[currencyId]['code'];
            let account = {
                'free': balance['availableBalance'],
                'used': this.sum (
                    balance['pendingIncoming'],
                    balance['pendingOutgoing'],
                    balance['openOrder']
                ),
                'total': balance['balance'],
            };
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let orderbook = await this.publicGetPublicMarketDepthCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'volume');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradeOrdersOrderID (this.extend ({
            'OrderID': id,
        }, params));
        return this.parseOrder (response.order);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = parseInt (ticker['createDateTime']) * 1000;
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let baseVolume = this.safeFloat (ticker, 'volume');
        let vwap = this.safeFloat (ticker, 'vwap');
        let quoteVolume = baseVolume * vwap;
        let last = this.safeFloat (ticker, 'last');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetPublicLiveTickers (params);
        let tickers = response['tickers'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['currencyPair'];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicLiveTickerCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        let ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market = undefined) {
        let side = undefined;
        let orderId = undefined;
        if ('way' in trade) {
            side = (trade['way'] === 'bid') ? 'buy' : 'sell';
            let orderIdField = trade['way'] + 'OrderId';
            orderId = this.safeString (trade, orderIdField);
        }
        let timestamp = parseInt (trade['transactionTime']) * 1000;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (trade, 'currencyPair');
            if (typeof marketId !== 'undefined')
                market = this.findMarket (marketId);
        }
        let fee = undefined;
        let feeCost = this.safeFloat (trade, 'feeAmount');
        let price = trade['price'];
        let amount = trade['quantity'];
        let cost = price * amount;
        let feeCurrency = undefined;
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
            feeCurrency = market['quote'];
        }
        if (typeof feeCost !== 'undefined') {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
                'rate': this.safeFloat (trade, 'feeRate'),
            };
        }
        return {
            'info': trade,
            'id': this.safeString (trade, 'transactionId'),
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetPublicTransactionsCurrencyPair (this.extend ({
            'CurrencyPair': market['id'],
        }, params));
        return this.parseTrades (response['transactions'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            parseInt (ohlcv['createDateTime']) * 1000,
            ohlcv['open'],
            ohlcv['high'],
            ohlcv['low'],
            undefined,
            ohlcv['volume'],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'CurrencyPair': market['id'],
            'Timeframe': this.timeframes[timeframe],
        };
        if (typeof limit !== 'undefined')
            request['Count'] = limit;
        request = this.extend (request, params);
        let response = await this.publicGetPublicTickerHistoryCurrencyPairTimeframe (request);
        let ohlcvs = this.parseOHLCVs (response['tickers'], market, timeframe, since, limit);
        return this.sortBy (ohlcvs, 0);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let order = {
            'Code': this.marketId (symbol),
            'Way': (side === 'buy') ? 'Bid' : 'Ask',
            'Amount': amount,
        };
        if (type === 'limit')
            order['Price'] = price;
        if (this.twofa) {
            if ('ValidationCode' in params)
                order['ValidationCode'] = params['ValidationCode'];
            else
                throw new AuthenticationError (this.id + ' two-factor authentication requires a missing ValidationCode parameter');
        }
        let response = await this.privatePostTradeOrders (this.extend (order, params));
        return {
            'info': response,
            'id': response['clOrderId'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privateDeleteTradeOrdersOrderID ({ 'OrderID': id });
    }

    parseOrderStatus (status) {
        const statuses = {
            '6': 'closed',
        };
        if (status in statuses)
            return statuses[status];
        return status;
    }

    parseOrder (order, market = undefined) {
        let side = (order['side'] === 0) ? 'buy' : 'sell';
        let type = (order['type'] === 0) ? 'limit' : 'market';
        let symbol = undefined;
        if (typeof market === 'undefined') {
            let marketId = this.safeString (order, 'code');
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (typeof market !== 'undefined')
            symbol = market['symbol'];
        let timestamp = parseInt (order['date']) * 1000;
        let amount = order['initialQuantity'];
        let remaining = order['remainingQuantity'];
        let filled = amount - remaining;
        let price = order['price'];
        let cost = price * filled;
        let id = order['clOrderId'];
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        let trades = undefined;
        let fee = undefined;
        if (status === 'closed') {
            let tradesFilled = undefined;
            let tradesCost = undefined;
            trades = [];
            let transactions = this.safeValue (order, 'trades');
            let feeCost = undefined;
            let feeCurrency = undefined;
            let feeRate = undefined;
            if (typeof transactions !== 'undefined') {
                if (Array.isArray (transactions)) {
                    for (let i = 0; i < transactions.length; i++) {
                        let trade = this.parseTrade (transactions[i]);
                        if (typeof tradesFilled === 'undefined')
                            tradesFilled = 0.0;
                        if (typeof tradesCost === 'undefined')
                            tradesCost = 0.0;
                        tradesFilled += trade['amount'];
                        tradesCost += trade['amount'] * trade['price'];
                        if ('fee' in trade) {
                            if (typeof trade['fee']['cost'] !== 'undefined') {
                                if (typeof feeCost === 'undefined')
                                    feeCost = 0.0;
                                feeCost += trade['fee']['cost'];
                            }
                            feeCurrency = trade['fee']['currency'];
                            if (typeof trade['fee']['rate'] !== 'undefined') {
                                if (typeof feeRate === 'undefined')
                                    feeRate = 0.0;
                                feeRate += trade['fee']['rate'];
                            }
                        }
                        trades.push (trade);
                    }
                    if ((typeof tradesFilled !== 'undefined') && (tradesFilled > 0))
                        price = tradesCost / tradesFilled;
                    if (typeof feeRate !== 'undefined') {
                        let numTrades = trades.length;
                        if (numTrades > 0)
                            feeRate = feeRate / numTrades;
                    }
                    if (typeof feeCost !== 'undefined') {
                        fee = {
                            'cost': feeCost,
                            'currency': feeCurrency,
                            'rate': feeRate,
                        };
                    }
                }
            }
        }
        let result = {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': cost,
            'trades': trades,
            'fee': fee,
            'info': order,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradeOrders ();
        let orders = this.parseOrders (response['orders'], undefined, since, limit);
        if (typeof symbol !== 'undefined')
            return this.filterBySymbol (orders, symbol);
        return orders;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length)
                url += '?' + this.urlencode (query);
        } else {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            let nonceString = nonce.toString ();
            let contentType = (method === 'GET') ? '' : 'application/json';
            let auth = method + url + contentType + nonceString;
            auth = auth.toLowerCase ();
            let signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'base64');
            headers = {
                'API_PUBLIC_KEY': this.apiKey,
                'API_REQUEST_SIGNATURE': this.decode (signature),
                'API_REQUEST_DATE': nonceString,
            };
            if (method !== 'GET') {
                headers['Content-Type'] = contentType;
                body = this.json (this.extend ({ 'nonce': nonce }, params));
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('responseStatus' in response)
            if ('message' in response['responseStatus'])
                if (response['responseStatus']['message'] === 'OK')
                    return response;
        throw new ExchangeError (this.id + ' ' + this.json (response));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'DigiCurrency': currency['id'],
            'Address': address,
            'Amount': amount,
        };
        let response = await this.privatePostElectronicWalletWithdrawalsDigiCurrency (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'id'),
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'DigiCurrency': currency['id'],
        };
        let response = await this.privateGetElectronicWalletDepositWalletsDigiCurrency (this.extend (request, params));
        let result = response['addresses'];
        let numResults = result.length;
        if (numResults < 1)
            throw new InvalidAddress (this.id + ' privateGetElectronicWalletDepositWalletsDigiCurrency() returned no addresses');
        let address = this.safeString (result[0], 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'DigiCurrency': currency['id'],
        };
        let response = await this.privatePostElectronicWalletDepositWalletsDigiCurrency (this.extend (request, params));
        let address = response['address'];
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if (body[0] === '{') {
            let response = JSON.parse (body);
            if ('responseStatus' in response) {
                let errorCode = this.safeString (response['responseStatus'], 'errorCode');
                if (typeof errorCode !== 'undefined') {
                    const feedback = this.id + ' ' + body;
                    const exceptions = this.exceptions;
                    if (errorCode in exceptions) {
                        throw new exceptions[errorCode] (feedback);
                    }
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
