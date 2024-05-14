<?php

namespace Elliptic\Curve\ShortCurve;

use JsonSerializable;
use BN\BN;

class Point extends \Elliptic\Curve\BaseCurve\Point implements JsonSerializable
{
    public $x;
    public $y;
    public $inf;

    function __construct($curve, $x, $y, $isRed)
    {
        parent::__construct($curve, 'affine');

        if( $x == null && $y == null )
        {
            $this->x = null;
            $this->y = null;
            $this->inf = true;
        }
        else
        {
            $this->x = new BN($x, 16);
            $this->y = new BN($y, 16);
            // Force redgomery representation when loading from JSON
            if( $isRed )
            {
                $this->x->forceRed($this->curve->red);
                $this->y->forceRed($this->curve->red);
            }

            if( !$this->x->red )
                $this->x = $this->x->toRed($this->curve->red);
            if( !$this->y->red )
                $this->y = $this->y->toRed($this->curve->red);
            $this->inf = false;
        }
    }

    public function _getBeta()
    {
        if( !isset($this->curve->endo) )
            return null;

        if( isset($this->precomputed) && isset($this->precomputed["beta"]) )
            return $this->precomputed["beta"];

        $beta = $this->curve->point($this->x->redMul($this->curve->endo["beta"]), $this->y);
        if( isset($this->precomputed) )
        {
            $endoMul = function($p) {
                return $this->curve->point($p->x->redMul($this->curve->endo["beta"]), $p->y);
            };
            $beta->precomputed = array(
                "beta" => null,
                "naf" => null,
                "doubles" => null
            );

            if( isset($this->precomputed["naf"]) )
            {
                $beta->precomputed["naf"] = array(
                    "wnd" => $this->precomputed["naf"]["wnd"],
                    "points" => array_map($endoMul, $this->precomputed["naf"]["points"])
                );
            }

            if( isset($this->precomputed["doubles"]) )
            {
                $beta->precomputed["doubles"] = array(
                    "step" => $this->precomputed["doubles"]["step"],
                    "points" => array_map($endoMul, $this->precomputed["doubles"]["points"])
                );
            }
            $this->precomputed["beta"] = $beta;
        }
        return $beta;
    }

    //toJSON()
    #[\ReturnTypeWillChange]
    public function jsonSerialize()
    {
        $res = array($this->x, $this->y);

        if( !isset($this->precomputed) )
            return $res;

        $pre = array();
        $addPre = false;
        if( isset($this->precomputed["doubles"]) )
        {
            $pre["doubles"] = array(
                "step" => $this->precomputed["doubles"]["step"],
                "points" => array_slice($this->precomputed["doubles"]["points"], 1)
            );
            $addPre = true;
        }

        if( isset($this->precomputed["naf"]) )
        {
            $pre["naf"] = array(
                "naf" => $this->precomputed["naf"]["wnd"],
                "points" => array_slice($this->precomputed["naf"]["points"], 1)
            );
            $addPre = true;
        }

        if( $addPre )
            array_push($res, $pre);

        return $res;
    }

    public static function fromJSON($curve, $obj, $red)
    {
        if( is_string($obj) )
            $obj = json_decode($obj);

        $point = $curve->point($obj[0], $obj[1], $red);
        if( count($obj) === 2 )
            return $point;

        $pre = $obj[2];
        $point->precomputed = array("beta" => null);
        $obj2point = function($obj) use ($curve, $red) {
            return $curve->point($obj[0], $obj[1], $red);
        };

        if( isset($pre["doubles"]) )
        {
            $tmp = array_map($obj2point, $pre["doubles"]["points"]);
            array_unshift($tmp, $point);
            $point->precomputed["doubles"] = array(
                "step" => $pre["doubles"]["step"],
                "points" => $tmp
            );
        }

        if( isset($pre["naf"]) )
        {
            $tmp = array_map($obj2point, $pre["naf"]["points"]);
            array_unshift($tmp, $point);
            $point->precomputed["naf"] = array(
                "wnd" => $pre["naf"]["wnd"],
                "points" => $tmp
            );
        }

        return $point;
    }

