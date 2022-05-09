import numbers  # noqa: E402


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
        assert key in tier

    assert isinstance(tier['tier'], numbers.Real)
    assert isinstance(tier['minNotional'], numbers.Real)
    assert isinstance(tier['maxNotional'], numbers.Real)
    assert isinstance(tier['maintenanceMarginRate'], numbers.Real)
    assert isinstance(tier['maxLeverage'], numbers.Real)
    assert tier['tier'] >= 0
    assert tier['minNotional'] >= 0
    assert tier['notionalCap'] >= 0
    assert tier['maintenanceMarginRate'] <= 1
    assert tier['maxLeverage'] >= 1
    print(exchange.id, method, tier['tier'], tier['minNotional'], tier['maxNotional'], tier['maintenanceMarginRate'], tier['maxLeverage'])
    return tier
