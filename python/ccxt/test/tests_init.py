# -*- coding: utf-8 -*-

from helpers_for_tests import *

try:
    import asyncio
except ImportError:
    asyncio = None


isBaseTests = get_cli_arg_value ('--baseTests')
isExchangeTests = get_cli_arg_value ('--exchangeTests')
reqResTests = get_cli_arg_value ('--responseTests') or get_cli_arg_value ('--requestTests')
isAllTest = not isBaseTests and not isExchangeTests  # if neither was chosen

####### base tests #######
if (isBaseTests or isAllTest):
    # test base things
    from base_auto import BaseFunctionalitiesTestClass
    BaseFunctionalitiesTestClass().init()


####### exchange tests #######
if (isExchangeTests or reqResTests or isBaseTests):
    if (is_synchronous):
        from test_sync import testMainClass as testMainClassSync
        testMainClassSync().init(argv.exchange, argvSymbol, argvMethod)
    else:
        from test_async import testMainClass as testMainClassAsync
        asyncio.run(testMainClassAsync().init(argv.exchange, argvSymbol, argvMethod))