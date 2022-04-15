'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InvalidNonce, AuthenticationError, OrderNotFound, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class bitso extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitso',
            'name': 'Bitso',
            'countries': [ 'MX' ], // Mexico
            'rateLimit': 2000, // 30 requests per minute
            'version': 'v3',
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelOrder': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchBorrowRatesPerSymbol': false,
                'fetchDepositAddress': true,
                'fetchFundingFee': false,
                'fetchFundingFees': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg',
                'api': 'https://api.bitso.com',
                'www': 'https://bitso.com',
                'doc': 'https://bitso.com/api_info',
                'fees': 'https://bitso.com/fees',
                'referral': 'https://bitso.com/?ref=itej',
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'precision': {
                    'XRP': 0.000001,
                    'MXN': 0.01,
                    'TUSD': 0.01,
                },
                'defaultPrecision': 0.00000001,
            },
            'timeframes': {
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '30m': '1800',
                '1h': '3600',
                '4h': '14400',
                '12h': '43200',
                '1d': '86400',
                '1w': '604800',
            },
            'api': {
                'public': {
                    'get': [
                        'available_books',
                        'ticker',
                        'order_book',
                        'trades',
                        'ohlc',
                    ],
                },
                'private': {
                    'get': [
                        'account_status',
                        'balance',
                        'fees',
                        'fundings',
                        'fundings/{fid}',
                        'funding_destination',
                        'kyc_documents',
                        'ledger',
                        'ledger/trades',
                        'ledger/fees',
                        'ledger/fundings',
                        'ledger/withdrawals',
                        'mx_bank_codes',
                        'open_orders',
                        'order_trades/{oid}',
                        'orders/{oid}',
                        'user_trades',
                        'user_trades/{tid}',
                        'withdrawals/',
                        'withdrawals/{wid}',
                    ],
                    'post': [
                        'bitcoin_withdrawal',
                        'debit_card_withdrawal',
                        'ether_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                        'orders',
                        'phone_number',
                        'phone_verification',
                        'phone_withdrawal',
                        'spei_withdrawal',
                        'ripple_withdrawal',
                        'bcash_withdrawal',
                        'litecoin_withdrawal',
                    ],
                    'delete': [
                        'orders/{oid}',
                        'orders/all',
                    ],
                },
            },
            'exceptions': {
                '0201': AuthenticationError, // Invalid Nonce or Invalid Credentials
                '104': InvalidNonce, // Cannot perform request - nonce must be higher than 1520307203724237
                '0304': BadRequest, // {"success":false,"error":{"code":"0304","message":"The field time_bucket () is either invalid or missing"}}
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetAvailableBooks (params);
        //
        //     {
        //         "success":true,
        //         "payload":[
        //             {
        //                 "book":"btc_mxn",
        //                 "minimum_price":"500",
        //                 "maximum_price":"10000000",
        //                 "minimum_amount":"0.00005",
        //                 "maximum_amount":"500",
        //                 "minimum_value":"5",
        //                 "maximum_value":"10000000",
        //                 "tick_size":"0.01",
        //                 "fees":{
        //                     "flat_rate":{"maker":"0.500","taker":"0.650"},
        //                     "structure":[
        //                         {"volume":"1500000","maker":"0.00500","taker":"0.00650"},
        //                         {"volume":"2000000","maker":"0.00490","taker":"0.00637"},
        //                         {"volume":"5000000","maker":"0.00480","taker":"0.00624"},
        //                         {"volume":"7000000","maker":"0.00440","taker":"0.00572"},
        //                         {"volume":"10000000","maker":"0.00420","taker":"0.00546"},
        //                         {"volume":"15000000","maker":"0.00400","taker":"0.00520"},
        //                         {"volume":"35000000","maker":"0.00370","taker":"0.00481"},
        //                         {"volume":"50000000","maker":"0.00300","taker":"0.00390"},
        //                         {"volume":"150000000","maker":"0.00200","taker":"0.00260"},
        //                         {"volume":"250000000","maker":"0.00100","taker":"0.00130"},
        //                         {"volume":"9999999999","maker":"0.00000","taker":"0.00130"},
        //                     ]
        //                 }
        //             },
        //         ]
        //     }
        const markets = this.safeValue (response, 'payload');
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'book');
            const [ baseId, quoteId ] = id.split ('_');
            let base = baseId.toUpperCase ();
            let quote = quoteId.toUpperCase ();
            base = this.safeCurrencyCode (base);
            quote = this.safeCurrencyCode (quote);
            const fees = this.safeValue (market, 'fees', {});
            const flatRate = this.safeValue (fees, 'flat_rate', {});
            const takerString = this.safeString (flatRate, 'taker');
            const makerString = this.safeString (flatRate, 'maker');
            const taker = this.parseNumber (Precise.stringDiv (takerString, '100'));
            const maker = this.parseNumber (Precise.stringDiv (makerString, '100'));
            const feeTiers = this.safeValue (fees, 'structure', []);
            const fee = {
                'taker': taker,
                'maker': maker,
                'percentage': true,
                'tierBased': true,
            };
            const takerFees = [];
            const makerFees = [];
            for (let j = 0; j < feeTiers.length; j++) {
                const tier = feeTiers[j];
                const volume = this.safeNumber (tier, 'volume');
                const takerFee = this.safeNumber (tier, 'taker');
                const makerFee = this.safeNumber (tier, 'maker');
                takerFees.push ([ volume, takerFee ]);
                makerFees.push ([ volume, makerFee ]);
                if (j === 0) {
                    fee['taker'] = takerFee;
                    fee['maker'] = makerFee;
                }
            }
            const tiers = {
                'taker': takerFees,
                'maker': makerFees,
            };
            fee['tiers'] = tiers;
            const defaultPricePrecision = this.safeNumber (this.options['precision'], quote, this.options['defaultPrecision']);
            result.push (this.extend ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'active': undefined,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': taker,
                'maker': maker,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': this.safeNumber (this.options['precision'], base, this.options['defaultPrecision']),
                    'price': this.safeNumber (market, 'tick_size', defaultPricePrecision),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': this.safeNumber (market, 'minimum_amount'),
                        'max': this.safeNumber (market, 'maximum_amount'),
                    },
                    'price': {
                        'min': this.safeNumber (market, 'minimum_price'),
                        'max': this.safeNumber (market, 'maximum_price'),
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'minimum_value'),
                        'max': this.safeNumber (market, 'maximum_value'),
                    },
                },
                'info': market,
            }, fee));
        }
        return result;
    }

    parseBalance (response) {
        const payload = this.safeValue (response, 'payload', {});
        const balances = this.safeValue (payload, 'balances');
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeString (balance, 'available');
            account['used'] = this.safeString (balance, 'locked');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        //
        //     {
        //       "success": true,
        //       "payload": {
        //         "balances": [
        //           {
        //             "currency": "bat",
        //             "available": "0.00000000",
        //             "locked": "0.00000000",
        //             "total": "0.00000000",
        //             "pending_deposit": "0.00000000",
        //             "pending_withdrawal": "0.00000000"
        //           },
        //           {
        //             "currency": "bch",
        //             "available": "0.00000000",
        //             "locked": "0.00000000",
        //             "total": "0.00000000",
        //             "pending_deposit": "0.00000000",
        //             "pending_withdrawal": "0.00000000"
        //           },
        //         ],
        //       },
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'book': this.marketId (symbol),
        };
        const response = await this.publicGetOrderBook (this.extend (request, params));
        const orderbook = this.safeValue (response, 'payload');
        const timestamp = this.parse8601 (this.safeString (orderbook, 'updated_at'));
        return this.parseOrderBook (orderbook, symbol, timestamp, 'bids', 'asks', 'price', 'amount');
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "high":"37446.85",
        //         "last":"36599.54",
        //         "created_at":"2022-01-28T12:06:11+00:00",
        //         "book":"btc_usdt",
        //         "volume":"7.29075419",
        //         "vwap":"36579.1564400307",
        //         "low":"35578.52",
        //         "ask":"36574.76",
        //         "bid":"36538.22",
        //         "change_24":"-105.64"
        //     }
        //
        const symbol = this.safeSymbol (undefined, market);
        const timestamp = this.parse8601 (this.safeString (ticker, 'created_at'));
        const vwap = this.safeString (ticker, 'vwap');
        const baseVolume = this.safeString (ticker, 'volume');
        const quoteVolume = Precise.stringMul (baseVolume, vwap);
        const last = this.safeString (ticker, 'last');
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
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market, false);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
        };
        const response = await this.publicGetTicker (this.extend (request, params));
        const ticker = this.safeValue (response, 'payload');
        //
        //     {
        //         "success":true,
        //         "payload":{
        //             "high":"37446.85",
        //             "last":"37051.96",
        //             "created_at":"2022-01-28T17:03:29+00:00",
        //             "book":"btc_usdt",
        //             "volume":"6.16176186",
        //             "vwap":"36582.6293169472",
        //             "low":"35578.52",
        //             "ask":"37083.62",
        //             "bid":"37039.66",
        //             "change_24":"478.45"
        //         }
        //     }
        //
        return this.parseTicker (ticker, market);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
            'time_bucket': this.timeframes[timeframe],
        };
        if (since !== undefined) {
            request['start'] = since;
            if (limit !== undefined) {
                const duration = this.parseTimeframe (timeframe);
                request['end'] = this.sum (since, duration * limit * 1000);
            }
        } else if (limit !== undefined) {
            const now = this.milliseconds ();
            request['end'] = now;
            request['start'] = now - this.parseTimeframe (timeframe) * 1000 * limit;
        }
        const response = await this.publicGetOhlc (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "payload": [
        //             {
        //                 "bucket_start_time":1648219140000,
        //                 "first_trade_time":1648219154990,
        //                 "last_trade_time":1648219189441,
        //                 "first_rate":"44958.60",
        //                 "last_rate":"44979.88",
        //                 "min_rate":"44957.33",
        //                 "max_rate":"44979.88",
        //                 "trade_count":8,
        //                 "volume":"0.00082814",
        //                 "vwap":"44965.02"
        //             },
        //         ]
        //     }
        //
        const payload = this.safeValue (response, 'payload', []);
        return this.parseOHLCVs (payload, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined, timeframe = '1m') {
        //
        //     {
        //         "bucket_start_time":1648219140000,
        //         "first_trade_time":1648219154990,
        //         "last_trade_time":1648219189441,
        //         "first_rate":"44958.60",
        //         "last_rate":"44979.88",
        //         "min_rate":"44957.33",
        //         "max_rate":"44979.88",
        //         "trade_count":8,
        //         "volume":"0.00082814",
        //         "vwap":"44965.02"
        //     },
        //
        return [
            this.safeInteger (ohlcv, 'bucket_start_time'),
            this.safeNumber (ohlcv, 'first_rate'),
            this.safeNumber (ohlcv, 'max_rate'),
            this.safeNumber (ohlcv, 'min_rate'),
            this.safeNumber (ohlcv, 'last_rate'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:14:53+0000",
        //          "amount": "0.00026562",
        //          "maker_side": "sell",
        //          "price": "56471.55",
        //          "tid": "52557338"
        //      }
        //
        // fetchMyTrades (private)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:31:03+0000",
        //          "minor": "11.30356000",
        //          "major": "-0.00020000",
        //          "fees_amount": "0.01119052",
        //          "fees_currency": "usdt",
        //          "minor_currency": "usdt",
        //          "major_currency": "btc",
        //          "oid": "djTzMIWx2Vi3iMjl",
        //          "tid": "52559051",
        //          "price": "56517.80",
        //          "side": "sell",
        //          "maker_side": "buy"
        //      }
        //
        // fetchOrderTrades (private)
        //
        //      {
        //          "book": "btc_usdt",
        //          "created_at": "2021-11-24T12:30:52+0000",
        //          "minor": "-11.33047916",
        //          "major": "0.00020020",
        //          "fees_amount": "0.00000020",
        //          "fees_currency": "btc",
        //          "minor_currency": "usdt",
        //          "major_currency": "btc",
        //          "oid": "O0D2zcljjjQF5xlG",
        //          "tid": "52559030",
        //          "price": "56595.80",
        //          "side": "buy",
        //          "maker_side": "sell"
        //      }
        //
        const timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        const marketId = this.safeString (trade, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const side = this.safeString2 (trade, 'side', 'maker_side');
        const makerSide = this.safeString (trade, 'maker_side');
        let takerOrMaker = undefined;
        if (side === makerSide) {
            takerOrMaker = 'maker';
        } else {
            takerOrMaker = 'taker';
        }
        let amount = this.safeString2 (trade, 'amount', 'major');
        if (amount !== undefined) {
            amount = Precise.stringAbs (amount);
        }
        let fee = undefined;
        const feeCost = this.safeString (trade, 'fees_amount');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fees_currency');
            const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        let cost = this.safeString (trade, 'minor');
        if (cost !== undefined) {
            cost = Precise.stringAbs (cost);
        }
        const price = this.safeString (trade, 'price');
        const orderId = this.safeString (trade, 'oid');
        const id = this.safeString (trade, 'tid');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'book': market['id'],
        };
        const response = await this.publicGetTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //    {
        //        success: true,
        //        payload: {
        //            fees: [
        //                {
        //                    book: 'btc_mxn',
        //                    fee_percent: '0.6500',
        //                    fee_decimal: '0.00650000',
        //                    taker_fee_percent: '0.6500',
        //                    taker_fee_decimal: '0.00650000',
        //                    maker_fee_percent: '0.5000',
        //                    maker_fee_decimal: '0.00500000',
        //                    volume_currency: 'mxn',
        //                    current_volume: '0.00',
        //                    next_volume: '1500000.00',
        //                    next_maker_fee_percent: '0.490',
        //                    next_taker_fee_percent: '0.637',
        //                    nextVolume: '1500000.00',
        //                    nextFee: '0.490',
        //                    nextTakerFee: '0.637'
        //                },
        //                ...
        //            ],
        //            deposit_fees: [
        //                {
        //                    currency: 'btc',
        //                    method: 'rewards',
        //                    fee: '0.00',
        //                    is_fixed: false
        //                },
        //                ...
        //            ],
        //            withdrawal_fees: {
        //                ada: '0.20958100',
        //                bch: '0.00009437',
        //                ars: '0',
        //                btc: '0.00001209',
        //                ...
        //            }
        //        }
        //    }
        //
        const payload = this.safeValue (response, 'payload', {});
        const fees = this.safeValue (payload, 'fees', []);
        const result = {};
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            const marketId = this.safeString (fee, 'book');
            const symbol = this.safeSymbol (marketId, undefined, '_');
            result[symbol] = {
                'info': fee,
                'symbol': symbol,
                'maker': this.safeNumber (fee, 'maker_fee_decimal'),
                'taker': this.safeNumber (fee, 'taker_fee_decimal'),
                'percentage': true,
                'tierBased': true,
            };
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchMyTrades does not support fetching trades starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetUserTrades (this.extend (request, params));
        return this.parseTrades (response['payload'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'book': this.marketId (symbol),
            'side': side,
            'type': type,
            'major': this.amountToPrecision (symbol, amount),
        };
        if (type === 'limit') {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        const id = this.safeString (response['payload'], 'oid');
        return {
            'info': response,
            'id': id,
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'oid': id,
        };
        return await this.privateDeleteOrdersOid (this.extend (request, params));
    }

    parseOrderStatus (status) {
        const statuses = {
            'partial-fill': 'open', // this is a common substitution in ccxt
            'completed': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        const id = this.safeString (order, 'oid');
        const side = this.safeString (order, 'side');
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const marketId = this.safeString (order, 'book');
        const symbol = this.safeSymbol (marketId, market, '_');
        const orderType = this.safeString (order, 'type');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'original_amount');
        const remaining = this.safeString (order, 'unfilled_amount');
        const clientOrderId = this.safeString (order, 'client_id');
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': undefined,
            'remaining': remaining,
            'filled': undefined,
            'status': status,
            'fee': undefined,
            'average': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = 25, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the don't support fetching trades starting from a date yet
        // use the `marker` extra param for that
        // this is not a typo, the variable name is 'marker' (don't confuse with 'market')
        const markerInParams = ('marker' in params);
        // warn the user with an exception if the user wants to filter
        // starting from since timestamp, but does not set the trade id with an extra 'marker' param
        if ((since !== undefined) && !markerInParams) {
            throw new ExchangeError (this.id + ' fetchOpenOrders does not support fetching orders starting from a timestamp with the `since` argument, use the `marker` extra param to filter starting from an integer trade id');
        }
        // convert it to an integer unconditionally
        if (markerInParams) {
            params = this.extend (params, {
                'marker': parseInt (params['marker']),
            });
        }
        const request = {
            'book': market['id'],
            'limit': limit, // default = 25, max = 100
            // 'sort': 'desc', // default = desc
            // 'marker': id, // integer id to start from
        };
        const response = await this.privateGetOpenOrders (this.extend (request, params));
        const orders = this.parseOrders (response['payload'], market, since, limit);
        return orders;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetOrdersOid ({
            'oid': id,
        });
        const payload = this.safeValue (response, 'payload');
        if (Array.isArray (payload)) {
            const numOrders = response['payload'].length;
            if (numOrders === 1) {
                return this.parseOrder (payload[0]);
            }
        }
        throw new OrderNotFound (this.id + ': The order ' + id + ' not found.');
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'oid': id,
        };
        const response = await this.privateGetOrderTradesOid (this.extend (request, params));
        return this.parseTrades (response['payload'], market);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'fund_currency': currency['id'],
        };
        const response = await this.privateGetFundingDestination (this.extend (request, params));
        let address = this.safeString (response['payload'], 'account_identifier');
        let tag = undefined;
        if (address.indexOf ('?dt=') >= 0) {
            const parts = address.split ('?dt=');
            address = this.safeString (parts, 0);
            tag = this.safeString (parts, 1);
        }
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
            'info': response,
        };
    }

    async fetchFundingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetFees (params);
        //
        //    {
        //        success: true,
        //        payload: {
        //            fees: [
        //                {
        //                    book: 'btc_mxn',
        //                    fee_percent: '0.6500',
        //                    fee_decimal: '0.00650000',
        //                    taker_fee_percent: '0.6500',
        //                    taker_fee_decimal: '0.00650000',
        //                    maker_fee_percent: '0.5000',
        //                    maker_fee_decimal: '0.00500000',
        //                    volume_currency: 'mxn',
        //                    current_volume: '0.00',
        //                    next_volume: '1500000.00',
        //                    next_maker_fee_percent: '0.490',
        //                    next_taker_fee_percent: '0.637',
        //                    nextVolume: '1500000.00',
        //                    nextFee: '0.490',
        //                    nextTakerFee: '0.637'
        //                },
        //                ...
        //            ],
        //            deposit_fees: [
        //                {
        //                    currency: 'btc',
        //                    method: 'rewards',
        //                    fee: '0.00',
        //                    is_fixed: false
        //                },
        //                ...
        //            ],
        //            withdrawal_fees: {
        //                ada: '0.20958100',
        //                bch: '0.00009437',
        //                ars: '0',
        //                btc: '0.00001209',
        //                ...
        //            }
        //        }
        //    }
        //
        const payload = this.safeValue (response, 'payload', {});
        const depositFees = this.safeValue (payload, 'deposit_fees', []);
        const deposit = {};
        for (let i = 0; i < depositFees.length; i++) {
            const depositFee = depositFees[i];
            const currencyId = this.safeString (depositFee, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            deposit[code] = this.safeNumber (depositFee, 'fee');
        }
        const withdraw = {};
        const withdrawalFees = this.safeValue (payload, 'withdrawal_fees', []);
        const currencyIds = Object.keys (withdrawalFees);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            withdraw[code] = this.safeNumber (withdrawalFees, currencyId);
        }
        return {
            'info': response,
            'deposit': deposit,
            'withdraw': withdraw,
        };
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const methods = {
            'BTC': 'Bitcoin',
            'ETH': 'Ether',
            'XRP': 'Ripple',
            'BCH': 'Bcash',
            'LTC': 'Litecoin',
        };
        const method = (code in methods) ? methods[code] : undefined;
        if (method === undefined) {
            throw new ExchangeError (this.id + ' not valid withdraw coin: ' + code);
        }
        const request = {
            'amount': amount,
            'address': address,
            'destination_tag': tag,
        };
        const classMethod = 'privatePost' + method + 'Withdrawal';
        const response = await this[classMethod] (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response['payload'], 'wid'),
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                endpoint += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + endpoint;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ().toString ();
            let request = [ nonce, method, endpoint ].join ('');
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    request += body;
                }
            }
            const signature = this.hmac (this.encode (request), this.encode (this.secret));
            const auth = this.apiKey + ':' + nonce + ':' + signature;
            headers = {
                'Authorization': 'Bitso ' + auth,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        if ('success' in response) {
            //
            //     {"success":false,"error":{"code":104,"message":"Cannot perform request - nonce must be higher than 1520307203724237"}}
            //
            let success = this.safeValue (response, 'success', false);
            if (typeof success === 'string') {
                if ((success === 'true') || (success === '1')) {
                    success = true;
                } else {
                    success = false;
                }
            }
            if (!success) {
                const feedback = this.id + ' ' + this.json (response);
                const error = this.safeValue (response, 'error');
                if (error === undefined) {
                    throw new ExchangeError (feedback);
                }
                const code = this.safeString (error, 'code');
                this.throwExactlyMatchedException (this.exceptions, code, feedback);
                throw new ExchangeError (feedback);
            }
        }
    }
};
