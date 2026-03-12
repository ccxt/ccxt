import { Order, OrderSDKType, OrderId, OrderIdSDKType } from "./order.js";
import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import { ClobPair, ClobPairSDKType } from "./clob_pair.js";
import { EquityTierLimitConfiguration, EquityTierLimitConfigurationSDKType } from "./equity_tier_limit_config.js";
import { BlockRateLimitConfiguration, BlockRateLimitConfigurationSDKType } from "./block_rate_limit_config.js";
import { LiquidationsConfig, LiquidationsConfigSDKType } from "./liquidations_config.js";
import { ClobMatch, ClobMatchSDKType } from "./matches.js";
import { OrderRemoval, OrderRemovalSDKType } from "./order_removals.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/** MsgCreateClobPair is a message used by x/gov for creating a new clob pair. */
export interface MsgCreateClobPair {
    /** The address that controls the module. */
    authority: string;
    /** `clob_pair` defines parameters for the new clob pair. */
    clobPair?: ClobPair;
}
/** MsgCreateClobPair is a message used by x/gov for creating a new clob pair. */
export interface MsgCreateClobPairSDKType {
    authority: string;
    clob_pair?: ClobPairSDKType;
}
/** MsgCreateClobPairResponse defines the CreateClobPair response type. */
export interface MsgCreateClobPairResponse {
}
/** MsgCreateClobPairResponse defines the CreateClobPair response type. */
export interface MsgCreateClobPairResponseSDKType {
}
/**
 * MsgProposedOperations is a message injected by block proposers to
 * specify the operations that occurred in a block.
 */
export interface MsgProposedOperations {
    /** The list of operations proposed by the block proposer. */
    operationsQueue: OperationRaw[];
}
/**
 * MsgProposedOperations is a message injected by block proposers to
 * specify the operations that occurred in a block.
 */
export interface MsgProposedOperationsSDKType {
    operations_queue: OperationRawSDKType[];
}
/**
 * MsgProposedOperationsResponse is the response type of the message injected
 * by block proposers to specify the operations that occurred in a block.
 */
export interface MsgProposedOperationsResponse {
}
/**
 * MsgProposedOperationsResponse is the response type of the message injected
 * by block proposers to specify the operations that occurred in a block.
 */
export interface MsgProposedOperationsResponseSDKType {
}
/** MsgPlaceOrder is a request type used for placing orders. */
export interface MsgPlaceOrder {
    /** MsgPlaceOrder is a request type used for placing orders. */
    order?: Order;
}
/** MsgPlaceOrder is a request type used for placing orders. */
export interface MsgPlaceOrderSDKType {
    order?: OrderSDKType;
}
/** MsgPlaceOrderResponse is a response type used for placing orders. */
export interface MsgPlaceOrderResponse {
}
/** MsgPlaceOrderResponse is a response type used for placing orders. */
export interface MsgPlaceOrderResponseSDKType {
}
/** MsgCancelOrder is a request type used for canceling orders. */
export interface MsgCancelOrder {
    orderId?: OrderId;
    /**
     * The last block this order cancellation can be executed at.
     * Used only for Short-Term orders and must be zero for stateful orders.
     */
    goodTilBlock?: number;
    /**
     * good_til_block_time represents the unix timestamp (in seconds) at which a
     * stateful order cancellation will be considered expired. The
     * good_til_block_time is always evaluated against the previous block's
     * `BlockTime` instead of the block in which the order is committed.
     * This value must be zero for Short-Term orders.
     */
    goodTilBlockTime?: number;
}
/** MsgCancelOrder is a request type used for canceling orders. */
export interface MsgCancelOrderSDKType {
    order_id?: OrderIdSDKType;
    good_til_block?: number;
    good_til_block_time?: number;
}
/** MsgCancelOrderResponse is a response type used for canceling orders. */
export interface MsgCancelOrderResponse {
}
/** MsgCancelOrderResponse is a response type used for canceling orders. */
export interface MsgCancelOrderResponseSDKType {
}
/**
 * MsgBatchCancel is a request type used for batch canceling orders.
 * This msg is not atomic. Cancels will be performed optimistically even
 * if some cancels are invalid or fail.
 */
