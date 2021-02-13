'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ExchangeError, NotSupported, PermissionDenied, InvalidNonce, OrderNotFound, InsufficientFunds, InvalidAddress, InvalidOrder, ArgumentsRequired, OnMaintenance } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class bitstamp extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitstamp',
            'name': 'Bitstamp',
            'countries': [ 'GB' ],
            'rateLimit': 1000,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'pro': true,
            'has': {
                'CORS': true,
                'cancelOrder': true,
                'createOrder': true,
                'fetchBalance': true,
                'fetchDepositAddress': true,
                'fetchMarkets': true,
                'fetchCurrencies': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchFundingFees': true,
                'fetchFees': true,
                'fetchLedger': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg',
                'api': {
                    'public': 'https://www.bitstamp.net/api',
                    'private': 'https://www.bitstamp.net/api',
                    'v1': 'https://www.bitstamp.net/api',
                },
                'www': 'https://www.bitstamp.net',
                'doc': 'https://www.bitstamp.net/api',
            },
            'timeframes': {
                '1m': '60',
                '3m': '180',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '2h': '7200',
                '4h': '14400',
                '6h': '21600',
                '12h': '43200',
                '1d': '86400',
                '1w': '259200',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'get': [
                        'ohlc/{pair}/',
                        'order_book/{pair}/',
                        'ticker_hour/{pair}/',
                        'ticker/{pair}/',
                        'transactions/{pair}/',
                        'trading-pairs-info/',
                    ],
                },
                'private': {
                    'post': [
                        'balance/',
                        'balance/{pair}/',
                        'bch_withdrawal/',
                        'bch_address/',
                        'user_transactions/',
                        'user_transactions/{pair}/',
                        'open_orders/all/',
                        'open_orders/{pair}/',
                        'order_status/',
                        'cancel_order/',
                        'buy/{pair}/',
                        'buy/market/{pair}/',
                        'buy/instant/{pair}/',
                        'sell/{pair}/',
                        'sell/market/{pair}/',
                        'sell/instant/{pair}/',
                        'ltc_withdrawal/',
                        'ltc_address/',
                        'eth_withdrawal/',
                        'eth_address/',
                        'xrp_withdrawal/',
                        'xrp_address/',
                        'xlm_withdrawal/',
                        'xlm_address/',
                        'pax_withdrawal/',
                        'pax_address/',
                        'link_withdrawal/',
                        'link_address/',
                        'usdc_withdrawal/',
                        'usdc_address/',
                        'omg_withdrawal/',
                        'omg_address/',
                        'transfer-to-main/',
                        'transfer-from-main/',
                        'withdrawal-requests/',
                        'withdrawal/open/',
                        'withdrawal/status/',
                        'withdrawal/cancel/',
                        'liquidation_address/new/',
                        'liquidation_address/info/',
                    ],
                },
                'v1': {
                    'post': [
                        'bitcoin_deposit_address/',
                        'unconfirmed_btc/',
                        'bitcoin_withdrawal/',
                        'ripple_withdrawal/',
                        'ripple_address/',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.5 / 100,
                    'maker': 0.5 / 100,
                    'tiers': {
                        'taker': [
                            [0, 0.5 / 100],
                            [20000, 0.25 / 100],
                            [100000, 0.24 / 100],
                            [200000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [50000000, 0.10 / 100],
                            [100000000, 0.07 / 100],
                            [500000000, 0.05 / 100],
                            [2000000000, 0.03 / 100],
                            [6000000000, 0.01 / 100],
                            [10000000000, 0.005 / 100],
                            [10000000001, 0.0],
                        ],
                        'maker': [
                            [0, 0.5 / 100],
                            [20000, 0.25 / 100],
                            [100000, 0.24 / 100],
                            [200000, 0.22 / 100],
                            [400000, 0.20 / 100],
                            [600000, 0.15 / 100],
                            [1000000, 0.14 / 100],
                            [2000000, 0.13 / 100],
                            [4000000, 0.12 / 100],
                            [20000000, 0.11 / 100],
                            [50000000, 0.10 / 100],
                            [100000000, 0.07 / 100],
                            [500000000, 0.05 / 100],
                            [2000000000, 0.03 / 100],
                            [6000000000, 0.01 / 100],
                            [10000000000, 0.005 / 100],
                            [10000000001, 0.0],
                        ],
                    },
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'BTC': 0.0005,
                        'BCH': 0.0001,
                        'LTC': 0.001,
                        'ETH': 0.001,
                        'XRP': 0.02,
                        'XLM': 0.005,
                        'PAX': 0.5,
                        'USD': 25,
                        'EUR': 3.0,
                    },
                    'deposit': {
                        'BTC': 0,
                        'BCH': 0,
                        'LTC': 0,
                        'ETH': 0,
                        'XRP': 0,
                        'XLM': 0,
                        'PAX': 0,
                        'USD': 7.5,
                        'EUR': 0,
                    },
                },
            },
            'exceptions': {
                'exact': {
                    'No permission found': PermissionDenied,
                    'API key not found': AuthenticationError,
                    'IP address not allowed': PermissionDenied,
                    'Invalid nonce': InvalidNonce,
                    'Invalid signature': AuthenticationError,
                    'Authentication failed': AuthenticationError,
                    'Missing key, signature and nonce parameters': AuthenticationError,
                    'Your account is frozen': PermissionDenied,
                    'Please update your profile with your FATCA information, before using API.': PermissionDenied,
                    'Order not found': OrderNotFound,
                    'Price is more than 20% below market price.': InvalidOrder,
                    'Bitstamp.net is under scheduled maintenance.': OnMaintenance, // { "error": "Bitstamp.net is under scheduled maintenance. We'll be back soon." }
                },
                'broad': {
                    'Minimum order size is': InvalidOrder, // Minimum order size is 5.0 EUR.
                    'Check your account balance for details.': InsufficientFunds, // You have only 0.00100000 BTC available. Check your account balance for details.
                    'Ensure this value has at least': InvalidAddress, // Ensure this value has at least 25 characters (it has 4).
                },
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.fetchMarketsFromCache (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const name = this.safeString (market, 'name');
            let [ base, quote ] = name.split ('/');
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const symbol = base + '/' + quote;
            const symbolId = baseId + '_' + quoteId;
            const id = this.safeString (market, 'url_symbol');
            const precision = {
                'amount': market['base_decimals'],
                'price': market['counter_decimals'],
            };
            const parts = market['minimum_order'].split (' ');
            const cost = parts[0];
            // let [ cost, currency ] = market['minimum_order'].split (' ');
            const active = (market['trading'] === 'Enabled');
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'symbolId': symbolId,
                'info': market,
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -precision['amount']),
                        'max': undefined,
                    },
                    'price': {
                        'min': Math.pow (10, -precision['price']),
                        'max': undefined,
                    },
                    'cost': {
                        'min': parseFloat (cost),
                        'max': undefined,
                    },
                },
            });
        }
        return result;
    }

    constructCurrencyObject (id, code, name, precision, minCost, originalPayload) {
        let currencyType = 'crypto';
        const description = this.describe ();
        if (this.isFiat (code)) {
            currencyType = 'fiat';
        }
        return {
            'id': id,
            'code': code,
            'info': originalPayload, // the original payload
            'type': currencyType,
            'name': name,
            'active': true,
            'fee': this.safeFloat (description['fees']['funding']['withdraw'], code),
            'precision': precision,
            'limits': {
                'amount': {
                    'min': Math.pow (10, -precision),
                    'max': undefined,
                },
                'price': {
                    'min': Math.pow (10, -precision),
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
                'withdraw': {
                    'min': undefined,
                    'max': undefined,
                },
            },
        };
    }

    async fetchMarketsFromCache (params = {}) {
        // this method is now redundant
        // currencies are now fetched before markets
        const options = this.safeValue (this.options, 'fetchMarkets', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const response = await this.publicGetTradingPairsInfo (params);
            this.options['fetchMarkets'] = this.extend (options, {
                'response': response,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options['fetchMarkets'], 'response');
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchMarketsFromCache (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const name = this.safeString (market, 'name');
            let [ base, quote ] = name.split ('/');
            const baseId = base.toLowerCase ();
            const quoteId = quote.toLowerCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const description = this.safeString (market, 'description');
            const [ baseDescription, quoteDescription ] = description.split (' / ');
            const parts = market['minimum_order'].split (' ');
            const cost = parts[0];
            if (!(base in result)) {
                result[base] = this.constructCurrencyObject (baseId, base, baseDescription, market['base_decimals'], undefined, market);
            }
            if (!(quote in result)) {
                result[quote] = this.constructCurrencyObject (quoteId, quote, quoteDescription, market['counter_decimals'], parseFloat (cost), market);
            }
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBookPair (this.extend (request, params));
        //
        //     {
        //         "timestamp": "1583652948",
        //         "microtimestamp": "1583652948955826",
        //         "bids": [
        //             [ "8750.00", "1.33685271" ],
        //             [ "8749.39", "0.07700000" ],
        //             [ "8746.98", "0.07400000" ],
        //         ]
        //         "asks": [
        //             [ "8754.10", "1.51995636" ],
        //             [ "8754.71", "1.40000000" ],
        //             [ "8754.72", "2.50000000" ],
        //         ]
        //     }
        //
        const microtimestamp = this.safeInteger (response, 'microtimestamp');
        const timestamp = parseInt (microtimestamp / 1000);
        const orderbook = this.parseOrderBook (response, timestamp);
        orderbook['nonce'] = microtimestamp;
        return orderbook;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {
            'pair': this.marketId (symbol),
        };
        const ticker = await this.publicGetTickerPair (this.extend (request, params));
        const timestamp = this.safeTimestamp (ticker, 'timestamp');
        const vwap = this.safeFloat (ticker, 'vwap');
        const baseVolume = this.safeFloat (ticker, 'volume');
        let quoteVolume = undefined;
        if (baseVolume !== undefined && vwap !== undefined) {
            quoteVolume = baseVolume * vwap;
        }
        const last = this.safeFloat (ticker, 'last');
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

    getCurrencyIdFromTransaction (transaction) {
        //
        //     {
        //         "fee": "0.00000000",
        //         "btc_usd": "0.00",
        //         "datetime": XXX,
        //         "usd": 0.0,
        //         "btc": 0.0,
        //         "eth": "0.05000000",
        //         "type": "0",
        //         "id": XXX,
        //         "eur": 0.0
        //     }
        //
        const currencyId = this.safeStringLower (transaction, 'currency');
        if (currencyId !== undefined) {
            return currencyId;
        }
        transaction = this.omit (transaction, [
            'fee',
            'price',
            'datetime',
            'type',
            'status',
            'id',
        ]);
        const ids = Object.keys (transaction);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id.indexOf ('_') < 0) {
                const value = this.safeFloat (transaction, id);
                if ((value !== undefined) && (value !== 0)) {
                    return id;
                }
            }
        }
        return undefined;
    }

    getMarketFromTrade (trade) {
        trade = this.omit (trade, [
            'fee',
            'price',
            'datetime',
            'tid',
            'type',
            'order_id',
            'side',
        ]);
        const currencyIds = Object.keys (trade);
        const numCurrencyIds = currencyIds.length;
        if (numCurrencyIds > 2) {
            throw new ExchangeError (this.id + ' getMarketFromTrade too many keys: ' + this.json (currencyIds) + ' in the trade: ' + this.json (trade));
        }
        if (numCurrencyIds === 2) {
            let marketId = currencyIds[0] + currencyIds[1];
            if (marketId in this.markets_by_id) {
                return this.markets_by_id[marketId];
            }
            marketId = currencyIds[1] + currencyIds[0];
            if (marketId in this.markets_by_id) {
                return this.markets_by_id[marketId];
            }
        }
        return undefined;
    }

    getMarketFromTrades (trades) {
        const tradesBySymbol = this.indexBy (trades, 'symbol');
        const symbols = Object.keys (tradesBySymbol);
        const numSymbols = symbols.length;
        if (numSymbols === 1) {
            return this.markets[symbols[0]];
        }
        return undefined;
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         date: '1551814435',
        //         tid: '83581898',
        //         price: '0.03532850',
        //         type: '1',
        //         amount: '0.85945907'
        //     },
        //
        // fetchMyTrades, trades returned within fetchOrder (private)
        //
        //     {
        //         "usd": "6.0134400000000000",
        //         "price": "4008.96000000",
        //         "datetime": "2019-03-28 23:07:37.233599",
        //         "fee": "0.02",
        //         "btc": "0.00150000",
        //         "tid": 84452058,
        //         "type": 2
        //     }
        //
        // from fetchOrder:
        //    { fee: '0.000019',
        //     price: '0.00015803',
        //     datetime: '2018-01-07 10:45:34.132551',
        //     btc: '0.0079015000000000',
        //     tid: 42777395,
        //     type: 2, //(0 - deposit; 1 - withdrawal; 2 - market trade) NOT buy/sell
        //     xrp: '50.00000000' }
        const id = this.safeString2 (trade, 'id', 'tid');
        let symbol = undefined;
        let side = undefined;
        let price = this.safeFloat (trade, 'price');
        let amount = this.safeFloat (trade, 'amount');
        const orderId = this.safeString (trade, 'order_id');
        const type = undefined;
        let cost = this.safeFloat (trade, 'cost');
        if (market === undefined) {
            const keys = Object.keys (trade);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].indexOf ('_') >= 0) {
                    const marketId = keys[i].replace ('_', '');
                    if (marketId in this.markets_by_id) {
                        market = this.markets_by_id[marketId];
                    }
                }
            }
            // if the market is still not defined
            // try to deduce it from used keys
            if (market === undefined) {
                market = this.getMarketFromTrade (trade);
            }
        }
        const feeCost = this.safeFloat (trade, 'fee');
        let feeCurrency = undefined;
        if (market !== undefined) {
            price = this.safeFloat (trade, market['symbolId'], price);
            amount = this.safeFloat (trade, market['baseId'], amount);
            cost = this.safeFloat (trade, market['quoteId'], cost);
            feeCurrency = market['quote'];
            symbol = market['symbol'];
        }
        let timestamp = this.safeString2 (trade, 'date', 'datetime');
        if (timestamp !== undefined) {
            if (timestamp.indexOf (' ') >= 0) {
                // iso8601
                timestamp = this.parse8601 (timestamp);
            } else {
                // string unix epoch in seconds
                timestamp = parseInt (timestamp);
                timestamp = timestamp * 1000;
            }
        }
        // if it is a private trade
        if ('id' in trade) {
            if (amount !== undefined) {
                if (amount < 0) {
                    side = 'sell';
                    amount = -amount;
                } else {
                    side = 'buy';
                }
            }
        } else {
            side = this.safeString (trade, 'type');
            if (side === '1') {
                side = 'sell';
            } else if (side === '0') {
                side = 'buy';
            }
        }
        if (cost === undefined) {
            if (price !== undefined) {
                if (amount !== undefined) {
                    cost = price * amount;
                }
            }
        }
        if (cost !== undefined) {
            cost = Math.abs (cost);
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    parseTradingFee (balances, symbol) {
        const market = this.market (symbol);
        const tradeFee = this.safeFloat (balances, market['id'] + '_fee');
        return {
            'symbol': symbol,
            'maker': tradeFee,
            'taker': tradeFee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'time': 'hour',
        };
        const response = await this.publicGetTransactionsPair (this.extend (request, params));
        //
        //     [
        //         {
        //             date: '1551814435',
        //             tid: '83581898',
        //             price: '0.03532850',
        //             type: '1',
        //             amount: '0.85945907'
        //         },
        //         {
        //             date: '1551814434',
        //             tid: '83581896',
        //             price: '0.03532851',
        //             type: '1',
        //             amount: '11.34130961'
        //         },
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "high": "9064.77",
        //         "timestamp": "1593961440",
        //         "volume": "18.49436608",
        //         "low": "9040.87",
        //         "close": "9064.77",
        //         "open": "9040.87"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'pair': market['id'],
            'step': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        if (limit === undefined) {
            if (since === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchOHLCV() requires a since argument or a limit argument');
            } else {
                limit = 1000;
                const start = parseInt (since / 1000);
                request['start'] = start;
                request['end'] = this.sum (start, limit * duration);
                request['limit'] = limit;
            }
        } else {
            if (since !== undefined) {
                const start = parseInt (since / 1000);
                request['start'] = start;
                request['end'] = this.sum (start, limit * duration);
            }
            request['limit'] = Math.min (limit, 1000); // min 1, max 1000
        }
        const response = await this.publicGetOhlcPair (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "pair": "BTC/USD",
        //             "ohlc": [
        //                 {"high": "9064.77", "timestamp": "1593961440", "volume": "18.49436608", "low": "9040.87", "close": "9064.77", "open": "9040.87"},
        //                 {"high": "9071.59", "timestamp": "1593961500", "volume": "3.48631711", "low": "9058.76", "close": "9061.07", "open": "9064.66"},
        //                 {"high": "9067.33", "timestamp": "1593961560", "volume": "0.04142833", "low": "9061.94", "close": "9061.94", "open": "9067.33"},
        //             ],
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const ohlc = this.safeValue (data, 'ohlc', []);
        return this.parseOHLCVs (ohlc, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privatePostBalance (params);
        const result = { 'info': balance };
        const codes = Object.keys (this.currencies);
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            const currency = this.currency (code);
            const currencyId = currency['id'];
            const account = this.account ();
            account['free'] = this.safeFloat (balance, currencyId + '_available');
            account['used'] = this.safeFloat (balance, currencyId + '_reserved');
            account['total'] = this.safeFloat (balance, currencyId + '_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'privatePostBalance';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        const balance = await this[method] (this.extend (request, params));
        return {
            'info': balance,
            'symbol': symbol,
            'maker': balance['fee'],
            'taker': balance['fee'],
        };
    }

    praseTradingFees (balance) {
        const result = { 'info': balance };
        const markets = Object.keys (this.markets);
        for (let i = 0; i < markets.length; i++) {
            const symbol = markets[i];
            const fee = this.parseTradingFee (balance, symbol);
            result[symbol] = fee;
        }
        return result;
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privatePostBalance (params);
        return this.praseTradingFees (balance);
    }

    parseFundingFees (balance) {
        const withdraw = {};
        const ids = Object.keys (balance);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            if (id.indexOf ('_withdrawal_fee') >= 0) {
                const currencyId = id.split ('_')[0];
                const code = this.safeCurrencyCode (currencyId);
                withdraw[code] = this.safeFloat (balance, id);
            }
        }
        return {
            'info': balance,
            'withdraw': withdraw,
            'deposit': {},
        };
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privatePostBalance (params);
        return this.parseFundingFees (balance);
    }

    async fetchFees (params = {}) {
        await this.loadMarkets ();
        const balance = await this.privatePostBalance (params);
        const tradingFees = this.praseTradingFees (balance);
        delete tradingFees['info'];
        const fundingFees = this.parseFundingFees (balance);
        delete fundingFees['info'];
        return {
            'info': balance,
            'trading': tradingFees,
            'funding': fundingFees,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let method = 'privatePost' + this.capitalize (side);
        const request = {
            'pair': market['id'],
            'amount': this.amountToPrecision (symbol, amount),
        };
        if (type === 'market') {
            method += 'Market';
        } else if (type === 'instant') {
            method += 'Instant';
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        method += 'Pair';
        const response = await this[method] (this.extend (request, params));
        const order = this.parseOrder (response, market);
        return this.extend (order, {
            'type': type,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        return await this.privatePostCancelOrder (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'In Queue': 'open',
            'Open': 'open',
            'Finished': 'closed',
            'Canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    async fetchOrderStatus (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        return this.parseOrderStatus (this.safeString (response, 'status'));
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const request = { 'id': id };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
        //
        //     {
        //         "status": "Finished",
        //         "id": 3047704374,
        //         "transactions": [
        //             {
        //                 "usd": "6.0134400000000000",
        //                 "price": "4008.96000000",
        //                 "datetime": "2019-03-28 23:07:37.233599",
        //                 "fee": "0.02",
        //                 "btc": "0.00150000",
        //                 "tid": 84452058,
        //                 "type": 2
        //             }
        //         ]
        //     }
        return this.parseOrder (response, market);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        let method = 'privatePostUserTransactions';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['pair'] = market['id'];
            method += 'Pair';
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        const result = this.filterBy (response, 'type', '2');
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostUserTransactions (this.extend (request, params));
        //
        //     [
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1234567894,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-08 09:00:31",
        //             "type": "1",
        //             "xrp": "-20.00000000",
        //             "eur": 0,
        //         },
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1134567891,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-07 18:47:52",
        //             "type": "0",
        //             "xrp": "20.00000000",
        //             "eur": 0,
        //         },
        //     ]
        //
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const transactions = this.filterByArray (response, 'type', [ '0', '1' ], false);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (since !== undefined) {
            request['timedelta'] = this.milliseconds () - since;
        } else {
            request['timedelta'] = 50000000; // use max bitstamp approved value
        }
        const response = await this.privatePostWithdrawalRequests (this.extend (request, params));
        //
        //     [
        //         {
        //             status: 2,
        //             datetime: '2018-10-17 10:58:13',
        //             currency: 'BTC',
        //             amount: '0.29669259',
        //             address: 'aaaaa',
        //             type: 1,
        //             id: 111111,
        //             transaction_id: 'xxxx',
        //         },
        //         {
        //             status: 2,
        //             datetime: '2018-10-17 10:55:17',
        //             currency: 'ETH',
        //             amount: '1.11010664',
        //             address: 'aaaa',
        //             type: 16,
        //             id: 222222,
        //             transaction_id: 'xxxxx',
        //         },
        //     ]
        //
        return this.parseTransactions (response, undefined, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchTransactions
        //
        //     {
        //         "fee": "0.00000000",
        //         "btc_usd": "0.00",
        //         "id": 1234567894,
        //         "usd": 0,
        //         "btc": 0,
        //         "datetime": "2018-09-08 09:00:31",
        //         "type": "1",
        //         "xrp": "-20.00000000",
        //         "eur": 0,
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         status: 2,
        //         datetime: '2018-10-17 10:58:13',
        //         currency: 'BTC',
        //         amount: '0.29669259',
        //         address: 'aaaaa',
        //         type: 1,
        //         id: 111111,
        //         transaction_id: 'xxxx',
        //     }
        //
        //     {
        //         "id": 3386432,
        //         "type": 14,
        //         "amount": "863.21332500",
        //         "status": 2,
        //         "address": "rE1sdh25BJQ3qFwngiTBwaq3zPGGYcrjp1?dt=1455",
        //         "currency": "XRP",
        //         "datetime": "2018-01-05 15:27:55",
        //         "transaction_id": "001743B03B0C79BA166A064AC0142917B050347B4CB23BA2AB4B91B3C5608F4C"
        //     }
        //
        const timestamp = this.parse8601 (this.safeString (transaction, 'datetime'));
        const id = this.safeString (transaction, 'id');
        const currencyId = this.getCurrencyIdFromTransaction (transaction);
        const code = this.safeCurrencyCode (currencyId, currency);
        const feeCost = this.safeFloat (transaction, 'fee');
        let feeCurrency = undefined;
        let amount = undefined;
        if ('amount' in transaction) {
            amount = this.safeFloat (transaction, 'amount');
        } else if (currency !== undefined) {
            amount = this.safeFloat (transaction, currency['id'], amount);
            feeCurrency = currency['code'];
        } else if ((code !== undefined) && (currencyId !== undefined)) {
            amount = this.safeFloat (transaction, currencyId, amount);
            feeCurrency = code;
        }
        if (amount !== undefined) {
            // withdrawals have a negative amount
            amount = Math.abs (amount);
        }
        let status = 'ok';
        if ('status' in transaction) {
            status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        }
        let type = undefined;
        if ('type' in transaction) {
            // from fetchTransactions
            const rawType = this.safeString (transaction, 'type');
            if (rawType === '0') {
                type = 'deposit';
            } else if (rawType === '1') {
                type = 'withdrawal';
            }
        } else {
            // from fetchWithdrawals
            type = 'withdrawal';
        }
        const txid = this.safeString (transaction, 'transaction_id');
        let tag = undefined;
        let address = this.safeString (transaction, 'address');
        if (address !== undefined) {
            // dt (destination tag) is embedded into the address field
            const addressParts = address.split ('?dt=');
            const numParts = addressParts.length;
            if (numParts > 1) {
                address = addressParts[0];
                tag = addressParts[1];
            }
        }
        const addressFrom = undefined;
        const addressTo = address;
        const tagFrom = undefined;
        const tagTo = tag;
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'currency': feeCurrency,
                'cost': feeCost,
                'rate': undefined,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': addressFrom,
            'addressTo': addressTo,
            'address': address,
            'tagFrom': tagFrom,
            'tagTo': tagTo,
            'tag': tag,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    parseTransactionStatus (status) {
        // withdrawals:
        // 0 (open), 1 (in process), 2 (finished), 3 (canceled) or 4 (failed).
        const statuses = {
            '0': 'pending', // Open
            '1': 'pending', // In process
            '2': 'ok', // Finished
            '3': 'canceled', // Canceled
            '4': 'failed', // Failed
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // from fetch order:
        //   { status: 'Finished',
        //     id: 731693945,
        //     transactions:
        //     [ { fee: '0.000019',
        //         price: '0.00015803',
        //         datetime: '2018-01-07 10:45:34.132551',
        //         btc: '0.0079015000000000',
        //         tid: 42777395,
        //         type: 2,
        //         xrp: '50.00000000' } ] }
        //
        // partially filled order:
        //   { "id": 468646390,
        //     "status": "Canceled",
        //     "transactions": [{
        //         "eth": "0.23000000",
        //         "fee": "0.09",
        //         "tid": 25810126,
        //         "usd": "69.8947000000000000",
        //         "type": 2,
        //         "price": "303.89000000",
        //         "datetime": "2017-11-11 07:22:20.710567"
        //     }]}
        //
        // from create order response:
        //     {
        //         price: '0.00008012',
        //         currency_pair: 'XRP/BTC',
        //         datetime: '2019-01-31 21:23:36',
        //         amount: '15.00000000',
        //         type: '0',
        //         id: '2814205012'
        //     }
        //
        const id = this.safeString (order, 'id');
        let side = this.safeString (order, 'type');
        if (side !== undefined) {
            side = (side === '1') ? 'sell' : 'buy';
        }
        // there is no timestamp from fetchOrder
        const timestamp = this.parse8601 (this.safeString (order, 'datetime'));
        let lastTradeTimestamp = undefined;
        let symbol = undefined;
        let marketId = this.safeStringLower (order, 'currency_pair');
        if (marketId !== undefined) {
            marketId = marketId.replace ('/', '');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        let amount = this.safeFloat (order, 'amount');
        let filled = 0.0;
        const trades = [];
        const transactions = this.safeValue (order, 'transactions', []);
        let feeCost = undefined;
        let cost = undefined;
        const numTransactions = transactions.length;
        if (numTransactions > 0) {
            feeCost = 0.0;
            for (let i = 0; i < numTransactions; i++) {
                const trade = this.parseTrade (this.extend ({
                    'order_id': id,
                    'side': side,
                }, transactions[i]), market);
                filled = this.sum (filled, trade['amount']);
                feeCost = this.sum (feeCost, trade['fee']['cost']);
                if (cost === undefined) {
                    cost = 0.0;
                }
                cost = this.sum (cost, trade['cost']);
                trades.push (trade);
            }
            lastTradeTimestamp = trades[numTransactions - 1]['timestamp'];
        }
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        if ((status === 'closed') && (amount === undefined)) {
            amount = filled;
        }
        let remaining = undefined;
        if (amount !== undefined) {
            remaining = amount - filled;
        }
        let price = this.safeFloat (order, 'price');
        if (market === undefined) {
            market = this.getMarketFromTrades (trades);
        }
        let feeCurrency = undefined;
        if (market !== undefined) {
            if (symbol === undefined) {
                symbol = market['symbol'];
            }
            feeCurrency = market['quote'];
        }
        if (cost === undefined) {
            if (price !== undefined) {
                cost = price * filled;
            }
        } else if (price === undefined) {
            if (filled > 0) {
                price = cost / filled;
            }
        }
        let fee = undefined;
        if (feeCost !== undefined) {
            if (feeCurrency !== undefined) {
                fee = {
                    'cost': feeCost,
                    'currency': feeCurrency,
                };
            }
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'trades': trades,
            'fee': fee,
            'info': order,
            'average': undefined,
        };
    }

    parseLedgerEntryType (type) {
        const types = {
            '0': 'transaction',
            '1': 'transaction',
            '2': 'trade',
            '14': 'transfer',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     [
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1234567894,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-08 09:00:31",
        //             "type": "1",
        //             "xrp": "-20.00000000",
        //             "eur": 0,
        //         },
        //         {
        //             "fee": "0.00000000",
        //             "btc_usd": "0.00",
        //             "id": 1134567891,
        //             "usd": 0,
        //             "btc": 0,
        //             "datetime": "2018-09-07 18:47:52",
        //             "type": "0",
        //             "xrp": "20.00000000",
        //             "eur": 0,
        //         },
        //     ]
        //
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        if (type === 'trade') {
            const parsedTrade = this.parseTrade (item);
            let market = undefined;
            const keys = Object.keys (item);
            for (let i = 0; i < keys.length; i++) {
                if (keys[i].indexOf ('_') >= 0) {
                    const marketId = keys[i].replace ('_', '');
                    if (marketId in this.markets_by_id) {
                        market = this.markets_by_id[marketId];
                    }
                }
            }
            // if the market is still not defined
            // try to deduce it from used keys
            if (market === undefined) {
                market = this.getMarketFromTrade (item);
            }
            const direction = parsedTrade['side'] === 'buy' ? 'in' : 'out';
            return {
                'id': parsedTrade['id'],
                'info': item,
                'timestamp': parsedTrade['timestamp'],
                'datetime': parsedTrade['datetime'],
                'direction': direction,
                'account': undefined,
                'referenceId': parsedTrade['order'],
                'referenceAccount': undefined,
                'type': type,
                'currency': market['base'],
                'amount': parsedTrade['amount'],
                'before': undefined,
                'after': undefined,
                'status': 'ok',
                'fee': parsedTrade['fee'],
            };
        } else {
            const parsedTransaction = this.parseTransaction (item);
            let direction = undefined;
            if ('amount' in item) {
                const amount = this.safeFloat (item, 'amount');
                direction = amount > 0 ? 'in' : 'out';
            } else if (('currency' in parsedTransaction) && parsedTransaction['currency'] !== undefined) {
                const currencyId = this.currencyId (parsedTransaction['currency']);
                const amount = this.safeFloat (item, currencyId);
                direction = amount > 0 ? 'in' : 'out';
            }
            return {
                'id': parsedTransaction['id'],
                'info': item,
                'timestamp': parsedTransaction['timestamp'],
                'datetime': parsedTransaction['datetime'],
                'direction': direction,
                'account': undefined,
                'referenceId': parsedTransaction['txid'],
                'referenceAccount': undefined,
                'type': type,
                'currency': parsedTransaction['currency'],
                'amount': parsedTransaction['amount'],
                'before': undefined,
                'after': undefined,
                'status': parsedTransaction['status'],
                'fee': parsedTransaction['fee'],
            };
        }
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostUserTransactions (this.extend (request, params));
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseLedger (response, currency, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        let market = undefined;
        await this.loadMarkets ();
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privatePostOpenOrdersAll (params);
        //     [
        //         {
        //             price: '0.00008012',
        //             currency_pair: 'XRP/BTC',
        //             datetime: '2019-01-31 21:23:36',
        //             amount: '15.00000000',
        //             type: '0',
        //             id: '2814205012',
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit, {
            'status': 'open',
            'type': 'limit',
        });
    }

    getCurrencyName (code) {
        if (code === 'BTC') {
            return 'bitcoin';
        }
        return code.toLowerCase ();
    }

    isFiat (code) {
        return code === 'USD' || code === 'EUR' || code === 'GBP';
    }

    async fetchDepositAddress (code, params = {}) {
        if (this.isFiat (code)) {
            throw new NotSupported (this.id + ' fiat fetchDepositAddress() for ' + code + ' is not supported!');
        }
        const name = this.getCurrencyName (code);
        const v1 = (code === 'BTC');
        let method = v1 ? 'v1' : 'private'; // v1 or v2
        method += 'Post' + this.capitalize (name);
        method += v1 ? 'Deposit' : '';
        method += 'Address';
        let response = await this[method] (params);
        if (v1) {
            response = JSON.parse (response);
        }
        const address = v1 ? response : this.safeString (response, 'address');
        const tag = v1 ? undefined : this.safeString2 (response, 'memo_id', 'destination_tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        // For fiat withdrawals please provide all required additional parameters in the 'params'
        // Check https://www.bitstamp.net/api/ under 'Open bank withdrawal' for list and description.
        await this.loadMarkets ();
        this.checkAddress (address);
        const request = {
            'amount': amount,
        };
        let method = undefined;
        if (!this.isFiat (code)) {
            const name = this.getCurrencyName (code);
            const v1 = (code === 'BTC');
            method = v1 ? 'v1' : 'private'; // v1 or v2
            method += 'Post' + this.capitalize (name) + 'Withdrawal';
            if (code === 'XRP') {
                if (tag !== undefined) {
                    request['destination_tag'] = tag;
                }
            }
            request['address'] = address;
        } else {
            method = 'privatePostWithdrawalOpen';
            const currency = this.currency (code);
            request['iban'] = address;
            request['account_currency'] = currency['id'];
        }
        const response = await this[method] (this.extend (request, params));
        return {
            'info': response,
            'id': response['id'],
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/';
        if (api !== 'v1') {
            url += this.version + '/';
        }
        url += this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            const authVersion = this.safeValue (this.options, 'auth', 'v2');
            if ((authVersion === 'v1') || (api === 'v1')) {
                const nonce = this.nonce ().toString ();
                const auth = nonce + this.uid + this.apiKey;
                const signature = this.encode (this.hmac (this.encode (auth), this.encode (this.secret)));
                query = this.extend ({
                    'key': this.apiKey,
                    'signature': signature.toUpperCase (),
                    'nonce': nonce,
                }, query);
                body = this.urlencode (query);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                };
            } else {
                const xAuth = 'BITSTAMP ' + this.apiKey;
                const xAuthNonce = this.uuid ();
                const xAuthTimestamp = this.milliseconds ().toString ();
                const xAuthVersion = 'v2';
                let contentType = '';
                headers = {
                    'X-Auth': xAuth,
                    'X-Auth-Nonce': xAuthNonce,
                    'X-Auth-Timestamp': xAuthTimestamp,
                    'X-Auth-Version': xAuthVersion,
                };
                if (method === 'POST') {
                    if (Object.keys (query).length) {
                        body = this.urlencode (query);
                        contentType = 'application/x-www-form-urlencoded';
                        headers['Content-Type'] = contentType;
                    } else {
                        // sending an empty POST request will trigger
                        // an API0020 error returned by the exchange
                        // therefore for empty requests we send a dummy object
                        // https://github.com/ccxt/ccxt/issues/6846
                        body = this.urlencode ({ 'foo': 'bar' });
                        contentType = 'application/x-www-form-urlencoded';
                        headers['Content-Type'] = contentType;
                    }
                }
                const authBody = body ? body : '';
                const auth = xAuth + method + url.replace ('https://', '') + contentType + xAuthNonce + xAuthTimestamp + xAuthVersion + authBody;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
                headers['X-Auth-Signature'] = signature;
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {"error": "No permission found"} // fetchDepositAddress returns this on apiKeys that don't have the permission required
        //     {"status": "error", "reason": {"__all__": ["Minimum order size is 5.0 EUR."]}}
        //     reuse of a nonce gives: { status: 'error', reason: 'Invalid nonce', code: 'API0004' }
        const status = this.safeString (response, 'status');
        const error = this.safeValue (response, 'error');
        if ((status === 'error') || (error !== undefined)) {
            let errors = [];
            if (typeof error === 'string') {
                errors.push (error);
            } else if (error !== undefined) {
                const keys = Object.keys (error);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const value = this.safeValue (error, key);
                    if (Array.isArray (value)) {
                        errors = this.arrayConcat (errors, value);
                    } else {
                        errors.push (value);
                    }
                }
            }
            const reason = this.safeValue (response, 'reason', {});
            if (typeof reason === 'string') {
                errors.push (reason);
            } else {
                const all = this.safeValue (reason, '__all__', []);
                for (let i = 0; i < all.length; i++) {
                    errors.push (all[i]);
                }
            }
            const code = this.safeString (response, 'code');
            if (code === 'API0005') {
                throw new AuthenticationError (this.id + ' invalid signature, use the uid for the main account if you have subaccounts');
            }
            const feedback = this.id + ' ' + body;
            for (let i = 0; i < errors.length; i++) {
                const value = errors[i];
                this.throwExactlyMatchedException (this.exceptions['exact'], value, feedback);
                this.throwBroadlyMatchedException (this.exceptions['broad'], value, feedback);
            }
            throw new ExchangeError (feedback);
        }
    }
};
