<?php

namespace Clue\React\SshProxy\Io;

use React\ChildProcess\Process;

/**
 * Returns a list of active file descriptors (may contain bogus entries)
 *
 * @param string $path
 * @return int[]
 * @internal
 */
function fds($path = '/dev/fd')
{
    // Try to get list of all open FDs (Linux/Mac and others)
    $fds = @\scandir($path);

    // Otherwise try temporarily duplicating file descriptors in the range 0-1024 (FD_SETSIZE).
    // This is known to work on more exotic platforms and also inside chroot
    // environments without /dev/fd. Causes many syscalls, but still rather fast.
    if ($fds === false) {
        $fds = array();
        for ($i = 0; $i <= 1024; ++$i) {
            $copy = @\fopen('php://fd/' . $i, 'r');
            if ($copy !== false) {
                $fds[] = $i;
                \fclose($copy);
            }
        }
    } else {
        foreach ($fds as $i => $fd) {
            $fds[$i] = (int) $fd;
        }
    }

    return $fds;
}

/**
 * Creates a Process with the given command modified in such a way that any additional FDs are explicitly not passed along
 *
 * @param string $command
 * @return Process
 * @internal
 */
function processWithoutFds($command)
{
    // launch process with default STDIO pipes
    $pipes = array(
        array('pipe', 'r'),
        array('pipe', 'w'),
        array('pipe', 'w')
    );

    // try to get list of all open FDs
    $fds = fds();

    // do not inherit open FDs by explicitly overwriting existing FDs with dummy files
    // additionally, close all dummy files in the child process again
    foreach ($fds as $fd) {
        if ($fd > 2) {
            $pipes[$fd] = array('file', '/dev/null', 'r');
            $command .= ' ' . $fd . '>&-';
        }
    }

    // default `sh` only accepts single-digit FDs, so run in bash if needed
    if ($fds && max($fds) > 9) {
        $command = 'exec bash -c ' . escapeshellarg($command);
    }

    return new Process($command, null, null, $pipes);
}
