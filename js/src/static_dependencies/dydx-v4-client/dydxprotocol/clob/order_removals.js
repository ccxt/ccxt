import { OrderId } from "./order.js";
import _m0 from "protobufjs/minimal.js";
export var OrderRemoval_RemovalReason;
(function (OrderRemoval_RemovalReason) {
    /**
     * REMOVAL_REASON_UNSPECIFIED - REMOVAL_REASON_UNSPECIFIED represents an unspecified removal reason. This
     * removal reason is used as a catchall and should never appear on an
     * OrderRemoval in the operations queue.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_UNSPECIFIED"] = 0] = "REMOVAL_REASON_UNSPECIFIED";
    /**
     * REMOVAL_REASON_UNDERCOLLATERALIZED - REMOVAL_REASON_UNDERCOLLATERALIZED represents a removal of an order which
     * if filled in isolation with respect to the current state of the
     * subaccount would leave the subaccount undercollateralized.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_UNDERCOLLATERALIZED"] = 1] = "REMOVAL_REASON_UNDERCOLLATERALIZED";
    /**
     * REMOVAL_REASON_INVALID_REDUCE_ONLY - REMOVAL_REASON_INVALID_REDUCE_ONLY represents a removal of a reduce-only
     * order which if filled in isolation with respect to the current state of
     * the subaccount would cause the subaccount's existing position to increase
     * or change sides.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_INVALID_REDUCE_ONLY"] = 2] = "REMOVAL_REASON_INVALID_REDUCE_ONLY";
    /**
     * REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER - REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER represents a removal of
     * a stateful post-only order that was deemed invalid because it crossed
     * maker orders on the book of the proposer.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER"] = 3] = "REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER";
    /**
     * REMOVAL_REASON_INVALID_SELF_TRADE - REMOVAL_REASON_INVALID_SELF_TRADE represents a removal of a stateful
     * order that was deemed invalid because it constituted a self trade on the
     * proposers orderbook.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_INVALID_SELF_TRADE"] = 4] = "REMOVAL_REASON_INVALID_SELF_TRADE";
    /**
     * REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED - REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED represents a
     * removal of a conditional FOK order that was deemed invalid because it
     * could not be completely filled. Conditional FOK orders should always be
     * fully-filled or removed in the block after they are triggered.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED"] = 5] = "REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED";
    /**
     * REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK - REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK represents a removal
     * of a conditional IOC order.
     * Conditional IOC orders should always have their remaining size removed
     * in the block after they are triggered.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK"] = 6] = "REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK";
    /**
     * REMOVAL_REASON_FULLY_FILLED - REMOVAL_REASON_FULLY_FILLED represents a removal of an order that
     * was fully filled and should therefore be removed from state.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_FULLY_FILLED"] = 7] = "REMOVAL_REASON_FULLY_FILLED";
    /**
     * REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS - REMOVAL_REASON_FULLY_FILLED represents a removal of an order that
     *  would lead to the subaccount violating isolated subaccount constraints.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS"] = 8] = "REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS";
    /**
     * REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED - REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED represents a removal of an order
     * that was placed using an expired permissioned key.
     */
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED"] = 9] = "REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED";
    OrderRemoval_RemovalReason[OrderRemoval_RemovalReason["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(OrderRemoval_RemovalReason || (OrderRemoval_RemovalReason = {}));
export const OrderRemoval_RemovalReasonSDKType = OrderRemoval_RemovalReason;
export function orderRemoval_RemovalReasonFromJSON(object) {
    switch (object) {
        case 0:
        case "REMOVAL_REASON_UNSPECIFIED":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_UNSPECIFIED;
        case 1:
        case "REMOVAL_REASON_UNDERCOLLATERALIZED":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_UNDERCOLLATERALIZED;
        case 2:
        case "REMOVAL_REASON_INVALID_REDUCE_ONLY":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_INVALID_REDUCE_ONLY;
        case 3:
        case "REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER;
        case 4:
        case "REMOVAL_REASON_INVALID_SELF_TRADE":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_INVALID_SELF_TRADE;
        case 5:
        case "REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED;
        case 6:
        case "REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK;
        case 7:
        case "REMOVAL_REASON_FULLY_FILLED":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_FULLY_FILLED;
        case 8:
        case "REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS;
        case 9:
        case "REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED":
            return OrderRemoval_RemovalReason.REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED;
        case -1:
        case "UNRECOGNIZED":
        default:
            return OrderRemoval_RemovalReason.UNRECOGNIZED;
    }
}
export function orderRemoval_RemovalReasonToJSON(object) {
    switch (object) {
        case OrderRemoval_RemovalReason.REMOVAL_REASON_UNSPECIFIED:
            return "REMOVAL_REASON_UNSPECIFIED";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_UNDERCOLLATERALIZED:
            return "REMOVAL_REASON_UNDERCOLLATERALIZED";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_INVALID_REDUCE_ONLY:
            return "REMOVAL_REASON_INVALID_REDUCE_ONLY";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER:
            return "REMOVAL_REASON_POST_ONLY_WOULD_CROSS_MAKER_ORDER";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_INVALID_SELF_TRADE:
            return "REMOVAL_REASON_INVALID_SELF_TRADE";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED:
            return "REMOVAL_REASON_CONDITIONAL_FOK_COULD_NOT_BE_FULLY_FILLED";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK:
            return "REMOVAL_REASON_CONDITIONAL_IOC_WOULD_REST_ON_BOOK";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_FULLY_FILLED:
            return "REMOVAL_REASON_FULLY_FILLED";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS:
            return "REMOVAL_REASON_VIOLATES_ISOLATED_SUBACCOUNT_CONSTRAINTS";
        case OrderRemoval_RemovalReason.REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED:
            return "REMOVAL_REASON_PERMISSIONED_KEY_EXPIRED";
        case OrderRemoval_RemovalReason.UNRECOGNIZED:
        default:
            return "UNRECOGNIZED";
    }
}
function createBaseOrderRemoval() {
    return {
        orderId: undefined,
        removalReason: 0
    };
}
export const OrderRemoval = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.orderId !== undefined) {
            OrderId.encode(message.orderId, writer.uint32(10).fork()).ldelim();
        }
        if (message.removalReason !== 0) {
            writer.uint32(16).int32(message.removalReason);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseOrderRemoval();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.orderId = OrderId.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.removalReason = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromPartial(object) {
        const message = createBaseOrderRemoval();
        message.orderId = object.orderId !== undefined && object.orderId !== null ? OrderId.fromPartial(object.orderId) : undefined;
        message.removalReason = object.removalReason ?? 0;
        return message;
    }
};
