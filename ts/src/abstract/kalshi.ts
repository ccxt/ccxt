// -------------------------------------------------------------------------------
// Kalshi abstract interface
// -------------------------------------------------------------------------------

import { implicitReturnType } from '../base/types.js';
import { Exchange as _PredictionExchange } from '../base/PredictionExchange.js';

interface PredictionExchange {
    // Public market data
    kalshiPublicGetEvents (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetEventsEventTicker (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetSeries (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetSeriesSeriesTicker (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetMarkets (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetMarketsTicker (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetMarketsTickerOrderbook (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetMarketsTrades (params?: {}): Promise<implicitReturnType>;
    kalshiPublicGetSeriesSeriesTickerMarketsTickerCandlesticks (params?: {}): Promise<implicitReturnType>;

    // Private portfolio endpoints
    kalshiPrivateGetPortfolioBalance (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateGetPortfolioOrders (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateGetPortfolioOrdersOrderId (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateGetPortfolioPositions (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateGetPortfolioFills (params?: {}): Promise<implicitReturnType>;
    kalshiPrivatePostPortfolioOrders (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateDeletePortfolioOrdersOrderId (params?: {}): Promise<implicitReturnType>;
    kalshiPrivateDeletePortfolioOrders (params?: {}): Promise<implicitReturnType>;
}

abstract class PredictionExchange extends _PredictionExchange {}

export default PredictionExchange;
