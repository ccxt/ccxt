<?php
namespace Elliptic\Curve;

use Elliptic\Curve\EdwardsCurve\Point;
use BN\BN;

class EdwardsCurve extends BaseCurve
{
    public $twisted;
    public $mOneA;
    public $extended;
    public $a;
    public $c;
    public $c2;
    public $d;
    public $d2;
    public $dd;
    public $oneC;
    
    function __construct($conf)
    {
        // NOTE: Important as we are creating point in Base.call()
        $this->twisted = ($conf["a"] | 0) != 1;
        $this->mOneA = $this->twisted && ($conf["a"] | 0) == -1;
        $this->extended = $this->mOneA;
        parent::__construct("edward", $conf);

        $this->a = (new BN($conf["a"], 16))->umod($this->red->m);
        $this->a = $this->a->toRed($this->red);
        $this->c = (new BN($conf["c"], 16))->toRed($this->red);
        $this->c2 = $this->c->redSqr();
        $this->d = (new BN($conf["d"], 16))->toRed($this->red);
        $this->dd = $this->d->redAdd($this->d);
        if (assert_options(ASSERT_ACTIVE)) {
            assert(!$this->twisted || $this->c->fromRed()->cmpn(1) == 0);
        }
        $this->oneC = ($conf["c"] | 0) == 1;
    }
  
    public function _mulA($num) {
        if ($this->mOneA)
            return $num->redNeg();
        else
            return $this->a->redMul($num);
    }

    public function _mulC($num) {
        if ($this->oneC)
            return $num;
        else
            return $this->c->redMul($num);
    }

    // Just for compatibility with Short curve
    public function jpoint($x, $y, $z, $t = null) {
        return $this->point($x, $y, $z, $t);
    }

    public function pointFromX($x, $odd = false) {
        $x = new BN($x, 16);
        if (!$x->red)
            $x = $x->toRed($this->red);

        $x2 = $x->redSqr();
        $rhs = $this->c2->redSub($this->a->redMul($x2));
        $lhs = $this->one->redSub($this->c2->redMul($this->d)->redMul($x2));

        $y2 = $rhs->redMul($lhs->redInvm());
        $y = $y2->redSqrt();
        if ($y->redSqr()->redSub($y2)->cmp($this->zero) != 0)
            throw new \Exception('invalid point');

        $isOdd = $y->fromRed()->isOdd();
        if ($odd && !$isOdd || !$odd && $isOdd)
            $y = $y->redNeg();

        return $this->point($x, $y);
    }

    public function pointFromY($y, $odd = false) {
        $y = new BN($y, 16);
        if (!$y->red)
            $y = $y->toRed($this->red);

        // x^2 = (y^2 - 1) / (d y^2 + 1)
        $y2 = $y->redSqr();
        $lhs = $y2->redSub($this->one);
        $rhs = $y2->redMul($this->d)->redAdd($this->one);
        $x2 = $lhs->redMul($rhs->redInvm());

        if ($x2->cmp($this->zero) == 0) {
            if ($odd)
                throw new \Exception('invalid point');
            else
                return $this->point($this->zero, $y);
        }

        $x = $x2->redSqrt();
        if ($x->redSqr()->redSub($x2)->cmp($this->zero) != 0)
            throw new \Exception('invalid point');

        if ($x->isOdd() != $odd)
            $x = $x->redNeg();

        return $this->point($x, $y);
    }

    public function validate($point) {
        if ($point->isInfinity())
            return true;

        // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
        $point->normalize();

        $x2 = $point->x->redSqr();
        $y2 = $point->y->redSqr();
        $lhs = $x2->redMul($this->a)->redAdd($y2);
        $rhs = $this->c2->redMul($this->one->redAdd($this->d->redMul($x2)->redMul($y2)));

        return $lhs->cmp($rhs) == 0;
    }

    public function pointFromJSON($obj) {
        return Point::fromJSON($this, $obj);
    }

    public function point($x = null, $y = null, $z = null, $t = null) {
        return new Point($this, $x, $y, $z, $t);
    }
}
