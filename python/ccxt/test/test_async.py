# -*- coding: utf-8 -*-

import argparse
import json
# import logging
import os
import sys
import time  # noqa: F401
from traceback import format_tb

# ------------------------------------------------------------------------------
# logging.basicConfig(level=logging.INFO)
# ------------------------------------------------------------------------------
current_dir = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(current_dir))
sys.path.append(root)

import ccxt.async_support as ccxt  # noqa: E402

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
parser.add_argument('--nonce', type=int, help='integer')
parser.add_argument('exchange', type=str, help='exchange id in lowercase', nargs='?')
parser.add_argument('symbol', type=str, help='symbol in uppercase', nargs='?')
parser.parse_args(namespace=argv)
token_bucket = argv.token_bucket
sandbox = argv.sandbox
privateOnly = argv.privateOnly
privateTest = argv.private
verbose = argv.verbose
nonce = argv.nonce
exchangeName = argv.exchange
exchangeSymbol = argv.symbol
info = argv.info

print('\nTESTING (PY)', {'exchange': exchangeName, 'symbol': exchangeSymbol or 'all'}, '\n')

exchange = getattr(ccxt, exchangeName)({'verbose': verbose})

# ------------------------------------------------------------------------------

path = os.path.dirname(ccxt.__file__)
if 'site-packages' in os.path.dirname(ccxt.__file__):
    raise Exception("You are running test_async.py/test.py against a globally-installed version of the library! It was previously installed into your site-packages folder by pip or pip3. To ensure testing against the local folder uninstall it first with pip uninstall ccxt or pip3 uninstall ccxt")

# ------------------------------------------------------------------------------

# this logic is being transpiled from async->sync python, so the below variable tells runtime whether async or sync tests are being run
# to trick transpiler regexes, we have to: A) divide "token" and "bucket"; B)dont use word "a s y n c" together in the code
is_asynchronous = ('token_' + 'bucket') in locals()

skip_tests = ['test_throttle']

import importlib  # noqa: E402
import glob  # noqa: E402
testFiles = {}
if is_asynchronous:
    for file_path in glob.glob(current_dir + '/async/test_*.py'):
        name = os.path.basename(file_path)[:-3]
        if not (name in skip_tests):
            imp = importlib.import_module('ccxt.test.async.' + name)
            testFiles[name] = imp  # getattr(imp, finalName)
else:
    for file_path in glob.glob(current_dir + '/sync/test_*.py'):
        name = os.path.basename(file_path)[:-3]
        if not (name in skip_tests):
            imp = importlib.import_module('ccxt.test.sync.' + name)
            testFiles[name] = imp  # getattr(imp, finalName)


# print a colored string
def dump(*args):
    print(' '.join([str(arg) for arg in args]))


# print an error string
def dump_error(*args):
    string = ' '.join([str(arg) for arg in args])
    print(string)
    sys.stderr.write(string + "\n")
    sys.stderr.flush()


Error = Exception
# ------------------------------------------------------------------------------


def handle_all_unhandled_exceptions(type, value, traceback):
    dump((type), (value), '\n\n' + ('\n'.join(format_tb(traceback))))
    exit(1)  # unrecoverable crash


sys.excepthook = handle_all_unhandled_exceptions

# ------------------------------------------------------------------------------

# non-transpiled commons
import re


def get_test_name(methodName):
    snake_cased = re.sub(r'(?<!^)(?=[A-Z])', '_', methodName).lower()
    snake_cased = snake_cased.replace('o_h_l_c_v', 'ohlcv')
    full_name = 'test_' + snake_cased
    return full_name


rootDir = current_dir + '/../../'
envVars = os.environ


class baseMainTestClass():
    pass


def io_file_exists(path):
    return os.path.isfile(path)


def io_file_read(path, decode=True):
    fs = open(path, "r")
    content = fs.read()
    if decode:
        return json.loads(content)
    else:
        return content


def exception_message(exc):
    return '[' + type(exc).__name__ + '] ' + str(exc)[0:200]


async def call_method(methodName, exchange, args):
    return await getattr(testFiles[methodName], methodName)(exchange, *args)


def add_proxy_or_agent(exchange, http_proxy):
    # just add a simple redirect through proxy
    exchange.proxy = http_proxy


def exit_script():
    exit()


def get_exchange_prop(exchange, prop, defaultValue=None):
    return getattr(exchange, prop) if hasattr(exchange, prop) else defaultValue


def set_exchange_prop(exchange, prop, value):
    setattr(exchange, prop, value)


async def test_throttle():
    importlib.import_module(current_dir + '/test_throttle.py')
# *********************************
# ***** AUTO-TRANSPILER-START *****
# -*- coding: utf-8 -*-

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code


import asyncio
from ccxt.base.errors import AuthenticationError


