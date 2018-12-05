var util = require('util');

// wraps a large number, does not support arithmetic

function BigNumber(number) {
    this.numberStr = number.toString();

    // not a number
    if (isNaN(parseFloat(this.numberStr)) === true
        || isFinite(this.numberStr) === false) {
        throw new Error(number + ' is not a number');
    }
}
util.inherits(BigNumber, Object);
module.exports = BigNumber;

BigNumber.prototype.toString = function() {
    return this.numberStr;
}
