<?php
require_once __DIR__ . "/../vendor/autoload.php";

use \Elliptic\EdDSA;
use \Elliptic\Utils;

function toHex($arg) { return strtoupper(Utils::toHex($arg)); }

class ED25519Test extends PHPUnit_Framework_TestCase {
    public function derivations() {
        $data = json_decode( file_get_contents(__DIR__ . "/fixtures/derivation-fixtures"), true);
        $data = array_slice($data, 0, 50);
        return array_map(function($set) { return [$set]; }, $data);
    }

    /**
     * @dataProvider derivations
     */
    public function test_derivations_can_compute_correct_a_and_A_from_secret($test) {
        $ed25519 = new EdDSA("ed25519");
        $secret = Utils::toArray($test["secret_hex"], 'hex');
        $key = $ed25519->keyFromSecret($secret);
        $this->assertEquals( toHex($key->privBytes()), $test["a_hex"] );
        $xRecovered = toHex( $ed25519->encodeInt(
                             $ed25519->decodePoint( $key->pubBytes() )->getX()) );
        $this->assertEquals( $xRecovered, $test["A_P"]["x"] );
        $this->assertEquals( toHex( $key->pubBytes() ), $test["A_hex"] );
    }

    public function signLines() {
        $data = file_get_contents(__DIR__ . "/fixtures/sign.input");
        $lines = array_filter( explode("\n", $data), function($line) { return strlen($line) > 0; });
        $lines = array_slice($lines, 0, 50);
        return array_map(function($line) { return [$line]; }, $lines);
    }

    /**
     * @dataProvider signLines
     */
    public function test_sign_input_test_vectors($line) {
        $split = explode(':', strtoupper($line));
        $ed25519 = new EdDSA("ed25519");
        $key = $ed25519->keyFromSecret(substr($split[0], 0, 64));
        $expectedPk = substr($split[0], 64);
        $this->assertEquals( toHex($key->pubBytes()), $expectedPk);

        $msg = Utils::toArray($split[2], 'hex');
        $sig = $key->sign($msg)->toHex();
        $sigR = substr($sig, 0, 64);
        $sigS = substr($sig, 64);

        $this->assertEquals($sigR, substr($split[3], 0, 64));
        $this->assertEquals($sigS, substr($split[3], 64, 64));
        $this->assertTrue($key->verify($msg, $sig));

        if (count($msg) == 0) {
            $forged = [ 0x78 ] /* ord('x') */;
        } else {
            $forged = $msg;
            $forged[count($msg) - 1] = ($msg[count($msg) - 1] + 1) % 256;
        }

        $this->assertNotTrue($key->verify($forged, $sig));
    }

    public function test_eddsa_has_encodingLength_of_32() {
        $ed25519 = new EdDSA("ed25519");
        $this->assertEquals(32, $ed25519->encodingLength);
    }

    public function test_eddsa_can_sign_and_verify_messages() {
        $ed25519 = new EdDSA("ed25519");
        $secret = array_fill(0, 32, 0);
        $msg = [ 0xB, 0xE, 0xE, 0xF ];
        $key = $ed25519->keyFromSecret($secret);
        $sig = $key->sign($msg)->toHex();

        $R = '8F1B9A7FDB22BCD2C15D4695B1CE2B063CBFAEC9B00BE360427BAC9533943F6C';
        $S = '5F0B380FD7F2E43B70AB2FA29F6C6E3FFC1012710E174786814012324BF19B0C';

        $this->assertEquals(substr($sig, 0, 64), $R);
        $this->assertEquals(substr($sig, 64), $S);

        $this->assertTrue($key->verify($msg, $sig));
    }

    static $secret = '0000000000000000000000000000000000000000000000000000000000000000';
    public function test_eddsa_keypair_can_be_created_with_keyFromSecret_or_keyFromPublic() {
        $ed25519 = new EdDSA("ed25519");
        $pair = $ed25519->keyFromSecret(self::$secret);
        $pubKey = $ed25519->keyFromPublic( toHex($pair->pubBytes()) );
        $this->assertTrue( is_a($pubKey->pub(), $ed25519->pointClass) );
        $this->assertTrue( $pubKey->pub()->eq($pair->pub()));
    }

    public function test_eddsa_keypair_getSecret_returns_bytes_with_optional_encoding() {
        $ed25519 = new EdDSA("ed25519");
        $pair = $ed25519->keyFromSecret(self::$secret);
        $this->assertTrue( is_array($pair->getSecret()) );
        $this->assertTrue( $pair->getSecret('hex') == self::$secret);
    }

    public function test_eddsa_keypair_getPub_returns_bytes_with_optional_encoding() {
        $ed25519 = new EdDSA("ed25519");
        $pair = $ed25519->keyFromSecret(self::$secret);
        $this->assertTrue( is_array($pair->getPublic()) );
        $this->assertEquals( $pair->getPublic('hex'),
            '3b6a27bcceb6a42d62a3a8d02a6f0d73653215771de243a63ac048a18b59da29');
    }
}
