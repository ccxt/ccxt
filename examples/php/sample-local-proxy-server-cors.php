<?php

// place this script in your webserver and call it like: 
//   http://your_server.com/sample-proxy.php?url=https://api64.ipify.org/

$whitelisted_ips = [
    'localhost',
    '127.0.0.1',
    '::1',
    // if you are accessing this script from remote device, add your ip here
]; 

if (!in_array($_SERVER['REMOTE_ADDR'], $whitelisted_ips)) {
	die("Your ip is not allowed to use this script ... " . strval($_SERVER['REMOTE_ADDR']));
}

$url = $_GET['url'];
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION	,0);
curl_setopt($ch, CURLOPT_HEADER			,0);  // DO NOT RETURN HTTP HEADERS
curl_setopt($ch, CURLOPT_RETURNTRANSFER	,1);  // RETURN THE CONTENTS OF THE CALL
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 9);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 9);
curl_setopt($ch, CURLOPT_ENCODING,  '');
$response = curl_exec($ch);
curl_close($ch);
echo $response;
exit;