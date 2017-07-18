<?php

date_default_timezone_set ('UTC');

include 'ccxt.php';
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

$markets = null;

if (file_exists ('config.php'))
    include 'config.php';
else
    $markets = array ();

//-----------------------------------------------------------------------------

foreach (\ccxt\Market::$markets as $id) {
    $market = '\\ccxt\\' . $id;
    $markets[$id] = new $market (array (
        'verbose' => false,
        // 'proxy' => 'https://crossorigin.me/',
        // 'proxy' => 'https://cors-anywhere.herokuapp.com/',
        // 'proxy' => 'http://cors-proxy.htmldriven.com/?url=',
    ));
}

$config = {
    '_1broker':    { 'apiKey': 'A0f79063a5e91e6d62fbcbbbbdd63258' },
    '_1btcxe':     { 'apiKey': '7SuUd4B6zfGAojPn', 'secret': '392WCRKmGpcXdiVzsyQqwengLTOHkhDa' },
    'bit2c':       { 'apiKey': '5296814c-b1dc-4201-a62a-9b2364e890da', 'secret': '8DC1100F7CAB0AE6FE72451C442BE7B111404CBD569CE6162F8F2122CAEB211C' },
    'bitbay':      { 'apiKey': '3faec3e5458d24809a68fbaf0e97245b', 'secret': '2ffb20992e10dd54fd4fd4133cc09b00' },
    'bitcoincoid': { 'apiKey': 'KFB2MWYU-HTOUVOSO-UZYRPLUY-LIYMVPRU-UTOMHXYD', 'secret': '5ecb9464b3fad228110f33c6fbb32990b755351216e63089fdaf8f2735b4577bd9c335236f1a71e3' },
    'bitfinex':    { 'apiKey': '3oMHSKu37ZoJliKwcN35JHfXUBHxWvVqQmRfaFhbBTF', 'secret': 'm9Cf9krGuRolalRxsIBO53GNLmr6GXYIASwoGJiZxhS' },
    'bitlish':     { 'apiKey': 'fixed:N5lK4iokAc9ajk0Z8pvHfpoJsyzNzQ2nespNH/mY7is', 'login': 'igor.kroitor@gmail.com', 'password': 'VfvfVskfHfve229!' },
    'bitmarket':   { 'apiKey': '43a868dc9517485f28905b320581d1cf', 'secret': '892b34c7d8e6669550aa9d12aed0ad34' },
    'bitmex':      { 'apiKey': 'nsLKchj2hAxc5t5CP6LGTNSC', 'secret': '4AqteCYo9ZCPx9J3dhNiGY-_LTfmtLyqCzh-XSbCibuC-Pf6' },
    'bitso':       { 'apiKey': 'FZZzVkZgza', 'secret': 'f763b98d46d8c5e352b4ef70050bc9b1' },
    'bittrex':     { 'apiKey': '60f38a5818934fc08308778f94d3d8c4', 'secret': '9d294ddb5b944403b58e5298653720c1' },
    'btcx':        { 'apiKey': '53IPO-ZBQEN-91UNL-B8VD5-CTU1Z-E6RB1-S9X3P', 'secret': 'ptrearsi6oy1lmzazfcytnbozmsvjsnzha8hrrqqbjlnvgnqlpjb7kqxyency45a' },
    'bxinth':      { 'apiKey': '191c59bb46d5', 'secret': '03031e588e69' },
    # 'ccex':        { 'apiKey': '301D5954466D87CEAA9BA713A7951F5A', 'secret': 'F7DC06D6329FC1C266BFFA18DCC8A07D' },
    'cex':         { 'apiKey': 'eqCv267WySlu577JnFbGK2RQzIs', 'secret': 'pZnbuNEm5eE4W1VRuFQvZEiFCA', 'uid': 'up105393824' },
    'coincheck':   { 'apiKey': '1YBiSTpyEIkchWdE', 'secret': 'URuZrMASNkcd7vh1zb7zn4IQfZMoai3S' },
    'coinsecure':  { 'apiKey': 'gzrm0fP6BGMilMzmsoJFPMpWjDvCLThyrVanX0yu' },
    'coinspot':    { 'apiKey': '36b5803f892fe97ccd0b22da79ce6b21', 'secret': 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH', },
    'fybse':       { 'apiKey': 'gY7y57RlYqKN5ZI50O5C', 'secret': '1qm63Ojf5a' },
    'fybsg':       { 'apiKey': '', 'secret': '' },
    'gdax':        { 'apiKey': '92560ffae9b8a01d012726c698bcb2f1', 'secret': '9aHjPmW+EtRRKN/OiZGjXh8OxyThnDL4mMDre4Ghvn8wjMniAr5jdEZJLN/knW6FHeQyiz3dPIL5ytnF0Y6Xwg==', 'password': '6kszf4aci8r', },
    'hitbtc':      { 'apiKey': '18339694544745d9357f9e7c0f7c41bb', 'secret': '8340a60fb4e9fc73a169c26c7a7926f5' },
    'huobi':       { 'apiKey': '09bdde40-cc179779-1941272a-433a7', 'secret': 'ce6487f4-f078c39f-018ea6ce-01922' },
    'jubi':        { 'apiKey': '4edas-tn7jn-cpr8a-1er4k-r8h8i-cp6kj-jpzyz', 'secret': 'YYO(r-mp$2G-m4&1b-EYu~$-%tS4&-jNNhI-L!pg^' },
    'livecoin':    { 'apiKey': 'W5z7bvQM2pEShvGmqq1bXZkb1MR32GKw', 'secret': 'n8FrknvqwsRnTpGeNAbC51waYdE4xxSB', },
    'luno':        { 'apiKey': 'nrpzg7rkd8pnf', 'secret': 'Ps0DXw0TpTzdJ2Yek8V5TzFDfTWzyU5vfLdCiBP6vsI' },
    'okcoinusd':   { 'apiKey': 'da83cf1b-6fdc-495a-af55-f809bec64e2b', 'secret': '614D2E6D3428C2C5E54C81139A500BE0' },
    'okcoincny':   { 'apiKey': '', 'secret' : '' },
    'poloniex':    { 'apiKey': 'DW6G1D24-2HWMZZTY-6TUADS2O-TF87O6LS', 'secret': '70cc628f95e4e536bd2de702c058ff482fff52f176ac884d6aa605040c29e31caca93430755d1c56a09d0c6a9fe90077754da54b194523f21591e63015bf81fd' },
    'quadrigacx':  { 'apiKey': 'jKvWkMqrOj', 'secret': 'f65a2e3bf3c73171ee14e389314b2f78', 'uid': '395037' },
    'quoine':      { 'apiKey': '80953', 'secret': 'WfHUWcdFoGvZSuE7pE8XDh8FG9t5OP69iYrcwdnRs4rRn2uzZW+AHCyp/nBjlZcB+LWe3r6y2DCCYu+WcYkCAA==' },
    'therock':     { 'apiKey': '2b2a54cc6258b2a971318000d60e6b61ba4af05e', 'secret': 'b424a76088bda492852dbd5cadbb60ebcf144427' },
    'vaultoro':    { 'apiKey': 'A5jfgi567JP5QPpXYpETfsw92khpuNfR', 'secret': 'OExkUFpUX3o5UHB4amFtQ2R4QUh1RFBPMUhnX0k1bUY=' },
    'virwox':      { 'apiKey': '1ea680450b32585f743c50c051bf8e4e', 'login': 'IgorKroitor', 'password': 'HfveVskfVfvf260' },
    'xbtce':       { 'apiKey': 'dK2jBXMTppAM57ZJ', 'secret': 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT', 'uid': '68ef0552-3c37-4896-ba56-76173d9cd573', },
    'yobit':       { 'apiKey': '5DB6C7C6034E667D77F85B245772A7FD', 'secret': '1b6cf1838716f5c87f07391a9b30f974' },
    'zaif':        { 'apiKey': '580c7232-06c7-4698-8fb7-4cd2a543cea8', 'secret': '4c529fd6-fb28-4879-b20d-2a8f02c5db47' },
}

$markets['_1broker']->apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258';

$markets['xbtce']->uid    = '68ef0552-3c37-4896-ba56-76173d9cd573';
$markets['xbtce']->apiKey = 'dK2jBXMTppAM57ZJ';
$markets['xbtce']->secret = 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT';

$markets['coinspot']->apiKey = '36b5803f892fe97ccd0b22da79ce6b21';
$markets['coinspot']->secret = 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH';

function test_market_symbol_ticker ($market, $symbol) { 
    $ticker = $market->fetch_ticker ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'ticker',
        $ticker['datetime'],
        'high: '    . $ticker['high'],
        'low: '     . $ticker['low'],
        'bid: '     . $ticker['bid'],
        'ask: '     . $ticker['ask'],
        'volume: '  . $ticker['quoteVolume'])) . "\n";
}

