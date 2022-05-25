# -*- coding: utf-8 -*-


import numbers  # noqa E402


def test_leverage_tier(exchange, method, tier):
    format = {
        'tier': 1,
        'minNotional': 0,
        'maxNotional': 5000,
        'maintenanceMarginRate': 0.01,
        'maxLeverage': 25,
        'info': {},
    }
    keys = list(format.keys())
    for i in range(0, len(keys)):
        key = keys[i]
        assert key in tier, exchange.id + ' ' + method + ' ' + key + ' missing from response'

    if tier['tier'] is not None:
        assert isinstance(tier['tier'], numbers.Real)
        assert tier['tier'] >= 0

    if tier['minNotional'] is not None:
        assert isinstance(tier['minNotional'], numbers.Real)
        assert tier['minNotional'] >= 0

    if tier['maxNotional'] is not None:
        assert isinstance(tier['maxNotional'], numbers.Real)
        assert tier['maxNotional'] >= 0

    if tier['maxLeverage'] is not None:
        assert isinstance(tier['maxLeverage'], numbers.Real)
        assert tier['maxLeverage'] >= 1

    if tier['maintenanceMarginRate'] is not None:
        assert isinstance(tier['maintenanceMarginRate'], numbers.Real)
        assert tier['maintenanceMarginRate'] <= 1

    print(exchange.id, method, tier['tier'], tier['minNotional'], tier['maxNotional'], tier['maintenanceMarginRate'], tier['maxLeverage'])
    return tier
