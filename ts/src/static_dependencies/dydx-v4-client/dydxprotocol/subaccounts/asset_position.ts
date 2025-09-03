import { Long, DeepPartial } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
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

function createBaseAssetPosition(): AssetPosition {
  return {
    assetId: 0,
    quantums: new Uint8Array(),
    index: Long.UZERO
  };
}

export const AssetPosition = {
  encode(message: AssetPosition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.assetId !== 0) {
      writer.uint32(8).uint32(message.assetId);
    }

    if (message.quantums.length !== 0) {
      writer.uint32(18).bytes(message.quantums);
    }

    if (!message.index.isZero()) {
      writer.uint32(24).uint64(message.index);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AssetPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAssetPosition();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.assetId = reader.uint32();
          break;

        case 2:
          message.quantums = reader.bytes();
          break;

        case 3:
          message.index = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<AssetPosition>): AssetPosition {
    const message = createBaseAssetPosition();
    message.assetId = object.assetId ?? 0;
    message.quantums = object.quantums ?? new Uint8Array();
    message.index = object.index !== undefined && object.index !== null ? Long.fromValue(object.index) : Long.UZERO;
    return message;
  }

};