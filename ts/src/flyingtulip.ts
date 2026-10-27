// ---------------------------------------------------------------------------

import Exchange from './abstract/flyingtulip.js';
import { Precise } from './base/Precise.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, ExchangeError, InsufficientFunds, InvalidOrder, NotSupported, OrderNotFound } from './base/errors.js';
import { TICK_SIZE, TRUNCATE } from './base/functions/number.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ecdsa } from './base/functions/crypto.js';
import type { Balances, Currencies, Dict, Endpoint, Int, int, List, Market, Num, Order, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFees } from './base/types.js';

/**
 * @class flyingtulip
 * @augments Exchange
 * Financed ERC-20 exposure in a cross-margin account, without a perpetual
 * futures funding contract. One adapter instance is scoped to one chain.
 *
 * Set walletAddress to the margin-account owner and options.chainId to the
 * selected chain. Any currently valid deposited collateral may support
 * independent debt and exposure tokens. Open amounts are base-token units;
 * params.cost selects a quote-token budget instead of a base target on buys.
 * params.leverage is a bounded sizing annotation; signed token amounts and
 * account-wide maintenance determine the actual financed exposure.
 *
 * prepareLeverageOrder, prepareClosePosition and prepareCollateralConversion
 * return exact typed terms and unsigned approvals for caller review.
 * prepareCollateralDeposit returns unsigned deposit transactions. The caller
 * executes required approvals/deposits, waits for confirmation and refreshes
 * account state before submitting a dependent order. Conversion and exposure
 * orders do not form an atomic batch. No unlimited approval is generated.
 *
 * External owners submit the exact reviewed plan with submitLeverageOrder
 * and eip712 or erc1271 signatures. Existing session delegates use session
 * signatures and a verified session snapshot; session creation and nonce
 * discovery remain caller responsibilities. Identical signed engine terms
 * can deduplicate; separate otherwise-identical orders need distinct validTo
 * values. Financial wallet transactions are never sent by these helpers.
 */
