<?php

namespace kornrunner;

use Exception;
use function mb_strlen;
use function mb_substr;

final class Keccak
{
    private const KECCAK_ROUNDS = 24;
    private const LFSR = 0x01;
    private const ENCODING = '8bit';
    private static $keccakf_rotc = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14, 27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44];
    private static $keccakf_piln = [10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4, 15, 23, 19, 13, 12,2, 20, 14, 22, 9, 6, 1];
    private static $x64 = (PHP_INT_SIZE === 8);

    private static function keccakf64(&$st, $rounds): void {
        $keccakf_rndc = [
            [0x00000000, 0x00000001], [0x00000000, 0x00008082], [0x80000000, 0x0000808a], [0x80000000, 0x80008000],
            [0x00000000, 0x0000808b], [0x00000000, 0x80000001], [0x80000000, 0x80008081], [0x80000000, 0x00008009],
            [0x00000000, 0x0000008a], [0x00000000, 0x00000088], [0x00000000, 0x80008009], [0x00000000, 0x8000000a],
            [0x00000000, 0x8000808b], [0x80000000, 0x0000008b], [0x80000000, 0x00008089], [0x80000000, 0x00008003],
            [0x80000000, 0x00008002], [0x80000000, 0x00000080], [0x00000000, 0x0000800a], [0x80000000, 0x8000000a],
            [0x80000000, 0x80008081], [0x80000000, 0x00008080], [0x00000000, 0x80000001], [0x80000000, 0x80008008]
        ];

        $bc = [];
        for ($round = 0; $round < $rounds; $round++) {

            // Theta
            for ($i = 0; $i < 5; $i++) {
                $bc[$i] = [
                    $st[$i][0] ^ $st[$i + 5][0] ^ $st[$i + 10][0] ^ $st[$i + 15][0] ^ $st[$i + 20][0],
                    $st[$i][1] ^ $st[$i + 5][1] ^ $st[$i + 10][1] ^ $st[$i + 15][1] ^ $st[$i + 20][1]
                ];
            }

            for ($i = 0; $i < 5; $i++) {
                $t = [
                    $bc[($i + 4) % 5][0] ^ (($bc[($i + 1) % 5][0] << 1) | ($bc[($i + 1) % 5][1] >> 31)) & (0xFFFFFFFF),
                    $bc[($i + 4) % 5][1] ^ (($bc[($i + 1) % 5][1] << 1) | ($bc[($i + 1) % 5][0] >> 31)) & (0xFFFFFFFF)
                ];

                for ($j = 0; $j < 25; $j += 5) {
                    $st[$j + $i] = [
                        $st[$j + $i][0] ^ $t[0],
                        $st[$j + $i][1] ^ $t[1]
                    ];
                }
            }

            // Rho Pi
            $t = $st[1];
            for ($i = 0; $i < 24; $i++) {
                $j = self::$keccakf_piln[$i];

                $bc[0] = $st[$j];

                $n = self::$keccakf_rotc[$i];
                $hi = $t[0];
                $lo = $t[1];
                if ($n >= 32) {
                    $n -= 32;
                    $hi = $t[1];
                    $lo = $t[0];
                }

                $st[$j] =[
                    (($hi << $n) | ($lo >> (32 - $n))) & (0xFFFFFFFF),
                    (($lo << $n) | ($hi >> (32 - $n))) & (0xFFFFFFFF)
                ];

                $t = $bc[0];
            }

            //  Chi
            for ($j = 0; $j < 25; $j += 5) {
                for ($i = 0; $i < 5; $i++) {
                    $bc[$i] = $st[$j + $i];
                }
                for ($i = 0; $i < 5; $i++) {
                    $st[$j + $i] = [
                        $st[$j + $i][0] ^ ~$bc[($i + 1) % 5][0] & $bc[($i + 2) % 5][0],
                        $st[$j + $i][1] ^ ~$bc[($i + 1) % 5][1] & $bc[($i + 2) % 5][1]
                    ];
                }
            }

            // Iota
            $st[0] = [
                $st[0][0] ^ $keccakf_rndc[$round][0],
                $st[0][1] ^ $keccakf_rndc[$round][1]
            ];
        }
    }

    private static function keccak64($in_raw, int $capacity, int $outputlength, $suffix, bool $raw_output): string {
        $capacity /= 8;

        $inlen = mb_strlen($in_raw, self::ENCODING);

        $rsiz = 200 - 2 * $capacity;
        $rsizw = $rsiz / 8;

        $st = [];
        for ($i = 0; $i < 25; $i++) {
            $st[] = [0, 0];
        }

        for ($in_t = 0; $inlen >= $rsiz; $inlen -= $rsiz, $in_t += $rsiz) {
            for ($i = 0; $i < $rsizw; $i++) {
                $t = unpack('V*', mb_substr($in_raw, $i * 8 + $in_t, 8, self::ENCODING));

                $st[$i] = [
                    $st[$i][0] ^ $t[2],
                    $st[$i][1] ^ $t[1]
                ];
            }

            self::keccakf64($st, self::KECCAK_ROUNDS);
        }

        $temp = mb_substr($in_raw, $in_t, $inlen, self::ENCODING);
        $temp = str_pad($temp, $rsiz, "\x0", STR_PAD_RIGHT);

        $temp[$inlen] = chr($suffix);
        $temp[$rsiz - 1] = chr(ord($temp[$rsiz - 1]) | 0x80);

        for ($i = 0; $i < $rsizw; $i++) {
            $t = unpack('V*', mb_substr($temp, $i * 8, 8, self::ENCODING));

            $st[$i] = [
                $st[$i][0] ^ $t[2],
                $st[$i][1] ^ $t[1]
            ];
        }

        self::keccakf64($st, self::KECCAK_ROUNDS);

        $out = '';
        for ($i = 0; $i < 25; $i++) {
            $out .= $t = pack('V*', $st[$i][1], $st[$i][0]);
        }
        $r = mb_substr($out, 0, $outputlength / 8, self::ENCODING);

        return $raw_output ? $r : bin2hex($r);
    }

    private static function keccakf32(&$st, $rounds): void {
        $keccakf_rndc = [
            [0x0000, 0x0000, 0x0000, 0x0001], [0x0000, 0x0000, 0x0000, 0x8082], [0x8000, 0x0000, 0x0000, 0x0808a], [0x8000, 0x0000, 0x8000, 0x8000],
            [0x0000, 0x0000, 0x0000, 0x808b], [0x0000, 0x0000, 0x8000, 0x0001], [0x8000, 0x0000, 0x8000, 0x08081], [0x8000, 0x0000, 0x0000, 0x8009],
            [0x0000, 0x0000, 0x0000, 0x008a], [0x0000, 0x0000, 0x0000, 0x0088], [0x0000, 0x0000, 0x8000, 0x08009], [0x0000, 0x0000, 0x8000, 0x000a],
            [0x0000, 0x0000, 0x8000, 0x808b], [0x8000, 0x0000, 0x0000, 0x008b], [0x8000, 0x0000, 0x0000, 0x08089], [0x8000, 0x0000, 0x0000, 0x8003],
            [0x8000, 0x0000, 0x0000, 0x8002], [0x8000, 0x0000, 0x0000, 0x0080], [0x0000, 0x0000, 0x0000, 0x0800a], [0x8000, 0x0000, 0x8000, 0x000a],
            [0x8000, 0x0000, 0x8000, 0x8081], [0x8000, 0x0000, 0x0000, 0x8080], [0x0000, 0x0000, 0x8000, 0x00001], [0x8000, 0x0000, 0x8000, 0x8008]
        ];

        $bc = [];
        for ($round = 0; $round < $rounds; $round++) {

            // Theta
            for ($i = 0; $i < 5; $i++) {
                $bc[$i] = [
                    $st[$i][0] ^ $st[$i + 5][0] ^ $st[$i + 10][0] ^ $st[$i + 15][0] ^ $st[$i + 20][0],
                    $st[$i][1] ^ $st[$i + 5][1] ^ $st[$i + 10][1] ^ $st[$i + 15][1] ^ $st[$i + 20][1],
                    $st[$i][2] ^ $st[$i + 5][2] ^ $st[$i + 10][2] ^ $st[$i + 15][2] ^ $st[$i + 20][2],
                    $st[$i][3] ^ $st[$i + 5][3] ^ $st[$i + 10][3] ^ $st[$i + 15][3] ^ $st[$i + 20][3]
                ];
            }

            for ($i = 0; $i < 5; $i++) {
                $t = [
                    $bc[($i + 4) % 5][0] ^ ((($bc[($i + 1) % 5][0] << 1) | ($bc[($i + 1) % 5][1] >> 15)) & (0xFFFF)),
                    $bc[($i + 4) % 5][1] ^ ((($bc[($i + 1) % 5][1] << 1) | ($bc[($i + 1) % 5][2] >> 15)) & (0xFFFF)),
                    $bc[($i + 4) % 5][2] ^ ((($bc[($i + 1) % 5][2] << 1) | ($bc[($i + 1) % 5][3] >> 15)) & (0xFFFF)),
                    $bc[($i + 4) % 5][3] ^ ((($bc[($i + 1) % 5][3] << 1) | ($bc[($i + 1) % 5][0] >> 15)) & (0xFFFF))
                ];

                for ($j = 0; $j < 25; $j += 5) {
                    $st[$j + $i] = [
                        $st[$j + $i][0] ^ $t[0],
                        $st[$j + $i][1] ^ $t[1],
                        $st[$j + $i][2] ^ $t[2],
                        $st[$j + $i][3] ^ $t[3]
                    ];
                }
            }

            // Rho Pi
            $t = $st[1];
            for ($i = 0; $i < 24; $i++) {
                $j = self::$keccakf_piln[$i];
                $bc[0] = $st[$j];


                $n = self::$keccakf_rotc[$i] >> 4;
                $m = self::$keccakf_rotc[$i] % 16;

                $st[$j] =  [
                    ((($t[(0+$n) %4] << $m) | ($t[(1+$n) %4] >> (16-$m))) & (0xFFFF)),
                    ((($t[(1+$n) %4] << $m) | ($t[(2+$n) %4] >> (16-$m))) & (0xFFFF)),
                    ((($t[(2+$n) %4] << $m) | ($t[(3+$n) %4] >> (16-$m))) & (0xFFFF)),
                    ((($t[(3+$n) %4] << $m) | ($t[(0+$n) %4] >> (16-$m))) & (0xFFFF))
                ];

                $t = $bc[0];
            }

            //  Chi
            for ($j = 0; $j < 25; $j += 5) {
                for ($i = 0; $i < 5; $i++) {
                    $bc[$i] = $st[$j + $i];
                }
                for ($i = 0; $i < 5; $i++) {
                    $st[$j + $i] = [
                        $st[$j + $i][0] ^ ~$bc[($i + 1) % 5][0] & $bc[($i + 2) % 5][0],
                        $st[$j + $i][1] ^ ~$bc[($i + 1) % 5][1] & $bc[($i + 2) % 5][1],
                        $st[$j + $i][2] ^ ~$bc[($i + 1) % 5][2] & $bc[($i + 2) % 5][2],
                        $st[$j + $i][3] ^ ~$bc[($i + 1) % 5][3] & $bc[($i + 2) % 5][3]
                    ];
                }
            }

            // Iota
            $st[0] = [
                $st[0][0] ^ $keccakf_rndc[$round][0],
                $st[0][1] ^ $keccakf_rndc[$round][1],
                $st[0][2] ^ $keccakf_rndc[$round][2],
                $st[0][3] ^ $keccakf_rndc[$round][3]
            ];
        }
    }

    private static function keccak32($in_raw, int $capacity, int $outputlength, $suffix, bool $raw_output): string {
        $capacity /= 8;

        $inlen = mb_strlen($in_raw, self::ENCODING);

        $rsiz = 200 - 2 * $capacity;
        $rsizw = $rsiz / 8;

        $st = [];
        for ($i = 0; $i < 25; $i++) {
            $st[] = [0, 0, 0, 0];
        }

        for ($in_t = 0; $inlen >= $rsiz; $inlen -= $rsiz, $in_t += $rsiz) {
            for ($i = 0; $i < $rsizw; $i++) {
                $t = unpack('v*', mb_substr($in_raw, $i * 8 + $in_t, 8, self::ENCODING));

                $st[$i] = [
                    $st[$i][0] ^ $t[4],
                    $st[$i][1] ^ $t[3],
                    $st[$i][2] ^ $t[2],
                    $st[$i][3] ^ $t[1]
                ];
            }

            self::keccakf32($st, self::KECCAK_ROUNDS);
        }

        $temp = mb_substr($in_raw, $in_t, $inlen, self::ENCODING);
        $temp = str_pad($temp, $rsiz, "\x0", STR_PAD_RIGHT);

        $temp[$inlen] = chr($suffix);
        $temp[$rsiz - 1] = chr((int) $temp[$rsiz - 1] | 0x80);

        for ($i = 0; $i < $rsizw; $i++) {
            $t = unpack('v*', mb_substr($temp, $i * 8, 8, self::ENCODING));

            $st[$i] = [
                $st[$i][0] ^ $t[4],
                $st[$i][1] ^ $t[3],
                $st[$i][2] ^ $t[2],
                $st[$i][3] ^ $t[1]
            ];
        }

        self::keccakf32($st, self::KECCAK_ROUNDS);

        $out = '';
        for ($i = 0; $i < 25; $i++) {
            $out .= $t = pack('v*', $st[$i][3],$st[$i][2], $st[$i][1], $st[$i][0]);
        }
        $r = mb_substr($out, 0, $outputlength / 8, self::ENCODING);

        return $raw_output ? $r: bin2hex($r);
    }

    private static function keccak($in_raw, int $capacity, int $outputlength, $suffix, bool $raw_output): string {
        return self::$x64
            ? self::keccak64($in_raw, $capacity, $outputlength, $suffix, $raw_output)
            : self::keccak32($in_raw, $capacity, $outputlength, $suffix, $raw_output);
    }

    public static function hash($in, int $mdlen, bool $raw_output = false): string {
        if (!in_array($mdlen, [224, 256, 384, 512], true)) {
            throw new Exception('Unsupported Keccak Hash output size.');
        }

        return self::keccak($in, $mdlen, $mdlen, self::LFSR, $raw_output);
    }

    public static function shake($in, int $security_level, int $outlen, bool $raw_output = false): string {
        if (!in_array($security_level, [128, 256], true)) {
            throw new Exception('Unsupported Keccak Shake security level.');
        }

        return self::keccak($in, $security_level, $outlen, 0x1f, $raw_output);
    }

}
