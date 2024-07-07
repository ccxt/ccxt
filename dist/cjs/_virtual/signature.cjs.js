'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/ec/signature.cjs", function (module, exports) {
var BN = _commonjsHelpers.commonjsRequire("../../../../BN/bn.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/ec");
var elliptic = _commonjsHelpers.commonjsRequire("../../elliptic.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/ec");
var utils = elliptic.utils;
var assert = utils.assert;
function Signature(options, enc) {
    if (options instanceof Signature)
        return options;
    //if (this._importDER(options, enc))
    //  return;
    assert(options.r && options.s, 'Signature without r or s');
    this.r = new BN(options.r, 16);
    this.s = new BN(options.s, 16);
    if (options.recoveryParam === undefined)
        this.recoveryParam = null;
    else
        this.recoveryParam = options.recoveryParam;
}
module.exports = Signature;

});
