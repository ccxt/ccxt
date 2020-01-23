![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)

info@ccxt.pro

# CCXT Pro

```JavaScript
'use strict';
const ccxtpro = require ('ccxt.pro');
(async () => {
    const exchange = new ccxtpro.binance ()
    while (true) {
        const orderbook = await exchange.watchOrderBook ('ETH/BTC')
        console.log (new Date (), orderbook['asks'][0], orderbook['bids'][0])
    }
}) ()
```

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

The CCXT Pro audience consists mostly of professional algorithmic traders and developers, in order to work efficiently with this library the user is required to be well-familiar with the concepts of streaming. One has to understand the difference between connection-based streaming APIs ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) and request-response based APIs ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

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

The Unified CCXT Pro Streaming API inherits CCXT usage patterns to make migration easier.

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

That usage pattern is usually wrapped up into a core business-logic method called _"a `tick()` function"_, since it reiterates a reaction to the incoming events (aka _ticks_). From the two examples above it is obvious that the generic usage pattern in CCXT Pro and CCXT is identical.

Many of the CCXT rules and concepts also apply to CCXT Pro:

- CCXT Pro will load markets and will cache markets upon the first call to a unified API method
- CCXT Pro will call CCXT RESTful methods under the hood if necessary
- ...

### Streaming Specifics

Despite of the numerous commonalities, streaming-based APIs have their own specifics, because of their connection-based nature.

Having a connection-based interface implies connection-handling mechanisms. Connections are managed by CCXT Pro transparently to the user. Each exchange instance manages its own set of connections.

Upon your first call to any `watch` method CCXT Pro will establish a connection to a specific stream/resource of the exchange and will maintain it. In case the connection exists – it is reused. The library will handle the subscription request/response messaging sequences as well as the authentication/signing if the requested stream is private.

The library will also watch the status of the uplink and will keep the connection alive. Upon a critical exception, a disconnect or a connection timeout/failure, the next iteration of the tick function will call the `watch` method that will trigger a reconnection. This way the library handles disconnections and reconnections for the user transparently. CCXT Pro applies the necessary rate-limiting and exponential backoff reconnection delays. All of that functionality is enabled by default and can be configured via exchange properties, as usual.

Most of the exchanges only have a single base URL for streaming APIs (usually, WebSocket, starting with `ws://` or `wss://`). Some of them may have more than one URL for each stream, depending on the feed in question.

Exchanges' Streaming APIs can be classified into two different categories:

- *sub* or *subscribe* allows receiving only
- *pub* or *publish* allows sending and receiving

#### Sub

A *sub* interface usually allows to subscribe to a stream of data and listen for it to income. Most of exchanges that do support WebSockets will offer a *sub* type of API only. The *sub* type includes streaming public market data. Sometimes exchanges also allow subcribing to private user data. After the user subscribes to any data feed the channel effectively starts working one-way and sending updates from the exchange towards the user continuously.

- Commonly appearing types of public market data streams:
  - order book (most common) - updates on added, edited and deleted orders (aka *change deltas*)
  - ticker- updates upon a change of 24 hour stats
  - fills feed (also common) - a live stream of public trades
  - exchange chat
- Less common types of private user data streams:
  - the stream of trades of the user
  - balance updates
  - custom streams
  - exchange-specific and other streams

#### Pub

A *pub* interface usually allows users to send data requests towards the server. This usually includes common user actions, like:
- placing and canceling orders
- placing withdrawal requests
- posting chat messages
- etc

**Some exchanges do not offer a *pub* WS API, they will offer *sub* WS API only.** However, there are exchanges that have a complete Streaming API as well.

> #### Unified WS API

> In most cases a user cannot operate effectively having just the WebSocket API. Exchanges will stream public market data *sub*, and the REST API is still needed for the *pub* part (where missing).

> The goal of ccxt is to  seamlessly combine in a unified interface all available types of networking, possibly, without introducing backward-incompatible changes.

> The WebSocket API in ccxt consists of the following:
> - the pull (on-demand) interface
> - the push (notification-based) interface

> The *pull* WebSocket interface replicates the async REST interface one-to-one. So, in order to switch from `REST` to `pull WebSocket + REST`, the user is only required to submit a { ws: true } option to constructor params. From there any call to the unified API will be switched to WebSockets, where available (whee supported by the exchange).

> The *pull* interface means the user pulling data from the library by calling its methods, whereas the data is fetched and merged in background. For example, whevener the user calls the `fetchOrderBook (symbol, params)` method, the following sequence of events takes place:

> 1. If the user is already subscribed to the orderbook updates feed for that particular symbol, the returned value would represent the current state of that orderbook in memory with all updates up to the moment of the call.
> 2. If the user is not subscribed to the orderbook updates for that symbol yet, the library will subscribe the user to it upon first call.
> 3. After subscribing, the library will receive a snapshot of current orderbook. This is returned to the caller right away.
> 4. It will continue to receive partial updates just in time from the exchange, merging all updates with the orderbook in memory. Each incoming update is called a *delta*. Deltas represent changes to the orderbook (order added, edited or deleted) that have to be merged on top of the last known snapshot of the orderbook. These update-deltas are incoming continuously as soon as the exchange sends them.
> 5. The ccxt library merges deltas to the orderbook in background.
> 6. If the user calls the same `fetchOrderBook` method again – the library will return the up-to-date orderbook with all current deltas merged into it (return to step 1 at this point).

> The above behaviour is the same for all methods that can get data feeds from exchanges websocket. The library will fallback to HTTP REST and will send a HTTP request if the exchange does not offer streaming of this or that type of data.

> The list of related unified API methods is:

> - fetchOrderBook
> - fetchOrderBooks
> - fetchTicker
> - fetchTickers
> - fetchTrades
> - fetchBalances
> - fetchOrders
> - fetchOpenOrders
> - fetchClosedOrders
> - fetchMyTrades
> - fetchTransactions
> - fetchDeposits
> - fetchWithdrawals

> The *push* interface contains all of the above methods, but works in reverse, the library pushes the updates to the user. This is done in two ways:
> - callbacks (JS, Python 2 & 3, PHP)
> - async generators (JS, Python 3.5+)

> The async generators is the prefered modern way of reading and writing streams of data. They do the work of callbacks in much more natural syntax that is built into the language itself. A callback is a mechanism of an inverted flow control. An async generator, on the other hand, is a mechanism of a direct flow control. Async generators make code much cleaner and sometimes even faster in both development and production.

> The *push* scenario
> Instead of using the outdated principles of callbacks the  , the philosophy of the library uses async generators library This is done with async generators with direct flow control.


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

The imported CCXT Pro module wraps the CCXT inside itself – every exchange instantiated via CCXT Pro has all the CCXT methods as well as the additional functionality.

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

```JavaScript
{
    'has': { ... } // an extended associative array of extended exchange capabilities (e.g. `watchOrderBook`, `watchOHLCV`, ...)
    'urls': {
        'api': { // will contain a streaming API base URL, depending on the underlying protocol
            'ws': 'wss://ws.exchange.com',            // https://en.wikipedia.org/wiki/WebSocket
            'signalr': 'https://signalr.exchange.com' // https://en.wikipedia.org/wiki/SignalR
            'socketio': 'wss://socket.exchange.io'    // https://socket.io
        },
    }
    'version': '1.21',
    'streaming': {
        'keepAlive': 30000, // integer keep-alive rate in milliseconds
        'maxPingPongMisses': 2.0, // how many ping pong misses to drop and reconnect
        ... // other streaming options
    },
}
```



### Keep-Alive

### Rate limiting

### API Methods

### Error Handling

