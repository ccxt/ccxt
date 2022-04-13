/*  A entry point for the browser bundle version. This gets compiled by:

        browserify --debug ./ccxt.browser.js > ./dist/ccxt.browser.js
 */

// self works in webworkers too
self.ccxt = require ('./ccxt')
