
//  ---------------------------------------------------------------------------

import Exchange from './abstract/oxfun.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Bool, Currencies, Market, Strings, Ticker, Tickers } from './base/types.js';

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
                'fetchCurrencies': false,
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
                'fetchOHLCV': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrder': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
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
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': false,
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
                    // todo: add more error codes
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
        const response = await this.publicGetV3Markets (params);
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
        const markets = this.safeList (response, 'data', []);
        return this.parseMarkets (markets);
    }

    parseMarket (market): Market {
        const id = this.safeString (market, 'marketCode');
        const baseId = this.safeString (market, 'base');
        const quoteId = this.safeString (market, 'counter');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        let symbol = base + '/' + quote;
        let type = this.safeStringLower (market, 'type');
        let settleId = undefined;
        let settle = undefined;
        const isFuture = (type === 'future');
        if (isFuture) {
            symbol = symbol + ':' + quote;
            type = 'swap'; // todo check
            settleId = quoteId; // todo check
            settle = quote; // todo check
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

    parseTicker (ticker, market: Market = undefined): Ticker { // todo make sure the parsed ticker is correct
        //
        //     {
        //         "marketCode": "DYM-USD-SWAP-LIN",
        //         "markPrice": "3.321",
        //         "open24h": "3.315",
        //         "high24h": "3.356",
        //         "low24h": "3.255",
        //         "volume24h": "0",
        //         "currencyVolume24h": "0",
        //         "openInterest": "1768.1",
        //         "lastTradedPrice": "3.543",
        //         "lastTradedQuantity": "1.0",
        //         "lastUpdatedAt": "1714853388102"
        //     }
        //
        const timestamp = this.safeIntegerProduct (ticker, 'lastUpdatedAt', 0.001);
        const marketId = this.safeString (ticker, 'marketCode');
        const symbol = this.safeSymbol (marketId, market);
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
            'baseVolume': this.safeNumber (ticker, 'volume24h'), // todo check
            'quoteVolume': this.safeNumber (ticker, 'currencyVolume24h'), // todo check
            'info': ticker,
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
