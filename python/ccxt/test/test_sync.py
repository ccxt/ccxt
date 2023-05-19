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
httpsAgent = None


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


def add_proxy(exchange, http_proxy):
    # just add a simple redirect through proxy
    exchange.aiohttp_proxy = http_proxy  # todo: needs to be same a js/php with redirect proxy prop


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
            'httpsAgent': httpsAgent,
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
        skipReason = exchange.safe_value(skippedSettingsForExchange, 'skip')
        timeout = exchange.safe_value(skippedSettingsForExchange, 'timeout')
        if timeout is not None:
            exchange.timeout = timeout
        if skipReason is not None:
            dump('[SKIPPED] exchange', exchangeId, skipReason)
            exit_script()
        if exchange.alias:
            dump('[SKIPPED] Alias exchange. ', 'exchange', exchangeId, 'symbol', symbol)
            exit_script()
        proxy = exchange.safe_string(skippedSettingsForExchange, 'httpProxy')
        if proxy is not None:
            add_proxy(exchange, proxy)
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
        methodNameInTest = get_test_name(methodName)
        # if self is a private test, and the implementation was already tested in public, then no need to re-test it in private test(exception is fetchCurrencies, because our approach in base exchange)
        if not isPublic and (methodNameInTest in self.checkedPublicTests) and (methodName != 'fetchCurrencies'):
            return
        skipMessage = None
        isFetchOhlcvEmulated = (methodName == 'fetchOHLCV' and exchange.has['fetchOHLCV'] == 'emulated')  # todo: remove emulation from base
        if (methodName != 'loadMarkets') and (not(methodName in exchange.has) or not exchange.has[methodName]) or isFetchOhlcvEmulated:
            skipMessage = '[INFO:UNSUPPORTED_TEST]'  # keep it aligned with the longest message
        elif (methodName in self.skippedMethods) and (isinstance(self.skippedMethods[methodName], str)):
            skipMessage = '[INFO:SKIPPED_TEST]'
        elif not (methodNameInTest in self.testFiles):
            skipMessage = '[INFO:UNIMPLEMENTED_TEST]'
        if skipMessage:
            if self.info:
                dump(self.add_padding(skipMessage, 25), exchange.id, methodNameInTest)
            return
        argsStringified = '(' + ','.join(args) + ')'
        if self.info:
            dump(self.add_padding('[INFO:TESTING]', 25), exchange.id, methodNameInTest, argsStringified)
        result = None
        try:
            skippedProperties = exchange.safe_value(self.skippedMethods, methodName, {})
            result = call_method(self.testFiles, methodNameInTest, exchange, skippedProperties, args)
            if isPublic:
                self.checkedPublicTests[methodNameInTest] = True
        except Exception as e:
            isAuthError = (isinstance(e, AuthenticationError))
            if not (isPublic and isAuthError):
                dump('[TEST_FAILURE]', exception_message(e), ' | Exception from: ', exchange.id, methodNameInTest, argsStringified)
                raise e
        return result

    def test_safe(self, methodName, exchange, args, isPublic):
        try:
            self.test_method(methodName, exchange, args, isPublic)
            return True
        except Exception as e:
            return False

    def run_public_tests(self, exchange, symbol):
        tests = {
            'loadMarkets': [],
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
        (promises)
        if self.info:
            dump(self.add_padding('[INFO:PUBLIC_TESTS_DONE]', 25), exchange.id)

    def load_exchange(self, exchange):
        exchange.load_markets()
        assert isinstance(exchange.markets, dict), '.markets is not an object'
        assert isinstance(exchange.symbols, list), '.symbols is not an array'
        symbolsLength = len(exchange.symbols)
        marketKeys = list(exchange.markets.keys())
        marketKeysLength = len(marketKeys)
        assert symbolsLength > 0, '.symbols count <= 0(less than or equal to zero)'
        assert marketKeysLength > 0, '.markets objects keys length <= 0(less than or equal to zero)'
        assert symbolsLength == marketKeysLength, 'number of .symbols is not equal to the number of .markets'
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
            'signIn': [exchange],
            'fetchBalance': [exchange],
            'fetchAccounts': [exchange],
            'fetchTransactionFees': [exchange],
            'fetchTradingFees': [exchange],
            'fetchStatus': [exchange],
            'fetchOrders': [exchange, symbol],
            'fetchOpenOrders': [exchange, symbol],
            'fetchClosedOrders': [exchange, symbol],
            'fetchMyTrades': [exchange, symbol],
            'fetchLeverageTiers': [exchange, symbol],
            'fetchLedger': [exchange, code],
            'fetchTransactions': [exchange, code],
            'fetchDeposits': [exchange, code],
            'fetchWithdrawals': [exchange, code],
            'fetchBorrowRates': [exchange, code],
            'fetchBorrowRate': [exchange, code],
            'fetchBorrowInterest': [exchange, code, symbol],
            'addMargin': [exchange, symbol],
            'reduceMargin': [exchange, symbol],
            'setMargin': [exchange, symbol],
            'setMarginMode': [exchange, symbol],
            'setLeverage': [exchange, symbol],
            'cancelAllOrders': [exchange, symbol],
            'cancelOrder': [exchange, symbol],
            'cancelOrders': [exchange, symbol],
            'fetchCanceledOrders': [exchange, symbol],
            'fetchClosedOrder': [exchange, symbol],
            'fetchOpenOrder': [exchange, symbol],
            'fetchOrder': [exchange, symbol],
            'fetchOrderTrades': [exchange, symbol],
            'fetchPosition': [exchange, symbol],
            'fetchDeposit': [exchange, code],
            'createDepositAddress': [exchange, code],
            'fetchDepositAddress': [exchange, code],
            'fetchDepositAddresses': [exchange, code],
            'fetchDepositAddressesByNetwork': [exchange, code],
            'editOrder': [exchange, symbol],
            'fetchBorrowRateHistory': [exchange, symbol],
            'fetchBorrowRatesPerSymbol': [exchange, symbol],
            'fetchLedgerEntry': [exchange, code],
            'fetchWithdrawal': [exchange, code],
            'transfer': [exchange, code],
            'withdraw': [exchange, code],
        }
        market = exchange.market(symbol)
        isSpot = market['spot']
        if isSpot:
            tests['fetchCurrencies'] = [exchange, symbol]
        else:
            # derivatives only
            tests['fetchPositions'] = [exchange, [symbol]]
            tests['fetchPosition'] = [exchange, symbol]
            tests['fetchPositionRisk'] = [exchange, symbol]
            tests['setPositionMode'] = [exchange, symbol]
            tests['setMarginMode'] = [exchange, symbol]
            tests['fetchOpenInterestHistory'] = [exchange, symbol]
            tests['fetchFundingRateHistory'] = [exchange, symbol]
            tests['fetchFundingHistory'] = [exchange, symbol]
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
        if len(errors) > 0:
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
