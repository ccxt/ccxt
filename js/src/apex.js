//  ---------------------------------------------------------------------------
import { Precise } from './base/Precise.js';
import Exchange from './abstract/apex.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { ArgumentsRequired, BadRequest, ExchangeError, InvalidOrder, RateLimitExceeded } from './base/errors.js';
//  ---------------------------------------------------------------------------
/**
 * @class apex
 * @augments Exchange
 */
export default class apex extends Exchange {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'apex',
            'name': 'Apex',
            'countries': [],
            'version': 'v3',
            'rateLimit': 20,
            'certified': false,
            'pro': true,
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
                'cancelAllOrders': true,
                'cancelAllOrdersAfter': false,
                'cancelOrder': true,
                'cancelOrders': false,
                'cancelOrdersForSymbols': false,
                'closeAllPositions': false,
                'closePosition': false,
                'createMarketBuyOrderWithCost': false,
                'createMarketOrderWithCost': false,
                'createMarketSellOrderWithCost': false,
                'createOrder': true,
                'createOrders': false,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopOrder': true,
                'createTriggerOrder': true,
                'editOrder': false,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBorrowInterest': false,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchCanceledAndClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchClosedOrders': false,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDepositAddresses': false,
                'fetchDeposits': false,
                'fetchDepositWithdrawFee': false,
                'fetchDepositWithdrawFees': false,
                'fetchFundingHistory': true,
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
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyLiquidations': false,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': true,
                'fetchOpenInterestHistory': false,
                'fetchOpenInterests': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchOrderTrades': true,
                'fetchPosition': false,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPositionsRisk': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransfer': true,
                'fetchTransfers': true,
                'fetchWithdrawal': false,
                'fetchWithdrawals': false,
                'reduceMargin': false,
                'repayCrossMargin': false,
                'repayIsolatedMargin': false,
                'sandbox': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '1h': '60',
                '2h': '120',
                '4h': '240',
                '6h': '360',
                '12h': '720',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'hostname': 'omni.apex.exchange',
            'urls': {
                'logo': 'https://github.com/user-attachments/assets/fef8f2f7-4265-46aa-965e-33a91881cb00',
                'api': {
                    'public': 'https://{hostname}/api',
                    'private': 'https://{hostname}/api',
                },
                'test': {
                    'public': 'https://testnet.omni.apex.exchange/api',
                    'private': 'https://testnet.omni.apex.exchange/api',
                },
                'www': 'https://apex.exchange/',
                'doc': 'https://api-docs.pro.apex.exchange',
                'fees': 'https://apex-pro.gitbook.io/apex-pro/apex-omni-live-now/trading-perpetual-contracts/trading-fees',
                'referral': 'https://omni.apex.exchange/trade',
            },
            'api': {
                'public': {
                    'get': {
                        'v3/symbols': 1,
                        'v3/history-funding': 1,
                        'v3/ticker': 1,
                        'v3/klines': 1,
                        'v3/trades': 1,
                        'v3/depth': 1,
                        'v3/time': 1,
                        'v3/data/all-ticker-info': 1,
                    },
                },
                'private': {
                    'get': {
                        'v3/account': 1,
                        'v3/account-balance': 1,
                        'v3/fills': 1,
                        'v3/order-fills': 1,
                        'v3/order': 1,
                        'v3/history-orders': 1,
                        'v3/order-by-client-order-id': 1,
                        'v3/funding': 1,
                        'v3/historical-pnl': 1,
                        'v3/open-orders': 1,
                        'v3/transfers': 1,
                        'v3/transfer': 1,
                    },
                    'post': {
                        'v3/delete-open-orders': 1,
                        'v3/delete-client-order-id': 1,
                        'v3/delete-order': 1,
                        'v3/order': 1,
                        'v3/set-initial-margin-rate': 1,
                        'v3/transfer-out': 1,
                        'v3/contract-transfer-out': 1,
                    },
                },
            },
            'httpExceptions': {
                '403': RateLimitExceeded, // Forbidden -- You request too many times
            },
            'exceptions': {
                // Uncodumented explanation of error strings:
                // - oc_diff: order cost needed to place this order
                // - new_oc: total order cost of open orders including the order you are trying to open
                // - ob: order balance - the total cost of current open orders
                // - ab: available balance
                'exact': {
                    '20006': 'apikey sign error',
                    '20016': 'request para error',
                    '10001': BadRequest,
                },
                'broad': {
                    'ORDER_PRICE_MUST_GREETER_ZERO': InvalidOrder,
                    'ORDER_POSSIBLE_LEAD_TO_ACCOUNT_LIQUIDATED': InvalidOrder,
                    'ORDER_WITH_THIS_PRICE_CANNOT_REDUCE_POSITION_ONLY': InvalidOrder,
                },
            },
            'fees': {
                'swap': {
                    'taker': this.parseNumber('0.0005'),
                    'maker': this.parseNumber('0.0002'),
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'walletAddress': false,
                'privateKey': false,
                'password': true,
            },
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {},
            'options': {
                'defaultType': 'swap',
                'defaultSlippage': 0.05,
                'brokerId': '6956',
            },
            'features': {
                'default': {
                    'sandbox': true,
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': true,
                        'triggerPriceType': undefined,
                        'triggerDirection': false,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'IOC': true,
                            'FOK': true,
                            'PO': true,
                            'GTD': true,
                        },
                        'hedged': false,
                        'selfTradePrevention': false,
                        'trailing': true,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 500,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'symbolRequired': false,
                    },
                    'fetchOrder': {
                        'marginMode': false,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOpenOrders': {
                        'marginMode': false,
                        'limit': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 100,
                        'daysBack': 100000,
                        'untilDays': 100000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': undefined,
                    'fetchOHLCV': {
                        'limit': 200,
                    },
                },
                'swap': {
                    'linear': {
                        'extends': 'default',
                    },
                    'inverse': undefined,
                },
            },
        });
    }
    /**
     * @method
     * @name apex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-system-time-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    async fetchTime(params = {}) {
        const response = await this.publicGetV3Time(params);
        const data = this.safeDict(response, 'data', {});
        //
        // {
        //    "data": {
        //    "time": 1738837534454
        //     }
        // }
        return this.safeInteger(data, 'time');
    }
    parseBalance(response) {
        //
        // {
        //     "totalEquityValue": "100.000000",
        //     "availableBalance": "100.000000",
        //     "initialMargin": "100.000000",
        //     "maintenanceMargin": "100.000000",
        //     "symbolToOraclePrice": {
        //     "BTC-USDC": {
        //         "oraclePrice": "20000",
        //             "createdTime": 124566
        //     }
        // }
        // }
        //
        const timestamp = this.milliseconds();
        const result = {
            'info': response,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
        };
        const code = 'USDT';
        const account = this.account();
        account['free'] = this.safeString(response, 'availableBalance');
        account['total'] = this.safeString(response, 'totalEquityValue');
        result[code] = account;
        return this.safeBalance(result);
    }
    /**
     * @method
     * @name apex#fetchBalance
     * @description query for account info
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV3AccountBalance(params);
        const data = this.safeDict(response, 'data', {});
        return this.parseBalance(data);
    }
    parseAccount(account) {
        const accountId = this.safeString(account, 'id', '0');
        return {
            'id': accountId,
            'type': undefined,
            'code': undefined,
            'info': account,
        };
    }
    /**
     * @method
     * @name apex#fetchAccount
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchAccount(params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV3Account(params);
        const data = this.safeDict(response, 'data', {});
        return this.parseAccount(data);
    }
    /**
     * @method
     * @name apex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    async fetchCurrencies(params = {}) {
        const response = await this.publicGetV3Symbols(params);
        const data = this.safeDict(response, 'data', {});
        const spotConfig = this.safeDict(data, 'spotConfig', {});
        const multiChain = this.safeDict(spotConfig, 'multiChain', {});
        // "spotConfig": {
        //     "assets": [
        //         {
        //             "tokenId": "141",
        //             "token": "USDT",
        //             "displayName": "Tether USD Coin",
        //             "decimals": 18,
        //             "showStep": "0.01",
        //             "iconUrl": "https://static-pro.apex.exchange/chains/chain_tokens/Ethereum/Ethereum_USDT.svg",
        //             "l2WithdrawFee": "0",
        //             "enableCollateral": true,
        //             "enableCrossCollateral": false,
        //             "crossCollateralDiscountRate": null,
        //             "isGray": false
        //         }
        //     ],
        // "multiChain": {
        //  "chains": [
        //      {
        //          "chain": "Arbitrum One",
        //          "chainId": "9",
        //          "chainType": "0",
        //          "l1ChainId": "42161",
        //          "chainIconUrl": "https://static-pro.apex.exchange/chains/chain_logos/Arbitrum.svg",
        //          "contractAddress": "0x3169844a120c0f517b4eb4a750c08d8518c8466a",
        //          "swapContractAddress": "0x9e07b6Aef1bbD9E513fc2Eb8873e311E80B4f855",
        //          "stopDeposit": false,
        //          "feeLess": false,
        //          "gasLess": false,
        //          "gasToken": "ETH",
        //          "dynamicFee": true,
        //          "gasTokenDecimals": 18,
        //          "feeGasLimit": 300000,
        //          "blockTimeSeconds": 2,
        //          "rpcUrl": "https://arb.pro.apex.exchange",
        //          "minSwapUsdtAmount": "",
        //          "maxSwapUsdtAmount": "",
        //          "webRpcUrl": "https://arb.pro.apex.exchange",
        //          "webTxUrl": "https://arbiscan.io/tx/",
        //          "backupRpcUrl": "https://arb-mainnet.g.alchemy.com/v2/rGlYUbRHtUav5mfeThCPtsV9GLPt2Xq5",
        //          "txConfirm": 20,
        //          "withdrawGasFeeLess": false,
        //          "tokens": [
        //              {
        //                  "decimals": 6,
        //                  "iconUrl": "https://static-pro.apex.exchange/chains/chain_tokens/Arbitrum/Arbitrum_USDT.svg",
        //                  "token": "USDT",
        //                  "tokenAddress": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        //                  "pullOff": false,
        //                  "withdrawEnable": true,
        //                  "slippage": "",
        //                  "isDefaultToken": false,
        //                  "displayToken": "USDT",
        //                  "needResetApproval": true,
        //                  "minFee": "2",
        //                  "maxFee": "40",
        //                  "feeRate": "0.0001",
        //                  "maxWithdraw": "",
        //                  "minDeposit": "",
        //                  "minWithdraw": "",
        //                  "maxFastWithdrawAmount": "40000",
        //                  "minFastWithdrawAmount": "1",
        //                  "isGray": false
        //              },
        //              {
        //                  "decimals": 6,
        //                  "iconUrl": "https://static-pro.apex.exchange/chains/chain_tokens/Arbitrum/Arbitrum_USDC.svg",
        //                  "token": "USDC",
        //                  "tokenAddress": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        //                  "pullOff": false,
        //                  "withdrawEnable": true,
        //                  "slippage": "",
        //                  "isDefaultToken": false,
        //                  "displayToken": "USDC",
        //                  "needResetApproval": true,
        //                  "minFee": "2",
        //                  "maxFee": "20",
        //                  "feeRate": "0.0001",
        //                  "maxWithdraw": "",
        //                  "minDeposit": "",
        //                  "minWithdraw": "",
        //                  "maxFastWithdrawAmount": "1",
        //                  "minFastWithdrawAmount": "1",
        //                  "isGray": false
        //              }
        //          ]
        //        }
        //     ]
        // }
        const rows = this.safeList(spotConfig, 'assets', []);
        const chains = this.safeList(multiChain, 'chains', []);
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const currency = rows[i];
            const currencyId = this.safeString(currency, 'token');
            const code = this.safeCurrencyCode(currencyId);
            const name = this.safeString(currency, 'displayName');
            const networks = {};
            for (let j = 0; j < chains.length; j++) {
                const chain = chains[j];
                const tokens = this.safeList(chain, 'tokens', []);
                for (let f = 0; f < tokens.length; f++) {
                    const token = tokens[f];
                    const tokenName = this.safeString(token, 'token');
                    if (tokenName === currencyId) {
                        const networkId = this.safeString(chain, 'chainId');
                        const networkCode = this.networkIdToCode(networkId);
                        networks[networkCode] = {
                            'info': chain,
                            'id': networkId,
                            'network': networkCode,
                            'active': undefined,
                            'deposit': !this.safeBool(chain, 'depositDisable'),
                            'withdraw': this.safeBool(token, 'withdrawEnable'),
                            'fee': this.safeNumber(token, 'minFee'),
                            'precision': this.parseNumber(this.parsePrecision(this.safeString(token, 'decimals'))),
                            'limits': {
                                'withdraw': {
                                    'min': this.safeNumber(token, 'minWithdraw'),
                                    'max': undefined,
                                },
                                'deposit': {
                                    'min': this.safeNumber(chain, 'minDeposit'),
                                    'max': undefined,
                                },
                            },
                        };
                    }
                }
            }
            const networkKeys = Object.keys(networks);
            const networksLength = networkKeys.length;
            const emptyChains = networksLength === 0; // non-functional coins
            const valueForEmpty = emptyChains ? false : undefined;
            result[code] = this.safeCurrencyStructure({
                'info': currency,
                'code': code,
                'id': currencyId,
                'type': 'crypto',
                'name': name,
                'active': undefined,
                'deposit': valueForEmpty,
                'withdraw': valueForEmpty,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'networks': networks,
            });
        }
        return result;
    }
    /**
     * @method
     * @name apex#fetchMarkets
     * @description retrieves data on all markets for apex
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-all-config-data-v3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets(params = {}) {
        const response = await this.publicGetV3Symbols(params);
        const data = this.safeDict(response, 'data', {});
        const contractConfig = this.safeDict(data, 'contractConfig', {});
        const perpetualContract = this.safeList(contractConfig, 'perpetualContract', []);
        // {
        //     "perpetualContract":[
        //         {
        //             "baselinePositionValue": "50000.0000",
        //             "crossId": 30002,
        //             "crossSymbolId": 10,
        //             "crossSymbolName": "BTCUSDT",
        //             "digitMerge": "0.1,0.2,0.4,1,2",
        //             "displayMaxLeverage": "100",
        //             "displayMinLeverage": "1",
        //             "enableDisplay": true,
        //             "enableOpenPosition": true,
        //             "enableTrade": true,
        //             "fundingImpactMarginNotional": "6",
        //             "fundingInterestRate": "0.0003",
        //             "incrementalInitialMarginRate": "0.00250",
        //             "incrementalMaintenanceMarginRate": "0.00100",
        //             "incrementalPositionValue": "50000.0000",
        //             "initialMarginRate": "0.01",
        //             "maintenanceMarginRate": "0.005",
        //             "maxOrderSize": "50",
        //             "maxPositionSize": "100",
        //             "minOrderSize": "0.0010",
        //             "maxMarketPriceRange": "0.025",
        //             "settleAssetId": "USDT",
        //             "baseTokenId": "BTC",
        //             "stepSize": "0.001",
        //             "symbol": "BTC-USDT",
        //             "symbolDisplayName": "BTCUSDT",
        //             "tickSize": "0.1",
        //             "maxMaintenanceMarginRate": "0.5000",
        //             "maxPositionValue": "5000000.0000",
        //             "tagIconUrl": "https://static-pro.apex.exchange/icon/LABLE_HOT.svg",
        //             "tag": "HOT",
        //             "riskTip": false,
        //             "defaultInitialMarginRate": "0.05",
        //             "klineStartTime": 0,
        //             "maxMarketSizeBuffer": "0.98",
        //             "enableFundingSettlement": true,
        //             "indexPriceDecimals": 2,
        //             "indexPriceVarRate": "0.001",
        //             "openPositionOiLimitRate": "0.05",
        //             "fundingMaxRate": "0.000234",
        //             "fundingMinRate": "-0.000234",
        //             "fundingMaxValue": "",
        //             "enableFundingMxValue": true,
        //             "l2PairId": "50001",
        //             "settleTimeStamp": 0,
        //             "isPrelaunch": false,
        //             "riskLimitConfig": {},
        //             "category": "L1"
        //         }
        //     ]
        // }
        return this.parseMarkets(perpetualContract);
    }
    parseMarket(market) {
        const id = this.safeString(market, 'symbol');
        const id2 = this.safeString(market, 'crossSymbolName');
        const quoteId = this.safeString(market, 'l2PairId');
        const baseId = this.safeString(market, 'baseTokenId');
        const quote = this.safeString(market, 'settleAssetId');
        const base = this.safeCurrencyCode(baseId);
        const settleId = this.safeString(market, 'settleAssetId');
        const settle = this.safeCurrencyCode(settleId);
        const symbol = baseId + '/' + quote + ':' + settle;
        const expiry = 0;
        const takerFee = this.parseNumber('0.0002');
        const makerFee = this.parseNumber('0.0005');
        return this.safeMarketStructure({
            'id': id,
            'id2': id2,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': 'swap',
            'spot': false,
            'margin': undefined,
            'swap': true,
            'future': false,
            'option': false,
            'active': this.safeBool(market, 'enableTrade'),
            'contract': true,
            'linear': true,
            'inverse': false,
            'taker': takerFee,
            'maker': makerFee,
            'contractSize': this.safeNumber(market, 'minOrderSize'),
            'expiry': (expiry === 0) ? undefined : expiry,
            'expiryDatetime': (expiry === 0) ? undefined : this.iso8601(expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.safeNumber(market, 'stepSize'),
                'price': this.safeNumber(market, 'tickSize'),
            },
            'limits': {
                'leverage': {
                    'min': this.safeNumber(market, 'displayMinLeverage'),
                    'max': this.safeNumber(market, 'displayMaxLeverage'),
                },
                'amount': {
                    'min': this.safeNumber(market, 'minOrderSize'),
                    'max': this.safeNumber(market, 'maxOrderSize'),
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
        });
    }
    parseTicker(ticker, market = undefined) {
        //
        // {
        //     "symbol": "BTCUSDT",
        //     "price24hPcnt": "0.450141",
        //     "lastPrice": "43511.50",
        //     "highPrice24h": "43513.50",
        //     "lowPrice24h": "29996.00",
        //     "markPrice": "43513.50",
        //     "indexPrice": "40828.94",
        //     "openInterest": "2036854775808",
        //     "turnover24h": "5626085.23749999",
        //     "volume24h": "169.317",
        //     "fundingRate": "0",
        //     "predictedFundingRate": "0",
        //     "nextFundingTime": "10:00:00",
        //     "tradeCount": 100
        // }
        //
        const timestamp = this.milliseconds();
        const marketId = this.safeString(ticker, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        const last = this.safeString(ticker, 'lastPrice');
        const percentage = this.safeString(ticker, 'price24hPcnt');
        const quoteVolume = this.safeString(ticker, 'turnover24h');
        const baseVolume = this.safeString(ticker, 'volume24h');
        const high = this.safeString(ticker, 'highPrice24h');
        const low = this.safeString(ticker, 'lowPrice24h');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': high,
            'low': low,
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'markPrice': this.safeString(ticker, 'markPrice'),
            'indexPrice': this.safeString(ticker, 'indexPrice'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name apex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id2'],
        };
        const response = await this.publicGetV3Ticker(this.extend(request, params));
        const tickers = this.safeList(response, 'data', []);
        const rawTicker = this.safeDict(tickers, 0, {});
        return this.parseTicker(rawTicker, market);
    }
    /**
     * @method
     * @name apex#fetchTickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.publicGetV3DataAllTickerInfo(params);
        const tickers = this.safeList(response, 'data', []);
        return this.parseTickers(tickers, symbols);
    }
    /**
     * @method
     * @name apex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-candlestick-chart-data-v3
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        let request = {
            'interval': this.safeString(this.timeframes, timeframe, timeframe),
            'symbol': market['id2'],
        };
        if (limit === undefined) {
            limit = 200; // default is 200 when requested with `since`
        }
        request['limit'] = limit; // max 200, default 200
        [request, params] = this.handleUntilOption('end', request, params);
        if (since !== undefined) {
            request['start'] = since;
        }
        const response = await this.publicGetV3Klines(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const OHLCVs = this.safeList(data, market['id2'], []);
        return this.parseOHLCVs(OHLCVs, market, timeframe, since, limit);
    }
    parseOHLCV(ohlcv, market = undefined) {
        //
        //  {
        //     "start": 1647511440000,
        //     "symbol": "BTC-USD",
        //     "interval": "1",
        //     "low": "40000",
        //     "high": "45000",
        //     "open": "45000",
        //     "close": "40000",
        //     "volume": "1.002",
        //     "turnover": "3"
        //  } {"s":"BTCUSDT","i":"1","t":1741265880000,"c":"90235","h":"90235","l":"90156","o":"90156","v":"0.052","tr":"4690.4466"}
        //
        return [
            this.safeIntegerN(ohlcv, ['start', 't']),
            this.safeNumberN(ohlcv, ['open', 'o']),
            this.safeNumberN(ohlcv, ['high', 'h']),
            this.safeNumberN(ohlcv, ['low', 'l']),
            this.safeNumberN(ohlcv, ['close', 'c']),
            this.safeNumberN(ohlcv, ['volume', 'v']),
        ];
    }
    /**
     * @method
     * @name apex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-market-depth-v3
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook(symbol, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id2'],
        };
        if (limit === undefined) {
            limit = 100; // default is 200 when requested with `since`
        }
        request['limit'] = limit; // max 100, default 100
        const response = await this.publicGetV3Depth(this.extend(request, params));
        //
        // {
        //     "a": [
        //     [
        //         "96576.3",
        //         "0.399"
        //     ],
        //     [
        //         "96577.6",
        //         "0.106"
        //     ]
        // ],
        //     "b": [
        //     [
        //         "96565.2",
        //         "0.131"
        //     ],
        //     [
        //         "96565.1",
        //         "0.038"
        //     ]
        // ],
        //     "s": "BTCUSDT",
        //     "u": 18665465
        // }
        //
        const data = this.safeDict(response, 'data', {});
        const timestamp = this.milliseconds();
        const orderbook = this.parseOrderBook(data, market['symbol'], timestamp, 'b', 'a');
        orderbook['nonce'] = this.safeInteger(data, 'u');
        return orderbook;
    }
    /**
     * @method
     * @name apex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-newest-trading-data-v3
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id2'],
        };
        if (limit === undefined) {
            limit = 500; // default is 50
        }
        request['limit'] = limit;
        const response = await this.publicGetV3Trades(this.extend(request, params));
        //
        // [
        //  {
        //      "i": "993f7f85-9215-5723-9078-2186ae140847",
        //      "p": "96534.3",
        //      "S": "Sell",
        //      "v": "0.261",
        //      "s": "BTCUSDT",
        //      "T": 1739118072710
        //  },
        //  {
        //      "i": "c947c9cf-8c18-5784-89c3-91bdf86ddde8",
        //      "p": "96513.5",
        //      "S": "Sell",
        //      "v": "0.042",
        //      "s": "BTCUSDT",
        //      "T": 1739118075944
        //  }
        //  ]
        //
        const trades = this.safeList(response, 'data', []);
        return this.parseTrades(trades, market, since, limit);
    }
    parseTrade(trade, market = undefined) {
        //
        // [
        //  {
        //      "i": "993f7f85-9215-5723-9078-2186ae140847",
        //      "p": "96534.3",
        //      "S": "Sell",
        //      "v": "0.261",
        //      "s": "BTCUSDT",
        //      "T": 1739118072710
        //  }
        //  ]
        //
        const marketId = this.safeStringN(trade, ['s', 'symbol']);
        market = this.safeMarket(marketId, market);
        const id = this.safeStringN(trade, ['i', 'id']);
        const timestamp = this.safeIntegerN(trade, ['t', 'T', 'createdAt']);
        const priceString = this.safeStringN(trade, ['p', 'price']);
        const amountString = this.safeStringN(trade, ['v', 'size']);
        const side = this.safeStringLowerN(trade, ['S', 'side']);
        const type = this.safeStringN(trade, ['type']);
        const fee = this.safeStringN(trade, ['fee']);
        return this.safeTrade({
            'info': trade,
            'id': id,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'symbol': market['symbol'],
            'type': type,
            'takerOrMaker': undefined,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': fee,
        }, market);
    }
    /**
     * @method
     * @name apex#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-ticker-data-v3
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    async fetchOpenInterest(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const request = {
            'symbol': market['id2'],
        };
        const response = await this.publicGetV3Ticker(this.extend(request, params));
        const tickers = this.safeList(response, 'data', []);
        const rawTicker = this.safeDict(tickers, 0, {});
        return this.parseOpenInterest(rawTicker, market);
    }
    parseOpenInterest(interest, market = undefined) {
        //
        // {
        //     "symbol": "BTCUSDT",
        //     "price24hPcnt": "0.450141",
        //     "lastPrice": "43511.50",
        //     "highPrice24h": "43513.50",
        //     "lowPrice24h": "29996.00",
        //     "markPrice": "43513.50",
        //     "indexPrice": "40828.94",
        //     "openInterest": "2036854775808",
        //     "turnover24h": "5626085.23749999",
        //     "volume24h": "169.317",
        //     "fundingRate": "0",
        //     "predictedFundingRate": "0",
        //     "nextFundingTime": "10:00:00",
        //     "tradeCount": 100
        // }
        //
        const timestamp = this.milliseconds();
        const marketId = this.safeString(interest, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeSymbol(marketId, market);
        return this.safeOpenInterest({
            'symbol': symbol,
            'openInterestAmount': this.safeString(interest, 'openInterest'),
            'openInterestValue': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'info': interest,
        }, market);
    }
    /**
     * @method
     * @name apex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.pro.apex.exchange/#publicapi-v3-for-omni-get-funding-rate-history-v3
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    async fetchFundingRateHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets();
        const request = {};
        const market = this.market(symbol);
        request['symbol'] = market['id'];
        if (since !== undefined) {
            request['beginTimeInclusive'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const page = this.safeInteger(params, 'page');
        if (page !== undefined) {
            request['page'] = page;
        }
        const endTimeExclusive = this.safeIntegerN(params, ['endTime', 'endTimeExclusive', 'until']);
        if (endTimeExclusive !== undefined) {
            request['endTimeExclusive'] = endTimeExclusive;
        }
        const response = await this.publicGetV3HistoryFunding(this.extend(request, params));
        //
        // {
        //     "historyFunds": [
        //     {
        //         "symbol": "BTC-USD",
        //         "rate": "0.0000125000",
        //         "price": "31297.5000008009374142",
        //         "fundingTime": 12315555,
        //         "fundingTimestamp": 12315555
        //     }
        // ],
        //     "totalSize": 11
        // }
        //
        const rates = [];
        const data = this.safeDict(response, 'data', {});
        const resultList = this.safeList(data, 'historyFunds', []);
        for (let i = 0; i < resultList.length; i++) {
            const entry = resultList[i];
            const timestamp = this.safeInteger(entry, 'fundingTimestamp');
            const marketId = this.safeString(entry, 'symbol');
            rates.push({
                'info': entry,
                'symbol': this.safeSymbol(marketId, market),
                'fundingRate': this.safeNumber(entry, 'rate'),
                'timestamp': timestamp,
                'datetime': this.iso8601(timestamp),
            });
        }
        const sorted = this.sortBy(rates, 'timestamp');
        return this.filterBySymbolSinceLimit(sorted, symbol, since, limit);
    }
    parseOrder(order, market = undefined) {
        //
        // {
        //     "id": "1234",
        //     "clientId": "1234",
        //     "accountId": "12345",
        //     "symbol": "BTC-USD",
        //     "side": "SELL",
        //     "price": "18000",
        //     "limitFee": "100",
        //     "fee": "100",
        //     "triggerPrice": "1.2",
        //     "trailingPercent": "0.12",
        //     "size": "100",
        //     "remainingSize": "100",
        //     "type": "LIMIT",
        //     "createdAt": 1647502440973,
        //     "updatedTime": 1647502440973,
        //     "expiresAt": 1647502440973,
        //     "status": "PENDING",
        //     "timeInForce": "GOOD_TIL_CANCEL",
        //     "postOnly": false,
        //     "reduceOnly": false,
        //     "stopPnl": false,
        //     "latestMatchFillPrice": "reason",
        //     "cumMatchFillSize": "0.1",
        //     "cumMatchFillValue": "1000",
        //     "cumMatchFillFee": "1",
        //     "cumSuccessFillSize": "0.1",
        //     "cumSuccessFillValue": "1000",
        //     "cumSuccessFillFee": "1",
        //     "triggerPriceType": "INDEX",
        //     "isOpenTpslOrder": true,
        //     "isSetOpenTp": true,
        //     "isSetOpenSl": false,
        //     "openTpParam": {
        //     "side": "SELL",
        //         "price": "18000",
        //         "limitFee": "100",
        //         "clientOrderId": "111100",
        //         "triggerPrice": "1.2",
        //         "trailingPercent": "0.12",
        //         "size": "100"
        // },
        //     "openSlParam": {
        //     "side": "SELL",
        //         "price": "18000",
        //         "limitFee": "100",
        //         "clientOrderId": "111100",
        //         "triggerPrice": "1.2",
        //         "trailingPercent": "0.12",
        //         "size": "100"
        // }
        // }
        //
        const timestamp = this.safeInteger(order, 'createdAt');
        const orderId = this.safeString(order, 'id');
        const clientOrderId = this.safeString(order, 'clientId');
        const marketId = this.safeString(order, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString(order, 'price');
        const amount = this.safeString(order, 'size');
        const orderType = this.safeString(order, 'type');
        const status = this.safeString(order, 'status');
        const side = this.safeStringLower(order, 'side');
        // const average = this.omitZero (this.safeString (order, 'avg_fill_price'));
        const remaining = this.omitZero(this.safeString(order, 'remainingSize'));
        const lastUpdateTimestamp = this.safeInteger(order, 'updatedTime');
        return this.safeOrder({
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': lastUpdateTimestamp,
            'status': this.parseOrderStatus(status),
            'symbol': symbol,
            'type': this.parseOrderType(orderType),
            'timeInForce': this.parseTimeInForce(this.safeString(order, 'timeInForce')),
            'postOnly': this.safeBool(order, 'postOnly'),
            'reduceOnly': this.safeBool(order, 'reduceOnly'),
            'side': side,
            'price': price,
            'triggerPrice': this.safeString(order, 'triggerPrice'),
            'takeProfitPrice': undefined,
            'stopLossPrice': undefined,
            'average': undefined,
            'amount': amount,
            'filled': undefined,
            'remaining': remaining,
            'cost': undefined,
            'trades': undefined,
            'fee': {
                'cost': this.safeString(order, 'fee'),
                'currency': market['settleId'],
            },
            'info': order,
        }, market);
    }
    parseTimeInForce(timeInForce) {
        const timeInForces = {
            'GOOD_TIL_CANCEL': 'GOOD_TIL_CANCEL',
            'FILL_OR_KILL': 'FILL_OR_KILL',
            'IMMEDIATE_OR_CANCEL': 'IMMEDIATE_OR_CANCEL',
            'POST_ONLY': 'POST_ONLY',
        };
        return this.safeString(timeInForces, timeInForce, undefined);
    }
    parseOrderStatus(status) {
        if (status !== undefined) {
            const statuses = {
                'PENDING': 'open',
                'OPEN': 'open',
                'FILLED': 'filled',
                'CANCELING': 'canceled',
                'CANCELED': 'canceled',
                'UNTRIGGERED': 'open',
            };
            return this.safeString(statuses, status, status);
        }
        return status;
    }
    parseOrderType(type) {
        const types = {
            'LIMIT': 'LIMIT',
            'MARKET': 'MARKET',
            'STOP_LIMIT': 'STOP_LIMIT',
            'STOP_MARKET': 'STOP_MARKET',
            'TAKE_PROFIT_LIMIT': 'TAKE_PROFIT_LIMIT',
            'TAKE_PROFIT_MARKET': 'TAKE_PROFIT_MARKET',
        };
        return this.safeStringUpper(types, type, type);
    }
    safeMarket(marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        if (market === undefined && marketId !== undefined) {
            if (marketId in this.markets) {
                market = this.markets[marketId];
            }
            else if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
            else {
                const newMarketId = this.addHyphenBeforeUsdt(marketId);
                if (newMarketId in this.markets_by_id) {
                    const markets = this.markets_by_id[newMarketId];
                    const numMarkets = markets.length;
                    if (numMarkets > 0) {
                        if (this.markets_by_id[newMarketId][0]['id2'] === marketId) {
                            market = this.markets_by_id[newMarketId][0];
                        }
                    }
                }
            }
        }
        return super.safeMarket(marketId, market, delimiter, marketType);
    }
    generateRandomClientIdOmni(_accountId) {
        const accountId = _accountId || this.randNumber(12).toString();
        return 'apexomni-' + accountId + '-' + this.milliseconds().toString() + '-' + this.randNumber(6).toString();
    }
    addHyphenBeforeUsdt(symbol) {
        const uppercaseSymbol = symbol.toUpperCase();
        const index = uppercaseSymbol.indexOf('USDT');
        const symbolChar = this.safeString(symbol, index - 1);
        if (index > 0 && symbolChar !== '-') {
            return symbol.slice(0, index) + '-' + symbol.slice(index);
        }
        return symbol;
    }
    getSeeds() {
        const seeds = this.safeString(this.options, 'seeds');
        if (seeds === undefined) {
            throw new ArgumentsRequired(this.id + ' the "seeds" key is required in the options to access private endpoints. You can find it in API Management > Omni Key, and then set it as exchange.options["seeds"] = XXXX');
        }
        return seeds;
    }
    async getAccountId() {
        const accountId = this.safeString(this.options, 'accountId', '0');
        if (accountId === '0') {
            const accountData = await this.fetchAccount();
            this.options['accountId'] = this.safeString(accountData, 'id', '0');
        }
        return this.options['accountId'];
    }
    /**
     * @method
     * @name apex#createOrder
     * @description create a trade order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-creating-orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const orderType = type.toUpperCase();
        const orderSide = side.toUpperCase();
        const orderSize = this.amountToPrecision(symbol, amount);
        let orderPrice = '0';
        if (price !== undefined) {
            orderPrice = this.priceToPrecision(symbol, price);
        }
        const fees = this.safeDict(this.fees, 'swap', {});
        const taker = this.safeNumber(fees, 'taker', 0.0005);
        const maker = this.safeNumber(fees, 'maker', 0.0002);
        const limitFee = this.decimalToPrecision(Precise.stringAdd(Precise.stringMul(Precise.stringMul(orderPrice, orderSize), taker.toString()), market['precision']['price'].toString()), TRUNCATE, market['precision']['price'], this.precisionMode, this.paddingMode);
        const timeNow = this.milliseconds();
        // const triggerPrice = this.safeString2 (params, 'triggerPrice', 'stopPrice');
        const isMarket = orderType === 'MARKET';
        if (isMarket && (price === undefined)) {
            throw new ArgumentsRequired(this.id + ' createOrder() requires a price argument for market orders');
        }
        let timeInForce = this.safeStringUpper(params, 'timeInForce');
        const postOnly = this.isPostOnly(isMarket, undefined, params);
        if (timeInForce === undefined) {
            timeInForce = 'GOOD_TIL_CANCEL';
        }
        if (!isMarket) {
            if (postOnly) {
                timeInForce = 'POST_ONLY';
            }
            else if (timeInForce === 'ioc') {
                timeInForce = 'IMMEDIATE_OR_CANCEL';
            }
        }
        params = this.omit(params, 'timeInForce');
        params = this.omit(params, 'postOnly');
        let clientOrderId = this.safeStringN(params, ['clientId', 'clientOrderId', 'client_order_id']);
        const accountId = await this.getAccountId();
        if (clientOrderId === undefined) {
            clientOrderId = this.generateRandomClientIdOmni(accountId);
        }
        params = this.omit(params, ['clientId', 'clientOrderId', 'client_order_id']);
        const orderToSign = {
            'accountId': accountId,
            'slotId': clientOrderId,
            'nonce': clientOrderId,
            'pairId': market['quoteId'],
            'size': orderSize,
            'price': orderPrice,
            'direction': orderSide,
            'makerFeeRate': maker.toString(),
            'takerFeeRate': taker.toString(),
        };
        const signature = await this.getZKContractSignatureObj(this.remove0xPrefix(this.getSeeds()), orderToSign);
        const request = {
            'symbol': market['id'],
            'side': orderSide,
            'type': orderType,
            'size': orderSize,
            'price': orderPrice,
            'limitFee': limitFee,
            'expiration': Math.floor(timeNow / 1000 + 30 * 24 * 60 * 60),
            'timeInForce': timeInForce,
            'clientId': clientOrderId,
            'brokerId': this.safeString(this.options, 'brokerId', '6956'),
        };
        request['signature'] = signature;
        const response = await this.privatePostV3Order(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data, market);
    }
    /**
     * @method
     * @name apex#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferId] UUID, which is unique across the platform
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    async transfer(code, amount, fromAccount, toAccount, params = {}) {
        await this.loadMarkets();
        const configResponse = await this.publicGetV3Symbols(params);
        const configData = this.safeDict(configResponse, 'data', {});
        const contractConfig = this.safeDict(configData, 'contractConfig', {});
        const contractAssets = this.safeList(contractConfig, 'assets', []);
        const spotConfig = this.safeDict(configData, 'spotConfig', {});
        const spotAssets = this.safeList(spotConfig, 'assets', []);
        const globalConfig = this.safeDict(spotConfig, 'global', {});
        const receiverAddress = this.safeString(globalConfig, 'contractAssetPoolEthAddress', '');
        const receiverZkAccountId = this.safeString(globalConfig, 'contractAssetPoolZkAccountId', '');
        const receiverSubAccountId = this.safeString(globalConfig, 'contractAssetPoolSubAccount', '');
        const receiverAccountId = this.safeString(globalConfig, 'contractAssetPoolAccountId', '');
        const accountResponse = await this.privateGetV3Account(params);
        const accountData = this.safeDict(accountResponse, 'data', {});
        const spotAccount = this.safeDict(accountData, 'spotAccount', {});
        const zkAccountId = this.safeString(spotAccount, 'zkAccountId', '');
        const subAccountId = this.safeString(spotAccount, 'defaultSubAccountId', '0');
        const subAccounts = this.safeList(spotAccount, 'subAccounts', []);
        let nonce = '0';
        if (subAccounts.length > 0) {
            nonce = this.safeString(subAccounts[0], 'nonce', '0');
        }
        const ethAddress = this.safeString(accountData, 'ethereumAddress', '');
        const accountId = this.safeString(accountData, 'id', '');
        let currency = {};
        let assets = [];
        if (fromAccount !== undefined && fromAccount.toLowerCase() === 'contract') {
            assets = contractAssets;
        }
        else {
            assets = spotAssets;
        }
        for (let i = 0; i < assets.length; i++) {
            if (this.safeString(assets[i], 'token', '') === code) {
                currency = assets[i];
            }
        }
        const tokenId = this.safeString(currency, 'tokenId', '');
        const amountNumber = this.parseToInt(amount * (Math.pow(10, this.safeNumber(currency, 'decimals', 0))));
        const timestampSeconds = this.parseToInt(this.milliseconds() / 1000);
        let clientOrderId = this.safeStringN(params, ['clientId', 'clientOrderId', 'client_order_id']);
        if (clientOrderId === undefined) {
            clientOrderId = this.generateRandomClientIdOmni(this.safeString(this.options, 'accountId'));
        }
        params = this.omit(params, ['clientId', 'clientOrderId', 'client_order_id']);
        if (fromAccount !== undefined && fromAccount.toLowerCase() === 'contract') {
            const formattedUint32 = '4294967295';
            const zkSignAccountId = Precise.stringMod(accountId, formattedUint32);
            const expireTime = timestampSeconds + 3600 * 24 * 28;
            const orderToSign = {
                'zkAccountId': zkSignAccountId,
                'receiverAddress': ethAddress,
                'subAccountId': subAccountId,
                'receiverSubAccountId': subAccountId,
                'tokenId': tokenId,
                'amount': amountNumber.toString(),
                'fee': '0',
                'nonce': clientOrderId,
                'timestampSeconds': expireTime,
                'isContract': true,
            };
            const signature = await this.getZKTransferSignatureObj(this.remove0xPrefix(this.getSeeds()), orderToSign);
            const request = {
                'amount': amount,
                'expireTime': expireTime,
                'clientWithdrawId': clientOrderId,
                'signature': signature,
                'token': code,
                'ethAddress': ethAddress,
            };
            const response = await this.privatePostV3ContractTransferOut(this.extend(request, params));
            const data = this.safeDict(response, 'data', {});
            const currentTime = this.milliseconds();
            return this.extend(this.parseTransfer(data, this.currency(code)), {
                'timestamp': currentTime,
                'datetime': this.iso8601(currentTime),
                'amount': this.parseNumber(amount),
                'fromAccount': 'contract',
                'toAccount': 'spot',
            });
        }
        else {
            const orderToSign = {
                'zkAccountId': zkAccountId,
                'receiverAddress': receiverAddress,
                'subAccountId': subAccountId,
                'receiverSubAccountId': receiverSubAccountId,
                'tokenId': tokenId,
                'amount': amountNumber.toString(),
                'fee': '0',
                'nonce': nonce,
                'timestampSeconds': timestampSeconds,
            };
            const signature = await this.getZKTransferSignatureObj(this.remove0xPrefix(this.getSeeds()), orderToSign);
            const request = {
                'amount': amount.toString(),
                'timestamp': timestampSeconds,
                'clientTransferId': clientOrderId,
                'signature': signature,
                'zkAccountId': zkAccountId,
                'subAccountId': subAccountId,
                'fee': '0',
                'token': code,
                'tokenId': tokenId,
                'receiverAccountId': receiverAccountId,
                'receiverZkAccountId': receiverZkAccountId,
                'receiverSubAccountId': receiverSubAccountId,
                'receiverAddress': receiverAddress,
                'nonce': nonce,
            };
            const response = await this.privatePostV3TransferOut(this.extend(request, params));
            const data = this.safeDict(response, 'data', {});
            const currentTime = this.milliseconds();
            return this.extend(this.parseTransfer(data, this.currency(code)), {
                'timestamp': currentTime,
                'datetime': this.iso8601(currentTime),
                'amount': this.parseNumber(amount),
                'fromAccount': 'spot',
                'toAccount': 'contract',
            });
        }
    }
    parseTransfer(transfer, currency = undefined) {
        const currencyId = this.safeString(transfer, 'coin');
        const timestamp = this.safeInteger(transfer, 'timestamp');
        const fromAccount = this.safeString(transfer, 'fromAccount');
        const toAccount = this.safeString(transfer, 'toAccount');
        return {
            'info': transfer,
            'id': this.safeStringN(transfer, ['transferId', 'id']),
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'currency': this.safeCurrencyCode(currencyId, currency),
            'amount': this.safeNumber(transfer, 'amount'),
            'fromAccount': fromAccount,
            'toAccount': toAccount,
            'status': this.safeString(transfer, 'status'),
        };
    }
    /**
     * @method
     * @name apex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-cancel-all-open-orders
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {};
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.privatePostV3DeleteOpenOrders(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return data;
    }
    /**
     * @method
     * @name apex#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-cancel-order
     * @param {string} id order id
     * @param symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder(id, symbol = undefined, params = {}) {
        const request = {};
        const clientOrderId = this.safeStringN(params, ['clientId', 'clientOrderId', 'client_order_id']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['id'] = clientOrderId;
            params = this.omit(params, ['clientId', 'clientOrderId', 'client_order_id']);
            response = await this.privatePostV3DeleteClientOrderId(this.extend(request, params));
        }
        else {
            request['id'] = id;
            response = await this.privatePostV3DeleteOrder(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        return data;
    }
    /**
     * @method
     * @name apex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-order-id
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-order-by-clientorderid
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeStringN(params, ['clientId', 'clientOrderId', 'client_order_id']);
        let response = undefined;
        if (clientOrderId !== undefined) {
            request['id'] = clientOrderId;
            params = this.omit(params, ['clientId', 'clientOrderId', 'client_order_id']);
            response = await this.privateGetV3OrderByClientOrderId(this.extend(request, params));
        }
        else {
            request['id'] = id;
            response = await this.privateGetV3Order(this.extend(request, params));
        }
        const data = this.safeDict(response, 'data', {});
        return this.parseOrder(data);
    }
    /**
     * @method
     * @name apex#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV3OpenOrders(params);
        const orders = this.safeList(response, 'data', []);
        return this.parseOrders(orders, undefined, since, limit);
    }
    /**
     * @method
     * @name apex#fetchOrders
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-all-order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.status] "PENDING", "OPEN", "FILLED", "CANCELED", "EXPIRED", "UNTRIGGERED"
     * @param {boolean} [params.side] BUY or SELL
     * @param {string} [params.type] "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
     * @param {string} [params.orderType] "ACTIVE","CONDITION","HISTORY"
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTimeInclusive'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const endTimeExclusive = this.safeIntegerN(params, ['endTime', 'endTimeExclusive', 'until']);
        if (endTimeExclusive !== undefined) {
            request['endTimeExclusive'] = endTimeExclusive;
            params = this.omit(params, ['endTime', 'endTimeExclusive', 'until']);
        }
        const response = await this.privateGetV3HistoryOrders(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'orders', []);
        return this.parseOrders(orders, market, since, limit);
    }
    /**
     * @method
     * @name apex#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-trade-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchOrderTrades(id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        const clientOrderId = this.safeString2(params, 'clientOrderId', 'clientId');
        if (clientOrderId !== undefined) {
            request['clientOrderId'] = clientOrderId;
        }
        else {
            request['orderId'] = id;
        }
        params = this.omit(params, ['clientOrderId', 'clientId']);
        const response = await this.privateGetV3OrderFills(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'orders', []);
        return this.parseTrades(orders, undefined, since, limit);
    }
    /**
     * @method
     * @name apex#fetchMyTrades
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-trade-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time
     * @param {boolean} [params.side] BUY or SELL
     * @param {string} [params.orderType] "LIMIT", "MARKET","STOP_LIMIT", "STOP_MARKET", "TAKE_PROFIT_LIMIT","TAKE_PROFIT_MARKET"
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTimeInclusive'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const endTimeExclusive = this.safeIntegerN(params, ['endTime', 'endTimeExclusive', 'until']);
        if (endTimeExclusive !== undefined) {
            request['endTimeExclusive'] = endTimeExclusive;
            params = this.omit(params, ['endTime', 'endTimeExclusive', 'until']);
        }
        const response = await this.privateGetV3Fills(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const orders = this.safeList(data, 'orders', []);
        return this.parseTrades(orders, market, since, limit);
    }
    /**
     * @method
     * @name apex#fetchFundingHistory
     * @description fetches information on multiple orders made by the user *classic accounts only*
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-funding-rate
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.until] end time, ms
     * @param {boolean} [params.side] BUY or SELL
     * @param {boolean} [params.page] Page numbers start from 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const request = {};
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['symbol'] = market['id'];
        }
        if (since !== undefined) {
            request['beginTimeInclusive'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const endTimeExclusive = this.safeIntegerN(params, ['endTime', 'endTimeExclusive', 'until']);
        if (endTimeExclusive !== undefined) {
            params = this.omit(params, ['endTime', 'endTimeExclusive', 'until']);
            request['endTimeExclusive'] = endTimeExclusive;
        }
        const response = await this.privateGetV3Funding(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        const fundingValues = this.safeList(data, 'fundingValues', []);
        return this.parseIncomes(fundingValues, market, since, limit);
    }
    parseIncome(income, market = undefined) {
        //
        // {
        //     "id": "1234",
        //     "symbol": "BTC-USDT",
        //     "fundingValue": "10000",
        //     "rate": "0.0000125000",
        //     "positionSize": "500",
        //     "price": "90",
        //     "side": "LONG",
        //     "status": "SUCCESS",
        //     "fundingTime": 1647502440973,
        //     "transactionId": "1234556"
        // }
        //
        const marketId = this.safeString(income, 'symbol');
        market = this.safeMarket(marketId, market, undefined, 'contract');
        const code = 'USDT';
        const timestamp = this.safeInteger(income, 'fundingTime');
        return {
            'info': income,
            'symbol': this.safeSymbol(marketId, market),
            'code': code,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'id': this.safeString(income, 'id'),
            'amount': this.safeNumber(income, 'fundingValue'),
            'rate': this.safeNumber(income, 'rate'),
        };
    }
    /**
     * @method
     * @name apex#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-post-sets-the-initial-margin-rate-of-a-contract
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    async setLeverage(leverage, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired(this.id + ' setLeverage() requires a symbol argument');
        }
        await this.loadMarkets();
        const market = this.market(symbol);
        const leverageString = this.numberToString(leverage);
        const initialMarginRate = Precise.stringDiv('1', leverageString, 4);
        const request = {
            'symbol': market['id'],
            'initialMarginRate': initialMarginRate,
        };
        const response = await this.privatePostV3SetInitialMarginRate(this.extend(request, params));
        const data = this.safeDict(response, 'data', {});
        return data;
    }
    /**
     * @method
     * @name apex#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.pro.apex.exchange/#privateapi-v3-for-omni-get-retrieve-user-account-data
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions(symbols = undefined, params = {}) {
        await this.loadMarkets();
        const response = await this.privateGetV3Account(params);
        const data = this.safeDict(response, 'data', {});
        const positions = this.safeList(data, 'positions', []);
        return this.parsePositions(positions, symbols);
    }
    parsePosition(position, market = undefined) {
        //
        // {
        //     "symbol": "BTC-USDT",
        //     "status": "",
        //     "side": "LONG",
        //     "size": "0.000",
        //     "entryPrice": "0.00",
        //     "exitPrice": "",
        //     "createdAt": 1690366452416,
        //     "updatedTime": 1690366452416,
        //     "fee": "0.000000",
        //     "fundingFee": "0.000000",
        //     "lightNumbers": "",
        //     "customInitialMarginRate": "0"
        // }
        const marketId = this.safeString(position, 'symbol');
        market = this.safeMarket(marketId, market);
        const symbol = market['symbol'];
        const side = this.safeStringLower(position, 'side');
        const quantity = this.safeString(position, 'size');
        const timestamp = this.safeInteger(position, 'updatedTime');
        let leverage = 20;
        const customInitialMarginRate = this.safeStringN(position, ['customInitialMarginRate', 'customImr'], '0');
        if (this.precisionFromString(customInitialMarginRate) !== 0) {
            leverage = this.parseToInt(Precise.stringDiv('1', customInitialMarginRate, 4));
        }
        return this.safePosition({
            'info': position,
            'id': this.safeString(position, 'id'),
            'symbol': symbol,
            'entryPrice': this.safeString(position, 'entryPrice'),
            'markPrice': undefined,
            'notional': undefined,
            'collateral': undefined,
            'unrealizedPnl': undefined,
            'side': side,
            'contracts': this.parseNumber(quantity),
            'contractSize': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'hedged': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'leverage': leverage,
            'liquidationPrice': undefined,
            'marginRatio': undefined,
            'marginMode': undefined,
            'percentage': undefined,
        });
    }
    sign(path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.implodeHostname(this.urls['api'][api]) + '/' + path;
        headers = {
            'User-Agent': 'apex-CCXT',
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        let signPath = '/api/' + path;
        let signBody = body;
        if (method.toUpperCase() !== 'POST') {
            if (Object.keys(params).length) {
                signPath += '?' + this.rawencode(params);
                url += '?' + this.rawencode(params);
            }
        }
        else {
            const sortedQuery = this.keysort(params);
            signBody = this.rawencode(sortedQuery);
        }
        if (api === 'private') {
            this.checkRequiredCredentials();
            const timestamp = this.milliseconds().toString();
            let messageString = timestamp + method.toUpperCase() + signPath;
            if (signBody !== undefined) {
                messageString = messageString + signBody;
            }
            const signature = this.hmac(this.encode(messageString), this.encode(this.stringToBase64(this.secret)), sha256, 'base64');
            headers['APEX-SIGNATURE'] = signature;
            headers['APEX-API-KEY'] = this.apiKey;
            headers['APEX-TIMESTAMP'] = timestamp;
            headers['APEX-PASSPHRASE'] = this.password;
        }
        return { 'url': url, 'method': method, 'body': signBody, 'headers': headers };
    }
    handleErrors(code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        //
        // {"code":3,"msg":"Order price must be greater than 0. Order price is 0.","key":"ORDER_PRICE_MUST_GREETER_ZERO","detail":{"price":"0"}}
        // {"code":400,"msg":"strconv.ParseInt: parsing \"dsfdfsd\": invalid syntax","timeCost":5320995}
        //
        if (response === undefined) {
            return undefined;
        }
        const errorCode = this.safeInteger(response, 'code');
        if (errorCode !== undefined && errorCode !== 0) {
            const feedback = this.id + ' ' + body;
            const message = this.safeString2(response, 'key', 'msg');
            this.throwBroadlyMatchedException(this.exceptions['broad'], message, feedback);
            const status = code.toString();
            this.throwExactlyMatchedException(this.exceptions['exact'], status, feedback);
            throw new ExchangeError(feedback);
        }
        return undefined;
    }
}
