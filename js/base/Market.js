"use strict";

module.exports = class Market {

    constructor (exchange, symbol) {
        this.exchange = exchange;
        this.symbol = symbol;
        this.market = exchange.markets[symbol];
    }

    amountToPrecision (amount) {
        return this.exchange.amountToPrecision (this.symbol, amount)
    }

    createLimitBuyOrder(amount, price) {
        return this.exchange.createLimitBuyOrder (this.symbol, amount, price)
    }

    createLimitSellOrder(amount, price) {
        return this.exchange.createLimitSellOrder (this.symbol, amount, price)
    }
}
