'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/ber/index.cjs", function (module, exports) {
// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.
var errors = _commonjsHelpers.commonjsRequire("./errors.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/ber");
var types = _commonjsHelpers.commonjsRequire("./types.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/ber");
var Reader = _commonjsHelpers.commonjsRequire("./reader.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/ber");
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

});
