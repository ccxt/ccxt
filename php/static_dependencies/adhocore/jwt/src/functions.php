<?php

// @codeCoverageIgnoreStart
if (!\function_exists('hash_equals')) {
    // PHP5.5 compat.
    // @see http://php.net/manual/en/function.hash-equals.php#115635
    function hash_equals($str1, $str2)
    {
        if (\strlen($str1) !== \strlen($str2)) {
            return false;
        }

        $ret = 0;
        $res = $str1 ^ $str2;

        for ($i = \strlen($res) - 1; $i >= 0; $i--) {
            $ret |= ord($res[$i]);
        }

        return !$ret;
    }
}
// @codeCoverageIgnoreEnd
