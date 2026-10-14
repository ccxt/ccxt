'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange$1 = require('../base/Exchange.js');

// ----------------------------------------------------------------------------
class Exchange extends Exchange$1["default"] {
    indexerGetAddressesAddress(params = {}) {
        return this.request('addresses/{address}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressParentSubaccountNumberNumber(params = {}) {
        return this.request('addresses/{address}/parentSubaccountNumber/{number}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressSubaccountNumberSubaccountNumber(params = {}) {
        return this.request('addresses/{address}/subaccountNumber/{subaccountNumber}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAssetPositions(params = {}) {
        return this.request('assetPositions', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAssetPositionsParentSubaccountNumber(params = {}) {
        return this.request('assetPositions/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetCandlesPerpetualMarketsMarket(params = {}) {
        return this.request('candles/perpetualMarkets/{market}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetComplianceScreenAddress(params = {}) {
        return this.request('compliance/screen/{address}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetFills(params = {}) {
        return this.request('fills', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetFillsParentSubaccountNumber(params = {}) {
        return this.request('fills/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetFundingPayments(params = {}) {
        return this.request('fundingPayments', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetFundingPaymentsParentSubaccount(params = {}) {
        return this.request('fundingPayments/parentSubaccount', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHeight(params = {}) {
        return this.request('height', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 0.1 });
    }
    indexerGetHistoricalPnl(params = {}) {
        return this.request('historical-pnl', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalPnlParentSubaccountNumber(params = {}) {
        return this.request('historical-pnl/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalBlockTradingRewardsAddress(params = {}) {
        return this.request('historicalBlockTradingRewards/{address}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalFundingMarket(params = {}) {
        return this.request('historicalFunding/{market}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalTradingRewardAggregationsAddress(params = {}) {
        return this.request('historicalTradingRewardAggregations/{address}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetOrderbooksPerpetualMarketMarket(params = {}) {
        return this.request('orderbooks/perpetualMarket/{market}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetOrders(params = {}) {
        return this.request('orders', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetOrdersParentSubaccountNumber(params = {}) {
        return this.request('orders/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetOrdersOrderId(params = {}) {
        return this.request('orders/{orderId}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualMarkets(params = {}) {
        return this.request('perpetualMarkets', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualPositions(params = {}) {
        return this.request('perpetualPositions', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualPositionsParentSubaccountNumber(params = {}) {
        return this.request('perpetualPositions/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetScreen(params = {}) {
        return this.request('screen', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetSparklines(params = {}) {
        return this.request('sparklines', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTime(params = {}) {
        return this.request('time', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTradesPerpetualMarketMarket(params = {}) {
        return this.request('trades/perpetualMarket/{market}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTransfers(params = {}) {
        return this.request('transfers', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTransfersBetween(params = {}) {
        return this.request('transfers/between', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTransfersParentSubaccountNumber(params = {}) {
        return this.request('transfers/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetVaultV1MegavaultHistoricalPnl(params = {}) {
        return this.request('vault/v1/megavault/historicalPnl', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetVaultV1MegavaultPositions(params = {}) {
        return this.request('vault/v1/megavault/positions', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetVaultV1VaultsHistoricalPnl(params = {}) {
        return this.request('vault/v1/vaults/historicalPnl', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualMarketSparklines(params = {}) {
        return this.request('perpetualMarketSparklines', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualMarketsTicker(params = {}) {
        return this.request('perpetualMarkets/{ticker}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPerpetualMarketsTickerOrderbook(params = {}) {
        return this.request('perpetualMarkets/{ticker}/orderbook', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTradesPerpetualMarketTicker(params = {}) {
        return this.request('trades/perpetualMarket/{ticker}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalFundingTicker(params = {}) {
        return this.request('historicalFunding/{ticker}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetCandlesTickerResolution(params = {}) {
        return this.request('candles/{ticker}/{resolution}', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressSubaccounts(params = {}) {
        return this.request('addresses/{address}/subaccounts', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberAssetPositions(params = {}) {
        return this.request('addresses/{address}/subaccountNumber/{subaccountNumber}/assetPositions', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberPerpetualPositions(params = {}) {
        return this.request('addresses/{address}/subaccountNumber/{subaccountNumber}/perpetualPositions', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetAddressesAddressSubaccountNumberSubaccountNumberOrders(params = {}) {
        return this.request('addresses/{address}/subaccountNumber/{subaccountNumber}/orders', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetFillsParentSubaccount(params = {}) {
        return this.request('fills/parentSubaccount', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetHistoricalPnlParentSubaccount(params = {}) {
        return this.request('historical-pnl/parentSubaccount', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPnl(params = {}) {
        return this.request('pnl', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetPnlParentSubaccountNumber(params = {}) {
        return this.request('pnl/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTradeHistory(params = {}) {
        return this.request('tradeHistory', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerGetTradeHistoryParentSubaccountNumber(params = {}) {
        return this.request('tradeHistory/parentSubaccountNumber', ['indexer'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    indexerPostTurnkeySignin(params = {}) {
        return this.request('turnkey/signin', ['indexer'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    indexerPostTurnkeyUploadAddress(params = {}) {
        return this.request('turnkey/uploadAddress', ['indexer'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRpcGetAbciInfo(params = {}) {
        return this.request('abci_info', ['nodeRpc'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRpcGetBlock(params = {}) {
        return this.request('block', ['nodeRpc'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRpcGetBroadcastTxAsync(params = {}) {
        return this.request('broadcast_tx_async', ['nodeRpc'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRpcGetBroadcastTxSync(params = {}) {
        return this.request('broadcast_tx_sync', ['nodeRpc'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRpcGetTx(params = {}) {
        return this.request('tx', ['nodeRpc'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRestGetCosmosAuthV1beta1AccountInfoDydxAddress(params = {}) {
        return this.request('cosmos/auth/v1beta1/account_info/{dydxAddress}', ['nodeRest'], 'GET', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRestPostCosmosTxV1beta1Encode(params = {}) {
        return this.request('cosmos/tx/v1beta1/encode', ['nodeRest'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
    nodeRestPostCosmosTxV1beta1Simulate(params = {}) {
        return this.request('cosmos/tx/v1beta1/simulate', ['nodeRest'], 'POST', params, undefined, undefined, { 'cost': 1 });
    }
}

exports["default"] = Exchange;
