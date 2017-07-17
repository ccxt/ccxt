<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include 'Console/Table.php';

date_default_timezone_set ('UTC');

function style ($s, $style) { return $style . $s . "\033[0m"; }
function green     ($s) { return style ($s, "\033[92m"); }
function blue      ($s) { return style ($s, "\033[94m"); }
function yellow    ($s) { return style ($s, "\033[93m"); }
function red       ($s) { return style ($s, "\033[91m"); }
function pink      ($s) { return style ($s, "\033[95m"); }
function bold      ($s) { return style ($s, "\033[1m"); }
function underline ($s) { return style ($s, "\033[4m"); }
function dump ($s) { echo implode (' ', func_get_args ()) . "\n"; }

$markets = \ccxt\Market::$markets;

function print_supported_markets () {
    $markets = \ccxt\Market::$markets;
    dump ('Supported markets:', green (implode (', ', $markets)));
}

function tabulate ($headers, $rows) {
    $tbl = new Console_Table();
    $tbl->setHeaders ($headers);
    $tbl->addData ($rows);
    return $tbl->getTable ();
}

function product_table_helper ($product) {
    return array (
        $product['id'],
        $product['symbol'],
        $product['id'],
        $product['id'],
    );
}

if (count ($argv) > 1) {

    $id = $argv[1];

    $market_found = in_array ($id, $markets);

    if ($market_found) {

        dump ('Instantiating', green ($id), 'exchange market');
        
        // instantiate the exchange by id
        $market = '\\ccxt\\' . $id;
        $market = new $market ();
        
        // load all products from the exchange
        $products = $market->load_products ();
        
        // output a list of all product symbols
        dump (green ($id), 'has', count ($market->symbols), 'symbols:', yellow (implode (', ', $market->symbols)));

        // output a table of all products
        dump (tabulate (array ('id', 'symbol', 'base', 'quote', 'info'), array_map ('product_table_helper', $products)));

    } else {

        dump ('Market', red ($id), 'not found');
        print_supported_markets ();
    }

} else {
    
    dump ('Usage: php -f', __FILE__,  green ('id'));
    print_supported_markets ();

}

?>