export interface MsgBatchCancel {
    /** The subaccount this batch cancel will be applied for. */
    subaccountId?: SubaccountId;
    /** The batch of short term orders that will be cancelled. */
    shortTermCancels: OrderBatch[];
    /** The last block the short term order cancellations can be executed at. */
    goodTilBlock: number;
}
/**
 * MsgBatchCancel is a request type used for batch canceling orders.
 * This msg is not atomic. Cancels will be performed optimistically even
 * if some cancels are invalid or fail.
 */
export interface MsgBatchCancelSDKType {
    subaccount_id?: SubaccountIdSDKType;
    short_term_cancels: OrderBatchSDKType[];
    good_til_block: number;
}
/**
 * OrderBatch represents a batch of orders all belonging to a single clob pair
 * id. Along with a subaccount id and an order flag, is used to represent a
 * batch of orders that share the same subaccount, order flag, and clob pair id.
 */
export interface OrderBatch {
    /** The Clob Pair ID all orders in this order batch belong to. */
    clobPairId: number;
    /**
     * List of client ids in this order batch.
     * Note that this is serialized as a uint32 instead of a fixed32 to
     * avoid issues when decoding repeated packed fixed32.
     */
    clientIds: number[];
}
/**
 * OrderBatch represents a batch of orders all belonging to a single clob pair
 * id. Along with a subaccount id and an order flag, is used to represent a
 * batch of orders that share the same subaccount, order flag, and clob pair id.
 */
export interface OrderBatchSDKType {
    clob_pair_id: number;
    client_ids: number[];
}
/**
 * MsgBatchCancelResponse is a response type used for batch canceling orders.
 * It indicates which cancel orders have succeeded or failed.
 */
export interface MsgBatchCancelResponse {
    /** A batch of short term cancel orders that have succeeded. */
    shortTermSucceeded: OrderBatch[];
    /** A batch of short term cancel orders that have failed. */
    shortTermFailed: OrderBatch[];
}
/**
 * MsgBatchCancelResponse is a response type used for batch canceling orders.
 * It indicates which cancel orders have succeeded or failed.
 */
export interface MsgBatchCancelResponseSDKType {
    short_term_succeeded: OrderBatchSDKType[];
    short_term_failed: OrderBatchSDKType[];
}
/** MsgUpdateClobPair is a request type used for updating a ClobPair in state. */
export interface MsgUpdateClobPair {
    /** Authority is the address that may send this message. */
    authority: string;
    /** `clob_pair` is the ClobPair to write to state. */
    clobPair?: ClobPair;
}
/** MsgUpdateClobPair is a request type used for updating a ClobPair in state. */
export interface MsgUpdateClobPairSDKType {
    authority: string;
    clob_pair?: ClobPairSDKType;
}
/**
 * MsgUpdateClobPairResponse is a response type used for setting a ClobPair's
 * status.
 */
export interface MsgUpdateClobPairResponse {
}
/**
 * MsgUpdateClobPairResponse is a response type used for setting a ClobPair's
 * status.
 */
export interface MsgUpdateClobPairResponseSDKType {
}
/**
 * OperationRaw represents an operation in the proposed operations.
 * Note that the `order_placement` operation is a signed message.
 */
export interface OperationRaw {
    match?: ClobMatch;
    shortTermOrderPlacement?: Uint8Array;
    orderRemoval?: OrderRemoval;
}
/**
 * OperationRaw represents an operation in the proposed operations.
 * Note that the `order_placement` operation is a signed message.
 */
export interface OperationRawSDKType {
    match?: ClobMatchSDKType;
    short_term_order_placement?: Uint8Array;
    order_removal?: OrderRemovalSDKType;
}
/**
 * MsgUpdateEquityTierLimitConfiguration is the Msg/EquityTierLimitConfiguration
 * request type.
 */
