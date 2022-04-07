/*  A entry point for the browser bundle version. This gets compiled by:
        
        browserify --debug ./ccxt.browser.js > ./dist/ccxt.browser.js
 */

ccxt = require ('./ccxt')
if (typeof window !== 'undefined') {
        window.ccxt = ccxt
}