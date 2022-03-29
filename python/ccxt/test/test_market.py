import numbers  # noqa: E402


def test_market(exchange, market, method):
    format = {
        'id': 'btcusd',  # string literal for referencing within an exchange
        'symbol': 'BTC/USD',  # uppercase string literal of a pair of currencies
        'base': 'BTC',  # unified uppercase string, base currency, 3 or more letters
        'quote': 'USD',  # unified uppercase string, quote currency, 3 or more letters
        'taker': 0.0011,  # taker fee, for example, 0.0011 = 0.11%
        'maker': 0.0009,  # maker fee, for example, 0.0009 = 0.09%
        'baseId': 'btc',  # exchange-specific base currency id
        'quoteId': 'usd',  # exchange-specific quote currency id
        'active': True,  # boolean, market status
        'type': 'spot',
        'linear': None,
        'inverse': None,
        'spot': True,
        'swap': False,
        'future': False,
        'option': False,
        'margin': False,
        'contract': False,
        'contractSize': 0.001,
        'expiry': 1656057600000,
        'expiryDatetime': '2022-06-24T08:00:00.000Z',
        'optionType': 'put',
        'strike': 56000,
        'settle': None,
        'settleId': None,
        'precision': {
            'price': 8,  # integer or fraction
            'amount': 8,  # integer or fraction
            'cost': 8,  # integer or fraction
        },
        # value limits when placing orders on self market
        'limits': {
            'amount': {
                'min': 0.01,  # order amount should be > min
                'max': 1000,  # order amount should be < max
            },
            'price': {
                'min': 0.01,  # order price should be > min
                'max': 1000,  # order price should be < max
            },
            # order cost = price * amount
            'cost': {
                'min': 0.01,  # order cost should be > min
                'max': 1000,  # order cost should be < max
            },
        },
        'info': {},  # the original unparsed market info from the exchange
    }
    keys = list(format.keys())
    for i in range(0, len(keys)):
        key = keys[i]
        keyPresent = (key in market)
        assert keyPresent, key + ' missing ' + exchange.json(market)

    keys = [
        'id',
        'symbol',
        'baseId',
        'quoteId',
        'base',
        'quote',
        'precision',
        'limits',
    ]
    for i in range(0, len(keys)):
        key = keys[i]
        assert market[key] is not None, key + ' None ' + exchange.json(market)

    assert(market['taker'] is None) or (isinstance(market['taker'], numbers.Real))
    assert(market['maker'] is None) or (isinstance(market['maker'], numbers.Real))
    if market['contract']:
        assert market['linear'] != market['inverse']
    else:
        assert(market['linear'] is None) and (market['inverse'] is None)

    if market['option']:
        assert market['strike'] is not None
        assert market['optionType'] is not None

    validTypes = {
        'spot': True,
        'margin': True,
        'swap': True,
        'future': True,
        'option': True,
    }
    type = market['type']
    #
    # binance has type = 'delivery'
    # https://github.com/ccxt/ccxt/issues/11121
    #
    # assert type in validTypes
    #
    types = list(validTypes.keys())
    for i in range(0, len(types)):
        entry = types[i]
        if entry in market:
            value = market[entry]
            assert(value is None) or value or not value

    #
    # todo fix binance
    #
    # if market['future']:
    #     assert(market['swap'] == False) and (market['option'] == False)
    # elif market['swap']:
    #     assert(market['future'] == False) and (market['option'] == False)
    # elif market['option']:
    #     assert(market['future'] == False) and (market['swap'] == False)
    # }
    # if market['linear']:
    #     assert market['inverse'] == False
    # elif market['inverse']:
    #     assert market['linear'] == False
    # }
    # if market['future']:
    #     assert market['expiry'] is not None
    #     assert market['expiryDatetime'] is not None
    # }
