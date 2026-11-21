import Exchange from './abstract/raydium.js';
import { ArgumentsRequired, BadRequest, BadSymbol, ExchangeError, InvalidOrder, NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import type { Currencies, CurrencyInterface, Conversion, Dict, Int, int, Market, Num, OHLCV, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';

/**
 * @class raydium
 * @augments Exchange
 */
export default class raydium extends Exchange {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'id': 'raydium',
            'name': 'Raydium',
            'countries': [],
            'version': 'v3',
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'dex': true,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelOrder': false,
                'createConvertTrade': true,
                'createOrder': false,
                'fetchBalance': false,
                'fetchConvertQuote': true,
                'fetchCurrencies': true,
                'fetchDeposits': false,
                'fetchLiquidity': true,
                'fetchLiquidityPools': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchPoolFees': true,
                'fetchStake': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchWithdrawals': false,
                'sandbox': true,
                'submitPool': true,
                'withdraw': false,
            },
            'urls': {
                'logo': 'https://raydium.io/logo.png',
                'api': {
                    'apiV3': 'https://api-v3.raydium.io',
                    'transaction': 'https://transaction-v1.raydium.io',
                    'launchMint': 'https://launch-mint-v1.raydium.io',
                    'launchHistory': 'https://launch-history-v1.raydium.io',
                    'launchAuth': 'https://launch-auth-v1.raydium.io',
                    'launchForum': 'https://launch-forum-v1.raydium.io',
                    'owner': 'https://owner-v1.raydium.io',
                    'dynamic': 'https://dynamic-ipfs.raydium.io',
                    'temp': 'https://temp-api-v1.raydium.io',
                    'perps': 'https://api-perps-v1.raydium.io',
                    'rpc': 'https://api.mainnet-beta.solana.com',
                },
                'test': {
                    'apiV3': 'https://api-v3-devnet.raydium.io',
                    'transaction': 'https://transaction-v1-devnet.raydium.io',
                    'launchMint': 'https://launch-mint-v1-devnet.raydium.io',
                    'launchHistory': 'https://launch-history-v1-devnet.raydium.io',
                    'launchAuth': 'https://launch-auth-v1-devnet.raydium.io',
                    'launchForum': 'https://launch-forum-v1-devnet.raydium.io',
                    'owner': 'https://owner-v1-devnet.raydium.io',
                    'dynamic': 'https://dynamic-ipfs-devnet.raydium.io',
                    'temp': 'https://temp-api-v1-devnet.raydium.io',
                    'rpc': 'https://api.devnet.solana.com',
                },
                'www': 'https://raydium.io',
                'doc': [
                    'https://docs.raydium.io/api-reference',
                    'https://docs.raydium.io/sdk-api/typescript-sdk',
                ],
                'fees': 'https://raydium.io/fees',
            },
            'api': {
                'apiV3': {
                    'public': {
                        'get': [
                            'main/auto-fee',
                            'main/info',
                            'main/stake-pools',
                            'mint/ids',
                            'mint/list',
                            'mint/price',
                            'pools/info/ids',
                            'pools/info/list',
                            'pools/info/mint',
                            'farms/info/ids',
                            'farms/info/lp',
                        ],
                    },
                },
                'transaction': {
                    'public': {
                        'get': [
                            'compute/swap-base-in',
                            'compute/swap-base-out',
                        ],
                        'post': [
                            'transaction/swap-base-in',
                            'transaction/swap-base-out',
                        ],
                    },
                },
                'launchMint': {
                    'public': {
                        'get': [
                            'get/search',
                            'get/random/index-top-mint',
                            'get/random/index-left-mint',
                            'get/by/mints',
                            'get/by/user',
                            'get/list',
                            'get-by-user/stats/volume',
                            'get-by-user/stats/create',
                            'campaign/configs',
                            'campaign/platforms-v2',
                            'vesting/by/ids',
                            'vesting/by/pool',
                            'vesting/by/owner',
                        ],
                        'post': [
                            'create/mint-info',
                            'create/sendTransaction',
                        ],
                    },
                },
                'launchHistory': {
                    'public': {
                        'get': [
                            'kline',
                            'trade',
                        ],
                    },
                },
                'launchAuth': {
                    'public': {
                        'get': [
                            'check-token',
                            'del-token',
                        ],
                        'post': [
                            'request-token',
                            'request-token-ledger',
                        ],
                    },
                },
                'launchForum': {
                    'public': {
                        'get': [
                            'comment/pool',
                            'comment/id',
                        ],
                        'post': [
                            'comment',
                        ],
                    },
                },
                'owner': {
                    'public': {
                        'get': [
                            'position/stake/{owner}',
                            'position/clmm-lock/{owner}',
                            'create-pool/{owner}',
                            'main/ido/{owner}',
                        ],
                    },
                },
                'dynamic': {
                    'public': {
                        'get': [
                            'clmm/position',
                            'lock/clmm/position',
                            'lock/cpmm/position',
                        ],
                    },
                },
                'temp': {
                    'public': {
                        'get': [
                            'cp-creator-fee',
                            'limit-order/order/list',
                            'limit-order/history/order/list-by-user',
                            'limit-order/history/event/list-by-pda',
                        ],
                    },
                },
                'perps': {
                    'public': {
                        'get': [
                            'main/info',
                            'main/version',
                            'main/rpcs',
                            'main/availability-check',
                            'pool/default-list',
                        ],
                    },
                },
                'rpc': {
                    'public': {
                        'post': [
                            '',
                        ],
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
            },
            'precisionMode': DECIMAL_PLACES,
            'options': {
                'defaultType': 'spot',
            },
        });
    }

    /**
     * @ignore
     * @param {object} pool raw or partially normalized Raydium pool data
     * @returns {object} common liquidity pool structure
     */
    parseLiquidityPool (pool: Dict): Dict {
        //
        //     {
        //         "id": "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW",
        //         "poolId": "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW",
        //         "type": "stake",
        //         "baseCurrency": null,
        //         "quoteCurrency": null,
        //         "lpCurrency": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //         "symbol": null,
        //         "name": null,
        //         "totalLiquidity": null,
        //         "totalLiquidityValue": 65353889.85708877,
        //         "volume24h": null,
        //         "apr": 0.0367,
        //         "feeRate": null,
        //         "info": {
        //             "programId": "EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q",
        //             "id": "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW",
        //             "symbolMints": [
        //                 {
        //                     "chainId": 101,
        //                     "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                     "symbol": "RAY",
        //                     "name": "Raydium",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 }
        //             ],
        //             "lpMint": {
        //                 "chainId": 101,
        //                 "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                 "symbol": "RAY",
        //                 "name": "Raydium",
        //                 "decimals": 6,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "tvl": 65353889.85708877,
        //             "lpPrice": 1.451041171185985,
        //             "apr": 0.0367,
        //             "tags": [
        //                 "Stake"
        //             ],
        //             "rewardInfos": [
        //                 {
        //                     "mint": {
        //                         "chainId": 101,
        //                         "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                         "symbol": "RAY",
        //                         "name": "Raydium",
        //                         "decimals": 6,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "type": "Standard SPL",
        //                     "apr": 0.0367,
        //                     "perSecond": "28200"
        //                 }
        //             ]
        //         },
        //         "supplyRate": null,
        //         "borrowRate": null,
        //         "rewardsRate": null,
        //         "active": null
        //     }
        //
        //
        const info = this.safeDict (pool, 'info', pool);
        const poolId = this.safeString (pool, 'poolId', this.safeString (pool, 'id'));
        return this.extend (pool, {
            'id': this.safeString (pool, 'id', poolId),
            'poolId': poolId,
            'type': this.safeString (pool, 'type'),
            'baseCurrency': this.safeString (pool, 'baseCurrency', this.safeString (pool, 'currency', this.safeString (pool, 'mint'))),
            'quoteCurrency': this.safeString (pool, 'quoteCurrency', this.safeString (pool, 'borrowCurrency')),
            'lpCurrency': this.safeString (pool, 'lpCurrency'),
            'symbol': this.safeString (pool, 'symbol'),
            'name': this.safeString (pool, 'name'),
            'totalLiquidity': this.safeNumber2 (pool, 'totalLiquidity', 'tvl'),
            'totalLiquidityValue': this.safeNumber2 (pool, 'totalLiquidityValue', 'tvlUsd'),
            'volume24h': this.safeNumber2 (pool, 'volume24h', 'volume24hUsd'),
            'apr': this.safeNumber2 (pool, 'apr', 'totalRate'),
            'supplyRate': this.safeNumber (pool, 'supplyRate'),
            'borrowRate': this.safeNumber (pool, 'borrowRate'),
            'rewardsRate': this.safeNumber (pool, 'rewardsRate'),
            'feeRate': this.safeNumber (pool, 'feeRate'),
            'active': this.safeBool (pool, 'active'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} position raw or partially normalized Raydium position data
     * @returns {object} common liquidity position structure
     */
    parseLiquidity (position: Dict): Dict {
        //
        // normalized clmm-lock position
        //
        //     {
        //         "id": "A3Ay878B9NceEPMuB3yaBJRauBnazErXB3PrcBdn7jAb",
        //         "poolId": "AHuAAekwu2DrdagqStUffr6XyRGxLT11g18cGKwvTvpP",
        //         "owner": "5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG",
        //         "type": "clmm-lock",
        //         "currency": "3GpRo9xH1sfmao5F4zFVyC5vJmmx1KCyZgRtaqrsQNuU",
        //         "info": {
        //             "lockId": "11dGkgPJDUPNfBRUdKXyf21xCzfRQy6WxTBKGigjAL1",
        //             "nftAccount": "BxtNeXHhTAA5wgv5hjzv3mDqrY6KjmzFk8Wb88cgRVfk",
        //             "positionId": "A3Ay878B9NceEPMuB3yaBJRauBnazErXB3PrcBdn7jAb"
        //         }
        //     }
        //
        const info = this.safeDict (position, 'info', position);
        return this.extend (position, {
            'id': this.safeString (position, 'id'),
            'poolId': this.safeString (position, 'poolId'),
            'owner': this.safeString (position, 'owner'),
            'type': this.safeString (position, 'type'),
            'currency': this.safeString (position, 'currency'),
            'amount': this.safeNumber (position, 'amount'),
            'shares': this.safeNumber (position, 'shares'),
            'collateral': this.safeNumber (position, 'collateral'),
            'collateralCurrency': this.safeString (position, 'collateralCurrency'),
            'debt': this.safeNumber (position, 'debt'),
            'borrowCurrency': this.safeString (position, 'borrowCurrency'),
            'liquidated': this.safeBool (position, 'liquidated'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} fee raw pool fee or position metadata
     * @param {string} positionId position or pool identifier used for the request
     * @param {string} type fee category
     * @returns {object} common pool fee structure retaining rewards and protocol details
     */
    parsePoolFee (fee: Dict, positionId: string, type: string): Dict {
        //
        //     {
        //         "name": "Raydium Concentrated Liquidity",
        //         "symbol": "RCL",
        //         "description": "Raydium Concentrated Liquidity Position",
        //         "external_url": "https://raydium.io/",
        //         "collection": {
        //             "name": "Raydium Concentrated Liquidity",
        //             "family": "Raydium Concentrated Liquidity"
        //         },
        //         "image": "https://img-v1.raydium.io/share/ea1ef711-652b-422b-a593-04426f8f2a04.jpg",
        //         "poolInfo": {
        //             "type": "Concentrated",
        //             "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        //             "id": "AHuAAekwu2DrdagqStUffr6XyRGxLT11g18cGKwvTvpP",
        //             "mintA": {
        //                 "chainId": 101,
        //                 "address": "poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN.png",
        //                 "symbol": "PONS",
        //                 "name": "Pons",
        //                 "decimals": 8,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "mintB": {
        //                 "chainId": 101,
        //                 "address": "EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL",
        //                 "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                 "logoURI": "https://img-v1.raydium.io/icon/EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL.png",
        //                 "symbol": "PPPP",
        //                 "name": "Pee Pee Poo Poo",
        //                 "decimals": 9,
        //                 "tags": [
        //                     "hasTransferFee"
        //                 ],
        //                 "extensions": {
        //                     "feeConfig": {
        //                         "transferFeeConfigAuthority": "11111111111111111111111111111111",
        //                         "withdrawWithheldAuthority": "5KXDF6QnqhBj72hDtJNkkpFaQVUfbFXNybMsp3DiK6tD",
        //                         "withheldAmount": "0",
        //                         "olderTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         },
        //                         "newerTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         }
        //                     }
        //                 }
        //             },
        //             "rewardDefaultPoolInfos": "Clmm",
        //             "rewardDefaultInfos": [],
        //             "price": 92663.3167149224,
        //             "mintAmountA": 6.70712903,
        //             "mintAmountB": 989999999.997368,
        //             "feeRate": 0.01,
        //             "openTime": "0",
        //             "tvl": 1422.54,
        //             "day": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "week": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "month": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "pooltype": [
        //                 "Clmm"
        //             ],
        //             "farmUpcomingCount": 0,
        //             "farmOngoingCount": 0,
        //             "farmFinishedCount": 0,
        //             "config": {
        //                 "id": "A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x",
        //                 "index": 3,
        //                 "protocolFeeRate": 120000,
        //                 "tradeFeeRate": 10000,
        //                 "tickSpacing": 120,
        //                 "fundFeeRate": 40000,
        //                 "defaultRange": 0.1,
        //                 "defaultRangePoint": [
        //                     0.01,
        //                     0.05,
        //                     0.1,
        //                     0.2,
        //                     0.5
        //                 ]
        //             },
        //             "burnPercent": 100,
        //             "launchMigratePool": false,
        //             "tips": [],
        //             "feeOn": "TokenA",
        //             "hasDynamicFee": false
        //         },
        //         "positionInfo": {
        //             "tvlPercentage": 4.99,
        //             "usdValue": 71.08233887794744,
        //             "amountA": 1e-8,
        //             "amountB": 49499999.99986821,
        //             "unclaimedFee": {
        //                 "amountA": 0.00000422,
        //                 "amountB": 0,
        //                 "usdFeeValue": 5.615349632798997e-7,
        //                 "reward": [],
        //                 "usdRewardValue": 0,
        //                 "usdValue": 5.615349632798997e-7
        //             }
        //         }
        //     }
        //
        //
        const info = this.safeDict (fee, 'info', fee);
        const amount = this.safeNumber2 (fee, 'unclaimedAmount', 'unclaimedFee');
        return this.extend (fee, {
            'id': this.safeString (fee, 'id', positionId),
            'poolId': this.safeString (fee, 'poolId'),
            'positionId': this.safeString (fee, 'positionId', positionId),
            'type': type,
            'currency': this.safeString2 (fee, 'currency', 'quoteMint'),
            'amount': amount,
            'unclaimedAmount': amount,
            'totalAmount': this.safeNumber2 (fee, 'totalAmount', 'totalFee'),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} addresses raw pool and mint data
     * @returns {object} common pool-address structure retaining mint metadata
     */
    parsePoolMintAddresses (addresses: Dict): Dict {
        //
        //     {
        //         "info": {
        //             "type": "Standard",
        //             "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        //             "id": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //             "mintA": {
        //                 "chainId": 101,
        //                 "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                 "symbol": "RAY",
        //                 "name": "Raydium",
        //                 "decimals": 6,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "mintB": {
        //                 "chainId": 101,
        //                 "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //                 "symbol": "USDT",
        //                 "name": "USDT",
        //                 "decimals": 6,
        //                 "tags": [
        //                     "hasFreeze"
        //                 ],
        //                 "extensions": {}
        //             },
        //             "price": 1.450963684541678,
        //             "mintAmountA": 494211.140111,
        //             "mintAmountB": 717082.416797,
        //             "feeRate": 0.0025,
        //             "openTime": "0",
        //             "tvl": 1432999.98,
        //             "day": {
        //                 "volume": 186092.7007745733,
        //                 "volumeQuote": 186612.78683811732,
        //                 "volumeFee": 465.2317519364334,
        //                 "apr": 11.85,
        //                 "feeApr": 11.85,
        //                 "priceMin": 1.4368946666666669,
        //                 "priceMax": 1.6216216216216215,
        //                 "rewardApr": [
        //                     0
        //                 ]
        //             },
        //             "week": {
        //                 "volume": 1053593.774430563,
        //                 "volumeQuote": 1056810.6216153002,
        //                 "volumeFee": 2633.9844360764077,
        //                 "apr": 5.51,
        //                 "feeApr": 5.51,
        //                 "priceMin": 1.4368946666666669,
        //                 "priceMax": 1.82563774699872,
        //                 "rewardApr": [
        //                     0
        //                 ]
        //             },
        //             "month": {
        //                 "volume": 4769309.830042222,
        //                 "volumeQuote": 4786008.320176001,
        //                 "volumeFee": 11923.274575105555,
        //                 "apr": 9.98,
        //                 "feeApr": 9.98,
        //                 "priceMin": 1.3636363636363635,
        //                 "priceMax": 2.08662236438065,
        //                 "rewardApr": [
        //                     0
        //                 ]
        //             },
        //             "pooltype": [
        //                 "Amm",
        //                 "OpenBookMarket"
        //             ],
        //             "rewardDefaultPoolInfos": "Raydium",
        //             "rewardDefaultInfos": [
        //                 {
        //                     "mint": {
        //                         "chainId": 101,
        //                         "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                         "symbol": "RAY",
        //                         "name": "Raydium",
        //                         "decimals": 6,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "perSecond": "0"
        //                 }
        //             ],
        //             "farmUpcomingCount": 0,
        //             "farmOngoingCount": 0,
        //             "farmFinishedCount": 3,
        //             "marketId": "GpHbiJJ9VHiuHVXeoet121Utrbm1CSNNzYrBKB8Xz2oz",
        //             "lpMint": {
        //                 "chainId": 101,
        //                 "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "",
        //                 "symbol": "RAY-USDT",
        //                 "name": "Raydium LP Token V4 (RAY-USDT)",
        //                 "decimals": 6,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "lpPrice": 12.391534616288956,
        //             "lpAmount": 115643.463401,
        //             "burnPercent": 0,
        //             "launchMigratePool": false,
        //             "tips": [],
        //             "feeOn": "Both",
        //             "hasDynamicFee": false
        //         },
        //         "poolId": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //         "mintA": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //         "mintB": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //         "lpMint": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //         "symbol": "RAY/USDT"
        //     }
        //
        //
        const info = this.safeDict (addresses, 'info', addresses);
        return this.extend (addresses, {
            'id': this.safeString (addresses, 'id', this.safeString (addresses, 'poolId')),
            'poolId': this.safeString (addresses, 'poolId', this.safeString (addresses, 'id')),
            'baseCurrency': this.safeString (addresses, 'baseCurrency', this.safeString (addresses, 'mintA', this.safeString (addresses, 'mint'))),
            'quoteCurrency': this.safeString (addresses, 'quoteCurrency', this.safeString (addresses, 'mintB')),
            'lpCurrency': this.safeString (addresses, 'lpCurrency', this.safeString (addresses, 'lpMint')),
            'info': info,
        });
    }

    /**
     * @ignore
     * @param {object} submission raw LaunchLab transaction submission result
     * @param {string} [wallet] wallet that submitted the transaction
     * @returns {object} common pool transaction result retaining venue-specific data
     */
    parsePoolSubmission (submission: Dict, wallet: Str = undefined): Dict {
        //
        //     {
        //         "tx": "AlbqBt4v2rky0reo9vRXXRe6VrcQBLJOg3Mntqc3GXhZtO5uSwS8Z02s8wjsaC/vEGFON/z/B4u+9ic4tWJ6IAR...clJh0VHBQZ",
        //         "signature": "2jnbgCvrtJbdQBLAJfpuALJJKXhpYvG3fQdNa3fYjWhM8XogAmDKFKmh3MnHY8ErQmMeRfjeZY1cbfaPv91nVuTZ"
        //     }
        //
        const info = this.safeDict (submission, 'info', submission);
        const signature = this.safeString2 (submission, 'signature', 'transactionId', this.safeString (submission, 'txid'));
        return this.extend (submission, {
            'id': this.safeString (submission, 'id', signature),
            'signature': signature,
            'poolId': this.safeString (submission, 'poolId', this.safeString (submission, 'poolAddress')),
            'owner': this.safeString (submission, 'owner', wallet),
            'info': info,
        });
    }

    /**
     * @method
     * @name raydium#fetchMarkets
     * @description fetches Raydium spot pools and public swap markets
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] pool, launchlab, swap, or all; by default returns pools and swaps (pools only in sandbox)
     * @returns {object[]} a list of [market structures](https://docs.ccxt.com/#/?id=market-structure)
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const kind = this.safeString (params, 'type', 'pool');
        if ((kind !== 'pool') && (kind !== 'launchlab') && (kind !== 'swap') && (kind !== 'all')) {
            throw new BadRequest (this.id + ' fetchMarkets() params.type must be pool, launchlab, swap, or all');
        }
        const query = this.omit (params, [ 'type' ]);
        if (kind === 'swap') {
            return await this.fetchSwapMarkets (query);
        }
        const rows: Dict[] = [];
        if ((kind === 'pool') || (kind === 'all')) {
            const request = this.extend ({
                'poolType': 'all',
                'poolSortField': 'liquidity',
                'sortType': 'desc',
                'page': 1,
                'pageSize': 1000,
            }, query);
            let response: Dict;
            if (this.safeString (query, 'mint1') !== undefined) {
                response = await this.apiV3PublicGetPoolsInfoMint (request);
            } else {
                response = await this.apiV3PublicGetPoolsInfoList (request);
            }
            //
            //     {
            //         "id": "8e56c5db-02eb-450b-97d6-cc0f7f3db9de",
            //         "success": true,
            //         "data": {
            //             "count": 1000,
            //             "data": [
            //                 {
            //                     "type": "Concentrated",
            //                     "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
            //                     "id": "5mfjy2Ns9MWuVB6z3N1oFGJKSd6RyG2PAdyH2wDKDaMY",
            //                     "mintA": {
            //                         "chainId": 101,
            //                         "address": "AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P",
            //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            //                         "logoURI": "https://img-v1.raydium.io/icon/AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P.png",
            //                         "symbol": "CC",
            //                         "name": "Canton Network",
            //                         "decimals": 9,
            //                         "tags": [],
            //                         "extensions": {}
            //                     },
            //                     "mintB": {
            //                         "chainId": 101,
            //                         "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            //                         "logoURI": "https://img-v1.raydium.io/icon/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png",
            //                         "symbol": "USDC",
            //                         "name": "USD Coin",
            //                         "decimals": 6,
            //                         "tags": [
            //                             "hasFreeze"
            //                         ],
            //                         "extensions": {}
            //                     },
            //                     "rewardDefaultPoolInfos": "Clmm",
            //                     "rewardDefaultInfos": [],
            //                     "price": 0.09600783007339088,
            //                     "mintAmountA": 998564854.1334,
            //                     "mintAmountB": 42031.111974,
            //                     "feeRate": 0.0001,
            //                     "openTime": "0",
            //                     "tvl": 95912075.94,
            //                     "day": {
            //                         "volume": 99903.88828908766,
            //                         "volumeQuote": 99910.60633131946,
            //                         "volumeFee": 9.9903888309347,
            //                         "apr": 0,
            //                         "feeApr": 0,
            //                         "priceMin": 0.09599464144142572,
            //                         "priceMax": 0.09602014342008008,
            //                         "rewardApr": []
            //                     },
            //                     "week": {
            //                         "volume": 1525372.0882718102,
            //                         "volumeQuote": 1525506.8478766459,
            //                         "volumeFee": 152.53721505297452,
            //                         "apr": 0,
            //                         "feeApr": 0,
            //                         "priceMin": 0.09599464144142572,
            //                         "priceMax": 0.09604456892948753,
            //                         "rewardApr": []
            //                     },
            //                     "month": {
            //                         "volume": 2993600.7475060793,
            //                         "volumeQuote": 2993843.75528,
            //                         "volumeFee": 299.3601151291465,
            //                         "apr": 0,
            //                         "feeApr": 0,
            //                         "priceMin": 0.09599464144142572,
            //                         "priceMax": 0.09604456892948753,
            //                         "rewardApr": []
            //                     },
            //                     "pooltype": [
            //                         "Clmm"
            //                     ],
            //                     "farmUpcomingCount": 0,
            //                     "farmOngoingCount": 0,
            //                     "farmFinishedCount": 0,
            //                     "config": {
            //                         "id": "9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x",
            //                         "index": 4,
            //                         "protocolFeeRate": 120000,
            //                         "tradeFeeRate": 100,
            //                         "tickSpacing": 1,
            //                         "fundFeeRate": 40000,
            //                         "defaultRange": 0.001,
            //                         "defaultRangePoint": [
            //                             0.001,
            //                             0.003,
            //                             0.005,
            //                             0.008,
            //                             0.01
            //                         ]
            //                     },
            //                     "burnPercent": 0,
            //                     "launchMigratePool": false,
            //                     "tips": [],
            //                     "feeOn": "Both",
            //                     "hasDynamicFee": false
            //                 }
            //             ],
            //             "hasNextPage": true
            //         }
            //     }
            //
            const poolRows = this.extractRows (response);
            for (let i = 0; i < poolRows.length; i++) {
                rows.push (poolRows[i]);
            }
        }
        if ((kind === 'launchlab') || (kind === 'all')) {
            const request = this.extend ({ 'sort': 'new' }, query);
            const response = await this.launchMintPublicGetGetList (request);
            const launchRows = this.extractRows (response);
            for (let i = 0; i < launchRows.length; i++) {
                rows.push (launchRows[i]);
            }
        }
        const result: Market[] = [];
        const symbols: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parseMarket (rows[i]);
            if (parsed === undefined) {
                throw new ExchangeError (this.id + ' fetchMarkets() could not parse a pool market');
            }
            if (!this.safeBool (symbols, parsed['symbol'], false)) {
                result.push (parsed);
                symbols[parsed['symbol']] = true;
            }
        }
        const includeSwaps = (kind === 'all') || ((this.safeString (params, 'type') === undefined) && !this.isSandboxModeEnabled);
        if (includeSwaps) {
            const swapMarkets = await this.fetchSwapMarkets ();
            return this.arrayConcat (result, swapMarkets);
        }
        return result;
    }

    /**
     * @ignore
     * @param {object} market raw Raydium pool, LaunchLab mint, or swap market
     * @returns {object} a market structure
     */
    override parseMarket (market: Dict): Market {
        const marketId = this.safeString (market, 'symbol');
        if ((marketId !== undefined) && (marketId.indexOf ('PERP_') === 0) && (this.safeDict (market, 'mintA') === undefined) && (this.safeString (market, 'mint') === undefined)) {
            return this.parseSwapMarket (market);
        }
        //
        // standard pool
        //
        //     {
        //         "type": "Concentrated",
        //         "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        //         "id": "5mfjy2Ns9MWuVB6z3N1oFGJKSd6RyG2PAdyH2wDKDaMY",
        //         "mintA": {
        //             "chainId": 101,
        //             "address": "AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "https://img-v1.raydium.io/icon/AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P.png",
        //             "symbol": "CC",
        //             "name": "Canton Network",
        //             "decimals": 9,
        //             "tags": [],
        //             "extensions": {}
        //         },
        //         "mintB": {
        //             "chainId": 101,
        //             "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "https://img-v1.raydium.io/icon/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png",
        //             "symbol": "USDC",
        //             "name": "USD Coin",
        //             "decimals": 6,
        //             "tags": [
        //                 "hasFreeze"
        //             ],
        //             "extensions": {}
        //         },
        //         "rewardDefaultPoolInfos": "Clmm",
        //         "rewardDefaultInfos": [],
        //         "price": 0.09600783007339088,
        //         "mintAmountA": 998564854.1334,
        //         "mintAmountB": 42031.111974,
        //         "feeRate": 0.0001,
        //         "openTime": "0",
        //         "tvl": 95912075.94,
        //         "day": {
        //             "volume": 99903.88828908766,
        //             "volumeQuote": 99910.60633131946,
        //             "volumeFee": 9.9903888309347,
        //             "apr": 0,
        //             "feeApr": 0,
        //             "priceMin": 0.09599464144142572,
        //             "priceMax": 0.09602014342008008,
        //             "rewardApr": []
        //         },
        //         "week": {
        //             "volume": 1525372.0882718102,
        //             "volumeQuote": 1525506.8478766459,
        //             "volumeFee": 152.53721505297452,
        //             "apr": 0,
        //             "feeApr": 0,
        //             "priceMin": 0.09599464144142572,
        //             "priceMax": 0.09604456892948753,
        //             "rewardApr": []
        //         },
        //         "month": {
        //             "volume": 2993600.7475060793,
        //             "volumeQuote": 2993843.75528,
        //             "volumeFee": 299.3601151291465,
        //             "apr": 0,
        //             "feeApr": 0,
        //             "priceMin": 0.09599464144142572,
        //             "priceMax": 0.09604456892948753,
        //             "rewardApr": []
        //         },
        //         "pooltype": [
        //             "Clmm"
        //         ],
        //         "farmUpcomingCount": 0,
        //         "farmOngoingCount": 0,
        //         "farmFinishedCount": 0,
        //         "config": {
        //             "id": "9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x",
        //             "index": 4,
        //             "protocolFeeRate": 120000,
        //             "tradeFeeRate": 100,
        //             "tickSpacing": 1,
        //             "fundFeeRate": 40000,
        //             "defaultRange": 0.001,
        //             "defaultRangePoint": [
        //                 0.001,
        //                 0.003,
        //                 0.005,
        //                 0.008,
        //                 0.01
        //             ]
        //         },
        //         "burnPercent": 0,
        //         "launchMigratePool": false,
        //         "tips": [],
        //         "feeOn": "Both",
        //         "hasDynamicFee": false
        //     }
        //
        //
        // launchlab mint
        //
        //     {
        //         "mint": "FXEMLHc2CM35jN4yECsiN8T8WofskTbATEywjPKEYX2T",
        //         "poolId": "97MyiCJP4oCrCUcGWiRL2d6FF4CpheEuaudv2YAtTBfR",
        //         "configId": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //         "creator": "45YqzZVGe3Zb2AzxXtfpoyBMjDHufeuQNpMHk7tBuh8Z",
        //         "createAt": 1794623922000,
        //         "name": "Matchedpad",
        //         "symbol": "MATCHEDPAD",
        //         "description": "",
        //         "metadataUrl": "https://ipfs.io/ipfs/bafkreibk6escj5m6ell5attydjkqoykvrabinuqahpatp2he5vkkbxilb4",
        //         "platformInfo": {
        //             "pubKey": "D2ySdMncomHKRKBV4AAftqnLKxyS6HMWcmbewvNcawCg",
        //             "platformClaimFeeWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //             "platformLockNftWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //             "transferFeeExtensionAuth": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //             "cpConfigId": "FMmwToGqT9iwDgsqvzLg65vcKSzKme4szbWqX1kyCBCJ",
        //             "platformScale": "0",
        //             "creatorScale": "0",
        //             "burnScale": "1000000",
        //             "feeRate": "15000",
        //             "creatorFeeRate": "0",
        //             "name": "My Launch Platform",
        //             "web": "",
        //             "img": "",
        //             "platformVestingWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //             "platformVestingScale": "0",
        //             "platformCpCreator": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //             "restrictCurveParam": 0,
        //             "curveRuleManager": "11111111111111111111111111111111"
        //         },
        //         "configInfo": {
        //             "name": "Constant Product Curve",
        //             "pubKey": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //             "epoch": 961,
        //             "curveType": 0,
        //             "index": 0,
        //             "migrateFee": "0",
        //             "tradeFeeRate": "2500",
        //             "maxShareFeeRate": "10000",
        //             "minSupplyA": "10000000",
        //             "maxLockRate": "800000",
        //             "minSellRateA": "200000",
        //             "minMigrateRateA": "150000",
        //             "minFundRaisingB": "24000000000",
        //             "protocolFeeOwner": "rayvTLcCMDs7P5tgpuoNA6ZYeLERegeCphdqLSgdKms",
        //             "migrateFeeOwner": "rayHQtJKrtvqUs3HnhDW9RKubHRbu87eESKEYD5xosa",
        //             "migrateToAmmWallet": "RAYzrepoBdjSFg7MZj2vy4XBSv2azKRXC72ztUMZMJB",
        //             "migrateToCpmmWallet": "RAYpQbFNq9i3mu6cKpTKKRwwHFDeK5AuZz8xvxUrCgw",
        //             "mintB": "So11111111111111111111111111111111111111112"
        //         },
        //         "mintB": {
        //             "chainId": 101,
        //             "address": "So11111111111111111111111111111111111111112",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
        //             "symbol": "WSOL",
        //             "name": "Wrapped SOL",
        //             "decimals": 9,
        //             "tags": [],
        //             "extensions": {}
        //         },
        //         "decimals": 6,
        //         "supply": 1000000000,
        //         "marketCap": 27.959121193874665,
        //         "volumeA": 0,
        //         "volumeB": 0,
        //         "volumeU": 0,
        //         "finishingRate": 0,
        //         "initPrice": "2.7959121193874663768e-8",
        //         "endPrice": "4.1082648622522957951e-7",
        //         "totalLockedAmount": 0,
        //         "cliffPeriod": "0",
        //         "unlockPeriod": "0",
        //         "startTime": 0,
        //         "totalAllocatedShare": 0,
        //         "defaultCurve": true,
        //         "totalSellA": "793100000000000",
        //         "totalFundRaisingB": "85000000000",
        //         "migrateType": "cpmm",
        //         "mintProgramA": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //         "cpmmCreatorFeeOn": 0
        //     }
        //
        const mintA = this.safeDict (market, 'mintA');
        const mintB = this.safeDict (market, 'mintB');
        const baseId = this.safeString (mintA, 'address', this.safeString (market, 'mint'));
        let quoteId = this.safeString (mintB, 'address');
        const base = this.safeString (mintA, 'symbol', this.safeString (market, 'symbol', baseId));
        let quote = this.safeString (mintB, 'symbol', quoteId);
        if ((quoteId === undefined) && (mintB === undefined) && (this.safeString (market, 'mint') !== undefined)) {
            // LaunchLab mints carry no quote metadata; the bonding curve quotes in SOL by default
            quoteId = 'So11111111111111111111111111111111111111112';
            quote = 'SOL';
        }
        const id = this.safeString2 (market, 'id', 'poolId');
        if ((id === undefined) || (baseId === undefined) || (quoteId === undefined) || (base === undefined) || (quote === undefined)) {
            throw new ExchangeError (this.id + ' parseMarket() received a pool without an id and two mint addresses');
        }
        const feeRate = this.safeNumber (market, 'feeRate');
        return this.safeMarketStructure ({
            'info': market,
            'id': id,
            'symbol': base + '/' + quote,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': false,
            'swap': false,
            'future': false,
            'option': false,
            'active': true,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'maker': feeRate,
            'taker': feeRate,
            'precision': {
                'amount': this.safeInteger (mintA, 'decimals'),
                'price': undefined,
            },
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
        });
    }

    /**
     * @method
     * @name raydium#fetchCurrencies
     * @description fetches Raydium token metadata
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.mints] comma-separated mint addresses
     * @param {string} [params.query] token symbol, name, or mint address
     * @returns {object} a dictionary of [currency structures](https://docs.ccxt.com/#/?id=currency-structure) indexed by currency code
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        const mints = this.safeString2 (params, 'mints', 'ids');
        const query = this.safeString (params, 'query');
        let rows: Dict[] = [];
        if (mints !== undefined) {
            const response = await this.apiV3PublicGetMintIds ({ 'mints': mints });
            rows = this.extractRows (response);
        } else if (query !== undefined) {
            const listResponse = await this.apiV3PublicGetMintList ();
            const listRows = this.extractRows (listResponse);
            const normalizedQuery = query.toLowerCase ();
            for (let i = 0; i < listRows.length; i++) {
                const row = listRows[i];
                const symbol = this.safeString (row, 'symbol', '').toLowerCase ();
                const name = this.safeString (row, 'name', '').toLowerCase ();
                const address = this.safeString (row, 'address');
                if (symbol === normalizedQuery || name === normalizedQuery || address === query) {
                    rows.push (row);
                }
            }
            let rowsLength = rows.length;
            if (rowsLength === 0) {
                const searchResponse = await this.launchMintPublicGetGetSearch ({ 'text': query });
                rows = this.extractRows (searchResponse);
                rowsLength = rows.length;
            }
            if (rowsLength === 0 && query.length >= 32) {
                const response = await this.apiV3PublicGetMintIds ({ 'mints': query });
                rows = this.extractRows (response);
            }
        } else {
            const response = await this.apiV3PublicGetMintList ();
            rows = this.extractRows (response);
        }
        //
        //     {
        //         "id": "0d176cd0-ed73-432d-b8c3-d68480cc07e8",
        //         "success": true,
        //         "data": {
        //             "blacklist": [
        //                 "9jaZhJM6nMHTo4hY9DGabQ1HNuUWhJtm7js1fmKMVpkN"
        //             ],
        //             "mintList": [
        //                 {
        //                     "chainId": 101,
        //                     "address": "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        //                     "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                     "logoURI": "https://img-v1.raydium.io/icon/2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo.png",
        //                     "symbol": "PYUSD",
        //                     "name": "PayPal USD",
        //                     "decimals": 6,
        //                     "tags": [
        //                         "hasFreeze"
        //                     ],
        //                     "extensions": {}
        //                 },
        //                 {
        //                     "chainId": 101,
        //                     "address": "2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk.png",
        //                     "symbol": "ETH",
        //                     "name": "Wrapped Ethereum (Sollet)",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 }
        //             ],
        //             "whiteList": [
        //                 "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        //                 "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
        //             ]
        //         }
        //     }
        //
        const result: Currencies = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = this.parseCurrency (rows[i]);
            let code = currency['code'];
            if (result[code] !== undefined && result[code]['id'] !== currency['id']) {
                code = code + '-' + currency['id'].slice (-4);
                currency['code'] = code;
            }
            result[code] = currency;
        }
        return result;
    }

    /**
     * @ignore
     * @param {object} currency raw Raydium mint
     * @returns {object} a currency structure
     */
    override parseCurrency (currency: Dict): CurrencyInterface {
        //
        //     {
        //         "chainId": 101,
        //         "address": "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        //         "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //         "logoURI": "https://img-v1.raydium.io/icon/2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo.png",
        //         "symbol": "PYUSD",
        //         "name": "PayPal USD",
        //         "decimals": 6,
        //         "tags": [
        //             "hasFreeze"
        //         ],
        //         "extensions": {}
        //     }
        //
        const id = this.safeString2 (currency, 'address', 'mint');
        const decimals = this.safeInteger (currency, 'decimals');
        const code = this.safeString (currency, 'symbol', id);
        if ((id === undefined) || (decimals === undefined) || (code === undefined)) {
            throw new ExchangeError (this.id + ' parseCurrency() received a mint without an address, symbol, or decimals');
        }
        return {
            'info': currency,
            'id': id,
            'code': code,
            'name': this.safeString (currency, 'name'),
            'active': true,
            'type': 'token',
            'precision': decimals,
            'limits': {
                'amount': { 'min': undefined, 'max': undefined },
                'withdraw': { 'min': undefined, 'max': undefined },
            },
            'networks': {},
        };
    }

    /**
     * @method
     * @name raydium#fetchTicker
     * @description fetches the latest Raydium pool price and 24-hour statistics
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.poolId] pool id override
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        let poolId = this.safeString (params, 'poolId');
        if (poolId === undefined) {
            poolId = market['id'];
        }
        if (poolId === undefined) {
            throw new BadSymbol (this.id + ' fetchTicker() could not resolve a pool id for ' + symbol);
        }
        const response = await this.apiV3PublicGetPoolsInfoIds ({ 'ids': poolId });
        //
        //     {
        //         "id": "8b69caf9-ef4d-4fe6-a5b9-82b4faf12102",
        //         "success": true,
        //         "data": [
        //             {
        //                 "type": "Standard",
        //                 "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        //                 "id": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //                 "mintA": {
        //                     "chainId": 101,
        //                     "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                     "symbol": "RAY",
        //                     "name": "Raydium",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "mintB": {
        //                     "chainId": 101,
        //                     "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //                     "symbol": "USDT",
        //                     "name": "USDT",
        //                     "decimals": 6,
        //                     "tags": ["hasFreeze"],
        //                     "extensions": {}
        //                 },
        //                 "price": 1.4687567803748238,
        //                 "mintAmountA": 491197.370009,
        //                 "mintAmountB": 721449.467703,
        //                 "feeRate": 0.0025,
        //                 "openTime": "0",
        //                 "tvl": 1441676.38,
        //                 "day": {
        //                     "volume": 179185.2688778311,
        //                     "volumeQuote": 179705.92389330812,
        //                     "volumeFee": 447.96317219457796,
        //                     "apr": 11.34,
        //                     "feeApr": 11.34,
        //                     "priceMin": 1.46518572490142,
        //                     "priceMax": 1.6216216216216215,
        //                     "rewardApr": [0]
        //                 },
        //                 "week": {
        //                     "volume": 1043439.6989700783,
        //                     "volumeQuote": 1046648.571578637,
        //                     "volumeFee": 2608.5992474251957,
        //                     "apr": 5.43,
        //                     "feeApr": 5.43,
        //                     "priceMin": 1.46518572490142,
        //                     "priceMax": 1.82563774699872,
        //                     "rewardApr": [0]
        //                 },
        //                 "month": {
        //                     "volume": 4755965.05701011,
        //                     "volumeQuote": 4772645.131482,
        //                     "volumeFee": 11889.912642525274,
        //                     "apr": 9.9,
        //                     "feeApr": 9.9,
        //                     "priceMin": 1.3636363636363635,
        //                     "priceMax": 2.08662236438065,
        //                     "rewardApr": [0]
        //                 },
        //                 "pooltype": ["Amm","OpenBookMarket"],
        //                 "rewardDefaultPoolInfos": "Raydium",
        //                 "rewardDefaultInfos": [
        //                     {
        //                         "mint": {
        //                             "chainId": 101,
        //                             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                             "symbol": "RAY",
        //                             "name": "Raydium",
        //                             "decimals": 6,
        //                             "tags": [],
        //                             "extensions": {}
        //                         },
        //                         "perSecond": "0"
        //                     }
        //                 ],
        //                 "farmUpcomingCount": 0,
        //                 "farmOngoingCount": 0,
        //                 "farmFinishedCount": 3,
        //                 "marketId": "GpHbiJJ9VHiuHVXeoet121Utrbm1CSNNzYrBKB8Xz2oz",
        //                 "lpMint": {
        //                     "chainId": 101,
        //                     "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "",
        //                     "symbol": "RAY-USDT",
        //                     "name": "Raydium LP Token V4 (RAY-USDT)",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "lpPrice": 12.466561765706462,
        //                 "lpAmount": 115643.463401,
        //                 "burnPercent": 0,
        //                 "launchMigratePool": false,
        //                 "tips": [],
        //                 "feeOn": "Both",
        //                 "hasDynamicFee": false
        //             }
        //         ]
        //     }
        //
        const rows = this.extractRows (response);
        const rowsLength = rows.length;
        if (rowsLength === 0) {
            throw new BadSymbol (this.id + ' fetchTicker() could not find pool ' + poolId);
        }
        return this.parseTicker (rows[0], market);
    }

    /**
     * @ignore
     * @param {object} ticker raw Raydium pool statistics
     * @param {object} [market] market metadata
     * @returns {object} a ticker structure
     */
    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        //
        //     {
        //         "type": "Standard",
        //         "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        //         "id": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //         "mintA": {
        //             "chainId": 101,
        //             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //             "symbol": "RAY",
        //             "name": "Raydium",
        //             "decimals": 6,
        //             "tags": [],
        //             "extensions": {}
        //         },
        //         "mintB": {
        //             "chainId": 101,
        //             "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //             "symbol": "USDT",
        //             "name": "USDT",
        //             "decimals": 6,
        //             "tags": ["hasFreeze"],
        //             "extensions": {}
        //         },
        //         "price": 1.4687567803748238,
        //         "mintAmountA": 491197.370009,
        //         "mintAmountB": 721449.467703,
        //         "feeRate": 0.0025,
        //         "openTime": "0",
        //         "tvl": 1441676.38,
        //         "day": {
        //             "volume": 179185.2688778311,
        //             "volumeQuote": 179705.92389330812,
        //             "volumeFee": 447.96317219457796,
        //             "apr": 11.34,
        //             "feeApr": 11.34,
        //             "priceMin": 1.46518572490142,
        //             "priceMax": 1.6216216216216215,
        //             "rewardApr": [0]
        //         },
        //         "week": {
        //             "volume": 1043439.6989700783,
        //             "volumeQuote": 1046648.571578637,
        //             "volumeFee": 2608.5992474251957,
        //             "apr": 5.43,
        //             "feeApr": 5.43,
        //             "priceMin": 1.46518572490142,
        //             "priceMax": 1.82563774699872,
        //             "rewardApr": [0]
        //         },
        //         "month": {
        //             "volume": 4755965.05701011,
        //             "volumeQuote": 4772645.131482,
        //             "volumeFee": 11889.912642525274,
        //             "apr": 9.9,
        //             "feeApr": 9.9,
        //             "priceMin": 1.3636363636363635,
        //             "priceMax": 2.08662236438065,
        //             "rewardApr": [0]
        //         },
        //         "pooltype": ["Amm","OpenBookMarket"],
        //         "rewardDefaultPoolInfos": "Raydium",
        //          "rewardDefaultInfos": [
        //             {
        //                 "mint": {
        //                     "chainId": 101,
        //                     "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                     "symbol": "RAY",
        //                     "name": "Raydium",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "perSecond": "0"
        //             }
        //         ],
        //         "farmUpcomingCount": 0,
        //         "farmOngoingCount": 0,
        //         "farmFinishedCount": 3,
        //         "marketId": "GpHbiJJ9VHiuHVXeoet121Utrbm1CSNNzYrBKB8Xz2oz",
        //         "lpMint": {
        //             "chainId": 101,
        //             "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //             "logoURI": "",
        //             "symbol": "RAY-USDT",
        //             "name": "Raydium LP Token V4 (RAY-USDT)",
        //             "decimals": 6,
        //             "tags": [],
        //             "extensions": {}
        //         },
        //         "lpPrice": 12.466561765706462,
        //         "lpAmount": 115643.463401,
        //         "burnPercent": 0,
        //         "launchMigratePool": false,
        //         "tips": [],
        //         "feeOn": "Both",
        //         "hasDynamicFee": false
        //     }
        //
        const day = this.safeDict (ticker, 'day');
        return this.safeTicker ({
            'info': ticker,
            'symbol': (market === undefined) ? undefined : market['symbol'],
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (day, 'priceMax'),
            'low': this.safeString (day, 'priceMin'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'last': this.safeString (ticker, 'price'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (day, 'volume'),
            'quoteVolume': this.safeString (day, 'volumeQuote'),
        });
    }

    /**
     * @method
     * @name raydium#fetchTickers
     * @description fetches tickers for Raydium liquidity pools
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by market symbol
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const symbolsNormalized = this.marketSymbols (symbols);
        let response: any;
        if (symbolsNormalized !== undefined) {
            const ids: string[] = [];
            for (let i = 0; i < symbolsNormalized.length; i++) {
                const marketId = this.market (symbolsNormalized[i])['id'];
                if (marketId === undefined) {
                    throw new BadSymbol (this.id + ' fetchTickers() could not resolve a pool id for ' + symbolsNormalized[i]);
                }
                ids.push (marketId);
            }
            response = await this.apiV3PublicGetPoolsInfoIds ({ 'ids': ids.join (',') });
        } else {
            const request = this.extend ({
                'poolType': 'all',
                'poolSortField': 'volume24h',
                'sortType': 'desc',
                'page': 1,
                'pageSize': 1000,
            }, params);
            response = await this.apiV3PublicGetPoolsInfoList (request);
        }
        //
        //     {
        //         "id": "4439dbf6-7e85-4cc6-b365-6b87098d73ca",
        //         "success": true,
        //         "data": [
        //             {
        //                 "type": "Standard",
        //                 "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        //                 "id": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //                 "mintA": {
        //                     "chainId": 101,
        //                     "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                     "symbol": "RAY",
        //                     "name": "Raydium",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "mintB": {
        //                     "chainId": 101,
        //                     "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //                     "symbol": "USDT",
        //                     "name": "USDT",
        //                     "decimals": 6,
        //                     "tags": [
        //                         "hasFreeze"
        //                     ],
        //                     "extensions": {}
        //                 },
        //                 "price": 1.450963684541678,
        //                 "mintAmountA": 494211.140111,
        //                 "mintAmountB": 717082.416797,
        //                 "feeRate": 0.0025,
        //                 "openTime": "0",
        //                 "tvl": 1432999.98,
        //                 "day": {
        //                     "volume": 185925.5816689012,
        //                     "volumeQuote": 186445.17487497246,
        //                     "volumeFee": 464.81395417225315,
        //                     "apr": 11.84,
        //                     "feeApr": 11.84,
        //                     "priceMin": 1.4368946666666669,
        //                     "priceMax": 1.6216216216216215,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "week": {
        //                     "volume": 1053510.9410816028,
        //                     "volumeQuote": 1056727.5172064616,
        //                     "volumeFee": 2633.777352704008,
        //                     "apr": 5.51,
        //                     "feeApr": 5.51,
        //                     "priceMin": 1.4368946666666669,
        //                     "priceMax": 1.82563774699872,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "month": {
        //                     "volume": 4769309.830042222,
        //                     "volumeQuote": 4786008.320176001,
        //                     "volumeFee": 11923.274575105555,
        //                     "apr": 9.98,
        //                     "feeApr": 9.98,
        //                     "priceMin": 1.3636363636363635,
        //                     "priceMax": 2.08662236438065,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "pooltype": [
        //                     "Amm",
        //                     "OpenBookMarket"
        //                 ],
        //                 "rewardDefaultPoolInfos": "Raydium",
        //                 "rewardDefaultInfos": [
        //                     {
        //                         "mint": {
        //                             "chainId": 101,
        //                             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                             "symbol": "RAY",
        //                             "name": "Raydium",
        //                             "decimals": 6,
        //                             "tags": [],
        //                             "extensions": {}
        //                         },
        //                         "perSecond": "0"
        //                     }
        //                 ],
        //                 "farmUpcomingCount": 0,
        //                 "farmOngoingCount": 0,
        //                 "farmFinishedCount": 3,
        //                 "marketId": "GpHbiJJ9VHiuHVXeoet121Utrbm1CSNNzYrBKB8Xz2oz",
        //                 "lpMint": {
        //                     "chainId": 101,
        //                     "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "",
        //                     "symbol": "RAY-USDT",
        //                     "name": "Raydium LP Token V4 (RAY-USDT)",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "lpPrice": 12.391534616288956,
        //                 "lpAmount": 115643.463401,
        //                 "burnPercent": 0,
        //                 "launchMigratePool": false,
        //                 "tips": [],
        //                 "feeOn": "Both",
        //                 "hasDynamicFee": false
        //             }
        //         ]
        //     }
        //
        const rows = this.extractRows (response);
        const result: Ticker[] = [];
        for (let i = 0; i < rows.length; i++) {
            const parsedMarket = this.parseMarket (rows[i]);
            if (parsedMarket === undefined) {
                throw new ExchangeError (this.id + ' fetchTickers() could not parse a pool market');
            }
            result.push (this.parseTicker (rows[i], parsedMarket));
        }
        return this.filterByArrayTickers (result, 'symbol', symbolsNormalized);
    }

    /**
     * @method
     * @name raydium#fetchTrades
     * @description fetches recent LaunchLab trades for a pool
     * @see https://docs.raydium.io/api-reference/launch-history-v1/overview.md
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest entry to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.poolId] LaunchLab pool id override
     * @param {string} [params.nextPageKey] opaque cursor for the next page
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const poolId = this.safeString (params, 'poolId', market['id']);
        const request = this.omit (params, [ 'poolId' ]);
        request['poolId'] = poolId;
        let defaultLimit = limit;
        if (defaultLimit === undefined) {
            defaultLimit = 50;
        }
        request['limit'] = this.safeInteger (request, 'limit', defaultLimit);
        const response = await this.launchHistoryPublicGetTrade (request);
        //
        //     {
        //         "id": "37ccc001-79da-4403-95d8-35405783b20f",
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "txid": "5zDBbbVRJBpU6tuEh1oXfXaiJ9qY8sTKaNZvHBgymz6No2KMSzkTM4F4e47w2hGiRTbArJy7GF3gwwvKxdae1GoA",
        //                     "owner": "7JHsyXRNpN93TGkjzwQgsaCag9tXhwkAKTZmxdcAYx69",
        //                     "blockTime": 1794622861,
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "side": "sell",
        //                     "amountA": 31339.844768,
        //                     "amountB": 0.00081792
        //                 },
        //                 {
        //                     "txid": "2DGSJX4tg2PaTHGWEUefRgJtFA7Ev3ncNdPwwfJTqiDhg2tkMcxi9Wt8NLrSPoNGm3V547AZqano5GVU7S1jVMJX",
        //                     "owner": "6db9d9LnCeKzSaEWYzBJJ88PBrXuuhA6n9NbqcU4tNta",
        //                     "blockTime": 1794622856,
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "side": "sell",
        //                     "amountA": 4903635.079408,
        //                     "amountB": 0.128571985
        //                 }
        //             ],
        //             "nextPageKey": "84a7b9ef7440bb4a6db4d73f79a688001f9a3ff9e3dc31c265926bf5220080c1"
        //         }
        //     }
        //
        const rows = this.extractRows (response);
        const result: Trade[] = [];
        for (let i = 0; i < rows.length; i++) {
            const trade = this.parseTrade (rows[i], market);
            if ((since === undefined) || (trade['timestamp'] === undefined) || (trade['timestamp'] >= since)) {
                result.push (trade);
            }
        }
        return result;
    }

    /**
     * @method
     * @name raydium#fetchMyTrades
     * @description fetches LaunchLab trades for a wallet in a pool
     * @see https://docs.raydium.io/api-reference/launch-history-v1/overview.md
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest entry to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} params.walletAddress wallet public key whose trades are returned
     * @param {string} [params.poolId] LaunchLab pool id override
     * @param {string} [params.nextPageKey] opaque cursor for the next page
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure) for the wallet
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        const owner = this.safeString2 (params, 'walletAddress', 'owner');
        if (owner === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires params.walletAddress');
        }
        if (symbol === undefined && this.safeString (params, 'poolId') === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol or params.poolId');
        }
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        let defaultPoolId = undefined;
        if (market !== undefined) {
            defaultPoolId = market['id'];
        }
        const poolId = this.safeString (params, 'poolId', defaultPoolId);
        const request = this.omit (params, [ 'walletAddress', 'owner', 'poolId' ]);
        request['poolId'] = poolId;
        request['owner'] = owner;
        let defaultLimit = limit;
        if (defaultLimit === undefined) {
            defaultLimit = 50;
        }
        request['limit'] = this.safeInteger (request, 'limit', defaultLimit);
        const response = await this.launchHistoryPublicGetTrade (request);
        //
        //     {
        //         "id": "a7f46fa7-0467-46db-bc0f-a1b55f5adc30",
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "txid": "5MHtJ6fzjssCXfc6vgKifakegVPDRbTZt6SS17nMTAD7J7FgJBtWmS1L6B8e2zPwLYDZejqADfVENDc51hp9N98r",
        //                     "owner": "9W9mRpvdMCuZ1FTpKVsGAEjMdvqn5N6NDEaYJ1pz2fs5",
        //                     "blockTime": 1794622670,
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "side": "sell",
        //                     "amountA": 35748600.017462,
        //                     "amountB": 0.974457737
        //                 }
        //             ],
        //             "nextPageKey": "84a7b9ef7440bb4a6db4d73f79a688001f9a3ff9e3dc31c265926bf5220080c1"
        //         }
        //     }
        //
        const rows = this.extractRows (response);
        const result: Trade[] = [];
        for (let i = 0; i < rows.length; i++) {
            const trade = this.parseTrade (rows[i], market);
            if ((since === undefined) || (trade['timestamp'] === undefined) || (trade['timestamp'] >= since)) {
                result.push (trade);
            }
        }
        return result;
    }

    /**
     * @ignore
     * @param {object} trade raw LaunchLab trade
     * @param {object} [market] market metadata
     * @returns {object} a trade structure
     */
    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "txid": "5zDBbbVRJBpU6tuEh1oXfXaiJ9qY8sTKaNZvHBgymz6No2KMSzkTM4F4e47w2hGiRTbArJy7GF3gwwvKxdae1GoA",
        //         "owner": "7JHsyXRNpN93TGkjzwQgsaCag9tXhwkAKTZmxdcAYx69",
        //         "blockTime": 1794622861,
        //         "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //         "side": "sell",
        //         "amountA": 31339.844768,
        //         "amountB": 0.00081792
        //     }
        //
        const baseAmount = this.safeString (trade, 'amountA');
        const quoteAmount = this.safeString (trade, 'amountB');
        const price = (baseAmount === undefined || quoteAmount === undefined) ? undefined : Precise.stringDiv (quoteAmount, baseAmount);
        const blockTime = this.safeInteger (trade, 'blockTime');
        const timestamp = (blockTime === undefined) ? undefined : blockTime * 1000;
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'txid'),
            'timestamp': timestamp,
            'datetime': (timestamp === undefined) ? undefined : this.iso8601 (timestamp),
            'symbol': (market === undefined) ? undefined : market['symbol'],
            'order': undefined,
            'type': 'market',
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': 'taker',
            'price': price,
            'amount': baseAmount,
            'cost': quoteAmount,
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name raydium#fetchOHLCV
     * @description fetches LaunchLab pool candles at 1m, 5m, and 15m intervals
     * @see https://docs.raydium.io/api-reference/launch-history-v1/overview.md
     * @param {string} symbol unified market symbol
     * @param {string} [timeframe] 1m, 5m, or 15m
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.poolId] LaunchLab pool id override
     * @param {string} [params.nextPageKey] opaque cursor for the next page
     * @returns {object[][]} a list of [OHLCV structures](https://docs.ccxt.com/#/?id=ohlcv-structure)
     */
    override async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        if ((timeframe !== '1m') && (timeframe !== '5m') && (timeframe !== '15m')) {
            throw new BadRequest (this.id + ' fetchOHLCV() timeframe must be 1m, 5m, or 15m');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const poolId = this.safeString (params, 'poolId', market['id']);
        const request = this.omit (params, [ 'poolId' ]);
        request['poolId'] = poolId;
        request['interval'] = timeframe;
        let defaultLimit = limit;
        if (defaultLimit === undefined) {
            defaultLimit = 300;
        }
        request['limit'] = this.safeInteger (request, 'limit', defaultLimit);
        const response = await this.launchHistoryPublicGetKline (request);
        //
        //     {
        //         "id": "343191b3-fff5-4410-91e7-ba05d6a1539e",
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "t": 1794622860,
        //                     "o": 2.656406097707573e-8,
        //                     "c": 2.6562500037187516e-8,
        //                     "h": 2.6562500037187516e-8,
        //                     "l": 2.6562500037187516e-8
        //                 },
        //                 {
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "t": 1794622800,
        //                     "o": 2.681000120405546e-8,
        //                     "c": 2.656406097707573e-8,
        //                     "h": 2.656406097707573e-8,
        //                     "l": 2.656406097707573e-8
        //                 },
        //                 {
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "t": 1794622620,
        //                     "o": 4.756015102242319e-8,
        //                     "c": 2.681000120405546e-8,
        //                     "h": 1.9158647408067833e-7,
        //                     "l": 2.681000120405546e-8
        //                 },
        //                 {
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "t": 1794622560,
        //                     "o": 2.6562499999687518e-8,
        //                     "c": 4.756015102242319e-8,
        //                     "h": 4.763413045641281e-8,
        //                     "l": 2.6562499999687518e-8
        //                 }
        //             ]
        //         }
        //     }
        //
        const rows = this.extractRows (response);
        const result: OHLCV[] = [];
        for (let i = 0; i < rows.length; i++) {
            const candle = rows[i];
            const timestamp = this.safeInteger (candle, 't');
            if (timestamp === undefined) {
                throw new ExchangeError (this.id + ' fetchOHLCV() response is missing candle time');
            }
            const candleTimestamp = timestamp * 1000;
            if ((since === undefined) || (candleTimestamp >= since)) {
                result.push ([
                    candleTimestamp,
                    this.safeNumber (candle, 'o'),
                    this.safeNumber (candle, 'h'),
                    this.safeNumber (candle, 'l'),
                    this.safeNumber (candle, 'c'),
                    undefined,
                ]);
            }
        }
        return this.sortBy (result, 0);
    }

    /**
     * @method
     * @name raydium#fetchLiquidityPools
     * @description fetches Raydium pools, staking pools, or farms
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] pool (default), stake, or farm
     * @param {string} [params.lp] LP mint required for farm lookup
     * @returns {object[]} common liquidity pool structures with Raydium fields retained in info
     */
    override async fetchLiquidityPools (params: Dict = {}): Promise<Dict[]> {
        const kind = this.safeString (params, 'type', 'pool');
        const request = this.omit (params, [ 'type' ]);
        let response: any;
        if (kind === 'pool') {
            response = await this.apiV3PublicGetPoolsInfoList (this.extend ({
                'poolType': 'all',
                'poolSortField': 'liquidity',
                'sortType': 'desc',
                'page': 1,
                'pageSize': 100,
            }, request));
        } else if (kind === 'stake') {
            response = await this.apiV3PublicGetMainStakePools (request);
        } else if (kind === 'farm') {
            if (this.safeString (request, 'lp') === undefined) {
                throw new ArgumentsRequired (this.id + ' fetchLiquidityPools() farm lookup requires params.lp');
            }
            response = await this.apiV3PublicGetFarmsInfoLp (this.extend ({
                'page': 1,
                'pageSize': 100,
            }, request));
        } else {
            throw new BadRequest (this.id + ' fetchLiquidityPools() params.type must be pool, stake, or farm');
        }
        //
        // pool
        //
        //     {
        //         "id": "82776de5-f861-4334-b4bb-dcb7649d4d78",
        //         "success": true,
        //         "data": {
        //             "count": 100,
        //             "data": [
        //                 {
        //                     "type": "Concentrated",
        //                     "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        //                     "id": "5mfjy2Ns9MWuVB6z3N1oFGJKSd6RyG2PAdyH2wDKDaMY",
        //                     "mintA": {
        //                         "chainId": 101,
        //                         "address": "AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/AHyKLHgodnahePddu4eQysxFuz2JkDVdpXqMu9x6Yw1P.png",
        //                         "symbol": "CC",
        //                         "name": "Canton Network",
        //                         "decimals": 9,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "mintB": {
        //                         "chainId": 101,
        //                         "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png",
        //                         "symbol": "USDC",
        //                         "name": "USD Coin",
        //                         "decimals": 6,
        //                         "tags": [
        //                             "hasFreeze"
        //                         ],
        //                         "extensions": {}
        //                     },
        //                     "rewardDefaultPoolInfos": "Clmm",
        //                     "rewardDefaultInfos": [],
        //                     "price": 0.09600783079117599,
        //                     "mintAmountA": 998564812.4672697,
        //                     "mintAmountB": 42031.111974,
        //                     "feeRate": 0.0001,
        //                     "openTime": "0",
        //                     "tvl": 95912072.66,
        //                     "day": {
        //                         "volume": 63945.66355313155,
        //                         "volumeQuote": 63949.902207249645,
        //                         "volumeFee": 6.394566357461586,
        //                         "apr": 0,
        //                         "feeApr": 0,
        //                         "priceMin": 0.09599464214607106,
        //                         "priceMax": 0.09602014342008008,
        //                         "rewardApr": []
        //                     },
        //                     "week": {
        //                         "volume": 1500282.3720352955,
        //                         "volumeQuote": 1500415.7152473056,
        //                         "volumeFee": 150.02824345772592,
        //                         "apr": 0,
        //                         "feeApr": 0,
        //                         "priceMin": 0.09599464214607106,
        //                         "priceMax": 0.09604456892948753,
        //                         "rewardApr": []
        //                     },
        //                     "month": {
        //                         "volume": 2953603.4949884037,
        //                         "volumeQuote": 2953843.75528,
        //                         "volumeFee": 295.36038987736754,
        //                         "apr": 0,
        //                         "feeApr": 0,
        //                         "priceMin": 0.09599464214607106,
        //                         "priceMax": 0.09604456892948753,
        //                         "rewardApr": []
        //                     },
        //                     "pooltype": [
        //                         "Clmm"
        //                     ],
        //                     "farmUpcomingCount": 0,
        //                     "farmOngoingCount": 0,
        //                     "farmFinishedCount": 0,
        //                     "config": {
        //                         "id": "9iFER3bpjf1PTTCQCfTRu17EJgvsxo9pVyA9QWwEuX4x",
        //                         "index": 4,
        //                         "protocolFeeRate": 120000,
        //                         "tradeFeeRate": 100,
        //                         "tickSpacing": 1,
        //                         "fundFeeRate": 40000,
        //                         "defaultRange": 0.001,
        //                         "defaultRangePoint": [
        //                             0.001,
        //                             0.003,
        //                             0.005,
        //                             0.008,
        //                             0.01
        //                         ]
        //                     },
        //                     "burnPercent": 0,
        //                     "launchMigratePool": false,
        //                     "tips": [],
        //                     "feeOn": "Both",
        //                     "hasDynamicFee": false
        //                 }
        //             ],
        //             "hasNextPage": true
        //         }
        //     }
        //
        //
        // stake
        //
        //     {
        //         "id": "a1bcb9b8-8689-4b5d-ae2f-81508ecc67f7",
        //         "success": true,
        //         "data": {
        //             "count": 1,
        //             "data": [
        //                 {
        //                     "programId": "EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q",
        //                     "id": "4EwbZo8BZXP5313z5A2H11MRBP15M5n6YxfmkjXESKAW",
        //                     "symbolMints": [
        //                         {
        //                             "chainId": 101,
        //                             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                             "symbol": "RAY",
        //                             "name": "Raydium",
        //                             "decimals": 6,
        //                             "tags": [],
        //                             "extensions": {}
        //                         }
        //                     ],
        //                     "lpMint": {
        //                         "chainId": 101,
        //                         "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                         "symbol": "RAY",
        //                         "name": "Raydium",
        //                         "decimals": 6,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "tvl": 65353889.85708877,
        //                     "lpPrice": 1.451041171185985,
        //                     "apr": 0.0367,
        //                     "tags": [
        //                         "Stake"
        //                     ],
        //                     "rewardInfos": [
        //                         {
        //                             "mint": {
        //                                 "chainId": 101,
        //                                 "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                                 "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                                 "symbol": "RAY",
        //                                 "name": "Raydium",
        //                                 "decimals": 6,
        //                                 "tags": [],
        //                                 "extensions": {}
        //                             },
        //                             "type": "Standard SPL",
        //                             "apr": 0.0367,
        //                             "perSecond": "28200"
        //                         }
        //                     ]
        //                 }
        //             ],
        //             "hasNextPage": false
        //         }
        //     }
        //
        //
        // farm
        //
        //     {
        //         "id": "520cfb5e-4d29-44d4-8e82-55a8c88a44c7",
        //         "success": true,
        //         "data": {
        //             "count": 4,
        //             "data": [
        //                 {
        //                     "programId": "EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q",
        //                     "id": "3H1fDSeDgwoomw9xTrV3GRwhwpiwvh3K2AEpsah9eWuu",
        //                     "symbolMints": [
        //                         {
        //                             "chainId": 101,
        //                             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                             "symbol": "RAY",
        //                             "name": "Raydium",
        //                             "decimals": 6,
        //                             "tags": [],
        //                             "extensions": {}
        //                         },
        //                         {
        //                             "chainId": 101,
        //                             "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //                             "symbol": "USDT",
        //                             "name": "USDT",
        //                             "decimals": 6,
        //                             "tags": [
        //                                 "hasFreeze"
        //                             ],
        //                             "extensions": {}
        //                         }
        //                     ],
        //                     "lpMint": {
        //                         "chainId": 101,
        //                         "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "",
        //                         "symbol": "RAY-USDT",
        //                         "name": "Raydium LP Token V4 (RAY-USDT)",
        //                         "decimals": 6,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "tvl": 0,
        //                     "lpPrice": 12.397212985055257,
        //                     "apr": 0,
        //                     "tags": [],
        //                     "rewardInfos": [
        //                         {
        //                             "mint": {
        //                                 "chainId": 101,
        //                                 "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                                 "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                                 "symbol": "RAY",
        //                                 "name": "Raydium",
        //                                 "decimals": 6,
        //                                 "tags": [],
        //                                 "extensions": {}
        //                             },
        //                             "type": "Standard SPL",
        //                             "apr": 0,
        //                             "perSecond": "3"
        //                         }
        //                     ]
        //                 }
        //             ],
        //             "hasNextPage": false
        //         }
        //     }
        //
        const rows = this.extractRows (response);
        const result: Dict[] = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const mintA = this.safeDict (row, 'mintA');
            const mintB = this.safeDict (row, 'mintB');
            const poolId = this.safeString2 (row, 'id', 'poolId');
            const baseCurrency = this.safeString (mintA, 'address', this.safeString (row, 'mint'));
            const quoteCurrency = this.safeString (mintB, 'address');
            const lpMint = this.safeDict (row, 'lpMint');
            const mintASymbol = this.safeString (mintA, 'symbol');
            const mintBSymbol = this.safeString (mintB, 'symbol');
            let symbol = this.safeString (row, 'symbol');
            if ((mintASymbol !== undefined) && (mintBSymbol !== undefined)) {
                symbol = mintASymbol + '/' + mintBSymbol;
            }
            const normalized: Dict = {
                'id': poolId,
                'poolId': poolId,
                'type': kind,
                'baseCurrency': baseCurrency,
                'quoteCurrency': quoteCurrency,
                'lpCurrency': this.safeString (lpMint, 'address'),
                'symbol': symbol,
                'name': this.safeString (row, 'name'),
                'totalLiquidity': this.safeNumber (row, 'totalLiquidity'),
                'totalLiquidityValue': this.safeNumber (row, 'tvl'),
                'volume24h': this.safeNumber2 (this.safeDict (row, 'day'), 'volume', 'volume24h'),
                'apr': this.safeNumber (row, 'apr'),
                'feeRate': this.safeNumber (row, 'feeRate'),
                'info': row,
            };
            result.push (this.parseLiquidityPool (normalized));
        }
        return result;
    }

    /**
     * @method
     * @name raydium#fetchLiquidity
     * @description fetches wallet staking or locked CLMM liquidity positions
     * @see https://docs.raydium.io/api-reference/owner-api-v1/overview.md
     * @param {string} [poolId] optional pool id filter
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} params.walletAddress wallet public key
     * @param {string} [params.type] stake (default) or clmm-lock
     * @returns {object[]} common liquidity position structures with Raydium data retained in info
     */
    override async fetchLiquidity (poolId: Str = undefined, params: Dict = {}): Promise<Dict[]> {
        const walletAddress = this.safeString (params, 'walletAddress');
        if (walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchLiquidity() requires params.walletAddress');
        }
        const kind = this.safeString (params, 'type', 'stake');
        let response: any;
        if (kind === 'stake') {
            response = await this.ownerPublicGetPositionStakeOwner (this.extend ({ 'owner': walletAddress }, this.omit (params, [ 'walletAddress', 'type' ])));
        } else if (kind === 'clmm-lock') {
            response = await this.ownerPublicGetPositionClmmLockOwner (this.extend ({ 'owner': walletAddress }, this.omit (params, [ 'walletAddress', 'type' ])));
        } else {
            throw new BadRequest (this.id + ' fetchLiquidity() params.type must be stake or clmm-lock');
        }
        if (this.safeBool (response, 'success') === false) {
            return [];
        }
        //
        // stake with no positions
        //
        //     {
        //         "id": "5e987f81c8e342e6967f066a41d79cbd",
        //         "success": false
        //     }
        //
        //
        // clmm-lock
        //
        //     {
        //         "id": "2bcf07d7-4728-418b-a039-8dead03da7eb",
        //         "success": true,
        //         "data": {
        //             "AHuAAekwu2DrdagqStUffr6XyRGxLT11g18cGKwvTvpP": {
        //                 "3GpRo9xH1sfmao5F4zFVyC5vJmmx1KCyZgRtaqrsQNuU": {
        //                     "lockId": "11dGkgPJDUPNfBRUdKXyf21xCzfRQy6WxTBKGigjAL1",
        //                     "nftAccount": "BxtNeXHhTAA5wgv5hjzv3mDqrY6KjmzFk8Wb88cgRVfk",
        //                     "positionId": "A3Ay878B9NceEPMuB3yaBJRauBnazErXB3PrcBdn7jAb"
        //                 },
        //                 "93Ksj69p6A6maAN6aStSVXjhNGNLwYNdoVcdG3B49RDZ": {
        //                     "lockId": "2Et3C6rQcG8T6RNkeK2fd1j4R4MyYy3DwMXABXPCJmdM",
        //                     "nftAccount": "FBdqypwuGdnsw5UbsGFUZZwsnxa77Kx3xW1inqrf6Xgt",
        //                     "positionId": "DiBMGGmGzjWzSJjQ3AWSwNwTbYXgjKV8cC2FLPVZRCMi"
        //                 }
        //             }
        //         }
        //     }
        //
        const result: Dict[] = [];
        if (kind === 'clmm-lock') {
            const data = this.safeDict (response, 'data', {});
            const dataPoolIds = Object.keys (data);
            for (let i = 0; i < dataPoolIds.length; i++) {
                const dataPoolId = dataPoolIds[i];
                if ((poolId !== undefined) && (dataPoolId !== poolId)) {
                    continue;
                }
                const positions = this.safeDict (data, dataPoolId, {});
                const nftMints = Object.keys (positions);
                for (let j = 0; j < nftMints.length; j++) {
                    const row = this.safeDict (positions, nftMints[j], {});
                    const normalized: Dict = {
                        'id': this.safeString (row, 'positionId', this.safeString (row, 'lockId')),
                        'poolId': dataPoolId,
                        'owner': walletAddress,
                        'type': kind,
                        'currency': nftMints[j],
                        'amount': undefined,
                        'info': row,
                    };
                    result.push (this.parseLiquidity (normalized));
                }
            }
            return result;
        }
        const rows = this.extractRows (response);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const nestedPool = this.safeDict (row, 'pool');
            const positionPoolId = this.safeString (row, 'poolId', this.safeString (nestedPool, 'id'));
            if (poolId === undefined || positionPoolId === poolId) {
                const normalized: Dict = {
                    'id': this.safeString (row, 'id', this.safeString (row, 'positionId', this.safeString (row, 'nftMint'))),
                    'poolId': positionPoolId,
                    'owner': this.safeString (row, 'owner', this.safeString (row, 'ownerAddress', walletAddress)),
                    'type': kind,
                    'currency': this.safeString (row, 'currency', this.safeString (row, 'mint')),
                    'amount': this.safeNumber2 (row, 'amount', 'depositAmount'),
                    'info': row,
                };
                result.push (this.parseLiquidity (normalized));
            }
        }
        return result;
    }

    /**
     * @method
     * @name raydium#fetchStake
     * @description fetches a wallet's Raydium staking positions
     * @see https://docs.raydium.io/api-reference/owner-api-v1/overview.md
     * @param {string} [code] unused by Raydium
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} params.walletAddress wallet public key
     * @returns {object[]} common liquidity position structures with Raydium data retained in info
     */
    override async fetchStake (code: Str = undefined, params: Dict = {}): Promise<Dict[]> {
        const walletAddress = this.safeString (params, 'walletAddress');
        if (walletAddress === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchStake() requires params.walletAddress');
        }
        //
        //     {
        //         "id": "e4afe2dab8dd401fb56a648ebd1d39ff",
        //         "success": false
        //     }
        //
        return await this.fetchLiquidity (undefined, this.extend (params, { 'walletAddress': walletAddress, 'type': 'stake' }));
    }

    /**
     * @method
     * @name raydium#fetchPoolMintAddresses
     * @description fetches the token mint addresses associated with a Raydium pool
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {string} id Raydium pool id
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} pool mint addresses and token metadata
     */
    override async fetchPoolMintAddresses (id: string, params: Dict = {}): Promise<Dict> {
        const response = await this.apiV3PublicGetPoolsInfoIds (this.extend ({ 'ids': id }, params));
        //
        //     {
        //         "id": "e66183f8-f8bd-49f3-88f4-662b9863b609",
        //         "success": true,
        //         "data": [
        //             {
        //                 "type": "Standard",
        //                 "programId": "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
        //                 "id": "DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut",
        //                 "mintA": {
        //                     "chainId": 101,
        //                     "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                     "symbol": "RAY",
        //                     "name": "Raydium",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "mintB": {
        //                     "chainId": 101,
        //                     "address": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png",
        //                     "symbol": "USDT",
        //                     "name": "USDT",
        //                     "decimals": 6,
        //                     "tags": [
        //                         "hasFreeze"
        //                     ],
        //                     "extensions": {}
        //                 },
        //                 "price": 1.450963684541678,
        //                 "mintAmountA": 494211.140111,
        //                 "mintAmountB": 717082.416797,
        //                 "feeRate": 0.0025,
        //                 "openTime": "0",
        //                 "tvl": 1432999.98,
        //                 "day": {
        //                     "volume": 186092.7007745733,
        //                     "volumeQuote": 186612.78683811732,
        //                     "volumeFee": 465.2317519364334,
        //                     "apr": 11.85,
        //                     "feeApr": 11.85,
        //                     "priceMin": 1.4368946666666669,
        //                     "priceMax": 1.6216216216216215,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "week": {
        //                     "volume": 1053593.774430563,
        //                     "volumeQuote": 1056810.6216153002,
        //                     "volumeFee": 2633.9844360764077,
        //                     "apr": 5.51,
        //                     "feeApr": 5.51,
        //                     "priceMin": 1.4368946666666669,
        //                     "priceMax": 1.82563774699872,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "month": {
        //                     "volume": 4769309.830042222,
        //                     "volumeQuote": 4786008.320176001,
        //                     "volumeFee": 11923.274575105555,
        //                     "apr": 9.98,
        //                     "feeApr": 9.98,
        //                     "priceMin": 1.3636363636363635,
        //                     "priceMax": 2.08662236438065,
        //                     "rewardApr": [
        //                         0
        //                     ]
        //                 },
        //                 "pooltype": [
        //                     "Amm",
        //                     "OpenBookMarket"
        //                 ],
        //                 "rewardDefaultPoolInfos": "Raydium",
        //                 "rewardDefaultInfos": [
        //                     {
        //                         "mint": {
        //                             "chainId": 101,
        //                             "address": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png",
        //                             "symbol": "RAY",
        //                             "name": "Raydium",
        //                             "decimals": 6,
        //                             "tags": [],
        //                             "extensions": {}
        //                         },
        //                         "perSecond": "0"
        //                     }
        //                 ],
        //                 "farmUpcomingCount": 0,
        //                 "farmOngoingCount": 0,
        //                 "farmFinishedCount": 3,
        //                 "marketId": "GpHbiJJ9VHiuHVXeoet121Utrbm1CSNNzYrBKB8Xz2oz",
        //                 "lpMint": {
        //                     "chainId": 101,
        //                     "address": "C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "",
        //                     "symbol": "RAY-USDT",
        //                     "name": "Raydium LP Token V4 (RAY-USDT)",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "lpPrice": 12.391534616288956,
        //                 "lpAmount": 115643.463401,
        //                 "burnPercent": 0,
        //                 "launchMigratePool": false,
        //                 "tips": [],
        //                 "feeOn": "Both",
        //                 "hasDynamicFee": false
        //             }
        //         ]
        //     }
        //
        const rows = this.extractRows (response);
        const rowsLength = rows.length;
        if (rowsLength === 0) {
            throw new BadSymbol (this.id + ' fetchPoolMintAddresses() could not find pool ' + id);
        }
        const pool = rows[0];
        const mintA = this.safeDict (pool, 'mintA');
        const mintB = this.safeDict (pool, 'mintB');
        const mintASymbol = this.safeString (mintA, 'symbol');
        const mintBSymbol = this.safeString (mintB, 'symbol');
        let symbol = undefined;
        if ((mintASymbol !== undefined) && (mintBSymbol !== undefined)) {
            symbol = mintASymbol + '/' + mintBSymbol;
        }
        return this.parsePoolMintAddresses ({
            'info': pool,
            'poolId': this.safeString (pool, 'id', id),
            'mintA': this.safeString (mintA, 'address'),
            'mintB': this.safeString (mintB, 'address'),
            'lpMint': this.safeString (this.safeDict (pool, 'lpMint'), 'address'),
            'symbol': symbol,
        });
    }

    /**
     * @method
     * @name raydium#fetchPoolFees
     * @description fetches unclaimed fees and rewards for a CLMM or locked position
     * @see https://docs.raydium.io/api-reference/dynamic-ipfs-v1/overview.md
     * @param {string} poolId Raydium position account id
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] clmm (default), clmm-lock, or cpmm-lock
     * @returns {object[]} common fee structures with accumulated fees and rewards retained in info
     */
    override async fetchPoolFees (poolId: Str = undefined, params: Dict = {}): Promise<Dict[]> {
        if (poolId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchPoolFees() requires a position id');
        }
        const kind = this.safeString (params, 'type', 'clmm');
        const request = this.omit (params, [ 'type' ]);
        let response: any;
        if (kind === 'clmm') {
            response = await this.dynamicPublicGetClmmPosition (this.extend ({ 'id': poolId }, request));
        } else if (kind === 'clmm-lock') {
            response = await this.dynamicPublicGetLockClmmPosition (this.extend ({ 'id': poolId }, request));
        } else if (kind === 'cpmm-lock') {
            response = await this.dynamicPublicGetLockCpmmPosition (this.extend ({ 'id': poolId }, request));
        } else {
            throw new BadRequest (this.id + ' fetchPoolFees() params.type must be clmm, clmm-lock, or cpmm-lock');
        }
        //
        //     {
        //         "name": "Raydium Concentrated Liquidity",
        //         "symbol": "RCL",
        //         "description": "Raydium Concentrated Liquidity Position",
        //         "external_url": "https://raydium.io/",
        //         "collection": {
        //             "name": "Raydium Concentrated Liquidity",
        //             "family": "Raydium Concentrated Liquidity"
        //         },
        //         "image": "https://img-v1.raydium.io/share/ea1ef711-652b-422b-a593-04426f8f2a04.jpg",
        //         "poolInfo": {
        //             "type": "Concentrated",
        //             "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        //             "id": "AHuAAekwu2DrdagqStUffr6XyRGxLT11g18cGKwvTvpP",
        //             "mintA": {
        //                 "chainId": 101,
        //                 "address": "poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN.png",
        //                 "symbol": "PONS",
        //                 "name": "Pons",
        //                 "decimals": 8,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "mintB": {
        //                 "chainId": 101,
        //                 "address": "EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL",
        //                 "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                 "logoURI": "https://img-v1.raydium.io/icon/EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL.png",
        //                 "symbol": "PPPP",
        //                 "name": "Pee Pee Poo Poo",
        //                 "decimals": 9,
        //                 "tags": [
        //                     "hasTransferFee"
        //                 ],
        //                 "extensions": {
        //                     "feeConfig": {
        //                         "transferFeeConfigAuthority": "11111111111111111111111111111111",
        //                         "withdrawWithheldAuthority": "5KXDF6QnqhBj72hDtJNkkpFaQVUfbFXNybMsp3DiK6tD",
        //                         "withheldAmount": "0",
        //                         "olderTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         },
        //                         "newerTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         }
        //                     }
        //                 }
        //             },
        //             "rewardDefaultPoolInfos": "Clmm",
        //             "rewardDefaultInfos": [],
        //             "price": 92663.3167149224,
        //             "mintAmountA": 6.70712903,
        //             "mintAmountB": 989999999.997368,
        //             "feeRate": 0.01,
        //             "openTime": "0",
        //             "tvl": 1422.54,
        //             "day": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "week": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "month": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "pooltype": [
        //                 "Clmm"
        //             ],
        //             "farmUpcomingCount": 0,
        //             "farmOngoingCount": 0,
        //             "farmFinishedCount": 0,
        //             "config": {
        //                 "id": "A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x",
        //                 "index": 3,
        //                 "protocolFeeRate": 120000,
        //                 "tradeFeeRate": 10000,
        //                 "tickSpacing": 120,
        //                 "fundFeeRate": 40000,
        //                 "defaultRange": 0.1,
        //                 "defaultRangePoint": [
        //                     0.01,
        //                     0.05,
        //                     0.1,
        //                     0.2,
        //                     0.5
        //                 ]
        //             },
        //             "burnPercent": 100,
        //             "launchMigratePool": false,
        //             "tips": [],
        //             "feeOn": "TokenA",
        //             "hasDynamicFee": false
        //         },
        //         "positionInfo": {
        //             "tvlPercentage": 4.99,
        //             "usdValue": 71.08233887794744,
        //             "amountA": 1e-8,
        //             "amountB": 49499999.99986821,
        //             "unclaimedFee": {
        //                 "amountA": 0.00000422,
        //                 "amountB": 0,
        //                 "usdFeeValue": 5.615349632798997e-7,
        //                 "reward": [],
        //                 "usdRewardValue": 0,
        //                 "usdValue": 5.615349632798997e-7
        //             }
        //         }
        //     }
        //
        return [ this.parsePoolFee (this.extractObject (response), poolId, kind) ];
    }

    /**
     * @method
     * @name raydium#fetchConvertQuote
     * @description fetches a Raydium swap quote for two Solana tokens
     * @see https://docs.raydium.io/api-reference/route-api-v2/overview.md
     * @param {string} fromCode currency code or mint address to convert from
     * @param {string} toCode currency code or mint address to convert to
     * @param {float} [amount] amount of the from currency to convert, or desired output for base-out
     * @param {object} [params] exchange-specific parameters
     * @param {string} [params.tradeType] base-in or base-out
     * @param {int} [params.slippageBps] slippage tolerance in basis points
     * @param {string} [params.txVersion] V0 or LEGACY
     * @param {string} [params.inputMint] input token mint override
     * @param {string} [params.outputMint] output token mint override
     * @param {int} [params.fromDecimals] input token decimal places
     * @param {int} [params.toDecimals] output token decimal places
     * @returns {object} a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure) with the full quote in info
     */
    override async fetchConvertQuote (fromCode: string, toCode: string, amount: Num = undefined, params: Dict = {}): Promise<Conversion> {
        if (amount === undefined || amount <= 0) {
            throw new InvalidOrder (this.id + ' fetchConvertQuote() requires a positive amount');
        }
        const fromCurrency = await this.lookupRaydiumCurrency (fromCode);
        const toCurrency = await this.lookupRaydiumCurrency (toCode);
        const fromDecimals = this.safeInteger (params, 'fromDecimals', this.mintDecimals (fromCurrency));
        const toDecimals = this.safeInteger (params, 'toDecimals', this.mintDecimals (toCurrency));
        if (fromDecimals === undefined || toDecimals === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchConvertQuote() requires token decimals');
        }
        const inputMint = this.safeString (params, 'inputMint', fromCurrency['id']);
        const outputMint = this.safeString (params, 'outputMint', toCurrency['id']);
        const amountDecimals = (this.safeString (params, 'tradeType') === 'base-out') ? toDecimals : fromDecimals;
        const rawAmount = this.toBaseUnits (amount, amountDecimals);
        const kind = (this.safeString (params, 'tradeType') === 'base-out') ? 'base-out' : 'base-in';
        const request = this.omit (params, [ 'tradeType', 'inputMint', 'outputMint', 'fromDecimals', 'toDecimals' ]);
        request['inputMint'] = inputMint;
        request['outputMint'] = outputMint;
        request['amount'] = rawAmount;
        request['slippageBps'] = this.safeInteger (request, 'slippageBps', 50);
        request['txVersion'] = this.safeString (request, 'txVersion', 'V0');
        let response: Dict;
        if (kind === 'base-out') {
            response = await this.transactionPublicGetComputeSwapBaseOut (request);
        } else {
            response = await this.transactionPublicGetComputeSwapBaseIn (request);
        }
        //
        //     {
        //         "id": "086d43aa-b0d9-4b50-a786-dc56f925452c",
        //         "success": true,
        //         "data": {
        //             "blacklist": [
        //                 "9jaZhJM6nMHTo4hY9DGabQ1HNuUWhJtm7js1fmKMVpkN"
        //             ],
        //             "mintList": [
        //                 {
        //                     "chainId": 101,
        //                     "address": "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        //                     "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                     "logoURI": "https://img-v1.raydium.io/icon/2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo.png",
        //                     "symbol": "PYUSD",
        //                     "name": "PayPal USD",
        //                     "decimals": 6,
        //                     "tags": [
        //                         "hasFreeze"
        //                     ],
        //                     "extensions": {}
        //                 },
        //                 {
        //                     "chainId": 101,
        //                     "address": "AVw2QGVkXJPRPRjLAceXVoLqU5DVtJ53mdgMXp14yGit",
        //                     "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                     "logoURI": "https://img-v1.raydium.io/icon/AVw2QGVkXJPRPRjLAceXVoLqU5DVtJ53mdgMXp14yGit.png",
        //                     "symbol": "SPYr",
        //                     "name": "SP500 rStock",
        //                     "decimals": 9,
        //                     "tags": [
        //                         "hasFreeze"
        //                     ],
        //                     "extensions": {
        //                         "tips": {
        //                             "text": "This is a Remora tokenized equity",
        //                             "link": "https://remoramarkets.xyz/legal-documentation/service-providers",
        //                             "icon": "https://img-v1.raydium.io/share/remoramarkets.svg"
        //                         }
        //                     }
        //                 },
        //                 {
        //                     "chainId": 101,
        //                     "address": "HQMYCZTDq9g3oZejDRUeQsFtLKgyfvBpD3yHaTnain3L",
        //                     "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                     "logoURI": "https://img-v1.raydium.io/icon/HQMYCZTDq9g3oZejDRUeQsFtLKgyfvBpD3yHaTnain3L.png",
        //                     "symbol": "eUSD",
        //                     "name": "eUSD",
        //                     "decimals": 6,
        //                     "tags": [
        //                         "hasFreeze",
        //                         "hasTransferFee"
        //                     ],
        //                     "extensions": {
        //                         "feeConfig": {
        //                             "transferFeeConfigAuthority": "DyJseFwtoCnQWR333miA4PAv57aB5bCTxCwY6iK8kxNG",
        //                             "withdrawWithheldAuthority": "DyJseFwtoCnQWR333miA4PAv57aB5bCTxCwY6iK8kxNG",
        //                             "withheldAmount": "0",
        //                             "olderTransferFee": {
        //                                 "epoch": "892",
        //                                 "maximumFee": "0",
        //                                 "transferFeeBasisPoints": 0
        //                             },
        //                             "newerTransferFee": {
        //                                 "epoch": "892",
        //                                 "maximumFee": "0",
        //                                 "transferFeeBasisPoints": 0
        //                             }
        //                         }
        //                     }
        //                 },
        //                 {
        //                     "chainId": 101,
        //                     "address": "ZEXy1pqteRu3n13kdyh4LwPQknkFk3GzmMYMuNadWPo",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/ZEXy1pqteRu3n13kdyh4LwPQknkFk3GzmMYMuNadWPo.png",
        //                     "symbol": "ZEX",
        //                     "name": "Zeta",
        //                     "decimals": 6,
        //                     "tags": [],
        //                     "extensions": {}
        //                 }
        //             ],
        //             "whiteList": [
        //                 "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        //                 "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        //                 "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
        //             ]
        //         }
        //     }
        //
        const quote = this.extractObject (response);
        const inputAmount = this.safeString (quote, 'inputAmount');
        const outputAmount = this.safeString (quote, 'outputAmount');
        const quoteId = this.safeString (response, 'id');
        if ((inputAmount === undefined) || (outputAmount === undefined) || (quoteId === undefined)) {
            throw new ExchangeError (this.id + ' fetchConvertQuote() response is missing quote amounts or id');
        }
        const fromAmount = Precise.stringMul (inputAmount, this.parsePrecision (this.numberToString (fromDecimals)));
        const toAmount = Precise.stringMul (outputAmount, this.parsePrecision (this.numberToString (toDecimals)));
        return {
            'info': response,
            'id': quoteId,
            'fromCurrency': fromCode,
            'fromAmount': this.parseNumber (fromAmount),
            'toCurrency': toCode,
            'toAmount': this.parseNumber (toAmount),
            'price': this.parseNumber (Precise.stringDiv (toAmount, fromAmount)),
            'fee': undefined,
        };
    }

    /**
     * @method
     * @name raydium#createConvertTrade
     * @description broadcasts a caller-signed Raydium swap transaction through a Solana JSON-RPC node
     * @see https://docs.raydium.io/api-reference/route-api-v2/overview.md
     * @see https://solana.com/docs/rpc/http/sendtransaction
     * @param {string} id quote id returned by fetchConvertQuote
     * @param {string} fromCode currency code or mint address converted from
     * @param {string} toCode currency code or mint address converted to
     * @param {float} [amount] amount specified for the quote
     * @param {object} [params] exchange-specific parameters
     * @param {object} params.swapResponse full raw response from fetchConvertQuote.info
     * @param {string} params.signedTransaction base64-encoded transaction signed by the wallet
     * @param {string} [params.wallet] wallet public key that signed the transaction
     * @param {string} [params.owner] alias for wallet
     * @returns {object} a [conversion structure](https://docs.ccxt.com/#/?id=conversion-structure) with the submitted signature
     */
    override async createConvertTrade (id: string, fromCode: string, toCode: string, amount: Num = undefined, params: Dict = {}): Promise<Conversion> {
        if (id.length === 0 || amount === undefined || amount <= 0) {
            throw new InvalidOrder (this.id + ' createConvertTrade() requires a quote id and positive amount');
        }
        const signedTransaction = this.safeString (params, 'signedTransaction');
        const wallet = this.safeString (params, 'wallet');
        const swapResponse = this.safeDict (params, 'swapResponse');
        if (signedTransaction === undefined || wallet === undefined || swapResponse === undefined) {
            throw new ArgumentsRequired (this.id + ' createConvertTrade() requires params.signedTransaction, params.wallet, and params.swapResponse');
        }
        if (this.safeString (swapResponse, 'id') !== id) {
            throw new BadRequest (this.id + ' createConvertTrade() quote id does not match params.swapResponse.id');
        }
        const quote = this.extractObject (swapResponse);
        const fromCurrency = await this.lookupRaydiumCurrency (fromCode);
        const toCurrency = await this.lookupRaydiumCurrency (toCode);
        const quoteInputMint = this.safeString (quote, 'inputMint');
        const quoteOutputMint = this.safeString (quote, 'outputMint');
        const fromDecimals = this.safeInteger (params, 'fromDecimals', this.mintDecimals (fromCurrency));
        const toDecimals = this.safeInteger (params, 'toDecimals', this.mintDecimals (toCurrency));
        const inputAmount = this.safeString (quote, 'inputAmount');
        const outputAmount = this.safeString (quote, 'outputAmount');
        if (quoteInputMint !== fromCurrency['id'] || quoteOutputMint !== toCurrency['id']) {
            throw new BadRequest (this.id + ' createConvertTrade() quote token mints do not match the requested currencies');
        }
        if (fromDecimals === undefined || toDecimals === undefined || inputAmount === undefined || outputAmount === undefined) {
            throw new ExchangeError (this.id + ' createConvertTrade() quote is missing token amounts or decimal metadata');
        }
        const request: Dict = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'sendTransaction',
            'params': [ signedTransaction, { 'encoding': 'base64' } ],
        };
        const response = await this.rpcPublicPost (request);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": "r2zdWc2YcYRgwsHM8ztUnqgkrEhr4oHsTYQYif2bGAj2J93PXerxXnt5PKz2NkSsaGu3R2dwhVYmZc2uJL8Pjzy",
        //         "id": 1
        //     }
        //
        const signature = this.safeString (response, 'result');
        if (signature === undefined) {
            const rpcError = this.safeDict (response, 'error', {});
            throw new ExchangeError (this.id + ' createConvertTrade() broadcast failed: ' + this.safeString (rpcError, 'message', 'unknown RPC error'));
        }
        const fromAmount = Precise.stringMul (inputAmount, this.parsePrecision (this.numberToString (fromDecimals)));
        const toAmount = Precise.stringMul (outputAmount, this.parsePrecision (this.numberToString (toDecimals)));
        return {
            'info': response,
            'id': signature,
            'fromCurrency': fromCode,
            'fromAmount': this.parseNumber (fromAmount),
            'toCurrency': toCode,
            'toAmount': this.parseNumber (toAmount),
            'price': this.parseNumber (Precise.stringDiv (toAmount, fromAmount)),
            'fee': undefined,
        };
    }

    /**
     * @method
     * @name raydium#buildConversionTransaction
     * @description builds unsigned token conversion transactions from a Raydium quote, the transaction API returns a list with one entry per transaction to sign
     * @see https://docs.raydium.io/api-reference/route-api-v2/overview.md
     * @param {object} params transaction construction parameters
     * @param {object} params.swapResponse full raw response from fetchConvertQuote.info
     * @param {string} params.wallet wallet public key that will sign the transaction
     * @param {string} [params.txVersion] V0 or LEGACY
     * @param {string} [params.computeUnitPriceMicroLamports] priority fee per compute unit
     * @returns {object[]} unsigned transactions that must be signed and submitted by the caller
     */
    async buildConversionTransaction (params: Dict = {}): Promise<Dict[]> {
        const swapResponse = this.safeDict (params, 'swapResponse');
        const wallet = this.safeString (params, 'wallet');
        if (swapResponse === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' buildConversionTransaction() requires params.swapResponse and params.wallet');
        }
        const quote = this.extractObject (swapResponse);
        const swapType = this.safeString (quote, 'swapType', 'BaseIn');
        const kind = (swapType === 'BaseOut') ? 'transaction/swap-base-out' : 'transaction/swap-base-in';
        const request = this.omit (params, [ 'swapResponse' ]);
        request['wallet'] = wallet;
        request['swapResponse'] = swapResponse;
        request['txVersion'] = this.safeString (request, 'txVersion', 'V0');
        request['computeUnitPriceMicroLamports'] = this.safeString (request, 'computeUnitPriceMicroLamports', '0');
        let response: Dict;
        if (kind === 'transaction/swap-base-out') {
            response = await this.transactionPublicPostTransactionSwapBaseOut (request);
        } else {
            response = await this.transactionPublicPostTransactionSwapBaseIn (request);
        }
        //
        //     {
        //         "id": "e869d4dc-e01a-471d-a1f7-a9644feabfc3-tx",
        //         "version": "V1",
        //         "success": true,
        //         "data": [
        //             {
        //                 "transaction": "AQAAAVr+mDERTufp3OnXCB85PINa68Uic2hpJzpRwBXh7fH1+AA=="
        //             }
        //         ]
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#submitPool
     * @description submits a caller-signed LaunchLab mint-creation transaction, the LaunchLab relay co-signs with the server-held mint key and the co-signed transaction is then broadcast through a Solana JSON-RPC node, the transaction must create a mint previously registered through the LaunchLab mint-info flow
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @see https://solana.com/docs/rpc/http/sendtransaction
     * @param {object} params signed transaction and its wallet
     * @param {string} params.transaction base64-encoded signed Solana transaction
     * @param {string} params.wallet wallet public key that signed the transaction
     * @returns {object} submission result including the transaction signature
     */
    override async submitPool (params: Dict = {}): Promise<Dict> {
        const transaction = this.safeString (params, 'transaction');
        const wallet = this.safeString (params, 'wallet', this.safeString (params, 'owner'));
        if (transaction === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' submitPool() requires params.transaction and params.wallet or params.owner');
        }
        const request: Dict = {
            'txs': [ transaction ],
        };
        const response = await this.launchMintPublicPostCreateSendTransaction (request);
        //
        //     {
        //         "id": "29c6f9c1-7f55-4ac3-b925-71e5a6f0f679",
        //         "success": true,
        //         "data": {
        //             "tx": "AlbqBt4v2rky0reo9vRXXRe6VrcQBLJOg3Mntqc3GXhZtO5uSwS8Z02s8wjsaC/vEGFON/z/B4u+9ic4tWJ6IAR...clJh0VHBQZ"
        //         }
        //     }
        //
        const submission = this.extractObject (response);
        const cosigned = this.safeString (submission, 'tx');
        if (cosigned === undefined) {
            throw new ExchangeError (this.id + ' submitPool() relay response is missing the co-signed transaction');
        }
        const rpcRequest: Dict = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'sendTransaction',
            'params': [ cosigned, { 'encoding': 'base64', 'skipPreflight': true } ],
        };
        const rpcResponse = await this.rpcPublicPost (rpcRequest);
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "result": "2jnbgCvrtJbdQBLAJfpuALJJKXhpYvG3fQdNa3fYjWhM8XogAmDKFKmh3MnHY8ErQmMeRfjeZY1cbfaPv91nVuTZ",
        //         "id": 1
        //     }
        //
        const signature = this.safeString (rpcResponse, 'result');
        if (signature === undefined) {
            const rpcError = this.safeDict (rpcResponse, 'error', {});
            throw new ExchangeError (this.id + ' submitPool() broadcast failed: ' + this.safeString (rpcError, 'message', 'unknown RPC error'));
        }
        submission['signature'] = signature;
        return this.parsePoolSubmission (submission, wallet);
    }

    /**
     * @method
     * @name raydium#createPoolMetadata
     * @description registers off-chain metadata for a LaunchLab mint, this endpoint is effectively browser-only, it requires a Cloudflare Turnstile token and a binary image upload through the Raydium web UI and cannot be completed through this method alone
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} params metadata including mint, name, symbol, and wallet
     * @param {string} params.mint on-chain mint address
     * @param {string} params.name token name
     * @param {string} params.symbol token symbol
     * @param {string} params.wallet creator wallet address
     * @returns {object} metadata registration response
     */
    async createPoolMetadata (params: Dict = {}): Promise<Dict> {
        const required = [ 'mint', 'name', 'symbol', 'wallet' ];
        for (let i = 0; i < required.length; i++) {
            if (this.safeString (params, required[i]) === undefined) {
                throw new ArgumentsRequired (this.id + ' createPoolMetadata() requires params.' + required[i]);
            }
        }
        const response = await this.launchMintPublicPostCreateMintInfo (params);
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchTvl
     * @description fetches Raydium total value locked and 24-hour volume
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} total value locked and 24-hour volume
     */
    async fetchTvl (params: Dict = {}): Promise<Dict> {
        const response = await this.apiV3PublicGetMainInfo (params);
        //
        //     {
        //         "id": "7de32bbe-c8ca-4b45-82a2-4c37b0b41804",
        //         "success": true,
        //         "data": {
        //             "volume24": 275167147.378878,
        //             "tvl": 1812759712.0561848
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchBlockchainTransactionFees
     * @description fetches estimated Solana transaction fees
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} estimated transaction fee data in lamports
     */
    async fetchBlockchainTransactionFees (params: Dict = {}): Promise<Dict> {
        const response = await this.apiV3PublicGetMainAutoFee (params);
        //
        //     {
        //         "id": "a7b328ba-d247-4938-87a9-df795546dd38",
        //         "success": true,
        //         "data": {
        //             "default": {
        //                 "vh": 10000,
        //                 "h": 10000,
        //                 "m": 10000
        //             }
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchSwapInfo
     * @description fetches public Raydium swap protocol and market statistics
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} swap statistics; this API does not expose order execution
     */
    async fetchSwapInfo (params: Dict = {}): Promise<Dict> {
        this.ensureSwapApiAvailable ();
        const response = await this.perpsPublicGetMainInfo (params);
        //
        //     {
        //         "id": "861c160a-8d00-46b1-9940-6127bbfe2c8c",
        //         "success": true,
        //         "data": {
        //             "volume": {
        //                 "24h": 3625572.3761460013,
        //                 "7d": 31836369.184880976,
        //                 "30d": 170440689.58485505
        //             },
        //             "openInterest": {
        //                 "long": 2292241.82528875,
        //                 "short": 2545514.32323518,
        //                 "all": 4837756.1485239295
        //             }
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchSwapMarkets
     * @description fetches public Raydium linear perpetual swap markets
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} a list of [market structures](https://docs.ccxt.com/#/?id=market-structure); this API does not expose order execution
     */
    async fetchSwapMarkets (params: Dict = {}): Promise<Market[]> {
        this.ensureSwapApiAvailable ();
        const response = await this.perpsPublicGetPoolDefaultList (params);
        //
        //     {
        //         "id": "5db4287b-8dbd-4d4c-aa61-48aaaa702096",
        //         "success": true,
        //         "data": {
        //             "data": [
        //                 {
        //                     "symbol": "PERP_SOL_USDC",
        //                     "volume24h": 1344442.16703,
        //                     "volume7d": 6850798.41186,
        //                     "volume30d": 79003013.09101
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.parseMarkets (this.extractRows (response));
    }

    /**
     * @ignore
     * @param {object} market raw Raydium swap market statistics
     * @returns {object} a swap market structure
     */
    parseSwapMarket (market: Dict): Market {
        //
        //     {
        //         "symbol": "PERP_SOL_USDC",
        //         "volume24h": 1344442.16703,
        //         "volume7d": 6850798.41186,
        //         "volume30d": 79003013.09101
        //     }
        //
        const marketId = this.safeString (market, 'symbol');
        if (marketId === undefined) {
            throw new ExchangeError (this.id + ' parseSwapMarket() received a swap without a symbol');
        }
        const parts = marketId.split ('_');
        const numParts = parts.length;
        if ((numParts !== 3) || (parts[0] !== 'PERP') || (parts[1] === '') || (parts[2] !== 'USDC')) {
            throw new ExchangeError (this.id + ' parseSwapMarket() received an unsupported swap symbol ' + marketId);
        }
        const baseId = parts[1];
        const quoteId = parts[2];
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        return this.safeMarketStructure ({
            'info': market,
            'id': marketId,
            'symbol': base + '/' + quote + ':' + quote,
            'base': base,
            'quote': quote,
            'settle': quote,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': quoteId,
            'type': 'swap',
            'spot': false,
            'margin': false,
            'swap': true,
            'future': false,
            'option': false,
            'active': undefined,
            'contract': true,
            'linear': true,
            'inverse': false,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'maker': undefined,
            'taker': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
            },
            'limits': {
                'leverage': { 'min': undefined, 'max': undefined },
                'amount': { 'min': undefined, 'max': undefined },
                'price': { 'min': undefined, 'max': undefined },
                'cost': { 'min': undefined, 'max': undefined },
            },
        });
    }

    /**
     * @method
     * @name raydium#fetchSwapVersion
     * @description fetches the Raydium swap API version
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} swap API version
     */
    async fetchSwapVersion (params: Dict = {}): Promise<Dict> {
        this.ensureSwapApiAvailable ();
        const response = await this.perpsPublicGetMainVersion (params);
        //
        //     {
        //         "id": "1cd8be8b-aa5f-4260-87ba-960348a2b7bf",
        //         "success": true,
        //         "data": {
        //             "latest": "V1.0.1",
        //             "least": "V1.0.1"
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchSwapRpcs
     * @description fetches configured RPC endpoint metadata for Raydium swaps
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} RPC endpoint metadata
     */
    async fetchSwapRpcs (params: Dict = {}): Promise<Dict[]> {
        this.ensureSwapApiAvailable ();
        const response = await this.perpsPublicGetMainRpcs (params);
        //
        //     {
        //         "id": "c2af28c8-02a6-40e9-989e-18f40b5f1e3b",
        //         "success": true,
        //         "data": {
        //             "strategy": "weight",
        //             "rpcs": [
        //                 {
        //                     "url": "https://raydium.mainnet.rpcpool.com/",
        //                     "batch": true,
        //                     "name": "Triton",
        //                     "weight": 90
        //                 },
        //                 {
        //                     "url": "https://helius-proxy.raydium.io/",
        //                     "batch": true,
        //                     "name": "Helius",
        //                     "weight": 10
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchSwapAvailability
     * @description checks whether Raydium swaps are available from the caller's region
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} swap availability result
     */
    async fetchSwapAvailability (params: Dict = {}): Promise<Dict> {
        this.ensureSwapApiAvailable ();
        const response = await this.perpsPublicGetMainAvailabilityCheck (params);
        //
        //     {
        //         "id": "50fc480f-407d-459e-92c2-c16fb0915bf4",
        //         "success": true,
        //         "data": {
        //             "disable": []
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @ignore
     * @description throws if Raydium swaps are unavailable in the current mode
     */
    ensureSwapApiAvailable () {
        if (this.isSandboxModeEnabled) {
            throw new NotSupported (this.id + ' Raydium swaps do not provide a sandbox API');
        }
    }

    /**
     * @method
     * @name raydium#fetchLiquidityPoolPosition
     * @description fetches detailed Raydium liquidity position metadata and unclaimed rewards
     * @see https://docs.raydium.io/api-reference/dynamic-ipfs-v1/overview.md
     * @param {string} positionId on-chain position account id
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] clmm (default), clmm-lock, or cpmm-lock
     * @returns {object} detailed position, pool, fee, and reward information
     */
    async fetchLiquidityPoolPosition (positionId: string, params: Dict = {}): Promise<Dict> {
        const kind = this.safeString (params, 'type', 'clmm');
        const request = this.omit (params, [ 'type' ]);
        let response: any;
        if (kind === 'clmm') {
            response = await this.dynamicPublicGetClmmPosition (this.extend ({ 'id': positionId }, request));
        } else if (kind === 'clmm-lock') {
            response = await this.dynamicPublicGetLockClmmPosition (this.extend ({ 'id': positionId }, request));
        } else if (kind === 'cpmm-lock') {
            response = await this.dynamicPublicGetLockCpmmPosition (this.extend ({ 'id': positionId }, request));
        } else {
            throw new BadRequest (this.id + ' fetchLiquidityPoolPosition() params.type must be clmm, clmm-lock, or cpmm-lock');
        }
        //
        //     {
        //         "name": "Raydium Concentrated Liquidity",
        //         "symbol": "RCL",
        //         "description": "Raydium Concentrated Liquidity Position",
        //         "external_url": "https://raydium.io/",
        //         "collection": {
        //             "name": "Raydium Concentrated Liquidity",
        //             "family": "Raydium Concentrated Liquidity"
        //         },
        //         "image": "https://img-v1.raydium.io/share/ea1ef711-652b-422b-a593-04426f8f2a04.jpg",
        //         "poolInfo": {
        //             "type": "Concentrated",
        //             "programId": "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
        //             "id": "AHuAAekwu2DrdagqStUffr6XyRGxLT11g18cGKwvTvpP",
        //             "mintA": {
        //                 "chainId": 101,
        //                 "address": "poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN",
        //                 "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                 "logoURI": "https://img-v1.raydium.io/icon/poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN.png",
        //                 "symbol": "PONS",
        //                 "name": "Pons",
        //                 "decimals": 8,
        //                 "tags": [],
        //                 "extensions": {}
        //             },
        //             "mintB": {
        //                 "chainId": 101,
        //                 "address": "EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL",
        //                 "programId": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                 "logoURI": "https://img-v1.raydium.io/icon/EpF6sSDjLH6AeHfBYEZHsXACrTMPHMQFS5xtRgN8gUwL.png",
        //                 "symbol": "PPPP",
        //                 "name": "Pee Pee Poo Poo",
        //                 "decimals": 9,
        //                 "tags": [
        //                     "hasTransferFee"
        //                 ],
        //                 "extensions": {
        //                     "feeConfig": {
        //                         "transferFeeConfigAuthority": "11111111111111111111111111111111",
        //                         "withdrawWithheldAuthority": "5KXDF6QnqhBj72hDtJNkkpFaQVUfbFXNybMsp3DiK6tD",
        //                         "withheldAmount": "0",
        //                         "olderTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         },
        //                         "newerTransferFee": {
        //                             "epoch": "1026",
        //                             "maximumFee": "1000000000000000000",
        //                             "transferFeeBasisPoints": 100
        //                         }
        //                     }
        //                 }
        //             },
        //             "rewardDefaultPoolInfos": "Clmm",
        //             "rewardDefaultInfos": [],
        //             "price": 92663.3167149224,
        //             "mintAmountA": 6.70712903,
        //             "mintAmountB": 989999999.997368,
        //             "feeRate": 0.01,
        //             "openTime": "0",
        //             "tvl": 1422.54,
        //             "day": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "week": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "month": {
        //                 "volume": 0,
        //                 "volumeQuote": 0,
        //                 "volumeFee": 0,
        //                 "apr": 0,
        //                 "feeApr": 0,
        //                 "priceMin": 0,
        //                 "priceMax": 0,
        //                 "rewardApr": []
        //             },
        //             "pooltype": [
        //                 "Clmm"
        //             ],
        //             "farmUpcomingCount": 0,
        //             "farmOngoingCount": 0,
        //             "farmFinishedCount": 0,
        //             "config": {
        //                 "id": "A1BBtTYJd4i3xU8D6Tc2FzU6ZN4oXZWXKZnCxwbHXr8x",
        //                 "index": 3,
        //                 "protocolFeeRate": 120000,
        //                 "tradeFeeRate": 10000,
        //                 "tickSpacing": 120,
        //                 "fundFeeRate": 40000,
        //                 "defaultRange": 0.1,
        //                 "defaultRangePoint": [
        //                     0.01,
        //                     0.05,
        //                     0.1,
        //                     0.2,
        //                     0.5
        //                 ]
        //             },
        //             "burnPercent": 100,
        //             "launchMigratePool": false,
        //             "tips": [],
        //             "feeOn": "TokenA",
        //             "hasDynamicFee": false
        //         },
        //         "positionInfo": {
        //             "tvlPercentage": 4.99,
        //             "usdValue": 71.08233887794744,
        //             "amountA": 1e-8,
        //             "amountB": 49499999.99986821,
        //             "unclaimedFee": {
        //                 "amountA": 0.00000422,
        //                 "amountB": 0,
        //                 "usdFeeValue": 5.615349632798997e-7,
        //                 "reward": [],
        //                 "usdRewardValue": 0,
        //                 "usdValue": 5.615349632798997e-7
        //             }
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchMyLiquidityPools
     * @description fetches CPMM pools created by a wallet
     * @see https://docs.raydium.io/api-reference/owner-api-v1/overview.md
     * @param {string} walletAddress creator wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} a list of pools created by the wallet
     */
    async fetchMyLiquidityPools (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.ownerPublicGetCreatePoolOwner (this.extend ({ 'owner': walletAddress }, params));
        //
        //     {
        //         "id": "379a4915401f4fefb3984486cd45d921",
        //         "success": false
        //     }
        //
        if (this.safeBool (response, 'success') === false) {
            return [];
        }
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchMyIdoPositions
     * @description fetches IDO participation for a wallet
     * @see https://docs.raydium.io/api-reference/owner-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} a list of the wallet's IDO positions
     */
    async fetchMyIdoPositions (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.ownerPublicGetMainIdoOwner (this.extend ({ 'owner': walletAddress }, params));
        //
        //     {
        //         "id": "4ce540ff45474a7ca292a25d4284803d",
        //         "success": false
        //     }
        //
        if (this.safeBool (response, 'success') === false) {
            return [];
        }
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchCreatorFees
     * @description fetches unclaimed CPMM creator fees for a wallet
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} walletAddress creator wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} creator fee summaries by pool
     */
    async fetchCreatorFees (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetCpCreatorFee (this.extend ({ 'wallet': walletAddress }, params));
        //
        //     {
        //         "id": "c8de0147-3d52-4857-9309-54530aa8c913",
        //         "success": true,
        //         "data": []
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchMintList
     * @description fetches LaunchLab mints ordered by a supported ranking
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.sort] marketCap, new, lastTrade, or hotToken
     * @returns {object[]} a list of LaunchLab mint records
     */
    async fetchMintList (params: Dict = {}): Promise<Dict[]> {
        const request = this.extend ({ 'sort': 'new' }, params);
        const response = await this.launchMintPublicGetGetList (request);
        //
        //     {
        //         "id": "68048239-c9ea-42ac-aa8d-cdfd1e3c9a2b",
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "mint": "FXEMLHc2CM35jN4yECsiN8T8WofskTbATEywjPKEYX2T",
        //                     "poolId": "97MyiCJP4oCrCUcGWiRL2d6FF4CpheEuaudv2YAtTBfR",
        //                     "configId": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                     "creator": "45YqzZVGe3Zb2AzxXtfpoyBMjDHufeuQNpMHk7tBuh8Z",
        //                     "createAt": 1794623922000,
        //                     "name": "Matchedpad",
        //                     "symbol": "MATCHEDPAD",
        //                     "description": "",
        //                     "metadataUrl": "https://ipfs.io/ipfs/bafkreibk6escj5m6ell5attydjkqoykvrabinuqahpatp2he5vkkbxilb4",
        //                     "platformInfo": {
        //                         "pubKey": "D2ySdMncomHKRKBV4AAftqnLKxyS6HMWcmbewvNcawCg",
        //                         "platformClaimFeeWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //                         "platformLockNftWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //                         "transferFeeExtensionAuth": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //                         "cpConfigId": "FMmwToGqT9iwDgsqvzLg65vcKSzKme4szbWqX1kyCBCJ",
        //                         "platformScale": "0",
        //                         "creatorScale": "0",
        //                         "burnScale": "1000000",
        //                         "feeRate": "15000",
        //                         "creatorFeeRate": "0",
        //                         "name": "My Launch Platform",
        //                         "web": "",
        //                         "img": "",
        //                         "platformVestingWallet": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //                         "platformVestingScale": "0",
        //                         "platformCpCreator": "3BiAxhMQVYyQF3qizjd5FDtx4screSNTD35ptFhMXRM2",
        //                         "restrictCurveParam": 0,
        //                         "curveRuleManager": "11111111111111111111111111111111"
        //                     },
        //                     "configInfo": {
        //                         "name": "Constant Product Curve",
        //                         "pubKey": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                         "epoch": 961,
        //                         "curveType": 0,
        //                         "index": 0,
        //                         "migrateFee": "0",
        //                         "tradeFeeRate": "2500",
        //                         "maxShareFeeRate": "10000",
        //                         "minSupplyA": "10000000",
        //                         "maxLockRate": "800000",
        //                         "minSellRateA": "200000",
        //                         "minMigrateRateA": "150000",
        //                         "minFundRaisingB": "24000000000",
        //                         "protocolFeeOwner": "rayvTLcCMDs7P5tgpuoNA6ZYeLERegeCphdqLSgdKms",
        //                         "migrateFeeOwner": "rayHQtJKrtvqUs3HnhDW9RKubHRbu87eESKEYD5xosa",
        //                         "migrateToAmmWallet": "RAYzrepoBdjSFg7MZj2vy4XBSv2azKRXC72ztUMZMJB",
        //                         "migrateToCpmmWallet": "RAYpQbFNq9i3mu6cKpTKKRwwHFDeK5AuZz8xvxUrCgw",
        //                         "mintB": "So11111111111111111111111111111111111111112"
        //                     },
        //                     "mintB": {
        //                         "chainId": 101,
        //                         "address": "So11111111111111111111111111111111111111112",
        //                         "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                         "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
        //                         "symbol": "WSOL",
        //                         "name": "Wrapped SOL",
        //                         "decimals": 9,
        //                         "tags": [],
        //                         "extensions": {}
        //                     },
        //                     "decimals": 6,
        //                     "supply": 1000000000,
        //                     "marketCap": 27.959121193874665,
        //                     "volumeA": 0,
        //                     "volumeB": 0,
        //                     "volumeU": 0,
        //                     "finishingRate": 0,
        //                     "initPrice": "2.7959121193874663768e-8",
        //                     "endPrice": "4.1082648622522957951e-7",
        //                     "totalLockedAmount": 0,
        //                     "cliffPeriod": "0",
        //                     "unlockPeriod": "0",
        //                     "startTime": 0,
        //                     "totalAllocatedShare": 0,
        //                     "defaultCurve": true,
        //                     "totalSellA": "793100000000000",
        //                     "totalFundRaisingB": "85000000000",
        //                     "migrateType": "cpmm",
        //                     "mintProgramA": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "cpmmCreatorFeeOn": 0
        //                 }
        //             ],
        //             "nextPageId": "3a38bec6-2662-4a9d-99d4-a3347e2397c6"
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchRecentMints
     * @description fetches recent featured LaunchLab mints
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} recent LaunchLab mint records
     */
    async fetchRecentMints (params: Dict = {}): Promise<Dict[]> {
        const response = await this.launchMintPublicGetGetRandomIndexLeftMint (params);
        //
        //     {
        //         "id": "c352d57e-057c-4f51-b24e-9009b5f54199",
        //         "success": true,
        //         "data": {
        //             "data": [
        //                 {
        //                     "mintInfo": {
        //                         "mint": "6nrM8XDyoKmtLJwwcZr5hFK3qBmUvtuUV5vRsWYaZZo2",
        //                         "poolId": "BPg5LnXFrup6JXvrtKi1Zy1FxnEtGiNBja24BYQiByRi",
        //                         "configId": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                         "creator": "EiuLKpXnWs7Jeaw9WnJqcqXm6Txx2s2CXBDNnfEy1DT8",
        //                         "createAt": 1791433896000,
        //                         "name": "FatRat",
        //                         "symbol": "FRT",
        //                         "description": "FatRat was launched on StonkFun.",
        //                         "imgUrl": "https://gateway.irys.xyz/8HbiUSsZyLpZxdr9d2xmcJnG5ESMNZ86RQN1ehniC8Hm",
        //                         "metadataUrl": "https://gateway.irys.xyz/GnnHyGU7aEhGgTwNVGdooFNf9qM9gRsCeyXvmqtTbVcw",
        //                         "platformInfo": {
        //                             "pubKey": "6BwHHDg3u1854jC8PDLXvR4spTcLNaoBxLJNGC4nTESt",
        //                             "platformClaimFeeWallet": "5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG",
        //                             "platformLockNftWallet": "5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG",
        //                             "transferFeeExtensionAuth": "5KXDF6QnqhBj72hDtJNkkpFaQVUfbFXNybMsp3DiK6tD",
        //                             "cpConfigId": "CRRS5ieQmBrZjWhcj99JuGrT5tyuWDaGAXLXLFjbAtjQ",
        //                             "platformScale": "1000000",
        //                             "creatorScale": "0",
        //                             "burnScale": "0",
        //                             "feeRate": "10000",
        //                             "creatorFeeRate": "0",
        //                             "name": "StonkFun",
        //                             "web": "https://www.stonkfun.xyz",
        //                             "img": "https://www.stonkfun.xyz/stonkfun-logo.png",
        //                             "platformVestingWallet": "5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG",
        //                             "platformVestingScale": "0",
        //                             "platformCpCreator": "5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG",
        //                             "restrictCurveParam": 1,
        //                             "curveRuleManager": "2pMi1Sr8vnAR2GPKMHJsmgFY8Hc4cUVbmG5ARxLsRrvp"
        //                         },
        //                         "configInfo": {
        //                             "name": "Constant Product Curve",
        //                             "pubKey": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                             "epoch": 961,
        //                             "curveType": 0,
        //                             "index": 0,
        //                             "migrateFee": "0",
        //                             "tradeFeeRate": "2500",
        //                             "maxShareFeeRate": "10000",
        //                             "minSupplyA": "10000000",
        //                             "maxLockRate": "800000",
        //                             "minSellRateA": "200000",
        //                             "minMigrateRateA": "150000",
        //                             "minFundRaisingB": "24000000000",
        //                             "protocolFeeOwner": "rayvTLcCMDs7P5tgpuoNA6ZYeLERegeCphdqLSgdKms",
        //                             "migrateFeeOwner": "rayHQtJKrtvqUs3HnhDW9RKubHRbu87eESKEYD5xosa",
        //                             "migrateToAmmWallet": "RAYzrepoBdjSFg7MZj2vy4XBSv2azKRXC72ztUMZMJB",
        //                             "migrateToCpmmWallet": "RAYpQbFNq9i3mu6cKpTKKRwwHFDeK5AuZz8xvxUrCgw",
        //                             "mintB": "So11111111111111111111111111111111111111112"
        //                         },
        //                         "mintB": {
        //                             "chainId": 101,
        //                             "address": "So11111111111111111111111111111111111111112",
        //                             "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                             "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
        //                             "symbol": "WSOL",
        //                             "name": "Wrapped SOL",
        //                             "decimals": 9,
        //                             "tags": [],
        //                             "extensions": {}
        //                         },
        //                         "decimals": 6,
        //                         "supply": 1000000000,
        //                         "marketCap": 7389.5354958940325,
        //                         "volumeA": 2404908.616195,
        //                         "volumeB": 0.233248202,
        //                         "volumeU": 18.404336775999493,
        //                         "finishingRate": 18.29,
        //                         "initPrice": "2.7959121193874663768e-8",
        //                         "endPrice": "4.108264862229751e-7",
        //                         "totalLockedAmount": 0,
        //                         "cliffPeriod": "0",
        //                         "unlockPeriod": "0",
        //                         "startTime": 0,
        //                         "totalAllocatedShare": 0,
        //                         "defaultCurve": true,
        //                         "totalSellA": "793100000000000",
        //                         "totalFundRaisingB": "85000000000",
        //                         "migrateType": "cpmm",
        //                         "mintProgramA": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                         "transferFeeBasePoints": 300,
        //                         "maxinumFee": "1000000000000000",
        //                         "cpmmCreatorFeeOn": 0
        //                     },
        //                     "tradeInfo": {
        //                         "amountA": 264548.576157,
        //                         "amountB": 0.026269566,
        //                         "side": "buy"
        //                     }
        //                 }
        //             ]
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchFeaturedMints
     * @description fetches featured LaunchLab mints
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} featured LaunchLab mint records
     */
    async fetchFeaturedMints (params: Dict = {}): Promise<Dict[]> {
        const response = await this.launchMintPublicGetGetRandomIndexTopMint (params);
        //
        //     {
        //         "id": "7b819c15-a274-46f1-bbe1-97a2c826920f",
        //         "success": true,
        //         "data": {
        //             "data": {
        //                 "mint": "Dn2J8oqa7e4YBd3ssAj6Zvm6eH3MA5F9jX279j9UFc4o",
        //                 "poolId": "BQM4t1o6eNZgSAe8iMkw5c6ZdKSFmehwXkH296pUNu1z",
        //                 "configId": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                 "creator": "6zuFWUipNdyfM18fZCHpzfpm9rsSSuhfbcwoJqrbW8nB",
        //                 "createAt": 1794610498000,
        //                 "name": "CT ARENA",
        //                 "symbol": "PEW",
        //                 "description": "",
        //                 "platformInfo": {
        //                     "pubKey": "2Vd1rftqZWydE4RBQL6TK2whH96oWJwRwiFTnGQrDdvt",
        //                     "platformClaimFeeWallet": "6zuFWUipNdyfM18fZCHpzfpm9rsSSuhfbcwoJqrbW8nB",
        //                     "platformLockNftWallet": "6zuFWUipNdyfM18fZCHpzfpm9rsSSuhfbcwoJqrbW8nB",
        //                     "transferFeeExtensionAuth": "6zuFWUipNdyfM18fZCHpzfpm9rsSSuhfbcwoJqrbW8nB",
        //                     "cpConfigId": "D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2",
        //                     "platformScale": "1000000",
        //                     "creatorScale": "0",
        //                     "burnScale": "0",
        //                     "feeRate": "20000",
        //                     "creatorFeeRate": "5000",
        //                     "name": "",
        //                     "web": "",
        //                     "img": "",
        //                     "platformVestingScale": "0",
        //                     "platformVestingWallet": "11111111111111111111111111111111",
        //                     "platformCpCreator": "11111111111111111111111111111111",
        //                     "restrictCurveParam": 0,
        //                     "curveRuleManager": "11111111111111111111111111111111"
        //                 },
        //                 "configInfo": {
        //                     "name": "Constant Product Curve",
        //                     "pubKey": "6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX",
        //                     "epoch": 961,
        //                     "curveType": 0,
        //                     "index": 0,
        //                     "migrateFee": "0",
        //                     "tradeFeeRate": "2500",
        //                     "maxShareFeeRate": "10000",
        //                     "minSupplyA": "10000000",
        //                     "maxLockRate": "800000",
        //                     "minSellRateA": "200000",
        //                     "minMigrateRateA": "150000",
        //                     "minFundRaisingB": "24000000000",
        //                     "protocolFeeOwner": "rayvTLcCMDs7P5tgpuoNA6ZYeLERegeCphdqLSgdKms",
        //                     "migrateFeeOwner": "rayHQtJKrtvqUs3HnhDW9RKubHRbu87eESKEYD5xosa",
        //                     "migrateToAmmWallet": "RAYzrepoBdjSFg7MZj2vy4XBSv2azKRXC72ztUMZMJB",
        //                     "migrateToCpmmWallet": "RAYpQbFNq9i3mu6cKpTKKRwwHFDeK5AuZz8xvxUrCgw",
        //                     "mintB": "So11111111111111111111111111111111111111112"
        //                 },
        //                 "mintB": {
        //                     "chainId": 101,
        //                     "address": "So11111111111111111111111111111111111111112",
        //                     "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        //                     "logoURI": "https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png",
        //                     "symbol": "WSOL",
        //                     "name": "Wrapped SOL",
        //                     "decimals": 9,
        //                     "tags": [],
        //                     "extensions": {}
        //                 },
        //                 "decimals": 6,
        //                 "supply": 1000000000,
        //                 "marketCap": 374.8365866632669,
        //                 "volumeA": 164138886596420.84,
        //                 "volumeB": 38.983591876000006,
        //                 "volumeU": 3051.3721291070888,
        //                 "finishingRate": 0,
        //                 "priceStageTime1": 1794610559.866,
        //                 "priceStageTime2": 1794610592.059,
        //                 "initPrice": "4.9826989611072671256e-9",
        //                 "endPrice": "1.5999999999529423e-7",
        //                 "totalLockedAmount": 0,
        //                 "cliffPeriod": "0",
        //                 "unlockPeriod": "0",
        //                 "startTime": 0,
        //                 "totalAllocatedShare": 0,
        //                 "defaultCurve": false,
        //                 "totalSellA": "850000000000000",
        //                 "totalFundRaisingB": "24000000000",
        //                 "migrateType": "cpmm",
        //                 "mintProgramA": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        //                 "transferFeeBasePoints": 0,
        //                 "maxinumFee": "0",
        //                 "cpmmCreatorFeeOn": 0
        //             }
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchMintVesting
     * @description fetches LaunchLab mint vesting information
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {string} id mint, pool, owner, or comma-separated vesting ids
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] ids (default), pool, or owner
     * @returns {object[]} vesting schedules
     */
    async fetchMintVesting (id: string, params: Dict = {}): Promise<Dict[]> {
        const kind = this.safeString (params, 'type', 'ids');
        const query = this.omit (params, [ 'type' ]);
        let response: any;
        if (kind === 'ids') {
            response = await this.launchMintPublicGetVestingByIds (this.extend ({ 'ids': id }, query));
        } else if (kind === 'pool') {
            response = await this.launchMintPublicGetVestingByPool (this.extend ({ 'id': id }, query));
        } else if (kind === 'owner') {
            response = await this.launchMintPublicGetVestingByOwner (this.extend ({ 'id': id }, query));
        } else {
            throw new BadRequest (this.id + ' fetchMintVesting() params.type must be ids, pool, or owner');
        }
        //
        //     {
        //         "id": "5d1bc269-2565-424a-b3d9-a66a3b1367fa",
        //         "success": true,
        //         "data": {
        //             "data": {}
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchLiquidityPoolHistory
     * @description fetches paginated LaunchLab pool trade history
     * @see https://docs.raydium.io/api-reference/launch-history-v1/overview.md
     * @param {string} poolId LaunchLab pool id
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.owner] optional trader wallet filter
     * @param {int} [params.limit] maximum number of trades
     * @param {string} [params.nextPageKey] opaque cursor for the next page
     * @returns {object[]} raw pool trade records
     */
    async fetchLiquidityPoolHistory (poolId: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.launchHistoryPublicGetTrade (this.extend ({ 'poolId': poolId }, params));
        //
        //     {
        //         "id": "be463d40-2a3c-4685-9f30-445684f1249c",
        //         "success": true,
        //         "data": {
        //             "rows": [
        //                 {
        //                     "txid": "5zDBbbVRJBpU6tuEh1oXfXaiJ9qY8sTKaNZvHBgymz6No2KMSzkTM4F4e47w2hGiRTbArJy7GF3gwwvKxdae1GoA",
        //                     "owner": "7JHsyXRNpN93TGkjzwQgsaCag9tXhwkAKTZmxdcAYx69",
        //                     "blockTime": 1794622861,
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "side": "sell",
        //                     "amountA": 31339.844768,
        //                     "amountB": 0.00081792
        //                 },
        //                 {
        //                     "txid": "2DGSJX4tg2PaTHGWEUefRgJtFA7Ev3ncNdPwwfJTqiDhg2tkMcxi9Wt8NLrSPoNGm3V547AZqano5GVU7S1jVMJX",
        //                     "owner": "6db9d9LnCeKzSaEWYzBJJ88PBrXuuhA6n9NbqcU4tNta",
        //                     "blockTime": 1794622856,
        //                     "poolId": "AHGchjPKFjYw25sJtLjnXsgnfkyGs6Jss6ZkS5yJnG8J",
        //                     "side": "sell",
        //                     "amountA": 4903635.079408,
        //                     "amountB": 0.128571985
        //                 }
        //             ],
        //             "nextPageKey": "c9a37599ca4d8b9a4eff87c9d963e7f8190e70d943c4b4a8212310f7b5fdb7c4"
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchPoolComments
     * @description fetches LaunchLab discussion comments for a pool
     * @see https://docs.raydium.io/api-reference/launch-forum-v1/overview.md
     * @param {string} poolId pool or mint address
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {int} [params.limit] maximum number of comments
     * @param {int} [params.lastId] pagination cursor
     * @param {string} [params.fetchType] old or new
     * @param {boolean} [params.includeNsfw] whether to include NSFW content
     * @returns {object[]} pool comments
     */
    async fetchPoolComments (poolId: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.launchForumPublicGetCommentPool (this.extend ({ 'poolId': poolId }, params));
        //
        //     {
        //         "id": "191377d3-f976-4255-9a11-3692aff3fd5f",
        //         "success": true,
        //         "data": [
        //             {
        //                 "id": "275",
        //                 "poolId": "4MmrqRfyadwcfXgeu6Cig9NZPYiHahoUfnA7VCvhh3on",
        //                 "wallet": "FBujfQRRe1AdFyXzBc8fAGe9zfNbtT7AWjHdr2v7Rteq",
        //                 "text": "test comment",
        //                 "createAt": "2026-11-21T08:34:02.922Z"
        //             }
        //         ]
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#createPoolComment
     * @description posts a LaunchLab pool comment using a caller-provided auth token
     * @see https://docs.raydium.io/api-reference/launch-forum-v1/overview.md
     * @param {object} params comment text, pool id, wallet, and rayToken
     * @param {string} params.poolId pool or mint address
     * @param {string} params.text comment text
     * @param {string} params.wallet commenter wallet public key
     * @param {string} params.rayToken JWT returned by requestRaydiumToken
     * @returns {object} comment submission status and the raw response
     */
    async createPoolComment (params: Dict = {}): Promise<Dict> {
        const poolId = this.safeString (params, 'poolId');
        const text = this.safeString (params, 'text');
        const wallet = this.safeString (params, 'wallet');
        if (poolId === undefined || text === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' createPoolComment() requires params.poolId, params.text, and params.wallet');
        }
        const file = this.safeValue (params, 'file');
        if (file !== undefined) {
            throw new BadRequest (this.id + ' createPoolComment() does not support binary file uploads');
        }
        const response = await this.launchForumPublicPostComment (params);
        //
        //     {
        //         "id": "5fd1f051-6992-4205-81de-0ba8d9929b3f",
        //         "success": true,
        //         "data": "OK"
        //     }
        //
        const status = this.safeString (response, 'data');
        return { 'status': status, 'info': response };
    }

    /**
     * @method
     * @name raydium#requestRaydiumToken
     * @description exchanges a caller-signed Raydium login message for a short-lived forum token
     * @see https://docs.raydium.io/api-reference/launch-auth-v1/overview.md
     * @param {object} params signed message fields
     * @param {int} params.time Unix timestamp in seconds used in the signed message
     * @param {string} params.signature base58-encoded Ed25519 signature
     * @param {string} params.wallet Solana wallet public key
     * @returns {object} authentication token response
     */
    async requestRaydiumToken (params: Dict = {}): Promise<Dict> {
        const time = this.safeInteger (params, 'time');
        const signature = this.safeString (params, 'signature');
        const wallet = this.safeString (params, 'wallet');
        if (time === undefined || signature === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' requestRaydiumToken() requires params.time, params.signature, and params.wallet');
        }
        const response = await this.launchAuthPublicPostRequestToken ({ 'time': time, 'signature': signature, 'wallet': wallet });
        //
        //     {
        //         "id": "04324125-3c00-46eb-900f-0571dec0099b",
        //         "success": true,
        //         "data": {
        //             "token": "fade8cea-bccd-4b91-8423-4e02a34b3e3d"
        //         }
        //     }
        //
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchRaydiumTokenStatus
     * @description checks whether a Raydium forum token is valid
     * @see https://docs.raydium.io/api-reference/launch-auth-v1/overview.md
     * @param {object} params token and wallet fields
     * @param {string} params.token Raydium JWT
     * @param {string} params.wallet wallet public key
     * @returns {object} token validation status and the raw response
     */
    async fetchRaydiumTokenStatus (params: Dict = {}): Promise<Dict> {
        const token = this.safeString (params, 'token');
        const wallet = this.safeString (params, 'wallet');
        if (token === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchRaydiumTokenStatus() requires params.token and params.wallet');
        }
        const response = await this.launchAuthPublicGetCheckToken ({ 'token': token, 'wallet': wallet });
        //
        //     {
        //         "id": "2c690476-d29e-4299-a944-45908fc4f2b8",
        //         "success": true,
        //         "data": "OK"
        //     }
        //
        const status = this.safeString (response, 'data');
        return { 'status': status, 'info': response };
    }

    /**
     * @method
     * @name raydium#fetchClmmLimitOrders
     * @description fetches active indexed Raydium CLMM limit orders for a wallet
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} active indexed limit orders
     */
    async fetchClmmLimitOrders (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderOrderList (this.extend ({ 'wallet': walletAddress }, params));
        //
        //     {
        //         "id": "dee5de42-4e5b-4588-9544-12762a1ab92d",
        //         "success": true,
        //         "data": {
        //             "rows": []
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchClmmLimitOrder
     * @description fetches one indexed Raydium CLMM limit order from active or historical wallet records
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} orderId limit-order PDA or id
     * @param {string} walletAddress wallet public key
     * @param {object} [params] history pagination parameters, including nextPageId
     * @returns {object} normalized indexed limit order
     */
    async fetchClmmLimitOrder (orderId: string, walletAddress: string, params: Dict = {}): Promise<Dict> {
        const active = await this.fetchClmmLimitOrders (walletAddress, params);
        for (let i = 0; i < active.length; i++) {
            const parsed = this.parseCLMMLimitOrder (active[i]);
            if (parsed['id'] === orderId) {
                return parsed;
            }
        }
        const history = await this.fetchClmmLimitOrderHistory (walletAddress, params);
        for (let i = 0; i < history.length; i++) {
            const parsed = this.parseCLMMLimitOrder (history[i], true);
            if (parsed['id'] === orderId) {
                return parsed;
            }
        }
        throw new ExchangeError (this.id + ' fetchClmmLimitOrder() could not find order ' + orderId + ' in the requested active and history pages');
    }

    /**
     * @method
     * @name raydium#fetchClmmLimitOrderHistory
     * @description fetches historical indexed Raydium CLMM limit orders for a wallet
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.nextPageId] opaque cursor for the next page
     * @returns {object[]} historical indexed limit orders
     */
    async fetchClmmLimitOrderHistory (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderHistoryOrderListByUser (this.extend ({ 'wallet': walletAddress }, params));
        //
        //     {
        //         "id": "d4e280c8-3a38-402f-ac72-d25653362cfc",
        //         "success": true,
        //         "data": {
        //             "rows": []
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchClmmLimitOrderEvents
     * @description fetches indexed events for one or more Raydium CLMM limit-order accounts
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} pda limit-order PDA or comma-separated PDAs
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.nextPageId] opaque cursor for the next page
     * @returns {object[]} indexed limit-order events
     */
    async fetchClmmLimitOrderEvents (pda: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderHistoryEventListByPda (this.extend ({ 'pda': pda }, params));
        //
        //     {
        //         "id": "b9fef5e2-0a73-4542-96d2-3e1d6aa9c26a",
        //         "success": true,
        //         "data": {
        //             "rows": []
        //         }
        //     }
        //
        return this.extractRows (response);
    }

    /**
     * @ignore
     * @param {object} order raw indexed CLMM limit order
     * @returns {object} normalized indexed limit order
     */
    parseCLMMLimitOrder (order: Dict, historical = false): Dict {
        const id = this.safeString (order, 'pda', this.safeString (order, 'orderPda', this.safeString (order, 'id', this.safeString (order, 'orderId'))));
        const amount = this.safeNumber (order, 'amount', this.safeNumber (order, 'totalAmount', this.safeNumber (order, 'amountIn')));
        const filled = this.safeNumber2 (order, 'filledAmount', 'executedAmount', 0);
        const timestamp = this.safeInteger2 (order, 'createdAt', 'timestamp');
        let defaultStatus = 'open';
        if (historical) {
            defaultStatus = 'closed';
        }
        const status = this.safeString (order, 'status', defaultStatus);
        let normalizedStatus = status;
        if (status === 'cancelled' || status === 'canceled') {
            normalizedStatus = 'canceled';
        } else if (status === 'filled' || status === 'FULL') {
            normalizedStatus = 'closed';
        }
        let remaining: Num = undefined;
        if (amount !== undefined && filled !== undefined) {
            remaining = Math.max (0, amount - filled);
        }
        return {
            'id': id,
            'clientOrderId': undefined,
            'datetime': this.iso8601 (timestamp),
            'timestamp': timestamp,
            'lastTradeTimestamp': this.safeInteger (order, 'updatedAt'),
            'status': normalizedStatus,
            'type': 'limit',
            'side': this.safeString (order, 'side', this.safeString (order, 'orderSide')),
            'price': this.safeNumber2 (order, 'price', 'limitPrice'),
            'average': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'cost': undefined,
            'fee': undefined,
            'reduceOnly': false,
            'postOnly': false,
            'poolId': this.safeString (order, 'poolId', this.safeString (order, 'pool')),
            'info': order,
        };
    }

    /**
     * @ignore
     * @param {string} code token code or mint address
     * @returns {object} token metadata
     */
    async lookupRaydiumCurrency (code: string): Promise<CurrencyInterface> {
        const cached = this.safeDict (this.currencies, code) as CurrencyInterface;
        if (cached !== undefined) {
            // currencies derived from markets by setMarkets() lose the mint metadata and may
            // carry a precision polluted by unrelated pools that reuse the same token symbol,
            // so only trust cache entries that still carry the mint decimals
            const cachedInfo = this.safeDict (cached, 'info');
            if (this.safeInteger (cachedInfo, 'decimals') !== undefined) {
                return cached;
            }
        }
        const currencies = await this.fetchCurrencies ({ 'query': code });
        if (currencies[code] !== undefined) {
            return currencies[code];
        }
        const codes = Object.keys (currencies);
        for (let i = 0; i < codes.length; i++) {
            const currency = currencies[codes[i]];
            if (currency['id'] === code) {
                return currency;
            }
        }
        throw new BadSymbol (this.id + ' could not find token ' + code);
    }

    /**
     * @ignore
     * @param {object} currency currency structure
     * @returns {int} the token mint decimals
     */
    mintDecimals (currency: Dict): Int {
        const info = this.safeDict (currency, 'info');
        const decimals = this.safeInteger (info, 'decimals');
        if (decimals !== undefined) {
            return decimals;
        }
        return this.safeInteger (currency, 'precision');
    }

    /**
     * @ignore
     * @param {number} amount human-readable token amount
     * @param {int} decimals token decimal precision
     * @returns {string} amount in base units
     */
    toBaseUnits (amount: Num, decimals: number): string {
        const rawAmount = Precise.stringDiv (this.numberToString (amount), this.parsePrecision (this.numberToString (decimals)));
        const amountParts = (rawAmount === undefined) ? [] : rawAmount.split ('.');
        const amountPartsLength = amountParts.length;
        if (rawAmount === undefined || amountPartsLength > 1) {
            throw new InvalidOrder (this.id + ' amount has more decimal places than the token supports');
        }
        return rawAmount;
    }

    /**
     * @ignore
     * @param {object} response Raydium API response
     * @returns {any} unwrapped response data
     */
    extractData (response: any): any {
        const success = this.safeBool (response, 'success');
        if (success === false) {
            const message = this.safeString2 (response, 'msg', 'message', 'unknown API error');
            throw new ExchangeError (this.id + ' API error: ' + message);
        }
        const dataObject = this.safeDict (response, 'data');
        if (dataObject !== undefined) {
            return dataObject;
        }
        const dataList = this.safeList (response, 'data');
        if (dataList !== undefined) {
            return dataList;
        }
        return response;
    }

    /**
     * @ignore
     * @param {object} response Raydium API response
     * @returns {object[]} response rows
     */
    extractRows (response: any): Dict[] {
        const data = this.extractData (response);
        if (Array.isArray (data)) {
            return data as Dict[];
        }
        const candidates = [ 'rows', 'data', 'mintList', 'items', 'rpcs' ];
        for (let i = 0; i < candidates.length; i++) {
            const rows = this.safeList (data, candidates[i]);
            if (rows !== undefined) {
                return rows as Dict[];
            }
        }
        const nested = this.safeDict (data, 'data');
        if (nested !== undefined) {
            if (this.safeString2 (nested, 'mint', 'id') !== undefined) {
                return [ nested as Dict ];
            }
            const nestedKeys = Object.keys (nested);
            const nestedKeysLength = nestedKeys.length;
            if (nestedKeysLength === 0) {
                return [];
            }
        }
        if (this.safeString2 (data, 'mint', 'id') !== undefined) {
            return [ data as Dict ];
        }
        throw new ExchangeError (this.id + ' API response did not contain a recognizable list');
    }

    /**
     * @ignore
     * @param {object} response Raydium API response
     * @returns {object} response data object
     */
    extractObject (response: any): Dict {
        const data = this.extractData (response);
        if (data === undefined || data === null || Array.isArray (data) || typeof data !== 'object') {
            throw new ExchangeError (this.id + ' API response did not contain an object');
        }
        return data as Dict;
    }

    override sign (path: string, api: string[] = [ 'apiV3' ], method: string = 'GET', params: Dict = {}): Dict {
        const apiName = api[0];
        const baseUrl = this.safeString (this.urls['api'], apiName);
        if (baseUrl === undefined) {
            throw new ExchangeError (this.id + ' sign() has no URL for API ' + apiName);
        }
        const url = baseUrl + '/' + this.implodeParams (path, params);
        const requestParams = this.omit (params, this.extractParams (path));
        const requestHeaders: Dict = { 'Accept': 'application/json' };
        let requestBody: any = undefined;
        if ((apiName === 'launchForum' && path === 'comment') || (apiName === 'launchMint' && path === 'create/mint-info')) {
            const rayToken = this.safeString (requestParams, 'rayToken', this.safeString (this.options, 'rayToken'));
            if (rayToken === undefined) {
                throw new ArgumentsRequired (this.id + ' LaunchLab writes require params.rayToken or options.rayToken');
            }
            requestHeaders['ray-token'] = rayToken;
            delete requestParams['rayToken'];
            if (apiName === 'launchForum') {
                const boundary = '--------------------------' + this.randomBytes (12);
                const eol = '\r\n';
                requestHeaders['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
                let multipartBody = '';
                const bodyKeys = Object.keys (requestParams);
                for (let i = 0; i < bodyKeys.length; i++) {
                    const bodyKey = bodyKeys[i];
                    const fieldValue = requestParams[bodyKey];
                    if (fieldValue === undefined || fieldValue === null) {
                        continue;
                    }
                    let encodedValue = fieldValue;
                    if (typeof fieldValue !== 'string') {
                        encodedValue = this.json (fieldValue);
                    }
                    multipartBody += '--' + boundary + eol + 'Content-Disposition: form-data; name="' + bodyKey + '"' + eol + eol + encodedValue + eol;
                }
                multipartBody += '--' + boundary + '--' + eol;
                requestBody = multipartBody;
            } else {
                requestHeaders['Content-Type'] = 'application/json';
                requestBody = this.json (requestParams);
            }
        } else if (method === 'GET') {
            const query = this.urlencode (requestParams);
            if (query.length > 0) {
                return {
                    'url': url + '?' + query,
                    'method': method,
                    'headers': requestHeaders,
                    'body': undefined,
                };
            }
        } else {
            requestHeaders['Content-Type'] = 'application/json';
            requestBody = this.json (requestParams);
        }
        return {
            'url': url,
            'method': method,
            'headers': requestHeaders,
            'body': requestBody,
        };
    }

    override handleErrors (httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined || response === null) {
            return undefined;
        }
        if (this.safeBool (response, 'success') === false) {
            const message = this.safeString2 (response, 'msg', 'message');
            if ((message === undefined) && (url.indexOf ('owner-v1') >= 0)) {
                // the owner API answers 404 with success false and no message when a wallet has no data
                return response;
            }
            const feedback = (message === undefined) ? 'unknown API error' : message;
            throw new ExchangeError (this.id + ' ' + feedback);
        }
        return undefined;
    }
}
