'use strict';

/*  ------------------------------------------------------------------------ */

module.exports = subclass (

/*  Root class                  */

    Error,

/*  Derived class hierarchy     */

    {
        'BaseError':{
            'ExchangeError': {
                'AuthenticationError': {
                    'PermissionDenied': {},
                },
                'BadResponse': {
                    'NullResponse': {},
                },
                'InsufficientFunds': {},
                'InvalidAddress': {},
                'InvalidOrder': {
                    'OrderNotFound': {},
                    'OrderNotCached': {},
                    'CancelPending': {},
                },
                'NotSupported': {},
            },
            'NetworkError': {
                'DDoSProtection': {},
                'ExchangeNotAvailable': {},
                'InvalidNonce': {},
                'RequestTimeout': {},
            },
        },
    }
)

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass, classes, namespace = {}) {

    for (const [$class, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [$class]: class extends BaseClass {

                constructor (message) {

                    super (message)

                /*  A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    See my blog post for the explanation of this hack:

                    https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801        */

                    this.constructor = Class
                    this.__proto__   = Class.prototype
                    this.message     = message
                }
            }

        })[$class]

        subclass (Class, subclasses, namespace)
    }

    return namespace
}

/*  ------------------------------------------------------------------------ */
