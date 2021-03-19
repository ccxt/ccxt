<?php
namespace kornrunner;

use BN\BN;

final class Solidity {
    private const HASH_SIZE = 256;

    public static function hex ($input): string {
        if ($input instanceof BN) {
            $input = $input->toString();
        } elseif (is_bool($input)) {
            return str_pad(dechex((int) $input), 2, '0', STR_PAD_LEFT);
        }

        if (strpos($input, '0x') === 0) {
            $input = substr($input, 2);
        } elseif (is_numeric($input)) {
            $input = self::int2hex($input);
        } else {
            $input = self::string2hex($input);
        }

        return $input;
    }

    private static function int2hex($input): string {
        $pad = '0';
        if ($input < 0) {
            $input = sprintf('%u', PHP_INT_SIZE === 8 ? $input & 0xFFFFFFFF : $input);
            $pad = 'f';
        }

        return str_pad((new BN($input))->toString('hex'), 64, $pad, STR_PAD_LEFT);
    }

    private static function string2hex(string $input): string {
        $encoded = mb_detect_encoding($input, 'UTF-8', true) ? utf8_encode($input) : $input;
        $result  = '';
        for($i = 0; $i < strlen($encoded); $i++) {
            $code = ord($encoded[$i]);
            if ($code === 0) {
                break;
            }

            $result .= str_pad(dechex($code), 2, '0', STR_PAD_LEFT);
        }
        return $result;
    }

    public static function sha3(...$args): string {
        $hex_array = array_map(__CLASS__ . '::hex', $args);
        $hex_glued = strtolower(implode('', $hex_array));
        return '0x' . Keccak::hash(hex2bin($hex_glued), self::HASH_SIZE);
    }
}
