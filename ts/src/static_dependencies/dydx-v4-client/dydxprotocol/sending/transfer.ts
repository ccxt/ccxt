import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import { Coin, CoinSDKType } from "../../cosmos/base/v1beta1/coin.js";
import { Long, DeepPartial } from "../../helpers.js";
import _m0 from "protobufjs/minimal.js";
/** Transfer represents a single transfer between two subaccounts. */

export interface Transfer {
  /** The sender subaccount ID. */
  sender?: SubaccountId;
  /** The recipient subaccount ID. */

  recipient?: SubaccountId;
  /** Id of the asset to transfer. */

  assetId: number;
  /** The amount of asset to transfer */

  amount: Long;
}
/** Transfer represents a single transfer between two subaccounts. */

export interface TransferSDKType {
  sender?: SubaccountIdSDKType;
  recipient?: SubaccountIdSDKType;
  asset_id: number;
  amount: Long;
}
/**
 * MsgDepositToSubaccount represents a single transfer from an `x/bank`
 * account to an `x/subaccounts` subaccount.
 */

export interface MsgDepositToSubaccount {
  /** The sender wallet address. */
  sender: string;
  /** The recipient subaccount ID. */

  recipient?: SubaccountId;
  /** Id of the asset to transfer. */

  assetId: number;
  /** The number of quantums of asset to transfer. */

  quantums: Long;
}
/**
 * MsgDepositToSubaccount represents a single transfer from an `x/bank`
 * account to an `x/subaccounts` subaccount.
 */

export interface MsgDepositToSubaccountSDKType {
  sender: string;
  recipient?: SubaccountIdSDKType;
  asset_id: number;
  quantums: Long;
}
/**
 * MsgWithdrawFromSubaccount represents a single transfer from an
 * `x/subaccounts` subaccount to an `x/bank` account.
 */

export interface MsgWithdrawFromSubaccount {
  /** The sender subaccount ID. */
  sender?: SubaccountId;
  /** The recipient wallet address. */

  recipient: string;
  /** Id of the asset to transfer. */

  assetId: number;
  /** The number of quantums of asset to transfer. */

  quantums: Long;
}
/**
 * MsgWithdrawFromSubaccount represents a single transfer from an
 * `x/subaccounts` subaccount to an `x/bank` account.
 */

export interface MsgWithdrawFromSubaccountSDKType {
  sender?: SubaccountIdSDKType;
  recipient: string;
  asset_id: number;
  quantums: Long;
}
/**
 * MsgSendFromModuleToAccount represents a single transfer from a module
 * to an `x/bank` account (can be either a module account address or a user
 * account address).
 * Should only be executed by governance.
 */

export interface MsgSendFromModuleToAccount {
  authority: string;
  /** The sender module name. */

  senderModuleName: string;
  /**
   * The recipient account address (can be either a module account address
   * or a user account address).
   */

  recipient: string;
  /** The coin to transfer, which specifies both denom and amount. */

  coin?: Coin;
}
/**
 * MsgSendFromModuleToAccount represents a single transfer from a module
 * to an `x/bank` account (can be either a module account address or a user
 * account address).
 * Should only be executed by governance.
 */

export interface MsgSendFromModuleToAccountSDKType {
  authority: string;
  sender_module_name: string;
  recipient: string;
  coin?: CoinSDKType;
}

function createBaseTransfer(): Transfer {
  return {
    sender: undefined,
    recipient: undefined,
    assetId: 0,
    amount: Long.UZERO
  };
}

export const Transfer = {
  encode(message: Transfer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== undefined) {
      SubaccountId.encode(message.sender, writer.uint32(10).fork()).ldelim();
    }

    if (message.recipient !== undefined) {
      SubaccountId.encode(message.recipient, writer.uint32(18).fork()).ldelim();
    }

    if (message.assetId !== 0) {
      writer.uint32(24).uint32(message.assetId);
    }

    if (!message.amount.isZero()) {
      writer.uint32(32).uint64(message.amount);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Transfer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransfer();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = SubaccountId.decode(reader, reader.uint32());
          break;

        case 2:
          message.recipient = SubaccountId.decode(reader, reader.uint32());
          break;

        case 3:
          message.assetId = reader.uint32();
          break;

        case 4:
          message.amount = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<Transfer>): Transfer {
    const message = createBaseTransfer();
    message.sender = object.sender !== undefined && object.sender !== null ? SubaccountId.fromPartial(object.sender) : undefined;
    message.recipient = object.recipient !== undefined && object.recipient !== null ? SubaccountId.fromPartial(object.recipient) : undefined;
    message.assetId = object.assetId ?? 0;
    message.amount = object.amount !== undefined && object.amount !== null ? Long.fromValue(object.amount) : Long.UZERO;
    return message;
  }

};

