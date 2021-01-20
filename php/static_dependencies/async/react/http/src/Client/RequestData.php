<?php

namespace React\Http\Client;

/**
 * @internal
 */
class RequestData
{
    private $method;
    private $url;
    private $headers;
    private $protocolVersion;

    public function __construct($method, $url, array $headers = array(), $protocolVersion = '1.0')
    {
        $this->method = $method;
        $this->url = $url;
        $this->headers = $headers;
        $this->protocolVersion = $protocolVersion;
    }

    private function mergeDefaultheaders(array $headers)
    {
        $port = ($this->getDefaultPort() === $this->getPort()) ? '' : ":{$this->getPort()}";
        $connectionHeaders = ('1.1' === $this->protocolVersion) ? array('Connection' => 'close') : array();
        $authHeaders = $this->getAuthHeaders();

        $defaults = array_merge(
            array(
                'Host'          => $this->getHost().$port,
                'User-Agent'    => 'ReactPHP/1',
            ),
            $connectionHeaders,
            $authHeaders
        );

        // remove all defaults that already exist in $headers
        $lower = array_change_key_case($headers, CASE_LOWER);
        foreach ($defaults as $key => $_) {
            if (isset($lower[strtolower($key)])) {
                unset($defaults[$key]);
            }
        }

        return array_merge($defaults, $headers);
    }

    public function getScheme()
    {
        return parse_url($this->url, PHP_URL_SCHEME);
    }

    public function getHost()
    {
        return parse_url($this->url, PHP_URL_HOST);
    }

    public function getPort()
    {
        return (int) parse_url($this->url, PHP_URL_PORT) ?: $this->getDefaultPort();
    }

    public function getDefaultPort()
    {
        return ('https' === $this->getScheme()) ? 443 : 80;
    }

    public function getPath()
    {
        $path = parse_url($this->url, PHP_URL_PATH);
        $queryString = parse_url($this->url, PHP_URL_QUERY);

        // assume "/" path by default, but allow "OPTIONS *"
        if ($path === null) {
            $path = ($this->method === 'OPTIONS' && $queryString === null) ? '*': '/';
        }
        if ($queryString !== null) {
            $path .= '?' . $queryString;
        }

        return $path;
    }

    public function setProtocolVersion($version)
    {
        $this->protocolVersion = $version;
    }

    public function __toString()
    {
        $headers = $this->mergeDefaultheaders($this->headers);

        $data = '';
        $data .= "{$this->method} {$this->getPath()} HTTP/{$this->protocolVersion}\r\n";
        foreach ($headers as $name => $values) {
            foreach ((array)$values as $value) {
                $data .= "$name: $value\r\n";
            }
        }
        $data .= "\r\n";

        return $data;
    }

    private function getUrlUserPass()
    {
        $components = parse_url($this->url);

        if (isset($components['user'])) {
            return array(
                'user' => $components['user'],
                'pass' => isset($components['pass']) ? $components['pass'] : null,
            );
        }
    }

    private function getAuthHeaders()
    {
        if (null !== $auth = $this->getUrlUserPass()) {
            return array(
                'Authorization' => 'Basic ' . base64_encode($auth['user'].':'.$auth['pass']),
            );
        }

        return array();
    }
}
