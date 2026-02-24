import { OrderId, OrderIdSDKType } from "./order.js";
import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
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
export declare const ClobMatch: {
    encode(message: ClobMatch, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClobMatch;
    fromPartial(object: DeepPartial<ClobMatch>): ClobMatch;
};
export declare const MakerFill: {
    encode(message: MakerFill, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MakerFill;
    fromPartial(object: DeepPartial<MakerFill>): MakerFill;
};
export declare const MatchOrders: {
    encode(message: MatchOrders, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MatchOrders;
    fromPartial(object: DeepPartial<MatchOrders>): MatchOrders;
};
export declare const MatchPerpetualLiquidation: {
    encode(message: MatchPerpetualLiquidation, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualLiquidation;
    fromPartial(object: DeepPartial<MatchPerpetualLiquidation>): MatchPerpetualLiquidation;
};
export declare const MatchPerpetualDeleveraging: {
    encode(message: MatchPerpetualDeleveraging, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualDeleveraging;
    fromPartial(object: DeepPartial<MatchPerpetualDeleveraging>): MatchPerpetualDeleveraging;
};
export declare const MatchPerpetualDeleveraging_Fill: {
    encode(message: MatchPerpetualDeleveraging_Fill, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MatchPerpetualDeleveraging_Fill;
    fromPartial(object: DeepPartial<MatchPerpetualDeleveraging_Fill>): MatchPerpetualDeleveraging_Fill;
};
