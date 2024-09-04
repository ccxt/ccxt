
// ---------------------------------------------------------------------------

import Exchange from './abstract/coincatch.js';
import { ArgumentsRequired, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import type { Balances, Bool, Currency, Currencies, Dict, FundingRate, FundingRateHistory, Int, Market, OHLCV, OrderBook, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class coincatch
 * @augments Exchange
 */
export default class coincatch extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coincatch',
            'name': 'CoinCatch',
            'countries': [ 'VG' ], // British Virgin Islands
            'rateLimit': 50, // 20 times per second
            'version': 'v1',
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
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
                'createMarketBuyOrderWithCost': false,
                'createMarketOrder': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createOrderWithTakeProfitAndStopLoss': false,
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
                'fetchBalance': true,
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
                'fetchDeposits': true,
                'fetchDepositsWithdrawals': false,
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
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
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
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': true,
                'reduceMargin': false,
                'sandbox': false,
                'setLeverage': false,
                'setMargin': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': true,
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
                    'public': 'https://api.coincatch.com',
                    'private': 'https://api.coincatch.com',
                },
                'www': 'https://www.coincatch.com/',
                'doc': 'https://coincatch.github.io/github.io/en/',
                'fees': 'https://www.coincatch.com/en/rate/',
                'referral': '',
            },
            'api': {
                'public': {
                    'get': {
                        'api/spot/v1/public/time': 1,
                        'api/spot/v1/public/currencies': 20 / 3,
                        'api/spot/v1/market/ticker': 1,
                        'api/spot/v1/market/tickers': 1,
                        'api/spot/v1/market/fills': 2,
                        'api/spot/v1/market/fills-history': 2,
                        'api/spot/v1/market/candles': 1,
                        'api/spot/v1/market/history-candles': 1,
                        'api/spot/v1/market/depth': 1,
                        'api/spot/v1/market/merge-depth': 1,
                        'api/mix/v1/market/contracts': 1,
                        'api/mix/v1/market/merge-depth': 1,
                        'api/mix/v1/market/depth': 1,
                        'api/mix/v1/market/ticker': 1,
                        'api/mix/v1/market/tickers': 1,
                        'api/mix/v1/market/fills': 1,
                        'api/mix/v1/market/fills-history': 1,
                        'api/mix/v1/market/candles': 1,
                        'pi/mix/v1/market/index': 1,
                        'api/mix/v1/market/funding-time': 1,
                        'api/mix/v1/market/history-fundRate': 1,
                        'api/mix/v1/market/current-fundRate': 1,
                        'api/mix/v1/market/open-interest': 1,
                        'api/mix/v1/market/mark-price': 1,
                        'api/mix/v1/market/symbol-leverage': 1,
                        'api/mix/v1/market/queryPositionLever': 1,
                    },
                },
                'private': {
                    'get': {
                        'api/spot/v1/wallet/deposit-address': 4,
                        'pi/spot/v1/wallet/withdrawal-list': 1,
                        'api/spot/v1/wallet/withdrawal-list-v2': 1,
                        'api/spot/v1/wallet/deposit-list': 1,
                        'api/spot/v1/account/getInfo': 1,
                        'api/spot/v1/account/assets': 2,
                        'api/spot/v1/account/transferRecords': 1,
                        'api/mix/v1/account/account': 1,
                        'api/mix/v1/account/accounts': 1,
                        'api/mix/v1/position/singlePosition-v2': 1,
                        'api/mix/v1/position/allPosition-v2': 1,
                        'api/mix/v1/account/accountBill': 1,
                        'api/mix/v1/account/accountBusinessBill': 1,
                        'api/mix/v1/order/current': 1,
                        'api/mix/v1/order/marginCoinCurrent': 1,
                        'api/mix/v1/order/history': 1,
                        'api/mix/v1/order/historyProductType': 1,
                        'api/mix/v1/order/detail': 1,
                        'api/mix/v1/order/fills': 1,
                        'api/mix/v1/order/allFills': 1,
                        'api/mix/v1/plan/currentPlan': 1,
                        'api/mix/v1/plan/historyPlan': 1,
                    },
                    'post': {
                        'api/spot/v1/wallet/transfer-v2': 1,
                        'api/spot/v1/wallet/withdrawal-v2': 4,
                        'api/spot/v1/wallet/withdrawal-inner-v2': 1,
                        'api/spot/v1/account/bills': 1,
                        'api/spot/v1/trade/orders': 1,
                        'api/spot/v1/trade/batch-orders': 1,
                        'api/spot/v1/trade/cancel-order': 1,
                        'api/spot/v1/trade/cancel-order-v2': 1,
                        'api/spot/v1/trade/cancel-symbol-orders': 1,
                        'api/spot/v1/trade/cancel-batch-orders': 1,
                        'api/spot/v1/trade/cancel-batch-orders-v2': 1,
                        'api/spot/v1/trade/orderInfo': 1,
                        'api/spot/v1/trade/open-orders': 1,
                        'api/spot/v1/trade/history': 1,
                        'api/spot/v1/trade/fills': 1,
                        'api/spot/v1/plan/placePlan': 1,
                        'api/spot/v1/plan/modifyPlan': 1,
                        'api/spot/v1/plan/cancelPlan': 1,
                        'api/spot/v1/plan/currentPlan': 1,
                        'api/spot/v1/plan/historyPlan': 1,
                        'api/spot/v1/plan/batchCancelPlan': 1,
                        'api/mix/v1/account/open-count': 1,
                        'api/mix/v1/account/setLeverage': 1,
                        'api/mix/v1/account/setMargin': 1,
                        'api/mix/v1/account/setMarginMode': 1,
                        'api/mix/v1/account/setPositionMode': 1,
                        'api/mix/v1/order/cancel-order': 1,
                        'api/mix/v1/order/cancel-batch-orders': 1,
                        'api/mix/v1/order/cancel-symbol-orders': 1,
                        'api/mix/v1/order/cancel-all-orders': 1,
                        'api/mix/v1/plan/placePlan': 1,
                        'api/mix/v1/plan/modifyPlan': 1,
                        'api/mix/v1/plan/modifyPlanPreset': 1,
                        'api/mix/v1/plan/placeTPSL': 1,
                        'api/mix/v1/plan/placeTrailStop': 1,
                        'api/mix/v1/plan/placePositionsTPSL': 1,
                        'api/mix/v1/plan/modifyTPSLPlan': 1,
                        'api/mix/v1/plan/cancelPlan': 1,
                        'api/mix/v1/plan/cancelSymbolPlan': 1,
                        'api/mix/v1/plan/cancelAllPlan': 1,
                    },
                    'put': {
                        'api/v1/userDataStream': 1,
                    },
                    'delete': {
                        'api/v1/spot/order': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'spot': {
                        'tierBased': false,
                        'percentage': true,
                        'feeSide': 'get',
                        'maker': this.parseNumber ('0.001'),
                        'taker': this.parseNumber ('0.001'),
                    },
                },
            },
            'options': {
                'timeframes': {
                    'spot': {
                        '1m': '1min',
                        '5m': '5min',
                        '15m': '15min',
                        '30m': '30min',
                        '1h': '1h',
                        '4h': '4h',
                        '6h': '6h',
                        '12h': '12h',
                        '1d': '1day',
                        '3d': '3day',
                        '1w': '1week',
                        '1M': '1M',
                    },
                    'swap': {
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
                },
                'currencyIdsListForParseMarket': undefined,
                'broker': '',
                'networks': {
                },
                'networksById': {
                    'BITCOIN': 'BTC',
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
                    'TRX(TRC20)': 'TRC20',
                    'BEP20': 'BEP20',
                    'ArbitrumOne': 'ARB', // todo check
                    'Optimism': 'OPTIMISM',
                    'LTC': 'LTC',
                    'BCH': 'BCH',
                    'ETC': 'ETC',
                    'SOL': 'SOL',
                    'NEO3': 'NEO3',
                    'stacks': 'STX',
                    'Elrond': 'EGLD',
                    'NEARProtocol': 'NEAR',
                    'AcalaToken': 'ACA',
                    'Klaytn': 'KLAY',
                    'Fantom': 'FTM',
                    'Terra': 'TERRA',
                    'WAVES': 'WAVES',
                    'TAO': 'TAO',
                    'SUI': 'SUI',
                    'SEI': 'SEI',
                    'THORChain': 'RUNE', // todo check
                    'ZIL': 'ZIL',
                    'Solar': 'SXP', // todo check
                    'FET': 'FET',
                    'C-Chain': 'AVAX', // todo check
                    'XRP': 'XRP',
                    'EOS': 'EOS',
                    'DOGECOIN': 'DOGE',
                    'CAP20': 'CAP20', // todo check
                    'Polygon': 'MATIC',
                    'CSPR': 'CSPR',
                    'Moonbeam': 'GLMR',
                    'MINA': 'MINA',
                    'CFXeSpace': 'CFX', // todo check
                    'CFX': 'CFX',
                    'StratisEVM': 'STRAT', // todo check
                    'Celestia': 'TIA',
                    'ChilizChain': 'ChilizChain', // todo check
                    'Aptos': 'APT',
                    'Ontology': 'ONT',
                    'ICP': 'ICP',
                    'Cardano': 'ADA',
                    'FIL': 'FIL',
                    'CELO': 'CELO',
                    'DOT': 'DOT',
                    'StellarLumens': 'XLM', // todo check
                    'ATOM': 'ATOM',
                    'CronosChain': 'CRO', // todo check
                },
            },
            'commonCurrencies': {},
            'exceptions': {
                'exact': {
                    // {"code":"40034","msg":"Parameter BTCUSDT_UMCBL does not exist","requestTime":1725380736387,"data":null}
                },
                'broad': {},
            },
            'precisionMode': TICK_SIZE,
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name coincatch#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @see https://coincatch.github.io/github.io/en/spot/#get-server-time
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.publicGetApiSpotV1PublicTime (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725046822028,
        //         "data": "1725046822028"
        //     }
        //
        return this.safeInteger (response, 'data');
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name coincatch#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://coincatch.github.io/github.io/en/spot/#get-coin-list
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        const response = await this.publicGetApiSpotV1PublicCurrencies (params);
        const data = this.safeList (response, 'data', []);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725102364202,
        //         "data": [
        //             {
        //                 "coinId": "1",
        //                 "coinName": "BTC",
        //                 "transfer": "true",
        //                 "chains": [
        //                     {
        //                         "chainId": "10",
        //                         "chain": "BITCOIN",
        //                         "needTag": "false",
        //                         "withdrawable": "true",
        //                         "rechargeable": "true",
        //                         "withdrawFee": "0.0005",
        //                         "extraWithDrawFee": "0",
        //                         "depositConfirm": "1",
        //                         "withdrawConfirm": "1",
        //                         "minDepositAmount": "0.00001",
        //                         "minWithdrawAmount": "0.001",
        //                         "browserUrl": "https://blockchair.com/bitcoin/transaction/"
        //                     }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const result: Dict = {};
        const currenciesIds = [];
        for (let i = 0; i < data.length; i++) {
            const currecy = data[i];
            const currencyId = this.safeString (currecy, 'coinName');
            currenciesIds.push (currencyId);
            const code = this.safeCurrencyCode (currencyId);
            let allowDeposit = false;
            let allowWithdraw = false;
            let minDeposit: Str = undefined;
            let minWithdraw: Str = undefined;
            const networks = this.safeList (currecy, 'chains');
            const networksById = this.safeDict (this.options, 'networksById');
            const parsedNetworks: Dict = {};
            for (let j = 0; j < networks.length; j++) {
                const network = networks[j];
                const networkId = this.safeString (network, 'chain');
                const networkName = this.safeString (networksById, networkId, networkId);
                const networkDepositString = this.safeString (network, 'rechargeable');
                const networkDeposit = networkDepositString === 'true';
                const networkWithdrawString = this.safeString (network, 'withdrawable');
                const networkWithdraw = networkWithdrawString === 'true';
                const networkMinDeposit = this.safeString (network, 'minDepositAmount');
                const networkMinWithdraw = this.safeString (network, 'minWithdrawAmount');
                parsedNetworks[networkId] = {
                    'id': networkId,
                    'network': networkName,
                    'limits': {
                        'deposit': {
                            'min': this.parseNumber (networkMinDeposit),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.parseNumber (networkMinWithdraw),
                            'max': undefined,
                        },
                    },
                    'active': networkDeposit && networkWithdraw,
                    'deposit': networkDeposit,
                    'withdraw': networkWithdraw,
                    'fee': this.safeNumber (network, 'withdrawFee'),
                    'precision': undefined,
                    'info': network,
                };
                allowDeposit = allowDeposit ? allowDeposit : networkDeposit;
                allowWithdraw = allowWithdraw ? allowWithdraw : networkWithdraw;
                minDeposit = minDeposit ? Precise.stringMin (networkMinDeposit, minDeposit) : networkMinDeposit;
                minWithdraw = minWithdraw ? Precise.stringMin (networkMinWithdraw, minWithdraw) : networkMinWithdraw;
            }
            result[code] = {
                'id': currencyId,
                'code': code,
                'precision': undefined,
                'type': undefined,
                'name': undefined,
                'active': allowWithdraw && allowDeposit,
                'deposit': allowDeposit,
                'withdraw': allowWithdraw,
                'fee': undefined,
                'limits': {
                    'deposit': {
                        'min': this.parseNumber (minDeposit),
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': this.parseNumber (minWithdraw),
                        'max': undefined,
                    },
                },
                'networks': parsedNetworks,
                'info': currecy,
            };
        }
        if (this.safeList (this.options, 'currencyIdsListForParseMarket') === undefined) {
            this.options['currencyIdsListForParseMarket'] = currenciesIds;
        }
        return result;
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name coincatch#fetchMarkets
         * @description retrieves data on all markets for the exchange
         * @see https://coincatch.github.io/github.io/en/spot/#get-all-tickers
         * @see https://coincatch.github.io/github.io/en/mix/#get-all-symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        let response = await this.publicGetApiSpotV1MarketTickers (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725114040155,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT",
        //                 "high24h": "59461.34",
        //                 "low24h": "57723.23",
        //                 "close": "59056.02",
        //                 "quoteVol": "18240112.23368",
        //                 "baseVol": "309.05564",
        //                 "usdtVol": "18240112.2336744",
        //                 "ts": "1725114038951",
        //                 "buyOne": "59055.85",
        //                 "sellOne": "59057.45",
        //                 "bidSz": "0.0139",
        //                 "askSz": "0.0139",
        //                 "openUtc0": "59126.71",
        //                 "changeUtc": "-0.0012",
        //                 "change": "0.01662"
        //             },
        //             ...
        //         ]
        //     }
        //
        if (this.safeList (this.options, 'currencyIdsListForParseMarket') === undefined) {
            await this.fetchCurrencies ();
        }
        const spotMarkets = this.safeList (response, 'data', []);
        const request: Dict = {};
        let productType: Str = undefined;
        [ productType, params ] = this.handleOptionAndParams (params, 'fetchMarkets', 'productType', productType);
        let swapMarkets = [];
        request['productType'] = 'umcbl';
        response = await this.publicGetApiMixV1MarketContracts (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725297439225,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSDT_UMCBL",
        //                 "makerFeeRate": "0.0002",
        //                 "takerFeeRate": "0.0006",
        //                 "feeRateUpRatio": "0.005",
        //                 "openCostUpRatio": "0.01",
        //                 "quoteCoin": "USDT",
        //                 "baseCoin": "BTC",
        //                 "buyLimitPriceRatio": "0.01",
        //                 "sellLimitPriceRatio": "0.01",
        //                 "supportMarginCoins": [ "USDT" ],
        //                 "minTradeNum": "0.001",
        //                 "priceEndStep": "1",
        //                 "volumePlace": "3",
        //                 "pricePlace": "1",
        //                 "sizeMultiplier": "0.001",
        //                 "symbolType": "perpetual",
        //                 "symbolStatus": "normal",
        //                 "offTime": "-1",
        //                 "limitOpenTime": "-1",
        //                 "maintainTime": "",
        //                 "symbolName": "BTCUSDT",
        //                 "minTradeUSDT": null,
        //                 "maxPositionNum": null,
        //                 "maxOrderNum": null
        //             }
        //         ]
        //     }
        //
        const swapUMCBL = this.safeList (response, 'data', []);
        request['productType'] = 'dmcbl';
        response = await this.publicGetApiMixV1MarketContracts (this.extend (request, params));
        //
        //     {
        //         "code":"00000",
        //         "msg":"success",
        //         "requestTime":1725297439646,
        //         "data":[
        //             {
        //                 "symbol":"BTCUSD_DMCBL",
        //                 "makerFeeRate":"0.0002",
        //                 "takerFeeRate":"0.0006",
        //                 "feeRateUpRatio":"0.005",
        //                 "openCostUpRatio":"0.01",
        //                 "quoteCoin":"USD",
        //                 "baseCoin":"BTC",
        //                 "buyLimitPriceRatio":"0.01",
        //                 "sellLimitPriceRatio":"0.01",
        //                 "supportMarginCoins":[
        //                     "BTC",
        //                     "ETH"
        //                 ],
        //                 "minTradeNum":"0.001",
        //                 "priceEndStep":"1",
        //                 "volumePlace":"3",
        //                 "pricePlace":"1",
        //                 "sizeMultiplier":"0.001",
        //                 "symbolType":"perpetual",
        //                 "symbolStatus":"normal",
        //                 "offTime":"-1",
        //                 "limitOpenTime":"-1",
        //                 "maintainTime":"",
        //                 "symbolName":"BTCUSD",
        //                 "minTradeUSDT":null,
        //                 "maxPositionNum":null,
        //                 "maxOrderNum":null
        //             }
        //         ]
        //     }
        const swapDMCBL = this.safeList (response, 'data', []);
        swapMarkets = this.arrayConcat (swapUMCBL, swapDMCBL);
        const markets = this.arrayConcat (spotMarkets, swapMarkets);
        return this.parseMarkets (markets);
    }

    parseMarket (market: Dict): Market {
        //
        // spot
        //     {
        //         "symbol": "BTCUSDT",
        //         "high24h": "59461.34",
        //         "low24h": "57723.23",
        //         "close": "59056.02",
        //         "quoteVol": "18240112.23368",
        //         "baseVol": "309.05564",
        //         "usdtVol": "18240112.2336744",
        //         "ts": "1725114038951",
        //         "buyOne": "59055.85",
        //         "sellOne": "59057.45",
        //         "bidSz": "0.0139",
        //         "askSz": "0.0139",
        //         "openUtc0": "59126.71",
        //         "changeUtc": "-0.0012",
        //         "change": "0.01662"
        //     },
        //
        // swap
        //     {
        //         "symbol": "BTCUSDT_UMCBL",
        //         "makerFeeRate": "0.0002",
        //         "takerFeeRate": "0.0006",
        //         "feeRateUpRatio": "0.005",
        //         "openCostUpRatio": "0.01",
        //         "quoteCoin": "USDT",
        //         "baseCoin": "BTC",
        //         "buyLimitPriceRatio": "0.01",
        //         "sellLimitPriceRatio": "0.01",
        //         "supportMarginCoins": [ "USDT" ],
        //         "minTradeNum": "0.001",
        //         "priceEndStep": "1",
        //         "volumePlace": "3",
        //         "pricePlace": "1",
        //         "sizeMultiplier": "0.001",
        //         "symbolType": "perpetual",
        //         "symbolStatus": "normal",
        //         "offTime": "-1",
        //         "limitOpenTime": "-1",
        //         "maintainTime": "",
        //         "symbolName": "BTCUSDT",
        //         "minTradeUSDT": null,
        //         "maxPositionNum": null,
        //         "maxOrderNum": null
        //     }
        //
        let marketId = this.safeString (market, 'symbol');
        const tradingFees = this.safeDict (this.fees, 'trading');
        const fees = this.safeDict (tradingFees, 'spot');
        let baseId = this.safeString (market, 'baseCoin');
        let quoteId = this.safeString (market, 'quoteCoin');
        let settleId: Str = undefined;
        let suffix = '';
        let settle: Str = undefined;
        let type = 'spot';
        let isLinear: Bool = undefined;
        const isSpot = baseId === undefined; // for now spot markets have no properties baseCoin and quoteCoin
        if (isSpot) {
            const parsedMarketId = this.parseSpotMarketId (marketId);
            baseId = this.safeString (parsedMarketId, 'baseId');
            quoteId = this.safeString (parsedMarketId, 'quoteId');
            marketId += '_SPBL'; // spot markets should have current suffix
        } else {
            type = 'swap';
            fees['taker'] = this.safeNumber (market, 'takerFeeRate');
            fees['maker'] = this.safeNumber (market, 'makerFeeRate');
            const supportMarginCoins = this.safeList (market, 'supportMarginCoins', []);
            settleId = this.safeString (supportMarginCoins, 0); // todo check for _DMCBL
            settle = this.safeCurrencyCode (settleId);
            suffix = ':' + settle;
            isLinear = true; // todo check
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = base + '/' + quote + suffix;
        const symbolStatus = this.safeString (market, 'symbolStatus');
        const active = symbolStatus ? (symbolStatus === 'normal') : undefined;
        const volumePlace = this.safeString (market, 'volumePlace');
        const amountPrecisionString = this.parsePrecision (volumePlace);
        const pricePlace = this.safeString (market, 'pricePlace');
        const priceEndStep = this.safeString (market, 'priceEndStep');
        const pricePrecisionString = Precise.stringMul (this.parsePrecision (pricePlace), priceEndStep);
        return this.safeMarketStructure ({
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': active,
            'type': type,
            'subType': isSpot ? undefined : 'linear', // todo check
            'spot': isSpot,
            'margin': isSpot ? false : undefined, // todo check
            'swap': !isSpot,
            'future': false,
            'option': false,
            'contract': !isSpot,
            'settle': settle,
            'settleId': settleId,
            'contractSize': this.safeNumber (market, 'sizeMultiplier'),
            'linear': isLinear,
            'inverse': isSpot ? undefined : (!isLinear),
            'taker': this.safeNumber (fees, 'taker'),
            'maker': this.safeNumber (fees, 'maker'),
            'percentage': this.safeBool (fees, 'percentage'),
            'tierBased': this.safeBool (fees, 'tierBased'),
            'feeSide': this.safeString (fees, 'feeSide'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (amountPrecisionString),
                'price': this.parseNumber (pricePrecisionString),
            },
            'limits': {
                'amount': {
                    'min': this.safeNumber (market, 'minTradeNum'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        });
    }

    parseSpotMarketId (marketId) {
        let baseId = undefined;
        let quoteId = undefined;
        const currencyIds = this.safeList (this.options, 'currencyIdsListForParseMarket', []);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const entryIndex = marketId.indexOf (currencyId);
            if (entryIndex > -1) {
                const restId = marketId.replace (currencyId, '');
                if (entryIndex === 0) {
                    baseId = currencyId;
                    quoteId = restId;
                } else {
                    baseId = restId;
                    quoteId = currencyId;
                }
                break;
            }
        }
        const result: Dict = {
            'baseId': baseId,
            'quoteId': quoteId,
        };
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name coincatch#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://coincatch.github.io/github.io/en/spot/#get-single-ticker
         * @see https://coincatch.github.io/github.io/en/mix/#get-single-symbol-ticker
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiSpotV1MarketTicker (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725132487751,
            //         "data": {
            //             "symbol": "ETHUSDT",
            //             "high24h": "2533.76",
            //             "low24h": "2492.72",
            //             "close": "2499.76",
            //             "quoteVol": "21457850.7442",
            //             "baseVol": "8517.1869",
            //             "usdtVol": "21457850.744163",
            //             "ts": "1725132487476",
            //             "buyOne": "2499.75",
            //             "sellOne": "2499.76",
            //             "bidSz": "0.5311",
            //             "askSz": "4.5806",
            //             "openUtc0": "2525.69",
            //             "changeUtc": "-0.01027",
            //             "change": "-0.00772"
            //         }
            //     }
            //
        } else if (market['swap']) {
            response = await this.publicGetApiMixV1MarketTicker (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725316687174,
            //         "data": {
            //             "symbol": "ETHUSDT_UMCBL",
            //             "last": "2540.6",
            //             "bestAsk": "2540.71",
            //             "bestBid": "2540.38",
            //             "bidSz": "12.1",
            //             "askSz": "20",
            //             "high24h": "2563.91",
            //             "low24h": "2398.3",
            //             "timestamp": "1725316687177",
            //             "priceChangePercent": "0.01134",
            //             "baseVolume": "706928.96",
            //             "quoteVolume": "1756401737.8766",
            //             "usdtVolume": "1756401737.8766",
            //             "openUtc": "2424.49",
            //             "chgUtc": "0.04789",
            //             "indexPrice": "2541.977142",
            //             "fundingRate": "0.00006",
            //             "holdingAmount": "144688.49",
            //             "deliveryStartTime": null,
            //             "deliveryTime": null,
            //             "deliveryStatus": "normal"
            //         }
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + 'fetchTicker() is not supported for ' + market['type'] + ' type of markets');
        }
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coincatch#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://coincatch.github.io/github.io/en/spot/#get-all-tickers
         * @see https://coincatch.github.io/github.io/en/mix/#get-all-symbol-ticker
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.type] 'spot' or 'swap' (default 'spot')
         * @param {string} [params.productType] 'umcbl' or 'dmcbl' (default 'umcbl') - USDT perpetual contract or Universal margin perpetual contract
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const methodName = 'fetchTickers';
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, true);
        const market = this.getMarketFromSymbols (symbols);
        let marketType = 'spot';
        [ marketType, params ] = this.handleMarketTypeAndParams (methodName, market, params, marketType);
        let response = undefined;
        if (marketType === 'spot') {
            response = await this.publicGetApiSpotV1MarketTickers (params);
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725114040155,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT",
            //                 "high24h": "59461.34",
            //                 "low24h": "57723.23",
            //                 "close": "59056.02",
            //                 "quoteVol": "18240112.23368",
            //                 "baseVol": "309.05564",
            //                 "usdtVol": "18240112.2336744",
            //                 "ts": "1725114038951",
            //                 "buyOne": "59055.85",
            //                 "sellOne": "59057.45",
            //                 "bidSz": "0.0139",
            //                 "askSz": "0.0139",
            //                 "openUtc0": "59126.71",
            //                 "changeUtc": "-0.0012",
            //                 "change": "0.01662"
            //             },
            //             ...
            //         ]
            //     }
            //
        } else if (marketType === 'swap') {
            let productType = 'umcbl';
            [ productType, params ] = this.handleOptionAndParams (params, methodName, 'productType', productType);
            const request: Dict = {
                'productType': productType,
            };
            response = await this.publicGetApiMixV1MarketTickers (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725320291340,
            //         "data": [
            //             {
            //                 "symbol": "BTCUSDT_UMCBL",
            //                 "last": "59110.5",
            //                 "bestAsk": "59113.2",
            //                 "bestBid": "59109.5",
            //                 "bidSz": "1.932",
            //                 "askSz": "0.458",
            //                 "high24h": "59393.5",
            //                 "low24h": "57088.5",
            //                 "timestamp": "1725320291347",
            //                 "priceChangePercent": "0.01046",
            //                 "baseVolume": "59667.001",
            //                 "quoteVolume": "3472522256.9927",
            //                 "usdtVolume": "3472522256.9927",
            //                 "openUtc": "57263",
            //                 "chgUtc": "0.03231",
            //                 "indexPrice": "59151.25442",
            //                 "fundingRate": "0.00007",
            //                 "holdingAmount": "25995.377",
            //                 "deliveryStartTime": null,
            //                 "deliveryTime": null,
            //                 "deliveryStatus": "normal"}
            //             },
            //             ...
            //         ]
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + marketType + ' type of markets');
        }
        const data = this.safeList (response, 'data', []);
        return this.parseTickers (data, symbols);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // spot
        //     {
        //         "symbol": "BTCUSDT",
        //         "high24h": "59461.34",
        //         "low24h": "57723.23",
        //         "close": "59056.02",
        //         "quoteVol": "18240112.23368",
        //         "baseVol": "309.05564",
        //         "usdtVol": "18240112.2336744",
        //         "ts": "1725114038951",
        //         "buyOne": "59055.85",
        //         "sellOne": "59057.45",
        //         "bidSz": "0.0139",
        //         "askSz": "0.0139",
        //         "openUtc0": "59126.71",
        //         "changeUtc": "-0.0012",
        //         "change": "0.01662"
        //     }
        //
        // swap
        //     {
        //         "symbol": "ETHUSDT_UMCBL",
        //         "last": "2540.6",
        //         "bestAsk": "2540.71",
        //         "bestBid": "2540.38",
        //         "bidSz": "12.1",
        //         "askSz": "20",
        //         "high24h": "2563.91",
        //         "low24h": "2398.3",
        //         "timestamp": "1725316687177",
        //         "priceChangePercent": "0.01134",
        //         "baseVolume": "706928.96",
        //         "quoteVolume": "1756401737.8766",
        //         "usdtVolume": "1756401737.8766",
        //         "openUtc": "2424.49",
        //         "chgUtc": "0.04789",
        //         "indexPrice": "2541.977142",
        //         "fundingRate": "0.00006",
        //         "holdingAmount": "144688.49",
        //         "deliveryStartTime": null,
        //         "deliveryTime": null,
        //         "deliveryStatus": "normal"
        //     }
        //
        const timestamp = this.safeInteger2 (ticker, 'ts', 'timestamp');
        let marketId = this.safeString (ticker, 'symbol', '');
        if (marketId.indexOf ('_') < 0) {
            marketId += '_SPBL'; // spot markets from tickers endpoints have no suffix specific for market id
        }
        market = this.safeMarket (marketId, market);
        const last = this.safeString2 (ticker, 'close', 'last');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString2 (ticker, 'buyOne', 'bestBid'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString2 (ticker, 'sellOne', 'bestAsk'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': undefined, // todo check
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined, // todo check
            'percentage': this.safeString2 (ticker, 'change', 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'baseVol', 'baseVolume'),
            'quoteVolume': this.safeString2 (ticker, 'quoteVol', 'quoteVolume'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coincatch#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coincatch.github.io/github.io/en/spot/#get-merged-depth-data
         * @see https://coincatch.github.io/github.io/en/mix/#get-merged-depth-data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (maximum and default value is 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.precision] 'scale0' (default), 'scale1', 'scale2' or 'scale3' - price accuracy, according to the selected accuracy as the step size to return the cumulative depth
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const methodName = 'fetchOrderBook';
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let precision: Str = undefined;
        [ precision, params ] = this.handleOptionAndParams (params, methodName, 'precision');
        if (precision !== undefined) {
            request['precision'] = precision;
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.publicGetApiSpotV1MarketMergeDepth (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725137170814,
            //         "data": {
            //             "asks": [ [ 2507.07, 0.4248 ] ],
            //             "bids": [ [ 2507.05, 0.1198 ] ],
            //             "ts": "1725137170850",
            //             "scale": "0.01",
            //             "precision": "scale0",
            //             "isMaxPrecision": "NO"
            //         }
            //     }
            //
        } else if (market['swap']) {
            response = await this.publicGetApiMixV1MarketMergeDepth (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + market['type'] + ' type of markets');
        }
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'ts');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coincatch#fetchOHLCV
         * @see https://coincatch.github.io/github.io/en/spot/#get-candle-data
         * @see https://coincatch.github.io/github.io/en/mix/#get-candle-data
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch (default 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {string} [params.price] "mark" for mark price candles
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const methodName = 'fetchOHLCV';
        // todo add pagination
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        const marketType = market['type'];
        const timeframes = this.options['timeframes'][marketType];
        let response = undefined;
        if (market['spot']) {
            request['period'] = this.safeString (timeframes, timeframe, timeframe);
            if (since !== undefined) {
                request['after'] = since;
            }
            if (until !== undefined) {
                request['before'] = until;
            }
            response = await this.publicGetApiSpotV1MarketCandles (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725142465742,
            //         "data": [
            //             {
            //                 "open": "2518.6",
            //                 "high": "2519.19",
            //                 "low": "2518.42",
            //                 "close": "2518.86",
            //                 "quoteVol": "17193.239401",
            //                 "baseVol": "6.8259",
            //                 "usdtVol": "17193.239401",
            //                 "ts": "1725142200000"
            //             },
            //             ...
            //         ]
            //     }
            //
            const data = this.safeList (response, 'data', []);
            return this.parseOHLCVs (data, market, timeframe, since, limit);
        } else if (market['swap']) {
            request['granularity'] = this.safeString (timeframes, timeframe, timeframe);
            if (until === undefined) {
                until = this.milliseconds ();
            }
            if (since === undefined) {
                limit = limit ? limit : 100;
                const duration = this.parseTimeframe (timeframe);
                since = until - (duration * limit * 1000);
            }
            request['startTime'] = since; // since and until are mandatory for swap
            request['endTime'] = until;
            let priceType: Str = undefined;
            [ priceType, params ] = this.handleOptionAndParams (params, methodName, 'price');
            if (priceType === 'mark') {
                request['kLineType'] = 'market mark index';
            }
            response = await this.publicGetApiMixV1MarketCandles (this.extend (request, params));
            //
            //     [
            //         [
            //             "1725379020000",
            //             "57614",
            //             "57636",
            //             "57614",
            //             "57633",
            //             "28.725",
            //             "1655346.493"
            //         ],
            //         ...
            //     ]
            //
            return this.parseOHLCVs (response, market, timeframe, since, limit);
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + market['type'] + ' type of markets');
        }
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger2 (ohlcv, 'ts', 0),
            this.safeNumber2 (ohlcv, 'open', 1),
            this.safeNumber2 (ohlcv, 'high', 2),
            this.safeNumber2 (ohlcv, 'low', 3),
            this.safeNumber2 (ohlcv, 'close', 4),
            this.safeNumber2 (ohlcv, 'baseVol', 5),
        ];
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name coincatch#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://coincatch.github.io/github.io/en/spot/#get-recent-trades
         * @see https://coincatch.github.io/github.io/en/mix/#get-fills
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.tradeId] trade ID to fetch from
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        const methodName = 'fetchTrades';
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        let response = undefined;
        if (market['spot']) {
            if (since !== undefined) {
                request['after'] = since;
            }
            if (until !== undefined) {
                request['before'] = until;
            }
            response = await this.publicGetApiSpotV1MarketFillsHistory (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725198410976,
            //         "data": [
            //             {
            //                 "symbol": "ETHUSDT_SPBL",
            //                 "tradeId": "1214135619719827457",
            //                 "side": "buy",
            //                 "fillPrice": "2458.62",
            //                 "fillQuantity": "0.4756",
            //                 "fillTime": "1725198409967"
            //             }
            //         ]
            //     }
            //
        } else if (market['swap']) {
            if (since !== undefined) {
                request['startTime'] = since;
            }
            if (until !== undefined) {
                request['endTime'] = until;
            }
            response = await this.publicGetApiMixV1MarketFillsHistory (this.extend (request, params));
            //
            //     {
            //         "code": "00000",
            //         "msg": "success",
            //         "requestTime": 1725389251975,
            //         "data": [
            //             {
            //                 "tradeId": "1214936067582234782",
            //                 "price": "57998.5",
            //                 "size": "1.918",
            //                 "side": "Sell",
            //                 "timestamp": "1725389251000",
            //                 "symbol": "BTCUSDT_UMCBL"
            //             },
            //             ...
            //         ]
            //     }
            //
        } else {
            throw new NotSupported (this.id + ' ' + methodName + '() is not supported for ' + market['type'] + ' type of markets');
        }
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // fetchTrades spot
        //     {
        //         "symbol": "ETHUSDT_SPBL",
        //         "tradeId": "1214135619719827457",
        //         "side": "Buy",
        //         "fillPrice": "2458.62",
        //         "fillQuantity": "0.4756",
        //         "fillTime": "1725198409967"
        //     }
        //
        // fetchTrades swap
        //     {
        //         "tradeId": "1214936067582234782",
        //         "price": "57998.5",
        //         "size": "1.918",
        //         "side": "Sell",
        //         "timestamp": "1725389251000",
        //         "symbol": "BTCUSDT_UMCBL"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        market = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger2 (trade, 'fillTime', 'timestamp');
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString2 (trade, 'fillPrice', 'price'),
            'amount': this.safeString2 (trade, 'fillQuantity', 'size'),
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    async fetchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        /**
         * @method
         * @name coincatch#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://coincatch.github.io/github.io/en/mix/#get-current-funding-rate
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const parts = marketId.split ('_');
        const request: Dict = {
            'symbol': marketId,
            'productType': this.safeString (parts, 1),
        };
        const response = await this.publicGetApiMixV1MarketCurrentFundRate (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725402130395,
        //         "data": {
        //             "symbol": "BTCUSDT_UMCBL",
        //             "fundingRate": "0.000043"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        return this.parseFundingRate (data, market);
    }

    parseFundingRate (contract, market: Market = undefined) {
        const marketId = this.safeString (contract, 'symbol');
        market = this.safeMarket (marketId, market, undefined, 'swap');
        const fundingRate = this.safeNumber (contract, 'fundingRate');
        return {
            'info': contract,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    handleOptionParamsAndRequest (params: object, methodName: string, optionName: string, request: object, requestProperty: string, defaultValue = undefined) {
        const [ option, paramsOmited ] = this.handleOptionAndParams (params, methodName, optionName, defaultValue);
        if (option !== undefined) {
            request[requestProperty] = option;
        }
        return [ request, paramsOmited ];
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name coincatch#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://coincatch.github.io/github.io/en/mix/#get-history-funding-rate
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of entries to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        const methodName = 'fetchFundingRateHistory';
        await this.loadMarkets ();
        const timeframe = '8h';
        const maxEntriesPerRequest = 100;
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, methodName, 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic (methodName, symbol, since, limit, timeframe, params, maxEntriesPerRequest) as FundingRateHistory[];
        }
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        if (since !== undefined) {
            const timeDelta = this.milliseconds () - since;
            const duration = this.parseTimeframe (timeframe);
            const pageNo = this.parseToInt (timeDelta / (duration * maxEntriesPerRequest * 1000));
            request['pageNo'] = pageNo;
        }
        if (limit !== undefined) {
            request['pageSize'] = limit;
        }
        const response = await this.publicGetApiMixV1MarketHistoryFundRate (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725455810888,
        //         "data": [
        //             {
        //                 "symbol": "BTCUSD",
        //                 "fundingRate": "0.000635",
        //                 "settleTime": "1724889600000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'settleTime');
            rates.push ({
                'info': entry,
                'symbol': this.safeSymbol (this.safeString (entry, 'symbol'), market, undefined, 'swap'),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySinceLimit (sorted, since, limit) as FundingRateHistory[];
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name coincatch#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://coincatch.github.io/github.io/en/spot/#get-account-assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateGetApiSpotV1AccountAssets (params);
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725202685986,
        //         "data": [
        //             {
        //                 "coinId": 2,
        //                 "coinName": "USDT",
        //                 "available": "99.20000000",
        //                 "frozen": "0.00000000",
        //                 "lock": "0.00000000",
        //                 "uTime": "1724938746000"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseBalance (data);
    }

    parseBalance (balances): Balances {
        //
        //     {
        //         "coinId": 2,
        //         "coinName": "USDT",
        //         "available": "99.20000000",
        //         "frozen": "0.00000000",
        //         "lock": "0.00000000",
        //         "uTime": "1724938746000"
        //     }
        //
        const result: Dict = {};
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = this.safeDict (balances, i, {});
            const currencyId = this.safeString (balanceEntry, 'coinName');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeString (balanceEntry, 'available');
            account['used'] = this.safeString (balanceEntry, 'frozen');
            if (account['total'] !== '0' || account['used'] !== '0') {
                result[code] = account;
                result['info'] = balanceEntry;
            }
        }
        return this.safeBalance (result);
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name coincatch#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://coincatch.github.io/github.io/en/spot/#get-coin-address
         * @param {string} code unified currency code
         * @param {string} [params.network] network for fetch deposit address
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
        };
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode === undefined) {
            networkCode = this.defaultNetworkCode (code);
        }
        request['chain'] = this.networkCodeToId (networkCode, code);
        const response = await this.privateGetApiSpotV1WalletDepositAddress (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725210515143,
        //         "data": {
        //             "coin": "USDT",
        //             "address": "TKTUt7qiTaMgnTwZXjE3ZBkPB6LKhLPJyZ",
        //             "chain": "TRC20",
        //             "tag": null,
        //             "url": "https://tronscan.org/#/transaction/"
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        const depositAddress = this.parseDepositAddress (data, currency);
        return depositAddress;
    }

    parseDepositAddress (depositAddress, currency: Currency = undefined) {
        //
        //     {
        //         "coin": "USDT",
        //         "address": "TKTUt7qiTaMgnTwZXjE3ZBkPB6LKhLPJyZ",
        //         "chain": "TRC20",
        //         "tag": null,
        //         "url": "https://tronscan.org/#/transaction/"
        //     }
        //
        const address = this.safeString (depositAddress, 'address');
        this.checkAddress (address);
        const networkId = this.safeString (depositAddress, 'chain');
        const network = this.safeString (this.options['networksById'], networkId, networkId);
        const tag = this.safeString (depositAddress, 'tag');
        return {
            'currency': currency['code'],
            'address': address,
            'tag': tag,
            'network': network,
            'info': depositAddress,
        };
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coincatch#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://coincatch.github.io/github.io/en/spot/#get-deposit-list
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (not used by exchange)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @param {int} [params.pageNo] pageNo default 1
         * @param {int} [params.pageSize] pageSize (default 20, max 100)
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        const methodName = 'fetchDeposits';
        await this.loadMarkets ();
        const request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetApiSpotV1WalletDepositList (this.extend (request, params));
        //
        //     {
        //         "code": "00000",
        //         "msg": "success",
        //         "requestTime": 1725205525239,
        //         "data": [
        //             {
        //                 "id": "1213046466852196352",
        //                 "txId": "824246b030cd84d56400661303547f43a1d9fef66cf968628dd5112f362053ff",
        //                 "coin": "USDT",
        //                 "type": "deposit",
        //                 "amount": "99.20000000",
        //                 "status": "success",
        //                 "toAddress": "TKTUt7qiTaMgnTwZXjE3ZBkPB6LKhLPJyZ",
        //                 "fee": null,
        //                 "chain": "TRX(TRC20)",
        //                 "confirm": null,
        //                 "clientOid": null,
        //                 "tag": null,
        //                 "fromAddress": null,
        //                 "dest": "on_chain",
        //                 "cTime": "1724938735688",
        //                 "uTime": "1724938746015"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name coincatch#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://coincatch.github.io/github.io/en/spot/#get-withdraw-list-v2
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @param {string} [params.clientOid] clientOid
         * @param {string} [params.orderId] The response orderId
         * @param {string} [params.idLessThan] Requests the content on the page before this ID (older data), the value input should be the orderId of the corresponding interface.
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        const methodName = 'fetchWithdrawals';
        await this.loadMarkets ();
        const request: Dict = {};
        let currency: Currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['coin'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
        }
        const response = await this.privateGetApiSpotV1WalletWithdrawalListV2 (this.extend (request, params));
        // todo add after withdrawal
        //
        const data = this.safeList (response, 'data', []);
        return this.parseTransactions (data, currency, since, limit);
    }

    async withdraw (code: string, amount: number, address: string, tag = undefined, params = {}) {
        /**
         * @method
         * @name coincatch#withdraw
         * @description make a withdrawal
         * @see https://coincatch.github.io/github.io/en/spot/#withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} params.network network for withdraw (mandatory)
         * @param {string} [params.remark] remark
         * @param {string} [params.clientOid] custom id
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request: Dict = {
            'coin': currency['id'],
            'address': address,
            'amount': amount,
        };
        if (tag !== undefined) {
            request['tag'] = tag;
        }
        let networkCode: Str = undefined;
        [ networkCode, params ] = this.handleNetworkCodeAndParams (params);
        if (networkCode !== undefined) {
            request['chain'] = this.networkCodeToId (networkCode);
        }
        const response = await this.privatePostApiSpotV1WalletWithdrawalV2 (this.extend (request, params));
        // todo add after withdrawal
        //
        return response;
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // fetchDeposits
        //     {
        //         "id": "1213046466852196352",
        //         "txId": "824246b030cd84d56400661303547f43a1d9fef66cf968628dd5112f362053ff",
        //         "coin": "USDT",
        //         "type": "deposit",
        //         "amount": "99.20000000",
        //         "status": "success",
        //         "toAddress": "TKTUt7qiTaMgnTwZXjE3ZBkPB6LKhLPJyZ",
        //         "fee": null,
        //         "chain": "TRX(TRC20)",
        //         "confirm": null,
        //         "clientOid": null,
        //         "tag": null,
        //         "fromAddress": null,
        //         "dest": "on_chain",
        //         "cTime": "1724938735688",
        //         "uTime": "1724938746015"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        let status = this.safeString (transaction, 'status');
        if (status === 'success') {
            status = 'ok';
        }
        const txid = this.safeString (transaction, 'txId');
        const coin = this.safeString (transaction, 'coin');
        const code = this.safeCurrencyCode (coin, currency);
        const timestamp = this.safeInteger (transaction, 'cTime');
        const amount = this.safeNumber (transaction, 'amount');
        const networkId = this.safeString (transaction, 'chain');
        const network = this.safeString (this.options['networksById'], networkId, networkId);
        const addressTo = this.safeString (transaction, 'toAddress');
        const addressFrom = this.safeString (transaction, 'fromAddress');
        const tag = this.safeString (transaction, 'tag');
        const type = this.safeString (transaction, 'type');
        const feeCost = this.safeNumber (transaction, 'fee');
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'network': network,
            'address': undefined,
            'addressTo': addressTo,
            'addressFrom': addressFrom,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query: Str = undefined;
        query = this.urlencode (params);
        if (api === 'public') {
            if (query.length !== 0) {
                url += '?' + query;
            }
        } else {
            this.checkRequiredCredentials ();
            let endpoint = '/' + path;
            if (method !== 'GET') {
                body = query;
            } else {
                if (query.length !== 0) {
                    url += '?' + query;
                    endpoint += '?' + query;
                }
            }
            const timestamp = this.milliseconds ().toString ();
            let endpart = '';
            if (body !== undefined) {
                body = this.json (query);
                endpart = body;
            }
            const payload = timestamp + method + endpoint + endpart;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'base64');
            headers = {
                'ACCESS-KEY': this.apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': this.password,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
