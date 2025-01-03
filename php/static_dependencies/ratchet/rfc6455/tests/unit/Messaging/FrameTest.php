<?php

namespace Ratchet\RFC6455\Test\Unit\Messaging;

use Ratchet\RFC6455\Messaging\Frame;
use PHPUnit\Framework\TestCase;

/**
 * @covers Ratchet\RFC6455\Messaging\Frame
 * @todo getMaskingKey, getPayloadStartingByte don't have tests yet
 * @todo Could use some clean up in general, I had to rush to fix a bug for a deadline, sorry.
 */
class FrameTest extends TestCase {
    protected $_firstByteFinText    = '10000001';

    protected $_secondByteMaskedSPL = '11111101';

    /** @var Frame */
    protected $_frame;

    protected $_packer;

    public function setUp() {
        $this->_frame = new Frame;
    }

    /**
     * Encode the fake binary string to send over the wire
     * @param string of 1's and 0's
     * @return string
     */
    public static function encode($in) {
        if (strlen($in) > 8) {
            $out = '';
            while (strlen($in) >= 8) {
                $out .= static::encode(substr($in, 0, 8));
                $in   = substr($in, 8);
            }
            return $out;
        }
        return chr(bindec($in));
    }

    /**
     * This is a data provider
     * param string The UTF8 message
     * param string The WebSocket framed message, then base64_encoded
     */
    public static function UnframeMessageProvider() {
        return array(
            array('Hello World!', 'gYydAIfa1WXrtvIg0LXvbOP7'),
            array('!@#$%^&*()-=_+[]{}\|/.,<>`~', 'gZv+h96r38f9j9vZ+IHWrvOWoayF9oX6gtfRqfKXwOeg'),
            array('ಠ_ಠ', 'gYfnSpu5B/g75gf4Ow=='),
            array(
                "The quick brown fox jumps over the lazy dog.  All work and no play makes Chris a dull boy.  I'm trying to get past 128 characters for a unit test here...",
                'gf4Amahb14P8M7Kj2S6+4MN7tfHHLLmjzjSvo8IuuvPbe7j1zSn398A+9+/JIa6jzDSwrYh7lu/Ee6Ds2jD34sY/9+3He6fvySL37skwsvCIGL/xwSj34og/ou/Ee7Xs0XX3o+F8uqPcKa7qxjz398d7sObce6fi2y/3sppj9+DAOqXiyy+y8dt7sezae7aj3TW+94gvsvDce7/m2j75rYY='
            )
        );
    }

    public static function underflowProvider() {
        return array(
            array('isFinal', ''),
            array('getRsv1', ''),
            array('getRsv2', ''),
            array('getRsv3', ''),
            array('getOpcode', ''),
            array('isMasked', '10000001'),
            array('getPayloadLength', '10000001'),
            array('getPayloadLength', '1000000111111110'),
            array('getMaskingKey', '1000000110000111'),
            array('getPayload', '100000011000000100011100101010101001100111110100')
        );
    }

    /**
     * @dataProvider underflowProvider
     *
     * @covers Ratchet\RFC6455\Messaging\Frame::isFinal
     * @covers Ratchet\RFC6455\Messaging\Frame::getRsv1
     * @covers Ratchet\RFC6455\Messaging\Frame::getRsv2
     * @covers Ratchet\RFC6455\Messaging\Frame::getRsv3
     * @covers Ratchet\RFC6455\Messaging\Frame::getOpcode
     * @covers Ratchet\RFC6455\Messaging\Frame::isMasked
     * @covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     * @covers Ratchet\RFC6455\Messaging\Frame::getMaskingKey
     * @covers Ratchet\RFC6455\Messaging\Frame::getPayload
     */
    public function testUnderflowExceptionFromAllTheMethodsMimickingBuffering($method, $bin) {
        $this->setExpectedException('\UnderflowException');
        if (!empty($bin)) {
            $this->_frame->addBuffer(static::encode($bin));
        }
        call_user_func(array($this->_frame, $method));
    }

    /**
     * A data provider for testing the first byte of a WebSocket frame
     * param bool Given, is the byte indicate this is the final frame
     * param int Given, what is the expected opcode
     * param string of 0|1 Each character represents a bit in the byte
     */
    public static function firstByteProvider() {
        return array(
            array(false, false, false, true,   8, '00011000'),
            array(true,  false, true,  false, 10, '10101010'),
            array(false, false, false, false, 15, '00001111'),
            array(true,  false, false, false,  1, '10000001'),
            array(true,  true,  true,  true,  15, '11111111'),
            array(true,  true,  false, false,  7, '11000111')
        );
    }