export default class flyingtulip extends Exchange {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'flyingtulip',
            'name': 'Flying Tulip',
            'countries': [],
            'rateLimit': 200,
            'userAgent': 'ccxt',
            'dex': true,
            'version': 'v2',
            'has': {
                'CORS': true,
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'cancelOrder': true,
                'closePosition': true,
                'createMarketBuyOrderWithCost': true,
                'createOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDeposits': false,
                'fetchFundingLimits': false,
                'fetchFundingRate': false,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': false,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'urls': {
                'api': { 'public': 'https://api.flyingtulip.com' },
                'www': 'https://flyingtulip.com',
                'doc': 'https://api.flyingtulip.com',
            },
            'api': {
                'public': {
                    'get': {
                        'mm/spot/markets-v2': { 'cost': 1 } as Endpoint<List>,
                        'spot/leverage/assets': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/lend': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/spot/account/positions': { 'cost': 1 } as Endpoint<List>,
                        'mm/spot/account/trades': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/spot/trades/{market_key}': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/leverage/config': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/leverage/fee-estimate': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/leverage/orders': { 'cost': 1 } as Endpoint<Dict>,
                        'mm/leverage/orders/{id}': { 'cost': 1 } as Endpoint<Dict>,
                    },
                    'post': { 'mm/leverage/quote': { 'cost': 1 } as Endpoint<Dict>, 'mm/leverage/orders': { 'cost': 1 } as Endpoint<Dict> },
                    'delete': { 'mm/leverage/orders/{id}': { 'cost': 1 } as Endpoint<Dict> },
                },
            },
            'features': {},
            'requiredCredentials': { 'apiKey': false, 'secret': false },
            'precisionMode': TICK_SIZE,
            'options': {
                'chainId': 146,
                'slippageBps': 100,
                'validitySeconds': 3600,
                'feeBps': 5,
                'positionManagers': {
                    '146': '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
                    '1': '0xbe4050a73a7Fb384c65E885a15C33461A4B20055',
                    '56': '0xB36d39C72d66153B7f32E1320BEe3280657353Bd',
                },
            },
        });
    }

    chainId (params: Dict = {}): int {
        const configured = this.safeInteger (this.options, 'chainId', 146);
        const requested = this.safeInteger (params, 'chainId');
        if ((requested !== undefined) && (requested !== configured)) {
            throw new BadRequest (this.id + ' use a separate instance for a different chainId');
        }
        return configured;
    }

    accountAddress (params: Dict = {}): string {
        const address = this.safeString (params, 'address', this.walletAddress);
        if ((address === undefined) || !this.isAddress (address)) {
            throw new ArgumentsRequired (this.id + ' requires walletAddress or params.address');
        }
        return address;
    }

    isAddress (value: string): boolean {
        return this.isHexString (value, 40);
    }

    isDigits (value: string): boolean {
        const size = value.length - 0;
        if (size === 0) {
            return false;
        }
        const digits = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
        for (let i = 0; i < size; i++) {
            if (!this.inArray (value[i], digits)) {
                return false;
            }
        }
        return true;
    }

    isDecimalString (value: string): boolean {
        const parts = value.split ('.');
        const size = parts.length;
        if ((size > 2) || !this.isDigits (parts[0])) {
            return false;
        }
        return (size === 1) || this.isDigits (parts[1]);
    }

    isHexString (value: string, length: int): boolean {
        if ((value.length !== length + 2) || (value.slice (0, 2) !== '0x')) {
            return false;
        }
        const allowed = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f' ];
        const lower = value.toLowerCase ();
        const size = lower.length - 0;
        for (let i = 2; i < size; i++) {
            if (!this.inArray (lower[i], allowed)) {
                return false;
            }
        }
        return true;
    }

    unwrap (response: any): any {
        if ((response === null) || (response === 'null')) {
            return [];
        }
        if (this.safeValue (response, 'success') === false) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return this.safeValue (response, 'data', response);
    }

    async configuration (): Promise<Dict> {
        const config = await this.publicGetMmLeverageConfig ({ 'chainId': this.chainId () });
        if ((this.safeInteger (config, 'chainId') !== this.chainId ()) || (this.safeInteger (config, 'signingChainId') !== this.chainId ())) {
            throw new ExchangeError (this.id + ' configuration chain mismatch');
        }
        const addresses = [ 'leverageRfqEngine', 'sessionManager', 'executorAddress' ];
        for (let i = 0; i < addresses.length; i++) {
            const address = this.safeString (config, addresses[i], '');
            if (!this.isAddress (address) || (address.toLowerCase () === '0x0000000000000000000000000000000000000000')) {
                throw new ExchangeError (this.id + ' missing or invalid signing contract configuration');
            }
        }
        const version = this.safeInteger (config, 'engineVersion', 1);
        if ((version !== 1) && (version !== 2)) {
            throw new NotSupported (this.id + ' unsupported engineVersion');
        }
        return config;
    }

    async registry (address: Str = undefined): Promise<any[]> {
        const request: Dict = { 'chainId': this.chainId () };
        if (address !== undefined) {
            request['address'] = address;
        }
        const response = await this.publicGetSpotLeverageAssets (request);
        return this.unwrap (response);
    }

    async lendAccount (address: string): Promise<Dict> {
        const response = await this.publicGetMmLend ({ 'chainId': this.chainId (), 'address': address });
        const data = this.unwrap (response);
        if (this.safeBool (data, 'stale', false)) {
            throw new ExchangeError (this.id + ' lending snapshot is stale; refresh before trading');
        }
        const chains = this.safeList (data, 'chains', []);
        for (let i = 0; i < chains.length; i++) {
            if (this.safeInteger (chains[i], 'chainId') === this.chainId ()) {
                return chains[i];
            }
        }
        throw new ExchangeError (this.id + ' lending snapshot does not include the configured chain');
    }

    findAsset (assets: any[], id: string): Dict {
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const address = this.safeString2 (asset, 'address', 'contractAddress', '');
            const symbol = this.safeString (asset, 'symbol', '');
            if ((address.toLowerCase () === id.toLowerCase ()) || (symbol.toLowerCase () === id.toLowerCase ())) {
                return asset;
            }
        }
        throw new BadRequest (this.id + ' unknown asset ' + id + ' on chain ' + this.numberToString (this.chainId ()));
    }

    assetAddress (asset: Dict): string {
        return this.safeString2 (asset, 'address', 'contractAddress', '');
    }

    assetDecimals (asset: Dict): int {
        const token = this.safeDict (asset, 'tokenData', {});
        const decimals = this.safeInteger (asset, 'decimals', this.safeInteger (token, 'decimals'));
        if ((decimals === undefined) || (decimals < 0) || (decimals > 36)) {
            throw new ExchangeError (this.id + ' invalid token decimals');
        }
        return decimals;
    }

    decimalScale (decimals: int): string {
        const one = '1';
        return one.padEnd (decimals + 1, '0');
    }

    rawAmount (amount: string, decimals: int): string {
        if (!this.isDecimalString (amount) || !Precise.stringGt (amount, '0')) {
            throw new InvalidOrder (this.id + ' amount must be a positive decimal string');
        }
        const scale = this.decimalScale (decimals);
        const raw = Precise.stringMul (amount, scale);
        const integer = this.decimalToPrecision (raw, TRUNCATE, 0);
        if (!Precise.stringEq (raw, integer)) {
            throw new InvalidOrder (this.id + ' amount exceeds token precision');
        }
        if (Precise.stringGt (integer, '115792089237316195423570985008687907853269984665640564039457584007913129639935')) {
            throw new InvalidOrder (this.id + ' amount exceeds uint256');
        }
        return integer;
    }

    ceilRaw (raw: string): string {
        const floor = this.decimalToPrecision (raw, TRUNCATE, 0);
        return Precise.stringEq (raw, floor) ? floor : Precise.stringAdd (floor, '1') as string;
    }

    humanAmount (raw: string, decimals: int): string {
        return Precise.stringDiv (raw, this.decimalScale (decimals), 36) as string;
    }

    async marketRows (params: Dict = {}): Promise<any[]> {
        const response = await this.publicGetMmSpotMarketsV2 (this.extend (this.omit (params, 'chainId'), { 'chainId': this.chainId (params) }));
        return this.unwrap (response);
    }

    /**
     * @method
     * @name flyingtulip#fetchCurrencies
     * @description fetches token metadata and precision; transfer availability is not supplied by the registry
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchCurrencies (params: Dict = {}): Promise<Currencies> {
        this.chainId (params);
        const rows = await this.registry ();
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const code = this.safeCurrencyCode (this.safeString (row, 'symbol')) as string;
            result[code] = this.safeCurrencyStructure ({
                'id': this.assetAddress (row), 'code': code, 'name': this.safeString (row, 'name'),
                'type': 'crypto',
                'precision': this.parseNumber ('1e-' + this.numberToString (this.assetDecimals (row))),
                'info': row,
            });
        }
        return result;
    }

    /**
     * @method
     * @name flyingtulip#fetchTradingFees
     * @description fetches protocol fee rates; executor gas can add a token-denominated fee
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchTradingFees (params: Dict = {}): Promise<TradingFees> {
        this.chainId (params);
        await this.loadMarkets ();
        const result: TradingFees = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            result[symbol] = { 'symbol': symbol, 'maker': 0.0005, 'taker': 0.0005, 'percentage': true, 'tierBased': false, 'info': { 'protocolFeeBps': 5, 'minimumRaw': '1', 'additionalExecutionFee': true }};
        }
        return result;
    }

    override parseTrade (trade: Dict, market: Market = undefined): Trade {
        const symbolId = this.safeString (trade, 'symbol');
        const resolvedMarket = (symbolId === undefined) ? market : this.safeMarket (symbolId, market);
        const timestamp = this.safeInteger (trade, 'timestamp', this.parse8601 (this.safeString (trade, 'event_time')));
        const tx = this.safeString2 (trade, 'txHash', 'tx_hash', '');
        const logIndex = this.safeString (trade, 'log_index', '');
        const valuation = this.safeString2 (trade, 'valuationStatus', 'valuation_status');
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId', tx + ':' + logIndex),
            'timestamp': timestamp, 'datetime': this.iso8601 (timestamp),
            'symbol': this.safeString (resolvedMarket, 'symbol'),
            'order': this.safeString2 (trade, 'orderId', 'order_id'),
            'takerOrMaker': undefined,
            'side': this.safeString2 (trade, 'direction', 'side'),
            'amount': this.safeString2 (trade, 'size', 'size_base'),
            'price': (valuation === 'unknown_liquidation') ? undefined : this.safeString (trade, 'price'),
            'cost': (valuation === 'unknown_liquidation') ? undefined : this.safeString2 (trade, 'tradeValue', 'notional'),
            'fee': { 'cost': this.safeString (trade, 'fee'), 'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')) },
            'info': trade,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name flyingtulip#fetchMyTrades
     * @description fetches one page of completed account fills with realized prices and fees
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds, applied to the returned page
     * @param {int} [limit] maximum number of results on the requested page
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {int} [params.page] account trade page
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const request: Dict = { 'chainId': this.chainId (params), 'address': this.accountAddress (params), 'page': this.safeInteger (params, 'page', 1) };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (market !== undefined) {
            request['symbol'] = market['id'];
        }
        const response = await this.publicGetMmSpotAccountTrades (request);
        const rows = this.unwrap (response);
        return this.parseTrades (rows, market, since, limit);
    }

    marketKey (market: Market): string {
        const base = this.safeStringLower (market, 'baseId', '') as string;
        const quote = this.safeStringLower (market, 'quoteId', '') as string;
        return base.slice (2) + '-' + quote.slice (2);
    }

    /**
     * @method
     * @name flyingtulip#fetchTrades
     * @description fetches recent actual public executions for one token pair
     * @param {string} symbol unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds, applied to the returned page
     * @param {int} [limit] maximum number of results on the requested page
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.before] public trade cursor
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = { 'chainId': this.chainId (params), 'market_key': this.marketKey (market) };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const before = this.safeString (params, 'before');
        if (before !== undefined) {
            request['before'] = before;
        }
        const response = await this.publicGetMmSpotTradesMarketKey (request);
        const data = this.unwrap (response);
        return this.parseTrades (this.safeList (data, 'trades', []), market, since, limit);
    }

    /**
     * @method
     * @name flyingtulip#fetchMarkets
     * @description fetches chain-scoped financed spot markets with independent collateral and debt assets; maker/taker rates describe the protocol fee and exclude additional executor gas
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchMarkets (params: Dict = {}): Promise<Market[]> {
        this.chainId (params);
        const assets = await this.registry ();
        const rows = await this.marketRows (params);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if ((this.safeString (row, 'marketType') !== 'perps') || (this.safeInteger (row, 'chainId') !== this.chainId ())) {
                continue;
            }
            const baseAsset = this.findAsset (assets, this.safeString (row, 'baseTokenAddress', ''));
            const quoteAsset = this.findAsset (assets, this.safeString (row, 'quoteTokenAddress', ''));
            const base = this.safeCurrencyCode (this.safeString (row, 'baseToken'));
            const quote = this.safeCurrencyCode (this.safeString (row, 'quoteToken'));
            result.push (this.safeMarketStructure ({
                'id': this.safeString (row, 'symbol'),
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': this.assetAddress (baseAsset),
                'quoteId': this.assetAddress (quoteAsset),
                'type': 'spot',
                'spot': true,
                'margin': true,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'maker': 0.0005,
                'taker': 0.0005,
                'percentage': true,
                'tierBased': false,
                'marginModes': { 'cross': true, 'isolated': false },
                'active': this.safeBool (row, 'canOpenLong', false) || this.safeBool (row, 'canOpenShort', false),
                'precision': { 'amount': this.parseNumber ('1e-' + this.numberToString (this.assetDecimals (baseAsset))), 'price': 1e-18 },
                'limits': { 'leverage': { 'min': 1, 'max': this.safeNumber (row, 'maxLeverage') }},
                'info': this.extend (row, { 'baseDecimals': this.assetDecimals (baseAsset), 'quoteDecimals': this.assetDecimals (quoteAsset) }),
            }));
        }
        return result;
    }

    override parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        return this.safeTicker ({
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'last': this.safeString (ticker, 'lastPrice'),
            'high': this.safeString (ticker, 'high24h'),
            'low': this.safeString (ticker, 'low24h'),
            'change': this.safeString (ticker, 'priceChange24h'),
            'percentage': this.safeString (ticker, 'priceChangePct24h'),
            'quoteVolume': this.safeString (ticker, 'volume24h'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name flyingtulip#fetchTickers
     * @description fetches current prices and 24 hour statistics for several markets
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const rows = await this.marketRows (params);
        const normalized = this.marketSymbols (symbols);
        const result: Dict = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if ((this.safeString (row, 'marketType') === 'perps') && (this.safeInteger (row, 'chainId') === this.chainId ())) {
                const market = this.safeMarket (this.safeString (row, 'symbol'));
                result[market['symbol']] = this.parseTicker (row, market);
            }
        }
        return this.filterByArrayTickers (result, 'symbol', normalized);
    }

    /**
     * @method
     * @name flyingtulip#fetchTicker
     * @description fetches current prices and 24 hour statistics
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const tickers = await this.fetchTickers ([ market['symbol'] ], params);
        const ticker = this.safeDict (tickers, market['symbol']);
        if (ticker === undefined) {
            throw new BadSymbol (this.id + ' ticker unavailable for ' + symbol);
        }
        return ticker as Ticker;
    }

    /**
     * @method
     * @name flyingtulip#fetchBalance
     * @description fetches margin collateral, or wallet tokens with params.type set to spot
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.type] margin or spot
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchBalance (params: Dict = {}): Promise<Balances> {
        this.chainId (params);
        const address = this.accountAddress (params);
        const type = this.safeString (params, 'type', 'margin');
        const result: Dict = { 'info': undefined };
        if (type === 'spot') {
            const rows = await this.registry (address);
            result['info'] = rows;
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const code = this.safeCurrencyCode (this.safeString (row, 'symbol')) as string;
                if (this.safeBool (row, 'userBalanceUnavailable', false)) {
                    result[code] = this.account ();
                } else {
                    result[code] = { 'free': this.humanAmount (this.safeString (row, 'userBalanceRaw', '0'), this.assetDecimals (row)), 'used': '0' };
                }
            }
        } else if (type === 'margin') {
            const chain = await this.lendAccount (address);
            result['info'] = chain;
            const assets = this.safeList (chain, 'assets', []);
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                const metrics = this.safeDict (asset, 'userMetrics', {});
                const code = this.safeCurrencyCode (this.safeString (asset, 'symbol')) as string;
                const decimals = this.assetDecimals (asset);
                const totalRaw = this.safeString (metrics, 'totalCollateralRaw');
                const availableRaw = this.safeString (metrics, 'totalWithdrawableRaw');
                const account = this.account ();
                if ((totalRaw !== undefined) && (totalRaw !== '') && (availableRaw !== undefined) && (availableRaw !== '')) {
                    account['total'] = this.humanAmount (totalRaw, decimals);
                    account['free'] = this.humanAmount (availableRaw, decimals);
                    account['used'] = Precise.stringSub (account['total'], account['free']);
                }
                result[code] = account;
            }
        } else {
            throw new NotSupported (this.id + ' fetchBalance type must be spot or margin');
        }
        return this.safeBalance (result);
    }

    override parsePosition (position: Dict, market: Market = undefined): Position {
        const resolvedMarket = this.safeMarket (this.safeString (position, 'symbol'), market);
        return this.safePosition ({
            'id': this.safeString (position, 'positionId'),
            'symbol': resolvedMarket['symbol'],
            'side': this.safeString (position, 'side'),
            'contracts': this.safeNumber (position, 'size'),
            'contractSize': 1,
            'entryPrice': this.safeNumber (position, 'entryPrice'),
            'markPrice': this.safeNumber (position, 'markPrice'),
            'unrealizedPnl': this.safeNumber (position, 'pnlAmount'),
            'leverage': this.safeNumber (position, 'blendedLeverage'),
            'marginMode': 'cross',
            'info': position,
        });
    }

    /**
     * @method
     * @name flyingtulip#fetchPositions
     * @description fetches confirmed cross-margin positions, excluding pending order projections
     * @param {string[]} [symbols] unified market symbols
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        const response = await this.publicGetMmSpotAccountPositions ({ 'chainId': this.chainId (params), 'address': this.accountAddress (params) });
        const rows = this.unwrap (response);
        const result = [];
        for (let i = 0; i < rows.length; i++) {
            if (!this.safeBool (rows[i], 'isPending', false)) {
                result.push (this.parsePosition (rows[i]));
            }
        }
        return this.filterByArrayPositions (result, 'symbol', symbols);
    }

    orderStatus (status: Str): Str {
        return this.safeString ({
            'pending': 'open', 'processing': 'open', 'claimed': 'open',
            'broadcasting': 'open', 'pending_trigger': 'open',
            'pending_liquidity': 'open', 'blocked': 'open',
            'pending_gas': 'open', 'orphaned_reconciling': 'open', 'operator_required': 'open',
            'filled': 'closed', 'failed': 'rejected',
            'cancelled': 'canceled', 'canceled': 'canceled', 'expired': 'expired',
        }, status, status);
    }

    override parseOrder (order: Dict, market: Market = undefined): Order {
        let resolvedMarket = market;
        const rawMarket = this.safeString2 (order, 'marketSymbol', 'symbol');
        if (rawMarket !== undefined) {
            resolvedMarket = this.safeMarket (rawMarket, market);
        }
        const timestamp = this.safeTimestamp (order, 'createdAt');
        // Display size and limitPrice are client metadata, never executed fills.
        // The executor does not publish a realized base quantity or fill price.
        return this.safeOrder ({
            'id': this.safeString2 (order, 'id', 'orderId'),
            'symbol': this.safeString (resolvedMarket, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'status': this.orderStatus (this.safeString (order, 'status')),
            'type': this.safeString2 (order, 'clientOrderType', 'orderType'),
            'side': this.safeString (order, 'direction'),
            'amount': this.safeString2 (order, 'size', 'amount'),
            'price': this.safeString2 (order, 'limitPrice', 'price'),
            'info': order,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name flyingtulip#fetchOrder
     * @description fetches one executor order without inferring realized fills from display metadata
     * @param {string} id executor order identifier
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const response = await this.publicGetMmLeverageOrdersId ({ 'id': id, 'chainId': this.chainId (params) });
        const row = response;
        if (this.safeString2 (row, 'id', 'orderId') === undefined) {
            throw new OrderNotFound (this.id + ' order not found ' + id);
        }
        if (this.safeInteger (row, 'chainId', this.chainId ()) !== this.chainId ()) {
            throw new BadRequest (this.id + ' order belongs to another chain; use a matching instance');
        }
        return this.parseOrder (row, (symbol === undefined) ? undefined : this.market (symbol));
    }

    /**
     * @method
     * @name flyingtulip#fetchOrders
     * @description fetches one bounded executor page and applies symbol and timestamp filters
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds, applied to the returned page
     * @param {int} [limit] maximum number of results on the requested page
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {int} [params.offset] executor pagination offset
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const request = { 'chainId': this.chainId (params), 'user': this.accountAddress (params), 'limit': (limit === undefined) ? 100 : Math.min (limit, 500), 'offset': this.safeInteger (params, 'offset', 0), 'status': this.safeString (params, 'status') };
        const response = await this.publicGetMmLeverageOrders (request);
        const rows = this.safeList (response, 'orders', []);
        return this.parseOrders (rows, (symbol === undefined) ? undefined : this.market (symbol), since, limit);
    }

    /**
     * @method
     * @name flyingtulip#fetchOpenOrders
     * @description fetches working orders from one bounded executor page
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds, applied to the returned page
     * @param {int} [limit] maximum number of results on the requested page
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {int} [params.offset] executor pagination offset
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        return this.filterBySinceLimit (this.filterBy (orders, 'status', 'open'), since, limit);
    }

    /**
     * @method
     * @name flyingtulip#fetchClosedOrders
     * @description fetches filled orders from one bounded executor page
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] earliest timestamp in milliseconds, applied to the returned page
     * @param {int} [limit] maximum number of results on the requested page
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {int} [params.offset] executor pagination offset
     * @returns {object[]} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        const orders = await this.fetchOrders (symbol, since, undefined, params);
        return this.filterBySinceLimit (this.filterBy (orders, 'status', 'closed'), since, limit);
    }

    fee (sellAmount: string, bps: int = 5): string {
        const calculated = this.decimalToPrecision (Precise.stringDiv (Precise.stringMul (sellAmount, bps.toString ()), '10000'), TRUNCATE, 0);
        return Precise.stringMax (calculated, '1') as string;
    }

    async feeEstimate (token: string, action: string): Promise<Dict> {
        let result: Dict = {};
        try {
            result = await this.publicGetMmLeverageFeeEstimate ({ 'chainId': this.chainId (), 'sellToken': token, 'action': action });
        } catch (error) {
            const message = this.exceptionMessage (error);
            if (message.indexOf ('EXECUTOR_FEE_DISABLED') >= 0) {
                result = { 'success': true, 'feeAmount': '0', 'disabled': true };
            } else {
                throw error;
            }
        }
        return result;
    }

    async orderFee (sellAmount: string, token: string, action: string, session = false): Promise<string> {
        let fee = this.fee (sellAmount, 5);
        if (!session) {
            const estimate = await this.feeEstimate (token, action);
            const gas = this.safeString (estimate, 'feeAmount');
            if (!this.safeBool (estimate, 'success', false) || (gas === undefined) || !this.isDigits (gas)) {
                throw new ExchangeError (this.id + ' execution fee unavailable');
            }
            fee = Precise.stringMax (fee, gas) as string;
        }
        return fee;
    }

    async quote (sellToken: string, buyToken: string, sellAmount: string, feeAmount: string, action: string, slippageBps: int): Promise<Dict> {
        if ((slippageBps < 0) || (slippageBps >= 10000) || (Math.floor (slippageBps) !== slippageBps)) {
            throw new InvalidOrder (this.id + ' slippageBps must be an integer in [0, 10000)');
        }
        const response = await this.publicPostMmLeverageQuote ({
            'chainId': this.chainId (), 'sellToken': sellToken, 'buyToken': buyToken,
            'sellAmount': sellAmount, 'feeAmount': feeAmount, 'action': action, 'slippageBps': slippageBps, 'priceQuality': 'optimal',
        });
        const minimum = this.safeString (response, 'buyAmount');
        if (!this.safeBool (response, 'success', false) || (minimum === undefined) || !this.isDigits (minimum) || !Precise.stringGt (minimum, '0')) {
            throw new ExchangeError (this.id + ' no aggregate quote available');
        }
        return response;
    }

    async quoteExactOut (sellToken: string, buyToken: string, buyAmount: string, action: string, slippageBps: int): Promise<Dict> {
        if ((slippageBps < 0) || (slippageBps >= 10000)) {
            throw new InvalidOrder (this.id + ' slippageBps must be in [0, 10000)');
        }
        const response = await this.publicPostMmLeverageQuote ({
            'chainId': this.chainId (), 'mode': 'exactOut', 'sellToken': sellToken, 'buyToken': buyToken,
            'buyAmount': buyAmount, 'action': action, 'slippageBps': slippageBps, 'priceQuality': 'optimal',
        });
        const sellAmount = this.safeString (response, 'sellAmount', '');
        const minimum = this.safeString (response, 'buyAmount', '');
        if (!this.safeBool (response, 'success', false) || !this.isDigits (sellAmount) || !Precise.stringGt (sellAmount, '0') || !Precise.stringEq (minimum, buyAmount)) {
            throw new ExchangeError (this.id + ' no valid aggregate exact-output quote available');
        }
        this.rawAmount (sellAmount, 0);
        return response;
    }

    assertQuoteVersion (quote: Dict, config: Dict) {
        const engineVersion = this.safeInteger (config, 'engineVersion', 1);
        const quotedVersion = this.safeInteger (quote, 'engineVersion');
        if ((quotedVersion !== undefined) && (quotedVersion !== engineVersion)) {
            throw new ExchangeError (this.id + ' quote and signing engine versions differ; prepare fresh terms');
        }
    }

    orderTypedData (config: Dict, order: Dict): Dict {
        const fields = [
            { 'name': 'action', 'type': 'uint8' }, { 'name': 'user', 'type': 'address' },
            { 'name': 'sellToken', 'type': 'address' }, { 'name': 'buyToken', 'type': 'address' },
            { 'name': 'sellAmount', 'type': 'uint256' }, { 'name': 'buyAmount', 'type': 'uint256' },
            { 'name': 'validTo', 'type': 'uint32' }, { 'name': 'feeAmount', 'type': 'uint256' },
        ];
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            fields.push ({ 'name': 'partiallyFillable', 'type': 'bool' });
        }
        return {
            'domain': { 'name': 'LeverageRfqEngine', 'version': '1', 'chainId': this.safeInteger (config, 'signingChainId'), 'verifyingContract': this.safeString (config, 'leverageRfqEngine') },
            'types': { 'LeveragedOrder': fields }, 'primaryType': 'LeveragedOrder', 'message': order,
        };
    }

    orderDataHash (config: Dict, order: Dict): string {
        const typed = this.orderTypedData (config, order);
        const fields = typed['types']['LeveragedOrder'];
        const names = [];
        const types = [ 'bytes32' ];
        const values = [];
        for (let i = 0; i < fields.length; i++) {
            names.push (fields[i]['type'] + ' ' + fields[i]['name']);
            types.push (fields[i]['type']);
        }
        const typeHash = '0x' + this.hash (this.encode ('LeveragedOrder(' + names.join (',') + ')'), keccak, 'hex');
        values.push (typeHash);
        for (let i = 0; i < fields.length; i++) {
            values.push (order[fields[i]['name']]);
        }
        return '0x' + this.hash (this.ethAbiEncode (types, this.abiArguments (types, values)), keccak, 'hex');
    }

    sessionTypedData (config: Dict, order: Dict, session: Dict): Dict {
        if ((this.safeStringLower (session, 'target', '') !== this.safeStringLower (config, 'leverageRfqEngine', '')) || (this.safeStringLower (session, 'executor', '') !== this.safeStringLower (config, 'executorAddress', '')) || (this.safeString (session, 'dataHash') !== this.orderDataHash (config, order))) {
            throw new InvalidOrder (this.id + ' session call does not bind this engine, executor and order');
        }
        if (Precise.stringLt (this.safeString (session, 'deadline'), this.safeString (order, 'validTo'))) {
            throw new InvalidOrder (this.id + ' session deadline does not cover order expiry');
        }
        return {
            'domain': { 'name': this.safeString (config, 'sessionManagerDomainName'), 'version': '1', 'chainId': this.chainId (), 'verifyingContract': this.safeString (config, 'sessionManager') },
            'types': { 'SessionCall': [
                { 'name': 'sessionId', 'type': 'bytes32' }, { 'name': 'target', 'type': 'address' },
                { 'name': 'dataHash', 'type': 'bytes32' }, { 'name': 'nonce', 'type': 'uint256' },
                { 'name': 'deadline', 'type': 'uint256' }, { 'name': 'executor', 'type': 'address' },
                { 'name': 'feeAmount', 'type': 'uint256' },
            ] },
            'primaryType': 'SessionCall', 'message': session,
        };
    }

    async sessionFee (session: Dict, sellRaw: string, feeRaw: string, sellToken: string, action: string): Promise<string> {
        const bps = this.safeInteger (session, 'maxFeeBps');
        if ((bps === undefined) || (bps < 0) || (bps > 10000)) {
            throw new ArgumentsRequired (this.id + ' session requires verified maxFeeBps');
        }
        const ceiling = this.ceilRaw (Precise.stringDiv (Precise.stringMul (Precise.stringAdd (sellRaw, feeRaw), bps.toString ()), '10000', 80) as string);
        const response = await this.feeEstimate (sellToken, action);
        const gas = this.safeString (response, 'feeAmount');
        if (!this.safeBool (response, 'success', false) || (gas === undefined) || !this.isDigits (gas)) {
            throw new ExchangeError (this.id + ' session posting fee unavailable');
        }
        return Precise.stringMin (gas, ceiling) as string;
    }

    attachSession (request: Dict, config: Dict, input: Dict, postingFee: string): Dict {
        const id = this.safeString (input, 'sessionId', '');
        const nonce = this.safeString (input, 'nonce', '');
        const validUntil = this.safeInteger (input, 'validUntil', 0);
        const order = this.safeDict (request, 'order', {});
        if (!this.isHexString (id, 64) || !this.isDigits (nonce) || (validUntil < this.safeInteger (order, 'validTo', 0))) {
            throw new InvalidOrder (this.id + ' sessionId, nonce and validity must be verified before order preparation');
        }
        const session = {
            'sessionId': id, 'target': this.safeString (config, 'leverageRfqEngine'),
            'dataHash': this.orderDataHash (config, order), 'nonce': nonce,
            'deadline': this.safeString (order, 'validTo'), 'executor': this.safeString (config, 'executorAddress'), 'feeAmount': postingFee,
        };
        request['session'] = session;
        request['sigType'] = 'session';
        return this.sessionTypedData (config, order, session);
    }

    lowerAssetAddress (asset: Dict): string {
        const address = this.assetAddress (asset);
        return address.toLowerCase ();
    }

    privateKeyMatches (address: string): boolean {
        if (this.privateKey === undefined) {
            return false;
        }
        const derived = this.ethGetAddressFromPrivateKey (this.privateKey);
        const actual = derived.toLowerCase ();
        const expected = address.toLowerCase ();
        return actual === expected;
    }

    signTypedData (typed: Dict): string {
        if (this.privateKey === undefined) {
            throw new AuthenticationError (this.id + ' requires privateKey or a signature over the prepared order');
        }
        const encoded = this.ethEncodeStructuredData (typed['domain'], typed['types'], typed['message']);
        const digest = this.hash (encoded, keccak, 'hex');
        const signature = ecdsa (digest, this.privateKey.slice (-64), secp256k1, null);
        return '0x' + signature['r'] + signature['s'] + this.intToBase16 (this.sum (signature['v'], 27));
    }

    checkOrderOptions (type: string, side: string, params: Dict) {
        if ((type !== 'market') && (type !== 'limit')) {
            throw new NotSupported (this.id + ' supports market and limit orders');
        }
        if ((side !== 'buy') && (side !== 'sell')) {
            throw new InvalidOrder (this.id + ' side must be buy or sell');
        }
        const unsupported = [ 'postOnly', 'stopPrice', 'stopLoss', 'takeProfit', 'stopLossPrice', 'takeProfitPrice', 'triggerPrice', 'triggerDirection', 'trailingPercent', 'trailingAmount', 'positionSide', 'hedged', 'clientOrderId', 'timeInForce', 'partiallyFillable' ];
        for (let i = 0; i < unsupported.length; i++) {
            if (this.safeValue (params, unsupported[i]) !== undefined) {
                throw new NotSupported (this.id + ' unsupported order option ' + unsupported[i]);
            }
        }
        const marginMode = this.safeString (params, 'marginMode', 'cross');
        if (marginMode !== 'cross') {
            throw new NotSupported (this.id + ' supports cross margin only');
        }
        if (this.safeBool (params, 'reduceOnly', false)) {
            throw new NotSupported (this.id + ' use closePosition for a debt-aware close');
        }
    }

    resolveLongDebt (assets: any[], quoteId: string, quoteCost: string, engineVersion: int): Dict {
        const quoteAsset = this.findAsset (assets, quoteId);
        const quotePrice = this.safeString2 (quoteAsset, 'oracleTokenPrice', 'tokenprice');
        const candidates = [ quoteId, 'USDC', 'USDT', 'ftUSD' ];
        for (let i = 0; i < candidates.length; i++) {
            let candidate: Dict = {};
            for (let j = 0; j < assets.length; j++) {
                const asset = assets[j];
                const address = this.lowerAssetAddress (asset);
                const identifier = candidates[i];
                const lowerId = identifier.toLowerCase ();
                if ((address === lowerId) || (this.safeStringLower (asset, 'symbol', '') === lowerId)) {
                    candidate = asset;
                    break;
                }
            }
            if (!this.safeBool (candidate, 'isBorrowable', false) || this.safeBool (candidate, 'isBorrowPaused', false) || !this.safeBool (candidate, 'priceAvailable', false)) {
                continue;
            }
            if ((this.safeStringLower (candidate, 'symbol', '') === 'ftusd') && (engineVersion !== 2)) {
                continue;
            }
            const price = this.safeString2 (candidate, 'oracleTokenPrice', 'tokenprice');
            const metrics = this.safeDict (candidate, 'globalMetrics', {});
            const available = this.safeString (metrics, 'availableToBorrow');
            if ((price === undefined) || (quotePrice === undefined) || (available === undefined) || !Precise.stringGt (price, '0') || !Precise.stringGt (quotePrice, '0')) {
                continue;
            }
            const required = Precise.stringDiv (Precise.stringMul (quoteCost, quotePrice), price, 36);
            if (Precise.stringLe (Precise.stringMul (required, '1.0005'), Precise.stringMul (available, '0.95'))) {
                return candidate;
            }
        }
        throw new InsufficientFunds (this.id + ' no borrowable quote or routing stable has sufficient liquidity');
    }

    /**
     * @method
     * @name flyingtulip#prepareLeverageOrder
     * @description prepares exact exposure terms and unsigned approvals without signing or submitting
     * @param {string} symbol unified market symbol
     * @param {string} type market or limit
     * @param {string} side buy or sell; a close must oppose the position side
     * @param {float|string} amount base amount, or collateral token amount for a deposit
     * @param {float|string} [price] limit price in market quote units
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.collateral] valid deposited collateral symbol or token address
     * @param {string} [params.debtToken] optional borrow asset; a short must borrow base
     * @param {string} [params.fundingToken] quote-side asset bought by a short
     * @param {string} [params.cost] market buy quote notional excluding fees
     * @param {string} [params.leverage] requested sizing annotation checked against market bounds
     * @param {int} [params.slippageBps] market quote tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified sessionId, nonce, validUntil, delegate and maxFeeBps
     * @returns {object} unsigned prepared terms for caller review and signing
     */
    async prepareLeverageOrder (symbol: string, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params: Dict = {}): Promise<Dict> {
        this.checkOrderOptions (type, side, params);
        this.chainId (params);
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!this.safeBool (market['info'], (side === 'buy') ? 'canOpenLong' : 'canOpenShort', false)) {
            throw new InvalidOrder (this.id + ' market does not permit opening this side');
        }
        const config = await this.configuration ();
        const address = this.accountAddress (params);
        const chain = await this.lendAccount (address);
        const assets = this.safeList (chain, 'assets', []);
        const collateralId = this.safeString (params, 'collateral');
        if (collateralId === undefined) {
            throw new ArgumentsRequired (this.id + ' requires params.collateral (symbol or token address)');
        }
        const collateral = this.findAsset (assets, collateralId);
        if (!this.safeBool (collateral, 'isCollateral', false)) {
            throw new InvalidOrder (this.id + ' selected asset is not valid collateral');
        }
        const metrics = this.safeDict (collateral, 'userMetrics', {});
        const marginRaw = this.safeString (metrics, 'totalCollateralRaw', '0');
        if (!Precise.stringGt (marginRaw, '0')) {
            throw new InsufficientFunds (this.id + ' deposit collateral before opening exposure');
        }
        const amountString = (amount === undefined) ? undefined : this.numberToString (amount);
        const explicitDebt = this.safeString (params, 'debtToken');
        let quoteCost = this.safeString (params, 'cost');
        const exactOut = (side === 'buy') && (type === 'market') && (quoteCost === undefined);
        if ((side === 'buy') && (quoteCost === undefined)) {
            if (amountString === undefined) {
                throw new ArgumentsRequired (this.id + ' buy requires a base amount or params.cost');
            }
            if (exactOut) {
                const baseAsset = this.findAsset (assets, market['baseId'] as string);
                const marketQuote = this.findAsset (assets, market['quoteId'] as string);
                const basePrice = this.safeString2 (baseAsset, 'oracleTokenPrice', 'tokenprice');
                const routeQuotePrice = this.safeString2 (marketQuote, 'oracleTokenPrice', 'tokenprice');
                if (!Precise.stringGt (basePrice, '0') || !Precise.stringGt (routeQuotePrice, '0')) {
                    throw new ExchangeError (this.id + ' oracle prices unavailable for borrow route selection');
                }
                // Only a liquidity-selection estimate. The signed input below
                // comes exclusively from the aggregate exact-output quote.
                quoteCost = Precise.stringDiv (Precise.stringMul (amountString, basePrice), routeQuotePrice, 36) as string;
            } else {
                if (price === undefined) {
                    throw new ArgumentsRequired (this.id + ' limit buy requires a price');
                }
                quoteCost = Precise.stringMul (amountString, this.numberToString (price)) as string;
            }
        }
        if ((quoteCost !== undefined) && (!this.isDecimalString (quoteCost) || !Precise.stringGt (quoteCost, '0'))) {
            throw new InvalidOrder (this.id + ' cost must be a positive decimal');
        }
        const debtId = (explicitDebt === undefined) ? market['baseId'] as string : explicitDebt;
        const debt = ((side === 'buy') && (explicitDebt === undefined)) ? this.resolveLongDebt (assets, market['quoteId'] as string, quoteCost as string, this.safeInteger (config, 'engineVersion', 1)) : this.findAsset (assets, debtId);
        if (!this.safeBool (debt, 'isBorrowable', false) || this.safeBool (debt, 'isBorrowPaused', false) || !this.safeBool (debt, 'priceAvailable', false) || ((this.safeStringLower (debt, 'symbol', '') === 'ftusd') && (this.safeInteger (config, 'engineVersion', 1) !== 2))) {
            throw new InvalidOrder (this.id + ' debt token is not borrowable');
        }
        if ((side === 'sell') && (this.lowerAssetAddress (debt) !== this.safeStringLower (market, 'baseId', ''))) {
            throw new InvalidOrder (this.id + ' a short borrows the base asset');
        }
        const fundingId = this.safeString (params, 'fundingToken', market['quoteId']) as string;
        const boughtId = (side === 'buy') ? market['baseId'] : fundingId;
        const bought = this.findAsset (assets, boughtId as string);
        if (this.safeBool (bought, 'isDepositPaused', false)) {
            throw new InvalidOrder (this.id + ' exposure token deposits are paused');
        }
        const debtPrice = this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice');
        const quoteAsset = this.findAsset (assets, market['quoteId'] as string);
        const quotePrice = this.safeString2 (quoteAsset, 'oracleTokenPrice', 'tokenprice');
        const boughtPrice = this.safeString2 (bought, 'oracleTokenPrice', 'tokenprice');
        if (!Precise.stringGt (debtPrice, '0') || !Precise.stringGt (quotePrice, '0') || !Precise.stringGt (boughtPrice, '0')) {
            throw new ExchangeError (this.id + ' oracle prices unavailable');
        }
        if ((type === 'limit') && ((price === undefined) || !Precise.stringGt (this.numberToString (price), '0'))) {
            throw new ArgumentsRequired (this.id + ' limit order requires a positive price');
        }
        let sellHuman: string;
        if (side === 'sell') {
            if (amountString === undefined) {
                throw new ArgumentsRequired (this.id + ' short requires a base amount');
            }
            sellHuman = amountString;
        } else {
            const debtCost = Precise.stringDiv (Precise.stringMul (quoteCost, quotePrice), debtPrice, this.assetDecimals (debt));
            sellHuman = debtCost as string;
        }
        let sellRaw = exactOut ? '0' : this.rawAmount (sellHuman, this.assetDecimals (debt));
        const sellToken = this.assetAddress (debt);
        const buyToken = this.assetAddress (bought);
        if (sellToken.toLowerCase () === buyToken.toLowerCase ()) {
            throw new InvalidOrder (this.id + ' debt and exposure tokens must differ');
        }
        const slippageBps = this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps', 100));
        let quote: Dict = {};
        if (exactOut) {
            const target = this.rawAmount (amountString as string, this.assetDecimals (bought));
            quote = await this.quoteExactOut (sellToken, buyToken, target, 'open', slippageBps);
            sellRaw = this.safeString (quote, 'sellAmount', '0');
        }
        const sessionInput = this.safeDict (params, 'session');
        const feeAmount = await this.orderFee (sellRaw, sellToken, 'open', sessionInput !== undefined);
        const postingFee = (sessionInput === undefined) ? '0' : await this.sessionFee (sessionInput, sellRaw, feeAmount, sellToken, 'open');
        const liquidity = this.safeDict (debt, 'globalMetrics', {});
        const available = this.safeString (liquidity, 'availableToBorrow');
        const grossHuman = this.humanAmount (Precise.stringAdd (sellRaw, Precise.stringAdd (feeAmount, postingFee)) as string, this.assetDecimals (debt));
        if ((available === undefined) || Precise.stringGt (grossHuman, Precise.stringMul (available, '0.95'))) {
            throw new InsufficientFunds (this.id + ' insufficient borrow liquidity for debt and fees');
        }
        if (!exactOut) {
            quote = await this.quote (sellToken, buyToken, sellRaw, feeAmount, 'open', slippageBps);
        }
        this.assertQuoteVersion (quote, config);
        let buyAmount = this.safeString (quote, 'buyAmount');
        if (type === 'limit') {
            if (side === 'buy') {
                buyAmount = this.rawAmount (amountString as string, this.assetDecimals (bought));
            } else {
                const quoteMinimum = Precise.stringMul (sellHuman, this.numberToString (price));
                const boughtMinimum = Precise.stringDiv (Precise.stringMul (quoteMinimum, quotePrice), boughtPrice, 80);
                // Round the minimum UP: truncating a price floor weakens signed terms.
                const rawMinimum = Precise.stringMul (boughtMinimum, this.decimalScale (this.assetDecimals (bought)));
                buyAmount = this.ceilRaw (rawMinimum as string);
            }
        } else if ((amountString !== undefined) && (side === 'buy')) {
            buyAmount = Precise.stringMax (buyAmount, this.rawAmount (amountString as string, this.assetDecimals (bought)));
        }
        this.checkAccountRisk (chain, assets, debt, bought, sellRaw, buyAmount as string, Precise.stringAdd (feeAmount, postingFee) as string, config);
        const leverage = this.safeString (params, 'leverage', '1');
        const maximum = this.safeString (market['info'], 'maxLeverage');
        if (!Precise.stringGt (leverage, '0') || Precise.stringLt (leverage, '1') || ((maximum !== undefined) && Precise.stringGt (leverage, maximum))) {
            throw new InvalidOrder (this.id + ' leverage exceeds market bounds');
        }
        const validTo = this.safeInteger (params, 'validTo', this.seconds () + this.safeInteger (this.options, 'validitySeconds', 3600));
        if ((validTo <= this.seconds ()) || (validTo > 4294967295)) {
            throw new InvalidOrder (this.id + ' validTo must be a future uint32 timestamp');
        }
        const order: Dict = { 'action': 0, 'user': address, 'sellToken': sellToken, 'buyToken': buyToken, 'sellAmount': sellRaw, 'buyAmount': buyAmount, 'validTo': validTo, 'feeAmount': feeAmount };
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            order['partiallyFillable'] = false;
        }
        const request: Dict = {
            'order': order, 'user': address, 'isOpen': true, 'orderType': 'open',
            'marketSymbol': market['id'], 'direction': side,
            'size': (amountString === undefined) ? this.humanAmount (buyAmount as string, this.assetDecimals (bought)) : amountString, 'clientOrderType': type,
            'limitPrice': (type === 'limit') ? this.numberToString (price) : undefined,
            'collateral': this.safeString (collateral, 'symbol'), 'source': 'trs',
            'leverageBps': this.decimalToPrecision (Precise.stringMul (leverage, '10000'), TRUNCATE, 0),
            'engineVersion': this.safeInteger (config, 'engineVersion', 1), 'currentSlippageBps': slippageBps,
        };
        if (type === 'limit') {
            // Oracle triggers are an optimization only; buyAmount remains the
            // exact signed limit even when a route gets better execution.
            request['triggerPrice'] = Precise.stringMul (this.numberToString (price), quotePrice);
            request['triggerSide'] = (side === 'buy') ? 'below' : 'above';
            request['triggerAsset'] = market['baseId'];
        }
        const typedData = (sessionInput === undefined) ? this.orderTypedData (config, order) : this.attachSession (request, config, sessionInput, postingFee);
        return { 'request': request, 'typedData': typedData, 'quote': quote, 'leverage': leverage, 'approvals': (sessionInput === undefined) ? this.engineApprovals (order, config) : [] };
    }

    /**
     * @method
     * @name flyingtulip#createOrder
     * @description opens cross-margin exposure signed by the owner or session delegate key
     * @param {string} symbol unified market symbol
     * @param {string} type market or limit
     * @param {string} side buy or sell; a close must oppose the position side
     * @param {float|string} amount base amount, or collateral token amount for a deposit
     * @param {float|string} [price] limit price in market quote units
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.collateral] valid deposited collateral symbol or token address
     * @param {string} [params.debtToken] optional borrow asset; a short must borrow base
     * @param {string} [params.fundingToken] quote-side asset bought by a short
     * @param {string} [params.cost] market buy quote notional excluding fees
     * @param {string} [params.leverage] requested sizing annotation checked against market bounds
     * @param {int} [params.slippageBps] market quote tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified sessionId, nonce, validUntil, delegate and maxFeeBps
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: Num, price: Num = undefined, params: Dict = {}): Promise<Order> {
        const prepared = await this.prepareLeverageOrder (symbol, type, side, amount, price, params);
        const session = this.safeDict (params, 'session');
        const signer = (session === undefined) ? this.accountAddress (params) : this.safeString (session, 'delegate', '');
        if (!this.privateKeyMatches (signer)) {
            throw new AuthenticationError (this.id + ' privateKey must belong to the owner or verified session delegate');
        }
        const signature = this.signTypedData (this.safeDict (prepared, 'typedData', {}));
        const result = await this.submitLeverageOrder (prepared, signature, (session === undefined) ? 'eip712' : 'session');
        return this.safeOrder (result, this.market (symbol));
    }

    /**
     * @method
     * @name flyingtulip#submitLeverageOrder
     * @description submits exact prepared terms with an owner, contract-wallet or session signature
     * @param {object} prepared immutable payload from the matching prepare method
     * @param {string} ownerSignature hex signature over the exact prepared typed data
     * @param {string} [sigType] eip712, erc1271 or session
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    async submitLeverageOrder (prepared: Dict, ownerSignature: string, sigType = 'erc1271'): Promise<Order> {
        if ((sigType !== 'eip712') && (sigType !== 'erc1271') && (sigType !== 'session')) {
            throw new NotSupported (this.id + ' external signing supports eip712, erc1271 or session');
        }
        const request = this.safeDict (prepared, 'request', {});
        const order = this.safeDict (request, 'order', {});
        if (this.safeInteger (order, 'validTo', 0) <= this.seconds ()) {
            throw new InvalidOrder (this.id + ' prepared order has expired');
        }
        const config = await this.configuration ();
        const session = this.safeDict (request, 'session');
        if ((sigType === 'session') !== (session !== undefined)) {
            throw new InvalidOrder (this.id + ' signature mode does not match prepared payload');
        }
        const expected = (session === undefined) ? this.orderTypedData (config, order) : this.sessionTypedData (config, order, session);
        if (this.json (expected) !== this.json (this.safeDict (prepared, 'typedData', {}))) {
            throw new InvalidOrder (this.id + ' prepared payload or signing configuration changed');
        }
        const authentication: Dict = { 'sigType': sigType, 'chainId': this.chainId () };
        const signatureKey = (sigType === 'session') ? 'delegateSignature' : 'ownerSignature';
        authentication[signatureKey] = ownerSignature;
        const response = await this.publicPostMmLeverageOrders (this.extend (request, authentication));
        return this.parseOrder (this.extend (request, response));
    }

    /**
     * @method
     * @name flyingtulip#createMarketBuyOrderWithCost
     * @description opens a long using a quote-token notional budget excluding additional signed fees
     * @param {string} symbol unified market symbol
     * @param {float|string} cost quote-token notional excluding additional signed fees
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.collateral] valid deposited collateral symbol or token address
     * @param {string} [params.debtToken] optional borrow asset; a short must borrow base
     * @param {string} [params.fundingToken] quote-side asset bought by a short
     * @param {string} [params.cost] market buy quote notional excluding fees
     * @param {string} [params.leverage] requested sizing annotation checked against market bounds
     * @param {int} [params.slippageBps] market quote tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified sessionId, nonce, validUntil, delegate and maxFeeBps
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async createMarketBuyOrderWithCost (symbol: string, cost: Num, params: Dict = {}): Promise<Order> {
        return await this.createOrder (symbol, 'market', 'buy', undefined, undefined, this.extend (params, { 'cost': this.numberToString (cost) }));
    }

    /**
     * @method
     * @name flyingtulip#prepareCancelOrder
     * @description prepares short-lived cancel typed data without signing or submitting
     * @param {string} id executor order identifier
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.sessionId] authorized cancellation delegate session
     * @returns {object} unsigned prepared terms for caller review and signing
     */
    async prepareCancelOrder (id: string, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        const config = await this.configuration ();
        const deadline = this.seconds () + 300;
        const typed = {
            'domain': { 'name': this.safeString (config, 'sessionManagerDomainName'), 'version': '1', 'chainId': this.safeInteger (config, 'signingChainId'), 'verifyingContract': this.safeString (config, 'sessionManager') },
            'types': { 'CancelOrder': [ { 'name': 'orderId', 'type': 'string' }, { 'name': 'deadline', 'type': 'uint256' } ] },
            'primaryType': 'CancelOrder', 'message': { 'orderId': id, 'deadline': deadline },
        };
        return { 'request': { 'id': id, 'chainId': this.chainId (), 'deadline': deadline, 'sessionId': this.safeString (params, 'sessionId') }, 'typedData': typed };
    }

    /**
     * @method
     * @name flyingtulip#submitCancelOrder
     * @description submits an externally signed owner or session-delegate cancellation
     * @param {object} prepared immutable payload from the matching prepare method
     * @param {string} signature hex signature over the exact prepared cancel typed data
     * @param {string} [symbol] unified market symbol
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    async submitCancelOrder (prepared: Dict, signature: string, symbol: Str = undefined): Promise<Order> {
        const request = this.safeDict (prepared, 'request', {});
        const deadline = this.safeInteger (request, 'deadline', 0);
        if ((deadline <= this.seconds ()) || (deadline > this.seconds () + 600) || (this.safeInteger (request, 'chainId') !== this.chainId ())) {
            throw new InvalidOrder (this.id + ' cancel signature expiry or chain is invalid');
        }
        const config = await this.configuration ();
        const typed = this.safeDict (prepared, 'typedData', {});
        const domain = this.safeDict (typed, 'domain', {});
        const message = this.safeDict (typed, 'message', {});
        if ((this.safeString (domain, 'verifyingContract') !== this.safeString (config, 'sessionManager')) || (this.safeInteger (domain, 'chainId') !== this.chainId ()) || (this.safeString (message, 'orderId') !== this.safeString (request, 'id')) || (this.safeInteger (message, 'deadline') !== deadline)) {
            throw new InvalidOrder (this.id + ' cancel typed data or configuration changed');
        }
        const response = await this.publicDeleteMmLeverageOrdersId (this.extend (request, { 'cancelSignature': signature }));
        return this.parseOrder (this.extend (response, { 'id': this.safeString (request, 'id'), 'status': 'cancelled' }), (symbol === undefined) ? undefined : this.market (symbol));
    }

    /**
     * @method
     * @name flyingtulip#cancelOrder
     * @description signs a short-lived owner or session-delegate cancellation
     * @param {string} id executor order identifier
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.sessionId] authorized cancellation delegate session
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async cancelOrder (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        const prepared = await this.prepareCancelOrder (id, params);
        const signature = this.signTypedData (this.safeDict (prepared, 'typedData', {}));
        const result = await this.submitCancelOrder (prepared, signature, symbol);
        return this.safeOrder (result, (symbol === undefined) ? undefined : this.market (symbol));
    }

    checkAccountRisk (chain: Dict, assets: any[], debt: Dict, bought: Dict, sellRaw: string, buyRaw: string, feeRaw: string, config: Dict, action: int = 0) {
        const user = this.safeDict (chain, 'userMetrics', {});
        const equity = this.safeString (user, 'equityUsd');
        const minEquity = this.safeString (chain, 'minEquityRequirementUsd');
        const safeHf = this.safeString (config, 'marginHfSafeBps');
        if ((equity === undefined) || (minEquity === undefined) || (safeHf === undefined) || !Precise.stringGt (equity, '0') || !Precise.stringGt (safeHf, '0')) {
            throw new ExchangeError (this.id + ' account risk inputs unavailable');
        }
        let maintenance = '0';
        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            const metrics = this.safeDict (asset, 'userMetrics', {});
            const collateralRaw = this.safeString (metrics, 'totalCollateralRaw');
            const debtRaw = this.safeString (metrics, 'totalDebtRaw');
            if ((collateralRaw === undefined) || (debtRaw === undefined) || (collateralRaw === '') || (debtRaw === '')) {
                throw new ExchangeError (this.id + ' incomplete account risk snapshot');
            }
            if (!Precise.stringGt (collateralRaw, '0') && !Precise.stringGt (debtRaw, '0')) {
                continue;
            }
            const price = this.safeString2 (asset, 'oracleTokenPrice', 'tokenprice');
            const mm = this.safeString (asset, 'mmBps');
            if ((price === undefined) || (mm === undefined) || !Precise.stringGt (price, '0') || !Precise.stringGt (mm, '0')) {
                throw new ExchangeError (this.id + ' maintenance or oracle unavailable for account asset');
            }
            const gross = this.humanAmount (Precise.stringAdd (collateralRaw, debtRaw) as string, this.assetDecimals (asset));
            maintenance = Precise.stringAdd (maintenance, Precise.stringDiv (Precise.stringMul (Precise.stringMul (gross, price), mm), '10000', 36)) as string;
        }
        const sellValue = Precise.stringMul (this.humanAmount (sellRaw, this.assetDecimals (debt)), this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice'));
        const feeValue = Precise.stringMul (this.humanAmount (feeRaw, this.assetDecimals (debt)), this.safeString2 (debt, 'oracleTokenPrice', 'tokenprice'));
        const buyValue = Precise.stringMul (this.humanAmount (buyRaw, this.assetDecimals (bought)), this.safeString2 (bought, 'oracleTokenPrice', 'tokenprice'));
        const debtMm = this.safeString (debt, 'mmBps');
        const buyMm = this.safeString (bought, 'mmBps');
        if ((debtMm === undefined) || (buyMm === undefined) || !Precise.stringGt (debtMm, '0') || !Precise.stringGt (buyMm, '0')) {
            throw new ExchangeError (this.id + ' maintenance rates unavailable');
        }
        const afterEquity = Precise.stringSub (Precise.stringAdd (equity, buyValue), Precise.stringAdd (sellValue, feeValue));
        const boughtMaintenance = Precise.stringMul (buyValue, buyMm);
        const soldMaintenance = Precise.stringMul (Precise.stringAdd (sellValue, feeValue), debtMm);
        const maintenanceChange = (action === 2) ? Precise.stringSub (boughtMaintenance, soldMaintenance) : Precise.stringAdd (boughtMaintenance, soldMaintenance);
        const addedMaintenance = Precise.stringDiv (maintenanceChange, '10000', 36);
        const required = Precise.stringDiv (Precise.stringMul (Precise.stringAdd (maintenance, addedMaintenance), safeHf), '10000', 36);
        if (Precise.stringLt (afterEquity, minEquity) || Precise.stringLt (afterEquity, required)) {
            throw new InsufficientFunds (this.id + ' signed minimum output and fees exceed account health-factor headroom');
        }
    }

    abiArguments (types: string[], values: any[]): any[] {
        const result = [];
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const value = values[i];
            if (type.slice (0, 4) === 'uint') {
                result.push (this.convertToBigInt (this.numberToString (value) as string));
            } else if (type === 'bytes32') {
                result.push (this.base16ToBinary (this.remove0xPrefix (value)));
            } else {
                result.push (value);
            }
        }
        return result;
    }

    callData (signature: string, types: string[], values: any[]): string {
        const selector = this.hash (this.encode (signature), keccak, 'hex');
        return '0x' + selector.slice (0, 8) + this.binaryToBase16 (this.ethAbiEncode (types, this.abiArguments (types, values)));
    }

    positionManager (): string {
        const managers = this.safeDict (this.options, 'positionManagers', {});
        const address = this.safeString (managers, this.numberToString (this.chainId ()), '');
        if (!this.isAddress (address)) {
            throw new NotSupported (this.id + ' position manager not configured for this chain');
        }
        return address;
    }

    engineApprovals (order: Dict, config: Dict): Dict[] {
        const action = this.safeInteger (order, 'action');
        const functionName = (action === 0) ? 'approveBorrow' : 'approveEngine';
        const amount = Precise.stringAdd (this.safeString (order, 'sellAmount'), this.safeString (order, 'feeAmount'));
        const approval = {
            'chainId': this.chainId (), 'from': this.safeString (order, 'user'), 'to': this.positionManager (), 'value': '0',
            'data': this.callData (functionName + '(address,address,uint256)', [ 'address', 'address', 'uint256' ], [ this.safeString (config, 'leverageRfqEngine'), this.safeString (order, 'sellToken'), amount ]),
        };
        return [ approval ];
    }

    /**
     * @method
     * @name flyingtulip#prepareCollateralConversion
     * @description prepares an unsigned in-account collateral conversion before an open or close
     * @param {string} sellCode held collateral symbol or token address
     * @param {string} buyCode desired collateral symbol or token address
     * @param {float|string} amount sell-token amount excluding additional signed fees
     * @param {object} [params] extra parameters
     * @param {int} [params.chainId] must match options.chainId
     * @param {int} [params.slippageBps] aggregate minimum-output tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified session snapshot
     * @returns {object} unsigned order, typed data and debit approval for caller review
     */
    async prepareCollateralConversion (sellCode: string, buyCode: string, amount: Num, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        const owner = this.accountAddress (params);
        const config = await this.configuration ();
        const chain = await this.lendAccount (owner);
        const assets = this.safeList (chain, 'assets', []);
        const sold = this.findAsset (assets, sellCode);
        const bought = this.findAsset (assets, buyCode);
        if (!this.safeBool (sold, 'isCollateral', false) || !this.safeBool (bought, 'isCollateral', false) || this.safeBool (bought, 'isDepositPaused', false)) {
            throw new InvalidOrder (this.id + ' conversion assets must be valid collateral');
        }
        const sellToken = this.assetAddress (sold);
        const buyToken = this.assetAddress (bought);
        if (this.lowerAssetAddress (sold) === this.lowerAssetAddress (bought)) {
            throw new InvalidOrder (this.id + ' conversion tokens must differ');
        }
        const sellRaw = this.rawAmount (this.numberToString (amount) as string, this.assetDecimals (sold));
        const sessionInput = this.safeDict (params, 'session');
        const feeAmount = await this.orderFee (sellRaw, sellToken, 'swap', sessionInput !== undefined);
        const postingFee = (sessionInput === undefined) ? '0' : await this.sessionFee (sessionInput, sellRaw, feeAmount, sellToken, 'swap');
        const totalFee = Precise.stringAdd (feeAmount, postingFee) as string;
        const metrics = this.safeDict (sold, 'userMetrics', {});
        const available = this.safeString (metrics, 'totalWithdrawableRaw');
        if ((available === undefined) || (available === '') || Precise.stringGt (Precise.stringAdd (sellRaw, totalFee), available)) {
            throw new InsufficientFunds (this.id + ' verified spendable collateral must cover conversion and fees');
        }
        const slippage = this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps', 100));
        const quote = await this.quote (sellToken, buyToken, sellRaw, feeAmount, 'swap', slippage);
        this.assertQuoteVersion (quote, config);
        const buyRaw = this.safeString (quote, 'buyAmount', '0');
        this.checkAccountRisk (chain, assets, sold, bought, sellRaw, buyRaw, totalFee, config, 2);
        const validTo = this.safeInteger (params, 'validTo', this.seconds () + 3600);
        if ((validTo <= this.seconds ()) || (validTo > 4294967295)) {
            throw new InvalidOrder (this.id + ' validTo must be a future uint32 timestamp');
        }
        const order: Dict = { 'action': 2, 'user': owner, 'sellToken': sellToken, 'buyToken': buyToken, 'sellAmount': sellRaw, 'buyAmount': buyRaw, 'feeAmount': feeAmount, 'validTo': validTo };
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            order['partiallyFillable'] = false;
        }
        const request: Dict = { 'order': order, 'user': owner, 'isOpen': false, 'orderType': 'swap', 'source': 'trs', 'engineVersion': this.safeInteger (config, 'engineVersion', 1), 'currentSlippageBps': slippage };
        const typedData = (sessionInput === undefined) ? this.orderTypedData (config, order) : this.attachSession (request, config, sessionInput, postingFee);
        return { 'request': request, 'typedData': typedData, 'quote': quote, 'approvals': (sessionInput === undefined) ? this.engineApprovals (order, config) : [] };
    }

    /**
     * @method
     * @name flyingtulip#prepareCollateralDeposit
     * @description prepares unsigned exact-amount ERC-20 approvals and a collateral deposit
     * @param {string} code collateral symbol or token address
     * @param {float|string} amount base amount, or collateral token amount for a deposit
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @returns {object} unsigned prepared terms for caller review and signing
     */
    async prepareCollateralDeposit (code: string, amount: Num, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        const owner = this.accountAddress (params);
        const chain = await this.lendAccount (owner);
        const asset = this.findAsset (this.safeList (chain, 'assets', []), code);
        if (!this.safeBool (asset, 'isCollateral', false) || !this.safeBool (asset, 'isSuppliable', false) || this.safeBool (asset, 'isDepositPaused', false)) {
            throw new InvalidOrder (this.id + ' asset is not valid deposit collateral');
        }
        const raw = this.rawAmount (this.numberToString (amount) as string, this.assetDecimals (asset));
        const metrics = this.safeDict (asset, 'userMetrics', {});
        const wallet = this.safeString (metrics, 'walletBalanceRaw');
        if ((wallet === undefined) || (wallet === '') || Precise.stringGt (raw, wallet)) {
            throw new InsufficientFunds (this.id + ' collateral wallet balance unavailable or insufficient');
        }
        const manager = this.positionManager ();
        const token = this.assetAddress (asset);
        return {
            'chainId': this.chainId (), 'collateral': token, 'amount': raw,
            'transactions': [
                { 'from': owner, 'to': token, 'value': '0', 'data': this.callData ('approve(address,uint256)', [ 'address', 'uint256' ], [ manager, '0' ]) },
                { 'from': owner, 'to': token, 'value': '0', 'data': this.callData ('approve(address,uint256)', [ 'address', 'uint256' ], [ manager, raw ]) },
                { 'from': owner, 'to': manager, 'value': '0', 'data': this.callData ('deposit(address,uint256)', [ 'address', 'uint256' ], [ token, raw ]) },
            ],
        };
    }

    /**
     * @method
     * @name flyingtulip#prepareClosePosition
     * @description prepares a close using live debt and funding candidates without signing or submitting
     * @param {string} symbol unified market symbol
     * @param {string} [side] buy or sell; a close must oppose the position side
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.positionId] required when several position rows match
     * @param {string} [params.debtToken] explicit debt token when selection is ambiguous
     * @param {string} [params.fundingToken] short funding token
     * @param {string} [params.cost] short funding-token spend excluding fees
     * @param {string} [params.amount] partial long-close base amount
     * @param {string} [params.minBuyAmount] partial-close buy-token floor in raw units
     * @param {int} [params.slippageBps] quote tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified session snapshot
     * @returns {object} unsigned prepared terms for caller review and signing
     */
    async prepareClosePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Dict> {
        this.chainId (params);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const positions = await this.fetchPositions ([ symbol ], params);
        const positionId = this.safeString (params, 'positionId');
        let selected: Dict = {};
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if ((positionId === undefined) || (position['id'] === positionId)) {
                if (Object.keys (selected).length > 0) {
                    throw new ArgumentsRequired (this.id + ' multiple positions; specify positionId');
                }
                selected = position['info'];
            }
        }
        if (Object.keys (selected).length === 0) {
            throw new InvalidOrder (this.id + ' position not found');
        }
        if (this.safeBool (selected, 'syncing', false) || this.safeBool (selected, 'debtReadUnknown', false)) {
            throw new ExchangeError (this.id + ' position debt is not verified yet');
        }
        const isLong = this.safeString (selected, 'side') === 'long';
        const closeSide = isLong ? 'sell' : 'buy';
        if ((side !== undefined) && (side !== closeSide)) {
            throw new InvalidOrder (this.id + ' close side must oppose position side');
        }
        const chain = await this.lendAccount (this.accountAddress (params));
        const assets = this.safeList (chain, 'assets', []);
        const config = await this.configuration ();
        const debtCandidates = this.safeList (selected, 'debtCandidates', []);
        const explicitDebt = this.safeString (params, 'debtToken');
        const owed = [];
        for (let i = 0; i < debtCandidates.length; i++) {
            const candidate = debtCandidates[i];
            if (Precise.stringGt (this.safeString (candidate, 'grossDebtRaw', '0'), '0')) {
                if ((explicitDebt === undefined) || (this.safeStringLower (candidate, 'token', '') === this.lowerAssetAddress (this.findAsset (assets, explicitDebt)))) {
                    owed.push (candidate);
                }
            }
        }
        const owedCount = owed.length;
        if (owedCount !== 1) {
            throw new ArgumentsRequired (this.id + ' close debt is unavailable or ambiguous; specify debtToken');
        }
        const debt = owed[0];
        const buyAsset = this.findAsset (assets, this.safeString (debt, 'token', ''));
        let sellAsset: Dict;
        let available = '0';
        let grossLimit = '0';
        let quote: Dict = {};
        const slippage = this.safeInteger (params, 'slippageBps', this.safeInteger (this.options, 'slippageBps', 100));
        if (isLong) {
            sellAsset = this.findAsset (assets, market['baseId'] as string);
            available = this.safeString (selected, 'maxCloseAmount', '0');
            grossLimit = Precise.stringAdd (available, this.fee (available, this.safeInteger (selected, 'closeFeeBps', 5))) as string;
        } else {
            const funding = this.safeList (selected, 'fundingCandidates', []);
            const requestedFunding = this.safeString (params, 'fundingToken');
            let candidate: Dict = {};
            for (let i = 0; i < funding.length; i++) {
                const row = funding[i];
                if (Precise.stringGt (this.safeString (row, 'accountAvailRaw', '0'), '0') && ((requestedFunding === undefined) || (this.safeStringLower (row, 'token', '') === this.lowerAssetAddress (this.findAsset (assets, requestedFunding))))) {
                    candidate = row;
                    break;
                }
            }
            sellAsset = this.findAsset (assets, this.safeString (candidate, 'token', ''));
            // maxCloseAmount is BASE units. Size a quote-side spend from an
            // aggregate exact-output route rather than reinterpreting its wei.
            const cost = this.safeString (params, 'cost');
            if (cost === undefined) {
                const target = this.safeString (params, 'minBuyAmount', this.safeString (debt, 'grossDebtRaw', '0'));
                this.rawAmount (target as string, 0);
                quote = await this.quoteExactOut (this.assetAddress (sellAsset), this.assetAddress (buyAsset), target as string, 'close', slippage);
                available = this.safeString (quote, 'sellAmount', '0');
            } else {
                available = this.rawAmount (cost, this.assetDecimals (sellAsset));
            }
            grossLimit = this.safeString (candidate, 'accountAvailRaw', '0');
            if (Precise.stringGt (available, this.safeString (candidate, 'accountAvailRaw', '0'))) {
                throw new InsufficientFunds (this.id + ' short close exceeds available funding collateral');
            }
        }
        const amount = this.safeString (params, 'amount');
        let sellRaw = (isLong && (amount !== undefined)) ? this.rawAmount (amount, this.assetDecimals (sellAsset)) : available;
        if (!Precise.stringGt (sellRaw, '0') || Precise.stringGt (sellRaw, available)) {
            throw new InvalidOrder (this.id + ' close exceeds maxCloseAmount or requires direct repayment');
        }
        const sellToken = this.assetAddress (sellAsset);
        const buyToken = this.assetAddress (buyAsset);
        const sessionInput = this.safeDict (params, 'session');
        let feeAmount = await this.orderFee (sellRaw, sellToken, 'close', sessionInput !== undefined);
        let postingFee = (sessionInput === undefined) ? '0' : await this.sessionFee (sessionInput, sellRaw, feeAmount, sellToken, 'close');
        const totalFee = Precise.stringAdd (feeAmount, postingFee);
        if (Precise.stringGt (Precise.stringAdd (sellRaw, totalFee), grossLimit)) {
            if (!isLong || (amount !== undefined)) {
                throw new InsufficientFunds (this.id + ' close funding must also cover signed fees');
            }
            sellRaw = Precise.stringSub (grossLimit, totalFee) as string;
            if (!Precise.stringGt (sellRaw, '0')) {
                throw new InsufficientFunds (this.id + ' close collateral cannot cover execution fee');
            }
            feeAmount = await this.orderFee (sellRaw, sellToken, 'close', sessionInput !== undefined);
            postingFee = (sessionInput === undefined) ? '0' : await this.sessionFee (sessionInput, sellRaw, feeAmount, sellToken, 'close');
        }
        if (Object.keys (quote).length === 0) {
            quote = await this.quote (sellToken, buyToken, sellRaw, feeAmount, 'close', slippage);
        }
        this.assertQuoteVersion (quote, config);
        let minimum = this.safeString (quote, 'buyAmount', '0');
        // Whole-account debt is a conservative full-close floor. Partial
        // closes require an explicit minBuyAmount in buy-token raw units.
        const floor = this.safeString (params, 'minBuyAmount', this.safeString (debt, 'grossDebtRaw', '0'));
        this.rawAmount (floor as string, 0);
        minimum = Precise.stringMax (minimum, floor) as string;
        const validTo = this.safeInteger (params, 'validTo', this.seconds () + 3600);
        if ((validTo <= this.seconds ()) || (validTo > 4294967295)) {
            throw new InvalidOrder (this.id + ' validTo must be a future uint32 timestamp');
        }
        const order: Dict = { 'action': 1, 'user': this.accountAddress (params), 'sellToken': sellToken, 'buyToken': buyToken, 'sellAmount': sellRaw, 'buyAmount': minimum, 'validTo': validTo, 'feeAmount': feeAmount };
        if (this.safeInteger (config, 'engineVersion', 1) === 2) {
            order['partiallyFillable'] = false;
        }
        const request: Dict = { 'engineVersion': this.safeInteger (config, 'engineVersion', 1), 'currentSlippageBps': slippage, 'order': order, 'user': order['user'], 'isOpen': false, 'orderType': 'close', 'marketSymbol': market['id'], 'direction': closeSide, 'clientOrderType': 'market', 'positionId': this.safeString (selected, 'positionId'), 'source': 'trs' };
        const typedData = (sessionInput === undefined) ? this.orderTypedData (config, order) : this.attachSession (request, config, sessionInput, postingFee);
        return { 'request': request, 'typedData': typedData, 'quote': quote, 'approvals': (sessionInput === undefined) ? this.engineApprovals (order, config) : [] };
    }

    /**
     * @method
     * @name flyingtulip#closePosition
     * @description signs and submits a close using live debt and funding candidates
     * @param {string} symbol unified market symbol
     * @param {string} [side] buy or sell; a close must oppose the position side
     * @param {object} [params] extra exchange-specific parameters
     * @param {int} [params.chainId] must match options.chainId; use one instance per chain
     * @param {string} [params.positionId] required when several position rows match
     * @param {string} [params.debtToken] explicit debt token when selection is ambiguous
     * @param {string} [params.fundingToken] short funding token
     * @param {string} [params.cost] short funding-token spend excluding fees
     * @param {string} [params.amount] partial long-close base amount
     * @param {string} [params.minBuyAmount] partial-close buy-token floor in raw units
     * @param {int} [params.slippageBps] quote tolerance in basis points
     * @param {int} [params.validTo] absolute expiry in seconds
     * @param {object} [params.session] verified session snapshot
     * @returns {object} a unified result as documented at https://docs.ccxt.com/docs/manual
     */
    override async closePosition (symbol: string, side: Str = undefined, params: Dict = {}): Promise<Order> {
        const prepared = await this.prepareClosePosition (symbol, side, params);
        const session = this.safeDict (params, 'session');
        const owner = (session === undefined) ? this.accountAddress (params) : this.safeString (session, 'delegate', '');
        if (!this.privateKeyMatches (owner)) {
            throw new AuthenticationError (this.id + ' privateKey must belong to the position owner');
        }
        const signature = this.signTypedData (this.safeDict (prepared, 'typedData', {}));
        const result = await this.submitLeverageOrder (prepared, signature, (session === undefined) ? 'eip712' : 'session');
        return this.safeOrder (result, this.market (symbol));
    }

    override sign (path: string, api: string[] = [ 'public' ], method = 'GET', params: Dict = {}): any {
        const headers: Dict = { 'User-Agent': 'ccxt' };
        let body = undefined;
        let url = this.urls['api'][api[0]] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length > 0) {
                url += '?' + this.urlencode (query);
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    override handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        if (this.safeValue (response, 'success') === false) {
            const message = this.safeString2 (response, 'error', 'message', body);
            const feedback = this.id + ' ' + this.safeString (response, 'code', '') + ' ' + message;
            if (code === 404) {
                throw new OrderNotFound (feedback);
            }
            if ((code === 401) || (code === 403)) {
                throw new AuthenticationError (feedback);
            }
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
