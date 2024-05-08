# -*- coding: utf-8 -*-

from helpers_for_tests import *
from test_async import testMainClass as testMainClassAsync
from test_sync import testMainClass as testMainClassSync


try:
    import asyncio
except ImportError:
    asyncio = None

from base_auto import BaseFunctionalitiesTestClass
# test base things
import base.test_number
import base.test_crypto

isBaseTests = get_cli_arg_value ('--baseTests')
isExchangeTests = get_cli_arg_value ('--exchangeTests')
reqResTests = get_cli_arg_value ('--responseTests') or get_cli_arg_value ('--requestTests')
isAllTest = not isBaseTests and not isExchangeTests  # if neither was chosen

####### base tests #######
if (isBaseTests or isAllTest):
    BaseFunctionalitiesTestClass().init()


####### exchange tests #######
if (isExchangeTests or isBaseTests):
    if (is_synchronous):
        testMainClassSync().init(argv.exchange, argvSymbol, argvMethod)
    else:
        asyncio.run(testMainClassAsync().init(argv.exchange, argvSymbol, argvMethod))