# -*- coding: utf-8 -*-


# ########## imports ##########
from helpers_for_tests import get_cli_arg_value, is_synchronous, argv, argvSymbol, argvMethod, ccxt

try:
    import asyncio
except ImportError:
    asyncio = None

from base.functions.test_extend import test_base_functions_extend
# tested inside imports itself
import base.test_number  # noqa: F401
import base.test_crypto  # noqa: F401






# ########### args ###########

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
    test_base_functions_extend(exchange)
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
