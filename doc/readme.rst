.. role:: raw-html-m2r(raw)
   :format: html


CCXT – CryptoCurrency eXchange Trading Library
==============================================


.. image:: https://travis-ci.com/ccxt/ccxt.svg?branch=master
     :target: https://travis-ci.com/ccxt/ccxt
     :alt: Build Status
 
.. image:: https://img.shields.io/npm/v/ccxt.svg
     :target: https://npmjs.com/package/ccxt
     :alt: npm
 
.. image:: https://img.shields.io/pypi/v/ccxt.svg
     :target: https://pypi.python.org/pypi/ccxt
     :alt: PyPI
 
.. image:: https://img.shields.io/npm/dy/ccxt.svg
     :target: https://www.npmjs.com/package/ccxt
     :alt: NPM Downloads
 
.. image:: https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white
     :target: https://discord.gg/ccxt
     :alt: Discord
 
.. image:: https://img.shields.io/badge/exchanges-120-blue.svg
     :target: https://github.com/ccxt/ccxt/wiki/Exchange-Markets
     :alt: Supported Exchanges
 
.. image:: https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT
     :target: https://twitter.com/ccxt_official
     :alt: Twitter Follow


A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

:ref:`Install <install>` · :ref:`Usage <usage>` · `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ · `FAQ <https://github.com/ccxt/ccxt/wiki/FAQ>`__ · `Examples <https://github.com/ccxt/ccxt/tree/master/examples>`__ · `Contributing <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md>`__ · :ref:`Social <social>` · `CCXT Pro <https://ccxt.pro>`__
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The **CCXT** library is used to connect and trade with cryptocurrency exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms.

Current feature list:


 * support for many cryptocurrency exchanges — more coming soon
 * fully implemented public and private APIs
 * optional normalized data for cross-exchange analytics and arbitrage
 * an out of the box unified API that is extremely easy to integrate
 * works in Node 10.4+, Python 3, PHP 7.0+, and web browsers

See Also
--------


 * .. image:: https://user-images.githubusercontent.com/1294454/66755907-9c3e8880-eea1-11e9-846e-0bff349ceb87.png
       :target: https://tab-trader.com/?utm_source=ccxt
       :alt: TabTrader

   `TabTrader <https://tab-trader.com/?utm_source=ccxt>`__ – trading on all exchanges in one app. Available on `Android <https://play.google.com/store/apps/details?id=com.tabtrader.android&referrer=utm_source%3Dccxt>`__ and `iOS <https://itunes.apple.com/app/apple-store/id1095716562?mt=8>`__\ !
 * .. image:: https://user-images.githubusercontent.com/1294454/114340585-8e35fa80-9b60-11eb-860f-4379125e2db6.png
       :target: https://www.freqtrade.io
       :alt: Freqtrade

   `Freqtrade <https://www.freqtrade.io>`__ – leading opensource cryptocurrency algorithmic trading software!
 * .. image:: https://user-images.githubusercontent.com/1294454/132113722-007fc092-7530-4b41-b929-b8ed380b7b2e.png
       :target: https://www.octobot.online
       :alt: OctoBot

   `OctoBot <https://www.octobot.online>`__ – cryptocurrency trading bot with an advanced web interface.
 * .. image:: https://user-images.githubusercontent.com/1294454/152720975-0522b803-70f0-4f18-a305-3c99b37cd990.png
       :target: https://tokenbot.com/?utm_source=github&utm_medium=ccxt&utm_campaign=algodevs
       :alt: TokenBot

   `TokenBot <https://tokenbot.com/?utm_source=github&utm_medium=ccxt&utm_campaign=algodevs>`__ – discover and copy the best algorithmic traders in the world.

Certified Cryptocurrency Exchanges
----------------------------------