class testMainClass(baseMainTestClass):

    async def init(self, exchange, symbol):
        self.expand_settings(exchange, symbol)
        await self.start_test(exchange, symbol)

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
                    existing = get_exchange_prop(exchange, key, {})
                    set_exchange_prop(exchange, key, exchange.deep_extend(existing, exchangeSettings[key]))
            # support simple proxy
            proxy = get_exchange_prop(exchange, 'httpProxy')
            if proxy:
                addProxyOrAgent(exchange, proxy)
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
        skippedFile = rootDir + 'skip-tests.json'
        skippedSettings = io_file_read(skippedFile)
        skippedSettingsForExchange = exchange.safe_value(skippedSettings, exchangeId, {})
        # others
        if exchange.safe_value(skippedSettingsForExchange, 'skip'):
            dump('[SKIPPED]', 'exchange', exchangeId, 'symbol', symbol)
            exit_script()
        if exchange.alias:
            dump('[SKIPPED] Alias exchange. ', 'exchange', exchangeId, 'symbol', symbol)
            exit_script()
        #
        self.skippedMethods = exchange.safe_value(skippedSettingsForExchange, 'skipMethods', {})
        self.checkedPublicTests = {}

    def pad_end(self, message, size):
        # has to be transpilable
        res = ''
        missingSpace = size - len(message)
        if missingSpace > 0:
            for i in range(0, missingSpace):
                res += ' '
        return message + res

    async def test_method(self, methodName, exchange, args, isPublic):
        methodNameInTest = get_test_name(methodName)
        # if self is a private test, and the implementation was already tested in public, then no need to re-test it in private test(exception is fetchCurrencies, because our approach in exchange)
        if not isPublic and (methodNameInTest in self.checkedPublicTests) and (methodName != 'fetchCurrencies'):
            return
        skipMessage = None
        if (methodName != 'loadMarkets') and (not(methodName in exchange.has) or not exchange.has[methodName]):
            skipMessage = '[INFO:UNSUPPORTED_TEST]'  # keep it aligned with the longest message
        elif methodName in self.skippedMethods:
            skipMessage = '[INFO:SKIPPED_TEST]'
        elif not (methodNameInTest in testFiles):
            skipMessage = '[INFO:UNIMPLEMENTED_TEST]'
        if skipMessage and info:
            dump(self.pad_end(skipMessage, 25), exchange.id, methodNameInTest)
            return
        argsStringified = '(' + ','.join(args) + ')'
        if info:
            dump(self.pad_end('[INFO:TESTING]', 25), exchange.id, methodNameInTest, argsStringified)
        result = None
        try:
            result = await call_method(methodNameInTest, exchange, args)
            if isPublic:
                self.checkedPublicTests[methodNameInTest] = True
        except Exception as e:
            isAuthError = (isinstance(e, AuthenticationError))
            if not (isPublic and isAuthError):
                dump('ERROR:', exception_message(e), ' | Exception from: ', exchange.id, methodNameInTest, argsStringified)
                raise e
        return result

    async def test_safe(self, methodName, exchange, args, isPublic):
        try:
            await self.test_method(methodName, exchange, args, isPublic)
            return True
        except Exception as e:
            return False

    async def run_public_tests(self, exchange, symbol):
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
        # promises.append(test_throttle())
        await asyncio.gather(*promises)

    async def load_exchange(self, exchange):
        markets = await exchange.load_markets()
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
            if exchange.inArray(symbol, symbols):
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
                if len(symbolsArrayForCurrentCode):
                    symbol = self.get_test_symbol(exchange, spot, symbolsArrayForCurrentCode)
                    break
        # if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if symbol is None:
            activeMarkets = exchange.filter_by(currentTypeMarkets, 'active', True)
            activeSymbols = list(activeMarkets.keys())
            symbol = self.get_test_symbol(exchange, spot, activeSymbols)
        if symbol is None:
            values = list(currentTypeMarkets.values())
            first = values[0]
            if first is not None:
                symbol = first['symbol']
        return symbol

    async def test_exchange(self, exchange, providedSymbol=None):
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
        if not privateOnly:
            if exchange.has['spot'] and spotSymbol is not None:
                exchange.options['type'] = 'spot'
                await self.run_public_tests(exchange, spotSymbol)
            if exchange.has['swap'] and swapSymbol is not None:
                exchange.options['type'] = 'swap'
                await self.run_public_tests(exchange, swapSymbol)
        if privateTest or privateOnly:
            if exchange.has['spot'] and spotSymbol is not None:
                exchange.options['defaultType'] = 'spot'
                await self.run_private_tests(exchange, spotSymbol)
            if exchange.has['swap'] and swapSymbol is not None:
                exchange.options['defaultType'] = 'swap'
                await self.run_private_tests(exchange, swapSymbol)

    async def run_private_tests(self, exchange, symbol):
        if not exchange.check_required_credentials(False):
            dump('[Skipping private tests]', 'Keys not found')
            return
        code = self.get_exchange_code(exchange)
        # if exchange.extendedTest:
        #     await test('InvalidNonce', exchange, symbol)
        #     await test('OrderNotFound', exchange, symbol)
        #     await test('InvalidOrder', exchange, symbol)
        #     await test('InsufficientFunds', exchange, symbol, balance)  # danger zone - won't execute with non-empty balance
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
        results = await asyncio.gather(*promises)
        errors = []
        for i in range(0, len(testNames)):
            testName = testNames[i]
            success = results[i]
            if not success:
                errors.append(testName)
        if len(errors) > 0:
            raise Error('Failed private tests [' + market['type'] + ']: ' + ', '.join(errors))

    async def start_test(self, exchange, symbol):
        # we don't need to test aliases
        if exchange.alias:
            return
        if sandbox or get_exchange_prop(exchange, 'sandbox'):
            exchange.set_sandbox_mode(True)
        await self.load_exchange(exchange)
        await self.test_exchange(exchange, symbol)

# ***** AUTO-TRANSPILER-END *****
# *******************************


if __name__ == '__main__':
    asyncio.run(testMainClass().init(exchange, exchangeSymbol))
