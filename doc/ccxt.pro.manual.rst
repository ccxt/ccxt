`⌂ Home <ccxt.pro>`__

Manual
======

The CCXT Pro stack is built upon `CCXT <https://ccxt.trade>`__ and extends the core CCXT classes, using:

-  JavaScript prototype-level mixins
-  Python multiple inheritance
-  PHP Traits

The CCXT Pro heavily relies on the transpiler of CCXT for `multilanguge support <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support>`__.

::

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
       |       watchTicker            .       watchCreateOrder       |
       |       watchTickers           .       watchCancelOrder       |
       |       watchOrderBook         .             watchOrder       |
       |       watchOHLCV             .            watchOrders       |
       |       watchStatus            .        wathgOpenOrders       |
       |       watchTrades            .      watchClosedOrders       |
       |                              .          watchMyTrades       |
       |                              .           watchDeposit       |
       |                              .          watchWithdraw       |
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

Exchanges
=========

The CCXT Pro library currently supports the following 18 cryptocurrency exchange markets and WebSocket trading APIs:

+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
|        logo                                                                            | id            | name                                                                                   | ver | doc                                                                                             | certified                                                            | pro                             |
+========================================================================================+===============+========================================================================================+=====+=================================================================================================+======================================================================+=================================+
| `binance <https://www.binance.com/?ref=10205187>`__                                    | binance       | `Binance <https://www.binance.com/?ref=10205187>`__                                    | \*  | `API <https://binance-docs.github.io/apidocs/spot/en>`__                                        | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `binanceje <https://www.binance.je/?ref=35047921>`__                                   | binanceje     | `Binance Jersey <https://www.binance.je/?ref=35047921>`__                              | \*  | `API <https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md>`__ |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `binanceus <https://www.binance.us/?ref=35005074>`__                                   | binanceus     | `Binance US <https://www.binance.us/?ref=35005074>`__                                  | \*  | `API <https://github.com/binance-us/binance-official-api-docs>`__                               |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `bitfinex <https://www.bitfinex.com/?refcode=P61eYxFL>`__                              | bitfinex      | `Bitfinex <https://www.bitfinex.com/?refcode=P61eYxFL>`__                              | 1   | `API <https://docs.bitfinex.com/v1/docs>`__                                                     | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `bitmex <https://www.bitmex.com/register/upZpOX>`__                                    | bitmex        | `BitMEX <https://www.bitmex.com/register/upZpOX>`__                                    | 1   | `API <https://www.bitmex.com/app/apiOverview>`__                                                |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `bitstamp <https://www.bitstamp.net>`__                                                | bitstamp      | `Bitstamp <https://www.bitstamp.net>`__                                                | 2   | `API <https://www.bitstamp.net/api>`__                                                          |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `bittrex <https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B>`__            | bittrex       | `Bittrex <https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B>`__            | 1.1 | `API <https://bittrex.github.io/api/>`__                                                        | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `coinbaseprime <https://prime.coinbase.com>`__                                         | coinbaseprime | `Coinbase Prime <https://prime.coinbase.com>`__                                        | \*  | `API <https://docs.prime.coinbase.com>`__                                                       |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `coinbasepro <https://pro.coinbase.com/>`__                                            | coinbasepro   | `Coinbase Pro <https://pro.coinbase.com/>`__                                           | \*  | `API <https://docs.pro.coinbase.com>`__                                                         |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `gateio <https://www.gate.io/signup/2436035>`__                                        | gateio        | `Gate.io <https://www.gate.io/signup/2436035>`__                                       | 2   | `API <https://gate.io/api2>`__                                                                  |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `huobipro <https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3>`__             | huobipro      | `Huobi Pro <https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3>`__            | 1   | `API <https://huobiapi.github.io/docs/spot/v1/cn/>`__                                           |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `huobiru <https://www.huobi.com.ru/invite?invite_code=esc74>`__                        | huobiru       | `Huobi Russia <https://www.huobi.com.ru/invite?invite_code=esc74>`__                   | 1   | `API <https://github.com/cloudapidoc/API_Docs_en>`__                                            |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `kraken <https://www.kraken.com>`__                                                    | kraken        | `Kraken <https://www.kraken.com>`__                                                    | 0   | `API <https://www.kraken.com/features/api>`__                                                   | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `kucoin <https://www.kucoin.com/?rcode=E5wkqe>`__                                      | kucoin        | `KuCoin <https://www.kucoin.com/?rcode=E5wkqe>`__                                      | 2   | `API <https://docs.kucoin.com>`__                                                               |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `okcoin <https://www.okcoin.com/account/register?flag=activity&channelId=600001513>`__ | okcoin        | `OKCoin <https://www.okcoin.com/account/register?flag=activity&channelId=600001513>`__ | 3   | `API <https://www.okcoin.com/docs/en/>`__                                                       |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `okex <https://www.okex.com/join/1888677>`__                                           | okex          | `OKEX <https://www.okex.com/join/1888677>`__                                           | 3   | `API <https://www.okex.com/docs/en/>`__                                                         |                                                                      | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `poloniex <https://www.poloniex.com/?utm_source=ccxt&utm_medium=web>`__                | poloniex      | `Poloniex <https://www.poloniex.com/?utm_source=ccxt&utm_medium=web>`__                | \*  | `API <https://docs.poloniex.com>`__                                                             | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+
| `upbit <https://upbit.com>`__                                                          | upbit         | `Upbit <https://upbit.com>`__                                                          | 1   | `API <https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C>`__           | `CCXT Certified <https://github.com/ccxt/ccxt/wiki/Certification>`__ | `CCXT Pro <https://ccxt.pro>`__ |
+----------------------------------------------------------------------------------------+---------------+----------------------------------------------------------------------------------------+-----+-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------+---------------------------------+

