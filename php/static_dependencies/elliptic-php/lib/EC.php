<?php

namespace Elliptic;

use Elliptic\Curve\PresetCurve;
use Elliptic\EC\KeyPair;
use Elliptic\EC\Signature;
use BN\BN;

class EC
{
    public $curve;
    public $n;
    public $nh;
    public $g;
    public $hash;

    function __construct($options)
    {
        if( is_string($options) )
        {
            $options = Curves::getCurve($options);
        }

        if( $options instanceof PresetCurve )
            $options = array("curve" => $options);

        $this->curve = $options["curve"]->curve;
        $this->n = $this->curve->n;
        $this->nh = $this->n->ushrn(1);

        //Point on curve
        $this->g = $options["curve"]->g;
        $this->g->precompute($options["curve"]->n->bitLength() + 1);

        //Hash for function for DRBG
        if( isset($options["hash"]) )
            $this->hash = $options["hash"];
        else
            $this->hash = $options["curve"]->hash;
    }

    public function keyPair($options) {
        return new KeyPair($this, $options);
    }

    public function keyFromPrivate($priv, $enc = false) {
        return KeyPair::fromPrivate($this, $priv, $enc);
    }

    public function keyFromPublic($pub, $enc = false) {
        return KeyPair::fromPublic($this, $pub, $enc);
    }

    public function genKeyPair($options = null)
    {
        // Instantiate HmacDRBG
        $drbg = new HmacDRBG(array(
            "hash" => $this->hash,
            "pers" => isset($options["pers"]) ? $options["pers"] : "",
            "entropy" => isset($options["entropy"]) ? $options["entropy"] : Utils::randBytes($this->hash["hmacStrength"]),
            "nonce" => $this->n->toArray()
        ));

        $bytes = $this->n->byteLength();
        $ns2 = $this->n->sub(new BN(2));
        while(true)
        {
            $priv = new BN($drbg->generate($bytes));
            if( $priv->cmp($ns2) > 0 )
                continue;

            $priv->iaddn(1);
            return $this->keyFromPrivate($priv);
        }
    }

    private function _truncateToN($msg, $truncOnly = false)
    {
        $delta = intval(($msg->byteLength() * 8) - $this->n->bitLength());
        if( $delta > 0 ) {
            $msg = $msg->ushrn($delta);
        }
        if( $truncOnly || $msg->cmp($this->n) < 0 )
            return $msg;

        return $msg->sub($this->n);
    }

    public function sign($msg, $key, $enc = null, $options = null)
    {
        if( !is_string($enc) )
        {
            $options = $enc;
            $enc = null;
        }

        $key = $this->keyFromPrivate($key, $enc);
        $msg = $this->_truncateToN(new BN($msg, 16));

        // Zero-extend key to provide enough entropy
        $bytes = $this->n->byteLength();
        $bkey = $key->getPrivate()->toArray("be", $bytes);

        // Zero-extend nonce to have the same byte size as N
        $nonce = $msg->toArray("be", $bytes);

        $kFunc = null;
        if( isset($options["k"]) )
            $kFunc = $options["k"];
        else
        {
            // Instatiate HmacDRBG
            $drbg = new HmacDRBG(array(
                "hash" => $this->hash,
                "entropy" => $bkey,
                "nonce" => $nonce,
                "pers" => isset($options["pers"]) ? $options["pers"] : "",
                "persEnc" => isset($options["persEnc"]) ? $options["persEnc"] : false
            ));

            $kFunc = function($iter) use ($drbg, $bytes) {
                return new BN($drbg->generate($bytes));
            };
        }

        // Number of bytes to generate
        $ns1 = $this->n->sub(new BN(1));

        $canonical = isset($options["canonical"]) ? $options["canonical"] : false;
        for($iter = 0; true; $iter++)
        {
            $k = $kFunc($iter);
            $k = $this->_truncateToN($k, true);

            if( $k->cmpn(1) <= 0 || $k->cmp($ns1) >= 0 )
                continue;

            $kp = $this->g->mul($k);
            if( $kp->isInfinity() )
                continue;

            $kpX = $kp->getX();
            $r = $kpX->umod($this->n);
            if( $r->isZero() )
                continue;

            $s = $k->invm($this->n)->mul($r->mul($key->getPrivate())->iadd($msg));
            $s = $s->umod($this->n);
            if( $s->isZero() )
                continue;

            $recoveryParam = ($kp->getY()->isOdd() ? 1 : 0) | ($kpX->cmp($r) !== 0 ? 2 : 0);

            // Use complement of `s`, if it is > `n / 2`
            if( $canonical && $s->cmp($this->nh) > 0 )
            {
                $s = $this->n->sub($s);
                $recoveryParam ^= 1;
            }

            return new Signature(array(
                "r" => $r,
                "s" => $s,
                "recoveryParam" => $recoveryParam
            ));
        }
    }

