<?php

namespace ccxt;

use Exception; // a common import

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
ini_set('memory_limit', '512M');

define('rootDir', __DIR__ . '/../../');
define('root_dir', __DIR__ . '/../../');

include_once rootDir .'/vendor/autoload.php';
use React\Async;
use React\Promise;

// the below approach is being deprecated in PHP (keep this commented area for a while)
//
// assert_options (ASSERT_CALLBACK, function(string $file, int $line, ?string $assertion, string $description = null){
//     $args = func_get_args();
//     $message = '';
//     try {
//         $message = "[ASSERT_ERROR] - [ $file : $line ] $description";
//     } catch (\Exception $exc) {
//         $message = "[ASSERT_ERROR] -" . json_encode($args);
//     }
//     $message = substr($message, 0, LOG_CHARS_LENGTH);
//     dump($message);
//     exit;
// });
//
//
// the below one is the accepted way of handling assertion errors nowadays (however, keep this also commented here for a while)
//
// set_exception_handler( function (\Throwable $e) {
//     if ($e instanceof \AssertionError) {
//         dump('[ASSERT_ERROR] -' . exception_message($e));
//         exit_script(0);
//     }
//     throw $e;
// } );

$filetered_args = array_filter(array_map (function ($x) { return stripos($x,'--')===false? $x : null;} , $argv));
$exchangeId = array_key_exists(1, $filetered_args) ? $filetered_args[1] : null; // this should be different than JS
$exchangeSymbol = null; // todo: this should be different than JS

// non-transpiled part, but shared names among langs

function get_cli_arg_value ($arg) {
    return in_array($arg, $GLOBALS['argv']);
}

define('is_synchronous', stripos(__FILE__, '_async') === false);
define('rootDirForSkips', __DIR__ . '/../../');
define('envVars', $_ENV);
define('LOG_CHARS_LENGTH', 1000000); // no need to trim
define('ext', 'php');
define('proxyTestFileName', 'proxies');

class baseMainTestClass {
    public $lang = 'PHP';
    public $is_synchronous = is_synchronous;
    public $test_files = [];
    public $skipped_methods = [];
    public $checked_public_tests = [];
    public $public_tests = [];
    public $ws_tests = false;
    public $info = false;
    public $verbose = false;
    public $debug = false;
    public $private_test = false;
    public $private_test_only = false;
    public $sandbox = false;
    public $static_tests = false;
    public $request_tests_failed = false;
    public $response_tests_failed = false;
    public $id_tests = false;
    public $response_tests = false;
    public $request_tests = false;
    public $load_keys = false;

    public $new_line = "\n";
    public $root_dir = root_dir;
    public $env_vars = envVars;
    public $root_dir_for_skips = rootDirForSkips;
    public $only_specific_tests = [];
    public $proxy_test_file_name = proxyTestFileName;
    public $ext = ext;
}

function dump(...$s) {
    $args = array_map(function ($arg) {
        if (is_array($arg) || is_object($arg)) {
            return json_encode($arg);
        } else {
            return $arg;
        }
    }, func_get_args());
    echo implode(' ', $args) . "\n";
}

function convert_ascii($s) {
    return $s; // stub
}

function json_parse($s) {
    return json_decode($s, true);
}

function json_stringify($s) {
    return json_encode($s);
}

function convert_to_snake_case($input) {
    $res = strtolower(preg_replace('/(?<!^)(?=[A-Z])/', '_', $input));
    return str_replace('o_h_l_c_v', 'ohlcv', $res);
}

function get_test_name($methodName) {
    return 'test_' . convert_to_snake_case($methodName);
}

function io_file_exists($path) {
    return file_exists($path);
}

function io_file_read($path, $decode = true) {
    $content = file_get_contents($path);
    return $decode ? json_decode($content, true) : $content;
}

function io_dir_read($path) {
    $files = scandir($path);
    $cleanFiles = array();

    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            $cleanFiles[] = $file;
        }
    }

    return $cleanFiles;
}


function call_method($testFiles, $methodName, $exchange, $skippedProperties, $args) {
    $methodNameWithNameSpace = '\\ccxt\\' . $testFiles[$methodName];
    return call_user_func($methodNameWithNameSpace, $exchange, $skippedProperties, ... $args);
}

function call_overriden_method($exchange, $methodName, $args) {
    // $overridenMethod = $exchange->{$methodName};
    // return $overridenMethod(... $args);
    return $exchange->call_method($methodName, ... $args);
}

function call_exchange_method_dynamically($exchange, $methodName, $args) {
    return $exchange->{$methodName}(... $args);
}

function exception_message($exc) {
    $full_trace = $exc->getTrace();
    // temporarily disable below line, so we dump whole array
    // $items = array_slice($full_trace, 0, 12); // 12 members are enough for proper trace 
    $items = $full_trace;
    $output = '';
    foreach ($items as $item) {
        if (array_key_exists('file', $item)) {
            $output .= $item['file'];
            if (array_key_exists('line', $item)) {
                $output .= ':' . $item['line'];
            }
            if (array_key_exists('class', $item)) {
                $output .= ' ::: ' . $item['class'];
            }
            if (array_key_exists('function', $item)) {
                $output .= ' > ' . $item['function'];
            }
            $output .= "\n";
        }
    }
    $output = preg_replace('/(\n(.*?)\/home\/travis\/build\/ccxt\/ccxt\/vendor\/)(.*?)\r/', '', $output); // remove excessive lines like: https://app.travis-ci.com/github/ccxt/ccxt/builds/268171081#L3483
    $origin_message = null;
    try{
        $origin_message = $exc->getMessage() . "\n" . $exc->getFile() . ':' . $exc->getLine();
    } catch (\Throwable $exc) { 
        $origin_message = '';
    }
    $final_message = '[' . get_class($exc) . '] ' . $origin_message . "\n" . $output;
    return substr($final_message, 0, LOG_CHARS_LENGTH);
}

function exit_script($code = 0) {
    exit($code);
}

function get_exchange_prop ($exchange, $prop, $defaultValue = null) {
    return property_exists ($exchange, $prop) ? $exchange->{$prop} : $defaultValue;
}

function set_exchange_prop ($exchange, $prop, $value) {
    $exchange->{$prop} = $value;
    // set snake case too
    $exchange->{convert_to_snake_case($prop)} = $value;
}
function create_dynamic_class ($exchangeId, $originalClass, $args) {
    $async_suffix = is_synchronous ? '_async' : '_sync';
    $filePath = sys_get_temp_dir() . '/temp_dynamic_class_' . $exchangeId . $async_suffix . '.php';
    $newClassName = $exchangeId . '_mock' . $async_suffix ;
    if (is_synchronous) {
        $content = '<?php if (!class_exists("'.$newClassName.'"))  {
            class '. $newClassName . ' extends ' . $originalClass . ' {
                public $fetch_result = null;
                public function fetch($url, $method = "GET", $headers = null, $body = null) {
                    if ($this->fetch_result) {
                        return $this->fetch_result;
                    }
                    return parent::fetch($url, $method, $headers, $body);
                }
            }
        }';
    } else {
        $content = '<?php 
        use React\Async;
        if (!class_exists("'.$newClassName.'"))  {
            class '. $newClassName . ' extends ' . $originalClass . ' {
                public $fetch_result = null;
                public function fetch($url, $method = "GET", $headers = null, $body = null) {
                    return Async\async (function() use ($url, $method, $headers, $body){
                        if ($this->fetch_result) {
                            return $this->fetch_result;
                        }
                        return  Async\await(parent::fetch($url, $method, $headers, $body));
                    })();
                }
            }
        }';
    }
    file_put_contents ($filePath, $content);
    include_once $filePath;
    $initedClass = new $newClassName($args);
    // unlink ($filePath);
    return $initedClass;
}

function init_exchange ($exchangeId, $args, $is_ws = false) {
    $exchangeClassString = '\\ccxt\\' . (is_synchronous ? '' : 'async\\') . $exchangeId;
    if ($is_ws) {
        $exchangeClassString = '\\ccxt\\pro\\' . $exchangeId;
    }
    $newClass = create_dynamic_class ($exchangeId, $exchangeClassString, $args);
    return $newClass;
}

function get_test_files ($properties, $ws = false) {
    $func = function() use ($properties, $ws){
        $tests = array();
        $finalPropList = array_merge ($properties, [proxyTestFileName]);
        for ($i = 0; $i < count($finalPropList); $i++) {
            $methodName = $finalPropList[$i];
            $name_snake_case = convert_to_snake_case($methodName);
            $dir_to_test = $ws ? dirname(__DIR__) . '/pro/test/Exchange/' : __DIR__ . '/' . (is_synchronous ? 'sync' : 'async') .'/';
            $test_method_name = 'test_'. $name_snake_case;
            $test_file = $dir_to_test . $test_method_name . '.' . ext;
            if (io_file_exists ($test_file)) {
                include_once $test_file;
                $tests[$methodName] = $test_method_name;
            }
        }
        return $tests;
    };
    if (is_synchronous) {
        return $func();
    } else {
        return Async\async ($func)();
    }
}

function is_null_value($value) {
    return $value === null;
}

function close($exchange) {
    $func = function() use ($exchange) {
        // for WS classes
        if (method_exists($exchange, 'close')) {
            return $exchange->close();
        }
        return true;
    };
    if (is_synchronous) {
        return $func();
    } else {
        return Async\async ($func)();
    }
}

function set_fetch_response($exchange, $data) {
    $exchange->fetch_result = $data;
    return $exchange;
}

// Required imports
use ccxt\NotSupported;
use ccxt\ProxyError;
use ccxt\NetworkError;
use ccxt\OperationFailed;
use ccxt\ExchangeNotAvailable;
use ccxt\OnMaintenance;
use ccxt\AuthenticationError;
use ccxt\ExchangeError;

// *********************************
// ***** AUTO-TRANSPILER-START *****
class testMainClass extends baseMainTestClass {
    public function parse_cli_args() {
        $this->response_tests = get_cli_arg_value('--responseTests');
        $this->id_tests = get_cli_arg_value('--idTests');
        $this->request_tests = get_cli_arg_value('--requestTests');
        $this->info = get_cli_arg_value('--info');
        $this->verbose = get_cli_arg_value('--verbose');
        $this->debug = get_cli_arg_value('--debug');
        $this->private_test = get_cli_arg_value('--private');
        $this->private_test_only = get_cli_arg_value('--privateOnly');
        $this->sandbox = get_cli_arg_value('--sandbox');
        $this->load_keys = get_cli_arg_value('--loadKeys');
        $this->ws_tests = get_cli_arg_value('--ws');
    }

    public function init($exchange_id, $symbol_argv) {
        $this->parse_cli_args();
        if ($this->request_tests && $this->response_tests) {
            $this->run_static_request_tests($exchange_id, $symbol_argv);
            $this->run_static_response_tests($exchange_id, $symbol_argv);
            return;
        }
        if ($this->response_tests) {
            $this->run_static_response_tests($exchange_id, $symbol_argv);
            return;
        }
        if ($this->request_tests) {
            $this->run_static_request_tests($exchange_id, $symbol_argv); // symbol here is the testname
            return;
        }
        if ($this->id_tests) {
            $this->run_broker_id_tests();
            return;
        }
        $symbol_str = $symbol_argv !== null ? $symbol_argv : 'all';
        $exchange_object = array(
            'exchange' => $exchange_id,
            'symbol' => $symbol_str,
            'isWs' => $this->ws_tests,
        );
        dump($this->new_line . '' . $this->new_line . '' . '[INFO] TESTING ', $this->ext, json_stringify($exchange_object), $this->new_line);
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
        $this->import_files($exchange);
        assert(count(is_array($this->test_files) ? array_keys($this->test_files) : array()) > 0, 'Test files were not loaded'); // ensure test files are found & filled
        $this->expand_settings($exchange);
        $symbol = $this->check_if_specific_test_is_chosen($symbol_argv);
        $this->start_test($exchange, $symbol);
        exit_script(0); // needed to be explicitly finished for WS tests
    }

    public function check_if_specific_test_is_chosen($symbol_argv) {
        if ($symbol_argv !== null) {
            $test_file_names = is_array($this->test_files) ? array_keys($this->test_files) : array();
            $possible_method_names = explode(',', $symbol_argv); // i.e. `test.ts binance fetchBalance,fetchDeposits`
            if (count($possible_method_names) >= 1) {
                for ($i = 0; $i < count($test_file_names); $i++) {
                    $test_file_name = $test_file_names[$i];
                    for ($j = 0; $j < count($possible_method_names); $j++) {
                        $method_name = $possible_method_names[$j];
                        if ($test_file_name === $method_name) {
                            $this->only_specific_tests[] = $test_file_name;
                        }
                    }
                }
            }
            // if method names were found, then remove them from symbolArgv
            if (count($this->only_specific_tests) > 0) {
                return null;
            }
        }
        return $symbol_argv;
    }

    public function import_files($exchange) {
        $properties = is_array($exchange->has) ? array_keys($exchange->has) : array();
        $properties[] = 'loadMarkets';
        $this->test_files = get_test_files($properties, $this->ws_tests);
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
                $credential_value = (is_array($this->env_vars) && array_key_exists($credential_env_name, $this->env_vars)) ? $this->env_vars[$credential_env_name] : null;
                if ($credential_value) {
                    set_exchange_prop($exchange, $credential, $credential_value);
                }
            }
        }
    }

    public function expand_settings($exchange) {
        $exchange_id = $exchange->id;
        $keys_global = $this->root_dir . 'keys.json';
        $keys_local = $this->root_dir . 'keys.local.json';
        $keys_global_exists = io_file_exists($keys_global);
        $keys_local_exists = io_file_exists($keys_local);
        $global_settings = $keys_global_exists ? io_file_read($keys_global) : array();
        $local_settings = $keys_local_exists ? io_file_read($keys_local) : array();
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
        $skipped_file = $this->root_dir_for_skips . 'skip-tests.json';
        $skipped_settings = io_file_read($skipped_file);
        $skipped_settings_for_exchange = $exchange->safe_value($skipped_settings, $exchange_id, array());
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

    public function exchange_hint($exchange, $market = null) {
        $market_type = $exchange->safe_string_2($exchange->options, 'defaultType', 'type', '');
        $market_sub_type = $exchange->safe_string_2($exchange->options, 'defaultSubType', 'subType');
        if ($market !== null) {
            $market_type = $market['type'];
            if ($market['linear']) {
                $market_sub_type = 'linear';
            } elseif ($market['inverse']) {
                $market_sub_type = 'inverse';
            } elseif ($exchange->safe_value($market, 'quanto') === true) {
                $market_sub_type = 'quanto';
            }
        }
        $is_ws = (is_array($exchange->has) && array_key_exists('ws', $exchange->has));
        $ws_flag = $is_ws ? '(WS)' : '';
        $result = $exchange->id . ' ' . $ws_flag . ' ' . $market_type;
        if ($market_sub_type !== null) {
            $result = $result . ' [subType: ' . $market_sub_type . '] ';
        }
        return $result;
    }

    public function test_method($method_name, $exchange, $args, $is_public) {
        // todo: temporary skip for php
        if (mb_strpos($method_name, 'OrderBook') !== false && $this->ext === 'php') {
            return;
        }
        $is_load_markets = ($method_name === 'loadMarkets');
        $is_fetch_currencies = ($method_name === 'fetchCurrencies');
        $is_proxy_test = ($method_name === $this->proxy_test_file_name);
        // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
        if (!$is_public && (is_array($this->checked_public_tests) && array_key_exists($method_name, $this->checked_public_tests)) && !$is_fetch_currencies) {
            return;
        }
        $skip_message = null;
        $supported_by_exchange = (is_array($exchange->has) && array_key_exists($method_name, $exchange->has)) && $exchange->has[$method_name];
        if (!$is_load_markets && (count($this->only_specific_tests) > 0 && !$exchange->in_array($method_name, $this->only_specific_tests))) {
            $skip_message = '[INFO] IGNORED_TEST';
        } elseif (!$is_load_markets && !$supported_by_exchange && !$is_proxy_test) {
            $skip_message = '[INFO] UNSUPPORTED_TEST'; // keep it aligned with the longest message
        } elseif ((is_array($this->skipped_methods) && array_key_exists($method_name, $this->skipped_methods)) && (is_string($this->skipped_methods[$method_name]))) {
            $skip_message = '[INFO] SKIPPED_TEST';
        } elseif (!(is_array($this->test_files) && array_key_exists($method_name, $this->test_files))) {
            $skip_message = '[INFO] UNIMPLEMENTED_TEST';
        }
        // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
        if ($is_load_markets) {
            $exchange->load_markets(true);
        }
        if ($skip_message) {
            if ($this->info) {
                dump($this->add_padding($skip_message, 25), $this->exchange_hint($exchange), $method_name);
            }
            return;
        }
        if ($this->info) {
            $args_stringified = '(' . implode(',', $args) . ')';
            dump($this->add_padding('[INFO] TESTING', 25), $this->exchange_hint($exchange), $method_name, $args_stringified);
        }
        call_method($this->test_files, $method_name, $exchange, $this->get_skips($exchange, $method_name), $args);
        // if it was passed successfully, add to the list of successfull tests
        if ($is_public) {
            $this->checked_public_tests[$method_name] = true;
        }
        return;
    }

    public function get_skips($exchange, $method_name) {
        // get "method-specific" skips
        $skips_for_method = $exchange->safe_value($this->skipped_methods, $method_name, array());
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
                $extra_skips = $exchange->safe_dict($this->skipped_methods, $object_name, array());
                return $exchange->deep_extend($skips_for_method, $extra_skips);
            }
        }
        return $skips_for_method;
    }

    public function test_safe($method_name, $exchange, $args = [], $is_public = false) {
        // `testSafe` method does not throw an exception, instead mutes it. The reason we
        // mute the thrown exceptions here is because we don't want to stop the whole
        // tests queue if any single test-method fails. Instead, they are echoed with
        // formatted message "[TEST_FAILURE] ..." and that output is then regex-matched by
        // run-tests.js, so the exceptions are still printed out to console from there.
        $max_retries = 3;
        $args_stringified = $exchange->json($args); // args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
        for ($i = 0; $i < $max_retries; $i++) {
            try {
                $this->test_method($method_name, $exchange, $args, $is_public);
                return true;
            } catch(\Throwable $e) {
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
                        $return_success = null;
                        if ($is_load_markets) {
                            // if "loadMarkets" does not succeed, we must return "false" to caller method, to stop tests continual
                            $return_success = false;
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
                                $return_success = false;
                            } else {
                                // in all other cases of OperationFailed, show Warning, but don't mark test as failed
                                $should_fail = false;
                                $return_success = true;
                            }
                        }
                        // output the message
                        $fail_type = $should_fail ? '[TEST_FAILURE]' : '[TEST_WARNING]';
                        dump($fail_type, 'Method could not be tested due to a repeated Network/Availability issues', ' | ', $this->exchange_hint($exchange), $method_name, $args_stringified, exception_message($e));
                        return $return_success;
                    } else {
                        // wait and retry again
                        // (increase wait time on every retry)
                        $exchange->sleep($i * 1000);
                        continue;
                    }
                } else {
                    // if it's loadMarkets, then fail test, because it's mandatory for tests
                    if ($is_load_markets) {
                        dump('[TEST_FAILURE]', 'Exchange can not load markets', exception_message($e), $this->exchange_hint($exchange), $method_name, $args_stringified);
                        return false;
                    }
                    // if the specific arguments to the test method throws "NotSupported" exception
                    // then let's don't fail the test
                    if ($is_not_supported) {
                        if ($this->info) {
                            dump('[INFO] NOT_SUPPORTED', exception_message($e), $this->exchange_hint($exchange), $method_name, $args_stringified);
                        }
                        return true;
                    }
                    // If public test faces authentication error, we don't break (see comments under `testSafe` method)
                    if ($is_public && $is_auth_error) {
                        if ($this->info) {
                            dump('[INFO]', 'Authentication problem for public method', exception_message($e), $this->exchange_hint($exchange), $method_name, $args_stringified);
                        }
                        return true;
                    } else {
                        dump('[TEST_FAILURE]', exception_message($e), $this->exchange_hint($exchange), $method_name, $args_stringified);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public function run_public_tests($exchange, $symbol) {
        $tests = array(
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
                'watchTicker' => [$symbol],
                'watchTickers' => [$symbol],
                'watchOrderBook' => [$symbol],
                'watchTrades' => [$symbol],
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
        $this->run_tests($exchange, $tests, true);
    }

    public function run_tests($exchange, $tests, $is_public_test) {
        $test_names = is_array($tests) ? array_keys($tests) : array();
        $promises = [];
        for ($i = 0; $i < count($test_names); $i++) {
            $test_name = $test_names[$i];
            $test_args = $tests[$test_name];
            $promises[] = $this->test_safe($test_name, $exchange, $test_args, $is_public_test);
        }
        // todo - not yet ready in other langs too
        // promises.push (testThrottle ());
        $results = ($promises);
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
            dump('[TEST_FAILURE]', $this->exchange_hint($exchange), $test_prefix_string, 'Failed methods : ' . $errors_string);
        }
        if ($this->info) {
            dump($this->add_padding('[INFO] END ' . $test_prefix_string . ' ' . $this->exchange_hint($exchange), 25));
        }
    }

    public function load_exchange($exchange) {
        $result = $this->test_safe('loadMarkets', $exchange, [], true);
        if (!$result) {
            return false;
        }
        $symbols = ['BTC/USDT', 'BTC/USDC', 'BTC/CNY', 'BTC/USD', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'BTC/JPY', 'ETH/EUR', 'ETH/JPY', 'ETH/CNY', 'ETH/USD', 'LTC/CNY', 'DASH/BTC', 'DOGE/BTC', 'BTC/AUD', 'BTC/PLN', 'USD/SLL', 'BTC/RUB', 'BTC/UAH', 'LTC/BTC', 'EUR/USD'];
        $result_symbols = [];
        $exchange_specific_symbols = $exchange->symbols;
        for ($i = 0; $i < count($exchange_specific_symbols); $i++) {
            $symbol = $exchange_specific_symbols[$i];
            if ($exchange->in_array($symbol, $symbols)) {
                $result_symbols[] = $symbol;
            }
        }
        $result_msg = '';
        $result_length = count($result_symbols);
        $exchange_symbols_length = count($exchange->symbols);
        if ($result_length > 0) {
            if ($exchange_symbols_length > $result_length) {
                $result_msg = implode(', ', $result_symbols) . ' + more...';
            } else {
                $result_msg = implode(', ', $result_symbols);
            }
        }
        dump('[INFO:MAIN] Exchange loaded', $exchange_symbols_length, 'symbols', $result_msg);
        return true;
    }

    public function get_test_symbol($exchange, $is_spot, $symbols) {
        $symbol = null;
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
        $codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT', 'ATOM', 'BAT', 'BTG', 'DASH', 'DOGE', 'ETC', 'IOTA', 'LSK', 'MKR', 'NEO', 'PAX', 'QTUM', 'TRX', 'TUSD', 'USD', 'USDC', 'WAVES', 'XEM', 'XMR', 'ZEC', 'ZRX'];
        $spot_symbols = ['BTC/USDT', 'BTC/USDC', 'BTC/USD', 'BTC/CNY', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'ETH/USD', 'ETH/USDT', 'BTC/JPY', 'LTC/BTC', 'ZRX/WETH', 'EUR/USD'];
        $swap_symbols = ['BTC/USDT:USDT', 'BTC/USDC:USDC', 'BTC/USD:USD', 'ETH/USDT:USDT', 'ETH/USD:USD', 'LTC/USDT:USDT', 'DOGE/USDT:USDT', 'ADA/USDT:USDT', 'BTC/USD:BTC', 'ETH/USD:ETH'];
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
                $this->run_public_tests($exchange, $spot_symbol);
            }
            if ($exchange->has['swap'] && $swap_symbol !== null) {
                if ($this->info) {
                    dump('[INFO] ### SWAP TESTS ###');
                }
                $exchange->options['defaultType'] = 'swap';
                $this->run_public_tests($exchange, $swap_symbol);
            }
        }
        if ($this->private_test || $this->private_test_only) {
            if ($exchange->has['spot'] && $spot_symbol !== null) {
                $exchange->options['defaultType'] = 'spot';
                $this->run_private_tests($exchange, $spot_symbol);
            }
            if ($exchange->has['swap'] && $swap_symbol !== null) {
                $exchange->options['defaultType'] = 'swap';
                $this->run_private_tests($exchange, $swap_symbol);
            }
        }
    }

    public function run_private_tests($exchange, $symbol) {
        if (!$exchange->check_required_credentials(false)) {
            dump('[INFO] Skipping private tests', 'Keys not found');
            return;
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
        $this->run_tests($exchange, $tests, false);
    }

    public function test_proxies($exchange) {
        // these tests should be synchronously executed, because of conflicting nature of proxy settings
        $proxy_test_name = $this->proxy_test_file_name;
        // todo: temporary skip for sync py
        if ($this->ext === 'py' && $this->is_synchronous) {
            return;
        }
        // try proxy several times
        $max_retries = 3;
        $exception = null;
        for ($j = 0; $j < $max_retries; $j++) {
            try {
                $this->test_method($proxy_test_name, $exchange, [], true);
                break; // if successfull, then break
            } catch(\Throwable $e) {
                $exception = $e;
            }
        }
        // if exception was set, then throw it
        if ($exception) {
            $error_message = '[TEST_FAILURE] Failed ' . $proxy_test_name . ' : ' . exception_message($exception);
        }
    }

    public function start_test($exchange, $symbol) {
        // we do not need to test aliases
        if ($exchange->alias) {
            return;
        }
        if ($this->sandbox || get_exchange_prop($exchange, 'sandbox')) {
            $exchange->set_sandbox_mode(true);
        }
        try {
            $result = $this->load_exchange($exchange);
            if (!$result) {
                close($exchange);
                return;
            }
            // if (exchange.id === 'binance') {
            //     // we test proxies functionality just for one random exchange on each build, because proxy functionality is not exchange-specific, instead it's all done from base methods, so just one working sample would mean it works for all ccxt exchanges
            //     // await this.testProxies (exchange);
            // }
            $this->test_exchange($exchange, $symbol);
            close($exchange);
        } catch(\Throwable $e) {
            close($exchange);
            throw $e;
        }
    }

    public function assert_static_error($cond, $message, $calculated_output, $stored_output, $key = null) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        $calculated_string = json_stringify($calculated_output);
        $stored_string = json_stringify($stored_output);
        $error_message = $message . ' computed ' . $stored_string . ' stored: ' . $calculated_string;
        if ($key !== null) {
            $error_message = ' | ' . $key . ' | ' . 'computed value: ' . $stored_string . ' stored value: ' . $calculated_string;
        }
        assert($cond, $error_message);
    }

    public function load_markets_from_file($id) {
        // load markets from file
        // to make this test as fast as possible
        // and basically independent from the exchange
        // so we can run it offline
        $filename = $this->root_dir . './ts/src/test/static/markets/' . $id . '.json';
        $content = io_file_read($filename);
        return $content;
    }

    public function load_currencies_from_file($id) {
        $filename = $this->root_dir . './ts/src/test/static/currencies/' . $id . '.json';
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

    public function assert_new_and_stored_output($exchange, $skip_keys, $new_output, $stored_output, $strict_type_check = true, $asserting_key = null) {
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
        } elseif (gettype($stored_output) === 'array' && array_keys($stored_output) === array_keys(array_keys($stored_output)) && (gettype($new_output) === 'array' && array_keys($new_output) === array_keys(array_keys($new_output)))) {
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
                $is_boolean = (is_bool($sanitized_new_output)) || (is_bool($sanitized_stored_output));
                $is_string = (is_string($sanitized_new_output)) || (is_string($sanitized_stored_output));
                $is_undefined = ($sanitized_new_output === null) || ($sanitized_stored_output === null); // undefined is a perfetly valid value
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
                    return;
                }
                $stored_url_params = $this->urlencoded_to_dict($stored_url_query);
                $new_url_params = $this->urlencoded_to_dict($new_url_query);
                $this->assert_new_and_stored_output($exchange, $skip_keys, $new_url_params, $stored_url_params);
                return;
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

    public function test_method_statically($exchange, $method, $data, $type, $skip_keys) {
        $output = null;
        $request_url = null;
        try {
            call_exchange_method_dynamically($exchange, $method, $this->sanitize_data_input($data['input']));
        } catch(\Throwable $e) {
            if (!($e instanceof ProxyError)) {
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
            $error_message = '[' . $this->lang . '][STATIC_REQUEST_TEST_FAILURE]' . '[' . $this->exchange_hint($exchange) . ']' . '[' . $method . ']' . '[' . $data['description'] . ']' . ((string) $e);
            dump('[TEST_FAILURE]' . $error_message);
        }
    }

    public function test_response_statically($exchange, $method, $skip_keys, $data) {
        $expected_result = $exchange->safe_value($data, 'parsedResponse');
        $mocked_exchange = set_fetch_response($exchange, $data['httpResponse']);
        try {
            $unified_result = call_exchange_method_dynamically($exchange, $method, $this->sanitize_data_input($data['input']));
            $this->assert_static_response_output($mocked_exchange, $skip_keys, $unified_result, $expected_result);
        } catch(\Throwable $e) {
            $this->request_tests_failed = true;
            $error_message = '[' . $this->lang . '][STATIC_RESPONSE_TEST_FAILURE]' . '[' . $this->exchange_hint($exchange) . ']' . '[' . $method . ']' . '[' . $data['description'] . ']' . ((string) $e);
            dump('[TEST_FAILURE]' . $error_message);
        }
        set_fetch_response($exchange, null); // reset state
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
        $exchange->currencies = $currencies; // not working in python if assigned  in the config dict
        return $exchange;
    }

    public function test_exchange_request_statically($exchange_name, $exchange_data, $test_name = null) {
        // instantiate the exchange and make sure that we sink the requests to avoid an actual request
        $exchange = $this->init_offline_exchange($exchange_name);
        $global_options = $exchange->safe_dict($exchange_data, 'options', array());
        $exchange->options = $exchange->deep_extend($exchange->options, $global_options); // custom options to be used in the tests
        $methods = $exchange->safe_value($exchange_data, 'methods', array());
        $methods_names = is_array($methods) ? array_keys($methods) : array();
        for ($i = 0; $i < count($methods_names); $i++) {
            $method = $methods_names[$i];
            $results = $methods[$method];
            for ($j = 0; $j < count($results); $j++) {
                $result = $results[$j];
                $old_exchange_options = $exchange->options; // snapshot options;
                $test_exchange_options = $exchange->safe_value($result, 'options', array());
                $exchange->options = $exchange->deep_extend($old_exchange_options, $test_exchange_options); // custom options to be used in the tests
                $description = $exchange->safe_value($result, 'description');
                if (($test_name !== null) && ($test_name !== $description)) {
                    continue;
                }
                $is_disabled = $exchange->safe_bool($result, 'disabled', false);
                if ($is_disabled) {
                    continue;
                }
                $type = $exchange->safe_string($exchange_data, 'outputType');
                $skip_keys = $exchange->safe_value($exchange_data, 'skipKeys', []);
                $this->test_method_statically($exchange, $method, $result, $type, $skip_keys);
                // reset options
                $exchange->options = $exchange->deep_extend($old_exchange_options, array());
            }
        }
        close($exchange);
        return true;  // in c# methods that will be used with promiseAll need to return something
    }

    public function test_exchange_response_statically($exchange_name, $exchange_data, $test_name = null) {
        $exchange = $this->init_offline_exchange($exchange_name);
        $methods = $exchange->safe_value($exchange_data, 'methods', array());
        $options = $exchange->safe_value($exchange_data, 'options', array());
        $exchange->options = $exchange->deep_extend($exchange->options, $options); // custom options to be used in the tests
        $methods_names = is_array($methods) ? array_keys($methods) : array();
        for ($i = 0; $i < count($methods_names); $i++) {
            $method = $methods_names[$i];
            $results = $methods[$method];
            for ($j = 0; $j < count($results); $j++) {
                $result = $results[$j];
                $description = $exchange->safe_value($result, 'description');
                $old_exchange_options = $exchange->options; // snapshot options;
                $test_exchange_options = $exchange->safe_value($result, 'options', array());
                $exchange->options = $exchange->deep_extend($old_exchange_options, $test_exchange_options); // custom options to be used in the tests
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
                $skip_keys = $exchange->safe_value($exchange_data, 'skipKeys', []);
                $this->test_response_statically($exchange, $method, $skip_keys, $result);
                // reset options
                $exchange->options = $exchange->deep_extend($old_exchange_options, array());
            }
        }
        close($exchange);
        return true;  // in c# methods that will be used with promiseAll need to return something
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
        $this->run_static_tests('request', $target_exchange, $test_name);
    }

    public function run_static_tests($type, $target_exchange = null, $test_name = null) {
        $folder = $this->root_dir . './ts/src/test/static/' . $type . '/';
        $static_data = $this->load_static_data($folder, $target_exchange);
        if ($static_data === null) {
            return;
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
        ($promises);
        if ($this->request_tests_failed || $this->response_tests_failed) {
            exit_script(1);
        } else {
            $success_message = '[' . $this->lang . '][TEST_SUCCESS] ' . ((string) $sum) . ' static ' . $type . ' tests passed.';
            dump('[INFO]' . $success_message);
        }
    }

    public function run_static_response_tests($exchange_name = null, $test = null) {
        //  -----------------------------------------------------------------------------
        //  --- Init of mockResponses tests functions------------------------------------
        //  -----------------------------------------------------------------------------
        $this->run_static_tests('response', $exchange_name, $test);
    }

    public function run_broker_id_tests() {
        //  -----------------------------------------------------------------------------
        //  --- Init of brokerId tests functions-----------------------------------------
        //  -----------------------------------------------------------------------------
        $promises = [$this->test_binance(), $this->test_okx(), $this->test_cryptocom(), $this->test_bybit(), $this->test_kucoin(), $this->test_kucoinfutures(), $this->test_bitget(), $this->test_mexc(), $this->test_htx(), $this->test_woo(), $this->test_bitmart(), $this->test_coinex(), $this->test_bingx(), $this->test_phemex(), $this->test_blofin(), $this->test_hyperliquid(), $this->test_coinbaseinternational()];
        ($promises);
        $success_message = '[' . $this->lang . '][TEST_SUCCESS] brokerId tests passed.';
        dump('[INFO]' . $success_message);
        exit_script(0);
    }

    public function test_binance() {
        $exchange = $this->init_offline_exchange('binance');
        $spot_id = 'x-R4BD3S82';
        $spot_order_request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $spot_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
        }
        $client_order_id = $spot_order_request['newClientOrderId'];
        $spot_id_string = ((string) $spot_id);
        assert(str_starts_with($client_order_id, $spot_id_string), 'binance - spot clientOrderId: ' . $client_order_id . ' does not start with spotId' . $spot_id_string);
        $swap_id = 'x-xcKtGhcu';
        $swap_order_request = null;
        try {
            $exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $swap_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
        }
        $swap_inverse_order_request = null;
        try {
            $exchange->create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $swap_inverse_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
        }
        $client_order_id_swap = $swap_order_request['newClientOrderId'];
        $swap_id_string = ((string) $swap_id);
        assert(str_starts_with($client_order_id_swap, $swap_id_string), 'binance - swap clientOrderId: ' . $client_order_id_swap . ' does not start with swapId' . $swap_id_string);
        $client_order_id_inverse = $swap_inverse_order_request['newClientOrderId'];
        assert(str_starts_with($client_order_id_inverse, $swap_id_string), 'binance - swap clientOrderIdInverse: ' . $client_order_id_inverse . ' does not start with swapId' . $swap_id_string);
        close($exchange);
        return true;
    }

    public function test_okx() {
        $exchange = $this->init_offline_exchange('okx');
        $id = 'e847386590ce4dBC';
        $spot_order_request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
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
            $exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $swap_order_request = json_parse($exchange->last_request_body);
        }
        $client_order_id_swap = $swap_order_request[0]['clOrdId'];
        assert(str_starts_with($client_order_id_swap, $id_string), 'okx - swap clientOrderId: ' . $client_order_id_swap . ' does not start with id: ' . $id_string);
        $swap_tag = $swap_order_request[0]['tag'];
        assert($swap_tag === $id, 'okx - id: ' . $id . ' different from swap tag: ' . $swap_tag);
        close($exchange);
        return true;
    }

    public function test_cryptocom() {
        $exchange = $this->init_offline_exchange('cryptocom');
        $id = 'CCXT';
        $exchange->load_markets();
        $request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $request = json_parse($exchange->last_request_body);
        }
        $broker_id = $request['params']['broker_id'];
        assert($broker_id === $id, 'cryptocom - id: ' . $id . ' different from  broker_id: ' . $broker_id);
        close($exchange);
        return true;
    }

    public function test_bybit() {
        $exchange = $this->init_offline_exchange('bybit');
        $req_headers = null;
        $id = 'CCXT';
        assert($exchange->options['brokerId'] === $id, 'id not in options');
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            // we expect an error here, we're only interested in the headers
            $req_headers = $exchange->last_request_headers;
        }
        assert($req_headers['Referer'] === $id, 'bybit - id: ' . $id . ' not in headers.');
        close($exchange);
        return true;
    }

    public function test_kucoin() {
        $exchange = $this->init_offline_exchange('kucoin');
        $req_headers = null;
        $options_string = ((string) $exchange->options);
        $spot_id = $exchange->options['partner']['spot']['id'];
        $spot_key = $exchange->options['partner']['spot']['key'];
        assert($spot_id === 'ccxt', 'kucoin - id: ' . $spot_id . ' not in options: ' . $options_string);
        assert($spot_key === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'kucoin - key: ' . $spot_key . ' not in options: ' . $options_string);
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            // we expect an error here, we're only interested in the headers
            $req_headers = $exchange->last_request_headers;
        }
        $id = 'ccxt';
        assert($req_headers['KC-API-PARTNER'] === $id, 'kucoin - id: ' . $id . ' not in headers.');
        close($exchange);
        return true;
    }

    public function test_kucoinfutures() {
        $exchange = $this->init_offline_exchange('kucoinfutures');
        $req_headers = null;
        $id = 'ccxtfutures';
        $options_string = ((string) $exchange->options['partner']['future']);
        $future_id = $exchange->options['partner']['future']['id'];
        $future_key = $exchange->options['partner']['future']['key'];
        assert($future_id === $id, 'kucoinfutures - id: ' . $future_id . ' not in options: ' . $options_string);
        assert($future_key === '1b327198-f30c-4f14-a0ac-918871282f15', 'kucoinfutures - key: ' . $future_key . ' not in options: ' . $options_string);
        try {
            $exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $req_headers = $exchange->last_request_headers;
        }
        assert($req_headers['KC-API-PARTNER'] === $id, 'kucoinfutures - id: ' . $id . ' not in headers.');
        close($exchange);
        return true;
    }

    public function test_bitget() {
        $exchange = $this->init_offline_exchange('bitget');
        $req_headers = null;
        $id = 'p4sve';
        $options_string = ((string) $exchange->options);
        assert($exchange->options['broker'] === $id, 'bitget - id: ' . $id . ' not in options: ' . $options_string);
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $req_headers = $exchange->last_request_headers;
        }
        assert($req_headers['X-CHANNEL-API-CODE'] === $id, 'bitget - id: ' . $id . ' not in headers.');
        close($exchange);
        return true;
    }

    public function test_mexc() {
        $exchange = $this->init_offline_exchange('mexc');
        $req_headers = null;
        $id = 'CCXT';
        $options_string = ((string) $exchange->options);
        assert($exchange->options['broker'] === $id, 'mexc - id: ' . $id . ' not in options: ' . $options_string);
        $exchange->load_markets();
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $req_headers = $exchange->last_request_headers;
        }
        $req_headers_string = $req_headers !== null ? ((string) $req_headers) : 'undefined';
        assert($req_headers['source'] === $id, 'mexc - id: ' . $id . ' not in headers: ' . $req_headers_string);
        close($exchange);
        return true;
    }

    public function test_htx() {
        $exchange = $this->init_offline_exchange('htx');
        // spot test
        $id = 'AA03022abc';
        $spot_order_request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $spot_order_request = json_parse($exchange->last_request_body);
        }
        $client_order_id = $spot_order_request['client-order-id'];
        $id_string = ((string) $id);
        assert(str_starts_with($client_order_id, $id_string), 'htx - spot clientOrderId ' . $client_order_id . ' does not start with id: ' . $id_string);
        // swap test
        $swap_order_request = null;
        try {
            $exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $swap_order_request = json_parse($exchange->last_request_body);
        }
        $swap_inverse_order_request = null;
        try {
            $exchange->create_order('BTC/USD:BTC', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $swap_inverse_order_request = json_parse($exchange->last_request_body);
        }
        $client_order_id_swap = $swap_order_request['channel_code'];
        assert(str_starts_with($client_order_id_swap, $id_string), 'htx - swap channel_code ' . $client_order_id_swap . ' does not start with id: ' . $id_string);
        $client_order_id_inverse = $swap_inverse_order_request['channel_code'];
        assert(str_starts_with($client_order_id_inverse, $id_string), 'htx - swap inverse channel_code ' . $client_order_id_inverse . ' does not start with id: ' . $id_string);
        close($exchange);
        return true;
    }

    public function test_woo() {
        $exchange = $this->init_offline_exchange('woo');
        // spot test
        $id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
        $spot_order_request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $spot_order_request = $this->urlencoded_to_dict($exchange->last_request_body);
        }
        $broker_id = $spot_order_request['broker_id'];
        $id_string = ((string) $id);
        assert(str_starts_with($broker_id, $id_string), 'woo - broker_id: ' . $broker_id . ' does not start with id: ' . $id_string);
        // swap test
        $stop_order_request = null;
        try {
            $exchange->create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, array(
                'stopPrice' => 30000,
            ));
        } catch(\Throwable $e) {
            $stop_order_request = json_parse($exchange->last_request_body);
        }
        $client_order_id_stop = $stop_order_request['brokerId'];
        assert(str_starts_with($client_order_id_stop, $id_string), 'woo - brokerId: ' . $client_order_id_stop . ' does not start with id: ' . $id_string);
        close($exchange);
        return true;
    }

    public function test_bitmart() {
        $exchange = $this->init_offline_exchange('bitmart');
        $req_headers = null;
        $id = 'CCXTxBitmart000';
        assert($exchange->options['brokerId'] === $id, 'bitmart - id: ' . $id . ' not in options');
        $exchange->load_markets();
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $req_headers = $exchange->last_request_headers;
        }
        assert($req_headers['X-BM-BROKER-ID'] === $id, 'bitmart - id: ' . $id . ' not in headers');
        close($exchange);
        return true;
    }

    public function test_coinex() {
        $exchange = $this->init_offline_exchange('coinex');
        $id = 'x-167673045';
        assert($exchange->options['brokerId'] === $id, 'coinex - id: ' . $id . ' not in options');
        $spot_order_request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $spot_order_request = json_parse($exchange->last_request_body);
        }
        $client_order_id = $spot_order_request['client_id'];
        $id_string = ((string) $id);
        assert(str_starts_with($client_order_id, $id_string), 'coinex - clientOrderId: ' . $client_order_id . ' does not start with id: ' . $id_string);
        close($exchange);
        return true;
    }

    public function test_bingx() {
        $exchange = $this->init_offline_exchange('bingx');
        $req_headers = null;
        $id = 'CCXT';
        $options_string = ((string) $exchange->options);
        assert($exchange->options['broker'] === $id, 'bingx - id: ' . $id . ' not in options: ' . $options_string);
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            // we expect an error here, we're only interested in the headers
            $req_headers = $exchange->last_request_headers;
        }
        $req_headers_string = $req_headers !== null ? ((string) $req_headers) : 'undefined';
        assert($req_headers['X-SOURCE-KEY'] === $id, 'bingx - id: ' . $id . ' not in headers: ' . $req_headers_string);
        close($exchange);
    }

    public function test_phemex() {
        $exchange = $this->init_offline_exchange('phemex');
        $id = 'CCXT123456';
        $request = null;
        try {
            $exchange->create_order('BTC/USDT', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $request = json_parse($exchange->last_request_body);
        }
        $client_order_id = $request['clOrdID'];
        $id_string = ((string) $id);
        assert(str_starts_with($client_order_id, $id_string), 'phemex - clOrdID: ' . $client_order_id . ' does not start with id: ' . $id_string);
        close($exchange);
    }

    public function test_blofin() {
        $exchange = $this->init_offline_exchange('blofin');
        $id = 'ec6dd3a7dd982d0b';
        $request = null;
        try {
            $exchange->create_order('LTC/USDT:USDT', 'market', 'buy', 1);
        } catch(\Throwable $e) {
            $request = json_parse($exchange->last_request_body);
        }
        $broker_id = $request['brokerId'];
        $id_string = ((string) $id);
        assert(str_starts_with($broker_id, $id_string), 'blofin - brokerId: ' . $broker_id . ' does not start with id: ' . $id_string);
        close($exchange);
    }

    public function test_hyperliquid() {
        $exchange = $this->init_offline_exchange('hyperliquid');
        $id = '1';
        $request = null;
        try {
            $exchange->create_order('SOL/USDC:USDC', 'limit', 'buy', 1, 100);
        } catch(\Throwable $e) {
            $request = json_parse($exchange->last_request_body);
        }
        $broker_id = ((string) ($request['action']['brokerCode']));
        assert($broker_id === $id, 'hyperliquid - brokerId: ' . $broker_id . ' does not start with id: ' . $id);
        close($exchange);
    }

    public function test_coinbaseinternational() {
        $exchange = $this->init_offline_exchange('coinbaseinternational');
        $exchange->options['portfolio'] = 'random';
        $id = 'nfqkvdjp';
        assert($exchange->options['brokerId'] === $id, 'id not in options');
        $request = null;
        try {
            $exchange->create_order('BTC/USDC:USDC', 'limit', 'buy', 1, 20000);
        } catch(\Throwable $e) {
            $request = json_parse($exchange->last_request_body);
        }
        $client_order_id = $request['client_order_id'];
        assert(str_starts_with($client_order_id, ((string) $id)), 'clientOrderId does not start with id');
        close($exchange);
        return true;
    }
}

// ***** AUTO-TRANSPILER-END *****
// *******************************
$promise = (new testMainClass())->init($exchangeId, $exchangeSymbol);
if (!is_synchronous) {
    Async\await($promise);
}
