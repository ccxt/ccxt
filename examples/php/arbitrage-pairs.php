<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';
include 'Console/Table.php'; // pear-install it from here: https://pear.php.net/package/Console_Table/

date_default_timezone_set('UTC');

function style ($s, $style) { return $style . $s . "\033[0m"; }
function green     ($s) { return style ($s, "\033[92m"); }
function blue      ($s) { return style ($s, "\033[94m"); }
function yellow    ($s) { return style ($s, "\033[93m"); }
function red       ($s) { return style ($s, "\033[91m"); }
function pink      ($s) { return style ($s, "\033[95m"); }
function bold      ($s) { return style ($s, "\033[1m"); }
function underline ($s) { return style ($s, "\033[4m"); }
function dump ($s) { echo implode (' ', func_get_args ()) . "\n"; }

function print_supported_exchanges () {
    $exchanges = \ccxt\Exchange::$exchanges;
    dump ('Supported exchanges:', green (implode (', ', $exchanges)));
}

function flatten ($array) {
    return array_reduce ($array, function ($acc, $item) {
        return array_merge ($acc, is_array ($item) ? flatten ($item) : [$item]);
    }, []);
}

function tabulate ($headers, $rows) {
    $tbl = new Console_Table();
    $tbl->setHeaders ($headers);
    $tbl->addData ($rows);
    return $tbl->getTable ();
}

function pairs_table_helper ($pair) {
    return array_values ($pair);
}

$proxies = array (
    '', // no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
);

$max_retries = count ($proxies);
$ids = array_slice ($argv, 1);
$exchanges = array ();
$min_exchanges = 2; // a pair should be present on at least two exchanges or more

if ($ids) {

    // load all markets from all exchanges
    foreach ($ids as $id) {

        // instantiate the exchange by id
        $exchange = '\\ccxt\\' . $id;
        $exchange = new $exchange ();

        // save it in an assoc array for later use
        $exchanges[$id] = $exchange;

        $current_proxy = 0;

        for ($num_retries = 0; $num_retries < $max_retries; $num_retries++) {

            try {

                $exchange->proxy = $proxies[$current_proxy];
                $current_proxy = (++$current_proxy) % count ($proxies);

                // load all markets from the exchange
                $markets = $exchange->load_markets ();

                // output a list of all market symbols
                dump (green ($id), 'has', yellow (count ($exchange->symbols)), 'symbols');

                break;

            } catch (\ccxt\RequestTimeout $e) {
                print_r ($e);
            } catch (\ccxt\DDoSProtection $e) {
                print_r ($e);
            } catch (\ccxt\AuthenticationError $e) {
                print_r ($e);
            } catch (\ccxt\ExchangeNotAvailable $e) {
                print_r ($e);
            } catch (\ccxt\NotSupported $e) {
                print_r ($e);
            } catch (\ccxt\NetworkError $e) {
                print_r ($e);
            } catch (\ccxt\ExchangeError $e) {
                print_r ($e);
            } catch (Exception $e) {
                print_r ($e);
            }

        }
    }

    dump (green ('Loaded all markets'));

    $all_symbols = flatten (array_values (array_map (function ($exchange) {
        return $exchange->symbols;
    }, $exchanges)));

    $unique_symbols = array_unique ($all_symbols);

    // filter unique symbols leaving those present on at least 2 exchanges or more
    $arbitrable_symbols = array_filter ($unique_symbols, function ($symbol) use (&$exchanges, $min_exchanges) {

        $num_related_exchanges = count (array_filter ($exchanges, function ($exchange) use (&$symbol, $min_exchanges) {
            return in_array ($symbol, $exchange->symbols);
        }));

        return ($num_related_exchanges >= $min_exchanges);
    });

    sort ($arbitrable_symbols);

    $pairs = array_map (function ($symbol) use (&$exchanges) {
        $result = array ('symbol' => $symbol);
        foreach ($exchanges as $exchange) {
            $result[$exchange->id] = in_array ($symbol, $exchange->symbols) ? $exchange->id : '';
        }
        return $result;
    }, $arbitrable_symbols);

    // output a table of all markets
    @dump (tabulate (array_keys ($pairs[0]), array_map ('pairs_table_helper', $pairs)));

} else {

    dump ('Usage: php -f', __FILE__,  green ('id'));
    print_supported_exchanges ();

}

?>