<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

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

$exchanges = \ccxt\Exchange::$exchanges;

function print_supported_exchanges () {
    $exchanges = \ccxt\Exchange::$exchanges;
    dump ('Supported exchanges:', green (implode (', ', $exchanges)));
}

// renders a plain ASCII table: +---+ rules, left-aligned padded cells
function tabulate ($headers, $rows) {
    $widths = array ();
    foreach ($headers as $i => $header) {
        $widths[$i] = strlen ((string) $header);
    }
    foreach ($rows as $row) {
        foreach (array_values ($row) as $i => $cell) {
            $length = strlen ((string) $cell);
            if (!isset ($widths[$i]) || ($length > $widths[$i])) {
                $widths[$i] = $length;
            }
        }
    }
    $rule = '+';
    foreach ($widths as $width) {
        $rule .= str_repeat ('-', $width + 2) . '+';
    }
    $format_row = function ($cells) use ($widths) {
        $line = '|';
        foreach ($widths as $i => $width) {
            $cell = isset ($cells[$i]) ? (string) $cells[$i] : '';
            $line .= ' ' . str_pad ($cell, $width) . ' |';
        }
        return $line;
    };
    $table = $rule . "\n" . $format_row (array_values ($headers)) . "\n" . $rule . "\n";
    foreach ($rows as $row) {
        $table .= $format_row (array_values ($row)) . "\n";
    }
    return $table . $rule . "\n";
}

function market_table_helper ($market) {
    return array (
        $market['id'],
        $market['symbol'],
        $market['base'],
        $market['quote'],
        $market['taker'],
        $market['maker'],
        json_encode ($market['precision']),
        json_encode ($market['limits']),

    );
}

if (count ($argv) > 1) {

    $id = $argv[1];

    $exchange_found = in_array ($id, $exchanges);

    if ($exchange_found) {

        dump ('Instantiating', green ($id), 'exchange');

        // instantiate the exchange by id
        $exchange = '\\ccxt\\' . $id;
        $exchange = new $exchange ();

        // load all markets from the exchange
        $markets = $exchange->load_markets ();

        // output a list of all market symbols
        dump (green ($id), 'has', count ($exchange->symbols), 'symbols:', yellow (implode (', ', $exchange->symbols)));

        // output a table of all markets
        @dump (tabulate(array('id', 'symbol', 'base', 'quote', 'taker', 'maker', 'precision', 'limits'), array_map ('market_table_helper', $markets)));

    } else {

        dump ('Exchange', red ($id), 'not found');
        print_supported_exchanges ();
    }

} else {

    dump ('Usage: php -f', __FILE__,  green ('id'));
    print_supported_exchanges ();

}

?>