<?php

namespace ccxt;

class Precise {
    public $integer;
    public $decimals;
    public static $base;

    public function __construct($number, $decimals = null) {
        if ($decimals === null) {
            // assert(gettype($number) === 'string');
            $modifier = 0;
            $number = strtolower($number);
            if (strpos($number, 'e') > -1) {
                list($number, $modifier) = explode('e', $number);
                $modifier = intval($modifier);
            }
            $decimalIndex = strpos($number, '.');
            $this->decimals = ($decimalIndex > -1) ? strlen($number) - $decimalIndex - 1 : 0;
            $integerString = str_replace('.', '', $number);
            $this->integer = gmp_init($integerString, 10);
            $this->decimals = $this->decimals - $modifier;
        } else {
            // assert(is_int($decimals));
            $this->integer = $number;
            $this->decimals = $decimals;
        }
    }

    public function mul($other) {
        $integerResult = gmp_mul($this->integer, $other->integer);
        return new Precise($integerResult, $this->decimals + $other->decimals);
    }

    public function div($other, $precision = 18) {
        $distance = $precision - $this->decimals + $other->decimals;
        if ($distance === 0) {
            $numerator = $this->integer;
        } elseif ($distance < 0) {
            $exponent = gmp_pow(static::$base, -$distance);
            $numerator = gmp_div($this->integer, $exponent);
        } else {
            $exponent = gmp_pow(static::$base, $distance);
            $numerator = gmp_mul($this->integer, $exponent);
        }
        $result = gmp_div($numerator, $other->integer);
        return new Precise($result, $precision);
    }

    public function add($other) {
        if ($this->decimals === $other->decimals) {
            $integerResult = gmp_add($this->integer, $other->integer);
            return new Precise($integerResult, $this->decimals);
        } else {
            list($smaller, $bigger) =
                ($this->decimals > $other->decimals) ? array( $other, $this ) : array( $this, $other );
            $exponent = $bigger->decimals - $smaller->decimals;
            $normalised = gmp_mul($smaller->integer, gmp_pow(static::$base, $exponent));
            $result = gmp_add($normalised, $bigger->integer);
            return new Precise($result, $bigger->decimals);
        }
    }

    public function sub($other) {
        $negative = new Precise(gmp_neg($other->integer), $other->decimals);
        return $this->add($negative);
    }

    public function abs() {
        return new Precise(gmp_abs($this->integer), $this->decimals);
    }

    public function neg() {
        return new Precise(gmp_neg($this->integer), $this->decimals);
    }

    public function mod($other) {
        $rationizerNumerator = max(-$this->decimals + $other->decimals, 0);
        $numerator = gmp_mul($this->integer, gmp_pow(static::$base, $rationizerNumerator));
        $denominatorRationizer = max(-$other->decimals + $this->decimals, 0);
        $denominator = gmp_mul($other->integer, gmp_pow(static::$base, $denominatorRationizer));
        $result = gmp_mod($numerator, $denominator);
        if (gmp_cmp($result, 0) < 0) {
            $result = gmp_add($result, $denominator);
        }
        return new Precise($result, $denominatorRationizer + $other->decimals);
    }

    public function pow10() {
        // this must represent a positive or negative integer
        if ($this->decimals === null or $this->decimals === 0) {
            assert( gmp_cmp(gmp_intval($this->integer), $this->integer) == 0 );
            if ($this->integer >= 0) {
                $result = gmp_pow(10, gmp_intval($this->integer));
                return new Precise($result, 0);
            } else {
                return new Precise(1, gmp_intval(gmp_neg($this->integer)));
            }
        } else {
            assert(false);
        }
    }
    
    public function min($other) {
        return $this->lt($other) ? $this : $other;
    }

    public function max($other) {
        return $this->gt($other) ? $this : $other;

    }

    public function round() {
        $fractional = $this->mod(new Precise(1, 0));
        $whole = $this->sub($fractional);
        if (gmp_cmp($this->integer, 0) > 0) {
            if ($fractional->ge(new Precise(5, 1))) {
                return $whole->add(new Precise(1, 0));
            } else {
                return $whole;
            }
        } else {
            if ($fractional->gt(new Precise(5, 1))) {
                return $whole->add(new Precise(1, 0));
            } else {
                return $whole;
            }
        }
    }

