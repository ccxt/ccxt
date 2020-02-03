![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)

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

- Unified public and private WebSockets APIs <sup>*wip now*</sup>
- Backward-compatible CCXT ←→ CCXT Pro adapters
- FIX protocol transports <sup>*planned*</sup>
-

## Technicalities:

- public and private unified streaming APIs
- auto-connection and re-connection
- connection timeouts
- re-connection exponential backoff delay
- keep-alive ping-pong
- proxies

## CCXT Pro License

```diff
- It is illegal to republish or redistribute the CCXT Pro source code without a separate permission from us.
- Violation of the licensing terms will trigger a ban followed by a legal pursuit.
```

The CCXT Pro is hosted in a private repository on GitHub. The access to the repository is licensed and granted by invitation only. In order to access the repository, the users must obtain prepaid subscription plans at https://ccxt.pro. The users of the library pay for the continued access to the repository, including updates, support and maintenance (new exchanges, improvements, bugfixes and so on).

CCXT Pro does not enforce technical restrictions that would affect the efficiency of direct communications between the users and the exchanges. The protection is not technical but legal. We do not impose unnecessary limitations or intermediary code. It is hard to know if someone is using CCXT Pro in private. If your CCXT Pro license expires, your software or system will not break down and will keep working fine with your most recent version by that time. However, if you discontinue your paid license you will lose the updates that will follow.

Any licensed user, developer, team, or company, having obtained paid access to the CCXT repository, can use CCXT Pro as a dependency, subject to the terms and limitations of the CCXT Pro paid subscription plans.

Licensees can use, copy, and modify CCXT Pro as long as they<br />**DO NOT VENDOR, PUBLISH, SELL OR REDISTRIBUTE THE SOURCE CODE OF CCXT PRO**.

It is allowed to specify CCXT Pro as a dependency of your software as long as you<br />**DO NOT INCLUDE A COPY OF THE CCXT PRO SOURCE CODE IN YOUR SOFTWARE**.

If you are a software developer you should specify CCXT Pro as your requirement. The end-user of your software is responsible for obtaining his own individual CCXT Pro license. The best practice is to make it clear in your docs or on your website. Since CCXT and CCXT Pro are interchangeable, auto-detection can be factored-in to let the end-user choose between the free CCXT and the paid CCXT Pro.

Thank you for using CCXT Pro legally!

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

# if you're using Git/HTTPS authentication
npm install git+https://github.com/kroitor/ccxt.pro.git

# if you are connecting to GitHub with SSH
npm install git@github.com/kroitor/ccxt.pro.git
```

## Python

```shell
# if you're using Git/HTTPS authentication
pip3 install -e git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python

# if you are connecting to GitHub with SSH
pip3 install -e git+ssh://git@github.com/kroitor/ccxt.pro.git#subdirectory=python
```

## PHP

```shell
# in your project directory
composer config repositories.ccxtpro '{"type": "git", "url": "https://github.com/kroitor/ccxt.pro.git"}'
composer require ccxt/ccxtpro
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

The best way to understand CCXT Pro is to make sure you grasp the entire CCXT Manual and practice standard CCXT first. CCXT Pro borrows from CCXT. The two libraries share a lot of commonalities, including:

- the concepts of public API and private authenticated API
- markets, symbols, currency codes and ids
- unified data structures and formats, orderbooks, trades, orders, candles, ...
- exceptions and error mappings
- authentication and API keys (for private feeds and calls)
- configuration options

The CCXT Pro audience consists mostly of professional algorithmic traders and developers. In order to work efficiently with this library the user is required to be well-familiar with the concepts of streaming. One has to understand the underlying differences between connection-based streaming APIs ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) and request-response based APIs ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

The general async-style flow for a CCXT application is as follows:

```JavaScript

// a RESTful orderbook polling request-response loop

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

- Public API
  - `fetchStatus` → `watchStatus`
  - `fetchOrderBook` → `watchOrderBook`
  - `fetchTicker` → `watchTicker`
  - `fetchTickers` → `watchTickers`
  - `fetchOHLCV` → `watchOHLCV`
  - `fetchTrades` → `watchTrades`
  - `fetchStatus` → `watchStatus`
- Private API
  - `fetchBalance` → `watchBalance`
  - `fetchOrders` → `watchOrders`
  - `fetchMyTrades` → `watchMyTrades`
  - `fetchTransactions` → `watchTransactions`
  - `fetchLedger` → `watchLedger`
  - `createOrder` → `watchCreateOrder` <sup>*(notice the `watch` prefix)*</sup>
  - `cancelOrder` → `watchCancelOrder` <sup>*(notice the `watch` prefix)*</sup>

The Unified CCXT Pro Streaming API inherits CCXT usage patterns to make migration easier.

The general async-style flow for a CCXT Pro application (as opposed to a CCXT application above) is shown below:

```JavaScript

// a stream-based (WebSocket) orderbook feed loop

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
- CCXT Pro will throw standard CCXT exceptions where necessary
- ...

### Streaming Specifics

