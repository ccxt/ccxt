
//  ---------------------------------------------------------------------------

import Exchange from './abstract/oxfun.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Bool, Currencies, Int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class oxfun
 * @augments Exchange
 */
export default class oxfun extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'oxfun',
            'name': 'Oxfun',
            'countries': [ 'PA' ], // Panama todo check
            'version': 'v3',
            'rateLimit': 120, // 100 requests per second and 25000 per 5 minutes todo check
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
                'cancelOrder': false,
                'cancelOrders': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createDepositAddress': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': false,
                'createPostOnlyOrder': false,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deposit': false,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': false,
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
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchL3OrderBook': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrderBooks': false,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': false,
                'fetchPositionHistory': false,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPositionsForSymbol': false,
                'fetchPositionsHistory': false,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactionFee': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'setLeverage': false,
                'setMargin': false,
                'setMarginMode': false,
                'setPositionMode': false,
                'signIn': false,
                'transfer': false,
                'withdraw': false,
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
                'logo': '', // todo: add a logo
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
                        'v3/markets': 1, // unified
                        'v3/assets': 1, // unified
                        'v3/tickers': 1, // unified
                        'v3/funding/estimates': 1,
                        'v3/candles': 1, // unified
                        'v3/depth': 1, // unified
                        'v3/markets/operational': 1, // todo check if it is useful
                        'v3/exchange-trades': 1,
                        'v3/funding/rates': 1,
                        'v3/leverage/tiers': 1,
                    },
                },
                'private': {
                    'get': {
                        'v3/account': 1,
                        'v3/account/names': 1,
                        'v3/wallets': 1,
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
                        'v3/orders/ploxfun': 1,
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
                    'percentage': true, // todo check
                    'maker': this.parseNumber ('0.00020'),
                    'taker': this.parseNumber ('0.00070'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00020') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.00010') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00070') ],
                            [ this.parseNumber ('2500000'), this.parseNumber ('0.00050') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.00040') ],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            // exchange-specific options
            'options': {
                'networks': {
                    // todo: complete list of networks
                },
                'networksById': {
                    'Bitcoin': 'BTC',
                    'Ethereum': 'ERC20',
                    'Avalanche': 'AVAX',
                    'Solana': 'SOL',
                    'Arbitrum': 'ARB', // todo check
                    'Polygon': 'MATIC', // todo check
                    'Fantom': 'FTM', // todo check
                    'Base': 'ERC20', // todo check
                    'BNBSmartChain': 'BNB', // todo check
                },
            },
            'exceptions': {
                'exact': {
                    // {"success":false,"code":"20001","message":"marketCode is invalid"}
                    // {"success":false,"code":"20001","message":"timeframe is invalid"}
                    // {"success":false,"code":"20001","message":"limit exceeds the maximum"}
                    // {"success":false,"code":"20001","message":"limit is invalid"}
                    // {"success":false,"code":"20001","message":"startTime/endTime is invalid"}
                    // {"success":false,"code":"20001","message":"startTime and endTime must be within 7 days of each other"}
                    // {"success":false,"code":"20001","message":"endTime must be greater than startTime"}
                    // {"success":false,"code":"20001","message":"level exceeds the maximum"}
                    // {"success":false,"code":"20001","message":"marketCode is invalid"}
                    // {"success":false,"code":"30001","message":"Required parameter 'marketCode' is missing"}
                },
                'broad': {
                    // todo: add more error codes
                },
            },
        });
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name oxfun#fetchMarkets
         * @description retrieves data on all markets for bitmex
         * @see https://docs.ox.fun/?json#get-v3-markets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const responseFromMarkets = await this.publicGetV3Markets (params);
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
        //                     upperPriceBound: '0.02122', // todo find out what is it
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
        const marketsFromMarkets = this.safeList (responseFromMarkets, 'data', []);
        const responseFromTickers = await this.publicGetV3Tickers (params); // response from this endpoint has additional markets
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
        const marketsFromTickers = this.safeList (responseFromTickers, 'data', []);
        const markets = this.arrayConcat (marketsFromMarkets, marketsFromTickers);
        return this.parseMarkets (markets);
    }

    parseMarkets (markets): Market[] {
        const marketIds = [];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketId = this.safeString (market, 'marketCode');
            if (!this.inArray (marketId, marketIds)) {
                marketIds.push (marketId);
                result.push (this.parseMarket (market));
            }
        }
        return result;
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'marketCode', '');
        const parts = id.split ('-');
        const baseId = this.safeString (parts, 0);
        let quoteId = this.safeString (parts, 1);
        if (quoteId === 'USD') {
            quoteId = 'USDT'; // todo check
        }
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let type = this.safeStringLower (market, 'type', 'spot'); // markets from v3/tickers are spot and have no type
        let settleId = undefined;
        let settle = undefined;
        const isFuture = (type === 'future'); // the exchange has only perpetual futures
        if (isFuture) {
            type = 'swap'; // todo check
            settleId = 'OX'; // todo check
            settle = this.safeCurrencyCode ('OX'); // todo check
            symbol = symbol + ':' + settle;
        }
        const isSpot = type === 'spot';
        return this.safeMarketStructure ({
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
            'margin': false, // todo check for spot market
            'swap': isFuture,
            'future': false,
            'option': false,
            'active': true, // todo check
            'contract': isFuture,
            'linear': isFuture ? true : undefined, // todo check
            'inverse': isFuture ? false : undefined, // todo check
            'taker': this.fees['trading']['taker'],
            'maker': this.fees['trading']['maker'],
            'contractSize': isFuture ? 1 : undefined, // todo check
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': this.safeNumber (market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': this.safeNumber (market, 'minSize'),
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
            'created': undefined,
            'index': undefined, // todo what is it?
            'info': market,
        });
    }

    async fetchCurrencies (params = {}): Promise<Currencies> {
        /**
         * @method
         * @name oxfun#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://docs.ox.fun/?json#get-v3-assets
         * @param {dict} [params] extra parameters specific to the exchange API endpoint
         * @returns {dict} an associative dictionary of currencies
         */
        const response = await this.publicGetV3Assets (params);
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
        //                         "canWithdraw": false, // todo check
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
        const data = this.safeList (response, 'data', []);
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const currency = data[i];
            const id = this.safeString (currency, 'asset', ''); // todo check specific names like USDT.ARB
            const code = this.safeCurrencyCode (id);
            const networks = {};
            const chains = this.safeList (currency, 'networkList', []);
            let currencyMaxPrecision = undefined;
            let currencyDepositEnabled: Bool = undefined;
            let currencyWithdrawEnabled: Bool = undefined;
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const networkId = this.safeString (chain, 'network');
                const networkCode = this.networkIdToCode (networkId);
                const deposit = this.safeBool (chain, 'canDeposit');
                const withdraw = this.safeBool (chain, 'canWithdraw');
                const active = (deposit && withdraw);
                const minDeposit = this.safeString (chain, 'minDeposit');
                const minWithdrawal = this.safeString (chain, 'minWithdrawal');
                const precision = this.parsePrecision (this.safeString (chain, 'transactionPrecision'));
                networks[networkCode] = {
                    'id': networkId,
                    'network': networkCode,
                    'margin': undefined,
                    'deposit': deposit,
                    'withdraw': withdraw,
                    'active': active,
                    'fee': undefined,
                    'precision': this.parseNumber (precision),
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
                currencyDepositEnabled = (currencyDepositEnabled === undefined) || deposit ? deposit : currencyDepositEnabled;
                currencyWithdrawEnabled = (currencyWithdrawEnabled === undefined) || withdraw ? withdraw : currencyWithdrawEnabled;
                currencyMaxPrecision = (currencyMaxPrecision === undefined) || Precise.stringGt (currencyMaxPrecision, precision) ? precision : currencyMaxPrecision;
            }
            result[code] = {
                'id': id,
                'code': code,
                'name': undefined,
                'type': undefined,
                'active': undefined, // todo check
                'deposit': currencyDepositEnabled,
                'withdraw': currencyWithdrawEnabled,
                'fee': undefined,
                'precision': this.parseNumber (currencyMaxPrecision),
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

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name oxfun#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://docs.ox.fun/?json#get-v3-tickers
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const response = await this.publicGetV3Tickers (params);
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
        const tickers = this.safeList (response, 'data', []);
        return this.parseTickers (tickers, symbols);
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name oxfun#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://docs.ox.fun/?json#get-v3-tickers
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketCode': market['id'],
        };
        const response = await this.publicGetV3Tickers (this.extend (request, params));
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
        const data = this.safeList (response, 'data', []);
        const ticker = this.safeDict (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market: Market = undefined): Ticker { // todo make sure the parsed ticker is correct
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
        const timestamp = this.safeInteger (ticker, 'lastUpdatedAt');
        const marketId = this.safeString (ticker, 'marketCode');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const last = this.safeString (ticker, 'lastTradedPrice');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'open24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeNumber (ticker, 'currencyVolume24h'), // todo check
            'quoteVolume': undefined,
            'info': ticker,
        }, market);
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        timeframe = this.safeString (this.timeframes, timeframe, timeframe);
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
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
        }
        // todo should we add this?
        // else if (since !== undefined) {
        //     request['endTime'] = this.sum (since, 7 * 24 * 60 * 60 * 1000);
        // }
        const response = await this.publicGetV3Candles (this.extend (request, params));
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
        const result = this.safeList (response, 'data', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
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
            this.safeInteger (ohlcv, 'openedAt'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'currencyVolume'),
        ];
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (limit !== undefined) {
            request['level'] = limit;
        }
        const response = await this.publicGetV3Depth (this.extend (request, params));
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
        const data = this.safeDict (response, 'data');
        const timestamp = this.safeInteger (data, 'lastUpdatedAt');
        return this.parseOrderBook (data, market['symbol'], timestamp);
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
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
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (since !== undefined) {
            request['startTime'] = since; // startTime and endTime must be within 7 days of each other
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            request['endTime'] = until;
            params = this.omit (params, 'until');
        }
        // todo should we add this?
        // else if (since !== undefined) {
        //     request['endTime'] = this.sum (since, 7 * 24 * 60 * 60 * 1000);
        // }
        const response = await this.publicGetV3ExchangeTrades (this.extend (request, params));
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
        const data = this.safeList (response, 'data', []);
        return this.parseTrades (data, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        //  public fetchTrades
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
        const marketId = this.safeString (trade, 'marketCode');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (trade, 'matchedAt');
        const price = this.safeString (trade, 'matchPrice');
        const amount = this.safeString2 (trade, 'matchQuantity', 'matchedQuantity');
        const side = this.safeStringLower (trade, 'side');
        const type = this.safeStringLower2 (trade, 'matchType', 'orderMatchType');
        return this.safeTrade ({
            'id': undefined, // check for fetchMyTrades
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'order': undefined, // check for fetchMyTrades
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api];
        let query = this.omit (params, this.extractParams (path));
        const endpoint = this.implodeParams (path, params);
        url = url + '/' + endpoint;
        query = this.urlencode (query);
        if (query.length !== 0) {
            url += '?' + query;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
