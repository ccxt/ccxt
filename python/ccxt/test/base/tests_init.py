import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

from test_extend import test_base_functions_extend  # noqa: F401
from test_number import test_number  # noqa: F401
from test_crypto import test_crypto  # noqa: F401



def test_base_init_rest(exchange):
    test_base_functions_extend(exchange)
    test_crypto_all()
    test_number_all()