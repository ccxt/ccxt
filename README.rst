CCXT – CryptoCurrency eXchange Trading Library
==============================================

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

The ccxt library is used to connect and trade with cryptocurrency / altcoin exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, trading strategy backtesting, bot programming, webshop integration and related software engineering. It is intented to be used by coders, developers and financial analysts to build trading algorithms on top of it.

Current featurelist:
- support for many exchange markets, even more upcoming soon
- fully implemented public and private APIs for all exchanges
- all currencies, altcoins and symbols, prices, order books, trades, tickers, etc...
- optional normalised data for cross-market or cross-currency analytics and arbitrage
- an out-of-the box unified all-in-one API extremely easy to integrate

`Install <#install>`__ \| `Usage <#usage>`__ \| `Manual <https://github.com/kroitor/ccxt/wiki>`__ \| `Public Offer <#public-offer>`__

Supported Cryptocurrency Exchange Markets
-----------------------------------------

+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| id            | name                                              | docs                                                                | countries                     |
+===============+===================================================+=====================================================================+===============================+
| \_1broker     | `1Broker <https://1broker.com>`__                 | `API <https://1broker.com/?c=en/content/api-documentation>`__       | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| \_1btcxe      | `1BTCXE <https://1btcxe.com>`__                   | `API <https://1btcxe.com/api-docs.php>`__                           | Panama                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bit2c         | `Bit2C <https://www.bit2c.co.il>`__               | `API <https://www.bit2c.co.il/home/api>`__                          | Israel                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitbay        | `BitBay <https://bitbay.net>`__                   | `API <https://bitbay.net/public-api>`__                             | Poland, EU                    |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitcoincoid   | `Bitcoin.co.id <https://www.bitcoin.co.id>`__     | `API <https://vip.bitcoin.co.id/trade_api>`__                       | Indonesia                     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitfinex      | `Bitfinex <https://www.bitfinex.com>`__           | `API <https://bitfinex.readme.io/v1/docs>`__                        | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitlish       | `bitlish <https://bitlish.com>`__                 | `API <https://bitlish.com/api>`__                                   | UK, EU, Russia                |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitmarket     | `BitMarket <https://www.bitmarket.pl>`__          | `API <https://www.bitmarket.net/docs.php?file=api_public.html>`__   | Poland, EU                    |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitmex        | `BitMEX <https://www.bitmex.com>`__               | `API <https://www.bitmex.com/app/apiOverview>`__                    | Seychelles                    |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bitso         | `Bitso <https://bitso.com>`__                     | `API <https://bitso.com/api_info>`__                                | Mexico                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bittrex       | `Bittrex <https://bittrex.com>`__                 | `API <https://bittrex.com/Home/Api>`__                              | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| btcchina      | `BTCChina <https://www.btcchina.com>`__           | `API <https://www.btcchina.com/apidocs>`__                          | China, US                     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| btcx          | `BTCX <https://btc-x.is>`__                       | `API <https://btc-x.is/custom/api-document.html>`__                 | Iceland, US, EU               |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| bxinth        | `BX.in.th <https://bx.in.th>`__                   | `API <https://bx.in.th/info/api>`__                                 | Thailand                      |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| ccex          | `C-CEX <https://c-cex.com>`__                     | `API <https://c-cex.com/?id=api>`__                                 | Germany, EU                   |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| cex           | `CEX.IO <https://cex.io>`__                       | `API <https://cex.io/cex-api>`__                                    | UK, EU, Cyprus, Russia        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| coincheck     | `coincheck <https://coincheck.com>`__             | `API <https://coincheck.com/documents/exchange/api>`__              | Japan, Indonesia              |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| coinsecure    | `Coinsecure <https://coinsecure.in>`__            | `API <https://api.coinsecure.in>`__                                 | India                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| exmo          | `EXMO <https://exmo.me>`__                        | `API <https://exmo.me/ru/api_doc>`__                                | Spain, Russia                 |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| fybse         | `FYB-SE <https://www.fybse.se>`__                 | `API <http://docs.fyb.apiary.io>`__                                 | Sweden                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| fybsg         | `FYB-SG <https://www.fybsg.com>`__                | `API <http://docs.fyb.apiary.io>`__                                 | Singapore                     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| gdax          | `GDAX <https://www.gdax.com>`__                   | `API <https://docs.gdax.com>`__                                     | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| hitbtc        | `HitBTC <https://hitbtc.com>`__                   | `API <https://hitbtc.com/api>`__                                    | Hong Kong                     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| huobi         | `Huobi <https://www.huobi.com>`__                 | `API <https://github.com/huobiapi/API_Docs_en/wiki>`__              | China                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| jubi          | `jubi.com <https://www.jubi.com>`__               | `API <https://www.jubi.com/help/api.html>`__                        | China                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| kraken        | `Kraken <https://www.kraken.com>`__               | `API <https://www.kraken.com/en-us/help/api>`__                     | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| luno          | `luno <https://www.luno.com>`__                   | `API <https://npmjs.org/package/bitx>`__                            | UK, Singapore, South Africa   |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| okcoinusd     | `OKCoin USD <https://www.okcoin.com>`__           | `API <https://www.okcoin.com/rest_getStarted.html>`__               | China, US                     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| okcoincny     | `OKCoin CNY <https://www.okcoin.cn>`__            | `API <https://www.okcoin.cn/rest_getStarted.html>`__                | China                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| poloniex      | `Poloniex <https://poloniex.com>`__               | `API <https://poloniex.com/support/api/>`__                         | US                            |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| quadrigacx    | `QuadrigaCX <https://www.quadrigacx.com>`__       | `API <https://www.quadrigacx.com/api_info>`__                       | Canada                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| quoine        | `QUOINE <https://www.quoine.com>`__               | `API <https://developers.quoine.com>`__                             | Japan, Singapore, Vietnam     |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| therock       | `TheRockTrading <https://therocktrading.com>`__   | `API <https://api.therocktrading.com/doc/>`__                       | Malta                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| vaultoro      | `Vaultoro <https://www.vaultoro.com>`__           | `API <https://api.vaultoro.com>`__                                  | Switzerland                   |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| virwox        | `VirWoX <https://www.virwox.com>`__               | `API <https://www.virwox.com/developers.php>`__                     | Austria                       |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| yobit         | `YoBit <https://www.yobit.net>`__                 | `API <https://www.yobit.net/en/api/>`__                             | Russia                        |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+
| zaif          | `Zaif <https://zaif.jp>`__                        | `API <https://corp.zaif.jp/api-docs>`__                             | Japan                         |
+---------------+---------------------------------------------------+---------------------------------------------------------------------+-------------------------------+

