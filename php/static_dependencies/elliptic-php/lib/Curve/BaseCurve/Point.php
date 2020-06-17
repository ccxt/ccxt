<?php

namespace Elliptic\Curve\BaseCurve;

use Elliptic\Utils;

abstract class Point
{
    public $curve;
    public $type;
    public $precomputed;

    function __construct($curve, $type)
    {
        $this->curve = $curve;
        $this->type = $type;
        $this->precomputed = null;
    }

    abstract public function eq($other);

    public function validate() {
        return $this->curve->validate($this);
    }

    public function encodeCompressed($enc) {
        return $this->encode($enc, true);
    }

    public function encode($enc, $compact = false) {
        return Utils::encode($this->_encode($compact), $enc);
    }

    protected function _encode($compact)
    {
        $len = $this->curve->p->byteLength();
        $x = $this->getX()->toArray("be", $len);

        if( $compact )
        {
            array_unshift($x, ($this->getY()->isEven() ? 0x02 : 0x03));
            return $x;
        }

        return array_merge(array(0x04), $x, $this->getY()->toArray("be", $len));
    }

    public function precompute($power = null)
    {
        if( isset($this->precomputed) )
            return $this;

        $this->precomputed = array(
            "naf" => $this->_getNAFPoints(8),
            "doubles" => $this->_getDoubles(4, $power),
            "beta" => $this->_getBeta()
        );

        return $this;
    }

    protected function _hasDoubles($k)
    {
        if( !isset($this->precomputed) || !isset($this->precomputed["doubles"]) )
            return false;

        return count($this->precomputed["doubles"]["points"]) >= ceil(($k->bitLength() + 1) / $this->precomputed["doubles"]["step"]);
    }

    public function _getDoubles($step = null, $power = null)
    {
        if( isset($this->precomputed) && isset($this->precomputed["doubles"]) )
            return $this->precomputed["doubles"];

        $doubles = array( $this );
        $acc = $this;
        for($i = 0; $i < $power; $i += $step)
        {
            for($j = 0; $j < $step; $j++)
                $acc = $acc->dbl();
            array_push($doubles, $acc);
        }

        return array(
            "step" => $step,
            "points" => $doubles
        );
    }

    public function _getNAFPoints($wnd)
    {
        if( isset($this->precomputed) && isset($this->precomputed["naf"]) )
            return $this->precomputed["naf"];

        $res = array( $this );
        $max = (1  << $wnd) - 1;
        $dbl = $max === 1 ? null : $this->dbl();
        for($i = 1; $i < $max; $i++)
            array_push($res, $res[$i - 1]->add($dbl));

        return array(
            "wnd" => $wnd,
            "points" => $res
        );
    }

    public function _getBeta() {
        return null;
    }

    public function dblp($k)
    {
        $r = $this;
        for($i = 0; $i < $k; $i++)
            $r = $r->dbl();
        return $r;
    }
}

?>
