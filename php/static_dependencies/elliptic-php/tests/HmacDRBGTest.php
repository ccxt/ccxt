<?php
require_once __DIR__ . "/../vendor/autoload.php";

class HmacDRBGTest extends PHPUnit_Framework_TestCase {

    public function test_should_support_hmac_drbg_sha256() {
        function doDrbg($opt) {
            $drbg = new \Elliptic\HmacDRBG([
                "hash" => ["algo" => 'sha256', 'outSize' => 256, 'hmacStrength' => 192],//hash.sha256,
                "entropy" => $opt["entropy"],
                "nonce" => $opt["nonce"],
                "pers" => $opt["pers"]
            ]);
            return $drbg->generate($opt["size"], 'hex');
        }

        $test = [
          [
            "entropy" => 'totally random0123456789',
            "nonce" => 'secret nonce',
            "pers" => 'my drbg',
            "size" => 32,
            "res" => '018ec5f8e08c41e5ac974eb129ac297c5388ee1864324fa13d9b15cf98d9a157'
          ],
          [
            "entropy" => 'totally random0123456789',
            "nonce" => 'secret nonce',
            "pers" => null,
            "size" => 32,
            "res" => 'ed5d61ecf0ef38258e62f03bbb49f19f2cd07ba5145a840d83b134d5963b3633'
          ]
        ];
        for ($i = 0; $i < count($test); $i++)
            $this->assertEquals(doDrbg($test[$i]), $test[$i]["res"]);
    }

    /**
    * @dataProvider NISTVector
    */
    public function test_should_not_fail_at_NIST_vector($opt) {
        $drbg = new \Elliptic\HmacDRBG([
            "hash" => ["algo" => 'sha256', 'outSize' => 256, 'hmacStrength' => 192],//hash.sha256,
            "entropy" => $opt["entropy"],
            "entropyEnc" => 'hex',
            "nonce" => $opt["nonce"],
            "nonceEnc" => 'hex',
            "pers" => $opt["pers"],
            "persEnc" => 'hex'
        ]);

        for ($i = 0; $i < count($opt["add"]); $i++) {
          $last = $drbg->generate(strlen($opt["expected"]) / 2,
                                   'hex',
                                   $opt["add"][$i],
                                   'hex');
        }
        $this->assertEquals($last, $opt["expected"]);
    }

    function NISTVector() {
        $data  = json_decode(file_get_contents(__DIR__."/fixtures/hmac-drbg-nist.json"), true);
        $cases = array();
        for($i = 0; $i < count($data); ++$i) {
            $cases[ $data[$i]["name"] ] = [ $data[$i] ];
        }
        return $cases;
    }
}
