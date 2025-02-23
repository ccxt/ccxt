<?php

namespace ccxt;

use \React\Async;
use \React\Promise;
use ccxt\AuthenticationError;
use ccxt\NotSupported;
use ccxt\InvalidProxySettings;
use ccxt\OperationFailed;
use ccxt\ExchangeNotAvailable;
use ccxt\OnMaintenance;

require_once __DIR__ . '/tests_helpers.php';

#[\AllowDynamicProperties]
class testMainClass {
    public $id_tests = false;
    public $request_tests_failed = false;
    public $response_tests_failed = false;
    public $request_tests = false;
    public $ws_tests = false;
    public $response_tests = false;
    public $info = false;
    public $verbose = false;
    public $debug = false;
    public $private_test = false;
    public $private_test_only = false;
    public $load_keys = false;
    public $sandbox = false;
    public $only_specific_tests = [];
    public $skipped_settings_for_exchange = array();
    public $skipped_methods = array();
    public $checked_public_tests = array();
    public $test_files = array();
    public $public_tests = array();
    public $ext = '';
    public $lang = '';
    public $proxy_test_file_name = 'proxies';

    public function parse_cli_args_and_props() {
        $this->response_tests = get_cli_arg_value('--responseTests') || get_cli_arg_value('--response');
        $this->id_tests = get_cli_arg_value('--idTests');
        $this->request_tests = get_cli_arg_value('--requestTests') || get_cli_arg_value('--request');
        $this->info = get_cli_arg_value('--info');
        $this->verbose = get_cli_arg_value('--verbose');
        $this->debug = get_cli_arg_value('--debug');
        $this->private_test = get_cli_arg_value('--private');
        $this->private_test_only = get_cli_arg_value('--privateOnly');
        $this->sandbox = get_cli_arg_value('--sandbox');
        $this->load_keys = get_cli_arg_value('--loadKeys');
        $this->ws_tests = get_cli_arg_value('--ws');
        $this->lang = get_lang();
        $this->ext = get_ext();
    }

    public function init($exchange_id, $symbol_argv, $method_argv) {
        return Async\async(function () use ($exchange_id, $symbol_argv, $method_argv) {
            $this->parse_cli_args_and_props();
            if ($this->request_tests && $this->response_tests) {
                Async\await($this->run_static_request_tests($exchange_id, $symbol_argv));
                Async\await($this->run_static_response_tests($exchange_id, $symbol_argv));
                return true;
            }
            if ($this->response_tests) {
                Async\await($this->run_static_response_tests($exchange_id, $symbol_argv));
                return true;
            }
            if ($this->request_tests) {
                Async\await($this->run_static_request_tests($exchange_id, $symbol_argv)); // symbol here is the testname
                return true;
            }
            if ($this->id_tests) {
                Async\await($this->run_broker_id_tests());
                return true;
            }
            $new_line = '\n';
            dump($new_line . '' . $new_line . '' . '[INFO] TESTING ', $this->ext, array(
                'exchange' => $exchange_id,
                'symbol' => $symbol_argv,
                'method' => $method_argv,
                'isWs' => $this->ws_tests,
                'useProxy' => get_cli_arg_value('--useProxy'),
            ), $new_line);
            $exchange_args = array(
                'verbose' => $this->verbose,
                'debug' => $this->debug,
                'enableRateLimit' => true,
                'timeout' => 30000,
            );
            $exchange = init_exchange($exchange_id, $exchange_args, $this->ws_tests);
            if ($exchange->alias) {
                exit_script(0);
            }
            Async\await($this->import_files($exchange));
            assert(count(is_array($this->test_files) ? array_keys($this->test_files) : array()) > 0, 'Test files were not loaded'); // ensure test files are found & filled
            $this->expand_settings($exchange);
            $this->check_if_specific_test_is_chosen($method_argv);
            Async\await($this->start_test($exchange, $symbol_argv));
            exit_script(0); // needed to be explicitly finished for WS tests
        }) ();
    }

    public function check_if_specific_test_is_chosen($method_argv) {
        if ($method_argv !== null) {
            $test_file_names = is_array($this->test_files) ? array_keys($this->test_files) : array();
            $possible_method_names = explode(',', $method_argv); // i.e. `test.ts binance fetchBalance,fetchDeposits`
            if (count($possible_method_names) >= 1) {
                for ($i = 0; $i < count($test_file_names); $i++) {
                    $test_file_name = $test_file_names[$i];
                    for ($j = 0; $j < count($possible_method_names); $j++) {
                        $method_name = $possible_method_names[$j];
                        $method_name = str_replace('()', '', $method_name);
                        if ($test_file_name === $method_name) {
                            $this->only_specific_tests[] = $test_file_name;
                        }
                    }
                }
            }
        }
    }

    public function import_files($exchange) {
        return Async\async(function () use ($exchange) {
            $properties = is_array($exchange->has) ? array_keys($exchange->has) : array();
            $properties[] = 'loadMarkets';
            if (is_sync()) {
                $this->test_files = get_test_files_sync($properties, $this->ws_tests);
            } else {
                $this->test_files = Async\await(get_test_files($properties, $this->ws_tests));
            }
            return true;
        }) ();
    }

    public function load_credentials_from_env($exchange) {
        $exchange_id = $exchange->id;
        $req_creds = get_exchange_prop($exchange, 're' . 'quiredCredentials'); // dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        $objkeys = is_array($req_creds) ? array_keys($req_creds) : array();
        for ($i = 0; $i < count($objkeys); $i++) {
            $credential = $objkeys[$i];
            $is_required = $req_creds[$credential];
            if ($is_required && get_exchange_prop($exchange, $credential) === null) {
                $full_key = $exchange_id . '_' . $credential;
                $credential_env_name = strtoupper($full_key); // example: KRAKEN_APIKEY
                $env_vars = get_env_vars();
                $credential_value = (is_array($env_vars) && array_key_exists($credential_env_name, $env_vars)) ? $env_vars[$credential_env_name] : null;
                if ($credential_value) {
                    set_exchange_prop($exchange, $credential, $credential_value);
                }
            }
        }
    }

    public function expand_settings($exchange) {
        $exchange_id = $exchange->id;
        $keys_global = get_root_dir() . 'keys.json';
        $keys_local = get_root_dir() . 'keys.local.json';
        $keys_global_exists = io_file_exists($keys_global);
        $keys_local_exists = io_file_exists($keys_local);
        $global_settings = array();
        if ($keys_global_exists) {
            $global_settings = io_file_read($keys_global);
        }
        $local_settings = array();
        if ($keys_local_exists) {
            $local_settings = io_file_read($keys_local);
        }
        $all_settings = $exchange->deep_extend($global_settings, $local_settings);
        $exchange_settings = $exchange->safe_value($all_settings, $exchange_id, array());
        if ($exchange_settings) {
            $setting_keys = is_array($exchange_settings) ? array_keys($exchange_settings) : array();
            for ($i = 0; $i < count($setting_keys); $i++) {
                $key = $setting_keys[$i];
                if ($exchange_settings[$key]) {
                    $final_value = null;
                    if (is_array($exchange_settings[$key])) {
                        $existing = get_exchange_prop($exchange, $key, array());
                        $final_value = $exchange->deep_extend($existing, $exchange_settings[$key]);
                    } else {
                        $final_value = $exchange_settings[$key];
                    }
                    set_exchange_prop($exchange, $key, $final_value);
                }
            }
        }
        // credentials
        if ($this->load_keys) {
            $this->load_credentials_from_env($exchange);
        }
        // skipped tests
        $skipped_file = get_root_dir() . 'skip-tests.json';
        $skipped_settings = io_file_read($skipped_file);
        $this->skipped_settings_for_exchange = $exchange->safe_value($skipped_settings, $exchange_id, array());
        $skipped_settings_for_exchange = $this->skipped_settings_for_exchange;
        // others
        $timeout = $exchange->safe_value($skipped_settings_for_exchange, 'timeout');
        if ($timeout !== null) {
            $exchange->timeout = $exchange->parse_to_int($timeout);
        }
        if (get_cli_arg_value('--useProxy')) {
            $exchange->http_proxy = $exchange->safe_string($skipped_settings_for_exchange, 'httpProxy');
            $exchange->https_proxy = $exchange->safe_string($skipped_settings_for_exchange, 'httpsProxy');
            $exchange->ws_proxy = $exchange->safe_string($skipped_settings_for_exchange, 'wsProxy');
            $exchange->wss_proxy = $exchange->safe_string($skipped_settings_for_exchange, 'wssProxy');
        }
        $this->skipped_methods = $exchange->safe_value($skipped_settings_for_exchange, 'skipMethods', array());
        $this->checked_public_tests = array();
    }

    public function add_padding($message, $size) {
        // has to be transpilable
        $res = '';
        $message_length = strlen($message); // avoid php transpilation issue
        $missing_space = $size - $message_length - 0; // - 0 is added just to trick transpile to treat the .length as a string for php
        if ($missing_space > 0) {
            for ($i = 0; $i < $missing_space; $i++) {
                $res .= ' ';
            }
        }
        return $message . $res;
    }

