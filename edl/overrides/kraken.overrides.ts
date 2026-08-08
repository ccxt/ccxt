// kraken.overrides.ts
// Hand-written implementations for complex methods that cannot be easily generated from EDL YAML
// These methods require special logic for Kraken's unique API requirements

import type { Balances, Dict } from '../base/types.js';

/**
 * @method
 * @name kraken#fetchBalance
 * @description query for balance and get the amount of funds available for trading or funds locked in orders
 * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance
 * @param {object} [params] extra parameters specific to the exchange API endpoint
 * @returns {object} a balance structure
 */
export const fetchBalance = async function (this: any, params = {}): Promise<Balances> {
    await this.loadMarkets();
    const response = await this.privatePostBalanceEx(params);
    //
    //     {
    //         "error": [],
    //         "result": {
    //             "ZUSD": {
    //                 "balance": 25435.21,
    //                 "hold_trade": 8249.76
    //             },
    //             "XXBT": {
    //                 "balance": 1.2435,
    //                 "hold_trade": 0.8423
    //             }
    //         }
    //     }
    //
    return this.parseBalance(response);
};

/**
 * @ignore
 * @method
 * @description Helper method to parse Kraken balance response with margin account support
 * @param {object} response - The raw API response
 * @returns {object} Parsed balance structure
 */
export const parseBalance = function (this: any, response: any): Balances {
    const balances = this.safeValue(response, 'result', {});
    const result: Dict = {
        'info': response,
        'timestamp': undefined,
        'datetime': undefined,
    };
    const currencyIds = Object.keys(balances);
    for (let i = 0; i < currencyIds.length; i++) {
        const currencyId = currencyIds[i];
        const code = this.safeCurrencyCode(currencyId);
        const balance = this.safeValue(balances, currencyId, {});
        const account = this.account();
        // Kraken returns 'hold_trade' for funds locked in orders (used)
        // and 'balance' for total balance
        account['used'] = this.safeString(balance, 'hold_trade');
        account['total'] = this.safeString(balance, 'balance');
        result[code] = account;
    }
    return this.safeBalance(result);
};

/**
 * @ignore
 * @method
 * @description Sign API request with Kraken's chained SHA256+SHA512 signature algorithm
 * @param {string} path - API endpoint path
 * @param {string} api - 'public' or 'private'
 * @param {string} method - HTTP method
 * @param {object} params - Request parameters
 * @param {object} headers - HTTP headers
 * @param {string} body - Request body
 * @returns {object} Object containing url, method, body, and headers
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
    let url = '/' + this.version + '/' + api + '/' + path;

    if (api === 'public') {
        if (Object.keys(params).length) {
            // urlencodeNested handles nested parameters
            url += '?' + this.urlencodeNested(params);
        }
    } else if (api === 'private') {
        const price = this.safeString(params, 'price');
        let isTriggerPercent = false;
        if (price !== undefined) {
            isTriggerPercent = (price.endsWith('%')) ? true : false;
        }
        const isCancelOrderBatch = (path === 'CancelOrderBatch');
        const isBatchOrder = (path === 'AddOrderBatch');

        this.checkRequiredCredentials();
        const nonce = this.nonce().toString();

        // Some endpoints require JSON body instead of URL-encoded
        if (isCancelOrderBatch || isTriggerPercent || isBatchOrder) {
            body = this.json(this.extend({ 'nonce': nonce }, params));
        } else {
            body = this.urlencodeNested(this.extend({ 'nonce': nonce }, params));
        }

        // Kraken uses a chained signature algorithm:
        // 1. Concatenate nonce + body
        const auth = this.encode(nonce + body);
        // 2. SHA256 hash of the auth string
        const hash = this.hash(auth, 'sha256', 'binary');
        // 3. Concatenate URL path (binary) with the hash
        const binary = this.encode(url);
        const binhash = this.binaryConcat(binary, hash);
        // 4. Decode the secret from base64
        const secret = this.base64ToBinary(this.secret);
        // 5. HMAC-SHA512 of the concatenated binary using the secret
        const signature = this.hmac(binhash, secret, 'sha512', 'base64');

        headers = {
            'API-Key': this.apiKey,
            'API-Sign': signature,
        };

        // Set appropriate content type
        if (isCancelOrderBatch || isTriggerPercent || isBatchOrder) {
            headers['Content-Type'] = 'application/json';
        } else {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    } else {
        url = '/' + path;
    }

    url = this.urls['api'][api] + url;
    return { 'url': url, 'method': method, 'body': body, 'headers': headers };
};

/**
 * @ignore
 * @method
 * @description Generate nonce for Kraken API requests
 * @returns {number} Current timestamp in milliseconds adjusted for time difference
 */
export const nonce = function (this: any): number {
    return this.milliseconds() - (this.options['timeDifference'] || 0);
};
