<?php
namespace ccxt;
include_once (__DIR__.'/../../ccxt.php');

// ----------------------------------------------------------------------------

function fail_on_all_errors($errno, $errstr, $errfile, $errline) {

    if (!(error_reporting() & $errno)) {
        // This error code is not included in error_reporting, so let it fall
        // through to the standard PHP error handler
        return false;
    }

    echo "Error [$errno] $errstr on line $errline in file $errfile\n";
    exit(1);

    /* Don't execute PHP internal error handler */
    return true;
}

set_error_handler('ccxt\\fail_on_all_errors');
