'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./order.js');
require('protobufjs/minimal.js');

exports.OrderRemoval_RemovalReason = void 0;
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
})(exports.OrderRemoval_RemovalReason || (exports.OrderRemoval_RemovalReason = {}));
