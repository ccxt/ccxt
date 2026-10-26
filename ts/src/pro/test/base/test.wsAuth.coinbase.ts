// NO_AUTO_TRANSPILE
import assert from 'assert';
import coinbase from '../../coinbase.js';

// native ts test, intentionally not transpiled - pins coinbase createWSAuth ()
// for Ed25519 (v2 CDP) keys, legacy HMAC keys and the cached jwt refresh window.
// offline: no sockets, no requests, synthetic keys only

// synthetic 64-byte Ed25519 secret (bytes 0..63), 88 chars of base64
const ED25519_SECRET = 'AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+Pw==';
const ORG_API_KEY = 'organizations/00000000-0000-0000-0000-000000000000/apiKeys/00000000-0000-0000-0000-000000000001';
const UUID_API_KEY = '00000000-0000-0000-0000-000000000002';
const HMAC_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function jwtHeader (exchange: coinbase, token: string) {
    const encoded = token.split ('.')[0];
    let b64 = encoded.replace (/-/g, '+').replace (/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 = b64 + '=';
    }
    return exchange.parseJson (exchange.base64ToString (b64));
}

function assertEddsaJwt (apiKey: string, label: string) {
    const exchange = new coinbase ({ 'apiKey': apiKey, 'secret': ED25519_SECRET });
    const subscribe = exchange.createWSAuth ('user', [ 'BTC-USD' ]);
    const token = subscribe['jwt'];
    assert (typeof token === 'string' && token.split ('.').length === 3, label + ': expected a jwt');
    assert (!('signature' in subscribe), label + ': must not send an hmac signature');
    assert (!('api_key' in subscribe), label + ': must not send api_key');
    const header = jwtHeader (exchange, token);
    assert (header['alg'] === 'EdDSA', label + ': jwt alg must be EdDSA (got ' + header['alg'] + ')');
}

function testLegacyHmac () {
    const exchange = new coinbase ({ 'apiKey': UUID_API_KEY, 'secret': HMAC_SECRET });
    const subscribe = exchange.createWSAuth ('user', [ 'BTC-USD' ]);
    assert (!('jwt' in subscribe), 'legacy hmac key must not send a jwt');
    assert (subscribe['api_key'] === UUID_API_KEY, 'legacy hmac key must send api_key');
    assert (typeof subscribe['signature'] === 'string' && subscribe['signature'].length === 64, 'legacy hmac key must send a hex signature');
    assert (typeof subscribe['timestamp'] === 'string', 'legacy hmac key must send a timestamp');
}

function testTokenCache () {
    const exchange = new coinbase ({ 'apiKey': ORG_API_KEY, 'secret': ED25519_SECRET });
    const now = exchange.seconds ();
    // 100 s old: past the refresh cutoff, a new token must be minted
    exchange.options['wsToken'] = 'cached-token';
    exchange.options['wsTokenTimestamp'] = now - 100;
    const fresh = exchange.createWSAuth ('user', [ 'BTC-USD' ])['jwt'];
    assert (fresh !== 'cached-token', 'a 100 s old token must be regenerated');
    assert (exchange.options['wsTokenTimestamp'] >= now, 'regeneration must stamp wsTokenTimestamp');
    // 60 s old: still inside the refresh window, the cached token is reused
    exchange.options['wsToken'] = 'cached-token';
    exchange.options['wsTokenTimestamp'] = now - 60;
    const reused = exchange.createWSAuth ('user', [ 'BTC-USD' ])['jwt'];
    assert (reused === 'cached-token', 'a 60 s old token must be reused');
}

function testCoinbaseWsAuth () {
    assertEddsaJwt (ORG_API_KEY, 'organizations apiKey + ed25519 secret');
    assertEddsaJwt (UUID_API_KEY, 'uuid apiKey + ed25519 secret');
    testLegacyHmac ();
    testTokenCache ();
}

export default testCoinbaseWsAuth;
