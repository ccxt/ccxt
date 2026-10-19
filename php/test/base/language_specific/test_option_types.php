<?php
namespace ccxt;

// hand-written php-only test: a wrong-typed string option passes through unchanged in php
// (only the C#, Java and Go ports throw on it); a wrong bool throws
function test_option_types() {
    $exchange = new \ccxt\Exchange(array(
        'id' => 'sampleexchange',
        'options' => array(
            'fetchX' => array(
                'wrongBool' => 'yes',
                'wrongString' => 5,
            ),
        ),
    ));
    $caught = false;
    try {
        $exchange->handle_option_bool_and_params(array(), 'fetchX', 'wrongBool', false);
    } catch (\ccxt\BadRequest $e) {
        $caught = strpos($e->getMessage(), 'fetchX() option wrongBool must be a boolean') !== false;
    }
    assert($caught);
    list($value, $params) = $exchange->handle_option_string_and_params(array(), 'fetchX', 'wrongString', 'x');
    assert($value === 5);
    list($value, $params) = $exchange->handle_margin_mode_and_params('fetchX', array('marginMode' => false));
    assert($value === false);
    assert(!array_key_exists('marginMode', $params));
}
