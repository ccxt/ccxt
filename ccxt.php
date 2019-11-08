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

use Closure;

// echo "--------------------------------------------------------------\n";
// debug_print_backtrace();
// echo "--------------------------------------------------------------\n";

define('PATH_TO_CCXTPRO', __DIR__ . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR);
define('PATH_TO_CCXTPRO_BASE', PATH_TO_CCXTPRO . 'base' . DIRECTORY_SEPARATOR);

require_once 'vendor/autoload.php';

// require_once PATH_TO_CCXTPRO_BASE . 'errors.php';
require_once PATH_TO_CCXTPRO_BASE . 'Exchange.php';

class foobar {

    public function __call($function, $params) {
        if (@$this->$function instanceof Closure) {
            return call_user_func_array($this->$function->bindTo($this, static::class), $params);
        }
        throw new \ccxt\ExchangeError($function . ' method not found, try underscore_notation instead of camelCase for the method being called');
        // return super::__call ($function, $params);
    }

    public function abc() {
        $this->y = 1;
        $this->x = function () {
            print('hello');
        };
    }
};

$x = new foobar ();
$x->abc();
// print(gettype($x->x));
// print_r($x->x);
// exit();
$x->x();

exit ();

function convert_reflection_array_to_associative_array($reflection) {
    $array = json_decode(json_encode($reflection), true);
    return \ccxt\Exchange::index_by($array, 'name');
}

function get_class_methods_and_properties($class) {
    $reflection_class = new \ReflectionClass($class);
    $methods = $reflection_class->getMethods();
    $properties = $reflection_class->getProperties ();
    // convert an array of ReflectionMethod instances [ ReflectionMethod, ... ]
    // to an associative array of class/name structures { name => { name, class }, ... }
    $methods_by_name = convert_reflection_array_to_associative_array ($methods);
    $properties_by_name = convert_reflection_array_to_associative_array ($properties);
    return array($methods_by_name, $properties_by_name);
}

function get_child_methods_and_properties($parent_class, $child_class) {
    $parent_methods_and_properties = get_class_methods_and_properties($parent_class);
    $child_methods_and_properties = get_class_methods($child_class);
    return array_diff_key($child_methods, $parent_methods);
}

function monkey_patch_exchange($exchange, $methods, $properties) {
    // for name, value in child_members.items():
    //     setattr(exchange, name, value)
    // return exchange
}

function monkey_patch_all_exchanges($exchanges, $parent_class, $child_class) {
    $difference = get_child_methods_and_properties($parent_class, $child_class);
    list($methods, $properties) = $difference;
    // set those properties in the exchange
    // \ccxtpro\Exchange::$properties =

    $result = array();
    // for id, exchange in exchanges.items():
    //     result[id] = monkey_patch_exchange($exchange, $methods, $properties)
    // return result
}

monkey_patch_all_exchanges(null, '\ccxt\Exchange', '\ccxtpro\Exchange');

spl_autoload_register (function ($class_name) {
    $class_name = str_replace ("ccxt\\", "", $class_name);
    $file = PATH_TO_CCXTPRO . $class_name . '.php';
    if (file_exists ($file))
        require_once $file;
});
