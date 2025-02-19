## Install

The easiest way to install the ccxt library is to use builtin package managers:

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v15+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [ccxt.js](https://github.com/ccxt/ccxt/blob/master/js/ccxt.js) in JavaScript
- [./python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [ccxt.php](https://github.com/ccxt/ccxt/blob/master/ccxt.php) in PHP (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt) and copy files
manually into your working directory with language extension appropriate for your environment.

```shell
git clone https://github.com/ccxt/ccxt.git
```

An alternative way of installing this library is to build a custom bundle from source. Choose exchanges you need in `exchanges.cfg`.

### JavaScript (NPM)

JavaScript version of ccxt works both in Node and web browsers. Requires ES6 and `async/await` syntax support (Node 15+). When compiling with Webpack and Babel, make sure it is [not excluded](https://github.com/ccxt-dev/ccxt/issues/225#issuecomment-331582275) in your `babel-loader` config.

[ccxt crypto trading library in npm](http://npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (for use with the `<script>` tag):

All-in-one browser bundle (dependencies included), served from a CDN of your choice:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.4.61/dist/ccxt.browser.min.js
* unpkg: https://unpkg.com/ccxt@4.4.61/dist/ccxt.browser.min.js
* ccxt: https://cdn.ccxt.com/latest/ccxt.min.js

You can obtain a live-updated version of the bundle by removing the version number from the URL (the `@a.b.c` thing) or the /latest/ on our cdn — however, we do not recommend to do that, as it may break your app eventually. Also, please keep in mind that we are not responsible for the correct operation of those CDN servers.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.4.61/dist/ccxt.browser.min.js"></script>
```

We also provide webpack minified and tree-shaken versions of the library starting from version 3.0.35 - Visit https://cdn.ccxt.com to browse the prebundled versions we distribute.

| name           | size   |
|----------------|--------|
| binance.min.js | ~300kb |
| bitget.min.js  | ~200kb |
| bitmart.min.js | ~200kb |
| bybit.min.js   | ~300kb |
| ccxt.min.js    | ~3mb   |
| huobi.min.js   | ~300kb |
| kucoin.min.js  | ~200kb |
| mexc.min.js    | ~200kb |
| okx.min.js     | ~250kb |

Note: the file sizes are subject to change.

```html
<script type="text/javascript" src="https://cdn.ccxt.com/3.0.35/ccxt.min.js"></script>
```

Here is an [example](https://cdn.ccxt.com/example.html) using a custom bybit bundle from our cdn in the browser

```html
<html>
<head>
<script type="text/javascript" src="https://cdn.ccxt.com/latest/bybit.min.js"></script>
<script>
async function update () {
    const bid = document.querySelector ('#bid')
    const ask = document.querySelector ('#ask')
    const updates = document.querySelector ('#updates')

    const bybit = new ccxt.pro.bybit ()
    window.bybit = bybit
    const ticker = await bybit.fetchTicker ('BTC/USDT:USDT')
    bid.innerText = ticker.bid.toFixed (2)
    ask.innerText = ticker.ask.toFixed (2)
    while (true) {
        const trades = await bybit.watchTrades ('BTC/USDT:USDT')
        // const trades = await bybit.fetchTrades ('BTC/USDT:USDT', 1)
        const trade = trades[0]

        const notify = document.createElement ('li')
        notify.innerHTML = `<strong>${trade.datetime.slice (11, 19)}</strong> &nbsp; ${trade.amount.toFixed (3)} btc was bought at ${trade.price.toFixed (1)}`
        notify.style = 'padding-top: 8px;'
        updates.appendChild (notify)
    }
}
</script>
</head>

<body onload="update()">
<h3>The current bitcoin bid on bybit is <span id="bid"></span><br><br>and the best ask is <span id="ask"></span></h3>
<ul id="updates" style="color: red;"></ul>
</body>
</html>
```

The default entry point for the browser is `window.ccxt` and it creates a global ccxt object:

```javascript
console.log (ccxt.exchanges) // print all available exchanges
```

### Custom JavaScript Builds

It takes time to load all scripts and resources. The problem with in-browser usage is that the entire CCXT library weighs a few megabytes which is a lot for a web application. Sometimes it is also critical for a Node app. Therefore to lower the loading time you might want to make your own custom build of CCXT for your app with just the exchanges you need. CCXT uses webpack to remove dead code paths to make the package smaller.

Follow these steps:

```bash
# 1. clone the repository

git clone --depth 1 https://github.com/ccxt/ccxt.git

# 2. go to the cloned repository

cd ccxt

# 3. install dependencies

npm install

# 4. edit exchanges.cfg for the exchanges of your interest

echo -e "binance\nokx" > exchanges.cfg

# 5. build the library

npm run export-exchanges
npm run bundle-browser

# 6a. copy the browser file to your project folder if you are buildig a web application

cp dist/ccxt.browser.js path/to/your/html/project

# 6b. or link against the library if you are building a Node.js application
npm link
cd path/to/your/node/project
npm link ccxt

# 6c. directly import ccxt from the entry point
touch app.js

# inside of app.js

import ccxt from './js/ccxt.js'
console.log (ccxt)

# now you can run your app like so

node app.js
```

### Python

[ccxt algotrading library in PyPI](https://pypi.python.org/pypi/ccxt)

```shell
pip install ccxt
```

```python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5.3+

```python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

The autoloadable version of ccxt can be installed with [**Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 8.1+).

It can also be installed from the source code: [**`ccxt.php`**](https://raw.githubusercontent.com/ccxt/ccxt/master/php)

It requires common PHP modules:

- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv
- gmp

```php
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

The library supports concurrent asynchronous mode using tools from [ReactPHP](https://reactphp.org/) in PHP 8.1+. Read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

### .net/C#

[ccxt in C# with **Nugget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 and netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Docker

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document for the details on that).

You don't need the Docker image if you're not going to develop CCXT. If you just want to use CCXT – just install it as a regular package into your project.

Using `docker-compose` (in the cloned CCXT repository):

```shell
docker-compose run --rm ccxt
```

Alternatively:

```shell
docker build . --tag ccxt
docker run -it ccxt
```

## Proxy
If you are unable to obtain data from exchanges due to location restrictions read the [proxy](https://github.com/ccxt/ccxt/wiki/Manual#proxy) section.