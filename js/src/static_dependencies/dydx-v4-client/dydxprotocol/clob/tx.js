import { Order, OrderId } from "./order.js";
import { SubaccountId } from "../subaccounts/subaccount.js";
import { ClobPair } from "./clob_pair.js";
import { EquityTierLimitConfiguration } from "./equity_tier_limit_config.js";
import { BlockRateLimitConfiguration } from "./block_rate_limit_config.js";
import { LiquidationsConfig } from "./liquidations_config.js";
import { ClobMatch } from "./matches.js";
import { OrderRemoval } from "./order_removals.js";
import _m0 from "protobufjs/minimal.js";
function createBaseMsgCreateClobPair() {
    return {
        authority: "",
        clobPair: undefined
    };
}
export const MsgCreateClobPair = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.authority !== "") {
            writer.uint32(10).string(message.authority);
        }
        if (message.clobPair !== undefined) {
            ClobPair.encode(message.clobPair, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClobPair();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.clobPair = ClobPair.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgCreateClobPair();
        message.authority = object.authority ?? "";
        message.clobPair = object.clobPair !== undefined && object.clobPair !== null ? ClobPair.fromPartial(object.clobPair) : undefined;
        return message;
    }
};
function createBaseMsgCreateClobPairResponse() {
    return {};
}
export const MsgCreateClobPairResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCreateClobPairResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgCreateClobPairResponse();
        return message;
    }
};
function createBaseMsgProposedOperations() {
    return {
        operationsQueue: []
    };
}
export const MsgProposedOperations = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.operationsQueue) {
            OperationRaw.encode(v, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgProposedOperations();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.operationsQueue.push(OperationRaw.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgProposedOperations();
        message.operationsQueue = object.operationsQueue?.map(e => OperationRaw.fromPartial(e)) || [];
        return message;
    }
};
function createBaseMsgProposedOperationsResponse() {
    return {};
}
export const MsgProposedOperationsResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgProposedOperationsResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgProposedOperationsResponse();
        return message;
    }
};
function createBaseMsgPlaceOrder() {
    return {
        order: undefined
    };
}
export const MsgPlaceOrder = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.order !== undefined) {
            Order.encode(message.order, writer.uint32(10).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPlaceOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.order = Order.decode(reader, reader.uint32());
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
        message.order = object.order !== undefined && object.order !== null ? Order.fromPartial(object.order) : undefined;
        return message;
    }
};
function createBaseMsgPlaceOrderResponse() {
    return {};
}
export const MsgPlaceOrderResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgPlaceOrderResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgPlaceOrderResponse();
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
export const MsgCancelOrder = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.orderId !== undefined) {
            OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
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
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCancelOrder();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = OrderId.decode(reader, reader.uint32());
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
        message.orderId = object.orderId !== undefined && object.orderId !== null ? OrderId.fromPartial(object.orderId) : undefined;
        message.goodTilBlock = object.goodTilBlock ?? undefined;
        message.goodTilBlockTime = object.goodTilBlockTime ?? undefined;
        return message;
    }
};
function createBaseMsgCancelOrderResponse() {
    return {};
}
export const MsgCancelOrderResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgCancelOrderResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgCancelOrderResponse();
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
export const MsgBatchCancel = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.subaccountId !== undefined) {
            SubaccountId.encode(message.subaccountId, writer.uint32(10).fork()).ldelim();
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
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgBatchCancel();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.subaccountId = SubaccountId.decode(reader, reader.uint32());
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
        message.subaccountId = object.subaccountId !== undefined && object.subaccountId !== null ? SubaccountId.fromPartial(object.subaccountId) : undefined;
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
export const OrderBatch = {
    encode(message, writer = _m0.Writer.create()) {
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
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
function createBaseMsgBatchCancelResponse() {
    return {
        shortTermSucceeded: [],
        shortTermFailed: []
    };
}
export const MsgBatchCancelResponse = {
    encode(message, writer = _m0.Writer.create()) {
        for (const v of message.shortTermSucceeded) {
            OrderBatch.encode(v, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.shortTermFailed) {
            OrderBatch.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgBatchCancelResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.shortTermSucceeded.push(OrderBatch.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.shortTermFailed.push(OrderBatch.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgBatchCancelResponse();
        message.shortTermSucceeded = object.shortTermSucceeded?.map(e => OrderBatch.fromPartial(e)) || [];
        message.shortTermFailed = object.shortTermFailed?.map(e => OrderBatch.fromPartial(e)) || [];
        return message;
    }
};
function createBaseMsgUpdateClobPair() {
    return {
        authority: "",
        clobPair: undefined
    };
}
export const MsgUpdateClobPair = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.authority !== "") {
            writer.uint32(10).string(message.authority);
        }
        if (message.clobPair !== undefined) {
            ClobPair.encode(message.clobPair, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateClobPair();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.clobPair = ClobPair.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateClobPair();
        message.authority = object.authority ?? "";
        message.clobPair = object.clobPair !== undefined && object.clobPair !== null ? ClobPair.fromPartial(object.clobPair) : undefined;
        return message;
    }
};
function createBaseMsgUpdateClobPairResponse() {
    return {};
}
export const MsgUpdateClobPairResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateClobPairResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgUpdateClobPairResponse();
        return message;
    }
};
function createBaseOperationRaw() {
    return {
        match: undefined,
        shortTermOrderPlacement: undefined,
        orderRemoval: undefined
    };
}
export const OperationRaw = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.match !== undefined) {
            ClobMatch.encode(message.match, writer.uint32(10).fork()).ldelim();
        }
        if (message.shortTermOrderPlacement !== undefined) {
            writer.uint32(18).bytes(message.shortTermOrderPlacement);
        }
        if (message.orderRemoval !== undefined) {
            OrderRemoval.encode(message.orderRemoval, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOperationRaw();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.match = ClobMatch.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.shortTermOrderPlacement = reader.bytes();
                    break;
                case 3:
                    message.orderRemoval = OrderRemoval.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOperationRaw();
        message.match = object.match !== undefined && object.match !== null ? ClobMatch.fromPartial(object.match) : undefined;
        message.shortTermOrderPlacement = object.shortTermOrderPlacement ?? undefined;
        message.orderRemoval = object.orderRemoval !== undefined && object.orderRemoval !== null ? OrderRemoval.fromPartial(object.orderRemoval) : undefined;
        return message;
    }
};
function createBaseMsgUpdateEquityTierLimitConfiguration() {
    return {
        authority: "",
        equityTierLimitConfig: undefined
    };
}
export const MsgUpdateEquityTierLimitConfiguration = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.authority !== "") {
            writer.uint32(10).string(message.authority);
        }
        if (message.equityTierLimitConfig !== undefined) {
            EquityTierLimitConfiguration.encode(message.equityTierLimitConfig, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateEquityTierLimitConfiguration();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.equityTierLimitConfig = EquityTierLimitConfiguration.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateEquityTierLimitConfiguration();
        message.authority = object.authority ?? "";
        message.equityTierLimitConfig = object.equityTierLimitConfig !== undefined && object.equityTierLimitConfig !== null ? EquityTierLimitConfiguration.fromPartial(object.equityTierLimitConfig) : undefined;
        return message;
    }
};
function createBaseMsgUpdateEquityTierLimitConfigurationResponse() {
    return {};
}
export const MsgUpdateEquityTierLimitConfigurationResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateEquityTierLimitConfigurationResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgUpdateEquityTierLimitConfigurationResponse();
        return message;
    }
};
function createBaseMsgUpdateBlockRateLimitConfiguration() {
    return {
        authority: "",
        blockRateLimitConfig: undefined
    };
}
export const MsgUpdateBlockRateLimitConfiguration = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.authority !== "") {
            writer.uint32(10).string(message.authority);
        }
        if (message.blockRateLimitConfig !== undefined) {
            BlockRateLimitConfiguration.encode(message.blockRateLimitConfig, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateBlockRateLimitConfiguration();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 3:
                    message.blockRateLimitConfig = BlockRateLimitConfiguration.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateBlockRateLimitConfiguration();
        message.authority = object.authority ?? "";
        message.blockRateLimitConfig = object.blockRateLimitConfig !== undefined && object.blockRateLimitConfig !== null ? BlockRateLimitConfiguration.fromPartial(object.blockRateLimitConfig) : undefined;
        return message;
    }
};
function createBaseMsgUpdateBlockRateLimitConfigurationResponse() {
    return {};
}
export const MsgUpdateBlockRateLimitConfigurationResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateBlockRateLimitConfigurationResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgUpdateBlockRateLimitConfigurationResponse();
        return message;
    }
};
function createBaseMsgUpdateLiquidationsConfig() {
    return {
        authority: "",
        liquidationsConfig: undefined
    };
}
export const MsgUpdateLiquidationsConfig = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.authority !== "") {
            writer.uint32(10).string(message.authority);
        }
        if (message.liquidationsConfig !== undefined) {
            LiquidationsConfig.encode(message.liquidationsConfig, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateLiquidationsConfig();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.authority = reader.string();
                    break;
                case 2:
                    message.liquidationsConfig = LiquidationsConfig.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMsgUpdateLiquidationsConfig();
        message.authority = object.authority ?? "";
        message.liquidationsConfig = object.liquidationsConfig !== undefined && object.liquidationsConfig !== null ? LiquidationsConfig.fromPartial(object.liquidationsConfig) : undefined;
        return message;
    }
};
function createBaseMsgUpdateLiquidationsConfigResponse() {
    return {};
}
export const MsgUpdateLiquidationsConfigResponse = {
    encode(_, writer = _m0.Writer.create()) {
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMsgUpdateLiquidationsConfigResponse();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(_) {
        const message = createBaseMsgUpdateLiquidationsConfigResponse();
        return message;
    }
};
