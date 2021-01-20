<?php

namespace React\Dns\Model;

use React\Dns\Query\Query;

/**
 * This class represents an outgoing query message or an incoming response message
 *
 * @link https://tools.ietf.org/html/rfc1035#section-4.1.1
 */
final class Message
{
    const TYPE_A = 1;
    const TYPE_NS = 2;
    const TYPE_CNAME = 5;
    const TYPE_SOA = 6;
    const TYPE_PTR = 12;
    const TYPE_MX = 15;
    const TYPE_TXT = 16;
    const TYPE_AAAA = 28;
    const TYPE_SRV = 33;
    const TYPE_SSHFP = 44;

    /**
     * pseudo-type for EDNS0
     *
     * These are included in the additional section and usually not in answer section.
     * Defined in [RFC 6891](https://tools.ietf.org/html/rfc6891) (or older
     * [RFC 2671](https://tools.ietf.org/html/rfc2671)).
     *
     * The OPT record uses the "class" field to store the maximum size.
     *
     * The OPT record uses the "ttl" field to store additional flags.
     */
    const TYPE_OPT = 41;
    const TYPE_ANY = 255;
    const TYPE_CAA = 257;

    const CLASS_IN = 1;

    const OPCODE_QUERY = 0;
    const OPCODE_IQUERY = 1; // inverse query
    const OPCODE_STATUS = 2;

    const RCODE_OK = 0;
    const RCODE_FORMAT_ERROR = 1;
    const RCODE_SERVER_FAILURE = 2;
    const RCODE_NAME_ERROR = 3;
    const RCODE_NOT_IMPLEMENTED = 4;
    const RCODE_REFUSED = 5;

    /**
     * The edns-tcp-keepalive EDNS0 Option
     *
     * Option value contains a `?float` with timeout in seconds (in 0.1s steps)
     * for DNS response or `null` for DNS query.
     *
     * @link https://tools.ietf.org/html/rfc7828
     */
    const OPT_TCP_KEEPALIVE = 11;

    /**
     * The EDNS(0) Padding Option
     *
     * Option value contains a `string` with binary data (usually variable
     * number of null bytes)
     *
     * @link https://tools.ietf.org/html/rfc7830
     */
    const OPT_PADDING = 12;

    /**
     * Creates a new request message for the given query
     *
     * @param Query $query
     * @return self
     */
    public static function createRequestForQuery(Query $query)
    {
        $request = new Message();
        $request->id = self::generateId();
        $request->rd = true;
        $request->questions[] = $query;

        return $request;
    }

    /**
     * Creates a new response message for the given query with the given answer records
     *
     * @param Query    $query
     * @param Record[] $answers
     * @return self
     */
    public static function createResponseWithAnswersForQuery(Query $query, array $answers)
    {
        $response = new Message();
        $response->id = self::generateId();
        $response->qr = true;
        $response->rd = true;

        $response->questions[] = $query;

        foreach ($answers as $record) {
            $response->answers[] = $record;
        }

        return $response;
    }

    /**
     * generates a random 16 bit message ID
     *
     * This uses a CSPRNG so that an outside attacker that is sending spoofed
     * DNS response messages can not guess the message ID to avoid possible
     * cache poisoning attacks.
     *
     * The `random_int()` function is only available on PHP 7+ or when
     * https://github.com/paragonie/random_compat is installed. As such, using
     * the latest supported PHP version is highly recommended. This currently
     * falls back to a less secure random number generator on older PHP versions
     * in the hope that this system is properly protected against outside
     * attackers, for example by using one of the common local DNS proxy stubs.
     *
     * @return int
     * @see self::getId()
     * @codeCoverageIgnore
     */
    private static function generateId()
    {
        if (function_exists('random_int')) {
            return random_int(0, 0xffff);
        }
        return mt_rand(0, 0xffff);
    }

    /**
     * The 16 bit message ID
     *
     * The response message ID has to match the request message ID. This allows
     * the receiver to verify this is the correct response message. An outside
     * attacker may try to inject fake responses by "guessing" the message ID,
     * so this should use a proper CSPRNG to avoid possible cache poisoning.
     *
     * @var int 16 bit message ID
     * @see self::generateId()
     */
    public $id = 0;

    /**
     * @var bool Query/Response flag, query=false or response=true
     */
    public $qr = false;

    /**
     * @var int specifies the kind of query (4 bit), see self::OPCODE_* constants
     * @see self::OPCODE_QUERY
     */
    public $opcode = self::OPCODE_QUERY;

    /**
     *
     * @var bool Authoritative Answer
     */
    public $aa = false;

    /**
     * @var bool TrunCation
     */
    public $tc = false;

    /**
     * @var bool Recursion Desired
     */
    public $rd = false;

    /**
     * @var bool Recursion Available
     */
    public $ra = false;

    /**
     * @var int response code (4 bit), see self::RCODE_* constants
     * @see self::RCODE_OK
     */
    public $rcode = Message::RCODE_OK;

    /**
     * An array of Query objects
     *
     * ```php
     * $questions = array(
     *     new Query(
     *         'reactphp.org',
     *         Message::TYPE_A,
     *         Message::CLASS_IN
     *     )
     * );
     * ```
     *
     * @var Query[]
     */
    public $questions = array();

    /**
     * @var Record[]
     */
    public $answers = array();

    /**
     * @var Record[]
     */
    public $authority = array();

    /**
     * @var Record[]
     */
    public $additional = array();
}
