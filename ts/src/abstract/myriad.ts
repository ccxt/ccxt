// -------------------------------------------------------------------------------
// Myriad abstract interface
// -------------------------------------------------------------------------------

import { implicitReturnType } from '../base/types.js';
import { Exchange as _PredictionExchange } from '../base/PredictionExchange.js';

interface PredictionExchange {
    // Public market/question data
    myriadPublicGetQuestions (params?: {}): Promise<implicitReturnType>;
    myriadPublicGetQuestionsId (params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarkets (params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsId (params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsNetworkIdId (params?: {}): Promise<implicitReturnType>;
    myriadPublicGetMarketsIdEvents (params?: {}): Promise<implicitReturnType>;

    // Private trading endpoints
    myriadPrivatePostMarketsQuote (params?: {}): Promise<implicitReturnType>;
}

abstract class PredictionExchange extends _PredictionExchange {}

export default PredictionExchange;
