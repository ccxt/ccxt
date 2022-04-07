/*  A entry point for the browser bundle version. This gets compiled by:

        browserify --debug ./ccxt.browser.js > ./dist/ccxt.browser.js
 */

// var adds variables to the global window scope
// window.ccxt should be defined after this line
var ccxt = require ('./ccxt')
