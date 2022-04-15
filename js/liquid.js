'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, ArgumentsRequired, InvalidNonce, OrderNotFound, InvalidOrder, InsufficientFunds, AuthenticationError, DDoSProtection, NotSupported, BadSymbol } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class liquid extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'liquid',
            'name': 'Liquid',
            'countries': [ 'JP', 'CN', 'TW' ],
            'version': '2',
            'rateLimit': 1000,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined, // has but not fully implemented
                'swap': undefined, // has but not fully implemented
                'future': false,
                'option': false,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg',
                'api': 'https://api.liquid.com',
                'www': 'https://www.liquid.com',
                'doc': [
                    'https://developers.liquid.com',
                ],
                'fees': 'https://help.liquid.com/getting-started-with-liquid/the-platform/fee-structure',
                'referral': 'https://www.liquid.com/sign-up/?affiliate=SbzC62lt30976',
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'products',
                        'products/{id}',
                        'products/{id}/price_levels',
                        'executions',
                        'ir_ladders/{currency}',
                        'fees', // add fetchFees, fetchTradingFees, fetchFundingFees
                    ],
                },
                'private': {
                    'get': [
                        'accounts', // undocumented https://github.com/ccxt/ccxt/pull/7493
                        'accounts/balance',
                        'accounts/main_asset',
                        'accounts/{id}',
                        'accounts/{currency}/reserved_balance_details',
                        'crypto_accounts', // add fetchAccounts
                        'crypto_withdrawal',
                        'crypto_withdrawals',
                        'crypto_withdrawals/crypto_networks',
                        'executions/me',
                        'fiat_accounts', // add fetchAccounts
                        'fund_infos', // add fetchDeposits
                        'loan_bids',
                        'loans',
                        'orders',
                        'orders/{id}',
                        'orders/{id}/trades', // add fetchOrderTrades
                        'trades',
                        'trades/{id}/loans',
                        'trading_accounts',
                        'trading_accounts/{id}',
                        'transactions',
                        'withdrawals', // add fetchWithdrawals
                        'user/fee_tier',
                        'user/fees',
                        'trading_accounts/{id}',
                        'bank_accounts',
                        'accounts/{currency}/reserved_balance_details',
                    ],
                    'post': [
                        'crypto_withdrawals',
                        'fund_infos',
                        'fiat_accounts',
                        'loan_bids',
                        'orders',
                        'withdrawals',
                        'fees/estimate',
                    ],
                    'put': [
                        'crypto_withdrawal/{id}/cancel',
                        'loan_bids/{id}/close',
                        'loans/{id}',
                        'orders/{id}', // add editOrder
                        'orders/{id}/cancel',
                        'trades/{id}',
                        'trades/{id}/adjust_margin',
                        'trades/{id}/close',
                        'trades/close_all',
                        'trading_accounts/{id}',
                        'withdrawals/{id}/cancel',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.0030,
                    'maker': 0.0000,
                    'tiers': {
                        'perpetual': {
                            'maker': [
                                [ 0, 0.0000 ],
                                [ 25000, 0.0000 ],
                                [ 50000, -0.00025 ],
                                [ 100000, -0.00025 ],
                                [ 1000000, -0.00025 ],
                                [ 10000000, -0.00025 ],
                                [ 25000000, -0.00025 ],
                                [ 50000000, -0.00025 ],
                                [ 75000000, -0.00025 ],
                                [ 100000000, -0.00025 ],
                                [ 200000000, -0.00025 ],
                                [ 300000000, -0.00025 ],
                            ],
                            'taker': [
                                [ 0, 0.00120 ],
                                [ 25000, 0.00115 ],
                                [ 50000, 0.00110 ],
                                [ 100000, 0.00105 ],
                                [ 1000000, 0.00100 ],
                                [ 10000000, 0.00095 ],
                                [ 25000000, 0.00090 ],
                                [ 50000000, 0.00085 ],
                                [ 75000000, 0.00080 ],
                                [ 100000000, 0.00075 ],
                                [ 200000000, 0.00070 ],
                                [ 300000000, 0.00065 ],
                            ],
                        },
                        'spot': {
                            'taker': [
                                [ 0, 0.003 ],
                                [ 10000, 0.0029 ],
                                [ 20000, 0.0028 ],
                                [ 50000, 0.0026 ],
                                [ 100000, 0.0020 ],
                                [ 1000000, 0.0016 ],
                                [ 5000000, 0.0012 ],
                                [ 10000000, 0.0010 ],
                                [ 25000000, 0.0009 ],
                                [ 50000000, 0.0008 ],
                                [ 100000000, 0.0007 ],
                                [ 200000000, 0.0006 ],
                                [ 500000000, 0.0004 ],
                                [ 1000000000, 0.0003 ],
                            ],
                            'maker': [
                                [ 0, 0.0000 ],
                                [ 10000, 0.0020 ],
                                [ 20000, 0.0019 ],
                                [ 50000, 0.0018 ],
                                [ 100000, 0.0016 ],
                                [ 1000000, 0.0008 ],
                                [ 5000000, 0.0007 ],
                                [ 10000000, 0.0005 ],
                                [ 25000000, 0.0000 ],
                                [ 50000000, 0.0000 ],
                                [ 100000000, 0.0000 ],
                                [ 200000000, 0.0000 ],
                                [ 500000000, 0.0000 ],
                                [ 1000000000, 0.0000 ],
                            ],
                        },
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'API rate limit exceeded. Please retry after 300s': DDoSProtection,
                'API Authentication failed': AuthenticationError,
                'Nonce is too small': InvalidNonce,
                'Order not found': OrderNotFound,
                'Can not update partially filled order': InvalidOrder,
                'Can not update non-live order': OrderNotFound,
                'not_enough_free_balance': InsufficientFunds,
                'must_be_positive': InvalidOrder,
                'less_than_order_size': InvalidOrder,
                'price_too_high': InvalidOrder,
                'price_too_small': InvalidOrder, // {"errors":{"order":["price_too_small"]}}
                'product_disabled': BadSymbol, // {"errors":{"order":["product_disabled"]}}
            },
            'commonCurrencies': {
                'BIFI': 'BIFIF',
                'HOT': 'HOT Token',
                'MIOTA': 'IOTA', // https://github.com/ccxt/ccxt/issues/7487
                'P-BTC': 'BTC',
                'TON': 'Tokamak Network',
            },
            'options': {
                'cancelOrderException': true,
                'networks': {
                    'ETH': 'ERC20',
                    'TRX': 'TRC20',
                    'XLM': 'Stellar',
                    'ALGO': 'Algorand',
                },
                'swap': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'BTC', 'ETH', 'XRP', 'QASH', 'USD', 'JPY', 'EUR', 'SGD', 'AUD' ],
                    },
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCurrencies (params);
        //
        //     [
        //         {
        //             currency_type: 'fiat',
        //             currency: 'USD',
        //             symbol: '$',
        //             assets_precision: 2,
        //             quoting_precision: 5,
        //             minimum_withdrawal: '15.0',
        //             withdrawal_fee: 5,
        //             minimum_fee: null,
        //             minimum_order_quantity: null,
        //             display_precision: 2,
        //             depositable: true,
        //             withdrawable: true,
        //             discount_fee: 0.5,
        //             credit_card_fundable: false,
        //             lendable: false,
        //             position_fundable: true,
        //             has_memo: false,
        //             stable_currency: null,
        //             root_currency: 'USD',
        //             minimum_loan_bid_quantity: '0.0',
        //             maximum_order_taker_quantity: null,
        //             name: 'United States Dollar'
        //         },
        //     ]
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'currency');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const depositable = this.safeValue (currency, 'depositable');
            const withdrawable = this.safeValue (currency, 'withdrawable');
            const active = depositable && withdrawable;
            const amountPrecision = this.safeInteger (currency, 'assets_precision');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'name': name,
                'active': active,
                'deposit': depositable,
                'withdraw': withdrawable,
                'fee': this.safeNumber (currency, 'withdrawal_fee'),
                'precision': amountPrecision,
                'limits': {
                    'amount': {
                        'min': Math.pow (10, -amountPrecision),
                        'max': Math.pow (10, amountPrecision),
                    },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'minimum_withdrawal'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const spot = await this.publicGetProducts (params);
        //
        //     [
        //         {
        //             "id":"637",
        //             "product_type":"CurrencyPair",
        //             "code":"CASH",
        //             "name":null,
        //             "market_ask":"0.00000797",
        //             "market_bid":"0.00000727",
        //             "indicator":null,
        //             "currency":"BTC",
        //             "currency_pair_code":"TFTBTC",
        //             "symbol":null,
        //             "btc_minimum_withdraw":null,
        //             "fiat_minimum_withdraw":null,
        //             "pusher_channel":"product_cash_tftbtc_637",
        //             "taker_fee":"0.0",
        //             "maker_fee":"0.0",
        //             "low_market_bid":"0.00000685",
        //             "high_market_ask":"0.00000885",
        //             "volume_24h":"3696.0755956",
        //             "last_price_24h":"0.00000716",
        //             "last_traded_price":"0.00000766",
        //             "last_traded_quantity":"1748.0377978",
        //             "average_price":null,
        //             "quoted_currency":"BTC",
        //             "base_currency":"TFT",
        //             "tick_size":"0.00000001",
        //             "disabled":false,
        //             "margin_enabled":false,
        //             "cfd_enabled":false,
        //             "perpetual_enabled":false,
        //             "last_event_timestamp":"1596962820.000797146",
        //             "timestamp":"1596962820.000797146",
        //             "multiplier_up":"9.0",
        //             "multiplier_down":"0.1",
        //             "average_time_interval":null
        //         },
        //     ]
        //
        const perpetual = await this.publicGetProducts ({ 'perpetual': '1' });
        //
        //     [
        //         {
        //             "id":"604",
        //             "product_type":"Perpetual",
        //             "code":"CASH",
        //             "name":null,
        //             "market_ask":"11721.5",
        //             "market_bid":"11719.0",
        //             "indicator":null,
        //             "currency":"USD",
        //             "currency_pair_code":"P-BTCUSD",
        //             "symbol":"$",
        //             "btc_minimum_withdraw":null,
        //             "fiat_minimum_withdraw":null,
        //             "pusher_channel":"product_cash_p-btcusd_604",
        //             "taker_fee":"0.0012",
        //             "maker_fee":"0.0",
        //             "low_market_bid":"11624.5",
        //             "high_market_ask":"11859.0",
        //             "volume_24h":"0.271",
        //             "last_price_24h":"11621.5",
        //             "last_traded_price":"11771.5",
        //             "last_traded_quantity":"0.09",
        //             "average_price":"11771.5",
        //             "quoted_currency":"USD",
        //             "base_currency":"P-BTC",
        //             "tick_size":"0.5",
        //             "disabled":false,
        //             "margin_enabled":false,
        //             "cfd_enabled":false,
        //             "perpetual_enabled":true,
        //             "last_event_timestamp":"1596963309.418853092",
        //             "timestamp":"1596963309.418853092",
        //             "multiplier_up":null,
        //             "multiplier_down":"0.1",
        //             "average_time_interval":300,
        //             "index_price":"11682.8124",
        //             "mark_price":"11719.96781",
        //             "funding_rate":"0.00273",
        //             "fair_price":"11720.2745"
        //         },
        //     ]
        //
        const currencies = await this.fetchCurrencies ();
        const currenciesByCode = this.indexBy (currencies, 'code');
        const result = [];
        const markets = this.arrayConcat (spot, perpetual);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quoted_currency');
            const productType = this.safeString (market, 'product_type');
            const swap = (productType === 'Perpetual');
            const type = swap ? 'swap' : 'spot';
            const spot = !swap;
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const disabled = this.safeValue (market, 'disabled', false);
            const baseCurrency = this.safeValue (currenciesByCode, base);
            let minAmount = undefined;
            if (baseCurrency !== undefined) {
                minAmount = this.safeNumber (baseCurrency['info'], 'minimum_order_quantity');
            }
            const lastPrice = this.safeNumber (market, 'last_traded_price');
            let minPrice = undefined;
            let maxPrice = undefined;
            if (lastPrice) {
                const multiplierDown = this.safeNumber (market, 'multiplier_down');
                const multiplierUp = this.safeNumber (market, 'multiplier_up');
                if (multiplierDown !== undefined) {
                    minPrice = lastPrice * multiplierDown;
                }
                if (multiplierUp !== undefined) {
                    maxPrice = lastPrice * multiplierUp;
                }
            }
            const margin = this.safeValue (market, 'margin_enabled');
            const symbol = base + '/' + quote;
            const maker = this.fees['trading']['maker'];
            const taker = this.fees['trading']['taker'];
            const parsedMarket = {
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': spot,
                'margin': spot && margin,
                'swap': swap,
                'future': false,
                'option': false,
                'active': !disabled,
                'contract': swap,
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
                    'amount': this.parseNumber ('0.00000001'),
                    'price': this.safeNumber (market, 'tick_size'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': minAmount,
                        'max': undefined,
                    },
                    'price': {
                        'min': minPrice,
                        'max': maxPrice,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            };
            if (swap) {
                const settlementCurrencies = this.options['fetchMarkets']['settlementCurrencies'];
                for (let i = 0; i < settlementCurrencies.length; i++) {
                    const settle = settlementCurrencies[i];
                    parsedMarket['settle'] = settle;
                    parsedMarket['symbol'] = symbol + ':' + settle;
                    parsedMarket['linear'] = quote === settle;
                    parsedMarket['inverse'] = base === settle;
                    parsedMarket['taker'] = this.safeNumber (market, 'taker_fee', taker);
                    parsedMarket['maker'] = this.safeNumber (market, 'maker_fee', maker);
                    parsedMarket['contractSize'] = this.parseNumber ('1');
                    result.push (parsedMarket);
                }
            } else {
                result.push (parsedMarket);
            }
        }
        return result;
    }

    parseBalance (response) {
        const result = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const crypto = this.safeValue (response, 'crypto_accounts', []);
        const fiat = this.safeValue (response, 'fiat_accounts', []);
        for (let i = 0; i < crypto.length; i++) {
            const balance = crypto[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'reserved_balance');
            result[code] = account;
        }
        for (let i = 0; i < fiat.length; i++) {
            const balance = fiat[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balance, 'balance');
            account['used'] = this.safeString (balance, 'reserved_balance');
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        //
        //     {
        //         crypto_accounts: [
        //             {
        //                 id: 2221179,
        //                 currency: 'USDT',
        //                 balance: '0.0',
        //                 reserved_balance: '0.0',
        //                 pusher_channel: 'user_xxxxx_account_usdt',
        //                 lowest_offer_interest_rate: null,
        //                 highest_offer_interest_rate: null,
        //                 address: '0',
        //                 currency_symbol: 'USDT',
        //                 minimum_withdraw: null,
        //                 currency_type: 'crypto'
        //             },
        //         ],
        //         fiat_accounts: [
        //             {
        //                 id: 1112734,
        //                 currency: 'USD',
        //                 balance: '0.0',
        //                 reserved_balance: '0.0',
        //                 pusher_channel: 'user_xxxxx_account_usd',
        //                 lowest_offer_interest_rate: null,
        //                 highest_offer_interest_rate: null,
        //                 currency_symbol: '$',
        //                 send_to_btc_address: null,
        //                 exchange_rate: '1.0',
        //                 currency_type: 'fiat'
        //             }
        //         ]
        //     }
        //
        return this.parseBalance (response);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': this.marketId (symbol),
        };
        const response = await this.publicGetProductsIdPriceLevels (this.extend (request, params));
        return this.parseOrderBook (response, symbol, undefined, 'buy_price_levels', 'sell_price_levels');
    }

    parseTicker (ticker, market = undefined) {
        const timestamp = this.milliseconds ();
        let last = undefined;
        if ('last_traded_price' in ticker) {
            if (ticker['last_traded_price']) {
                const length = ticker['last_traded_price'].length;
                if (length > 0) {
                    last = this.safeString (ticker, 'last_traded_price');
                }
            }
        }
        const marketId = this.safeString (ticker, 'id');
        market = this.safeMarket (marketId, market);
        let symbol = market['symbol'];
        const baseId = this.safeString (ticker, 'base_currency');
        const quoteId = this.safeString (ticker, 'quoted_currency');
        if ((baseId !== undefined) && (quoteId !== undefined)) {
            symbol = this.safeCurrencyCode (baseId) + '/' + this.safeCurrencyCode (quoteId);
        }
        const open = this.safeString (ticker, 'last_price_24h');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high_market_ask'),
            'low': this.safeString (ticker, 'low_market_bid'),
            'bid': this.safeString (ticker, 'market_bid'),
            'bidVolume': undefined,
            'ask': this.safeString (ticker, 'market_ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'volume_24h'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetProducts (params);
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const ticker = this.parseTicker (response[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetProductsId (this.extend (request, params));
        return this.parseTicker (response, market);
    }

    parseTrade (trade, market = undefined) {
        // {             id:  12345,
        //         quantity: "6.789",
        //            price: "98765.4321",
        //       taker_side: "sell",
        //       created_at:  1512345678,
        //          my_side: "buy"           }
        const timestamp = this.safeTimestamp (trade, 'created_at');
        const orderId = this.safeString (trade, 'order_id');
        // 'taker_side' gets filled for both fetchTrades and fetchMyTrades
        const takerSide = this.safeString (trade, 'taker_side');
        // 'my_side' gets filled for fetchMyTrades only and may differ from 'taker_side'
        const mySide = this.safeString (trade, 'my_side');
        const side = (mySide !== undefined) ? mySide : takerSide;
        let takerOrMaker = undefined;
        if (mySide !== undefined) {
            takerOrMaker = (takerSide === mySide) ? 'taker' : 'maker';
        }
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'quantity');
        const id = this.safeString (trade, 'id');
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_id': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            // timestamp should be in seconds, whereas we use milliseconds in since and everywhere
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.publicGetExecutions (this.extend (request, params));
        const result = (since !== undefined) ? response : response['models'];
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradingFee (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': market['id'],
        };
        const response = await this.publicGetProductsId (this.extend (request, params));
        //
        //     {
        //         "id":"637",
        //         "product_type":"CurrencyPair",
        //         "code":"CASH",
        //         "name":null,
        //         "market_ask":"0.00000797",
        //         "market_bid":"0.00000727",
        //         "indicator":null,
        //         "currency":"BTC",
        //         "currency_pair_code":"TFTBTC",
        //         "symbol":null,
        //         "btc_minimum_withdraw":null,
        //         "fiat_minimum_withdraw":null,
        //         "pusher_channel":"product_cash_tftbtc_637",
        //         "taker_fee":"0.0",
        //         "maker_fee":"0.0",
        //         "low_market_bid":"0.00000685",
        //         "high_market_ask":"0.00000885",
        //         "volume_24h":"3696.0755956",
        //         "last_price_24h":"0.00000716",
        //         "last_traded_price":"0.00000766",
        //         "last_traded_quantity":"1748.0377978",
        //         "average_price":null,
        //         "quoted_currency":"BTC",
        //         "base_currency":"TFT",
        //         "tick_size":"0.00000001",
        //         "disabled":false,
        //         "margin_enabled":false,
        //         "cfd_enabled":false,
        //         "perpetual_enabled":false,
        //         "last_event_timestamp":"1596962820.000797146",
        //         "timestamp":"1596962820.000797146",
        //         "multiplier_up":"9.0",
        //         "multiplier_down":"0.1",
        //         "average_time_interval":null
        //     }
        //
        return this.parseTradingFee (response, market);
    }

    parseTradingFee (fee, market = undefined) {
        const marketId = this.safeString (fee, 'id');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'info': fee,
            'symbol': symbol,
            'maker': this.safeNumber (fee, 'maker_fee'),
            'taker': this.safeNumber (fee, 'taker_fee'),
            'percentage': true,
            'tierBased': true,
        };
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const spot = await this.publicGetProducts (params);
        //
        //     [
        //         {
        //             "id":"637",
        //             "product_type":"CurrencyPair",
        //             "code":"CASH",
        //             "name":null,
        //             "market_ask":"0.00000797",
        //             "market_bid":"0.00000727",
        //             "indicator":null,
        //             "currency":"BTC",
        //             "currency_pair_code":"TFTBTC",
        //             "symbol":null,
        //             "btc_minimum_withdraw":null,
        //             "fiat_minimum_withdraw":null,
        //             "pusher_channel":"product_cash_tftbtc_637",
        //             "taker_fee":"0.0",
        //             "maker_fee":"0.0",
        //             "low_market_bid":"0.00000685",
        //             "high_market_ask":"0.00000885",
        //             "volume_24h":"3696.0755956",
        //             "last_price_24h":"0.00000716",
        //             "last_traded_price":"0.00000766",
        //             "last_traded_quantity":"1748.0377978",
        //             "average_price":null,
        //             "quoted_currency":"BTC",
        //             "base_currency":"TFT",
        //             "tick_size":"0.00000001",
        //             "disabled":false,
        //             "margin_enabled":false,
        //             "cfd_enabled":false,
        //             "perpetual_enabled":false,
        //             "last_event_timestamp":"1596962820.000797146",
        //             "timestamp":"1596962820.000797146",
        //             "multiplier_up":"9.0",
        //             "multiplier_down":"0.1",
        //             "average_time_interval":null
        //         },
        //     ]
        //
        const perpetual = await this.publicGetProducts ({ 'perpetual': '1' });
        //
        //     [
        //         {
        //             "id":"604",
        //             "product_type":"Perpetual",
        //             "code":"CASH",
        //             "name":null,
        //             "market_ask":"11721.5",
        //             "market_bid":"11719.0",
        //             "indicator":null,
        //             "currency":"USD",
        //             "currency_pair_code":"P-BTCUSD",
        //             "symbol":"$",
        //             "btc_minimum_withdraw":null,
        //             "fiat_minimum_withdraw":null,
        //             "pusher_channel":"product_cash_p-btcusd_604",
        //             "taker_fee":"0.0012",
        //             "maker_fee":"0.0",
        //             "low_market_bid":"11624.5",
        //             "high_market_ask":"11859.0",
        //             "volume_24h":"0.271",
        //             "last_price_24h":"11621.5",
        //             "last_traded_price":"11771.5",
        //             "last_traded_quantity":"0.09",
        //             "average_price":"11771.5",
        //             "quoted_currency":"USD",
        //             "base_currency":"P-BTC",
        //             "tick_size":"0.5",
        //             "disabled":false,
        //             "margin_enabled":false,
        //             "cfd_enabled":false,
        //             "perpetual_enabled":true,
        //             "last_event_timestamp":"1596963309.418853092",
        //             "timestamp":"1596963309.418853092",
        //             "multiplier_up":null,
        //             "multiplier_down":"0.1",
        //             "average_time_interval":300,
        //             "index_price":"11682.8124",
        //             "mark_price":"11719.96781",
        //             "funding_rate":"0.00273",
        //             "fair_price":"11720.2745"
        //         },
        //     ]
        //
        const markets = this.arrayConcat (spot, perpetual);
        const result = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'id');
            const symbol = this.safeSymbol (marketId, market);
            result[symbol] = this.parseTradingFee (market);
        }
        return result;
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        // the `with_details` param is undocumented - it adds the order_id to the results
        const request = {
            'product_id': market['id'],
            'with_details': true,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetExecutionsMe (this.extend (request, params));
        return this.parseTrades (response['models'], market, since, limit);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        params = this.omit (params, [ 'clientOrderId', 'client_order_id' ]);
        const request = {
            'order_type': type,
            'product_id': this.marketId (symbol),
            'side': side,
            'quantity': this.amountToPrecision (symbol, amount),
        };
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        if ((type === 'limit') || (type === 'limit_post_only') || (type === 'market_with_range') || (type === 'stop')) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "id": 2157474,
        //         "order_type": "limit",
        //         "quantity": "0.01",
        //         "disc_quantity": "0.0",
        //         "iceberg_total_quantity": "0.0",
        //         "side": "sell",
        //         "filled_quantity": "0.0",
        //         "price": "500.0",
        //         "created_at": 1462123639,
        //         "updated_at": 1462123639,
        //         "status": "live",
        //         "leverage_level": 1,
        //         "source_exchange": "QUOINE",
        //         "product_id": 1,
        //         "product_code": "CASH",
        //         "funding_currency": "USD",
        //         "currency_pair_code": "BTCUSD",
        //         "order_fee": "0.0",
        //         "client_order_id": null,
        //     }
        //
        return this.parseOrder (response);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privatePutOrdersIdCancel (this.extend (request, params));
        const order = this.parseOrder (response);
        if (order['status'] === 'closed') {
            if (this.options['cancelOrderException']) {
                throw new OrderNotFound (this.id + ' order closed already: ' + this.json (response));
            }
        }
        return order;
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (price === undefined) {
            throw new ArgumentsRequired (this.id + ' editOrder() requires the price argument');
        }
        const request = {
            'order': {
                'quantity': this.amountToPrecision (symbol, amount),
                'price': this.priceToPrecision (symbol, price),
            },
            'id': id,
        };
        const response = await this.privatePutOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    parseOrderStatus (status) {
        const statuses = {
            'live': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "id": 2157474,
        //         "order_type": "limit",
        //         "quantity": "0.01",
        //         "disc_quantity": "0.0",
        //         "iceberg_total_quantity": "0.0",
        //         "side": "sell",
        //         "filled_quantity": "0.0",
        //         "price": "500.0",
        //         "created_at": 1462123639,
        //         "updated_at": 1462123639,
        //         "status": "live",
        //         "leverage_level": 1,
        //         "source_exchange": "QUOINE",
        //         "product_id": 1,
        //         "product_code": "CASH",
        //         "funding_currency": "USD",
        //         "currency_pair_code": "BTCUSD",
        //         "order_fee": "0.0"
        //         "client_order_id": null,
        //     }
        //
        // fetchOrder, fetchOrders, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "id": 2157479,
        //         "order_type": "limit",
        //         "quantity": "0.01",
        //         "disc_quantity": "0.0",
        //         "iceberg_total_quantity": "0.0",
        //         "side": "sell",
        //         "filled_quantity": "0.01",
        //         "price": "500.0",
        //         "created_at": 1462123639,
        //         "updated_at": 1462123639,
        //         "status": "filled",
        //         "leverage_level": 2,
        //         "source_exchange": "QUOINE",
        //         "product_id": 1,
        //         "product_code": "CASH",
        //         "funding_currency": "USD",
        //         "currency_pair_code": "BTCUSD",
        //         "order_fee": "0.0",
        //         "executions": [
        //             {
        //                 "id": 4566133,
        //                 "quantity": "0.01",
        //                 "price": "500.0",
        //                 "taker_side": "buy",
        //                 "my_side": "sell",
        //                 "created_at": 1465396785
        //             }
        //         ]
        //     }
        //
        const orderId = this.safeString (order, 'id');
        const timestamp = this.safeTimestamp (order, 'created_at');
        const marketId = this.safeString (order, 'product_id');
        market = this.safeValue (this.markets_by_id, marketId);
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amount = this.safeNumber (order, 'quantity');
        let filled = this.safeNumber (order, 'filled_quantity');
        const price = this.safeNumber (order, 'price');
        const type = this.safeString (order, 'order_type');
        let tradeCost = 0;
        let tradeFilled = 0;
        let average = this.safeNumber (order, 'average_price');
        const trades = this.parseTrades (this.safeValue (order, 'executions', []), market, undefined, undefined, {
            'order': orderId,
            'type': type,
        });
        const numTrades = trades.length;
        for (let i = 0; i < numTrades; i++) {
            // php copies values upon assignment, but not references them
            // todo rewrite this (shortly)
            const trade = trades[i];
            trade['order'] = orderId;
            trade['type'] = type;
            tradeFilled = this.sum (tradeFilled, trade['amount']);
            tradeCost = this.sum (tradeCost, trade['cost']);
        }
        let cost = undefined;
        let lastTradeTimestamp = undefined;
        if (numTrades > 0) {
            lastTradeTimestamp = trades[numTrades - 1]['timestamp'];
            if (!average && (tradeFilled > 0)) {
                average = tradeCost / tradeFilled;
            }
            if (cost === undefined) {
                cost = tradeCost;
            }
            if (filled === undefined) {
                filled = tradeFilled;
            }
        }
        let remaining = undefined;
        if (amount !== undefined && filled !== undefined) {
            remaining = amount - filled;
        }
        const side = this.safeString (order, 'side');
        const clientOrderId = this.safeString (order, 'client_order_id');
        return {
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'status': status,
            'symbol': market['symbol'],
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'filled': filled,
            'cost': cost,
            'remaining': remaining,
            'average': average,
            'trades': trades,
            'fee': {
                'currency': market['quote'],
                'cost': this.safeNumber (order, 'order_fee'),
            },
            'info': order,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        const request = {
            // 'funding_currency': market['quoteId'], // filter orders based on "funding" currency (quote currency)
            // 'product_id': market['id'],
            // 'status': 'live', // 'filled', 'cancelled'
            // 'trading_type': 'spot', // 'margin', 'cfd'
            'with_details': 1, // return full order details including executions
        };
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_id'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "models": [
        //             {
        //                 "id": 2157474,
        //                 "order_type": "limit",
        //                 "quantity": "0.01",
        //                 "disc_quantity": "0.0",
        //                 "iceberg_total_quantity": "0.0",
        //                 "side": "sell",
        //                 "filled_quantity": "0.0",
        //                 "price": "500.0",
        //                 "created_at": 1462123639,
        //                 "updated_at": 1462123639,
        //                 "status": "live",
        //                 "leverage_level": 1,
        //                 "source_exchange": "QUOINE",
        //                 "product_id": 1,
        //                 "product_code": "CASH",
        //                 "funding_currency": "USD",
        //                 "currency_pair_code": "BTCUSD",
        //                 "order_fee": "0.0",
        //                 "executions": [], // optional
        //             }
        //         ],
        //         "current_page": 1,
        //         "total_pages": 1
        //     }
        //
        const orders = this.safeValue (response, 'models', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'status': 'live' };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = { 'status': 'filled' };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            // 'auth_code': '', // optional 2fa code
            'crypto_withdrawal': {
                'currency': currency['id'],
                'address': address,
                'amount': amount,
                // 'payment_id': tag, // for XRP only
                // 'memo_type': 'text', // 'text', 'id' or 'hash', for XLM only
                // 'memo_value': tag, // for XLM only
            },
        };
        if (tag !== undefined) {
            if (code === 'XRP') {
                request['crypto_withdrawal']['payment_id'] = tag;
            } else if (code === 'XLM') {
                request['crypto_withdrawal']['memo_type'] = 'text'; // overrideable via params
                request['crypto_withdrawal']['memo_value'] = tag;
            } else {
                throw new NotSupported (this.id + ' withdraw() only supports a tag along the address for XRP or XLM');
            }
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        if (network === undefined) {
            const paramsCwArray = this.safeValue (params, 'crypto_withdrawal', {});
            network = this.safeStringUpper (paramsCwArray, 'network');
        }
        network = this.safeString (networks, network, network); // handle ERC20>ETH alias
        if (network !== undefined) {
            request['crypto_withdrawal']['network'] = network;
            params = this.omit (params, 'network');
            params['crypto_withdrawal'] = this.omit (params['crypto_withdrawal'], 'network');
        }
        const response = await this.privatePostCryptoWithdrawals (this.deepExtend (request, params));
        //
        //     {
        //         "id": 1353,
        //         "address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
        //         "amount": 1.0,
        //         "state": "pending",
        //         "currency": "BTC",
        //         "withdrawal_fee": 0.0,
        //         "created_at": 1568016450,
        //         "updated_at": 1568016450,
        //         "payment_id": null
        //     }
        //
        return this.parseTransaction (response, currency);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // state: 'processed', // optional: pending, filed, cancelled, processing, processed, reverted to_be_reviewed, declined, broadcasted
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const response = await this.privateGetCryptoWithdrawals (this.extend (request, params));
        //
        //     {
        //         models: [
        //             {
        //                 id: '2',
        //                 address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        //                 amount: '0.01',
        //                 state: 'processed',
        //                 currency: 'BTC',
        //                 withdrawal_fee: '0.0005',
        //                 created_at: '1614718276',
        //                 updated_at: '1614720926',
        //                 payment_id: null,
        //                 transaction_hash: 'xxxxxxxx...',
        //                 broadcasted_at: '1614720762',
        //                 wallet_label: 'btc',
        //                 chain_name: 'Bitcoin',
        //                 network: null
        //             },
        //         ],
        //         current_page: '1',
        //         total_pages: '1'
        //     }
        //
        const transactions = this.safeValue (response, 'models', []);
        return this.parseTransactions (transactions, currency, since, limit);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'pending': 'pending',
            'cancelled': 'canceled',
            'approved': 'ok',
            'processing': 'pending',
            'processed': 'ok',
            'reverted': 'failed',
            'to_be_reviewed': 'pending',
            'declined': 'failed',
            'broadcasted': 'ok',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // withdraw
        //
        //     {
        //         id: '1',
        //         address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        //         amount: '0.01',
        //         state: 'pending',
        //         currency: 'BTC',
        //         withdrawal_fee: '0.0007',
        //         created_at: '1626000533',
        //         updated_at: '1626000533',
        //         payment_id: null,
        //         transaction_hash: null,
        //         broadcasted_at: null,
        //         wallet_label: null,
        //         chain_name: 'Bitcoin',
        //         network: null
        //     },
        //
        // fetchWithdrawals
        //
        //     {
        //         id: '2',
        //         address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        //         amount: '0.01',
        //         state: 'processed',
        //         currency: 'BTC',
        //         withdrawal_fee: '0.0005',
        //         created_at: '1614718276',
        //         updated_at: '1614720926',
        //         payment_id: '',
        //         transaction_hash: 'xxxxxxxx...',
        //         broadcasted_at: '1614720762',
        //         wallet_label: 'btc',
        //         chain_name: 'Bitcoin',
        //         network: null
        //     },
        //
        // fetchDeposits
        //
        //     ...
        //
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString2 (transaction, 'payment_id', 'memo_value');
        const txid = this.safeString (transaction, 'transaction_hash');
        const currencyId = this.safeString2 (transaction, 'currency', 'asset');
        const code = this.safeCurrencyCode (currencyId, currency);
        const timestamp = this.safeTimestamp (transaction, 'created_at');
        const updated = this.safeTimestamp (transaction, 'updated_at');
        const type = 'withdrawal';
        const status = this.parseTransactionStatus (this.safeString (transaction, 'state'));
        const amountString = this.safeString (transaction, 'amount');
        const feeCostString = this.safeString (transaction, 'withdrawal_fee');
        const amount = this.parseNumber (Precise.stringSub (amountString, feeCostString));
        const network = this.safeString (transaction, 'chain_name');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': updated,
            'fee': {
                'currency': code,
                'cost': this.parseNumber (feeCostString),
            },
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'X-Quoine-API-Version': this.version,
            'Content-Type': 'application/json',
        };
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (Object.keys (query).length) {
                body = this.json (query);
            }
            const nonce = this.nonce ();
            const request = {
                'path': url,
                'token_id': this.apiKey,
                'iat': Math.floor (nonce / 1000), // issued at
            };
            if (!('client_order_id' in query)) {
                request['nonce'] = nonce;
            }
            headers['X-Quoine-Auth'] = this.jwt (request, this.encode (this.secret));
        } else {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (code >= 200 && code < 300) {
            return;
        }
        if (code === 401) {
            // expected non-json response
            this.throwExactlyMatchedException (this.exceptions, body, body);
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        if (response === undefined) {
            return;
        }
        const feedback = this.id + ' ' + body;
        const message = this.safeString (response, 'message');
        const errors = this.safeValue (response, 'errors');
        if (message !== undefined) {
            //
            //  { "message": "Order not found" }
            //
            this.throwExactlyMatchedException (this.exceptions, message, feedback);
        } else if (errors !== undefined) {
            //
            //  { "errors": { "user": ["not_enough_free_balance"] }}
            //  { "errors": { "quantity": ["less_than_order_size"] }}
            //  { "errors": { "order": ["Can not update partially filled order"] }}
            //
            const types = Object.keys (errors);
            for (let i = 0; i < types.length; i++) {
                const type = types[i];
                const errorMessages = errors[type];
                for (let j = 0; j < errorMessages.length; j++) {
                    const message = errorMessages[j];
                    this.throwExactlyMatchedException (this.exceptions, message, feedback);
                }
            }
        } else {
            throw new ExchangeError (feedback);
        }
    }
};
