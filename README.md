![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)

info@ccxt.pro

# CCXT Pro

CCXT Pro is a professional extension to the standard CCXT that is going to include:
- The support for unified public and private WebSockets (pub and sub) – work in progress now
- FIX protocol adapters – planned for the future
-

## Technicalities:

- public and private unified streaming APIs
- auto-connection and re-connection
- connection timeouts
- re-connection exponential backoff delay
- keep-alive ping-pong
- proxies

## The Access To The Repository

The access to the CCXT Pro repository is prepaid and restricted (by invitation only). In order to get the access to the repository, the user must buy an access plan at https://ccxt.pro and visit the repository on GitHub via https://github.com/kroitor/ccxt.pro.

## License Summary

The CCXT Pro License does not include mechanisms that enforce technical limitations on the user or any other restrictions that would affect direct communication between the users and the exchanges without intermediaries. The mechanism that protects the CCXT Pro license is not technical, but works based purely on laws.

CCXT Pro is open-source which is another important aspect in the licensing. Without imposing unnecessary technical limitations and introducing intermediary code, there is no technical way for us to know that someone is using CCXT Pro in-house without a license.

The CCXT Pro license addresses abusive access to the repository, leaking the source-code and republishing it without a permission from us. Violations of licensing terms will be pursued legally.

# How To Install

Installing CCXT Pro requires visiting the https://ccxt.pro website and obtaining a CCXT Pro license. The license gives the access to the CCXT Pro codebase in a private GitHub repository.

```diff
- this part of the doc is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

## JavaScript

```shell
# in your project directory
npm install ccxt.pro
```

## Python

```
pip install ccxtpro
```

## PHP

```shell
# in your project directory
composer install ccxt/ccxtpro
```

# How To Use

## The Technical Overview

The CCXT Pro stack is built upon CCXT and extends the core CCXT classes, using:

- JavaScript prototype-level mixins
- Python multiple inheritance
- PHP Traits

The CCXT Pro heavily relies on the transpiler of CCXT for [multilanguge support](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).


```
                                 User

    +-------------------------------------------------------------+
    |                          CCXT Pro                           |
    +------------------------------+------------------------------+
    |            Public            .           Private            |
    +=============================================================+
    │                              .                              |
    │                  The Unified CCXT Pro API                   |
    |                              .                              |
    |       loadMarkets            .           watchBalance       |
    |       fetchMarkets           .            createOrder       |
    |       fetchCurrencies        .            cancelOrder       |
    |       fetchTicker            .             watchOrder       |
    |       fetchTickers           .            watchOrders       |
    |       fetchOrderBook         .        watcgOpenOrders       |
    |       fetchOHLCV             .      watchClosedOrders       |
    |       fetchStatus            .          watchMyTrades       |
    |       fetchTrades            .                deposit       |
    |                              .               withdraw       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |            The Underlying Exchange-Specific APIs            |
    |         (Derived Classes And Their Implementations)         |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                 CCXT Pro Base Exchange Class                |
    │                              .                              |
    +=============================================================+

    +-------------------------------------------------------------+
    |                                                             |
    |                            CCXT                             |
    |                                                             |
    +=============================================================+
```

## Usage

```diff
- this part of the doc is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Prerequisites

The best way to understand CCXT Pro is to make sure you grasp the entire CCXT Manual and practice standard CCXT first. CCXT Pro borrows a lot from CCXT, therefore the two libraries share a lot of commonalities, including:

- markets, symbols and ids
- unified data structures and formats, orderbooks, trades, orders, candles, ...
- exceptions and error mappings
- authentication and API keys (for private feeds and calls)
- configuration options

The CCXT Pro audience consists mostly of professional algorithmic traders and developers, in order to work efficiently with this library the user is required to be well-familiar with the concepts of streaming. One has to understand the difference between connection-based streaming APIs (WebSocket, CCXT Pro) and request-response based APIs (REST, CCXT).

The general async-style flow for a CCXT application is as follows:

```JavaScript

// the RESTful orderbook polling request-response loop

while (condition) {

    try {

        // fetch some of the public data
        orderbook = await exchange.fetchOrderBook (symbol, limit)

        // do something or react somehow based on that data
        // ...

    } catch (e) {

        // handle errors
    }
}
```

In CCXT Pro each public and private unified RESTful method having a `fetch*` prefix also has a corresponding stream-based counterpart method prefixed with `watch*`, as follows:

