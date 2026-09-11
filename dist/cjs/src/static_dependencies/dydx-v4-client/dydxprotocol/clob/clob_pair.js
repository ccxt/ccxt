'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('protobufjs/minimal.js');
require('../../helpers.js');

// ----------------------------------------------------------------------------
/** Status of the CLOB. */
exports.ClobPair_Status = void 0;
(function (ClobPair_Status) {
    /** STATUS_UNSPECIFIED - Default value. This value is invalid and unused. */
    ClobPair_Status[ClobPair_Status["STATUS_UNSPECIFIED"] = 0] = "STATUS_UNSPECIFIED";
    /** STATUS_ACTIVE - STATUS_ACTIVE represents an active clob pair. */
    ClobPair_Status[ClobPair_Status["STATUS_ACTIVE"] = 1] = "STATUS_ACTIVE";
    /**
     * STATUS_PAUSED - STATUS_PAUSED behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPair_Status[ClobPair_Status["STATUS_PAUSED"] = 2] = "STATUS_PAUSED";
    /**
     * STATUS_CANCEL_ONLY - STATUS_CANCEL_ONLY behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPair_Status[ClobPair_Status["STATUS_CANCEL_ONLY"] = 3] = "STATUS_CANCEL_ONLY";
    /**
     * STATUS_POST_ONLY - STATUS_POST_ONLY behavior is unfinalized.
     * TODO(DEC-600): update this documentation.
     */
    ClobPair_Status[ClobPair_Status["STATUS_POST_ONLY"] = 4] = "STATUS_POST_ONLY";
    /**
     * STATUS_INITIALIZING - STATUS_INITIALIZING represents a newly-added clob pair.
     * Clob pairs in this state only accept orders which are
     * both short-term and post-only.
     */
    ClobPair_Status[ClobPair_Status["STATUS_INITIALIZING"] = 5] = "STATUS_INITIALIZING";
    /**
     * STATUS_FINAL_SETTLEMENT - STATUS_FINAL_SETTLEMENT represents a clob pair which is deactivated
     * and trading has ceased. All open positions will be closed by the
     * protocol. Open stateful orders will be cancelled. Open short-term
     * orders will be left to expire.
     */
    ClobPair_Status[ClobPair_Status["STATUS_FINAL_SETTLEMENT"] = 6] = "STATUS_FINAL_SETTLEMENT";
    ClobPair_Status[ClobPair_Status["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(exports.ClobPair_Status || (exports.ClobPair_Status = {}));
