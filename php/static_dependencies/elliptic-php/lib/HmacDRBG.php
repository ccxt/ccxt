<?php

namespace Elliptic;

class HmacDRBG
{
    private $hash;
    private $predResist;
    private $outLen;
    private $minEntropy;
    private $reseed;
    private $reseedInterval;
    private $K;
    private $V;

    function __construct($options)
    {
        Utils::optionAssert($options, "predResist");
        Utils::optionAssert($options, "hash", null, true);
        Utils::optionAssert($options["hash"], "outSize", null, true);
        Utils::optionAssert($options["hash"], "hmacStrength", null, true);
        Utils::optionAssert($options["hash"], "algo", null, true);
        Utils::optionAssert($options, "minEntropy");
        Utils::optionAssert($options, "entropy", null, true);
        Utils::optionAssert($options, "entropyEnc");
        Utils::optionAssert($options, "nonce", "");
        Utils::optionAssert($options, "nonceEnc");
        Utils::optionAssert($options, "pers", "");
        Utils::optionAssert($options, "persEnc");

        $this->hash = $options["hash"];
        $this->predResist = $options["predResist"];

        $this->outLen = $this->hash["outSize"];
        $this->minEntropy = $options["minEntropy"] ?: $this->hash["hmacStrength"];

        $this->reseed = null;
        $this->reseedInterval = null;
        $this->K = null;
        $this->V = null;

        $entropy  = Utils::toBin($options["entropy"], $options["entropyEnc"]);
        $nonce  = Utils::toBin($options["nonce"], $options["nonceEnc"]);
        $pers  = Utils::toBin($options["pers"], $options["persEnc"]);
        
        if (assert_options(ASSERT_ACTIVE)) {
            assert(strlen($entropy) >= ($this->minEntropy / 8));
        }
        $this->_init($entropy, $nonce, $pers);
    }

    private function _init($entropy, $nonce, $pers)
    {
        $seed = $entropy . $nonce . $pers;

        $this->K = str_repeat(chr(0x00), $this->outLen / 8);
        $this->V = str_repeat(chr(0x01), $this->outLen / 8);

        $this->_update($seed);
        $this->reseed = 1;
        $this->reseedInterval = 0x1000000000000; // 2^48
    }

    private function _hmac()
    {
        return hash_init($this->hash["algo"], HASH_HMAC, $this->K);
    }

    private function _update($seed = false)
    {
        $kmac = $this->_hmac();
        hash_update($kmac, $this->V);
        hash_update($kmac, chr(0x00));

        if( $seed )
            hash_update($kmac, $seed);
        $this->K = hash_final($kmac, true);

        $kmac = $this->_hmac();
        hash_update($kmac, $this->V);
        $this->V = hash_final($kmac, true);

        if(!$seed)
            return;

        $kmac = $this->_hmac();
        hash_update($kmac, $this->V);
        hash_update($kmac, chr(0x01));
            hash_update($kmac, $seed);
        $this->K = hash_final($kmac, true);

        $kmac = $this->_hmac();
        hash_update($kmac, $this->V);
        $this->V = hash_final($kmac, true);        
    }

    // TODO: reseed()

    public function generate($len, $enc = null, $add = null, $addEnc = null)
    {
        if ($this->reseed > $this->reseedInterval)
            throw new \Exception("Reseed is required");

        // Optional encoding
        if( !is_string($enc) )
        {
            $addEnc = $enc;
            $add = $enc;
            $enc = null;
        }

        // Optional additional data
        if( $add != null ) {
            $add = Utils::toBin($add, $addEnc);
            $this->_update($add);
        }

        $temp = "";
        while( strlen($temp) < $len )
        {
            $hmac = $this->_hmac();
            hash_update($hmac, $this->V);
            $this->V = hash_final($hmac, true);
            $temp .= $this->V;
        }

        $res = substr($temp, 0, $len);
        $this->_update($add);
        $this->reseed++;

        return Utils::encode(Utils::toArray($res), $enc);
    }
}

?>
