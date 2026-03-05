import { OrderId } from "./order.js";
import { SubaccountId } from "../subaccounts/subaccount.js";
import _m0 from "protobufjs/minimal.js";
import { Long } from "../../helpers.js";
function createBaseClobMatch() {
    return {
        matchOrders: undefined,
        matchPerpetualLiquidation: undefined,
        matchPerpetualDeleveraging: undefined
    };
}
export const ClobMatch = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.matchOrders !== undefined) {
            MatchOrders.encode(message.matchOrders, writer.uint32(10).fork()).ldelim();
        }
        if (message.matchPerpetualLiquidation !== undefined) {
            MatchPerpetualLiquidation.encode(message.matchPerpetualLiquidation, writer.uint32(18).fork()).ldelim();
        }
        if (message.matchPerpetualDeleveraging !== undefined) {
            MatchPerpetualDeleveraging.encode(message.matchPerpetualDeleveraging, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseClobMatch();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.matchOrders = MatchOrders.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.matchPerpetualLiquidation = MatchPerpetualLiquidation.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.matchPerpetualDeleveraging = MatchPerpetualDeleveraging.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseClobMatch();
        message.matchOrders = object.matchOrders !== undefined && object.matchOrders !== null ? MatchOrders.fromPartial(object.matchOrders) : undefined;
        message.matchPerpetualLiquidation = object.matchPerpetualLiquidation !== undefined && object.matchPerpetualLiquidation !== null ? MatchPerpetualLiquidation.fromPartial(object.matchPerpetualLiquidation) : undefined;
        message.matchPerpetualDeleveraging = object.matchPerpetualDeleveraging !== undefined && object.matchPerpetualDeleveraging !== null ? MatchPerpetualDeleveraging.fromPartial(object.matchPerpetualDeleveraging) : undefined;
        return message;
    }
};
function createBaseMakerFill() {
    return {
        fillAmount: Long.UZERO,
        makerOrderId: undefined
    };
}
export const MakerFill = {
    encode(message, writer = _m0.Writer.create()) {
        if (!message.fillAmount.isZero()) {
            writer.uint32(8).uint64(message.fillAmount);
        }
        if (message.makerOrderId !== undefined) {
            OrderId.encode(message.makerOrderId, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMakerFill();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.fillAmount = reader.uint64();
                    break;
                case 2:
                    message.makerOrderId = OrderId.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMakerFill();
        message.fillAmount = object.fillAmount !== undefined && object.fillAmount !== null ? Long.fromValue(object.fillAmount) : Long.UZERO;
        message.makerOrderId = object.makerOrderId !== undefined && object.makerOrderId !== null ? OrderId.fromPartial(object.makerOrderId) : undefined;
        return message;
    }
};
function createBaseMatchOrders() {
    return {
        takerOrderId: undefined,
        fills: []
    };
}
export const MatchOrders = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.takerOrderId !== undefined) {
            OrderId.encode(message.takerOrderId, writer.uint32(10).fork()).ldelim();
        }
        for (const v of message.fills) {
            MakerFill.encode(v, writer.uint32(18).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMatchOrders();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.takerOrderId = OrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.fills.push(MakerFill.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMatchOrders();
        message.takerOrderId = object.takerOrderId !== undefined && object.takerOrderId !== null ? OrderId.fromPartial(object.takerOrderId) : undefined;
        message.fills = object.fills?.map(e => MakerFill.fromPartial(e)) || [];
        return message;
    }
};
function createBaseMatchPerpetualLiquidation() {
    return {
        liquidated: undefined,
        clobPairId: 0,
        perpetualId: 0,
        totalSize: Long.UZERO,
        isBuy: false,
        fills: []
    };
}
export const MatchPerpetualLiquidation = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.liquidated !== undefined) {
            SubaccountId.encode(message.liquidated, writer.uint32(10).fork()).ldelim();
        }
        if (message.clobPairId !== 0) {
            writer.uint32(16).uint32(message.clobPairId);
        }
        if (message.perpetualId !== 0) {
            writer.uint32(24).uint32(message.perpetualId);
        }
        if (!message.totalSize.isZero()) {
            writer.uint32(32).uint64(message.totalSize);
        }
        if (message.isBuy === true) {
            writer.uint32(40).bool(message.isBuy);
        }
        for (const v of message.fills) {
            MakerFill.encode(v, writer.uint32(50).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMatchPerpetualLiquidation();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidated = SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.clobPairId = reader.uint32();
                    break;
                case 3:
                    message.perpetualId = reader.uint32();
                    break;
                case 4:
                    message.totalSize = reader.uint64();
                    break;
                case 5:
                    message.isBuy = reader.bool();
                    break;
                case 6:
                    message.fills.push(MakerFill.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMatchPerpetualLiquidation();
        message.liquidated = object.liquidated !== undefined && object.liquidated !== null ? SubaccountId.fromPartial(object.liquidated) : undefined;
        message.clobPairId = object.clobPairId ?? 0;
        message.perpetualId = object.perpetualId ?? 0;
        message.totalSize = object.totalSize !== undefined && object.totalSize !== null ? Long.fromValue(object.totalSize) : Long.UZERO;
        message.isBuy = object.isBuy ?? false;
        message.fills = object.fills?.map(e => MakerFill.fromPartial(e)) || [];
        return message;
    }
};
function createBaseMatchPerpetualDeleveraging() {
    return {
        liquidated: undefined,
        perpetualId: 0,
        fills: [],
        isFinalSettlement: false
    };
}
export const MatchPerpetualDeleveraging = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.liquidated !== undefined) {
            SubaccountId.encode(message.liquidated, writer.uint32(10).fork()).ldelim();
        }
        if (message.perpetualId !== 0) {
            writer.uint32(16).uint32(message.perpetualId);
        }
        for (const v of message.fills) {
            MatchPerpetualDeleveraging_Fill.encode(v, writer.uint32(26).fork()).ldelim();
        }
        if (message.isFinalSettlement === true) {
            writer.uint32(32).bool(message.isFinalSettlement);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMatchPerpetualDeleveraging();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.liquidated = SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.perpetualId = reader.uint32();
                    break;
                case 3:
                    message.fills.push(MatchPerpetualDeleveraging_Fill.decode(reader, reader.uint32()));
                    break;
                case 4:
                    message.isFinalSettlement = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMatchPerpetualDeleveraging();
        message.liquidated = object.liquidated !== undefined && object.liquidated !== null ? SubaccountId.fromPartial(object.liquidated) : undefined;
        message.perpetualId = object.perpetualId ?? 0;
        message.fills = object.fills?.map(e => MatchPerpetualDeleveraging_Fill.fromPartial(e)) || [];
        message.isFinalSettlement = object.isFinalSettlement ?? false;
        return message;
    }
};
function createBaseMatchPerpetualDeleveraging_Fill() {
    return {
        offsettingSubaccountId: undefined,
        fillAmount: Long.UZERO
    };
}
export const MatchPerpetualDeleveraging_Fill = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.offsettingSubaccountId !== undefined) {
            SubaccountId.encode(message.offsettingSubaccountId, writer.uint32(10).fork()).ldelim();
        }
        if (!message.fillAmount.isZero()) {
            writer.uint32(16).uint64(message.fillAmount);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseMatchPerpetualDeleveraging_Fill();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.offsettingSubaccountId = SubaccountId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.fillAmount = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseMatchPerpetualDeleveraging_Fill();
        message.offsettingSubaccountId = object.offsettingSubaccountId !== undefined && object.offsettingSubaccountId !== null ? SubaccountId.fromPartial(object.offsettingSubaccountId) : undefined;
        message.fillAmount = object.fillAmount !== undefined && object.fillAmount !== null ? Long.fromValue(object.fillAmount) : Long.UZERO;
        return message;
    }
};
