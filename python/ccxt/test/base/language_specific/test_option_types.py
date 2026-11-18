import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled): a wrong-typed string option passes
# through unchanged in python (only the C#, Java and Go ports throw on it); a wrong bool throws
# ----------------------------------------------------------------------------

import ccxt  # noqa: F402


def test_option_types():
    exchange = ccxt.Exchange({
        'id': 'sampleexchange',
        'options': {
            'fetchX': {
                'wrongBool': 'yes',
                'wrongString': 5,
            },
        },
    })
    try:
        exchange.handle_option_bool_and_params({}, 'fetchX', 'wrongBool', False)
        assert False, 'a non-boolean option should have thrown'
    except ccxt.BadRequest as e:
        assert 'fetchX() option wrongBool must be a boolean' in str(e)
    value, params = exchange.handle_option_string_and_params({}, 'fetchX', 'wrongString', 'x')
    assert value == 5 and isinstance(value, int)
    value, params = exchange.handle_margin_mode_and_params('fetchX', {'marginMode': False})
    assert value is False
    assert 'marginMode' not in params
