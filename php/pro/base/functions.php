<?php

namespace ccxt\pro;

function inflate($data) {
    return zlib_decode($data);
}

function gunzip($data) {
    return gzdecode($data);
}