    public function floor() {
        $fractional = $this->mod(new Precise(1, 0));
        $whole = $this->sub($fractional);
        return $whole;
    }

    public function ceil() {
        $fractional = $this->mod(new Precise(1, 0));
        $whole = $this->sub($fractional);
        if ($fractional->integer > 0) {
            return $whole->add(new Precise(1, 0));
        } else {
            return $whole;
        }
        return $whole;
    }

    public function gt($other) {
        $sum = $this->sub($other);
        return gmp_cmp($sum->integer, '0') > 0;
    }

    public function ge($other) {
        $sum = $this->sub($other);
        return gmp_cmp($sum->integer, '0') > -1;
    }

    public function lt($other) {
        return $other->gt($this);
    }

    public function le($other) {
        return $other->ge($this);
    }

    public function reduce() {

        $string = strval($this->integer);
        $start = strlen($string) - 1;
        if ($start === 0) {
            if ($string === '0') {
                $this->decimals = 0;
            }
            return $this;
        }
        for ($i = $start; $i >= 0; $i--) {
            if ($string[$i] !== '0') {
                break;
            }
        }
        $difference = $start - $i;
        if ($difference === 0) {
            return $this;
        }
        $this->decimals -= $difference;
        $this->integer = gmp_init(substr($string, 0, $i + 1), 10);
    }

    public function equals ($other) {
        $this->reduce();
        $other->reduce();
        return ($this->decimals === $other->decimals) && !gmp_cmp($this->integer, $other->integer);
    }

    public function __toString() {
        $this->reduce();
        $sign = gmp_sign($this->integer) === -1 ? '-' : '';
        $integerStr = str_pad(gmp_abs($this->integer), $this->decimals, '0', STR_PAD_LEFT);
        $index = strlen($integerStr) - $this->decimals;
        if ($index === 0) {
            // if we are adding to the front
            $item = '0.';
        } else if ($this->decimals < 0) {
            $item = str_repeat('0', -$this->decimals);
        } else if ($this->decimals === 0) {
            $item = '';
        } else {
            $item = '.';
        }
        $integerStr = $sign . substr($integerStr,0,$index) . $item . substr($integerStr,$index); 
        return $integerStr;
    }

    public static function string_mul($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return strval((new Precise($string1))->mul(new Precise($string2)));
    }

    public static function string_div($string1, $string2, $precision = 18) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        $string2_precise = new Precise($string2);
        if (gmp_cmp($string2_precise->integer, '0') === 0) {
            return null;
        }
        return strval((new Precise($string1))->div($string2_precise, $precision));
    }

    public static function string_add($string1, $string2) {
        if (($string1 === null) && ($string2 === null)) {
            return null;
        }
        if ($string1 === null) {
            return $string2;
        } elseif ($string2 === null) {
            return $string1;
        }
        return strval((new Precise($string1))->add(new Precise($string2)));
    }

    public static function string_sub($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return strval((new Precise($string1))->sub(new Precise($string2)));
    }

    public static function string_abs($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->abs());
    }

    public static function string_neg($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->neg());
    }

    public static function string_mod($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return strval((new Precise($string1))->mod(new Precise($string2)));
    }

    public static function string_pow10($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->pow10());
    }
    
    public static function string_equals($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->equals(new Precise($string2));
    }

    public static function string_eq($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->equals(new Precise($string2));
    }

    public static function string_min($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return strval((new Precise($string1))->min(new Precise($string2)));
    }

    public static function string_max($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return strval((new Precise($string1))->max(new Precise($string2)));
    }

    public static function string_round($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->round());
    }

    public static function string_floor($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->floor());
    }

    public static function string_ceil($string) {
        if ($string === null) {
            return null;
        }
        return strval((new Precise($string))->ceil());
    }
    
    public static function string_gt($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->gt(new Precise($string2));
    }

    public static function string_ge($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->ge(new Precise($string2));
    }

    public static function string_lt($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->lt(new Precise($string2));
    }

    public static function string_le($string1, $string2) {
        if (($string1 === null) || ($string2 === null)) {
            return null;
        }
        return (new Precise($string1))->le(new Precise($string2));
    }
}

Precise::$base = \gmp_init(10);
