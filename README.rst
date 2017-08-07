CCXT – CryptoCurrency eXchange Trading Library
==============================================

.. image:: https://travis-ci.org/kroitor/ccxt.svg?branch=master
    :target: https://travis-ci.org/kroitor/ccxt
.. image:: https://img.shields.io/npm/v/ccxt.svg
    :target: https://npmjs.com/package/ccxt
.. image:: https://img.shields.io/pypi/v/ccxt.svg
    :target: https://pypi.python.org/pypi/ccxt
.. image:: https://img.shields.io/npm/dm/ccxt.svg
    :target: https://www.npmjs.com/package/ccxt
.. image:: https://img.shields.io/scrutinizer/g/kroitor/ccxt.svg
    :target: https://scrutinizer-ci.com/g/kroitor/ccxt/?branch=master
.. image:: https://badge.runkitcdn.com/ccxt.svg
    :target: https://npm.runkit.com/ccxt
.. image:: https://img.shields.io/badge/exchanges-70-blue.svg
    :target: https://github.com/kroitor/ccxt/wiki/Exchange-Markets

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

The ccxt library is used to connect and trade with cryptocurrency / altcoin exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, webshop integration and related software engineering. It is intented to be used by coders, developers and financial analysts to build trading algorithms on top of it.

Current featurelist:

-  support for many exchange markets, even more upcoming soon
-  fully implemented public and private APIs for all exchanges
-  all currencies, altcoins and symbols, prices, order books, trades, tickers, etc...
-  optional normalised data for cross-exchange or cross-currency analytics and arbitrage
-  an out-of-the box unified all-in-one API extremely easy to integrate

`ccxt on GitHub <https://github.com/kroitor/ccxt>`__ | Install | Usage | `Manual <https://github.com/kroitor/ccxt/wiki>`__ | `Examples <https://github.com/kroitor/ccxt/tree/master/examples>`__ | Contributing | **Public Offer**

Supported Cryptocurrency Exchange Markets
-----------------------------------------

The ccxt library currently supports the following 70 cryptocurrency exchange markets and trading APIs:

