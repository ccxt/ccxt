import { OrderId, OrderIdSDKType } from "./order.js";
import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial, Long } from "../../helpers.js";
/**
 * ClobMatch represents an operations queue entry around all different types
 * of matches, specifically regular matches, liquidation matches, and
 * deleveraging matches.
 */

export interface ClobMatch {
  matchOrders?: MatchOrders;
  matchPerpetualLiquidation?: MatchPerpetualLiquidation;
  matchPerpetualDeleveraging?: MatchPerpetualDeleveraging;
}
/**
 * ClobMatch represents an operations queue entry around all different types
 * of matches, specifically regular matches, liquidation matches, and
 * deleveraging matches.
 */

export interface ClobMatchSDKType {
  match_orders?: MatchOrdersSDKType;
  match_perpetual_liquidation?: MatchPerpetualLiquidationSDKType;
  match_perpetual_deleveraging?: MatchPerpetualDeleveragingSDKType;
}
/** MakerFill represents the filled amount of a matched maker order. */

export interface MakerFill {
  /**
   * The filled amount of the matched maker order, in base quantums.
   * TODO(CLOB-571): update to use SerializableInt.
   */
  fillAmount: Long;
  /** The `OrderId` of the matched maker order. */

  makerOrderId?: OrderId;
}
/** MakerFill represents the filled amount of a matched maker order. */

export interface MakerFillSDKType {
  fill_amount: Long;
  maker_order_id?: OrderIdSDKType;
}
/** MatchOrders is an injected message used for matching orders. */

export interface MatchOrders {
  /** The `OrderId` of the taker order. */
  takerOrderId?: OrderId;
  /** An ordered list of fills created by this taker order. */

  fills: MakerFill[];
}
/** MatchOrders is an injected message used for matching orders. */

export interface MatchOrdersSDKType {
  taker_order_id?: OrderIdSDKType;
  fills: MakerFillSDKType[];
}
/**
 * MatchPerpetualLiquidation is an injected message used for liquidating a
 * subaccount.
 */

export interface MatchPerpetualLiquidation {
  /** ID of the subaccount that was liquidated. */
  liquidated?: SubaccountId;
  /** The ID of the clob pair involved in the liquidation. */

  clobPairId: number;
  /** The ID of the perpetual involved in the liquidation. */

  perpetualId: number;
  /** The total size of the liquidation order including any unfilled size. */

  totalSize: Long;
  /** `true` if liquidating a short position, `false` otherwise. */

  isBuy: boolean;
  /** An ordered list of fills created by this liquidation. */

  fills: MakerFill[];
}
/**
 * MatchPerpetualLiquidation is an injected message used for liquidating a
 * subaccount.
 */

export interface MatchPerpetualLiquidationSDKType {
  liquidated?: SubaccountIdSDKType;
  clob_pair_id: number;
  perpetual_id: number;
  total_size: Long;
  is_buy: boolean;
  fills: MakerFillSDKType[];
}
/**
 * MatchPerpetualDeleveraging is an injected message used for deleveraging a
 * subaccount.
 */

export interface MatchPerpetualDeleveraging {
  /** ID of the subaccount that was liquidated. */
  liquidated?: SubaccountId;
  /** The ID of the perpetual that was liquidated. */

  perpetualId: number;
  /** An ordered list of fills created by this liquidation. */

  fills: MatchPerpetualDeleveraging_Fill[];
  /**
   * Flag denoting whether the deleveraging operation was for the purpose
   * of final settlement. Final settlement matches are at the oracle price,
   * whereas deleveraging happens at the bankruptcy price of the deleveraged
   * subaccount.
   */

  isFinalSettlement: boolean;
}
/**
 * MatchPerpetualDeleveraging is an injected message used for deleveraging a
 * subaccount.
 */

export interface MatchPerpetualDeleveragingSDKType {
  liquidated?: SubaccountIdSDKType;
  perpetual_id: number;
  fills: MatchPerpetualDeleveraging_FillSDKType[];
  is_final_settlement: boolean;
}
/** Fill represents a fill between the liquidated and offsetting subaccount. */

export interface MatchPerpetualDeleveraging_Fill {
  /**
   * ID of the subaccount that was used to offset the liquidated subaccount's
   * position.
   */
  offsettingSubaccountId?: SubaccountId;
  /**
   * The amount filled between the liquidated and offsetting position, in
   * base quantums.
   * TODO(CLOB-571): update to use SerializableInt.
   */

