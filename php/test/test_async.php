<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
ini_set('memory_limit', '512M');

define('rootDir', __DIR__ . '/../../');
define('root_dir', __DIR__ . '/../../');
include_once rootDir .'/vendor/autoload.php';
use React\Async;
use React\Promise;

assert_options (ASSERT_CALLBACK, function(string $file, int $line, ?string $assertion, string $description = null){
    $args = func_get_args();
    $message = '';
    try {
        $message = "[ASSERT_ERROR] - [ $file : $line ] $description";
    } catch (\Exception $exc) {
        $message = "[ASSERT_ERROR] -" . json_encode($args);
    }
    $message = substr($message, 0, LOG_CHARS_LENGTH);
    dump($message);
    exit;
});

$filetered_args = array_filter(array_map (function ($x) { return stripos($x,'--')===false? $x : null;} , $argv));
$exchangeId = array_key_exists(1, $filetered_args) ? $filetered_args[1] : null; // this should be different than JS
$exchangeSymbol = null; // todo: this should be different than JS

// non-transpiled part, but shared names among langs

class baseMainTestClass {
    public $lang = 'PHP';
    public $testFiles = [];
    public $skippedMethods = [];
    public $checkedPublicTests = [];
    public $publicTests = [];
    public $info = false;
    public $verbose = false;
    public $debug = false;
    public $privateTest = false;
    public $privateTestOnly = false;
    public $sandbox = false;
    public $staticTests = false;
    public $staticTestsFailed = false;
    public $idTests = false;
}

define ('is_synchronous', stripos(__FILE__, '_async') === false);

define('rootDirForSkips', __DIR__ . '/../../');
define('envVars', $_ENV);
define('LOG_CHARS_LENGTH', 10000);
define('ext', 'php');

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

function json_parse($s) {
    return json_decode($s, true);
}

function json_stringify($s) {
    return json_encode($s);
}

function get_cli_arg_value ($arg) {
    return in_array($arg, $GLOBALS['argv']);
}

function get_test_name($methodName) {
    $snake_cased = strtolower(preg_replace('/(?<!^)(?=[A-Z])/', '_', $methodName)); // snake_case
    $snake_cased = str_replace('o_h_l_c_v', 'ohlcv', $snake_cased);
    return 'test_' . $snake_cased;
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
    return $testFiles[$methodName]($exchange, $skippedProperties, ... $args);
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
    $message = '[' . get_class($exc) . '] ' . $output . "\n\n";
    return substr($message, 0, LOG_CHARS_LENGTH);
}

function exit_script($code = 0) {
    exit($code);
}

function get_exchange_prop ($exchange, $prop, $defaultValue = null) {
    return property_exists ($exchange, $prop) ? $exchange->{$prop} : $defaultValue;
}

function set_exchange_prop ($exchange, $prop, $value) {
    $exchange->{$prop} = $value;
}

function init_exchange ($exchangeId, $args) {
    $exchangeClassString = '\\ccxt\\' . (is_synchronous ? '' : 'async\\') . $exchangeId;
    return new $exchangeClassString($args);
}

function set_test_files ($holderClass, $properties) {
    return Async\async (function() use ($holderClass, $properties){
        $skiped = ['test_throttle'];
        foreach (glob(__DIR__ . '/' . (is_synchronous ? 'sync' : 'async') . '/test_*.php') as $filename) {
            $basename = basename($filename);
            if (!in_array($basename, $skiped)) {
                include_once $filename;
            }
        }
        $allfuncs = get_defined_functions()['user'];
        foreach ($allfuncs as $fName) {
            if (stripos($fName, 'ccxt\\test_')!==false) {
                $nameWithoutNs = str_replace('ccxt\\', '', $fName);
                $holderClass->testFiles[$nameWithoutNs] = $fName;
            }
        }
    })();
}

function is_null_value($value) {
    return $value === null;
}

function close($exchange) {
    return Async\async (function() {
        // stub
        return true;
    })();
}

// *********************************
// ***** AUTO-TRANSPILER-START *****
class testMainClass extends baseMainTestClass {
    public function parseCliArgs() {
        $this->idTests = get_cli_arg_value('--idTests');
        $this->staticTests = get_cli_arg_value('--static');
        $this->info = get_cli_arg_value('--info');
        $this->verbose = get_cli_arg_value('--verbose');
        $this->debug = get_cli_arg_value('--debug');
        $this->privateTest = get_cli_arg_value('--private');
        $this->privateTestOnly = get_cli_arg_value('--privateOnly');
        $this->sandbox = get_cli_arg_value('--sandbox');
    }

    public function init($exchangeId, $symbol) {
        return Async\async(function () use ($exchangeId, $symbol) {
            $this->parseCliArgs();
            if ($this->staticTests) {
                Async\await($this->runStaticTests($exchangeId, $symbol)); // symbol here is the testname
                return;
            }
            if ($this->idTests) {
                Async\await($this->runBrokerIdTests());
                return;
            }
            $symbolStr = $symbol !== null ? $symbol : 'all';
            dump('\nTESTING ', $ext, array(
                'exchange' => $exchangeId,
                'symbol' => $symbolStr,
            ), '\n');
            $exchangeArgs = array(
                'verbose' => $this->verbose,
                'debug' => $this->debug,
                'enableRateLimit' => true,
                'timeout' => 30000,
            );
            $exchange = init_exchange($exchangeId, $exchangeArgs);
            Async\await($this->importFiles($exchange));
            $this->expandSettings($exchange, $symbol);
            Async\await($this->startTest($exchange, $symbol));
        }) ();
    }

    public function importFiles($exchange) {
        // exchange tests
        return Async\async(function () use ($exchange) {
            $this->testFiles = array();
            $properties = is_array($exchange->has) ? array_keys($exchange->has) : array();
            $properties[] = 'loadMarkets';
            Async\await(set_test_files($this, $properties));
        }) ();
    }

