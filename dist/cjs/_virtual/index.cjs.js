'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/curve/index.cjs", function (module, exports) {
var curve = exports;
curve.base = _commonjsHelpers.commonjsRequire("./base.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/curve");
curve.short = _commonjsHelpers.commonjsRequire("./short.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/curve");
curve.mont = _commonjsHelpers.commonjsRequire("./mont.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/curve");
curve.edwards = _commonjsHelpers.commonjsRequire("./edwards.cjs", "/$$rollup_base$$/js/src/static_dependencies/elliptic/lib/elliptic/curve");

});