    public function test_method($method_name, $exchange, $args, $is_public) {
        // todo: temporary skip for c#
        return Async\async(function () use ($method_name, $exchange, $args, $is_public) {
            if (mb_strpos($method_name, 'OrderBook') !== false && $this->ext === 'cs') {
                $exchange->options['checksum'] = false;
            }
            // todo: temporary skip for php
            if (mb_strpos($method_name, 'OrderBook') !== false && $this->ext === 'php') {
                return true;
            }
            $skipped_properties_for_method = $this->get_skips($exchange, $method_name);
            $is_load_markets = ($method_name === 'loadMarkets');
            $is_fetch_currencies = ($method_name === 'fetchCurrencies');
            $is_proxy_test = ($method_name === $this->proxy_test_file_name);
            $is_feature_test = ($method_name === 'features');
            // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
            if (!$is_public && (is_array($this->checked_public_tests) && array_key_exists($method_name, $this->checked_public_tests)) && !$is_fetch_currencies) {
                return true;
            }
            $skip_message = null;
            $supported_by_exchange = (is_array($exchange->has) && array_key_exists($method_name, $exchange->has)) && $exchange->has[$method_name];
            if (!$is_load_markets && (count($this->only_specific_tests) > 0 && !$exchange->in_array($method_name, $this->only_specific_tests))) {
                $skip_message = '[INFO] IGNORED_TEST';
            } elseif (!$is_load_markets && !$supported_by_exchange && !$is_proxy_test && !$is_feature_test) {
                $skip_message = '[INFO] UNSUPPORTED_TEST'; // keep it aligned with the longest message
            } elseif (is_string($skipped_properties_for_method)) {
                $skip_message = '[INFO] SKIPPED_TEST';
            } elseif (!(is_array($this->test_files) && array_key_exists($method_name, $this->test_files))) {
                $skip_message = '[INFO] UNIMPLEMENTED_TEST';
            }
            // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
            if ($is_load_markets) {
                Async\await($exchange->load_markets(true));
            }
            $name = $exchange->id;
            if ($skip_message) {
                if ($this->info) {
                    dump($this->add_padding($skip_message, 25), $name, $method_name);
                }
                return true;
            }
            if ($this->info) {
                $args_stringified = '(' . $exchange->json($args) . ')'; // args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
                dump($this->add_padding('[INFO] TESTING', 25), $name, $method_name, $args_stringified);
            }
            if (is_sync()) {
                call_method_sync($this->test_files, $method_name, $exchange, $skipped_properties_for_method, $args);
            } else {
                Async\await(call_method($this->test_files, $method_name, $exchange, $skipped_properties_for_method, $args));
            }
            if ($this->info) {
                dump($this->add_padding('[INFO] TESTING DONE', 25), $name, $method_name);
            }
            // add to the list of successed tests
            if ($is_public) {
                $this->checked_public_tests[$method_name] = true;
            }
            return true;
        }) ();
    }

    public function get_skips($exchange, $method_name) {
        $final_skips = array();
        // check the exact method (i.e. `fetchTrades`) and language-specific (i.e. `fetchTrades.php`)
        $method_names = [$method_name, $method_name . '.' . $this->ext];
        for ($i = 0; $i < count($method_names); $i++) {
            $m_name = $method_names[$i];
            if (is_array($this->skipped_methods) && array_key_exists($m_name, $this->skipped_methods)) {
                // if whole method is skipped, by assigning a string to it, i.e. "fetchOrders":"blabla"
                if (is_string($this->skipped_methods[$m_name])) {
                    return $this->skipped_methods[$m_name];
                } else {
                    $final_skips = $exchange->deep_extend($final_skips, $this->skipped_methods[$m_name]);
                }
            }
        }
        // get "object-specific" skips
        $object_skips = array(
            'orderBook' => ['fetchOrderBook', 'fetchOrderBooks', 'fetchL2OrderBook', 'watchOrderBook', 'watchOrderBookForSymbols'],
            'ticker' => ['fetchTicker', 'fetchTickers', 'watchTicker', 'watchTickers'],
            'trade' => ['fetchTrades', 'watchTrades', 'watchTradesForSymbols'],
            'ohlcv' => ['fetchOHLCV', 'watchOHLCV', 'watchOHLCVForSymbols'],
            'ledger' => ['fetchLedger', 'fetchLedgerEntry'],
            'depositWithdraw' => ['fetchDepositsWithdrawals', 'fetchDeposits', 'fetchWithdrawals'],
            'depositWithdrawFee' => ['fetchDepositWithdrawFee', 'fetchDepositWithdrawFees'],
        );
        $object_names = is_array($object_skips) ? array_keys($object_skips) : array();
        for ($i = 0; $i < count($object_names); $i++) {
            $object_name = $object_names[$i];
            $object_methods = $object_skips[$object_name];
            if ($exchange->in_array($method_name, $object_methods)) {
                // if whole object is skipped, by assigning a string to it, i.e. "orderBook":"blabla"
                if ((is_array($this->skipped_methods) && array_key_exists($object_name, $this->skipped_methods)) && (is_string($this->skipped_methods[$object_name]))) {
                    return $this->skipped_methods[$object_name];
                }
                $extra_skips = $exchange->safe_dict($this->skipped_methods, $object_name, array());
                $final_skips = $exchange->deep_extend($final_skips, $extra_skips);
            }
        }
        // extend related skips
        // - if 'timestamp' is skipped, we should do so for 'datetime' too
        // - if 'bid' is skipped, skip 'ask' too
        if ((is_array($final_skips) && array_key_exists('timestamp', $final_skips)) && !(is_array($final_skips) && array_key_exists('datetime', $final_skips))) {
            $final_skips['datetime'] = $final_skips['timestamp'];
        }
        if ((is_array($final_skips) && array_key_exists('bid', $final_skips)) && !(is_array($final_skips) && array_key_exists('ask', $final_skips))) {
            $final_skips['ask'] = $final_skips['bid'];
        }
        if ((is_array($final_skips) && array_key_exists('baseVolume', $final_skips)) && !(is_array($final_skips) && array_key_exists('quoteVolume', $final_skips))) {
            $final_skips['quoteVolume'] = $final_skips['baseVolume'];
        }
        return $final_skips;
    }

    public function test_safe($method_name, $exchange, $args = [], $is_public = false) {
        // `testSafe` method does not throw an exception, instead mutes it. The reason we
        // mute the thrown exceptions here is because we don't want to stop the whole
        // tests queue if any single test-method fails. Instead, they are echoed with
        // formatted message "[TEST_FAILURE] ..." and that output is then regex-matched by
        // run-tests.js, so the exceptions are still printed out to console from there.
        return Async\async(function () use ($method_name, $exchange, $args, $is_public) {
            $max_retries = 3;
            $args_stringified = $exchange->json($args); // args.join() breaks when we provide a list of symbols or multidimensional array; "args.toString()" breaks bcz of "array to string conversion"
            for ($i = 0; $i < $max_retries; $i++) {
                try {
                    Async\await($this->test_method($method_name, $exchange, $args, $is_public));
                    return true;
                } catch(\Throwable $ex) {
                    $e = get_root_exception($ex);
                    $is_load_markets = ($method_name === 'loadMarkets');
                    $is_auth_error = ($e instanceof AuthenticationError);
                    $is_not_supported = ($e instanceof NotSupported);
                    $is_operation_failed = ($e instanceof OperationFailed); // includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "OperationFailed", "InvalidNonce", ...
                    if ($is_operation_failed) {
                        // if last retry was gone with same `tempFailure` error, then let's eventually return false
                        if ($i === $max_retries - 1) {
                            $is_on_maintenance = ($e instanceof OnMaintenance);
                            $is_exchange_not_available = ($e instanceof ExchangeNotAvailable);
                            $should_fail = null;
                            $ret_success = null;
                            if ($is_load_markets) {
                                // if "loadMarkets" does not succeed, we must return "false" to caller method, to stop tests continual
                                $ret_success = false;
                                // we might not break exchange tests, if exchange is on maintenance at this moment
                                if ($is_on_maintenance) {
                                    $should_fail = false;
                                } else {
                                    $should_fail = true;
                                }
                            } else {
                                // for any other method tests:
                                if ($is_exchange_not_available && !$is_on_maintenance) {
                                    // break exchange tests if "ExchangeNotAvailable" exception is thrown, but it's not maintenance
                                    $should_fail = true;
                                    $ret_success = false;
                                } else {
                                    // in all other cases of OperationFailed, show Warning, but don't mark test as failed
                                    $should_fail = false;
                                    $ret_success = true;
                                }
                            }
                            // output the message
                            $fail_type = $should_fail ? '[TEST_FAILURE]' : '[TEST_WARNING]';
                            dump($fail_type, 'Method could not be tested due to a repeated Network/Availability issues', ' | ', $exchange->id, $method_name, $args_stringified, exception_message($e));
                            return $ret_success;
                        } else {
                            // wait and retry again
                            // (increase wait time on every retry)
                            Async\await($exchange->sleep(($i + 1) * 1000));
                        }
                    } else {
                        // if it's loadMarkets, then fail test, because it's mandatory for tests
                        if ($is_load_markets) {
                            dump('[TEST_FAILURE]', 'Exchange can not load markets', exception_message($e), $exchange->id, $method_name, $args_stringified);
                            return false;
                        }
                        // if the specific arguments to the test method throws "NotSupported" exception
                        // then let's don't fail the test
                        if ($is_not_supported) {
                            if ($this->info) {
                                dump('[INFO] NOT_SUPPORTED', exception_message($e), $exchange->id, $method_name, $args_stringified);
                            }
                            return true;
                        }
                        // If public test faces authentication error, we don't break (see comments under `testSafe` method)
                        if ($is_public && $is_auth_error) {
                            if ($this->info) {
                                dump('[INFO]', 'Authentication problem for public method', exception_message($e), $exchange->id, $method_name, $args_stringified);
                            }
                            return true;
                        } else {
                            dump('[TEST_FAILURE]', exception_message($e), $exchange->id, $method_name, $args_stringified);
                            return false;
                        }
                    }
                }
            }
            return true;
        }) ();
    }

    public function run_public_tests($exchange, $symbol) {
        return Async\async(function () use ($exchange, $symbol) {
            $tests = array(
                'features' => [],
                'fetchCurrencies' => [],
                'fetchTicker' => [$symbol],
                'fetchTickers' => [$symbol],
                'fetchLastPrices' => [$symbol],
                'fetchOHLCV' => [$symbol],
                'fetchTrades' => [$symbol],
                'fetchOrderBook' => [$symbol],
                'fetchL2OrderBook' => [$symbol],
                'fetchOrderBooks' => [],
                'fetchBidsAsks' => [],
                'fetchStatus' => [],
                'fetchTime' => [],
            );
            if ($this->ws_tests) {
                $tests = array(
                    'watchOHLCV' => [$symbol],
                    'watchOHLCVForSymbols' => [$symbol],
                    'watchTicker' => [$symbol],
                    'watchTickers' => [$symbol],
                    'watchBidsAsks' => [$symbol],
                    'watchOrderBook' => [$symbol],
                    'watchOrderBookForSymbols' => [[$symbol]],
                    'watchTrades' => [$symbol],
                    'watchTradesForSymbols' => [[$symbol]],
                );
            }
            $market = $exchange->market($symbol);
            $is_spot = $market['spot'];
            if (!$this->ws_tests) {
                if ($is_spot) {
                    $tests['fetchCurrencies'] = [];
                } else {
                    $tests['fetchFundingRates'] = [$symbol];
                    $tests['fetchFundingRate'] = [$symbol];
                    $tests['fetchFundingRateHistory'] = [$symbol];
                    $tests['fetchIndexOHLCV'] = [$symbol];
                    $tests['fetchMarkOHLCV'] = [$symbol];
                    $tests['fetchPremiumIndexOHLCV'] = [$symbol];
                }
            }
            $this->public_tests = $tests;
            Async\await($this->run_tests($exchange, $tests, true));
            return true;
        }) ();
    }

