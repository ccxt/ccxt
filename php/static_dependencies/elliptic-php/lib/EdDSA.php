<?php
namespace Elliptic;

use Elliptic\EdDSA\KeyPair;
use Elliptic\EdDSA\Signature;
use BN\BN;

class EdDSA {
    
    public $curve;
    public $g;
    public $pointClass;
    public $encodingLength;
    public $hash;
    
    function __construct($curve) {
        assert($curve == "ed25519"); //, 'only tested with ed25519 so far');

        $curve = \Elliptic\Curves::getCurve($curve)->curve;
        $this->curve = $curve;
        $this->g = $curve->g;
        $this->g->precompute($curve->n->bitLength() + 1);

        $this->pointClass = get_class($curve->point());
        $this->encodingLength = intval(ceil($curve->n->bitLength() / 8));
        // TODO: !!!
        $this->hash = [ "algo" => "sha512" ];
    }

    /**
     * @param {Array|String} message - message bytes
     * @param {Array|String|KeyPair} secret - secret bytes or a keypair
     * @returns {Signature} - signature
     */
    public function sign($message, $secret) {
        $message = Utils::parseBytes($message);
        $key = $this->keyFromSecret($secret);
        $r = $this->hashInt($key->messagePrefix(), $message);
        $R = $this->g->mul($r);
        $Rencoded = $this->encodePoint($R);
        $s_ = $this->hashInt($Rencoded, $key->pubBytes(), $message)
            ->mul($key->priv());
        $S = $r->add($s_)->umod($this->curve->n);
        return $this->makeSignature([ "R" => $R, "S" => $S, "Rencoded" => $Rencoded ]);
    }

    /**
     * @param {Array|String} message - message bytes
     * @param {Array|String|KeyPair} secret - secret bytes or a keypair
     * @returns {Signature} - signature
     */
    public function signModified($message, $secret) {
        $message = Utils::parseBytes($message);
        $key = $this->keyFromSecret($secret);
        // convert between curve25519 and ed25519 keys
        $secret_le = new BN($key->secret(), 16, 'le');
        $pubkey = $this->encodePoint($this->g->mul($secret_le));
        $sign_bit = $pubkey[31] & 0x80;
        $r = $this->hashInt($key->secret(), $message);
        $R = $this->g->mul($r);
        $Rencoded = $this->encodePoint($R);
        $s_ = $this->hashInt($Rencoded, $pubkey, $message);
        $s_ = $s_->mul($secret_le);
        $S = $r->add($s_)->umod($this->curve->n);
        $Sencoded = $S->toArray('le');
        $Sencoded[31] |= $sign_bit;
        return $this->makeSignature([ "R" => $R, "S" => $S, "Rencoded" => $Rencoded, "Sencoded" => $Sencoded ]);
    }

    /**
     * @param {Array} message - message bytes
     * @param {Array|String|Signature} sig - sig bytes
     * @param {Array|String|Point|KeyPair} pub - public key
     * @returns {Boolean} - true if public key matches sig of message
     */
    public function verify($message, $sig, $pub) {
        $message = Utils::parseBytes($message);
        $sig = $this->makeSignature($sig);
        $key = $this->keyFromPublic($pub);
        $h = $this->hashInt($sig->Rencoded(), $key->pubBytes(), $message);
        $SG = $this->g->mul($sig->S());
        $RplusAh = $sig->R()->add($key->pub()->mul($h));
        return $RplusAh->eq($SG);
    }

    public function hashInt() {
        $arguments = func_get_args();
        // TODO: refactor when hash-php is ready
        $hash = hash_init($this->hash["algo"]);
        for ($i = 0; $i < count($arguments); $i++)
            hash_update($hash, Utils::toBin($arguments[$i]));
        return Utils::intFromLE(hash_final($hash))->umod($this->curve->n);
    }

    public function keyFromPublic($pub) {
        return KeyPair::fromPublic($this, $pub);
    }

    public function keyFromSecret($secret) {
        return KeyPair::fromSecret($this, $secret);
    }

    public function makeSignature($sig) {
        if ($sig instanceof Signature)
            return $sig;
        return new Signature($this, $sig);
    }

    /**
    * * https://tools.ietf.org/html/draft-josefsson-eddsa-ed25519-03#section-5.2
    *
    * EdDSA defines methods for encoding and decoding points and integers. These are
    * helper convenience methods, that pass along to utility functions implied
    * parameters.
    *
    */
    public function encodePoint($point) {
        $enc = $point->getY()->toArray('le', $this->encodingLength);
        $enc[$this->encodingLength - 1] |= $point->getX()->isOdd() ? 0x80 : 0;
        return $enc;
    }

    public function decodePoint($bytes) {
        $bytes = Utils::parseBytes($bytes);

        $lastIx = count($bytes) - 1;
        $normed = $bytes;
        $normed[$lastIx] = $bytes[$lastIx] & ~0x80;
        $xIsOdd = ($bytes[$lastIx] & 0x80) !== 0;

        $y = Utils::intFromLE($normed);
        return $this->curve->pointFromY($y, $xIsOdd);
    }

    public function encodeInt($num) {
        return $num->toArray('le', $this->encodingLength);
    }

    public function decodeInt($bytes) {
        return Utils::intFromLE($bytes);
    }

    public function isPoint($val) {
        return is_a($val, $this->pointClass);
    }
}
