# -*- coding: utf-8 -*-

import argparse
import json
# import logging
import os
import sys
import time  # noqa: F401
from traceback import format_tb

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
    dump((type), (value), '\n\n' + ('\n'.join(format_tb(traceback))))
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions
# ------------------------------------------------------------------------------

# non-transpiled part, but shared names among langs


class baseMainTestClass():
    pass


is_synchronous = 'async' not in os.path.basename(__file__)

rootDir = current_dir + '/../../../'
rootDirForSkips = current_dir + '/../../../'
envVars = os.environ
ext = 'py'


def dump(*args):
    print(' '.join([str(arg) for arg in args]))


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


def call_method(testFiles, methodName, exchange, skippedProperties, args):
    return getattr(testFiles[methodName], methodName)(exchange, skippedProperties, *args)


def exception_message(exc):
    return '[' + type(exc).__name__ + '] ' + str(exc)[0:500]


def exit_script():
    exit(0)


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


from ccxt.base.errors import NetworkError
from ccxt.base.errors import DDoSProtection
from ccxt.base.errors import RateLimitExceeded
from ccxt.base.errors import ExchangeNotAvailable
from ccxt.base.errors import OnMaintenance
from ccxt.base.errors import RequestTimeout
from ccxt.base.errors import AuthenticationError


