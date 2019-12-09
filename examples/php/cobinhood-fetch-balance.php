<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\cobinhood (array (

    // some exchanges may require additional API credentials
    'apiKey' => 'YOUR_API_KEY', // edit this line
    // 'secret' => 'COBINHOOD_DOES_NOT_USE_A_SECRET_KEY',

    // this is required!
    'enableRateLimit' => true, // https://github.com/ccxt/ccxt/wiki/Manual#rate-limit

    // this is not required! uncomment only if you want to debug it
    // 'verbose' => true,

));

$message = null;

try {

    $result = $exchange->fetch_balance ();
    var_dump ($result);

// these catch-clauses are showing the proper way of handling the errors

} catch (\ccxt\AuthenticationError $e) {

    // handle authentication error here

} catch (\ccxt\NetworkError $e) {

    // your code to handle the network code and retries here

} catch (\ccxt\ExchangeError $e) {

    // your code to handle an exchange error

} catch (Exception $e) {

    // This is an example of how NOT TO DO error handling
    // One should not rely on the message string contained in the exception
    // If you want to access it, that might indicate a design error in your code.
    // See: https://github.com/ccxt/ccxt/issues/3053

    $message = $e->getMessage ();

    if (preg_match ('/[a-z]+\s+(\{.+\})$/iu', $e->getMessage (), $matches)) {
        $message = $matches[1];
    }

    echo print_r ($message, true) . "\n";

}

?>
