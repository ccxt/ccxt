import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetIdAll (params?: {}): Promise<implicitReturnType>;
    abstract publicGetIdMarket (params?: {}): Promise<implicitReturnType>;
    abstract publicGetIdOrderbook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetIdTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetIdTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostInfo (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTrade (params?: {}): Promise<implicitReturnType>;
    abstract privatePostCancel (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrderbook (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostHistory (params?: {}): Promise<implicitReturnType>;
    abstract privatePostTransactions (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingTicker (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingTickerSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingStats (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingStatsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingOrderbookSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingTransactionsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PublicGetTradingCandleHistorySymbolResolution (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetApiPaymentsDepositsCryptoAddresses (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetPaymentsWithdrawalDetailId (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetPaymentsDepositDetailId (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetTradingOffer (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetTradingStopOffer (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetTradingConfigSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetTradingHistoryTransactions (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetBalancesBITBAYHistory (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetBalancesBITBAYBalance (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetFiatCantorRateBaseIdQuoteId (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateGetFiatCantorHistory (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostTradingOfferSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostTradingStopOfferSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostTradingConfigSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostBalancesBITBAYBalance (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostBalancesBITBAYBalanceTransferSourceDestination (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePostFiatCantorExchange (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateDeleteTradingOfferSymbolIdSidePrice (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivateDeleteTradingStopOfferSymbolIdSidePrice (params?: {}): Promise<implicitReturnType>;
    abstract v1_01PrivatePutBalancesBITBAYBalanceId (params?: {}): Promise<implicitReturnType>;
}