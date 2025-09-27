import * as _m0 from "protobufjs/minimal";
import { DeepPartial } from "../../helpers";
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

function createBasePerpetualPosition(): PerpetualPosition {
  return {
    perpetualId: 0,
    quantums: new Uint8Array(),
    fundingIndex: new Uint8Array(),
    quoteBalance: new Uint8Array()
  };
}

export const PerpetualPosition = {
  encode(message: PerpetualPosition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.perpetualId !== 0) {
      writer.uint32(8).uint32(message.perpetualId);
    }

    if (message.quantums.length !== 0) {
      writer.uint32(18).bytes(message.quantums);
    }

    if (message.fundingIndex.length !== 0) {
      writer.uint32(26).bytes(message.fundingIndex);
    }

    if (message.quoteBalance.length !== 0) {
      writer.uint32(34).bytes(message.quoteBalance);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PerpetualPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePerpetualPosition();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.perpetualId = reader.uint32();
          break;

        case 2:
          message.quantums = reader.bytes();
          break;

        case 3:
          message.fundingIndex = reader.bytes();
          break;

        case 4:
          message.quoteBalance = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<PerpetualPosition>): PerpetualPosition {
    const message = createBasePerpetualPosition();
    message.perpetualId = object.perpetualId ?? 0;
    message.quantums = object.quantums ?? new Uint8Array();
    message.fundingIndex = object.fundingIndex ?? new Uint8Array();
    message.quoteBalance = object.quoteBalance ?? new Uint8Array();
    return message;
  }

};