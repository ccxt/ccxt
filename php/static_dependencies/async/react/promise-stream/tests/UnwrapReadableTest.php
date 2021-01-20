<?php

namespace React\Tests\Promise\Stream;

use Clue\React\Block;
use React\EventLoop\Factory;
use React\Promise;
use React\Promise\Stream;
use React\Promise\Timer;
use React\Stream\ThroughStream;

class UnwrapReadableTest extends TestCase
{
    private $loop;

    public function setUp()
    {
        $this->loop = Factory::create();
    }

    public function testReturnsReadableStreamForPromise()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $this->assertTrue($stream->isReadable());
    }

    public function testClosingStreamMakesItNotReadable()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->on('close', $this->expectCallableOnce());
        $stream->on('end', $this->expectCallableNever());
        $stream->on('error', $this->expectCallableNever());

        $stream->close();

        $this->assertFalse($stream->isReadable());
    }

    public function testClosingRejectingStreamMakesItNotReadable()
    {
        $promise = Timer\reject(0.001, $this->loop);
        $stream = Stream\unwrapReadable($promise);

        $stream->on('close', $this->expectCallableOnce());
        $stream->on('end', $this->expectCallableNever());
        $stream->on('error', $this->expectCallableNever());

        $stream->close();
        $this->loop->run();

        $this->assertFalse($stream->isReadable());
    }

    public function testClosingStreamWillCancelInputPromiseAndMakeStreamNotReadable()
    {
        $promise = new \React\Promise\Promise(function () { }, $this->expectCallableOnce());
        $stream = Stream\unwrapReadable($promise);

        $stream->close();

        $this->assertFalse($stream->isReadable());
    }

    public function testEmitsErrorWhenPromiseRejects()
    {
        $promise = Timer\reject(0.001, $this->loop);

        $stream = Stream\unwrapReadable($promise);

        $this->assertTrue($stream->isReadable());

        $stream->on('error', $this->expectCallableOnce());
        $stream->on('end', $this->expectCallableNever());

        $this->loop->run();

        $this->assertFalse($stream->isReadable());
    }

    public function testEmitsErrorWhenPromiseResolvesWithWrongValue()
    {
        $promise = Timer\resolve(0.001, $this->loop);

        $stream = Stream\unwrapReadable($promise);

        $this->assertTrue($stream->isReadable());

        $stream->on('error', $this->expectCallableOnce());
        $stream->on('end', $this->expectCallableNever());

        $this->loop->run();

        $this->assertFalse($stream->isReadable());
    }

    public function testReturnsClosedStreamIfInputStreamIsClosed()
    {
        $input = new ThroughStream();
        $input->close();

        $promise = Promise\resolve($input);

        $stream = Stream\unwrapReadable($promise);

        $this->assertFalse($stream->isReadable());
    }

    public function testReturnsClosedStreamIfInputHasWrongValue()
    {
        $promise = Promise\resolve(42);

        $stream = Stream\unwrapReadable($promise);

        $this->assertFalse($stream->isReadable());
    }

    public function testReturnsStreamThatWillBeClosedWhenPromiseResolvesWithClosedInputStream()
    {
        $input = new ThroughStream();
        $input->close();

        $promise = Timer\resolve(0.001, $this->loop)->then(function () use ($input) {
            return $input;
        });

        $stream = Stream\unwrapReadable($promise);

        $this->assertTrue($stream->isReadable());

        $stream->on('close', $this->expectCallableOnce());

        $this->loop->run();

        $this->assertFalse($stream->isReadable());
    }

    public function testEmitsDataWhenInputEmitsData()
    {
        $input = new ThroughStream();

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->on('data', $this->expectCallableOnceWith('hello world'));
        $input->emit('data', array('hello world'));
    }

    public function testEmitsErrorAndClosesWhenInputEmitsError()
    {
        $input = new ThroughStream();

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->on('error', $this->expectCallableOnceWith(new \RuntimeException()));
        $stream->on('close', $this->expectCallableOnce());
        $input->emit('error', array(new \RuntimeException()));

        $this->assertFalse($stream->isReadable());
    }

    public function testEmitsEndAndClosesWhenInputEmitsEnd()
    {
        $input = new ThroughStream();

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->on('end', $this->expectCallableOnce());
        $stream->on('close', $this->expectCallableOnce());
        $input->emit('end', array());

        $this->assertFalse($stream->isReadable());
    }

    public function testEmitsCloseOnlyOnceWhenClosingStreamMultipleTimes()
    {
        $promise = new Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->on('end', $this->expectCallableNever());
        $stream->on('close', $this->expectCallableOnce());

        $stream->close();
        $stream->close();
    }

    public function testForwardsPauseToInputStream()
    {
        $input = $this->getMockBuilder('React\Stream\ReadableStreamInterface')->getMock();
        $input->expects($this->once())->method('pause');

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->pause();
    }

    /**
     * @doesNotPerformAssertions
     */
    public function testPauseAfterCloseHasNoEffect()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->close();
        $stream->pause();
    }


    /**
     * @doesNotPerformAssertions
     */
    public function testPauseAfterErrorDueToInvalidInputHasNoEffect()
    {
        $promise = \React\Promise\reject(new \RuntimeException());
        $stream = Stream\unwrapReadable($promise);

        $stream->pause();
    }

    public function testForwardsResumeToInputStream()
    {
        $input = $this->getMockBuilder('React\Stream\ReadableStreamInterface')->getMock();
        $input->expects($this->once())->method('resume');

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->resume();
    }

    /**
     * @doesNotPerformAssertions
     */
    public function testResumeAfterCloseHasNoEffect()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->close();
        $stream->resume();
    }

    public function testPipingStreamWillForwardDataEvents()
    {
        $input = new ThroughStream();

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $output = new ThroughStream();
        $outputPromise = Stream\buffer($output);
        $stream->pipe($output);

        $input->emit('data', array('hello'));
        $input->emit('data', array('world'));
        $input->end();

        $outputPromise->then($this->expectCallableOnceWith('helloworld'));
    }

    public function testClosingStreamWillCloseInputStream()
    {
        $input = $this->getMockBuilder('React\Stream\ReadableStreamInterface')->getMock();
        $input->expects($this->once())->method('isReadable')->willReturn(true);
        $input->expects($this->once())->method('close');

        $promise = Promise\resolve($input);
        $stream = Stream\unwrapReadable($promise);

        $stream->close();
    }

    public function testClosingStreamWillCloseStreamIfItIgnoredCancellationAndResolvesLater()
    {
        $input = new ThroughStream();

        $loop = $this->loop;
        $promise = new Promise\Promise(function ($resolve) use ($loop, $input) {
            $loop->addTimer(0.001, function () use ($resolve, $input) {
                $resolve($input);
            });
        });

        $stream = Stream\unwrapReadable($promise);

        $stream->on('close', $this->expectCallableOnce());

        $stream->close();

        Block\await($promise, $this->loop);

        $this->assertFalse($input->isReadable());
    }

    public function testClosingStreamWillCloseStreamFromCancellationHandler()
    {
        $input = new ThroughStream();

        $promise = new \React\Promise\Promise(function () { }, function ($resolve) use ($input) {
            $resolve($input);
        });

        $stream = Stream\unwrapReadable($promise);

        $stream->on('close', $this->expectCallableOnce());

        $stream->close();

        $this->assertFalse($input->isReadable());
    }

    public function testCloseShouldRemoveAllListenersAfterCloseEvent()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->on('close', $this->expectCallableOnce());
        $this->assertCount(1, $stream->listeners('close'));

        $stream->close();

        $this->assertCount(0, $stream->listeners('close'));
    }

    public function testCloseShouldRemoveReferenceToPromiseToAvoidGarbageReferences()
    {
        $promise = new \React\Promise\Promise(function () { });
        $stream = Stream\unwrapReadable($promise);

        $stream->close();

        $ref = new \ReflectionProperty($stream, 'promise');
        $ref->setAccessible(true);
        $value = $ref->getValue($stream);

        $this->assertNull($value);
    }
}
