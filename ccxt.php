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
define('PATH_TO_CCXT_ASYNC', PATH_TO_CCXT . 'async' . DIRECTORY_SEPARATOR);
define('PATH_TO_CCXT_ASYNC_BASE', PATH_TO_CCXT_ASYNC . 'base' . DIRECTORY_SEPARATOR);

spl_autoload_register(function ($class) {
    // used to include static dependencies
    $parts = explode('\\', $class);
    if ($parts[0] === 'ccxt') {
        return;
    }
    $PATH = PATH_TO_CCXT . 'static_dependencies' . DIRECTORY_SEPARATOR;
    $ASYNC_PATH = $PATH . 'async' . DIRECTORY_SEPARATOR;

    if ($parts[0] === 'kornrunnner') {
        $version = phpversion();
        if (intval(explode('.', $version)[0]) < 7) {
            throw new \RuntimeException($class . " requires php7 or greater, your version: " . $version);
        }
    }
    if ($parts[0] === 'React') {
        $hyphenated = strtolower(preg_replace('/(?!^)[A-Z][a-z]+/', '-$0', $parts[1]));
        $all_parts = array(strtolower($parts[0]), $hyphenated, 'src', $parts[2]);
        if (count($parts) > 3) {
            array_push($all_parts, $parts[3]);
        }
        $class_name = implode(DIRECTORY_SEPARATOR, $all_parts);
        $file = $ASYNC_PATH . $class_name . '.php';
    } else if ($parts[0] === 'Recoil') {
        if (count($parts) === 2 || $parts[1] === 'Exception') {
            $all_parts = array(strtolower($parts[0]), 'api', 'src', $parts[1]);
            if (count($parts) > 2) {
                // inside the react/promise/src/Exception directory
                array_push($all_parts, $parts[2]);
            }
        } else {
            $all_parts = array(strtolower($parts[0]), $parts[1], 'src', $parts[2]);
        }
        if (count($parts) > 3) {
            array_push($all_parts, $parts[3]);
        }
        $class_name = implode(DIRECTORY_SEPARATOR, $all_parts);
        $file = $ASYNC_PATH . $class_name . '.php';
    } else if ($parts[0] === 'RingCentral') {
        $all_parts = array(strtolower($parts[0]), strtolower($parts[1]), 'src', $parts[2]);
        $class_name = implode(DIRECTORY_SEPARATOR, $all_parts);
        $file = $ASYNC_PATH . $class_name . '.php';
    } else if ($parts[0] === 'Psr') {
        $all_parts = array(strtolower($parts[0]), strtolower($parts[1]) . '-' . strtolower($parts[2]), 'src', $parts[3]);
        $class_name = implode(DIRECTORY_SEPARATOR, $all_parts);
        $file = $ASYNC_PATH . $class_name . '.php';
    } else if ($parts[0] === 'Evenement') {
        $all_parts = array(strtolower($parts[0]), strtolower($parts[0]), 'src', 'Evenement', $parts[1]);
        $class_name = implode(DIRECTORY_SEPARATOR, $all_parts);
        $file = $ASYNC_PATH . $class_name . '.php';
    } else {
        $class_name = str_replace('kornrunner\\Solidity', 'kornrunner/solidity/src/Solidity', $class);
        $class_name = str_replace('kornrunner\\Keccak', 'kornrunner/keccak/src/Keccak', $class_name);
        $class_name = str_replace('Elliptic\\', 'elliptic-php/lib/', $class_name);
        $class_name = str_replace('\\', DIRECTORY_SEPARATOR, $class_name);
        $file = $PATH . $class_name . '.php';
    }
    if (file_exists ($file)) {
        require_once $file;
    }
});

require_once 'php/static_dependencies/async/react/promise/src/functions_include.php';
require_once 'php/static_dependencies/async/react/promise-timer/src/functions_include.php';
require_once 'php/static_dependencies/async/react/promise-stream/src/functions_include.php';

require_once 'php/static_dependencies/async/ringcentral/psr7/src/functions_include.php';

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
require_once PATH_TO_CCXT_ASYNC_BASE . 'Exchange.php';

spl_autoload_register (function ($class_name) {
    $class_name = str_replace ("ccxt\\", "", $class_name);
    $sections = explode("\\", $class_name);
    $file = PATH_TO_CCXT . implode(DIRECTORY_SEPARATOR, $sections) . '.php';
    if (file_exists ($file))
        require_once $file;
});
