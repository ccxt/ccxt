CCXT – CryptoCurrency eXchange Trading Library
==============================================

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

The ccxt library is used to connect and trade with cryptocurrency / altcoin exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, webshop integration and related software engineering. It is intented to be used by coders, developers and financial analysts to build trading algorithms on top of it.

Current featurelist:

-  support for many exchange markets, even more upcoming soon
-  fully implemented public and private APIs for all exchanges
-  all currencies, altcoins and symbols, prices, order books, trades, tickers, etc...
-  optional normalised data for cross-market or cross-currency analytics and arbitrage
-  an out-of-the box unified all-in-one API extremely easy to integrate

`ccxt on GitHub <https://github.com/kroitor/ccxt>`__ | Install | Usage | `Manual <https://github.com/kroitor/ccxt/wiki>`__ | Public Offer

Supported Cryptocurrency Exchange Markets
-----------------------------------------

The ccxt library currently supports the following 61 cryptocurrency exchange markets and trading APIs:

+---------------------------+-----+-------------+---+----------------------+------------+
|                           | id  | name        | v | doc                  | countries  |
|                           |     |             | e |                      |            |
|                           |     |             | r |                      |            |
+===========================+=====+=============+===+======================+============+
| |\_1broker|               | \_1 | `1Broker <h | 2 | `API <https://1broke | US         |
|                           | bro | ttps://1bro |   | r.com/?c=en/content/ |            |
|                           | ker | ker.com>`__ |   | api-documentation>`_ |            |
|                           |     |             |   | _                    |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |\_1btcxe|                | \_1 | `1BTCXE <ht | \ | `API <https://1btcxe | Panama     |
|                           | btc | tps://1btcx | * | .com/api-docs.php>`_ |            |
|                           | xe  | e.com>`__   |   | _                    |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |anxpro|                  | anx | `ANXPro <ht | 2 | `API <https://anxpro | Japan,     |
|                           | pro | tps://anxpr |   | .com/pages/api>`__   | Singapore, |
|                           |     | o.com>`__   |   |                      | Hong Kong, |
|                           |     |             |   |                      | New        |
|                           |     |             |   |                      | Zealand    |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bit2c|                   | bit | `Bit2C <htt | \ | `API <https://www.bi | Israel     |
|                           | 2c  | ps://www.bi | * | t2c.co.il/home/api>` |            |
|                           |     | t2c.co.il>` |   | __                   |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitbay|                  | bit | `BitBay <ht | \ | `API <https://bitbay | Poland, EU |
|                           | bay | tps://bitba | * | .net/public-api>`__  |            |
|                           |     | y.net>`__   |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitbays|                 | bit | `BitBays <h | 1 | `API <https://bitbay | China, UK, |
|                           | bay | ttps://bitb |   | s.com/help/api/>`__  | Hong Kong, |
|                           | s   | ays.com>`__ |   |                      | Australia, |
|                           |     |             |   |                      | Canada     |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitcoincoid|             | bit | `Bitcoin.co | \ | `API <https://vip.bi | Indonesia  |
|                           | coi | .id <https: | * | tcoin.co.id/trade_ap |            |
|                           | nco | //www.bitco |   | i>`__                |            |
|                           | id  | in.co.id>`_ |   |                      |            |
|                           |     | _           |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitfinex|                | bit | `Bitfinex < | 1 | `API <https://bitfin | US         |
|                           | fin | https://www |   | ex.readme.io/v1/docs |            |
|                           | ex  | .bitfinex.c |   | >`__                 |            |
|                           |     | om>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitlish|                 | bit | `bitlish <h | 1 | `API <https://bitlis | UK, EU,    |
|                           | lis | ttps://bitl |   | h.com/api>`__        | Russia     |
|                           | h   | ish.com>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitmarket|               | bit | `BitMarket  | \ | `API <https://www.bi | Poland, EU |
|                           | mar | <https://ww | * | tmarket.net/docs.php |            |
|                           | ket | w.bitmarket |   | ?file=api_public.htm |            |
|                           |     | .pl>`__     |   | l>`__                |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitmex|                  | bit | `BitMEX <ht | 1 | `API <https://www.bi | Seychelles |
|                           | mex | tps://www.b |   | tmex.com/app/apiOver |            |
|                           |     | itmex.com>` |   | view>`__             |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitso|                   | bit | `Bitso <htt | 3 | `API <https://bitso. | Mexico     |
|                           | so  | ps://bitso. |   | com/api_info>`__     |            |
|                           |     | com>`__     |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bitstamp|                | bit | `Bitstamp < | 2 | `API <https://www.bi | UK         |
|                           | sta | https://www |   | tstamp.net/api>`__   |            |
|                           | mp  | .bitstamp.n |   |                      |            |
|                           |     | et>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bittrex|                 | bit | `Bittrex <h | 1 | `API <https://bittre | US         |
|                           | tre | ttps://bitt | . | x.com/Home/Api>`__   |            |
|                           | x   | rex.com>`__ | 1 |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |blinktrade|              | bli | `BlinkTrade | 1 | `API <https://blinkt | US,        |
|                           | nkt |  <https://b |   | rade.com/docs>`__    | Venezuela, |
|                           | rad | linktrade.c |   |                      | Vietnam,   |
|                           | e   | om>`__      |   |                      | Brazil,    |
|                           |     |             |   |                      | Pakistan,  |
|                           |     |             |   |                      | Chile      |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btcchina|                | btc | `BTCChina < | 1 | `API <https://www.bt | China      |
|                           | chi | https://www |   | cchina.com/apidocs>` |            |
|                           | na  | .btcchina.c |   | __                   |            |
|                           |     | om>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btce|                    | btc | `BTC-e <htt | 3 | `API <https://btc-e. | Bulgaria,  |
|                           | e   | ps://btc-e. |   | com/api/3/docs>`__   | Russia     |
|                           |     | com>`__     |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btcexchange|             | btc | `BTCExchang | \ | `API <https://github | Philippine |
|                           | exc | e <https:// | * | .com/BTCTrader/broke | s          |
|                           | han | www.btcexch |   | r-api-docs>`__       |            |
|                           | ge  | ange.ph>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btctrader|               | btc | `BTCTrader  | \ | `API <https://github | Turkey,    |
|                           | tra | <https://ww | * | .com/BTCTrader/broke | Greece,    |
|                           | der | w.btctrader |   | r-api-docs>`__       | Philippine |
|                           |     | .com>`__    |   |                      | s          |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btctradeua|              | btc | `BTC Trade  | \ | `API <https://docs.g | Ukraine    |
|                           | tra | UA <https:/ | * | oogle.com/document/d |            |
|                           | deu | /btc-trade. |   | /1ocYA0yMy_RXd561sfG |            |
|                           | a   | com.ua>`__  |   | 3qEPZ80kyll36HUxvCRe |            |
|                           |     |             |   | 5GbhE/edit>`__       |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btcturk|                 | btc | `BTCTurk <h | \ | `API <https://github | Turkey     |
|                           | tur | ttps://www. | * | .com/BTCTrader/broke |            |
|                           | k   | btcturk.com |   | r-api-docs>`__       |            |
|                           |     | >`__        |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |btcx|                    | btc | `BTCX <http | 1 | `API <https://btc-x. | Iceland,   |
|                           | x   | s://btc-x.i |   | is/custom/api-docume | US, EU     |
|                           |     | s>`__       |   | nt.html>`__          |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bter|                    | bte | `Bter <http | 2 | `API <https://bter.c | British    |
|                           | r   | s://bter.co |   | om/api2>`__          | Virgin     |
|                           |     | m>`__       |   |                      | Islands,   |
|                           |     |             |   |                      | China      |
+---------------------------+-----+-------------+---+----------------------+------------+
| |bxinth|                  | bxi | `BX.in.th < | \ | `API <https://bx.in. | Thailand   |
|                           | nth | https://bx. | * | th/info/api>`__      |            |
|                           |     | in.th>`__   |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |ccex|                    | cce | `C-CEX <htt | \ | `API <https://c-cex. | Germany,   |
|                           | x   | ps://c-cex. | * | com/?id=api>`__      | EU         |
|                           |     | com>`__     |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |cex|                     | cex | `CEX.IO <ht | \ | `API <https://cex.io | UK, EU,    |
|                           |     | tps://cex.i | * | /cex-api>`__         | Cyprus,    |
|                           |     | o>`__       |   |                      | Russia     |
+---------------------------+-----+-------------+---+----------------------+------------+
| |chilebit|                | chi | `ChileBit < | 1 | `API <https://blinkt | Chile      |
|                           | leb | https://chi |   | rade.com/docs>`__    |            |
|                           | it  | lebit.net>` |   |                      |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |coincheck|               | coi | `coincheck  | \ | `API <https://coinch | Japan,     |
|                           | nch | <https://co | * | eck.com/documents/ex | Indonesia  |
|                           | eck | incheck.com |   | change/api>`__       |            |
|                           |     | >`__        |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |coinmate|                | coi | `CoinMate < | \ | `API <https://coinma | UK, Czech  |
|                           | nma | https://coi | * | te.io/developers>`__ | Republic   |
|                           | te  | nmate.io>`_ |   |                      |            |
|                           |     | _           |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |coinsecure|              | coi | `Coinsecure | 1 | `API <https://api.co | India      |
|                           | nse |  <https://c |   | insecure.in>`__      |            |
|                           | cur | oinsecure.i |   |                      |            |
|                           | e   | n>`__       |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |dsx|                     | dsx | `DSX <https | \ | `API <https://api.ds | UK         |
|                           |     | ://dsx.uk>` | * | x.uk>`__             |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |exmo|                    | exm | `EXMO <http | 1 | `API <https://exmo.m | Spain,     |
|                           | o   | s://exmo.me |   | e/ru/api_doc>`__     | Russia     |
|                           |     | >`__        |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |foxbit|                  | fox | `FoxBit <ht | 1 | `API <https://blinkt | Brazil     |
|                           | bit | tps://foxbi |   | rade.com/docs>`__    |            |
|                           |     | t.exchange> |   |                      |            |
|                           |     | `__         |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |fybse|                   | fyb | `FYB-SE <ht | \ | `API <http://docs.fy | Sweden     |
|                           | se  | tps://www.f | * | b.apiary.io>`__      |            |
|                           |     | ybse.se>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |fybsg|                   | fyb | `FYB-SG <ht | \ | `API <http://docs.fy | Singapore  |
|                           | sg  | tps://www.f | * | b.apiary.io>`__      |            |
|                           |     | ybsg.com>`_ |   |                      |            |
|                           |     | _           |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |gdax|                    | gda | `GDAX <http | \ | `API <https://docs.g | US         |
|                           | x   | s://www.gda | * | dax.com>`__          |            |
|                           |     | x.com>`__   |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |gemini|                  | gem | `Gemini <ht | 1 | `API <https://docs.g | US         |
|                           | ini | tps://gemin |   | emini.com/rest-api>` |            |
|                           |     | i.com>`__   |   | __                   |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |hitbtc|                  | hit | `HitBTC <ht | 1 | `API <https://hitbtc | Hong Kong  |
|                           | btc | tps://hitbt |   | .com/api>`__         |            |
|                           |     | c.com>`__   |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |huobi|                   | huo | `Huobi <htt | 3 | `API <https://github | China      |
|                           | bi  | ps://www.hu |   | .com/huobiapi/API_Do |            |
|                           |     | obi.com>`__ |   | cs_en/wiki>`__       |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |itbit|                   | itb | `itBit <htt | 1 | `API <https://www.it | US         |
|                           | it  | ps://www.it |   | bit.com/api>`__      |            |
|                           |     | bit.com>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |jubi|                    | jub | `jubi.com < | 1 | `API <https://www.ju | China      |
|                           | i   | https://www |   | bi.com/help/api.html |            |
|                           |     | .jubi.com>` |   | >`__                 |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |kraken|                  | kra | `Kraken <ht | 0 | `API <https://www.kr | US         |
|                           | ken | tps://www.k |   | aken.com/en-us/help/ |            |
|                           |     | raken.com>` |   | api>`__              |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |livecoin|                | liv | `LiveCoin < | \ | `API <https://www.li | US, UK,    |
|                           | eco | https://www | * | vecoin.net/api?lang= | Russia     |
|                           | in  | .livecoin.n |   | en>`__               |            |
|                           |     | et>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |liqui|                   | liq | `Liqui <htt | 3 | `API <https://liqui. | Ukraine    |
|                           | ui  | ps://liqui. |   | io/api>`__           |            |
|                           |     | io>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |luno|                    | lun | `luno <http | 1 | `API <https://npmjs. | UK,        |
|                           | o   | s://www.lun |   | org/package/bitx>`__ | Singapore, |
|                           |     | o.com>`__   |   |                      | South      |
|                           |     |             |   |                      | Africa     |
+---------------------------+-----+-------------+---+----------------------+------------+
| |mercado|                 | mer | `Mercado    | 3 | `API <https://www.me | Brazil     |
|                           | cad | Bitcoin <ht |   | rcadobitcoin.com.br/ |            |
|                           | o   | tps://www.m |   | api-doc>`__          |            |
|                           |     | ercadobitco |   |                      |            |
|                           |     | in.com.br>` |   |                      |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |okcoincny|               | okc | `OKCoin     | 1 | `API <https://www.ok | China      |
|                           | oin | CNY <https: |   | coin.cn/rest_getStar |            |
|                           | cny | //www.okcoi |   | ted.html>`__         |            |
|                           |     | n.cn>`__    |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |okcoinusd|               | okc | `OKCoin     | 1 | `API <https://www.ok | China, US  |
|                           | oin | USD <https: |   | coin.com/rest_getSta |            |
|                           | usd | //www.okcoi |   | rted.html>`__        |            |
|                           |     | n.com>`__   |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |paymium|                 | pay | `Paymium <h | 1 | `API <https://www.pa | France, EU |
|                           | miu | ttps://www. |   | ymium.com/page/devel |            |
|                           | m   | paymium.com |   | opers>`__            |            |
|                           |     | >`__        |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |poloniex|                | pol | `Poloniex < | \ | `API <https://poloni | US         |
|                           | oni | https://pol | * | ex.com/support/api/> |            |
|                           | ex  | oniex.com>` |   | `__                  |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |quadrigacx|              | qua | `QuadrigaCX | 2 | `API <https://www.qu | Canada     |
|                           | dri |  <https://w |   | adrigacx.com/api_inf |            |
|                           | gac | ww.quadriga |   | o>`__                |            |
|                           | x   | cx.com>`__  |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |quoine|                  | quo | `QUOINE <ht | 2 | `API <https://develo | Japan,     |
|                           | ine | tps://www.q |   | pers.quoine.com>`__  | Singapore, |
|                           |     | uoine.com>` |   |                      | Vietnam    |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |southxchange|            | sou | `SouthXchan | \ | `API <https://www.so | Argentina  |
|                           | thx | ge <https:/ | * | uthxchange.com/Home/ |            |
|                           | cha | /www.southx |   | Api>`__              |            |
|                           | nge | change.com> |   |                      |            |
|                           |     | `__         |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |surbitcoin|              | sur | `SurBitcoin | 1 | `API <https://blinkt | Venezuela  |
|                           | bit |  <https://s |   | rade.com/docs>`__    |            |
|                           | coi | urbitcoin.c |   |                      |            |
|                           | n   | om>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |therock|                 | the | `TheRockTra | 1 | `API <https://api.th | Malta      |
|                           | roc | ding <https |   | erocktrading.com/doc |            |
|                           | k   | ://therockt |   | />`__                |            |
|                           |     | rading.com> |   |                      |            |
|                           |     | `__         |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |urdubit|                 | urd | `UrduBit <h | 1 | `API <https://blinkt | Pakistan   |
|                           | ubi | ttps://urdu |   | rade.com/docs>`__    |            |
|                           | t   | bit.com>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |vaultoro|                | vau | `Vaultoro < | 1 | `API <https://api.va | Switzerlan |
|                           | lto | https://www |   | ultoro.com>`__       | d          |
|                           | ro  | .vaultoro.c |   |                      |            |
|                           |     | om>`__      |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |vbtc|                    | vbt | `VBTC <http | 1 | `API <https://blinkt | Vietnam    |
|                           | c   | s://vbtc.ex |   | rade.com/docs>`__    |            |
|                           |     | change>`__  |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |virwox|                  | vir | `VirWoX <ht | \ | `API <https://www.vi | Austria    |
|                           | wox | tps://www.v | * | rwox.com/developers. |            |
|                           |     | irwox.com>` |   | php>`__              |            |
|                           |     | __          |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |yobit|                   | yob | `YoBit <htt | 3 | `API <https://www.yo | Russia     |
|                           | it  | ps://www.yo |   | bit.net/en/api/>`__  |            |
|                           |     | bit.net>`__ |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+
| |zaif|                    | zai | `Zaif <http | 1 | `API <https://corp.z | Japan      |
|                           | f   | s://zaif.jp |   | aif.jp/api-docs>`__  |            |
|                           |     | >`__        |   |                      |            |
+---------------------------+-----+-------------+---+----------------------+------------+

The list above is updated frequently, new crypto markets, altcoin exchanges, bug fixes, API endpoints are introduced and added on regular basis. See the `Manual <https://github.com/kroitor/ccxt/wiki>`__ for details. If you don't find a cryptocurrency exchange market in the list above and/or want another market to be added, post or send us a link to it by opening an issue here on GitHub or via email.

