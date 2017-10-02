Below is a set of frequently asked questions you need to answer, if you want to implement a cryptocurrency algorithmic trading bot yourself or if you want us to make one for you. Try being as specific as you possibly can.

Strategy
========

-  What is the trading strategy you want implemented (say, if it is an arbitrage strategy, what kind/type of arbitrage you want: basic, statistical, rebalancing, triangular, etc...)?
-  What's considered to be a trading opportunity for the bot?
-  What are desired conditions to enter a trade? Apply the following questions to each sentence of your specification:

   -  At which price/rate/level?
   -  For which volume?
   -  On which exchange?

-  What are the exit conditions?
-  What are your risk management requirements?
-  Do you want to trade with one account or multiple accounts within each exchange?
-  Do you want advanced asset management within the bot itself (withdraws, deposits, portfolio balancing, exposure control, etc...)?
-  Does your strategy involve OTC trading or darkpools?
-  Do you want to lend and provide liquidity?
-  Is it a maker, a taker or both?
-  Does it involve margin or leveraged (*position*) trading?

Access
======

-  Which exchanges you want?
-  Which pairs/instruments you want?
-  Do you need chat integrations and/or notifications (slack, telegram, discord, irc, twitter, email, text messaging, mobile push notifications or other means)?
-  Do you want to control it from a phone application?
-  Do you want network access to your bot?
-  Do you want web access to your bot (to open it within a browser tab)?
-  Do you want to integrate with the actual blockchain or a transaction graph of an existing cryptocurrency like Bitcoin, Ethereum, altcoins?
-  Which external sources of data and online services you want integrated for market insights, signals (other purposes, maybe)?

Technology
==========

-  What programming language do you prefer?
-  Is it a standalone executable/script or a client-server architecture?
-  What are you hardware and bandwidth requirements (do you want a bot to run from an Arduino USB stick, from your mobile, from a server rack, from within a cloud)?
-  What's your target OS / runtime environment?
-  What are your resource limits on traffic, storage space, memory and CPU time?
-  Which of these connectivity options do you choose? You can choose more than one, but you need to choose at least one:

   -  Standard REST over HTTP?
   -  WebSocket (usually faster than REST)?
   -  FIX/IFEX?
   -  other?

-  Do you need to proxify your requests (to work around exchange request rate limits)?
-  What parameters do you want for control?
-  Do you want it to have a rich GUI?
-  Do you need sophisticated interactive charts?
-  What kind of reporting do you need apart from a standard log of trades?
-  Do you need the bot to interact with other software for additional market data, charts, etc?

Testing
=======

-  Do you want paper trading capabilities (trade simulation in real time)?
-  Do you want to have backtesting functionality (for trade simulation with data from recent past)? Adding this feature can easily double the time and costs, depending on the number of exchanges and pairs you want.
-  How much historical data you require? The more it is, the better infrastructure you will need.
-  Do you want to conduct a test of your strategy before running it in real action?
-  How much of statistical calculations you want to perform, do you want concurrency, parallelism, genetic algorithms?

Scalability
===========

-  Do you want to run it from your computer for personal use (intra-day orders, up to several trades per minute)?
-  Do you want a large-scale High-Frequency Trading business operation across multiple countries (do you need lowest possible latencies for HFT, up to several trades per second)?
-  Do you want to have it online in a distributed network of leased VDS/VPS close to the exchange?
-  What are your requirements for redundancy and maximum downtime, can you afford to stop the trade?
-  Do you need server / bot instance hot-swap?
-  Do you want to use it yourself / in-house, or you want to sell it as part of your service or product to your clients?
-  Do you want to integrate coin exchange functionality with your running business (accept payments and do e-commerce in bitcoin, ether and other currencies)?

Additional Notes
~~~~~~~~~~~~~~~~

For those who are not programmers or software developers: please, don't waste your time asking *'How much does it cost to make a bot?'*. You need to be a lot more specific than that if you really want your bot or your software done. At least be generous enough to include a feature list in your request. Without knowing your requirements it's very hard for us to quote you. You should be able to tell exactly what you want and to specify your requirements in a structured way.

A one-liner question is not enough to derive a precise estimate of time and costs. If you ask *'How much is it?'* and don't say what it is, it's like asking *'How much is it to buy a car or a house?'*. The first answer you'll get is: *'That depends.'*. You should specify your wheels, your roof, your engine, your basement type, the size of your windows, your desired interior and exterior, etc, etc... Specify everything, just like you would do in everyday life. We can only quote you based on your design specification, so you must have it for a start.

If you don't have a specification of your desired trading strategy we can make it for you, but it can cost you extra time and money.