    public function run_tests($exchange, $tests, $is_public_test) {
        return Async\async(function () use ($exchange, $tests, $is_public_test) {
            $test_names = is_array($tests) ? array_keys($tests) : array();
            $promises = [];
            for ($i = 0; $i < count($test_names); $i++) {
                $test_name = $test_names[$i];
                $test_args = $tests[$test_name];
                $promises[] = $this->test_safe($test_name, $exchange, $test_args, $is_public_test);
            }
            // todo - not yet ready in other langs too
            // promises.push (testThrottle ());
            $results = Async\await(Promise\all($promises));
            // now count which test-methods retuned `false` from "testSafe" and dump that info below
            $failed_methods = [];
            for ($i = 0; $i < count($test_names); $i++) {
                $test_name = $test_names[$i];
                $test_returned_value = $results[$i];
                if (!$test_returned_value) {
                    $failed_methods[] = $test_name;
                }
            }
            $test_prefix_string = $is_public_test ? 'PUBLIC_TESTS' : 'PRIVATE_TESTS';
            if (count($failed_methods)) {
                $errors_string = implode(', ', $failed_methods);
                dump('[TEST_FAILURE]', $exchange->id, $test_prefix_string, 'Failed methods : ' . $errors_string);
            }
            if ($this->info) {
                dump($this->add_padding('[INFO] END ' . $test_prefix_string . ' ' . $exchange->id, 25));
            }
            return true;
        }) ();
    }

    public function load_exchange($exchange) {
        return Async\async(function () use ($exchange) {
            $result = Async\await($this->test_safe('loadMarkets', $exchange, [], true));
            if (!$result) {
                return false;
            }
            $exchange_symbols_length = count($exchange->symbols);
            dump('[INFO:MAIN] Exchange loaded', $exchange_symbols_length, 'symbols');
            return true;
        }) ();
    }

    public function get_test_symbol($exchange, $is_spot, $symbols) {
        $symbol = null;
        $preferred_spot_symbol = $exchange->safe_string($this->skipped_settings_for_exchange, 'preferredSpotSymbol');
        $preferred_swap_symbol = $exchange->safe_string($this->skipped_settings_for_exchange, 'preferredSwapSymbol');
        if ($is_spot && $preferred_spot_symbol) {
            return $preferred_spot_symbol;
        } elseif (!$is_spot && $preferred_swap_symbol) {
            return $preferred_swap_symbol;
        }
        for ($i = 0; $i < count($symbols); $i++) {
            $s = $symbols[$i];
            $market = $exchange->safe_value($exchange->markets, $s);
            if ($market !== null) {
                $active = $exchange->safe_value($market, 'active');
                if ($active || ($active === null)) {
                    $symbol = $s;
                    break;
                }
            }
        }
        return $symbol;
    }

    public function get_exchange_code($exchange, $codes = null) {
        if ($codes === null) {
            $codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT'];
        }
        $code = $codes[0];
        for ($i = 0; $i < count($codes); $i++) {
            if (is_array($exchange->currencies) && array_key_exists($codes[$i], $exchange->currencies)) {
                return $codes[$i];
            }
        }
        return $code;
    }

