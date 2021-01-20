<?php

namespace React\Dns\Query;

/**
 * This class represents a single question in a query/response message
 *
 * It uses a structure similar to `\React\Dns\Message\Record`, but does not
 * contain fields for resulting TTL and resulting record data (IPs etc.).
 *
 * @link https://tools.ietf.org/html/rfc1035#section-4.1.2
 * @see \React\Dns\Message\Record
 */
final class Query
{
    /**
     * @var string query name, i.e. hostname to look up
     */
    public $name;

    /**
     * @var int query type (aka QTYPE), see Message::TYPE_* constants
     */
    public $type;

    /**
     * @var int query class (aka QCLASS), see Message::CLASS_IN constant
     */
    public $class;

    /**
     * @param string $name  query name, i.e. hostname to look up
     * @param int    $type  query type, see Message::TYPE_* constants
     * @param int    $class query class, see Message::CLASS_IN constant
     */
    public function __construct($name, $type, $class)
    {
        $this->name = $name;
        $this->type = $type;
        $this->class = $class;
    }
}
