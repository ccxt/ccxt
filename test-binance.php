<?php

$key = "XBVtcbAfK7119GAXaXra47lBXA8sfcANKNu2sja7VbC1PiCZ0OUms5HnGRWvJLlo";
$secret = "ZESxhBWQqO9AsqW7spC7251ibR35ERIZNxZ3PoNooRcT55DFzGphsYYBRevTDci6";

function milliseconds () {
    list ($msec, $sec) = explode (' ', microtime ());
    return $sec . substr ($msec, 2, 3);
}

$url = 'https://www.binance.com/api/v1/account';

$nonce = milliseconds ();
$query = 'timestamp=' . $nonce;
$auth = $secret . '|' . $query;
$signature = hash ('sha256', $auth);
$query .= '&' . 'signature=' . $signature;
$headers = array ('X-MBX-APIKEY: ' . $key);
$url .= '?' . $query;

$ch = curl_init ();

curl_setopt ($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt ($ch, CURLOPT_HTTPGET, true);
curl_setopt ($ch, CURLOPT_URL, $url);
curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt ($ch, CURLOPT_ENCODING, '');

$result = curl_exec ($ch);
$object = json_decode ($result);
var_dump ($object);
curl_close ($ch);

?>