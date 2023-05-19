<?php

namespace Clue\React\SshProxy\Io;

use React\Stream\ReadableStreamInterface;
use React\Stream\WritableStreamInterface;
use React\Stream\Util;
use Evenement\EventEmitter;

/** @internal */
class LineSeparatedReader extends EventEmitter implements ReadableStreamInterface
{
    private $stream;
    private $buffer = '';
    private $closed = false;

    public function __construct(ReadableStreamInterface $stream)
    {
        $this->stream = $stream;

        if (!$stream->isReadable()) {
            $this->close();
            return;
        }

        $this->stream->on('data', array($this, 'handleData'));
        $this->stream->on('end', array($this, 'handleEnd'));
        $this->stream->on('error', array($this, 'handleError'));
        $this->stream->on('close', array($this, 'close'));
    }

    public function isReadable()
    {
        return $this->stream->isReadable();
    }

    public function pause()
    {
        $this->stream->pause();
    }

    public function resume()
    {
        $this->stream->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return Util::pipe($this, $dest, $options);
    }

    public function handleData($chunk)
    {
        $this->buffer .= $chunk;

        while (($pos = strpos($this->buffer, "\n")) !== false) {
            $chunk = rtrim(substr($this->buffer, 0, $pos), "\r\n");
            $this->buffer = (string)substr($this->buffer, $pos + 1);

            $this->emit('data', array($chunk));
        }
    }

    public function handleEnd()
    {
        if ($this->buffer !== '') {
            $this->handleData("\n");
        }

        if (!$this->closed) {
            $this->emit('end');
            $this->close();
        }
    }

    public function handleError(\Exception $e)
    {
        $this->emit('error', array($e));
        $this->close();
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        $this->closed = true;
        $this->buffer = '';
        $this->stream->close();

        $this->emit('close');
        $this->removeAllListeners();
    }
}
