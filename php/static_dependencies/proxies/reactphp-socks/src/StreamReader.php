<?php

namespace Clue\React\Socks;

use React\Promise\Deferred;
use \InvalidArgumentException;
use \UnexpectedValueException;

/**
 * @internal
 */
final class StreamReader
{
    const RET_DONE = true;
    const RET_INCOMPLETE = null;

    private $buffer = '';
    private $queue = array();

    public function write($data)
    {
        $this->buffer .= $data;

        do {
            $current = reset($this->queue);

            if ($current === false) {
                break;
            }

            /* @var $current Closure */

            $ret = $current($this->buffer);

            if ($ret === self::RET_INCOMPLETE) {
                // current is incomplete, so wait for further data to arrive
                break;
            } else {
                // current is done, remove from list and continue with next
                array_shift($this->queue);
            }
        } while (true);
    }

    public function readBinary($structure)
    {
        $length = 0;
        $unpack = '';
        foreach ($structure as $name=>$format) {
            if ($length !== 0) {
                $unpack .= '/';
            }
            $unpack .= $format . $name;

            if ($format === 'C') {
                ++$length;
            } else if ($format === 'n') {
                $length += 2;
            } else if ($format === 'N') {
                $length += 4;
            } else {
                throw new InvalidArgumentException('Invalid format given');
            }
        }

        return $this->readLength($length)->then(function ($response) use ($unpack) {
            return unpack($unpack, $response);
        });
    }

    public function readLength($bytes)
    {
        $deferred = new Deferred();

        $this->readBufferCallback(function (&$buffer) use ($bytes, $deferred) {
            if (strlen($buffer) >= $bytes) {
                $deferred->resolve((string)substr($buffer, 0, $bytes));
                $buffer = (string)substr($buffer, $bytes);

                return StreamReader::RET_DONE;
            }
        });

        return $deferred->promise();
    }

    public function readByte()
    {
        return $this->readBinary(array(
            'byte' => 'C'
        ))->then(function ($data) {
            return $data['byte'];
        });
    }

    public function readByteAssert($expect)
    {
        return $this->readByte()->then(function ($byte) use ($expect) {
            if ($byte !== $expect) {
                throw new UnexpectedValueException('Unexpected byte encountered');
            }
            return $byte;
        });
    }

    public function readStringNull()
    {
        $deferred = new Deferred();
        $string = '';

        $that = $this;
        $readOne = function () use (&$readOne, $that, $deferred, &$string) {
            $that->readByte()->then(function ($byte) use ($deferred, &$string, $readOne) {
                if ($byte === 0x00) {
                    $deferred->resolve($string);
                } else {
                    $string .= chr($byte);
                    $readOne();
                }
            });
        };
        $readOne();

        return $deferred->promise();
    }

    public function readBufferCallback(/* callable */ $callable)
    {
        if (!is_callable($callable)) {
            throw new InvalidArgumentException('Given function must be callable');
        }

        if ($this->queue) {
            $this->queue []= $callable;
        } else {
            $this->queue = array($callable);

            if ($this->buffer !== '') {
                // this is the first element in the queue and the buffer is filled => trigger write procedure
                $this->write('');
            }
        }
    }

    public function getBuffer()
    {
        return $this->buffer;
    }
}
