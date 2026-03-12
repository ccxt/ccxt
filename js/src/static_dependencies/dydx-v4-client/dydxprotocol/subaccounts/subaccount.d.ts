import { AssetPosition, AssetPositionSDKType } from "./asset_position.js";
import { PerpetualPosition, PerpetualPositionSDKType } from "./perpetual_position.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/** SubaccountId defines a unique identifier for a Subaccount. */
export interface SubaccountId {
    /** The address of the wallet that owns this subaccount. */
    owner: string;
    /**
     * The unique number of this subaccount for the owner.
     * Currently limited to 128*1000 subaccounts per owner.
     */
    number: number;
}
/** SubaccountId defines a unique identifier for a Subaccount. */
export interface SubaccountIdSDKType {
    owner: string;
    number: number;
}
/**
 * Subaccount defines a single sub-account for a given address.
 * Subaccounts are uniquely indexed by a subaccountNumber/owner pair.
 */
export interface Subaccount {
    /** The Id of the Subaccount */
    id?: SubaccountId;
    /**
     * All `AssetPosition`s associated with this subaccount.
     * Always sorted ascending by `asset_id`.
     */
    assetPositions: AssetPosition[];
    /**
     * All `PerpetualPosition`s associated with this subaccount.
     * Always sorted ascending by `perpetual_id.
     */
    perpetualPositions: PerpetualPosition[];
    /**
     * Set by the owner. If true, then margin trades can be made in this
     * subaccount.
     */
    marginEnabled: boolean;
}
/**
 * Subaccount defines a single sub-account for a given address.
 * Subaccounts are uniquely indexed by a subaccountNumber/owner pair.
 */
export interface SubaccountSDKType {
    id?: SubaccountIdSDKType;
    asset_positions: AssetPositionSDKType[];
    perpetual_positions: PerpetualPositionSDKType[];
    margin_enabled: boolean;
}
export declare const SubaccountId: {
    encode(message: SubaccountId, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountId;
    fromPartial(object: DeepPartial<SubaccountId>): SubaccountId;
};
export declare const Subaccount: {
    encode(message: Subaccount, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Subaccount;
    fromPartial(object: DeepPartial<Subaccount>): Subaccount;
};
