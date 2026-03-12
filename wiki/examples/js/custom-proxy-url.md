- [Custom Proxy Url](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';

(async function main () {

    const kraken1 = new ccxt.kraken ({
        proxy: function (url) {
            return 'https://example.com/?url=' + encodeURIComponent (url)
        },
    })

    console.log (await kraken1.loadMarkets ())

    const kraken2 = new ccxt.kraken ({
        proxy: function (url) {
            return 'https://cors-anywhere.herokuapp.com/' + url
        },
    })

    console.log (await kraken2.loadMarkets ())

}) () 
```