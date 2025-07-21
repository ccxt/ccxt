
// ---------------------------------------------------------------------------

import Exchange from './abstract/backpack.js';
import { } from './base/errors.js';
import type { Currencies, Dict } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class backpack
 * @augments Exchange
 */
export default class backpack extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'backpack',
            'name': 'Backpack',
            'countries': [ 'JP' ], // Japan
            'rateLimit': 50, // 20 times per second
            'version': 'v1',
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelWithdraw': false,
                'closePosition': false,
                'createConvertTrade': false,
                'createDepositAddress': false,
                'createLimitBuyOrder': false,
                'createLimitSellOrder': false,
                'createMarketBuyOrder': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrder': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrders': false,
                'createOrderWithTakeProfitAndStopLoss': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopLossOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'createTakeProfitOrder': false,
                'createTrailingAmountOrder': false,
                'createTrailingPercentOrder': false,
                'createTriggerOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchConvertCurrencies': false,
                'fetchConvertQuote': false,
                'fetchConvertTrade': false,
                'fetchConvertTradeHistory': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarginAdjustmentHistory': false,
                'fetchMarginMode': false,
                'fetchMarkets': false,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15': '15m',
                '30': '30m',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '12h': '12H',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
                '1M': '1M',
            },
            'urls': {
                'logo': '',
                'api': {
                    'public': 'https://api.backpack.exchange',
                    'private': 'https://api.backpack.exchange',
                },
                'www': 'https://backpack.exchange/',
                'doc': 'https://docs.backpack.exchange/',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/assets': 1, // done
                        'api/v1/collateral': 1,
                        'api/v1/borrowLend/markets': 1,
                        'api/v1/borrowLend/markets/history': 1,
                        'api/v1/markets': 1,
                        'api/v1/market': 1,
                        'api/v1/ticker': 1,
                        'api/v1/tickers': 1,
                        'api/v1/depth': 1,
                        'api/v1/klines': 1,
                        'api/v1/markPrices': 1,
                        'api/v1/openInterest': 1,
                        'api/v1/fundingRates': 1,
                        'api/v1/status1': 1,
                        'api/v1/ping': 1,
                        'api/v1/time': 1,
                        'api/v1/wallets': 1,
                        'api/v1/trades': 1,
                        'api/v1/trades/history': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/v1/account': 1,
                        'api/v1/account/limits/borrow': 1,
                        'api/v1/account/limits/order': 1,
                        'api/v1/account/limits/withdrawal': 1,
                        'api/v1/borrowLend/positions': 1,
                        'api/v1/capital': 1,
                        'api/v1/capital/collateral': 1,
                        'wapi/v1/capital/deposits': 1,
                        'wapi/v1/capital/deposit/address': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/position': 1,
                        'wapi/v1/history/borrowLend': 1,
                        'wapi/v1/history/interest': 1,
                        'wapi/v1/history/borrowLend/positions': 1,
                        'wapi/v1/history/dust': 1,
                        'wapi/v1/history/fills': 1,
                        'wapi/v1/history/funding': 1,
                        'wapi/v1/history/orders': 1,
                        'wapi/v1/history/pnl': 1,
                        'wapi/v1/history/rfq': 1,
                        'wapi/v1/history/quote': 1,
                        'wapi/v1/history/settlement': 1,
                        'wapi/v1/history/strategies': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                    },
                    'post': {
                        'api/v1/account/convertDust': 1,
                        'api/v1/borrowLend': 1,
                        'wapi/v1/capital/withdrawals': 1,
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                        'api/v1/rfq': 1,
                        'api/v1/rfq/accept': 1,
                        'api/v1/rfq/refresh': 1,
                        'api/v1/rfq/cancel': 1,
                        'api/v1/rfq/quote': 1,
                    },
                    'delete': {
                        'api/v1/order': 1,
                        'api/v1/orders': 1,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'options': {
                'brokerId': '',
                'currencyIdsListForParseMarket': undefined,
                'broker': '',
                'networks': {
                    'Solana': 'SOL',
                    'Sui': 'SUI',
                    'Ethereum': 'ERC20',
                    'Story': 'STORY',
                    'Eclipse': 'ECLIPSE',
                    'Arbitrum': 'ARB',
                    'Base': 'BASE',
                    'Optimism': 'OPTIMISM',
                    'Polygon': 'MATIC',
                    'XRP': 'XRP',
                    'Cardano': 'ADA',
                    'Hyperliquid': 'HYP',
                    'Tron': 'TRC20',
                    'Dogecoin': 'DOGE',
                    'Bitcoin': 'BTC',
                    'Berachain': 'BERA',
                },
                'networksById': {},
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {},
                'broad': {},
            },
        });
    }

    /**
     * @method
     * @name backpack#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.backpack.exchange/#tag/Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetApiV1Assets (params);
        //
        //     [
        //         {
        //             "coingeckoId": "jito-governance-token",
        //             "displayName": "Jito",
        //             "symbol": "JTO",
        //             "tokens": [
        //                 {
        //                     "blockchain": "Solana",
        //                     "contractAddress": "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
        //                     "depositEnabled": true,
        //                     "displayName": "Jito",
        //                     "maximumWithdrawal": null,
        //                     "minimumDeposit": "0.29",
        //                     "minimumWithdrawal": "0.58",
        //                     "withdrawEnabled": true,
        //                     "withdrawalFee": "0.29"
        //                 }
        //             ]
        //         }
        //         ...
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const currecy = response[i];
            const currencyId = this.safeString (currecy, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const networks = this.safeList (currecy, 'tokens', []);
            const parsedNetworks: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'blockchain');
                const networkCode = this.networkCodeToId (networkId);
                parsedNetworks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'limits': {
                        'withdraw': {
                            'min': this.safeNumber (network, 'minimumWithdrawal'),
                            'max': this.parseNumber (this.omitZero (this.safeString (network, 'maximumWithdrawal'))),
                        },
                        'deposit': {
                            'min': this.safeNumber (network, 'minimumDeposit'),
                            'max': undefined,
                        },
                    },
                    'active': undefined,
                    'deposit': this.safeBool (network, 'depositEnabled'),
                    'withdraw': this.safeBool (network, 'withdrawEnabled'),
                    'fee': this.safeNumber (network, 'withdrawalFee'),
                    'precision': undefined,
                    'info': network,
                };
            }
            result[code] = this.safeCurrencyStructure ({
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': undefined,
                'name': this.safeString (currecy, 'displayName'),
                'active': undefined,
                'deposit': this.safeBool (networks, 'depositEnabled'),
                'withdraw': this.safeBool (networks, 'withdrawEnabled'),
                'fee': undefined,
                'limits': {
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': parsedNetworks,
                'info': currecy,
            });
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + path;
        if (method === 'GET') {
            const query = this.urlencode (params);
            if (query.length !== 0) {
                endpoint += '?' + query;
            }
        }
        const url = this.urls['api'][api] + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
