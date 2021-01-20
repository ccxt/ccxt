<?php

namespace React\Dns\Config;

use RuntimeException;

/**
 * Represents a static hosts file which maps hostnames to IPs
 *
 * Hosts files are used on most systems to avoid actually hitting the DNS for
 * certain common hostnames.
 *
 * Most notably, this file usually contains an entry to map "localhost" to the
 * local IP. Windows is a notable exception here, as Windows does not actually
 * include "localhost" in this file by default. To compensate for this, this
 * class may explicitly be wrapped in another HostsFile instance which
 * hard-codes these entries for Windows (see also Factory).
 *
 * This class mostly exists to abstract the parsing/extraction process so this
 * can be replaced with a faster alternative in the future.
 */
class HostsFile
{
    /**
     * Returns the default path for the hosts file on this system
     *
     * @return string
     * @codeCoverageIgnore
     */
    public static function getDefaultPath()
    {
        // use static path for all Unix-based systems
        if (DIRECTORY_SEPARATOR !== '\\') {
            return '/etc/hosts';
        }

        // Windows actually stores the path in the registry under
        // \HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\DataBasePath
        $path = '%SystemRoot%\\system32\drivers\etc\hosts';

        $base = getenv('SystemRoot');
        if ($base === false) {
            $base = 'C:\\Windows';
        }

        return str_replace('%SystemRoot%', $base, $path);
    }

    /**
     * Loads a hosts file (from the given path or default location)
     *
     * Note that this method blocks while loading the given path and should
     * thus be used with care! While this should be relatively fast for normal
     * hosts file, this may be an issue if this file is located on a slow device
     * or contains an excessive number of entries. In particular, this method
     * should only be executed before the loop starts, not while it is running.
     *
     * @param ?string $path (optional) path to hosts file or null=load default location
     * @return self
     * @throws RuntimeException if the path can not be loaded (does not exist)
     */
    public static function loadFromPathBlocking($path = null)
    {
        if ($path === null) {
            $path = self::getDefaultPath();
        }

        $contents = @file_get_contents($path);
        if ($contents === false) {
            throw new RuntimeException('Unable to load hosts file "' . $path . '"');
        }

        return new self($contents);
    }

    private $contents;

    /**
     * Instantiate new hosts file with the given hosts file contents
     *
     * @param string $contents
     */
    public function __construct($contents)
    {
        // remove all comments from the contents
        $contents = preg_replace('/[ \t]*#.*/', '', strtolower($contents));

        $this->contents = $contents;
    }

    /**
     * Returns all IPs for the given hostname
     *
     * @param string $name
     * @return string[]
     */
    public function getIpsForHost($name)
    {
        $name = strtolower($name);

        $ips = array();
        foreach (preg_split('/\r?\n/', $this->contents) as $line) {
            $parts = preg_split('/\s+/', $line);
            $ip = array_shift($parts);
            if ($parts && array_search($name, $parts) !== false) {
                // remove IPv6 zone ID (`fe80::1%lo0` => `fe80:1`)
                if (strpos($ip, ':') !== false && ($pos = strpos($ip, '%')) !== false) {
                    $ip = substr($ip, 0, $pos);
                }

                if (@inet_pton($ip) !== false) {
                    $ips[] = $ip;
                }
            }
        }

        return $ips;
    }

    /**
     * Returns all hostnames for the given IPv4 or IPv6 address
     *
     * @param string $ip
     * @return string[]
     */
    public function getHostsForIp($ip)
    {
        // check binary representation of IP to avoid string case and short notation
        $ip = @inet_pton($ip);
        if ($ip === false) {
            return array();
        }

        $names = array();
        foreach (preg_split('/\r?\n/', $this->contents) as $line) {
            $parts = preg_split('/\s+/', $line, null, PREG_SPLIT_NO_EMPTY);
            $addr = array_shift($parts);

            // remove IPv6 zone ID (`fe80::1%lo0` => `fe80:1`)
            if (strpos($addr, ':') !== false && ($pos = strpos($addr, '%')) !== false) {
                $addr = substr($addr, 0, $pos);
            }

            if (@inet_pton($addr) === $ip) {
                foreach ($parts as $part) {
                    $names[] = $part;
                }
            }
        }

        return $names;
    }
}