.. list-table::
   :header-rows: 1

   * - logo
     - id
     - name
     - ver
     - certified
     - pro
     - discount
   * - .. image:: https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binance
     
     - binance
     - `Binance <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/spot/en
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: Sign up with Binance using CCXT's referral link for a 10% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binancecoinm
     
     - binancecoinm
     - `Binance COIN-M <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/delivery/en/
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: Sign up with Binance COIN-M using CCXT's referral link for a 10% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binanceusdm
     
     - binanceusdm
     - `Binance USDⓈ-M <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/futures/en/
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: Sign up with Binance USDⓈ-M using CCXT's referral link for a 10% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg
          :target: https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j
          :alt: bitget
     
     - bitget
     - `Bitget <https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://bitgetlimited.github.io/apidoc/en/mix
          :alt: API Version 1
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/129991357-8f47464b-d0f4-41d6-8a82-34122f0d1398.jpg
          :target: http://www.bitmart.com/?r=rQCFLh
          :alt: bitmart
     
     - bitmart
     - `BitMart <http://www.bitmart.com/?r=rQCFLh>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://developer-pro.bitmart.com/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d30%25&color=orange
          :target: http://www.bitmart.com/?r=rQCFLh
          :alt: Sign up with BitMart using CCXT's referral link for a 30% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/169202626-bd130fc5-fcf9-41bb-8d97-6093225c73cd.jpg
          :target: https://bitvavo.com/?a=24F34952F7
          :alt: bitvavo
     
     - bitvavo
     - `Bitvavo <https://bitvavo.com/?a=24F34952F7>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.bitvavo.com/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg
          :target: https://www.bybit.com/register?affiliate_id=35953
          :alt: bybit
     
     - bybit
     - `Bybit <https://www.bybit.com/register?affiliate_id=35953>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://bybit-exchange.github.io/docs/inverse/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg
          :target: https://www.gate.io/ref/2436035
          :alt: gate
     
     - gate
     - `Gate.io <https://www.gate.io/ref/2436035>`__
     - .. image:: https://img.shields.io/badge/4-lightgray
          :target: https://www.gate.io/docs/apiv4/en/index.html
          :alt: API Version 4
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d20%25&color=orange
          :target: https://www.gate.io/ref/2436035
          :alt: Sign up with Gate.io using CCXT's referral link for a 20% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg
          :target: https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223
          :alt: huobi
     
     - huobi
     - `Huobi <https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://huobiapi.github.io/docs/spot/v1/cn/
          :alt: API Version 1
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - .. image:: https://img.shields.io/static/v1?label=Fee&message=%2d15%25&color=orange
          :target: https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223
          :alt: Sign up with Huobi using CCXT's referral link for a 15% discount!
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg
          :target: https://idex.io
          :alt: idex
     
     - idex
     - `IDEX <https://idex.io>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://docs.idex.io/
          :alt: API Version 3
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg
          :target: https://m.mexc.com/auth/signup?inviteCode=1FQ1G
          :alt: mexc
     
     - mexc
     - `MEXC Global <https://m.mexc.com/auth/signup?inviteCode=1FQ1G>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://mxcdevelop.github.io/APIDoc/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg
          :target: https://www.okx.com/join/1888677
          :alt: okx
     
     - okx
     - `OKX <https://www.okx.com/join/1888677>`__
     - .. image:: https://img.shields.io/badge/5-lightgray
          :target: https://www.okx.com/docs-v5/en/
          :alt: API Version 5
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg
          :target: https://waves.exchange
          :alt: wavesexchange
     
     - wavesexchange
     - `Waves.Exchange <https://waves.exchange>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.waves.exchange
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - 

Supported Cryptocurrency Exchange Markets
-----------------------------------------

The CCXT library currently supports the following 114 cryptocurrency exchange markets and trading APIs:

.. list-table::
   :header-rows: 1

   * - logo
     - id
     - name
     - ver
     - certified
     - pro
   * - .. image:: https://user-images.githubusercontent.com/1294454/104140087-a27f2580-53c0-11eb-87c1-5d9e81208fe9.jpg
          :target: https://www.aax.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB
          :alt: aax
     
     - aax
     - `AAX <https://www.aax.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://www.aax.com/apidoc/index.html
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/187234005-b864db3d-f1e3-447a-aaf9-a9fc7b955d07.jpg
          :target: https://alpaca.markets
          :alt: alpaca
     
     - alpaca
     - `Alpaca <https://alpaca.markets>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://alpaca.markets/docs/
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/112027508-47984600-8b48-11eb-9e17-d26459cc36c6.jpg
          :target: https://ascendex.com/en-us/register?inviteCode=EL6BXBQM
          :alt: ascendex
     
     - ascendex
     - `AscendEX <https://ascendex.com/en-us/register?inviteCode=EL6BXBQM>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg
          :target: https://bequant.io
          :alt: bequant
     
     - bequant
     - `Bequant <https://bequant.io>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://api.bequant.io/
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg
          :target: https://w2.bibox365.com/login/register?invite_code=05Kj3I
          :alt: bibox
     
     - bibox
     - `Bibox <https://w2.bibox365.com/login/register?invite_code=05Kj3I>`__
     - .. image:: https://img.shields.io/badge/3.1-lightgray
          :target: https://biboxcom.github.io/en/
          :alt: API Version 3.1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg
          :target: https://b1.run/users/new?code=D3LLBVFT
          :alt: bigone
     
     - bigone
     - `BigONE <https://b1.run/users/new?code=D3LLBVFT>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://open.big.one/docs/api.html
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binance
     
     - binance
     - `Binance <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/spot/en
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binancecoinm
     
     - binancecoinm
     - `Binance COIN-M <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/delivery/en/
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg
          :target: https://www.binance.us/?ref=35005074
          :alt: binanceus
     
     - binanceus
     - `Binance US <https://www.binance.us/?ref=35005074>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://github.com/binance-us/binance-official-api-docs
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg
          :target: https://accounts.binance.com/en/register?ref=D7YA7CLY
          :alt: binanceusdm
     
     - binanceusdm
     - `Binance USDⓈ-M <https://accounts.binance.com/en/register?ref=D7YA7CLY>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://binance-docs.github.io/apidocs/futures/en/
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg
          :target: https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf
          :alt: bit2c
     
     - bit2c
     - `Bit2C <https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://www.bit2c.co.il/home/api
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg
          :target: https://bitbank.cc/
          :alt: bitbank
     
     - bitbank
     - `bitbank <https://bitbank.cc/>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.bitbank.cc/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/117201933-e7a6e780-adf5-11eb-9d80-98fc2a21c3d6.jpg
          :target: https://ref.bitbns.com/1090961
          :alt: bitbns
     
     - bitbns
     - `Bitbns <https://ref.bitbns.com/1090961>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://bitbns.com/trade/#/api-trading/
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg
          :target: https://www.bitfinex.com/?refcode=P61eYxFL
          :alt: bitfinex
     
     - bitfinex
     - `Bitfinex <https://www.bitfinex.com/?refcode=P61eYxFL>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.bitfinex.com/v1/docs
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg
          :target: https://www.bitfinex.com
          :alt: bitfinex2
     
     - bitfinex2
     - `Bitfinex <https://www.bitfinex.com>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.bitfinex.com/v2/docs/
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg
          :target: https://bitflyer.com
          :alt: bitflyer
     
     - bitflyer
     - `bitFlyer <https://bitflyer.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://lightning.bitflyer.com/docs?lang=en
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87295553-1160ec00-c50e-11ea-8ea0-df79276a9646.jpg
          :target: https://www.bitforex.com/en/invitationRegister?inviterId=1867438
          :alt: bitforex
     
     - bitforex
     - `Bitforex <https://www.bitforex.com/en/invitationRegister?inviterId=1867438>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/githubdev2020/API_Doc_en/wiki
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg
          :target: https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j
          :alt: bitget
     
     - bitget
     - `Bitget <https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://bitgetlimited.github.io/apidoc/en/mix
          :alt: API Version 1
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg
          :target: https://www.bithumb.com
          :alt: bithumb
     
     - bithumb
     - `Bithumb <https://www.bithumb.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://apidocs.bithumb.com
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/129991357-8f47464b-d0f4-41d6-8a82-34122f0d1398.jpg
          :target: http://www.bitmart.com/?r=rQCFLh
          :alt: bitmart
     
     - bitmart
     - `BitMart <http://www.bitmart.com/?r=rQCFLh>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://developer-pro.bitmart.com/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg
          :target: https://www.bitmex.com/register/upZpOX
          :alt: bitmex
     
     - bitmex
     - `BitMEX <https://www.bitmex.com/register/upZpOX>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://www.bitmex.com/app/apiOverview
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/158227251-3a92a220-9222-453c-9277-977c6677fe71.jpg
          :target: https://www.bitopro.com
          :alt: bitopro
     
     - bitopro
     - `BitoPro <https://www.bitopro.com>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md
          :alt: API Version 3
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg
          :target: https://www.bitpanda.com/en/pro
          :alt: bitpanda
     
     - bitpanda
     - `Bitpanda Pro <https://www.bitpanda.com/en/pro>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://developers.bitpanda.com/exchange/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/139516488-243a830d-05dd-446b-91c6-c1f18fe30c63.jpg
          :target: https://www.bitrue.com/activity/task/task-landing?inviteCode=EZWETQE&cn=900000
          :alt: bitrue
     
     - bitrue
     - `Bitrue <https://www.bitrue.com/activity/task/task-landing?inviteCode=EZWETQE&cn=900000>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/Bitrue-exchange/bitrue-official-api-docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg
          :target: https://bitso.com/?ref=itej
          :alt: bitso
     
     - bitso
     - `Bitso <https://bitso.com/?ref=itej>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://bitso.com/api_info
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg
          :target: https://www.bitstamp.net
          :alt: bitstamp
     
     - bitstamp
     - `Bitstamp <https://www.bitstamp.net>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://www.bitstamp.net/api
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg
          :target: https://www.bitstamp.net
          :alt: bitstamp1
     
     - bitstamp1
     - `Bitstamp <https://www.bitstamp.net>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://www.bitstamp.net/api
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg
          :target: https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B
          :alt: bittrex
     
     - bittrex
     - `Bittrex <https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://bittrex.github.io/api/v3
          :alt: API Version 3
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/169202626-bd130fc5-fcf9-41bb-8d97-6093225c73cd.jpg
          :target: https://bitvavo.com/?a=24F34952F7
          :alt: bitvavo
     
     - bitvavo
     - `Bitvavo <https://bitvavo.com/?a=24F34952F7>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.bitvavo.com/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/158043180-bb079a65-69e8-45a2-b393-f094d334e610.jpg
          :target: https://www.bkex.com/
          :alt: bkex
     
     - bkex
     - `BKEX <https://www.bkex.com/>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://bkexapi.github.io/docs/api_en.htm
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg
          :target: https://bl3p.eu
          :alt: bl3p
     
     - bl3p
     - `BL3P <https://bl3p.eu>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/BitonicNL/bl3p-api/tree/master/docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/147515585-1296e91b-7398-45e5-9d32-f6121538533f.jpeg
          :target: https://blockchain.com
          :alt: blockchaincom
     
     - blockchaincom
     - `Blockchain.com <https://blockchain.com>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://api.blockchain.com/v3
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg
          :target: https://btc-alpha.com/?r=123788
          :alt: btcalpha
     
     - btcalpha
     - `BTC-Alpha <https://btc-alpha.com/?r=123788>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://btc-alpha.github.io/api-docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87327317-98c55400-c53c-11ea-9a11-81f7d951cc74.jpg
          :target: https://www.btcbox.co.jp/
          :alt: btcbox
     
     - btcbox
     - `BtcBox <https://www.btcbox.co.jp/>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://blog.btcbox.jp/en/archives/8762
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/173489620-d49807a4-55cd-4f4e-aca9-534921298bbf.jpg
          :target: https://www.btcex.com/en-us/register?i=48biatg1
          :alt: btcex
     
     - btcex
     - `BTCEX <https://www.btcex.com/en-us/register?i=48biatg1>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.btcex.com/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/89731817-b3fb8480-da52-11ea-817f-783b08aaf32b.jpg
          :target: https://btcmarkets.net
          :alt: btcmarkets
     
     - btcmarkets
     - `BTC Markets <https://btcmarkets.net>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://api.btcmarkets.net/doc/v3
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg
          :target: https://btc-trade.com.ua/registration/22689
          :alt: btctradeua
     
     - btctradeua
     - `BTC Trade UA <https://btc-trade.com.ua/registration/22689>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg
          :target: https://www.btcturk.com
          :alt: btcturk
     
     - btcturk
     - `BTCTurk <https://www.btcturk.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://github.com/BTCTrader/broker-api-docs
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/47380619-8a029200-d706-11e8-91e0-8a391fe48de3.jpg
          :target: https://www.buda.com
          :alt: buda
     
     - buda
     - `Buda <https://www.buda.com>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://api.buda.com
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/69436317-31128c80-0d52-11ea-91d1-eb7bb5818812.jpg
          :target: https://www.bw.com/regGetCommission/N3JuT1R3bWxKTE0
          :alt: bw
     
     - bw
     - `BW <https://www.bw.com/regGetCommission/N3JuT1R3bWxKTE0>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/bw-exchange/api_docs_en/wiki
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg
          :target: https://www.bybit.com/register?affiliate_id=35953
          :alt: bybit
     
     - bybit
     - `Bybit <https://www.bybit.com/register?affiliate_id=35953>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://bybit-exchange.github.io/docs/inverse/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg
          :target: https://www.byte-trade.com
          :alt: bytetrade
     
     - bytetrade
     - `ByteTrade <https://www.byte-trade.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.byte-trade.com/#description
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg
          :target: https://cex.io/r/0/up105393824/0/
          :alt: cex
     
     - cex
     - `CEX.IO <https://cex.io/r/0/up105393824/0/>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://cex.io/cex-api
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg
          :target: https://www.coinbase.com/join/58cbe25a355148797479dbd2
          :alt: coinbase
     
     - coinbase
     - `Coinbase <https://www.coinbase.com/join/58cbe25a355148797479dbd2>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://developers.coinbase.com/api/v2
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg
          :target: https://exchange.coinbase.com
          :alt: coinbaseprime
     
     - coinbaseprime
     - `Coinbase Prime <https://exchange.coinbase.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.exchange.coinbase.com
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg
          :target: https://pro.coinbase.com/
          :alt: coinbasepro
     
     - coinbasepro
     - `Coinbase Pro <https://pro.coinbase.com/>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.pro.coinbase.com
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg
          :target: https://coincheck.com
          :alt: coincheck
     
     - coincheck
     - `coincheck <https://coincheck.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://coincheck.com/documents/exchange/api
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg
          :target: https://www.coinex.com/register?refer_code=yw5fz
          :alt: coinex
     
     - coinex
     - `CoinEx <https://www.coinex.com/register?refer_code=yw5fz>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/coinexcom/coinex_exchange_api/wiki
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg
          :target: https://coinfalcon.com/?ref=CFJSVGTUPASB
          :alt: coinfalcon
     
     - coinfalcon
     - `CoinFalcon <https://coinfalcon.com/?ref=CFJSVGTUPASB>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.coinfalcon.com
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg
          :target: https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0
          :alt: coinmate
     
     - coinmate
     - `CoinMate <https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://coinmate.docs.apiary.io
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg
          :target: https://coinone.co.kr
          :alt: coinone
     
     - coinone
     - `CoinOne <https://coinone.co.kr>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://doc.coinone.co.kr
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg
          :target: https://www.coinspot.com.au/register?code=PJURCU
          :alt: coinspot
     
     - coinspot
     - `CoinSpot <https://www.coinspot.com.au/register?code=PJURCU>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://www.coinspot.com.au/api
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/47813922-6f12cc00-dd5d-11e8-97c6-70f957712d47.jpg
          :target: https://crex24.com/?refid=slxsjsjtil8xexl9hksr
          :alt: crex24
     
     - crex24
     - `CREX24 <https://crex24.com/?refid=slxsjsjtil8xexl9hksr>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.crex24.com/trade-api/v2
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg
          :target: https://crypto.com/exch/5835vstech
          :alt: cryptocom
     
     - cryptocom
     - `Crypto.com <https://crypto.com/exch/5835vstech>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://exchange-docs.crypto.com/
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg
          :target: https://currency.com/trading/signup?c=362jaimv&pid=referral
          :alt: currencycom
     
     - currencycom
     - `Currency.com <https://currency.com/trading/signup?c=362jaimv&pid=referral>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://currency.com/api
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg
          :target: https://www.delta.exchange/app/signup/?code=IULYNB
          :alt: delta
     
     - delta
     - `Delta Exchange <https://www.delta.exchange/app/signup/?code=IULYNB>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.delta.exchange
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg
          :target: https://www.deribit.com/reg-1189.4038
          :alt: deribit
     
     - deribit
     - `Deribit <https://www.deribit.com/reg-1189.4038>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.deribit.com/v2
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg
          :target: https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp
          :alt: digifinex
     
     - digifinex
     - `DigiFinex <https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://docs.digifinex.com
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg
          :target: https://exmo.me/?ref=131685
          :alt: exmo
     
     - exmo
     - `EXMO <https://exmo.me/?ref=131685>`__
     - .. image:: https://img.shields.io/badge/1.1-lightgray
          :target: https://exmo.me/en/api_doc?ref=131685
          :alt: API Version 1.1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87443317-01c0d080-c5fe-11ea-95c2-9ebe1a8fafd9.jpg
          :target: https://one.ndax.io/bfQiSL
          :alt: flowbtc
     
     - flowbtc
     - `flowBTC <https://one.ndax.io/bfQiSL>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://www.flowbtc.com.br/api.html
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg
          :target: https://fmfw.io/referral/da948b21d6c92d69
          :alt: fmfwio
     
     - fmfwio
     - `FMFW.io <https://fmfw.io/referral/da948b21d6c92d69>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://api.fmfw.io/api/2/explore/
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg
          :target: https://ftx.com/referrals#a=1623029
          :alt: ftx
     
     - ftx
     - `FTX <https://ftx.com/referrals#a=1623029>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://github.com/ftexchange/ftx
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/141506670-12f6115f-f425-4cd8-b892-b51d157ca01f.jpg
          :target: https://ftx.com/referrals#a=1623029
          :alt: ftxus
     
     - ftxus
     - `FTX US <https://ftx.com/referrals#a=1623029>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://github.com/ftexchange/ftx
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg
          :target: https://www.gate.io/ref/2436035
          :alt: gate
     
     - gate
     - `Gate.io <https://www.gate.io/ref/2436035>`__
     - .. image:: https://img.shields.io/badge/4-lightgray
          :target: https://www.gate.io/docs/apiv4/en/index.html
          :alt: API Version 4
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg
          :target: https://gemini.com/
          :alt: gemini
     
     - gemini
     - `Gemini <https://gemini.com/>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.gemini.com/rest-api
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg
          :target: https://hitbtc.com/?ref_id=5a5d39a65d466
          :alt: hitbtc
     
     - hitbtc
     - `HitBTC <https://hitbtc.com/?ref_id=5a5d39a65d466>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://api.hitbtc.com/v2
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg
          :target: https://hitbtc.com/?ref_id=5a5d39a65d466
          :alt: hitbtc3
     
     - hitbtc3
     - `HitBTC <https://hitbtc.com/?ref_id=5a5d39a65d466>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://api.hitbtc.com
          :alt: API Version 3
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg
          :target: https://pro.hollaex.com/signup?affiliation_code=QSWA6G
          :alt: hollaex
     
     - hollaex
     - `HollaEx <https://pro.hollaex.com/signup?affiliation_code=QSWA6G>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://apidocs.hollaex.com
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg
          :target: https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223
          :alt: huobi
     
     - huobi
     - `Huobi <https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://huobiapi.github.io/docs/spot/v1/cn/
          :alt: API Version 1
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg
          :target: https://www.huobi.co.jp/register/?invite_code=znnq3
          :alt: huobijp
     
     - huobijp
     - `Huobi Japan <https://www.huobi.co.jp/register/?invite_code=znnq3>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://api-doc.huobi.co.jp
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg
          :target: https://idex.io
          :alt: idex
     
     - idex
     - `IDEX <https://idex.io>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://docs.idex.io/
          :alt: API Version 3
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg
          :target: https://www.independentreserve.com
          :alt: independentreserve
     
     - independentreserve
     - `Independent Reserve <https://www.independentreserve.com>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://www.independentreserve.com/API
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg
          :target: https://indodax.com/ref/testbitcoincoid/1
          :alt: indodax
     
     - indodax
     - `INDODAX <https://indodax.com/ref/testbitcoincoid/1>`__
     - .. image:: https://img.shields.io/badge/2.0-lightgray
          :target: https://github.com/btcid/indodax-official-api-docs
          :alt: API Version 2.0
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg
          :target: https://www.itbit.com
          :alt: itbit
     
     - itbit
     - `itBit <https://www.itbit.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://api.itbit.com/docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg
          :target: https://www.kraken.com
          :alt: kraken
     
     - kraken
     - `Kraken <https://www.kraken.com>`__
     - .. image:: https://img.shields.io/badge/0-lightgray
          :target: https://www.kraken.com/features/api
          :alt: API Version 0
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg
          :target: https://www.kucoin.com/ucenter/signup?rcode=E5wkqe
          :alt: kucoin
     
     - kucoin
     - `KuCoin <https://www.kucoin.com/ucenter/signup?rcode=E5wkqe>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.kucoin.com
          :alt: API Version 2
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg
          :target: https://futures.kucoin.com/?rcode=E5wkqe
          :alt: kucoinfutures
     
     - kucoinfutures
     - `KuCoin Futures <https://futures.kucoin.com/?rcode=E5wkqe>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.kucoin.com/futures
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg
          :target: https://kuna.io?r=kunaid-gvfihe8az7o4
          :alt: kuna
     
     - kuna
     - `Kuna <https://kuna.io?r=kunaid-gvfihe8az7o4>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://kuna.io/documents/api
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg
          :target: https://latoken.com/invite?r=mvgp2djk
          :alt: latoken
     
     - latoken
     - `Latoken <https://latoken.com/invite?r=mvgp2djk>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://api.latoken.com
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg
          :target: https://www.lbank.info/invitevip?icode=7QCY
          :alt: lbank
     
     - lbank
     - `LBank <https://www.lbank.info/invitevip?icode=7QCY>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/LBank-exchange/lbank-official-api-docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg
          :target: https://www.lbank.info/invitevip?icode=7QCY
          :alt: lbank2
     
     - lbank2
     - `LBank <https://www.lbank.info/invitevip?icode=7QCY>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://www.lbank.info/en-US/docs/index.html
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg
          :target: https://www.liquid.com/sign-up/?affiliate=SbzC62lt30976
          :alt: liquid
     
     - liquid
     - `Liquid <https://www.liquid.com/sign-up/?affiliate=SbzC62lt30976>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://developers.liquid.com
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg
          :target: https://www.luno.com/invite/44893A
          :alt: luno
     
     - luno
     - `luno <https://www.luno.com/invite/44893A>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://www.luno.com/en/api
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/155840500-1ea4fdf0-47c0-4daa-9597-c6c1cd51b9ec.jpg
          :target: https://www.lykke.com
          :alt: lykke
     
     - lykke
     - `Lykke <https://www.lykke.com>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://hft-apiv2.lykke.com/swagger/ui/index.html
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg
          :target: https://www.mercadobitcoin.com.br
          :alt: mercado
     
     - mercado
     - `Mercado Bitcoin <https://www.mercadobitcoin.com.br>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://www.mercadobitcoin.com.br/api-doc
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg
          :target: https://m.mexc.com/auth/signup?inviteCode=1FQ1G
          :alt: mexc
     
     - mexc
     - `MEXC Global <https://m.mexc.com/auth/signup?inviteCode=1FQ1G>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://mxcdevelop.github.io/APIDoc/
          :alt: API Version 2
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg
          :target: https://m.mexc.com/auth/signup?inviteCode=1FQ1G
          :alt: mexc3
     
     - mexc3
     - `MEXC Global <https://m.mexc.com/auth/signup?inviteCode=1FQ1G>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://mxcdevelop.github.io/apidocs/spot_v3_en/
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg
          :target: https://one.ndax.io/bfQiSL
          :alt: ndax
     
     - ndax
     - `NDAX <https://one.ndax.io/bfQiSL>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://apidoc.ndax.io/
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg
          :target: https://www.novadax.com.br/?s=ccxt
          :alt: novadax
     
     - novadax
     - `NovaDAX <https://www.novadax.com.br/?s=ccxt>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://doc.novadax.com/pt-BR/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg
          :target: https://oceanex.pro/signup?referral=VE24QX
          :alt: oceanex
     
     - oceanex
     - `OceanEx <https://oceanex.pro/signup?referral=VE24QX>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://api.oceanex.pro/doc/v1
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg
          :target: https://www.okcoin.com/account/register?flag=activity&channelId=600001513
          :alt: okcoin
     
     - okcoin
     - `OKCoin <https://www.okcoin.com/account/register?flag=activity&channelId=600001513>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://www.okcoin.com/docs/en/
          :alt: API Version 3
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg
          :target: https://www.okx.com/join/1888677
          :alt: okx
     
     - okx
     - `OKX <https://www.okx.com/join/1888677>`__
     - .. image:: https://img.shields.io/badge/5-lightgray
          :target: https://www.okx.com/docs-v5/en/
          :alt: API Version 5
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg
          :target: https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj
          :alt: paymium
     
     - paymium
     - `Paymium <https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/Paymium/api-documentation
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg
          :target: https://phemex.com/register?referralCode=EDNVJ
          :alt: phemex
     
     - phemex
     - `Phemex <https://phemex.com/register?referralCode=EDNVJ>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://github.com/phemex/phemex-api-docs
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg
          :target: https://poloniex.com/signup?c=UBFZJRPJ
          :alt: poloniex
     
     - poloniex
     - `Poloniex <https://poloniex.com/signup?c=UBFZJRPJ>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.poloniex.com
          :alt: API Version *
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/79268032-c4379480-7ea2-11ea-80b3-dd96bb29fd0d.jpg
          :target: https://www.probit.com/r/34608773
          :alt: probit
     
     - probit
     - `ProBit <https://www.probit.com/r/34608773>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs-en.probit.com
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/80491487-74a99c00-896b-11ea-821e-d307e832f13e.jpg
          :target: https://qtrade.io/?ref=BKOQWVFGRH2C
          :alt: qtrade
     
     - qtrade
     - `qTrade <https://qtrade.io/?ref=BKOQWVFGRH2C>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://qtrade-exchange.github.io/qtrade-docs
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/94507548-a83d6a80-0218-11eb-9998-28b9cec54165.jpg
          :target: https://exchange.ripio.com
          :alt: ripio
     
     - ripio
     - `Ripio <https://exchange.ripio.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://exchange.ripio.com/en/api/
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/69680782-03fd0b80-10bd-11ea-909e-7f603500e9cc.jpg
          :target: https://app.stex.com?ref=36416021
          :alt: stex
     
     - stex
     - `STEX <https://app.stex.com?ref=36416021>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://apidocs.stex.com/
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg
          :target: https://therocktrading.com
          :alt: therock
     
     - therock
     - `TheRockTrading <https://therocktrading.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://api.therocktrading.com/doc/v1/index.html
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/51840849/87460811-1e690280-c616-11ea-8652-69f187305add.jpg
          :target: http://bit.ly/2IX0LrM
          :alt: tidebit
     
     - tidebit
     - `TideBit <http://bit.ly/2IX0LrM>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://www.tidebit.com/documents/api/guide
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg
          :target: https://tidex.com/exchange/?ref=57f5638d9cd7
          :alt: tidex
     
     - tidex
     - `Tidex <https://tidex.com/exchange/?ref=57f5638d9cd7>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://tidex.com/exchange/public-api
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/70423869-6839ab00-1a7f-11ea-8f94-13ae72c31115.jpg
          :target: https://timex.io/?refcode=1x27vNkTbP1uwkCck
          :alt: timex
     
     - timex
     - `TimeX <https://timex.io/?refcode=1x27vNkTbP1uwkCck>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.timex.io
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/183870484-d3398d0c-f6a1-4cce-91b8-d58792308716.jpg
          :target: https://tokocrypto.com
          :alt: tokocrypto
     
     - tokocrypto
     - `Tokocrypto <https://tokocrypto.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://www.tokocrypto.com/apidocs/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg
          :target: https://upbit.com
          :alt: upbit
     
     - upbit
     - `Upbit <https://upbit.com>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg
          :target: https://waves.exchange
          :alt: wavesexchange
     
     - wavesexchange
     - `Waves.Exchange <https://waves.exchange>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.waves.exchange
          :alt: API Version *
     
     - .. image:: https://img.shields.io/badge/CCXT-Certified-green.svg
          :target: https://github.com/ccxt/ccxt/wiki/Certification
          :alt: CCXT Certified
     
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/148647666-c109c20b-f8ac-472f-91c3-5f658cb90f49.jpeg
          :target: https://wazirx.com/invite/k7rrnks5
          :alt: wazirx
     
     - wazirx
     - `WazirX <https://wazirx.com/invite/k7rrnks5>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://docs.wazirx.com/#public-rest-api-for-wazirx
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg
          :target: https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963
          :alt: whitebit
     
     - whitebit
     - `WhiteBit <https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963>`__
     - .. image:: https://img.shields.io/badge/2-lightgray
          :target: https://github.com/whitebit-exchange/api-docs
          :alt: API Version 2
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg
          :target: https://referral.woo.org/BAJS6oNmZb3vi3RGA
          :alt: woo
     
     - woo
     - `WOO X <https://referral.woo.org/BAJS6oNmZb3vi3RGA>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://docs.woo.org/
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg
          :target: https://www.yobit.net
          :alt: yobit
     
     - yobit
     - `YoBit <https://www.yobit.net>`__
     - .. image:: https://img.shields.io/badge/3-lightgray
          :target: https://www.yobit.net/en/api/
          :alt: API Version 3
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg
          :target: https://zaif.jp
          :alt: zaif
     
     - zaif
     - `Zaif <https://zaif.jp>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://techbureau-api-document.readthedocs.io/ja/latest/index.html
          :alt: API Version 1
     
     - 
     - 
   * - .. image:: https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg
          :target: https://www.zbex.club/en/register?ref=4301lera
          :alt: zb
     
     - zb
     - `ZB <https://www.zbex.club/en/register?ref=4301lera>`__
     - .. image:: https://img.shields.io/badge/1-lightgray
          :target: https://www.zb.com/i/developer
          :alt: API Version 1
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/146103275-c39a34d9-68a4-4cd2-b1f1-c684548d311b.jpg
          :target: https://trade.zipmex.com/global/accounts/sign-up?aff=KLm7HyCsvN
          :alt: zipmex
     
     - zipmex
     - `Zipmex <https://trade.zipmex.com/global/accounts/sign-up?aff=KLm7HyCsvN>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://apidoc.ndax.io/
          :alt: API Version *
     
     - 
     - .. image:: https://img.shields.io/badge/CCXT-Pro-black
          :target: https://ccxt.pro
          :alt: CCXT Pro
     
   * - .. image:: https://user-images.githubusercontent.com/1294454/159202310-a0e38007-5e7c-4ba9-a32f-c8263a0291fe.jpg
          :target: https://auth.zondaglobal.com/ref/jHlbB4mIkdS1
          :alt: zonda
     
     - zonda
     - `Zonda <https://auth.zondaglobal.com/ref/jHlbB4mIkdS1>`__
     - .. image:: https://img.shields.io/badge/*-lightgray
          :target: https://docs.zonda.exchange/
          :alt: API Version *
     
     - 


