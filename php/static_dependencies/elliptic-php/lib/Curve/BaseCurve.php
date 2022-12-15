<?php

namespace Elliptic\Curve;

use Elliptic\Utils;
use \Exception;
use BN\BN;

abstract class BaseCurve
{
    public $type;
    public $p;
    public $red;
    public $zero;
    public $one;
    public $two;
    public $n;
    public $g;
    protected $_wnafT1;
    protected $_wnafT2;
    protected $_wnafT3;
    protected $_wnafT4;
    public $redN;
    public $_maxwellTrick;

    function __construct($type, $conf)
    {
        $this->type = $type;
        $this->p = new BN($conf["p"], 16);

        //Use Montgomery, when there is no fast reduction for the prime
        $this->red = isset($conf["prime"]) ? BN::red($conf["prime"]) : BN::mont($this->p);

        //Useful for many curves
        $this->zero = (new BN(0))->toRed($this->red);
        $this->one = (new BN(1))->toRed($this->red);
        $this->two = (new BN(2))->toRed($this->red);

        //Curve configuration, optional
        $this->n = isset($conf["n"]) ? new BN($conf["n"], 16) : null;
        $this->g = isset($conf["g"]) ? $this->pointFromJSON($conf["g"], isset($conf["gRed"]) ? $conf["gRed"] : null) : null;

        //Temporary arrays
        $this->_wnafT1 = array(0,0,0,0);
        $this->_wnafT2 = array(0,0,0,0);
        $this->_wnafT3 = array(0,0,0,0);
        $this->_wnafT4 = array(0,0,0,0);

        //Generalized Greg Maxwell's trick
        $adjustCount = $this->n != null ? $this->p->div($this->n) : null;
        if( $adjustCount == null || $adjustCount->cmpn(100) > 0 )
        {
            $this->redN = null;
            $this->_maxwellTrick = false;
        }
        else
        {
            $this->redN = $this->n->toRed($this->red);
            $this->_maxwellTrick = true;
        }
    }

    abstract public function point($x, $z);
    abstract public function validate($point);

    public function _fixedNafMul($p, $k)
    {
        assert(isset($p->precomputed));

        $doubles = $p->_getDoubles();
        $naf = Utils::getNAF($k, 1);
        $I = (1 << ($doubles["step"] + 1)) - ($doubles["step"] % 2 == 0 ? 2 : 1);
        $I = $I / 3;

        //Translate to more windowed form
        $repr = array();
        for($j = 0; $j < count($naf); $j += $doubles["step"])
        {
            $nafW = 0;
            for($k = $j + $doubles["step"] - 1; $k >= $j; $k--)
                $nafW = ($nafW << 1) + (isset($naf[$k]) ? $naf[$k] : 0);
            array_push($repr, $nafW);
        }

        $a = $this->jpoint(null, null, null);
        $b = $this->jpoint(null, null, null);

        for($i = $I; $i > 0; $i--)
        {
            for($j = 0; $j < count($repr); $j++)
            {
                $nafW = $repr[$j];
                if ($nafW == $i) {
                    $b = $b->mixedAdd($doubles["points"][$j]);
                } else if($nafW == -$i) {
                    $b = $b->mixedAdd($doubles["points"][$j]->neg());
                }
            }
            $a = $a->add($b);
        }

        return $a->toP();
    }

    public function _wnafMul($p, $k)
    {
        $w = 4;

        //Precompute window
        $nafPoints = $p->_getNAFPoints($w);
        $w = $nafPoints["wnd"];
        $wnd = $nafPoints["points"];

        //Get NAF form
        $naf = Utils::getNAF($k, $w);

        //Add `this`*(N+1) for every w-NAF index
        $acc = $this->jpoint(null, null, null);
        for($i = count($naf) - 1; $i >= 0; $i--)
        {
            //Count zeros
            for($k = 0; $i >= 0 && $naf[$i] == 0; $i--)
                $k++;

            if($i >= 0)
                $k++;
            $acc = $acc->dblp($k);

            if($i < 0)
                break;
            $z = $naf[$i];

            assert($z != 0);

            if( $p->type == "affine" )
            {
                //J +- P
                if( $z > 0 )
                    $acc = $acc->mixedAdd($wnd[($z - 1) >> 1]);
                else
                    $acc = $acc->mixedAdd($wnd[(-$z - 1) >> 1]->neg());
            }
            else
            {
                //J +- J
                if( $z > 0 )
                    $acc = $acc->add($wnd[($z - 1) >> 1]);
                else
                    $acc = $acc->add($wnd[(-$z - 1) >> 1]->neg());
            }
        }
        return $p->type == "affine" ? $acc->toP() : $acc;
    }

