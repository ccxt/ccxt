# -*- coding: utf-8 -*-

import argparse
import json
# import logging
import os
import sys
from traceback import format_tb, format_exception

import importlib  # noqa: E402
import re

# ------------------------------------------------------------------------------
# logging.basicConfig(level=logging.INFO)
# ------------------------------------------------------------------------------
DIR_NAME = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(DIR_NAME))
sys.path.append(root)

import ccxt.async_support as ccxt  # noqa: E402
import ccxt as ccxt_sync  # noqa: E402
import ccxt.pro as ccxtpro  # noqa: E402

# ------------------------------------------------------------------------------
# from typing import Optional
# from typing import List
from ccxt.base.errors import NotSupported  # noqa: F401
from ccxt.base.errors import InvalidProxySettings  # noqa: F401
from ccxt.base.errors import OperationFailed  # noqa: F401
# from ccxt.base.errors import ExchangeError
from ccxt.base.errors import ExchangeNotAvailable  # noqa: F401
from ccxt.base.errors import OnMaintenance  # noqa: F401
from ccxt.base.errors import AuthenticationError  # noqa: F401

# ------------------------------------------------------------------------------

class Argv(object):
    id_tests = False
    static_tests = False
    ws_tests = False
    request_tests = False
    response_tests = False
    sandbox = False
    privateOnly = False
    private = False
    ws = False
    verbose = False
    nonce = None
    exchange = None
    symbol = None
    info = False
    sync = False
    baseTests = False
    exchangeTests = False
    pass


argv = Argv()
parser = argparse.ArgumentParser()
parser.add_argument('--sandbox', action='store_true', help='enable sandbox mode')
parser.add_argument('--privateOnly', action='store_true', help='run private tests only')
parser.add_argument('--private', action='store_true', help='run private tests')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--ws', action='store_true', help='websockets version')
parser.add_argument('--info', action='store_true', help='enable info output')
parser.add_argument('--static', action='store_true', help='run static tests')
parser.add_argument('--useProxy', action='store_true', help='run static tests')
parser.add_argument('--idTests', action='store_true', help='run brokerId tests')
parser.add_argument('--responseTests', action='store_true', help='run response tests')
parser.add_argument('--response', action='store_true', help='run response tests')
parser.add_argument('--requestTests', action='store_true', help='run request tests')
parser.add_argument('--request', action='store_true', help='run request tests')
parser.add_argument('--sync', action='store_true', help='is sync')
parser.add_argument('--baseTests', action='store_true', help='is base tests')
parser.add_argument('--exchangeTests', action='store_true', help='is exchange tests')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')
parser.parse_args(namespace=argv)

# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception("You are running tests_async.py/test.py against a globally-installed version of the library! It was previously installed into your site-packages folder by pip or pip3. To ensure testing against the local folder uninstall it first with pip uninstall ccxt or pip3 uninstall ccxt")

# ------------------------------------------------------------------------------

Error = Exception

# # print an error string
# def dump_error(*args):
#     string = ' '.join([str(arg) for arg in args])
#     print(string)
#     sys.stderr.write(string + "\n")
#     sys.stderr.flush()


def handle_all_unhandled_exceptions(type, value, traceback):
    dump('[TEST_FAILURE]', (type), (value), '\n<UNHANDLED EXCEPTION>\n' + ('\n'.join(format_tb(traceback))))
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions
# ------------------------------------------------------------------------------

# non-transpiled part, but shared names among langs

EXT = 'py'
LANG = 'PY'
IS_SYNCHRONOUS = argv.sync  # 'async' not in os.path.basename(__file__)
PROXY_TEST_FILE_NAME = 'proxies'
ROOT_DIR = DIR_NAME + '/../../../'
ENV_VARS = os.environ
NEW_LINE = '\n'
LOG_CHARS_LENGTH = 10000



def get_cli_arg_value(arg):
    arg_exists = getattr(argv, arg) if hasattr(argv, arg) else False
    with_hyphen = '--' + arg
    arg_exists_with_hyphen = getattr(argv, with_hyphen) if hasattr(argv, with_hyphen) else False
    without_hyphen = arg.replace('--', '')
    arg_exists_wo_hyphen = getattr(argv, without_hyphen) if hasattr(argv, without_hyphen) else False
    return arg_exists or arg_exists_with_hyphen or arg_exists_wo_hyphen

isWsTests = get_cli_arg_value('--ws')

def dump(*args):
    print(' '.join([str(arg) for arg in args]))


def convert_ascii(str):
    return str  # stub

def json_parse(elem):
    return json.loads(elem)


def json_stringify(elem):
    return json.dumps(elem)


