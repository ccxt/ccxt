<?php

namespace React\Stream;

/**
 * The `DuplexStreamInterface` is responsible for providing an interface for
 * duplex streams (both readable and writable).
 *
 * It builds on top of the existing interfaces for readable and writable streams
 * and follows the exact same method and event semantics.
 * If you're new to this concept, you should look into the
 * `ReadableStreamInterface` and `WritableStreamInterface` first.
 *
 * Besides defining a few methods, this interface also implements the
 * `EventEmitterInterface` which allows you to react to the same events defined
 * on the `ReadbleStreamInterface` and `WritableStreamInterface`.
 *
 * The event callback functions MUST be a valid `callable` that obeys strict
 * parameter definitions and MUST accept event parameters exactly as documented.
 * The event callback functions MUST NOT throw an `Exception`.
 * The return value of the event callback functions will be ignored and has no
 * effect, so for performance reasons you're recommended to not return any
 * excessive data structures.
 *
 * Every implementation of this interface MUST follow these event semantics in
 * order to be considered a well-behaving stream.
 *
 * > Note that higher-level implementations of this interface may choose to
 *   define additional events with dedicated semantics not defined as part of
 *   this low-level stream specification. Conformance with these event semantics
 *   is out of scope for this interface, so you may also have to refer to the
 *   documentation of such a higher-level implementation.
 *
 * @see ReadableStreamInterface
 * @see WritableStreamInterface
 */
interface DuplexStreamInterface extends ReadableStreamInterface, WritableStreamInterface
{
}
