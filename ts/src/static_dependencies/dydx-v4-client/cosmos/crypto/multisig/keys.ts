import { Any, AnySDKType } from "../../../google/protobuf/any.js";
import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../../helpers.js";
/**
 * LegacyAminoPubKey specifies a public key type
 * which nests multiple public keys and a threshold,
 * it uses legacy amino address rules.
 */

export interface LegacyAminoPubKey {
  threshold: number;
  publicKeys: Any[];
}
/**
 * LegacyAminoPubKey specifies a public key type
 * which nests multiple public keys and a threshold,
 * it uses legacy amino address rules.
 */

export interface LegacyAminoPubKeySDKType {
  threshold: number;
  public_keys: AnySDKType[];
}

function createBaseLegacyAminoPubKey(): LegacyAminoPubKey {
  return {
    threshold: 0,
    publicKeys: []
  };
}

export const LegacyAminoPubKey = {
  encode(message: LegacyAminoPubKey, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.threshold !== 0) {
      writer.uint32(8).uint32(message.threshold);
    }

    for (const v of message.publicKeys) {
      Any.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LegacyAminoPubKey {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLegacyAminoPubKey();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.threshold = reader.uint32();
          break;

        case 2:
          message.publicKeys.push(Any.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<LegacyAminoPubKey>): LegacyAminoPubKey {
    const message = createBaseLegacyAminoPubKey();
    message.threshold = object.threshold ?? 0;
    message.publicKeys = object.publicKeys?.map(e => Any.fromPartial(e)) || [];
    return message;
  }

};