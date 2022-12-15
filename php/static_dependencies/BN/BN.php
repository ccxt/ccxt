<?php
namespace BN;

use \JsonSerializable;
use \Exception;
use \BI\BigInteger;

class BN implements JsonSerializable
{
    public $bi;
    public $red;

    function __construct($number, $base = 10, $endian = null)
    {
        if( $number instanceof BN ) {
            $this->bi = $number->bi;
            $this->red = $number->red;
            return;
        }

        // Reduction context
        $this->red = null;

        if ( $number instanceof BigInteger ) {
            $this->bi = $number;
            return;
        }

        if( is_array($number) )
        {
            $number = call_user_func_array("pack", array_merge(array("C*"), $number));
            $number = bin2hex($number);
            $base = 16;
        }

        if( $base == "hex" )
            $base = 16;

        if ($endian == 'le') {
            if ($base != 16)
                throw new \Exception("Not implemented");
            $number = bin2hex(strrev(hex2bin($number)));
        }

        $this->bi = new BigInteger($number, $base);
    }

    public function negative() {
        return $this->bi->sign() < 0 ? 1 : 0;
    }

    public static function isBN($num) {
        return ($num instanceof BN);
    }

    public static function max($left, $right) {
        return ( $left->cmp($right) > 0 ) ? $left : $right;
    }

    public static function min($left, $right) {
        return ( $left->cmp($right) < 0 ) ? $left : $right;
    }

    public function copy($dest)
    {
        $dest->bi = $this->bi;
        $dest->red = $this->red;
    }

    public function _clone() {
        return clone($this);
    }

    public function toString($base = 10, $padding = 0)
    {
        if( $base == "hex" )
            $base = 16;
        $str = $this->bi->abs()->toString($base);
        if ($padding > 0) {
            $len = strlen($str);
            $mod = $len % $padding;
            if ($mod > 0)
                $len = $len + $padding - $mod;
            $str = str_pad($str, $len, "0", STR_PAD_LEFT);
        }
        if( $this->negative() )
            return "-" . $str;
        return $str;
    }

    public function toNumber() {
        return $this->bi->toNumber();
    }

    #[\ReturnTypeWillChange]
    public function jsonSerialize() {
        return $this->toString(16);
    }

    public function toArray($endian = "be", $length = -1)
    {
        $hex = $this->toString(16);
        if( $hex[0] === "-" )
            $hex = substr($hex, 1);

        if( strlen($hex) % 2 )
            $hex = "0" . $hex;

        $bytes = array_map(
            function($v) { return hexdec($v); },
            str_split($hex, 2)
        );

        if( $length > 0 )
        {
            $count = count($bytes);
            if( $count > $length )
                throw new Exception("Byte array longer than desired length");

            for($i = $count; $i < $length; $i++)
                array_unshift($bytes, 0);
        }

        if( $endian === "le" )
            $bytes = array_reverse($bytes);

        return $bytes;
    }

    public function bitLength() {
        $bin = $this->toString(2);
        return strlen($bin) - ( $bin[0] === "-" ? 1 : 0 );
    }

    public function zeroBits() {
        return $this->bi->scan1(0);
    }

    public function byteLength() {
        return ceil($this->bitLength() / 8);
    }

    //TODO toTwos, fromTwos

    public function isNeg() {
        return $this->negative() !== 0;
    }

    // Return negative clone of `this`
    public function neg() {
        return $this->_clone()->ineg();
    }

    public function ineg() {
        $this->bi = $this->bi->neg();
        return $this;
    }

    // Or `num` with `this` in-place
    public function iuor(BN $num) {
        $this->bi = $this->bi->binaryOr($num->bi);
        return $this;
    }

