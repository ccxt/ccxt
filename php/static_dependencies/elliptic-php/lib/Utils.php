<?php

namespace Elliptic;

use \Exception;
use BN\BN;

class Utils
{
    public static function toArray($msg, $enc = false)
    {
        if( is_array($msg) )
            return array_slice($msg, 0);

        if( !$msg )
            return array();

        if( !is_string($msg) )
            throw new Exception("Not implemented");

        if( !$enc )
            return array_slice(unpack("C*", $msg), 0);

        if( $enc === "hex" )
            return array_slice(unpack("C*", hex2bin($msg)), 0);

        return $msg;
    }

    public static function toHex($msg)
    {
        if( is_string($msg) )
            return bin2hex($msg);

        if( !is_array($msg) )
            throw new Exception("Not implemented");

        $binary = call_user_func_array("pack", array_merge(["C*"], $msg)); 
        return bin2hex($binary);
    }

    public static function toBin($msg, $enc = false)
    {
        if( is_array($msg) )
            return call_user_func_array("pack", array_merge(["C*"], $msg)); 

        if( $enc === "hex" )
            return hex2bin($msg);

        return $msg;
    }

    public static function encode($arr, $enc)
    {
        if( $enc === "hex" )
            return self::toHex($arr);
        return $arr;
    }

    // Represent num in a w-NAF form
    public static function getNAF($num, $w)
    {
        $naf = array();
        $ws = 1 << ($w + 1);
        $k = clone($num);

        while( $k->cmpn(1) >= 0 )
        {
            if( !$k->isOdd() )
                array_push($naf, 0);
            else
            {
                $mod = $k->andln($ws - 1);
                $z = $mod;
                if( $mod > (($ws >> 1) - 1))
                    $z = ($ws >> 1) - $mod;
                $k->isubn($z);
                array_push($naf, $z);
            }

            // Optimization, shift by word if possible
            $shift = (!$k->isZero() && $k->andln($ws - 1) === 0) ? ($w + 1) : 1;
            for($i = 1; $i < $shift; $i++)
                array_push($naf, 0);
            $k->iushrn($shift);
        }

        return $naf;
    }

    // Represent k1, k2 in a Joint Sparse Form
    public static function getJSF($k1, $k2)
    {
        $jsf = array( array(), array() );
        $k1 = $k1->_clone();
        $k2 = $k2->_clone();
        $d1 = 0;
        $d2 = 0;

        while( $k1->cmpn(-$d1) > 0 || $k2->cmpn(-$d2) > 0 )
        {
            // First phase
            $m14 = ($k1->andln(3) + $d1) & 3;
            $m24 = ($k2->andln(3) + $d2) & 3;
            if( $m14 === 3 )
                $m14 = -1;
            if( $m24 === 3 )
                $m24 = -1;

            $u1 = 0;
            if( ($m14 & 1) !== 0 )
            {
                $m8 = ($k1->andln(7) + $d1) & 7;
                $u1 = ( ($m8 === 3 || $m8 === 5) && $m24 === 2 ) ? -$m14 : $m14;
            }
            array_push($jsf[0], $u1);

            $u2 = 0;
            if( ($m24 & 1) !== 0 )
            {
                $m8 = ($k2->andln(7) + $d2) & 7;
                $u2 = ( ($m8 === 3 || $m8 === 5) && $m14 === 2 ) ? -$m24 : $m24;
            }
            array_push($jsf[1], $u2);

            // Second phase
            if( (2 * $d1) === ($u1 + 1) )
                $d1 = 1 - $d1;
            if( (2 * $d2) === ($u2 + 1) )
                $d2 = 1 - $d2;
            $k1->iushrn(1);
            $k2->iushrn(1);
        }

        return $jsf;
    }

    public static function intFromLE($bytes) {
        return new BN($bytes, 'hex', 'le');
    }

    public static function parseBytes($bytes) {
        if (is_string($bytes))
            return self::toArray($bytes, 'hex');
        return $bytes;
    }

    public static function randBytes($count)
    {
        $res = "";
        for($i = 0; $i < $count; $i++)
            $res .= chr(rand(0, 255));
        return $res;
    }

    public static function optionAssert(&$array, $key, $value = false, $required = false)
    {
        if( isset($array[$key]) )
            return;
        if( $required )
            throw new Exception("Missing option " . $key);
        $array[$key] = $value;
    }
}

?>