+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| id              | name                                                      | ver   | doc                                                                                              | countries                                  |
+=================+===========================================================+=======+==================================================================================================+============================================+
| \_1broker       | `1Broker <https://1broker.com>`__                         | 2     | `API <https://1broker.com/?c=en/content/api-documentation>`__                                    | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| \_1btcxe        | `1BTCXE <https://1btcxe.com>`__                           | \*    | `API <https://1btcxe.com/api-docs.php>`__                                                        | Panama                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| anxpro          | `ANXPro <https://anxpro.com>`__                           | 2     | `API <http://docs.anxv2.apiary.io>`__                                                            | Japan, Singapore, Hong Kong, New Zealand   |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bit2c           | `Bit2C <https://www.bit2c.co.il>`__                       | \*    | `API <https://www.bit2c.co.il/home/api>`__                                                       | Israel                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitbay          | `BitBay <https://bitbay.net>`__                           | \*    | `API <https://bitbay.net/public-api>`__                                                          | Poland, EU                                 |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitbays         | `BitBays <https://bitbays.com>`__                         | 1     | `API <https://bitbays.com/help/api/>`__                                                          | China, UK, Hong Kong, Australia, Canada    |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitcoincoid     | `Bitcoin.co.id <https://www.bitcoin.co.id>`__             | \*    | `API <https://vip.bitcoin.co.id/downloads/BITCOINCOID-API-DOCUMENTATION.pdf>`__                  | Indonesia                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitfinex        | `Bitfinex <https://www.bitfinex.com>`__                   | 1     | `API <https://bitfinex.readme.io/v1/docs>`__                                                     | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitflyer        | `bitFlyer <https://bitflyer.jp>`__                        | 1     | `API <https://bitflyer.jp/API>`__                                                                | Japan                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitlish         | `bitlish <https://bitlish.com>`__                         | 1     | `API <https://bitlish.com/api>`__                                                                | UK, EU, Russia                             |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitmarket       | `BitMarket <https://www.bitmarket.pl>`__                  | \*    | `API <https://www.bitmarket.net/docs.php?file=api_public.html>`__                                | Poland, EU                                 |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitmex          | `BitMEX <https://www.bitmex.com>`__                       | 1     | `API <https://www.bitmex.com/app/apiOverview>`__                                                 | Seychelles                                 |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitso           | `Bitso <https://bitso.com>`__                             | 3     | `API <https://bitso.com/api_info>`__                                                             | Mexico                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bitstamp        | `Bitstamp <https://www.bitstamp.net>`__                   | 2     | `API <https://www.bitstamp.net/api>`__                                                           | UK                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bittrex         | `Bittrex <https://bittrex.com>`__                         | 1.1   | `API <https://bittrex.com/Home/Api>`__                                                           | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bl3p            | `BL3P <https://bl3p.eu>`__                                | 1     | `API <https://github.com/BitonicNL/bl3p-api/tree/master/docs>`__                                 | Netherlands, EU                            |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btcchina        | `BTCChina <https://www.btcchina.com>`__                   | 1     | `API <https://www.btcchina.com/apidocs>`__                                                       | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btce            | `BTC-e <https://btc-e.com>`__                             | 3     | `API <https://btc-e.com/api/3/docs>`__                                                           | Bulgaria, Russia                           |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btcexchange     | `BTCExchange <https://www.btcexchange.ph>`__              | \*    | `API <https://github.com/BTCTrader/broker-api-docs>`__                                           | Philippines                                |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btctradeua      | `BTC Trade UA <https://btc-trade.com.ua>`__               | \*    | `API <https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit>`__   | Ukraine                                    |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btcturk         | `BTCTurk <https://www.btcturk.com>`__                     | \*    | `API <https://github.com/BTCTrader/broker-api-docs>`__                                           | Turkey                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| btcx            | `BTCX <https://btc-x.is>`__                               | 1     | `API <https://btc-x.is/custom/api-document.html>`__                                              | Iceland, US, EU                            |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bter            | `Bter <https://bter.com>`__                               | 2     | `API <https://bter.com/api2>`__                                                                  | British Virgin Islands, China              |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| bxinth          | `BX.in.th <https://bx.in.th>`__                           | \*    | `API <https://bx.in.th/info/api>`__                                                              | Thailand                                   |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| ccex            | `C-CEX <https://c-cex.com>`__                             | \*    | `API <https://c-cex.com/?id=api>`__                                                              | Germany, EU                                |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| cex             | `CEX.IO <https://cex.io>`__                               | \*    | `API <https://cex.io/cex-api>`__                                                                 | UK, EU, Cyprus, Russia                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| chbtc           | `CHBTC <https://trade.chbtc.com/api>`__                   | 1     | `API <https://www.chbtc.com/i/developer>`__                                                      | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| chilebit        | `ChileBit <https://chilebit.net>`__                       | 1     | `API <https://blinktrade.com/docs>`__                                                            | Chile                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coincheck       | `coincheck <https://coincheck.com>`__                     | \*    | `API <https://coincheck.com/documents/exchange/api>`__                                           | Japan, Indonesia                           |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coingi          | `Coingi <https://coingi.com>`__                           | \*    | `API <http://docs.coingi.apiary.io/>`__                                                          | Panama, Bulgaria, China, US                |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coinmarketcap   | `CoinMarketCap <https://coinmarketcap.com>`__             | 1     | `API <https://coinmarketcap.com/api>`__                                                          | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coinmate        | `CoinMate <https://coinmate.io>`__                        | \*    | `API <http://docs.coinmate.apiary.io>`__                                                         | UK, Czech Republic                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coinsecure      | `Coinsecure <https://coinsecure.in>`__                    | 1     | `API <https://api.coinsecure.in>`__                                                              | India                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| coinspot        | `CoinSpot <https://www.coinspot.com.au>`__                | \*    | `API <https://www.coinspot.com.au/api>`__                                                        | Australia                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| dsx             | `DSX <https://dsx.uk>`__                                  | \*    | `API <https://api.dsx.uk>`__                                                                     | UK                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| exmo            | `EXMO <https://exmo.me>`__                                | 1     | `API <https://exmo.me/ru/api_doc>`__                                                             | Spain, Russia                              |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| flowbtc         | `flowBTC <https://trader.flowbtc.com>`__                  | 1     | `API <http://www.flowbtc.com.br/api/>`__                                                         | Brazil                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| foxbit          | `FoxBit <https://foxbit.exchange>`__                      | 1     | `API <https://blinktrade.com/docs>`__                                                            | Brazil                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| fybse           | `FYB-SE <https://www.fybse.se>`__                         | \*    | `API <http://docs.fyb.apiary.io>`__                                                              | Sweden                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| fybsg           | `FYB-SG <https://www.fybsg.com>`__                        | \*    | `API <http://docs.fyb.apiary.io>`__                                                              | Singapore                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| gatecoin        | `Gatecoin <https://gatecoin.com>`__                       | \*    | `API <https://gatecoin.com/api>`__                                                               | Hong Kong                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| gdax            | `GDAX <https://www.gdax.com>`__                           | \*    | `API <https://docs.gdax.com>`__                                                                  | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| gemini          | `Gemini <https://gemini.com>`__                           | 1     | `API <https://docs.gemini.com/rest-api>`__                                                       | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| hitbtc          | `HitBTC <https://hitbtc.com>`__                           | 1     | `API <https://hitbtc.com/api>`__                                                                 | Hong Kong                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| huobi           | `Huobi <https://www.huobi.com>`__                         | 3     | `API <https://github.com/huobiapi/API_Docs_en/wiki>`__                                           | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| itbit           | `itBit <https://www.itbit.com>`__                         | 1     | `API <https://api.itbit.com/docs>`__                                                             | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| jubi            | `jubi.com <https://www.jubi.com>`__                       | 1     | `API <https://www.jubi.com/help/api.html>`__                                                     | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| kraken          | `Kraken <https://www.kraken.com>`__                       | 0     | `API <https://www.kraken.com/en-us/help/api>`__                                                  | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| lakebtc         | `LakeBTC <https://www.lakebtc.com>`__                     | 2     | `API <https://www.lakebtc.com/s/api>`__                                                          | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| livecoin        | `LiveCoin <https://www.livecoin.net>`__                   | \*    | `API <https://www.livecoin.net/api?lang=en>`__                                                   | US, UK, Russia                             |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| liqui           | `Liqui <https://liqui.io>`__                              | 3     | `API <https://liqui.io/api>`__                                                                   | Ukraine                                    |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| luno            | `luno <https://www.luno.com>`__                           | 1     | `API <https://www.luno.com/en/api>`__                                                            | UK, Singapore, South Africa                |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| mercado         | `Mercado Bitcoin <https://www.mercadobitcoin.com.br>`__   | 3     | `API <https://www.mercadobitcoin.com.br/api-doc>`__                                              | Brazil                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| okcoincny       | `OKCoin CNY <https://www.okcoin.cn>`__                    | 1     | `API <https://www.okcoin.cn/rest_getStarted.html>`__                                             | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| okcoinusd       | `OKCoin USD <https://www.okcoin.com>`__                   | 1     | `API <https://www.okcoin.com/rest_getStarted.html>`__                                            | China, US                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| paymium         | `Paymium <https://www.paymium.com>`__                     | 1     | `API <https://github.com/Paymium/api-documentation>`__                                           | France, EU                                 |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| poloniex        | `Poloniex <https://poloniex.com>`__                       | \*    | `API <https://poloniex.com/support/api/>`__                                                      | US                                         |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| quadrigacx      | `QuadrigaCX <https://www.quadrigacx.com>`__               | 2     | `API <https://www.quadrigacx.com/api_info>`__                                                    | Canada                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| quoine          | `QUOINE <https://www.quoine.com>`__                       | 2     | `API <https://developers.quoine.com>`__                                                          | Japan, Singapore, Vietnam                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| southxchange    | `SouthXchange <https://www.southxchange.com>`__           | \*    | `API <https://www.southxchange.com/Home/Api>`__                                                  | Argentina                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| surbitcoin      | `SurBitcoin <https://surbitcoin.com>`__                   | 1     | `API <https://blinktrade.com/docs>`__                                                            | Venezuela                                  |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| therock         | `TheRockTrading <https://therocktrading.com>`__           | 1     | `API <https://api.therocktrading.com/doc/v1/index.html>`__                                       | Malta                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| urdubit         | `UrduBit <https://urdubit.com>`__                         | 1     | `API <https://blinktrade.com/docs>`__                                                            | Pakistan                                   |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| vaultoro        | `Vaultoro <https://www.vaultoro.com>`__                   | 1     | `API <https://api.vaultoro.com>`__                                                               | Switzerland                                |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| vbtc            | `VBTC <https://vbtc.exchange>`__                          | 1     | `API <https://blinktrade.com/docs>`__                                                            | Vietnam                                    |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| virwox          | `VirWoX <https://www.virwox.com>`__                       | \*    | `API <https://www.virwox.com/developers.php>`__                                                  | Austria                                    |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| xbtce           | `xBTCe <https://www.xbtce.com>`__                         | 1     | `API <https://www.xbtce.com/tradeapi>`__                                                         | Russia                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| yobit           | `YoBit <https://www.yobit.net>`__                         | 3     | `API <https://www.yobit.net/en/api/>`__                                                          | Russia                                     |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| yunbi           | `YUNBI <https://yunbi.com>`__                             | 2     | `API <https://yunbi.com/documents/api/guide>`__                                                  | China                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+
| zaif            | `Zaif <https://zaif.jp>`__                                | 1     | `API <http://techbureau-api-document.readthedocs.io/ja/latest/index.html>`__                     | Japan                                      |
+-----------------+-----------------------------------------------------------+-------+--------------------------------------------------------------------------------------------------+--------------------------------------------+

