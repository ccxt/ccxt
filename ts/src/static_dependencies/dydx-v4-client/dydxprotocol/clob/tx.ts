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

export interface MsgCreateClobPairResponse {}
/** MsgCreateClobPairResponse defines the CreateClobPair response type. */

export interface MsgCreateClobPairResponseSDKType {}
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

export interface MsgProposedOperationsResponse {}
/**
 * MsgProposedOperationsResponse is the response type of the message injected
 * by block proposers to specify the operations that occurred in a block.
 */

export interface MsgProposedOperationsResponseSDKType {}
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

export interface MsgPlaceOrderResponse {}
/** MsgPlaceOrderResponse is a response type used for placing orders. */

export interface MsgPlaceOrderResponseSDKType {}
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

export interface MsgCancelOrderResponse {}
/** MsgCancelOrderResponse is a response type used for canceling orders. */

export interface MsgCancelOrderResponseSDKType {}
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

export interface MsgUpdateClobPairResponse {}
/**
 * MsgUpdateClobPairResponse is a response type used for setting a ClobPair's
 * status.
 */

export interface MsgUpdateClobPairResponseSDKType {}
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

export interface MsgUpdateEquityTierLimitConfigurationResponse {}
/**
 * MsgUpdateEquityTierLimitConfiguration is the Msg/EquityTierLimitConfiguration
 * response type.
 */

export interface MsgUpdateEquityTierLimitConfigurationResponseSDKType {}
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

export interface MsgUpdateBlockRateLimitConfigurationResponse {}
/**
 * MsgUpdateBlockRateLimitConfiguration is a response type for updating the
 * liquidations config.
 */

export interface MsgUpdateBlockRateLimitConfigurationResponseSDKType {}
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

export interface MsgUpdateLiquidationsConfigResponse {}
/** MsgUpdateLiquidationsConfig is the Msg/LiquidationsConfig response type. */

export interface MsgUpdateLiquidationsConfigResponseSDKType {}

function createBaseMsgCreateClobPair(): MsgCreateClobPair {
  return {
    authority: "",
    clobPair: undefined
  };
}

