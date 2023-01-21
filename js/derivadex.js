'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
// const { AuthenticationError, BadRequest, DDoSProtection, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidOrder, OrderNotFound, PermissionDenied, ArgumentsRequired, BadSymbol } = require ('./base/errors');
// const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class derivadex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'derivadex',
            'name': 'DerivaDEX',
            'countries': [ 'SG' ], // Singapore
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
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': true,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchDepositAddress': true,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
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
                'fetchTransactions': true,
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
                '1h': '1h',
                '1d': '1d',
            },
            'urls': {
                'test': {
                    'public': 'https://beta.derivadex.io',
                    'private': 'https://beta.derivadex.io',
                    'stats': 'https://beta.derivadex.io/stats',
                    'v2': 'https://beta.derivadex.io/v2',
                },
                'logo': 'https://gitlab.com/dexlabs/assets/-/raw/main/light-round.png',
                'api': {
                    'public': 'https://exchange.derivadex.com',
                    'private': 'https://exchange.derivadex.com',
                    'stats': 'https://exchange.derivadex.com/stats',
                    'v2': 'https://exchange.derivadex.com/v2',
                },
                'www': 'https://exchange.derivadex.com',
                'doc': [
                    'https://docs.derivadex.io',
                    'http://api.derivadex.io/',
                    'https://exchange.derivadex.com/api-docs',
                ],
                'fees': 'https://docs.derivadex.io/trading/fees',
            },
            'api': {
                'public': {
                    'get': {
                        // TODO: FIX THE API COSTS
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
                        'specs/{kind}': 1,
                        'strategies': 1,
                        'startegy_updates': 1,
                        'trader_updates': 1,
                        'traders': 1,
                        'tx_logs': 1,
                        'aggregations/collateral': 1,
                        'aggregations/volume': 1,
                    },
                },
                'private': {
                    'get': {
                        'apiKey': 5,
                    },
                    'post': {
                        'apiKey': 5,
                    },
                },
            },
            // TODO: FILL OUT EXCEPTIONS
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultType': 'swap',
                'defaultNetwork': 'ERC20',
                'networks': {
                    'ETH': 'ERC20',
                },
                'networksById': {
                    'btc': 'BTC',
                    'eth': 'ERC20',
                    'bsc': 'BSC',
                    'tron': 'TRX',
                    'avax': 'AVAX',
                    'near': 'NEAR',
                    'xtz': 'XTZ',
                    'dot': 'DOT',
                    'sol': 'SOL',
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
        const response = await this.publicGetSpecsKind (params);
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
        const result = [];
        const markets = response['value'];
        const id = this.safeString (market, 'name');
        // const baseId =
        return [
            {
                'id': 'BTCPERP',
                'symbol': 'BTC/USD',
                'base': 'BTC',
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': 'btc',
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
                    'amount': '0.0001',
                    'price': '0.1',
                    'quote': '0.0001',
                },
                'limits': {
                    'leverage': {
                        'min': 1,
                        'max': 3,
                    },
                    'amount': {
                        'min': 0.00001,
                        'max': undefined,
                    },
                    'price': {
                        'min': 1,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': 1000000,
                    },
                },
                'info': markets,
            },
            {
                'id': 'ETHPERP',
                'symbol': 'ETH/USD',
                'base': 'ETH',
                'quote': 'USD',
                'settle': 'USDC',
                'baseId': 'eth',
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
                    'amount': '0.0001',
                    'price': '0.1',
                    'quote': '0.0001',
                },
                'limits': {
                    'leverage': {
                        'min': 1,
                        'max': 3,
                    },
                    'amount': {
                        'min': 0.0001,
                        'max': undefined,
                    },
                    'price': {
                        'min': 0.1,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': 1000000,
                    },
                },
                'info': markets,
            }
        ];
    }
};
