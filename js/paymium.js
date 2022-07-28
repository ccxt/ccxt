'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class paymium extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'paymium',
            'name': 'Paymium',
            'countries': [ 'FR', 'EU' ],
            'rateLimit': 2000,
            'version': 'v1',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': undefined,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createDepositAddress': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarkOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOrderBook': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'transfer': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg',
                'api': {
                    'rest': 'https://paymium.com/api',
                },
                'www': 'https://www.paymium.com',
                'fees': 'https://www.paymium.com/page/help/fees',
                'doc': [
                    'https://github.com/Paymium/api-documentation',
                    'https://www.paymium.com/page/developers',
                    'https://paymium.github.io/api-documentation/',
                ],
                'referral': 'https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj',
            },
            'api': {
                'public': {
                    'get': [
                        'countries',
                        'data/{currency}/ticker',
                        'data/{currency}/trades',
                        'data/{currency}/depth',
                        'bitcoin_charts/{id}/trades',
                        'bitcoin_charts/{id}/depth',
                    ],
                },
                'private': {
                    'get': [
                        'user',
                        'user/addresses',
                        'user/addresses/{address}',
                        'user/orders',
                        'user/orders/{uuid}',
                        'user/price_alerts',
                        'merchant/get_payment/{uuid}',
                    ],
                    'post': [
                        'user/addresses',
                        'user/orders',
                        'user/withdrawals',
                        'user/email_transfers',
                        'user/payment_requests',
                        'user/price_alerts',
                        'merchant/create_payment',
                    ],
                    'delete': [
                        'user/orders/{uuid}',
                        'user/orders/{uuid}/cancel',
                        'user/price_alerts/{id}',
                    ],
                },
            },
            'markets': {
                'BTC/EUR': { 'id': 'eur', 'symbol': 'BTC/EUR', 'base': 'BTC', 'quote': 'EUR', 'baseId': 'btc', 'quoteId': 'eur', 'type': 'spot', 'spot': true },
            },
            'fees': {
                'trading': {
                    'maker': this.parseNumber ('-0.001'),
                    'taker': this.parseNumber ('0.005'),
                },
            },
            'precisionMode': TICK_SIZE,
        });
    }

    parseBalance (response) {
        const result = { 'info': response };
        const currencies = Object.keys (this.currencies);
        for (let i = 0; i < currencies.length; i++) {
            const code = currencies[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const free = 'balance_' + currencyId;
            if (free in response) {
                const account = this.account ();
                const used = 'locked_' + currencyId;
                account['free'] = this.safeString (response, free);
                account['used'] = this.safeString (response, used);
                result[code] = account;
            }
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name paymium#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetUser (params);
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name paymium#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.publicGetDataCurrencyDepth (this.extend (request, params));
        return this.parseOrderBook (response, market['symbol'], undefined, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        // {
        //     "high":"33740.82",
        //     "low":"32185.15",
        //     "volume":"4.7890433",
        //     "bid":"33313.53",
        //     "ask":"33497.97",
        //     "midpoint":"33405.75",
        //     "vwap":"32802.5263553",
        //     "at":1643381654,
        //     "price":"33143.91",
        //     "open":"33116.86",
        //     "variation":"0.0817",
        //     "currency":"EUR",
        //     "trade_id":"ce2f5152-3ac5-412d-9b24-9fa72338474c",
        //     "size":"0.00041087"
        // }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.safeTimestamp (ticker, 'at');
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'price');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': this.safeString (ticker, 'open'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'variation'),
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name paymium#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const ticker = await this.publicGetDataCurrencyTicker (this.extend (request, params));
        //
        // {
        //     "high":"33740.82",
        //     "low":"32185.15",
        //     "volume":"4.7890433",
        //     "bid":"33313.53",
        //     "ask":"33497.97",
        //     "midpoint":"33405.75",
        //     "vwap":"32802.5263553",
        //     "at":1643381654,
        //     "price":"33143.91",
        //     "open":"33116.86",
        //     "variation":"0.0817",
        //     "currency":"EUR",
        //     "trade_id":"ce2f5152-3ac5-412d-9b24-9fa72338474c",
        //     "size":"0.00041087"
        // }
        //
        return this.parseTicker (ticker, market);
    }

    parseTrade (trade, market) {
        const timestamp = this.safeTimestamp (trade, 'created_at_int');
        const id = this.safeString (trade, 'uuid');
        market = this.safeMarket (undefined, market);
        const side = this.safeString (trade, 'side');
        const price = this.safeString (trade, 'price');
        const amountField = 'traded_' + market['base'].toLowerCase ();
        const amount = this.safeString (trade, amountField);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name paymium#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency': market['id'],
        };
        const response = await this.publicGetDataCurrencyTrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createDepositAddress (code, params = {}) {
        /**
         * @method
         * @name paymium#createDepositAddress
         * @description create a currency deposit address
         * @param {string} code unified currency code of the currency for the deposit address
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const response = await this.privatePostUserAddresses (params);
        //
        //     {
        //         "address": "1HdjGr6WCTcnmW1tNNsHX7fh4Jr5C2PeKe",
        //         "valid_until": 1620041926,
        //         "currency": "BTC",
        //         "label": "Savings"
        //     }
        //
        return this.parseDepositAddress (response);
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name paymium#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const request = {
            'address': code,
        };
        const response = await this.privateGetUserAddressesAddress (this.extend (request, params));
        //
        //     {
        //         "address": "1HdjGr6WCTcnmW1tNNsHX7fh4Jr5C2PeKe",
        //         "valid_until": 1620041926,
        //         "currency": "BTC",
        //         "label": "Savings"
        //     }
        //
        return this.parseDepositAddress (response);
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        /**
         * @method
         * @name paymium#fetchDepositAddresses
         * @description fetch deposit addresses for multiple currencies and chain types
         * @param {[string]|undefined} codes list of unified currency codes, default is undefined
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} a list of [address structures]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetUserAddresses (params);
        //
        //     [
        //         {
        //             "address": "1HdjGr6WCTcnmW1tNNsHX7fh4Jr5C2PeKe",
        //             "valid_until": 1620041926,
        //             "currency": "BTC",
        //             "label": "Savings"
        //         }
        //     ]
        //
        return this.parseDepositAddresses (response, codes);
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        //
        //     {
        //         "address": "1HdjGr6WCTcnmW1tNNsHX7fh4Jr5C2PeKe",
        //         "valid_until": 1620041926,
        //         "currency": "BTC",
        //         "label": "Savings"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        const currencyId = this.safeString (depositAddress, 'currency');
        return {
            'info': depositAddress,
            'currency': this.safeCurrencyCode (currencyId, currency),
            'address': address,
            'tag': undefined,
            'network': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name paymium#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'type': this.capitalize (type) + 'Order',
            'currency': market['id'],
            'direction': side,
            'amount': amount,
        };
        if (type !== 'market') {
            request['price'] = price;
        }
        const response = await this.privatePostUserOrders (this.extend (request, params));
        return {
            'info': response,
            'id': response['uuid'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name paymium#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by paymium cancelOrder ()
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const request = {
            'uuid': id,
        };
        return await this.privateDeleteUserOrdersUuidCancel (this.extend (request, params));
    }

    async transfer (code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name paymium#transfer
         * @description transfer currency internally between wallets on the same account
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account to transfer from
         * @param {string} toAccount account to transfer to
         * @param {object} params extra parameters specific to the paymium api endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/en/latest/manual.html#transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        if (toAccount.indexOf ('@') < 0) {
            throw new ExchangeError (this.id + ' transfer() only allows transfers to an email address');
        }
        if (code !== 'BTC' && code !== 'EUR') {
            throw new ExchangeError (this.id + ' transfer() only allows BTC or EUR');
        }
        const request = {
            'currency': currency['id'],
            'amount': this.currencyToPrecision (code, amount),
            'email': toAccount,
            // 'comment': 'a small note explaining the transfer'
        };
        const response = await this.privatePostUserEmailTransfers (this.extend (request, params));
        //
        //     {
        //         "uuid": "968f4580-e26c-4ad8-8bcd-874d23d55296",
        //         "type": "Transfer",
        //         "currency": "BTC",
        //         "currency_amount": "string",
        //         "created_at": "2013-10-24T10:34:37.000Z",
        //         "updated_at": "2013-10-24T10:34:37.000Z",
        //         "amount": "1.0",
        //         "state": "executed",
        //         "currency_fee": "0.0",
        //         "btc_fee": "0.0",
        //         "comment": "string",
        //         "traded_btc": "string",
        //         "traded_currency": "string",
        //         "direction": "buy",
        //         "price": "string",
        //         "account_operations": [
        //             {
        //                 "uuid": "968f4580-e26c-4ad8-8bcd-874d23d55296",
        //                 "amount": "1.0",
        //                 "currency": "BTC",
        //                 "created_at": "2013-10-24T10:34:37.000Z",
        //                 "created_at_int": 1389094259,
        //                 "name": "account_operation",
        //                 "address": "1FPDBXNqSkZMsw1kSkkajcj8berxDQkUoc",
        //                 "tx_hash": "string",
        //                 "is_trading_account": true
        //             }
        //         ]
        //     }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency = undefined) {
        //
        //     {
        //         "uuid": "968f4580-e26c-4ad8-8bcd-874d23d55296",
        //         "type": "Transfer",
        //         "currency": "BTC",
        //         "currency_amount": "string",
        //         "created_at": "2013-10-24T10:34:37.000Z",
        //         "updated_at": "2013-10-24T10:34:37.000Z",
        //         "amount": "1.0",
        //         "state": "executed",
        //         "currency_fee": "0.0",
        //         "btc_fee": "0.0",
        //         "comment": "string",
        //         "traded_btc": "string",
        //         "traded_currency": "string",
        //         "direction": "buy",
        //         "price": "string",
        //         "account_operations": [
        //             {
        //                 "uuid": "968f4580-e26c-4ad8-8bcd-874d23d55296",
        //                 "amount": "1.0",
        //                 "currency": "BTC",
        //                 "created_at": "2013-10-24T10:34:37.000Z",
        //                 "created_at_int": 1389094259,
        //                 "name": "account_operation",
        //                 "address": "1FPDBXNqSkZMsw1kSkkajcj8berxDQkUoc",
        //                 "tx_hash": "string",
        //                 "is_trading_account": true
        //             }
        //         ]
        //     }
        //
        const currencyId = this.safeString (transfer, 'currency');
        const updatedAt = this.safeString (transfer, 'updated_at');
        const timetstamp = this.parseDate (updatedAt);
        const accountOperations = this.safeValue (transfer, 'account_operations');
        const firstOperation = this.safeValue (accountOperations, 0, {});
        const status = this.safeString (transfer, 'state');
        return {
            'info': transfer,
            'id': this.safeString (transfer, 'uuid'),
            'timestamp': timetstamp,
            'datetime': this.iso8601 (timetstamp),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (transfer, 'amount'),
            'fromAccount': undefined,
            'toAccount': this.safeString (firstOperation, 'address'),
            'status': this.parseTransferStatus (status),
        };
    }

    parseTransferStatus (status) {
        const statuses = {
            'executed': 'ok',
            // what are the other statuses?
        };
        return this.safeString (statuses, status, status);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['rest'] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let auth = nonce + url;
            headers = {
                'Api-Key': this.apiKey,
                'Api-Nonce': nonce,
            };
            if (method === 'POST') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    auth += body;
                    headers['Content-Type'] = 'application/json';
                }
            } else {
                if (Object.keys (query).length) {
                    const queryString = this.urlencode (query);
                    auth += queryString;
                    url += '?' + queryString;
                }
            }
            headers['Api-Signature'] = this.hmac (this.encode (auth), this.encode (this.secret));
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
    }
};
