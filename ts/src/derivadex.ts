'use strict';

//  ---------------------------------------------------------------------------

import { Exchange, Trade, Order } from './base/Exchange.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { ArgumentsRequired, AuthenticationError, BadSymbol, ExchangeError, OrderNotFound } from './base/errors.js';
import { Precise } from './base/Precise.js';
import CryptoJS from './static_dependencies/crypto-js/crypto-js.cjs';
import elliptic from './static_dependencies/elliptic/lib/elliptic.cjs';

//  ---------------------------------------------------------------------------

export default class derivadex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'derivadex',
            'name': 'DerivaDEX',
            'countries': [ 'JP' ], // Japan
            'version': 'v1',
            'rateLimit': 200, // TODO: add documentation for tiered rate limiting
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenOrders': false,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPosition': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'reduceMargin': false,
                'setLeverage': true,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '15m': '15m',
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://testnet.derivadex.io',
                    'stats': 'https://testnet.derivadex.io/stats',
                    'v2': 'https://testnet.derivadex.io/v2',
                },
                'logo': 'https://gitlab.com/dexlabs/assets/-/raw/main/light-round.png',
                'api': {
                    'public': 'https://exchange.derivadex.com',
                    'stats': 'https://exchange.derivadex.com/stats',
                    'v2': 'https://exchange.derivadex.com/v2',
                },
                'www': 'https://exchange.derivadex.com',
                'doc': [
                    'https://docs.derivadex.io',
                    'http://api.derivadex.io/',
                    'https://exchange.derivadex.com/api-docs',
                ],
            },
            'api': {
                'public': {
                    'get': {
                        'account/{trader}/strategy/{strategyId}/adls': 1,
                        'account/{trader}/strategy/{strategyId}/fills': 1,
                        'account/{trader}/strategy/{strategyId}/': 1,
                        'account/{trader}/strategy/{strategyId}/liquidations': 1,
                        'account/{trader}/strategy/{strategyId}/order_book': 1,
                        'account/{trader}/strategy/{strategyId}/order_intents': 1,
                        'account/{trader}/strategy/{strategyId}/positions': 1,
                        'account/{trader}/strategy/{strategyId}/strategy_updates': 1,
                        'account/{trader}': 1,
                        'account/{trader}/trader_updates': 1,
                        'adl': 1,
                        'ddx_fee_pool': 1,
                        'epochs': 1,
                        'fills': 1,
                        'insurance_fund': 1,
                        'liquidations': 1,
                        'order_book': 1,
                        'order_intents': 1,
                        'positions': 1,
                        'prices': 1,
                        'specs': 1,
                        'strategies': 1,
                        'startegy_updates': 1,
                        'trader_updates': 1,
                        'traders': 1,
                        'tx_logs': 1,
                        'aggregations/collateral': 1,
                        'aggregations/volume': 1,
                        'markets': 1,
                        'markets/order_book/L2': 1,
                        'markets/tickers': 1,
                        'snapshot/addresses': 1,
                    },
                },
                'v2': {
                    'get': {
                        'rest/ohlcv': 1,
                        'encryption-key': 1,
                    },
                    'post': {
                        'request': 1,
                    },
                },
            },
            'requiredCredentials': {
                'walletAddress': true,
                'privateKey': true,
                'apiKey': false,
                'secret': false,
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'defaultType': 'swap',
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ETH': 'ERC20',
                },
                'networksById': {
                    'ETH': 'ERC20',
                },
            },
            'fees': {
                'trading': {
                    'feeSide': 'get',
                    'tierBased': false,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.0,
                },
            },
            'encryptionKey': undefined,
            'addresses': undefined,
        });
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name derivadex#fetchMarkets
         * @description retrieves data on all markets for derivadex
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        params['kind'] = 0;
        const response = await (this as any).publicGetSpecs (params);
        // {
        //     "value": [
        //         {
        //             "kind": 0,
        //             "name": "DDXPERP",
        //             "expr": "\n(Market :name "DDXPERP"\n :tick-size 0.1\n :max-order-notional 0\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "0",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "BTCPERP",
        //             "expr": "\n(Market :name "BTCPERP"\n :tick-size 1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.00001\n)",
        //             "value": {
        //                 "tickSize": "1",
        //                 "minOrderSize": "0.00001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         },
        //         {
        //             "kind": 0,
        //             "name": "ETHPERP",
        //             "expr": "\n(Market :name "ETHPERP"\n :tick-size 0.1\n :max-order-notional 1000000\n :max-taker-price-deviation 0.02\n :min-order-size 0.0001\n)",
        //             "value": {
        //                 "tickSize": "0.1",
        //                 "minOrderSize": "0.0001",
        //                 "maxOrderNotional": "1000000",
        //                 "maxTakerPriceDeviation": "0.02"
        //             }
        //         }
        //     ],
        //         "timestamp": 1674260369,
        //         "success": true
        // }
        const markets = response['value'];
        return markets.filter ((market) => market['name'] !== 'DDXPERP').map ((market) => {
            const name = market['name'];
            const base = name.slice (0, -4);
            return {
                'id': name,
                'symbol': name,
                'base': base,
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': base.toLowerCase (),
                'quoteId': 'usd',
                'settleId': 'usdc',
                'type': 'swap',
                'spot': 'false',
                'margin': 'false',
                'swap': 'true',
                'future': 'false',
                'option': 'swap',
                'active': 'true',
                'contract': 'true',
                'linear': 'true',
                'inverse': 'false',
                'taker': '0.002',
                'maker': '0.000',
                'precision': {
                    'amount': 6,
                    'price': 6,
                    'quote': 6,
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': 3,
                    },
                    'amount': {
                        'min': market['value']['minOrderSize'],
                        'max': undefined,
                    },
                    'price': {
                        'min': market['value']['tickSize'],
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': market['value']['maxOrderNotional'],
                    },
                },
                'info': market,
            };
        });
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name derivadex#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const networks = {};
        networks['ERC20'] = {
            'info': undefined,
            'id': 'ETH',
            'network': this.networkIdToCode ('ETH'),
            'active': true,
            'deposit': true,
            'withdraw': true,
            'fee': undefined,
        };
        return [
            {
                'id': 'usdc',
                'code': 'USDC',
                'name': 'USDC',
                'active': true,
                'fee': 0,
                'precision': 6,
                'deposit': true,
                'withdraw': true,
                'limits': {
                    'deposit': {
                        'min': 1000,
                        'max': 1000000,
                    },
                },
                'networks': networks,
                'info': undefined,
            },
            {
                'id': 'ddx',
                'code': 'DDX',
                'name': 'DDX',
                'active': false,
                'fee': 0,
                'precision': 6,
                'deposit': true,
                'withdraw': true,
                'limits': {
                    'deposit': {
                        'min': 0.000001,
                        'max': undefined,
                    },
                },
                'networks': networks,
                'info': undefined,
            },
        ];
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['id'] ], params);
        const ticker = this.safeValue (tickers, market['id']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() symbol ' + market['id'] + ' not found');
        }
        return ticker;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTickers
         * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
         * @param {[string]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const marketSymbols = symbols === undefined ? Object.keys (this.markets) : this.marketSymbols (symbols);
        const result = {};
        for (let i = 0; i < marketSymbols.length; i++) {
            const ticker = await this.constructTicker (marketSymbols[i]);
            if (ticker !== undefined) {
                result[marketSymbols[i]] = ticker;
            }
        }
        return result;
    }

    async constructTicker (symbol) {
        const params = {};
        params['symbol'] = symbol;
        params['depth'] = 1;
        const [ orderBookResponse, tickerResponse ] = await Promise.all ([
            (this as any).publicGetMarketsOrderBookL2 (params),
            (this as any).publicGetMarketsTickers ({ 'symbol': symbol }),
        ]);
        const orderBookValue = orderBookResponse['value'];
        const bid = this.safeString (orderBookValue[0], 'price');
        const bidVolume = this.safeString (orderBookValue[0], 'amount');
        const ask = this.safeString (orderBookValue[1], 'price');
        const askVolume = this.safeString (orderBookValue[1], 'amount');
        const ticker = tickerResponse['value'][0];
        const timestamp = this.safeString (tickerResponse, 'timestamp');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high'),
            'low': this.safeString (ticker, 'low'),
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': this.safeString (ticker, 'volumeWeightedAveragePrice'),
            'open': this.safeString (ticker, 'open'),
            'close': this.safeString (ticker, 'close'),
            'last': this.safeString (ticker, 'close'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'change'),
            'percentage': this.safeString (ticker, 'percentage'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVolume'),
            'quoteVolume': this.safeString (ticker, 'notionalVolume'),
            'info': { orderBookResponse, tickerResponse },
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchMyTrades
         * @description fetch all trades made by the user
         * @param {string|undefined} symbol unified market symbol
         * @param {int|undefined} since the earliest time in ms to fetch trades for
         * @param {int|undefined} limit the maximum number of trades structures to retrieve
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html#trade-structure}
         */
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request = {
            'trader': this.walletAddress,
            'strategy': 'main',
            'fillReason': '0',
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 500
        }
        if (since !== undefined) {
            request['since'] = since / 1000;
        }
        request['order'] = params['order'] !== undefined ? params['order'] : 'asc';
        const extendedRequest = this.extend (request, params);
        if (extendedRequest['trader'] === undefined) {
            throw new AuthenticationError (this.id + ' fetchMyTrades() walletAddress is undefined, set this.walletAddress or "address" in params');
        }
        const response = await (this as any).publicGetFills (extendedRequest);
        const traderAddressWithDiscriminant = this.addDiscriminant (this.walletAddress);
        const mainStrategyIdHash = this.getMainStrategyIdHash ();
        return (await this.parseTradesCustom (response, market, since, limit, traderAddressWithDiscriminant, mainStrategyIdHash)) as Trade[];
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'fillReason': '0',
        };
        if (limit !== undefined) {
            request['limit'] = limit; // default 500
        }
        if (since !== undefined) {
            request['since'] = since / 1000;
        }
        request['order'] = params['order'] !== undefined ? params['order'] : 'asc';
        const response = await (this as any).publicGetFills (this.extend (request, params));
        // {
        //     value: [
        //       {
        //         epochId: '27',
        //         txOrdinal: '6',
        //         ordinal: '0',
        //         makerOrderHash: '0x87686e3ffa6b2e9c8a229a9b7fe948b504db94d376ce8e494f',
        //         amount: '0.05',
        //         symbol: 'BTCPERP',
        //         price: '22790',
        //         makerFee: '0',
        //         makerFeeSymbol: 'USDC',
        //         makerRealizedPnl: '0',
        //         takerOrderHash: '0x08fd0fd22dd23f3550d4edea3e37cceab4b9612116c14d71c0',
        //         takerFee: '2.279',
        //         takerFeeSymbol: 'USDC',
        //         takerRealizedPnl: '0',
        //         reason: '0',
        //         createdAt: '2023-01-25T20:13:12.574Z',
        //         liquidatedTrader: null,
        //         liquidatedStrategyIdHash: null
        //       },
        //       {
        //         epochId: '27',
        //         txOrdinal: '7',
        //         ordinal: '0',
        //         makerOrderHash: '0x87686e3ffa6b2e9c8a229a9b7fe948b504db94d376ce8e494f',
        //         amount: '0.01',
        //         symbol: 'BTCPERP',
        //         price: '22790',
        //         makerFee: '0',
        //         makerFeeSymbol: 'USDC',
        //         makerRealizedPnl: '0',
        //         takerOrderHash: '0x80b89184c49b710455ec17948785a07f4bb357561490a3e683',
        //         takerFee: '0.4558',
        //         takerFeeSymbol: 'USDC',
        //         takerRealizedPnl: '0',
        //         reason: '0',
        //         createdAt: '2023-01-25T20:13:18.578Z',
        //         liquidatedTrader: null,
        //         liquidatedStrategyIdHash: null
        //       },
        //     ]
        // }
        return await this.parseTradesCustom (response, market, since, limit) as Trade[];
    }

    async getOrderIntents (trades) {
        const result = {};
        const params = {
            'orderHash': [],
        };
        for (let i = 0; i < trades.length; i++) {
            params['orderHash'].push (trades[i]['takerOrderHash']);
        }
        const orderIntentResponse = await (this as any).publicGetOrderIntents (params);
        const orderIntentResponseValue = orderIntentResponse['value'];
        for (let i = 0; i < orderIntentResponseValue.length; i++) {
            result[orderIntentResponseValue[i]['orderHash']] = orderIntentResponseValue[i];
        }
        return result;
    }

    async parseTradesCustom (trades, market: object | undefined = undefined, since: number | undefined = undefined, limit: number | undefined = undefined, trader: string | undefined = undefined, strategy: string | undefined = undefined) {
        trades = this.toArray (trades);
        let result = [];
        const orderIntents = await this.getOrderIntents (trades[0]);
        for (let i = 0; i < trades[0].length; i++) {
            const trade = this.parseTradeCustom (trades[0][i], orderIntents, trader, strategy);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const tail = (since === undefined);
        return this.filterBySymbolSinceLimit (result, symbol, since, limit, tail);
    }

    parseTradeCustom (trade, orderIntents, trader = undefined, strategy = undefined) {
        const id = this.safeString (trade, 'takerOrderHash') + '_' + this.safeString (trade, 'epochId') + '_' + this.safeString (trade, 'txOrdinal');
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeString (trade, 'symbol');
        const order = this.safeString (trade, 'takerOrderHash');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const fee = {
            'cost': this.safeString (trade, 'takerFee'),
            'currency': this.safeString (trade, 'takerFeeSymbol'),
        };
        const takerOrderHash = this.safeString (trade, 'takerOrderHash');
        const sideNumber = this.safeInteger (orderIntents[takerOrderHash], 'side');
        const orderTypeNumber = this.safeInteger (orderIntents[takerOrderHash], 'orderType');
        const side = sideNumber === 0 ? 'buy' : 'sell';
        const orderType = this.getOrderType (orderTypeNumber);
        // liquidations have null takerOrderHash
        let takerOrMaker = takerOrderHash !== null ? 'taker' : undefined;
        if (trader !== undefined && strategy !== undefined && this.safeString (trade, 'makerOrderTrader') === trader.toLowerCase () && this.safeString (trade, 'makerOrderStrategyIdHash') === strategy) {
            takerOrMaker = 'maker';
        }
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': orderType,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'fee': fee,
        });
    }

    parseTrade (trade, market = undefined) {
        const id = this.safeString (trade, 'takerOrderHash') + '_' + this.safeString (trade, 'epochId') + '_' + this.safeString (trade, 'txOrdinal');
        const timestamp = this.parse8601 (this.safeString (trade, 'createdAt'));
        const datetime = this.iso8601 (timestamp);
        const symbol = this.safeString (trade, 'symbol');
        const order = this.safeString (trade, 'takerOrderHash');
        const price = this.safeString (trade, 'price');
        const amount = this.safeString (trade, 'amount');
        const fee = {
            'cost': this.safeString (trade, 'takerFee'),
            'currency': this.safeString (trade, 'takerFeeSymbol'),
        };
        const takerOrderHash = this.safeString (trade, 'takerOrderHash');
        // liquidations have null takerOrderHash
        const takerOrMaker = takerOrderHash !== null ? 'taker' : undefined;
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': datetime,
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': undefined,
            'price': price,
            'cost': undefined,
            'amount': amount,
            'fee': fee,
        });
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await (this as any).publicGetOrderBook (this.extend (request, params));
        // value: [
        //     {
        //       traderAddress: '0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d',
        //       strategyId: 'main',
        //       orderHash: '0x2e401956ae605a3a222bd92533260103a23a963e6e55b066a0',
        //       symbol: 'BTCPERP',
        //       amount: '0.035',
        //       price: '23000',
        //       side: '0',
        //       originalAmount: '0.04',
        //       bookOrdinal: '0'
        //     },
        //     {
        //       traderAddress: '0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d',
        //       strategyId: 'main',
        //       orderHash: '0x746be891d408f6e415760241c86d9c852a17514d59299a78de',
        //       symbol: 'BTCPERP',
        //       amount: '0.08',
        //       price: '24000',
        //       side: '1',
        //       originalAmount: '0.08',
        //       bookOrdinal: '1'
        //     }
        //   ]
        const responseValue = response['value'];
        const timestamp = this.safeNumber (response, 'timestamp') * 1000;
        const result = {
            'symbol': market['id'],
            'bids': [],
            'asks': [],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'nonce': undefined,
        };
        for (let i = 0; i < responseValue.length; i++) {
            const order = responseValue[i];
            const side = (order['side'] === '0') ? 'bids' : 'asks';
            const amount = this.safeNumber (order, 'amount');
            const price = this.safeNumber (order, 'price');
            result[side].push ([ price, amount ]);
        }
        result['bids'].reverse ();
        return result as any;
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const fromTimestamp = this.getTimeForOhlcvRequest (this.timeframes[timeframe], since, limit);
        const request = {
            'symbol': market['id'],
            'interval': this.timeframes[timeframe],
        };
        request['from'] = fromTimestamp! / 1000;
        request['to'] = this.getToParamForOhlcvRequest (this.timeframes[timeframe], fromTimestamp, limit) / 1000;
        const response = await (this as any).v2GetRestOhlcv (this.extend (request, params));
        return this.parseOHLCVs (response['ohlcv'], market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        const open = this.safeNumber (ohlcv, 'open');
        const high = this.safeNumber (ohlcv, 'high');
        const low = this.safeNumber (ohlcv, 'low');
        const close = this.safeNumber (ohlcv, 'close');
        const volume = this.safeNumber (ohlcv, 'volume');
        return [ timestamp, open, high, low, close, volume ];
    }

    getTimeForOhlcvRequest (interval, time, limit = 10) {
        const msInMinute = 60 * 1000;
        const msInHour = 60 * 1000 * 60;
        const msInDay = 60 * 1000 * 60 * 24;
        if (time === undefined) {
            const duration = this.parseTimeframe (interval);
            time = this.milliseconds () - duration * limit * 1000 - 1000;
        }
        if (interval === '1m') {
            return Math.ceil (time / msInMinute) * msInMinute;
        }
        if (interval === '1h') {
            return Math.ceil (time / msInHour) * msInHour;
        }
        if (interval === '1d') {
            return Math.ceil (time / msInDay) * msInDay;
        }
    }

    getToParamForOhlcvRequest (interval, from, limit = 10) {
        const msInMinute = 60 * 1000;
        const msInHour = 60 * 1000 * 60;
        const msInDay = 60 * 1000 * 60 * 24;
        if (interval === '1m') {
            return from + (msInMinute * limit);
        }
        if (interval === '1h') {
            return from + (msInHour * limit);
        }
        if (interval === '1d') {
            return from + (msInDay * limit);
        }
    }

    async wait (ms) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise ((resolve) => setTimeout (resolve, ms));
    }

    async getSequencedOrder (operatorResponse, lookbackLimit: number | undefined = undefined) {
        /**
         * @method
         * @name derivadex#getSequencedOrder
         * @description fetches information on an order made by the user
         * @param {object} operatorResponse the operator response object associated with a derivadex createOrder() request
         * @param {int|undefined} lookbackLimit the maximum number of order intents to lookback through to find an order intent. You may need a higher lookbackLimit value if many orders have been placed since the operatorResponse you are searching for returned
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const params = {
            'trader': this.walletAddress,
            'strategyId': 'main',
            'order': 'desc',
        };
        if (lookbackLimit !== undefined) {
            params['limit'] = lookbackLimit;
        }
        let response = await (this as any).publicGetAccountTraderStrategyStrategyIdOrderIntents (params);
        let order = response['value'].find ((intent) => intent.nonce === operatorResponse.c.nonce);
        if (order === undefined) {
            await this.wait (1000); // retry after 1 second
            response = await (this as any).publicGetAccountTraderStrategyStrategyIdOrderIntents (params);
            order = response['value'].find ((intent) => intent.nonce === operatorResponse.c.nonce);
            if (order === undefined) {
                throw new OrderNotFound (this.id + ' getSequencedOrder() could not find the order intent associated with this operator response');
            }
        }
        return await this.parseOrderCustom (order);
    }

    async fetchPublicOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchPublicOrders
         * @description fetches information on multiple public orders made in a market
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since / 1000;
        }
        request['order'] = params['order'] !== undefined ? params['order'] : 'asc';
        const response = await (this as any).publicGetOrderIntents (request);
        return await this.parseOrdersCustom (response['value'], market, since, limit);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrder
         * @description fetches information on an order made by the user
         * @param {string|undefined} symbol unified symbol of the market the order was made in
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request = {
            'orderHash': [ id ],
        };
        const response = await (this as any).publicGetOrderIntents (request);
        return await this.parseOrderCustom (response['value'][0], market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of order structures to retrieve
         * @param {string|undefined} params.order the chronological order of items in the response - 'asc' or 'desc'
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        await this.loadMarkets ();
        const market = symbol !== undefined ? this.market (symbol) : undefined;
        const request = {
            'trader': this.walletAddress,
            'strategyId': 'main',
        };
        if (symbol !== undefined) {
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['since'] = since / 1000;
        }
        request['order'] = params['order'] !== undefined ? params['order'] : 'asc';
        const response = await (this as any).publicGetAccountTraderStrategyStrategyIdOrderIntents (request);
        return (await this.parseOrdersCustom (response['value'], market, since, limit)) as Order[];
    }

    async parseOrdersCustom (orders, market = undefined, since = undefined, limit = undefined, params = {}) {
        let results: any[] = [];
        if (Array.isArray (orders)) {
            for (let i = 0; i < orders.length; i++) {
                const order = this.extend (await this.parseOrderCustom (orders[i], market), params);
                results.push (order);
            }
        } else {
            const ids = Object.keys (orders);
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                const order = this.extend (this.parseOrderCustom (this.extend ({ 'id': id }, orders[id]), market), params);
                results.push (order);
            }
        }
        results = this.sortBy (results, 'timestamp');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        const tail = since === undefined;
        return this.filterBySymbolSinceLimit (results, symbol, since, limit, tail);
    }

    async parseOrderCustom (order, market = undefined) {
        // {
        //     "epochId":"1",
        //     "txOrdinal":"7",
        //     "orderHash":"0x2e401956ae605a3a222bd92533260103a23a963e6e55b066a0",
        //     "symbol":"BTCPERP",
        //     "amount":"0.04",
        //     "price":"23000",
        //     "side":0,
        //     "orderType":0,
        //     "stopPrice":"0",
        //     "nonce":"0x00000000000000000000000000000000000000000000000000000185f46343ae",
        //     "signature":"0xe5de522ee59134005016dd9e1f59b625052551c2f722261c3a31060c792384ba0152361624013a46685adf163335e4cc8006bfedfadb3896c2f5910d1391fc131b",
        //     "createdAt":"2023-01-27T18:00:26.960Z",
        //     "traderAddress":"0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d",
        //     "strategyId":"main"
        // }
        const id = this.safeString (order, 'orderHash');
        const datetime = this.safeString (order, 'createdAt');
        const timestamp = this.parse8601 (datetime);
        const symbol = this.safeString (order, 'symbol');
        const orderHash = this.safeString (order, 'orderHash');
        const sideNumber = this.safeInteger (order, 'side');
        const orderTypeNumber = this.safeInteger (order, 'orderType');
        const side = sideNumber === 0 ? 'buy' : 'sell';
        const price = this.safeString (order, 'price');
        const amount = this.safeString (order, 'amount');
        const params = {
            'orderHash': [ orderHash ],
            'fillReason': [ 0, 1, 2 ],
        };
        const fillResponse = await (this as any).publicGetFills (params);
        const fills = fillResponse['value'];
        const [ status, filled ] = this.getOrderStatusAndFilledAmount (fills, amount);
        const orderType = this.getOrderType (orderTypeNumber);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': 'GTC',
            'side': side,
            'price': price,
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': this.parseNumber (amount) - (filled as number),
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': { order, fills },
        }, market);
    }

    getOrderStatusAndFilledAmount (fills, orderAmount) {
        let filledAmount = 0;
        let isCancel = false;
        for (let i = 0; i < fills.length; i++) {
            if (fills[i]['reason'] === '2') {
                isCancel = true;
            } else {
                filledAmount += this.parseNumber (fills[i]['amount']);
            }
        }
        if (filledAmount === this.parseNumber (orderAmount)) {
            return [ 'closed', filledAmount ];
        }
        if (isCancel) {
            return [ 'canceled', filledAmount ];
        }
        return [ 'open', filledAmount ];
    }

    getOrderType (orderTypeNumber) {
        if (orderTypeNumber === 0) {
            return 'limit';
        } else if (orderTypeNumber === 1) {
            return 'market';
        } else if (orderTypeNumber === 2) {
            return 'stop';
        }
    }

    orderTypeToInt (orderTypeString) {
        if (orderTypeString === 'Limit') {
            return 0;
        } else if (orderTypeString === 'Market') {
            return 1;
        } else {
            return 2;
        }
    }

    orderSideToInt (orderSide) {
        if (orderSide === 'Bid') {
            return 0;
        } else {
            return 1;
        }
    }

    async updateProfile (payFeesInDDX) {
        /**
         * @method
         * @name derivadex#profileUpdate
         * @description update a trader profile
         * @param {bool} payFeesInDDX whether to pay trading fees in DDX or not.
         * @returns {bool} whether the trader profile was updated successfully
         */
        const isAuthenticated = this.checkRequiredCredentials ();
        if (!isAuthenticated) {
            throw new AuthenticationError (this.id + ' updateProfile endpoint requires privateKey and walletAddress credentials');
        }
        const orderIntent = this.getOperatorProfileUpdateIntent (payFeesInDDX);
        const operatorResponse = await this.getOperatorResponseForOrderIntent (orderIntent, 'ProfileUpdate');
        if (operatorResponse['t'] !== 'Sequenced') {
            throw new ExchangeError (this.id + `updateProfile request failed with error ${operatorResponse['t']}, error contents: ${this.json (operatorResponse['c'])}`);
        }
        return true;
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#cancelAllOrders
         * @description cancel all open orders
         * @param {string|undefined} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {string|undefined} params.strategyId the trader strategyId for which to cancel all orders
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const isAuthenticated = this.checkRequiredCredentials ();
        if (!isAuthenticated) {
            throw new AuthenticationError (this.id + ' cancelAllOrders endpoint requires privateKey and walletAddress credentials');
        }
        const strategy = params['strategyId'] === undefined ? 'main' : params['strategyId'];
        const orderIntent = this.getOperatorCancelAllOrdersIntent (strategy);
        const operatorResponse = await this.getOperatorResponseForOrderIntent (orderIntent, 'CancelAll');
        if (operatorResponse['t'] !== 'Sequenced') {
            throw new ExchangeError (this.id + `cancelAllOrders request failed with error ${operatorResponse['t']}, error contents: ${this.json (operatorResponse['c'])}`);
        }
        return operatorResponse;
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#cancelOrder
         * @description cancels an open order
         * @param {string} id order id
         * @param {string|undefined} symbol not used by derivadex cancelOrder ()
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const isAuthenticated = this.checkRequiredCredentials ();
        if (!isAuthenticated) {
            throw new AuthenticationError (this.id + ' cancelOrder endpoint requires privateKey and walletAddress credentials');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderIntent = this.getOperatorCancelOrderIntent (market['id'], id);
        const operatorResponse = await this.getOperatorResponseForOrderIntent (orderIntent, 'CancelOrder');
        const timestamp = Date.now ();
        if (operatorResponse['t'] !== 'Sequenced') {
            throw new ExchangeError (this.id + `cancelOrder request failed with error ${operatorResponse['t']}, error contents: ${this.json (operatorResponse['c'])}`);
        }
        return this.safeOrder ({
            'id': undefined,
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': undefined,
            'symbol': market['id'],
            'type': undefined,
            'timeInForce': 'GTC',
            'side': undefined,
            'price': undefined,
            'average': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': operatorResponse,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @param {bool|undefined} params.getOrderConfirmation // if set to true, createOrder will return an order structure, otherwise createOrder will return the raw operator response.
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
         */
        const isAuthenticated = this.checkRequiredCredentials ();
        if (!isAuthenticated) {
            throw new AuthenticationError (this.id + ' createOrder endpoint requires privateKey and walletAddress credentials');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const orderType = this.capitalize (type);
        const orderIntent = this.getOperatorSubmitOrderIntent (market['id'], side, orderType, amount, price);
        const operatorResponse = await this.getOperatorResponseForOrderIntent (orderIntent, 'Order');
        if (operatorResponse['t'] !== 'Sequenced') {
            throw new ExchangeError (this.id + ` createOrder request failed with error ${this.json (operatorResponse['t'])}, error contents: ${this.json (operatorResponse['c'])}`);
        }
        if (!(params as any).getOrderConfirmation) {
            return operatorResponse;
        }
        return await this.getSequencedOrder (operatorResponse, 10);
    }

    async getOperatorResponseForOrderIntent (orderIntent, requestType) {
        const scaledOrderIntent = requestType === 'Order' ? this.getScaledOrderIntent (orderIntent) : orderIntent;
        let encryptionKey = (this as any).encryptionKey;
        if (encryptionKey === undefined) {
            encryptionKey = await (this as any).v2GetEncryptionKey ();
            (this as any).encryptionKey = encryptionKey;
        }
        let addresses = (this as any).addresses;
        if (addresses === undefined) {
            addresses = await (this as any).publicGetSnapshotAddresses ({ 'contractDeployment': 'mainnet' });
            (this as any).addresses = addresses;
        }
        const orderIntentData = this.getOrderIntentTypedData (
            scaledOrderIntent,
            addresses['chainId'],
            addresses['addresses']['derivaDEXAddress'],
            requestType
        );
        // const typedData = this.transformTypedDataForEthers (orderIntentData);
        const signature = (this as any).signTypedData (Buffer.from ((this as any).privateKey, 'hex'), { 'data': orderIntentData });
        orderIntent['signature'] = signature;
        if (requestType === 'Order') {
            orderIntent['amount'] = orderIntent['amount'].toString ();
            orderIntent['price'] = orderIntent['price'].toString ();
            orderIntent['stopPrice'] = orderIntent['stopPrice'].toString ();
        }
        const intent = { 't': requestType, 'c': orderIntent };
        const encryptedIntent = await this.encryptIntent (encryptionKey, intent);
        const buffer = Buffer.from (encryptedIntent.replace (/^0x/, ''), 'hex');
        return await (this as any).v2PostRequest (buffer);
    }

    addDiscriminant (traderAddress) {
        // TODO: look up / resolve discriminant from chainId -- hard coding 00 for ethereum for now
        const prefix = '0x00';
        return `${prefix}${traderAddress.slice (2)}`;
    }

    asNonce (num) {
        return `0x${num.toString (16).padStart (64, '0')}`;
    }

    getOperatorSubmitOrderIntent (symbol, side, orderType, amount, price) {
        return {
            'traderAddress': this.walletAddress,
            'symbol': symbol,
            'strategy': 'main',
            'side': side === 'buy' ? 'Bid' : 'Ask',
            'orderType': orderType,
            'nonce': this.asNonce (Date.now ()),
            'amount': new Precise (amount.toString ()),
            'price': price === undefined ? new Precise ('0') : new Precise (price.toString ()),
            'stopPrice': new Precise ('0'),
            'signature': '0x0',
        };
    }

    getOperatorCancelOrderIntent (symbol, orderHash) {
        const ZERO_PADDING = '00000000000000';
        return {
            'symbol': symbol,
            'nonce': this.asNonce (Date.now ()),
            'signature': '0x',
            'orderHash': orderHash + ZERO_PADDING,
        };
    }

    getOperatorCancelAllOrdersIntent (strategyId) {
        return {
            'strategyId': strategyId,
            'nonce': this.asNonce (Date.now ()),
            'signature': '0x',
        };
    }

    getOperatorProfileUpdateIntent (payFeesInDDX) {
        return {
            'payFeesInDdx': payFeesInDDX,
            'nonce': this.asNonce (Date.now ()),
            'signature': '0x',
        };
    }

    getScaledOrderIntent (intent) {
        const operatorDecimals = 6;
        const operatorDecimalMultiplier = new Precise ((10 ** operatorDecimals).toString ());
        return {
            'traderAddress': intent['traderAddress'],
            'symbol': intent['symbol'],
            'strategy': intent['strategy'],
            'side': intent['side'],
            'orderType': intent['orderType'],
            'nonce': intent['nonce'],
            'amount': intent['amount'].mul (operatorDecimalMultiplier),
            'price': intent['price'].mul (operatorDecimalMultiplier),
            'stopPrice': intent['stopPrice'].mul (operatorDecimalMultiplier),
            'signature': intent['signature'],
        };
    }

    transformTypedDataForEthers (typedData) {
        return {
            'domain': typedData.domain,
            'types': this.omit (typedData.types, 'EIP712Domain'),
            'value': typedData.message,
        };
    }

    encodeStringIntoBytes32 (str) {
        const encoder = new TextEncoder ();
        const encodedStr = encoder.encode (str);
        const lengthHex = encodedStr.length.toString (16);
        const paddedLengthHex = lengthHex.padStart (2, '0');
        const bytes32Str = '0x' + paddedLengthHex + Buffer.from (encodedStr).toString ('hex').padEnd (62, '0');
        return bytes32Str;
    }

    getOrderIntentTypedData (orderIntent, chainId, verifyingContractAddress, requestType) {
        if (requestType === 'Order') {
            return this.createOrderIntentTypedData (orderIntent, chainId, verifyingContractAddress);
        }
        if (requestType === 'CancelOrder') {
            return this.cancelOrderIntentTypedData (orderIntent, chainId, verifyingContractAddress);
        }
        if (requestType === 'CancelAll') {
            return this.cancelAllOrdersIntentTypedData (orderIntent, chainId, verifyingContractAddress);
        }
        if (requestType === 'ProfileUpdate') {
            return this.profileUpdateIntentTypedData (orderIntent, chainId, verifyingContractAddress);
        }
    }

    createOrderIntentTypedData (orderIntent, chainId, verifyingContractAddress) {
        return {
            'primaryType': 'OrderParams',
            'types': {
                'EIP712Domain': [
                    { 'name': 'name', 'type': 'string' },
                    { 'name': 'version', 'type': 'string' },
                    { 'name': 'chainId', 'type': 'uint256' },
                    { 'name': 'verifyingContract', 'type': 'address' },
                ],
                'OrderParams': [
                    { 'name': 'symbol', 'type': 'bytes32' },
                    { 'name': 'strategy', 'type': 'bytes32' },
                    { 'name': 'side', 'type': 'uint256' },
                    { 'name': 'orderType', 'type': 'uint256' },
                    { 'name': 'nonce', 'type': 'bytes32' },
                    { 'name': 'amount', 'type': 'uint256' },
                    { 'name': 'price', 'type': 'uint256' },
                    { 'name': 'stopPrice', 'type': 'uint256' },
                ],
            },
            'domain': this.createEIP712DomainSeperator (chainId, verifyingContractAddress),
            'message': {
                'symbol': this.encodeStringIntoBytes32 (orderIntent.symbol),
                'strategy': this.encodeStringIntoBytes32 (orderIntent.strategy),
                'side': this.orderSideToInt (orderIntent.side).toString (),
                'orderType': this.orderTypeToInt (orderIntent.orderType).toString (),
                'nonce': orderIntent.nonce,
                'amount': orderIntent.amount.toString (),
                'price': orderIntent.price.toString (),
                'stopPrice': orderIntent.stopPrice.toString (),
            },
        };
    }

    cancelOrderIntentTypedData (cancelIntent, chainId, verifyingContractAddress) {
        return {
            'primaryType': 'CancelOrderParams',
            'types': {
                'EIP712Domain': [
                    { 'name': 'name', 'type': 'string' },
                    { 'name': 'version', 'type': 'string' },
                    { 'name': 'chainId', 'type': 'uint256' },
                    { 'name': 'verifyingContract', 'type': 'address' },
                ],
                'CancelOrderParams': [
                    { 'name': 'symbol', 'type': 'bytes32' },
                    { 'name': 'orderHash', 'type': 'bytes32' },
                    { 'name': 'nonce', 'type': 'bytes32' },
                ],
            },
            'domain': this.createEIP712DomainSeperator (chainId, verifyingContractAddress),
            'message': {
                'symbol': this.encodeStringIntoBytes32 (cancelIntent.symbol),
                'orderHash': cancelIntent.orderHash,
                'nonce': cancelIntent.nonce,
            },
        };
    }

    cancelAllOrdersIntentTypedData (cancelAllIntent, chainId, verifyingContractAddress) {
        return {
            'primaryType': 'CancelAllParams',
            'types': {
                'EIP712Domain': [
                    { 'name': 'name', 'type': 'string' },
                    { 'name': 'version', 'type': 'string' },
                    { 'name': 'chainId', 'type': 'uint256' },
                    { 'name': 'verifyingContract', 'type': 'address' },
                ],
                'CancelAllParams': [
                    { 'name': 'strategy', 'type': 'bytes32' },
                    { 'name': 'nonce', 'type': 'bytes32' },
                ],
            },
            'domain': this.createEIP712DomainSeperator (chainId, verifyingContractAddress),
            'message': {
                'strategy': this.encodeStringIntoBytes32 (cancelAllIntent.strategyId),
                'nonce': cancelAllIntent.nonce,
            },
        };
    }

    profileUpdateIntentTypedData (updateProfileIntent, chainId, verifyingContractAddress) {
        return {
            'primaryType': 'UpdateProfileParams',
            'types': {
                'EIP712Domain': [
                    { 'name': 'name', 'type': 'string' },
                    { 'name': 'version', 'type': 'string' },
                    { 'name': 'chainId', 'type': 'uint256' },
                    { 'name': 'verifyingContract', 'type': 'address' },
                ],
                'UpdateProfileParams': [
                    { 'name': 'payFeesInDdx', 'type': 'bool' },
                    { 'name': 'nonce', 'type': 'bytes32' },
                ],
            },
            'domain': this.createEIP712DomainSeperator (chainId, verifyingContractAddress),
            'message': {
                'payFeesInDdx': updateProfileIntent.payFeesInDdx,
                'nonce': updateProfileIntent.nonce,
            },
        };
    }

    createEIP712DomainSeperator (chainId, verifyingContractAddress) {
        return {
            'name': 'DerivaDEX',
            'version': '1',
            'chainId': chainId,
            'verifyingContract': verifyingContractAddress,
        };
    }

    async encryptIntent (encryptionKey, payload) {
        // Create an ephemeral ECDSA private key to encrypt the request.
        const secretKeyBytes = this.wordArrayToBytes (CryptoJS.lib.WordArray.random (32), 32);
        // Unique single-use nonce for each encryption.
        const nonceBytes = this.wordArrayToBytes (CryptoJS.lib.WordArray.random (12), 12);
        const json = JSON.stringify (payload);
        const buffer = Buffer.from (json);
        const requestBytes = new Uint8Array (buffer);
        const encryptionKeyBuffer = Buffer.from (encryptionKey.slice (3), 'hex');
        const encryptionKeyBytes = new Uint8Array (encryptionKeyBuffer);
        const encryptedBytes = this.encrypt (requestBytes, secretKeyBytes, encryptionKeyBytes, nonceBytes);
        return this.hexlify (encryptedBytes);
    }

    hexlify (bytes) {
        const hexCharacters = '0123456789abcdef';
        let result = '0x';
        for (let i = 0; i < bytes.length; i++) {
            const v = bytes[i];
            // eslint-disable-next-line no-bitwise
            result += hexCharacters[(v & 0xf0) >> 4] + hexCharacters[v & 0x0f];
        }
        return result;
    }

    wordArrayToBytes (wordArray, size) {
        const bytes = new Uint8Array (size);
        const truncatedWords = wordArray.words.slice (0, size / 4);
        for (let i = 0; i < size; i++) {
            // eslint-disable-next-line no-bitwise
            const byte = (truncatedWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            bytes[i] = byte;
        }
        return bytes;
    }

    encrypt (str, secretKey, encryptionKeyBytes, nonceBytes) {
        const EC = elliptic.ec;
        // Create a secp256k1 curve object
        const secp256k1 = new EC ('secp256k1');
        // Uint8Array-encoded network public key
        const networkPublicKey = secp256k1.keyFromPublic (encryptionKeyBytes).getPublic ();
        // Create a PrivateKey object from the secret key
        const myPrivateKey = secp256k1.keyFromPrivate (secretKey);
        // Get the corresponding public key
        const myPublicKey = myPrivateKey.getPublic ();
        const compressedPublicKeyBytes = myPublicKey.encodeCompressed ();
        // Compute the shared public key
        const sharedPublicKey = networkPublicKey.mul (myPrivateKey.priv);
        const keccak256 = CryptoJS.algo.SHA3.create ({ 'outputLength': 256 });
        const sharedPublicKeyCompressed = sharedPublicKey.encodeCompressed ();
        const sharedPublicKeyCompressedBytes = new Uint8Array (sharedPublicKeyCompressed);
        keccak256.update (CryptoJS.lib.WordArray.create (sharedPublicKeyCompressedBytes));
        const hash = keccak256.finalize ();
        const derivedKey = this.wordArrayToBytes (hash, 16);
        // the provided CryptoJS static dependency does not include aes gcm encryption mode
        // so we have to use the node crypto library for now
        const cipher = (this as any).createCipheriv ('aes-128-gcm', derivedKey, nonceBytes);
        const encodedMessage = Buffer.from (str, 'utf8');
        const messageLength = Buffer.alloc (4);
        messageLength.writeUInt32BE (encodedMessage.length, 0);
        const dataToEncrypt = Buffer.concat ([ messageLength, encodedMessage ]);
        let cipherText = cipher.update (dataToEncrypt, 'utf8', 'base64');
        cipherText += cipher.final ('base64');
        const authTag = cipher.getAuthTag ().toString ('base64');
        const cipherBytes = new Uint8Array (Buffer.from (cipherText, 'base64'));
        const tagBytes = new Uint8Array (Buffer.from (authTag, 'base64'));
        const totalLength = cipherBytes.length + tagBytes.length + nonceBytes.length + compressedPublicKeyBytes.length;
        const concatenatedUint8Array = new Uint8Array (totalLength);
        let offset = 0;
        concatenatedUint8Array.set (cipherBytes, offset);
        offset += cipherBytes.length;
        concatenatedUint8Array.set (tagBytes, offset);
        offset += tagBytes.length;
        concatenatedUint8Array.set (nonceBytes, offset);
        offset += nonceBytes.length;
        concatenatedUint8Array.set (compressedPublicKeyBytes, offset);
        return concatenatedUint8Array;
    }

    async fetchBalance (params = {}) {
        /**
         * @method
         * @name derivadex#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const strategyRequest = {
            'trader': this.walletAddress,
            'strategyId': 'main',
        };
        const strategyResponse = await (this as any).publicGetAccountTraderStrategyStrategyId (strategyRequest);
        // {
        //     value: {
        //       trader: '0x0006cef8e666768cc40cc78cf93d9611019ddcb628',
        //       strategyId: 'main',
        //       strategyIdHash: '0x2576ebd1',
        //       maxLeverage: '3',
        //       freeCollateral: '9958.802449',
        //       frozenCollateral: '1000000',
        //       frozen: false
        //     },
        //     timestamp: '1677267890',
        //     success: true
        // }
        return this.parseBalance (strategyResponse['value']);
    }

    parseBalance (strategy) {
        const result = {
            'info': strategy,
        };
        const account = this.account ();
        const total = this.safeNumber (strategy, 'freeCollateral') + this.safeNumber (strategy, 'frozenCollateral');
        account['total'] = total.toString ();
        account['free'] = this.safeString (strategy, 'freeCollateral');
        result['USDC'] = account;
        return this.safeBalance (result);
    }

    getMainStrategyIdHash () {
        return '0x2576ebd1';
    }

    async fetchDepositAddress (code, params = {}) {
        /**
         * @method
         * @name derivadex#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @param {string} code unified currency code
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
         */
        let addresses = (this as any).addresses;
        if (addresses === undefined) {
            addresses = await (this as any).publicGetSnapshotAddresses ({ 'contractDeployment': 'mainnet' });
            (this as any).addresses = addresses;
        }
        if (code !== 'USDC' && code !== 'DDX') {
            throw new BadSymbol (this.id + ' fetchDepositAddress() does not support ' + code);
        }
        return addresses['addresses']['derivaDEXAddress'];
    }

    async fetchPositions (symbols = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchPositions
         * @description fetch all open positions
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {[object]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
         */
        const response = await (this as any).publicGetPositions ();
        response['value'].forEach ((position) => {
            position.timestamp = response['timestamp'] * 1000;
        });
        return this.parsePositions (response['value'], symbols);
    }

    parsePosition (position, market = undefined) {
        // {
        //     trader: '0x004404ac8bd8f9618d27ad2f1485aa1b2cfd82482d',
        //     symbol: 'BTCPERP',
        //     strategyIdHash: '0x2576ebd1',
        //     side: '1',
        //     balance: '0.24',
        //     avgEntryPrice: '23271.101723',
        //     lastModifiedInEpoch: null
        // },
        const id = position['trader'] + '_' + position['strategyIdHash'] + '_' + position['symbol'];
        const timestamp = this.safeNumber (position, 'timestamp');
        return {
            'info': position,
            'id': id,
            'symbol': this.safeString (position, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'isoldated': false,
            'hedged': undefined,
            'side': position['side'] === '1' ? 'long' : 'short',
            'contracts': this.safeNumber (position, 'balance'),
            'contractSize': undefined,
            'entryPrice': this.safeNumber (position, 'avgEntryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'leverage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': undefined,
            'liquidationPrice': undefined,
            'marginMode': 'cross',
            'marginRatio': undefined,
            'percentage': undefined,
        };
    }

    async fetchFundingRates (symbols = undefined, params = {}) {
        /**
         * @method
         * @name derivadex#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @param {[string]|undefined} symbols list of unified market symbols
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rates-structure}, indexe by market symbols
         */
        const response = await (this as any).publicGetMarkets ();
        response['value'].forEach ((rate) => {
            rate.timestamp = response['timestamp'] * 1000;
        });
        const rates = this.parseFundingRates (response['value'], symbols);
        return this.filterByArray (rates, 'symbol', symbols);
    }

    async fetchFundingRate (symbol, params = {}) {
        /**
         * @method
         * @name derivadex#fetchFundingRate
         * @description fetch the current funding rate
         * @param {string} symbol unified market symbol
         * @param {object} params extra parameters specific to the derivadex api endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/en/latest/manual.html#funding-rate-structure}
         */
        const response = await (this as any).publicGetMarkets ({ 'symbol': symbol });
        response['value'].forEach ((rate) => {
            rate.timestamp = response['timestamp'] * 1000;
        });
        return this.parseFundingRates (response['value']);
    }

    parseFundingRate (contract, market = undefined) {
        // {"market":"ETHPERP","volume":"656.06","price":"1641.84","fundingRate":"0"}
        const timestamp = this.safeNumber (contract, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        return {
            'info': contract,
            'symbol': this.safeString (contract, 'market'),
            'markPrice': this.safeNumber (contract, 'price'),
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': datetime,
            'fundingRate': this.safeString (contract, 'fundingRate'),
            'fundingTimestamp': timestamp,
            'fundingDatetime': datetime,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchOpenInterest (symbol, params = {}) {
        /**
         * @method
         * @name derivadex#fetchOpenInterest
         * @description Retrieves the open interest of a market
         * @param {string} symbol Unified CCXT market symbol
         * @param {object} params exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/en/latest/manual.html#interest-history-structure}
        */
        const response = await (this as any).publicGetMarkets ({ 'symbol': symbol });
        response['value'].forEach ((rate) => {
            rate.timestamp = response['timestamp'] * 1000;
        });
        return this.parseOpenInterest (response['value'][0]);
    }

    parseOpenInterest (interest, market = undefined) {
        // {"market":"ETHPERP","volume":"0","price":"1569.09","fundingRate":"-0.004289023570273825","openInterest":"0.02"}
        const timestamp = this.safeNumber (interest, 'timestamp');
        const datetime = this.iso8601 (timestamp);
        const openInterestAmount = this.safeNumber (interest, 'openInterest');
        const price = this.safeNumber (interest, 'price');
        return {
            'symbol': this.safeString (interest, 'market'),
            'openInterestAmount': openInterestAmount,
            'openInterestValue': openInterestAmount * price,
            'timestamp': timestamp,
            'datetime': datetime,
            'info': interest,
        };
    }

    sign (path, api = 'stats', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const implodedPath = this.implodeParams (path, params);
        let query = (api === 'v2' ? '' : '/api/') + (api === 'v2' ? '' : this.version) + '/' + implodedPath;
        if (method === 'GET') {
            if (params['orderHash'] !== undefined) {
                let orderHashParam = '';
                for (let i = 0; i < params['orderHash'].length; i++) {
                    orderHashParam += (i > 0 ? '&' : '') + 'orderHash=' + params['orderHash'][i];
                }
                query += '?' + orderHashParam;
            }
            if (params['fillReason'] !== undefined) {
                let fillReasonParam = '';
                for (let i = 0; i < params['fillReason'].length; i++) {
                    fillReasonParam += (i > 0 ? '&' : '') + 'fillReason=' + params['fillReason'][i];
                }
                query += params['orderHash'] !== undefined ? '&' : '?';
                query += fillReasonParam;
            }
            if (Object.keys (params).length && params['fillReason'] === undefined && params['orderHash'] === undefined) {
                delete params['orderHash'];
                delete params['fillReason'];
                query += '?' + this.urlencode (params);
            }
        } else {
            const format = this.safeString (params, '_format');
            if (format !== undefined) {
                query += '?' + this.urlencode ({ '_format': format });
                params = this.omit (params, '_format');
            }
        }
        const url = this.urls['api'][api] + query;
        if (api === 'public' || api === 'v2') {
            headers = {
                'Content-Type': 'application/json',
            };
            if (method === 'POST') {
                body = params;
                headers = {
                    'Content-Type': 'application/octet-stream',
                };
                return { 'url': url, 'method': method, 'body': body, 'headers': headers };
            }
            if (method === 'PUT' || method === 'DELETE') {
                if (Object.keys (params).length) {
                    body = this.json (params);
                }
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
