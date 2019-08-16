<?php

/**
 *@see https://gist.github.com/Souptacular/f50128d63b5188490fa2
 */

use kornrunner\Keccak;
use PHPUnit\Framework\TestCase;

class KeccakTest extends TestCase
{
    private const SHORT = "52A608AB21CCDD8A4457A57EDE782176";
    private const LONG = "3A3A819C48EFDE2AD914FBF00E18AB6BC4F14513AB27D0C178A188B61431E7F5623CB66B23346775D386B50E982C493ADBBFC54B9A3CD383382336A1A0B2150A15358F336D03AE18F666C7573D55C4FD181C29E6CCFDE63EA35F0ADF5885CFC0A3D84A2B2E4DD24496DB789E663170CEF74798AA1BBCD4574EA0BBA40489D764B2F83AADC66B148B4A0CD95246C127D5871C4F11418690A5DDF01246A0C80A43C70088B6183639DCFDA4125BD113A8F49EE23ED306FAAC576C3FB0C1E256671D817FC2534A52F5B439F72E424DE376F4C565CCA82307DD9EF76DA5B7C4EB7E085172E328807C02D011FFBF33785378D79DC266F6A5BE6BB0E4A92ECEEBAEB1";
    private static $x64;

    public static function setUpBeforeClass() {
        parent::setUpBeforeClass();
        $class = new ReflectionClass(Keccak::class);
        self::$x64 = $class->getProperty('x64');
        self::$x64->setAccessible(true);
    }

    /**
     * @dataProvider hash
     */
    public function testHash($level, $tests) {
        $x64_values = [true, false];
        foreach ($x64_values as $x64_bit) {
            self::$x64->setValue($x64_bit);

            foreach($tests as $test) {
                $message  = $test[0];
                $expected = $test[1];
                $this->assertEquals($expected, Keccak::hash($message, $level));
                $this->assertEquals(hex2bin($expected), Keccak::hash($message, $level, true));
            }
        }
    }

    public static function hash(): array {
        return [
            /**
             * @see https://emn178.github.io/online-tools/keccak_512.html
             */
            [512, [
                ['','0eab42de4c3ceb9235fc91acffe746b29c29a8c366b7c60e4e67c466f36a4304c00fa9caf9d87976ba469bcbe06713b435f091ef2769fb160cdab33d3670680e'],
                ['testing', '9558a7ba9ac74b33b347703ffe33f8d561d86d9fcad1cfd63225fb55dfea50a0953a0efafd6072377f4c396e806d5bda0294cba28762740d8446fee45a276e4a'],
                ['The quick brown fox jumps over the lazy dog', 'd135bb84d0439dbac432247ee573a23ea7d3c9deb2a968eb31d47c4fb45f1ef4422d6c531b5b9bd6f449ebcc449ea94d0a8f05f62130fda612da53c79659f609'],
                ['The quick brown fox jumps over the lazy dog.','ab7192d2b11f51c7dd744e7b3441febf397ca07bf812cceae122ca4ded6387889064f8db9230f173f6d1ab6e24b6e50f065b039f799f5592360a6558eb52d760'],
                [hex2bin(self::SHORT), '4b39d3da5bcdf4d9b769015995644311c14c435bf72b1009d6dd71b01a63b97cfb596418e8e42342d117e07471a8914314ba7b0e264dadf0cea381868cbd43d1'],
                [hex2bin(self::LONG), '81950e7096d31d4f22e3db71cac725bf59e81af54c7ca9e6aeee71c010fc5467466312a01aa5c137cfb140646941556796f612c9351268737c7e9a2b9631d1fa']
            ]],
            /**
             * @see https://emn178.github.io/online-tools/keccak_384.html
             */
            [384, [
                ['', '2c23146a63a29acf99e73b88f8c24eaa7dc60aa771780ccc006afbfa8fe2479b2dd2b21362337441ac12b515911957ff'],
                ['testing', '1020b1c91956efe79b89c387b54de4f7a9c187c3970552f9f48c0da176f6326b7aa694795d2c9adcf2bdd20aec605588'],
                ['The quick brown fox jumps over the lazy dog', '283990fa9d5fb731d786c5bbee94ea4db4910f18c62c03d173fc0a5e494422e8a0b3da7574dae7fa0baf005e504063b3'],
                ['The quick brown fox jumps over the lazy dog.', '9ad8e17325408eddb6edee6147f13856ad819bb7532668b605a24a2d958f88bd5c169e56dc4b2f89ffd325f6006d820b'],
                [hex2bin(self::SHORT), '18422ac1d3a1e54bad876883d2d6dd65f65c1d5f33a7125cc4c186405a12ed64ba96672eedda8c5a6331d28683f488eb'],
                [hex2bin(self::LONG), '6bff1c8405a3fe594e360e3bccea1ebcd509310dc79b9e45c263783d7a5dd662c6789b18bd567dbdda1554f5bee6a860'],
                [hex2bin('E35780EB9799AD4C77535D4DDB683CF33EF367715327CF4C4A58ED9CBDCDD486F669F80189D549A9364FA82A51A52654EC721BB3AAB95DCEB4A86A6AFA93826DB923517E928F33E3FBA850D45660EF83B9876ACCAFA2A9987A254B137C6E140A21691E1069413848'), '9fb5700502e01926824f46e9f61894f9487dbcf8ae6217203c85606f975566539376d6239db04aef9bf48ca4f191a90b'],
            ]],
             /**
             * @see https://emn178.github.io/online-tools/keccak_256.html
             */
            [256, [
                ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
                ['testing', '5f16f4c7f149ac4f9510d9cf8cf384038ad348b3bcdc01915f95de12df9d1b02'],
                ['The quick brown fox jumps over the lazy dog', '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15'],
                ['The quick brown fox jumps over the lazy dog.', '578951e24efd62a3d63a86f7cd19aaa53c898fe287d2552133220370240b572d'],
                [hex2bin(self::SHORT), '0e32defa2071f0b5ac0e6a108b842ed0f1d3249712f58ee0ddf956fe332a5f95'],
                [hex2bin(self::LONG), '348fb774adc970a16b1105669442625e6adaa8257a89effdb5a802f161b862ea'],
                [hex2bin('9F2FCC7C90DE090D6B87CD7E9718C1EA6CB21118FC2D5DE9F97E5DB6AC1E9C10'), '24dd2ee02482144f539f810d2caa8a7b75d0fa33657e47932122d273c3f6f6d1'],
            ]],
             /**
             * @see https://emn178.github.io/online-tools/keccak_224.html
             */
            [224, [
                ['', 'f71837502ba8e10837bdd8d365adb85591895602fc552b48b7390abd'],
                ['testing', '7b77b0b01d9b669ec7637ae75fd2f0ce234c8c8c835723b6715f4b59'],
                ['The quick brown fox jumps over the lazy dog', '310aee6b30c47350576ac2873fa89fd190cdc488442f3ef654cf23fe'],
                ['The quick brown fox jumps over the lazy dog.', 'c59d4eaeac728671c635ff645014e2afa935bebffdb5fbd207ffdeab'],
                [hex2bin(self::SHORT), '5679cd509c5120af54795cf477149641cf27b2ebb6a5f90340704e57'],
                [hex2bin(self::LONG), '5af56987ea9cf11fcd0eac5ebc14b037365e9b1123e31cb2dfc7929a'],
             ]],
        ];
    }