  fillAmount: Long;
}
/** Fill represents a fill between the liquidated and offsetting subaccount. */

export interface MatchPerpetualDeleveraging_FillSDKType {
  offsetting_subaccount_id?: SubaccountIdSDKType;
  fill_amount: Long;
}

function createBaseClobMatch(): ClobMatch {
  return {
    matchOrders: undefined,
    matchPerpetualLiquidation: undefined,
    matchPerpetualDeleveraging: undefined
  };
}

export const ClobMatch = {
  encode(message: ClobMatch, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.matchOrders !== undefined) {
      MatchOrders.encode(message.matchOrders, writer.uint32(10).fork()).ldelim();
    }

    if (message.matchPerpetualLiquidation !== undefined) {
      MatchPerpetualLiquidation.encode(message.matchPerpetualLiquidation, writer.uint32(18).fork()).ldelim();
    }

    if (message.matchPerpetualDeleveraging !== undefined) {
      MatchPerpetualDeleveraging.encode(message.matchPerpetualDeleveraging, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClobMatch {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClobMatch();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.matchOrders = MatchOrders.decode(reader, reader.uint32());
          break;

        case 2:
          message.matchPerpetualLiquidation = MatchPerpetualLiquidation.decode(reader, reader.uint32());
          break;

        case 3:
          message.matchPerpetualDeleveraging = MatchPerpetualDeleveraging.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<ClobMatch>): ClobMatch {
    const message = createBaseClobMatch();
    message.matchOrders = object.matchOrders !== undefined && object.matchOrders !== null ? MatchOrders.fromPartial(object.matchOrders) : undefined;
    message.matchPerpetualLiquidation = object.matchPerpetualLiquidation !== undefined && object.matchPerpetualLiquidation !== null ? MatchPerpetualLiquidation.fromPartial(object.matchPerpetualLiquidation) : undefined;
    message.matchPerpetualDeleveraging = object.matchPerpetualDeleveraging !== undefined && object.matchPerpetualDeleveraging !== null ? MatchPerpetualDeleveraging.fromPartial(object.matchPerpetualDeleveraging) : undefined;
    return message;
  }

};

function createBaseMakerFill(): MakerFill {
  return {
    fillAmount: Long.UZERO,
    makerOrderId: undefined
  };
}

export const MakerFill = {
  encode(message: MakerFill, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.fillAmount.isZero()) {
      writer.uint32(8).uint64(message.fillAmount);
    }

    if (message.makerOrderId !== undefined) {
      OrderId.encode(message.makerOrderId, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MakerFill {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMakerFill();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.fillAmount = (reader.uint64() as Long);
          break;

        case 2:
          message.makerOrderId = OrderId.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MakerFill>): MakerFill {
    const message = createBaseMakerFill();
    message.fillAmount = object.fillAmount !== undefined && object.fillAmount !== null ? Long.fromValue(object.fillAmount) : Long.UZERO;
    message.makerOrderId = object.makerOrderId !== undefined && object.makerOrderId !== null ? OrderId.fromPartial(object.makerOrderId) : undefined;
    return message;
  }

};

function createBaseMatchOrders(): MatchOrders {
  return {
    takerOrderId: undefined,
    fills: []
  };
}

export const MatchOrders = {
  encode(message: MatchOrders, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.takerOrderId !== undefined) {
      OrderId.encode(message.takerOrderId, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.fills) {
      MakerFill.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchOrders {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchOrders();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.takerOrderId = OrderId.decode(reader, reader.uint32());
          break;

        case 2:
          message.fills.push(MakerFill.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MatchOrders>): MatchOrders {
    const message = createBaseMatchOrders();
    message.takerOrderId = object.takerOrderId !== undefined && object.takerOrderId !== null ? OrderId.fromPartial(object.takerOrderId) : undefined;
    message.fills = object.fills?.map(e => MakerFill.fromPartial(e)) || [];
    return message;
  }

};

function createBaseMatchPerpetualLiquidation(): MatchPerpetualLiquidation {
  return {
    liquidated: undefined,
    clobPairId: 0,
    perpetualId: 0,
    totalSize: Long.UZERO,
    isBuy: false,
    fills: []
  };
}

export const MatchPerpetualLiquidation = {
  encode(message: MatchPerpetualLiquidation, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.liquidated !== undefined) {
      SubaccountId.encode(message.liquidated, writer.uint32(10).fork()).ldelim();
    }

    if (message.clobPairId !== 0) {
      writer.uint32(16).uint32(message.clobPairId);
    }

    if (message.perpetualId !== 0) {
      writer.uint32(24).uint32(message.perpetualId);
    }

    if (!message.totalSize.isZero()) {
      writer.uint32(32).uint64(message.totalSize);
    }

    if (message.isBuy === true) {
      writer.uint32(40).bool(message.isBuy);
    }

    for (const v of message.fills) {
      MakerFill.encode(v!, writer.uint32(50).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualLiquidation {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchPerpetualLiquidation();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.liquidated = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.clobPairId = reader.uint32();
          break;

        case 3:
          message.perpetualId = reader.uint32();
          break;

        case 4:
          message.totalSize = (reader.uint64() as Long);
          break;

        case 5:
          message.isBuy = reader.bool();
          break;

        case 6:
          message.fills.push(MakerFill.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MatchPerpetualLiquidation>): MatchPerpetualLiquidation {
    const message = createBaseMatchPerpetualLiquidation();
    message.liquidated = object.liquidated !== undefined && object.liquidated !== null ? SubaccountId.fromPartial(object.liquidated) : undefined;
    message.clobPairId = object.clobPairId ?? 0;
    message.perpetualId = object.perpetualId ?? 0;
    message.totalSize = object.totalSize !== undefined && object.totalSize !== null ? Long.fromValue(object.totalSize) : Long.UZERO;
    message.isBuy = object.isBuy ?? false;
    message.fills = object.fills?.map(e => MakerFill.fromPartial(e)) || [];
    return message;
  }

};

function createBaseMatchPerpetualDeleveraging(): MatchPerpetualDeleveraging {
  return {
    liquidated: undefined,
    perpetualId: 0,
    fills: [],
    isFinalSettlement: false
  };
}

export const MatchPerpetualDeleveraging = {
  encode(message: MatchPerpetualDeleveraging, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.liquidated !== undefined) {
      SubaccountId.encode(message.liquidated, writer.uint32(10).fork()).ldelim();
    }

    if (message.perpetualId !== 0) {
      writer.uint32(16).uint32(message.perpetualId);
    }

    for (const v of message.fills) {
      MatchPerpetualDeleveraging_Fill.encode(v!, writer.uint32(26).fork()).ldelim();
    }

    if (message.isFinalSettlement === true) {
      writer.uint32(32).bool(message.isFinalSettlement);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualDeleveraging {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchPerpetualDeleveraging();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.liquidated = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.perpetualId = reader.uint32();
          break;

        case 3:
          message.fills.push(MatchPerpetualDeleveraging_Fill.decode(reader, reader.uint32()));
          break;

        case 4:
          message.isFinalSettlement = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MatchPerpetualDeleveraging>): MatchPerpetualDeleveraging {
    const message = createBaseMatchPerpetualDeleveraging();
    message.liquidated = object.liquidated !== undefined && object.liquidated !== null ? SubaccountId.fromPartial(object.liquidated) : undefined;
    message.perpetualId = object.perpetualId ?? 0;
    message.fills = object.fills?.map(e => MatchPerpetualDeleveraging_Fill.fromPartial(e)) || [];
    message.isFinalSettlement = object.isFinalSettlement ?? false;
    return message;
  }

};

function createBaseMatchPerpetualDeleveraging_Fill(): MatchPerpetualDeleveraging_Fill {
  return {
    offsettingSubaccountId: undefined,
    fillAmount: Long.UZERO
  };
}

export const MatchPerpetualDeleveraging_Fill = {
  encode(message: MatchPerpetualDeleveraging_Fill, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.offsettingSubaccountId !== undefined) {
      SubaccountId.encode(message.offsettingSubaccountId, writer.uint32(10).fork()).ldelim();
    }

    if (!message.fillAmount.isZero()) {
      writer.uint32(16).uint64(message.fillAmount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualDeleveraging_Fill {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMatchPerpetualDeleveraging_Fill();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.offsettingSubaccountId = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.fillAmount = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MatchPerpetualDeleveraging_Fill>): MatchPerpetualDeleveraging_Fill {
    const message = createBaseMatchPerpetualDeleveraging_Fill();
    message.offsettingSubaccountId = object.offsettingSubaccountId !== undefined && object.offsettingSubaccountId !== null ? SubaccountId.fromPartial(object.offsettingSubaccountId) : undefined;
    message.fillAmount = object.fillAmount !== undefined && object.fillAmount !== null ? Long.fromValue(object.fillAmount) : Long.UZERO;
    return message;
  }

};