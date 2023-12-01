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

# ------------------------------------------------------------------------------
import asyncio
# from typing import Optional
# from typing import List
from ccxt.base.errors import NotSupported
from ccxt.base.errors import NetworkError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import OnMaintenance
from ccxt.base.errors import AuthenticationError

# ------------------------------------------------------------------------------

class Argv(object):
    id_tests = False
    static_tests = False
    request_tests = False
    response_tests = False
    token_bucket = False
    sandbox = False
    privateOnly = False
    private = False
    verbose = False
    nonce = None
    exchange = None
    symbol = None
    info = False
    pass


argv = Argv()
parser = argparse.ArgumentParser()
parser.add_argument('--token_bucket', action='store_true', help='enable token bucket experimental test')
parser.add_argument('--sandbox', action='store_true', help='enable sandbox mode')
parser.add_argument('--privateOnly', action='store_true', help='run private tests only')
parser.add_argument('--private', action='store_true', help='run private tests')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--info', action='store_true', help='enable info output')
parser.add_argument('--static', action='store_true', help='run static tests')
parser.add_argument('--idTests', action='store_true', help='run brokerId tests')
parser.add_argument('--responseTests', action='store_true', help='run response tests')
parser.add_argument('--requestTests', action='store_true', help='run response tests')
parser.add_argument('--nonce', type=int, help='integer')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')
parser.parse_args(namespace=argv)

# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception("You are running test_async.py/test.py against a globally-installed version of the library! It was previously installed into your site-packages folder by pip or pip3. To ensure testing against the local folder uninstall it first with pip uninstall ccxt or pip3 uninstall ccxt")

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

is_synchronous = 'async' not in os.path.basename(__file__)

rootDir = DIR_NAME + '/../../../'
rootDirForSkips = DIR_NAME + '/../../../'
envVars = os.environ
LOG_CHARS_LENGTH = 10000
ext = 'py'
proxyTestFileName = 'proxies'


class baseMainTestClass():
    lang = 'PY'
    request_tests_failed = False
    response_tests_failed = False
    response_tests = False
    skipped_methods = {}
    check_public_tests = {}
    test_files = {}
    public_tests = {}
    root_dir = rootDir
    env_vars = envVars
    ext = ext
    root_dir_for_skips = rootDirForSkips
    only_specific_tests = []
    proxy_test_file_name = proxyTestFileName
    pass


def dump(*args):
    print(' '.join([str(arg) for arg in args]))


def json_parse(elem):
    return json.loads(elem)


def json_stringify(elem):
    return json.dumps(elem)


def get_cli_arg_value(arg):
    arg_exists = getattr(argv, arg) if hasattr(argv, arg) else False
    with_hyphen = '--' + arg
    arg_exists_with_hyphen = getattr(argv, with_hyphen) if hasattr(argv, with_hyphen) else False
    without_hyphen = arg.replace('--', '')
    arg_exists_wo_hyphen = getattr(argv, without_hyphen) if hasattr(argv, without_hyphen) else False
    return arg_exists or arg_exists_with_hyphen or arg_exists_wo_hyphen

def convert_to_snake_case(conent):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', conent).lower()

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
    methodNameToCall = convert_to_snake_case(methodName)
    methodNameToCall = 'test_' + methodNameToCall.replace('o_h_l_c_v', 'ohlcv')
    return await getattr(test_files[methodName], methodNameToCall)(exchange, skippedProperties, *args)


async def call_exchange_method_dynamically(exchange, methodName, args):
    return await getattr(exchange, methodName)(*args)

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


def init_exchange(exchangeId, args):
    return getattr(ccxt, exchangeId)(args)


async def set_test_files(holderClass, properties):
    finalPropList = properties + [proxyTestFileName]
    syncAsync = 'async' if not is_synchronous else 'sync'
    for i in range(0, len(finalPropList)):
        name = finalPropList[i]
        name_snake_case = convert_to_snake_case(name)
        filePathWithExt = DIR_NAME + '/' + syncAsync + '/test_' + name_snake_case + '.py'
        if (io_file_exists (filePathWithExt)):
            imp = importlib.import_module('ccxt.test.' + syncAsync + '.test_' + name_snake_case)
            holderClass.test_files[name] = imp  # getattr(imp, finalName)


async def close(exchange):
    if (hasattr(exchange, 'close')):
        await exchange.close()

def is_null_value(value):
    return value is None

def set_fetch_response(exchange: ccxt.Exchange, data):
    async def fetch(url, method='GET', headers=None, body=None):
        return data
    exchange.fetch = fetch
    return exchange