export interface MsgUpdateEquityTierLimitConfiguration {
    authority: string;
    /**
     * Defines the equity tier limit configuration to update to. All fields must
     * be set.
     */
    equityTierLimitConfig?: EquityTierLimitConfiguration;
}
/**
 * MsgUpdateEquityTierLimitConfiguration is the Msg/EquityTierLimitConfiguration
 * request type.
 */
export interface MsgUpdateEquityTierLimitConfigurationSDKType {
    authority: string;
    equity_tier_limit_config?: EquityTierLimitConfigurationSDKType;
}
/**
 * MsgUpdateEquityTierLimitConfiguration is the Msg/EquityTierLimitConfiguration
 * response type.
 */
export interface MsgUpdateEquityTierLimitConfigurationResponse {
}
/**
 * MsgUpdateEquityTierLimitConfiguration is the Msg/EquityTierLimitConfiguration
 * response type.
 */
export interface MsgUpdateEquityTierLimitConfigurationResponseSDKType {
}
/**
 * MsgUpdateBlockRateLimitConfiguration is the Msg/BlockRateLimitConfiguration
 * request type.
 */
export interface MsgUpdateBlockRateLimitConfiguration {
    authority: string;
    /**
     * Defines the block rate limit configuration to update to. All fields must be
     * set.
     */
    blockRateLimitConfig?: BlockRateLimitConfiguration;
}
/**
 * MsgUpdateBlockRateLimitConfiguration is the Msg/BlockRateLimitConfiguration
 * request type.
 */
export interface MsgUpdateBlockRateLimitConfigurationSDKType {
    authority: string;
    block_rate_limit_config?: BlockRateLimitConfigurationSDKType;
}
/**
 * MsgUpdateBlockRateLimitConfiguration is a response type for updating the
 * liquidations config.
 */
export interface MsgUpdateBlockRateLimitConfigurationResponse {
}
/**
 * MsgUpdateBlockRateLimitConfiguration is a response type for updating the
 * liquidations config.
 */
export interface MsgUpdateBlockRateLimitConfigurationResponseSDKType {
}
/**
 * MsgUpdateLiquidationsConfig is a request type for updating the liquidations
 * config.
 */
export interface MsgUpdateLiquidationsConfig {
    /** Authority is the address that may send this message. */
    authority: string;
    /**
     * Defines the liquidations configuration to update to. All fields must
     * be set.
     */
    liquidationsConfig?: LiquidationsConfig;
}
/**
 * MsgUpdateLiquidationsConfig is a request type for updating the liquidations
 * config.
 */
