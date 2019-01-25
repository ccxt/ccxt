'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AddressPending, AuthenticationError, ExchangeError, NotSupported, PermissionDenied } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class buda extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'buda',
            'name': 'Buda',
            'countries': [ 'AR', 'CL', 'CO', 'PE' ],
            'rateLimit': 1000,
            'version': 'v2',
            'has': {
                'CORS': false,
                'createDepositAddress': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTrades': true,
                'fetchWithdrawals': true,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/47380619-8a029200-d706-11e8-91e0-8a391fe48de3.jpg',
                'api': 'https://www.buda.com/api',
                'www': 'https://www.buda.com',
                'doc': 'https://api.buda.com',
                'fees': 'https://www.buda.com/comisiones',
            },
            'api': {
                'public': {
                    'get': [
                        'pairs',
                        'markets',
                        'currencies',
                        'markets/{market}',
                        'markets/{market}/ticker',
                        'markets/{market}/volume',
                        'markets/{market}/order_book',
                        'markets/{market}/trades',
                        'currencies/{currency}/fees/deposit',
                        'currencies/{currency}/fees/withdrawal',
                        'tv/history',
                    ],
                    'post': [
                        'markets/{market}/quotations',
                    ],
                },
                'private': {
                    'get': [
                        'balances',
                        'balances/{currency}',
                        'currencies/{currency}/balances',
                        'orders',
                        'orders/{id}',
                        'markets/{market}/orders',
                        'deposits',
                        'currencies/{currency}/deposits',
                        'withdrawals',
                        'currencies/{currency}/withdrawals',
                        'currencies/{currency}/receive_addresses',
                        'currencies/{currency}/receive_addresses/{id}',
                    ],
                    'post': [
                        'markets/{market}/orders',
                        'currencies/{currency}/deposits',
                        'currencies/{currency}/withdrawals',
                        'currencies/{currency}/simulated_withdrawals',
                        'currencies/{currency}/receive_addresses',
                    ],
                    'put': [
                        'orders/{id}',
                    ],
                },
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '1d': 'D',
                '1w': 'W',
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.008,  // 0.8%
                    'maker': 0.004,  // 0.4%
                    'tiers': {
                        'taker': [
                            [0, 0.008],  // 0.8%
                            [2000, 0.007],  // 0.7%
                            [20000, 0.006],  // 0.6%
                            [100000, 0.005],  // 0.5%
                            [500000, 0.004],  // 0.4%
                            [2500000, 0.003],  // 0.3%
                            [12500000, 0.002],  // 0.2%
                        ],
                        'maker': [
                            [0, 0.004],  // 0.4%
                            [2000, 0.0035],  // 0.35%
                            [20000, 0.003],  // 0.3%
                            [100000, 0.0025],  // 0.25%
                            [500000, 0.002],  // 0.2%
                            [2500000, 0.0015],  // 0.15%
                            [12500000, 0.001],  // 0.1%
                        ],
                    },
                },
            },
            'exceptions': {
                'not_authorized': AuthenticationError,  // { message: 'Invalid credentials', code: 'not_authorized' }
                'forbidden': PermissionDenied,  // { message: 'You dont have access to this resource', code: 'forbidden' }
                'invalid_record': ExchangeError,  // { message: 'Validation Failed', code: 'invalid_record', errors: [] }
                'not_found': ExchangeError,  // { message: 'Not found', code: 'not_found' }
                'parameter_missing': ExchangeError,  // { message: 'Parameter missing', code: 'parameter_missing' }
                'bad_parameter': ExchangeError,  // { message: 'Bad Parameter format', code: 'bad_parameter' }
            },
        });
    }

    async fetchCurrencyInfo (currency, currencies = undefined) {
        if (!currencies) {
            let response = await this.publicGetCurrencies ();
            currencies = response['currencies'];
        }
        for (let i = 0; i < currencies.length; i++) {
            let currencyInfo = currencies[i];
            if (currencyInfo['id'] === currency) {
                return currencyInfo;
            }
        }
        return undefined;
    }

    async fetchMarkets (params = {}) {
        let marketsResponse = await this.publicGetMarkets ();
        let markets = marketsResponse['markets'];
        let currenciesResponse = await this.publicGetCurrencies ();
        let currencies = currenciesResponse['currencies'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let baseId = market['base_currency'];
            let quoteId = market['quote_currency'];
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let baseInfo = await this.fetchCurrencyInfo (baseId, currencies);
            let quoteInfo = await this.fetchCurrencyInfo (quoteId, currencies);
            let symbol = base + '/' + quote;
            let precision = {
                'amount': baseInfo['input_decimals'],
                'price': quoteInfo['input_decimals'],
            };
            let limits = {
                'amount': {
                    'min': parseFloat (market['minimum_order_amount'][0]),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            };
            limits['cost'] = {
                'min': limits['amount']['min'] * limits['price']['min'],
                'max': undefined,
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

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencies ();
        let currencies = response['currencies'];
        let result = {};
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            if (!currency['managed'])
                continue;
            let id = currency['id'];
            let code = this.commonCurrencyCode (id);
            let precision = currency['input_decimals'];
            let minimum = Math.pow (10, -precision);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': undefined,
                'active': true,
                'fee': undefined,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': minimum,
                        'max': undefined,
                    },
                    'price': {
                        'min': minimum,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': parseFloat (currency['deposit_minimum'][0]),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': parseFloat (currency['withdrawal_minimum'][0]),
                    },
                },
            };
        }
        return result;
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        let withdrawFees = {};
        let depositFees = {};
        let info = {};
        if (codes === undefined)
            codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currency (code);
            let request = { 'currency': currency['id'] };
            let withdrawResponse = await this.publicGetCurrenciesCurrencyFeesWithdrawal (request);
            let depositResponse = await this.publicGetCurrenciesCurrencyFeesDeposit (request);
            withdrawFees[code] = this.parseFundingFee (withdrawResponse['fee']);
            depositFees[code] = this.parseFundingFee (depositResponse['fee']);
            info[code] = {
                'withdraw': withdrawResponse,
                'deposit': depositResponse,
            };
        }
        return {
            'withdraw': withdrawFees,
            'deposit': depositFees,
            'info': info,
        };
    }

    parseFundingFee (fee, type = undefined) {
        if (type === undefined)
            type = fee['name'];
        if (type === 'withdrawal')
            type = 'withdraw';
        return {
            'type': type,
            'currency': fee['base'][1],
            'rate': fee['percent'],
            'cost': parseFloat (fee['base'][0]),
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsMarketTicker (this.extend ({
            'market': market['id'],
        }, params));
        let ticker = response['ticker'];
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.milliseconds ();
        let symbol = undefined;
        if (market !== undefined)
            symbol = market['symbol'];
        let last = parseFloat (ticker['last_price'][0]);
        let percentage = parseFloat (ticker['price_variation_24h']);
        let open = parseFloat (this.priceToPrecision (symbol, last / (percentage + 1)));
        let change = last - open;
        let average = this.sum (last, open) / 2;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': parseFloat (ticker['max_bid'][0]),
            'bidVolume': undefined,
            'ask': parseFloat (ticker['min_ask'][0]),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': open,
            'change': change,
            'percentage': percentage * 100,
            'average': average,
            'baseVolume': parseFloat (ticker['volume'][0]),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        const request = {
            'market': market['id'],
        };
        // the since argument works backwards – returns trades up to the specified timestamp
        // therefore not implemented here
        // the method is still available for users to be able to traverse backwards in time
        // by using the timestamp from the first received trade upon each iteration
        if (limit !== undefined) {
            request['limit'] = limit; // 50 max
        }
        let response = await this.publicGetMarketsMarketTrades (this.extend (request, params));
        //
        //     { trades: {      market_id:   "ETH-BTC",
        //                      timestamp:    null,
        //                 last_timestamp:   "1536901277302",
        //                        entries: [ [ "1540077456791", "0.0063767", "0.03", "sell", 479842 ],
        //                                   [ "1539916642772", "0.01888263", "0.03019563", "sell", 479438 ],
        //                                   [ "1539834081787", "0.023718648", "0.031001", "sell", 479069 ],
        //                                   ... ]
        //
        return this.parseTrades (response['trades']['entries'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //  [ "1540077456791", "0.0063767", "0.03", "sell", 479842 ]
        //
        let timestamp = undefined;
        let side = undefined;
        let type = undefined;
        let price = undefined;
        let amount = undefined;
        let id = undefined;
        let order = undefined;
        let fee = undefined;
        let symbol = undefined;
        let cost = undefined;
        if (market) {
            symbol = market['symbol'];
        }
        if (Array.isArray (trade)) {
            timestamp = parseInt (trade[0]);
            price = parseFloat (trade[1]);
            amount = parseFloat (trade[2]);
            cost = price * amount;
            side = trade[3];
            id = trade[4].toString ();
        }
        return {
            'id': id,
            'order': order,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsMarketOrderBook (this.extend ({
            'market': market['id'],
        }, params));
        let orderBook = response['order_book'];
        return this.parseOrderBook (orderBook);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        if (since === undefined)
            since = this.milliseconds () - 86400000;
        let request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
            'from': since / 1000,
            'to': this.seconds (),
        };
        let response = await this.publicGetTvHistory (this.extend (request, params));
        return this.parseTradingViewOHLCV (response, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances ();
        let result = { 'info': response };
        let balances = response['balances'];
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['id'];
            let currency = this.commonCurrencyCode (id);
            let total = parseFloat (balance['amount'][0]);
            let free = parseFloat (balance['available_amount'][0]);
            let account = {
                'free': free,
                'used': total - free,
                'total': total,
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetOrdersId (this.extend ({
            'id': parseInt (id),
        }, params));
        let order = response['order'];
        return this.parseOrder (order);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined)
            market = this.market (symbol);
        let response = await this.privateGetMarketsMarketOrders (this.extend ({
            'market': market['id'],
            'per': limit,
        }, params));
        let orders = response['orders'];
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'state': 'pending',
        }, params));
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let orders = await this.fetchOrders (symbol, since, limit, this.extend ({
            'state': 'traded',
        }, params));
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        side = (side === 'buy') ? 'Bid' : 'Ask';
        let request = {
            'market': this.marketId (symbol),
            'price_type': type,
            'type': side,
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit')
            request['limit'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostMarketsMarketOrders (this.extend (request, params));
        let order = response['order'];
        return this.parseOrder (order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePutOrdersId (this.extend ({
            'id': parseInt (id),
            'state': 'canceling',
        }, params));
        let order = response['order'];
        return this.parseOrder (order);
    }

    parseOrderStatus (status) {
        let statuses = {
            'traded': 'closed',
            'received': 'open',
            'canceling': 'canceled',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseOrder (order, market = undefined) {
        let id = order['id'];
        let timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        let symbol = undefined;
        if (market === undefined) {
            let marketId = order['market_id'];
            if (marketId in this.markets_by_id)
                market = this.markets_by_id[marketId];
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let type = order['price_type'];
        let side = order['type'].toLowerCase ();
        let status = this.parseOrderStatus (this.safeString (order, 'state'));
        let amount = parseFloat (order['original_amount'][0]);
        let remaining = parseFloat (order['amount'][0]);
        let filled = parseFloat (order['traded_amount'][0]);
        let cost = parseFloat (order['total_exchanged'][0]);
        let price = order['limit'];
        if (price !== undefined)
            price = parseFloat (price[0]);
        if (cost > 0 && filled > 0)
            price = this.priceToPrecision (symbol, cost / filled);
        let fee = {
            'cost': parseFloat (order['paid_fee'][0]),
            'currency': order['paid_fee'][1],
        };
        return {
            'id': id,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': fee,
            'info': order,
        };
    }

    isFiat (code) {
        const fiats = {
            'ARS': true,
            'CLP': true,
            'COP': true,
            'PEN': true,
        };
        return this.safeValue (fiats, code, false);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        if (this.isFiat (code)) {
            throw new NotSupported (this.id + ' fetchDepositAddress() for fiat ' + code + ' is not supported');
        }
        let response = await this.privateGetCurrenciesCurrencyReceiveAddresses (this.extend ({
            'currency': currency['id'],
        }, params));
        let receiveAddresses = response['receive_addresses'];
        let addressPool = [];
        for (let i = 1; i < receiveAddresses.length; i++) {
            let receiveAddress = receiveAddresses[i];
            if (receiveAddress['ready']) {
                let address = receiveAddress['address'];
                this.checkAddress (address);
                addressPool.push (address);
            }
        }
        let addressPoolLength = addressPool.length;
        if (addressPoolLength < 1) {
            throw new AddressPending (this.name + ': there are no addresses ready for receiving ' + code + ', retry again later)');
        }
        let address = addressPool[0];
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': receiveAddresses,
        };
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        if (this.isFiat (code))
            throw new NotSupported (this.name + ': fiat fetchDepositAddress() for ' + code + ' is not supported');
        let response = await this.privatePostCurrenciesCurrencyReceiveAddresses (this.extend ({
            'currency': currency['id'],
        }, params));
        let address = this.safeString (response['receive_address'], 'address');  // the creation is async and returns a null address, returns only the id
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        let statuses = {
            'rejected': 'failed',
            'confirmed': 'ok',
            'anulled': 'canceled',
            'retained': 'canceled',
            'pending_confirmation': 'pending',
        };
        return (status in statuses) ? statuses[status] : status;
    }

    parseTransaction (transaction, currency = undefined) {
        let id = this.safeString (transaction, 'id');
        let timestamp = this.parse8601 (this.safeString (transaction, 'created_at'));
        let code = undefined;
        let currencyId = undefined;
        if (currency === undefined) {
            currencyId = this.safeString (transaction, 'currency');
            currency = this.safeValue (this.currencies_by_id, currencyId);
        }
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        let amount = parseFloat (transaction['amount'][0]);
        let fee = parseFloat (transaction['fee'][0]);
        let feeCurrency = transaction['fee'][1];
        let status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        let type = ('deposit_data' in transaction) ? 'deposit' : 'withdrawal';
        let data = this.safeValue (transaction, type + '_data', {});
        let address = this.safeValue (data, 'target_address');
        let txid = this.safeString (data, 'tx_hash');
        let updated = this.parse8601 (this.safeString (data, 'updated_at'));
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'cost': fee,
                'rate': feeCurrency,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (code === undefined)
            throw new ExchangeError (this.name + ': fetchDeposits() requires a currency code argument');
        let currency = this.currency (code);
        let response = await this.privateGetCurrenciesCurrencyDeposits (this.extend ({
            'currency': currency['id'],
            'per': limit,
        }, params));
        let deposits = response['deposits'];
        return this.parseTransactions (deposits, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (code === undefined)
            throw new ExchangeError (this.name + ': fetchDeposits() requires a currency code argument');
        let currency = this.currency (code);
        let response = await this.privateGetCurrenciesCurrencyWithdrawals (this.extend ({
            'currency': currency['id'],
            'per': limit,
        }, params));
        let withdrawals = response['withdrawals'];
        return this.parseTransactions (withdrawals, currency, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let response = await this.privatePostCurrenciesCurrencyWithdrawals (this.extend ({
            'currency': currency['id'],
            'amount': amount,
            'withdrawal_data': {
                'target_address': address,
            },
        }, params));
        let withdrawal = response['withdrawal'];
        return this.parseTransaction (withdrawal);
    }

    nonce () {
        return this.microseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            if (method === 'GET') {
                request += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
            }
        }
        let url = this.urls['api'] + '/' + this.version + '/' + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let components = [ method, '/api/' + this.version + '/' + request ];
            if (body) {
                let base64_body = this.stringToBase64 (this.encode (body));
                components.push (this.decode (base64_body));
            }
            components.push (nonce);
            let message = components.join (' ');
            let signature = this.hmac (this.encode (message), this.encode (this.secret), 'sha384');
            headers = {
                'X-SBTC-APIKEY': this.apiKey,
                'X-SBTC-SIGNATURE': signature,
                'X-SBTC-NONCE': nonce,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (!this.isJsonEncodedObject (body)) {
            return; // fallback to default error handler
        }
        if (code >= 400) {
            let errorCode = this.safeString (response, 'code');
            let message = this.safeString (response, 'message', body);
            let feedback = this.name + ': ' + message;
            let exceptions = this.exceptions;
            if (errorCode !== undefined) {
                if (errorCode in exceptions) {
                    throw new exceptions[errorCode] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
};
