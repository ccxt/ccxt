<?php

namespace Clue\React\SshProxy;

use Clue\React\SshProxy\Io\CompositeConnection;
use Clue\React\SshProxy\Io\LineSeparatedReader;
use React\EventLoop\Loop;
use React\EventLoop\LoopInterface;
use React\Promise\Deferred;
use React\Socket\ConnectorInterface;

class SshProcessConnector implements ConnectorInterface
{
    private $cmd;

    /** @var LoopInterface */
    private $loop;

    private $debug = false;

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
        $this->cmd .= 'ssh -vv ';

        // disable interactive password prompt if no password was given (see sshpass above)
        if ($pass === null) {
            $this->cmd .= '-o BatchMode=yes ';
        }

        if (isset($parts['port']) && $parts['port'] !== 22) {
            $this->cmd .= '-p ' . $parts['port'] . ' ';
        }
        $this->cmd .= \escapeshellarg($target);
        $this->loop = $loop ?: Loop::get();
    }

    public function connect($uri)
    {
        // URI must use optional tcp:// scheme, must contain host and port and host must not start with dash
        $parts = \parse_url((\strpos($uri, '://') === false ? 'tcp://' : '') . $uri);
        if (!isset($parts['scheme'], $parts['host'], $parts['port']) || $parts['scheme'] !== 'tcp' || $parts['host'][0] === '-') {
            return \React\Promise\reject(new \InvalidArgumentException('Invalid target URI'));
        }

        $command = $this->cmd . ' -W ' . \escapeshellarg($parts['host'] . ':' . $parts['port']);
        $process = Io\processWithoutFds($command);
        $process->start($this->loop);

        if ($this->debug) {
            echo 'Launched "' . $command . '" with PID ' . $process->getPid() . PHP_EOL; // @codeCoverageIgnore
        }

        $deferred = new Deferred(function () use ($process, $uri) {
            $process->stdin->close();
            $process->terminate();

            throw new \RuntimeException('Connection to ' . $uri . ' cancelled while waiting for SSH client');
        });

        // pause STDOUT and process STDERR one line at a time until connection is ready
        $process->stdout->pause();
        $last = null;
        $connected = false;
        $debug = $this->debug;
        $stderr = new LineSeparatedReader($process->stderr);
        $stderr->on('data', function ($line) use ($deferred, $process, $uri, &$last, $debug, &$connected) {
            // remember last line for error output in case process exits
            $last = $line;

            if ($debug) {
                echo \addcslashes($line, "\0..\032") . PHP_EOL; // @codeCoverageIgnore
            }

            // match everything related to our forwarding channel
            // forwarding error will be printed right to stderr
            // channel 0: open failed: administratively prohibited: open failed
            // forwarding success will only be reported to stderr via debug2 / -vv
            // debug2: channel 0: open confirm rwindow 2097152 rmax 32768
            if (!\preg_match('/^(?:debug\d\: )?channel \d: (.+)$/', $line, $match)) {
                return;
            }

            $line = $match[1];

            if (\strpos($line, 'open failed') !== false) {
                // forwarding failed with given error message
                $deferred->reject(new \RuntimeException(
                    'Connection to ' . $uri . ' rejected: ' . $line
                ));
            } elseif (\strpos($line, 'open confirm') === false) {
                // ignore intermediary debug messages
                return;
            }

            // channel is ready, so resume STDOUT stream and resolve connection
            $process->stdout->resume();
            $connection = new CompositeConnection($process->stdout, $process->stdin);
            $deferred->resolve($connection);
            $connected = true;
        });

        // If STDERR closes before connection was established, explicitly close STDOUT stream.
        // The STDOUT stream starts in a paused state and as such will prevent the process exit
        // logic from triggering when it is not resumed.
        $stderr->on('close', function () use ($process, &$connected) {
            if (!$connected) {
                $process->stdout->close();
            }
        });

        $process->on('exit', function ($code) use ($deferred, $uri, &$last, $debug) {
            if ($debug) {
                echo 'Process exit with code ' . $code . PHP_EOL; // @codeCoverageIgnore
            }
            $deferred->reject(new \RuntimeException(
                'Connection to ' . $uri . ' failed because SSH client died (' . $last . ')',
                $code
            ));
        });

        return $deferred->promise();
    }
}
