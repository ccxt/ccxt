# Websockets
```diff
- This file is a work in progress, guidelines are being developed right now!
```
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