    public function ior(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative() && !$num->negative());
        return $this->iuor($num);
    }

    // Or `num` with `this`
    public function _or(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->ior($num);
        return $num->_clone()->ior($this);
    }

    public function uor(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->iuor($num);
        return $num->_clone()->ior($this);
    }

    // And `num` with `this` in-place
    public function iuand(BN $num) {
        $this->bi = $this->bi->binaryAnd($num->bi);
        return $this;
    }

    public function iand(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative() && !$num->negative());
        return $this->iuand($num);
    }

    // And `num` with `this`
    public function _and(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->iand($num);
        return $num->_clone()->iand($this);
    }

    public function uand(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->iuand($num);
        return $num->_clone()->iuand($this);
    }

    // Xor `num` with `this` in-place
    public function iuxor(BN $num) {
        $this->bi = $this->bi->binaryXor($num->bi);
        return $this;
    }

    public function ixor(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative() && !$num->negative());
        return $this->iuxor($num);
    }

    // Xor `num` with `this`
    public function _xor(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->ixor($num);
        return $num->_clone()->ixor($this);
    }

    public function uxor(BN $num) {
        if( $this->ucmp($num) > 0 )
            return $this->_clone()->iuxor($num);
        return $num->_clone()->iuxor($this);
    }

    // Not ``this`` with ``width`` bitwidth
    public function inotn($width)
    {
        assert(is_integer($width) && $width >= 0);
        $neg = false;
        if( $this->isNeg() )
        {
            $this->negi();
            $neg = true;
        }

        for($i = 0; $i < $width; $i++)
            $this->bi = $this->bi->setbit($i, !$this->bi->testbit($i));

        return $neg ? $this->negi() : $this;
    }

    public function notn($width) {
        return $this->_clone()->inotn($width);
    }

    // Set `bit` of `this`
    public function setn($bit, $val) {
        assert(is_integer($bit) && $bit > 0);
        $this->bi = $this->bi->setbit($bit, !!$val);
        return $this;
    }

    // Add `num` to `this` in-place
    public function iadd(BN $num) {
        $this->bi = $this->bi->add($num->bi);
        return $this;
    }

    // Add `num` to `this`
    public function add(BN $num) {
        return $this->_clone()->iadd($num);
    }

    // Subtract `num` from `this` in-place
    public function isub(BN $num) {
        $this->bi = $this->bi->sub($num->bi);
        return $this;
    }

    // Subtract `num` from `this`
    public function sub(BN $num) {
        return $this->_clone()->isub($num);
    }

    // Multiply `this` by `num`
    public function mul(BN $num) {
        return $this->_clone()->imul($num);
    }

    // In-place Multiplication
    public function imul(BN $num) {
        $this->bi = $this->bi->mul($num->bi);
        return $this;
    }

    public function imuln($num)
    {
        assert(is_numeric($num));
        $int = intval($num);
        $res = $this->bi->mul($int);

        if( ($num - $int) > 0 )
        {
            $mul = 10;
            $frac = ($num - $int) * $mul;
            $int = intval($frac);
            while( ($frac - $int) > 0 )
            {
                $mul *= 10;
                $frac *= 10;
                $int = intval($frac);
            }

            $tmp = $this->bi->mul($int);
            $tmp = $tmp->div($mul);
            $res = $res->add($tmp);
        }

        $this->bi = $res;
        return $this;
    }

    public function muln($num) {
        return $this->_clone()->imuln($num);
    }

    // `this` * `this`
    public function sqr() {
        return $this->mul($this);
    }

    // `this` * `this` in-place
    public function isqr() {
        return $this->imul($this);
    }

    // Math.pow(`this`, `num`)
    public function pow(BN $num) {
        $res = clone($this);
        $res->bi = $res->bi->pow($num->bi);
        return $res;
    }

    // Shift-left in-place
    public function iushln($bits) {
        assert(is_integer($bits) && $bits >= 0);
        if ($bits < 54) {
            $this->bi = $this->bi->mul(1 << $bits);
        } else {
            $this->bi = $this->bi->mul((new BigInteger(2))->pow($bits));
        }
        return $this;
    }

    public function ishln($bits) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative());
        return $this->iushln($bits);
    }

    // Shift-right in-place
    // NOTE: `hint` is a lowest bit before trailing zeroes
    // NOTE: if `extended` is present - it will be filled with destroyed bits
    public function iushrn($bits, $hint = 0, &$extended = null) {
        if( $hint != 0 )
            throw new Exception("Not implemented");

        assert(is_integer($bits) && $bits >= 0);

        if( $extended != null )
            $extended = $this->maskn($bits);
               
        if ($bits < 54) {
            $this->bi = $this->bi->div(1 << $bits);
        } else {
            $this->bi = $this->bi->div((new BigInteger(2))->pow($bits));
        }
        return $this;
    }

    public function ishrn($bits, $hint = null, $extended = null) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative());
        return $this->iushrn($bits, $hint, $extended);
    }

    // Shift-left
    public function shln($bits) {
        return $this->_clone()->ishln($bits);
    }

    public function ushln($bits) {
        return $this->_clone()->iushln($bits);
    }

    // Shift-right
    public function shrn($bits) {
        return $this->_clone()->ishrn($bits);
    }

    public function ushrn($bits) {
        return $this->_clone()->iushrn($bits);
    }

    // Test if n bit is set
    public function testn($bit) {
        assert(is_integer($bit) && $bit >= 0);
        return $this->bi->testbit($bit);
    }

    // Return only lowers bits of number (in-place)
    public function imaskn($bits) {
        assert(is_integer($bits) && $bits >= 0);
        if (assert_options(ASSERT_ACTIVE)) assert(!$this->negative());
        $mask = "";
        for($i = 0; $i < $bits; $i++)
            $mask .= "1";
        return $this->iand(new BN($mask, 2));
    }

    // Return only lowers bits of number
    public function maskn($bits) {
        return $this->_clone()->imaskn($bits);
    }

    // Add plain number `num` to `this`
    public function iaddn($num) {
        assert(is_numeric($num));
        $this->bi = $this->bi->add(intval($num));
        return $this;
    }

    // Subtract plain number `num` from `this`
    public function isubn($num) {
        assert(is_numeric($num));
        $this->bi = $this->bi->sub(intval($num));
        return $this;
    }

    public function addn($num) {
        return $this->_clone()->iaddn($num);
    }

    public function subn($num) {
        return $this->_clone()->isubn($num);
    }

    public function iabs() {
        if ($this->bi->sign() < 0) {
            $this->bi = $this->bi->abs();
        }
        return $this;
    }

    public function abs() {
        $res = clone($this);
        if ($res->bi->sign() < 0) 
            $res->bi = $res->bi->abs();
        return $res;
    }

    // Find `this` / `num`
    public function div(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$num->isZero());
        $res = clone($this);
        $res->bi = $res->bi->div($num->bi);
        return $res;
    }

    // Find `this` % `num`
    public function mod(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$num->isZero());
        $res = clone($this);
        $res->bi = $res->bi->divR($num->bi);
        return $res;
    }

    public function umod(BN $num) {
        if (assert_options(ASSERT_ACTIVE)) assert(!$num->isZero());
        $tmp = $num->bi->sign() < 0 ? $num->bi->abs() : $num->bi;        
        $res = clone($this);
        $res->bi = $this->bi->mod($tmp);
        return $res;
    }

    // Find Round(`this` / `num`)
    public function divRound(BN $num)
    {
        if (assert_options(ASSERT_ACTIVE)) assert(!$num->isZero());

        $negative = $this->negative() !== $num->negative();

        $res = $this->_clone()->abs();
        $arr = $res->bi->divQR($num->bi->abs());
        $res->bi = $arr[0];
        $tmp = $num->bi->sub($arr[1]->mul(2));
        if( $tmp->cmp(0) <= 0 && (!$negative || $this->negative() === 0) )
            $res->iaddn(1);
        return $negative ? $res->negi() : $res;
    }

    public function modn($num) {
        assert(is_numeric($num) && $num != 0);
        return $this->bi->divR(intval($num))->toNumber();
    }

    // In-place division by number
    public function idivn($num) {
        assert(is_numeric($num) && $num != 0);
        $this->bi = $this->bi->div(intval($num));
        return $this;
    }

    public function divn($num) {
        return $this->_clone()->idivn($num);
    }

    public function gcd(BN $num) {
        $res = clone($this);
        $res->bi = $this->bi->gcd($num->bi);
        return $res;
    }

    public function invm(BN $num) {
        $res = clone($this);
        $res->bi = $res->bi->modInverse($num->bi);
        return $res;
    }

    public function isEven() {
        return !$this->bi->testbit(0);
    }

    public function isOdd() {
        return $this->bi->testbit(0);
    }

    public function andln($num) {
        assert(is_numeric($num));
        return $this->bi->binaryAnd($num)->toNumber();
    }

    public function bincn($num) {
        $tmp = (new BN(1))->iushln($num);
        return $this->add($tmp);
    }

    public function isZero() {
        return $this->bi->sign() == 0;
    }

    public function cmpn($num) {
        assert(is_numeric($num));
        return $this->bi->cmp($num);
    }

    // Compare two numbers and return:
    // 1 - if `this` > `num`
    // 0 - if `this` == `num`
    // -1 - if `this` < `num`
    public function cmp(BN $num) {
        return $this->bi->cmp($num->bi);
    }

    public function ucmp(BN $num) {
        return $this->bi->abs()->cmp($num->bi->abs());
    }

    public function gtn($num) {
        return $this->cmpn($num) > 0;
    }

    public function gt(BN $num) {
        return $this->cmp($num) > 0;
    }

    public function gten($num) {
        return $this->cmpn($num) >= 0;
    }

    public function gte(BN $num) {
        return $this->cmp($num) >= 0;
    }

    public function ltn($num) {
        return $this->cmpn($num) < 0;
    }

    public function lt(BN $num) {
        return $this->cmp($num) < 0;
    }

    public function lten($num) {
        return $this->cmpn($num) <= 0;
    }

    public function lte(BN $num) {
        return $this->cmp($num) <= 0;
    }

    public function eqn($num) {
        return $this->cmpn($num) === 0;
    }

    public function eq(BN $num) {
        return $this->cmp($num) === 0;
    }

    public function toRed(Red &$ctx) {
        if( $this->red !== null )
            throw new Exception("Already a number in reduction context");
        if( $this->negative() !== 0 )
            throw new Exception("red works only with positives");
        return $ctx->convertTo($this)->_forceRed($ctx);
    }

    public function fromRed() {
        if( $this->red === null )
            throw new Exception("fromRed works only with numbers in reduction context");
        return $this->red->convertFrom($this);
    }

    public function _forceRed(Red &$ctx) {
        $this->red = $ctx;
        return $this;
    }

    public function forceRed(Red &$ctx) {
        if( $this->red !== null )
            throw new Exception("Already a number in reduction context");
        return $this->_forceRed($ctx);
    }

    public function redAdd(BN $num) {
        if( $this->red === null )
            throw new Exception("redAdd works only with red numbers");

        $res = clone($this);
        $res->bi = $res->bi->add($num->bi);
        if ($res->bi->cmp($this->red->m->bi) >= 0)
            $res->bi = $res->bi->sub($this->red->m->bi);
        return $res;
        // return $this->red->add($this, $num);
    }

    public function redIAdd(BN $num) {
        if( $this->red === null )
            throw new Exception("redIAdd works only with red numbers");
        $res = $this;
        $res->bi = $res->bi->add($num->bi);
        if ($res->bi->cmp($this->red->m->bi) >= 0)
            $res->bi = $res->bi->sub($this->red->m->bi);
        return $res;
        //return $this->red->iadd($this, $num);
    }

    public function redSub(BN $num) {
        if( $this->red === null )
            throw new Exception("redSub works only with red numbers");
        $res = clone($this);
        $res->bi = $this->bi->sub($num->bi);
        if ($res->bi->sign() < 0)
            $res->bi = $res->bi->add($this->red->m->bi);
        return $res;
        //return $this->red->sub($this, $num);
    }

    public function redISub(BN $num) {
        if( $this->red === null )
            throw new Exception("redISub works only with red numbers");
        $this->bi = $this->bi->sub($num->bi);
        if ($this->bi->sign() < 0)
            $this->bi = $this->bi->add($this->red->m->bi);
        return $this;
            
//        return $this->red->isub($this, $num);
    }

    public function redShl(BN $num) {
        if( $this->red === null )
            throw new Exception("redShl works only with red numbers");
        return $this->red->shl($this, $num);
    }

    public function redMul(BN $num) {
        if( $this->red === null )
            throw new Exception("redMul works only with red numbers");
        $res = clone($this);
        $res->bi = $this->bi->mul($num->bi)->mod($this->red->m->bi);
        return $res;            
        /*
        return $this->red->mul($this, $num);
        */
    }

    public function redIMul(BN $num) {
        if( $this->red === null )
            throw new Exception("redIMul works only with red numbers");
        $this->bi = $this->bi->mul($num->bi)->mod($this->red->m->bi);
        return $this;
        //return $this->red->imul($this, $num);
    }

    public function redSqr() {
        if( $this->red === null )
            throw new Exception("redSqr works only with red numbers");
        $res = clone($this);
        $res->bi = $this->bi->mul($this->bi)->mod($this->red->m->bi);
        return $res;
        /*
        $this->red->verify1($this);
        return $this->red->sqr($this);
        */
    }

    public function redISqr() {
        if( $this->red === null )
            throw new Exception("redISqr works only with red numbers");
        $res = $this;
        $res->bi = $this->bi->mul($this->bi)->mod($this->red->m->bi);
        return $res;
/*        $this->red->verify1($this);
        return $this->red->isqr($this);
        */
    }

    public function redSqrt() {
        if( $this->red === null )
            throw new Exception("redSqrt works only with red numbers");
        $this->red->verify1($this);
        return $this->red->sqrt($this);
    }

    public function redInvm() {
        if( $this->red === null )
            throw new Exception("redInvm works only with red numbers");
        $this->red->verify1($this);
        return $this->red->invm($this);
    }

    public function redNeg() {
        if( $this->red === null )
            throw new Exception("redNeg works only with red numbers");
        $this->red->verify1($this);
        return $this->red->neg($this);
    }

    public function redPow(BN $num) {
        $this->red->verify2($this, $num);
        return $this->red->pow($this, $num);
    }

    public static function red($num) {
        return new Red($num);
    }

    public static function mont($num) {
        return new Red($num);
    }

    public function inspect() {
        return ($this->red == null ? "<BN: " : "<BN-R: ") . $this->toString(16) . ">";
    }

    public function __debugInfo() {
        if ($this->red != null) {
            return ["BN-R" => $this->toString(16)];
        } else {
            return ["BN" => $this->toString(16)];
        }
    }
}
