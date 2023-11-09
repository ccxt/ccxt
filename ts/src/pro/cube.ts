//  ---------------------------------------------------------------------------

import cubeRest from '../cube.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import Client from '../base/ws/Client.js';
import { md } from '../static_dependencies/cube-proto-lib/market_data.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
// import { md } from '@cubexch/client';
import { sleep } from '../base/functions/time.js';

//  ---------------------------------------------------------------------------

export default class cube extends cubeRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchPosition': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'trade': 'wss://api.cube.exchange/os',
                        // wss://api.cube.exchange/md/book/:marketid
                        'marketData': 'wss://api.cube.exchange/md/book/',
                    },
                },
                'test': {
                    'ws': {
                        'trade': 'wss://dev.cube.exchange/os',
                        // wss://dev.cube.exchange/md/book/:marketid
                        'marketData': 'wss://dev.cube.exchange/md/book/',
                    },
                },
            },
            'options': {
            },
            'streaming': {},
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    onConnected (client: Client, message = undefined) {
        // for user hooks
        // ---
        // send heartbeat every 29 seconds to keep ws alive
        const intervalMs = 29000;
        while (client.isConnected) {
            const { MdMessage, Heartbeat } = md;
            // define heartbeat prior to mdMessage instantiation to avoid python error
            // ruff returns Unexpected Token 'Heartbeat' when done inline
            const hb = new Heartbeat ({
                // random number between 1 and 100k, server will respond w it upon receipt
                'requestId': Math.floor ((Math.random () * 100000) + 1),
                // current unix timestamp
                'timestamp': Date.now () / 1000,
            });
            const heartbeatMessage = new MdMessage ({
                'heartbeat': hb,
            });
            client.send (heartbeatMessage.serializeBinary ());
            sleep (intervalMs);
        }
    }

    getCurrentUnixEpoch (): bigint {
        const now = Date.now ();
        const secondsSinceEpoch = Math.floor (now / 1000);
        return BigInt (secondsSinceEpoch);
    }

    /* eslint-disable no-bitwise */
    toLittleEndian64BitNumber (n: bigint): bigint {
        // use modulo to separate lower 32 bits
        const lower32Bits = n % BigInt (2 ** 32);
        // use division to separate upper 32 bits
        const upper32Bits = n / BigInt (2 ** 32);
        // place lower 32 bits in upper part of 64bit result
        // place upper 32 bits in lower part of 64 bit result
        const result = (lower32Bits << BigInt (32)) + upper32Bits;
        return result;
    }
    /* eslint-enable no-bitwise */

    async authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const accessKeyId = this.apiKey;
        const timestamp = this.toLittleEndian64BitNumber (this.getCurrentUnixEpoch ());
        let msg = 'cube.xyz';
        msg = msg + timestamp.toString;
        const messageHash = this.hmac (this.encode (msg), this.encode (this.secret), sha256);
        const client = this.client (url);
        const future = client.future (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const request = {
                accessKeyId,
                messageHash,
                timestamp,
            };
            this.watch (url, messageHash, request, messageHash, future);
        }
        return future;
    }

    handleErrorMessage (client: Client, message) {
        //
        //    {
        //        T: 'error',
        //        code: 400,
        //        msg: 'invalid syntax'
        //    }
        //
        const code = this.safeString (message, 'code');
        const msg = this.safeValue (message, 'msg', {});
        throw new ExchangeError (this.id + ' code: ' + code + ' message: ' + msg);
    }

    handleConnected (client: Client, message) {
        //
        //    {
        //        T: 'success',
        //        msg: 'connected'
        //    }
        //
        return message;
    }

    handleMarketDataMessage (client: Client, message) {
        for (let i = 0; i < message.length; i++) {
            const data = message[i];
            const T = this.safeString (data, 'T');
            const msg = this.safeValue (data, 'msg', {});
            if (T === 'subscription') {
                return this.handleSubscription (client, data);
            }
            if (T === 'success' && msg === 'connected') {
                return this.handleConnected (client, data);
            }
            if (T === 'success' && msg === 'authenticated') {
                return this.handleAuthenticate (client, data);
            }
            const methods = {
                'error': this.handleErrorMessage,
                // 'b': this.handleOHLCV,
                // 'q': this.handleTicker,
                // 't': this.handleTrades,
                // 'o': this.handleOrderBook,
            };
            const method = this.safeValue (methods, T);
            if (method !== undefined) {
                method.call (this, client, data);
            }
        }
    }

    handleTradeMessage (client: Client, message) {
        const stream = this.safeString (message, 'stream');
        const methods = {
            'authorization': this.handleAuthenticate,
            'listening': this.handleSubscription,
            // 'trade_updates': this.handleTradeUpdate,
        };
        const method = this.safeValue (methods, stream);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    handleMessage (client: Client, message) {
        if (Array.isArray (message)) {
            return this.handleMarketDataMessage (client, message);
        }
        this.handleTradeMessage (client, message);
    }

    handleAuthenticate (client: Client, message) {
        //
        // crypto
        //    {
        //        T: 'success',
        //        msg: 'connected'
        //    ]
        //
        // trading
        //    {
        //        "stream": "authorization",
        //        "data": {
        //            "status": "authorized",
        //            "action": "authenticate"
        //        }
        //    }
        // error
        //    {
        //        stream: 'authorization',
        //        data: {
        //            action: 'authenticate',
        //            message: 'access key verification failed',
        //            status: 'unauthorized'
        //        }
        //    }
        //
        const T = this.safeString (message, 'T');
        const data = this.safeValue (message, 'data', {});
        const status = this.safeString (data, 'status');
        if (T === 'success' || status === 'authorized') {
            const promise = client.futures['authenticated'];
            promise.resolve (message);
            return;
        }
        throw new AuthenticationError (this.id + ' failed to authenticate.');
    }

    handleSubscription (client: Client, message) {
        return message;
    }
}
