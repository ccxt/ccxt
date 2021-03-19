<?php

namespace Elliptic\Curve;

use Elliptic\Curve\ShortCurve\Point;
use Elliptic\Curve\ShortCurve\JPoint;
use BN\BN;
use \Exception;

class ShortCurve extends BaseCurve
{
    public $a;
    public $b;
    public $tinv;
    public $zeroA;
    public $threeA;
    public $endo;
    private $_endoWnafT1;
    private $_endoWnafT2;

    function __construct($conf)
    {
        parent::__construct("short", $conf);

        $this->a = (new BN($conf["a"], 16))->toRed($this->red);
        $this->b = (new BN($conf["b"], 16))->toRed($this->red);
        $this->tinv = $this->two->redInvm();

        $this->zeroA = $this->a->fromRed()->isZero();
        $this->threeA = $this->a->fromRed()->sub($this->p)->cmpn(-3) === 0;

        // If curve is endomorphic, precalculate beta and lambda
        $this->endo = $this->_getEndomorphism($conf);
        $this->_endoWnafT1 = array(0,0,0,0);
        $this->_endoWnafT2 = array(0,0,0,0);        
    }

    private function _getEndomorphism($conf)
    {
        // No efficient endomorphism
        if( !$this->zeroA || !isset($this->g) || !isset($this->n) || $this->p->modn(3) != 1 )
            return null;

        // Compute beta and lambda, that lambda * P = (beta * Px; Py)
        $beta = null;
        $lambda = null;
        if( isset($conf["beta"]) )
            $beta = (new BN($conf["beta"], 16))->toRed($this->red);
        else
        {
            $betas = $this->_getEndoRoots($this->p);
            // Choose smallest beta
            $beta = $betas[0]->cmp($betas[1]) < 0 ? $betas[0] : $betas[1];
            $beta = $beta->toRed($this->red);
        }

        if( isset($conf["lambda"]) )
            $lambda = new BN($conf["lambda"], 16);
        else
        {
            // Choose the lambda that is matching selected beta
            $lambdas = $this->_getEndoRoots($this->n);
            if( $this->g->mul($lambdas[0])->x->cmp($this->g->x->redMul($beta)) == 0 )
                $lambda = $lambdas[0];
            else
            {
                $lambda = $lambdas[1];
                if (assert_options(ASSERT_ACTIVE)) {
                    assert($this->g->mul($lambda)->x->cmp($this->g->x->redMul($beta)) === 0);
                }
            }
        }

        // Get basis vectors, used for balanced length-two representation
        $basis = null;
        if( !isset($conf["basis"]) )
            $basis = $this->_getEndoBasis($lambda);
        else
        {
            $callback = function($vector) {
                return array(
                    "a" => new BN($vector["a"], 16),
                    "b" => new BN($vector["b"], 16)
                );
            };
            $basis = array_map($callback, $conf["basis"]);
        }

        return array(
            "beta" => $beta,
            "lambda" => $lambda,
            "basis" => $basis
        );
    }

    private function _getEndoRoots($num)
    {
        // Find roots of for x^2 + x + 1 in F
        // Root = (-1 +- Sqrt(-3)) / 2
        //
        $red = $num === $this->p ? $this->red : BN::mont($num);
        $tinv = (new BN(2))->toRed($red)->redInvm();
        $ntinv = $tinv->redNeg();

        $s = (new BN(3))->toRed($red)->redNeg()->redSqrt()->redMul($tinv);

        return array(
            $ntinv->redAdd($s)->fromRed(),
            $ntinv->redSub($s)->fromRed()
        );
    }

