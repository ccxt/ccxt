# -*- coding: utf-8 -*-

from tests_helpers import AuthenticationError, NotSupported, InvalidProxySettings, ExchangeNotAvailable, OperationFailed, OnMaintenance, get_cli_arg_value, get_root_dir, is_sync, dump, json_parse, json_stringify, convert_ascii, io_file_exists, io_file_read, io_dir_read, call_method, call_method_sync, call_exchange_method_dynamically, call_exchange_method_dynamically_sync, get_root_exception, exception_message, exit_script, get_exchange_prop, set_exchange_prop, init_exchange, get_test_files_sync, get_test_files, set_fetch_response, is_null_value, close, get_env_vars, get_lang, get_ext  # noqa: F401

class testMainClass:
    id_tests = False
    request_tests_failed = False
    response_tests_failed = False
    request_tests = False
    ws_tests = False
    response_tests = False
    info = False
    verbose = False
    debug = False
    private_test = False
    private_test_only = False
    load_keys = False
    sandbox = False
    only_specific_tests = []
    skipped_settings_for_exchange = {}
    skipped_methods = {}
    checked_public_tests = {}
    test_files = {}
    public_tests = {}
    ext = ''
    lang = ''
    proxy_test_file_name = 'proxies'

    def parse_cli_args_and_props(self):
        self.response_tests = get_cli_arg_value('--responseTests') or get_cli_arg_value('--response')
        self.id_tests = get_cli_arg_value('--idTests')
        self.request_tests = get_cli_arg_value('--requestTests') or get_cli_arg_value('--request')
        self.info = get_cli_arg_value('--info')
        self.verbose = get_cli_arg_value('--verbose')
        self.debug = get_cli_arg_value('--debug')
        self.private_test = get_cli_arg_value('--private')
        self.private_test_only = get_cli_arg_value('--privateOnly')
        self.sandbox = get_cli_arg_value('--sandbox')
        self.load_keys = get_cli_arg_value('--loadKeys')
        self.ws_tests = get_cli_arg_value('--ws')
        self.lang = get_lang()
        self.ext = get_ext()

    def init(self, exchange_id, symbol_argv, method_argv):
        self.parse_cli_args_and_props()
        if self.request_tests and self.response_tests:
            self.run_static_request_tests(exchange_id, symbol_argv)
            self.run_static_response_tests(exchange_id, symbol_argv)
            return True
        if self.response_tests:
            self.run_static_response_tests(exchange_id, symbol_argv)
            return True
        if self.request_tests:
            self.run_static_request_tests(exchange_id, symbol_argv)  # symbol here is the testname
            return True
        if self.id_tests:
            self.run_broker_id_tests()
            return True
        new_line = '\n'
        dump(new_line + '' + new_line + '' + '[INFO] TESTING ', self.ext, {
            'exchange': exchange_id,
            'symbol': symbol_argv,
            'method': method_argv,
            'isWs': self.ws_tests,
            'useProxy': get_cli_arg_value('--useProxy'),
        }, new_line)
        exchange_args = {
            'verbose': self.verbose,
            'debug': self.debug,
            'enableRateLimit': True,
            'timeout': 30000,
        }
        exchange = init_exchange(exchange_id, exchange_args, self.ws_tests)
        if exchange.alias:
            exit_script(0)
        self.import_files(exchange)
        assert len(list(self.test_files.keys())) > 0, 'Test files were not loaded'  # ensure test files are found & filled
        self.expand_settings(exchange)
        self.check_if_specific_test_is_chosen(method_argv)
        self.start_test(exchange, symbol_argv)
        exit_script(0)  # needed to be explicitly finished for WS tests

    def check_if_specific_test_is_chosen(self, method_argv):
        if method_argv is not None:
            test_file_names = list(self.test_files.keys())
            possible_method_names = method_argv.split(',')  # i.e. `test.ts binance fetchBalance,fetchDeposits`
            if len(possible_method_names) >= 1:
                for i in range(0, len(test_file_names)):
                    test_file_name = test_file_names[i]
                    for j in range(0, len(possible_method_names)):
                        method_name = possible_method_names[j]
                        method_name = method_name.replace('()', '')
                        if test_file_name == method_name:
                            self.only_specific_tests.append(test_file_name)

    def import_files(self, exchange):
        properties = list(exchange.has.keys())
        properties.append('loadMarkets')
        if is_sync():
            self.test_files = get_test_files_sync(properties, self.ws_tests)
        else:
            self.test_files = get_test_files(properties, self.ws_tests)
        return True

    def load_credentials_from_env(self, exchange):
        exchange_id = exchange.id
        req_creds = get_exchange_prop(exchange, 're' + 'quiredCredentials')  # dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        objkeys = list(req_creds.keys())
        for i in range(0, len(objkeys)):
            credential = objkeys[i]
            is_required = req_creds[credential]
            if is_required and get_exchange_prop(exchange, credential) is None:
                full_key = exchange_id + '_' + credential
                credential_env_name = full_key.upper()  # example: KRAKEN_APIKEY
                env_vars = get_env_vars()
                credential_value = env_vars[credential_env_name] if (credential_env_name in env_vars) else None
                if credential_value:
                    set_exchange_prop(exchange, credential, credential_value)

    def expand_settings(self, exchange):
        exchange_id = exchange.id
        keys_global = get_root_dir() + 'keys.json'
        keys_local = get_root_dir() + 'keys.local.json'
        keys_global_exists = io_file_exists(keys_global)
        keys_local_exists = io_file_exists(keys_local)
        global_settings = {}
        if keys_global_exists:
            global_settings = io_file_read(keys_global)
        local_settings = {}
        if keys_local_exists:
            local_settings = io_file_read(keys_local)
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
        if self.load_keys:
            self.load_credentials_from_env(exchange)
        # skipped tests
        skipped_file = get_root_dir() + 'skip-tests.json'
        skipped_settings = io_file_read(skipped_file)
        self.skipped_settings_for_exchange = exchange.safe_value(skipped_settings, exchange_id, {})
        skipped_settings_for_exchange = self.skipped_settings_for_exchange
        # others
        timeout = exchange.safe_value(skipped_settings_for_exchange, 'timeout')
        if timeout is not None:
            exchange.timeout = exchange.parse_to_int(timeout)
        if get_cli_arg_value('--useProxy'):
            exchange.http_proxy = exchange.safe_string(skipped_settings_for_exchange, 'httpProxy')
            exchange.https_proxy = exchange.safe_string(skipped_settings_for_exchange, 'httpsProxy')
            exchange.ws_proxy = exchange.safe_string(skipped_settings_for_exchange, 'wsProxy')
            exchange.wss_proxy = exchange.safe_string(skipped_settings_for_exchange, 'wssProxy')
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

    def test_method(self, method_name, exchange, args, is_public):
        # todo: temporary skip for c#
        if 'OrderBook' in method_name and self.ext == 'cs':
            exchange.options['checksum'] = False
        # todo: temporary skip for php
        if 'OrderBook' in method_name and self.ext == 'php':
            return True
        skipped_properties_for_method = self.get_skips(exchange, method_name)
        is_load_markets = (method_name == 'loadMarkets')
        is_fetch_currencies = (method_name == 'fetchCurrencies')
        is_proxy_test = (method_name == self.proxy_test_file_name)
        is_feature_test = (method_name == 'features')
        # if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if not is_public and (method_name in self.checked_public_tests) and not is_fetch_currencies:
            return True
        skip_message = None
        supported_by_exchange = (method_name in exchange.has) and exchange.has[method_name]
        if not is_load_markets and (len(self.only_specific_tests) > 0 and not exchange.in_array(method_name, self.only_specific_tests)):
            skip_message = '[INFO] IGNORED_TEST'
        elif not is_load_markets and not supported_by_exchange and not is_proxy_test and not is_feature_test:
            skip_message = '[INFO] UNSUPPORTED_TEST'  # keep it aligned with the longest message
        elif isinstance(skipped_properties_for_method, str):
            skip_message = '[INFO] SKIPPED_TEST'
        elif not (method_name in self.test_files):
            skip_message = '[INFO] UNIMPLEMENTED_TEST'
        # exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if is_load_markets:
            exchange.load_markets(True)
        name = exchange.id
        if skip_message:
            if self.info:
                dump(self.add_padding(skip_message, 25), name, method_name)
            return True
        if self.info:
            args_stringified = '(' + exchange.json(args) + ')'  # args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
            dump(self.add_padding('[INFO] TESTING', 25), name, method_name, args_stringified)
        if is_sync():
            call_method_sync(self.test_files, method_name, exchange, skipped_properties_for_method, args)
        else:
            call_method(self.test_files, method_name, exchange, skipped_properties_for_method, args)
        if self.info:
            dump(self.add_padding('[INFO] TESTING DONE', 25), name, method_name)
        # add to the list of successed tests
        if is_public:
            self.checked_public_tests[method_name] = True
        return True

    def get_skips(self, exchange, method_name):
        final_skips = {}
        # check the exact method (i.e. `fetchTrades`) and language-specific (i.e. `fetchTrades.php`)
        method_names = [method_name, method_name + '.' + self.ext]
        for i in range(0, len(method_names)):
            m_name = method_names[i]
            if m_name in self.skipped_methods:
                # if whole method is skipped, by assigning a string to it, i.e. "fetchOrders":"blabla"
                if isinstance(self.skipped_methods[m_name], str):
                    return self.skipped_methods[m_name]
                else:
                    final_skips = exchange.deep_extend(final_skips, self.skipped_methods[m_name])
        # get "object-specific" skips
        object_skips = {
            'orderBook': ['fetchOrderBook', 'fetchOrderBooks', 'fetchL2OrderBook', 'watchOrderBook', 'watchOrderBookForSymbols'],
            'ticker': ['fetchTicker', 'fetchTickers', 'watchTicker', 'watchTickers'],
            'trade': ['fetchTrades', 'watchTrades', 'watchTradesForSymbols'],
            'ohlcv': ['fetchOHLCV', 'watchOHLCV', 'watchOHLCVForSymbols'],
            'ledger': ['fetchLedger', 'fetchLedgerEntry'],
            'depositWithdraw': ['fetchDepositsWithdrawals', 'fetchDeposits', 'fetchWithdrawals'],
            'depositWithdrawFee': ['fetchDepositWithdrawFee', 'fetchDepositWithdrawFees'],
        }
        object_names = list(object_skips.keys())
        for i in range(0, len(object_names)):
            object_name = object_names[i]
            object_methods = object_skips[object_name]
            if exchange.in_array(method_name, object_methods):
                # if whole object is skipped, by assigning a string to it, i.e. "orderBook":"blabla"
                if (object_name in self.skipped_methods) and (isinstance(self.skipped_methods[object_name], str)):
                    return self.skipped_methods[object_name]
                extra_skips = exchange.safe_dict(self.skipped_methods, object_name, {})
                final_skips = exchange.deep_extend(final_skips, extra_skips)
        # extend related skips
        # - if 'timestamp' is skipped, we should do so for 'datetime' too
        # - if 'bid' is skipped, skip 'ask' too
        if ('timestamp' in final_skips) and not ('datetime' in final_skips):
            final_skips['datetime'] = final_skips['timestamp']
        if ('bid' in final_skips) and not ('ask' in final_skips):
            final_skips['ask'] = final_skips['bid']
        if ('baseVolume' in final_skips) and not ('quoteVolume' in final_skips):
            final_skips['quoteVolume'] = final_skips['baseVolume']
        return final_skips

    def test_safe(self, method_name, exchange, args=[], is_public=False):
        # `testSafe` method does not throw an exception, instead mutes it. The reason we
        # mute the thrown exceptions here is because we don't want to stop the whole
        # tests queue if any single test-method fails. Instead, they are echoed with
        # formatted message "[TEST_FAILURE] ..." and that output is then regex-matched by
        # run-tests.js, so the exceptions are still printed out to console from there.
        max_retries = 3
        args_stringified = exchange.json(args)  # args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
        for i in range(0, max_retries):
            try:
                self.test_method(method_name, exchange, args, is_public)
                return True
            except Exception as ex:
                e = get_root_exception(ex)
                is_load_markets = (method_name == 'loadMarkets')
                is_auth_error = (isinstance(e, AuthenticationError))
                is_not_supported = (isinstance(e, NotSupported))
                is_operation_failed = (isinstance(e, OperationFailed))  # includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "OperationFailed", "InvalidNonce", ...
                if is_operation_failed:
                    # if last retry was gone with same `tempFailure` error, then let's eventually return false
                    if i == max_retries - 1:
                        is_on_maintenance = (isinstance(e, OnMaintenance))
                        is_exchange_not_available = (isinstance(e, ExchangeNotAvailable))
                        should_fail = None
                        ret_success = None
                        if is_load_markets:
                            # if "loadMarkets" does not succeed, we must return "false" to caller method, to stop tests continual
                            ret_success = False
                            # we might not break exchange tests, if exchange is on maintenance at this moment
                            if is_on_maintenance:
                                should_fail = False
                            else:
                                should_fail = True
                        else:
                            # for any other method tests:
                            if is_exchange_not_available and not is_on_maintenance:
                                # break exchange tests if "ExchangeNotAvailable" exception is thrown, but it's not maintenance
                                should_fail = True
                                ret_success = False
                            else:
                                # in all other cases of OperationFailed, show Warning, but don't mark test as failed
                                should_fail = False
                                ret_success = True
                        # output the message
                        fail_type = '[TEST_FAILURE]' if should_fail else '[TEST_WARNING]'
                        dump(fail_type, 'Method could not be tested due to a repeated Network/Availability issues', ' | ', exchange.id, method_name, args_stringified, exception_message(e))
                        return ret_success
                    else:
                        # wait and retry again
                        # (increase wait time on every retry)
                        exchange.sleep((i + 1) * 1000)
                else:
                    # if it's loadMarkets, then fail test, because it's mandatory for tests
                    if is_load_markets:
                        dump('[TEST_FAILURE]', 'Exchange can not load markets', exception_message(e), exchange.id, method_name, args_stringified)
                        return False
                    # if the specific arguments to the test method throws "NotSupported" exception
                    # then let's don't fail the test
                    if is_not_supported:
                        if self.info:
                            dump('[INFO] NOT_SUPPORTED', exception_message(e), exchange.id, method_name, args_stringified)
                        return True
                    # If public test faces authentication error, we don't break (see comments under `testSafe` method)
                    if is_public and is_auth_error:
                        if self.info:
                            dump('[INFO]', 'Authentication problem for public method', exception_message(e), exchange.id, method_name, args_stringified)
                        return True
                    else:
                        dump('[TEST_FAILURE]', exception_message(e), exchange.id, method_name, args_stringified)
                        return False
        return True

    def run_public_tests(self, exchange, symbol):
        tests = {
            'features': [],
            'fetchCurrencies': [],
            'fetchTicker': [symbol],
            'fetchTickers': [symbol],
            'fetchLastPrices': [symbol],
            'fetchOHLCV': [symbol],
            'fetchTrades': [symbol],
            'fetchOrderBook': [symbol],
            'fetchL2OrderBook': [symbol],
            'fetchOrderBooks': [],
            'fetchBidsAsks': [],
            'fetchStatus': [],
            'fetchTime': [],
        }
        if self.ws_tests:
            tests = {
                'watchOHLCV': [symbol],
                'watchOHLCVForSymbols': [symbol],
                'watchTicker': [symbol],
                'watchTickers': [symbol],
                'watchBidsAsks': [symbol],
                'watchOrderBook': [symbol],
                'watchOrderBookForSymbols': [[symbol]],
                'watchTrades': [symbol],
                'watchTradesForSymbols': [[symbol]],
            }
        market = exchange.market(symbol)
        is_spot = market['spot']
        if not self.ws_tests:
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
        self.run_tests(exchange, tests, True)
        return True

    def run_tests(self, exchange, tests, is_public_test):
        test_names = list(tests.keys())
        promises = []
        for i in range(0, len(test_names)):
            test_name = test_names[i]
            test_args = tests[test_name]
            promises.append(self.test_safe(test_name, exchange, test_args, is_public_test))
        # todo - not yet ready in other langs too
        # promises.push (testThrottle ());
        results = (promises)
        # now count which test-methods retuned `false` from "testSafe" and dump that info below
        failed_methods = []
        for i in range(0, len(test_names)):
            test_name = test_names[i]
            test_returned_value = results[i]
            if not test_returned_value:
                failed_methods.append(test_name)
        test_prefix_string = 'PUBLIC_TESTS' if is_public_test else 'PRIVATE_TESTS'
        if len(failed_methods):
            errors_string = ', '.join(failed_methods)
            dump('[TEST_FAILURE]', exchange.id, test_prefix_string, 'Failed methods : ' + errors_string)
        if self.info:
            dump(self.add_padding('[INFO] END ' + test_prefix_string + ' ' + exchange.id, 25))
        return True

    def load_exchange(self, exchange):
        result = self.test_safe('loadMarkets', exchange, [], True)
        if not result:
            return False
        exchange_symbols_length = len(exchange.symbols)
        dump('[INFO:MAIN] Exchange loaded', exchange_symbols_length, 'symbols')
        return True

    def get_test_symbol(self, exchange, is_spot, symbols):
        symbol = None
        preferred_spot_symbol = exchange.safe_string(self.skipped_settings_for_exchange, 'preferredSpotSymbol')
        preferred_swap_symbol = exchange.safe_string(self.skipped_settings_for_exchange, 'preferredSwapSymbol')
        if is_spot and preferred_spot_symbol:
            return preferred_spot_symbol
        elif not is_spot and preferred_swap_symbol:
            return preferred_swap_symbol
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
        codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BNB', 'DASH', 'DOGE', 'ETC', 'TRX', 'USDT', 'USDC', 'USD', 'EUR', 'TUSD', 'CNY', 'JPY', 'BRL']
        spot_symbols = ['BTC/USDT', 'BTC/USDC', 'BTC/USD', 'BTC/CNY', 'BTC/EUR', 'BTC/AUD', 'BTC/BRL', 'BTC/JPY', 'ETH/USDT', 'ETH/USDC', 'ETH/USD', 'ETH/CNY', 'ETH/EUR', 'ETH/AUD', 'ETH/BRL', 'ETH/JPY', 'EUR/USDT', 'EUR/USD', 'EUR/USDC', 'USDT/EUR', 'USD/EUR', 'USDC/EUR', 'BTC/ETH', 'ETH/BTC']
        swap_symbols = ['BTC/USDT:USDT', 'BTC/USDC:USDC', 'BTC/USD:USD', 'ETH/USDT:USDT', 'ETH/USDC:USDC', 'ETH/USD:USD', 'BTC/USD:BTC', 'ETH/USD:ETH']
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

    def test_exchange(self, exchange, provided_symbol=None):
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
            dump('[INFO:MAIN] Selected SPOT SYMBOL:', spot_symbol)
        if swap_symbol is not None:
            dump('[INFO:MAIN] Selected SWAP SYMBOL:', swap_symbol)
        if not self.private_test_only:
            # note, spot & swap tests should run sequentially, because of conflicting `exchange.options['defaultType']` setting
            if exchange.has['spot'] and spot_symbol is not None:
                if self.info:
                    dump('[INFO] ### SPOT TESTS ###')
                exchange.options['defaultType'] = 'spot'
                self.run_public_tests(exchange, spot_symbol)
            if exchange.has['swap'] and swap_symbol is not None:
                if self.info:
                    dump('[INFO] ### SWAP TESTS ###')
                exchange.options['defaultType'] = 'swap'
                self.run_public_tests(exchange, swap_symbol)
        if self.private_test or self.private_test_only:
            if exchange.has['spot'] and spot_symbol is not None:
                exchange.options['defaultType'] = 'spot'
                self.run_private_tests(exchange, spot_symbol)
            if exchange.has['swap'] and swap_symbol is not None:
                exchange.options['defaultType'] = 'swap'
                self.run_private_tests(exchange, swap_symbol)
        return True

    def run_private_tests(self, exchange, symbol):
        if not exchange.check_required_credentials(False):
            dump('[INFO] Skipping private tests', 'Keys not found')
            return True
        code = self.get_exchange_code(exchange)
        # if (exchange.deepExtendedTest) {
        #     test ('InvalidNonce', exchange, symbol);
        #     test ('OrderNotFound', exchange, symbol);
        #     test ('InvalidOrder', exchange, symbol);
        #     test ('InsufficientFunds', exchange, symbol, balance); # danger zone - won't execute with non-empty balance
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
            'fetchMarginModes': [symbol],
            'fetchPosition': [symbol],
            'fetchDeposit': [code],
            'createDepositAddress': [code],
            'fetchDepositAddress': [code],
            'fetchDepositAddresses': [code],
            'fetchDepositAddressesByNetwork': [code],
            'fetchBorrowRateHistory': [code],
            'fetchLedgerEntry': [code],
        }
        if get_cli_arg_value('--fundedTests'):
            tests['createOrder'] = [symbol]
        if self.ws_tests:
            tests = {
                'watchBalance': [code],
                'watchMyTrades': [symbol],
                'watchOrders': [symbol],
                'watchPosition': [symbol],
                'watchPositions': [symbol],
            }
        market = exchange.market(symbol)
        is_spot = market['spot']
        if not self.ws_tests:
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
        # const combinedTests = exchange.deepExtend (this.publicTests, privateTests);
        self.run_tests(exchange, tests, False)

    def test_proxies(self, exchange):
        # these tests should be synchronously executed, because of conflicting nature of proxy settings
        proxy_test_name = self.proxy_test_file_name
        # todo: temporary skip for sync py
        if self.ext == 'py' and is_sync():
            return True
        # try proxy several times
        max_retries = 3
        exception = None
        for j in range(0, max_retries):
            try:
                self.test_method(proxy_test_name, exchange, [], True)
                return True   # if successfull, then end the test
            except Exception as e:
                exception = e
                exchange.sleep(j * 1000)
        # if exception was set, then throw it
        if exception is not None:
            error_message = '[TEST_FAILURE] Failed ' + proxy_test_name + ' : ' + exception_message(exception)
            # temporary comment the below, because c# transpilation failure
            # throw new Exchange Error (errorMessage.toString ());
            dump('[TEST_WARNING]' + error_message)
        return True

    def check_constructor(self, exchange):
        # todo: this might be moved in base tests later
        if exchange.id == 'binance':
            assert exchange.hostname is None, 'binance.com hostname should be empty'
            assert exchange.urls['api']['public'] == 'https://api.binance.com/api/v3', 'https://api.binance.com/api/v3 does not match: ' + exchange.urls['api']['public']
            assert ('lending/union/account' in exchange.api['sapi']['get']), 'SAPI should contain the endpoint lending/union/account, ' + json_stringify(exchange.api['sapi']['get'])
        elif exchange.id == 'binanceus':
            assert exchange.hostname == 'binance.us', 'binance.us hostname does not match ' + exchange.hostname
            assert exchange.urls['api']['public'] == 'https://api.binance.us/api/v3', 'https://api.binance.us/api/v3 does not match: ' + exchange.urls['api']['public']

    def start_test(self, exchange, symbol):
        # we do not need to test aliases
        if exchange.alias:
            return True
        self.check_constructor(exchange)
        if self.sandbox or get_exchange_prop(exchange, 'sandbox'):
            exchange.set_sandbox_mode(True)
        try:
            result = self.load_exchange(exchange)
            if not result:
                if not is_sync():
                    close(exchange)
                return True
            # if (exchange.id === 'binance') {
            #     # we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
            #     # this.testProxies (exchange);
            # }
            self.test_exchange(exchange, symbol)
            if not is_sync():
                close(exchange)
        except Exception as e:
            if not is_sync():
                close(exchange)
            raise e

    def assert_static_error(self, cond, message, calculated_output, stored_output, key=None):
        #  -----------------------------------------------------------------------------
        #  --- Init of static tests functions------------------------------------------
        #  -----------------------------------------------------------------------------
        calculated_string = json_stringify(calculated_output)
        stored_string = json_stringify(stored_output)
        error_message = message
        if key is not None:
            error_message = '[' + key + ']'
        error_message += ' computed: ' + stored_string + ' stored: ' + calculated_string
        assert cond, error_message

    def load_markets_from_file(self, id):
        # load markets from file
        # to make this test as fast as possible
        # and basically independent from the exchange
        # so we can run it offline
        filename = get_root_dir() + './ts/src/test/static/markets/' + id + '.json'
        content = io_file_read(filename)
        return content

    def load_currencies_from_file(self, id):
        filename = get_root_dir() + './ts/src/test/static/currencies/' + id + '.json'
        content = io_file_read(filename)
        return content

    def load_static_data(self, folder, target_exchange=None):
        result = {}
        if target_exchange:
            # read a single exchange
            path = folder + target_exchange + '.json'
            if not io_file_exists(path):
                dump('[WARN] tests not found: ' + path)
                return None
            result[target_exchange] = io_file_read(path)
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

    def assert_new_and_stored_output_inner(self, exchange, skip_keys, new_output, stored_output, strict_type_check=True, asserting_key=None):
        if is_null_value(new_output) and is_null_value(stored_output):
            return True
        if not new_output and not stored_output:
            return True
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
                self.assert_new_and_stored_output(exchange, skip_keys, new_value, stored_value, strict_type_check, key)
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
            sanitized_new_output = None if (is_null_value(new_output)) else new_output  # we store undefined as nulls in the json file so we need to convert it back
            sanitized_stored_output = None if (is_null_value(stored_output)) else stored_output
            new_output_string = str(sanitized_new_output) if sanitized_new_output else 'undefined'
            stored_output_string = str(sanitized_stored_output) if sanitized_stored_output else 'undefined'
            message_error = 'output value mismatch:' + new_output_string + ' != ' + stored_output_string
            if strict_type_check and (self.lang != 'C#'):
                # upon building the request we want strict type check to make sure all the types are correct
                # when comparing the response we want to allow some flexibility, because a 50.0 can be equal to 50 after saving it to the json file
                self.assert_static_error(sanitized_new_output == sanitized_stored_output, message_error, stored_output, new_output, asserting_key)
            else:
                is_computed_bool = (isinstance(sanitized_new_output, bool))
                is_stored_bool = (isinstance(sanitized_stored_output, bool))
                is_computed_string = (isinstance(sanitized_new_output, str))
                is_stored_string = (isinstance(sanitized_stored_output, str))
                is_computed_undefined = (sanitized_new_output is None)
                is_stored_undefined = (sanitized_stored_output is None)
                should_be_same = (is_computed_bool == is_stored_bool) and (is_computed_string == is_stored_string) and (is_computed_undefined == is_stored_undefined)
                self.assert_static_error(should_be_same, 'output type mismatch', stored_output, new_output, asserting_key)
                is_boolean = is_computed_bool or is_stored_bool
                is_string = is_computed_string or is_stored_string
                is_undefined = is_computed_undefined or is_stored_undefined  # undefined is a perfetly valid value
                if is_boolean or is_string or is_undefined:
                    if (self.lang == 'C#') or (self.lang == 'GO'):
                        # tmp c# number comparsion
                        is_number = False
                        try:
                            exchange.parse_to_numeric(sanitized_new_output)
                            is_number = True
                        except Exception as e:
                            # if we can't parse it to number, then it's not a number
                            is_number = False
                        if is_number:
                            self.assert_static_error(exchange.parse_to_numeric(sanitized_new_output) == exchange.parse_to_numeric(sanitized_stored_output), message_error, stored_output, new_output, asserting_key)
                            return True
                        else:
                            self.assert_static_error(convert_ascii(new_output_string) == convert_ascii(stored_output_string), message_error, stored_output, new_output, asserting_key)
                            return True
                    else:
                        self.assert_static_error(convert_ascii(new_output_string) == convert_ascii(stored_output_string), message_error, stored_output, new_output, asserting_key)
                        return True
                else:
                    if self.lang == 'C#':
                        stringified_new_output = exchange.number_to_string(sanitized_new_output)
                        stringified_stored_output = exchange.number_to_string(sanitized_stored_output)
                        self.assert_static_error(str(stringified_new_output) == str(stringified_stored_output), message_error, stored_output, new_output, asserting_key)
                    else:
                        numeric_new_output = exchange.parse_to_numeric(new_output_string)
                        numeric_stored_output = exchange.parse_to_numeric(stored_output_string)
                        self.assert_static_error(numeric_new_output == numeric_stored_output, message_error, stored_output, new_output, asserting_key)
        return True   # c# requ

    def assert_new_and_stored_output(self, exchange, skip_keys, new_output, stored_output, strict_type_check=True, asserting_key=None):
        res = True
        try:
            res = self.assert_new_and_stored_output_inner(exchange, skip_keys, new_output, stored_output, strict_type_check, asserting_key)
        except Exception as e:
            if self.info:
                error_message = self.var_to_string(new_output) + '(calculated)' + ' != ' + self.var_to_string(stored_output) + '(stored)'
                dump('[TEST_FAILURE_DETAIL]' + error_message)
            raise e
        return res

    def var_to_string(self, obj=None):
        new_string = None
        if obj is None:
            new_string = 'undefined'
        elif is_null_value(obj):
            new_string = 'null'
        else:
            new_string = json_stringify(obj)
        return new_string

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
                    return True
                stored_url_params = self.urlencoded_to_dict(stored_url_query)
                new_url_params = self.urlencoded_to_dict(new_url_query)
                self.assert_new_and_stored_output(exchange, skip_keys, new_url_params, stored_url_params)
                return True
        if type == 'json' and (stored_output is not None) and (new_output is not None):
            if isinstance(stored_output, str):
                stored_output = json_parse(stored_output)
            if isinstance(new_output, str):
                new_output = json_parse(new_output)
        elif type == 'urlencoded' and (stored_output is not None) and (new_output is not None):
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
        return True

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

    def test_request_statically(self, exchange, method, data, type, skip_keys):
        output = None
        request_url = None
        try:
            if not is_sync():
                call_exchange_method_dynamically(exchange, method, self.sanitize_data_input(data['input']))
            else:
                call_exchange_method_dynamically_sync(exchange, method, self.sanitize_data_input(data['input']))
        except Exception as e:
            if not (isinstance(e, InvalidProxySettings)):
                raise e
            output = exchange.last_request_body
            request_url = exchange.last_request_url
        try:
            call_output = exchange.safe_value(data, 'output')
            self.assert_static_request_output(exchange, type, skip_keys, data['url'], request_url, call_output, output)
        except Exception as e:
            self.request_tests_failed = True
            error_message = '[' + self.lang + '][STATIC_REQUEST]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + exception_message(e)
            dump('[TEST_FAILURE]' + error_message)
        return True

    def test_response_statically(self, exchange, method, skip_keys, data):
        expected_result = exchange.safe_value(data, 'parsedResponse')
        mocked_exchange = set_fetch_response(exchange, data['httpResponse'])
        try:
            if not is_sync():
                unified_result = call_exchange_method_dynamically(exchange, method, self.sanitize_data_input(data['input']))
                self.assert_static_response_output(mocked_exchange, skip_keys, unified_result, expected_result)
            else:
                unified_result_sync = call_exchange_method_dynamically_sync(exchange, method, self.sanitize_data_input(data['input']))
                self.assert_static_response_output(mocked_exchange, skip_keys, unified_result_sync, expected_result)
        except Exception as e:
            self.response_tests_failed = True
            error_message = '[' + self.lang + '][STATIC_RESPONSE]' + '[' + exchange.id + ']' + '[' + method + ']' + '[' + data['description'] + ']' + exception_message(e)
            dump('[TEST_FAILURE]' + error_message)
        set_fetch_response(exchange, None)  # reset state
        return True

    def init_offline_exchange(self, exchange_name):
        markets = self.load_markets_from_file(exchange_name)
        currencies = self.load_currencies_from_file(exchange_name)
        # we add "proxy" 2 times to intentionally trigger InvalidProxySettings
        exchange = init_exchange(exchange_name, {
            'markets': markets,
            'currencies': currencies,
            'enableRateLimit': False,
            'rateLimit': 1,
            'httpProxy': 'http://fake:8080',
            'httpsProxy': 'http://fake:8080',
            'apiKey': 'key',
            'secret': 'secretsecret',
            'password': 'password',
            'walletAddress': 'wallet',
            'privateKey': '0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771',
            'uid': 'uid',
            'token': 'token',
            'login': 'login',
            'accountId': 'accountId',
            'accounts': [{
    'id': 'myAccount',
    'code': 'USDT',
}, {
    'id': 'myAccount',
    'code': 'USDC',
}],
            'options': {
                'enableUnifiedAccount': True,
                'enableUnifiedMargin': False,
                'accessToken': 'token',
                'expires': 999999999999999,
                'leverageBrackets': {},
            },
        })
        exchange.currencies = currencies
        # not working in python if assigned  in the config dict
        return exchange

    def test_exchange_request_statically(self, exchange_name, exchange_data, test_name=None):
        # instantiate the exchange and make sure that we sink the requests to avoid an actual request
        exchange = self.init_offline_exchange(exchange_name)
        global_options = exchange.safe_dict(exchange_data, 'options', {})
        # read apiKey/secret from the test file
        api_key = exchange.safe_string(exchange_data, 'apiKey')
        if api_key:
            exchange.apiKey = str(api_key)
        secret = exchange.safe_string(exchange_data, 'secret')
        if secret:
            exchange.secret = str(secret)
        private_key = exchange.safe_string(exchange_data, 'privateKey')
        if private_key:
            exchange.privateKey = str(private_key)
        wallet_address = exchange.safe_string(exchange_data, 'walletAddress')
        if wallet_address:
            exchange.walletAddress = str(wallet_address)
        accounts = exchange.safe_list(exchange_data, 'accounts')
        if accounts:
            exchange.accounts = accounts
        # exchange.options = exchange.deepExtend (exchange.options, globalOptions); # custom options to be used in the tests
        exchange.extend_exchange_options(global_options)
        methods = exchange.safe_value(exchange_data, 'methods', {})
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            for j in range(0, len(results)):
                result = results[j]
                old_exchange_options = exchange.options  # snapshot options;
                test_exchange_options = exchange.safe_value(result, 'options', {})
                # exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); # custom options to be used in the tests
                exchange.extend_exchange_options(exchange.deep_extend(old_exchange_options, test_exchange_options))
                description = exchange.safe_value(result, 'description')
                if (test_name is not None) and (test_name != description):
                    continue
                is_disabled = exchange.safe_bool(result, 'disabled', False)
                if is_disabled:
                    continue
                disabled_string = exchange.safe_string(result, 'disabled', '')
                if disabled_string != '':
                    continue
                is_disabled_c_sharp = exchange.safe_bool(result, 'disabledCS', False)
                if is_disabled_c_sharp and (self.lang == 'C#'):
                    continue
                is_disabled_go = exchange.safe_bool(result, 'disabledGO', False)
                if is_disabled_go and (self.lang == 'GO'):
                    continue
                type = exchange.safe_string(exchange_data, 'outputType')
                skip_keys = exchange.safe_value(exchange_data, 'skipKeys', [])
                self.test_request_statically(exchange, method, result, type, skip_keys)
                # reset options
                exchange.options = exchange.convert_to_safe_dictionary(exchange.deep_extend(old_exchange_options, {}))
        if not is_sync():
            close(exchange)
        return True   # in c# methods that will be used with promiseAll need to return something

    def test_exchange_response_statically(self, exchange_name, exchange_data, test_name=None):
        exchange = self.init_offline_exchange(exchange_name)
        # read apiKey/secret from the test file
        api_key = exchange.safe_string(exchange_data, 'apiKey')
        if api_key:
            exchange.apiKey = str(api_key)
        secret = exchange.safe_string(exchange_data, 'secret')
        if secret:
            exchange.secret = str(secret)
        private_key = exchange.safe_string(exchange_data, 'privateKey')
        if private_key:
            exchange.privateKey = str(private_key)
        wallet_address = exchange.safe_string(exchange_data, 'walletAddress')
        if wallet_address:
            exchange.walletAddress = str(wallet_address)
        methods = exchange.safe_value(exchange_data, 'methods', {})
        options = exchange.safe_value(exchange_data, 'options', {})
        # exchange.options = exchange.deepExtend (exchange.options, options); # custom options to be used in the tests
        exchange.extend_exchange_options(options)
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            for j in range(0, len(results)):
                result = results[j]
                description = exchange.safe_value(result, 'description')
                old_exchange_options = exchange.options  # snapshot options;
                test_exchange_options = exchange.safe_value(result, 'options', {})
                # exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); # custom options to be used in the tests
                exchange.extend_exchange_options(exchange.deep_extend(old_exchange_options, test_exchange_options))
                is_disabled = exchange.safe_bool(result, 'disabled', False)
                if is_disabled:
                    continue
                is_disabled_c_sharp = exchange.safe_bool(result, 'disabledCS', False)
                if is_disabled_c_sharp and (self.lang == 'C#'):
                    continue
                is_disabled_php = exchange.safe_bool(result, 'disabledPHP', False)
                if is_disabled_php and (self.lang == 'PHP'):
                    continue
                if (test_name is not None) and (test_name != description):
                    continue
                is_disabled_go = exchange.safe_bool(result, 'disabledGO', False)
                if is_disabled_go and (self.lang == 'GO'):
                    continue
                skip_keys = exchange.safe_value(exchange_data, 'skipKeys', [])
                self.test_response_statically(exchange, method, skip_keys, result)
                # reset options
                # exchange.options = exchange.deepExtend (oldExchangeOptions, {});
                exchange.extend_exchange_options(exchange.deep_extend(old_exchange_options, {}))
        if not is_sync():
            close(exchange)
        return True   # in c# methods that will be used with promiseAll need to return something

    def get_number_of_tests_from_exchange(self, exchange, exchange_data, test_name=None):
        if test_name is not None:
            return 1
        sum = 0
        methods = exchange_data['methods']
        methods_names = list(methods.keys())
        for i in range(0, len(methods_names)):
            method = methods_names[i]
            results = methods[method]
            results_length = len(results)
            sum = exchange.sum(sum, results_length)
        return sum

    def run_static_request_tests(self, target_exchange=None, test_name=None):
        self.run_static_tests('request', target_exchange, test_name)
        return True

    def run_static_tests(self, type, target_exchange=None, test_name=None):
        folder = get_root_dir() + './ts/src/test/static/' + type + '/'
        static_data = self.load_static_data(folder, target_exchange)
        if static_data is None:
            return True
        exchanges = list(static_data.keys())
        exchange = init_exchange('Exchange', {})  # tmp to do the calculations until we have the ast-transpiler transpiling this code
        promises = []
        sum = 0
        if target_exchange:
            dump('[INFO:MAIN] Exchange to test: ' + target_exchange)
        if test_name:
            dump('[INFO:MAIN] Testing only: ' + test_name)
        for i in range(0, len(exchanges)):
            exchange_name = exchanges[i]
            exchange_data = static_data[exchange_name]
            number_of_tests = self.get_number_of_tests_from_exchange(exchange, exchange_data, test_name)
            sum = exchange.sum(sum, number_of_tests)
            if type == 'request':
                promises.append(self.test_exchange_request_statically(exchange_name, exchange_data, test_name))
            else:
                promises.append(self.test_exchange_response_statically(exchange_name, exchange_data, test_name))
        try:
            (promises)
        except Exception as e:
            if type == 'request':
                self.request_tests_failed = True
            else:
                self.response_tests_failed = True
            error_message = '[' + self.lang + '][STATIC_REQUEST]' + exception_message(e)
            dump('[TEST_FAILURE]' + error_message)
        if self.request_tests_failed or self.response_tests_failed:
            exit_script(1)
        else:
            prefix = '[SYNC]' if (is_sync()) else ''
            success_message = '[' + self.lang + ']' + prefix + '[TEST_SUCCESS] ' + str(sum) + ' static ' + type + ' tests passed.'
            dump('[INFO]' + success_message)

    def run_static_response_tests(self, exchange_name=None, test=None):
        #  -----------------------------------------------------------------------------
        #  --- Init of mockResponses tests functions------------------------------------
        #  -----------------------------------------------------------------------------
        self.run_static_tests('response', exchange_name, test)
        return True

    def run_broker_id_tests(self):
        #  -----------------------------------------------------------------------------
        #  --- Init of brokerId tests functions-----------------------------------------
        #  -----------------------------------------------------------------------------
        promises = [self.test_binance(), self.test_okx(), self.test_cryptocom(), self.test_bybit(), self.test_kucoin(), self.test_kucoinfutures(), self.test_bitget(), self.test_mexc(), self.test_htx(), self.test_woo(), self.test_bitmart(), self.test_coinex(), self.test_bingx(), self.test_phemex(), self.test_blofin(), self.test_hyperliquid(), self.test_coinbaseinternational(), self.test_coinbase_advanced(), self.test_woofi_pro(), self.test_oxfun(), self.test_xt(), self.test_vertex(), self.test_paradex(), self.test_hashkey(), self.test_coincatch(), self.test_defx(), self.test_cryptomus(), self.test_derive()]
        (promises)
        success_message = '[' + self.lang + '][TEST_SUCCESS] brokerId tests passed.'
        dump('[INFO]' + success_message)
        exit_script(0)
        return True

    def test_binance(self):
        exchange = self.init_offline_exchange('binance')
        spot_id = 'x-TKT5PX2F'
        swap_id = 'x-cvBPrNm9'
        inverse_swap_id = 'x-xcKtGhcu'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = self.urlencoded_to_dict(exchange.last_request_body)
        client_order_id = spot_order_request['newClientOrderId']
        spot_id_string = str(spot_id)
        assert client_order_id.startswith(spot_id_string), 'binance - spot clientOrderId: ' + client_order_id + ' does not start with spotId' + spot_id_string
        swap_order_request = None
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = self.urlencoded_to_dict(exchange.last_request_body)
        swap_inverse_order_request = None
        try:
            exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_inverse_order_request = self.urlencoded_to_dict(exchange.last_request_body)
        # linear swap
        client_order_id_swap = swap_order_request['newClientOrderId']
        swap_id_string = str(swap_id)
        assert client_order_id_swap.startswith(swap_id_string), 'binance - swap clientOrderId: ' + client_order_id_swap + ' does not start with swapId' + swap_id_string
        # inverse swap
        client_order_id_inverse = swap_inverse_order_request['newClientOrderId']
        assert client_order_id_inverse.startswith(inverse_swap_id), 'binance - swap clientOrderIdInverse: ' + client_order_id_inverse + ' does not start with swapId' + inverse_swap_id
        create_orders_request = None
        try:
            orders = [{
    'symbol': 'BTC/USDT:USDT',
    'type': 'limit',
    'side': 'sell',
    'amount': 1,
    'price': 100000,
}, {
    'symbol': 'BTC/USDT:USDT',
    'type': 'market',
    'side': 'buy',
    'amount': 1,
}]
            exchange.create_orders(orders)
        except Exception as e:
            create_orders_request = self.urlencoded_to_dict(exchange.last_request_body)
        batch_orders = create_orders_request['batchOrders']
        for i in range(0, len(batch_orders)):
            current = batch_orders[i]
            current_client_order_id = current['newClientOrderId']
            assert current_client_order_id.startswith(swap_id_string), 'binance createOrders - clientOrderId: ' + current_client_order_id + ' does not start with swapId' + swap_id_string
        if not is_sync():
            close(exchange)
        return True

    def test_okx(self):
        exchange = self.init_offline_exchange('okx')
        id = 'e847386590ce4dBC'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(exchange.last_request_body)
        client_order_id = spot_order_request[0]['clOrdId']  # returns order inside array
        id_string = str(id)
        assert client_order_id.startswith(id_string), 'okx - spot clientOrderId: ' + client_order_id + ' does not start with id: ' + id_string
        spot_tag = spot_order_request[0]['tag']
        assert spot_tag == id, 'okx - id: ' + id + ' different from spot tag: ' + spot_tag
        swap_order_request = None
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = json_parse(exchange.last_request_body)
        client_order_id_swap = swap_order_request[0]['clOrdId']
        assert client_order_id_swap.startswith(id_string), 'okx - swap clientOrderId: ' + client_order_id_swap + ' does not start with id: ' + id_string
        swap_tag = swap_order_request[0]['tag']
        assert swap_tag == id, 'okx - id: ' + id + ' different from swap tag: ' + swap_tag
        if not is_sync():
            close(exchange)
        return True

    def test_cryptocom(self):
        exchange = self.init_offline_exchange('cryptocom')
        id = 'CCXT'
        exchange.load_markets()
        request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        broker_id = request['params']['broker_id']
        assert broker_id == id, 'cryptocom - id: ' + id + ' different from  broker_id: ' + broker_id
        if not is_sync():
            close(exchange)
        return True

    def test_bybit(self):
        exchange = self.init_offline_exchange('bybit')
        req_headers = None
        id = 'CCXT'
        assert exchange.options['brokerId'] == id, 'id not in options'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        assert req_headers['Referer'] == id, 'bybit - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_kucoin(self):
        exchange = self.init_offline_exchange('kucoin')
        req_headers = None
        spot_id = exchange.options['partner']['spot']['id']
        spot_key = exchange.options['partner']['spot']['key']
        assert spot_id == 'ccxt', 'kucoin - id: ' + spot_id + ' not in options'
        assert spot_key == '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'kucoin - key: ' + spot_key + ' not in options.'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        id = 'ccxt'
        assert req_headers['KC-API-PARTNER'] == id, 'kucoin - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_kucoinfutures(self):
        exchange = self.init_offline_exchange('kucoinfutures')
        req_headers = None
        id = 'ccxtfutures'
        future_id = exchange.options['partner']['future']['id']
        future_key = exchange.options['partner']['future']['key']
        assert future_id == id, 'kucoinfutures - id: ' + future_id + ' not in options.'
        assert future_key == '1b327198-f30c-4f14-a0ac-918871282f15', 'kucoinfutures - key: ' + future_key + ' not in options.'
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = exchange.last_request_headers
        assert req_headers['KC-API-PARTNER'] == id, 'kucoinfutures - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_bitget(self):
        exchange = self.init_offline_exchange('bitget')
        req_headers = None
        id = 'p4sve'
        assert exchange.options['broker'] == id, 'bitget - id: ' + id + ' not in options'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = exchange.last_request_headers
        assert req_headers['X-CHANNEL-API-CODE'] == id, 'bitget - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_mexc(self):
        exchange = self.init_offline_exchange('mexc')
        req_headers = None
        id = 'CCXT'
        assert exchange.options['broker'] == id, 'mexc - id: ' + id + ' not in options'
        exchange.load_markets()
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = exchange.last_request_headers
        assert req_headers['source'] == id, 'mexc - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_htx(self):
        exchange = self.init_offline_exchange('htx')
        # spot test
        id = 'AA03022abc'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(exchange.last_request_body)
        client_order_id = spot_order_request['client-order-id']
        id_string = str(id)
        assert client_order_id.startswith(id_string), 'htx - spot clientOrderId ' + client_order_id + ' does not start with id: ' + id_string
        # swap test
        swap_order_request = None
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = json_parse(exchange.last_request_body)
        swap_inverse_order_request = None
        try:
            exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_inverse_order_request = json_parse(exchange.last_request_body)
        client_order_id_swap = swap_order_request['channel_code']
        assert client_order_id_swap.startswith(id_string), 'htx - swap channel_code ' + client_order_id_swap + ' does not start with id: ' + id_string
        client_order_id_inverse = swap_inverse_order_request['channel_code']
        assert client_order_id_inverse.startswith(id_string), 'htx - swap inverse channel_code ' + client_order_id_inverse + ' does not start with id: ' + id_string
        if not is_sync():
            close(exchange)
        return True

    def test_woo(self):
        exchange = self.init_offline_exchange('woo')
        # spot test
        id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = self.urlencoded_to_dict(exchange.last_request_body)
        broker_id = spot_order_request['broker_id']
        id_string = str(id)
        assert broker_id.startswith(id_string), 'woo - broker_id: ' + broker_id + ' does not start with id: ' + id_string
        # swap test
        stop_order_request = None
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, {
                'stopPrice': 30000,
            })
        except Exception as e:
            stop_order_request = json_parse(exchange.last_request_body)
        client_order_id_stop = stop_order_request['brokerId']
        assert client_order_id_stop.startswith(id_string), 'woo - brokerId: ' + client_order_id_stop + ' does not start with id: ' + id_string
        if not is_sync():
            close(exchange)
        return True

    def test_bitmart(self):
        exchange = self.init_offline_exchange('bitmart')
        req_headers = None
        id = 'CCXTxBitmart000'
        assert exchange.options['brokerId'] == id, 'bitmart - id: ' + id + ' not in options'
        exchange.load_markets()
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = exchange.last_request_headers
        assert req_headers['X-BM-BROKER-ID'] == id, 'bitmart - id: ' + id + ' not in headers'
        if not is_sync():
            close(exchange)
        return True

    def test_coinex(self):
        exchange = self.init_offline_exchange('coinex')
        id = 'x-167673045'
        assert exchange.options['brokerId'] == id, 'coinex - id: ' + id + ' not in options'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(exchange.last_request_body)
        client_order_id = spot_order_request['client_id']
        id_string = str(id)
        assert client_order_id.startswith(id_string), 'coinex - clientOrderId: ' + client_order_id + ' does not start with id: ' + id_string
        if not is_sync():
            close(exchange)
        return True

    def test_bingx(self):
        exchange = self.init_offline_exchange('bingx')
        req_headers = None
        id = 'CCXT'
        assert exchange.options['broker'] == id, 'bingx - id: ' + id + ' not in options'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        assert req_headers['X-SOURCE-KEY'] == id, 'bingx - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_phemex(self):
        exchange = self.init_offline_exchange('phemex')
        id = 'CCXT123456'
        request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        client_order_id = request['clOrdID']
        id_string = str(id)
        assert client_order_id.startswith(id_string), 'phemex - clOrdID: ' + client_order_id + ' does not start with id: ' + id_string
        if not is_sync():
            close(exchange)
        return True

    def test_blofin(self):
        exchange = self.init_offline_exchange('blofin')
        id = 'ec6dd3a7dd982d0b'
        request = None
        try:
            exchange.create_order('LTC/USDT:USDT', 'market', 'buy', 1)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        broker_id = request['brokerId']
        id_string = str(id)
        assert broker_id.startswith(id_string), 'blofin - brokerId: ' + broker_id + ' does not start with id: ' + id_string
        if not is_sync():
            close(exchange)
        return True

    def test_hyperliquid(self):
        exchange = self.init_offline_exchange('hyperliquid')
        id = '1'
        request = None
        try:
            exchange.create_order('SOL/USDC:USDC', 'limit', 'buy', 1, 100)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        broker_id = str((request['action']['brokerCode']))
        assert broker_id == id, 'hyperliquid - brokerId: ' + broker_id + ' does not start with id: ' + id
        if not is_sync():
            close(exchange)
        return True

    def test_coinbaseinternational(self):
        exchange = self.init_offline_exchange('coinbaseinternational')
        exchange.options['portfolio'] = 'random'
        id = 'nfqkvdjp'
        assert exchange.options['brokerId'] == id, 'id not in options'
        request = None
        try:
            exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        client_order_id = request['client_order_id']
        assert client_order_id.startswith(str(id)), 'clientOrderId does not start with id'
        if not is_sync():
            close(exchange)
        return True

    def test_coinbase_advanced(self):
        exchange = self.init_offline_exchange('coinbase')
        id = 'ccxt'
        assert exchange.options['brokerId'] == id, 'id not in options'
        request = None
        try:
            exchange.create_order('BTC/USDC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        client_order_id = request['client_order_id']
        assert client_order_id.startswith(str(id)), 'clientOrderId does not start with id'
        if not is_sync():
            close(exchange)
        return True

    def test_woofi_pro(self):
        exchange = self.init_offline_exchange('woofipro')
        exchange.secret = 'secretsecretsecretsecretsecretsecretsecrets'
        id = 'CCXT'
        exchange.load_markets()
        request = None
        try:
            exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        broker_id = request['order_tag']
        assert broker_id == id, 'woofipro - id: ' + id + ' different from  broker_id: ' + broker_id
        if not is_sync():
            close(exchange)
        return True

    def test_oxfun(self):
        exchange = self.init_offline_exchange('oxfun')
        exchange.secret = 'secretsecretsecretsecretsecretsecretsecrets'
        id = 1000
        exchange.load_markets()
        request = None
        try:
            exchange.create_order('BTC/USD:OX', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        orders = request['orders']
        first = orders[0]
        broker_id = first['source']
        assert broker_id == id, 'oxfun - id: ' + str(id) + ' different from  broker_id: ' + str(broker_id)
        return True

    def test_xt(self):
        exchange = self.init_offline_exchange('xt')
        id = 'CCXT'
        spot_order_request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            spot_order_request = json_parse(exchange.last_request_body)
        spot_media = spot_order_request['media']
        assert spot_media == id, 'xt - id: ' + id + ' different from swap tag: ' + spot_media
        swap_order_request = None
        try:
            exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            swap_order_request = json_parse(exchange.last_request_body)
        swap_media = swap_order_request['clientMedia']
        assert swap_media == id, 'xt - id: ' + id + ' different from swap tag: ' + swap_media
        if not is_sync():
            close(exchange)
        return True

    def test_vertex(self):
        exchange = self.init_offline_exchange('vertex')
        exchange.walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781'
        exchange.privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b'
        exchange.options['v1contracts'] = {
            'chain_id': '42161',
            'endpoint_addr': '0xbbee07b3e8121227afcfe1e2b82772246226128e',
            'book_addrs': ['0x0000000000000000000000000000000000000000', '0x70e5911371472e406f1291c621d1c8f207764d73', '0xf03f457a30e598d5020164a339727ef40f2b8fbc', '0x1c6281a78aa0ed88949c319cba5f0f0de2ce8353', '0xfe653438a1a4a7f56e727509c341d60a7b54fa91', '0xb6304e9a6ca241376a5fc9294daa8fca65ddcdcd', '0x01ec802ae0ab1b2cc4f028b9fe6eb954aef06ed1', '0x0000000000000000000000000000000000000000', '0x9c52d5c4df5a68955ad088a781b4ab364a861e9e', '0x0000000000000000000000000000000000000000', '0x2a3bcda1bb3ef649f3571c96c597c3d2b25edc79', '0x0000000000000000000000000000000000000000', '0x0492ff9807f82856781488015ef7aa5526c0edd6', '0x0000000000000000000000000000000000000000', '0xea884c82418ebc21cd080b8f40ecc4d06a6a6883', '0x0000000000000000000000000000000000000000', '0x5ecf68f983253a818ca8c17a56a4f2fb48d6ec6b', '0x0000000000000000000000000000000000000000', '0xba3f57a977f099905531f7c2f294aad7b56ed254', '0x0000000000000000000000000000000000000000', '0x0ac8c26d207d0c6aabb3644fea18f530c4d6fc8e', '0x0000000000000000000000000000000000000000', '0x8bd80ad7630b3864bed66cf28f548143ea43dc3b', '0x0000000000000000000000000000000000000000', '0x045391227fc4b2cdd27b95f066864225afc9314e', '0x0000000000000000000000000000000000000000', '0x7d512bef2e6cfd7e7f5f6b2f8027e3728eb7b6c3', '0x0000000000000000000000000000000000000000', '0x678a6c5003b56b5e9a81559e9a0df880407c796f', '0x0000000000000000000000000000000000000000', '0x14b5a17208fa98843cc602b3f74e31c95ded3567', '0xe442a89a07b3888ab10579fbb2824aeceff3a282', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xac28ac205275d7c2d6877bea8657cebe04fd9ae9', '0x0000000000000000000000000000000000000000', '0xed811409bfea901e75cb19ba347c08a154e860c9', '0x0000000000000000000000000000000000000000', '0x0f7afcb1612b305626cff84f84e4169ba2d0f12c', '0x0000000000000000000000000000000000000000', '0xe4b8d903db2ce2d3891ef04cfc3ac56330c1b0c3', '0x5f44362bad629846b7455ad9d36bbc3759a3ef62', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xa64e04ed4b223a71e524dc7ebb7f28e422ccfdde', '0x0000000000000000000000000000000000000000', '0x2ee573caab73c1d8cf0ca6bd3589b67de79628a4', '0x0000000000000000000000000000000000000000', '0x01bb96883a8a478d4410387d4aaf11067edc2c74', '0x0000000000000000000000000000000000000000', '0xe7ed0c559d905436a867cddf07e06921d572363c', '0x0000000000000000000000000000000000000000', '0xa94f9e3433c92a5cd1925494811a67b1943557d9', '0x0000000000000000000000000000000000000000', '0xa63de7f89ba1270b85f3dcc193ff1a1390a7c7c7', '0x0000000000000000000000000000000000000000', '0xc8b0b37dffe3a711a076dc86dd617cc203f36121', '0x0000000000000000000000000000000000000000', '0x646df48947ff785fe609969ff634e7be9d1c34cd', '0x0000000000000000000000000000000000000000', '0x42582b404b0bec4a266631a0e178840b107a0c69', '0x0000000000000000000000000000000000000000', '0x36a94bc3edb1b629d1413091e22dc65fa050f17f', '0x0000000000000000000000000000000000000000', '0xb398d00b5a336f0ad33cfb352fd7646171cec442', '0x0000000000000000000000000000000000000000', '0xb4bc3b00de98e1c0498699379f6607b1f00bd5a1', '0x0000000000000000000000000000000000000000', '0xfe8b7baf68952bac2c04f386223d2013c1b4c601', '0x0000000000000000000000000000000000000000', '0x9c8764ec71f175c97c6c2fd558eb6546fcdbea32', '0x0000000000000000000000000000000000000000', '0x94d31188982c8eccf243e555b22dc57de1dba4e1', '0x0000000000000000000000000000000000000000', '0x407c5e2fadd7555be927c028bc358daa907c797a', '0x0000000000000000000000000000000000000000', '0x7e97da2dbbbdd7fb313cf9dc0581ac7cec999c70', '0x0000000000000000000000000000000000000000', '0x7f8d2662f64dd468c423805f98a6579ad59b28fa', '0x0000000000000000000000000000000000000000', '0x3398adf63fed17cbadd6080a1fb771e6a2a55958', '0x0000000000000000000000000000000000000000', '0xba8910a1d7ab62129729047d453091a1e6356170', '0x0000000000000000000000000000000000000000', '0xdc054bce222fe725da0f17abcef38253bd8bb745', '0x0000000000000000000000000000000000000000', '0xca21693467d0a5ea9e10a5a7c5044b9b3837e694', '0x0000000000000000000000000000000000000000', '0xe0b02de2139256dbae55cf350094b882fbe629ea', '0x0000000000000000000000000000000000000000', '0x02c38368a6f53858aab5a3a8d91d73eb59edf9b9', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xfe8c4778843c3cb047ffe7c0c0154a724c05cab9', '0x0000000000000000000000000000000000000000', '0xe2e88862d9b7379e21c82fc4aec8d71bddbcdb4b', '0x0000000000000000000000000000000000000000', '0xbbaff9e73b30f9cea5c01481f12de75050947fd6', '0x0000000000000000000000000000000000000000', '0xa20f6f381fe0fec5a1035d37ebf8890726377ab9', '0x0000000000000000000000000000000000000000', '0xbad68032d012bf35d3a2a177b242e86684027ed0', '0x0000000000000000000000000000000000000000', '0x0e61ca37f0c67e8a8794e45e264970a2a23a513c', '0x0000000000000000000000000000000000000000', '0xa77b7048e378c5270b15918449ededf87c3a3db3', '0x0000000000000000000000000000000000000000', '0x15afca1e6f02b556fa6551021b3493a1e4a7f44f'],
        }
        id = 5930043274845996
        exchange.load_markets()
        request = None
        try:
            exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        order = request['place_order']
        broker_id = order['id']
        assert broker_id == id, 'vertex - id: ' + str(id) + ' different from  broker_id: ' + str(broker_id)
        if not is_sync():
            close(exchange)
        return True

    def test_paradex(self):
        exchange = self.init_offline_exchange('paradex')
        exchange.walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781'
        exchange.privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b'
        exchange.options['authToken'] = 'token'
        exchange.options['systemConfig'] = {
            'starknet_gateway_url': 'https://potc-testnet-sepolia.starknet.io',
            'starknet_fullnode_rpc_url': 'https://pathfinder.api.testnet.paradex.trade/rpc/v0_7',
            'starknet_chain_id': 'PRIVATE_SN_POTC_SEPOLIA',
            'block_explorer_url': 'https://voyager.testnet.paradex.trade/',
            'paraclear_address': '0x286003f7c7bfc3f94e8f0af48b48302e7aee2fb13c23b141479ba00832ef2c6',
            'paraclear_decimals': 8,
            'paraclear_account_proxy_hash': '0x3530cc4759d78042f1b543bf797f5f3d647cde0388c33734cf91b7f7b9314a9',
            'paraclear_account_hash': '0x41cb0280ebadaa75f996d8d92c6f265f6d040bb3ba442e5f86a554f1765244e',
            'oracle_address': '0x2c6a867917ef858d6b193a0ff9e62b46d0dc760366920d631715d58baeaca1f',
            'bridged_tokens': [{
    'name': 'TEST USDC',
    'symbol': 'USDC',
    'decimals': 6,
    'l1_token_address': '0x29A873159D5e14AcBd63913D4A7E2df04570c666',
    'l1_bridge_address': '0x8586e05adc0C35aa11609023d4Ae6075Cb813b4C',
    'l2_token_address': '0x6f373b346561036d98ea10fb3e60d2f459c872b1933b50b21fe6ef4fda3b75e',
    'l2_bridge_address': '0x46e9237f5408b5f899e72125dd69bd55485a287aaf24663d3ebe00d237fc7ef',
}],
            'l1_core_contract_address': '0x582CC5d9b509391232cd544cDF9da036e55833Af',
            'l1_operator_address': '0x11bACdFbBcd3Febe5e8CEAa75E0Ef6444d9B45FB',
            'l1_chain_id': '11155111',
            'liquidation_fee': '0.2',
        }
        req_headers = None
        id = 'CCXT'
        assert exchange.options['broker'] == id, 'paradex - id: ' + id + ' not in options'
        exchange.load_markets()
        try:
            exchange.create_order('BTC/USD:USDC', 'limit', 'buy', 1, 20000)
        except Exception as e:
            req_headers = exchange.last_request_headers
        assert req_headers['PARADEX-PARTNER'] == id, 'paradex - id: ' + id + ' not in headers'
        if not is_sync():
            close(exchange)
        return True

    def test_hashkey(self):
        exchange = self.init_offline_exchange('hashkey')
        req_headers = None
        id = '10000700011'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        assert req_headers['INPUT-SOURCE'] == id, 'hashkey - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_coincatch(self):
        exchange = self.init_offline_exchange('coincatch')
        req_headers = None
        id = '47cfy'
        try:
            exchange.create_order('BTC/USDT', 'limit', 'buy', 1, 20000)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        assert req_headers['X-CHANNEL-API-CODE'] == id, 'coincatch - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_defx(self):
        exchange = self.init_offline_exchange('defx')
        req_headers = None
        try:
            exchange.create_order('DOGE/USDC:USDC', 'limit', 'buy', 100, 1)
        except Exception as e:
            # we expect an error here, we're only interested in the headers
            req_headers = exchange.last_request_headers
        id = 'ccxt'
        assert req_headers['X-DEFX-SOURCE'] == id, 'defx - id: ' + id + ' not in headers.'
        if not is_sync():
            close(exchange)
        return True

    def test_cryptomus(self):
        exchange = self.init_offline_exchange('cryptomus')
        request = None
        try:
            exchange.create_order('BTC/USDT', 'limit', 'sell', 1, 20000)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        tag = 'ccxt'
        assert request['tag'] == tag, 'cryptomus - tag: ' + tag + ' not in request.'
        if not is_sync():
            close(exchange)
        return True

    def test_derive(self):
        exchange = self.init_offline_exchange('derive')
        id = '0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749'
        assert exchange.options['id'] == id, 'derive - id: ' + id + ' not in options'
        request = None
        try:
            params = {
                'subaccount_id': 1234,
                'max_fee': 10,
                'deriveWalletAddress': '0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749',
            }
            exchange.walletAddress = '0x0ad42b8e602c2d3d475ae52d678cf63d84ab2749'
            exchange.privateKey = '0x7b77bb7b20e92bbb85f2a22b330b896959229a5790e35f2f290922de3fb22ad5'
            exchange.create_order('LBTC/USDC', 'limit', 'sell', 0.01, 3000, params)
        except Exception as e:
            request = json_parse(exchange.last_request_body)
        assert request['referral_code'] == id, 'derive - referral_code: ' + id + ' not in request.'
        if not is_sync():
            close(exchange)
        return True
