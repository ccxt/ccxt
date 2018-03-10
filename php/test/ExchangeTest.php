<?php

use ccxt\Exchange;
use PHPUnit\Framework\TestCase;

class ExchangeTest extends TestCase {

    public function testSum () {
        $this->assertSame (0,   Exchange::sum ());
        $this->assertSame (2,   Exchange::sum (2));
        $this->assertSame (432, Exchange::sum (2, 30, 400));
        $this->assertSame (439, Exchange::sum (2, null, [88], 30, '7', 400, null));
    }
}
