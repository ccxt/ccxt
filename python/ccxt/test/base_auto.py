# -*- coding: utf-8 -*-

from helpers_for_tests import *  # noqa: F403

from base.functions_auto.test_extend import test_base_functions_extend
# tested inside imports itself
import base.test_number  # noqa: F401
import base.test_crypto  # noqa: F401


class BaseFunctionalitiesTestClass:

    def init(self):
        exchange = ccxt.Exchange({  # noqa: F405
            'id': 'xyzexchange',
        })

        test_base_functions_extend(exchange)
