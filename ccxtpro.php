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

namespace ccxtpro;

define('PATH_TO_CCXTPRO', __DIR__ . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR);
define('PATH_TO_CCXTPRO_BASE', PATH_TO_CCXTPRO . 'base' . DIRECTORY_SEPARATOR);

// require_once PATH_TO_CCXTPRO_BASE . 'errors.php';
require_once PATH_TO_CCXTPRO_BASE . 'Future.php';
require_once PATH_TO_CCXTPRO_BASE . 'Client.php';
require_once PATH_TO_CCXTPRO_BASE . 'ClientTrait.php';
require_once PATH_TO_CCXTPRO_BASE . 'OrderBook.php';
require_once PATH_TO_CCXTPRO_BASE . 'OrderBookSide.php';
require_once PATH_TO_CCXTPRO_BASE . 'BaseCache.php';
require_once PATH_TO_CCXTPRO_BASE . 'ArrayCache.php';
require_once PATH_TO_CCXTPRO_BASE . 'ArrayCacheByTimestamp.php';
require_once PATH_TO_CCXTPRO_BASE . 'ArrayCacheBySymbolById.php';
require_once PATH_TO_CCXTPRO_BASE . 'Exchange.php';

spl_autoload_register (function ($class_name) {
    $class_name = str_replace ("ccxtpro\\", "", $class_name);
    $file = PATH_TO_CCXTPRO . $class_name . '.php';
    if (file_exists ($file)) {
        require_once $file;
    }
});