function test_market_symbol_orderbook ($market, $symbol) {
    $orderbook = $market->fetch_order_book ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'order book',
        $orderbook['datetime'],
        'bid: '       . @$orderbook['bids'][0][0],
        'bidVolume: ' . @$orderbook['bids'][0][1],
        'ask: '       . @$orderbook['asks'][0][0],
        'askVolume: ' . @$orderbook['asks'][0][1])) . "\n";
}

function test_market_symbol ($market, $symbol) {
    $delay = $market->rateLimit * 1000;
    usleep ($delay);
    test_market_symbol_ticker ($market, $symbol);
    usleep ($delay);
    if ($market->id == 'coinmarketcap')
        dump (var_export ($market->fetchGlobal ()));
    else
        test_market_symbol_orderbook ($market, $symbol);
}

function load_market ($market) {

    $products = $market->load_products ();
    $symbols = array_keys ($products);    
    echo $market->id . ' ' . count ($symbols) . " symbols: " . implode (", ", $symbols) . "\n";
}

function test_market ($market) {

    $keys = array_keys ($market->products);
    $delay = $market->rateLimit * 1000;

    $symbol = $keys[0];
    $symbols = array (
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    );

    foreach ($symbols as $s) {
        if (in_array ($s, $keys))
            $symbol = $s;
    }

    if (strpos ($symbol, '.d') === false)
        test_market_symbol ($market, $symbol);

    // usleep ($delay);
    // $trades = $market->fetch_trades (array_keys ($products)[0]);
    // var_dump ($trades);

    if ((!$market->apiKey) or (strlen ($market->apiKey) < 1))
        return;

    usleep ($delay);

    $balance = $market->fetch_balance ();
    var_dump ($balance);
}

