<?php

namespace ccxt\pro;

function inflate($data) {
    return zlib_decode($data);
}

function inflate64($data) {
    return inflate(base64_decode($data));
}

function gunzip($data) {
    return gzdecode($data);
}
