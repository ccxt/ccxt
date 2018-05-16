'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, DDoSProtection, AuthenticationError, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce } = require ('./base/errors');
const { ROUND, TRUNCATE, SIGNIFICANT_DIGITS } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': 'VG',
            'version': 'v1',
            'rateLimit': 1500,
            // new metainfo interface
            'has': {
                'CORS': false,
                'createDepositAddress': true,
                'deposit': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchTradingFees': true,
                'fetchFundingFees': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'withdraw': true,
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
                        'account_fees',
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
                        'position/close',
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
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': 0.1 / 100,
                    'taker': 0.2 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.2 / 100],
                            [500000, 0.2 / 100],
                            [1000000, 0.2 / 100],
                            [2500000, 0.2 / 100],
                            [5000000, 0.2 / 100],
                            [7500000, 0.2 / 100],
                            [10000000, 0.18 / 100],
                            [15000000, 0.16 / 100],
                            [20000000, 0.14 / 100],
                            [25000000, 0.12 / 100],
                            [30000000, 0.1 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                            [500000, 0.08 / 100],
                            [1000000, 0.06 / 100],
                            [2500000, 0.04 / 100],
                            [5000000, 0.02 / 100],
                            [7500000, 0],
                            [10000000, 0],
                            [15000000, 0],
                            [20000000, 0],
                            [25000000, 0],
                            [30000000, 0],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false, // true for tier-based/progressive
                    'percentage': false, // fixed commission
                    // Actually deposit fees are free for larger deposits (> $1000 USD equivalent)
                    // these values below are deprecated, we should not hardcode fees and limits anymore
                    // to be reimplemented with bitfinex funding fees from their API or web endpoints
                    'deposit': {
                        'BTC': 0.0004,
                        'IOTA': 0.5,
                        'ETH': 0.0027,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'EOS': 0.24279,
                        'XMR': 0.04,
                        'SAN': 0.99269,
                        'DASH': 0.01,
                        'ETC': 0.01,
                        'XRP': 0.02,
                        'YYW': 16.915,
                        'NEO': 0,
                        'ZEC': 0.001,
                        'BTG': 0,
                        'OMG': 0.14026,
                        'DATA': 20.773,
                        'QASH': 1.9858,
                        'ETP': 0.01,
                        'QTUM': 0.01,
                        'EDO': 0.95001,
                        'AVT': 1.3045,
                        'USDT': 0,
                        'TRX': 28.184,
                        'ZRX': 1.9947,
                        'RCN': 10.793,
                        'TNB': 31.915,
                        'SNT': 14.976,
                        'RLC': 1.414,
                        'GNT': 5.8952,
                        'SPK': 10.893,
                        'REP': 0.041168,
                        'BAT': 6.1546,
                        'ELF': 1.8753,
                        'FUN': 32.336,
                        'SNG': 18.622,
                        'AID': 8.08,
                        'MNA': 16.617,
                        'NEC': 1.6504,
                    },
                    'withdraw': {
                        'BTC': 0.0004,
                        'IOTA': 0.5,
                        'ETH': 0.0027,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'EOS': 0.24279,
                        'XMR': 0.04,
                        'SAN': 0.99269,
                        'DASH': 0.01,
                        'ETC': 0.01,
                        'XRP': 0.02,
                        'YYW': 16.915,
                        'NEO': 0,
                        'ZEC': 0.001,
                        'BTG': 0,
                        'OMG': 0.14026,
                        'DATA': 20.773,
                        'QASH': 1.9858,
                        'ETP': 0.01,
                        'QTUM': 0.01,
                        'EDO': 0.95001,
                        'AVT': 1.3045,
                        'USDT': 20,
                        'TRX': 28.184,
                        'ZRX': 1.9947,
                        'RCN': 10.793,
                        'TNB': 31.915,
                        'SNT': 14.976,
                        'RLC': 1.414,
                        'GNT': 5.8952,
                        'SPK': 10.893,
                        'REP': 0.041168,
                        'BAT': 6.1546,
                        'ELF': 1.8753,
                        'FUN': 32.336,
                        'SNG': 18.622,
                        'AID': 8.08,
                        'MNA': 16.617,
                        'NEC': 1.6504,
                    },
                },
            },
            'commonCurrencies': {
                'BCC': 'CST_BCC',
                'BCU': 'CST_BCU',
                'DAT': 'DATA',
                'DSH': 'DASH', // Bitfinex names Dash as DSH, instead of DASH
                'IOS': 'IOST',
                'IOT': 'IOTA',
                'MNA': 'MANA',
                'QSH': 'QASH',
                'QTM': 'QTUM',
                'SNG': 'SNGLS',
                'SPK': 'SPANK',
                'STJ': 'STORJ',
                'YYW': 'YOYOW',
                'USD': 'USDT',
            },
            'exceptions': {
                'exact': {
                    'temporarily_unavailable': ExchangeNotAvailable, // Sorry, the service is temporarily unavailable. See https://www.bitfinex.com/ for more info.
                    'Order could not be cancelled.': OrderNotFound, // non-existent order
                    'No such order found.': OrderNotFound, // ?
                    'Order price must be positive.': InvalidOrder, // on price <= 0
                    'Could not find a key matching the given X-BFX-APIKEY.': AuthenticationError,
                    'This API key does not have permission for this action': AuthenticationError, // authenticated but not authorized
                    'Key price should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (price)
                    'Key amount should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (amount)
                    'ERR_RATE_LIMIT': DDoSProtection,
                    'Nonce is too small.': InvalidNonce,
                },
                'broad': {
                    'Invalid order: not enough exchange balance for ': InsufficientFunds, // when buying cost is greater than the available quote currency
                    'Invalid order: minimum size for ': InvalidOrder, // when amount below limits.amount.min
                    'Invalid order': InvalidOrder, // ?
                    'The available balance is only': InsufficientFunds, // {"status":"error","message":"Cannot withdraw 1.0027 ETH from your exchange wallet. The available balance is only 0.0 ETH. If you have limit orders, open positions, unused or active margin funding, this will decrease your available balance. To increase it, you can cancel limit orders or reduce/close your positions.","withdrawal_id":0,"fees":"0.0027"}
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
        });
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostAccountFees (params);
        const fees = response['withdraw'];
        const withdraw = {};
        const ids = Object.keys (fees);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            let code = id;
            if (id in this.currencies_by_id) {
                let currency = this.currencies_by_id[id];
                code = currency['code'];
            }
            withdraw[code] = this.safeFloat (fees, id);
        }
        return {
            'info': response,
            'withdraw': withdraw,
            'deposit': withdraw,  // only for deposits of less than $1000
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostSummary (params);
        return {
            'info': response,
            'maker': this.safeFloat (response, 'maker_fee'),
            'taker': this.safeFloat (response, 'taker_fee'),
        };
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
            let limits = {
                'amount': {
                    'min': this.safeFloat (market, 'minimum_order_size'),
                    'max': this.safeFloat (market, 'maximum_order_size'),
                },
                'price': {
                    'min': Math.pow (10, -precision['price']),
                    'max': Math.pow (10, precision['price']),
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

    costToPrecision (symbol, cost) {
        return this.decimalToPrecision (cost, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
    }

    priceToPrecision (symbol, price) {
        return this.decimalToPrecision (price, ROUND, this.markets[symbol]['precision']['price'], this.precisionMode);
    }

    amountToPrecision (symbol, amount) {
        return this.decimalToPrecision (amount, TRUNCATE, this.markets[symbol]['precision']['amount'], this.precisionMode);
    }

    feeToPrecision (currency, fee) {
        return this.decimalToPrecision (fee, ROUND, this.currencies[currency]['precision'], this.precisionMode);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        let market = this.markets[symbol];
        let rate = market[takerOrMaker];
        let cost = amount * rate;
        let key = 'quote';
        if (side === 'sell') {
            cost *= price;
        } else {
            key = 'base';
        }
        return {
            'type': takerOrMaker,
            'currency': market[key],
            'rate': rate,
            'cost': parseFloat (this.feeToPrecision (market[key], cost)),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        let balanceType = this.safeString (params, 'type', 'exchange');
        let balances = await this.privatePostBalances ();
        let result = { 'info': balances };
        for (let i = 0; i < balances.length; i++) {
            let balance = balances[i];
            if (balance['type'] === balanceType) {
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {
            'symbol': this.marketId (symbol),
        };
        if (typeof limit !== 'undefined') {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        let orderbook = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (orderbook, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        let tickers = await this.publicGetTickers (params);
        let result = {};
        for (let i = 0; i < tickers.length; i++) {
            let ticker = tickers[i];
            let parsedTicker = this.parseTicker (ticker);
            let symbol = parsedTicker['symbol'];
            result[symbol] = parsedTicker;
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
        let timestamp = this.safeFloat (ticker, 'timestamp') * 1000;
        let symbol = undefined;
        if (typeof market !== 'undefined') {
            symbol = market['symbol'];
        } else if ('pair' in ticker) {
            let id = ticker['pair'];
            if (id in this.markets_by_id)
                market = this.markets_by_id[id];
            if (typeof market !== 'undefined') {
                symbol = market['symbol'];
            } else {
                let baseId = id.slice (0, 3);
                let quoteId = id.slice (3, 6);
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        let last = this.safeFloat (ticker, 'last_price');
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
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': this.safeFloat (ticker, 'mid'),
            'baseVolume': this.safeFloat (ticker, 'volume'),
            'quoteVolume': undefined,
            'info': ticker,
        };
    }

    parseTrade (trade, market) {
        let timestamp = parseInt (parseFloat (trade['timestamp'])) * 1000;
        let side = trade['type'].toLowerCase ();
        let orderId = this.safeString (trade, 'order_id');
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        let cost = price * amount;
        let fee = undefined;
        if ('fee_amount' in trade) {
            let feeCost = -this.safeFloat (trade, 'fee_amount');
            let feeCurrency = this.safeString (trade, 'fee_currency');
            if (feeCurrency in this.currencies_by_id)
                feeCurrency = this.currencies_by_id[feeCurrency]['code'];
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': trade['tid'].toString (),
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'order': orderId,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = {
            'symbol': market['id'],
            'limit_trades': limit,
        };
        if (typeof since !== 'undefined')
            request['timestamp'] = parseInt (since / 1000);
        let response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = this.market (symbol);
        let request = { 'symbol': market['id'] };
        if (typeof limit !== 'undefined')
            request['limit_trades'] = limit;
        if (typeof since !== 'undefined')
            request['timestamp'] = parseInt (since / 1000);
        let response = await this.privatePostMytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        let orderType = type;
        if ((type === 'limit') || (type === 'market'))
            orderType = 'exchange ' + type;
        // amount = this.amountToPrecision (symbol, amount);
        let order = {
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'side': side,
            'type': orderType,
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type === 'market') {
            order['price'] = this.nonce ().toString ();
        } else {
            // price = this.priceToPrecision (symbol, price);
            order['price'] = price.toString ();
        }
        let result = await this.privatePostOrderNew (this.extend (order, params));
        return this.parseOrder (result);
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
            let parts = order['type'].split (' ');
            orderType = parts[1];
        }
        let timestamp = parseInt (parseFloat (order['timestamp']) * 1000);
        let result = {
            'info': order,
            'id': order['id'].toString (),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'side': side,
            'price': this.safeFloat (order, 'price'),
            'average': this.safeFloat (order, 'avg_execution_price'),
            'amount': this.safeFloat (order, 'original_amount'),
            'remaining': this.safeFloat (order, 'remaining_amount'),
            'filled': this.safeFloat (order, 'executed_amount'),
            'status': status,
            'fee': undefined,
        };
        return result;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let response = await this.privatePostOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol)
            orders = this.filterBy (orders, 'symbol', symbol);
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        if (typeof limit !== 'undefined')
            request['limit'] = limit;
        let response = await this.privatePostOrdersHist (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        if (typeof symbol !== 'undefined')
            orders = this.filterBy (orders, 'symbol', symbol);
        orders = this.filterBy (orders, 'status', 'closed');
        return orders;
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
        if (typeof limit === 'undefined')
            limit = 100;
        let market = this.market (symbol);
        let v2id = 't' + market['id'];
        let request = {
            'symbol': v2id,
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'limit': limit,
        };
        if (typeof since !== 'undefined')
            request['start'] = since;
        let response = await this.v2GetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    getCurrencyName (currency) {
        const names = {
            'AGI': 'agi',
            'AID': 'aid',
            'AIO': 'aio',
            'ANT': 'ant',
            'AVT': 'aventus', // #1811
            'BAT': 'bat',
            'BCH': 'bcash', // undocumented
            'BCI': 'bci',
            'BFT': 'bft',
            'BTC': 'bitcoin',
            'BTG': 'bgold',
            'CFI': 'cfi',
            'DAI': 'dai',
            'DASH': 'dash',
            'DATA': 'datacoin',
            'DTH': 'dth',
            'EDO': 'eidoo', // #1811
            'ELF': 'elf',
            'EOS': 'eos',
            'ETC': 'ethereumc',
            'ETH': 'ethereum',
            'ETP': 'metaverse',
            'FUN': 'fun',
            'GNT': 'golem',
            'IOST': 'ios',
            'IOTA': 'iota',
            'LRC': 'lrc',
            'LTC': 'litecoin',
            'MANA': 'mna',
            'MIT': 'mit',
            'MTN': 'mtn',
            'NEO': 'neo',
            'ODE': 'ode',
            'OMG': 'omisego',
            'OMNI': 'mastercoin',
            'QASH': 'qash',
            'QTUM': 'qtum', // #1811
            'RCN': 'rcn',
            'RDN': 'rdn',
            'REP': 'rep',
            'REQ': 'req',
            'RLC': 'rlc',
            'SAN': 'santiment',
            'SNGLS': 'sng',
            'SNT': 'status',
            'SPANK': 'spk',
            'STJ': 'stj',
            'TNB': 'tnb',
            'TRX': 'trx',
            'USD': 'wire',
            'USDT': 'tetheruso', // undocumented
            'WAX': 'wax',
            'XLM': 'xlm',
            'XMR': 'monero',
            'XRP': 'ripple',
            'XVG': 'xvg',
            'YOYOW': 'yoyow',
            'ZEC': 'zcash',
            'ZRX': 'zrx',
        };
        if (currency in names)
            return names[currency];
        throw new NotSupported (this.id + ' ' + currency + ' not supported for withdrawal');
    }

    async createDepositAddress (currency, params = {}) {
        let response = await this.fetchDepositAddress (currency, this.extend ({
            'renew': 1,
        }, params));
        let address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'status': 'ok',
            'info': response['info'],
        };
    }

    async fetchDepositAddress (currency, params = {}) {
        let name = this.getCurrencyName (currency);
        let request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        let response = await this.privatePostDepositNew (this.extend (request, params));
        let address = response['address'];
        let tag = undefined;
        if ('address_pool' in response) {
            tag = address;
            address = response['address_pool'];
        }
        this.checkAddress (address);
        return {
            'currency': currency,
            'address': address,
            'tag': tag,
            'status': 'ok',
            'info': response,
        };
    }

    async withdraw (currency, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        let name = this.getCurrencyName (currency);
        let request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': amount.toString (),
            'address': address,
        };
        if (tag)
            request['payment_id'] = tag;
        let responses = await this.privatePostWithdraw (this.extend (request, params));
        let response = responses[0];
        let id = response['withdrawal_id'];
        let message = response['message'];
        let errorMessage = this.findBroadlyMatchedKey (this.exceptions['broad'], message);
        if (id === 0) {
            if (typeof errorMessage !== 'undefined') {
                let Exception = this.exceptions['broad'][errorMessage];
                throw new Exception (this.id + ' ' + message);
            }
            throw new ExchangeError (this.id + ' withdraw returned an id of zero: ' + this.json (response));
        }
        return {
            'info': response,
            'id': id,
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        if (api === 'v2') {
            request = '/' + api + request;
        } else {
            request = '/' + this.version + request;
        }
        let query = this.omit (params, this.extractParams (path));
        let url = this.urls['api'] + request;
        if ((api === 'public') || (path.indexOf ('/hist') >= 0)) {
            if (Object.keys (query).length) {
                let suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
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

    findBroadlyMatchedKey (map, broadString) {
        const partialKeys = Object.keys (map);
        for (let i = 0; i < partialKeys.length; i++) {
            const partialKey = partialKeys[i];
            if (broadString.indexOf (partialKey) >= 0)
                return partialKey;
        }
        return undefined;
    }

    handleErrors (code, reason, url, method, headers, body) {
        if (body.length < 2)
            return;
        if (code >= 400) {
            if (body[0] === '{') {
                const response = JSON.parse (body);
                const feedback = this.id + ' ' + this.json (response);
                let message = undefined;
                if ('message' in response)
                    message = response['message'];
                else if ('error' in response)
                    message = response['error'];
                else
                    throw new ExchangeError (feedback); // malformed (to our knowledge) response
                const exact = this.exceptions['exact'];
                if (message in exact)
                    throw new exact[message] (feedback);
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (typeof broadKey !== 'undefined')
                    throw new broad[broadKey] (feedback);
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
