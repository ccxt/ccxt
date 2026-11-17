import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
declare abstract class Exchange extends _Exchange {
    publicGetV2TradingMarketConfig(params?: {}): Promise<List>;
    publicGetV2TradingTickers(params?: {}): Promise<List>;
    publicGetV2TradingOrderBook(params?: {}): Promise<Dict>;
    publicGetV1TradingCandle(params?: {}): Promise<List>;
    publicGetV1TradingTradeLast(params?: {}): Promise<List>;
    publicGetV2CurrencyAssets(params?: {}): Promise<Dict>;
    publicGetV2CurrencyAssetsSymbol(params?: {}): Promise<Dict>;
    publicGetV1WalletSettingsAssets(params?: {}): Promise<List>;
    privateGetV1TradingOrder(params?: {}): Promise<List>;
    privateGetV1TradingOrderId(params?: {}): Promise<Dict>;
    privateGetV1TradingOrderIdTrades(params?: {}): Promise<List>;
    privateGetV1TradingTrade(params?: {}): Promise<Dict>;
    privateGetV1TradingWalletBalance(params?: {}): Promise<List>;
    privateGetV1TradingWorkingCapital(params?: {}): Promise<List>;
    privateGetV1TradingMovement(params?: {}): Promise<List>;
    privatePostV1TradingOrder(params?: {}): Promise<Dict | List>;
    privatePostV1TradingWalletDeposit(params?: {}): Promise<Dict>;
    privatePostV1TradingWalletWithdraw(params?: {}): Promise<Dict>;
    privatePostV1SigninApikey(params?: {}): Promise<Dict>;
    privateDeleteV1TradingOrderId(params?: {}): Promise<Dict>;
}
export default Exchange;
