'use strict';

module.exports = {
    getEngine (keyPair, options) {
        const engine = require ('./js.js')
        return engine (keyPair, options)
    }
}
