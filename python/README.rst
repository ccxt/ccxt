CCXT – CryptoCurrency eXchange Trading Library
==============================================

|Build Status| |npm| |PyPI| |NPM Downloads| |Try ccxt on RunKit| |Gitter| |Supported Exchanges|

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

The **CCXT** library is used to connect and trade with cryptocurrency / altcoin exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, webshop integration and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms on top of it.

Current featurelist:

-  support for many exchange markets, even more upcoming soon
-  fully implemented public and private APIs for all exchanges
-  all currencies, altcoins and symbols, prices, order books, trades, tickers, etc...
-  optional normalized data for cross-exchange or cross-currency analytics and arbitrage
-  an out-of-the box unified all-in-one API extremely easy to integrate
-  works in Node 7.6+, Python 2 and 3, PHP 5.3+, web browsers

`ccxt on GitHub <https://github.com/ccxt/ccxt>`__ | Install | Usage | `Manual <https://github.com/ccxt/ccxt/wiki>`__ | `Examples <https://github.com/ccxt/ccxt/tree/master/examples>`__ | `Changelog <https://github.com/ccxt/ccxt/blob/master/CHANGELOG.md>`__ | `Contributing <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md>`__

Supported Cryptocurrency Exchange Markets
-----------------------------------------

The ccxt library currently supports the following 91 cryptocurrency exchange markets and trading APIs:

+--------------------------------------------+
| countries                                  |
+============================================+
| US                                         |
+--------------------------------------------+
| Panama                                     |
+--------------------------------------------+
| Australia                                  |
+--------------------------------------------+
| Canada                                     |
+--------------------------------------------+
| Japan, Singapore, Hong Kong, New Zealand   |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| Israel                                     |
+--------------------------------------------+
| Poland, EU                                 |
+--------------------------------------------+
| Indonesia                                  |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| Japan                                      |
+--------------------------------------------+
| South Korea                                |
+--------------------------------------------+
| UK, EU, Russia                             |
+--------------------------------------------+
| Poland, EU                                 |
+--------------------------------------------+
| Seychelles                                 |
+--------------------------------------------+
| Mexico                                     |
+--------------------------------------------+
| UK                                         |
+--------------------------------------------+
| UK                                         |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| Netherlands, EU                            |
+--------------------------------------------+
| Brazil                                     |
+--------------------------------------------+
| Japan                                      |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| Philippines                                |
+--------------------------------------------+
| Australia                                  |
+--------------------------------------------+
| Ukraine                                    |
+--------------------------------------------+
| Turkey                                     |
+--------------------------------------------+
| Iceland, US, EU                            |
+--------------------------------------------+
| British Virgin Islands, China              |
+--------------------------------------------+
| Thailand                                   |
+--------------------------------------------+
| Germany, EU                                |
+--------------------------------------------+
| UK, EU, Cyprus, Russia                     |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| Chile                                      |
+--------------------------------------------+
| Japan, Indonesia                           |
+--------------------------------------------+
| UK                                         |
+--------------------------------------------+
| Panama, Bulgaria, China, US                |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| UK, Czech Republic                         |
+--------------------------------------------+
| India                                      |
+--------------------------------------------+
| Australia                                  |
+--------------------------------------------+
| New Zealand                                |
+--------------------------------------------+
| UK                                         |
+--------------------------------------------+
| Spain, Russia                              |
+--------------------------------------------+
| Brazil                                     |
+--------------------------------------------+
| Brazil                                     |
+--------------------------------------------+
| Sweden                                     |
+--------------------------------------------+
| Singapore                                  |
+--------------------------------------------+
| Hong Kong                                  |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| Hong Kong                                  |
+--------------------------------------------+
| Hong Kong                                  |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| Australia, New Zealand                     |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| Ukraine                                    |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| US, UK, Russia                             |
+--------------------------------------------+
| Ukraine                                    |
+--------------------------------------------+
| UK, Singapore, South Africa                |
+--------------------------------------------+
| Brazil                                     |
+--------------------------------------------+
| UK, Hong Kong                              |
+--------------------------------------------+
| Tanzania                                   |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| China, US                                  |
+--------------------------------------------+
| China, US                                  |
+--------------------------------------------+
| France, EU                                 |
+--------------------------------------------+
| US                                         |
+--------------------------------------------+
| Canada                                     |
+--------------------------------------------+
| China, Taiwan                              |
+--------------------------------------------+
| Japan, Singapore, Vietnam                  |
+--------------------------------------------+
| Argentina                                  |
+--------------------------------------------+
| Venezuela                                  |
+--------------------------------------------+
| UK                                         |
+--------------------------------------------+
| Malta                                      |
+--------------------------------------------+
| Pakistan                                   |
+--------------------------------------------+
| Switzerland                                |
+--------------------------------------------+
| Vietnam                                    |
+--------------------------------------------+
| Austria, EU                                |
+--------------------------------------------+
| New Zealand                                |
+--------------------------------------------+
| Russia                                     |
+--------------------------------------------+
| Russia                                     |
+--------------------------------------------+
| China                                      |
+--------------------------------------------+
| Japan                                      |
+--------------------------------------------+

