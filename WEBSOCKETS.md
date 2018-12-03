# Websockets
```diff
- This file is a work in progress, guidelines are being developed right now!
```
## Before you test in python or PHP
If you want to use python or PHP language you must execute `npm run export-exchanges` (to ensure exchanges.js will be updated) and `npm run transpile` to update python and PHP exchange modules.
## Test it!
You can test websocket events with two sample scripts:
* **examples/js/websocket-orderbook-subscription.js** tests orderbook subscription/unsubscription with one ore multiple symbols: subscribe to symbol, wait 5 seconds, subscribe second symbol, ..., then unsubscribe symbol, wait 5 seconds, unsubscribe seconds symbol, ...
  * `node examples/js/websocket-orderbook-subscription.js bitstamp None None 5 BTC/EUR`
    * test bitstamp orderbook subscription/unsubscription on BTC/EUR symbol
  * `node examples/js//websocket-orderbook-subscription.js bitstamp None None 5 BTC/EUR XRP/EUR`
    * test bitstamp orderbook subscription/unsubscription on BTC/EUR and XRP/EUR symbols
* **examples/js/websocket-playground.js** tests websocket events: orderbook, trade, ... usage:
  * `node examples/js/websocket-playground.js therock ob ETH/BTC`
    * get orderbook updates of *therock* exchange and *ETH/BTC* market
  * `node examples/js/websocket-playground.js binance ob ETH/USDT limit:5`
    * get orderbook updates, limited to 5 bids/5 asks, of *binance* exchange and *ETH/USDT* market
* **examples/js/websocket-orderbook.js** subscription on one or more markets.
  * `node examples/js/websocket-orderbook.js`
    * print orderbook updates on bitfinex2(BTC/USDT, XRP/USDT) & binance(BTC/USDT)
  * `node examples/js/websocket-orderbook.js config.json`
    * print orderbook updates on subscribed markets in config.json file
    ```javascript
    {
        // default config in exchange creation
        "exchangeDefaults": {
            "verbose": false
        },
        // default config on symbol subscription
        "symbolDefaults": {
            "limit": 5
        },
        // config for printing market tablet
        "marketTable": {
            // markets in same row
            "marketsByRow": 3,
            // max bids/asks to print
            "maxLimit": 10,
            // characters (columns) reserved for each market
            "marketColumnWidth": 50,
        },
        // dict with exchanges ids
        "exchanges" : {
            "bitfinex2" : {
                "symbols": {
                    "BTC/USDT": {
                        // config for this symbol subscription
                    },
                    "XRP/USDT": {

                    }
                },
                "options": {
                    // config for this exchange creation
                }
            },
            "binance": {
                "symbols": {
                    'BTC/USDT':{}
                },
                "options": {

                }
            }
        }
    }
    ```
  
You can find both examples in python and PHP languages:
* **examples/php/websocket-playground.php**
* **examples/py/websocket-playground.py**

