import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import { PerpetualLiquidationInfo, PerpetualLiquidationInfoSDKType } from "./liquidations.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/**
 * Represents the side of the orderbook the order will be placed on.
 * Note that Side.SIDE_UNSPECIFIED is an invalid order and cannot be
 * placed on the orderbook.
 */
export declare enum Order_Side {
    /** SIDE_UNSPECIFIED - Default value. This value is invalid and unused. */
    SIDE_UNSPECIFIED = 0,
    /** SIDE_BUY - SIDE_BUY is used to represent a BUY order. */
    SIDE_BUY = 1,
    /** SIDE_SELL - SIDE_SELL is used to represent a SELL order. */
    SIDE_SELL = 2,
    UNRECOGNIZED = -1
}
export declare const Order_SideSDKType: typeof Order_Side;
export declare function order_SideFromJSON(object: any): Order_Side;
export declare function order_SideToJSON(object: Order_Side): string;
/**
 * TimeInForce indicates how long an order will remain active before it
 * is executed or expires.
 */
export declare enum Order_TimeInForce {
    /**
     * TIME_IN_FORCE_UNSPECIFIED - TIME_IN_FORCE_UNSPECIFIED represents the default behavior where an
     * order will first match with existing orders on the book, and any
     * remaining size will be added to the book as a maker order.
     */
    TIME_IN_FORCE_UNSPECIFIED = 0,
    /**
     * TIME_IN_FORCE_IOC - TIME_IN_FORCE_IOC enforces that an order only be matched with
     * maker orders on the book. If the order has remaining size after
     * matching with existing orders on the book, the remaining size
     * is not placed on the book.
     */
    TIME_IN_FORCE_IOC = 1,
    /**
     * TIME_IN_FORCE_POST_ONLY - TIME_IN_FORCE_POST_ONLY enforces that an order only be placed
     * on the book as a maker order. Note this means that validators will cancel
     * any newly-placed post only orders that would cross with other maker
     * orders.
     */
    TIME_IN_FORCE_POST_ONLY = 2,
    /**
     * TIME_IN_FORCE_FILL_OR_KILL - TIME_IN_FORCE_FILL_OR_KILL has been deprecated and will be removed in
     * future versions.
     */
    TIME_IN_FORCE_FILL_OR_KILL = 3,
    UNRECOGNIZED = -1
}
export declare const Order_TimeInForceSDKType: typeof Order_TimeInForce;
export declare function order_TimeInForceFromJSON(object: any): Order_TimeInForce;
export declare function order_TimeInForceToJSON(object: Order_TimeInForce): string;
export declare enum Order_ConditionType {
    /**
     * CONDITION_TYPE_UNSPECIFIED - CONDITION_TYPE_UNSPECIFIED represents the default behavior where an
     * order will be placed immediately on the orderbook.
     */
    CONDITION_TYPE_UNSPECIFIED = 0,
    /**
     * CONDITION_TYPE_STOP_LOSS - CONDITION_TYPE_STOP_LOSS represents a stop order. A stop order will
     * trigger when the oracle price moves at or above the trigger price for
     * buys, and at or below the trigger price for sells.
     */
    CONDITION_TYPE_STOP_LOSS = 1,
    /**
     * CONDITION_TYPE_TAKE_PROFIT - CONDITION_TYPE_TAKE_PROFIT represents a take profit order. A take profit
     * order will trigger when the oracle price moves at or below the trigger
     * price for buys and at or above the trigger price for sells.
     */
    CONDITION_TYPE_TAKE_PROFIT = 2,
    UNRECOGNIZED = -1
}
export declare const Order_ConditionTypeSDKType: typeof Order_ConditionType;
export declare function order_ConditionTypeFromJSON(object: any): Order_ConditionType;
export declare function order_ConditionTypeToJSON(object: Order_ConditionType): string;
/** OrderId refers to a single order belonging to a Subaccount. */
export interface OrderId {
    /**
     * The subaccount ID that opened this order.
     * Note that this field has `gogoproto.nullable = false` so that it is
     * generated as a value instead of a pointer. This is because the `OrderId`
     * proto is used as a key within maps, and map comparisons will compare
     * pointers for equality (when the desired behavior is to compare the values).
     */
    subaccountId?: SubaccountId;
    /**
     * The client ID of this order, unique with respect to the specific
     * sub account (I.E., the same subaccount can't have two orders with
     * the same ClientId).
     */
    clientId: number;
    /**
     * order_flags represent order flags for the order. This field is invalid if
     * it's greater than 257. Each bit represents a different flag.
     *
     * The following are the valid orderId flags:
     * ShortTerm    = uint32(0)
     * Conditional  = uint32(32)
     * LongTerm     = uint32(64)
     * Twap         = uint32(128)
     * TwapSuborder = uint32(256) (for internal use only)
     *
     * If both bits are set or bits other than the 2nd and 3rd are set, the order
     * ID is invalid.
     */
    orderFlags: number;
    /** ID of the CLOB the order is created for. */
    clobPairId: number;
}
/** OrderId refers to a single order belonging to a Subaccount. */
export interface OrderIdSDKType {
    subaccount_id?: SubaccountIdSDKType;
    client_id: number;
    order_flags: number;
    clob_pair_id: number;
}
/**
 * OrdersFilledDuringLatestBlock represents a list of `OrderIds` that were
 * filled by any non-zero amount in the latest block.
 */
