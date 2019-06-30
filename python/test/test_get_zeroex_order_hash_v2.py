import ccxt  # noqa: E402

market = {
    'id': 'foobar',
    'symbol': 'FOO/BAR',
    'base': 'FOO',
    'quote': 'BAR',
    'taker': '',
    'maker': '',
}

exchange = ccxt.Exchange({
    'id': 'mock',
    'markets': {'FOO/BAR': market},
    'requiresWeb3': True
})

# based on https://github.com/0xProject/0x-monorepo/blob/development/python-packages/order_utils/test/test_generate_order_hash_hex.py
example_order = {
    "makerAddress": "0x0000000000000000000000000000000000000000",
    "takerAddress": "0x0000000000000000000000000000000000000000",
    "senderAddress": "0x0000000000000000000000000000000000000000",
    "feeRecipientAddress": "0x0000000000000000000000000000000000000000",
    "makerAssetData": "0x0000000000000000000000000000000000000000",
    "takerAssetData": "0x0000000000000000000000000000000000000000",
    "salt": "0",
    "makerFee": "0",
    "takerFee": "0",
    "makerAssetAmount": "0",
    "takerAssetAmount": "0",
    "expirationTimeSeconds": "0",
    "exchangeAddress": "0x0000000000000000000000000000000000000000",
}
expected_order_hash = '0xfaa49b35faeb9197e9c3ba7a52075e6dad19739549f153b77dfcf59408a4b422'

assert(exchange.getZeroExOrderHashV2(example_order) == expected_order_hash)
