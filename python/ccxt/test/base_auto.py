# -*- coding: utf-8 -*-

from helpers_for_tests import *

from base.functions_auto.test_extend import test_base_functions_extend
# tested inside imports itself
import base.test_number
import base.test_crypto
 
class BaseFunctionalitiesTestClass:

    def init():
        exchange = ccxt.Exchange ({
            'id': 'xyzexchange',
        })

        test_base_functions_extend(exchange)
