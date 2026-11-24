import assert from 'assert';
import ccxt from '../../../ccxt.js';

function testSignSolanaTransaction () {

    // the vectors below are deterministic: ed25519 signing is deterministic and the seed is fixed
    // seed = 32 bytes of 0x1a; secret key = seed + derived public key (the solana-keygen / Phantom export layout)
    const secretBase58 = 'XGYVy6Jre3qrc6Gv8QzEayQK3kyA4bZ3T1m33bJZfZiLXipBzZztvXEYEi7vn9G1RPvt2AAh1VSnZabJDD4VZur';
    const seedBase58 = '2ktgiq7GNkitdMWCLmUtZm4qM8UEWerKXcL4WtAaRfPP';
    const secretJsonArray = '[26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,100,195,8,21,255,38,213,196,175,248,225,18,116,163,142,214,221,5,83,4,157,164,193,3,114,169,87,91,122,119,105,9]';

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'privateKey': secretBase58,
    });

    // message signing (solana wallet-adapter style, base58 signature)
    const message = 'Sign in to raydium.io: 1700000000';
    const messageSignature = exchange.signSolanaMessage (message);
    assert (messageSignature === '3ZUYARsnUggC4Pb9Zgf8V5zkpKsPt8dEqh85oap9ET6ZKf2Y7RQEjxyHedy3XjGjA5aiWUgzAk6mZsYC4126vFFm');

    // a bare 32-byte seed and the solana-keygen JSON byte array must sign identically
    const exchangeSeedOnly = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'privateKey': seedBase58,
    });
    assert (exchangeSeedOnly.signSolanaMessage (message) === messageSignature);
    const exchangeJsonArray = new ccxt.Exchange ({
        'id': 'sampleexchange',
        'privateKey': secretJsonArray,
    });
    assert (exchangeJsonArray.signSolanaMessage (message) === messageSignature);

    // single-signature transaction: [0x01][64 zero bytes][message "solana-test-message-bytes"]
    const unsignedSingle = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABzb2xhbmEtdGVzdC1tZXNzYWdlLWJ5dGVz';
    const signedSingle = exchange.signSolanaTransaction (unsignedSingle);
    assert (signedSingle === 'AeQOxoQ7qKKNQMhzADeRKAseTYF6rrnGMKTq7GNawrSrD+2Sub6hegwDGW5Y4Qt+S1uVS4LpZplC3kfJtgjlMgBzb2xhbmEtdGVzdC1tZXNzYWdlLWJ5dGVz');

    // two-signature transaction: the fee payer slot is filled and the second slot (0xaa bytes) is preserved
    const unsignedDouble = 'AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqc29sYW5hLXRlc3QtbWVzc2FnZS1ieXRlcw==';
    const signedDouble = exchange.signSolanaTransaction (unsignedDouble);
    assert (signedDouble === 'AuQOxoQ7qKKNQMhzADeRKAseTYF6rrnGMKTq7GNawrSrD+2Sub6hegwDGW5Y4Qt+S1uVS4LpZplC3kfJtgjlMgCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqc29sYW5hLXRlc3QtbWVzc2FnZS1ieXRlcw==');
}

export default testSignSolanaTransaction;
