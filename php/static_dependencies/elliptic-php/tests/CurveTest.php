<?php
require_once __DIR__ . "/../vendor/autoload.php";

use BN\BN;

class CurveTest extends PHPUnit_Framework_TestCase {
    public function test_should_work_with_example_curve() {
        $curve = new \Elliptic\Curve\ShortCurve(array(
            "p" => '1d',
            "a" => '4',
            "b" => '14'
        ));

        $p = $curve->point('18', '16');
        $this->assertTrue($p->validate());
        $this->assertTrue($p->dbl()->validate());
        $this->assertTrue($p->dbl()->add($p)->validate());
        $this->assertTrue($p->dbl()->add($p->dbl())->validate());
        $this->assertTrue($p->dbl()->add($p->dbl())->eq($p->add($p)->add($p)->add($p)));
    }

    public function test_should_work_with_secp112k1() {
        $curve = new \Elliptic\Curve\ShortCurve(array(
            "p" => 'db7c 2abf62e3 5e668076 bead208b',
            "a" => 'db7c 2abf62e3 5e668076 bead2088',
            "b" => '659e f8ba0439 16eede89 11702b22'
        ));

        $p = $curve->point(
            '0948 7239995a 5ee76b55 f9c2f098',
            'a89c e5af8724 c0a23e0e 0ff77500');
        $this->assertTrue($p->validate());
        $this->assertTrue($p->dbl()->validate());
    }

    public function test_should_work_with_secp256k1() {
        $curve = new \Elliptic\Curve\ShortCurve(array(
            "p" => 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ' .
                   'fffffc2f',
            "a" => '0',
            "b" => '7',
            "n" => 'ffffffff ffffffff ffffffff fffffffe ' .
                   'baaedce6 af48a03b bfd25e8c d0364141',
            "g" => [
                '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8'
            ]
        ));

        $p = $curve->point(
            '79be667e f9dcbbac 55a06295 ce870b07 029bfcdb 2dce28d9 59f2815b 16f81798',
            '483ada77 26a3c465 5da4fbfc 0e1108a8 fd17b448 a6855419 9c47d08f fb10d4b8'
        );
        $this->assertTrue($p->validate());
        $this->assertTrue($p->dbl()->validate());
        $this->assertTrue($p->toJ()->dbl()->toP()->validate());
        $this->assertTrue($p->mul(new BN('79be667e f9dcbbac 55a06295 ce870b07', 16))->validate());

        $j = $p->toJ();
        $this->assertTrue($j->trpl()->eq($j->dbl()->add($j)));

        // Endomorphism test
        $this->assertNotNull($curve->endo);
        $this->assertEquals(
            $curve->endo["beta"]->fromRed()->toString(16),
            '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee');
        $this->assertEquals(
            $curve->endo["lambda"]->toString(16),
            '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72');

        $k = new BN('1234567890123456789012345678901234', 16);
        $split = $curve->_endoSplit($k);

        $testK = $split["k1"]->add($split["k2"]->mul($curve->endo["lambda"]))->umod($curve->n);
        $this->assertEquals($testK->toString(16), $k->toString(16));
    }

    public function test_should_compute_this_problematic_secp256k1_multiplication() {
        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;
        $g1 = $curve->g; // precomputed g
        $this->assertNotNull($g1->precomputed);
        $g2 = $curve->point($g1->getX(), $g1->getY()); // not precomputed g
        $this->assertNull($g2->precomputed);
        $a = new BN(
            '6d1229a6b24c2e775c062870ad26bc261051e0198c67203167273c7c62538846', 16);
        $p1 = $g1->mul($a);
        $p2 = $g2->mul($a);
        $this->assertTrue($p1->eq($p2));
    }

    public function test_should_not_use_fixed_NAF_when_k_is_too_large() {
        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;
        $g1 = $curve->g; // precomputed g
        $this->assertNotNull($g1->precomputed);
        $g2 = $curve->point($g1->getX(), $g1->getY()); // not precomputed g
        $this->assertNull($g2->precomputed);

        $a = new BN(
            '6d1229a6b24c2e775c062870ad26bc26' .
            '1051e0198c67203167273c7c6253884612345678',
            16);
        $p1 = $g1->mul($a);
        $p2 = $g2->mul($a);
        $this->assertTrue($p1->eq($p2));
    }

    public function test_should_not_fail_on_secp256k1_regression() {
        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;
        $k1 = new BN(
            '32efeba414cd0c830aed727749e816a01c471831536fd2fce28c56b54f5a3bb1', 16);
        $k2 = new BN(
            '5f2e49b5d64e53f9811545434706cde4de528af97bfd49fde1f6cf792ee37a8c', 16);

        $p1 = $curve->g->mul($k1);
        $p2 = $curve->g->mul($k2);

        // 2 + 2 + 1 = 2 + 1 + 2
        $two = $p2->dbl();
        $five = $two->dbl()->add($p2);
        $three = $two->add($p2);
        $maybeFive = $three->add($two);

        $this->assertTrue($maybeFive->eq($five));

        $p1 = $p1->mul($k2);
        $p2 = $p2->mul($k1);

        $this->assertTrue($p1->validate());
        $this->assertTrue($p2->validate());
        $this->assertTrue($p1->eq($p2));
    }

    public function test_should_correctly_double_the_affine_point_on_secp256k1() {
        $bad = new ArrayObject(array(
            "x" => '026a2073b1ef6fab47ace18e60e728a05180a82755bbcec9a0abc08ad9f7a3d4',
            "y" => '9cd8cb48c3281596139f147c1364a3ede88d3f310fdb0eb98c924e599ca1b3c9',
            "z" => 'd78587ad45e4102f48b54b5d85598296e069ce6085002e169c6bad78ddc6d9bd'
        ), ArrayObject::ARRAY_AS_PROPS);

        $good = new ArrayObject(array(
            "x" => 'e7789226739ac2eb3c7ccb2a9a910066beeed86cdb4e0f8a7fee8eeb29dc7016',
            "y" => '4b76b191fd6d47d07828ea965e275b76d0e3e0196cd5056d38384fbb819f9fcb',
            "z" => 'cbf8d99056618ba132d6145b904eee1ce566e0feedb9595139c45f84e90cfa7d'
        ), ArrayObject::ARRAY_AS_PROPS);

        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;
        $bad = $curve->jpoint($bad->x, $bad->y, $bad->z);
        $good = $curve->jpoint($good->x, $good->y, $good->z);

        // They are the same points
        $this->assertTrue($bad->add($good->neg())->isInfinity());

        // But doubling borks them out
        $this->assertTrue($bad->dbl()->add($good->dbl()->neg())->isInfinity());
    }

    public function test_should_store_precomputed_values_correctly_on_negation() {
        $curve = \Elliptic\Curves::getCurve("secp256k1")->curve;
        $p = $curve->g->mul('2');
        $p->precompute();
        $neg = $p->neg(true);
        $neg2 = $neg->neg(true);
        $this->assertTrue($p->eq($neg2));
    }
}
