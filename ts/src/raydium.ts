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
                'swap': false,
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
     * @description fetches Raydium pools as spot markets
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.type] pool (default), launchlab, or all
     * @returns {object[]} a list of [market structures](https://docs.ccxt.com/#/?id=market-structure)
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        const kind = this.safeString (params, 'type', 'pool');
        if ((kind !== 'pool') && (kind !== 'launchlab') && (kind !== 'all')) {
            throw new BadRequest (this.id + ' fetchMarkets() params.type must be pool, launchlab, or all');
        }
        const query = this.omit (params, [ 'type' ]);
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
            if (symbols[parsed['symbol']] === undefined) {
                result.push (parsed);
                symbols[parsed['symbol']] = true;
            }
        }
        return result;
    }

    /**
     * @ignore
     * @param {object} market raw Raydium pool or LaunchLab mint
     * @returns {object} a market structure
     */
    override parseMarket (market: Dict): Market {
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
            response = await this.apiV3PublicGetFarmsInfoLp (request);
        } else {
            throw new BadRequest (this.id + ' fetchLiquidityPools() params.type must be pool, stake, or farm');
        }
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
            const normalized: Dict = {
                'id': poolId,
                'poolId': poolId,
                'type': kind,
                'baseCurrency': baseCurrency,
                'quoteCurrency': quoteCurrency,
                'lpCurrency': this.safeString (lpMint, 'address'),
                'symbol': this.safeString (mintA, 'symbol') + '/' + this.safeString (mintB, 'symbol'),
                'name': this.safeString (row, 'name'),
                'totalLiquidity': this.safeNumber (row, 'totalLiquidity'),
                'totalLiquidityValue': this.safeNumber (row, 'tvl'),
                'volume24h': this.safeNumber2 (this.safeDict (row, 'day'), 'volume', 'volume24h'),
                'apr': this.safeNumber (row, 'apr'),
                'feeRate': this.safeNumber (row, 'feeRate'),
                'info': row,
            };
            if (this.safeString (mintA, 'symbol') === undefined || this.safeString (mintB, 'symbol') === undefined) {
                normalized['symbol'] = this.safeString (row, 'symbol');
            }
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
        const rows = this.extractRows (response);
        const result: Dict[] = [];
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
        const rows = this.extractRows (response);
        const rowsLength = rows.length;
        if (rowsLength === 0) {
            throw new BadSymbol (this.id + ' fetchPoolMintAddresses() could not find pool ' + id);
        }
        const pool = rows[0];
        const mintA = this.safeDict (pool, 'mintA');
        const mintB = this.safeDict (pool, 'mintB');
        return this.parsePoolMintAddresses ({
            'info': pool,
            'poolId': this.safeString (pool, 'id', id),
            'mintA': this.safeString (mintA, 'address'),
            'mintB': this.safeString (mintB, 'address'),
            'lpMint': this.safeString (this.safeDict (pool, 'lpMint'), 'address'),
            'symbol': this.safeString (mintA, 'symbol') + '/' + this.safeString (mintB, 'symbol'),
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
        const fromDecimals = this.safeInteger (params, 'fromDecimals', fromCurrency['precision']);
        const toDecimals = this.safeInteger (params, 'toDecimals', toCurrency['precision']);
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
     * @description submits a caller-signed Raydium swap transaction
     * @see https://docs.raydium.io/api-reference/route-api-v2/overview.md
     * @param {string} id quote id returned by fetchConvertQuote
     * @param {string} fromCode currency code or mint address converted from
     * @param {string} toCode currency code or mint address converted to
     * @param {float} [amount] amount specified for the quote
     * @param {object} [params] exchange-specific parameters
     * @param {object} params.swapResponse full raw response from fetchConvertQuote.info
     * @param {string} params.signedTransaction base64-encoded transaction signed by the wallet
     * @param {string} [params.wallet] wallet public key that signed the transaction
     * @param {string} [params.owner] alias for wallet
     * @param {int} [params.priorityFee] priority fee override in micro-lamports
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
        const fromDecimals = this.safeInteger (params, 'fromDecimals', fromCurrency['precision']);
        const toDecimals = this.safeInteger (params, 'toDecimals', toCurrency['precision']);
        const inputAmount = this.safeString (quote, 'inputAmount');
        const outputAmount = this.safeString (quote, 'outputAmount');
        if (quoteInputMint !== fromCurrency['id'] || quoteOutputMint !== toCurrency['id']) {
            throw new BadRequest (this.id + ' createConvertTrade() quote token mints do not match the requested currencies');
        }
        if (fromDecimals === undefined || toDecimals === undefined || inputAmount === undefined || outputAmount === undefined) {
            throw new ExchangeError (this.id + ' createConvertTrade() quote is missing token amounts or decimal metadata');
        }
        const request: Dict = {
            'transaction': signedTransaction,
            'wallet': wallet,
        };
        const priorityFee = this.safeInteger (params, 'priorityFee');
        if (priorityFee !== undefined) {
            request['priorityFee'] = priorityFee;
        }
        const response = await this.launchMintPublicPostCreateSendTransaction (request);
        const submission = this.extractObject (response);
        const signature = this.safeString (submission, 'signature');
        if (signature === undefined) {
            throw new ExchangeError (this.id + ' createConvertTrade() response is missing transaction signature');
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
     * @name raydium#buildSwapTransaction
     * @description builds an unsigned swap transaction from a Raydium quote
     * @see https://docs.raydium.io/api-reference/route-api-v2/overview.md
     * @param {object} params transaction construction parameters
     * @param {object} params.swapResponse full raw response from fetchConvertQuote.info
     * @param {string} params.wallet wallet public key that will sign the transaction
     * @param {string} [params.txVersion] V0 or LEGACY
     * @param {string} [params.computeUnitPriceMicroLamports] priority fee per compute unit
     * @returns {object} unsigned transaction that must be signed and submitted by the caller
     */
    async buildSwapTransaction (params: Dict = {}): Promise<Dict> {
        const swapResponse = this.safeDict (params, 'swapResponse');
        const wallet = this.safeString (params, 'wallet');
        if (swapResponse === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' buildSwapTransaction() requires params.swapResponse and params.wallet');
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
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#submitPool
     * @description submits a caller-signed Raydium transaction through the LaunchLab relay
     * @see https://docs.raydium.io/api-reference/launch-mint-v1/overview.md
     * @param {object} params signed transaction and its wallet
     * @param {string} params.transaction base64-encoded signed Solana transaction
     * @param {string} params.wallet wallet public key that signed the transaction
     * @param {int} [params.priorityFee] optional priority fee override in micro-lamports
     * @returns {object} submission result including the transaction signature
     */
    override async submitPool (params: Dict = {}): Promise<Dict> {
        const transaction = this.safeString (params, 'transaction');
        const wallet = this.safeString (params, 'wallet', this.safeString (params, 'owner'));
        if (transaction === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' submitPool() requires params.transaction and params.wallet or params.owner');
        }
        const request: Dict = {
            'transaction': transaction,
            'wallet': wallet,
        };
        const priorityFee = this.safeInteger (params, 'priorityFee');
        if (priorityFee !== undefined) {
            request['priorityFee'] = priorityFee;
        }
        const response = await this.launchMintPublicPostCreateSendTransaction (request);
        return this.parsePoolSubmission (this.extractObject (response), wallet);
    }

    /**
     * @method
     * @name raydium#createPoolMetadata
     * @description registers off-chain metadata for a LaunchLab mint
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
     * @name raydium#fetchTVL
     * @description fetches Raydium total value locked and 24-hour volume
     * @see https://docs.raydium.io/api-reference/api-v3/overview.md
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} total value locked and 24-hour volume
     */
    async fetchTVL (params: Dict = {}): Promise<Dict> {
        const response = await this.apiV3PublicGetMainInfo (params);
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
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchPerpInfo
     * @description fetches public Raydium Perps protocol and market statistics
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} Perps statistics; this API does not expose order execution
     */
    async fetchPerpInfo (params: Dict = {}): Promise<Dict> {
        this.ensurePerpsApiAvailable ();
        const response = await this.perpsPublicGetMainInfo (params);
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchPerpMarkets
     * @description fetches the public Raydium Perps market and pool configuration list
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} Perps market configuration; not CCXT executable markets
     */
    async fetchPerpMarkets (params: Dict = {}): Promise<Dict[]> {
        this.ensurePerpsApiAvailable ();
        const response = await this.perpsPublicGetPoolDefaultList (params);
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchPerpVersion
     * @description fetches the Raydium Perps API version
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} Perps API version
     */
    async fetchPerpVersion (params: Dict = {}): Promise<Dict> {
        this.ensurePerpsApiAvailable ();
        const response = await this.perpsPublicGetMainVersion (params);
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchPerpRpcs
     * @description fetches configured RPC endpoint metadata for Raydium Perps
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} RPC endpoint metadata
     */
    async fetchPerpRpcs (params: Dict = {}): Promise<Dict[]> {
        this.ensurePerpsApiAvailable ();
        const response = await this.perpsPublicGetMainRpcs (params);
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchPerpAvailability
     * @description checks whether Raydium Perps is available from the caller's region
     * @see https://docs.raydium.io/api-reference
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object} Perps availability result
     */
    async fetchPerpAvailability (params: Dict = {}): Promise<Dict> {
        this.ensurePerpsApiAvailable ();
        const response = await this.perpsPublicGetMainAvailabilityCheck (params);
        return this.extractObject (response);
    }

    /**
     * @ignore
     * @description throws if Raydium Perps is unavailable in the current mode
     */
    ensurePerpsApiAvailable () {
        if (this.isSandboxModeEnabled) {
            throw new NotSupported (this.id + ' Raydium Perps does not provide a sandbox API');
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
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchMyIDOPositions
     * @description fetches IDO participation for a wallet
     * @see https://docs.raydium.io/api-reference/owner-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} a list of the wallet's IDO positions
     */
    async fetchMyIDOPositions (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.ownerPublicGetMainIdoOwner (this.extend ({ 'owner': walletAddress }, params));
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
     * @returns {object} comment submission response
     */
    async createPoolComment (params: Dict = {}): Promise<Dict> {
        const poolId = this.safeString (params, 'poolId');
        const text = this.safeString (params, 'text');
        const wallet = this.safeString (params, 'wallet');
        if (poolId === undefined || text === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' createPoolComment() requires params.poolId, params.text, and params.wallet');
        }
        if (params['file'] !== undefined) {
            throw new BadRequest (this.id + ' createPoolComment() does not support binary file uploads');
        }
        const response = await this.launchForumPublicPostComment (params);
        return this.extractObject (response);
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
     * @returns {object} token validation response
     */
    async fetchRaydiumTokenStatus (params: Dict = {}): Promise<Dict> {
        const token = this.safeString (params, 'token');
        const wallet = this.safeString (params, 'wallet');
        if (token === undefined || wallet === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchRaydiumTokenStatus() requires params.token and params.wallet');
        }
        const response = await this.launchAuthPublicGetCheckToken ({ 'token': token, 'wallet': wallet });
        return this.extractObject (response);
    }

    /**
     * @method
     * @name raydium#fetchCLMMLimitOrders
     * @description fetches active indexed Raydium CLMM limit orders for a wallet
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @returns {object[]} active indexed limit orders
     */
    async fetchCLMMLimitOrders (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderOrderList (this.extend ({ 'wallet': walletAddress }, params));
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchCLMMLimitOrder
     * @description fetches one indexed Raydium CLMM limit order from active or historical wallet records
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} orderId limit-order PDA or id
     * @param {string} walletAddress wallet public key
     * @param {object} [params] history pagination parameters, including nextPageId
     * @returns {object} normalized indexed limit order
     */
    async fetchCLMMLimitOrder (orderId: string, walletAddress: string, params: Dict = {}): Promise<Dict> {
        const active = await this.fetchCLMMLimitOrders (walletAddress, params);
        for (let i = 0; i < active.length; i++) {
            const parsed = this.parseCLMMLimitOrder (active[i]);
            if (parsed['id'] === orderId) {
                return parsed;
            }
        }
        const history = await this.fetchCLMMLimitOrderHistory (walletAddress, params);
        for (let i = 0; i < history.length; i++) {
            const parsed = this.parseCLMMLimitOrder (history[i], true);
            if (parsed['id'] === orderId) {
                return parsed;
            }
        }
        throw new ExchangeError (this.id + ' fetchCLMMLimitOrder() could not find order ' + orderId + ' in the requested active and history pages');
    }

    /**
     * @method
     * @name raydium#fetchCLMMLimitOrderHistory
     * @description fetches historical indexed Raydium CLMM limit orders for a wallet
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} walletAddress wallet public key
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.nextPageId] opaque cursor for the next page
     * @returns {object[]} historical indexed limit orders
     */
    async fetchCLMMLimitOrderHistory (walletAddress: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderHistoryOrderListByUser (this.extend ({ 'wallet': walletAddress }, params));
        return this.extractRows (response);
    }

    /**
     * @method
     * @name raydium#fetchCLMMLimitOrderEvents
     * @description fetches indexed events for one or more Raydium CLMM limit-order accounts
     * @see https://docs.raydium.io/api-reference/temp-api-v1/overview.md
     * @param {string} pda limit-order PDA or comma-separated PDAs
     * @param {object} [params] extra parameters specific to the endpoint
     * @param {string} [params.nextPageId] opaque cursor for the next page
     * @returns {object[]} indexed limit-order events
     */
    async fetchCLMMLimitOrderEvents (pda: string, params: Dict = {}): Promise<Dict[]> {
        const response = await this.tempPublicGetLimitOrderHistoryEventListByPda (this.extend ({ 'pda': pda }, params));
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
            return cached;
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
     * @param {number} amount human-readable token amount
     * @param {int} decimals token decimal precision
     * @returns {string} amount in base units
     */
    toBaseUnits (amount: Num, decimals: number): string {
        const rawAmount = Precise.stringDiv (this.numberToString (amount), this.parsePrecision (this.numberToString (decimals)));
        if (rawAmount === undefined || rawAmount.indexOf ('.') !== -1) {
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
        const candidates = [ 'rows', 'data', 'mintList', 'items' ];
        for (let i = 0; i < candidates.length; i++) {
            const rows = this.safeList (data, candidates[i]);
            if (rows !== undefined) {
                return rows as Dict[];
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
        const url = baseUrl + '/' + path;
        const requestParams = this.extend ({}, params);
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
            const message = this.safeString2 (response, 'msg', 'message', 'unknown API error');
            throw new ExchangeError (this.id + ' ' + message);
        }
        return undefined;
    }
}