The library is under MIT license, that means its absolutely free for any developer to build commercial and opensource software on top of it, but use it as is at your own risk with no warranties.

Developer team is open for collaboration and available for hiring and outsourcing. If you're interested in integrating this software into an existing project or in developing new opensource and commercial projects we welcome you to read our Public Offer.

Install
-------

This library is shipped as a single-file (all-in-one module) implementation with minimalistic dependencies and requirements.

The main file is:

-  ``ccxt.js`` in JavaScript (`ccxt for Node.js <http://npmjs.com/package/ccxt>`__ and web browsers)
-  ``ccxt/__init__.py`` in Python (works in both Python 2 and 3, `ccxt in PyPI <https://pypi.python.org/pypi/ccxt>`__)
-  ``ccxt.php`` in PHP

The easiest way to install the ccxt library is to use builtin package managers.

You can also clone it directly into your project directory from `ccxt GitHub repository <https://github.com/kroitor/ccxt>`__:

.. code:: shell

    git clone https://github.com/kroitor/ccxt.git

An alternative way of installing this library into your code is to copy a single ``ccxt.*`` file manually into your working directory with language extension appropriate for your environment.

Node.js (npm)
~~~~~~~~~~~~~

`ccxt crypto trading library in npm <http://npmjs.com/package/ccxt>`__

