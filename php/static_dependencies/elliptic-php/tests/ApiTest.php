<?php
require_once __DIR__ . "/../vendor/autoload.php";

class ApiTest extends PHPUnit_Framework_TestCase {
    public function test_should_instatiate_with_valid_curve_secp256k1() {
        $ec = new \Elliptic\EC('secp256k1');

        $this->assertNotNull($ec);
        $this->assertInstanceOf(\Elliptic\EC::class, $ec);
    }

    
    public function test_should_throw_error_with_invalid_curve() {
        $this->setExpectedException("Exception");
        $ec = new \Elliptic\EC('nonexistent-curve');
    }
}
