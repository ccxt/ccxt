import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import * as _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/**
 * PerpetualLiquidationInfo holds information about a liquidation that occurred
 * for a position held by a subaccount.
 * Note this proto is defined to make it easier to hash
 * the metadata of a liquidation, and is never written to state.
 */
export interface PerpetualLiquidationInfo {
    /**
     * The id of the subaccount that got liquidated/deleveraged or was deleveraged
     * onto.
     */
    subaccountId?: SubaccountId;
    /** The id of the perpetual involved. */
    perpetualId: number;
}
/**
 * PerpetualLiquidationInfo holds information about a liquidation that occurred
 * for a position held by a subaccount.
 * Note this proto is defined to make it easier to hash
 * the metadata of a liquidation, and is never written to state.
 */
export interface PerpetualLiquidationInfoSDKType {
    subaccount_id?: SubaccountIdSDKType;
    perpetual_id: number;
}
/**
 * SubaccountLiquidationInfo holds liquidation information per-subaccount in the
 * current block.
 */
export interface SubaccountLiquidationInfo {
    /**
     * An unsorted list of unique perpetual IDs that the subaccount has previously
     * liquidated.
     */
    perpetualsLiquidated: number[];
    /**
     * The notional value (in quote quantums, determined by the oracle price) of
     * all positions liquidated for this subaccount.
     */
    notionalLiquidated: Long;
    /**
     * The amount of funds that the insurance fund has lost
     * covering this subaccount.
     */
    quantumsInsuranceLost: Long;
}
/**
 * SubaccountLiquidationInfo holds liquidation information per-subaccount in the
 * current block.
 */
export interface SubaccountLiquidationInfoSDKType {
    perpetuals_liquidated: number[];
    notional_liquidated: Long;
    quantums_insurance_lost: Long;
}
/**
 * SubaccountOpenPositionInfo holds information about open positions for a
 * perpetual.
 */
export interface SubaccountOpenPositionInfo {
    /** The id of the perpetual. */
    perpetualId: number;
    subaccountsWithLongPosition: SubaccountId[];
    subaccountsWithShortPosition: SubaccountId[];
}
/**
 * SubaccountOpenPositionInfo holds information about open positions for a
 * perpetual.
 */
export interface SubaccountOpenPositionInfoSDKType {
    perpetual_id: number;
    subaccounts_with_long_position: SubaccountIdSDKType[];
    subaccounts_with_short_position: SubaccountIdSDKType[];
}
export declare const PerpetualLiquidationInfo: {
    encode(message: PerpetualLiquidationInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualLiquidationInfo;
    fromPartial(object: DeepPartial<PerpetualLiquidationInfo>): PerpetualLiquidationInfo;
};
export declare const SubaccountLiquidationInfo: {
    encode(message: SubaccountLiquidationInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountLiquidationInfo;
    fromPartial(object: DeepPartial<SubaccountLiquidationInfo>): SubaccountLiquidationInfo;
};
export declare const SubaccountOpenPositionInfo: {
    encode(message: SubaccountOpenPositionInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountOpenPositionInfo;
    fromPartial(object: DeepPartial<SubaccountOpenPositionInfo>): SubaccountOpenPositionInfo;
};
