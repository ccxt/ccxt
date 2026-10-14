'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    marketGetPriceKline(params = {}) {
        return this.request("price/kline", "market", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    marketGetPriceMarkKline(params = {}) {
        return this.request("price/mark-kline", "market", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFutures(params = {}) {
        return this.request("futures", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesAssetId(params = {}) {
        return this.request("futures/{asset_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetWalletFunds(params = {}) {
        return this.request("wallet/funds", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesFunds(params = {}) {
        return this.request("futures/funds", "private", 'GET', params, undefined, undefined, { "cost": 5 });
    }
    privateGetFuturesTransactions(params = {}) {
        return this.request("futures/transactions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesOrders(params = {}) {
        return this.request("futures/orders", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesOrdersHistory(params = {}) {
        return this.request("futures/orders/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesOrdersOrderId(params = {}) {
        return this.request("futures/orders/{order_id}", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesPositions(params = {}) {
        return this.request("futures/positions", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesPositionsHistory(params = {}) {
        return this.request("futures/positions/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesFeeHistory(params = {}) {
        return this.request("futures/fee/history", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privateGetFuturesAssetIdLeverage(params = {}) {
        return this.request("futures/{asset_id}/leverage", "private", 'GET', params, undefined, undefined, { "cost": 2 });
    }
    privateGetFuturesPositionsPositionIdLiqPrice(params = {}) {
        return this.request("futures/positions/{position_id}/liq-price", "private", 'GET', params, undefined, undefined, { "cost": 1 });
    }
    privatePostWalletFuturesTransfer(params = {}) {
        return this.request("wallet/futures/transfer", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesTransfersInr(params = {}) {
        return this.request("futures/transfers/inr", "private", 'POST', params, undefined, undefined, { "cost": 5 });
    }
    privatePostFuturesAssetIdOrder(params = {}) {
        return this.request("futures/{asset_id}/order", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesPositionsPositionIdClose(params = {}) {
        return this.request("futures/positions/{position_id}/close", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesPositionsPositionIdClosePartial(params = {}) {
        return this.request("futures/positions/{position_id}/close/partial", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesPositionsPositionIdReverse(params = {}) {
        return this.request("futures/positions/{position_id}/reverse", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesPositionsPositionIdAddMargin(params = {}) {
        return this.request("futures/positions/{position_id}/add-margin", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesPositionsPositionIdRiskorder(params = {}) {
        return this.request("futures/positions/{position_id}/riskorder", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePostFuturesAssetIdLeverage(params = {}) {
        return this.request("futures/{asset_id}/leverage", "private", 'POST', params, undefined, undefined, { "cost": 2 });
    }
    privatePatchFuturesOrdersOrderId(params = {}) {
        return this.request("futures/orders/{order_id}", "private", 'PATCH', params, undefined, undefined, { "cost": 1 });
    }
    privatePatchFuturesPositionsPositionIdRiskorder(params = {}) {
        return this.request("futures/positions/{position_id}/riskorder", "private", 'PATCH', params, undefined, undefined, { "cost": 2 });
    }
    privateDeleteFuturesOrdersOrderId(params = {}) {
        return this.request("futures/orders/{order_id}", "private", 'DELETE', params, undefined, undefined, { "cost": 2 });
    }
}

exports["default"] = Exchange;
