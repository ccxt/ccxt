'use strict';

var _commonjsHelpers = require('./_commonjsHelpers.js');

const commonjsRegister = _commonjsHelpers.commonjsRegister;
commonjsRegister("/$$rollup_base$$/js/src/static_dependencies/node-rsa/formats/formats.cjs", function (module, exports) {
_commonjsHelpers.commonjsRequire("../utils.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/formats")._;
module.exports = {
    pkcs1: _commonjsHelpers.commonjsRequire("./pkcs1.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/formats"),
    pkcs8: _commonjsHelpers.commonjsRequire("./pkcs8.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/formats"),
    components: _commonjsHelpers.commonjsRequire("./components.cjs", "/$$rollup_base$$/js/src/static_dependencies/node-rsa/formats"),
    detectAndImport: function (key, data, format) {
        if (format === undefined) {
            for (var scheme in module.exports) {
                if (typeof module.exports[scheme].autoImport === 'function' && module.exports[scheme].autoImport(key, data)) {
                    return true;
                }
            }
        }
        else if (format) {
            var fmt = formatParse(format);
            if (module.exports[fmt.scheme]) {
                if (fmt.keyType === 'private') {
                    module.exports[fmt.scheme].privateImport(key, data, fmt.keyOpt);
                }
                else {
                    module.exports[fmt.scheme].publicImport(key, data, fmt.keyOpt);
                }
            }
            else {
                throw Error('Unsupported key format');
            }
        }
        return false;
    },
};

});