    public function expandSettings($exchange, $symbol) {
        $exchangeId = $exchange->id;
        $keysGlobal = $rootDir . 'keys.json';
        $keysLocal = $rootDir . 'keys.local.json';
        $keysGlobalExists = io_file_exists($keysGlobal);
        $keysLocalExists = io_file_exists($keysLocal);
        $globalSettings = $keysGlobalExists ? io_file_read($keysGlobal) : array();
        $localSettings = $keysLocalExists ? io_file_read($keysLocal) : array();
        $allSettings = $exchange->deepExtend($globalSettings, $localSettings);
        $exchangeSettings = $exchange->safeValue($allSettings, $exchangeId, array());
        if ($exchangeSettings) {
            $settingKeys = is_array($exchangeSettings) ? array_keys($exchangeSettings) : array();
            for ($i = 0; $i < count($settingKeys); $i++) {
                $key = $settingKeys[$i];
                if ($exchangeSettings[$key]) {
                    $finalValue = null;
                    if (is_array($exchangeSettings[$key])) {
                        $existing = get_exchange_prop($exchange, $key, array());
                        $finalValue = $exchange->deepExtend($existing, $exchangeSettings[$key]);
                    } else {
                        $finalValue = $exchangeSettings[$key];
                    }
                    set_exchange_prop($exchange, $key, $finalValue);
                }
            }
        }
        // credentials
        $reqCreds = get_exchange_prop($exchange, 're' . 'quiredCredentials'); // dont glue the r-e-q-u-i-r-e phrase, because leads to messed up transpilation
        $objkeys = is_array($reqCreds) ? array_keys($reqCreds) : array();
        for ($i = 0; $i < count($objkeys); $i++) {
            $credential = $objkeys[$i];
            $isRequired = $reqCreds[$credential];
            if ($isRequired && get_exchange_prop($exchange, $credential) === null) {
                $fullKey = $exchangeId . '_' . $credential;
                $credentialEnvName = strtoupper($fullKey); // example: KRAKEN_APIKEY
                $credentialValue = (is_array($envVars) && array_key_exists($credentialEnvName, $envVars)) ? $envVars[$credentialEnvName] : null;
                if ($credentialValue) {
                    set_exchange_prop($exchange, $credential, $credentialValue);
                }
            }
        }
        // skipped tests
        $skippedFile = $rootDirForSkips . 'skip-tests.json';
        $skippedSettings = io_file_read($skippedFile);
        $skippedSettingsForExchange = $exchange->safeValue($skippedSettings, $exchangeId, array());
        // others
        $timeout = $exchange->safeValue($skippedSettingsForExchange, 'timeout');
        if ($timeout !== null) {
            $exchange->timeout = $timeout;
        }
        $exchange->httpsProxy = $exchange->safeString($skippedSettingsForExchange, 'httpsProxy');
        $this->skippedMethods = $exchange->safeValue($skippedSettingsForExchange, 'skipMethods', array());
        $this->checkedPublicTests = array();
    }

    public function addPadding($message, $size) {
        // has to be transpilable
        $res = '';
        $missingSpace = $size - count($message) - 0; // - 0 is added just to trick transpile to treat the .length as a string for php
        if ($missingSpace > 0) {
            for ($i = 0; $i < $missingSpace; $i++) {
                $res .= ' ';
            }
        }
        return $message . $res;
    }

    public function testMethod($methodName, $exchange, $args, $isPublic) {
        return Async\async(function () use ($methodName, $exchange, $args, $isPublic) {
            $isLoadMarkets = ($methodName === 'loadMarkets');
            $methodNameInTest = get_test_name($methodName);
            // if this is a private test, and the implementation was already tested in public, then no need to re-test it in private test (exception is fetchCurrencies, because our approach in base exchange)
            if (!$isPublic && (is_array($this->checkedPublicTests) && array_key_exists($methodNameInTest, $this->checkedPublicTests)) && ($methodName !== 'fetchCurrencies')) {
                return;
            }
            $skipMessage = null;
            if (!$isLoadMarkets && (!(is_array($exchange->has) && array_key_exists($methodName, $exchange->has)) || !$exchange->has[$methodName])) {
                $skipMessage = '[INFO:UNSUPPORTED_TEST]'; // keep it aligned with the longest message
            } elseif ((is_array($this->skippedMethods) && array_key_exists($methodName, $this->skippedMethods)) && (is_string($this->skippedMethods[$methodName]))) {
                $skipMessage = '[INFO:SKIPPED_TEST]';
            } elseif (!(is_array($this->testFiles) && array_key_exists($methodNameInTest, $this->testFiles))) {
                $skipMessage = '[INFO:UNIMPLEMENTED_TEST]';
            }
            // exceptionally for `loadMarkets` call, we call it before it's even checked for "skip" as we need it to be called anyway (but can skip "test.loadMarket" for it)
            if ($isLoadMarkets) {
                Async\await($exchange->loadMarkets(true));
            }
            if ($skipMessage) {
                if ($this->info) {
                    dump($this->addPadding($skipMessage, 25), $exchange->id, $methodNameInTest);
                }
                return;
            }
            if ($this->info) {
                $argsStringified = '(' . implode(',', $args) . ')';
                dump($this->addPadding('[INFO:TESTING]', 25), $exchange->id, $methodNameInTest, $argsStringified);
            }
            $skippedProperties = $exchange->safeValue($this->skippedMethods, $methodName, array());
            Async\await(call_method($this->testFiles, $methodNameInTest, $exchange, $skippedProperties, $args));
            // if it was passed successfully, add to the list of successfull tests
            if ($isPublic) {
                $this->checkedPublicTests[$methodNameInTest] = true;
            }
        }) ();
    }

    public function testSafe($methodName, $exchange, $args = [], $isPublic = false) {
        // `testSafe` method does not throw an exception, instead mutes it.
        // The reason we mute the thrown exceptions here is because if this test is part
        // of "runPublicTests", then we don't want to stop the whole test if any single
        // test-method fails. For example, if "fetchOrderBook" public test fails, we still
        // want to run "fetchTickers" and other methods. However, independently this fact,
        // from those test-methods we still echo-out (console.log/print...) the exception
        // messages with specific formatted message "[TEST_FAILURE] ..." and that output is
        // then regex-parsed by run-tests.js, so the exceptions are still printed out to
        // console from there. So, even if some public tests fail, the script will continue
        // doing other things (testing other spot/swap or private tests ...)
        return Async\async(function () use ($methodName, $exchange, $args, $isPublic) {
            $maxRetries = 3;
            $argsStringified = $exchange->json($args); // args.join() breaks when we provide a list of symbols | "args.toString()" breaks bcz of "array to string conversion"
            for ($i = 0; $i < $maxRetries; $i++) {
                try {
                    Async\await($this->testMethod($methodName, $exchange, $args, $isPublic));
                    return true;
                } catch(Exception $e) {
                    $isAuthError = (e instanceof AuthenticationError);
                    $isNotSupported = (e instanceof NotSupported);
                    $isNetworkError = (e instanceof NetworkError); // includes "DDoSProtection", "RateLimitExceeded", "RequestTimeout", "ExchangeNotAvailable", "isOperationFailed", "InvalidNonce", ...
                    $isExchangeNotAvailable = (e instanceof ExchangeNotAvailable);
                    $isOnMaintenance = (e instanceof OnMaintenance);
                    $tempFailure = $isNetworkError && (!$isExchangeNotAvailable || $isOnMaintenance); // we do not mute specifically "ExchangeNotAvailable" excetpion (but its subtype "OnMaintenance" can be muted)
                    if ($tempFailure) {
                        // if last retry was gone with same `tempFailure` error, then let's eventually return false
                        if ($i === $maxRetries - 1) {
                            dump('[TEST_WARNING]', 'Method could not be tested due to a repeated Network/Availability issues', ' | ', $exchange->id, $methodName, $argsStringified);
                        } else {
                            // wait and retry again
                            Async\await($exchange->sleep($i * 1000)); // increase wait seconds on every retry
                            continue;
                        }
                    } elseif (e instanceof OnMaintenance) {
                        // in case of maintenance, skip exchange (don't fail the test)
                        dump('[TEST_WARNING] Exchange is on maintenance', $exchange->id);
                    } elseif ($isPublic && $isAuthError) {
                        // in case of loadMarkets, it means that "tester" (developer or travis) does not have correct authentication, so it does not have a point to proceed at all
                        if ($methodName === 'loadMarkets') {
                            dump('[TEST_WARNING]', 'Exchange can not be tested, because of authentication problems during loadMarkets', exception_message($e), $exchange->id, $methodName, $argsStringified);
                        }
                        if ($this->info) {
                            dump('[TEST_WARNING]', 'Authentication problem for public method', exception_message($e), $exchange->id, $methodName, $argsStringified);
                        }
                    } else {
                        // if not a temporary connectivity issue, then mark test as failed (no need to re-try)
                        if ($isNotSupported) {
                            dump('[NOT_SUPPORTED]', $exchange->id, $methodName, $argsStringified);
                            return true;  // why consider not supported as a failed test?
                        } else {
                            dump('[TEST_FAILURE]', exception_message($e), $exchange->id, $methodName, $argsStringified);
                        }
                    }
                    return false;
                }
            }
        }) ();
    }

    public function runPublicTests($exchange, $symbol) {
        return Async\async(function () use ($exchange, $symbol) {
            $tests = array(
                'fetchCurrencies' => [],
                'fetchTicker' => [$symbol],
                'fetchTickers' => [$symbol],
                'fetchOHLCV' => [$symbol],
                'fetchTrades' => [$symbol],
                'fetchOrderBook' => [$symbol],
                'fetchL2OrderBook' => [$symbol],
                'fetchOrderBooks' => [],
                'fetchBidsAsks' => [],
                'fetchStatus' => [],
                'fetchTime' => [],
            );
            $market = $exchange->market($symbol);
            $isSpot = $market['spot'];
            if ($isSpot) {
                $tests['fetchCurrencies'] = [];
            } else {
                $tests['fetchFundingRates'] = [$symbol];
                $tests['fetchFundingRate'] = [$symbol];
                $tests['fetchFundingRateHistory'] = [$symbol];
                $tests['fetchIndexOHLCV'] = [$symbol];
                $tests['fetchMarkOHLCV'] = [$symbol];
                $tests['fetchPremiumIndexOHLCV'] = [$symbol];
            }
            $this->publicTests = $tests;
            $testNames = is_array($tests) ? array_keys($tests) : array();
            $promises = [];
            for ($i = 0; $i < count($testNames); $i++) {
                $testName = $testNames[$i];
                $testArgs = $tests[$testName];
                $promises[] = $this->testSafe($testName, $exchange, $testArgs, true);
            }
            // todo - not yet ready in other langs too
            // promises.push (testThrottle ());
            $results = Async\await(Promise\all($promises));
            // now count which test-methods retuned `false` from "testSafe" and dump that info below
            if ($this->info) {
                $errors = [];
                for ($i = 0; $i < count($testNames); $i++) {
                    if (!$results[$i]) {
                        $errors[] = $testNames[$i];
                    }
                }
                // we don't throw exception for public-tests, see comments under 'testSafe' method
                $errorsInMessage = '';
                if ($errors) {
                    $failedMsg = implode(', ', $errors);
                    $errorsInMessage = ' | Failed methods : ' . $failedMsg;
                }
                $messageContent = '[INFO:PUBLIC_TESTS_END] ' . $market['type'] . $errorsInMessage;
                $messageWithPadding = $this->addPadding($messageContent, 25);
                dump($messageWithPadding, $exchange->id);
            }
        }) ();
    }

    public function loadExchange($exchange) {
        return Async\async(function () use ($exchange) {
            $result = Async\await($this->testSafe('loadMarkets', $exchange, [], true));
            if (!$result) {
                return false;
            }
            $symbols = ['BTC/CNY', 'BTC/USD', 'BTC/USDT', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'BTC/JPY', 'ETH/EUR', 'ETH/JPY', 'ETH/CNY', 'ETH/USD', 'LTC/CNY', 'DASH/BTC', 'DOGE/BTC', 'BTC/AUD', 'BTC/PLN', 'USD/SLL', 'BTC/RUB', 'BTC/UAH', 'LTC/BTC', 'EUR/USD'];
            $resultSymbols = [];
            $exchangeSpecificSymbols = $exchange->symbols;
            for ($i = 0; $i < count($exchangeSpecificSymbols); $i++) {
                $symbol = $exchangeSpecificSymbols[$i];
                if ($exchange->inArray($symbol, $symbols)) {
                    $resultSymbols[] = $symbol;
                }
            }
            $resultMsg = '';
            $resultLength = count($resultSymbols);
            $exchangeSymbolsLength = count($exchange->symbols);
            if ($resultLength > 0) {
                if ($exchangeSymbolsLength > $resultLength) {
                    $resultMsg = implode(', ', $resultSymbols) . ' + more...';
                } else {
                    $resultMsg = implode(', ', $resultSymbols);
                }
            }
            dump('Exchange loaded', $exchangeSymbolsLength, 'symbols', $resultMsg);
            return true;
        }) ();
    }