The list above is updated frequently, new crypto markets, exchanges, bug fixes, and API endpoints are introduced on a regular basis. See the `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ for more details. If you can't find a cryptocurrency exchange in the list above and want it to be added, post a link to it by opening an issue here on GitHub or send us an email.

The library is under `MIT license <https://github.com/ccxt/ccxt/blob/master/LICENSE.txt>`__\ , that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

----

Install
-------

The easiest way to install the CCXT library is to use a package manager:


 * `ccxt in **NPM** <https://www.npmjs.com/package/ccxt>`__ (JavaScript / Node v7.6+)
 * `ccxt in **PyPI** <https://pypi.python.org/pypi/ccxt>`__ (Python 3.5.3+)
 * `ccxt in **Packagist/Composer** <https://packagist.org/packages/ccxt/ccxt>`__ (PHP 7.0+)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:


 * `js/ <https://github.com/ccxt/ccxt/blob/master/js/>`__ in JavaScript
 * `python/ <https://github.com/ccxt/ccxt/blob/master/python/>`__ in Python (generated from JS)
 * `php/ <https://github.com/ccxt/ccxt/blob/master/php/>`__ in PHP (generated from JS)

You can also clone it into your project directory from `ccxt GitHub repository <https://github.com/ccxt/ccxt>`__\ :