The list above is updated frequently, new crypto markets, altcoin exchanges, bug fixes, API endpoints are introduced and added on regular basis. See the `Manual <https://github.com/kroitor/ccxt/wiki>`__ for details. If you don't find a cryptocurrency exchange market in the list above and/or want another exchange to be added, post or send us a link to it by opening an issue here on GitHub or via email.

The library is under MIT license, that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

Developer team is open to collaboration and available for hiring and outsourcing. If you're interested in integrating this software into an existing project or in developing new opensource and commercial projects we welcome you to read our Public Offer.

Install
-------

This library is shipped as a single-file (all-in-one module) implementation with minimalistic dependencies and requirements.

The main file is:

-  ``ccxt.js`` in JavaScript (`ccxt for Node.js <http://npmjs.com/package/ccxt>`__ and web browsers)
-  ``ccxt/__init__.py`` in Python (works in both Python 2 and 3, `ccxt in PyPI <https://pypi.python.org/pypi/ccxt>`__)
-  ``ccxt.php`` in PHP

The easiest way to install the ccxt library is to use builtin package managers.

You can also clone it into your project directory from `ccxt GitHub repository <https://github.com/kroitor/ccxt>`__:

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

An alternative way of installing this library into your code is to copy a single ``ccxt.*`` file manually into your working directory with language extension appropriate for your environment.

