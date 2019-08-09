<?php
require_once __DIR__ . "/../vendor/autoload.php";

class ECDHTest extends PHPUnit_Framework_TestCase {
    public function test_should_work_with_secp256k1_curve() {
        $this->doTest('secp256k1');
    }

    public function test_should_work_with_p256_curve() {
        $this->doTest('p256');
    }

    public function test_should_work_with_curve25519_curve() {
        $this->doTest('curve25519');
    }

    public function test_should_work_with_ed25519_curve() {
        $this->doTest('ed25519');
    }

    function doTest($name) {
        $ecdh = new \Elliptic\EC($name);
        $s1 = $ecdh->genKeyPair();
        $s2 = $ecdh->genKeyPair();
        $sh1 = $s1->derive($s2->getPublic());
        $sh2 = $s2->derive($s1->getPublic());

        $this->assertEquals($sh1->toString(16), $sh2->toString(16));

        $sh1 = $s1->derive($ecdh->keyFromPublic($s2->getPublic('hex'), 'hex')
                ->getPublic());
        $sh2 = $s2->derive($ecdh->keyFromPublic($s1->getPublic('hex'), 'hex')
                ->getPublic());
        $this->assertEquals($sh1->toString(16), $sh2->toString(16));
    }
}
