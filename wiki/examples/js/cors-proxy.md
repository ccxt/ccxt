- [Cors Proxy](./examples/js/)


 ```javascript
 // JavaScript CORS Proxy
// Save this in a file like cors.js and run with `node cors [port]`
// It will listen for your requests on the port you pass in command line or port 8080 by default
let port = (process.argv.length > 2) ? parseInt (process.argv[2]) : 8080 // default
require ('cors-anywhere').createServer ().listen (port, '0.0.0.0')
 
```