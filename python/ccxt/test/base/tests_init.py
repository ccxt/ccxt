import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

from ccxt.test.base.test_extend import test_base_functions_extend  # noqa: F401
from ccxt.test.base.test_number import testNumberAll  # noqa: F401
from ccxt.test.base.test_crypto import testCryptoAll  # noqa: F401



def test_base_init_rest(exchange):
    test_base_functions_extend(exchange)
    testCryptoAll()
    testNumberAll()
