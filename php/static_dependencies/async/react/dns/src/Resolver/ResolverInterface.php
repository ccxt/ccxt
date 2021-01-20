<?php

namespace React\Dns\Resolver;

interface ResolverInterface
{
    /**
     * Resolves the given $domain name to a single IPv4 address (type `A` query).
     *
     * ```php
     * $resolver->resolve('reactphp.org')->then(function ($ip) {
     *     echo 'IP for reactphp.org is ' . $ip . PHP_EOL;
     * });
     * ```
     *
     * This is one of the main methods in this package. It sends a DNS query
     * for the given $domain name to your DNS server and returns a single IP
     * address on success.
     *
     * If the DNS server sends a DNS response message that contains more than
     * one IP address for this query, it will randomly pick one of the IP
     * addresses from the response. If you want the full list of IP addresses
     * or want to send a different type of query, you should use the
     * [`resolveAll()`](#resolveall) method instead.
     *
     * If the DNS server sends a DNS response message that indicates an error
     * code, this method will reject with a `RecordNotFoundException`. Its
     * message and code can be used to check for the response code.
     *
     * If the DNS communication fails and the server does not respond with a
     * valid response message, this message will reject with an `Exception`.
     *
     * Pending DNS queries can be cancelled by cancelling its pending promise like so:
     *
     * ```php
     * $promise = $resolver->resolve('reactphp.org');
     *
     * $promise->cancel();
     * ```
     *
     * @param string $domain
     * @return \React\Promise\PromiseInterface<string,\Exception>
     *     resolves with a single IP address on success or rejects with an Exception on error.
     */
    public function resolve($domain);

    /**
     * Resolves all record values for the given $domain name and query $type.
     *
     * ```php
     * $resolver->resolveAll('reactphp.org', Message::TYPE_A)->then(function ($ips) {
     *     echo 'IPv4 addresses for reactphp.org ' . implode(', ', $ips) . PHP_EOL;
     * });
     *
     * $resolver->resolveAll('reactphp.org', Message::TYPE_AAAA)->then(function ($ips) {
     *     echo 'IPv6 addresses for reactphp.org ' . implode(', ', $ips) . PHP_EOL;
     * });
     * ```
     *
     * This is one of the main methods in this package. It sends a DNS query
     * for the given $domain name to your DNS server and returns a list with all
     * record values on success.
     *
     * If the DNS server sends a DNS response message that contains one or more
     * records for this query, it will return a list with all record values
     * from the response. You can use the `Message::TYPE_*` constants to control
     * which type of query will be sent. Note that this method always returns a
     * list of record values, but each record value type depends on the query
     * type. For example, it returns the IPv4 addresses for type `A` queries,
     * the IPv6 addresses for type `AAAA` queries, the hostname for type `NS`,
     * `CNAME` and `PTR` queries and structured data for other queries. See also
     * the `Record` documentation for more details.
     *
     * If the DNS server sends a DNS response message that indicates an error
     * code, this method will reject with a `RecordNotFoundException`. Its
     * message and code can be used to check for the response code.
     *
     * If the DNS communication fails and the server does not respond with a
     * valid response message, this message will reject with an `Exception`.
     *
     * Pending DNS queries can be cancelled by cancelling its pending promise like so:
     *
     * ```php
     * $promise = $resolver->resolveAll('reactphp.org', Message::TYPE_AAAA);
     *
     * $promise->cancel();
     * ```
     *
     * @param string $domain
     * @return \React\Promise\PromiseInterface<array,\Exception>
     *     Resolves with all record values on success or rejects with an Exception on error.
     */
    public function resolveAll($domain, $type);
}
