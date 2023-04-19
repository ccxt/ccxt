'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var zlib = require('zlib');

function inflate(data) {
    return zlib.inflateRawSync(data).toString();
}
function inflate64(data) {
    return inflate(Buffer.from(data, 'base64'));
}
function gunzip(data) {
    return zlib.gunzipSync(data).toString();
}

exports.gunzip = gunzip;
exports.inflate = inflate;
exports.inflate64 = inflate64;
