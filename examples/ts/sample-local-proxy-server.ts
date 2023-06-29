// @ts-nocheck
// JavaScript CORS Proxy
// Save this in a file like cors.js and run with:
//    node cors [port]
// It will listen for your requests on the port you pass in command line (or port 8080 by default)

import cors from 'cors-anywhere';

const port = (process.argv.length > 2) ? parseInt (process.argv[2]) : 8080;
cors.createServer ().listen (port, 'localhost');
console.log ('Running CORS Anywhere on localhost:' + port);
