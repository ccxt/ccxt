'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ExchangeError, InvalidOrder, BadRequest, InsufficientFunds, OrderNotFound, AuthenticationError, RateLimitExceeded, ExchangeNotAvailable, CancelPending, ArgumentsRequired, PermissionDenied, BadSymbol, DuplicateOrderId } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class ftx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ftx',
            'name': 'FTX',
            'countries': [ 'HK' ],
            'rateLimit': 50,
            'certified': true,
            'pro': true,
            'hostname': 'ftx.com', // or ftx.us
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg',
                'www': 'https://ftx.com',
                'api': {
                    'public': 'https://{hostname}',
                    'private': 'https://{hostname}',
                },
                'doc': 'https://github.com/ftexchange/ftx',
                'fees': 'https://ftexchange.zendesk.com/hc/en-us/articles/360024479432-Fees',
                'referral': {
                    'url': 'https://ftx.com/#a=ccxt',
                    'discount': 0.05,
                },
            },
            'has': {
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchFundingFees': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchWithdrawals': true,
                'setLeverage': true,
                'withdraw': true,
            },
            'timeframes': {
                '15s': '15',
                '1m': '60',
                '5m': '300',
                '15m': '900',
                '1h': '3600',
                '4h': '14400',
                '1d': '86400',
            },
            'api': {
                'public': {
                    'get': [
                        'coins',
                        // markets
                        'markets',
                        'markets/{market_name}',
                        'markets/{market_name}/orderbook', // ?depth={depth}
                        'markets/{market_name}/trades', // ?limit={limit}&start_time={start_time}&end_time={end_time}
                        'markets/{market_name}/candles', // ?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}
                        // futures
                        'futures',
                        'futures/{future_name}',
                        'futures/{future_name}/stats',
                        'funding_rates',
                        'indexes/{index_name}/weights',
                        'expired_futures',
                        'indexes/{market_name}/candles', // ?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}
                        // wallet
                        'wallet/coins',
                        // leverage tokens
                        'lt/tokens',
                        'lt/{token_name}',
                        // etfs
                        'etfs/rebalance_info',
                        // options
                        'options/requests',
                        'options/trades',
                        'options/historical_volumes/BTC',
                        'stats/24h_options_volume',
                        'options/open_interest/BTC',
                        'options/historical_open_interest/BTC',
                        // spot margin
                        'spot_margin/history',
                        'spot_margin/borrow_summary',
                        // nfts
                        'nft/nfts',
                        'nft/{nft_id}',
                        'nft/{nft_id}/trades',
                        'nft/all_trades',
                        'nft/{nft_id}/account_info',
                        'nft/collections',
                        // ftx pay
                        'ftxpay/apps/{user_specific_id}/details',
                        'stats/latency_stats',
                    ],
                    'post': [
                        'ftxpay/apps/{user_specific_id}/orders',
                    ],
                },
                'private': {
                    'get': [
                        // subaccounts
                        'subaccounts',
                        'subaccounts/{nickname}/balances',
                        // account
                        'account',
                        'positions',
                        // wallet
                        'wallet/balances',
                        'wallet/all_balances',
                        'wallet/deposit_address/{coin}', // ?method={method}
                        'wallet/deposits',
                        'wallet/withdrawals',
                        'wallet/airdrops',
                        'wallet/withdrawal_fee',
                        'wallet/saved_addresses',
                        // orders
                        'orders', // ?market={market}
                        'orders/history', // ?market={market}
                        'orders/{order_id}',
                        'orders/by_client_id/{client_order_id}',
                        // conditional orders
                        'conditional_orders', // ?market={market}
                        'conditional_orders/{conditional_order_id}/triggers',
                        'conditional_orders/history', // ?market={market}
                        'fills', // ?market={market}
                        'funding_payments',
                        // leverage tokens
                        'lt/balances',
                        'lt/creations',
                        'lt/redemptions',
                        // options
                        'options/my_requests',
                        'options/requests/{request_id}/quotes',
                        'options/my_quotes',
                        'options/account_info',
                        'options/positions',
                        'options/fills',
                        // staking
                        'staking/stakes',
                        'staking/unstake_requests',
                        'staking/balances',
                        'staking/staking_rewards',
                        // otc
                        'otc/quotes/{quoteId}',
                        // spot margin
                        'spot_margin/borrow_rates',
                        'spot_margin/lending_rates',
                        'spot_margin/market_info', // ?market={market}
                        'spot_margin/borrow_history',
                        'spot_margin/lending_history',
                        'spot_margin/offers',
                        'spot_margin/lending_info',
                        // nfts
                        'nft/balances',
                        'nft/bids',
                        'nft/deposits',
                        'nft/withdrawals',
                        'nft/fills',
                        'nft/gallery/{gallery_id}',
                        'nft/gallery_settings',
                    ],
                    'post': [
                        // subaccounts
                        'subaccounts',
                        'subaccounts/update_name',
                        'subaccounts/transfer',
                        // account
                        'account/leverage',
                        // wallet
                        'wallet/withdrawals',
                        'wallet/saved_addresses',
                        // orders
                        'orders',
                        'conditional_orders',
                        'orders/{order_id}/modify',
                        'orders/by_client_id/{client_order_id}/modify',
                        'conditional_orders/{order_id}/modify',
                        // leverage tokens
                        'lt/{token_name}/create',
                        'lt/{token_name}/redeem',
                        // options
                        'options/requests',
                        'options/requests/{request_id}/quotes',
                        'options/quotes/{quote_id}/accept',
                        // staking
                        'staking/unstake_requests',
                        'srm_stakes/stakes',
                        // otc
                        'otc/quotes/{quote_id}/accept',
                        'otc/quotes',
                        // spot margin
                        'spot_margin/offers',
                        // nfts
                        'nft/offer',
                        'nft/buy',
                        'nft/auction',
                        'nft/edit_auction',
                        'nft/cancel_auction',
                        'nft/bids',
                        'nft/redeem',
                        'nft/gallery_settings',
                        // ftx pay
                        'ftxpay/apps/{user_specific_id}/orders',
                    ],
                    'delete': [
                        // subaccounts
                        'subaccounts',
                        // wallet
                        'wallet/saved_addresses/{saved_address_id}',
                        // orders
                        'orders/{order_id}',
                        'orders/by_client_id/{client_order_id}',
                        'orders',
                        'conditional_orders/{order_id}',
                        // options
                        'options/requests/{request_id}',
                        'options/quotes/{quote_id}',
                        // staking
                        'staking/unstake_requests/{request_id}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0002'),
                    'taker': this.parseNumber ('0.0007'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0007') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.0006') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.045') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0004') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('2000000'), this.parseNumber ('0.00015') ],
                            [ this.parseNumber ('5000000'), this.parseNumber ('0.0001') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.00005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0') ],
                        ],
                    },
                },
                'funding': {
                    'withdraw': {},
                },
            },
            'exceptions': {
                'exact': {
                    'Please slow down': RateLimitExceeded, // {"error":"Please slow down","success":false}
                    'Size too small for provide': InvalidOrder, // {"error":"Size too small for provide","success":false}
                    'Not logged in': AuthenticationError, // {"error":"Not logged in","success":false}
                    'Not enough balances': InsufficientFunds, // {"error":"Not enough balances","success":false}
                    'InvalidPrice': InvalidOrder, // {"error":"Invalid price","success":false}
                    'Size too small': InvalidOrder, // {"error":"Size too small","success":false}
                    'Size too large': InvalidOrder, // {"error":"Size too large","success":false}
                    'Missing parameter price': InvalidOrder, // {"error":"Missing parameter price","success":false}
                    'Order not found': OrderNotFound, // {"error":"Order not found","success":false}
                    'Order already closed': InvalidOrder, // {"error":"Order already closed","success":false}
                    'Trigger price too high': InvalidOrder, // {"error":"Trigger price too high","success":false}
                    'Trigger price too low': InvalidOrder, // {"error":"Trigger price too low","success":false}
                    'Order already queued for cancellation': CancelPending, // {"error":"Order already queued for cancellation","success":false}
                    'Duplicate client order ID': DuplicateOrderId, // {"error":"Duplicate client order ID","success":false}
                    'Spot orders cannot be reduce-only': InvalidOrder, // {"error":"Spot orders cannot be reduce-only","success":false}
                    'Invalid reduce-only order': InvalidOrder, // {"error":"Invalid reduce-only order","success":false}
                    'Account does not have enough balances': InsufficientFunds, // {"success":false,"error":"Account does not have enough balances"}
                },
                'broad': {
                    'Account does not have enough margin for order': InsufficientFunds,
                    'Invalid parameter': BadRequest, // {"error":"Invalid parameter start_time","success":false}
                    'The requested URL was not found on the server': BadRequest,
                    'No such coin': BadRequest,
                    'No such subaccount': BadRequest,
                    'No such future': BadSymbol,
                    'No such market': BadSymbol,
                    'Do not send more than': RateLimitExceeded,
                    'An unexpected error occurred': ExchangeNotAvailable, // {"error":"An unexpected error occurred, please try again later (58BC21C795).","success":false}
                    'Please retry request': ExchangeNotAvailable, // {"error":"Please retry request","success":false}
                    'Please try again': ExchangeNotAvailable, // {"error":"Please try again","success":false}
                    'Try again': ExchangeNotAvailable, // {"error":"Try again","success":false}
                    'Only have permissions for subaccount': PermissionDenied, // {"success":false,"error":"Only have permissions for subaccount *sub_name*"}
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                // support for canceling conditional orders
                // https://github.com/ccxt/ccxt/issues/6669
                'cancelOrder': {
                    'method': 'privateDeleteOrdersOrderId', // privateDeleteConditionalOrdersOrderId
                },
                'fetchOpenOrders': {
                    'method': 'privateGetOrders', // privateGetConditionalOrders
                },
                'fetchOrders': {
                    'method': 'privateGetOrdersHistory', // privateGetConditionalOrdersHistory
                },
                'sign': {
                    'ftx.com': 'FTX',
                    'ftx.us': 'FTXUS',
                },
            },
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetCoins (params);
        const currencies = this.safeValue (response, 'result', []);
        //
        //     {
        //         "success":true,
        //         "result": [
        //             {"id":"BTC","name":"Bitcoin"},
        //             {"id":"ETH","name":"Ethereum"},
        //             {"id":"ETHMOON","name":"10X Long Ethereum Token","underlying":"ETH"},
        //             {"id":"EOSBULL","name":"3X Long EOS Token","underlying":"EOS"},
        //         ],
        //     }
        //
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency,
                'type': undefined,
                'name': name,
                'active': undefined,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'withdraw': { 'min': undefined, 'max': undefined },
                    'amount': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.37,
        //                 "baseCurrency":null,
        //                 "bid":170.31,
        //                 "change1h":-0.019001554672655036,
        //                 "change24h":-0.024841165359738997,
        //                 "changeBod":-0.03816406029469881,
        //                 "enabled":true,
        //                 "last":170.37,
        //                 "name":"ETH-PERP",
        //                 "price":170.37,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":null,
        //                 "quoteVolume24h":7742164.59889,
        //                 "sizeIncrement":0.001,
        //                 "type":"future",
        //                 "underlying":"ETH",
        //                 "volumeUsd24h":7742164.59889
        //             },
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const result = [];
        const markets = this.safeValue (response, 'result', []);
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const id = this.safeString (market, 'name');
            const baseId = this.safeString2 (market, 'baseCurrency', 'underlying');
            const quoteId = this.safeString (market, 'quoteCurrency', 'USD');
            const type = this.safeString (market, 'type');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            // check if a market is a spot or future market
            const symbol = (type === 'future') ? this.safeString (market, 'name') : (base + '/' + quote);
            const active = this.safeValue (market, 'enabled');
            const sizeIncrement = this.safeNumber (market, 'sizeIncrement');
            const priceIncrement = this.safeNumber (market, 'priceIncrement');
            const precision = {
                'amount': sizeIncrement,
                'price': priceIncrement,
            };
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'future': (type === 'future'),
                'spot': (type === 'spot'),
                'active': active,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': sizeIncrement,
                        'max': undefined,
                    },
                    'price': {
                        'min': priceIncrement,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'info': market,
            });
        }
        return result;
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "ask":171.29,
        //         "baseCurrency":null, // base currency for spot markets
        //         "bid":171.24,
        //         "change1h":-0.0012244897959183673,
        //         "change24h":-0.031603346901854366,
        //         "changeBod":-0.03297013492914808,
        //         "enabled":true,
        //         "last":171.44,
        //         "name":"ETH-PERP",
        //         "price":171.29,
        //         "priceIncrement":0.01,
        //         "quoteCurrency":null, // quote currency for spot markets
        //         "quoteVolume24h":8570651.12113,
        //         "sizeIncrement":0.001,
        //         "type":"future",
        //         "underlying":"ETH", // null for spot markets
        //         "volumeUsd24h":8570651.12113,
        //     }
        //
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'name');
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
        } else {
            const type = this.safeString (ticker, 'type');
            if (type === 'future') {
                symbol = marketId;
            } else {
                const base = this.safeCurrencyCode (this.safeString (ticker, 'baseCurrency'));
                const quote = this.safeCurrencyCode (this.safeString (ticker, 'quoteCurrency'));
                if ((base !== undefined) && (quote !== undefined)) {
                    symbol = base + '/' + quote;
                }
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeNumber (ticker, 'last');
        const timestamp = this.safeTimestamp (ticker, 'time', this.milliseconds ());
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': this.safeNumber (ticker, 'bid'),
            'bidVolume': this.safeNumber (ticker, 'bidSize'),
            'ask': this.safeNumber (ticker, 'ask'),
            'askVolume': this.safeNumber (ticker, 'askSize'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeNumber (ticker, 'change24h'),
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': this.safeNumber (ticker, 'quoteVolume24h'),
            'info': ticker,
        };
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        const response = await this.publicGetMarketsMarketName (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "ask":171.29,
        //             "baseCurrency":null, // base currency for spot markets
        //             "bid":171.24,
        //             "change1h":-0.0012244897959183673,
        //             "change24h":-0.031603346901854366,
        //             "changeBod":-0.03297013492914808,
        //             "enabled":true,
        //             "last":171.44,
        //             "name":"ETH-PERP",
        //             "price":171.29,
        //             "priceIncrement":0.01,
        //             "quoteCurrency":null, // quote currency for spot markets
        //             "quoteVolume24h":8570651.12113,
        //             "sizeIncrement":0.001,
        //             "type":"future",
        //             "underlying":"ETH", // null for spot markets
        //             "volumeUsd24h":8570651.12113,
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetMarkets (params);
        //
        //     {
        //         'success': true,
        //         "result": [
        //             {
        //                 "ask":170.44,
        //                 "baseCurrency":"ETH",
        //                 "bid":170.41,
        //                 "change1h":-0.018485459257126403,
        //                 "change24h":-0.023825887743413515,
        //                 "changeBod":-0.037605872388481086,
        //                 "enabled":true,
        //                 "last":172.72,
        //                 "name":"ETH/USD",
        //                 "price":170.44,
        //                 "priceIncrement":0.01,
        //                 "quoteCurrency":"USD",
        //                 "quoteVolume24h":382802.0252,
        //                 "sizeIncrement":0.001,
        //                 "type":"spot",
        //                 "underlying":null,
        //                 "volumeUsd24h":382802.0252
        //             },
        //         ],
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        return this.parseTickers (tickers, symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_name': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit; // max 100, default 20
        }
        const response = await this.publicGetMarketsMarketNameOrderbook (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "asks":[
        //                 [171.95,279.865],
        //                 [171.98,102.42],
        //                 [171.99,124.11],
        //             ],
        //             "bids":[
        //                 [171.93,69.749],
        //                 [171.9,288.325],
        //                 [171.88,87.47],
        //             ],
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrderBook (result, symbol);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "close":177.23,
        //         "high":177.45,
        //         "low":177.2,
        //         "open":177.43,
        //         "startTime":"2019-10-17T13:27:00+00:00",
        //         "time":1571318820000.0,
        //         "volume":0.0
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    getMarketId (symbol, key, params = {}) {
        const parts = this.getMarketParams (symbol, key, params);
        return this.safeString (parts, 1, symbol);
    }

    getMarketParams (symbol, key, params = {}) {
        let market = undefined;
        let marketId = undefined;
        if (symbol in this.markets) {
            market = this.market (symbol);
            marketId = market['id'];
        } else {
            marketId = this.safeString (params, key, symbol);
        }
        return [ market, marketId ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market_name', params);
        const request = {
            'resolution': this.timeframes[timeframe],
            'market_name': marketId,
        };
        // max 1501 candles, including the current candle when since is not specified
        limit = (limit === undefined) ? 1501 : limit;
        if (since === undefined) {
            request['end_time'] = this.seconds ();
            request['limit'] = limit;
            request['start_time'] = request['end_time'] - limit * this.parseTimeframe (timeframe);
        } else {
            request['start_time'] = parseInt (since / 1000);
            request['limit'] = limit;
            request['end_time'] = this.sum (request['start_time'], limit * this.parseTimeframe (timeframe));
        }
        const response = await this.publicGetMarketsMarketNameCandles (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result":[
        //             {
        //                 "close":177.23,
        //                 "high":177.45,
        //                 "low":177.2,
        //                 "open":177.43,
        //                 "startTime":"2019-10-17T13:27:00+00:00",
        //                 "time":1571318820000.0,
        //                 "volume":0.0
        //             },
        //             {
        //                 "close":177.26,
        //                 "high":177.33,
        //                 "low":177.23,
        //                 "open":177.23,
        //                 "startTime":"2019-10-17T13:28:00+00:00",
        //                 "time":1571318880000.0,
        //                 "volume":0.0
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        //     {
        //         "id":1715826,
        //         "liquidation":false,
        //         "price":171.62,
        //         "side":"buy",
        //         "size":2.095,
        //         "time":"2019-10-18T12:59:54.288166+00:00"
        //     }
        //
        // fetchMyTrades (private)
        //
        //     {
        //         "fee": 20.1374935,
        //         "feeRate": 0.0005,
        //         "feeCurrency": "USD",
        //         "future": "EOS-0329",
        //         "id": 11215,
        //         "liquidity": "taker",
        //         "market": "EOS-0329",
        //         "baseCurrency": null,
        //         "quoteCurrency": null,
        //         "orderId": 8436981,
        //         "price": 4.201,
        //         "side": "buy",
        //         "size": 9587,
        //         "time": "2019-03-27T19:15:10.204619+00:00",
        //         "type": "order"
        //     }
        //
        //     {
        //         "baseCurrency": "BTC",
        //         "fee": 0,
        //         "feeCurrency": "USD",
        //         "feeRate": 0,
        //         "future": null,
        //         "id": 664079556,
        //         "liquidity": "taker",
        //         "market": null,
        //         "orderId": null,
        //         "price": 34830.61359,
        //         "quoteCurrency": "USD",
        //         "side": "sell",
        //         "size": 0.0005996,
        //         "time": "2021-01-15T16:05:29.246135+00:00",
        //         "tradeId": null,
        //         "type": "otc"
        //     }
        //
        //     with -ve fee
        //     {
        //         "id": 1171258927,
        //         "fee": -0.0000713875,
        //         "side": "sell",
        //         "size": 1,
        //         "time": "2021-03-11T13:34:35.523627+00:00",
        //         "type": "order",
        //         "price": 14.2775,
        //         "future": null,
        //         "market": "SOL/USD",
        //         "feeRate": -0.000005,
        //         "orderId": 33182929044,
        //         "tradeId": 582936801,
        //         "liquidity": "maker",
        //         "feeCurrency": "USD",
        //         "baseCurrency": "SOL",
        //         "quoteCurrency": "USD"
        //     }
        //
        //     // from OTC order
        //     {
        //         "id": 1172129651,
        //         "fee": 0,
        //         "side": "sell",
        //         "size": 1.47568846,
        //         "time": "2021-03-11T15:04:46.893383+00:00",
        //         "type": "otc",
        //         "price": 14.60932598,
        //         "future": null,
        //         "market": null,
        //         "feeRate": 0,
        //         "orderId": null,
        //         "tradeId": null,
        //         "liquidity": "taker",
        //         "feeCurrency": "USD",
        //         "baseCurrency": "BCHA",
        //         "quoteCurrency": "USD"
        //     }
        const id = this.safeString (trade, 'id');
        const takerOrMaker = this.safeString (trade, 'liquidity');
        const marketId = this.safeString (trade, 'market');
        let symbol = undefined;
        if (marketId in this.markets_by_id) {
            market = this.markets_by_id[marketId];
            symbol = market['symbol'];
        } else {
            const base = this.safeCurrencyCode (this.safeString (trade, 'baseCurrency'));
            const quote = this.safeCurrencyCode (this.safeString (trade, 'quoteCurrency'));
            if ((base !== undefined) && (quote !== undefined)) {
                symbol = base + '/' + quote;
            } else {
                symbol = marketId;
            }
        }
        const timestamp = this.parse8601 (this.safeString (trade, 'time'));
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const price = this.parseNumber (priceString);
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (Precise.stringMul (priceString, amountString));
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (trade, 'side');
        let fee = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'feeCurrency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
                'rate': this.safeNumber (trade, 'feeRate'),
            };
        }
        const orderId = this.safeString (trade, 'orderId');
        return {
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': orderId,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market_name', params);
        const request = {
            'market_name': marketId,
        };
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            // start_time doesn't work without end_time
            request['end_time'] = this.seconds ();
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetMarketsMarketNameTrades (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {
        //                 "id":1715826,
        //                 "liquidation":false,
        //                 "price":171.62,
        //                 "side":"buy",
        //                 "size":2.095,
        //                 "time":"2019-10-18T12:59:54.288166+00:00"
        //             },
        //             {
        //                 "id":1715763,
        //                 "liquidation":false,
        //                 "price":171.89,
        //                 "side":"sell",
        //                 "size":1.477,
        //                 "time":"2019-10-18T12:58:38.443734+00:00"
        //             },
        //         ],
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchTradingFees (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "backstopProvider": true,
        //             "collateral": 3568181.02691129,
        //             "freeCollateral": 1786071.456884368,
        //             "initialMarginRequirement": 0.12222384240257728,
        //             "liquidating": false,
        //             "maintenanceMarginRequirement": 0.07177992558058484,
        //             "makerFee": 0.0002,
        //             "marginFraction": 0.5588433331419503,
        //             "openMarginFraction": 0.2447194090423075,
        //             "takerFee": 0.0005,
        //             "totalAccountValue": 3568180.98341129,
        //             "totalPositionSize": 6384939.6992,
        //             "username": "user@domain.com",
        //             "positions": [
        //                 {
        //                     "cost": -31.7906,
        //                     "entryPrice": 138.22,
        //                     "future": "ETH-PERP",
        //                     "initialMarginRequirement": 0.1,
        //                     "longOrderSize": 1744.55,
        //                     "maintenanceMarginRequirement": 0.04,
        //                     "netSize": -0.23,
        //                     "openSize": 1744.32,
        //                     "realizedPnl": 3.39441714,
        //                     "shortOrderSize": 1732.09,
        //                     "side": "sell",
        //                     "size": 0.23,
        //                     "unrealizedPnl": 0,
        //                 },
        //             ],
        //         },
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return {
            'info': response,
            'maker': this.safeNumber (result, 'makerFee'),
            'taker': this.safeNumber (result, 'takerFee'),
        };
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "coin": "USDTBEAR",
        //                 "free": 2320.2,
        //                 "total": 2340.2
        //             },
        //         ],
        //     }
        //
        const result = {
            'info': response,
        };
        const balances = this.safeValue (response, 'result', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 'coin'));
            const account = this.account ();
            account['free'] = this.safeString2 (balance, 'availableWithoutBorrow', 'free');
            account['total'] = this.safeString (balance, 'total');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrderStatus (status) {
        const statuses = {
            'new': 'open',
            'open': 'open',
            'closed': 'closed', // filled or canceled
            'triggered': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // limit orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder, editOrder
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "filledSize": 0,
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "price": 0.306525,
        //         "remainingSize": 31431,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "limit",
        //         "reduceOnly": false,
        //         "ioc": false,
        //         "postOnly": false,
        //         "clientId": null,
        //     }
        //
        // market orders - fetchOrder, fetchOrders, fetchOpenOrders, createOrder
        //
        //     {
        //         "avgFillPrice": 2666.0,
        //         "clientId": None,
        //         "createdAt": "2020-02-12T00: 53: 49.009726+00: 00",
        //         "filledSize": 0.0007,
        //         "future": None,
        //         "id": 3109208514,
        //         "ioc": True,
        //         "market": "BNBBULL/USD",
        //         "postOnly": False,
        //         "price": None,
        //         "reduceOnly": False,
        //         "remainingSize": 0.0,
        //         "side": "buy",
        //         "size": 0.0007,
        //         "status": "closed",
        //         "type": "market"
        //     }
        //
        // createOrder (conditional, "stop", "trailingStop", or "takeProfit")
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "triggerPrice": 0.306525,
        //         "orderId": null,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "stop",
        //         "orderPrice": null,
        //         "error": null,
        //         "triggeredAt": null,
        //         "reduceOnly": false
        //     }
        //
        // editOrder (conditional, stop, trailing stop, take profit)
        //
        //     {
        //         "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //         "future": "XRP-PERP",
        //         "id": 9596912,
        //         "market": "XRP-PERP",
        //         "triggerPrice": 0.306225,
        //         "orderId": null,
        //         "side": "sell",
        //         "size": 31431,
        //         "status": "open",
        //         "type": "stop",
        //         "orderPrice": null,
        //         "error": null,
        //         "triggeredAt": null,
        //         "reduceOnly": false,
        //         "orderType": "market",
        //         "filledSize": 0,
        //         "avgFillPrice": null,
        //         "retryUntilFilled": false
        //     }
        //
        // canceled order with a closed status
        //
        //     {
        //         "avgFillPrice":null,
        //         "clientId":null,
        //         "createdAt":"2020-09-01T13:45:57.119695+00:00",
        //         "filledSize":0.0,
        //         "future":null,
        //         "id":8553541288,
        //         "ioc":false,
        //         "liquidation":false,
        //         "market":"XRP/USDT",
        //         "postOnly":false,
        //         "price":0.5,
        //         "reduceOnly":false,
        //         "remainingSize":0.0,
        //         "side":"sell",
        //         "size":46.0,
        //         "status":"closed",
        //         "type":"limit"
        //     }
        //
        const id = this.safeString (order, 'id');
        const timestamp = this.parse8601 (this.safeString (order, 'createdAt'));
        let status = this.parseOrderStatus (this.safeString (order, 'status'));
        const amount = this.safeNumber (order, 'size');
        const filled = this.safeNumber (order, 'filledSize');
        let remaining = this.safeNumber (order, 'remainingSize');
        if ((remaining === 0.0) && (amount !== undefined) && (filled !== undefined)) {
            remaining = Math.max (amount - filled, 0);
            if (remaining > 0) {
                status = 'canceled';
            }
        }
        let symbol = undefined;
        const marketId = this.safeString (order, 'market');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                // support for delisted market ids
                // https://github.com/ccxt/ccxt/issues/7113
                symbol = marketId;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const side = this.safeString (order, 'side');
        const type = this.safeString (order, 'type');
        const average = this.safeNumber (order, 'avgFillPrice');
        const price = this.safeNumber2 (order, 'price', 'triggerPrice', average);
        let cost = undefined;
        if (filled !== undefined && price !== undefined) {
            cost = filled * price;
        }
        const lastTradeTimestamp = this.parse8601 (this.safeString (order, 'triggeredAt'));
        const clientOrderId = this.safeString (order, 'clientId');
        const stopPrice = this.safeNumber (order, 'triggerPrice');
        const postOnly = this.safeValue (order, 'postOnly');
        return {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': undefined,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': stopPrice,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market': market['id'],
            'side': side, // "buy" or "sell"
            // 'price': 0.306525, // send null for market orders
            'type': type, // "limit", "market", "stop", "trailingStop", or "takeProfit"
            'size': parseFloat (this.amountToPrecision (symbol, amount)),
            // 'reduceOnly': false, // optional, default is false
            // 'ioc': false, // optional, default is false, limit or market orders only
            // 'postOnly': false, // optional, default is false, limit or market orders only
            // 'clientId': 'abcdef0123456789', // string, optional, client order id, limit or market orders only
        };
        const clientOrderId = this.safeString2 (params, 'clientId', 'clientOrderId');
        if (clientOrderId !== undefined) {
            request['clientId'] = clientOrderId;
            params = this.omit (params, [ 'clientId', 'clientOrderId' ]);
        }
        let method = undefined;
        if (type === 'limit') {
            method = 'privatePostOrders';
            request['price'] = parseFloat (this.priceToPrecision (symbol, price));
        } else if (type === 'market') {
            method = 'privatePostOrders';
            request['price'] = null;
        } else if ((type === 'stop') || (type === 'takeProfit')) {
            method = 'privatePostConditionalOrders';
            const stopPrice = this.safeNumber2 (params, 'stopPrice', 'triggerPrice');
            if (stopPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder () requires a stopPrice parameter or a triggerPrice parameter for ' + type + ' orders');
            } else {
                params = this.omit (params, [ 'stopPrice', 'triggerPrice' ]);
                request['triggerPrice'] = parseFloat (this.priceToPrecision (symbol, stopPrice));
            }
            if (price !== undefined) {
                request['orderPrice'] = parseFloat (this.priceToPrecision (symbol, price)); // optional, order type is limit if this is specified, otherwise market
            }
        } else if (type === 'trailingStop') {
            method = 'privatePostConditionalOrders';
            request['trailValue'] = parseFloat (this.priceToPrecision (symbol, price)); // negative for "sell", positive for "buy"
        } else {
            throw new InvalidOrder (this.id + ' createOrder () does not support order type ' + type + ', only limit, market, stop, trailingStop, or takeProfit orders are supported');
        }
        const response = await this[method] (this.extend (request, params));
        //
        // orders
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 0,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "remainingSize": 31431,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null,
        //             }
        //         ]
        //     }
        //
        // conditional orders
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "triggerPrice": 0.306525,
        //                 "orderId": null,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "stop",
        //                 "orderPrice": null,
        //                 "error": null,
        //                 "triggeredAt": null,
        //                 "reduceOnly": false
        //             }
        //         ]
        //     }
        //
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrder (result, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        const clientOrderId = this.safeString2 (params, 'client_order_id', 'clientOrderId');
        const triggerPrice = this.safeNumber (params, 'triggerPrice');
        const orderPrice = this.safeNumber (params, 'orderPrice');
        const trailValue = this.safeNumber (params, 'trailValue');
        params = this.omit (params, [ 'client_order_id', 'clientOrderId', 'triggerPrice', 'orderPrice', 'trailValue' ]);
        const triggerPriceIsDefined = (triggerPrice !== undefined);
        const orderPriceIsDefined = (orderPrice !== undefined);
        const trailValueIsDefined = (trailValue !== undefined);
        if (triggerPriceIsDefined || orderPriceIsDefined || trailValueIsDefined) {
            method = 'privatePostConditionalOrdersOrderIdModify';
            request['order_id'] = id;
            if (triggerPriceIsDefined) {
                request['triggerPrice'] = parseFloat (this.priceToPrecision (symbol, triggerPrice));
            }
            if (orderPriceIsDefined) {
                // only for stop limit or take profit limit orders
                request['orderPrice'] = parseFloat (this.priceToPrecision (symbol, orderPrice));
            }
            if (trailValueIsDefined) {
                // negative for sell orders, positive for buy orders
                request['trailValue'] = parseFloat (this.priceToPrecision (symbol, trailValue));
            }
        } else {
            if (clientOrderId === undefined) {
                method = 'privatePostOrdersOrderIdModify';
                request['order_id'] = id;
            } else {
                method = 'privatePostOrdersByClientIdClientOrderIdModify';
                request['client_order_id'] = clientOrderId;
                // request['clientId'] = clientOrderId;
            }
            if (price !== undefined) {
                request['price'] = parseFloat (this.priceToPrecision (symbol, price));
            }
        }
        if (amount !== undefined) {
            request['size'] = parseFloat (this.amountToPrecision (symbol, amount));
        }
        const response = await this[method] (this.extend (request, params));
        //
        // regular order
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T11:56:55.728933+00:00",
        //             "filledSize": 0,
        //             "future": "XRP-PERP",
        //             "id": 9596932,
        //             "market": "XRP-PERP",
        //             "price": 0.326525,
        //             "remainingSize": 31431,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "limit",
        //             "reduceOnly": false,
        //             "ioc": false,
        //             "postOnly": false,
        //             "clientId": null,
        //         }
        //     }
        //
        // conditional trigger order
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //             "future": "XRP-PERP",
        //             "id": 9596912,
        //             "market": "XRP-PERP",
        //             "triggerPrice": 0.306225,
        //             "orderId": null,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "stop",
        //             "orderPrice": null,
        //             "error": null,
        //             "triggeredAt": null,
        //             "reduceOnly": false,
        //             "orderType": "market",
        //             "filledSize": 0,
        //             "avgFillPrice": null,
        //             "retryUntilFilled": false
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'cancelOrder', {});
        const defaultMethod = this.safeString (options, 'method', 'privateDeleteOrdersOrderId');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        const clientOrderId = this.safeValue2 (params, 'client_order_id', 'clientOrderId');
        if (clientOrderId === undefined) {
            request['order_id'] = parseInt (id);
            if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
                method = 'privateDeleteConditionalOrdersOrderId';
            }
        } else {
            request['client_order_id'] = clientOrderId;
            method = 'privateDeleteOrdersByClientIdClientOrderId';
        }
        const query = this.omit (params, [ 'method', 'type', 'client_order_id', 'clientOrderId' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": "Order queued for cancelation"
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'market': market['id'], // optional
            // 'conditionalOrdersOnly': false, // cancel conditional orders only
            // 'limitOrdersOnly': false, // cancel existing limit orders (non-conditional orders) only
        };
        const marketId = this.getMarketId (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        const response = await this.privateDeleteOrders (this.extend (request, params));
        const result = this.safeValue (response, 'result', {});
        //
        //     {
        //         "success": true,
        //         "result": "Orders queued for cancelation"
        //     }
        //
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const clientOrderId = this.safeValue2 (params, 'client_order_id', 'clientOrderId');
        let method = 'privateGetOrdersOrderId';
        if (clientOrderId === undefined) {
            request['order_id'] = id;
        } else {
            request['client_order_id'] = clientOrderId;
            params = this.omit (params, [ 'client_order_id', 'clientOrderId']);
            method = 'privateGetOrdersByClientIdClientOrderId';
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //             "filledSize": 10,
        //             "future": "XRP-PERP",
        //             "id": 9596912,
        //             "market": "XRP-PERP",
        //             "price": 0.306525,
        //             "avgFillPrice": 0.306526,
        //             "remainingSize": 31421,
        //             "side": "sell",
        //             "size": 31431,
        //             "status": "open",
        //             "type": "limit",
        //             "reduceOnly": false,
        //             "ioc": false,
        //             "postOnly": false,
        //             "clientId": null
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOpenOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrders');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
            method = 'privateGetConditionalOrders';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 100
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
        }
        // support for canceling conditional orders
        // https://github.com/ccxt/ccxt/issues/6669
        const options = this.safeValue (this.options, 'fetchOrders', {});
        const defaultMethod = this.safeString (options, 'method', 'privateGetOrdersHistory');
        let method = this.safeString (params, 'method', defaultMethod);
        const type = this.safeValue (params, 'type');
        if ((type === 'stop') || (type === 'trailingStop') || (type === 'takeProfit')) {
            method = 'privateGetConditionalOrdersHistory';
        }
        const query = this.omit (params, [ 'method', 'type' ]);
        const response = await this[method] (this.extend (request, query));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "createdAt": "2019-03-05T09:56:55.728933+00:00",
        //                 "filledSize": 10,
        //                 "future": "XRP-PERP",
        //                 "id": 9596912,
        //                 "market": "XRP-PERP",
        //                 "price": 0.306525,
        //                 "avgFillPrice": 0.306526,
        //                 "remainingSize": 31421,
        //                 "side": "sell",
        //                 "size": 31431,
        //                 "status": "open",
        //                 "type": "limit",
        //                 "reduceOnly": false,
        //                 "ioc": false,
        //                 "postOnly": false,
        //                 "clientId": null
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const [ market, marketId ] = this.getMarketParams (symbol, 'market', params);
        const request = {};
        if (marketId !== undefined) {
            request['market'] = marketId;
        }
        if (since !== undefined) {
            request['start_time'] = parseInt (since / 1000);
            request['end_time'] = this.seconds ();
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "fee": 20.1374935,
        //                 "feeRate": 0.0005,
        //                 "future": "EOS-0329",
        //                 "id": 11215,
        //                 "liquidity": "taker",
        //                 "market": "EOS-0329",
        //                 "baseCurrency": null,
        //                 "quoteCurrency": null,
        //                 "orderId": 8436981,
        //                 "price": 4.201,
        //                 "side": "buy",
        //                 "size": 9587,
        //                 "time": "2019-03-27T19:15:10.204619+00:00",
        //                 "type": "order"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'result', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        await this.loadMarkets ();
        this.checkAddress (address);
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
            'size': amount,
            'address': address,
            // 'password': 'string', // optional withdrawal password if it is required for your account
            // 'code': '192837', // optional 2fa code if it is required for your account
        };
        if (this.password !== undefined) {
            request['password'] = this.password;
        }
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        const response = await this.privatePostWalletWithdrawals (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "USDTBEAR",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "20.2",
        //             "status": "requested",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "null"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTransaction (result, currency);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'showAvgPrice': false,
        };
        const response = await this.privateGetPositions (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "cost": -31.7906,
        //                 "entryPrice": 138.22,
        //                 "estimatedLiquidationPrice": 152.1,
        //                 "future": "ETH-PERP",
        //                 "initialMarginRequirement": 0.1,
        //                 "longOrderSize": 1744.55,
        //                 "maintenanceMarginRequirement": 0.04,
        //                 "netSize": -0.23,
        //                 "openSize": 1744.32,
        //                 "realizedPnl": 3.39441714,
        //                 "shortOrderSize": 1732.09,
        //                 "side": "sell",
        //                 "size": 0.23,
        //                 "unrealizedPnl": 0,
        //                 "collateralUsed": 3.17906
        //             }
        //         ]
        //     }
        //
        // todo unify parsePosition/parsePositions
        return this.safeValue (response, 'result', []);
    }

    async fetchAccountPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccount (params);
        //
        //     {
        //         "result":{
        //             "backstopProvider":false,
        //             "chargeInterestOnNegativeUsd":false,
        //             "collateral":2830.2567913677476,
        //             "freeCollateral":2829.670741867416,
        //             "initialMarginRequirement":0.05,
        //             "leverage":20.0,
        //             "liquidating":false,
        //             "maintenanceMarginRequirement":0.03,
        //             "makerFee":0.0,
        //             "marginFraction":null,
        //             "openMarginFraction":null,
        //             "positionLimit":null,
        //             "positionLimitUsed":null,
        //             "positions":[
        //                 {
        //                     "collateralUsed":0.0,
        //                     "cost":0.0,
        //                     "entryPrice":null,
        //                     "estimatedLiquidationPrice":null,
        //                     "future":"XRP-PERP",
        //                     "initialMarginRequirement":0.05,
        //                     "longOrderSize":0.0,
        //                     "maintenanceMarginRequirement":0.03,
        //                     "netSize":0.0,
        //                     "openSize":0.0,
        //                     "realizedPnl":0.016,
        //                     "shortOrderSize":0.0,
        //                     "side":"buy",
        //                     "size":0.0,
        //                     "unrealizedPnl":0.0,
        //                 }
        //             ],
        //             "spotLendingEnabled":false,
        //             "spotMarginEnabled":false,
        //             "takerFee":0.0007,
        //             "totalAccountValue":2830.2567913677476,
        //             "totalPositionSize":0.0,
        //             "useFttCollateral":true,
        //             "username":"igor.kroitor@gmail.com"
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        // todo unify parsePosition/parsePositions
        return this.safeValue (result, 'positions', []);
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'coin': currency['id'],
        };
        const response = await this.privateGetWalletDepositAddressCoin (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        const tag = this.safeString (result, 'tag');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': tag,
            'info': response,
        };
    }

    parseTransactionStatus (status) {
        const statuses = {
            // what are other statuses here?
            'confirmed': 'ok', // deposits
            'complete': 'ok', // withdrawals
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, currency = undefined) {
        //
        // fetchDeposits
        //
        //     airdrop
        //
        //     {
        //         "id": 9147072,
        //         "coin": "SRM_LOCKED",
        //         "size": 3.12,
        //         "time": "2021-04-27T23:59:03.565983+00:00",
        //         "notes": "SRM Airdrop for FTT holdings",
        //         "status": "complete"
        //     }
        //
        //     regular deposits
        //
        //     {
        //         "coin": "TUSD",
        //         "confirmations": 64,
        //         "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //         "fee": 0,
        //         "id": 1,
        //         "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //         "size": "99.0",
        //         "status": "confirmed",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        // fetchWithdrawals
        //
        //     {
        //         "coin": "TUSD",
        //         "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //         "tag": "null",
        //         "fee": 0,
        //         "id": 1,
        //         "size": "99.0",
        //         "status": "complete",
        //         "time": "2019-03-05T09:56:55.728933+00:00",
        //         "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //     }
        //
        //     {
        //         "coin": 'BTC',
        //         "id": 1969806,
        //         "notes": 'Transfer to Dd6gi7m2Eg4zzBbPAxuwfEaHs6tYvyUX5hbPpsTcNPXo',
        //         "size": 0.003,
        //         "status": 'complete',
        //         "time": '2021-02-03T20:28:54.918146+00:00'
        //     }
        //
        const code = this.safeCurrencyCode (this.safeString (transaction, 'coin'));
        const id = this.safeString (transaction, 'id');
        const amount = this.safeNumber (transaction, 'size');
        const status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        const timestamp = this.parse8601 (this.safeString (transaction, 'time'));
        const txid = this.safeString (transaction, 'txid');
        let tag = undefined;
        let address = this.safeValue (transaction, 'address');
        if (typeof address !== 'string') {
            tag = this.safeString (address, 'tag');
            address = this.safeString (address, 'address');
        }
        if (address === undefined) {
            // parse address from internal transfer
            const notes = this.safeString (transaction, 'notes');
            if ((notes !== undefined) && (notes.indexOf ('Transfer to') >= 0)) {
                address = notes.slice (12);
            }
        }
        const fee = this.safeNumber (transaction, 'fee');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'addressFrom': undefined,
            'address': address,
            'addressTo': address,
            'tagFrom': undefined,
            'tag': tag,
            'tagTo': tag,
            'type': undefined,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': {
                'currency': code,
                'cost': fee,
                'rate': undefined,
            },
        };
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletDeposits (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "confirmations": 64,
        //             "confirmedTime": "2019-03-05T09:56:55.728933+00:00",
        //             "fee": 0,
        //             "id": 1,
        //             "sentTime": "2019-03-05T09:56:55.735929+00:00",
        //             "size": "99.0",
        //             "status": "confirmed",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (result, currency, since, limit, { 'type': 'deposit' });
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletWithdrawals (params);
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "coin": "TUSD",
        //             "address": "0x83a127952d266A6eA306c40Ac62A4a70668FE3BE",
        //             "tag": "null",
        //             "fee": 0,
        //             "id": 1,
        //             "size": "99.0",
        //             "status": "complete",
        //             "time": "2019-03-05T09:56:55.728933+00:00",
        //             "txid": "0x8078356ae4b06a036d64747546c274af19581f1c78c510b60505798a7ffcaf1"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        return this.parseTransactions (result, currency, since, limit, { 'type': 'withdrawal' });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/api/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const baseUrl = this.implodeHostname (this.urls['api'][api]);
        let url = baseUrl + request;
        if (method !== 'POST') {
            if (Object.keys (query).length) {
                const suffix = '?' + this.urlencode (query);
                url += suffix;
                request += suffix;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.milliseconds ().toString ();
            let auth = timestamp + method + request;
            headers = {};
            if ((method === 'POST') || (method === 'DELETE')) {
                body = this.json (query);
                auth += body;
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256');
            const options = this.safeValue (this.options, 'sign', {});
            const headerPrefix = this.safeString (options, this.hostname, 'FTX');
            const keyField = headerPrefix + '-KEY';
            const tsField = headerPrefix + '-TS';
            const signField = headerPrefix + '-SIGN';
            headers[keyField] = this.apiKey;
            headers[tsField] = timestamp;
            headers[signField] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to the default error handler
        }
        //
        //     {"error":"Invalid parameter start_time","success":false}
        //     {"error":"Not enough balances","success":false}
        //
        const success = this.safeValue (response, 'success');
        if (!success) {
            const feedback = this.id + ' ' + body;
            const error = this.safeString (response, 'error');
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async setLeverage (leverage, symbol = undefined, params = {}) {
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 1) || (leverage > 20)) {
            throw new BadRequest (this.id + ' leverage should be between 1 and 20');
        }
        const request = {
            'leverage': leverage,
        };
        return await this.privatePostAccountLeverage (this.extend (request, params));
    }
};
