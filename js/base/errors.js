'use strict';

const errorHierarchy = require ('./errorHierarchy')
const { unCamelCase } = require ('./functions/string')
const { omit } = require ('./functions/generic')

const properties = ['errorMessage', 'verbose', 'exchangeId', 'httpStatusCode', 'httpStatusText', 'url', 'httpMethod', 'responseHeaders', 'responseBody', 'responseJson']

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass, classes, namespace = {}) {

    for (const [className, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [className]: class extends BaseClass {

                constructor (errorMessage, exchange = undefined, httpStatusCode = undefined, httpStatusText = undefined, url = undefined, httpMethod = undefined, responseHeaders = undefined, responseBody = undefined, responseJson = undefined) {
                    super ()
                    for (const property of properties) {
                        Object.defineProperty (this, property, {
                            enumerable: false,  // hide these properties from stack trace
                            writable: true,
                        })
                    }
                    if (exchange) {
                        this.verbose = exchange.verbose
                        this.exchangeId = exchange.id
                    } else {
                        this.verbose = true
                        this.exchangeId = undefined
                    }

                    // A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    // See my blog post for the explanation of this hack:
                    // https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801
                    this.constructor = Class
                    this.name = className
                    this.__proto__ = Class.prototype

                    this.errorMessage = errorMessage
                    this.httpStatusCode = httpStatusCode
                    this.httpStatusText = httpStatusText
                    this.url = url
                    this.httpMethod = httpMethod
                    this.responseHeaders = responseHeaders
                    this.responseBody = responseBody
                    this.responseJson = responseJson
                }

                toString () {
                    return this.message
                }

                get message () {
                    // delay string concatenation until error is thrown
                    let message = [this.exchangeId, this.httpMethod, this.url, this.httpStatusCode, this.httpStatusText, this.errorMessage].filter (x => x !== undefined).join (' ')
                    if (this.verbose) {
                        if (this.responseHeaders) {
                            message += '\n' + JSON.stringify (this.responseHeaders, undefined, 2)
                        }
                        if (this.responseJson) {
                            message += '\n' + JSON.stringify (this.responseJson, undefined, 2)
                        } else if (this.responseBody) {
                            message += '\n' + this.responseBody
                        }
                    }
                    return message
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
for (const property of properties) {
    const underscore = unCamelCase (property)
    if (underscore !== property) {
        Object.defineProperty (BaseError.prototype, underscore, {
            get () {
                return this[property]
            },
            set (value) {
                this[property] = value
            },
        })
    }
}

module.exports = Errors
