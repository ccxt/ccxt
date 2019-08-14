<?php

namespace Elliptic\Curve\MontCurve;

use BN\BN;

class Point extends \Elliptic\Curve\BaseCurve\Point
{
    public $x;
    public $z;

    function __construct($curve, $x, $z)
    {
        parent::__construct($curve, "projective");
        if( $x == null && $z == null )
        {
            $this->x = $this->curve->one;
            $this->z = $this->curve->zero;
        }
        else
        {
            $this->x = new BN($x, 16);
            $this->z = new BN($z, 16);
            if( !$this->x->red )
                $this->x = $this->x->toRed($this->curve->red);
            if( !$this->z->red )
                $this->z = $this->z->toRed($this->curve->red);
        }
    }

    public function precompute($power = null) {
        // No-op
    }

    protected function _encode($compact) {
        return $this->getX()->toArray("be", $this->curve->p->byteLength());
    }

    public static function fromJSON($curve, $obj) {
        return new Point($curve, $obj[0], isset($obj[1]) ? $obj[1] : $curve->one);
    }

    public function inspect()
    {
        if( $this->isInfinity() )
            return "<EC Point Infinity>";
        return "<EC Point x: " . $this->x->fromRed()->toString(16, 2) .
            " z: " . $this->z->fromRed()->toString(16, 2) + ">";
    }

    public function isInfinity() {
        // XXX This code assumes that zero is always zero in red
        return $this->z->isZero();
    }

    public function dbl()
    {
        // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
        // 2M + 2S + 4A

        // A = X1 + Z1
        $a = $this->x->redAdd($this->z);
        // AA = A^2
        $aa = $a->redSqr();
        // B = X1 - Z1
        $b = $this->x->redSub($this->z);
        // BB = B^2
        $bb = $b->redSqr();
        // C = AA - BB
        $c = $aa->redSub($bb);
        // X3 = AA * BB
        $nx = $aa->redMul($bb);
        // Z3 = C * (BB + A24 * C)
        $nz = $c->redMul( $bb->redAdd($this->curve->a24->redMul($c)) );
        return $this->curve->point($nx, $nz);
    }

    public function add($p) {
        throw new \Exception('Not supported on Montgomery curve');
    }

    public function diffAdd($p, $diff)
    {
        // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
        // 4M + 2S + 6A

        // A = X2 + Z2
        $a = $this->x->redAdd($this->z);
        // B = X2 - Z2
        $b = $this->x->redSub($this->z);
        // C = X3 + Z3
        $c = $p->x->redAdd($p->z);
        // D = X3 - Z3
        $d = $p->x->redSub($p->z);
        // DA = D * A
        $da = $d->redMul($a);
        // CB = C * B
        $cb = $c->redMul($b);
        // X5 = Z1 * (DA + CB)^2
        $nx = $diff->z->redMul($da->redAdd($cb)->redSqr());
        // Z5 = X1 * (DA - CB)^2
        $nz = $diff->x->redMul($da->redSub($cb)->redSqr());

        return $this->curve->point($nx, $nz);
    }

    public function mul($k)
    {
        $t = $k->_clone();
        $a = $this; // (N / 2) * Q + Q
        $b = $this->curve->point(null, null); // (N / 2) * Q
        $c = $this; // Q

        $bits = array();
        while( !$t->isZero() )
        {
            // TODO: Maybe it is faster to use toString(2)?
            array_push($bits, $t->andln(1));
            $t->iushrn(1);
        }

        for($i = count($bits) - 1; $i >= 0; $i--)
        {
            if( $bits[$i] === 0 )
            {
                // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
                $a = $a->diffAdd($b, $c);
                // N * Q = 2 * ((N / 2) * Q + Q))
                $b = $b->dbl();
            }
            else
            {
                // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
                $b = $a->diffAdd($b, $c);
                // N * Q + Q = 2 * ((N / 2) * Q + Q)
                $a = $a->dbl();
            }
        }

        return $b;
    }

    public function eq($other) {
        return $this->getX()->cmp($other->getX()) === 0;
    }

    public function normalize()
    {
        $this->x = $this->x->redMul($this->z->redInvm());
        $this->z = $this->curve->one;
        return $this;
    }

    public function getX() {
        $this->normalize();
        return $this->x->fromRed();
    }
}

?>
