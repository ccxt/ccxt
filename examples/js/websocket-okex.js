/**
 * @author imhazige@gmail.com
 */
var url = require('url');
var WebSocket = require('ws');
// var HttpsProxyAgent = require('https-proxy-agent');

// HTTP/HTTPS proxy to connect to
// var proxy = 'http://localhost:7070';
// console.log('using proxy server %j', proxy);

// WebSocket endpoint for the proxy to connect to
// var endpoint = 'wss://okexcomreal.bafang.com:10440/websocket';
var endpoint = 'wss://real.okex.com:10441/websocket';
// var parsed = url.parse(endpoint);
// console.log('attempting to connect to WebSocket %j', endpoint);

// create an instance of the `HttpsProxyAgent` class with the proxy server information
// var options = url.parse(proxy);

// var agent = new HttpsProxyAgent(options);

// finally, initiate the WebSocket connection
var socket = new WebSocket(endpoint);

socket.on('open', function() {
  console.log('"open" event!');
  socket.send(
    "{'event':'addChannel','channel':'ok_sub_futureusd_btc_depth_this_week'}"
  );
});

socket.on('message', function(data, flags) {
  console.log('"message" event! %j %j', data, flags);
  socket.close();
});
