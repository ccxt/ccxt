'use strict';

var oxfun$1 = require('./abstract/oxfun.js');
var Precise = require('./base/Precise.js');
var errors = require('./base/errors.js');
var number = require('./base/functions/number.js');
var sha256 = require('./static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
/**
 * @class oxfun
 * @augments Exchange
 */
class oxfun extends oxfun$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'oxfun',
            'name': 'OXFUN',
            'countries': ['PA'],
            'version': 'v3',
            'rateLimit': 120,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': true,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': true,
                'createStopMarketOrder': true,
                'createStopOrder': true,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': false,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrder': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': true,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
                'ws': true,
            },
            'timeframes': {
                '1m': '60s',
                '5m': '300s',
                '15m': '900s',
                '30m': '1800s',
                '1h': '3600s',
                '2h': '7200s',
                '4h': '14400s',
                '1d': '86400s',
            },
            'urls': {
                'logo': 'https://github.com/ccxt/ccxt/assets/43336371/6a196124-c1ee-4fae-8573-962071b61a85',
                'referral': 'https://ox.fun/register?shareAccountId=5ZUD4a7G',
                'api': {
                    'public': 'https://api.ox.fun',
                    'private': 'https://api.ox.fun',
                },
                'test': {
                    'public': 'https://stgapi.ox.fun',
                    'private': 'https://stgapi.ox.fun',
                },
                'www': 'https://ox.fun/',
                'doc': 'https://docs.ox.fun/',
                'fees': 'https://support.ox.fun/en/articles/8819866-trading-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'v3/markets': 1,
                        'v3/assets': 1,
                        'v3/tickers': 1,
                        'v3/funding/estimates': 1,
                        'v3/candles': 1,
                        'v3/depth': 1,
                        'v3/markets/operational': 1,
                        'v3/exchange-trades': 1,
                        'v3/funding/rates': 1,
                        'v3/leverage/tiers': 1,
                    },
                },
                'private': {
                    'get': {
                        'v3/account': 1,
                        'v3/account/names': 1,
                        'v3/wallet': 1,
                        'v3/transfer': 1,
                        'v3/balances': 1,
                        'v3/positions': 1,
                        'v3/funding': 1,
                        'v3/deposit-addresses': 1,
                        'v3/deposit': 1,
                        'v3/withdrawal-addresses': 1,
                        'v3/withdrawal': 1,
                        'v3/withdrawal-fees': 1,
                        'v3/orders/status': 1,
                        'v3/orders/working': 1,
                        'v3/trades': 1,
                    },
                    'post': {
                        'v3/transfer': 1,
                        'v3/withdrawal': 1,
                        'v3/orders/place': 1,
                    },
                    'delete': {
                        'v3/orders/cancel': 1,
                        'v3/orders/cancel-all': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber('0.00020'),
                    'taker': this.parseNumber('0.00070'),
                    'tiers': {
                        'maker': [
                            [this.parseNumber('0'), this.parseNumber('0.00020')],
                            [this.parseNumber('2500000'), this.parseNumber('0.00010')],
                            [this.parseNumber('25000000'), this.parseNumber('0')],
                        ],
                        'taker': [
                            [this.parseNumber('0'), this.parseNumber('0.00070')],
                            [this.parseNumber('2500000'), this.parseNumber('0.00050')],
                            [this.parseNumber('25000000'), this.parseNumber('0.00040')],
                        ],
                    },
                },
            },
            'precisionMode': number.TICK_SIZE,
            // exchange-specific options
            'options': {
                'sandboxMode': false,
                'networks': {
                    'BTC': 'Bitcoin',
                    'ERC20': 'Ethereum',
                    'AVAX': 'Avalanche',
                    'SOL': 'Solana',
                    'ARB': 'Arbitrum',
                    'MATIC': 'Polygon',
                    'FTM': 'Fantom',
                    'BNB': 'BNBSmartChain',
                    'OPTIMISM': 'Optimism',
                },
                'networksById': {
                    'Bitcoin': 'BTC',
                    'Ethereum': 'ERC20',
                    'Avalanche': 'AVAX',
                    'Solana': 'SOL',
                    'Arbitrum': 'ARB',
                    'Polygon': 'MATIC',
                    'Fantom': 'FTM',
                    'Base': 'BASE',
                    'BNBSmartChain': 'BNB',
                    'Optimism': 'OPTIMISM',
                },
            },
            'exceptions': {
                'exact': {
                    '-0010': errors.OperationFailed,
                    '-429': errors.RateLimitExceeded,
                    '-05001': errors.AuthenticationError,
                    '-10001': errors.ExchangeError,
                    '-20000': errors.BadRequest,
                    '-20001': errors.BadRequest,
                    '-20002': errors.BadRequest,
                    '-20003': errors.NotSupported,
                    '-20005': errors.AuthenticationError,
                    '-20006': errors.BadRequest,
                    '-20007': errors.AuthenticationError,
                    '-20008': errors.BadRequest,
                    '-20009': errors.BadRequest,
                    '-20010': errors.ArgumentsRequired,
                    '-20011': errors.ArgumentsRequired,
                    '-20012': errors.ArgumentsRequired,
                    '-20013': errors.ArgumentsRequired,
                    '-20014': errors.BadRequest,
                    '-20015': errors.BadSymbol,
                    '-20016': errors.BadRequest,
                    '-20017': errors.BadRequest,
                    '-20018': errors.BadRequest,
                    '-20019': errors.BadRequest,
                    '-20020': errors.BadRequest,
                    '-20021': errors.BadRequest,
                    '-20022': errors.ArgumentsRequired,
                    '-20023': errors.ArgumentsRequired,
                    '-20024': errors.ExchangeError,
                    '-20025': errors.AuthenticationError,
                    '-20026': errors.BadRequest,
                    '-20027': errors.BadRequest,
                    '-20028': errors.BadRequest,
                    '-20029': errors.BadRequest,
                    '-20030': errors.BadRequest,
                    '-20031': errors.MarketClosed,
                    '-20032': errors.NetworkError,
                    '-20033': errors.BadRequest,
                    '-20034': errors.BadRequest,
                    '-20050': errors.ExchangeError,
                    '-30001': errors.BadRequest,
                    '-35034': errors.AuthenticationError,
                    '-35046': errors.AuthenticationError,
                    '-40001': errors.ExchangeError,
                    '-50001': errors.ExchangeError,
                    '-300001': errors.AccountNotEnabled,
                    '-300011': errors.InvalidOrder,
                    '-300012': errors.InvalidOrder,
                    '-100005': errors.OrderNotFound,
                    '-100006': errors.InvalidOrder,
                    '-100008': errors.BadRequest,
                    '-100015': errors.NetworkError,
                    '-710001': errors.ExchangeError,
                    '-710002': errors.BadRequest,
                    '-710003': errors.BadRequest,
                    '-710004': errors.BadRequest,
                    '-710005': errors.InsufficientFunds,
                    '-710006': errors.InsufficientFunds,
                    '-710007': errors.InsufficientFunds,
                    '-000101': errors.NetworkError,
                    '-000201': errors.NetworkError, // Trade service is busy, try again later
                },
                'broad': {
                    '-20001': errors.OperationFailed,
                    '-200050': errors.RequestTimeout, // The market is not active
                },
            },
        });
    }
    async fetchMarkets(params = {}) {
        /**
         * @method
         * @name oxfun#fetchMarkets
         * @description retrieves data on all markets for bitmex
         * @see https://docs.ox.fun/?json#get-v3-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const [responseFromMarkets, responseFromTickers] = await Promise.all([this.publicGetV3Markets(params), this.publicGetV3Tickers(params)]);
        const marketsFromMarkets = this.safeList(responseFromMarkets, 'data', []);
        //
        //         {
        //             success: true,
        //             data: [
        //                 {
        //                     marketCode: 'OX-USD-SWAP-LIN',
        //                     name: 'OX/USD Perp',
        //                     referencePair: 'OX/USDT',
        //                     base: 'OX',
        //                     counter: 'USD',
        //                     type: 'FUTURE',
        //                     tickSize: '0.00001',
        //                     minSize: '1',
        //                     listedAt: '1704766320000',
        //                     upperPriceBound: '0.02122',
        //                     lowerPriceBound: '0.01142',
        //                     markPrice: '0.01632',
        //                     indexPrice: '0.01564',
        //                     lastUpdatedAt: '1714762235569'
        //                 },
        //                 {
        //                     marketCode: 'BTC-USD-SWAP-LIN',
        //                     name: 'BTC/USD Perp',
        //                     referencePair: 'BTC/USDT',
        //                     base: 'BTC',
        //                     counter: 'USD',
        //                     type: 'FUTURE',
        //                     tickSize: '1',
        //                     minSize: '0.0001',
        //                     listedAt: '1704686640000',
        //                     upperPriceBound: '67983',
        //                     lowerPriceBound: '55621',
        //                     markPrice: '61802',
        //                     indexPrice: '61813',
        //                     lastUpdatedAt: '1714762234765'
        //                 },
        //                 {
        //                     "marketCode": "MILK-OX",
        //                     "name": "MILK/OX",
        //                     "referencePair": "MILK/OX",
        //                     "base": "MILK",
        //                     "counter": "OX",
        //                     "type": "SPOT",
        //                     "tickSize": "0.0001",
        //                     "minSize": "1",
        //                     "listedAt": "1706608500000",
        //                     "upperPriceBound": "1.0000",
        //                     "lowerPriceBound": "-1.0000",
        //                     "markPrice": "0.0269",
        //                     "indexPrice": "0.0269",
        //                     "lastUpdatedAt": "1714757402185"
        //                 },
        //                 ...
        //             ]
        //         }
        //
        const marketsFromTickers = this.safeList(responseFromTickers, 'data', []);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "DYM-USD-SWAP-LIN",
        //                 "markPrice": "3.321",
        //                 "open24h": "3.315",
        //                 "high24h": "3.356",
        //                 "low24h": "3.255",
        //                 "volume24h": "0",
        //                 "currencyVolume24h": "0",
        //                 "openInterest": "1768.1",
        //                 "lastTradedPrice": "3.543",
        //                 "lastTradedQuantity": "1.0",
        //                 "lastUpdatedAt": "1714853388102"
        //             },
        //             ...
        //         ]
        //     }
        //
        const markets = this.arrayConcat(marketsFromMarkets, marketsFromTickers);
        return this.parseMarkets(markets);
    }
    parseMarkets(markets) {
        const marketIds = [];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString(market, 'marketCode');
            if (!(this.inArray(marketId, marketIds))) {
                marketIds.push(marketId);
                result.push(this.parseMarket(market));
            }
        }
        return result;
    }
    parseMarket(market) {
        const id = this.safeString(market, 'marketCode', '');
        const parts = id.split('-');
        const baseId = this.safeString(parts, 0);
        const quoteId = this.safeString(parts, 1);
        const base = this.safeCurrencyCode(baseId);
        const quote = this.safeCurrencyCode(quoteId);
        let symbol = base + '/' + quote;
        let type = this.safeStringLower(market, 'type', 'spot'); // markets from v3/tickers are spot and have no type
        let settleId = undefined;
        let settle = undefined;
        const isFuture = (type === 'future'); // the exchange has only perpetual futures
        if (isFuture) {
            type = 'swap';
            settleId = 'OX';
            settle = this.safeCurrencyCode('OX');
            symbol = symbol + ':' + settle;
        }
        const isSpot = type === 'spot';
        return this.safeMarketStructure({
            'id': id,
            'numericId': undefined,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': type,
            'spot': isSpot,
            'margin': false,
            'swap': isFuture,
            'future': false,
            'option': false,
            'active': true,
            'contract': isFuture,
            'linear': isFuture ? true : undefined,
            'inverse': isFuture ? false : undefined,
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'contractSize': isFuture ? 1 : undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': this.safeNumber(market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber(market, 'minSize'),
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': this.safeInteger(market, 'listedAt'),
            'index': undefined,
            'info': market,
        });
    }
    async fetchCurrencies(params = {}) {
        /**
         * @method
         * @name oxfun#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.ox.fun/?json#get-v3-assets
         * @param {dict} [params] extra parameters specific to the exchange API endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const response = await this.publicGetV3Assets(params);
        //
        //     {
        //         "success": true,
        //         "data":  [
        //             {
        //                 "asset": "OX",
        //                 "isCollateral": true,
        //                 "loanToValue": "1.000000000",
        //                 "loanToValueFactor": "0.000000000",
        //                 "networkList":  [
        //                     {
        //                         "network": "BNBSmartChain",
        //                         "tokenId": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": false,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Polygon",
        //                         "tokenId": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": false,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Arbitrum",
        //                         "tokenId": "0xba0Dda8762C24dA9487f5FA026a9B64b695A07Ea",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": true,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Ethereum",
        //                         "tokenId": "0xba0Dda8762C24dA9487f5FA026a9B64b695A07Ea",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": true,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Arbitrum",
        //                         "tokenId": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": false,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Avalanche",
        //                         "tokenId": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": false,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Solana",
        //                         "tokenId": "DV3845GEAVXfwpyVGGgWbqBVCtzHdCXNCGfcdboSEuZz",
        //                         "transactionPrecision": "8",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": true,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     },
        //                     {
        //                         "network": "Ethereum",
        //                         "tokenId": "0x78a0A62Fba6Fb21A83FE8a3433d44C73a4017A6f",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": false,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     }
        //                 ]
        //             },
        //             {
        //                 "asset": "BTC",
        //                 "isCollateral": true,
        //                 "loanToValue": "0.950000000",
        //                 "loanToValueFactor": "0.000000000",
        //                 "networkList":  [
        //                     {
        //                         "network": "Bitcoin",
        //                         "transactionPrecision": "8",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": true,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     }
        //                 ]
        //             },
        //             {
        //                 "asset": "USDT.ARB",
        //                 "isCollateral": true,
        //                 "loanToValue": "0.950000000",
        //                 "loanToValueFactor": "0.000000000",
        //                 "networkList": [
        //                     {
        //                         "network": "Arbitrum",
        //                         "tokenId": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        //                         "transactionPrecision": "18",
        //                         "isWithdrawalFeeChargedToUser": true,
        //                         "canDeposit": true,
        //                         "canWithdraw": true,
        //                         "minDeposit": "0.00010",
        //                         "minWithdrawal": "0.00010"
        //                     }
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const fullId = this.safeString(currency, 'asset', '');
            const parts = fullId.split('.');
            const id = parts[0];
            const code = this.safeCurrencyCode(id);
            let networks = {};
            const chains = this.safeList(currency, 'networkList', []);
            let currencyMaxPrecision = undefined;
            let currencyDepositEnabled = undefined;
            let currencyWithdrawEnabled = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString(chain, 'network');
                const networkCode = this.networkIdToCode(networkId);
                const deposit = this.safeBool(chain, 'canDeposit');
                const withdraw = this.safeBool(chain, 'canWithdraw');
                const active = (deposit && withdraw);
                const minDeposit = this.safeString(chain, 'minDeposit');
                const minWithdrawal = this.safeString(chain, 'minWithdrawal');
                const precision = this.parsePrecision(this.safeString(chain, 'transactionPrecision'));
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'margin': undefined,
                    'deposit': deposit,
                    'withdraw': withdraw,
                    'active': active,
                    'fee': undefined,
                    'precision': this.parseNumber(precision),
                    'limits': {
                        'deposit': {
                            'min': minDeposit,
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': minWithdrawal,
                            'max': undefined,
                        },
                    },
                    'info': chain,
                };
                if ((currencyDepositEnabled === undefined) || deposit) {
                    currencyDepositEnabled = deposit;
                }
                if ((currencyWithdrawEnabled === undefined) || withdraw) {
                    currencyWithdrawEnabled = withdraw;
                }
                if ((currencyMaxPrecision === undefined) || Precise["default"].stringGt(currencyMaxPrecision, precision)) {
                    currencyMaxPrecision = precision;
                }
            }
            if (code in result) {
                // checking for specific ids as USDC.ARB
                networks = this.extend(result[code]['networks'], networks);
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': undefined,
                'type': undefined,
                'active': undefined,
                'deposit': currencyDepositEnabled,
                'withdraw': currencyWithdrawEnabled,
                'fee': undefined,
                'precision': this.parseNumber(currencyMaxPrecision),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
                'info': currency,
            };
        }
        return result;
    }
    async fetchTickers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.ox.fun/?json#get-v3-tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetV3Tickers(params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "NII-USDT",
        //                 "markPrice": "0",
        //                 "open24h": "0",
        //                 "high24h": "0",
        //                 "low24h": "0",
        //                 "volume24h": "0",
        //                 "currencyVolume24h": "0",
        //                 "openInterest": "0",
        //                 "lastTradedPrice": "0",
        //                 "lastTradedQuantity": "0",
        //                 "lastUpdatedAt": "1714853388621"
        //             },
        //             {
        //                 "marketCode": "GEC-USDT",
        //                 "markPrice": "0",
        //                 "open24h": "0",
        //                 "high24h": "0",
        //                 "low24h": "0",
        //                 "volume24h": "0",
        //                 "currencyVolume24h": "0",
        //                 "openInterest": "0",
        //                 "lastTradedPrice": "0",
        //                 "lastTradedQuantity": "0",
        //                 "lastUpdatedAt": "1714853388621"
        //             },
        //             {
        //                 "marketCode": "DYM-USD-SWAP-LIN",
        //                 "markPrice": "3.321",
        //                 "open24h": "3.315",
        //                 "high24h": "3.356",
        //                 "low24h": "3.255",
        //                 "volume24h": "0",
        //                 "currencyVolume24h": "0",
        //                 "openInterest": "1768.1",
        //                 "lastTradedPrice": "3.543",
        //                 "lastTradedQuantity": "1.0",
        //                 "lastUpdatedAt": "1714853388102"
        //             },
        //             ...
        //         ]
        //     }
        //
        const tickers = this.safeList(response, 'data', []);
        return this.parseTickers(tickers, symbols);
    }
    async fetchTicker(symbol, params = {}) {
        /**
         * @method
         * @name oxfun#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.ox.fun/?json#get-v3-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
        };
        const response = await this.publicGetV3Tickers(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "markPrice": "64276",
        //                 "open24h": "63674",
        //                 "high24h": "64607",
        //                 "low24h": "62933",
        //                 "volume24h": "306317655.80000",
        //                 "currencyVolume24h": "48.06810",
        //                 "openInterest": "72.39250",
        //                 "lastTradedPrice": "64300.0",
        //                 "lastTradedQuantity": "1.0",
        //                 "lastUpdatedAt": "1714925196034"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const ticker = this.safeDict(data, 0, {});
        return this.parseTicker(ticker, market);
    }
    parseTicker(ticker, market = undefined) {
        //
        //     {
        //         "marketCode": "BTC-USD-SWAP-LIN",
        //         "markPrice": "64276",
        //         "open24h": "63674",
        //         "high24h": "64607",
        //         "low24h": "62933",
        //         "volume24h": "306317655.80000",
        //         "currencyVolume24h": "48.06810",
        //         "openInterest": "72.39250",
        //         "lastTradedPrice": "64300.0",
        //         "lastTradedQuantity": "1.0",
        //         "lastUpdatedAt": "1714925196034"
        //     }
        //
        const timestamp = this.safeInteger(ticker, 'lastUpdatedAt');
        const marketId = this.safeString(ticker, 'marketCode');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString(ticker, 'lastTradedPrice');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeString(ticker, 'high24h'),
            'low': this.safeString(ticker, 'low24h'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString(ticker, 'open24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'currencyVolume24h'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.ox.fun/?json#get-v3-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch (default 24 hours ago)
         * @param {int} [limit] the maximum amount of candles to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch (default now)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        timeframe = this.safeString(this.timeframes, timeframe, timeframe);
        const request = {
            'marketCode': market['id'],
            'timeframe': timeframe,
        };
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        else if (since !== undefined) {
            request['endTime'] = this.sum(since, 7 * 24 * 60 * 60 * 1000); // for the exchange not to throw an exception if since is younger than 7 days
        }
        const response = await this.publicGetV3Candles(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "timeframe": "3600s",
        //         "data": [
        //             {
        //                 "open": "0.03240000",
        //                 "high": "0.03240000",
        //                 "low": "0.03240000",
        //                 "close": "0.03240000",
        //                 "volume": "0",
        //                 "currencyVolume": "0",
        //                 "openedAt": "1714906800000"
        //             },
        //             {
        //                 "open": "0.03240000",
        //                 "high": "0.03240000",
        //                 "low": "0.03240000",
        //                 "close": "0.03240000",
        //                 "volume": "0",
        //                 "currencyVolume": "0",
        //                 "openedAt": "1714903200000"
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = this.safeList(response, 'data', []);
        return this.parseOHLCVs(result, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //     {
        //         "open": "0.03240000",
        //         "high": "0.03240000",
        //         "low": "0.03240000",
        //         "close": "0.03240000",
        //         "volume": "0",
        //         "currencyVolume": "0",
        //         "openedAt": "1714906800000"
        //     }
        //
        return [
            this.safeInteger(ohlcv, 'openedAt'),
            this.safeNumber(ohlcv, 'open'),
            this.safeNumber(ohlcv, 'high'),
            this.safeNumber(ohlcv, 'low'),
            this.safeNumber(ohlcv, 'close'),
            this.safeNumber(ohlcv, 'currencyVolume'),
        ];
    }
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.ox.fun/?json#get-v3-depth
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return (default 5, max 100)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        const response = await this.publicGetV3Depth(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "level": "5",
        //         "data": {
        //             "marketCode": "BTC-USD-SWAP-LIN",
        //             "lastUpdatedAt": "1714933499266",
        //             "asks": [
        //                 [ 64073.0, 8.4622 ],
        //                 [ 64092.0, 8.1912 ],
        //                 [ 64111.0, 8.0669 ],
        //                 [ 64130.0, 11.7195 ],
        //                 [ 64151.0, 10.1798 ]
        //             ],
        //             "bids": [
        //                 [ 64022.0, 10.1292 ],
        //                 [ 64003.0, 8.1619 ],
        //                 [ 64000.0, 1.0 ],
        //                 [ 63984.0, 12.7724 ],
        //                 [ 63963.0, 11.0073 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.safeInteger(data, 'lastUpdatedAt');
        return this.parseOrderBook(data, market['symbol'], timestamp);
    }
    async fetchFundingRates(symbols = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchFundingRates
         * @see https://docs.ox.fun/?json#get-v3-funding-estimates
         * @description fetch the current funding rates
         * @param {string[]} symbols unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {Order[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.publicGetV3FundingEstimates(params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "OX-USD-SWAP-LIN",
        //                 "fundingAt": "1715515200000",
        //                 "estFundingRate": "0.000200000"
        //             },
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "fundingAt": "1715515200000",
        //                 "estFundingRate": "0.000003"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const result = this.parseFundingRates(data);
        return this.filterByArray(result, 'symbol', symbols);
    }
    parseFundingRate(fundingRate, market = undefined) {
        //
        //     {
        //         "marketCode": "OX-USD-SWAP-LIN",
        //         "fundingAt": "1715515200000",
        //         "estFundingRate": "0.000200000"
        //     },
        //
        //
        const symbol = this.safeString(fundingRate, 'marketCode');
        market = this.market(symbol);
        const estFundingRateTimestamp = this.safeInteger(fundingRate, 'fundingAt');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': estFundingRateTimestamp,
            'datetime': this.iso8601(estFundingRateTimestamp),
            'fundingRate': this.safeNumber(fundingRate, 'estFundingRate'),
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
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchFundingRateHistory
         * @description Fetches the history of funding rates
         * @see https://docs.ox.fun/?json#get-v3-funding-rates
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        const response = await this.publicGetV3FundingRates(this.extend(request, params));
        //
        //     {
        //         success: true,
        //         data: [
        //         {
        //             marketCode: 'NEAR-USD-SWAP-LIN',
        //             fundingRate: '-0.000010000',
        //             createdAt: '1715428870755'
        //         },
        //         {
        //             marketCode: 'ENA-USD-SWAP-LIN',
        //             fundingRate: '0.000150000',
        //             createdAt: '1715428868616'
        //         },
        //         ...
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseFundingRateHistories(data, market, since, limit);
    }
    parseFundingRateHistory(info, market = undefined) {
        //
        //     {
        //         success: true,
        //         data: [
        //         {
        //             marketCode: 'NEAR-USD-SWAP-LIN',
        //             fundingRate: '-0.000010000',
        //             createdAt: '1715428870755'
        //         },
        //         {
        //             marketCode: 'ENA-USD-SWAP-LIN',
        //             fundingRate: '0.000150000',
        //             createdAt: '1715428868616'
        //         },
        //         ...
        //     }
        //
        const marketId = this.safeString(info, 'marketCode');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(info, 'createdAt');
        return {
            'info': info,
            'symbol': symbol,
            'fundingRate': this.safeNumber(info, 'fundingRate'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
    }
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchFundingHistory
         * @description fetches the history of funding payments
         * @see https://docs.ox.fun/?json#get-v3-funding
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        const response = await this.privateGetV3Funding(this.extend(request, params));
        //
        //     {
        //         success: true,
        //         data: [
        //             {
        //                 id: '966709913041305605',
        //                 marketCode: 'ETH-USD-SWAP-LIN',
        //                 payment: '-0.00430822',
        //                 fundingRate: '0.000014',
        //                 position: '0.001',
        //                 indexPrice: '3077.3',
        //                 createdAt: '1715086852890'
        //             },
        //             {
        //                 id: '966698111997509637',
        //                 marketCode: 'ETH-USD-SWAP-LIN',
        //                 payment: '-0.0067419',
        //                 fundingRate: '0.000022',
        //                 position: '0.001',
        //                 indexPrice: '3064.5',
        //                 createdAt: '1715083251516'
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = this.safeList(response, 'data', []);
        return this.parseIncomes(result, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        //     {
        //         id: '966709913041305605',
        //         marketCode: 'ETH-USD-SWAP-LIN',
        //         payment: '-0.00430822',
        //         fundingRate: '0.000014',
        //         position: '0.001',
        //         indexPrice: '3077.3',
        //         createdAt: '1715086852890'
        //     },
        //
        const marketId = this.safeString(income, 'marketCode');
        const symbol = this.safeSymbol(marketId, market);
        const amount = this.safeNumber(income, 'payment');
        const code = this.safeCurrencyCode('OX');
        const id = this.safeString(income, 'id');
        const timestamp = this.safeTimestamp(income, 'createdAt');
        const rate = this.safeNumber(income, 'fundingRate');
        return {
            'info': income,
            'symbol': symbol,
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': id,
            'amount': amount,
            'rate': rate,
        };
    }
    async fetchLeverageTiers(symbols = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market
         * @see https://docs.ox.fun/?json#get-v3-leverage-tiers
         * @param {string[]} [symbols] list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets();
        const response = await this.publicGetV3LeverageTiers(params);
        //
        //     {
        //         success: true,
        //         data: [
        //            {
        //                 marketCode: 'SOL-USD-SWAP-LIN',
        //                 tiers: [
        //                     {
        //                         tier: '1',
        //                         leverage: '10',
        //                         positionFloor: '0',
        //                         positionCap: '200000000',
        //                         initialMargin: '0.1',
        //                         maintenanceMargin: '0.05',
        //                         maintenanceAmount: '0'
        //                     },
        //                     {
        //                         tier: '2',
        //                         leverage: '5',
        //                         positionFloor: '200000000',
        //                         positionCap: '280000000',
        //                         initialMargin: '0.2',
        //                         maintenanceMargin: '0.1',
        //                         maintenanceAmount: '7000000'
        //                     },
        //                     {
        //                         tier: '3',
        //                         leverage: '4',
        //                         positionFloor: '280000000',
        //                         positionCap: '460000000',
        //                         initialMargin: '0.25',
        //                         maintenanceMargin: '0.125',
        //                         maintenanceAmount: '14000000'
        //                     },
        //                     ...
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseLeverageTiers(data, symbols, 'marketCode');
    }
    parseMarketLeverageTiers(info, market = undefined) {
        //
        //     {
        //         marketCode: 'SOL-USD-SWAP-LIN',
        //         tiers: [
        //             {
        //                 tier: '1',
        //                 leverage: '10',
        //                 positionFloor: '0',
        //                 positionCap: '200000000',
        //                 initialMargin: '0.1',
        //                 maintenanceMargin: '0.05',
        //                 maintenanceAmount: '0'
        //             ...
        //         ]
        //     },
        //
        const marketId = this.safeString(info, 'marketCode');
        market = this.safeMarket(marketId, market);
        const listOfTiers = this.safeList(info, 'tiers', []);
        const tiers = [];
        for (let j = 0; j < listOfTiers.length; j++) {
            const tier = listOfTiers[j];
            tiers.push({
                'tier': this.safeNumber(tier, 'tier'),
                'currency': market['settle'],
                'minNotional': this.safeNumber(tier, 'positionFloor'),
                'maxNotional': this.safeNumber(tier, 'positionCap'),
                'maintenanceMarginRate': this.safeNumber(tier, 'maintenanceMargin'),
                'maxLeverage': this.safeNumber(tier, 'leverage'),
                'info': tier,
            });
        }
        return tiers;
    }
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.ox.fun/?json#get-v3-exchange-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        else if (since !== undefined) {
            request['endTime'] = this.sum(since, 7 * 24 * 60 * 60 * 1000); // for the exchange not to throw an exception if since is younger than 7 days
        }
        const response = await this.publicGetV3ExchangeTrades(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "matchPrice": "63900",
        //                 "matchQuantity": "1",
        //                 "side": "SELL",
        //                 "matchType": "TAKER",
        //                 "matchedAt": "1714934112352"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTrades(data, market, since, limit);
    }
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchMyTrades
         * @description fetch all trades made by the user
         * @see https://docs.ox.fun/?json#get-v3-trades
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
         * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['marketCode'] = market['id'];
        }
        if (since !== undefined) { // startTime and endTime must be within 7 days of each other
            request['startTime'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        else if (since !== undefined) {
            request['endTime'] = this.sum(since, 7 * 24 * 60 * 60 * 1000); // for the exchange not to throw an exception if since is younger than 7 days
        }
        const response = await this.privateGetV3Trades(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "orderId": "1000104903698",
        //                 "clientOrderId": "1715000260094",
        //                 "matchId": "400017129522773178",
        //                 "marketCode": "ETH-USD-SWAP-LIN",
        //                 "side": "BUY",
        //                 "matchedQuantity": "0.001",
        //                 "matchPrice": "3100.2",
        //                 "total": "310.02",
        //                 "orderMatchType": "MAKER",
        //                 "feeAsset": "OX",
        //                 "fee": "0.062004",
        //                 "source": "0",
        //                 "matchedAt": "1715000267420"
        //             }
        //         ]
        //     }
        //
        const result = this.safeList(response, 'data', []);
        return this.parseTrades(result, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "marketCode": "BTC-USD-SWAP-LIN",
        //         "matchPrice": "63900",
        //         "matchQuantity": "1",
        //         "side": "SELL",
        //         "matchType": "TAKER",
        //         "matchedAt": "1714934112352"
        //     }
        //
        //
        // private fetchMyTrades
        //
        //     {
        //         "orderId": "1000104903698",
        //         "clientOrderId": "1715000260094",
        //         "matchId": "400017129522773178",
        //         "marketCode": "ETH-USD-SWAP-LIN",
        //         "side": "BUY",
        //         "matchedQuantity": "0.001",
        //         "matchPrice": "3100.2",
        //         "total": "310.02",
        //         "orderMatchType": "MAKER",
        //         "feeAsset": "OX",
        //         "fee": "0.062004",
        //         "source": "0",
        //         "matchedAt": "1715000267420"
        //     }
        //
        const marketId = this.safeString(trade, 'marketCode');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger(trade, 'matchedAt');
        const fee = {
            'cost': this.safeString(trade, 'fee'),
            'currency': this.safeCurrencyCode(this.safeString(trade, 'feeAsset')),
        };
        return this.safeTrade({
            'id': this.safeString(trade, 'matchId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': symbol,
            'type': undefined,
            'order': this.safeString(trade, 'orderId'),
            'side': this.safeStringLower(trade, 'side'),
            'takerOrMaker': this.safeStringLower2(trade, 'matchType', 'orderMatchType'),
            'price': this.safeString(trade, 'matchPrice'),
            'amount': this.safeString2(trade, 'matchQuantity', 'matchedQuantity'),
            'cost': undefined,
            'fee': fee,
            'info': trade,
        }, market);
    }
    async fetchBalance(params = {}) {
        /**
         * @method
         * @name oxfun#fetchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @see https://docs.ox.fun/?json#get-v3-balances
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.asset] currency id, if empty the exchange returns info about all currencies
         * @param {string} [params.subAcc] Name of sub account. If no subAcc is given, then the response contains only the account linked to the API-Key.
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.loadMarkets();
        const response = await this.privateGetV3Balances(params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "accountId": "106490",
        //                 "name": "main",
        //                 "balances": [
        //                     {
        //                         "asset": "OX",
        //                         "total": "-7.55145065000",
        //                         "available": "-71.16445065000",
        //                         "reserved": "0",
        //                         "lastUpdatedAt": "1715000448946"
        //                     },
        //                     {
        //                         "asset": "ETH",
        //                         "total": "0.01",
        //                         "available": "0.01",
        //                         "reserved": "0",
        //                         "lastUpdatedAt": "1714914512750"
        //                     },
        //                     ...
        //                 ]
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        let balance = data[0];
        const subAcc = this.safeString(params, 'subAcc');
        if (subAcc !== undefined) {
            for (let i = 0; i < data.length; i++) {
                const b = data[i];
                const name = this.safeString(b, 'name');
                if (name === subAcc) {
                    balance = b;
                    break;
                }
            }
        }
        return this.parseBalance(balance);
    }
    parseBalance(balance) {
        //
        //     {
        //         "accountId": "106490",
        //         "name": "main",
        //         "balances": [
        //             {
        //                 "asset": "OX",
        //                 "total": "-7.55145065000",
        //                 "available": "-71.16445065000",
        //                 "reserved": "0",
        //                 "lastUpdatedAt": "1715000448946"
        //             },
        //             {
        //                 "asset": "ETH",
        //                 "total": "0.01",
        //                 "available": "0.01",
        //                 "reserved": "0",
        //                 "lastUpdatedAt": "1714914512750"
        //             },
        //             ...
        //         ]
        //     }
        //
        const result = {
            'info': balance,
        };
        const balances = this.safeList(balance, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balanceEntry = balances[i];
            const currencyId = this.safeString(balanceEntry, 'asset');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balanceEntry, 'total');
            account['free'] = this.safeString(balanceEntry, 'available');
            account['used'] = this.safeString(balanceEntry, 'reserved');
            result[code] = account;
        }
        return this.safeBalance(result);
    }
    async fetchAccounts(params = {}) {
        /**
         * @method
         * @name oxfun#fetchAccounts
         * @description fetch subaccounts associated with a profile
         * @see https://docs.ox.fun/?json#get-v3-account-names
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
         */
        await this.loadMarkets();
        // this endpoint can only be called using API keys paired with the parent account! Returns all active subaccounts.
        const response = await this.privateGetV3AccountNames(params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "accountId": "106526",
        //                 "name": "testSubAccount"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseAccounts(data, params);
    }
    parseAccount(account) {
        //
        //     {
        //         "accountId": "106526",
        //         "name": "testSubAccount"
        //     },
        //
        return {
            'id': this.safeString(account, 'accountId'),
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name oxfun#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://docs.ox.fun/?json#post-v3-transfer
         * @param {string} code unified currency code
         * @param {float} amount amount to transfer
         * @param {string} fromAccount account id to transfer from
         * @param {string} toAccount account id to transfer to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        // transferring funds between sub-accounts is restricted to API keys linked to the parent account.
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'quantity': this.currencyToPrecision(code, amount),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
        };
        const response = await this.privatePostV3Transfer(this.extend(request, params));
        //
        //     {
        //         timestamp: 1715430036267,
        //         datetime: '2024-05-11T12:20:36.267Z',
        //         currency: 'OX',
        //         amount: 10,
        //         fromAccount: '106464',
        //         toAccount: '106570',
        //         info: {
        //         asset: 'OX',
        //         quantity: '10',
        //         fromAccount: '106464',
        //         toAccount: '106570',
        //         transferredAt: '1715430036267'
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseTransfer(data, currency);
    }
    async fetchTransfers(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchTransfers
         * @description fetch a history of internal transfers made on an account
         * @see https://docs.ox.fun/?json#get-v3-transfer
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        // API keys linked to the parent account can get all account transfers, while API keys linked to a sub-account can only see transfers where the sub-account is either the "fromAccount" or "toAccount"
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        else if (since !== undefined) {
            request['endTime'] = this.sum(since, 7 * 24 * 60 * 60 * 1000); // for the exchange not to throw an exception if since is younger than 7 days
        }
        const response = await this.privateGetV3Transfer(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "asset": "USDT",
        //                 "quantity": "5",
        //                 "fromAccount": "106490",
        //                 "toAccount": "106526",
        //                 "id": "966706320886267905",
        //                 "status": "COMPLETED",
        //                 "transferredAt": "1715085756708"
        //             },
        //             ...
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        return this.parseTransfers(data, currency, since, limit);
    }
    parseTransfer(transfer, currency = undefined) {
        //
        // fetchTransfers
        //
        //     {
        //         "asset": "USDT",
        //         "quantity": "5",
        //         "fromAccount": "106490",
        //         "toAccount": "106526",
        //         "id": "966706320886267905",
        //         "status": "COMPLETED",
        //         "transferredAt": "1715085756708"
        //     }
        //
        const timestamp = this.safeInteger(transfer, 'transferredAt');
        const currencyId = this.safeString(transfer, 'asset');
        return {
            'id': this.safeString(transfer, 'id'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'quantity'),
            'fromAccount': this.safeString(transfer, 'fromAccount'),
            'toAccount': this.safeString(transfer, 'toAccount'),
            'status': this.parseTransferStatus(this.safeString(transfer, 'status')),
            'info': transfer,
        };
    }
    parseTransferStatus(status) {
        const statuses = {
            'COMPLETED': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    async fetchDepositAddress(code, params = {}) {
        /**
         * @method
         * @name oxfun#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://docs.ox.fun/?json#get-v3-deposit-addresses
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.network] network for fetch deposit address
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        const networkCode = this.safeString(params, 'network');
        const networkId = this.networkCodeToId(networkCode, code);
        if (networkId === undefined) {
            throw new errors.BadRequest(this.id + ' fetchDepositAddress() require network parameter');
        }
        await this.loadMarkets();
        const currency = this.currency(code);
        const request = {
            'asset': currency['id'],
            'network': networkId,
        };
        params = this.omit(params, 'network');
        const response = await this.privateGetV3DepositAddresses(this.extend(request, params));
        //
        //     {"success":true,"data":{"address":"0x998dEc76151FB723963Bd8AFD517687b38D33dE8"}}
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseDepositAddress(data, currency);
    }
    parseDepositAddress(depositAddress, currency = undefined) {
        //
        //     {"address":"0x998dEc76151FB723963Bd8AFD517687b38D33dE8"}
        //
        const address = this.safeString(depositAddress, 'address');
        this.checkAddress(address);
        return {
            'currency': currency['code'],
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': depositAddress,
        };
    }
    async fetchDeposits(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://docs.ox.fun/?json#get-v3-deposit
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        const response = await this.privateGetV3Deposit(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "asset":"USDC",
        //                 "network":"Ethereum",
        //                 "address": "0x998dEc76151FB723963Bd8AFD517687b38D33dE8",
        //                 "quantity":"50",
        //                 "id":"5914",
        //                 "status": "COMPLETED",
        //                 "txId":"0xf5e79663830a0c6f94d46638dcfbc134566c12facf1832396f81ecb55d3c75dc",
        //                 "creditedAt":"1714821645154"
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            data[i]['type'] = 'deposit';
        }
        return this.parseTransactions(data, currency, since, limit);
    }
    async fetchWithdrawals(code = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://docs.ox.fun/?json#get-v3-withdrawal
         * @param {string} code unified currency code of the currency transferred
         * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
         * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets();
        const request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency(code);
            request['asset'] = currency['id'];
        }
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger(params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit(params, 'until');
        }
        const response = await this.privateGetV3Withdrawal(this.extend(request, params));
        //
        //     {
        //         success: true,
        //         data: [
        //             {
        //                 id: '968163212989431811',
        //                 asset: 'OX',
        //                 network: 'Arbitrum',
        //                 address: '0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9',
        //                 quantity: '11.7444',
        //                 fee: '1.744400000',
        //                 status: 'COMPLETED',
        //                 txId: '0xe96b2d128b737fdbca927edf355cff42202e65b0fb960e64ffb9bd68c121f69f',
        //                 requestedAt: '1715530365450',
        //                 completedAt: '1715530527000'
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        for (let i = 0; i < data.length; i++) {
            data[i]['type'] = 'withdrawal';
        }
        return this.parseTransactions(data, currency, since, limit);
    }
    parseTransactions(transactions, currency = undefined, since = undefined, limit = undefined, params = {}) {
        let result = [];
        for (let i = 0; i < transactions.length; i++) {
            transactions[i] = this.extend(transactions[i], params);
            const transaction = this.parseTransaction(transactions[i], currency);
            result.push(transaction);
        }
        result = this.sortBy(result, 'timestamp');
        const code = (currency !== undefined) ? currency['code'] : undefined;
        return this.filterByCurrencySinceLimit(result, code, since, limit);
    }
    parseTransaction(transaction, currency = undefined) {
        //
        //  fetchDeposits
        //     {
        //         "asset":"USDC",
        //         "network":"Ethereum",
        //         "address": "0x998dEc76151FB723963Bd8AFD517687b38D33dE8",
        //         "quantity":"50",
        //         "id":"5914",
        //         "status": "COMPLETED",
        //         "txId":"0xf5e79663830a0c6f94d46638dcfbc134566c12facf1832396f81ecb55d3c75dc",
        //         "creditedAt":"1714821645154"
        //     }
        //
        // fetchWithdrawals
        //     {
        //         id: '968163212989431811',
        //         asset: 'OX',
        //         network: 'Arbitrum',
        //         address: '0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9',
        //         quantity: '11.7444',
        //         fee: '1.744400000',
        //         status: 'COMPLETED',
        //         txId: '0xe96b2d128b737fdbca927edf355cff42202e65b0fb960e64ffb9bd68c121f69f',
        //         requestedAt: '1715530365450',
        //         completedAt: '1715530527000'
        //     }
        //
        // withdraw
        //     {
        //         "id": "968364664449302529",
        //         "asset": "OX",
        //         "network": "Arbitrum",
        //         "address": "0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9",
        //         "quantity": "10",
        //         "externalFee": false,
        //         "fee": "1.6728",
        //         "status": "PENDING",
        //         "requestedAt": "1715591843616"
        //     }
        //
        const id = this.safeString(transaction, 'id');
        const type = this.safeString(transaction, 'type');
        transaction = this.omit(transaction, 'type');
        let address = undefined;
        let addressTo = undefined;
        let status = undefined;
        if (type === 'deposit') {
            address = this.safeString(transaction, 'address');
            status = this.parseDepositStatus(this.safeString(transaction, 'status'));
        }
        else if (type === 'withdrawal') {
            addressTo = this.safeString(transaction, 'address');
            status = this.parseWithdrawalStatus(this.safeString(transaction, 'status'));
        }
        const txid = this.safeString(transaction, 'txId');
        const currencyId = this.safeString(transaction, 'asset');
        const code = this.safeCurrencyCode(currencyId, currency);
        const network = this.safeString(transaction, 'network');
        const networkCode = this.networkIdToCode(network);
        const timestamp = this.safeInteger2(transaction, 'creditedAt', 'requestedAt');
        const amount = this.safeNumber(transaction, 'quantity');
        const feeCost = this.safeNumber(transaction, 'fee');
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
            'datetime': this.iso8601(timestamp),
            'network': networkCode,
            'address': address,
            'addressTo': addressTo,
            'addressFrom': undefined,
            'tag': undefined,
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
    parseDepositStatus(status) {
        const statuses = {
            'COMPLETED': 'ok',
        };
        return this.safeString(statuses, status, status);
    }
    parseWithdrawalStatus(status) {
        const statuses = {
            'COMPLETED': 'ok',
            'PROCESSING': 'pending',
            'IN SWEEPING': 'pending',
            'PENDING': 'pending',
            'ON HOLD': 'pending',
            'CANCELED': 'canceled',
            'FAILED': 'failed',
        };
        return this.safeString(statuses, status, status);
    }
    async withdraw(code, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name bitflex#withdraw
         * @description make a withdrawal
         * @see https://docs.bitflex.com/spot#withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {string} [params.network] network for withdraw
         * @param {bool} [params.externalFee] if false, then the fee is taken from the quantity, also with the burn fee for asset SOLO
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         *
         * EXCHANGE SPECIFIC PARAMETERS
         * @param {string} [params.tfaType] GOOGLE, or AUTHY_SECRET, or YUBIKEY, for 2FA
         * @param {string} [params.code] 2FA code
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [tag, params] = this.handleWithdrawTagAndParams(tag, params);
        await this.loadMarkets();
        const currency = this.currency(code);
        const stringAmount = this.currencyToPrecision(code, amount);
        const request = {
            'asset': currency['id'],
            'address': address,
            'quantity': stringAmount,
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        let networkCode = undefined;
        [networkCode, params] = this.handleNetworkCodeAndParams(params);
        if (networkCode !== undefined) {
            request['network'] = this.networkCodeToId(networkCode);
        }
        request['externalFee'] = false;
        const response = await this.privatePostV3Withdrawal(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "id": "968364664449302529",
        //             "asset": "OX",
        //             "network": "Arbitrum",
        //             "address": "0x90fc1fB49a4ED8f485dd02A2a1Cf576897f6Bfc9",
        //             "quantity": "10",
        //             "externalFee": false,
        //             "fee": "1.6728",
        //             "status": "PENDING",
        //             "requestedAt": "1715591843616"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        data['type'] = 'withdrawal';
        return this.parseTransaction(data, currency);
    }
    async fetchPositions(symbols = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchPositions
         * @description fetch all open positions
         * @see https://docs.ox.fun/?json#get-v3-positions
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.subAcc]
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        // Calling this endpoint using an API key pair linked to the parent account with the parameter "subAcc"
        // allows the caller to include positions of additional sub-accounts in the response.
        // This feature does not work when using API key pairs linked to a sub-account
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const response = await this.privateGetV3Positions(params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "accountId": "106490",
        //                 "name": "main",
        //                 "positions": [
        //                     {
        //                         "marketCode": "BTC-USD-SWAP-LIN",
        //                         "baseAsset": "BTC",
        //                         "counterAsset": "USD",
        //                         "position": "0.00010",
        //                         "entryPrice": "64300.0",
        //                         "markPrice": "63278",
        //                         "positionPnl": "-10.1900",
        //                         "estLiquidationPrice": "0",
        //                         "lastUpdatedAt": "1714915841448"
        //                     },
        //                     ...
        //                 ]
        //             },
        //             {
        //                 "accountId": "106526",
        //                 "name": "testSubAccount",
        //                 "positions": [
        //                     {
        //                         "marketCode": "ETH-USD-SWAP-LIN",
        //                         "baseAsset": "ETH",
        //                         "counterAsset": "USD",
        //                         "position": "0.001",
        //                         "entryPrice": "3080.5",
        //                         "markPrice": "3062.0",
        //                         "positionPnl": "-1.8500",
        //                         "estLiquidationPrice": "0",
        //                         "lastUpdatedAt": "1715089678013"
        //                     },
        //                     ...
        //                 ]
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        let allPositions = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const positions = this.safeList(account, 'positions', []);
            allPositions = this.arrayConcat(allPositions, positions);
        }
        return this.parsePositions(allPositions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        //     {
        //         "marketCode": "ETH-USD-SWAP-LIN",
        //         "baseAsset": "ETH",
        //         "counterAsset": "USD",
        //         "position": "0.001",
        //         "entryPrice": "3080.5",
        //         "markPrice": "3062.0",
        //         "positionPnl": "-1.8500",
        //         "estLiquidationPrice": "0",
        //         "lastUpdatedAt": "1715089678013"
        //     }
        //
        const marketId = this.safeString(position, 'marketCode');
        market = this.safeMarket(marketId, market);
        return this.safePosition({
            'info': position,
            'id': undefined,
            'symbol': market['symbol'],
            'notional': undefined,
            'marginMode': 'cross',
            'liquidationPrice': this.safeNumber(position, 'estLiquidationPrice'),
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'unrealizedPnl': this.safeNumber(position, 'positionPnl'),
            'realizedPnl': undefined,
            'percentage': undefined,
            'contracts': this.safeNumber(position, 'position'),
            'contractSize': undefined,
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': undefined,
            'side': undefined,
            'hedged': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': this.safeInteger(position, 'lastUpdatedAt'),
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'collateral': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': undefined,
            'marginRatio': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#createOrder
         * @description create a trade order
         * @see https://docs.ox.fun/?json#post-v3-orders-place
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] a unique id for the order
         * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
         * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
         * @param {string} [params.responseType] FULL or ACK
         * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {float} [params.limitPrice] Limit price for the STOP_LIMIT order
         * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
         * @param {string} [params.timeInForce] GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade)
         * @param {string} [params.selfTradePreventionMode] NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here {@link https://docs.ox.fun/?json#self-trade-prevention-modes}
         * @param {string} [params.displayQuantity] for an iceberg order, pass both quantity and displayQuantity fields in the order request
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
            'responseType': this.safeString(params, 'responseType', 'FULL'),
            'timestamp': this.safeInteger(params, 'timestamp', this.milliseconds()),
        };
        params = this.omit(params, ['responseType', 'timestamp']);
        const recvWindow = this.safeInteger(params, 'recvWindow');
        if (recvWindow !== undefined) {
            request['recvWindow'] = recvWindow;
            params = this.omit(params, 'recvWindow');
        }
        const orderRequest = this.createOrderRequest(symbol, type, side, amount, price, params);
        request['orders'] = [orderRequest];
        const response = await this.privatePostV3OrdersPlace(request);
        //
        // accepted market order responseType FULL
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "notice": "OrderMatched",
        //                 "accountId": "106490",
        //                 "orderId": "1000109901865",
        //                 "submitted": true,
        //                 "clientOrderId": "0",
        //                 "marketCode": "OX-USDT",
        //                 "status": "FILLED",
        //                 "side": "SELL",
        //                 "isTriggered": false,
        //                 "quantity": "150.0",
        //                 "amount": "0.0",
        //                 "remainQuantity": "0.0",
        //                 "matchId": "100017047880451399",
        //                 "matchPrice": "0.01465",
        //                 "matchQuantity": "150.0",
        //                 "feeInstrumentId": "USDT",
        //                 "fees": "0.0015382500",
        //                 "orderType": "MARKET",
        //                 "createdAt": "1715592472236",
        //                 "lastMatchedAt": "1715592472200",
        //                 "displayQuantity": "150.0"
        //             }
        //         ]
        //     }
        //
        // accepted limit order responseType FULL
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "notice": "OrderOpened",
        //                 "accountId": "106490",
        //                 "orderId": "1000111482406",
        //                 "submitted": true,
        //                 "clientOrderId": "0",
        //                 "marketCode": "ETH-USD-SWAP-LIN",
        //                 "status": "OPEN",
        //                 "side": "SELL",
        //                 "price": "4000.0",
        //                 "isTriggered": false,
        //                 "quantity": "0.01",
        //                 "amount": "0.0",
        //                 "orderType": "LIMIT",
        //                 "timeInForce": "GTC",
        //                 "createdAt": "1715763507682",
        //                 "displayQuantity": "0.01"
        //             }
        //         ]
        //     }
        //
        // accepted order responseType ACK
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "accountId": "106490",
        //                 "orderId": "1000109892193",
        //                 "submitted": true,
        //                 "marketCode": "OX-USDT",
        //                 "side": "BUY",
        //                 "price": "0.01961",
        //                 "isTriggered": false,
        //                 "quantity": "100",
        //                 "orderType": "MARKET",
        //                 "timeInForce": "IOC",
        //                 "createdAt": "1715591529057",
        //                 "selfTradePreventionMode": "NONE"
        //             }
        //         ]
        //     }
        //
        //  rejected order (balance insufficient)
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "code": "710001",
        //                 "message": "System failure, exception thrown -> null",
        //                 "submitted": false,
        //                 "marketCode": "OX-USDT",
        //                 "side": "BUY",
        //                 "price": "0.01961",
        //                 "amount": "100",
        //                 "orderType": "MARKET",
        //                 "timeInForce": "IOC",
        //                 "createdAt": "1715591678835",
        //                 "source": 11,
        //                 "selfTradePreventionMode": "NONE"
        //             }
        //         ]
        //     }
        //
        // rejected order (bad request)
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "code": "20044",
        //                 "message": "Amount is not supported for this order type",
        //                 "submitted": false,
        //                 "marketCode": "OX-USDT",
        //                 "side": "SELL",
        //                 "amount": "200",
        //                 "orderType": "MARKET",
        //                 "createdAt": "1715592079986",
        //                 "source": 11
        //             }
        //         ]
        //     }
        //
        const data = this.safeList(response, 'data', []);
        const order = this.safeDict(data, 0, {});
        return this.parseOrder(order);
    }
    async createOrders(orders, params = {}) {
        /**
         * @method
         * @name oxfun#createOrders
         * @description create a list of trade orders
         * @see https://docs.ox.fun/?json#post-v3-orders-place
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.timestamp] *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected.
         * @param {int} [params.recvWindow] *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
         * @param {string} [params.responseType] *for all orders* FULL or ACK
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const ordersRequests = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const symbol = this.safeString(rawOrder, 'symbol');
            const type = this.safeString(rawOrder, 'type');
            const side = this.safeString(rawOrder, 'side');
            const amount = this.safeNumber(rawOrder, 'amount');
            const price = this.safeNumber(rawOrder, 'price');
            const orderParams = this.safeDict(rawOrder, 'params', {});
            const orderRequest = this.createOrderRequest(symbol, type, side, amount, price, orderParams);
            ordersRequests.push(orderRequest);
        }
        const request = {
            'responseType': 'FULL',
            'timestamp': this.milliseconds(),
            'orders': ordersRequests,
        };
        const response = await this.privatePostV3OrdersPlace(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data);
    }
    createOrderRequest(symbol, type, side, amount, price = undefined, params = {}) {
        /**
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] a unique id for the order
         * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @param {float} [params.limitPrice] Limit price for the STOP_LIMIT order
         * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
         * @param {string} [params.timeInForce] GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade)
         * @param {string} [params.selfTradePreventionMode] NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here {@link https://docs.ox.fun/?json#self-trade-prevention-modes}
         * @param {string} [params.displayQuantity] for an iceberg order, pass both quantity and displayQuantity fields in the order request
         */
        const market = this.market(symbol);
        const request = {
            'marketCode': market['id'],
            'side': side.toUpperCase(),
            'source': 1000,
        };
        const cost = this.safeString2(params, 'cost', 'amount');
        if (cost !== undefined) {
            request['amount'] = cost; // todo costToPrecision
            params = this.omit(params, ['cost', 'amount']);
        }
        else {
            request['quantity'] = amount; // todo amountToPrecision
        }
        const triggerPrice = this.safeString2(params, 'triggerPrice', 'stopPrice');
        let orderType = type.toUpperCase();
        if (triggerPrice !== undefined) {
            if (orderType === 'MARKET') {
                orderType = 'STOP_MARKET';
            }
            else if (orderType === 'LIMIT') {
                orderType = 'STOP_LIMIT';
            }
            request['stopPrice'] = triggerPrice; // todo priceToPrecision
            params = this.omit(params, ['triggerPrice', 'stopPrice']);
        }
        request['orderType'] = orderType;
        if (orderType === 'STOP_LIMIT') {
            request['limitPrice'] = price; // todo priceToPrecision
        }
        else if (price !== undefined) {
            request['price'] = price; // todo priceToPrecision
        }
        let postOnly = undefined;
        const isMarketOrder = (orderType === 'MARKET') || (orderType === 'STOP_MARKET');
        [postOnly, params] = this.handlePostOnly(isMarketOrder, false, params);
        const timeInForce = this.safeStringUpper(params, 'timeInForce');
        if (postOnly && (timeInForce !== 'MAKER_ONLY_REPRICE')) {
            request['timeInForce'] = 'MAKER_ONLY';
        }
        return this.extend(request, params);
    }
    async createMarketBuyOrderWithCost(symbol, cost, params = {}) {
        /**
         * @method
         * @name oxfun#createMarketBuyOrderWithCost
         * @description create a market buy order by providing the symbol and cost
         * @see https://open.big.one/docs/spot_orders.html#create-order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const market = this.market(symbol);
        if (!market['spot']) {
            throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() supports spot orders only');
        }
        const request = {
            'cost': cost,
        };
        return await this.createOrder(symbol, 'market', 'buy', undefined, undefined, this.extend(request, params));
    }
    async fetchOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchOrder
         * @see https://docs.ox.fun/?json#get-v3-orders-status
         * @description fetches information on an order made by the user
         * @param {string} id a unique id for the order
         * @param {string} [symbol] not used by oxfun fetchOrder
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] the client order id of the order
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {
            'orderId': id,
        };
        const response = await this.privateGetV3OrdersStatus(this.extend(request, params));
        //
        //     {
        //         "success": true,
        //         "data": {
        //             "orderId": "1000111762980",
        //             "clientOrderId": "0",
        //             "marketCode": "ETH-USD-SWAP-LIN",
        //             "status": "OPEN",
        //             "side": "BUY",
        //             "price": "2700.0",
        //             "isTriggered": false,
        //             "remainQuantity": "0.01",
        //             "totalQuantity": "0.01",
        //             "amount": "0",
        //             "displayQuantity": "0.01",
        //             "cumulativeMatchedQuantity": "0",
        //             "orderType": "STOP_LIMIT",
        //             "timeInForce": "GTC",
        //             "source": "11",
        //             "createdAt": "1715794191277"
        //         }
        //     }
        //
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data);
    }
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.ox.fun/?json#get-v3-orders-working
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.orderId] a unique id for the order
         * @param {int} [params.clientOrderId] the client order id of the order
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
        }
        const response = await this.privateGetV3OrdersWorking(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market, since, limit);
    }
    async cancelOrder(id, symbol = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#cancelOrder
         * @description cancels an open order
         * @see https://docs.ox.fun/?json#delete-v3-orders-cancel
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.clientOrderId] a unique id for the order
         * @param {int} [params.timestamp] in milliseconds
         * @param {int} [params.recvWindow] in milliseconds
         * @param {string} [params.responseType] 'FULL' or 'ACK'
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrder() requires a symbol argument');
        }
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'timestamp': this.milliseconds(),
            'responseType': 'FULL',
        };
        const orderRequest = {
            'marketCode': marketId,
            'orderId': id,
        };
        const clientOrderId = this.safeInteger(params, 'clientOrderId');
        if (clientOrderId !== undefined) {
            orderRequest['clientOrderId'] = clientOrderId;
        }
        request['orders'] = [orderRequest];
        const response = await this.privateDeleteV3OrdersCancel(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        const order = this.safeDict(data, 0, {});
        return this.parseOrder(order);
    }
    async cancelAllOrders(symbol = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#cancelAllOrders
         * @description cancel all open orders
         * @see https://docs.ox.fun/?json#delete-v3-orders-cancel-all
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from exchange
         */
        const request = {};
        if (symbol !== undefined) {
            const market = this.market(symbol);
            request['marketCode'] = market['id'];
        }
        //
        //     {
        //         "success": true,
        //         "data": { "notice": "Orders queued for cancelation" }
        //     }
        //
        //     {
        //         "success": true,
        //         "data": { "notice": "No working orders found" }
        //     }
        //
        return await this.privateDeleteV3OrdersCancelAll(this.extend(request, params));
    }
    async cancelOrders(ids, symbol = undefined, params = {}) {
        /**
         * @method
         * @name oxfun#cancelOrders
         * @description cancel multiple orders
         * @see https://docs.ox.fun/?json#delete-v3-orders-cancel
         * @param {string[]} ids order ids
         * @param {string} [symbol] unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.timestamp] in milliseconds
         * @param {int} [params.recvWindow] in milliseconds
         * @param {string} [params.responseType] 'FULL' or 'ACK'
         * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new errors.ArgumentsRequired(this.id + ' cancelOrders() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const marketId = market['id'];
        const request = {
            'timestamp': this.milliseconds(),
            'responseType': 'FULL',
        };
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            const order = {
                'marketCode': marketId,
                'orderId': ids[i],
            };
            orders.push(order);
        }
        request['orders'] = orders;
        const response = await this.privateDeleteV3OrdersCancel(this.extend(request, params));
        const data = this.safeList(response, 'data', []);
        return this.parseOrders(data, market);
    }
    parseOrder(order, market = undefined) {
        //
        // accepted market order responseType FULL
        //     {
        //         "notice": "OrderMatched",
        //         "accountId": "106490",
        //         "orderId": "1000109901865",
        //         "submitted": true,
        //         "clientOrderId": "0",
        //         "marketCode": "OX-USDT",
        //         "status": "FILLED",
        //         "side": "SELL",
        //         "isTriggered": false,
        //         "quantity": "150.0",
        //         "amount": "0.0",
        //         "remainQuantity": "0.0",
        //         "matchId": "100017047880451399",
        //         "matchPrice": "0.01465",
        //         "matchQuantity": "150.0",
        //         "feeInstrumentId": "USDT",
        //         "fees": "0.0015382500",
        //         "orderType": "MARKET",
        //         "createdAt": "1715592472236",
        //         "lastMatchedAt": "1715592472200",
        //         "displayQuantity": "150.0"
        //     }
        //
        // accepted limit order responseType FULL
        //     {
        //         "notice": "OrderOpened",
        //         "accountId": "106490",
        //         "orderId": "1000111482406",
        //         "submitted": true,
        //         "clientOrderId": "0",
        //         "marketCode": "ETH-USD-SWAP-LIN",
        //         "status": "OPEN",
        //         "side": "SELL",
        //         "price": "4000.0",
        //         "isTriggered": false,
        //         "quantity": "0.01",
        //         "amount": "0.0",
        //         "orderType": "LIMIT",
        //         "timeInForce": "GTC",
        //         "createdAt": "1715763507682",
        //         "displayQuantity": "0.01"
        //     }
        //
        // accepted order responseType ACK
        //     {
        //         "accountId": "106490",
        //         "orderId": "1000109892193",
        //         "submitted": true,
        //         "marketCode": "OX-USDT",
        //         "side": "BUY",
        //         "price": "0.01961",
        //         "isTriggered": false,
        //         "quantity": "100",
        //         "orderType": "MARKET",
        //         "timeInForce": "IOC",
        //         "createdAt": "1715591529057",
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        //  rejected order (balance insufficient)
        //     {
        //         "code": "710001",
        //         "message": "System failure, exception thrown -> null",
        //         "submitted": false,
        //         "marketCode": "OX-USDT",
        //         "side": "BUY",
        //         "price": "0.01961",
        //         "amount": "100",
        //         "orderType": "MARKET",
        //         "timeInForce": "IOC",
        //         "createdAt": "1715591678835",
        //         "source": 11,
        //         "selfTradePreventionMode": "NONE"
        //     }
        //
        // rejected order (bad request)
        //     {
        //         "code": "20044",
        //         "message": "Amount is not supported for this order type",
        //         "submitted": false,
        //         "marketCode": "OX-USDT",
        //         "side": "SELL",
        //         "amount": "200",
        //         "orderType": "MARKET",
        //         "createdAt": "1715592079986",
        //         "source": 11
        //     }
        //
        // fetchOrder
        //     {
        //         "orderId": "1000111762980",
        //         "clientOrderId": "0",
        //         "marketCode": "ETH-USD-SWAP-LIN",
        //         "status": "OPEN",
        //         "side": "BUY",
        //         "price": "2700.0",
        //         "isTriggered": false,
        //         "remainQuantity": "0.01",
        //         "totalQuantity": "0.01",
        //         "amount": "0",
        //         "displayQuantity": "0.01",
        //         "cumulativeMatchedQuantity": "0",
        //         "orderType": "STOP_LIMIT",
        //         "timeInForce": "GTC",
        //         "source": "11",
        //         "createdAt": "1715794191277"
        //     }
        //
        const marketId = this.safeString(order, 'marketCode');
        market = this.safeMarket(marketId, market);
        const timestamp = this.safeInteger(order, 'createdAt');
        let fee = undefined;
        const feeCurrency = this.safeString(order, 'feeInstrumentId');
        if (feeCurrency !== undefined) {
            fee = {
                'currency': this.safeCurrencyCode(feeCurrency),
                'cost': this.safeNumber(order, 'fees'),
            };
        }
        let status = this.safeString(order, 'status');
        const code = this.safeInteger(order, 'code'); // rejected orders have code of the error
        if (code !== undefined) {
            status = 'rejected';
        }
        const triggerPrice = this.safeString(order, 'stopPrice');
        return this.safeOrder({
            'id': this.safeString(order, 'orderId'),
            'clientOrderId': this.safeString(order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': this.safeInteger(order, 'lastMatchedAt'),
            'lastUpdateTimestamp': this.safeInteger(order, 'lastModifiedAt'),
            'status': this.parseOrderStatus(status),
            'symbol': market['symbol'],
            'type': this.parseOrderType(this.safeString(order, 'orderType')),
            'timeInForce': this.parseOrderTimeInForce(this.safeString(order, 'timeInForce')),
            'side': this.safeStringLower(order, 'side'),
            'price': this.safeStringN(order, ['price', 'matchPrice', 'limitPrice']),
            'average': undefined,
            'amount': this.safeString2(order, 'totalQuantity', 'quantity'),
            'filled': this.safeString2(order, 'cumulativeMatchedQuantity', 'matchQuantity'),
            'remaining': this.safeString(order, 'remainQuantity'),
            'triggerPrice': triggerPrice,
            'stopLossPrice': triggerPrice,
            'cost': this.omitZero(this.safeString(order, 'amount')),
            'trades': undefined,
            'fee': fee,
            'info': order,
        }, market);
    }
    parseOrderStatus(status) {
        const statuses = {
            'OPEN': 'open',
            'PARTIALLY_FILLED': 'open',
            'PARTIAL_FILL': 'open',
            'FILLED': 'closed',
            'CANCELED': 'canceled',
            'CANCELED_BY_USER': 'canceled',
            'CANCELED_BY_MAKER_ONLY': 'rejected',
            'CANCELED_BY_FOK': 'rejected',
            'CANCELED_ALL_BY_IOC': 'rejected',
            'CANCELED_PARTIAL_BY_IOC': 'canceled',
            'CANCELED_BY_SELF_TRADE_PROTECTION': 'rejected',
        };
        return this.safeString(statuses, status, status);
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'limit',
            'STOP_LIMIT': 'limit',
            'MARKET': 'market',
            'STOP_MARKET': 'market',
        };
        return this.safeString(types, type, type);
    }
    parseOrderTimeInForce(type) {
        const types = {
            'GTC': 'GTC',
            'IOC': 'IOC',
            'FOK': 'FOK',
            'MAKER_ONLY': 'PO',
            'MAKER_ONLY_REPRICE': 'PO',
        };
        return this.safeString(types, type, type);
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.urls['api'][api];
        let url = baseUrl + '/' + path;
        let queryString = '';
        if (method === 'GET') {
            queryString = this.urlencode(params);
            if (queryString.length !== 0) {
                url += '?' + queryString;
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds();
            const isoDatetime = this.iso8601(timestamp);
            const datetimeParts = isoDatetime.split('.');
            const datetime = datetimeParts[0];
            const nonce = this.nonce();
            const urlParts = baseUrl.split('//');
            if ((method === 'POST') || (method === 'DELETE')) {
                body = this.json(params);
                queryString = body;
            }
            const msgString = datetime + '\n' + nonce.toString() + '\n' + method + '\n' + urlParts[1] + '\n/' + path + '\n' + queryString;
            const signature = this.hmac(this.encode(msgString), this.encode(this.secret), sha256.sha256, 'base64');
            headers = {
                'Content-Type': 'application/json',
                'AccessKey': this.apiKey,
                'Timestamp': datetime,
                'Signature': signature,
                'Nonce': nonce,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        if (code !== 200) {
            const responseCode = this.safeString(response, 'code', undefined);
            const feedback = this.id + ' ' + body;
            this.throwBroadlyMatchedException(this.exceptions['broad'], body, feedback);
            this.throwExactlyMatchedException(this.exceptions['exact'], responseCode, feedback);
            throw new errors.ExchangeError(feedback);
        }
        return undefined;
    }
}

module.exports = oxfun;