export interface OrdersFilledDuringLatestBlock {
    /**
     * A list of unique order_ids that were filled by any non-zero amount in the
     * latest block.
     */
    orderIds: OrderId[];
}
/**
 * OrdersFilledDuringLatestBlock represents a list of `OrderIds` that were
 * filled by any non-zero amount in the latest block.
 */
export interface OrdersFilledDuringLatestBlockSDKType {
    order_ids: OrderIdSDKType[];
}
/**
 * PotentiallyPrunableOrders represents a list of orders that may be prunable
 * from state at a future block height.
 */
export interface PotentiallyPrunableOrders {
    /**
     * A list of unique order_ids that may potentially be pruned from state at a
     * future block height.
     */
    orderIds: OrderId[];
}
/**
 * PotentiallyPrunableOrders represents a list of orders that may be prunable
 * from state at a future block height.
 */
export interface PotentiallyPrunableOrdersSDKType {
    order_ids: OrderIdSDKType[];
}
/**
 * OrderFillState represents the fill amount of an order according to on-chain
 * state. This proto includes both the current on-chain fill amount of the
 * order, as well as the block at which this information can be pruned from
 * state.
 */
export interface OrderFillState {
    /** The current fillAmount of the order according to on-chain state. */
    fillAmount: Long;
    /**
     * The block height at which the fillAmount state for this order can be
     * pruned.
     */
    prunableBlockHeight: number;
}
/**
 * OrderFillState represents the fill amount of an order according to on-chain
 * state. This proto includes both the current on-chain fill amount of the
 * order, as well as the block at which this information can be pruned from
 * state.
 */
export interface OrderFillStateSDKType {
    fill_amount: Long;
    prunable_block_height: number;
}
/**
 * StatefulOrderTimeSliceValue represents the type of the value of the
 * `StatefulOrdersTimeSlice` in state. The `StatefulOrdersTimeSlice`
 * in state consists of key/value pairs where the keys are UTF-8-encoded
 * `RFC3339NANO` timestamp strings with right-padded zeroes and no
 * time zone info, and the values are of type `StatefulOrderTimeSliceValue`.
 * This `StatefulOrderTimeSliceValue` in state is used for managing stateful
 * order expiration. Stateful order expirations can be for either long term
 * or conditional orders.
 */
export interface StatefulOrderTimeSliceValue {
    /**
     * A unique list of order_ids that expire at this timestamp, sorted in
     * ascending order by block height and transaction index of each stateful
     * order.
     */
    orderIds: OrderId[];
}
/**
 * StatefulOrderTimeSliceValue represents the type of the value of the
 * `StatefulOrdersTimeSlice` in state. The `StatefulOrdersTimeSlice`
 * in state consists of key/value pairs where the keys are UTF-8-encoded
 * `RFC3339NANO` timestamp strings with right-padded zeroes and no
 * time zone info, and the values are of type `StatefulOrderTimeSliceValue`.
 * This `StatefulOrderTimeSliceValue` in state is used for managing stateful
 * order expiration. Stateful order expirations can be for either long term
 * or conditional orders.
 */