.. code-block:: shell

   git clone https://github.com/ccxt/ccxt.git  # including 1GB of commit history

   # or

   git clone https://github.com/ccxt/ccxt.git --depth 1  # avoid downloading 1GB of commit history

JavaScript (NPM)
^^^^^^^^^^^^^^^^

JavaScript version of CCXT works in both Node and web browsers. Requires ES6 and ``async/await`` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is `not excluded <https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178>`__ in your ``babel-loader`` config.

`ccxt in **NPM** <https://www.npmjs.com/package/ccxt>`__

.. code-block:: shell

   npm install ccxt

.. code-block:: JavaScript

   var ccxt = require ('ccxt')

   console.log (ccxt.exchanges) // print all available exchanges

JavaScript (for use with the ``<script>`` tag):
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

All-in-one browser bundle (dependencies included), served from a CDN of your choice:


 * jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@2.0.84/dist/ccxt.browser.js
 * unpkg: https://unpkg.com/ccxt@2.0.84/dist/ccxt.browser.js

CDNs are not updated in real-time and may have delays. Defaulting to the most recent version without specifying the version number is not recommended. Please, keep in mind that we are not responsible for the correct operation of those CDN servers.

.. code-block:: HTML

   <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@2.0.84/dist/ccxt.browser.js"></script>

