<?php

namespace ccxt\types;

enum OrderType : string {
    case Limit = 'limit';
    case Market = 'market';
}
