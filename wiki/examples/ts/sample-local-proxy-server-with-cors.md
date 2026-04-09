- [Sample Local Proxy Server With Cors](./examples/ts/)


 ```javascript
 // @ts-nocheck
// JavaScript sample Proxy with CORS support

// Save this in a file like cors.js and run with:
//    node cors [port]
// It will listen for your requests on the port you pass in command line (or port 8080 by default)

import cors from 'cors-anywhere'; // npm install cors-anywhere

const port = (process.argv.length > 2) ? parseInt (process.argv[2]) : 8080; // if not provided from cli, default to 8080
cors.createServer ({
    // you can set origin, if needed by exchange
    // setHeaders: { 'origin': 'https://www.bitmex.com' }
}).listen (port, 'localhost');
console.log ('Running CORS Anywhere on localhost:' + port);
 
```