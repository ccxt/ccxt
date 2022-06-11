<?php

namespace ccxt;

use Exception;

class Decorator
{
    protected $_instance;
    private $methods = array();

    public function __construct($instance)
    {
        $this->_instance = $instance;
    }

    public function addMethod ($method, $callback)
    {
        $this->methods[$method] = $callback;
    }

    public function __call($method, $args = array())
    {
        if (array_key_exists ( $method, $this->methods )) {
            return call_user_func_array($this->methods[$method], $args);
        }
        return call_user_func_array(array($this->_instance, $method), $args);
    }
}