.. code:: shell

    npm install ccxt

Node version of the ccxt library requires ``crypto`` and ``node-fetch``, both of them are installed automatically by npm.

.. code:: javascript

    var ccxt = require ('ccxt')
    console.log (Object.keys (ccxt)) // print all available markets

Python
~~~~~~

`ccxt algotrading library in PyPI <https://pypi.python.org/pypi/ccxt>`__

.. code:: shell

    pip install ccxt

Python version of the ccxt library does not require any additional dependencies and uses builtin modules only.

.. code:: python

    import ccxt
    print (dir (ccxt)) # print a list of all available market classes

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

-  market data
-  instruments/trading pairs
-  price feeds (exchange rates)
-  order books
-  trade history
-  tickers
-  OHLC(V) for charting
-  other public endpoints

For trading with private API you need to obtain API keys from/to exchange markets. It often means registering with exchange markets and creating API keys with your account. Most exchanges require personal info or identification. Some kind of verification may be necessary as well. If you want to trade you need to register yourself, this library will not create accounts or API keys for you. Some exchange APIs expose interface methods for registering an account from within the code itself, but most of exchanges don't. You have to sign up and create API keys with their websites.

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
    market.methodName ()  // camelcase pseudocode
    market.method_name () // underscore pseudocode

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

        let krakenProducts = await kraken.loadProducts ()

        console.log (kraken.id,    krakenProducts)
        console.log (bitfinex.id,  await bitfinex.loadProducts  ())
        console.log (huobi.id,     await huobi.loadProducts ())

        console.log (kraken.id,    await kraken.fetchOrderBook (Object.keys (kraken.products)[0]))
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

    hitbtc_products = hitbtc.load_products ()

    print (hitbtc.id, hitbtc_products)
    print (bitmex.id, bitmex.load_products ())
    print (huobi.id,  huobi.load_products ())

    print (hitbtc.fetch_order_book (hitbtc_products.keys ()[0]))
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

    $poloniex_products = $poloniex->load_products ();

    var_dump ($poloniex_products);
    var_dump ($bittrex->load_products ());
    var_dump ($quoine->load_products ());

    var_dump ($poloniex->fetch_order_book (array_keys ($poloniex_products)[0]));
    var_dump ($bittrex->fetch_trades ('BTC/USD'));
    var_dump ($quoine->fetch_ticker ('ETH/EUR'));
    var_dump ($zaif->fetch_ticker ('BTC/JPY'));

    var_dump ($zaif->fetch_balance ());

    // sell 1 BTC/JPY for market price, you pay ¥ and receive BTC immediately
    var_dump ($zaif->id, $zaif->create_market_sell_order ('BTC/JPY', 1));

    // buy BTC/JPY, you receive 1 BTC for ¥285000 when the order closes
    var_dump ($zaif->id, $zaif->create_limit_buy_order ('BTC/JPY', 1, 285000));

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

+--------------------------+------------------------------+
| Email                    | URL                          |
+==========================+==============================+
| igor.kroitor@gmail.com   | https://github.com/kroitor   |
+--------------------------+------------------------------+
| rocket.mind@gmail.com    | https://github.com/xpl       |
+--------------------------+------------------------------+