This is the list of exchanges in CCXT Pro with support for WebSockets APIs. This list will be updated with new exchanges on a regular basis.

Full list of exchanges available in CCXT via REST: `Supported Cryptocurrency Exchange Markets <https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets>`__.

Usage
=====

.. code:: diff

   - this part of the doc is under heavy development right now
   - there may be some typos, mistakes and missing info here and there
   - contributions, pull requests and feedback appreciated

Prerequisites
-------------

The best way to understand CCXT Pro is to make sure you grasp the entire CCXT Manual and practice standard CCXT first. CCXT Pro borrows from CCXT. The two libraries share a lot of commonalities, including:

-  the concepts of public API and private authenticated API
-  markets, symbols, currency codes and ids
-  unified data structures and formats, orderbooks, trades, orders, candles, timeframes, …
-  exceptions and error mappings
-  authentication and API keys (for private feeds and calls)
-  configuration options

The CCXT Pro audience consists mostly of professional algorithmic traders and developers. In order to work efficiently with this library the user is required to be well-familiar with the concepts of streaming. One has to understand the underlying differences between connection-based streaming APIs (`WebSocket <https://en.wikipedia.org/wiki/WebSocket>`__, CCXT Pro) and request-response based APIs (`REST <https://en.wikipedia.org/wiki/Representational_state_transfer>`__, CCXT).

The general async-style flow for a CCXT application is as follows:

.. code:: javascript


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

In CCXT Pro each public and private unified RESTful method having a ``fetch*`` prefix also has a corresponding stream-based counterpart method prefixed with ``watch*``, as follows:

-  Public API

   -  ``fetchStatus`` → ``watchStatus``
   -  ``fetchOrderBook`` → ``watchOrderBook``
   -  ``fetchTicker`` → \ ``watchTicker``
   -  ``fetchTickers`` → \ ``watchTickers``
   -  ``fetchOHLCV`` → ``watchOHLCV``
   -  ``fetchTrades`` → ``watchTrades``
   -  ``fetchStatus`` → ``watchStatus``