The list above is updated frequently, new crypto markets, altcoin exchanges, bug fixes, API endpoints are introduced and added on regular basis. If you don't find a cryptocurrency exchange market in the list above and/or want another market to be added, post or send us a link to it by opening an issue here on GitHub or via email.

The library is under MIT license, that means its absolutely free for any developer to build commercial and opensource software on top of it, but use it as is at your own risk with no warranties.

Developer team is open for collaboration and available for hiring and outsourcing. If you're interested in integrating this software into an existing project or in developing new opensource and commercial projects we welcome you to read our `Public Offer <#public-offer>`__.

.. raw:: html

   <!-- 

   - A full list of all cryptocurrency exchange markets sorted by name alphabetically
   - A list of cryptocurrency exchange markets by countries, regions and territories
   - A list of cryptocurrency exchange markets by traded instruments, pairs, currencies, symbols, commodities, assets, stocks, indices and products

   -------------------------------------------------------------------------------

   - A list of fully supported cryptocurrency exchange markets sorted by name alphabetically
   - A list of cryptocurrency exchange markets scheduled for support in nearest future
   - A list of cryptocurrency exchange markets by countries, regions and territories
   - A list of cryptocurrency exchange markets by traded pairs, currencies, symbols, commodities, assets, stocks, indices and products
   - A list of cryptocurrency exchange markets by full or partial API support status
   - A list of unsupported and closed cryptocurrency exchanges

    -->

Install
-------

This library is shipped as a single-file (all-in-one module) implementation with minimalistic dependencies and requirements.