Node.js (npm)
~~~~~~~~~~~~~

`ccxt crypto trading library in npm <http://npmjs.com/package/ccxt>`__

.. code:: shell

    npm install ccxt

Node version of the ccxt library requires `crypto-js <https://www.npmjs.com/package/crypto-js>`__ and `node-fetch <https://www.npmjs.com/package/node-fetch>`__, both of them are installed automatically by npm.

.. code:: javascript

    var ccxt = require ('ccxt')
    console.log (ccxt.exchanges) // print all available exchanges

Python
~~~~~~

`ccxt algotrading library in PyPI <https://pypi.python.org/pypi/ccxt>`__

.. code:: shell

    pip install ccxt

Python version of the ccxt library does not require any additional dependencies and uses builtin modules only.

.. code:: python

    import ccxt
    print (ccxt.exchanges) # print a list of all available exchange classes

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
    var_dump (\cxxt\Exchange::$exchanges); // print a list of all available exchange classes

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
        // print all available exchanges
        document.addEventListener ('DOMContentLoaded', () => console.log (ccxt))
    </script>

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

See the `Manual <https://github.com/kroitor/ccxt/wiki>`__ for more details.

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

        // buy 1 BTC/USD for $2500, you pay $2500 and receive 1 BTC when the order is closed
        console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

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

    hitbtc_markets = hitbtc.load_markets ()

    print (hitbtc.id, hitbtc_markets)
    print (bitmex.id, bitmex.load_markets ())
    print (huobi.id,  huobi.load_markets ())

    print (hitbtc.fetch_order_book (hitbtc.symbols[0]))
    print (bitmex.fetch_ticker ('BTC/USD'))
    print (huobi.fetch_trades ('LTC/CNY'))

    print (exmo.fetch_balance ())

    # sell one BTC/USD for market price and receive $ right now
    print (exmo.id, exmo.create_market_sell_order ('BTC/USD', 1))

    # limit buy BTC/EUR, you pay €2500 and receive 1 BTC when the order is closed
    print (exmo.id, exmo.create_limit_buy_order ('BTC/EUR', 1, 2500.00))

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

    // sell 1 BTC/JPY for market price, you pay ¥ and receive BTC immediately
    var_dump ($zaif->id, $zaif->create_market_sell_order ('BTC/JPY', 1));

    // buy BTC/JPY, you receive 1 BTC for ¥285000 when the order closes
    var_dump ($zaif->id, $zaif->create_limit_buy_order ('BTC/JPY', 1, 285000));