The list above is updated frequently, new crypto markets, altcoin exchanges, bug fixes, API endpoints are introduced and added on regular basis. See the `Manual <https://github.com/ccxt/ccxt/wiki>`__ for details. If you don't find a cryptocurrency exchange market in the list above and/or want another exchange to be added, post or send us a link to it by opening an issue here on GitHub or via email.

The library is under `MIT license <https://github.com/ccxt/ccxt/blob/master/LICENSE.txt>`__, that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

Install
-------

The easiest way to install the ccxt library is to use builtin package managers:

-  `ccxt in **NPM** <http://npmjs.com/package/ccxt>`__ (JavaScript / Node v7.6+)
-  `ccxt in **PyPI** <https://pypi.python.org/pypi/ccxt>`__ (Python 2 and 3)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

-  ```ccxt.js`` <https://github.com/ccxt/ccxt/blob/master/ccxt.js>`__ in JavaScript
-  ```ccxt/`` <https://github.com/ccxt/ccxt/blob/master/ccxt/>`__ in Python (generated from JS)
-  ```build/ccxt.php`` <https://github.com/ccxt/ccxt/blob/master/build/ccxt.php>`__ in PHP (generated from JS)

You can also clone it into your project directory from `ccxt GitHub repository <https://github.com/ccxt/ccxt>`__:

.. code:: shell

    git clone https://github.com/ccxt/ccxt.git

An alternative way of installing this library into your code is to copy a single file manually into your working directory with language extension appropriate for your environment.

JavaScript (NPM)
~~~~~~~~~~~~~~~~

JavaScript version of CCXT works both in Node and web browsers. Requires ES6 and ``async/await`` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is `not excluded <https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178>`__ in your ``babel-loader`` config.

`ccxt in **NPM** <http://npmjs.com/package/ccxt>`__

.. code:: shell

    npm install ccxt

.. code:: javascript

    var ccxt = require ('ccxt')

    console.log (ccxt.exchanges) // print all available exchanges

JavaScript (for use with the ``<script>`` tag):
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

`All-in-one browser bundle <https://unpkg.com/ccxt>`__ (dependencies included), served from `unpkg CDN <https://unpkg.com/>`__, which is a fast, global content delivery network for everything on NPM.

.. code:: html

    <script type="text/javascript" src="https://unpkg.com/ccxt"></script>

Creates a global ``ccxt`` object:

.. code:: javascript

    console.log (ccxt.exchanges) // print all available exchanges

Python
~~~~~~

`ccxt in **PyPI** <https://pypi.python.org/pypi/ccxt>`__

.. code:: shell

    pip install ccxt

.. code:: python

    import ccxt
    print(ccxt.exchanges) # print a list of all available exchange classes

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5+

.. code:: python

    import ccxt.async as ccxt # link against the asynchronous version of ccxt

PHP
~~~

The ccxt library in PHP: `**``ccxt.php``** <https://raw.githubusercontent.com/ccxt/ccxt/master/build/ccxt.php>`__

It requires common PHP modules:

-  cURL
-  mbstring (using UTF-8 is highly recommended)
-  PCRE
-  iconv

.. code:: php

    include "ccxt.php";
    var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes

Documentation
-------------

Read the `Manual <https://github.com/ccxt/ccxt/wiki>`__ for more details.

Usage
-----

Intro
~~~~~

The ccxt library consists of a public part and a private part. Anyone can use the public part out-of-the-box immediately after installation. Public APIs open access to public information from all exchange markets without registering user accounts and without having API keys.

Public APIs include the following:

-  market data
-  instruments/trading pairs
-  price feeds (exchange rates)
-  order books
-  trade history
-  tickers
-  OHLC(V) for charting
-  other public endpoints

For trading with private APIs you need to obtain API keys from/to exchange markets. It often means registering with exchanges and creating API keys with your account. Most exchanges require personal info or identification. Some kind of verification may be necessary as well. If you want to trade you need to register yourself, this library will not create accounts or API keys for you. Some exchange APIs expose interface methods for registering an account from within the code itself, but most of exchanges don't. You have to sign up and create API keys with their websites.

Private APIs allow the following:

-  manage personal account info
-  query account balances
-  trade by making market and limit orders
-  deposit and withdraw fiat and crypto funds
-  query personal orders
-  get ledger history
-  transfer funds between accounts
-  use merchant services

This library implements full public and private REST APIs for all exchanges. WebSocket and FIX implementations in JavaScript, PHP, Python and other languages coming soon.

