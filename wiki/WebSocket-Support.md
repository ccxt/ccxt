# Streaming

The streaming WebSocket API is currently under development (a work in progress). Below are key design considerations on supporting WebSockets in ccxt library.

In general, not all exchanges offer WebSockets, but many of them do. Exchanges' WebSocket APIs can be classified into two different categories:

- *sub* or *subscribe* allows receiving only
- *pub* or *publish* allows sending and receiving

## Sub

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

## Pub

A *pub* interface usually allows users to send data requests towards the server. This usually includes common user actions, like:
- placing and canceling orders
- placing withdrawal requests
- posting chat messages
- etc

**Most exchanges do not offer a *pub* WS API, they will offer *sub* WS API only.** However, there are some exchanges that have a complete WebSocket API.

## Unified WS API

In most cases a user cannot operate effectively having just the WebSocket API. Exchanges will stream public market data *sub*, and the REST API is still needed for the *pub* part (where missing).

The goal of ccxt is to  seamlessly combine in a unified interface all available types of networking, possibly, without introducing backward-incompatible changes.

The WebSocket API in ccxt consists of the following:
- the pull (on-demand) interface
- the push (notification-based) interface

The *pull* WebSocket interface replicates the async REST interface one-to-one. So, in order to switch from `REST` to `pull WebSocket + REST`, the user is only required to submit a { ws: true } option to constructor params. From there any call to the unified API will be switched to WebSockets, where available (whee supported by the exchange).

The *pull* interface means the user pulling data from the library by calling its methods, whereas the data is fetched and merged in background. For example, whevener the user calls the `fetchOrderBook (symbol, params)` method, the following sequence of events takes place:

1. If the user is already subscribed to the orderbook updates feed for that particular symbol, the returned value would represent the current state of that orderbook in memory with all updates up to the moment of the call.
2. If the user is not subscribed to the orderbook updates for that symbol yet, the library will subscribe the user to it upon first call.
3. After subscribing, the library will receive a snapshot of current orderbook. This is returned to the caller right away.
4. It will continue to receive partial updates just in time from the exchange, merging all updates with the orderbook in memory. Each incoming update is called a *delta*. Deltas represent changes to the orderbook (order added, edited or deleted) that have to be merged on top of the last known snapshot of the orderbook. These update-deltas are incoming continuously as soon as the exchange sends them.
5. The ccxt library merges deltas to the orderbook in background.
6. If the user calls the same `fetchOrderBook` method again – the library will return the up-to-date orderbook with all current deltas merged into it (return to step 1 at this point).

The above behaviour is the same for all methods that can get data feeds from exchanges websocket. The library will fallback to HTTP REST and will send a HTTP request if the exchange does not offer streaming of this or that type of data.

The list of related unified API methods is:

- fetchOrderBook
- fetchOrderBooks
- fetchTicker
- fetchTickers
- fetchTrades
- fetchBalances
- fetchOrders
- fetchOpenOrders
- fetchClosedOrders
- fetchMyTrades
- fetchTransactions
- fetchDeposits
- fetchWithdrawals

The *push* interface contains all of the above methods, but works in reverse, the library pushes the updates to the user.
This is done in two ways:
- callbacks (JS, Python 2 & 3, PHP)
- async generators (JS, Python 3.5+)

The async generators is the prefered modern way of reading and writing streams of data. They do the work of callbacks in much more natural syntax that is built into the language itself. A callback is a mechanism of an inverted flow control. An async generator, on the other hand, is a mechanism of a direct flow control. Async generators make code much cleaner and sometimes even faster in both development and production.

The *push* scenario
Instead of using the outdated principles of callbacks the  , the philosophy of the library uses async generators library This is done with async generators with direct flow control.

, by calling a corresponding user method. In terms of the above example, the *push* scenario is the following sequence of events:

1. The user calls `fetchOrderBook()`.
2. If the user is not subscribed yet, the call to `fetchOrderBook` subscribes the user to the feed.
3. If the user is already subscribed the call returns on next incoming update.
3. Whenever an update is


2. whenever there is a related update, the user method gets called