Creates a global ``ccxt`` object:

.. code-block:: JavaScript

   console.log (ccxt.exchanges) // print all available exchanges

Python
^^^^^^

`ccxt in **PyPI** <https://pypi.python.org/pypi/ccxt>`__

.. code-block:: shell

   pip install ccxt

.. code-block:: Python

   import ccxt
   print(ccxt.exchanges) # print a list of all available exchange classes

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5.3+

.. code-block:: Python

   import ccxt.async_support as ccxt # link against the asynchronous version of ccxt

PHP
^^^

`ccxt in PHP with **Packagist/Composer** <https://packagist.org/packages/ccxt/ccxt>`__ (PHP 7.0+)

It requires common PHP modules:


 * cURL
 * mbstring (using UTF-8 is highly recommended)
 * PCRE
 * iconv
 * gmp (this is a built-in extension as of PHP 7.2+)

.. code-block:: PHP

   include "ccxt.php";
   var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes

The library supports concurrent asynchronous mode using tools from `RecoilPHP <https://github.com/recoilphp/recoil>`__ and `ReactPHP <https://reactphp.org/>`__ in PHP 7.1+. Read the `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ for more details.

Docker
^^^^^^

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the `Contributing <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md>`__ document for the details on that).

Using ``docker-compose`` (in the cloned CCXT repository):

.. code-block:: shell

   docker-compose run --rm ccxt

You don't need the Docker image if you're not going to develop CCXT. If you just want to use CCXT – just install it as a regular package into your project.

----

Documentation
-------------

Read the `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ for more details.

