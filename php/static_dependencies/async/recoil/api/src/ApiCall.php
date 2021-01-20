<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

/**
 * Holds information about a call to a kernel API operation.
 */
final class ApiCall
{
    /**
     * @var string The operation name.
     *
     * This is the name of the operation invoked as a static method on the
     * {@see Recoil} class.
     */
    public $__name;

    /**
     * @var array The arguments to the operation.
     */
    public $__arguments;

    /**
     * @param string    $name      The operation name.
     * @param mixed,... $arguments The operation arguments.
     */
    public function __construct(string $name, ...$arguments)
    {
        $this->__name = $name;
        $this->__arguments = $arguments;
    }
}
