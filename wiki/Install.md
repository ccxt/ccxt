## Install

The easiest way to install the ccxt library is to use builtin package managers:

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 2 and 3)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [`ccxt.js`](https://github.com/ccxt/ccxt/blob/master/ccxt.js) in JavaScript
- [`./python/`](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [`ccxt.php`](https://github.com/ccxt/ccxt/blob/master/ccxt.php) in PHP (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt):

```shell
git clone https://github.com/ccxt/ccxt.git
```

An alternative way of installing this library into your code is to copy a single file manually into your working directory with language extension appropriate for your environment.

### JavaScript (NPM)

JavaScript version of ccxt works both in Node and web browsers. Requires ES6 and `async/await` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is [not excluded](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) in your `babel-loader` config.

[ccxt crypto trading library in npm](http://npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```JavaScript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (for use with the `<script>` tag):

[All-in-one browser bundle](https://unpkg.com/ccxt) (dependencies included), served from [unpkg CDN](https://unpkg.com/), which is a fast, global content delivery network for everything on NPM.

```HTML
<script type="text/javascript" src="https://unpkg.com/ccxt"></script>
```

Creates a global `ccxt` object:

```JavaScript
console.log (ccxt.exchanges) // print all available exchanges
```

### Python

[ccxt algotrading library in PyPI](https://pypi.python.org/pypi/ccxt)

```shell
pip install ccxt
```

```Python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5.3+

```Python
import ccxt.async as ccxt # link against the asynchronous version of ccxt
```

### PHP

The autoloadable version of ccxt can be installed with [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.3+).

It can also be installed from the source code: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

It requires common PHP modules:

- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv

```PHP
include "ccxt.php";
var_dump (\cxxt\Exchange::$exchanges); // print a list of all available exchange classes
```

## Proxy

In some specific cases you may want a proxy, if you experience issues with [DDoS protection by Cloudflare](https://github.com/ccxt/ccxt/wiki/Manual#ddos-protection-by-cloudflare) or your network / country / IP is rejected by their filters.

If you need a proxy, use the `proxy` property (a string literal) containing base URL of http(s) proxy. It is for use with web browsers and from blocked locations.

**Bear in mind that each added intermediary contributes to the overall latency and roundtrip time. Longer delays can result in price slippage.**

The absolute exchange endpoint URL is appended to `proxy` string before HTTP request is sent to exchange. The proxy setting is an empty string `''` by default. Below are examples of a non-empty proxy string (last slash is mandatory!):

- `kraken.proxy = 'https://crossorigin.me/'`
- `gdax.proxy   = 'https://cors-anywhere.herokuapp.com/'`

### Python Proxies

The python version of the library uses the [python-requests](python-requests.org) package for underlying HTTP and supports all means of customization available in the `requests` package, including proxies.

You can configure proxies by setting the environment variables HTTP_PROXY and HTTPS_PROXY.

```shell
$ export HTTP_PROXY="http://10.10.1.10:3128"
$ export HTTPS_PROXY="http://10.10.1.10:1080"
```

After exporting the above variables with your proxy settings, all reqeusts from within ccxt will be routed through those proxies.

You can also set them programmatically:

```Python
import ccxt
exchange = ccxt.poloniex({
    'proxies': {
        'http': 'http://10.10.1.10:3128',
        'https': 'http://10.10.1.10:1080',
    },
})
```

Or

```Python
import ccxt
exchange = ccxt.poloniex()
exchange.proxies = {
  'http': 'http://10.10.1.10:3128',
  'https': 'http://10.10.1.10:1080',
}
```

#### Python 2 and 3 sync proxies

- https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py

```Python
# -*- coding: utf-8 -*-

import os
import sys
import ccxt
from pprint import pprint


exchange = ccxt.poloniex({
    #
    # ↓ The "proxy" property setting below is for CORS-proxying only!
    # Do not use it if you don't know what a CORS proxy is.
    # https://github.com/ccxt/ccxt/wiki/Install#cors-access-control-allow-origin
    # You should only use the "proxy" setting if you're having a problem with Access-Control-Allow-Origin
    # In Python you rarely need to use it, if ever at all.
    #
    # 'proxy': 'https://cors-anywhere.herokuapp.com/',
    #
    # ↓ On the other hand, the "proxies" setting is for HTTP(S)-proxying (SOCKS, etc...)
    # It is a standard method of sending your requests through your proxies
    # This gets passed to the `python-requests` implementation directly
    # You can also enable this with environment variables, as described here:
    # http://docs.python-requests.org/en/master/user/advanced/#proxies
    # This is the setting you should be using with synchronous version of ccxt in Python 2 and 3
    #
    'proxies': {
        'http': 'http://10.10.1.10:3128',
        'https': 'http://10.10.1.10:1080',
    },
})

# your code goes here...

pprint(exchange.fetch_ticker('ETH/BTC'))
```

#### Python 3.5+ asyncio/aiohttp proxy

- https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py

```Python
# -*- coding: utf-8 -*-

import asyncio
import os
import sys
import ccxt.async as ccxt
from pprint import pprint


async def test_gdax():

    exchange = ccxt.poloniex({
        #
        # ↓ The "proxy" property setting below is for CORS-proxying only!
        # Do not use it if you don't know what a CORS proxy is.
        # https://github.com/ccxt/ccxt/wiki/Install#cors-access-control-allow-origin
        # You should only use the "proxy" setting if you're having a problem with Access-Control-Allow-Origin
        # In Python you rarely need to use it, if ever at all.
        #
        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        #
        # ↓ The "aiohttp_proxy" setting is for HTTP(S)-proxying (SOCKS, etc...)
        # It is a standard method of sending your requests through your proxies
        # This gets passed to the `asyncio` and `aiohttp` implementation directly
        # You can use this setting as documented here:
        # https://docs.aiohttp.org/en/stable/client_advanced.html#proxy-support
        # This is the setting you should be using with async version of ccxt in Python 3.5+
        #
        'aiohttp_proxy': 'http://proxy.com',
        # 'aiohttp_proxy': 'http://user:pass@some.proxy.com',
        # 'aiohttp_proxy': 'http://10.10.1.10:3128',
    })

    # your code goes here...

    ticker = await exchange.fetch_ticker('ETH/BTC')

    # don't forget to free the used resources, when you don't need them anymore
    await exchange.close()

    return ticker

if __name__ == '__main__':
    pprint(asyncio.get_event_loop().run_until_complete(test_gdax()))
```

A more detailed documentation on using proxies with the sync python version of the ccxt library can be found here:

- [Proxies](http://docs.python-requests.org/en/master/user/advanced/#proxies)
- [SOCKS](http://docs.python-requests.org/en/master/user/advanced/#socks)

## CORS (Access-Control-Allow-Origin)

CORS is [Cross-Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing). When accessing the HTTP REST API of an exchange from browser with ccxt library you may get a warning or an exception, saying `No 'Access-Control-Allow-Origin' header is present on the requested resource`. That means that the exchange admins haven't enabled access to their API from arbitrary web browser pages.

You can still use the ccxt library from your browser via a CORS-proxy, which is very easy to set up or install. There are also public CORS proxies on the internet, like [https://crossorigin.me](https://crossorigin.me).

To run your own CORS proxy locally you can either set up one of the existing ones or make a quick script of your own, like shown below.

### Node.js CORS Proxy

```JavaScript
// JavaScript CORS Proxy
// Save this in a file like cors.js and run with `node cors [port]`
// It will listen for your requests on the port you pass in command line or port 8080 by default
let port = (process.argv.length > 2) ? parseInt (process.argv[2]) : 8080; // default
require ('cors-anywhere').createServer ().listen (port, 'localhost')
```

### Python CORS Proxy

```Python
#!/usr/bin/env python
# Python CORS Proxy
# Save this in a file like cors.py and run with `python cors.py [port]` or `cors [port]`
try:
    # Python 3
    from http.server import HTTPServer, SimpleHTTPRequestHandler, test as test_orig
    import sys
    def test (*args):
        test_orig (*args, port = int (sys.argv[1]) if len (sys.argv) > 1 else 8080)
except ImportError: # Python 2
    from BaseHTTPServer import HTTPServer, test
    from SimpleHTTPServer import SimpleHTTPRequestHandler

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header ('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers (self)

if __name__ == '__main__':
    test (CORSRequestHandler, HTTPServer)
```

### Testing CORS

After you set it up and run it, you can test it by querying the target URL of exchange endpoint through the proxy (like https://localhost:8080/https://exchange.com/path/to/endpoint).

To test the CORS you can do either of the following:

- set up proxy somewhere in your browser settings, then go to endpoint URL `https://exchange.com/path/to/endpoint`
- type that URL directly in the address bar as `https://localhost:8080/https://exchange.com/path/to/endpoint`
- cURL it from command like `curl https://localhost:8080/https://exchange.com/path/to/endpoint`

To let ccxt know of the proxy, you can set the `proxy` property on your exchange instance.