# *********************************
# ***** AUTO-TRANSPILER-START *****
class testMainClass(baseMainTestClass):
    def parse_cli_args(self):
        self.response_tests = get_cli_arg_value('--responseTests')
        self.id_tests = get_cli_arg_value('--idTests')
        self.request_tests = get_cli_arg_value('--requestTests')
        self.info = get_cli_arg_value('--info')
        self.verbose = get_cli_arg_value('--verbose')
        self.debug = get_cli_arg_value('--debug')
        self.private_test = get_cli_arg_value('--private')
        self.private_test_only = get_cli_arg_value('--privateOnly')
        self.sandbox = get_cli_arg_value('--sandbox')

    async def init(self, exchange_id, symbol_argv):
        self.parse_cli_args()
        if self.response_tests:
            await self.run_static_response_tests(exchange_id, symbol_argv)
            return
        if self.request_tests:
            await self.run_static_request_tests(exchange_id, symbol_argv)  # symbol here is the testname
            return
        if self.id_tests:
            await self.run_broker_id_tests()
            return
        symbol_str = symbol_argv if symbol_argv is not None else 'all'
        dump('\nTESTING ', self.ext, {
            'exchange': exchange_id,
            'symbol': symbol_str,
        }, '\n')
        exchange_args = {
            'verbose': self.verbose,
            'debug': self.debug,
            'enableRateLimit': True,
            'timeout': 30000,
        }
        exchange = init_exchange(exchange_id, exchange_args)
        await self.import_files(exchange)
        self.expand_settings(exchange)
        symbol_or_undefined = self.check_if_specific_test_is_chosen(symbol_argv)
        await self.start_test(exchange, symbol_or_undefined)

    def check_if_specific_test_is_chosen(self, symbol_argv):
        if symbol_argv is not None:
            test_file_names = list(self.test_files.keys())
            possible_method_names = symbol_argv.split(',')  # i.e. `test.ts binance fetchBalance,fetchDeposits`
            if len(possible_method_names) >= 1:
                for i in range(0, len(test_file_names)):
                    test_file_name = test_file_names[i]
                    for j in range(0, len(possible_method_names)):
                        method_name = possible_method_names[j]
                        if test_file_name == method_name:
                            self.only_specific_tests.append(test_file_name)
            # if method names were found, then remove them from symbolArgv
            if len(self.only_specific_tests) > 0:
                return None
        return symbol_argv

    async def import_files(self, exchange):
        # exchange tests
        self.test_files = {}
        properties = list(exchange.has.keys())
        properties.append('loadMarkets')
        await set_test_files(self, properties)

    def expand_settings(self, exchange):
        exchange_id = exchange.id
        keys_global = self.root_dir + 'keys.json'
        keys_local = self.root_dir + 'keys.local.json'
        keys_global_exists = io_file_exists(keys_global)
        keys_local_exists = io_file_exists(keys_local)
        global_settings = io_file_read(keys_global) if keys_global_exists else {}
        local_settings = io_file_read(keys_local) if keys_local_exists else {}
        all_settings = exchange.deep_extend(global_settings, local_settings)
        exchange_settings = exchange.safe_value(all_settings, exchange_id, {})
        if exchange_settings:
            setting_keys = list(exchange_settings.keys())
            for i in range(0, len(setting_keys)):
                key = setting_keys[i]
                if exchange_settings[key]:
                    final_value = None
                    if isinstance(exchange_settings[key], dict):
                        existing = get_exchange_prop(exchange, key, {})
                        final_value = exchange.deep_extend(existing, exchange_settings[key])
                    else:
                        final_value = exchange_settings[key]
                    set_exchange_prop(exchange, key, final_value)
        # credentials
        req_creds = get_exchange_prop(exchange, 're' + 'quiredCredentials')  # dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        objkeys = list(req_creds.keys())
        for i in range(0, len(objkeys)):
            credential = objkeys[i]
            is_required = req_creds[credential]
            if is_required and get_exchange_prop(exchange, credential) is None:
                full_key = exchange_id + '_' + credential
                credential_env_name = full_key.upper()  # example: KRAKEN_APIKEY
                credential_value = self.env_vars[credential_env_name] if (credential_env_name in self.env_vars) else None
                if credential_value:
                    set_exchange_prop(exchange, credential, credential_value)
        # skipped tests
        skipped_file = self.root_dir_for_skips + 'skip-tests.json'
        skipped_settings = io_file_read(skipped_file)
        skipped_settings_for_exchange = exchange.safe_value(skipped_settings, exchange_id, {})
        # others
        timeout = exchange.safe_value(skipped_settings_for_exchange, 'timeout')
        if timeout is not None:
            exchange.timeout = timeout
        exchange.http_proxy = exchange.safe_string(skipped_settings_for_exchange, 'httpProxy')
        exchange.https_proxy = exchange.safe_string(skipped_settings_for_exchange, 'httpsProxy')
        self.skipped_methods = exchange.safe_value(skipped_settings_for_exchange, 'skipMethods', {})
        self.checked_public_tests = {}

    def add_padding(self, message, size):
        # has to be transpilable
        res = ''
        message_length = len(message)  # avoid php transpilation issue
        missing_space = size - message_length - 0  # - 0 is added just to trick transpile to treat the .length as a string for php
        if missing_space > 0:
            for i in range(0, missing_space):
                res += ' '
        return message + res

    async def test_method(self, method_name, exchange, args, is_public):
        is_load_markets = (method_name == 'loadMarkets')
        method_name_in_test = get_test_name(method_name)
        # if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if not is_public and (method_name_in_test in self.checked_public_tests) and (method_name != 'fetchCurrencies'):
            return
        skip_message = None
        is_proxy_test = method_name == self.proxy_test_file_name
        supported_by_exchange = (method_name in exchange.has) and exchange.has[method_name]
        if not is_load_markets and (len(self.only_specific_tests) > 0 and not exchange.in_array(method_name_in_test, self.only_specific_tests)):
            skip_message = '[INFO:IGNORED_TEST]'
        elif not is_load_markets and not supported_by_exchange and not is_proxy_test:
            skip_message = '[INFO:UNSUPPORTED_TEST]'  # keep it aligned with the longest message
        elif (method_name in self.skipped_methods) and (isinstance(self.skipped_methods[method_name], str)):
            skip_message = '[INFO:SKIPPED_TEST]'
        elif not (method_name_in_test in self.test_files):
            skip_message = '[INFO:UNIMPLEMENTED_TEST]'
        # exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if is_load_markets:
            await exchange.load_markets(True)
        if skip_message:
            if self.info:
                dump(self.add_padding(skip_message, 25), exchange.id, method_name_in_test)
            return
        if self.info:
            args_stringified = '(' + ','.join(args) + ')'
            dump(self.add_padding('[INFO:TESTING]', 25), exchange.id, method_name_in_test, args_stringified)
        skipped_properties = exchange.safe_value(self.skipped_methods, method_name, {})
        await call_method(self.test_files, method_name_in_test, exchange, skipped_properties, args)
        # if it was passed successfully, add to the list of successfull tests
        if is_public:
            self.checked_public_tests[method_name_in_test] = True

    async def test_safe(self, method_name, exchange, args=[], is_public=False):
        # `testSafe` method does not throw an exception, instead mutes it.
        # The reason we mute the thrown exceptions here is because if this test is part
        # of "runPublicTests", then we don't want to stop the whole test if any single
        # test-method fails. For example, if "fetchOrderBook" public test fails, we still
        # want to run "fetchTickers" and other methods. However, independently this fact,
        # from those test-methods we still echo-out (console.log/print...) the exception
        # messages with specific formatted message "[TEST_FAILURE] ..." and that output is
        # then regex-parsed by run-tests.js, so the exceptions are still printed out to
        # console from there. So, even if some public tests fail, the script will continue
        # doing other things (testing other spot/swap or private tests ...)
        max_retries = 3
        args_stringified = exchange.json(args)  # args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
        for i in range(0, max_retries):
            try:
                await self.test_method(method_name, exchange, args, is_public)
                return True
            except Exception as e:
                is_auth_error = (isinstance(e, AuthenticationError))
                is_not_supported = (isinstance(e, NotSupported))
                is_network_error = (isinstance(e, NetworkError))  # includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "isOperationFailed", "InvalidNonce", ...
                is_exchange_not_available = (isinstance(e, ExchangeNotAvailable))
                is_on_maintenance = (isinstance(e, OnMaintenance))
                temp_failure = is_network_error and (not is_exchange_not_available or is_on_maintenance)  # we do not mute specifically "ExchangeNotAvailable" excetpion (but its subtype "OnMaintenance" can be muted)
                if temp_failure:
                    # if last retry was gone with same `tempFailure` error, then let's eventually return false
                    if i == max_retries - 1:
                        dump('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, method_name, args_stringified)
                    else:
                        # wait and retry again
                        await exchange.sleep(i * 1000)  # increase wait seconds on every retry
                        continue
                elif isinstance(e, OnMaintenance):
                    # in case of maintenance, skip exchange (don't fail the test)
                    dump('[TEST_WARNING] Exchange is on maintenance', exchange.id)
                elif is_public and is_auth_error:
                    # in case of loadMarkets, it means that "tester" (developer or travis) does not have correct authentication, so it does not have a point to proceed at all
                    if method_name == 'loadMarkets':
                        dump('[TEST_WARNING]', 'Exchange can not be tested, because of authentication problems during loadMarkets', exception_message(e), exchange.id, method_name, args_stringified)
                    if self.info:
                        dump('[TEST_WARNING]', 'Authentication problem for public method', exception_message(e), exchange.id, method_name, args_stringified)
                else:
                    # if not a temporary connectivity issue, then mark test as failed (no need to re-try)
                    if is_not_supported:
                        dump('[NOT_SUPPORTED]', exchange.id, method_name, args_stringified)
                        return True   # why consider not supported as a failed test?
                    else:
                        dump('[TEST_FAILURE]', exception_message(e), exchange.id, method_name, args_stringified)
                return False

    async def run_public_tests(self, exchange, symbol):
        tests = {
            'fetchCurrencies': [],
            'fetchTicker': [symbol],
            'fetchTickers': [symbol],
            'fetchOHLCV': [symbol],
            'fetchTrades': [symbol],
            'fetchOrderBook': [symbol],
            'fetchL2OrderBook': [symbol],
            'fetchOrderBooks': [],
            'fetchBidsAsks': [],
            'fetchStatus': [],
            'fetchTime': [],
        }
        market = exchange.market(symbol)
        is_spot = market['spot']
        if is_spot:
            tests['fetchCurrencies'] = []
        else:
            tests['fetchFundingRates'] = [symbol]
            tests['fetchFundingRate'] = [symbol]
            tests['fetchFundingRateHistory'] = [symbol]
            tests['fetchIndexOHLCV'] = [symbol]
            tests['fetchMarkOHLCV'] = [symbol]
            tests['fetchPremiumIndexOHLCV'] = [symbol]
        self.public_tests = tests
        test_names = list(tests.keys())
        promises = []
        for i in range(0, len(test_names)):
            test_name = test_names[i]
            test_args = tests[test_name]
            promises.append(self.test_safe(test_name, exchange, test_args, True))
        # todo - not yet ready in other langs too
        # promises.push (testThrottle ());
        results = await asyncio.gather(*promises)
        # now count which test-methods retuned `false` from "testSafe" and dump that info below
        if self.info:
            errors = []
            for i in range(0, len(test_names)):
                if not results[i]:
                    errors.append(test_names[i])
            # we don't throw exception for public-tests, see comments under 'testSafe' method
            errors_in_message = ''
            if len(errors):
                failed_msg = ', '.join(errors)
                errors_in_message = ' | Failed methods : ' + failed_msg
            message_content = '[INFO:PUBLIC_TESTS_END] ' + market['type'] + errors_in_message
            message_with_padding = self.add_padding(message_content, 25)
            dump(message_with_padding, exchange.id)

    async def load_exchange(self, exchange):
        result = await self.test_safe('loadMarkets', exchange, [], True)
        if not result:
            return False
        symbols = ['BTC/CNY', 'BTC/USD', 'BTC/USDT', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'BTC/JPY', 'ETH/EUR', 'ETH/JPY', 'ETH/CNY', 'ETH/USD', 'LTC/CNY', 'DASH/BTC', 'DOGE/BTC', 'BTC/AUD', 'BTC/PLN', 'USD/SLL', 'BTC/RUB', 'BTC/UAH', 'LTC/BTC', 'EUR/USD']
        result_symbols = []
        exchange_specific_symbols = exchange.symbols
        for i in range(0, len(exchange_specific_symbols)):
            symbol = exchange_specific_symbols[i]
            if exchange.in_array(symbol, symbols):
                result_symbols.append(symbol)
        result_msg = ''
        result_length = len(result_symbols)
        exchange_symbols_length = len(exchange.symbols)
        if result_length > 0:
            if exchange_symbols_length > result_length:
                result_msg = ', '.join(result_symbols) + ' + more...'
            else:
                result_msg = ', '.join(result_symbols)
        dump('Exchange loaded', exchange_symbols_length, 'symbols', result_msg)
        return True

    def get_test_symbol(self, exchange, is_spot, symbols):
        symbol = None
        for i in range(0, len(symbols)):
            s = symbols[i]
            market = exchange.safe_value(exchange.markets, s)
            if market is not None:
                active = exchange.safe_value(market, 'active')
                if active or (active is None):
                    symbol = s
                    break
        return symbol

    def get_exchange_code(self, exchange, codes=None):
        if codes is None:
            codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT']
        code = codes[0]
        for i in range(0, len(codes)):
            if codes[i] in exchange.currencies:
                return codes[i]
        return code

    def get_markets_from_exchange(self, exchange, spot=True):
        res = {}
        markets = exchange.markets
        keys = list(markets.keys())
        for i in range(0, len(keys)):
            key = keys[i]
            market = markets[key]
            if spot and market['spot']:
                res[market['symbol']] = market
            elif not spot and not market['spot']:
                res[market['symbol']] = market
        return res

    def get_valid_symbol(self, exchange, spot=True):
        current_type_markets = self.get_markets_from_exchange(exchange, spot)
        codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT', 'ATOM', 'BAT', 'BTG', 'DASH', 'DOGE', 'ETC', 'IOTA', 'LSK', 'MKR', 'NEO', 'PAX', 'QTUM', 'TRX', 'TUSD', 'USD', 'USDC', 'WAVES', 'XEM', 'XMR', 'ZEC', 'ZRX']
        spot_symbols = ['BTC/USD', 'BTC/USDT', 'BTC/CNY', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'ETH/USD', 'ETH/USDT', 'BTC/JPY', 'LTC/BTC', 'ZRX/WETH', 'EUR/USD']
        swap_symbols = ['BTC/USDT:USDT', 'BTC/USD:USD', 'ETH/USDT:USDT', 'ETH/USD:USD', 'LTC/USDT:USDT', 'DOGE/USDT:USDT', 'ADA/USDT:USDT', 'BTC/USD:BTC', 'ETH/USD:ETH']
        target_symbols = spot_symbols if spot else swap_symbols
        symbol = self.get_test_symbol(exchange, spot, target_symbols)
        # if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
        if symbol is None:
            for i in range(0, len(codes)):
                current_code = codes[i]
                markets_array_for_current_code = exchange.filter_by(current_type_markets, 'base', current_code)
                indexed_mkts = exchange.index_by(markets_array_for_current_code, 'symbol')
                symbols_array_for_current_code = list(indexed_mkts.keys())
                symbols_length = len(symbols_array_for_current_code)
                if symbols_length:
                    symbol = self.get_test_symbol(exchange, spot, symbols_array_for_current_code)
                    break
        # if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if symbol is None:
            active_markets = exchange.filter_by(current_type_markets, 'active', True)
            active_symbols = []
            for i in range(0, len(active_markets)):
                active_symbols.append(active_markets[i]['symbol'])
            symbol = self.get_test_symbol(exchange, spot, active_symbols)
        if symbol is None:
            values = list(current_type_markets.values())
            values_length = len(values)
            if values_length > 0:
                first = values[0]
                if first is not None:
                    symbol = first['symbol']
        return symbol

    async def test_exchange(self, exchange, provided_symbol=None):
        spot_symbol = None
        swap_symbol = None
        if provided_symbol is not None:
            market = exchange.market(provided_symbol)
            if market['spot']:
                spot_symbol = provided_symbol
            else:
                swap_symbol = provided_symbol
        else:
            if exchange.has['spot']:
                spot_symbol = self.get_valid_symbol(exchange, True)
            if exchange.has['swap']:
                swap_symbol = self.get_valid_symbol(exchange, False)
        if spot_symbol is not None:
            dump('Selected SPOT SYMBOL:', spot_symbol)
        if swap_symbol is not None:
            dump('Selected SWAP SYMBOL:', swap_symbol)
        if not self.private_test_only:
            if exchange.has['spot'] and spot_symbol is not None:
                if self.info:
                    dump('[INFO: ### SPOT TESTS ###]')
                exchange.options['type'] = 'spot'
                await self.run_public_tests(exchange, spot_symbol)
            if exchange.has['swap'] and swap_symbol is not None:
                if self.info:
                    dump('[INFO: ### SWAP TESTS ###]')
                exchange.options['type'] = 'swap'
                await self.run_public_tests(exchange, swap_symbol)
        if self.private_test or self.private_test_only:
            if exchange.has['spot'] and spot_symbol is not None:
                exchange.options['defaultType'] = 'spot'
                await self.run_private_tests(exchange, spot_symbol)
            if exchange.has['swap'] and swap_symbol is not None:
                exchange.options['defaultType'] = 'swap'
                await self.run_private_tests(exchange, swap_symbol)

    async def run_private_tests(self, exchange, symbol):
        if not exchange.check_required_credentials(False):
            dump('[Skipping private tests]', 'Keys not found')
            return
        code = self.get_exchange_code(exchange)
        # if (exchange.extendedTest) {
        #     await test ('InvalidNonce', exchange, symbol);
        #     await test ('OrderNotFound', exchange, symbol);
        #     await test ('InvalidOrder', exchange, symbol);
        #     await test ('InsufficientFunds', exchange, symbol, balance); # danger zone - won't execute with non-empty balance
        # }
        tests = {
            'signIn': [],
            'fetchBalance': [],
            'fetchAccounts': [],
            'fetchTransactionFees': [],
            'fetchTradingFees': [],
            'fetchStatus': [],
            'fetchOrders': [symbol],
            'fetchOpenOrders': [symbol],
            'fetchClosedOrders': [symbol],
            'fetchMyTrades': [symbol],
            'fetchLeverageTiers': [[symbol]],
            'fetchLedger': [code],
            'fetchTransactions': [code],
            'fetchDeposits': [code],
            'fetchWithdrawals': [code],
            'fetchBorrowInterest': [code, symbol],
            'cancelAllOrders': [symbol],
            'fetchCanceledOrders': [symbol],
            'fetchPosition': [symbol],
            'fetchDeposit': [code],
            'createDepositAddress': [code],
            'fetchDepositAddress': [code],
            'fetchDepositAddresses': [code],
            'fetchDepositAddressesByNetwork': [code],
            'fetchBorrowRateHistory': [code],
            'fetchLedgerEntry': [code],
        }
        market = exchange.market(symbol)
        is_spot = market['spot']
        if is_spot:
            tests['fetchCurrencies'] = []
        else:
            # derivatives only
            tests['fetchPositions'] = [symbol]  # this test fetches all positions for 1 symbol
            tests['fetchPosition'] = [symbol]
            tests['fetchPositionRisk'] = [symbol]
            tests['setPositionMode'] = [symbol]
            tests['setMarginMode'] = [symbol]
            tests['fetchOpenInterestHistory'] = [symbol]
            tests['fetchFundingRateHistory'] = [symbol]
            tests['fetchFundingHistory'] = [symbol]
        combined_public_private_tests = exchange.deep_extend(self.public_tests, tests)
        test_names = list(combined_public_private_tests.keys())
        promises = []
        for i in range(0, len(test_names)):
            test_name = test_names[i]
            test_args = combined_public_private_tests[test_name]
            promises.append(self.test_safe(test_name, exchange, test_args, False))
        results = await asyncio.gather(*promises)
        errors = []
        for i in range(0, len(test_names)):
            test_name = test_names[i]
            success = results[i]
            if not success:
                errors.append(test_name)
        errors_cnt = len(errors)  # PHP transpile count($errors)
        if errors_cnt > 0:
            # throw new Error ('Failed private tests [' + market['type'] + ']: ' + errors.join (', '));
            dump('[TEST_FAILURE]', 'Failed private tests [' + market['type'] + ']: ' + ', '.join(errors))
        else:
            if self.info:
                dump(self.add_padding('[INFO:PRIVATE_TESTS_DONE]', 25), exchange.id)

    async def test_proxies(self, exchange):
        # these tests should be synchronously executed, because of conflicting nature of proxy settings
        proxy_test_name = self.proxy_test_file_name
        if self.info:
            dump(self.add_padding('[INFO:TESTING]', 25), exchange.id, proxy_test_name)
        # try proxy several times
        max_retries = 3
        exception = None
        for j in range(0, max_retries):
            try:
                await self.test_method(proxy_test_name, exchange, [], True)
                break  # if successfull, then break
            except Exception as e:
                exception = e
        # if exception was set, then throw it
        if exception:
            raise Error('[TEST_FAILURE] Failed ' + proxy_test_name + ' : ' + exception_message(exception))

    async def start_test(self, exchange, symbol):
        # we do not need to test aliases
        if exchange.alias:
            return
        if self.sandbox or get_exchange_prop(exchange, 'sandbox'):
            exchange.set_sandbox_mode(True)
        try:
            result = await self.load_exchange(exchange)
            if not result:
                await close(exchange)
                return
            if exchange.id == 'binance':
                # we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
                await self.test_proxies(exchange)
            await self.test_exchange(exchange, symbol)
            await close(exchange)
        except Exception as e:
            await close(exchange)
            raise e

    def assert_static_error(self, cond, message, calculated_output, stored_output):
        #  -----------------------------------------------------------------------------
        #  --- Init of static tests functions------------------------------------------
        #  -----------------------------------------------------------------------------
        calculated_string = json_stringify(calculated_output)
        output_string = json_stringify(stored_output)
        error_message = message + ' expected ' + output_string + ' received: ' + calculated_string
        assert cond, error_message

    def load_markets_from_file(self, id):
        # load markets from file
        # to make this test as fast as possible
        # and basically independent from the exchange
        # so we can run it offline
        filename = self.root_dir + './ts/src/test/static/markets/' + id + '.json'
        content = io_file_read(filename)
        return content

    def load_currencies_from_file(self, id):
        filename = self.root_dir + './ts/src/test/static/currencies/' + id + '.json'
        content = io_file_read(filename)
        return content

    def load_static_data(self, folder, target_exchange=None):
        result = {}
        if target_exchange:
            # read a single exchange
            result[target_exchange] = io_file_read(folder + target_exchange + '.json')
            return result
        files = io_dir_read(folder)
        for i in range(0, len(files)):
            file = files[i]
            exchange_name = file.replace('.json', '')
            content = io_file_read(folder + file)
            result[exchange_name] = content
        return result

    def remove_hostnamefrom_url(self, url):
        if url is None:
            return None
        url_parts = url.split('/')
        res = ''
        for i in range(0, len(url_parts)):
            if i > 2:
                current = url_parts[i]
                if current.find('?') > -1:
                    # handle urls like this: /v1/account/accounts?AccessK
                    current_parts = current.split('?')
                    res += '/'
                    res += current_parts[0]
                    break
                res += '/'
                res += current
        return res

    def urlencoded_to_dict(self, url):
        result = {}
        parts = url.split('&')
        for i in range(0, len(parts)):
            part = parts[i]
            key_value = part.split('=')
            keys_length = len(key_value)
            if keys_length != 2:
                continue
            key = key_value[0]
            value = key_value[1]
            if (value is not None) and ((value.startswith('[')) or (value.startswith('{'))):
                # some exchanges might return something like this: timestamp=1699382693405&batchOrders=[{\"symbol\":\"LTCUSDT\",\"side\":\"BUY\",\"newClientOrderI
                value = json_parse(value)
            result[key] = value
        return result

    def assert_new_and_stored_output(self, exchange, skip_keys, new_output, stored_output, strict_type_check=True):
        if is_null_value(new_output) and is_null_value(stored_output):
            return
        if not new_output and not stored_output:
            return
        if (isinstance(stored_output, dict)) and (isinstance(new_output, dict)):
            stored_output_keys = list(stored_output.keys())
            new_output_keys = list(new_output.keys())
            stored_keys_length = len(stored_output_keys)
            new_keys_length = len(new_output_keys)
            self.assert_static_error(stored_keys_length == new_keys_length, 'output length mismatch', stored_output, new_output)
            # iterate over the keys
            for i in range(0, len(stored_output_keys)):
                key = stored_output_keys[i]
                if exchange.in_array(key, skip_keys):
                    continue
                if not (exchange.in_array(key, new_output_keys)):
                    self.assert_static_error(False, 'output key missing: ' + key, stored_output, new_output)
                stored_value = stored_output[key]
                new_value = new_output[key]
                self.assert_new_and_stored_output(exchange, skip_keys, new_value, stored_value, strict_type_check)
        elif isinstance(stored_output, list) and (isinstance(new_output, list)):
            stored_array_length = len(stored_output)
            new_array_length = len(new_output)
            self.assert_static_error(stored_array_length == new_array_length, 'output length mismatch', stored_output, new_output)
            for i in range(0, len(stored_output)):
                stored_item = stored_output[i]
                new_item = new_output[i]
                self.assert_new_and_stored_output(exchange, skip_keys, new_item, stored_item, strict_type_check)
        else:
            # built-in types like strings, numbers, booleans
            sanitized_new_output = None if (not new_output) else new_output  # we store undefined as nulls in the json file so we need to convert it back
            sanitized_stored_output = None if (not stored_output) else stored_output
            new_output_string = str(sanitized_new_output) if sanitized_new_output else 'undefined'
            stored_output_string = str(sanitized_stored_output) if sanitized_stored_output else 'undefined'
            message_error = 'output value mismatch:' + new_output_string + ' != ' + stored_output_string
            if strict_type_check:
                # upon building the request we want strict type check to make sure all the types are correct
                # when comparing the response we want to allow some flexibility, because a 50.0 can be equal to 50 after saving it to the json file
                self.assert_static_error(sanitized_new_output == sanitized_stored_output, message_error, stored_output, new_output)
            else:
                is_boolean = (isinstance(sanitized_new_output, bool)) or (isinstance(sanitized_stored_output, bool))
                is_string = (isinstance(sanitized_new_output, str)) or (isinstance(sanitized_stored_output, str))
                is_undefined = (sanitized_new_output is None) or (sanitized_stored_output is None)  # undefined is a perfetly valid value
                if is_boolean or is_string or is_undefined:
                    self.assert_static_error(new_output_string == stored_output_string, message_error, stored_output, new_output)
                else:
                    numeric_new_output = exchange.parse_to_numeric(new_output_string)
                    numeric_stored_output = exchange.parse_to_numeric(stored_output_string)
                    self.assert_static_error(numeric_new_output == numeric_stored_output, message_error, stored_output, new_output)

    def assert_static_request_output(self, exchange, type, skip_keys, stored_url, request_url, stored_output, new_output):
        if stored_url != request_url:
            # remove the host part from the url
            first_path = self.remove_hostnamefrom_url(stored_url)
            second_path = self.remove_hostnamefrom_url(request_url)
            self.assert_static_error(first_path == second_path, 'url mismatch', first_path, second_path)
        # body (aka storedOutput and newOutput) is not defined and information is in the url
        # example: "https://open-api.bingx.com/openApi/spot/v1/trade/order?quoteOrderQty=5&side=BUY&symbol=LTC-USDT&timestamp=1698777135343&type=MARKET&signature=d55a7e4f7f9dbe56c4004c9f3ab340869d3cb004e2f0b5b861e5fbd1762fd9a0
        if (stored_output is None) and (new_output is None):
            if (stored_url is not None) and (request_url is not None):
                stored_url_parts = stored_url.split('?')
                new_url_parts = request_url.split('?')
                stored_url_query = exchange.safe_value(stored_url_parts, 1)
                new_url_query = exchange.safe_value(new_url_parts, 1)
                if (stored_url_query is None) and (new_url_query is None):
                    # might be a get request without any query parameters
                    # example: https://api.gateio.ws/api/v4/delivery/usdt/positions
                    return
                stored_url_params = self.urlencoded_to_dict(stored_url_query)
                new_url_params = self.urlencoded_to_dict(new_url_query)
                self.assert_new_and_stored_output(exchange, skip_keys, new_url_params, stored_url_params)
                return
        if type == 'json':
            if isinstance(stored_output, str):
                stored_output = json_parse(stored_output)
            if isinstance(new_output, str):
                new_output = json_parse(new_output)
        elif type == 'urlencoded':
            stored_output = self.urlencoded_to_dict(stored_output)
            new_output = self.urlencoded_to_dict(new_output)
        elif type == 'both':
            if stored_output.startswith('{') or stored_output.startswith('['):
                stored_output = json_parse(stored_output)
                new_output = json_parse(new_output)
            else:
                stored_output = self.urlencoded_to_dict(stored_output)
                new_output = self.urlencoded_to_dict(new_output)
        self.assert_new_and_stored_output(exchange, skip_keys, new_output, stored_output)

    def assert_static_response_output(self, exchange, skip_keys, computed_result, stored_result):
        self.assert_new_and_stored_output(exchange, skip_keys, computed_result, stored_result, False)

    def sanitize_data_input(self, input):
        # remove nulls and replace with unefined instead
        if input is None:
            return None
        new_input = []
        for i in range(0, len(input)):
            current = input[i]
            if is_null_value(current):
                new_input.append(None)
            else:
                new_input.append(current)
        return new_input

    async def test_method_statically(self, exchange, method, data, type, skip_keys):
        output = None
        request_url = None
        try:
            await call_exchange_method_dynamically(exchange, method, self.sanitize_data_input(data['input']))
        except Exception as e:
            if not (isinstance(e, NetworkError)):
                raise e
            output = exchange.last_request_body
            request_url = exchange.last_request_url
        try:
            call_output = exchange.safe_value(data, 'output')
            self.assert_static_request_output(exchange, type, skip_keys, data['url'], request_url, call_output, output)
        except Exception as e:
            self.request_tests_failed = True
            error_message = '[' + self.lang + '][STATIC_REQUEST_TEST_FAILURE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + str(e)
            dump(error_message)

    async def test_response_statically(self, exchange, method, skip_keys, data):
        expected_result = exchange.safe_value(data, 'parsedResponse')
        mocked_exchange = set_fetch_response(exchange, data['httpResponse'])
        try:
            unified_result = await call_exchange_method_dynamically(exchange, method, self.sanitize_data_input(data['input']))
            self.assert_static_response_output(mocked_exchange, skip_keys, unified_result, expected_result)
        except Exception as e:
            self.request_tests_failed = True
            error_message = '[' + self.lang + '][STATIC_RESPONSE_TEST_FAILURE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + str(e)
            dump(error_message)
        set_fetch_response(exchange, None)  # reset state

    def init_offline_exchange(self, exchange_name):
        markets = self.load_markets_from_file(exchange_name)
        currencies = self.load_currencies_from_file(exchange_name)
        exchange = init_exchange(exchange_name, {
            'markets': markets,
            'enableRateLimit': False,
            'rateLimit': 1,
            'httpsProxy': 'http://fake:8080',
            'apiKey': 'key',
            'secret': 'secretsecret',
            'password': 'password',
            'uid': 'uid',
            'accounts': [{
    'id': 'myAccount',
}],
            'options': {
                'enableUnifiedAccount': True,
                'enableUnifiedMargin': False,
                'accessToken': 'token',
                'expires': 999999999999999,
                'leverageBrackets': {},
            },
        })
        exchange.currencies = currencies  # not working in python if assigned  in the config dict
        return exchange

    async def test_exchange_request_statically(self, exchange_name, exchange_data, test_name=None):
        # instantiate the exchange and make sure that we sink the requests to avoid an actual request
        exchange = self.init_offline_exchange(exchange_name)
        methods = exchange.safe_value(exchange_data, 'methods', {})
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            for j in range(0, len(results)):
                result = results[j]
                description = exchange.safe_value(result, 'description')
                if (test_name is not None) and (test_name != description):
                    continue
                type = exchange.safe_string(exchange_data, 'outputType')
                skip_keys = exchange.safe_value(exchange_data, 'skipKeys', [])
                await self.test_method_statically(exchange, method, result, type, skip_keys)
        await close(exchange)

    async def test_exchange_response_statically(self, exchange_name, exchange_data, test_name=None):
        exchange = self.init_offline_exchange(exchange_name)
        methods = exchange.safe_value(exchange_data, 'methods', {})
        options = exchange.safe_value(exchange_data, 'options', {})
        exchange.options = exchange.deep_extend(exchange.options, options)  # custom options to be used in the tests
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            for j in range(0, len(results)):
                result = results[j]
                description = exchange.safe_value(result, 'description')
                if (test_name is not None) and (test_name != description):
                    continue
                skip_keys = exchange.safe_value(exchange_data, 'skipKeys', [])
                await self.test_response_statically(exchange, method, skip_keys, result)
        await close(exchange)

    def get_number_of_tests_from_exchange(self, exchange, exchange_data):
        sum = 0
        methods = exchange_data['methods']
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            results_length = len(results)
            sum = exchange.sum(sum, results_length)
        return sum

    async def run_static_request_tests(self, target_exchange=None, test_name=None):
        await self.run_static_tests('request', target_exchange, test_name)

    async def run_static_tests(self, type, target_exchange=None, test_name=None):
        folder = self.root_dir + './ts/src/test/static/' + type + '/'
        static_data = self.load_static_data(folder, target_exchange)
        exchanges = list(static_data.keys())
        exchange = init_exchange('Exchange', {})  # tmp to do the calculations until we have the ast-transpiler transpiling this code
        promises = []
        sum = 0
        if target_exchange:
            dump('Exchange to test: ' + target_exchange)
        if test_name:
            dump('Testing only: ' + test_name)
        for i in range(0, len(exchanges)):
            exchange_name = exchanges[i]
            exchange_data = static_data[exchange_name]
            number_of_tests = self.get_number_of_tests_from_exchange(exchange, exchange_data)
            sum = exchange.sum(sum, number_of_tests)
            if type == 'request':
                promises.append(self.test_exchange_request_statically(exchange_name, exchange_data, test_name))
            else:
                promises.append(self.test_exchange_response_statically(exchange_name, exchange_data, test_name))
        await asyncio.gather(*promises)
        if self.request_tests_failed or self.response_tests_failed:
            exit_script(1)
        else:
            success_message = '[' + self.lang + '][TEST_SUCCESS] ' + str(sum) + ' static ' + type + ' tests passed.'
            dump(success_message)
            exit_script(0)

    async def run_static_response_tests(self, exchange_name=None, test=None):
        #  -----------------------------------------------------------------------------
        #  --- Init of mockResponses tests functions------------------------------------
        #  -----------------------------------------------------------------------------
        await self.run_static_tests('response', exchange_name, test)

    async def run_broker_id_tests(self):
        #  -----------------------------------------------------------------------------
        #  --- Init of brokerId tests functions-----------------------------------------
        #  -----------------------------------------------------------------------------
        promises = [self.test_binance(), self.test_okx(), self.test_cryptocom(), self.test_bybit(), self.test_kucoin(), self.test_kucoinfutures(), self.test_bitget(), self.test_mexc(), self.test_huobi(), self.test_woo(), self.test_bitmart(), self.test_coinex()]
        await asyncio.gather(*promises)
        success_message = '[' + self.lang + '][TEST_SUCCESS] brokerId tests passed.'
        dump(success_message)
        exit_script(0)

    async def test_binance(self):
        binance = self.init_offline_exchange('binance')
        spot_id = 'x-R4BD3S82'
        spot_order_request = None
        try:
            await binance.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = self.urlencoded_to_dict(binance.last_request_body)
        client_order_id = spot_order_request['newClientOrderId']
        assert client_order_id.startswith(spot_id), 'spot clientOrderId does not start with spotId'
        swap_id = 'x-xcKtGhcu'
        swap_order_request = None
        try:
            await binance.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = self.urlencoded_to_dict(binance.last_request_body)
        swap_inverse_order_request = None
        try:
            await binance.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_inverse_order_request = self.urlencoded_to_dict(binance.last_request_body)
        client_order_id_spot = swap_order_request['newClientOrderId']
        assert client_order_id_spot.startswith(swap_id), 'swap clientOrderId does not start with swapId'
        client_order_id_inverse = swap_inverse_order_request['newClientOrderId']
        assert client_order_id_inverse.startswith(swap_id), 'swap clientOrderIdInverse does not start with swapId'
        await close(binance)

    async def test_okx(self):
        okx = self.init_offline_exchange('okx')
        id = 'e847386590ce4dBC'
        spot_order_request = None
        try:
            await okx.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(okx.last_request_body)
        client_order_id = spot_order_request[0]['clOrdId']  # returns order inside array
        assert client_order_id.startswith(id), 'spot clientOrderId does not start with id'
        assert spot_order_request[0]['tag'] == id, 'id different from spot tag'
        swap_order_request = None
        try:
            await okx.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = json_parse(okx.last_request_body)
        client_order_id_spot = swap_order_request[0]['clOrdId']
        assert client_order_id_spot.startswith(id), 'swap clientOrderId does not start with id'
        assert swap_order_request[0]['tag'] == id, 'id different from swap tag'
        await close(okx)

    async def test_cryptocom(self):
        cryptocom = self.init_offline_exchange('cryptocom')
        id = 'CCXT'
        await cryptocom.load_markets()
        request = None
        try:
            await cryptocom.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(cryptocom.last_request_body)
        assert request['params']['broker_id'] == id, 'id different from  broker_id'
        await close(cryptocom)

    async def test_bybit(self):
        bybit = self.init_offline_exchange('bybit')
        req_headers = None
        id = 'CCXT'
        assert bybit.options['brokerId'] == id, 'id not in options'
        try:
            await bybit.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = bybit.last_request_headers
        assert req_headers['Referer'] == id, 'id not in headers'
        await close(bybit)

    async def test_kucoin(self):
        kucoin = self.init_offline_exchange('kucoin')
        req_headers = None
        assert kucoin.options['partner']['spot']['id'] == 'ccxt', 'id not in options'
        assert kucoin.options['partner']['spot']['key'] == '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'key not in options'
        try:
            await kucoin.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = kucoin.last_request_headers
        id = 'ccxt'
        assert req_headers['KC-API-PARTNER'] == id, 'id not in headers'
        await close(kucoin)

    async def test_kucoinfutures(self):
        kucoin = self.init_offline_exchange('kucoinfutures')
        req_headers = None
        id = 'ccxtfutures'
        assert kucoin.options['partner']['future']['id'] == id, 'id not in options'
        assert kucoin.options['partner']['future']['key'] == '1b327198-f30c-4f14-a0ac-918871282f15', 'key not in options'
        try:
            await kucoin.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = kucoin.last_request_headers
        assert req_headers['KC-API-PARTNER'] == id, 'id not in headers'
        await close(kucoin)

    async def test_bitget(self):
        bitget = self.init_offline_exchange('bitget')
        req_headers = None
        id = 'p4sve'
        assert bitget.options['broker'] == id, 'id not in options'
        try:
            await bitget.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = bitget.last_request_headers
        assert req_headers['X-CHANNEL-API-CODE'] == id, 'id not in headers'
        await close(bitget)

    async def test_mexc(self):
        mexc = self.init_offline_exchange('mexc')
        req_headers = None
        id = 'CCXT'
        assert mexc.options['broker'] == id, 'id not in options'
        await mexc.load_markets()
        try:
            await mexc.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = mexc.last_request_headers
        assert req_headers['source'] == id, 'id not in headers'
        await close(mexc)

    async def test_huobi(self):
        huobi = self.init_offline_exchange('huobi')
        # spot test
        id = 'AA03022abc'
        spot_order_request = None
        try:
            await huobi.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(huobi.last_request_body)
        client_order_id = spot_order_request['client-order-id']
        assert client_order_id.startswith(id), 'spot clientOrderId does not start with id'
        # swap test
        swap_order_request = None
        try:
            await huobi.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = json_parse(huobi.last_request_body)
        swap_inverse_order_request = None
        try:
            await huobi.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_inverse_order_request = json_parse(huobi.last_request_body)
        client_order_id_spot = swap_order_request['channel_code']
        assert client_order_id_spot.startswith(id), 'swap channel_code does not start with id'
        client_order_id_inverse = swap_inverse_order_request['channel_code']
        assert client_order_id_inverse.startswith(id), 'swap inverse channel_code does not start with id'
        await close(huobi)

    async def test_woo(self):
        woo = self.init_offline_exchange('woo')
        # spot test
        id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad'
        spot_order_request = None
        try:
            await woo.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = self.urlencoded_to_dict(woo.last_request_body)
        broker_id = spot_order_request['broker_id']
        assert broker_id.startswith(id), 'broker_id does not start with id'
        # swap test
        stop_order_request = None
        try:
            await woo.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, {
                'stopPrice': 30000,
            })
        except Exception as e:
            stop_order_request = json_parse(woo.last_request_body)
        client_order_id_spot = stop_order_request['brokerId']
        assert client_order_id_spot.startswith(id), 'brokerId does not start with id'
        await close(woo)

    async def test_bitmart(self):
        bitmart = self.init_offline_exchange('bitmart')
        req_headers = None
        id = 'CCXTxBitmart000'
        assert bitmart.options['brokerId'] == id, 'id not in options'
        await bitmart.load_markets()
        try:
            await bitmart.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = bitmart.last_request_headers
        assert req_headers['X-BM-BROKER-ID'] == id, 'id not in headers'
        await close(bitmart)

    async def test_coinex(self):
        exchange = self.init_offline_exchange('coinex')
        id = 'x-167673045'
        assert exchange.options['brokerId'] == id, 'id not in options'
        spot_order_request = None
        try:
            await exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(exchange.last_request_body)
        client_order_id = spot_order_request['client_id']
        assert client_order_id.startswith(id), 'clientOrderId does not start with id'
        await close(exchange)

# ***** AUTO-TRANSPILER-END *****
# *******************************


if __name__ == '__main__':
    asyncio.run(testMainClass().init(argv.exchange, argv.symbol))
