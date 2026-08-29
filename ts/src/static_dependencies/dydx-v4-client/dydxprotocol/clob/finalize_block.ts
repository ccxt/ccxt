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

function createBaseClobStagedFinalizeBlockEvent(): ClobStagedFinalizeBlockEvent {
  return {
    createClobPair: undefined
  };
}

export const ClobStagedFinalizeBlockEvent = {
  encode(message: ClobStagedFinalizeBlockEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.createClobPair !== undefined) {
      ClobPair.encode(message.createClobPair, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ClobStagedFinalizeBlockEvent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClobStagedFinalizeBlockEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.createClobPair = ClobPair.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<ClobStagedFinalizeBlockEvent>): ClobStagedFinalizeBlockEvent {
    const message = createBaseClobStagedFinalizeBlockEvent();
    message.createClobPair = object.createClobPair !== undefined && object.createClobPair !== null ? ClobPair.fromPartial(object.createClobPair) : undefined;
    return message;
  }

};