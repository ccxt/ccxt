// @NO_AUTO_TRANSPILE

// ----------------------------------------------------------------------------
// Jupiter: fetchConvertQuote -> createConvertTrade with internal signing
//
// When the walletAddress and privateKey credentials are configured, CCXT signs
// the transaction returned with the quote using the built-in ed25519 signer and
// Jupiter broadcasts it through its own /swap/v2/execute endpoint — no wallet
// app and no external dependencies required.
//
// Unlike Raydium, Jupiter has NO devnet — every call below runs on MAINNET with
// real funds. Keep test amounts tiny and use a dedicated low-balance wallet.
//
// The privateKey accepts either format:
//   - a base58-encoded secret key (the Phantom export format)
//   - the JSON byte array written by `solana-keygen new` — just paste the file
//     content, e.g. in PowerShell: $env:PRIVATE_KEY = Get-Content keypair.json -Raw
//
// Environment variables:
//   WALLET_ADDRESS   wallet public key (base58)
//   PRIVATE_KEY      secret key, see above
//   FROM_CODE        input currency code or mint (default: SOL)
//   TO_CODE          output currency code or mint (default: USDC)
//   AMOUNT           input amount in human units (default: 0.001)
//
// Advanced users who prefer to sign externally (e.g. with a hardware wallet) can
// still pass params.signedTransaction instead of configuring privateKey.
// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';

(async () => {
    const fromCode = process.env.FROM_CODE || 'SOL';
    const toCode = process.env.TO_CODE || 'USDC';
    const amount = Number (process.env.AMOUNT || '0.001');
    const exchange = new ccxt.jupiter ({
        'walletAddress': process.env.WALLET_ADDRESS,
        'privateKey': process.env.PRIVATE_KEY,
    });
    console.log ('wallet:', exchange.walletAddress, '(MAINNET — real funds!)');
    // the taker defaults to the walletAddress credential, and the quote carries the unsigned transaction
    const quote = await exchange.fetchConvertQuote (fromCode, toCode, amount);
    console.log ('quote:', quote['fromAmount'], fromCode, '->', quote['toAmount'], toCode);
    // sign and submit within ~30s — the transaction embeds a recent blockhash
    const conversion = await exchange.createConvertTrade (quote['info']['requestId'], fromCode, toCode, amount, {
        'transaction': quote['info']['transaction'],
    });
    console.log ('executed, signature:', conversion['id']);
    console.log (conversion);
}) ();
