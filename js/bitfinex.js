"use strict";

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange')
const { ExchangeError, InsufficientFunds, NotSupported, InvalidOrder } = require ('./base/errors')

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends Exchange {

    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'US',
            'version': 'v1',
            'rateLimit': 1500,
            'hasCORS': false,
            // old metainfo interface
            'hasFetchOrder': true,
            'hasFetchTickers': true,
            'hasDeposit': true,
            'hasWithdraw': true,
            'hasFetchOHLCV': true,
            'hasFetchOpenOrders': true,
            'hasFetchClosedOrders': true,
            // new metainfo interface
            'has': {
                'fetchOHLCV': true,
                'fetchTickers': true,
                'fetchOrder': true,
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'withdraw': true,
                'deposit': true,
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
                '1w': '7D',
                '2w': '14D',
                '1M': '1M',
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg',
                'api': 'https://api.bitfinex.com',
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://bitfinex.readme.io/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                'v2': {
                    'get': [
                        'candles/trade:{timeframe}:{symbol}/{section}',
                        'candles/trade:{timeframe}:{symbol}/last',
                        'candles/trade:{timeframe}:{symbol}/hist',
                    ],
                },
                'public': {
                    'get': [
                        'book/{symbol}',
                        // 'candles/{symbol}',
                        'lendbook/{currency}',
                        'lends/{currency}',
                        'pubticker/{symbol}',
                        'stats/{symbol}',
                        'symbols',
                        'symbols_details',
                        'tickers',
                        'today',
                        'trades/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'account_infos',
                        'balances',
                        'basket_manage',
                        'credits',
                        'deposit/new',
                        'funding/close',
                        'history',
                        'history/movements',
                        'key_info',
                        'margin_infos',
                        'mytrades',
                        'mytrades_funding',
                        'offer/cancel',
                        'offer/new',
                        'offer/status',
                        'offers',
                        'offers/hist',
                        'order/cancel',
                        'order/cancel/all',
                        'order/cancel/multi',
                        'order/cancel/replace',
                        'order/new',
                        'order/new/multi',
                        'order/status',
                        'orders',
                        'orders/hist',
                        'position/claim',
                        'positions',
                        'summary',
                        'taken_funds',
                        'total_taken_funds',
                        'transfer',
                        'unused_taken_funds',
                        'withdraw',
                    ],
                },
            },
        });
    }

    commonCurrencyCode (currency) {
        // issue #4 Bitfinex names Dash as DSH, instead of DASH
        if (currency == 'DSH')
            return 'DASH';
        if (currency == 'QTM')
            return 'QTUM';
        if (currency == 'BCC')
            return 'CST_BCC';
        if (currency == 'BCU')
            return 'CST_BCU';
        return currency;
    }

    async fetchMarkets () {
        let markets = await this.publicGetSymbolsDetails ();
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['pair'].toUpperCase ();
            let baseId = id.slice (0, 3);
            let quoteId = id.slice (3, 6);
            let base = this.commonCurrencyCode (baseId);
            let quote = this.commonCurrencyCode (quoteId);
            let symbol = base + '/' + quote;
            let precision = {
                'price': market['price_precision'],
                'amount': market['price_precision'],
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'info': market,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': parseFloat (market['minimum_order_size']),
                        'max': parseFloat (market['maximum_order_size']),
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': Math.pow (10, precision['price']),
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balanceType = this.safeString (params, 'type', 'exchange');
        let balances = await this.privatePostBalances ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            if (balance['type'] == balanceType) {
                let currency = balance['currency'];
                let uppercase = currency.toUpperCase ();
                uppercase = this.commonCurrencyCode (uppercase);
                let account = this.account ();
                account['free'] = parseFloat (balance['available']);
                account['total'] = parseFloat (balance['amount']);
                account['used'] = account['total'] - account['free'];
                result[uppercase] = account;
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, params = {}) {
        await this.loadMarkets ();
        let orderbook = await this.publicGetBookSymbol (this.extend ({
            'symbol': this.marketId (symbol),
        }, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            if ('pair' in ticker) {
                let id = ticker['pair'];
                if (id in this.markets_by_id) {
                    let market = this.markets_by_id[id];
                    let symbol = market['symbol'];
                    result[symbol] = this.parseTicker (ticker, market);
                } else {
                    throw new ExchangeError (this.id + ' fetchTickers() failed to recognize symbol ' + id + ' ' + this.json (ticker));
                }
            } else {
                throw new ExchangeError (this.id + ' fetchTickers() response not recognized ' + this.json (tickers));
            }
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let ticker = await this.publicGetPubtickerSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = parseFloat (ticker['timestamp']) * 1000;
        let symbol = undefined;
        if (market) {
            symbol = market['symbol'];
        } else if ('pair' in ticker) {
            let id = ticker['pair'];
            if (id in this.markets_by_id) {
                market = this.markets_by_id[id];
                symbol = market['symbol'];
            } else {
                throw new ExchangeError (this.id + ' unrecognized ticker symbol ' + id + ' ' + this.json (ticker));
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': parseFloat (ticker['high']),
            'low': parseFloat (ticker['low']),
            'bid': parseFloat (ticker['bid']),
            'ask': parseFloat (ticker['ask']),
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'first': undefined,
            'last': parseFloat (ticker['last_price']),
            'change': undefined,
            'percentage': undefined,
            'average': parseFloat (ticker['mid']),
            'baseVolume': parseFloat (ticker['volume']),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (parseFloat (trade['timestamp'])) * 1000;
        let side = trade['type'].toLowerCase ();
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'price': parseFloat (trade['price']),
            'amount': parseFloat (trade['amount']),
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let response = await this.publicGetTradesSymbol (this.extend ({
            'symbol': market['id'],
        }, params));
        return this.parseTrades (response, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = type;
        if ((type == 'limit') || (type == 'market'))
            orderType = 'exchange ' + type;
        amount = this.amountToPrecision (symbol, amount);
        let order = {
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'side': side,
            'type': orderType,
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type == 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            price = this.priceToPrecision (symbol, price);
            order['price'] = price.toString ();
        }
        let result = await this.privatePostOrderNew (this.extend (order, params));
        return {
            'info': result,
            'id': result['order_id'].toString (),
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        return await this.privatePostOrderCancel ({ 'order_id': parseInt (id) });
    }

    parseOrder (order, market = undefined) {
        let side = order['side'];
        let open = order['is_live'];
        let canceled = order['is_cancelled'];
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (!market) {
            let exchange = order['symbol'].toUpperCase ();
            if (exchange in this.markets_by_id) {
                market = this.markets_by_id[exchange];
            }
        }
        if (market)
            symbol = market['symbol'];
        let orderType = order['type'];
        let exchange = orderType.indexOf ('exchange ') >= 0;
        if (exchange) {
            let [ prefix, orderType ] = order['type'].split (' ');
        }
        let timestamp = parseInt (parseFloat (order['timestamp']) * 1000);
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': parseFloat (order['price']),
            'average': parseFloat (order['avg_execution_price']),
            'amount': parseFloat (order['original_amount']),
            'remaining': parseFloat (order['remaining_amount']),
            'filled': parseFloat (order['executed_amount']),
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrders (params);
        return this.parseOrders (response);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (limit)
            request['limit'] = limit;
        let response = await this.privatePostOrdersHist (this.extend (request, params));
        return this.parseOrders (response);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrderStatus (this.extend ({
            'order_id': parseInt (id),
        }, params));
        return this.parseOrder (response);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m', since = undefined, limit = undefined) {
        return [
            ohlcv[0],
            ohlcv[1],
            ohlcv[3],
            ohlcv[4],
            ohlcv[2],
            ohlcv[5],
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let v2id = 't' + market['id'];
        let request = {
            'symbol': v2id,
            'timeframe': this.timeframes[timeframe],
        };
        if (limit)
            request['limit'] = limit;
        if (since)
            request['start'] = since;
        request = this.extend (request, params);
        let response = await this.v2GetCandlesTradeTimeframeSymbolHist (request);
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    getCurrencyName (currency) {
        if (currency == 'BTC') {
            return 'bitcoin';
        } else if (currency == 'LTC') {
            return 'litecoin';
        } else if (currency == 'ETH') {
            return 'ethereum';
        } else if (currency == 'ETC') {
            return 'ethereumc';
        } else if (currency == 'OMNI') {
            return 'mastercoin'; // ???
        } else if (currency == 'ZEC') {
            return 'zcash';
        } else if (currency == 'XMR') {
            return 'monero';
        } else if (currency == 'USD') {
            return 'wire';
        } else if (currency == 'DASH') {
            return 'dash';
        } else if (currency == 'XRP') {
            return 'ripple';
        } else if (currency == 'EOS') {
            return 'eos';
        } else if (currency == 'BCH') {
            return 'bcash';
        } else if (currency == 'USDT') {
            return 'tetheruso';
        }
        throw new NotSupported (this.id + ' ' + currency + ' not supported for withdrawal');
    }

    async deposit (currency, params = {}) {
        await this.loadMarkets ();
        let name = this.getCurrencyName (currency);
        let request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        let response = await this.privatePostDepositNew (this.extend (request, params));
        return {
            'info': response,
            'address': response['address'],
        };
    }

    async withdraw (currency, amount, address, params = {}) {
        await this.loadMarkets ();
        let name = this.getCurrencyName (currency);
        let request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': amount.toString (),
            'address': address,
        };
        let responses = await this.privatePostWithdraw (this.extend (request, params));
        let response = responses[0];
        return {
            'info': response,
            'id': response['withdrawal_id'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        if (api == 'v2') {
            request = '/' + api + request;
        } else {
            request = '/' + this.version + request;
        }
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if ((api == 'public') || (path.indexOf ('hist') >= 0)) {
            if (Object.keys (query).length) {
                let suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api == 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            query = this.json (query);
            query = this.encode (query);
            let payload = this.stringToBase64 (query);
            let secret = this.encode (this.secret);
            let signature = this.hmac (payload, secret, 'sha384');
            headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': this.decode (payload),
                'X-BFX-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (code == 400) {
            if (body[0] == "{") {
                let response = JSON.parse (body);
                let message = response['message'];
                if (message.indexOf ('Key price should be a decimal number') >= 0) {
                    throw new InvalidOrder (this.id + ' ' + message);
                } else if (message.indexOf ('Invalid order') >= 0) {
                    throw new InvalidOrder (this.id + ' ' + message);
                }
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            if (response['message'].indexOf ('not enough exchange balance') >= 0)
                throw new InsufficientFunds (this.id + ' ' + this.json (response));
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
}