Usage
-----

Intro
^^^^^

The CCXT library consists of a public part and a private part. Anyone can use the public part immediately after installation. Public APIs provide unrestricted access to public information for all exchange markets without the need to register a user account or have an API key.

Public APIs include the following:


 * market data
 * instruments/trading pairs
 * price feeds (exchange rates)
 * order books
 * trade history
 * tickers
 * OHLC(V) for charting
 * other public endpoints

In order to trade with private APIs you need to obtain API keys from an exchange's website. It usually means signing up to the exchange and creating API keys for your account. Some exchanges require personal info or identification. Sometimes verification may be necessary as well. In this case you will need to register yourself, this library will not create accounts or API keys for you. Some exchanges expose API endpoints for registering an account, but most exchanges don't. You will have to sign up and create API keys on their websites.

Private APIs allow the following:


 * manage personal account info
 * query account balances
 * trade by making market and limit orders
 * deposit and withdraw fiat and crypto funds
 * query personal orders
 * get ledger history
 * transfer funds between accounts
 * use merchant services

This library implements full public and private REST APIs for all exchanges. WebSocket and FIX implementations in JavaScript, PHP, Python are available in `CCXT Pro <https://ccxt.pro>`__\ , which is a professional addon to CCXT with support for WebSocket streams.

The CCXT library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

