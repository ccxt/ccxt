<?php

namespace React\Tests\Promise\Stream;

use React\Promise\Stream;
use React\Stream\ThroughStream;

class AllTest extends TestCase
{
    public function testClosedStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $stream->close();

        $promise = Stream\all($stream);

        $this->expectPromiseResolveWith(array(), $promise);
    }

    public function testClosedWritableStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $stream->close();

        $promise = Stream\all($stream);

        $this->expectPromiseResolveWith(array(), $promise);
    }

    public function testPendingStreamWillNotResolve()
    {
        $stream = new ThroughStream();

        $promise = Stream\all($stream);

        $promise->then($this->expectCallableNever(), $this->expectCallableNever());
    }

    public function testClosingStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream);

        $stream->close();

        $this->expectPromiseResolveWith(array(), $promise);
    }

    public function testClosingWritableStreamResolvesWithEmptyBuffer()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream);

        $stream->close();

        $this->expectPromiseResolveWith(array(), $promise);
    }

    public function testEmittingDataOnStreamResolvesWithArrayOfData()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream);

        $stream->emit('data', array('hello', $stream));
        $stream->emit('data', array('world', $stream));
        $stream->close();

        $this->expectPromiseResolveWith(array('hello', 'world'), $promise);
    }

    public function testEmittingCustomEventOnStreamResolvesWithArrayOfCustomEventData()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream, 'a');

        $stream->emit('a', array('hello'));
        $stream->emit('b', array('ignored'));
        $stream->emit('a');
        $stream->close();

        $this->expectPromiseResolveWith(array('hello', null), $promise);
    }

    public function testEmittingErrorOnStreamRejects()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream);

        $stream->emit('error', array(new \RuntimeException('test')));

        $this->expectPromiseReject($promise);
    }

    public function testEmittingErrorAfterEmittingDataOnStreamRejects()
    {
        $stream = new ThroughStream();
        $promise = Stream\all($stream);

        $stream->emit('data', array('hello', $stream));
        $stream->emit('error', array(new \RuntimeException('test')));

        $this->expectPromiseReject($promise);
    }

    public function testCancelPendingStreamWillReject()
    {
        $stream = new ThroughStream();

        $promise = Stream\all($stream);

        $promise->cancel();

        $this->expectPromiseReject($promise);
    }
}
