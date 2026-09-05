import { List, Dict } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    v1PublicGetAssets(params?: {}): Promise<List>;
    v1PublicGetAssetsAssets(params?: {}): Promise<Dict>;
    v1PublicGetAssetsAssetNetworks(params?: {}): Promise<List>;
    v1PublicGetInstruments(params?: {}): Promise<List>;
    v1PublicGetInstrumentsInstrument(params?: {}): Promise<Dict>;
    v1PublicGetInstrumentsInstrumentQuote(params?: {}): Promise<Dict>;
    v1PublicGetInstrumentsInstrumentFunding(params?: {}): Promise<Dict>;
    v1PublicGetInstrumentsInstrumentCandles(params?: {}): Promise<Dict>;
    v1PrivateGetOrders(params?: {}): Promise<Dict>;
    v1PrivateGetOrdersId(params?: {}): Promise<Dict>;
    v1PrivateGetPortfolios(params?: {}): Promise<List>;
    v1PrivateGetPortfoliosPortfolio(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosPortfolioDetail(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosPortfolioSummary(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosPortfolioBalances(params?: {}): Promise<List>;
    v1PrivateGetPortfoliosPortfolioBalancesAsset(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosPortfolioPositions(params?: {}): Promise<List>;
    v1PrivateGetPortfoliosPortfolioPositionsInstrument(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosFills(params?: {}): Promise<Dict>;
    v1PrivateGetPortfoliosPortfolioFills(params?: {}): Promise<Dict>;
    v1PrivateGetTransfers(params?: {}): Promise<Dict>;
    v1PrivateGetTransfersTransferUuid(params?: {}): Promise<Dict>;
    v1PrivatePostOrders(params?: {}): Promise<Dict>;
    v1PrivatePostPortfolios(params?: {}): Promise<Dict>;
    v1PrivatePostPortfoliosMargin(params?: {}): Promise<Dict>;
    v1PrivatePostPortfoliosTransfer(params?: {}): Promise<Dict>;
    v1PrivatePostTransfersWithdraw(params?: {}): Promise<Dict>;
    v1PrivatePostTransfersAddress(params?: {}): Promise<Dict>;
    v1PrivatePostTransfersCreateCounterpartyId(params?: {}): Promise<Dict>;
    v1PrivatePostTransfersValidateCounterpartyId(params?: {}): Promise<Dict>;
    v1PrivatePostTransfersWithdrawCounterparty(params?: {}): Promise<Dict>;
    v1PrivatePutOrdersId(params?: {}): Promise<Dict>;
    v1PrivatePutPortfoliosPortfolio(params?: {}): Promise<Dict>;
    v1PrivateDeleteOrders(params?: {}): Promise<List>;
    v1PrivateDeleteOrdersId(params?: {}): Promise<Dict>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
