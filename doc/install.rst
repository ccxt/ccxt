Installation Instructions
=========================

The ccxt library is shipped as a single-file (all-in-one module) implementation with minimalistic dependencies and requirements.

The main file is:
- ``ccxt.js`` in JavaScript (`ccxt for Node.js <http://npmjs.com/package/ccxt>`__ and web browsers)
- ``ccxt/__init__.py`` in Python (works in both Python 2 and 3)
- ``ccxt.php`` in PHP

The easiest way to install the ccxt library is to use builtin package managers.

You can also clone it directly into your project directory from GitHub repository:

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

An alternative way of installing this library into your code is to copy a single ``ccxt.*`` file manually into your working directory with language extension appropriate for your environment.

Node.js
-------

.. code:: shell

    npm install ccxt

Node version of the ccxt library requires `crypto-js <https://www.npmjs.com/package/crypto-js>`__ and `node-fetch <https://www.npmjs.com/package/node-fetch>`__, both of them are installed automatically by npm.

.. code:: javascript

    var ccxt = require ('ccxt')
    console.log (ccxt.exchanges) // print all available exchanges

Python
------

.. code:: shell

    pip install ccxt

Synchronous Python 2+ version of the ccxt library does not require any additional dependencies and uses builtin modules only. Asynchronous Python 3.5+ version of the ccxt library uses the builtin `asyncio <https://docs.python.org/3/library/asyncio.html>`__ and `aiohttp <http://aiohttp.readthedocs.io>`__.

.. code:: python

    import ccxt               # sync Python 2.7+ or
    import ccxt.async as ccxt # async Python 3.5+
    print(ccxt.exchanges)     # print a list of all available exchange classes

PHP
---

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

The ccxt library in PHP requires common PHP modules:
- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv

To check if you have requires modules enabled in your PHP installation, type ``php -m`` or execute phpinfo () with ``php -r 'phpinfo ();'`` in console.

Note, that ccxt library uses builtin UTC/GMT time functions, therefore you are required to set date.timezone in your php.ini or call `date\_default\_timezone\_set <http://php.net/manual/en/function.date-default-timezone-set.php>`__\ () function before using the ccxt library in PHP. The recommended timezone setting is ``"UTC"``.

.. code:: php

    date_default_timezone_set ('UTC');
    include "ccxt.php";
    $exchange = new \cxxt\kraken ();

Web Browsers
------------

The ccxt library can also be used in web browser client-side JavaScript for various purposes.

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

The client-side JavaScript version also requires CryptoJS. Download and unpack `CryptoJS <https://code.google.com/archive/p/crypto-js/>`__ into your working directory or clone `CryptoJS from GitHub <https://github.com/sytelus/CryptoJS>`__.

.. code:: shell

    git clone https://github.com/sytelus/CryptoJS

Add links to CryptoJS components and ccxt to your HTML page code:

.. code:: html

    <script src="crypto-js/rollups/sha256.js"></script>
    <script src="crypto-js/rollups/hmac-sha256.js"></script>
    <script src="crypto-js/rollups/hmac-sha512.js"></script>
    <script src="crypto-js/components/enc-base64-min.js"></script>
    <script src="crypto-js/components/enc-utf16-min.js"></script>

    <script type="text/javascript" src="ccxt.js"></script>
    <script type="text/javascript">
        // print all available exchanges
        document.addEventListener ('DOMContentLoaded', () => console.log (ccxt.exchanges))
    </script>

Proxy
-----

In some specific cases you may want a proxy, if you experience issues with `DDoS protection by Cloudflare <https://github.com/kroitor/ccxt/wiki/Manual#ddos-protection-by-cloudflare>`__ or your network / country / IP is rejected by their filters.

If you need a proxy, use the ``proxy`` property (a string literal) containing base URL of http(s) proxy. It is for use with web browsers and from blocked locations.

**Bear in mind that each added intermediary contributes to the overall latency and roundtrip time. Longer delays can result in price slippage.**

The absolute exchange endpoint URL is appended to ``proxy`` string before HTTP request is sent to exchange. The proxy setting is an empty string ``''`` by default. Below are examples of a non-empty proxy string (last slash is mandatory!):

-  ``kraken.proxy = 'https://crossorigin.me/'``
-  ``gdax.proxy   = 'https://cors-anywhere.herokuapp.com/'``

CORS (Access-Control-Allow-Origin)
----------------------------------

CORS is `Cross-Origin Resource Sharing <https://en.wikipedia.org/wiki/Cross-origin_resource_sharing>`__. When accessing the HTTP REST API of an exchange from browser with ccxt library you may get a warning or an exception, saying ``No 'Access-Control-Allow-Origin' header is present on the requested resource``. That means that the exchange admins haven't enabled access to their API from arbitrary web browser pages.

You can still use the ccxt library from your browser via a CORS-proxy, which is very easy to set up or install. There are also public CORS proxies on the internet, like https://crossorigin.me.

To run your own CORS proxy locally you can either set up one of the existing ones or make a quick script of your own, like shown below.

Node.js CORS Proxy
~~~~~~~~~~~~~~~~~~

.. code:: javascript

    // JavaScript CORS Proxy
    // Save this in a file like cors.js and run with `node cors [port]`
    // It will listen for your requests on the port you pass in command line or port 8080 by default
    let port = (process.argv.length > 2) ? parseInt (process.argv[2]) : 8080; // default 
    require ('cors-anywhere').createServer ().listen (port, 'localhost')

Python CORS Proxy
~~~~~~~~~~~~~~~~~

.. code:: python

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

Testing CORS
~~~~~~~~~~~~

After you set it up and run it, you can test it by querying the target URL of exchange endpoint through the proxy (like https://localhost:8080/https://exchange.com/path/to/endpoint).

To test the CORS you can do either of the following:

-  set up proxy somewhere in your browser settings, then go to endpoint URL ``https://exchange.com/path/to/endpoint``
-  type that URL directly in the address bar as ``https://localhost:8080/https://exchange.com/path/to/endpoint``
-  cURL it from command like ``curl https://localhost:8080/https://exchange.com/path/to/endpoint``

To let ccxt know of the proxy, you can set the ``proxy`` property on your exchange instance.