Contributing
------------

Please read the `CONTRIBUTING <https://github.com/kroitor/ccxt/blob/master/CONTRIBUTING.md>`__ document before making changes that you would like adopted in the code.

Public Offer
------------

Developer team is open to collaboration and available for hiring and outsourcing.

We can:

-  implement a cryptocurrency trading strategy for you
-  integrate APIs for any exchange markets you want
-  create bots for algorithmic trading, arbitrage, scalping and HFT
-  perform backtesting and data crunching
-  implement any kind of protocol including REST, WebSockets, FIX, proprietary and legacy standards...
-  actually directly integrate btc/altcoin blockchain or transaction graph into your system
-  program a matching engine for your own bitcoin/altcoin exchange
-  create a trading terminal for desktops, phones and pads (for web and native OSes)
-  do all of the above in any of the following languages/environments: Javascript, Node.js, PHP, C, C++, C#, Python, Java, ObjectiveC, Linux, FreeBSD, MacOS, iOS, Windows

We implement bots, algorithmic trading software and strategies by your design. Costs for implementing a basic trading strategy are low (starting from a few coins) and depend on your requirements.

We are coders, not investors, so we ABSOLUTELY DO NOT do any kind of financial or trading advisory neither we invent profitable strategies to make you a fortune out of thin air. We guarantee the stability of the bot or trading software, but we cannot guarantee the profitability of your strategy nor can we protect you from natural financial risks and economic losses. Exact rules for the trading strategy is up to the trader/investor himself. We charge a fix flat price in cryptocurrency for our programming services and for implementing your requirements in software.

Please, contact us on GitHub or by email if you're interested in integrating this software into an existing project or in developing new opensource and commercial projects. Questions are welcome. Also, if want to make your own algorithmic cryptocurrency trading bot or you want us to make a bot for you, here's our `checklist for success <https://github.com/kroitor/ccxt/wiki/Checklist>`__.

Contact Us
----------

+--------------------------+------------------------------+
| Email                    | URL                          |
+==========================+==============================+
| igor.kroitor@gmail.com   | https://github.com/kroitor   |
+--------------------------+------------------------------+
| rocket.mind@gmail.com    | https://github.com/xpl       |
+--------------------------+------------------------------+