export interface StatefulOrderTimeSliceValueSDKType {
    order_ids: OrderIdSDKType[];
}
/**
 * LongTermOrderPlacement represents the placement of a stateful order in
 * state. It stores the stateful order itself and the `BlockHeight` and
 * `TransactionIndex` at which the order was placed.
 */
export interface LongTermOrderPlacement {
    order?: Order;
    /**
     * The block height and transaction index at which the order was placed.
     * Used for ordering by time priority when the chain is restarted.
     */
    placementIndex?: TransactionOrdering;
}
/**
 * LongTermOrderPlacement represents the placement of a stateful order in
 * state. It stores the stateful order itself and the `BlockHeight` and
 * `TransactionIndex` at which the order was placed.
 */
export interface LongTermOrderPlacementSDKType {
    order?: OrderSDKType;
    placement_index?: TransactionOrderingSDKType;
}
/**
 * TwapOrderPlacement represents the placement of a TWAP order in
 * the TWAP Order State. It will store the original parent TWAP order as
 * well as maintain the state of the remaining legs and quantums
 * to be executed.
 */
export interface TwapOrderPlacement {
    order?: Order;
    /** The number of legs remaining to be executed. */
    remainingLegs: number;
    /** The number of quantums remaining to be executed. */
    remainingQuantums: Long;
}
/**
 * TwapOrderPlacement represents the placement of a TWAP order in
 * the TWAP Order State. It will store the original parent TWAP order as
 * well as maintain the state of the remaining legs and quantums
 * to be executed.
 */
export interface TwapOrderPlacementSDKType {
    order?: OrderSDKType;
    remaining_legs: number;
    remaining_quantums: Long;
}
/**
 * ConditionalOrderPlacement represents the placement of a conditional order in
 * state. It stores the stateful order itself, the `BlockHeight` and
 * `TransactionIndex` at which the order was placed and triggered.
 */
export interface ConditionalOrderPlacement {
    order?: Order;
    /** The block height and transaction index at which the order was placed. */
    placementIndex?: TransactionOrdering;
    /**
     * The block height and transaction index at which the order was triggered.
     * Set to be nil if the transaction has not been triggered.
     * Used for ordering by time priority when the chain is restarted.
     */
    triggerIndex?: TransactionOrdering;
}
/**
 * ConditionalOrderPlacement represents the placement of a conditional order in
 * state. It stores the stateful order itself, the `BlockHeight` and
 * `TransactionIndex` at which the order was placed and triggered.
 */
export interface ConditionalOrderPlacementSDKType {
    order?: OrderSDKType;
    placement_index?: TransactionOrderingSDKType;
    trigger_index?: TransactionOrderingSDKType;
}
/**
 * Order represents a single order belonging to a `Subaccount`
 * for a particular `ClobPair`.
 */
