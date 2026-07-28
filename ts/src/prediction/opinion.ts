import Exchange from '../abstract/prediction/opinion.js';
import { ecdsa } from '../base/functions/crypto.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 as keccak } from '@noble/hashes/sha3.js';
import { AuthenticationError, ArgumentsRequired } from '../base/errors.js';
import type { Dict } from '../base/types.js';

// ---------------------------------------------------------------------------

/**
 * @class opinion
 * @augments Exchange
 */
export default class opinion extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'opinion',
            'name': 'Opinion',
            'countries': [ 'HK' ],
            'rateLimit': 67, // 15 requests per second per API key
            'certified': false,
            'pro': false,
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'prediction': true,
            },
            'timeframes': {
                '1m': '1m',
                '1h': '1h',
                '1d': '1d',
                '1w': '1w',
            },
            'urls': {
                'logo': '', // todo
                'api': {
                    'opinion': 'https://openapi.opinion.trade/openapi',
                },
                'www': 'https://opinion.trade',
                'doc': [ 'https://docs.opinion.trade' ],
            },
            'api': {
                'opinion': {
                    'public': {
                        'get': {
                            'market': 1,
                            'market/{marketId}': 1,
                            'market/categorical/{marketId}': 1,
                            'market/slug/{slug}': 1,
                            'label': 1,
                            'token/latest-price': 1,
                            'token/orderbook': 1,
                            'token/price-history': 1,
                            'quoteToken': 1,
                        },
                    },
                    'private': {
                        'get': {
                            'order': 1,
                            'order/{orderId}': 1,
                            'positions/user/{walletAddress}': 1,
                            'trade/user/{walletAddress}': 1,
                            'auth/api-key': 1,
                        },
                        'post': {
                            'auth/api-key': 1,
                        },
                        'delete': {
                            'auth/api-key': 1,
                        },
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,        // apikey header, required on every Open API call
                'secret': false,
                'walletAddress': true, // EIP-712 signer for auth/api-key mgmt and order signing
                'privateKey': true,
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.02, // rebate: 50% of the taker fee, distributed daily - see calculateFee()
                    'taker': 0.04,  // base rate coefficient only - real fee is price-dependent, see calculateFee()
                },
            },
            'exceptions': {
                'exact': {
                    '11001': AuthenticationError, // "This API Key has no related Opinion Login Wallet yet"
                    '11002': AuthenticationError, // "Invalid API key"
                },
                'broad': {},
            },
        });
    }

    hashMessage (message: any): string {
        return '0x' + this.hash (message, keccak, 'hex');
    }

    signHash (hash: string, privateKey: string): Dict {
        const signature = ecdsa (hash.slice (-64), privateKey.slice (-64), secp256k1, undefined);
        const r = signature['r'].padStart (64, '0');
        const s = signature['s'].padStart (64, '0');
        return {
            'r': '0x' + r,
            's': '0x' + s,
            'v': this.sum (27, signature['v']),
        };
    }

    signMessage (message: any, privateKey: string): Dict {
        return this.signHash (this.hashMessage (message), privateKey.slice (-64));
    }

    signApiKeyAuth (walletAddress: string, action: string, timestamp: string): string {
        const domain: Dict = {
            'name': 'Opinion OpenAPI',
            'version': '1',
            'chainId': 56,
        };
        const messageTypes: Dict = {
            'OpinionApiKeyAuth': [
                { 'name': 'walletAddress', 'type': 'address' },
                { 'name': 'action', 'type': 'string' },
                { 'name': 'timestamp', 'type': 'string' },
            ],
        };
        const messageData: Dict = {
            'walletAddress': walletAddress,
            'action': action,
            'timestamp': timestamp,
        };
        const encoded = this.ethEncodeStructuredData (domain, messageTypes, messageData);
        const sig = this.signMessage (encoded, this.privateKey);
        return '0x' + this.remove0xPrefix (sig['r']) + this.remove0xPrefix (sig['s']) + this.intToBase16 (sig['v']);
    }

    /**
     * @ignore
     * @method
     * @name opinion#createApiKey
     * @description self-service creation of an Open API key linked to this.walletAddress via
     * an EIP-712-signed request - there is no "generate key" button in the Opinion GUI, this is
     * the only documented way to obtain a wallet-linked key
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.apiKey holds the issued key
     */
    async createApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivatePostAuthApiKey (params);
    }

    /**
     * @ignore
     * @method
     * @name opinion#fetchApiKey
     * @description fetches the currently active Open API key for this.walletAddress
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.apiKey holds the active key
     */
    async fetchApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivateGetAuthApiKey (params);
    }

    /**
     * @ignore
     * @method
     * @name opinion#deleteApiKey
     * @description revokes the Open API key for this.walletAddress
     * @param {object} [params] extra parameters
     * @returns {object} raw response, result.deleted confirms revocation
     */
    async deleteApiKey (params = {}): Promise<Dict> {
        return await this.opinionPrivateDeleteAuthApiKey (params);
    }

    /**
     * @ignore
     * @method
     * @name opinion#sign
     * @description builds the request url and attaches the apikey/EIP-712 authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} api the api group and access level
     * @param {string} method the http method
     * @param {object} params the request parameters
     * @param {object} [headers] request headers
     * @param {string} [body] the request body
     * @returns {object} a dict with url, method, body and headers
     */
    sign (path: string, api: any = 'opinion', method = 'GET', params = {}, headers: any = undefined, body: any = undefined) {
        const [ id, access ] = Array.isArray (api) ? api : [ 'opinion', api ];
        let url = this.urls['api'][id] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        const existingHeaders = (headers !== undefined) ? headers : {};
        headers = this.extend ({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }, existingHeaders);
        if (access === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            return { 'url': url, 'method': method, 'body': body, 'headers': headers };
        }
        if (path === 'auth/api-key') {
            // wallet-signature scheme: no apiKey involved, the signature itself is the credential
            if ((this.walletAddress === undefined) || (this.privateKey === undefined)) {
                throw new ArgumentsRequired (this.id + ' ' + path + ' requires a walletAddress and privateKey');
            }
            const actionByMethod: Dict = { 'POST': 'create', 'GET': 'get', 'DELETE': 'delete' };
            const action = this.safeString (actionByMethod, method, 'get');
            const timestamp = this.numberToString (this.seconds ());
            headers['OPINION_ADDRESS'] = this.walletAddress;
            headers['OPINION_SIGNATURE'] = this.signApiKeyAuth (this.walletAddress, action, timestamp);
            headers['OPINION_TIMESTAMP'] = timestamp;
        } else {
            headers['apikey'] = this.apiKey;
        }
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            body = this.json (query);
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
}