-  Private API

   -  ``fetchBalance`` → ``watchBalance``
   -  ``fetchOrders`` → ``watchOrders``
   -  ``fetchMyTrades`` → ``watchMyTrades``
   -  ``fetchTransactions`` → ``watchTransactions``
   -  ``fetchLedger`` → ``watchLedger``
   -  ``createOrder`` → ``watchCreateOrder`` \ *(notice the ``watch`` prefix)*\ 
   -  ``cancelOrder`` → ``watchCancelOrder`` \ *(notice the ``watch`` prefix)*\ 

The Unified CCXT Pro Streaming API inherits CCXT usage patterns to make migration easier.

The general async-style flow for a CCXT Pro application (as opposed to a CCXT application above) is shown below:

.. code:: javascript


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

That usage pattern is usually wrapped up into a core business-logic method called *“a ``tick()`` function”*, since it reiterates a reaction to the incoming events (aka *ticks*). From the two examples above it is obvious that the generic usage pattern in CCXT Pro and CCXT is identical.

Many of the CCXT rules and concepts also apply to CCXT Pro:

-  CCXT Pro will load markets and will cache markets upon the first call to a unified API method
-  CCXT Pro will call CCXT RESTful methods under the hood if necessary
-  CCXT Pro will throw standard CCXT exceptions where necessary
-  …

Streaming Specifics
-------------------

Despite of the numerous commonalities, streaming-based APIs have their own specifics, because of their connection-based nature.

Having a connection-based interface implies connection-handling mechanisms. Connections are managed by CCXT Pro transparently to the user. Each exchange instance manages its own set of connections.

Upon your first call to any ``watch*()`` method the library will establish a connection to a specific stream/resource of the exchange and will maintain it. If the connection already exists – it is reused. The library will handle the subscription request/response messaging sequences as well as the authentication/signing if the requested stream is private.

The library will also watch the status of the uplink and will keep the connection alive. Upon a critical exception, a disconnect or a connection timeout/failure, the next iteration of the tick function will call the ``watch`` method that will trigger a reconnection. This way the library handles disconnections and reconnections for the user transparently. CCXT Pro applies the necessary rate-limiting and exponential backoff reconnection delays. All of that functionality is enabled by default and can be configured via exchange properties, as usual.

