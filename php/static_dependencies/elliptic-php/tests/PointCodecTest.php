<?php
require_once __DIR__ . "/../vendor/autoload.php";

class PointCodecTest extends PHPUnit_Framework_TestCase {
    function makeShortTest($definition) {
        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;

        return function() use($curve, $definition) {
            $co = $definition["coordinates"];
            $p = $curve->point($co["x"], $co["y"]);

            // Encodes as expected
            $this->assertEquals($p->encode('hex'), $definition["encoded"]);
            $this->assertEquals($p->encodeCompressed('hex'), $definition["compactEncoded"]);

            // Decodes as expected
            $this->assertTrue($curve->decodePoint($definition["encoded"], 'hex')->eq($p));
            $this->assertTrue($curve->decodePoint($definition["compactEncoded"], 'hex')->eq($p));
            $this->assertTrue($curve->decodePoint($definition["hybrid"], 'hex')->eq($p));
        };
    }

    function makeMontTest($definition) {
        $curve = \Elliptic\Curves::getCurve("curve25519")->curve;
        return function() use ($definition, $curve) {
            $co = $definition["coordinates"];
            $p = $curve->point($co["x"], $co["z"]);
            $encoded = $p->encode('hex');
            $decoded = $curve->decodePoint($encoded, 'hex');
            $this->assertTrue($decoded->eq($p));
            $this->assertEquals($encoded, $definition["encoded"]);
        };
    }

    static $shortPointEvenY;
    static $shortPointOddY;

    public function test_should_throw_when_trying_to_decode_random_bytes() {
        $this->setExpectedException("Exception");
        \Elliptic\Curves::getCurve("secp256k1")->curve->decodePoint(
            '05' .
            '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
    }
    
    public function test_should_be_able_to_encode_and_decode_a_short_curve_point_with_even_Y() {
        $f = $this->makeShortTest(self::$shortPointEvenY);
        $f();
    }

    public function test_should_be_able_to_encode_and_decode_a_short_curve_point_with_odd_Y() {
        $f = $this->makeShortTest(self::$shortPointOddY);
        $f();
    }

    public function test_should_be_able_to_encode_and_decode_a_mont_curve_point() {
        $f = $this->makeMontTest([
            "coordinates" => [
                // curve25519.curve.g.mul(new BN('6')).getX().toString(16, 2)
                "x" => '26954ccdc99ebf34f8f1dde5e6bb080685fec73640494c28f9fe0bfa8c794531',
                "z" => '1'
            ],
            "encoded" =>
                '26954ccdc99ebf34f8f1dde5e6bb080685fec73640494c28f9fe0bfa8c794531'
           ]);
        $f();
    }
}

PointCodecTest::$shortPointEvenY = [
            "coordinates" => [
                "x" => '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                "y" => '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
            ],
            "compactEncoded" =>
                '02' .
                '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
            "encoded" =>
                '04' .
                '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' .
                '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
            "hybrid" =>
                '06' .
                '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' .
                '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
            ];


PointCodecTest::$shortPointOddY = [
            "coordinates" => [
                "x" => 'fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556',
                "y" => 'ae12777aacfbb620f3be96017f45c560de80f0f6518fe4a03c870c36b075f297'
            ],
            "compactEncoded" =>
                '03' .
                'fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556',
            "encoded" =>
                '04' .
                'fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556' .
                'ae12777aacfbb620f3be96017f45c560de80f0f6518fe4a03c870c36b075f297',
            "hybrid" =>
                '07' .
                'fff97bd5755eeea420453a14355235d382f6472f8568a18b2f057a1460297556' .
                'ae12777aacfbb620f3be96017f45c560de80f0f6518fe4a03c870c36b075f297'
            ];
