'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var subaccount = require('../subaccounts/subaccount.js');
var _m0 = require('protobufjs/minimal.js');
require('../../helpers.js');
var index = require('../../long/index.cjs.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var _m0__default = /*#__PURE__*/_interopDefaultLegacy(_m0);

/**
 * Represents the side of the orderbook the order will be placed on.
 * Note that Side.SIDE_UNSPECIFIED is an invalid order and cannot be
 * placed on the orderbook.
 */
exports.Order_Side = void 0;
(function (Order_Side) {
    /** SIDE_UNSPECIFIED - Default value. This value is invalid and unused. */
    Order_Side[Order_Side["SIDE_UNSPECIFIED"] = 0] = "SIDE_UNSPECIFIED";
    /** SIDE_BUY - SIDE_BUY is used to represent a BUY order. */
    Order_Side[Order_Side["SIDE_BUY"] = 1] = "SIDE_BUY";
    /** SIDE_SELL - SIDE_SELL is used to represent a SELL order. */
    Order_Side[Order_Side["SIDE_SELL"] = 2] = "SIDE_SELL";
    Order_Side[Order_Side["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(exports.Order_Side || (exports.Order_Side = {}));
/**
 * TimeInForce indicates how long an order will remain active before it
 * is executed or expires.
 */
exports.Order_TimeInForce = void 0;
(function (Order_TimeInForce) {
    /**
     * TIME_IN_FORCE_UNSPECIFIED - TIME_IN_FORCE_UNSPECIFIED represents the default behavior where an
     * order will first match with existing orders on the book, and any
     * remaining size will be added to the book as a maker order.
     */
    Order_TimeInForce[Order_TimeInForce["TIME_IN_FORCE_UNSPECIFIED"] = 0] = "TIME_IN_FORCE_UNSPECIFIED";
    /**
     * TIME_IN_FORCE_IOC - TIME_IN_FORCE_IOC enforces that an order only be matched with
     * maker orders on the book. If the order has remaining size after
     * matching with existing orders on the book, the remaining size
     * is not placed on the book.
     */
    Order_TimeInForce[Order_TimeInForce["TIME_IN_FORCE_IOC"] = 1] = "TIME_IN_FORCE_IOC";
    /**
     * TIME_IN_FORCE_POST_ONLY - TIME_IN_FORCE_POST_ONLY enforces that an order only be placed
     * on the book as a maker order. Note this means that validators will cancel
     * any newly-placed post only orders that would cross with other maker
     * orders.
     */
    Order_TimeInForce[Order_TimeInForce["TIME_IN_FORCE_POST_ONLY"] = 2] = "TIME_IN_FORCE_POST_ONLY";
    /**
     * TIME_IN_FORCE_FILL_OR_KILL - TIME_IN_FORCE_FILL_OR_KILL has been deprecated and will be removed in
     * future versions.
     */
    Order_TimeInForce[Order_TimeInForce["TIME_IN_FORCE_FILL_OR_KILL"] = 3] = "TIME_IN_FORCE_FILL_OR_KILL";
    Order_TimeInForce[Order_TimeInForce["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(exports.Order_TimeInForce || (exports.Order_TimeInForce = {}));
exports.Order_ConditionType = void 0;
(function (Order_ConditionType) {
    /**
     * CONDITION_TYPE_UNSPECIFIED - CONDITION_TYPE_UNSPECIFIED represents the default behavior where an
     * order will be placed immediately on the orderbook.
     */
    Order_ConditionType[Order_ConditionType["CONDITION_TYPE_UNSPECIFIED"] = 0] = "CONDITION_TYPE_UNSPECIFIED";
    /**
     * CONDITION_TYPE_STOP_LOSS - CONDITION_TYPE_STOP_LOSS represents a stop order. A stop order will
     * trigger when the oracle price moves at or above the trigger price for
     * buys, and at or below the trigger price for sells.
     */
    Order_ConditionType[Order_ConditionType["CONDITION_TYPE_STOP_LOSS"] = 1] = "CONDITION_TYPE_STOP_LOSS";
    /**
     * CONDITION_TYPE_TAKE_PROFIT - CONDITION_TYPE_TAKE_PROFIT represents a take profit order. A take profit
     * order will trigger when the oracle price moves at or below the trigger
     * price for buys and at or above the trigger price for sells.
     */
    Order_ConditionType[Order_ConditionType["CONDITION_TYPE_TAKE_PROFIT"] = 2] = "CONDITION_TYPE_TAKE_PROFIT";
    Order_ConditionType[Order_ConditionType["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(exports.Order_ConditionType || (exports.Order_ConditionType = {}));
function createBaseOrderId() {
    return {
        subaccountId: undefined,
        clientId: 0,
        orderFlags: 0,
        clobPairId: 0
    };
}
const OrderId = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.subaccountId !== undefined) {
            subaccount.SubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
        }
        if (message.clientId !== 0) {
            writer.uint32(21).fixed32(message.clientId);
        }
        if (message.orderFlags !== 0) {
            writer.uint32(24).uint32(message.orderFlags);
        }
        if (message.clobPairId !== 0) {
            writer.uint32(32).uint32(message.clobPairId);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderId();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subaccountId = subaccount.SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.clientId = reader.fixed32();
                    break;
                case 3:
                    message.orderFlags = reader.uint32();
                    break;
                case 4:
                    message.clobPairId = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOrderId();
        message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? subaccount.SubaccountId.fromPartial(object.subaccountId) : undefined;
        message.clientId = object.clientId ?? 0;
        message.orderFlags = object.orderFlags ?? 0;
        message.clobPairId = object.clobPairId ?? 0;
        return message;
    }
};
function createBaseOrder() {
    return {
        orderId: undefined,
        side: 0,
        quantums: index["default"].UZERO,
        subticks: index["default"].UZERO,
        goodTilBlock: undefined,
        goodTilBlockTime: undefined,
        timeInForce: 0,
        reduceOnly: false,
        clientMetadata: 0,
        conditionType: 0,
        conditionalOrderTriggerSubticks: index["default"].UZERO,
        twapParameters: undefined,
        builderCodeParameters: undefined,
        orderRouterAddress: ""
    };
}
const Order = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.orderId !== undefined) {
            OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.side !== 0) {
            writer.uint32(16).int32(message.side);
        }
        if (!message.quantums.isZero()) {
            writer.uint32(24).uint64(message.quantums);
        }
        if (!message.subticks.isZero()) {
            writer.uint32(32).uint64(message.subticks);
        }
        if (message.goodTilBlock !== undefined) {
            writer.uint32(40).uint32(message.goodTilBlock);
        }
        if (message.goodTilBlockTime !== undefined) {
            writer.uint32(53).fixed32(message.goodTilBlockTime);
        }
        if (message.timeInForce !== 0) {
            writer.uint32(56).int32(message.timeInForce);
        }
        if (message.reduceOnly === true) {
            writer.uint32(64).bool(message.reduceOnly);
        }
        if (message.clientMetadata !== 0) {
            writer.uint32(72).uint32(message.clientMetadata);
        }
        if (message.conditionType !== 0) {
            writer.uint32(80).int32(message.conditionType);
        }
        if (!message.conditionalOrderTriggerSubticks.isZero()) {
            writer.uint32(88).uint64(message.conditionalOrderTriggerSubticks);
        }
        if (message.twapParameters !== undefined) {
            TwapParameters.encode(message.twapParameters, writer.uint32(98).fork()).ldelim();
        }
        if (message.builderCodeParameters !== undefined) {
            BuilderCodeParameters.encode(message.builderCodeParameters, writer.uint32(106).fork()).ldelim();
        }
        if (message.orderRouterAddress !== "") {
            writer.uint32(114).string(message.orderRouterAddress);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = OrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.side = reader.int32();
                    break;
                case 3:
                    message.quantums = reader.uint64();
                    break;
                case 4:
                    message.subticks = reader.uint64();
                    break;
                case 5:
                    message.goodTilBlock = reader.uint32();
                    break;
                case 6:
                    message.goodTilBlockTime = reader.fixed32();
                    break;
                case 7:
                    message.timeInForce = reader.int32();
                    break;
                case 8:
                    message.reduceOnly = reader.bool();
                    break;
                case 9:
                    message.clientMetadata = reader.uint32();
                    break;
                case 10:
                    message.conditionType = reader.int32();
                    break;
                case 11:
                    message.conditionalOrderTriggerSubticks = reader.uint64();
                    break;
                case 12:
                    message.twapParameters = TwapParameters.decode(reader, reader.uint32());
                    break;
                case 13:
                    message.builderCodeParameters = BuilderCodeParameters.decode(reader, reader.uint32());
                    break;
                case 14:
                    message.orderRouterAddress = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOrder();
        message.orderId = object.orderId !== undefined && object.orderId !== null ? OrderId.fromPartial(object.orderId) : undefined;
        message.side = object.side ?? 0;
        message.quantums = object.quantums !== undefined && object.quantums !== null ? index["default"].fromValue(object.quantums) : index["default"].UZERO;
        message.subticks = object.subticks !== undefined && object.subticks !== null ? index["default"].fromValue(object.subticks) : index["default"].UZERO;
        message.goodTilBlock = object.goodTilBlock ?? undefined;
        message.goodTilBlockTime = object.goodTilBlockTime ?? undefined;
        message.timeInForce = object.timeInForce ?? 0;
        message.reduceOnly = object.reduceOnly ?? false;
        message.clientMetadata = object.clientMetadata ?? 0;
        message.conditionType = object.conditionType ?? 0;
        message.conditionalOrderTriggerSubticks = object.conditionalOrderTriggerSubticks !== undefined && object.conditionalOrderTriggerSubticks !== null ? index["default"].fromValue(object.conditionalOrderTriggerSubticks) : index["default"].UZERO;
        message.twapParameters = object.twapParameters !== undefined && object.twapParameters !== null ? TwapParameters.fromPartial(object.twapParameters) : undefined;
        message.builderCodeParameters = object.builderCodeParameters !== undefined && object.builderCodeParameters !== null ? BuilderCodeParameters.fromPartial(object.builderCodeParameters) : undefined;
        message.orderRouterAddress = object.orderRouterAddress ?? "";
        return message;
    }
};
function createBaseTwapParameters() {
    return {
        duration: 0,
        interval: 0,
        priceTolerance: 0
    };
}
const TwapParameters = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.duration !== 0) {
            writer.uint32(8).uint32(message.duration);
        }
        if (message.interval !== 0) {
            writer.uint32(16).uint32(message.interval);
        }
        if (message.priceTolerance !== 0) {
            writer.uint32(24).uint32(message.priceTolerance);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseTwapParameters();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.duration = reader.uint32();
                    break;
                case 2:
                    message.interval = reader.uint32();
                    break;
                case 3:
                    message.priceTolerance = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseTwapParameters();
        message.duration = object.duration ?? 0;
        message.interval = object.interval ?? 0;
        message.priceTolerance = object.priceTolerance ?? 0;
        return message;
    }
};
function createBaseBuilderCodeParameters() {
    return {
        builderAddress: "",
        feePpm: 0
    };
}
const BuilderCodeParameters = {
    encode(message, writer = _m0__default["default"].Writer.create()) {
        if (message.builderAddress !== "") {
            writer.uint32(10).string(message.builderAddress);
        }
        if (message.feePpm !== 0) {
            writer.uint32(16).uint32(message.feePpm);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0__default["default"].Reader ? input : new _m0__default["default"].Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBuilderCodeParameters();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.builderAddress = reader.string();
                    break;
                case 2:
                    message.feePpm = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseBuilderCodeParameters();
        message.builderAddress = object.builderAddress ?? "";
        message.feePpm = object.feePpm ?? 0;
        return message;
    }
};

exports.BuilderCodeParameters = BuilderCodeParameters;
exports.Order = Order;
exports.OrderId = OrderId;
exports.TwapParameters = TwapParameters;
