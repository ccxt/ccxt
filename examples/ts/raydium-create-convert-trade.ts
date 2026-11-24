// @NO_AUTO_TRANSPILE

// ----------------------------------------------------------------------------
// Raydium: fetchConvertQuote -> createConvertTrade with internal signing
//
// When the walletAddress and privateKey credentials are configured, CCXT builds
// the swap transaction, signs it locally with the built-in ed25519 signer, and
// broadcasts it through a Solana JSON-RPC node — no wallet app and no external
// dependencies required.
//
// The privateKey accepts either format:
//   - a base58-encoded secret key (the Phantom export format)
//   - the JSON byte array written by `solana-keygen new` — just paste the file
//     content, e.g. in PowerShell: $env:PRIVATE_KEY = Get-Content keypair.json -Raw
//
// Environment variables:
//   WALLET_ADDRESS   wallet public key (base58)
//   PRIVATE_KEY      secret key, see above
//   OUTPUT_MINT      output token mint (REQUIRED — e.g. a devnet LaunchLab mint
//                    from exchange.fetchRecentMints (), or a mainnet token mint)
//   AMOUNT           input amount of SOL in human units (default: 0.001)
//   RAYDIUM_MAINNET  set to "true" to trade on mainnet with REAL FUNDS (devnet otherwise)
//
// Advanced users who prefer to sign externally (e.g. with a hardware wallet) can
// still pass params.signedTransaction instead of configuring privateKey.
//
// SAFETY: on mainnet this spends real funds. Use a dedicated low-balance wallet —
// anyone who can read the private key controls the funds.
// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';

(async () => {
    const wrappedSol = 'So11111111111111111111111111111111111111112';
    const outputMint = process.env.OUTPUT_MINT;
    const amount = Number (process.env.AMOUNT || '0.001');
    if (!outputMint) {
        console.log ('set OUTPUT_MINT to a token mint address (try exchange.fetchRecentMints () for devnet LaunchLab tokens)');
        return;
    }
    const exchange = new ccxt.raydium ({
        'walletAddress': process.env.WALLET_ADDRESS,
        'privateKey': process.env.PRIVATE_KEY,
    });
    const mainnet = process.env.RAYDIUM_MAINNET === 'true';
    if (!mainnet) {
        exchange.setSandboxMode (true); // devnet urls + devnet solana rpc
    }
    console.log ('wallet:', exchange.walletAddress, mainnet ? '(MAINNET — real funds!)' : '(devnet)');
    const quote = await exchange.fetchConvertQuote (wrappedSol, outputMint, amount);
    console.log ('quote:', quote['fromAmount'], '->', quote['toAmount']);
    const conversion = await exchange.createConvertTrade (quote['info']['id'], wrappedSol, outputMint, amount, {
        'swapResponse': quote['info'],
    });
    console.log ('broadcast signature:', conversion['id']);
    console.log (conversion);
}) ();
