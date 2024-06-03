import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

from ccxt.test.base.test_extend import test_base_functions_extend  # noqa: F401
from ccxt.test.base.test_number import test_base_number_all  # noqa: F401
from ccxt.test.base.test_datetime import test_base_datetime_all  # noqa: F401
from ccxt.test.base.test_crypto import testBaseCryptoAll  # noqa: F401



def test_base_init_rest(exchange):
    test_base_functions_extend(exchange)
    test_base_datetime_all()
    test_base_number_all()
    testBaseCryptoAll()
