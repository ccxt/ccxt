# -*- coding: utf-8 -*-

from helpers_for_tests import *
from test_async import testMainClass


try:
    import asyncio
except ImportError:
    asyncio = None

if __name__ == '__main__':
    argvSymbol = argv.symbol if argv.symbol and '/' in argv.symbol else None
    # in python, we check it through "symbol" arg (as opposed to JS/PHP) because argvs were already built above
    argvMethod = argv.symbol if argv.symbol and '()' in argv.symbol else None
    if (is_synchronous):
        testMainClass().init(argv.exchange, argvSymbol, argvMethod)
    else:
        asyncio.run(testMainClass().init(argv.exchange, argvSymbol, argvMethod))