'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var number = require('./number.js');
var type = require('./type.js');
var errors = require('../errors.js');

//-------------------------------------------------------------------------
// converts timeframe to seconds
const parseTimeframe = (timeframe) => {
    const amount = type.asFloat(timeframe.slice(0, -1));
    const unit = timeframe.slice(-1);
    let scale = undefined;
    if (unit === 'y') {
        scale = 60 * 60 * 24 * 365;
    }
    else if (unit === 'M') {
        scale = 60 * 60 * 24 * 30;
    }
    else if (unit === 'w') {
        scale = 60 * 60 * 24 * 7;
    }
    else if (unit === 'd') {
        scale = 60 * 60 * 24;
    }
    else if (unit === 'h') {
        scale = 60 * 60;
    }
    else if (unit === 'm') {
        scale = 60;
    }
    else if (unit === 's') {
        scale = 1;
    }
    else {
        throw new errors.NotSupported('timeframe unit ' + unit + ' is not supported');
    }
    return amount * scale;
};
const roundTimeframe = (timeframe, timestamp, direction = number.ROUND_DOWN) => {
    const ms = parseTimeframe(timeframe) * 1000;
    // Get offset based on timeframe in milliseconds
    const offset = timestamp % ms;
    return timestamp - offset + ((direction === number.ROUND_UP) ? ms : 0);
};
const extractParams = (string) => {
    /**
     * @ignore
     * @method
     * @param string usually a url path
     * @returns {[string]} all substrings surrounded by {} from parameter string
     */
    const re = /{([\w-]+)}/g;
    const matches = [];
    let match = re.exec(string);
    while (match) {
        matches.push(match[1]);
        match = re.exec(string);
    }
    return matches;
};
const implodeParams = (string, params) => {
    if (!Array.isArray(params)) {
        const keys = Object.keys(params);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (!Array.isArray(params[key])) {
                string = string.replace('{' + key + '}', params[key]);
            }
        }
    }
    return string;
};
function vwap(baseVolume, quoteVolume) {
    return ((baseVolume !== undefined) && (quoteVolume !== undefined) && (baseVolume > 0)) ? (quoteVolume / baseVolume) : undefined;
}
/*  ------------------------------------------------------------------------ */
function aggregate(bidasks) {
    const result = {};
    for (let i = 0; i < bidasks.length; i++) {
        const [price, volume] = bidasks[i];
        if (volume > 0) {
            result[price] = (result[price] || 0) + volume; // TODO: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'.ts(7053)
        }
    }
    return Object.keys(result).map((price) => [parseFloat(price), parseFloat(result[price])]); // TODO: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}',   No index signature with a parameter of type 'string' was found on type '{}'.ts(7053)
}
/*  ------------------------------------------------------------------------ */

exports.aggregate = aggregate;
exports.extractParams = extractParams;
exports.implodeParams = implodeParams;
exports.parseTimeframe = parseTimeframe;
exports.roundTimeframe = roundTimeframe;
exports.vwap = vwap;
