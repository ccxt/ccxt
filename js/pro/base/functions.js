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

module.exports = {
    inflate,
    inflate64,
    gunzip,
}
