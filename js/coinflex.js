'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, BadRequest } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

// ---------------------------------------------------------------------------

module.exports = class coinflex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinflex',
            'name': 'CoinFLEX',
            'countries': [ 'SC' ], // Seychelles
            'rateLimit': 120, // 2500 requests per 5 minutes, 100 requests per minute
            'version': 'v3',
            'certified': false,
            'has': {
                'publicAPI': true,
                'privateAPI': true,
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': true,
                'future': true,
                'option': undefined,
                'addMargin': undefined,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': undefined,
                'createLimitOrder': undefined,
                'createMarketOrder': undefined,
                'createOrder': undefined,
                'createPostOnlyOrder': undefined,
                'createStopOrder': undefined,
                'createStopLimitOrder': undefined,
                'createStopMarketOrder': undefined,
                'editOrder': 'emulated',
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchBorrowRates': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFee': undefined,
                'fetchFundingFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL2OrderBook': undefined,
                'fetchLedger': undefined,
                'fetchLedgerEntry': undefined,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': undefined,
                'fetchMarkets': true,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPermissions': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchTransfers': undefined,
                'fetchWithdrawal': undefined,
                'fetchWithdrawals': undefined,
                'loadMarkets': true,
                'reduceMargin': undefined,
                'setLeverage': undefined,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': undefined,
                'transfer': undefined,
                'withdraw': undefined,
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
                'logo': '',
                'api': {
                    'public': 'https://v2api.coinflex.com',
                    'private': 'https://v2api.coinflex.com',
                },
                'www': 'https://coinflex.com/',
                'doc': [
                    'https://docs.coinflex.com/',
                ],
                'fees': [
                    'https://coinflex.com/fees/',
                ],
                'test': {
                    'public': 'https://v2stgapi.coinflex.com',
                    'private': 'https://v2stgapi.coinflex.com',
                },
            },
            'api': {
                'public': {
                    'get': {
                        'v2/all/markets': 1,
                        'v2/all/assets': 1,
                        'v2/publictrades/{marketCode}': 1,
                        'v2/ticker': 1,
                        'v2/delivery/public/funding': 1, // superceded by v3/funding-rates
                        'v2.1/deliver-auction/{instrumentId}': 1, //
                        'v2/candles/{marketCode}': 1,
                        'v2/funding-rates/{marketCode}': 1, // meant for only: BTC-USD-REPO-LIN, ETH-USD-REPO-LIN
                        'v2/depth/{marketCode}/{level}': 1,
                        'v2/ping': 1,
                        'v2/flex-protocol/balances/{flexProtocol}': 1,
                        'v2/flex-protocol/positions/{flexProtocol}': 1,
                        'v2/flex-protocol/orders/{flexProtocol}': 1,
                        'v2/flex-protocol/trades/{flexProtocol}/{marketCode}': 1,
                        'v2/flex-protocol/delivery/orders/{flexProtocol}': 1,
                        'v3/markets': 1,
                        'v3/assets': 1,
                        'v3/tickers': 1,
                        'v3/auction': 1,
                        'v3/funding-rates': 1,
                        'v3/candles': 1,
                        'v3/depth': 1,
                        'v3/flexasset/balances': 1,
                        'v3/flexasset/positions': 1,
                        'v3/flexasset/yields': 1,
                    },
                    'post': {
                        'v3/flexasset/redeem': 1,
                        'v3/AMM/redeem': 1,
                    },
                    'delete': {
                        'v2/cancel/orders': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/accountinfo': 1,
                        'v2/balances': 1,
                        'v2/balances/{instrumentId}': 1,
                        'v2/positions': 1,
                        'v2/positions/{instrumentId}': 1,
                        'v2/trades/{marketCode}': 1,
                        'v2/orders': 1,
                        'v2.1/orders': 1,
                        'v2.1/delivery/orders': 1,
                        'v2/mint/{asset}': 1,
                        'v2/redeem/{asset}': 1,
                        'v2/funding-payments': 1,
                        'v2/AMM': 1,
                        'v3/account': 1,
                        'v3/deposit-addresses': 1,
                        'v3/deposit': 1,
                        'v3/withdrawal-addresses': 1,
                        'v3/withdrawal': 1,
                        'v3/withdrawal-fee': 1,
                        'v3/transfer': 1,
                        'v3/flexasset/mint': 1,
                        'v3/flexasset/redeem': 1,
                        'v3/flexasset/earned': 1,
                        'v3/AMM': 1,
                        'v3/AMM/balances': 1,
                        'v3/AMM/positions': 1,
                        'v3/AMM/orders': 1,
                        'v3/AMM/trades': 1,
                        'v3/AMM/hash-token': 1,
                        'v2/borrow/{asset}': 1,
                        'v2/repay/{asset}': 1,
                        'v2/borrowingSummary': 1,
                    },
                    'post': {
                        'v2.1/delivery/orders': 1,
                        'v2/orders/place': 1,
                        'v2/orders/modify': 1,
                        'v2/mint': 1,
                        'v2/redeem': 1,
                        'v2/borrow': 1,
                        'v2/repay': 1,
                        'v2/borrow/close': 1,
                        'v2/AMM/create': 1,
                        'v2/AMM/redeem': 1,
                        'v3/withdrawal': 1,
                        'v3/transfer': 1,
                        'v3/flexasset/mint': 1,
                        'v3/AMM/create': 1,
                    },
                    'delete': {
                        'v2/cancel/orders/{marketCode}': 1,
                        'v2.1/delivery/orders/{deliveryOrderId}': 1,
                        'v2/orders/cancel': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.000'),
                    'taker': this.parseNumber ('0.008'),
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'timeframes': {
                    'spot': {
                    },
                    'contract': {
                    },
                },
                'defaultType': 'spot', // spot, swap
                'networks': {
                    'TRX': 'TRC-20',
                    'TRC20': 'TRC-20',
                    'ETH': 'ERC-20',
                    'ERC20': 'ERC-20',
                    'BEP20': 'BEP-20(BSC)',
                },
            },
            'commonCurrencies': {
            },
            'exceptions': {
                'exact': {
                    '40001': BadRequest,
                },
                'broad': {
                },
            },
        });
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetV2Ping (params);
        //
        //     {
        //         "success": "true"
        //     }
        //
        const statusRaw = this.safeString (response, 'success');
        const status = this.safeString ({ 'true': 'ok', 'false': 'maintenance' }, statusRaw, statusRaw);
        const timestamp = this.milliseconds ();
        return {
            'status': status,
            'updated': timestamp,
            'eta': undefined,
            'info': response,
        };
    }

    async fetchMarkets (params = {}) {
        // v3 markets has a few less fields available for market-objects, but still enough to precede.
        const response = await this.publicGetV3Markets (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD",
        //                 "name": "BTC/USD",
        //                 "referencePair": "BTC/USD",
        //                 "base": "BTC",
        //                 "counter": "USD",
        //                 "type": "SPOT", // SPOT, FUTURE, REPO, SPREAD
        //                 "tickSize": "1",
        //                 "minSize": "0.001",
        //                 "listedAt": "1593316800000",
        //                 "upperPriceBound": "40632",
        //                 "lowerPriceBound": "37506",
        //                 "markPrice": "39069",
        //                 "lastUpdatedAt": "1651240365178"
        //             },
        //
        //         futures/spreads/repo markets just have the same structure, but different namings
        //
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "name": "BTC/USD Perp",
        //                 "referencePair": "BTC/USD",
        //                 "base": "BTC",
        //                 "counter": "USD",
        //                 "type": "FUTURE",
        //                 ...
        //             },
        //             {
        //                 "marketCode": "BTC-USD-220624-LIN",
        //                 "name": "BTC/USD Q220624",
        //                 "referencePair": "BTC/USD",
        //                 "base": "BTC",
        //                 "counter": "USD",
        //                 "type": "FUTURE",
        //                 "settlementAt": "1656072000000",
        //                 ...
        //             },
        //             {
        //                 "marketCode": "BTC-USD-REPO-LIN",
        //                 "name": "BTC/USD Repo",
        //                 "referencePair": "BTC/USD",
        //                 "base": "BTC-USD",
        //                 "counter": "BTC-USD-SWAP-LIN",
        //                 "type": "REPO",
        //                 ...
        //             },
        //             {
        //                 "marketCode": "BTC-USD-SPR-220624P-LIN",
        //                 "name": "BTC/USD SPR Q220624",
        //                 "referencePair": "BTC/USD",
        //                 "base": "BTC-USD-220624-LIN",
        //                 "counter": "BTC-USD-SWAP-LIN",
        //                 "type": "SPREAD",
        //                 "settlementAt": "1656072000000",
        //                 ...
        //             },
        //         ],
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            const id = this.safeString (market, 'marketCode');
            const baseId = this.safeString (market, 'base');
            const quoteId = this.safeString (market, 'counter');
            const settleId = this.safeString (market, 'counter');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = this.safeCurrencyCode (settleId);
            const type = this.safeString (market, 'type');
            const settlementTime = this.safeInteger (market, 'settlementAt');
            let symbol = base + '/' + quote;
            let marketType = undefined;
            let linear = undefined;
            let inverse = undefined;
            if (type === 'SPOT') {
                marketType = 'spot';
            } else if (type === 'FUTURE') {
                inverse = false;
                linear = true;
                if (settlementTime === undefined) {
                    marketType = 'swap';
                    symbol += ':' + settle;
                } else {
                    marketType = 'future';
                    symbol += ':' + settle + '-' + this.yymmdd (settlementTime);
                }
            } else if (type === 'SPREAD' || type === 'REPO') {
                continue;
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': settleId,
                'type': marketType,
                'spot': marketType === 'spot',
                'margin': false,
                'future': marketType === 'future',
                'swap': marketType === 'swap',
                'option': false,
                'active': true,
                'contract': (marketType === 'future' || marketType === 'swap'),
                'linear': linear,
                'inverse': inverse,
                'contractSize': undefined,
                'expiry': settlementTime,
                'expiryDatetime': this.iso8601 (settlementTime),
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
                        'min': this.safeNumber (market, 'upperPriceBound'),
                        'max': this.safeNumber (market, 'lowerPriceBound'),
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

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetV3Assets (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //           {
        //             "asset": "BTC",
        //             "isCollateral": true,
        //             "loanToValue": "0.950000000",
        //             "networkList": [
        //               {
        //                 "network": "BTC",
        //                 "transactionPrecision": "8",
        //                 "isWithdrawalFeeChargedToUser": true,
        //                 "canDeposit": true,
        //                 "canWithdraw": true,
        //                 "minDeposit": "0.00010",
        //                 "minWithdrawal": "0.00010",
        //                 // "tokenId": "730136783b0cb167727361cd3cbe47bfe3a327e2e91850948d1cb5e2ca8ce7de", // some coins have this prop
        //               }
        //             ]
        //           },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data');
        const result = {};
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const id = this.safeString (entry, 'asset');
            const code = this.safeCurrencyCode (id);
            let isWithdrawEnabled = true;
            let isDepositEnabled = true;
            const fees = {};
            const networks = {};
            const networkList = this.safeValue (entry, 'networkList', []);
            for (let j = 0; j < networkList.length; j++) {
                const networkItem = networkList[j];
                const networkId = this.safeString (networkItem, 'network');
                // const name = this.safeString (networkItem, 'name');
                const depositEnable = this.safeValue (networkItem, 'canDeposit');
                const withdrawEnable = this.safeValue (networkItem, 'canWithdraw');
                isDepositEnabled = isDepositEnabled || depositEnable;
                isWithdrawEnabled = isWithdrawEnabled || withdrawEnable;
                fees[networkId] = undefined;
                networks[networkId] = {
                    'id': networkId,
                    'network': networkId,
                    'active': isDepositEnabled && isWithdrawEnabled,
                    'deposit': isDepositEnabled,
                    'withdraw': isWithdrawEnabled,
                    'fee': undefined,
                    'precision': this.safeInteger (networkItem, 'transactionPrecision'),
                    'limits': {
                        'deposit': {
                            'min': this.safeNumber (networkItem, 'minDeposit'),
                            'max': undefined,
                        },
                        'withdraw': {
                            'min': this.safeNumber (networkItem, 'minWithdrawal'),
                            'max': undefined,
                        },
                    },
                    'info': networkItem,
                };
            }
            result[code] = {
                'id': id,
                'name': code,
                'code': code,
                'precision': undefined,
                'info': entry,
                'active': isWithdrawEnabled && isDepositEnabled,
                'deposit': isDepositEnabled,
                'withdraw': isWithdrawEnabled,
                'fee': undefined,
                'fees': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            };
        }
        return result;
    }

    setStartEndTimes (request, since) {
        request['startTime'] = since;
        const currentTs = this.milliseconds ();
        const distance = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (since + distance < currentTs) {
            request['endTime'] = since + distance;
        }
        return request;
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'marketCode': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request = this.setStartEndTimes (request, since);
        }
        const response = await this.publicGetV2PublictradesMarketCode (this.extend (request, params));
        //
        //     {
        //         "event": "publicTrades",
        //         "timestamp": "1651312416050",
        //         "marketCode": "BTC-USD",
        //         "data": [
        //             {
        //                 "matchId": "304734619669458401",
        //                 "matchQuantity": "0.012",
        //                 "matchPrice": "38673",
        //                 "side": "BUY",
        //                 "matchTimestamp": "1651281046230"
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'data', []);
        return this.parseTrades (trades, market, since, limit, params);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades
        //
        //     {
        //         "matchId": "304734619669458401",
        //         "matchQuantity": "0.012",
        //         "matchPrice": "38673",
        //         "side": "BUY",
        //         "matchTimestamp": "1651281046230"
        //     }
        //
        const id = this.safeString (trade, 'matchId');
        const timestamp = this.safeInteger (trade, 'matchTimestamp');
        const priceString = this.safeString (trade, 'matchPrice');
        const amountString = this.safeString (trade, 'matchQuantity');
        const sideRaw = this.safeString (trade, 'side');
        const takerOrMaker = 'taker';
        market = this.safeMarket (undefined, market);
        return this.safeTrade ({
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': undefined,
            'type': undefined,
            'takerOrMaker': takerOrMaker,
            'side': this.parseOrderSide (sideRaw),
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
            'info': trade,
        }, market);
    }

    parseOrderSide (side) {
        const sides = {
            'BUY': 'buy',
            'SELL': 'sell',
        };
        return this.safeString (sides, side, side);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetV3Tickers (params);
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD",
        //                 "markPrice": "38649",
        //                 "open24h": "38799",
        //                 "high24h": "39418.0",
        //                 "low24h": "38176.0",
        //                 "volume24h": "18650098.7500",
        //                 "currencyVolume24h": "481.898",
        //                 "openInterest": "0",
        //                 "lastTradedPrice": "38632.0",
        //                 "lastTradedQuantity": "0.001",
        //                 "lastUpdatedAt": "1651314699020"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseTickers (data, symbols, params);
    }

    async fetchTicker (symbol, params = {}) {
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
        //                 "marketCode": "BTC-USD",
        //                 "markPrice": "38649",
        //                 "open24h": "38799",
        //                 "high24h": "39418.0",
        //                 "low24h": "38176.0",
        //                 "volume24h": "18650098.7500",
        //                 "currencyVolume24h": "481.898",
        //                 "openInterest": "0",
        //                 "lastTradedPrice": "38632.0",
        //                 "lastTradedQuantity": "0.001",
        //                 "lastUpdatedAt": "1651314699020"
        //             }
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const ticker = this.safeValue (data, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //     {
        //         "marketCode": "BTC-USD",
        //         "markPrice": "38649",
        //         "open24h": "38799",
        //         "high24h": "39418.0",
        //         "low24h": "38176.0",
        //         "volume24h": "18650098.7500",
        //         "currencyVolume24h": "481.898",
        //         "openInterest": "0",
        //         "lastTradedPrice": "38632.0",
        //         "lastTradedQuantity": "0.001",
        //         "lastUpdatedAt": "1651314699020"
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'lastUpdatedAt');
        const marketId = this.safeString (ticker, 'marketCode');
        market = this.safeMarket (marketId, market);
        const close = this.safeString (ticker, 'lastTradedPrice');
        const open = this.safeString (ticker, 'open24h');
        return this.safeTicker ({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'currencyVolume24h'),
            'quoteVolume': undefined,
            'info': ticker,
        }, market, false);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['marketCode'] = market['id'];
        }
        if (since !== undefined) {
            request = this.setStartEndTimes (request, since);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetV3FundingRates (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "data": [
        //             {
        //                 "marketCode": "BTC-USD-SWAP-LIN",
        //                 "fundingRate": "0.000005000",
        //                 "netDelivered": "-18.676",
        //                 "createdAt": "1651312802926"
        //             },
        //          ]
        //      }
        //
        const data = this.safeValue (response, 'data', []);
        const rates = [];
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const timestamp = this.safeInteger (entry, 'createdAt');
            const marketId = this.safeString (entry, 'marketCode');
            rates.push ({
                'symbol': this.safeSymbol (marketId, market),
                'fundingRate': this.safeNumber (entry, 'fundingRate'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'info': entry,
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {
            'marketCode': market['id'],
            'timeframe': this.timeframes[timeframe],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request = this.setStartEndTimes (request, since);
        }
        const response = await this.publicGetV3Candles (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "timeframe": "3600s",
        //         "data": [
        //             {
        //                 "open": "38571.00000000",
        //                 "high": "38604.00000000",
        //                 "low": "38570.00000000",
        //                 "close": "38602.00000000",
        //                 "volume": "722820.88000000",
        //                 "currencyVolume": "18.74000000",
        //                 "openedAt": "1651316400000"
        //             },
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        return this.parseOHLCVs (data, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "open": "38571.00000000",
        //         "high": "38604.00000000",
        //         "low": "38570.00000000",
        //         "close": "38602.00000000",
        //         "volume": "722820.88000000",
        //         "currencyVolume": "18.74000000",
        //         "openedAt": "1651316400000"
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

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
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
        //             "lastUpdatedAt": "1651322410296",
        //             "asks": [[38563, 0.312], [38568, 0.001], [38570, 0.001], [38572, 0.002], [38574, 0.001]],
        //             "bids": [[38562, 0.001], [38558, 0.001], [38556, 0.1], [38555, 0.003], [38554, 0.445]]
        //         }
        //     }
        //
        const orderbook = this.safeValue (response, 'data', {});
        const timestamp = this.safeInteger (orderbook, 'lastUpdatedAt');
        return this.parseOrderBook (orderbook, symbol, timestamp);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        [ path, params ] = this.resolvePath (path, params);
        let url = this.urls['api'][api] + '/' + path;
        if (Object.keys (params).length) {
            if (method === 'GET') {
                url += '?' + this.urlencode (params);
            }
        }
        headers = { 'User-Agent': 'CCXT:)' };
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        //     {
        //         "success":true,
        //         "data":[...]
        //     }
        //
        // or
        //
        //     {
        //         "event": "publicTrades",
        //         "timestamp": "1651312416050",
        //         "marketCode": "BTC-USD",
        //         "data": [
        //             {
        //                 "matchId": "304734619669458401",
        //                 "matchQuantity": "0.012",
        //                 "matchPrice": "38673",
        //                 "side": "BUY",
        //                 "matchTimestamp": "1651281046230"
        //             },
        //         ]
        //     }
        //
        // or
        //
        //     {
        //         "success":false,
        //         "code":"40001",
        //         "message":"no result, please check your parameters"
        //     }
        //
        const success = this.safeValue (response, 'success');
        if (success === true) {
            return;
        }
        const event = this.safeValue (response, 'event');
        const data = this.safeValue (response, 'data');
        if (event !== undefined && Array.isArray (data)) {
            return;
        }
        const responseCode = this.safeString (response, 'code');
        if (responseCode !== '0') {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], responseCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            throw new ExchangeError (feedback);
        }
    }
};
