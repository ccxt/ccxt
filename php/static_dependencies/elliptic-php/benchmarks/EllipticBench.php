<?php
assert_options(ASSERT_ACTIVE, 0);
require __DIR__ . "/../vendor/autoload.php";

/**
 * @BeforeMethods({"init"})
 *
 * @Iterations(5)
 * @Revs(50)
 * @OutputTimeUnit("seconds")
 * @OutputMode("throughput")
 */
class EllipticBench {
    private $ec;
    private $keys;
    private $hash;

    static $msg = [ 0xB, 0xE, 0xE, 0xF ];

    public function init() {
        $this->ec = new \Elliptic\EC('secp256k1');
        $this->priv = $this->ec->genKeyPair();
        $this->pub  = $this->priv->getPublic();
        $this->hash = hash('sha256', 'hello world');
        $this->sign = $this->priv->sign($this->hash);
        $this->priv2 = $this->ec->genKeyPair();
        $this->pub2  = $this->priv2->getPublic();

        $this->ed25519 = new \Elliptic\EdDSA('ed25519');
        $secret = array_fill(0, 32, 0);
        $this->edkey = $this->ed25519->keyFromSecret($secret);
        $this->edsig = $this->edkey->sign(self::$msg);
    }

    public function benchGenKeyPair() {
        $this->ec->genKeyPair();
    }

    public function benchGenKeyPairWithPublicKey() {
        $priv = $this->ec->genKeyPair();
        $pub  = $priv->getPublic();
    }

    public function benchSign() {
        $this->priv->sign($this->hash);
    }

    public function benchVerify() {
        if ( !$this->ec->verify($this->hash, $this->sign, $this->pub) )
            throw new \Exception("unexpected");
    }

    public function benchDH() {
        $this->priv->derive($this->pub2);
    }

    public function benchEdDSASign() {
        $this->edkey->sign(self::$msg);
    }

    public function benchEdDSAVerify() {
        if ( !$this->edkey->verify(self::$msg, $this->edsig) )
            throw new \Exception("unexpected");
    }
}
