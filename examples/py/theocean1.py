# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

walletAddress = os.environ['WALLET_ADDRESS']
privateKey = os.environ['PRIVATE_KEY']
apiKey = os.environ['API_KEY']
secret = os.environ['SECRET']
ocean = ccxt.theocean1({
    'walletAddress': walletAddress,
    'privateKey': privateKey,
    'apiKey': apiKey,
    'secret': secret
})

# get balance
balance = ocean.fetch_balance_by_code('REP')
print('REP balance: ', balance)

# get order book
order_book = ocean.fetch_order_book('REP/ZRX')
print('REP/ZRX orderbook: ', order_book)

# placing order
response = ocean.fetch_order_to_sign('REP/ZRX', 'sell', '0.5', '30')
unsigned_order = response['unsignedZeroExOrder']
signed_order = ocean.signZeroExOrderV2(unsigned_order, privateKey)
result = ocean.post_signed_order(signed_order, response)
print('result of placing order: ', result)
