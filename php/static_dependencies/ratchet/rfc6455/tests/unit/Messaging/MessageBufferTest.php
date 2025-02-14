<?php

namespace Ratchet\RFC6455\Test\Unit\Messaging;

use Ratchet\RFC6455\Messaging\CloseFrameChecker;
use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;
use Ratchet\RFC6455\Messaging\MessageBuffer;
use React\EventLoop\Factory;
use PHPUnit\Framework\TestCase;

class MessageBufferTest extends TestCase
{
    /**
     * This is to test that MessageBuffer can handle a large receive
     * buffer with many many frames without blowing the stack (pre-v0.4 issue)
     */
    public function testProcessingLotsOfFramesInASingleChunk() {
        $frame = new Frame('a', true, Frame::OP_TEXT);

        $frameRaw = $frame->getContents();

        $data = str_repeat($frameRaw, 1000);

        $messageCount = 0;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount) {
                $messageCount++;
                $this->assertEquals('a', $message->getPayload());
            },
            null,
            false
        );

        $messageBuffer->onData($data);

        $this->assertEquals(1000, $messageCount);
    }

    public function testProcessingMessagesAsynchronouslyWhileBlockingInMessageHandler() {
        $loop = Factory::create();

        $frameA = new Frame('a', true, Frame::OP_TEXT);
        $frameB = new Frame('b', true, Frame::OP_TEXT);

        $bReceived = false;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount, &$bReceived, $loop) {
                $payload = $message->getPayload();
                $bReceived = $payload === 'b';

                if (!$bReceived) {
                    $loop->run();
                }
            },
            null,
            false
        );

        $loop->addPeriodicTimer(0.1, function () use ($messageBuffer, $frameB, $loop) {
            $loop->stop();
            $messageBuffer->onData($frameB->getContents());
        });

        $messageBuffer->onData($frameA->getContents());

        $this->assertTrue($bReceived);
    }

    public function testInvalidFrameLength() {
        $frame = new Frame(str_repeat('a', 200), true, Frame::OP_TEXT);

        $frameRaw = $frame->getContents();

        $frameRaw[1] = "\x7f"; // 127 in the first spot

        $frameRaw[2] = "\xff"; // this will unpack to -1
        $frameRaw[3] = "\xff";
        $frameRaw[4] = "\xff";
        $frameRaw[5] = "\xff";
        $frameRaw[6] = "\xff";
        $frameRaw[7] = "\xff";
        $frameRaw[8] = "\xff";
        $frameRaw[9] = "\xff";

        /** @var Frame $controlFrame */
        $controlFrame = null;
        $messageCount = 0;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount) {
                $messageCount++;
            },
            function (Frame $frame) use (&$controlFrame) {
                $this->assertNull($controlFrame);
                $controlFrame = $frame;
            },
            false,
            null,
            0,
            10
        );

        $messageBuffer->onData($frameRaw);

        $this->assertEquals(0, $messageCount);
        $this->assertTrue($controlFrame instanceof Frame);
        $this->assertEquals(Frame::OP_CLOSE, $controlFrame->getOpcode());
        $this->assertEquals([Frame::CLOSE_PROTOCOL], array_merge(unpack('n*', substr($controlFrame->getPayload(), 0, 2))));

    }

    public function testFrameLengthTooBig() {
        $frame = new Frame(str_repeat('a', 200), true, Frame::OP_TEXT);

        $frameRaw = $frame->getContents();

        $frameRaw[1] = "\x7f"; // 127 in the first spot

        $frameRaw[2] = "\x7f"; // this will unpack to -1
        $frameRaw[3] = "\xff";
        $frameRaw[4] = "\xff";
        $frameRaw[5] = "\xff";
        $frameRaw[6] = "\xff";
        $frameRaw[7] = "\xff";
        $frameRaw[8] = "\xff";
        $frameRaw[9] = "\xff";

        /** @var Frame $controlFrame */
        $controlFrame = null;
        $messageCount = 0;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount) {
                $messageCount++;
            },
            function (Frame $frame) use (&$controlFrame) {
                $this->assertNull($controlFrame);
                $controlFrame = $frame;
            },
            false,
            null,
            0,
            10
        );

        $messageBuffer->onData($frameRaw);

        $this->assertEquals(0, $messageCount);
        $this->assertTrue($controlFrame instanceof Frame);
        $this->assertEquals(Frame::OP_CLOSE, $controlFrame->getOpcode());
        $this->assertEquals([Frame::CLOSE_TOO_BIG], array_merge(unpack('n*', substr($controlFrame->getPayload(), 0, 2))));
    }

    public function testFrameLengthBiggerThanMaxMessagePayload() {
        $frame = new Frame(str_repeat('a', 200), true, Frame::OP_TEXT);

        $frameRaw = $frame->getContents();

        /** @var Frame $controlFrame */
        $controlFrame = null;
        $messageCount = 0;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount) {
                $messageCount++;
            },
            function (Frame $frame) use (&$controlFrame) {
                $this->assertNull($controlFrame);
                $controlFrame = $frame;
            },
            false,
            null,
            100,
            0
        );

        $messageBuffer->onData($frameRaw);

        $this->assertEquals(0, $messageCount);
        $this->assertTrue($controlFrame instanceof Frame);
        $this->assertEquals(Frame::OP_CLOSE, $controlFrame->getOpcode());
        $this->assertEquals([Frame::CLOSE_TOO_BIG], array_merge(unpack('n*', substr($controlFrame->getPayload(), 0, 2))));
    }

    public function testSecondFrameLengthPushesPastMaxMessagePayload() {
        $frame = new Frame(str_repeat('a', 200), false, Frame::OP_TEXT);
        $firstFrameRaw = $frame->getContents();
        $frame = new Frame(str_repeat('b', 200), true, Frame::OP_TEXT);
        $secondFrameRaw = $frame->getContents();

        /** @var Frame $controlFrame */
        $controlFrame = null;
        $messageCount = 0;

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) use (&$messageCount) {
                $messageCount++;
            },
            function (Frame $frame) use (&$controlFrame) {
                $this->assertNull($controlFrame);
                $controlFrame = $frame;
            },
            false,
            null,
            300,
            0
        );

        $messageBuffer->onData($firstFrameRaw);
        // only put part of the second frame in to watch it fail fast
        $messageBuffer->onData(substr($secondFrameRaw, 0, 150));

        $this->assertEquals(0, $messageCount);
        $this->assertTrue($controlFrame instanceof Frame);
        $this->assertEquals(Frame::OP_CLOSE, $controlFrame->getOpcode());
        $this->assertEquals([Frame::CLOSE_TOO_BIG], array_merge(unpack('n*', substr($controlFrame->getPayload(), 0, 2))));
    }

    /**
     * Some test cases from memory limit inspired by https://github.com/BrandEmbassy/php-memory
     *
     * Here is the license for that project:
     * MIT License
     *
     * Copyright (c) 2018 Brand Embassy
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all
     * copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     * SOFTWARE.
     */

    /**
     * @dataProvider phpConfigurationProvider
     *
     * @param string $phpConfigurationValue
     * @param int $expectedLimit
     */
    public function testMemoryLimits($phpConfigurationValue, $expectedLimit) {
        $method = new \ReflectionMethod('Ratchet\RFC6455\Messaging\MessageBuffer', 'getMemoryLimit');
        $method->setAccessible(true);
        $actualLimit = $method->invoke(null, $phpConfigurationValue);

        $this->assertSame($expectedLimit, $actualLimit);
    }

    public function phpConfigurationProvider() {
        return [
            'without unit type, just bytes' => ['500', 500],
            '1 GB with big "G"' => ['1G', 1 * 1024 * 1024 * 1024],
            '128 MB with big "M"' => ['128M', 128 * 1024 * 1024],
            '128 MB with small "m"' => ['128m', 128 * 1024 * 1024],
            '24 kB with small "k"' => ['24k', 24 * 1024],
            '2 GB with small "g"' => ['2g', 2 * 1024 * 1024 * 1024],
            'unlimited memory' => ['-1', 0],
            'invalid float value' => ['2.5M', 2 * 1024 * 1024],
            'empty value' => ['', 0],
            'invalid ini setting' => ['whatever it takes', 0]
        ];
    }

    /**
     * @expectedException \InvalidArgumentException
     */
    public function testInvalidMaxFramePayloadSizes() {
        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) {},
            function (Frame $frame) {},
            false,
            null,
            0,
            0x8000000000000000
        );
    }

    /**
     * @expectedException \InvalidArgumentException
     */
    public function testInvalidMaxMessagePayloadSizes() {
        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) {},
            function (Frame $frame) {},
            false,
            null,
            0x8000000000000000,
            0
        );
    }

    /**
     * @dataProvider phpConfigurationProvider
     *
     * @param string $phpConfigurationValue
     * @param int $expectedLimit
     *
     * @runInSeparateProcess
     * @requires PHP 7.0
     */
    public function testIniSizes($phpConfigurationValue, $expectedLimit) {
        $value = @ini_set('memory_limit', $phpConfigurationValue);
        if ($value === false) {
           $this->markTestSkipped("Does not support setting the memory_limit lower than current memory_usage");
        }

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) {},
            function (Frame $frame) {},
            false,
            null
        );

        if ($expectedLimit === -1) {
            $expectedLimit = 0;
        }

        $prop = new \ReflectionProperty($messageBuffer, 'maxMessagePayloadSize');
        $prop->setAccessible(true);
        $this->assertEquals($expectedLimit / 4, $prop->getValue($messageBuffer));

        $prop = new \ReflectionProperty($messageBuffer, 'maxFramePayloadSize');
        $prop->setAccessible(true);
        $this->assertEquals($expectedLimit / 4, $prop->getValue($messageBuffer));
    }

    /**
     * @runInSeparateProcess
     * @requires PHP 7.0
     */
    public function testInvalidIniSize() {
        $value = @ini_set('memory_limit', 'lots of memory');
        if ($value === false) {
            $this->markTestSkipped("Does not support setting the memory_limit lower than current memory_usage");
        }

        $messageBuffer = new MessageBuffer(
            new CloseFrameChecker(),
            function (Message $message) {},
            function (Frame $frame) {},
            false,
            null
        );

        $prop = new \ReflectionProperty($messageBuffer, 'maxMessagePayloadSize');
        $prop->setAccessible(true);
        $this->assertEquals(0, $prop->getValue($messageBuffer));

        $prop = new \ReflectionProperty($messageBuffer, 'maxFramePayloadSize');
        $prop->setAccessible(true);
        $this->assertEquals(0, $prop->getValue($messageBuffer));
    }
}