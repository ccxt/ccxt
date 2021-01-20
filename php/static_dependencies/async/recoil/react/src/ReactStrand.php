<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\React;

use React\Promise\Deferred;
use React\Promise\ExtendedPromiseInterface;
use React\Promise\PromisorInterface;
use Recoil\Awaitable;
use Recoil\Kernel\Strand;
use Recoil\Kernel\StrandTrait;
use Recoil\Kernel\SystemStrand;

final class ReactStrand implements SystemStrand, Awaitable, PromisorInterface
{
    /**
     * Capture the result of the strand, supressing the default error handling
     * behaviour.
     *
     * @return ExtendedPromiseInterface A promise that is settled with the strand result.
     */
    public function promise()
    {
        if (!$this->promise) {
            $deferred = new Deferred();
            $this->setPrimaryListener(new DeferredAdaptor($deferred));
            $this->promise = $deferred->promise();
        }

        return $this->promise;
    }

    use StrandTrait;

    /**
     * @var ExtendedPromiseInterface|null
     */
    private $promise;
}
