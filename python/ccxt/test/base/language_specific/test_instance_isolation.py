import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled): the per-class describe() cache
# must keep mutable state per instance and only share the read-only tables
# ----------------------------------------------------------------------------

import ccxt  # noqa: F402
import ccxt.async_support as ccxt_async  # noqa: F402


def test_instance_isolation():
    for module in (ccxt, ccxt_async):
        for exchange_id in ('binance', 'okx', 'kraken'):
            cls = getattr(module, exchange_id)
            e1 = cls()
            e2 = cls({'options': {'onlyE2': True}})
            e1.options['x'] = 1
            e1.urls['api']['x'] = 1
            e1.fees['trading']['x'] = 1
            e1.headers['x'] = 1
            e1.limits['x'] = 1
            assert 'x' not in e2.options and e2.options['onlyE2'] is True and 'onlyE2' not in e1.options
            assert 'x' not in e2.urls['api'] and 'x' not in e2.fees['trading']
            assert 'x' not in e2.headers and 'x' not in e2.limits
            assert 'x' not in cls().options
            assert e1.api is e2.api and e1.has is e2.has  # shared read-only tables
    # a config override of a shared key gets a private merged copy
    custom = ccxt.binance({'exceptions': {'exact': {'zz': ccxt.BadRequest}}})
    assert custom.exceptions['exact']['zz'] is ccxt.BadRequest
    assert 'zz' not in ccxt.binance().exceptions['exact']
    # sync session is lazy, but always available on access
    e = ccxt.binance()
    assert e._session is None
    assert e.session is e.session and e.session is not None
    e.close()
    assert ccxt.binance({'session': 'given'}).session == 'given'


if __name__ == '__main__':
    test_instance_isolation()
    print('instance isolation tests passed')
