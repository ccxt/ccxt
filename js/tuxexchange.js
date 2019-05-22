'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, NotSupported, AuthenticationError, InsufficientFunds, OrderNotFound, BadRequest } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class tuxexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'tuxexchange',
            'name': 'Tux Exchange',
            'countries': ['CA'],
            'version': '',
            'accounts': undefined,
            'accountsById': undefined,
            'hostname': 'tuxexchange.com/api',
            'has': {
                'CORS': false,
                'fetchCurrencies': true,
                'fetchTicker': false, // Can be emulated on fetchTickers if necessary
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': false,
                'fetchBalance': true,
                'createOrder': true,
                'cancelOrder': true,
                'fetchOpenOrders': true,
                'fetchMyTrades': true,
                'fetchDepositAddress': true,
                'fetchWithdrawals': true,
                'fetchDeposits': true,
                'fetchClosedOrders': false,
                'fetchL2OrderBook': false,
                'fetchOHLCV': false,
                'fetchOrder': false,
                'editOrder': false,
                'fetchTransactions': false,
                'fetchLedger': false,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://www.tuxexchange.com/images/kittytrade.png',
                'api': 'https://www.tuxexchange.com/api',
                'www': 'https://www.tuxexchange.com',
                'doc': 'https://www.tuxexchange.com/docs',
                'fees': 'https://www.tuxexchange.com/faq',
            },
            'api': {
                // All methods are passed in as query params
                'public': { 'get': [''] },
                'private': { 'post': [''] },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0,
                    'taker': 0.3,
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const tickersData = await this.publicGet ({ 'method': 'getticker' });
        // Would prefer not to make two API calls, but this is the only way to get fees for the market
        const coinResponse = await this.publicGet ({ 'method': 'getcoins' });
        const tickerIds = Object.keys (tickersData);
        let result = [];
        for (let i = 0; i < tickerIds.length; i++) {
            const id = tickerIds[i];
            const tickerData = tickersData[id];
            const splitId = id.split ('_');
            const baseId = splitId[0]; // base
            const quoteId = splitId[1]; // quote
            const base = this.commonCurrencyCode (baseId);
            const quote = this.commonCurrencyCode (quoteId);
            const active = this.safeInteger (tickerData, 'isFrozen') === 0;
            const coinData = coinResponse[quoteId];
            const market = {
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': active,
                'maker': this.safeString (coinData, 'makerfee'),
                'taker': this.safeString (coinData, 'takerfee'),
                'info': tickerData,
            };
            result.push (market);
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const currenciesData = await this.publicGet ({ 'method': 'getcoins' });
        const currencyIds = Object.keys (currenciesData);
        // The API does not expose BTC as a coin (I suspect because it is the base in each market)
        let result = { 'BTC': {
            'id': 'BTC',
            'code': 'BTC',
            'name': 'bitcoin',
            'fiat': false,
        }};
        for (let i = 0; i < currencyIds.length; i++) {
            const id = currencyIds[i];
            const coinData = currenciesData[id];
            const code = this.commonCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': coinData['name'],
                'fiat': false,
                'funding': {
                    'withdraw': {
                        'fee': this.safeFloat (coinData, 'withdrawfee'),
                    },
                },
            };
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const tickersData = await this.publicGet (this.extend ({ 'method': 'getticker' }, params));
        const tickerIds = Object.keys (tickersData);
        const result = {};
        for (let i = 0; i < tickerIds.length; i++) {
            const id = tickerIds[i];
            const tickerResult = this.parseTicker (id, tickersData[id]);
            const symbol = tickerResult['symbol'];
            result[symbol] = tickerResult;
        }
        return result;
    }

    parseTicker (marketId, tickerData) {
        const timestamp = this.milliseconds ();
        const market = this.findMarket (marketId);
        return {
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'close': this.safeFloat (tickerData, 'last'),
            'last': this.safeFloat (tickerData, 'last'),
            'high': this.safeFloat (tickerData, 'high24hr'),
            'low': this.safeFloat (tickerData, 'low24hr'),
            'percentage': this.safeFloat (tickerData, 'percentChange'),
            'baseVolume': this.safeFloat (tickerData, 'baseVolume'),
            'quoteVolume': this.safeFloat (tickerData, 'quoteVolume'),
            'bid': this.safeFloat (tickerData, 'highestBid'),
            'ask': this.safeFloat (tickerData, 'lowestAsk'),
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'previousClose': undefined,
            'change': undefined,
            'average': undefined,
            'info': tickerData,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderBook () requires a symbol argument');
        }
        await this.loadMarkets ();
        const codes = this.getIdsFromSymbol (symbol);
        if (codes['base'] !== 'BTC') {
            throw new NotSupported (this.id + ' this exchange only trades on symbols with BTC as base');
        }
        if (limit !== undefined) {
            // At some point it would be worthwhile to extend the base parseOrderBook to include a limit
            throw new NotSupported (this.id + ' fetchOrderBook () does not support a "limit" argument for this exchange');
        }
        let orderBookRequest = {
            'coin': this.currencyId (codes['quote']),
            'method': 'getorders',
        };
        const orderBook = await this.publicGet (this.extend (orderBookRequest, params));
        const result = this.parseOrderBook (orderBook);
        return result;
    }

    parseTrade (trade, market) {
        // The API exposees different fields for the gettrades and getmytradehistory endpoints
        const isPrivateTrade = trade['orderId'] !== undefined;
        const tradeDate = this.parseDate (this.safeString (trade, 'date'));
        const timestamp = tradeDate.valueOf ();
        let priceString = undefined;
        if (isPrivateTrade) {
            priceString = this.safeString (trade, 'price');
        } else {
            priceString = this.safeString (trade, 'rate');
        }
        const parsedTrade = {
            'id': this.safeString (trade, 'tradeid'),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market.id,
            'type': 'limit',
            'side': this.safeString (trade, 'type'),
            'price': this.asFloat (priceString),
            'amount': this.asFloat (this.safeString (trade, 'amount')),
            'cost': this.asFloat (this.safeString (trade, 'total')),
        };
        if (isPrivateTrade) {
            let feeCurrency = undefined;
            if (parsedTrade['side'] === 'buy') {
                feeCurrency = this.commonCurrencyCode (this.safeString (trade, 'market'));
            } else {
                feeCurrency = this.commonCurrencyCode (this.safeString (trade, 'coin'));
            }
            return this.extend (parsedTrade, {
                'order': this.safeString (trade, 'order'),
                'fee': {
                    'cost': this.safeFloat (trade, 'total'),
                    'currency': feeCurrency,
                    'rate': this.safeFloat (trade, 'feepercent'),
                },
            });
        } else {
            return parsedTrade;
        }
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades () requires a "symbol" argument');
        }
        await this.loadMarkets ();
        const codes = this.getIdsFromSymbol (symbol);
        if (codes['base'] !== 'BTC') {
            throw new NotSupported (this.id + ' this exchange only trades on symbols with BTC as base');
        }
        let tradeHistoryRequest = {
            'method': 'gettradehistory',
            'coin': this.currencyId (codes['quote']),
            'end': this.seconds (),
        };
        if (since !== undefined) {
            const sinceSeconds = since / 1000;
            this.extend (tradeHistoryRequest, { 'start': sinceSeconds });
        }
        const trades = await this.publicGet (this.extend (tradeHistoryRequest, params));
        const market = this.market (symbol);
        const results = this.parseTrades (trades, market, since, limit);
        return results;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balancesData = await this.privatePost (this.extend ({ 'method': 'getmybalances' }, params));
        const currencies = Object.keys (balancesData);
        let result = { 'info': balancesData };
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const balanceData = balancesData[currency];
            const uppercase = currency.toUpperCase ();
            const code = this.commonCurrencyCode (uppercase);
            let account = this.account ();
            account['total'] = parseFloat (balanceData['balance']);
            account['used'] = parseFloat (balanceData['frozen']);
            account['free'] = parseFloat (balanceData['balance'] - balanceData['frozen']);
            result[code] = account;
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder () requires a "symbol" argument');
        }
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder () requires a "price" argument');
        }
        if (type !== 'limit') {
            throw new NotSupported (this.id + ' createOrder () only supports a "limit" argument for this exchange');
        }
        if (side !== 'buy' && side !== 'sell') {
            throw new BadRequest (this.id + ' "side" must be a string containing either "buy" or "sell"');
        }
        await this.loadMarkets ();
        const codes = this.getIdsFromSymbol (symbol);
        amount = this.amountToPrecision (symbol, amount);
        let orderRequest = {
            'market': this.currencyId (codes['base']),
            'coin': this.currencyId (codes['quote']),
            'amount': amount,
            'price': price,
        };
        orderRequest = this.extend (orderRequest, params);
        orderRequest['price'] = this.priceToPrecision (symbol, price);
        if (side === 'buy') {
            orderRequest = this.extend (orderRequest, { 'method': 'buy' });
        } else if (side === 'sell') {
            orderRequest = this.extend (orderRequest, { 'method': 'sell' });
        }
        const result = await this.privatePost (orderRequest);
        const orderId = result['success'];
        return {
            'id': orderId,
            'info': result,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': undefined,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires a "symbol" argument');
        }
        await this.loadMarkets ();
        const codes = this.getIdsFromSymbol (symbol);
        const cancelRequest = {
            'method': 'cancelorder',
            'id': id,
            'market': this.currencyId (codes['base']),
        };
        const result = await this.privatePost (this.extend (cancelRequest, params));
        return { 'info': result };
    }

    parseOrder (order) {
        const symbol = this.findSymbol (this.safeString (order, 'market_pair'));
        const orderDate = this.parseDate (this.safeString (order, 'date'));
        const timestamp = orderDate.valueOf ();
        const amount = this.asFloat (this.safeString (order, 'amount'));
        const filled_amount = this.asFloat (this.safeString (order, 'filledamount'));
        return {
            'info': order,
            'id': this.safeString (order, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': this.safeString (order, 'type'),
            'price': this.asFloat (this.safeString (order, 'price')),
            'amount': amount,
            'remaining': amount - filled_amount,
            'filled': filled_amount,
            'status': 'open',
            'lastTradeTimestamp': undefined,
        };
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const openOrdersMap = await this.privatePost (this.extend ({ 'method': 'getmyopenorders' }, params));
        const openOrders = this.values (openOrdersMap);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const result = this.parseOrders (openOrders, market, since, limit);
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const myTrades = await this.privatePost (this.extend ({ 'method': 'getmytradehistory' }, params));
        const results = this.parseTrades (myTrades, symbol, since, limit);
        return results;
    }

    async fetchDepositAddress (code, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress () requires a code argument');
        }
        await this.loadMarkets ();
        const addressesData = await this.privatePost (this.extend ({ 'method': 'getmyaddresses' }, params));
        const addresses = addressesData['addresses'];
        const addressForCode = addresses[this.currencyId (code)];
        return {
            'currency': code,
            'address': this.checkAddress (addressForCode),
            'info': addressForCode,
        };
    }

    parseTransaction (transaction, type) {
        const transactionDate = this.parseDate (this.safeString (transaction, 'date'));
        const timestamp = transactionDate.valueOf ();
        const marketStatus = this.safeString (transaction, 'status');
        const status = marketStatus === 'success' ? 'ok' : marketStatus;
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'txid'), // Exchange doesn't provide its own id
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'),
            'type': type,
            'amount': this.asFloat (this.safeString (transaction, 'amount')),
            'currency': this.commonCurrencyCode (this.safeString (transaction, 'coin')),
            'status': status,
            'updated': undefined,
            'tag': undefined,
            'fee': undefined,
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const deposits = await this.privatePost (this.extend ({ 'method': 'getmydeposithistory' }, params));
        // Some deposits seem to have no data associated
        const validDeposits = [];
        for (let i = 0; i < deposits.length; i++) {
            const deposit = deposits[i];
            if (deposit.txid !== undefined) {
                validDeposits.push (deposit);
            }
        }
        const result = this.parseTransactions (validDeposits, code, since, limit, { 'type': 'deposit' });
        return result;
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const withdrawals = await this.privatePost (this.extend ({ 'method': 'getmywithdrawhistory' }, params));
        // Some withdrawals seem to have no data associated
        const validWithdrawals = [];
        for (let i = 0; i < withdrawals.length; i++) {
            const withdrawal = withdrawals[i];
            if (withdrawal.txid !== undefined) {
                validWithdrawals.push (withdrawal);
            }
        }
        const result = this.parseTransactions (validWithdrawals, code, since, limit, { 'type': 'withdrawal' });
        return result;
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        if (code === undefined || amount === undefined || address === undefined) {
            throw new ArgumentsRequired (this.id + ' withdraw () requires a code, amount and address argument');
        }
        if (address.indexOf ('0x') === 0) {
            address = address.substr (2);
        }
        this.checkAddress (address);
        const withdrawRequest = {
            'method': 'withdraw',
            'coin': this.currencyId (code),
            'address': address,
            'amount': amount,
        };
        const result = await this.privatePost (this.extend (withdrawRequest, params));
        return { 'info': result };
    }

    nonce () {
        // The tuxexchange api actually ignores nonce in practice (even though it is documented)
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'];
        const query = this.omit (params, this.extractParams (path));
        let urlQueryParams = this.urlencode (query);
        if (api === 'private') {
            if (!headers) {
                headers = {};
            }
            const nonce = this.nonce ();
            urlQueryParams += '&nonce=' + nonce;
            // Encoding the query params is non-standard and poorly documented but somehow correct
            headers = this.extend (headers, {
                'Key': this.apiKey,
                'Sign': this.hmac (urlQueryParams, this.secret, 'sha512', 'hex'),
            });
        }
        if (Object.keys (query).length) {
            url += '?' + urlQueryParams;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    getIdsFromSymbol (symbol) {
        const splitSymbol = symbol.split ('/');
        return {
            'base': splitSymbol[0],
            'quote': splitSymbol[1],
        };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (code >= 400) {
            // Tux currently doesn't send anything other than 200s, but should keep an eye out
            throw new ExchangeError (this.id + ' unexpected exchange error with code: ' + code);
        }
        if (typeof body !== 'string' || body.length < 2 || (body[0] !== '[' && body[0] !== '{')) {
            // Haven't seen any body-less responses from tux, but best to not explode if that changes
            return;
        }
        // Response code is always 200, errors will have specific exceptions
        const success = this.safeInteger (response, 'success', 1);
        if (success === 0) {
            const errorBody = this.safeString (response, 'error');
            // Exceptions are not ennumerated in tux documentation so just identify ones found in development
            if (errorBody === 'Authentication failed.' || errorBody === 'Invalid public key.') {
                throw new AuthenticationError (this.id + ' ' + errorBody);
            } else if (errorBody === 'Order not found.') {
                throw new OrderNotFound (this.id + ' no order found. Check that the order id and the base currency of the symbol are correct');
            } else if (errorBody === 'Inssuficient funds.' || errorBody === 'NSF.') {
                throw new InsufficientFunds (this.id + ' insufficient funds');
            } else if (errorBody === 'A request to withdraw has been made. Please check your email to complete this request.') {
                throw new ExchangeError (this.id + ' withdraw requests via the api will fail unless email confirmations are disabled in the UI under "Notifications"');
            } else {
                throw new ExchangeError (this.id + ' ' + errorBody);
            }
        }
    }
};
