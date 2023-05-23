socks-proxy-agent
================
### A SOCKS proxy `http.Agent` implementation for HTTP and HTTPS

This module provides an `http.Agent` implementation that connects to a
specified SOCKS proxy server, and can be used with the built-in `http`
and `https` modules.

It can also be used in conjunction with the `ws` module to establish a WebSocket
connection over a SOCKS proxy. See the "Examples" section below.

Examples
--------

```ts
import https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';

const agent = new SocksProxyAgent(
	'socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com'
);

https.get('https://ipinfo.io', { agent }, (res) => {
	console.log(res.headers);
	res.pipe(process.stdout);
});
```

#### `ws` WebSocket connection example

```ts
import WebSocket from 'ws';
import { SocksProxyAgent } from 'socks-proxy-agent';

const agent = new SocksProxyAgent(
	'socks://your-name%40gmail.com:abcdef12345124@br41.nordvpn.com'
);

var socket = new WebSocket('ws://echo.websocket.events', { agent });

socket.on('open', function () {
	console.log('"open" event!');
	socket.send('hello world');
});

socket.on('message', function (data, flags) {
	console.log('"message" event! %j %j', data, flags);
	socket.close();
});
```

License
-------

(The MIT License)

Copyright (c) 2013 Nathan Rajlich &lt;nathan@tootallnate.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