    public function _wnafMulAdd($defW, $points, $coeffs, $len, $jacobianResult = false)
    {
        $wndWidth = &$this->_wnafT1;
        $wnd = &$this->_wnafT2;
        $naf = &$this->_wnafT3;

        //Fill all arrays
        $max = 0;
        for($i = 0; $i < $len; $i++)
        {
            $p = $points[$i];
            $nafPoints = $p->_getNAFPoints($defW);
            $wndWidth[$i] = $nafPoints["wnd"];
            $wnd[$i] = $nafPoints["points"];
        }
        //Comb all window NAFs
        for($i = $len - 1; $i >= 1; $i -= 2)
        {
            $a = $i - 1;
            $b = $i;
            if( $wndWidth[$a] != 1 || $wndWidth[$b] != 1 )
            {
                $naf[$a] = Utils::getNAF($coeffs[$a], $wndWidth[$a]);
                $naf[$b] = Utils::getNAF($coeffs[$b], $wndWidth[$b]);
                $max = max(count($naf[$a]), $max);
                $max = max(count($naf[$b]), $max);
                continue;
            }

            $comb = array(
                $points[$a], /* 1 */
                null,        /* 3 */
                null,        /* 5 */
                $points[$b]  /* 7 */
            );

            //Try to avoid Projective points, if possible
            if( $points[$a]->y->cmp($points[$b]->y) == 0 )
            {
                $comb[1] = $points[$a]->add($points[$b]);
                $comb[2] = $points[$a]->toJ()->mixedAdd($points[$b]->neg());
            }
            elseif( $points[$a]->y->cmp($points[$b]->y->redNeg()) == 0 )
            {
                $comb[1] = $points[$a]->toJ()->mixedAdd($points[$b]);
                $comb[2] = $points[$a]->add($points[$b]->neg());
            }
            else
            {
                $comb[1] = $points[$a]->toJ()->mixedAdd($points[$b]);
                $comb[2] = $points[$a]->toJ()->mixedAdd($points[$b]->neg());
            }
            
            $index = array(
                -3, /* -1 -1 */
                -1, /* -1  0 */
                -5, /* -1  1 */
                -7, /*  0 -1 */
                0,  /*  0  0 */
                7,  /*  0  1 */
                5,  /*  1 -1 */
                1,  /*  1  0 */
                3   /*  1  1 */
            );

            $jsf = Utils::getJSF($coeffs[$a], $coeffs[$b]);
            $max = max(count($jsf[0]), $max);
            if ($max > 0) {
                $naf[$a] = array_fill(0, $max, 0);
                $naf[$b] = array_fill(0, $max, 0);
            } else {
                $naf[$a] = [];
                $naf[$b] = [];
            }

            for($j = 0; $j < $max; $j++)
            {
                $ja = isset($jsf[0][$j]) ? $jsf[0][$j] : 0;
                $jb = isset($jsf[1][$j]) ? $jsf[1][$j] : 0;

                $naf[$a][$j] = $index[($ja + 1) * 3 + ($jb + 1)];
                $naf[$b][$j] = 0;
                $wnd[$a] = $comb;
            }
        }

        $acc = $this->jpoint(null, null, null);
        $tmp = &$this->_wnafT4;
        for($i = $max; $i >= 0; $i--)
        {
            $k = 0;

            while($i >= 0)
            {
                $zero = true;
                for($j = 0; $j < $len; $j++)
                {
                    $tmp[$j] = isset($naf[$j][$i]) ? $naf[$j][$i] : 0;
                    if( $tmp[$j] != 0 )
                        $zero = false;
                }
                if( !$zero )
                    break;
                $k++;
                $i--;
            }

            if( $i >=0 )
                $k++;

            $acc = $acc->dblp($k);
            if( $i < 0 )
                break;

            for($j = 0; $j < $len; $j++)
            {
                $z = $tmp[$j];
                $p = null;
                if( $z == 0 )
                    continue;
                elseif( $z > 0 )
                    $p = $wnd[$j][($z - 1) >> 1];
                elseif( $z < 0 )
                    $p = $wnd[$j][(-$z - 1) >> 1]->neg();

                if( $p->type == "affine" )
                    $acc = $acc->mixedAdd($p);
                else
                    $acc = $acc->add($p);
            }
        }

        //Zeroify references
        for($i = 0; $i < $len; $i++)
            $wnd[$i] = null;

        if( $jacobianResult )
            return $acc;
        else
            return $acc->toP();
    }

    public function decodePoint($bytes, $enc = false)
    {
        $bytes = Utils::toArray($bytes, $enc);
        $len = $this->p->byteLength();

        $count = count($bytes);
        //uncompressed, hybrid-odd, hybrid-even
        if(($bytes[0] == 0x04 || $bytes[0] == 0x06 || $bytes[0] == 0x07) && ($count - 1) == (2 * $len) )
        {
            if( $bytes[0] == 0x06 )
                assert($bytes[$count - 1] % 2 == 0);
            elseif( $bytes[0] == 0x07 )
                assert($bytes[$count - 1] % 2 == 1);

            return $this->point(array_slice($bytes, 1, $len), array_slice($bytes, 1 + $len, $len));
        }

        if( ($bytes[0] == 0x02 || $bytes[0] == 0x03) && ($count - 1) == $len )
            return $this->pointFromX(array_slice($bytes, 1, $len), $bytes[0] == 0x03);

        throw new Exception("Unknown point format");
    }
}

?>