.. code-block:: JavaScript

   // both of these notations work in JavaScript/Python/PHP
   exchange.methodName ()  // camelcase pseudocode
   exchange.method_name () // underscore pseudocode

Read the `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ for more details.

JavaScript
^^^^^^^^^^

.. code-block:: JavaScript

   'use strict';
   const ccxt = require ('ccxt');

   (async function () {
       let kraken    = new ccxt.kraken ()
       let bitfinex  = new ccxt.bitfinex ({ verbose: true })
       let huobipro  = new ccxt.huobipro ()
       let okcoinusd = new ccxt.okcoin ({
           apiKey: 'YOUR_PUBLIC_API_KEY',
           secret: 'YOUR_SECRET_PRIVATE_KEY',
       })

       const exchangeId = 'binance'
           , exchangeClass = ccxt[exchangeId]
           , exchange = new exchangeClass ({
               'apiKey': 'YOUR_API_KEY',
               'secret': 'YOUR_SECRET',
           })

       console.log (kraken.id,    await kraken.loadMarkets ())
       console.log (bitfinex.id,  await bitfinex.loadMarkets  ())
       console.log (huobipro.id,  await huobipro.loadMarkets ())

       console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
       console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
       console.log (huobipro.id,  await huobipro.fetchTrades ('ETH/USDT'))

       console.log (okcoinusd.id, await okcoinusd.fetchBalance ())

       // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
       console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))

       // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
       console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

       // pass/redefine custom exchange-specific order params: type, amount, price or whatever
       // use a custom order type
       bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

   }) ();

Python
^^^^^^

.. code-block:: Python

   # coding=utf-8

   import ccxt

   hitbtc   = ccxt.hitbtc({'verbose': True})
   bitmex   = ccxt.bitmex()
   huobipro = ccxt.huobipro()
   exmo     = ccxt.exmo({
       'apiKey': 'YOUR_PUBLIC_API_KEY',
       'secret': 'YOUR_SECRET_PRIVATE_KEY',
   })
   kraken = ccxt.kraken({
       'apiKey': 'YOUR_PUBLIC_API_KEY',
       'secret': 'YOUR_SECRET_PRIVATE_KEY',
   })

   exchange_id = 'binance'
   exchange_class = getattr(ccxt, exchange_id)
   exchange = exchange_class({
       'apiKey': 'YOUR_API_KEY',
       'secret': 'YOUR_SECRET',
   })

   hitbtc_markets = hitbtc.load_markets()

   print(hitbtc.id, hitbtc_markets)
   print(bitmex.id, bitmex.load_markets())
   print(huobipro.id, huobipro.load_markets())

   print(hitbtc.fetch_order_book(hitbtc.symbols[0]))
   print(bitmex.fetch_ticker('BTC/USD'))
   print(huobipro.fetch_trades('LTC/USDT'))

   print(exmo.fetch_balance())

   # sell one ฿ for market price and receive $ right now
   print(exmo.id, exmo.create_market_sell_order('BTC/USD', 1))

   # limit buy BTC/EUR, you pay €2500 and receive ฿1  when the order is closed
   print(exmo.id, exmo.create_limit_buy_order('BTC/EUR', 1, 2500.00))

   # pass/redefine custom exchange-specific order params: type, amount, price, flags, etc...
   kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})

PHP
^^^

.. code-block:: PHP

   include 'ccxt.php';

   $poloniex = new \ccxt\poloniex ();
   $bittrex  = new \ccxt\bittrex  (array ('verbose' => true));
   $quoinex  = new \ccxt\quoinex   ();
   $zaif     = new \ccxt\zaif     (array (
       'apiKey' => 'YOUR_PUBLIC_API_KEY',
       'secret' => 'YOUR_SECRET_PRIVATE_KEY',
   ));
   $hitbtc   = new \ccxt\hitbtc   (array (
       'apiKey' => 'YOUR_PUBLIC_API_KEY',
       'secret' => 'YOUR_SECRET_PRIVATE_KEY',
   ));

   $exchange_id = 'binance';
   $exchange_class = "\\ccxt\\$exchange_id";
   $exchange = new $exchange_class (array (
       'apiKey' => 'YOUR_API_KEY',
       'secret' => 'YOUR_SECRET',
   ));

   $poloniex_markets = $poloniex->load_markets ();

   var_dump ($poloniex_markets);
   var_dump ($bittrex->load_markets ());
   var_dump ($quoinex->load_markets ());

   var_dump ($poloniex->fetch_order_book ($poloniex->symbols[0]));
   var_dump ($bittrex->fetch_trades ('BTC/USD'));
   var_dump ($quoinex->fetch_ticker ('ETH/EUR'));
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

Please read the `CONTRIBUTING <https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md>`__ document before making changes that you would like adopted in the code. Also, read the `Manual <https://docs.ccxt.com/en/latest/manual.html>`__ for more details.

