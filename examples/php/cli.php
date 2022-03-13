<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

echo 'PHP v' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION . "\n";
echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";

if (count($argv) > 2) {

    # first we filter the args
    $verbose = count(array_filter($argv, function ($option) { return strstr($option, '--verbose') !== false; })) > 0;
    $args = array_values(array_filter($argv, function ($option) { return strstr($option, '--verbose') === false; }));

    $test = count(array_filter($args, function ($option) { return strstr($option, '--test') !== false || strstr($option, '--testnet') !== false || strstr($option, '--sandbox') !== false; })) > 0;
    $args = array_values(array_filter($args, function ($option) { return strstr($option, '--test') === false || strstr($option, '--testnet') !== false || strstr($option, '--sandbox') !== false; }));

    $debug = count(array_filter($args, function ($option) { return strstr($option, '--debug') !== false; })) > 0;
    $args = array_values(array_filter($args, function ($option) { return strstr($option, '--debug') === false; }));

    $id = $args[1];
    $member = $args[2];
    $args = array_slice($args, 3);
    $exchange_found = in_array($id, \ccxt\Exchange::$exchanges);

    if ($exchange_found) {

        $keys_global = './keys.json';
        $keys_local = './keys.local.json';
        $keys_file = file_exists($keys_local) ? $keys_local : $keys_global;

        $config = json_decode(file_get_contents($keys_file), true);
        $settings = array_key_exists($id, $config) ? $config[$id] : array();
        $config = array_merge($settings, array(
            'verbose' => $verbose && $debug, // set to true for debugging
        ));

        // instantiate the exchange by id
        $exchange = '\\ccxt\\' . $id;
        $exchange = new $exchange($config);

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

        $markets_path = '.cache/' . $exchange->id . '-markets.json';
        if (file_exists($markets_path)) {
            $markets = json_decode(file_get_contents($markets_path), true);
            $exchange->markets = $markets;
        } else {
            $exchange->load_markets();
        }

        $exchange->verbose = $verbose;

        // if (method_exists($exchange, $member)) {

            try {

                echo $exchange->id . '->' . $member . '(' . @implode(', ', $args) . ")\n";

                $result = call_user_func_array(array($exchange, $member), $args);

                echo print_r($result, true) . "\n";

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
        // }

    } else {

        echo 'Exchange ' . $id . " not found\n";
        exit(1);
    }

} else {

    print_r('Usage: php -f ' . __FILE__ . " exchange_id member [args...]\n");
    exit(1);

}

?>