Despite of the numerous commonalities, streaming-based APIs have their own specifics, because of their connection-based nature.

Having a connection-based interface implies connection-handling mechanisms. Connections are managed by CCXT Pro transparently to the user. Each exchange instance manages its own set of connections.

Upon your first call to any `watch*()` method the library will establish a connection to a specific stream/resource of the exchange and will maintain it. If the connection already exists – it is reused. The library will handle the subscription request/response messaging sequences as well as the authentication/signing if the requested stream is private.

The library will also watch the status of the uplink and will keep the connection alive. Upon a critical exception, a disconnect or a connection timeout/failure, the next iteration of the tick function will call the `watch` method that will trigger a reconnection. This way the library handles disconnections and reconnections for the user transparently. CCXT Pro applies the necessary rate-limiting and exponential backoff reconnection delays. All of that functionality is enabled by default and can be configured via exchange properties, as usual.

Most of the exchanges only have a single base URL for streaming APIs (usually, WebSocket, starting with `ws://` or `wss://`). Some of them may have more than one URL for each stream, depending on the feed in question.

Exchanges' Streaming APIs can be classified into two different categories:

- *sub* or *subscribe* allows receiving only
- *pub* or *publish* allows sending and receiving

#### Sub

A *sub* interface usually allows to subscribe to a stream of data and listen for it. Most of exchanges that do support WebSockets will offer a *sub* type of API only. The *sub* type includes streaming public market data. Sometimes exchanges also allow subcribing to private user data. After the user subscribes to a data feed the channel effectively starts working one-way sending updates from the exchange towards the user continuously.

Commonly appearing types of public data streams:

- order book (most common) - updates on added, edited and deleted orders (aka *change deltas*)
- ticker updates upon changing of 24 hour stats
- fills feed (also common) - a live stream of public trades
- ohlcv candlestick feed
- heartbeat
- exchange chat/trollbox

Less common types of private user data streams:

- the stream of private trades of the user
- live order updates
- balance updates
- custom streams
- exchange-specific and other streams

#### Pub

A *pub* interface usually allows users to send data requests towards the server. This usually includes common user actions, like:

- placing orders
- canceling orders
- placing withdrawal requests
- posting chat/trollbox messages
- etc

**Some exchanges do not offer a *pub* WS API, they will offer *sub* WS API only.** However, there are exchanges that have a complete Streaming API as well. In most cases a user cannot operate effectively having just the Streaming API. Exchanges will stream public market data *sub*, and the REST API is still needed for the *pub* part where missing.

#### Incremental Data Structures

In many cases due to a unidirectional nature of the underlying data feeds, the application listening on the client-side has to keep a local snapshot of the data in memory and merge the updates received from the exchange server into the local snapshot. The updates coming from the exchange are also often called _deltas_, because in most cases those updates will contain just the changes between two states of the data and will not include the data that has not changed making it necessary to store the locally cached current state S of all relevant data objects.

All of that functionality is handled by CCXT Pro for the user. To work with CCXT Pro, the user does not have to track or manage subscriptions and related data. CCXT Pro will keep a cache of structures in memory to handle the underlying hassle.

Each incoming update says which parts of the data have changed and the receiving side "increments" local state S by merging the update on top of current state S and moves to next local state S'. In terms CCXT Pro that is called _"incremental state"_ and the structures involved in the process of storing and updating the cached state are called _"incremental structures"_. CCXT Pro introduces several new base classes to handle the incremental state where necessary.

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
    'has': { // an associative array of extended exchange capabilities
        'ws': true,
        'watchOrderBook': true,
        'watchTicker': true,
        'watchTrades': true,
        'watchOHLCV': true,
        'watchBalance': true,
        'watchCreateOrder': true,
        'watchCancelOrder': true,
        ...
    },
    'urls': {
        'api': { // will contain a streaming API base URL, depending on the underlying protocol
            'ws': 'wss://ws.exchange.com',            // https://en.wikipedia.org/wiki/WebSocket
            'signalr': 'https://signalr.exchange.com' // https://en.wikipedia.org/wiki/SignalR
            'socketio': 'wss://socket.exchange.io'    // https://socket.io
        },
    },
    'version': '1.21',
    'streaming': {
        'keepAlive': 30000, // integer keep-alive rate in milliseconds
        'maxPingPongMisses': 2.0, // how many ping pong misses to drop and reconnect
        ... // other streaming options
    },
    // incremental data structures
    'orderbooks':   {}, // incremental order books indexed by symbol
    'ohlcvs':       {}, // standard CCXT OHLCVs indexed by symbol by timeframe
    'balance':      {}, // a standard CCXT balance structure, accounts indexed by currency code
    'orders':       {}, // standard CCXT order structures indexed by order id
    'trades':       {}, // arrays of CCXT trades indexed by symbol
    'tickers':      {}, // standard CCXT tickers indexed by symbol
    'transactions': {}, // standard CCXT deposits and withdrawals indexed by id or txid
    ...
}
```

### Keep-Alive

### Rate limiting

### API Methods

### Error Handling
