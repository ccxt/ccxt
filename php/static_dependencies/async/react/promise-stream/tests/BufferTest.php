<?php

namespace React\Tests\Promise\Stream;

use Clue\React\Block;
use React\EventLoop\Factory;
use React\Promise\Stream;
use React\Stream\ThroughStream;

class BufferTest extends TestCase
{
    public function testClosedStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $stream->close();

        $promise = Stream\buffer($stream);

        $this->expectPromiseResolveWith('', $promise);
    }

    public function testPendingStreamWillNotResolve()
    {
        $stream = new ThroughStream();

        $promise = Stream\buffer($stream);

        $promise->then($this->expectCallableNever(), $this->expectCallableNever());
    }

    public function testClosingStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $promise = Stream\buffer($stream);

        $stream->close();

        $this->expectPromiseResolveWith('', $promise);
    }

    public function testEmittingDataOnStreamResolvesWithConcatenatedData()
    {
        $stream = new ThroughStream();
        $promise = Stream\buffer($stream);

        $stream->emit('data', array('hello', $stream));
        $stream->emit('data', array('world', $stream));
        $stream->close();

        $this->expectPromiseResolveWith('helloworld', $promise);
    }

    public function testEmittingErrorOnStreamRejects()
    {
        $stream = new ThroughStream();
        $promise = Stream\buffer($stream);

        $stream->emit('error', array(new \RuntimeException('test')));

        $this->expectPromiseReject($promise);
    }

    public function testEmittingErrorAfterEmittingDataOnStreamRejects()
    {
        $stream = new ThroughStream();
        $promise = Stream\buffer($stream);

        $stream->emit('data', array('hello', $stream));
        $stream->emit('error', array(new \RuntimeException('test')));

        $this->expectPromiseReject($promise);
    }

    public function testCancelPendingStreamWillReject()
    {
        $stream = new ThroughStream();

        $promise = Stream\buffer($stream);

        $promise->cancel();

        $this->expectPromiseReject($promise);
    }

    public function testMaximumSize()
    {
        $loop = Factory::create();
        $stream = new ThroughStream();

        $loop->addTimer(0.1, function () use ($stream) {
            $stream->write('12345678910111213141516');
        });

        $promise = Stream\buffer($stream, 16);

        if (method_exists($this, 'expectException')) {
            $this->expectException('OverflowException');
            $this->expectExceptionMessage('Buffer exceeded maximum length');
        } else {
            $this->setExpectedException('\OverflowException', 'Buffer exceeded maximum length');
        }
        Block\await($promise, $loop, 10);
    }

    public function testUnderMaximumSize()
    {
        $loop = Factory::create();
        $stream = new ThroughStream();

        $loop->addTimer(0.1, function () use ($stream) {
            $stream->write('1234567891011');
            $stream->end();
        });

        $promise = Stream\buffer($stream, 16);

        $result = Block\await($promise, $loop, 10);
        $this->assertSame('1234567891011', $result);
    }
}
