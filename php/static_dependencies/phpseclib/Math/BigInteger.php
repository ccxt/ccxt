<?php

/**
 * Pure-PHP arbitrary precision integer arithmetic library.
 *
 * Supports base-2, base-10, base-16, and base-256 numbers.  Uses the GMP or BCMath extensions, if available,
 * and an internal implementation, otherwise.
 *
 * PHP version 5
 *
 * {@internal (all DocBlock comments regarding implementation - such as the one that follows - refer to the
 * {@link self::MODE_INTERNAL self::MODE_INTERNAL} mode)
 *
 * BigInteger uses base-2**26 to perform operations such as multiplication and division and
 * base-2**52 (ie. two base 2**26 digits) to perform addition and subtraction.  Because the largest possible
 * value when multiplying two base-2**26 numbers together is a base-2**52 number, double precision floating
 * point numbers - numbers that should be supported on most hardware and whose significand is 53 bits - are
 * used.  As a consequence, bitwise operators such as >> and << cannot be used, nor can the modulo operator %,
 * which only supports integers.  Although this fact will slow this library down, the fact that such a high
 * base is being used should more than compensate.
 *
 * Numbers are stored in {@link http://en.wikipedia.org/wiki/Endianness little endian} format.  ie.
 * (new \phpseclib\Math\BigInteger(pow(2, 26)))->value = array(0, 1)
 *
 * Useful resources are as follows:
 *
 *  - {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf Handbook of Applied Cryptography (HAC)}
 *  - {@link http://math.libtomcrypt.com/files/tommath.pdf Multi-Precision Math (MPM)}
 *  - Java's BigInteger classes.  See /j2se/src/share/classes/java/math in jdk-1_5_0-src-jrl.zip
 *
 * Here's an example of how to use this library:
 * <code>
 * <?php
 *    $a = new \phpseclib\Math\BigInteger(2);
 *    $b = new \phpseclib\Math\BigInteger(3);
 *
 *    $c = $a->add($b);
 *
 *    echo $c->toString(); // outputs 5
 * ?>
 * </code>
 *
 * @category  Math
 * @package   BigInteger
 * @author    Jim Wigginton <terrafrost@php.net>
 * @copyright 2006 Jim Wigginton
 * @license   http://www.opensource.org/licenses/mit-license.html  MIT License
 */

namespace phpseclib\Math;

/**
 * Pure-PHP arbitrary precision integer arithmetic library. Supports base-2, base-10, base-16, and base-256
 * numbers.
 *
 * @package BigInteger
 * @author  Jim Wigginton <terrafrost@php.net>
 * @access  public
 */
class BigInteger
{
    /**#@+
     * Reduction constants
     *
     * @access private
     * @see BigInteger::_reduce()
     */
    /**
     * @see BigInteger::_montgomery()
     * @see BigInteger::_prepMontgomery()
     */
    const MONTGOMERY = 0;
    /**
     * @see BigInteger::_barrett()
     */
    const BARRETT = 1;
    /**
     * @see BigInteger::_mod2()
     */
    const POWEROF2 = 2;
    /**
     * @see BigInteger::_remainder()
     */
    const CLASSIC = 3;
    /**
     * @see BigInteger::__clone()
     */
    const NONE = 4;
    /**#@-*/

    /**#@+
     * Array constants
     *
     * Rather than create a thousands and thousands of new BigInteger objects in repeated function calls to add() and
     * multiply() or whatever, we'll just work directly on arrays, taking them in as parameters and returning them.
     *
     * @access private
    */
    /**
     * $result[self::VALUE] contains the value.
     */
    const VALUE = 0;
    /**
     * $result[self::SIGN] contains the sign.
     */
    const SIGN = 1;
    /**#@-*/

    /**#@+
     * @access private
     * @see BigInteger::_montgomery()
     * @see BigInteger::_barrett()
    */
    /**
     * Cache constants
     *
     * $cache[self::VARIABLE] tells us whether or not the cached data is still valid.
     */
    const VARIABLE = 0;
    /**
     * $cache[self::DATA] contains the cached data.
     */
    const DATA = 1;
    /**#@-*/

    /**#@+
     * Mode constants.
     *
     * @access private
     * @see BigInteger::__construct()
    */
    /**
     * To use the pure-PHP implementation
     */
    const MODE_INTERNAL = 1;
    /**
     * To use the BCMath library
     *
     * (if enabled; otherwise, the internal implementation will be used)
     */
    const MODE_BCMATH = 2;
    /**
     * To use the GMP library
     *
     * (if present; otherwise, either the BCMath or the internal implementation will be used)
     */
    const MODE_GMP = 3;
    /**#@-*/

    /**
     * Karatsuba Cutoff
     *
     * At what point do we switch between Karatsuba multiplication and schoolbook long multiplication?
     *
     * @access private
     */
    const KARATSUBA_CUTOFF = 25;

    /**#@+
     * Static properties used by the pure-PHP implementation.
     *
     * @see __construct()
     */
    protected static $base;
    protected static $baseFull;
    protected static $maxDigit;
    protected static $msb;

    /**
     * $max10 in greatest $max10Len satisfying
     * $max10 = 10**$max10Len <= 2**$base.
     */
    protected static $max10;

    /**
     * $max10Len in greatest $max10Len satisfying
     * $max10 = 10**$max10Len <= 2**$base.
     */
    protected static $max10Len;
    protected static $maxDigit2;
    /**#@-*/

    /**
     * Holds the BigInteger's value.
     *
     * @var array
     * @access private
     */
    var $value;

    /**
     * Holds the BigInteger's magnitude.
     *
     * @var bool
     * @access private
     */
    var $is_negative = false;

    /**
     * Precision
     *
     * @see self::setPrecision()
     * @access private
     */
    var $precision = -1;

    /**
     * Precision Bitmask
     *
     * @see self::setPrecision()
     * @access private
     */
    var $bitmask = false;

    /**
     * Mode independent value used for serialization.
     *
     * If the bcmath or gmp extensions are installed $this->value will be a non-serializable resource, hence the need for
     * a variable that'll be serializable regardless of whether or not extensions are being used.  Unlike $this->value,
     * however, $this->hex is only calculated when $this->__sleep() is called.
     *
     * @see self::__sleep()
     * @see self::__wakeup()
     * @var string
     * @access private
     */
    var $hex;

    /**
     * Converts base-2, base-10, base-16, and binary strings (base-256) to BigIntegers.
     *
     * If the second parameter - $base - is negative, then it will be assumed that the number's are encoded using
     * two's compliment.  The sole exception to this is -10, which is treated the same as 10 is.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('0x32', 16); // 50 in base-16
     *
     *    echo $a->toString(); // outputs 50
     * ?>
     * </code>
     *
     * @param int|string|resource $x base-10 number or base-$base number if $base set.
     * @param int $base
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function __construct($x = 0, $base = 10)
    {
        if (!defined('MATH_BIGINTEGER_MODE')) {
            switch (true) {
                case extension_loaded('gmp'):
                    define('MATH_BIGINTEGER_MODE', self::MODE_GMP);
                    break;
                case extension_loaded('bcmath'):
                    define('MATH_BIGINTEGER_MODE', self::MODE_BCMATH);
                    break;
                default:
                    define('MATH_BIGINTEGER_MODE', self::MODE_INTERNAL);
            }
        }

        if (extension_loaded('openssl') && !defined('MATH_BIGINTEGER_OPENSSL_DISABLE') && !defined('MATH_BIGINTEGER_OPENSSL_ENABLED')) {
            // some versions of XAMPP have mismatched versions of OpenSSL which causes it not to work
            $versions = array();

            // avoid generating errors (even with suppression) when phpinfo() is disabled (common in production systems)
            if (function_exists('phpinfo')) {
                ob_start();
                @phpinfo();
                $content = ob_get_contents();
                ob_end_clean();

                preg_match_all('#OpenSSL (Header|Library) Version(.*)#im', $content, $matches);

                if (!empty($matches[1])) {
                    for ($i = 0; $i < count($matches[1]); $i++) {
                        $fullVersion = trim(str_replace('=>', '', strip_tags($matches[2][$i])));

                        // Remove letter part in OpenSSL version
                        if (!preg_match('/(\d+\.\d+\.\d+)/i', $fullVersion, $m)) {
                            $versions[$matches[1][$i]] = $fullVersion;
                        } else {
                            $versions[$matches[1][$i]] = $m[0];
                        }
                    }
                }
            }

            // it doesn't appear that OpenSSL versions were reported upon until PHP 5.3+
            switch (true) {
                case !isset($versions['Header']):
                case !isset($versions['Library']):
                case $versions['Header'] == $versions['Library']:
                case version_compare($versions['Header'], '1.0.0') >= 0 && version_compare($versions['Library'], '1.0.0') >= 0:
                    define('MATH_BIGINTEGER_OPENSSL_ENABLED', true);
                    break;
                default:
                    define('MATH_BIGINTEGER_OPENSSL_DISABLE', true);
            }
        }

        if (!defined('PHP_INT_SIZE')) {
            define('PHP_INT_SIZE', 4);
        }

        if (empty(self::$base) && MATH_BIGINTEGER_MODE == self::MODE_INTERNAL) {
            switch (PHP_INT_SIZE) {
                case 8: // use 64-bit integers if int size is 8 bytes
                    self::$base      = 31;
                    self::$baseFull  = 0x80000000;
                    self::$maxDigit  = 0x7FFFFFFF;
                    self::$msb       = 0x40000000;
                    self::$max10     = 1000000000;
                    self::$max10Len  = 9;
                    self::$maxDigit2 = pow(2, 62);
                    break;
                //case 4: // use 64-bit floats if int size is 4 bytes
                default:
                    self::$base      = 26;
                    self::$baseFull  = 0x4000000;
                    self::$maxDigit  = 0x3FFFFFF;
                    self::$msb       = 0x2000000;
                    self::$max10     = 10000000;
                    self::$max10Len  = 7;
                    self::$maxDigit2 = pow(2, 52); // pow() prevents truncation
            }
        }

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                switch (true) {
                    case is_resource($x) && get_resource_type($x) == 'GMP integer':
                    // PHP 5.6 switched GMP from using resources to objects
                    case $x instanceof \GMP:
                        $this->value = $x;
                        return;
                }
                $this->value = gmp_init(0);
                break;
            case self::MODE_BCMATH:
                $this->value = '0';
                break;
            default:
                $this->value = array();
        }

        // '0' counts as empty() but when the base is 256 '0' is equal to ord('0') or 48
        // '0' is the only value like this per http://php.net/empty
        if (empty($x) && (abs($base) != 256 || $x !== '0')) {
            return;
        }

        switch ($base) {
            case -256:
                if (ord($x[0]) & 0x80) {
                    $x = ~$x;
                    $this->is_negative = true;
                }
            case 256:
                switch (MATH_BIGINTEGER_MODE) {
                    case self::MODE_GMP:
                        $this->value = function_exists('gmp_import') ?
                            gmp_import($x) :
                            gmp_init('0x' . bin2hex($x));
                        if ($this->is_negative) {
                            $this->value = gmp_neg($this->value);
                        }
                        break;
                    case self::MODE_BCMATH:
                        // round $len to the nearest 4 (thanks, DavidMJ!)
                        $len = (strlen($x) + 3) & ~3;

                        $x = str_pad($x, $len, chr(0), STR_PAD_LEFT);

                        for ($i = 0; $i < $len; $i+= 4) {
                            $this->value = bcmul($this->value, '4294967296', 0); // 4294967296 == 2**32
                            $this->value = bcadd($this->value, 0x1000000 * ord($x[$i]) + ((ord($x[$i + 1]) << 16) | (ord($x[$i + 2]) << 8) | ord($x[$i + 3])), 0);
                        }

                        if ($this->is_negative) {
                            $this->value = '-' . $this->value;
                        }

                        break;
                    // converts a base-2**8 (big endian / msb) number to base-2**26 (little endian / lsb)
                    default:
                        while (strlen($x)) {
                            $this->value[] = $this->_bytes2int($this->_base256_rshift($x, self::$base));
                        }
                }

                if ($this->is_negative) {
                    if (MATH_BIGINTEGER_MODE != self::MODE_INTERNAL) {
                        $this->is_negative = false;
                    }
                    $temp = $this->add(new static('-1'));
                    $this->value = $temp->value;
                }
                break;
            case 16:
            case -16:
                if ($base > 0 && $x[0] == '-') {
                    $this->is_negative = true;
                    $x = substr($x, 1);
                }

                $x = preg_replace('#^(?:0x)?([A-Fa-f0-9]*).*#s', '$1', $x);

                $is_negative = false;
                if ($base < 0 && hexdec($x[0]) >= 8) {
                    $this->is_negative = $is_negative = true;
                    $x = bin2hex(~pack('H*', $x));
                }

                switch (MATH_BIGINTEGER_MODE) {
                    case self::MODE_GMP:
                        $temp = $this->is_negative ? '-0x' . $x : '0x' . $x;
                        $this->value = gmp_init($temp);
                        $this->is_negative = false;
                        break;
                    case self::MODE_BCMATH:
                        $x = (strlen($x) & 1) ? '0' . $x : $x;
                        $temp = new static(pack('H*', $x), 256);
                        $this->value = $this->is_negative ? '-' . $temp->value : $temp->value;
                        $this->is_negative = false;
                        break;
                    default:
                        $x = (strlen($x) & 1) ? '0' . $x : $x;
                        $temp = new static(pack('H*', $x), 256);
                        $this->value = $temp->value;
                }

                if ($is_negative) {
                    $temp = $this->add(new static('-1'));
                    $this->value = $temp->value;
                }
                break;
            case 10:
            case -10:
                // (?<!^)(?:-).*: find any -'s that aren't at the beginning and then any characters that follow that
                // (?<=^|-)0*: find any 0's that are preceded by the start of the string or by a - (ie. octals)
                // [^-0-9].*: find any non-numeric characters and then any characters that follow that
                $x = preg_replace('#(?<!^)(?:-).*|(?<=^|-)0*|[^-0-9].*#s', '', $x);
                if (!strlen($x) || $x == '-') {
                    $x = '0';
                }

                switch (MATH_BIGINTEGER_MODE) {
                    case self::MODE_GMP:
                        $this->value = gmp_init($x);
                        break;
                    case self::MODE_BCMATH:
                        // explicitly casting $x to a string is necessary, here, since doing $x[0] on -1 yields different
                        // results then doing it on '-1' does (modInverse does $x[0])
                        $this->value = $x === '-' ? '0' : (string) $x;
                        break;
                    default:
                        $temp = new static();

                        $multiplier = new static();
                        $multiplier->value = array(self::$max10);

                        if ($x[0] == '-') {
                            $this->is_negative = true;
                            $x = substr($x, 1);
                        }

                        $x = str_pad($x, strlen($x) + ((self::$max10Len - 1) * strlen($x)) % self::$max10Len, 0, STR_PAD_LEFT);
                        while (strlen($x)) {
                            $temp = $temp->multiply($multiplier);
                            $temp = $temp->add(new static($this->_int2bytes(substr($x, 0, self::$max10Len)), 256));
                            $x = substr($x, self::$max10Len);
                        }

                        $this->value = $temp->value;
                }
                break;
            case 2: // base-2 support originally implemented by Lluis Pamies - thanks!
            case -2:
                if ($base > 0 && $x[0] == '-') {
                    $this->is_negative = true;
                    $x = substr($x, 1);
                }

                $x = preg_replace('#^([01]*).*#s', '$1', $x);
                $x = str_pad($x, strlen($x) + (3 * strlen($x)) % 4, 0, STR_PAD_LEFT);

                $str = '0x';
                while (strlen($x)) {
                    $part = substr($x, 0, 4);
                    $str.= dechex(bindec($part));
                    $x = substr($x, 4);
                }

                if ($this->is_negative) {
                    $str = '-' . $str;
                }

                $temp = new static($str, 8 * $base); // ie. either -16 or +16
                $this->value = $temp->value;
                $this->is_negative = $temp->is_negative;

                break;
            default:
                // base not supported, so we'll let $this == 0
        }
    }

    /**
     * Converts a BigInteger to a byte string (eg. base-256).
     *
     * Negative numbers are saved as positive numbers, unless $twos_compliment is set to true, at which point, they're
     * saved as two's compliment.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('65');
     *
     *    echo $a->toBytes(); // outputs chr(65)
     * ?>
     * </code>
     *
     * @param bool $twos_compliment
     * @return string
     * @access public
     * @internal Converts a base-2**26 number to base-2**8
     */
    function toBytes($twos_compliment = false)
    {
        if ($twos_compliment) {
            $comparison = $this->compare(new static());
            if ($comparison == 0) {
                return $this->precision > 0 ? str_repeat(chr(0), ($this->precision + 1) >> 3) : '';
            }

            $temp = $comparison < 0 ? $this->add(new static(1)) : $this->copy();
            $bytes = $temp->toBytes();

            if (!strlen($bytes)) { // eg. if the number we're trying to convert is -1
                $bytes = chr(0);
            }

            if ($this->precision <= 0 && (ord($bytes[0]) & 0x80)) {
                $bytes = chr(0) . $bytes;
            }

            return $comparison < 0 ? ~$bytes : $bytes;
        }

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                if (gmp_cmp($this->value, gmp_init(0)) == 0) {
                    return $this->precision > 0 ? str_repeat(chr(0), ($this->precision + 1) >> 3) : '';
                }

                if (function_exists('gmp_export')) {
                    $temp = gmp_export($this->value);
                } else {
                    $temp = gmp_strval(gmp_abs($this->value), 16);
                    $temp = (strlen($temp) & 1) ? '0' . $temp : $temp;
                    $temp = pack('H*', $temp);
                }

                return $this->precision > 0 ?
                    substr(str_pad($temp, $this->precision >> 3, chr(0), STR_PAD_LEFT), -($this->precision >> 3)) :
                    ltrim($temp, chr(0));
            case self::MODE_BCMATH:
                if ($this->value === '0') {
                    return $this->precision > 0 ? str_repeat(chr(0), ($this->precision + 1) >> 3) : '';
                }

                $value = '';
                $current = $this->value;

                if ($current[0] == '-') {
                    $current = substr($current, 1);
                }

                while (bccomp($current, '0', 0) > 0) {
                    $temp = bcmod($current, '16777216');
                    $value = chr($temp >> 16) . chr($temp >> 8) . chr($temp) . $value;
                    $current = bcdiv($current, '16777216', 0);
                }

                return $this->precision > 0 ?
                    substr(str_pad($value, $this->precision >> 3, chr(0), STR_PAD_LEFT), -($this->precision >> 3)) :
                    ltrim($value, chr(0));
        }

