'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var multisig = require('../../../crypto/multisig/v1beta1/multisig.js');
var any = require('../../../../google/protobuf/any.js');
var _m0 = require('protobufjs/minimal.js');
require('../../../../helpers.js');
var index = require('../../../../long/index.cjs.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

// ----------------------------------------------------------------------------
/**
 * SignMode represents a signing mode with its own security guarantees.
 *
 * This enum should be considered a registry of all known sign modes
 * in the Cosmos ecosystem. Apps are not expected to support all known
 * sign modes. Apps that would like to support custom  sign modes are
 * encouraged to open a small PR against this file to add a new case
 * to this SignMode enum describing their sign mode so that different
 * apps have a consistent version of this enum.
 */
exports.SignMode = void 0;
(function (SignMode) {
    /**
     * SIGN_MODE_UNSPECIFIED - SIGN_MODE_UNSPECIFIED specifies an unknown signing mode and will be
     * rejected.
     */
    SignMode[SignMode["SIGN_MODE_UNSPECIFIED"] = 0] = "SIGN_MODE_UNSPECIFIED";
    /**
     * SIGN_MODE_DIRECT - SIGN_MODE_DIRECT specifies a signing mode which uses SignDoc and is
     * verified with raw bytes from Tx.
     */
    SignMode[SignMode["SIGN_MODE_DIRECT"] = 1] = "SIGN_MODE_DIRECT";
    /**
     * SIGN_MODE_TEXTUAL - SIGN_MODE_TEXTUAL is a future signing mode that will verify some
     * human-readable textual representation on top of the binary representation
     * from SIGN_MODE_DIRECT.
     *
     * Since: cosmos-sdk 0.50
     */
    SignMode[SignMode["SIGN_MODE_TEXTUAL"] = 2] = "SIGN_MODE_TEXTUAL";
    /**
     * SIGN_MODE_DIRECT_AUX - SIGN_MODE_DIRECT_AUX specifies a signing mode which uses
     * SignDocDirectAux. As opposed to SIGN_MODE_DIRECT, this sign mode does not
     * require signers signing over other signers' `signer_info`.
     *
     * Since: cosmos-sdk 0.46
     */
    SignMode[SignMode["SIGN_MODE_DIRECT_AUX"] = 3] = "SIGN_MODE_DIRECT_AUX";
    /**
     * SIGN_MODE_LEGACY_AMINO_JSON - SIGN_MODE_LEGACY_AMINO_JSON is a backwards compatibility mode which uses
     * Amino JSON and will be removed in the future.
     */
    SignMode[SignMode["SIGN_MODE_LEGACY_AMINO_JSON"] = 127] = "SIGN_MODE_LEGACY_AMINO_JSON";
    /**
     * SIGN_MODE_EIP_191 - SIGN_MODE_EIP_191 specifies the sign mode for EIP 191 signing on the Cosmos
     * SDK. Ref: https://eips.ethereum.org/EIPS/eip-191
     *
     * Currently, SIGN_MODE_EIP_191 is registered as a SignMode enum variant,
     * but is not implemented on the SDK by default. To enable EIP-191, you need
     * to pass a custom `TxConfig` that has an implementation of
     * `SignModeHandler` for EIP-191. The SDK may decide to fully support
     * EIP-191 in the future.
     *
     * Since: cosmos-sdk 0.45.2
     */
    SignMode[SignMode["SIGN_MODE_EIP_191"] = 191] = "SIGN_MODE_EIP_191";
    SignMode[SignMode["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(exports.SignMode || (exports.SignMode = {}));
const SignModeSDKType = exports.SignMode;
function signModeFromJSON(object) {
    switch (object) {
        case 0:
        case "SIGN_MODE_UNSPECIFIED":
            return exports.SignMode.SIGN_MODE_UNSPECIFIED;
        case 1:
        case "SIGN_MODE_DIRECT":
            return exports.SignMode.SIGN_MODE_DIRECT;
        case 2:
        case "SIGN_MODE_TEXTUAL":
            return exports.SignMode.SIGN_MODE_TEXTUAL;
        case 3:
        case "SIGN_MODE_DIRECT_AUX":
            return exports.SignMode.SIGN_MODE_DIRECT_AUX;
        case 127:
        case "SIGN_MODE_LEGACY_AMINO_JSON":
            return exports.SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
        case 191:
        case "SIGN_MODE_EIP_191":
            return exports.SignMode.SIGN_MODE_EIP_191;
        case -1:
        case "UNRECOGNIZED":
        default:
            return exports.SignMode.UNRECOGNIZED;
    }
}
function signModeToJSON(object) {
    switch (object) {
        case exports.SignMode.SIGN_MODE_UNSPECIFIED:
            return "SIGN_MODE_UNSPECIFIED";
        case exports.SignMode.SIGN_MODE_DIRECT:
            return "SIGN_MODE_DIRECT";
        case exports.SignMode.SIGN_MODE_TEXTUAL:
            return "SIGN_MODE_TEXTUAL";
        case exports.SignMode.SIGN_MODE_DIRECT_AUX:
            return "SIGN_MODE_DIRECT_AUX";
        case exports.SignMode.SIGN_MODE_LEGACY_AMINO_JSON:
            return "SIGN_MODE_LEGACY_AMINO_JSON";
        case exports.SignMode.SIGN_MODE_EIP_191:
            return "SIGN_MODE_EIP_191";
        case exports.SignMode.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
function createBaseSignatureDescriptors() {
    return {
        signatures: []
    };
}
const SignatureDescriptors = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        for (const v of message.signatures) {
            SignatureDescriptor.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignatureDescriptors();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.signatures.push(SignatureDescriptor.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseSignatureDescriptors();
        message.signatures = object.signatures?.map(e => SignatureDescriptor.fromPartial(e)) || [];
        return message;
    }
};
function createBaseSignatureDescriptor() {
    return {
        publicKey: undefined,
        data: undefined,
        sequence: index["default"].UZERO
    };
}
const SignatureDescriptor = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.publicKey !== undefined) {
            any.Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
        }
        if (message.data !== undefined) {
            SignatureDescriptor_Data.encode(message.data, writer.uint32(18).fork()).ldelim();
        }
        if (!message.sequence.isZero()) {
            writer.uint32(24).uint64(message.sequence);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignatureDescriptor();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.publicKey = any.Any.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.data = SignatureDescriptor_Data.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.sequence = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseSignatureDescriptor();
        message.publicKey = object.publicKey !== undefined && object.publicKey !== null ? any.Any.fromPartial(object.publicKey) : undefined;
        message.data = object.data !== undefined && object.data !== null ? SignatureDescriptor_Data.fromPartial(object.data) : undefined;
        message.sequence = object.sequence !== undefined && object.sequence !== null ? index["default"].fromValue(object.sequence) : index["default"].UZERO;
        return message;
    }
};
function createBaseSignatureDescriptor_Data() {
    return {
        single: undefined,
        multi: undefined
    };
}
const SignatureDescriptor_Data = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.single !== undefined) {
            SignatureDescriptor_Data_Single.encode(message.single, writer.uint32(10).fork()).ldelim();
        }
        if (message.multi !== undefined) {
            SignatureDescriptor_Data_Multi.encode(message.multi, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignatureDescriptor_Data();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.single = SignatureDescriptor_Data_Single.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.multi = SignatureDescriptor_Data_Multi.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseSignatureDescriptor_Data();
        message.single = object.single !== undefined && object.single !== null ? SignatureDescriptor_Data_Single.fromPartial(object.single) : undefined;
        message.multi = object.multi !== undefined && object.multi !== null ? SignatureDescriptor_Data_Multi.fromPartial(object.multi) : undefined;
        return message;
    }
};
function createBaseSignatureDescriptor_Data_Single() {
    return {
        mode: 0,
        signature: new Uint8Array()
    };
}
const SignatureDescriptor_Data_Single = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.mode !== 0) {
            writer.uint32(8).int32(message.mode);
        }
        if (message.signature.length !== 0) {
            writer.uint32(18).bytes(message.signature);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignatureDescriptor_Data_Single();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.mode = reader.int32();
                    break;
                case 2:
                    message.signature = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseSignatureDescriptor_Data_Single();
        message.mode = object.mode ?? 0;
        message.signature = object.signature ?? new Uint8Array();
        return message;
    }
};
function createBaseSignatureDescriptor_Data_Multi() {
    return {
        bitarray: undefined,
        signatures: []
    };
}
const SignatureDescriptor_Data_Multi = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.bitarray !== undefined) {
            multisig.CompactBitArray.encode(message.bitarray, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.signatures) {
            SignatureDescriptor_Data.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSignatureDescriptor_Data_Multi();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bitarray = multisig.CompactBitArray.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.signatures.push(SignatureDescriptor_Data.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseSignatureDescriptor_Data_Multi();
        message.bitarray = object.bitarray !== undefined && object.bitarray !== null ? multisig.CompactBitArray.fromPartial(object.bitarray) : undefined;
        message.signatures = object.signatures?.map(e => SignatureDescriptor_Data.fromPartial(e)) || [];
        return message;
    }
};

exports.SignModeSDKType = SignModeSDKType;
exports.SignatureDescriptor = SignatureDescriptor;
exports.SignatureDescriptor_Data = SignatureDescriptor_Data;
exports.SignatureDescriptor_Data_Multi = SignatureDescriptor_Data_Multi;
exports.SignatureDescriptor_Data_Single = SignatureDescriptor_Data_Single;
exports.SignatureDescriptors = SignatureDescriptors;
exports.signModeFromJSON = signModeFromJSON;
exports.signModeToJSON = signModeToJSON;
