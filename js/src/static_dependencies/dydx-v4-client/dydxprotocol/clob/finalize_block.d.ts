import { ClobPair, ClobPairSDKType } from "./clob_pair.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/**
 * ClobStagedFinalizeBlockEvent defines a CLOB event staged during
 * FinalizeBlock.
 */
export interface ClobStagedFinalizeBlockEvent {
    /** create_clob_pair indicates a new CLOB pair creation. */
    createClobPair?: ClobPair;
}
/**
 * ClobStagedFinalizeBlockEvent defines a CLOB event staged during
 * FinalizeBlock.
 */
export interface ClobStagedFinalizeBlockEventSDKType {
    create_clob_pair?: ClobPairSDKType;
}
export declare const ClobStagedFinalizeBlockEvent: {
    encode(message: ClobStagedFinalizeBlockEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClobStagedFinalizeBlockEvent;
    fromPartial(object: DeepPartial<ClobStagedFinalizeBlockEvent>): ClobStagedFinalizeBlockEvent;
};