export interface Order {
    /** The unique ID of this order. Meant to be unique across all orders. */
    orderId?: OrderId;
    side: Order_Side;
    /**
     * The size of this order in base quantums. Must be a multiple of
     * `ClobPair.StepBaseQuantums` (where `ClobPair.Id = orderId.ClobPairId`).
     */
    quantums: Long;
    /**
     * The price level that this order will be placed at on the orderbook,
     * in subticks. Must be a multiple of ClobPair.SubticksPerTick
     * (where `ClobPair.Id = orderId.ClobPairId`).
     */
    subticks: Long;
    /**
     * The last block this order can be executed at (after which it will be
     * unfillable). Used only for Short-Term orders. If this value is non-zero
     * then the order is assumed to be a Short-Term order.
     */
    goodTilBlock?: number;
    /**
     * good_til_block_time represents the unix timestamp (in seconds) at which a
     * stateful order will be considered expired. The
     * good_til_block_time is always evaluated against the previous block's
     * `BlockTime` instead of the block in which the order is committed. If this
     * value is non-zero then the order is assumed to be a stateful or
     * conditional order.
     */
    goodTilBlockTime?: number;
    /** The time in force of this order. */
    timeInForce: Order_TimeInForce;
    /**
     * Enforces that the order can only reduce the size of an existing position.
     * If a ReduceOnly order would change the side of the existing position,
     * its size is reduced to that of the remaining size of the position.
     * If existing orders on the book with ReduceOnly
     * would already close the position, the least aggressive (out-of-the-money)
     * ReduceOnly orders are resized and canceled first.
     */
    reduceOnly: boolean;
    /**
     * Set of bit flags set arbitrarily by clients and ignored by the protocol.
     * Used by indexer to infer information about a placed order.
     */
    clientMetadata: number;
    conditionType: Order_ConditionType;
    /**
     * conditional_order_trigger_subticks represents the price at which this order
     * will be triggered. If the condition_type is CONDITION_TYPE_UNSPECIFIED,
     * this value is enforced to be 0. If this value is nonzero, condition_type
     * cannot be CONDITION_TYPE_UNSPECIFIED. Value is in subticks.
     * Must be a multiple of ClobPair.SubticksPerTick (where `ClobPair.Id =
     * orderId.ClobPairId`).
     */
    conditionalOrderTriggerSubticks: Long;
    /**
     * twap_parameters represent the configuration for a TWAP order. This must be
     * set for twap orders and will be ignored for all other order types.
     */
    twapParameters?: TwapParameters;
    /**
     * builder_code_parameters is the metadata for the
     * partner or builder of an order specifying the fees charged.
     */
    builderCodeParameters?: BuilderCodeParameters;
    /**
     * order_router_address is the address of the order router that placed the
     * order.
     */
    orderRouterAddress: string;
}
/**
 * Order represents a single order belonging to a `Subaccount`
 * for a particular `ClobPair`.
 */
export interface OrderSDKType {
    order_id?: OrderIdSDKType;
    side: Order_Side;
    quantums: Long;
    subticks: Long;
    good_til_block?: number;
    good_til_block_time?: number;
    time_in_force: Order_TimeInForce;
    reduce_only: boolean;
    client_metadata: number;
    condition_type: Order_ConditionType;
    conditional_order_trigger_subticks: Long;
    twap_parameters?: TwapParametersSDKType;
    builder_code_parameters?: BuilderCodeParametersSDKType;
    order_router_address: string;
}
/** TwapParameters represents the necessary configuration for a TWAP order. */
export interface TwapParameters {
    /**
     * Duration of the TWAP order execution in seconds. Must be in the range
     * [300 (5 minutes), 86400 (24 hours)].
     */
    duration: number;
    /**
     * Interval in seconds for each suborder to execute. Must be a
     * whole number, a factor of the duration, and in the range
     * [30 (30 seconds), 3600 (1 hour)].
     */
    interval: number;
    /**
     * Price tolerance in ppm for each suborder. This will be applied to
     * the oracle price each time a suborder is triggered. Must be
     * be in the range [0, 1_000_000).
     */
    priceTolerance: number;
}
/** TwapParameters represents the necessary configuration for a TWAP order. */
export interface TwapParametersSDKType {
    duration: number;
    interval: number;
    price_tolerance: number;
}
/**
 * BuilderCodeParameters represents the metadata for the partner or builder of
 * an order. This allows them to specify a fee for providing there service which
 * will be paid out in the event of an order fill.
 */
export interface BuilderCodeParameters {
    /** The address of the builder to which the fee will be paid. */
    builderAddress: string;
    /** The fee enforced on the order in ppm. */
    feePpm: number;
}
/**
 * BuilderCodeParameters represents the metadata for the partner or builder of
 * an order. This allows them to specify a fee for providing there service which
 * will be paid out in the event of an order fill.
 */
export interface BuilderCodeParametersSDKType {
    builder_address: string;
    fee_ppm: number;
}
/**
 * TransactionOrdering represents a unique location in the block where a
 * transaction was placed. This proto includes both block height and the
 * transaction index that the specific transaction was placed. This information
 * is used for ordering by time priority when the chain is restarted.
 */
