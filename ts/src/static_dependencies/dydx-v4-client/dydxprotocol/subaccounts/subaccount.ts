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

function createBaseSubaccountId(): SubaccountId {
  return {
    owner: "",
    number: 0
  };
}

export const SubaccountId = {
  encode(message: SubaccountId, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }

    if (message.number !== 0) {
      writer.uint32(16).uint32(message.number);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SubaccountId {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubaccountId();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;

        case 2:
          message.number = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<SubaccountId>): SubaccountId {
    const message = createBaseSubaccountId();
    message.owner = object.owner ?? "";
    message.number = object.number ?? 0;
    return message;
  }

};

function createBaseSubaccount(): Subaccount {
  return {
    id: undefined,
    assetPositions: [],
    perpetualPositions: [],
    marginEnabled: false
  };
}

export const Subaccount = {
  encode(message: Subaccount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      SubaccountId.encode(message.id, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.assetPositions) {
      AssetPosition.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    for (const v of message.perpetualPositions) {
      PerpetualPosition.encode(v!, writer.uint32(26).fork()).ldelim();
    }

    if (message.marginEnabled === true) {
      writer.uint32(32).bool(message.marginEnabled);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Subaccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSubaccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.id = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.assetPositions.push(AssetPosition.decode(reader, reader.uint32()));
          break;

        case 3:
          message.perpetualPositions.push(PerpetualPosition.decode(reader, reader.uint32()));
          break;

        case 4:
          message.marginEnabled = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<Subaccount>): Subaccount {
    const message = createBaseSubaccount();
    message.id = object.id !== undefined && object.id !== null ? SubaccountId.fromPartial(object.id) : undefined;
    message.assetPositions = object.assetPositions?.map(e => AssetPosition.fromPartial(e)) || [];
    message.perpetualPositions = object.perpetualPositions?.map(e => PerpetualPosition.fromPartial(e)) || [];
    message.marginEnabled = object.marginEnabled ?? false;
    return message;
  }

};