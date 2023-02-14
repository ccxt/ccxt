# -*- coding: utf-8 -*-

import argparse
import asyncio
import json
# import logging
import os
import sys
import time  # noqa: F401
from traceback import format_tb

# ------------------------------------------------------------------------------
# logging.basicConfig(level=logging.INFO)
# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: E402
from test_trade import test_trade  # noqa: E402
from test_order import test_order  # noqa: E402
from test_ohlcv import test_ohlcv  # noqa: E402
from test_position import test_position  # noqa: E402
from test_transaction import test_transaction  # noqa: E402

# ------------------------------------------------------------------------------


class Argv(object):
    token_bucket = False
    sandbox = False
    privateOnly = False
    private = False
    verbose = False
    nonce = None
    exchange = None
    symbol = None
    pass


argv = Argv()

parser = argparse.ArgumentParser()
parser.add_argument('--token_bucket', action='store_true', help='enable token bucket experimental test')
parser.add_argument('--sandbox', action='store_true', help='enable sandbox mode')
parser.add_argument('--privateOnly', action='store_true', help='run private tests only')
parser.add_argument('--private', action='store_true', help='run private tests')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--nonce', type=int, help='integer')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')

parser.parse_args(namespace=argv)

exchanges = {}

# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
print(os.getcwd(), path)
print(sys.argv)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception("You are running test_async.py/test.py against a globally-installed version of the library! It was previously installed into your site-packages folder by pip or pip3. To ensure testing against the local folder uninstall it first with pip uninstall ccxt or pip3 uninstall ccxt")

# ------------------------------------------------------------------------------
# string coloring functions


def style(s, style):
    return str(s)  # style + str (s) + '\033[0m'


def green(s):
    return style(s, '\033[92m')


def blue(s):
    return style(s, '\033[94m')


def yellow(s):
    return style(s, '\033[93m')


def red(s):
    return style(s, '\033[91m')


def pink(s):
    return style(s, '\033[95m')


def bold(s):
    return style(s, '\033[1m')


def underline(s):
    return style(s, '\033[4m')


# print a colored string
def dump(*args):
    print(' '.join([str(arg) for arg in args]))


# print an error string
def dump_error(*args):
    string = ' '.join([str(arg) for arg in args])
    print(string)
    sys.stderr.write(string + "\n")
    sys.stderr.flush()


# ------------------------------------------------------------------------------


def handle_all_unhandled_exceptions(type, value, traceback):
    dump_error(yellow(type), yellow(value), '\n\n' + yellow('\n'.join(format_tb(traceback))))
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# ------------------------------------------------------------------------------



### AUTO-TRANSPILER-START ###

### AUTO-TRANSPILER-END ###


if __name__ == '__main__':
    asyncio.run(main())
