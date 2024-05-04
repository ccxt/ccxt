# -*- coding: utf-8 -*-

from helpers_for_tests import *
from test_async import testMainClass


try:
    import asyncio
except ImportError:
    asyncio = None

from base_auto import BaseFunctionalitiesTestClass 
import base.test_number
import base.test_crypto

isBaseTests = get_cli_arg_value ('--baseTests')
isExchangeTests = get_cli_arg_value ('--exchangeTests')
isAllTest = not isBaseTests and not isExchangeTests  # if neither was chosen

####### base tests #######
if (isBaseTests or isAllTest):
    BaseFunctionalitiesTestClass().init()


####### exchange tests #######
if (isExchangeTests or isBaseTests):
    if (is_synchronous):
        testMainClass().init(argv.exchange, argvSymbol, argvMethod)
    else:
        asyncio.run(testMainClass().init(argv.exchange, argvSymbol, argvMethod))