The main file is:
- ``ccxt.js`` in JavaScript (`ccxt for Node.js <http://npmjs.com/package/ccxt>`__ and web browsers)
- ``ccxt/__init__.py`` in Python (works in both Python 2 and 3)
- ``ccxt.php`` in PHP

The easiest way to install the ccxt library is to use builtin package managers.

You can also clone it directly into your project directory from `ccxt GitHub repository <https://github.com/kroitor/ccxt>`__:

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

An alternative way of installing this library into your code is to copy a single ``ccxt.*`` file manually into your working directory with language extension appropriate for your environment.

Node.js (npm)
~~~~~~~~~~~~~

.. code:: shell

    npm install ccxt

Node version of the ccxt library requires ``crypto`` and ``node-fetch``, both of them are installed automatically by npm.

.. code:: javascript

    var ccxt = require ('ccxt')
    console.log (Object.keys (ccxt)) // print all available markets

Python
~~~~~~

.. code:: shell

    pip install ccxt

Python version of the ccxt library does not require any additional dependencies and uses builtin modules only.

.. code:: python

    import ccxt
    print dir (ccxt) # print a list of all available market classes

PHP
~~~

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

The ccxt library in PHP requires common PHP modules:
- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv

.. code:: php

    include "ccxt.php";
    $market = new \cxxt\$id (); // $id is a string literal id of your desired exchange market

Web Browsers
~~~~~~~~~~~~

The ccxt library can also be used in web browser client-side JavaScript for various purposes.

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

The client-side JavaScript version also requires CryptoJS. Download and unpack `CryptoJS <https://code.google.com/archive/p/crypto-js/>`__ into your working directory or clone `CryptoJS from GitHub <https://github.com/sytelus/CryptoJS>`__.

.. code:: shell

    git clone https://github.com/sytelus/CryptoJS

Finally, add links to CryptoJS components and ccxt to your HTML page code:

.. code:: html

    <script src="crypto-js/rollups/sha256.js"></script>
    <script src="crypto-js/rollups/hmac-sha256.js"></script>
    <script src="crypto-js/rollups/hmac-sha512.js"></script>
    <script src="crypto-js/components/enc-base64-min.js"></script>
    <script src="crypto-js/components/enc-utf16-min.js"></script>

    <script type="text/javascript" src="ccxt.js"></script>
    <script type="text/javascript">
        // print all available markets
        document.addEventListener ('DOMContentLoaded', () => console.log (ccxt))
    </script>

Usage
-----

Intro
~~~~~

The ccxt library consists of a public part and a private part. Anyone can use the public part out-of-the-box immediately after installation. Public APIs open access to public information from all exchange markets without registering user accounts and without having API keys.

Public APIs include the following:
- market data
- instruments/trading pairs
- price feeds (exchange rates)
- order books
- trade history
- tickers
- OHLC(V) for charting
- other public endpoints

For trading with private API you need to obtain API keys from/to exchange markets. It often means registering with exchange markets and creating API keys with your account. Most exchanges require personal info or identification. Some kind of verification may be necessary as well. If you want to trade you need to register yourself, this library will not create accounts or API keys for you. Some exchange APIs expose interface methods for registering an account from within the code itself, but most of exchanges don't. You have to sign up and create API keys with their websites.

Private APIs allow the following:
- manage personal account info
- query account balances
- trade by making market and limit orders
- deposit and withdraw fiat and crypto funds
- query personal orders
- get ledger history
- transfer funds between accounts
- use merchant services

This library implements full public and private REST APIs for all exchanges. WebSocket and FIX implementations in JavaScript, PHP, Python and other languages coming soon.

The ccxt library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

