"use strict";

const fs = require ('fs')

module.exports = (logFileName, object, methodNames) => {

    for (const name of Object.getOwnPropertyNames (object.constructor.prototype)) {

        if (methodNames.includes (name)) {

            const impl = object[name].bind (object)

            // generates a wrapper around CCXT method
            object[name] = async (...args) => {

                const start = new Date ()

                let response = undefined
                let exception = undefined
                let error = undefined

                try {

                    response = await impl (...args)

                } catch (e) {

                    error = e
                    exception = {
                        type: e.constructor.prototype,
                        message: e.message
                    }
                }

                const end = new Date ()
                const log = {
                    start,
                    startDatetime: start.toISOString (),
                    end,
                    endDatetime: end.toISOString (),
                    id: object.id,
                    method: name,
                    args,
                    response,
                    exception,
                }

                const fileName = (typeof logFileName === 'string') ? logFileName : logFileName ()
                const line = JSON.stringify (log) + '\n'

                fs.appendFileSync (fileName, line)

                if (response)
                    return response

                throw error
            }
        }
    }
}
