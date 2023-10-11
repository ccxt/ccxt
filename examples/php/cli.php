<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');


$ccxtroot = dirname(dirname(dirname(__FILE__)));	//when this is in $ccxtroot/examples/php/cli.php
$root = dirname($ccxtroot);
if(basename($root) == 'ccxt'){$root = dirname($root);}
if(basename($root) == 'vendor'){$autoloadFile = $root.DIRECTORY_SEPARATOR.'autoload.php';}
else{$autoloadFile = $root. DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';}
if (file_exists($autoloadFile)) {
    require_once $autoloadFile;
}
include $ccxtroot . '/ccxt.php';


use React\Async;

//date_default_timezone_set('UTC');

echo 'PHP v' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION . "\n";
echo 'CCXT version :' . \ccxt\async\Exchange::VERSION . "\n";


$main = function() use ($argv) {
    if (count($argv) > 2) {
        # first we filter the args
        $verbose = count(array_filter($argv, function ($option) { return strstr($option, '--verbose') !== false; })) > 0;
        $args = array_values(array_filter($argv, function ($option) { return strstr($option, '--verbose') === false; }));

        $test = count(array_filter($args, function ($option) { return strstr($option, '--test') !== false || strstr($option, '--testnet') !== false || strstr($option, '--sandbox') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--test') === false && strstr($option, '--testnet') === false && strstr($option, '--sandbox') === false; }));

        $debug = count(array_filter($args, function ($option) { return strstr($option, '--debug') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--debug') === false; }));

        $spot = count(array_filter($args, function ($option) { return strstr($option, '--spot') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--spot') === false; }));

        $swap = count(array_filter($args, function ($option) { return strstr($option, '--swap') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--swap') === false; }));

        $future = count(array_filter($args, function ($option) { return strstr($option, '--future') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--future') === false; }));

        $option = count(array_filter($args, function ($option) { return strstr($option, '--option') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--option') === false; }));

        $new_updates = count(array_filter($args, function ($option) { return strstr($option, '--newUpdates') !== false; })) > 0;
        $args = array_values(array_filter($args, function ($option) { return strstr($option, '--newUpdates') === false; }));

        $ccxtroot = dirname(dirname(dirname(__FILE__)));	//when this is in $ccxtroot/examples/php/cli.php
        $id = $args[1];
        $member = $args[2];
        $args = array_slice($args, 3);
        $exchange_found = in_array($id, \ccxt\async\Exchange::$exchanges);

        if ($exchange_found) {

            $keys_global = $ccxtroot.'/keys.json';
            $keys_local = $ccxtroot.'/keys.local.json';
            $keys_file = file_exists($keys_local) ? $keys_local : $keys_global;

            $config = json_decode(file_get_contents($keys_file), true);
            $settings = array_key_exists($id, $config) ? $config[$id] : array();
            $config = array_merge($settings, array(
                'verbose' => $verbose && $debug, // set to true for debugging
            ));

            // instantiate the exchange by id
            $exchange = null;
            if (in_array($id, \ccxt\pro\Exchange::$exchanges)) {
                $exchange = '\\ccxt\\pro\\' . $id;
            } else {
                $exchange = '\\ccxt\\async\\' . $id;
            }
            $exchange = new $exchange($config);

            if ($spot) {
                $exchange->options['defaultType'] = 'spot';
            } else if ($swap) {
                $exchange->options['defaultType'] = 'swap';
            } else if ($future) {
                $exchange->options['defaultType'] = 'future';
            } else if ($option) {
                $exchange->options['defaultType'] = 'option';
            }

            if ($new_updates) {
                $exchange->newUpdates = true;
            }

            if ($test) {
                $exchange->set_sandbox_mode(true);
            }

            // check auth keys in env var
            foreach ($exchange->requiredCredentials as $credential => $is_required) {
                if ($is_required && !$exchange->$credential ) {
                    $credential_var = strtoupper($id . '_' . $credential); // example: KRAKEN_SECRET
                    $credential_value = getenv($credential_var);
                    if ($credential_value) {
                        $exchange->$credential = $credential_value;
                    }
                }
            }

            $args = array_map(function ($arg) {
                global $exchange;
                if ($arg[0] === '{' || $arg[0] === '[')
                    return json_decode($arg, true);
                if ($arg === 'NULL' || $arg === 'null')
                    return null;
                if (preg_match('/^[+-]?[0-9]+$/', $arg))
                    return intval ($arg);
                if (preg_match('/^[.eE0-9+-]+$/', $arg))
                    return floatval ($arg);
                if (preg_match('/^[0-9]{4}[-]?[0-9]{2}[-]?[0-9]{2}[T\s]?[0-9]{2}[:]?[0-9]{2}[:]?[0-9]{2}/', $arg))
                    return $exchange->parse8601($arg);
                else
                    return $arg;
            }, $args);

            $markets_path = $ccxtroot.'.cache/' . $exchange->id . '-markets.json';
            if (file_exists($markets_path)) {
                $markets = json_decode(file_get_contents($markets_path), true);
                $exchange->markets = $markets;
            } else {
                // yield $exchange->load_markets();
            }

            $exchange->verbose = $verbose;

            echo $exchange->id . '->' . $member . '(' . @implode(', ', $args) . ")\n";

            $is_ws_method = false;

            if (mb_strpos($member, 'watch') !== false) {
                $is_ws_method = true;
            }

            if (property_exists($exchange, $member))
			{
				echo print_r($exchange->$member, true) . "\n";
				exit(0);
			}
            while (true) {

                try {

                    $result = yield call_user_func_array(array($exchange, $member), $args);

                    echo print_r($result, true) . "\n";

                    if (!$is_ws_method) {
                        # make sure to exit with exit code zero here
                        exit(0);
                    }

                } catch (\ccxt\NetworkError $e) {

                    echo get_class($e) . ': ' . $e->getMessage() . "\n";
                    exit(1);

                } catch (\ccxt\ExchangeError $e) {

                    echo get_class($e) . ': ' . $e->getMessage() . "\n";
                    exit(1);

                } catch (Exception $e) {

                    echo get_class($e) . ': ' . $e->getMessage() . "\n";

                    if (property_exists($exchange, $member)) {

                        echo print_r($exchange->$member, true) . "\n";

                    } else {

                        echo $exchange->id . '->' . $member . ": no such property\n";
                    }
                    exit(1);
                }
            }
        } else {

            echo 'Exchange ' . $id . " not found\n";
            exit(1);
        }

    } else {
		echo "This is an example of a basic command-line interface to all exchanges\n";
        echo 'Usage: php -f ' . __FILE__ . " exchange_id method [args...]\n";
        echo "Examples:\n";
        echo 'php -f ' . __FILE__ ." bybit has\n";
        echo 'php -f ' . __FILE__ .' okcoin fetchOHLCV BTC/USD 15m'."\n";
        echo 'php -f ' . __FILE__ ." bitfinex fetchBalance\n";
        echo 'php -f ' . __FILE__ .' kraken fetchOrderBook ETH/BTC'."\n";
        echo "Supported exchanges:\n\e[0;32m".implode(', ', \ccxt\Exchange::$exchanges)."\e[0m\n";
        echo "Supported options:\n";
        echo "--verbose         Print verbose output\n";
        echo "--debug           Print debugging output\n";
        echo "--spot            Set defaultType\n";
        echo "--swap            Set defaultType\n";
        echo "--future          Set defaultType\n";
        echo "--option          Set defaultType\n";
        echo "--newUpdates      Set newUpdates flag. See \e[4;34m".'https://docs.ccxt.com/#/ccxt.pro.manual?id=newupdates-mode'."\e[0m\n";
        echo "--sandbox         Use the exchange sandbox if available, same as --testnet\n";
        echo "--testnet         Use the exchange testnet if available, same as --sandbox\n";
        echo "--test            Use the exchange testnet if available, same as --sandbox\n";
        exit(1);
    }
};

function teste() {
    yield 0;
}

$promise = Async\coroutine($main);
Async\await($promise);

?>
