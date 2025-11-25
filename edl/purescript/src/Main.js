// FFI implementations for Main.purs
"use strict";

let yaml;
try {
  yaml = require('yaml');
} catch (e) {
  // Fallback to js-yaml if yaml is not available
  try {
    yaml = require('js-yaml');
    yaml.parse = yaml.load; // js-yaml uses load instead of parse
  } catch (e2) {
    console.error('Warning: No YAML parser available. Install "yaml" or "js-yaml" package.');
    yaml = {
      parse: function(content) {
        throw new Error('No YAML parser installed');
      }
    };
  }
}

// Safe YAML parsing that returns a result object
exports.parseYAMLSafe = function(content) {
  try {
    const parsed = yaml.parse(content);
    return { success: true, value: parsed, error: null };
  } catch (e) {
    return { success: false, value: null, error: e.message || 'Unknown YAML parse error' };
  }
};

// Effect-based YAML parsing (throws on error)
exports.parseYAMLImpl = function(content) {
  return function() {
    try {
      return yaml.parse(content);
    } catch (e) {
      throw new Error("YAML parse error: " + e.message);
    }
  };
};