And specific examples for exchanges:
* **examples/py/websocket-poloniex-orderbook.py** test websocket orderbook events in poloniex.
## Current supported exchanges
|                                                                                                                           | id                 | name                                                                         | ver | doc                                                                                          |WsVer| Ws doc                                                                                                                   | Ws Protocol | Ws Features | countries                               |
|---------------------------------------------------------------------------------------------------------------------------|--------------------|------------------------------------------------------------------------------|:---:|:--------------------------------------------------------------------------------------------:|:---:|:------------------------------------------------------------------------------------------------------------------------:|-------------|-------------|-----------------------------------------|
|![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)            | binance            | [Binance](https://www.binance.com/?ref=10205187)                             | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) |     | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md)                   | raw         | ob ti tr oh | Japan                                   |
|![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)          | bitfinex2          | [Bitfinex v2](https://www.bitfinex.com)                                      | 2   | [API](https://bitfinex.readme.io/v2/docs)                                                    |     |                                                                                                                          | raw         | ob          | British Virgin Islands                  |
|![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)             | bitmex             | [BitMEX](https://www.bitmex.com)                                             | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                |     | [API](https://www.bitmex.com/app/wsAPI)                                                                                  | raw         | ob          | Seychelles                              |
|![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)           | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                         | 2   | [API](https://www.bitstamp.net/api)                                                          |     |                                                                                                                          | pusher      | ob          | UK                                      |
|![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)                | cex                | [CEX.IO](https://cex.io)                                                     | *   | [API](https://cex.io/cex-api)                                                                |     | [API](https://cex.io/websocket-api)                                                                                      | raw         | ob          | UK, EU, Cyprus, Russia                  |
|![coincheck](https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg)          | coincheck          | [coincheck](https://coincheck.com)                                           | *   | [API](https://coincheck.com/documents/exchange/api)                                          |     | [API](https://coincheck.com/documents/exchange/api#websocket)                                                            | raw         | ob          | Japan, Indonesia                        |
|![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)      | coinbaseprime      | [Coinbase Prime](https://prime.coinbase.com)                                 | *   | [API](https://docs.prime.coinbase.com)                                                       |     |                                                                                                                          | raw         | ob          | US                                      |
|![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)        | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                    | *   | [API](https://docs.pro.coinbase.com/)                                                        |     |                                                                                                                          | raw         | ob          | US                                      |
|![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)             | gateio             | [Gate.io](https://gate.io/)                                                  | 2   | [API](https://gate.io/api2)                                                                  |     | [API](https://gate.io/docs/websocket/index.html)                                                                         | raw         | ob          | China                                   |
|![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)             | gemini             | [Gemini](https://gemini.com)                                                 | 1   | [API](https://docs.gemini.com/rest-api)                                                      |     |                                                                                                                          | raw         | ob          | US                                      |
|![hadax](https://user-images.githubusercontent.com/1294454/38059952-4756c49e-32f1-11e8-90b9-45c1eccba9cd.jpg)              | hadax              | [HADAX](https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3)     | 1   | [API](https://github.com/huobiapi/API_Docs/wiki)                                             |     |                                                                                                                          | raw         | ob          | China                                   |
|![hitbtc2](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)            | hitbtc2            | [HitBTC v2](https://hitbtc.com/?ref_id=5a5d39a65d466)                        | 2   | [API](https://api.hitbtc.com)                                                                |     | [API](https://api.hitbtc.com/#socket-api-reference)                                                                      | raw         | ob          | Hong Kong                               |
|![huobipro](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)           | huobipro           | [Huobi Pro](https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3) | 1   | [API](https://github.com/huobiapi/API_Docs/wiki/REST_api_reference)                          |     | [API](https://github.com/huobiapi/API_Docs_en/wiki/WS_General)                                                           | raw         | ob          | China                                   |
|![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)              | lbank              | [LBank](https://www.lbank.info)                                              | 1   | [API](https://www.lbank.info/api/api-overview)                                               |     |                                                                                                                          | raw         | ob          | China                                   |
|![liquid](https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg)             | liquid             | [Liquid](https://www.liquid.com)                                             | 2   | [API](https://developers.quoine.com)                                                         |     |                                                                                                                          | pusher      | ob          | Japan, China, Taiwan                    |
|![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)               | okex               | [OKEX](https://www.okex.com)                                                 | 1   | [API](https://github.com/okcoin-okex/API-docs-OKEx.com)                                      |     | [API](https://github.com/okcoin-okex/API-docs-OKEx.com/blob/master/API-For-Futures-EN/WebSocket%20API%20for%20FUTURES.md)| raw         | ob          | China, US                               |
|![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)           | poloniex           | [Poloniex](https://poloniex.com)                                             | *   | [API](https://poloniex.com/support/api/)                                                     |     |                                                                                                                          | raw         | ob          | US                                      |
|![theocean](https://user-images.githubusercontent.com/1294454/43103756-d56613ce-8ed7-11e8-924e-68f9d4bcacab.jpg)           | theocean           | [The Ocean](https://theocean.trade)                                          | 0   | [API](https://docs.theocean.trade)                                                           |     |                                                                                                                          | socketio    | ob          | US                                      |
|![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)            | therock            | [TheRockTrading](https://therocktrading.com)                                 | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                      |     |                                                                                                                          | pusher      | ob          | Malta                                   |
|![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)                 | zb                 | [ZB](https://www.zb.com)                                                     | 1   | [API](https://www.zb.com/i/developer)                                                        |     | [API](https://www.zb.com/i/developer/websocketApi)                                                                       | raw         | ob          | China                                   |

**Ws protocol**
- raw: supported in this ccxt branch
- pusher: testing

**Ws Features:**
- ob: orderbook
- ti: tickers
- tr: trades
- oh: ohlcv
## websocket connection types
Only two types of websocket connections are supported: 
- Connections that expects you send a subscribing command to receive data updates,
- connections that receive updates just after connected.
## definition
```javascript
...
'wsconf': {
    'conx-tpls': {
        'default': {
            'type': 'ws',
            'baseurl': 'wss://api.zb.com:9999/websocket',
        },
    },
    'methodmap': {
        '_asyncTimeoutRemoveNonce': '_asyncTimeoutRemoveNonce',
    },
    'events': {
        'ob': {
            'conx-tpl': 'default',
            'conx-param': {
                'url': '{baseurl}',
                'id': '{id}',
            },
        },
    },
},
...
```
- conx-tpls: dictionary with exchange websocket connections. Most exchanges only have one connection. You can use any id for this connection, but 'default' is used for now. For each connection you mus define:
  - type: 'ws'|'ws-s' for connections that expect a subscribing command or connections with updates after connected, respectively.
  - baseurl: the baseurl for exchange websocket.
- methodmap: this is a hack to convert a method from 'camel' format to 'snake' format, used in php & python transpiled code. Is is usefull when you need to invoke a class method with a string.
- events: dictionary with events or update types received from exchange:
  - 'ob' for orderbook updates,
  - 'ticker' for ticker,
  - 'trade' for trades,
  - ...
  
For each event you must define the connection that provide it:
- conx-tpl: id of the websocket connection defined in 'conx-tpls'.
- conx-param: additional config for websocket:
  - url: url to connecto to
  - id: internl id for the connection

In each generator you can use variables between braces {}:
- {baseurl}: replace with baseurl value in 'conx-tpls' definitions,
- {id}: replace with key id in 'conx-tpls' dictionary.

## Websocket entry points
You must define some exchange methods in .js file:
- **_websocketSubscribe(contextId, event, symbol, nonce, params)**: required, called from Exchange.js when user invoke an event subscription. *contextId* is the websocket internal id used to access context data. *event* must be 'ob'|'ticket'|'trade'|'ohlcv', *symbol* is the symbol, and *nonce* and internal and unique id . If this exchange does not support this event you must throw a NotSupported exception. If exchange websocket type is 'ws', you must send the subscription command for this exchange and save the *nonce* id and use it when you receive a subscription response from exchange. *params* recives a dictionary with optional params for each exchange subscription. If the subscription succeeds then you must invoke emit method with *nonce* parameter: `this.emit(nonce, true)`. If the subscription fails you must invoke emit method with the error (optional): `this.emit(nonce, false, new ExchangeException('...'))`.
- **_websocketUnsubscribe(contextId event, symbol, nonce, params)**: required, same as bellow but for unsubscription process. 
- **_websocketOnMessage(contextId, data)**: required, this method is called when a message is received from websocket. *data* is the raw data received and *contextId* is the websocket internal id that receives the message used for access context data.
- **_websocketOnClose(contextId)**: optional, this is called when websocket is closed. *contextId* is the websocket internal id.
- **_websocketOnError(contetId, error)**: opetional, and it is called when an error takes place in the websocket connection.
- **_websocketOnOpen(conextId, websocketConexConfig)**: optional, this is called from Exchange.js when websocket is opened and connected. *contextId* is the opened websocket internal id and *websocketConexConfig* the initialization config of this websocket. You can use this method in 'ws-s' websockets to set 'subscribed' status:
```javascript
...
for (let symbol in streams) {
    this._contextSetSubscribed ('ob', symbol, true);
    this._contextSetSubscribing('ob', symbol, false);
}
...
```

## subscribing to ws type
Cex orderbook subscription command.
```javascript
    let [currencyBase, currencyQuote] = symbol.split ('/');
    this.asyncSendJson ({
        'e': 'order-book-subscribe',
        'data': {
            'pair': [currencyBase, currencyQuote],
            'subscribe': true,
            'depth': 0,
        },
        'oid': nonce,
    });

```
## context functions
Methods to access context data for each websocket:

- **_contextSetSubscribed (conxid, event, symbol, subscribed)**: returns subscribed status for event/symbol
- **_contextIsSubscribed (conxid, event, symbol)**: set subscribed status for event/symbol
- **_contextSetSubscribing (conxid, event, symbol, subscribing)**: returns subscribing status for event/symbol
- **_contextIsSubscribing (conxid, event, symbol)**: set subscribing status for event/symbol
- **_contextGetSymbolData(conxid, event, symbol)**: get symbol user defined dictionary
- **_contextSetSymbolData(conxid, event, symbol, data)**: set symbol user defined dictionary
- **_contextSet (conxid, key, data)**: set data to user defined dictionary (to store any user defined data)
- **_contextGet (conxid, key)**: get from user defined dictionary
- **_contextGetEvents(conxid)**: get events dictionary ('ob', 'tickers', ...)
- **_contextGetSymbols(conxid, event)**: get symbols from event 
- **_contextResetEvent(conxid, event)**: reset event dictionary
- **_contextResetSymbol(conxid, event, symbol)**: reset symbol dictionary (`{'subscribed': false, 'subscribing': false, 'data':{}}`)

## Initial skel to add websocket support on exchange
```javascript
...
,
            'wsconf': {
                'conx-tpls': {
                    'default': {
                        'type': 'ws',
                        'baseurl': 'wss://real.okex.com:10441/websocket',
                    },
                },
                'methodmap': {
                },
                'events': {
                    'ob': {
                        'conx-tpl': 'default',
                        'conx-param': {
                            'url': '{baseurl}',
                            'id': '{id}',
                        },
                    },
                },
            }
...
    _websocketOnMsg (contextId, data) {
        let msg = JSON.parse (data);
        console.log(msg);
    }
    _websocketSubscribe (contextId, event, symbol, nonce, params = {}) {
        if (event !== 'ob') {
            throw new NotSupported ('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        let data = this._contextGetSymbolData (contextId, 'ob', symbol);
        data['limit'] = this.safeInteger (params, 'limit', undefined);
        this._contextSetSymbolData (contextId, 'ob', symbol, data);
        this.websocketSendJson ({
          event: 'addChannel',
          channel: 'ok_sub_spot_' + pairId + '_depth',
        });
    }
    _websocketunSubscribe (contextId, event, symbol, nonce, params = {}) {
        if (event !== 'ob') {
            throw new NotSupported ('subscribe ' + event + '(' + symbol + ') not supported for exchange ' + this.id);
        }
        this.websocketSendJson ({
          event: 'removeChannel',
          channel: 'ok_sub_spot_' + pairId + '_depth',
        });
    }
```
## Added dependencies from ccxt/ccxt master
* node: pako, ws
* php: ratchet/pawl, clue/block-react
* python: autobahn, pyee



