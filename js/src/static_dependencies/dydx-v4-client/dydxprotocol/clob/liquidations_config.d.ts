import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
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
export declare const LiquidationsConfig: {
    encode(message: LiquidationsConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): LiquidationsConfig;
    fromPartial(object: DeepPartial<LiquidationsConfig>): LiquidationsConfig;
};
export declare const PositionBlockLimits: {
    encode(message: PositionBlockLimits, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PositionBlockLimits;
    fromPartial(object: DeepPartial<PositionBlockLimits>): PositionBlockLimits;
};
export declare const SubaccountBlockLimits: {
    encode(message: SubaccountBlockLimits, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountBlockLimits;
    fromPartial(object: DeepPartial<SubaccountBlockLimits>): SubaccountBlockLimits;
};
export declare const FillablePriceConfig: {
    encode(message: FillablePriceConfig, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): FillablePriceConfig;
    fromPartial(object: DeepPartial<FillablePriceConfig>): FillablePriceConfig;
};
