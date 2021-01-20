<?php

namespace React\Dns\Query;

interface ExecutorInterface
{
    /**
     * Executes a query and will return a response message
     *
     * It returns a Promise which either fulfills with a response
     * `React\Dns\Model\Message` on success or rejects with an `Exception` if
     * the query is not successful. A response message may indicate an error
     * condition in its `rcode`, but this is considered a valid response message.
     *
     * ```php
     * $executor->query($query)->then(
     *     function (React\Dns\Model\Message $response) {
     *         // response message successfully received
     *         var_dump($response->rcode, $response->answers);
     *     },
     *     function (Exception $error) {
     *         // failed to query due to $error
     *     }
     * );
     * ```
     *
     * The returned Promise MUST be implemented in such a way that it can be
     * cancelled when it is still pending. Cancelling a pending promise MUST
     * reject its value with an Exception. It SHOULD clean up any underlying
     * resources and references as applicable.
     *
     * ```php
     * $promise = $executor->query($query);
     *
     * $promise->cancel();
     * ```
     *
     * @param Query $query
     * @return \React\Promise\PromiseInterface<\React\Dns\Model\Message,\Exception>
     *     resolves with response message on success or rejects with an Exception on error
     */
    public function query(Query $query);
}