    public function get_markets_from_exchange($exchange, $spot = true) {
        $res = array();
        $markets = $exchange->markets;
        $keys = is_array($markets) ? array_keys($markets) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $market = $markets[$key];
            if ($spot && $market['spot']) {
                $res[$market['symbol']] = $market;
            } elseif (!$spot && !$market['spot']) {
                $res[$market['symbol']] = $market;
            }
        }
        return $res;
    }

    public function get_valid_symbol($exchange, $spot = true) {
        $current_type_markets = $this->get_markets_from_exchange($exchange, $spot);
        $codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BNB', 'DASH', 'DOGE', 'ETC', 'TRX', 'USDT', 'USDC', 'USD', 'EUR', 'TUSD', 'CNY', 'JPY', 'BRL'];
        $spot_symbols = ['BTC/USDT', 'BTC/USDC', 'BTC/USD', 'BTC/CNY', 'BTC/EUR', 'BTC/AUD', 'BTC/BRL', 'BTC/JPY', 'ETH/USDT', 'ETH/USDC', 'ETH/USD', 'ETH/CNY', 'ETH/EUR', 'ETH/AUD', 'ETH/BRL', 'ETH/JPY', 'EUR/USDT', 'EUR/USD', 'EUR/USDC', 'USDT/EUR', 'USD/EUR', 'USDC/EUR', 'BTC/ETH', 'ETH/BTC'];
        $swap_symbols = ['BTC/USDT:USDT', 'BTC/USDC:USDC', 'BTC/USD:USD', 'ETH/USDT:USDT', 'ETH/USDC:USDC', 'ETH/USD:USD', 'BTC/USD:BTC', 'ETH/USD:ETH'];
        $target_symbols = $spot ? $spot_symbols : $swap_symbols;
        $symbol = $this->get_test_symbol($exchange, $spot, $target_symbols);
        // if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
        if ($symbol === null) {
            for ($i = 0; $i < count($codes); $i++) {
                $current_code = $codes[$i];
                $markets_array_for_current_code = $exchange->filter_by($current_type_markets, 'base', $current_code);
                $indexed_mkts = $exchange->index_by($markets_array_for_current_code, 'symbol');
                $symbols_array_for_current_code = is_array($indexed_mkts) ? array_keys($indexed_mkts) : array();
                $symbols_length = count($symbols_array_for_current_code);
                if ($symbols_length) {
                    $symbol = $this->get_test_symbol($exchange, $spot, $symbols_array_for_current_code);
                    break;
                }
            }
        }
        // if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if ($symbol === null) {
            $active_markets = $exchange->filter_by($current_type_markets, 'active', true);
            $active_symbols = [];
            for ($i = 0; $i < count($active_markets); $i++) {
                $active_symbols[] = $active_markets[$i]['symbol'];
            }
            $symbol = $this->get_test_symbol($exchange, $spot, $active_symbols);
        }
        if ($symbol === null) {
            $values = is_array($current_type_markets) ? array_values($current_type_markets) : array();
            $values_length = count($values);
            if ($values_length > 0) {
                $first = $values[0];
                if ($first !== null) {
                    $symbol = $first['symbol'];
                }
            }
        }
        return $symbol;
    }

    public function test_exchange($exchange, $provided_symbol = null) {
        return Async\async(function () use ($exchange, $provided_symbol) {
            $spot_symbol = null;
            $swap_symbol = null;
            if ($provided_symbol !== null) {
                $market = $exchange->market($provided_symbol);
                if ($market['spot']) {
                    $spot_symbol = $provided_symbol;
                } else {
                    $swap_symbol = $provided_symbol;
                }
            } else {
                if ($exchange->has['spot']) {
                    $spot_symbol = $this->get_valid_symbol($exchange, true);
                }
                if ($exchange->has['swap']) {
                    $swap_symbol = $this->get_valid_symbol($exchange, false);
                }
            }
            if ($spot_symbol !== null) {
                dump('[INFO:MAIN] Selected SPOT SYMBOL:', $spot_symbol);
            }
            if ($swap_symbol !== null) {
                dump('[INFO:MAIN] Selected SWAP SYMBOL:', $swap_symbol);
            }
            if (!$this->private_test_only) {
                // note, spot & swap tests should run sequentially, because of conflicting `exchange.options['defaultType']` setting
                if ($exchange->has['spot'] && $spot_symbol !== null) {
                    if ($this->info) {
                        dump('[INFO] ### SPOT TESTS ###');
                    }
                    $exchange->options['defaultType'] = 'spot';
                    Async\await($this->run_public_tests($exchange, $spot_symbol));
                }
                if ($exchange->has['swap'] && $swap_symbol !== null) {
                    if ($this->info) {
                        dump('[INFO] ### SWAP TESTS ###');
                    }
                    $exchange->options['defaultType'] = 'swap';
                    Async\await($this->run_public_tests($exchange, $swap_symbol));
                }
            }
            if ($this->private_test || $this->private_test_only) {
                if ($exchange->has['spot'] && $spot_symbol !== null) {
                    $exchange->options['defaultType'] = 'spot';
                    Async\await($this->run_private_tests($exchange, $spot_symbol));
                }
                if ($exchange->has['swap'] && $swap_symbol !== null) {
                    $exchange->options['defaultType'] = 'swap';
                    Async\await($this->run_private_tests($exchange, $swap_symbol));
                }
            }
            return true;
        }) ();
    }

    public function run_private_tests($exchange, $symbol) {
        return Async\async(function () use ($exchange, $symbol) {
            if (!$exchange->check_required_credentials(false)) {
                dump('[INFO] Skipping private tests', 'Keys not found');
                return true;
            }
            $code = $this->get_exchange_code($exchange);
            // if (exchange.deepExtendedTest) {
            //     await test ('InvalidNonce', exchange, symbol);
            //     await test ('OrderNotFound', exchange, symbol);
            //     await test ('InvalidOrder', exchange, symbol);
            //     await test ('InsufficientFunds', exchange, symbol, balance); // danger zone - won't execute with non-empty balance
            // }
            $tests = array(
                'signIn' => [],
                'fetchBalance' => [],
                'fetchAccounts' => [],
                'fetchTransactionFees' => [],
                'fetchTradingFees' => [],
                'fetchStatus' => [],
                'fetchOrders' => [$symbol],
                'fetchOpenOrders' => [$symbol],
                'fetchClosedOrders' => [$symbol],
                'fetchMyTrades' => [$symbol],
                'fetchLeverageTiers' => [[$symbol]],
                'fetchLedger' => [$code],
                'fetchTransactions' => [$code],
                'fetchDeposits' => [$code],
                'fetchWithdrawals' => [$code],
                'fetchBorrowInterest' => [$code, $symbol],
                'cancelAllOrders' => [$symbol],
                'fetchCanceledOrders' => [$symbol],
                'fetchMarginModes' => [$symbol],
                'fetchPosition' => [$symbol],
                'fetchDeposit' => [$code],
                'createDepositAddress' => [$code],
                'fetchDepositAddress' => [$code],
                'fetchDepositAddresses' => [$code],
                'fetchDepositAddressesByNetwork' => [$code],
                'fetchBorrowRateHistory' => [$code],
                'fetchLedgerEntry' => [$code],
            );
            if (get_cli_arg_value('--fundedTests')) {
                $tests['createOrder'] = [$symbol];
            }
            if ($this->ws_tests) {
                $tests = array(
                    'watchBalance' => [$code],
                    'watchMyTrades' => [$symbol],
                    'watchOrders' => [$symbol],
                    'watchPosition' => [$symbol],
                    'watchPositions' => [$symbol],
                );
            }
            $market = $exchange->market($symbol);
            $is_spot = $market['spot'];
            if (!$this->ws_tests) {
                if ($is_spot) {
                    $tests['fetchCurrencies'] = [];
                } else {
                    // derivatives only
                    $tests['fetchPositions'] = [$symbol]; // this test fetches all positions for 1 symbol
                    $tests['fetchPosition'] = [$symbol];
                    $tests['fetchPositionRisk'] = [$symbol];
                    $tests['setPositionMode'] = [$symbol];
                    $tests['setMarginMode'] = [$symbol];
                    $tests['fetchOpenInterestHistory'] = [$symbol];
                    $tests['fetchFundingRateHistory'] = [$symbol];
                    $tests['fetchFundingHistory'] = [$symbol];
                }
            }
            // const combinedTests = exchange.deepExtend (this.publicTests, privateTests);
            Async\await($this->run_tests($exchange, $tests, false));
        }) ();
    }

    public function test_proxies($exchange) {
        // these tests should be synchronously executed, because of conflicting nature of proxy settings
        return Async\async(function () use ($exchange) {
            $proxy_test_name = $this->proxy_test_file_name;
            // todo: temporary skip for sync py
            if ($this->ext === 'py' && is_sync()) {
                return true;
            }
            // try proxy several times
            $max_retries = 3;
            $exception = null;
            for ($j = 0; $j < $max_retries; $j++) {
                try {
                    Async\await($this->test_method($proxy_test_name, $exchange, [], true));
                    return true;  // if successfull, then end the test
                } catch(\Throwable $e) {
                    $exception = $e;
                    Async\await($exchange->sleep($j * 1000));
                }
            }
            // if exception was set, then throw it
            if ($exception !== null) {
                $error_message = '[TEST_FAILURE] Failed ' . $proxy_test_name . ' : ' . exception_message($exception);
                // temporary comment the below, because c# transpilation failure
                // throw new Exchange Error (errorMessage.toString ());
                dump('[TEST_WARNING]' . $error_message);
            }
            return true;
        }) ();
    }

    public function check_constructor($exchange) {
        // todo: this might be moved in base tests later
        if ($exchange->id === 'binance') {
            assert($exchange->hostname === null, 'binance.com hostname should be empty');
            assert($exchange->urls['api']['public'] === 'https://api.binance.com/api/v3', 'https://api.binance.com/api/v3 does not match: ' . $exchange->urls['api']['public']);
            assert((is_array($exchange->api['sapi']['get']) && array_key_exists('lending/union/account', $exchange->api['sapi']['get'])), 'SAPI should contain the endpoint lending/union/account, ' . json_stringify($exchange->api['sapi']['get']));
        } elseif ($exchange->id === 'binanceus') {
            assert($exchange->hostname === 'binance.us', 'binance.us hostname does not match ' . $exchange->hostname);
            assert($exchange->urls['api']['public'] === 'https://api.binance.us/api/v3', 'https://api.binance.us/api/v3 does not match: ' . $exchange->urls['api']['public']);
        }
    }

    public function start_test($exchange, $symbol) {
        // we do not need to test aliases
        return Async\async(function () use ($exchange, $symbol) {
            if ($exchange->alias) {
                return true;
            }
            $this->check_constructor($exchange);
            if ($this->sandbox || get_exchange_prop($exchange, 'sandbox')) {
                $exchange->set_sandbox_mode(true);
            }
            try {
                $result = Async\await($this->load_exchange($exchange));
                if (!$result) {
                    if (!is_sync()) {
                        Async\await(close($exchange));
                    }
                    return true;
                }
                // if (exchange.id === 'binance') {
                //     // we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
                //     // await this.testProxies (exchange);
                // }
                Async\await($this->test_exchange($exchange, $symbol));
                if (!is_sync()) {
                    Async\await(close($exchange));
                }
            } catch(\Throwable $e) {
                if (!is_sync()) {
                    Async\await(close($exchange));
                }
                throw $e;
            }
        }) ();
    }

    public function assert_static_error($cond, $message, $calculated_output, $stored_output, $key = null) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        $calculated_string = json_stringify($calculated_output);
        $stored_string = json_stringify($stored_output);
        $error_message = $message;
        if ($key !== null) {
            $error_message = '[' . $key . ']';
        }
        $error_message .= ' computed: ' . $stored_string . ' stored: ' . $calculated_string;
        assert($cond, $error_message);
    }

    public function load_markets_from_file($id) {
        // load markets from file
        // to make this test as fast as possible
        // and basically independent from the exchange
        // so we can run it offline
        $filename = get_root_dir() . './ts/src/test/static/markets/' . $id . '.json';
        $content = io_file_read($filename);
        return $content;
    }

    public function load_currencies_from_file($id) {
        $filename = get_root_dir() . './ts/src/test/static/currencies/' . $id . '.json';
        $content = io_file_read($filename);
        return $content;
    }

    public function load_static_data($folder, $target_exchange = null) {
        $result = array();
        if ($target_exchange) {
            // read a single exchange
            $path = $folder . $target_exchange . '.json';
            if (!io_file_exists($path)) {
                dump('[WARN] tests not found: ' . $path);
                return null;
            }
            $result[$target_exchange] = io_file_read($path);
            return $result;
        }
        $files = io_dir_read($folder);
        for ($i = 0; $i < count($files); $i++) {
            $file = $files[$i];
            $exchange_name = str_replace('.json', '', $file);
            $content = io_file_read($folder . $file);
            $result[$exchange_name] = $content;
        }
        return $result;
    }

    public function remove_hostnamefrom_url($url) {
        if ($url === null) {
            return null;
        }
        $url_parts = explode('/', $url);
        $res = '';
        for ($i = 0; $i < count($url_parts); $i++) {
            if ($i > 2) {
                $current = $url_parts[$i];
                if (mb_strpos($current, '?') > -1) {
                    // handle urls like this: /v1/account/accounts?AccessK
                    $current_parts = explode('?', $current);
                    $res .= '/';
                    $res .= $current_parts[0];
                    break;
                }
                $res .= '/';
                $res .= $current;
            }
        }
        return $res;
    }

    public function urlencoded_to_dict($url) {
        $result = array();
        $parts = explode('&', $url);
        for ($i = 0; $i < count($parts); $i++) {
            $part = $parts[$i];
            $key_value = explode('=', $part);
            $keys_length = count($key_value);
            if ($keys_length !== 2) {
                continue;
            }
            $key = $key_value[0];
            $value = $key_value[1];
            if (($value !== null) && ((str_starts_with($value, '[')) || (str_starts_with($value, '{')))) {
                // some exchanges might return something like this: timestamp=1699382693405&batchOrders=[{\"symbol\":\"LTCUSDT\",\"side\":\"BUY\",\"newClientOrderI
                $value = json_parse($value);
            }
            $result[$key] = $value;
        }
        return $result;
    }

    public function assert_new_and_stored_output_inner($exchange, $skip_keys, $new_output, $stored_output, $strict_type_check = true, $asserting_key = null) {
        if (is_null_value($new_output) && is_null_value($stored_output)) {
            return true;
        }
        if (!$new_output && !$stored_output) {
            return true;
        }
        if ((is_array($stored_output)) && (is_array($new_output))) {
            $stored_output_keys = is_array($stored_output) ? array_keys($stored_output) : array();
            $new_output_keys = is_array($new_output) ? array_keys($new_output) : array();
            $stored_keys_length = count($stored_output_keys);
            $new_keys_length = count($new_output_keys);
            $this->assert_static_error($stored_keys_length === $new_keys_length, 'output length mismatch', $stored_output, $new_output);
            // iterate over the keys
            for ($i = 0; $i < count($stored_output_keys); $i++) {
                $key = $stored_output_keys[$i];
                if ($exchange->in_array($key, $skip_keys)) {
                    continue;
                }
                if (!($exchange->in_array($key, $new_output_keys))) {
                    $this->assert_static_error(false, 'output key missing: ' . $key, $stored_output, $new_output);
                }
                $stored_value = $stored_output[$key];
                $new_value = $new_output[$key];
                $this->assert_new_and_stored_output($exchange, $skip_keys, $new_value, $stored_value, $strict_type_check, $key);
            }
        } elseif (gettype($stored_output) === 'array' && array_is_list($stored_output) && (gettype($new_output) === 'array' && array_is_list($new_output))) {
            $stored_array_length = count($stored_output);
            $new_array_length = count($new_output);
            $this->assert_static_error($stored_array_length === $new_array_length, 'output length mismatch', $stored_output, $new_output);
            for ($i = 0; $i < count($stored_output); $i++) {
                $stored_item = $stored_output[$i];
                $new_item = $new_output[$i];
                $this->assert_new_and_stored_output($exchange, $skip_keys, $new_item, $stored_item, $strict_type_check);
            }
        } else {
            // built-in types like strings, numbers, booleans
            $sanitized_new_output = (!$new_output) ? null : $new_output; // we store undefined as nulls in the json file so we need to convert it back
            $sanitized_stored_output = (!$stored_output) ? null : $stored_output;
            $new_output_string = $sanitized_new_output ? ((string) $sanitized_new_output) : 'undefined';
            $stored_output_string = $sanitized_stored_output ? ((string) $sanitized_stored_output) : 'undefined';
            $message_error = 'output value mismatch:' . $new_output_string . ' != ' . $stored_output_string;
            if ($strict_type_check && ($this->lang !== 'C#')) {
                // upon building the request we want strict type check to make sure all the types are correct
                // when comparing the response we want to allow some flexibility, because a 50.0 can be equal to 50 after saving it to the json file
                $this->assert_static_error($sanitized_new_output === $sanitized_stored_output, $message_error, $stored_output, $new_output, $asserting_key);
            } else {
                $is_computed_bool = (is_bool($sanitized_new_output));
                $is_stored_bool = (is_bool($sanitized_stored_output));
                $is_computed_string = (is_string($sanitized_new_output));
                $is_stored_string = (is_string($sanitized_stored_output));
                $is_computed_undefined = ($sanitized_new_output === null);
                $is_stored_undefined = ($sanitized_stored_output === null);
                $should_be_same = ($is_computed_bool === $is_stored_bool) && ($is_computed_string === $is_stored_string) && ($is_computed_undefined === $is_stored_undefined);
                $this->assert_static_error($should_be_same, 'output type mismatch', $stored_output, $new_output, $asserting_key);
                $is_boolean = $is_computed_bool || $is_stored_bool;
                $is_string = $is_computed_string || $is_stored_string;
                $is_undefined = $is_computed_undefined || $is_stored_undefined; // undefined is a perfetly valid value
                if ($is_boolean || $is_string || $is_undefined) {
                    if ($this->lang === 'C#') {
                        // tmp c# number comparsion
                        $is_number = false;
                        try {
                            $exchange->parse_to_numeric($sanitized_new_output);
                            $is_number = true;
                        } catch(\Throwable $e) {
                            // if we can't parse it to number, then it's not a number
                            $is_number = false;
                        }
                        if ($is_number) {
                            $this->assert_static_error($exchange->parse_to_numeric($sanitized_new_output) === $exchange->parse_to_numeric($sanitized_stored_output), $message_error, $stored_output, $new_output, $asserting_key);
                            return true;
                        } else {
                            $this->assert_static_error(convert_ascii($new_output_string) === convert_ascii($stored_output_string), $message_error, $stored_output, $new_output, $asserting_key);
                            return true;
                        }
                    } else {
                        $this->assert_static_error(convert_ascii($new_output_string) === convert_ascii($stored_output_string), $message_error, $stored_output, $new_output, $asserting_key);
                        return true;
                    }
                } else {
                    if ($this->lang === 'C#') {
                        $stringified_new_output = $exchange->number_to_string($sanitized_new_output);
                        $stringified_stored_output = $exchange->number_to_string($sanitized_stored_output);
                        $this->assert_static_error(((string) $stringified_new_output) === ((string) $stringified_stored_output), $message_error, $stored_output, $new_output, $asserting_key);
                    } else {
                        $numeric_new_output = $exchange->parse_to_numeric($new_output_string);
                        $numeric_stored_output = $exchange->parse_to_numeric($stored_output_string);
                        $this->assert_static_error($numeric_new_output === $numeric_stored_output, $message_error, $stored_output, $new_output, $asserting_key);
                    }
                }
            }
        }
        return true;  // c# requ
    }

    public function assert_new_and_stored_output($exchange, $skip_keys, $new_output, $stored_output, $strict_type_check = true, $asserting_key = null) {
        $res = true;
        try {
            $res = $this->assert_new_and_stored_output_inner($exchange, $skip_keys, $new_output, $stored_output, $strict_type_check, $asserting_key);
        } catch(\Throwable $e) {
            if ($this->info) {
                $error_message = $this->var_to_string($new_output) . '(calculated)' . ' != ' . $this->var_to_string($stored_output) . '(stored)';
                dump('[TEST_FAILURE_DETAIL]' . $error_message);
            }
            throw $e;
        }
        return $res;
    }

    public function var_to_string($obj = null) {
        $new_string = null;
        if ($obj === null) {
            $new_string = 'undefined';
        } elseif (is_null_value($obj)) {
            $new_string = 'null';
        } else {
            $new_string = json_stringify($obj);
        }
        return $new_string;
    }

    public function assert_static_request_output($exchange, $type, $skip_keys, $stored_url, $request_url, $stored_output, $new_output) {
        if ($stored_url !== $request_url) {
            // remove the host part from the url
            $first_path = $this->remove_hostnamefrom_url($stored_url);
            $second_path = $this->remove_hostnamefrom_url($request_url);
            $this->assert_static_error($first_path === $second_path, 'url mismatch', $first_path, $second_path);
        }
        // body (aka storedOutput and newOutput) is not defined and information is in the url
        // example: "https://open-api.bingx.com/openApi/spot/v1/trade/order?quoteOrderQty=5&side=BUY&symbol=LTC-USDT&timestamp=1698777135343&type=MARKET&signature=d55a7e4f7f9dbe56c4004c9f3ab340869d3cb004e2f0b5b861e5fbd1762fd9a0
        if (($stored_output === null) && ($new_output === null)) {
            if (($stored_url !== null) && ($request_url !== null)) {
                $stored_url_parts = explode('?', $stored_url);
                $new_url_parts = explode('?', $request_url);
                $stored_url_query = $exchange->safe_value($stored_url_parts, 1);
                $new_url_query = $exchange->safe_value($new_url_parts, 1);
                if (($stored_url_query === null) && ($new_url_query === null)) {
                    // might be a get request without any query parameters
                    // example: https://api.gateio.ws/api/v4/delivery/usdt/positions
                    return true;
                }
                $stored_url_params = $this->urlencoded_to_dict($stored_url_query);
                $new_url_params = $this->urlencoded_to_dict($new_url_query);
                $this->assert_new_and_stored_output($exchange, $skip_keys, $new_url_params, $stored_url_params);
                return true;
            }
        }
        if ($type === 'json' && ($stored_output !== null) && ($new_output !== null)) {
            if (is_string($stored_output)) {
                $stored_output = json_parse($stored_output);
            }
            if (is_string($new_output)) {
                $new_output = json_parse($new_output);
            }
        } elseif ($type === 'urlencoded' && ($stored_output !== null) && ($new_output !== null)) {
            $stored_output = $this->urlencoded_to_dict($stored_output);
            $new_output = $this->urlencoded_to_dict($new_output);
        } elseif ($type === 'both') {
            if (str_starts_with($stored_output, '{') || str_starts_with($stored_output, '[')) {
                $stored_output = json_parse($stored_output);
                $new_output = json_parse($new_output);
            } else {
                $stored_output = $this->urlencoded_to_dict($stored_output);
                $new_output = $this->urlencoded_to_dict($new_output);
            }
        }
        $this->assert_new_and_stored_output($exchange, $skip_keys, $new_output, $stored_output);
        return true;
    }

    public function assert_static_response_output($exchange, $skip_keys, $computed_result, $stored_result) {
        $this->assert_new_and_stored_output($exchange, $skip_keys, $computed_result, $stored_result, false);
    }

    public function sanitize_data_input($input) {
        // remove nulls and replace with unefined instead
        if ($input === null) {
            return null;
        }
        $new_input = [];
        for ($i = 0; $i < count($input); $i++) {
            $current = $input[$i];
            if (is_null_value($current)) {
                $new_input[] = null;
            } else {
                $new_input[] = $current;
            }
        }
        return $new_input;
    }

    public function test_request_statically($exchange, $method, $data, $type, $skip_keys) {
        return Async\async(function () use ($exchange, $method, $data, $type, $skip_keys) {
            $output = null;
            $request_url = null;
            try {
                if (!is_sync()) {
                    Async\await(call_exchange_method_dynamically($exchange, $method, $this->sanitize_data_input($data['input'])));
                } else {
                    call_exchange_method_dynamically_sync($exchange, $method, $this->sanitize_data_input($data['input']));
                }
            } catch(\Throwable $e) {
                if (!($e instanceof InvalidProxySettings)) {
                    throw $e;
                }
                $output = $exchange->last_request_body;
                $request_url = $exchange->last_request_url;
            }
            try {
                $call_output = $exchange->safe_value($data, 'output');
                $this->assert_static_request_output($exchange, $type, $skip_keys, $data['url'], $request_url, $call_output, $output);
            } catch(\Throwable $e) {
                $this->request_tests_failed = true;
                $error_message = '[' . $this->lang . '][STATIC_REQUEST]' . '[' . $exchange->id . ']' . '[' . $method . ']' . '[' . $data['description'] . ']' . exception_message($e);
                dump('[TEST_FAILURE]' . $error_message);
            }
            return true;
        }) ();
    }

    public function test_response_statically($exchange, $method, $skip_keys, $data) {
        return Async\async(function () use ($exchange, $method, $skip_keys, $data) {
            $expected_result = $exchange->safe_value($data, 'parsedResponse');
            $mocked_exchange = set_fetch_response($exchange, $data['httpResponse']);
            try {
                if (!is_sync()) {
                    $unified_result = Async\await(call_exchange_method_dynamically($exchange, $method, $this->sanitize_data_input($data['input'])));
                    $this->assert_static_response_output($mocked_exchange, $skip_keys, $unified_result, $expected_result);
                } else {
                    $unified_result_sync = call_exchange_method_dynamically_sync($exchange, $method, $this->sanitize_data_input($data['input']));
                    $this->assert_static_response_output($mocked_exchange, $skip_keys, $unified_result_sync, $expected_result);
                }
            } catch(\Throwable $e) {
                $this->response_tests_failed = true;
                $error_message = '[' . $this->lang . '][STATIC_RESPONSE]' . '[' . $exchange->id . ']' . '[' . $method . ']' . '[' . $data['description'] . ']' . exception_message($e);
                dump('[TEST_FAILURE]' . $error_message);
            }
            set_fetch_response($exchange, null); // reset state
            return true;
        }) ();
    }

    public function init_offline_exchange($exchange_name) {
        $markets = $this->load_markets_from_file($exchange_name);
        $currencies = $this->load_currencies_from_file($exchange_name);
        $exchange = init_exchange($exchange_name, array(
            'markets' => $markets,
            'currencies' => $currencies,
            'enableRateLimit' => false,
            'rateLimit' => 1,
            'httpProxy' => 'http://fake:8080',
            'httpsProxy' => 'http://fake:8080',
            'apiKey' => 'key',
            'secret' => 'secretsecret',
            'password' => 'password',
            'walletAddress' => 'wallet',
            'privateKey' => '0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771',
            'uid' => 'uid',
            'token' => 'token',
            'login' => 'login',
            'accountId' => 'accountId',
            'accounts' => [array(
    'id' => 'myAccount',
    'code' => 'USDT',
), array(
    'id' => 'myAccount',
    'code' => 'USDC',
)],
            'options' => array(
                'enableUnifiedAccount' => true,
                'enableUnifiedMargin' => false,
                'accessToken' => 'token',
                'expires' => 999999999999999,
                'leverageBrackets' => array(),
            ),
        ));
        $exchange->currencies = $currencies;
        // not working in python if assigned  in the config dict
        return $exchange;
    }

    public function test_exchange_request_statically($exchange_name, $exchange_data, $test_name = null) {
        // instantiate the exchange and make sure that we sink the requests to avoid an actual request
        return Async\async(function () use ($exchange_name, $exchange_data, $test_name) {
            $exchange = $this->init_offline_exchange($exchange_name);
            $global_options = $exchange->safe_dict($exchange_data, 'options', array());
            // read apiKey/secret from the test file
            $api_key = $exchange->safe_string($exchange_data, 'apiKey');
            if ($api_key) {
                $exchange->apiKey = ((string) $api_key);
            }
            $secret = $exchange->safe_string($exchange_data, 'secret');
            if ($secret) {
                $exchange->secret = ((string) $secret);
            }
            $private_key = $exchange->safe_string($exchange_data, 'privateKey');
            if ($private_key) {
                $exchange->privateKey = ((string) $private_key);
            }
            $wallet_address = $exchange->safe_string($exchange_data, 'walletAddress');
            if ($wallet_address) {
                $exchange->walletAddress = ((string) $wallet_address);
            }
            $accounts = $exchange->safe_list($exchange_data, 'accounts');
            if ($accounts) {
                $exchange->accounts = $accounts;
            }
            // exchange.options = exchange.deepExtend (exchange.options, globalOptions); // custom options to be used in the tests
            $exchange->extend_exchange_options($global_options);
            $methods = $exchange->safe_value($exchange_data, 'methods', array());
            $methods_names = is_array($methods) ? array_keys($methods) : array();
            for ($i = 0; $i < count($methods_names); $i++) {
                $method = $methods_names[$i];
                $results = $methods[$method];
                for ($j = 0; $j < count($results); $j++) {
                    $result = $results[$j];
                    $old_exchange_options = $exchange->options; // snapshot options;
                    $test_exchange_options = $exchange->safe_value($result, 'options', array());
                    // exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                    $exchange->extend_exchange_options($exchange->deep_extend($old_exchange_options, $test_exchange_options));
                    $description = $exchange->safe_value($result, 'description');
                    if (($test_name !== null) && ($test_name !== $description)) {
                        continue;
                    }
                    $is_disabled = $exchange->safe_bool($result, 'disabled', false);
                    if ($is_disabled) {
                        continue;
                    }
                    $disabled_string = $exchange->safe_string($result, 'disabled', '');
                    if ($disabled_string !== '') {
                        continue;
                    }
                    $is_disabled_c_sharp = $exchange->safe_bool($result, 'disabledCS', false);
                    if ($is_disabled_c_sharp && ($this->lang === 'C#')) {
                        continue;
                    }
                    $is_disabled_go = $exchange->safe_bool($result, 'disabledGO', false);
                    if ($is_disabled_go && ($this->lang === 'GO')) {
                        continue;
                    }
                    $type = $exchange->safe_string($exchange_data, 'outputType');
                    $skip_keys = $exchange->safe_value($exchange_data, 'skipKeys', []);
                    Async\await($this->test_request_statically($exchange, $method, $result, $type, $skip_keys));
                    // reset options
                    // exchange.options = exchange.deepExtend (oldExchangeOptions, {});
                    $exchange->extend_exchange_options($exchange->deep_extend($old_exchange_options, array()));
                }
            }
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;  // in c# methods that will be used with promiseAll need to return something
        }) ();
    }

    public function test_exchange_response_statically($exchange_name, $exchange_data, $test_name = null) {
        return Async\async(function () use ($exchange_name, $exchange_data, $test_name) {
            $exchange = $this->init_offline_exchange($exchange_name);
            // read apiKey/secret from the test file
            $api_key = $exchange->safe_string($exchange_data, 'apiKey');
            if ($api_key) {
                $exchange->apiKey = ((string) $api_key);
            }
            $secret = $exchange->safe_string($exchange_data, 'secret');
            if ($secret) {
                $exchange->secret = ((string) $secret);
            }
            $private_key = $exchange->safe_string($exchange_data, 'privateKey');
            if ($private_key) {
                $exchange->privateKey = ((string) $private_key);
            }
            $wallet_address = $exchange->safe_string($exchange_data, 'walletAddress');
            if ($wallet_address) {
                $exchange->walletAddress = ((string) $wallet_address);
            }
            $methods = $exchange->safe_value($exchange_data, 'methods', array());
            $options = $exchange->safe_value($exchange_data, 'options', array());
            // exchange.options = exchange.deepExtend (exchange.options, options); // custom options to be used in the tests
            $exchange->extend_exchange_options($options);
            $methods_names = is_array($methods) ? array_keys($methods) : array();
            for ($i = 0; $i < count($methods_names); $i++) {
                $method = $methods_names[$i];
                $results = $methods[$method];
                for ($j = 0; $j < count($results); $j++) {
                    $result = $results[$j];
                    $description = $exchange->safe_value($result, 'description');
                    $old_exchange_options = $exchange->options; // snapshot options;
                    $test_exchange_options = $exchange->safe_value($result, 'options', array());
                    // exchange.options = exchange.deepExtend (oldExchangeOptions, testExchangeOptions); // custom options to be used in the tests
                    $exchange->extend_exchange_options($exchange->deep_extend($old_exchange_options, $test_exchange_options));
                    $is_disabled = $exchange->safe_bool($result, 'disabled', false);
                    if ($is_disabled) {
                        continue;
                    }
                    $is_disabled_c_sharp = $exchange->safe_bool($result, 'disabledCS', false);
                    if ($is_disabled_c_sharp && ($this->lang === 'C#')) {
                        continue;
                    }
                    $is_disabled_php = $exchange->safe_bool($result, 'disabledPHP', false);
                    if ($is_disabled_php && ($this->lang === 'PHP')) {
                        continue;
                    }
                    if (($test_name !== null) && ($test_name !== $description)) {
                        continue;
                    }
                    $is_disabled_go = $exchange->safe_bool($result, 'disabledGO', false);
                    if ($is_disabled_go && ($this->lang === 'GO')) {
                        continue;
                    }
                    $skip_keys = $exchange->safe_value($exchange_data, 'skipKeys', []);
                    Async\await($this->test_response_statically($exchange, $method, $skip_keys, $result));
                    // reset options
                    // exchange.options = exchange.deepExtend (oldExchangeOptions, {});
                    $exchange->extend_exchange_options($exchange->deep_extend($old_exchange_options, array()));
                }
            }
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;  // in c# methods that will be used with promiseAll need to return something
        }) ();
    }

    public function get_number_of_tests_from_exchange($exchange, $exchange_data, $test_name = null) {
        if ($test_name !== null) {
            return 1;
        }
        $sum = 0;
        $methods = $exchange_data['methods'];
        $methods_names = is_array($methods) ? array_keys($methods) : array();
        for ($i = 0; $i < count($methods_names); $i++) {
            $method = $methods_names[$i];
            $results = $methods[$method];
            $results_length = count($results);
            $sum = $exchange->sum($sum, $results_length);
        }
        return $sum;
    }

    public function run_static_request_tests($target_exchange = null, $test_name = null) {
        return Async\async(function () use ($target_exchange, $test_name) {
            Async\await($this->run_static_tests('request', $target_exchange, $test_name));
            return true;
        }) ();
    }

    public function run_static_tests($type, $target_exchange = null, $test_name = null) {
        return Async\async(function () use ($type, $target_exchange, $test_name) {
            $folder = get_root_dir() . './ts/src/test/static/' . $type . '/';
            $static_data = $this->load_static_data($folder, $target_exchange);
            if ($static_data === null) {
                return true;
            }
            $exchanges = is_array($static_data) ? array_keys($static_data) : array();
            $exchange = init_exchange('Exchange', array()); // tmp to do the calculations until we have the ast-transpiler transpiling this code
            $promises = [];
            $sum = 0;
            if ($target_exchange) {
                dump('[INFO:MAIN] Exchange to test: ' . $target_exchange);
            }
            if ($test_name) {
                dump('[INFO:MAIN] Testing only: ' . $test_name);
            }
            for ($i = 0; $i < count($exchanges); $i++) {
                $exchange_name = $exchanges[$i];
                $exchange_data = $static_data[$exchange_name];
                $number_of_tests = $this->get_number_of_tests_from_exchange($exchange, $exchange_data, $test_name);
                $sum = $exchange->sum($sum, $number_of_tests);
                if ($type === 'request') {
                    $promises[] = $this->test_exchange_request_statically($exchange_name, $exchange_data, $test_name);
                } else {
                    $promises[] = $this->test_exchange_response_statically($exchange_name, $exchange_data, $test_name);
                }
            }
            try {
                Async\await(Promise\all($promises));
            } catch(\Throwable $e) {
                if ($type === 'request') {
                    $this->request_tests_failed = true;
                } else {
                    $this->response_tests_failed = true;
                }
                $error_message = '[' . $this->lang . '][STATIC_REQUEST]' . exception_message($e);
                dump('[TEST_FAILURE]' . $error_message);
            }
            if ($this->request_tests_failed || $this->response_tests_failed) {
                exit_script(1);
            } else {
                $prefix = (is_sync()) ? '[SYNC]' : '';
                $success_message = '[' . $this->lang . ']' . $prefix . '[TEST_SUCCESS] ' . ((string) $sum) . ' static ' . $type . ' tests passed.';
                dump('[INFO]' . $success_message);
            }
        }) ();
    }

    public function run_static_response_tests($exchange_name = null, $test = null) {
        //  -----------------------------------------------------------------------------
        //  --- Init of mockResponses tests functions------------------------------------
        //  -----------------------------------------------------------------------------
        return Async\async(function () use ($exchange_name, $test) {
            Async\await($this->run_static_tests('response', $exchange_name, $test));
            return true;
        }) ();
    }

    public function run_broker_id_tests() {
        //  -----------------------------------------------------------------------------
        //  --- Init of brokerId tests functions-----------------------------------------
        //  -----------------------------------------------------------------------------
        return Async\async(function () {
            $promises = [$this->test_binance(), $this->test_okx(), $this->test_cryptocom(), $this->test_bybit(), $this->test_kucoin(), $this->test_kucoinfutures(), $this->test_bitget(), $this->test_mexc(), $this->test_htx(), $this->test_woo(), $this->test_bitmart(), $this->test_coinex(), $this->test_bingx(), $this->test_phemex(), $this->test_blofin(), $this->test_hyperliquid(), $this->test_coinbaseinternational(), $this->test_coinbase_advanced(), $this->test_woofi_pro(), $this->test_oxfun(), $this->test_xt(), $this->test_vertex(), $this->test_paradex(), $this->test_hashkey(), $this->test_coincatch(), $this->test_defx()];
            Async\await(Promise\all($promises));
            $success_message = '[' . $this->lang . '][TEST_SUCCESS] brokerId tests passed.';
            dump('[INFO]' . $success_message);
            exit_script(0);
            return true;
        }) ();
    }

    public function test_binance() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('binance');
            $spot_id = 'x-R4BD3S82';
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
            }
            $client_order_id = $spot_order_request['newClientOrderId'];
            $spot_id_string = ((string) $spot_id);
            assert(str_starts_with($client_order_id, $spot_id_string), 'binance - spot clientOrderId: ' . $client_order_id . ' does not start with spotId' . $spot_id_string);
            $swap_id = 'x-xcKtGhcu';
            $swap_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
            }
            $swap_inverse_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_inverse_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
            }
            $client_order_id_swap = $swap_order_request['newClientOrderId'];
            $swap_id_string = ((string) $swap_id);
            assert(str_starts_with($client_order_id_swap, $swap_id_string), 'binance - swap clientOrderId: ' . $client_order_id_swap . ' does not start with swapId' . $swap_id_string);
            $client_order_id_inverse = $swap_inverse_order_request['newClientOrderId'];
            assert(str_starts_with($client_order_id_inverse, $swap_id_string), 'binance - swap clientOrderIdInverse: ' . $client_order_id_inverse . ' does not start with swapId' . $swap_id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_okx() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('okx');
            $id = 'e847386590ce4dBC';
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $spot_order_request[0]['clOrdId']; // returns order inside array
            $id_string = ((string) $id);
            assert(str_starts_with($client_order_id, $id_string), 'okx - spot clientOrderId: ' . $client_order_id . ' does not start with id: ' . $id_string);
            $spot_tag = $spot_order_request[0]['tag'];
            assert($spot_tag === $id, 'okx - id: ' . $id . ' different from spot tag: ' . $spot_tag);
            $swap_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id_swap = $swap_order_request[0]['clOrdId'];
            assert(str_starts_with($client_order_id_swap, $id_string), 'okx - swap clientOrderId: ' . $client_order_id_swap . ' does not start with id: ' . $id_string);
            $swap_tag = $swap_order_request[0]['tag'];
            assert($swap_tag === $id, 'okx - id: ' . $id . ' different from swap tag: ' . $swap_tag);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_cryptocom() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('cryptocom');
            $id = 'CCXT';
            Async\await($exchange->load_markets());
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $broker_id = $request['params']['broker_id'];
            assert($broker_id === $id, 'cryptocom - id: ' . $id . ' different from  broker_id: ' . $broker_id);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_bybit() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('bybit');
            $req_headers = null;
            $id = 'CCXT';
            assert($exchange->options['brokerId'] === $id, 'id not in options');
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['Referer'] === $id, 'bybit - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_kucoin() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('kucoin');
            $req_headers = null;
            $spot_id = $exchange->options['partner']['spot']['id'];
            $spot_key = $exchange->options['partner']['spot']['key'];
            assert($spot_id === 'ccxt', 'kucoin - id: ' . $spot_id . ' not in options');
            assert($spot_key === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'kucoin - key: ' . $spot_key . ' not in options.');
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            $id = 'ccxt';
            assert($req_headers['KC-API-PARTNER'] === $id, 'kucoin - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_kucoinfutures() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('kucoinfutures');
            $req_headers = null;
            $id = 'ccxtfutures';
            $future_id = $exchange->options['partner']['future']['id'];
            $future_key = $exchange->options['partner']['future']['key'];
            assert($future_id === $id, 'kucoinfutures - id: ' . $future_id . ' not in options.');
            assert($future_key === '1b327198-f30c-4f14-a0ac-918871282f15', 'kucoinfutures - key: ' . $future_key . ' not in options.');
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['KC-API-PARTNER'] === $id, 'kucoinfutures - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_bitget() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('bitget');
            $req_headers = null;
            $id = 'p4sve';
            assert($exchange->options['broker'] === $id, 'bitget - id: ' . $id . ' not in options');
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['X-CHANNEL-API-CODE'] === $id, 'bitget - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_mexc() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('mexc');
            $req_headers = null;
            $id = 'CCXT';
            assert($exchange->options['broker'] === $id, 'mexc - id: ' . $id . ' not in options');
            Async\await($exchange->load_markets());
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['source'] === $id, 'mexc - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_htx() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('htx');
            // spot test
            $id = 'AA03022abc';
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $spot_order_request['client-order-id'];
            $id_string = ((string) $id);
            assert(str_starts_with($client_order_id, $id_string), 'htx - spot clientOrderId ' . $client_order_id . ' does not start with id: ' . $id_string);
            // swap test
            $swap_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_order_request = json_parse($exchange->last_request_body);
            }
            $swap_inverse_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_inverse_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id_swap = $swap_order_request['channel_code'];
            assert(str_starts_with($client_order_id_swap, $id_string), 'htx - swap channel_code ' . $client_order_id_swap . ' does not start with id: ' . $id_string);
            $client_order_id_inverse = $swap_inverse_order_request['channel_code'];
            assert(str_starts_with($client_order_id_inverse, $id_string), 'htx - swap inverse channel_code ' . $client_order_id_inverse . ' does not start with id: ' . $id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_woo() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('woo');
            // spot test
            $id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
            }
            $broker_id = $spot_order_request['broker_id'];
            $id_string = ((string) $id);
            assert(str_starts_with($broker_id, $id_string), 'woo - broker_id: ' . $broker_id . ' does not start with id: ' . $id_string);
            // swap test
            $stop_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, array(
                    'stopPrice' => 30000,
                )));
            } catch(\Throwable $e) {
                $stop_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id_stop = $stop_order_request['brokerId'];
            assert(str_starts_with($client_order_id_stop, $id_string), 'woo - brokerId: ' . $client_order_id_stop . ' does not start with id: ' . $id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_bitmart() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('bitmart');
            $req_headers = null;
            $id = 'CCXTxBitmart000';
            assert($exchange->options['brokerId'] === $id, 'bitmart - id: ' . $id . ' not in options');
            Async\await($exchange->load_markets());
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['X-BM-BROKER-ID'] === $id, 'bitmart - id: ' . $id . ' not in headers');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_coinex() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('coinex');
            $id = 'x-167673045';
            assert($exchange->options['brokerId'] === $id, 'coinex - id: ' . $id . ' not in options');
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $spot_order_request['client_id'];
            $id_string = ((string) $id);
            assert(str_starts_with($client_order_id, $id_string), 'coinex - clientOrderId: ' . $client_order_id . ' does not start with id: ' . $id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_bingx() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('bingx');
            $req_headers = null;
            $id = 'CCXT';
            assert($exchange->options['broker'] === $id, 'bingx - id: ' . $id . ' not in options');
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['X-SOURCE-KEY'] === $id, 'bingx - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_phemex() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('phemex');
            $id = 'CCXT123456';
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $request['clOrdID'];
            $id_string = ((string) $id);
            assert(str_starts_with($client_order_id, $id_string), 'phemex - clOrdID: ' . $client_order_id . ' does not start with id: ' . $id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_blofin() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('blofin');
            $id = 'ec6dd3a7dd982d0b';
            $request = null;
            try {
                Async\await($exchange->create_order('LTC/USDT:USDT', 'market', 'buy', 1));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $broker_id = $request['brokerId'];
            $id_string = ((string) $id);
            assert(str_starts_with($broker_id, $id_string), 'blofin - brokerId: ' . $broker_id . ' does not start with id: ' . $id_string);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_hyperliquid() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('hyperliquid');
            $id = '1';
            $request = null;
            try {
                Async\await($exchange->create_order('SOL/USDC:USDC', 'limit', 'buy', 1, 100));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $broker_id = ((string) ($request['action']['brokerCode']));
            assert($broker_id === $id, 'hyperliquid - brokerId: ' . $broker_id . ' does not start with id: ' . $id);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_coinbaseinternational() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('coinbaseinternational');
            $exchange->options['portfolio'] = 'random';
            $id = 'nfqkvdjp';
            assert($exchange->options['brokerId'] === $id, 'id not in options');
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $request['client_order_id'];
            assert(str_starts_with($client_order_id, ((string) $id)), 'clientOrderId does not start with id');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_coinbase_advanced() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('coinbase');
            $id = 'ccxt';
            assert($exchange->options['brokerId'] === $id, 'id not in options');
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $client_order_id = $request['client_order_id'];
            assert(str_starts_with($client_order_id, ((string) $id)), 'clientOrderId does not start with id');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_woofi_pro() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('woofipro');
            $exchange->secret = 'secretsecretsecretsecretsecretsecretsecrets';
            $id = 'CCXT';
            Async\await($exchange->load_markets());
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $broker_id = $request['order_tag'];
            assert($broker_id === $id, 'woofipro - id: ' . $id . ' different from  broker_id: ' . $broker_id);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_oxfun() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('oxfun');
            $exchange->secret = 'secretsecretsecretsecretsecretsecretsecrets';
            $id = 1000;
            Async\await($exchange->load_markets());
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USD:OX', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $orders = $request['orders'];
            $first = $orders[0];
            $broker_id = $first['source'];
            assert($broker_id === $id, 'oxfun - id: ' . ((string) $id) . ' different from  broker_id: ' . ((string) $broker_id));
            return true;
        }) ();
    }

    public function test_xt() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('xt');
            $id = 'CCXT';
            $spot_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $spot_order_request = json_parse($exchange->last_request_body);
            }
            $spot_media = $spot_order_request['media'];
            assert($spot_media === $id, 'xt - id: ' . $id . ' different from swap tag: ' . $spot_media);
            $swap_order_request = null;
            try {
                Async\await($exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $swap_order_request = json_parse($exchange->last_request_body);
            }
            $swap_media = $swap_order_request['clientMedia'];
            assert($swap_media === $id, 'xt - id: ' . $id . ' different from swap tag: ' . $swap_media);
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_vertex() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('vertex');
            $exchange->walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781';
            $exchange->privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b';
            $exchange->options['v1contracts'] = array(
                'chain_id' => '42161',
                'endpoint_addr' => '0xbbee07b3e8121227afcfe1e2b82772246226128e',
                'book_addrs' => ['0x0000000000000000000000000000000000000000', '0x70e5911371472e406f1291c621d1c8f207764d73', '0xf03f457a30e598d5020164a339727ef40f2b8fbc', '0x1c6281a78aa0ed88949c319cba5f0f0de2ce8353', '0xfe653438a1a4a7f56e727509c341d60a7b54fa91', '0xb6304e9a6ca241376a5fc9294daa8fca65ddcdcd', '0x01ec802ae0ab1b2cc4f028b9fe6eb954aef06ed1', '0x0000000000000000000000000000000000000000', '0x9c52d5c4df5a68955ad088a781b4ab364a861e9e', '0x0000000000000000000000000000000000000000', '0x2a3bcda1bb3ef649f3571c96c597c3d2b25edc79', '0x0000000000000000000000000000000000000000', '0x0492ff9807f82856781488015ef7aa5526c0edd6', '0x0000000000000000000000000000000000000000', '0xea884c82418ebc21cd080b8f40ecc4d06a6a6883', '0x0000000000000000000000000000000000000000', '0x5ecf68f983253a818ca8c17a56a4f2fb48d6ec6b', '0x0000000000000000000000000000000000000000', '0xba3f57a977f099905531f7c2f294aad7b56ed254', '0x0000000000000000000000000000000000000000', '0x0ac8c26d207d0c6aabb3644fea18f530c4d6fc8e', '0x0000000000000000000000000000000000000000', '0x8bd80ad7630b3864bed66cf28f548143ea43dc3b', '0x0000000000000000000000000000000000000000', '0x045391227fc4b2cdd27b95f066864225afc9314e', '0x0000000000000000000000000000000000000000', '0x7d512bef2e6cfd7e7f5f6b2f8027e3728eb7b6c3', '0x0000000000000000000000000000000000000000', '0x678a6c5003b56b5e9a81559e9a0df880407c796f', '0x0000000000000000000000000000000000000000', '0x14b5a17208fa98843cc602b3f74e31c95ded3567', '0xe442a89a07b3888ab10579fbb2824aeceff3a282', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xac28ac205275d7c2d6877bea8657cebe04fd9ae9', '0x0000000000000000000000000000000000000000', '0xed811409bfea901e75cb19ba347c08a154e860c9', '0x0000000000000000000000000000000000000000', '0x0f7afcb1612b305626cff84f84e4169ba2d0f12c', '0x0000000000000000000000000000000000000000', '0xe4b8d903db2ce2d3891ef04cfc3ac56330c1b0c3', '0x5f44362bad629846b7455ad9d36bbc3759a3ef62', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xa64e04ed4b223a71e524dc7ebb7f28e422ccfdde', '0x0000000000000000000000000000000000000000', '0x2ee573caab73c1d8cf0ca6bd3589b67de79628a4', '0x0000000000000000000000000000000000000000', '0x01bb96883a8a478d4410387d4aaf11067edc2c74', '0x0000000000000000000000000000000000000000', '0xe7ed0c559d905436a867cddf07e06921d572363c', '0x0000000000000000000000000000000000000000', '0xa94f9e3433c92a5cd1925494811a67b1943557d9', '0x0000000000000000000000000000000000000000', '0xa63de7f89ba1270b85f3dcc193ff1a1390a7c7c7', '0x0000000000000000000000000000000000000000', '0xc8b0b37dffe3a711a076dc86dd617cc203f36121', '0x0000000000000000000000000000000000000000', '0x646df48947ff785fe609969ff634e7be9d1c34cd', '0x0000000000000000000000000000000000000000', '0x42582b404b0bec4a266631a0e178840b107a0c69', '0x0000000000000000000000000000000000000000', '0x36a94bc3edb1b629d1413091e22dc65fa050f17f', '0x0000000000000000000000000000000000000000', '0xb398d00b5a336f0ad33cfb352fd7646171cec442', '0x0000000000000000000000000000000000000000', '0xb4bc3b00de98e1c0498699379f6607b1f00bd5a1', '0x0000000000000000000000000000000000000000', '0xfe8b7baf68952bac2c04f386223d2013c1b4c601', '0x0000000000000000000000000000000000000000', '0x9c8764ec71f175c97c6c2fd558eb6546fcdbea32', '0x0000000000000000000000000000000000000000', '0x94d31188982c8eccf243e555b22dc57de1dba4e1', '0x0000000000000000000000000000000000000000', '0x407c5e2fadd7555be927c028bc358daa907c797a', '0x0000000000000000000000000000000000000000', '0x7e97da2dbbbdd7fb313cf9dc0581ac7cec999c70', '0x0000000000000000000000000000000000000000', '0x7f8d2662f64dd468c423805f98a6579ad59b28fa', '0x0000000000000000000000000000000000000000', '0x3398adf63fed17cbadd6080a1fb771e6a2a55958', '0x0000000000000000000000000000000000000000', '0xba8910a1d7ab62129729047d453091a1e6356170', '0x0000000000000000000000000000000000000000', '0xdc054bce222fe725da0f17abcef38253bd8bb745', '0x0000000000000000000000000000000000000000', '0xca21693467d0a5ea9e10a5a7c5044b9b3837e694', '0x0000000000000000000000000000000000000000', '0xe0b02de2139256dbae55cf350094b882fbe629ea', '0x0000000000000000000000000000000000000000', '0x02c38368a6f53858aab5a3a8d91d73eb59edf9b9', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000', '0xfe8c4778843c3cb047ffe7c0c0154a724c05cab9', '0x0000000000000000000000000000000000000000', '0xe2e88862d9b7379e21c82fc4aec8d71bddbcdb4b', '0x0000000000000000000000000000000000000000', '0xbbaff9e73b30f9cea5c01481f12de75050947fd6', '0x0000000000000000000000000000000000000000', '0xa20f6f381fe0fec5a1035d37ebf8890726377ab9', '0x0000000000000000000000000000000000000000', '0xbad68032d012bf35d3a2a177b242e86684027ed0', '0x0000000000000000000000000000000000000000', '0x0e61ca37f0c67e8a8794e45e264970a2a23a513c', '0x0000000000000000000000000000000000000000', '0xa77b7048e378c5270b15918449ededf87c3a3db3', '0x0000000000000000000000000000000000000000', '0x15afca1e6f02b556fa6551021b3493a1e4a7f44f'],
            );
            $id = 5930043274845996;
            Async\await($exchange->load_markets());
            $request = null;
            try {
                Async\await($exchange->create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $request = json_parse($exchange->last_request_body);
            }
            $order = $request['place_order'];
            $broker_id = $order['id'];
            assert($broker_id === $id, 'vertex - id: ' . ((string) $id) . ' different from  broker_id: ' . ((string) $broker_id));
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_paradex() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('paradex');
            $exchange->walletAddress = '0xc751489d24a33172541ea451bc253d7a9e98c781';
            $exchange->privateKey = 'c33b1eb4b53108bf52e10f636d8c1236c04c33a712357ba3543ab45f48a5cb0b';
            $exchange->options['authToken'] = 'token';
            $exchange->options['systemConfig'] = array(
                'starknet_gateway_url' => 'https://potc-testnet-sepolia.starknet.io',
                'starknet_fullnode_rpc_url' => 'https://pathfinder.api.testnet.paradex.trade/rpc/v0_7',
                'starknet_chain_id' => 'PRIVATE_SN_POTC_SEPOLIA',
                'block_explorer_url' => 'https://voyager.testnet.paradex.trade/',
                'paraclear_address' => '0x286003f7c7bfc3f94e8f0af48b48302e7aee2fb13c23b141479ba00832ef2c6',
                'paraclear_decimals' => 8,
                'paraclear_account_proxy_hash' => '0x3530cc4759d78042f1b543bf797f5f3d647cde0388c33734cf91b7f7b9314a9',
                'paraclear_account_hash' => '0x41cb0280ebadaa75f996d8d92c6f265f6d040bb3ba442e5f86a554f1765244e',
                'oracle_address' => '0x2c6a867917ef858d6b193a0ff9e62b46d0dc760366920d631715d58baeaca1f',
                'bridged_tokens' => [array(
    'name' => 'TEST USDC',
    'symbol' => 'USDC',
    'decimals' => 6,
    'l1_token_address' => '0x29A873159D5e14AcBd63913D4A7E2df04570c666',
    'l1_bridge_address' => '0x8586e05adc0C35aa11609023d4Ae6075Cb813b4C',
    'l2_token_address' => '0x6f373b346561036d98ea10fb3e60d2f459c872b1933b50b21fe6ef4fda3b75e',
    'l2_bridge_address' => '0x46e9237f5408b5f899e72125dd69bd55485a287aaf24663d3ebe00d237fc7ef',
)],
                'l1_core_contract_address' => '0x582CC5d9b509391232cd544cDF9da036e55833Af',
                'l1_operator_address' => '0x11bACdFbBcd3Febe5e8CEAa75E0Ef6444d9B45FB',
                'l1_chain_id' => '11155111',
                'liquidation_fee' => '0.2',
            );
            $req_headers = null;
            $id = 'CCXT';
            assert($exchange->options['broker'] === $id, 'paradex - id: ' . $id . ' not in options');
            Async\await($exchange->load_markets());
            try {
                Async\await($exchange->create_order('BTC/USD:USDC', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['PARADEX-PARTNER'] === $id, 'paradex - id: ' . $id . ' not in headers');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_hashkey() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('hashkey');
            $req_headers = null;
            $id = '10000700011';
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['INPUT-SOURCE'] === $id, 'hashkey - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_coincatch() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('coincatch');
            $req_headers = null;
            $id = '47cfy';
            try {
                Async\await($exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            assert($req_headers['X-CHANNEL-API-CODE'] === $id, 'coincatch - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }

    public function test_defx() {
        return Async\async(function () {
            $exchange = $this->init_offline_exchange('defx');
            $req_headers = null;
            try {
                Async\await($exchange->create_order('DOGE/USDC:USDC', 'limit', 'buy', 100, 1));
            } catch(\Throwable $e) {
                // we expect an error here, we're only interested in the headers
                $req_headers = $exchange->last_request_headers;
            }
            $id = 'ccxt';
            assert($req_headers['X-DEFX-SOURCE'] === $id, 'defx - id: ' . $id . ' not in headers.');
            if (!is_sync()) {
                Async\await(close($exchange));
            }
            return true;
        }) ();
    }
}
