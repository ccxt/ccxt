<?php

namespace ccxt;

use BN\BN;

class Precise {
    public $integer;
    public $decimals;
    public $base;

    public function __construct($number, $decimals = 0) {
        $isBN = $number instanceof BN;
        $isString = is_string($number);
        if (!($isBN || $isString)) {
            throw new \Error('Precise initiated with something other than a string or BN');
        }
        if ($isBN) {
            $this->integer = $number;
            $this->decimals = $decimals;
        } else {
            if ($decimals) {
                throw new \Error('Cannot set decimals when initializing with a string');
            }
            $modifier = 0;
            $number = strtolower($number);
            if (strpos($number, 'e') > -1) {
                list($number, $modifier) = explode('e', $number);
                $modifier = intval($modifier);
            }
            $decimalIndex = strpos($number, '.');
            $this->decimals = ($decimalIndex > -1) ? strlen($number) - $decimalIndex - 1 : 0;
            $integerString = str_replace('.', '', $number);
            $this->integer = new BN($integerString);
            $this->decimals = $this->decimals - $modifier;
        }
        $this->base = 10;
        $this->reduce();
    }

    public function mul($other) {
        $integerResult = $this->integer->mul($other->integer);
        return new Precise($integerResult, $this->decimals + $other->decimals);
    }

    public function div($other, $precision = 18) {
        $distance = $precision - $this->decimals + $other->decimals;
        if ($distance === 0) {
            $numerator = $this->integer;
        } elseif ($distance < 0) {
            $exponent = (new BN($this->base))->pow(new BN(-$distance));
            $numerator = $this->integer->div($exponent);
        } else {
            $exponent = (new BN($this->base))->pow(new BN($distance));
            $numerator = $this->integer->mul($exponent);
        }
        $result = $numerator->div($other->integer);
        return new Precise($result, $precision);
    }

    public function add($other) {
        if ($this->decimals === $other->decimals) {
            $integerResult = $this->integer->add($other->integer);
            return new Precise($integerResult, $this->decimals);
        } else {
            list($smaller, $bigger) =
                ($this->decimals > $other->decimals) ? array( $other, $this ) : array( $this, $other );
            $exponent = new BN($bigger->decimals - $smaller->decimals);
            $normalised = $smaller->integer->mul((new BN($this->base))->pow($exponent));
            $result = $normalised->add($bigger->integer);
            return new Precise($result, $bigger->decimals);
        }
    }

    public function sub($other) {
        $negative = new Precise($other->integer->neg(), $other->decimals);
        return $this->add($negative);
    }

    public function abs() {
        return new Precise($this->integer->abs(), $this->decimals);
    }

    public function neg() {
        return new Precise($this->integer->neg(), $this->decimals);
    }

    public function reduce() {
        $zero = new BN(0);
        if ($this->integer->eq($zero)) {
            $this->decimals = 0;
            return $this;
        }
        $base = new BN($this->base);
        $div = $this->integer->div($base);
        $mod = $this->integer->mod($base);
        while ($mod->eq($zero)) {
            $this->integer = $div;
            $this->decimals--;
            $div = $this->integer->div($base);
            $mod = $this->integer->mod($base);
        }
        return $this;
    }

    public function __toString() {
        $sign = $this->integer->negative() ? '-' : '';
        $integerArray = str_split(str_pad($this->integer->abs()->toString($this->base), $this->decimals, '0', STR_PAD_LEFT));
        $index = count($integerArray) - $this->decimals;
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
        array_splice($integerArray, $index, 0, $item);
        return $sign . implode('', $integerArray);
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
        return strval((new Precise($string1))->div(new Precise($string2), $precision));
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
}
