import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled) - pins the instance-level
# Precise contracts that the transpiled static-method tests cannot see:
# reduce()'s instance return (not every language guarantees it yet),
# reduce()'s in-place mutation (exchange code reads .integer/.decimals
# after calling it directly), and the internal representation of parsed
# scientific notation. Everything assertable through the string_* statics
# lives in the transpiled test_precise.py instead.

from ccxt.base.precise import Precise  # noqa: E402


def test_precise_instance():
    # reduce() returns the instance on every code path — no-op, reducing,
    # zero (historically the reducing path fell off the end and returned
    # None, breaking chained calls like str(Precise('10.00').reduce()))
    no_op = Precise('40291.61')
    assert no_op.reduce() is no_op
    reducing = Precise('10.00')
    assert reducing.reduce() is reducing
    zero = Precise('0')
    assert zero.reduce() is zero
    # chained calls produce the decimal-formatted value
    assert str(Precise('10.00').reduce()) == '10'
    # reduce() normalizes the representation in place — transpiled exchange
    # code (bitget, phemex precision handling) reads .integer/.decimals
    # after calling reduce() directly; trailing zeros can drive decimals
    # negative ('10.00' reduces to integer 1, decimals -1)
    assert reducing.integer == 1
    assert reducing.decimals == -1
    # constructor representation pin for scientific notation — the parsed
    # *value* is covered by the transpiled tests (stringAbs ('-1.23e-6')
    # === '0.00000123'); this pins the internal (integer, decimals) pair,
    # which no string output exposes
    sci = Precise('1.23e-6')
    assert sci.integer == 123
    assert sci.decimals == 8