The ccxt library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

::

    // both of these notations work in JavaScript/Python/PHP
    exchange.methodName ()  // camelcase pseudocode
    exchange.method_name () // underscore pseudocode

Read the `Manual <https://github.com/ccxt/ccxt/wiki>`__ for more details.

JavaScript
~~~~~~~~~~

.. code:: javascript

    'use strict';
    var ccxt = require ('ccxt')

    ;(() => async function () {

        let kraken    = new ccxt.kraken ()
        let bitfinex  = new ccxt.bitfinex ({ verbose: true })
        let huobi     = new ccxt.huobi ()
        let okcoinusd = new ccxt.okcoinusd ({
            apiKey: 'YOUR_PUBLIC_API_KEY',
            secret: 'YOUR_SECRET_PRIVATE_KEY',
        })

        let krakenMarkets = await kraken.loadMarkets ()

        console.log (kraken.id,    krakenMarkets)
        console.log (bitfinex.id,  await bitfinex.loadMarkets  ())
        console.log (huobi.id,     await huobi.loadMarkets ())

        console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
        console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
        console.log (huobi.id,     await huobi.fetchTrades ('ETH/CNY'))

        console.log (okcoinusd.id, await okcoinusd.fetchBalance ())

        // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
        console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))

        // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
        console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

        // pass/redefine custom exchange-specific order params: type, amount, price or whatever
        // use a custom order type
        bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
    }) ()

Python
~~~~~~

.. code:: python

    # coding=utf-8

    import ccxt

    hitbtc = ccxt.hitbtc({'verbose': True})
    bitmex = ccxt.bitmex()
    huobi  = ccxt.huobi()
    exmo   = ccxt.exmo({
        'apiKey': 'YOUR_PUBLIC_API_KEY',
        'secret': 'YOUR_SECRET_PRIVATE_KEY',
    })

    hitbtc_markets = hitbtc.load_markets()

    print(hitbtc.id, hitbtc_markets)
    print(bitmex.id, bitmex.load_markets())
    print(huobi.id, huobi.load_markets())

    print(hitbtc.fetch_order_book(hitbtc.symbols[0]))
    print(bitmex.fetch_ticker('BTC/USD'))
    print(huobi.fetch_trades('LTC/CNY'))

    print(exmo.fetch_balance())

    # sell one ฿ for market price and receive $ right now
    print(exmo.id, exmo.create_market_sell_order('BTC/USD', 1))

    # limit buy BTC/EUR, you pay €2500 and receive ฿1  when the order is closed
    print(exmo.id, exmo.create_limit_buy_order('BTC/EUR', 1, 2500.00))

    # pass/redefine custom exchange-specific order params: type, amount, price, flags, etc...
    kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})

PHP
~~~

.. code:: php

    include 'ccxt.php';

    $poloniex = new \ccxt\poloniex  ();
    $bittrex  = new \ccxt\bittrex   (array ('verbose' => true));
    $quoine   = new \ccxt\zaif      ();
    $zaif     = new \ccxt\quoine    (array (
        'apiKey' => 'YOUR_PUBLIC_API_KEY',
        'secret' => 'YOUR_SECRET_PRIVATE_KEY',
    ));

    $poloniex_markets = $poloniex->load_markets ();

    var_dump ($poloniex_markets);
    var_dump ($bittrex->load_markets ());
    var_dump ($quoine->load_markets ());

    var_dump ($poloniex->fetch_order_book ($poloniex->symbols[0]));
    var_dump ($bittrex->fetch_trades ('BTC/USD'));
    var_dump ($quoine->fetch_ticker ('ETH/EUR'));
    var_dump ($zaif->fetch_ticker ('BTC/JPY'));

    var_dump ($zaif->fetch_balance ());

    // sell 1 BTC/JPY for market price, you pay ¥ and receive ฿ immediately
    var_dump ($zaif->id, $zaif->create_market_sell_order ('BTC/JPY', 1));

    // buy BTC/JPY, you receive ฿1 for ¥285000 when the order closes
    var_dump ($zaif->id, $zaif->create_limit_buy_order ('BTC/JPY', 1, 285000));

    // set a custom user-defined id to your order
    $hitbtc->create_order ('BTC/USD', 'limit', 'buy', 1, 3000, array ('clientOrderId' => '123'));

Contributing
------------

Please read the `CONTRIBUTING <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md>`__ document before making changes that you would like adopted in the code. Also, read the `Manual <https://github.com/ccxt/ccxt/wiki>`__ for more details.

.. |Build Status| image:: https://travis-ci.org/ccxt/ccxt.svg?branch=master
   :target: https://travis-ci.org/ccxt/ccxt
.. |npm| image:: https://img.shields.io/npm/v/ccxt.svg
   :target: https://npmjs.com/package/ccxt