    public function getTestSymbol($exchange, $isSpot, $symbols) {
        $symbol = null;
        for ($i = 0; $i < count($symbols); $i++) {
            $s = $symbols[$i];
            $market = $exchange->safeValue($exchange->markets, $s);
            if ($market !== null) {
                $active = $exchange->safeValue($market, 'active');
                if ($active || ($active === null)) {
                    $symbol = $s;
                    break;
                }
            }
        }
        return $symbol;
    }

    public function getExchangeCode($exchange, $codes = null) {
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

    public function getMarketsFromExchange($exchange, $spot = true) {
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

    public function getValidSymbol($exchange, $spot = true) {
        $currentTypeMarkets = $this->getMarketsFromExchange($exchange, $spot);
        $codes = ['BTC', 'ETH', 'XRP', 'LTC', 'BCH', 'EOS', 'BNB', 'BSV', 'USDT', 'ATOM', 'BAT', 'BTG', 'DASH', 'DOGE', 'ETC', 'IOTA', 'LSK', 'MKR', 'NEO', 'PAX', 'QTUM', 'TRX', 'TUSD', 'USD', 'USDC', 'WAVES', 'XEM', 'XMR', 'ZEC', 'ZRX'];
        $spotSymbols = ['BTC/USD', 'BTC/USDT', 'BTC/CNY', 'BTC/EUR', 'BTC/ETH', 'ETH/BTC', 'ETH/USD', 'ETH/USDT', 'BTC/JPY', 'LTC/BTC', 'ZRX/WETH', 'EUR/USD'];
        $swapSymbols = ['BTC/USDT:USDT', 'BTC/USD:USD', 'ETH/USDT:USDT', 'ETH/USD:USD', 'LTC/USDT:USDT', 'DOGE/USDT:USDT', 'ADA/USDT:USDT', 'BTC/USD:BTC', 'ETH/USD:ETH'];
        $targetSymbols = $spot ? $spotSymbols : $swapSymbols;
        $symbol = $this->getTestSymbol($exchange, $spot, $targetSymbols);
        // if symbols wasn't found from above hardcoded list, then try to locate any symbol which has our target hardcoded 'base' code
        if ($symbol === null) {
            for ($i = 0; $i < count($codes); $i++) {
                $currentCode = $codes[$i];
                $marketsArrayForCurrentCode = $exchange->filterBy($currentTypeMarkets, 'base', $currentCode);
                $indexedMkts = $exchange->indexBy($marketsArrayForCurrentCode, 'symbol');
                $symbolsArrayForCurrentCode = is_array($indexedMkts) ? array_keys($indexedMkts) : array();
                $symbolsLength = count($symbolsArrayForCurrentCode);
                if ($symbolsLength) {
                    $symbol = $this->getTestSymbol($exchange, $spot, $symbolsArrayForCurrentCode);
                    break;
                }
            }
        }
        // if there wasn't found any symbol with our hardcoded 'base' code, then just try to find symbols that are 'active'
        if ($symbol === null) {
            $activeMarkets = $exchange->filterBy($currentTypeMarkets, 'active', true);
            $activeSymbols = [];
            for ($i = 0; $i < count($activeMarkets); $i++) {
                $activeSymbols[] = $activeMarkets[$i]['symbol'];
            }
            $symbol = $this->getTestSymbol($exchange, $spot, $activeSymbols);
        }
        if ($symbol === null) {
            $values = is_array($currentTypeMarkets) ? array_values($currentTypeMarkets) : array();
            $valuesLength = count($values);
            if ($valuesLength > 0) {
                $first = $values[0];
                if ($first !== null) {
                    $symbol = $first['symbol'];
                }
            }
        }
        return $symbol;
    }

    public function testExchange($exchange, $providedSymbol = null) {
        return Async\async(function () use ($exchange, $providedSymbol) {
            $spotSymbol = null;
            $swapSymbol = null;
            if ($providedSymbol !== null) {
                $market = $exchange->market($providedSymbol);
                if ($market['spot']) {
                    $spotSymbol = $providedSymbol;
                } else {
                    $swapSymbol = $providedSymbol;
                }
            } else {
                if ($exchange->has['spot']) {
                    $spotSymbol = $this->getValidSymbol($exchange, true);
                }
                if ($exchange->has['swap']) {
                    $swapSymbol = $this->getValidSymbol($exchange, false);
                }
            }
            if ($spotSymbol !== null) {
                dump('Selected SPOT SYMBOL:', $spotSymbol);
            }
            if ($swapSymbol !== null) {
                dump('Selected SWAP SYMBOL:', $swapSymbol);
            }
            if (!$this->privateTestOnly) {
                if ($exchange->has['spot'] && $spotSymbol !== null) {
                    if ($this->info) {
                        dump('[INFO:SPOT TESTS]');
                    }
                    $exchange->options['type'] = 'spot';
                    Async\await($this->runPublicTests($exchange, $spotSymbol));
                }
                if ($exchange->has['swap'] && $swapSymbol !== null) {
                    if ($this->info) {
                        dump('[INFO:SWAP TESTS]');
                    }
                    $exchange->options['type'] = 'swap';
                    Async\await($this->runPublicTests($exchange, $swapSymbol));
                }
            }
            if ($this->privateTest || $this->privateTestOnly) {
                if ($exchange->has['spot'] && $spotSymbol !== null) {
                    $exchange->options['defaultType'] = 'spot';
                    Async\await($this->runPrivateTests($exchange, $spotSymbol));
                }
                if ($exchange->has['swap'] && $swapSymbol !== null) {
                    $exchange->options['defaultType'] = 'swap';
                    Async\await($this->runPrivateTests($exchange, $swapSymbol));
                }
            }
        }) ();
    }

    public function runPrivateTests($exchange, $symbol) {
        return Async\async(function () use ($exchange, $symbol) {
            if (!$exchange->checkRequiredCredentials(false)) {
                dump('[Skipping private tests]', 'Keys not found');
                return;
            }
            $code = $this->getExchangeCode($exchange);
            // if (exchange.extendedTest) {
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
                'fetchBorrowRates' => [],
                'fetchBorrowRate' => [$code],
                'fetchBorrowInterest' => [$code, $symbol],
                'cancelAllOrders' => [$symbol],
                'fetchCanceledOrders' => [$symbol],
                'fetchPosition' => [$symbol],
                'fetchDeposit' => [$code],
                'createDepositAddress' => [$code],
                'fetchDepositAddress' => [$code],
                'fetchDepositAddresses' => [$code],
                'fetchDepositAddressesByNetwork' => [$code],
                'fetchBorrowRateHistory' => [$code],
                'fetchBorrowRatesPerSymbol' => [],
                'fetchLedgerEntry' => [$code],
            );
            $market = $exchange->market($symbol);
            $isSpot = $market['spot'];
            if ($isSpot) {
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
            $combinedPublicPrivateTests = $exchange->deepExtend($this->publicTests, $tests);
            $testNames = is_array($combinedPublicPrivateTests) ? array_keys($combinedPublicPrivateTests) : array();
            $promises = [];
            for ($i = 0; $i < count($testNames); $i++) {
                $testName = $testNames[$i];
                $testArgs = $combinedPublicPrivateTests[$testName];
                $promises[] = $this->testSafe($testName, $exchange, $testArgs, false);
            }
            $results = Async\await(Promise\all($promises));
            $errors = [];
            for ($i = 0; $i < count($testNames); $i++) {
                $testName = $testNames[$i];
                $success = $results[$i];
                if (!$success) {
                    $errors[] = $testName;
                }
            }
            $errorsCnt = count($errors); // PHP transpile count($errors)
            if ($errorsCnt > 0) {
                // throw new Error ('Failed private tests [' + market['type'] + ']: ' + errors.join (', '));
                dump('[TEST_FAILURE]', 'Failed private tests [' . $market['type'] . ']: ' . implode(', ', $errors));
            } else {
                if ($this->info) {
                    dump($this->addPadding('[INFO:PRIVATE_TESTS_DONE]', 25), $exchange->id);
                }
            }
        }) ();
    }

    public function startTest($exchange, $symbol) {
        // we do not need to test aliases
        return Async\async(function () use ($exchange, $symbol) {
            if ($exchange->alias) {
                return;
            }
            if ($this->sandbox || get_exchange_prop($exchange, 'sandbox')) {
                $exchange->setSandboxMode(true);
            }
            try {
                $result = Async\await($this->loadExchange($exchange));
                if (!$result) {
                    Async\await(close($exchange));
                    return;
                }
                Async\await($this->testExchange($exchange, $symbol));
                Async\await(close($exchange));
            } catch(Exception $e) {
                Async\await(close($exchange));
                throw $e;
            }
        }) ();
    }

    public function assertStaticError($cond, $message, $calculatedOutput, $storedOutput) {
        //  -----------------------------------------------------------------------------
        //  --- Init of static tests functions------------------------------------------
        //  -----------------------------------------------------------------------------
        $calculatedString = json_stringify($calculatedOutput);
        $outputString = json_stringify($storedOutput);
        $errorMessage = $message . ' expected ' . $outputString . ' received: ' . $calculatedString;
        assert($cond, $errorMessage);
    }

    public function loadMarketsFromFile($id) {
        // load markets from file
        // to make this test as fast as possible
        // and basically independent from the exchange
        // so we can run it offline
        $filename = $rootDir . './ts/src/test/static/markets/' . $id . '.json';
        $content = io_file_read($filename);
        return $content;
    }

    public function loadStaticData($targetExchange = null) {
        $folder = $rootDir . './ts/src/test/static/data/';
        $result = array();
        if ($targetExchange) {
            // read a single exchange
            $result[$targetExchange] = io_file_read($folder . $targetExchange . '.json');
            return $result;
        }
        $files = io_dir_read($folder);
        for ($i = 0; $i < count($files); $i++) {
            $file = $files[$i];
            $exchangeName = str_replace('.json', '', $file);
            $content = io_file_read($folder . $file);
            $result[$exchangeName] = $content;
        }
        return $result;
    }

    public function removeHostnamefromUrl($url) {
        if ($url === null) {
            return null;
        }
        $urlParts = explode('/', $url);
        $res = '';
        for ($i = 0; $i < count($urlParts); $i++) {
            if ($i > 2) {
                $current = $urlParts[$i];
                if (mb_strpos($current, '?') > -1) {
                    // handle urls like this: /v1/account/accounts?AccessK
                    $currentParts = explode('?', $current);
                    $res .= '/';
                    $res .= $currentParts[0];
                    break;
                }
                $res .= '/';
                $res .= $current;
            }
        }
        return $res;
    }

    public function urlencodedToDict($url) {
        $result = array();
        $parts = explode('&', $url);
        for ($i = 0; $i < count($parts); $i++) {
            $part = $parts[$i];
            $keyValue = explode('=', $part);
            $keysLength = count($keyValue);
            if ($keysLength !== 2) {
                continue;
            }
            $key = $keyValue[0];
            $value = $keyValue[1];
            if (($value !== null) && ((str_starts_with($value, '[')) || (str_starts_with($value, '{')))) {
                // some exchanges might return something like this: timestamp=1699382693405&batchOrders=[{\"symbol\":\"LTCUSDT\",\"side\":\"BUY\",\"newClientOrderI
                $value = json_parse($value);
            }
            $result[$key] = $value;
        }
        return $result;
    }

    public function assertNewAndStoredOutput($exchange, $skipKeys, $newOutput, $storedOutput) {
        if ((is_array($storedOutput)) && (is_array($newOutput))) {
            $storedOutputKeys = is_array($storedOutput) ? array_keys($storedOutput) : array();
            $newOutputKeys = is_array($newOutput) ? array_keys($newOutput) : array();
            $storedKeysLength = count($storedOutputKeys);
            $newKeysLength = count($newOutputKeys);
            $this->assertStaticError($storedKeysLength === $newKeysLength, 'output length mismatch', $storedOutput, $newOutput);
            // iterate over the keys
            for ($i = 0; $i < count($storedOutputKeys); $i++) {
                $key = $storedOutputKeys[$i];
                if ($exchange->inArray($key, $skipKeys)) {
                    continue;
                }
                if (!($exchange->inArray($key, $newOutputKeys))) {
                    $this->assertStaticError(false, 'output key missing: ' . $key, $storedOutput, $newOutput);
                }
                $storedValue = $storedOutput[$key];
                $newValue = $newOutput[$key];
                $this->assertNewAndStoredOutput($exchange, $skipKeys, $newValue, $storedValue);
            }
        } elseif (gettype($storedOutput) === 'array' && array_keys($storedOutput) === array_keys(array_keys($storedOutput)) && (gettype($newOutput) === 'array' && array_keys($newOutput) === array_keys(array_keys($newOutput)))) {
            $storedArrayLength = count($storedOutput);
            $newArrayLength = count($newOutput);
            $this->assertStaticError($storedArrayLength === $newArrayLength, 'output length mismatch', $storedOutput, $newOutput);
            for ($i = 0; $i < count($storedOutput); $i++) {
                $storedItem = $storedOutput[$i];
                $newItem = $newOutput[$i];
                $this->assertNewAndStoredOutput($exchange, $skipKeys, $newItem, $storedItem);
            }
        } else {
            // built-in types like strings, numbers, booleans
            $messageError = 'output value mismatch:' . ((string) $newOutput) . ' != ' . ((string) $storedOutput);
            $this->assertStaticError($newOutput === $storedOutput, $messageError, $storedOutput, $newOutput);
        }
    }

    public function assertStaticOutput($exchange, $type, $skipKeys, $storedUrl, $requestUrl, $storedOutput, $newOutput) {
        if ($storedUrl !== $requestUrl) {
            // remove the host part from the url
            $firstPath = $this->removeHostnamefromUrl($storedUrl);
            $secondPath = $this->removeHostnamefromUrl($requestUrl);
            $this->assertStaticError($firstPath === $secondPath, 'url mismatch', $firstPath, $secondPath);
        }
        // body (aka storedOutput and newOutput) is not defined and information is in the url
        // example: "https://open-api.bingx.com/openApi/spot/v1/trade/order?quoteOrderQty=5&side=BUY&symbol=LTC-USDT&timestamp=1698777135343&type=MARKET&signature=d55a7e4f7f9dbe56c4004c9f3ab340869d3cb004e2f0b5b861e5fbd1762fd9a0
        if (($storedOutput === null) && ($newOutput === null)) {
            if (($storedUrl !== null) && ($requestUrl !== null)) {
                $storedUrlParts = explode('?', $storedUrl);
                $newUrlParts = explode('?', $requestUrl);
                $storedUrlQuery = $exchange->safeValue($storedUrlParts, 1);
                $newUrlQuery = $exchange->safeValue($newUrlParts, 1);
                if (($storedUrlQuery === null) && ($newUrlQuery === null)) {
                    // might be a get request without any query parameters
                    // example: https://api.gateio.ws/api/v4/delivery/usdt/positions
                    return;
                }
                $storedUrlParams = $this->urlencodedToDict($storedUrlQuery);
                $newUrlParams = $this->urlencodedToDict($newUrlQuery);
                $this->assertNewAndStoredOutput($exchange, $skipKeys, $newUrlParams, $storedUrlParams);
                return;
            }
        }
        if ($type === 'json') {
            if (is_string($storedOutput)) {
                $storedOutput = json_parse($storedOutput);
            }
            if (is_string($newOutput)) {
                $newOutput = json_parse($newOutput);
            }
        } elseif ($type === 'urlencoded') {
            $storedOutput = $this->urlencodedToDict($storedOutput);
            $newOutput = $this->urlencodedToDict($newOutput);
        }
        $this->assertNewAndStoredOutput($exchange, $skipKeys, $newOutput, $storedOutput);
    }

    public function sanitizeDataInput($input) {
        // remove nulls and replace with unefined instead
        if ($input === null) {
            return null;
        }
        $newInput = [];
        for ($i = 0; $i < count($input); $i++) {
            $current = $input[$i];
            if (is_null_value($current)) {
                $newInput[] = null;
            } else {
                $newInput[] = $current;
            }
        }
        return $newInput;
    }

    public function testMethodStatically($exchange, $method, $data, $type, $skipKeys) {
        return Async\async(function () use ($exchange, $method, $data, $type, $skipKeys) {
            $output = null;
            $requestUrl = null;
            try {
                Async\await(call_exchange_method_dynamically($exchange, $method, $this->sanitizeDataInput($data['input'])));
            } catch(Exception $e) {
                if (!(e instanceof NetworkError)) {
                    throw $e;
                }
                $output = $exchange->last_request_body;
                $requestUrl = $exchange->last_request_url;
            }
            try {
                $callOutput = $exchange->safeValue($data, 'output');
                $this->assertStaticOutput($exchange, $type, $skipKeys, $data['url'], $requestUrl, $callOutput, $output);
            } catch(Exception $e) {
                $this->staticTestsFailed = true;
                $errorMessage = '[' . $this->lang . '][STATIC_TEST_FAILURE]' . '[' . $exchange->id . ']' . '[' . $method . ']' . '[' . $data['description'] . ']' . ((string) $e);
                dump($errorMessage);
            }
        }) ();
    }

    public function initOfflineExchange($exchangeName) {
        $markets = $this->loadMarketsFromFile($exchangeName);
        return init_exchange($exchangeName, array(
            'markets' => $markets,
            'rateLimit' => 1,
            'httpsProxy' => 'http://fake:8080',
            'apiKey' => 'key',
            'secret' => 'secretsecret',
            'password' => 'password',
            'uid' => 'uid',
            'accounts' => [array(
    'id' => 'myAccount',
)],
            'options' => array(
                'enableUnifiedAccount' => true,
                'enableUnifiedMargin' => false,
                'accessToken' => 'token',
                'expires' => 999999999999999,
                'leverageBrackets' => array(),
            ),
        ));
    }

    public function testExchangeStatically($exchangeName, $exchangeData, $testName = null) {
        // instantiate the exchange and make sure that we sink the requests to avoid an actual request
        return Async\async(function () use ($exchangeName, $exchangeData, $testName) {
            $exchange = $this->initOfflineExchange($exchangeName);
            $methods = $exchange->safeValue($exchangeData, 'methods', array());
            $methodsNames = is_array($methods) ? array_keys($methods) : array();
            for ($i = 0; $i < count($methodsNames); $i++) {
                $method = $methodsNames[$i];
                $results = $methods[$method];
                for ($j = 0; $j < count($results); $j++) {
                    $result = $results[$j];
                    $description = $exchange->safeValue($result, 'description');
                    if (($testName !== null) && ($testName !== $description)) {
                        continue;
                    }
                    $type = $exchange->safeString($exchangeData, 'outputType');
                    $skipKeys = $exchange->safeValue($exchangeData, 'skipKeys', []);
                    Async\await($this->testMethodStatically($exchange, $method, $result, $type, $skipKeys));
                }
            }
            Async\await(close($exchange));
        }) ();
    }

    public function getNumberOfTestsFromExchange($exchange, $exchangeData) {
        $sum = 0;
        $methods = $exchangeData['methods'];
        $methodsNames = is_array($methods) ? array_keys($methods) : array();
        for ($i = 0; $i < count($methodsNames); $i++) {
            $method = $methodsNames[$i];
            $results = $methods[$method];
            $resultsLength = count($results);
            $sum = $exchange->sum($sum, $resultsLength);
        }
        return $sum;
    }

    public function runStaticTests($targetExchange = null, $testName = null) {
        return Async\async(function () use ($targetExchange, $testName) {
            $staticData = $this->loadStaticData($targetExchange);
            $exchanges = is_array($staticData) ? array_keys($staticData) : array();
            $exchange = init_exchange('Exchange', array()); // tmp to do the calculations until we have the ast-transpiler transpiling this code
            $promises = [];
            $sum = 0;
            if ($targetExchange) {
                dump('Exchange to test: ' . $targetExchange);
            }
            if ($testName) {
                dump('Testing only: ' . $testName);
            }
            for ($i = 0; $i < count($exchanges); $i++) {
                $exchangeName = $exchanges[$i];
                $exchangeData = $staticData[$exchangeName];
                $numberOfTests = $this->getNumberOfTestsFromExchange($exchange, $exchangeData);
                $sum = $exchange->sum($sum, $numberOfTests);
                $promises[] = $this->testExchangeStatically($exchangeName, $exchangeData, $testName);
            }
            Async\await(Promise\all($promises));
            if ($this->staticTestsFailed) {
                exit_script(1);
            } else {
                $successMessage = '[' . $this->lang . '][TEST_SUCCESS] ' . ((string) $sum) . ' static tests passed.';
                dump($successMessage);
                exit_script(0);
            }
        }) ();
    }

    public function runMockResponseTests() {
        //  -----------------------------------------------------------------------------
        //  --- Init of mockResponses tests functions------------------------------------
        //  -----------------------------------------------------------------------------
        return Async\async(function () {
            $exchange = $this->initOfflineExchange('binance');
            $data = [];
            function fetch_mock($url, $metod, $headers, $bodyText) {
                return Async\async(function () use ($url, $metod, $headers, $bodyText) {
                    return $data;

                }) ();
            }
            $exchange->fetch = $fetch_mock;
        }) ();
    }

    public function runBrokerIdTests() {
        //  -----------------------------------------------------------------------------
        //  --- Init of brokerId tests functions-----------------------------------------
        //  -----------------------------------------------------------------------------
        return Async\async(function () {
            $promises = [$this->testBinance(), $this->testOkx(), $this->testCryptocom(), $this->testBybit(), $this->testKucoin(), $this->testKucoinfutures(), $this->testBitget(), $this->testMexc(), $this->testHuobi(), $this->testWoo(), $this->testBitmart()];
            Async\await(Promise\all($promises));
            $successMessage = '[' . $this->lang . '][TEST_SUCCESS] brokerId tests passed.';
            dump($successMessage);
            exit_script(0);
        }) ();
    }

    public function testBinance() {
        return Async\async(function () {
            $binance = $this->initOfflineExchange('binance');
            $spotId = 'x-R4BD3S82';
            $spotOrderRequest = null;
            try {
                Async\await($binance->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $spotOrderRequest = $this->urlencodedToDict($binance->last_request_body);
            }
            $clientOrderId = $spotOrderRequest['newClientOrderId'];
            assert(str_starts_with($clientOrderId, $spotId), 'spot clientOrderId does not start with spotId');
            $swapId = 'x-xcKtGhcu';
            $swapOrderRequest = null;
            try {
                Async\await($binance->createOrder('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $swapOrderRequest = $this->urlencodedToDict($binance->last_request_body);
            }
            $swapInverseOrderRequest = null;
            try {
                Async\await($binance->createOrder('BTC/USD:BTC', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $swapInverseOrderRequest = $this->urlencodedToDict($binance->last_request_body);
            }
            $clientOrderIdSpot = $swapOrderRequest['newClientOrderId'];
            assert(str_starts_with($clientOrderIdSpot, $swapId), 'swap clientOrderId does not start with swapId');
            $clientOrderIdInverse = $swapInverseOrderRequest['newClientOrderId'];
            assert(str_starts_with($clientOrderIdInverse, $swapId), 'swap clientOrderIdInverse does not start with swapId');
            Async\await(close($binance));
        }) ();
    }

    public function testOkx() {
        return Async\async(function () {
            $okx = $this->initOfflineExchange('okx');
            $id = 'e847386590ce4dBC';
            $spotOrderRequest = null;
            try {
                Async\await($okx->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $spotOrderRequest = json_parse($okx->last_request_body);
            }
            $clientOrderId = $spotOrderRequest[0]['clOrdId']; // returns order inside array
            assert(str_starts_with($clientOrderId, $id), 'spot clientOrderId does not start with id');
            assert($spotOrderRequest[0]['tag'] === $id, 'id different from spot tag');
            $swapOrderRequest = null;
            try {
                Async\await($okx->createOrder('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $swapOrderRequest = json_parse($okx->last_request_body);
            }
            $clientOrderIdSpot = $swapOrderRequest[0]['clOrdId'];
            assert(str_starts_with($clientOrderIdSpot, $id), 'swap clientOrderId does not start with id');
            assert($swapOrderRequest[0]['tag'] === $id, 'id different from swap tag');
            Async\await(close($okx));
        }) ();
    }

    public function testCryptocom() {
        return Async\async(function () {
            $cryptocom = $this->initOfflineExchange('cryptocom');
            $id = 'CCXT';
            Async\await($cryptocom->loadMarkets());
            $request = null;
            try {
                Async\await($cryptocom->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $request = json_parse($cryptocom->last_request_body);
            }
            assert($request['params']['broker_id'] === $id, 'id different from  broker_id');
            Async\await(close($cryptocom));
        }) ();
    }

    public function testBybit() {
        return Async\async(function () {
            $bybit = $this->initOfflineExchange('bybit');
            $reqHeaders = null;
            $id = 'CCXT';
            assert($bybit->options['brokerId'] === $id, 'id not in options');
            try {
                Async\await($bybit->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                // we expect an error here, we're only interested in the headers
                $reqHeaders = $bybit->last_request_headers;
            }
            assert($reqHeaders['Referer'] === $id, 'id not in headers');
            Async\await(close($bybit));
        }) ();
    }

    public function testKucoin() {
        return Async\async(function () {
            $kucoin = $this->initOfflineExchange('kucoin');
            $reqHeaders = null;
            assert($kucoin->options['partner']['spot']['id'] === 'ccxt', 'id not in options');
            assert($kucoin->options['partner']['spot']['key'] === '9e58cc35-5b5e-4133-92ec-166e3f077cb8', 'key not in options');
            try {
                Async\await($kucoin->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                // we expect an error here, we're only interested in the headers
                $reqHeaders = $kucoin->last_request_headers;
            }
            $id = 'ccxt';
            assert($reqHeaders['KC-API-PARTNER'] === $id, 'id not in headers');
            Async\await(close($kucoin));
        }) ();
    }

    public function testKucoinfutures() {
        return Async\async(function () {
            $kucoin = $this->initOfflineExchange('kucoinfutures');
            $reqHeaders = null;
            $id = 'ccxtfutures';
            assert($kucoin->options['partner']['future']['id'] === $id, 'id not in options');
            assert($kucoin->options['partner']['future']['key'] === '1b327198-f30c-4f14-a0ac-918871282f15', 'key not in options');
            try {
                Async\await($kucoin->createOrder('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $reqHeaders = $kucoin->last_request_headers;
            }
            assert($reqHeaders['KC-API-PARTNER'] === $id, 'id not in headers');
            Async\await(close($kucoin));
        }) ();
    }

    public function testBitget() {
        return Async\async(function () {
            $bitget = $this->initOfflineExchange('bitget');
            $reqHeaders = null;
            $id = 'p4sve';
            assert($bitget->options['broker'] === $id, 'id not in options');
            try {
                Async\await($bitget->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $reqHeaders = $bitget->last_request_headers;
            }
            assert($reqHeaders['X-CHANNEL-API-CODE'] === $id, 'id not in headers');
            Async\await(close($bitget));
        }) ();
    }

    public function testMexc() {
        return Async\async(function () {
            $mexc = $this->initOfflineExchange('mexc');
            $reqHeaders = null;
            $id = 'CCXT';
            assert($mexc->options['broker'] === $id, 'id not in options');
            Async\await($mexc->loadMarkets());
            try {
                Async\await($mexc->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $reqHeaders = $mexc->last_request_headers;
            }
            assert($reqHeaders['source'] === $id, 'id not in headers');
            Async\await(close($mexc));
        }) ();
    }

    public function testHuobi() {
        return Async\async(function () {
            $huobi = $this->initOfflineExchange('huobi');
            // spot test
            $id = 'AA03022abc';
            $spotOrderRequest = null;
            try {
                Async\await($huobi->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $spotOrderRequest = json_parse($huobi->last_request_body);
            }
            $clientOrderId = $spotOrderRequest['client-order-id'];
            assert(str_starts_with($clientOrderId, $id), 'spot clientOrderId does not start with id');
            // swap test
            $swapOrderRequest = null;
            try {
                Async\await($huobi->createOrder('BTC/USDT:USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $swapOrderRequest = json_parse($huobi->last_request_body);
            }
            $swapInverseOrderRequest = null;
            try {
                Async\await($huobi->createOrder('BTC/USD:BTC', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $swapInverseOrderRequest = json_parse($huobi->last_request_body);
            }
            $clientOrderIdSpot = $swapOrderRequest['channel_code'];
            assert(str_starts_with($clientOrderIdSpot, $id), 'swap channel_code does not start with id');
            $clientOrderIdInverse = $swapInverseOrderRequest['channel_code'];
            assert(str_starts_with($clientOrderIdInverse, $id), 'swap inverse channel_code does not start with id');
            Async\await(close($huobi));
        }) ();
    }

    public function testWoo() {
        return Async\async(function () {
            $woo = $this->initOfflineExchange('woo');
            // spot test
            $id = 'bc830de7-50f3-460b-9ee0-f430f83f9dad';
            $spotOrderRequest = null;
            try {
                Async\await($woo->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $spotOrderRequest = $this->urlencodedToDict($woo->last_request_body);
            }
            $brokerId = $spotOrderRequest['broker_id'];
            assert(str_starts_with($brokerId, $id), 'broker_id does not start with id');
            // swap test
            $stopOrderRequest = null;
            try {
                Async\await($woo->createOrder('BTC/USDT:USDT', 'limit', 'buy', 1, 20000, array(
                    'stopPrice' => 30000,
                )));
            } catch(Exception $e) {
                $stopOrderRequest = json_parse($woo->last_request_body);
            }
            $clientOrderIdSpot = $stopOrderRequest['brokerId'];
            assert(str_starts_with($clientOrderIdSpot, $id), 'brokerId does not start with id');
            Async\await(close($woo));
        }) ();
    }

    public function testBitmart() {
        return Async\async(function () {
            $bitmart = $this->initOfflineExchange('bitmart');
            $reqHeaders = null;
            $id = 'CCXTxBitmart000';
            assert($bitmart->options['brokerId'] === $id, 'id not in options');
            Async\await($bitmart->loadMarkets());
            try {
                Async\await($bitmart->createOrder('BTC/USDT', 'limit', 'buy', 1, 20000));
            } catch(Exception $e) {
                $reqHeaders = $bitmart->last_request_headers;
            }
            assert($reqHeaders['X-BM-BROKER-ID'] === $id, 'id not in headers');
            Async\await(close($bitmart));
        }) ();
    }
}

// ***** AUTO-TRANSPILER-END *****
// *******************************
$promise = (new testMainClass())->init($exchangeId, $exchangeSymbol);
Async\await($promise);