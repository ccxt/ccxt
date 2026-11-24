# -*- coding: utf-8 -*-

# ----------------------------------------------------------------------------
# Jupiter: fetch_convert_quote -> create_convert_trade with internal signing
#
# When the walletAddress and privateKey credentials are configured, CCXT signs
# the transaction returned with the quote using the built-in ed25519 signer and
# Jupiter broadcasts it through its own /swap/v2/execute endpoint — no wallet
# app and no external dependencies required.
#
# Unlike Raydium, Jupiter has NO devnet — every call below runs on MAINNET with
# real funds. Keep test amounts tiny and use a dedicated low-balance wallet.
#
# The privateKey accepts either format:
#   - a base58-encoded secret key (the Phantom export format)
#   - the JSON byte array written by `solana-keygen new` — just paste the file
#     content, e.g.: export PRIVATE_KEY=$(cat keypair.json)
#
# Environment variables:
#   WALLET_ADDRESS   wallet public key (base58)
#   PRIVATE_KEY      secret key, see above
#   FROM_CODE        input currency code or mint (default: SOL)
#   TO_CODE          output currency code or mint (default: USDC)
#   AMOUNT           input amount in human units (default: 0.001)
#
# Advanced users who prefer to sign externally (e.g. with a hardware wallet) can
# still pass params['signedTransaction'] instead of configuring privateKey.
# ----------------------------------------------------------------------------

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402


def main():
    from_code = os.environ.get('FROM_CODE', 'SOL')
    to_code = os.environ.get('TO_CODE', 'USDC')
    amount = float(os.environ.get('AMOUNT', '0.001'))
    exchange = ccxt.jupiter({
        'walletAddress': os.environ.get('WALLET_ADDRESS'),
        'privateKey': os.environ.get('PRIVATE_KEY'),
    })
    print('wallet:', exchange.walletAddress, '(MAINNET — real funds!)')
    # the taker defaults to the walletAddress credential, and the quote carries the unsigned transaction
    quote = exchange.fetch_convert_quote(from_code, to_code, amount)
    print('quote:', quote['fromAmount'], from_code, '->', quote['toAmount'], to_code)
    # sign and submit within ~30s — the transaction embeds a recent blockhash
    conversion = exchange.create_convert_trade(quote['info']['requestId'], from_code, to_code, amount, {
        'transaction': quote['info']['transaction'],
    })
    print('executed, signature:', conversion['id'])
    print(conversion)


if __name__ == '__main__':
    main()
