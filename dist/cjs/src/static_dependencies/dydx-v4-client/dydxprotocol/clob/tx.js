'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var order = require('./order.js');
var subaccount = require('../subaccounts/subaccount.js');
require('./clob_pair.js');
var _m0 = require('protobufjs/minimal.js');
require('../../helpers.js');
require('./order_removals.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

function createBaseMsgPlaceOrder() {
    return {
        order: undefined
    };
}
const MsgPlaceOrder = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.order !== undefined) {
            order.Order.encode(message.order, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPlaceOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.order = order.Order.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgPlaceOrder();
        message.order = object.order !== undefined && object.order !== null ? order.Order.fromPartial(object.order) : undefined;
        return message;
    }
};
function createBaseMsgCancelOrder() {
    return {
        orderId: undefined,
        goodTilBlock: undefined,
        goodTilBlockTime: undefined
    };
}
const MsgCancelOrder = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.orderId !== undefined) {
            order.OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.goodTilBlock !== undefined) {
            writer.uint32(16).uint32(message.goodTilBlock);
        }
        if (message.goodTilBlockTime !== undefined) {
            writer.uint32(29).fixed32(message.goodTilBlockTime);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCancelOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = order.OrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.goodTilBlock = reader.uint32();
                    break;
                case 3:
                    message.goodTilBlockTime = reader.fixed32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgCancelOrder();
        message.orderId = object.orderId !== undefined && object.orderId !== null ? order.OrderId.fromPartial(object.orderId) : undefined;
        message.goodTilBlock = object.goodTilBlock ?? undefined;
        message.goodTilBlockTime = object.goodTilBlockTime ?? undefined;
        return message;
    }
};
function createBaseMsgBatchCancel() {
    return {
        subaccountId: undefined,
        shortTermCancels: [],
        goodTilBlock: 0
    };
}
const MsgBatchCancel = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.subaccountId !== undefined) {
            subaccount.SubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.shortTermCancels) {
            OrderBatch.encode(v, writer.uint32(18).fork()).ldelim();
        }
        if (message.goodTilBlock !== 0) {
            writer.uint32(24).uint32(message.goodTilBlock);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgBatchCancel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subaccountId = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.shortTermCancels.push(OrderBatch.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.goodTilBlock = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgBatchCancel();
        message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? subaccount.SubaccountId.fromPartial(object.subaccountId) : undefined;
        message.shortTermCancels = object.shortTermCancels?.map(e => OrderBatch.fromPartial(e)) || [];
        message.goodTilBlock = object.goodTilBlock ?? 0;
        return message;
    }
};
function createBaseOrderBatch() {
    return {
        clobPairId: 0,
        clientIds: []
    };
}
const OrderBatch = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.clobPairId !== 0) {
            writer.uint32(8).uint32(message.clobPairId);
        }
        writer.uint32(18).fork();
        for (const v of message.clientIds) {
            writer.uint32(v);
        }
        writer.ldelim();
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderBatch();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.clobPairId = reader.uint32();
                    break;
                case 2:
                    if ((tag & 7) === 2) {
                        const end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2) {
                            message.clientIds.push(reader.uint32());
                        }
                    }
                    else {
                        message.clientIds.push(reader.uint32());
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
        const message = createBaseOrderBatch();
        message.clobPairId = object.clobPairId ?? 0;
        message.clientIds = object.clientIds?.map(e => e) || [];
        return message;
    }
};

exports.MsgBatchCancel = MsgBatchCancel;
exports.MsgCancelOrder = MsgCancelOrder;
exports.MsgPlaceOrder = MsgPlaceOrder;
exports.OrderBatch = OrderBatch;
