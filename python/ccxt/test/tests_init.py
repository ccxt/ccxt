# -*- coding: utf-8 -*-

from tests_helpers import get_cli_arg_value, is_synchronous, argv, argvSymbol, argvMethod

try:
    import asyncio
except ImportError:
    asyncio = None

from base.tests_init import base_tests_init  # noqa: F401
from ccxt.pro.test.base.tests_init import test_base_init_ws  # noqa: F401


# ########### args ###########
isWs = get_cli_arg_value('--ws')
isBaseTests = get_cli_arg_value('--baseTests')
run_all = get_cli_arg_value('--all')

# ###### base tests #######
if (isBaseTests):
    if (isWs):
        test_base_init_ws()
    else:
        base_tests_init()
    print('base tests passed!')
    if not run_all:
        exit(0)

# ###### exchange tests #######
if (is_synchronous):
    from tests_sync import testMainClass as testMainClassSync
    testMainClassSync().init(argv.exchange, argvSymbol, argvMethod)
else:
    from tests_async import testMainClass as testMainClassAsync
    asyncio.run(testMainClassAsync().init(argv.exchange, argvSymbol, argvMethod))
