<?php

namespace Elliptic\EC;

use Elliptic\Utils;
use BN\BN;

class Signature
{
    public $r;
    public $s;
    public $recoveryParam;

    function __construct($options, $enc = false)
    {
        if ($options instanceof Signature) {
            $this->r = $options->r;
            $this->s = $options->s;
            $this->recoveryParam = $options->recoveryParam;
            return;
        }
        
        if (isset($options['r'])) {
            assert(isset($options["r"]) && isset($options["s"])); //, "Signature without r or s");
            $this->r = new BN($options["r"], 16);
            $this->s = new BN($options["s"], 16);

            if( isset($options["recoveryParam"]) )
                $this->recoveryParam = $options["recoveryParam"];
            else
                $this->recoveryParam = null;
            return;
        }

        if (!$this->_importDER($options, $enc))
            throw new \Exception('Unknown signature format');

    }

    private static function getLength($buf, &$pos)
    {
        $initial = $buf[$pos++];
        if( !($initial & 0x80) )
            return $initial;

        $octetLen = $initial & 0xf;
        $val = 0;
        for($i = 0; $i < $octetLen; $i++)
        {
            $val = $val << 8;
            $val = $val | $buf[$pos];
            $pos++;
        }
        return $val;
    }

    private static function rmPadding(&$buf)
    {
        $i = 0;
        $len = count($buf) - 1;
        while($i < $len && !$buf[$i] && !($buf[$i+1] & 0x80) )
            $i++;

        if( $i === 0 )
            return $buf;

        return array_slice($buf, $i);
    }

    private function _importDER($data, $enc)
    {
        $data = Utils::toArray($data, $enc);
        $dataLen = count($data);
        $place = 0;

        if( $data[$place++] !== 0x30)
            return false;

        $len = self::getLength($data, $place);
        if( ($len + $place) !== $dataLen )
            return false;

        if( $data[$place++] !== 0x02 )
            return false;

        $rlen = self::getLength($data, $place);
        $r = array_slice($data, $place, $rlen);
        $place += $rlen;

        if( $data[$place++] !== 0x02 )
            return false;

        $slen = self::getLength($data, $place);
        if( $dataLen !== $slen + $place )
            return false;
        $s = array_slice($data, $place, $slen);

        if( $r[0] === 0 && ($r[1] & 0x80 ) )
            $r = array_slice($r, 1);
        if( $s[0] === 0 && ($s[1] & 0x80 ) )
            $s = array_slice($s, 1);

        $this->r = new BN($r);
        $this->s = new BN($s);
        $this->recoveryParam = null;

        return true;
    }

    private static function constructLength(&$arr, $len)
    {
        if( $len < 0x80 )
        {
            array_push($arr, $len);
            return;
        }

        $octets = 1 + (log($len) / M_LN2 >> 3);
        array_push($arr, $octets | 0x80);
        while(--$octets)
            array_push($arr, ($len >> ($octets << 3)) & 0xff);
        array_push($arr, $len);
    }

    public function toDER($enc = false)
    {
        $r = $this->r->toArray();
        $s = $this->s->toArray();

        //Pad values
        if( $r[0] & 0x80 )
            array_unshift($r, 0);
        if( $s[0] & 0x80 )
            array_unshift($s, 0);

        $r = self::rmPadding($r);
        $s = self::rmPadding($s);

        while(!$s[0] && !($s[1] & 0x80))
            array_slice($s, 1);

        $arr = array(0x02);
        self::constructLength($arr, count($r));
        $arr = array_merge($arr, $r, array(0x02));
        self::constructLength($arr, count($s));
        $backHalf = array_merge($arr, $s);
        $res = array(0x30);
        self::constructLength($res, count($backHalf));
        $res = array_merge($res, $backHalf);

        return Utils::encode($res, $enc);
    }
}

?>
