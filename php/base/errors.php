<?php

namespace ccxt;

use Exception;

$error_hierarchy = array (
    'BaseError' => array (
        'ExchangeError' => array (
            'AuthenticationError' => array (
                'PermissionDenied' => array(),
                'AccountSuspended' => array(),
            ),
            'ArgumentsRequired' => array(),
            'BadRequest' => array (
                'BadSymbol' => array(),
            ),
            'BadResponse' => array (
                'NullResponse' => array(),
            ),
            'InsufficientFunds' => array(),
            'InvalidAddress' => array (
                'AddressPending' => array(),
            ),
            'InvalidOrder' => array (
                'OrderNotFound' => array(),
                'OrderNotCached' => array(),
                'CancelPending' => array(),
                'OrderImmediatelyFillable' => array(),
                'OrderNotFillable' => array(),
                'DuplicateOrderId' => array(),
            ),
            'NotSupported' => array(),
        ),
        'NetworkError' => array (
            'DDoSProtection' => array(),
            'ExchangeNotAvailable' => array (
                'OnMaintenance' => array(),
            ),
            'InvalidNonce' => array(),
            'RequestTimeout' => array(),
        ),
    ),
);

/*  ------------------------------------------------------------------------ */

function error_factory($array, $parent) {
    foreach ($array as $error => $subclasses) {
        eval("namespace ccxt; class $error extends $parent {};");
        error_factory($subclasses, $error);
    }
}


class BaseError extends Exception {
    public $message;
    public $error_message;
    public $exchange_id;
    public $http_code;
    public $http_status_text;
    public $url;
    public $http_method;
    public $response_headers;
    public $response_body;
    public $response_json;
    public $verbose;
    public static $camel_case = array(
        'exchangeId' => 'exchange_id',
        'httpCode' => 'http_code',
        'httpStatusText' => 'http_status_text',
        'httpMethod' => 'http_method',
        'responseHeaders' => 'response_headers',
        'responseBody' => 'response_body',
        'responseJson' => 'response_json',
    );

    public function __construct($error_message, $exchange = null, $http_code = null, $http_status_text = null, $url = null, $http_method = null, $response_headers = null, $response_body = null, $response_json = null, ...$args) {
        $this->verbose = null;
        $this->exchange_id = null;
        if ($exchange) {
            $this->verbose = $exchange->verbose;
            $this->exchange_id = $exchange->id;
        }
        parent::__construct($this->message, ...$args);
        unset($this->message);
        $this->error_message = $error_message;
        $this->http_code = $http_code;
        $this->http_status_text = $http_status_text;
        $this->url = $url;
        $this->http_method = $http_method;
        $this->response_headers = $response_headers;
        $this->response_body = $response_body;
        $this->response_json = $response_json;
    }

    public function __toString() {
        $this->message = implode(' ', array_map('strval', array_filter(array($this->exchange_id, $this->http_method, $this->url, $this->http_code, $this->http_status_text, $this->error_message), 'is_string')));
        if ($this->verbose) {
            if ($this->response_headers) {
                $this->message .= "\n" . print_r($this->response_headers, true);
            }
            if ($this->response_json) {
                $this->message .= "\n" . print_r($this->response_json, true);
            } else if ($this->response_body) {
                $this->message .= "\n" . $this->response_body;
            }
        }
        return $this->message;
    }

    public function __get($name) {
        // called for properties that do not exist in class,
        // i.e. camelCase getMessage is final, so we make an entry point here
        if ($name === 'message') {
            return $this->__toString();
        }
        if (array_key_exists($name, static::$camel_case)) {
            $underscore = $this->camel_case[$name];
            return $this->$underscore;
        }
        return $this->$name;  // trigger error
    }

    public function __set($name, $value) {
        $underscore = $name;
        if (array_key_exists($name, static::$camel_case)) {
            $underscore = static::$camel_case[$name];
        }
        $this->$underscore = $value;
    }
};

error_factory($error_hierarchy['BaseError'], 'BaseError');
