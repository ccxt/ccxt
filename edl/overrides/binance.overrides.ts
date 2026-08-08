// binance.overrides.ts
// Hand-written implementations for complex methods that can't be easily generated from EDL
// These methods require special handling for Binance's multiple market types and signature algorithms

import type { Balances, Dict } from '../base/types.js';

/**
 * @method
 * @name binance#fetchBalance
 * @description query for balance and get the amount of funds available for trading or funds locked in orders
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @param {string} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
 * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading
 * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
 * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the balance for a portfolio margin account
 * @param {string} [params.subType] 'linear' or 'inverse'
 * @returns {object} a balance structure
 */
export const fetchBalance = async function (this: any, params = {}): Promise<Balances> {
    await this.loadMarkets();
    const defaultType = this.safeString2(this.options, 'fetchBalance', 'defaultType', 'spot');
    let type = this.safeString(params, 'type', defaultType);
    let subType = undefined;
    [subType, params] = this.handleSubTypeAndParams('fetchBalance', undefined, params);
    let isPortfolioMargin = undefined;
    [isPortfolioMargin, params] = this.handleOptionAndParams2(params, 'fetchBalance', 'papi', 'portfolioMargin', false);
    let marginMode = undefined;
    let query = undefined;
    [marginMode, query] = this.handleMarginModeAndParams('fetchBalance', params);
    query = this.omit(query, 'type');
    let response = undefined;
    const request: Dict = {};

    // Route to appropriate endpoint based on type
    if (isPortfolioMargin || (type === 'papi')) {
        if (this.isLinear(type, subType)) {
            type = 'linear';
        } else if (this.isInverse(type, subType)) {
            type = 'inverse';
        }
        isPortfolioMargin = true;
        response = await this.papiGetBalance(this.extend(request, query));
    } else if (this.isLinear(type, subType)) {
        type = 'linear';
        let useV2 = undefined;
        [useV2, params] = this.handleOptionAndParams(params, 'fetchBalance', 'useV2', false);
        params = this.extend(request, query);
        if (!useV2) {
            response = await this.fapiPrivateV3GetAccount(params);
        } else {
            response = await this.fapiPrivateV2GetAccount(params);
        }
    } else if (this.isInverse(type, subType)) {
        type = 'inverse';
        response = await this.dapiPrivateGetAccount(this.extend(request, query));
    } else if (marginMode === 'isolated') {
        const paramSymbols = this.safeList(params, 'symbols');
        query = this.omit(query, 'symbols');
        if (paramSymbols !== undefined) {
            let symbols = '';
            if (Array.isArray(paramSymbols)) {
                symbols = this.marketId(paramSymbols[0]);
                for (let i = 1; i < paramSymbols.length; i++) {
                    const symbol = paramSymbols[i];
                    const id = this.marketId(symbol);
                    symbols += ',' + id;
                }
            } else {
                symbols = paramSymbols;
            }
            request['symbols'] = symbols;
        }
        response = await this.sapiGetMarginIsolatedAccount(this.extend(request, query));
    } else if ((type === 'margin') || (marginMode === 'cross')) {
        response = await this.sapiGetMarginAccount(this.extend(request, query));
    } else if (type === 'savings') {
        response = await this.sapiGetLendingUnionAccount(this.extend(request, query));
    } else if (type === 'funding') {
        response = await this.sapiPostAssetGetFundingAsset(this.extend(request, query));
    } else {
        response = await this.privateGetAccount(this.extend(request, query));
    }

    return this.parseBalanceCustom(response, type, marginMode, isPortfolioMargin);
};

/**
 * @method
 * @name binance#sign
 * @description sign API request with authentication credentials
 * @param {string} path endpoint path
 * @param {string} api api type (public/private/sapi/etc)
 * @param {string} method HTTP method
 * @param {object} params request parameters
 * @param {object} headers request headers
 * @param {object} body request body
 * @returns {object} signed request
 */
