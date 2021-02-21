'use strict';

const errorHierarchy = require ('./errorHierarchy.js')

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass, classes, namespace = {}) {

    for (const [className, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [className]: class extends BaseClass {

                constructor (message) {

                    super (message)

                /*  A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    See my blog post for the explanation of this hack:

                    https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801        */

                    this.constructor = Class
                    this.__proto__   = Class.prototype
                    this.name        = className
                    this.message     = message

                    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work

                    Object.setPrototypeOf (this, Class.prototype)
                }
            }

        })[className]

        subclass (Class, subclasses, namespace)
    }

    return namespace
}

/*  ------------------------------------------------------------------------ */

module.exports = subclass (
    // Root class
    Error,
    // Derived class hierarchy
    errorHierarchy
)
