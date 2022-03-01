'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class vega extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vega',
            'name': 'Vega',
            'countries': [ 'UK' ], // United Kingdom
            'enableRateLimit': true,
            'rateLimit': 500,
            'has': {
                'CORS': true,
                //
                'fetchTradingFees': false,
                'fetchLedger': false,
                'fetchOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchDeposits': false,
                'fetchTickers': true,
                'fetchTicker': true,
                'fetchWithdrawals': false,
                'fetchStatus': false,
                'fetchBalance': false,
                'fetchOpenOrders': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchTransactions': false,
                'fetchTrades': false,
                'fetchFundingFees': false,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBooks': false,
                'fetchPositions': true,
                //
                'createOrder': true,
                'cancelOrder': true,
            },
            'urls': {
                'logo': 'https://vega.xyz/favicon.ico', // todo
                'test': {
                    'public': 'https://lb.testnet.vega.xyz/datanode/rest',
                    'privateNode': 'https://lb.testnet.vega.xyz/datanode/rest',
                    'privateWallet': 'https://wallet.testnet.vega.xyz/api/v1',
                },
                'www': 'https://vega.xyz',
                'doc': 'https://docs.fairground.vega.xyz/docs/api-reference/',
            },
            'api': {
                'public': {
                    'get': [
                        'markets',
                        'markets/{market_id}',
                        'assets',
                        'assets/{id}',
                        'markets-data',
                        'markets-data/{market_id}',
                        'parties/{party_id}/orders',
                        'parties/{party_id}/positions',
                        'orders/{reference}',
                    ],
                },
                'private': {
                    'post': [ 'command' ],
                },
            },
            'exceptions': {
                'exact': {},
                'broad': {},
            },
            'options': {},
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetMarkets (params);
        const data = this.safeValue (response, 'markets');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const market = data[i];
            result.push (this.parseMarket (market));
        }
        return result;
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        const data = this.safeValue (response, 'assets');
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const asset = data[i];
            result.push (this.parseAsset (asset));
        }
        return result;
    }

    async fetchTickers (symbols = undefined, params = {}) {
        // get markets
        const marketsResponse = await this.publicGetMarkets ({});
        const markets = this.safeValue (marketsResponse, 'markets');
        // get markets datas
        const response = await this.publicGetMarketsData (params);
        const data = this.safeValue (response, 'marketsData', {});
        // parse
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const marketData = data[i];
            let market = null;
            for (let j = 0; j < markets.length; j++) {
                const m = markets[j];
                if (m.id === this.safeString (marketData, 'market')) {
                    market = m;
                    break;
                }
            }
            const parsedMarket = this.parseMarket (market);
            result.push (this.parseMarketData (marketData, parsedMarket));
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTicker() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'market_id': market['id'],
        };
        const response = await this.publicGetMarketsDataMarketId (
            this.extend (request, params)
        );
        const marketData = this.safeValue (response, 'marketData', {});
        return this.parseMarketData (marketData, market);
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const request = {
            'party_id': this.apiKey,
        };
        const response = await this.publicGetPartiesPartyIdOrders (
            this.extend (request, params)
        );
        const data = this.safeValue (response, 'orders', {});
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const order = data[i];
            result.push (this.parseOrder (order));
        }
        return result;
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrder() requires an id argument');
        }
        const request = {
            'reference': id,
        };
        const response = await this.publicGetOrdersReference (
            this.extend (request, params)
        );
        const order = this.safeValue (response, 'order', {});
        return this.parseOrder (order);
    }

    async fetchPositions (symbols = undefined, params = {}) {
        const request = {
            'party_id': this.apiKey,
        };
        const response = await this.publicGetPartiesPartyIdPositions (
            this.extend (request, params)
        );
        const data = this.safeValue (response, 'positions', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const position = data[i];
            result.push (this.parsePosition (position));
        }
        return result;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a symbol argument');
        }
        if (type === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a type argument');
        }
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a side argument');
        }
        if (amount === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires an amount argument');
        }
        await this.loadMarkets ();
        const activeKey = this.apiKey;
        const market = this.market (symbol);
        const expiresAt = this.safeValue (params, 'expiresAt');
        const reference = this.uuid ();
        const orderSubmission = {
            'marketId': market.id,
            'size': amount,
            'side': 'SIDE_' + side,
            'type': 'TYPE_' + type,
            'reference': reference,
        };
        if (price) {
            orderSubmission.price = price * Math.pow (10, market.decimalPlaces);
        }
        if (type === 'MARKET') {
            orderSubmission.timeInForce = 'TIME_IN_FORCE_IOC';
        } else if (expiresAt) {
            orderSubmission.timeInForce = 'TIME_IN_FORCE_GTT';
            orderSubmission.expiresAt = expiresAt;
        } else {
            orderSubmission.timeInForce = 'TIME_IN_FORCE_GTC';
        }
        await this.privatePostCommand ({
            'pubKey': activeKey,
            'propagate': true,
            'orderSubmission': orderSubmission,
        });
        return reference;
    }

    async amendOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' amendOrder() requires an id argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const activeKey = this.apiKey;
        const market = this.market (symbol);
        const price = this.safeString (params, 'price');
        const orderAmendment = {
            'market_id': market.id,
            'order_id': id,
        };
        if (price) {
            orderAmendment.price = {
                'value': this.parseNumber (price) * Math.pow (10, market.decimalPlaces),
            };
        }
        return await this.privatePostCommand ({
            'pubKey': activeKey,
            'propagate': true,
            'orderAmendment': orderAmendment,
        });
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires an id argument');
        }
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const activeKey = this.apiKey;
        const market = this.market (symbol);
        const orderCancellation = {
            'market_id': market.id,
            'order_id': id,
        };
        return await this.privatePostCommand ({
            'pubKey': activeKey,
            'propagate': true,
            'orderCancellation': orderCancellation,
        });
    }

    parseMarket (market) {
        // {
        //   "id": "071cc014c738d8a4f545ac3981da7ffb020af7c1b4f9cb13bd8ee1646d7ca608",
        //   "tradableInstrument": {
        //     "instrument": {
        //       "id": "",
        //       "code": "AAPL.MF21",
        //       "name": "Apple Monthly (31 Dec 2021)",
        //       "metadata": {
        //         "tags": [
        //           "formerly:4899E01009F1A721",
        //           "quote:USD",
        //           "ticker:AAPL",
        //           "class:equities/single-stock-futures",
        //           "sector:tech",
        //           "listing_venue:NASDAQ",
        //           "country:US"
        //         ]
        //       },
        //       "future": {
        //         "maturity": "2021-12-31T23:59:59Z",
        //         "settlementAsset": "993ed98f4f770d91a796faab1738551193ba45c62341d20597df70fea6704ede",
        //         "quoteName": "USD",
        //         "oracleSpecForSettlementPrice": {
        //           "id": "a9a48dea064fa88ea037588b2c1b9dc0217914483c016c578d25c2d6d8e6d64a",
        //           "createdAt": "0",
        //           "updatedAt": "0",
        //           "pubKeys": [
        //             "0x8873a1ecb80ba0ffd1e55acc0572df27381a9b65e0b6d6a9f095c92329eb29ea"
        //           ],
        //           "filters": [
        //             {
        //               "key": {
        //                 "name": "prices.AAPL.value",
        //                 "type": "TYPE_INTEGER"
        //               },
        //               "conditions": [
        //                 {
        //                   "operator": "OPERATOR_EQUALS",
        //                   "value": "1"
        //                 }
        //               ]
        //             }
        //           ],
        //           "status": "STATUS_UNSPECIFIED"
        //         },
        //         "oracleSpecForTradingTermination": {
        //           "id": "56111677ab3c0bfe3134bf20cff1bccb12a8e380e13dbf06ca8b6fade7ca20bd",
        //           "createdAt": "0",
        //           "updatedAt": "0",
        //           "pubKeys": [
        //             "0x8873a1ecb80ba0ffd1e55acc0572df27381a9b65e0b6d6a9f095c92329eb29ea"
        //           ],
        //           "filters": [
        //             {
        //               "key": {
        //                 "name": "termination.AAPL.value",
        //                 "type": "TYPE_BOOLEAN"
        //               },
        //               "conditions": [
        //                 {
        //                   "operator": "OPERATOR_EQUALS",
        //                   "value": "1"
        //                 }
        //               ]
        //             }
        //           ],
        //           "status": "STATUS_UNSPECIFIED"
        //         },
        //         "oracleSpecBinding": {
        //           "settlementPriceProperty": "prices.AAPL.value",
        //           "tradingTerminationProperty": "termination.AAPL.value"
        //         }
        //       }
        //     },
        //     "marginCalculator": {
        //       "scalingFactors": {
        //         "searchLevel": 1.1,
        //         "initialMargin": 1.5,
        //         "collateralRelease": 1.7
        //       }
        //     },
        //     "logNormalRiskModel": {
        //       "riskAversionParameter": 0.01,
        //       "tau": 0.0001140771161,
        //       "params": {
        //         "mu": 0,
        //         "r": 0.016,
        //         "sigma": 0.3
        //       }
        //     }
        //   },
        //   "decimalPlaces": "5",
        //   "fees": {
        //     "factors": {
        //       "makerFee": "0.0002",
        //       "infrastructureFee": "0.0005",
        //       "liquidityFee": "0.001"
        //     }
        //   },
        //   "openingAuction": {
        //     "duration": "211",
        //     "volume": "0"
        //   },
        //   "continuous": {
        //     "tickSize": "0.00001"
        //   },
        //   "priceMonitoringSettings": {
        //     "parameters": {
        //       "triggers": [
        //         {
        //           "horizon": "43200",
        //           "probability": 0.9999999,
        //           "auctionExtension": "600"
        //         }
        //       ]
        //     },
        //     "updateFrequency": "1"
        //   },
        //   "liquidityMonitoringParameters": {
        //     "targetStakeParameters": {
        //       "timeWindow": "3600",
        //       "scalingFactor": 10
        //     },
        //     "triggeringRatio": 0.7,
        //     "auctionExtension": "1"
        //   },
        //   "tradingMode": "TRADING_MODE_CONTINUOUS",
        //   "state": "STATE_ACTIVE",
        //   "marketTimestamps": {
        //     "proposed": "1629149403645733534",
        //     "pending": "0",
        //     "open": "1629150097933578976",
        //     "close": "1640995199000000000"
        //   }
        // }
        const id = this.safeString (market, 'id');
        const tradableInstrument = this.safeValue (market, 'tradableInstrument', {});
        const instrument = this.safeValue (tradableInstrument, 'instrument', {});
        const base = this.safeString (instrument, 'name');
        const symbol = this.safeString (instrument, 'code');
        const decimalPlaces = this.parseNumber (
            this.safeString (market, 'decimalPlaces')
        );
        const future = this.safeValue (instrument, 'future');
        const quote = this.safeString (future, 'quoteName');
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'taker': 0.0011,
            'maker': 0.0009,
            'decimalPlaces': decimalPlaces,
        };
    }

    parseAsset (asset) {
        // {
        //   "id": "6d9d35f657589e40ddfb448b7ad4a7463b66efb307527fedd2aa7df1bbd5ea61",
        //   "details": {
        //     "name": "Dai (test)",
        //     "symbol": "tDAI",
        //     "totalSupply": "21000000",
        //     "decimals": "5",
        //     "minLpStake": "1",
        //     "erc20": {
        //       "contractAddress": "0x65e92e892Fbb489ea263c8E52bb11D1c9b67C54d"
        //     }
        //   }
        // }
        const id = this.safeString (asset, 'id');
        const details = this.safeValue (asset, 'details');
        const name = this.safeString (details, 'name');
        const symbol = this.safeString (details, 'symbol');
        return {
            'id': id,
            'code': symbol,
            'name': name,
            'symbol': symbol,
        };
    }

    parseMarketData (marketData, market) {
        // {
        //   "markPrice": "6883",
        //   "bestBidPrice": "100000",
        //   "bestBidVolume": "200",
        //   "bestOfferPrice": "6881",
        //   "bestOfferVolume": "2",
        //   "bestStaticBidPrice": "100000",
        //   "bestStaticBidVolume": "200",
        //   "bestStaticOfferPrice": "6881",
        //   "bestStaticOfferVolume": "2",
        //   "midPrice": "53440",
        //   "staticMidPrice": "53440",
        //   "market": "480c6c47861bed938243d1a28a9c2270b868c98fbeb0ae7b3919437ea916b724",
        //   "timestamp": "1631133861275786810",
        //   "openInterest": "12347",
        //   "auctionEnd": "1630921087582176183",
        //   "auctionStart": "1629166883582176183",
        //   "indicativePrice": "53440",
        //   "indicativeVolume": "2",
        //   "marketTradingMode": "TRADING_MODE_MONITORING_AUCTION",
        //   "trigger": "AUCTION_TRIGGER_LIQUIDITY",
        //   "extensionTrigger": "AUCTION_TRIGGER_UNSPECIFIED",
        //   "targetStake": "73102",
        //   "suppliedStake": "61779123",
        //   "priceMonitoringBounds": [
        //     {
        //       "minValidPrice": "50369",
        //       "maxValidPrice": "56691",
        //       "trigger": {
        //         "horizon": "43200",
        //         "probability": 0.9999999,
        //         "auctionExtension": "600"
        //       },
        //       "referencePrice": 53440
        //     }
        //   ],
        //   "marketValueProxy": "61779123",
        //   "liquidityProviderFeeShare": [
        //     {
        //       "party": "0579a943b8f842eab5045f30cea3e999f6adbc85b12a95af63353034990c01aa",
        //       "equityLikeShare": "0",
        //       "averageEntryValuation": "10930526.4545441527585731"
        //     },
        //     {
        //       "party": "27db2c59ed0e104febb538314d2ace4eaebc7cf73d007cab357e32f9dae353b3",
        //       "equityLikeShare": "0",
        //       "averageEntryValuation": "14316399.26153934807115"
        //     },
        //     {
        //       "party": "6308f99aa2d2a34cb55da860d4cc7127c23ee7036832f947f4a69d30afb6797e",
        //       "equityLikeShare": "1",
        //       "averageEntryValuation": "2000001"
        //     },
        //     {
        //       "party": "af077ace8cbf3179f826f2d3485b812f6efef07d913f2ed02f295360dd78b30e",
        //       "equityLikeShare": "0",
        //       "averageEntryValuation": "10038724.1019776191943987"
        //     },
        //     {
        //       "party": "f6e59227692c5363e60987a9b9d645d65a4da11fd85aa757a1881f41b2349db7",
        //       "equityLikeShare": "0",
        //       "averageEntryValuation": "11019132.689591496895624"
        //     }
        //   ]
        // }
        const bid = this.safeNumber (marketData, 'markPrice');
        const low = this.safeNumber (marketData, 'bestBidPrice');
        const bidVolume = this.safeNumber (marketData, 'bestBidVolume');
        const high = this.safeNumber (marketData, 'bestOfferPrice');
        const askVolume = this.safeNumber (marketData, 'bestOfferVolume');
        // const timestamp = this.safeNumber (marketData, 'bestStaticBidPrice');
        // const timestamp = this.safeNumber (marketData, 'bestStaticBidVolume');
        // const timestamp = this.safeNumber (marketData, 'bestStaticOfferPrice');
        // const timestamp = this.safeNumber (marketData, 'bestStaticOfferVolume');
        // const timestamp = this.safeNumber (marketData, 'midPrice');
        // const timestamp = this.safeNumber (marketData, 'staticMidPrice');
        // const timestamp = this.safeNumber (marketData, 'market');
        const timestamp = this.safeNumber (marketData, 'timestamp'); // nano seconds
        // const timestamp = this.safeNumber (marketData, 'openInterest');
        // const timestamp = this.safeNumber (marketData, 'auctionEnd');
        // const timestamp = this.safeNumber (marketData, 'auctionStart');
        // const timestamp = this.safeNumber (marketData, 'indicativePrice');
        // const timestamp = this.safeNumber (marketData, 'indicativeVolume');
        // const timestamp = this.safeNumber (marketData, 'marketTradingMode');
        // const timestamp = this.safeNumber (marketData, 'trigger');
        // const timestamp = this.safeNumber (marketData, 'extensionTrigger');
        // const timestamp = this.safeNumber (marketData, 'targetStake');
        // const timestamp = this.safeNumber (marketData, 'suppliedStake');
        // const timestamp = this.safeValue (marketData, 'priceMonitoringBounds');
        // const timestamp = this.safeNumber (marketData, 'marketValueProxy');
        // const timestamp = this.safeValue (marketData, 'liquidityProviderFeeShare');
        const ask = bid;
        const open = ask;
        const close = ask;
        const last = bid;
        const previousClose = ask;
        const vwap = ask;
        const symbol = market.symbol;
        const info = {};
        const datetime = this.iso8601 (timestamp / 1000);
        const percentage = 10;
        const change = last - open;
        const average = (last + open) / 2;
        const baseVolume = 1;
        const quoteVolume = 1;
        return {
            'symbol': symbol,
            'info': info,
            'timestamp': timestamp,
            'datetime': datetime,
            'high': high, // highest price
            'low': low, // lowest price
            'bid': bid, // current best bid (buy) price
            'bidVolume': bidVolume, // current best bid (buy) amount (may be missing or undefined)
            'ask': ask, // current best ask (sell) price
            'askVolume': askVolume, // current best ask (sell) amount (may be missing or undefined)
            'vwap': vwap, // volume weighed average price
            'open': open, // opening price
            'close': close, // price of last trade (closing price for current period)
            'last': last, // same as `close`, duplicated for convenience
            'previousClose': previousClose, // closing price for the previous period
            'change': change, // absolute change, `last - open`
            'percentage': percentage, // relative change, `(change/open) * 100`
            'average': average, // average price, `(last + open) / 2`
            'baseVolume': baseVolume, // volume of base currency
            'quoteVolume': quoteVolume, // volume of quote currency
        };
    }

    parseOrder (order) {
        // {
        //   "id": "V0002108913-0159147688",
        //   "marketId": "582b3c311e8895b9d2a40290621121a997a90ec70a043806efda485b56cee2a6",
        //   "partyId": "e69273b4f05413ecc7191f215b5e3551d20641b7857977bc217c5a4627098b22",
        //   "side": "SIDE_BUY",
        //   "price": "20100000",
        //   "size": "1",
        //   "remaining": "1",
        //   "timeInForce": "TIME_IN_FORCE_GTC",
        //   "type": "TYPE_LIMIT",
        //   "createdAt": "1631308568051847526",
        //   "status": "STATUS_ACTIVE",
        //   "expiresAt": "0",
        //   "reference": "69785765-e602-4c9e-a7ed-c82f6efefbf9",
        //   "reason": "ORDER_ERROR_UNSPECIFIED",
        //   "updatedAt": "0",
        //   "version": "1",
        //   "batchId": "1003",
        //   "peggedOrder": null,
        //   "liquidityProvisionId": ""
        // }
        return order;
    }

    parsePosition (position) {
        // {
        //   marketId: '582b3c311e8895b9d2a40290621121a997a90ec70a043806efda485b56cee2a6',
        //   partyId: 'e69273b4f05413ecc7191f215b5e3551d20641b7857977bc217c5a4627098b22',
        //   openVolume: '2',
        //   realisedPnl: '0',
        //   unrealisedPnl: '-1840944',
        //   averageEntryPrice: '33294801',
        //   updatedAt: '1631360896254387710'
        // }
        return position;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const isPrivate = api === 'private';
        const isPrivateWallet = path === 'command';
        let url = '/' + this.implodeParams (path, params);
        if (isPrivate) {
            const token = this.secret;
            headers['Content-Type'] = 'application/json';
            if (isPrivateWallet) {
                headers['Authorization'] = 'Bearer ' + token;
            }
            body = this.json (params);
            if (isPrivateWallet) {
                url = this.implodeHostname (this.urls['test']['privateWallet']) + url;
            } else {
                url = this.implodeHostname (this.urls['test']['privateNode']) + url;
            }
        } else {
            const query = this.omit (params, this.extractParams (path));
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            url = this.implodeHostname (this.urls['test'][api]) + url;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
