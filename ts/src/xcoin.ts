
//  ---------------------------------------------------------------------------

import Exchange from './abstract/xcoin.js';
import { InvalidNonce, InsufficientFunds, AuthenticationError, InvalidOrder, ExchangeError, OrderNotFound, AccountSuspended, BadSymbol, OrderImmediatelyFillable, RateLimitExceeded, OnMaintenance, PermissionDenied, BadRequest } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Dict, int, LedgerEntry, DepositAddress } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class zonda
 * @augments Exchange
 */
export default class xcoin extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'xcoin',
            'name': 'XCoin',
            'countries': [ 'HK' ], // Hong Kong
            'rateLimit': 100,
            'has': {
                'CORS': true,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
            },
            'timeframes': {
            },
            'hostname': 'xcoin.com',
            'urls': {
                'referral': '__________________________',
                'logo': '__________________________',
                'www': 'https://xcoin.com/',
                'api': {
                    'public': 'https://api.{hostname}/api',
                    'private': 'https://api.{hostname}/api',
                },
                'doc': [
                    'https://xcoin.com/docs/',
                ],
                'support': 'https://support.xcoin.com/',
                'fees': 'https://xcoin.com/zh-CN/trade/guide/spot-fee-rate',
            },
            'api': {
                'public': {
                    'get': {
                        'v1/market/time': 1,
                        'v2/public/symbols': 1,
                        'v1/market/depth': 1,
                        'v1/market/ticker/mini': 1,
                        'v1/market/trade': 1,
                        'v1/market/ticker/24hr': 1,
                        'v1/market/kline': 1,
                        'v1/market/deliveryExercise/history': 1,
                        'v1/market/fundingRate': 1,
                        'v1/market/fundingRate/history': 1,
                        'v1/public/baseRates': 1,
                    },
                },
                'private': {
                    'get': {
                        'v2/trade/openOrders': 1,
                        'v2/trade/order/info': 1,
                        'v2/history/orders': 1,
                        'v2/history/order/operations': 1,
                        'v2/history/trades': 1,
                        'v2/trade/openOrderComplex': 1,
                        'v2/history/orderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/counterparties': 1,
                        'v1/blockRfq/rfqs': 1,
                        'v1/blockRfq/quotes': 1,
                        'v1/blockRfq/trades': 1,
                        //
                        'v1/account/convert/exchangeInfo': 1,
                        'v1/account/convert/history/orders': 1,
                        'v2/trade/positions': 1,
                        'v1/trade/lever': 1,
                        'v1/account/balance': 1,
                        'v1/account/transferBalance': 1,
                        'v1/account/availableBalance': 1,
                        'v1/history/bill': 1,
                        'v1/account/interest/history': 1,
                        'v1/asset/account/info': 1,
                        'v1/asset/balances': 1,
                        'v1/asset/bill': 1,
                        'v1/asset/currencies': 1,
                        'v1/asset/deposit/address': 1,
                        'v1/asset/deposit/record': 1,
                        'v1/asset/withdrawal/address': 1,
                        'v1/asset/withdrawal/record': 1,
                        'v1/asset/transfer/history': 1,
                        'v1/asset/accountMembers': 1,
                        'v1/asset/crossTransfer/history': 1,
                        'v1/public/flexible/product': 1,
                        'v1/public/flexible/rateHistory': 1,
                        'v1/earn/flexible/records': 1,
                    },
                    'post': {
                        'v2/trade/order': 1,
                        'v2/trade/batchOrder': 1,
                        'v1/trade/cancelOrder': 1,
                        'v1/trade/batchCancelOrder': 1,
                        'v1/trade/cancelAllOrder': 1,
                        'v2/trade/orderComplex': 1,
                        'v1/trade/cancelComplex': 1,
                        'v1/trade/cancelAllOrderComplexs': 1,
                        // RFQ (currenty not available)
                        'v1/blockRfq/rfq': 1,
                        'v1/blockRfq/legPrices': 1,
                        'v1/blockRfq/cancelRfq': 1,
                        'v1/blockRfq/cancelAllRfqs': 1,
                        'v1/blockRfq/executeQuote': 1,
                        'v1/blockRfq/quote': 1,
                        'v1/blockRfq/editQuote': 1,
                        'v1/blockRfq/cancelQuote': 1,
                        'v1/blockRfq/cancelAllQuotes': 1,
                        //
                        'v1/account/convert/getQuote': 1,
                        'v1/account/convert/acceptQuote': 1,
                        //
                        'v1/trade/lever': 1,
                        'v2/trade/stopPosition': 1,
                        'v1/account/marginModeSet': 1,
                        'v1/asset/withdrawal': 1,
                        'v1/asset/transfer': 1,
                        'v1/asset/crossTransfer': 1,
                        'v1/earn/flexible/setFlexibleOnOff': 1,
                    },
                },
            },
            'options': {
            },
            'features': {
                'spot': {
                },
                'swap': {
                    'linear': undefined,
                    'inverse': undefined,
                },
                'future': {
                    'linear': undefined,
                    'inverse': undefined,
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                },
            },
        });
    }

    /**
     * @method
     * @name zonda#fetchMarkets
     * @see https://docs.zondacrypto.exchange/reference/ticker-1
     * @description retrieves data on all markets for zonda
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetV2PublicSymbols (params);
        //
        //    {
        //        "code": "0",
        //        "msg": "success",
        //        "data": [
        //            {
        //                "businessType": "linear_perpetual",
        //                "symbol": "BTC-USDT-PERP",
        //                "symbolFamily": "BTC-USDT",
        //                "quoteCurrency": "USDT",
        //                "baseCurrency": "BTC",
        //                "settleCurrency": "USDT",
        //                "ctVal": "0.0001",
        //                "tickSize": "0.1",
        //                "status": "trading",
        //                "deliveryTime": null,
        //                "deliveryFeeRate": null,
        //                "pricePrecision": "1",
        //                "quantityPrecision": "4",
        //                "onlineTime": "1750127400000",
        //                "riskEngineRate": "0.02",
        //                "maxLeverage": "75.000000000000000000",
        //                "contractType": null,
        //                "orderParameters": {
        //                    "minOrderQty": "0.0001",
        //                    "minOrderAmt": null,
        //                    "maxOrderNum": "200",
        //                    "maxTriggerOrderNum": "30",
        //                    "maxTpslOrderNum": "30",
        //                    "maxLmtOrderAmt": null,
        //                    "maxMktOrderAmt": null,
        //                    "maxLmtOrderQty": "50",
        //                    "maxMktOrderQty": "1",
        //                    "basisLimitRatio": "0.1"
        //                },
        //                "priceParameters": {
        //                    "maxLmtPriceUp": "0.05",
        //                    "minLmtPriceDown": "0.05",
        //                    "maxMktPriceUp": "0.05",
        //                    "minMktPriceDown": "0.05"
        //                },
        //                "positionParameters": {
        //                    "positionRatioThreshold": "10000000",
        //                    "positionMaxRatio": "0.1",
        //                    "positionCidMaxRatio": "0.3",
        //                    "defaultLeverRatio": "10"
        //                },
        //                "group": [
        //                    "0.1",
        //                    "1",
        //                    "10",
        //                    "100"
        //                ]
        //            },
        //        ],
        //        "ts": "1676428445631"
        //    }
        //
        const data = this.safeList (response, 'data', []);
        const result: Market[] = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const market = this.parseMarket (item);
            result.push (market);
        }
        return result;
    }

    parseMarket (item): Market {
        const id = this.safeString (item, 'symbol');
        const baseId = this.safeString (item, 'baseCurrency');
        const quoteId = this.safeString (item, 'quoteCurrency');
        const settleId = this.safeString (item, 'settleCurrency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const businessType = this.safeString (item, 'businessType');
        let marketType = undefined;
        let symbol = base + '/' + quote;
        let subType = undefined;
        if (businessType === 'spot') {
            marketType = 'spot';
        } else if (businessType === 'linear_perpetual') {
            marketType = 'swap';
            subType = 'linear';
            symbol = symbol + ':' + settle;
        }
        const expiry = this.safeInteger (item, 'deliveryTime');
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'spot',
            'spot': (marketType === 'spot'),
            'margin': false,
            'swap': (marketType === 'swap'),
            'future': false,
            'option': false,
            'active': (this.safeString (item, 'status') === 'trading'),
            'contract': (marketType === 'swap'),
            'linear': (subType === 'linear') ? true : undefined,
            'inverse': (subType === 'linear') ? false : undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': this.safeNumber (item, 'ctVal'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'optionType': undefined,
            'strike': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision (this.safeString (item, 'quantityPrecision'))),
                'price': this.safeNumber (item, 'tickSize'), // strange, but pricePrecision is different
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': this.safeInteger (item, 'maxLeverage'),
                },
                'amount': {
                    'min': undefined,
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
            'created': this.safeInteger (item, 'onlineTime'),
            'info': item,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname (this.urls['api'][api]);
        if (api === 'public') {
            const query = this.omit (params, this.extractParams (path));
            url += '/' + this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            body = this.urlencode (this.extend ({
                'method': path,
                'moment': this.nonce (),
            }, params));
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'API-Key': this.apiKey,
                'API-Hash': this.hmac (this.encode (body), this.encode (this.secret), sha512),
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // fallback to default error handler
        }
        return undefined;
    }
}
