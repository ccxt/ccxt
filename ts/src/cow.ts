// ---------------------------------------------------------------------------

import Exchange from './abstract/cow.js';
import { ExchangeError, ArgumentsRequired, AuthenticationError, NotSupported, BadRequest, InvalidOrder, OrderNotFound, InsufficientFunds, BadSymbol } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import { Precise } from './base/Precise.js';
import { ecdsa } from './base/functions/crypto.js';
import { keccak_256 as keccak } from './static_dependencies/noble-hashes/sha3.js';
import { secp256k1 } from './static_dependencies/noble-curves/secp256k1.js';
import type { Dict, Int, Market, Order, OrderSide, OrderType, Str, Trade } from './base/types.js';

/**
 * @class cow
 * @augments Exchange
 */
export default class cow extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'cow',
            'name': 'CoW Protocol (Order Book API)',
            'countries': [],
            'rateLimit': 500,
            'has': {
                'spot': true,
                'fetchMarkets': true,
                'createOrder': true,      // POST /orders (signed body)
                'cancelOrder': true,      // DELETE /orders (signed body)
                'fetchOrder': true,       // GET /orders/{uid}
                'fetchOrders': true,      // GET /account/{owner}/orders
                'fetchOpenOrders': true,  // filtered from fetchOrders()
                'fetchMyTrades': true,    // GET /trades?owner=... | orderUid=...
                // explicitly not supported by CoW:
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchOrderBook': false,
                'fetchTrades': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
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
                // CCXT will pass this into your sign() – compute the real base there
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
                // You can override these from user code: new ccxt.cow({ options: { network: 'base', env: 'prod' }})
                'network': 'mainnet', // 'mainnet' | 'xdai' | 'arbitrum_one' | 'base' | 'sepolia'
                'env': 'prod',        // 'prod' | 'barn'
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
                },
                'verifyingContracts': {
                    'mainnet': '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
                    'xdai': '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
                    'arbitrum_one': '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
                    'base': '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
                    'sepolia': '0x9008d19f58aabd9ed0d60971565aa8510560ab41',
                },
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
            'features': {
                'spot': {},
                'swap': {},
                'future': {},
                'option': {},
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

    sign (path, api: Str = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const paramsWithoutPath = this.omit (params, this.extractParams (path));
        const network = this.safeString2 (paramsWithoutPath, 'network', 'chainId');
        const env = this.safeString (paramsWithoutPath, 'env');
        const query = this.omit (paramsWithoutPath, [ 'network', 'chainId', 'env' ]);
        const baseUrl = this.resolveOrderbookBaseUrl (network, env);
        let pathWithParams = this.implodeParams (path, params);
        const versionPrefix = 'api/v1/';
        if (pathWithParams.indexOf (versionPrefix) === 0) {
            pathWithParams = pathWithParams.substring (versionPrefix.length);
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
        const quoteSymbols: string[] = [];
        for (let i = 0; i < quoteSymbolsRaw.length; i++) {
            const quote = quoteSymbolsRaw[i];
            if (quote !== undefined) {
                quoteSymbols.push (quote.toUpperCase ());
            }
        }
        const marketSymbols = Object.keys (tokensBySymbol);
        const markets: Market[] = [];
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
        let side: OrderSide = undefined;
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
        const decimalsString = decimals.toString ();
        const precision = this.parsePrecision (decimalsString);
        return Precise.stringMul (amount, precision);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const sellToken = this.safeStringLower (order, 'sellToken');
        const buyToken = this.safeStringLower (order, 'buyToken');
        const kind = this.safeStringLower (order, 'kind');
        let side: OrderSide = undefined;
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
        const orderType: OrderType = undefined;
        const postOnly = undefined;
        const timeInForce = undefined;
        const clientOrderId = this.safeString (order, 'appData');
        const triggerPrice = undefined;
        const average = price;
        let lastTradeTimestamp = this.parse8601 (this.safeString (order, 'executionTime'));
        if (lastTradeTimestamp === undefined) {
            lastTradeTimestamp = this.safeIntegerProduct (order, 'executionTime', 1000);
        }
        return this.safeOrder ({
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
            'fees': undefined,
            'trades': undefined,
            'triggerPrice': triggerPrice,
            'expiry': expiry,
        }, resolvedMarket);
    }

    async fetchOrder (id: Str, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = {
            'uid': id,
        };
        const response = await this.publicGetApiV1OrdersUid (this.extend (request, params));
        const order = this.safeDict (response, 'order', response);
        return this.parseOrder (order, (symbol !== undefined) ? this.market (symbol) : undefined);
    }

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

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, limit, params);
        return this.filterBy (orders, 'status', 'open') as Order[];
    }

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
        const kind = this.safeStringLower (params, 'kind', (side === 'sell') ? 'sell' : 'buy');
        if (kind !== 'sell') {
            throw new NotSupported (this.id + ' createOrder() currently supports only sell-kind orders');
        }
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
        const sellToken = this.safeStringLower (market, 'baseId');
        const buyToken = this.safeStringLower (market, 'quoteId');
        const amountString = this.numberToString (amount);
        const sellAmountRaw = this.amountToTokenAmount (amountString, baseDecimals);
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
        quoteRequest['sellAmountBeforeFee'] = this.safeString (quoteRequest, 'sellAmountBeforeFee', sellAmountRaw);
        if (type === 'limit') {
            const priceString = this.numberToString (price);
            const costDecimal = Precise.stringMul (amountString, priceString);
            const buyAmountRaw = this.amountToTokenAmount (costDecimal, quoteDecimals);
            quoteRequest['buyAmountAfterFee'] = this.safeString (quoteRequest, 'buyAmountAfterFee', buyAmountRaw);
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
            'feeAmount': this.safeString (quote, 'feeAmount', '0'),
            'kind': this.safeStringLower (quote, 'kind', kind),
            'partiallyFillable': this.safeBool (quote, 'partiallyFillable', partiallyFillable),
            'sellTokenBalance': this.safeStringLower (quote, 'sellTokenBalance', 'erc20'),
            'buyTokenBalance': this.safeStringLower (quote, 'buyTokenBalance', 'erc20'),
            'signingScheme': this.safeString (quote, 'signingScheme', this.safeString (this.options, 'defaultSigningScheme')),
            'from': this.addressWith0xPrefix (this.safeString (quote, 'from', owner)),
        };
        const signature = this.signOrderPayload (orderBody);
        orderBody['signature'] = signature;
        const response = await this.publicPostApiV1Orders (orderBody);
        const uid = this.safeString2 (response, 'orderUid', 'uid');
        const parsed = this.parseOrder (this.extend ({}, orderBody, { 'uid': uid, 'info': response, 'status': 'open' }), market);
        return this.extend (parsed, { 'info': response });
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        this.checkRequiredCredentials ();
        if ((this.privateKey === undefined) || (this.privateKey === '')) {
            throw new AuthenticationError (this.id + ' cancelOrder() requires exchange.privateKey to be set');
        }
        let owner: Str = undefined;
        [ owner, params ] = this.ensureOwnerAddress (params);
        const request: Dict = {
            'orderUid': id,
        };
        request['signature'] = this.signOrderCancellation (id);
        request['signingScheme'] = this.safeString (params, 'signingScheme', this.safeString (this.options, 'defaultSigningScheme'));
        params = this.omit (params, [ 'signingScheme' ]);
        const response = await this.publicDeleteApiV1Orders (this.extend (request, params));
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        return this.parseOrder ({ 'uid': id, 'status': 'canceled', 'info': response, 'owner': owner }, market);
    }

    ensureOwnerAddress (params: Dict = {}): any[] {
        let owner = this.safeStringLower2 (params, 'owner', 'walletAddress');
        const modifiedParams = this.omit (params, [ 'owner', 'walletAddress' ]);
        if (owner === undefined) {
            const optionOwner = this.safeStringLower (this.options, 'walletAddress');
            if (optionOwner !== undefined) {
                owner = optionOwner;
            } else if ((this.walletAddress !== undefined) && (typeof this.walletAddress === 'string') && (this.walletAddress !== '')) {
                owner = this.walletAddress.toLowerCase ();
            }
        }
        if (owner === undefined) {
            throw new ArgumentsRequired (this.id + ' requires a wallet address; set exchange.walletAddress, exchange.options["walletAddress"] or provide params["owner"]');
        }
        return [ owner, modifiedParams ];
    }

    hexWith0xPrefix (value: Str): Str {
        if (value === undefined) {
            return value;
        }
        return value.startsWith ('0x') ? value.toLowerCase () : ('0x' + value.toLowerCase ());
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

    amountToTokenAmount (amountString: Str, decimals: Str): Str {
        if ((amountString === undefined) || (decimals === undefined)) {
            return undefined;
        }
        const decimalsString = decimals.toString ();
        const precision = this.parsePrecision (decimalsString);
        return Precise.stringMul (amountString, precision);
    }

    orderKindToEnum (kind: Str) {
        const normalized = (kind === undefined) ? 'sell' : kind.toLowerCase ();
        const mapping = this.safeValue (this.options, 'orderKinds', {});
        const value = this.safeInteger (mapping, normalized);
        if (value === undefined) {
            throw new ExchangeError (this.id + ' order kind ' + kind + ' is not supported');
        }
        return value;
    }

    orderBalanceToEnum (balance: Str) {
        const normalized = (balance === undefined) ? 'erc20' : balance.toLowerCase ();
        const mapping = this.safeValue (this.options, 'tokenBalances', {});
        const value = this.safeInteger (mapping, normalized);
        if (value === undefined) {
            throw new ExchangeError (this.id + ' token balance type ' + balance + ' is not supported');
        }
        return value;
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

    computeTypedDataDigest (domain: Dict, types: Dict, message: Dict) {
        const encoded = this.ethEncodeStructuredData (domain, types, message);
        const digestBytes = keccak (encoded);
        return '0x' + this.binaryToBase16 (digestBytes);
    }

    padHex (hexString: Str, length = 64) {
        const raw = this.remove0xPrefix (hexString);
        return raw.padStart (length, '0');
    }

    signDigest (digest: Str, privateKey: Str) {
        const normalizedDigest = this.remove0xPrefix (digest);
        const normalizedKey = this.remove0xPrefix (privateKey);
        const signature = ecdsa (normalizedDigest, normalizedKey, secp256k1, undefined);
        const r = this.padHex (signature['r']);
        const s = this.padHex (signature['s']);
        const vValue = signature['v'] + 27;
        const vHex = vValue.toString (16).padStart (2, '0');
        return '0x' + r + s + vHex;
    }

    signOrderPayload (order: Dict) {
        const privateKey = this.normalizePrivateKey (this.privateKey);
        const chainId = this.getChainIdOption ();
        const verifyingContract = this.getVerifyingContractOption ();
        const domain = {
            'name': 'Gnosis Protocol v2',
            'version': '2',
            'chainId': chainId,
            'verifyingContract': verifyingContract,
        };
        const message = {
            'sellToken': this.hexWith0xPrefix (order['sellToken']),
            'buyToken': this.hexWith0xPrefix (order['buyToken']),
            'receiver': this.hexWith0xPrefix (order['receiver']),
            'sellAmount': this.safeString (order, 'sellAmount'),
            'buyAmount': this.safeString (order, 'buyAmount'),
            'validTo': this.safeInteger (order, 'validTo'),
            'appData': this.hexWith0xPrefix (this.safeString (order, 'appData')),
            'feeAmount': this.safeString (order, 'feeAmount', '0'),
            'kind': this.orderKindToEnum (this.safeStringLower (order, 'kind')),
            'partiallyFillable': this.safeBool (order, 'partiallyFillable', false),
            'sellTokenBalance': this.orderBalanceToEnum (this.safeStringLower (order, 'sellTokenBalance')),
            'buyTokenBalance': this.orderBalanceToEnum (this.safeStringLower (order, 'buyTokenBalance')),
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
                { 'name': 'kind', 'type': 'uint8' },
                { 'name': 'partiallyFillable', 'type': 'bool' },
                { 'name': 'sellTokenBalance', 'type': 'uint8' },
                { 'name': 'buyTokenBalance', 'type': 'uint8' },
            ],
        };
        const digest = this.computeTypedDataDigest (domain, types, message);
        return this.signDigest (digest, privateKey);
    }

    signOrderCancellation (orderUid: Str) {
        const privateKey = this.normalizePrivateKey (this.privateKey);
        const chainId = this.getChainIdOption ();
        const verifyingContract = this.getVerifyingContractOption ();
        const domain = {
            'name': 'Gnosis Protocol v2',
            'version': '2',
            'chainId': chainId,
            'verifyingContract': verifyingContract,
        };
        const message = {
            'orderUid': this.hexWith0xPrefix (orderUid),
        };
        const types = {
            'OrderCancellation': [
                { 'name': 'orderUid', 'type': 'bytes' },
            ],
        };
        const digest = this.computeTypedDataDigest (domain, types, message);
        return this.signDigest (digest, privateKey);
    }

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
                comparison['error'] = (error instanceof Error) ? error.message : this.json (error);
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
            const errors = {
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
            };
            const Exception = this.safeValue (errors, errorType, ExchangeError);
            throw new Exception (feedback);
        }
        const errorsList = this.safeList (response, 'errors');
        if (errorsList !== undefined) {
            for (let i = 0; i < errorsList.length; i++) {
                const error = errorsList[i];
                const type = this.safeString (error, 'errorType');
                if (type !== undefined) {
                    const description = this.safeString (error, 'description');
                    const feedback = this.id + ' ' + (description === undefined ? this.json (error) : description);
                    const errors = {
                        'DuplicatedOrder': InvalidOrder,
                        'InvalidOrder': InvalidOrder,
                        'InsufficientFee': InvalidOrder,
                        'InsufficientFunds': InsufficientFunds,
                        'UnsupportedSellToken': BadSymbol,
                        'UnsupportedBuyToken': BadSymbol,
                        'NoLiquidity': InvalidOrder,
                    };
                    const Exception = this.safeValue (errors, type, ExchangeError);
                    throw new Exception (feedback);
                }
            }
        }
        const status = this.safeString (response, 'status');
        if ((status !== undefined) && (status !== 'success') && (status !== 'ok')) {
            const description = this.safeString (response, 'description');
            const feedback = this.id + ' ' + (description === undefined ? body : description);
            throw new ExchangeError (feedback);
        }
    }
}
