'use strict';

// ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
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
                'spot': undefined,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
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
                'fetchFundingRateHistory': undefined,
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
                'fetchOHLCV': undefined,
                'fetchOpenOrder': undefined,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPermissions': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': undefined,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
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
                        'v2/delivery/public/funding': 1,
                        'v2.1/deliver-auction/{instrumentId}': 1,
                        'v2/candles/{marketCode}': 1,
                        'v2/funding-rates/{marketCode}': 1,
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
                        'v2/candles': 1,
                        'auth/self/verify': 1,
                        'borrow/': 1,
                        'repay/': 1,
                        'borrowingSummary': 1,
                        'funding-payments': 1,
                        'AMM': 1,
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
                },
                'broad': {
                },
            },
        });
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
            let linear = false;
            if (type === 'SPOT') {
                marketType = 'spot';
            } else if (type === 'FUTURE') {
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
                'inverse': false,
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

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'marketCode': market['id'],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['startTime'] = since;
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
        const id = this.safeInteger (trade, 'matchId');
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
