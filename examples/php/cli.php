<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

if (count ($argv) > 2) {

    $id = $argv[1];
    $member = $argv[2];
    $args = array_slice ($argv, 3);

    $exchange_found = in_array ($id, \ccxt\Exchange::$exchanges);

    if ($exchange_found) {

        $keys_global = './keys.json';
        $keys_local = './keys.local.json';
        $keys_file = file_exists ($keys_local) ? $keys_local : $keys_global;

        $config = json_decode (file_get_contents ($keys_file), true);

        print_r ($keys_file);
        print_r ($config[$id]);

        $config = array_merge ($config[$id], array (
            'verbose' => false, // set to true for debugging
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

                echo 'Network Error: ' . $e->getMessage () . "\n";

            } catch (\ccxt\ExchangeError $e) {

                echo 'Exchange Error: ' . $e->getMessage () . "\n";
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