    public function inspect()
    {
        if( $this->isInfinity() )
            return "<EC Point Infinity>";

        return "<EC Point x: " . $this->x->fromRed()->toString(16, 2) .
            " y: " . $this->y->fromRed()->toString(16, 2) . ">";
    }

    public function __debugInfo() {
        return [
            "EC Point" => ($this->isInfinity() ?
                "Infinity" :
                [
                    "x" => $this->x->fromRed()->toString(16, 2),
                    "y" => $this->y->fromRed()->toString(16, 2)
                ])
        ];
    }
    public function isInfinity() {
        return $this->inf;
    }

    public function add($point)
    {
        // O + P = P
        if( $this->inf )
            return $point;

        // P + O = P
        if( $point->inf )
            return $this;

        // P + P = 2P
        if( $this->eq($point) )
            return $this->dbl();

        // P + (-P) = O
        if( $this->neg()->eq($point) )
            return $this->curve->point(null, null);

        // P + Q = O
        if( $this->x->cmp($point->x) === 0 )
            return $this->curve->point(null, null);

        $c = $this->y->redSub($point->y);
        if( ! $c->isZero() )
            $c = $c->redMul($this->x->redSub($point->x)->redInvm());
        $nx = $c->redSqr()->redISub($this->x)->redISub($point->x);
        $ny = $c->redMul($this->x->redSub($nx))->redISub($this->y);

        return $this->curve->point($nx, $ny);
    }

    public function dbl()
    {
        if( $this->inf )
            return $this;

        // 2P = 0
        $ys1 = $this->y->redAdd($this->y);
        if( $ys1->isZero() )
            return $this->curve->point(null, null);

        $x2 = $this->x->redSqr();
        $dyinv = $ys1->redInvm();
        $c = $x2->redAdd($x2)->redIAdd($x2)->redIAdd($this->curve->a)->redMul($dyinv);

        $nx = $c->redSqr()->redISub($this->x->redAdd($this->x));
        $ny = $c->redMul($this->x->redSub($nx))->redISub($this->y);

        return $this->curve->point($nx, $ny);
    }

    public function getX() {
        return $this->x->fromRed();
    }

    public function getY() {
        return $this->y->fromRed();
    }

    public function mul($k)
    {
        $k = new BN($k, 16);

        if( $this->_hasDoubles($k) )
            return $this->curve->_fixedNafMul($this, $k);
        elseif( isset($this->curve->endo) )
            return $this->curve->_endoWnafMulAdd(array($this), array($k));

        return $this->curve->_wnafMul($this, $k);
    }

    public function mulAdd($k1, $p2, $k2, $j = false)
    {
        $points = array($this, $p2);
        $coeffs = array($k1, $k2);

        if( isset($this->curve->endo) )
            return $this->curve->_endoWnafMulAdd($points, $coeffs, $j);

        return $this->curve->_wnafMulAdd(1, $points, $coeffs, 2, $j);
    }

    public function jmulAdd($k1, $p2, $k2) {
        return $this->mulAdd($k1, $p2, $k2, true);
    }

    public function eq($point)
    {
        return (
            $this === $point ||
            $this->inf === $point->inf &&
            ($this->inf || $this->x->cmp($point->x) === 0 && $this->y->cmp($point->y) === 0)
        );
    }

    public function neg($precompute = false)
    {
        if( $this->inf )
            return $this;

        $res = $this->curve->point($this->x, $this->y->redNeg());
        if( $precompute && isset($this->precomputed) )
        {
            $res->precomputed = array();
            $pre = $this->precomputed;
            $negate = function($point) {
                return $point->neg();
            };

            if( isset($pre["naf"]) )
            {
                $res->precomputed["naf"] = array(
                    "wnd" => $pre["naf"]["wnd"],
                    "points" => array_map($negate, $pre["naf"]["points"])
                );
            }

            if( isset($pre["doubles"]) )
            {
                $res->precomputed["doubles"] = array(
                    "step" => $pre["doubles"]["step"],
                    "points" => array_map($negate, $pre["doubles"]["points"])
                );
            }

        }
        return $res;
    }

    public function toJ()
    {
        if( $this->inf )
            return $this->curve->jpoint(null, null, null);

        return $this->curve->jpoint($this->x, $this->y, $this->curve->one);
    }
}

?>
