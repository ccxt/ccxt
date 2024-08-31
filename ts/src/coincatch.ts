
// ---------------------------------------------------------------------------

import Exchange from './abstract/coincatch.js';
import { } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Currencies, Dict, Int, Market, OHLCV, OrderBook, Str, Strings, Ticker, Tickers } from './base/types.js';

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
                'fetchMarkOHLCV': false,
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
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
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
                        'api/spot/v1/market/fills': 1,
                        'api/spot/v1/market/fills-history': 1,
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
                        'api/spot/v1/wallet/deposit-address': 1,
                        'pi/spot/v1/wallet/withdrawal-list': 1,
                        'api/spot/v1/wallet/withdrawal-list-v2': 1,
                        'api/spot/v1/wallet/deposit-list': 1,
                        'api/spot/v1/account/getInfo': 1,
                        'api/spot/v1/account/assets': 1,
                        'api/spot/v1/account/bills': 1,
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
                        'api/spot/v1/wallet/withdrawal-v2': 1,
                        'api/spot/v1/wallet/withdrawal-inner-v2': 1,
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
                'currencyIdsListForParseMarket': undefined,
                'broker': '',
                'networks': {
                },
                'networksById': {
                    'BITCOIN': 'BTC',
                    'ERC20': 'ERC20',
                    'TRC20': 'TRC20',
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
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const response = await this.publicGetApiSpotV1MarketTickers (params);
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
        const data = this.safeList (response, 'data', []);
        return this.parseMarkets (data);
    }

    parseMarket (market: Dict): Market {
        //
        //
        const marketId = this.safeString (market, 'symbol');
        const parsedMarketId = this.parseMarketId (marketId);
        const baseId = this.safeString (parsedMarketId, 'baseId');
        const quoteId = this.safeString (parsedMarketId, 'quoteId');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const tradingFees = this.safeDict (this.fees, 'trading');
        const fees = this.safeDict (tradingFees, 'spot');
        return this.safeMarketStructure ({
            'id': marketId + '_SPBL', // todo check
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'active': undefined, // todo check
            'type': 'spot',
            'subType': undefined,
            'spot': true,
            'margin': false, // todo check
            'swap': false,
            'future': false,
            'option': false,
            'contract': false,
            'settle': undefined,
            'settleId': undefined,
            'contractSize': undefined,
            'linear': undefined,
            'inverse': undefined,
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
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
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

    parseMarketId (marketId) {
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
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetApiSpotV1MarketTicker (this.extend (request, params));
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
        const data = this.safeDict (response, 'data', {});
        return this.parseTicker (data, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name coincatch#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://coincatch.github.io/github.io/en/spot/#get-all-tickers
         * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetApiSpotV1MarketTickers (params);
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
        const timestamp = this.safeInteger (ticker, 'ts');
        const marketId = this.safeString (ticker, 'symbol', '') + '_SPBL'; // todo check
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'close');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': this.safeString (ticker, 'buyOne'),
            'bidVolume': this.safeString (ticker, 'bidSz'),
            'ask': this.safeString (ticker, 'sellOne'),
            'askVolume': this.safeString (ticker, 'askSz'),
            'vwap': undefined,
            'open': undefined, // todo check
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString (ticker, 'change'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'baseVol'),
            'quoteVolume': this.safeString (ticker, 'quoteVol'),
            'info': ticker,
        }, market);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coincatch#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coincatch.github.io/github.io/en/spot/#get-merged-depth-data
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
        const response = await this.publicGetApiSpotV1MarketMergeDepth (this.extend (request, params));
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
        const data = this.safeDict (response, 'data', {});
        const timestamp = this.safeInteger (data, 'ts');
        return this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name coincatch#fetchOHLCV
         * @see https://coincatch.github.io/github.io/en/spot/#get-candle-data
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch (default 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const methodName = 'fetchOHLCV';
        await this.loadMarkets ();
        const market = this.market (symbol);
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
        const request: Dict = {
            'symbol': market['id'],
            'period': timeframe,
        };
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let until: Int = undefined;
        [ until, params ] = this.handleOptionAndParams (params, methodName, 'until');
        if (until !== undefined) {
            request['before'] = until;
        }
        const response = await this.publicGetApiSpotV1MarketCandles (this.extend (request, params));
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
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'ts'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'baseVol'),
        ];
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + path;
        let query: Str = undefined;
        query = this.urlencode (params);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