.. |PyPI| image:: https://img.shields.io/pypi/v/ccxt.svg
   :target: https://pypi.python.org/pypi/ccxt
.. |NPM Downloads| image:: https://img.shields.io/npm/dm/ccxt.svg
   :target: https://www.npmjs.com/package/ccxt
.. |Try ccxt on RunKit| image:: https://badge.runkitcdn.com/ccxt.svg
   :target: https://npm.runkit.com/ccxt
.. |Gitter| image:: https://badges.gitter.im/ccxt-dev/ccxt.svg
   :target: https://gitter.im/ccxt-dev/ccxt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
.. |Supported Exchanges| image:: https://img.shields.io/badge/exchanges-90-blue.svg
   :target: https://github.com/ccxt/ccxt/wiki/Exchange-Markets
.. | _1broker| image:: https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg
.. | _1btcxe| image:: https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg
.. |acx| image:: https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg
.. |allcoin| image:: https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg
.. |anxpro| image:: https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg
.. |binance| image:: https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg
.. |bit2c| image:: https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg
.. |bitbay| image:: https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg
.. |bitcoincoid| image:: https://user-images.githubusercontent.com/1294454/27766138-043c7786-5ecf-11e7-882b-809c14f38b53.jpg
.. |bitfinex| image:: https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg
.. |bitfinex2| image:: https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg
.. |bitflyer| image:: https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg
.. |bithumb| image:: https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg
.. |bitlish| image:: https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg
.. |bitmarket| image:: https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg
.. |bitmex| image:: https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg
.. |bitso| image:: https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg
.. |bitstamp1| image:: https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg
.. |bitstamp| image:: https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg
.. |bittrex| image:: https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg
.. |bl3p| image:: https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg
.. |bleutrade| image:: https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg
.. |btcbox| image:: https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg
.. |btcchina| image:: https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg
.. |btcexchange| image:: https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg
.. |btcmarkets| image:: https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg
.. |btctradeua| image:: https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg
.. |btcturk| image:: https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg
.. |btcx| image:: https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg
.. |bter| image:: https://user-images.githubusercontent.com/1294454/27980479-cfa3188c-6387-11e7-8191-93fc4184ba5c.jpg
.. |bxinth| image:: https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg
.. |ccex| image:: https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg
.. |cex| image:: https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg
.. |chbtc| image:: https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg
.. |chilebit| image:: https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg
.. |coincheck| image:: https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg
.. |coinfloor| image:: https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg
.. |coingi| image:: https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg
.. |coinmarketcap| image:: https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg
.. |coinmate| image:: https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg
.. |coinsecure| image:: https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg
.. |coinspot| image:: https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg
.. |cryptopia| image:: https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg
.. |dsx| image:: https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg
.. |exmo| image:: https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg
.. |flowbtc| image:: https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg
.. |foxbit| image:: https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg
.. |fybse| image:: https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg
.. |fybsg| image:: https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg
.. |gatecoin| image:: https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg
.. |gateio| image:: https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg
.. |gdax| image:: https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg
.. |gemini| image:: https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg
.. |hitbtc| image:: https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg
.. |hitbtc2| image:: https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg
.. |huobi| image:: https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg
.. |huobicny| image:: https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg
.. |huobipro| image:: https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg
.. |independentreserve| image:: https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg
.. |itbit| image:: https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg
.. |jubi| image:: https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg
.. |kraken| image:: https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg
.. |kuna| image:: https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg
.. |lakebtc| image:: https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg
.. |livecoin| image:: https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg
.. |liqui| image:: https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg
.. |luno| image:: https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg
.. |mercado| image:: https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg
.. |mixcoins| image:: https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg
.. |nova| image:: https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg
.. |okcoincny| image:: https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg
.. |okcoinusd| image:: https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg
.. |okex| image:: https://user-images.githubusercontent.com/1294454/29562593-9038a9bc-8742-11e7-91cc-8201f845bfc1.jpg
.. |paymium| image:: https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg
.. |poloniex| image:: https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg
.. |quadrigacx| image:: https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg
.. |qryptos| image:: https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg
.. |quoine| image:: https://user-images.githubusercontent.com/1294454/27766844-9615a4e8-5ee8-11e7-8814-fcd004db8cdd.jpg
.. |southxchange| image:: https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg
.. |surbitcoin| image:: https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg
.. |tidex| image:: https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg
.. |therock| image:: https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg
.. |urdubit| image:: https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg
.. |vaultoro| image:: https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg
.. |vbtc| image:: https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg
.. |virwox| image:: https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg
.. |wex| image:: https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg
.. |xbtce| image:: https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg
.. |yobit| image:: https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg
.. |yunbi| image:: https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg
.. |zaif| image:: https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg

