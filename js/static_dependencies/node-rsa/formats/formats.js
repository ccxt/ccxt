var _ = require('../utils')._;

module.exports = {
    pkcs1: require('./pkcs1'),
    pkcs8: require('./pkcs8'),
    components: require('./components'),

    detectAndImport: function (key, data, format) {
        if (format === undefined) {
            for (var scheme in module.exports) {
                if (typeof module.exports[scheme].autoImport === 'function' && module.exports[scheme].autoImport(key, data)) {
                    return true;
                }
            }
        } else if (format) {
            var fmt = formatParse(format);

            if (module.exports[fmt.scheme]) {
                if (fmt.keyType === 'private') {
                    module.exports[fmt.scheme].privateImport(key, data, fmt.keyOpt);
                } else {
                    module.exports[fmt.scheme].publicImport(key, data, fmt.keyOpt);
                }
            } else {
                throw Error('Unsupported key format');
            }
        }

        return false;
    },
};
