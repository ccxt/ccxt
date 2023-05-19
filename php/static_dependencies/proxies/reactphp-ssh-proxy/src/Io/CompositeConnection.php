<?php

namespace Clue\React\SshProxy\Io;

use React\Socket\ConnectionInterface;
use React\Stream\ReadableStreamInterface;
use React\Stream\WritableStreamInterface;
use Evenement\EventEmitter;
use React\Stream\Util;

/** @internal */
class CompositeConnection extends EventEmitter implements ConnectionInterface
{
    private $read;
    private $write;
    private $closed = false;

    public function __construct(ReadableStreamInterface $read, WritableStreamInterface $write)
    {
        $this->read = $read;
        $this->write = $write;

        if (!$read->isReadable() || !$write->isWritable()) {
            $this->close();
            return;
        }

        Util::forwardEvents($read, $this, array('data', 'end', 'error'));
        Util::forwardEvents($write, $this, array('error', 'drain'));

        $read->on('close', array($this, 'close'));
        $write->on('close', array($this, 'close'));
    }

    public function write($data)
    {
        return $this->write->write($data);
    }

    public function end($data = null)
    {
        return $this->write->end($data);
    }

    public function isReadable()
    {
        return $this->read->isReadable();
    }

    public function isWritable()
    {
        return $this->write->isWritable();
    }

    public function pause()
    {
        $this->read->pause();
    }

    public function resume()
    {
        $this->read->resume();
    }

    public function pipe(WritableStreamInterface $dest, array $options = array())
    {
        return Util::pipe($this, $dest, $options);
    }

    public function close()
    {
        if ($this->closed) {
            return;
        }

        $this->remote = null;
        $this->closed = true;
        $this->read->close();
        $this->write->close();

        $this->emit('close');
        $this->removeAllListeners();
    }

    public function getLocalAddress()
    {
        return null;
    }

    public function getRemoteAddress()
    {
        return null;
    }
}