    public function verify($msg, $signature, $key, $enc = false)
    {
        $msg = $this->_truncateToN(new BN($msg, 16));
        $key = $this->keyFromPublic($key, $enc);
        $signature = new Signature($signature, "hex");

        // Perform primitive values validation
        $r = $signature->r;
        $s = $signature->s;

        if( $r->cmpn(1) < 0 || $r->cmp($this->n) >= 0 )
            return false;
        if( $s->cmpn(1) < 0 || $s->cmp($this->n) >= 0 )
            return false;

        // Validate signature
        $sinv = $s->invm($this->n);
        $u1 = $sinv->mul($msg)->umod($this->n);
        $u2 = $sinv->mul($r)->umod($this->n);

        if( !$this->curve->_maxwellTrick )
        {
            $p = $this->g->mulAdd($u1, $key->getPublic(), $u2);
            if( $p->isInfinity() )
                return false;

            return $p->getX()->umod($this->n)->cmp($r) === 0;
        }

        // NOTE: Greg Maxwell's trick, inspired by:
        // https://git.io/vad3K

        $p = $this->g->jmulAdd($u1, $key->getPublic(), $u2);
        if( $p->isInfinity() )
            return false;

        // Compare `p.x` of Jacobian point with `r`,
        // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
        // inverse of `p.z^2`
        return $p->eqXToP($r);
    }

    public function recoverPubKey($msg, $signature, $j, $enc = false)
    {
        assert((3 & $j) === $j); //, "The recovery param is more than two bits");
        $signature = new Signature($signature, $enc);

        $e = new BN($msg, 16);
        $r = $signature->r;
        $s = $signature->s;

        // A set LSB signifies that the y-coordinate is odd
        $isYOdd = ($j & 1) == 1;
        $isSecondKey = $j >> 1;

        if ($r->cmp($this->curve->p->umod($this->curve->n)) >= 0 && $isSecondKey)
            throw new \Exception("Unable to find second key candinate");

         // 1.1. Let x = r + jn.
         if( $isSecondKey )
            $r = $this->curve->pointFromX($r->add($this->curve->n), $isYOdd);
        else
            $r = $this->curve->pointFromX($r, $isYOdd);

        $eNeg = $this->n->sub($e);

        // 1.6.1 Compute Q = r^-1 (sR -  eG)
        //               Q = r^-1 (sR + -eG)
        $rInv = $signature->r->invm($this->n);
        return $this->g->mulAdd($eNeg, $r, $s)->mul($rInv);
    }

    public function getKeyRecoveryParam($e, $signature, $Q, $enc = false)
    {
        $signature = new Signature($signature, $enc);
        if( $signature->recoveryParam != null )
            return $signature->recoveryParam;

        for($i = 0; $i < 4; $i++)
        {
            $Qprime = null;
            try {
                $Qprime = $this->recoverPubKey($e, $signature, $i);
            }
            catch(\Exception $e) {
                continue;
            }

            if( $Qprime->eq($Q))
                return $i;
        }
        throw new \Exception("Unable to find valid recovery factor");
    }
}

?>