::

    // both of these notations work in JavaScript/Python/PHP
    market.methodName ()  // camelcase pseudocode
    market.method_name () // underscore pseudocode

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

        let krakenProducts = await kraken.loadProducts ()

        console.log (kraken.id,    krakenProducts)
        console.log (bitfinex.id,  await bitfinex.loadProducts  ())
        console.log (huobi.id,     await huobi.loadProducts ())

        console.log (kraken.id,    await kraken.fetchOrderBook (Object.keys (kraken.products)[0]))
        console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
        console.log (huobi.id,     await huobi.fetchTrades ('ETH/CNY'))

        console.log (okcoinusd.id, await okcoinusd.fetchBalance ())

        // sell 1 BTC/USD for market price (create market sell order)
        console.log (okcoinusd.id, await okcoinusd.sell ('BTC/USD', 1))

        // buy 1 BTC/USD for $2500 (create limit buy order) 
        console.log (okcoinusd.id, await okcoinusd.buy ('BTC/USD', 1, 2500.00))

    }) ()

Python
~~~~~~

.. code:: python

    # coding=utf-8

    import ccxt

    hitbtc = ccxt.hitbtc ({ 'verbose': True })
    bitmex = ccxt.bitmex ()
    huobi  = ccxt.huobi ()
    exmo   = ccxt.exmo ({
        'apiKey': 'YOUR_PUBLIC_API_KEY',
        'secret': 'YOUR_SECRET_PRIVATE_KEY',
    })

    hitbtc_products = hitbtc.load_products ()

    print (hitbtc.id, hitbtc_products)
    print (bitmex.id, bitmex.load_products ())
    print (huobi.id,  huobi.load_products ())

    print (hitbtc.fetch_order_book (hitbtc_products.keys ()[0]))
    print (bitmex.fetch_ticker ('BTC/USD'))
    print (huobi.fetch_trades ('LTC/CNY'))

    print (exmo.fetch_balance ())

PHP
~~~

.. code:: php

    include 'ccxt.php';

    $poloniex = new \ccxt\poloniex  ();
    $bittrex  = new \ccxt\bittrex   (array ('verbose' => true));
    $zaif     = new \ccxt\zaif      ();
    $quoine   = new \ccxt\quoine    (array (
        'apiKey' => 'YOUR_PUBLIC_API_KEY',
        'secret' => 'YOUR_SECRET_PRIVATE_KEY',
    ));

    $poloniex_products = $poloniex->load_products ();

    var_dump ($poloniex_products);
    var_dump ($bittrex->load_products ());
    var_dump ($quoine->load_products ());

    var_dump ($poloniex->fetch_order_book (array_keys ($poloniex_products)[0]));
    var_dump ($bittrex->fetch_trades ('BTC/USD'));
    var_dump ($zaif->fetch_ticker ('BTC/JPY'));

    var_dump ($quoine->fetch_balance ());

Public Offer
------------

Developer team is open for collaboration and available for hiring and outsourcing.

We can:

-  implement a cryptocurrency trading strategy for you
-  integrate APIs for any exchange markets you want
-  create bots for algorithmic trading, arbitrage, scalping and HFT
-  perform backtesting and data crunching
-  implement any kind of protocol including REST, WebSockets, FIX, proprietary and legacy standards...
-  actually directly integrate btc/altcoin blockchain or transaction graph into your system
-  program a matching engine for you
-  create a trading terminal for desktops, phones and pads (for web and native OSes)
-  do all of the above in any of the following languages/environments: Javascript, Node.js, PHP, C, C++, C#, Python, Java, ObjectiveC, Linux, FreeBSD, MacOS, iOS, Windows

We implement bots, algorithmic trading software and strategies by your design. Costs for implementing a basic trading strategy are low (starting from a few coins) and depend on your requirements.

We are coders, not investors, so we ABSOLUTELY DO NOT do any kind of financial or trading advisory neither we invent profitable strategies to make you a fortune out of thin air. We guarantee the stability of the bot or trading software, but we cannot guarantee the profitability of your strategy nor can we protect you from natural financial risks and economic losses. Exact rules for the trading strategy is up to the trader/investor himself. We charge a fix flat price in cryptocurrency for our programming services and for implementing your requirements in software.

Please, contact us on GitHub or via email if you're interested in integrating this software into an existing project or in developing new opensource and commercial projects.

Contact Us
----------

Igor Kroitor
igor.kroitor@gmail.com
https://github.com/kroitor

Vitaly Gordon
rocket.mind@gmail.com
https://github.com/xpl
