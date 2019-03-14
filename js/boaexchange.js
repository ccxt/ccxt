'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AddressPending, AuthenticationError, DDoSProtection, ExchangeError, InsufficientFunds, InvalidNonce, OrderNotFound } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class boaexchange extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'boaexchange',
            'name': 'BOA Exchange',
            'countries': [ 'CR' ],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            // new metainfo interface
            // 25 of 34 Methods implemented
            'has': {
                'CORS': false,
                'cancelAllOrders': false,
                'createOrder': true,
                'createLimitOrder': true,
                'createMarketOrder': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createDepositAddress': true,
                'deposit': false,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': true,
                'fetchFundingFees': true,
                'fetchFundingLimits': true,
                'fetchL2OrderBook': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrder': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'transferToExchange': true,
                'transfer': true,
                'withdraw': true,
            },
            'hostname': 'boaexchange.com',
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m,': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': '1440',
                '1w': '10080',
                '2w': '20160',
                '1M': '43800',
            },
            'urls': {
                'logo': 'https://boaexchange.com/4cdef72eb47d4a759d2c72e619f48827.png',
                'api': 'https://api.{hostname}/api',
                'www': 'https://boaexchange.com',
                'doc': [
                    'https://api.boaexchange.com/docs/',
                ],
            },
            'api': {
                'public': {
                    'get': [
                        'airdrops',
                        'chat',
                        'coins',
                        'coins/{label}',
                        'markets',
                        'markets/{label}',
                        'markets/{label}/ohlcv',
                        'markets/{label}/orderbook',
                        'news',
                        'trades/all',
                    ],
                },
                'private': {
                    'get': [
                        'addresses',
                        'addresses/{label}',
                        'apiKeys',
                        'balances',
                        'balances/{label}',
                        'coins/{label}/limits',
                        'deposits',
                        'deposits/{depositId}',
                        'ledger',
                        'markets/{label}/fees',
                        'markets/{label}/limits',
                        'orders',
                        'orders/{orderId}',
                        'trades',
                        'trades/{tradeId}',
                        'transactions',
                        'transfers',
                        'transfers/{transferId}',
                        'withdraws',
                    ],
                    'post': [
                        'addresses/{label}',
                        'airdrops/{airdropId}',
                        'apiKeys',
                        'apiKeys/{key}',
                        'chat',
                        'markets/favorites',
                        'markets/{label}/toggle',
                        'orders',
                        'transfers',
                        'withdraws',
                    ],
                    'delete': [
                        'apiKeys',
                        'orders',
                        'orders/{orderId}',
                        'withdraws/{withdrawId}',
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'dontGetUsedBalanceFromStaleCache': true,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': 0.15,
                    'taker': 0.15,
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                    },
                    'deposit': {
                    },
                },
            },
            'exceptions': {
                'Invalid X-BOA-ENCRYPTED': AuthenticationError,
                'Invalid X-BOA-NONCE': InvalidNonce,
                'Address is Pending': AddressPending,
                'Insufficient Funds': InsufficientFunds,
                'Order Not Found': OrderNotFound,
                'Too Many Requests': DDoSProtection,
            },
            'options': {
                'hasEmptyMarkets': true,
                // price precision by quote currency code
                'pricePrecisionByCode': {
                    'USD': 3,
                },
                'symbolSeparator': '_',
                'tag': {
                },
            },
            'commonCurrencies': {
            },
        });
    }

    nonce () {
        return this.seconds ();
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'label': currency['id'],
        };
        const response = await this.privateGetAddressesLabel (this.extend (request, params));
        if (response['data'].length > 0) {
            return this.parseDepositAddress (response['data'][0]);
        }
        return [];
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit')
            throw new ExchangeError (this.id + ' allows limit orders only');
        await this.loadMarkets ();
        let market = this.market (symbol);
        let order = {
            'market': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
            'side': side,
        };
        let response = await this.privateGetOrder (this.extend (order, params));
        return this.extend (this.parseOrder (response['data'], market), {
            'status': 'open',
            'price': order['price'],
            'symbol': symbol,
            'amount': order['amount'],
            'side': side,
            'type': type,
            'id': response['data']['id'],
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'orderId': id };
        let response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    async cancelOrders (ids, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let request = { 'orderId': ids.join (',') };
        let response = await this.privateDeleteOrdersOrderId (this.extend (request, params));
        return this.extend (this.parseOrder (response), {
            'status': 'canceled',
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetBalances (params);
        let balances = response['data'];
        return this.parseBalances (balances);
    }

    async fetchClosedOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = { 'market': symbol, 'begin': since, 'limit': limit, 'status': 'closed' };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCoins (params);
        let currencies = this.parseCurrencies (response['data']);
        return currencies;
    }

    async fetchDeposits (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        const request = { 'limit': limit, 'page': since };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetDeposits (this.extend (request, params));
        return this.parseTransactions (response['data'], currency);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'label': currency['id'],
        };
        const response = await this.privateGetAddressesLabel (this.extend (request, params));
        let addresses = this.parseDepositAddresses (response['data']);
        if (!addresses) {
            throw new AddressPending (this.id + ' the address for ' + code + ' is being generated (pending, not ready yet, retry again later)');
        }
        this.checkAddress (addresses[0]);
        return addresses[0];
    }

    async fetchDepositAddresses (codes = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'label': [],
        };
        for (let i = 0; i < codes.length; i++) {
            request['label'].push (codes);
        }
        const response = await this.privateGetAddressesLabel (this.extend (request, params));
        return this.parseDepositAddresses (response);
    }

    async fetchFundingFees (codes = undefined, params = {}) {
        //  by default it will try load withdrawal fees of all currencies (with separate requests)
        //  however if you define codes = [ 'ETH', 'BTC' ] in args it will only load those
        await this.loadMarkets ();
        let withdrawFees = {};
        let info = {};
        if (codes === undefined)
            codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            let code = codes[i];
            let currency = this.currency (code);
            let request = { 'label': currency['id'] };
            let response = await this.publicGetCoinsLabel (request);
            withdrawFees[code] = this.safeFloat (response['data'], 'tx_fee');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': info,
        };
    }

    async fetchFundingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        // by default it will try load withdrawal fees of all currencies (with separate requests, sequentially)
        // however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        let result = {};
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            result[symbol] = await this.fetchFundingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchFundingLimitsById (id, params = {}) {
        let request = {
            'symbol': id,
        };
        let response = await this.privateGetCoinsLabelLimits (this.extend (request, params));
        return this.parseFundingLimits (this.safeValue (response, 'data', {}));
    }

    async fetchLedger (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = {
            'page': since,
            'limit': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetLedger (this.extend (request, params));
        return this.parseLedgerEntries (response['data'], currency);
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets ();
        return this.parseMarkets (response['data']);
    }

    async fetchMyTrades (symbol = undefined, since = 0, limit = 0, params = {}) {
        params['symbol'] = symbol;
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.privateGetTrades (this.extend ({
            'market': market['id'],
            'begin': since,
            'limit': limit,
        }, params));
        if ('data' in response) {
            if (response['data'] !== undefined) {
                return this.parseTrades (response['data'], market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchMyTrades() returned undefined response');
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = 0, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'period': this.timeframes[timeframe],
            'label': market['id'],
            'begin': since,
            'limit': limit,
        };
        let response = await this.publicGetMarketsLabelOhlcv (this.extend (request, params));
        if ('data' in response) {
            if (response['data'])
                return this.parseOHLCVs (response['data'], market, timeframe, since, limit);
        }
        return [];
    }

    async fetchOpenOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = { 'begin': since, 'limit': limit };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.privateGetTrades (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = undefined;
        try {
            let request = { 'orderId': id };
            response = await this.privateGetOrdersOrderId (this.extend (request, params));
        } catch (e) {
            throw e;
        }
        if (!response['data']) {
            throw new OrderNotFound (this.id + ' order ' + id + ' not found');
        }
        return this.parseOrder (response['data']);
    }

    async fetchOrders (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let request = { 'market': symbol, 'begin': since, 'limit': limit, 'status': 'init,open,closed,cancelled' };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['market'] = market['id'];
        }
        let response = await this.privateGetOrders (this.extend (request, params));
        let orders = this.parseOrders (response['data'], market, since, limit);
        return this.filterBySymbol (orders, symbol);
    }

    async fetchOrderBook (symbol, limit = 0, params = {}) {
        await this.loadMarkets ();
        let type = 'both';
        let response = await this.publicGetMarketsLabelOrderbook (this.extend ({
            'label': this.marketId (symbol),
            'side': type,
            'limit': limit,
        }, params));
        let orderbook = response['data'];
        return this.parseOrderBook (orderbook, undefined, 'buy', 'sell', 0, 1);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetMarketsLabel (this.extend ({
            'label': this.marketId (symbol),
        }, params));
        let ticker = response['data'];
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.publicGetMarkets (this.extend ({
        }, params));
        let tickers = response['data'];
        let result = {};
        for (let t = 0; t < tickers.length; t++) {
            let ticker = tickers[t];
            let id = ticker['id'];
            let market = undefined;
            let symbol = undefined;
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                if (market) {
                    symbol = market['symbol'];
                }
            } else {
                symbol = this.parseSymbol (symbol);
                market = this.markets (symbol);
            }
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let market_key = Object.keys (this.markets)[0];
        let market = this.markets[market_key];
        params['label'] = market['id'];
        let response = await this.privateGetMarketsLabelFees (params);
        return {
            'info': response,
            'maker': this.safeFloat (response['data'], 'fees') - this.safeFloat (response['data'], 'rebates'),
            'taker': this.safeFloat (response['data'], 'fees'),
        };
    }

    async fetchTrades (symbol, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesAll (this.extend ({
            'market': market['id'],
            'limit': limit,
            'page': since,
        }, params));
        if ('data' in response) {
            if (response['data'] !== undefined) {
                return this.parseTrades (response['data'], market, since, limit);
            }
        }
        throw new ExchangeError (this.id + ' fetchTrades() returned undefined response');
    }

    async fetchTradingLimits (symbols = undefined, params = {}) {
        // this method should not be called directly, use loadTradingLimits () instead
        // by default it will try load withdrawal fees of all currencies (with separate requests, sequentially)
        // however if you define symbols = [ 'ETH/BTC', 'LTC/BTC' ] in args it will only load those
        await this.loadMarkets ();
        if (symbols === undefined) {
            symbols = this.symbols;
        }
        let result = {};
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            result[symbol] = await this.fetchTradingLimitsById (this.marketId (symbol), params);
        }
        return result;
    }

    async fetchTradingLimitsById (id, params = {}) {
        let request = {
            'symbol': id,
        };
        let response = await this.privateGetMarketsLabelLimits (this.extend (request, params));
        return this.parseTradingLimits (this.safeValue (response, 'data', {}));
    }

    async fetchTransactions (symbol = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTransactions ();
        return this.parseTransactions (response['data']);
    }

    async fetchWithdrawals (code = undefined, since = 0, limit = 0, params = {}) {
        await this.loadMarkets ();
        const request = { 'limit': limit, 'page': since };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        const response = await this.privateGetWithdraws (this.extend (request, params));
        return this.parseTransactions (response['data'], currency);
    }

    async transfer (code, amount, accountFrom = undefined, accountTo = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'to': accountTo,
            'coin': currency.name,
            'from': accountFrom,
            'amount': this.parseFloat (amount),
        };
        let response = await this.privateGeAccountTransfer (this.extend (request, params));
        return {
            'info': response,
            'id': undefined,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        let currency = this.currency (code);
        let request = {
            'label': currency['id'],
            'amount': amount,
            'address': address,
            'password': params['password'],
        };
        let response = await this.privateGetAccountWithdraw (this.extend (request, params));
        let id = undefined;
        if ('data' in response) {
            if ('withdraw' in response['data'])
                id = response['data']['withdraw']['id'];
        }
        return {
            'info': response,
            'id': id,
        };
    }

    parseBalance (balance) {
        let currency = this.commonCurrencyCode (balance['coin']['code']);
        let free = this.safeFloat (balance, 'balance', 0);
        let used = this.safeFloat (balance, 'held_balance', 0);
        let total = free + used;
        const account = {
            'free': free,
            'used': used,
            'total': total,
        };
        return { 'currency': currency, 'account': account };
    }

    parseBalances (balances) {
        let results = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let row = this.parseBalance (balance);
            results[row['currency']] = row['account'];
        }
        return results;
    }

    parseCurrencies (currencies) {
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.commonCurrencyCode (this.safeString (currency, 'code'));
            const precision = 8; // default precision, todo: fix "magic constants"
            const address = undefined;
            const fee = this.safeFloat (currency, 'tx_fee'); // todo: redesign
            result[code] = {
                'id': id,
                'code': code,
                'address': address,
                'info': currency,
                'type': undefined,
                'name': currency['name'],
                'active': currency['maintenance'],
                'fee': fee,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'price': {
                        'min': Math.pow (10, -precision),
                        'max': Math.pow (10, precision),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': fee,
                        'max': Math.pow (10, precision),
                    },
                },
            };
        }
        return result;
    }

    parseDepositAddress (depositAddress, currency = undefined) {
        let address = this.safeString (depositAddress['address'], 'address');
        const code = this.commonCurrencyCode (this.safeString (depositAddress['coin'], 'code'));
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': depositAddress,
        };
    }

    parseFundingLimits (limits, symbol = undefined, params = {}) {
        return {
            'info': limits,
            'min': this.safeFloat (limits['min']),
            'max': this.safeFloat (limits['max']),
        };
    }

    parseLedgerEntries (entries, currency = undefined) {
        let results = [];
        for (let i = 0; i < entries.length; i++) {
            results.push (this.parseLedgerEntry (entries[i], currency));
        }
        return results;
    }

    parseLedgerEntry (entry, currency = undefined) {
        let direction = undefined;
        const id = this.safeString (entry, 'id');
        let type = this.safeString (entry, 'ledger_type');
        if (type === 'pre_order' || type === 'order' || type === 'order_cancel' || type === 'order_return') {
            type = 'trade';
        } else if (type === 'trade_fee') {
            type = 'fee';
        } else if (type === 'trade_referral') {
            type = 'referral';
        } else if (type === 'airdrop') {
            type = 'cashback';
        } else if (type !== 'trade') {
            type = 'transaction';
        }
        const code = this.safeCurrencyCode (entry['coin'], 'code', currency);
        let amount = this.safeFloat (entry, 'amount');
        if (amount < 0) {
            direction = 'out';
        } else {
            direction = 'in';
        }
        let timestamp = this.milliseconds ();
        let data = {
            'info': entry,
            'id': id,
            'direction': direction,
            'account': undefined,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'balanceBefore': undefined,
            'balanceAfter': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': {
                'cost': undefined,
                'currency': code,
            },
        };
        return data;
    }

    parseMarket (market) {
        let id = market['id'];
        let baseId = market['coin_market']['code'];
        let quoteId = market['coin_traded']['code'];
        let base = this.commonCurrencyCode (baseId);
        let quote = this.commonCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let pricePrecision = 8;
        if (quote in this.options['pricePrecisionByCode'])
            pricePrecision = this.options['pricePrecisionByCode'][quote];
        let precision = {
            'amount': 8,
            'price': pricePrecision,
        };
        let paused = this.safeValue (market, 'paused', false);
        if (paused === 'false' || !paused) {
            paused = true;
        }
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': !paused,
            'info': market,
            'precision': precision,
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': undefined,
                },
            },
        };
    }

    parseMarkets (markets) {
        let results = [];
        for (let i = 0; i < markets.length; i++) {
            results.push (this.parseMarket (markets[i]));
        }
        return results;
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1d', since = 0, limit = 0) {
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[2],
            ohlcv[3],
            ohlcv[4],
            ohlcv[5],
        ];
    }

    parseOrder (order, market = undefined) {
        let side = this.safeString (order, 'side');
        let remaining = this.safeFloat (order, 'amount');
        // We parse different fields in a very specific order.
        // Order might well be closed and then canceled.
        let status = undefined;
        if (remaining > 0)
            status = 'open';
        if (this.safeValue (order, 'cancelled', false))
            status = 'canceled';
        if (remaining === 0)
            status = 'closed';
        let symbol = undefined;
        if ('market' in order) {
            let marketId = order['market'];
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                symbol = this.parseSymbol (marketId);
            }
        } else {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        let timestamp = undefined;
        if ('created' in order)
            timestamp = this.parse8601 (order['created'] + '+00:00');
        let lastTradeTimestamp = undefined;
        if (('date_closed' in order) && (order['date_closed'] !== 0))
            lastTradeTimestamp = this.parse8601 (order['date_closed'] + '+00:00');
        if (timestamp === undefined)
            timestamp = lastTradeTimestamp;
        let price = this.safeFloat (order, 'price');
        let amount = this.safeFloat (order, 'amount_start');
        let cost = this.safeFloat (order, 'amount_coin');
        let filled = undefined;
        if (amount !== undefined && remaining !== undefined) {
            filled = amount - remaining;
        }
        let id = this.safeString (order, 'id');
        let result = {
            'info': order,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'cost': cost,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    parseSymbol (id) {
        let [ quote, base ] = id.split (this.options['symbolSeparator']);
        base = this.commonCurrencyCode (base);
        quote = this.commonCurrencyCode (quote);
        return base + '/' + quote;
    }

    parseTicker (ticker, market = undefined) {
        return {
            'symbol': this.safeString (ticker, 'label'),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeFloat (ticker, 'high_price'),
            'low': this.safeFloat (ticker, 'low_price'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeFloat (ticker, 'price'),
            'last': this.safeFloat (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeFloat (ticker, 'price_change'),
            'average': undefined,
            'baseVolume': this.safeFloat (ticker, 'volume_traded'),
            'quoteVolume': this.safeFloat (ticker, 'volume_market'),
            'info': ticker,
        };
    }

    parseTrade (trade, market = undefined) {
        let timestamp = trade['created'];
        let side = trade['maker'];
        let id = undefined;
        if (market === undefined) {
            market = this.marketId (trade['market']);
        }
        let symbol = market['market'];
        let cost = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        if (amount !== undefined) {
            if (price !== undefined) {
                cost = price * amount;
            }
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': 'limit',
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    parseTradingLimits (limits, symbol = undefined, params = {}) {
        return {
            'info': limits,
            'precision': {
                'amount': this.safeInteger (limits['precision'], 'amount'),
                'price': this.safeInteger (limits['precision'], 'price'),
            },
            'limits': {
                'amount': {
                    'min': this.safeFloat (limits['limits']['amount'], 'min'),
                    'max': undefined,
                },
            },
        };
    }

    parseTransaction (transaction, currency = undefined) {
        let address = undefined;
        if ('address' in transaction) {
            address = transaction['address']['address'];
        } else {
            address = transaction['address'];
        }
        let code = undefined;
        let currencyId = this.safeString (transaction['coin'], 'code');
        currency = this.safeValue (this.currencies_by_id, currencyId);
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.commonCurrencyCode (currencyId);
        }
        return {
            'info': transaction,
            'id': transaction['txid'],
            'txid': transaction['txid'],
            'timestamp': transaction['created'],
            'datetime': this.parse8601 (transaction['created']),
            'addressFrom': undefined,
            'address': address,
            'addressTo': undefined,
            'tagFrom': undefined,
            'tag': undefined,
            'tagTo': undefined,
            'type': transaction,
            'amount': transaction['amount'],
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'message': undefined,
            'fee': undefined,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeParams (this.urls['api'], {
            'hostname': this.hostname,
        });
        url += '/' + this.version + '/' + this.implodeParams (path, params);
        params['limit'] = 500;
        url += '?' + this.urlencode (params);
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let signature = this.hmac (this.encode (nonce), this.encode (this.secret), 'sha256');
            headers = {
                'X-BOA-ENCRYPTED': signature,
                'X-BOA-KEY': this.apiKey,
                'X-BOA-NONCE': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (body[0] === '{') {
            let data = this.safeValue (response, 'data');
            let errors = this.safeValue (response, 'errors');
            const feedback = this.id + ' ' + this.json (response);
            if (errors !== undefined) {
                const message = errors[0];
                if (message in this.exceptions)
                    throw new this.exceptions[message] (feedback);
                throw new ExchangeError (url + method + ' an error occoured: ' + this.json (errors));
            }
            if (data === undefined)
                throw new ExchangeError (this.id + ': malformed response: ' + this.json (response));
        }
    }

    async request (path, api = '', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        return response;
    }
};