export const sign = function (
    this: any,
    path: string,
    api = 'public',
    method = 'GET',
    params = {},
    headers: any = undefined,
    body: any = undefined
) {
    if (!(api in this.urls['api'])) {
        throw new this.NotSupported(this.id + ' does not have a testnet/sandbox URL for ' + api + ' endpoints');
    }
    let url = this.urls['api'][api];
    url += '/' + path;

    // Special handling for historicalTrades endpoint
    if (path === 'historicalTrades') {
        if (this.apiKey) {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
            };
        } else {
            throw new this.AuthenticationError(this.id + ' historicalTrades endpoint requires `apiKey` credential');
        }
    }

    // Special handling for userDataStream endpoints
    const userDataStream = (path === 'userDataStream') || (path === 'listenKey');
    if (userDataStream) {
        if (this.apiKey) {
            headers = {
                'X-MBX-APIKEY': this.apiKey,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            if (method !== 'GET') {
                body = this.urlencode(params);
            }
        } else {
            throw new this.AuthenticationError(this.id + ' userDataStream endpoint requires `apiKey` credential');
        }
    } else if ((api === 'private') || (api === 'sapi' && path !== 'system/status') ||
               (api === 'sapiV2') || (api === 'sapiV3') || (api === 'sapiV4') ||
               (api === 'dapiPrivate') || (api === 'dapiPrivateV2') ||
               (api === 'fapiPrivate') || (api === 'fapiPrivateV2') || (api === 'fapiPrivateV3') ||
               (api === 'papi') || (api === 'papiV2' && path !== 'ping') ||
               (api === 'eapiPrivate')) {
        this.checkRequiredCredentials();

        let query = undefined;
        const defaultRecvWindow = this.safeInteger(this.options, 'recvWindow');
        let extendedParams = this.extend({
            'timestamp': this.nonce(),
        }, params);

        if (defaultRecvWindow !== undefined) {
            extendedParams['recvWindow'] = defaultRecvWindow;
        }
        const recvWindow = this.safeInteger(params, 'recvWindow');
        if (recvWindow !== undefined) {
            extendedParams['recvWindow'] = recvWindow;
        }

        query = this.urlencode(extendedParams);

        // Generate signature - supports RSA, EdDSA, and HMAC
        let signature = undefined;
        if (this.secret.indexOf('PRIVATE KEY') > -1) {
            // RSA or EdDSA signature
            if (this.secret.length > 120) {
                // RSA signature
                signature = this.encodeURIComponent(this.rsa(query, this.secret, 'sha256'));
            } else {
                // EdDSA signature
                signature = this.encodeURIComponent(this.eddsa(this.encode(query), this.secret, 'ed25519'));
            }
        } else {
            // HMAC signature
            signature = this.hmac(this.encode(query), this.encode(this.secret), 'sha256');
        }

        query += '&signature=' + signature;
        headers = {
            'X-MBX-APIKEY': this.apiKey,
        };

        if ((method === 'GET') || (method === 'DELETE')) {
            url += '?' + query;
        } else {
            body = query;
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    } else {
        // Public endpoints
        if (Object.keys(params).length) {
            url += '?' + this.urlencode(params);
        }
    }

    return { 'url': url, 'method': method, 'body': body, 'headers': headers };
};

/**
 * @method
 * @name binance#parseTxId
 * @description Parse transaction ID, stripping 'Internal transfer ' prefix if present
 * @param {string|undefined} txid transaction ID from API
 * @returns {string|null} cleaned transaction ID
 */
export const parseTxId = function (this: any, txid: string | undefined): string | null {
    if (txid !== undefined && txid.indexOf('Internal transfer ') >= 0) {
        return txid.slice(18);
    }
    return txid ?? null;
};

/**
 * @method
 * @name binance#parseTag
 * @description Parse address tag, returning null for empty strings
 * @param {string|undefined} tag address tag from API
 * @returns {string|null} tag or null if empty
 */
export const parseTag = function (this: any, tag: string | undefined): string | null {
    return (tag !== undefined && tag.length > 0) ? tag : null;
};

/**
 * @method
 * @name binance#parseInternal
 * @description Parse internal transfer flag from transferType
 * @param {number|undefined} transferType transfer type from API
 * @returns {boolean|null} true if internal transfer, false if external, null if unknown
 */
export const parseInternal = function (this: any, transferType: number | undefined): boolean | null {
    return transferType !== undefined ? (transferType !== 0) : null;
};

/**
 * @method
 * @name binance#parseTransactionFee
 * @description Parse transaction fee into fee object
 * @param {number|undefined} feeCost fee cost from API
 * @param {string} currency currency code
 * @returns {object|null} fee object with currency and cost, or null if undefined
 */
export const parseTransactionFee = function (this: any, feeCost: number | undefined, currency: string): { currency: string, cost: number } | null {
    if (feeCost !== undefined) {
        return { currency: currency, cost: feeCost };
    }
    return null;
};

/**
 * @method
 * @name binance#parseTransactionTimestamp
 * @description Parse transaction timestamp with fallback to applyTime
 * @param {number|undefined} timestamp timestamp in milliseconds
 * @param {string|undefined} applyTime ISO8601 timestamp string
 * @returns {number|undefined} timestamp in milliseconds
 */
export const parseTransactionTimestamp = function (this: any, timestamp: number | undefined, applyTime: string | undefined): number | undefined {
    if (timestamp === undefined) {
        return this.parse8601(applyTime);
    }
    return timestamp;
};
