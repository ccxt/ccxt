import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from test_order_book import test_ws_order_book  # noqa: F401
from test_cache import test_ws_cache  # noqa: F401
from test_close import test_ws_close  # noqa: F401
from test_future import test_ws_future  # noqa: F401

def test_base_init_ws():
    test_ws_order_book()
    test_ws_cache()
    test_ws_close()
    test_ws_future()