# -*- coding: utf-8 -*-

import argparse
import json
# import logging
import os
import sys
from traceback import format_tb, format_exception

import importlib  # noqa: E402
import glob  # noqa: E402
import re

# ------------------------------------------------------------------------------
# logging.basicConfig(level=logging.INFO)
# ------------------------------------------------------------------------------
current_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(root)

import ccxt  # noqa: E402

# ------------------------------------------------------------------------------


class Argv(object):
    idTests = False
    staticTests = False

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

parser.add_argument('--sandbox', action='store_true', help='enable sandbox mode')
parser.add_argument('--privateOnly', action='store_true', help='run private tests only')
parser.add_argument('--private', action='store_true', help='run private tests')
parser.add_argument('--verbose', action='store_true', help='enable verbose output')
parser.add_argument('--info', action='store_true', help='enable info output')
parser.add_argument('--static', action='store_true', help='run static tests')
parser.add_argument('--idTests', action='store_true', help='run brokerId tests')
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


class baseMainTestClass():
    lang = 'PY'
    staticTestsFailed = False
    skippedMethods = {}
    checkedPublicTests = {}
    testFiles = {}
    publicTests = {}
    pass


is_synchronous = 'async' not in os.path.basename(__file__)

rootDir = current_dir + '/../../../'
rootDirForSkips = current_dir + '/../../../'
envVars = os.environ
LOG_CHARS_LENGTH = 10000
ext = 'py'


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


def get_test_name(methodName):
    snake_cased = re.sub(r'(?<!^)(?=[A-Z])', '_', methodName).lower()  # snake_case
    snake_cased = snake_cased.replace('o_h_l_c_v', 'ohlcv')
    full_name = 'test_' + snake_cased
    return full_name


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


def call_method(testFiles, methodName, exchange, skippedProperties, args):
    return getattr(testFiles[methodName], methodName)(exchange, skippedProperties, *args)


def call_exchange_method_dynamically(exchange, methodName, args):
    return getattr(exchange, methodName)(*args)


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


def set_test_files(holderClass, properties):
    skip_tests = ['test_throttle']
    setattr(holderClass, 'testFiles', {})
    syncAsync = 'async' if not is_synchronous else 'sync'
    for file_path in glob.glob(current_dir + '/' + syncAsync + '/test_*.py'):
        name = os.path.basename(file_path)[:-3]
        if not (name in skip_tests):
            imp = importlib.import_module('ccxt.test.' + syncAsync + '.' + name)
            holderClass.testFiles[name] = imp  # getattr(imp, finalName)


def close(exchange):
    if (hasattr(exchange, 'close')):
        exchange.close()

# *********************************
# ***** AUTO-TRANSPILER-START *****
# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code


from typing import Optional
from typing import List
from ccxt.base.errors import NotSupported
from ccxt.base.errors import NetworkError
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import OnMaintenance
from ccxt.base.errors import AuthenticationError


