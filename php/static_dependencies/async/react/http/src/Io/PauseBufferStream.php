<?php

namespace React\Http\Io;

use Evenement\EventEmitter;
use React\Stream\ReadableStreamInterface;
use React\Stream\Util;
use React\Stream\WritableStreamInterface;

/**
 * [Internal] Pauses a given stream and buffers all events while paused
 *
 * This class is used to buffer all events that happen on a given stream while
 * it is paused. This allows you to pause a stream and no longer watch for any
 * of its events. Once the stream is resumed, all buffered events will be
 * emitted. Explicitly closing the resulting stream clears all buffers.
 *
 * Note that this is an internal class only and nothing you should usually care
 * about.
 *
 * @see ReadableStreamInterface
 * @internal
 */
class PauseBufferStream extends EventEmitter implements ReadableStreamInterface
{
    private $input;
    private $closed = false;
    private $paused = false;
    private $dataPaused = '';
    private $endPaused = false;
    private $closePaused = false;
    private $errorPaused;
    private $implicit = false;

    public function __construct(ReadableStreamInterface $input)
    {
        $this->input = $input;

        $this->input->on('data', array($this, 'handleData'));
        $this->input->on('end', array($this, 'handleEnd'));
        $this->input->on('error', array($this, 'handleError'));
        $this->input->on('close', array($this, 'handleClose'));
    }

    /**
     * pause and remember this was not explicitly from user control
     *
     * @internal
     */
    public function pauseImplicit()
    {
        $this->pause();
        $this->implicit = true;
    }

    /**
     * resume only if this was previously paused implicitly and not explicitly from user control
     *
     * @internal
     */
    public function resumeImplicit()
    {
        if ($this->implicit) {
            $this->resume();
        }
    }

    public function isReadable()
    {
        return !$this->closed;
    }

    public function pause()
    {
        if ($this->closed) {
            return;
        }

        $this->input->pause();
        $this->paused = true;
        $this->implicit = false;
    }

    public function resume()
    {
        if ($this->closed) {
            return;
        }

        $this->paused = false;
        $this->implicit = false;

        if ($this->dataPaused !== '') {
            $this->emit('data', array($this->dataPaused));
            $this->dataPaused = '';
        }

        if ($this->errorPaused) {
            $this->emit('error', array($this->errorPaused));
            return $this->close();
        }

        if ($this->endPaused) {
            $this->endPaused = false;
            $this->emit('end');
            return $this->close();
        }

        if ($this->closePaused) {
            $this->closePaused = false;
            return $this->close();
        }

        $this->input->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        Util::pipe($this, $dest, $options);

        return $dest;
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        $this->closed = true;
        $this->dataPaused = '';
        $this->endPaused = $this->closePaused = false;
        $this->errorPaused = null;

        $this->input->close();

        $this->emit('close');
        $this->removeAllListeners();
    }

    /** @internal */
    public function handleData($data)
    {
        if ($this->paused) {
            $this->dataPaused .= $data;
            return;
        }

        $this->emit('data', array($data));
    }

    /** @internal */
    public function handleError(\Exception $e)
    {
        if ($this->paused) {
            $this->errorPaused = $e;
            return;
        }

        $this->emit('error', array($e));
        $this->close();
    }

    /** @internal */
    public function handleEnd()
    {
        if ($this->paused) {
            $this->endPaused = true;
            return;
        }

        if (!$this->closed) {
            $this->emit('end');
            $this->close();
        }
    }

    /** @internal */
    public function handleClose()
    {
        if ($this->paused) {
            $this->closePaused = true;
            return;
        }

        $this->close();
    }
}
