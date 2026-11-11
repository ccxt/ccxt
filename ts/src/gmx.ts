// ---------------------------------------------------------------------------

import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import Exchange from './abstract/gmx.js';
import { ecdsa } from './base/functions/crypto.js';
import {
    ArgumentsRequired,
    AuthenticationError,
    BadRequest,
    ExchangeError,
    InvalidOrder,
    OrderNotFound,
    RateLimitExceeded,
} from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import type {
    Balances,
    Currencies,
    CurrencyInterface,
    List,
    Dict,
    FundingRate,
    FundingRateHistory,
    FundingRates,
    Int,
    Market,
    Num,
    OHLCV,
    OpenInterest,
    OpenInterests,
    Order,
    OrderBook,
    OrderSide,
    OrderType,
    Position,
    Status,
    Str,
    Strings,
    Ticker,
    Tickers,
    Trade,
} from './base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class gmx
 * @augments Exchange
 */
export default class gmx extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'gmx',
            'name': 'GMX',
            'countries': [ ],
            'version': 'v1',
            'rateLimit': 50,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowCrossMargin': false,
                'borrowIsolatedMargin': false,
                'cancelAllOrders': false,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createReduceOnlyOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': false,
                'editOrders': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchBorrowRates': false,
                'fetchCanceledAndClosedOrders': true,
                'fetchClosedOrders': true, // via the Subsquid indexer (Reader only exposes pending orders)
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDeposit': false,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchIndexOHLCV': false,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchLiquidations': false,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true, // pending orders (Reader) + executed / cancelled orders (Subsquid indexer)
                'fetchOrderTrades': false,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTransfer': false,
                'fetchTransfers': false,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': false,
                'setLeverage': true,
                'setMarginMode': true,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
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
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/b6ee974e-64d8-4a6c-9a11-b06f529ee3ff',
                'api': {
                    'public': 'https://{chain}.gmxapi.io/v1',
                    'arbitrum': 'https://arbitrum.gmxapi.io/v1',
                    'avalanche': 'https://avalanche.gmxapi.io/v1',
                    'graphql': {
                        'arbitrum': 'https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql',
                        'avalanche': 'https://gmx.squids.live/gmx-synthetics-avalanche:prod/api/graphql',
                    },
                },
                // public JSON-RPC endpoints used for read-only Reader / ERC-20 calls,
                // override with options['rpcUrls'][chain] for a private / archive node
                'rpc': {
                    'arbitrum': 'https://arb1.arbitrum.io/rpc',
                    'avalanche': 'https://api.avax.network/ext/bc/C/rpc',
                },
                'www': 'https://gmx.io',
                'doc': [
                    'https://docs.gmx.io/docs/category/api/',
                    'https://docs.gmx.io/docs/api/gmx-api/gmx-io-gmx-public-api/',
                    'https://docs.gmx.io/docs/api/contracts/exchange-router/',
                    'https://docs.gmx.io/docs/api/contracts/reader/',
                ],
            },
            'contracts': {
                'arbitrum': {
                    'chainId': 42161,
                    'exchangeRouter': '0x7dE39FF2e232A2203196788d37e234cF8F1b83f1',
                    'router': '0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6',
                    'orderVault': '0x31eF83a530Fde1B38EE9A18093A333D8Bbbc40D5',
                    'reader': '0xfA26cBb46e2614609406de08CA1Dc7f70a684184',
                    'relayRouters': [
                        '0x5503b99308dB6923758F9A22d118207D633c4e87', // GelatoRelayRouter
                        '0xfD0596f708d9D950E0eF7b5d191e5F8e55b8a67f', // SubaccountGelatoRelayRouter
                        '0xABFC734f7CFc9352AED7a97b1F6a236eae831e8A', // MultichainOrderRouter
                        '0xAb3EDf0f3eed6804BAe1bD9bF90109ccadFD262e', // MultichainSubaccountRouter
                        '0x946CC490DFedd6016645F5ce555E0036D116f50e', // MultichainClaimsRouter
                        '0xA0Ef0Ace6E437458BB4b5F72A7c7bB43a1CdDa8d', // MultichainGlvRouter
                        '0xFd26a7E3c4A9b75Bd0dce495290Fa33af2bb4b00', // MultichainGmRouter
                        '0x3f6772B95423fC03264adf90Efb8A9922B6C8c6e', // MultichainTransferRouter
                    ],
                    'dataStore': '0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8',
                    'referralStorage': '0xe6fab3F0c7199b0d34d7FbE83394fc0e0D06e99d', // read by the V2 Reader (gmx-interface sdk/src/configs/contracts.ts)
                },
                'avalanche': {
                    'chainId': 43114,
                    'exchangeRouter': '0xc002Db96E682FFF6675966F959677285a0C45Efa',
                    'router': '0x820F5FfC5b525cD4d88Cd91aCf2c28F16530Cc68',
                    'orderVault': '0xD3D60D22d415aD43b7e64b510D86A30f19B1B12C',
                    'reader': '0xa34320a507493C71Fe35E982e496F7C5d1a7fa02',
                    'relayRouters': [
                        '0x51fe0b7919e1208a717E9B16a097C1C3D70eFbf6', // GelatoRelayRouter
                        '0xa62BD1cFE2066c5bF4180b4125BBb5116eEA26c9', // SubaccountGelatoRelayRouter
                        '0x204CC947Fddd11c90e302db2A5ac3865021D1618', // MultichainOrderRouter
                        '0x4A2826cAee8FF70d9392B171eaF398E0a2B55047', // MultichainSubaccountRouter
                        '0xa664B7E894ad5777f3419C2883911Af3692a4569', // MultichainClaimsRouter
                        '0x206B582F309724dAd259058Bc3289Ca3519F34B1', // MultichainGlvRouter
                        '0x00205f26BCc52537D12fA9b0eFA5Fcc58F03ab76', // MultichainGmRouter
                        '0xd4F6C2332b36D1Ccb22C7ac479b270fa0cA26a41', // MultichainTransferRouter
                    ],
                    'dataStore': '0x2F0b22339414ADeD7D5F06f9D604c7fF5b2fe3f6',
                    'referralStorage': '0x827ed045002ecdabeb6e2b0d1604cf5fc3d322f8', // read by the V2 Reader (gmx-interface sdk/src/configs/contracts.ts)
                },
            },
            'api': {
                'public': {
                    'get': {
                        'markets': 1,
                        'markets/info': 1,
                        'markets/config': 1,
                        'markets/values': 1,
                        'markets/tickers': 1,
                        'markets/trading-capacity': 1,
                        'pairs': 1,
                        'tokens': 1,
                        'tokens/info': 1,
                        'rates': 1,
                        'prices/ohlcv': 1,
                        'trades': 1,
                        'jit/liquidity_info': 1,
                        'stats/summary': 1,
                        'risk-oracle/markets': 1,
                    },
                },
                'private': {
                    'post': {
                        'orders/txns/prepare': 1,
                        'orders/txns/submit': 1,
                        'orders/txns/status': 1,
                        'orders/txns/edit/prepare': 1,
                        'orders/txns/cancel/prepare': 1,
                        'orders/txns/collateral/prepare': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0005'),
                    'taker': this.parseNumber ('0.0007'),
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'exceptions': {
                'exact': {},
                'broad': {
                    'Rate limit exceeded': RateLimitExceeded,
                    'Invalid parameter': BadRequest,
                    'Market not found': BadRequest,
                    'Order not found': InvalidOrder,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'defaultChain': 'arbitrum',
                'chains': [ 'arbitrum', 'avalanche' ],
                'defaultSlippage': 0.003,
                'defaultExecutionFee': '300000000000000', // 0.0003 ETH in wei
                'zeroAddress': '0x0000000000000000000000000000000000000000',
                'zeroHash': '0x0000000000000000000000000000000000000000000000000000000000000000',
                'leverage': {},
                'rpcUrls': {}, // per-chain JSON-RPC override, e.g. { 'arbitrum': 'https://...' }
                'rpcBatchSize': 100, // max JSON-RPC calls per batch request (fetchBalance)
                'readerPageSize': 100, // page size for Reader.getAccountPositions / getAccountOrders
                'tokenDecimals': {}, // lowercase token address => decimals, filled lazily
                'nativeCurrency': {
                    'arbitrum': 'ETH',
                    'avalanche': 'AVAX',
                },
            },
        });
    }

    override nonce (): number {
        return this.milliseconds ();
    }

    parseGmxPrice (price: any): Num {
        if (price === undefined) {
            return undefined;
        }
        const num = this.parseNumber (price);
        if (num === undefined) {
            return undefined;
        }
        // GMX v2 prices in oracles / raw endpoints are scaled by 10^30
        if (num > 1e20) {
            return num / 1e30;
        }
        return num;
    }

    parseGmxUsd (value: any): Num {
        if (value === undefined) {
            return undefined;
        }
        const num = this.parseNumber (value);
        if (num === undefined) {
            return undefined;
        }
        // GMX USD values in 30 decimals
        if (num > 1e20) {
            return num / 1e30;
        }
        return num;
    }

    getContractAddresses (chain?: string): Dict {
        let chainName = chain;
        if (chainName === undefined) {
            chainName = this.safeString (this.options, 'defaultChain', 'arbitrum') as string;
        }
        // GMX redeploys ExchangeRouter / Reader / Oracle when logic changes (RoleStore and DataStore stay fixed),
        // so the addresses in describe () can go stale. Override them without editing the file with
        // options['contracts'][chain] = { 'reader': '0x...', 'exchangeRouter': '0x...' }
        const contracts = this.safeDict (this.describe (), 'contracts', {});
        const overrides = this.safeDict (this.safeDict (this.options, 'contracts', {}), chainName, {});
        return this.extend (this.safeDict (contracts, chainName, {}), overrides);
    }

    pow10String (exponent: number): string {
        // '1' followed by `exponent` zeros, Precise has no stringPow
        return '1'.padEnd (exponent + 1, '0');
    }

    toContractNumber (num: number, decimals: number): string {
        const strNum = this.numberToString (num);
        const scaled = Precise.stringMul (strNum, this.pow10String (decimals));
        if (scaled === undefined) {
            return '0';
        }
        // contract integers must not carry a fractional part
        const parts = scaled.split ('.');
        return parts[0];
    }

    toContractPrice (usdPrice: number, indexTokenDecimals = 18): string {
        // contractPrice = usdPrice * 10 ** (30 - indexTokenDecimals)
        const exponent = 30 - indexTokenDecimals;
        return this.toContractNumber (usdPrice, exponent);
    }

    toContractUsd (usdAmount: number): string {
        // 30 decimals for USD amounts
        return this.toContractNumber (usdAmount, 30);
    }

    async queryGraphql (query: string, variables: Dict = {}, chain: Str = undefined): Promise<any> {
        let chainName = chain;
        if (chainName === undefined) {
            chainName = this.safeString (this.options, 'defaultChain', 'arbitrum');
        }
        const graphqlUrls = this.safeDict (this.urls['api'], 'graphql', {});
        const url = this.safeString (graphqlUrls, chainName as string, 'https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql') as string;
        const request = {
            'query': query,
            'variables': variables,
        };
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const response = await this.fetch (url, 'POST', headers, this.json (request));
        const errors = this.safeList (response, 'errors');
        if (errors !== undefined && errors.length > 0) {
            // GraphQL answers HTTP 200 with an "errors" list, e.g. when a field / filter name fails validation
            throw new ExchangeError (this.id + ' GraphQL error: ' + this.safeString (errors[0], 'message', this.json (errors[0])));
        }
        const data = this.safeDict (response, 'data', {});
        return data;
    }

    /**
     * @method
     * @name gmx#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.gmx.io/docs/api/gmx-api/get-summary/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    override async fetchStatus (params: Dict = {}): Promise<Status> {
        const response = await this.publicGetStatsSummary (params);
        //
        //     {
        //         "meta": {
        //             "schemaVersion": "1.0.0",
        //             "completeness": "complete",
        //             "asOf": 1710000000,
        //             "sources": [
        //                 {
        //                     "id": "arbitrum-v2",
        //                     "network": "arbitrum",
        //                     "version": "v2",
        //                     "health": "fresh",
        //                     "lagSeconds": 5,
        //                     "lastError": null,
        //                     "asOf": 1710000000,
        //                     "fetchedAt": 1710000005
        //                 }
        //             ]
        //         }
        //     }
        //
        const meta = this.safeDict (response, 'meta', {});
        const sources = this.safeList (meta, 'sources', []);
        let status = 'ok';
        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const health = this.safeString (source, 'health');
            const lastError = this.safeString (source, 'lastError');
            if (health === 'missing' || lastError !== undefined) {
                status = 'maintenance';
                break;
            }
        }
        const asOfSeconds = this.safeInteger (meta, 'asOf');
        const updated = (asOfSeconds !== undefined) ? asOfSeconds * 1000 : this.milliseconds ();
        return {
            'status': status,
            'updated': updated,
            'eta': undefined,
            'url': undefined,
            'info': response,
        };
    }

    /**
     * @method
     * @name gmx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.gmx.io/docs/api/gmx-api/get-tokens/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const response = await this.publicGetTokens (params) as List;
        //
        //     [
        //         {
        //             "address": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        //             "decimals": 18,
        //             "name": "Wrapped Ether",
        //             "symbol": "WETH",
        //             "isNative": false,
        //             "isWrapped": true,
        //             "isStable": false,
        //             "isSynthetic": false
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const parsed = this.parseCurrency (entry);
            const code = parsed['code'];
            result[code] = parsed;
        }
        return result;
    }

    override parseCurrency (rawCurrency: Dict): CurrencyInterface {
        const id = this.safeStringLower (rawCurrency, 'address');
        const rawSymbol = this.safeString (rawCurrency, 'symbol');
        const code = this.safeCurrencyCode (rawSymbol);
        const name = this.safeString (rawCurrency, 'name');
        const decimals = this.safeInteger (rawCurrency, 'decimals', 18);
        return this.safeCurrencyStructure ({
            'id': id,
            'name': name,
            'code': code,
            'precision': this.parsePrecision (this.numberToString (decimals)),
            'info': rawCurrency,
            'active': true,
            'deposit': undefined,
            'withdraw': undefined,
            'fee': undefined,
            'type': 'crypto',
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
        });
    }

    /**
     * @method
     * @name gmx#fetchMarkets
     * @description retrieves data on all markets for gmx
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const response = await this.publicGetMarkets (params) as List;
        //
        //     [
        //         {
        //             "marketTokenAddress": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //             "indexTokenAddress": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        //             "longTokenAddress": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        //             "shortTokenAddress": "0xaf88d065e77c8cc2239301c5e013f010b61d581d",
        //             "symbol": "ETH/USD",
        //             "isSpotOnly": false,
        //             "isListed": true,
        //             "minCollateralUsd": "10",
        //             "minPositionSizeUsd": "10",
        //             "leverageTiers": [
        //                 {
        //                     "maxLeverage": "50",
        //                     "minCollateralFactor": "0.02",
        //                     "maxPositionSize": "1000000"
        //                 }
        //             ]
        //         }
        //     ]
        //
        const result: Market[] = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            result.push (this.parseMarket (market));
        }
        return result;
    }

    override parseMarket (market: Dict): Market {
        const id = this.safeStringLower (market, 'marketTokenAddress');
        const rawSymbol = this.safeString (market, 'symbol', '');
        let isSpotOnly = this.safeBool (market, 'isSpotOnly', false);
        let base: Str = undefined;
        let quote: Str = undefined;
        let settle: Str = undefined;
        let symbol: Str = undefined;
        if (rawSymbol.startsWith ('SWAP-ONLY') || isSpotOnly) {
            isSpotOnly = true;
            const bracketIndex = rawSymbol.indexOf ('[');
            let tokensPart = rawSymbol;
            if (bracketIndex !== -1) {
                tokensPart = rawSymbol.slice (bracketIndex + 1).replace (']', '');
            }
            const tokenParts = tokensPart.split ('-');
            base = this.safeCurrencyCode (this.safeString (tokenParts, 0, 'USDC'));
            quote = this.safeCurrencyCode (this.safeString (tokenParts, 1, 'USDT'));
            symbol = base + '/' + quote;
        } else {
            // e.g. "ETH/USD [ETH-USDC]" or "ETH/USD"
            const spaceParts = rawSymbol.split (' ');
            const pairPart = this.safeString (spaceParts, 0, rawSymbol);
            const pairParts = pairPart.split ('/');
            base = this.safeCurrencyCode (this.safeString (pairParts, 0));
            quote = this.safeCurrencyCode (this.safeString (pairParts, 1, 'USD'));
            settle = 'USDC';
            if (spaceParts.length > 1) {
                const bracketPart = spaceParts[1].replace ('[', '').replace (']', '');
                const bracketTokens = bracketPart.split ('-');
                if (bracketTokens.length > 1) {
                    settle = this.safeCurrencyCode (bracketTokens[1]);
                }
            }
            symbol = base + '/' + quote + ':' + settle;
        }
        const isListed = this.safeBool (market, 'isListed', true);
        const leverageTiers = this.safeList (market, 'leverageTiers', []);
        const firstTier = this.safeDict (leverageTiers, 0, {});
        const maxLeverage = this.safeNumber (firstTier, 'maxLeverage', 50);
        return {
            'id': id,
            'symbol': symbol as string,
            'base': base as string,
            'quote': quote as string,
            'settle': settle,
            'baseId': this.safeStringLower (market, 'indexTokenAddress'),
            'quoteId': this.safeStringLower (market, 'shortTokenAddress'),
            'settleId': this.safeStringLower (market, 'shortTokenAddress'),
            'type': isSpotOnly ? 'spot' : 'swap',
            'spot': isSpotOnly,
            'margin': false,
            'swap': !isSpotOnly,
            'future': false,
            'option': false,
            'active': isListed,
            'contract': !isSpotOnly,
            'linear': !isSpotOnly,
            'inverse': false,
            'contractSize': this.parseNumber ('1'),
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber (this.parsePrecision ('4')),
                'price': this.parseNumber (this.parsePrecision ('2')),
            },
            'limits': {
                'leverage': {
                    'min': this.parseNumber ('1'),
                    'max': maxLeverage,
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
                    'min': this.parseGmxUsd (this.safeString (market, 'minPositionSizeUsd')),
                    'max': undefined,
                },
            },
            'created': this.safeInteger (market, 'listingDate'),
            'info': market,
        };
    }

    /**
     * @method
     * @name gmx#fetchTickers
     * @description fetches price tickers for multiple markets
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string[]|undefined} [symbols] unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketsTickers (params) as List;
        //
        //     [
        //         {
        //             "marketTokenAddress": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //             "symbol": "ETH/USD",
        //             "minPrice": "2600.50",
        //             "maxPrice": "2601.20",
        //             "markPrice": "2600.85",
        //             "high24h": "2650.00",
        //             "low24h": "2580.00",
        //             "open24h": "2590.00",
        //             "close24h": "2600.85",
        //             "priceChange24h": "10.85",
        //             "priceChangePercent24hBps": "41",
        //             "longInterestUsd": "15400000.00",
        //             "shortInterestUsd": "8200000.00",
        //             "fundingRateLong": "0.000010",
        //             "fundingRateShort": "-0.000010"
        //         }
        //     ]
        //
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const rawTicker = response[i];
            const marketId = this.safeStringLower (rawTicker, 'marketTokenAddress');
            const market = this.safeMarket (marketId);
            const ticker = this.parseTicker (rawTicker, market);
            const symbol = ticker['symbol'];
            if (symbol !== undefined) {
                result[symbol] = ticker;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', marketSymbols);
    }

    /**
     * @method
     * @name gmx#fetchTicker
     * @description fetches a price ticker for a specific market
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'addresses': market['id'],
        };
        const response = await this.publicGetMarketsTickers (this.extend (request, params));
        const first = this.safeDict (response, 0, {});
        return this.parseTicker (first, market);
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const bid = this.parseGmxPrice (this.safeString (ticker, 'minPrice'));
        const ask = this.parseGmxPrice (this.safeString (ticker, 'maxPrice'));
        const mark = this.parseGmxPrice (this.safeString (ticker, 'markPrice'));
        const markStr = this.safeString (ticker, 'markPrice');
        const close = this.parseGmxPrice (this.safeString (ticker, 'close24h', markStr));
        const open = this.parseGmxPrice (this.safeString (ticker, 'open24h'));
        const high = this.parseGmxPrice (this.safeString (ticker, 'high24h'));
        const low = this.parseGmxPrice (this.safeString (ticker, 'low24h'));
        const change = this.parseGmxPrice (this.safeString (ticker, 'priceChange24h'));
        const changeBps = this.safeNumber (ticker, 'priceChangePercent24hBps');
        const percentage = (changeBps !== undefined) ? changeBps / 100 : undefined;
        const oiLong = this.parseGmxUsd (this.safeString (ticker, 'longInterestUsd', '0'));
        const oiShort = this.parseGmxUsd (this.safeString (ticker, 'shortInterestUsd', '0'));
        let totalOi: Num = undefined;
        if (oiLong !== undefined && oiShort !== undefined) {
            totalOi = oiLong + oiShort;
        } else if (oiLong !== undefined) {
            totalOi = oiLong;
        } else {
            totalOi = oiShort;
        }
        const marketId = this.safeStringLower (ticker, 'marketTokenAddress');
        const marketObj = this.safeMarket (marketId, market);
        return this.safeTicker ({
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': undefined,
            'ask': ask,
            'askVolume': undefined,
            'vwap': undefined,
            'open': open,
            'close': close,
            'last': close,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'openInterest': totalOi,
            'indexPrice': undefined,
            'markPrice': mark,
            'info': ticker,
        }, marketObj);
    }

    /**
     * @method
     * @name gmx#fetchOrderBook
     * @description fetches synthetic depth derived from market capacity and ticker prices
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @see https://docs.gmx.io/docs/api/gmx-api/get-trading-capacity/
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] order book depth limit
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    override async fetchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'addresses': market['id'],
        };
        const response = await this.publicGetMarketsTickers (this.extend (request, params));
        const rawTicker = this.safeDict (response, 0, {});
        const bid = this.parseGmxPrice (this.safeString (rawTicker, 'minPrice'));
        const ask = this.parseGmxPrice (this.safeString (rawTicker, 'maxPrice'));
        const capacityShort = this.safeDict (rawTicker, 'capacityShort', {});
        const capacityLong = this.safeDict (rawTicker, 'capacityLong', {});
        const bidCapacityRaw = this.safeString (capacityShort, 'availableLiquidity', this.safeString (rawTicker, 'availableLiquidityShort', '0'));
        const askCapacityRaw = this.safeString (capacityLong, 'availableLiquidity', this.safeString (rawTicker, 'availableLiquidityLong', '0'));
        const bidCapacityUsd = this.parseGmxUsd (bidCapacityRaw);
        const askCapacityUsd = this.parseGmxUsd (askCapacityRaw);
        let bidAmount = undefined;
        if (bid !== undefined && bid > 0 && bidCapacityUsd !== undefined) {
            bidAmount = bidCapacityUsd / bid;
        }
        let askAmount = undefined;
        if (ask !== undefined && ask > 0 && askCapacityUsd !== undefined) {
            askAmount = askCapacityUsd / ask;
        }
        const bids: any[] = (bid !== undefined && bidAmount !== undefined) ? [ [ bid, bidAmount ] ] : [];
        const asks: any[] = (ask !== undefined && askAmount !== undefined) ? [ [ ask, askAmount ] ] : [];
        const orderbook = {
            'symbol': market['symbol'],
            'bids': bids,
            'asks': asks,
            'timestamp': undefined,
            'datetime': undefined,
            'nonce': undefined,
        };
        return this.parseOrderBook (orderbook, market['symbol']);
    }

    /**
     * @method
     * @name gmx#fetchOHLCV
     * @description fetches historical candlestick data
     * @see https://docs.gmx.io/docs/api/gmx-api/get-ohlcv/
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe candle timeframe
     * @param {int} [since] timestamp in ms of earliest candle
     * @param {int} [limit] maximum number of candles
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of [timestamp, open, high, low, close, volume]
     */
    override async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (market['spot']) {
            throw new BadRequest (this.id + ' fetchOHLCV () is only supported for perpetual swap markets (e.g. ETH/USD:USDC, BTC/USD:USDC), not spot-only swap pools (' + symbol + ')');
        }
        const request: Dict = {
            'symbol': market['base'],
            'timeframe': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetPricesOhlcv (this.extend (request, params)) as List;
        //
        //     [
        //         {
        //             "timestamp": 1690000000,
        //             "open": "2600.0",
        //             "high": "2610.0",
        //             "low": "2595.0",
        //             "close": "2605.0"
        //         }
        //     ]
        //
        const result: OHLCV[] = [];
        for (let i = 0; i < response.length; i++) {
            result.push (this.parseOHLCV (response[i], market));
        }
        return this.sortBy (result, 0);
    }

    override parseOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
        const timestamp = this.safeInteger (ohlcv, 'timestamp');
        const ms = (timestamp !== undefined && timestamp < 10000000000) ? timestamp * 1000 : timestamp;
        return [
            ms,
            this.parseGmxPrice (this.safeString (ohlcv, 'open')),
            this.parseGmxPrice (this.safeString (ohlcv, 'high')),
            this.parseGmxPrice (this.safeString (ohlcv, 'low')),
            this.parseGmxPrice (this.safeString (ohlcv, 'close')),
            0,
        ];
    }

    /**
     * @method
     * @name gmx#fetchTrades
     * @description get trade history for a specific market and account address
     * @see https://docs.gmx.io/docs/api/gmx-api/get-trades/
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of earliest trade
     * @param {int} [limit] maximum number of trades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] target account wallet address (required by GMX)
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const address = this.safeString (params, 'address', this.walletAddress);
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTrades () requires an "address" param or exchange.walletAddress configured, because the GMX /trades API filters strictly by wallet address');
        }
        const request: Dict = {
            'address': address,
            'marketAddress': market['id'],
        };
        if (since !== undefined) {
            request['since'] = Math.floor (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'address');
        const response = await this.publicGetTrades (this.extend (request, query));
        //
        //     {
        //         "hasMore": false,
        //         "nextCursor": null,
        //         "trades": [
        //             {
        //                 "id": "0x123...",
        //                 "timestamp": 1690000000,
        //                 "transactionHash": "0xabc...",
        //                 "marketAddress": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //                 "isLong": true,
        //                 "executionPrice": "2600.50",
        //                 "sizeDeltaUsd": "10000.0",
        //                 "sizeDeltaInTokens": "3.84"
        //             }
        //         ]
        //     }
        //
        const trades = this.safeList (response, 'trades', []);
        await this.ensureTradeTokenDecimals (trades);
        return this.parseTrades (trades, market, since, limit);
    }

    parseScaledNumber (raw: Str, decimals: number): Num {
        if (raw === undefined) {
            return undefined;
        }
        if (raw.indexOf ('.') >= 0) {
            return this.parseNumber (raw); // already a human readable decimal
        }
        return this.parseNumber (Precise.stringDiv (raw, this.pow10String (decimals), 18));
    }

    async ensureTradeTokenDecimals (trades: any[]): Promise<void> {
        // parseTrade () is synchronous, so the index token decimals of every traded market are resolved first
        const addresses: string[] = [];
        for (let i = 0; i < trades.length; i++) {
            const market = this.safeMarket (this.safeStringLower (trades[i], 'marketAddress'));
            const indexTokenAddress = this.safeStringLower (this.safeDict (market, 'info', {}), 'indexTokenAddress');
            if (indexTokenAddress !== undefined) {
                addresses.push (indexTokenAddress);
            }
        }
        await this.ensureTokenDecimals (addresses);
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'id');
        const timestampSeconds = this.safeInteger (trade, 'timestamp');
        const timestamp = (timestampSeconds !== undefined && timestampSeconds < 10000000000) ? timestampSeconds * 1000 : timestampSeconds;
        const isLong = this.safeBool (trade, 'isLong', true);
        const side = isLong ? 'buy' : 'sell';
        const marketId = this.safeStringLower (trade, 'marketAddress');
        const marketObj = this.safeMarket (marketId, market);
        // live /trades values are integers: executionPrice = usd * 10^(30 - indexTokenDecimals), sizeDeltaUsd has 30 decimals and
        // sizeDeltaInTokens uses the index token decimals (a value with a decimal point is taken as already human readable)
        const indexDecimals = this.tokenDecimals (this.safeStringLower (this.safeDict (marketObj, 'info', {}), 'indexTokenAddress'));
        const price = this.parseScaledNumber (this.safeString (trade, 'executionPrice'), 30 - indexDecimals);
        const cost = this.parseScaledNumber (this.safeString (trade, 'sizeDeltaUsd'), 30);
        let amount = this.parseScaledNumber (this.safeString (trade, 'sizeDeltaInTokens'), indexDecimals);
        if (amount === undefined && cost !== undefined && price !== undefined && price > 0) {
            amount = cost / price;
        }
        const orderKey = this.safeString (trade, 'orderKey');
        const feeCost = this.parseGmxUsd (this.safeString (trade, 'positionFeeAmount'));
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': 'USD',
            };
        }
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'order': orderKey,
            'type': 'market',
            'side': side,
            'takerOrMaker': 'taker',
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        }, marketObj);
    }

    /**
     * @method
     * @name gmx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    override async fetchFundingRate (symbol: string, params: Dict = {}): Promise<FundingRate> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'addresses': market['id'],
        };
        const response = await this.publicGetMarketsTickers (this.extend (request, params));
        const first = this.safeDict (response, 0, {});
        return this.parseFundingRate (first, market);
    }

    /**
     * @method
     * @name gmx#fetchFundingRates
     * @description fetch funding rates for multiple markets
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string[]|undefined} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}
     */
    override async fetchFundingRates (symbols: Strings = undefined, params: Dict = {}): Promise<FundingRates> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketsTickers (params) as List;
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeStringLower (entry, 'marketTokenAddress');
            const market = this.safeMarket (marketId);
            const fundingRate = this.parseFundingRate (entry, market);
            const symbol = fundingRate['symbol'];
            if (symbol !== undefined) {
                result[symbol] = fundingRate;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', marketSymbols);
    }

    /**
     * @method
     * @name gmx#fetchFundingRateHistory
     * @description fetches historical funding rate snapshots
     * @see https://docs.gmx.io/docs/api/gmx-api/get-rates/
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of earliest rate snapshot
     * @param {int} [limit] maximum number of snapshots to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    override async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<FundingRateHistory[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'address': market['id'],
            'period': '1d',
        };
        const response = await this.publicGetRates (this.extend (request, params));
        //
        //     [
        //         {
        //             "marketAddress": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //             "ratesSnapshots": [
        //                 {
        //                     "timestamp": 1710000000,
        //                     "fundingRateLong": "0.000010",
        //                     "fundingRateShort": "-0.000010",
        //                     "borrowingRateLong": "0.000020",
        //                     "borrowingRateShort": "0.000015",
        //                     "netRateLong": "0.000030",
        //                     "netRateShort": "0.000005"
        //                 }
        //             ]
        //         }
        //     ]
        //
        const first = this.safeDict (response, 0, {});
        const snapshots = this.safeList (first, 'ratesSnapshots', []);
        const result: FundingRateHistory[] = [];
        for (let i = 0; i < snapshots.length; i++) {
            const snapshot = snapshots[i];
            const timestampSeconds = this.safeInteger (snapshot, 'timestamp');
            const timestamp = (timestampSeconds !== undefined && timestampSeconds < 10000000000) ? timestampSeconds * 1000 : timestampSeconds;
            result.push ({
                'info': snapshot,
                'symbol': market['symbol'],
                'fundingRate': this.safeNumber (snapshot, 'fundingRateLong'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        return this.sortBy (result, 'timestamp');
    }

    override parseFundingRate (contract: any, market: Market = undefined): FundingRate {
        const marketId = this.safeStringLower (contract, 'marketTokenAddress', this.safeStringLower (contract, 'marketAddress'));
        const marketObj = this.safeMarket (marketId, market);
        const fundingRate = this.safeNumber (contract, 'fundingRateLong');
        const markPrice = this.safeNumber (contract, 'markPrice');
        return {
            'info': contract,
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'markPrice': markPrice,
            'indexPrice': undefined,
            'interestRate': undefined,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': undefined,
            'fundingDatetime': undefined,
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': '1h',
        };
    }

    /**
     * @method
     * @name gmx#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterest (symbol: string, params: Dict = {}): Promise<OpenInterest> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'addresses': market['id'],
        };
        const response = await this.publicGetMarketsTickers (this.extend (request, params));
        const first = this.safeDict (response, 0, {});
        return this.parseOpenInterest (first, market);
    }

    /**
     * @method
     * @name gmx#fetchOpenInterests
     * @description Retrieves open interests for multiple symbols
     * @see https://docs.gmx.io/docs/api/gmx-api/get-markets-tickers/
     * @param {string[]} [symbols] a list of unified CCXT symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    override async fetchOpenInterests (symbols: Strings = undefined, params: Dict = {}): Promise<OpenInterests> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const response = await this.publicGetMarketsTickers (params) as List;
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const marketId = this.safeStringLower (entry, 'marketTokenAddress');
            const market = this.safeMarket (marketId);
            const openInterest = this.parseOpenInterest (entry, market);
            const symbol = openInterest['symbol'];
            if (symbol !== undefined) {
                result[symbol] = openInterest;
            }
        }
        return this.filterByArrayTickers (result, 'symbol', marketSymbols);
    }

    override parseOpenInterest (interest: Dict, market: Market = undefined): OpenInterest {
        const oiLong = this.safeNumber (interest, 'longInterestUsd', 0);
        const oiShort = this.safeNumber (interest, 'shortInterestUsd', 0);
        let totalOi: Num = undefined;
        if (oiLong !== undefined && oiShort !== undefined) {
            totalOi = oiLong + oiShort;
        }
        const marketId = this.safeStringLower (interest, 'marketTokenAddress');
        const marketObj = this.safeMarket (marketId, market);
        return this.safeOpenInterest ({
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'openInterestAmount': undefined,
            'openInterestValue': totalOi,
            'timestamp': undefined,
            'datetime': undefined,
            'info': interest,
        }, marketObj);
    }

    override handleErrors (code: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        if (error !== undefined) {
            const feedback = this.id + ' ' + error;
            this.throwExactlyMatchedException (this.exceptions['exact'], error, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], error, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }

    override sign (path: string, api: any = 'public', method = 'GET', params: Dict = {}, headers: any = undefined, body: any = undefined): Dict {
        //
        // builds the REST request. The signature itself is NOT created here: GMX express orders are authorised by an EIP-712
        // signature over typed data that the API returns from POST /orders/txns/prepare. That signing (validation of the server
        // supplied typed data + keccak + secp256k1) lives in signTypedDataPayload (), called from the prepare -> sign -> submit
        // flow in executeExpress (); the signature then travels inside the JSON body of POST /orders/txns/submit.
        //
        let chain = this.safeString (this.options, 'defaultChain', 'arbitrum');
        let query = params;
        if ('chain' in params) {
            chain = params['chain'];
            query = this.omit (params, 'chain');
        }
        let requestBody = body;
        let requestHeaders = headers;
        const publicUrl = this.urls['api']['public'] as string;
        let url = publicUrl.replace ('{chain}', chain as string) + '/' + path;
        if (method === 'POST') {
            requestBody = this.json (query);
        } else if (Object.keys (query).length > 0) {
            url = url + '?' + this.urlencode (query);
        }
        requestHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        return {
            'url': url,
            'method': method,
            'body': requestBody,
            'headers': requestHeaders,
        };
    }

    // -----------------------------------------------------------------------
    // SECTION 2: EVM / SMART CONTRACT METHODS
    //
    // Read side: JSON-RPC eth_call against the GMX Reader / ERC-20 contracts using a tiny
    // hand rolled ABI codec (no web3 / ethers dependency, keccak comes from @noble/hashes).
    // Write side (createOrder / cancelOrder) only PREPARES contract params / calldata,
    // nothing is signed or broadcast, see the note in sign ().
    // -----------------------------------------------------------------------

    // ---- chain / account helpers ------------------------------------------

    handleChain (params: Dict = {}): [ string, Dict ] {
        const chain = this.safeString (params, 'chain', this.safeString (this.options, 'defaultChain', 'arbitrum'));
        return [ chain, this.omit (params, 'chain') ];
    }

    getUserAddress (methodName: string, params: Dict = {}): [ string, Dict ] {
        const address = this.safeString2 (params, 'address', 'user', this.walletAddress);
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' ' + methodName + ' () requires an "address" param or exchange.walletAddress to be configured');
        }
        return [ address, this.omit (params, [ 'address', 'user' ]) ];
    }

    getRpcUrl (chain: Str = undefined): string {
        let chainName = chain;
        if (chainName === undefined) {
            chainName = this.safeString (this.options, 'defaultChain', 'arbitrum');
        }
        const custom = this.safeDict (this.options, 'rpcUrls', {});
        const urls = this.safeDict (this.urls, 'rpc', {});
        const url = this.safeString (custom, chainName as string, this.safeString (urls, chainName as string));
        if (url === undefined) {
            throw new BadRequest (this.id + ' no JSON-RPC url configured for chain ' + chainName + ', set options["rpcUrls"]["' + chainName + '"]');
        }
        return url;
    }

    // ---- JSON-RPC ---------------------------------------------------------

    async rpcRequest (method: string, rpcParams: any[], chain: Str = undefined): Promise<string> {
        const url = this.getRpcUrl (chain);
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': method,
            'params': rpcParams,
        };
        const headers = { 'Content-Type': 'application/json' };
        const response = await this.fetch (url, 'POST', headers, this.json (request));
        const error = this.safeDict (response, 'error');
        if (error !== undefined) {
            const message = this.safeString (error, 'message', 'unknown error');
            throw new ExchangeError (this.id + ' ' + method + ' JSON-RPC error: ' + message);
        }
        return this.safeString (response, 'result') as string;
    }

    async rpcBatch (calls: Dict[], chain: Str = undefined): Promise<Str[]> {
        // calls: [ { 'method': 'eth_call', 'params': [ ... ] } ], results come back in the same order,
        // a failed call yields undefined at its position instead of failing the whole batch
        const url = this.getRpcUrl (chain);
        const batchSize = this.safeInteger (this.options, 'rpcBatchSize', 100);
        const headers = { 'Content-Type': 'application/json' };
        const results: Str[] = [];
        const chunks = Math.ceil (calls.length / batchSize);
        for (let c = 0; c < chunks; c++) {
            const offset = c * batchSize;
            const chunk = this.arraySlice (calls, offset, offset + batchSize);
            const request: any[] = [];
            for (let i = 0; i < chunk.length; i++) {
                request.push ({
                    'jsonrpc': '2.0',
                    'id': i,
                    'method': this.safeString (chunk[i], 'method'),
                    'params': this.safeList (chunk[i], 'params', []),
                });
            }
            const response = await this.fetch (url, 'POST', headers, this.json (request));
            const byId: Dict = {};
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                const id = this.safeString (entry, 'id');
                if (id !== undefined) {
                    byId[id] = entry;
                }
            }
            for (let i = 0; i < chunk.length; i++) {
                const entry = this.safeDict (byId, i.toString (), {});
                results.push (this.safeString (entry, 'result'));
            }
        }
        return results;
    }

    async ethCall (to: string, data: string, chain: Str = undefined): Promise<string> {
        const call: Dict = {
            'to': to,
            'data': data,
        };
        return await this.rpcRequest ('eth_call', [ call, 'latest' ], chain);
    }

    // ---- ABI encoding (static args only: address / uint256 / bytes32 / bool) ----

    abiSelector (signature: string): string {
        return '0x' + this.hash (this.encode (signature), keccak, 'hex').slice (0, 8);
    }

    abiAddress (address: string): string {
        return this.remove0xPrefix (address).toLowerCase ().padStart (64, '0');
    }

    abiUint (value: number): string {
        return this.intToBase16 (value).padStart (64, '0');
    }

    abiBool (value: boolean): string {
        return (value ? '1' : '0').padStart (64, '0');
    }

    abiBytes32 (value: string): string {
        const hex = this.remove0xPrefix (value).toLowerCase ();
        if (hex.length !== 64) {
            throw new BadRequest (this.id + ' expected a 32 byte hex key (bytes32), got: ' + value);
        }
        return hex;
    }

    // ---- ABI decoding -----------------------------------------------------

    abiWords (data: string): string[] {
        const hex = this.remove0xPrefix (data);
        const count = Math.floor (hex.length / 64);
        const words: string[] = [];
        for (let i = 0; i < count; i++) {
            const start = i * 64;
            const end = start + 64;
            words.push (hex.slice (start, end));
        }
        return words;
    }

    hexToDecimal (hexString: string): string {
        // arbitrary precision hex -> decimal string using Precise (no BigInt, keeps the file transpilable)
        const hex = this.remove0xPrefix (hexString).toLowerCase ();
        const digits = '0123456789abcdef';
        let start = 0;
        while (start < hex.length && hex[start] === '0') {
            start = start + 1;
        }
        if (start === hex.length) {
            return '0';
        }
        let result = '0';
        for (let i = start; i < hex.length; i++) {
            const digit = digits.indexOf (hex[i]);
            result = Precise.stringAdd (Precise.stringMul (result, '16'), this.numberToString (digit)) as string;
        }
        return result;
    }

    hexToSignedDecimal (hexString: string): string {
        // two's complement int256: value = -(invert (x) + 1) when the sign bit is set
        const hex = this.remove0xPrefix (hexString).toLowerCase ();
        const digits = '0123456789abcdef';
        if (digits.indexOf (hex[0]) < 8) {
            return this.hexToDecimal (hex);
        }
        let inverted = '';
        for (let i = 0; i < hex.length; i++) {
            inverted = inverted + digits[15 - digits.indexOf (hex[i])];
        }
        return Precise.stringNeg (Precise.stringAdd (this.hexToDecimal (inverted), '1')) as string;
    }

    hexToInt (hexString: string): number {
        return this.parseToInt (this.hexToDecimal (hexString));
    }

    abiToAddress (word: string): string {
        return '0x' + word.slice (24);
    }

    abiToBool (word: string): boolean {
        return word.slice (-1) === '1';
    }

    fromContractNumber (value: Str, decimals: number): Str {
        if (value === undefined) {
            return undefined;
        }
        return Precise.stringDiv (value, this.pow10String (decimals), 30);
    }

    // ---- token decimals ---------------------------------------------------

    tokenDecimals (address: Str): number {
        if (address === undefined) {
            return 18;
        }
        const cache = this.safeDict (this.options, 'tokenDecimals', {});
        return this.safeInteger (cache, address.toLowerCase (), 18);
    }

    async ensureTokenDecimals (addresses: string[], chain: Str = undefined): Promise<void> {
        // fills options['tokenDecimals'] from the GMX tokens list when possible and from ERC-20 decimals () otherwise.
        // this matters: index tokens are not always 18 decimals (WBTC = 8, USDC = 6) and every
        // price / amount conversion below depends on it
        const zeroAddress = this.safeString (this.options, 'zeroAddress');
        const cache = this.safeDict (this.options, 'tokenDecimals', {});
        const currencies = (this.currencies === undefined) ? {} : this.currencies;
        const codes = Object.keys (currencies);
        for (let i = 0; i < codes.length; i++) {
            const info = this.safeDict (currencies[codes[i]], 'info', {});
            const known = this.safeStringLower (info, 'address');
            const knownDecimals = this.safeInteger (info, 'decimals');
            if (known !== undefined && knownDecimals !== undefined && !(known in cache)) {
                cache[known] = knownDecimals;
            }
        }
        const selector = this.abiSelector ('decimals()');
        for (let i = 0; i < addresses.length; i++) {
            if (addresses[i] === undefined) {
                continue;
            }
            const address = addresses[i].toLowerCase ();
            if (address in cache) {
                continue;
            }
            if (address === zeroAddress) {
                cache[address] = 18;
                continue;
            }
            const result = await this.ethCall (address, selector, chain);
            cache[address] = this.hexToInt (result);
        }
        this.options['tokenDecimals'] = cache;
    }

    // ---- keys -------------------------------------------------------------

    getPositionKey (account: string, market: string, collateralToken: string, isLong: boolean): string {
        // keccak256 (abi.encode (account, market, collateralToken, isLong)), identical to Position.getPositionKey
        const data = this.abiAddress (account) + this.abiAddress (market) + this.abiAddress (collateralToken) + this.abiBool (isLong);
        return '0x' + this.hash (this.base16ToBinary (data), keccak, 'hex');
    }

    // ---- Reader struct decoders -------------------------------------------

    decodePositionAt (words: string[], start: number, numbersCount: number): Dict {
        // Position.Props = (Addresses (account, market, collateralToken), Numbers (n x uint), Flags (isLong))
        // every member is static so the struct is encoded inline.
        // Current gmx-synthetics has 10 numbers (incl. int256 pendingImpactAmount), 9 = older deployments without it
        let numberNames = [
            'sizeInUsd',
            'sizeInTokens',
            'collateralAmount',
            'pendingImpactAmount',
            'borrowingFactor',
            'fundingFeeAmountPerSize',
            'longTokenClaimableFundingAmountPerSize',
            'shortTokenClaimableFundingAmountPerSize',
            'increasedAtTime',
            'decreasedAtTime',
        ];
        if (numbersCount === 9) {
            numberNames = [
                'sizeInUsd',
                'sizeInTokens',
                'collateralAmount',
                'borrowingFactor',
                'fundingFeeAmountPerSize',
                'longTokenClaimableFundingAmountPerSize',
                'shortTokenClaimableFundingAmountPerSize',
                'increasedAtTime',
                'decreasedAtTime',
            ];
        }
        const result: Dict = {
            'account': this.abiToAddress (words[start]),
            'market': this.abiToAddress (words[start + 1]),
            'collateralToken': this.abiToAddress (words[start + 2]),
        };
        const limit = Math.min (numberNames.length, numbersCount);
        for (let i = 0; i < limit; i++) {
            const name = numberNames[i];
            const word = words[start + 3 + i];
            result[name] = (name === 'pendingImpactAmount') ? this.hexToSignedDecimal (word) : this.hexToDecimal (word);
        }
        result['isLong'] = this.abiToBool (words[start + 3 + numbersCount]);
        return result;
    }

    decodeAccountPositions (data: string): Dict[] {
        // Position.Props[] -> [ offset, length, element0 ... elementN ]
        const words = this.abiWords (data);
        if (words.length < 2) {
            return [];
        }
        const arrayStart = Math.floor (this.hexToInt (words[0]) / 32);
        const count = this.hexToInt (words[arrayStart]);
        if (count === 0) {
            return [];
        }
        const first = arrayStart + 1;
        const stride = Math.floor ((words.length - first) / count);
        const numbersCount = stride - 4;
        const result: Dict[] = [];
        for (let i = 0; i < count; i++) {
            result.push (this.decodePositionAt (words, first + i * stride, numbersCount));
        }
        return result;
    }

    decodeOrderProps (words: string[], start: number): Dict {
        // Order.Props = (Addresses, Numbers, Flags, bytes32[] _dataList), dynamic because of swapPath and _dataList.
        // head = [ addressesOffset, numbers (n words inline), flags (4 words inline), dataListOffset ]
        // the head size is derived from the first offset so the number of Numbers fields may differ between
        // contract versions (the trailing fields srcChainId / validFromTime are the ones that were added over time)
        const numberNames = [
            'orderType',
            'decreasePositionSwapType',
            'sizeDeltaUsd',
            'initialCollateralDeltaAmount',
            'triggerPrice',
            'acceptablePrice',
            'executionFee',
            'callbackGasLimit',
            'minOutputAmount',
            'updatedAtTime',
            'validFromTime',
            'srcChainId',
        ];
        const addressesOffset = Math.floor (this.hexToInt (words[start]) / 32);
        const headWords = addressesOffset;
        const numbersCount = headWords - 6;
        const addressesStart = start + addressesOffset;
        const result: Dict = {
            'account': this.abiToAddress (words[addressesStart]),
            'receiver': this.abiToAddress (words[addressesStart + 1]),
            'cancellationReceiver': this.abiToAddress (words[addressesStart + 2]),
            'callbackContract': this.abiToAddress (words[addressesStart + 3]),
            'uiFeeReceiver': this.abiToAddress (words[addressesStart + 4]),
            'market': this.abiToAddress (words[addressesStart + 5]),
            'initialCollateralToken': this.abiToAddress (words[addressesStart + 6]),
        };
        const swapPathStart = addressesStart + Math.floor (this.hexToInt (words[addressesStart + 7]) / 32);
        const swapPathLength = this.hexToInt (words[swapPathStart]);
        const swapPath: string[] = [];
        for (let i = 0; i < swapPathLength; i++) {
            swapPath.push (this.abiToAddress (words[swapPathStart + 1 + i]));
        }
        result['swapPath'] = swapPath;
        const limit = Math.min (numberNames.length, numbersCount);
        for (let i = 0; i < limit; i++) {
            result[numberNames[i]] = this.hexToDecimal (words[start + 1 + i]);
        }
        result['orderType'] = this.parseToInt (this.safeString (result, 'orderType', '0'));
        result['decreasePositionSwapType'] = this.parseToInt (this.safeString (result, 'decreasePositionSwapType', '0'));
        const flagsStart = start + 1 + numbersCount;
        result['isLong'] = this.abiToBool (words[flagsStart]);
        result['shouldUnwrapNativeToken'] = this.abiToBool (words[flagsStart + 1]);
        result['isFrozen'] = this.abiToBool (words[flagsStart + 2]);
        result['autoCancel'] = this.abiToBool (words[flagsStart + 3]);
        return result;
    }

    decodeAccountOrders (data: string): Dict[] {
        // ReaderUtils.OrderInfo[] where OrderInfo = (bytes32 orderKey, Order.Props order)
        // layout: [ offset, length, offset_0 ... offset_n-1, element_0 ... ], element offsets are relative to the first offset slot
        const words = this.abiWords (data);
        if (words.length < 2) {
            return [];
        }
        const arrayStart = Math.floor (this.hexToInt (words[0]) / 32);
        const count = this.hexToInt (words[arrayStart]);
        const result: Dict[] = [];
        const offsetsStart = arrayStart + 1;
        for (let i = 0; i < count; i++) {
            const elementStart = offsetsStart + Math.floor (this.hexToInt (words[offsetsStart + i]) / 32);
            const orderKey = '0x' + words[elementStart];
            const propsStart = elementStart + Math.floor (this.hexToInt (words[elementStart + 1]) / 32);
            const order = this.decodeOrderProps (words, propsStart);
            order['orderKey'] = orderKey;
            result.push (order);
        }
        return result;
    }

    // ---- Reader paginated reads -------------------------------------------

    async fetchAccountPositionsRaw (address: string, chain: string): Promise<Dict[]> {
        // Reader.getAccountPositions (dataStore, account, start, end), raw position state without fee / price context
        const contracts = this.getContractAddresses (chain);
        const reader = this.safeString (contracts, 'reader') as string;
        const dataStore = this.safeString (contracts, 'dataStore') as string;
        const selector = this.abiSelector ('getAccountPositions(address,address,uint256,uint256)');
        const pageSize = this.safeInteger (this.options, 'readerPageSize', 100);
        let result: Dict[] = [];
        for (let page = 0; page < 20; page++) {
            const start = page * pageSize;
            const data = selector + this.abiAddress (dataStore) + this.abiAddress (address) + this.abiUint (start) + this.abiUint (start + pageSize);
            const response = await this.ethCall (reader, data, chain);
            const decoded = this.decodeAccountPositions (response);
            result = this.arrayConcat (result, decoded);
            if (decoded.length < pageSize) {
                break;
            }
        }
        return result;
    }

    async fetchAccountOrdersRaw (address: string, chain: string): Promise<Dict[]> {
        // Reader.getAccountOrders (dataStore, account, start, end), only orders still in contract storage
        const contracts = this.getContractAddresses (chain);
        const reader = this.safeString (contracts, 'reader') as string;
        const dataStore = this.safeString (contracts, 'dataStore') as string;
        const selector = this.abiSelector ('getAccountOrders(address,address,uint256,uint256)');
        const pageSize = this.safeInteger (this.options, 'readerPageSize', 100);
        let result: Dict[] = [];
        for (let page = 0; page < 20; page++) {
            const start = page * pageSize;
            const data = selector + this.abiAddress (dataStore) + this.abiAddress (address) + this.abiUint (start) + this.abiUint (start + pageSize);
            const response = await this.ethCall (reader, data, chain);
            const decoded = this.decodeAccountOrders (response);
            result = this.arrayConcat (result, decoded);
            if (decoded.length < pageSize) {
                break;
            }
        }
        return result;
    }

    /**
     * @method
     * @name gmx#fetchBalance
     * @description query ERC-20 / native wallet balances and the collateral currently locked in open positions
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetaccountpositions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address to query, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @param {bool} [params.includePositions] if true (default) collateral locked in positions is reported as 'used'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        const [ chain, chainParams ] = this.handleChain (params);
        const [ address, query ] = this.getUserAddress ('fetchBalance', chainParams);
        const includePositions = this.safeBool (query, 'includePositions', true);
        const zeroAddress = this.safeString (this.options, 'zeroAddress');
        // the token list is chain specific, so it is requested for the chain being queried
        const tokensResponse = await this.publicGetTokens ({ 'chain': chain }) as List;
        const balanceOfSelector = this.abiSelector ('balanceOf(address)');
        const calls: Dict[] = [
            { 'method': 'eth_getBalance', 'params': [ address, 'latest' ] },
        ];
        const tokens: Dict[] = [];
        const decimalsCache = this.safeDict (this.options, 'tokenDecimals', {});
        for (let i = 0; i < tokensResponse.length; i++) {
            const token = tokensResponse[i];
            const tokenAddress = this.safeStringLower (token, 'address');
            if (tokenAddress === undefined || tokenAddress === zeroAddress) {
                continue;
            }
            if (this.safeBool (token, 'isNative', false) || this.safeBool (token, 'isSynthetic', false)) {
                continue; // native balance comes from eth_getBalance, synthetic tokens have no ERC-20 balance
            }
            const decimals = this.safeInteger (token, 'decimals', 18);
            decimalsCache[tokenAddress] = decimals;
            tokens.push (token);
            calls.push ({
                'method': 'eth_call',
                'params': [ { 'to': tokenAddress, 'data': balanceOfSelector + this.abiAddress (address) }, 'latest' ],
            });
        }
        this.options['tokenDecimals'] = decimalsCache;
        const results = await this.rpcBatch (calls, chain);
        const tokenBalances: Dict[] = [];
        for (let i = 0; i < tokens.length; i++) {
            const rawBalance = this.safeString (results, i + 1);
            if (rawBalance === undefined || rawBalance === '0x') {
                continue; // this token call failed, skip it rather than failing the whole balance
            }
            const token = tokens[i];
            tokenBalances.push ({
                'address': this.safeStringLower (token, 'address'),
                'symbol': this.safeString (token, 'symbol'),
                'decimals': this.safeInteger (token, 'decimals', 18),
                'balance': this.hexToDecimal (rawBalance),
            });
        }
        const collateral: Dict = {};
        if (includePositions) {
            const positions = await this.fetchAccountPositionsRaw (address, chain);
            for (let i = 0; i < positions.length; i++) {
                const collateralToken = this.safeStringLower (positions[i], 'collateralToken');
                const amount = this.safeString (positions[i], 'collateralAmount', '0');
                if (collateralToken !== undefined) {
                    collateral[collateralToken] = Precise.stringAdd (this.safeString (collateral, collateralToken, '0'), amount);
                }
            }
        }
        const response: Dict = {
            'address': address,
            'chain': chain,
            'nativeBalance': this.hexToDecimal (this.safeString (results, 0, '0x0')),
            'tokens': tokenBalances,
            'collateral': collateral,
        };
        return this.parseBalance (response);
    }

    override parseBalance (response: Dict): Balances {
        //
        //     {
        //         "address": "0x...",
        //         "chain": "arbitrum",
        //         "nativeBalance": "1500000000000000000",    // wei
        //         "tokens": [
        //             { "address": "0xaf88...", "symbol": "USDC", "decimals": 6, "balance": "2500000000" }
        //         ],
        //         "collateral": { "0xaf88...": "1000000000" } // raw collateralAmount summed over open positions
        //     }
        //
        const result: Dict = { 'info': response };
        const chain = this.safeString (response, 'chain');
        const nativeCurrencies = this.safeDict (this.options, 'nativeCurrency', {});
        const nativeCode = this.safeString (nativeCurrencies, chain, 'ETH');
        const nativeFree = this.fromContractNumber (this.safeString (response, 'nativeBalance'), 18);
        if (nativeFree !== undefined && Precise.stringGt (nativeFree, '0')) {
            const nativeAccount = this.account ();
            nativeAccount['free'] = nativeFree;
            nativeAccount['used'] = '0'; // gas currency is never locked, without it total stays undefined
            if (nativeCode !== undefined) {
                result[nativeCode] = nativeAccount;
            }
        }
        const collateral = this.safeDict (response, 'collateral', {});
        const tokens = this.safeList (response, 'tokens', []);
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const code = this.safeCurrencyCode (this.safeString (token, 'symbol'));
            const decimals = this.safeInteger (token, 'decimals', 18);
            const free = this.fromContractNumber (this.safeString (token, 'balance', '0'), decimals);
            const used = this.fromContractNumber (this.safeString (collateral, this.safeString (token, 'address'), '0'), decimals);
            if (!Precise.stringGt (free, '0') && !Precise.stringGt (used, '0')) {
                continue;
            }
            const account = this.account ();
            account['free'] = free;
            account['used'] = used;
            if (code !== undefined) {
                result[code] = account;
            }
        }
        // NOTE: collateral that is attached to still pending (not yet executed) increase orders sits in the OrderVault,
        // it is not included in 'used' because Reader does not expose it per account
        return this.safeBalance (result);
    }

    // ---- orders -----------------------------------------------------------

    // ---- EIP-712 signing for GMX Relay express orders --------------------------
    //
    // Flow (POST routes under /v1/orders/txns/): prepare -> sign -> submit.
    //   1. prepare returns payload.typedData = { domain, types, message } plus payload.batchParams / payload.relayParams
    //   2. the typed data is validated and signed with the wallet's private key (signTypedDataPayload ())
    //   3. submit sends { mode, requestId, signature, from, idempotencyKey, eip712Data: { batchParams, relayParams } }
    // The typed data comes from the server, so it is validated before signing exactly like the official SDK does:
    // domain name / version / chainId, verifyingContract must be a known GMX relay router, and every order receiver
    // must be the signer or the zero address (a malicious server could otherwise redirect the funds).

    validateExpressTypedData (typedData: Dict, accountAddress: string, chain: string): void {
        const domain = this.safeDict (typedData, 'domain', {});
        const types = this.safeDict (typedData, 'types', {});
        const message = this.safeDict (typedData, 'message', {});
        const contracts = this.getContractAddresses (chain);
        if (this.safeString (domain, 'name') !== 'GmxBaseGelatoRelayRouter') {
            throw new ExchangeError (this.id + ' refusing to sign: unexpected EIP-712 domain name ' + this.safeString (domain, 'name'));
        }
        if (this.safeString (domain, 'version') !== '1') {
            throw new ExchangeError (this.id + ' refusing to sign: unexpected EIP-712 domain version ' + this.safeString (domain, 'version'));
        }
        if (this.safeInteger (domain, 'chainId') !== this.safeInteger (contracts, 'chainId')) {
            throw new ExchangeError (this.id + ' refusing to sign: EIP-712 chainId ' + this.safeString (domain, 'chainId') + ' does not match ' + chain);
        }
        const routers = this.safeList (contracts, 'relayRouters', []);
        const verifyingContract = this.safeStringLower (domain, 'verifyingContract');
        let known = false;
        for (let i = 0; i < routers.length; i++) {
            if (routers[i].toLowerCase () === verifyingContract) {
                known = true;
                break;
            }
        }
        if (!known) {
            throw new ExchangeError (this.id + ' refusing to sign: verifyingContract ' + verifyingContract + ' is not a known GMX relay router, set options["contracts"]["' + chain + '"]["relayRouters"] if GMX deployed a new one');
        }
        if (Object.keys (types).length === 0) {
            throw new ExchangeError (this.id + ' refusing to sign: typed data has no types');
        }
        const zeroAddress = this.safeString (this.options, 'zeroAddress');
        const orders = this.safeList (message, 'createOrderParamsList', []);
        for (let i = 0; i < orders.length; i++) {
            const addresses = this.safeDict (orders[i], 'addresses', {});
            const receivers = [ this.safeStringLower (addresses, 'receiver'), this.safeStringLower (addresses, 'cancellationReceiver') ];
            for (let j = 0; j < receivers.length; j++) {
                if (receivers[j] !== undefined && receivers[j] !== zeroAddress && receivers[j] !== accountAddress.toLowerCase ()) {
                    throw new ExchangeError (this.id + ' refusing to sign: order receiver ' + receivers[j] + ' is not the signing account');
                }
            }
        }
    }

    pruneTypedDataTypes (types: Dict): Dict {
        // the primary type is the first entry other than EIP712Domain (same rule as the official SDK). The encoder used by CCXT
        // (ethers TypedDataEncoder) rejects unused types and EIP712Domain, so only the types reachable from the primary type are kept
        const cleaned: Dict = {};
        const names = Object.keys (types);
        for (let i = 0; i < names.length; i++) {
            if (names[i] !== 'EIP712Domain') {
                cleaned[names[i]] = types[names[i]];
            }
        }
        const cleanedNames = Object.keys (cleaned);
        const reachable: Dict = {};
        const stack: string[] = [ cleanedNames[0] ];
        for (let s = 0; s < stack.length; s++) {
            const name = stack[s];
            if (name === undefined || (name in reachable)) {
                continue;
            }
            const fields = this.safeList (cleaned, name);
            if (fields === undefined) {
                continue;
            }
            reachable[name] = true;
            for (let i = 0; i < fields.length; i++) {
                const baseType = this.safeString (fields[i], 'type', '').split ('[')[0];
                if (baseType in cleaned) {
                    stack.push (baseType);
                }
            }
        }
        const result: Dict = {};
        for (let i = 0; i < cleanedNames.length; i++) {
            if (cleanedNames[i] in reachable) {
                result[cleanedNames[i]] = cleaned[cleanedNames[i]];
            }
        }
        return result;
    }

    signTypedDataPayload (typedData: Dict, accountAddress: string, chain: string): string {
        this.validateExpressTypedData (typedData, accountAddress, chain);
        if (this.privateKey === undefined) {
            throw new AuthenticationError (this.id + ' signing requires exchange.privateKey');
        }
        const signerAddress = this.ethGetAddressFromPrivateKey ('0x' + this.remove0xPrefix (this.privateKey));
        if (signerAddress.toLowerCase () !== accountAddress.toLowerCase ()) {
            throw new AuthenticationError (this.id + ' exchange.privateKey belongs to ' + signerAddress + ' but the order account is ' + accountAddress + ', subaccount signing is not implemented');
        }
        const domain = this.safeDict (typedData, 'domain', {});
        const message = this.safeDict (typedData, 'message', {});
        const types = this.pruneTypedDataTypes (this.safeDict (typedData, 'types', {}));
        const encoded = this.ethEncodeStructuredData (domain, types, message); // 0x1901 || domainSeparator || hashStruct
        const digest = this.hash (encoded, keccak, 'hex');
        const signature = ecdsa (digest, this.remove0xPrefix (this.privateKey).slice (-64), secp256k1, undefined);
        const rStr = this.safeString (signature, 'r', '');
        const r = rStr.padStart (64, '0');
        const sStr = this.safeString (signature, 's', '');
        const s = sStr.padStart (64, '0');
        const vInt = this.safeInteger (signature, 'v', 0);
        const v = this.intToBase16 (27 + vInt).padStart (2, '0');
        return '0x' + r + s + v;
    }

    async executeExpress (flow: string, request: Dict, chain: string): Promise<Dict> {
        // flow: 'order' | 'cancel' | 'edit', request is the body of the matching prepare endpoint
        const query = this.extend (request, { 'chain': chain });
        let prepared = undefined;
        if (flow === 'cancel') {
            prepared = await this.privatePostOrdersTxnsCancelPrepare (query);
        } else if (flow === 'edit') {
            prepared = await this.privatePostOrdersTxnsEditPrepare (query);
        } else {
            prepared = await this.privatePostOrdersTxnsPrepare (query);
        }
        const payloadType = this.safeString (prepared, 'payloadType');
        if (payloadType !== 'typed-data') {
            throw new ExchangeError (this.id + ' expected a typed-data payload from prepare, got ' + payloadType + ', only express mode is supported');
        }
        const payload = this.safeDict (prepared, 'payload', {});
        const typedData = this.safeDict (payload, 'typedData');
        if (typedData === undefined) {
            throw new ExchangeError (this.id + ' prepare response has no payload.typedData');
        }
        const expiresAt = this.safeInteger (prepared, 'expiresAt');
        if (expiresAt !== undefined && expiresAt > 0) {
            const expiresMs = (expiresAt < 1000000000000) ? expiresAt * 1000 : expiresAt; // seconds or milliseconds
            if (expiresMs < this.milliseconds ()) {
                throw new ExchangeError (this.id + ' the prepared order has already expired');
            }
        }
        const account = this.safeString (request, 'from');
        if (account === undefined) {
            throw new ArgumentsRequired (this.id + ' executeExpress requires "from" in request');
        }
        const signature = this.signTypedDataPayload (typedData, account, chain);
        const submitRequest: Dict = {
            'mode': this.safeString (prepared, 'mode', 'express'),
            'requestId': this.safeString (prepared, 'requestId'),
            'signature': signature,
            'from': account,
            'idempotencyKey': this.safeString (prepared, 'idempotencyKey'),
            'eip712Data': {
                'batchParams': this.safeValue (payload, 'batchParams'),
                'relayParams': this.safeValue (payload, 'relayParams'),
            },
            'chain': chain,
        };
        const submitted = await this.privatePostOrdersTxnsSubmit (submitRequest);
        return {
            'prepared': prepared,
            'submitted': submitted,
        };
    }

    parseExpressStatus (status: Str): Str {
        // prepared | relay_accepted | relay_pending | relay_submitted | created | executed | cancelled | relay_failed | relay_reverted
        const statuses: Dict = {
            'executed': 'closed',
            'cancelled': 'canceled',
            'relay_failed': 'rejected',
            'relay_reverted': 'rejected',
        };
        return this.safeString (statuses, status, 'open');
    }

    async getCollateralDecimals (code: string, market: Market, chain: string): Promise<number> {
        const info = this.safeDict (market, 'info', {});
        if (market !== undefined && code === market['settle']) {
            const shortToken = this.safeStringLower (info, 'shortTokenAddress');
            if (shortToken !== undefined) {
                await this.ensureTokenDecimals ([ shortToken ], chain);
                return this.tokenDecimals (shortToken);
            }
        }
        const currencies = (this.currencies === undefined) ? {} : this.currencies;
        const currencyInfo = this.safeDict (this.safeDict (currencies, code, {}), 'info', {});
        const decimals = this.safeInteger (currencyInfo, 'decimals');
        if (decimals === undefined) {
            throw new BadRequest (this.id + ' unknown collateral token ' + code + ', use the market settle currency or a currency from fetchCurrencies ()');
        }
        return decimals;
    }

    /**
     * @method
     * @name gmx#createOrder
     * @description create a GMX v2 order through the GMX API relay: prepare, sign the returned EIP-712 typed data, submit
     * @see https://docs.gmx.io/docs/sdk/v2/examples/#express-orders--three-step-flow
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' (long / close a short) or 'sell' (short / close a long)
     * @param {float} amount position size in units of the base currency
     * @param {float} [price] limit price, also used to convert amount to a USD size (the ticker is used when omitted)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.collateralAmount] collateral to pay in units of the collateral token (increase orders)
     * @param {string} [params.collateralToken] collateral token symbol, defaults to the market settle currency
     * @param {bool} [params.reduceOnly] true to create a decrease order for an existing position
     * @param {float} [params.stopLossPrice] creates a stop-loss decrease order triggering at this price
     * @param {float} [params.takeProfitPrice] creates a take-profit decrease order triggering at this price
     * @param {float} [params.triggerPrice] creates a stop-market increase order triggering at this price
     * @param {string} [params.receiveToken] token symbol to receive when decreasing, defaults to the collateral token
     * @param {int} [params.slippage] acceptable slippage in basis points, defaults to options.defaultSlippage
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        // collateral: when params.collateralAmount is missing and a leverage was stored with setLeverage (), the collateral is
        // sizeUsd / leverage, which is only valid for the market settle currency (a stablecoin, assumed to be worth 1 USD).
        // Collateral must be approved to the GMX Router and held in the wallet before submitting, nothing here checks that.
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' createOrder () supports perpetual swap markets only');
        }
        const [ chain, query ] = this.handleChain (params);
        const marketInfo = this.safeDict (market, 'info', {});
        const reduceOnly = this.safeBool (query, 'reduceOnly', false);
        const stopLossPrice = this.safeNumber (query, 'stopLossPrice');
        const takeProfitPrice = this.safeNumber (query, 'takeProfitPrice');
        const triggerPriceParam = this.safeNumber (query, 'triggerPrice');
        let kind = reduceOnly ? 'decrease' : 'increase';
        let orderType = 'market';
        let trigger: Num = undefined;
        if (stopLossPrice !== undefined) {
            kind = 'decrease';
            orderType = 'stop-loss';
            trigger = stopLossPrice;
        } else if (takeProfitPrice !== undefined) {
            kind = 'decrease';
            orderType = 'take-profit';
            trigger = takeProfitPrice;
        } else if (type === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder () requires a price for limit orders');
            }
            orderType = 'limit';
            trigger = price;
        } else if (triggerPriceParam !== undefined) {
            orderType = 'stop-market';
            trigger = triggerPriceParam;
        }
        if (this.safeValue (query, 'twapConfig') !== undefined) {
            orderType = 'twap';
        }
        const isLongPosition = (kind === 'increase') ? (side === 'buy') : (side === 'sell');
        // USD size = amount * reference price
        let referencePrice = (trigger !== undefined) ? trigger : price;
        if (referencePrice === undefined) {
            const ticker = await this.fetchTicker (symbol);
            referencePrice = this.safeNumber (ticker, 'last');
        }
        if (referencePrice === undefined || referencePrice <= 0) {
            throw new InvalidOrder (this.id + ' createOrder () could not determine a price to size the order, pass price');
        }
        const sizeUsd = amount * referencePrice;
        const collateralCode = this.safeString (query, 'collateralToken', market['settle']) as string;
        const defaultSlippage = this.safeNumber (this.options, 'defaultSlippage', 0.003) as number;
        const slippageBps = this.safeInteger (query, 'slippage', Math.round (defaultSlippage * 10000));
        const request: Dict = {
            'kind': kind,
            'symbol': this.safeString (marketInfo, 'symbol'),
            'direction': isLongPosition ? 'long' : 'short',
            'orderType': orderType,
            'size': this.toContractUsd (sizeUsd),
            'collateralToken': collateralCode,
            'slippage': slippageBps,
            'mode': 'express',
            'from': this.walletAddress,
        };
        if (trigger !== undefined) {
            request['triggerPrice'] = this.toContractUsd (trigger); // 30 decimal USD
        }
        if (kind === 'increase') {
            let collateralHuman = this.safeNumber (query, 'collateralAmount');
            if (collateralHuman === undefined) {
                const leverages = this.safeDict (this.options, 'leverage', {});
                const leverage = this.safeNumber (leverages, symbol);
                if (leverage === undefined || collateralCode !== market['settle']) {
                    throw new ArgumentsRequired (this.id + ' createOrder () requires params.collateralAmount, or a leverage set with setLeverage () and the market settle currency as collateral');
                }
                collateralHuman = sizeUsd / leverage;
            }
            const decimals = await this.getCollateralDecimals (collateralCode, market, chain);
            request['collateralToPay'] = {
                'amount': this.toContractNumber (collateralHuman, decimals),
                'token': collateralCode,
            };
        } else {
            request['receiveToken'] = this.safeString (query, 'receiveToken', collateralCode);
        }
        const passthrough = [ 'keepLeverage', 'referralCode', 'uiFeeReceiver', 'executionFeeBufferBps', 'acceptablePriceImpactBps', 'manualSwapPath', 'gasPaymentToken', 'twapConfig', 'tpsl' ];
        for (let i = 0; i < passthrough.length; i++) {
            const value = this.safeValue (query, passthrough[i]);
            if (value !== undefined) {
                request[passthrough[i]] = value;
            }
        }
        const result = await this.executeExpress ('order', request, chain);
        const prepared = this.safeDict (result, 'prepared', {});
        const submitted = this.safeDict (result, 'submitted', {});
        const estimates = this.safeDict (prepared, 'estimates', {});
        const feeUsd = this.fromContractNumber (this.safeString (estimates, 'positionFeeUsd'), 30);
        const timestamp = this.milliseconds ();
        const status = this.parseExpressStatus (this.safeString (submitted, 'status'));
        return this.safeOrder ({
            'id': this.safeString (submitted, 'requestId', this.safeString (prepared, 'requestId')),
            'clientOrderId': this.safeString (query, 'clientOrderId'),
            'info': result,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': market['symbol'],
            'type': (orderType === 'market') ? 'market' : 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': (kind === 'decrease'),
            'side': side,
            'price': (type === 'limit') ? price : undefined,
            'triggerPrice': (stopLossPrice !== undefined || takeProfitPrice !== undefined || triggerPriceParam !== undefined) ? trigger : undefined,
            'amount': amount,
            'cost': undefined,
            'average': undefined,
            'filled': 0,
            'remaining': amount,
            'status': status, // the id is the relay requestId until the on-chain order key exists, see fetchOrder ()
            'fee': (feeUsd !== undefined) ? { 'cost': this.parseNumber (feeUsd), 'currency': 'USD' } : undefined,
            'trades': undefined,
        }, market);
    }

    /**
     * @method
     * @name gmx#cancelOrder
     * @description cancel an open order through the GMX API relay (prepare, sign, submit)
     * @see https://docs.gmx.io/docs/sdk/v2/examples/#cancel-orders
     * @param {string} id the bytes32 order key of a pending order (see fetchOpenOrders)
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        if (id === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder () requires an order key (bytes32)');
        }
        await this.loadMarkets ();
        const [ chain ] = this.handleChain (params);
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const orderKey = '0x' + this.abiBytes32 (id);
        const request: Dict = {
            'orderIds': [ orderKey ],
            'mode': 'express',
            'from': this.walletAddress,
        };
        const result = await this.executeExpress ('cancel', request, chain);
        const submitted = this.safeDict (result, 'submitted', {});
        const timestamp = this.milliseconds ();
        // the relay accepting the cancellation is reported as canceled, confirm on-chain state with fetchOrder () / fetchClosedOrders ()
        let status = this.parseExpressStatus (this.safeString (submitted, 'status'));
        if (status === 'open') {
            status = 'canceled';
        }
        return this.safeOrder ({
            'id': orderKey,
            'clientOrderId': undefined,
            'info': result,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': timestamp,
            'symbol': (market !== undefined) ? market['symbol'] : undefined,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'cost': undefined,
            'average': undefined,
            'filled': undefined,
            'remaining': undefined,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        }, market);
    }

    async fetchExpressOrderStatus (requestId: string, requestParams: Dict): Promise<Order> {
        // relay requestId (returned by createOrder) -> POST /orders/txns/status
        const [ chain ] = this.handleChain (requestParams);
        const response = await this.privatePostOrdersTxnsStatus ({ 'requestId': requestId, 'chain': chain });
        const timestamp = this.milliseconds ();
        const keys = this.safeList (response, 'orderKeys', []);
        return this.safeOrder ({
            'id': requestId,
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': timestamp,
            'status': this.parseExpressStatus (this.safeString (response, 'status')),
            'reason': this.safeString2 (response, 'cancellationReason', 'error'),
            'clientOrderId': (keys.length > 0) ? keys[0] : undefined, // first on-chain order key once created, use it with cancelOrder ()
        });
    }

    async prepareOrdersForParsing (rawOrders: Dict[], chain: string): Promise<void> {
        // resolves the decimals of every index / collateral token once so that the synchronous parseOrder () can scale prices
        const addresses: string[] = [];
        for (let i = 0; i < rawOrders.length; i++) {
            rawOrders[i]['chain'] = chain;
            const market = this.safeMarket (this.safeStringLower (rawOrders[i], 'market'));
            const info = this.safeDict (market, 'info', {});
            const indexToken = this.safeStringLower (info, 'indexTokenAddress');
            if (indexToken !== undefined) {
                addresses.push (indexToken);
            }
            const collateralToken = this.safeStringLower (rawOrders[i], 'initialCollateralToken');
            if (collateralToken !== undefined) {
                addresses.push (collateralToken);
            }
        }
        await this.ensureTokenDecimals (addresses, chain);
    }

    /**
     * @method
     * @name gmx#fetchOrder
     * @description fetches a pending order from contract storage by its key
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetorder
     * @param {string} id the bytes32 order key
     * @param {string} [symbol] unified market symbol (unused, the key identifies the order)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        // Reader.getOrder only knows orders that are still pending, executed / cancelled orders are deleted from DataStore,
        // so those are resolved through the Subsquid indexer (orderById). Indexed data can lag the chain by a few blocks
        await this.loadMarkets ();
        if (!(id.startsWith ('0x') && id.length === 66)) {
            return await this.fetchExpressOrderStatus (id, params); // not a bytes32 order key: it is the relay requestId from createOrder ()
        }
        const [ chain ] = this.handleChain (params);
        const orderKey = '0x' + this.abiBytes32 (id);
        const contracts = this.getContractAddresses (chain);
        const reader = this.safeString (contracts, 'reader') as string;
        const dataStore = this.safeString (contracts, 'dataStore') as string;
        const selector = this.abiSelector ('getOrder(address,bytes32)');
        const data = selector + this.abiAddress (dataStore) + this.abiBytes32 (orderKey);
        const response = await this.ethCall (reader, data, chain);
        const words = this.abiWords (response);
        const zeroAddress = this.safeString (this.options, 'zeroAddress');
        let raw: Dict | undefined = undefined;
        if (words.length >= 2) {
            const propsStart = Math.floor (this.hexToInt (words[0]) / 32);
            raw = this.decodeOrderProps (words, propsStart);
        }
        if (raw === undefined || this.safeString (raw, 'account') === zeroAddress) {
            // not pending any more (executed / cancelled) or never created, look it up in the indexer
            raw = await this.fetchIndexedOrderByKey (orderKey, chain);
            if (raw === undefined) {
                throw new OrderNotFound (this.id + ' fetchOrder () order ' + orderKey + ' is neither pending on-chain nor known to the indexer');
            }
        }
        raw['orderKey'] = orderKey;
        await this.prepareOrdersForParsing ([ raw ], chain);
        return this.parseOrder (raw);
    }

    /**
     * @method
     * @name gmx#fetchOrders
     * @description fetches pending orders (Reader contract) together with executed and cancelled orders (Subsquid indexer)
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetaccountorders
     * @see https://docs.gmx.io/docs/api/graphql/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        // pending orders come from the Reader contract (live, includes frozen), executed / cancelled ones from the Subsquid indexer
        const open = await this.fetchOpenOrders (symbol, since, limit, params);
        const closed = await this.fetchClosedOrders (symbol, since, limit, params);
        const merged = this.arrayConcat (open, closed);
        return this.filterBySymbolSinceLimit (this.sortBy (merged, 'timestamp'), symbol, since, limit) as Order[];
    }

    /**
     * @method
     * @name gmx#fetchOpenOrders
     * @description fetches all pending (unexecuted) orders of an account
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetaccountorders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const [ chain, chainParams ] = this.handleChain (params);
        const [ address ] = this.getUserAddress ('fetchOpenOrders', chainParams);
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const rawOrders = await this.fetchAccountOrdersRaw (address, chain);
        await this.prepareOrdersForParsing (rawOrders, chain);
        const orders: Order[] = [];
        for (let i = 0; i < rawOrders.length; i++) {
            orders.push (this.parseOrder (rawOrders[i]));
        }
        return this.filterBySymbolSinceLimit (orders, (market !== undefined) ? market['symbol'] : undefined, since, limit) as Order[];
    }

    // ---- indexed (closed) orders: Subsquid GraphQL --------------------------

    getIndexedOrderFields (): string {
        // fields of the indexer's Order entity (see the GMX GraphQL schema), status is the OrderStatus enum
        return 'id account receiver marketAddress swapPath initialCollateralTokenAddress sizeDeltaUsd initialCollateralDeltaAmount triggerPrice acceptablePrice executionFee orderType decreasePositionSwapType isLong status cancelledReason frozenReason createdTxnHash cancelledTxnHash executedTxnHash';
    }

    indexedOrderToRaw (indexed: Dict, chain: string): Dict {
        // reshapes an indexer Order row into the same dict shape decodeOrderProps () produces, so parseOrder () handles both sources
        return {
            'orderKey': this.safeString (indexed, 'id'),
            'account': this.safeStringLower (indexed, 'account'),
            'receiver': this.safeStringLower (indexed, 'receiver'),
            'market': this.safeStringLower (indexed, 'marketAddress'),
            'initialCollateralToken': this.safeStringLower (indexed, 'initialCollateralTokenAddress'),
            'swapPath': this.safeList (indexed, 'swapPath', []),
            'orderType': this.safeInteger (indexed, 'orderType'),
            'decreasePositionSwapType': this.safeInteger (indexed, 'decreasePositionSwapType'),
            'sizeDeltaUsd': this.safeString (indexed, 'sizeDeltaUsd'),
            'initialCollateralDeltaAmount': this.safeString (indexed, 'initialCollateralDeltaAmount'),
            'triggerPrice': this.safeString (indexed, 'triggerPrice'),
            'acceptablePrice': this.safeString (indexed, 'acceptablePrice'),
            'executionFee': this.safeString (indexed, 'executionFee'),
            'isLong': this.safeBool (indexed, 'isLong'),
            'status': this.safeString (indexed, 'status'),
            'reason': this.safeString2 (indexed, 'cancelledReason', 'frozenReason'),
            'chain': chain,
        };
    }

    async enrichIndexedOrders (rawOrders: Dict[], chain: string): Promise<void> {
        // the indexer's Order entity has no timestamp or fill data, those live on TradeAction rows keyed by orderKey.
        // the latest row of each order carries the time it was closed, and for executions the execution price / token size
        if (rawOrders.length === 0) {
            return;
        }
        const keys: string[] = [];
        for (let i = 0; i < rawOrders.length; i++) {
            const key = this.safeString (rawOrders[i], 'orderKey');
            if (key !== undefined) {
                keys.push (key);
            }
        }
        const query = 'query ($keys: [String!]) { tradeActions (where: { orderKey_in: $keys }, orderBy: timestamp_DESC, limit: 1000) { orderKey eventName timestamp executionPrice sizeDeltaUsd sizeDeltaInTokens reason } }';
        const data = await this.queryGraphql (query, { 'keys': keys }, chain);
        const actions = this.safeList (data, 'tradeActions', []);
        const latest: Dict = {};
        const executed: Dict = {};
        for (let i = 0; i < actions.length; i++) {
            const key = this.safeString (actions[i], 'orderKey');
            if (key !== undefined) {
                if (!(key in latest)) {
                    latest[key] = actions[i]; // rows come newest first
                }
                if (!(key in executed) && this.safeString (actions[i], 'executionPrice') !== undefined) {
                    executed[key] = actions[i]; // the row that carries the fill, it is not always the newest one
                }
            }
        }
        for (let i = 0; i < rawOrders.length; i++) {
            const orderKey = this.safeString (rawOrders[i], 'orderKey');
            const action = this.safeDict (latest, orderKey);
            if (action === undefined) {
                continue;
            }
            const fill = this.safeDict (executed, orderKey, action);
            rawOrders[i]['indexerTimestamp'] = this.safeString (action, 'timestamp');
            rawOrders[i]['executionPrice'] = this.safeString (fill, 'executionPrice');
            rawOrders[i]['executedSizeDeltaUsd'] = this.safeString (fill, 'sizeDeltaUsd');
            rawOrders[i]['sizeDeltaInTokens'] = this.safeString (fill, 'sizeDeltaInTokens');
            if (this.safeString (rawOrders[i], 'reason') === undefined) {
                rawOrders[i]['reason'] = this.safeString (action, 'reason');
            }
        }
    }

    async fetchIndexedOrders (address: string, chain: string, statuses: string[], limit: Int): Promise<Dict[]> {
        // addresses may be stored checksummed or lowercase by the indexer, the schema does not say, so both are sent (account_in)
        const query = 'query ($accounts: [String!], $limit: Int!) { orders (where: { account_in: $accounts, status_in: [' + statuses.join (', ') + '] }, orderBy: updatedAtBlock_DESC, limit: $limit) { ' + this.getIndexedOrderFields () + ' } }';
        const variables: Dict = {
            'accounts': [ address, address.toLowerCase () ],
            'limit': (limit !== undefined) ? limit : 100,
        };
        const data = await this.queryGraphql (query, variables, chain);
        const indexed = this.safeList (data, 'orders', []);
        const result: Dict[] = [];
        for (let i = 0; i < indexed.length; i++) {
            result.push (this.indexedOrderToRaw (indexed[i], chain));
        }
        await this.enrichIndexedOrders (result, chain);
        return result;
    }

    async fetchIndexedOrderByKey (orderKey: string, chain: string): Promise<Dict | undefined> {
        const query = 'query ($id: String!) { orderById (id: $id) { ' + this.getIndexedOrderFields () + ' } }';
        const data = await this.queryGraphql (query, { 'id': orderKey }, chain);
        const indexed = this.safeDict (data, 'orderById');
        if (indexed === undefined) {
            return undefined;
        }
        const raw = this.indexedOrderToRaw (indexed, chain);
        await this.enrichIndexedOrders ([ raw ], chain);
        return raw;
    }

    /**
     * @method
     * @name gmx#fetchCanceledAndClosedOrders
     * @description fetches executed and cancelled orders of an account
     * @see https://docs.gmx.io/docs/api/graphql/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchCanceledAndClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        return await this.fetchClosedOrders (symbol, since, limit, params);
    }

    /**
     * @method
     * @name gmx#fetchClosedOrders
     * @description fetches executed and cancelled orders of an account from the GMX Subsquid indexer
     * @see https://docs.gmx.io/docs/api/graphql/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        // frozen orders are still pending in DataStore (Reader returns them), so only Executed / Cancelled are closed.
        // LIMITATIONS: indexed data lags the chain; the indexer's Order entity has no timestamp, it is taken from the
        // latest TradeAction row of each order; "since" is applied client side after the server side limit
        await this.loadMarkets ();
        const [ chain, chainParams ] = this.handleChain (params);
        const [ address ] = this.getUserAddress ('fetchClosedOrders', chainParams);
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const rawOrders = await this.fetchIndexedOrders (address, chain, [ 'Executed', 'Cancelled' ], limit);
        await this.prepareOrdersForParsing (rawOrders, chain);
        const orders: Order[] = [];
        for (let i = 0; i < rawOrders.length; i++) {
            orders.push (this.parseOrder (rawOrders[i]));
        }
        const sorted = this.sortBy (orders, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, (market !== undefined) ? market['symbol'] : undefined, since, limit) as Order[];
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        //
        // decoded Order.Props from Reader.getAccountOrders / getOrder
        //
        //     {
        //         "orderKey": "0x...",
        //         "account": "0x...",
        //         "receiver": "0x...",
        //         "cancellationReceiver": "0x...",
        //         "callbackContract": "0x0000000000000000000000000000000000000000",
        //         "uiFeeReceiver": "0x0000000000000000000000000000000000000000",
        //         "market": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //         "initialCollateralToken": "0xaf88d065e77c8cc2239301c5e013f010b61d581d",
        //         "swapPath": [],
        //         "orderType": 3,
        //         "decreasePositionSwapType": 0,
        //         "sizeDeltaUsd": "10000000000000000000000000000000000",
        //         "initialCollateralDeltaAmount": "1000000000",
        //         "triggerPrice": "2600000000000",
        //         "acceptablePrice": "2613000000000",
        //         "executionFee": "300000000000000",
        //         "callbackGasLimit": "0",
        //         "minOutputAmount": "0",
        //         "updatedAtTime": "1710000000",
        //         "validFromTime": "0",
        //         "isLong": true,
        //         "shouldUnwrapNativeToken": false,
        //         "isFrozen": false,
        //         "autoCancel": false,
        //         "chain": "arbitrum"
        //     }
        //
        const orderKey = this.safeString (order, 'orderKey');
        const marketId = this.safeStringLower (order, 'market');
        const marketObj = this.safeMarket (marketId, market);
        const info = this.safeDict (marketObj, 'info', {});
        const indexDecimals = this.tokenDecimals (this.safeStringLower (info, 'indexTokenAddress'));
        const orderType = this.safeInteger (order, 'orderType');
        const isLong = this.safeBool (order, 'isLong', true);
        // 0 MarketSwap | 1 LimitSwap | 2 MarketIncrease | 3 LimitIncrease | 4 MarketDecrease | 5 LimitDecrease | 6 StopLossDecrease | 7 Liquidation | 8 StopIncrease
        const isSwap = (orderType === 0 || orderType === 1);
        const isIncrease = (orderType === 2 || orderType === 3 || orderType === 8);
        const isDecrease = (orderType === 4 || orderType === 5 || orderType === 6 || orderType === 7);
        const hasTrigger = (orderType === 3 || orderType === 5 || orderType === 6 || orderType === 8);
        const unifiedType = (orderType === 1 || orderType === 3 || orderType === 5 || orderType === 8) ? 'limit' : 'market';
        let side: Str = undefined;
        if (isIncrease) {
            side = isLong ? 'buy' : 'sell';
        } else if (isDecrease) {
            side = isLong ? 'sell' : 'buy';
        }
        // prices are scaled by 10 ** (30 - indexTokenDecimals)
        let triggerPrice = this.fromContractNumber (this.safeString (order, 'triggerPrice'), 30 - indexDecimals);
        if (triggerPrice !== undefined && Precise.stringEq (triggerPrice, '0')) {
            triggerPrice = undefined;
        }
        let acceptablePrice = this.fromContractNumber (this.safeString (order, 'acceptablePrice'), 30 - indexDecimals);
        if (acceptablePrice !== undefined && Precise.stringEq (acceptablePrice, '0')) {
            acceptablePrice = undefined;
        }
        const sizeDeltaUsd = this.fromContractNumber (this.safeString (order, 'sizeDeltaUsd'), 30);
        let amount: Str = undefined;
        if (isSwap) {
            const collateralDecimals = this.tokenDecimals (this.safeStringLower (order, 'initialCollateralToken'));
            amount = this.fromContractNumber (this.safeString (order, 'initialCollateralDeltaAmount'), collateralDecimals);
        } else {
            // the order only stores a USD size, the token amount is approximated with the trigger price
            // (limit / stop orders) or the acceptable price (market orders), it is NOT an exact fill size.
            // sizeDeltaUsd / initialCollateralDeltaAmount can also be auto-reduced by the keeper at execution (decrease orders)
            const referencePrice = (triggerPrice !== undefined) ? triggerPrice : acceptablePrice;
            if (sizeDeltaUsd !== undefined && referencePrice !== undefined && !Precise.stringEq (referencePrice, '0')) {
                amount = Precise.stringDiv (sizeDeltaUsd, referencePrice, 18);
            }
        }
        // rows coming from the indexer carry: status (OrderStatus enum), indexerTimestamp (latest TradeAction, seconds),
        // executionPrice (contract price scale, same as triggerPrice) and sizeDeltaInTokens for executed orders
        const rawStatus = this.safeString (order, 'status', 'Created');
        let status = 'open';
        if (rawStatus === 'Executed') {
            status = 'closed';
        } else if (rawStatus === 'Cancelled') {
            status = 'canceled';
        }
        const executedTokens = this.fromContractNumber (this.safeString (order, 'sizeDeltaInTokens'), indexDecimals);
        if (status === 'closed' && !isSwap && executedTokens !== undefined && !Precise.stringEq (executedTokens, '0')) {
            amount = executedTokens;
        }
        let average: Str = undefined;
        if (status === 'closed' && !isSwap && amount !== undefined && !Precise.stringEq (amount, '0')) {
            average = this.fromContractNumber (this.safeString (order, 'executionPrice'), 30 - indexDecimals);
            if (average !== undefined && Precise.stringEq (average, '0')) {
                average = undefined;
            }
        }
        // the Order entity can report a zero size for executed decrease orders (the keeper adjusts it at execution), so the
        // size of the actual fill (TradeAction) is used instead: USD size of the fill / execution price
        let filledUsd = sizeDeltaUsd;
        if (status === 'closed' && !isSwap) {
            const executedUsd = this.fromContractNumber (this.safeString (order, 'executedSizeDeltaUsd'), 30);
            if (executedUsd !== undefined && !Precise.stringEq (executedUsd, '0')) {
                filledUsd = executedUsd;
            }
            if ((amount === undefined || Precise.stringEq (amount, '0')) && average !== undefined && filledUsd !== undefined) {
                amount = Precise.stringDiv (filledUsd, average, 18);
            }
        }
        const updatedAtTime = this.safeString2 (order, 'indexerTimestamp', 'updatedAtTime');
        let timestamp: Int = undefined;
        if (updatedAtTime !== undefined && !Precise.stringEq (updatedAtTime, '0')) {
            timestamp = this.parseToInt (updatedAtTime) * 1000; // pending: updatedAtTime (creation time is not stored), closed: time of the last event
        }
        const chain = this.safeString (order, 'chain', this.safeString (this.options, 'defaultChain', 'arbitrum'));
        const nativeCurrencies = this.safeDict (this.options, 'nativeCurrency', {});
        const executionFee = this.fromContractNumber (this.safeString (order, 'executionFee'), 18);
        let fee = undefined;
        if (executionFee !== undefined) {
            fee = {
                'cost': this.parseNumber (executionFee),
                'currency': this.safeString (nativeCurrencies, chain, 'ETH'),
            };
        }
        return this.safeOrder ({
            'id': orderKey,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': timestamp,
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'type': unifiedType,
            'timeInForce': undefined,
            'postOnly': undefined,
            'reduceOnly': isDecrease,
            'side': side,
            'price': (unifiedType === 'limit') ? triggerPrice : undefined,
            'triggerPrice': (hasTrigger && orderType !== 3) ? triggerPrice : undefined, // a plain LimitIncrease is a limit price, not a stop trigger
            'amount': amount,
            'cost': (status === 'closed') ? filledUsd : undefined,
            'average': average,
            'filled': (status === 'closed') ? amount : 0,
            'remaining': (status === 'closed') ? 0 : amount,
            'status': status, // pending (in contract storage, info.isFrozen marks frozen orders) = open
            'reason': this.safeString (order, 'reason'),
            'fee': fee,
            'trades': undefined,
        }, marketObj);
    }

    // ---- liquidation price (solved against Reader.isPositionLiquidatable) ----------

    abiUintFromDecimal (decimal: string): string {
        // uint256 from an arbitrary size non-negative decimal string (abiUint () only handles safe JS integers)
        let hex = '';
        let value = decimal;
        const digits = '0123456789abcdef';
        while (!Precise.stringEq (value, '0')) {
            const remainder = Precise.stringMod (value, '16');
            hex = digits[this.parseToInt (remainder)] + hex;
            value = Precise.stringDiv (Precise.stringSub (value, remainder), '16', 0) as string;
        }
        return hex.padStart (64, '0');
    }

    parseTokenOraclePrice (raw: Str): Num {
        if (raw === undefined) {
            return undefined;
        }
        if (raw.indexOf ('.') >= 0) {
            return this.parseNumber (raw); // already a decimal USD price
        }
        // /tokens/info prices are plain 30-decimal USD, independent of token decimals
        return this.parseNumber (Precise.stringDiv (raw, this.pow10String (30), 18));
    }

    async fetchTokenOraclePrices (chain: string): Promise<Dict> {
        // lowercase token address => { 'min': number, 'max': number } in USD, from GET /tokens/info
        // (fields per the API reference: address, decimals, isStable, prices { minPrice, maxPrice } as strings)
        // the reference does not state the price scale, so both a decimal and the contract encoding are handled and a
        // stable token priced outside 0.5 - 1.5 USD aborts instead of silently feeding a wrong price to the Reader
        const response = await this.publicGetTokensInfo ({ 'chain': chain }) as List;
        const result: Dict = {};
        for (let i = 0; i < response.length; i++) {
            const token = response[i];
            const address = this.safeStringLower (token, 'address');
            const prices = this.safeDict (token, 'prices', {});
            const minPrice = this.parseTokenOraclePrice (this.safeString (prices, 'minPrice'));
            const maxPrice = this.parseTokenOraclePrice (this.safeString (prices, 'maxPrice'));
            if (address === undefined || minPrice === undefined || maxPrice === undefined) {
                continue;
            }
            if (this.safeBool (token, 'isStable', false) && (minPrice < 0.5 || minPrice > 1.5)) {
                throw new ExchangeError (this.id + ' unexpected /tokens/info price scale: stable token ' + address + ' parsed as ' + this.numberToString (minPrice) + ' USD from ' + this.safeString (prices, 'minPrice'));
            }
            result[address] = {
                'min': minPrice,
                'max': maxPrice,
                'symbol': this.safeString (token, 'symbol'),
            };
        }
        return result;
    }

    async evaluateRemainingCollateral (price: string, ctx: Dict): Promise<Dict> {
        // one Reader.isPositionLiquidatable call with the index token priced at `price` (min = max), the long / short token
        // prices come from the oracle unless they are the index token itself. shouldValidateMinCollateralUsd = true so that
        // all three fields of IsPositionLiquidatableInfo are filled, forLiquidation = true to use the liquidation min collateral factor
        const tokens = [ ctx['indexToken'], ctx['longToken'], ctx['shortToken'] ];
        let priceWords = '';
        for (let i = 0; i < tokens.length; i++) {
            let minPrice: Num = undefined;
            let maxPrice: Num = undefined;
            if (tokens[i] === ctx['indexToken']) {
                minPrice = this.parseNumber (price);
                maxPrice = minPrice;
            } else {
                const oracle = this.safeDict (ctx['tokenPrices'], tokens[i], {});
                minPrice = this.safeNumber (oracle, 'min');
                maxPrice = this.safeNumber (oracle, 'max');
                if (this.safeBool (ctx['correlated'], tokens[i], false) && minPrice !== undefined && maxPrice !== undefined) {
                    const ratio = this.parseNumber (price) / ctx['refPrice'];
                    minPrice = minPrice * ratio; // WBTC / WETH collateral moves with the index price
                    maxPrice = maxPrice * ratio;
                }
            }
            if (minPrice === undefined || maxPrice === undefined) {
                throw new ExchangeError (this.id + ' no oracle price for token ' + tokens[i] + ', cannot evaluate liquidation');
            }
            const decimals = this.tokenDecimals (tokens[i]);
            // MarketPrices encoding: usdPrice * 10^(30 - tokenDecimals)
            priceWords = priceWords + this.abiUintFromDecimal (this.toContractPrice (minPrice, decimals)) + this.abiUintFromDecimal (this.toContractPrice (maxPrice, decimals));
        }
        const data = ctx['prefix'] + priceWords + this.abiBool (true) + this.abiBool (true);
        const response = await this.ethCall (ctx['reader'], data, ctx['chain']);
        const words = this.abiWords (response);
        // returns (bool, string, IsPositionLiquidatableInfo): head = [ bool, string offset, info (3 x int256 inline) ]
        const remaining = this.hexToSignedDecimal (words[2]);
        const minCollateralUsd = this.hexToSignedDecimal (words[3]);
        const minCollateralUsdForLeverage = this.hexToSignedDecimal (words[4]);
        return {
            'remaining': remaining,
            'threshold': Precise.stringMax (Precise.stringMax (minCollateralUsd, minCollateralUsdForLeverage), '0'),
        };
    }

    async fetchLiquidationPrice (raw: Dict, market: Market, chain: string, tokenPrices: Dict): Promise<Num> {
        // GMX liquidates when  remainingCollateralUsd < max (minCollateralUsd, size * minCollateralFactorForLiquidation, 0)  where
        //     remainingCollateralUsd = collateralUsd + basePnlUsd (price) + priceImpactUsd - totalCostsUsd
        // (PositionUtils.isPositionLiquidatable). Fees, impact and the min collateral factor are exactly what the Reader already
        // computes, and remainingCollateralUsd is (piecewise) linear in the index price, so the price is solved with the secant
        // method on the Reader's own output instead of re-implementing the fee maths: 2 calls to seed, then 1 call per refinement
        // (the first refinement already lands on the answer unless a price impact cap kicks in between the two probes)
        if (market === undefined) {
            return undefined;
        }
        const contracts = this.getContractAddresses (chain);
        const referralStorage = this.safeString (contracts, 'referralStorage') as string;
        const markPriceNumber = this.safeNumber (raw, 'markPrice');
        if (referralStorage === undefined || referralStorage === '' || markPriceNumber === undefined) {
            return undefined;
        }
        const info = this.safeDict (market, 'info', {});
        const isLong = this.safeBool (raw, 'isLong', true);
        const marketToken = this.safeStringLower (raw, 'market') as string;
        const indexToken = this.safeStringLower (info, 'indexTokenAddress') as string;
        const longToken = this.safeStringLower (info, 'longTokenAddress') as string;
        const shortToken = this.safeStringLower (info, 'shortTokenAddress') as string;
        const account = this.safeString (raw, 'account') as string;
        const collateralToken = this.safeString (raw, 'collateralToken') as string;
        const dataStore = this.safeString (contracts, 'dataStore') as string;
        const ctx: Dict = {
            'chain': chain,
            'reader': this.safeString (contracts, 'reader'),
            'indexToken': indexToken,
            'longToken': longToken,
            'shortToken': shortToken,
            'tokenPrices': tokenPrices,
        };
        const base = market['base'];
        const correlated: Dict = {};
        const candidates = [ ctx['longToken'], ctx['shortToken'] ];
        for (let i = 0; i < candidates.length; i++) {
            const sym = this.safeString (this.safeDict (tokenPrices, candidates[i], {}), 'symbol', '').toUpperCase ();
            if (candidates[i] !== ctx['indexToken'] && (sym === base || sym === 'W' + base || sym === base + '.B' || sym === base + '.E')) {
                correlated[candidates[i]] = true;
            }
        }
        ctx['correlated'] = correlated;
        const indexOracle = this.safeDict (tokenPrices, ctx['indexToken'], {});
        const indexMin = this.safeNumber (indexOracle, 'min');
        const indexMax = this.safeNumber (indexOracle, 'max');
        ctx['refPrice'] = (indexMin !== undefined && indexMax !== undefined) ? (indexMin + indexMax) / 2 : markPriceNumber;
        const positionKey = this.getPositionKey (account, marketToken, collateralToken, isLong);
        const selector = this.abiSelector ('isPositionLiquidatable(address,address,bytes32,(address,address,address,address),((uint256,uint256),(uint256,uint256),(uint256,uint256)),bool,bool)');
        // Market.Props = (marketToken, indexToken, longToken, shortToken), static, encoded inline
        ctx['prefix'] = selector + this.abiAddress (dataStore) + this.abiAddress (referralStorage) + this.remove0xPrefix (positionKey)
            + this.abiAddress (marketToken) + this.abiAddress (indexToken) + this.abiAddress (longToken) + this.abiAddress (shortToken);
        await this.ensureTokenDecimals ([ indexToken, longToken, shortToken ], chain);
        let xa = this.numberToString (markPriceNumber);
        let xb = this.numberToString (isLong ? markPriceNumber * 0.9 : markPriceNumber * 1.1); // second probe in the direction of liquidation
        const probes = await Promise.all ([ this.evaluateRemainingCollateral (xa, ctx), this.evaluateRemainingCollateral (xb, ctx) ]);
        let ya = this.safeString (probes[0], 'remaining');
        let yb = this.safeString (probes[1], 'remaining');
        const threshold = this.safeString (probes[0], 'threshold');
        const tolerance = '10000000000000000000000000000'; // 0.01 USD in 30 decimals
        for (let i = 0; i < 4; i++) {
            const slope = Precise.stringDiv (Precise.stringSub (yb, ya), Precise.stringSub (xb, xa), 18);
            if (slope === undefined || Precise.stringEq (slope, '0')) {
                return undefined; // remaining collateral does not depend on price (nothing to solve)
            }
            const xc = Precise.stringAdd (xb, Precise.stringDiv (Precise.stringSub (threshold, yb), slope, 18));
            if (xc === undefined || !Precise.stringGt (xc, '0')) {
                return undefined; // the position cannot be liquidated by a price move
            }
            const evaluated = await this.evaluateRemainingCollateral (xc, ctx);
            const yc = this.safeString (evaluated, 'remaining');
            if (Precise.stringLe (Precise.stringAbs (Precise.stringSub (yc, threshold)), tolerance)) {
                return this.parseNumber (xc);
            }
            xa = xb;
            ya = yb;
            xb = xc;
            yb = yc;
        }
        return undefined; // did not converge, report nothing rather than a wrong price
    }

    // ---- positions --------------------------------------------------------

    async buildPositions (rawPositions: Dict[], chain: string): Promise<Position[]> {
        if (rawPositions.length === 0) {
            return [];
        }
        // token decimals: sizeInTokens is in index token decimals, collateralAmount in collateral token decimals
        const addresses: string[] = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const market = this.safeMarket (this.safeStringLower (rawPositions[i], 'market'));
            const info = this.safeDict (market, 'info', {});
            const indexToken = this.safeStringLower (info, 'indexTokenAddress');
            if (indexToken !== undefined) {
                addresses.push (indexToken);
            }
            const collateralToken = this.safeStringLower (rawPositions[i], 'collateralToken');
            if (collateralToken !== undefined) {
                addresses.push (collateralToken);
            }
        }
        await this.ensureTokenDecimals (addresses, chain);
        // mark prices come from the GMX API tickers, Reader.getAccountPositionInfoList would need a full
        // MarketUtils.MarketPrices (index / long / short min+max) context for every market
        let tokenPrices: Dict = {};
        let liquidationError: Str = undefined;
        try {
            tokenPrices = await this.fetchTokenOraclePrices (chain);
        } catch (e) {
            liquidationError = this.exceptionMessage (e, false); // liquidationPrice stays undefined, the reason is kept in info.liquidationPriceError
        }
        const tickers = await this.publicGetMarketsTickers ({ 'chain': chain }) as List;
        const markPrices: Dict = {};
        for (let i = 0; i < tickers.length; i++) {
            const marketTokenAddress = this.safeStringLower (tickers[i], 'marketTokenAddress');
            if (marketTokenAddress !== undefined) {
                markPrices[marketTokenAddress] = this.parseGmxPrice (this.safeString (tickers[i], 'markPrice'));
            }
        }
        const result: Position[] = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const raw = rawPositions[i];
            const marketId = this.safeStringLower (raw, 'market');
            raw['markPrice'] = this.safeNumber (markPrices, marketId);
            const collateralToken = this.safeStringLower (raw, 'collateralToken');
            const oracle = this.safeDict (tokenPrices, collateralToken, {});
            const cMin = this.safeNumber (oracle, 'min');
            const cMax = this.safeNumber (oracle, 'max');
            if (cMin !== undefined && cMax !== undefined) {
                raw['collateralPrice'] = (cMin + cMax) / 2;
            }
            if (liquidationError === undefined) {
                try {
                    raw['liquidationPrice'] = await this.fetchLiquidationPrice (raw, this.safeMarket (marketId), chain, tokenPrices);
                } catch (e) {
                    raw['liquidationPriceError'] = this.exceptionMessage (e, false);
                }
            } else {
                raw['liquidationPriceError'] = liquidationError;
            }
            result.push (this.parsePosition (raw, this.safeMarket (marketId)));
        }
        return result;
    }

    /**
     * @method
     * @name gmx#fetchPositions
     * @description fetch all open positions of an account from the Reader contract
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetaccountpositions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] wallet address, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const marketSymbols = this.marketSymbols (symbols);
        const [ chain, chainParams ] = this.handleChain (params);
        const [ address ] = this.getUserAddress ('fetchPositions', chainParams);
        const rawPositions = await this.fetchAccountPositionsRaw (address, chain);
        const positions = await this.buildPositions (rawPositions, chain);
        return this.filterByArrayPositions (positions, 'symbol', marketSymbols);
    }

    /**
     * @method
     * @name gmx#fetchPosition
     * @description fetch data on a single open position
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetposition
     * @see https://docs.gmx.io/docs/api/contracts/reader/#readergetaccountpositions
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionKey] bytes32 position key, looked up directly with Reader.getPosition
     * @param {bool} [params.isLong] select the long or the short side (a market can hold up to one position per side and collateral token)
     * @param {string} [params.collateralToken] select the position using this collateral token address
     * @param {string} [params.address] wallet address, defaults to exchange.walletAddress
     * @param {string} [params.chain] 'arbitrum' or 'avalanche', defaults to options.defaultChain
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async fetchPosition (symbol: string, params: Dict = {}): Promise<Position> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ chain, chainParams ] = this.handleChain (params);
        const positionKey = this.safeString (chainParams, 'positionKey');
        if (positionKey !== undefined) {
            // direct lookup, Position.Props is a fully static struct so it comes back inline (no offsets)
            const contracts = this.getContractAddresses (chain);
            const selector = this.abiSelector ('getPosition(address,bytes32)');
            const reader = this.safeString (contracts, 'reader') as string;
            const dataStore = this.safeString (contracts, 'dataStore') as string;
            const data = selector + this.abiAddress (dataStore) + this.abiBytes32 (positionKey);
            const response = await this.ethCall (reader, data, chain);
            const words = this.abiWords (response);
            if (words.length < 5) {
                return {} as Position;
            }
            const raw = this.decodePositionAt (words, 0, words.length - 4);
            if (this.safeString (raw, 'account') === this.safeString (this.options, 'zeroAddress')) {
                return {} as Position; // empty struct = no such position
            }
            const built = await this.buildPositions ([ raw ], chain);
            return this.safeDict (built, 0, {}) as Position;
        }
        const [ address, query ] = this.getUserAddress ('fetchPosition', chainParams);
        const wantedIsLong = this.safeBool (query, 'isLong');
        const wantedCollateral = this.safeStringLower (query, 'collateralToken');
        const rawPositions = await this.fetchAccountPositionsRaw (address, chain);
        const selected: Dict[] = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const raw = rawPositions[i];
            if (this.safeStringLower (raw, 'market') !== market['id']) {
                continue;
            }
            if (wantedIsLong !== undefined && this.safeBool (raw, 'isLong') !== wantedIsLong) {
                continue;
            }
            if (wantedCollateral !== undefined && this.safeStringLower (raw, 'collateralToken') !== wantedCollateral) {
                continue;
            }
            selected.push (raw);
        }
        const positions = await this.buildPositions (selected, chain);
        return this.safeDict (positions, 0, {}) as Position;
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        //
        // decoded Position.Props from Reader.getAccountPositions (raw integers as strings)
        //
        //     {
        //         "account": "0x...",
        //         "market": "0x70d95587d4ef2aca8c9ec8bec82c8fc690e72216",
        //         "collateralToken": "0xaf88d065e77c8cc2239301c5e013f010b61d581d",
        //         "sizeInUsd": "10000000000000000000000000000000000",   // 30 decimals
        //         "sizeInTokens": "3846153846153846153",                 // index token decimals
        //         "collateralAmount": "1000000000",                      // collateral token decimals
        //         "pendingImpactAmount": "0",
        //         "borrowingFactor": "0",
        //         "fundingFeeAmountPerSize": "0",
        //         "longTokenClaimableFundingAmountPerSize": "0",
        //         "shortTokenClaimableFundingAmountPerSize": "0",
        //         "increasedAtTime": "1710000000",
        //         "decreasedAtTime": "0",
        //         "isLong": true,
        //         "markPrice": 2600.85                                  // injected from the API tickers by buildPositions ()
        //     }
        //
        const marketId = this.safeStringLower (position, 'market');
        const marketObj = this.safeMarket (marketId, market);
        const info = this.safeDict (marketObj, 'info', {});
        const indexToken = this.safeStringLower (info, 'indexTokenAddress');
        const shortToken = this.safeStringLower (info, 'shortTokenAddress');
        const collateralToken = this.safeStringLower (position, 'collateralToken');
        const isLong = this.safeBool (position, 'isLong', true);
        const indexDecimals = this.tokenDecimals (indexToken);
        const collateralDecimals = this.tokenDecimals (collateralToken);
        const sizeUsd = this.fromContractNumber (this.safeString (position, 'sizeInUsd'), 30);
        const sizeTokens = this.fromContractNumber (this.safeString (position, 'sizeInTokens'), indexDecimals);
        const collateralAmount = this.fromContractNumber (this.safeString (position, 'collateralAmount'), collateralDecimals);
        let entryPrice: Str = undefined;
        if (sizeTokens !== undefined && sizeUsd !== undefined && !Precise.stringEq (sizeTokens, '0')) {
            // sizeInUsd / sizeInTokens is the volume weighted average entry price of the position
            entryPrice = Precise.stringDiv (sizeUsd, sizeTokens, 18);
        }
        const markPriceNumber = this.safeNumber (position, 'markPrice');
        const markPrice = (markPriceNumber !== undefined) ? this.numberToString (markPriceNumber) : undefined;
        let notional = sizeUsd;
        if (markPrice !== undefined && sizeTokens !== undefined) {
            notional = Precise.stringMul (sizeTokens, markPrice);
        }
        // base PnL only: price move of the position, it excludes borrowing / funding fees and price impact
        let unrealizedPnl: Str = undefined;
        if (notional !== undefined && sizeUsd !== undefined) {
            unrealizedPnl = isLong ? Precise.stringSub (notional, sizeUsd) : Precise.stringSub (sizeUsd, notional);
        }
        // collateral value in USD, only derivable without extra price lookups for the two common cases:
        //   - the short token (USDC / USDT / DAI) is assumed to be worth 1 USD
        //   - the long token when it is also the index token is valued at the mark price
        let collateralUsd: Str = undefined;
        const collateralPriceNumber = this.safeNumber (position, 'collateralPrice');
        if (collateralAmount !== undefined) {
            if (collateralToken === indexToken && markPrice !== undefined) {
                collateralUsd = Precise.stringMul (collateralAmount, markPrice);
            } else if (collateralPriceNumber !== undefined) {
                collateralUsd = Precise.stringMul (collateralAmount, this.numberToString (collateralPriceNumber));
            } else if (collateralToken === shortToken && collateralToken !== indexToken) {
                collateralUsd = collateralAmount; // last resort: stable assumed 1 USD
            }
        }
        let leverage: Str = undefined;
        let percentage: Str = undefined;
        if (collateralUsd !== undefined && sizeUsd !== undefined && !Precise.stringEq (collateralUsd, '0')) {
            leverage = Precise.stringDiv (sizeUsd, collateralUsd, 4);
            if (unrealizedPnl !== undefined) {
                percentage = Precise.stringMul (Precise.stringDiv (unrealizedPnl, collateralUsd, 8), '100');
            }
        }
        const increasedAtTime = this.safeString (position, 'increasedAtTime', '0');
        const decreasedAtTime = this.safeString (position, 'decreasedAtTime', '0');
        const lastUpdateSeconds = Precise.stringMax (increasedAtTime, decreasedAtTime);
        const timestamp: Int = Precise.stringEq (lastUpdateSeconds, '0') ? undefined : this.parseToInt (lastUpdateSeconds) * 1000;
        let positionKey: Str = undefined;
        const account = this.safeString (position, 'account');
        if (account !== undefined && marketId !== undefined && collateralToken !== undefined) {
            positionKey = this.getPositionKey (account, marketId, collateralToken, isLong);
        }
        return this.safePosition ({
            'info': position,
            'id': positionKey,
            'symbol': (marketObj !== undefined) ? marketObj['symbol'] : undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'isolated': true, // GMX v2 collateral is held per position
            'hedged': false,
            'side': isLong ? 'long' : 'short',
            'contracts': this.parseNumber (sizeTokens),
            'contractSize': this.safeNumber (marketObj, 'contractSize'),
            'entryPrice': this.parseNumber (entryPrice),
            'markPrice': this.parseNumber (markPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.parseNumber (leverage),
            'positionMargin': this.parseNumber (collateralUsd),
            'collateral': this.parseNumber (collateralUsd),
            'initialMargin': this.parseNumber (collateralUsd),
            'maintenanceMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMarginPercentage': undefined,
            'unrealizedPnl': this.parseNumber (unrealizedPnl),
            // solved in fetchLiquidationPrice () from Reader.isPositionLiquidatable, undefined when referralStorage is not configured
            'liquidationPrice': this.safeNumber (position, 'liquidationPrice'),
            'marginMode': 'isolated',
            'marginRatio': undefined,
            'percentage': this.parseNumber (percentage),
        });
    }

    /**
     * @method
     * @name gmx#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.gmx.io/docs/api/gmx-api/get-trades/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.address] target account wallet address
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const address = this.safeString (params, 'address', this.walletAddress);
        if (address === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades () requires this.walletAddress to be configured, or an "address" param');
        }
        const request: Dict = {
            'address': address,
        };
        if (market !== undefined) {
            request['marketAddress'] = market['id'];
        }
        if (since !== undefined) {
            request['since'] = Math.floor (since / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const query = this.omit (params, 'address');
        const response = await this.publicGetTrades (this.extend (request, query));
        const trades = this.safeList (response, 'trades', []);
        const executedTrades: Dict[] = [];
        const zeroAddress = this.safeString (this.options, 'zeroAddress');
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const eventName = this.safeString (trade, 'eventName');
            const orderType = this.safeInteger (trade, 'orderType');
            const marketAddress = this.safeStringLower (trade, 'marketAddress');
            const sizeDeltaUsd = this.safeString (trade, 'sizeDeltaUsd', '0');
            if (eventName !== 'OrderExecuted' || orderType === 0 || orderType === 1) {
                continue;
            }
            if (marketAddress === undefined || marketAddress === zeroAddress) {
                continue;
            }
            if (Precise.stringEq (sizeDeltaUsd, '0')) {
                continue; // collateral-only action, not a trade
            }
            executedTrades.push (trade);
        }
        await this.ensureTradeTokenDecimals (executedTrades);
        return this.parseTrades (executedTrades, market, since, limit);
    }

    /**
     * @method
     * @name gmx#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.gmx.io/docs/api/contracts/exchange-router/#createorderparams
     * @param {float} leverage the desired leverage multiplier (1–50 depending on market tier)
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] margin mode — GMX v2 only supports 'isolated' (default)
     * @returns {object} an object confirming the stored leverage preference
     */
    override async setLeverage (leverage: Int, symbol: Str = undefined, params: Dict = {}): Promise<any> {
        //
        // GMX v2 does not have a standalone "set leverage" on-chain call separate from order creation.
        // Leverage is an emergent property of:  leverage = sizeDeltaUsd / collateralDeltaUsd
        // This method stores the desired leverage in options so createOrder can apply it automatically.
        // createOrder () reads options['leverage'][symbol] to size the collateral when params.collateralAmount is not given
        //
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage () requires a symbol argument');
        }
        if (leverage === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage () requires a leverage argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' setLeverage () supports perpetual swap markets only');
        }
        const maxLeverage = this.safeNumber (market['limits']['leverage'], 'max', 50) as number;
        const minLeverage = this.safeNumber (market['limits']['leverage'], 'min', 1) as number;
        if (leverage < minLeverage || leverage > maxLeverage) {
            throw new BadRequest (this.id + ' setLeverage () leverage ' + this.numberToString (leverage) + ' is out of allowed range [' + this.numberToString (minLeverage) + ', ' + this.numberToString (maxLeverage) + '] for ' + symbol);
        }
        // persist per-symbol in options.leverage
        if (this.options['leverage'] === undefined) {
            this.options['leverage'] = {};
        }
        this.options['leverage'][symbol] = leverage;
        return {
            'info': {
                'symbol': symbol,
                'leverage': leverage,
                'note': 'GMX v2 leverage is applied inline when createOrder() is called. The value is stored locally in options[\'leverage\'][symbol] = ' + this.numberToString (leverage) + '.',
            },
            'symbol': market['symbol'],
            'leverage': leverage,
            'marginMode': this.safeString (params, 'marginMode', 'isolated'),
        };
    }

    /**
     * @method
     * @name gmx#setMarginMode
     * @description set margin mode for a market; GMX v2 uses isolated margin per GM liquidity pool
     * @see https://docs.gmx.io/docs/api/contracts/exchange-router/#createorderparams
     * @param {string} marginMode margin mode — only 'isolated' is supported on GMX v2
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object confirming the margin mode
     */
    override async setMarginMode (marginMode: string, symbol: Str = undefined, params: Dict = {}): Promise<any> {
        //
        // GMX v2 uses isolated margin per GM pool by design — each market has its own isolated
        // collateral pool. Cross-margin between different GMX markets is not supported on-chain.
        // This method validates the requested mode and stores it; 'isolated' is the only valid value.
        //
        const normalised = marginMode.toLowerCase ();
        if (normalised !== 'isolated') {
            throw new BadRequest (this.id + ' setMarginMode () only supports \'isolated\' margin mode. GMX v2 uses isolated margin per GM liquidity pool by design; cross-margin is not available.');
        }
        if (symbol !== undefined) {
            await this.loadMarkets ();
            const market = this.market (symbol);
            if (!market['swap']) {
                throw new BadRequest (this.id + ' setMarginMode () supports perpetual swap markets only');
            }
        }
        return {
            'info': {
                'marginMode': normalised,
                'symbol': symbol,
                'note': 'GMX v2 uses isolated margin per GM liquidity pool. No on-chain transaction is required; collateral is managed per position through ExchangeRouter.createOrder() parameters.',
            },
            'marginMode': normalised,
            'symbol': symbol,
        };
    }
}