class testMainClass(baseMainTestClass):

    def parse_cli_args(self):
        self.idTests = get_cli_arg_value('--idTests')
        self.staticTests = get_cli_arg_value('--static')
        self.info = get_cli_arg_value('--info')
        self.verbose = get_cli_arg_value('--verbose')
        self.debug = get_cli_arg_value('--debug')
        self.privateTest = get_cli_arg_value('--private')
        self.privateTestOnly = get_cli_arg_value('--privateOnly')
        self.sandbox = get_cli_arg_value('--sandbox')

    def init(self, exchangeId, symbol):
        self.parse_cli_args()
        if self.staticTests:
            self.run_static_tests(exchangeId, symbol)  # symbol here is the testname
            return
        if self.idTests:
            self.run_broker_id_tests()
            return
        symbolStr = symbol is not symbol if None else 'all'
        dump('\nTESTING ', ext, {'exchange': exchangeId, 'symbol': symbolStr}, '\n')
        exchangeArgs = {
            'verbose': self.verbose,
            'debug': self.debug,
            'enableRateLimit': True,
            'timeout': 30000,
        }
        exchange = init_exchange(exchangeId, exchangeArgs)
        self.import_files(exchange)
        self.expand_settings(exchange, symbol)
        self.start_test(exchange, symbol)

    def import_files(self, exchange):
        # exchange tests
        self.testFiles = {}
        properties = list(exchange.has.keys())
        properties.append('loadMarkets')
        set_test_files(self, properties)

    def expand_settings(self, exchange, symbol):
        exchangeId = exchange.id
        keysGlobal = rootDir + 'keys.json'
        keysLocal = rootDir + 'keys.local.json'
        keysGlobalExists = io_file_exists(keysGlobal)
        keysLocalExists = io_file_exists(keysLocal)
        globalSettings = io_file_read(keysGlobal) if keysGlobalExists else {}
        localSettings = io_file_read(keysLocal) if keysLocalExists else {}
        allSettings = exchange.deep_extend(globalSettings, localSettings)
        exchangeSettings = exchange.safe_value(allSettings, exchangeId, {})
        if exchangeSettings:
            settingKeys = list(exchangeSettings.keys())
            for i in range(0, len(settingKeys)):
                key = settingKeys[i]
                if exchangeSettings[key]:
                    finalValue = None
                    if isinstance(exchangeSettings[key], dict):
                        existing = get_exchange_prop(exchange, key, {})
                        finalValue = exchange.deep_extend(existing, exchangeSettings[key])
                    else:
                        finalValue = exchangeSettings[key]
                    set_exchange_prop(exchange, key, finalValue)
        # credentials
        reqCreds = get_exchange_prop(exchange, 're' + 'quiredCredentials')  # dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        objkeys = list(reqCreds.keys())
        for i in range(0, len(objkeys)):
            credential = objkeys[i]
            isRequired = reqCreds[credential]
            if isRequired and get_exchange_prop(exchange, credential) is None:
                fullKey = exchangeId + '_' + credential
                credentialEnvName = fullKey.upper()  # example: KRAKEN_APIKEY
                credentialValue = envVars[credentialEnvName] if (credentialEnvName in envVars) else None
                if credentialValue:
                    set_exchange_prop(exchange, credential, credentialValue)
        # skipped tests
        skippedFile = rootDirForSkips + 'skip-tests.json'
        skippedSettings = io_file_read(skippedFile)
        skippedSettingsForExchange = exchange.safe_value(skippedSettings, exchangeId, {})
        # others
        timeout = exchange.safe_value(skippedSettingsForExchange, 'timeout')
        if timeout is not None:
            exchange.timeout = timeout
        exchange.httpsProxy = exchange.safe_string(skippedSettingsForExchange, 'httpsProxy')
        self.skippedMethods = exchange.safe_value(skippedSettingsForExchange, 'skipMethods', {})
        self.checkedPublicTests = {}

    def add_padding(self, message, size):
        # has to be transpilable
        res = ''
        missingSpace = size - len(message) - 0  # - 0 is added just to trick transpile to treat the .length string for php
        if missingSpace > 0:
            for i in range(0, missingSpace):
                res += ' '
        return message + res

    def test_method(self, methodName, exchange, args, isPublic):
        isLoadMarkets = (methodName == 'loadMarkets')
        methodNameInTest = get_test_name(methodName)
        # if self is a private test, and the implementation was already tested in public, then no need to re-test it in private test(exception is fetchCurrencies, because our approach in base exchange)
        if not isPublic and (methodNameInTest in self.checkedPublicTests) and (methodName != 'fetchCurrencies'):
            return
        skipMessage = None
        if not isLoadMarkets and (not(methodName in exchange.has) or not exchange.has[methodName]):
            skipMessage = '[INFO:UNSUPPORTED_TEST]'  # keep it aligned with the longest message
        elif (methodName in self.skippedMethods) and (isinstance(self.skippedMethods[methodName], str)):
            skipMessage = '[INFO:SKIPPED_TEST]'
        elif not (methodNameInTest in self.testFiles):
            skipMessage = '[INFO:UNIMPLEMENTED_TEST]'
        # exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" need it to be called anyway(but can skip "test.loadMarket" for it)
        if isLoadMarkets:
            exchange.load_markets(True)
        if skipMessage:
            if self.info:
                dump(self.add_padding(skipMessage, 25), exchange.id, methodNameInTest)
            return
        if self.info:
            argsStringified = '(' + ','.join(args) + ')'
            dump(self.add_padding('[INFO:TESTING]', 25), exchange.id, methodNameInTest, argsStringified)
        skippedProperties = exchange.safe_value(self.skippedMethods, methodName, {})
        call_method(self.testFiles, methodNameInTest, exchange, skippedProperties, args)
        # if it was passed successfully, add to the list of successfull tests
        if isPublic:
            self.checkedPublicTests[methodNameInTest] = True

    def test_safe(self, methodName, exchange, args=[], isPublic=False):
        # `testSafe` method does not raise an exception, instead mutes it.
        # The reason we mute the thrown exceptions here is because if self test is part
        # of "runPublicTests", then we don't want to stop the whole test if any single
        # test-method fails. For example, if "fetchOrderBook" public test fails, we still
        # want to run "fetchTickers" and other methods. However, independently self fact,
        # from those test-methods we still echo-out(console.log/print...) the exception
        # messages with specific formatted message "[TEST_FAILURE] ..." and that output is
        # then regex-parsed by run-tests.js, so the exceptions are still printed out to
        # console from there. So, even if some public tests fail, the script will continue
        # doing other things(testing other spot/swap or private tests ...)
        maxRetries = 3
        argsStringified = exchange.json(args)  # args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
        for i in range(0, maxRetries):
            try:
                self.test_method(methodName, exchange, args, isPublic)
                return True
            except Exception as e:
                isAuthError = (isinstance(e, AuthenticationError))
                isNotSupported = (isinstance(e, NotSupported))
                isNetworkError = (isinstance(e, NetworkError))  # includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "isOperationFailed", "InvalidNonce", ...
                isExchangeNotAvailable = (isinstance(e, ExchangeNotAvailable))
                isOnMaintenance = (isinstance(e, OnMaintenance))
                tempFailure = isNetworkError and (not isExchangeNotAvailable or isOnMaintenance)  # we do not mute specifically "ExchangeNotAvailable" excetpion(but its subtype "OnMaintenance" can be muted)
                if tempFailure:
                    # if last retry was gone with same `tempFailure` error, then let's eventually return False
                    if i == maxRetries - 1:
                        dump('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, methodName, argsStringified)
                    else:
                        # wait and retry again
                        exchange.sleep(i * 1000)  # increase wait seconds on every retry
                        continue
                elif isinstance(e, OnMaintenance):
                    # in case of maintenance, skip exchange(don't fail the test)
                    dump('[TEST_WARNING] Exchange is on maintenance', exchange.id)
                # If public test faces authentication error, we don't break(see comments under `testSafe` method)
                elif isPublic and isAuthError:
                    # in case of loadMarkets, it means that "tester"(developer or travis) does not have correct authentication, so it does not have a point to proceed at all
                    if methodName == 'loadMarkets':
                        dump('[TEST_WARNING]', 'Exchange can not be tested, because of authentication problems during loadMarkets', exception_message(e), exchange.id, methodName, argsStringified)
                    if self.info:
                        dump('[TEST_WARNING]', 'Authentication problem for public method', exception_message(e), exchange.id, methodName, argsStringified)
                else:
                    # if not a temporary connectivity issue, then mark test(no need to re-try)
                    if isNotSupported:
                        dump('[NOT_SUPPORTED]', exchange.id, methodName, argsStringified)
                        return True  # why consider not supported failed test?
                    else:
                        dump('[TEST_FAILURE]', exception_message(e), exchange.id, methodName, argsStringified)
                return False

    def run_public_tests(self, exchange, symbol):
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
        isSpot = market['spot']
        if isSpot:
            tests['fetchCurrencies'] = []
        else:
            tests['fetchFundingRates'] = [symbol]
            tests['fetchFundingRate'] = [symbol]
            tests['fetchFundingRateHistory'] = [symbol]
            tests['fetchIndexOHLCV'] = [symbol]
            tests['fetchMarkOHLCV'] = [symbol]
            tests['fetchPremiumIndexOHLCV'] = [symbol]
        self.publicTests = tests
        testNames = list(tests.keys())
        promises = []
        for i in range(0, len(testNames)):
            testName = testNames[i]
            testArgs = tests[testName]
            promises.append(self.test_safe(testName, exchange, testArgs, True))
        # todo - not yet ready in other langs too
        # promises.append(testThrottle())
        results = (promises)
        # now count which test-methods retuned `false` from "testSafe" and dump that info below
        if self.info:
            errors = []
            for i in range(0, len(testNames)):
                if not results[i]:
                    errors.append(testNames[i])
            # we don't raise exception for public-tests, see comments under 'testSafe' method
            errorsInMessage = ''
            if errors:
                failedMsg = ', '.join(errors)
                errorsInMessage = ' | Failed methods : ' + failedMsg
            messageContent = '[INFO:PUBLIC_TESTS_END] ' + market['type'] + errorsInMessage
            messageWithPadding = self.add_padding(messageContent, 25)
            dump(messageWithPadding, exchange.id)

    def load_exchange(self, exchange):
        result = self.test_safe('loadMarkets', exchange, [], True)
        if not result:
            return False
        symbols = [
            'BTC/CNY',
            'BTC/USD',
            'BTC/USDT',
            'BTC/EUR',
            'BTC/ETH',
            'ETH/BTC',
            'BTC/JPY',
            'ETH/EUR',
            'ETH/JPY',
            'ETH/CNY',
            'ETH/USD',
            'LTC/CNY',
            'DASH/BTC',
            'DOGE/BTC',
            'BTC/AUD',
            'BTC/PLN',
            'USD/SLL',
            'BTC/RUB',
            'BTC/UAH',
            'LTC/BTC',
            'EUR/USD',
        ]
        resultSymbols = []
        exchangeSpecificSymbols = exchange.symbols
        for i in range(0, len(exchangeSpecificSymbols)):
            symbol = exchangeSpecificSymbols[i]
            if exchange.in_array(symbol, symbols):
                resultSymbols.append(symbol)
        resultMsg = ''
        resultLength = len(resultSymbols)
        exchangeSymbolsLength = len(exchange.symbols)
        if resultLength > 0:
            if exchangeSymbolsLength > resultLength:
                resultMsg = ', '.join(resultSymbols) + ' + more...'
            else:
                resultMsg = ', '.join(resultSymbols)
        dump('Exchange loaded', exchangeSymbolsLength, 'symbols', resultMsg)
        return True

    def get_test_symbol(self, exchange, isSpot, symbols):
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
        currentTypeMarkets = self.get_markets_from_exchange(exchange, spot)
        codes = [
            'BTC',
            'ETH',
            'XRP',
            'LTC',
            'BCH',
            'EOS',
            'BNB',
            'BSV',
            'USDT',
            'ATOM',
            'BAT',
            'BTG',
            'DASH',
            'DOGE',
            'ETC',
            'IOTA',
            'LSK',
            'MKR',
            'NEO',
            'PAX',
            'QTUM',
            'TRX',
            'TUSD',
            'USD',
            'USDC',
            'WAVES',
            'XEM',
            'XMR',
            'ZEC',
            'ZRX',
        ]
        spotSymbols = [
            'BTC/USD',
            'BTC/USDT',
            'BTC/CNY',
            'BTC/EUR',
            'BTC/ETH',
            'ETH/BTC',
            'ETH/USD',
            'ETH/USDT',
            'BTC/JPY',
            'LTC/BTC',
            'ZRX/WETH',
            'EUR/USD',
        ]
        swapSymbols = [
            'BTC/USDT:USDT',
            'BTC/USD:USD',
            'ETH/USDT:USDT',
            'ETH/USD:USD',
            'LTC/USDT:USDT',
            'DOGE/USDT:USDT',
            'ADA/USDT:USDT',
            'BTC/USD:BTC',
            'ETH/USD:ETH',
        ]
        targetSymbols = spotSymbols if spot else swapSymbols
        symbol = self.get_test_symbol(exchange, spot, targetSymbols)
        # if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
        if symbol is None:
            for i in range(0, len(codes)):
                currentCode = codes[i]
                marketsArrayForCurrentCode = exchange.filter_by(currentTypeMarkets, 'base', currentCode)
                indexedMkts = exchange.index_by(marketsArrayForCurrentCode, 'symbol')
                symbolsArrayForCurrentCode = list(indexedMkts.keys())
                symbolsLength = len(symbolsArrayForCurrentCode)
                if symbolsLength:
                    symbol = self.get_test_symbol(exchange, spot, symbolsArrayForCurrentCode)
                    break
        # if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if symbol is None:
            activeMarkets = exchange.filter_by(currentTypeMarkets, 'active', True)
            activeSymbols = []
            for i in range(0, len(activeMarkets)):
                activeSymbols.append(activeMarkets[i]['symbol'])
            symbol = self.get_test_symbol(exchange, spot, activeSymbols)
        if symbol is None:
            values = list(currentTypeMarkets.values())
            valuesLength = len(values)
            if valuesLength > 0:
                first = values[0]
                if first is not None:
                    symbol = first['symbol']
        return symbol

    def test_exchange(self, exchange, providedSymbol=None):
        spotSymbol = None
        swapSymbol = None
        if providedSymbol is not None:
            market = exchange.market(providedSymbol)
            if market['spot']:
                spotSymbol = providedSymbol
            else:
                swapSymbol = providedSymbol
        else:
            if exchange.has['spot']:
                spotSymbol = self.get_valid_symbol(exchange, True)
            if exchange.has['swap']:
                swapSymbol = self.get_valid_symbol(exchange, False)
        if spotSymbol is not None:
            dump('Selected SPOT SYMBOL:', spotSymbol)
        if swapSymbol is not None:
            dump('Selected SWAP SYMBOL:', swapSymbol)
        if not self.privateTestOnly:
            if exchange.has['spot'] and spotSymbol is not None:
                if self.info:
                    dump('[INFO:SPOT TESTS]')
                exchange.options['type'] = 'spot'
                self.run_public_tests(exchange, spotSymbol)
            if exchange.has['swap'] and swapSymbol is not None:
                if self.info:
                    dump('[INFO:SWAP TESTS]')
                exchange.options['type'] = 'swap'
                self.run_public_tests(exchange, swapSymbol)
        if self.privateTest or self.privateTestOnly:
            if exchange.has['spot'] and spotSymbol is not None:
                exchange.options['defaultType'] = 'spot'
                self.run_private_tests(exchange, spotSymbol)
            if exchange.has['swap'] and swapSymbol is not None:
                exchange.options['defaultType'] = 'swap'
                self.run_private_tests(exchange, swapSymbol)

    def run_private_tests(self, exchange, symbol):
        if not exchange.check_required_credentials(False):
            dump('[Skipping private tests]', 'Keys not found')
            return
        code = self.get_exchange_code(exchange)
        # if exchange.extendedTest:
        #     test('InvalidNonce', exchange, symbol)
        #     test('OrderNotFound', exchange, symbol)
        #     test('InvalidOrder', exchange, symbol)
        #     test('InsufficientFunds', exchange, symbol, balance)  # danger zone - won't execute with non-empty balance
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
            'fetchBorrowRates': [],
            'fetchBorrowRate': [code],
            'fetchBorrowInterest': [code, symbol],
            # 'addMargin': [],
            # 'reduceMargin': [],
            # 'setMargin': [],
            # 'setMarginMode': [],
            # 'setLeverage': [],
            'cancelAllOrders': [symbol],
            # 'cancelOrder': [],
            # 'cancelOrders': [],
            'fetchCanceledOrders': [symbol],
            # 'fetchClosedOrder': [],
            # 'fetchOpenOrder': [],
            # 'fetchOrder': [],
            # 'fetchOrderTrades': [],
            'fetchPosition': [symbol],
            'fetchDeposit': [code],
            'createDepositAddress': [code],
            'fetchDepositAddress': [code],
            'fetchDepositAddresses': [code],
            'fetchDepositAddressesByNetwork': [code],
            # 'editOrder': [],
            'fetchBorrowRateHistory': [code],
            'fetchBorrowRatesPerSymbol': [],
            'fetchLedgerEntry': [code],
            # 'fetchWithdrawal': [],
            # 'transfer': [],
            # 'withdraw': [],
        }
        market = exchange.market(symbol)
        isSpot = market['spot']
        if isSpot:
            tests['fetchCurrencies'] = []
        else:
            # derivatives only
            tests['fetchPositions'] = [symbol]  # self test fetches all positions for 1 symbol
            tests['fetchPosition'] = [symbol]
            tests['fetchPositionRisk'] = [symbol]
            tests['setPositionMode'] = [symbol]
            tests['setMarginMode'] = [symbol]
            tests['fetchOpenInterestHistory'] = [symbol]
            tests['fetchFundingRateHistory'] = [symbol]
            tests['fetchFundingHistory'] = [symbol]
        combinedPublicPrivateTests = exchange.deep_extend(self.publicTests, tests)
        testNames = list(combinedPublicPrivateTests.keys())
        promises = []
        for i in range(0, len(testNames)):
            testName = testNames[i]
            testArgs = combinedPublicPrivateTests[testName]
            promises.append(self.test_safe(testName, exchange, testArgs, False))
        results = (promises)
        errors = []
        for i in range(0, len(testNames)):
            testName = testNames[i]
            success = results[i]
            if not success:
                errors.append(testName)
        errorsCnt = len(errors)  # PHP transpile count($errors)
        if errorsCnt > 0:
            # raise Error('Failed private tests [' + market['type'] + ']: ' + ', '.join(errors))
            dump('[TEST_FAILURE]', 'Failed private tests [' + market['type'] + ']: ' + ', '.join(errors))
        else:
            if self.info:
                dump(self.add_padding('[INFO:PRIVATE_TESTS_DONE]', 25), exchange.id)

    def start_test(self, exchange, symbol):
        # we do not need to test aliases
        if exchange.alias:
            return
        if self.sandbox or get_exchange_prop(exchange, 'sandbox'):
            exchange.set_sandbox_mode(True)
        # because of python-async, we need proper `.close()` handling
        try:
            result = self.load_exchange(exchange)
            if not result:
                close(exchange)
                return
            self.test_exchange(exchange, symbol)
            close(exchange)
        except Exception as e:
            close(exchange)
            raise e

    def assert_static_error(self, cond: bool, message: str, calculatedOutput, storedOutput):
        #  -----------------------------------------------------------------------------
        #  --- Init of static tests functions------------------------------------------
        #  -----------------------------------------------------------------------------
        calculatedString = json_stringify(calculatedOutput)
        outputString = json_stringify(storedOutput)
        errorMessage = message + ' expected ' + outputString + ' received: ' + calculatedString
        assert cond, errorMessage

    def load_markets_from_file(self, id: str):
        # load markets from file
        # to make self test
        # and basically independent from the exchange
        # so we can run it offline
        filename = rootDir + './ts/src/test/static/markets/' + id + '.json'
        content = io_file_read(filename)
        return content

    def load_static_data(self, targetExchange: Optional[str] = None):
        folder = rootDir + './ts/src/test/static/data/'
        result = {}
        if targetExchange:
            # read a single exchange
            result[targetExchange] = io_file_read(folder + targetExchange + '.json')
            return result
        files = io_dir_read(folder)
        for i in range(0, len(files)):
            file = files[i]
            exchangeName = file.replace('.json', '')
            content = io_file_read(folder + file)
            result[exchangeName] = content
        return result

    def remove_hostnamefrom_url(self, url: str):
        if url is None:
            return None
        urlParts = url.split('/')
        res = ''
        for i in range(0, len(urlParts)):
            if i > 2:
                current = urlParts[i]
                if current.find('?') > -1:
                    # handle urls like self: /v1/account/accounts?AccessK
                    currentParts = current.split('?')
                    res += '/'
                    res += currentParts[0]
                    break
                res += '/'
                res += current
        return res

    def urlencoded_to_dict(self, url: str):
        result = {}
        parts = url.split('&')
        for i in range(0, len(parts)):
            part = parts[i]
            keyValue = part.split('=')
            keysLength = len(keyValue)
            if keysLength != 2:
                continue
            key = keyValue[0]
            value = keyValue[1]
            if (value is not None) and ((value.startswith('[')) or (value.startswith('{'))):
                # some exchanges might return something like self: timestamp=1699382693405&batchOrders=[{\"symbol\":\"LTCUSDT\",\"side\":\"BUY\",\"newClientOrderI
                value = json_parse(value)
            result[key] = value
        return result

    def assert_new_and_stored_output(self, exchange, skipKeys: List[str], newOutput, storedOutput):
        if (isinstance(storedOutput, dict)) and (isinstance(newOutput, dict)):
            storedOutputKeys = list(storedOutput.keys())
            newOutputKeys = list(newOutput.keys())
            storedKeysLength = len(storedOutputKeys)
            newKeysLength = len(newOutputKeys)
            self.assert_static_error(storedKeysLength == newKeysLength, 'output length mismatch', storedOutput, newOutput)
            # iterate over the keys
            for i in range(0, len(storedOutputKeys)):
                key = storedOutputKeys[i]
                if exchange.in_array(key, skipKeys):
                    continue
                if not (exchange.in_array(key, newOutputKeys)):
                    self.assert_static_error(False, 'output key missing: ' + key, storedOutput, newOutput)
                storedValue = storedOutput[key]
                newValue = newOutput[key]
                self.assert_new_and_stored_output(exchange, skipKeys, newValue, storedValue)
        elif isinstance(storedOutput, list) and (isinstance(newOutput, list)):
            storedArrayLength = len(storedOutput)
            newArrayLength = len(newOutput)
            self.assert_static_error(storedArrayLength == newArrayLength, 'output length mismatch', storedOutput, newOutput)
            for i in range(0, len(storedOutput)):
                storedItem = storedOutput[i]
                newItem = newOutput[i]
                self.assert_new_and_stored_output(exchange, skipKeys, newItem, storedItem)
        else:
            # built-in types like strings, numbers, booleans
            messageError = 'output value mismatch:' + str(newOutput) + ' != ' + str(storedOutput)
            self.assert_static_error(newOutput == storedOutput, messageError, storedOutput, newOutput)

    def assert_static_output(self, exchange, type: str, skipKeys: List[str], storedUrl: str, requestUrl: str, storedOutput, newOutput):
        if storedUrl != requestUrl:
            # remove the host part from the url
            firstPath = self.remove_hostnamefrom_url(storedUrl)
            secondPath = self.remove_hostnamefrom_url(requestUrl)
            self.assert_static_error(firstPath == secondPath, 'url mismatch', firstPath, secondPath)
        # body(aka storedOutput and newOutput) is not defined and information is in the url
        # example: "https://open-api.bingx.com/openApi/spot/v1/trade/order?quoteOrderQty=5&side=BUY&symbol=LTC-USDT&timestamp=1698777135343&type=MARKET&signature=d55a7e4f7f9dbe56c4004c9f3ab340869d3cb004e2f0b5b861e5fbd1762fd9a0
        if (storedOutput is None) and (newOutput is None):
            if (storedUrl is not None) and (requestUrl is not None):
                storedUrlParts = storedUrl.split('?')
                newUrlParts = requestUrl.split('?')
                storedUrlQuery = exchange.safe_value(storedUrlParts, 1)
                newUrlQuery = exchange.safe_value(newUrlParts, 1)
                if (storedUrlQuery is None) and (newUrlQuery is None):
                    # might be a get request without any query parameters
                    # example: https://api.gateio.ws/api/v4/delivery/usdt/positions
                    return
                storedUrlParams = self.urlencoded_to_dict(storedUrlQuery)
                newUrlParams = self.urlencoded_to_dict(newUrlQuery)
                self.assert_new_and_stored_output(exchange, skipKeys, newUrlParams, storedUrlParams)
                return
        # body is defined
        if type == 'json':
            if isinstance(storedOutput, str):
                storedOutput = json_parse(storedOutput)
            if isinstance(newOutput, str):
                newOutput = json_parse(newOutput)
        elif type == 'urlencoded':
            storedOutput = self.urlencoded_to_dict(storedOutput)
            newOutput = self.urlencoded_to_dict(newOutput)
        self.assert_new_and_stored_output(exchange, skipKeys, newOutput, storedOutput)

    def sanitize_data_input(self, input):
        # remove nulls and replace with unefined instead
        if input is None:
            return None
        newInput = []
        for i in range(0, len(input)):
            current = input[i]
            if current == None:  # noqa: E711
                newInput.append(None)
            else:
                newInput.append(current)
        return newInput

    def test_method_statically(self, exchange, method: str, data: object, type: str, skipKeys: List[str]):
        output = None
        requestUrl = None
        try:
            call_exchange_method_dynamically(exchange, method, self.sanitize_data_input(data['input']))
        except Exception as e:
            if not (isinstance(e, NetworkError)):
                # if it's not a network error, it means our request was not created succesfully
                # so we might have an error in the request creation
                raise e
            output = exchange.last_request_body
            requestUrl = exchange.last_request_url
        try:
            callOutput = exchange.safe_value(data, 'output')
            self.assert_static_output(exchange, type, skipKeys, data['url'], requestUrl, callOutput, output)
        except Exception as e:
            self.staticTestsFailed = True
            errorMessage = '[' + self.lang + '][STATIC_TEST_FAILURE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + str(e)
            dump(errorMessage)

    def init_offline_exchange(self, exchangeName: str):
        markets = self.load_markets_from_file(exchangeName)
        return init_exchange(exchangeName, {'markets': markets, 'rateLimit': 1, 'httpsProxy': 'http://fake:8080', 'apiKey': 'key', 'secret': 'secretsecret', 'password': 'password', 'uid': 'uid', 'accounts': [{'id': 'myAccount'}], 'options': {'enableUnifiedAccount': True, 'enableUnifiedMargin': False, 'accessToken': 'token', 'expires': 999999999999999, 'leverageBrackets': {}}})

    def test_exchange_statically(self, exchangeName: str, exchangeData: object, testName: Optional[str] = None):
        # instantiate the exchange and make sure that we sink the requests to avoid an actual request
        exchange = self.init_offline_exchange(exchangeName)
        methods = exchange.safe_value(exchangeData, 'methods', {})
        methodsNames = list(methods.keys())
        for i in range(0, len(methodsNames)):
            method = methodsNames[i]
            results = methods[method]
            for j in range(0, len(results)):
                result = results[j]
                description = exchange.safe_value(result, 'description')
                if (testName is not None) and (testName != description):
                    continue
                type = exchange.safe_string(exchangeData, 'outputType')
                skipKeys = exchange.safe_value(exchangeData, 'skipKeys', [])
                self.test_method_statically(exchange, method, result, type, skipKeys)
        close(exchange)

    def get_number_of_tests_from_exchange(self, exchange, exchangeData: object):
        sum = 0
        methods = exchangeData['methods']
        methodsNames = list(methods.keys())
        for i in range(0, len(methodsNames)):
            method = methodsNames[i]
            results = methods[method]
            resultsLength = len(results)
            sum = exchange.sum(sum, resultsLength)
        return sum

    def run_static_tests(self, targetExchange: Optional[str] = None, testName: Optional[str] = None):
        staticData = self.load_static_data(targetExchange)
        exchanges = list(staticData.keys())
        exchange = init_exchange('Exchange', {})  # tmp to do the calculations until we have the ast-transpiler transpiling self code
        promises = []
        sum = 0
        if targetExchange:
            dump("Exchange to test: " + targetExchange)
        if testName:
            dump("Testing only: " + testName)
        for i in range(0, len(exchanges)):
            exchangeName = exchanges[i]
            exchangeData = staticData[exchangeName]
            numberOfTests = self.get_number_of_tests_from_exchange(exchange, exchangeData)
            sum = exchange.sum(sum, numberOfTests)
            promises.append(self.test_exchange_statically(exchangeName, exchangeData, testName))
        (promises)
        if self.staticTestsFailed:
            exit_script(1)
        else:
            successMessage = '[' + self.lang + '][TEST_SUCCESS] ' + str(sum) + ' static tests passed.'
            dump(successMessage)
            exit_script(0)

    def run_broker_id_tests(self):
        #  -----------------------------------------------------------------------------
        #  --- Init of brokerId tests functions-----------------------------------------
        #  -----------------------------------------------------------------------------
        promises = [
            self.test_binance(),
            self.test_okx(),
            self.test_cryptocom(),
            self.test_bybit(),
            self.test_kucoin(),
            self.test_kucoinfutures(),
            self.test_bitget(),
            self.test_mexc(),
            self.test_huobi(),
            self.test_woo()
        ]
        (promises)
        successMessage = '[' + self.lang + '][TEST_SUCCESS] brokerId tests passed.'
        dump(successMessage)
        exit_script(0)

    def test_binance(self):
        binance = self.init_offline_exchange('binance')
        spotId = 'x-R4BD3S82'
        spotOrderRequest = None
        try:
            binance.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spotOrderRequest = self.urlencoded_to_dict(binance.last_request_body)
        clientOrderId = spotOrderRequest['newClientOrderId']
        assert clientOrderId.startswith(spotId), 'spot clientOrderId does not start with spotId'
        swapId = 'x-xcKtGhcu'
        swapOrderRequest = None
        try:
            binance.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swapOrderRequest = self.urlencoded_to_dict(binance.last_request_body)
        swapInverseOrderRequest = None
        try:
            binance.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swapInverseOrderRequest = self.urlencoded_to_dict(binance.last_request_body)
        clientOrderIdSpot = swapOrderRequest['newClientOrderId']
        assert clientOrderIdSpot.startswith(swapId), 'swap clientOrderId does not start with swapId'
        clientOrderIdInverse = swapInverseOrderRequest['newClientOrderId']
        assert clientOrderIdInverse.startswith(swapId), 'swap clientOrderIdInverse does not start with swapId'
        close(binance)

    def test_okx(self):
        okx = self.init_offline_exchange('okx')
        id = 'e847386590ce4dBC'
        spotOrderRequest = None
        try:
            okx.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spotOrderRequest = json_parse(okx.last_request_body)
        clientOrderId = spotOrderRequest[0]['clOrdId']  # returns order inside array
        assert clientOrderId.startswith(id), 'spot clientOrderId does not start with id'
        assert spotOrderRequest[0]['tag'] == id, 'id different from spot tag'
        swapOrderRequest = None
        try:
            okx.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swapOrderRequest = json_parse(okx.last_request_body)
        clientOrderIdSpot = swapOrderRequest[0]['clOrdId']
        assert clientOrderIdSpot.startswith(id), 'swap clientOrderId does not start with id'
        assert swapOrderRequest[0]['tag'] == id, 'id different from swap tag'
        close(okx)

    def test_cryptocom(self):
        cryptocom = self.init_offline_exchange('cryptocom')
        id = 'CCXT'
        cryptocom.load_markets()
        request = None
        try:
            cryptocom.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(cryptocom.last_request_body)
        assert request['params']['broker_id'] == id, 'id different from  broker_id'
        close(cryptocom)

    def test_bybit(self):
        bybit = self.init_offline_exchange('bybit')
        reqHeaders = None
        id = 'CCXT'
        assert bybit.options['brokerId'] == id, 'id not in options'
        try:
            bybit.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            reqHeaders = bybit.last_request_headers
        assert reqHeaders['Referer'] == id, 'id not in headers'
        close(bybit)

    def test_kucoin(self):
        kucoin = self.init_offline_exchange('kucoin')
        reqHeaders = None
        assert kucoin.options['partner']['spot']['id'] == 'ccxt', 'id not in options'
        assert kucoin.options['partner']['spot']['key'] == '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'key not in options'
        try:
            kucoin.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            reqHeaders = kucoin.last_request_headers
        id = 'ccxt'
        assert reqHeaders['KC-API-PARTNER'] == id, 'id not in headers'
        close(kucoin)

    def test_kucoinfutures(self):
        kucoin = self.init_offline_exchange('kucoinfutures')
        reqHeaders = None
        id = 'ccxtfutures'
        assert kucoin.options['partner']['future']['id'] == id, 'id not in options'
        assert kucoin.options['partner']['future']['key'] == '1b327198-f30c-4f14-a0ac-918871282f15', 'key not in options'
        try:
            kucoin.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            reqHeaders = kucoin.last_request_headers
        assert reqHeaders['KC-API-PARTNER'] == id, 'id not in headers'
        close(kucoin)

    def test_bitget(self):
        bitget = self.init_offline_exchange('bitget')
        reqHeaders = None
        id = 'p4sve'
        assert bitget.options['broker'] == id, 'id not in options'
        try:
            bitget.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            reqHeaders = bitget.last_request_headers
        assert reqHeaders['X-CHANNEL-API-CODE'] == id, 'id not in headers'
        close(bitget)

    def test_mexc(self):
        mexc = self.init_offline_exchange('mexc')
        reqHeaders = None
        id = 'CCXT'
        assert mexc.options['broker'] == id, 'id not in options'
        mexc.load_markets()
        try:
            mexc.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            reqHeaders = mexc.last_request_headers
        assert reqHeaders['source'] == id, 'id not in headers'
        close(mexc)

    def test_huobi(self):
        huobi = self.init_offline_exchange('huobi')
        # spot test
        id = 'AA03022abc'
        spotOrderRequest = None
        try:
            huobi.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spotOrderRequest = json_parse(huobi.last_request_body)
        clientOrderId = spotOrderRequest['client-order-id']
        assert clientOrderId.startswith(id), 'spot clientOrderId does not start with id'
        # swap test
        swapOrderRequest = None
        try:
            huobi.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swapOrderRequest = json_parse(huobi.last_request_body)
        swapInverseOrderRequest = None
        try:
            huobi.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swapInverseOrderRequest = json_parse(huobi.last_request_body)
        clientOrderIdSpot = swapOrderRequest['channel_code']
        assert clientOrderIdSpot.startswith(id), 'swap channel_code does not start with id'
        clientOrderIdInverse = swapInverseOrderRequest['channel_code']
        assert clientOrderIdInverse.startswith(id), 'swap inverse channel_code does not start with id'
        close(huobi)

    def test_woo(self):
        woo = self.init_offline_exchange('woo')
        # spot test
        id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad'
        spotOrderRequest = None
        try:
            woo.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spotOrderRequest = self.urlencoded_to_dict(woo.last_request_body)
        brokerId = spotOrderRequest['broker_id']
        assert brokerId.startswith(id), 'broker_id does not start with id'
        # swap test
        stopOrderRequest = None
        try:
            woo.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, {'stopPrice': 30000})
        except Exception as e:
            stopOrderRequest = json_parse(woo.last_request_body)
        clientOrderIdSpot = stopOrderRequest['brokerId']
        assert clientOrderIdSpot.startswith(id), 'brokerId does not start with id'
        close(woo)

# ***** AUTO-TRANSPILER-END *****
# *******************************


if __name__ == '__main__':
    (testMainClass().init(argv.exchange, argv.symbol))
