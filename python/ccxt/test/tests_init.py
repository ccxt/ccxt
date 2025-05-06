# -*- coding: utf-8 -*-

from tests_helpers import get_cli_arg_value, IS_SYNCHRONOUS, argvExchange, argvSymbol, argvMethod

try:
    import asyncio
except ImportError:
    asyncio = None

from base.tests_init import base_tests_init  # noqa: F401
from ccxt.pro.test.base.tests_init import test_base_init_ws  # noqa: F401

# fix : https://github.com/aio-libs/aiodns/issues/86
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# ########### args ###########
isWs = get_cli_arg_value('--ws')
isBaseTests = get_cli_arg_value('--baseTests')
runAll = get_cli_arg_value('--all')

# ###### base tests #######
if (isBaseTests):
    if (isWs):
        test_base_init_ws()
        print('base WS tests passed!')
    else:
        base_tests_init()
        print('base REST tests passed!')
    if not runAll:
        exit(0)

# ###### exchange tests #######
if (IS_SYNCHRONOUS):
    from tests_sync import testMainClass as testMainClassSync
    testMainClassSync().init(argvExchange, argvSymbol, argvMethod)
else:
    from tests_async import testMainClass as testMainClassAsync
    asyncio.run(testMainClassAsync().init(argvExchange, argvSymbol, argvMethod))
