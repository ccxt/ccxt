import { DeepPartial } from "../../helpers.js";
import * as _m0 from "protobufjs/minimal.js";
/**
 * AssetPositions define an account’s positions of an `Asset`.
 * Therefore they hold any information needed to trade on Spot and Margin.
 */
export interface AssetPosition {
    /** The `Id` of the `Asset`. */
    assetId: number;
    /** The absolute size of the position in base quantums. */
    quantums: Uint8Array;
    /**
     * The `Index` (either `LongIndex` or `ShortIndex`) of the `Asset` the last
     * time this position was settled
     * TODO(DEC-582): pending margin trading being added.
     */
    index: Long;
}
/**
 * AssetPositions define an account’s positions of an `Asset`.
 * Therefore they hold any information needed to trade on Spot and Margin.
 */
export interface AssetPositionSDKType {
    asset_id: number;
    quantums: Uint8Array;
    index: Long;
}
export declare const AssetPosition: {
    encode(message: AssetPosition, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): AssetPosition;
    fromPartial(object: DeepPartial<AssetPosition>): AssetPosition;
};
