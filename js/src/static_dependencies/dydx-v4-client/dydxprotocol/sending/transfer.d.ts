import { SubaccountId, SubaccountIdSDKType } from "../subaccounts/subaccount.js";
import { Coin, CoinSDKType } from "../../cosmos/base/v1beta1/coin.js";
import { DeepPartial } from "../../helpers.js";
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
export declare const Transfer: {
    encode(message: Transfer, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Transfer;
    fromPartial(object: DeepPartial<Transfer>): Transfer;
};
export declare const MsgDepositToSubaccount: {
    encode(message: MsgDepositToSubaccount, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgDepositToSubaccount;
    fromPartial(object: DeepPartial<MsgDepositToSubaccount>): MsgDepositToSubaccount;
};
export declare const MsgWithdrawFromSubaccount: {
    encode(message: MsgWithdrawFromSubaccount, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdrawFromSubaccount;
    fromPartial(object: DeepPartial<MsgWithdrawFromSubaccount>): MsgWithdrawFromSubaccount;
};
export declare const MsgSendFromModuleToAccount: {
    encode(message: MsgSendFromModuleToAccount, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendFromModuleToAccount;
    fromPartial(object: DeepPartial<MsgSendFromModuleToAccount>): MsgSendFromModuleToAccount;
};
