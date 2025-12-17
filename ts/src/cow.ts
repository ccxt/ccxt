// ---------------------------------------------------------------------------

import Exchange from './abstract/cow.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NotSupported, BadRequest, InvalidOrder, OrderNotFound, InsufficientFunds, BadSymbol } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import { TypedDataEncoder } from './static_dependencies/ethers/hash/typed-data.js';
import { getAddress } from './static_dependencies/ethers/address/index.js';
import type { Balances, Dict, Int, Market, Order, OrderSide, OrderType, Str, Trade } from './base/types.js';

/**
 * @class cow
 * @augments Exchange
 */
export default class cow extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'cow',
            'name': 'CoW Protocol',
            'countries': [],
            'rateLimit': 500,
            'has': {
                'spot': true,
                'fetchMarkets': true,
                'fetchBalance': true,
                'createOrder': true,      // POST /orders (signed body)
                'cancelOrder': true,      // DELETE /orders (signed body)
                'cancelAllOrders': true,  // cancel multiple open orders
                'fetchOrder': true,       // GET /orders/{uid}
                'fetchOrders': true,      // GET /account/{owner}/orders
                'fetchOpenOrders': true,
                'fetchClosedOrders': true,
                'fetchCanceledOrders': true,
                'fetchMyTrades': true,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchOrderBook': false,
                'fetchTrades': false,
                'fetchCurrencies': false,
            },
            'features': {
                'spot': {
                    'sandbox': true, // barn environment serves as sandbox
                    'createOrder': {
                        'marginMode': false,
                        'triggerPrice': false,
                        'triggerDirection': false,
                        'triggerPriceType': undefined,
                        'stopLossPrice': false,
                        'takeProfitPrice': false,
                        'attachedStopLossTakeProfit': undefined,
                        'timeInForce': {
                            'GTC': true,  // Good Till Cancelled (default)
                            'IOC': true,  // Immediate Or Cancel
                            'FOK': true,  // Fill Or Kill
                            'PO': false,  // Post Only
                            'GTD': false, // Good Till Date
                        },
                        'hedged': false,
                        'trailing': false,
                        'leverage': false,
                        'marketBuyByCost': false,
                        'marketBuyRequiresPrice': false,
                        'selfTradePrevention': false,
                        'iceberg': false,
                    },
                    'createOrders': undefined,
                    'fetchMyTrades': {
                        'marginMode': false,
                        'limit': 1000, // API default limit
                        'daysBack': undefined,
                        'untilDays': undefined,
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
                        'limit': 1000,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchClosedOrders': {
                        'marginMode': false,
                        'limit': 1000,
                        'daysBack': undefined,
                        'daysBackCanceled': undefined,
                        'untilDays': undefined,
                        'trigger': false,
                        'trailing': false,
                        'symbolRequired': false,
                    },
                    'fetchOHLCV': {
                        'limit': undefined,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'uid': false,
                'login': false,
                'password': false,
                'twofa': false,
                'token': false,
                'walletAddress': true,
                'privateKey': true,
            },
            'urls': {
                'api': 'https://api.cow.fi',
                'www': 'https://cow.fi',
                'doc': 'https://docs.cow.fi/cow-protocol/reference/apis/orderbook',
            },
            'api': {
                'public': {
                    'get': {
                        'api/v1/orders/{uid}': 1,
                        'api/v1/trades': 1,
                        'api/v1/account/{owner}/orders': 1,
                    },
                    'post': {
                        'api/v1/quote': 12,
                        'api/v1/orders': 1,
                    },
                    'delete': {
                        'api/v1/orders': 1,
                    },
                },
            },
            'options': {
                'network': 'mainnet',
                'env': 'prod',
                'hosts': {
                    'prod': 'https://api.cow.fi',
                    'barn': 'https://barn.api.cow.fi',
                },
                'networkIds': {
                    'mainnet': 'mainnet',
                    'xdai': 'xdai',
                    'arbitrum_one': 'arbitrum-one',
                    'base': 'base',
                    'sepolia': 'sepolia',
                    'bnb': 'bnb',
                    'polygon': 'polygon',
                    'avalanche': 'avalanche',
                },
                'defaultQuoteTokens': [ 'USDC', 'USDT', 'DAI', 'WETH' ],
                'walletAddress': undefined,
                'tokenListUrl': 'https://files.cow.fi/tokens/CowSwap.json',
                'chainIds': {
                    'mainnet': 1,
                    'xdai': 100,
                    'arbitrum_one': 42161,
                    'base': 8453,
                    'sepolia': 11155111,
                    'bnb': 56,
                    'polygon': 137,
                    'avalanche': 43114,
                },
                'verifyingContracts': {
                    'mainnet': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'xdai': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'arbitrum_one': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'base': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'sepolia': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'bnb': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'polygon': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                    'avalanche': '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
                },
                'vaultRelayers': {
                    'mainnet': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'xdai': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'arbitrum_one': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'base': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'sepolia': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'bnb': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'polygon': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                    'avalanche': '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
                },
                'rpcUrls': {
                    'mainnet': 'https://eth.llamarpc.com',
                    'xdai': 'https://rpc.gnosischain.com',
                    'arbitrum_one': 'https://arb1.arbitrum.io/rpc',
                    'base': 'https://mainnet.base.org',
                    'sepolia': 'https://rpc.sepolia.org',
                    'bnb': 'https://bsc-rpc.publicnode.com',
                    'polygon': 'https://polygon-rpc.com',
                    'avalanche': 'https://api.avax.network/ext/bc/C/rpc',
                },
                'autoApprove': true, // Automatically approve VaultRelayer if allowance is insufficient
                'cancellationVerifyingContract': '0x0000000000000000000000000000000000000000',
                'defaultValidFor': 30,
                'defaultAppData': '0x0000000000000000000000000000000000000000000000000000000000000000',
                'defaultSigningScheme': 'ethsign',
                'tokenBalances': {
                    'erc20': 0,
                    'external': 1,
                    'internal': 2,
                },
                'orderKinds': {
                    'sell': 0,
                    'buy': 1,
                },
                'waitForOrder': {
                    'pollingDelay': 2000,
                    'timeout': 60000,
                    'statuses': [ 'closed', 'canceled', 'expired', 'rejected' ],
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': this.parseNumber ('0'),
                    'taker': this.parseNumber ('0'),
                },
            },
            'exceptions': {
                'exact': {
                    'DuplicatedOrder': InvalidOrder,
                    'OrderAlreadyExists': InvalidOrder,
                    'InvalidOrder': InvalidOrder,
                    'InsufficientFee': InvalidOrder,
                    'InsufficientFunds': InsufficientFunds,
                    'UnknownOrder': OrderNotFound,
                    'OrderNotFound': OrderNotFound,
                    'OrderExpired': OrderNotFound,
                    'InvalidSignature': AuthenticationError,
                    'UnsupportedSellToken': BadSymbol,
                    'UnsupportedBuyToken': BadSymbol,
                    'UnsupportedSigningScheme': AuthenticationError,
                    'InvalidAppData': BadRequest,
                    'SellAmountDoesNotCoverFee': InvalidOrder,
                    'SlippageTooLarge': InvalidOrder,
                    'NoLiquidity': InvalidOrder,
                },
                'broad': {},
            },
        });
    }

    resolveOrderbookBaseUrl (network: Str = undefined, env: Str = undefined): string {
        const defaultNetwork = this.safeString (this.options, 'network', 'mainnet');
        const selectedNetwork = (network === undefined) ? defaultNetwork : network;
        const defaultEnv = this.safeString (this.options, 'env', 'prod');
        const selectedEnv = (env === undefined) ? defaultEnv : env;
        const networkMap = this.safeValue (this.options, 'networkIds', {});
        const networkId = this.safeString (networkMap, selectedNetwork);
        if (networkId === undefined) {
            throw new ExchangeError (this.id + ' resolveOrderbookBaseUrl() unsupported network: ' + selectedNetwork);
        }
        const hosts = this.safeValue (this.options, 'hosts', {});
        const host = this.safeString (hosts, selectedEnv);
        if (host === undefined) {
            throw new ExchangeError (this.id + ' resolveOrderbookBaseUrl() unsupported environment: ' + selectedEnv);
        }
        return host + '/' + networkId + '/api/v1';
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const paramsWithoutPath = this.omit (params, this.extractParams (path));
        const network = this.safeString2 (paramsWithoutPath, 'network', 'chainId');
        const env = this.safeString (paramsWithoutPath, 'env');
        const query = this.omit (paramsWithoutPath, [ 'network', 'chainId', 'env' ]);
        const baseUrl = this.resolveOrderbookBaseUrl (network, env);
        let pathWithParams = this.implodeParams (path, params);
        const versionPrefix = 'api/v1/';
        if (pathWithParams.indexOf (versionPrefix) === 0) {
            pathWithParams = pathWithParams.replace (versionPrefix, '');
        }
        let url = baseUrl;
        if (pathWithParams.length > 0) {
            url = url + '/' + pathWithParams;
        }
        if ((method === 'GET') || (method === 'DELETE')) {
            if (!this.isEmpty (query)) {
                url = url + '?' + this.urlencode (query);
            }
        } else {
            if (!this.isEmpty (query)) {
                body = this.json (query);
            }
            headers = this.extend ({}, headers);
            headers['Content-Type'] = 'application/json';
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name cow#fetchMarkets
     * @description retrieves data on all markets for CoW Protocol
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tokenListUrl] override the default token list URL
     * @param {Array} [params.tokens] manually provide a token list instead of fetching
     * @param {Array} [params.quoteSymbols] override default quote symbols (USDC, USDT, DAI, WETH)
     * @param {int} [params.chainId] override the chain ID for filtering tokens
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const parameters = this.extend ({}, params);
        const tokenListUrl = this.safeString (parameters, 'tokenListUrl', this.safeString (this.options, 'tokenListUrl', 'https://files.cow.fi/tokens/CowSwap.json'));
        const overrideTokens = this.safeList (parameters, 'tokens');
        const overrideQuotes = this.safeValue (parameters, 'quoteSymbols');
        const overrideChainId = this.safeInteger (parameters, 'chainId');
        let tokenList: Dict = undefined;
        if (overrideTokens !== undefined) {
            tokenList = { 'tokens': overrideTokens };
        } else {
            tokenList = await this.fetch (tokenListUrl, 'GET', undefined, undefined);
        }
        const tokens = this.safeList (tokenList, 'tokens', []);
        const targetChainId = (overrideChainId === undefined) ? this.getChainIdOption () : overrideChainId;
        const tokensBySymbol: Dict = {};
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const chainId = this.safeInteger (token, 'chainId');
            if ((chainId !== undefined) && (chainId !== targetChainId)) {
                continue;
            }
            const symbol = this.safeStringUpper (token, 'symbol');
            if (symbol === undefined) {
                continue;
            }
            const address = this.safeStringLower (token, 'address');
            if (!(symbol in tokensBySymbol)) {
                const tokenRecord = this.extend ({}, token);
                if (address !== undefined) {
                    tokenRecord['address'] = address;
                }
                tokensBySymbol[symbol] = tokenRecord;
            }
        }
        const defaultQuoteSymbols = this.safeValue (this.options, 'defaultQuoteTokens', [ 'USDC', 'USDT', 'DAI', 'WETH' ]);
        const quoteSymbolsRaw = (overrideQuotes === undefined) ? defaultQuoteSymbols : overrideQuotes;
        const quoteSymbols = [];
        for (let i = 0; i < quoteSymbolsRaw.length; i++) {
            const quote = quoteSymbolsRaw[i];
            if (quote !== undefined) {
                quoteSymbols.push (quote.toUpperCase ());
            }
        }
        const marketSymbols = Object.keys (tokensBySymbol);
        const markets = [];
        for (let i = 0; i < marketSymbols.length; i++) {
            const baseSymbol = marketSymbols[i];
            const baseToken = tokensBySymbol[baseSymbol];
            let baseAddress = this.safeStringLower (baseToken, 'address');
            if (baseAddress === undefined) {
                baseAddress = baseSymbol.toLowerCase ();
            }
            const baseDecimals = this.safeInteger (baseToken, 'decimals');
            const amountPrecision = (baseDecimals === undefined) ? undefined : this.parseNumber (this.parsePrecision (this.numberToString (baseDecimals)));
            for (let j = 0; j < quoteSymbols.length; j++) {
                const quoteSymbolRaw = quoteSymbols[j];
                if (quoteSymbolRaw === undefined) {
                    continue;
                }
                const quoteSymbol = quoteSymbolRaw.toUpperCase ();
                if (baseSymbol === quoteSymbol) {
                    continue;
                }
                const quoteToken = this.safeValue (tokensBySymbol, quoteSymbol);
                if (quoteToken === undefined) {
                    continue;
                }
                let quoteAddress = this.safeStringLower (quoteToken, 'address');
                if (quoteAddress === undefined) {
                    quoteAddress = quoteSymbol.toLowerCase ();
                }
                const baseCode = this.safeCurrencyCode (baseSymbol);
                const quoteCode = this.safeCurrencyCode (quoteSymbol);
                const symbol = baseCode + '/' + quoteCode;
                const marketId = baseAddress + '-' + quoteAddress;
                markets.push (this.safeMarketStructure ({
                    'id': marketId,
                    'uppercaseId': undefined,
                    'symbol': symbol,
                    'base': baseCode,
                    'quote': quoteCode,
                    'baseId': baseAddress,
                    'quoteId': quoteAddress,
                    'type': 'spot',
                    'spot': true,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': false,
                    'taker': this.parseNumber ('0'),
                    'maker': this.parseNumber ('0'),
                    'contract': false,
                    'linear': undefined,
                    'inverse': undefined,
                    'contractSize': undefined,
                    'expiry': undefined,
                    'expiryDatetime': undefined,
                    'strike': undefined,
                    'optionType': undefined,
                    'settle': undefined,
                    'settleId': undefined,
                    'active': true,
                    'limits': {
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
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'precision': {
                        'amount': amountPrecision,
                        'price': undefined,
                    },
                    'info': {
                        'base': baseToken,
                        'quote': quoteToken,
                    },
                    'created': undefined,
                }));
            }
        }
        return markets;
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const sellToken = this.safeStringLower (trade, 'sellToken');
        const buyToken = this.safeStringLower (trade, 'buyToken');
        let resolvedMarket = market;
        if ((sellToken !== undefined) && (buyToken !== undefined)) {
            const marketId = sellToken + '-' + buyToken;
            resolvedMarket = this.safeMarket (marketId, resolvedMarket, undefined, 'spot');
        }
        resolvedMarket = this.safeMarket (undefined, resolvedMarket, undefined, 'spot');
        const symbol = this.safeString (resolvedMarket, 'symbol');
        const marketInfo = this.safeValue (resolvedMarket, 'info', {});
        const baseInfo = this.safeValue (marketInfo, 'base', {});
        const quoteInfo = this.safeValue (marketInfo, 'quote', {});
        const baseDecimals = this.safeString (baseInfo, 'decimals');
        const quoteDecimals = this.safeString (quoteInfo, 'decimals');
        const sellAmountRaw = this.safeString (trade, 'sellAmount');
        const buyAmountRaw = this.safeString (trade, 'buyAmount');
        const feeAmountRaw = this.safeString (trade, 'feeAmount');
        const kind = this.safeStringLower (trade, 'kind');
        const timestamp = this.safeInteger (trade, 'timestamp');
        const orderUid = this.safeString (trade, 'orderUid');
        const tradeId = this.safeString (trade, 'tradeUid');
        const executedSellRaw = this.safeString (trade, 'executedSellAmount', sellAmountRaw);
        const executedBuyRaw = this.safeString (trade, 'executedBuyAmount', buyAmountRaw);
        const baseId = this.safeStringLower (resolvedMarket, 'baseId');
        const quoteId = this.safeStringLower (resolvedMarket, 'quoteId');
        let side = undefined;
        let amountRaw = undefined;
        let costRaw = undefined;
        if (baseId === sellToken) {
            side = 'sell';
            amountRaw = executedSellRaw;
            costRaw = executedBuyRaw;
        } else if (baseId === buyToken) {
            side = 'buy';
            amountRaw = executedBuyRaw;
            costRaw = executedSellRaw;
        } else if (kind !== undefined) {
            if (kind === 'buy') {
                side = 'buy';
            } else if (kind === 'sell') {
                side = 'sell';
            }
            amountRaw = (side === 'sell') ? executedSellRaw : executedBuyRaw;
            costRaw = (side === 'sell') ? executedBuyRaw : executedSellRaw;
        } else {
            amountRaw = executedSellRaw;
            costRaw = executedBuyRaw;
        }
        const amountString = this.convertTokenAmount (amountRaw, baseDecimals);
        const costString = this.convertTokenAmount (costRaw, quoteDecimals);
        let price = undefined;
        if ((amountString !== undefined) && (costString !== undefined) && (!Precise.stringEq (amountString, '0'))) {
            price = this.parseNumber (Precise.stringDiv (costString, amountString));
        }
        const amount = this.parseNumber (amountString);
        const cost = this.parseNumber (costString);
        let fee = undefined;
        if (feeAmountRaw !== undefined) {
            let feeCurrencyId = this.safeStringLower (trade, 'feeToken');
            if (feeCurrencyId === undefined) {
                feeCurrencyId = sellToken;
            }
            let feeCurrencyCode = undefined;
            if (feeCurrencyId === baseId) {
                feeCurrencyCode = resolvedMarket['base'];
            } else if (feeCurrencyId === quoteId) {
                feeCurrencyCode = resolvedMarket['quote'];
            } else {
                feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            }
            const feeDecimals = (feeCurrencyId === baseId) ? baseDecimals : quoteDecimals;
            const feeCost = this.parseNumber (this.convertTokenAmount (feeAmountRaw, feeDecimals));
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        const takerOrMaker = undefined;
        return this.safeTrade ({
            'info': trade,
            'id': tradeId,
            'order': orderUid,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
        }, resolvedMarket);
    }

    parseOrderStatus (status: Str) {
        const statuses: Dict = {
            'open': 'open',
            'pending': 'open',
            'pending-solver-submission': 'open',
            'presignatureAwaiting': 'open',
            'presignaturePending': 'open',
            'fulfilled': 'closed',
            'expired': 'expired',
            'solved': 'closed',
            'cancelled': 'canceled',
            'canceled': 'canceled',
            'retracted': 'canceled',
            'failed': 'rejected',
        };
        return this.safeString (statuses, status, status);
    }

    convertTokenAmount (amount: Str, decimals: Str) {
        if ((amount === undefined) || (decimals === undefined)) {
            return undefined;
        }
        const decimalsString = this.numberToString (decimals);
        const precision = this.parsePrecision (decimalsString);
        return Precise.stringMul (amount, precision);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const sellToken = this.safeStringLower (order, 'sellToken');
        const buyToken = this.safeStringLower (order, 'buyToken');
        const kind = this.safeStringLower (order, 'kind');
        let side = undefined;
        if (kind !== undefined) {
            if (kind === 'sell') {
                side = 'sell';
            } else if (kind === 'buy') {
                side = 'buy';
            }
        }
        let resolvedMarket: Market = market;
        if (resolvedMarket === undefined) {
            if ((sellToken !== undefined) && (buyToken !== undefined)) {
                const directId = sellToken + '-' + buyToken;
                const inverseId = buyToken + '-' + sellToken;
                const directMarket = this.safeValue (this.markets_by_id, directId);
                const inverseMarket = this.safeValue (this.markets_by_id, inverseId);
                if ((side === 'sell') && (directMarket !== undefined)) {
                    resolvedMarket = directMarket;
                } else if ((side === 'buy') && (inverseMarket !== undefined)) {
                    resolvedMarket = inverseMarket;
                } else if (directMarket !== undefined) {
                    resolvedMarket = directMarket;
                } else if (inverseMarket !== undefined) {
                    resolvedMarket = inverseMarket;
                }
            }
        }
        resolvedMarket = this.safeMarket (undefined, resolvedMarket, undefined, 'spot');
        const symbol = this.safeString (resolvedMarket, 'symbol');
        const baseId = this.safeString (resolvedMarket, 'baseId');
        const quoteId = this.safeString (resolvedMarket, 'quoteId');
        const baseCurrency = this.safeString (resolvedMarket, 'base');
        const quoteCurrency = this.safeString (resolvedMarket, 'quote');
        if (side === undefined) {
            if ((resolvedMarket !== undefined) && (sellToken !== undefined) && (buyToken !== undefined)) {
                if ((baseId === sellToken) && (quoteId === buyToken)) {
                    side = 'sell';
                } else if ((baseId === buyToken) && (quoteId === sellToken)) {
                    side = 'buy';
                }
            }
        }
        const marketInfo = this.safeValue (resolvedMarket, 'info', {});
        const infoBase = this.safeValue (marketInfo, 'base', {});
        const infoQuote = this.safeValue (marketInfo, 'quote', {});
        const baseDecimals = this.safeString (infoBase, 'decimals');
        const quoteDecimals = this.safeString (infoQuote, 'decimals');
        const sellAmountRaw = this.safeString (order, 'sellAmount');
        const buyAmountRaw = this.safeString (order, 'buyAmount');
        const executedSellRaw = this.safeString (order, 'executedSellAmount');
        const executedBuyRaw = this.safeString (order, 'executedBuyAmount');
        let amountRaw = undefined;
        let filledRaw = undefined;
        let costRaw = undefined;
        let baseDecimalsUsed = baseDecimals;
        let quoteDecimalsUsed = quoteDecimals;
        if (side === 'sell') {
            amountRaw = sellAmountRaw;
            filledRaw = executedSellRaw;
            costRaw = executedBuyRaw;
        } else if (side === 'buy') {
            amountRaw = buyAmountRaw;
            filledRaw = executedBuyRaw;
            costRaw = executedSellRaw;
        } else {
            amountRaw = sellAmountRaw;
            filledRaw = executedSellRaw;
            costRaw = executedBuyRaw;
            if ((baseId === buyToken) && (quoteId === sellToken)) {
                baseDecimalsUsed = quoteDecimals;
                quoteDecimalsUsed = baseDecimals;
            }
        }
        let amount = undefined;
        let filled = undefined;
        let cost = undefined;
        let remaining = undefined;
        let costString = undefined;
        const amountString = this.convertTokenAmount (amountRaw, baseDecimalsUsed);
        const filledString = this.convertTokenAmount (filledRaw, baseDecimalsUsed);
        costString = this.convertTokenAmount (costRaw, quoteDecimalsUsed);
        if (amountString !== undefined) {
            amount = this.parseNumber (amountString);
        }
        if (filledString !== undefined) {
            filled = this.parseNumber (filledString);
        }
        if (amountRaw !== undefined && filledRaw !== undefined) {
            const remainingRaw = Precise.stringSub (amountRaw, filledRaw);
            const remainingString = this.convertTokenAmount (remainingRaw, baseDecimalsUsed);
            if (remainingString !== undefined) {
                remaining = this.parseNumber (remainingString);
            }
        }
        if (costString !== undefined) {
            cost = this.parseNumber (costString);
        }
        let price = undefined;
        if ((filledString !== undefined) && (costString !== undefined) && (!Precise.stringEq (filledString, '0'))) {
            price = this.parseNumber (Precise.stringDiv (costString, filledString));
        }
        const feeAmountRaw = this.safeString (order, 'feeAmount');
        let fee = undefined;
        if (feeAmountRaw !== undefined) {
            let feeDecimals = baseDecimalsUsed;
            let feeCurrency = baseCurrency;
            if (side === 'buy') {
                feeDecimals = quoteDecimalsUsed;
                feeCurrency = quoteCurrency;
            }
            const feeAmountString = this.convertTokenAmount (feeAmountRaw, feeDecimals);
            if (feeAmountString !== undefined) {
                fee = {
                    'currency': feeCurrency,
                    'cost': this.parseNumber (feeAmountString),
                };
            }
        }
        const statusRaw = this.safeString (order, 'status');
        const status = this.parseOrderStatus (statusRaw);
        let timestamp = this.parse8601 (this.safeString2 (order, 'creationDate', 'creationTime'));
        if (timestamp === undefined) {
            timestamp = this.safeIntegerProduct (order, 'creationTime', 1000);
        }
        const validTo = this.safeInteger (order, 'validTo');
        const expiry = (validTo !== undefined) ? (validTo * 1000) : undefined;
        const orderType = undefined;
        const postOnly = undefined;
        const timeInForce = undefined;
        const clientOrderId = this.safeString (order, 'appData');
        const triggerPrice = undefined;
        const average = price;
        let lastTradeTimestamp = this.parse8601 (this.safeString (order, 'executionTime'));
        if (lastTradeTimestamp === undefined) {
            lastTradeTimestamp = this.safeIntegerProduct (order, 'executionTime', 1000);
        }
        const result = {
            'info': order,
            'id': this.safeString (order, 'uid'),
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'triggerPrice': triggerPrice,
            'expiry': expiry,
        };
        return this.safeOrder (result, resolvedMarket);
    }

    /**
     * @method
     * @name cow#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} id order id (UID)
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = {
            'uid': id,
        };
        const response = await this.publicGetApiV1OrdersUid (this.extend (request, params));
        const order = this.safeDict (response, 'order', response);
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name cow#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const request: Dict = {
            'owner': owner,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicGetApiV1AccountOwnerOrders (this.extend (request, params));
        const rawOrders = this.safeList (response, 'orders', response);
        const parsedOrders = this.parseOrders (rawOrders, market, since, limit);
        return this.filterBySymbolSinceLimit (parsedOrders, symbol, since, limit);
    }

    /**
     * @method
     * @name cow#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'open') as Order[];
    }

    /**
     * @method
     * @name cow#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'closed') as Order[];
    }

    /**
     * @method
     * @name cow#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to fetch orders for
     * @returns {Order[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async fetchCanceledOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'canceled') as Order[];
    }

    /**
     * @method
     * @name cow#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to query balance for
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const ownerAddress = this.addressWith0xPrefix (owner);
        const result: Dict = {
            'info': {},
            'timestamp': undefined,
            'datetime': undefined,
        };
        const currencies: Dict = {};
        const marketValues = Object.values (this.markets);
        for (let i = 0; i < marketValues.length; i++) {
            const market = marketValues[i] as Market;
            const baseCode = this.safeString (market, 'base');
            const baseId = this.safeStringLower (market, 'baseId');
            const marketInfo = this.safeValue (market, 'info', {});
            const baseInfo = this.safeValue (marketInfo, 'base', {});
            const decimals = this.safeString (baseInfo, 'decimals');
            if ((baseCode !== undefined) && (baseId !== undefined) && (decimals !== undefined)) {
                if (!(baseCode in currencies)) {
                    currencies[baseCode] = { 'id': baseId, 'decimals': decimals };
                }
            }
        }
        const currencyCodes = Object.keys (currencies);
        for (let i = 0; i < currencyCodes.length; i++) {
            const code = currencyCodes[i];
            const currencyInfo = currencies[code];
            const tokenAddress = this.safeString (currencyInfo, 'id');
            const decimals = this.safeString (currencyInfo, 'decimals');
            try {
                const balanceRaw = await this.fetchERC20Balance (tokenAddress, ownerAddress);
                const balanceString = this.convertTokenAmount (balanceRaw, decimals);
                const balance = this.parseNumber (balanceString);
                result[code] = {
                    'free': balance,
                    'used': 0, // CoW doesn't lock funds, orders are intent-based
                    'total': balance,
                };
            } catch (e) {
                result[code] = {
                    'free': 0,
                    'used': 0,
                    'total': 0,
                };
            }
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name cow#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to fetch trades for
     * @returns {Trade[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let market: Market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const request: Dict = {
            'owner': owner,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['minTimestamp'] = since;
        }
        const response = await this.publicGetApiV1Trades (this.extend (request, params));
        const trades = this.parseTrades (response, market, since, limit);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    /**
     * @method
     * @name cow#createOrder
     * @description create a trade order on CoW Protocol
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.validFor] order validity duration in seconds (default 30)
     * @param {int} [params.validTo] unix timestamp when the order expires
     * @param {bool} [params.partiallyFillable] whether the order can be partially filled (default false)
     * @param {string} [params.appData] app data for the order (32-byte hex string)
     * @param {string} [params.receiver] the address to receive the bought tokens (defaults to sender)
     * @param {string} [params.from] the address placing the order (defaults to walletAddress)
     * @param {object} [params.quoteRequest] override parameters for the quote request
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: number = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        this.checkRequiredCredentials ();
        if ((this.privateKey === undefined) || (this.privateKey === '')) {
            throw new AuthenticationError (this.id + ' createOrder() requires exchange.privateKey to be set');
        }
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const receiverParam = this.safeStringLower (params, 'receiver', owner);
        const fromParam = this.safeStringLower (params, 'from', owner);
        params = this.omit (params, [ 'receiver', 'from' ]);
        const defaultKind = (side === 'sell') ? 'sell' : 'buy';
        const kind = this.safeStringLower (params, 'kind', defaultKind);
        if ((type !== 'limit') && (type !== 'market')) {
            throw new NotSupported (this.id + ' createOrder() supports market and limit order types');
        }
        if ((type === 'limit') && (price === undefined)) {
            throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for limit orders');
        }
        const marketInfo = this.safeValue (market, 'info', {});
        const baseInfo = this.safeValue (marketInfo, 'base', {});
        const quoteInfo = this.safeValue (marketInfo, 'quote', {});
        const baseDecimals = this.safeString (baseInfo, 'decimals');
        const quoteDecimals = this.safeString (quoteInfo, 'decimals');
        const partiallyFillable = this.safeBool (params, 'partiallyFillable', false);
        const validFor = this.safeInteger (params, 'validFor', this.safeInteger (this.options, 'defaultValidFor', 30));
        const currentSeconds = this.seconds ();
        const validTo = this.safeInteger (params, 'validTo', currentSeconds + validFor);
        const appData = this.safeString (params, 'appData', this.safeString (this.options, 'defaultAppData'));
        const quoteRequestOverrides = this.safeDict (params, 'quoteRequest');
        params = this.omit (params, [ 'kind', 'partiallyFillable', 'validFor', 'validTo', 'appData', 'quoteRequest' ]);
        const isSellOrder = (kind === 'sell');
        const sellToken = isSellOrder ? this.safeStringLower (market, 'baseId') : this.safeStringLower (market, 'quoteId');
        const buyToken = isSellOrder ? this.safeStringLower (market, 'quoteId') : this.safeStringLower (market, 'baseId');
        const sellTokenDecimals = isSellOrder ? baseDecimals : quoteDecimals;
        const buyTokenDecimals = isSellOrder ? quoteDecimals : baseDecimals;
        const amountString = this.numberToString (amount);
        let sellAmountRaw: Str = undefined;
        let buyAmountRaw: Str = undefined;
        if (isSellOrder) {
            sellAmountRaw = this.amountToTokenAmount (amountString, sellTokenDecimals);
        } else {
            buyAmountRaw = this.amountToTokenAmount (amountString, buyTokenDecimals);
        }
        const receiverAddress = this.addressWith0xPrefix (receiverParam);
        const fromAddress = this.addressWith0xPrefix (fromParam);
        const quoteRequest: Dict = this.extend ({
            'sellToken': this.addressWith0xPrefix (sellToken),
            'buyToken': this.addressWith0xPrefix (buyToken),
            'receiver': receiverAddress,
            'from': fromAddress,
            'kind': kind,
            'validTo': validTo,
            'partiallyFillable': partiallyFillable,
            'sellTokenBalance': 'erc20',
            'buyTokenBalance': 'erc20',
        }, quoteRequestOverrides);
        if (isSellOrder) {
            quoteRequest['sellAmountBeforeFee'] = this.safeString (quoteRequest, 'sellAmountBeforeFee', sellAmountRaw);
            if (type === 'limit') {
                const priceString = this.numberToString (price);
                const costDecimal = Precise.stringMul (amountString, priceString);
                const buyAmountRawLimit = this.amountToTokenAmount (costDecimal, buyTokenDecimals);
                quoteRequest['buyAmountAfterFee'] = this.safeString (quoteRequest, 'buyAmountAfterFee', buyAmountRawLimit);
            }
        } else {
            quoteRequest['buyAmountAfterFee'] = this.safeString (quoteRequest, 'buyAmountAfterFee', buyAmountRaw);
            if (type === 'limit') {
                const priceString = this.numberToString (price);
                const costDecimal = Precise.stringMul (amountString, priceString);
                const sellAmountRawLimit = this.amountToTokenAmount (costDecimal, sellTokenDecimals);
                quoteRequest['sellAmountBeforeFee'] = this.safeString (quoteRequest, 'sellAmountBeforeFee', sellAmountRawLimit);
            }
        }
        const quoteResponse = await this.publicPostApiV1Quote (quoteRequest);
        const quote = this.safeDict (quoteResponse, 'quote', quoteResponse);
        const orderBody: Dict = {
            'sellToken': this.addressWith0xPrefix (this.safeString (quote, 'sellToken', sellToken)),
            'buyToken': this.addressWith0xPrefix (this.safeString (quote, 'buyToken', buyToken)),
            'receiver': this.addressWith0xPrefix (this.safeString (quote, 'receiver', receiverParam)),
            'sellAmount': this.safeString (quote, 'sellAmount', sellAmountRaw),
            'buyAmount': this.safeString (quote, 'buyAmount', this.safeString (quoteRequest, 'buyAmountAfterFee')),
            'validTo': this.safeInteger (quote, 'validTo', validTo),
            'appData': this.safeString (quote, 'appData', appData),
            'feeAmount': '0', // CoW Protocol requires fee to be zero (fee is already included in sellAmount)
            'kind': this.safeStringLower (quote, 'kind', kind),
            'partiallyFillable': this.safeBool (quote, 'partiallyFillable', partiallyFillable),
            'sellTokenBalance': this.safeStringLower (quote, 'sellTokenBalance', 'erc20'),
            'buyTokenBalance': this.safeStringLower (quote, 'buyTokenBalance', 'erc20'),
        };
        const signingScheme = this.safeStringLower (quote, 'signingScheme', 'eip712');
        orderBody['signingScheme'] = signingScheme;
        orderBody['signature'] = this.signOrderPayload (orderBody, signingScheme);
        const signerAddr = this.deriveWalletAddressFromPrivateKey ();
        orderBody['from'] = this.addressWith0xPrefix (signerAddr).toLowerCase ();
        const autoApprove = this.safeBool (this.options, 'autoApprove', true);
        if (autoApprove) {
            const sellTokenAddress = this.safeString (orderBody, 'sellToken');
            if (sellTokenAddress !== undefined) {
                const vaultRelayer = this.getVaultRelayerOption ();
                const sellAmount = this.safeString (orderBody, 'sellAmount', '0');
                const feeAmount = this.safeString (orderBody, 'feeAmount', '0');
                const requiredAmount = Precise.stringAdd (sellAmount, feeAmount);
                try {
                    const currentAllowance = await this.checkERC20Allowance (sellTokenAddress, this.hexWith0xPrefix (signerAddr), vaultRelayer);
                    if (Precise.stringLt (currentAllowance, requiredAmount)) {
                        await this.approveERC20 (sellTokenAddress, vaultRelayer);
                        await this.waitForSufficientAllowance (sellTokenAddress, this.hexWith0xPrefix (signerAddr), vaultRelayer, requiredAmount);
                    }
                } catch (e) {
                    const message = this.safeString (e, 'message', this.json (e));
                    throw new ExchangeError (this.id + ' createOrder() failed to ensure allowance: ' + message);
                }
            }
        }
        const response = await this.publicPostApiV1Orders (orderBody);
        const uid = this.safeString2 (response, 'orderUid', 'uid');
        const parsed = this.parseOrder (this.extend ({}, orderBody, { 'uid': uid, 'info': response, 'status': 'open' }), market);
        return this.extend (parsed, { 'info': response });
    }

    /**
     * @method
     * @name cow#cancelOrder
     * @description cancels an open order
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} id order id (UID)
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.signingScheme] 'eip712' or 'ethsign' (default 'eip712')
     * @returns {object} An [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        if ((this.privateKey === undefined) || (this.privateKey === '')) {
            throw new AuthenticationError (this.id + ' cancelOrder() requires exchange.privateKey to be set');
        }
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const signingScheme = this.safeStringLower (params, 'signingScheme', 'eip712');
        params = this.omit (params, [ 'signingScheme' ]);
        const orderUids = [ id ];
        const requestBody: Dict = {
            'orderUids': orderUids,
            'signature': this.signOrderCancellation (orderUids, signingScheme),
            'signingScheme': signingScheme,
        };
        const deleteParams = this.extend (params, requestBody);
        const response = await this.publicDeleteApiV1Orders (deleteParams);
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrder ({ 'uid': id, 'status': 'canceled', 'info': response, 'owner': owner }, market);
    }

    /**
     * @method
     * @name cow#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.owner] the wallet address to cancel orders for
     * @param {string} [params.signingScheme] 'eip712' or 'ethsign' (default 'eip712')
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const openOrders = await this.fetchOpenOrders (symbol, undefined, undefined, params);
        if (openOrders.length === 0) {
            return [];
        }
        const results = [];
        for (let i = 0; i < openOrders.length; i++) {
            const order = openOrders[i];
            const orderId = this.safeString (order, 'id');
            if (orderId !== undefined) {
                try {
                    const result = await this.cancelOrder (orderId, symbol, params);
                    results.push (result);
                } catch (e) {
                    results.push (this.extend (order, { 'status': 'failed', 'info': e }));
                }
            }
        }
        return results;
    }

    ensureOwnerAddress (params: Dict = {}): any[] {
        let owner = this.safeStringLower2 (params, 'owner', 'walletAddress');
        const modifiedParams = this.omit (params, [ 'owner', 'walletAddress' ]);
        const derivedOwner = this.deriveWalletAddressFromPrivateKey ();
        if (owner === undefined) {
            const optionOwner = this.safeStringLower (this.options, 'walletAddress');
            if (optionOwner !== undefined) {
                owner = optionOwner;
            } else if ((this.walletAddress !== undefined) && (typeof this.walletAddress === 'string') && (this.walletAddress !== '')) {
                owner = this.walletAddress.toLowerCase ();
            } else if (derivedOwner !== undefined) {
                owner = derivedOwner;
            }
        }
        if ((owner !== undefined) && !owner.startsWith ('0x')) {
            owner = '0x' + owner;
        }
        if ((derivedOwner !== undefined) && (owner !== undefined) && (owner.toLowerCase () !== derivedOwner)) {
            throw new AuthenticationError (this.id + ' walletAddress mismatch between provided owner and private key');
        }
        if (owner === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a wallet address; set exchange.walletAddress, exchange.options["walletAddress"] or provide params["owner"]');
        }
        return [ owner.toLowerCase (), modifiedParams ];
    }

    hexWith0xPrefix (value: Str): Str {
        if (value === undefined) {
            return value;
        }
        return value.startsWith ('0x') ? value : ('0x' + value);
    }

    addressWith0xPrefix (value: Str): Str {
        return this.hexWith0xPrefix (value);
    }

    normalizePrivateKey (privateKey: Str): Str {
        if (privateKey === undefined) {
            return privateKey;
        }
        return this.hexWith0xPrefix (privateKey);
    }

    deriveWalletAddressFromPrivateKey (): Str {
        const normalizedKey = this.normalizePrivateKey (this.privateKey);
        if ((normalizedKey === undefined) || (normalizedKey === '')) {
            return undefined;
        }
        const keyHex = this.remove0xPrefix (normalizedKey);
        if (keyHex.length !== 64) {
            throw new AuthenticationError (this.id + ' privateKey must be a 32-byte hex string');
        }
        const privateKeyBytes = this.base16ToBinary (keyHex);
        const publicKey = secp256k1.getPublicKey (privateKeyBytes, false);
        const hashBytes = keccak (publicKey.slice (1));
        const addressBytes = hashBytes.slice (-20);
        const address = '0x' + this.binaryToBase16 (addressBytes);
        return address.toLowerCase ();
    }

    amountToTokenAmount (amountString: Str, decimals: Str): Str {
        if ((amountString === undefined) || (decimals === undefined)) {
            return undefined;
        }
        const decimalsString = this.numberToString (decimals);
        const precision = this.parsePrecision (decimalsString);
        return Precise.stringDiv (amountString, precision);
    }

    getChainIdOption () {
        const network = this.safeString (this.options, 'network', 'mainnet');
        const chains = this.safeValue (this.options, 'chainIds', {});
        const chainId = this.safeInteger (chains, network);
        if (chainId === undefined) {
            throw new ExchangeError (this.id + ' unsupported network ' + network + ' for chain id resolution');
        }
        return chainId;
    }

    getVerifyingContractOption () {
        const network = this.safeString (this.options, 'network', 'mainnet');
        const contracts = this.safeValue (this.options, 'verifyingContracts', {});
        const verifyingContract = this.safeString (contracts, network);
        if (verifyingContract === undefined) {
            throw new ExchangeError (this.id + ' unsupported network ' + network + ' for verifying contract resolution');
        }
        return this.hexWith0xPrefix (verifyingContract);
    }

    getVaultRelayerOption () {
        const network = this.safeString (this.options, 'network', 'mainnet');
        const relayers = this.safeValue (this.options, 'vaultRelayers', {});
        const vaultRelayer = this.safeString (relayers, network);
        if (vaultRelayer === undefined) {
            throw new ExchangeError (this.id + ' unsupported network ' + network + ' for vault relayer resolution');
        }
        return this.hexWith0xPrefix (vaultRelayer);
    }

    getRpcUrlOption () {
        const network = this.safeString (this.options, 'network', 'mainnet');
        const rpcUrls = this.safeValue (this.options, 'rpcUrls', {});
        return this.safeString (rpcUrls, network);
    }

    async fetchERC20Balance (tokenAddress: Str, ownerAddress: Str) {
        const rpcUrl = this.getRpcUrlOption ();
        if (rpcUrl === undefined) {
            throw new ExchangeError (this.id + ' fetchERC20Balance() requires rpcUrls[' + this.options['network'] + '] to be configured');
        }
        const ownerPadded = this.remove0xPrefix (ownerAddress).padStart (64, '0');
        // ERC20 balanceOf(address) = 0x70a08231
        const data = '0x70a08231' + ownerPadded;
        const request = {
            'jsonrpc': '2.0',
            'method': 'eth_call',
            'params': [
                {
                    'to': tokenAddress,
                    'data': data,
                },
                'latest',
            ],
            'id': 1,
        };
        const response = await this.fetch (rpcUrl, 'POST', { 'Content-Type': 'application/json' }, this.json (request));
        const result = this.safeString (response, 'result', '0x0');
        const errorResult = this.safeValue (response, 'error');
        if (errorResult !== undefined) {
            throw new ExchangeError (this.id + ' fetchERC20Balance() RPC error: ' + this.json (errorResult));
        }
        if (result === '0x') {
            return '0';
        }
        const hexValue = this.remove0xPrefix (result);
        if (hexValue === '') {
            return '0';
        }
        return BigInt ('0x' + hexValue).toString ();
    }

    async checkERC20Allowance (tokenAddress: Str, ownerAddress: Str, spenderAddress: Str) {
        const rpcUrl = this.getRpcUrlOption ();
        if (rpcUrl === undefined) {
            throw new ExchangeError (this.id + ' checkERC20Allowance() requires rpcUrls[' + this.options['network'] + '] to be configured');
        }
        const ownerPadded = this.remove0xPrefix (ownerAddress).padStart (64, '0');
        const spenderPadded = this.remove0xPrefix (spenderAddress).padStart (64, '0');
        const data = '0xdd62ed3e' + ownerPadded + spenderPadded;
        const request = {
            'jsonrpc': '2.0',
            'method': 'eth_call',
            'params': [
                {
                    'to': tokenAddress,
                    'data': data,
                },
                'latest',
            ],
            'id': 1,
        };
        const response = await this.fetch (rpcUrl, 'POST', { 'Content-Type': 'application/json' }, this.json (request));
        const result = this.safeString (response, 'result', '0');
        if (result === '0') {
            const errorResult = this.safeValue (response, 'error');
            if (errorResult !== undefined) {
                throw new ExchangeError (this.id + ' checkERC20Allowance() failed to fetch allowance: ' + this.json (response));
            }
        }
        return result;
    }

    async waitForSufficientAllowance (tokenAddress: Str, ownerAddress: Str, spenderAddress: Str, requiredAmount: Str, maxAttempts: Int = 30, delayMs: Int = 5000) {
        for (let i = 0; i < maxAttempts; i++) {
            const currentAllowance = await this.checkERC20Allowance (tokenAddress, ownerAddress, spenderAddress);
            if (!Precise.stringLt (currentAllowance, requiredAmount)) {
                return currentAllowance;
            }
            await this.sleep (delayMs);
        }
        throw new ExchangeError (this.id + ' waitForSufficientAllowance() allowance not updated after ' + this.numberToString (maxAttempts) + ' attempts');
    }

    async approveERC20 (tokenAddress: Str, spenderAddress: Str, amount: Str = undefined) {
        const rpcUrl = this.getRpcUrlOption ();
        if (rpcUrl === undefined) {
            throw new ExchangeError (this.id + ' approveERC20() requires rpcUrls[' + this.options['network'] + '] to be configured');
        }
        const privateKey = this.normalizePrivateKey (this.privateKey);
        const ownerAddress = this.deriveWalletAddressFromPrivateKey ();
        const approvalAmount = (amount !== undefined) ? amount : '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const spenderPadded = this.remove0xPrefix (spenderAddress).padStart (64, '0');
        let amountHex = approvalAmount;
        if (amountHex.startsWith ('0x')) {
            amountHex = '0x' + this.remove0xPrefix (amountHex).padStart (64, '0');
        } else {
            const numericValue = parseInt (amountHex);
            amountHex = '0x' + numericValue.toString (16).padStart (64, '0');
        }
        const data = '0x095ea7b3' + spenderPadded + this.remove0xPrefix (amountHex);
        const nonceRequest = {
            'jsonrpc': '2.0',
            'method': 'eth_getTransactionCount',
            'params': [ this.hexWith0xPrefix (ownerAddress), 'latest' ],
            'id': 2,
        };
        const nonceResponse = await this.fetch (rpcUrl, 'POST', { 'Content-Type': 'application/json' }, this.json (nonceRequest));
        const nonce = this.safeString (nonceResponse, 'result');
        const gasPriceRequest = {
            'jsonrpc': '2.0',
            'method': 'eth_gasPrice',
            'params': [],
            'id': 3,
        };
        const gasPriceResponse = await this.fetch (rpcUrl, 'POST', { 'Content-Type': 'application/json' }, this.json (gasPriceRequest));
        const gasPrice = this.safeString (gasPriceResponse, 'result');
        const chainId = this.getChainIdOption ();
        const tx = {
            'nonce': nonce,
            'gasPrice': gasPrice,
            'gasLimit': '0x186a0', // 100000 in hex
            'to': tokenAddress,
            'value': '0x0',
            'data': data,
            'chainId': chainId,
        };
        const txFields = [
            tx['nonce'],
            tx['gasPrice'],
            tx['gasLimit'],
            tx['to'],
            tx['value'],
            tx['data'],
            '0x' + chainId.toString (16),
            '0x',
            '0x',
        ];
        const rlpEncoded = this.encodeRLP (txFields);
        const txHash = '0x' + this.binaryToBase16 (keccak (this.base16ToBinary (this.remove0xPrefix (rlpEncoded))));
        const privateKeyBytes = this.base16ToBinary (this.remove0xPrefix (privateKey));
        const hashBytes = this.base16ToBinary (this.remove0xPrefix (txHash));
        const signature = secp256k1.sign (hashBytes, privateKeyBytes);
        const compact = signature.toCompactHex ();
        const r = compact.slice (0, 64);
        const s = compact.slice (64);
        const recovery = signature.recovery;
        const v = (chainId * 2) + 35 + recovery;
        const signedTxFields = [
            tx['nonce'],
            tx['gasPrice'],
            tx['gasLimit'],
            tx['to'],
            tx['value'],
            tx['data'],
            '0x' + v.toString (16),
            '0x' + r,
            '0x' + s,
        ];
        const signedRlp = this.encodeRLP (signedTxFields);
        const broadcastRequest = {
            'jsonrpc': '2.0',
            'method': 'eth_sendRawTransaction',
            'params': [ signedRlp ],
            'id': 4,
        };
        const broadcastResponse = await this.fetch (rpcUrl, 'POST', { 'Content-Type': 'application/json' }, this.json (broadcastRequest));
        const txHashResult = this.safeString (broadcastResponse, 'result');
        const error = this.safeValue (broadcastResponse, 'error');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' approveERC20() failed: ' + this.json (error));
        }
        return {
            'txHash': txHashResult,
            'token': tokenAddress,
            'spender': spenderAddress,
            'amount': approvalAmount,
        };
    }

    encodeRLPItem (value: string): string {
        let hex = value;
        if (!hex.startsWith ('0x')) {
            hex = '0x' + hex;
        }
        hex = this.remove0xPrefix (hex).toLowerCase ();
        while (hex.length > 1 && hex[0] === '0') {
            hex = hex.slice (1);
        }
        if (hex.length === 0) {
            hex = '0';
        }
        if (hex.length % 2 !== 0) {
            hex = '0' + hex;
        }
        if (hex === '00' || hex === '') {
            return '80';
        }
        const length = hex.length / 2;
        if (length === 1 && parseInt (hex, 16) < 128) {
            return hex;
        }
        if (length < 56) {
            return (128 + length).toString (16).padStart (2, '0') + hex;
        }
        const lengthHex = length.toString (16);
        const lengthOfLength = Math.ceil (lengthHex.length / 2);
        const paddedLengthHex = lengthHex.padStart (lengthOfLength * 2, '0');
        return (183 + lengthOfLength).toString (16) + paddedLengthHex + hex;
    }

    encodeRLP (fields: any[]): string {
        const encoded = [];
        for (let i = 0; i < fields.length; i++) {
            encoded.push (this.encodeRLPItem (fields[i]));
        }
        const concatenated = encoded.join ('');
        const totalLength = concatenated.length / 2;
        if (totalLength < 56) {
            return '0x' + (192 + totalLength).toString (16).padStart (2, '0') + concatenated;
        }
        const lengthHex = totalLength.toString (16);
        const lengthOfLength = Math.ceil (lengthHex.length / 2);
        const paddedLengthHex = lengthHex.padStart (lengthOfLength * 2, '0');
        return '0x' + (247 + lengthOfLength).toString (16) + paddedLengthHex + concatenated;
    }

    computeTypedDataDigest (domain: Dict, types: Dict, message: Dict) {
        const encoder: any = TypedDataEncoder;
        if (typeof encoder.hash === 'function') {
            return encoder.hash (domain, types, message);
        }
        const encoded = encoder.encode (domain, types, message);
        const encodedBinary = this.base16ToBinary (encoded.slice (2));
        const digestBytes = keccak (encodedBinary);
        return '0x' + this.binaryToBase16 (digestBytes);
    }

    hashEthereumSignedMessage (messageHex: Str) {
        if (messageHex === undefined) {
            return undefined;
        }
        const binaryMessage = this.base16ToBinary (this.remove0xPrefix (messageHex));
        if (binaryMessage.length !== 32) {
            throw new ExchangeError (this.id + ' hashEthereumSignedMessage() requires a 32-byte digest hex string');
        }
        const messageLength = this.binaryLength (binaryMessage);
        // eslint-disable-next-line quotes
        const prefixString = "\x19Ethereum Signed Message:\n" + this.numberToString (messageLength);
        const prefixBinary = this.encode (prefixString);
        const prefixed = this.binaryConcat (prefixBinary, binaryMessage);
        const digestBytes = keccak (prefixed);
        return '0x' + this.binaryToBase16 (digestBytes);
    }

    signDigest (digest: Str, privateKey: Str, usePersonalSign: boolean = false) {
        const normalizedKey = this.normalizePrivateKey (privateKey);
        if (digest === undefined || normalizedKey === undefined) {
            return undefined;
        }
        let hashToSign = digest;
        if (usePersonalSign) {
            hashToSign = this.hashEthereumSignedMessage (digest);
        }
        const digestBytes = this.base16ToBinary (this.remove0xPrefix (hashToSign));
        const privateKeyBytes = this.base16ToBinary (this.remove0xPrefix (normalizedKey));
        const signature = secp256k1.sign (digestBytes, privateKeyBytes);
        const compact = signature.toCompactHex ();
        const recovery = signature.recovery;
        const r = compact.slice (0, 64);
        const s = compact.slice (64);
        const vValue = recovery + 27;
        const vHex = vValue.toString (16).padStart (2, '0');
        return '0x' + r + s + vHex;
    }

    signOrderPayload (order: Dict, signingScheme: Str = 'eip712') {
        const privateKey = this.normalizePrivateKey (this.privateKey);
        const chainId = this.getChainIdOption ();
        const verifyingContract = this.getVerifyingContractOption ();
        const domain = {
            'name': 'Gnosis Protocol',
            'version': 'v2',
            'chainId': chainId,
            'verifyingContract': verifyingContract,
        };
        const receiverAddress = this.safeString (order, 'receiver');
        let normalizedReceiver = '0x0000000000000000000000000000000000000000';
        if (receiverAddress !== undefined) {
            normalizedReceiver = getAddress (this.hexWith0xPrefix (receiverAddress));
        }
        const message = {
            'sellToken': getAddress (this.hexWith0xPrefix (order['sellToken'])),
            'buyToken': getAddress (this.hexWith0xPrefix (order['buyToken'])),
            'receiver': normalizedReceiver,
            'sellAmount': this.safeString (order, 'sellAmount'),
            'buyAmount': this.safeString (order, 'buyAmount'),
            'validTo': this.safeInteger (order, 'validTo'),
            'appData': this.hexWith0xPrefix (this.safeString (order, 'appData')),
            'feeAmount': this.safeString (order, 'feeAmount', '0'),
            'kind': this.safeStringLower (order, 'kind'),
            'partiallyFillable': this.safeBool (order, 'partiallyFillable', false),
            'sellTokenBalance': this.safeStringLower (order, 'sellTokenBalance', 'erc20'),
            'buyTokenBalance': this.safeStringLower (order, 'buyTokenBalance', 'erc20'),
        };
        const types = {
            'Order': [
                { 'name': 'sellToken', 'type': 'address' },
                { 'name': 'buyToken', 'type': 'address' },
                { 'name': 'receiver', 'type': 'address' },
                { 'name': 'sellAmount', 'type': 'uint256' },
                { 'name': 'buyAmount', 'type': 'uint256' },
                { 'name': 'validTo', 'type': 'uint32' },
                { 'name': 'appData', 'type': 'bytes32' },
                { 'name': 'feeAmount', 'type': 'uint256' },
                { 'name': 'kind', 'type': 'string' },
                { 'name': 'partiallyFillable', 'type': 'bool' },
                { 'name': 'sellTokenBalance', 'type': 'string' },
                { 'name': 'buyTokenBalance', 'type': 'string' },
            ],
        };
        const typedDataEncoder = new TypedDataEncoder (types);
        const domainSeparator = TypedDataEncoder.hashDomain (domain);
        const structHash = typedDataEncoder.hash (message);
        const prefix = '0x1901';
        const encoded = prefix + domainSeparator.slice (2) + structHash.slice (2);
        const digest = '0x' + this.binaryToBase16 (keccak (this.base16ToBinary (encoded.slice (2))));
        const usePersonalSign = (signingScheme === 'ethsign');
        return this.signDigest (digest, privateKey, usePersonalSign);
    }

    signOrderCancellation (orderUids: Str[], signingScheme: Str = 'eip712') {
        const privateKey = this.normalizePrivateKey (this.privateKey);
        const chainId = this.getChainIdOption ();
        const verifyingContract = this.getVerifyingContractOption ();
        const domain = {
            'name': 'Gnosis Protocol',
            'version': 'v2',
            'chainId': chainId,
            'verifyingContract': verifyingContract,
        };
        const typeString = 'OrderCancellations(bytes[] orderUids)';
        const typeHash = '0x' + this.binaryToBase16 (keccak (typeString));
        let concatenatedHashes = '';
        for (let i = 0; i < orderUids.length; i++) {
            const uid = this.hexWith0xPrefix (orderUids[i]);
            const uidBytes = this.base16ToBinary (uid.slice (2));
            const uidHash = keccak (uidBytes);
            concatenatedHashes += this.binaryToBase16 (uidHash);
        }
        const arrayHash = '0x' + this.binaryToBase16 (keccak (this.base16ToBinary (concatenatedHashes)));
        const structHashInput = typeHash.slice (2) + arrayHash.slice (2);
        const structHash = '0x' + this.binaryToBase16 (keccak (this.base16ToBinary (structHashInput)));
        const domainSeparator = TypedDataEncoder.hashDomain (domain);
        const prefix = '0x1901';
        const encoded = prefix + domainSeparator.slice (2) + structHash.slice (2);
        const digest = '0x' + this.binaryToBase16 (keccak (this.base16ToBinary (encoded.slice (2))));
        if (signingScheme === 'ethsign') {
            const prefixedDigest = this.hashEthereumSignedMessage (digest);
            return this.signDigest (prefixedDigest, privateKey, false);
        } else {
            return this.signDigest (digest, privateKey, false);
        }
    }

    /**
     * @method
     * @name cow#compareQuoteWithOtherExchanges
     * @description get a quote from CoW Protocol and compare it with quotes from other exchanges
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of base currency to trade
     * @param {object[]} otherExchanges array of exchange instances to compare quotes with
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.receiver] the address to receive the bought tokens
     * @param {string} [params.from] the address placing the order
     * @param {int} [params.validFor] quote validity duration in seconds
     * @returns {object} a comparison object with CoW quote and other exchange quotes
     */
    async compareQuoteWithOtherExchanges (symbol: Str, amount: number, otherExchanges: any[] = [], params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketInfo = this.safeValue (market, 'info', {});
        const baseInfo = this.safeValue (marketInfo, 'base', {});
        const quoteInfo = this.safeValue (marketInfo, 'quote', {});
        const baseDecimals = this.safeString (baseInfo, 'decimals');
        const quoteDecimals = this.safeString (quoteInfo, 'decimals');
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const receiverParam = this.safeStringLower (params, 'receiver', owner);
        const fromParam = this.safeStringLower (params, 'from', owner);
        const amountString = this.numberToString (amount);
        const sellAmountRaw = this.amountToTokenAmount (amountString, baseDecimals);
        const nowSeconds = this.seconds ();
        const validFor = this.safeInteger (params, 'validFor', this.safeInteger (this.options, 'defaultValidFor', 30));
        const validTo = this.safeInteger (params, 'validTo', nowSeconds + validFor);
        params = this.omit (params, [ 'validFor', 'validTo', 'receiver', 'from' ]);
        const quoteRequest = this.extend ({
            'sellToken': this.addressWith0xPrefix (market['baseId']),
            'buyToken': this.addressWith0xPrefix (market['quoteId']),
            'sellAmountBeforeFee': sellAmountRaw,
            'receiver': this.addressWith0xPrefix (receiverParam),
            'from': this.addressWith0xPrefix (fromParam),
            'kind': 'sell',
            'partiallyFillable': false,
            'validTo': validTo,
            'sellTokenBalance': 'erc20',
            'buyTokenBalance': 'erc20',
        }, params);
        const quoteResponse = await this.publicPostApiV1Quote (quoteRequest);
        const quote = this.safeDict (quoteResponse, 'quote', quoteResponse);
        const cowSellAmountRaw = this.safeString (quote, 'sellAmount', sellAmountRaw);
        const cowBuyAmountRaw = this.safeString (quote, 'buyAmount');
        const cowFeeRaw = this.safeString (quote, 'feeAmount', '0');
        const cowBuyAmount = this.convertTokenAmount (cowBuyAmountRaw, quoteDecimals);
        const effectiveAmount = this.convertTokenAmount (cowSellAmountRaw, baseDecimals);
        const cowFee = this.convertTokenAmount (cowFeeRaw, baseDecimals);
        let cowPrice = undefined;
        if ((cowBuyAmount !== undefined) && (effectiveAmount !== undefined) && (!Precise.stringEq (effectiveAmount, '0'))) {
            cowPrice = this.parseNumber (Precise.stringDiv (cowBuyAmount, effectiveAmount));
        }
        const comparisons = [];
        for (let i = 0; i < otherExchanges.length; i++) {
            const exchange = otherExchanges[i];
            let comparison = {
                'exchange': undefined,
                'available': undefined,
                'cost': undefined,
                'price': undefined,
                'slippage': undefined,
                'error': undefined,
                'info': undefined,
            };
            try {
                if (exchange === undefined) {
                    continue;
                }
                comparison['exchange'] = exchange.id;
                if ((exchange.has !== undefined) && (exchange.has['fetchOrderBook'] !== undefined) && !exchange.has['fetchOrderBook']) {
                    comparison['error'] = 'fetchOrderBook not supported';
                    comparisons.push (comparison);
                    continue;
                }
                await exchange.loadMarkets ();
                const orderBook = await exchange.fetchOrderBook (symbol);
                comparison['info'] = orderBook;
                const asks = this.safeList (orderBook, 'asks', orderBook['asks']);
                let remaining = amountString;
                let cost = '0';
                let filled = '0';
                for (let j = 0; j < asks.length; j++) {
                    const level = asks[j];
                    const price = this.numberToString (level[0]);
                    const size = this.numberToString (level[1]);
                    if ((price === undefined) || (size === undefined)) {
                        continue;
                    }
                    if (Precise.stringLe (remaining, '0')) {
                        break;
                    }
                    const tradeAmount = Precise.stringMin (remaining, size);
                    cost = Precise.stringAdd (cost, Precise.stringMul (tradeAmount, price));
                    filled = Precise.stringAdd (filled, tradeAmount);
                    remaining = Precise.stringSub (remaining, tradeAmount);
                }
                if (Precise.stringLe (filled, '0')) {
                    comparison['error'] = 'insufficient liquidity';
                    comparisons.push (comparison);
                    continue;
                }
                const filledNumber = this.parseNumber (filled);
                const costNumber = this.parseNumber (cost);
                let priceNumber = undefined;
                if (filledNumber !== undefined && filledNumber > 0 && costNumber !== undefined) {
                    priceNumber = costNumber / filledNumber;
                }
                let slippage = undefined;
                if ((cowPrice !== undefined) && (priceNumber !== undefined) && (cowPrice !== 0)) {
                    slippage = (priceNumber - cowPrice) / cowPrice;
                }
                comparison = this.extend (comparison, {
                    'available': filledNumber,
                    'cost': costNumber,
                    'price': priceNumber,
                    'slippage': slippage,
                    'remaining': this.parseNumber (remaining),
                });
            } catch (error) {
                let errorMessage = this.json (error);
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                comparison['error'] = errorMessage;
            }
            comparisons.push (comparison);
        }
        return {
            'symbol': symbol,
            'amount': amount,
            'price': this.parseNumber (cowPrice),
            'buyAmount': this.parseNumber (cowBuyAmount),
            'sellAmount': this.parseNumber (effectiveAmount),
            'fee': this.parseNumber (cowFee),
            'info': quoteResponse,
            'comparisons': comparisons,
        };
    }

    /**
     * @method
     * @name cow#waitForOrder
     * @description polls the exchange until an order reaches a terminal status
     * @see https://docs.cow.fi/cow-protocol/reference/apis/orderbook
     * @param {string} id order id (UID)
     * @param {string} symbol unified market symbol
     * @param {string} [status] specific status to wait for (defaults to any terminal status)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.pollingDelay] delay between polling requests in milliseconds (default 2000)
     * @param {int} [params.timeout] maximum time to wait in milliseconds (default 60000)
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async waitForOrder (id: Str, symbol: Str = undefined, status: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'waitForOrder', {});
        const statuses = this.safeValue (options, 'statuses', [ 'closed', 'canceled', 'expired', 'rejected' ]);
        const targetStatuses = (status === undefined) ? statuses : [ status ];
        const defaultPollingDelay = this.safeInteger (options, 'pollingDelay', 2000);
        const defaultTimeout = this.safeInteger (options, 'timeout', 60000);
        const pollingDelay = this.safeInteger (params, 'pollingDelay', defaultPollingDelay);
        const timeout = this.safeInteger (params, 'timeout', defaultTimeout);
        const fetchParams = this.omit (params, [ 'pollingDelay', 'timeout' ]);
        const deadline = this.milliseconds () + timeout;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const order = await this.fetchOrder (id, symbol, fetchParams);
            const orderStatus = this.safeString (order, 'status');
            if (this.inArray (orderStatus, targetStatuses)) {
                return order;
            }
            if (this.milliseconds () > deadline) {
                throw new InvalidOrder (this.id + ' waitForOrder() timed out waiting for order ' + id + ' to reach status ' + targetStatuses.join (','));
            }
            await this.sleep (pollingDelay);
        }
    }

    handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        const errorType = this.safeString (response, 'errorType');
        if (errorType !== undefined) {
            const description = this.safeString (response, 'description');
            const feedback = this.id + ' ' + (description === undefined ? body : description);
            this.throwExactlyMatchedException (this.exceptions['exact'], errorType, feedback);
            throw new ExchangeError (feedback);
        }
        const errorsList = this.safeList (response, 'errors');
        if (errorsList !== undefined) {
            for (let i = 0; i < errorsList.length; i++) {
                const error = errorsList[i];
                const type = this.safeString (error, 'errorType');
                if (type !== undefined) {
                    const description = this.safeString (error, 'description');
                    const feedback = this.id + ' ' + (description === undefined ? this.json (error) : description);
                    this.throwExactlyMatchedException (this.exceptions['exact'], type, feedback);
                    throw new ExchangeError (feedback);
                }
            }
        }
        const status = this.safeString (response, 'status');
        if (status !== undefined) {
            const knownOrderStatuses = [ 'open', 'pending', 'pending-solver-submission', 'presignatureAwaiting', 'presignaturePending', 'fulfilled', 'expired', 'solved', 'cancelled', 'canceled', 'retracted', 'failed' ];
            if (!this.inArray (status, knownOrderStatuses)) {
                if ((status !== 'success') && (status !== 'ok')) {
                    const description = this.safeString (response, 'description');
                    const feedback = this.id + ' ' + (description === undefined ? body : description);
                    throw new ExchangeError (feedback);
                }
            }
        }
    }
}
