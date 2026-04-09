'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/node-rsa/asn1/ber/errors.cjs", function (module, exports) {
// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.
module.exports = {
    newInvalidAsn1Error: function (msg) {
        var e = new Error();
        e.name = 'InvalidAsn1Error';
        e.message = msg || '';
        return e;
    }
};

});
