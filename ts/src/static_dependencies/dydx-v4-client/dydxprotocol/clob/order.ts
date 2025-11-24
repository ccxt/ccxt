import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import { PerpetualLiquidationInfo, PerpetualLiquidationInfoSDKType } from "./liquidations.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial, Long } from "../../helpers.js";
/**
 * Represents the side of the orderbook the order will be placed on.
 * Note that Side.SIDE_UNSPECIFIED is an invalid order and cannot be
 * placed on the orderbook.
 */

export enum Order_Side {
  /** SIDE_UNSPECIFIED - Default value. This value is invalid and unused. */
  SIDE_UNSPECIFIED = 0,

  /** SIDE_BUY - SIDE_BUY is used to represent a BUY order. */
  SIDE_BUY = 1,

  /** SIDE_SELL - SIDE_SELL is used to represent a SELL order. */
  SIDE_SELL = 2,
  UNRECOGNIZED = -1,
}
export const Order_SideSDKType = Order_Side;
export function order_SideFromJSON(object: any): Order_Side {
  switch (object) {
    case 0:
    case "SIDE_UNSPECIFIED":
      return Order_Side.SIDE_UNSPECIFIED;

    case 1:
    case "SIDE_BUY":
      return Order_Side.SIDE_BUY;

    case 2:
    case "SIDE_SELL":
      return Order_Side.SIDE_SELL;

    case -1:
    case "UNRECOGNIZED":
    default:
      return Order_Side.UNRECOGNIZED;
  }
}
export function order_SideToJSON(object: Order_Side): string {
  switch (object) {
    case Order_Side.SIDE_UNSPECIFIED:
      return "SIDE_UNSPECIFIED";

    case Order_Side.SIDE_BUY:
      return "SIDE_BUY";

    case Order_Side.SIDE_SELL:
      return "SIDE_SELL";

    case Order_Side.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/**
 * TimeInForce indicates how long an order will remain active before it
 * is executed or expires.
 */

export enum Order_TimeInForce {
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
  UNRECOGNIZED = -1,
}
export const Order_TimeInForceSDKType = Order_TimeInForce;
export function order_TimeInForceFromJSON(object: any): Order_TimeInForce {
  switch (object) {
    case 0:
    case "TIME_IN_FORCE_UNSPECIFIED":
      return Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED;

    case 1:
    case "TIME_IN_FORCE_IOC":
      return Order_TimeInForce.TIME_IN_FORCE_IOC;

    case 2:
    case "TIME_IN_FORCE_POST_ONLY":
      return Order_TimeInForce.TIME_IN_FORCE_POST_ONLY;

    case 3:
    case "TIME_IN_FORCE_FILL_OR_KILL":
      return Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL;

    case -1:
    case "UNRECOGNIZED":
    default:
      return Order_TimeInForce.UNRECOGNIZED;
  }
}
export function order_TimeInForceToJSON(object: Order_TimeInForce): string {
  switch (object) {
    case Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED:
      return "TIME_IN_FORCE_UNSPECIFIED";

    case Order_TimeInForce.TIME_IN_FORCE_IOC:
      return "TIME_IN_FORCE_IOC";

    case Order_TimeInForce.TIME_IN_FORCE_POST_ONLY:
      return "TIME_IN_FORCE_POST_ONLY";

    case Order_TimeInForce.TIME_IN_FORCE_FILL_OR_KILL:
      return "TIME_IN_FORCE_FILL_OR_KILL";

    case Order_TimeInForce.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
export enum Order_ConditionType {
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
  UNRECOGNIZED = -1,
}
export const Order_ConditionTypeSDKType = Order_ConditionType;
export function order_ConditionTypeFromJSON(object: any): Order_ConditionType {
  switch (object) {
    case 0:
    case "CONDITION_TYPE_UNSPECIFIED":
      return Order_ConditionType.CONDITION_TYPE_UNSPECIFIED;

    case 1:
    case "CONDITION_TYPE_STOP_LOSS":
      return Order_ConditionType.CONDITION_TYPE_STOP_LOSS;

    case 2:
    case "CONDITION_TYPE_TAKE_PROFIT":
      return Order_ConditionType.CONDITION_TYPE_TAKE_PROFIT;

    case -1:
    case "UNRECOGNIZED":
    default:
      return Order_ConditionType.UNRECOGNIZED;
  }
}
export function order_ConditionTypeToJSON(object: Order_ConditionType): string {
  switch (object) {
    case Order_ConditionType.CONDITION_TYPE_UNSPECIFIED:
      return "CONDITION_TYPE_UNSPECIFIED";

    case Order_ConditionType.CONDITION_TYPE_STOP_LOSS:
      return "CONDITION_TYPE_STOP_LOSS";

    case Order_ConditionType.CONDITION_TYPE_TAKE_PROFIT:
      return "CONDITION_TYPE_TAKE_PROFIT";

    case Order_ConditionType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
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

function createBaseOrderId(): OrderId {
  return {
    subaccountId: undefined,
    clientId: 0,
    orderFlags: 0,
    clobPairId: 0
  };
}

export const OrderId = {
  encode(message: OrderId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.subaccountId !== undefined) {
      SubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
    }

    if (message.clientId !== 0) {
      writer.uint32(21).fixed32(message.clientId);
    }

    if (message.orderFlags !== 0) {
      writer.uint32(24).uint32(message.orderFlags);
    }

    if (message.clobPairId !== 0) {
      writer.uint32(32).uint32(message.clobPairId);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OrderId {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderId();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.subaccountId = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.clientId = reader.fixed32();
          break;

        case 3:
          message.orderFlags = reader.uint32();
          break;

        case 4:
          message.clobPairId = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<OrderId>): OrderId {
    const message = createBaseOrderId();
    message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? SubaccountId.fromPartial(object.subaccountId) : undefined;
    message.clientId = object.clientId ?? 0;
    message.orderFlags = object.orderFlags ?? 0;
    message.clobPairId = object.clobPairId ?? 0;
    return message;
  }

};

function createBaseOrdersFilledDuringLatestBlock(): OrdersFilledDuringLatestBlock {
  return {
    orderIds: []
  };
}

export const OrdersFilledDuringLatestBlock = {
  encode(message: OrdersFilledDuringLatestBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.orderIds) {
      OrderId.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OrdersFilledDuringLatestBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrdersFilledDuringLatestBlock();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.orderIds.push(OrderId.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<OrdersFilledDuringLatestBlock>): OrdersFilledDuringLatestBlock {
    const message = createBaseOrdersFilledDuringLatestBlock();
    message.orderIds = object.orderIds?.map(e => OrderId.fromPartial(e)) || [];
    return message;
  }

};

function createBasePotentiallyPrunableOrders(): PotentiallyPrunableOrders {
  return {
    orderIds: []
  };
}

export const PotentiallyPrunableOrders = {
  encode(message: PotentiallyPrunableOrders, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.orderIds) {
      OrderId.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PotentiallyPrunableOrders {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePotentiallyPrunableOrders();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.orderIds.push(OrderId.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<PotentiallyPrunableOrders>): PotentiallyPrunableOrders {
    const message = createBasePotentiallyPrunableOrders();
    message.orderIds = object.orderIds?.map(e => OrderId.fromPartial(e)) || [];
    return message;
  }

};

function createBaseOrderFillState(): OrderFillState {
  return {
    fillAmount: Long.UZERO,
    prunableBlockHeight: 0
  };
}

export const OrderFillState = {
  encode(message: OrderFillState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.fillAmount.isZero()) {
      writer.uint32(8).uint64(message.fillAmount);
    }

    if (message.prunableBlockHeight !== 0) {
      writer.uint32(16).uint32(message.prunableBlockHeight);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): OrderFillState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrderFillState();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.fillAmount = (reader.uint64() as Long);
          break;

        case 2:
          message.prunableBlockHeight = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<OrderFillState>): OrderFillState {
    const message = createBaseOrderFillState();
    message.fillAmount = object.fillAmount !== undefined && object.fillAmount !== null ? Long.fromValue(object.fillAmount) : Long.UZERO;
    message.prunableBlockHeight = object.prunableBlockHeight ?? 0;
    return message;
  }

};

function createBaseStatefulOrderTimeSliceValue(): StatefulOrderTimeSliceValue {
  return {
    orderIds: []
  };
}

export const StatefulOrderTimeSliceValue = {
  encode(message: StatefulOrderTimeSliceValue, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.orderIds) {
      OrderId.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StatefulOrderTimeSliceValue {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStatefulOrderTimeSliceValue();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.orderIds.push(OrderId.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<StatefulOrderTimeSliceValue>): StatefulOrderTimeSliceValue {
    const message = createBaseStatefulOrderTimeSliceValue();
    message.orderIds = object.orderIds?.map(e => OrderId.fromPartial(e)) || [];
    return message;
  }

};

function createBaseLongTermOrderPlacement(): LongTermOrderPlacement {
  return {
    order: undefined,
    placementIndex: undefined
  };
}

export const LongTermOrderPlacement = {
  encode(message: LongTermOrderPlacement, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.order !== undefined) {
      Order.encode(message.order, writer.uint32(10).fork()).ldelim();
    }

    if (message.placementIndex !== undefined) {
      TransactionOrdering.encode(message.placementIndex, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LongTermOrderPlacement {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLongTermOrderPlacement();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.order = Order.decode(reader, reader.uint32());
          break;

        case 2:
          message.placementIndex = TransactionOrdering.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<LongTermOrderPlacement>): LongTermOrderPlacement {
    const message = createBaseLongTermOrderPlacement();
    message.order = object.order !== undefined && object.order !== null ? Order.fromPartial(object.order) : undefined;
    message.placementIndex = object.placementIndex !== undefined && object.placementIndex !== null ? TransactionOrdering.fromPartial(object.placementIndex) : undefined;
    return message;
  }

};

function createBaseTwapOrderPlacement(): TwapOrderPlacement {
  return {
    order: undefined,
    remainingLegs: 0,
    remainingQuantums: Long.UZERO
  };
}

export const TwapOrderPlacement = {
  encode(message: TwapOrderPlacement, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.order !== undefined) {
      Order.encode(message.order, writer.uint32(10).fork()).ldelim();
    }

    if (message.remainingLegs !== 0) {
      writer.uint32(16).uint32(message.remainingLegs);
    }

    if (!message.remainingQuantums.isZero()) {
      writer.uint32(24).uint64(message.remainingQuantums);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TwapOrderPlacement {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTwapOrderPlacement();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.order = Order.decode(reader, reader.uint32());
          break;

        case 2:
          message.remainingLegs = reader.uint32();
          break;

        case 3:
          message.remainingQuantums = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<TwapOrderPlacement>): TwapOrderPlacement {
    const message = createBaseTwapOrderPlacement();
    message.order = object.order !== undefined && object.order !== null ? Order.fromPartial(object.order) : undefined;
    message.remainingLegs = object.remainingLegs ?? 0;
    message.remainingQuantums = object.remainingQuantums !== undefined && object.remainingQuantums !== null ? Long.fromValue(object.remainingQuantums) : Long.UZERO;
    return message;
  }

};

function createBaseConditionalOrderPlacement(): ConditionalOrderPlacement {
  return {
    order: undefined,
    placementIndex: undefined,
    triggerIndex: undefined
  };
}

export const ConditionalOrderPlacement = {
  encode(message: ConditionalOrderPlacement, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.order !== undefined) {
      Order.encode(message.order, writer.uint32(10).fork()).ldelim();
    }

    if (message.placementIndex !== undefined) {
      TransactionOrdering.encode(message.placementIndex, writer.uint32(18).fork()).ldelim();
    }

    if (message.triggerIndex !== undefined) {
      TransactionOrdering.encode(message.triggerIndex, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConditionalOrderPlacement {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConditionalOrderPlacement();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.order = Order.decode(reader, reader.uint32());
          break;

        case 2:
          message.placementIndex = TransactionOrdering.decode(reader, reader.uint32());
          break;

        case 3:
          message.triggerIndex = TransactionOrdering.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<ConditionalOrderPlacement>): ConditionalOrderPlacement {
    const message = createBaseConditionalOrderPlacement();
    message.order = object.order !== undefined && object.order !== null ? Order.fromPartial(object.order) : undefined;
    message.placementIndex = object.placementIndex !== undefined && object.placementIndex !== null ? TransactionOrdering.fromPartial(object.placementIndex) : undefined;
    message.triggerIndex = object.triggerIndex !== undefined && object.triggerIndex !== null ? TransactionOrdering.fromPartial(object.triggerIndex) : undefined;
    return message;
  }

};

function createBaseOrder(): Order {
  return {
    orderId: undefined,
    side: 0,
    quantums: Long.UZERO,
    subticks: Long.UZERO,
    goodTilBlock: undefined,
    goodTilBlockTime: undefined,
    timeInForce: 0,
    reduceOnly: false,
    clientMetadata: 0,
    conditionType: 0,
    conditionalOrderTriggerSubticks: Long.UZERO,
    twapParameters: undefined,
    builderCodeParameters: undefined,
    orderRouterAddress: ""
  };
}

export const Order = {
  encode(message: Order, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.orderId !== undefined) {
      OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
    }

    if (message.side !== 0) {
      writer.uint32(16).int32(message.side);
    }

    if (!message.quantums.isZero()) {
      writer.uint32(24).uint64(message.quantums);
    }

    if (!message.subticks.isZero()) {
      writer.uint32(32).uint64(message.subticks);
    }

    if (message.goodTilBlock !== undefined) {
      writer.uint32(40).uint32(message.goodTilBlock);
    }

    if (message.goodTilBlockTime !== undefined) {
      writer.uint32(53).fixed32(message.goodTilBlockTime);
    }

    if (message.timeInForce !== 0) {
      writer.uint32(56).int32(message.timeInForce);
    }

    if (message.reduceOnly === true) {
      writer.uint32(64).bool(message.reduceOnly);
    }

    if (message.clientMetadata !== 0) {
      writer.uint32(72).uint32(message.clientMetadata);
    }

    if (message.conditionType !== 0) {
      writer.uint32(80).int32(message.conditionType);
    }

    if (!message.conditionalOrderTriggerSubticks.isZero()) {
      writer.uint32(88).uint64(message.conditionalOrderTriggerSubticks);
    }

    if (message.twapParameters !== undefined) {
      TwapParameters.encode(message.twapParameters, writer.uint32(98).fork()).ldelim();
    }

    if (message.builderCodeParameters !== undefined) {
      BuilderCodeParameters.encode(message.builderCodeParameters, writer.uint32(106).fork()).ldelim();
    }

    if (message.orderRouterAddress !== "") {
      writer.uint32(114).string(message.orderRouterAddress);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Order {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOrder();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.orderId = OrderId.decode(reader, reader.uint32());
          break;

        case 2:
          message.side = (reader.int32() as any);
          break;

        case 3:
          message.quantums = (reader.uint64() as Long);
          break;

        case 4:
          message.subticks = (reader.uint64() as Long);
          break;

        case 5:
          message.goodTilBlock = reader.uint32();
          break;

        case 6:
          message.goodTilBlockTime = reader.fixed32();
          break;

        case 7:
          message.timeInForce = (reader.int32() as any);
          break;

        case 8:
          message.reduceOnly = reader.bool();
          break;

        case 9:
          message.clientMetadata = reader.uint32();
          break;

        case 10:
          message.conditionType = (reader.int32() as any);
          break;

        case 11:
          message.conditionalOrderTriggerSubticks = (reader.uint64() as Long);
          break;

        case 12:
          message.twapParameters = TwapParameters.decode(reader, reader.uint32());
          break;

        case 13:
          message.builderCodeParameters = BuilderCodeParameters.decode(reader, reader.uint32());
          break;

        case 14:
          message.orderRouterAddress = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<Order>): Order {
    const message = createBaseOrder();
    message.orderId = object.orderId !== undefined && object.orderId !== null ? OrderId.fromPartial(object.orderId) : undefined;
    message.side = object.side ?? 0;
    message.quantums = object.quantums !== undefined && object.quantums !== null ? Long.fromValue(object.quantums) : Long.UZERO;
    message.subticks = object.subticks !== undefined && object.subticks !== null ? Long.fromValue(object.subticks) : Long.UZERO;
    message.goodTilBlock = object.goodTilBlock ?? undefined;
    message.goodTilBlockTime = object.goodTilBlockTime ?? undefined;
    message.timeInForce = object.timeInForce ?? 0;
    message.reduceOnly = object.reduceOnly ?? false;
    message.clientMetadata = object.clientMetadata ?? 0;
    message.conditionType = object.conditionType ?? 0;
    message.conditionalOrderTriggerSubticks = object.conditionalOrderTriggerSubticks !== undefined && object.conditionalOrderTriggerSubticks !== null ? Long.fromValue(object.conditionalOrderTriggerSubticks) : Long.UZERO;
    message.twapParameters = object.twapParameters !== undefined && object.twapParameters !== null ? TwapParameters.fromPartial(object.twapParameters) : undefined;
    message.builderCodeParameters = object.builderCodeParameters !== undefined && object.builderCodeParameters !== null ? BuilderCodeParameters.fromPartial(object.builderCodeParameters) : undefined;
    message.orderRouterAddress = object.orderRouterAddress ?? "";
    return message;
  }

};

function createBaseTwapParameters(): TwapParameters {
  return {
    duration: 0,
    interval: 0,
    priceTolerance: 0
  };
}

export const TwapParameters = {
  encode(message: TwapParameters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.duration !== 0) {
      writer.uint32(8).uint32(message.duration);
    }

    if (message.interval !== 0) {
      writer.uint32(16).uint32(message.interval);
    }

    if (message.priceTolerance !== 0) {
      writer.uint32(24).uint32(message.priceTolerance);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TwapParameters {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTwapParameters();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.duration = reader.uint32();
          break;

        case 2:
          message.interval = reader.uint32();
          break;

        case 3:
          message.priceTolerance = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<TwapParameters>): TwapParameters {
    const message = createBaseTwapParameters();
    message.duration = object.duration ?? 0;
    message.interval = object.interval ?? 0;
    message.priceTolerance = object.priceTolerance ?? 0;
    return message;
  }

};

function createBaseBuilderCodeParameters(): BuilderCodeParameters {
  return {
    builderAddress: "",
    feePpm: 0
  };
}

export const BuilderCodeParameters = {
  encode(message: BuilderCodeParameters, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.builderAddress !== "") {
      writer.uint32(10).string(message.builderAddress);
    }

    if (message.feePpm !== 0) {
      writer.uint32(16).uint32(message.feePpm);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BuilderCodeParameters {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBuilderCodeParameters();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.builderAddress = reader.string();
          break;

        case 2:
          message.feePpm = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<BuilderCodeParameters>): BuilderCodeParameters {
    const message = createBaseBuilderCodeParameters();
    message.builderAddress = object.builderAddress ?? "";
    message.feePpm = object.feePpm ?? 0;
    return message;
  }

};

function createBaseTransactionOrdering(): TransactionOrdering {
  return {
    blockHeight: 0,
    transactionIndex: 0
  };
}

export const TransactionOrdering = {
  encode(message: TransactionOrdering, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.blockHeight !== 0) {
      writer.uint32(8).uint32(message.blockHeight);
    }

    if (message.transactionIndex !== 0) {
      writer.uint32(16).uint32(message.transactionIndex);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TransactionOrdering {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionOrdering();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.blockHeight = reader.uint32();
          break;

        case 2:
          message.transactionIndex = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<TransactionOrdering>): TransactionOrdering {
    const message = createBaseTransactionOrdering();
    message.blockHeight = object.blockHeight ?? 0;
    message.transactionIndex = object.transactionIndex ?? 0;
    return message;
  }

};

function createBaseStreamLiquidationOrder(): StreamLiquidationOrder {
  return {
    liquidationInfo: undefined,
    clobPairId: 0,
    isBuy: false,
    quantums: Long.UZERO,
    subticks: Long.UZERO
  };
}

export const StreamLiquidationOrder = {
  encode(message: StreamLiquidationOrder, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.liquidationInfo !== undefined) {
      PerpetualLiquidationInfo.encode(message.liquidationInfo, writer.uint32(10).fork()).ldelim();
    }

    if (message.clobPairId !== 0) {
      writer.uint32(16).uint32(message.clobPairId);
    }

    if (message.isBuy === true) {
      writer.uint32(24).bool(message.isBuy);
    }

    if (!message.quantums.isZero()) {
      writer.uint32(32).uint64(message.quantums);
    }

    if (!message.subticks.isZero()) {
      writer.uint32(40).uint64(message.subticks);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StreamLiquidationOrder {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStreamLiquidationOrder();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.liquidationInfo = PerpetualLiquidationInfo.decode(reader, reader.uint32());
          break;

        case 2:
          message.clobPairId = reader.uint32();
          break;

        case 3:
          message.isBuy = reader.bool();
          break;

        case 4:
          message.quantums = (reader.uint64() as Long);
          break;

        case 5:
          message.subticks = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<StreamLiquidationOrder>): StreamLiquidationOrder {
    const message = createBaseStreamLiquidationOrder();
    message.liquidationInfo = object.liquidationInfo !== undefined && object.liquidationInfo !== null ? PerpetualLiquidationInfo.fromPartial(object.liquidationInfo) : undefined;
    message.clobPairId = object.clobPairId ?? 0;
    message.isBuy = object.isBuy ?? false;
    message.quantums = object.quantums !== undefined && object.quantums !== null ? Long.fromValue(object.quantums) : Long.UZERO;
    message.subticks = object.subticks !== undefined && object.subticks !== null ? Long.fromValue(object.subticks) : Long.UZERO;
    return message;
  }

};