<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

if (count ($argv) > 2) {

    $id = $argv[1];
    $member = $argv[2];
    $args = array_slice ($argv, 3);
    $verbose = count (array_filter ($args, function ($option) { return strstr ($option, '--verbose') !== false; })) > 0;
    $args = array_filter ($args, function ($option) { return strstr ($option, '--verbose') === false; });
    $args = array_map (function ($arg) {
        return ($arg[0] === '{' || $arg[0] === '[') ? json_decode ($arg) :
            (preg_match ('/[a-zA-Z]/', $arg) ? $arg : floatval ($arg));
    }, $args);

    $exchange_found = in_array ($id, \ccxt\Exchange::$exchanges);

    if ($exchange_found) {

        $keys_global = './keys.json';
        $keys_local = './keys.local.json';
        $keys_file = file_exists ($keys_local) ? $keys_local : $keys_global;

        $config = json_decode (file_get_contents ($keys_file), true);

        echo print_r ($keys_file, true) . "\n";
        // echo print_r ($config[$id]) . "\n";

        $config = array_merge ($config[$id], array (
            'verbose' => $verbose, // set to true for debugging
        ));

        // instantiate the exchange by id
        $exchange = '\\ccxt\\' . $id;
        $exchange = new $exchange ($config);

        $exchange->load_markets ();

        if (method_exists ($exchange, $member)) {

            try {

                echo $exchange->id . '->' . $member . ' (' . implode (', ', $args) . ")\n";

                $result = call_user_func_array (array ($exchange, $member), $args);

                print_r ($result);

            } catch (\ccxt\NetworkError $e) {

                echo get_class ($e) . ': ' . $e->getMessage () . "\n";

            } catch (\ccxt\ExchangeError $e) {

                echo $e->class . "-\n";

                echo get_class ($e) . ': ' . $e->getMessage () . "\n";
            }

        } else if (property_exists ($exchange, $member)) {

            echo print_r ($exchange->$member, true) . "\n";

        } else {

            echo $exchange->id . '->' . $member . ": no such property\n";
        }

    } else {

        echo 'Exchange ' . $id . " not found\n";
    }

} else {

    print_r ('Usage: php -f ' . __FILE__ . " exchange_id member [args...]\n");

}

?>