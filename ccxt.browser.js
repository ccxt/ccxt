/*  A entry point for the browser bundle version. This gets compiled by:
        
        browserify --debug ./ccxt.browser.js > ./build/ccxt.browser.js
 */

window.ccxt = require ('./ccxt')