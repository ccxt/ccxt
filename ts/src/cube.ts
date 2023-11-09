import Exchange from './abstract/cube.js';

/**
 * @class cube
 * @extends Exchange
 */
export default class cube extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'cube',
            'name': 'Cube Exchange',
            'countries': [ 'AU', 'PL' ],
            'version': 'v1',
            // 'rateLimit': 100,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'createOrder': true,
                'editOrder': false,
                'fetchBalance': true,
                'fetchBorrowRate': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': false,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchMarginMode': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': true,
                'fetchPositionMode': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
                'ws': false,
            },
            'timeframes': {
                '1m': 1,
                '5m': 5,
                '10m': 10,
                '30m': 10,
                '1h': 60,
                '2h': 120,
                '4h': 240,
                '8h': 480,
                '12h': 720,
                '1d': 24,
                '1w': 70,
                '1M': 31,
            },
            'urls': {
                'logo': 'https://avatars.githubusercontent.com/u/128435657?s=200&v=4',
                'api': {
                    'http': 'https://cube.exchange/',
                },
                'www': 'https://cube.exchange/',
                'doc': [
                    'https://cube.exchange/docs',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'ir/v0/markets',
                        'test',
                    ],
                },
                'private': {
                    'post': [
                    ],
                },
            },
            'fees': {
                'trading': {
                    'percentage': true,
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.0'),
                },
            },
            'options': {
                'brokerId': 'ccxt',
            },
            'commonCurrencies': {
            },
        });
    }

    async fetchMarkets (params = {}) {
        // {
        //     "result": {
        //         "assets": [
        //             {
        //                 "assetId": 1,
        //                 "symbol": "BTC",
        //                 "decimals": 8,
        //                 "displayDecimals": 5,
        //                 "transactionExplorer": "https://mempool.space/tx/{}",
        //                 "addressExplorer": "https://mempool.space/address/{}",
        //                 "settles": true,
        //                 "assetType": "Crypto",
        //                 "sourceId": 1,
        //                 "metadata": {
        //                     "asset": {
        //                         "dustAmount": 3000
        //                     },
        //                     "source": {
        //                         "network": "Mainnet",
        //                         "scope": "bitcoin",
        //                         "type": "mainnet"
        //                     }
        //                 }
        //             },
        //         <array truncated>
        //         ],
        //         "markets": [
        //             {
        //                 "symbol": "ETHBTC",
        //                 "marketId": 100001,
        //                 "baseAssetId": 2,
        //                 "baseLotSize": "0x0000000000000000000000000000000000038d7ea4c68000",
        //                 "quoteAssetId": 1,
        //                 "quoteLotSize": "0x000000000000000000000000000000000000000000000001",
        //                 "priceDisplayDecimals": 5,
        //                 "protectionPriceLevels": 1000,
        //                 "priceTickSize": "0.00001",
        //                 "quantityTickSize": "0.001"
        //             }
        //          <array truncated>
        //         ]
        //     }
        // }
        const response = await this.publicGetIrV0Markets ();
        const markets = response['markets'];
        const assets = response['assets'];
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            // check if baseStr is undefined
            const base = this.safeString (assets, market.baseAssetId);
            const quote = this.safeString (assets, market.quoteAssetId);
            const symbol = market.symbol;
            result.push ({
                'id': this.safeInteger (market, 'marketId'),
                'uppercaseId': undefined,
                'symbol': symbol,
                'base': base,
                'baseId': this.safeInteger (market, market.baseAssetId),
                'quote': quote,
                'quoteId': this.safeInteger (market, market.quoteAssetId),
                'settle': undefined,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'derivative': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (market, 'minLimitBaseAmount'),
                        'max': this.safeNumber (market, 'maxLimitBaseAmount'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'precision': {
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'quotePrecision'))),
                    'amount': this.parseNumber (this.parsePrecision (this.safeString (market, 'basePrecision'))),
                },
                'active': undefined,
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchAssets () {
        const response = await this.publicGetIrV0Markets ();
        const assets = response['markets'];
        const result = [];
        for (let i = 0; i < assets.length; i++) {
            // TODO: properly parse assets
            const asset = assets[i];
            result.push (asset);
        }
        return false;
    }
}
