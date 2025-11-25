// FFI implementations for Main.purs
"use strict";

const yaml = require('yaml');

exports.parseYAMLImpl = function(content) {
  return function() {
    try {
      return yaml.parse(content);
    } catch (e) {
      throw new Error("YAML parse error: " + e.message);
    }
  };
};
