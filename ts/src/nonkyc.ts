import Exchange from './abstract/nonkyc.js';
import { ArgumentsRequired, BadRequest, ExchangeError } from './base/errors.js';
import type { Market, Currencies, Currency, OrderBook, Trade, Ticker, OHLCV, Int, Dict, DepositAddress, Balances, Transaction, Order, Tickers, TradingFees, TradingFeeInterface } from './base/types.js';
import { sha256 } from './static_dependencies/noble-hashes/sha256.js';
import { TICK_SIZE } from './base/functions/number.js';

export default class nonkyc extends Exchange {
    /**
     * @class nonkyc
     * @augments Exchange
     */
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'nonkyc',
            'name': 'NonKYC',
            'countries': [],
            'version': 'v2',
            'rateLimit': 1000,
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': undefined,
                'swap': undefined,
                'future': undefined,
                'option': undefined,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchLedger': false,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTradingLimits': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'transfer': false,
                'withdraw': true,
            },
            'features': {},
            'urls': {
                'logo': 'https://nonkyc.io/images/mediakit/NonKYC-name-logo-yellow.png',
                'api': { 'public': 'https://api.nonkyc.io/api/v2', 'private': 'https://api.nonkyc.io/api/v2' },
                'www': 'https://nonkyc.io',
                'doc': [ 'https://api.nonkyc.io/', 'https://nonkyc.io/wsapi' ],
            },
            'timeframes': { '5m': '5', '15m': '15', '30m': '30', '1h': '60', '3h': '180', '4h': '240', '8h': '480', '12h': '720', '1d': '1440' },
            'api': {
                'public': {
                    'get': {
                        'time': 1,
                        'asset/getlist': 1,
                        'asset/info': 1,
                        'market/getlist': 1,
                        'market/info': 1,
                        'market/orderbook': 1,
                        'market/trades': 1,
                        'market/candles': 2,
                        'orderbook': 1,
                        'ticker/{symbol}': 1,
                        'tickers': 1,
                    },
                },
                'private': {
                    'get': {
                        'balances': 1,
                        'getdepositaddress/{currency}': 1,
                        'getdeposits': 1,
                        'getwithdrawals': 1,
                        'getorder/{orderId}': 1,
                        'account/orders': 1,
                        'account/trades': 1,
                    },
                    'post': {
                        'createorder': 1,
                        'cancelorder': 1,
                        'cancelallorders': 1,
                        'createwithdrawal': 1,
                    },
                },
            },
            'fees': { 'trading': { 'tierBased': false, 'percentage': true, 'taker': 0.002, 'maker': 0.002 }},
            'precisionMode': TICK_SIZE,
            'commonCurrencies': {
                'XBT': 'XBT',
            },
            'requiredCredentials': { 'apiKey': true, 'secret': true },
        });
    }

    /**
     * @method
     * @name nonkyc#fetchTime
     * @description retrieves the server time from NonKYC
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {number} the current server time in milliseconds since EpocFh
     * @example
     * // node js/cli.js nonkyc fetchTime
     */
    async fetchTime (params = {}): Promise<number> {
        const res = await this.publicGetTime (params);
        return this.safeInteger2 (res, 'serverTime', 'time');
    }

    /**
     * @method
     * @name nonkyc#fetchCurrencies
     * @description fetches all available currencies with network-specific settings, fees and limits
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @returns {Currencies} Return all mapped currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const res = await this.publicGetAssetGetlist (params);
        let rows = [];
        if (Array.isArray (res)) {
            rows = res;
        } else {
            rows = this.safeValue (res, 'data', []);
        }
        const childrenByParent = {};
        for (let i = 0; i < rows.length; i++) {
            const a = rows[i];
            const isChild = this.safeBool (a, 'isChild');
            const parentId = this.safeString (a, 'childOf');
            if (isChild && (parentId !== undefined)) {
                if (!(parentId in childrenByParent)) {
                    childrenByParent[parentId] = [];
                }
                childrenByParent[parentId].push (a);
            }
        }
        const leftovers = [];
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const root = rows[i];
            const isChild = this.safeBool (root, 'isChild', false);
            if (isChild) {
                continue;
            }
            const parentTicker = this.safeString (root, 'ticker');
            if (!(typeof parentTicker === 'string')) {
                continue;
            }
            const code = this.safeCurrencyCode (parentTicker);
            const tokenDetailsRoot = this.safeValue (root, 'tokenDetails', {});
            let rootDecimals = this.safeInteger (root, 'withdrawDecimals');
            if (rootDecimals === undefined) {
                rootDecimals = this.safeInteger (tokenDetailsRoot, 'decimals');
            }
            let topPrecision = undefined;
            if (rootDecimals !== undefined) {
                const p = this.parsePrecision (this.numberToString (rootDecimals));
                topPrecision = this.parseNumber (p);
            }
            const rootIsActive = this.safeBool (root, 'isActive', true);
            const rootNotMaint = !this.safeBool (root, 'isMaintenance', false);
            const rootNotDelist = !this.safeBool (root, 'isDelisting', false);
            const rootActive = rootIsActive && rootNotMaint && rootNotDelist;
            const rootDeposit = this.safeBool (root, 'depositActive', true);
            const rootWithdraw = this.safeBool (root, 'withdrawalActive', true);
            const minDeposit = this.safeNumber (root, 'minimumDeposit');
            const rootFee = this.safeNumber (root, 'withdrawFee');
            const currency: any = this.safeCurrencyStructure ({
                'id': parentTicker,
                'code': code,
                'name': this.safeString (root, 'name', code),
                'info': root,
                'active': rootActive,
                'fee': rootFee,
                'precision': topPrecision,
                'type': 'crypto',
                'deposit': rootDeposit,
                'withdraw': rootWithdraw,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'deposit': { 'min': minDeposit, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            });
            const networks = {};
            const parentInternalId = this.safeString2 (root, 'id', '_id');
            let kids = [];
            if (parentInternalId !== undefined) {
                const maybeKids = this.safeValue (childrenByParent, parentInternalId, []);
                if (Array.isArray (maybeKids)) {
                    kids = maybeKids;
                }
            }
            let hadKidNetwork = false;
            const hasChildren = this.safeBool (root, 'hasChildren', false);
            if (Array.isArray (kids)) {
                for (let k = 0; k < kids.length; k++) {
                    const child = kids[k];
                    const childTicker = this.safeString (child, 'ticker');
                    if (!(typeof childTicker === 'string')) {
                        leftovers.push (child);
                        continue;
                    }
                    let attachAsNetwork = false;
                    if ((typeof parentTicker === 'string') && (typeof childTicker === 'string')) {
                        const expectedPrefix = parentTicker + '-';
                        const pos = childTicker.indexOf (expectedPrefix);
                        if (pos === 0) {
                            attachAsNetwork = true;
                        }
                    }
                    if (!attachAsNetwork) {
                        leftovers.push (child);
                        continue;
                    }
                    hadKidNetwork = true;
                    let netKey = undefined;
                    const isTokenChild = this.safeBool (child, 'isToken');
                    if (isTokenChild) {
                        const td = this.safeValue (child, 'tokenDetails', {});
                        const t = this.safeString (td, 'type');
                        const cleaned = this.parseAlnumUpper (t);
                        if (cleaned !== undefined) {
                            netKey = cleaned;
                        }
                    }
                    if (netKey === undefined && (typeof childTicker === 'string')) {
                        let lastDash = -1;
                        let startPos = 0;
                        for (let scan = 0; scan < 64; scan++) {
                            const pos = childTicker.indexOf ('-', startPos);
                            if (pos === -1) {
                                break;
                            }
                            lastDash = pos;
                            startPos = pos + 1;
                        }
                        if (lastDash !== -1) {
                            const suf = childTicker.slice (lastDash + 1);
                            const cleanedSuf = this.parseAlnumUpper (suf);
                            if (cleanedSuf !== undefined && cleanedSuf !== '') {
                                netKey = cleanedSuf;
                            }
                        }
                    }
                    if (netKey === undefined) {
                        netKey = 'MAIN';
                    }
                    const netIsActive = this.safeBool (child, 'isActive', true);
                    const netNotMaint = !this.safeBool (child, 'isMaintenance', false);
                    const netNotDelist = !this.safeBool (child, 'isDelisting', false);
                    const networkActive = netIsActive && netNotMaint && netNotDelist;
                    const depositActive = this.safeBool (child, 'depositActive', true);
                    const withdrawActive = this.safeBool (child, 'withdrawalActive', true);
                    const netFee = this.safeNumber (child, 'withdrawFee');
                    const depMinNet = this.safeNumber (child, 'minimumDeposit');
                    const wdMaxNet = this.safeNumber (child, 'maximumWithdraw');
                    let netDecimals = this.safeInteger (child, 'withdrawDecimals');
                    if (netDecimals === undefined) {
                        const tdChild = this.safeValue (child, 'tokenDetails', {});
                        netDecimals = this.safeInteger (tdChild, 'decimals');
                    }
                    let netPrecision = topPrecision;
                    if (netDecimals !== undefined) {
                        const pp = this.parsePrecision (this.numberToString (netDecimals));
                        netPrecision = this.parseNumber (pp);
                    }
                    networks[netKey] = {
                        'id': childTicker,
                        'network': netKey,
                        'active': networkActive,
                        'deposit': depositActive,
                        'withdraw': withdrawActive,
                        'fee': netFee,
                        'precision': netPrecision,
                        'limits': {
                            'deposit': { 'min': depMinNet, 'max': undefined },
                            'withdraw': { 'min': undefined, 'max': wdMaxNet },
                        },
                        'info': child,
                    };
                }
            }
            if (hasChildren && !hadKidNetwork) {
                const depMinRoot = this.safeNumber (root, 'minimumDeposit');
                const wdMaxRoot = this.safeNumber (root, 'maximumWithdraw');
                networks['MAIN'] = {
                    'id': parentTicker,
                    'network': 'MAIN',
                    'active': rootActive,
                    'deposit': rootDeposit,
                    'withdraw': rootWithdraw,
                    'fee': rootFee,
                    'precision': topPrecision,
                    'limits': {
                        'deposit': { 'min': depMinRoot, 'max': undefined },
                        'withdraw': { 'min': undefined, 'max': wdMaxRoot },
                    },
                    'info': root,
                };
            }
            currency['networks'] = networks;
            result[code] = currency;
        }
        for (let i = 0; i < leftovers.length; i++) {
            const child = leftovers[i];
            const childTicker = this.safeString (child, 'ticker');
            if (!(typeof childTicker === 'string')) {
                continue;
            }
            const code = this.safeCurrencyCode (childTicker);
            if (code in result) {
                continue;
            }
            let cDecimals = this.safeInteger (child, 'withdrawDecimals');
            if (cDecimals === undefined) {
                const td0 = this.safeValue (child, 'tokenDetails', {});
                cDecimals = this.safeInteger (td0, 'decimals');
            }
            let cPrecision = undefined;
            if (cDecimals !== undefined) {
                const pp0 = this.parsePrecision (this.numberToString (cDecimals));
                cPrecision = this.parseNumber (pp0);
            }
            const isActive = this.safeBool (child, 'isActive', true);
            const notMaint = !this.safeBool (child, 'isMaintenance', false);
            const notDelist = !this.safeBool (child, 'isDelisting', false);
            const active = isActive && notMaint && notDelist;
            const depositActive = this.safeBool (child, 'depositActive', true);
            const withdrawActive = this.safeBool (child, 'withdrawalActive', true);
            const fee = this.safeNumber (child, 'withdrawFee');
            const minDeposit = this.safeNumber (child, 'minimumDeposit');
            const isToken = this.safeBool (child, 'isToken');
            const hasDash = (childTicker.indexOf ('-') >= 0);
            const currency: any = this.safeCurrencyStructure ({
                'id': childTicker,
                'code': code,
                'name': this.safeString (child, 'name', code),
                'info': child,
                'active': active,
                'fee': fee,
                'precision': cPrecision,
                'type': 'crypto',
                'deposit': depositActive,
                'withdraw': withdrawActive,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'deposit': { 'min': minDeposit, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
                'networks': {},
            });
            if (isToken && !hasDash) {
                result[code] = currency;
                continue;
            }
            let netKey = undefined;
            if (isToken) {
                const td = this.safeValue (child, 'tokenDetails', {});
                const t = this.safeString (td, 'type');
                const cleaned = this.parseAlnumUpper (t);
                if (cleaned !== undefined) {
                    netKey = cleaned;
                }
            }
            if (netKey === undefined && hasDash) {
                let lastDash = -1;
                let startPos = 0;
                for (let scan = 0; scan < 64; scan++) {
                    const pos = childTicker.indexOf ('-', startPos);
                    if (pos === -1) {
                        break;
                    }
                    lastDash = pos;
                    startPos = pos + 1;
                }
                if (lastDash !== -1) {
                    const suf = childTicker.slice (lastDash + 1);
                    const cleanedSuf = this.parseAlnumUpper (suf);
                    if (cleanedSuf !== undefined && cleanedSuf !== '') {
                        netKey = cleanedSuf;
                    }
                }
            }
            if (netKey === undefined) {
                netKey = 'MAIN';
            }
            const depMinChild = this.safeNumber (child, 'minimumDeposit');
            const wdMaxChild = this.safeNumber (child, 'maximumWithdraw');
            const nets: any = {};
            nets[netKey] = {
                'id': childTicker,
                'network': netKey,
                'active': active,
                'deposit': depositActive,
                'withdraw': withdrawActive,
                'fee': fee,
                'precision': cPrecision,
                'limits': {
                    'deposit': { 'min': depMinChild, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': wdMaxChild },
                },
                'info': child,
            };
            currency['networks'] = nets;
            result[code] = currency;
        }
        return result;
    }

    parseAlnumUpper (s) {
        if (s === undefined) {
            return undefined;
        }
        let out = s.toUpperCase ();
        const seps = [ '-', ' ', '_', '.', '/', '(', ')', '[', ']', '{', '}' ];
        for (let i = 0; i < seps.length; i++) {
            const sep = seps[i];
            const parts = out.split (sep);
            out = parts.join ('');
        }
        if (out === '') {
            return undefined;
        }
        return out;
    }

    /**
     * @method
     * @name nonkyc#fetchAssetInfo
     * @description fetch a single asset details by id or ticker
     * @param {object} [params]
     * @param {string} [params.id] the asset id
     * @param {string} [params.ticker] the asset ticker symbol
     * @returns {Currency} a [currency structure]{@link https://docs.ccxt.com/#/?id=currency-structure}
     * @example
     * // node js/cli.js nonkyc fetchAssetInfo '{"ticker":"NOX"}'
     * // node js/cli.js nonkyc fetchAssetInfo '{"id":"68a34fe7d2faf433209a2e0d"}'
     */
    async fetchAssetInfo (params = {}): Promise<Currency> {
        const request: any = {};
        if (params['id'] !== undefined) {
            request.id = params['id'];
        }
        if (params['ticker'] !== undefined) {
            request.ticker = params['ticker'];
        }
        if (Object.keys (request).length === 0) {
            throw new ArgumentsRequired (this.id + ' fetchAssetInfo() requires id or ticker in params');
        }
        const res = await this.publicGetAssetInfo (request);
        const maybeArray = this.safeValue (res, 'data', res);
        let raw: any = maybeArray;
        if (Array.isArray (maybeArray)) {
            if (maybeArray[0] !== undefined) {
                raw = maybeArray[0];
            } else {
                raw = {};
            }
        }
        const ticker = this.safeString (raw, 'ticker');
        if (ticker === undefined) {
            throw new ExchangeError (this.id + ' fetchAssetInfo(): missing ticker in response');
        }
        let baseTicker = ticker;
        let dashPos = -1;
        if (typeof ticker === 'string') {
            dashPos = ticker.indexOf ('-');
        }
        if (dashPos !== -1) {
            baseTicker = ticker.slice (0, dashPos);
        }
        const code = this.safeCurrencyCode (baseTicker);
        const name = this.safeString (raw, 'name', code);
        const isActive = this.safeBool (raw, 'isActive', true);
        const notMaint = !this.safeBool (raw, 'isMaintenance', false);
        const notDelist = !this.safeBool (raw, 'isDelisting', false);
        const active = isActive && notMaint && notDelist;
        const withdrawFee = this.safeNumber (raw, 'withdrawFee');
        let decimals = this.safeInteger (raw, 'withdrawDecimals');
        const tokenDetails = this.safeValue (raw, 'tokenDetails', {});
        if (decimals === undefined) {
            decimals = this.safeInteger (tokenDetails, 'decimals');
        }
        let precision = undefined;
        if (decimals !== undefined) {
            const p = this.parsePrecision (this.numberToString (decimals));
            precision = this.parseNumber (p);
        }
        const deposit = this.safeBool (raw, 'depositActive', true);
        const withdraw = this.safeBool (raw, 'withdrawalActive', true);
        const minDeposit = this.safeNumber (raw, 'minimumDeposit');
        const maxWithdraw = this.safeNumber (raw, 'maximumWithdraw');
        let netKey = this.safeString (tokenDetails, 'type');
        netKey = this.parseAlnumUpper (netKey);
        if (netKey === undefined) {
            const lastDash = ticker.lastIndexOf ('-');
            if (lastDash !== -1) {
                const suf = ticker.slice (lastDash + 1);
                netKey = this.parseAlnumUpper (suf);
            }
        }
        if (netKey === undefined) {
            netKey = 'MAIN';
        }
        const hasDash = (ticker.indexOf ('-') >= 0);
        const networks: any = {};
        if (hasDash) {
            networks[netKey] = {
                'id': ticker,
                'network': netKey,
                'active': active,
                'deposit': deposit,
                'withdraw': withdraw,
                'fee': withdrawFee,
                'precision': precision,
                'limits': {
                    'deposit': { 'min': minDeposit, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': maxWithdraw },
                },
                'info': raw,
            };
        }
        return {
            'id': ticker,
            'code': code,
            'name': name,
            'type': 'crypto',
            'active': active,
            'deposit': deposit,
            'withdraw': withdraw,
            'fee': withdrawFee,
            'precision': precision,
            'limits': {
                'amount': { 'min': undefined, 'max': undefined },
                'withdraw': { 'min': undefined, 'max': maxWithdraw },
            },
            'networks': networks,
            'info': raw,
        };
    }

    /**
     * @method
     * @name nonkyc#fetchMarkets
     * @description retrieves a list of markets/symbols available on the exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Market[]} an array of [market structures]{@link https://docs.ccxt.com/#/?id=market-structure}
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const res = await this.publicGetMarketGetlist (params);
        let rows = [];
        if (Array.isArray (res)) {
            rows = res;
        } else {
            rows = this.safeValue (res, 'data', []);
        }
        const result = [];
        const tradingFees = this.safeValue (this.fees, 'trading', {});
        const defaultMaker = this.safeNumber (tradingFees, 'maker');
        const defaultTaker = this.safeNumber (tradingFees, 'taker');
        for (let i = 0; i < rows.length; i++) {
            const m = rows[i];
            const rawSymbol = this.safeString (m, 'symbol');
            if (!rawSymbol) {
                continue;
            }
            const parts = rawSymbol.split ('/');
            const fbBase = parts[0];
            const fbQuote = parts[1];
            let baseTicker = this.safeString (m, 'primaryTicker');
            if (baseTicker === undefined) {
                baseTicker = fbBase;
            }
            let quoteTicker = this.safeString (m, 'secondaryTicker');
            if (quoteTicker === undefined) {
                quoteTicker = fbQuote;
            }
            const base = this.safeCurrencyCode (baseTicker);
            const quote = this.safeCurrencyCode (quoteTicker);
            let baseId = baseTicker;
            if (baseId === undefined) {
                baseId = fbBase;
            }
            let quoteId = quoteTicker;
            if (quoteId === undefined) {
                quoteId = fbQuote;
            }
            const idForApi = rawSymbol.replace ('/', '_');
            const priceDecimalsStr = this.safeString (m, 'priceDecimals');
            let priceTick = undefined;
            if (priceDecimalsStr !== undefined) {
                const p = this.parsePrecision (priceDecimalsStr);
                priceTick = this.parseNumber (p);
            }
            const qtyDecimalsStr = this.safeString (m, 'quantityDecimals');
            let amountTick = undefined;
            if (qtyDecimalsStr !== undefined) {
                const a = this.parsePrecision (qtyDecimalsStr);
                amountTick = this.parseNumber (a);
            }
            const minimumQuantity = this.safeNumber (m, 'minimumQuantity');
            let minQuoteActive = this.safeBool (m, 'minQuoteActive');
            if (!minQuoteActive) {
                minQuoteActive = this.safeBool (m, 'isMinQuoteActive');
            }
            let minQuote = undefined;
            if (minQuoteActive) {
                minQuote = this.safeNumber (m, 'minQuote');
            }
            const minAllowedPrice = this.safeNumber (m, 'minAllowedPrice');
            const maxAllowedPrice = this.safeNumber (m, 'maxAllowedPrice');
            const isAct = this.safeBool (m, 'isActive', true);
            const notPaused = !this.safeBool (m, 'isPaused', false);
            const notPauseBuys = !this.safeBool (m, 'pauseBuys', false);
            const notPauseSells = !this.safeBool (m, 'pauseSells', false);
            const active = isAct && notPaused && notPauseBuys && notPauseSells;
            result.push (this.safeMarketStructure ({
                'id': idForApi,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                'taker': defaultTaker,
                'maker': defaultMaker,
                'active': active,
                'precision': { 'price': priceTick, 'amount': amountTick },
                'limits': {
                    'amount': { 'min': minimumQuantity, 'max': undefined },
                    'price': { 'min': minAllowedPrice, 'max': maxAllowedPrice },
                    'cost': { 'min': minQuote, 'max': undefined },
                },
                'info': m,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchMarketInfo
     * @description fetch extra information about a specific market by id or symbol
     * @param {object} [params]
     * @param {string} [params.id] the market id
     * @param {string} [params.symbol] unified symbol of the market
     * @returns {object} the raw response from the exchange with market information
     */
    async fetchMarketInfo (params = {}): Promise<any> {
        const request: any = {};
        if (params['id'] !== undefined) {
            request.id = params['id'];
        }
        if (params['symbol'] !== undefined) {
            request.symbol = params['symbol'];
        }
        if (Object.keys (request).length === 0) {
            throw new ArgumentsRequired (this.id + ' fetchMarketInfo () requires id or symbol in params');
        }
        return this.publicGetMarketInfo (request);
    }

    /**
     * @method
     * @name nonkyc#fetchTicker
     * @description fetch the ticker for a specific symbol
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Ticker} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = this.safeString (market, 'id');
        const uniSymbol = this.safeString (market, 'symbol');
        try {
            const res = await this.publicGetMarketInfo (this.extend ({ 'symbol': marketId }, params));
            const info = this.safeValue (res, 'data', res);
            const last = this.safeNumber2 (info, 'lastPriceNumber', 'lastPrice');
            const high = this.safeNumber2 (info, 'highPriceNumber', 'highPrice');
            const low = this.safeNumber2 (info, 'lowPriceNumber', 'lowPrice');
            const bid = this.safeNumber2 (info, 'bestBidNumber', 'bestBid');
            const ask = this.safeNumber2 (info, 'bestAskNumber', 'bestAsk');
            const baseVol = this.safeNumber2 (info, 'volumeNumber', 'volume');
            const quoteVol = this.safeNumber2 (info, 'volumeSecondaryNumber', 'volumeSecondary');
            const prevClose = this.safeNumber2 (info, 'yesterdayPriceNumber', 'yesterdayPrice');
            let ts = this.safeInteger2 (info, 'updatedAt', 'lastTradeAt');
            if (ts !== undefined && ts < 1000000000000) {
                ts = ts * 1000;
            }
            const ticker: any = {
                'symbol': uniSymbol,
                'timestamp': ts,
            };
            if (ts !== undefined) {
                ticker['datetime'] = this.iso8601 (ts);
            }
            ticker['high'] = high;
            ticker['low'] = low;
            ticker['bid'] = bid;
            ticker['ask'] = ask;
            ticker['last'] = last;
            ticker['baseVolume'] = baseVol;
            ticker['quoteVolume'] = quoteVol;
            ticker['info'] = info;
            ticker['previousClose'] = prevClose;
            ticker['open'] = prevClose;
            return this.safeTicker (ticker, market);
        } catch (e) {
            const res2 = await this.publicGetTickerSymbol (this.extend ({ 'symbol': marketId }, params));
            const t = this.safeValue (res2, 'data', res2);
            const last2 = this.safeNumber2 (t, 'last_price', 'last');
            const high2 = this.safeNumber2 (t, 'high', 'high_price');
            const low2 = this.safeNumber2 (t, 'low', 'low_price');
            const bid2 = this.safeNumber2 (t, 'bid', 'best_bid');
            const ask2 = this.safeNumber2 (t, 'ask', 'best_ask');
            const baseVol2 = this.safeNumber2 (t, 'base_volume', 'volume');
            const quoteVol2 = this.safeNumber2 (t, 'target_volume', 'quote_volume');
            const prevClose2 = this.safeNumber2 (t, 'yesterday_price_number', 'yesterday_price');
            let ts3 = this.safeInteger2 (t, 'timestamp', 'time');
            if (ts3 !== undefined && ts3 < 1000000000000) {
                ts3 = ts3 * 1000;
            }
            const ticker2: any = {
                'symbol': uniSymbol,
                'timestamp': ts3,
            };
            if (ts3 !== undefined) {
                ticker2['datetime'] = this.iso8601 (ts3);
            }
            ticker2['high'] = high2;
            ticker2['low'] = low2;
            ticker2['bid'] = bid2;
            ticker2['ask'] = ask2;
            ticker2['last'] = last2;
            ticker2['baseVolume'] = baseVol2;
            ticker2['quoteVolume'] = quoteVol2;
            ticker2['previousClose'] = prevClose2;
            ticker2['open'] = prevClose2;
            ticker2['info'] = t;
            return this.safeTicker (ticker2, market);
        }
    }

    /**
     * @method
     * @name nonkyc#fetchTickers
     * @description fetches tickers for all markets or for a list of symbols
     * @param {string[]} [symbols] unified symbols of the markets
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}, indexed by market symbols
     * @example
     * // node js/cli.js nonkyc fetchTickers '["BTC/USDT","ETH/USDT","ADA/USDT"]'
     */
    async fetchTickers (symbols: string[] = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        let rows = [];
        if (Array.isArray (response)) {
            rows = response;
        } else {
            rows = this.safeValue (response, 'data', []);
        }
        const result = {};
        for (let i = 0; i < rows.length; i++) {
            const raw = rows[i];
            const marketId = this.safeString2 (raw, 'ticker_id', 'symbol');
            let market = this.safeMarket (marketId, undefined, '_');
            if (!market || market['symbol'] === marketId) {
                market = this.safeMarket (marketId, undefined, '/');
            }
            const symbol = market['symbol'];
            const last = this.safeNumber2 (raw, 'last_price', 'last');
            const bid = this.safeNumber (raw, 'bid');
            const ask = this.safeNumber (raw, 'ask');
            const high = this.safeNumber (raw, 'high');
            const low = this.safeNumber (raw, 'low');
            const baseVolRaw = this.safeString2 (raw, 'base_volume', 'volume');
            const quoteVolRaw = this.safeString2 (raw, 'target_volume', 'quote_volume');
            const prevCloseRaw = this.safeString2 (raw, 'previous_day_price', 'previousClose');
            const baseVol = this.parseNumber (baseVolRaw);
            let quoteVol = this.parseNumber (quoteVolRaw);
            let prevClose = this.parseNumber (prevCloseRaw);
            let percentage = undefined;
            const pctStr = this.safeString (raw, 'change_percent');
            if (pctStr !== undefined) {
                let cleaned = pctStr;
                cleaned = cleaned.replace ('%', '');
                cleaned = cleaned.replace ('+', '');
                percentage = this.parseNumber (cleaned);
            }
            let change = undefined;
            if (last !== undefined && prevClose !== undefined) {
                change = last - prevClose;
            }
            const EPS = 1e-12;
            let highPlusEps = undefined;
            if (high !== undefined) {
                highPlusEps = high + EPS;
            }
            let lowMinusEps = undefined;
            if (low !== undefined) {
                lowMinusEps = low - EPS;
            }
            let prevCloseInvalid = false;
            if (prevClose !== undefined) {
                if (highPlusEps !== undefined) {
                    if (prevClose > highPlusEps) {
                        prevCloseInvalid = true;
                    }
                }
                if (!prevCloseInvalid) {
                    if (lowMinusEps !== undefined) {
                        if (prevClose < lowMinusEps) {
                            prevCloseInvalid = true;
                        }
                    }
                }
                if (prevCloseInvalid) {
                    prevClose = undefined;
                    change = undefined;
                }
            }
            let minQuote = undefined;
            if (baseVol !== undefined && low !== undefined) {
                minQuote = baseVol * low;
            }
            if (quoteVol !== undefined && minQuote !== undefined) {
                if (quoteVol < minQuote) {
                    quoteVol = undefined;
                }
            }
            let vwap = undefined;
            if (baseVol !== undefined) {
                if (baseVol > 0) {
                    if (quoteVol !== undefined) {
                        if (quoteVol > 0) {
                            vwap = quoteVol / baseVol;
                        }
                    }
                }
            }
            let open = undefined;
            if (last !== undefined) {
                open = last;
                if (low !== undefined) {
                    if (open < low) {
                        open = low;
                    }
                }
                if (high !== undefined) {
                    if (open > high) {
                        open = high;
                    }
                }
            }
            const ticker = {
                'symbol': symbol,
                'timestamp': undefined,
                'datetime': undefined,
                'high': high,
                'low': low,
                'bid': bid,
                'bidVolume': undefined,
                'ask': ask,
                'askVolume': undefined,
                'vwap': vwap,
                'open': open,
                'close': undefined,
                'last': last,
                'previousClose': prevClose,
                'change': change,
                'percentage': percentage,
                'average': undefined,
                'baseVolume': baseVol,
                'quoteVolume': quoteVol,
                'info': raw,
            };
            result[symbol] = this.safeTicker (ticker, market);
        }
        if (symbols !== undefined) {
            const filtered = {};
            for (let i = 0; i < symbols.length; i++) {
                const s = symbols[i];
                if (s in result) {
                    filtered[s] = result[s];
                }
            }
            return filtered;
        }
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchOrderBook
     * @description fetch the order book for a specific symbol
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OrderBook} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     * @example
     * // node js/cli.js nonkyc fetchOrderBook BTC/USDT
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = this.safeString (market, 'id');
        const req1: any = { 'symbol': marketId };
        if (limit !== undefined) {
            req1['limit'] = limit;
        }
        try {
            const res = await this.publicGetMarketOrderbook (this.extend (req1, params));
            const data = this.safeValue (res, 'data', res);
            let ts = this.safeInteger2 (data, 'timestamp', 'ts');
            if (ts !== undefined && ts < 1000000000000) {
                ts = ts * 1000;
            }
            const nonce = this.safeInteger2 (data, 'sequence', 'nonce');
            const rawBids = this.safeValue (data, 'bids', []);
            const rawAsks = this.safeValue (data, 'asks', []);
            const bids = [];
            for (let i = 0; i < rawBids.length; i++) {
                const b = rawBids[i];
                let price = this.safeNumber (b, 'price');
                let amount = this.safeNumber2 (b, 'quantity', 'amount');
                if (price === undefined) {
                    price = this.safeNumber (b, 0);
                }
                if (amount === undefined) {
                    amount = this.safeNumber (b, 1);
                }
                if (price !== undefined && amount !== undefined) {
                    bids.push ([ price, amount ]);
                }
            }
            const asks = [];
            for (let i = 0; i < rawAsks.length; i++) {
                const a = rawAsks[i];
                let price = this.safeNumber (a, 'price');
                let amount = this.safeNumber2 (a, 'quantity', 'amount');
                if (price === undefined) {
                    price = this.safeNumber (a, 0);
                }
                if (amount === undefined) {
                    amount = this.safeNumber (a, 1);
                }
                if (price !== undefined && amount !== undefined) {
                    asks.push ([ price, amount ]);
                }
            }
            return this.parseOrderBook ({ 'bids': bids, 'asks': asks, 'nonce': nonce }, this.safeString (market, 'symbol'), ts, 'bids', 'asks', 0, 1);
        } catch (e) {
            const req2: any = { 'ticker_id': marketId };
            if (limit !== undefined) {
                req2['depth'] = limit;
            }
            const alt = await this.publicGetOrderbook (this.extend (req2, params));
            const data2 = this.safeValue (alt, 'data', alt);
            let ts2 = this.safeInteger2 (data2, 'timestamp', 'ts');
            if (ts2 !== undefined && ts2 < 1000000000000) {
                ts2 = ts2 * 1000;
            }
            const nonce2 = this.safeInteger2 (data2, 'sequence', 'nonce');
            const rawBids2 = this.safeValue (data2, 'bids', []);
            const rawAsks2 = this.safeValue (data2, 'asks', []);
            const bids2 = [];
            for (let i = 0; i < rawBids2.length; i++) {
                const b = rawBids2[i];
                let price = this.safeNumber (b, 'price');
                let amount = this.safeNumber2 (b, 'quantity', 'amount');
                if (price === undefined) {
                    price = this.safeNumber (b, 0);
                }
                if (amount === undefined) {
                    amount = this.safeNumber (b, 1);
                }
                if (price !== undefined && amount !== undefined) {
                    bids2.push ([ price, amount ]);
                }
            }
            const asks2 = [];
            for (let i = 0; i < rawAsks2.length; i++) {
                const a = rawAsks2[i];
                let price = this.safeNumber (a, 'price');
                let amount = this.safeNumber2 (a, 'quantity', 'amount');
                if (price === undefined) {
                    price = this.safeNumber (a, 0);
                }
                if (amount === undefined) {
                    amount = this.safeNumber (a, 1);
                }
                if (price !== undefined && amount !== undefined) {
                    asks2.push ([ price, amount ]);
                }
            }
            return this.parseOrderBook ({ 'bids': bids2, 'asks': asks2, 'nonce': nonce2 }, this.safeString (market, 'symbol'), ts2, 'bids', 'asks', 0, 1);
        }
    }

    /**
     * @method
     * @name nonkyc#fetchTrades
     * @description fetch recent public trades for a given symbol
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of the earliest trade
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: any = { 'symbol': this.safeString (market, 'id') };
        if (limit !== undefined) {
            request.limit = limit;
        }
        const response = await this.publicGetMarketTrades (this.extend (request, params));
        const trades = this.parseTrades (response, market, undefined, limit);
        if (since !== undefined) {
            return this.filterBySinceLimit (trades, since, limit, 'timestamp');
        }
        return trades;
    }

    /**
     * @method
     * @name nonkyc#parseTrade
     * @description parse a raw trade (public or private) into a CCXT unified trade structure
     * @param {object} trade the raw trade data from the exchange
     * @param {Market} [market] the market structure
     * @returns {Trade} a [trade structure]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const id = this.safeString (trade, 'id');
        const ts = this.safeInteger2 (trade, 'timestamp', 'time');
        let datetime = undefined;
        if (ts !== undefined) {
            datetime = this.iso8601 (ts);
        }
        let symbolOut = undefined;
        if (market !== undefined) {
            symbolOut = market['symbol'];
        }
        if (symbolOut === undefined) {
            const marketObj = this.safeValue (trade, 'market');
            const schema = this.safeValue (marketObj, 'schema', {});
            const marketId = this.safeString (schema, 'id');
            const schemaSymbol = this.safeString (schema, 'symbol');
            if (marketId !== undefined) {
                symbolOut = this.safeSymbol (marketId, market);
            }
            if (symbolOut === undefined) {
                symbolOut = schemaSymbol;
            }
        }
        const side = this.safeStringLower2 (trade, 'side', 'type');
        const price = this.safeNumber (trade, 'price');
        const amount = this.safeNumber2 (trade, 'quantity', 'baseVolume');
        let cost = this.safeNumber2 (trade, 'quoteVolume', 'cost');
        const feeCost = this.safeNumber (trade, 'fee');
        const totalWithFee = this.safeNumber (trade, 'totalWithFee');
        if (cost === undefined) {
            if ((totalWithFee !== undefined) && (feeCost !== undefined)) {
                cost = totalWithFee - feeCost;
            } else {
                if ((price !== undefined) && (amount !== undefined)) {
                    cost = price * amount;
                }
            }
        }
        const orderId = this.safeString2 (trade, 'orderid', 'orderId');
        let takerOrMaker = undefined;
        const triggeredBy = this.safeStringLower (trade, 'triggeredBy');
        if (triggeredBy !== undefined) {
            if (triggeredBy === 'maker' || triggeredBy === 'taker') {
                takerOrMaker = triggeredBy;
            }
        }
        const altFeeCost = this.safeNumber (trade, 'alternateFee');
        const altFeeAsset = this.safeString (trade, 'alternateFeeAsset');
        let fee = undefined;
        let fees = undefined;
        if (feeCost !== undefined) {
            let feeCurrency = undefined;
            if (market !== undefined) {
                feeCurrency = market['quote'];
            }
            fee = { 'cost': feeCost, 'currency': feeCurrency };
        }
        if (altFeeCost !== undefined) {
            const altCode = this.safeCurrencyCode (altFeeAsset);
            fees = [];
            if (fee !== undefined) {
                fees.push (fee);
            }
            fees.push ({ 'cost': altFeeCost, 'currency': altCode });
            fee = undefined;
        }
        const tradeObj = {
            'id': id,
            'timestamp': ts,
            'datetime': datetime,
            'symbol': symbolOut,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
            'fees': fees,
            'info': trade,
        };
        return this.safeTrade (tradeObj, market);
    }

    /**
     * @method
     * @name nonkyc#fetchOHLCV
     * @description fetch historical OHLCV candles for a market
     * @param {string} symbol unified symbol of the market
     * @param {string} [timeframe] timeframe in minutes, default '1m'
     * @param {int} [since] timestamp in ms of the earliest candle
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OHLCV[]} a list of [OHLCV structures]{@link https://docs.ccxt.com/#/?id=ohlcv-structure}
     * @example
     * // node js/cli.js nonkyc fetchOHLCV "BTC/USDT" "5m" 1755820357695 100
     */
    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolutionStr = this.safeString (this.timeframes, timeframe);
        if (resolutionStr === undefined) {
            throw new ExchangeError (this.id + ' fetchOHLCV () unsupported timeframe ' + timeframe);
        }
        const resolution = parseInt (resolutionStr);
        let countBack = 100;
        if (limit !== undefined) {
            countBack = limit;
        }
        const request: any = {
            'symbol': this.safeString (market, 'id'),
            'resolution': resolution,
            'countBack': countBack,
            'firstDataRequest': 0,
        };
        if (since !== undefined) {
            request['from'] = since;
            request['to'] = this.milliseconds ();
        }
        const response = await this.publicGetMarketCandles (this.extend (request, params));
        const bars = this.safeValue (response, 'bars', []);
        const result = [];
        for (let i = 0; i < bars.length; i++) {
            const bar = bars[i];
            result.push ([
                this.safeInteger (bar, 'time'),
                this.safeNumber (bar, 'open'),
                this.safeNumber (bar, 'high'),
                this.safeNumber (bar, 'low'),
                this.safeNumber (bar, 'close'),
                this.safeNumber (bar, 'volume'),
            ]);
        }
        return this.sortBy (result, 0);
    }

    /**
     * @method
     * @name nonkyc#sign
     * @description sign and assemble a REST request
     * @param {string} path the endpoint path
     * @param {string} [api] 'public' or 'private'
     * @param {string} [method] HTTP method, default GET
     * @param {object} [params] query parameters
     * @param {object} [headers] HTTP headers
     * @param {object} [body] request body
     * @returns {object} an object containing the url, method, body, and headers
     */
    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined): any {
        const apiUrls = this.urls['api'];
        let base = '';
        if (typeof apiUrls === 'string') {
            base = apiUrls;
        } else {
            if (api in apiUrls) {
                base = apiUrls[api];
            } else {
                base = apiUrls['public'];
            }
        }
        let url = base + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            const qs = this.urlencode (query);
            if (qs && qs.length) {
                url = url + '?' + qs;
            }
        } else {
            if (Object.keys (query).length) {
                body = this.json (query);
            }
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.milliseconds ().toString ();
            let bodyString = '';
            if (typeof body === 'string') {
                bodyString = body;
            } else if (body) {
                bodyString = this.json (body);
            }
            const payload = this.apiKey + url + bodyString + nonce;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            headers = this.extend ({
                'X-API-KEY': this.apiKey,
                'X-API-NONCE': nonce,
                'X-API-SIGN': signature,
                'Accept': 'application/json',
            }, headers);
            if (method !== 'GET') {
                headers = this.extend ({ 'Content-Type': 'application/json' }, headers);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * @method
     * @name nonkyc#fetchBalance
     * @description fetch all account balances from the exchange
     * @see https://api.nonkyc.io/api/v2/balances
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @returns {Balances} a dictionary of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure} indexed by currency code
     */
    async fetchBalance (params = {}): Promise<Balances> {
        await this.loadMarkets ();
        const response = await this.privateGetBalances (params);
        const result: any = { 'info': response };
        let entries = [];
        if (Array.isArray (response)) {
            entries = response;
        }
        for (let i = 0; i < entries.length; i++) {
            const item = entries[i];
            const currencyId = this.safeString (item, 'asset');
            const code = this.safeCurrencyCode (currencyId);
            const available = this.safeString (item, 'available');
            const held = this.safeString (item, 'held');
            const pending = this.safeString (item, 'pending');
            const name = this.safeString (item, 'name');
            const assetid = this.safeString (item, 'assetid');
            const account = this.account ();
            account['free'] = available;
            account['used'] = held;
            account['info'] = {
                'name': name,
                'assetid': assetid,
                'pending': pending,
            };
            result[code] = account;
        }
        return this.safeBalance (result) as Balances;
    }

    /**
     * @method
     * @name nonkyc#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account.
     * Some master tickers (e.g. USDT/USDC) require a network-specific ticker like "USDT-TRC20".
     * You can pass it via params.ticker (full ticker) or params.network (suffix).
     * If neither is provided, the method will throw with available tickers from the API error message.
     * @see https://api.nonkyc.io/api/v2/getdepositaddress/{currency}
     * @param {string} code unified currency code, e.g. 'USDT' or 'XRP'
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.ticker] full exchange ticker like "USDT-TRC20" or "XRP-MAIN"
     * @param {string} [params.network] network suffix like "TRC20" | "ERC20" | "BEP20" | ... (will be combined as "CODE-NETWORK")
     * @returns {DepositAddress} a [deposit address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     * @example
     * // --- CLI ---
     * // USDT on TRON:
     * // node js/cli.js nonkyc fetchDepositAddress "USDT" '{"network":"TRC20"}'
     * // node js/cli.js nonkyc fetchDepositAddress "USDT" '{"ticker":"USDT-TRC20"}'
     */
    async fetchDepositAddress (code: string, params = {}): Promise<DepositAddress> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        let requestedTicker = this.safeString2 (params, 'ticker', 'networkTicker');
        const requestedNetwork = this.safeStringUpper (params, 'network');
        const nets = this.safeValue (currency, 'networks', {});
        const allKeys = Object.keys (nets);
        const depKeys = [];
        const supportedTickers = [];
        for (let i = 0; i < allKeys.length; i++) {
            const k = allKeys[i];
            const net = this.safeValue (nets, k, {});
            const isActive = this.safeBool (net, 'active', true);
            const canDeposit = this.safeBool (net, 'deposit', true);
            if (isActive && canDeposit) {
                depKeys.push (k);
                let netId = this.safeString (net, 'id');
                if (netId === undefined) {
                    netId = currency['code'] + '-' + k;
                }
                supportedTickers.push (netId);
            }
        }
        if (requestedTicker === undefined && requestedNetwork !== undefined) {
            requestedTicker = currency['code'] + '-' + requestedNetwork;
        }
        if (depKeys.length > 1) {
            if (requestedTicker === undefined) {
                const exampleNet = depKeys[0];
                const exampleTicker = currency['code'] + '-' + exampleNet;
                throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a specific network for ' + currency['code'] + '. Pass params.ticker like "' + exampleTicker + '" or params.network like "' + exampleNet + '". ' + 'Supported tickers: ' + supportedTickers.join (', '));
            }
            let suffix = undefined;
            const dashPos = requestedTicker.indexOf ('-');
            if (dashPos >= 0) {
                suffix = requestedTicker.slice (dashPos + 1);
            }
            if (suffix !== undefined) {
                suffix = this.safeStringUpper ({ 'x': suffix }, 'x');
            }
            let ok = false;
            for (let i = 0; i < supportedTickers.length; i++) {
                if (requestedTicker === supportedTickers[i]) {
                    ok = true;
                    break;
                }
            }
            if (!ok && (suffix !== undefined)) {
                for (let i = 0; i < depKeys.length; i++) {
                    if (suffix === depKeys[i]) {
                        const canonNet = this.safeValue (nets, suffix, {});
                        let netId = this.safeString (canonNet, 'id');
                        if (netId === undefined) {
                            netId = currency['code'] + '-' + suffix;
                        }
                        requestedTicker = netId;
                        ok = true;
                        break;
                    }
                }
            }
            if (!ok) {
                throw new BadRequest (this.id + ' fetchDepositAddress() unknown network for ' + currency['code'] + '. Supported tickers: ' + supportedTickers.join (', '));
            }
        } else if (depKeys.length === 1) {
            if (requestedTicker === undefined || requestedTicker === currency['code']) {
                const onlyKey = depKeys[0];
                const onlyNet = this.safeValue (nets, onlyKey, {});
                let netId = this.safeString (onlyNet, 'id');
                if (netId === undefined) {
                    netId = currency['code'] + '-' + onlyKey;
                }
                requestedTicker = netId;
            }
        } else {
            if (allKeys.length === 0) {
                const rootDeposit = this.safeBool (currency, 'deposit', true);
                if (!rootDeposit) {
                    throw new ExchangeError (this.id + ' fetchDepositAddress() deposits are disabled for ' + currency['code']);
                }
                if (requestedTicker !== undefined) {
                    const hasDash = requestedTicker.indexOf ('-') >= 0;
                    if (hasDash) {
                        throw new BadRequest (this.id + ' fetchDepositAddress() ' + currency['code'] + ' has no networks. Call without params.network/ticker.');
                    }
                }
                requestedTicker = currency['code'];
            } else {
                throw new ExchangeError (this.id + ' fetchDepositAddress() no deposit-enabled networks for ' + currency['code']);
            }
        }
        params = this.omit (params, [ 'network', 'ticker', 'networkTicker' ]);
        const req = { 'currency': requestedTicker };
        try {
            const res = await this.privateGetGetdepositaddressCurrency (this.extend (req, params));
            const payload = this.safeValue (res, 'data', res);
            return this.parseDepositAddress (payload, currency);
        } catch (e) {
            let msg = this.safeString (e as any, 'message');
            if (msg === undefined) {
                msg = this.safeString (e as any, 'Message');
            }
            let listed = undefined;
            if (msg !== undefined) {
                const anchor = 'Available tickers for this master ticker are:';
                const idx = msg.indexOf (anchor);
                if (idx >= 0) {
                    const tail = msg.slice (idx + anchor.length).trim ();
                    const parts = tail.split (',');
                    listed = [];
                    for (let j = 0; j < parts.length; j++) {
                        let s = parts[j];
                        if (s !== undefined) {
                            s = s.trim ();
                        }
                        if (s !== undefined && s.length > 0) {
                            listed.push (s);
                        }
                    }
                }
            }
            let extra = '';
            if (listed !== undefined && listed.length > 0) {
                extra = ' Supported tickers: ' + listed.join (', ');
            } else if (supportedTickers.length > 0) {
                extra = ' Supported tickers: ' + supportedTickers.join (', ');
            }
            throw new ArgumentsRequired (this.id + ' fetchDepositAddress() requires a specific network for ' + currency['code'] + '. Pass params.ticker as "' + currency['code'] + '-<NETWORK>" or params.network as "<NETWORK>".' + extra);
        }
    }

    /**
     * @method
     * @name nonkyc#parseDepositAddress
     * @description parse deposit address from the exchange specific format to CCXT unified format
     * @param {object} response raw response from nonkyc
     * @param {Currency} [currency] unified currency structure
     * @returns {DepositAddress} a [deposit address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    parseDepositAddress (response, currency: Currency = undefined): DepositAddress {
        const address = this.safeString (response, 'address');
        let tag = this.safeStringN (response, [ 'paymentid', 'memo', 'tag' ]);
        const currencyId = this.safeStringN (response, [ 'ticker', 'currency', 'coin' ]);
        let code = undefined;
        if (currency !== undefined) {
            code = currency['code'];
        } else {
            code = this.safeCurrencyCode (currencyId);
        }
        let network = undefined;
        const ticker = this.safeString (response, 'ticker');
        if (ticker !== undefined) {
            let lastDash = -1;
            let startPos = 0;
            for (let i = 0; i < 256; i++) {
                const p = ticker.indexOf ('-', startPos);
                if (p === -1) {
                    break;
                }
                lastDash = p;
                startPos = p + 1;
            }
            if (lastDash >= 0) {
                const sufLen = ticker.length - (lastDash + 1);
                if (sufLen > 0) {
                    network = ticker.slice (lastDash + 1).toUpperCase ();
                }
            }
        }
        if (network === undefined) {
            const networkId = this.safeString (response, 'network');
            const mapped = this.networkIdToCode (networkId, code);
            if (mapped !== undefined && (typeof mapped === 'string')) {
                let hasBad = false;
                if (mapped.indexOf (' ') >= 0) {
                    hasBad = true;
                }
                if (!hasBad && mapped.indexOf ('(') >= 0) {
                    hasBad = true;
                }
                if (!hasBad && mapped.indexOf (')') >= 0) {
                    hasBad = true;
                }
                if (!hasBad && mapped !== mapped.toUpperCase ()) {
                    hasBad = true;
                }
                if (!hasBad) {
                    for (let j = 0; j < mapped.length; j++) {
                        const ch = mapped.charAt (j);
                        const isAZ = (ch >= 'A' && ch <= 'Z');
                        const is09 = (ch >= '0' && ch <= '9');
                        if (!isAZ && !is09) {
                            hasBad = true;
                            break;
                        }
                    }
                }
                if (!hasBad) {
                    network = mapped;
                }
            }
        }
        if (tag !== undefined && typeof tag === 'string' && tag.length === 0) {
            tag = undefined;
        }
        this.checkAddress (address);
        return {
            'info': response,
            'currency': code,
            'network': network,
            'address': address,
            'tag': tag,
        };
    }

    /**
     * @method
     * @name nonkyc#fetchDeposits
     * @description fetch all deposits, optionally filtered by currency, since, limit, or pagination
     * @see https://api.nonkyc.io/api/v2/getdeposits
     * @param {string} [code] unified currency code, e.g. 'BTC' or 'USDT'
     * @param {Int} [since] timestamp in ms to fetch deposits after
     * @param {Int} [limit] max number of records to return
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.ticker] exchange ticker, e.g. 'USDT-TRC20' (overrides code)
     * @param {number} [params.skip] offset (pagination)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure} with type 'deposit'
     * @example
     * // CLI:
     * // node js/cli.js nonkyc fetchDeposits "USDT" optional: '{"limit":50,"since":1690000000000}'
     */
    async fetchDeposits (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request: any = {};
        let currency = undefined;
        let normCode = code;
        if (normCode !== undefined) {
            const dash = normCode.indexOf ('-');
            if (dash >= 0) {
                normCode = normCode.slice (0, dash);
            }
            currency = this.currency (normCode);
            request['ticker'] = currency['code'];
        }
        const inputTicker = this.safeString2 (params, 'ticker', 'networkTicker');
        if (inputTicker !== undefined) {
            let parent = inputTicker;
            const dp = parent.indexOf ('-');
            if (dp >= 0) {
                parent = parent.slice (0, dp);
            }
            const codeNorm = this.safeCurrencyCode (parent);
            if (codeNorm !== undefined) {
                request['ticker'] = codeNorm;
                if (currency === undefined) {
                    currency = this.currency (codeNorm);
                }
            }
            params = this.omit (params, [ 'ticker', 'networkTicker', 'network' ]);
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const skip = this.safeInteger (params, 'skip');
        if (skip !== undefined) {
            request['skip'] = skip;
            params = this.omit (params, 'skip');
        }
        const response = await this.privateGetGetdeposits (this.extend (request, params));
        const payload = this.safeValue (response, 'data', response);
        let rows = [];
        if (Array.isArray (payload)) {
            rows = payload;
        } else {
            rows = this.safeValue2 (payload, 'items', 'records', []);
        }
        const results = [];
        for (let i = 0; i < rows.length; i++) {
            const tx = this.parseTransaction (rows[i], currency);
            results.push (tx);
        }
        const sorted = this.sortBy (results, 'timestamp');
        return this.filterByCurrencySinceLimit (sorted, normCode, since, limit);
    }

    /**
     * @method
     * @name nonkyc#parseTransaction
     * @description parse raw deposit/withdraw structure to CCXT unified transaction
     * @param {object} transaction raw transaction from nonkyc
     * @param {Currency} [currency]
     * @returns {Transaction} transactions
     */
    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        const id = this.safeString (transaction, 'id');
        let address = this.safeString (transaction, 'address');
        if (address !== undefined && typeof address === 'string' && address.length === 0) {
            address = undefined;
        }
        let tag = this.safeStringN (transaction, [ 'paymentid', 'memo', 'tag' ]);
        if (tag !== undefined && typeof tag === 'string' && tag.length === 0) {
            tag = undefined;
        }
        const txid = this.safeString (transaction, 'transactionid');
        const firstSeen = this.safeString (transaction, 'firstseenat');
        let timestamp = this.parse8601 (firstSeen);
        if (timestamp === undefined) {
            timestamp = this.safeInteger (transaction, 'firstseenat');
        }
        const currencyId = this.safeString2 (transaction, 'ticker', 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const childTicker = this.safeString (transaction, 'childticker');
        let network = undefined;
        if (childTicker !== undefined) {
            const pos = childTicker.indexOf ('-');
            if (pos >= 0 && pos + 1 < childTicker.length) {
                const networkId = childTicker.slice (pos + 1);
                network = this.networkIdToCode (networkId, code);
            }
        }
        const amount = this.safeNumber (transaction, 'quantity');
        const rawStatus = this.safeString (transaction, 'status');
        const isPosted = this.safeBool (transaction, 'isposted');
        const isReversed = this.safeBool (transaction, 'isreversed');
        const confirmations = this.safeInteger (transaction, 'confirmations');
        const status = this.parseTransactionStatus (rawStatus, isPosted, isReversed);
        let datetime = undefined;
        if (timestamp !== undefined) {
            datetime = this.iso8601 (timestamp);
        }
        const result = {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'address': address,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'deposit',
            'amount': amount,
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': undefined,
            'network': network,
            'comment': undefined,
            'internal': undefined,
            'confirmations': confirmations,
        };
        return result;
    }

    parseTransactionStatus (status: string = undefined, isPosted: boolean = undefined, isReversed: boolean = undefined): string {
        if (isReversed === true) {
            return 'failed';
        }
        if (isPosted === true && status === undefined) {
            return 'ok';
        }
        if (status !== undefined) {
            const s = status.toLowerCase ();
            if (s === 'completed' || s === 'success' || s === 'succeeded' || s === 'confirmed' || s === 'ok') {
                return 'ok';
            } else if (s === 'pending' || s === 'unconfirmed' || s === 'processing') {
                return 'pending';
            } else if (s === 'canceled' || s === 'cancelled' || s === 'rejected' || s === 'failed' || s === 'reversed') {
                return 'failed';
            }
        }
        return status;
    }

    /**
     * @method
     * @name nonkyc#fetchWithdrawals
     * @description fetch account withdrawals, optionally filtered by currency, since, limit, pagination
     * @see https://api.nonkyc.io/api/v2/getwithdrawals
     * @param {string} [code] unified currency code, e.g. 'BTC' or 'USDT'
     * @param {Int} [since] timestamp in ms to fetch withdrawals after
     * @param {Int} [limit] max number of records (API max 500)
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.ticker] full exchange ticker like "USDT-TRC20" (overrides code)
     * @param {number} [params.skip] offset for pagination
     * @returns {Transaction[]} a list of withdrawals as [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     * @example
     * // CLI:
     * // node js/cli.js nonkyc fetchWithdrawals "USDT" '{"limit":50,"since":1690000000000}'
     */
    async fetchWithdrawals (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const request = {};
        const ticker = this.safeString2 (params, 'ticker', 'networkTicker');
        if (ticker !== undefined) {
            request['ticker'] = ticker;
            params = this.omit (params, [ 'ticker', 'networkTicker' ]);
        } else if (code !== undefined) {
            const currency = this.currency (code);
            request['ticker'] = currency['code'];
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const skip = this.safeInteger (params, 'skip');
        if (skip !== undefined) {
            request['skip'] = skip;
            params = this.omit (params, 'skip');
        }
        const response = await this.privateGetGetwithdrawals (this.extend (request, params));
        let rows = [];
        if (Array.isArray (response)) {
            rows = response;
        } else {
            rows = this.safeValue (response, 'data', []);
            if (!Array.isArray (rows)) {
                rows = this.safeValue (response, 'result', []);
            }
            if (!Array.isArray (rows)) {
                rows = this.safeValue (response, 'withdrawals', []);
            }
            if (!Array.isArray (rows)) {
                rows = [];
            }
        }
        const results = [];
        for (let i = 0; i < rows.length; i++) {
            const tx = this.parseWithdrawal (rows[i]);
            results.push (tx);
        }
        return this.sortBy (results, 'timestamp') as Transaction[];
    }

    parseWithdrawal (transaction, currency: Currency = undefined): Transaction {
        const id = this.safeString (transaction, 'id');
        const address = this.safeString (transaction, 'address');
        let tag = this.safeStringN (transaction, [ 'paymentid', 'memo', 'tag' ]);
        if (tag !== undefined && typeof tag === 'string' && tag.length === 0) {
            tag = undefined;
        }
        const txid = this.safeString (transaction, 'transactionid');
        const requested = this.safeString (transaction, 'requestedat');
        let timestamp = this.parse8601 (requested);
        if (timestamp === undefined) {
            timestamp = this.safeInteger (transaction, 'requestedat');
        }
        let datetime = undefined;
        if (timestamp !== undefined) {
            datetime = this.iso8601 (timestamp);
        }
        const currencyId = this.safeString2 (transaction, 'ticker', 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const childTicker = this.safeString (transaction, 'childticker');
        let network = undefined;
        if (childTicker !== undefined) {
            const pos = childTicker.indexOf ('-');
            if (pos >= 0 && pos + 1 < childTicker.length) {
                const networkId = childTicker.slice (pos + 1);
                network = this.networkIdToCode (networkId, code);
            }
        }
        const amount = this.safeNumber (transaction, 'quantity');
        const feeCost = this.safeNumber (transaction, 'fee');
        const feeCurrencyId = this.safeString2 (transaction, 'feecurrency', 'feeCurrency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId, currency);
        let fee = undefined;
        if (feeCost !== undefined) {
            fee = { 'cost': feeCost, 'currency': feeCurrency };
        }
        const rawStatus = this.safeString (transaction, 'status');
        const isSent = this.safeBool (transaction, 'issent');
        let sentAt = undefined;
        if (isSent) {
            sentAt = this.safeString (transaction, 'sentat');
        }
        let sentDate = undefined;
        if (sentAt !== undefined) {
            sentDate = this.iso8601 (sentAt);
        }
        const result = {
            'info': transaction,
            'id': id,
            'txid': txid,
            'timestamp': timestamp,
            'datetime': datetime,
            'address': address,
            'addressFrom': undefined,
            'addressTo': address,
            'tag': tag,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': rawStatus,
            'updated': sentDate,
            'fee': fee,
            'network': network,
            'comment': undefined,
            'internal': undefined,
        };
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchOrder
     * @description fetch an order by id (server accepts either exchange order id or userProvidedId)
     * @see https://api.nonkyc.io/api/v2/getorder/{orderId}
     * @param {string} id exchange order id or client/userProvidedId
     * @param {string} [symbol] unified symbol of the market
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @returns {Order} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     * @example
     * // CLI:
     * // node js/cli.js nonkyc fetchOrder "NonkycOrderId"
     * // node js/cli.js nonkyc fetchOrder "YourClientId"
     */
    async fetchOrder (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const request = { 'orderId': id };
        const response = await this.privateGetGetorderOrderId (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status: string = undefined, isActive: boolean = undefined): string {
        if (status !== undefined) {
            const s = status.toLowerCase ();
            if (s === 'open' || s === 'new' || s === 'pending' || s === 'active' || s === 'partially_filled' || s === 'partiallyfilled') {
                return 'open';
            }
            if (s === 'closed' || s === 'filled' || s === 'executed' || s === 'done' || s === 'completed') {
                return 'closed';
            }
            if (s === 'canceled' || s === 'cancelled' || s === 'rejected' || s === 'expired') {
                return 'canceled';
            }
        }
        if (isActive === true) {
            return 'open';
        }
        return status;
    }

    /**
     * @method
     * @name nonkyc#fetchOrders
     * @description fetch a list of orders, ordered by creation time descending
     * @see https://api.nonkyc.io/api/v2/account/orders
     * @param {string} [symbol] unified market symbol, e.g. 'DOGE/BTC'
     * @param {Int} [since] timestamp in ms to fetch orders after
     * @param {Int} [limit] max number of records (API max 500)
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.status] 'active' | 'filled' | 'cancelled' (you may also pass 'open' | 'closed' | 'canceled' and it will be mapped)
     * @param {number} [params.skip] offset for pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     * @example
     * // CLI:
     * // node js/cli.js nonkyc fetchOrders "DOGE/BTC" '{"status":"active","limit":50,"skip":0}'
     */
    async fetchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrders() requires a symbol argument');
        }
        const request = {};
        const market = this.market (symbol);
        request['symbol'] = this.safeString (market, 'id');
        const statusIn = this.safeStringLower (params, 'status');
        if (statusIn !== undefined) {
            let statusOut = statusIn;
            if (statusIn === 'open') {
                statusOut = 'active';
            } else if (statusIn === 'closed') {
                statusOut = 'filled';
            } else if (statusIn === 'canceled') {
                statusOut = 'cancelled';
            }
            request['status'] = statusOut;
            params = this.omit (params, 'status');
        }
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const skip = this.safeInteger (params, 'skip');
        if (skip !== undefined) {
            request['skip'] = skip;
            params = this.omit (params, 'skip');
        }
        const response = await this.privateGetAccountOrders (this.extend (request, params));
        const orders = [];
        if (Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                const parsed = this.parseOrder (response[i], market);
                orders.push (parsed);
            }
        }
        const sorted = this.sortBy (orders, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    /**
     * @method
     * @name nonkyc#parseOrder
     * @description parse an order from nonkyc to CCXT unified order
     * @param {object} order raw order
     * @param {object} [market]
     * @returns {Order} parse specific and bulk order
     */
    parseOrder (order, market: Market = undefined): Order {
        let symbolOut = undefined;
        const rawSymbol = this.safeString (order, 'symbol');
        if (rawSymbol !== undefined) {
            symbolOut = rawSymbol;
        }
        if (symbolOut === undefined) {
            const marketObj = this.safeValue (order, 'market');
            if (marketObj !== undefined) {
                const mktSymbol = this.safeString (marketObj, 'symbol');
                if (mktSymbol !== undefined) {
                    const m0 = this.safeMarket (mktSymbol, market);
                    symbolOut = this.safeString (m0, 'symbol', mktSymbol);
                }
                if (symbolOut === undefined) {
                    const schema = this.safeValue (marketObj, 'schema', {});
                    const schemaSymbol = this.safeString (schema, 'symbol');
                    if (schemaSymbol !== undefined) {
                        const m1 = this.safeMarket (schemaSymbol, market);
                        symbolOut = this.safeString (m1, 'symbol', schemaSymbol);
                    }
                }
                if (symbolOut === undefined) {
                    const mktId = this.safeString (marketObj, 'id');
                    if (mktId !== undefined) {
                        const m2 = this.safeMarket (mktId, market);
                        symbolOut = this.safeString (m2, 'symbol');
                    }
                }
                if (symbolOut === undefined) {
                    const schema2 = this.safeValue (marketObj, 'schema', {});
                    const schemaId = this.safeString (schema2, 'id');
                    if (schemaId !== undefined) {
                        const m3 = this.safeMarket (schemaId, market);
                        symbolOut = this.safeString (m3, 'symbol');
                    }
                }
            }
        }
        if (symbolOut === undefined && market !== undefined) {
            symbolOut = market['symbol'];
        }
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString2 (order, 'userProvidedId', 'clientOrderId');
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'type');
        const price = this.safeNumber (order, 'price');
        const amount = this.safeNumber (order, 'quantity');
        const filled = this.safeNumber (order, 'executedQuantity');
        const remaining = this.safeNumber (order, 'remainQuantity');
        let createdAt = this.safeInteger (order, 'createdAt');
        const timestampAlt = this.safeInteger (order, 'timestamp');
        if (createdAt === undefined) {
            createdAt = timestampAlt;
        }
        const updatedAt = this.safeInteger (order, 'updatedAt');
        const lastTradeAt = this.safeInteger (order, 'lastTradeAt');
        let datetime = undefined;
        if (createdAt !== undefined) {
            datetime = this.iso8601 (createdAt);
        }
        const rawStatus = this.safeString (order, 'status');
        const isActive = this.safeBool (order, 'isActive');
        const status = this.parseOrderStatus (rawStatus, isActive);
        let reduceOnly = this.safeBool (order, 'reduceOnly');
        if (reduceOnly === undefined) {
            reduceOnly = false;
        }
        const result = {
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': createdAt,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeAt,
            'lastUpdateTimestamp': updatedAt,
            'status': status,
            'symbol': symbolOut,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'average': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'fees': undefined,
            'reduceOnly': reduceOnly,
        };
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchMyTrades
     * @description fetch a list of your trades, ordered by creation time descending
     * @see https://api.nonkyc.io/api/v2/account/trades
     * @param {string} [symbol] unified market symbol, e.g. 'BTC/USDT'; if omitted returns trades for all symbols
     * @param {Int} [since] timestamp in ms to fetch trades after
     * @param {Int} [limit] max number of records (API max 500)
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {number} [params.skip] offset for pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     * @example
     * // CLI:
     * // node js/cli.js nonkyc fetchMyTrades "BTC/USDT" '{"limit":50,"since":1690000000000}'
     */
    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades() requires a symbol argument');
        }
        const market = this.market (symbol);
        const request = {};
        request['symbol'] = this.safeString (market, 'id');
        if (since !== undefined) {
            request['since'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const skip = this.safeInteger (params, 'skip');
        if (skip !== undefined) {
            request['skip'] = skip;
            params = this.omit (params, 'skip');
        }
        const response = await this.privateGetAccountTrades (this.extend (request, params));
        const trades = [];
        if (Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                const t = this.parseTrade (response[i], market);
                trades.push (t);
            }
        }
        const sorted = this.sortBy (trades, 'timestamp') as Trade[];
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    /**
     * @method
     * @name nonkyc#createOrder
     * @description create a trade order
     * @see https://api.nonkyc.io/api/v2/createorder
     * @param {string} symbol unified market symbol, e.g. 'BTC/USDT'
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {number} amount how much you want to trade in units of the base currency
     * @param {number} [price] required for limit orders
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.clientOrderId] client-specified id (mapped to userProvidedId)
     * @param {string} [params.userProvidedId] same as clientOrderId
     * @param {boolean} [params.strictValidate]
     * @returns {Order} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     * @example
     * // CLI
     * // node js/cli.js nonkyc createOrder "BTC/USDT" "limit" "sell" 0.01 60000 '{"clientOrderId":"my-oid"}'
     * // node js/cli.js nonkyc createOrder "BTC/USDT" "market" "buy"  0.05
     */
    async createOrder (symbol: string, type: string, side: string, amount: number, price: number = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        request['symbol'] = market['symbol'];
        request['side'] = side.toLowerCase ();
        request['type'] = type.toLowerCase ();
        request['quantity'] = this.amountToPrecision (symbol, amount);
        if (request['type'] === 'limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'userProvidedId');
        if (clientOrderId !== undefined) {
            request['userProvidedId'] = clientOrderId;
            params = this.omit (params, [ 'clientOrderId', 'userProvidedId' ]);
        }
        let strictValidate = this.safeBool (params, 'strictValidate');
        if (strictValidate === undefined) {
            strictValidate = false;
        }
        request['strictValidate'] = strictValidate;
        params = this.omit (params, 'strictValidate');
        const response = await this.privatePostCreateorder (this.extend (request, params));
        let mkt = undefined;
        if (symbol !== undefined) {
            mkt = market;
        }
        const parsed = this.parseOrder (response, mkt);
        return parsed;
    }

    /**
     * @method
     * @name nonkyc#cancelOrder
     * @description cancel an order by id (server accepts exchange order id or your userProvidedId)
     * @see https://api.nonkyc.io/api/v2/cancelorder
     * @param {string} id exchange order id (or pass your client id via params.clientOrderId / params.userProvidedId)
     * @param {string} [symbol] unified market symbol, e.g. 'BTC/USDT'
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.clientOrderId] your client-provided id (alias: userProvidedId)
     * @returns {Order} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with status 'canceled'
     * @example
     * // CLI:
     * // node js/cli.js nonkyc cancelOrder "68a6251f4ff3f91ef6b4008c"
     * // node js/cli.js nonkyc cancelOrder "ignored" '{"clientOrderId":"my-oid"}'
     * // node js/cli.js nonkyc cancelOrder "68a6251f4ff3f91ef6b4008c" '{"fetchBeforeCancel":true}' for symbol in output
     * // node js/cli.js nonkyc cancelOrder "ignored" '{"clientOrderId":"my-oid","fetchBeforeCancel":true}' via clientId to add symbol in output
     */
    async cancelOrder (id: string, symbol: string = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        let idToCancel = id;
        const clientId = this.safeString2 (params, 'clientOrderId', 'userProvidedId');
        if (clientId !== undefined) {
            idToCancel = clientId;
            params = this.omit (params, [ 'clientOrderId', 'userProvidedId' ]);
        }
        if (symbol === undefined) {
            const fetchBefore = this.safeBool (params, 'fetchBeforeCancel');
            if (fetchBefore) {
                const fetched = await this.fetchOrder (idToCancel);
                symbol = this.safeString (fetched, 'symbol');
            }
            params = this.omit (params, 'fetchBeforeCancel');
        }
        const request = { 'id': idToCancel };
        const response = await this.privatePostCancelorder (this.extend (request, params));
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        let symbolOut = undefined;
        if (market !== undefined) {
            symbolOut = market['symbol'];
        }
        const now = this.milliseconds ();
        const result = {
            'info': response,
            'id': this.safeString (response, 'id', id),
            'clientOrderId': clientId,
            'timestamp': undefined,
            'datetime': undefined,
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': now,
            'status': 'canceled',
            'symbol': symbolOut,
            'type': undefined,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': undefined,
            'price': undefined,
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'average': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'fees': undefined,
            'reduceOnly': false,
        };
        return result;
    }

    /**
     * @method
     * @name nonkyc#cancelAllOrders
     * @description cancel all open orders, optionally filtered by symbol and/or side
     * @see https://api.nonkyc.io/api/v2/cancelallorders
     * @param {string} [symbol] unified market symbol, e.g. 'BTC/USDT'
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.side] 'buy' or 'sell' (optional filter)
     * @returns {Order[]} a list of orders with status 'canceled'
     * @example
     * // node js/cli.js nonkyc cancelAllOrders "BTC/USDT"
     * // node js/cli.js nonkyc cancelAllOrders "BTC/USDT" '{"side":"sell"}'
     * // node js/cli.js nonkyc cancelAllOrders "" '{"side":"buy"}'
     */
    async cancelAllOrders (symbol: string = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        if (symbol === '') {
            symbol = undefined;
        }
        const sideIn = this.safeStringLower (params, 'side');
        const paramsNoSide = this.omit (params, 'side');
        const now = this.milliseconds ();
        const targets = [];
        if (symbol !== undefined) {
            targets.push (symbol);
        } else {
            const open = await this.fetchOpenOrders (undefined, undefined, undefined, params);
            const seen = {};
            for (let i = 0; i < open.length; i++) {
                const sym = this.safeString (open[i], 'symbol');
                if (sym !== undefined) {
                    seen[sym] = true;
                }
            }
            const syms = Object.keys (seen);
            for (let j = 0; j < syms.length; j++) {
                targets.push (syms[j]);
            }
        }
        const sides = [];
        if (sideIn !== undefined) {
            sides.push (sideIn);
        } else {
            sides.push ('buy');
            sides.push ('sell');
        }
        const result = [];
        for (let t = 0; t < targets.length; t++) {
            const sym = targets[t];
            const market = this.market (sym);
            for (let s = 0; s < sides.length; s++) {
                const side = sides[s];
                const request = {};
                request['symbol'] = market['id'];
                request['side'] = side;
                const response = await this.privatePostCancelallorders (this.extend (request, paramsNoSide));
                const ids = this.safeValue (response, 'ids', []);
                for (let i = 0; i < ids.length; i++) {
                    const id = this.safeString (ids, i);
                    const order = {
                        'info': this.extend ({ 'id': id }, response),
                        'id': id,
                        'clientOrderId': undefined,
                        'timestamp': undefined,
                        'datetime': undefined,
                        'lastTradeTimestamp': undefined,
                        'lastUpdateTimestamp': now,
                        'status': 'canceled',
                        'symbol': market['symbol'],
                        'type': undefined,
                        'timeInForce': undefined,
                        'postOnly': undefined,
                        'side': side,
                        'price': undefined,
                        'stopPrice': undefined,
                        'triggerPrice': undefined,
                        'amount': undefined,
                        'filled': undefined,
                        'remaining': undefined,
                        'average': undefined,
                        'cost': undefined,
                        'trades': undefined,
                        'fee': undefined,
                        'fees': undefined,
                        'reduceOnly': undefined,
                    };
                    result.push (order);
                }
            }
        }
        return result;
    }

    /**
     * @method
     * @name nonkyc#withdraw
     * @description create a crypto withdrawal
     * @see https://api.nonkyc.io/api/v2/createwithdrawal
     * @param {string} code unified currency code, e.g. 'USDT', 'BTC'
     * @param {number} amount amount to withdraw in units of `code`
     * @param {string} address the destination address
     * @param {string} [tag] an optional tag/memo/payment id
     * @param {object} [params] extra parameters specific to the nonkyc API endpoint
     * @param {string} [params.ticker] full exchange ticker like "USDT-TRC20" (overrides code)
     * @param {string} [params.network] network suffix like "TRC20" | "ERC20" | "BEP20" ... (combined as "CODE-NETWORK")
     * @param {string} [params.paymentid] explicit payment id (alias of `tag`)
     * @returns {Transaction} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure} with type 'withdrawal'
     * @example
     * // CLI:
     * // node js/cli.js nonkyc withdraw "USDT" 5 "TVjs...address..." null '{"ticker":"USDT-TRC20"}'
     * // node js/cli.js nonkyc withdraw "XRP" 10 "rEb8TK3gBgk5..." "108618262" '{"ticker":"XRP-MAIN"}'
     */
    async withdraw (code: string, amount: number, address: string, tag: string = undefined, params = {}): Promise<Transaction> {
        await this.loadMarkets ();
        const currency = this.currency (code);
        this.checkAddress (address);
        let requestTicker = this.safeString2 (params, 'ticker', 'networkTicker');
        if (requestTicker === undefined) {
            const net = this.safeStringUpper (params, 'network');
            if (net !== undefined) {
                requestTicker = currency['code'] + '-' + net;
            }
        }
        if (requestTicker === undefined) {
            requestTicker = currency['code'];
        }
        params = this.omit (params, [ 'network', 'ticker', 'networkTicker' ]);
        const request = {};
        request['ticker'] = requestTicker;
        request['quantity'] = this.currencyToPrecision (code, amount);
        request['address'] = address;
        let paymentId = tag;
        if (paymentId === undefined) {
            paymentId = this.safeString2 (params, 'paymentid', 'paymentId');
            if (paymentId !== undefined) {
                params = this.omit (params, [ 'paymentid', 'paymentId' ]);
            }
        }
        if (paymentId !== undefined) {
            request['paymentid'] = paymentId;
        }
        let response = undefined;
        try {
            response = await this.privatePostCreatewithdrawal (this.extend (request, params));
        } catch (e) {
            let msg = this.safeString (e, 'message');
            if (msg === undefined) {
                msg = this.safeString ((e as any), 'Message');
            }
            let available = undefined;
            if (msg !== undefined) {
                const anchor = 'Available tickers for this master ticker are:';
                const idx = msg.indexOf (anchor);
                if (idx >= 0) {
                    const tail = msg.slice (idx + anchor.length).trim ();
                    const parts = tail.split (',');
                    available = [];
                    for (let j = 0; j < parts.length; j++) {
                        let s = parts[j];
                        if (s !== undefined) {
                            s = s.trim ();
                        }
                        if ((s !== undefined) && (s.length > 0)) {
                            available.push (s);
                        }
                    }
                }
            }
            if (available !== undefined) {
                let exampleNetwork = undefined;
                for (let k = 0; k < available.length; k++) {
                    const t = available[k];
                    if (t !== undefined) {
                        const dash = t.indexOf ('-');
                        if (dash >= 0) {
                            const prefix = t.slice (0, dash);
                            const suffix = t.slice (dash + 1);
                            if (prefix === currency['code']) {
                                exampleNetwork = suffix;
                                break;
                            } else {
                                if (exampleNetwork === undefined) {
                                    exampleNetwork = suffix;
                                }
                            }
                        }
                    }
                }
                let exampleTicker = currency['code'] + '-<NETWORK>';
                let exampleNetText = '<NETWORK>';
                if (exampleNetwork !== undefined) {
                    if (exampleNetwork.length > 0) {
                        exampleTicker = currency['code'] + '-' + exampleNetwork;
                        exampleNetText = exampleNetwork;
                    }
                }
                let extra = '';
                if (available.length > 0) {
                    extra = ' Supported tickers: ' + available.join (', ');
                }
                throw new ArgumentsRequired (this.id + ' withdraw() requires a specific network for ' + currency['code'] + '. Pass params.ticker as "' + exampleTicker + '" or params.network as "' + exampleNetText + '".' + extra);
            }
            throw e;
        }
        return this.parseWithdrawal (response, currency);
    }

    /**
     * @method
     * @name nonkyc#fetchTradingLimits
     * @description fetches min/max trading limits per market, derived from markets[].limits
     * @param {string[]} [symbols] unified symbols to fetch limits for, otherwise all markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of limits indexed by market symbol
     */
    async fetchTradingLimits (symbols: string[] = undefined, params = {}) {
        await this.loadMarkets ();
        let targetSymbols = symbols;
        if (targetSymbols === undefined) {
            targetSymbols = this.symbols;
        }
        const result = {};
        for (let i = 0; i < targetSymbols.length; i++) {
            const symbol = targetSymbols[i];
            const market = this.market (symbol);
            const limits = this.safeValue (market, 'limits', {});
            result[symbol] = limits;
        }
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchTradingFees
     * @description fetches trading fees (maker/taker) for all spot markets (static from describe)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary indexed by market symbols
     */
    async fetchTradingFees (params = {}): Promise<TradingFees> {
        await this.loadMarkets ();
        const trading = this.safeValue (this.fees, 'trading', {});
        const maker = this.safeNumber (trading, 'maker');
        const taker = this.safeNumber (trading, 'taker');
        const result = {};
        const symbols = this.symbols;
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            result[symbol] = {
                'info': trading,
                'symbol': symbol,
                'maker': maker,
                'taker': taker,
                'percentage': true,
                'tierBased': false,
            };
        }
        return result;
    }

    /**
     * @method
     * @name nonkyc#fetchTradingFee
     * @description fetches the trading fees for a single market (static from describe)
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {TradingFee} a [trading fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    async fetchTradingFee (symbol: string, params = {}): Promise<TradingFeeInterface> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trading = this.safeValue (this.fees, 'trading', {});
        const maker = this.safeNumber (trading, 'maker');
        const taker = this.safeNumber (trading, 'taker');
        return {
            'info': trading,
            'symbol': market['symbol'],
            'maker': maker,
            'taker': taker,
            'percentage': true,
            'tierBased': false,
        };
    }

    /**
     * @method
     * @name nonkyc#fetchOpenOrders
     * @description fetches open orders for a symbol or all symbols
     * @param {string} [symbol] unified symbol of the market to fetch open orders for
     * @param {Int} [since] timestamp in ms of the earliest order
     * @param {Int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOpenOrders() requires a symbol argument');
        }
        const request = { 'status': 'open' };
        const newParams = this.extend (request, params);
        return await this.fetchOrders (symbol, since, limit, newParams);
    }

    /**
     * @method
     * @name nonkyc#fetchTransactions
     * @description fetches deposits and withdrawals merged into a single array of transactions
     * @param {string} [code] unified currency code
     * @param {Int} [since] timestamp in ms of the earliest transaction
     * @param {Int} [limit] max number of transactions to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransactions (code: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        await this.loadMarkets ();
        const deposits = await this.fetchDeposits (code, since, limit, params);
        const withdrawals = await this.fetchWithdrawals (code, since, limit, params);
        let all = [];
        if (deposits !== undefined) {
            all = all.concat (deposits);
        }
        if (withdrawals !== undefined) {
            all = all.concat (withdrawals);
        }
        return this.sortBy (all, 'timestamp');
    }
}