def convert_to_snake_case(content):
    res = re.sub(r'(?<!^)(?=[A-Z])', '_', content).lower()
    return res.replace('o_h_l_c_v', 'ohlcv')


def get_test_name(methodName):
    # stub
    return methodName


def io_file_exists(path):
    return os.path.isfile(path)


def io_file_read(path, decode=True):
    fs = open(path, "r", encoding="utf-8")
    content = fs.read()
    if decode:
        return json.loads(content)
    else:
        return content


def io_dir_read(path):
    return os.listdir(path)


def call_method_sync(test_files, methodName, exchange, skippedProperties, args):
    methodNameToCall = 'test_' + convert_to_snake_case(methodName)
    return getattr(test_files[methodName], methodNameToCall)(exchange, skippedProperties, *args)

async def call_method(test_files, methodName, exchange, skippedProperties, args):
    methodNameToCall = 'test_' + convert_to_snake_case(methodName)
    return await getattr(test_files[methodName], methodNameToCall)(exchange, skippedProperties, *args)


async def call_exchange_method_dynamically(exchange, methodName, args):
    return await getattr(exchange, methodName)(*args)

def call_exchange_method_dynamically_sync(exchange, methodName, args):
    return getattr(exchange, methodName)(*args)

async def call_overriden_method(exchange, methodName, args):
    # needed for php
    return await call_exchange_method_dynamically(exchange, methodName, args)

def exception_message(exc):
    message = '[' + type(exc).__name__ + '] ' + "".join(format_exception(type(exc), exc, exc.__traceback__, limit=6))
    if len(message) > LOG_CHARS_LENGTH:
        # Accessing out of range element causes error
        message = message[0:LOG_CHARS_LENGTH]
    return message

# stub for c#
def get_root_exception(exc):
    return exc

def exit_script(code=0):
    exit(code)


def get_exchange_prop(exchange, prop, defaultValue=None):
    if hasattr(exchange, prop):
        res = getattr(exchange, prop)
        if res is not None and res != '':
            return res
    return defaultValue


def set_exchange_prop(exchange, prop, value):
    setattr(exchange, prop, value)
    # set snake case too
    setattr(exchange, convert_to_snake_case(prop), value)


def init_exchange(exchangeId, args, is_ws=False):
    if IS_SYNCHRONOUS:
        return getattr(ccxt_sync, exchangeId)(args)
    if (is_ws):
        return getattr(ccxtpro, exchangeId)(args)
    return getattr(ccxt, exchangeId)(args)


def get_test_files_sync(properties, ws=False):
    tests = {}
    finalPropList = properties + [PROXY_TEST_FILE_NAME, 'features']
    for i in range(0, len(finalPropList)):
        methodName = finalPropList[i]
        name_snake_case = convert_to_snake_case(methodName)
        prefix = 'async' if not IS_SYNCHRONOUS else 'sync'
        dir_to_test = DIR_NAME + '/exchange/' + prefix + '/'
        module_string = 'ccxt.test.exchange.' + prefix + '.test_' + name_snake_case
        if (ws):
            prefix = 'pro'
            dir_to_test = DIR_NAME + '/../' + prefix + '/test/Exchange/'
            module_string = 'ccxt.pro.test.Exchange.test_' + name_snake_case
        filePathWithExt = dir_to_test + 'test_' + name_snake_case + '.py'
        if (io_file_exists (filePathWithExt)):
            imp = importlib.import_module(module_string)
            tests[methodName] = imp  # getattr(imp, finalName)
    return tests

async def get_test_files(properties, ws=False):
    return get_test_files_sync(properties, ws)

async def close(exchange):
    if (not IS_SYNCHRONOUS and hasattr(exchange, 'close')):
        await exchange.close()

def is_null_value(value):
    return value is None

def set_fetch_response(exchange: ccxt.Exchange, data):
    if (IS_SYNCHRONOUS):
        def fetch(url, method='GET', headers=None, body=None):
            return data
        exchange.fetch = fetch
        return exchange
    async def fetch(url, method='GET', headers=None, body=None):
        return data
    exchange.fetch = fetch
    return exchange

def get_lang():
    return LANG

def get_ext():
    return EXT

def get_root_dir():
    return ROOT_DIR

def get_env_vars():
    return ENV_VARS

def is_sync():
    return IS_SYNCHRONOUS

argvExchange = argv.exchange
argvSymbol = argv.symbol if argv.symbol and '/' in argv.symbol else None
# in python, we check it through "symbol" arg (as opposed to JS/PHP) because argvs were already built above
argvMethod = argv.symbol if argv.symbol and '()' in argv.symbol else None
