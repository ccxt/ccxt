<?php
require_once __DIR__ . "/../vendor/autoload.php";
use BN\BN;

class ECDSATest extends PHPUnit_Framework_TestCase {

    function ECDSACurveNames() {
        return [
            ['secp256k1']
            , ['ed25519']
            , ['p256']
            , ['p384']
            , ['p521']
        ];
    }

    static $entropy = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25
    ];

    static $msg = 'deadbeef';

    protected $curve;
    protected $ecdsa;
    protected $keys;

    public function prepare($name) {
        $this->curve = \Elliptic\Curves::getCurve($name);
        $this->assertNotNull($this->curve);

        $this->ecdsa = new \Elliptic\EC($this->curve);
        $this->keys  = $this->ecdsa->genKeyPair([ "entropy" => self::$entropy ]);
        return [$this->curve, $this->ecdsa, $this->keys];
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_generate_proper_key_pair($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $keylen = 64;
        if ($name == 'p384') {
            $keylen = 96;
        } else if ($name == 'p521') {
            $keylen = 132;
        }
        // Get keys out of pair
        $this->assertTrue( $keys->getPublic()->x && $keys->getPublic()->y );
        $this->assertTrue( $keys->getPrivate()->byteLength() > 0);
        $this->assertEquals( strlen($keys->getPrivate('hex')), $keylen);
        $this->assertTrue( strlen($keys->getPublic('hex')) > 0);
        $this->assertTrue( strlen($keys->getPrivate('hex')) > 0);
        $this->assertTrue( $keys->validate()["result"], 'key validate' );
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_sign_and_verify($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $ecdsa->sign(self::$msg, $keys);
        $this->assertTrue($ecdsa->verify(self::$msg, $signature, $keys), 'Normal verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_sign_and_verify_using_keys_methods($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $keys->sign(self::$msg);
        $this->assertTrue($keys->verify(self::$msg, $signature), 'On-key verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_load_private_key_from_the_hex_value($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $copy = $ecdsa->keyFromPrivate($keys->getPrivate('hex'), 'hex');
        $signature = $ecdsa->sign(self::$msg, $copy);
        $this->assertTrue($ecdsa->verify(self::$msg, $signature, $copy), 'hex-private verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_have_signature_s_leq_keys_ec_nh($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        // key.sign(msg, options)
        $sign = $keys->sign('deadbeef', [ "canonical" => true ]);
        $this->assertTrue($sign->s->cmp($keys->ec->nh) <= 0);
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_support_options_k($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $sign = $keys->sign(self::$msg, [
            "k" => function($iter) {
                    $this->assertTrue($iter >= 0);
                    return new BN(1358);
                }
            ]);
        $this->assertTrue($ecdsa->verify(self::$msg, $sign, $keys), 'custom-k verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_have_another_signature_with_pers($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $sign1 = $keys->sign(self::$msg);
        $sign2 = $keys->sign(self::$msg, [ "pers" => '1234', "persEnc" => 'hex' ]);
        $this->assertNotEquals($sign1->r->toString('hex') . $sign1->s->toString('hex'),
                $sign2->r->toString('hex') . $sign2->s->toString('hex'));
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_load_public_key_from_compact_hex_value($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $pub = $keys->getPublic(true, 'hex');
        $copy = $ecdsa->keyFromPublic($pub, 'hex');
        $this->assertEquals($copy->getPublic(true, 'hex'), $pub);
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_load_public_key_from_hex_value($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $pub = $keys->getPublic('hex');
        $copy = $ecdsa->keyFromPublic($pub, 'hex');
        $this->assertEquals($copy->getPublic('hex'), $pub);
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_support_hex_DER_encoding_of_signatures($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $ecdsa->sign(self::$msg, $keys);
        $dsign = $signature->toDER('hex');
        $this->assertTrue($ecdsa->verify(self::$msg, $dsign, $keys), 'hex-DER encoded verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_support_DER_encoding_of_signatures($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $ecdsa->sign(self::$msg, $keys);
        $dsign = $signature->toDER();
        $this->assertTrue($ecdsa->verify(self::$msg, $dsign, $keys), 'DER encoded verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_not_verify_signature_with_wrong_public_key($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $ecdsa->sign(self::$msg, $keys);

        $wrong = $ecdsa->genKeyPair();
        $this->assertNotTrue($ecdsa->verify(self::$msg, $signature, $wrong), 'Wrong key verify');
    }

    /**
     * @dataProvider ECDSACurveNames
     */
    public function test_should_not_verify_signature_with_wrong_private_key($name) {
        list($curve, $ecdsa, $keys) = $this->prepare($name);
        $signature = $ecdsa->sign(self::$msg, $keys);

        $wrong = $ecdsa->keyFromPrivate($keys->getPrivate('hex') .
                $keys->getPrivate('hex'), 'hex');
        $this->assertNotTrue($ecdsa->verify(self::$msg, $signature, $wrong), 'Wrong key verify');
    }


    // TODO: Implement RFC6979 vectors test


    function MaxwellsTrickVector() {
        $p256 = \Elliptic\Curves::getCurve("p256");
        $p384 = \Elliptic\Curves::getCurve("p384");
        $msg = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        return [
          [[
            "curve" => $p256,
            "pub" => '041548fc88953e06cd34d4b300804c5322cb48c24aaaa4d0' .
                     '7a541b0f0ccfeedeb0ae4991b90519ea405588bdf699f5e6' .
                     'd0c6b2d5217a5c16e8371062737aa1dae1',
            "message" => $msg,
            "sig" => '3006020106020104',
            "result" => true
          ]],
          [[
            "curve" => $p256,
            "pub" => '04ad8f60e4ec1ebdb6a260b559cb55b1e9d2c5ddd43a41a2' .
                     'd11b0741ef2567d84e166737664104ebbc337af3d861d352' .
                     '4cfbc761c12edae974a0759750c8324f9a',
            "message" => $msg,
            "sig" => '3006020106020104',
            "result" => true
          ]],
          [[
            "curve" => $p256,
            "pub" => '0445bd879143a64af5746e2e82aa65fd2ea07bba4e355940' .
                     '95a981b59984dacb219d59697387ac721b1f1eccf4b11f43' .
                     'ddc39e8367147abab3084142ed3ea170e4',
            "message" => $msg,
            "sig" => '301502104319055358e8617b0c46353d039cdaae020104',
            "result" => true
          ]],
          [[
            "curve" => $p256,
            "pub" => '040feb5df4cc78b35ec9c180cc0de5842f75f088b4845697' .
                     '8ffa98e716d94883e1e6500b2a1f6c1d9d493428d7ae7d9a' .
                     '8a560fff30a3d14aa160be0c5e7edcd887',
            "message" => $msg,
            "sig" => '301502104319055358e8617b0c46353d039cdaae020104',
            "result" => false
          ]],
          [[
            "curve" => $p384,
            "pub" => '0425e299eea9927b39fa92417705391bf17e8110b4615e9e' .
                     'b5da471b57be0c30e7d89dbdc3e5da4eae029b300344d385' .
                     '1548b59ed8be668813905105e673319d59d32f574e180568' .
                     '463c6186864888f6c0b67b304441f82aab031279e48f047c31',
            "message" => $msg,
            "sig" => '3006020103020104',
            "result" => true
          ]],
          [[
            "curve" => $p384,
            "pub" => '04a328f65c22307188b4af65779c1d2ec821c6748c6bd8dc' .
                     '0e6a008135f048f832df501f7f3f79966b03d5bef2f187ec' .
                     '34d85f6a934af465656fb4eea8dd9176ab80fbb4a27a649f' .
                     '526a7dfe616091b78d293552bc093dfde9b31cae69d51d3afb',
            "message" => $msg,
            "sig" => '3006020103020104',
            "result" => true
          ]],
          [[
            "curve" => $p384,
            "pub" => '04242e8585eaa7a28cc6062cab4c9c5fd536f46b17be1728' .
                     '288a2cda5951df4941aed1d712defda023d10aca1c5ee014' .
                     '43e8beacd821f7efa27847418ab95ce2c514b2b6b395ee73' .
                     '417c83dbcad631421f360d84d64658c98a62d685b220f5aad4',
            "message" => $msg,
            "sig" => '301d0218389cb27e0bc8d21fa7e5f24cb74f58851313e696333ad68e020104',
            "result" => true
          ]],
          [[
            "curve" => $p384,
            "pub" => '04cdf865dd743fe1c23757ec5e65fd5e4038b472ded2af26' .
                     '1e3d8343c595c8b69147df46379c7ca40e60e80170d34a11' .
                     '88dbb2b6f7d3934c23d2f78cfb0db3f3219959fad63c9b61' .
                     '2ef2f20d679777b84192ce86e781c14b1bbb77eacd6e0520e2',
            "message" => $msg,
            "sig" => '301d0218389cb27e0bc8d21fa7e5f24cb74f58851313e696333ad68e020104',
            "result" => false
          ]]
        ];
    }

    /**
     * @dataProvider MaxwellsTrickVector
     */
    public function test_should_pass_on_Maxwells_trick_vectors($vector) {
        $ecdsa = new \Elliptic\EC($vector["curve"]);
        $key = $ecdsa->keyFromPublic($vector["pub"], 'hex');
        $msg = $vector["message"];
        $sig = $vector["sig"];
        
        $actual = $ecdsa->verify($msg, $sig, $key);
        $this->assertEquals($actual, $vector["result"]);
    }



    public function test_should_deterministically_generate_private_key() {
        $curve = \Elliptic\Curves::getCurve("secp256k1");
        $this->assertNotNull($curve);

        $ecdsa = new \Elliptic\EC($curve);
        $keys  = $ecdsa->genKeyPair(array(
            "pers" => 'my.pers.string',
            "entropy" => hash('sha256', 'hello world', true)
        ));
        $this->assertEquals(
            $keys->getPrivate('hex'), 
            '6160edb2b218b7f1394b9ca8eb65a72831032a1f2f3dc2d99291c2f7950ed887');
    }

    public function test_should_recover_the_public_key_from_a_signature() {
        $ec = new \Elliptic\EC('secp256k1');
        $key = $ec->genKeyPair();
        $msg = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        $signature = $key->sign($msg);
        $recid = $ec->getKeyRecoveryParam($msg, $signature, $key->getPublic());
        $r = $ec->recoverPubKey($msg, $signature, $recid);
        $this->assertTrue($key->getPublic()->eq($r), 'the keys should match');
    }

    public function test_should_fail_to_recover_key_when_no_quadratic_residue_available() {
        $ec = new \Elliptic\EC('secp256k1');
        $message =
            'f75c6b18a72fabc0f0b888c3da58e004f0af1fe14f7ca5d8c897fe164925d5e9';

        $this->setExpectedException("Exception");
        $ec->recoverPubKey($message, [
            "r" => 'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
            "s" => '8887321be575c8095f789dd4c743dfe42c1820f9231f98a962b210e3ac2452a3'
        ], 0);
    }
}
