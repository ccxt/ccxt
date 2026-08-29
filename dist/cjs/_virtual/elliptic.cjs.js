'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic.cjs", function (module, exports) {
var elliptic = exports;
// hello ladies ;)
function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () { };
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
}
elliptic.inherits = inherits;
elliptic.version = '6.5.0';
elliptic.utils = _commonjsHelpers.commonjsRequire("./elliptic/utils.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib");
elliptic.curve = _commonjsHelpers.commonjsRequire("./elliptic/curve/index.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib");
elliptic.curves = _commonjsHelpers.commonjsRequire("./elliptic/curves.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib");
// Protocols
elliptic.ec = _commonjsHelpers.commonjsRequire("./elliptic/ec/index.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib");
elliptic.eddsa = _commonjsHelpers.commonjsRequire("./elliptic/eddsa/index.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib");

});