        if (!count($this->value)) {
            return $this->precision > 0 ? str_repeat(chr(0), ($this->precision + 1) >> 3) : '';
        }
        $result = $this->_int2bytes($this->value[count($this->value) - 1]);

        $temp = $this->copy();

        for ($i = count($temp->value) - 2; $i >= 0; --$i) {
            $temp->_base256_lshift($result, self::$base);
            $result = $result | str_pad($temp->_int2bytes($temp->value[$i]), strlen($result), chr(0), STR_PAD_LEFT);
        }

        return $this->precision > 0 ?
            str_pad(substr($result, -(($this->precision + 7) >> 3)), ($this->precision + 7) >> 3, chr(0), STR_PAD_LEFT) :
            $result;
    }

    /**
     * Converts a BigInteger to a hex string (eg. base-16)).
     *
     * Negative numbers are saved as positive numbers, unless $twos_compliment is set to true, at which point, they're
     * saved as two's compliment.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('65');
     *
     *    echo $a->toHex(); // outputs '41'
     * ?>
     * </code>
     *
     * @param bool $twos_compliment
     * @return string
     * @access public
     * @internal Converts a base-2**26 number to base-2**8
     */
    function toHex($twos_compliment = false)
    {
        return bin2hex($this->toBytes($twos_compliment));
    }

    /**
     * Converts a BigInteger to a bit string (eg. base-2).
     *
     * Negative numbers are saved as positive numbers, unless $twos_compliment is set to true, at which point, they're
     * saved as two's compliment.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('65');
     *
     *    echo $a->toBits(); // outputs '1000001'
     * ?>
     * </code>
     *
     * @param bool $twos_compliment
     * @return string
     * @access public
     * @internal Converts a base-2**26 number to base-2**2
     */
    function toBits($twos_compliment = false)
    {
        $hex = $this->toHex($twos_compliment);
        $bits = '';
        for ($i = strlen($hex) - 6, $start = strlen($hex) % 6; $i >= $start; $i-=6) {
            $bits = str_pad(decbin(hexdec(substr($hex, $i, 6))), 24, '0', STR_PAD_LEFT) . $bits;
        }
        if ($start) { // hexdec('') == 0
            $bits = str_pad(decbin(hexdec(substr($hex, 0, $start))), 8 * $start, '0', STR_PAD_LEFT) . $bits;
        }
        $result = $this->precision > 0 ? substr($bits, -$this->precision) : ltrim($bits, '0');

        if ($twos_compliment && $this->compare(new static()) > 0 && $this->precision <= 0) {
            return '0' . $result;
        }

        return $result;
    }

    /**
     * Converts a BigInteger to a base-10 number.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('50');
     *
     *    echo $a->toString(); // outputs 50
     * ?>
     * </code>
     *
     * @return string
     * @access public
     * @internal Converts a base-2**26 number to base-10**7 (which is pretty much base-10)
     */
    function toString()
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                return gmp_strval($this->value);
            case self::MODE_BCMATH:
                if ($this->value === '0') {
                    return '0';
                }

                return ltrim($this->value, '0');
        }

        if (!count($this->value)) {
            return '0';
        }

        $temp = $this->copy();
        $temp->bitmask = false;
        $temp->is_negative = false;

        $divisor = new static();
        $divisor->value = array(self::$max10);
        $result = '';
        while (count($temp->value)) {
            list($temp, $mod) = $temp->divide($divisor);
            $result = str_pad(isset($mod->value[0]) ? $mod->value[0] : '', self::$max10Len, '0', STR_PAD_LEFT) . $result;
        }
        $result = ltrim($result, '0');
        if (empty($result)) {
            $result = '0';
        }

        if ($this->is_negative) {
            $result = '-' . $result;
        }

        return $result;
    }

    /**
     * Copy an object
     *
     * PHP5 passes objects by reference while PHP4 passes by value.  As such, we need a function to guarantee
     * that all objects are passed by value, when appropriate.  More information can be found here:
     *
     * {@link http://php.net/language.oop5.basic#51624}
     *
     * @access public
     * @see self::__clone()
     * @return \phpseclib\Math\BigInteger
     */
    function copy()
    {
        $temp = new static();
        $temp->value = $this->value;
        $temp->is_negative = $this->is_negative;
        $temp->precision = $this->precision;
        $temp->bitmask = $this->bitmask;
        return $temp;
    }

    /**
     *  __toString() magic method
     *
     * Will be called, automatically, if you're supporting just PHP5.  If you're supporting PHP4, you'll need to call
     * toString().
     *
     * @access public
     * @internal Implemented per a suggestion by Techie-Michael - thanks!
     */
    function __toString()
    {
        return $this->toString();
    }

    /**
     * __clone() magic method
     *
     * Although you can call BigInteger::__toString() directly in PHP5, you cannot call BigInteger::__clone() directly
     * in PHP5.  You can in PHP4 since it's not a magic method, but in PHP5, you have to call it by using the PHP5
     * only syntax of $y = clone $x.  As such, if you're trying to write an application that works on both PHP4 and
     * PHP5, call BigInteger::copy(), instead.
     *
     * @access public
     * @see self::copy()
     * @return \phpseclib\Math\BigInteger
     */
    function __clone()
    {
        return $this->copy();
    }

    /**
     *  __sleep() magic method
     *
     * Will be called, automatically, when serialize() is called on a BigInteger object.
     *
     * @see self::__wakeup()
     * @access public
     */
    function __sleep()
    {
        $this->hex = $this->toHex(true);
        $vars = array('hex');
        if ($this->precision > 0) {
            $vars[] = 'precision';
        }
        return $vars;
    }

    /**
     *  __wakeup() magic method
     *
     * Will be called, automatically, when unserialize() is called on a BigInteger object.
     *
     * @see self::__sleep()
     * @access public
     */
    function __wakeup()
    {
        $temp = new static($this->hex, -16);
        $this->value = $temp->value;
        $this->is_negative = $temp->is_negative;
        if ($this->precision > 0) {
            // recalculate $this->bitmask
            $this->setPrecision($this->precision);
        }
    }

    /**
     *  __debugInfo() magic method
     *
     * Will be called, automatically, when print_r() or var_dump() are called
     *
     * @access public
     */
    function __debugInfo()
    {
        $opts = array();
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $engine = 'gmp';
                break;
            case self::MODE_BCMATH:
                $engine = 'bcmath';
                break;
            case self::MODE_INTERNAL:
                $engine = 'internal';
                $opts[] = PHP_INT_SIZE == 8 ? '64-bit' : '32-bit';
        }
        if (MATH_BIGINTEGER_MODE != self::MODE_GMP && defined('MATH_BIGINTEGER_OPENSSL_ENABLED')) {
            $opts[] = 'OpenSSL';
        }
        if (!empty($opts)) {
            $engine.= ' (' . implode('.', $opts) . ')';
        }
        return array(
            'value' => '0x' . $this->toHex(true),
            'engine' => $engine
        );
    }

    /**
     * Adds two BigIntegers.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('10');
     *    $b = new \phpseclib\Math\BigInteger('20');
     *
     *    $c = $a->add($b);
     *
     *    echo $c->toString(); // outputs 30
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $y
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal Performs base-2**52 addition
     */
    function add($y)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_add($this->value, $y->value);

                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $temp = new static();
                $temp->value = bcadd($this->value, $y->value, 0);

                return $this->_normalize($temp);
        }

        $temp = $this->_add($this->value, $this->is_negative, $y->value, $y->is_negative);

        $result = new static();
        $result->value = $temp[self::VALUE];
        $result->is_negative = $temp[self::SIGN];

        return $this->_normalize($result);
    }

    /**
     * Performs addition.
     *
     * @param array $x_value
     * @param bool $x_negative
     * @param array $y_value
     * @param bool $y_negative
     * @return array
     * @access private
     */
    function _add($x_value, $x_negative, $y_value, $y_negative)
    {
        $x_size = count($x_value);
        $y_size = count($y_value);

        if ($x_size == 0) {
            return array(
                self::VALUE => $y_value,
                self::SIGN => $y_negative
            );
        } elseif ($y_size == 0) {
            return array(
                self::VALUE => $x_value,
                self::SIGN => $x_negative
            );
        }

        // subtract, if appropriate
        if ($x_negative != $y_negative) {
            if ($x_value == $y_value) {
                return array(
                    self::VALUE => array(),
                    self::SIGN => false
                );
            }

            $temp = $this->_subtract($x_value, false, $y_value, false);
            $temp[self::SIGN] = $this->_compare($x_value, false, $y_value, false) > 0 ?
                                          $x_negative : $y_negative;

            return $temp;
        }

        if ($x_size < $y_size) {
            $size = $x_size;
            $value = $y_value;
        } else {
            $size = $y_size;
            $value = $x_value;
        }

        $value[count($value)] = 0; // just in case the carry adds an extra digit

        $carry = 0;
        for ($i = 0, $j = 1; $j < $size; $i+=2, $j+=2) {
            $sum = $x_value[$j] * self::$baseFull + $x_value[$i] + $y_value[$j] * self::$baseFull + $y_value[$i] + $carry;
            $carry = $sum >= self::$maxDigit2; // eg. floor($sum / 2**52); only possible values (in any base) are 0 and 1
            $sum = $carry ? $sum - self::$maxDigit2 : $sum;

            $temp = self::$base === 26 ? intval($sum / 0x4000000) : ($sum >> 31);

            $value[$i] = (int) ($sum - self::$baseFull * $temp); // eg. a faster alternative to fmod($sum, 0x4000000)
            $value[$j] = $temp;
        }

        if ($j == $size) { // ie. if $y_size is odd
            $sum = $x_value[$i] + $y_value[$i] + $carry;
            $carry = $sum >= self::$baseFull;
            $value[$i] = $carry ? $sum - self::$baseFull : $sum;
            ++$i; // ie. let $i = $j since we've just done $value[$i]
        }

        if ($carry) {
            for (; $value[$i] == self::$maxDigit; ++$i) {
                $value[$i] = 0;
            }
            ++$value[$i];
        }

        return array(
            self::VALUE => $this->_trim($value),
            self::SIGN => $x_negative
        );
    }

    /**
     * Subtracts two BigIntegers.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('10');
     *    $b = new \phpseclib\Math\BigInteger('20');
     *
     *    $c = $a->subtract($b);
     *
     *    echo $c->toString(); // outputs -10
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $y
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal Performs base-2**52 subtraction
     */
    function subtract($y)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_sub($this->value, $y->value);

                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $temp = new static();
                $temp->value = bcsub($this->value, $y->value, 0);

                return $this->_normalize($temp);
        }

        $temp = $this->_subtract($this->value, $this->is_negative, $y->value, $y->is_negative);

        $result = new static();
        $result->value = $temp[self::VALUE];
        $result->is_negative = $temp[self::SIGN];

        return $this->_normalize($result);
    }

    /**
     * Performs subtraction.
     *
     * @param array $x_value
     * @param bool $x_negative
     * @param array $y_value
     * @param bool $y_negative
     * @return array
     * @access private
     */
    function _subtract($x_value, $x_negative, $y_value, $y_negative)
    {
        $x_size = count($x_value);
        $y_size = count($y_value);

        if ($x_size == 0) {
            return array(
                self::VALUE => $y_value,
                self::SIGN => !$y_negative
            );
        } elseif ($y_size == 0) {
            return array(
                self::VALUE => $x_value,
                self::SIGN => $x_negative
            );
        }

        // add, if appropriate (ie. -$x - +$y or +$x - -$y)
        if ($x_negative != $y_negative) {
            $temp = $this->_add($x_value, false, $y_value, false);
            $temp[self::SIGN] = $x_negative;

            return $temp;
        }

        $diff = $this->_compare($x_value, $x_negative, $y_value, $y_negative);

        if (!$diff) {
            return array(
                self::VALUE => array(),
                self::SIGN => false
            );
        }

        // switch $x and $y around, if appropriate.
        if ((!$x_negative && $diff < 0) || ($x_negative && $diff > 0)) {
            $temp = $x_value;
            $x_value = $y_value;
            $y_value = $temp;

            $x_negative = !$x_negative;

            $x_size = count($x_value);
            $y_size = count($y_value);
        }

        // at this point, $x_value should be at least as big as - if not bigger than - $y_value

        $carry = 0;
        for ($i = 0, $j = 1; $j < $y_size; $i+=2, $j+=2) {
            $sum = $x_value[$j] * self::$baseFull + $x_value[$i] - $y_value[$j] * self::$baseFull - $y_value[$i] - $carry;
            $carry = $sum < 0; // eg. floor($sum / 2**52); only possible values (in any base) are 0 and 1
            $sum = $carry ? $sum + self::$maxDigit2 : $sum;

            $temp = self::$base === 26 ? intval($sum / 0x4000000) : ($sum >> 31);

            $x_value[$i] = (int) ($sum - self::$baseFull * $temp);
            $x_value[$j] = $temp;
        }

        if ($j == $y_size) { // ie. if $y_size is odd
            $sum = $x_value[$i] - $y_value[$i] - $carry;
            $carry = $sum < 0;
            $x_value[$i] = $carry ? $sum + self::$baseFull : $sum;
            ++$i;
        }

        if ($carry) {
            for (; !$x_value[$i]; ++$i) {
                $x_value[$i] = self::$maxDigit;
            }
            --$x_value[$i];
        }

        return array(
            self::VALUE => $this->_trim($x_value),
            self::SIGN => $x_negative
        );
    }

    /**
     * Multiplies two BigIntegers
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('10');
     *    $b = new \phpseclib\Math\BigInteger('20');
     *
     *    $c = $a->multiply($b);
     *
     *    echo $c->toString(); // outputs 200
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $x
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function multiply($x)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_mul($this->value, $x->value);

                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $temp = new static();
                $temp->value = bcmul($this->value, $x->value, 0);

                return $this->_normalize($temp);
        }

        $temp = $this->_multiply($this->value, $this->is_negative, $x->value, $x->is_negative);

        $product = new static();
        $product->value = $temp[self::VALUE];
        $product->is_negative = $temp[self::SIGN];

        return $this->_normalize($product);
    }

    /**
     * Performs multiplication.
     *
     * @param array $x_value
     * @param bool $x_negative
     * @param array $y_value
     * @param bool $y_negative
     * @return array
     * @access private
     */
    function _multiply($x_value, $x_negative, $y_value, $y_negative)
    {
        //if ( $x_value == $y_value ) {
        //    return array(
        //        self::VALUE => $this->_square($x_value),
        //        self::SIGN => $x_sign != $y_value
        //    );
        //}

        $x_length = count($x_value);
        $y_length = count($y_value);

        if (!$x_length || !$y_length) { // a 0 is being multiplied
            return array(
                self::VALUE => array(),
                self::SIGN => false
            );
        }

        return array(
            self::VALUE => min($x_length, $y_length) < 2 * self::KARATSUBA_CUTOFF ?
                $this->_trim($this->_regularMultiply($x_value, $y_value)) :
                $this->_trim($this->_karatsuba($x_value, $y_value)),
            self::SIGN => $x_negative != $y_negative
        );
    }

    /**
     * Performs long multiplication on two BigIntegers
     *
     * Modeled after 'multiply' in MutableBigInteger.java.
     *
     * @param array $x_value
     * @param array $y_value
     * @return array
     * @access private
     */
    function _regularMultiply($x_value, $y_value)
    {
        $x_length = count($x_value);
        $y_length = count($y_value);

        if (!$x_length || !$y_length) { // a 0 is being multiplied
            return array();
        }

        if ($x_length < $y_length) {
            $temp = $x_value;
            $x_value = $y_value;
            $y_value = $temp;

            $x_length = count($x_value);
            $y_length = count($y_value);
        }

        $product_value = $this->_array_repeat(0, $x_length + $y_length);

        // the following for loop could be removed if the for loop following it
        // (the one with nested for loops) initially set $i to 0, but
        // doing so would also make the result in one set of unnecessary adds,
        // since on the outermost loops first pass, $product->value[$k] is going
        // to always be 0

        $carry = 0;

        for ($j = 0; $j < $x_length; ++$j) { // ie. $i = 0
            $temp = $x_value[$j] * $y_value[0] + $carry; // $product_value[$k] == 0
            $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
            $product_value[$j] = (int) ($temp - self::$baseFull * $carry);
        }

        $product_value[$j] = $carry;

        // the above for loop is what the previous comment was talking about.  the
        // following for loop is the "one with nested for loops"
        for ($i = 1; $i < $y_length; ++$i) {
            $carry = 0;

            for ($j = 0, $k = $i; $j < $x_length; ++$j, ++$k) {
                $temp = $product_value[$k] + $x_value[$j] * $y_value[$i] + $carry;
                $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
                $product_value[$k] = (int) ($temp - self::$baseFull * $carry);
            }

            $product_value[$k] = $carry;
        }

        return $product_value;
    }

    /**
     * Performs Karatsuba multiplication on two BigIntegers
     *
     * See {@link http://en.wikipedia.org/wiki/Karatsuba_algorithm Karatsuba algorithm} and
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=120 MPM 5.2.3}.
     *
     * @param array $x_value
     * @param array $y_value
     * @return array
     * @access private
     */
    function _karatsuba($x_value, $y_value)
    {
        $m = min(count($x_value) >> 1, count($y_value) >> 1);

        if ($m < self::KARATSUBA_CUTOFF) {
            return $this->_regularMultiply($x_value, $y_value);
        }

        $x1 = array_slice($x_value, $m);
        $x0 = array_slice($x_value, 0, $m);
        $y1 = array_slice($y_value, $m);
        $y0 = array_slice($y_value, 0, $m);

        $z2 = $this->_karatsuba($x1, $y1);
        $z0 = $this->_karatsuba($x0, $y0);

        $z1 = $this->_add($x1, false, $x0, false);
        $temp = $this->_add($y1, false, $y0, false);
        $z1 = $this->_karatsuba($z1[self::VALUE], $temp[self::VALUE]);
        $temp = $this->_add($z2, false, $z0, false);
        $z1 = $this->_subtract($z1, false, $temp[self::VALUE], false);

        $z2 = array_merge(array_fill(0, 2 * $m, 0), $z2);
        $z1[self::VALUE] = array_merge(array_fill(0, $m, 0), $z1[self::VALUE]);

        $xy = $this->_add($z2, false, $z1[self::VALUE], $z1[self::SIGN]);
        $xy = $this->_add($xy[self::VALUE], $xy[self::SIGN], $z0, false);

        return $xy[self::VALUE];
    }

    /**
     * Performs squaring
     *
     * @param array $x
     * @return array
     * @access private
     */
    function _square($x = false)
    {
        return count($x) < 2 * self::KARATSUBA_CUTOFF ?
            $this->_trim($this->_baseSquare($x)) :
            $this->_trim($this->_karatsubaSquare($x));
    }

    /**
     * Performs traditional squaring on two BigIntegers
     *
     * Squaring can be done faster than multiplying a number by itself can be.  See
     * {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=7 HAC 14.2.4} /
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=141 MPM 5.3} for more information.
     *
     * @param array $value
     * @return array
     * @access private
     */
    function _baseSquare($value)
    {
        if (empty($value)) {
            return array();
        }
        $square_value = $this->_array_repeat(0, 2 * count($value));

        for ($i = 0, $max_index = count($value) - 1; $i <= $max_index; ++$i) {
            $i2 = $i << 1;

            $temp = $square_value[$i2] + $value[$i] * $value[$i];
            $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
            $square_value[$i2] = (int) ($temp - self::$baseFull * $carry);

            // note how we start from $i+1 instead of 0 as we do in multiplication.
            for ($j = $i + 1, $k = $i2 + 1; $j <= $max_index; ++$j, ++$k) {
                $temp = $square_value[$k] + 2 * $value[$j] * $value[$i] + $carry;
                $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
                $square_value[$k] = (int) ($temp - self::$baseFull * $carry);
            }

            // the following line can yield values larger 2**15.  at this point, PHP should switch
            // over to floats.
            $square_value[$i + $max_index + 1] = $carry;
        }

        return $square_value;
    }

    /**
     * Performs Karatsuba "squaring" on two BigIntegers
     *
     * See {@link http://en.wikipedia.org/wiki/Karatsuba_algorithm Karatsuba algorithm} and
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=151 MPM 5.3.4}.
     *
     * @param array $value
     * @return array
     * @access private
     */
    function _karatsubaSquare($value)
    {
        $m = count($value) >> 1;

        if ($m < self::KARATSUBA_CUTOFF) {
            return $this->_baseSquare($value);
        }

        $x1 = array_slice($value, $m);
        $x0 = array_slice($value, 0, $m);

        $z2 = $this->_karatsubaSquare($x1);
        $z0 = $this->_karatsubaSquare($x0);

        $z1 = $this->_add($x1, false, $x0, false);
        $z1 = $this->_karatsubaSquare($z1[self::VALUE]);
        $temp = $this->_add($z2, false, $z0, false);
        $z1 = $this->_subtract($z1, false, $temp[self::VALUE], false);

        $z2 = array_merge(array_fill(0, 2 * $m, 0), $z2);
        $z1[self::VALUE] = array_merge(array_fill(0, $m, 0), $z1[self::VALUE]);

        $xx = $this->_add($z2, false, $z1[self::VALUE], $z1[self::SIGN]);
        $xx = $this->_add($xx[self::VALUE], $xx[self::SIGN], $z0, false);

        return $xx[self::VALUE];
    }

    /**
     * Divides two BigIntegers.
     *
     * Returns an array whose first element contains the quotient and whose second element contains the
     * "common residue".  If the remainder would be positive, the "common residue" and the remainder are the
     * same.  If the remainder would be negative, the "common residue" is equal to the sum of the remainder
     * and the divisor (basically, the "common residue" is the first positive modulo).
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('10');
     *    $b = new \phpseclib\Math\BigInteger('20');
     *
     *    list($quotient, $remainder) = $a->divide($b);
     *
     *    echo $quotient->toString(); // outputs 0
     *    echo "\r\n";
     *    echo $remainder->toString(); // outputs 10
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $y
     * @return array
     * @access public
     * @internal This function is based off of {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=9 HAC 14.20}.
     */
    function divide($y)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $quotient = new static();
                $remainder = new static();

                list($quotient->value, $remainder->value) = gmp_div_qr($this->value, $y->value);

                if (gmp_sign($remainder->value) < 0) {
                    $remainder->value = gmp_add($remainder->value, gmp_abs($y->value));
                }

                return array($this->_normalize($quotient), $this->_normalize($remainder));
            case self::MODE_BCMATH:
                $quotient = new static();
                $remainder = new static();

                $quotient->value = bcdiv($this->value, $y->value, 0);
                $remainder->value = bcmod($this->value, $y->value);

                if ($remainder->value[0] == '-') {
                    $remainder->value = bcadd($remainder->value, $y->value[0] == '-' ? substr($y->value, 1) : $y->value, 0);
                }

                return array($this->_normalize($quotient), $this->_normalize($remainder));
        }

        if (count($y->value) == 1) {
            list($q, $r) = $this->_divide_digit($this->value, $y->value[0]);
            $quotient = new static();
            $remainder = new static();
            $quotient->value = $q;
            $remainder->value = array($r);
            $quotient->is_negative = $this->is_negative != $y->is_negative;
            return array($this->_normalize($quotient), $this->_normalize($remainder));
        }

        static $zero;
        if (!isset($zero)) {
            $zero = new static();
        }

        $x = $this->copy();
        $y = $y->copy();

        $x_sign = $x->is_negative;
        $y_sign = $y->is_negative;

        $x->is_negative = $y->is_negative = false;

        $diff = $x->compare($y);

        if (!$diff) {
            $temp = new static();
            $temp->value = array(1);
            $temp->is_negative = $x_sign != $y_sign;
            return array($this->_normalize($temp), $this->_normalize(new static()));
        }

        if ($diff < 0) {
            // if $x is negative, "add" $y.
            if ($x_sign) {
                $x = $y->subtract($x);
            }
            return array($this->_normalize(new static()), $this->_normalize($x));
        }

        // normalize $x and $y as described in HAC 14.23 / 14.24
        $msb = $y->value[count($y->value) - 1];
        for ($shift = 0; !($msb & self::$msb); ++$shift) {
            $msb <<= 1;
        }
        $x->_lshift($shift);
        $y->_lshift($shift);
        $y_value = &$y->value;

        $x_max = count($x->value) - 1;
        $y_max = count($y->value) - 1;

        $quotient = new static();
        $quotient_value = &$quotient->value;
        $quotient_value = $this->_array_repeat(0, $x_max - $y_max + 1);

        static $temp, $lhs, $rhs;
        if (!isset($temp)) {
            $temp = new static();
            $lhs =  new static();
            $rhs =  new static();
        }
        $temp_value = &$temp->value;
        $rhs_value =  &$rhs->value;

        // $temp = $y << ($x_max - $y_max-1) in base 2**26
        $temp_value = array_merge($this->_array_repeat(0, $x_max - $y_max), $y_value);

        while ($x->compare($temp) >= 0) {
            // calculate the "common residue"
            ++$quotient_value[$x_max - $y_max];
            $x = $x->subtract($temp);
            $x_max = count($x->value) - 1;
        }

        for ($i = $x_max; $i >= $y_max + 1; --$i) {
            $x_value = &$x->value;
            $x_window = array(
                isset($x_value[$i]) ? $x_value[$i] : 0,
                isset($x_value[$i - 1]) ? $x_value[$i - 1] : 0,
                isset($x_value[$i - 2]) ? $x_value[$i - 2] : 0
            );
            $y_window = array(
                $y_value[$y_max],
                ($y_max > 0) ? $y_value[$y_max - 1] : 0
            );

            $q_index = $i - $y_max - 1;
            if ($x_window[0] == $y_window[0]) {
                $quotient_value[$q_index] = self::$maxDigit;
            } else {
                $quotient_value[$q_index] = $this->_safe_divide(
                    $x_window[0] * self::$baseFull + $x_window[1],
                    $y_window[0]
                );
            }

            $temp_value = array($y_window[1], $y_window[0]);

            $lhs->value = array($quotient_value[$q_index]);
            $lhs = $lhs->multiply($temp);

            $rhs_value = array($x_window[2], $x_window[1], $x_window[0]);

            while ($lhs->compare($rhs) > 0) {
                --$quotient_value[$q_index];

                $lhs->value = array($quotient_value[$q_index]);
                $lhs = $lhs->multiply($temp);
            }

            $adjust = $this->_array_repeat(0, $q_index);
            $temp_value = array($quotient_value[$q_index]);
            $temp = $temp->multiply($y);
            $temp_value = &$temp->value;
            if (count($temp_value)) {
                $temp_value = array_merge($adjust, $temp_value);
            }

            $x = $x->subtract($temp);

            if ($x->compare($zero) < 0) {
                $temp_value = array_merge($adjust, $y_value);
                $x = $x->add($temp);

                --$quotient_value[$q_index];
            }

            $x_max = count($x_value) - 1;
        }

        // unnormalize the remainder
        $x->_rshift($shift);

        $quotient->is_negative = $x_sign != $y_sign;

        // calculate the "common residue", if appropriate
        if ($x_sign) {
            $y->_rshift($shift);
            $x = $y->subtract($x);
        }

        return array($this->_normalize($quotient), $this->_normalize($x));
    }

    /**
     * Divides a BigInteger by a regular integer
     *
     * abc / x = a00 / x + b0 / x + c / x
     *
     * @param array $dividend
     * @param array $divisor
     * @return array
     * @access private
     */
    function _divide_digit($dividend, $divisor)
    {
        $carry = 0;
        $result = array();

        for ($i = count($dividend) - 1; $i >= 0; --$i) {
            $temp = self::$baseFull * $carry + $dividend[$i];
            $result[$i] = $this->_safe_divide($temp, $divisor);
            $carry = (int) ($temp - $divisor * $result[$i]);
        }

        return array($result, $carry);
    }

    /**
     * Performs modular exponentiation.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger('10');
     *    $b = new \phpseclib\Math\BigInteger('20');
     *    $c = new \phpseclib\Math\BigInteger('30');
     *
     *    $c = $a->modPow($b, $c);
     *
     *    echo $c->toString(); // outputs 10
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $e
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal The most naive approach to modular exponentiation has very unreasonable requirements, and
     *    and although the approach involving repeated squaring does vastly better, it, too, is impractical
     *    for our purposes.  The reason being that division - by far the most complicated and time-consuming
     *    of the basic operations (eg. +,-,*,/) - occurs multiple times within it.
     *
     *    Modular reductions resolve this issue.  Although an individual modular reduction takes more time
     *    then an individual division, when performed in succession (with the same modulo), they're a lot faster.
     *
     *    The two most commonly used modular reductions are Barrett and Montgomery reduction.  Montgomery reduction,
     *    although faster, only works when the gcd of the modulo and of the base being used is 1.  In RSA, when the
     *    base is a power of two, the modulo - a product of two primes - is always going to have a gcd of 1 (because
     *    the product of two odd numbers is odd), but what about when RSA isn't used?
     *
     *    In contrast, Barrett reduction has no such constraint.  As such, some bigint implementations perform a
     *    Barrett reduction after every operation in the modpow function.  Others perform Barrett reductions when the
     *    modulo is even and Montgomery reductions when the modulo is odd.  BigInteger.java's modPow method, however,
     *    uses a trick involving the Chinese Remainder Theorem to factor the even modulo into two numbers - one odd and
     *    the other, a power of two - and recombine them, later.  This is the method that this modPow function uses.
     *    {@link http://islab.oregonstate.edu/papers/j34monex.pdf Montgomery Reduction with Even Modulus} elaborates.
     */
    function modPow($e, $n)
    {
        $n = $this->bitmask !== false && $this->bitmask->compare($n) < 0 ? $this->bitmask : $n->abs();

        if ($e->compare(new static()) < 0) {
            $e = $e->abs();

            $temp = $this->modInverse($n);
            if ($temp === false) {
                return false;
            }

            return $this->_normalize($temp->modPow($e, $n));
        }

        if (MATH_BIGINTEGER_MODE == self::MODE_GMP) {
            $temp = new static();
            $temp->value = gmp_powm($this->value, $e->value, $n->value);

            return $this->_normalize($temp);
        }

        if ($this->compare(new static()) < 0 || $this->compare($n) > 0) {
            list(, $temp) = $this->divide($n);
            return $temp->modPow($e, $n);
        }

        if (defined('MATH_BIGINTEGER_OPENSSL_ENABLED')) {
            $components = array(
                'modulus' => $n->toBytes(true),
                'publicExponent' => $e->toBytes(true)
            );

            $components = array(
                'modulus' => pack('Ca*a*', 2, $this->_encodeASN1Length(strlen($components['modulus'])), $components['modulus']),
                'publicExponent' => pack('Ca*a*', 2, $this->_encodeASN1Length(strlen($components['publicExponent'])), $components['publicExponent'])
            );

            $RSAPublicKey = pack(
                'Ca*a*a*',
                48,
                $this->_encodeASN1Length(strlen($components['modulus']) + strlen($components['publicExponent'])),
                $components['modulus'],
                $components['publicExponent']
            );

            $rsaOID = pack('H*', '300d06092a864886f70d0101010500'); // hex version of MA0GCSqGSIb3DQEBAQUA
            $RSAPublicKey = chr(0) . $RSAPublicKey;
            $RSAPublicKey = chr(3) . $this->_encodeASN1Length(strlen($RSAPublicKey)) . $RSAPublicKey;

            $encapsulated = pack(
                'Ca*a*',
                48,
                $this->_encodeASN1Length(strlen($rsaOID . $RSAPublicKey)),
                $rsaOID . $RSAPublicKey
            );

            $RSAPublicKey = "-----BEGIN PUBLIC KEY-----\r\n" .
                             chunk_split(base64_encode($encapsulated)) .
                             '-----END PUBLIC KEY-----';

            $plaintext = str_pad($this->toBytes(), strlen($n->toBytes(true)) - 1, "\0", STR_PAD_LEFT);

            if (openssl_public_encrypt($plaintext, $result, $RSAPublicKey, OPENSSL_NO_PADDING)) {
                return new static($result, 256);
            }
        }

        if (MATH_BIGINTEGER_MODE == self::MODE_BCMATH) {
            $temp = new static();
            $temp->value = bcpowmod($this->value, $e->value, $n->value, 0);

            return $this->_normalize($temp);
        }

        if (empty($e->value)) {
            $temp = new static();
            $temp->value = array(1);
            return $this->_normalize($temp);
        }

        if ($e->value == array(1)) {
            list(, $temp) = $this->divide($n);
            return $this->_normalize($temp);
        }

        if ($e->value == array(2)) {
            $temp = new static();
            $temp->value = $this->_square($this->value);
            list(, $temp) = $temp->divide($n);
            return $this->_normalize($temp);
        }

        return $this->_normalize($this->_slidingWindow($e, $n, self::BARRETT));

        // the following code, although not callable, can be run independently of the above code
        // although the above code performed better in my benchmarks the following could might
        // perform better under different circumstances. in lieu of deleting it it's just been
        // made uncallable

        // is the modulo odd?
        if ($n->value[0] & 1) {
            return $this->_normalize($this->_slidingWindow($e, $n, self::MONTGOMERY));
        }
        // if it's not, it's even

        // find the lowest set bit (eg. the max pow of 2 that divides $n)
        for ($i = 0; $i < count($n->value); ++$i) {
            if ($n->value[$i]) {
                $temp = decbin($n->value[$i]);
                $j = strlen($temp) - strrpos($temp, '1') - 1;
                $j+= 26 * $i;
                break;
            }
        }
        // at this point, 2^$j * $n/(2^$j) == $n

        $mod1 = $n->copy();
        $mod1->_rshift($j);
        $mod2 = new static();
        $mod2->value = array(1);
        $mod2->_lshift($j);

        $part1 = ($mod1->value != array(1)) ? $this->_slidingWindow($e, $mod1, self::MONTGOMERY) : new static();
        $part2 = $this->_slidingWindow($e, $mod2, self::POWEROF2);

        $y1 = $mod2->modInverse($mod1);
        $y2 = $mod1->modInverse($mod2);

        $result = $part1->multiply($mod2);
        $result = $result->multiply($y1);

        $temp = $part2->multiply($mod1);
        $temp = $temp->multiply($y2);

        $result = $result->add($temp);
        list(, $result) = $result->divide($n);

        return $this->_normalize($result);
    }

    /**
     * Performs modular exponentiation.
     *
     * Alias for modPow().
     *
     * @param \phpseclib\Math\BigInteger $e
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function powMod($e, $n)
    {
        return $this->modPow($e, $n);
    }

    /**
     * Sliding Window k-ary Modular Exponentiation
     *
     * Based on {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=27 HAC 14.85} /
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=210 MPM 7.7}.  In a departure from those algorithims,
     * however, this function performs a modular reduction after every multiplication and squaring operation.
     * As such, this function has the same preconditions that the reductions being used do.
     *
     * @param \phpseclib\Math\BigInteger $e
     * @param \phpseclib\Math\BigInteger $n
     * @param int $mode
     * @return \phpseclib\Math\BigInteger
     * @access private
     */
    function _slidingWindow($e, $n, $mode)
    {
        static $window_ranges = array(7, 25, 81, 241, 673, 1793); // from BigInteger.java's oddModPow function
        //static $window_ranges = array(0, 7, 36, 140, 450, 1303, 3529); // from MPM 7.3.1

        $e_value = $e->value;
        $e_length = count($e_value) - 1;
        $e_bits = decbin($e_value[$e_length]);
        for ($i = $e_length - 1; $i >= 0; --$i) {
            $e_bits.= str_pad(decbin($e_value[$i]), self::$base, '0', STR_PAD_LEFT);
        }

        $e_length = strlen($e_bits);

        // calculate the appropriate window size.
        // $window_size == 3 if $window_ranges is between 25 and 81, for example.
        for ($i = 0, $window_size = 1; $i < count($window_ranges) && $e_length > $window_ranges[$i]; ++$window_size, ++$i) {
        }

        $n_value = $n->value;

        // precompute $this^0 through $this^$window_size
        $powers = array();
        $powers[1] = $this->_prepareReduce($this->value, $n_value, $mode);
        $powers[2] = $this->_squareReduce($powers[1], $n_value, $mode);

        // we do every other number since substr($e_bits, $i, $j+1) (see below) is supposed to end
        // in a 1.  ie. it's supposed to be odd.
        $temp = 1 << ($window_size - 1);
        for ($i = 1; $i < $temp; ++$i) {
            $i2 = $i << 1;
            $powers[$i2 + 1] = $this->_multiplyReduce($powers[$i2 - 1], $powers[2], $n_value, $mode);
        }

        $result = array(1);
        $result = $this->_prepareReduce($result, $n_value, $mode);

        for ($i = 0; $i < $e_length;) {
            if (!$e_bits[$i]) {
                $result = $this->_squareReduce($result, $n_value, $mode);
                ++$i;
            } else {
                for ($j = $window_size - 1; $j > 0; --$j) {
                    if (!empty($e_bits[$i + $j])) {
                        break;
                    }
                }

                // eg. the length of substr($e_bits, $i, $j + 1)
                for ($k = 0; $k <= $j; ++$k) {
                    $result = $this->_squareReduce($result, $n_value, $mode);
                }

                $result = $this->_multiplyReduce($result, $powers[bindec(substr($e_bits, $i, $j + 1))], $n_value, $mode);

                $i += $j + 1;
            }
        }

        $temp = new static();
        $temp->value = $this->_reduce($result, $n_value, $mode);

        return $temp;
    }

    /**
     * Modular reduction
     *
     * For most $modes this will return the remainder.
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @param int $mode
     * @return array
     */
    function _reduce($x, $n, $mode)
    {
        switch ($mode) {
            case self::MONTGOMERY:
                return $this->_montgomery($x, $n);
            case self::BARRETT:
                return $this->_barrett($x, $n);
            case self::POWEROF2:
                $lhs = new static();
                $lhs->value = $x;
                $rhs = new static();
                $rhs->value = $n;
                return $x->_mod2($n);
            case self::CLASSIC:
                $lhs = new static();
                $lhs->value = $x;
                $rhs = new static();
                $rhs->value = $n;
                list(, $temp) = $lhs->divide($rhs);
                return $temp->value;
            case self::NONE:
                return $x;
            default:
                // an invalid $mode was provided
        }
    }

    /**
     * Modular reduction preperation
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @param int $mode
     * @return array
     */
    function _prepareReduce($x, $n, $mode)
    {
        if ($mode == self::MONTGOMERY) {
            return $this->_prepMontgomery($x, $n);
        }
        return $this->_reduce($x, $n, $mode);
    }

    /**
     * Modular multiply
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $y
     * @param array $n
     * @param int $mode
     * @return array
     */
    function _multiplyReduce($x, $y, $n, $mode)
    {
        if ($mode == self::MONTGOMERY) {
            return $this->_montgomeryMultiply($x, $y, $n);
        }
        $temp = $this->_multiply($x, false, $y, false);
        return $this->_reduce($temp[self::VALUE], $n, $mode);
    }

    /**
     * Modular square
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @param int $mode
     * @return array
     */
    function _squareReduce($x, $n, $mode)
    {
        if ($mode == self::MONTGOMERY) {
            return $this->_montgomeryMultiply($x, $x, $n);
        }
        return $this->_reduce($this->_square($x), $n, $mode);
    }

    /**
     * Modulos for Powers of Two
     *
     * Calculates $x%$n, where $n = 2**$e, for some $e.  Since this is basically the same as doing $x & ($n-1),
     * we'll just use this function as a wrapper for doing that.
     *
     * @see self::_slidingWindow()
     * @access private
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger
     */
    function _mod2($n)
    {
        $temp = new static();
        $temp->value = array(1);
        return $this->bitwise_and($n->subtract($temp));
    }

    /**
     * Barrett Modular Reduction
     *
     * See {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=14 HAC 14.3.3} /
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=165 MPM 6.2.5} for more information.  Modified slightly,
     * so as not to require negative numbers (initially, this script didn't support negative numbers).
     *
     * Employs "folding", as described at
     * {@link http://www.cosic.esat.kuleuven.be/publications/thesis-149.pdf#page=66 thesis-149.pdf#page=66}.  To quote from
     * it, "the idea [behind folding] is to find a value x' such that x (mod m) = x' (mod m), with x' being smaller than x."
     *
     * Unfortunately, the "Barrett Reduction with Folding" algorithm described in thesis-149.pdf is not, as written, all that
     * usable on account of (1) its not using reasonable radix points as discussed in
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=162 MPM 6.2.2} and (2) the fact that, even with reasonable
     * radix points, it only works when there are an even number of digits in the denominator.  The reason for (2) is that
     * (x >> 1) + (x >> 1) != x / 2 + x / 2.  If x is even, they're the same, but if x is odd, they're not.  See the in-line
     * comments for details.
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $n
     * @param array $m
     * @return array
     */
    function _barrett($n, $m)
    {
        static $cache = array(
            self::VARIABLE => array(),
            self::DATA => array()
        );

        $m_length = count($m);

        // if ($this->_compare($n, $this->_square($m)) >= 0) {
        if (count($n) > 2 * $m_length) {
            $lhs = new static();
            $rhs = new static();
            $lhs->value = $n;
            $rhs->value = $m;
            list(, $temp) = $lhs->divide($rhs);
            return $temp->value;
        }

        // if (m.length >> 1) + 2 <= m.length then m is too small and n can't be reduced
        if ($m_length < 5) {
            return $this->_regularBarrett($n, $m);
        }

        // n = 2 * m.length

        if (($key = array_search($m, $cache[self::VARIABLE])) === false) {
            $key = count($cache[self::VARIABLE]);
            $cache[self::VARIABLE][] = $m;

            $lhs = new static();
            $lhs_value = &$lhs->value;
            $lhs_value = $this->_array_repeat(0, $m_length + ($m_length >> 1));
            $lhs_value[] = 1;
            $rhs = new static();
            $rhs->value = $m;

            list($u, $m1) = $lhs->divide($rhs);
            $u = $u->value;
            $m1 = $m1->value;

            $cache[self::DATA][] = array(
                'u' => $u, // m.length >> 1 (technically (m.length >> 1) + 1)
                'm1'=> $m1 // m.length
            );
        } else {
            extract($cache[self::DATA][$key]);
        }

        $cutoff = $m_length + ($m_length >> 1);
        $lsd = array_slice($n, 0, $cutoff); // m.length + (m.length >> 1)
        $msd = array_slice($n, $cutoff);    // m.length >> 1
        $lsd = $this->_trim($lsd);
        $temp = $this->_multiply($msd, false, $m1, false);
        $n = $this->_add($lsd, false, $temp[self::VALUE], false); // m.length + (m.length >> 1) + 1

        if ($m_length & 1) {
            return $this->_regularBarrett($n[self::VALUE], $m);
        }

        // (m.length + (m.length >> 1) + 1) - (m.length - 1) == (m.length >> 1) + 2
        $temp = array_slice($n[self::VALUE], $m_length - 1);
        // if even: ((m.length >> 1) + 2) + (m.length >> 1) == m.length + 2
        // if odd:  ((m.length >> 1) + 2) + (m.length >> 1) == (m.length - 1) + 2 == m.length + 1
        $temp = $this->_multiply($temp, false, $u, false);
        // if even: (m.length + 2) - ((m.length >> 1) + 1) = m.length - (m.length >> 1) + 1
        // if odd:  (m.length + 1) - ((m.length >> 1) + 1) = m.length - (m.length >> 1)
        $temp = array_slice($temp[self::VALUE], ($m_length >> 1) + 1);
        // if even: (m.length - (m.length >> 1) + 1) + m.length = 2 * m.length - (m.length >> 1) + 1
        // if odd:  (m.length - (m.length >> 1)) + m.length     = 2 * m.length - (m.length >> 1)
        $temp = $this->_multiply($temp, false, $m, false);

        // at this point, if m had an odd number of digits, we'd be subtracting a 2 * m.length - (m.length >> 1) digit
        // number from a m.length + (m.length >> 1) + 1 digit number.  ie. there'd be an extra digit and the while loop
        // following this comment would loop a lot (hence our calling _regularBarrett() in that situation).

        $result = $this->_subtract($n[self::VALUE], false, $temp[self::VALUE], false);

        while ($this->_compare($result[self::VALUE], $result[self::SIGN], $m, false) >= 0) {
            $result = $this->_subtract($result[self::VALUE], $result[self::SIGN], $m, false);
        }

        return $result[self::VALUE];
    }

    /**
     * (Regular) Barrett Modular Reduction
     *
     * For numbers with more than four digits BigInteger::_barrett() is faster.  The difference between that and this
     * is that this function does not fold the denominator into a smaller form.
     *
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @return array
     */
    function _regularBarrett($x, $n)
    {
        static $cache = array(
            self::VARIABLE => array(),
            self::DATA => array()
        );

        $n_length = count($n);

        if (count($x) > 2 * $n_length) {
            $lhs = new static();
            $rhs = new static();
            $lhs->value = $x;
            $rhs->value = $n;
            list(, $temp) = $lhs->divide($rhs);
            return $temp->value;
        }

        if (($key = array_search($n, $cache[self::VARIABLE])) === false) {
            $key = count($cache[self::VARIABLE]);
            $cache[self::VARIABLE][] = $n;
            $lhs = new static();
            $lhs_value = &$lhs->value;
            $lhs_value = $this->_array_repeat(0, 2 * $n_length);
            $lhs_value[] = 1;
            $rhs = new static();
            $rhs->value = $n;
            list($temp, ) = $lhs->divide($rhs); // m.length
            $cache[self::DATA][] = $temp->value;
        }

        // 2 * m.length - (m.length - 1) = m.length + 1
        $temp = array_slice($x, $n_length - 1);
        // (m.length + 1) + m.length = 2 * m.length + 1
        $temp = $this->_multiply($temp, false, $cache[self::DATA][$key], false);
        // (2 * m.length + 1) - (m.length - 1) = m.length + 2
        $temp = array_slice($temp[self::VALUE], $n_length + 1);

        // m.length + 1
        $result = array_slice($x, 0, $n_length + 1);
        // m.length + 1
        $temp = $this->_multiplyLower($temp, false, $n, false, $n_length + 1);
        // $temp == array_slice($temp->_multiply($temp, false, $n, false)->value, 0, $n_length + 1)

        if ($this->_compare($result, false, $temp[self::VALUE], $temp[self::SIGN]) < 0) {
            $corrector_value = $this->_array_repeat(0, $n_length + 1);
            $corrector_value[count($corrector_value)] = 1;
            $result = $this->_add($result, false, $corrector_value, false);
            $result = $result[self::VALUE];
        }

        // at this point, we're subtracting a number with m.length + 1 digits from another number with m.length + 1 digits
        $result = $this->_subtract($result, false, $temp[self::VALUE], $temp[self::SIGN]);
        while ($this->_compare($result[self::VALUE], $result[self::SIGN], $n, false) > 0) {
            $result = $this->_subtract($result[self::VALUE], $result[self::SIGN], $n, false);
        }

        return $result[self::VALUE];
    }

    /**
     * Performs long multiplication up to $stop digits
     *
     * If you're going to be doing array_slice($product->value, 0, $stop), some cycles can be saved.
     *
     * @see self::_regularBarrett()
     * @param array $x_value
     * @param bool $x_negative
     * @param array $y_value
     * @param bool $y_negative
     * @param int $stop
     * @return array
     * @access private
     */
    function _multiplyLower($x_value, $x_negative, $y_value, $y_negative, $stop)
    {
        $x_length = count($x_value);
        $y_length = count($y_value);

        if (!$x_length || !$y_length) { // a 0 is being multiplied
            return array(
                self::VALUE => array(),
                self::SIGN => false
            );
        }

        if ($x_length < $y_length) {
            $temp = $x_value;
            $x_value = $y_value;
            $y_value = $temp;

            $x_length = count($x_value);
            $y_length = count($y_value);
        }

        $product_value = $this->_array_repeat(0, $x_length + $y_length);

        // the following for loop could be removed if the for loop following it
        // (the one with nested for loops) initially set $i to 0, but
        // doing so would also make the result in one set of unnecessary adds,
        // since on the outermost loops first pass, $product->value[$k] is going
        // to always be 0

        $carry = 0;

        for ($j = 0; $j < $x_length; ++$j) { // ie. $i = 0, $k = $i
            $temp = $x_value[$j] * $y_value[0] + $carry; // $product_value[$k] == 0
            $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
            $product_value[$j] = (int) ($temp - self::$baseFull * $carry);
        }

        if ($j < $stop) {
            $product_value[$j] = $carry;
        }

        // the above for loop is what the previous comment was talking about.  the
        // following for loop is the "one with nested for loops"

        for ($i = 1; $i < $y_length; ++$i) {
            $carry = 0;

            for ($j = 0, $k = $i; $j < $x_length && $k < $stop; ++$j, ++$k) {
                $temp = $product_value[$k] + $x_value[$j] * $y_value[$i] + $carry;
                $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
                $product_value[$k] = (int) ($temp - self::$baseFull * $carry);
            }

            if ($k < $stop) {
                $product_value[$k] = $carry;
            }
        }

        return array(
            self::VALUE => $this->_trim($product_value),
            self::SIGN => $x_negative != $y_negative
        );
    }

    /**
     * Montgomery Modular Reduction
     *
     * ($x->_prepMontgomery($n))->_montgomery($n) yields $x % $n.
     * {@link http://math.libtomcrypt.com/files/tommath.pdf#page=170 MPM 6.3} provides insights on how this can be
     * improved upon (basically, by using the comba method).  gcd($n, 2) must be equal to one for this function
     * to work correctly.
     *
     * @see self::_prepMontgomery()
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @return array
     */
    function _montgomery($x, $n)
    {
        static $cache = array(
            self::VARIABLE => array(),
            self::DATA => array()
        );

        if (($key = array_search($n, $cache[self::VARIABLE])) === false) {
            $key = count($cache[self::VARIABLE]);
            $cache[self::VARIABLE][] = $x;
            $cache[self::DATA][] = $this->_modInverse67108864($n);
        }

        $k = count($n);

        $result = array(self::VALUE => $x);

        for ($i = 0; $i < $k; ++$i) {
            $temp = $result[self::VALUE][$i] * $cache[self::DATA][$key];
            $temp = $temp - self::$baseFull * (self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31));
            $temp = $this->_regularMultiply(array($temp), $n);
            $temp = array_merge($this->_array_repeat(0, $i), $temp);
            $result = $this->_add($result[self::VALUE], false, $temp, false);
        }

        $result[self::VALUE] = array_slice($result[self::VALUE], $k);

        if ($this->_compare($result, false, $n, false) >= 0) {
            $result = $this->_subtract($result[self::VALUE], false, $n, false);
        }

        return $result[self::VALUE];
    }

    /**
     * Montgomery Multiply
     *
     * Interleaves the montgomery reduction and long multiplication algorithms together as described in
     * {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=13 HAC 14.36}
     *
     * @see self::_prepMontgomery()
     * @see self::_montgomery()
     * @access private
     * @param array $x
     * @param array $y
     * @param array $m
     * @return array
     */
    function _montgomeryMultiply($x, $y, $m)
    {
        $temp = $this->_multiply($x, false, $y, false);
        return $this->_montgomery($temp[self::VALUE], $m);

        // the following code, although not callable, can be run independently of the above code
        // although the above code performed better in my benchmarks the following could might
        // perform better under different circumstances. in lieu of deleting it it's just been
        // made uncallable

        static $cache = array(
            self::VARIABLE => array(),
            self::DATA => array()
        );

        if (($key = array_search($m, $cache[self::VARIABLE])) === false) {
            $key = count($cache[self::VARIABLE]);
            $cache[self::VARIABLE][] = $m;
            $cache[self::DATA][] = $this->_modInverse67108864($m);
        }

        $n = max(count($x), count($y), count($m));
        $x = array_pad($x, $n, 0);
        $y = array_pad($y, $n, 0);
        $m = array_pad($m, $n, 0);
        $a = array(self::VALUE => $this->_array_repeat(0, $n + 1));
        for ($i = 0; $i < $n; ++$i) {
            $temp = $a[self::VALUE][0] + $x[$i] * $y[0];
            $temp = $temp - self::$baseFull * (self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31));
            $temp = $temp * $cache[self::DATA][$key];
            $temp = $temp - self::$baseFull * (self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31));
            $temp = $this->_add($this->_regularMultiply(array($x[$i]), $y), false, $this->_regularMultiply(array($temp), $m), false);
            $a = $this->_add($a[self::VALUE], false, $temp[self::VALUE], false);
            $a[self::VALUE] = array_slice($a[self::VALUE], 1);
        }
        if ($this->_compare($a[self::VALUE], false, $m, false) >= 0) {
            $a = $this->_subtract($a[self::VALUE], false, $m, false);
        }
        return $a[self::VALUE];
    }

    /**
     * Prepare a number for use in Montgomery Modular Reductions
     *
     * @see self::_montgomery()
     * @see self::_slidingWindow()
     * @access private
     * @param array $x
     * @param array $n
     * @return array
     */
    function _prepMontgomery($x, $n)
    {
        $lhs = new static();
        $lhs->value = array_merge($this->_array_repeat(0, count($n)), $x);
        $rhs = new static();
        $rhs->value = $n;

        list(, $temp) = $lhs->divide($rhs);
        return $temp->value;
    }

    /**
     * Modular Inverse of a number mod 2**26 (eg. 67108864)
     *
     * Based off of the bnpInvDigit function implemented and justified in the following URL:
     *
     * {@link http://www-cs-students.stanford.edu/~tjw/jsbn/jsbn.js}
     *
     * The following URL provides more info:
     *
     * {@link http://groups.google.com/group/sci.crypt/msg/7a137205c1be7d85}
     *
     * As for why we do all the bitmasking...  strange things can happen when converting from floats to ints. For
     * instance, on some computers, var_dump((int) -4294967297) yields int(-1) and on others, it yields
     * int(-2147483648).  To avoid problems stemming from this, we use bitmasks to guarantee that ints aren't
     * auto-converted to floats.  The outermost bitmask is present because without it, there's no guarantee that
     * the "residue" returned would be the so-called "common residue".  We use fmod, in the last step, because the
     * maximum possible $x is 26 bits and the maximum $result is 16 bits.  Thus, we have to be able to handle up to
     * 40 bits, which only 64-bit floating points will support.
     *
     * Thanks to Pedro Gimeno Fortea for input!
     *
     * @see self::_montgomery()
     * @access private
     * @param array $x
     * @return int
     */
    function _modInverse67108864($x) // 2**26 == 67,108,864
    {
        $x = -$x[0];
        $result = $x & 0x3; // x**-1 mod 2**2
        $result = ($result * (2 - $x * $result)) & 0xF; // x**-1 mod 2**4
        $result = ($result * (2 - ($x & 0xFF) * $result))  & 0xFF; // x**-1 mod 2**8
        $result = ($result * ((2 - ($x & 0xFFFF) * $result) & 0xFFFF)) & 0xFFFF; // x**-1 mod 2**16
        $result = fmod($result * (2 - fmod($x * $result, self::$baseFull)), self::$baseFull); // x**-1 mod 2**26
        return $result & self::$maxDigit;
    }

    /**
     * Calculates modular inverses.
     *
     * Say you have (30 mod 17 * x mod 17) mod 17 == 1.  x can be found using modular inverses.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger(30);
     *    $b = new \phpseclib\Math\BigInteger(17);
     *
     *    $c = $a->modInverse($b);
     *    echo $c->toString(); // outputs 4
     *
     *    echo "\r\n";
     *
     *    $d = $a->multiply($c);
     *    list(, $d) = $d->divide($b);
     *    echo $d; // outputs 1 (as per the definition of modular inverse)
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger|false
     * @access public
     * @internal See {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=21 HAC 14.64} for more information.
     */
    function modInverse($n)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_invert($this->value, $n->value);

                return ($temp->value === false) ? false : $this->_normalize($temp);
        }

        static $zero, $one;
        if (!isset($zero)) {
            $zero = new static();
            $one = new static(1);
        }

        // $x mod -$n == $x mod $n.
        $n = $n->abs();

        if ($this->compare($zero) < 0) {
            $temp = $this->abs();
            $temp = $temp->modInverse($n);
            return $this->_normalize($n->subtract($temp));
        }

        extract($this->extendedGCD($n));

        if (!$gcd->equals($one)) {
            return false;
        }

        $x = $x->compare($zero) < 0 ? $x->add($n) : $x;

        return $this->compare($zero) < 0 ? $this->_normalize($n->subtract($x)) : $this->_normalize($x);
    }

    /**
     * Calculates the greatest common divisor and Bezout's identity.
     *
     * Say you have 693 and 609.  The GCD is 21.  Bezout's identity states that there exist integers x and y such that
     * 693*x + 609*y == 21.  In point of fact, there are actually an infinite number of x and y combinations and which
     * combination is returned is dependent upon which mode is in use.  See
     * {@link http://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity Bezout's identity - Wikipedia} for more information.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger(693);
     *    $b = new \phpseclib\Math\BigInteger(609);
     *
     *    extract($a->extendedGCD($b));
     *
     *    echo $gcd->toString() . "\r\n"; // outputs 21
     *    echo $a->toString() * $x->toString() + $b->toString() * $y->toString(); // outputs 21
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal Calculates the GCD using the binary xGCD algorithim described in
     *    {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf#page=19 HAC 14.61}.  As the text above 14.61 notes,
     *    the more traditional algorithim requires "relatively costly multiple-precision divisions".
     */
    function extendedGCD($n)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                extract(gmp_gcdext($this->value, $n->value));

                return array(
                    'gcd' => $this->_normalize(new static($g)),
                    'x'   => $this->_normalize(new static($s)),
                    'y'   => $this->_normalize(new static($t))
                );
            case self::MODE_BCMATH:
                // it might be faster to use the binary xGCD algorithim here, as well, but (1) that algorithim works
                // best when the base is a power of 2 and (2) i don't think it'd make much difference, anyway.  as is,
                // the basic extended euclidean algorithim is what we're using.

                $u = $this->value;
                $v = $n->value;

                $a = '1';
                $b = '0';
                $c = '0';
                $d = '1';

                while (bccomp($v, '0', 0) != 0) {
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
                    'gcd' => $this->_normalize(new static($u)),
                    'x'   => $this->_normalize(new static($a)),
                    'y'   => $this->_normalize(new static($b))
                );
        }

        $y = $n->copy();
        $x = $this->copy();
        $g = new static();
        $g->value = array(1);

        while (!(($x->value[0] & 1)|| ($y->value[0] & 1))) {
            $x->_rshift(1);
            $y->_rshift(1);
            $g->_lshift(1);
        }

        $u = $x->copy();
        $v = $y->copy();

        $a = new static();
        $b = new static();
        $c = new static();
        $d = new static();

        $a->value = $d->value = $g->value = array(1);
        $b->value = $c->value = array();

        while (!empty($u->value)) {
            while (!($u->value[0] & 1)) {
                $u->_rshift(1);
                if ((!empty($a->value) && ($a->value[0] & 1)) || (!empty($b->value) && ($b->value[0] & 1))) {
                    $a = $a->add($y);
                    $b = $b->subtract($x);
                }
                $a->_rshift(1);
                $b->_rshift(1);
            }

            while (!($v->value[0] & 1)) {
                $v->_rshift(1);
                if ((!empty($d->value) && ($d->value[0] & 1)) || (!empty($c->value) && ($c->value[0] & 1))) {
                    $c = $c->add($y);
                    $d = $d->subtract($x);
                }
                $c->_rshift(1);
                $d->_rshift(1);
            }

            if ($u->compare($v) >= 0) {
                $u = $u->subtract($v);
                $a = $a->subtract($c);
                $b = $b->subtract($d);
            } else {
                $v = $v->subtract($u);
                $c = $c->subtract($a);
                $d = $d->subtract($b);
            }
        }

        return array(
            'gcd' => $this->_normalize($g->multiply($v)),
            'x'   => $this->_normalize($c),
            'y'   => $this->_normalize($d)
        );
    }

    /**
     * Calculates the greatest common divisor
     *
     * Say you have 693 and 609.  The GCD is 21.
     *
     * Here's an example:
     * <code>
     * <?php
     *    $a = new \phpseclib\Math\BigInteger(693);
     *    $b = new \phpseclib\Math\BigInteger(609);
     *
     *    $gcd = a->extendedGCD($b);
     *
     *    echo $gcd->toString() . "\r\n"; // outputs 21
     * ?>
     * </code>
     *
     * @param \phpseclib\Math\BigInteger $n
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function gcd($n)
    {
        extract($this->extendedGCD($n));
        return $gcd;
    }

    /**
     * Absolute value.
     *
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function abs()
    {
        $temp = new static();

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp->value = gmp_abs($this->value);
                break;
            case self::MODE_BCMATH:
                $temp->value = (bccomp($this->value, '0', 0) < 0) ? substr($this->value, 1) : $this->value;
                break;
            default:
                $temp->value = $this->value;
        }

        return $temp;
    }

    /**
     * Compares two numbers.
     *
     * Although one might think !$x->compare($y) means $x != $y, it, in fact, means the opposite.  The reason for this is
     * demonstrated thusly:
     *
     * $x  > $y: $x->compare($y)  > 0
     * $x  < $y: $x->compare($y)  < 0
     * $x == $y: $x->compare($y) == 0
     *
     * Note how the same comparison operator is used.  If you want to test for equality, use $x->equals($y).
     *
     * @param \phpseclib\Math\BigInteger $y
     * @return int that is < 0 if $this is less than $y; > 0 if $this is greater than $y, and 0 if they are equal.
     * @access public
     * @see self::equals()
     * @internal Could return $this->subtract($x), but that's not as fast as what we do do.
     */
    function compare($y)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $r = gmp_cmp($this->value, $y->value);
                if ($r < -1) {
                    $r = -1;
                }
                if ($r > 1) {
                    $r = 1;
                }
                return $r;
            case self::MODE_BCMATH:
                return bccomp($this->value, $y->value, 0);
        }

        return $this->_compare($this->value, $this->is_negative, $y->value, $y->is_negative);
    }

    /**
     * Compares two numbers.
     *
     * @param array $x_value
     * @param bool $x_negative
     * @param array $y_value
     * @param bool $y_negative
     * @return int
     * @see self::compare()
     * @access private
     */
    function _compare($x_value, $x_negative, $y_value, $y_negative)
    {
        if ($x_negative != $y_negative) {
            return (!$x_negative && $y_negative) ? 1 : -1;
        }

        $result = $x_negative ? -1 : 1;

        if (count($x_value) != count($y_value)) {
            return (count($x_value) > count($y_value)) ? $result : -$result;
        }
        $size = max(count($x_value), count($y_value));

        $x_value = array_pad($x_value, $size, 0);
        $y_value = array_pad($y_value, $size, 0);

        for ($i = count($x_value) - 1; $i >= 0; --$i) {
            if ($x_value[$i] != $y_value[$i]) {
                return ($x_value[$i] > $y_value[$i]) ? $result : -$result;
            }
        }

        return 0;
    }

    /**
     * Tests the equality of two numbers.
     *
     * If you need to see if one number is greater than or less than another number, use BigInteger::compare()
     *
     * @param \phpseclib\Math\BigInteger $x
     * @return bool
     * @access public
     * @see self::compare()
     */
    function equals($x)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                return gmp_cmp($this->value, $x->value) == 0;
            default:
                return $this->value === $x->value && $this->is_negative == $x->is_negative;
        }
    }

    /**
     * Set Precision
     *
     * Some bitwise operations give different results depending on the precision being used.  Examples include left
     * shift, not, and rotates.
     *
     * @param int $bits
     * @access public
     */
    function setPrecision($bits)
    {
        $this->precision = $bits;
        if (MATH_BIGINTEGER_MODE != self::MODE_BCMATH) {
            $this->bitmask = new static(chr((1 << ($bits & 0x7)) - 1) . str_repeat(chr(0xFF), $bits >> 3), 256);
        } else {
            $this->bitmask = new static(bcpow('2', $bits, 0));
        }

        $temp = $this->_normalize($this);
        $this->value = $temp->value;
    }

    /**
     * Logical And
     *
     * @param \phpseclib\Math\BigInteger $x
     * @access public
     * @internal Implemented per a request by Lluis Pamies i Juarez <lluis _a_ pamies.cat>
     * @return \phpseclib\Math\BigInteger
     */
    function bitwise_and($x)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_and($this->value, $x->value);

                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $left = $this->toBytes();
                $right = $x->toBytes();

                $length = max(strlen($left), strlen($right));

                $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
                $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);

                return $this->_normalize(new static($left & $right, 256));
        }

        $result = $this->copy();

        $length = min(count($x->value), count($this->value));

        $result->value = array_slice($result->value, 0, $length);

        for ($i = 0; $i < $length; ++$i) {
            $result->value[$i]&= $x->value[$i];
        }

        return $this->_normalize($result);
    }

    /**
     * Logical Or
     *
     * @param \phpseclib\Math\BigInteger $x
     * @access public
     * @internal Implemented per a request by Lluis Pamies i Juarez <lluis _a_ pamies.cat>
     * @return \phpseclib\Math\BigInteger
     */
    function bitwise_or($x)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_or($this->value, $x->value);

                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $left = $this->toBytes();
                $right = $x->toBytes();

                $length = max(strlen($left), strlen($right));

                $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
                $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);

                return $this->_normalize(new static($left | $right, 256));
        }

        $length = max(count($this->value), count($x->value));
        $result = $this->copy();
        $result->value = array_pad($result->value, $length, 0);
        $x->value = array_pad($x->value, $length, 0);

        for ($i = 0; $i < $length; ++$i) {
            $result->value[$i]|= $x->value[$i];
        }

        return $this->_normalize($result);
    }

    /**
     * Logical Exclusive-Or
     *
     * @param \phpseclib\Math\BigInteger $x
     * @access public
     * @internal Implemented per a request by Lluis Pamies i Juarez <lluis _a_ pamies.cat>
     * @return \phpseclib\Math\BigInteger
     */
    function bitwise_xor($x)
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                $temp = new static();
                $temp->value = gmp_xor(gmp_abs($this->value), gmp_abs($x->value));
                return $this->_normalize($temp);
            case self::MODE_BCMATH:
                $left = $this->toBytes();
                $right = $x->toBytes();

                $length = max(strlen($left), strlen($right));

                $left = str_pad($left, $length, chr(0), STR_PAD_LEFT);
                $right = str_pad($right, $length, chr(0), STR_PAD_LEFT);

                return $this->_normalize(new static($left ^ $right, 256));
        }

        $length = max(count($this->value), count($x->value));
        $result = $this->copy();
        $result->is_negative = false;
        $result->value = array_pad($result->value, $length, 0);
        $x->value = array_pad($x->value, $length, 0);

        for ($i = 0; $i < $length; ++$i) {
            $result->value[$i]^= $x->value[$i];
        }

        return $this->_normalize($result);
    }

    /**
     * Logical Not
     *
     * @access public
     * @internal Implemented per a request by Lluis Pamies i Juarez <lluis _a_ pamies.cat>
     * @return \phpseclib\Math\BigInteger
     */
    function bitwise_not()
    {
        // calculuate "not" without regard to $this->precision
        // (will always result in a smaller number.  ie. ~1 isn't 1111 1110 - it's 0)
        $temp = $this->toBytes();
        if ($temp == '') {
            return $this->_normalize(new static());
        }
        $pre_msb = decbin(ord($temp[0]));
        $temp = ~$temp;
        $msb = decbin(ord($temp[0]));
        if (strlen($msb) == 8) {
            $msb = substr($msb, strpos($msb, '0'));
        }
        $temp[0] = chr(bindec($msb));

        // see if we need to add extra leading 1's
        $current_bits = strlen($pre_msb) + 8 * strlen($temp) - 8;
        $new_bits = $this->precision - $current_bits;
        if ($new_bits <= 0) {
            return $this->_normalize(new static($temp, 256));
        }

        // generate as many leading 1's as we need to.
        $leading_ones = chr((1 << ($new_bits & 0x7)) - 1) . str_repeat(chr(0xFF), $new_bits >> 3);
        $this->_base256_lshift($leading_ones, $current_bits);

        $temp = str_pad($temp, strlen($leading_ones), chr(0), STR_PAD_LEFT);

        return $this->_normalize(new static($leading_ones | $temp, 256));
    }

    /**
     * Logical Right Shift
     *
     * Shifts BigInteger's by $shift bits, effectively dividing by 2**$shift.
     *
     * @param int $shift
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal The only version that yields any speed increases is the internal version.
     */
    function bitwise_rightShift($shift)
    {
        $temp = new static();

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                static $two;

                if (!isset($two)) {
                    $two = gmp_init('2');
                }

                $temp->value = gmp_div_q($this->value, $this->gmp_pow($two, $shift));

                break;
            case self::MODE_BCMATH:
                $temp->value = bcdiv($this->value, bcpow('2', $shift, 0), 0);

                break;
            default: // could just replace _lshift with this, but then all _lshift() calls would need to be rewritten
                     // and I don't want to do that...
                $temp->value = $this->value;
                $temp->_rshift($shift);
        }

        return $this->_normalize($temp);
    }

    /**
     * Logical Left Shift
     *
     * Shifts BigInteger's by $shift bits, effectively multiplying by 2**$shift.
     *
     * @param int $shift
     * @return \phpseclib\Math\BigInteger
     * @access public
     * @internal The only version that yields any speed increases is the internal version.
     */
    function bitwise_leftShift($shift)
    {
        $temp = new static();

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                static $two;

                if (!isset($two)) {
                    $two = gmp_init('2');
                }

                $temp->value = gmp_mul($this->value, $this->gmp_pow($two, $shift));

                break;
            case self::MODE_BCMATH:
                $temp->value = bcmul($this->value, bcpow('2', $shift, 0), 0);

                break;
            default: // could just replace _rshift with this, but then all _lshift() calls would need to be rewritten
                     // and I don't want to do that...
                $temp->value = $this->value;
                $temp->_lshift($shift);
        }

        return $this->_normalize($temp);
    }

    /**
     * Logical Left Rotate
     *
     * Instead of the top x bits being dropped they're appended to the shifted bit string.
     *
     * @param int $shift
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function bitwise_leftRotate($shift)
    {
        $bits = $this->toBytes();

        if ($this->precision > 0) {
            $precision = $this->precision;
            if (MATH_BIGINTEGER_MODE == self::MODE_BCMATH) {
                $mask = $this->bitmask->subtract(new static(1));
                $mask = $mask->toBytes();
            } else {
                $mask = $this->bitmask->toBytes();
            }
        } else {
            $temp = ord($bits[0]);
            for ($i = 0; $temp >> $i; ++$i) {
            }
            $precision = 8 * strlen($bits) - 8 + $i;
            $mask = chr((1 << ($precision & 0x7)) - 1) . str_repeat(chr(0xFF), $precision >> 3);
        }

        if ($shift < 0) {
            $shift+= $precision;
        }
        $shift%= $precision;

        if (!$shift) {
            return $this->copy();
        }

        $left = $this->bitwise_leftShift($shift);
        $left = $left->bitwise_and(new static($mask, 256));
        $right = $this->bitwise_rightShift($precision - $shift);
        $result = MATH_BIGINTEGER_MODE != self::MODE_BCMATH ? $left->bitwise_or($right) : $left->add($right);
        return $this->_normalize($result);
    }

    /**
     * Logical Right Rotate
     *
     * Instead of the bottom x bits being dropped they're prepended to the shifted bit string.
     *
     * @param int $shift
     * @return \phpseclib\Math\BigInteger
     * @access public
     */
    function bitwise_rightRotate($shift)
    {
        return $this->bitwise_leftRotate(-$shift);
    }

    /**
     * Make the current number odd
     *
     * If the current number is odd it'll be unchanged.  If it's even, one will be added to it.
     *
     * @see self::randomPrime()
     * @access private
     */
    function _make_odd()
    {
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                gmp_setbit($this->value, 0);
                break;
            case self::MODE_BCMATH:
                if ($this->value[strlen($this->value) - 1] % 2 == 0) {
                    $this->value = bcadd($this->value, '1');
                }
                break;
            default:
                $this->value[0] |= 1;
        }
    }

    /**
     * Checks a numer to see if it's prime
     *
     * Assuming the $t parameter is not set, this function has an error rate of 2**-80.  The main motivation for the
     * $t parameter is distributability.  BigInteger::randomPrime() can be distributed across multiple pageloads
     * on a website instead of just one.
     *
     * @param \phpseclib\Math\BigInteger $t
     * @return bool
     * @access public
     * @internal Uses the
     *     {@link http://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test Miller-Rabin primality test}.  See
     *     {@link http://www.cacr.math.uwaterloo.ca/hac/about/chap4.pdf#page=8 HAC 4.24}.
     */
    function isPrime($t = false)
    {
        $length = strlen($this->toBytes());

        if (!$t) {
            // see HAC 4.49 "Note (controlling the error probability)"
            // @codingStandardsIgnoreStart
                 if ($length >= 163) { $t =  2; } // floor(1300 / 8)
            else if ($length >= 106) { $t =  3; } // floor( 850 / 8)
            else if ($length >= 81 ) { $t =  4; } // floor( 650 / 8)
            else if ($length >= 68 ) { $t =  5; } // floor( 550 / 8)
            else if ($length >= 56 ) { $t =  6; } // floor( 450 / 8)
            else if ($length >= 50 ) { $t =  7; } // floor( 400 / 8)
            else if ($length >= 43 ) { $t =  8; } // floor( 350 / 8)
            else if ($length >= 37 ) { $t =  9; } // floor( 300 / 8)
            else if ($length >= 31 ) { $t = 12; } // floor( 250 / 8)
            else if ($length >= 25 ) { $t = 15; } // floor( 200 / 8)
            else if ($length >= 18 ) { $t = 18; } // floor( 150 / 8)
            else                     { $t = 27; }
            // @codingStandardsIgnoreEnd
        }

        // ie. gmp_testbit($this, 0)
        // ie. isEven() or !isOdd()
        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                return gmp_prob_prime($this->value, $t) != 0;
            case self::MODE_BCMATH:
                if ($this->value === '2') {
                    return true;
                }
                if ($this->value[strlen($this->value) - 1] % 2 == 0) {
                    return false;
                }
                break;
            default:
                if ($this->value == array(2)) {
                    return true;
                }
                if (~$this->value[0] & 1) {
                    return false;
                }
        }

        static $primes, $zero, $one, $two;

        if (!isset($primes)) {
            $primes = array(
                3,    5,    7,    11,   13,   17,   19,   23,   29,   31,   37,   41,   43,   47,   53,   59,
                61,   67,   71,   73,   79,   83,   89,   97,   101,  103,  107,  109,  113,  127,  131,  137,
                139,  149,  151,  157,  163,  167,  173,  179,  181,  191,  193,  197,  199,  211,  223,  227,
                229,  233,  239,  241,  251,  257,  263,  269,  271,  277,  281,  283,  293,  307,  311,  313,
                317,  331,  337,  347,  349,  353,  359,  367,  373,  379,  383,  389,  397,  401,  409,  419,
                421,  431,  433,  439,  443,  449,  457,  461,  463,  467,  479,  487,  491,  499,  503,  509,
                521,  523,  541,  547,  557,  563,  569,  571,  577,  587,  593,  599,  601,  607,  613,  617,
                619,  631,  641,  643,  647,  653,  659,  661,  673,  677,  683,  691,  701,  709,  719,  727,
                733,  739,  743,  751,  757,  761,  769,  773,  787,  797,  809,  811,  821,  823,  827,  829,
                839,  853,  857,  859,  863,  877,  881,  883,  887,  907,  911,  919,  929,  937,  941,  947,
                953,  967,  971,  977,  983,  991,  997
            );

            if (MATH_BIGINTEGER_MODE != self::MODE_INTERNAL) {
                for ($i = 0; $i < count($primes); ++$i) {
                    $primes[$i] = new static($primes[$i]);
                }
            }

            $zero = new static();
            $one = new static(1);
            $two = new static(2);
        }

        if ($this->equals($one)) {
            return false;
        }

        // see HAC 4.4.1 "Random search for probable primes"
        if (MATH_BIGINTEGER_MODE != self::MODE_INTERNAL) {
            foreach ($primes as $prime) {
                list(, $r) = $this->divide($prime);
                if ($r->equals($zero)) {
                    return $this->equals($prime);
                }
            }
        } else {
            $value = $this->value;
            foreach ($primes as $prime) {
                list(, $r) = $this->_divide_digit($value, $prime);
                if (!$r) {
                    return count($value) == 1 && $value[0] == $prime;
                }
            }
        }

        $n   = $this->copy();
        $n_1 = $n->subtract($one);
        $n_2 = $n->subtract($two);

        $r = $n_1->copy();
        $r_value = $r->value;
        // ie. $s = gmp_scan1($n, 0) and $r = gmp_div_q($n, gmp_pow(gmp_init('2'), $s));
        if (MATH_BIGINTEGER_MODE == self::MODE_BCMATH) {
            $s = 0;
            // if $n was 1, $r would be 0 and this would be an infinite loop, hence our $this->equals($one) check earlier
            while ($r->value[strlen($r->value) - 1] % 2 == 0) {
                $r->value = bcdiv($r->value, '2', 0);
                ++$s;
            }
        } else {
            for ($i = 0, $r_length = count($r_value); $i < $r_length; ++$i) {
                $temp = ~$r_value[$i] & 0xFFFFFF;
                for ($j = 1; ($temp >> $j) & 1; ++$j) {
                }
                if ($j != 25) {
                    break;
                }
            }
            $s = 26 * $i + $j;
            $r->_rshift($s);
        }

        for ($i = 0; $i < $t; ++$i) {
            $a = $this->random($two, $n_2);
            $y = $a->modPow($r, $n);

            if (!$y->equals($one) && !$y->equals($n_1)) {
                for ($j = 1; $j < $s && !$y->equals($n_1); ++$j) {
                    $y = $y->modPow($two, $n);
                    if ($y->equals($one)) {
                        return false;
                    }
                }

                if (!$y->equals($n_1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Logical Left Shift
     *
     * Shifts BigInteger's by $shift bits.
     *
     * @param int $shift
     * @access private
     */
    function _lshift($shift)
    {
        if ($shift == 0) {
            return;
        }

        $num_digits = (int) ($shift / self::$base);
        $shift %= self::$base;
        $shift = 1 << $shift;

        $carry = 0;

        for ($i = 0; $i < count($this->value); ++$i) {
            $temp = $this->value[$i] * $shift + $carry;
            $carry = self::$base === 26 ? intval($temp / 0x4000000) : ($temp >> 31);
            $this->value[$i] = (int) ($temp - $carry * self::$baseFull);
        }

        if ($carry) {
            $this->value[count($this->value)] = $carry;
        }

        while ($num_digits--) {
            array_unshift($this->value, 0);
        }
    }

    /**
     * Logical Right Shift
     *
     * Shifts BigInteger's by $shift bits.
     *
     * @param int $shift
     * @access private
     */
    function _rshift($shift)
    {
        if ($shift == 0) {
            return;
        }

        $num_digits = (int) ($shift / self::$base);
        $shift %= self::$base;
        $carry_shift = self::$base - $shift;
        $carry_mask = (1 << $shift) - 1;

        if ($num_digits) {
            $this->value = array_slice($this->value, $num_digits);
        }

        $carry = 0;

        for ($i = count($this->value) - 1; $i >= 0; --$i) {
            $temp = $this->value[$i] >> $shift | $carry;
            $carry = ($this->value[$i] & $carry_mask) << $carry_shift;
            $this->value[$i] = $temp;
        }

        $this->value = $this->_trim($this->value);
    }

    /**
     * Normalize
     *
     * Removes leading zeros and truncates (if necessary) to maintain the appropriate precision
     *
     * @param \phpseclib\Math\BigInteger $result
     * @return \phpseclib\Math\BigInteger
     * @see self::_trim()
     * @access private
     */
    function _normalize($result)
    {
        $result->precision = $this->precision;
        $result->bitmask = $this->bitmask;

        switch (MATH_BIGINTEGER_MODE) {
            case self::MODE_GMP:
                if ($this->bitmask !== false) {
                    $flip = gmp_cmp($result->value, gmp_init(0)) < 0;
                    if ($flip) {
                        $result->value = gmp_neg($result->value);
                    }
                    $result->value = gmp_and($result->value, $result->bitmask->value);
                    if ($flip) {
                        $result->value = gmp_neg($result->value);
                    }
                }

                return $result;
            case self::MODE_BCMATH:
                if (!empty($result->bitmask->value)) {
                    $result->value = bcmod($result->value, $result->bitmask->value);
                }

                return $result;
        }

        $value = &$result->value;

        if (!count($value)) {
            $result->is_negative = false;
            return $result;
        }

        $value = $this->_trim($value);

        if (!empty($result->bitmask->value)) {
            $length = min(count($value), count($this->bitmask->value));
            $value = array_slice($value, 0, $length);

            for ($i = 0; $i < $length; ++$i) {
                $value[$i] = $value[$i] & $this->bitmask->value[$i];
            }
        }

        return $result;
    }

    /**
     * Trim
     *
     * Removes leading zeros
     *
     * @param array $value
     * @return \phpseclib\Math\BigInteger
     * @access private
     */
    function _trim($value)
    {
        for ($i = count($value) - 1; $i >= 0; --$i) {
            if ($value[$i]) {
                break;
            }
            unset($value[$i]);
        }

        return $value;
    }

    /**
     * Array Repeat
     *
     * @param array $input
     * @param mixed $multiplier
     * @return array
     * @access private
     */
    function _array_repeat($input, $multiplier)
    {
        return ($multiplier) ? array_fill(0, $multiplier, $input) : array();
    }

    /**
     * Logical Left Shift
     *
     * Shifts binary strings $shift bits, essentially multiplying by 2**$shift.
     *
     * @param string $x (by reference)
     * @param int $shift
     * @return string
     * @access private
     */
    function _base256_lshift(&$x, $shift)
    {
        if ($shift == 0) {
            return;
        }

        $num_bytes = $shift >> 3; // eg. floor($shift/8)
        $shift &= 7; // eg. $shift % 8

        $carry = 0;
        for ($i = strlen($x) - 1; $i >= 0; --$i) {
            $temp = ord($x[$i]) << $shift | $carry;
            $x[$i] = chr($temp);
            $carry = $temp >> 8;
        }
        $carry = ($carry != 0) ? chr($carry) : '';
        $x = $carry . $x . str_repeat(chr(0), $num_bytes);
    }

    /**
     * Logical Right Shift
     *
     * Shifts binary strings $shift bits, essentially dividing by 2**$shift and returning the remainder.
     *
     * @param string $x (by referenc)
     * @param int $shift
     * @return string
     * @access private
     */
    function _base256_rshift(&$x, $shift)
    {
        if ($shift == 0) {
            $x = ltrim($x, chr(0));
            return '';
        }

        $num_bytes = $shift >> 3; // eg. floor($shift/8)
        $shift &= 7; // eg. $shift % 8

        $remainder = '';
        if ($num_bytes) {
            $start = $num_bytes > strlen($x) ? -strlen($x) : -$num_bytes;
            $remainder = substr($x, $start);
            $x = substr($x, 0, -$num_bytes);
        }

        $carry = 0;
        $carry_shift = 8 - $shift;
        for ($i = 0; $i < strlen($x); ++$i) {
            $temp = (ord($x[$i]) >> $shift) | $carry;
            $carry = (ord($x[$i]) << $carry_shift) & 0xFF;
            $x[$i] = chr($temp);
        }
        $x = ltrim($x, chr(0));

        $remainder = chr($carry >> $carry_shift) . $remainder;

        return ltrim($remainder, chr(0));
    }

    // one quirk about how the following functions are implemented is that PHP defines N to be an unsigned long
    // at 32-bits, while java's longs are 64-bits.

    /**
     * Converts 32-bit integers to bytes.
     *
     * @param int $x
     * @return string
     * @access private
     */
    function _int2bytes($x)
    {
        return ltrim(pack('N', $x), chr(0));
    }

    /**
     * Converts bytes to 32-bit integers
     *
     * @param string $x
     * @return int
     * @access private
     */
    function _bytes2int($x)
    {
        $temp = unpack('Nint', str_pad($x, 4, chr(0), STR_PAD_LEFT));
        return $temp['int'];
    }

    /**
     * DER-encode an integer
     *
     * The ability to DER-encode integers is needed to create RSA public keys for use with OpenSSL
     *
     * @see self::modPow()
     * @access private
     * @param int $length
     * @return string
     */
    function _encodeASN1Length($length)
    {
        if ($length <= 0x7F) {
            return chr($length);
        }

        $temp = ltrim(pack('N', $length), chr(0));
        return pack('Ca*', 0x80 | strlen($temp), $temp);
    }

    /**
     * Single digit division
     *
     * Even if int64 is being used the division operator will return a float64 value
     * if the dividend is not evenly divisible by the divisor. Since a float64 doesn't
     * have the precision of int64 this is a problem so, when int64 is being used,
     * we'll guarantee that the dividend is divisible by first subtracting the remainder.
     *
     * @access private
     * @param int $x
     * @param int $y
     * @return int
     */
    function _safe_divide($x, $y)
    {
        if (self::$base === 26) {
            return (int) ($x / $y);
        }

        // self::$base === 31
        return ($x - ($x % $y)) / $y;
    }

    public function gmp_pow($a, $b) {
        try {
            return gmp_pow($a, $b);
        } catch (\Throwable $_) {
            return bcpow(gmp_strval($a), $b);
        }
    }
}
