'use strict';

import { inflateRawSync, gunzipSync } from 'zlib';

function inflate (data) {
    return inflateRawSync (data).toString ()
}

function inflate64 (data) {
    return inflate (Buffer.from (data, 'base64'))
}

function gunzip (data) {
    return gunzipSync (data).toString ()
}

export default {
    inflate,
    inflate64,
    gunzip,
};
