import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetCurrencies (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCandlesticksInstrumentCode (params?: {}): Promise<implicitReturnType>;
    abstract publicGetFees (params?: {}): Promise<implicitReturnType>;
    abstract publicGetInstruments (params?: {}): Promise<implicitReturnType>;
    abstract publicGetOrderBookInstrumentCode (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTicker (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketTickerInstrumentCode (params?: {}): Promise<implicitReturnType>;
    abstract publicGetPriceTicksInstrumentCode (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTime (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountBalances (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountDepositCryptoCurrencyCode (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountDepositFiatEUR (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountDeposits (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountDepositsBitpanda (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountWithdrawals (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountWithdrawalsBitpanda (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountFees (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountOrdersOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountOrdersOrderIdTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountTradesTradeId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountTradingVolume (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountDepositCrypto (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountWithdrawCrypto (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountWithdrawFiat (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountFees (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteAccountOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteAccountOrdersOrderId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteAccountOrdersClientClientId (params?: {}): Promise<implicitReturnType>;
}