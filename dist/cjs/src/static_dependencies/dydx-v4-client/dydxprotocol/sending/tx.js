'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var transfer = require('./transfer.js');
var _m0 = require('protobufjs/minimal.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

function createBaseMsgCreateTransfer() {
    return {
        transfer: undefined
    };
}
const MsgCreateTransfer = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.transfer !== undefined) {
            transfer.Transfer.encode(message.transfer, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateTransfer();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.transfer = transfer.Transfer.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateTransfer();
        message.transfer = object.transfer !== undefined && object.transfer !== null ? transfer.Transfer.fromPartial(object.transfer) : undefined;
        return message;
    }
};

exports.MsgCreateTransfer = MsgCreateTransfer;