export interface MsgUpdateLiquidationsConfigSDKType {
    authority: string;
    liquidations_config?: LiquidationsConfigSDKType;
}
/** MsgUpdateLiquidationsConfig is the Msg/LiquidationsConfig response type. */
export interface MsgUpdateLiquidationsConfigResponse {
}
/** MsgUpdateLiquidationsConfig is the Msg/LiquidationsConfig response type. */
export interface MsgUpdateLiquidationsConfigResponseSDKType {
}
export declare const MsgCreateClobPair: {
    encode(message: MsgCreateClobPair, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClobPair;
    fromPartial(object: DeepPartial<MsgCreateClobPair>): MsgCreateClobPair;
};
export declare const MsgCreateClobPairResponse: {
    encode(_: MsgCreateClobPairResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClobPairResponse;
    fromPartial(_: DeepPartial<MsgCreateClobPairResponse>): MsgCreateClobPairResponse;
};
export declare const MsgProposedOperations: {
    encode(message: MsgProposedOperations, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgProposedOperations;
    fromPartial(object: DeepPartial<MsgProposedOperations>): MsgProposedOperations;
};
export declare const MsgProposedOperationsResponse: {
    encode(_: MsgProposedOperationsResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgProposedOperationsResponse;
    fromPartial(_: DeepPartial<MsgProposedOperationsResponse>): MsgProposedOperationsResponse;
};
export declare const MsgPlaceOrder: {
    encode(message: MsgPlaceOrder, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgPlaceOrder;
    fromPartial(object: DeepPartial<MsgPlaceOrder>): MsgPlaceOrder;
};
export declare const MsgPlaceOrderResponse: {
    encode(_: MsgPlaceOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgPlaceOrderResponse;
    fromPartial(_: DeepPartial<MsgPlaceOrderResponse>): MsgPlaceOrderResponse;
};
export declare const MsgCancelOrder: {
    encode(message: MsgCancelOrder, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelOrder;
    fromPartial(object: DeepPartial<MsgCancelOrder>): MsgCancelOrder;
};
export declare const MsgCancelOrderResponse: {
    encode(_: MsgCancelOrderResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelOrderResponse;
    fromPartial(_: DeepPartial<MsgCancelOrderResponse>): MsgCancelOrderResponse;
};
export declare const MsgBatchCancel: {
    encode(message: MsgBatchCancel, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchCancel;
    fromPartial(object: DeepPartial<MsgBatchCancel>): MsgBatchCancel;
};
export declare const OrderBatch: {
    encode(message: OrderBatch, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OrderBatch;
    fromPartial(object: DeepPartial<OrderBatch>): OrderBatch;
};
export declare const MsgBatchCancelResponse: {
    encode(message: MsgBatchCancelResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchCancelResponse;
    fromPartial(object: DeepPartial<MsgBatchCancelResponse>): MsgBatchCancelResponse;
};
export declare const MsgUpdateClobPair: {
    encode(message: MsgUpdateClobPair, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClobPair;
    fromPartial(object: DeepPartial<MsgUpdateClobPair>): MsgUpdateClobPair;
};
export declare const MsgUpdateClobPairResponse: {
    encode(_: MsgUpdateClobPairResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClobPairResponse;
    fromPartial(_: DeepPartial<MsgUpdateClobPairResponse>): MsgUpdateClobPairResponse;
};
export declare const OperationRaw: {
    encode(message: OperationRaw, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): OperationRaw;
    fromPartial(object: DeepPartial<OperationRaw>): OperationRaw;
};
export declare const MsgUpdateEquityTierLimitConfiguration: {
    encode(message: MsgUpdateEquityTierLimitConfiguration, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateEquityTierLimitConfiguration;
    fromPartial(object: DeepPartial<MsgUpdateEquityTierLimitConfiguration>): MsgUpdateEquityTierLimitConfiguration;
};
export declare const MsgUpdateEquityTierLimitConfigurationResponse: {
    encode(_: MsgUpdateEquityTierLimitConfigurationResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateEquityTierLimitConfigurationResponse;
    fromPartial(_: DeepPartial<MsgUpdateEquityTierLimitConfigurationResponse>): MsgUpdateEquityTierLimitConfigurationResponse;
};
export declare const MsgUpdateBlockRateLimitConfiguration: {
    encode(message: MsgUpdateBlockRateLimitConfiguration, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateBlockRateLimitConfiguration;
    fromPartial(object: DeepPartial<MsgUpdateBlockRateLimitConfiguration>): MsgUpdateBlockRateLimitConfiguration;
};
export declare const MsgUpdateBlockRateLimitConfigurationResponse: {
    encode(_: MsgUpdateBlockRateLimitConfigurationResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateBlockRateLimitConfigurationResponse;
    fromPartial(_: DeepPartial<MsgUpdateBlockRateLimitConfigurationResponse>): MsgUpdateBlockRateLimitConfigurationResponse;
};
export declare const MsgUpdateLiquidationsConfig: {
    encode(message: MsgUpdateLiquidationsConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateLiquidationsConfig;
    fromPartial(object: DeepPartial<MsgUpdateLiquidationsConfig>): MsgUpdateLiquidationsConfig;
};
export declare const MsgUpdateLiquidationsConfigResponse: {
    encode(_: MsgUpdateLiquidationsConfigResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateLiquidationsConfigResponse;
    fromPartial(_: DeepPartial<MsgUpdateLiquidationsConfigResponse>): MsgUpdateLiquidationsConfigResponse;
};