export interface TransactionOrdering {
    /** Block height in which the transaction was placed. */
    blockHeight: number;
    /** Within the block, the unique transaction index. */
    transactionIndex: number;
}
/**
 * TransactionOrdering represents a unique location in the block where a
 * transaction was placed. This proto includes both block height and the
 * transaction index that the specific transaction was placed. This information
 * is used for ordering by time priority when the chain is restarted.
 */
export interface TransactionOrderingSDKType {
    block_height: number;
    transaction_index: number;
}
/**
 * StreamLiquidationOrder represents an protocol-generated IOC liquidation
 * order. Used in full node streaming.
 */
export interface StreamLiquidationOrder {
    /** Information about this liquidation order. */
    liquidationInfo?: PerpetualLiquidationInfo;
    /**
     * CLOB pair ID of the CLOB pair the liquidation order will be matched
     * against.
     */
    clobPairId: number;
    /**
     * True if this is a buy order liquidating a short position, false if vice
     * versa.
     */
    isBuy: boolean;
    /** The number of base quantums for this liquidation order. */
    quantums: Long;
    /** The subticks this liquidation order will be submitted at. */
    subticks: Long;
}
/**
 * StreamLiquidationOrder represents an protocol-generated IOC liquidation
 * order. Used in full node streaming.
 */
export interface StreamLiquidationOrderSDKType {
    liquidation_info?: PerpetualLiquidationInfoSDKType;
    clob_pair_id: number;
    is_buy: boolean;
    quantums: Long;
    subticks: Long;
}
export declare const OrderId: {
    encode(message: OrderId, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderId;
    fromPartial(object: DeepPartial<OrderId>): OrderId;
};
export declare const OrdersFilledDuringLatestBlock: {
    encode(message: OrdersFilledDuringLatestBlock, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrdersFilledDuringLatestBlock;
    fromPartial(object: DeepPartial<OrdersFilledDuringLatestBlock>): OrdersFilledDuringLatestBlock;
};
export declare const PotentiallyPrunableOrders: {
    encode(message: PotentiallyPrunableOrders, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PotentiallyPrunableOrders;
    fromPartial(object: DeepPartial<PotentiallyPrunableOrders>): PotentiallyPrunableOrders;
};
export declare const OrderFillState: {
    encode(message: OrderFillState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderFillState;
    fromPartial(object: DeepPartial<OrderFillState>): OrderFillState;
};
export declare const StatefulOrderTimeSliceValue: {
    encode(message: StatefulOrderTimeSliceValue, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StatefulOrderTimeSliceValue;
    fromPartial(object: DeepPartial<StatefulOrderTimeSliceValue>): StatefulOrderTimeSliceValue;
};
export declare const LongTermOrderPlacement: {
    encode(message: LongTermOrderPlacement, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LongTermOrderPlacement;
    fromPartial(object: DeepPartial<LongTermOrderPlacement>): LongTermOrderPlacement;
};
export declare const TwapOrderPlacement: {
    encode(message: TwapOrderPlacement, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TwapOrderPlacement;
    fromPartial(object: DeepPartial<TwapOrderPlacement>): TwapOrderPlacement;
};
export declare const ConditionalOrderPlacement: {
    encode(message: ConditionalOrderPlacement, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ConditionalOrderPlacement;
    fromPartial(object: DeepPartial<ConditionalOrderPlacement>): ConditionalOrderPlacement;
};
export declare const Order: {
    encode(message: Order, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Order;
    fromPartial(object: DeepPartial<Order>): Order;
};
export declare const TwapParameters: {
    encode(message: TwapParameters, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TwapParameters;
    fromPartial(object: DeepPartial<TwapParameters>): TwapParameters;
};
export declare const BuilderCodeParameters: {
    encode(message: BuilderCodeParameters, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BuilderCodeParameters;
    fromPartial(object: DeepPartial<BuilderCodeParameters>): BuilderCodeParameters;
};
export declare const TransactionOrdering: {
    encode(message: TransactionOrdering, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TransactionOrdering;
    fromPartial(object: DeepPartial<TransactionOrdering>): TransactionOrdering;
};
export declare const StreamLiquidationOrder: {
    encode(message: StreamLiquidationOrder, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): StreamLiquidationOrder;
    fromPartial(object: DeepPartial<StreamLiquidationOrder>): StreamLiquidationOrder;
};
