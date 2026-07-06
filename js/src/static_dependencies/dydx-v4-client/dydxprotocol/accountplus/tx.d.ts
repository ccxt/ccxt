import _m0 from "protobufjs/minimal.js";
import { DeepPartial } from "../../helpers.js";
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticator {
    sender: string;
    authenticatorType: string;
    data: Uint8Array;
}
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticatorSDKType {
    sender: string;
    authenticator_type: string;
    data: Uint8Array;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponse {
    /** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
    success: boolean;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponseSDKType {
    success: boolean;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticator {
    sender: string;
    id: Long;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticatorSDKType {
    sender: string;
    id: Long;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponse {
    /**
     * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
     * type.
     */
    success: boolean;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponseSDKType {
    success: boolean;
}
/** MsgSetActiveState sets the active state of the module. */
export interface MsgSetActiveState {
    /** Authority is the address that may send this message. */
    authority: string;
    active: boolean;
}
/** MsgSetActiveState sets the active state of the module. */
export interface MsgSetActiveStateSDKType {
    authority: string;
    active: boolean;
}
/** MsgSetActiveStateResponse defines the Msg/SetActiveState response type. */
export interface MsgSetActiveStateResponse {
}
/** MsgSetActiveStateResponse defines the Msg/SetActiveState response type. */
export interface MsgSetActiveStateResponseSDKType {
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtension {
    /**
     * selected_authenticators holds the authenticator_id for the chosen
     * authenticator per message.
     */
    selectedAuthenticators: Long[];
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtensionSDKType {
    selected_authenticators: Long[];
}
export declare const MsgAddAuthenticator: {
    encode(message: MsgAddAuthenticator, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddAuthenticator;
    fromPartial(object: DeepPartial<MsgAddAuthenticator>): MsgAddAuthenticator;
};
export declare const MsgAddAuthenticatorResponse: {
    encode(message: MsgAddAuthenticatorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddAuthenticatorResponse;
    fromPartial(object: DeepPartial<MsgAddAuthenticatorResponse>): MsgAddAuthenticatorResponse;
};
export declare const MsgRemoveAuthenticator: {
    encode(message: MsgRemoveAuthenticator, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveAuthenticator;
    fromPartial(object: DeepPartial<MsgRemoveAuthenticator>): MsgRemoveAuthenticator;
};
export declare const MsgRemoveAuthenticatorResponse: {
    encode(message: MsgRemoveAuthenticatorResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgRemoveAuthenticatorResponse;
    fromPartial(object: DeepPartial<MsgRemoveAuthenticatorResponse>): MsgRemoveAuthenticatorResponse;
};
export declare const MsgSetActiveState: {
    encode(message: MsgSetActiveState, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetActiveState;
    fromPartial(object: DeepPartial<MsgSetActiveState>): MsgSetActiveState;
};
export declare const MsgSetActiveStateResponse: {
    encode(_: MsgSetActiveStateResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetActiveStateResponse;
    fromPartial(_: DeepPartial<MsgSetActiveStateResponse>): MsgSetActiveStateResponse;
};
export declare const TxExtension: {
    encode(message: TxExtension, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TxExtension;
    fromPartial(object: DeepPartial<TxExtension>): TxExtension;
};
