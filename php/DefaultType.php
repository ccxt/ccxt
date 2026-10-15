<?php

namespace ccxt;

// mirrors ts/src/base/types.ts DefaultType (values for options['defaultType'])
class DefaultType {
    const SPOT = 'spot';
    const MARGIN = 'margin';
    const OPTION = 'option';
    const SWAP = 'swap';
    const FUTURE = 'future';
}
