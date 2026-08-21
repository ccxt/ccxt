import os
import sys
 
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)
 
# ----------------------------------------------------------------------------
# hand-written python-only test (not transpiled) - pins the instance-level
# Precise contracts that either cannot be asserted cross-language (identity
# checks, negative-zero) or that not every language implementation
# guarantees yet
 
from ccxt.base.precise import Precise  # noqa: E402
 
 
def test_precise_instance():
    # reduce() returns the instance on every path — no-op, reducing, zero
    no_op = Precise('40291.61')
    assert no_op.reduce() is no_op
    reducing = Precise('10.00')
    assert reducing.reduce() is reducing
    zero = Precise('0')
    assert zero.reduce() is zero
    # chained calls must produce the decimal-formatted value
    assert str(Precise('10.00').reduce()) == '10'
    assert str(Precise('1000').reduce()) == '1000'
    # python ints cannot be negative zero, but pin the constructor state
    assert Precise('1000').decimals == 0
    assert Precise('1.23e2').decimals == 0
    # constructor state for scientific notation
    sci = Precise('1.23e-6')
    assert sci.integer == 123
    assert sci.decimals == 8
    upper_sci = Precise('1E8')
    assert upper_sci.integer == 1
    assert upper_sci.decimals == -8
    # str() normalizes the representation in place (trailing zeros can
    # drive decimals negative — '10.00' is stored as integer 1, decimals -1)
    trailing = Precise('10.00')
    str(trailing)
    assert trailing.integer == 1
    assert trailing.decimals == -1