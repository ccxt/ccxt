'use strict';

const updateCachedOrders = function (openOrders, symbol) {
}

const updateOrders = function (oldOrders, newOrders, closeOpenOrders = false) {

    for (let i = 0; i < newOrders.length; i++) {
        let newOrder = newOrders[i];
    }

    // update local cache with open orders
    for (let j = 0; j < openOrders.length; j++) {
        const id = openOrders[j]['id'];
        this.orders[id] = openOrders[j];
    }
    let openOrdersIndexedById = this.indexBy (openOrders, 'id');
    let cachedOrderIds = Object.keys (this.orders);
    let result = [];
    for (let k = 0; k < cachedOrderIds.length; k++) {
        // match each cached order to an order in the open orders array
        // possible reasons why a cached order may be missing in the open orders array:
        // - order was closed or canceled -> update cache
        // - symbol mismatch (e.g. cached BTC/USDT, fetched ETH/USDT) -> skip
        let id = cachedOrderIds[k];
        let order = this.orders[id];
        result.push (order);
        if (!(id in openOrdersIndexedById)) {
            // cached order is not in open orders array
            // if we fetched orders by symbol and it doesn't match the cached order -> won't update the cached order
            if (typeof symbol !== 'undefined' && symbol !== order['symbol'])
                continue;
            // order is cached but not present in the list of open orders -> mark the cached order as closed
            if (order['status'] === 'open') {
                order = this.extend (order, {
                    'status': 'closed', // likewise it might have been canceled externally (unnoticed by "us")
                    'cost': undefined,
                    'filled': order['amount'],
                    'remaining': 0.0,
                });
                if (typeof order['cost'] === 'undefined') {
                    if (typeof order['filled'] !== 'undefined')
                        order['cost'] = order['filled'] * order['price'];
                }
                this.orders[id] = order;
            }
        }
    }
    return result;

    console.log (this.id, orders, openOrders, closedOrders, canceledOrders)
    process.exit ()
}
// -----------------------------------------------------------------------------

module.exports = {

    updateOrders,
}
