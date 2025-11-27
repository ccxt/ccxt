/**
 * Derivation Module
 * Exports all derivation logic for symbols, market types, and contract properties
 */

export {
    deriveSymbol,
    deriveBaseQuote,
    deriveSettleCurrency,
    deriveMarketType,
    isLinear,
    isInverse,
    isQuanto,
    deriveOptionProperties,
} from './symbol.js';

export {
    deriveContractSize,
    deriveSettlement,
    deriveMarketFlags,
    deriveMarketDetails,
    type ContractSizeDerivation,
    type SettlementDerivation,
    type MarketFlagsDerivation,
    type MarketDerivationRules,
} from './market.js';

export {
    deriveStrike,
    deriveExpiry,
    deriveOptionType,
    deriveQuantoMultiplier,
    deriveQuantoCurrency,
    deriveQuantoSettle,
    deriveFullOptionDetails,
    type OptionStrikeDerivation,
    type ExpiryDerivation,
    type OptionTypeDerivation,
    type QuantoLegDerivation,
    type OptionDerivationRules,
    type OptionDetails,
} from './options.js';

export {
    applyTemplate,
    applyTemplates,
    applyBestTemplate,
    applyFieldMapping,
    registerTemplate,
    getTemplate,
    getAllTemplates,
    clearTemplates,
    mergeTemplates,
    extendTemplate,
    SPOT_TEMPLATE,
    FUTURES_TEMPLATE,
    SWAP_TEMPLATE,
    OPTIONS_TEMPLATE,
    type ModelTemplate,
    type FieldMapping,
    type PostProcessFunction,
    type TemplateResolution,
} from './templates.js';
