<?php

namespace ccxt\pro;

function equals($a, $b) {
    return json_encode($a) === json_encode($b);
}


namespace ccxt;

function equals($a, $b) {
    return json_encode($a) === json_encode($b);
}

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

// ############## detect cli arguments ############## //
array_shift($argv); // remove first argument (which is script path)

function filter_argvs($argsArray, $needle, $include = true) {
    return array_values(array_filter($argsArray, function ($x) use ($needle, $include) { return ($include && str_contains($x, $needle) || (!$include && !str_contains($x, $needle))); }));
};

function select_argv ($argsArray, $needle) {
    $foundArray = array_values(array_filter($argsArray, function ($x) use ($needle) { return str_contains($x, $needle); }));
    return count($foundArray) > 0 ? $foundArray[0] : null;
}

$argvs_filtered = filter_argvs ($argv, '--', false);
$argvExchange = $argvs_filtered[0] ?? null;
$argvSymbol   = select_argv ($argv, '/');
$argvMethod   = select_argv ($argv, '()');
// #################################################### //



// non-transpiled part, but shared names among langs
function get_cli_arg_value ($arg) {
    return in_array($arg, $GLOBALS['argv']);
}

define('is_synchronous', get_cli_arg_value('--sync'));
define('rootDirForSkips', __DIR__ . '/../../');
define('envVars', $_ENV);
define('LOG_CHARS_LENGTH', 1000000); // no need to trim
define('ext', 'php');
define('proxyTestFileName', 'proxies');

class baseMainTestClass {
    public $lang = 'PHP';
    public $is_synchronous = is_synchronous;
    public $test_files = [];
    public $skipped_settings_for_exchange = [];
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

function call_method_sync($testFiles, $methodName, $exchange, $skippedProperties, $args) {
    $methodNameWithNameSpace = '\\ccxt\\' . $testFiles[$methodName];
    return call_user_func($methodNameWithNameSpace, $exchange, $skippedProperties, ... $args);
}

function call_method($testFiles, $methodName, $exchange, $skippedProperties, $args) {
    return call_method_sync($testFiles, $methodName, $exchange, $skippedProperties, $args);
}

function call_overriden_method($exchange, $methodName, $args) {
    // $overridenMethod = $exchange->{$methodName};
    // return $overridenMethod(... $args);
    return $exchange->call_method($methodName, ... $args);
}

function call_exchange_method_dynamically($exchange, $methodName, $args) {
    return $exchange->{$methodName}(... $args);
}

function call_exchange_method_dynamically_sync($exchange, $methodName, $args) {
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

// stub for c#
function get_root_exception($exc) {
    return $exc;
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

function get_test_files_sync ($properties, $ws = false) {
    $func = function() use ($properties, $ws){
        $tests = array();
        $finalPropList = array_merge ($properties, [proxyTestFileName]);
        for ($i = 0; $i < count($finalPropList); $i++) {
            $methodName = $finalPropList[$i];
            $name_snake_case = convert_to_snake_case($methodName);
            $dir_to_test = $ws ? dirname(__DIR__) . '/pro/test/Exchange/' : __DIR__ . '/exchange/' . (is_synchronous ? 'sync' : 'async') .'/';
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

function get_test_files ($properties, $ws = false) {
    return get_test_files_sync($properties, $ws);
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
