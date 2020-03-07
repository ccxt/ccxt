<?php

namespace ccxtpro;

function inflate($string) {
    return zlib_decode(base64_decode($string));
}

function gunzip($data) {
    return gzdecode($data);
}
