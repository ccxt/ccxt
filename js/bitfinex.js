'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { NotSupported, DDoSProtection, AuthenticationError, PermissionDenied, ArgumentsRequired, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, InvalidNonce } = require ('./base/errors');
const { SIGNIFICANT_DIGITS } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitfinex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitfinex',
            'name': 'Bitfinex',
            'countries': [ 'VG' ],
            'version': 'v1',
            'rateLimit': 1500,
            'certified': true,
            // new metainfo interface
            'has': {
                'CORS': false,
                'cancelAllOrders': true,
                'createDepositAddress': true,
                'deposit': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchFundingFees': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTickers': true,
                'fetchTransactions': true,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
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
                'api': {
                    'v2': 'https://api-pub.bitfinex.com', // https://github.com/ccxt/ccxt/issues/5109
                    'public': 'https://api.bitfinex.com',
                    'private': 'https://api.bitfinex.com',
                },
                'www': 'https://www.bitfinex.com',
                'doc': [
                    'https://docs.bitfinex.com/v1/docs',
                    'https://github.com/bitfinexcom/bitfinex-api-node',
                ],
            },
            'api': {
                // v2 symbol ids require a 't' prefix
                // just the public part of it (use bitfinex2 for everything else)
                'v2': {
                    'get': [
                        'platform/status',
                        'tickers',
                        'ticker/{symbol}',
                        'trades/{symbol}/hist',
                        'book/{symbol}/{precision}',
                        'book/{symbol}/P0',
                        'book/{symbol}/P1',
                        'book/{symbol}/P2',
                        'book/{symbol}/P3',
                        'book/{symbol}/R0',
                        'stats1/{key}:{size}:{symbol}:{side}/{section}',
                        'stats1/{key}:{size}:{symbol}/{section}',
                        'stats1/{key}:{size}:{symbol}:long/last',
                        'stats1/{key}:{size}:{symbol}:long/hist',
                        'stats1/{key}:{size}:{symbol}:short/last',
                        'stats1/{key}:{size}:{symbol}:short/hist',
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
                        'XTZ': 0.2,
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
                        'XTZ': 0.2,
                    },
                },
            },
            'commonCurrencies': {
                'ABS': 'ABYSS',
                'AIO': 'AION',
                'AMP': 'AMPL',
                'ATM': 'ATMI',
                'ATO': 'ATOM', // https://github.com/ccxt/ccxt/issues/5118
                'BAB': 'BCH',
                'CTX': 'CTXC',
                'DAD': 'DADI',
                'DAT': 'DATA',
                'DSH': 'DASH',
                'GSD': 'GUSD',
                'HOT': 'Hydro Protocol',
                'IOS': 'IOST',
                'IOT': 'IOTA',
                'IQX': 'IQ',
                'MIT': 'MITH',
                'MNA': 'MANA',
                'NCA': 'NCASH',
                'ORS': 'ORS Group', // conflict with Origin Sport #3230
                'POY': 'POLY',
                'QSH': 'QASH',
                'QTM': 'QTUM',
                'SEE': 'SEER',
                'SNG': 'SNGLS',
                'SPK': 'SPANK',
                'STJ': 'STORJ',
                'TSD': 'TUSD',
                'YYW': 'YOYOW',
                'UDC': 'USDC',
                'UST': 'USDT',
                'UTN': 'UTNP',
                'VSY': 'VSYS',
                'XCH': 'XCHF',
            },
            'exceptions': {
                'exact': {
                    'temporarily_unavailable': ExchangeNotAvailable, // Sorry, the service is temporarily unavailable. See https://www.bitfinex.com/ for more info.
                    'Order could not be cancelled.': OrderNotFound, // non-existent order
                    'No such order found.': OrderNotFound, // ?
                    'Order price must be positive.': InvalidOrder, // on price <= 0
                    'Could not find a key matching the given X-BFX-APIKEY.': AuthenticationError,
                    'Key price should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (price)
                    'Key amount should be a decimal number, e.g. "123.456"': InvalidOrder, // on isNaN (amount)
                    'ERR_RATE_LIMIT': DDoSProtection,
                    'Ratelimit': DDoSProtection,
                    'Nonce is too small.': InvalidNonce,
                    'No summary found.': ExchangeError, // fetchTradingFees (summary) endpoint can give this vague error message
                    'Cannot evaluate your available balance, please try again': ExchangeNotAvailable,
                },
                'broad': {
                    'This API key does not have permission': PermissionDenied, // authenticated but not authorized
                    'Invalid order: not enough exchange balance for ': InsufficientFunds, // when buying cost is greater than the available quote currency
                    'Invalid order: minimum size for ': InvalidOrder, // when amount below limits.amount.min
                    'Invalid order': InvalidOrder, // ?
                    'The available balance is only': InsufficientFunds, // {"status":"error","message":"Cannot withdraw 1.0027 ETH from your exchange wallet. The available balance is only 0.0 ETH. If you have limit orders, open positions, unused or active margin funding, this will decrease your available balance. To increase it, you can cancel limit orders or reduce/close your positions.","withdrawal_id":0,"fees":"0.0027"}
                },
            },
            'precisionMode': SIGNIFICANT_DIGITS,
            'options': {
                'currencyNames': {
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
                    'DADI': 'dad',
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
                    'LYM': 'lym',
                    'MANA': 'mna',
                    'MIT': 'mit',
                    'MKR': 'mkr',
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
                    'STORJ': 'stj',
                    'TNB': 'tnb',
                    'TRX': 'trx',
                    'USD': 'wire',
                    'UTK': 'utk',
                    'USDT': 'tetheruso', // undocumented
                    'VEE': 'vee',
                    'WAX': 'wax',
                    'XLM': 'xlm',
                    'XMR': 'monero',
                    'XRP': 'ripple',
                    'XVG': 'xvg',
                    'YOYOW': 'yoyow',
                    'ZEC': 'zcash',
                    'ZRX': 'zrx',
                    'XTZ': 'tezos',
                },
                'orderTypes': {
                    'limit': 'exchange limit',
                    'market': 'exchange market',
                },
            },
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
            const code = this.safeCurrencyCode (id);
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
        const response = await this.privatePostSummary (params);
        //
        //     {
        //         time: '2019-02-20T15:50:19.152000Z',
        //         trade_vol_30d: [
        //             {
        //                 curr: 'Total (USD)',
        //                 vol: 0,
        //                 vol_maker: 0,
        //                 vol_BFX: 0,
        //                 vol_BFX_maker: 0,
        //                 vol_ETHFX: 0,
        //                 vol_ETHFX_maker: 0
        //             }
        //         ],
        //         fees_funding_30d: {},
        //         fees_funding_total_30d: 0,
        //         fees_trading_30d: {},
        //         fees_trading_total_30d: 0,
        //         maker_fee: 0.001,
        //         taker_fee: 0.002
        //     }
        //
        return {
            'info': response,
            'maker': this.safeFloat (response, 'maker_fee'),
            'taker': this.safeFloat (response, 'taker_fee'),
        };
    }

    async fetchMarkets (params = {}) {
        const ids = await this.publicGetSymbols ();
        const details = await this.publicGetSymbolsDetails ();
        const result = [];
        for (let i = 0; i < details.length; i++) {
            const market = details[i];
            let id = this.safeString (market, 'pair');
            if (!this.inArray (id, ids)) {
                continue;
            }
            id = id.toUpperCase ();
            let baseId = undefined;
            let quoteId = undefined;
            if (id.indexOf (':') >= 0) {
                const parts = id.split (':');
                baseId = parts[0];
                quoteId = parts[1];
            } else {
                baseId = id.slice (0, 3);
                quoteId = id.slice (3, 6);
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'price': market['price_precision'],
                'amount': undefined,
            };
            const limits = {
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

    amountToPrecision (symbol, amount) {
        return this.numberToString (amount);
    }

    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {}) {
        const market = this.markets[symbol];
        const rate = market[takerOrMaker];
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
            'cost': parseFloat (this.currencyToPrecision (market[key], cost)),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const balanceType = this.safeString (params, 'type', 'exchange');
        const query = this.omit (params, 'type');
        const response = await this.privatePostBalances (query);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            if (balance['type'] === balanceType) {
                const currencyId = this.safeString (balance, 'currency');
                const code = this.safeCurrencyCode (currencyId);
                // bitfinex had BCH previously, now it's BAB, but the old
                // BCH symbol is kept for backward-compatibility
                // we need a workaround here so that the old BCH balance
                // would not override the new BAB balance (BAB is unified to BCH)
                // https://github.com/ccxt/ccxt/issues/4989
                if (!(code in result)) {
                    const account = this.account ();
                    account['free'] = this.safeFloat (balance, 'available');
                    account['total'] = this.safeFloat (balance, 'amount');
                    result[code] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        const response = await this.publicGetBookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const ticker = await this.publicGetPubtickerSymbol (this.extend (request, params));
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        let timestamp = this.safeFloat (ticker, 'timestamp');
        if (timestamp !== undefined) {
            timestamp *= 1000;
        }
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else if ('pair' in ticker) {
            const marketId = this.safeString (ticker, 'pair');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
            if (market !== undefined) {
                symbol = market['symbol'];
            } else {
                const baseId = marketId.slice (0, 3);
                const quoteId = marketId.slice (3, 6);
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const last = this.safeFloat (ticker, 'last_price');
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
        const id = this.safeString (trade, 'tid');
        let timestamp = this.safeFloat (trade, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const type = undefined;
        let side = this.safeString (trade, 'type');
        if (side !== undefined) {
            side = side.toLowerCase ();
        }
        const orderId = this.safeString (trade, 'order_id');
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        let fee = undefined;
        if ('fee_amount' in trade) {
            const feeCost = -this.safeFloat (trade, 'fee_amount');
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return {
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': type,
            'order': orderId,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = 50, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'limit_trades': limit,
        };
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a `symbol` argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit_trades'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.privatePostMytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
            'side': side,
            'amount': this.amountToPrecision (symbol, amount),
            'type': this.safeString (this.options['orderTypes'], type, type),
            'ocoorder': false,
            'buy_price_oco': 0,
            'sell_price_oco': 0,
        };
        if (type === 'market') {
            request['price'] = this.nonce ().toString ();
        } else {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrderNew (this.extend (request, params));
        return this.parseOrder (response);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const order = {
            'order_id': id,
        };
        if (price !== undefined) {
            order['price'] = this.priceToPrecision (symbol, price);
        }
        if (amount !== undefined) {
            order['amount'] = this.numberToString (amount);
        }
        if (symbol !== undefined) {
            order['symbol'] = this.marketId (symbol);
        }
        if (side !== undefined) {
            order['side'] = side;
        }
        if (type !== undefined) {
            order['type'] = this.safeString (this.options['orderTypes'], type, type);
        }
        const response = await this.privatePostOrderCancelReplace (this.extend (order, params));
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        return await this.privatePostOrderCancel (this.extend (request, params));
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        return await this.privatePostOrderCancelAll (params);
    }

    parseOrder (order, market = undefined) {
        const side = this.safeString (order, 'side');
        const open = this.safeValue (order, 'is_live');
        const canceled = this.safeValue (order, 'is_cancelled');
        let status = undefined;
        if (open) {
            status = 'open';
        } else if (canceled) {
            status = 'canceled';
        } else {
            status = 'closed';
        }
        let symbol = undefined;
        if (market === undefined) {
            let marketId = this.safeString (order, 'symbol');
            if (marketId !== undefined) {
                marketId = marketId.toUpperCase ();
                if (marketId in this.markets_by_id) {
                    market = this.markets_by_id[marketId];
                }
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let orderType = order['type'];
        const exchange = orderType.indexOf ('exchange ') >= 0;
        if (exchange) {
            const parts = order['type'].split (' ');
            orderType = parts[1];
        }
        let timestamp = this.safeFloat (order, 'timestamp');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp) * 1000;
        }
        const id = this.safeString (order, 'id');
        return {
            'info': order,
            'id': id,
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
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        if (symbol !== undefined) {
            if (!(symbol in this.markets)) {
                throw new ExchangeError (this.id + ' has no symbol ' + symbol);
            }
        }
        const response = await this.privatePostOrders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        return orders;
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privatePostOrdersHist (this.extend (request, params));
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            orders = this.filterBy (orders, 'symbol', symbol);
        }
        orders = this.filterByArray (orders, 'status', [ 'closed', 'canceled' ], false);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': parseInt (id),
        };
        const response = await this.privatePostOrderStatus (this.extend (request, params));
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
        if (limit === undefined) {
            limit = 100;
        }
        const market = this.market (symbol);
        const v2id = 't' + market['id'];
        const request = {
            'symbol': v2id,
            'timeframe': this.timeframes[timeframe],
            'sort': 1,
            'limit': limit,
        };
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.v2GetCandlesTradeTimeframeSymbolHist (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    getCurrencyName (code) {
        if (code in this.options['currencyNames']) {
            return this.options['currencyNames'][code];
        }
        throw new NotSupported (this.id + ' ' + code + ' not supported for withdrawal');
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const request = {
            'renew': 1,
        };
        const response = await this.fetchDepositAddress (code, this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'info': response['info'],
            'currency': code,
            'address': address,
            'tag': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const name = this.getCurrencyName (code);
        const request = {
            'method': name,
            'wallet_name': 'exchange',
            'renew': 0, // a value of 1 will generate a new address
        };
        const response = await this.privatePostDepositNew (this.extend (request, params));
        let address = this.safeValue (response, 'address');
        let tag = undefined;
        if ('address_pool' in response) {
            tag = address;
            address = response['address_pool'];
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        if (code === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactions() requires a currency `code` argument');
        }
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        if (since !== undefined) {
            request['since'] = parseInt (since / 1000);
        }
        const response = await this.privatePostHistoryMovements (this.extend (request, params));
        //
        //     [
        //         {
        //             "id":581183,
        //             "txid": 123456,
        //             "currency":"BTC",
        //             "method":"BITCOIN",
        //             "type":"WITHDRAWAL",
        //             "amount":".01",
        //             "description":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ, offchain transfer ",
        //             "address":"3QXYWgRGX2BPYBpUDBssGbeWEa5zq6snBZ",
        //             "status":"COMPLETED",
        //             "timestamp":"1443833327.0",
        //             "timestamp_created": "1443833327.1",
        //             "fee": 0.1,
        //         }
        //     ]
        //
        return this.parseTransactions (response, currency, since, limit);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        //     {
        //         "id": 12042490,
        //         "fee": "-0.02",
        //         "txid": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "type": "DEPOSIT",
        //         "amount": "2099.849999",
        //         "method": "RIPPLE",
        //         "status": "COMPLETED",
        //         "address": "2505189261",
        //         "currency": "XRP",
        //         "timestamp": "1551730524.0",
        //         "description": "EA5B5A66000B66855865EFF2494D7C8D1921FCBE996482157EBD749F2C85E13D",
        //         "timestamp_created": "1551730523.0"
        //     }
        //
        let timestamp = this.safeFloat (transaction, 'timestamp_created');
        if (timestamp !== undefined) {
            timestamp = parseInt (timestamp * 1000);
        }
        let updated = this.safeFloat (transaction, 'timestamp');
        if (updated !== undefined) {
            updated = parseInt (updated * 1000);
        }
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        let type = this.safeString (transaction, 'type'); // DEPOSIT or WITHDRAWAL
        if (type !== undefined) {
            type = type.toLowerCase ();
        }
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        let feeCost = this.safeFloat (transaction, 'fee');
        if (feeCost !== undefined) {
            feeCost = Math.abs (feeCost);
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'id'),
            'txid': this.safeString (transaction, 'txid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': this.safeString (transaction, 'address'), // todo: this is actually the tag for XRP transfers (the address is missing)
            'tag': undefined, // refix it properly for the tag from description
            'type': type,
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': feeCost,
                'rate': undefined,
            },
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            'CANCELED': 'canceled',
            'ZEROCONFIRMED': 'failed', // ZEROCONFIRMED happens e.g. in a double spend attempt (I had one in my movements!)
            'COMPLETED': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        const name = this.getCurrencyName (code);
        const request = {
            'withdraw_type': name,
            'walletselected': 'exchange',
            'amount': amount.toString (),
            'address': address,
        };
        if (tag !== undefined) {
            request['payment_id'] = tag;
        }
        const responses = await this.privatePostWithdraw (this.extend (request, params));
        const response = responses[0];
        const id = this.safeString (response, 'withdrawal_id');
        const message = this.safeString (response, 'message');
        const errorMessage = this.findBroadlyMatchedKey (this.exceptions['broad'], message);
        if (id === 0) {
            if (errorMessage !== undefined) {
                const ExceptionClass = this.exceptions['broad'][errorMessage];
                throw new ExceptionClass (this.id + ' ' + message);
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
        let url = this.urls['api'][api] + request;
        if ((api === 'public') || (path.indexOf ('/hist') >= 0)) {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            query = this.extend ({
                'nonce': nonce.toString (),
                'request': request,
            }, query);
            body = this.json (query);
            query = this.encode (body);
            const payload = this.stringToBase64 (query);
            const secret = this.encode (this.secret);
            const signature = this.hmac (payload, secret, 'sha384');
            headers = {
                'X-BFX-APIKEY': this.apiKey,
                'X-BFX-PAYLOAD': this.decode (payload),
                'X-BFX-SIGNATURE': signature,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (response === undefined) {
            return;
        }
        if (code >= 400) {
            if (body[0] === '{') {
                const feedback = this.id + ' ' + this.json (response);
                let message = undefined;
                if ('message' in response) {
                    message = response['message'];
                } else if ('error' in response) {
                    message = response['error'];
                } else {
                    throw new ExchangeError (feedback); // malformed (to our knowledge) response
                }
                const exact = this.exceptions['exact'];
                if (message in exact) {
                    throw new exact[message] (feedback);
                }
                const broad = this.exceptions['broad'];
                const broadKey = this.findBroadlyMatchedKey (broad, message);
                if (broadKey !== undefined) {
                    throw new broad[broadKey] (feedback);
                }
                throw new ExchangeError (feedback); // unknown message
            }
        }
    }
};
