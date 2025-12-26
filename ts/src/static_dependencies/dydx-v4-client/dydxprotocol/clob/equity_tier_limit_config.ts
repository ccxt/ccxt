import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/**
 * Defines the set of equity tiers to limit how many open orders
 * a subaccount is allowed to have.
 */

export interface EquityTierLimitConfiguration {
  /**
   * How many short term stateful orders are allowed per equity tier.
   * Specifying 0 values disables this limit.
   */
  shortTermOrderEquityTiers: EquityTierLimit[];
  /**
   * How many open stateful orders are allowed per equity tier.
   * Specifying 0 values disables this limit.
   */

  statefulOrderEquityTiers: EquityTierLimit[];
}
/**
 * Defines the set of equity tiers to limit how many open orders
 * a subaccount is allowed to have.
 */

export interface EquityTierLimitConfigurationSDKType {
  short_term_order_equity_tiers: EquityTierLimitSDKType[];
  stateful_order_equity_tiers: EquityTierLimitSDKType[];
}
/** Defines an equity tier limit. */

export interface EquityTierLimit {
  /** The total net collateral in USDC quote quantums of equity required. */
  usdTncRequired: Uint8Array;
  /** What the limit is for `usd_tnc_required`. */

  limit: number;
}
/** Defines an equity tier limit. */

export interface EquityTierLimitSDKType {
  usd_tnc_required: Uint8Array;
  limit: number;
}

function createBaseEquityTierLimitConfiguration(): EquityTierLimitConfiguration {
  return {
    shortTermOrderEquityTiers: [],
    statefulOrderEquityTiers: []
  };
}

export const EquityTierLimitConfiguration = {
  encode(message: EquityTierLimitConfiguration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.shortTermOrderEquityTiers) {
      EquityTierLimit.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.statefulOrderEquityTiers) {
      EquityTierLimit.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EquityTierLimitConfiguration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquityTierLimitConfiguration();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.shortTermOrderEquityTiers.push(EquityTierLimit.decode(reader, reader.uint32()));
          break;

        case 2:
          message.statefulOrderEquityTiers.push(EquityTierLimit.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<EquityTierLimitConfiguration>): EquityTierLimitConfiguration {
    const message = createBaseEquityTierLimitConfiguration();
    message.shortTermOrderEquityTiers = object.shortTermOrderEquityTiers?.map(e => EquityTierLimit.fromPartial(e)) || [];
    message.statefulOrderEquityTiers = object.statefulOrderEquityTiers?.map(e => EquityTierLimit.fromPartial(e)) || [];
    return message;
  }

};

function createBaseEquityTierLimit(): EquityTierLimit {
  return {
    usdTncRequired: new Uint8Array(),
    limit: 0
  };
}

export const EquityTierLimit = {
  encode(message: EquityTierLimit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.usdTncRequired.length !== 0) {
      writer.uint32(10).bytes(message.usdTncRequired);
    }

    if (message.limit !== 0) {
      writer.uint32(16).uint32(message.limit);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EquityTierLimit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEquityTierLimit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.usdTncRequired = reader.bytes();
          break;

        case 2:
          message.limit = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<EquityTierLimit>): EquityTierLimit {
    const message = createBaseEquityTierLimit();
    message.usdTncRequired = object.usdTncRequired ?? new Uint8Array();
    message.limit = object.limit ?? 0;
    return message;
  }

};