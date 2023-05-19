<?php

namespace Clue\React\SshProxy;

use Clue\React\Socks\Client;
use Clue\React\SshProxy\Io\LineSeparatedReader;
use React\ChildProcess\Process;
use React\EventLoop\Loop;
use React\EventLoop\LoopInterface;
use React\Promise\Deferred;
use React\Socket\ConnectorInterface;
use React\Socket\TcpConnector;
use React\Socket\ConnectionInterface;

class SshSocksConnector implements ConnectorInterface
{
    private $cmd;

    /** @var LoopInterface */
    private $loop;

    private $debug = false;

    private $bind = '127.0.0.1:1080';
    private $socks;

    private $listen;
    private $pending = 0;
    private $idlePeriod = 0.001;
    private $idleTimer;

    /**
     *
     * [ssh://][user[:pass]@]host[:port]
     *
     * You're highly recommended to use public keys instead of passing a
     * password here. If you really need to pass a password, please be aware
     * that this will be passed as a command line argument to `sshpass`
     * (which may need to be installed) and this password may leak to the
     * process list if other users have access to your system.
     *
     * This class takes an optional `LoopInterface|null $loop` parameter that can be used to
     * pass the event loop instance to use for this object. You can use a `null` value
     * here in order to use the [default loop](https://github.com/reactphp/event-loop#loop).
     * This value SHOULD NOT be given unless you're sure you want to explicitly use a
     * given event loop instance.
     *
     * @param string $uri
     * @param ?LoopInterface $loop
     * @throws \InvalidArgumentException
     */
    public function __construct(
        #[\SensitiveParameter]
        $uri,
        LoopInterface $loop = null
    ) {
        // URI must use optional ssh:// scheme, must contain host and neither pass nor target must start with dash
        $parts = \parse_url((\strpos($uri, '://') === false ? 'ssh://' : '') . $uri);
        $pass = isset($parts['pass']) ? \rawurldecode($parts['pass']) : null;
        $target = (isset($parts['user']) ? \rawurldecode($parts['user']) . '@' : '') . (isset($parts['host']) ? $parts['host'] : '');
        if (!isset($parts['scheme'], $parts['host']) || $parts['scheme'] !== 'ssh' || (isset($pass[0]) && $pass[0] === '-') || $target[0] === '-') {
            throw new \InvalidArgumentException('Invalid SSH server URI');
        }

        $this->cmd = 'exec ';
        if ($pass !== null) {
            $this->cmd .= 'sshpass -p ' . \escapeshellarg($pass) . ' ';
        }
        $this->cmd .= 'ssh -v -o ExitOnForwardFailure=yes -N ';

        // disable interactive password prompt if no password was given (see sshpass above)
        if ($pass === null) {
            $this->cmd .= '-o BatchMode=yes ';
        }

        if (isset($parts['port']) && $parts['port'] !== 22) {
            $this->cmd .= '-p ' . $parts['port'] . ' ';
        }

        $args = array();
        \parse_str((string) parse_url($uri, \PHP_URL_QUERY), $args);
        if (isset($args['bind'])) {
            $parts = parse_url('tcp://' . $args['bind']);
            if (!isset($parts['scheme'], $parts['host'], $parts['port']) || @\inet_pton(\trim($parts['host'], '[]')) === false) {
                throw new \InvalidArgumentException('Invalid bind address given');
            }
            $this->bind = $args['bind'];
        }

        $this->loop = $loop ?: Loop::get();
        $this->socks = new Client('socks4://' . $this->bind, new TcpConnector($this->loop));
        $this->cmd .= '-D ' . \escapeshellarg($this->bind) . ' ' . \escapeshellarg($target);
    }

