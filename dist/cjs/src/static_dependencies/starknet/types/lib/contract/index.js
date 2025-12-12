'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./abi.js');

// Basic elements
exports.EntryPointType = void 0;
(function (EntryPointType) {
    EntryPointType["EXTERNAL"] = "EXTERNAL";
    EntryPointType["L1_HANDLER"] = "L1_HANDLER";
    EntryPointType["CONSTRUCTOR"] = "CONSTRUCTOR";
})(exports.EntryPointType || (exports.EntryPointType = {}));
