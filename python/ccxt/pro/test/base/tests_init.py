import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

from asyncio import run

from ccxt.pro.test.base.test_order_book import test_ws_order_book  # noqa: F401
from ccxt.pro.test.base.test_cache import test_ws_cache  # noqa: F401
# todo : from ccxt.pro.test.base.test_close import test_ws_close  # noqa: F401
from ccxt.pro.test.base.test_future import test_ws_future  # noqa: F401
from ccxt.pro.test.base.test_abnormal_close import test_abnormal_close  # noqa: F401

def test_base_init_ws():
    test_ws_order_book()
    test_ws_cache()
    # todo : run(test_ws_close())
    run(test_ws_future())
    # run(test_abnormal_close()) stays in infinite loop in travis
