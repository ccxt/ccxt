import _m0 from "protobufjs/minimal.js";
import { DeepPartial, Long } from "../../helpers.js";
/** LiquidationsConfig stores all configurable fields related to liquidations. */

export interface LiquidationsConfig {
  /**
   * The maximum liquidation fee (in parts-per-million). This fee goes
   * 100% to the insurance fund.
   */
  maxLiquidationFeePpm: number;
  /**
   * Limits around how much of a single position can be liquidated
   * within a single block.
   */

  positionBlockLimits?: PositionBlockLimits;
  /**
   * Limits around how many quote quantums from a single subaccount can
   * be liquidated within a single block.
   */

  subaccountBlockLimits?: SubaccountBlockLimits;
  /**
   * Config about how the fillable-price spread from the oracle price
   * increases based on the adjusted bankruptcy rating of the subaccount.
   */

  fillablePriceConfig?: FillablePriceConfig;
}
/** LiquidationsConfig stores all configurable fields related to liquidations. */

export interface LiquidationsConfigSDKType {
  max_liquidation_fee_ppm: number;
  position_block_limits?: PositionBlockLimitsSDKType;
  subaccount_block_limits?: SubaccountBlockLimitsSDKType;
  fillable_price_config?: FillablePriceConfigSDKType;
}
/**
 * PositionBlockLimits stores all configurable fields related to limits
 * around how much of a single position can be liquidated within a single block.
 */

export interface PositionBlockLimits {
  /**
   * The minimum amount of quantums to liquidate for each message (in
   * quote quantums).
   * Overridden by the maximum size of the position.
   */
  minPositionNotionalLiquidated: Long;
  /**
   * The maximum portion of the position liquidated (in parts-per-
   * million). Overridden by min_position_notional_liquidated.
   */

  maxPositionPortionLiquidatedPpm: number;
}
/**
 * PositionBlockLimits stores all configurable fields related to limits
 * around how much of a single position can be liquidated within a single block.
 */

export interface PositionBlockLimitsSDKType {
  min_position_notional_liquidated: Long;
  max_position_portion_liquidated_ppm: number;
}
/**
 * SubaccountBlockLimits stores all configurable fields related to limits
 * around how many quote quantums from a single subaccount can
 * be liquidated within a single block.
 */

export interface SubaccountBlockLimits {
  /**
   * The maximum notional amount that a single subaccount can have
   * liquidated (in quote quantums) per block.
   */
  maxNotionalLiquidated: Long;
  /**
   * The maximum insurance-fund payout amount for a given subaccount
   * per block. I.e. how much it can cover for that subaccount.
   */

  maxQuantumsInsuranceLost: Long;
}
/**
 * SubaccountBlockLimits stores all configurable fields related to limits
 * around how many quote quantums from a single subaccount can
 * be liquidated within a single block.
 */

export interface SubaccountBlockLimitsSDKType {
  max_notional_liquidated: Long;
  max_quantums_insurance_lost: Long;
}
/**
 * FillablePriceConfig stores all configurable fields related to calculating
 * the fillable price for liquidating a position.
 */

export interface FillablePriceConfig {
  /** The rate at which the Adjusted Bankruptcy Rating increases. */
  bankruptcyAdjustmentPpm: number;
  /**
   * The maximum value that the liquidation spread can take, as
   * a ratio against the position's maintenance margin.
   */

  spreadToMaintenanceMarginRatioPpm: number;
}
/**
 * FillablePriceConfig stores all configurable fields related to calculating
 * the fillable price for liquidating a position.
 */

export interface FillablePriceConfigSDKType {
  bankruptcy_adjustment_ppm: number;
  spread_to_maintenance_margin_ratio_ppm: number;
}

function createBaseLiquidationsConfig(): LiquidationsConfig {
  return {
    maxLiquidationFeePpm: 0,
    positionBlockLimits: undefined,
    subaccountBlockLimits: undefined,
    fillablePriceConfig: undefined
  };
}

