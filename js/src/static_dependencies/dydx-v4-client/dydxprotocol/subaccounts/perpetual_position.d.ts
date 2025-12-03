import * as _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/**
 * PerpetualPositions are an account’s positions of a `Perpetual`.
 * Therefore they hold any information needed to trade perpetuals.
 */
export interface PerpetualPosition {
    /** The `Id` of the `Perpetual`. */
    perpetualId: number;
    /** The size of the position in base quantums. */
    quantums: Uint8Array;
    /**
     * The funding_index of the `Perpetual` the last time this position was
     * settled.
     */
    fundingIndex: Uint8Array;
    /** The quote_balance of the `Perpetual`. */
    quoteBalance: Uint8Array;
}
/**
 * PerpetualPositions are an account’s positions of a `Perpetual`.
 * Therefore they hold any information needed to trade perpetuals.
 */
export interface PerpetualPositionSDKType {
    perpetual_id: number;
    quantums: Uint8Array;
    funding_index: Uint8Array;
    quote_balance: Uint8Array;
}
export declare const PerpetualPosition: {
    encode(message: PerpetualPosition, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualPosition;
    fromPartial(object: DeepPartial<PerpetualPosition>): PerpetualPosition;
};
