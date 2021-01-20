<?php

namespace React\Http\Io;

use Evenement\EventEmitter;
use Psr\Http\Message\StreamInterface;
use React\Stream\ReadableStreamInterface;
use React\Stream\Util;
use React\Stream\WritableStreamInterface;

/**
 * @internal
 */
class ReadableBodyStream extends EventEmitter implements ReadableStreamInterface, StreamInterface
{
    private $input;
    private $position = 0;
    private $size;
    private $closed = false;

    public function __construct(ReadableStreamInterface $input, $size = null)
    {
        $this->input = $input;
        $this->size = $size;

        $that = $this;
        $pos =& $this->position;
        $input->on('data', function ($data) use ($that, &$pos, $size) {
            $that->emit('data', array($data));

            $pos += \strlen($data);
            if ($size !== null && $pos >= $size) {
                $that->handleEnd();
            }
        });
        $input->on('error', function ($error) use ($that) {
            $that->emit('error', array($error));
            $that->close();
        });
        $input->on('end', array($that, 'handleEnd'));
        $input->on('close', array($that, 'close'));
    }

    public function close()
    {
        if (!$this->closed) {
            $this->closed = true;
            $this->input->close();

            $this->emit('close');
            $this->removeAllListeners();
        }
    }

    public function isReadable()
    {
        return $this->input->isReadable();
    }

    public function pause()
    {
        $this->input->pause();
    }

    public function resume()
    {
        $this->input->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        Util::pipe($this, $dest, $options);

        return $dest;
    }

    public function eof()
    {
        return !$this->isReadable();
    }

    public function __toString()
    {
        return '';
    }

    public function detach()
    {
        throw new \BadMethodCallException();
    }

    public function getSize()
    {
        return $this->size;
    }

    public function tell()
    {
        throw new \BadMethodCallException();
    }

    public function isSeekable()
    {
        return false;
    }

    public function seek($offset, $whence = SEEK_SET)
    {
        throw new \BadMethodCallException();
    }

    public function rewind()
    {
        throw new \BadMethodCallException();
    }

    public function isWritable()
    {
        return false;
    }

    public function write($string)
    {
        throw new \BadMethodCallException();
    }

    public function read($length)
    {
        throw new \BadMethodCallException();
    }

    public function getContents()
    {
        throw new \BadMethodCallException();
    }

    public function getMetadata($key = null)
    {
        return ($key === null) ? array() : null;
    }

    /** @internal */
    public function handleEnd()
    {
        if ($this->position !== $this->size && $this->size !== null) {
            $this->emit('error', array(new \UnderflowException('Unexpected end of response body after ' . $this->position . '/' . $this->size . ' bytes')));
        } else {
            $this->emit('end');
        }

        $this->close();
    }
}