class testMainClass(baseMainTestClass):

    def parse_cli_args(self):
        self.info = get_cli_arg_value('--info')
        self.verbose = get_cli_arg_value('--verbose')
        self.debug = get_cli_arg_value('--debug')
        self.privateTest = get_cli_arg_value('--private')
        self.privateTestOnly = get_cli_arg_value('--privateOnly')
        self.sandbox = get_cli_arg_value('--sandbox')

    def init(self, exchangeId, symbol):
        self.parse_cli_args()
        symbolStr = symbol is not symbol if None else 'all'
        print('\nTESTING ', ext, {'exchange': exchangeId, 'symbol': symbolStr}, '\n')
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
        close(exchange)

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
        isFetchOhlcvEmulated = (methodName == 'fetchOHLCV' and exchange.has['fetchOHLCV'] == 'emulated')  # todo: remove emulation from base
        if not isLoadMarkets and (not(methodName in exchange.has) or not exchange.has[methodName]) or isFetchOhlcvEmulated:
            skipMessage = '[INFO:UNSUPPORTED_TEST]'  # keep it aligned with the longest message
        elif (methodName in self.skippedMethods) and (isinstance(self.skippedMethods[methodName], str)):
            skipMessage = '[INFO:SKIPPED_TEST]'
        elif not (methodNameInTest in self.testFiles):
            skipMessage = '[INFO:UNIMPLEMENTED_TEST]'
        argsStringified = '(' + ','.join(args) + ')'
        try:
            # exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" need it to be called anyway(but can skip "test.loadMarket" for it)
            if isLoadMarkets:
                exchange.load_markets()
            if skipMessage:
                if self.info:
                    dump(self.add_padding(skipMessage, 25), exchange.id, methodNameInTest)
                return
            if self.info:
                dump(self.add_padding('[INFO:TESTING]', 25), exchange.id, methodNameInTest, argsStringified)
            skippedProperties = exchange.safe_value(self.skippedMethods, methodName, {})
            call_method(self.testFiles, methodNameInTest, exchange, skippedProperties, args)
            if isPublic:
                self.checkedPublicTests[methodNameInTest] = True
        except Exception as e:
            isAuthError = (isinstance(e, AuthenticationError))
            # If public test faces authentication error, we don't break(see comments under `testSafe` method)
            if isPublic and isAuthError:
                if self.info:
                    dump('[TEST_WARNING]', 'Authentication problem for public method', exception_message(e), exchange.id, methodNameInTest, argsStringified)
            else:
                raise e

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
        argsStringified = '(' + ','.join(args) + ')'
        for i in range(0, maxRetries):
            try:
                self.test_method(methodName, exchange, args, isPublic)
                return True
            except Exception as e:
                isRateLimitExceeded = (isinstance(e, RateLimitExceeded))
                isExchangeNotAvailable = (isinstance(e, ExchangeNotAvailable))
                isNetworkError = (isinstance(e, NetworkError))
                isDDoSProtection = (isinstance(e, DDoSProtection))
                isRequestTimeout = (isinstance(e, RequestTimeout))
                tempFailure = (isRateLimitExceeded or isExchangeNotAvailable or isNetworkError or isDDoSProtection or isRequestTimeout)
                if tempFailure:
                    # wait and retry again
                    exchange.sleep(i * 1000)  # increase wait seconds on every retry
                    # if last retry was gone with same `tempFailure` error, then let's eventually return False
                    if i == maxRetries - 1:
                        dump('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, methodName, argsStringified)
                        if methodName == 'loadMarkets':
                            # in case of loadMarkets, we completely stop test for current exchange
                            exit_script()
                        return False
                    continue
                elif isinstance(e, OnMaintenance):
                    # in case of maintenance, skip exchange(don't fail the test)
                    dump('[TEST_WARNING] Exchange is on maintenance', exchange.id)
                    exit_script()
                else:
                    # if not a temporary connectivity issue, then mark test(no need to re-try)
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
            failedMsg = ''
            if len(errors):
                failedMsg = ' | Failed methods: ' + ', '.join(errors)
            dump(self.add_padding('[INFO:PUBLIC_TESTS_END] ' + market['type'] + failedMsg, 25), exchange.id)

    def load_exchange(self, exchange):
        self.test_safe('loadMarkets', exchange, [], True)
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
            'fetchLeverageTiers': [symbol],
            'fetchLedger': [code],
            'fetchTransactions': [code],
            'fetchDeposits': [code],
            'fetchWithdrawals': [code],
            'fetchBorrowRates': [code],
            'fetchBorrowRate': [code],
            'fetchBorrowInterest': [code, symbol],
            'addMargin': [symbol],
            'reduceMargin': [symbol],
            'setMargin': [symbol],
            'setMarginMode': [symbol],
            'setLeverage': [symbol],
            'cancelAllOrders': [symbol],
            'cancelOrder': [symbol],
            'cancelOrders': [symbol],
            'fetchCanceledOrders': [symbol],
            'fetchClosedOrder': [symbol],
            'fetchOpenOrder': [symbol],
            'fetchOrder': [symbol],
            'fetchOrderTrades': [symbol],
            'fetchPosition': [symbol],
            'fetchDeposit': [code],
            'createDepositAddress': [code],
            'fetchDepositAddress': [code],
            'fetchDepositAddresses': [code],
            'fetchDepositAddressesByNetwork': [code],
            'editOrder': [symbol],
            'fetchBorrowRateHistory': [symbol],
            'fetchBorrowRatesPerSymbol': [symbol],
            'fetchLedgerEntry': [code],
            'fetchWithdrawal': [code],
            'transfer': [code],
            'withdraw': [code],
        }
        market = exchange.market(symbol)
        isSpot = market['spot']
        if isSpot:
            tests['fetchCurrencies'] = [symbol]
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
            raise Error('Failed private tests [' + market['type'] + ']: ' + ', '.join(errors))
        else:
            if self.info:
                dump(self.add_padding('[INFO:PRIVATE_TESTS_DONE]', 25), exchange.id)

    def start_test(self, exchange, symbol):
        # we don't need to test aliases
        if exchange.alias:
            return
        if self.sandbox or get_exchange_prop(exchange, 'sandbox'):
            exchange.set_sandbox_mode(True)
        self.load_exchange(exchange)
        self.test_exchange(exchange, symbol)

# ***** AUTO-TRANSPILER-END *****
# *******************************


if __name__ == '__main__':
    (testMainClass().init(argv.exchange, argv.symbol))
