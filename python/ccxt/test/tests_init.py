# -*- coding: utf-8 -*-


# ########## imports ##########
from helpers_for_tests import get_cli_arg_value, is_synchronous, argv, argvSymbol, argvMethod, ccxt

try:
    import asyncio
except ImportError:
    asyncio = None

from base.tests_init import test_base_init_rest  # noqa: F401
from ccxt.pro.test.base.tests_init import test_base_init_ws  # noqa: F401


# ########### args ###########

isWs = get_cli_arg_value('--ws')
isBaseTests = get_cli_arg_value('--baseTests')
isExchangeTests = get_cli_arg_value('--exchangeTests')
reqResTests = get_cli_arg_value('--responseTests') or get_cli_arg_value('--requestTests')
isAllTest = not reqResTests and not isBaseTests and not isExchangeTests  # if neither was chosen

# ###### base tests #######
if (isBaseTests or isAllTest):
    # test base things
    exchange = ccxt.Exchange({  # noqa: F405
        'id': 'xyzexchange',
    })
    if (isWs):
        test_base_init_ws()
    else:
        test_base_init_rest(exchange)
    print('base tests passed!')


# ###### exchange tests #######
if (isExchangeTests or reqResTests or isAllTest):
    if (is_synchronous):
        from tests_sync import testMainClass as testMainClassSync
        testMainClassSync().init(argv.exchange, argvSymbol, argvMethod)
    else:
        from tests_async import testMainClass as testMainClassAsync
        asyncio.run(testMainClassAsync().init(argv.exchange, argvSymbol, argvMethod))
    print('exchange tests passed!')