if (count ($argv) > 1) {
    
    if ($markets[$argv[1]]) {
    
        $id = $argv[1];
        $market = $markets[$id];
        load_market ($market);

        if (count ($argv) > 2) {
            test_market_symbol ($market, $argv[2]);
        }
        else 
            test_market ($market);

    } else {
    
        echo $argv[1] + " not found.\n";
    }

} else {

    foreach ($markets as $id => $market) {
    
        try {
    
            load_market ($market);
            test_market ($market);

        } catch (\ccxt\TimeoutError $e) {

            dump (yellow ('[Timeout Error] ' . $e->getMessage () . ' (ignoring)'));

        } catch (\ccxt\DDoSProtectionError $e) {

            dump (yellow ('[DDoS Protection Error] ' . $e->getMessage () . ' (ignoring)'));

        } catch (\ccxt\AuthenticationError $e) {

            dump (yellow ('[Authentication Error] ' . $e->getMessage () . ' (ignoring)'));

        } catch (\ccxt\MarketNotAvailableError $e) {

            dump (yellow ('[Market Not Available Error] ' . $e->getMessage () . ' (ignoring)'));

        } catch (Exception $e) {

            dump (red ('[Error] ' . $e->getMessage () . ' (ignoring)'));            
        }
    }

}

?>