- `fetchStatus` → `watchStatus`
- `fetchOrderBook` → `watchOrderBook`
- `fetchTicker` → `watchTicker`
- `fetchTickers` → `watchTickers`
- `fetchOHLCV` → `watchOHLCV`
- `fetchTrades` → `watchTrades`
- `fetchBalance` → `watchBalance`
- `fetchOrders` → `watchOrders`
- `fetchMyTrades` → `watchMyTrades`
- `fetchTransactions` → `watchTransactions`
- ...

The Unified CCXT Pro Streaming API inherits CCXT usage patterns to make the code easier to migrate.

The general async-style flow for a CCXT Pro application (as opposed to a CCXT application above) is shown below:

```JavaScript

// the stream-based (WebSocket) orderbook feed loop

while (condition) {

    try {

        // watch some of the public data
        orderbook = await exchange.watchOrderBook (symbol, limit)

        // do something or react somehow based on that data
        // ...

    } catch (e) {

        // handle errors
    }
}
```

That usage pattern is usually wrapped up into a core business-logic method called _"a `tick()` function"_, since it reiterates a reaction to the incoming events (aka trading ticks). From the two examples above it is obvious, that the generic usage pattern in CCXT Pro and CCXT is identical.

Many of the CCXT rules and concepts also apply to CCXT Pro:

- CCXT Pro will load markets and will cache markets upon the first call to a unified API method
- CCXT Pro will call CCXT RESTful methods under the hood if necessary
- ...

### Streaming Specifics

Despite of the numerous commonalities, streaming-based APIs have their own specifics, because of their connection-based nature.

Having a connection-based interface implies connection-handling mechanisms. Connection management is handled by CCXT Pro transparently to the user.

Upon your first call to any `watch` method CCXT Pro will establish a connection to a specific stream/resource of the exchange and will maintain it. The library will handle the subscription request/response messaging sequence as well as the authentication/signing if the requested stream is private.

The library will also watch the status of the uplink and will keep the connection alive. Upon a critical exception, a disconnect or a connection timeout/failure, the next iteration of the tick function will call the `watch` method that will trigger a reconnection. This way the library handles disconnections and reconnections for the user transparently. CCXT Pro applies the necessary rate-limiting and exponential backoff delays. All of that functionality is enabled by default and can be configured via exchange properties, as usual.

### Linking Against CCXT Pro

The process of including the CCXT Pro library into your script is pretty much the same as with the standard CCXT, the only difference is the name of the actual module (js), package (py) or namespace (php).

```JavaScript
// JavaScript
const ccxtpro = require ('ccxt.pro')
console.log ('CCXT Pro version', ccxtpro.version)
console.log ('Supported exchanges:', ccxtpro.exchanges)
```

```Python
# Python
import ccxtpro
print('CCXT Pro version', ccxtpro.__version__)
print('Supported exchanges:', ccxtpro.exchanges)
```

```PHP
// PHP
use \ccxtpro; // optional, since you can use fully qualified names
echo 'CCXT Pro version ', \ccxtpro\Exchange::VERSION, "\n";
echo 'Supported exchanges: ', json_encode(\ccxtpro\Exchange::$exchanges), "\n";
```

The imported CCXT Pro module wraps the CCXT inside itself – every exchange instantiated via CCXT Pro has all the CCXT methods inside itself as well as the additional functionality.

### Instantiation

Creating a CCXT Pro exchange instance is pretty much identical to creating a CCXT exchange instance, as shown below.

```JavaScript
// JavaScript
const exchange = new ccxtpro.binance ()
```

```Python
# Python
exchange = ccxtpro.kraken()
```

```PHP
// PHP
$exchange = new \ccxtpro\kucoin();
```

### Exchange Properties

Every CCXT Pro instance contains all properties of the underlying CCXT instance. Apart from the standard CCXT properties, the CCXT Pro instance includes the following:

- `has`: an extended associative array of extended exchange capabilities (e.g. `watchOrderBook`, `watchOHLCV`, ...)
- `urls['api']`: will contain a streaming API base URL, depending on the underlying protocol
    - `'ws'`: [WebSocket](https://en.wikipedia.org/wiki/WebSocket)
    - `'signalr'`: [SignalR](https://en.wikipedia.org/wiki/SignalR)
    - `'socketio'`: [Socket.IO](https://socket.io/)
- `version`: ...

### Rate limiting

### API Methods

### Error Handling

