# -*- coding: utf-8 -*-

from helpers_for_tests import *

from functions_auto.test_extend import testBaseFunctionsExtend
 
class BaseFunctionalitiesTestClass:

    def init():
        exchange = ccxt.Exchange ({
            'id': 'xyzexchange',
        })

        testBaseFunctionsExtend(exchange)
