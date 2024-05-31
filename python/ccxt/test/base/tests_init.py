import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

from ccxt.test.base.test_extend import test_base_functions_extend  # noqa: F401
from ccxt.test.base.test_number import test_number_all  # noqa: F401
from ccxt.test.base.test_crypto import test_crypto_all  # noqa: F401



def test_base_init_rest(exchange):
    test_base_functions_extend(exchange)
    test_crypto_all()
    test_number_all()