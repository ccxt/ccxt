'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var subaccount = require('../subaccounts/subaccount.js');
var _m0 = require('protobufjs/minimal.js');
require('../../helpers.js');
var index = require('../../long/index.cjs.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

// ----------------------------------------------------------------------------
function createBaseTransfer() {
    return {
        sender: undefined,
        recipient: undefined,
        assetId: 0,
        amount: index["default"].UZERO
    };
}
const Transfer = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.sender !== undefined) {
            subaccount.SubaccountId.encode(message.sender, writer.uint32(10).fork()).ldelim();
        }
        if (message.recipient !== undefined) {
            subaccount.SubaccountId.encode(message.recipient, writer.uint32(18).fork()).ldelim();
        }
        if (message.assetId !== 0) {
            writer.uint32(24).uint32(message.assetId);
        }
        if (!message.amount.isZero()) {
            writer.uint32(32).uint64(message.amount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTransfer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.recipient = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.assetId = reader.uint32();
                    break;
                case 4:
                    message.amount = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseTransfer();
        message.sender = object.sender !== undefined && object.sender !== null ? subaccount.SubaccountId.fromPartial(object.sender) : undefined;
        message.recipient = object.recipient !== undefined && object.recipient !== null ? subaccount.SubaccountId.fromPartial(object.recipient) : undefined;
        message.assetId = object.assetId ?? 0;
        message.amount = object.amount !== undefined && object.amount !== null ? index["default"].fromValue(object.amount) : index["default"].UZERO;
        return message;
    }
};
function createBaseMsgDepositToSubaccount() {
    return {
        sender: "",
        recipient: undefined,
        assetId: 0,
        quantums: index["default"].UZERO
    };
}
const MsgDepositToSubaccount = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.sender !== "") {
            writer.uint32(10).string(message.sender);
        }
        if (message.recipient !== undefined) {
            subaccount.SubaccountId.encode(message.recipient, writer.uint32(18).fork()).ldelim();
        }
        if (message.assetId !== 0) {
            writer.uint32(24).uint32(message.assetId);
        }
        if (!message.quantums.isZero()) {
            writer.uint32(32).uint64(message.quantums);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgDepositToSubaccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.sender = reader.string();
                    break;
                case 2:
                    message.recipient = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.assetId = reader.uint32();
                    break;
                case 4:
                    message.quantums = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgDepositToSubaccount();
        message.sender = object.sender ?? "";
        message.recipient = object.recipient !== undefined && object.recipient !== null ? subaccount.SubaccountId.fromPartial(object.recipient) : undefined;
        message.assetId = object.assetId ?? 0;
        message.quantums = object.quantums !== undefined && object.quantums !== null ? index["default"].fromValue(object.quantums) : index["default"].UZERO;
        return message;
    }
};
function createBaseMsgWithdrawFromSubaccount() {
    return {
        sender: undefined,
        recipient: "",
        assetId: 0,
        quantums: index["default"].UZERO
    };
}
const MsgWithdrawFromSubaccount = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.sender !== undefined) {
            subaccount.SubaccountId.encode(message.sender, writer.uint32(18).fork()).ldelim();
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
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgWithdrawFromSubaccount();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.sender = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 1:
                    message.recipient = reader.string();
                    break;
                case 3:
                    message.assetId = reader.uint32();
                    break;
                case 4:
                    message.quantums = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgWithdrawFromSubaccount();
        message.sender = object.sender !== undefined && object.sender !== null ? subaccount.SubaccountId.fromPartial(object.sender) : undefined;
        message.recipient = object.recipient ?? "";
        message.assetId = object.assetId ?? 0;
        message.quantums = object.quantums !== undefined && object.quantums !== null ? index["default"].fromValue(object.quantums) : index["default"].UZERO;
        return message;
    }
};

exports.MsgDepositToSubaccount = MsgDepositToSubaccount;
exports.MsgWithdrawFromSubaccount = MsgWithdrawFromSubaccount;
exports.Transfer = Transfer;
