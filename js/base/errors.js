'use strict';

const errorHierarchy = require ('./errorHierarchy.js')
const { unCamelCase } = require ('./functions')

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass, classes, namespace = {}) {

    for (const [className, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [className]: class extends BaseClass {

                constructor (message, exchangeId = undefined, httpStatusCode = undefined, httpStatusText = undefined, url = undefined, httpMethod = undefined, responseHeaders = undefined, responseBody = undefined, responseJson = undefined) {
                    // don't pass message to super here to make the property work
                    super (message)

                    // A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    // See my blog post for the explanation of this hack:

                    // https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801        */

                    this.constructor = Class
                    this.name = className

                    // make this.message invoked as a property that calls this.toString, and hide this.messageBody
                    Object.defineProperty (this, 'messageBody', {
                        'writable': true,
                        'value': message,
                    })
                    Object.defineProperty (this, 'message', {
                        get () {
                            return this.toString ()
                        },
                        set (value) {
                            this.messageBody = value
                        },
                    })

                    this.exchangeId = exchangeId
                    this.httpStatusCode = httpStatusCode
                    this.httpStatusText = httpStatusText
                    this.url = url
                    this.httpMethod = httpMethod
                    this.responseHeaders = responseHeaders
                    this.responseBody = responseBody
                    this.responseJson = responseJson
                }

                toString () {
                    return [this.messageBody, this.exchangeId, this.httpMethod, this.url, this.httpStatusCode, this.httpStatusText].filter (x => x !== undefined).join (' ')
                }
            }

        })[className]

        subclass (Class, subclasses, namespace)
    }

    return namespace
}

/*  ------------------------------------------------------------------------ */

const Errors = subclass (
    // Root class
    Error,
    // Derived class hierarchy
    errorHierarchy,
)

const BaseError = Errors['BaseError']
const instance = new BaseError ()
for (const property of Object.getOwnPropertyNames (instance)) {
    const underscore = unCamelCase (property)
    if (underscore !== property) {
        Object.defineProperty (BaseError.prototype, underscore, {
            get () {
                return this[property]
            },
            set (value) {
                this[property] = value
            },
            'enumerable': true,
        })
    }
}

module.exports = Errors
