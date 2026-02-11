import Exchange from './abstract/drift.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, OrderBook, Balances, Str, Ticker, Tickers, Strings, Market, Num, Dict, int, Position, Currencies, Currency, Transaction, LedgerEntry, FundingHistory, IndexType } from './base/types.js';
import { BadRequest, InvalidOrder, NotSupported, ArgumentsRequired, InsufficientFunds, OrderNotFound, ExchangeError } from './base/errors.js';
import { eddsa } from './base/functions/crypto.js';
import { ed25519 } from './static_dependencies/noble-curves/ed25519.js';
import { Precise } from './base/Precise.js';

export default class drift extends Exchange {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'id': 'drift',
            'name': 'Drift Protocol',
            'countries': [],
            'version': 'v1',
            'rateLimit': 250,
            'certified': false,
            'pro': false,
            'requiredCredentials': {
                'apiKey': false,
                'secret': false,
                'accountId': true,
                'privateKey': true,
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'deposit': true,
                'editOrder': false,
                'fetchAccounts': false,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchDeposits': false,
                'fetchFundingHistory': true,
                'fetchFundingLimits': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTradingLimits': false,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'transfer': false,
                'withdraw': true,
            },
            'timeframes': {
                '1m': '1',
                '5m': '5',
                '15m': '15',
                '1h': '60',
                '4h': '240',
                '1d': 'D',
                '1w': 'W',
                '1M': 'M',
            },
            'urls': {
                'logo': 'https://app.drift.trade/assets/icons/text-logo-light-theme.svg',
                'api': {
                    'public': 'https://data.api.drift.trade',
                    'dlob': 'https://dlob.drift.trade',
                },
                'www': 'https://app.drift.trade',
                'doc': [
                    'https://docs.drift.trade',
                    'https://data.api.drift.trade/playground',
                ],
                'fees': 'https://docs.drift.trade/trading/trading-fees',
            },
            'api': {
                'public': {
                    'get': [
                        'user/{accountId}',
                        'user/{accountId}/trades',
                        'user/{accountId}/trades/{symbol}',
                        'user/{accountId}/orders/id/{orderId}',
                        'user/{accountId}/settlePnl',
                        'user/{accountId}/deposits',
                        'user/{accountId}/orders/perp',
                        'user/{accountId}/orders/perp/{symbol}',
                        'user/{accountId}/orders/perp/id/{orderId}',
                        'user/{accountId}/fundingPayments',
                        'market/{symbol}/trades',
                        'market/{symbol}/candles/{resolution}',
                        'stats/markets',
                        'authority/{authorityId}/accounts',
                    ],
                    'post': [
                        'tx/order/place',
                        'tx/order/cancel',
                        'tx/execute',
                        'tx/deposit',
                        'tx/withdraw',
                    ],
                },
                'dlob': {
                    'get': [
                        'l2',
                        'batchL2',
                    ],
                },
            },
            'exceptions': {
                'exact': {
                    'ValidationError': ArgumentsRequired,
                    'InsufficientCollateral': InsufficientFunds,
                    '6000': ExchangeError, // Invalid Spot Market Authority
                    '6001': ExchangeError, // Clearing house not insurance fund authority
                    '6002': InsufficientFunds, // Insufficient deposit
                    '6003': InsufficientFunds, // Insufficient collateral
                    '6004': ExchangeError, // Sufficient collateral
                    '6005': InvalidOrder, // Max number of positions taken
                    '6006': InvalidOrder, // Admin Controls Prices Disabled
                    '6007': InvalidOrder, // Market Delisted
                    '6008': InvalidOrder, // Market Index Already Initialized
                    '6009': InvalidOrder, // User Account And User Positions Account Mismatch
                    '6010': InvalidOrder, // User Has No Position In Market
                    '6011': InvalidOrder, // Invalid Initial Peg
                    '6012': InvalidOrder, // AMM repeg already configured with amt given
                    '6013': InvalidOrder, // AMM repeg incorrect repeg direction
                    '6014': InvalidOrder, // AMM repeg out of bounds pnl
                    '6015': InvalidOrder, // Slippage Outside Limit Price
                    '6016': InvalidOrder, // Order Size Too Small
                    '6017': InvalidOrder, // Price change too large when updating K
                    '6018': InvalidOrder, // Admin tried to withdraw amount larger than fees collected
                    '6019': InvalidOrder, // Math Error
                    '6020': InvalidOrder, // Conversion to u128/u64 failed with an overflow or underflow
                    '6021': InvalidOrder, // Clock unavailable
                    '6022': InvalidOrder, // Unable To Load Oracles
                    '6023': InvalidOrder, // Price Bands Breached
                    '6024': ExchangeError, // Exchange is paused
                    '6025': ExchangeError, // Invalid whitelist token
                    '6026': ExchangeError, // Whitelist token not found
                    '6027': ExchangeError, // Invalid discount token
                    '6028': ExchangeError, // Discount token not found
                    '6029': ExchangeError, // Referrer not found
                    '6030': ExchangeError, // ReferrerNotFound
                    '6031': ExchangeError, // ReferrerMustBeWritable
                    '6032': ExchangeError, // ReferrerMustBeWritable
                    '6033': ExchangeError, // ReferrerAndReferrerStatsAuthorityUnequal
                    '6034': ExchangeError, // InvalidReferrer
                    '6035': InvalidOrder, // InvalidOracle
                    '6036': InvalidOrder, // OracleNotFound
                    '6037': InvalidOrder, // Liquidations Blocked By Oracle
                    '6038': InvalidOrder, // Can not deposit more than max deposit
                    '6039': InvalidOrder, // Can not delete user that still has collateral
                    '6040': InvalidOrder, // AMM funding out of bounds pnl
                    '6041': InvalidOrder, // Casting Failure
                    '6042': InvalidOrder, // InvalidOrder
                    '6043': InvalidOrder, // InvalidOrderMaxTs
                    '6044': InvalidOrder, // InvalidOrderMarketType
                    '6045': InvalidOrder, // InvalidOrderForInitialMarginReq
                    '6046': InvalidOrder, // InvalidOrderNotRiskReducing
                    '6047': InvalidOrder, // InvalidOrderSizeTooSmall
                    '6048': InvalidOrder, // InvalidOrderNotStepSizeMultiple
                    '6049': InvalidOrder, // InvalidOrderBaseQuoteAsset
                    '6050': InvalidOrder, // InvalidOrderIOC
                    '6051': InvalidOrder, // InvalidOrderPostOnly
                    '6052': InvalidOrder, // InvalidOrderIOCPostOnly
                    '6053': InvalidOrder, // InvalidOrderTrigger
                    '6054': InvalidOrder, // InvalidOrderAuction
                    '6055': InvalidOrder, // InvalidOrderOracleOffset
                    '6056': InvalidOrder, // InvalidOrderMinOrderSize
                    '6057': InvalidOrder, // Failed to Place Post-Only Limit Order
                    '6058': InvalidOrder, // User has no order
                    '6059': InvalidOrder, // Order Amount Too Small
                    '6060': InvalidOrder, // Max number of orders taken
                    '6061': InvalidOrder, // Order does not exist
                    '6062': InvalidOrder, // Order not open
                    '6063': InvalidOrder, // FillOrderDidNotUpdateState
                    '6064': InvalidOrder, // Reduce only order increased risk
                    '6065': InvalidOrder, // Unable to load AccountLoader
                    '6066': InvalidOrder, // Trade Size Too Large
                    '6067': BadRequest, // User cant refer themselves
                    '6068': BadRequest, // Did not receive expected referrer
                    '6069': BadRequest, // Could not deserialize referrer
                    '6070': ExchangeError, // Could not deserialize referrer stats
                    '6071': InvalidOrder, // User Order Id Already In Use
                    '6072': InvalidOrder, // No positions liquidatable
                    '6073': InvalidOrder, // Invalid Margin Ratio
                    '6074': InvalidOrder, // Cant Cancel Post Only Order
                    '6075': InvalidOrder, // InvalidOracleOffset
                    '6076': InvalidOrder, // CantExpireOrders
                    '6077': InvalidOrder, // CouldNotLoadMarketData
                    '6078': InvalidOrder, // PerpMarketNotFound
                    '6079': InvalidOrder, // InvalidMarketAccount
                    '6080': InvalidOrder, // UnableToLoadMarketAccount
                    '6081': InvalidOrder, // MarketWrongMutability
                    '6082': InvalidOrder, // UnableToCastUnixTime
                    '6083': InvalidOrder, // CouldNotFindSpotPosition
                    '6084': InvalidOrder, // NoSpotPositionAvailable
                    '6085': InvalidOrder, // InvalidSpotMarketInitialization
                    '6086': InvalidOrder, // CouldNotLoadSpotMarketData
                    '6087': InvalidOrder, // SpotMarketNotFound
                    '6088': InvalidOrder, // InvalidSpotMarketAccount
                    '6089': InvalidOrder, // UnableToLoadSpotMarketAccount
                    '6090': InvalidOrder, // SpotMarketWrongMutability
                    '6091': InvalidOrder, // SpotInterestNotUpToDate
                    '6092': InvalidOrder, // SpotMarketInsufficientDeposits
                    '6093': InvalidOrder, // UserMustSettleTheirOwnPositiveUnsettledPNL
                    '6094': InvalidOrder, // CantUpdatePoolBalanceType
                    '6095': InvalidOrder, // InsufficientCollateralForSettlingPNL
                    '6096': InvalidOrder, // AMMNotUpdatedInSameSlot
                    '6097': InvalidOrder, // AuctionNotComplete
                    '6098': InvalidOrder, // MakerNotFound
                    '6099': InvalidOrder, // MakerNotFound
                    '6100': InvalidOrder, // MakerMustBeWritable
                    '6101': InvalidOrder, // MakerMustBeWritable
                    '6102': InvalidOrder, // MakerOrderNotFound
                    '6103': InvalidOrder, // CouldNotDeserializeMaker
                    '6104': InvalidOrder, // CouldNotDeserializeMaker
                    '6105': InvalidOrder, // AuctionPriceDoesNotSatisfyMaker
                    '6106': InvalidOrder, // MakerCantFulfillOwnOrder
                    '6107': InvalidOrder, // MakerOrderMustBePostOnly
                    '6108': InvalidOrder, // CantMatchTwoPostOnlys
                    '6109': InvalidOrder, // OrderBreachesOraclePriceLimits
                    '6110': InvalidOrder, // OrderMustBeTriggeredFirst
                    '6111': InvalidOrder, // OrderNotTriggerable
                    '6112': InvalidOrder, // OrderDidNotSatisfyTriggerCondition
                    '6113': InvalidOrder, // PositionAlreadyBeingLiquidated
                    '6114': InvalidOrder, // PositionDoesntHaveOpenPositionOrOrders
                    '6115': InvalidOrder, // AllOrdersAreAlreadyLiquidations
                    '6116': InvalidOrder, // CantCancelLiquidationOrder
                    '6117': InvalidOrder, // UserIsBeingLiquidated
                    '6118': InvalidOrder, // LiquidationsOngoing
                    '6119': InvalidOrder, // WrongSpotBalanceType
                    '6120': InvalidOrder, // UserCantLiquidateThemself
                    '6121': InvalidOrder, // InvalidPerpPositionToLiquidate
                    '6122': InvalidOrder, // InvalidBaseAssetAmountForLiquidatePerp
                    '6123': InvalidOrder, // InvalidPositionLastFundingRate
                    '6124': InvalidOrder, // InvalidPositionDelta
                    '6125': InvalidOrder, // UserBankrupt
                    '6126': InvalidOrder, // UserNotBankrupt
                    '6127': InvalidOrder, // UserHasInvalidBorrow
                    '6128': InvalidOrder, // DailyWithdrawLimit
                    '6129': InvalidOrder, // DefaultError
                    '6130': InvalidOrder, // Insufficient LP tokens
                    '6131': InvalidOrder, // Cant LP with a market position
                    '6132': InvalidOrder, // Unable to burn LP tokens
                    '6133': InvalidOrder, // Trying to remove liqudity too fast after adding it
                    '6134': InvalidOrder, // Invalid Spot Market Vault
                    '6135': InvalidOrder, // Invalid Spot Market State
                    '6136': InvalidOrder, // InvalidSerumProgram
                    '6137': InvalidOrder, // InvalidSerumMarket
                    '6138': InvalidOrder, // InvalidSerumBids
                    '6139': InvalidOrder, // InvalidSerumAsks
                    '6140': InvalidOrder, // InvalidSerumOpenOrders
                    '6141': InvalidOrder, // FailedSerumCPI
                    '6142': InvalidOrder, // FailedToFillOnExternalMarket
                    '6143': InvalidOrder, // InvalidFulfillmentConfig
                    '6144': InvalidOrder, // InvalidFeeStructure
                    '6145': InvalidOrder, // Insufficient IF shares
                    '6146': InvalidOrder, // the Market has paused this action
                    '6147': InvalidOrder, // the Market status doesnt allow placing orders
                    '6148': InvalidOrder, // the Market status doesnt allow filling orders
                    '6149': InvalidOrder, // the Market status doesnt allow withdraws
                    '6150': InvalidOrder, // Action violates the Protected Asset Tier rules
                    '6151': InvalidOrder, // Action violates the Isolated Asset Tier rules
                    '6152': InvalidOrder, // User Cant Be Deleted
                    '6153': InvalidOrder, // Reduce Only Withdraw Increased Risk
                    '6154': InvalidOrder, // Max Open Interest
                    '6155': InvalidOrder, // Cant Resolve Perp Bankruptcy
                    '6156': InvalidOrder, // Liquidation Doesnt Satisfy Limit Price
                    '6157': InvalidOrder, // Margin Trading Disabled
                    '6158': InvalidOrder, // Invalid Market Status to Settle Perp Pnl
                    '6159': InvalidOrder, // PerpMarketNotInSettlement
                    '6160': InvalidOrder, // PerpMarketNotInReduceOnly
                    '6161': InvalidOrder, // PerpMarketSettlementBufferNotReached
                    '6162': InvalidOrder, // PerpMarketSettlementUserHasOpenOrders
                    '6163': InvalidOrder, // PerpMarketSettlementUserHasActiveLP
                    '6164': InvalidOrder, // UnableToSettleExpiredUserPosition
                    '6165': InvalidOrder, // UnequalMarketIndexForSpotTransfer
                    '6166': InvalidOrder, // InvalidPerpPositionDetected
                    '6167': InvalidOrder, // InvalidSpotPositionDetected
                    '6168': InvalidOrder, // InvalidAmmDetected
                    '6169': InvalidOrder, // InvalidAmmForFillDetected
                    '6170': InvalidOrder, // InvalidAmmLimitPriceOverride
                    '6171': InvalidOrder, // InvalidOrderFillPrice
                    '6172': InvalidOrder, // SpotMarketBalanceInvariantViolated
                    '6173': InvalidOrder, // SpotMarketVaultInvariantViolated
                    '6174': InvalidOrder, // InvalidPDA
                    '6175': InvalidOrder, // InvalidPDASigner
                    '6176': InvalidOrder, // RevenueSettingsCannotSettleToIF
                    '6177': InvalidOrder, // NoRevenueToSettleToIF
                    '6178': InvalidOrder, // NoAmmPerpPnlDeficit
                    '6179': InvalidOrder, // SufficientPerpPnlPool
                    '6180': InvalidOrder, // InsufficientPerpPnlPool
                    '6181': InvalidOrder, // PerpPnlDeficitBelowThreshold
                    '6182': InvalidOrder, // MaxRevenueWithdrawPerPeriodReached
                    '6183': InvalidOrder, // InvalidSpotPositionDetected
                    '6184': InvalidOrder, // NoIFWithdrawAvailable
                    '6185': InvalidOrder, // InvalidIFUnstake
                    '6186': InvalidOrder, // InvalidIFUnstakeSize
                    '6187': InvalidOrder, // InvalidIFUnstakeCancel
                    '6188': InvalidOrder, // InvalidIFForNewStakes
                    '6189': InvalidOrder, // InvalidIFRebase
                    '6190': InvalidOrder, // InvalidInsuranceUnstakeSize
                    '6191': InvalidOrder, // InvalidOrderLimitPrice
                    '6192': InvalidOrder, // InvalidIFDetected
                    '6193': InvalidOrder, // InvalidAmmMaxSpreadDetected
                    '6194': InvalidOrder, // InvalidConcentrationCoef
                    '6195': InvalidOrder, // InvalidSrmVault
                    '6196': InvalidOrder, // InvalidVaultOwner
                    '6197': InvalidOrder, // InvalidMarketStatusForFills
                    '6198': InvalidOrder, // IFWithdrawRequestInProgress
                    '6199': InvalidOrder, // NoIFWithdrawRequestInProgress
                    '6200': InvalidOrder, // IFWithdrawRequestTooSmall
                    '6201': InvalidOrder, // IncorrectSpotMarketAccountPassed
                    '6202': InvalidOrder, // BlockchainClockInconsistency
                    '6203': InvalidOrder, // InvalidIFSharesDetected
                    '6204': InvalidOrder, // NewLPSizeTooSmall
                    '6205': InvalidOrder, // MarketStatusInvalidForNewLP
                    '6206': InvalidOrder, // InvalidMarkTwapUpdateDetected
                    '6207': InvalidOrder, // MarketSettlementAttemptOnActiveMarket
                    '6208': InvalidOrder, // MarketSettlementRequiresSettledLP
                    '6209': InvalidOrder, // MarketSettlementAttemptTooEarly
                    '6210': InvalidOrder, // MarketSettlementTargetPriceInvalid
                    '6211': InvalidOrder, // UnsupportedSpotMarket
                    '6212': InvalidOrder, // SpotOrdersDisabled
                    '6213': InvalidOrder, // Market Being Initialized
                    '6214': InvalidOrder, // Invalid Sub Account Id
                    '6215': InvalidOrder, // Invalid Trigger Order Condition
                    '6216': InvalidOrder, // Invalid Spot Position
                    '6217': InvalidOrder, // Cant transfer between same user account
                    '6218': InvalidOrder, // Invalid Perp Position
                    '6219': InvalidOrder, // Unable To Get Limit Price
                    '6220': InvalidOrder, // Invalid Liquidation
                    '6221': InvalidOrder, // Spot Fulfullment Config Disabled
                    '6222': InvalidOrder, // Invalid Maker
                    '6223': InvalidOrder, // Failed Unwrap
                    '6224': InvalidOrder, // Max Number Of Users
                    '6225': InvalidOrder, // InvalidOracleForSettlePnl
                    '6226': InvalidOrder, // MarginOrdersOpen
                    '6227': InvalidOrder, // TierViolationLiquidatingPerpPnl
                    '6228': BadRequest, // CouldNotLoadUserData
                    '6229': BadRequest, // UserWrongMutability
                    '6230': BadRequest, // InvalidUserAccount
                    '6231': BadRequest, // CouldNotLoadUserData
                    '6232': BadRequest, // UserWrongMutability
                    '6233': BadRequest, // InvalidUserAccount
                    '6234': BadRequest, // UserNotFound
                    '6235': InvalidOrder, // UnableToLoadUserAccount
                    '6236': InvalidOrder, // UserStatsNotFound
                    '6237': InvalidOrder, // UnableToLoadUserStatsAccount
                    '6238': InvalidOrder, // User Not Inactive
                    '6239': InvalidOrder, // RevertFill
                    '6240': InvalidOrder, // Invalid MarketAccount for Deletion
                    '6241': InvalidOrder, // Invalid Spot Fulfillment Params
                    '6242': InvalidOrder, // Failed to Get Mint
                    '6243': InvalidOrder, // FailedPhoenixCPI
                    '6244': InvalidOrder, // FailedToDeserializePhoenixMarket
                    '6245': InvalidOrder, // InvalidPricePrecision
                    '6246': InvalidOrder, // InvalidPhoenixProgram
                    '6247': InvalidOrder, // InvalidPhoenixMarket
                    '6248': InvalidOrder, // InvalidSwap
                    '6249': InvalidOrder, // SwapLimitPriceBreached
                    '6250': InvalidOrder, // SpotMarketReduceOnly
                    '6251': InvalidOrder, // FundingWasNotUpdated
                    '6252': InvalidOrder, // ImpossibleFill
                    '6253': InvalidOrder, // CantUpdatePerpBidAskTwap
                    '6254': InvalidOrder, // UserReduceOnly
                    '6255': InvalidOrder, // InvalidMarginCalculation
                    '6256': InvalidOrder, // CantPayUserInitFee
                    '6257': InvalidOrder, // CantReclaimRent
                    '6258': InvalidOrder, // InsuranceFundOperationPaused
                    '6259': InvalidOrder, // NoUnsettledPnl
                    '6260': InvalidOrder, // PnlPoolCantSettleUser
                    '6261': ExchangeError, // OracleInvalid
                    '6262': ExchangeError, // OracleTooVolatile
                    '6263': ExchangeError, // OracleTooUncertain
                    '6264': ExchangeError, // OracleStaleForMargin
                    '6265': ExchangeError, // OracleInsufficientDataPoints
                    '6266': ExchangeError, // OracleStaleForAMM
                    '6267': InvalidOrder, // Unable to parse pull oracle message
                    '6268': InvalidOrder, // Can not borow more than max borrows
                    '6269': InvalidOrder, // Updates must be monotonically increasing
                    '6270': InvalidOrder, // Trying to update price feed with the wrong feed id
                    '6271': InvalidOrder, // The message in the update must be a PriceFeedMessage
                    '6272': InvalidOrder, // Could not deserialize the message in the update
                    '6273': InvalidOrder, // Wrong guardian set owner in update price atomic
                    '6274': InvalidOrder, // Oracle post update atomic price feed account must be drift program
                    '6275': InvalidOrder, // Oracle vaa owner must be wormhole program
                    '6276': InvalidOrder, // Multi updates must have 2 or fewer accounts passed in remaining accounts
                    '6277': InvalidOrder, // Don't have the same remaining accounts number and merkle price updates left
                    '6278': InvalidOrder, // Remaining account passed is not a valid pda
                    '6279': InvalidOrder, // FailedOpenbookV2CPI
                    '6280': InvalidOrder, // InvalidOpenbookV2Program
                    '6281': InvalidOrder, // InvalidOpenbookV2Market
                    '6282': InvalidOrder, // Non zero transfer fee
                    '6283': InvalidOrder, // Liquidation order failed to fill
                    '6284': InvalidOrder, // Invalid prediction market order
                    '6285': InvalidOrder, // Ed25519 Ix must be before place and make swift order ix
                    '6286': InvalidOrder, // Swift message verificaiton failed
                    '6287': InvalidOrder, // Market index mismatched b/w taker and maker swift order params
                    '6288': InvalidOrder, // Swift only available for market/oracle perp orders
                    '6289': InvalidOrder, // Place and take order success condition failed
                    '6290': InvalidOrder, // Invalid High Leverage Mode Config
                    '6291': InvalidOrder, // Invalid RFQ User Account
                    '6292': InvalidOrder, // RFQUserAccount should be mutable
                    '6293': InvalidOrder, // RFQUserAccount has too many active RFQs
                    '6294': InvalidOrder, // RFQ order not filled as expected
                    '6295': InvalidOrder, // RFQ orders must be jit makers
                    '6296': InvalidOrder, // RFQ matches must be valid
                },
                'broad': {},
            },
        });
    }

    /**
     * @param params
     * @method
     * @name drift#fetchMarkets
     * @description retrieves data on all markets for drift
     * @returns {object[]} an array of objects representing market data
     */
    async fetchMarkets (params = {}): Promise<Market[]> {
        const response = await this.publicGetStatsMarkets (params);
        const allMarkets = this.safeValue (response, 'markets', []);
        const result = [];
        for (let i = 0; i < allMarkets.length; i++) {
            const market = allMarkets[i];
            const marketType = this.safeString (market, 'marketType');
            // Only include perp markets
            if (marketType !== 'perp') {
                continue;
            }
            const id = this.safeString (market, 'symbol');
            const baseId = this.safeString (market, 'baseAsset');
            const quoteId = this.safeString (market, 'quoteAsset');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const settle = quote;
            const symbol = base + '/' + quote + ':' + settle;
            const status = this.safeString (market, 'status');
            const activeStatuses = {
                'active': true,
                'fundingPaused': true,
                'ammPaused': true,
            };
            let active = undefined;
            if (status in activeStatuses) {
                active = activeStatuses[status];
            }
            const limits = this.safeValue (market, 'limits', {});
            const leverageLimits = this.safeValue (limits, 'leverage', {});
            const amountLimits = this.safeValue (limits, 'amount', {});
            const fees = this.safeValue (market, 'fees', {});
            const precision = this.safeString (market, 'precision');
            result.push (this.safeMarketStructure ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': quoteId,
                'type': 'swap',
                'spot': false,
                'margin': false,
                'swap': true,
                'future': false,
                'option': false,
                'active': active,
                'contract': true,
                'linear': true,
                'inverse': false,
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'maker': this.safeNumber (fees, 'maker'),
                'taker': this.safeNumber (fees, 'taker'),
                'precision': {
                    'amount': this.parseNumber (this.parsePrecision (precision)),
                    'price': this.parseNumber (this.parsePrecision (precision)),
                },
                'limits': {
                    'leverage': {
                        'min': this.safeNumber (leverageLimits, 'min', 1),
                        'max': this.safeNumber (leverageLimits, 'max', 1),
                    },
                    'amount': {
                        'min': this.safeNumber (amountLimits, 'min'),
                        'max': this.safeNumber (amountLimits, 'max'),
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'created': undefined,
                'info': market,
            }));
        }
        return result;
    }

    /**
     * @method
     * @name drift#fetchCurrencies
     * @description fetches all available currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Currencies} an associative dictionary of currencies
     */
    async fetchCurrencies (params = {}): Promise<Currencies> {
        const response = await this.publicGetStatsMarkets (params);
        const markets = this.safeValue (response, 'markets', []);
        const result: Dict = {};
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            const marketType = this.safeString (market, 'marketType');
            if (marketType !== 'spot') {
                continue;
            }
            const symbol = this.safeString (market, 'symbol');
            const status = this.safeString (market, 'status');
            const limits = this.safeValue (market, 'limits', {});
            const depositLimits = this.safeValue (limits, 'deposit', {});
            const withdrawLimits = this.safeValue (limits, 'withdraw', {});
            const withdrawEnabled = status !== 'withdrawPaused';
            const isActive = status === 'active';
            result[symbol] = this.safeCurrencyStructure ({
                'id': this.safeString (market, 'marketIndex'),
                'code': this.safeString (market, 'symbol'),
                'info': market,
                'active': isActive,
                'deposit': true,
                'withdraw': withdrawEnabled,
                'fee': undefined,
                'precision': this.safeInteger (market, 'precision'),
                'limits': {
                    'deposit': {
                        'min': this.safeNumber (depositLimits, 'min'),
                        'max': this.safeNumber (depositLimits, 'max'),
                    },
                    'withdraw': {
                        'min': this.safeNumber (withdrawLimits, 'min'),
                        'max': this.safeNumber (withdrawLimits, 'max'),
                    },
                },
                'networks': {},
            });
        }
        return result;
    }

    /**
     * @method
     * @name drift#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketType = market['swap'] ? 'perp' : 'spot';
        const request: Dict = {
            'marketName': market['id'],
            'marketType': marketType,
            'depth': 1,
        };
        const promises = [
            this.dlobGetL2 (this.extend (request, params)), // top of book from dlob
            this.publicGetStatsMarkets (), // 24h stats
        ];
        const responses = await Promise.all (promises);
        const dlobl2 = responses[0];
        const timestamp = this.safeInteger (dlobl2, 'ts');
        const bids = this.safeList (dlobl2, 'bids');
        const asks = this.safeList (dlobl2, 'asks');
        let bidPrice = undefined;
        let bidVolume = undefined;
        let askPrice = undefined;
        let askVolume = undefined;
        if (Array.isArray (bids)) {
            const bestBid = this.parseBidAsk (bids[0]);
            bidPrice = bestBid[0];
            bidVolume = bestBid[1];
        }
        if (Array.isArray (asks)) {
            const bestAsk = this.parseBidAsk (asks[0]);
            askPrice = bestAsk[0];
            askVolume = bestAsk[1];
        }
        const marketsStats = this.safeValue (responses[1], 'markets', []);
        const stats = this.findMarketStat (marketsStats, market['id']);
        const last = this.safeNumber (stats, 'price');
        const priceHighObj = this.safeValue (stats, 'priceHigh');
        const priceLowObj = this.safeValue (stats, 'priceLow');
        const priceHigh = this.safeNumber (priceHighObj, 'fill');
        const priceLow = this.safeNumber (priceLowObj, 'fill');
        return this.safeTicker (
            {
                'symbol': market['symbol'],
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': priceHigh,
                'low': priceLow,
                'bid': bidPrice,
                'bidVolume': bidVolume,
                'ask': askPrice,
                'askVolume': askVolume,
                'close': last,
                'last': last,
                'change': this.safeNumber (stats, 'priceChange24h'),
                'percentage': this.safeNumber (stats, 'price24hChangePct'),
                'baseVolume': this.safeNumber (stats, 'baseVolume'),
                'quoteVolume': this.safeNumber (stats, 'quoteVolume'),
                'markPrice': this.safeNumber (stats, 'markPrice'),
                'info': this.deepExtend (dlobl2, stats),
            },
            market
        );
    }

    findMarketStat (stats: any[], marketId: string): Dict {
        for (let i = 0; i < stats.length; i++) {
            const entry = stats[i];
            const name = this.safeString2 (entry, 'marketName', 'symbol');
            if (name === marketId) {
                return entry;
            }
        }
        return {};
    }

    /**
     * @method
     * @name drift#fetchTickers
     * @description fetches a price ticker for a specific symbol
     * @param {string} [symbols] unified market symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        const marketIds = this.marketIds (symbols);
        const depthParam = this.safeString (params, 'depth', '1'); // default is 1
        let depth = '';
        if (depthParam.indexOf (',') >= 0) {
            depth = depthParam;
        } else {
            const depths = [];
            for (let i = 0; i < marketIds.length; i++) {
                depths.push (depthParam);
            }
            depth = depths.join (',');
        }
        params = this.omit (params, 'depth');
        const request: Dict = {
            'marketName': marketIds.join (','),
            'depth': depth,
        };
        const promises = [
            this.dlobGetBatchL2 (this.extend (request, params)),
            this.publicGetStatsMarkets (),
        ];
        const responses = await Promise.all (promises);
        const statsArray = this.safeValue (responses[1], 'markets', []);
        const statsById: Dict = {};
        for (let i = 0; i < statsArray.length; i++) {
            const s = statsArray[i];
            const name = this.safeString2 (s, 'marketName', 'symbol');
            if (name !== undefined) {
                statsById[name] = s;
            }
        }
        const result: Dict = {};
        const books = this.safeValue (responses[0], 'l2s', responses[0]);
        let booksArray = [];
        if (Array.isArray (books)) {
            booksArray = books;
        } else {
            const bookKeys = Object.keys (books);
            for (let i = 0; i < bookKeys.length; i++) {
                const key = bookKeys[i];
                const entry = books[key];
                if (entry === undefined) {
                    booksArray.push ({ 'marketName': key });
                } else {
                    entry['marketName'] = this.safeString (entry, 'marketName', key);
                    booksArray.push (entry);
                }
            }
        }
        for (let i = 0; i < booksArray.length; i++) {
            const book = booksArray[i];
            const marketId = this.safeString2 (book, 'marketName', 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const bids = this.safeList (book, 'bids');
            const asks = this.safeList (book, 'asks');
            let bidPrice = undefined;
            let bidVolume = undefined;
            let askPrice = undefined;
            let askVolume = undefined;
            if (Array.isArray (bids)) {
                const bestBid = this.parseBidAsk (bids[0]);
                bidPrice = bestBid[0];
                bidVolume = bestBid[1];
            }
            if (Array.isArray (asks)) {
                const bestAsk = this.parseBidAsk (asks[0]);
                askPrice = bestAsk[0];
                askVolume = bestAsk[1];
            }
            const marketStats = this.safeValue (statsById, marketId, {});
            const last = this.safeNumber (marketStats, 'price');
            const priceHighObj = this.safeValue (marketStats, 'priceHigh');
            const priceLowObj = this.safeValue (marketStats, 'priceLow');
            const priceHigh = this.safeNumber (priceHighObj, 'fill');
            const priceLow = this.safeNumber (priceLowObj, 'fill');
            const ts = this.safeInteger (book, 'ts');
            result[symbol] = this.safeTicker (
                {
                    'symbol': symbol,
                    'timestamp': ts,
                    'datetime': this.iso8601 (ts),
                    'high': priceHigh,
                    'low': priceLow,
                    'bid': bidPrice,
                    'bidVolume': bidVolume,
                    'ask': askPrice,
                    'askVolume': askVolume,
                    'close': last,
                    'last': last,
                    'change': this.safeNumber (marketStats, 'priceChange24h'),
                    'percentage': this.safeNumber (marketStats, 'price24hChangePct'),
                    'baseVolume': this.safeNumber (marketStats, 'baseVolume'),
                    'quoteVolume': this.safeNumber (marketStats, 'quoteVolume'),
                    'markPrice': this.safeNumber (marketStats, 'markPrice'),
                    'info': this.deepExtend (book, marketStats),
                },
                market
            );
        }
        return result;
    }

    parseTicker (ticker: Dict, market: Market = undefined): Ticker {
        const timestamp = this.safeInteger (ticker, 'timestamp');
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        return this.safeTicker (
            {
                'symbol': symbol,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'high': this.safeString (ticker, 'high'),
                'low': this.safeString (ticker, 'low'),
                'bid': this.safeString (ticker, 'bid'),
                'bidVolume': undefined,
                'ask': this.safeString (ticker, 'ask'),
                'askVolume': this.safeString (ticker, 'askVolume'),
                'vwap': this.safeString (ticker, 'vwap'),
                'open': this.safeString (ticker, 'open'),
                'close': this.safeString (ticker, 'last'),
                'last': this.safeString (ticker, 'last'),
                'previousClose': undefined,
                'change': this.safeString (ticker, 'change'),
                'percentage': this.safeString (ticker, 'percentage'),
                'average': undefined,
                'baseVolume': this.safeString (ticker, 'volume'),
                'quoteVolume': this.safeString (ticker, 'quoteVolume'),
                'info': ticker,
            },
            market
        );
    }

    /**
     * @method
     * @name drift#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'marketName': market['id'],
        };
        if (limit !== undefined) {
            request['depth'] = Math.min (limit, 100);
        }
        const response = await this.dlobGetL2 (this.extend (request, params));
        //
        // {
        //     "bids": [
        //         {
        //             "price": "1896967924",
        //             "size": "207000000",
        //             "sources": {
        //                 "dlob": "207000000"
        //             }
        //         }
        //     ],
        //     "asks": [
        //         {
        //             "price": "1900240000",
        //             "size": "2631000000",
        //             "sources": {
        //                 "vamm": "2631000000"
        //             }
        //         }
        //     ],
        //     "marketName": "ETH-PERP",
        //     "marketType": "perp",
        //     "marketIndex": 2,
        //     "ts": 1770340556873,
        //     "slot": 398339101,
        //     "markPrice": "1898603962",
        //     "bestBidPrice": "1896967924",
        //     "bestAskPrice": "1900240000",
        //     "spreadPct": "172341",
        //     "spreadQuote": "3272076",
        //     "oracle": 1900078085,
        //     "oracleData": {
        //         "price": "1900078085",
        //         "slot": "398339102",
        //         "confidence": "89869",
        //         "hasSufficientNumberOfDataPoints": true,
        //         "twap": "1900078085",
        //         "twapConfidence": "1900078085"
        //     },
        //     "mmOracleData": {
        //         "price": "1900304417",
        //         "slot": "398339102",
        //         "confidence": "316201",
        //         "hasSufficientNumberOfDataPoints": true
        //     },
        //     "marketSlot": 398339102
        // }
        //
        const timestamp = this.safeInteger (response, 'ts');
        const bids = this.safeValue (response, 'bids', []);
        const asks = this.safeValue (response, 'asks', []);
        return this.parseOrderBook (
            {
                'bids': bids,
                'asks': asks,
                'timestamp': timestamp,
            },
            symbol,
            timestamp
        );
    }

    parseBidAsk (bidask, priceKey: IndexType = 0, amountKey: IndexType = 1, countOrIdKey: IndexType = 2) {
        const rawPrice = this.safeString (bidask, 'price');
        const rawAmount = this.safeString (bidask, 'size');
        const price = (rawPrice === undefined) ? undefined : this.parseNumber (Precise.stringDiv (rawPrice, '1000000'));
        const amount = (rawAmount === undefined) ? undefined : this.parseNumber (Precise.stringDiv (rawAmount, '1000000000'));
        const result = [ price, amount ];
        return result;
    }

    /**
     * @method
     * @name drift#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTrades', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Trade[];
        }
        const market = this.market (symbol);
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const request: Dict = {
            'symbol': market['id'],
        };
        const response = await this.publicGetMarketSymbolTrades (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770340611,
        //             "txSig": "4VYnTYbXYvxRd7s55b8xNVSQBRP5AzoxQEqd8dfdZ47LVKYTTdnjRGX9eQdDLSWsGnqmx6KCtYVi6pLzt6Jx6uhL",
        //             "txSigIndex": 2,
        //             "slot": 398339247,
        //             "fillerReward": "0.000000",
        //             "baseAssetAmountFilled": "15.000000000",
        //             "quoteAssetAmountFilled": "28327.650000",
        //             "takerFee": "19.829356",
        //             "makerRebate": "-0.991467",
        //             "referrerReward": "0.000000",
        //             "quoteAssetAmountSurplus": "0.000000",
        //             "takerOrderBaseAssetAmount": "15.000000000",
        //             "takerOrderCumulativeBaseAssetAmountFilled": "15.000000000",
        //             "takerOrderCumulativeQuoteAssetAmountFilled": "28327.650000",
        //             "makerOrderBaseAssetAmount": "15.000000000",
        //             "makerOrderCumulativeBaseAssetAmountFilled": "15.000000000",
        //             "makerOrderCumulativeQuoteAssetAmountFilled": "28327.650000",
        //             "oraclePrice": "1889.139752",
        //             "makerFee": "-0.991467",
        //             "action": "fill",
        //             "actionExplanation": "orderFilledWithMatchJit",
        //             "marketIndex": 2,
        //             "marketType": "perp",
        //             "filler": "6McRjTd6iKrUSvzQewoMhrnEkcgZfrZPsXcTexihb9p6",
        //             "fillRecordId": "5987735",
        //             "taker": "AMJ56PZC1KwUw8HvCenf6dPieuJKM4XEamHE7Mw8aoy2",
        //             "takerOrderId": "493",
        //             "takerOrderDirection": "short",
        //             "maker": "6McRjTd6iKrUSvzQewoMhrnEkcgZfrZPsXcTexihb9p6",
        //             "makerOrderId": "46304664",
        //             "makerOrderDirection": "long",
        //             "spotFulfillmentMethodFee": "0.000000",
        //             "marketFilter": "perp",
        //             "symbol": "ETH-PERP",
        //             "bitFlags": 1,
        //             "takerExistingQuoteEntryAmount": "27211.200000",
        //             "takerExistingBaseAssetAmount": "",
        //             "makerExistingQuoteEntryAmount": "",
        //             "makerExistingBaseAssetAmount": ""
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": "eyJwayI6Ik1BUktFVCNFVEgtUEVSUCIsInNrIjoiVFJBREUjVFMjMTc3MDM0MDI4NSNTTE9UIzM5ODMzODQwNSNTSUcjM2VHVzREcEJOc1djVFFjRHpQbVdmejVwTXBxOURMTFNEUkZhOXc5bWU5Q1ZlaEduWXVKTHVQeG95ek5nSnpVNWJIZGZha2NrMm90cUhDQXNXVHN6cEVQUCNJTkRFWCMwMDAwOCJ9"
        //     }
        // }
        //
        const trades = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (trades)) && (nextPage !== undefined)) {
            trades[0]['nextPage'] = nextPage;
        }
        return this.parseTrades (trades, market, limit);
    }

    /**
     * @method
     * @name drift#fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} [symbol] unified market symbol to fetch trades for, required by some exchanges
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async fetchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchMyTrades', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Trade[];
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        let market = undefined;
        let method = 'publicGetUserAccountIdTrades';
        if (symbol !== undefined) {
            market = this.market (symbol);
            method = 'publicGetUserAccountIdTradesSymbol';
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const response = await this[method] (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770000777,
        //             "txSig": "",
        //             "txSigIndex": 0,
        //             "slot": 398000661,
        //             "fillerReward": "0.000330",
        //             "baseAssetAmountFilled": "0.005000000",
        //             "quoteAssetAmountFilled": "9.440000",
        //             "takerFee": "0.003304",
        //             "makerRebate": "-0.000236",
        //             "referrerReward": "0.000000",
        //             "quoteAssetAmountSurplus": "0.000000",
        //             "takerOrderBaseAssetAmount": "0.005000000",
        //             "takerOrderCumulativeBaseAssetAmountFilled": "0.005000000",
        //             "takerOrderCumulativeQuoteAssetAmountFilled": "9.440000",
        //             "makerOrderBaseAssetAmount": "0.140000000",
        //             "makerOrderCumulativeBaseAssetAmountFilled": "0.046000000",
        //             "makerOrderCumulativeQuoteAssetAmountFilled": "86.848000",
        //             "oraclePrice": "1887.217373",
        //             "makerFee": "-0.000236",
        //             "action": "fill",
        //             "actionExplanation": "orderFilledWithMatch",
        //             "marketIndex": 2,
        //             "marketType": "perp",
        //             "filler": "",
        //             "fillRecordId": "5986044",
        //             "taker": "",
        //             "takerOrderId": "2",
        //             "takerOrderDirection": "short",
        //             "maker": "",
        //             "makerOrderId": "1793",
        //             "makerOrderDirection": "long",
        //             "spotFulfillmentMethodFee": "0.000000",
        //             "marketFilter": "perp",
        //             "user": "",
        //             "symbol": "ETH-PERP",
        //             "bitFlags": 0,
        //             "takerExistingQuoteEntryAmount": "",
        //             "takerExistingBaseAssetAmount": "",
        //             "makerExistingQuoteEntryAmount": "9.400000",
        //             "makerExistingBaseAssetAmount": ""
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": null
        //     }
        // }
        //
        const trades = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (trades)) && (nextPage !== undefined)) {
            trades[0]['nextPage'] = nextPage;
        }
        return this.parseTrades (trades, market, limit);
    }

    parseTrade (trade: Dict, market: Market = undefined): Trade {
        const timestamp = this.safeTimestamp (trade, 'ts');
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const accountId = this.safeString2 (this.options, 'accountId', 'account_id', this.accountId);
        const takerAccount = this.safeString (trade, 'taker');
        const makerAccount = this.safeString (trade, 'maker');
        let takerOrMaker = undefined;
        if (accountId !== undefined) {
            if (accountId === takerAccount) {
                takerOrMaker = 'taker';
            } else if (accountId === makerAccount) {
                takerOrMaker = 'maker';
            }
        }
        const directionKey = (takerOrMaker === 'maker') ? 'makerOrderDirection' : 'takerOrderDirection';
        const direction = this.safeStringLower (trade, directionKey);
        const side = (direction === 'long') ? 'buy' : 'sell';
        const amountString = this.safeString (trade, 'baseAssetAmountFilled');
        const costString = this.safeString (trade, 'quoteAssetAmountFilled');
        const priceString = Precise.stringDiv (costString, amountString);
        let feeCostString = undefined;
        if (takerOrMaker === 'maker') {
            feeCostString = this.safeString (trade, 'makerFee');
        } else {
            feeCostString = this.safeString (trade, 'takerFee');
        }
        let fee = undefined;
        if (feeCostString !== undefined) {
            fee = {
                'cost': feeCostString,
                'currency': (market !== undefined) ? this.safeCurrencyCode (market['quote']) : 'USDC',
            };
        }
        const orderIdKey = (takerOrMaker === 'maker') ? 'makerOrderId' : 'takerOrderId';
        const orderId = this.safeString (trade, orderIdKey);
        return this.safeTrade (
            {
                'info': trade,
                'amount': amountString,
                'datetime': this.iso8601 (timestamp),
                'id': this.safeString (trade, 'fillRecordId'),
                'price': priceString,
                'timestamp': timestamp,
                'symbol': symbol,
                'side': side,
                'cost': costString,
                'fee': fee,
                'order': orderId,
                'takerOrMaker': takerOrMaker,
            },
            market
        );
    }

    /**
     * @method
     * @name drift#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, close price, and volume
     * @param {string} symbol unified symbol of the market to fetch OHLCV for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {OHLCV[]} A list of OHLCV data in an array [timestamp, open, high, low, close, volume]
     */
    async fetchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const resolution = this.safeString (this.timeframes, timeframe);
        if (resolution === undefined) {
            throw new NotSupported (this.id + ' fetchOHLCV() does not support timeframe ' + timeframe);
        }
        const request: Dict = {
            'symbol': market['id'],
            'resolution': resolution,
        };
        if (since !== undefined) {
            request['endTs'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = Math.min (limit, 1000);
        }
        const response = await this.publicGetMarketSymbolCandlesResolution (
            this.extend (request, params)
        );
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1769904000,
        //             "fillOpen": 2448.341584,
        //             "fillHigh": 2472.25,
        //             "fillClose": 1891.22,
        //             "fillLow": 1743.59,
        //             "oracleOpen": 2448.478142,
        //             "oracleHigh": 2473.10011,
        //             "oracleClose": 1892.258333,
        //             "oracleLow": 1746.921599,
        //             "quoteVolume": 166995196.877037,
        //             "baseVolume": 75911.612
        //         }
        //     ]
        // }
        //
        const candles = this.safeValue (response, 'records', response);
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        return [
            this.safeTimestamp (ohlcv, 'ts'),
            this.safeNumber (ohlcv, 'fillOpen'),
            this.safeNumber (ohlcv, 'fillHigh'),
            this.safeNumber (ohlcv, 'fillLow'),
            this.safeNumber (ohlcv, 'fillClose'),
            this.safeNumber (ohlcv, 'quoteVolume'),
        ];
    }

    /**
     * @method
     * @name drift#fetchOrder
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
        };
        const response = await this.publicGetUserAccountIdOrdersIdOrderId (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "record": {
        //         "ts": 1770009167,
        //         "txSig": "",
        //         "txSigIndex": 1,
        //         "slot": 397477413,
        //         "user": "=",
        //         "status": "open",
        //         "orderType": "oracle",
        //         "marketType": "perp",
        //         "orderId": 1,
        //         "userOrderId": 0,
        //         "marketIndex": 0,
        //         "price": "0",
        //         "baseAssetAmount": "0.01",
        //         "quoteAssetAmount": "0",
        //         "baseAssetAmountFilled": "0.01",
        //         "quoteAssetAmountFilled": "0.993918",
        //         "direction": "short",
        //         "reduceOnly": false,
        //         "triggerPrice": "0",
        //         "triggerCondition": "above",
        //         "existingPositionDirection": "long",
        //         "postOnly": false,
        //         "immediateOrCancel": false,
        //         "oraclePriceOffset": "-0.189943",
        //         "auctionDuration": 20,
        //         "auctionStartPrice": "-0.0539",
        //         "auctionEndPrice": "-0.1899",
        //         "maxTs": 1770009197,
        //         "marketFilter": "perp",
        //         "symbol": "SOL-PERP",
        //         "lastActionStatus": "filled",
        //         "lastActionExplanation": "orderFilledWithMatch",
        //         "lastUpdatedTs": 1770009171,
        //         "cumulativeFee": "0.000348"
        //     }
        // }
        //
        const record = this.safeDict (response, 'record', {});
        if (record['orderId'] === undefined) {
            throw new OrderNotFound (this.id + ' fetchOrder() returned empty response');
        }
        return this.parseOrder (record);
    }

    /**
     * @method
     * @name drift#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum amount of orders to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOrders', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchOrders', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as Order[];
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        let market = undefined;
        let method = 'publicGetUserAccountIdOrdersPerp';
        if (symbol !== undefined) {
            market = this.market (symbol);
            method = 'publicGetUserAccountIdOrdersPerpSymbol';
            request['symbol'] = market['id'];
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const response = await (this as any)[method] (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770001166,
        //             "txSig": "",
        //             "txSigIndex": 1,
        //             "slot": 398990651,
        //             "user": "",
        //             "status": "open",
        //             "orderType": "oracle",
        //             "marketType": "perp",
        //             "orderId": 5,
        //             "userOrderId": 1,
        //             "marketIndex": 0,
        //             "price": "0.000000",
        //             "baseAssetAmount": "0.010000000",
        //             "quoteAssetAmount": "0.000000",
        //             "baseAssetAmountFilled": "0.010000000",
        //             "quoteAssetAmountFilled": "0.769870",
        //             "direction": "long",
        //             "reduceOnly": false,
        //             "triggerPrice": "0.000000",
        //             "triggerCondition": "above",
        //             "existingPositionDirection": "long",
        //             "postOnly": false,
        //             "immediateOrCancel": false,
        //             "oraclePriceOffset": "0.032413",
        //             "auctionDuration": 40,
        //             "auctionStartPrice": "-0.268200",
        //             "auctionEndPrice": "0.032400",
        //             "maxTs": 1770341196,
        //             "marketFilter": "perp",
        //             "symbol": "SOL-PERP",
        //             "lastActionStatus": "filled",
        //             "lastActionExplanation": "orderFilledWithMatch",
        //             "lastUpdatedTs": 1770001166,
        //             "cumulativeFee": "0.000270"
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": null
        //     }
        // }
        //
        const orders = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (orders)) && (nextPage !== undefined)) {
            orders[0]['nextPage'] = nextPage;
        }
        return this.parseOrders (orders, market, since, limit);
    }

    /**
     * @method
     * @name drift#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum amount of orders to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.safeMarket (symbol);
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        //
        // {
        //     "account": {
        //         "balance": "30.160985",
        //         "totalCollateral": "30.143451",
        //         "freeCollateral": "28.884414",
        //         "health": "99",
        //         "initialMargin": "1.259037",
        //         "maintenanceMargin": "0.212363",
        //         "leverage": "0.339"
        //     },
        //     "positions": [],
        //     "balances": [],
        //     "orders": []
        // }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    parseOrder (order: Dict, market: Market = undefined): Order {
        const id = this.safeString (order, 'orderId');
        const timestamp = this.safeTimestamp (order, 'ts');
        const direction = this.safeStringLower (order, 'direction');
        const side = (direction === 'long') ? 'buy' : 'sell';
        const amount = Precise.stringAbs (this.safeString (order, 'baseAssetAmount'));
        const filled = Precise.stringAbs (this.safeString (order, 'baseAssetAmountFilled'));
        const remaining = Precise.stringSub (amount, filled);
        const status = this.parseOrderStatus (this.safeString2 (order, 'lastActionStatus', 'status'));
        const cost = this.safeString2 (order, 'cost', 'quoteAssetAmountFilled');
        const triggerPrice = this.safeInteger (order, 'triggerPrice');
        const triggerDirection = this.safeValue (order, 'triggerCondition');
        const immediateOrCancel = this.safeBool (order, 'immediateOrCancel');
        const timeInForce = immediateOrCancel ? 'IOC' : 'GTC';
        const feeCost = this.safeNumber (order, 'cumulativeFee');
        const feeCurrencyId = (market !== undefined) ? market['quote'] : 'USDC';
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        let fee = undefined;
        if (feeCost === undefined) {
            fee = {
                'cost': feeCost,
                'currency': feeCurrency,
            };
        }
        const symbol = this.safeString (order, 'symbol');
        return this.safeOrder (
            {
                'info': order,
                'id': id,
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
                'symbol': this.safeSymbol (symbol, market),
                'type': this.parseOrderType (this.safeString (order, 'orderType')),
                'postOnly': this.safeValue (order, 'postOnly', false),
                'reduceOnly': this.safeValue (order, 'reduceOnly', false),
                'side': side,
                'price': this.safeString (order, 'price'),
                'triggerPrice': triggerPrice,
                'triggerDirection': triggerDirection,
                'amount': amount,
                'cost': cost,
                'average': undefined,
                'filled': filled,
                'remaining': remaining,
                'status': status,
                'fee': fee,
                'fees': (fee === undefined) ? undefined : [ fee ],
                'timeInForce': timeInForce,
                'lastUpdateTimestamp': this.safeTimestamp (order, 'lastUpdatedTs'),
            },
            market
        );
    }

    parseOrderStatus (status: Str): string {
        const statuses: Dict = {
            'partial_fill_cancelled': 'canceled',
            'cancelled': 'canceled',
            'partial_fill': 'open',
            'filled': 'closed',
            'open': 'open',
            'expired': 'expired',
            'trigger': 'open',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrderType (type: Str): string {
        const types: Dict = {
            'oracle': 'market',
            'triggerMarket': 'market',
            'triggerLimit': 'limit',
        };
        return this.safeString (types, type, type);
    }

    /**
     * @method
     * @name drift#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async fetchBalance (params = {}): Promise<Balances> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        //
        // {
        //     "account": {
        //         "balance": "30.160985",
        //         "totalCollateral": "30.143451",
        //         "freeCollateral": "28.884414",
        //         "health": "99",
        //         "initialMargin": "1.259037",
        //         "maintenanceMargin": "0.212363",
        //         "leverage": "0.339"
        //     },
        //     "positions": [],
        //     "balances": [],
        //     "orders": []
        // }
        //
        return this.parseBalance (response);
    }

    parseBalance (response: any): Balances {
        const result: Dict = {
            'info': response,
            'timestamp': undefined,
            'datetime': undefined,
        };
        const balances = this.safeValue (response, 'balances', []);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'symbol');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            const total = this.safeString (balance, 'balance');
            const used = this.safeString (balance, 'openOrders');
            const free = (total !== undefined && used !== undefined) ? Precise.stringSub (total, used) : total;
            account['free'] = free;
            account['used'] = used;
            account['total'] = total;
            result[code] = account;
        }
        return this.safeBalance (result);
    }

    /**
     * @method
     * @name drift#fetchPositions
     * @description fetch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    async fetchPositions (symbols: Strings = undefined, params = {}): Promise<Position[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountId (this.extend (request, params));
        const rawPositions = this.safeList (response, 'positions', []);
        //
        // {
        //     "account": {
        //         "balance": "30.160985",
        //         "totalCollateral": "30.143451",
        //         "freeCollateral": "28.884414",
        //         "health": "99",
        //         "initialMargin": "1.259037",
        //         "maintenanceMargin": "0.212363",
        //         "leverage": "0.339"
        //     },
        //     "positions": [],
        //     "balances": [],
        //     "orders": []
        // }
        //
        const positions = this.parsePositions (rawPositions, symbols, params);
        return this.filterByArrayPositions (positions, 'symbol', symbols, false);
    }

    /**
     * Parse a single position entry
     * @param {object} position raw position structure from the exchange
     * @param {object} [market] unified market structure
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    parsePosition (position: Dict, market: Market = undefined): Position {
        const marketId = this.safeString (position, 'symbol');
        market = this.safeMarket (marketId, market);
        const contracts = this.safeNumber (position, 'baseAssetAmount');
        let side = undefined;
        if (contracts !== undefined) {
            if (contracts > 0) {
                side = 'long';
            } else if (contracts < 0) {
                side = 'short';
            }
        }
        const quoteEntryAmountAbs = Precise.stringAbs (this.safeString (position, 'quoteEntryAmount'));
        const baseAssetAmountAbs = Precise.stringAbs (this.safeString (position, 'baseAssetAmount'));
        let entryPriceString = undefined;
        let entryPrice = undefined;
        if (quoteEntryAmountAbs !== undefined && baseAssetAmountAbs !== undefined && Precise.stringGt (baseAssetAmountAbs, '0')) {
            entryPriceString = Precise.stringDiv (quoteEntryAmountAbs, baseAssetAmountAbs);
            entryPrice = this.parseNumber (entryPriceString);
        }
        const liquidationPrice = this.safeNumber (position, 'liquidationPrice');
        return this.safePosition ({
            'info': position,
            'symbol': this.safeSymbol (marketId),
            'contracts': contracts,
            'side': side,
            'notional': (quoteEntryAmountAbs === undefined) ? undefined : this.parseNumber (quoteEntryAmountAbs),
            'entryPrice': entryPrice,
            'liquidationPrice': liquidationPrice,
        });
    }

    /**
     * @method
     * @name drift#fetchFundingHistory
     * @description fetches the history of funding payments for swap positions
     * @param symbol
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding payments to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {FundingHistory[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<FundingHistory[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchFundingHistory', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchFundingHistory', symbol, since, limit, params, 'nextPage', 'page', undefined, 50) as FundingHistory[];
        }
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountIdFundingPayments (this.extend (request, params));
        //
        // {
        //     "success": true,
        //     "records": [
        //         {
        //             "ts": 1770364868,
        //             "txSig": "",
        //             "txSigIndex": 11,
        //             "slot": 398401341,
        //             "userAuthority": "",
        //             "user": "",
        //             "marketIndex": 2,
        //             "fundingPayment": "-0.000210",
        //             "baseAssetAmount": "-0.005000000",
        //             "userLastCumulativeFunding": "1180.879259069",
        //             "ammCumulativeFundingLong": "1180.889121710",
        //             "ammCumulativeFundingShort": "1180.837256569"
        //         }
        //     ],
        //     "meta": {
        //         "nextPage": "eyJzayxxxxIn0="
        //     }
        // }
        //
        const payments = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (payments)) && (nextPage !== undefined)) {
            payments[0]['nextPage'] = nextPage;
        }
        return this.parseIncomes (payments, market, since, limit);
    }

    parseIncome (payment, market: Market = undefined): Dict {
        const timestamp = this.safeTimestamp (payment, 'ts');
        const marketIndex = this.safeInteger (payment, 'marketIndex');
        let marketId = undefined;
        if (marketIndex !== undefined) { // todo add symbol to funding records
            const markets = this.toArray (this.markets);
            for (let i = 0; i < markets.length; i++) {
                const m = markets[i];
                if (!this.safeBool (m, 'swap', false)) {
                    continue;
                }
                const info = this.safeValue (m, 'info', {});
                const mIndex = this.safeInteger (info, 'marketIndex');
                if (mIndex === marketIndex) {
                    marketId = this.safeString (m, 'id');
                    break;
                }
            }
        }
        const symbol = this.safeSymbol (marketId, market, undefined, 'swap');
        const txSigIndex = this.safeString (payment, 'txSigIndex');
        return {
            'info': payment,
            'symbol': symbol,
            'code': 'USDC',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': txSigIndex,
            'amount': this.safeNumber (payment, 'fundingPayment'),
        };
    }

    /**
     * @method
     * @name drift#fetchTransactions
     * @description fetch history of deposits and withdrawals
     * @param {string} [code] unified currency code for the currency of the transactions
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of transactions to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async fetchTransactions (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTransactions', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchTransactions', code, since, limit, params, 'nextPage', 'page', undefined, 50) as Transaction[];
        }
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountIdDeposits (this.extend (request, params));
        const txs = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (txs)) && (nextPage !== undefined)) {
            txs[0]['nextPage'] = nextPage;
        }
        return this.parseTransactions (txs, currency, since, limit);
    }

    parseTransaction (transaction: Dict, currency: Currency = undefined): Transaction {
        const timestamp = this.safeTimestamp (transaction, 'ts');
        const currencyId = this.safeString (transaction, 'symbol');
        const code = this.safeCurrencyCode (currencyId, currency);
        const direction = this.safeStringLower (transaction, 'direction');
        let type = undefined;
        if (direction === 'deposit') {
            type = 'deposit';
        } else if (direction === 'withdraw' || direction === 'withdrawal') {
            type = 'withdrawal';
        }
        const amountString = this.safeString (transaction, 'amount');
        const amount = this.parseNumber (amountString);
        return {
            'info': transaction,
            'id': code + '-' + this.safeString (transaction, 'depositRecordId'),
            'txid': this.safeString (transaction, 'txSig'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'addressFrom': undefined,
            'addressTo': undefined,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': type,
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'comment': this.safeString (transaction, 'explanation'),
            'internal': undefined,
        };
    }

    parseLedgerEntry (entry: Dict, currency: Currency = undefined): LedgerEntry {
        const timestamp = this.safeTimestamp (entry, 'ts');
        const marketId = this.safeString (entry, 'marketIndex');
        const market = this.safeMarket (marketId);
        const currencyId = (market !== undefined) ? market['quote'] : undefined;
        const code = this.safeCurrencyCode (currencyId, currency);
        const amount = this.parseNumber (this.safeString (entry, 'pnl'));
        let direction = undefined;
        if (amount !== undefined) {
            if (amount > 0) {
                direction = 'in';
            } else if (amount < 0) {
                direction = 'out';
            }
        }
        return {
            'info': entry,
            'id': this.safeString (entry, 'txSig'),
            'direction': direction,
            'account': this.safeString (entry, 'user'),
            'referenceId': this.safeString (entry, 'txSig'),
            'type': 'pnl',
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': 'ok',
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    /**
     * @method
     * @name drift#fetchLedger
     * @description fetch the history of changes in balance
     * @param {string} [code] unified currency code for the currency of the transactions
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] the maximum number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {LedgerEntry[]} a list of [ledger entries]{@link https://docs.ccxt.com/#/?id=ledger-structure}
     */
    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<LedgerEntry[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallCursor ('fetchLedger', code, since, limit, params, 'nextPage', 'page', undefined, 50) as LedgerEntry[];
        }
        code = 'USDC'; // Everything settled in USDC
        const currency = this.currency ('USDC');
        if (limit !== undefined) {
            limit = Math.min (limit, 100);
        }
        const request: Dict = {
            'accountId': this.accountId,
        };
        const response = await this.publicGetUserAccountIdSettlePnl (this.extend (request, params));
        const entries = this.safeList (response, 'records');
        const meta = this.safeDict (response, 'meta');
        const nextPage = this.safeString (meta, 'nextPage');
        if ((Array.isArray (entries)) && (nextPage !== undefined)) {
            entries[0]['nextPage'] = nextPage;
        }
        return this.parseLedger (entries, currency, since, limit);
    }

    /**
     * @method
     * @name drift#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const market = this.market (symbol);
        const direction = (side === 'buy') ? 'long' : 'short';
        const request: Dict = {
            'accountId': this.accountId,
            'symbol': market['id'],
            'direction': direction,
            'amount': this.amountToPrecision (symbol, amount),
            'orderType': type,
        };
        const lowerType = type.toLowerCase ();
        if (lowerType === 'limit') {
            if (price === undefined) {
                throw new ExchangeError (this.id + ' createOrder() requires a price argument for limit orders');
            }
            request['price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.publicPostTxOrderPlace (
            this.extend (request, params)
        );
        await this.executeTx (response['tx']);
        return this.parseOrder (response, market);
    }

    /**
     * @method
     * @name drift#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrder (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
            'orderId': id,
        };
        const response = await this.publicPostTxOrderCancel (this.extend (request, params));
        await this.executeTx (response['tx']);
        return this.safeOrder ({
            'id': id,
            'clientOrderId': undefined,
            'info': response,
            'symbol': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'status': 'canceled',
            'side': undefined,
            'price': undefined,
            'amount': undefined,
            'filled': undefined,
            'remaining': undefined,
            'type': undefined,
        });
    }

    /**
     * @method
     * @name drift#cancelAllOrders
     * @description cancel all open orders in a market
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrders (symbol: Str = undefined, params = {}): Promise<Order[]> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbol'] = market['id'];
        }
        const response = await this.publicPostTxOrderCancel (this.extend (request, params));
        await this.executeTx (response['tx']);
        return response;
    }

    /**
     * @method
     * @name drift#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Transaction} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    async withdraw (code: string, amount: number, address: string, tag: Str = undefined, params = {}): Promise<Transaction> {
        this.checkRequiredCredentials ();
        await this.loadMarkets ();
        const request: Dict = {
            'accountId': this.accountId,
            'amount': amount,
            'symbol': code,
        };
        const response = await this.publicPostTxWithdraw (this.extend (request));
        await this.executeTx (response['tx']);
        return {
            'info': response,
            'id': undefined,
            'txid': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'address': this.accountId,
            'addressFrom': undefined,
            'addressTo': this.accountId,
            'tag': undefined,
            'tagFrom': undefined,
            'tagTo': undefined,
            'type': 'withdrawal',
            'amount': amount,
            'currency': code,
            'status': 'ok',
            'updated': undefined,
            'fee': undefined,
            'network': undefined,
            'comment': undefined,
            'internal': undefined,
        };
    }

    async executeTx (serializedTx: string): Promise<string> {
        this.checkRequiredCredentials ();
        const txBytes = this.base64ToBinary (serializedTx);
        const keyBytes = this.base58ToBinary (this.privateKey);
        const secretKey = keyBytes.slice (0, 32);
        const sigCount = this.parseToInt (txBytes[0]);
        const signaturesEnd = sigCount * 64 + 1;
        const messageBytes = txBytes.slice (signaturesEnd);
        const signatureBase64 = eddsa (messageBytes, secretKey, ed25519);
        const signatureBytes = this.base64ToBinary (signatureBase64);
        const signatureHex = this.binaryToBase16 (signatureBytes);
        const txHex = this.binaryToBase16 (txBytes);
        const txStart = signatureHex.length + 2;
        const txEnd = txHex.length + 0;
        const signedTxHex = txHex.slice (0, 2) + signatureHex + txHex.slice (txStart, txEnd);
        const signedTxBytes = this.base16ToBinary (signedTxHex);
        const signedTxBase64 = this.binaryToBase64 (signedTxBytes);
        const request: Dict = {
            'signedTx': signedTxBase64,
            'simulate': false,
        };
        const response = await this.publicPostTxExecute (request);
        //
        // {
        //     "success": true,
        //     "txSig": "xxxxx",
        //     "message": "Transaction executed successfully"
        // }
        //
        return this.safeString (response, 'txSig');
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public' || api === 'dlob') {
            if (method !== 'GET' && Object.keys (query).length) {
                body = this.json (query);
            } else if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
            headers = {
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any) {
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeString (response, 'error');
        const name = this.safeString (response, 'name');
        const codeValue = this.safeString (response, 'code');
        if (error !== undefined || name !== undefined || codeValue !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                error,
                feedback
            );
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                name,
                feedback
            );
            this.throwExactlyMatchedException (
                this.exceptions['exact'],
                codeValue,
                feedback
            );
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
