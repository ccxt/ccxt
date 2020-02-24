import { errorHierarchy } from './errorHierarchy.js';

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass: typeof Error, classes: object, namespace = {}) {

    for (const [className, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [className]: class extends BaseClass {

                __proto__: Error;

                constructor (message: string) {

                    super (message)

                /*  A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    See my blog post for the explanation of this hack:

                    https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801        */

                    this.constructor = Class
                    this.__proto__   = Class.prototype
                    this.name        = className
                    this.message     = message
                }
            }

        })[className]

        subclass (Class as any, subclasses, namespace)
    }

    return namespace
}

/*  ------------------------------------------------------------------------ */

exports = subclass (
    // Root class
    Error,
    // Derived class hierarchy
    errorHierarchy
)

export class BaseError extends Error {

    name: string;

    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}
export class ExchangeError extends BaseError {}
export class AuthenticationError extends ExchangeError {}
export class PermissionDenied extends AuthenticationError {}
export class AccountSuspended extends AuthenticationError {}
export class ArgumentsRequired extends ExchangeError {}
export class BadRequest extends ExchangeError {}
export class BadSymbol extends BadRequest {}
export class BadResponse extends ExchangeError {}
export class NullResponse extends BadResponse {}
export class InsufficientFunds extends ExchangeError {}
export class InvalidAddress extends ExchangeError {}
export class AddressPending extends InvalidAddress {}
export class InvalidOrder extends ExchangeError {}
export class OrderNotFound extends InvalidOrder {}
export class OrderNotCached extends InvalidOrder {}
export class CancelPending extends InvalidOrder {}
export class OrderImmediatelyFillable extends InvalidOrder {}
export class OrderNotFillable extends InvalidOrder {}
export class DuplicateOrderId extends InvalidOrder {}
export class NotSupported extends ExchangeError {}
export class NetworkError extends BaseError {}
export class DDoSProtection extends NetworkError {}
export class RateLimitExceeded extends DDoSProtection {}
export class ExchangeNotAvailable extends NetworkError {}
export class OnMaintenance extends ExchangeNotAvailable {}
export class InvalidNonce extends NetworkError {}
export class RequestTimeout extends NetworkError {}
