import { implicitReturnType } from '../base/types.js'
import { Exchange as _Exchange } from '../base/Exchange.js'

export default abstract class Exchange extends _Exchange {
    abstract publicGetMarkets (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbol (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrencies (params?: {}): Promise<implicitReturnType>;
    abstract publicGetCurrenciesCurrency (params?: {}): Promise<implicitReturnType>;
    abstract publicGetTimestamp (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsPrice (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolPrice (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolOrderBook (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolCandles (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolTrades (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsTicker24h (params?: {}): Promise<implicitReturnType>;
    abstract publicGetMarketsSymbolTicker24h (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsActivity (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsBalances (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsIdBalances (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privateGetAccountsTransferId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSubaccounts (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSubaccountsBalances (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSubaccountsIdBalances (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSubaccountsTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSubaccountsTransferId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetFeeinfo (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsAddresses (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsActivity (params?: {}): Promise<implicitReturnType>;
    abstract privateGetWalletsAddressesCurrency (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersHistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersKillSwitchStatus (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSmartorders (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSmartordersId (params?: {}): Promise<implicitReturnType>;
    abstract privateGetSmartordersHistory (params?: {}): Promise<implicitReturnType>;
    abstract privateGetTrades (params?: {}): Promise<implicitReturnType>;
    abstract privateGetOrdersIdTrades (params?: {}): Promise<implicitReturnType>;
    abstract privatePostAccountsTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSubaccountsTransfer (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletsAddress (params?: {}): Promise<implicitReturnType>;
    abstract privatePostWalletsWithdraw (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrders (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersKillSwitch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostOrdersBatch (params?: {}): Promise<implicitReturnType>;
    abstract privatePostSmartorders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrdersCancelByIds (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteOrders (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteSmartordersId (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteSmartordersCancelByIds (params?: {}): Promise<implicitReturnType>;
    abstract privateDeleteSmartorders (params?: {}): Promise<implicitReturnType>;
    abstract privatePutOrdersId (params?: {}): Promise<implicitReturnType>;
    abstract privatePutSmartordersId (params?: {}): Promise<implicitReturnType>;
}