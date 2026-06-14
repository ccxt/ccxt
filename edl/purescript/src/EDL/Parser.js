// FFI implementations for EDL Parser
"use strict";

exports.readForeignObject = function(f) {
  return function() {
    if (typeof f === 'object' && f !== null && !Array.isArray(f)) {
      return f;
    }
    throw new Error("Expected object");
  };
};

exports.unsafeCoerceToForeign = function(x) {
  return x;
};
