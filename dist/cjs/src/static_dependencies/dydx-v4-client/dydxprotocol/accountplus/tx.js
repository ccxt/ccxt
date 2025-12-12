'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _m0 = require('protobufjs/minimal.js');
require('../../helpers.js');
var index = require('../../long/index.cjs.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

// ----------------------------------------------------------------------------
function createBaseTxExtension() {
    return {
        selectedAuthenticators: []
    };
}
const TxExtension = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        writer.uint32(10).fork();
        for (const v of message.selectedAuthenticators) {
            writer.uint64(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTxExtension();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.selectedAuthenticators.push(reader.uint64());
                        }
                    }
                    else {
                        message.selectedAuthenticators.push(reader.uint64());
                    }
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseTxExtension();
        message.selectedAuthenticators = object.selectedAuthenticators?.map(e => index["default"].fromValue(e)) || [];
        return message;
    }
};

exports.TxExtension = TxExtension;
