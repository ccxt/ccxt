<?php

namespace React\Stream;

use Evenement\EventEmitter;

final class CompositeStream extends EventEmitter implements DuplexStreamInterface
{
    private $readable;
    private $writable;
    private $closed = false;

    public function __construct(ReadableStreamInterface $readable, WritableStreamInterface $writable)
    {
        $this->readable = $readable;
        $this->writable = $writable;

        if (!$readable->isReadable() || !$writable->isWritable()) {
            $this->close();
            return;
        }

        Util::forwardEvents($this->readable, $this, array('data', 'end', 'error'));
        Util::forwardEvents($this->writable, $this, array('drain', 'error', 'pipe'));

        $this->readable->on('close', array($this, 'close'));
        $this->writable->on('close', array($this, 'close'));
    }

    public function isReadable()
    {
        return $this->readable->isReadable();
    }

    public function pause()
    {
        $this->readable->pause();
    }

    public function resume()
    {
        if (!$this->writable->isWritable()) {
            return;
        }

        $this->readable->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return Util::pipe($this, $dest, $options);
    }

    public function isWritable()
    {
        return $this->writable->isWritable();
    }

    public function write($data)
    {
        return $this->writable->write($data);
    }

    public function end($data = null)
    {
        $this->readable->pause();
        $this->writable->end($data);
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        $this->closed = true;
        $this->readable->close();
        $this->writable->close();

        $this->emit('close');
        $this->removeAllListeners();
    }
}
