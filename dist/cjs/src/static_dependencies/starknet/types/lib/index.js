'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./contract/index.js');

exports.TransactionType = void 0;
(function (TransactionType) {
    TransactionType["DECLARE"] = "DECLARE";
    TransactionType["DEPLOY"] = "DEPLOY";
    TransactionType["DEPLOY_ACCOUNT"] = "DEPLOY_ACCOUNT";
    TransactionType["INVOKE"] = "INVOKE_FUNCTION";
})(exports.TransactionType || (exports.TransactionType = {}));
/**
 * new statuses are defined by props: finality_status and execution_status
 * to be #deprecated
 */
exports.TransactionStatus = void 0;
(function (TransactionStatus) {
    TransactionStatus["NOT_RECEIVED"] = "NOT_RECEIVED";
    TransactionStatus["RECEIVED"] = "RECEIVED";
    TransactionStatus["ACCEPTED_ON_L2"] = "ACCEPTED_ON_L2";
    TransactionStatus["ACCEPTED_ON_L1"] = "ACCEPTED_ON_L1";
    TransactionStatus["REJECTED"] = "REJECTED";
    TransactionStatus["REVERTED"] = "REVERTED";
})(exports.TransactionStatus || (exports.TransactionStatus = {}));
exports.TransactionFinalityStatus = void 0;
(function (TransactionFinalityStatus) {
    TransactionFinalityStatus["NOT_RECEIVED"] = "NOT_RECEIVED";
    TransactionFinalityStatus["RECEIVED"] = "RECEIVED";
    TransactionFinalityStatus["ACCEPTED_ON_L2"] = "ACCEPTED_ON_L2";
    TransactionFinalityStatus["ACCEPTED_ON_L1"] = "ACCEPTED_ON_L1";
})(exports.TransactionFinalityStatus || (exports.TransactionFinalityStatus = {}));
exports.TransactionExecutionStatus = void 0;
(function (TransactionExecutionStatus) {
    TransactionExecutionStatus["REJECTED"] = "REJECTED";
    TransactionExecutionStatus["REVERTED"] = "REVERTED";
    TransactionExecutionStatus["SUCCEEDED"] = "SUCCEEDED";
})(exports.TransactionExecutionStatus || (exports.TransactionExecutionStatus = {}));
exports.BlockStatus = void 0;
(function (BlockStatus) {
    BlockStatus["PENDING"] = "PENDING";
    BlockStatus["ACCEPTED_ON_L1"] = "ACCEPTED_ON_L1";
    BlockStatus["ACCEPTED_ON_L2"] = "ACCEPTED_ON_L2";
    BlockStatus["REJECTED"] = "REJECTED";
})(exports.BlockStatus || (exports.BlockStatus = {}));
exports.BlockTag = void 0;
(function (BlockTag) {
    BlockTag["pending"] = "pending";
    BlockTag["latest"] = "latest";
})(exports.BlockTag || (exports.BlockTag = {}));

Object.defineProperty(exports, 'EntryPointType', {
    enumerable: true,
    get: function () { return index.EntryPointType; }
});
