<?php

$file = file_get_contents('./ccxt.d.ts');

$types = array();
$matches = null;
preg_match_all('/export interface (?:Ticker|OrderBook|Trade) {[\s\S]*?}/', $file, $matches);
$matches = $matches[0];
foreach ($matches as $match) {
    $id = null;
    preg_match('/export interface (\w+)/', $match, $id);
    $id = strtolower($id[1]);
    $fields = null;
    preg_match_all('/(\w+): ([^;]+);/', $match, $fields);
    $patterns = array(
        '/^\[.*\]$/',
        '/^\'.*\'$/',
    );
    $replacements = array(
        'array',
        'string'
    );
    $replaced = preg_replace($patterns, $replacements, $fields[2]);
    $result = array_combine($fields[1], $replaced);
    $types[$id] = $result;
}

function is_number($x) {
    return is_float($x) or is_int($x);
}

function is_any($x) {
    return is_array($x) or is_object($x);
}

function validate_multiple($array, $types) {
    echo "Validating...\n";
    foreach ($types as $key => $type) {
        $function = 'is_' . $type;
        validate_data($array, $key, $function);
    }
}

function validate_data($array, $key, $function) {
    if (!is_array($array)) {
        throw new AssertionError(gettype($array) . ' is not a valid array');
    }
    if (!array_key_exists($key, $array)) {
        throw new AssertionError($key . ' is not a valid key');
    }
    $value = $array[$key];
    if (!is_null($value) and !$function($value)) {
        throw new AssertionError($key . ' is the wrong type, expected ' . substr($function, 3) . ' but got ' . gettype($value));
    }
}

class Validator {
    public static function validate_trades($trades) {
        global $types;
        if (count($trades) <= 0) {
            return;
        }
        validate_multiple($trades[0], $types['trade']);
    }

    public static function __callStatic($name, $arguments) {
        list($validate, $fragment) = explode('_', $name);
        if ($validate !== 'validate') {
            throw new Error('Call to undefined method Validator::' . $name . '()');
        }
        if (count($arguments) !== 1) {
            throw new Error('Too many arguments passed to Validator');
        }
        global $types;
        $fields = $types[$fragment];
        validate_multiple($arguments[0], $fields);
    }
}

# uncomment this line to debug
# var_dump($types);