    public function connect($uri)
    {
        // URI must use optional tcp:// scheme, must contain host and port
        $parts = \parse_url((\strpos($uri, '://') === false ? 'tcp://' : '') . $uri);
        if (!isset($parts['scheme'], $parts['host'], $parts['port']) || $parts['scheme'] !== 'tcp') {
            return \React\Promise\reject(new \InvalidArgumentException('Invalid target URI'));
        }

        // no listening SSH client process started? start one and remember reference
        // if spawning SSH client process fails, clear reference for next start
        if ($this->listen === null) {
            $listen =& $this->listen;
            $this->listen = $this->listen()->then(null, function ($e) use (&$listen) {
                $listen = null;
                throw $e;
            });

            // @codeCoverageIgnoreStart
            if ($this->debug) {
                echo 'Starting to listen' . PHP_EOL;
                $this->listen->then(function () {
                    echo 'Listening' . PHP_EOL;
                }, function () {
                    echo 'Failed listening' . PHP_EOL;
                });
            }
            // @codeCoverageIgnoreEnd
        }

        // keep track of pending connection attempts to close process on idle again
        $this->awake();
        $that = $this;
        $socks = $this->socks;

        $connecting = null;
        $cancelled = false;
        $deferred = new Deferred(function () use ($uri, $that, &$connecting, &$cancelled) {
            // cancel pending SOCKS connection attempt if SSH client process is ready
            if ($connecting !== null) {
                $connecting->cancel();
                $connecting = null;
                return;
            }

            // otherwise just reject and keep starting SSH client process until idle timeout
            $cancelled = true;
            $that->idle();
            throw new \RuntimeException('Connection to ' . $uri . ' cancelled while waiting for SSH client');
        });

        $this->listen->then(function () use ($uri, $that, $socks, $deferred, &$connecting) {
            // SSH client process started => start SOCKS connection
            $connecting = $socks->connect($uri)->then(function (ConnectionInterface $connection) use ($that, $deferred) {
                // connection to SOCKS server successful => consider idle when connection closes again
                $connection->on('close', function () use ($that) {
                    $that->idle();
                });
                $deferred->resolve($connection);
            }, function (\Exception $e) use ($that, $deferred) {
                // connection to SOCKS server failed => reject
                $that->idle();

                $deferred->reject($e);
            });
        }, function (\Exception $e) use ($that, $uri, $deferred, &$cancelled) {
            // creating SOCKS proxy failed => reject (unless connection attempt has already been cancelled)
            if ($cancelled) {
                return;
            }

            $that->idle();

            $deferred->reject(new \RuntimeException(
                'Connection to ' . $uri . ' failed because SSH client process died (' . $e->getMessage() . ')'
            ));
        });

        return $deferred->promise();
    }

    /** @internal */
    public function awake()
    {
        ++$this->pending;

        if ($this->idleTimer !== null) {
            $this->loop->cancelTimer($this->idleTimer);
            $this->idleTimer = null;
        }
    }

    /** @internal */
    public function idle()
    {
        --$this->pending;

        if ($this->pending < 1 && $this->idleTimer === null && $this->listen !== null) {
            $listen =& $this->listen;
            $debug = $this->debug;
            $this->idleTimer = $this->loop->addTimer($this->idlePeriod, function () use (&$listen, $debug) {
                $listen->then(function (Process $process) {
                    $process->terminate();
                });
                $listen->cancel();
                $listen = null;

                if ($debug) {
                    echo 'Stopped listening' . PHP_EOL; // @codeCoverageIgnore
                }
            });
        }
    }

    private function listen()
    {
        $process = Io\processWithoutFds($this->cmd);
        $process->start($this->loop);

        $deferred = new Deferred(function () use ($process) {
            $process->stdin->close();
            $process->terminate();
        });

        // process STDERR one line at a time
        $last = 'n/a';
        $debug = $this->debug;
        $stderr = new LineSeparatedReader($process->stderr);
        $stderr->on('data', function ($line) use ($deferred, $process, &$last, $debug) {
            // remember last line for error output in case process exits
            // forwarding error will be printed right to stderr and then exit (see below)
            // bind: Address already in use
            // Could not request local forwarding.
            $last = $line;

            if ($debug) {
                echo \addcslashes($line, "\0..\032") . PHP_EOL; // @codeCoverageIgnore
            }

            // match everything related to our forwarding channel
            // forwarding success will only be reported to stderr via debug1 / -v
            // debug1: channel 0: new [port listener]
            if (\preg_match('/^(?:debug\d\: )channel \d: new \[port listener\]$/', $line)) {
                $deferred->resolve($process);
            }
        });

        $process->on('exit', function ($code) use ($deferred, &$last) {
            $deferred->reject(new \RuntimeException(
                $last,
                $code
            ));
        });

        return $deferred->promise();
    }
}
