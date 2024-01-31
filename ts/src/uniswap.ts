
//  ---------------------------------------------------------------------------

import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import { ethers } from 'ethers';
import Exchange from './abstract/uniswap.js';
import { NotSupported } from './base/errors.js';
import { Precise } from './base/Precise.js';
import { DECIMAL_PLACES } from './base/functions/number.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import { stringToBinary, numberToHex } from './base/functions/encode.js';

//  ---------------------------------------------------------------------------

export default class uniswap extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'uniswap',
            'name': 'Uniswap',
            'countries': [ ],
            'rateLimit': 50,
            'certified': true,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'borrowMargin': false,
                'cancelAllOrders': undefined,
                'cancelOrder': undefined,
                'cancelOrders': undefined,
                'createDepositAddress': false,
                'createOrder': undefined,
                'createPostOnlyOrder': undefined,
                'createReduceOnlyOrder': undefined,
                'createStopLimitOrder': undefined,
                'createStopMarketOrder': undefined,
                'createStopOrder': undefined,
                'editOrder': undefined,
                'fetchAccounts': undefined,
                'fetchBalance': undefined,
                'fetchBidsAsks': undefined,
                'fetchBorrowInterest': undefined,
                'fetchBorrowRate': undefined,
                'fetchBorrowRateHistories': undefined,
                'fetchBorrowRateHistory': undefined,
                'fetchBorrowRates': undefined,
                'fetchBorrowRatesPerSymbol': undefined,
                'fetchCanceledOrders': undefined,
                'fetchClosedOrder': undefined,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': undefined,
                'fetchDeposit': undefined,
                'fetchDepositAddress': undefined,
                'fetchDepositAddresses': undefined,
                'fetchDepositAddressesByNetwork': undefined,
                'fetchDeposits': undefined,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': undefined,
                'fetchFundingHistory': undefined,
                'fetchFundingRate': undefined,
                'fetchFundingRateHistory': undefined,
                'fetchFundingRates': undefined,
                'fetchIndexOHLCV': undefined,
                'fetchL3OrderBook': undefined,
                'fetchLastPrices': undefined,
                'fetchLedger': undefined,
                'fetchLeverage': false,
                'fetchLeverageTiers': undefined,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': undefined,
                'fetchMarkOHLCV': undefined,
                'fetchMyTrades': undefined,
                'fetchOHLCV': undefined,
                'fetchOpenInterest': undefined,
                'fetchOpenInterestHistory': undefined,
                'fetchOpenOrder': false,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': undefined,
                'fetchOrderBooks': false,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchPosition': undefined,
                'fetchPositions': undefined,
                'fetchPositionsRisk': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': undefined,
                'fetchStatus': undefined,
                'fetchTicker': undefined,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': undefined,
                'fetchTradingFee': undefined,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactionFee': undefined,
                'fetchTransactionFees': undefined,
                'fetchTransactions': false,
                'fetchTransfers': undefined,
                'fetchWithdrawal': false,
                'fetchWithdrawals': undefined,
                'fetchWithdrawalWhitelist': false,
                'reduceMargin': undefined,
                'repayMargin': undefined,
                'setLeverage': undefined,
                'setMargin': false,
                'setMarginMode': undefined,
                'setPositionMode': undefined,
                'signIn': false,
                'transfer': undefined,
                'withdraw': undefined,
            },
            'timeframes': {},
            'chain': 'goerli',
            'urls': {
                'logo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/1026px-Uniswap_Logo.svg.png',
                'test': {
                    'provider': 'https://goerli.infura.io/v3',
                    'uniswap': 'https://api.thegraph.com/subgraphs/name/uniswap',
                    'ianlapham': 'https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli',
                },
                'api': {
                    'provider': 'https://{chain}.infura.io/v3',
                    'uniswap': 'https://api.thegraph.com/subgraphs/name/uniswap',
                    'ianlapham': 'https://api.thegraph.com/subgraphs/name/ianlapham',
                },
                'www': 'https://www.uniswap.org/',
                'referral': {},
                'doc': [
                    'https://docs.uniswap.org/',
                ],
            },
            'api': {
                'uniswap': {
                    'post': {
                        'uniswap-v3': 1,
                    },
                },
                'ianlapham': {
                    'post': {
                        'governance-tracking': 1,
                        'uniswapv2': 1,
                        'uniswap': 1,
                    },
                },
                'provider': {
                    'post': {
                        'sendTransaction': 1,
                    },
                },
            },
            'precisionMode': DECIMAL_PLACES,
            // exchange-specific options
            'options': {
                'gasLimit': 500000,
                'createOrder': {
                    'interface': 'swapExactInputSingle',
                },
                'v3Router': '0xE592427A0AEce92De3Edee1F18E0157C05861564',
                'sandboxMode': false,
                'fetchCurrencies': true,
                'hasAlreadyAuthenticatedSuccessfully': false,
                'warnOnFetchOpenOrdersWithoutSymbol': true,
                'commands': {
                    'V3_SWAP_EXACT_IN': '00',
                    'V3_SWAP_EXACT_OUT': '01',
                },
            },
            'requiredCredentials': {
                'walletAddress': true, // wallet address
                'privateKey': true, // wallet private key
                'apiKey': true, // provider api key
                'secret': false,
            },
            'exceptions': {
            },
        });
    }

    // async fetchCurrencies (params = {}) {
    //     /**
    //      * @method
    //      * @name uniswap#fetchCurrencies
    //      * @description fetches all available currencies on an exchange
    //      * @param {object} params extra parameters specific to the uniswap api endpoint
    //      * @returns {object} an associative dictionary of currencies
    //      */
    //     // NOTE: uniswap can have several tokens with the same symbol but different id.
    //     const query = `query fetchCurrencies($limit: Int, $offset: Int) {
    //         tokens(first: $limit, skip: $offset) {
    //           id
    //           name
    //           symbol
    //           volume
    //           feesUSD
    //           txCount
    //           decimals
    //           volumeUSD
    //           poolCount
    //           derivedETH
    //           __typename
    //           totalSupply
    //           totalValueLocked
    //           untrackedVolumeUSD
    //           totalValueLockedUSDUntracked
    //         }
    //       }`;
    //     const request = {
    //         'query': query,
    //         'variables': {
    //             'limit': 1000,
    //             'offset': 0,
    //         },
    //     };
    //     let currencies = [];
    //     while (true) {
    //         const response = await this.uniswapPostUniswapV3 (this.extend (request, params));
    //         //
    //         //    {
    //         //        "data": {
    //         //            "tokens": [
    //         //                {
    //         //                  "id": "0x00000000000045166c45af0fc6e4cf31d9e14b9a",
    //         //                  "name": "TopBidder",
    //         //                  "symbol": "BID",
    //         //                  "volume": "8347.641875381858852443",
    //         //                  "feesUSD": "81.14480070327402387046118602321907",
    //         //                  "txCount": "15",
    //         //                  "decimals": "18",
    //         //                  "volumeUSD": "8114.480070327402387046118602321907",
    //         //                  "poolCount": "0",
    //         //                  "derivedETH": "0",
    //         //                  "__typename": "Token",
    //         //                  "totalSupply": "28240",
    //         //                  "totalValueLocked": "45.690660599764812617"
    //         //                },
    //         //                ...
    //         //           ]
    //         //        }
    //         //    }
    //         //
    //         const data = this.safeValue (response, 'data', {});
    //         const newCurrencies = this.safeValue (data, 'tokens');
    //         if (newCurrencies === undefined) {
    //             break;
    //         }
    //         currencies = this.arrayConcat (currencies, newCurrencies);
    //         request['variables']['offset'] += currencies.length;
    //     }
    //     const result = {};
    //     for (let i = 0; i < currencies.length; i++) {
    //         const currency = currencies[i];
    //         const code = this.commonCurrencyCode (this.safeString (currency, 'symbol'));
    //         const precision = this.parseNumber (this.parsePrecision (this.safeString (currency, 'decimals')));
    //         result[code] = {
    //             'id': this.safeString (currency, 'id'),
    //             'code': code,
    //             'info': currency,
    //             'name': this.safeString (currency, 'name'),
    //             'active': undefined,
    //             'deposit': undefined,
    //             'withdraw': undefined,
    //             'fee': undefined,
    //             'precision': precision,
    //             'limits': {
    //                 'amount': {
    //                     'min': precision,
    //                     'max': undefined,
    //                 },
    //                 'withdraw': {
    //                     'min': undefined,
    //                     'max': undefined,
    //                 },
    //             },
    //         };
    //     }
    //     return result;
    // }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name uniswap#fetchMarkets
         * @description retrieves data on all markets for uniswap
         * @param {object} params extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const query = `query fetchMarkets($limit: Int, $offset: Int) {
            pools(first: $limit, skip: $offset, orderBy: totalValueLockedUSD, orderDirection: desc) {
              id
              token0 {
                id
                symbol
              }
              token1 {
                id
                symbol
              }
              feeTier
              feesUSD
              txCount
              liquidity
              sqrtPrice
              volumeUSD
              volumeToken0
              volumeToken1
              observationIndex
              collectedFeesUSD
              collectedFeesToken0
              collectedFeesToken1
              totalValueLockedETH
              totalValueLockedUSD
              createdAtTimestamp
              createdAtBlockNumber
              feeGrowthGlobal0X128
              feeGrowthGlobal1X128
              totalValueLockedToken0
              totalValueLockedToken1
              liquidityProviderCount
              totalValueLockedUSDUntracked
            }
          }`;
        const request = {
            'query': query,
            'variables': {
                'limit': 1000,
                'offset': 0,
            },
        };
        let markets = [];
        while (true) {
            const response = await this.uniswapPostUniswapV3 (this.extend (request, params));
            //
            //    {
            //        "data": {
            //            "pools": [
            //                {
            //                    "id": "0x0001fcbba8eb491c3ccfeddc5a5caba1a98c4c28",
            //                    "token0": {
            //                        "id": "0xbef81556ef066ec840a540595c8d12f516b6378f"
            //                        "symbol": "XEN"
            //                    },
            //                    "token1": {
            //                        "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            //                        "symbol": "XUSD"
            //                    },
            //                    "feeTier": "10000",
            //                    "feesUSD": "0.001849193372604300017804758202164034",
            //                    "txCount": "2",
            //                    "liquidity": "303015134493562686441",
            //                    "sqrtPrice": "792216481398733702759960397",
            //                    "volumeUSD": "0.1849193372604300017804758202164034",
            //                    "volumeToken0": "1",
            //                    "volumeToken1": "0.000098986954322105",
            //                    "observationIndex": "0",
            //                    "collectedFeesUSD": "0",
            //                    "collectedFeesToken0": "0",
            //                    "collectedFeesToken1": "0",
            //                    "totalValueLockedETH": "0.01365551549733099",
            //                    "totalValueLockedUSD": "25.51011790401229376312534072638212",
            //                    "createdAtTimestamp": "1626494775",
            //                    "createdAtBlockNumber": "12842087",
            //                    "feeGrowthGlobal0X128": "11229880233198962195483552111498235",
            //                    "feeGrowthGlobal1X128": "0",
            //                    "totalValueLockedToken0": "30000.999999999999716385",
            //                    "totalValueLockedToken1": "0.01365551549733099",
            //                    "liquidityProviderCount": "0",
            //                    "totalValueLockedUSDUntracked": "0"
            //                },
            //              ...
            //            ]
            //        }
            //    }
            //
            const data = this.safeValue (response, 'data', {});
            const newMarkets = this.safeValue (data, 'pools');
            if (newMarkets === undefined) {
                break;
            }
            markets = this.arrayConcat (markets, newMarkets);
            request['variables']['offset'] += markets.length;
        }
        const results = [];
        for (let i = 0; i < markets.length; i++) {
            results.push (this.parseMarket (markets[i]));
        }
        return results;
    }

    parseMarket (market) {
        //
        //    {
        //        "id": "0x0001fcbba8eb491c3ccfeddc5a5caba1a98c4c28",
        //        "token0": {
        //            "id": "0xbef81556ef066ec840a540595c8d12f516b6378f"
        //            "symbol": "XEN"
        //        },
        //        "token1": {
        //            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        //            "symbol": "XUSD"
        //        },
        //        "feeTier": "10000",
        //        "feesUSD": "0.001849193372604300017804758202164034",
        //        "txCount": "2",
        //        "liquidity": "303015134493562686441",
        //        "sqrtPrice": "792216481398733702759960397",
        //        "volumeUSD": "0.1849193372604300017804758202164034",
        //        "volumeToken0": "1",
        //        "volumeToken1": "0.000098986954322105",
        //        "observationIndex": "0",
        //        "collectedFeesUSD": "0",
        //        "collectedFeesToken0": "0",
        //        "collectedFeesToken1": "0",
        //        "totalValueLockedETH": "0.01365551549733099",
        //        "totalValueLockedUSD": "25.51011790401229376312534072638212",
        //        "createdAtTimestamp": "1626494775",
        //        "createdAtBlockNumber": "12842087",
        //        "feeGrowthGlobal0X128": "11229880233198962195483552111498235",
        //        "feeGrowthGlobal1X128": "0",
        //        "totalValueLockedToken0": "30000.999999999999716385",
        //        "totalValueLockedToken1": "0.01365551549733099",
        //        "liquidityProviderCount": "0",
        //        "totalValueLockedUSDUntracked": "0"
        //    }
        //
        const baseObject = this.safeValue (market, 'token0', {});
        const quoteObject = this.safeValue (market, 'token1', {});
        const baseId = this.safeString (baseObject, 'id');
        const quoteId = this.safeString (quoteObject, 'id');
        const base = this.commonCurrencyCode (this.safeString (baseObject, 'symbol'));
        const quote = this.commonCurrencyCode (this.safeString (quoteObject, 'symbol'));
        const feeTier = this.safeString (market, 'feeTier');
        const feeTierPercentage = Precise.stringDiv (feeTier, '10000');
        const symbol = base + '/' + quote + ':' + feeTierPercentage;
        const entry = {
            'id': this.safeString (market, 'id'),
            'lowercaseId': this.safeStringLower (market, 'symbol'),
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'feeTier': feeTier,
            'type': undefined,
            'spot': undefined,
            'margin': undefined,
            'swap': undefined,
            'future': undefined,
            'option': undefined,
            'active': undefined,
            'contract': undefined,
            'linear': undefined,
            'inverse': undefined,
            'taker': undefined,
            'maker': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': undefined,
                'price': undefined,
                'base': undefined,
                'quote': undefined,
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
            'info': market,
        };
        return entry;
    }

    universalCommand (revert: boolean, command: string, r: string = '00') {
        /**
         * @ignore
         * @method
         * @name uniswap#universalCommand
         * @description build command byte for universal router
         * @param {boolean} f whether or not the command should be allowed to revert without the whole transaction failing.
         * @param {int} r 2 unused bytes, reserved for future use.
         * @param {command} command extra parameters specific to the exchange api endpoint
         * @returns {[object]} an array of objects representing market data
         */
        const f = revert ? '1' : '0';
        return stringToBinary (f + r + command);
    }

    async fetchTransactionCount (address:string = this.walletAddress, block: string = 'latest') {
        /**
         * @ignore
         * @method
         * @name uniswap#createOrder
         * @description create a trade order
         */
        const rpcRequest = {
            'jsonrpc': '2.0',
            'method': 'eth_getTransactionCount',
            'params': [ address, block ],
            'id': this.requestId (),
        };
        const response = await this.providerPostSendTransaction (rpcRequest);
        //
        //   {
        //       "jsonrpc": "2.0",
        //       "id": 1,
        //       "result": "0x1a"
        //   }
        //
        return this.safeString (response, 'result');
    }

    async fetchGasPrice () {
        /**
         * @ignore
         * @method
         * @name uniswap#fetchGasPrice
         * @description Returns the current gas price in wei.
         */
        const rpcRequest = {
            'jsonrpc': '2.0',
            'method': 'eth_gasPrice',
            'params': [],
            'id': this.requestId (),
        };
        const response = await this.providerPostSendTransaction (rpcRequest);
        //
        //    {
        //        "jsonrpc": "2.0",
        //        "id": 1,
        //        "result": "0x12a05f200"
        //    }
        //
        return this.safeString (response, 'result');
    }

    async createOrder (symbol: string, type, side, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name uniswap#createOrder
         * @description create a trade order
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float|undefined} price the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} params extra parameters specific to the uniswap api endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const functionSignature = [ {
            'inputs': [ {
                'components': [ {
                    'internalType': 'address',
                    'name': 'tokenIn',
                    'type': 'address',
                }, {
                    'internalType': 'address',
                    'name': 'tokenOut',
                    'type': 'address',
                }, {
                    'internalType': 'uint24',
                    'name': 'fee',
                    'type': 'uint24',
                }, {
                    'internalType': 'address',
                    'name': 'recipient',
                    'type': 'address',
                }, {
                    'internalType': 'uint256',
                    'name': 'deadline',
                    'type': 'uint256',
                }, {
                    'internalType': 'uint256',
                    'name': 'amountIn',
                    'type': 'uint256',
                }, {
                    'internalType': 'uint256',
                    'name': 'amountOutMinimum',
                    'type': 'uint256',
                }, {
                    'internalType': 'uint160',
                    'name': 'sqrtPriceLimitX96',
                    'type': 'uint160',
                } ],
                'internalType': 'struct ISwapRouter.ExactInputSingleParams',
                'name': 'params',
                'type': 'tuple',
            } ],
            'name': 'exactInputSingle',
            'outputs': [ {
                'internalType': 'uint256',
                'name': 'amountOut',
                'type': 'uint256',
            } ],
            'stateMutability': 'payable',
            'type': 'function',
        },
        ];
        const inputValues = {
            'tokenIn': market['baseId'], // TokenIn address
            'tokenOut': market['quoteId'], // TokenOut address
            'recipient': this.walletAddress,
            'fee': parseInt (market['feeTier']), // Fee, e.g., 3000 for 0.3% fee tier
            'amountIn': 1, // AmountIn in wei (1 ether)
            'amountOutMinimum': 0, // Set to 0 to ignore slippage protection
            'sqrtPriceLimitX96': 0, // SqrtPriceLimitX96, use '0' for no limit
            'deadline': Math.floor (Date.now () / 1000) + 60 * 20, // Deadline in seconds (e.g., 20 minutes from now)
        };
        // TODO replace ethers abi code for a static dependency
        const uniswapV3Router = new ethers.Interface (functionSignature);
        const encodedData = uniswapV3Router.encodeFunctionData ('exactInputSingle', [ [
            inputValues.tokenIn,
            inputValues.tokenOut,
            inputValues.fee,
            inputValues.recipient,
            inputValues.deadline,
            inputValues.amountIn,
            inputValues.amountOutMinimum,
            inputValues.sqrtPriceLimitX96,
        ] ]);
        const nonce = await this.fetchTransactionCount ();
        const gasLimit = this.safeNumber (this.options, 'gasLimit', 21000);
        const gasPrice = await this.fetchGasPrice ();
        // TODO check EIP1559
        const txData = {
            'from': this.walletAddress,
            'gasLimit': numberToHex (gasLimit),
            'gasPrice': gasPrice,
            // 'maxFeePerGas': numberToHex (100000000),
            // 'maxPriorityFeePerGas': numberToHex (maxPriorityFeePerGas),
            'nonce': nonce,
            'to': this.options['v3Router'],
            'data': encodedData,
            'value': '0x0',
        };
        // test with existing functions
        const byteArray = [
            this.base16ToBinary (this.remove0xPrefix (txData.nonce)),
            this.base16ToBinary (this.remove0xPrefix (txData.gasPrice)),
            this.base16ToBinary (this.remove0xPrefix (txData.gasLimit)),
            this.base16ToBinary (this.remove0xPrefix (txData.to)),
            this.base16ToBinary (this.remove0xPrefix (txData.value)),
            this.base16ToBinary (this.remove0xPrefix (txData.data)),
        ];
        const binary = this.binaryConcatArray (byteArray);
        const hash = this.hash (binary, keccak, 'hex');
        const { r, s, v } = this.signMessage (hash, this.privateKey);
        const signedByteArray = [
            this.base16ToBinary (this.remove0xPrefix (txData.nonce)),
            this.base16ToBinary (this.remove0xPrefix (txData.gasPrice)),
            this.base16ToBinary (this.remove0xPrefix (txData.gasLimit)),
            this.base16ToBinary (this.remove0xPrefix (txData.to)),
            this.base16ToBinary (this.remove0xPrefix (txData.value)),
            this.base16ToBinary (this.remove0xPrefix (txData.data)),
            this.binaryToBase16 (this.numberToBE (v, 1)),
            this.base16ToBinary (this.remove0xPrefix (r)),
            this.base16ToBinary (this.remove0xPrefix (s)),
        ];
        const signedBinary = this.binaryConcatArray (signedByteArray);
        const signedHash = this.hash (signedBinary, keccak, 'hex');
        const serializedTx = '0x' + signedHash;
        // Below code works using ethereumjs-tx library, looking to substitute for kecack signing
        // const common = new Common ({ 'chain': Chain.Goerli, 'hardfork': Hardfork.London });
        // const tx = Transaction.fromTxData (txData, { common });
        // const privateKey = Buffer.from (
        //     this.privateKey,
        //     'hex'
        // );
        // const signedTx = tx.sign (privateKey);
        // const serializedTx = '0x' + signedTx.serialize ().toString ('hex');
        const rpcRequest = { 'jsonrpc': '2.0', 'method': 'eth_sendRawTransaction', 'params': [ serializedTx ], 'id': this.requestId () };
        return await this.providerPostSendTransaction (rpcRequest);
    }

    requestId () {
        const previousValue = this.safeInteger (this.options, 'requestId', 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'] = newValue;
        return newValue;
    }

    async fetchTicker (symbol, params = {}) {
        /**
         * @method
         * @name uniswap#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the uniswap api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = `query fetchTicker24H($marketId: ID!) {
            pool(id: $marketId) {
              token0 {
                id
                symbol
              }
              token1 {
                id
                symbol
              }
              feeTier
              poolDayData(first: 1, orderBy: date, orderDirection: desc) {
                id
                date
                liquidity
                sqrtPrice
                token0Price
                token1Price
                tick
                feeGrowthGlobal0X128
                feeGrowthGlobal1X128
                tvlUSD
                volumeToken0
                volumeToken1
                volumeUSD
                feesUSD
                txCount
                open
                high
                low
                close
              }
            }
          }`;
        const request = {
            'query': query,
            'variables': {
                'marketId': market['id'],
            },
        };
        const response = await this.uniswapPostUniswapV3 (this.extend (request, params));
        //
        //    {
        //        "data": {
        //            "pool": {
        //                "token0": {
        //                    "id": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        //                    "symbol": "WBTC"
        //                },
        //                "token1": {
        //                    "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        //                    "symbol": "WETH"
        //                },
        //                "feeTier": "500",
        //                "poolDayData": [{
        //                    "id": "0x4585fe77225b41b697c938b018e2ac67ac5a20c0-19442",
        //                    "date": 1679788800,
        //                    "liquidity": "1071528730654218407",
        //                    "sqrtPrice": "31470245813468926661305003507822617",
        //                    "token0Price": "0.06338097228125752536301698292951363",
        //                    "token1Price": "15.77760586509196511267153044019229",
        //                    "tick": "257857",
        //                    "feeGrowthGlobal0X128": "29633019576451421722265470362037",
        //                    "feeGrowthGlobal1X128": "4301191941723082017897177413815623566460066",
        //                    "tvlUSD": "124399570.7643738767232938910223154",
        //                    "volumeToken0": "1321.55288298",
        //                    "volumeToken1": "20890.921184786060412028",
        //                    "volumeUSD": "36695732.38230070412140883669510459",
        //                    "feesUSD": "18347.86619115035206070441834755215",
        //                    "txCount": "871",
        //                    "open": "0.06327839759791178549311336907384705",
        //                    "high": "0.06405489576729688424459434798908395",
        //                    "low": "0.06198516678038363291116353641839604",
        //                    "close": "0.06327839759791178549311336907384705"
        //                }]
        //            }
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const pool = this.safeValue (data, 'pool', {});
        const tickers = this.safeValue2 (pool, 'poolDayData', 'poolHourData', []);
        const ticker = this.safeValue (tickers, 0, {});
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market = undefined) {
        //
        //    {
        //        "id": "0x4585fe77225b41b697c938b018e2ac67ac5a20c0-19442",
        //        "date": 1679788800,
        //        "liquidity": "1071528730654218407",
        //        "sqrtPrice": "31470245813468926661305003507822617",
        //        "token0Price": "0.06338097228125752536301698292951363",
        //        "token1Price": "15.77760586509196511267153044019229",
        //        "tick": "257857",
        //        "feeGrowthGlobal0X128": "29633019576451421722265470362037",
        //        "feeGrowthGlobal1X128": "4301191941723082017897177413815623566460066",
        //        "tvlUSD": "124399570.7643738767232938910223154",
        //        "volumeToken0": "1321.55288298",
        //        "volumeToken1": "20890.921184786060412028",
        //        "volumeUSD": "36695732.38230070412140883669510459",
        //        "feesUSD": "18347.86619115035206070441834755215",
        //        "txCount": "871",
        //        "open": "0.06327839759791178549311336907384705",
        //        "high": "0.06405489576729688424459434798908395",
        //        "low": "0.06198516678038363291116353641839604",
        //        "close": "0.06327839759791178549311336907384705"
        //    }
        //
        const id = this.safeString (ticker, 'id');
        const parts = id.split ('-');
        const marketId = this.safeString (parts, 0);
        const timestamp = this.safeIntegerProduct (ticker, 'date', 1000);
        return this.safeTicker ({
            'symbol': this.safeSymbol (marketId, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': Precise.stringDiv ('1', this.safeString (ticker, 'high')),
            'low': Precise.stringDiv ('1', this.safeString (ticker, 'low')),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': Precise.stringDiv ('1', this.safeString (ticker, 'open')),
            'close': Precise.stringDiv ('1', this.safeString (ticker, 'close')),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': Precise.stringDiv ('1', this.safeString (ticker, 'sqrtPrice')),
            'baseVolume': this.safeString (ticker, 'volumeToken0'),
            'quoteVolume': this.safeString (ticker, 'volumeToken1'),
            'info': ticker,
        }, market);
    }

    async fetchTrades (symbol, since: any = undefined, limit: any = undefined, params = {}) {
        /**
         * @method
         * @name uniswap#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch. Maximum is 1000, default is 100
         * @param {object} params extra parameters specific to the uniswap api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const query = `query fetchTrades($marketId: ID!, $limit: Int, $since: Int) {
            swaps(
              first: $limit
              where: {and: [{timestamp_gte: $since}, {pool: $marketId}]}
              orderBy: timestamp
              orderDirection: desc
            ) {
              id
              transaction {
                blockNumber
                timestamp
                gasUsed
                gasPrice
              }
              timestamp
              token0 {
                id
                symbol
              }
              token1 {
                id
                symbol
              }
              pool {
                id
                feeTier
              }
              sender
              recipient
              origin
              amount0
              amount1
              amountUSD
              sqrtPriceX96
              tick
              logIndex
            }
          }`;
        const request = {
            'query': query,
            'variables': {
                'marketId': market['id'],
                'limit': (limit !== undefined) ? limit : 100,
                'since': (since !== undefined) ? since * 1000 : 0,
            },
        };
        const response = await this.uniswapPostUniswapV3 (this.extend (request, params));
        //
        //    {
        //        "data": {
        //            "swaps": [{
        //                        "id": "0x00003dd37c9814eea72bb509be301dad59071efcac6dc63788db565b72eddb92#207768",
        //                        "transaction": {
        //                            "blockNumber": "16913919",
        //                            "timestamp": "1679861831",
        //                            "gasUsed": "1000000",
        //                            "gasPrice": "20126608116"
        //                        },
        //                        "timestamp": "1679861831",
        //                        "pool": {
        //                            "id": "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf",
        //                            "feeTier": "500",
        //                        }
        //                        "token0": {
        //                            "id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //                            "symbol": "USDC"
        //                        },
        //                        "token1": {
        //                            "id": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        //                            "symbol": "USDT"
        //                        },
        //                        "sender": "0xe592427a0aece92de3edee1f18e0157c05861564",
        //                        "recipient": "0xe592427a0aece92de3edee1f18e0157c05861564",
        //                        "origin": "0xb3d8aeffb6ce3f76f469a1354fea752331d20a1b",
        //                        "amount0": "-90.033234",
        //                        "amount1": "90",
        //                        "amountUSD": "90.016617",
        //                        "sqrtPriceX96": "79193732732574521804475385165",
        //                        "tick": "-9",
        //                        "logIndex": "80"
        //                    },
        //                    ...
        //                ]
        //            }
        //        }
        //    }
        //
        const data = this.safeValue (response, 'data', {});
        const swaps = this.safeValue (data, 'swaps', []);
        return this.parseTrades (swaps, market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        //    {
        //        "id": "0x00003dd37c9814eea72bb509be301dad59071efcac6dc63788db565b72eddb92#207768",
        //        "transaction": {
        //            "blockNumber": "16913919",
        //            "timestamp": "1679861831",
        //            "gasUsed": "1000000",
        //            "gasPrice": "20126608116"
        //        },
        //        "timestamp": "1679861831",
        //        "pool": {
        //            "id": "0x7858e59e0c01ea06df3af3d20ac7b0003275d4bf",
        //            "feeTier": "500"
        //        },
        //        "token0": {
        //            "id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        //            "symbol": "USDC"
        //        },
        //        "token1": {
        //            "id": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        //            "symbol": "USDT"
        //        },
        //        "sender": "0xe592427a0aece92de3edee1f18e0157c05861564",
        //        "recipient": "0xe592427a0aece92de3edee1f18e0157c05861564",
        //        "origin": "0xb3d8aeffb6ce3f76f469a1354fea752331d20a1b",
        //        "amount0": "-90.033234",
        //        "amount1": "90",
        //        "amountUSD": "90.016617",
        //        "sqrtPriceX96": "79193732732574521804475385165",
        //        "tick": "-9",
        //        "logIndex": "80"
        //    }
        //
        const timestamp = this.safeIntegerProduct (trade, 'timestamp', 1000);
        const pool = this.safeValue (trade, 'pool', {});
        const marketId = this.safeString (pool, 'id');
        const amount0 = this.safeNumber (trade, 'amount0');
        const side = (amount0 < 0) ? 'buy' : 'sell';
        return this.safeTrade ({
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (marketId, market),
            'id': this.safeString (trade, 'id'),
            'order': this.safeString (trade, 'origin'),
            'type': this.safeStringLower (trade, 'type'),
            'side': side,
            'takerOrMaker': undefined,
            'price': Precise.stringAbs (this.safeString (trade, 'amount1')),
            'amount': Precise.stringAbs (this.numberToString (amount0)),
            'cost': undefined,
            'fee': undefined, // should this be gass fee + fee?
        }, market);
    }

    sign (path, api: any = 'public', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const urls = this.urls as any;
        if (!(api in urls['api'])) {
            throw new NotSupported (this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
        }
        let url = this.urls['api'][api];
        headers = {
            'Content-Type': 'application/json',
        };
        if (api === 'provider') {
            this.checkRequiredCredentials ();
            url = this.implodeParams (url, { 'chain': this.chain });
            url += '/' + this.apiKey;
            body = this.json (params);
        } else {
            url += '/' + path;
            body = this.json (params);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    remove0xPrefix (hexData) {
        return (hexData.slice (0, 2) === '0x') ? hexData.slice (2) : hexData;
    }

    hashMessage (message) {
        // takes a hex encoded message
        const binaryMessage = this.base16ToBinary (this.remove0xPrefix (message));
        const prefix = this.encode ('\x19Ethereum Signed Message:\n' + binaryMessage.byteLength);
        return '0x' + this.hash (this.binaryConcat (prefix, binaryMessage), keccak, 'hex');
    }

    signHash (hash, privateKey) {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        return {
            'r': '0x' + signature['r'],
            's': '0x' + signature['s'],
            'v': 27 + signature['v'],
        };
    }

    signMessage (message, privateKey) {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signMessageString (message, privateKey) {
        // still takes the input as a hex string
        // same as above but returns a string instead of an object
        const signature = this.signMessage (message, privateKey);
        return signature['r'] + this.remove0xPrefix (signature['s']) + this.binaryToBase16 (this.numberToBE (signature['v'], 1));
    }
}