function createBaseMsgDepositToSubaccount(): MsgDepositToSubaccount {
  return {
    sender: "",
    recipient: undefined,
    assetId: 0,
    quantums: Long.UZERO
  };
}

export const MsgDepositToSubaccount = {
  encode(message: MsgDepositToSubaccount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }

    if (message.recipient !== undefined) {
      SubaccountId.encode(message.recipient, writer.uint32(18).fork()).ldelim();
    }

    if (message.assetId !== 0) {
      writer.uint32(24).uint32(message.assetId);
    }

    if (!message.quantums.isZero()) {
      writer.uint32(32).uint64(message.quantums);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositToSubaccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDepositToSubaccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;

        case 2:
          message.recipient = SubaccountId.decode(reader, reader.uint32());
          break;

        case 3:
          message.assetId = reader.uint32();
          break;

        case 4:
          message.quantums = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgDepositToSubaccount>): MsgDepositToSubaccount {
    const message = createBaseMsgDepositToSubaccount();
    message.sender = object.sender ?? "";
    message.recipient = object.recipient !== undefined && object.recipient !== null ? SubaccountId.fromPartial(object.recipient) : undefined;
    message.assetId = object.assetId ?? 0;
    message.quantums = object.quantums !== undefined && object.quantums !== null ? Long.fromValue(object.quantums) : Long.UZERO;
    return message;
  }

};

function createBaseMsgWithdrawFromSubaccount(): MsgWithdrawFromSubaccount {
  return {
    sender: undefined,
    recipient: "",
    assetId: 0,
    quantums: Long.UZERO
  };
}

export const MsgWithdrawFromSubaccount = {
  encode(message: MsgWithdrawFromSubaccount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.sender !== undefined) {
      SubaccountId.encode(message.sender, writer.uint32(18).fork()).ldelim();
    }

    if (message.recipient !== "") {
      writer.uint32(10).string(message.recipient);
    }

    if (message.assetId !== 0) {
      writer.uint32(24).uint32(message.assetId);
    }

    if (!message.quantums.isZero()) {
      writer.uint32(32).uint64(message.quantums);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdrawFromSubaccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawFromSubaccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.sender = SubaccountId.decode(reader, reader.uint32());
          break;

        case 1:
          message.recipient = reader.string();
          break;

        case 3:
          message.assetId = reader.uint32();
          break;

        case 4:
          message.quantums = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgWithdrawFromSubaccount>): MsgWithdrawFromSubaccount {
    const message = createBaseMsgWithdrawFromSubaccount();
    message.sender = object.sender !== undefined && object.sender !== null ? SubaccountId.fromPartial(object.sender) : undefined;
    message.recipient = object.recipient ?? "";
    message.assetId = object.assetId ?? 0;
    message.quantums = object.quantums !== undefined && object.quantums !== null ? Long.fromValue(object.quantums) : Long.UZERO;
    return message;
  }

};

function createBaseMsgSendFromModuleToAccount(): MsgSendFromModuleToAccount {
  return {
    authority: "",
    senderModuleName: "",
    recipient: "",
    coin: undefined
  };
}

export const MsgSendFromModuleToAccount = {
  encode(message: MsgSendFromModuleToAccount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.senderModuleName !== "") {
      writer.uint32(18).string(message.senderModuleName);
    }

    if (message.recipient !== "") {
      writer.uint32(26).string(message.recipient);
    }

    if (message.coin !== undefined) {
      Coin.encode(message.coin, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendFromModuleToAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendFromModuleToAccount();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.senderModuleName = reader.string();
          break;

        case 3:
          message.recipient = reader.string();
          break;

        case 4:
          message.coin = Coin.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromPartial(object: DeepPartial<MsgSendFromModuleToAccount>): MsgSendFromModuleToAccount {
    const message = createBaseMsgSendFromModuleToAccount();
    message.authority = object.authority ?? "";
    message.senderModuleName = object.senderModuleName ?? "";
    message.recipient = object.recipient ?? "";
    message.coin = object.coin !== undefined && object.coin !== null ? Coin.fromPartial(object.coin) : undefined;
    return message;
  }

};