Support Developer Team
----------------------

We are investing a significant amount of time into the development of this library. If CCXT made your life easier and you want to help us improve it further, or if you want to speed up development of new features and exchanges, please support us with a tip. We appreciate all contributions!

Sponsors
^^^^^^^^

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.

[\ `Become a sponsor <https://opencollective.com/ccxt#sponsor>`__\ ]

:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/0/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/1/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/2/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/3/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/4/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/5/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/6/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/7/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/8/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/9/avatar.svg"></a>`

Supporters
^^^^^^^^^^

Support this project by becoming a supporter. Your avatar will show up here with a link to your website.

[\ `Become a supporter <https://opencollective.com/ccxt#supporter>`__\ ]

:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/0/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/1/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/2/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/3/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/4/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/5/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/6/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/7/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/8/avatar.svg"></a>`
:raw-html-m2r:`<a href="https://opencollective.com/ccxt/tiers/supporter/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/9/avatar.svg"></a>`

Backers
^^^^^^^

Thank you to all our backers! [\ `Become a backer <https://opencollective.com/ccxt#backer>`__\ ]

:raw-html-m2r:`<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/tiers/backer.svg?width=890"></a>`

Thank you!

Social
------


 * `Follow us on Twitter <https://twitter.com/ccxt_official>`__
 * `Read our blog on Medium <https://medium.com/@ccxt>`__
 * .. image:: https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white
       :target: https://discord.gg/dhzSKYU
       :alt: Discord

Contact Us
----------

For business inquiries: info@ccxt.trade
