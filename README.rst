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

The ccxt library currently supports the following 62 cryptocurrency exchange markets and trading APIs:

+---------------------------+-----+-------------+---+---------------------+------------+
|                           | id  | name        | v | doc                 | countries  |
|                           |     |             | e |                     |            |
|                           |     |             | r |                     |            |
+===========================+=====+=============+===+=====================+============+
| |\_1broker|               | \_1 | `1Broker <h | 2 | `API <https://1brok | US         |
|                           | bro | ttps://1bro |   | er.com/?c=en/conten |            |
|                           | ker | ker.com>`__ |   | t/api-documentation |            |
|                           |     |             |   | >`__                |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |\_1btcxe|                | \_1 | `1BTCXE <ht | \ | `API <https://1btcx | Panama     |
|                           | btc | tps://1btcx | * | e.com/api-docs.php> |            |
|                           | xe  | e.com>`__   |   | `__                 |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |anxpro|                  | anx | `ANXPro <ht | 2 | `API <https://anxpr | Japan,     |
|                           | pro | tps://anxpr |   | o.com/pages/api>`__ | Singapore, |
|                           |     | o.com>`__   |   |                     | Hong Kong, |
|                           |     |             |   |                     | New        |
|                           |     |             |   |                     | Zealand    |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bit2c|                   | bit | `Bit2C <htt | \ | `API <https://www.b | Israel     |
|                           | 2c  | ps://www.bi | * | it2c.co.il/home/api |            |
|                           |     | t2c.co.il>` |   | >`__                |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitbay|                  | bit | `BitBay <ht | \ | `API <https://bitba | Poland, EU |
|                           | bay | tps://bitba | * | y.net/public-api>`_ |            |
|                           |     | y.net>`__   |   | _                   |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitbays|                 | bit | `BitBays <h | 1 | `API <https://bitba | China, UK, |
|                           | bay | ttps://bitb |   | ys.com/help/api/>`_ | Hong Kong, |
|                           | s   | ays.com>`__ |   | _                   | Australia, |
|                           |     |             |   |                     | Canada     |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitcoincoid|             | bit | `Bitcoin.co | \ | `API <https://vip.b | Indonesia  |
|                           | coi | .id <https: | * | itcoin.co.id/trade_ |            |
|                           | nco | //www.bitco |   | api>`__             |            |
|                           | id  | in.co.id>`_ |   |                     |            |
|                           |     | _           |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitfinex|                | bit | `Bitfinex < | 1 | `API <https://bitfi | US         |
|                           | fin | https://www |   | nex.readme.io/v1/do |            |
|                           | ex  | .bitfinex.c |   | cs>`__              |            |
|                           |     | om>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitlish|                 | bit | `bitlish <h | 1 | `API <https://bitli | UK, EU,    |
|                           | lis | ttps://bitl |   | sh.com/api>`__      | Russia     |
|                           | h   | ish.com>`__ |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitmarket|               | bit | `BitMarket  | \ | `API <https://www.b | Poland, EU |
|                           | mar | <https://ww | * | itmarket.net/docs.p |            |
|                           | ket | w.bitmarket |   | hp?file=api_public. |            |
|                           |     | .pl>`__     |   | html>`__            |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitmex|                  | bit | `BitMEX <ht | 1 | `API <https://www.b | Seychelles |
|                           | mex | tps://www.b |   | itmex.com/app/apiOv |            |
|                           |     | itmex.com>` |   | erview>`__          |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitso|                   | bit | `Bitso <htt | 3 | `API <https://bitso | Mexico     |
|                           | so  | ps://bitso. |   | .com/api_info>`__   |            |
|                           |     | com>`__     |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bitstamp|                | bit | `Bitstamp < | 2 | `API <https://www.b | UK         |
|                           | sta | https://www |   | itstamp.net/api>`__ |            |
|                           | mp  | .bitstamp.n |   |                     |            |
|                           |     | et>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bittrex|                 | bit | `Bittrex <h | 1 | `API <https://bittr | US         |
|                           | tre | ttps://bitt | . | ex.com/Home/Api>`__ |            |
|                           | x   | rex.com>`__ | 1 |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |blinktrade|              | bli | `BlinkTrade | 1 | `API <https://blink | US,        |
|                           | nkt |  <https://b |   | trade.com/docs>`__  | Venezuela, |
|                           | rad | linktrade.c |   |                     | Vietnam,   |
|                           | e   | om>`__      |   |                     | Brazil,    |
|                           |     |             |   |                     | Pakistan,  |
|                           |     |             |   |                     | Chile      |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btcchina|                | btc | `BTCChina < | 1 | `API <https://www.b | China      |
|                           | chi | https://www |   | tcchina.com/apidocs |            |
|                           | na  | .btcchina.c |   | >`__                |            |
|                           |     | om>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btce|                    | btc | `BTC-e <htt | 3 | `API <https://btc-e | Bulgaria,  |
|                           | e   | ps://btc-e. |   | .com/api/3/docs>`__ | Russia     |
|                           |     | com>`__     |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btcexchange|             | btc | `BTCExchang | \ | `API <https://githu | Philippine |
|                           | exc | e <https:// | * | b.com/BTCTrader/bro | s          |
|                           | han | www.btcexch |   | ker-api-docs>`__    |            |
|                           | ge  | ange.ph>`__ |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btctrader|               | btc | `BTCTrader  | \ | `API <https://githu | Turkey,    |
|                           | tra | <https://ww | * | b.com/BTCTrader/bro | Greece,    |
|                           | der | w.btctrader |   | ker-api-docs>`__    | Philippine |
|                           |     | .com>`__    |   |                     | s          |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btctradeua|              | btc | `BTC Trade  | \ | `API <https://docs. | Ukraine    |
|                           | tra | UA <https:/ | * | google.com/document |            |
|                           | deu | /btc-trade. |   | /d/1ocYA0yMy_RXd561 |            |
|                           | a   | com.ua>`__  |   | sfG3qEPZ80kyll36HUx |            |
|                           |     |             |   | vCRe5GbhE/edit>`__  |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btcturk|                 | btc | `BTCTurk <h | \ | `API <https://githu | Turkey     |
|                           | tur | ttps://www. | * | b.com/BTCTrader/bro |            |
|                           | k   | btcturk.com |   | ker-api-docs>`__    |            |
|                           |     | >`__        |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |btcx|                    | btc | `BTCX <http | 1 | `API <https://btc-x | Iceland,   |
|                           | x   | s://btc-x.i |   | .is/custom/api-docu | US, EU     |
|                           |     | s>`__       |   | ment.html>`__       |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bter|                    | bte | `Bter <http | 2 | `API <https://bter. | British    |
|                           | r   | s://bter.co |   | com/api2>`__        | Virgin     |
|                           |     | m>`__       |   |                     | Islands,   |
|                           |     |             |   |                     | China      |
+---------------------------+-----+-------------+---+---------------------+------------+
| |bxinth|                  | bxi | `BX.in.th < | \ | `API <https://bx.in | Thailand   |
|                           | nth | https://bx. | * | .th/info/api>`__    |            |
|                           |     | in.th>`__   |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |ccex|                    | cce | `C-CEX <htt | \ | `API <https://c-cex | Germany,   |
|                           | x   | ps://c-cex. | * | .com/?id=api>`__    | EU         |
|                           |     | com>`__     |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |cex|                     | cex | `CEX.IO <ht | \ | `API <https://cex.i | UK, EU,    |
|                           |     | tps://cex.i | * | o/cex-api>`__       | Cyprus,    |
|                           |     | o>`__       |   |                     | Russia     |
+---------------------------+-----+-------------+---+---------------------+------------+
| |chilebit|                | chi | `ChileBit < | 1 | `API <https://blink | Chile      |
|                           | leb | https://chi |   | trade.com/docs>`__  |            |
|                           | it  | lebit.net>` |   |                     |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |coincheck|               | coi | `coincheck  | \ | `API <https://coinc | Japan,     |
|                           | nch | <https://co | * | heck.com/documents/ | Indonesia  |
|                           | eck | incheck.com |   | exchange/api>`__    |            |
|                           |     | >`__        |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |coinmate|                | coi | `CoinMate < | \ | `API <https://coinm | UK, Czech  |
|                           | nma | https://coi | * | ate.io/developers>` | Republic   |
|                           | te  | nmate.io>`_ |   | __                  |            |
|                           |     | _           |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |coinsecure|              | coi | `Coinsecure | 1 | `API <https://api.c | India      |
|                           | nse |  <https://c |   | oinsecure.in>`__    |            |
|                           | cur | oinsecure.i |   |                     |            |
|                           | e   | n>`__       |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |cryptocapital|           | cry | `Crypto     | \ | `API <https://githu | Panama     |
|                           | pto | Capital <ht | * | b.com/cryptocap>`__ |            |
|                           | cap | tps://crypt |   |                     |            |
|                           | ita | ocapital.co |   |                     |            |
|                           | l   | >`__        |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |dsx|                     | dsx | `DSX <https | \ | `API <https://api.d | UK         |
|                           |     | ://dsx.uk>` | * | sx.uk>`__           |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |exmo|                    | exm | `EXMO <http | 1 | `API <https://exmo. | Spain,     |
|                           | o   | s://exmo.me |   | me/ru/api_doc>`__   | Russia     |
|                           |     | >`__        |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |foxbit|                  | fox | `FoxBit <ht | 1 | `API <https://blink | Brazil     |
|                           | bit | tps://foxbi |   | trade.com/docs>`__  |            |
|                           |     | t.exchange> |   |                     |            |
|                           |     | `__         |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |fybse|                   | fyb | `FYB-SE <ht | \ | `API <http://docs.f | Sweden     |
|                           | se  | tps://www.f | * | yb.apiary.io>`__    |            |
|                           |     | ybse.se>`__ |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |fybsg|                   | fyb | `FYB-SG <ht | \ | `API <http://docs.f | Singapore  |
|                           | sg  | tps://www.f | * | yb.apiary.io>`__    |            |
|                           |     | ybsg.com>`_ |   |                     |            |
|                           |     | _           |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |gdax|                    | gda | `GDAX <http | \ | `API <https://docs. | US         |
|                           | x   | s://www.gda | * | gdax.com>`__        |            |
|                           |     | x.com>`__   |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |gemini|                  | gem | `Gemini <ht | 1 | `API <https://docs. | US         |
|                           | ini | tps://gemin |   | gemini.com/rest-api |            |
|                           |     | i.com>`__   |   | >`__                |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |hitbtc|                  | hit | `HitBTC <ht | 1 | `API <https://hitbt | Hong Kong  |
|                           | btc | tps://hitbt |   | c.com/api>`__       |            |
|                           |     | c.com>`__   |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |huobi|                   | huo | `Huobi <htt | 3 | `API <https://githu | China      |
|                           | bi  | ps://www.hu |   | b.com/huobiapi/API_ |            |
|                           |     | obi.com>`__ |   | Docs_en/wiki>`__    |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |itbit|                   | itb | `itBit <htt | 1 | `API <https://www.i | US         |
|                           | it  | ps://www.it |   | tbit.com/api>`__    |            |
|                           |     | bit.com>`__ |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |jubi|                    | jub | `jubi.com < | 1 | `API <https://www.j | China      |
|                           | i   | https://www |   | ubi.com/help/api.ht |            |
|                           |     | .jubi.com>` |   | ml>`__              |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |kraken|                  | kra | `Kraken <ht | 0 | `API <https://www.k | US         |
|                           | ken | tps://www.k |   | raken.com/en-us/hel |            |
|                           |     | raken.com>` |   | p/api>`__           |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |livecoin|                | liv | `LiveCoin < | \ | `API <https://www.l | US, UK,    |
|                           | eco | https://www | * | ivecoin.net/api?lan | Russia     |
|                           | in  | .livecoin.n |   | g=en>`__            |            |
|                           |     | et>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |liqui|                   | liq | `Liqui <htt | 3 | `API <https://liqui | Ukraine    |
|                           | ui  | ps://liqui. |   | .io/api>`__         |            |
|                           |     | io>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |luno|                    | lun | `luno <http | 1 | `API <https://npmjs | UK,        |
|                           | o   | s://www.lun |   | .org/package/bitx>` | Singapore, |
|                           |     | o.com>`__   |   | __                  | South      |
|                           |     |             |   |                     | Africa     |
+---------------------------+-----+-------------+---+---------------------+------------+
| |mercado|                 | mer | `Mercado    | 3 | `API <https://www.m | Brazil     |
|                           | cad | Bitcoin <ht |   | ercadobitcoin.com.b |            |
|                           | o   | tps://www.m |   | r/api-doc>`__       |            |
|                           |     | ercadobitco |   |                     |            |
|                           |     | in.com.br>` |   |                     |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |okcoincny|               | okc | `OKCoin     | 1 | `API <https://www.o | China      |
|                           | oin | CNY <https: |   | kcoin.cn/rest_getSt |            |
|                           | cny | //www.okcoi |   | arted.html>`__      |            |
|                           |     | n.cn>`__    |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |okcoinusd|               | okc | `OKCoin     | 1 | `API <https://www.o | China, US  |
|                           | oin | USD <https: |   | kcoin.com/rest_getS |            |
|                           | usd | //www.okcoi |   | tarted.html>`__     |            |
|                           |     | n.com>`__   |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |paymium|                 | pay | `Paymium <h | 1 | `API <https://www.p | France, EU |
|                           | miu | ttps://www. |   | aymium.com/page/dev |            |
|                           | m   | paymium.com |   | elopers>`__         |            |
|                           |     | >`__        |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |poloniex|                | pol | `Poloniex < | \ | `API <https://polon | US         |
|                           | oni | https://pol | * | iex.com/support/api |            |
|                           | ex  | oniex.com>` |   | />`__               |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |quadrigacx|              | qua | `QuadrigaCX | 2 | `API <https://www.q | Canada     |
|                           | dri |  <https://w |   | uadrigacx.com/api_i |            |
|                           | gac | ww.quadriga |   | nfo>`__             |            |
|                           | x   | cx.com>`__  |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |quoine|                  | quo | `QUOINE <ht | 2 | `API <https://devel | Japan,     |
|                           | ine | tps://www.q |   | opers.quoine.com>`_ | Singapore, |
|                           |     | uoine.com>` |   | _                   | Vietnam    |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |southxchange|            | sou | `SouthXchan | \ | `API <https://www.s | Argentina  |
|                           | thx | ge <https:/ | * | outhxchange.com/Hom |            |
|                           | cha | /www.southx |   | e/Api>`__           |            |
|                           | nge | change.com> |   |                     |            |
|                           |     | `__         |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |surbitcoin|              | sur | `SurBitcoin | 1 | `API <https://blink | Venezuela  |
|                           | bit |  <https://s |   | trade.com/docs>`__  |            |
|                           | coi | urbitcoin.c |   |                     |            |
|                           | n   | om>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |therock|                 | the | `TheRockTra | 1 | `API <https://api.t | Malta      |
|                           | roc | ding <https |   | herocktrading.com/d |            |
|                           | k   | ://therockt |   | oc/>`__             |            |
|                           |     | rading.com> |   |                     |            |
|                           |     | `__         |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |urdubit|                 | urd | `UrduBit <h | 1 | `API <https://blink | Pakistan   |
|                           | ubi | ttps://urdu |   | trade.com/docs>`__  |            |
|                           | t   | bit.com>`__ |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |vaultoro|                | vau | `Vaultoro < | 1 | `API <https://api.v | Switzerlan |
|                           | lto | https://www |   | aultoro.com>`__     | d          |
|                           | ro  | .vaultoro.c |   |                     |            |
|                           |     | om>`__      |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |vbtc|                    | vbt | `VBTC <http | 1 | `API <https://blink | Vietnam    |
|                           | c   | s://vbtc.ex |   | trade.com/docs>`__  |            |
|                           |     | change>`__  |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |virwox|                  | vir | `VirWoX <ht | \ | `API <https://www.v | Austria    |
|                           | wox | tps://www.v | * | irwox.com/developer |            |
|                           |     | irwox.com>` |   | s.php>`__           |            |
|                           |     | __          |   |                     |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |yobit|                   | yob | `YoBit <htt | 3 | `API <https://www.y | Russia     |
|                           | it  | ps://www.yo |   | obit.net/en/api/>`_ |            |
|                           |     | bit.net>`__ |   | _                   |            |
+---------------------------+-----+-------------+---+---------------------+------------+
| |zaif|                    | zai | `Zaif <http | 1 | `API <https://corp. | Japan      |
|                           | f   | s://zaif.jp |   | zaif.jp/api-docs>`_ |            |
|                           |     | >`__        |   | _                   |            |
+---------------------------+-----+-------------+---+---------------------+------------+

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