export const MsgCreateClobPair = {
  encode(message: MsgCreateClobPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.clobPair !== undefined) {
      ClobPair.encode(message.clobPair, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClobPair {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClobPair();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.clobPair = ClobPair.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgCreateClobPair>): MsgCreateClobPair {
    const message = createBaseMsgCreateClobPair();
    message.authority = object.authority ?? "";
    message.clobPair = object.clobPair !== undefined && object.clobPair !== null ? ClobPair.fromPartial(object.clobPair) : undefined;
    return message;
  }

};

function createBaseMsgCreateClobPairResponse(): MsgCreateClobPairResponse {
  return {};
}

export const MsgCreateClobPairResponse = {
  encode(_: MsgCreateClobPairResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateClobPairResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateClobPairResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgCreateClobPairResponse>): MsgCreateClobPairResponse {
    const message = createBaseMsgCreateClobPairResponse();
    return message;
  }

};

function createBaseMsgProposedOperations(): MsgProposedOperations {
  return {
    operationsQueue: []
  };
}

export const MsgProposedOperations = {
  encode(message: MsgProposedOperations, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.operationsQueue) {
      OperationRaw.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProposedOperations {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgProposedOperations();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.operationsQueue.push(OperationRaw.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgProposedOperations>): MsgProposedOperations {
    const message = createBaseMsgProposedOperations();
    message.operationsQueue = object.operationsQueue?.map(e => OperationRaw.fromPartial(e)) || [];
    return message;
  }

};

function createBaseMsgProposedOperationsResponse(): MsgProposedOperationsResponse {
  return {};
}

export const MsgProposedOperationsResponse = {
  encode(_: MsgProposedOperationsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgProposedOperationsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgProposedOperationsResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgProposedOperationsResponse>): MsgProposedOperationsResponse {
    const message = createBaseMsgProposedOperationsResponse();
    return message;
  }

};

function createBaseMsgPlaceOrder(): MsgPlaceOrder {
  return {
    order: undefined
  };
}

export const MsgPlaceOrder = {
  encode(message: MsgPlaceOrder, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.order !== undefined) {
      Order.encode(message.order, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPlaceOrder {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPlaceOrder();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.order = Order.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgPlaceOrder>): MsgPlaceOrder {
    const message = createBaseMsgPlaceOrder();
    message.order = object.order !== undefined && object.order !== null ? Order.fromPartial(object.order) : undefined;
    return message;
  }

};

function createBaseMsgPlaceOrderResponse(): MsgPlaceOrderResponse {
  return {};
}

export const MsgPlaceOrderResponse = {
  encode(_: MsgPlaceOrderResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgPlaceOrderResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgPlaceOrderResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgPlaceOrderResponse>): MsgPlaceOrderResponse {
    const message = createBaseMsgPlaceOrderResponse();
    return message;
  }

};

function createBaseMsgCancelOrder(): MsgCancelOrder {
  return {
    orderId: undefined,
    goodTilBlock: undefined,
    goodTilBlockTime: undefined
  };
}

export const MsgCancelOrder = {
  encode(message: MsgCancelOrder, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.orderId !== undefined) {
      OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
    }

    if (message.goodTilBlock !== undefined) {
      writer.uint32(16).uint32(message.goodTilBlock);
    }

    if (message.goodTilBlockTime !== undefined) {
      writer.uint32(29).fixed32(message.goodTilBlockTime);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelOrder {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelOrder();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.orderId = OrderId.decode(reader, reader.uint32());
          break;

        case 2:
          message.goodTilBlock = reader.uint32();
          break;

        case 3:
          message.goodTilBlockTime = reader.fixed32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgCancelOrder>): MsgCancelOrder {
    const message = createBaseMsgCancelOrder();
    message.orderId = object.orderId !== undefined && object.orderId !== null ? OrderId.fromPartial(object.orderId) : undefined;
    message.goodTilBlock = object.goodTilBlock ?? undefined;
    message.goodTilBlockTime = object.goodTilBlockTime ?? undefined;
    return message;
  }

};

function createBaseMsgCancelOrderResponse(): MsgCancelOrderResponse {
  return {};
}

export const MsgCancelOrderResponse = {
  encode(_: MsgCancelOrderResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelOrderResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelOrderResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgCancelOrderResponse>): MsgCancelOrderResponse {
    const message = createBaseMsgCancelOrderResponse();
    return message;
  }

};

function createBaseMsgBatchCancel(): MsgBatchCancel {
  return {
    subaccountId: undefined,
    shortTermCancels: [],
    goodTilBlock: 0
  };
}

export const MsgBatchCancel = {
  encode(message: MsgBatchCancel, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.subaccountId !== undefined) {
      SubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.shortTermCancels) {
      OrderBatch.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    if (message.goodTilBlock !== 0) {
      writer.uint32(24).uint32(message.goodTilBlock);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchCancel {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancel();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subaccountId = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.shortTermCancels.push(OrderBatch.decode(reader, reader.uint32()));
          break;

        case 3:
          message.goodTilBlock = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgBatchCancel>): MsgBatchCancel {
    const message = createBaseMsgBatchCancel();
    message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? SubaccountId.fromPartial(object.subaccountId) : undefined;
    message.shortTermCancels = object.shortTermCancels?.map(e => OrderBatch.fromPartial(e)) || [];
    message.goodTilBlock = object.goodTilBlock ?? 0;
    return message;
  }

};

function createBaseOrderBatch(): OrderBatch {
  return {
    clobPairId: 0,
    clientIds: []
  };
}

export const OrderBatch = {
  encode(message: OrderBatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.clobPairId !== 0) {
      writer.uint32(8).uint32(message.clobPairId);
    }

    writer.uint32(18).fork();

    for (const v of message.clientIds) {
      writer.uint32(v);
    }

    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OrderBatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderBatch();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.clobPairId = reader.uint32();
          break;

        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;

            while (reader.pos < end2) {
              message.clientIds.push(reader.uint32());
            }
          } else {
            message.clientIds.push(reader.uint32());
          }

          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<OrderBatch>): OrderBatch {
    const message = createBaseOrderBatch();
    message.clobPairId = object.clobPairId ?? 0;
    message.clientIds = object.clientIds?.map(e => e) || [];
    return message;
  }

};

function createBaseMsgBatchCancelResponse(): MsgBatchCancelResponse {
  return {
    shortTermSucceeded: [],
    shortTermFailed: []
  };
}

export const MsgBatchCancelResponse = {
  encode(message: MsgBatchCancelResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.shortTermSucceeded) {
      OrderBatch.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.shortTermFailed) {
      OrderBatch.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBatchCancelResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBatchCancelResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.shortTermSucceeded.push(OrderBatch.decode(reader, reader.uint32()));
          break;

        case 2:
          message.shortTermFailed.push(OrderBatch.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgBatchCancelResponse>): MsgBatchCancelResponse {
    const message = createBaseMsgBatchCancelResponse();
    message.shortTermSucceeded = object.shortTermSucceeded?.map(e => OrderBatch.fromPartial(e)) || [];
    message.shortTermFailed = object.shortTermFailed?.map(e => OrderBatch.fromPartial(e)) || [];
    return message;
  }

};

function createBaseMsgUpdateClobPair(): MsgUpdateClobPair {
  return {
    authority: "",
    clobPair: undefined
  };
}

export const MsgUpdateClobPair = {
  encode(message: MsgUpdateClobPair, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.clobPair !== undefined) {
      ClobPair.encode(message.clobPair, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClobPair {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateClobPair();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.clobPair = ClobPair.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgUpdateClobPair>): MsgUpdateClobPair {
    const message = createBaseMsgUpdateClobPair();
    message.authority = object.authority ?? "";
    message.clobPair = object.clobPair !== undefined && object.clobPair !== null ? ClobPair.fromPartial(object.clobPair) : undefined;
    return message;
  }

};

function createBaseMsgUpdateClobPairResponse(): MsgUpdateClobPairResponse {
  return {};
}

export const MsgUpdateClobPairResponse = {
  encode(_: MsgUpdateClobPairResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateClobPairResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateClobPairResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgUpdateClobPairResponse>): MsgUpdateClobPairResponse {
    const message = createBaseMsgUpdateClobPairResponse();
    return message;
  }

};

function createBaseOperationRaw(): OperationRaw {
  return {
    match: undefined,
    shortTermOrderPlacement: undefined,
    orderRemoval: undefined
  };
}

export const OperationRaw = {
  encode(message: OperationRaw, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.match !== undefined) {
      ClobMatch.encode(message.match, writer.uint32(10).fork()).ldelim();
    }

    if (message.shortTermOrderPlacement !== undefined) {
      writer.uint32(18).bytes(message.shortTermOrderPlacement);
    }

    if (message.orderRemoval !== undefined) {
      OrderRemoval.encode(message.orderRemoval, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OperationRaw {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOperationRaw();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.match = ClobMatch.decode(reader, reader.uint32());
          break;

        case 2:
          message.shortTermOrderPlacement = reader.bytes();
          break;

        case 3:
          message.orderRemoval = OrderRemoval.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<OperationRaw>): OperationRaw {
    const message = createBaseOperationRaw();
    message.match = object.match !== undefined && object.match !== null ? ClobMatch.fromPartial(object.match) : undefined;
    message.shortTermOrderPlacement = object.shortTermOrderPlacement ?? undefined;
    message.orderRemoval = object.orderRemoval !== undefined && object.orderRemoval !== null ? OrderRemoval.fromPartial(object.orderRemoval) : undefined;
    return message;
  }

};

function createBaseMsgUpdateEquityTierLimitConfiguration(): MsgUpdateEquityTierLimitConfiguration {
  return {
    authority: "",
    equityTierLimitConfig: undefined
  };
}

export const MsgUpdateEquityTierLimitConfiguration = {
  encode(message: MsgUpdateEquityTierLimitConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.equityTierLimitConfig !== undefined) {
      EquityTierLimitConfiguration.encode(message.equityTierLimitConfig, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateEquityTierLimitConfiguration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateEquityTierLimitConfiguration();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.equityTierLimitConfig = EquityTierLimitConfiguration.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgUpdateEquityTierLimitConfiguration>): MsgUpdateEquityTierLimitConfiguration {
    const message = createBaseMsgUpdateEquityTierLimitConfiguration();
    message.authority = object.authority ?? "";
    message.equityTierLimitConfig = object.equityTierLimitConfig !== undefined && object.equityTierLimitConfig !== null ? EquityTierLimitConfiguration.fromPartial(object.equityTierLimitConfig) : undefined;
    return message;
  }

};

function createBaseMsgUpdateEquityTierLimitConfigurationResponse(): MsgUpdateEquityTierLimitConfigurationResponse {
  return {};
}

export const MsgUpdateEquityTierLimitConfigurationResponse = {
  encode(_: MsgUpdateEquityTierLimitConfigurationResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateEquityTierLimitConfigurationResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateEquityTierLimitConfigurationResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgUpdateEquityTierLimitConfigurationResponse>): MsgUpdateEquityTierLimitConfigurationResponse {
    const message = createBaseMsgUpdateEquityTierLimitConfigurationResponse();
    return message;
  }

};

function createBaseMsgUpdateBlockRateLimitConfiguration(): MsgUpdateBlockRateLimitConfiguration {
  return {
    authority: "",
    blockRateLimitConfig: undefined
  };
}

export const MsgUpdateBlockRateLimitConfiguration = {
  encode(message: MsgUpdateBlockRateLimitConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.blockRateLimitConfig !== undefined) {
      BlockRateLimitConfiguration.encode(message.blockRateLimitConfig, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateBlockRateLimitConfiguration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateBlockRateLimitConfiguration();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 3:
          message.blockRateLimitConfig = BlockRateLimitConfiguration.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgUpdateBlockRateLimitConfiguration>): MsgUpdateBlockRateLimitConfiguration {
    const message = createBaseMsgUpdateBlockRateLimitConfiguration();
    message.authority = object.authority ?? "";
    message.blockRateLimitConfig = object.blockRateLimitConfig !== undefined && object.blockRateLimitConfig !== null ? BlockRateLimitConfiguration.fromPartial(object.blockRateLimitConfig) : undefined;
    return message;
  }

};

function createBaseMsgUpdateBlockRateLimitConfigurationResponse(): MsgUpdateBlockRateLimitConfigurationResponse {
  return {};
}

export const MsgUpdateBlockRateLimitConfigurationResponse = {
  encode(_: MsgUpdateBlockRateLimitConfigurationResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateBlockRateLimitConfigurationResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateBlockRateLimitConfigurationResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgUpdateBlockRateLimitConfigurationResponse>): MsgUpdateBlockRateLimitConfigurationResponse {
    const message = createBaseMsgUpdateBlockRateLimitConfigurationResponse();
    return message;
  }

};

function createBaseMsgUpdateLiquidationsConfig(): MsgUpdateLiquidationsConfig {
  return {
    authority: "",
    liquidationsConfig: undefined
  };
}

export const MsgUpdateLiquidationsConfig = {
  encode(message: MsgUpdateLiquidationsConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.liquidationsConfig !== undefined) {
      LiquidationsConfig.encode(message.liquidationsConfig, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateLiquidationsConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateLiquidationsConfig();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.liquidationsConfig = LiquidationsConfig.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgUpdateLiquidationsConfig>): MsgUpdateLiquidationsConfig {
    const message = createBaseMsgUpdateLiquidationsConfig();
    message.authority = object.authority ?? "";
    message.liquidationsConfig = object.liquidationsConfig !== undefined && object.liquidationsConfig !== null ? LiquidationsConfig.fromPartial(object.liquidationsConfig) : undefined;
    return message;
  }

};

function createBaseMsgUpdateLiquidationsConfigResponse(): MsgUpdateLiquidationsConfigResponse {
  return {};
}

export const MsgUpdateLiquidationsConfigResponse = {
  encode(_: MsgUpdateLiquidationsConfigResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgUpdateLiquidationsConfigResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateLiquidationsConfigResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(_: DeepPartial<MsgUpdateLiquidationsConfigResponse>): MsgUpdateLiquidationsConfigResponse {
    const message = createBaseMsgUpdateLiquidationsConfigResponse();
    return message;
  }

};