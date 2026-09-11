'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/index.cjs", function (module, exports) {
// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.
// If you have no idea what ASN.1 or BER is, see this:
// ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc
var Ber = _commonjsHelpers.commonjsRequire("./ber/index.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1");
// --- Exported API
module.exports = {
    Ber: Ber,
    BerReader: Ber.Reader,
};

});