    /**
     * @dataProvider Shake
     */
    public function testShake($level, $size, $tests)
    {
        $x64_values = [true, false];
        foreach ($x64_values as $x64_bit) {
            self::$x64->setValue($x64_bit);

            foreach($tests as $test) {
                $message  = $test[0];
                $expected = $test[1];
                $this->assertEquals($expected, Keccak::shake($message, $level, $size));
                $this->assertEquals(hex2bin($expected), Keccak::shake($message, $level, $size, true));
            }
        }
    }

    public static function shake(): array {
        return [
            [128, 256, [
                ['', '7f9c2ba4e88f827d616045507605853ed73b8093f6efbc88eb1a6eacfa66ef26'],
                [hex2bin(self::SHORT), '3a0faca70c9d2b81d1064d429ea3b05ad27366f64985379ddd75bc73d6a83810'],
                [hex2bin(self::LONG), '14236e75b9784df4f57935f945356cbe383fe513ed30286f91060759bcb0ef4b'],
                ['The quick brown fox jumps over the lazy dog', 'f4202e3c5852f9182a0430fd8144f0a74b95e7417ecae17db0f8cfeed0e3e66e'],
                ['The quick brown fox jumps over the lazy dof', '853f4538be0db9621a6cea659a06c1107b1f83f02b13d18297bd39d7411cf10c'],
            ]],
            [256, 512, [
                ['', '46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200cb05019d67b592f6fc821c49479ab48640292eacb3b7c4be'],
                [hex2bin(self::SHORT), '57119c4507f975ad0e9ea4f1166e5f9b590bf2671aaeb41d130d2c570bafc579b0b9ec485cc736a0a848bbc886cbaa79ffcd067ce64b3b410741ab011c544225'],
                [hex2bin(self::LONG), '8a5199b4a7e133e264a86202720655894d48cff344a928cf8347f48379cef347dfc5bcffab99b27b1f89aa2735e23d30088ffa03b9edb02b9635470ab9f10389'],
            ]],
        ];
    }

    public function testUnsupportedHashOutputSize()
    {
        $this->expectException('Exception');
        $this->expectExceptionMessage('Unsupported Keccak Hash output size.');
        Keccak::hash('', 225);
    }

    public function testUnsupportedShakeSecurityLevel()
    {
        $this->expectException('Exception');
        $this->expectExceptionMessage('Unsupported Keccak Shake security level.');
        Keccak::shake('', 129, 256);
    }
}