// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

var errors = require('./errors.cjs');
var types = require('./types.cjs');

var Reader = require('./reader.cjs');

// --- Exports

module.exports = {
  Reader: Reader,
};

for (var t in types) {
  if (types.hasOwnProperty(t))
    module.exports[t] = types[t];
}
for (var e in errors) {
  if (errors.hasOwnProperty(e))
    module.exports[e] = errors[e];
}
