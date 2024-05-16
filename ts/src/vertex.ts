
//  ---------------------------------------------------------------------------

import Exchange from './abstract/vertex.js';
import { ExchangeError, ArgumentsRequired, NotSupported, InvalidOrder, OrderNotFound, BadRequest } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE, ROUND, SIGNIFICANT_DIGITS, DECIMAL_PLACES } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, Num, MarginModification, Currencies, CancellationRequest } from './base/types.js';

//  ---------------------------------------------------------------------------

/**
 * @class vertex
 * @augments Exchange
 */
export default class vertex extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'vertex',
            'name': 'Vertex',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'addMargin': true,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': true,
                'cancelOrder': true,
                'cancelOrders': true,
                'cancelOrdersForSymbols': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': true,
                'createReduceOnlyOrder': true,
                'editOrder': true,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': false,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': undefined,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': true,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': true,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '12h': '12h',
                '1d': '1d',
                '3d': '3d',
                '1w': '1w',
                '1M': '1m',
            },
            'hostname': 'vertexprotocol.com',
            'urls': {
                'logo': '',
                'api': {
                    'v1': {
                        'archive': 'https://archive.prod.{hostname}/v1',
                        'gateway': 'https://gateway.prod.{hostname}/v1',
                        'trigger': 'https://trigger.prod.{hostname}/v1',
                    },
                    'v2': {
                        'archive': 'https://archive.prod.{hostname}/v2',
                        'gateway': 'https://gateway.prod.{hostname}/v2',
                    },
                },
                'test': {
                    'v1': {
                        'archive': 'https://archive.sepolia-test.{hostname}/v1',
                        'gateway': 'https://gateway.sepolia-test.{hostname}/v1',
                        'trigger': 'https://trigger.sepolia-test.{hostname}/v1',
                    },
                    'v2': {
                        'archive': 'https://archive.sepolia-test.{hostname}/v2',
                        'gateway': 'https://gateway.sepolia-test.{hostname}/v2',
                    },
                },
                'www': 'https://vertexprotocol.com/',
                'doc': 'https://docs.vertexprotocol.com/',
                'fees': 'https://docs.vertexprotocol.com/basics/fees',
                'referral': '',
            },
            'api': {
                'v1': {
                    'archive': {
                        'post': {
                            'info': 1,
                        },
                    },
                    'gateway': {
                        'get': {
                            'query': 1,
                            'symbols': 1,
                        },
                        'post': {
                            'query': 1,
                            'execute': 1,
                        },
                    },
                    'trigger': {
                        'post': {
                            'execute': 1,
                        },
                    },
                },
                'v2': {
                    'archive': {
                        'get': {
                            'tickers': 1,
                            'contracts': 1,
                            'trades': 1,
                            'vrtx': 1,
                        },
                    },
                    'gateway': {
                        'get': {
                            'assets': 0.6667,
                            'pairs': 1,
                            'orderbook': 1,
                        },
                    },
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
                'spot': {
                    'taker': this.parseNumber ('0.0002'),
                    'maker': this.parseNumber ('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
            },
            'options': {
                'defaultType': 'swap',
                'sandboxMode': false,
                'defaultSlippage': 0.05,
                'zeroAddress': '0x0000000000000000000000000000000000000000',
            },
        });
    }

    setSandboxMode (enabled) {
        super.setSandboxMode (enabled);
        this.options['sandboxMode'] = enabled;
    }

    parseMarket (market): Market {
        //
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC_USDC",
        //         "market_type": "spot",
        //         "name": "Bitcoin",
        //         "symbol": "BTC",
        //         "taker_fee": 0.0003,
        //         "maker_fee": 0,
        //         "can_withdraw": true,
        //         "can_deposit": true
        //     }
        //
        const marketType = this.safeString (market, 'market_type');
        const tickerId = this.safeString (market, 'ticker_id');
        const spilitTickerId = tickerId.split ('_');
        const quoteId = (spilitTickerId.length > 1) ? spilitTickerId[1] : 'USDC';
        const quote = this.safeCurrencyCode (quoteId);
        let base = this.safeString (market, 'symbol');
        let baseId = this.safeString (market, 'baseId');
        const settleId = quoteId;
        const settle = this.safeCurrencyCode (settleId);
        let symbol = base + '/' + quote;
        const spot = marketType === 'spot';
        const contract = !spot;
        const swap = !spot;
        if (swap) {
            const splitSymbol = base.split ('-');
            symbol = splitSymbol[0] + '/' + quote + ':' + settle;
        }
        const taker = this.safeNumber (market, 'taker_fee');
        const maker = this.safeNumber (market, 'maker_fee');
        return {
            'id': this.safeString (market, 'product_id'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': spot,
            'margin': undefined,
            'swap': swap,
            'future': false,
            'option': false,
            'active': true,
            'contract': contract,
            'linear': true,
            'inverse': false,
            'taker': taker,
            'maker': maker,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
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
            'created': undefined,
            'info': market,
        };
    }

    async fetchMarkets (params = {}): Promise<Market[]> {
        /**
         * @method
         * @name vertex#fetchMarkets
         * @description retrieves data on all markets for vertex
         * @see https://docs.vertexprotocol.com/developer-resources/api/v2/assets
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {};
        const response = await this.v2GatewayGetAssets (this.extend (request, params));
        //
        // [
        //     {
        //         "product_id": 2,
        //         "ticker_id": "BTC-PERP_USDC",
        //         "market_type": "perp",
        //         "name": "Bitcoin Perp",
        //         "symbol": "BTC-PERP",
        //         "maker_fee": 0.0002,
        //         "taker_fee": 0,
        //         "can_withdraw": false,
        //         "can_deposit": false
        //     },
        //     {
        //         "product_id": 1,
        //         "ticker_id": "BTC_USDC",
        //         "market_type": "spot",
        //         "name": "Bitcoin",
        //         "symbol": "BTC",
        //         "taker_fee": 0.0003,
        //         "maker_fee": 0,
        //         "can_withdraw": true,
        //         "can_deposit": true
        //     }
        // ]
        //
        const data = response.filter (function (market) {
            return market.ticker_id !== null;
        })
        return this.parseMarkets (data);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (!response) {
            return undefined; // fallback to default error handler
        }
        //
        //
        const status = this.safeString (response, 'status', '');
        let message = undefined;
        if (status === 'err') {
            message = this.safeString (response, 'response');
        } else {
            const responsePayload = this.safeDict (response, 'response', {});
            const data = this.safeDict (responsePayload, 'data', {});
            const statuses = this.safeList (data, 'statuses', []);
            const firstStatus = this.safeDict (statuses, 0);
            message = this.safeString (firstStatus, 'error');
        }
        const feedback = this.id + ' ' + body;
        const nonEmptyMessage = ((message !== undefined) && (message !== ''));
        if (nonEmptyMessage) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        }
        if (nonEmptyMessage) {
            throw new ExchangeError (feedback); // unknown message
        }
        return undefined;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const version = this.safeString (api, 0);
        const type = this.safeString (api, 1);
        const url = this.implodeHostname (this.urls['api'][version][type]) + '/' + path;
        if (method === 'POST') {
            headers = {
                'Content-Type': 'application/json',
            };
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
