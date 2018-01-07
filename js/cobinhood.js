"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, OrderNotFound, InvalidOrder, AuthenticationError } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class cobinhood extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cobinhood',
            'name': 'COBINHOOD',
            'countries': 'TW',
            'rateLimit': 1000 / 10,
            // obsolete metainfo interface
            'hasFetchTickers': true,
            'hasFetchOHLCV': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            // new metainfo interface
            'has': {
                'fetchTickers': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '3h': '3h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1D',
                '7d': '7D',
                '14d': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://theme.zdassets.com/theme_assets/1996652/cd7d6beb1eaea60e669c3bbb12b59cb5f3238d5d.png',
                'api': {
                    'web': 'https://api.cobinhood.com/v1',
                    'ws': 'wss://feed.cobinhood.com',
                },
                'test': {
                    'web': 'https://sandbox-api.cobinhood.com',
                    'ws': 'wss://sandbox-feed.cobinhood.com',
                },
                'www': 'https://cobinhood.com/',
                'doc': 'https://cobinhood.github.io/api-public/',
            },
            'api': {
                'system': {
                    'get': [
                        'info',
                        'time',
                        'messages',
                        'messages/{messageId}',
                    ],
                },
                'admin': {
                    'get': [
                        'system/messages',
                        'system/messages/{messageId}',
                    ],
                    'post': [
                        'system/messages',
                    ],
                    'patch': [
                        'system/messages/{messageId}',
                    ],
                    'delete': [
                        'system/messages/{messageId}',
                    ],
                },
                'public': {
                    'get': [
                        'market/currencies',
                        'market/trading_pairs',
                        'market/orderbooks/{pair}',
                        'market/stats',
                        'market/tickers/{pair}',
                        'market/trades/{pair}',
                        'chart/candles/{pair}',
                    ],
                },
                'private': {
                    'get': [
                        'trading/orders/{id}',
                        'trading/orders/{id}/trades',
                        'trading/orders',
                        'trading/order_history',
                        'trading/trades/{id}',
                        'wallet/balances',
                        'wallet/ledger',
                        'wallet/deposit_addresses',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawals/{id}',
                        'wallet/withdrawals',
                        'wallet/deposits/{id}',
                        'wallet/deposits',
                    ],
                    'post': [
                        'trading/orders',
                        'wallet/deposit_addresses',
                        'wallet/withdrawal_addresses',
                        'wallet/withdrawals',
                    ],
                    'delete': [
                        'trading/orders/{id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'maker': 0.0,
                    'taker': 0.0,
                },
            },
            'precision': {
                'amount': 8,
                'price': 8,
            },
        });
    }

    async fetchCurrencies (params = {}) {
        let currencies = await this.publicGetMarketCurrencies (params);
        let result = {};
        let precision = this['precision']['amount'];
        for (let i = 0; i < currencies.length; i++) {
            let currency = currencies[i];
            let id = currency['currency'];
            let code = this.commonCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'name': currency['name'],
                'active': true,
                'status': 'ok',
                'fiat': false,
                'lot': parseFloat (currency['min_unit']),
                'precision': precision,
                'wallet': {
                    'address': undefined,
                    'extra': undefined,
                    'withdraw': {
                        'active': true,
                        'fee': parseFloat (currency['withdrawal_fee']),
                    },
                    'deposit': {
                        'active': true,
                        'fee': parseFloat (currency['deposit_fee']),
                    },
                },
                'info': currency,
            };
        }
        return result;
    }

    async fetchMarkets () {
        let markets = await this.publicGetMarketTradingPairs ();
        markets = markets['trading_pairs'];
        let result = [];
        for (let i = 0; i < markets.length; i++) {
            let market = markets[i];
            let id = market['id'];
            let [ base, quote ] = id.split ('-');
            let symbol = base + '/' + quote;
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': this.commonCurrencyCode (base),
                'quote': this.commonCurrencyCode (quote),
                'active': true,
                'lot': parseFloat (market['quote_increment']),
                'limits': {
                    'amount': {
                        'min': parseFloat (market['base_min_size']),
                        'max': parseFloat (market['base_max_size']),
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        let symbol = market['symbol'];
        let timestamp = undefined;
        if ('timestamp' in ticker) {
            timestamp = ticker['timestamp'];
        } else {
            timestamp = this.milliseconds ();
        }
        let info = ticker;
        // from fetchTicker
        if ('info' in ticker)
            info = ticker['info'];
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high_24hr']),
            'low': parseFloat (ticker['low_24hr']),
            'bid': parseFloat (ticker['highest_bid']),
            'ask': parseFloat (ticker['lowest_ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': this.safeFloat (ticker, 'last_price'),
            'change': this.safeFloat (ticker, 'percentChanged24hr'),
            'percentage': undefined,
            'average': undefined,
            'baseVolume': parseFloat (ticker['base_volume']),
            'quoteVolume': this.safeFloat (ticker, 'quote_volume'),
            'info': info,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetMarketTickersPair (this.extend ({
            'pair': market['id'],
        }, params));
        let info = ticker['ticker'];
        ticker = {
            'last_price': info['last_trade_price'],
            'highest_bid': info['highest_bid'],
            'lowest_ask': info['lowest_ask'],
            'base_volume': info['24h_volume'],
            'high_24hr': info['24h_high'],
            'low_24hr': info['24h_low'],
            'timestamp': info['timestamp'],
            'info': info,
        };
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetMarketStats (params);
        let ids = Object.keys (tickers);
        let result = {};
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let market = this.markets_by_id[id];
            let symbol = market['symbol'];
            let ticker = tickers[id];
            result[symbol] = this.parseTicker (ticker, market);
        }
        return result;
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetMarketOrderbooksPair (this.extend ({
            'pair': this.marketId (symbol),
            'limit': 100,
        }, params));
        return this.parseOrderBook (orderbook['orderbook']);
    }

    parseTrade (trade, market = undefined) {
        let symbol = undefined;
        if (market)
            symbol = market['symbol'];
        let timestamp = trade['timestamp'];
        let price = parseFloat (trade['price']);
        let amount = parseFloat (trade['size']);
        let cost = parseFloat (this.costToPrecision (symbol, price * amount));
        let side = trade['maker_side'] == 'bid' ? 'sell' : 'buy';
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': trade['id'],
            'order': undefined,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let trades = await this.publicGetMarketTradesPair (this.extend ({
            'pair': market['id'],
            'limit': limit, // default 20, but that seems too little
        }, params));
        return this.parseTrades (trades['trades'], market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '5m', since = undefined, limit = undefined) {
        return [
            ohlcv['timestamp'] * 1000,
            parseFloat (ohlcv['open']),
            parseFloat (ohlcv['high']),
            parseFloat (ohlcv['low']),
            parseFloat (ohlcv['close']),
            parseFloat (ohlcv['volume']),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let query = {
            'pair': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (since) {
            query['start_time'] = parseInt (since / 1000); // defaults to 0
            // end_time: timestamp in seconds defaults to server time
        }
        let response = await this.publicGetChartCandlesPair (this.extend (query, params));
        return this.parseOHLCVs (response['candles'], market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balances = await this.privateGetWalletBalances (params);
        balances = balances['balances'];
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            let id = balance['currency'];
            let currency = this.commonCurrencyCode (id);
            let account = {
                'free': parseFloat (balance['total']),
                'used': parseFloat (balance['on_order']),
                'total': 0.0,
            };
            account['total'] = this.sum (account['free'], account['used']);
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        let symbol = undefined;
        if (!market) {
            let marketId = order['trading_pair'];
            market = this.markets_by_id[marketId];
        }
        if (market)
            symbol = market['symbol'];
        let timestamp = order['timestamp'];
        let price = parseFloat (order['price']);
        let amount = parseFloat (order['size']);
        let filled = parseFloat (order['filled']);
        let remaining = this.amountToPrecision (symbol, amount - filled);
        // new, queued, open, partially_filled, filled, cancelled
        let status = order['state'];
        if (status == 'filled') {
            status = 'closed';
        } else if (status == 'cancelled') {
            status = 'canceled';
        } else {
            status = 'open';
        }
        let side = order['side'] == 'bid' ? 'buy' : 'sell';
        return {
            'id': order['id'],
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'status': status,
            'symbol': symbol,
            // market, limit, stop, stop_limit, trailing_stop, fill_or_kill
            'type': order['type'],
            'side': side,
            'price': price,
            'cost': price * amount,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': undefined,
            'fee': undefined,
            'info': order,
        };
    }

    parseOrders (orders, market, result = []) {
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            result.push (this.parseOrder (order, market));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        side = (side == 'sell' ? 'ask' : 'bid');
        let request = {
            'trading_pair_id': market['id'],
            // market, limit, stop, stop_limit
            'type': type,
            'side': side,
            'size': this.amountToPrecision (symbol, amount),
        };
        if (type != 'market')
            request['price'] = this.priceToPrecision (symbol, price);
        let response = await this.privatePostTradingOrders (this.extend (request, params));
        let order = this.parseOrder (response['order'], market);
        let id = order['id'];
        this.orders[id] = order;
        return order;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        let result = await this.privateDeleteTradingOrdersId (this.extend ({
            'id': id,
        }, params));
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privateGetTradingOrdersId (this.extend ({
            'id': id.toString (),
        }, params));
        return this.parseOrder (response['order']);
    }

    async fetchOrderTrades (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let trades = await this.privateGetTradingOrdersIdTrades (this.extend ({
            'id': id,
        }, params));
        return this.parseTrades (trades);
    }

    async createDepositAddress (currencyCode, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (currencyCode);
        let response = await this.privatePostWalletDepositAddresses ({
            'currency': currency['id']
        });
        let address = this.safeString (response['deposit_address'], 'address');
        if (!address)
            throw new ExchangeError (this.id + ' createDepositAddress failed: ' + this.last_http_response);
        return {
            'currency': currencyCode,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async fetchDepositAddress (currencyCode, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (currencyCode);
        let response = await this.privateGetWalletDepositAddresses (this.extend ({
            'currency': currency['id']
        }, params));
        let address = this.safeString (response['deposit_addresses'], 'address');
        if (!address)
            throw new ExchangeError (this.id + ' fetchDepositAddress failed: ' + this.last_http_response);
        return {
            'currency': currencyCode,
            'address': address,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (currencyCode, amount, address, params = {}) {
        await this.loadMarkets ();
        let currency = this.currency (currencyCode);
        let result = await this.privatePostWalletWithdrawals (this.extend ({
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        }, params));
        return {
            'info': result,
            'id': result['withdrawal_id'],
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api']['web'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        headers = {};
        if (api == 'private') {
            this.checkRequiredCredentials ();
            headers['device_id'] = this.apiKey;
            headers['nonce'] = this.nonce ();
            headers['Authorization'] = this.jwt (query, this.secret);
        }
        if (method == 'GET') {
            query = this.urlencode (query);
            if (query.length)
                url += '?' + query;
        } else {
            headers['Content-type'] = 'application/json; charset=UTF-8';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code < 400 || code >= 600) {
            return
        }
        if (body[0] != "{") {
            throw new ExchangeError (this.id + ' ' + body);
            return;
        }
        let response = this.unjson (body);
        let message = this.safeValue (response['error'], 'error_code');
        throw new ExchangeError (this.id + ' ' + message);
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body)
        return response['result'];
    }
}
