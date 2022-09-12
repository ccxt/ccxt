<?php

namespace BI;

if (!defined("S_MATH_BIGINTEGER_MODE")) {
    if (extension_loaded("gmp")) {
        define("S_MATH_BIGINTEGER_MODE", "gmp");
    }
    else if (extension_loaded("bcmath")) {
        define("S_MATH_BIGINTEGER_MODE", "bcmath");
    }
    else {
        if (!defined("S_MATH_BIGINTEGER_QUIET")) {
            throw new \Exception("Cannot use BigInteger. Neither gmp nor bcmath module is loaded");
        }
    }
}

if (S_MATH_BIGINTEGER_MODE == "gmp") {

if (!extension_loaded("gmp")) {
    throw new \Exception("Extension gmp not loaded");
}

class BigInteger {
    
    public $value;
    
    public function __construct($value = 0, $base = 10) {
        $this->value = $base === true ? $value : BigInteger::getGmp($value, $base);
    }
    
    public static function createSafe($value = 0, $base = 10) {
        try {
            return new BigInteger($value, $base);
        }
        catch (\Exception $e) {
            return false;
        }
    }
    
    public static function isGmp($var) {
        if (is_resource($var)) {
            return get_resource_type($var) == "GMP integer";
        }
        if (class_exists("GMP") && $var instanceof \GMP) {
            return true;
        }
        return false;
    }
    
    public static function getGmp($value = 0, $base = 10) {
        if ($value instanceof BigInteger) {
            return $value->value;
        }
        if (BigInteger::isGmp($value)) {
            return $value;
        }
        $type = gettype($value);
        if ($type == "integer") {
            $gmp = gmp_init($value);
            if ($gmp === false) {
                throw new \Exception("Cannot initialize");
            }
            return $gmp;
        }
        if ($type == "string") {
            if ($base != 2 && $base != 10 && $base != 16 && $base != 256) {
                throw new \Exception("Unsupported BigInteger base");
            }
            if ($base == 256) {
                $value = bin2hex($value);
                $base = 16;
            }
            $level = error_reporting();
            error_reporting(0);
            $gmp = gmp_init($value, $base);
            error_reporting($level);
            if ($gmp === false) {
                throw new \Exception("Cannot initialize");
            }
            return $gmp;
        }
        throw new \Exception("Unsupported value, only string and integer are allowed, receive " . $type . ($type == "object" ? ", class: " . get_class($value) : ""));
    }
    
    public function toDec() {
        return gmp_strval($this->value, 10);
    }
    
    public function toHex() {
        $hex = gmp_strval($this->value, 16);
        return strlen($hex) % 2 == 1 ? "0". $hex : $hex;
    }
    
    public function toBytes() {
        return hex2bin($this->toHex());
    }
    
    public function toBase($base) {
        if ($base < 2 || $base > 62) {
            throw new \Exception("Invalid base");
        }
        return gmp_strval($this->value, $base);
    }
    
    public function toBits() {
        return gmp_strval($this->value, 2);
    }
    
    public function toString($base = 10) {
        if ($base == 2) {
            return $this->toBits();
        }
        if ($base == 10) {
            return $this->toDec();
        }
        if ($base == 16) {
            return $this->toHex();
        }
        if ($base == 256) {
            return $this->toBytes();
        }
        return $this->toBase($base);
    }
    
    public function __toString() {
        return $this->toString();
    }
    
    public function toNumber() {
        return gmp_intval($this->value);
    }
    
    public function add($x) {
        return new BigInteger(gmp_add($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function sub($x) {
        return new BigInteger(gmp_sub($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function mul($x) {
        return new BigInteger(gmp_mul($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function div($x) {
        return new BigInteger(gmp_div_q($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function divR($x) {
        return new BigInteger(gmp_div_r($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function divQR($x) {
        $res = gmp_div_qr($this->value, BigInteger::getGmp($x));
        return array(new BigInteger($res[0], true), new BigInteger($res[1], true));
    }
    
    public function mod($x) {
        return new BigInteger(gmp_mod($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function gcd($x) {
        return new BigInteger(gmp_gcd($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function modInverse($x) {
        $res = gmp_invert($this->value, BigInteger::getGmp($x));
        return $res === false ? false : new BigInteger($res, true);
    }
    
    public function pow($x) {
        return new BigInteger(gmp_pow($this->value, (new BigInteger($x))->toNumber()), true);
    }
    
    public function powMod($x, $n) {
        return new BigInteger(gmp_powm($this->value, BigInteger::getGmp($x), BigInteger::getGmp($n)), true);
    }
    
    public function abs() {
        return new BigInteger(gmp_abs($this->value), true);
    }
    
    public function neg() {
        return new BigInteger(gmp_neg($this->value), true);
    }
    
    public function binaryAnd($x) {
        return new BigInteger(gmp_and($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function binaryOr($x) {
        return new BigInteger(gmp_or($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function binaryXor($x) {
        return new BigInteger(gmp_xor($this->value, BigInteger::getGmp($x)), true);
    }
    
    public function setbit($index, $bitOn = true) {
        $cpy = gmp_init(gmp_strval($this->value, 16), 16);
        gmp_setbit($cpy, $index, $bitOn);
        return new BigInteger($cpy, true);
    }
    
    public function testbit($index) {
        return gmp_testbit($this->value, $index);
    }
    
    public function scan0($start) {
        return gmp_scan0($this->value, $start);
    }
    
    public function scan1($start) {
        return gmp_scan1($this->value, $start);
    }
    
    public function cmp($x) {
        return gmp_cmp($this->value, BigInteger::getGmp($x));
    }
    
    public function equals($x) {
        return $this->cmp($x) === 0;
    }
    
    public function sign() {
        return gmp_sign($this->value);
    }
}

}
else if (S_MATH_BIGINTEGER_MODE == "bcmath") {

if (!extension_loaded("bcmath")) {
    throw new \Exception("Extension bcmath not loaded");
}

class BigInteger{
    
    public static $chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv";
    public $value;
    
    public function __construct($value = 0, $base = 10) {
        $this->value = $base === true ? $value : BigInteger::getBC($value, $base);
    }
    
    public static function createSafe($value = 0, $base = 10) {
        try {
            return new BigInteger($value, $base);
        }
        catch (\Exception $e) {
            return false;
        }
    }
    
    public static function checkBinary($str) {
        $len = strlen($str);
        for ($i = 0; $i < $len; $i++) {
            $c = ord($str[$i]);
            if (($i != 0 || $c != 45) && ($c < 48 || $c > 49)) {
                return false;
            }
        }
        return true;
    }
    
    public static function checkDecimal($str) {
        $len = strlen($str);
        for ($i = 0; $i < $len; $i++) {
            $c = ord($str[$i]);
            if (($i != 0 || $c != 45) && ($c < 48 || $c > 57)) {
                return false;
            }
        }
        return true;
    }
    
    public static function checkHex($str) {
        $len = strlen($str);
        for ($i = 0; $i < $len; $i++) {
            $c = ord($str[$i]);
            if (($i != 0 || $c != 45) && ($c < 48 || $c > 57) && ($c < 65 || $c > 70) && ($c < 97 || $c > 102)) {
                return false;
            }
        }
        return true;
    }
    
    public static function getBC($value = 0, $base = 10) {
        if ($value instanceof BigInteger) {
            return $value->value;
        }
        $type = gettype($value);
        if ($type == "integer") {
            return strval($value);
        }
        if ($type == "string") {
            if ($base == 2) {
                $value = str_replace(" ", "", $value);
                if (!BigInteger::checkBinary($value)) {
                    throw new \Exception("Invalid characters");
                }
                $minus = $value[0] == "-";
                if ($minus) {
                    $value = substr($value, 1);
                }
                $len = strlen($value);
                $m = 1;
                $res = "0";
                for ($i = $len - 1; $i >= 0; $i -= 8) {
                    $h = $i - 7 < 0 ? substr($value, 0, $i + 1) : substr($value, $i - 7, 8);
                    $res = bcadd($res, bcmul(bindec($h), $m, 0), 0);
                    $m = bcmul($m, "256", 0);
                }
                return ($minus ? "-" : "") . $res;
            }
            if ($base == 10) {
                $value = str_replace(" ", "", $value);
                if (!BigInteger::checkDecimal($value)) {
                    throw new \Exception("Invalid characters");
                }
                return $value;
            }
            if ($base == 16) {
                $value = str_replace(" ", "", $value);
                if (!BigInteger::checkHex($value)) {
                    throw new \Exception("Invalid characters");
                }
                $minus = $value[0] == "-";
                if ($minus) {
                    $value = substr($value, 1);
                }
                $len = strlen($value);
                $m = 1;
                $res = "0";
                for ($i = $len - 1; $i >= 0; $i -= 2) {
                    $h = $i == 0 ? "0" . substr($value, 0, 1) : substr($value, $i - 1, 2);
                    $res = bcadd($res, bcmul(hexdec($h), $m, 0), 0);
                    $m = bcmul($m, "256", 0);
                }
                return ($minus ? "-" : "") . $res;
            }
            if ($base == 256) {
                $len = strlen($value);
                $m = 1;
                $res = "0";
                for ($i = $len - 1; $i >= 0; $i -= 6) {
                    $h = $i - 5 < 0 ? substr($value, 0, $i + 1) : substr($value, $i - 5, 6);
                    $res = bcadd($res, bcmul(base_convert(bin2hex($h), 16, 10), $m, 0), 0);
                    $m = bcmul($m, "281474976710656", 0);
                }
                return $res;
            }
            throw new \Exception("Unsupported BigInteger base");
        }
        throw new \Exception("Unsupported value, only string and integer are allowed, receive " . $type . ($type == "object" ? ", class: " . get_class($value) : ""));
    }
    
    public function toDec() {
        return $this->value;
    }
    
    public function toHex() {
        return bin2hex($this->toBytes());
    }
    
    public function toBytes() {
        $value = "";
        $current = $this->value;
        if ($current[0] == "-") {
            $current = substr($current, 1);
        }
        while (bccomp($current, "0", 0) > 0) {
            $temp = bcmod($current, "281474976710656");
            $value = hex2bin(str_pad(base_convert($temp, 10, 16), 12, "0", STR_PAD_LEFT)) . $value;
            $current = bcdiv($current, "281474976710656", 0);
        }
        return ltrim($value, chr(0));
    }
    
    public function toBase($base) {
        if ($base < 2 || $base > 62) {
            throw new \Exception("Invalid base");
        }
        $value = '';
        $current = $this->value;
        $base = BigInteger::getBC($base);
        
        if ($current[0] == '-') {
            $current = substr($current, 1);
        }
        
        while (bccomp($current, '0', 0) > 0) {
            $v = bcmod($current, $base);
            $value = BigInteger::$chars[$v] . $value;
            $current = bcdiv($current, $base, 0);
        }
        return $value;
    }
    
    public function toBits() {
        $bytes = $this->toBytes();
        $res = "";
        $len = strlen($bytes);
        for ($i = 0; $i < $len; $i++) {
            $b = decbin(ord($bytes[$i]));
            $res .= strlen($b) != 8 ? str_pad($b, 8, "0", STR_PAD_LEFT) : $b;
        }
        $res = ltrim($res, "0");
        return strlen($res) == 0 ? "0" : $res;
    }
    
    public function toString($base = 10) {
        if ($base == 2) {
            return $this->toBits();
        }
        if ($base == 10) {
            return $this->toDec();
        }
        if ($base == 16) {
            return $this->toHex();
        }
        if ($base == 256) {
            return $this->toBytes();
        }
        return $this->toBase($base);
    }
    
    public function __toString() {
        return $this->toString();
    }
    
    public function toNumber() {
        return intval($this->value);
    }
    
    public function add($x) {
        return new BigInteger(bcadd($this->value, BigInteger::getBC($x), 0), true);
    }
    
    public function sub($x) {
        return new BigInteger(bcsub($this->value, BigInteger::getBC($x), 0), true);
    }
    
    public function mul($x) {
        return new BigInteger(bcmul($this->value, BigInteger::getBC($x), 0), true);
    }
    
    public function div($x) {
        return new BigInteger(bcdiv($this->value, BigInteger::getBC($x), 0), true);
    }
    
    public function divR($x) {
        return new BigInteger(bcmod($this->value, BigInteger::getBC($x)), true);
    }
    
    public function divQR($x) {
        return array(
            $this->div($x),
            $this->divR($x)
        );
    }
    
    public function mod($x) {
        $xv = BigInteger::getBC($x);
        $mod = bcmod($this->value, $xv);
        if ($mod[0] == "-") {
            $mod = bcadd($mod, $xv[0] == "-" ? substr($xv, 1) : $xv, 0);
        }
        return new BigInteger($mod, true);
    }
    
    public function extendedGcd($n) {
        $u = $this->value;
        $v = (new BigInteger($n))->abs()->value;
        
        $a = "1";
        $b = "0";
        $c = "0";
        $d = "1";
        
        while (bccomp($v, "0", 0) != 0) {
            $q = bcdiv($u, $v, 0);
            
            $temp = $u;
            $u = $v;
            $v = bcsub($temp, bcmul($v, $q, 0), 0);
            
            $temp = $a;
            $a = $c;
            $c = bcsub($temp, bcmul($a, $q, 0), 0);
            
            $temp = $b;
            $b = $d;
            $d = bcsub($temp, bcmul($b, $q, 0), 0);
        }
        
        return array(
            "gcd" => new BigInteger($u, true),
            "x" => new BigInteger($a, true),
            "y" => new BigInteger($b, true)
        );
    }
    
    public function gcd($x) {
        return $this->extendedGcd($x)["gcd"];
    }
    
    public function modInverse($n) {
        $n = (new BigInteger($n))->abs();
        
        if ($this->sign() < 0) {
            $temp = $this->abs();
            $temp = $temp->modInverse($n);
            return $n->sub($temp);
        }
        
        extract($this->extendedGcd($n));
        
        if (!$gcd->equals(1)) {
            return false;
        }
        
        $x = $x->sign() < 0 ? $x->add($n) : $x;
        
        return $this->sign() < 0 ? $n->sub($x) : $x;
    }
    
    public function pow($x) {
        return new BigInteger(bcpow($this->value, BigInteger::getBC($x), 0), true);
    }
    
    public function powMod($x, $n) {
        return new BigInteger(bcpowmod($this->value, BigInteger::getBC($x), BigInteger::getBC($n), 0), true);
    }
    
    public function abs() {
        return new BigInteger($this->value[0] == "-" ? substr($this->value, 1) : $this->value, true);
    }
    
    public function neg() {
        return new BigInteger($this->value[0] == "-" ? substr($this->value, 1) : "-" . $this->value, true);
    }
    
    public function binaryAnd($x) {
        $left = $this->toBytes();
        $right = (new BigInteger($x))->toBytes();
        
        $length = max(strlen($left), strlen($right));
        
        $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
        $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);
        
        return new BigInteger($left & $right, 256);
    }
    
    public function binaryOr($x) {
        $left = $this->toBytes();
        $right = (new BigInteger($x))->toBytes();
        
        $length = max(strlen($left), strlen($right));
        
        $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
        $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);
        
        return new BigInteger($left | $right, 256);
    }
    
    public function binaryXor($x) {
        $left = $this->toBytes();
        $right = (new BigInteger($x))->toBytes();
        
        $length = max(strlen($left), strlen($right));
        
        $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
        $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);
        
        return new BigInteger($left ^ $right, 256);
    }
    
    public function setbit($index, $bitOn = true) {
        $bits = $this->toBits();
        $bits[strlen($bits) - $index - 1] = $bitOn ? "1" : "0";
        return new BigInteger($bits, 2);
    }
    
    public function testbit($index) {
        $bytes = $this->toBytes();
        $bytesIndex = intval($index / 8);
        $len = strlen($bytes);
        $b = $bytesIndex >= $len ? 0 : ord($bytes[$len - $bytesIndex - 1]);
        $v = 1 << ($index % 8);
        return ($b & $v) === $v;
    }
    
    public function scan0($start) {
        $bits = $this->toBits();
        $len = strlen($bits);
        if ($start < 0 || $start >= $len) {
            return -1;
        }
        $pos = strrpos($bits, "0", -1 - $start);
        return $pos === false ? -1 : $len - $pos - 1;
    }
    
    public function scan1($start) {
        $bits = $this->toBits();
        $len = strlen($bits);
        if ($start < 0 || $start >= $len) {
            return -1;
        }
        $pos = strrpos($bits, "1", -1 - $start);
        return $pos === false ? -1 : $len - $pos - 1;
    }
    
    public function cmp($x) {
        return bccomp($this->value, BigInteger::getBC($x));
    }
    
    public function equals($x) {
        return $this->value === BigInteger::getBC($x);
    }
    
    public function sign() {
        return $this->value[0] === "-" ? -1 : ($this->value === "0" ? 0 : 1);
    }
}

}
else {
    if (!defined("S_MATH_BIGINTEGER_QUIET")) {
        throw new \Exception("Unsupported S_MATH_BIGINTEGER_MODE " . S_MATH_BIGINTEGER_MODE);
    }
}
