- [Env Variables](./examples/js/)


 ```javascript
 

// ----------------------------------------------------------------------------

import ccxt from '../../js/ccxt.js';
import ololog from 'ololog'

// ----------------------------------------------------------------------------

const log = ololog.configure.handleNodeErrors (), asTable = require("as-table").configure({ delimiter: " | " });

// ----------------------------------------------------------------------------

(async () => {

    const exchange = new ccxt.coinbase ({
        verbose: process.argv.includes ('--verbose'),
        timeout: 60000,
        apiKey: process.env.KEY,
        secret: process.env.SECRET
    });

    const balance = await exchange.fetchBalance ()
    log.green (balance)

})()
 
```