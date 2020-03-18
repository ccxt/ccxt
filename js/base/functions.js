'use strict';

const { inflateRawSync, gunzipSync } = require ('zlib')

function inflate (data) {
    return inflateRawSync (data).toString ()
}

function inflate64 (data) {
    return inflate (Buffer.from (data, 'base64'))
}

function gunzip (data) {
    return gunzipSync (data).toString ()
}

function isBuffer (obj) {
    // handle binary encoded messages without needing the buffer module
    // this is useful for browser implementations
    return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer (obj)
}

module.exports = {
    inflate,
    inflate64,
    gunzip,
    isBuffer,
}
