<?php

namespace React\Socket;

use React\Dns\Resolver\ResolverInterface;
use React\EventLoop\LoopInterface;
use React\Promise;

final class HappyEyeBallsConnector implements ConnectorInterface
{
    private $loop;
    private $connector;
    private $resolver;

    public function __construct(LoopInterface $loop, ConnectorInterface $connector, ResolverInterface $resolver)
    {
        $this->loop = $loop;
        $this->connector = $connector;
        $this->resolver = $resolver;
    }

    public function connect($uri)
    {

        if (\strpos($uri, '://') === false) {
            $parts = \parse_url('tcp://' . $uri);
            unset($parts['scheme']);
        } else {
            $parts = \parse_url($uri);
        }

        if (!$parts || !isset($parts['host'])) {
            return Promise\reject(new \InvalidArgumentException('Given URI "' . $uri . '" is invalid'));
        }

        $host = \trim($parts['host'], '[]');
        
        // skip DNS lookup / URI manipulation if this URI already contains an IP
        if (false !== \filter_var($host, \FILTER_VALIDATE_IP)) {
            return $this->connector->connect($uri);
        }

        $builder = new HappyEyeBallsConnectionBuilder(
            $this->loop,
            $this->connector,
            $this->resolver,
            $uri,
            $host,
            $parts
        );
        return $builder->connect();
    }
}
