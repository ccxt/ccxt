'use strict';

const { inflateRawSync, gunzipSync } = require ('zlib')

function inflate (string) {
    return inflateRawSync (Buffer.from (string, 'base64')).toString ()
}

function gunzip (data) {
    return gunzipSync (data).toString ()
}

module.exports = {
    inflate,
    gunzip,
}
