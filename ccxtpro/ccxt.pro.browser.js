/*  A entry point for the browser bundle version. This gets compiled by:
        
        browserify --debug ./ccxt.pro.browser.js > ./dist/ccxt.pro.browser.js
 */

window.ccxt = require ('./ccxt.pro')