    private function _getEndoBasis($lambda)
    {
        // aprxSqrt >= sqrt(this.n)
        $aprxSqrt = $this->n->ushrn(intval($this->n->bitLength() / 2));

        // 3.74
        // Run EGCD, until r(L + 1) < aprxSqrt
        $u = $lambda;
        $v = $this->n->_clone();
        $x1 = new BN(1);
        $y1 = new BN(0);
        $x2 = new BN(0);
        $y2 = new BN(1);

        // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
        $a0 = 0;
        $b0 = 0;
        // First vector
        $a1 = 0;
        $b1 = 0;
        // Second vector
        $a2 = 0;
        $b2 = 0;

        $prevR = 0;
        $i = 0;
        $r = 0;
        $x = 0;

        while( ! $u->isZero() )
        {
            $q = $v->div($u);
            $r = $v->sub($q->mul($u));
            $x = $x2->sub($q->mul($x1));
            $y = $y2->sub($q->mul($y2));

            if( !$a1 && $r->cmp($aprxSqrt) < 0 )
            {
                $a0 = $prevR->neg();
                $b0 = $x1;
                $a1 = $r->neg();
                $b1 = $x;
            }
            elseif($a1 && ++$i === 2)
                break;

            $prevR = $r;
            $v = $u;
            $u = $r;
            $x2 = $x1;
            $x1 = $x;
            $y2 = $y1;
            $y1 = $y;
        }
        $a2 = $r->neg();
        $b2 = $x;

        $len1 = $a1->sqr()->add($b1->sqr());
        $len2 = $a2->sqr()->add($b2->sqr());
        if( $len2->cmp($len1) >= 0 )
        {
            $a2 = $a0;
            $b2 = $b0;
        }

        // Normalize signs
        if( $a1->negative() )
        {
            $a1 = $a1->neg();
            $b1 = $b1->neg();
        }

        if( $a2->negative() )
        {
            $a2 = $a2->neg();
            $b2 = $b2->neg();
        }

        return array(
            array( "a" => $a1, "b" => $b1 ),
            array( "a" => $a2, "b" => $b2 ),
        );
    }

    public function _endoSplit($k)
    {
        $basis = $this->endo["basis"];
        $v1 = $basis[0];
        $v2 = $basis[1];

        $c1 = $v2["b"]->mul($k)->divRound($this->n);
        $c2 = $v1["b"]->neg()->mul($k)->divRound($this->n);

        $p1 = $c1->mul($v1["a"]);
        $p2 = $c2->mul($v2["a"]);
        $q1 = $c1->mul($v1["b"]);
        $q2 = $c2->mul($v2["b"]);

        //Calculate answer
        $k1 = $k->sub($p1)->sub($p2);
        $k2 = $q1->add($q2)->neg();

        return array( "k1" => $k1, "k2" => $k2 );
    }

    public function pointFromX($x, $odd)
    {
        $x = new BN($x, 16);
        if( !$x->red )
            $x = $x->toRed($this->red);

        $y2 = $x->redSqr()->redMul($x)->redIAdd($x->redMul($this->a))->redIAdd($this->b);
        $y = $y2->redSqrt();
        if( $y->redSqr()->redSub($y2)->cmp($this->zero) !== 0 )
            throw new Exception("Invalid point");

        // XXX Is there any way to tell if the number is odd without converting it
        // to non-red form?
        $isOdd = $y->fromRed()->isOdd();
        if( $odd != $isOdd )
            $y = $y->redNeg();

        return $this->point($x, $y);
    }

    public function validate($point)
    {
        if( $point->inf )
            return true;

        $x = $point->x;
        $y = $point->y;

        $ax = $this->a->redMul($x);
        $rhs = $x->redSqr()->redMul($x)->redIAdd($ax)->redIAdd($this->b);
        return $y->redSqr()->redISub($rhs)->isZero();
    }

    public function _endoWnafMulAdd($points, $coeffs, $jacobianResult = false)
    {
        $npoints = &$this->_endoWnafT1;
        $ncoeffs = &$this->_endoWnafT2;

        for($i = 0; $i < count($points); $i++)
        {
            $split = $this->_endoSplit($coeffs[$i]);
            $p = $points[$i];
            $beta = $p->_getBeta();

            if( $split["k1"]->negative() )
            {
                $split["k1"]->ineg();
                $p =  $p->neg(true);
            }

            if( $split["k2"]->negative() )
            {
                $split["k2"]->ineg();
                $beta = $beta->neg(true);
            }

            $npoints[$i * 2] = $p;
            $npoints[$i * 2 + 1] = $beta;
            $ncoeffs[$i * 2] = $split["k1"];
            $ncoeffs[$i * 2 + 1] = $split["k2"];
        }
        $res = $this->_wnafMulAdd(1, $npoints, $ncoeffs, $i * 2, $jacobianResult);

        // Clean-up references to points and coefficients
        for($j = 0; $j < 2 * $i; $j++)
        {
            $npoints[$j] = null;
            $ncoeffs[$j] = null;
        }

        return $res;
    }

    public function point($x, $y, $isRed = false) {
        return new Point($this, $x, $y, $isRed);
    }

    public function pointFromJSON($obj, $red) {
        return Point::fromJSON($this, $obj, $red);
    }

    public function jpoint($x, $y, $z) {
        return new JPoint($this, $x, $y, $z);
    }
}

?>
