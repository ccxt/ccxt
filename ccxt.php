<?php

/*

MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//-----------------------------------------------------------------------------

namespace ccxt;

define('PATH_TO_CCXT', __DIR__ . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR);
define('PATH_TO_CCXT_BASE', PATH_TO_CCXT . 'base' . DIRECTORY_SEPARATOR);

spl_autoload_register(function ($class) {
    // used to include static dependencies
    $PATH = PATH_TO_CCXT . 'static_dependencies/';
    if (strpos($class, 'kornrunner') !== false) {
        $version = phpversion();
        if (intval(explode('.', $version)[0]) < 7) {
            throw new \RuntimeException($class . " requires php7 or greater, your version: " . $version);
        }
    }
    $class_name = str_replace('kornrunner\\Solidity', 'kornrunner/solidity/src/Solidity', $class);
    $class_name = str_replace('kornrunner\\Keccak', 'kornrunner/keccak/src/Keccak', $class_name);
    $class_name = str_replace('Elliptic\\', 'elliptic-php/lib/', $class_name);
    $class_name = str_replace('\\', DIRECTORY_SEPARATOR, $class_name);
    $file = $PATH . $class_name . '.php';
    if (file_exists ($file))
        require_once $file;
});

require_once PATH_TO_CCXT_BASE . 'BaseError.php';
require_once PATH_TO_CCXT_BASE . 'ExchangeError.php';
require_once PATH_TO_CCXT_BASE . 'AuthenticationError.php';
require_once PATH_TO_CCXT_BASE . 'PermissionDenied.php';
require_once PATH_TO_CCXT_BASE . 'AccountSuspended.php';
require_once PATH_TO_CCXT_BASE . 'ArgumentsRequired.php';
require_once PATH_TO_CCXT_BASE . 'BadRequest.php';
require_once PATH_TO_CCXT_BASE . 'BadSymbol.php';
require_once PATH_TO_CCXT_BASE . 'BadResponse.php';
require_once PATH_TO_CCXT_BASE . 'NullResponse.php';
require_once PATH_TO_CCXT_BASE . 'InsufficientFunds.php';
require_once PATH_TO_CCXT_BASE . 'InvalidAddress.php';
require_once PATH_TO_CCXT_BASE . 'AddressPending.php';
require_once PATH_TO_CCXT_BASE . 'InvalidOrder.php';
require_once PATH_TO_CCXT_BASE . 'OrderNotFound.php';
require_once PATH_TO_CCXT_BASE . 'OrderNotCached.php';
require_once PATH_TO_CCXT_BASE . 'CancelPending.php';
require_once PATH_TO_CCXT_BASE . 'OrderImmediatelyFillable.php';
require_once PATH_TO_CCXT_BASE . 'OrderNotFillable.php';
require_once PATH_TO_CCXT_BASE . 'DuplicateOrderId.php';
require_once PATH_TO_CCXT_BASE . 'NotSupported.php';
require_once PATH_TO_CCXT_BASE . 'NetworkError.php';
require_once PATH_TO_CCXT_BASE . 'DDoSProtection.php';
require_once PATH_TO_CCXT_BASE . 'RateLimitExceeded.php';
require_once PATH_TO_CCXT_BASE . 'ExchangeNotAvailable.php';
require_once PATH_TO_CCXT_BASE . 'OnMaintenance.php';
require_once PATH_TO_CCXT_BASE . 'InvalidNonce.php';
require_once PATH_TO_CCXT_BASE . 'RequestTimeout.php';

require_once PATH_TO_CCXT_BASE . 'Exchange.php';

spl_autoload_register (function ($class_name) {
    $class_name = str_replace ("ccxt\\", "", $class_name);
    $file = PATH_TO_CCXT . $class_name . '.php';
    if (file_exists ($file))
        require_once $file;
});
