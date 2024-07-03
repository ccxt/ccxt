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
from ccxt.base.errors import ProxyError  # noqa: F401
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
    token_bucket = False
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
parser.add_argument('--token_bucket', action='store_true', help='enable token bucket experimental test')
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
parser.add_argument('--requestTests', action='store_true', help='run response tests')
parser.add_argument('--sync', action='store_true', help='is sync')
parser.add_argument('--baseTests', action='store_true', help='is base tests')
parser.add_argument('--exchangeTests', action='store_true', help='is exchange tests')
parser.add_argument('--nonce', type=int, help='integer')
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
    dump((type), (value), '\n<UNHANDLED EXCEPTION>\n' + ('\n'.join(format_tb(traceback))))
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions
# ------------------------------------------------------------------------------

# non-transpiled part, but shared names among langs

is_synchronous = argv.sync  # 'async' not in os.path.basename(__file__)

rootDir = DIR_NAME + '/../../../'
rootDirForSkips = DIR_NAME + '/../../../'
envVars = os.environ
LOG_CHARS_LENGTH = 10000
ext = 'py'
proxyTestFileName = 'proxies'


def get_cli_arg_value(arg):
    arg_exists = getattr(argv, arg) if hasattr(argv, arg) else False
    with_hyphen = '--' + arg
    arg_exists_with_hyphen = getattr(argv, with_hyphen) if hasattr(argv, with_hyphen) else False
    without_hyphen = arg.replace('--', '')
    arg_exists_wo_hyphen = getattr(argv, without_hyphen) if hasattr(argv, without_hyphen) else False
    return arg_exists or arg_exists_with_hyphen or arg_exists_wo_hyphen

isWsTests = get_cli_arg_value('--ws')


class baseMainTestClass():
    lang = 'PY'
    is_synchronous = is_synchronous
    request_tests_failed = False
    response_tests_failed = False
    response_tests = False
    ws_tests = False
    load_keys = False
    skipped_settings_for_exchange = {}
    skipped_methods = {}
    check_public_tests = {}
    test_files = {}
    public_tests = {}
    new_line = '\n'
    root_dir = rootDir
    env_vars = envVars
    ext = ext
    root_dir_for_skips = rootDirForSkips
    only_specific_tests = []
    proxy_test_file_name = proxyTestFileName
    pass


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
    if is_synchronous:
        return getattr(ccxt_sync, exchangeId)(args)
    if (is_ws):
        return getattr(ccxtpro, exchangeId)(args)
    return getattr(ccxt, exchangeId)(args)


async def get_test_files(properties, ws=False):
    tests = {}
    finalPropList = properties + [proxyTestFileName]
    for i in range(0, len(finalPropList)):
        methodName = finalPropList[i]
        name_snake_case = convert_to_snake_case(methodName)
        prefix = 'async' if not is_synchronous else 'sync'
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

async def close(exchange):
    if (not is_synchronous and hasattr(exchange, 'close')):
        await exchange.close()

def is_null_value(value):
    return value is None

def set_fetch_response(exchange: ccxt.Exchange, data):
    if (is_synchronous):
        def fetch(url, method='GET', headers=None, body=None):
            return data
        exchange.fetch = fetch
        return exchange
    async def fetch(url, method='GET', headers=None, body=None):
        return data
    exchange.fetch = fetch
    return exchange


argvSymbol = argv.symbol if argv.symbol and '/' in argv.symbol else None
# in python, we check it through "symbol" arg (as opposed to JS/PHP) because argvs were already built above
argvMethod = argv.symbol if argv.symbol and '()' in argv.symbol else None
