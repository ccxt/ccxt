'use strict';

const errorHierarchy = require ('./errorHierarchy')
const { unCamelCase } = require ('./functions/string')

/*  ------------------------------------------------------------------------ */

function subclass (BaseClass, classes, namespace = {}) {

    for (const [className, subclasses] of Object.entries (classes)) {

        const Class = Object.assign (namespace, {

        /*  By creating a named property, we trick compiler to assign our class constructor function a name.
            Otherwise, all our error constructors would be shown as [Function: Error] in the debugger! And
            the super-useful `e.constructor.name` magic wouldn't work — we then would have no chance to
            obtain a error type string from an error instance programmatically!                               */

            [className]: class extends BaseClass {

                constructor (errorMessage, exchangeId = undefined, httpStatusCode = undefined, httpStatusText = undefined, url = undefined, httpMethod = undefined, responseHeaders = undefined, responseBody = undefined, responseJson = undefined) {

                    let message = [exchangeId, httpMethod, url, httpStatusCode, httpStatusText, errorMessage].filter (x => x !== undefined).join (' ')
                    if (Class.prototype.verbose) {
                        if (responseHeaders) {
                            message += '\n' + JSON.stringify (responseHeaders, undefined, 2)
                        }
                        if (responseJson) {
                            message += '\n' + JSON.stringify (responseJson, undefined, 2)
                        } else if (responseBody) {
                            message += '\n' + responseBody
                        }
                    }
                    super (message)

                    // A workaround to make `instanceof` work on custom Error classes in transpiled ES5.
                    // See my blog post for the explanation of this hack:
                    // https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801
                    this.constructor = Class
                    this.name = className
                    this.__proto__ = Class.prototype

                    this.errorMessage = errorMessage
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
                    return this.message
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
        })
    }
}
BaseError.prototype.verbose = false

module.exports = Errors