Most of the exchanges only have a single base URL for streaming APIs (usually, WebSocket, starting with ``ws://`` or ``wss://``). Some of them may have more than one URL for each stream, depending on the feed in question.

Exchanges’ Streaming APIs can be classified into two different categories:

-  *sub* or *subscribe* allows receiving only
-  *pub* or *publish* allows sending and receiving

Sub
~~~

A *sub* interface usually allows to subscribe to a stream of data and listen for it. Most of exchanges that do support WebSockets will offer a *sub* type of API only. The *sub* type includes streaming public market data. Sometimes exchanges also allow subcribing to private user data. After the user subscribes to a data feed the channel effectively starts working one-way sending updates from the exchange towards the user continuously.

Commonly appearing types of public data streams:

-  order book (most common) - updates on added, edited and deleted orders (aka *change deltas*)
-  ticker updates upon changing of 24 hour stats
-  fills feed (also common) - a live stream of public trades
-  ohlcv candlestick feed
-  heartbeat
-  exchange chat/trollbox

Less common types of private user data streams:

-  the stream of private trades of the user
-  live order updates
-  balance updates
-  custom streams
-  exchange-specific and other streams

Pub
~~~

A *pub* interface usually allows users to send data requests towards the server. This usually includes common user actions, like:

-  placing orders
-  canceling orders
-  placing withdrawal requests
-  posting chat/trollbox messages
-  etc

**Some exchanges do not offer a pub WS API, they will offer sub WS API only.** However, there are exchanges that have a complete Streaming API as well. In most cases a user cannot operate effectively having just the Streaming API. Exchanges will stream public market data *sub*, and the REST API is still needed for the *pub* part where missing.

Incremental Data Structures
~~~~~~~~~~~~~~~~~~~~~~~~~~~

In many cases due to a unidirectional nature of the underlying data feeds, the application listening on the client-side has to keep a local snapshot of the data in memory and merge the updates received from the exchange server into the local snapshot. The updates coming from the exchange are also often called *deltas*, because in most cases those updates will contain just the changes between two states of the data and will not include the data that has not changed making it necessary to store the locally cached current state S of all relevant data objects.

All of that functionality is handled by CCXT Pro for the user. To work with CCXT Pro, the user does not have to track or manage subscriptions and related data. CCXT Pro will keep a cache of structures in memory to handle the underlying hassle.

Each incoming update says which parts of the data have changed and the receiving side “increments” local state S by merging the update on top of current state S and moves to next local state S’. In terms CCXT Pro that is called *“incremental state”* and the structures involved in the process of storing and updating the cached state are called *“incremental structures”*. CCXT Pro introduces several new base classes to handle the incremental state where necessary.

The incremental structures returned from the unified methods of CCXT Pro is often one of two types:

1. JSON-decoded object (``object`` in JavaScript, ``dict`` in Python, ``array()`` in PHP). This type may be returned from public and private methods like ``watchTicker``, ``watchBalance``, ``watchOrder``, etc.
2. An array/list of objects (usually sorted in chronological order). This type may be returned from methods like ``watchOHLCV``, ``watchTrades``, ``watchMyTrades``, ``watchOrders``, etc.

In the latter case the CCXT Pro library has to keep a reasonable limit on the number of objects kept in memory. The allowed maximum can be configured by the user upon instantiation or later.

Linking
-------

See instructions on installing here: `CCXT Pro Install <ccxt.pro.install.md>`__.

The process of including the CCXT Pro library into your script is pretty much the same as with the standard CCXT, the only difference is the name of the actual JavaScript module, Python package, or PHP namespace.

.. code:: javascript

   // JavaScript
   const ccxtpro = require ('ccxt.pro')
   console.log ('CCXT Pro version', ccxtpro.version)
   console.log ('Supported exchanges:', ccxtpro.exchanges)

.. code:: python

   # Python
   import ccxtpro
   print('CCXT Pro version', ccxtpro.__version__)
   print('Supported exchanges:', ccxtpro.exchanges)

.. code:: php

   // PHP
   use \ccxtpro; // optional, since you can use fully qualified names
   echo 'CCXT Pro version ', \ccxtpro\Exchange::VERSION, "\n";
   echo 'Supported exchanges: ', json_encode(\ccxtpro\Exchange::$exchanges), "\n";

The imported CCXT Pro module wraps the CCXT inside itself – every exchange instantiated via CCXT Pro has all the CCXT methods as well as the additional functionality.

Instantiation
-------------

CCXT Pro is designed for async/await style syntax and relies heavily on async primitives such as *promises* and *futures*.

Creating a CCXT Pro exchange instance is pretty much identical to creating a CCXT exchange instance.

.. code:: javascript

   // JavaScript
   const ccxtpro = require ('ccxt.pro')
   const exchange = new ccxtpro.binance ({ enableRateLimit: true })

The Python implementation of CCXT Pro relies on builtin `asyncio <https://docs.python.org/3/library/asyncio.html>`__ and `Event Loop <https://docs.python.org/3/library/asyncio-eventloop.html>`__ in particular. In Python it is required to supply an asyncio’s event loop instance in the constructor arguments as shown below (identical to ``ccxt.async support``):

.. code:: python

   # Python
   import ccxtpro
   import asyncio

   async def main(loop):
       exchange = ccxtpro.kraken({'enableRateLimit': True, 'asyncio_loop': loop})
       while True:
           orderbook = await exchange.watch_order_book('BTC/USD')
           print(orderbook['asks'][0], orderbook['bids'][0])
       await exchange.close()

   loop = asyncio.new_event_loop()
   loop.run_until_complete(main(loop))

In PHP the async primitives are borrowed from `ReactPHP <https://reactphp.org>`__. The PHP implementation of CCXT Pro relies on `Promise <https://github.com/reactphp/promise>`__ and `EventLoop <https://github.com/reactphp/event-loop>`__ in particular. In PHP the user is required to supply a ReactPHP’s event loop instance in the constructor arguments as shown below:

.. code:: php

   // PHP
   error_reporting(E_ALL | E_STRICT);
   date_default_timezone_set('UTC');
   require_once 'vendor/autoload.php';

   $loop = \React\EventLoop\Factory::create(); // the event loop goes here ↓
   $exchange = new \ccxtpro\kucoin(array('enableRateLimit' => true, 'loop' => $loop));

Exchange Properties
-------------------

Every CCXT Pro instance contains all properties of the underlying CCXT instance. Apart from the standard CCXT properties, the CCXT Pro instance includes the following:

.. code:: javascript

   {
       'has': { // an associative array of extended exchange capabilities
           'ws': true, // only available in CCXT Pro
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

Unified API
-----------

The Unified CCXT Pro API encourages direct control flow for better codestyle, more readable and architecturally superior code compared to using EventEmitters and callbacks. The latter is considered an outdated approach nowadays since it requires inversion of control (people aren’t used to inverted thinking).

CCXT Pro goes with the modern approach and it is designed for the async syntax. Under the hood, CCXT Pro will still have to use inverted control flow sometimes because of the dependencies and the WebSocket libs that can’t do otherwise.

The same is true not only for JS/ES6 but also for Python 3 async code as well. In PHP the async primitives are borrowed from `ReactPHP <https://reactphp.org/>`__.

Modern async syntax allows you to combine and split the execution into parallel pathways and then merge them, group them, prioritize them, and what not. With promises one can easily convert from direct async-style control flow to inverted callback-style control flow, back and forth.

Real-Time vs Throttling
~~~~~~~~~~~~~~~~~~~~~~~

CCXT Pro supports two modes of tick function loops – the real-time mode and the throttling mode. Both of them are shown below in pseudocode:

.. code:: javascript

   // real-time mode
   const limit = 5 // optional
   while (true) {
       try {
           const orderbook = await exchange.watchOrderBook (symbol, limit)
           // your reaction to the update takes place here
           // you arrive here after receiving the update from the exchange in real time
           console.log (orderbook) // every update
       } catch (e) {
           console.log (e)
           // throw e // uncomment to stop the loop on exceptions
       }
   }

.. code:: javascript

   // throttling mode
   const limit = 5 // optional
   // await is optional, alternatively you can launch it in bg without await
   await exchange.watchOrderBook (symbol, limit)
   while (true) {
       // your reaction takes place here
       // you arrive here every 100 ms regardless of whether there was an update or not
       // in throttling mode offloading the orderbook with .limit () is required
       console.log (exchange.orderbooks[symbol].limit (limit))
       await sleep (100) // every 100 ms
   }

In **real-time mode** CCXT Pro will return the result as soon as each new delta arrives from the exchange. The general logic of a unified call in a real-time loop is to await for the next delta and immediately return the unified result structure to the user, over and over again. This is useful when reaction time is critical, or has to be as fast as possible.

However, the real-time mode requires programming experience with async flows when it comes to synchronizing multiple parallel tick loops. Apart from that, the exchanges can stream a very large number of updates during periods of high activity or high volatility. Therefore the user developing a real-time algorithm has to make sure that the userland code is capable of consuming data that fast. Working in real-time mode may be more demanding for resources sometimes.

In **throttling mode** CCXT Pro will receive and manage the data in the background. The user is responsible for calling the results from time to time when necessary. The general logic of the throttling loop is to sleep for most of the time and wake up to check the results occasionally. This is usually done at some fixed frequency, or, *“frame rate”*. The code inside a throttling loop is often easier to synchronize across multiple exchanges. The rationing of time spent in a throttled loop also helps reduce resource usage to a minimum. This is handy when your algorithm is heavy and you want to control the execution precisely to avoid running it too often.

The obvious downside of the throttling mode is being less reactive or responsive to updates. When a trading algorithm has to wait some number milliseconds before being executed – an update or two may arrive sooner than that time expires. In throttling mode the user will only check for those updates upon next wakeup (loop iteration), so the reaction lag may vary within some number of milliseconds over time.

Public Methods
~~~~~~~~~~~~~~

Market Data
^^^^^^^^^^^

watchOrderBook
''''''''''''''

The ``watchOrderBook``\ ’s interface is identical to ```fetchOrderBook`` <https://github.com/ccxt/ccxt/wiki/Manual#order-book>`__. It accepts three arguments:

-  ``symbol`` – string, a unified CCXT symbol, required
-  ``limit`` – integer, the max number of bids/asks returned, optional
-  ``params`` – assoc dictionary, optional overrides as described in `Overriding Unified API Params <https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params>`__

In general, the exchanges can be divided in two categories:

1. the exchanges that support limited orderbooks (streaming just the top part of the stack of orders)
2. the exchanges that stream full orderbooks only

If the exchange accepts a limiting argument, the ``limit`` argument is sent towards the exchange upon subscribing to the orderbook stream over a WebSocket connection. The exchange will then send only the specified amount of orders which helps reduce the traffic. Some exchanges may only accept certain values of ``limit``, like 10, 25, 50, 100 and so on.

If the underlying exchange does not accept a limiting argument, the limiting is done on the client side.

The ``limit`` argument does not guarantee that the number of bids or asks will always be equal to ``limit``. It designates the upper boundary or the maximum, so at some moment in time there may be less than ``limit`` bids or asks, but never more than ``limit`` bids or asks. This is the case when the exchange does not have enough orders on the orderbook, or when one of the top orders in the orderbook gets matched and removed from the orderbook, leaving less than ``limit`` entries on either bids side or asks side. The free space in the orderbook usually gets quickly filled with new data.

.. code:: javascript

   // JavaScript
   if (exchange.has['watchOrderBook']) {
       while (true) {
           try {
               const orderbook = await exchange.watchOrderBook (symbol, limit, params)
               console.log (new Date (), symbol, orderbook['asks'][0], orderbook['bids'][0])
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchOrderBook']:
       while True:
           try:
               orderbook = await exchange.watch_order_book(symbol, limit, params)
               print(exchange.iso8601(exchange.milliseconds()), symbol, orderbook['asks'][0], orderbook['bids'][0])
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchOrderBook']) {
       $main = function () use (&$exchange, &$main, $symbol, $limit, $params) {
           $exchange->watch_order_book($symbol, $limit, $params)->then(function($orderbook) use (&$main, $symbol) {
               echo date('c'), ' ', $symbol, ' ', json_encode(array($orderbook['asks'][0], $orderbook['bids'][0])), "\n";
               $main();
           })->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

watchTicker
'''''''''''

.. code:: javascript

   // JavaScript
   if (exchange.has['watchTicker']) {
       while (true) {
           try {
               const ticker = await exchange.watchTicker (symbol, params)
               console.log (new Date (), ticker)
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchTicker']:
       while True:
           try:
               ticker = await exchange.watch_ticker(symbol, params)
               print(exchange.iso8601(exchange.milliseconds()), ticker)
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchTicker']) {
       $main = function () use (&$exchange, &$main, $symbol, $params) {
           $exchange->watch_ticker($symbol, $params)->then(function($ticker) use (&$main) {
               echo date('c'), ' ', json_encode($ticker), "\n";
               $main();
           })->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

watchTickers
''''''''''''

.. code:: javascript

   // JavaScript
   if (exchange.has['watchTickers']) {
       while (true) {
           try {
               const tickers = await exchange.watchTickers (symbols, params)
               console.log (new Date (), tickers)
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchTickers']:
       while True:
           try:
               tickers = await exchange.watch_tickers(symbols, params)
               print(exchange.iso8601(exchange.milliseconds()), tickers)
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchTickers']) {
       $main = function () use (&$exchange, &$main, $symbols, $params) {
           $exchange->watch_tickers($symbols, $params)->then(function($tickers) use (&$main) {
               echo date('c'), ' ', json_encode($tickers), "\n";
               $main();
           })->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

watchOHLCV
''''''''''

.. code:: javascript

   // JavaScript
   if (exchange.has['watchOHLCV']) {
       while (true) {
           try {
               const candles = await exchange.watchOHLCV (symbol, since, limit, params)
               console.log (new Date (), candles)
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchOHLCV']:
       while True:
           try:
               candles = await exchange.watch_ohlcv(symbol, since, limit, params)
               print(exchange.iso8601(exchange.milliseconds()), candles)
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchOHLCV']) {
       $main = function () use (&$exchange, &$main, $symbol, $timeframe, $since, $limit, $params) {
           $exchange->watch_ohlcv($symbol, $timeframe, $since, $limit, $params)->then(
               function($candles) use (&$main, $symbol, $timeframe) {
                   echo date('c'), ' ', $symbol, ' ', $timeframe, ' ', json_encode($candles), "\n";
                   $main();
               }
           )->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

watchTrades
'''''''''''

.. code:: javascript

   // JavaScript
   if (exchange.has['watchTrades']) {
       while (true) {
           try {
               const trades = await exchange.watchTrades (symbol, since, limit, params)
               console.log (new Date (), trades)
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchTrades']:
       while True:
           try:
               trades = await exchange.watch_trades(symbol, since, limit, params)
               print(exchange.iso8601(exchange.milliseconds()), trades)
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchTrades']) {
       $main = function () use (&$exchange, &$main, $symbol, $since, $limit, $params) {
           $exchange->watch_trades($symbol, $since, $limit, $params)->then(function($trades) use (&$main) {
               echo date('c'), ' ', json_encode($trades), "\n";
               $main();
           })->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

Private Methods
~~~~~~~~~~~~~~~

.. code:: diff

   - work in progress now

Authentication
^^^^^^^^^^^^^^

In most cases the authentication logic is borrowed from CCXT since the exchanges use the same keypairs and signing algorithms for REST APIs and WebSocket APIs. See `API Keys Setup <https://github.com/ccxt/ccxt/wiki/Manual#api-keys-setup>`__ for more details.

Trading
^^^^^^^

watchBalance
''''''''''''

.. code:: javascript

   // JavaScript
   if (exchange.has['watchBalance']) {
       while (true) {
           try {
               const balance = await exchange.watchBalance (params)
               console.log (new Date (), balance)
           } catch (e) {
               console.log (e)
               // stop the loop on exception or leave it commented to retry
               // throw e
           }
       }
   }

.. code:: python

   # Python
   if exchange.has['watchBalance']:
       while True:
           try:
               balance = await exchange.watch_balance(params)
               print(exchange.iso8601(exchange.milliseconds()), balance)
           except Exception as e:
               print(e)
               # stop the loop on exception or leave it commented to retry
               # rasie e

.. code:: php

   // PHP
   if ($exchange->has['watchBalance']) {
       $main = function () use (&$exchange, &$main, $params) {
           $exchange->watch_balance($params)->then(function($balance) use (&$main) {
               echo date('c'), ' ', json_encode($balance), "\n";
               $main();
           })->otherwise(function (\Exception $e) use (&$main) {
               echo get_class ($e), ' ', $e->getMessage (), "\n";
               $main();
               // stop the loop on exception or leave it commented to retry
               // throw $e;
           });
       };
       $loop->futureTick($main);
   }

watchOrders
'''''''''''

.. code:: diff

   - work in progress now

watchCreateOrder
''''''''''''''''

.. code:: diff

   - work in progress now

watchCancelOrder
''''''''''''''''

.. code:: diff

   - work in progress now

watchMyTrades
'''''''''''''

.. code:: diff

   - work in progress now

.. code:: javascript

   // JavaScript
   watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})

.. code:: python

   # Python
   watch_my_trades(symbol=None, since=None, limit=None, params={})

.. code:: php

   // PHP
   watch_my_trades($symbol = null, $since = null, $lmit = null, $params = array());

Funding
^^^^^^^

watchTransactions
'''''''''''''''''

.. code:: diff

   - work in progress now

Error Handling
--------------

In case of an error the CCXT Pro will throw a standard CCXT exception, see `Error Handling <https://github.com/ccxt/ccxt/wiki/Manual#error-handling>`__ for more details.
