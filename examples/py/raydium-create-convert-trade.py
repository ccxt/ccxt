# -*- coding: utf-8 -*-

# ----------------------------------------------------------------------------
# Raydium: fetch_convert_quote -> create_convert_trade with internal signing
#
# When the walletAddress and privateKey credentials are configured, CCXT builds
# the swap transaction, signs it locally with the built-in ed25519 signer, and
# broadcasts it through a Solana JSON-RPC node — no wallet app and no external
# dependencies required.
#
# The privateKey accepts either format:
#   - a base58-encoded secret key (the Phantom export format)
#   - the JSON byte array written by `solana-keygen new` — just paste the file
#     content, e.g.: export PRIVATE_KEY=$(cat keypair.json)
#
# Environment variables:
#   WALLET_ADDRESS   wallet public key (base58)
#   PRIVATE_KEY      secret key, see above
#   OUTPUT_MINT      output token mint (REQUIRED — e.g. a devnet LaunchLab mint
#                    from exchange.fetch_recent_mints(), or a mainnet token mint)
#   AMOUNT           input amount of SOL in human units (default: 0.001)
#   RAYDIUM_MAINNET  set to "true" to trade on mainnet with REAL FUNDS (devnet otherwise)
#
# Advanced users who prefer to sign externally (e.g. with a hardware wallet) can
# still pass params['signedTransaction'] instead of configuring privateKey.
#
# SAFETY: on mainnet this spends real funds. Use a dedicated low-balance wallet —
# anyone who can read the private key controls the funds.
# ----------------------------------------------------------------------------

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def main():
    wrapped_sol = 'So11111111111111111111111111111111111111112'
    output_mint = os.environ.get('OUTPUT_MINT')
    amount = float(os.environ.get('AMOUNT', '0.001'))
    if not output_mint:
        print('set OUTPUT_MINT to a token mint address (try exchange.fetch_recent_mints() for devnet LaunchLab tokens)')
        return
    exchange = ccxt.raydium({
        'walletAddress': os.environ.get('WALLET_ADDRESS'),
        'privateKey': os.environ.get('PRIVATE_KEY'),
    })
    mainnet = os.environ.get('RAYDIUM_MAINNET') == 'true'
    if not mainnet:
        exchange.set_sandbox_mode(True)  # devnet urls + devnet solana rpc
    print('wallet:', exchange.walletAddress, '(MAINNET — real funds!)' if mainnet else '(devnet)')
    quote = exchange.fetch_convert_quote(wrapped_sol, output_mint, amount)
    print('quote:', quote['fromAmount'], '->', quote['toAmount'])
    conversion = exchange.create_convert_trade(quote['info']['id'], wrapped_sol, output_mint, amount, {
        'swapResponse': quote['info'],
    })
    print('broadcast signature:', conversion['id'])
    print(conversion)


if __name__ == '__main__':
    main()