    /**
     * @dataProvider firstByteProvider
     * covers Ratchet\RFC6455\Messaging\Frame::isFinal
     */
    public function testFinCodeFromBits($fin, $rsv1, $rsv2, $rsv3, $opcode, $bin) {
        $this->_frame->addBuffer(static::encode($bin));
        $this->assertEquals($fin, $this->_frame->isFinal());
    }

    /**
     * @dataProvider firstByteProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getRsv1
     * covers Ratchet\RFC6455\Messaging\Frame::getRsv2
     * covers Ratchet\RFC6455\Messaging\Frame::getRsv3
     */
    public function testGetRsvFromBits($fin, $rsv1, $rsv2, $rsv3, $opcode, $bin) {
        $this->_frame->addBuffer(static::encode($bin));
        $this->assertEquals($rsv1, $this->_frame->getRsv1());
        $this->assertEquals($rsv2, $this->_frame->getRsv2());
        $this->assertEquals($rsv3, $this->_frame->getRsv3());
    }

    /**
     * @dataProvider firstByteProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getOpcode
     */
    public function testOpcodeFromBits($fin, $rsv1, $rsv2, $rsv3, $opcode, $bin) {
        $this->_frame->addBuffer(static::encode($bin));
        $this->assertEquals($opcode, $this->_frame->getOpcode());
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::isFinal
     */
    public function testFinCodeFromFullMessage($msg, $encoded) {
        $this->_frame->addBuffer(base64_decode($encoded));
        $this->assertTrue($this->_frame->isFinal());
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getOpcode
     */
    public function testOpcodeFromFullMessage($msg, $encoded) {
        $this->_frame->addBuffer(base64_decode($encoded));
        $this->assertEquals(1, $this->_frame->getOpcode());
    }

    public static function payloadLengthDescriptionProvider() {
        return array(
            array(7,  '01110101'),
            array(7,  '01111101'),
            array(23, '01111110'),
            array(71, '01111111'),
            array(7,  '00000000'), // Should this throw an exception?  Can a payload be empty?
            array(7,  '00000001')
        );
    }

    /**
     * @dataProvider payloadLengthDescriptionProvider
     * covers Ratchet\RFC6455\Messaging\Frame::addBuffer
     * covers Ratchet\RFC6455\Messaging\Frame::getFirstPayloadVal
     */
    public function testFirstPayloadDesignationValue($bits, $bin) {
        $this->_frame->addBuffer(static::encode($this->_firstByteFinText));
        $this->_frame->addBuffer(static::encode($bin));
        $ref = new \ReflectionClass($this->_frame);
        $cb  = $ref->getMethod('getFirstPayloadVal');
        $cb->setAccessible(true);
        $this->assertEquals(bindec($bin), $cb->invoke($this->_frame));
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::getFirstPayloadVal
     */
    public function testFirstPayloadValUnderflow() {
        $ref = new \ReflectionClass($this->_frame);
        $cb  = $ref->getMethod('getFirstPayloadVal');
        $cb->setAccessible(true);
        $this->setExpectedException('UnderflowException');
        $cb->invoke($this->_frame);
    }

    /**
     * @dataProvider payloadLengthDescriptionProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getNumPayloadBits
     */
    public function testDetermineHowManyBitsAreUsedToDescribePayload($expected_bits, $bin) {
        $this->_frame->addBuffer(static::encode($this->_firstByteFinText));
        $this->_frame->addBuffer(static::encode($bin));
        $ref = new \ReflectionClass($this->_frame);
        $cb  = $ref->getMethod('getNumPayloadBits');
        $cb->setAccessible(true);
        $this->assertEquals($expected_bits, $cb->invoke($this->_frame));
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::getNumPayloadBits
     */
    public function testgetNumPayloadBitsUnderflow() {
        $ref = new \ReflectionClass($this->_frame);
        $cb  = $ref->getMethod('getNumPayloadBits');
        $cb->setAccessible(true);
        $this->setExpectedException('UnderflowException');
        $cb->invoke($this->_frame);
    }

    public function secondByteProvider() {
        return array(
            array(true,   1, '10000001'),
            array(false,  1, '00000001'),
            array(true, 125, $this->_secondByteMaskedSPL)
        );
    }
    /**
     * @dataProvider secondByteProvider
     * covers Ratchet\RFC6455\Messaging\Frame::isMasked
     */
    public function testIsMaskedReturnsExpectedValue($masked, $payload_length, $bin) {
        $this->_frame->addBuffer(static::encode($this->_firstByteFinText));
        $this->_frame->addBuffer(static::encode($bin));
        $this->assertEquals($masked, $this->_frame->isMasked());
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::isMasked
     */
    public function testIsMaskedFromFullMessage($msg, $encoded) {
        $this->_frame->addBuffer(base64_decode($encoded));
        $this->assertTrue($this->_frame->isMasked());
    }

    /**
     * @dataProvider secondByteProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     */
    public function testGetPayloadLengthWhenOnlyFirstFrameIsUsed($masked, $payload_length, $bin) {
        $this->_frame->addBuffer(static::encode($this->_firstByteFinText));
        $this->_frame->addBuffer(static::encode($bin));
        $this->assertEquals($payload_length, $this->_frame->getPayloadLength());
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     * @todo Not yet testing when second additional payload length descriptor
     */
    public function testGetPayloadLengthFromFullMessage($msg, $encoded) {
        $this->_frame->addBuffer(base64_decode($encoded));
        $this->assertEquals(strlen($msg), $this->_frame->getPayloadLength());
    }

    public function maskingKeyProvider() {
        $frame = new Frame;
        return array(
            array($frame->generateMaskingKey()),
            array($frame->generateMaskingKey()),
            array($frame->generateMaskingKey())
        );
    }

    /**
     * @dataProvider maskingKeyProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getMaskingKey
     * @todo I I wrote the dataProvider incorrectly, skipping for now
     */
    public function testGetMaskingKey($mask) {
        $this->_frame->addBuffer(static::encode($this->_firstByteFinText));
        $this->_frame->addBuffer(static::encode($this->_secondByteMaskedSPL));
        $this->_frame->addBuffer($mask);
        $this->assertEquals($mask, $this->_frame->getMaskingKey());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::getMaskingKey
     */
    public function testGetMaskingKeyOnUnmaskedPayload() {
        $frame = new Frame('Hello World!');
        $this->assertEquals('', $frame->getMaskingKey());
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getPayload
     * @todo Move this test to bottom as it requires all methods of the class
     */
    public function testUnframeFullMessage($unframed, $base_framed) {
        $this->_frame->addBuffer(base64_decode($base_framed));
        $this->assertEquals($unframed, $this->_frame->getPayload());
    }

    public static function messageFragmentProvider() {
        return array(
            array(false, '', '', '', '', '')
        );
    }

    /**
     * @dataProvider UnframeMessageProvider
     * covers Ratchet\RFC6455\Messaging\Frame::getPayload
     */
    public function testCheckPiecingTogetherMessage($msg, $encoded) {
        $framed = base64_decode($encoded);
        for ($i = 0, $len = strlen($framed);$i < $len; $i++) {
            $this->_frame->addBuffer(substr($framed, $i, 1));
        }
        $this->assertEquals($msg, $this->_frame->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::__construct
     * covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     * covers Ratchet\RFC6455\Messaging\Frame::getPayload
     */
    public function testLongCreate() {
        $len = 65525;
        $pl  = $this->generateRandomString($len);
        $frame = new Frame($pl, true, Frame::OP_PING);
        $this->assertTrue($frame->isFinal());
        $this->assertEquals(Frame::OP_PING, $frame->getOpcode());
        $this->assertFalse($frame->isMasked());
        $this->assertEquals($len, $frame->getPayloadLength());
        $this->assertEquals($pl, $frame->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::__construct
     * covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     */
    public function testReallyLongCreate() {
        $len = 65575;
        $frame = new Frame($this->generateRandomString($len));
        $this->assertEquals($len, $frame->getPayloadLength());
    }
    /**
     * covers Ratchet\RFC6455\Messaging\Frame::__construct
     * covers Ratchet\RFC6455\Messaging\Frame::extractOverflow
     */
    public function testExtractOverflow() {
        $string1 = $this->generateRandomString();
        $frame1  = new Frame($string1);
        $string2 = $this->generateRandomString();
        $frame2  = new Frame($string2);
        $cat = new Frame;
        $cat->addBuffer($frame1->getContents() . $frame2->getContents());
        $this->assertEquals($frame1->getContents(), $cat->getContents());
        $this->assertEquals($string1, $cat->getPayload());
        $uncat = new Frame;
        $uncat->addBuffer($cat->extractOverflow());
        $this->assertEquals($string1, $cat->getPayload());
        $this->assertEquals($string2, $uncat->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::extractOverflow
     */
    public function testEmptyExtractOverflow() {
        $string = $this->generateRandomString();
        $frame  = new Frame($string);
        $this->assertEquals($string, $frame->getPayload());
        $this->assertEquals('', $frame->extractOverflow());
        $this->assertEquals($string, $frame->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::getContents
     */
    public function testGetContents() {
        $msg = 'The quick brown fox jumps over the lazy dog.';
        $frame1 = new Frame($msg);
        $frame2 = new Frame($msg);
        $frame2->maskPayload();
        $this->assertNotEquals($frame1->getContents(), $frame2->getContents());
        $this->assertEquals(strlen($frame1->getContents()) + 4, strlen($frame2->getContents()));
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::maskPayload
     */
    public function testMasking() {
        $msg   = 'The quick brown fox jumps over the lazy dog.';
        $frame = new Frame($msg);
        $frame->maskPayload();
        $this->assertTrue($frame->isMasked());
        $this->assertEquals($msg, $frame->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::unMaskPayload
     */
    public function testUnMaskPayload() {
        $string = $this->generateRandomString();
        $frame  = new Frame($string);
        $frame->maskPayload()->unMaskPayload();
        $this->assertFalse($frame->isMasked());
        $this->assertEquals($string, $frame->getPayload());
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::generateMaskingKey
     */
    public function testGenerateMaskingKey() {
        $dupe = false;
        $done = array();
        for ($i = 0; $i < 10; $i++) {
            $new = $this->_frame->generateMaskingKey();
            if (in_array($new, $done)) {
                $dupe = true;
            }
            $done[] = $new;
        }
        $this->assertEquals(4, strlen($new));
        $this->assertFalse($dupe);
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::maskPayload
     */
    public function testGivenMaskIsValid() {
        $this->setExpectedException('InvalidArgumentException');
        $this->_frame->maskPayload('hello world');
    }

    /**
     * covers Ratchet\RFC6455\Messaging\Frame::maskPayload
     */
    public function testGivenMaskIsValidAscii() {
        if (!extension_loaded('mbstring')) {
            $this->markTestSkipped("mbstring required for this test");
            return;
        }
        $this->setExpectedException('OutOfBoundsException');
        $this->_frame->maskPayload('x✖');
    }

    protected function generateRandomString($length = 10, $addSpaces = true, $addNumbers = true) {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"$%&/()=[]{}'; // ยง
        $useChars = array();
        for($i = 0; $i < $length; $i++) {
            $useChars[] = $characters[mt_rand(0, strlen($characters) - 1)];
        }
        if($addSpaces === true) {
            array_push($useChars, ' ', ' ', ' ', ' ', ' ', ' ');
        }
        if($addNumbers === true) {
            array_push($useChars, rand(0, 9), rand(0, 9), rand(0, 9));
        }
        shuffle($useChars);
        $randomString = trim(implode('', $useChars));
        $randomString = substr($randomString, 0, $length);
        return $randomString;
    }

    /**
     * There was a frame boundary issue when the first 3 bytes of a frame with a payload greater than
     * 126 was added to the frame buffer and then Frame::getPayloadLength was called. It would cause the frame
     * to set the payload length to 126 and then not recalculate it once the full length information was available.
     *
     * This is fixed by setting the defPayLen back to -1 before the underflow exception is thrown.
     *
     * covers Ratchet\RFC6455\Messaging\Frame::getPayloadLength
     * covers Ratchet\RFC6455\Messaging\Frame::extractOverflow
     */
    public function testFrameDeliveredOneByteAtATime() {
        $startHeader = "\x01\x7e\x01\x00"; // header for a text frame of 256 - non-final
        $framePayload = str_repeat("*", 256);
        $rawOverflow = "xyz";
        $rawFrame = $startHeader . $framePayload . $rawOverflow;
        $frame = new Frame();
        $payloadLen = 256;
        for ($i = 0; $i < strlen($rawFrame); $i++) {
            $frame->addBuffer($rawFrame[$i]);
            try {
                // payloadLen will
                $payloadLen = $frame->getPayloadLength();
            } catch (\UnderflowException $e) {
                if ($i > 2) { // we should get an underflow on 0,1,2
                    $this->fail("Underflow exception when the frame length should be available");
                }
            }
            if ($payloadLen !== 256) {
                $this->fail("Payload length of " . $payloadLen . " should have been 256.");
            }
        }
        // make sure the overflow is good
        $this->assertEquals($rawOverflow, $frame->extractOverflow());
    }
}
