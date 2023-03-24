import { implicitReturnType } from '../base/types.js'
import _zonda from '../zonda.js'

export default abstract class zonda extends _zonda {
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
    abstract v101PublicGetTradingTicker (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingTickerSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingStats (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingStatsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingOrderbookSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingTransactionsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PublicGetTradingCandleHistorySymbolResolution (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetApiPaymentsDepositsCryptoAddresses (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetPaymentsWithdrawalDetailId (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetPaymentsDepositDetailId (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetTradingOffer (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetTradingStopOffer (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetTradingConfigSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetTradingHistoryTransactions (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetBalancesBITBAYHistory (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetBalancesBITBAYBalance (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetFiatCantorRateBaseIdQuoteId (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateGetFiatCantorHistory (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostTradingOfferSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostTradingStopOfferSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostTradingConfigSymbol (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostBalancesBITBAYBalance (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostBalancesBITBAYBalanceTransferSourceDestination (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePostFiatCantorExchange (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateDeleteTradingOfferSymbolIdSidePrice (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivateDeleteTradingStopOfferSymbolIdSidePrice (params?: {}): Promise<implicitReturnType>;
    abstract v101PrivatePutBalancesBITBAYBalanceId (params?: {}): Promise<implicitReturnType>;
}