export const LiquidationsConfig = {
  encode(message: LiquidationsConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.maxLiquidationFeePpm !== 0) {
      writer.uint32(8).uint32(message.maxLiquidationFeePpm);
    }

    if (message.positionBlockLimits !== undefined) {
      PositionBlockLimits.encode(message.positionBlockLimits, writer.uint32(18).fork()).ldelim();
    }

    if (message.subaccountBlockLimits !== undefined) {
      SubaccountBlockLimits.encode(message.subaccountBlockLimits, writer.uint32(26).fork()).ldelim();
    }

    if (message.fillablePriceConfig !== undefined) {
      FillablePriceConfig.encode(message.fillablePriceConfig, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LiquidationsConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidationsConfig();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.maxLiquidationFeePpm = reader.uint32();
          break;

        case 2:
          message.positionBlockLimits = PositionBlockLimits.decode(reader, reader.uint32());
          break;

        case 3:
          message.subaccountBlockLimits = SubaccountBlockLimits.decode(reader, reader.uint32());
          break;

        case 4:
          message.fillablePriceConfig = FillablePriceConfig.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<LiquidationsConfig>): LiquidationsConfig {
    const message = createBaseLiquidationsConfig();
    message.maxLiquidationFeePpm = object.maxLiquidationFeePpm ?? 0;
    message.positionBlockLimits = object.positionBlockLimits !== undefined && object.positionBlockLimits !== null ? PositionBlockLimits.fromPartial(object.positionBlockLimits) : undefined;
    message.subaccountBlockLimits = object.subaccountBlockLimits !== undefined && object.subaccountBlockLimits !== null ? SubaccountBlockLimits.fromPartial(object.subaccountBlockLimits) : undefined;
    message.fillablePriceConfig = object.fillablePriceConfig !== undefined && object.fillablePriceConfig !== null ? FillablePriceConfig.fromPartial(object.fillablePriceConfig) : undefined;
    return message;
  }

};

function createBasePositionBlockLimits(): PositionBlockLimits {
  return {
    minPositionNotionalLiquidated: Long.UZERO,
    maxPositionPortionLiquidatedPpm: 0
  };
}

export const PositionBlockLimits = {
  encode(message: PositionBlockLimits, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.minPositionNotionalLiquidated.isZero()) {
      writer.uint32(8).uint64(message.minPositionNotionalLiquidated);
    }

    if (message.maxPositionPortionLiquidatedPpm !== 0) {
      writer.uint32(16).uint32(message.maxPositionPortionLiquidatedPpm);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PositionBlockLimits {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionBlockLimits();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.minPositionNotionalLiquidated = (reader.uint64() as Long);
          break;

        case 2:
          message.maxPositionPortionLiquidatedPpm = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<PositionBlockLimits>): PositionBlockLimits {
    const message = createBasePositionBlockLimits();
    message.minPositionNotionalLiquidated = object.minPositionNotionalLiquidated !== undefined && object.minPositionNotionalLiquidated !== null ? Long.fromValue(object.minPositionNotionalLiquidated) : Long.UZERO;
    message.maxPositionPortionLiquidatedPpm = object.maxPositionPortionLiquidatedPpm ?? 0;
    return message;
  }

};

function createBaseSubaccountBlockLimits(): SubaccountBlockLimits {
  return {
    maxNotionalLiquidated: Long.UZERO,
    maxQuantumsInsuranceLost: Long.UZERO
  };
}

export const SubaccountBlockLimits = {
  encode(message: SubaccountBlockLimits, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.maxNotionalLiquidated.isZero()) {
      writer.uint32(8).uint64(message.maxNotionalLiquidated);
    }

    if (!message.maxQuantumsInsuranceLost.isZero()) {
      writer.uint32(16).uint64(message.maxQuantumsInsuranceLost);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountBlockLimits {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubaccountBlockLimits();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.maxNotionalLiquidated = (reader.uint64() as Long);
          break;

        case 2:
          message.maxQuantumsInsuranceLost = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<SubaccountBlockLimits>): SubaccountBlockLimits {
    const message = createBaseSubaccountBlockLimits();
    message.maxNotionalLiquidated = object.maxNotionalLiquidated !== undefined && object.maxNotionalLiquidated !== null ? Long.fromValue(object.maxNotionalLiquidated) : Long.UZERO;
    message.maxQuantumsInsuranceLost = object.maxQuantumsInsuranceLost !== undefined && object.maxQuantumsInsuranceLost !== null ? Long.fromValue(object.maxQuantumsInsuranceLost) : Long.UZERO;
    return message;
  }

};

function createBaseFillablePriceConfig(): FillablePriceConfig {
  return {
    bankruptcyAdjustmentPpm: 0,
    spreadToMaintenanceMarginRatioPpm: 0
  };
}

export const FillablePriceConfig = {
  encode(message: FillablePriceConfig, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.bankruptcyAdjustmentPpm !== 0) {
      writer.uint32(8).uint32(message.bankruptcyAdjustmentPpm);
    }

    if (message.spreadToMaintenanceMarginRatioPpm !== 0) {
      writer.uint32(16).uint32(message.spreadToMaintenanceMarginRatioPpm);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FillablePriceConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFillablePriceConfig();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.bankruptcyAdjustmentPpm = reader.uint32();
          break;

        case 2:
          message.spreadToMaintenanceMarginRatioPpm = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<FillablePriceConfig>): FillablePriceConfig {
    const message = createBaseFillablePriceConfig();
    message.bankruptcyAdjustmentPpm = object.bankruptcyAdjustmentPpm ?? 0;
    message.spreadToMaintenanceMarginRatioPpm = object.spreadToMaintenanceMarginRatioPpm ?? 0;
    return message;
  }

};